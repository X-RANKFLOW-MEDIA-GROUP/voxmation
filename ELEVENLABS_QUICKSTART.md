# ElevenLabs Integration - Quick Start Guide

Get up and running with ElevenLabs voice integration in 5 minutes.

## TL;DR

```bash
# 1. Set API key
echo "ELEVENLABS_API_KEY=your_key" >> .env

# 2. Run server
npm run dev

# 3. Test endpoint
curl -X GET http://localhost:3000/voice/health

# 4. Make a call (Twilio)
# Configure webhook to: https://your-domain.com/voice/menu
```

---

## Installation (2 minutes)

### Step 1: Add API Key to .env
```env
ELEVENLABS_API_KEY=sk_...your_key...
```

### Step 2: Files Are Already Included ✅
The following files are already in `/server/integrations/`:
- `elevenlabs.ts` - Core module
- `elevenlabs-routes.ts` - Express routes  
- `elevenlabs-examples.ts` - Code examples
- Documentation files (README, SETUP, etc.)

### Step 3: Register Routes (in server/index.ts)
```typescript
import { ElevenLabsVoiceGenerator } from './integrations/elevenlabs';
import { registerElevenLabsRoutes } from './integrations/elevenlabs-routes';

const voiceGenerator = new ElevenLabsVoiceGenerator({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

registerElevenLabsRoutes(app, voiceGenerator, '/voice');
```

Done! All routes are now available.

---

## Common Operations (Copy & Paste)

### 1. Generate Simple Voice
```typescript
const voiceGenerator = new ElevenLabsVoiceGenerator({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

const result = await voiceGenerator.generateVoice({
  text: "Welcome to our service",
  voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel (friendly)
});

console.log("Generated:", result.audioBuffer?.length, "bytes");
```

### 2. Create Interactive Menu
```typescript
import { buildVoiceMenu } from './integrations/elevenlabs';

const menu = await buildVoiceMenu(voiceGenerator, {
  greeting: "Welcome. Please select an option.",
  items: [
    { key: "1", text: "Sales", prompt: "Press 1 for sales" },
    { key: "2", text: "Support", prompt: "Press 2 for support" },
  ],
  baseUrl: "https://your-domain.com",
});

// menu.twiml is ready for Twilio
```

### 3. List Available Voices
```typescript
const voices = await voiceGenerator.getAvailableVoices();
voices.forEach(v => console.log(`${v.name}: ${v.voice_id}`));
```

### 4. Check Account Usage
```typescript
const info = await voiceGenerator.getAccountInfo();
console.log(`Used: ${info.character_count}/${info.character_limit}`);
```

### 5. Validate Text Before Generating
```typescript
import { validateVoicePrompt } from './integrations/elevenlabs';

const validation = validateVoicePrompt("Your text here");
if (validation.valid) {
  // Safe to generate
} else {
  console.error("Errors:", validation.errors);
}
```

---

## API Endpoints (Automatically Available)

All routes use POST except where noted.

| Route | Purpose |
|-------|---------|
| `POST /voice/menu` | Main IVR menu |
| `POST /voice/custom-menu` | Custom menu |
| `POST /voice/greeting` | Simple greeting |
| `POST /voice/voicemail` | Voicemail prompt |
| `POST /voice/confirmation` | Yes/no confirmation |
| `GET /voice/voices` | List voices |
| `GET /voice/account` | Usage info |
| `POST /voice/test` | Test generation |
| `GET /voice/health` | Health check |

### Example: Call the API
```bash
# Test voice generation
curl -X POST http://localhost:3000/voice/test \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}'

# Get account info
curl http://localhost:3000/voice/account

# List voices
curl http://localhost:3000/voice/voices
```

---

## Voice Presets (6 Options)

```typescript
import { VOICE_PRESETS } from './integrations/elevenlabs';

// Use any of these:
VOICE_PRESETS.FRIENDLY      // Rachel - customer service
VOICE_PRESETS.PROFESSIONAL // Bella - corporate
VOICE_PRESETS.WARM         // Antoni - personal
VOICE_PRESETS.ENERGETIC    // Elli - sales
VOICE_PRESETS.DEEP         // Adam - authority
VOICE_PRESETS.EXPRESSIVE   // Sam - engaging
```

**Example:**
```typescript
const result = await voiceGenerator.generateVoice({
  text: "Thank you for calling",
  voiceId: VOICE_PRESETS.PROFESSIONAL,
});
```

---

## Twilio Integration

### 1. Configure Webhook
In Twilio Console:
1. Go to Phone Numbers → Manage Numbers
2. Select your number
3. Under "Voice & Fax" → set webhook to:
   ```
   https://your-domain.com/voice/menu
   ```
4. Method: `HTTP POST`
5. Save

### 2. Test with Call
```bash
# Using Twilio CLI
twilio phone-calls create \
  --to=+1-555-0000 \
  --from=YOUR_TWILIO_NUMBER \
  --url=https://your-domain.com/voice/menu
```

Or call your Twilio number from any phone.

### 3. What Happens
```
User calls Twilio number
        ↓
Twilio sends webhook to /voice/menu
        ↓
Your server generates voice prompt
        ↓
User hears menu and presses key
        ↓
/voice/ivr-handler processes input
        ↓
Action taken (transfer, record, etc.)
```

---

## Testing (Verify Setup Works)

### Test 1: Health Check
```bash
curl http://localhost:3000/voice/health
# Should return: {"status":"healthy","elevenlabs":"connected",...}
```

### Test 2: Generate Voice
```bash
curl -X POST http://localhost:3000/voice/test \
  -H "Content-Type: application/json" \
  -d '{"text":"Welcome"}'
# Should return: {"success":true,"format":"mp3",...}
```

### Test 3: List Voices
```bash
curl http://localhost:3000/voice/voices
# Should return list of available voices
```

### Test 4: Check Account
```bash
curl http://localhost:3000/voice/account
# Should return usage information
```

### Test 5: Create Menu
```bash
curl -X POST http://localhost:3000/voice/custom-menu \
  -H "Content-Type: application/json" \
  -d '{
    "greeting": "Welcome",
    "items": [
      {"key":"1","prompt":"Press 1 for sales"},
      {"key":"2","prompt":"Press 2 for support"}
    ]
  }'
# Should return TwiML XML
```

---

## Voice Settings (Optional)

Fine-tune voice characteristics:

```typescript
const result = await voiceGenerator.generateVoice({
  text: "Your message",
  voiceSettings: {
    stability: 0.8,         // 0-1 (higher = more consistent)
    similarity_boost: 0.9,  // 0-1 (higher = closer to original)
  }
});
```

**Presets:**
- **Natural:** `{stability: 0.5, similarity_boost: 0.75}`
- **Consistent:** `{stability: 0.8, similarity_boost: 0.8}`
- **Variable:** `{stability: 0.3, similarity_boost: 0.7}`

---

## Environment Variables

```env
# Required
ELEVENLABS_API_KEY=sk_...

# Optional (with defaults)
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_MODEL_ID=eleven_monolingual_v1

# For webhooks
API_URL=https://your-domain.com

# Twilio (already configured)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Wrong API key | Check .env file |
| 429 Rate Limited | Too many requests | Wait before retry |
| Character limit exceeded | Monthly limit reached | Upgrade plan |
| No audio in call | Upload failed | Implement upload handler |
| TwiML error | Invalid characters | Use formatTextForVoice() |

---

## Next Steps

### For More Details
- **Setup Guide:** `server/integrations/ELEVENLABS_SETUP.md`
- **User Guide:** `server/integrations/ELEVENLABS_README.md`
- **Code Examples:** `server/integrations/elevenlabs-examples.ts`
- **Navigation:** `server/integrations/INDEX.md`

### Common Customizations
1. **Change menu options:** Edit `/voice/menu` route in `elevenlabs-routes.ts`
2. **Add new voice:** Use custom `voiceId` in generateVoice()
3. **Handle DTMF:** Modify `/voice/ivr-handler` route
4. **Store recordings:** Add upload handler function

---

## File Sizes

| File | Size | Purpose |
|------|------|---------|
| elevenlabs.ts | 20 KB | Core module |
| elevenlabs-routes.ts | 15 KB | Express routes |
| elevenlabs-examples.ts | 21 KB | Examples |
| Documentation | 38 KB | Guides |
| **Total** | **94 KB** | **Complete integration** |

---

## Performance Tips

```typescript
// ✅ Good: Cache generated audio
const cache = new Map();

async function getCachedVoice(text) {
  if (cache.has(text)) return cache.get(text);
  const result = await generate(text);
  cache.set(text, result.audioUrl);
  return result.audioUrl;
}

// ✅ Good: Batch multiple generations
const results = await Promise.all([
  generate("Option 1"),
  generate("Option 2"),
  generate("Option 3"),
]);

// ⚠️ Avoid: Generating same text repeatedly
// Instead, cache the results
```

---

## Pricing Reference

| Plan | Monthly Cost | Characters |
|------|------------|-----------|
| Free | $0 | 1,000 |
| Starter | $5 | 10,000 |
| Creator | $99 | 500,000 |
| Enterprise | Custom | Custom |

**Cost Estimation:**
- 50 chars per prompt
- 1 minute call = 500-1000 chars
- 100 calls/month = 50K-100K chars (Creator plan)

---

## Monitoring

### Check Usage Regularly
```typescript
async function checkUsage() {
  const info = await voiceGenerator.getAccountInfo();
  const used = info.character_count;
  const limit = info.character_limit;
  const percent = (used / limit) * 100;
  
  console.log(`${percent.toFixed(1)}% used`);
  
  if (percent > 80) {
    console.warn("⚠️ 80% usage - consider upgrade");
  }
}

// Check daily
setInterval(checkUsage, 24 * 60 * 60 * 1000);
```

---

## Support Resources

- **Docs:** https://elevenlabs.io/docs
- **API Status:** https://status.elevenlabs.io
- **Community:** https://community.elevenlabs.io
- **Twilio TwiML:** https://www.twilio.com/docs/voice/twiml

---

## Before Going to Production

- [ ] Test all routes with curl
- [ ] Make test calls from Twilio
- [ ] Verify audio quality
- [ ] Check error handling
- [ ] Monitor character usage
- [ ] Configure production webhook URL
- [ ] Set up logging
- [ ] Test with real callers

---

## Architecture (Simple)

```
Your App
   ↓
/voice/menu endpoint
   ↓
ElevenLabs API (generates voice)
   ↓
TwiML Response
   ↓
Twilio
   ↓
Caller's Phone
```

---

## Version

- **Status:** ✅ Production Ready
- **Created:** 2026-06-25
- **Version:** 1.0.0

---

**Questions?** Check `INDEX.md` for navigation to detailed docs.

**Ready to start?** Run `npm run dev` and test with `curl http://localhost:3000/voice/health`
