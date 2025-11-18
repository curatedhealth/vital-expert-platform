/**
 * Drizzle Database Client for Workers
 *
 * TypeScript-first database client for AWS ECS workers.
 * Provides connection pooling and type-safe queries.
 *
 * Features:
 * - Connection pooling with pg
 * - Type-safe queries via Drizzle
 * - Native pgvector support
 * - Transaction support
 * - Prepared statements
 *
 * @module lib/db/drizzle/client
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import * as schema from './schema';

// ============================================================================
// CONFIGURATION
// ============================================================================

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DATABASE_POOL_MAX ?? '20', 10),
  min: parseInt(process.env.DATABASE_POOL_MIN ?? '2', 10),
  idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT ?? '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DATABASE_TIMEOUT ?? '10000', 10),
  // SSL configuration for production
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: true,
          ca: process.env.DATABASE_CA_CERT,
        }
      : false,
};

// ============================================================================
// CONNECTION POOL
// ============================================================================

/**
 * PostgreSQL connection pool (singleton)
 */
let pool: Pool | null = null;

/**
 * Get or create connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(poolConfig);

    // Error handling
    pool.on('error', (err) => {
      console.error('Unexpected pool error:', err);
      // In production, send to error tracking (Sentry)
    });

    // Connection lifecycle logging (development only)
    if (process.env.NODE_ENV === 'development') {
      pool.on('connect', () => {
        console.log('[Drizzle] Pool connection established');
      });

      pool.on('remove', () => {
        console.log('[Drizzle] Pool connection removed');
      });
    }
  }

  return pool;
}

/**
 * Close connection pool gracefully
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[Drizzle] Connection pool closed');
  }
}

// ============================================================================
// DRIZZLE CLIENT
// ============================================================================

/**
 * Drizzle database client (singleton)
 */
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Get or create Drizzle client
 *
 * @returns Drizzle database client with full schema
 */
export function getDb() {
  if (!db) {
    const connectionPool = getPool();
    db = drizzle(connectionPool, {
      schema,
      logger: process.env.NODE_ENV === 'development',
    });
  }

  return db;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Execute raw SQL query
 *
 * @param query - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function executeRawQuery<T = unknown>(
  query: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query<T>(query, params);
  return result.rows;
}

/**
 * Test database connection
 *
 * @returns True if connection successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW()');
    console.log('[Drizzle] Connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('[Drizzle] Connection test failed:', error);
    return false;
  }
}

/**
 * Get connection pool stats
 *
 * @returns Pool statistics
 */
export function getPoolStats() {
  if (!pool) {
    return null;
  }

  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export default database client
export const db = getDb();

// Export schema for queries
export { schema };

// Export types
export type { Pool };

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

// Handle process termination
if (process.env.NODE_ENV !== 'test') {
  const shutdown = async (signal: string) => {
    console.log(`[Drizzle] Received ${signal}, closing pool...`);
    await closePool();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
