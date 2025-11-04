/**
 * Configuration for VITAL Path Node.js Gateway
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    host: process.env.GATEWAY_HOST || '0.0.0.0',
    port: parseInt(process.env.GATEWAY_PORT || '3001', 10),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    maxRequestSize: '10mb',
    shutdownTimeout: 30000 // 30 seconds
  },

  pythonService: {
    url: process.env.PYTHON_SERVICE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.PYTHON_SERVICE_TIMEOUT || '30000', 10),
    retries: parseInt(process.env.PYTHON_SERVICE_RETRIES || '3', 10),
    healthCheckInterval: parseInt(process.env.PYTHON_HEALTH_CHECK_INTERVAL || '30000', 10)
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3002,http://localhost:3000').split(',')
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
    enableFile: process.env.ENABLE_FILE_LOGGING !== 'false'
  },

  websocket: {
    maxConnections: parseInt(process.env.WS_MAX_CONNECTIONS || '1000', 10),
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10),
    connectionTimeout: parseInt(process.env.WS_CONNECTION_TIMEOUT || '60000', 10)
  },

  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
    enableHealthCheck: process.env.ENABLE_HEALTH_CHECK !== 'false'
  },

  security: {
    apiKeyHeader: process.env.API_KEY_HEADER || 'X-API-Key',
    enableApiKeyAuth: process.env.ENABLE_API_KEY_AUTH === 'true',
    trustedProxies: (process.env.TRUSTED_PROXIES || '').split(',').filter(Boolean)
  }
};

// Validation
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

export default config;