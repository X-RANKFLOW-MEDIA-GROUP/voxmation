# Twilio Integration - Quick Setup Guide

## Files Created

### Core Integration
- **`twilio.ts`** - Main Twilio integration module with all core functions
  - `initTwilio()` - Initialize client
  - `makeCall()` - Make outbound calls
  - `sendSMS()` - Send text messages
  - `getCallStatus()` / `listCalls()` - Track call status
  - `getRecording()` / `getCallRecordings()` - Manage recordings
  - `getMessageStatus()` / `listMessages()` - Track messages
  - Webhook handler functions for all event types

### TwiML Builders
- **`twilio-twiml.ts`** - TwiML (Twilio Markup Language) builders for voice applications
  - `TwiMLResponse` class with fluent API
  - `Gather` class for DTMF input collection
  - Template functions for common scenarios (greeting, menu, voicemail, etc.)
  - Helper utilities for formatting phone numbers and currency

### Documentation & Examples
- **`TWILIO_README.md`** - Comprehensive documentation covering:
  - Installation and environment setup
  - All API functions with examples
  - Webhook configuration and handlers
  - Database schema requirements
  - Error handling and troubleshooting
  - Pricing information

- **`twilio-examples.ts`** - Practical examples for:
  - Making greeting and survey calls
  - Machine detection
  - Recording management and transcription
  - Bulk SMS campaigns
  - Complete campaign workflows
  - Error handling patterns

### Webhook Integration
- **Updated `webhooks.ts`** route with:
  - Twilio webhook handler registration
  - POST endpoint at `/api/webhooks/twilio`
  - Health check endpoint integration
  - Event handlers for call and SMS events
  - Database event logging

### Dependencies
- **Updated `package.json`** - Added `twilio: ^4.19.3`

## Quick Start

### 1. Install Dependencies
```bash
npm install twilio
```

### 2. Configure Environment
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_SECRET=optional_webhook_secret
```

### 3. Initialize in Your Code
```typescript
import { initTwilio, makeCall, sendSMS } from "@/server/integrations/twilio";

// Initialize (automatic on first use, or call explicitly)
initTwilio();

// Make a call
const call = await makeCall({
  to: "+15551234567",
  url: "https://your-domain.com/api/voice/greeting",
  statusCallback: "https://your-domain.com/api/webhooks/twilio",
  record: true,
});

// Send SMS
const message = await sendSMS({
  to: "+15551234567",
  body: "Hello from Voxmation!",
});
```

### 4. Build Voice Applications with TwiML
```typescript
import { TwiMLResponse, menuResponse } from "@/server/integrations/twilio-twiml";

// Simple greeting
const twiml = new TwiMLResponse()
  .say("Welcome to Voxmation")
  .pause(1)
  .hangup()
  .toString();

// Or use a template
const menu = menuResponse({
  greeting: "Press 1 for sales, 2 for support",
  routes: {
    "1": "https://your-domain.com/sales",
    "2": "https://your-domain.com/support",
  },
});
```

### 5. Create API Endpoint for TwiML
```typescript
// In your Express routes
app.post("/api/voice/greeting", (req, res) => {
  const twiml = new TwiMLResponse()
    .say("Hello! Thanks for calling.")
    .hangup()
    .toString();
  
  res.type("text/xml").send(twiml);
});
```

### 6. Set Up Webhooks
- Twilio will POST to `/api/webhooks/twilio` for call and SMS events
- Configure in Twilio console and in `makeCall()` / `sendSMS()` options
- Handlers automatically log events to database

## Key Features Implemented

✅ **Outbound Calls**
- Standard calls, IVR with menus, surveys
- Machine detection
- Automatic recording
- Status callbacks for real-time updates

✅ **SMS/MMS**
- Send text messages and media
- Delivery status tracking
- Bulk messaging support

✅ **Call Management**
- Get call status in real-time
- List calls with filters
- Track call duration and outcomes

✅ **Recording Management**
- Retrieve recordings by call or ID
- Get playback URLs (MP3, WAV)
- Delete old recordings
- Integration points for transcription

✅ **Webhooks**
- Call status events (ringing, answered, completed)
- Recording ready notifications
- SMS delivery status updates
- Automatic database logging

✅ **TwiML Builders**
- Fluent API for building voice apps
- Pre-built templates for common scenarios
- Proper XML escaping and validation

## Database Requirements

Create these tables in Supabase (see TWILIO_README.md for full schema):

```sql
CREATE TABLE twilio_calls (...)
CREATE TABLE twilio_call_events (...)
CREATE TABLE twilio_recordings (...)
CREATE TABLE twilio_messages (...)
CREATE TABLE twilio_message_events (...)
```

## Architecture

```
twilio.ts
├── Initialization (initTwilio)
├── Core Functions
│   ├── Calls (makeCall, getCallStatus, listCalls)
│   ├── SMS (sendSMS, getMessageStatus, listMessages)
│   └── Recordings (getRecording, deleteRecording, etc)
├── Webhook Handling
│   └── handleWebhook, registerWebhookHandlers
└── Event Types (interfaces)

twilio-twiml.ts
├── TwiMLResponse (builder)
├── Gather (DTMF input)
├── Verbs (Say, Play, Dial, Record, etc)
└── Template Functions (greeting, menu, voicemail, etc)

webhooks.ts (routes)
├── POST /api/webhooks/twilio (webhook handler)
├── Twilio event handler registration
└── Event logging to database
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Set up Twilio account** at https://www.twilio.com
3. **Configure environment variables** in `.env`
4. **Create database tables** as described in TWILIO_README.md
5. **Build voice endpoints** using TwiML builders
6. **Configure webhook URLs** in Twilio console
7. **Test with examples** in `twilio-examples.ts`

## Common Use Cases

- ✅ **Call campaigns** - Outbound calling with IVR menus
- ✅ **Appointment reminders** - SMS/MMS notifications
- ✅ **Call recording** - Record and transcribe conversations
- ✅ **Customer support** - Interactive voice response systems
- ✅ **Lead qualification** - Automated surveys with DTMF input
- ✅ **Call tracking** - Monitor call status and duration

## Support & Documentation

- **TWILIO_README.md** - Full API reference and detailed guide
- **twilio-examples.ts** - Working code examples
- **twilio-twiml.ts** - TwiML builder source code
- [Twilio Docs](https://www.twilio.com/docs)
- [Twilio SDK Reference](https://twilio.github.io/twilio-node/)

## Notes

- Twilio charges per minute of calls and per SMS
- Trial accounts have limited capabilities (verify phone numbers)
- Webhook URLs must be HTTPS in production
- Use ngrok for local webhook testing
- Recordings are stored on Twilio's servers (downloadable for 30 days)
