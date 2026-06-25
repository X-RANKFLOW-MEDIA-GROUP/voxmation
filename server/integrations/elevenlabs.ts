/**
 * ElevenLabs Voice Integration
 *
 * Provides text-to-speech voice generation and IVR menu building
 * Integrates with Twilio for voice delivery via TwiML
 *
 * Features:
 * - Generate natural-sounding voice audio from text
 * - Build IVR menus with voice prompts
 * - Generate TwiML responses with ElevenLabs audio
 * - Support for multiple voices and languages
 */

import { TwiMLResponse, Gather, escapeTwiML } from "./twilio-twiml.js";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId?: string; // Default voice ID
  modelId?: string; // Default model (e.g., "eleven_monolingual_v1")
  baseUrl?: string;
}

export interface VoiceSettings {
  stability?: number; // 0-1, default 0.5
  similarity_boost?: number; // 0-1, default 0.75
}

export interface GenerateVoiceOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: VoiceSettings;
  format?: "mp3" | "pcm_16000" | "pcm_22050" | "pcm_24000"; // Default: mp3
}

export interface IVRMenuItem {
  key: string; // "1", "2", "3", etc or "*", "#"
  text: string; // Label for this option
  prompt: string; // Voice prompt to read
  voiceId?: string; // Optional: override default voice for this item
  action?: "dial" | "redirect" | "record" | "callback"; // What to do after selection
  actionTarget?: string; // Phone number, URL, or other target
}

export interface IVRMenuOptions {
  greeting?: string; // Initial greeting
  greetingVoiceId?: string; // Voice for greeting
  items: IVRMenuItem[];
  timeout?: number; // Seconds before timeout
  maxRetries?: number; // How many times to repeat menu
  retryMessage?: string; // Message after invalid input
  retryVoiceId?: string; // Voice for retry message
  baseUrl?: string; // Base URL for action handlers
  recordingUrl?: string; // Optional: pre-recorded greeting audio URL
}

export interface GeneratedVoiceResponse {
  audioUrl: string; // Public URL to audio file
  audioBuffer?: Buffer; // Raw audio data
  duration?: number; // Duration in seconds
  format: string;
  voiceId: string;
  timestamp: Date;
}

export interface IVRMenuResponse {
  twiml: string; // TwiML XML response
  menuItems: IVRMenuItem[];
  audioUrls: Record<string, string>; // Map of item keys to their audio URLs
  timestamp: Date;
}

export interface VoiceListItem {
  voice_id: string;
  name: string;
  samples?: string[];
  category?: string;
  description?: string;
  preview_url?: string;
}

// =============================================================================
// ELEVENLABS VOICE GENERATOR CLASS
// =============================================================================

export class ElevenLabsVoiceGenerator {
  private apiKey: string;
  private baseUrl: string;
  private defaultVoiceId: string;
  private defaultModelId: string;

  constructor(config: ElevenLabsConfig) {
    if (!config.apiKey) {
      throw new Error("ElevenLabs API key is required");
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.elevenlabs.io/v1";
    this.defaultVoiceId = config.voiceId || "21m00Tcm4TlvDq8ikWAM"; // Rachel
    this.defaultModelId = config.modelId || "eleven_monolingual_v1";
  }

  /**
   * Generate voice audio from text
   *
   * @example
   * const voice = new ElevenLabsVoiceGenerator({ apiKey: process.env.ELEVENLABS_API_KEY });
   * const audio = await voice.generateVoice({
   *   text: "Welcome to our service",
   *   voiceId: "21m00Tcm4TlvDq8ikWAM"
   * });
   */
  async generateVoice(options: GenerateVoiceOptions): Promise<GeneratedVoiceResponse> {
    const voiceId = options.voiceId || this.defaultVoiceId;
    const modelId = options.modelId || this.defaultModelId;
    const format = options.format || "mp3";

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: options.text,
          model_id: modelId,
          voice_settings: options.voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `ElevenLabs API error: ${response.status} ${response.statusText}`
        );
      }

      const audioBuffer = await response.arrayBuffer();

      return {
        audioUrl: "", // Would be set when uploaded to storage
        audioBuffer: Buffer.from(audioBuffer),
        format,
        voiceId,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to generate voice: ${error}`);
    }
  }

  /**
   * Generate voice and upload to a public URL
   * (Implementation depends on your storage backend)
   */
  async generateAndUploadVoice(
    options: GenerateVoiceOptions,
    uploadHandler?: (buffer: Buffer, filename: string) => Promise<string>
  ): Promise<GeneratedVoiceResponse> {
    const result = await this.generateVoice(options);

    if (uploadHandler && result.audioBuffer) {
      const filename = `voice_${Date.now()}.${result.format}`;
      result.audioUrl = await uploadHandler(result.audioBuffer, filename);
    }

    return result;
  }

  /**
   * Get list of available voices
   */
  async getAvailableVoices(): Promise<VoiceListItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(
          `ElevenLabs API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json() as { voices: VoiceListItem[] };
      return data.voices || [];
    } catch (error) {
      throw new Error(`Failed to fetch voices: ${error}`);
    }
  }

  /**
   * Get details for a specific voice
   */
  async getVoiceDetails(voiceId: string): Promise<VoiceListItem> {
    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(
          `ElevenLabs API error: ${response.status} ${response.statusText}`
        );
      }

      return response.json() as Promise<VoiceListItem>;
    } catch (error) {
      throw new Error(`Failed to fetch voice details: ${error}`);
    }
  }

  /**
   * Get account usage info
   */
  async getAccountInfo(): Promise<{
    character_count: number;
    character_limit: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(
          `ElevenLabs API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json() as {
        subscription: {
          character_count: number;
          character_limit: number;
        };
      };
      return data.subscription;
    } catch (error) {
      throw new Error(`Failed to fetch account info: ${error}`);
    }
  }
}

// =============================================================================
// IVR MENU BUILDER CLASS
// =============================================================================

export class IVRMenuBuilder {
  private voiceGenerator: ElevenLabsVoiceGenerator;
  private config: IVRMenuOptions;
  private generatedAudios: Map<string, string> = new Map();

  constructor(
    voiceGenerator: ElevenLabsVoiceGenerator,
    config: IVRMenuOptions
  ) {
    this.voiceGenerator = voiceGenerator;
    this.config = {
      timeout: 5,
      maxRetries: 3,
      retryMessage: "Invalid input. Please try again.",
      ...config,
    };
  }

  /**
   * Generate voice prompts for all menu items
   *
   * @example
   * const menu = new IVRMenuBuilder(voiceGenerator, {
   *   greeting: "Welcome",
   *   items: [
   *     { key: "1", text: "Sales", prompt: "Press 1 for sales" },
   *     { key: "2", text: "Support", prompt: "Press 2 for support" }
   *   ]
   * });
   * await menu.generatePrompts();
   */
  async generatePrompts(
    uploadHandler?: (buffer: Buffer, filename: string) => Promise<string>
  ): Promise<void> {
    // Generate greeting audio
    if (this.config.greeting && !this.config.recordingUrl) {
      const greetingResult = await this.voiceGenerator.generateAndUploadVoice(
        {
          text: this.config.greeting,
          voiceId: this.config.greetingVoiceId,
        },
        uploadHandler
      );
      this.generatedAudios.set("greeting", greetingResult.audioUrl);
    }

    // Generate audio for each menu item
    for (const item of this.config.items) {
      const itemResult = await this.voiceGenerator.generateAndUploadVoice(
        {
          text: item.prompt,
          voiceId: item.voiceId,
        },
        uploadHandler
      );
      this.generatedAudios.set(item.key, itemResult.audioUrl);
    }

    // Generate retry message audio
    if (this.config.retryMessage) {
      const retryResult = await this.voiceGenerator.generateAndUploadVoice(
        {
          text: this.config.retryMessage,
          voiceId: this.config.retryVoiceId,
        },
        uploadHandler
      );
      this.generatedAudios.set("retry", retryResult.audioUrl);
    }
  }

  /**
   * Build TwiML response for IVR menu with voice prompts
   */
  buildTwiMLResponse(retryCount: number = 0): string {
    const response = new TwiMLResponse();

    // Play greeting or use pre-recorded audio
    if (this.config.recordingUrl) {
      response.play(this.config.recordingUrl);
    } else if (this.config.greeting && retryCount === 0) {
      const greetingUrl = this.generatedAudios.get("greeting");
      if (greetingUrl) {
        response.play(greetingUrl);
      }
    }

    // Add retry message for subsequent attempts
    if (retryCount > 0) {
      const retryUrl = this.generatedAudios.get("retry");
      if (retryUrl) {
        response.play(retryUrl);
      }
    }

    // Build gather with prompts
    const gather = response.gather({
      numDigits: 1,
      timeout: this.config.timeout,
      action: this._buildActionUrl(),
      method: "POST",
    });

    // Add voice prompts for each menu item
    for (const item of this.config.items) {
      const audioUrl = this.generatedAudios.get(item.key);
      if (audioUrl) {
        gather.play(audioUrl);
      }
    }

    return response.toString();
  }

  /**
   * Build complete IVR response with handler routing
   */
  async buildCompleteMenu(
    uploadHandler?: (buffer: Buffer, filename: string) => Promise<string>
  ): Promise<IVRMenuResponse> {
    // Generate all voice prompts
    await this.generatePrompts(uploadHandler);

    // Build TwiML
    const twiml = this.buildTwiMLResponse();

    // Create audio URL map
    const audioUrls: Record<string, string> = {};
    this.generatedAudios.forEach((url, key) => {
      audioUrls[key] = url;
    });

    return {
      twiml,
      menuItems: this.config.items,
      audioUrls,
      timestamp: new Date(),
    };
  }

  /**
   * Get menu item by key
   */
  getMenuItem(key: string): IVRMenuItem | undefined {
    return this.config.items.find((item) => item.key === key);
  }

  /**
   * Build action URL based on menu item type
   */
  private _buildActionUrl(): string {
    // This would be the webhook URL that handles the DTMF input
    return this.config.baseUrl
      ? `${this.config.baseUrl}/voice/ivr-handler`
      : "/voice/ivr-handler";
  }
}

// =============================================================================
// TWIML RESPONSE BUILDER FUNCTIONS
// =============================================================================

/**
 * Build simple greeting with voice
 *
 * @example
 * const voiceGenerator = new ElevenLabsVoiceGenerator({ apiKey: process.env.ELEVENLABS_API_KEY });
 * const twiml = await buildVoiceGreeting(voiceGenerator, {
 *   text: "Welcome to our service",
 *   voiceId: "21m00Tcm4TlvDq8ikWAM"
 * });
 */
export async function buildVoiceGreeting(
  voiceGenerator: ElevenLabsVoiceGenerator,
  options: {
    text: string;
    voiceId?: string;
    uploadHandler?: (buffer: Buffer, filename: string) => Promise<string>;
  }
): Promise<string> {
  const voiceResult = await voiceGenerator.generateAndUploadVoice(
    {
      text: options.text,
      voiceId: options.voiceId,
    },
    options.uploadHandler
  );

  const response = new TwiMLResponse();
  response.play(voiceResult.audioUrl);
  response.pause(1);
  response.hangup();

  return response.toString();
}

/**
 * Build interactive menu response with voice prompts
 *
 * @example
 * const twiml = await buildVoiceMenu(voiceGenerator, {
 *   greeting: "Press 1 for sales, 2 for support",
 *   items: [
 *     { key: "1", text: "Sales", prompt: "Connecting to sales" },
 *     { key: "2", text: "Support", prompt: "Connecting to support" }
 *   ],
 *   baseUrl: "https://api.example.com"
 * });
 */
export async function buildVoiceMenu(
  voiceGenerator: ElevenLabsVoiceGenerator,
  options: IVRMenuOptions
): Promise<IVRMenuResponse> {
  const builder = new IVRMenuBuilder(voiceGenerator, options);
  return builder.buildCompleteMenu(options.uploadHandler);
}

/**
 * Build voicemail prompt with voice
 */
export async function buildVoiceMailPrompt(
  voiceGenerator: ElevenLabsVoiceGenerator,
  options: {
    prompt: string;
    voiceId?: string;
    maxLength?: number;
    timeout?: number;
    uploadHandler?: (buffer: Buffer, filename: string) => Promise<string>;
  }
): Promise<string> {
  const voiceResult = await voiceGenerator.generateAndUploadVoice(
    {
      text: options.prompt,
      voiceId: options.voiceId,
    },
    options.uploadHandler
  );

  const response = new TwiMLResponse();
  response.play(voiceResult.audioUrl);
  response.record({
    maxLength: options.maxLength || 120,
    timeout: options.timeout || 5,
    finishOnKey: "#",
  });

  return response.toString();
}

/**
 * Build voice confirmation response
 */
export async function buildVoiceConfirmation(
  voiceGenerator: ElevenLabsVoiceGenerator,
  options: {
    message: string;
    voiceId?: string;
    confirmKey?: string; // "1" to confirm
    cancelKey?: string; // "2" to cancel
    actionUrl?: string;
    uploadHandler?: (buffer: Buffer, filename: string) => Promise<string>;
  }
): Promise<string> {
  const voiceResult = await voiceGenerator.generateAndUploadVoice(
    {
      text: options.message,
      voiceId: options.voiceId,
    },
    options.uploadHandler
  );

  const confirmKey = options.confirmKey || "1";
  const cancelKey = options.cancelKey || "2";

  const response = new TwiMLResponse();
  response.play(voiceResult.audioUrl);
  response.pause(1);

  const gather = response.gather({
    numDigits: 1,
    timeout: 5,
    action: options.actionUrl || "/voice/confirmation-handler",
    method: "POST",
  });

  gather.say(
    `Press ${confirmKey} to confirm or ${cancelKey} to cancel`,
    {
      voice: "woman",
    }
  );

  return response.toString();
}

/**
 * Build transfer announcement with voice
 */
export async function buildVoiceTransfer(
  voiceGenerator: ElevenLabsVoiceGenerator,
  options: {
    announcement: string;
    phoneNumber: string;
    voiceId?: string;
    timeout?: number;
    callerId?: string;
    uploadHandler?: (buffer: Buffer, filename: string) => Promise<string>;
  }
): Promise<string> {
  const voiceResult = await voiceGenerator.generateAndUploadVoice(
    {
      text: options.announcement,
      voiceId: options.voiceId,
    },
    options.uploadHandler
  );

  const response = new TwiMLResponse();
  response.play(voiceResult.audioUrl);
  response.pause(1);
  response.dial(options.phoneNumber, {
    timeout: options.timeout || 30,
    callerId: options.callerId,
  });

  // Fallback message
  const fallbackResult = await voiceGenerator.generateAndUploadVoice(
    {
      text: "The call could not be completed. Please try again later.",
      voiceId: options.voiceId,
    },
    options.uploadHandler
  );

  response.play(fallbackResult.audioUrl);
  response.hangup();

  return response.toString();
}

/**
 * Build interactive survey with voice prompts
 */
export async function buildVoiceSurvey(
  voiceGenerator: ElevenLabsVoiceGenerator,
  options: {
    greeting?: string;
    questions: Array<{
      number: string; // "1", "2", etc
      text: string; // "How satisfied are you?"
      voiceId?: string;
    }>;
    voiceId?: string;
    surveyUrl?: string;
    uploadHandler?: (buffer: Buffer, filename: string) => Promise<string>;
  }
): Promise<string> {
  const response = new TwiMLResponse();

  // Play greeting
  if (options.greeting) {
    const greetingResult = await voiceGenerator.generateAndUploadVoice(
      {
        text: options.greeting,
        voiceId: options.voiceId,
      },
      options.uploadHandler
    );
    response.play(greetingResult.audioUrl);
    response.pause(1);
  }

  // Play first question and gather response
  if (options.questions.length > 0) {
    const firstQuestion = options.questions[0];
    const questionResult = await voiceGenerator.generateAndUploadVoice(
      {
        text: firstQuestion.text,
        voiceId: firstQuestion.voiceId || options.voiceId,
      },
      options.uploadHandler
    );

    const gather = response.gather({
      numDigits: 1,
      timeout: 5,
      action: options.surveyUrl || "/voice/survey-handler",
      method: "POST",
    });

    gather.play(questionResult.audioUrl);
  }

  return response.toString();
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format text for TwiML with special character escaping
 */
export function formatTextForVoice(text: string): string {
  return escapeTwiML(text);
}

/**
 * Calculate estimated API usage for voice generation
 */
export function estimateCharacterUsage(text: string): number {
  return text.length;
}

/**
 * Estimate duration of speech based on text
 * (Rough estimate: ~150 words per minute)
 */
export function estimateSpeechDuration(text: string): number {
  const words = text.split(/\s+/).length;
  const minutes = words / 150;
  return Math.ceil(minutes * 60); // Return in seconds
}

/**
 * Validate voice prompt text
 */
export function validateVoicePrompt(text: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!text || text.trim().length === 0) {
    errors.push("Prompt text cannot be empty");
  }

  if (text.length > 5000) {
    errors.push("Prompt text exceeds maximum length of 5000 characters");
  }

  if (/[<>{}|\\^`]/g.test(text)) {
    errors.push(
      "Prompt text contains invalid characters: < > { } | \\ ^ `"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Default voice presets
 */
export const VOICE_PRESETS = {
  FRIENDLY: "21m00Tcm4TlvDq8ikWAM", // Rachel - friendly
  PROFESSIONAL: "EXAVITQu4vr4xnSDxMaL", // Bella - professional
  WARM: "XB0fDUnXU5powFXDhCwa", // Antoni - warm
  ENERGETIC: "MF3mGyEYCHffgLSD3ZeL", // Elli - energetic
  DEEP: "pFZP5JQG7iQjIQuC4Iy3", // Adam - deep
  EXPRESSIVE: "piTKgcLEGmPLHcj0ScPg", // Sam - expressive
};

/**
 * Model presets
 */
export const MODEL_PRESETS = {
  STANDARD: "eleven_monolingual_v1",
  MULTILINGUAL: "eleven_multilingual_v2",
  ENGLISH: "eleven_english_v1",
};
