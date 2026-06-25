import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { tenantMiddleware, requireRole } from "../middleware/tenantMiddleware";
import { supabase } from "../supabase";
import { sendEmail } from "../email";

const router = Router();

// Apply tenant middleware to automation routes
router.use(tenantMiddleware);

// ============================================
// TYPE DEFINITIONS
// ============================================

interface AutomationTrigger {
  type: "contact_tag" | "contact_property" | "contact_created" | "contact_updated" | "time_based" | "event_based";
  conditions: Record<string, any>;
}

interface AutomationStep {
  id: string;
  type: "send_email" | "send_sms" | "create_opportunity" | "update_tag" | "delay" | "condition";
  action: {
    emailTemplate?: string;
    smsMessage?: string;
    opportunityType?: string;
    tag?: string;
    delayMinutes?: number;
    condition?: Record<string, any>;
  };
  order: number;
}

interface Automation {
  id: string;
  account_id: string;
  name: string;
  description?: string;
  type: "drip" | "trigger" | "welcome" | "abandoned_cart" | "re_engagement" | "custom";
  trigger_type: string;
  trigger_conditions: Record<string, any>;
  workflow: AutomationStep[];
  status: "draft" | "active" | "paused" | "completed" | "archived";
  is_recurring: boolean;
  max_contacts_per_day?: number;
  total_contacts: number;
  total_completed: number;
  total_failed: number;
  last_triggered_at?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// TRIGGER EXECUTOR SERVICE
// ============================================

class TriggerExecutor {
  /**
   * Execute a single automation step for a contact
   */
  static async executeStep(
    accountId: string,
    contactId: string,
    contact: any,
    step: AutomationStep
  ): Promise<{ success: boolean; error?: string }> {
    try {
      switch (step.type) {
        case "send_email":
          return await this.executeSendEmail(accountId, contactId, contact, step);

        case "send_sms":
          return await this.executeSendSMS(accountId, contactId, contact, step);

        case "create_opportunity":
          return await this.executeCreateOpportunity(accountId, contactId, contact, step);

        case "update_tag":
          return await this.executeUpdateTag(accountId, contactId, contact, step);

        case "delay":
          return await this.executeDelay(step);

        case "condition":
          return await this.executeCondition(contact, step);

        default:
          return { success: false, error: `Unknown step type: ${step.type}` };
      }
    } catch (error) {
      console.error(`Error executing step ${step.id}:`, error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send email action
   */
  private static async executeSendEmail(
    accountId: string,
    contactId: string,
    contact: any,
    step: AutomationStep
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { emailTemplate } = step.action;

      if (!emailTemplate) {
        return { success: false, error: "Email template not specified" };
      }

      // Fetch the email template
      const { data: template, error: templateError } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", emailTemplate)
        .eq("account_id", accountId)
        .single();

      if (templateError || !template) {
        return { success: false, error: "Email template not found" };
      }

      // Prepare personalized email
      let subject = template.subject;
      let body = template.body;

      // Simple variable replacement (first_name, email, etc.)
      const variables = {
        first_name: contact.name?.split(" ")[0] || contact.name || "",
        full_name: contact.name || "",
        email: contact.email || "",
        company: contact.company || "",
        phone: contact.phone || "",
      };

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        subject = subject.replace(regex, String(value));
        body = body.replace(regex, String(value));
      });

      // Send email
      await sendEmail({
        to: contact.email,
        subject,
        htmlBody: body,
      });

      // Log email send
      await supabase.from("email_logs").insert({
        account_id: accountId,
        contact_id: contactId,
        recipient_email: contact.email,
        recipient_name: contact.name,
        subject: subject,
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send SMS action
   */
  private static async executeSendSMS(
    accountId: string,
    contactId: string,
    contact: any,
    step: AutomationStep
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { smsMessage } = step.action;

      if (!smsMessage || !contact.phone) {
        return { success: false, error: "SMS message or contact phone not specified" };
      }

      // Prepare personalized SMS
      let message = smsMessage;

      const variables = {
        first_name: contact.name?.split(" ")[0] || contact.name || "",
        full_name: contact.name || "",
      };

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        message = message.replace(regex, String(value));
      });

      // TODO: Implement SMS provider integration (Twilio, AWS SNS, etc.)
      // For now, we'll just log the intention
      console.log(`SMS would be sent to ${contact.phone}: ${message}`);

      // Log SMS send
      await supabase.from("sms_logs").insert({
        account_id: accountId,
        contact_id: contactId,
        recipient_phone: contact.phone,
        message,
        status: "pending",
      });

      return { success: true };
    } catch (error) {
      console.error("Error sending SMS:", error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Create opportunity action
   */
  private static async executeCreateOpportunity(
    accountId: string,
    contactId: string,
    contact: any,
    step: AutomationStep
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { opportunityType } = step.action;

      if (!opportunityType) {
        return { success: false, error: "Opportunity type not specified" };
      }

      // Create opportunity in CRM
      const { data: opportunity, error } = await supabase
        .from("opportunities")
        .insert({
          account_id: accountId,
          contact_id: contactId,
          title: `${opportunityType} - ${contact.name}`,
          type: opportunityType,
          status: "open",
          value: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: `Failed to create opportunity: ${error.message}` };
      }

      return { success: true };
    } catch (error) {
      console.error("Error creating opportunity:", error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Update tag action
   */
  private static async executeUpdateTag(
    accountId: string,
    contactId: string,
    contact: any,
    step: AutomationStep
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { tag } = step.action;

      if (!tag) {
        return { success: false, error: "Tag not specified" };
      }

      // Update contact tags
      const currentTags = contact.tags || [];
      const updatedTags = Array.from(new Set([...currentTags, tag]));

      const { error } = await supabase
        .from("contacts")
        .update({ tags: updatedTags })
        .eq("id", contactId)
        .eq("account_id", accountId);

      if (error) {
        return { success: false, error: `Failed to update tags: ${error.message}` };
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating tag:", error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Delay action (waits before continuing)
   */
  private static async executeDelay(step: AutomationStep): Promise<{ success: boolean; error?: string }> {
    try {
      const { delayMinutes = 0 } = step.action;

      if (delayMinutes > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMinutes * 60 * 1000));
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Conditional branching
   */
  private static async executeCondition(
    contact: any,
    step: AutomationStep
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { condition } = step.action;

      if (!condition) {
        return { success: false, error: "Condition not specified" };
      }

      // Simple condition evaluation (field, operator, value)
      const { field, operator, value } = condition;
      const contactValue = contact[field];

      let result = false;
      switch (operator) {
        case "equals":
          result = contactValue === value;
          break;
        case "contains":
          result = String(contactValue).includes(String(value));
          break;
        case "greater_than":
          result = Number(contactValue) > Number(value);
          break;
        case "less_than":
          result = Number(contactValue) < Number(value);
          break;
        default:
          return { success: false, error: `Unknown operator: ${operator}` };
      }

      return { success: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Execute full automation for a contact
   */
  static async executeAutomation(
    accountId: string,
    automationId: string,
    contactId: string
  ): Promise<{ success: boolean; executionId?: string; error?: string }> {
    try {
      // Fetch automation
      const { data: automation, error: autoError } = await supabase
        .from("automations")
        .select("*")
        .eq("id", automationId)
        .eq("account_id", accountId)
        .single();

      if (autoError || !automation) {
        return { success: false, error: "Automation not found" };
      }

      if (automation.status !== "active") {
        return { success: false, error: "Automation is not active" };
      }

      // Fetch contact
      const { data: contact, error: contactError } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", contactId)
        .eq("account_id", accountId)
        .single();

      if (contactError || !contact) {
        return { success: false, error: "Contact not found" };
      }

      // Create execution record
      const executionId = uuidv4();
      await supabase.from("automation_executions").insert({
        id: executionId,
        account_id: accountId,
        automation_id: automationId,
        contact_id: contactId,
        status: "in_progress",
        triggered_at: new Date().toISOString(),
        workflow_data: {},
      });

      // Execute each step in the workflow
      const workflow = automation.workflow || [];
      const sortedSteps = workflow.sort((a: any, b: any) => a.order - b.order);

      for (const step of sortedSteps) {
        const stepResult = await this.executeStep(accountId, contactId, contact, step);

        if (!stepResult.success) {
          console.warn(`Step ${step.id} failed:`, stepResult.error);
          // Continue with next step even if one fails
        }
      }

      // Update execution record as completed
      await supabase
        .from("automation_executions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", executionId);

      // Update automation stats
      await supabase
        .from("automations")
        .update({
          total_contacts: automation.total_contacts + 1,
          total_completed: automation.total_completed + 1,
          last_triggered_at: new Date().toISOString(),
        })
        .eq("id", automationId);

      return { success: true, executionId };
    } catch (error) {
      console.error("Error executing automation:", error);
      return { success: false, error: String(error) };
    }
  }
}

// ============================================
// ROUTES
// ============================================

/**
 * GET /api/automations
 * List all automations for the account
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { status, type, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from("automations")
      .select("*", { count: "exact" })
      .eq("account_id", accountId);

    // Apply filters
    if (status && typeof status === "string") {
      query = query.eq("status", status);
    }

    if (type && typeof type === "string") {
      query = query.eq("type", type);
    }

    // Pagination
    const offset = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string);
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      data: data || [],
      total: count || 0,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string),
    });
  } catch (error) {
    console.error("Error fetching automations:", error);
    res.status(500).json({ error: "Failed to fetch automations" });
  }
});

/**
 * POST /api/automations
 * Create a new automation
 */
router.post("/", requireRole(["admin", "marketing"]), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const {
      name,
      description,
      type,
      trigger_type,
      trigger_conditions,
      workflow,
      is_recurring,
      max_contacts_per_day,
      tags,
    } = req.body;

    // Validation
    if (!name || !type || !trigger_type || !trigger_conditions || !workflow) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["name", "type", "trigger_type", "trigger_conditions", "workflow"],
      });
    }

    // Validate workflow structure
    if (!Array.isArray(workflow) || workflow.length === 0) {
      return res.status(400).json({
        error: "Workflow must be a non-empty array of steps",
      });
    }

    const automationId = uuidv4();

    const { data, error } = await supabase
      .from("automations")
      .insert({
        id: automationId,
        account_id: accountId,
        created_by: req.user?.id,
        name,
        description,
        type,
        trigger_type,
        trigger_conditions,
        workflow,
        status: "draft",
        is_recurring: is_recurring || false,
        max_contacts_per_day,
        tags: tags || [],
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ id: automationId, ...data });
  } catch (error) {
    console.error("Error creating automation:", error);
    res.status(500).json({ error: "Failed to create automation" });
  }
});

/**
 * GET /api/automations/:id
 * Get automation details
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;

    const { data, error } = await supabase
      .from("automations")
      .select("*")
      .eq("id", id)
      .eq("account_id", accountId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Automation not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching automation:", error);
    res.status(500).json({ error: "Failed to fetch automation" });
  }
});

/**
 * PATCH /api/automations/:id
 * Update automation
 */
router.patch("/:id", requireRole(["admin", "marketing"]), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;
    const updates = req.body;

    // Prevent direct status changes - use specific endpoints
    if (updates.status) {
      return res.status(400).json({
        error: "Use activation/deactivation endpoints to change status",
      });
    }

    const { data, error } = await supabase
      .from("automations")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("account_id", accountId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "Automation not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error updating automation:", error);
    res.status(500).json({ error: "Failed to update automation" });
  }
});

/**
 * POST /api/automations/:id/activate
 * Activate automation
 */
router.post("/:id/activate", requireRole(["admin", "marketing"]), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;

    const { data, error } = await supabase
      .from("automations")
      .update({ status: "active" })
      .eq("id", id)
      .eq("account_id", accountId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "Automation not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error activating automation:", error);
    res.status(500).json({ error: "Failed to activate automation" });
  }
});

/**
 * POST /api/automations/:id/pause
 * Pause automation
 */
router.post("/:id/pause", requireRole(["admin", "marketing"]), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;

    const { data, error } = await supabase
      .from("automations")
      .update({ status: "paused" })
      .eq("id", id)
      .eq("account_id", accountId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "Automation not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error pausing automation:", error);
    res.status(500).json({ error: "Failed to pause automation" });
  }
});

/**
 * POST /api/automations/:id/test
 * Test automation with a specific contact
 */
router.post("/:id/test", requireRole(["admin", "marketing"]), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: "contactId is required" });
    }

    // Execute automation
    const result = await TriggerExecutor.executeAutomation(accountId, id, contactId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Fetch execution details
    const { data: execution, error: execError } = await supabase
      .from("automation_executions")
      .select("*")
      .eq("id", result.executionId)
      .single();

    if (execError) throw execError;

    res.json({
      success: true,
      message: "Automation test executed successfully",
      execution,
    });
  } catch (error) {
    console.error("Error testing automation:", error);
    res.status(500).json({ error: "Failed to test automation" });
  }
});

/**
 * GET /api/automations/:id/executions
 * Get execution history for an automation
 */
router.get("/:id/executions", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from("automation_executions")
      .select("*", { count: "exact" })
      .eq("account_id", accountId)
      .eq("automation_id", id);

    if (status && typeof status === "string") {
      query = query.eq("status", status);
    }

    // Pagination
    const offset = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string);
    query = query
      .order("triggered_at", { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      data: data || [],
      total: count || 0,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string),
    });
  } catch (error) {
    console.error("Error fetching automation executions:", error);
    res.status(500).json({ error: "Failed to fetch execution history" });
  }
});

/**
 * DELETE /api/automations/:id
 * Delete automation
 */
router.delete("/:id", requireRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;

    const { error } = await supabase
      .from("automations")
      .delete()
      .eq("id", id)
      .eq("account_id", accountId);

    if (error) throw error;

    res.json({ message: "Automation deleted successfully" });
  } catch (error) {
    console.error("Error deleting automation:", error);
    res.status(500).json({ error: "Failed to delete automation" });
  }
});

export default router;
