# ElevenLabs Voice Integration

Complete integration for generating natural-sounding voice prompts and building IVR menus with ElevenLabs API and Twilio TwiML.

## Features

- **Voice Generation**: Convert text to natural-sounding speech using ElevenLabs
- **IVR Menu Builder**: Create interactive voice menus with multiple options
- **TwiML Integration**: Seamless integration with Twilio for voice delivery
- **Multiple Voices**: Support for diverse voice presets and custom voice IDs
- **Voice Presets**: Pre-configured professional voice options
- **Text Validation**: Built-in validation for voice prompts

## Installation

### Prerequisites

1. **ElevenLabs Account**: Get API key from [elevenlabs.io](https://elevenlabs.io)
2. **Twilio Account**: Ensure Twilio is already configured (see TWILIO_README.md)

### Environment Setup

```bash
# Add to .env file
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Optional: default voice
ELEVENLABS_MODEL_ID=eleven_monolingual_v1  # Optional: model selection
```

## Quick Start

### 1. Basic Voice Generation

```typescript
import { ElevenLabsVoiceGenerator } from './integrations/elevenlabs';

const voiceGenerator = new ElevenLabsVoiceGenerator({
  apiKey: process.env.ELEVENLABS_API_KEY!,
  voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - friendly voice
});

// Generate voice from text
const result = await voiceGenerator.generateVoice({
  text: "Welcome to our service. How can we help you today?",
});

console.log("Audio Buffer:", result.audioBuffer);
console.log("Format:", result.format);
```

### 2. Create Interactive IVR Menu

```typescript
import { ElevenLabsVoiceGenerator, IVRMenuBuilder } from './integrations/elevenlabs';

const voiceGenerator = new ElevenLabsVoiceGenerator({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

// Define menu structure
const menu = new IVRMenuBuilder(voiceGenerator, {
  greeting: "Thank you for calling. ",
  items: [
    {
      key: "1",
      text: "Sales",
      prompt: "Press 1 to speak with our sales team",
      action: "dial",
      actionTarget: "+1-555-0100",
    },
    {
      key: "2",
      text: "Support",
      prompt: "Press 2 for technical support",
      action: "dial",
      actionTarget: "+1-555-0200",
    },
    {
      key: "3",
      text: "Billing",
      prompt: "Press 3 for billing inquiries",
      action: "dial",
      actionTarget: "+1-555-0300",
    },
  ],
  timeout: 5,
  maxRetries: 3,
  baseUrl: "https://api.example.com",
});

// Build complete menu with voice prompts
const menuResponse = await menu.buildCompleteMenu();
console.log("TwiML:", menuResponse.twiml);
console.log("Audio URLs:", menuResponse.audioUrls);
```

### 3. Helper Functions for Common Scenarios

#### Voice Greeting
```typescript
import { buildVoiceGreeting } from './integrations/elevenlabs';

const twiml = await buildVoiceGreeting(voiceGenerator, {
  text: "Welcome to our company",
  voiceId: "21m00Tcm4TlvDq8ikWAM",
});
```

#### Voice Menu
```typescript
import { buildVoiceMenu } from './integrations/elevenlabs';

const menuResponse = await buildVoiceMenu(voiceGenerator, {
  greeting: "Please select an option",
  items: [
    { key: "1", text: "Sales", prompt: "Press 1 for sales" },
    { key: "2", text: "Support", prompt: "Press 2 for support" },
  ],
  baseUrl: "https://api.example.com",
});
```

#### Voicemail Prompt
```typescript
import { buildVoiceMailPrompt } from './integrations/elevenlabs';

const twiml = await buildVoiceMailPrompt(voiceGenerator, {
  prompt: "Please leave a message after the beep",
  maxLength: 120,
});
```

#### Voice Confirmation
```typescript
import { buildVoiceConfirmation } from './integrations/elevenlabs';

const twiml = await buildVoiceConfirmation(voiceGenerator, {
  message: "Is this correct? Press 1 to confirm or 2 to cancel",
  confirmKey: "1",
  cancelKey: "2",
  actionUrl: "https://api.example.com/confirm",
});
```

#### Voice Transfer
```typescript
import { buildVoiceTransfer } from './integrations/elevenlabs';

const twiml = await buildVoiceTransfer(voiceGenerator, {
  announcement: "Transferring you to an agent",
  phoneNumber: "+1-555-0100",
});
```

## Voice Presets

Pre-configured voice options ready to use:

```typescript
import { VOICE_PRESETS } from './integrations/elevenlabs';

// Available presets:
// FRIENDLY:      Rachel - Warm and inviting
// PROFESSIONAL:  Bella - Business-like
// WARM:          Antoni - Personal and warm
// ENERGETIC:     Elli - Enthusiastic
// DEEP:          Adam - Deep and authoritative
// EXPRESSIVE:    Sam - Expressive and engaging

const text = "Welcome!";

// Use with preset
const friendly = await voiceGenerator.generateVoice({
  text,
  voiceId: VOICE_PRESETS.FRIENDLY,
});

const professional = await voiceGenerator.generateVoice({
  text,
  voiceId: VOICE_PRESETS.PROFESSIONAL,
});
```

## IVR Menu Configuration

### Menu Structure

```typescript
interface IVRMenuItem {
  key: string;                    // "1", "2", "3", etc
  text: string;                   // Label
  prompt: string;                 // Voice prompt
  voiceId?: string;              // Override default voice
  action?: "dial" | "redirect";  // Action type
  actionTarget?: string;          // Target (phone, URL)
}
```

### Complete Example

```typescript
const advancedMenu = new IVRMenuBuilder(voiceGenerator, {
  greeting: "Thank you for calling ABC Corporation",
  greetingVoiceId: VOICE_PRESETS.PROFESSIONAL,
  items: [
    {
      key: "1",
      text: "Account Information",
      prompt: "Press 1 to hear your account information",
      voiceId: VOICE_PRESETS.FRIENDLY,
      action: "redirect",
      actionTarget: "https://api.example.com/account",
    },
    {
      key: "2",
      text: "Make a Payment",
      prompt: "Press 2 to make a payment",
      voiceId: VOICE_PRESETS.FRIENDLY,
      action: "redirect",
      actionTarget: "https://api.example.com/payment",
    },
    {
      key: "0",
      text: "Repeat Menu",
      prompt: "Press 0 to hear this menu again",
      action: "redirect",
      actionTarget: "https://api.example.com/menu",
    },
  ],
  timeout: 5,
  maxRetries: 3,
  retryMessage: "Sorry, I didn't catch that. Please try again",
  retryVoiceId: VOICE_PRESETS.FRIENDLY,
  baseUrl: "https://api.example.com",
});

const response = await advancedMenu.buildCompleteMenu();
```

## Voice Settings

Customize voice characteristics:

```typescript
interface VoiceSettings {
  stability?: number;         // 0-1 (default: 0.5)
                              // Lower = more variable
  similarity_boost?: number;  // 0-1 (default: 0.75)
                              // Higher = more similar to original
}

const result = await voiceGenerator.generateVoice({
  text: "Professional announcement",
  voiceSettings: {
    stability: 0.8,        // More consistent
    similarity_boost: 0.9, // High similarity to voice
  },
});
```

## Integration with Twilio

### Express Endpoint for IVR Menu

```typescript
import express from 'express';
import { ElevenLabsVoiceGenerator, IVRMenuBuilder } from './integrations/elevenlabs';

const app = express();
const voiceGenerator = new ElevenLabsVoiceGenerator({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

// Main IVR menu endpoint
app.post('/voice/menu', async (req, res) => {
  const menu = new IVRMenuBuilder(voiceGenerator, {
    greeting: "Welcome to our service",
    items: [
      { key: "1", text: "Sales", prompt: "Press 1 for sales" },
      { key: "2", text: "Support", prompt: "Press 2 for support" },
    ],
    baseUrl: "https://api.example.com",
  });

  const menuResponse = await menu.buildCompleteMenu();
  res.type('application/xml');
  res.send(menuResponse.twiml);
});

// DTMF input handler
app.post('/voice/ivr-handler', async (req, res) => {
  const { Digits } = req.body;

  const responses: Record<string, string> = {
    "1": "Transferring you to sales",
    "2": "Transferring you to support",
  };

  const twiml = responses[Digits] || "Invalid selection";

  const result = await voiceGenerator.generateVoice({ text: twiml });
  // Return TwiML with dial or redirect
});
```

## Text Validation

Validate voice prompts before generation:

```typescript
import { validateVoicePrompt } from './integrations/elevenlabs';

const validation = validateVoicePrompt("Welcome to our service");
if (validation.valid) {
  // Safe to generate
} else {
  console.error("Errors:", validation.errors);
}
```

## Helper Functions

### Estimate Speech Duration
```typescript
import { estimateSpeechDuration } from './integrations/elevenlabs';

const duration = estimateSpeechDuration(
  "Welcome to our service. Press 1 for sales"
);
console.log(`Estimated duration: ${duration} seconds`);
```

### Estimate Character Usage
```typescript
import { estimateCharacterUsage } from './integrations/elevenlabs';

const chars = estimateCharacterUsage(
  "Welcome to our service"
);
console.log(`Characters: ${chars}`);
```

## API Reference

### ElevenLabsVoiceGenerator

#### Constructor
```typescript
new ElevenLabsVoiceGenerator(config: ElevenLabsConfig)
```

**Parameters:**
- `apiKey` (required): Your ElevenLabs API key
- `voiceId` (optional): Default voice ID
- `modelId` (optional): Default model ID
- `baseUrl` (optional): API base URL

#### Methods

##### generateVoice(options)
Generate voice audio from text.

```typescript
const result = await voiceGenerator.generateVoice({
  text: string,
  voiceId?: string,
  modelId?: string,
  voiceSettings?: VoiceSettings,
  format?: "mp3" | "pcm_16000" | "pcm_22050" | "pcm_24000",
});
```

##### generateAndUploadVoice(options, uploadHandler)
Generate and upload audio to storage backend.

```typescript
const result = await voiceGenerator.generateAndUploadVoice(
  { text: string, ... },
  (buffer, filename) => Promise<string>
);
```

##### getAvailableVoices()
Get list of all available voices.

```typescript
const voices = await voiceGenerator.getAvailableVoices();
```

##### getVoiceDetails(voiceId)
Get details for specific voice.

```typescript
const voice = await voiceGenerator.getVoiceDetails(
  "21m00Tcm4TlvDq8ikWAM"
);
```

##### getAccountInfo()
Get account usage information.

```typescript
const info = await voiceGenerator.getAccountInfo();
// Returns: { character_count, character_limit }
```

### IVRMenuBuilder

#### Constructor
```typescript
new IVRMenuBuilder(voiceGenerator, config: IVRMenuOptions)
```

#### Methods

##### generatePrompts(uploadHandler)
Generate voice prompts for all menu items.

```typescript
await builder.generatePrompts((buffer, filename) => {
  // Upload to storage
  return Promise.resolve(publicUrl);
});
```

##### buildTwiMLResponse(retryCount)
Build TwiML XML response.

```typescript
const twiml = builder.buildTwiMLResponse(0); // Initial attempt
const retryTwiml = builder.buildTwiMLResponse(1); // Retry
```

##### buildCompleteMenu(uploadHandler)
Build complete IVR menu with all prompts.

```typescript
const response = await builder.buildCompleteMenu();
// Returns: { twiml, menuItems, audioUrls, timestamp }
```

##### getMenuItem(key)
Get specific menu item by key.

```typescript
const item = builder.getMenuItem("1");
```

## Best Practices

### 1. Voice Selection
- Use **FRIENDLY** for customer service
- Use **PROFESSIONAL** for corporate calls
- Use **ENERGETIC** for sales/marketing
- Test different voices with your target audience

### 2. Prompt Design
- Keep prompts under 100 characters for best results
- Use clear, conversational language
- Avoid technical jargon
- Include action instructions (e.g., "Press 1")

### 3. Menu Structure
- Limit main menu to 4-5 options
- Provide clear option descriptions
- Offer repeat option (usually "0")
- Set appropriate timeouts (3-5 seconds)

### 4. Error Handling
- Always provide retry prompts
- Set reasonable retry limits (3-5)
- Offer operator fallback option
- Log invalid inputs for analysis

### 5. Performance
- Cache generated audio files
- Implement upload handler for permanent storage
- Monitor API character usage
- Use appropriate voice settings

## Troubleshooting

### API Authentication Error
```
Error: ElevenLabs API error: 401 Unauthorized
```
**Solution:** Check your API key in `.env` file

### Voice Generation Timeout
**Solution:** 
- Check network connectivity
- Verify API rate limits
- Reduce text length
- Check account character limits

### TwiML Parsing Error
**Solution:**
- Validate text with `validateVoicePrompt()`
- Ensure proper XML escaping with `formatTextForVoice()`
- Check Twilio webhook configuration

### No Audio in Menu
**Solution:**
- Verify audio URLs are publicly accessible
- Check upload handler implementation
- Ensure audio files are not expired

## Rate Limiting

ElevenLabs has rate limits:
- **Free tier**: 1,000 characters/month
- **Starter**: 10,000 characters/month
- **Creator**: 500,000 characters/month

Monitor usage:
```typescript
const info = await voiceGenerator.getAccountInfo();
console.log(`Used: ${info.character_count}/${info.character_limit}`);
```

## Security Considerations

1. **API Key Management**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Audio Storage**
   - Implement proper access controls for audio files
   - Consider encryption for sensitive prompts
   - Clean up old audio files periodically

3. **Input Validation**
   - Always validate user inputs
   - Use `validateVoicePrompt()` before generation
   - Implement rate limiting on endpoints

4. **Webhook Verification**
   - Verify Twilio webhook signatures
   - Validate incoming phone numbers
   - Log all voice interactions

## Examples

See `elevenlabs-examples.ts` for complete working examples:
- Basic voice greeting
- Interactive menu with routing
- Voicemail with callbacks
- Survey with voice prompts
- Emergency announcements

## Support

For issues:
1. Check [ElevenLabs Documentation](https://elevenlabs.io/docs)
2. Review [Twilio TwiML Docs](https://www.twilio.com/docs/voice/twiml)
3. Check integration logs
4. Verify API credentials and rate limits

## License

This integration is part of Voxmation and follows the project's license terms.
