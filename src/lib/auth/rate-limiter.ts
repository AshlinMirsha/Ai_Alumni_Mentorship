import { hashIp } from "./crypto";

interface RateLimitRecord {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

// In-memory sliding window cache (keyed by hashed IP)
const attemptsMap = new Map<string, RateLimitRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes block after reaching limit

/**
 * Checks whether an IP address is currently rate-limited for verification code attempts.
 */
export function checkRateLimit(clientIp?: string | null): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const ipKey = hashIp(clientIp);
  const now = Date.now();
  const record = attemptsMap.get(ipKey);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  // Check if window has expired
  if (now - record.firstAttemptAt > WINDOW_MS) {
    attemptsMap.delete(ipKey);
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  // Check remaining attempts
  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
  };
}

/**
 * Records a failed verification attempt. If threshold exceeded, blocks the IP.
 */
export function recordFailedAttempt(clientIp?: string | null): {
  blocked: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const ipKey = hashIp(clientIp);
  const now = Date.now();
  let record = attemptsMap.get(ipKey);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    record = {
      count: 1,
      firstAttemptAt: now,
    };
  } else {
    record.count += 1;
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    attemptsMap.set(ipKey, record);
    return {
      blocked: true,
      remainingAttempts: 0,
      retryAfterSeconds: Math.ceil(BLOCK_DURATION_MS / 1000),
    };
  }

  attemptsMap.set(ipKey, record);
  return {
    blocked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.count,
  };
}

/**
 * Resets the attempt counter upon a successful verification.
 */
export function resetRateLimit(clientIp?: string | null): void {
  const ipKey = hashIp(clientIp);
  attemptsMap.delete(ipKey);
}

/**
 * Cleanup helper for tests
 */
export function clearRateLimitCache(): void {
  attemptsMap.clear();
}
