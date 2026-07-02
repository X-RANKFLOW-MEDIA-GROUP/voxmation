/**
 * ElevenLabs Voice Routes
 *
 * Express routes for handling voice calls, IVR menus, and DTMF input
 * Integrates ElevenLabs voice generation with Twilio webhooks
 */

import { Router, Request, Response, NextFunction } from "express";
import {
  ElevenLabsVoiceGenerator,
  IVRMenuBuilder,
  buildVoiceGreeting,
  buildVoiceMenu,
  buildVoiceMailPrompt,
  buildVoiceConfirmation,
  validateVoicePrompt,
  VOICE_PRESETS,
} from "./elevenlabs.js";
import { TwiMLResponse } from "./twilio-twiml.js";

// =============================================================================
// ROUTER SETUP
// =============================================================================

export function createElevenLabsRouter(voiceGenerator: ElevenLabsVoiceGenerator) {
  const router = Router();

  // ==========================================================================
  // VOICE MENU ROUTES
  // ==========================================================================

  /**
   * Main IVR Menu Endpoint
   * Responds with TwiML containing voice prompts
   *
   * Usage: POST /voice/menu
   */
  router.post("/menu", async (req: Request, res: Response) => {
    try {
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
            text: "Support",
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
            text: "Repeat",
            prompt: "Press 0 to hear this menu again.",
            action: "redirect",
            actionTarget: `${process.env.API_URL}/voice/menu`,
          },
        ],
        timeout: 5,
        maxRetries: 3,
        baseUrl: process.env.API_URL,
      });

      const menuResponse = await menu.buildCompleteMenu();
      res.type("application/xml");
      res.send(menuResponse.twiml);
    } catch (error) {
      console.error("Menu error:", error);
      const response = new TwiMLResponse()
        .say("We are experiencing technical difficulties. Please try again later.")
        .hangup();
      res.type("application/xml");
      res.send(response.toString());
    }
  });

  /**
   * DTMF Input Handler
   * Processes keypad input and routes accordingly
   *
   * Usage: POST /voice/ivr-handler
   */
  router.post("/ivr-handler", async (req: Request, res: Response) => {
    try {
      const { Digits } = req.body;

      const responses: Record<string, { text: string; voiceId: string; action: string }> = {
        "1": {
          text: "Thank you for choosing sales. Connecting you now.",
          voiceId: VOICE_PRESETS.FRIENDLY,
          action: "dial:+1-555-0100",
        },
        "2": {
          text: "Connecting you to our support team.",
          voiceId: VOICE_PRESETS.FRIENDLY,
          action: "dial:+1-555-0200",
        },
        "3": {
          text: "Connecting you to billing support.",
          voiceId: VOICE_PRESETS.FRIENDLY,
          action: "dial:+1-555-0300",
        },
        "0": {
          text: "Repeating the menu.",
          voiceId: VOICE_PRESETS.FRIENDLY,
          action: "redirect:/voice/menu",
        },
      };

      const response = responses[Digits];

      if (!response) {
        // Invalid input - repeat menu
        const retryResponse = new TwiMLResponse()
          .say("Invalid selection. Please try again.")
          .redirect(`${process.env.API_URL}/voice/menu`);
        res.type("application/xml");
        res.send(retryResponse.toString());
        return;
      }

      // Generate voice for confirmation/action message
      const voiceResult = await voiceGenerator.generateVoice({
        text: response.text,
        voiceId: response.voiceId,
      });

      // Build response based on action
      const twimlResponse = new TwiMLResponse();
      if (voiceResult.audioUrl) {
        twimlResponse.play(voiceResult.audioUrl);
      } else {
        twimlResponse.say(response.text, { voice: "woman" });
      }

      if (response.action.startsWith("dial:")) {
        const phoneNumber = response.action.split(":")[1];
        twimlResponse.dial(phoneNumber, { timeout: 30 });
      } else if (response.action.startsWith("redirect:")) {
        const url = response.action.split(":")[1];
        twimlResponse.redirect(url);
      }

      res.type("application/xml");
      res.send(twimlResponse.toString());
    } catch (error) {
      console.error("IVR handler error:", error);
      const response = new TwiMLResponse()
        .say("We are experiencing technical difficulties.")
        .hangup();
      res.type("application/xml");
      res.send(response.toString());
    }
  });

  // ==========================================================================
  // VOICE GENERATION ROUTES
  // ==========================================================================

  /**
   * Simple Greeting Endpoint
   *
   * Usage: POST /voice/greeting
   * Body: { "text": "Welcome message", "voiceId": "..." }
   */
  router.post("/greeting", async (req: Request, res: Response) => {
    try {
      const { text, voiceId } = req.body;

      if (!text) {
        res.status(400).json({ error: "Text is required" });
        return;
      }

      // Validate text
      const validation = validateVoicePrompt(text);
      if (!validation.valid) {
        res.status(400).json({ errors: validation.errors });
        return;
      }

      const twiml = await buildVoiceGreeting(voiceGenerator, {
        text,
        voiceId: voiceId || VOICE_PRESETS.FRIENDLY,
      });

      res.type("application/xml");
      res.send(twiml);
    } catch (error) {
      console.error("Greeting error:", error);
      res.status(500).json({ error: "Failed to generate greeting" });
    }
  });

  /**
   * Custom Menu Endpoint
   *
   * Usage: POST /voice/custom-menu
   * Body: {
   *   "greeting": "Welcome",
   *   "items": [
   *     { "key": "1", "prompt": "Press 1", "actionTarget": "..." }
   *   ]
   * }
   */
  router.post("/custom-menu", async (req: Request, res: Response) => {
    try {
      const { greeting, items, timeout, baseUrl } = req.body;

      if (!items || items.length === 0) {
        res.status(400).json({ error: "Menu items are required" });
        return;
      }

      const menuResponse = await buildVoiceMenu(voiceGenerator, {
        greeting: greeting || "Please select an option",
        items: items.map((item: any) => ({
          key: item.key,
          text: item.text || item.key,
          prompt: item.prompt,
          voiceId: item.voiceId,
          action: item.action || "dial",
          actionTarget: item.actionTarget,
        })),
        timeout: timeout || 5,
        baseUrl: baseUrl || process.env.API_URL,
      });

      res.type("application/xml");
      res.send(menuResponse.twiml);
    } catch (error) {
      console.error("Custom menu error:", error);
      res.status(500).json({ error: "Failed to generate menu" });
    }
  });

  /**
   * Voicemail Endpoint
   *
   * Usage: POST /voice/voicemail
   * Body: { "prompt": "Leave a message..." }
   */
  router.post("/voicemail", async (req: Request, res: Response) => {
    try {
      const {
        prompt = "Please leave a message after the beep. Press the pound key when finished.",
        maxLength = 120,
        timeout = 3,
      } = req.body;

      const twiml = await buildVoiceMailPrompt(voiceGenerator, {
        prompt,
        voiceId: VOICE_PRESETS.WARM,
        maxLength,
        timeout,
      });

      res.type("application/xml");
      res.send(twiml);
    } catch (error) {
      console.error("Voicemail error:", error);
      res.status(500).json({ error: "Failed to generate voicemail prompt" });
    }
  });

  /**
   * Confirmation Endpoint
   *
   * Usage: POST /voice/confirmation
   * Body: { "message": "Is this correct?", "actionUrl": "..." }
   */
  router.post("/confirmation", async (req: Request, res: Response) => {
    try {
      const {
        message,
        confirmKey = "1",
        cancelKey = "2",
        actionUrl = `${process.env.API_URL}/voice/confirmation-handler`,
      } = req.body;

      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      const twiml = await buildVoiceConfirmation(voiceGenerator, {
        message,
        voiceId: VOICE_PRESETS.PROFESSIONAL,
        confirmKey,
        cancelKey,
        actionUrl,
      });

      res.type("application/xml");
      res.send(twiml);
    } catch (error) {
      console.error("Confirmation error:", error);
      res.status(500).json({ error: "Failed to generate confirmation" });
    }
  });

  /**
   * Confirmation Handler
   * Processes confirmation/cancellation responses
   */
  router.post("/confirmation-handler", (req: Request, res: Response) => {
    try {
      const { Digits } = req.body;
      const response = new TwiMLResponse();

      if (Digits === "1") {
        response.say("Thank you. Your request has been confirmed.", {
          voice: "woman",
        });
      } else {
        response.say("Your request has been cancelled.", { voice: "woman" });
      }

      response.hangup();
      res.type("application/xml");
      res.send(response.toString());
    } catch (error) {
      console.error("Confirmation handler error:", error);
      res.status(500).json({ error: "Failed to process confirmation" });
    }
  });

  // ==========================================================================
  // VOICE UTILITY ROUTES
  // ==========================================================================

  /**
   * Get Available Voices
   *
   * Usage: GET /voice/voices
   */
  router.get("/voices", async (req: Request, res: Response) => {
    try {
      const voices = await voiceGenerator.getAvailableVoices();
      res.json({
        count: voices.length,
        voices: voices.map((v) => ({
          id: v.voice_id,
          name: v.name,
          category: v.category,
        })),
      });
    } catch (error) {
      console.error("Voices error:", error);
      res.status(500).json({ error: "Failed to fetch voices" });
    }
  });

  /**
   * Get Account Information
   *
   * Usage: GET /voice/account
   */
  router.get("/account", async (req: Request, res: Response) => {
    try {
      const info = await voiceGenerator.getAccountInfo();
      const remaining = info.character_limit - info.character_count;
      const percentUsed = (info.character_count / info.character_limit) * 100;

      res.json({
        characterCount: info.character_count,
        characterLimit: info.character_limit,
        remaining,
        percentUsed: percentUsed.toFixed(2),
        status: percentUsed > 80 ? "warning" : percentUsed > 95 ? "critical" : "ok",
      });
    } catch (error) {
      console.error("Account info error:", error);
      res.status(500).json({ error: "Failed to fetch account info" });
    }
  });

  /**
   * Test Voice Generation
   *
   * Usage: POST /voice/test
   * Body: { "text": "Test message" }
   */
  router.post("/test", async (req: Request, res: Response) => {
    try {
      const { text = "This is a test message" } = req.body;

      // Validate text
      const validation = validateVoicePrompt(text);
      if (!validation.valid) {
        res.status(400).json({ errors: validation.errors });
        return;
      }

      const result = await voiceGenerator.generateVoice({
        text,
        voiceId: VOICE_PRESETS.FRIENDLY,
      });

      res.json({
        success: true,
        format: result.format,
        voiceId: result.voiceId,
        bufferSize: result.audioBuffer?.length,
        timestamp: result.timestamp,
      });
    } catch (error) {
      console.error("Test error:", error);
      res.status(500).json({ error: "Failed to test voice generation" });
    }
  });

  // ==========================================================================
  // HEALTH CHECKS
  // ==========================================================================

  /**
   * Health Check Endpoint
   *
   * Usage: GET /voice/health
   */
  router.get("/health", async (req: Request, res: Response) => {
    try {
      // Try to fetch account info as a health check
      const info = await voiceGenerator.getAccountInfo();

      res.json({
        status: "healthy",
        elevenlabs: "connected",
        account: info,
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(503).json({
        status: "unhealthy",
        elevenlabs: "disconnected",
        error: String(error),
      });
    }
  });

  return router;
}

// =============================================================================
// ROUTE MIDDLEWARE
// =============================================================================

/**
 * Middleware to parse Twilio webhook data
 */
export function twilioWebhookMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Parse form-encoded body for Twilio
    if (req.is("application/x-www-form-urlencoded")) {
      // Parse already done by express.urlencoded()
    }
    next();
  };
}

/**
 * Middleware to verify Twilio request signature
 * (Optional - implement if needed)
 */
export function verifyTwilioSignature(authToken: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Implementation of Twilio signature verification
    // See: https://www.twilio.com/docs/usage/webhooks/webhooks-security
    next();
  };
}

// =============================================================================
// ROUTE REGISTRATION HELPER
// =============================================================================

/**
 * Register all ElevenLabs routes to Express app
 *
 * @example
 * import { registerElevenLabsRoutes } from './integrations/elevenlabs-routes';
 * const voiceGenerator = new ElevenLabsVoiceGenerator({ apiKey: ... });
 * registerElevenLabsRoutes(app, voiceGenerator);
 */
export function registerElevenLabsRoutes(
  app: any,
  voiceGenerator: ElevenLabsVoiceGenerator,
  basePath: string = "/voice"
) {
  const router = createElevenLabsRouter(voiceGenerator);
  app.use(basePath, router);
  console.log(`ElevenLabs routes registered at ${basePath}`);
}
