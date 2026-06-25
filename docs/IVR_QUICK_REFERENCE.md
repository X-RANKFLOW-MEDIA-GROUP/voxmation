# IVR Menu Builder - Quick Reference

## Accessing the Builder
- **URL**: `/portal/voice-settings`
- **Navigation**: Portal → Voice Settings (sidebar)
- **Requirements**: User must be logged into portal

## Node Types at a Glance

| Type | Purpose | Use When |
|------|---------|----------|
| **Say** | Play message | Greeting, instructions, confirmation |
| **Gather** | Collect input | Menu selection, DTMF or speech |
| **Redirect** | Forward call | Need dynamic logic or external routing |
| **Hangup** | End call | Call complete or no valid input |

## Quick Setup: 5-Minute Flow

```
1. Add Node (default Say)
   → "Thank you for calling!"
   
2. Add Node → Change to Gather
   → Timeout: 5s, Num Digits: 1
   → Hints: "sales, support"
   
3. Add Node → Change to Redirect
   → URL: https://yourapi.com/handle
   
4. Add Node → Hangup
```

Then: **Copy TwiML** → Paste in Twilio console

## Configuration Cheat Sheet

### Say Node
```
Text: Required
Voice: elevenlabs (default) or twilio
Language: en-US, en-GB, es-ES, fr-FR, de-DE, pt-BR
Speed: 0.5 - 2.0 (1 = normal)
Pause: 0 - 5000 ms
```

### Gather Node
```
Timeout: 1-30 seconds (5 default)
Digits: 1-20 (1 default)
End Key: # or *
Speech Timeout: 100-10000 ms
Hints: Comma-separated words
```

### Redirect Node
```
URL: https://yourapi.com/webhook
Method: POST (default) or GET
```

### Hangup Node
```
Reason: Optional description
```

## Keyboard Shortcuts (Future)
- `+` Add node
- `Delete` Remove selected node
- `Ctrl+C` Copy TwiML
- `Ctrl+S` Save flow

## Output Formats

### TwiML Export
- **Copy**: Single click to clipboard
- **Download**: XML file for static hosting
- Used directly with Twilio webhook

### Flow Export
- **Save as JSON**: Full configuration backup
- Import (coming soon): Restore from JSON
- Share with team members

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| TwiML parse error | XML special chars | Builder escapes automatically |
| No sound | Missing Say node | Add Say before Gather |
| Input not collected | Low timeout | Increase to 5-10 seconds |
| Webhook fails | URL unreachable | Check endpoint publicly accessible |

## Integration Checklist

- [ ] Build IVR flow in builder
- [ ] Copy TwiML from "View TwiML"
- [ ] Test flow with Twilio simulator
- [ ] Deploy webhook endpoint
- [ ] Configure Twilio phone number with webhook
- [ ] Set method to POST
- [ ] Test with real phone call
- [ ] Monitor in Voice Agent section

## Voice Settings Recommended

| Scenario | Voice | Language | Speed |
|----------|-------|----------|-------|
| Professional | ElevenLabs | en-US | 1.0 |
| Casual | ElevenLabs | en-US | 0.9 |
| Multi-language | ElevenLabs | Mixed | 1.0 |
| Simple | Twilio | en-US | 1.0 |

## TwiML Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" engine="elevenlabs" rate="1.0">
    Welcome to our support line
  </Say>
  <Gather timeout="5" numDigits="1" finishOnKey="#">
    <Say>Press 1 for sales, 2 for support</Say>
  </Gather>
  <Redirect method="POST">https://api.example.com/route</Redirect>
</Response>
```

## Webhook Payload Example

```json
{
  "CallSid": "CA123456789",
  "Digits": "1",
  "SpeechResult": "sales",
  "Confidence": 0.95,
  "AccountSid": "AC123456",
  "From": "+1234567890",
  "To": "+0987654321",
  "CallStatus": "in-progress"
}
```

## Quick Stats Panel

- **Total Nodes**: Count of all nodes
- **Say Nodes**: Message count
- **Gather Nodes**: Input points
- **Redirect Nodes**: Logic points

## Files Generated

1. **XML (TwiML)**: Use with Twilio
2. **JSON (Flow)**: Backup & sharing
3. **Clipboard**: Quick integration

## Pro Tips

1. **Test First**: Use Twilio simulator before production
2. **Short Messages**: Keep under 30 seconds
3. **Clear Instructions**: Always tell caller what to do
4. **Feedback**: Confirm input with "You selected..."
5. **Exit Option**: Always provide way to escape menu
6. **Logging**: Log webhook calls for debugging
7. **Versioning**: Save JSON with version numbers
8. **Multi-language**: Create separate flows per language

## Portal Navigation

- **Voice Agent**: View call recordings & transcripts
- **Voice Settings** (IVR): Build call flows
- **Campaigns**: Create outbound campaigns
- **Integrations**: Connect to external services
- **Automations**: Set up auto-responders

## Support Resources

- 📖 Full Docs: [IVR_MENU_BUILDER.md](./IVR_MENU_BUILDER.md)
- 🎙️ Voice Agent: See call analytics
- 📝 Test & Debug: Use call transcripts
- 🔗 Twilio Reference: https://www.twilio.com/docs/voice/twiml

## Keyboard Shortcuts (Available Now)

- Click node to expand/collapse
- "+ Add Node" button to create new nodes
- "Delete Node" to remove (min 1 node)
- Drag handle (future: node reordering)

---
**Last Updated**: June 2024
**Version**: 1.0
