import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { tenantMiddleware, requireRole } from "../middleware/tenantMiddleware";
import { supabase } from "../supabase";
import { sendEmail } from "../email";

const router = Router();

// Apply tenant middleware to campaign routes
router.use(tenantMiddleware);

/**
 * Email Queue Interface
 * Manages queued emails for batch processing
 */
interface EmailQueueItem {
  id: string;
  campaignId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  status: "pending" | "sent" | "failed";
  attemptCount: number;
  lastAttemptAt?: string;
  createdAt: string;
  sentAt?: string;
  error?: string;
}

// In-memory email queue (in production, use Redis or database)
const emailQueue: Map<string, EmailQueueItem> = new Map();
const campaignStats: Map<string, { sent: number; failed: number; pending: number }> = new Map();

/**
 * Email Campaign Interface
 */
interface EmailCampaign {
  id: string;
  accountId: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  fromEmail: string;
  fromName: string;
  recipients: Array<{
    email: string;
    name: string;
    variables?: Record<string, string>;
  }>;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused";
  sendAt?: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
}

// In-memory campaign storage (in production, use database)
const campaigns: Map<string, EmailCampaign> = new Map();

/**
 * POST /api/campaigns/email
 * Create a new email campaign
 */
router.post("/email", requireRole(["admin", "marketing"]), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { name, subject, htmlBody, textBody, fromEmail, fromName, recipients, sendAt } = req.body;

    // Validation
    if (!name || !subject || !htmlBody || !fromEmail || !recipients || recipients.length === 0) {
      return res.status(400).json({
        error: "Missing required fields: name, subject, htmlBody, fromEmail, recipients",
      });
    }

    const campaignId = uuidv4();
    const now = new Date().toISOString();

    const campaign: EmailCampaign = {
      id: campaignId,
      accountId,
      name,
      subject,
      htmlBody,
      textBody,
      fromEmail,
      fromName: fromName || "Voxmation",
      recipients,
      status: sendAt ? "scheduled" : "draft",
      sendAt,
      createdAt: now,
      updatedAt: now,
      stats: {
        total: recipients.length,
        sent: 0,
        failed: 0,
        pending: recipients.length,
      },
    };

    campaigns.set(campaignId, campaign);
    campaignStats.set(campaignId, {
      sent: 0,
      failed: 0,
      pending: recipients.length,
    });

    // Try to save to Supabase if database is available
    try {
      const { error } = await supabase.from("email_campaigns").insert([
        {
          id: campaignId,
          account_id: accountId,
          name,
          subject,
          html_body: htmlBody,
          text_body: textBody,
          from_email: fromEmail,
          from_name: fromName || "Voxmation",
          recipients: JSON.stringify(recipients),
          status: campaign.status,
          send_at: sendAt,
          created_at: now,
          updated_at: now,
        },
      ]);

      if (error) {
        console.warn("Failed to save campaign to database:", error);
        // Continue without database persistence for demo
      }
    } catch (dbError) {
      console.warn("Database error (continuing with in-memory storage):", dbError);
    }

    res.status(201).json({
      success: true,
      campaignId,
      campaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: `Failed to create campaign: ${msg}` });
  }
});

/**
 * GET /api/campaigns/email
 * Get all campaigns for the account
 */
router.get("/email", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { status, limit = 50, offset = 0 } = req.query;

    // Filter campaigns by account
    let accountCampaigns = Array.from(campaigns.values()).filter((c) => c.accountId === accountId);

    if (status) {
      accountCampaigns = accountCampaigns.filter((c) => c.status === status);
    }

    // Sort by creation date (newest first)
    accountCampaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const paginatedCampaigns = accountCampaigns.slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));

    res.json({
      data: paginatedCampaigns,
      total: accountCampaigns.length,
      offset: parseInt(offset as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

/**
 * GET /api/campaigns/email/:id
 * Get a specific campaign
 */
router.get("/email/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const accountId = req.accountId!;

    const campaign = campaigns.get(id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.accountId !== accountId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({ campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});

/**
 * PUT /api/campaigns/email/:id
 * Update a campaign (draft only)
 */
router.put("/email/:id", requireRole(["admin", "marketing"]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const accountId = req.accountId!;
    const { name, subject, htmlBody, textBody, fromEmail, fromName, recipients } = req.body;

    const campaign = campaigns.get(id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.accountId !== accountId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (campaign.status !== "draft") {
      return res.status(400).json({ error: "Only draft campaigns can be edited" });
    }

    // Update campaign
    if (name) campaign.name = name;
    if (subject) campaign.subject = subject;
    if (htmlBody) campaign.htmlBody = htmlBody;
    if (textBody) campaign.textBody = textBody;
    if (fromEmail) campaign.fromEmail = fromEmail;
    if (fromName) campaign.fromName = fromName;
    if (recipients) {
      campaign.recipients = recipients;
      campaign.stats.total = recipients.length;
      campaign.stats.pending = recipients.length;
      campaignStats.set(id, {
        sent: 0,
        failed: 0,
        pending: recipients.length,
      });
    }

    campaign.updatedAt = new Date().toISOString();
    campaigns.set(id, campaign);

    res.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ error: "Failed to update campaign" });
  }
});

/**
 * Helper function to add emails to queue
 */
function enqueueEmails(campaignId: string, recipients: EmailCampaign["recipients"], subject: string, htmlBody: string, textBody?: string) {
  recipients.forEach((recipient) => {
    const queueId = uuidv4();
    const queueItem: EmailQueueItem = {
      id: queueId,
      campaignId,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      subject,
      htmlBody,
      textBody,
      status: "pending",
      attemptCount: 0,
      createdAt: new Date().toISOString(),
    };

    emailQueue.set(queueId, queueItem);
  });
}

/**
 * POST /api/campaigns/email/:id/send
 * Send campaign (moves emails to queue)
 */
router.post("/email/:id/send", requireRole(["admin", "marketing"]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const accountId = req.accountId!;
    const { immediate = true } = req.body;

    const campaign = campaigns.get(id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.accountId !== accountId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (campaign.status !== "draft" && campaign.status !== "paused") {
      return res.status(400).json({ error: "Campaign cannot be sent from its current status" });
    }

    // Add emails to queue
    enqueueEmails(id, campaign.recipients, campaign.subject, campaign.htmlBody, campaign.textBody);

    // Update campaign status
    campaign.status = immediate ? "sending" : "scheduled";
    campaign.updatedAt = new Date().toISOString();
    campaigns.set(id, campaign);

    // Process queue if immediate
    if (immediate) {
      processEmailQueue(id);
    }

    res.json({
      success: true,
      message: immediate ? "Campaign sent" : "Campaign scheduled",
      campaign,
      queuedEmails: campaign.recipients.length,
    });
  } catch (error) {
    console.error("Error sending campaign:", error);
    res.status(500).json({ error: "Failed to send campaign" });
  }
});

/**
 * Helper function to process email queue
 */
async function processEmailQueue(campaignId: string) {
  const campaign = campaigns.get(campaignId);
  if (!campaign) return;

  const queueItems = Array.from(emailQueue.values()).filter((item) => item.campaignId === campaignId && item.status === "pending");

  for (const item of queueItems) {
    try {
      // Replace variables in subject and body
      let personalizedSubject = item.subject;
      let personalizedHtml = item.htmlBody;
      let personalizedText = item.textBody;

      const recipient = campaign.recipients.find((r) => r.email === item.recipientEmail);
      if (recipient?.variables) {
        Object.entries(recipient.variables).forEach(([key, value]) => {
          const placeholder = `{{${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}}}`;
          personalizedSubject = personalizedSubject.replace(new RegExp(placeholder, "g"), String(value));
          personalizedHtml = personalizedHtml.replace(new RegExp(placeholder, "g"), String(value));
          if (personalizedText) {
            personalizedText = personalizedText.replace(new RegExp(placeholder, "g"), String(value));
          }
        });
      }

      const sent = await sendEmail({
        to: item.recipientEmail,
        subject: personalizedSubject,
        html: personalizedHtml,
        text: personalizedText,
      });

      if (sent) {
        item.status = "sent";
        item.sentAt = new Date().toISOString();
        campaign.stats.sent++;
        campaign.stats.pending--;
      } else {
        item.status = "failed";
        item.attemptCount++;
        campaign.stats.failed++;
        campaign.stats.pending--;
      }

      item.lastAttemptAt = new Date().toISOString();
      emailQueue.set(item.id, item);
    } catch (error) {
      console.error(`Failed to send email to ${item.recipientEmail}:`, error);
      item.status = "failed";
      item.error = error instanceof Error ? error.message : "Unknown error";
      item.attemptCount++;
      item.lastAttemptAt = new Date().toISOString();
      campaign.stats.failed++;
      campaign.stats.pending--;
      emailQueue.set(item.id, item);
    }
  }

  // Update campaign status
  if (campaign.stats.pending === 0) {
    campaign.status = "sent";
  }
  campaign.updatedAt = new Date().toISOString();
  campaigns.set(campaignId, campaign);
}

/**
 * GET /api/campaigns/email/:id/stats
 * Get campaign statistics
 */
router.get("/email/:id/stats", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const accountId = req.accountId!;

    const campaign = campaigns.get(id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.accountId !== accountId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const queueItems = Array.from(emailQueue.values()).filter((item) => item.campaignId === id);

    const stats = {
      campaignId: id,
      campaignName: campaign.name,
      status: campaign.status,
      stats: campaign.stats,
      detailedStats: {
        sent: queueItems.filter((item) => item.status === "sent").length,
        failed: queueItems.filter((item) => item.status === "failed").length,
        pending: queueItems.filter((item) => item.status === "pending").length,
      },
      recentQueued: queueItems.slice(-10).map((item) => ({
        id: item.id,
        email: item.recipientEmail,
        status: item.status,
        sentAt: item.sentAt,
        error: item.error,
      })),
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };

    res.json({ stats });
  } catch (error) {
    console.error("Error fetching campaign stats:", error);
    res.status(500).json({ error: "Failed to fetch campaign stats" });
  }
});

/**
 * POST /api/campaigns/email/:id/pause
 * Pause a sending campaign
 */
router.post("/email/:id/pause", requireRole(["admin", "marketing"]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const accountId = req.accountId!;

    const campaign = campaigns.get(id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.accountId !== accountId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (campaign.status !== "sending") {
      return res.status(400).json({ error: "Only sending campaigns can be paused" });
    }

    campaign.status = "paused";
    campaign.updatedAt = new Date().toISOString();
    campaigns.set(id, campaign);

    res.json({
      success: true,
      message: "Campaign paused",
      campaign,
    });
  } catch (error) {
    console.error("Error pausing campaign:", error);
    res.status(500).json({ error: "Failed to pause campaign" });
  }
});

/**
 * DELETE /api/campaigns/email/:id
 * Delete a campaign (draft or paused only)
 */
router.delete("/email/:id", requireRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const accountId = req.accountId!;

    const campaign = campaigns.get(id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.accountId !== accountId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (campaign.status !== "draft" && campaign.status !== "paused") {
      return res.status(400).json({ error: "Cannot delete campaign with status: " + campaign.status });
    }

    // Delete campaign and associated queue items
    campaigns.delete(id);
    campaignStats.delete(id);

    Array.from(emailQueue.values())
      .filter((item) => item.campaignId === id)
      .forEach((item) => {
        emailQueue.delete(item.id);
      });

    res.json({
      success: true,
      message: "Campaign deleted",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});

/**
 * GET /api/campaigns/email/queue/status
 * Get email queue status (admin only)
 */
router.get("/queue/status", requireRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const queueItems = Array.from(emailQueue.values());

    const status = {
      totalQueued: queueItems.length,
      totalSent: queueItems.filter((item) => item.status === "sent").length,
      totalFailed: queueItems.filter((item) => item.status === "failed").length,
      totalPending: queueItems.filter((item) => item.status === "pending").length,
      campaigns: Array.from(campaigns.values()).map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        stats: campaign.stats,
      })),
    };

    res.json({ status });
  } catch (error) {
    console.error("Error fetching queue status:", error);
    res.status(500).json({ error: "Failed to fetch queue status" });
  }
});

export default router;
