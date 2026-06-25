/**
 * ElevenLabs Voice Integration Examples
 *
 * Complete working examples for common use cases:
 * - Simple greeting
 * - Interactive menu
 * - Voicemail system
 * - Survey calls
 * - Emergency announcements
 * - Multi-language support
 */

import {
  ElevenLabsVoiceGenerator,
  IVRMenuBuilder,
  VOICE_PRESETS,
  buildVoiceGreeting,
  buildVoiceMenu,
  buildVoiceMailPrompt,
  buildVoiceConfirmation,
  buildVoiceTransfer,
  buildVoiceSurvey,
  validateVoicePrompt,
  estimateSpeechDuration,
} from "./elevenlabs.js";

// =============================================================================
// EXAMPLE 1: Simple Greeting System
// =============================================================================

export async function exampleSimpleGreeting() {
  console.log("\n=== Example 1: Simple Greeting ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
    voiceId: VOICE_PRESETS.FRIENDLY,
  });

  try {
    // Generate greeting
    const result = await voiceGenerator.generateVoice({
      text: "Welcome to ABC Company. Thank you for calling.",
    });

    console.log("Generated greeting:");
    console.log("- Format:", result.format);
    console.log("- Voice ID:", result.voiceId);
    console.log("- Timestamp:", result.timestamp);

    // Build TwiML response
    const twiml = await buildVoiceGreeting(voiceGenerator, {
      text: "Welcome to ABC Company. Thank you for calling.",
      voiceId: VOICE_PRESETS.FRIENDLY,
    });

    console.log("\nGenerated TwiML:");
    console.log(twiml);
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// EXAMPLE 2: Interactive Menu System
// =============================================================================

export async function exampleInteractiveMenu() {
  console.log("\n=== Example 2: Interactive Menu ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
  });

  try {
    // Create menu builder
    const menu = new IVRMenuBuilder(voiceGenerator, {
      greeting:
        "Thank you for calling ABC Company. Please listen carefully as our menu options have changed.",
      greetingVoiceId: VOICE_PRESETS.PROFESSIONAL,
      items: [
        {
          key: "1",
          text: "Sales",
          prompt: "Press 1 to speak with our sales team.",
          voiceId: VOICE_PRESETS.FRIENDLY,
          action: "dial",
          actionTarget: "+1-555-0100",
        },
        {
          key: "2",
          text: "Technical Support",
          prompt: "Press 2 for technical support.",
          voiceId: VOICE_PRESETS.FRIENDLY,
          action: "dial",
          actionTarget: "+1-555-0200",
        },
        {
          key: "3",
          text: "Billing",
          prompt: "Press 3 for billing inquiries.",
          voiceId: VOICE_PRESETS.FRIENDLY,
          action: "dial",
          actionTarget: "+1-555-0300",
        },
        {
          key: "0",
          text: "Repeat Menu",
          prompt: "Press 0 to repeat this menu.",
          action: "redirect",
          actionTarget: "https://api.example.com/voice/menu",
        },
      ],
      timeout: 5,
      maxRetries: 3,
      retryMessage:
        "I did not receive a valid selection. Please try again or press 0 to repeat the menu.",
      retryVoiceId: VOICE_PRESETS.FRIENDLY,
      baseUrl: "https://api.example.com",
    });

    // Build complete menu
    const menuResponse = await menu.buildCompleteMenu();

    console.log("Generated Menu Items:");
    menuResponse.menuItems.forEach((item) => {
      console.log(`- ${item.key}: ${item.text} (${item.prompt})`);
    });

    console.log("\nGenerated Audio URLs:");
    Object.entries(menuResponse.audioUrls).forEach(([key, url]) => {
      console.log(`- ${key}: ${url}`);
    });

    console.log("\nGenerated TwiML (first 500 chars):");
    console.log(menuResponse.twiml.substring(0, 500) + "...");
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// EXAMPLE 3: Voicemail System
// =============================================================================

export async function exampleVoicemailSystem() {
  console.log("\n=== Example 3: Voicemail System ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
    voiceId: VOICE_PRESETS.WARM,
  });

  try {
    const twiml = await buildVoiceMailPrompt(voiceGenerator, {
      prompt:
        "We are unable to take your call at this moment. Please leave a message with your name and phone number, and we will return your call as soon as possible. Press the pound key when you are finished recording.",
      voiceId: VOICE_PRESETS.WARM,
      maxLength: 180, // 3 minutes
      timeout: 3,
    });

    console.log("Voicemail TwiML Response:");
    console.log(twiml);

    // Estimate recording prompt duration
    const duration = estimateSpeechDuration(
      "We are unable to take your call at this moment. Please leave a message with your name and phone number, and we will return your call as soon as possible."
    );
    console.log(`\nEstimated prompt duration: ${duration} seconds`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// EXAMPLE 4: Payment Confirmation System
// =============================================================================

export async function examplePaymentConfirmation() {
  console.log("\n=== Example 4: Payment Confirmation ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
  });

  try {
    // Generate confirmation prompt with amount
    const amount = 150.99;
    const message = `You are about to pay $${amount.toFixed(2)} to ABC Company. Is this correct? Press 1 to confirm or 2 to cancel.`;

    // Validate prompt
    const validation = validateVoicePrompt(message);
    if (!validation.valid) {
      console.error("Validation errors:", validation.errors);
      return;
    }

    const twiml = await buildVoiceConfirmation(voiceGenerator, {
      message,
      voiceId: VOICE_PRESETS.PROFESSIONAL,
      confirmKey: "1",
      cancelKey: "2",
      actionUrl: "https://api.example.com/voice/payment-confirmation",
    });

    console.log("Payment Confirmation TwiML:");
    console.log(twiml);
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// EXAMPLE 5: Call Transfer with Announcement
// =============================================================================

export async function exampleCallTransfer() {
  console.log("\n=== Example 5: Call Transfer ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
    voiceId: VOICE_PRESETS.WARM,
  });

  try {
    const twiml = await buildVoiceTransfer(voiceGenerator, {
      announcement:
        "Thank you for holding. I am now connecting you to a representative. Your call is important to us.",
      phoneNumber: "+1-555-0100",
      voiceId: VOICE_PRESETS.WARM,
      timeout: 45,
      callerId: "+1-555-COMPANY",
    });

    console.log("Call Transfer TwiML:");
    console.log(twiml);
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// EXAMPLE 6: Customer Satisfaction Survey
// =============================================================================

export async function exampleCustomerSurvey() {
  console.log("\n=== Example 6: Customer Satisfaction Survey ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
  });

  try {
    const twiml = await buildVoiceSurvey(voiceGenerator, {
      greeting:
        "Thank you for choosing ABC Company. We would like to get your feedback on today's call. Your responses will help us improve our service.",
      voiceId: VOICE_PRESETS.FRIENDLY,
      questions: [
        {
          number: "1",
          text: "On a scale of 1 to 5, with 1 being very dissatisfied and 5 being very satisfied, how satisfied are you with our service?",
          voiceId: VOICE_PRESETS.FRIENDLY,
        },
        {
          number: "2",
          text: "Would you recommend our service to a colleague? Press 1 for yes or 2 for no.",
          voiceId: VOICE_PRESETS.FRIENDLY,
        },
      ],
      surveyUrl: "https://api.example.com/voice/survey-response",
    });

    console.log("Survey TwiML Response:");
    console.log(twiml);
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// EXAMPLE 7: Emergency Announcement System
// =============================================================================

export async function exampleEmergencyAnnouncement() {
  console.log("\n=== Example 7: Emergency Announcement ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
    voiceId: VOICE_PRESETS.DEEP,
  });

  try {
    // Emergency message with high stability and similarity
    const emergencyMessage =
      "Attention! This is an emergency broadcast message. All users are required to acknowledge this notification. Press 1 to acknowledge.";

    const result = await voiceGenerator.generateVoice({
      text: emergencyMessage,
      voiceId: VOICE_PRESETS.DEEP,
      voiceSettings: {
        stability: 0.95, // Very consistent
        similarity_boost: 0.95, // High similarity
      },
    });

    console.log("Emergency announcement generated:");
    console.log("- Duration estimated:", estimateSpeechDuration(emergencyMessage), "seconds");
    console.log("- Voice (deep/authoritative):", result.voiceId);
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// EXAMPLE 8: Multi-voice Interactive Menu
// =============================================================================

export async function exampleMultiVoiceMenu() {
  console.log("\n=== Example 8: Multi-Voice Interactive Menu ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
  });

  try {
    // Create menu with different voices per option
    const menu = new IVRMenuBuilder(voiceGenerator, {
      greeting: "Welcome! This system features different voices for variety.",
      greetingVoiceId: VOICE_PRESETS.PROFESSIONAL,
      items: [
        {
          key: "1",
          text: "Sales (Friendly)",
          prompt: "Press 1 for our sales team. They will help you find the perfect solution.",
          voiceId: VOICE_PRESETS.FRIENDLY,
          action: "dial",
          actionTarget: "+1-555-0100",
        },
        {
          key: "2",
          text: "Support (Professional)",
          prompt: "Press 2 for technical support. Our experts are standing by.",
          voiceId: VOICE_PRESETS.PROFESSIONAL,
          action: "dial",
          actionTarget: "+1-555-0200",
        },
        {
          key: "3",
          text: "Accounting (Energetic)",
          prompt: "Press 3 for accounting and invoicing support.",
          voiceId: VOICE_PRESETS.ENERGETIC,
          action: "dial",
          actionTarget: "+1-555-0300",
        },
        {
          key: "4",
          text: "Executive (Deep)",
          prompt: "Press 4 for executive services.",
          voiceId: VOICE_PRESETS.DEEP,
          action: "dial",
          actionTarget: "+1-555-0400",
        },
      ],
      timeout: 6,
      baseUrl: "https://api.example.com",
    });

    const menuResponse = await menu.buildCompleteMenu();

    console.log("Multi-voice menu items:");
    menuResponse.menuItems.forEach((item) => {
      console.log(`\n${item.key}: ${item.text}`);
      console.log(`   Voice ID: ${item.voiceId}`);
      console.log(`   Prompt: "${item.prompt}"`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// EXAMPLE 9: Appointment Reminder System
// =============================================================================

export async function exampleAppointmentReminder() {
  console.log("\n=== Example 9: Appointment Reminder ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
    voiceId: VOICE_PRESETS.WARM,
  });

  try {
    // Build appointment reminder menu
    const appointmentDate = "tomorrow at 2 PM";
    const doctorName = "Dr. Smith";

    const menu = new IVRMenuBuilder(voiceGenerator, {
      greeting: `This is a reminder that you have an appointment with ${doctorName} ${appointmentDate}.`,
      greetingVoiceId: VOICE_PRESETS.WARM,
      items: [
        {
          key: "1",
          text: "Confirm",
          prompt: "Press 1 to confirm your appointment.",
          voiceId: VOICE_PRESETS.WARM,
          action: "redirect",
          actionTarget: "https://api.example.com/appointments/confirm",
        },
        {
          key: "2",
          text: "Reschedule",
          prompt: "Press 2 to reschedule your appointment.",
          voiceId: VOICE_PRESETS.WARM,
          action: "redirect",
          actionTarget: "https://api.example.com/appointments/reschedule",
        },
        {
          key: "3",
          text: "Cancel",
          prompt: "Press 3 to cancel your appointment.",
          voiceId: VOICE_PRESETS.WARM,
          action: "redirect",
          actionTarget: "https://api.example.com/appointments/cancel",
        },
      ],
      timeout: 10,
      maxRetries: 2,
      baseUrl: "https://api.example.com",
    });

    const response = await menu.buildCompleteMenu();
    console.log("Appointment Reminder Menu Created");
    console.log(`Total menu items: ${response.menuItems.length}`);
    console.log(`Audio files generated: ${Object.keys(response.audioUrls).length}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// EXAMPLE 10: Help Desk Queue Announcement
// =============================================================================

export async function exampleHelpDeskQueue() {
  console.log("\n=== Example 10: Help Desk Queue Announcement ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
    voiceId: VOICE_PRESETS.PROFESSIONAL,
  });

  try {
    // Dynamic queue position message
    const queuePosition = 3;
    const estimatedWaitTime = 5; // minutes

    const queueMessage = `Thank you for calling our support team. You are currently number ${queuePosition} in the queue. Your estimated wait time is approximately ${estimatedWaitTime} minutes. Your call is very important to us.`;

    // Validate before generation
    const validation = validateVoicePrompt(queueMessage);
    console.log(`Message validation: ${validation.valid ? "✓ Valid" : "✗ Invalid"}`);

    if (validation.valid) {
      const result = await voiceGenerator.generateVoice({
        text: queueMessage,
        voiceId: VOICE_PRESETS.PROFESSIONAL,
        voiceSettings: {
          stability: 0.7,
          similarity_boost: 0.8,
        },
      });

      console.log("Queue announcement generated:");
      console.log("- Text:", queueMessage);
      console.log("- Duration:", estimateSpeechDuration(queueMessage), "seconds");
      console.log("- Format:", result.format);
    } else {
      console.error("Validation errors:", validation.errors);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// EXAMPLE 11: Voice Account Access System
// =============================================================================

export async function exampleVoiceAccountAccess() {
  console.log("\n=== Example 11: Voice Account Access ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
  });

  try {
    // Check account info
    const accountInfo = await voiceGenerator.getAccountInfo();

    console.log("Account Information:");
    console.log(`- Characters Used: ${accountInfo.character_count}`);
    console.log(`- Character Limit: ${accountInfo.character_limit}`);
    console.log(
      `- Remaining: ${accountInfo.character_limit - accountInfo.character_count}`
    );
    console.log(
      `- Usage: ${((accountInfo.character_count / accountInfo.character_limit) * 100).toFixed(2)}%`
    );

    // Get available voices
    const voices = await voiceGenerator.getAvailableVoices();
    console.log(`\nAvailable Voices: ${voices.length}`);
    voices.slice(0, 5).forEach((voice) => {
      console.log(`- ${voice.voice_id}: ${voice.name}`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// EXAMPLE 12: Complex Routing Menu
// =============================================================================

export async function exampleComplexRoutingMenu() {
  console.log("\n=== Example 12: Complex Routing Menu ===\n");

  const voiceGenerator = new ElevenLabsVoiceGenerator({
    apiKey: process.env.ELEVENLABS_API_KEY!,
  });

  try {
    // Multi-level menu structure
    const mainMenu = new IVRMenuBuilder(voiceGenerator, {
      greeting: "Welcome to ABC Corporation main line.",
      greetingVoiceId: VOICE_PRESETS.PROFESSIONAL,
      items: [
        {
          key: "1",
          text: "Business Services",
          prompt: "Press 1 for business services.",
          voiceId: VOICE_PRESETS.PROFESSIONAL,
          action: "redirect",
          actionTarget: "https://api.example.com/voice/menu/business",
        },
        {
          key: "2",
          text: "Consumer Services",
          prompt: "Press 2 for consumer services.",
          voiceId: VOICE_PRESETS.FRIENDLY,
          action: "redirect",
          actionTarget: "https://api.example.com/voice/menu/consumer",
        },
        {
          key: "3",
          text: "Investor Relations",
          prompt: "Press 3 for investor relations.",
          voiceId: VOICE_PRESETS.PROFESSIONAL,
          action: "redirect",
          actionTarget: "https://api.example.com/voice/menu/investors",
        },
        {
          key: "0",
          text: "Operator",
          prompt: "Press 0 to speak with an operator.",
          voiceId: VOICE_PRESETS.FRIENDLY,
          action: "dial",
          actionTarget: "+1-555-OPERATOR",
        },
      ],
      timeout: 5,
      maxRetries: 2,
      baseUrl: "https://api.example.com",
    });

    const response = await mainMenu.buildCompleteMenu();
    console.log("Complex routing menu created successfully");
    console.log(`Menu items: ${response.menuItems.length}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// =============================================================================
// RUN ALL EXAMPLES
// =============================================================================

export async function runAllExamples() {
  const examples = [
    { name: "Simple Greeting", fn: exampleSimpleGreeting },
    { name: "Interactive Menu", fn: exampleInteractiveMenu },
    { name: "Voicemail System", fn: exampleVoicemailSystem },
    { name: "Payment Confirmation", fn: examplePaymentConfirmation },
    { name: "Call Transfer", fn: exampleCallTransfer },
    { name: "Customer Survey", fn: exampleCustomerSurvey },
    { name: "Emergency Announcement", fn: exampleEmergencyAnnouncement },
    { name: "Multi-Voice Menu", fn: exampleMultiVoiceMenu },
    { name: "Appointment Reminder", fn: exampleAppointmentReminder },
    { name: "Help Desk Queue", fn: exampleHelpDeskQueue },
    { name: "Voice Account Access", fn: exampleVoiceAccountAccess },
    { name: "Complex Routing", fn: exampleComplexRoutingMenu },
  ];

  console.log("Running ElevenLabs Integration Examples\n");
  console.log("=========================================\n");

  for (const example of examples) {
    try {
      await example.fn();
    } catch (error) {
      console.error(`Error in ${example.name}:`, error);
    }
  }

  console.log("\n=========================================\n");
  console.log("All examples completed\n");
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}
