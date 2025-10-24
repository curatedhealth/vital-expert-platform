/**
 * Database Connection Pool Manager
 * Prevents connection exhaustion and improves performance
 */

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

interface PoolConfig {
  min: number; // Minimum number of connections
  max: number; // Maximum number of connections
  idleTimeoutMs: number; // How long a connection can be idle before being released
  acquireTimeoutMs: number; // Max time to wait for a connection
}

interface PooledConnection {
  client: SupabaseClient;
  inUse: boolean;
  lastUsed: number;
  createdAt: number;
}

/**
 * Supabase connection pool
 * Reuses connections to avoid connection exhaustion
 */
class SupabaseConnectionPool {
  private config: PoolConfig;
  private connections: PooledConnection[] = [];
  private waitQueue: Array<{
    resolve: (client: SupabaseClient) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = [];
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = {
      min: config.min || 2,
      max: config.max || 50,
      idleTimeoutMs: config.idleTimeoutMs || 30000, // 30 seconds
      acquireTimeoutMs: config.acquireTimeoutMs || 10000 // 10 seconds
    };

    // Initialize minimum connections
    this.initializePool();

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Initialize minimum number of connections
   */
  private async initializePool() {
    for (let i = 0; i < this.config.min; i++) {
      try {
        await this.createConnection();
      } catch (error) {
        console.error('Failed to create initial connection:', error);
      }
    }
  }

  /**
   * Create a new connection
   */
  private async createConnection(): Promise<PooledConnection> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const client = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-connection-pool': 'true'
        }
      }
    });

    const connection: PooledConnection = {
      client,
      inUse: false,
      lastUsed: Date.now(),
      createdAt: Date.now()
    };

    this.connections.push(connection);
    return connection;
  }

  /**
   * Acquire a connection from the pool
   */
  async acquire(): Promise<SupabaseClient> {
    // Try to find an available connection
    const available = this.connections.find(conn => !conn.inUse);

    if (available) {
      available.inUse = true;
      available.lastUsed = Date.now();
      return available.client;
    }

    // Check if we can create a new connection
    if (this.connections.length < this.config.max) {
      const newConn = await this.createConnection();
      newConn.inUse = true;
      return newConn.client;
    }

    // Wait for a connection to become available
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // Remove from queue
        const index = this.waitQueue.findIndex(item => item.resolve === resolve);
        if (index !== -1) {
          this.waitQueue.splice(index, 1);
        }

        reject(new Error(
          `Connection pool timeout after ${this.config.acquireTimeoutMs}ms. ` +
          `Pool size: ${this.connections.length}, In use: ${this.connections.filter(c => c.inUse).length}`
        ));
      }, this.config.acquireTimeoutMs);

      this.waitQueue.push({ resolve, reject, timeout });
    });
  }

  /**
   * Release a connection back to the pool
   */
  release(client: SupabaseClient) {
    const connection = this.connections.find(conn => conn.client === client);

    if (connection) {
      connection.inUse = false;
      connection.lastUsed = Date.now();

      // Check if anyone is waiting
      if (this.waitQueue.length > 0) {
        const waiter = this.waitQueue.shift();
        if (waiter) {
          clearTimeout(waiter.timeout);
          connection.inUse = true;
          waiter.resolve(client);
        }
      }
    }
  }

  /**
   * Execute a query with automatic connection management
   */
  async withConnection<T>(
    fn: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    const client = await this.acquire();

    try {
      return await fn(client);
    } finally {
      this.release(client);
    }
  }

  /**
   * Clean up idle connections
   */
  private cleanup() {
    const now = Date.now();

    // Remove idle connections (keep minimum)
    const idleConnections = this.connections.filter(
      conn => !conn.inUse && now - conn.lastUsed > this.config.idleTimeoutMs
    );

    // Keep at least minimum connections
    const toRemove = Math.max(0, this.connections.length - this.config.min);

    idleConnections.slice(0, toRemove).forEach(conn => {
      const index = this.connections.indexOf(conn);
      if (index !== -1) {
        this.connections.splice(index, 1);
      }
    });

    // Log pool stats
    if (process.env.NODE_ENV === 'development') {
      console.log('[Connection Pool Stats]', {
        total: this.connections.length,
        inUse: this.connections.filter(c => c.inUse).length,
        idle: this.connections.filter(c => !c.inUse).length,
        waiting: this.waitQueue.length
      });
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.idleTimeoutMs / 2);
  }

  /**
   * Shutdown the pool and close all connections
   */
  async shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clear wait queue
    this.waitQueue.forEach(waiter => {
      clearTimeout(waiter.timeout);
      waiter.reject(new Error('Connection pool shutting down'));
    });
    this.waitQueue = [];

    // Note: Supabase JS client doesn't have explicit close method
    // Connections will be cleaned up by garbage collection
    this.connections = [];
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      total: this.connections.length,
      inUse: this.connections.filter(c => c.inUse).length,
      idle: this.connections.filter(c => !c.inUse).length,
      waiting: this.waitQueue.length,
      config: this.config
    };
  }
}

// Global connection pool instance
let globalPool: SupabaseConnectionPool | null = null;

/**
 * Get or create the global connection pool
 */
export function getConnectionPool(): SupabaseConnectionPool {
  if (!globalPool) {
    globalPool = new SupabaseConnectionPool({
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '50'),
      idleTimeoutMs: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
      acquireTimeoutMs: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '10000')
    });
  }

  return globalPool;
}

/**
 * Create a pooled Supabase client
 * This is a drop-in replacement for createClient()
 */
export async function createPooledClient(): Promise<SupabaseClient> {
  const pool = getConnectionPool();
  return pool.acquire();
}

/**
 * Release a pooled client back to the pool
 */
export function releasePooledClient(client: SupabaseClient) {
  const pool = getConnectionPool();
  pool.release(client);
}

/**
 * Execute a database operation with automatic connection management
 */
export async function withPooledClient<T>(
  fn: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  const pool = getConnectionPool();
  return pool.withConnection(fn);
}

/**
 * Get connection pool statistics
 */
export function getPoolStats() {
  const pool = getConnectionPool();
  return pool.getStats();
}

/**
 * Shutdown the connection pool (for graceful server shutdown)
 */
export async function shutdownPool() {
  if (globalPool) {
    await globalPool.shutdown();
    globalPool = null;
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    console.log('Shutting down connection pool...');
    shutdownPool().then(() => {
      console.log('Connection pool closed');
    });
  });

  process.on('SIGINT', () => {
    console.log('Shutting down connection pool...');
    shutdownPool().then(() => {
      console.log('Connection pool closed');
      process.exit(0);
    });
  });
}
