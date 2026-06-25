/**
 * Twilio TwiML Builder
 *
 * Helpers for generating TwiML (Twilio Markup Language) XML responses
 * to handle voice calls, IVR menus, and call logic.
 *
 * TwiML is XML that tells Twilio how to handle a call.
 * This module provides TypeScript builders to generate valid TwiML.
 */

// =============================================================================
// TWIML BUILDER CLASSES
// =============================================================================

/**
 * TwiML Response builder
 * Top-level container for all TwiML commands
 */
export class TwiMLResponse {
  private verbs: TwiMLVerb[] = [];

  /**
   * Add Say verb (text-to-speech)
   */
  say(
    text: string,
    options?: {
      voice?: "man" | "woman" | "alice";
      language?: string; // en-US, es-ES, fr-FR, etc.
      loop?: number; // Repeat message N times
    }
  ): this {
    this.verbs.push(new Say(text, options));
    return this;
  }

  /**
   * Add Play verb (play audio file)
   */
  play(url: string): this {
    this.verbs.push(new Play(url));
    return this;
  }

  /**
   * Add Gather verb (collect DTMF key presses)
   */
  gather(options?: {
    numDigits?: number;
    finishOnKey?: string; // '#' to end input
    timeout?: number; // Seconds before timeout
    action?: string; // URL to POST results to
    method?: "GET" | "POST";
  }): Gather {
    const gather = new Gather(options);
    this.verbs.push(gather);
    return gather;
  }

  /**
   * Add Dial verb (connect to another number)
   */
  dial(phoneNumber: string, options?: {
    timeout?: number;
    action?: string;
    method?: "GET" | "POST";
    callerId?: string;
    record?: boolean | "record-from-answer";
  }): this {
    this.verbs.push(new Dial(phoneNumber, options));
    return this;
  }

  /**
   * Add Record verb (record call or voicemail)
   */
  record(options?: {
    maxLength?: number; // Seconds
    timeout?: number; // Silence timeout
    finishOnKey?: string; // Key to end recording
    action?: string; // URL to POST recording to
    method?: "GET" | "POST";
    trim?: "trim-silence" | "do-not-trim";
  }): this {
    this.verbs.push(new Record(options));
    return this;
  }

  /**
   * Add Hangup verb (end the call)
   */
  hangup(): this {
    this.verbs.push(new Hangup());
    return this;
  }

  /**
   * Add Pause verb (silent pause)
   */
  pause(seconds: number = 1): this {
    this.verbs.push(new Pause(seconds));
    return this;
  }

  /**
   * Add Redirect verb (transfer to another TwiML URL)
   */
  redirect(url: string, method?: "GET" | "POST"): this {
    this.verbs.push(new Redirect(url, method));
    return this;
  }

  /**
   * Convert to XML string
   */
  toString(): string {
    const verbStrings = this.verbs.map((v) => v.toString()).join("\n  ");
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${verbStrings}
</Response>`;
  }
}

/**
 * Gather verb - collect user input via DTMF (phone keypad)
 */
export class Gather {
  private children: TwiMLVerb[] = [];
  private attributes: Map<string, string | number> = new Map();

  constructor(options?: {
    numDigits?: number;
    finishOnKey?: string;
    timeout?: number;
    action?: string;
    method?: "GET" | "POST";
  }) {
    if (options?.numDigits) this.attributes.set("numDigits", options.numDigits);
    if (options?.finishOnKey) this.attributes.set("finishOnKey", options.finishOnKey);
    if (options?.timeout) this.attributes.set("timeout", options.timeout);
    if (options?.action) this.attributes.set("action", options.action);
    if (options?.method) this.attributes.set("method", options.method);
  }

  /**
   * Add Say verb inside Gather
   */
  say(
    text: string,
    options?: {
      voice?: "man" | "woman" | "alice";
      language?: string;
      loop?: number;
    }
  ): this {
    this.children.push(new Say(text, options));
    return this;
  }

  /**
   * Add Play verb inside Gather
   */
  play(url: string): this {
    this.children.push(new Play(url));
    return this;
  }

  /**
   * Add Pause inside Gather
   */
  pause(seconds?: number): this {
    this.children.push(new Pause(seconds));
    return this;
  }

  /**
   * Convert to XML
   */
  toString(): string {
    const attrs = Array.from(this.attributes.entries())
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");

    const childrenStr = this.children.map((c) => c.toString()).join("\n    ");

    if (childrenStr) {
      return `<Gather ${attrs}>\n    ${childrenStr}\n  </Gather>`;
    } else {
      return `<Gather ${attrs} />`;
    }
  }
}

// =============================================================================
// TWIML VERBS
// =============================================================================

interface TwiMLVerb {
  toString(): string;
}

class Say implements TwiMLVerb {
  constructor(
    private text: string,
    private options?: {
      voice?: "man" | "woman" | "alice";
      language?: string;
      loop?: number;
    }
  ) {}

  toString(): string {
    const attrs = [];
    if (this.options?.voice) attrs.push(`voice="${this.options.voice}"`);
    if (this.options?.language) attrs.push(`language="${this.options.language}"`);
    if (this.options?.loop) attrs.push(`loop="${this.options.loop}"`);

    const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";
    return `<Say${attrStr}>${this.text}</Say>`;
  }
}

class Play implements TwiMLVerb {
  constructor(private url: string) {}

  toString(): string {
    return `<Play>${this.url}</Play>`;
  }
}

class Dial implements TwiMLVerb {
  constructor(
    private phoneNumber: string,
    private options?: {
      timeout?: number;
      action?: string;
      method?: "GET" | "POST";
      callerId?: string;
      record?: boolean | "record-from-answer";
    }
  ) {}

  toString(): string {
    const attrs = [];
    if (this.options?.timeout) attrs.push(`timeout="${this.options.timeout}"`);
    if (this.options?.action) attrs.push(`action="${this.options.action}"`);
    if (this.options?.method) attrs.push(`method="${this.options.method}"`);
    if (this.options?.callerId) attrs.push(`callerId="${this.options.callerId}"`);
    if (this.options?.record) {
      const record = this.options.record === true ? "record-from-answer" : this.options.record;
      attrs.push(`record="${record}"`);
    }

    const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";
    return `<Dial${attrStr}>${this.phoneNumber}</Dial>`;
  }
}

class Record implements TwiMLVerb {
  constructor(
    private options?: {
      maxLength?: number;
      timeout?: number;
      finishOnKey?: string;
      action?: string;
      method?: "GET" | "POST";
      trim?: "trim-silence" | "do-not-trim";
    }
  ) {}

  toString(): string {
    const attrs = [];
    if (this.options?.maxLength) attrs.push(`maxLength="${this.options.maxLength}"`);
    if (this.options?.timeout) attrs.push(`timeout="${this.options.timeout}"`);
    if (this.options?.finishOnKey) attrs.push(`finishOnKey="${this.options.finishOnKey}"`);
    if (this.options?.action) attrs.push(`action="${this.options.action}"`);
    if (this.options?.method) attrs.push(`method="${this.options.method}"`);
    if (this.options?.trim) attrs.push(`trim="${this.options.trim}"`);

    const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";
    return `<Record${attrStr} />`;
  }
}

class Hangup implements TwiMLVerb {
  toString(): string {
    return "<Hangup />";
  }
}

class Pause implements TwiMLVerb {
  constructor(private seconds: number = 1) {}

  toString(): string {
    return `<Pause length="${this.seconds}" />`;
  }
}

class Redirect implements TwiMLVerb {
  constructor(private url: string, private method?: "GET" | "POST") {}

  toString(): string {
    const method = this.method ? ` method="${this.method}"` : "";
    return `<Redirect${method}>${this.url}</Redirect>`;
  }
}

// =============================================================================
// TEMPLATE RESPONSES
// =============================================================================

/**
 * Simple greeting that plays a message and hangs up
 */
export function greetingResponse(message: string): string {
  return new TwiMLResponse()
    .say(message)
    .pause(1)
    .hangup()
    .toString();
}

/**
 * Interactive menu with user input (DTMF/keypad)
 *
 * Example usage:
 * menuResponse({
 *   greeting: "Press 1 for sales, 2 for support, or 0 to repeat",
 *   routes: {
 *     "1": "https://your-api.example.com/voice/sales",
 *     "2": "https://your-api.example.com/voice/support",
 *     "0": "https://your-api.example.com/voice/menu",
 *   },
 *   timeout: 5,
 *   invalid: "That option is not valid. Please try again."
 * })
 */
export function menuResponse(options: {
  greeting: string;
  routes: Record<string, string>;
  timeout?: number;
  invalid?: string;
}): string {
  const gather = new TwiMLResponse().gather({
    numDigits: 1,
    timeout: options.timeout || 5,
    action: undefined, // Will be set in handler
  });

  gather.say(options.greeting);

  return gather.toString();
}

/**
 * Voicemail recording response
 */
export function voicemailResponse(options: {
  greeting?: string;
  maxLength?: number;
  timeout?: number;
  finishKey?: string;
}): string {
  const response = new TwiMLResponse();

  if (options.greeting) {
    response.say(options.greeting);
  }

  response.record({
    maxLength: options.maxLength || 120,
    timeout: options.timeout || 5,
    finishOnKey: options.finishKey || "#",
  });

  return response.toString();
}

/**
 * Call transfer to another number
 */
export function transferResponse(options: {
  announcement?: string;
  phoneNumber: string;
  timeout?: number;
  callerId?: string;
}): string {
  const response = new TwiMLResponse();

  if (options.announcement) {
    response.say(options.announcement);
  }

  response.dial(options.phoneNumber, {
    timeout: options.timeout || 30,
    callerId: options.callerId,
  });

  // If dial fails (busy, no-answer), hangup
  response.say("The call could not be completed. Please try again later.");
  response.hangup();

  return response.toString();
}

/**
 * Automated survey with numeric responses
 */
export function surveyResponse(options: {
  questions: Array<{
    text: string;
    key: string; // 1, 2, 3, etc
  }>;
  surveyUrl?: string;
}): string {
  const response = new TwiMLResponse();

  // Build survey prompt
  const prompt = options.questions.map((q) => `Press ${q.key} for ${q.text}`).join(". ");

  response.say("Thank you for calling. " + prompt);
  response.pause(1);

  const gather = response.gather({
    numDigits: 1,
    timeout: 5,
    action: options.surveyUrl,
    method: "POST",
  });

  gather.say("Please enter your response");

  return response.toString();
}

/**
 * Scheduled callback request
 */
export function callbackResponse(options: {
  confirmation?: string;
  recordingUrl?: string;
}): string {
  const response = new TwiMLResponse();

  if (options.recordingUrl) {
    response.play(options.recordingUrl);
  } else if (options.confirmation) {
    response.say(options.confirmation);
  } else {
    response.say("Thank you. We will call you back shortly.");
  }

  response.hangup();

  return response.toString();
}

/**
 * Error/unavailable response
 */
export function errorResponse(message?: string): string {
  const msg = message || "We're sorry, but we're unable to process your call at this time. Please try again later.";
  return new TwiMLResponse().say(msg).hangup().toString();
}

/**
 * Business hours check with conditional routing
 */
export function businessHoursResponse(options: {
  businessHours: {
    start: number; // 9 (9am)
    end: number; // 17 (5pm)
    timezone?: string; // 'America/New_York', etc
  };
  businessUrl: string;
  afterHoursUrl: string;
}): string {
  // This would typically be handled on the server side
  // This is just a template structure
  const now = new Date();
  const hour = now.getHours();

  const isOpen = hour >= options.businessHours.start && hour < options.businessHours.end;

  if (isOpen) {
    return new TwiMLResponse()
      .redirect(options.businessUrl)
      .toString();
  } else {
    return new TwiMLResponse()
      .say("We're currently closed. Please call back during business hours.")
      .redirect(options.afterHoursUrl)
      .toString();
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Parse DTMF input from webhook
 */
export function parseDTMFInput(digits: string): {
  raw: string;
  pressed: string[];
} {
  return {
    raw: digits,
    pressed: digits.split(""),
  };
}

/**
 * Format phone number for voice greeting
 */
export function formatPhoneForSpeech(phoneNumber: string): string {
  // Convert: +1-555-123-4567 → "5 5 5 1 2 3 4 5 6 7"
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  } else if (digits.length === 11) {
    return `${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return digits;
}

/**
 * Format currency for voice greeting
 */
export function formatCurrencyForSpeech(amount: number, currency: string = "USD"): string {
  const currencyNames: Record<string, string> = {
    USD: "dollars",
    EUR: "euros",
    GBP: "pounds",
  };

  const currencyName = currencyNames[currency] || currency;
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);

  if (cents === 0) {
    return `${dollars} ${currencyName}`;
  } else {
    return `${dollars} ${currencyName} and ${cents} cents`;
  }
}

/**
 * Escape text for TwiML (handle special characters)
 */
export function escapeTwiML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
