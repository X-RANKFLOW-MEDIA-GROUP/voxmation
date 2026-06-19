import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text, voiceId, apiKey } = await request.json();

    if (!text || !voiceId) {
      return new Response(
        JSON.stringify({ error: 'Text and voiceId are required' }),
        { status: 400 }
      );
    }

    // Validate API key if provided (optional for demo)
    if (apiKey) {
      const validateResponse = await fetch(
        new URL('/api/validate-key', request.url),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey }),
        }
      );

      if (!validateResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Invalid API key' }),
          { status: 401 }
        );
      }
    }

    // Call ElevenLabs API
    const elevenLabsApiKey = import.meta.env.ELEVENLABS_API_KEY;

    if (!elevenLabsApiKey) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API not configured' }),
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate speech' }),
      { status: 500 }
    );
  }
};
