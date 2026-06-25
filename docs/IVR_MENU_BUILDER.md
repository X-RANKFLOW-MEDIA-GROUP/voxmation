# IVR Menu Builder Documentation

## Overview

The IVR (Interactive Voice Response) Menu Builder is a visual, drag-and-drop interface for creating call flows that automatically generates TwiML (Twilio Markup Language) XML. It's located at `/portal/voice-settings` and provides an intuitive way to design complex phone menu systems without writing code.

## Features

### Node Types

The builder supports four primary node types:

#### 1. **Say (Speak Message)**
Plays a text-to-speech message to the caller.

**Configuration Options:**
- **Message Text**: The message to be spoken (required)
- **Voice Service**: Choose between ElevenLabs or Twilio
- **Language**: Supported languages include:
  - English (US)
  - English (UK)
  - Spanish
  - French
  - German
  - Portuguese (BR)
- **Speed**: Playback speed from 0.5x to 2x (default: 1x)
- **Pause After**: Silence duration in milliseconds after the message (0-5000ms)

**TwiML Output Example:**
```xml
<Say voice="alice" engine="elevenlabs" rate="1.2">
  Thank you for calling. How can we help you today?
</Say>
```

#### 2. **Gather (Collect Input)**
Collects digit input or speech from the caller.

**Configuration Options:**
- **Timeout**: Wait time in seconds before timing out (1-30 seconds, default: 5)
- **Num Digits**: Number of digits to collect (1-20, default: 1)
- **Finish On Key**: Digit that ends input collection (default: #)
- **Speech Timeout**: Silence duration before ending speech input (100-10000ms, default: 3000ms)
- **Hints**: Comma-separated voice recognition hints (e.g., "sales, support, billing")

**TwiML Output Example:**
```xml
<Gather timeout="5" numDigits="1" finishOnKey="#" speechTimeout="3.0">
  <Say>Press a digit or speak your choice.</Say>
</Gather>
```

#### 3. **Redirect (Forward Call)**
Redirects the call to an external webhook URL for dynamic routing.

**Configuration Options:**
- **Webhook URL**: The endpoint to receive the call data
- **HTTP Method**: POST (default) or GET

**TwiML Output Example:**
```xml
<Redirect method="POST">https://example.com/webhook</Redirect>
```

#### 4. **Hangup (End Call)**
Terminates the call.

**Configuration Options:**
- **Hangup Reason**: Optional description of why the call ended

**TwiML Output Example:**
```xml
<Hangup/>
```

## User Interface

### Node List Panel
- **Add Node**: Create new nodes with the + button
- **Expand/Collapse**: Click any node to view/edit configuration
- **Drag Handle**: Grip icon for future reordering (visual indicator)
- **Node Icons**: Visual indicators for node type
- **Step Numbers**: Track flow progression

### TwiML Preview Panel
- **View TwiML**: Toggle to display generated XML
- **Copy to Clipboard**: Quick copy button for integration
- **Download as XML**: Export the TwiML file
- **Save as JSON**: Save the flow configuration for backup/sharing

### Right Sidebar
- **Quick Actions**: Copy, Download, Save operations
- **Info Box**: Integration guidelines
- **Flow Stats**: Real-time metrics of node distribution

## Building a Basic IVR Flow

### Example: Restaurant Reservation System

```
1. Welcome Message (Say)
   "Welcome to Luigi's Restaurant. Press 1 for reservations, 
    2 for delivery information, or 3 to speak with staff."
   ↓
2. Main Menu (Gather)
   Timeout: 5 seconds
   Num Digits: 1
   ↓
3. Redirect to Handler (Redirect)
   Webhook: https://yourapi.com/handle-reservation
   ↓
4. End Call (Hangup)
```

### Example: Customer Support Flow

```
1. Greeting (Say)
   "Thank you for calling our support line."
   ↓
2. Department Selection (Gather)
   Hints: "billing, technical, sales"
   Speech Timeout: 3 seconds
   ↓
3. Route to Department (Redirect)
   Webhook: https://yourapi.com/route-support
   ↓
4. End (Hangup)
```

## TwiML Integration with Twilio

### Deployment Steps

1. **Generate TwiML**
   - Build your flow in the IVR Menu Builder
   - Click "View TwiML" to preview the generated XML
   - Click "Copy TwiML" to copy to clipboard

2. **Configure Twilio**
   - Go to your Twilio Console
   - Navigate to Phone Numbers > Manage > Active Numbers
   - Select your phone number
   - Under "Voice Configuration":
     - Set "Accept incoming calls" to enabled
     - Set webhook URL to your IVR endpoint
     - Method: POST

3. **Host the TwiML**
   - Option A: Return TwiML directly from an HTTP endpoint
   - Option B: Use the "Download XML" feature and upload to a static host

### Example Node.js Endpoint

```typescript
import express from 'express';

const app = express();

app.post('/ivr-webhook', (req, res) => {
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" engine="elevenlabs">
    Thank you for calling. How can we help you today?
  </Say>
  <Gather timeout="5" numDigits="1" finishOnKey="#">
    <Say>Press 1 for sales, 2 for support, or 3 to speak with an agent.</Say>
  </Gather>
  <Redirect method="POST">https://yourapi.com/handle-input</Redirect>
</Response>`;

  res.type('text/xml');
  res.send(twimlResponse);
});

app.listen(3000);
```

## Advanced Features

### Voice Configuration

#### ElevenLabs Integration
- Professional-quality text-to-speech
- Natural prosody and emotion
- Multiple voice options available
- Best for customer-facing messages

#### Twilio Voice
- Built-in, no additional setup
- Faster response times
- Good for simple IVRs
- Less natural-sounding but reliable

### Language Support
The builder supports 6 languages natively. Each Say node can use different languages:

```xml
<!-- English US -->
<Say language="en-US">Welcome</Say>

<!-- Spanish -->
<Say language="es-ES">Bienvenido</Say>

<!-- French -->
<Say language="fr-FR">Bienvenue</Say>

<!-- German -->
<Say language="de-DE">Willkommen</Say>

<!-- Portuguese (BR) -->
<Say language="pt-BR">Bem-vindo</Say>
```

### Webhook Routing

Redirect nodes allow dynamic routing based on your business logic:

```json
{
  "type": "redirect",
  "config": {
    "url": "https://api.example.com/route-call",
    "method": "POST"
  }
}
```

Your webhook receives a POST request with:
```json
{
  "Digits": "1",
  "SpeechResult": "sales",
  "Confidence": 0.95
}
```

## Node Configuration Export/Import

### Save as JSON
The "Save as JSON" button exports your entire flow:

```json
[
  {
    "id": "1",
    "type": "say",
    "label": "Welcome Message",
    "config": {
      "text": "Thank you for calling",
      "voice": "elevenlabs",
      "language": "en-US",
      "speed": 1,
      "pause_after": 500
    },
    "nextNode": "2"
  },
  {
    "id": "2",
    "type": "gather",
    "label": "Main Menu",
    "config": {
      "timeout": 5,
      "num_digits": 1,
      "finish_on_key": "#",
      "hints": "sales, support",
      "speech_timeout": 3000
    },
    "nextNode": "3"
  }
]
```

This JSON can be:
- Backed up for version control
- Shared with team members
- Used as a template for similar flows
- Imported into another instance (feature pending)

## Best Practices

### 1. **Message Clarity**
- Keep messages concise (under 30 seconds)
- Use clear, friendly language
- Provide explicit instructions
- Repeat important information

### 2. **Timeout Configuration**
- Standard timeout: 5 seconds
- Complex decisions: 8-10 seconds
- Quick confirmations: 3 seconds
- Accessibility: up to 15 seconds for users with disabilities

### 3. **Input Collection**
- Gather single digits for simple choices (1-3 options)
- Use speech recognition for more options (5+ alternatives)
- Always provide spoken instructions before gathering input
- Offer a "0" option to return to previous menu

### 4. **Error Handling**
```xml
<Gather timeout="5" numDigits="1">
  <Say>Press 1 for sales or 2 for support</Say>
</Gather>
<!-- If no input, flow ends - provide fallback -->
```

### 5. **Flow Structure**
- Start with a clear greeting
- Present menus progressively (avoid option overload)
- Use redirects for complex logic
- Always provide an exit path

## Common Patterns

### Pattern 1: Simple Menu
```
Say (Options) → Gather (1 digit) → Hangup
```

### Pattern 2: Multi-Level Menu
```
Say (Main) → Gather → Say (Submenu) → Gather → Redirect → Hangup
```

### Pattern 3: Confirmation Loop
```
Say (Question) → Gather → Say (Confirm) → Gather → Redirect
```

### Pattern 4: Dynamic Routing
```
Say → Gather → Redirect (to API) → Say (Result) → Hangup
```

## Troubleshooting

### Issue: TwiML Won't Parse
**Solution**: 
- Check for unescaped XML characters (<, >, &, ")
- The builder auto-escapes these, but verify your webhook returns proper XML
- Validate with an XML validator

### Issue: Call Cuts Off During Message
**Solution**:
- Reduce message length
- Use Pause After to allow TTS completion
- Test with different voices

### Issue: Gather Not Collecting Input
**Solution**:
- Increase timeout value
- Verify Num Digits matches expected input length
- Check that input is received by your webhook
- Test with actual phone calls (not VoIP software)

### Issue: Webhook Not Receiving Data
**Solution**:
- Verify webhook URL is publicly accessible
- Check that Twilio has internet access to your endpoint
- Use ngrok or similar for local development: `ngrok http 3000`
- Add logging to your webhook handler
- Test webhook directly with curl/Postman

## API Reference

### Say Node Configuration
```typescript
interface SayConfig {
  text: string;           // Required: Message text
  voice?: "elevenlabs" | "twilio";  // Default: "elevenlabs"
  language?: string;      // Default: "en-US"
  speed?: number;         // Range: 0.5-2, Default: 1
  pause_after?: number;   // Range: 0-5000ms, Default: 0
}
```

### Gather Node Configuration
```typescript
interface GatherConfig {
  timeout?: number;       // Range: 1-30, Default: 5
  num_digits?: number;    // Range: 1-20, Default: 1
  finish_on_key?: string; // Default: "#"
  hints?: string;         // Comma-separated voice hints
  speech_timeout?: number; // Range: 100-10000ms, Default: 3000
}
```

### Redirect Node Configuration
```typescript
interface RedirectConfig {
  url: string;           // Required: Webhook URL
  method?: "GET" | "POST"; // Default: "POST"
}
```

### Hangup Node Configuration
```typescript
interface HangupConfig {
  reason?: string;       // Optional: Reason for hangup
}
```

## Next Steps

1. **Test Your Flow**: Use Twilio's built-in call simulator
2. **Monitor Calls**: Check the Voice Agent page for call metrics
3. **Iterate**: Adjust based on call recordings and transcripts
4. **Scale**: Use the JSON export to create variations of your flow
5. **Integrate**: Connect to your CRM via webhooks for dynamic routing

## Support

For issues or questions:
- Check the info box in the builder for quick reference
- Review call transcripts in the Voice Agent section
- Export your flow configuration for debugging
- Contact support with your flow JSON for assistance

## Related Documentation

- [Twilio TwiML Reference](https://www.twilio.com/docs/voice/twiml)
- [Voice Agent Recordings](/portal/voice-agent)
- [Campaigns Builder](/portal/campaigns)
- [Integration Settings](/portal/integrations)
