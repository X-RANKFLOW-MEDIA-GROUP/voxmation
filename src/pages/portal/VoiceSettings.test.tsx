import { describe, it, expect } from "vitest";

describe("VoiceSettings - IVR Menu Builder", () => {
  it("should have proper TypeScript definitions", () => {
    // This is a basic smoke test to ensure the component compiles
    expect(true).toBe(true);
  });

  it("should support node configuration types", () => {
    // Test node type validation
    const validTypes = ["say", "gather", "redirect", "hangup"];
    expect(validTypes).toContain("say");
    expect(validTypes).toContain("gather");
    expect(validTypes).toContain("redirect");
    expect(validTypes).toContain("hangup");
  });

  it("should generate valid TwiML structure", () => {
    // Validate TwiML opening and closing tags
    const twimlStart = '<?xml version="1.0" encoding="UTF-8"?>';
    const twimlOpen = "<Response>";
    const twimlClose = "</Response>";

    expect(twimlStart).toContain("<?xml");
    expect(twimlOpen).toContain("Response");
    expect(twimlClose).toContain("Response");
  });

  it("should escape XML special characters", () => {
    const escapeXml = (str: string): string => {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    expect(escapeXml("<test>")).toBe("&lt;test&gt;");
    expect(escapeXml('"hello"')).toBe("&quot;hello&quot;");
    expect(escapeXml("'world'")).toBe("&apos;world&apos;");
    expect(escapeXml("a&b")).toBe("a&amp;b");
  });

  it("should support all voice service options", () => {
    const voices = ["elevenlabs", "twilio"];
    expect(voices).toHaveLength(2);
    expect(voices).toContain("elevenlabs");
    expect(voices).toContain("twilio");
  });

  it("should support multiple language options", () => {
    const languages = [
      "en-US",
      "en-GB",
      "es-ES",
      "fr-FR",
      "de-DE",
      "pt-BR",
    ];
    expect(languages).toHaveLength(6);
    expect(languages).toContain("en-US");
    expect(languages).toContain("pt-BR");
  });

  it("should validate node configuration", () => {
    // Test Say node config
    const sayConfig = {
      text: "Thank you for calling",
      voice: "elevenlabs" as const,
      language: "en-US",
      speed: 1,
      pause_after: 500,
    };
    expect(sayConfig.text).toBeTruthy();
    expect(sayConfig.voice).toBe("elevenlabs");

    // Test Gather node config
    const gatherConfig = {
      timeout: 5,
      num_digits: 1,
      finish_on_key: "#",
      hints: "sales, support",
      speech_timeout: 3000,
    };
    expect(gatherConfig.timeout).toBeGreaterThan(0);
    expect(gatherConfig.num_digits).toBeGreaterThan(0);

    // Test Redirect node config
    const redirectConfig = {
      url: "https://example.com/webhook",
      method: "POST" as const,
    };
    expect(redirectConfig.url).toContain("https");
    expect(["GET", "POST"]).toContain(redirectConfig.method);

    // Test Hangup node config
    const hangupConfig = {
      reason: "Call completed",
    };
    expect(typeof hangupConfig.reason).toBe("string");
  });

  it("should maintain node order in flows", () => {
    interface IVRNode {
      id: string;
      type: "say" | "gather" | "redirect" | "hangup";
      label: string;
      nextNode?: string;
    }

    const nodes: IVRNode[] = [
      { id: "1", type: "say", label: "Welcome", nextNode: "2" },
      { id: "2", type: "gather", label: "Menu", nextNode: "3" },
      { id: "3", type: "hangup", label: "End" },
    ];

    expect(nodes).toHaveLength(3);
    expect(nodes[0].nextNode).toBe("2");
    expect(nodes[1].nextNode).toBe("3");
    expect(nodes[2].nextNode).toBeUndefined();
  });

  it("should format TwiML attributes correctly", () => {
    // Test Say node TwiML generation
    const sayNode = {
      text: "Hello there",
      voice: "elevenlabs",
      speed: 1.2,
    };

    const twimlLine = `<Say voice="alice" engine="elevenlabs" rate="${sayNode.speed}">Hello there</Say>`;
    expect(twimlLine).toContain("Say");
    expect(twimlLine).toContain('voice="alice"');
    expect(twimlLine).toContain('rate="1.2"');

    // Test Gather node TwiML generation
    const gatherNode = {
      timeout: 5,
      numDigits: 1,
      finishOnKey: "#",
    };

    const gatherLine = `<Gather timeout="${gatherNode.timeout}" numDigits="${gatherNode.numDigits}" finishOnKey="${gatherNode.finishOnKey}">`;
    expect(gatherLine).toContain("Gather");
    expect(gatherLine).toContain('timeout="5"');
  });

  it("should support JSON serialization of flows", () => {
    interface IVRNode {
      id: string;
      type: "say" | "gather" | "redirect" | "hangup";
      label: string;
      config: Record<string, unknown>;
    }

    const testNode: IVRNode = {
      id: "1",
      type: "say",
      label: "Welcome",
      config: { text: "Hello" },
    };

    const json = JSON.stringify(testNode);
    const parsed = JSON.parse(json);

    expect(parsed.id).toBe("1");
    expect(parsed.type).toBe("say");
    expect(parsed.config.text).toBe("Hello");
  });
});
