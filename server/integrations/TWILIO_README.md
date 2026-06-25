# Twilio Integration Guide

This document describes the Twilio integration for voxmation, providing voice calling, SMS messaging, and call recording capabilities.

## Overview

The Twilio integration (`server/integrations/twilio.ts`) provides:

- **Outbound calls** with support for TwiML, IVR, and call recording
- **SMS/MMS messaging** with media attachments
- **Call status tracking** (queued, ringing, answered, completed, failed)
- **Call recording management** with automatic webhook notifications
- **Message status tracking** with delivery confirmation
- **Webhook event handling** for real-time call and SMS events

## Installation

### 1. Install Dependencies

```bash
npm install twilio
```

The `twilio` package is already added to `package.json`.

### 2. Environment Setup

Add the following to your `.env` file:

```env
# Required: Twilio credentials
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Optional: Webhook secret for request validation
TWILIO_WEBHOOK_SECRET=your_webhook_secret
```

**Where to find these:**
1. Go to [Twilio Console](https://console.twilio.com/)
2. Copy your **Account SID** and **Auth Token** from the dashboard
3. Get a Twilio phone number from the [Phone Numbers](https://console.twilio.com/phone-numbers) section

## Usage

### Initialization

The Twilio client initializes automatically on first use, but you can manually initialize it:

```typescript
import { initTwilio } from "@/server/integrations/twilio";

// Automatic (uses env variables)
initTwilio();

// Or with explicit config
initTwilio({
  accountSid: "ACxxxxxxxx",
  authToken: "your_auth_token",
  fromPhoneNumber: "+1234567890",
});
```

### Making Calls

#### Basic Outbound Call

```typescript
import { makeCall } from "@/server/integrations/twilio";

const call = await makeCall({
  to: "+1555123456",
  from: "+1234567890", // Optional if TWILIO_PHONE_NUMBER is set
});

console.log(`Call initiated: ${call.sid}`);
```

#### Call with TwiML URL (IVR/Voice Menu)

```typescript
const call = await makeCall({
  to: "+1555123456",
  url: "https://your-domain.com/api/voice/ivr",
  method: "POST",
  statusCallback: "https://your-domain.com/api/webhooks/twilio",
  statusCallbackEvent: ["ringing", "answered", "completed"],
});
```

#### Call with Recording

```typescript
const call = await makeCall({
  to: "+1555123456",
  url: "https://your-domain.com/api/voice/greeting",
  record: true, // or "record-from-answer"
  recordingStatusCallback: "https://your-domain.com/api/webhooks/twilio",
  recordingChannels: "mono", // "mono" or "stereo" or "both"
});
```

#### Call with Machine Detection

```typescript
const call = await makeCall({
  to: "+1555123456",
  url: "https://your-domain.com/api/voice/main",
  metadata: {
    machineDetection: "Enable",
    // Will provide MachineDetection in webhook
  },
});
```

**Call Options:**

```typescript
interface CallOptions {
  to: string;                              // Destination phone number
  from?: string;                           // Caller ID (defaults to TWILIO_PHONE_NUMBER)
  url?: string;                            // TwiML URL for voice app
  method?: "GET" | "POST";                 // HTTP method for TwiML URL
  statusCallback?: string;                 // Webhook for call status updates
  statusCallbackEvent?: string[];          // Events: ["ringing","answered","completed"]
  statusCallbackMethod?: "GET" | "POST";   // HTTP method for callback
  fallbackUrl?: string;                    // Fallback TwiML if primary fails
  fallbackMethod?: "GET" | "POST";         // HTTP method for fallback
  timeout?: number;                        // Timeout in seconds (5-600)
  record?: boolean | "record-from-answer"; // Enable recording
  recordingChannels?: "mono" | "stereo" | "both";
  recordingStatusCallback?: string;        // Webhook for recording ready
  recordingStatusCallbackMethod?: "GET" | "POST";
  metadata?: Record<string, string>;       // Custom metadata
}
```

**Call Status Response:**

```typescript
interface CallStatus {
  sid: string;           // Unique call identifier
  status: string;        // "queued" | "ringing" | "in-progress" | "completed" | "failed" | "busy" | "no-answer"
  direction: string;     // "inbound" | "outbound-api" | "outbound-dial"
  from: string;          // Caller ID
  to: string;            // Destination number
  duration?: number;     // Call duration in seconds
  startTime?: Date;      // When call started
  endTime?: Date;        // When call ended
  price?: number;        // Cost in cents
  priceUnit?: string;    // Currency code
}
```

### Sending SMS/MMS

#### Basic SMS

```typescript
import { sendSMS } from "@/server/integrations/twilio";

const message = await sendSMS({
  to: "+1555123456",
  body: "Hello from Voxmation!",
});

console.log(`SMS sent: ${message.sid}`);
```

#### SMS with Status Callback

```typescript
const message = await sendSMS({
  to: "+1555123456",
  body: "Appointment reminder: Tuesday at 2pm",
  statusCallback: "https://your-domain.com/api/webhooks/twilio",
  statusCallbackMethod: "POST",
});
```

#### MMS with Media

```typescript
const mms = await sendSMS({
  to: "+1555123456",
  body: "Check out this image!",
  mediaUrl: [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
  ],
});
```

**SMS Options:**

```typescript
interface SMSOptions {
  to: string;                       // Recipient phone number
  from?: string;                    // Sender ID (defaults to TWILIO_PHONE_NUMBER)
  body: string;                     // Message text
  statusCallback?: string;          // Webhook for delivery status
  statusCallbackMethod?: "GET" | "POST";
  mediaUrl?: string[];              // URLs for MMS attachments
  metadata?: Record<string, string>;
}
```

**Message Status Response:**

```typescript
interface MessageStatus {
  sid: string;              // Message identifier
  status: string;           // "accepted"|"queued"|"sending"|"sent"|"failed"|"delivered"|"undelivered"|"read"
  to: string;
  from: string;
  body: string;
  numSegments: number;      // SMS segments (for long messages)
  numMedia: number;         // Number of media attachments
  dateCreated: Date;
  dateSent?: Date;
  price?: number;           // Cost in cents
  priceUnit?: string;
  errorCode?: number;       // Error code if failed
  errorMessage?: string;
}
```

### Getting Call Status

```typescript
import { getCallStatus, listCalls } from "@/server/integrations/twilio";

// Get single call status
const status = await getCallStatus("CA1234567890abcdef");

// List recent calls
const calls = await listCalls(
  undefined,           // from number (optional filter)
  "+1555123456",       // to number (optional filter)
  "completed",         // status (optional filter)
  20                   // limit
);
```

### Managing Recordings

```typescript
import {
  getRecording,
  getCallRecordings,
  listRecordings,
  deleteRecording,
  getRecordingUrl,
} from "@/server/integrations/twilio";

// Get recording info
const recording = await getRecording("RE1234567890abcdef");
console.log(`Duration: ${recording.duration}s`);

// Get all recordings for a call
const recordings = await getCallRecordings("CA1234567890abcdef");

// Get recording playback URL
const url = getRecordingUrl("RE1234567890abcdef", "mp3");
// -> "https://api.twilio.com/2010-04-01/Accounts/ACxxxx/Recordings/RExxxx.mp3"

// Delete a recording
await deleteRecording("RE1234567890abcdef");

// List all recordings (paginated)
const allRecordings = await listRecordings(100);
```

**Recording Info Response:**

```typescript
interface RecordingInfo {
  sid: string;
  callSid: string;
  accountSid: string;
  dateCreated: Date;
  dateUpdated: Date;
  duration: number;         // Seconds
  source: string;           // "RecordVerb" | "Twilio" | "DialVerb" | "Conference"
  uri: string;              // API URI
  channels: number;         // 1 (mono) | 2 (stereo)
  price?: number;
  priceUnit?: string;
}
```

### SMS/Message Status

```typescript
import { getMessageStatus, listMessages } from "@/server/integrations/twilio";

// Get message status
const status = await getMessageStatus("SM1234567890abcdef");

// List messages (with optional filters)
const messages = await listMessages(
  "+1234567890",    // from (optional)
  "+1555123456",    // to (optional)
  20                // limit
);
```

## Webhooks

### Setting Up Webhooks

In your Twilio Console, configure webhook URLs:

1. **For Calls:**
   - Console → Phone Numbers → Manage Numbers → Select Number
   - Voice & Fax → A Call Comes In → Select "Webhook"
   - URL: `https://your-domain.com/api/webhooks/twilio`

2. **For Status Callbacks:**
   - Configure in `makeCall()` or `sendSMS()` options
   - Twilio will POST status updates to these URLs

3. **For Recording Ready:**
   - Configure `recordingStatusCallback` in `makeCall()` options

### Webhook Event Types

The integration handles these events:

#### Call Status Events

```
onCallRinging:   Call is ringing on recipient's phone
onCallAnswered:  Call was answered
onCallCompleted: Call ended (includes duration, recording SID)
```

#### Recording Events

```
onRecordingReady: Recording finished and is ready for retrieval
```

#### Message Events

```
onMessageStatusChanged: SMS/MMS delivery status updated
```

### Registering Webhook Handlers

Handlers are pre-registered in `server/routes/webhooks.ts`. To customize:

```typescript
import {
  registerWebhookHandlers,
  TwilioWebhookHandlers,
  CallWebhookEvent,
} from "@/server/integrations/twilio";

const customHandlers: TwilioWebhookHandlers = {
  async onCallCompleted(event: CallWebhookEvent) {
    console.log(`Call ${event.callSid} ended after ${event.duration}s`);
    
    // Custom logic: update database, send notification, etc.
    const { data } = await supabase
      .from("calls")
      .update({
        duration: event.duration,
        recording_sid: event.recordingSid,
      })
      .eq("twilio_call_sid", event.callSid);
  },
};

registerWebhookHandlers(customHandlers);
```

### Webhook Event Data

**Call Webhook Event:**
```typescript
interface CallWebhookEvent {
  callSid: string;        // Unique call ID
  accountSid: string;     // Your Twilio account
  from: string;           // Caller ID
  to: string;             // Recipient
  callStatus: string;     // "ringing" | "answered" | "completed"
  duration?: number;      // Seconds (for completed calls)
  recordingUrl?: string;  // S3 URL to recording
  recordingSid?: string;  // Recording ID
  timestamp: Date;        // When event occurred
  metadata?: object;      // Custom data from call
}
```

**Recording Ready Event:**
```typescript
interface RecordingReadyWebhookEvent {
  recordingSid: string;      // Recording ID
  callSid: string;           // Associated call
  accountSid: string;        // Your Twilio account
  recordingUrl: string;      // S3 download URL
  recordingDuration: number; // Seconds
  recordingChannels: number; // 1 or 2
  timestamp: Date;
}
```

**Message Webhook Event:**
```typescript
interface MessageWebhookEvent {
  messageSid: string;    // Message ID
  accountSid: string;    // Your Twilio account
  from: string;          // Sender
  to: string;            // Recipient
  messageStatus: string; // "sent" | "delivered" | "failed" | "read" | etc
  timestamp: Date;
  errorCode?: number;    // Error code if failed
}
```

## Database Schema

The integration expects these tables in Supabase for webhook storage:

```sql
-- Call tracking
CREATE TABLE twilio_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid TEXT UNIQUE NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  duration INTEGER,
  recording_sid TEXT,
  recording_url TEXT,
  answered_at TIMESTAMP,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Call events
CREATE TABLE twilio_call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid TEXT NOT NULL REFERENCES twilio_calls(call_sid),
  account_sid TEXT,
  from_number TEXT,
  to_number TEXT,
  event_type TEXT, -- 'ringing', 'answered', 'completed'
  status TEXT,
  duration INTEGER,
  timestamp TIMESTAMP NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recordings
CREATE TABLE twilio_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_sid TEXT UNIQUE NOT NULL,
  call_sid TEXT NOT NULL REFERENCES twilio_calls(call_sid),
  account_sid TEXT,
  recording_url TEXT,
  duration INTEGER,
  channels INTEGER DEFAULT 1,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE twilio_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_sid TEXT UNIQUE NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  body TEXT,
  status TEXT DEFAULT 'queued',
  num_segments INTEGER,
  num_media INTEGER DEFAULT 0,
  error_code INTEGER,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Message events
CREATE TABLE twilio_message_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_sid TEXT NOT NULL REFERENCES twilio_messages(message_sid),
  account_sid TEXT,
  from_number TEXT,
  to_number TEXT,
  status TEXT,
  error_code INTEGER,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

### Common Errors

**Missing credentials:**
```
Error: Twilio credentials not provided. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables
```
Solution: Add to `.env` file

**Invalid phone number:**
```
RestException: The phone number +1555123456 is not currently owned by your account
```
Solution: Use a valid Twilio-owned number or verify the format

**Rate limiting:**
```
RestException: Too many requests
```
Solution: Implement backoff and retry logic

### Error Response

```typescript
try {
  await makeCall({ to: "+invalid" });
} catch (error) {
  console.error(error.message);
  console.error(error.code);
  // Handle specific error types
  if (error.code === 21202) {
    // Invalid phone number
  }
}
```

## Testing

### Mock Twilio Calls (Development)

```typescript
import { resetTwilio, initTwilio } from "@/server/integrations/twilio";

// Mock responses
const mockMakeCall = async (options: CallOptions) => {
  return {
    sid: "CA" + Math.random().toString(36).substring(7),
    status: "queued",
    direction: "outbound-api",
    from: options.from || "+1234567890",
    to: options.to,
  };
};
```

### Testing Webhooks Locally

Use ngrok to tunnel webhooks to localhost:

```bash
ngrok http 3001
```

Then update Twilio webhook URLs to use the ngrok URL:
```
https://your-ngrok-id.ngrok.io/api/webhooks/twilio
```

## Pricing

Twilio charges per minute of calls and per SMS. Check [Twilio Pricing](https://www.twilio.com/en-us/pricing) for current rates.

**Typical costs:**
- Outbound calls: ~$0.013/minute (US)
- SMS: $0.0075 per message
- Recordings: included with calls

## API Reference

### Core Functions

- `initTwilio(config?: TwilioInitConfig)` - Initialize client
- `makeCall(options: CallOptions)` - Initiate outbound call
- `sendSMS(options: SMSOptions)` - Send text message
- `getCallStatus(callSid: string)` - Get call status
- `listCalls(from?, to?, status?, limit?)` - List calls
- `getRecording(recordingSid)` - Get recording info
- `getCallRecordings(callSid)` - Get all recordings for a call
- `listRecordings(limit?)` - List all recordings
- `deleteRecording(recordingSid)` - Delete recording
- `getRecordingUrl(recordingSid, format?)` - Get playback URL
- `getMessageStatus(messageSid)` - Get SMS status
- `listMessages(from?, to?, limit?)` - List messages
- `handleWebhook(body)` - Process incoming webhook
- `registerWebhookHandlers(handlers)` - Register event handlers
- `getTwilioConfig()` - Get configuration
- `resetTwilio()` - Reset instance (testing)

## Troubleshooting

**Calls not recording:**
- Ensure `record: true` is set in `makeCall()` options
- Verify webhook URL is reachable and returns 200 OK
- Check Twilio console for recording configuration

**Webhooks not arriving:**
- Verify URL is publicly accessible (test with ngrok)
- Check that callback method matches (GET vs POST)
- Inspect Twilio logs for delivery errors

**High costs:**
- Monitor call duration and recording time
- Use `timeout` option to limit call length
- Consider regional numbers for better pricing

## Resources

- [Twilio Node.js SDK Docs](https://twilio.github.io/twilio-node/)
- [Twilio Voice API](https://www.twilio.com/docs/voice/api)
- [Twilio SMS API](https://www.twilio.com/docs/sms/api)
- [TwiML Documentation](https://www.twilio.com/docs/voice/twiml)
- [Webhook Status Callbacks](https://www.twilio.com/docs/voice/api/status-callbacks)
