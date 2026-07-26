const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1/convai";

type AgentInput = {
  businessName: string;
  prompt: string;
  firstMessage: string;
  voiceId?: string | null;
  language?: string;
};

type ElevenLabsError = {
  detail?: unknown;
  message?: string;
};

const apiKey = () => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not configured");
  return key;
};

const elevenLabsRequest = async <T>(path: string, init: RequestInit): Promise<T> => {
  const response = await fetch(`${ELEVENLABS_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey(),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ElevenLabsError;
    const detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail || body);
    throw new Error(`ElevenLabs ${response.status}: ${detail}`);
  }

  return response.json() as Promise<T>;
};

export async function createConversationalAgent(input: AgentInput) {
  const voiceId = input.voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const data = await elevenLabsRequest<{ agent_id: string }>("/agents/create", {
    method: "POST",
    body: JSON.stringify({
      name: `${input.businessName} — VOXmation Trial`,
      tags: ["voxmation", "trial"],
      conversation_config: {
        asr: {
          quality: "high",
          provider: "scribe_realtime",
          user_input_audio_format: "ulaw_8000",
        },
        turn: {
          turn_timeout: 8,
          silence_end_call_timeout: 30,
          turn_eagerness: "normal",
        },
        tts: {
          voice_id: voiceId,
          model_id: "eleven_flash_v2_5",
          agent_output_audio_format: "ulaw_8000",
          stability: 0.55,
          similarity_boost: 0.8,
          speed: 1,
        },
        conversation: {
          max_duration_seconds: 900,
          monitoring_enabled: true,
        },
        agent: {
          first_message: input.firstMessage,
          language: input.language || "en",
          disable_first_message_interruptions: false,
          prompt: {
            prompt: input.prompt,
            llm: process.env.ELEVENLABS_AGENT_LLM || "gemini-2.0-flash-001",
            temperature: 0.2,
            max_tokens: 600,
          },
        },
      },
      platform_settings: {
        evaluation: {
          criteria: [
            {
              name: "Caller need captured accurately",
              conversation_goal_prompt: "The agent captured the caller's need without inventing facts or availability.",
              scoring_mode: "binary",
              scope: "conversation",
            },
          ],
        },
      },
    }),
  });

  return { agentId: data.agent_id, voiceId };
}

export async function importTwilioNumber(phoneNumber: string, label: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials are not configured");

  const data = await elevenLabsRequest<{ phone_number_id: string }>("/phone-numbers", {
    method: "POST",
    body: JSON.stringify({
      provider: "twilio",
      phone_number: phoneNumber,
      label,
      sid,
      token,
    }),
  });

  return data.phone_number_id;
}

export async function assignAgentToPhoneNumber(phoneNumberId: string, agentId: string | null) {
  return elevenLabsRequest<Record<string, unknown>>(`/phone-numbers/${phoneNumberId}`, {
    method: "PATCH",
    body: JSON.stringify({ agent_id: agentId, environment: "production" }),
  });
}

export async function placeAgentTestCall(input: {
  agentId: string;
  agentPhoneNumberId: string;
  toNumber: string;
  trialId: string;
}) {
  return elevenLabsRequest<{
    success: boolean;
    message: string;
    conversation_id: string | null;
    callSid: string | null;
  }>("/twilio/outbound-call", {
    method: "POST",
    body: JSON.stringify({
      agent_id: input.agentId,
      agent_phone_number_id: input.agentPhoneNumberId,
      to_number: input.toNumber,
      call_recording_enabled: false,
      conversation_initiation_client_data: {
        dynamic_variables: {
          trial_id: input.trialId,
          call_type: "onboarding_test",
        },
      },
    }),
  });
}
