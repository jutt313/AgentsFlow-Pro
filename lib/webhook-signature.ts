/**
 * Webhook Signature Utilities
 * HMAC-SHA256 signature generation and verification for webhooks
 */

import crypto from 'crypto';

/**
 * Generate HMAC-SHA256 signature for webhook
 * @param secret - Webhook secret
 * @param timestamp - Request timestamp (ISO string or Unix timestamp)
 * @param body - Raw request body (string)
 * @returns Hex-encoded signature
 */
export function generateSignature(secret: string, timestamp: string, body: string): string {
  const payload = `${timestamp}.${body}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Verify HMAC-SHA256 signature for webhook
 * @param signature - Provided signature to verify
 * @param secret - Webhook secret
 * @param timestamp - Request timestamp
 * @param body - Raw request body
 * @returns true if signature is valid
 */
export function verifySignature(
  signature: string,
  secret: string,
  timestamp: string,
  body: string
): boolean {
  const expectedSignature = generateSignature(secret, timestamp, body);
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    // If buffers are different lengths, timingSafeEqual throws
    return false;
  }
}

/**
 * Verify timestamp is within acceptable range
 * @param timestamp - Request timestamp (Unix timestamp in seconds or milliseconds)
 * @param toleranceSeconds - Maximum age of request in seconds (default: 300 = 5 minutes)
 * @returns true if timestamp is valid
 */
export function verifyTimestamp(timestamp: string | number, toleranceSeconds: number = 300): boolean {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  
  // Parse timestamp - handle both seconds and milliseconds
  let timestampSeconds: number;
  if (typeof timestamp === 'string') {
    const parsed = parseInt(timestamp, 10);
    timestampSeconds = parsed > 1e12 ? Math.floor(parsed / 1000) : parsed;
  } else {
    timestampSeconds = timestamp > 1e12 ? Math.floor(timestamp / 1000) : timestamp;
  }

  const diff = Math.abs(now - timestampSeconds);
  return diff <= toleranceSeconds;
}

/**
 * Hash secret for secure storage
 * @param secret - Plain text secret
 * @returns Hashed secret (SHA-256)
 */
export function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

/**
 * Generate a secure random secret
 * @param bytes - Number of random bytes (default: 32)
 * @returns Hex-encoded random string
 */
export function generateSecret(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Format webhook headers for response
 * @param signature - HMAC signature
 * @param timestamp - Request timestamp
 * @returns Object with X-AF-Signature and X-AF-Timestamp headers
 */
export function formatWebhookHeaders(signature: string, timestamp: string) {
  return {
    'X-AF-Signature': signature,
    'X-AF-Timestamp': timestamp,
  };
}

/**
 * Extract and validate webhook headers from request
 * @param headers - Request headers
 * @returns Object with signature and timestamp, or null if invalid
 */
export function extractWebhookHeaders(headers: Headers): { signature: string; timestamp: string } | null {
  const signature = headers.get('x-af-signature');
  const timestamp = headers.get('x-af-timestamp');

  if (!signature || !timestamp) {
    return null;
  }

  return { signature, timestamp };
}

