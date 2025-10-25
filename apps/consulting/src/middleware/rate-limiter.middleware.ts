/**
 * VITAL Path Rate Limiter Middleware
 * Implements intelligent rate limiting with healthcare-specific patterns
 */

interface RateLimitConfig {
  key: string;
  limit: number;
  window: number; // milliseconds
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// In-memory store for development - replace with Redis in production

export async function rateLimit(config: RateLimitConfig): Promise<RateLimitResult> {

  // Get current rate limit data

  // Reset if window has expired
  if (!current || now > current.resetTime) {

    rateLimitStore.set(key, { count: 1, resetTime: newResetTime });

    return {
      success: true,
      limit: config.limit,
      current: 1,
      remaining: config.limit - 1,
      resetTime: newResetTime
    };
  }

  // Check if limit exceeded
  if (current.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      current: current.count,
      remaining: 0,
      resetTime: current.resetTime,
      retryAfter: current.resetTime - now
    };
  }

  // Increment counter
  current.count += 1;
  rateLimitStore.set(key, current);

  return {
    success: true,
    limit: config.limit,
    current: current.count,
    remaining: config.limit - current.count,
    resetTime: current.resetTime
  };
}

// Healthcare-specific rate limiting patterns
export const __HEALTHCARE_PATTERNS = {
  // Burst protection for critical medical queries
  MEDICAL_EMERGENCY: { requests: 3, window: 300000 }, // 3 per 5 minutes

  // Specialist consultation limits
  SPECIALIST_CONSULTATION: { requests: 5, window: 900000 }, // 5 per 15 minutes

  // Clinical data access
  CLINICAL_DATA_ACCESS: { requests: 20, window: 3600000 }, // 20 per hour

  // Standard healthcare API
  HEALTHCARE_API: { requests: 60, window: 60000 }, // 60 per minute

  // WebSocket connections
  WEBSOCKET_CONNECTIONS: { requests: 10, window: 60000 }, // 10 connections per minute
};

export async function getHealthcareRateLimit(
  identifier: string,
  pattern: keyof typeof HEALTHCARE_PATTERNS
): Promise<RateLimitResult> {
  // eslint-disable-next-line security/detect-object-injection

  return await rateLimit({
    key: `healthcare:${pattern}:${identifier}`,
    limit: config.requests,
    window: config.window
  });
}

// Cleanup expired entries periodically
setInterval(() => {

  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute