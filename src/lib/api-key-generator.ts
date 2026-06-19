import crypto from 'crypto';

export function generateApiKey(prefix: string = 'vox'): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return `${prefix}_${timestamp}_${randomBytes}`;
}

export function generateTrialToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length < 8) return '***';
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}
