# Call Management API - Implementation Guide

## Overview

The Call Management API provides a complete solution for managing voice calls through Twilio integration. It includes endpoints for initiating calls, tracking their status, retrieving recordings, and managing transcripts.

## What's Included

### 1. Core Implementation Files

#### `/server/routes/calls.ts` (640+ lines)
Main route handler for all call management endpoints:
- **POST /api/calls/make** - Initiate outbound calls
- **GET /api/calls** - List calls with filtering and pagination
- **GET /api/calls/:id** - Get detailed call information
- **GET /api/calls/:id/recording** - Retrieve call recording
- **GET /api/calls/:id/transcript** - Get call transcript
- **GET /api/calls/stats/summary** - Campaign statistics

Features:
- Tenant-aware operations (account isolation)
- Role-based access control
- Real-time status updates from Twilio
- In-memory caching for performance
- Comprehensive error handling

#### `/server/routes/calls.examples.ts` (400+ lines)
12 complete usage examples:
1. Simple outbound call
2. Call with recording
3. Batch campaign calls
4. Poll for completion
5. Retrieve recording
6. Get transcript
7. List calls with pagination
8. Campaign statistics
9. Filter by status
10. Complete workflow
11. Error handling & retry logic
12. Real-time monitoring

#### `/server/routes/calls.test.ts` (300+ lines)
Comprehensive test suite covering:
- Call initiation with validation
- Listing and filtering
- Status retrieval
- Recording management
- Transcript access
- Statistics
- Error handling
- Tenant isolation
- Role-based access

#### `/server/docs/CALL_MANAGEMENT.md` (800+ lines)
Detailed API documentation including:
- Architecture overview
- Complete endpoint reference
- Webhook event documentation
- Integration examples
- Configuration guide
- Troubleshooting section
- Performance optimization tips

### 2. Integration Points

#### Existing Integration
The implementation integrates with existing Voxmation infrastructure:

- **Twilio Integration** (`/server/integrations/twilio.ts`)
  - Already has all required functions
  - Webhook handlers configured
  - Call and recording management

- **Webhook Handler** (`/server/routes/webhooks.ts`)
  - Twilio webhooks already registered
  - Call status events handled
  - Recording ready events processed

- **Database** (Supabase)
  - Calls table for storing call records
  - Call status tracking
  - Recording metadata

- **Authentication** (Tenant Middleware)
  - Account isolation via accountId
  - Role-based access control
  - User authentication

### 3. Database Schema

Required table in Supabase:

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

## Quick Start

### 1. Install Dependencies

All required dependencies are already in your project:
```bash
npm install twilio express uuid
```

### 2. Set Environment Variables

```bash
# .env or environment configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14155551234
TWILIO_WEBHOOK_SECRET=optional_webhook_secret

# API Configuration
API_BASE_URL=https://your-api-domain.com
PORT=3001
```

### 3. Create Database Table

Run the SQL schema above in Supabase SQL editor.

### 4. Start Using the API

#### Simple Call
```bash
curl -X POST http://localhost:3001/api/calls/make \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+14155552671",
    "campaignId": "campaign-123",
    "record": true
  }'
```

#### Check Call Status
```bash
curl http://localhost:3001/api/calls/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Recording
```bash
curl http://localhost:3001/api/calls/550e8400-e29b-41d4-a716-446655440000/recording \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Endpoints Summary

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/api/calls/make` | Initiate call | Bearer + Role |
| GET | `/api/calls` | List calls | Bearer + Role |
| GET | `/api/calls/:id` | Get details | Bearer + Role |
| GET | `/api/calls/:id/recording` | Get recording | Bearer + Role |
| GET | `/api/calls/:id/transcript` | Get transcript | Bearer + Role |
| GET | `/api/calls/stats/summary` | Get statistics | Bearer + Admin |

## Webhook Setup

### Twilio Console Configuration

1. Log in to Twilio Console
2. Navigate to: Phone Numbers > Manage > Your Number
3. Set Voice Webhook URL to: `https://your-api.com/api/webhooks/twilio`
4. Method: HTTP POST
5. Save

### Test Webhook
```bash
curl -X POST http://localhost:3001/api/webhooks/twilio \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=CA123&CallStatus=completed&From=%2B14155551234&To=%2B14155552671&CallDuration=120"
```

### Webhook Events Handled

- **Call Ringing** - Call is ringing at recipient
- **Call Answered** - Call was answered
- **Call Completed** - Call ended
- **Recording Ready** - Recording is available

## Common Use Cases

### 1. One-Time Call
```typescript
const response = await fetch('http://localhost:3001/api/calls/make', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN' },
  body: JSON.stringify({ to: '+14155552671' })
});
const call = await response.json();
```

### 2. Campaign Calls
```typescript
const campaigns = ['contact1', 'contact2', 'contact3'];
const calls = await Promise.all(
  contacts.map(phone =>
    fetch('http://localhost:3001/api/calls/make', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer TOKEN' },
      body: JSON.stringify({
        to: phone,
        campaignId: 'campaign-123',
        record: true
      })
    }).then(r => r.json())
  )
);
```

### 3. Real-time Monitoring
```typescript
// Poll for call completion
while (true) {
  const response = await fetch(`http://localhost:3001/api/calls/${callId}`, {
    headers: { 'Authorization': 'Bearer TOKEN' }
  });
  const call = await response.json();
  
  if (call.status === 'completed') {
    console.log(`Call completed: ${call.duration}s`);
    break;
  }
  
  await new Promise(r => setTimeout(r, 2000));
}
```

## Testing

### Run Tests
```bash
npm test -- calls.test.ts
```

### Test Coverage
- Call initiation validation
- Listing and filtering
- Error handling
- Tenant isolation
- Role-based access
- Status tracking
- Recording retrieval

## Security Considerations

### Authentication
- All endpoints require Bearer token
- Tokens validated via middleware
- Account isolation enforced

### Tenant Isolation
- Calls filtered by accountId
- Users can't access other accounts
- SQL queries include accountId filter

### Phone Numbers
- Stored as plain text (acceptable for VoIP)
- Consider encryption for sensitive use cases
- E.164 format validation

### Webhooks
- No authentication required (Twilio limitation)
- Consider rate limiting in production
- All webhook data logged with timestamps

## Troubleshooting

### Calls Not Initiating
1. Check Twilio credentials in environment
2. Verify phone number format (E.164)
3. Ensure account has Twilio credits

### Webhook Not Firing
1. Verify webhook URL in Twilio Console
2. Check API is accessible from internet
3. Enable webhook logs in Twilio

### Recording Not Available
1. Ensure `record: true` in API call
2. Wait 5-15 seconds for processing
3. Check Twilio console for errors

### Database Issues
1. Verify Supabase connection
2. Check `calls` table exists
3. Review server logs for DB errors

## Performance Tips

1. **Use Pagination**
   - Default 50 results, max 200
   - Use offset/limit for large datasets

2. **Implement Caching**
   - Recent calls cached in-memory
   - Cache invalidated on updates

3. **Filter Efficiently**
   - Filter by campaignId to reduce results
   - Use status filter for specific states

4. **Polling Strategy**
   - Use exponential backoff
   - Maximum 30-second timeout
   - 2-5 second poll interval

## Future Enhancements

1. **Auto-Transcription**
   - Integrate Deepgram or AssemblyAI
   - Auto-generate transcripts

2. **Advanced Analytics**
   - Call duration analysis
   - Success rates by time/contact
   - Cost tracking

3. **IVR Support**
   - TwiML application templates
   - Dynamic routing
   - Call transfer

4. **Compliance**
   - TCPA validation
   - Recording consent
   - Audit logging

## Support and Documentation

- **Full API Documentation**: `/server/docs/CALL_MANAGEMENT.md`
- **Code Examples**: `/server/routes/calls.examples.ts`
- **Test Suite**: `/server/tests/calls.test.ts`
- **Integration Examples**: See "Common Use Cases" section

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 Express Call Routes                          │
│  (/api/calls/make, /api/calls, /api/calls/:id, etc)        │
└─────────────────────────────────────────────────────────────┘
                    ↙               ↘
         ┌──────────────────┐    ┌──────────────────┐
         │  Twilio SDK      │    │  Supabase        │
         │  (Call Control)  │    │  (Storage)       │
         └──────────────────┘    └──────────────────┘
                              ↓
         ┌──────────────────────────────────────┐
         │         Twilio Cloud                 │
         │  (Call Execution, Webhooks)         │
         └──────────────────────────────────────┘
```

## File Structure

```
server/
├── routes/
│   ├── calls.ts                 # Main endpoints
│   ├── calls.examples.ts        # Usage examples
│   └── webhooks.ts              # Webhook handlers
├── tests/
│   └── calls.test.ts            # Test suite
├── integrations/
│   └── twilio.ts                # Twilio SDK wrapper
├── docs/
│   └── CALL_MANAGEMENT.md       # Full documentation
└── index.ts                     # Server entry point
```

## Next Steps

1. **Set up environment variables** - Configure Twilio credentials
2. **Create database table** - Run SQL schema in Supabase
3. **Configure webhooks** - Set Twilio webhook URL
4. **Test endpoints** - Use examples to verify setup
5. **Implement integration** - Add to your application
6. **Monitor in production** - Set up logging and alerts

## License

Part of Voxmation platform.
