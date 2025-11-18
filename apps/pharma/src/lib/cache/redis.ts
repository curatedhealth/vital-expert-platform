/**
 * Redis Cache Service
 *
 * Distributed caching using Upstash Redis.
 * Used for session storage, rate limiting, and job queue.
 *
 * Features:
 * - Type-safe get/set operations
 * - TTL support
 * - JSON serialization
 * - Namespace support
 * - Batch operations
 *
 * @module lib/cache/redis
 */

import { Redis } from '@upstash/redis';

// ============================================================================
// CONFIGURATION
// ============================================================================

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Default TTL values (in seconds)
 */
export const TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
} as const;

/**
 * Key prefixes for namespacing
 */
export const KEY_PREFIX = {
  AGENT: 'agent',
  USER: 'user',
  SESSION: 'session',
  CONVERSATION: 'conversation',
  JOB: 'job',
  RATE_LIMIT: 'ratelimit',
  CACHE: 'cache',
} as const;

// ============================================================================
// KEY HELPERS
// ============================================================================

/**
 * Create namespaced key
 *
 * @param prefix - Key prefix/namespace
 * @param key - Key identifier
 * @returns Namespaced key
 */
export function createKey(prefix: string, key: string): string {
  return `${prefix}:${key}`;
}

// ============================================================================
// BASIC OPERATIONS
// ============================================================================

/**
 * Get value from Redis
 *
 * @param key - Cache key
 * @returns Cached value or null
 */
export async function get<T = unknown>(key: string): Promise<T | null> {
  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    console.error('[Redis] Error getting key:', key, error);
    return null;
  }
}

/**
 * Set value in Redis
 *
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttl - Optional TTL in seconds
 */
export async function set<T = unknown>(
  key: string,
  value: T,
  ttl?: number
): Promise<void> {
  try {
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
  } catch (error) {
    console.error('[Redis] Error setting key:', key, error);
  }
}

/**
 * Delete key from Redis
 *
 * @param key - Cache key
 * @returns Number of keys deleted
 */
export async function del(key: string): Promise<number> {
  try {
    return await redis.del(key);
  } catch (error) {
    console.error('[Redis] Error deleting key:', key, error);
    return 0;
  }
}

/**
 * Check if key exists
 *
 * @param key - Cache key
 * @returns True if exists
 */
export async function exists(key: string): Promise<boolean> {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error('[Redis] Error checking existence:', key, error);
    return false;
  }
}

/**
 * Set TTL on existing key
 *
 * @param key - Cache key
 * @param ttl - TTL in seconds
 * @returns True if successful
 */
export async function expire(key: string, ttl: number): Promise<boolean> {
  try {
    const result = await redis.expire(key, ttl);
    return result === 1;
  } catch (error) {
    console.error('[Redis] Error setting expiry:', key, error);
    return false;
  }
}

/**
 * Get TTL for key
 *
 * @param key - Cache key
 * @returns TTL in seconds, -1 if no expiry, -2 if not exists
 */
export async function ttl(key: string): Promise<number> {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error('[Redis] Error getting TTL:', key, error);
    return -2;
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Get multiple values
 *
 * @param keys - Array of cache keys
 * @returns Array of values (null for missing keys)
 */
export async function mget<T = unknown>(keys: string[]): Promise<(T | null)[]> {
  try {
    const result = await redis.mget(...keys);
    return result as (T | null)[];
  } catch (error) {
    console.error('[Redis] Error getting multiple keys:', error);
    return keys.map(() => null);
  }
}

/**
 * Set multiple values
 *
 * @param entries - Record of key-value pairs
 */
export async function mset(entries: Record<string, unknown>): Promise<void> {
  try {
    await redis.mset(entries);
  } catch (error) {
    console.error('[Redis] Error setting multiple keys:', error);
  }
}

/**
 * Delete multiple keys
 *
 * @param keys - Array of cache keys
 * @returns Number of keys deleted
 */
export async function mdel(keys: string[]): Promise<number> {
  try {
    return await redis.del(...keys);
  } catch (error) {
    console.error('[Redis] Error deleting multiple keys:', error);
    return 0;
  }
}

// ============================================================================
// PATTERN OPERATIONS
// ============================================================================

/**
 * Get keys matching pattern
 *
 * @param pattern - Key pattern (use * as wildcard)
 * @returns Array of matching keys
 */
export async function keys(pattern: string): Promise<string[]> {
  try {
    return await redis.keys(pattern);
  } catch (error) {
    console.error('[Redis] Error getting keys by pattern:', pattern, error);
    return [];
  }
}

/**
 * Delete keys matching pattern
 *
 * @param pattern - Key pattern
 * @returns Number of keys deleted
 */
export async function delPattern(pattern: string): Promise<number> {
  try {
    const matchingKeys = await keys(pattern);
    if (matchingKeys.length === 0) {
      return 0;
    }
    return await mdel(matchingKeys);
  } catch (error) {
    console.error('[Redis] Error deleting keys by pattern:', pattern, error);
    return 0;
  }
}

// ============================================================================
// HIGH-LEVEL CACHE OPERATIONS
// ============================================================================

/**
 * Get or set cached value
 *
 * If value exists in cache, return it.
 * Otherwise, compute value using factory function and cache it.
 *
 * @param key - Cache key
 * @param factory - Function to compute value if not cached
 * @param ttl - Optional TTL in seconds
 * @returns Cached or computed value
 */
export async function getOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache
  const cached = await get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Compute value
  const value = await factory();

  // Cache for future requests
  await set(key, value, ttl);

  return value;
}

/**
 * Invalidate cache by prefix
 *
 * Useful for cache busting entire namespaces.
 *
 * @param prefix - Key prefix to invalidate
 * @returns Number of keys deleted
 */
export async function invalidatePrefix(prefix: string): Promise<number> {
  return await delPattern(`${prefix}:*`);
}

// ============================================================================
// HASH OPERATIONS (for complex objects)
// ============================================================================

/**
 * Set hash field
 *
 * @param key - Hash key
 * @param field - Field name
 * @param value - Field value
 */
export async function hset(key: string, field: string, value: unknown): Promise<void> {
  try {
    await redis.hset(key, { [field]: value });
  } catch (error) {
    console.error('[Redis] Error setting hash field:', key, field, error);
  }
}

/**
 * Get hash field
 *
 * @param key - Hash key
 * @param field - Field name
 * @returns Field value or null
 */
export async function hget<T = unknown>(key: string, field: string): Promise<T | null> {
  try {
    return await redis.hget<T>(key, field);
  } catch (error) {
    console.error('[Redis] Error getting hash field:', key, field, error);
    return null;
  }
}

/**
 * Get all hash fields
 *
 * @param key - Hash key
 * @returns Record of field-value pairs
 */
export async function hgetall(key: string): Promise<Record<string, unknown>> {
  try {
    const result = await redis.hgetall(key);
    return (result as Record<string, unknown>) || {};
  } catch (error) {
    console.error('[Redis] Error getting all hash fields:', key, error);
    return {};
  }
}

/**
 * Delete hash field
 *
 * @param key - Hash key
 * @param field - Field name
 * @returns Number of fields deleted
 */
export async function hdel(key: string, field: string): Promise<number> {
  try {
    return await redis.hdel(key, field);
  } catch (error) {
    console.error('[Redis] Error deleting hash field:', key, field, error);
    return 0;
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Test Redis connection
 *
 * @returns True if Redis is accessible
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('[Redis] Health check failed:', error);
    return false;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { redis };
export default {
  get,
  set,
  del,
  exists,
  expire,
  ttl,
  mget,
  mset,
  mdel,
  keys,
  delPattern,
  getOrSet,
  invalidatePrefix,
  hset,
  hget,
  hgetall,
  hdel,
  healthCheck,
  createKey,
  KEY_PREFIX,
  TTL,
};
