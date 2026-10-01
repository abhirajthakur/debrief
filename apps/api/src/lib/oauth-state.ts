import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

const STATE_TTL_MS = 5 * 60 * 1000; // 5 minutes — OAuth redirects happen within seconds normally

// Reuses JWT_SECRET rather than introducing a dedicated secret: both are
// the same kind of claim ("we issued this a few minutes ago") over
// non-overlapping message formats — a reasonable simplification at this
// scale. ENCRYPTION_KEY (see lib/encryption.ts) stays separate on purpose:
// it protects long-lived stored credentials, a meaningfully higher-stakes
// threat model than a five-minute OAuth nonce.
function sign(message: string) {
  return createHmac('sha256', env.JWT_SECRET).update(message).digest('base64url');
}

export function createOAuthState(userId: string) {
  const expiresAt = Date.now() + STATE_TTL_MS;
  const payload = `${userId}.${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}.${signature}`).toString('base64url');
}

export function verifyOAuthState(state: string) {
  const decoded = Buffer.from(state, 'base64url').toString('utf8');
  const [userId, expiresAtStr, signature] = decoded.split('.');
  if (!userId || !expiresAtStr || !signature) {
    throw new Error('Malformed OAuth state');
  }

  const expected = sign(`${userId}.${expiresAtStr}`);
  const providedBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
    throw new Error('Invalid OAuth state signature');
  }

  if (Date.now() > Number(expiresAtStr)) {
    throw new Error('OAuth state has expired');
  }

  return userId;
}
