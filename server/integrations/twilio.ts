import twilio from "twilio";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface TwilioInitConfig {
  accountSid: string;
  authToken: string;
  fromPhoneNumber: string;
  webhookSecret?: string;
}

export interface CallOptions {
  to: string;
  from?: string;
  url?: string;
  method?: "GET" | "POST";
  statusCallback?: string;
  statusCallbackEvent?: string[];
  statusCallbackMethod?: "GET" | "POST";
  fallbackUrl?: string;
  fallbackMethod?: "GET" | "POST";
  timeout?: number;
  record?: boolean | "record-from-answer";
  recordingChannels?: "mono" | "stereo" | "both";
  recordingStatusCallback?: string;
  recordingStatusCallbackMethod?: "GET" | "POST";
  metadata?: Record<string, string>;
}

export interface SMSOptions {
  to: string;
  from?: string;
  body: string;
  statusCallback?: string;
  statusCallbackMethod?: "GET" | "POST";
  mediaUrl?: string[];
  metadata?: Record<string, string>;
}

export interface CallStatus {
  sid: string;
  status: "queued" | "ringing" | "in-progress" | "completed" | "failed" | "busy" | "no-answer";
  direction: "inbound" | "outbound-api" | "outbound-dial";
  from: string;
  to: string;
  duration?: number;
  startTime?: Date;
  endTime?: Date;
  price?: number;
  priceUnit?: string;
}

export interface RecordingInfo {
  sid: string;
  callSid: string;
  accountSid: string;
  dateCreated: Date;
  dateUpdated: Date;
  duration: number;
  source: "RecordVerb" | "Twilio" | "DialVerb" | "Conference" | "VoiceReceiver";
  uri: string;
  channels: number;
  price?: number;
  priceUnit?: string;
  encryptionDetails?: Record<string, any>;
}

export interface MessageStatus {
  sid: string;
  status:
    | "accepted"
    | "queued"
    | "sending"
    | "sent"
    | "failed"
    | "delivery_unknown"
    | "delivered"
    | "undelivered"
    | "read";
  to: string;
  from: string;
  body: string;
  numSegments: number;
  numMedia: number;
  dateCreated: Date;
  dateSent?: Date;
  price?: number;
  priceUnit?: string;
  errorCode?: number;
  errorMessage?: string;
}

// Webhook event types
export interface CallWebhookEvent {
  callSid: string;
  accountSid: string;
  from: string;
  to: string;
  callStatus: "ringing" | "answered" | "completed";
  duration?: number;
  recordingUrl?: string;
  recordingSid?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface RecordingReadyWebhookEvent {
  recordingSid: string;
  callSid: string;
  accountSid: string;
  recordingUrl: string;
  recordingDuration: number;
  recordingChannels: number;
  timestamp: Date;
}

export interface MessageWebhookEvent {
  messageSid: string;
  accountSid: string;
  from: string;
  to: string;
  messageStatus: string;
  timestamp: Date;
  errorCode?: number;
}

export interface TwilioWebhookHandlers {
  onCallRinging?: (event: CallWebhookEvent) => Promise<void>;
  onCallAnswered?: (event: CallWebhookEvent) => Promise<void>;
  onCallCompleted?: (event: CallWebhookEvent) => Promise<void>;
  onRecordingReady?: (event: RecordingReadyWebhookEvent) => Promise<void>;
  onMessageStatusChanged?: (event: MessageWebhookEvent) => Promise<void>;
}

// =============================================================================
// INITIALIZATION
// =============================================================================

let twilioClient: ReturnType<typeof twilio.Twilio> | null = null;
let twilioConfig: TwilioInitConfig | null = null;
let webhookHandlers: TwilioWebhookHandlers = {};

/**
 * Initialize Twilio client with credentials
 * Can be called multiple times safely - uses cached instance
 */
export function initTwilio(config?: TwilioInitConfig): ReturnType<typeof twilio.Twilio> {
  if (twilioClient) {
    return twilioClient;
  }

  const accountSid = config?.accountSid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = config?.authToken || process.env.TWILIO_AUTH_TOKEN;
  const fromPhoneNumber = config?.fromPhoneNumber || process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken) {
    throw new Error(
      "Twilio credentials not provided. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables or pass config to initTwilio()"
    );
  }

  if (!fromPhoneNumber) {
    console.warn(
      "TWILIO_PHONE_NUMBER not configured. You must provide 'from' parameter in call/SMS operations"
    );
  }

  twilioClient = twilio(accountSid, authToken);
  twilioConfig = {
    accountSid,
    authToken,
    fromPhoneNumber: fromPhoneNumber || "",
    webhookSecret: config?.webhookSecret || process.env.TWILIO_WEBHOOK_SECRET,
  };

  console.log(`[Twilio] Initialized with account: ${accountSid}`);
  return twilioClient;
}

/**
 * Get initialized Twilio client
 * Throws if not initialized
 */
function getTwilioClient(): ReturnType<typeof twilio.Twilio> {
  if (!twilioClient) {
    return initTwilio();
  }
  return twilioClient;
}

/**
 * Get Twilio configuration
 */
export function getTwilioConfig(): TwilioInitConfig {
  if (!twilioConfig) {
    initTwilio();
  }
  return twilioConfig!;
}

/**
 * Reset Twilio instance (useful for testing)
 */
export function resetTwilio(): void {
  twilioClient = null;
  twilioConfig = null;
  webhookHandlers = {};
}

export { getTwilioClient as twilio };

/**
 * Register webhook handlers for Twilio events
 */
export function registerWebhookHandlers(
  handlers: TwilioWebhookHandlers
): void {
  webhookHandlers = { ...webhookHandlers, ...handlers };
  console.log("[Twilio] Webhook handlers registered");
}

/**
 * Get registered webhook handlers
 */
export function getWebhookHandlers(): TwilioWebhookHandlers {
  return webhookHandlers;
}

// =============================================================================
// OUTBOUND CALLS
// =============================================================================

/**
 * Make an outbound call
 * Supports TwiML URL for IVR/voice apps or direct recording
 */
export async function makeCall(
  options: CallOptions
): Promise<CallStatus> {
  const client = getTwilioClient();
  const config = getTwilioConfig();

  const fromPhone = options.from || config.fromPhoneNumber;

  if (!fromPhone) {
    throw new Error(
      "No 'from' phone number provided. Configure TWILIO_PHONE_NUMBER or pass it in options"
    );
  }

  try {
    // Build call parameters
    const callParams: Record<string, any> = {
      to: options.to,
      from: fromPhone,
    };

    // If URL provided, use it for TwiML (IVR, voice menus, etc)
    if (options.url) {
      callParams.url = options.url;
      if (options.method) callParams.method = options.method;
      if (options.fallbackUrl) callParams.fallbackUrl = options.fallbackUrl;
      if (options.fallbackMethod) callParams.fallbackMethod = options.fallbackMethod;
    }

    // Status callback configuration
    if (options.statusCallback) {
      callParams.statusCallback = options.statusCallback;
      if (options.statusCallbackMethod) {
        callParams.statusCallbackMethod = options.statusCallbackMethod;
      }
      if (options.statusCallbackEvent) {
        callParams.statusCallbackEvent = options.statusCallbackEvent;
      }
    }

    // Recording options
    if (options.record) {
      callParams.record = options.record === true ? "record-from-answer" : options.record;
      if (options.recordingChannels) callParams.recordingChannels = options.recordingChannels;
      if (options.recordingStatusCallback) {
        callParams.recordingStatusCallback = options.recordingStatusCallback;
        if (options.recordingStatusCallbackMethod) {
          callParams.recordingStatusCallbackMethod = options.recordingStatusCallbackMethod;
        }
      }
    }

    // Timeout
    if (options.timeout) {
      callParams.timeout = options.timeout;
    }

    // Custom data (metadata) - store in CallSid tracking
    if (options.metadata) {
      callParams.machineDetection = options.metadata.machineDetection || undefined;
    }

    const call = await client.calls.create(callParams);

    console.log(
      `[Twilio] Outbound call initiated: ${call.sid} to ${options.to}`
    );

    return {
      sid: call.sid,
      status: (call.status as any) || "queued",
      direction: call.direction as any,
      from: call.from || fromPhone,
      to: call.to,
      startTime: call.startTime ? new Date(call.startTime) : undefined,
      endTime: call.endTime ? new Date(call.endTime) : undefined,
      duration: call.duration,
      price: call.price ? parseFloat(call.price) : undefined,
      priceUnit: call.priceUnit,
    };
  } catch (error) {
    console.error("[Twilio] Error making call:", error);
    throw error;
  }
}

// =============================================================================
// SMS / TEXT MESSAGES
// =============================================================================

/**
 * Send an SMS/text message
 */
export async function sendSMS(
  options: SMSOptions
): Promise<MessageStatus> {
  const client = getTwilioClient();
  const config = getTwilioConfig();

  const fromPhone = options.from || config.fromPhoneNumber;

  if (!fromPhone) {
    throw new Error(
      "No 'from' phone number provided. Configure TWILIO_PHONE_NUMBER or pass it in options"
    );
  }

  try {
    const messageParams: Record<string, any> = {
      to: options.to,
      from: fromPhone,
      body: options.body,
    };

    // Media URLs for MMS
    if (options.mediaUrl && options.mediaUrl.length > 0) {
      messageParams.mediaUrl = options.mediaUrl;
    }

    // Status callback
    if (options.statusCallback) {
      messageParams.statusCallback = options.statusCallback;
      if (options.statusCallbackMethod) {
        messageParams.statusCallbackMethod = options.statusCallbackMethod;
      }
    }

    const message = await client.messages.create(messageParams);

    console.log(
      `[Twilio] SMS sent: ${message.sid} to ${options.to}`
    );

    return {
      sid: message.sid,
      status: (message.status as any) || "queued",
      to: message.to,
      from: message.from,
      body: message.body,
      numSegments: parseInt(message.numSegments),
      numMedia: parseInt(message.numMedia),
      dateCreated: new Date(message.dateCreated),
      dateSent: message.dateSent ? new Date(message.dateSent) : undefined,
      price: message.price ? parseFloat(message.price) : undefined,
      priceUnit: message.priceUnit,
      errorCode: message.errorCode ? parseInt(message.errorCode) : undefined,
      errorMessage: message.errorMessage,
    };
  } catch (error) {
    console.error("[Twilio] Error sending SMS:", error);
    throw error;
  }
}

// =============================================================================
// CALL STATUS & INFORMATION
// =============================================================================

/**
 * Get call status by SID
 */
export async function getCallStatus(callSid: string): Promise<CallStatus> {
  const client = getTwilioClient();

  try {
    const call = await client.calls(callSid).fetch();

    return {
      sid: call.sid,
      status: (call.status as any) || "queued",
      direction: (call.direction as any) || "outbound-api",
      from: call.from,
      to: call.to,
      duration: call.duration,
      startTime: call.startTime ? new Date(call.startTime) : undefined,
      endTime: call.endTime ? new Date(call.endTime) : undefined,
      price: call.price ? parseFloat(call.price) : undefined,
      priceUnit: call.priceUnit,
    };
  } catch (error) {
    console.error(`[Twilio] Error fetching call ${callSid}:`, error);
    throw error;
  }
}

/**
 * List calls with optional filtering
 */
export async function listCalls(
  from?: string,
  to?: string,
  status?: string,
  limit: number = 20
): Promise<CallStatus[]> {
  const client = getTwilioClient();

  try {
    const params: Record<string, any> = {
      limit,
    };

    if (from) params.from = from;
    if (to) params.to = to;
    if (status) params.status = status;

    const calls = await client.calls.list(params);

    return calls.map((call) => ({
      sid: call.sid,
      status: (call.status as any) || "queued",
      direction: (call.direction as any) || "outbound-api",
      from: call.from,
      to: call.to,
      duration: call.duration,
      startTime: call.startTime ? new Date(call.startTime) : undefined,
      endTime: call.endTime ? new Date(call.endTime) : undefined,
      price: call.price ? parseFloat(call.price) : undefined,
      priceUnit: call.priceUnit,
    }));
  } catch (error) {
    console.error("[Twilio] Error listing calls:", error);
    throw error;
  }
}

// =============================================================================
// RECORDINGS
// =============================================================================

/**
 * Get recording information by SID
 */
export async function getRecording(recordingSid: string): Promise<RecordingInfo> {
  const client = getTwilioClient();

  try {
    const recording = await client.recordings(recordingSid).fetch();

    return {
      sid: recording.sid,
      callSid: recording.callSid,
      accountSid: recording.accountSid,
      dateCreated: new Date(recording.dateCreated),
      dateUpdated: new Date(recording.dateUpdated),
      duration: recording.duration,
      source: (recording.source as any) || "RecordVerb",
      uri: recording.uri,
      channels: recording.channels,
      price: recording.price ? parseFloat(recording.price) : undefined,
      priceUnit: recording.priceUnit,
      encryptionDetails: recording.encryptionDetails,
    };
  } catch (error) {
    console.error(
      `[Twilio] Error fetching recording ${recordingSid}:`,
      error
    );
    throw error;
  }
}

/**
 * Get all recordings for a specific call
 */
export async function getCallRecordings(callSid: string): Promise<RecordingInfo[]> {
  const client = getTwilioClient();

  try {
    const recordings = await client
      .calls(callSid)
      .recordings.list({ limit: 100 });

    return recordings.map((recording) => ({
      sid: recording.sid,
      callSid: recording.callSid,
      accountSid: recording.accountSid,
      dateCreated: new Date(recording.dateCreated),
      dateUpdated: new Date(recording.dateUpdated),
      duration: recording.duration,
      source: (recording.source as any) || "RecordVerb",
      uri: recording.uri,
      channels: recording.channels,
      price: recording.price ? parseFloat(recording.price) : undefined,
      priceUnit: recording.priceUnit,
      encryptionDetails: recording.encryptionDetails,
    }));
  } catch (error) {
    console.error(
      `[Twilio] Error fetching recordings for call ${callSid}:`,
      error
    );
    throw error;
  }
}

/**
 * List all recordings (with optional filtering)
 */
export async function listRecordings(
  limit: number = 20
): Promise<RecordingInfo[]> {
  const client = getTwilioClient();

  try {
    const recordings = await client.recordings.list({ limit });

    return recordings.map((recording) => ({
      sid: recording.sid,
      callSid: recording.callSid,
      accountSid: recording.accountSid,
      dateCreated: new Date(recording.dateCreated),
      dateUpdated: new Date(recording.dateUpdated),
      duration: recording.duration,
      source: (recording.source as any) || "RecordVerb",
      uri: recording.uri,
      channels: recording.channels,
      price: recording.price ? parseFloat(recording.price) : undefined,
      priceUnit: recording.priceUnit,
      encryptionDetails: recording.encryptionDetails,
    }));
  } catch (error) {
    console.error("[Twilio] Error listing recordings:", error);
    throw error;
  }
}

/**
 * Delete a recording by SID
 */
export async function deleteRecording(recordingSid: string): Promise<void> {
  const client = getTwilioClient();

  try {
    await client.recordings(recordingSid).remove();
    console.log(`[Twilio] Recording deleted: ${recordingSid}`);
  } catch (error) {
    console.error(
      `[Twilio] Error deleting recording ${recordingSid}:`,
      error
    );
    throw error;
  }
}

/**
 * Get recording media URL (for playback, transcription, etc)
 */
export function getRecordingUrl(recordingSid: string, format: "mp3" | "wav" = "mp3"): string {
  const config = getTwilioConfig();
  return `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Recordings/${recordingSid}.${format}`;
}

// =============================================================================
// WEBHOOK HANDLERS
// =============================================================================

/**
 * Handle incoming webhook from Twilio
 * Validates and dispatches to registered handlers
 */
export async function handleWebhook(
  body: Record<string, any>
): Promise<void> {
  const eventType = body.CallStatus || body.MessageStatus || body.RecordingStatus;

  // Handle call status changes
  if (body.CallStatus) {
    const callEvent: CallWebhookEvent = {
      callSid: body.CallSid,
      accountSid: body.AccountSid,
      from: body.From,
      to: body.To,
      callStatus: body.CallStatus,
      duration: body.CallDuration ? parseInt(body.CallDuration) : undefined,
      recordingSid: body.RecordingSid,
      recordingUrl: body.RecordingUrl,
      timestamp: new Date(),
      metadata: {
        parentCallSid: body.ParentCallSid,
        queueTime: body.QueueTime,
        direction: body.Direction,
      },
    };

    if (body.CallStatus === "ringing" && webhookHandlers.onCallRinging) {
      await webhookHandlers.onCallRinging(callEvent);
    } else if (body.CallStatus === "answered" && webhookHandlers.onCallAnswered) {
      await webhookHandlers.onCallAnswered(callEvent);
    } else if (body.CallStatus === "completed" && webhookHandlers.onCallCompleted) {
      await webhookHandlers.onCallCompleted(callEvent);
    }
  }

  // Handle recording ready
  if (body.RecordingStatus === "completed") {
    const recordingEvent: RecordingReadyWebhookEvent = {
      recordingSid: body.RecordingSid,
      callSid: body.CallSid,
      accountSid: body.AccountSid,
      recordingUrl: body.RecordingUrl,
      recordingDuration: body.RecordingDuration ? parseInt(body.RecordingDuration) : 0,
      recordingChannels: body.RecordingChannels ? parseInt(body.RecordingChannels) : 1,
      timestamp: new Date(),
    };

    if (webhookHandlers.onRecordingReady) {
      await webhookHandlers.onRecordingReady(recordingEvent);
    }
  }

  // Handle SMS status
  if (body.MessageStatus) {
    const messageEvent: MessageWebhookEvent = {
      messageSid: body.MessageSid,
      accountSid: body.AccountSid,
      from: body.From,
      to: body.To,
      messageStatus: body.MessageStatus,
      timestamp: new Date(),
      errorCode: body.ErrorCode ? parseInt(body.ErrorCode) : undefined,
    };

    if (webhookHandlers.onMessageStatusChanged) {
      await webhookHandlers.onMessageStatusChanged(messageEvent);
    }
  }

  console.log(`[Twilio Webhook] Processed event: ${eventType}`);
}

// =============================================================================
// MESSAGE STATUS & INFORMATION
// =============================================================================

/**
 * Get message status by SID
 */
export async function getMessageStatus(messageSid: string): Promise<MessageStatus> {
  const client = getTwilioClient();

  try {
    const message = await client.messages(messageSid).fetch();

    return {
      sid: message.sid,
      status: (message.status as any) || "queued",
      to: message.to,
      from: message.from,
      body: message.body,
      numSegments: parseInt(message.numSegments),
      numMedia: parseInt(message.numMedia),
      dateCreated: new Date(message.dateCreated),
      dateSent: message.dateSent ? new Date(message.dateSent) : undefined,
      price: message.price ? parseFloat(message.price) : undefined,
      priceUnit: message.priceUnit,
      errorCode: message.errorCode ? parseInt(message.errorCode) : undefined,
      errorMessage: message.errorMessage,
    };
  } catch (error) {
    console.error(`[Twilio] Error fetching message ${messageSid}:`, error);
    throw error;
  }
}

/**
 * List SMS messages (with optional filtering)
 */
export async function listMessages(
  from?: string,
  to?: string,
  limit: number = 20
): Promise<MessageStatus[]> {
  const client = getTwilioClient();

  try {
    const params: Record<string, any> = {
      limit,
    };

    if (from) params.from = from;
    if (to) params.to = to;

    const messages = await client.messages.list(params);

    return messages.map((message) => ({
      sid: message.sid,
      status: (message.status as any) || "queued",
      to: message.to,
      from: message.from,
      body: message.body,
      numSegments: parseInt(message.numSegments),
      numMedia: parseInt(message.numMedia),
      dateCreated: new Date(message.dateCreated),
      dateSent: message.dateSent ? new Date(message.dateSent) : undefined,
      price: message.price ? parseFloat(message.price) : undefined,
      priceUnit: message.priceUnit,
      errorCode: message.errorCode ? parseInt(message.errorCode) : undefined,
      errorMessage: message.errorMessage,
    }));
  } catch (error) {
    console.error("[Twilio] Error listing messages:", error);
    throw error;
  }
}
