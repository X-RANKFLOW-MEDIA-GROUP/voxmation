import { NextRequest, NextResponse } from "next/server";
import { getSlugData, buildAgentVariables } from "@/lib/demo-data";

// Converts a user-entered phone number to E.164 format (+12125551234).
// ElevenLabs / Twilio require E.164 — without it the call is silently dropped.
function toE164(raw: string): string | null {
  const trimmed = raw.trim();
  const hasCountryCode = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return null;

  if (hasCountryCode) {
    // Already has a country code — just strip non-digits and re-add +
    return "+" + digits;
  }
  if (digits.length === 10) {
    // US/Canada 10-digit number, e.g. 2125551234 → +12125551234
    return "+1" + digits;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    // US/Canada 11-digit starting with 1, e.g. 12125551234 → +12125551234
    return "+" + digits;
  }
  // Unknown length — prepend + and hope for the best
  return "+" + digits;
}

// Places an outbound demo call via ElevenLabs' native Twilio integration.
// ElevenLabs owns the Twilio number (imported under Conversational AI → Phone
// Numbers) and runs the agent on the call. The per-slug persona is passed as
// dynamic-variable overrides so the prospect hears their own company's script.
export async function POST(req: NextRequest) {
  const { phone, slug } = await req.json();
  const data = getSlugData(slug ?? "");

  if (!phone || typeof phone !== "string") {
    return NextResponse.json(
      { error: "A phone number is required." },
      { status: 400 }
    );
  }

  const e164Phone = toE164(phone);
  if (!e164Phone) {
    return NextResponse.json(
      { error: "Invalid phone number — please include your area code." },
      { status: 400 }
    );
  }

  const { ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, ELEVENLABS_AGENT_PHONE_NUMBER_ID } =
    process.env;

  if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID || !ELEVENLABS_AGENT_PHONE_NUMBER_ID) {
    return NextResponse.json(
      { error: "Outbound calling is not configured." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: ELEVENLABS_AGENT_ID,
          agent_phone_number_id: ELEVENLABS_AGENT_PHONE_NUMBER_ID,
          to_number: e164Phone,
          conversation_initiation_client_data: {
            dynamic_variables: buildAgentVariables(data),
          },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("ElevenLabs outbound call failed:", res.status, detail);
      // Surface the upstream reason so the cause is visible while configuring
      // the ElevenLabs/Twilio integration (these are private sales pages).
      return NextResponse.json(
        {
          error: `Call could not be placed (ElevenLabs ${res.status}).`,
          reason: detail.slice(0, 400) || null,
        },
        { status: 502 }
      );
    }

    const result = await res.json();
    return NextResponse.json({
      callSid: result.callSid ?? result.call_sid ?? null,
      conversationId: result.conversation_id ?? null,
      companyName: data.companyName,
    });
  } catch (err) {
    console.error("Outbound call error:", err);
    return NextResponse.json({ error: "Call could not be placed." }, { status: 502 });
  }
}
