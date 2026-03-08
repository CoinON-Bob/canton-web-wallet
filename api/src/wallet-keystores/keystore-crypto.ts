import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;
const SALT_LEN = 16;

/**
 * Encrypt plaintext with a key (32-byte Buffer or 64-char hex string).
 */
export function encrypt(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== KEY_LEN) {
    throw new Error('KEY_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  }
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

/**
 * Decrypt payload produced by encrypt().
 */
export function decrypt(ciphertextBase64: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== KEY_LEN) {
    throw new Error('KEY_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  }
  const buf = Buffer.from(ciphertextBase64, 'base64');
  if (buf.length < IV_LEN + TAG_LEN) {
    throw new Error('Invalid encrypted payload');
  }
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const enc = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
  decipher.setAuthTag(tag);
  return decipher.update(enc).toString('utf8') + decipher.final('utf8');
}
