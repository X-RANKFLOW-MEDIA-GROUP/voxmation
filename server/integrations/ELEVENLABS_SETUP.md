# ElevenLabs Setup Guide

Complete setup instructions for integrating ElevenLabs voice generation with Twilio.

## Prerequisites

- Node.js 18+ installed
- Active ElevenLabs account
- Active Twilio account (see TWILIO_README.md for Twilio setup)
- API keys for both services

## Step 1: Create ElevenLabs Account

1. **Sign Up**
   - Visit https://elevenlabs.io
   - Click "Sign Up" button
   - Create account with email/password or Google/Microsoft SSO

2. **Verify Email**
   - Check your email for verification link
   - Click to verify your account

3. **Complete Profile**
   - Add your name and organization
   - Select your use case

## Step 2: Get API Key

1. **Access API Settings**
   - Log in to https://elevenlabs.io
   - Click on your profile icon (top right)
   - Select "Profile" or "Account"
   - Find "API Key" section

2. **Generate/Copy API Key**
   - Click "Generate New API Key" if needed
   - Copy the key (you won't see it again)
   - Save in secure location

3. **Test API Key**
   ```bash
   curl https://api.elevenlabs.io/v1/user \
     -H "xi-api-key: YOUR_API_KEY_HERE"
   ```

## Step 3: Configure Environment Variables

1. **Create .env file** (if not exists)
   ```bash
   cp .env.example .env
   ```

2. **Add ElevenLabs configuration**
   ```env
   # ElevenLabs Configuration
   ELEVENLABS_API_KEY=sk_...your_api_key...
   ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
   ELEVENLABS_MODEL_ID=eleven_monolingual_v1

   # Twilio Configuration (already set up)
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1...
   ```

3. **Secure the .env file**
   ```bash
   # Ensure .env is not committed
   echo ".env" >> .gitignore
   ```

## Step 4: Verify Voice Availability

### List Available Voices

```bash
curl https://api.elevenlabs.io/v1/voices \
  -H "xi-api-key: YOUR_API_KEY_HERE"
```

Response example:
```json
{
  "voices": [
    {
      "voice_id": "21m00Tcm4TlvDq8ikWAM",
      "name": "Rachel",
      "category": "premade"
    }
  ]
}
```

### Voice Options

| Voice ID | Name | Category | Best For |
|----------|------|----------|----------|
| 21m00Tcm4TlvDq8ikWAM | Rachel | Premade | Friendly, customer service |
| EXAVITQu4vr4xnSDxMaL | Bella | Premade | Professional, corporate |
| XB0fDUnXU5powFXDhCwa | Antoni | Premade | Warm, personal |
| MF3mGyEYCHffgLSD3ZeL | Elli | Premade | Energetic, sales |
| pFZP5JQG7iQjIQuC4Iy3 | Adam | Premade | Deep, authoritative |
| piTKgcLEGmPLHcj0ScPg | Sam | Premade | Expressive, engaging |

Note: Custom voices available with higher tier plans.

## Step 5: Test Basic Integration

### 1. Test Voice Generation

```typescript
import { ElevenLabsVoiceGenerator } from './server/integrations/elevenlabs';

const voiceGenerator = new ElevenLabsVoiceGenerator({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

async function test() {
  const result = await voiceGenerator.generateVoice({
    text: "Welcome to our service",
  });
  console.log("Generated audio:", result.audioBuffer?.length, "bytes");
}

test();
```

### 2. Test Voice List

```typescript
const voices = await voiceGenerator.getAvailableVoices();
console.log("Available voices:", voices.length);
voices.forEach(v => console.log(`- ${v.name} (${v.voice_id})`));
```

### 3. Test Account Info

```typescript
const info = await voiceGenerator.getAccountInfo();
console.log("Used:", info.character_count, "/", info.character_limit);
```

## Step 6: Integration with Twilio

### 1. Add Route to Express Server

```typescript
import express from 'express';
import { ElevenLabsVoiceGenerator, IVRMenuBuilder } from './integrations/elevenlabs';

const app = express();
const voiceGenerator = new ElevenLabsVoiceGenerator({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

// IVR menu endpoint
app.post('/voice/menu', async (req, res) => {
  try {
    const menu = new IVRMenuBuilder(voiceGenerator, {
      greeting: "Welcome to our service",
      items: [
        { key: "1", text: "Sales", prompt: "Press 1 for sales" },
        { key: "2", text: "Support", prompt: "Press 2 for support" },
      ],
      baseUrl: process.env.API_URL,
    });

    const response = await menu.buildCompleteMenu();
    res.type('application/xml');
    res.send(response.twiml);
  } catch (error) {
    console.error('Menu error:', error);
    res.status(500).send('Internal server error');
  }
});

app.listen(3000);
```

### 2. Configure Twilio Webhook

In Twilio console:
1. Go to Phone Numbers → Manage Numbers
2. Select your Twilio number
3. Under "Voice & Fax" → "Accept incoming calls" → "Webhook"
4. Set URL: `https://your-domain.com/voice/menu`
5. Method: `HTTP POST`
6. Save

## Step 7: Test End-to-End

### 1. Make Test Call

```bash
# Using Twilio CLI
twilio phone-calls create \
  --to=+1-555-0000 \
  --from=YOUR_TWILIO_NUMBER \
  --url=https://your-domain.com/voice/menu
```

### 2. Check Logs

```bash
# Server logs
tail -f server.log | grep voice

# Twilio logs
twilio debugger logs
```

## Step 8: Monitor Usage

### Check Character Usage

```typescript
const info = await voiceGenerator.getAccountInfo();
const percentUsed = (info.character_count / info.character_limit) * 100;
console.log(`Usage: ${percentUsed.toFixed(2)}%`);
```

### Set Up Alerts

```typescript
async function checkUsage() {
  const info = await voiceGenerator.getAccountInfo();
  
  if (info.character_count > info.character_limit * 0.8) {
    console.warn('Warning: 80% character limit reached');
    // Send alert to admin
  }
}

// Check daily
setInterval(checkUsage, 24 * 60 * 60 * 1000);
```

## Billing & Pricing

### ElevenLabs Plans

| Plan | Price | Characters | Best For |
|------|-------|-----------|----------|
| Free | $0 | 1,000/mo | Testing |
| Starter | $5/mo | 10,000/mo | Small projects |
| Creator | $99/mo | 500,000/mo | Production |
| Enterprise | Custom | Custom | High volume |

### Cost Estimation

- Average text: 50-100 characters
- Average call: 1,000-2,000 characters
- 1,000 calls/month = 1-2M characters needed

## Troubleshooting

### Issue: "401 Unauthorized"

**Cause:** Invalid or missing API key

**Solution:**
1. Verify API key in `.env` file
2. Check for extra spaces/newlines
3. Generate new key in ElevenLabs console
4. Restart server

```bash
# Test API key
curl https://api.elevenlabs.io/v1/user \
  -H "xi-api-key: $ELEVENLABS_API_KEY"
```

### Issue: "Character limit exceeded"

**Cause:** Monthly character allowance reached

**Solution:**
1. Check current usage:
```typescript
const info = await voiceGenerator.getAccountInfo();
console.log(info.character_count, "/", info.character_limit);
```

2. Upgrade plan at https://elevenlabs.io/pricing
3. Wait for monthly reset

### Issue: No Audio in Twilio Call

**Cause:** Audio URL not accessible or audio upload failed

**Solution:**
1. Test audio URL directly:
```bash
curl https://your-audio-url.com/audio.mp3
```

2. Implement upload handler:
```typescript
async function uploadHandler(buffer, filename) {
  // Upload to S3, Cloudinary, etc
  const url = await uploadToStorage(buffer, filename);
  return url;
}

await menu.buildCompleteMenu(uploadHandler);
```

3. Verify CORS if using CDN

### Issue: TwiML Parsing Error

**Cause:** Special characters in text not escaped

**Solution:**
```typescript
import { formatTextForVoice } from './integrations/elevenlabs';

const safeText = formatTextForVoice('Text with <special> & chars');
const result = await voiceGenerator.generateVoice({
  text: safeText,
});
```

### Issue: Timeout During Generation

**Cause:** Large text or API latency

**Solution:**
```typescript
// Increase timeout
const result = await Promise.race([
  voiceGenerator.generateVoice({ text }),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 30000)
  ),
]);
```

## Best Practices

### 1. Cache Generated Audio
```typescript
const cache = new Map<string, string>();

async function getCachedVoice(text) {
  if (cache.has(text)) return cache.get(text);
  
  const result = await voiceGenerator.generateVoice({ text });
  cache.set(text, result.audioUrl);
  return result.audioUrl;
}
```

### 2. Batch Process
```typescript
// Generate multiple prompts efficiently
const prompts = ["Option 1", "Option 2", "Option 3"];
const results = await Promise.all(
  prompts.map(p => voiceGenerator.generateVoice({ text: p }))
);
```

### 3. Monitor Limits
```typescript
async function ensureAvailable(requiredChars) {
  const info = await voiceGenerator.getAccountInfo();
  const available = info.character_limit - info.character_count;
  
  if (available < requiredChars) {
    throw new Error('Insufficient character limit');
  }
}
```

### 4. Error Handling
```typescript
try {
  const result = await voiceGenerator.generateVoice({ text });
} catch (error) {
  if (error.message.includes('401')) {
    console.error('API key invalid');
  } else if (error.message.includes('429')) {
    console.error('Rate limited - wait before retry');
  } else {
    console.error('Other error:', error);
  }
}
```

## Security Checklist

- [ ] API key stored in `.env`, not in code
- [ ] `.env` added to `.gitignore`
- [ ] API key rotated every 90 days
- [ ] Rate limiting implemented on endpoints
- [ ] HTTPS enforced for all webhook endpoints
- [ ] Twilio webhook signature verification enabled
- [ ] Input validation on all user text
- [ ] Audio files cleaned up after expiration
- [ ] Sensitive voice data logged carefully
- [ ] Access logs monitored for suspicious activity

## Next Steps

1. **Run Examples**
   ```bash
   npm run dev
   tsx server/integrations/elevenlabs-examples.ts
   ```

2. **Create Custom Routes**
   - Implement IVR menu for your use case
   - Add DTMF handlers
   - Set up callback handlers

3. **Deploy**
   - Set production environment variables
   - Configure webhooks for production URL
   - Monitor usage and costs
   - Set up alerts

4. **Optimize**
   - Implement caching strategy
   - Monitor character usage
   - Analyze call patterns
   - Fine-tune voice selections

## Support Resources

- **ElevenLabs Docs:** https://elevenlabs.io/docs
- **ElevenLabs Status:** https://status.elevenlabs.io
- **Twilio Voice Docs:** https://www.twilio.com/docs/voice
- **TwiML Reference:** https://www.twilio.com/docs/voice/twiml
- **Community Support:** https://community.elevenlabs.io

## Additional Integration Examples

See `elevenlabs-examples.ts` for complete working examples including:
- Simple greeting system
- Interactive menu with routing
- Voicemail system
- Payment confirmation
- Call transfer
- Customer surveys
- Emergency announcements
- Multi-language support
- Complex routing menus

## License

This integration is part of Voxmation and follows the project's license terms.
