import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended length for GCM

function getKey() {
  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte value, hex-encoded (64 hex characters)');
  }
  return key;
}

// Output format: iv.authTag.ciphertext, each base64url-encoded and
// dot-separated — safe to store as a single text column value.
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, ciphertext].map((buf) => buf.toString('base64url')).join('.');
}

export function decrypt(stored: string): string {
  const [ivPart, authTagPart, ciphertextPart] = stored.split('.');
  if (!ivPart || !authTagPart || !ciphertextPart) {
    throw new Error('Malformed encrypted value');
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivPart, 'base64url'));
  decipher.setAuthTag(Buffer.from(authTagPart, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}
