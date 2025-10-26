const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const redis = require('redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// CONFIGURATION
// ============================================================================

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
const REDIS_URL = process.env.REDIS_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Redis client (optional, for caching)
let redisClient = null;
if (REDIS_URL) {
  redisClient = redis.createClient({ url: REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.connect().catch(console.error);
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow frontend to load resources
}));

// CORS - Allow wildcard subdomains for multi-tenant
app.use(cors({
  origin: NODE_ENV === 'production'
    ? [
        'https://vital.expert',
        'https://www.vital.expert',
        'https://app.vital.expert',
        /^https:\/\/.*\.vital\.expert$/  // Wildcard subdomain support
      ]
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000, // requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/v1/', limiter);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    connections: {
      redis: redisClient ? (await redisClient.ping() === 'PONG' ? 'connected' : 'disconnected') : 'not-configured',
      aiEngine: 'checking...',
    },
  };

  // Check AI Engine connection
  try {
    await axios.get(`${AI_ENGINE_URL}/health`, { timeout: 3000 });
    health.connections.aiEngine = 'connected';
    res.status(200).json(health);
  } catch (error) {
    health.connections.aiEngine = 'disconnected';
    health.status = 'degraded';
    res.status(503).json(health);
  }
});

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * POST /v1/chat/completions
 * Proxy chat completion requests to AI Engine
 */
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { messages, agent_id, model, temperature, max_tokens, stream = false } = req.body;
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000001';

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'messages array is required and must not be empty',
      });
    }

    console.log(`[Gateway] Chat request - Tenant: ${tenantId}, Agent: ${agent_id || 'default'}`);

    // Forward to AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/v1/chat/completions`,
      {
        messages,
        agent_id,
        model: model || 'gpt-4-turbo-preview',
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 4096,
        stream,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 120000, // 2 minutes for long-running AI requests
        responseType: stream ? 'stream' : 'json',
      }
    );

    // Handle streaming response
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      response.data.pipe(res);
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error('[Gateway] Chat error:', error.message);

    if (error.response) {
      // AI Engine returned an error
      res.status(error.response.status).json({
        error: 'AI Engine error',
        message: error.response.data.message || error.message,
        details: error.response.data,
      });
    } else if (error.code === 'ECONNREFUSED') {
      // AI Engine is down
      res.status(503).json({
        error: 'Service unavailable',
        message: 'AI Engine is not responding. Please try again later.',
      });
    } else {
      // Other errors
      res.status(500).json({
        error: 'Gateway error',
        message: error.message,
      });
    }
  }
});

/**
 * POST /v1/agents/query
 * Query specific agent with RAG support
 */
app.post('/v1/agents/query', async (req, res) => {
  try {
    const { query, agent_id, session_id, enable_rag = true } = req.body;
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000001';

    if (!query || !agent_id) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'query and agent_id are required',
      });
    }

    console.log(`[Gateway] Agent query - Tenant: ${tenantId}, Agent: ${agent_id}`);

    // Check cache if Redis is available
    if (redisClient && enable_rag) {
      const cacheKey = `query:${agent_id}:${Buffer.from(query).toString('base64').substring(0, 50)}`;
      const cachedResponse = await redisClient.get(cacheKey);

      if (cachedResponse) {
        console.log('[Gateway] Cache hit');
        return res.json({
          ...JSON.parse(cachedResponse),
          cached: true,
        });
      }
    }

    // Forward to AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/v1/agents/query`,
      {
        query,
        agent_id,
        session_id,
        enable_rag,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 120000,
      }
    );

    // Cache response
    if (redisClient && response.data) {
      const cacheKey = `query:${agent_id}:${Buffer.from(query).toString('base64').substring(0, 50)}`;
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data)); // Cache for 1 hour
    }

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Agent query error:', error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Gateway error',
        message: error.message,
      });
    }
  }
});

/**
 * GET /v1/agents/:id
 * Get agent details
 */
app.get('/v1/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000001';

    const response = await axios.get(`${AI_ENGINE_URL}/v1/agents/${id}`, {
      headers: { 'x-tenant-id': tenantId },
      timeout: 10000,
    });

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Get agent error:', error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Gateway error',
        message: error.message,
      });
    }
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /health',
      'POST /v1/chat/completions',
      'POST /v1/agents/query',
      'GET /v1/agents/:id',
    ],
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Gateway] Unhandled error:', err);

  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    stack: NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ============================================================================
// SERVER START
// ============================================================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('🚀 VITAL API Gateway');
  console.log('='.repeat(60));
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`AI Engine: ${AI_ENGINE_URL}`);
  console.log(`Redis: ${REDIS_URL ? 'Connected' : 'Not configured'}`);
  console.log('='.repeat(60));
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    if (redisClient) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    if (redisClient) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }
    process.exit(0);
  });
});

module.exports = app;
