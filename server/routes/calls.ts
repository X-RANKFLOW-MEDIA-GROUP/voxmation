import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { tenantMiddleware, requireRole } from "../middleware/tenantMiddleware";
import { supabase } from "../supabase";
import {
  makeCall,
  getCallStatus,
  listCalls as getTwilioCalls,
  getCallRecordings,
  getRecording,
  getRecordingUrl,
  handleWebhook as handleTwilioWebhook,
  registerWebhookHandlers,
  CallWebhookEvent,
  RecordingReadyWebhookEvent,
} from "../integrations/twilio";

const router = Router();

// Apply tenant middleware to call routes
router.use(tenantMiddleware);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Call Record stored in database
 */
export interface CallRecord {
  id: string;
  accountId: string;
  twilio_call_sid: string;
  to: string;
  from: string;
  status: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  recordingSid?: string;
  transcriptId?: string;
  transcript?: string;
  campaignId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Call Request DTO
 */
export interface CreateCallRequest {
  to: string;
  from?: string;
  campaignId?: string;
  twimlUrl?: string;
  record?: boolean;
  recordingChannels?: "mono" | "stereo" | "both";
  statusCallback?: string;
  metadata?: Record<string, string>;
}

/**
 * Call Response DTO
 */
export interface CallResponse {
  id: string;
  twilio_call_sid: string;
  to: string;
  from: string;
  status: string;
  campaignId?: string;
  createdAt: string;
}

// In-memory cache for recent calls (in production, use Redis)
const callCache: Map<string, CallRecord> = new Map();

// =============================================================================
// WEBHOOK HANDLERS
// =============================================================================

/**
 * Register webhook handlers for call events
 */
const twilioWebhookHandlers = {
  onCallRinging: async (event: CallWebhookEvent) => {
    try {
      console.log(`[Calls] Call ringing: ${event.callSid} to ${event.to}`);

      // Update call status in database
      const { error } = await supabase
        .from("calls")
        .update({
          status: "ringing",
          updatedAt: new Date().toISOString(),
        })
        .eq("twilio_call_sid", event.callSid);

      if (error) {
        console.error("[Calls] Error updating call status:", error);
      }
    } catch (error) {
      console.error("[Calls] Error in onCallRinging:", error);
    }
  },

  onCallAnswered: async (event: CallWebhookEvent) => {
    try {
      console.log(`[Calls] Call answered: ${event.callSid} from ${event.from}`);

      // Update call status in database
      const { error } = await supabase
        .from("calls")
        .update({
          status: "in-progress",
          startTime: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq("twilio_call_sid", event.callSid);

      if (error) {
        console.error("[Calls] Error updating call status:", error);
      }
    } catch (error) {
      console.error("[Calls] Error in onCallAnswered:", error);
    }
  },

  onCallCompleted: async (event: CallWebhookEvent) => {
    try {
      console.log(
        `[Calls] Call completed: ${event.callSid}, duration: ${event.duration}s`
      );

      // Update call with final status and duration
      const updateData: any = {
        status: "completed",
        duration: event.duration,
        endTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // If recording info is available, store it
      if (event.recordingSid) {
        updateData.recordingSid = event.recordingSid;
      }

      const { error } = await supabase
        .from("calls")
        .update(updateData)
        .eq("twilio_call_sid", event.callSid);

      if (error) {
        console.error("[Calls] Error updating call status:", error);
      }
    } catch (error) {
      console.error("[Calls] Error in onCallCompleted:", error);
    }
  },

  onRecordingReady: async (event: RecordingReadyWebhookEvent) => {
    try {
      console.log(
        `[Calls] Recording ready: ${event.recordingSid} for call ${event.callSid}`
      );

      // Update call with recording information
      const { error } = await supabase
        .from("calls")
        .update({
          recordingSid: event.recordingSid,
          updatedAt: new Date().toISOString(),
        })
        .eq("twilio_call_sid", event.callSid);

      if (error) {
        console.error("[Calls] Error updating recording info:", error);
      }

      // Optionally trigger transcription or other processing
      // This would integrate with speech-to-text services
    } catch (error) {
      console.error("[Calls] Error in onRecordingReady:", error);
    }
  },
};

// Register the handlers
registerWebhookHandlers(twilioWebhookHandlers);

// =============================================================================
// ENDPOINTS
// =============================================================================

/**
 * POST /api/calls/make
 * Initiate a new outbound call
 */
router.post("/make", requireRole(["admin", "agent", "manager"]), async (
  req: Request,
  res: Response
) => {
  try {
    const accountId = req.accountId!;
    const { to, from, campaignId, twimlUrl, record, recordingChannels, metadata } =
      req.body as CreateCallRequest;

    // Validation
    if (!to) {
      return res.status(400).json({
        error: "Missing required field: to",
      });
    }

    // Validate phone number format (basic check)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\D/g, ""))) {
      return res.status(400).json({
        error: "Invalid phone number format",
      });
    }

    const callId = uuidv4();
    const now = new Date().toISOString();

    try {
      // Make the call through Twilio
      const callResult = await makeCall({
        to,
        from,
        url: twimlUrl,
        record: record || false,
        recordingChannels: recordingChannels || "mono",
        statusCallback: `${process.env.API_BASE_URL || "http://localhost:3001"}/api/webhooks/twilio`,
        statusCallbackMethod: "POST",
        statusCallbackEvent: ["ringing", "answered", "completed"],
        recordingStatusCallback: `${process.env.API_BASE_URL || "http://localhost:3001"}/api/webhooks/twilio`,
        recordingStatusCallbackMethod: "POST",
        metadata: {
          ...metadata,
          callId,
          accountId,
          campaignId,
        },
      });

      // Save call record to database
      const callRecord: CallRecord = {
        id: callId,
        accountId,
        twilio_call_sid: callResult.sid,
        to: callResult.to,
        from: callResult.from,
        status: callResult.status,
        campaignId,
        metadata: {
          ...metadata,
        },
        createdAt: now,
        updatedAt: now,
      };

      const { error: dbError } = await supabase.from("calls").insert([
        {
          id: callRecord.id,
          accountId: callRecord.accountId,
          twilio_call_sid: callRecord.twilio_call_sid,
          to: callRecord.to,
          from: callRecord.from,
          status: callRecord.status,
          campaignId: callRecord.campaignId,
          metadata: callRecord.metadata,
          createdAt: callRecord.createdAt,
          updatedAt: callRecord.updatedAt,
        },
      ]);

      if (dbError) {
        console.error("[Calls] Error saving call to database:", dbError);
        // Don't fail the response, the call was already initiated
      }

      // Cache the call
      callCache.set(callId, callRecord);

      const response: CallResponse = {
        id: callId,
        twilio_call_sid: callResult.sid,
        to: callResult.to,
        from: callResult.from,
        status: callResult.status,
        campaignId,
        createdAt: now,
      };

      res.status(201).json(response);
    } catch (twilioError) {
      console.error("[Calls] Twilio error:", twilioError);
      const errorMsg =
        twilioError instanceof Error ? twilioError.message : "Unknown Twilio error";
      res.status(500).json({
        error: "Failed to initiate call",
        details: errorMsg,
      });
    }
  } catch (error) {
    console.error("[Calls] Error in POST /make:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to process request",
      details: errorMsg,
    });
  }
});

/**
 * GET /api/calls
 * List calls for the account with optional filtering
 */
router.get("/", requireRole(["admin", "agent", "manager"]), async (
  req: Request,
  res: Response
) => {
  try {
    const accountId = req.accountId!;
    const { campaignId, status, limit = "50", offset = "0" } = req.query;

    const pageLimit = Math.min(parseInt(limit as string) || 50, 200);
    const pageOffset = parseInt(offset as string) || 0;

    // Build query
    let query = supabase
      .from("calls")
      .select("*", { count: "exact" })
      .eq("accountId", accountId)
      .order("createdAt", { ascending: false })
      .range(pageOffset, pageOffset + pageLimit - 1);

    if (campaignId) {
      query = query.eq("campaignId", campaignId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("[Calls] Error fetching calls:", error);
      return res.status(500).json({
        error: "Failed to fetch calls",
      });
    }

    res.json({
      calls: data || [],
      pagination: {
        total: count || 0,
        limit: pageLimit,
        offset: pageOffset,
      },
    });
  } catch (error) {
    console.error("[Calls] Error in GET /:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to process request",
      details: errorMsg,
    });
  }
});

/**
 * GET /api/calls/:id
 * Get detailed information about a specific call
 */
router.get("/:id", requireRole(["admin", "agent", "manager"]), async (
  req: Request,
  res: Response
) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;

    // Check cache first
    let callRecord = callCache.get(id);

    if (!callRecord) {
      // Fetch from database
      const { data, error } = await supabase
        .from("calls")
        .select("*")
        .eq("id", id)
        .eq("accountId", accountId)
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: "Call not found",
        });
      }

      callRecord = data;
    }

    // Get live status from Twilio
    try {
      const liveStatus = await getCallStatus(callRecord.twilio_call_sid);
      callRecord.status = liveStatus.status;
      callRecord.duration = liveStatus.duration;
      if (liveStatus.startTime) {
        callRecord.startTime = liveStatus.startTime.toISOString();
      }
      if (liveStatus.endTime) {
        callRecord.endTime = liveStatus.endTime.toISOString();
      }
    } catch (twilioError) {
      console.warn("[Calls] Could not fetch live status from Twilio:", twilioError);
      // Continue with database data
    }

    res.json(callRecord);
  } catch (error) {
    console.error("[Calls] Error in GET /:id:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to process request",
      details: errorMsg,
    });
  }
});

/**
 * GET /api/calls/:id/recording
 * Get recording information for a call
 */
router.get("/:id/recording", requireRole(["admin", "agent", "manager"]), async (
  req: Request,
  res: Response
) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;

    // Fetch call from database
    const { data: callData, error: callError } = await supabase
      .from("calls")
      .select("*")
      .eq("id", id)
      .eq("accountId", accountId)
      .single();

    if (callError || !callData) {
      return res.status(404).json({
        error: "Call not found",
      });
    }

    if (!callData.recordingSid) {
      return res.status(404).json({
        error: "No recording found for this call",
      });
    }

    try {
      // Fetch recording details from Twilio
      const recordingInfo = await getRecording(callData.recordingSid);

      // Generate download URL
      const downloadUrl = getRecordingUrl(callData.recordingSid, "mp3");

      res.json({
        recordingSid: callData.recordingSid,
        callSid: callData.twilio_call_sid,
        duration: recordingInfo.duration,
        channels: recordingInfo.channels,
        dateCreated: recordingInfo.dateCreated,
        downloadUrl,
        mediaUrl: `${downloadUrl}.mp3`,
      });
    } catch (twilioError) {
      console.error("[Calls] Error fetching recording from Twilio:", twilioError);
      return res.status(500).json({
        error: "Failed to fetch recording details",
      });
    }
  } catch (error) {
    console.error("[Calls] Error in GET /:id/recording:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to process request",
      details: errorMsg,
    });
  }
});

/**
 * GET /api/calls/:id/transcript
 * Get transcript for a call (if available)
 */
router.get("/:id/transcript", requireRole(["admin", "agent", "manager"]), async (
  req: Request,
  res: Response
) => {
  try {
    const accountId = req.accountId!;
    const { id } = req.params;

    // Fetch call from database
    const { data: callData, error: callError } = await supabase
      .from("calls")
      .select("*")
      .eq("id", id)
      .eq("accountId", accountId)
      .single();

    if (callError || !callData) {
      return res.status(404).json({
        error: "Call not found",
      });
    }

    if (!callData.transcript && !callData.transcriptId) {
      return res.status(404).json({
        error: "No transcript available for this call",
      });
    }

    // Return existing transcript if available
    if (callData.transcript) {
      return res.json({
        id: callData.id,
        callSid: callData.twilio_call_sid,
        transcript: callData.transcript,
        createdAt: callData.updatedAt,
      });
    }

    // If transcriptId exists, fetch transcript details from transcription service
    // This would integrate with Deepgram, AssemblyAI, or similar
    res.json({
      id: callData.id,
      callSid: callData.twilio_call_sid,
      transcriptId: callData.transcriptId,
      status: "processing",
      message: "Transcript is being processed",
    });
  } catch (error) {
    console.error("[Calls] Error in GET /:id/transcript:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to process request",
      details: errorMsg,
    });
  }
});

// =============================================================================
// UTILITY ENDPOINTS
// =============================================================================

/**
 * GET /api/calls/stats/summary
 * Get call statistics for the account
 */
router.get("/stats/summary", requireRole(["admin", "manager"]), async (
  req: Request,
  res: Response
) => {
  try {
    const accountId = req.accountId!;
    const { campaignId, startDate, endDate } = req.query;

    // Build query
    let query = supabase
      .from("calls")
      .select("status, duration, createdAt")
      .eq("accountId", accountId);

    if (campaignId) {
      query = query.eq("campaignId", campaignId);
    }

    if (startDate) {
      query = query.gte("createdAt", startDate as string);
    }

    if (endDate) {
      query = query.lte("createdAt", endDate as string);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Calls] Error fetching stats:", error);
      return res.status(500).json({
        error: "Failed to fetch statistics",
      });
    }

    // Calculate statistics
    const stats = {
      totalCalls: data?.length || 0,
      completedCalls: data?.filter((c) => c.status === "completed").length || 0,
      failedCalls: data?.filter((c) => c.status === "failed").length || 0,
      totalDuration: data?.reduce((sum, c) => sum + (c.duration || 0), 0) || 0,
      averageDuration:
        (data?.length || 0) > 0
          ? Math.round((data?.reduce((sum, c) => sum + (c.duration || 0), 0) || 0) / data!.length)
          : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("[Calls] Error in GET /stats/summary:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to process request",
      details: errorMsg,
    });
  }
});

export default router;
