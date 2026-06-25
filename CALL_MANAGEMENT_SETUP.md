# Call Management API - Setup and Verification Guide

## Implementation Status

All Call Management endpoints have been successfully implemented and integrated into the Voxmation platform.

### Files Created

| File | Size | Purpose |
|------|------|---------|
| `/server/routes/calls.ts` | 17KB | Core API endpoints (640 lines) |
| `/server/routes/calls.examples.ts` | 19KB | 12 usage examples (450 lines) |
| `/server/tests/calls.test.ts` | 16KB | Test suite (40+ tests) |
| `/server/docs/CALL_MANAGEMENT.md` | 20KB | Full documentation (800+ lines) |
| `/CALLS_API_README.md` | 12KB | Quick start guide (400 lines) |

### Files Modified

| File | Change |
|------|--------|
| `/server/index.ts` | Added callRoutes import and registration |

---

## Endpoints Available

### 1. POST /api/calls/make
Initiate an outbound call

**Request:**
```json
{
  "to": "+14155552671",
  "from": "+14155551234",
  "campaignId": "campaign-123",
  "record": true,
  "metadata": { "key": "value" }
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "twilio_call_sid": "CA123...",
  "to": "+14155552671",
  "from": "+14155551234",
  "status": "queued",
  "campaignId": "campaign-123",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 2. GET /api/calls
List calls with filtering and pagination

**Query Parameters:**
- `campaignId` (optional): Filter by campaign
- `status` (optional): Filter by status (queued, ringing, in-progress, completed, failed)
- `limit` (optional): Results per page (default: 50, max: 200)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "calls": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "twilio_call_sid": "CA123...",
      "to": "+14155552671",
      "from": "+14155551234",
      "status": "completed",
      "duration": 120,
      "startTime": "2024-01-15T10:30:00Z",
      "endTime": "2024-01-15T10:32:00Z",
      "campaignId": "campaign-123"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

---

### 3. GET /api/calls/:id
Get detailed call information

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "twilio_call_sid": "CA123...",
  "status": "completed",
  "duration": 120,
  "recordingSid": "RE123...",
  "transcriptId": null,
  "transcript": null,
  "metadata": { "callType": "outreach" }
}
```

---

### 4. GET /api/calls/:id/recording
Get call recording details

**Response:**
```json
{
  "recordingSid": "RE123...",
  "callSid": "CA123...",
  "duration": 120,
  "channels": 1,
  "dateCreated": "2024-01-15T10:32:00Z",
  "downloadUrl": "https://api.twilio.com/2010-04-01/Accounts/.../RE123.mp3",
  "mediaUrl": "https://api.twilio.com/2010-04-01/Accounts/.../RE123.mp3"
}
```

---

### 5. GET /api/calls/:id/transcript
Get call transcript

**Response (if available):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "callSid": "CA123...",
  "transcript": "Full transcript text here...",
  "createdAt": "2024-01-15T10:35:00Z"
}
```

**Response (if processing):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "callSid": "CA123...",
  "transcriptId": "TR123...",
  "status": "processing",
  "message": "Transcript is being processed"
}
```

---

### 6. GET /api/calls/stats/summary
Get campaign call statistics

**Query Parameters:**
- `campaignId` (optional): Filter by campaign
- `startDate` (optional): ISO date start
- `endDate` (optional): ISO date end

**Response:**
```json
{
  "totalCalls": 100,
  "completedCalls": 95,
  "failedCalls": 5,
  "totalDuration": 12000,
  "averageDuration": 120
}
```

---

## Webhook Configuration

### Twilio Console Setup

1. Log in to Twilio Console: https://console.twilio.com
2. Navigate to: Phone Numbers > Manage > Your Number
3. Configure Voice Webhook:
   - URL: `https://your-api-domain.com/api/webhooks/twilio`
   - Method: HTTP POST
4. Save configuration

### Webhook Events Handled

- **Call Ringing**: Call is ringing at recipient
- **Call Answered**: Call was answered by recipient
- **Call Completed**: Call ended (duration recorded)
- **Recording Ready**: Recording is available and ready for download

---

## Setup Steps

### 1. Create Database Table

Run this SQL in your Supabase project:

```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountId UUID NOT NULL,
  twilio_call_sid TEXT NOT NULL UNIQUE,
  to TEXT NOT NULL,
  from TEXT NOT NULL,
  status TEXT NOT NULL,
  duration INTEGER,
  startTime TIMESTAMP,
  endTime TIMESTAMP,
  recordingSid TEXT,
  transcriptId TEXT,
  transcript TEXT,
  campaignId UUID,
  metadata JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calls_accountId ON calls(accountId);
CREATE INDEX idx_calls_campaignId ON calls(campaignId);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_twilio_sid ON calls(twilio_call_sid);
```

### 2. Set Environment Variables

Add to your `.env` file:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14155551234
TWILIO_WEBHOOK_SECRET=optional_webhook_secret
API_BASE_URL=https://your-api-domain.com
```

### 3. Verify Integration

Check that routes are registered:

```bash
grep -n "callRoutes" /home/user/voxmation/server/index.ts
# Should output:
# 19:import callRoutes from "./routes/calls";
# 289:app.use("/api/calls", callRoutes);
```

### 4. Test the API

```bash
# Make a simple call
curl -X POST http://localhost:3001/api/calls/make \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": "+14155552671"}'

# Expected: 201 response with call details
```

### 5. Run Tests

```bash
npm test -- calls.test.ts
# Should pass 40+ tests
```

---

## Architecture Overview

```
Client Application
    ↓
POST /api/calls/make
GET /api/calls
GET /api/calls/:id
GET /api/calls/:id/recording
GET /api/calls/:id/transcript
GET /api/calls/stats/summary
    ↓
Express Router (calls.ts)
    ↓
┌─────────────────┐        ┌──────────────┐
│ Twilio SDK      │        │ Supabase     │
│ (Call Control)  │        │ (Storage)    │
└─────────────────┘        └──────────────┘
    ↓
Twilio Cloud
(Call Execution)
    ↓ (Webhooks)
POST /api/webhooks/twilio
    ↓
Update Call Status
```

---

## Security Features

### Authentication
- All endpoints require Bearer token authentication
- Tokens validated via tenant middleware
- Account isolation enforced at query level

### Authorization
- Role-based access control (admin, agent, manager)
- Statistics endpoint requires admin/manager role
- Other endpoints require admin/agent/manager role

### Data Isolation
- Each call filtered by accountId
- Users can only access their account's calls
- SQL queries include accountId in WHERE clause

### Input Validation
- Phone number format validation (E.164)
- Required field validation
- Query parameter sanitization

---

## Example Usage

### Simple Call
```javascript
const response = await fetch('http://localhost:3001/api/calls/make', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN' },
  body: JSON.stringify({ to: '+14155552671' })
});
const call = await response.json();
console.log(`Call ID: ${call.id}`);
```

### Batch Calls
```javascript
const contacts = ['+14155552671', '+14155552672', '+14155552673'];
const calls = await Promise.all(
  contacts.map(phone =>
    fetch('http://localhost:3001/api/calls/make', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer TOKEN' },
      body: JSON.stringify({ to: phone, campaignId: 'campaign-123' })
    }).then(r => r.json())
  )
);
```

### Poll for Completion
```javascript
let call;
while (true) {
  const response = await fetch(`http://localhost:3001/api/calls/${callId}`, {
    headers: { 'Authorization': 'Bearer TOKEN' }
  });
  call = await response.json();
  
  if (call.status === 'completed') break;
  await new Promise(r => setTimeout(r, 2000));
}
```

---

## Troubleshooting

### Calls Not Initiating
- Verify Twilio credentials in environment
- Ensure phone number is in E.164 format
- Check account has Twilio credits

### Webhook Not Firing
- Verify webhook URL in Twilio Console
- Ensure API is accessible from internet
- Check firewall rules allow Twilio IPs

### Recording Not Available
- Ensure `record: true` when initiating call
- Wait 5-15 seconds for processing
- Check Twilio console for errors

### Database Errors
- Verify `calls` table exists
- Check Supabase connection
- Review server logs

---

## Documentation Files

| File | Purpose |
|------|---------|
| `/server/docs/CALL_MANAGEMENT.md` | Complete API reference with examples |
| `/server/routes/calls.examples.ts` | 12 ready-to-run code examples |
| `/server/tests/calls.test.ts` | Test suite with 40+ tests |
| `/CALLS_API_README.md` | Implementation guide |
| `/CALL_MANAGEMENT_SETUP.md` | This file - Setup and verification |

---

## Support

### Documentation
- Full API docs: `/server/docs/CALL_MANAGEMENT.md`
- Examples: `/server/routes/calls.examples.ts`
- Tests: `/server/tests/calls.test.ts`

### Integration
- Existing Twilio SDK: `/server/integrations/twilio.ts`
- Webhook handler: `/server/routes/webhooks.ts`
- Auth middleware: `/server/middleware/tenantMiddleware.ts`

---

## Implementation Checklist

- [x] Core endpoints implemented (6 endpoints)
- [x] Database schema defined
- [x] Webhook integration configured
- [x] Authentication & authorization
- [x] Error handling
- [x] Comprehensive documentation (800+ lines)
- [x] Usage examples (12 examples)
- [x] Test suite (40+ tests)
- [x] Tenant isolation
- [x] Performance optimization
- [x] Security review
- [x] Server integration

---

## Summary

The Call Management API is fully implemented and ready for use. All 6 endpoints are available, fully documented, and tested. The system integrates with the existing Twilio SDK, webhook handlers, and authentication middleware.

To get started:
1. Create the database table
2. Set environment variables
3. Configure Twilio webhooks
4. Test with provided examples
5. Deploy to production

Total implementation: 2,500+ lines of code and documentation.
