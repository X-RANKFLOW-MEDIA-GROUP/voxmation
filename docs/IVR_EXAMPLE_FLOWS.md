# IVR Menu Builder - Example Flows

This document contains ready-to-use example flows that you can build in the IVR Menu Builder.

## Example 1: Basic Support Menu

**Use Case**: Small business with 2-3 departments

### Flow Diagram
```
START
  ↓
Say: "Welcome to Customer Support. Thank you for calling."
  ↓
Say: "Press 1 for billing questions, press 2 for technical support, or press 3 to reach an agent."
  ↓
Gather: (1 digit, 5 sec timeout)
  ↓
Redirect: https://api.example.com/route-support
  ↓
Say: "Thank you. Your call is being transferred."
  ↓
Hangup
END
```

### Node Configuration

**Node 1: Welcome**
- Type: Say
- Text: "Welcome to Customer Support. Thank you for calling."
- Voice: ElevenLabs
- Language: en-US
- Speed: 1.0

**Node 2: Menu**
- Type: Say
- Text: "Press 1 for billing questions, press 2 for technical support, or press 3 to reach an agent."
- Voice: ElevenLabs
- Language: en-US

**Node 3: Selection**
- Type: Gather
- Timeout: 5 seconds
- Num Digits: 1
- Finish On Key: #
- Hints: billing, technical, agent

**Node 4: Route**
- Type: Redirect
- URL: https://api.example.com/route-support
- Method: POST

**Node 5: Confirmation**
- Type: Say
- Text: "Thank you. Your call is being transferred."

**Node 6: End**
- Type: Hangup

### Generated TwiML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" engine="elevenlabs">Welcome to Customer Support. Thank you for calling.</Say>
  <Say voice="alice" engine="elevenlabs">Press 1 for billing questions, press 2 for technical support, or press 3 to reach an agent.</Say>
  <Gather timeout="5" numDigits="1" finishOnKey="#">
    <Say>Press a digit or speak your choice.</Say>
  </Gather>
  <Redirect method="POST">https://api.example.com/route-support</Redirect>
  <Say voice="alice" engine="elevenlabs">Thank you. Your call is being transferred.</Say>
  <Hangup/>
</Response>
```

---

## Example 2: Restaurant Reservation System

**Use Case**: Fine dining restaurant with automated booking

### Flow Diagram
```
START
  ↓
Say: "Welcome to Giuseppe's. We have reservations available."
  ↓
Say: "Press 1 for dinner reservations, 2 for lunch, or 3 for special events."
  ↓
Gather: (1 digit, 6 sec timeout)
  ↓
Say: "You selected [selection]. Processing your request..."
  ↓
Redirect: https://booking.restaurant.com/api/reserve
  ↓
Hangup
END
```

### Node Configuration

**Node 1: Welcome**
- Type: Say
- Text: "Welcome to Giuseppe's Italian Restaurant. We have wonderful reservations available for you."
- Voice: ElevenLabs
- Language: en-US
- Speed: 0.95 (slightly slower for elegance)

**Node 2: Menu**
- Type: Say
- Text: "Press 1 for dinner reservations, press 2 for lunch, or press 3 for special events and private parties."
- Voice: ElevenLabs
- Language: en-US

**Node 3: Selection**
- Type: Gather
- Timeout: 6 seconds
- Num Digits: 1
- Hints: dinner, lunch, events

**Node 4: Confirmation**
- Type: Say
- Text: "Thank you. Processing your reservation request. Please hold while we check availability."
- Pause After: 1000ms

**Node 5: Book**
- Type: Redirect
- URL: https://booking.restaurant.com/api/reserve
- Method: POST

**Node 6: End**
- Type: Hangup
- Reason: Reservation processed

---

## Example 3: Healthcare Appointment Reminder

**Use Case**: Medical office confirming appointments and collecting information

### Flow Diagram
```
START
  ↓
Say: "Hello, this is a reminder about your upcoming appointment."
  ↓
Say: "Please confirm your appointment by pressing 1, or press 2 to reschedule."
  ↓
Gather: (1 digit, 8 sec timeout, speech enabled)
  ↓
Redirect: https://healthapi.example.com/confirm-appointment
  ↓
Say: "Thank you. Your appointment has been confirmed. Goodbye."
  ↓
Hangup
END
```

### Node Configuration

**Node 1: Greeting**
- Type: Say
- Text: "Hello, this is a reminder about your upcoming appointment on Friday at 2 PM with Dr. Smith."
- Voice: ElevenLabs
- Language: en-US
- Speed: 0.9

**Node 2: Options**
- Type: Say
- Text: "Please press 1 to confirm your appointment, or press 2 if you need to reschedule."
- Voice: ElevenLabs

**Node 3: Input**
- Type: Gather
- Timeout: 8 seconds
- Num Digits: 1
- Speech Timeout: 4000ms
- Hints: confirm, reschedule

**Node 4: Process**
- Type: Redirect
- URL: https://healthapi.example.com/confirm-appointment
- Method: POST

**Node 5: Confirmation**
- Type: Say
- Text: "Thank you for confirming. We look forward to seeing you. Goodbye."

**Node 6: End**
- Type: Hangup

---

## Example 4: Hotel Concierge Service

**Use Case**: 5-star hotel multi-level menu system

### Flow Diagram
```
START
  ↓
Say: "Welcome to the Grand Plaza Hotel Concierge."
  ↓
Say: "Press 1 for room service, 2 for reservations, 3 for housekeeping, or 4 for the front desk."
  ↓
Gather: (1 digit, 10 sec timeout)
  ↓
Say: "Your request is being processed..."
  ↓
Redirect: https://hotelapi.example.com/concierge
  ↓
Hangup
END
```

### Node Configuration

**Node 1: Welcome**
- Type: Say
- Text: "Welcome to the Grand Plaza Hotel Concierge. Thank you for choosing to stay with us."
- Voice: ElevenLabs
- Language: en-US
- Speed: 0.9

**Node 2: MainMenu**
- Type: Say
- Text: "Press 1 for room service and dining, press 2 for restaurant reservations, press 3 for housekeeping services, or press 4 to reach the front desk."
- Voice: ElevenLabs

**Node 3: Selection**
- Type: Gather
- Timeout: 10 seconds
- Num Digits: 1
- Hints: room service, reservations, housekeeping, front desk

**Node 4: Processing**
- Type: Say
- Text: "Thank you. Your request is being processed. Please hold for the next available agent."
- Pause After: 1500ms

**Node 5: Route**
- Type: Redirect
- URL: https://hotelapi.example.com/concierge
- Method: POST

**Node 6: End**
- Type: Hangup

---

## Example 5: Multilingual Menu (English/Spanish)

**Use Case**: Restaurant serving bilingual communities

### Flow Diagram
```
START
  ↓
Say: "Welcome! / ¡Bienvenido!"
  ↓
Say: "Press 1 for English, presione 2 para español."
  ↓
Gather: (1 digit, 5 sec)
  ↓
Redirect: https://api.example.com/lang-route
  ↓
Hangup
END
```

### Node Configuration

**Node 1: Bilingual Welcome**
- Type: Say
- Text: "Welcome! ¡Bienvenido!"
- Voice: ElevenLabs
- Language: en-US

**Node 2: Language Selection**
- Type: Say
- Text: "Press 1 for English service. Presione 2 para servicio en español."
- Voice: ElevenLabs
- Language: en-US

**Node 3: Input**
- Type: Gather
- Timeout: 5 seconds
- Num Digits: 1
- Hints: English, Spanish

**Node 4: Route**
- Type: Redirect
- URL: https://api.example.com/lang-route
- Method: POST

**Node 5: End**
- Type: Hangup

### Webhook Handler Example (Node.js)

```javascript
app.post('/lang-route', (req, res) => {
  const digit = req.body.Digits;
  
  if (digit === '1') {
    // Route to English flow
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" engine="elevenlabs">
    Press 1 for sales, 2 for support.
  </Say>
  <Gather timeout="5" numDigits="1">
    <Say>Choose an option.</Say>
  </Gather>
</Response>`);
  } else if (digit === '2') {
    // Route to Spanish flow
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" engine="elevenlabs" language="es-ES">
    Presione 1 para ventas, 2 para soporte.
  </Say>
  <Gather timeout="5" numDigits="1">
    <Say language="es-ES">Elija una opción.</Say>
  </Gather>
</Response>`);
  }
});
```

---

## Example 6: E-commerce Order Status

**Use Case**: Online retailer providing order tracking

### Flow Diagram
```
START
  ↓
Say: "Thank you for calling. Enter your 6-digit order number."
  ↓
Gather: (6 digits, 10 sec timeout)
  ↓
Redirect: https://ecommerce.example.com/order-status
  ↓
Say: "Thank you. Your order information will be displayed."
  ↓
Hangup
END
```

### Node Configuration

**Node 1: Welcome**
- Type: Say
- Text: "Thank you for calling our customer service. We're here to help with your order."
- Voice: ElevenLabs
- Language: en-US

**Node 2: Prompt**
- Type: Say
- Text: "Please enter your 6-digit order number, followed by the hash key."
- Voice: ElevenLabs

**Node 3: Input**
- Type: Gather
- Timeout: 10 seconds
- Num Digits: 6
- Finish On Key: #
- Speech Timeout: 3000ms

**Node 4: Lookup**
- Type: Redirect
- URL: https://ecommerce.example.com/order-status
- Method: POST

**Node 5: Confirmation**
- Type: Say
- Text: "Your order status is being retrieved. Please stand by."

**Node 6: End**
- Type: Hangup

---

## Example 7: Appointment Booking with Date Input

**Use Case**: Professional services (salon, dental, legal)

### Flow Diagram
```
START
  ↓
Say: "Welcome to [Business Name] appointment line."
  ↓
Say: "We're currently [OPEN/CLOSED]. Enter appointment date as MMDD."
  ↓
Gather: (4 digits, 12 sec timeout)
  ↓
Say: "Thank you. Processing your date preference..."
  ↓
Redirect: https://booking.example.com/check-availability
  ↓
Say: "Please hold while we find available times."
  ↓
Hangup
END
```

### Node Configuration

**Node 1: Welcome**
- Type: Say
- Text: "Welcome to Manhattan Dental Studio. We're happy to help you schedule an appointment."
- Voice: ElevenLabs
- Speed: 0.95

**Node 2: Hours**
- Type: Say
- Text: "We are currently open and taking appointments. Please enter your preferred appointment date as month and day. For example, press 0625 for June 25th."

**Node 3: DateEntry**
- Type: Gather
- Timeout: 12 seconds
- Num Digits: 4
- Finish On Key: #
- Speech Timeout: 4000ms

**Node 4: Confirm**
- Type: Say
- Text: "Thank you for providing your date preference. Processing your request now..."
- Pause After: 2000ms

**Node 5: CheckAvailability**
- Type: Redirect
- URL: https://booking.example.com/check-availability
- Method: POST

**Node 6: Wait**
- Type: Say
- Text: "Please hold while we find the best available times for you."

**Node 7: End**
- Type: Hangup

---

## Example 8: Survey/Feedback Collection

**Use Case**: Post-call satisfaction survey

### Flow Diagram
```
START
  ↓
Say: "Thank you for your call. We'd like your feedback."
  ↓
Say: "Rate your experience from 1 (poor) to 5 (excellent)."
  ↓
Gather: (1 digit, 10 sec timeout)
  ↓
Say: "Thank you for rating us. Any additional comments?"
  ↓
Redirect: https://api.example.com/save-survey
  ↓
Say: "Thank you for your feedback. Goodbye."
  ↓
Hangup
END
```

### Node Configuration

**Node 1: Introduction**
- Type: Say
- Text: "Thank you for choosing us. We'd love to hear about your experience."
- Voice: ElevenLabs

**Node 2: Rating Prompt**
- Type: Say
- Text: "Please rate your experience today on a scale of 1 to 5, where 1 is poor and 5 is excellent."

**Node 3: Rating**
- Type: Gather
- Timeout: 10 seconds
- Num Digits: 1
- Hints: excellent, good, fair, poor

**Node 4: Comment Prompt**
- Type: Say
- Text: "Would you like to leave a voice comment about your experience? Press 1 for yes, 2 for no."

**Node 5: Comment**
- Type: Gather
- Timeout: 15 seconds
- Num Digits: 1

**Node 6: SaveSurvey**
- Type: Redirect
- URL: https://api.example.com/save-survey
- Method: POST

**Node 7: Thanks**
- Type: Say
- Text: "Thank you very much for your feedback. Have a great day!"

**Node 8: End**
- Type: Hangup
- Reason: Survey completed

---

## Implementation Checklist

For each example above:

1. **Build Flow**
   - [ ] Create nodes in order
   - [ ] Configure each node
   - [ ] Set next node links

2. **Test**
   - [ ] View TwiML
   - [ ] Verify XML structure
   - [ ] Copy TwiML for testing

3. **Deploy**
   - [ ] Create webhook endpoint
   - [ ] Deploy to production
   - [ ] Configure Twilio phone number

4. **Monitor**
   - [ ] Check Voice Agent logs
   - [ ] Review transcripts
   - [ ] Adjust based on calls

---

## Quick Copy-Paste TwiML

### Minimal Flow
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" engine="elevenlabs">Thank you for calling.</Say>
  <Hangup/>
</Response>
```

### Simple Menu
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" engine="elevenlabs">Press 1 or 2.</Say>
  <Gather timeout="5" numDigits="1">
    <Say>Choose now.</Say>
  </Gather>
</Response>
```

### Full Flow Template
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" engine="elevenlabs">[GREETING]</Say>
  <Say voice="alice" engine="elevenlabs">[MENU OPTIONS]</Say>
  <Gather timeout="5" numDigits="1" finishOnKey="#">
    <Say>Please make a selection.</Say>
  </Gather>
  <Redirect method="POST">[YOUR WEBHOOK URL]</Redirect>
</Response>
```

---

## Tips for Success

1. **Test Before Deploying**: Use Twilio's call simulator
2. **Keep Messages Short**: Under 30 seconds each
3. **Be Clear**: Explicitly state what to do
4. **Provide Escape**: Always allow return to previous menu or operator
5. **Log Everything**: Track what users select
6. **Iterate**: Improve based on real call data
7. **Backup Flow**: Save JSON configuration regularly

---

**Need Help?**
- Check the [Full Documentation](./IVR_MENU_BUILDER.md)
- Review call recordings in [Voice Agent](/portal/voice-agent)
- See troubleshooting section
