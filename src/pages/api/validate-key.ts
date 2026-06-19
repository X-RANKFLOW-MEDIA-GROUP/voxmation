import type { APIRoute } from 'astro';
import { validateApiKey } from '@/lib/trial-service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ valid: false, error: 'API key is required' }),
        { status: 400 }
      );
    }

    const result = await validateApiKey(apiKey);

    return new Response(JSON.stringify(result), {
      status: result.valid ? 200 : 401,
    });
  } catch (error) {
    console.error('API key validation error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Validation failed' }),
      { status: 500 }
    );
  }
};
