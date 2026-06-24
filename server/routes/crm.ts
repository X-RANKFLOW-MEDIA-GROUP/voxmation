import { Router, Request, Response } from "express";
import { tenantMiddleware, requireRole, withTenant } from "../middleware/tenantMiddleware";
import { supabase } from "../supabase";

const router = Router();

// Apply tenant middleware to all CRM routes
router.use(tenantMiddleware);

// ============================================
// CONTACTS ENDPOINTS
// ============================================

// GET /api/crm/contacts - List contacts with filters
router.get("/contacts", async (req: Request, res: Response) => {
  try {
    const { search, source, tag, page = 1, limit = 20 } = req.query;
    const accountId = req.accountId!;

    let query = supabase
      .from("contacts")
      .select("*", { count: "exact" })
      .eq("account_id", accountId);

    // Apply filters
    if (search && typeof search === "string") {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    if (source && typeof source === "string") {
      query = query.eq("source", source);
    }

    if (tag && typeof tag === "string") {
      query = query.contains("tags", [tag]);
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
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// POST /api/crm/contacts - Create contact
router.post("/contacts", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { name, email, phone, company, source, tags } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const { data, error } = await supabase
      .from("contacts")
      .insert({
        account_id: accountId,
        name,
        email,
        phone,
        company,
        source: source || "web",
        tags: tags || [],
        lead_score: 0,
        contact_type: "lead",
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

// GET /api/crm/contacts/:id - Get single contact
router.get("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", id)
      .eq("account_id", accountId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
});

// PUT /api/crm/contacts/:id - Update contact
router.put("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;
    const { name, email, phone, company, tags, lead_score } = req.body;

    const { data, error } = await supabase
      .from("contacts")
      .update({
        name,
        email,
        phone,
        company,
        tags,
        lead_score,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("account_id", accountId)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

// DELETE /api/crm/contacts/:id - Delete contact (soft delete)
router.delete("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;

    const { error } = await supabase
      .from("contacts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("account_id", accountId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// GET /api/crm/contacts/:id/interactions - Get contact interactions
router.get("/contacts/:id/interactions", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;

    const { data, error } = await supabase
      .from("interactions")
      .select("*")
      .eq("contact_id", id)
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ data: data || [] });
  } catch (error) {
    console.error("Error fetching interactions:", error);
    res.status(500).json({ error: "Failed to fetch interactions" });
  }
});

// ============================================
// OPPORTUNITIES ENDPOINTS
// ============================================

// GET /api/crm/opportunities - List opportunities
router.get("/opportunities", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { stage, contact_id, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from("opportunities")
      .select("*", { count: "exact" })
      .eq("account_id", accountId);

    if (stage && typeof stage === "string") {
      query = query.eq("stage", stage);
    }

    if (contact_id && typeof contact_id === "string") {
      query = query.eq("contact_id", contact_id);
    }

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
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

// POST /api/crm/opportunities - Create opportunity
router.post("/opportunities", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { contact_id, title, value, stage, expected_close_date } = req.body;

    if (!contact_id || !title) {
      return res
        .status(400)
        .json({ error: "Contact ID and title are required" });
    }

    const { data, error } = await supabase
      .from("opportunities")
      .insert({
        account_id: accountId,
        contact_id,
        title,
        value: value || 0,
        stage: stage || "awareness",
        expected_close_date,
        status: "open",
        probability: 50,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating opportunity:", error);
    res.status(500).json({ error: "Failed to create opportunity" });
  }
});

// PATCH /api/crm/opportunities/:id/stage - Move opportunity to different stage
router.patch(
  "/opportunities/:id/stage",
  async (req: Request, res: Response) => {
    try {
      const accountId = req.accountId!;
      const { id } = req.params;
      const { stage } = req.body;

      if (!stage) {
        return res.status(400).json({ error: "Stage is required" });
      }

      const { data, error } = await supabase
        .from("opportunities")
        .update({
          stage,
          moved_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("account_id", accountId)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({ error: "Opportunity not found" });
      }

      res.json(data);
    } catch (error) {
      console.error("Error updating opportunity stage:", error);
      res.status(500).json({ error: "Failed to update opportunity" });
    }
  }
);

export default router;
