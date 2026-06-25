# Call Management Endpoints Documentation

## Overview

The Call Management API provides comprehensive endpoints for managing voice calls through Twilio integration. It handles call initiation, status tracking, recording management, and transcription storage.

## Architecture

### Components

1. **Call Routes** (`/server/routes/calls.ts`)
   - Express router handling HTTP requests
   - Tenant-aware operations via middleware
   - Integration with Twilio SDK

2. **Twilio Integration** (`/server/integrations/twilio.ts`)
   - Call initiation and management
   - Recording retrieval
   - Webhook event handling

3. **Webhook Handler** (`/server/routes/webhooks.ts`)
   - Receives Twilio events (call status, recordings)
   - Updates database with event data
   - Triggers handlers for specific events

### Database Schema

Calls table structure:
```typescript
{
  id: string;                      // UUID, primary key
  accountId: string;               // Tenant identifier
  twilio_call_sid: string;         // Twilio call identifier
  to: string;                      // Recipient phone number
  from: string;                    // Sender phone number
  status: string;                  // queued, ringing, in-progress, completed, failed
  duration?: number;               // Duration in seconds
  startTime?: string;              // ISO timestamp when answered
  endTime?: string;                // ISO timestamp when completed
  recordingSid?: string;           // Twilio recording identifier
  transcriptId?: string;           // Reference to transcript
  transcript?: string;             // Transcript text (if available)
  campaignId?: string;             // Associated campaign
  metadata?: Record<string, any>;  // Custom metadata
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}
```

## API Endpoints

### 1. Initiate a Call

**Endpoint:** `POST /api/calls/make`

**Authentication:** Required (role: admin, agent, manager)

**Request Body:**
```typescript
{
  to: string;                              // Required: recipient phone number (E.164 format)
  from?: string;                           // Optional: sender number (defaults to TWILIO_PHONE_NUMBER)
  campaignId?: string;                     // Optional: associated campaign ID
  twimlUrl?: string;                       // Optional: TwiML application URL for IVR
  record?: boolean;                        // Optional: record the call (default: false)
  recordingChannels?: "mono" | "stereo" | "both";  // Optional: recording channels
  statusCallback?: string;                 // Optional: status callback URL
  metadata?: Record<string, string>;       // Optional: custom metadata
}
```

**Response (201 Created):**
```typescript
{
  id: string;                    // Call ID
  twilio_call_sid: string;       // Twilio call SID
  to: string;                    // Recipient number
  from: string;                  // Sender number
  status: string;                // Initial status (usually "queued")
  campaignId?: string;           // Associated campaign
  createdAt: string;             // Timestamp
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/calls/make \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "to": "+14155552671",
    "from": "+14155551234",
    "campaignId": "campaign-123",
    "record": true,
    "metadata": {
      "callType": "outreach",
      "priority": "high"
    }
  }'
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing required field | to parameter is required |
| 400 | Invalid phone number format | Phone number doesn't match E.164 |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | User lacks required role |
| 500 | Failed to initiate call | Twilio API error |

---

### 2. List Calls

**Endpoint:** `GET /api/calls`

**Authentication:** Required (role: admin, agent, manager)

**Query Parameters:**
```typescript
{
  campaignId?: string;           // Filter by campaign ID
  status?: string;               // Filter by status (queued, ringing, in-progress, completed, failed)
  limit?: string;                // Results per page (default: 50, max: 200)
  offset?: string;               // Pagination offset (default: 0)
}
```

**Response (200 OK):**
```typescript
{
  calls: CallRecord[];
  pagination: {
    total: number;               // Total matching records
    limit: number;               // Page size
    offset: number;              // Current offset
  }
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/calls?campaignId=campaign-123&status=completed&limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Filtering Examples:**
```bash
# All completed calls
GET /api/calls?status=completed

# Calls for specific campaign
GET /api/calls?campaignId=campaign-123

# Pagination
GET /api/calls?limit=25&offset=50

# Combined filters
GET /api/calls?campaignId=campaign-123&status=in-progress&limit=50
```

---

### 3. Get Call Details

**Endpoint:** `GET /api/calls/:id`

**Authentication:** Required (role: admin, agent, manager)

**URL Parameters:**
```typescript
{
  id: string;                    // Call ID
}
```

**Response (200 OK):**
```typescript
{
  id: string;
  accountId: string;
  twilio_call_sid: string;
  to: string;
  from: string;
  status: string;                // Live status from Twilio
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
```

**Features:**
- Fetches live status from Twilio for in-progress calls
- Returns cached database record if Twilio unavailable
- Includes all call metadata and recordings

**Example Request:**
```bash
curl -X GET http://localhost:3001/api/calls/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | Call not found | Call ID doesn't exist or belongs to different account |
| 401 | Unauthorized | Missing or invalid token |

---

### 4. Get Call Recording

**Endpoint:** `GET /api/calls/:id/recording`

**Authentication:** Required (role: admin, agent, manager)

**URL Parameters:**
```typescript
{
  id: string;                    // Call ID
}
```

**Response (200 OK):**
```typescript
{
  recordingSid: string;          // Twilio recording ID
  callSid: string;               // Twilio call ID
  duration: number;              // Duration in seconds
  channels: number;              // Number of audio channels
  dateCreated: string;           // ISO timestamp
  downloadUrl: string;           // Direct download link (MP3)
  mediaUrl: string;              // Media URL for streaming
}
```

**Features:**
- Returns direct download and streaming URLs
- Supports MP3 format (default) or WAV
- Live retrieval from Twilio Storage

**Example Request:**
```bash
curl -X GET http://localhost:3001/api/calls/550e8400-e29b-41d4-a716-446655440000/recording \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | Call not found | Call ID doesn't exist |
| 404 | No recording found | Call wasn't recorded |
| 500 | Failed to fetch recording | Twilio API error |

---

### 5. Get Call Transcript

**Endpoint:** `GET /api/calls/:id/transcript`

**Authentication:** Required (role: admin, agent, manager)

**URL Parameters:**
```typescript
{
  id: string;                    // Call ID
}
```

**Response (200 OK):**
```typescript
// If transcript available:
{
  id: string;
  callSid: string;
  transcript: string;            // Full transcript text
  createdAt: string;
}

// If transcription in progress:
{
  id: string;
  callSid: string;
  transcriptId: string;          // Reference ID
  status: "processing";
  message: "Transcript is being processed"
}
```

**Features:**
- Returns stored transcript if available
- Shows processing status for in-progress transcriptions
- Ready for integration with Deepgram, AssemblyAI, etc.

**Example Request:**
```bash
curl -X GET http://localhost:3001/api/calls/550e8400-e29b-41d4-a716-446655440000/transcript \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | Call not found | Call ID doesn't exist |
| 404 | No transcript available | Call has no transcript yet |

---

### 6. Get Call Statistics

**Endpoint:** `GET /api/calls/stats/summary`

**Authentication:** Required (role: admin, manager)

**Query Parameters:**
```typescript
{
  campaignId?: string;           // Filter by campaign
  startDate?: string;            // ISO date start
  endDate?: string;              // ISO date end
}
```

**Response (200 OK):**
```typescript
{
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  totalDuration: number;         // Total seconds
  averageDuration: number;       // Average seconds
}
```

**Example Request:**
```bash
# All calls for today
curl -X GET "http://localhost:3001/api/calls/stats/summary" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Specific campaign
curl -X GET "http://localhost:3001/api/calls/stats/summary?campaignId=campaign-123" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Date range
curl -X GET "http://localhost:3001/api/calls/stats/summary?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Webhook Events

### Webhook Endpoint

**Endpoint:** `POST /api/webhooks/twilio`

**Authentication:** None required (Twilio sends unauthenticated requests)

**Description:** Receives real-time events from Twilio about call and recording status changes.

### Event Types

#### 1. Call Ringing

**When:** Call is in "ringing" state (phone ringing, waiting for answer)

**Payload (Form-encoded):**
```
CallSid=CA123...
AccountSid=AC123...
From=%2B14155551234
To=%2B14155552671
CallStatus=ringing
Direction=outbound-api
QueueTime=1234
Timestamp=<ISO 8601>
```

**Handler:**
```typescript
onCallRinging: async (event: CallWebhookEvent) => {
  // Database updated with status: "ringing"
  // Useful for triggering UI notifications
}
```

#### 2. Call Answered

**When:** Call is answered (recipient picks up)

**Payload:**
```
CallSid=CA123...
CallStatus=answered
From=%2B14155551234
To=%2B14155552671
Direction=outbound-api
Timestamp=<ISO 8601>
```

**Handler:**
```typescript
onCallAnswered: async (event: CallWebhookEvent) => {
  // Database updated with status: "in-progress"
  // startTime recorded
  // Can trigger recording start, call greeting, etc.
}
```

#### 3. Call Completed

**When:** Call ends (either party hangs up)

**Payload:**
```
CallSid=CA123...
CallStatus=completed
From=%2B14155551234
To=%2B14155552671
CallDuration=125
Direction=outbound-api
RecordingSid=RE123... (if recorded)
RecordingUrl=https://api.twilio.com/... (if recorded)
Timestamp=<ISO 8601>
```

**Handler:**
```typescript
onCallCompleted: async (event: CallWebhookEvent) => {
  // Database updated with:
  //   - status: "completed"
  //   - duration: 125 seconds
  //   - endTime: timestamp
  //   - recordingSid (if available)
}
```

#### 4. Recording Ready

**When:** Call recording is processed and available

**Payload:**
```
RecordingSid=RE123...
CallSid=CA123...
AccountSid=AC123...
RecordingUrl=https://api.twilio.com/.../Recordings/RE123.mp3
RecordingDuration=125
RecordingChannels=1
RecordingStatus=completed
Timestamp=<ISO 8601>
```

**Handler:**
```typescript
onRecordingReady: async (event: RecordingReadyWebhookEvent) => {
  // Database updated with recordingSid
  // Can trigger:
  //   - Transcription job
  //   - Recording analysis
  //   - Archive to S3/GCS
}
```

### Webhook Configuration in Twilio

1. **Console Setup:**
   - Log in to Twilio Console
   - Navigate to: Voice > Manage > Numbers > Your Number
   - Set Voice webhook URL: `https://your-api-domain.com/api/webhooks/twilio`
   - Method: HTTP POST

2. **Test Webhook:**
   ```bash
   curl -X POST http://localhost:3001/api/webhooks/twilio \
     -d "CallSid=CA123&CallStatus=completed&From=%2B14155551234&To=%2B14155552671&CallDuration=120"
   ```

3. **Verify Webhook Health:**
   ```bash
   curl http://localhost:3001/api/webhooks/health
   ```

---

## Integration Examples

### Complete Call Flow

```typescript
// 1. Initiate call
const callResponse = await fetch('http://localhost:3001/api/calls/make', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN' },
  body: JSON.stringify({
    to: '+14155552671',
    record: true,
    campaignId: 'campaign-123'
  })
});
const { id, twilio_call_sid } = await callResponse.json();

// 2. Poll for completion
const checkCall = async () => {
  const response = await fetch(`http://localhost:3001/api/calls/${id}`, {
    headers: { 'Authorization': 'Bearer TOKEN' }
  });
  const call = await response.json();
  
  if (call.status === 'completed') {
    return call;
  }
  
  // Check again in 5 seconds
  await new Promise(r => setTimeout(r, 5000));
  return checkCall();
};

const completedCall = await checkCall();
console.log(`Call duration: ${completedCall.duration}s`);

// 3. Get recording (if available)
if (completedCall.recordingSid) {
  const recordingResponse = await fetch(
    `http://localhost:3001/api/calls/${id}/recording`,
    { headers: { 'Authorization': 'Bearer TOKEN' } }
  );
  const recording = await recordingResponse.json();
  console.log(`Recording URL: ${recording.downloadUrl}`);
}
```

### Batch Call Initiator

```typescript
async function initiateCampaignCalls(campaignId: string, contacts: Array<{name: string, phone: string}>) {
  const calls = await Promise.all(
    contacts.map(contact =>
      fetch('http://localhost:3001/api/calls/make', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer TOKEN' },
        body: JSON.stringify({
          to: contact.phone,
          campaignId,
          record: true,
          metadata: { contactName: contact.name }
        })
      }).then(r => r.json())
    )
  );
  
  return calls;
}
```

### Real-time Call Monitoring

```typescript
async function monitorCallStats(campaignId: string) {
  const response = await fetch(
    `http://localhost:3001/api/calls/stats/summary?campaignId=${campaignId}`,
    { headers: { 'Authorization': 'Bearer TOKEN' } }
  );
  
  const stats = await response.json();
  console.log(`
    Total Calls: ${stats.totalCalls}
    Completed: ${stats.completedCalls}
    Failed: ${stats.failedCalls}
    Average Duration: ${stats.averageDuration}s
  `);
}
```

---

## Environment Configuration

Required environment variables:

```bash
# Twilio Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14155551234

# Optional: Webhook Secret (for additional security)
TWILIO_WEBHOOK_SECRET=your_webhook_secret

# API Base URL (for status/recording callbacks)
API_BASE_URL=https://your-api-domain.com
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Missing Twilio credentials | ENV vars not set | Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN |
| Invalid phone number | Wrong format | Use E.164 format: +14155552671 |
| Call failed | Network issue, invalid number | Check phone number validity |
| Recording not found | Call wasn't recorded | Enable record: true when initiating |
| Permission denied | Insufficient role | User needs admin, agent, or manager role |

### Retry Strategy

For production reliability:

```typescript
async function makeCallWithRetry(
  options: CreateCallRequest,
  maxRetries = 3
): Promise<CallResponse> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await makeCall(options);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Security Considerations

### Authentication
- All endpoints require Bearer token authentication
- Tokens validated via tenant middleware
- Account isolation via accountId

### Tenant Isolation
- Calls filtered by accountId (tenant)
- Users can only access their own calls
- Cannot retrieve calls from other accounts

### Phone Numbers
- Stored as plain text (suitable for VoIP apps)
- Consider encryption for HIPAA/PCI compliance
- Validate format before processing

### Recording Access
- Recording URLs generated on-demand
- No direct storage - streams from Twilio
- Consider additional auth for sensitive calls

### Webhook Security
- Twilio webhooks in production should use signed URLs
- Implement request verification middleware if needed
- Rate limit webhook endpoint in production

---

## Troubleshooting

### Webhook Not Firing

1. **Check Twilio Configuration:**
   ```bash
   # In Twilio Console, verify:
   # Voice > Manage > Numbers > [Your Number] > Voice Webhook URL
   # Should point to: https://your-domain.com/api/webhooks/twilio
   ```

2. **Enable Webhook Logs:**
   ```bash
   # Add to calls.ts
   console.log(`[Calls Webhook] Received event:`, body);
   ```

3. **Test Webhook Manually:**
   ```bash
   curl -X POST http://localhost:3001/api/webhooks/twilio \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "CallSid=CA123&CallStatus=ringing&From=%2B14155551234&To=%2B14155552671&Direction=outbound-api"
   ```

### Recording Not Available

1. **Verify Record Setting:**
   - Ensure `record: true` in API call
   - Check Twilio logs for recording errors

2. **Check Recording Status:**
   ```bash
   curl http://localhost:3001/api/calls/{id}/recording \
     -H "Authorization: Bearer TOKEN"
   ```

3. **Wait for Processing:**
   - Recordings take 5-15 seconds to process
   - Implement polling with exponential backoff

### Call Status Not Updating

1. **Verify Webhook Receipt:**
   ```bash
   # Check server logs for webhook entries
   grep "Twilio Webhook" application.log
   ```

2. **Check Database Connectivity:**
   - Verify Supabase connection
   - Check logs for database errors

3. **Manual Status Update:**
   ```bash
   curl -X GET http://localhost:3001/api/calls/{id} \
     -H "Authorization: Bearer TOKEN"
   # Endpoint fetches live status from Twilio
   ```

---

## Performance Optimization

### Caching Strategy
- Recent calls cached in-memory
- Database source of truth
- Cache invalidated on status updates

### Pagination
- Default limit: 50 records
- Max limit: 200 records
- Offset-based pagination

### Query Optimization
- Filter by campaignId to reduce result set
- Use status filter for specific states
- Implement date range filters for analytics

---

## Future Enhancements

1. **Transcription Integration**
   - Auto-transcribe via Deepgram/AssemblyAI
   - Store and search transcripts
   - Sentiment analysis

2. **Advanced Analytics**
   - Call duration patterns
   - Success rate by campaign/contact
   - Cost analysis

3. **Call Recording**
   - Archive to S3/GCS
   - Encryption at rest
   - Retention policies

4. **IVR Integration**
   - TwiML application templates
   - Dynamic IVR routing
   - Call transfer support

5. **Compliance**
   - TCPA compliance validation
   - Call recording consent tracking
   - Audit logging
