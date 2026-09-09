import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Derives the 32-byte master encryption key from environment variable LETTER_ENCRYPTION_KEY
 * or falls back to a derived hash from JWT_SECRET to ensure robust zero-failure operation.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.LETTER_ENCRYPTION_KEY;
  if (envKey && envKey.trim()) {
    const trimmed = envKey.trim();
    // If it's a 64-char hex string (32 bytes)
    if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
      return Buffer.from(trimmed, 'hex');
    }
    // Otherwise hash it to guarantee exactly 32 bytes
    return crypto.createHash('sha256').update(trimmed).digest();
  }

  // Fallback derived key from JWT_SECRET or secure default
  const secret = process.env.JWT_SECRET || 'my_diary_default_secure_key_fallback_2026';
  return crypto.createHash('sha256').update(secret).digest();
}

export interface EncryptedPayload {
  version: number;
  iv: string;
  tag: string;
  ciphertext: string;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: 'ENC:<base64-json>'
 */
export function encryptLetterContent(plainText: string): string {
  if (!plainText) return '';
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let ciphertext = cipher.update(plainText, 'utf-8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    const payload: EncryptedPayload = {
      version: 1,
      iv: iv.toString('hex'),
      tag,
      ciphertext,
    };

    return 'ENC:' + Buffer.from(JSON.stringify(payload)).toString('base64');
  } catch (err) {
    console.error('[Crypto] Letter encryption error:', err);
    throw new Error('Encryption of letter content failed');
  }
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 */
export function decryptLetterContent(encryptedString: string): string {
  if (!encryptedString) return '';
  if (!encryptedString.startsWith('ENC:')) {
    // Legacy unencrypted plaintext fallback
    return encryptedString;
  }

  try {
    const base64Payload = encryptedString.substring(4);
    const jsonStr = Buffer.from(base64Payload, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonStr) as EncryptedPayload;

    const key = getEncryptionKey();
    const iv = Buffer.from(payload.iv, 'hex');
    const tag = Buffer.from(payload.tag, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  } catch (err) {
    console.error('[Crypto] Letter decryption failed (invalid key or tampered payload):', err);
    return '[Decryption error: private key mismatch or corrupted payload]';
  }
}

/**
 * Generates a cryptographically secure random public token (32 alphanumeric chars / 24 hex bytes).
 */
export function generatePublicToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Computes the SHA-256 hash of a public letter token.
 * Only this hash is stored in MongoDB for public link lookups.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}
