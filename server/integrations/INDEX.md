# ElevenLabs Voice Integration - Complete Index

Comprehensive guide to all ElevenLabs integration files and functionality.

## Quick Navigation

- **Getting Started:** [ELEVENLABS_SETUP.md](./ELEVENLABS_SETUP.md)
- **User Guide:** [ELEVENLABS_README.md](./ELEVENLABS_README.md)
- **Code Examples:** [elevenlabs-examples.ts](./elevenlabs-examples.ts)
- **Implementation:** [elevenlabs.ts](./elevenlabs.ts)
- **Express Routes:** [elevenlabs-routes.ts](./elevenlabs-routes.ts)
- **Summary:** [ELEVENLABS_SUMMARY.md](./ELEVENLABS_SUMMARY.md)

---

## Files Overview

### 📋 Documentation Files

#### 1. ELEVENLABS_SETUP.md (11 KB)
**Purpose:** Step-by-step setup and configuration guide

**Covers:**
- Account creation and API key generation
- Environment variable configuration
- Voice availability verification
- Integration testing (5 tests)
- End-to-end testing
- Usage monitoring
- Billing and pricing
- Troubleshooting (6 common issues)
- Best practices and security checklist

**When to Use:** 
- First time setup
- Configuring new environment
- Troubleshooting connection issues

---

#### 2. ELEVENLABS_README.md (14 KB)
**Purpose:** Comprehensive user documentation and API reference

**Covers:**
- Feature overview
- Installation instructions
- Quick start examples (5 different use cases)
- Voice presets reference (6 voices)
- IVR menu configuration and customization
- Voice settings (stability, similarity_boost)
- Complete Twilio integration examples
- Helper functions reference
- Full API documentation
- Best practices (5 sections)
- Troubleshooting guide
- Rate limiting information
- Security considerations

**When to Use:**
- Learning the API
- Building custom implementations
- Understanding voice presets
- Troubleshooting errors
- Optimizing performance

---

#### 3. ELEVENLABS_SUMMARY.md (13 KB)
**Purpose:** High-level overview and quick reference

**Covers:**
- File overview and structure
- Architecture diagram
- Feature matrix
- Integration checklist
- Key classes and methods
- Supported voices table
- Quick reference examples
- Performance characteristics
- Scalability considerations
- Dependencies summary
- Testing information
- Troubleshooting quick links

**When to Use:**
- Project overview
- Status check
- Quick reference lookup
- Architecture review

---

### 💻 Implementation Files

#### 1. elevenlabs.ts (733 lines)
**Purpose:** Core ElevenLabs integration module

**Classes:**
```
ElevenLabsVoiceGenerator
├── generateVoice(options)
├── generateAndUploadVoice(options, uploadHandler)
├── getAvailableVoices()
├── getVoiceDetails(voiceId)
└── getAccountInfo()

IVRMenuBuilder
├── generatePrompts(uploadHandler)
├── buildTwiMLResponse(retryCount)
├── buildCompleteMenu(uploadHandler)
└── getMenuItem(key)
```

**Functions (Helper builders):**
- `buildVoiceGreeting()` - Simple greeting
- `buildVoiceMenu()` - Interactive menu
- `buildVoiceMailPrompt()` - Voicemail setup
- `buildVoiceConfirmation()` - Confirmation dialog
- `buildVoiceTransfer()` - Call transfer
- `buildVoiceSurvey()` - Survey system

**Utilities:**
- `formatTextForVoice()` - XML escaping
- `estimateCharacterUsage()` - Character counting
- `estimateSpeechDuration()` - Duration estimation
- `validateVoicePrompt()` - Input validation
- Voice preset constants (VOICE_PRESETS)
- Model preset constants (MODEL_PRESETS)

**When to Use:**
- As the main integration module
- Importing types and interfaces
- Creating voice generators
- Building custom IVR menus

---

#### 2. elevenlabs-routes.ts (512 lines)
**Purpose:** Express.js routes for voice webhooks and API

**Routes Implemented:**

```
POST /voice/menu
├── Generates main IVR menu with voice prompts
└── Used by Twilio webhook

POST /voice/ivr-handler
├── Processes DTMF keypad input
├── Routes to appropriate action
└── Handles invalid input retry

POST /voice/greeting
├── Creates simple voice greeting
├── Custom text and voice selection
└── Returns TwiML response

POST /voice/custom-menu
├── Builds custom IVR menu
├── Accepts menu configuration
└── Generates voice prompts

POST /voice/voicemail
├── Creates voicemail prompt
├── Configurable timeout and length
└── Ready for recording

POST /voice/confirmation
├── Confirmation dialog
├── Yes/no responses
└── Action handling

POST /voice/confirmation-handler
├── Processes confirmation responses
├── Routes to next action
└── Hangup handling

GET /voice/voices
├── Lists available voices
├── Returns voice metadata
└── Useful for UI selection

GET /voice/account
├── Shows account usage
├── Character count and limits
└── Usage percentage and warnings

POST /voice/test
├── Tests voice generation
├── Validates setup
└── Returns generation info

GET /voice/health
├── Health check endpoint
├── Verifies API connectivity
└── Returns status
```

**Helper Functions:**
- `createElevenLabsRouter()` - Create router
- `registerElevenLabsRoutes()` - Register with app
- `twilioWebhookMiddleware()` - Parse Twilio data
- `verifyTwilioSignature()` - Signature verification

**When to Use:**
- Setting up Express server
- Creating voice API endpoints
- Handling Twilio webhooks
- Building REST API for voice operations

---

#### 3. elevenlabs-examples.ts (623 lines)
**Purpose:** 12 complete working examples

**Example 1: Simple Greeting**
- Basic voice greeting
- Single text-to-speech call
- TwiML generation

**Example 2: Interactive Menu**
- Multi-option menu (4 items)
- Voice prompts per option
- Timeout and retry handling
- Professional greeting

**Example 3: Voicemail System**
- Voicemail prompt
- Recording setup
- Length and timeout configuration

**Example 4: Payment Confirmation**
- Dynamic amount in prompt
- Confirmation dialog
- Text validation

**Example 5: Call Transfer**
- Transfer announcement
- Phone number routing
- Fallback message

**Example 6: Customer Satisfaction Survey**
- Greeting and introduction
- Multi-question survey
- Scale ratings and recommendations

**Example 7: Emergency Announcements**
- High stability voice settings
- Deep, authoritative tone
- Critical message delivery

**Example 8: Multi-Voice Interactive Menu**
- Different voices per menu item
- Voice variety for engagement
- Professional vs friendly tone

**Example 9: Appointment Reminders**
- Dynamic appointment information
- Confirm/reschedule/cancel options
- Warm, friendly greeting

**Example 10: Help Desk Queue Announcements**
- Dynamic queue position
- Estimated wait time
- Professional announcements

**Example 11: Voice Account Access**
- Get available voices
- Check account usage
- Monitor character limits

**Example 12: Complex Routing Menu**
- Multi-level menu structure
- Different departments
- Operator fallback

**When to Use:**
- Learning how to use the API
- Copy-paste starting points
- Understanding patterns
- Testing functionality

---

## Type Definitions

### Core Types (elevenlabs.ts)

```typescript
// Configuration
interface ElevenLabsConfig {
  apiKey: string;
  voiceId?: string;
  modelId?: string;
  baseUrl?: string;
}

// Voice Generation
interface GenerateVoiceOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: VoiceSettings;
  format?: "mp3" | "pcm_16000" | "pcm_22050" | "pcm_24000";
}

interface GeneratedVoiceResponse {
  audioUrl: string;
  audioBuffer?: Buffer;
  duration?: number;
  format: string;
  voiceId: string;
  timestamp: Date;
}

// IVR Menu
interface IVRMenuItem {
  key: string;
  text: string;
  prompt: string;
  voiceId?: string;
  action?: "dial" | "redirect" | "record" | "callback";
  actionTarget?: string;
}

interface IVRMenuOptions {
  greeting?: string;
  greetingVoiceId?: string;
  items: IVRMenuItem[];
  timeout?: number;
  maxRetries?: number;
  retryMessage?: string;
  baseUrl?: string;
  recordingUrl?: string;
}

interface IVRMenuResponse {
  twiml: string;
  menuItems: IVRMenuItem[];
  audioUrls: Record<string, string>;
  timestamp: Date;
}

// Account & Voices
interface VoiceListItem {
  voice_id: string;
  name: string;
  samples?: string[];
  category?: string;
  description?: string;
  preview_url?: string;
}

interface VoiceSettings {
  stability?: number;      // 0-1
  similarity_boost?: number; // 0-1
}
```

---

## Voice Presets

Six pre-configured professional voices ready to use:

```typescript
VOICE_PRESETS.FRIENDLY      // Rachel - warm, inviting
VOICE_PRESETS.PROFESSIONAL // Bella - business-like
VOICE_PRESETS.WARM         // Antoni - personal
VOICE_PRESETS.ENERGETIC    // Elli - enthusiastic
VOICE_PRESETS.DEEP         // Adam - authoritative
VOICE_PRESETS.EXPRESSIVE   // Sam - engaging
```

---

## Common Tasks

### Task: Generate a Simple Voice Message
**File:** elevenlabs.ts  
**Class:** ElevenLabsVoiceGenerator  
**Method:** generateVoice()  
**Example:** examples.ts line 25

```typescript
const result = await voiceGenerator.generateVoice({
  text: "Your message here",
  voiceId: VOICE_PRESETS.FRIENDLY
});
```

---

### Task: Create an IVR Menu
**File:** elevenlabs.ts  
**Class:** IVRMenuBuilder  
**Methods:** generatePrompts(), buildCompleteMenu()  
**Example:** examples.ts line 70

```typescript
const menu = new IVRMenuBuilder(voiceGenerator, {
  greeting: "Welcome",
  items: [
    { key: "1", text: "Sales", prompt: "Press 1" },
    { key: "2", text: "Support", prompt: "Press 2" }
  ]
});
const response = await menu.buildCompleteMenu();
```

---

### Task: Set Up Express Routes
**File:** elevenlabs-routes.ts  
**Function:** registerElevenLabsRoutes()  
**Example Code:**

```typescript
import { registerElevenLabsRoutes } from './integrations/elevenlabs-routes';

const voiceGenerator = new ElevenLabsVoiceGenerator({
  apiKey: process.env.ELEVENLABS_API_KEY!
});

registerElevenLabsRoutes(app, voiceGenerator, '/voice');
// All routes now available at /voice/*
```

---

### Task: Handle Twilio Webhook
**File:** elevenlabs-routes.ts  
**Route:** POST /voice/ivr-handler  
**Automatic** when using registerElevenLabsRoutes()

---

### Task: Validate Voice Prompt
**File:** elevenlabs.ts  
**Function:** validateVoicePrompt()  
**Example:** examples.ts line 400

```typescript
const validation = validateVoicePrompt(text);
if (!validation.valid) {
  console.error(validation.errors);
}
```

---

### Task: Monitor API Usage
**File:** elevenlabs.ts  
**Method:** getAccountInfo()  
**Example:** examples.ts line 480

```typescript
const info = await voiceGenerator.getAccountInfo();
console.log(`Used: ${info.character_count}/${info.character_limit}`);
```

---

## Integration Checklist

### Phase 1: Setup (1-2 hours)
- [ ] Read ELEVENLABS_SETUP.md
- [ ] Create ElevenLabs account
- [ ] Generate API key
- [ ] Configure .env file
- [ ] Test API connectivity

### Phase 2: Development (2-4 hours)
- [ ] Add elevenlabs.ts to project
- [ ] Add elevenlabs-routes.ts
- [ ] Configure Express server
- [ ] Create test routes
- [ ] Test voice generation

### Phase 3: Testing (1-2 hours)
- [ ] Test each route endpoint
- [ ] Test with Twilio calls
- [ ] Test DTMF input handling
- [ ] Test error scenarios
- [ ] Verify audio quality

### Phase 4: Deployment (1 hour)
- [ ] Configure production environment
- [ ] Set up webhook URLs
- [ ] Enable logging
- [ ] Configure monitoring
- [ ] Document procedures

### Phase 5: Monitoring (Ongoing)
- [ ] Monitor API usage
- [ ] Watch error logs
- [ ] Review call metrics
- [ ] Plan for scaling
- [ ] Rotate API keys

---

## Troubleshooting Guide

### By Error Message

**"401 Unauthorized"**
- Location: ELEVENLABS_SETUP.md → Troubleshooting
- Solution: Check API key in .env

**"Character limit exceeded"**
- Location: ELEVENLABS_README.md → Rate Limiting
- Solution: Upgrade plan or wait for reset

**"No audio in call"**
- Location: ELEVENLABS_README.md → Troubleshooting
- Solution: Implement upload handler

**"TwiML parsing error"**
- Location: ELEVENLABS_README.md → Troubleshooting
- Solution: Use formatTextForVoice()

**"Timeout during generation"**
- Location: ELEVENLABS_SETUP.md → Troubleshooting
- Solution: Increase timeout or reduce text length

---

### By Scenario

**First Time Setup:**
1. Start with ELEVENLABS_SETUP.md
2. Follow steps 1-5
3. Run test in step 5

**Building Custom Menu:**
1. Review elevenlabs-examples.ts example 2
2. Copy and customize
3. Test with example 12

**Integration Issues:**
1. Check ELEVENLABS_SETUP.md troubleshooting
2. Verify environment variables
3. Test with /voice/test endpoint

**Performance Issues:**
1. Review ELEVENLABS_README.md best practices
2. Implement caching
3. Monitor character usage

---

## API Rate Limits & Quotas

| Plan | Characters/Month | Use Case |
|------|-----------------|----------|
| Free | 1,000 | Testing/demo |
| Starter | 10,000 | Small business |
| Creator | 500,000 | Production |
| Enterprise | Custom | Large scale |

---

## Performance Metrics

| Operation | Typical Time |
|-----------|-------------|
| Voice generation | 1-3 seconds |
| Menu building | < 1 second |
| IVR with 4 items | 4-12 seconds |
| API health check | < 500ms |

---

## Dependencies

```json
{
  "dependencies": {
    "twilio": "^4.19.3",
    "express": "^5.2.1"
  }
}
```

Both already included in package.json - no new dependencies needed!

---

## File Structure

```
server/integrations/
├── elevenlabs.ts                (733 lines) - Core module
├── elevenlabs-routes.ts         (512 lines) - Express routes
├── elevenlabs-examples.ts       (623 lines) - Code examples
├── ELEVENLABS_README.md         (14 KB)    - User guide
├── ELEVENLABS_SETUP.md          (11 KB)    - Setup guide
├── ELEVENLABS_SUMMARY.md        (13 KB)    - Overview
├── INDEX.md                     (This file)- Navigation
├── twilio-twiml.ts              - TwiML builder (existing)
├── twilio.ts                    - Twilio client (existing)
└── [other integrations]         - Stripe, etc.
```

---

## Quick Start (5 Minutes)

### 1. Configure Environment
```bash
echo "ELEVENLABS_API_KEY=your_key" >> .env
```

### 2. Import and Initialize
```typescript
import { ElevenLabsVoiceGenerator } from './integrations/elevenlabs';

const voice = new ElevenLabsVoiceGenerator({
  apiKey: process.env.ELEVENLABS_API_KEY!
});
```

### 3. Generate Voice
```typescript
const result = await voice.generateVoice({
  text: "Welcome to our service"
});
```

### 4. Use in Express
```typescript
import { registerElevenLabsRoutes } from './integrations/elevenlabs-routes';
registerElevenLabsRoutes(app, voice);
```

### 5. Test
```bash
curl -X POST http://localhost:3000/voice/test \
  -H "Content-Type: application/json" \
  -d '{"text":"Welcome"}'
```

---

## Further Reading

1. **For Setup Help:** ELEVENLABS_SETUP.md
2. **For Implementation:** ELEVENLABS_README.md
3. **For Code Examples:** elevenlabs-examples.ts
4. **For Quick Reference:** ELEVENLABS_SUMMARY.md
5. **For API Details:** elevenlabs.ts source code
6. **For Routes:** elevenlabs-routes.ts source code

---

## Support & Resources

- **ElevenLabs Docs:** https://elevenlabs.io/docs
- **Twilio TwiML:** https://www.twilio.com/docs/voice/twiml
- **Project Issues:** Check ELEVENLABS_SETUP.md → Troubleshooting
- **Community:** https://community.elevenlabs.io

---

## Version Information

- **Created:** 2026-06-25
- **Version:** 1.0.0
- **Status:** Production Ready
- **Total Code:** 1,868 lines
- **Total Docs:** 38 KB

---

**Last Updated:** 2026-06-25
