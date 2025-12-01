const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const redis = require('redis');
const cookieParser = require('cookie-parser');
const path = require('path');
const { tenantMiddleware } = require('./middleware/tenant');
const { userContextMiddleware } = require('./middleware/user-context');

// Load environment variables from root .env file
// Navigate from services/api-gateway/src/ up to project root
const rootDir = path.resolve(__dirname, '..', '..', '..');
require('dotenv').config({ path: path.join(rootDir, '.env') });
require('dotenv').config({ path: path.join(rootDir, '.env.local'), override: true });

const app = express();
const PORT = process.env.PORT || 4000;

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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-user-id'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing
app.use(cookieParser());

// Tenant context middleware (MUST be after body parsing, before routes)
app.use(tenantMiddleware);

// User context middleware (MUST be after tenant middleware for RLS)
// Sets user context for database RLS policies
app.use(userContextMiddleware);

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
// ROOT ROUTE
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    service: 'VITAL Platform API Gateway',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: {
      health: 'GET /health',
      metrics: 'GET /metrics',
      api: {
        chat: 'POST /v1/chat/completions',
        agents: {
          query: 'POST /v1/agents/query',
          getById: 'GET /v1/agents/:id',
        },
      },
    },
    availableRoutes: [
      'GET /health',
      'GET /metrics',
      'POST /v1/chat/completions',
      'POST /v1/agents/query',
      'GET /v1/agents/:id',
      'POST /api/rag/query',
      'POST /api/mode1/manual',
      'POST /api/mode2/automatic',
      'POST /api/mode3/autonomous-automatic',
      'POST /api/mode4/autonomous-manual',
      'POST /api/broker/query',
      'GET /api/broker/health',
      'GET /api/broker/agents/:id',
      'GET /api/broker/roles/:id/agents',
      'GET /api/broker/roles/:id/jtbds',
      'GET /api/broker/agents/search',
      'GET /api/value/dashboard',
      'GET /api/value/jtbd/:id/roi',
      'GET /api/value/role/:id/roi',
      'GET /api/value/categories',
      'GET /api/value/categories/:code/insights',
      'GET /api/value/drivers',
      'GET /api/value/drivers/:code/insights',
      'GET /api/value/health',
      // Value Investigator (AI Companion)
      'POST /api/value-investigator/query',
      'POST /api/value-investigator/analyze-jtbd/:id',
      'POST /api/value-investigator/analyze-role/:id',
      'GET /api/value-investigator/suggestions',
      'GET /api/value-investigator/health',
      // Ontology Investigator (Enterprise Ontology AI Companion)
      'POST /api/ontology-investigator/query',
      'POST /api/ontology-investigator/gap-analysis',
      'POST /api/ontology-investigator/opportunities',
      'GET /api/ontology-investigator/persona-insights',
      'GET /api/ontology-investigator/hierarchy',
      'GET /api/ontology-investigator/suggestions',
      'GET /api/ontology-investigator/health',
      'ALL /api/langgraph-gui/*',
    ],
    frontend: 'http://localhost:3000',
  });
});

// ============================================================================
// HEALTH CHECK & METRICS
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

/**
 * Metrics endpoint for Prometheus
 */
app.get('/metrics', async (req, res) => {
  try {
    // Basic metrics endpoint - can be enhanced with prom-client later
    const metrics = {
      service: 'api-gateway',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
    };

    // Format as Prometheus text format (basic)
    const prometheusFormat = `# HELP api_gateway_uptime_seconds API Gateway uptime in seconds
# TYPE api_gateway_uptime_seconds gauge
api_gateway_uptime_seconds ${metrics.uptime}
# HELP api_gateway_memory_used_mb API Gateway memory used in MB
# TYPE api_gateway_memory_used_mb gauge
api_gateway_memory_used_mb ${metrics.memory.used}
# HELP api_gateway_memory_total_mb API Gateway total memory in MB
# TYPE api_gateway_memory_total_mb gauge
api_gateway_memory_total_mb ${metrics.memory.total}
`;

    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.send(prometheusFormat);
  } catch (error) {
    console.error('[Gateway] Metrics error:', error);
    res.status(500).send(`# ERROR: ${error.message}\n`);
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
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

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
 * POST /api/rag/query
 * Unified RAG query endpoint - routes to Python ai-engine
 */
app.post('/api/rag/query', async (req, res) => {
  try {
    const { query, text, strategy, domain_ids, selectedRagDomains, filters, max_results, maxResults, similarity_threshold, similarityThreshold, agent_id, agentId, user_id, userId, session_id, sessionId } = req.body;
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

    const queryText = query || text;
    if (!queryText) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'query or text is required',
      });
    }

    console.log(`[Gateway] RAG query - Tenant: ${tenantId}, Strategy: ${strategy || 'hybrid'}`);

    // Forward to Python AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/api/rag/query`,
      {
        query: queryText,
        strategy: strategy || 'hybrid',
        domain_ids: domain_ids || selectedRagDomains,
        filters: filters || {},
        max_results: max_results || maxResults || 10,
        similarity_threshold: similarity_threshold || similarityThreshold || 0.7,
        agent_id: agent_id || agentId,
        user_id: user_id || userId,
        session_id: session_id || sessionId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 30000, // 30 seconds for RAG queries
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] RAG query error:', error.message);

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
 * POST /v1/agents/query
 * Query specific agent with RAG support
 */
app.post('/v1/agents/query', async (req, res) => {
  try {
    const { query, agent_id, session_id, enable_rag = true } = req.body;
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

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
 * POST /api/mode1/manual
 * Mode 1 Manual Interactive - routes to Python ai-engine
 */
app.post('/api/mode1/manual', async (req, res) => {
  try {
    const { agent_id, message, enable_rag, enable_tools, selected_rag_domains, requested_tools, temperature, max_tokens, user_id, tenant_id, session_id, conversation_history } = req.body;
    const tenantId = req.tenantId || tenant_id || '00000000-0000-0000-0000-000000000001';

    if (!agent_id || !message) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'agent_id and message are required',
      });
    }

    console.log(`[Gateway] Mode 1 Manual - Tenant: ${tenantId}, Agent: ${agent_id}`);

    // Forward to Python AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/api/mode1/manual`,
      {
        agent_id,
        message,
        enable_rag: enable_rag !== false,
        enable_tools: enable_tools ?? false,
        selected_rag_domains: selected_rag_domains || [],
        requested_tools: requested_tools || [],
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 2000,
        user_id,
        tenant_id: tenantId,
        session_id,
        conversation_history: conversation_history || [],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 60000, // 60 seconds for Mode 1
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Mode 1 Manual error:', error.message);

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
 * POST /api/mode2/automatic
 * Mode 2 Automatic Agent Selection - routes to Python ai-engine
 */
app.post('/api/mode2/automatic', async (req, res) => {
  try {
    const { message, enable_rag, enable_tools, selected_rag_domains, requested_tools, temperature, max_tokens, user_id, tenant_id, session_id, conversation_history } = req.body;
    const tenantId = req.tenantId || tenant_id || '00000000-0000-0000-0000-000000000001';

    if (!message) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'message is required',
      });
    }

    console.log(`[Gateway] Mode 2 Automatic - Tenant: ${tenantId}`);

    // Forward to Python AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/api/mode2/automatic`,
      {
        message,
        enable_rag: enable_rag !== false,
        enable_tools: enable_tools ?? false,
        selected_rag_domains: selected_rag_domains || [],
        requested_tools: requested_tools || [],
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 2000,
        user_id,
        tenant_id: tenantId,
        session_id,
        conversation_history: conversation_history || [],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 90000, // 90 seconds for Mode 2
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Mode 2 Automatic error:', error.message);

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
 * POST /api/mode3/autonomous-automatic
 * Mode 3 Autonomous-Automatic - routes to Python ai-engine
 */
app.post('/api/mode3/autonomous-automatic', async (req, res) => {
  try {
    const { message, enable_rag, enable_tools, selected_rag_domains, requested_tools, temperature, max_tokens, max_iterations, confidence_threshold, user_id, tenant_id, session_id, conversation_history } = req.body;
    const tenantId = req.tenantId || tenant_id || '00000000-0000-0000-0000-000000000001';

    if (!message) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'message is required',
      });
    }

    console.log(`[Gateway] Mode 3 Autonomous-Automatic - Tenant: ${tenantId}`);

    // Forward to Python AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/api/mode3/autonomous-automatic`,
      {
        message,
        enable_rag: enable_rag !== false,
        enable_tools: enable_tools ?? true,
        selected_rag_domains: selected_rag_domains || [],
        requested_tools: requested_tools || [],
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 2000,
        max_iterations: max_iterations ?? 10,
        confidence_threshold: confidence_threshold ?? 0.95,
        user_id,
        tenant_id: tenantId,
        session_id,
        conversation_history: conversation_history || [],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 120000, // 120 seconds for Mode 3
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Mode 3 Autonomous-Automatic error:', error.message);

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
 * POST /api/mode4/autonomous-manual
 * Mode 4 Autonomous-Manual - routes to Python ai-engine
 */
app.post('/api/mode4/autonomous-manual', async (req, res) => {
  try {
    const { agent_id, message, enable_rag, enable_tools, selected_rag_domains, requested_tools, temperature, max_tokens, max_iterations, confidence_threshold, user_id, tenant_id, session_id, conversation_history } = req.body;
    const tenantId = req.tenantId || tenant_id || '00000000-0000-0000-0000-000000000001';

    if (!agent_id || !message) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'agent_id and message are required',
      });
    }

    console.log(`[Gateway] Mode 4 Autonomous-Manual - Tenant: ${tenantId}, Agent: ${agent_id}`);

    // Forward to Python AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/api/mode4/autonomous-manual`,
      {
        agent_id,
        message,
        enable_rag: enable_rag !== false,
        enable_tools: enable_tools ?? true,
        selected_rag_domains: selected_rag_domains || [],
        requested_tools: requested_tools || [],
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 2000,
        max_iterations: max_iterations ?? 10,
        confidence_threshold: confidence_threshold ?? 0.95,
        user_id,
        tenant_id: tenantId,
        session_id,
        conversation_history: conversation_history || [],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 120000, // 120 seconds for Mode 4
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Mode 4 Autonomous-Manual error:', error.message);

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
 * POST /api/metadata/process
 * Process file with all metadata services (extraction, sanitization, copyright, renaming)
 */
app.post('/api/metadata/process', async (req, res) => {
  try {
    const { filename, file_name, content, text, options } = req.body;
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

    const file_name_final = filename || file_name;
    const content_final = content || text || '';

    if (!file_name_final) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'filename is required',
      });
    }

    console.log(`[Gateway] Metadata processing - Tenant: ${tenantId}, File: ${file_name_final}`);

    // Forward to Python AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/api/metadata/process`,
      {
        filename: file_name_final,
        content: content_final,
        options: options || {},
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 60000, // 60 seconds for metadata processing
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Metadata processing error:', error.message);

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
 * POST /api/metadata/extract
 * Extract metadata from filename and/or content
 */
app.post('/api/metadata/extract', async (req, res) => {
  try {
    const { filename, file_name, content } = req.body;
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

    const file_name_final = filename || file_name;
    const content_final = content;

    if (!file_name_final) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'filename is required',
      });
    }

    console.log(`[Gateway] Metadata extraction - Tenant: ${tenantId}, File: ${file_name_final}`);

    const response = await axios.post(
      `${AI_ENGINE_URL}/api/metadata/extract`,
      {
        filename: file_name_final,
        content: content_final,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 30000,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Metadata extraction error:', error.message);

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
 * POST /api/metadata/sanitize
 * Sanitize content to remove PII/PHI
 */
app.post('/api/metadata/sanitize', async (req, res) => {
  try {
    const { content, text, options } = req.body;
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

    const content_final = content || text || '';

    if (!content_final) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'content is required',
      });
    }

    console.log(`[Gateway] Content sanitization - Tenant: ${tenantId}`);

    const response = await axios.post(
      `${AI_ENGINE_URL}/api/metadata/sanitize`,
      {
        content: content_final,
        options: options || {},
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 30000,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Content sanitization error:', error.message);

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
 * POST /api/metadata/copyright-check
 * Check document for copyright compliance
 */
app.post('/api/metadata/copyright-check', async (req, res) => {
  try {
    const { content, text, filename, file_name, metadata, options } = req.body;
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

    const content_final = content || text || '';
    const file_name_final = filename || file_name || 'document';

    if (!content_final) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'content is required',
      });
    }

    console.log(`[Gateway] Copyright check - Tenant: ${tenantId}, File: ${file_name_final}`);

    const response = await axios.post(
      `${AI_ENGINE_URL}/api/metadata/copyright-check`,
      {
        content: content_final,
        filename: file_name_final,
        metadata: metadata || {},
        options: options || {},
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 30000,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Copyright check error:', error.message);

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
 * POST /api/metadata/generate-filename
 * Generate new filename based on metadata and taxonomy
 */
app.post('/api/metadata/generate-filename', async (req, res) => {
  try {
    const { metadata, original_filename, filename } = req.body;
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

    if (!metadata) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'metadata is required',
      });
    }

    console.log(`[Gateway] Filename generation - Tenant: ${tenantId}`);

    const response = await axios.post(
      `${AI_ENGINE_URL}/api/metadata/generate-filename`,
      {
        metadata: metadata,
        original_filename: original_filename || filename,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 10000,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Filename generation error:', error.message);

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
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

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

/**
 * POST /api/embeddings/generate
 * Embedding generation endpoint - routes to Python ai-engine
 */
app.post('/api/embeddings/generate', async (req, res) => {
  try {
    const { text, model, provider, dimensions, normalize } = req.body;
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

    if (!text) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'text is required',
      });
    }

    console.log(`[Gateway] Embedding generation - Tenant: ${tenantId}, Model: ${model || 'default'}`);

    // Forward to Python AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/api/embeddings/generate`,
      {
        text,
        model,
        provider,
        dimensions,
        normalize: normalize !== undefined ? normalize : true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 30000, // 30 seconds for embedding generation
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Embedding generation error:', error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'Service unavailable',
        message: 'AI Engine is not responding. Please try again later.',
      });
    } else {
      res.status(500).json({
        error: 'Gateway error',
        message: error.message,
      });
    }
  }
});

/**
 * POST /api/embeddings/generate/batch
 * Batch embedding generation endpoint - routes to Python ai-engine
 */
app.post('/api/embeddings/generate/batch', async (req, res) => {
  try {
    const { texts, model, provider, normalize } = req.body;
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'texts array is required and must not be empty',
      });
    }

    console.log(`[Gateway] Batch embedding generation - Tenant: ${tenantId}, Count: ${texts.length}`);

    // Forward to Python AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/api/embeddings/generate/batch`,
      {
        texts,
        model,
        provider,
        normalize: normalize !== undefined ? normalize : true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 60000, // 60 seconds for batch generation
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Batch embedding generation error:', error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'Service unavailable',
        message: 'AI Engine is not responding. Please try again later.',
      });
    } else {
      res.status(500).json({
        error: 'Gateway error',
        message: error.message,
      });
    }
  }
});

/**
 * POST /api/agents/select
 * Agent selection query analysis - routes to Python ai-engine
 */
app.post('/api/agents/select', async (req, res) => {
  try {
    const { query, user_id, tenant_id, correlation_id } = req.body;
    const tenantId = req.tenantId || tenant_id || '00000000-0000-0000-0000-000000000001';

    if (!query) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'query is required',
      });
    }

    console.log(`[Gateway] Agent Selection - Tenant: ${tenantId}, Query: ${query.substring(0, 100)}`);

    // Forward to Python AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/api/agents/select`,
      {
        query,
        user_id,
        tenant_id: tenantId,
        correlation_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 30000, // 30 seconds for query analysis
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Agent Selection error:', error.message);

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
 * POST /api/panel/orchestrate
 * Proxy to Python AI Engine for panel orchestration
 */
app.post('/api/panel/orchestrate', async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] || req.body.tenant_id;
  const sessionId = `panel_${Date.now()}`;

  try {
    const {
      message,
      panel,
      mode = 'parallel',
      context,
      user_id,
      tenant_id,
    } = req.body;

    const response = await axios.post(
      `${AI_ENGINE_URL}/api/panel/orchestrate`,
      {
        message,
        panel,
        mode,
        context,
        user_id: user_id || req.user?.id,
        tenant_id: tenant_id || tenantId,
        session_id: sessionId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 120000, // 120 seconds for panel orchestration
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Panel Orchestration error:', error.message);

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
 * GET /api/agents/:id/stats
 * Get agent statistics from Python AI-engine
 */
app.get('/api/agents/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 7 } = req.query;
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

    if (!id) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Agent ID is required',
      });
    }

    console.log(`[Gateway] Agent stats - Tenant: ${tenantId}, Agent: ${id}, Days: ${days}`);

    // Forward to Python AI Engine
    const response = await axios.get(
      `${AI_ENGINE_URL}/api/agents/${id}/stats`,
      {
        params: { days: parseInt(days, 10) },
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 15000, // 15 seconds for stats queries
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Agent stats error:', error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Gateway error',
        message: error.message,
        // Return empty stats instead of synthetic data
        data: {
          totalConsultations: 0,
          satisfactionScore: 0.0,
          successRate: 0.0,
          averageResponseTime: 0.0,
          certifications: [],
          totalTokensUsed: 0,
          totalCost: 0.0,
          confidenceLevel: 0,
          availability: 'offline',
          recentFeedback: [],
        },
      });
    }
  }
});

// ============================================================================
// INTELLIGENCE BROKER ROUTES
// Unified query interface combining PostgreSQL, Pinecone, and Neo4j
// ============================================================================

/**
 * POST /api/broker/query
 * Intelligence Broker unified query - routes to Python ai-engine
 */
app.post('/api/broker/query', async (req, res) => {
  try {
    const { query, service_mode, agent_id, role_id, persona_id, include_ontology, include_agents, include_jtbds, top_k } = req.body;
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';

    if (!query) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'query is required',
      });
    }

    console.log(`[Gateway] Intelligence Broker query - Tenant: ${tenantId}, Mode: ${service_mode || 'ask_expert'}`);

    // Forward to Python AI Engine GraphRAG router
    const response = await axios.post(
      `${AI_ENGINE_URL}/v1/graphrag/broker/query`,
      {
        query,
        service_mode: service_mode || 'ask_expert',
        agent_id,
        role_id,
        persona_id,
        tenant_id: tenantId,
        include_ontology: include_ontology !== false,
        include_agents: include_agents !== false,
        include_jtbds: include_jtbds || false,
        top_k: top_k || 10,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        timeout: 60000, // 60 seconds for broker queries
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Intelligence Broker query error:', error.message);

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
 * GET /api/broker/health
 * Intelligence Broker health check
 */
app.get('/api/broker/health', async (req, res) => {
  try {
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/graphrag/broker/health`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Intelligence Broker health error:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

/**
 * GET /api/broker/agents/:id
 * Get agent details via Intelligence Broker
 */
app.get('/api/broker/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/graphrag/broker/agents/${id}`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Broker get agent error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/broker/roles/:id/agents
 * Get agents for a role via Intelligence Broker
 */
app.get('/api/broker/roles/:id/agents', async (req, res) => {
  try {
    const { id } = req.params;
    const { top_k = 10 } = req.query;
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/graphrag/broker/roles/${id}/agents`,
      {
        params: { top_k: parseInt(top_k, 10) },
        timeout: 10000,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Broker get agents for role error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/broker/roles/:id/jtbds
 * Get JTBDs for a role via Intelligence Broker
 */
app.get('/api/broker/roles/:id/jtbds', async (req, res) => {
  try {
    const { id } = req.params;
    const { top_k = 20 } = req.query;
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/graphrag/broker/roles/${id}/jtbds`,
      {
        params: { top_k: parseInt(top_k, 10) },
        timeout: 10000,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Broker get JTBDs for role error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/broker/agents/search
 * Full-text agent search via Intelligence Broker
 */
app.get('/api/broker/agents/search', async (req, res) => {
  try {
    const { q, top_k = 10 } = req.query;
    if (!q) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Query parameter q is required',
      });
    }
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/graphrag/broker/agents/search`,
      {
        params: { q, top_k: parseInt(top_k, 10) },
        timeout: 15000,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Broker agent search error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

// =============================================================================
// VALUE FRAMEWORK ROUTES
// ROI Calculator, Value Insights, and Dashboard
// =============================================================================

/**
 * GET /api/value/dashboard
 * Get value dashboard with aggregated metrics
 */
app.get('/api/value/dashboard', async (req, res) => {
  try {
    const { tenant_id } = req.query;
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/value/dashboard`,
      {
        params: tenant_id ? { tenant_id } : {},
        timeout: 30000,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Value dashboard error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/value/jtbd/:id/roi
 * Calculate ROI for a specific JTBD
 */
app.get('/api/value/jtbd/:id/roi', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/value/jtbd/${id}/roi`,
      { timeout: 15000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] JTBD ROI error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/value/role/:id/roi
 * Calculate aggregated ROI for a role
 */
app.get('/api/value/role/:id/roi', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/value/role/${id}/roi`,
      { timeout: 15000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Role ROI error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/value/categories
 * List all value categories
 */
app.get('/api/value/categories', async (req, res) => {
  try {
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/value/categories`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Value categories error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/value/categories/:code/insights
 * Get detailed insights for a value category
 */
app.get('/api/value/categories/:code/insights', async (req, res) => {
  try {
    const { code } = req.params;
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/value/categories/${code}/insights`,
      { timeout: 15000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Category insights error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/value/drivers
 * List all value drivers
 */
app.get('/api/value/drivers', async (req, res) => {
  try {
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/value/drivers`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Value drivers error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/value/drivers/:code/insights
 * Get detailed insights for a value driver
 */
app.get('/api/value/drivers/:code/insights', async (req, res) => {
  try {
    const { code } = req.params;
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/value/drivers/${code}/insights`,
      { timeout: 15000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Driver insights error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/value/health
 * Value Framework health check
 */
app.get('/api/value/health', async (req, res) => {
  try {
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/value/health`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Value health error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

// ============================================================================
// VALUE INVESTIGATOR ROUTES (AI-Powered Value Analysis Companion)
// ============================================================================

/**
 * POST /api/value-investigator/query
 * Ask the Value Investigator a question about value analysis
 */
app.post('/api/value-investigator/query', async (req, res) => {
  try {
    console.log('[Gateway] Value Investigator query:', req.body?.query?.substring(0, 100));
    const response = await axios.post(
      `${AI_ENGINE_URL}/v1/value-investigator/query`,
      req.body,
      {
        timeout: 120000, // 2 minutes for complex reasoning
        headers: { 'Content-Type': 'application/json' }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Value Investigator query error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * POST /api/value-investigator/analyze-jtbd/:id
 * Analyze value for a specific JTBD
 */
app.post('/api/value-investigator/analyze-jtbd/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tenant_id } = req.query;
    console.log(`[Gateway] Value Investigator analyzing JTBD: ${id}`);
    const url = tenant_id
      ? `${AI_ENGINE_URL}/v1/value-investigator/analyze-jtbd/${id}?tenant_id=${tenant_id}`
      : `${AI_ENGINE_URL}/v1/value-investigator/analyze-jtbd/${id}`;
    const response = await axios.post(url, {}, { timeout: 120000 });
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Value Investigator JTBD analysis error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * POST /api/value-investigator/analyze-role/:id
 * Analyze aggregated value for a role
 */
app.post('/api/value-investigator/analyze-role/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tenant_id } = req.query;
    console.log(`[Gateway] Value Investigator analyzing Role: ${id}`);
    const url = tenant_id
      ? `${AI_ENGINE_URL}/v1/value-investigator/analyze-role/${id}?tenant_id=${tenant_id}`
      : `${AI_ENGINE_URL}/v1/value-investigator/analyze-role/${id}`;
    const response = await axios.post(url, {}, { timeout: 120000 });
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Value Investigator Role analysis error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/value-investigator/suggestions
 * Get suggested questions for the Value Investigator
 */
app.get('/api/value-investigator/suggestions', async (req, res) => {
  try {
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/value-investigator/suggestions`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Value Investigator suggestions error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/value-investigator/health
 * Health check for Value Investigator service
 */
app.get('/api/value-investigator/health', async (req, res) => {
  try {
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/value-investigator/health`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Value Investigator health error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

// ============================================================================
// ONTOLOGY INVESTIGATOR ROUTES (AI-Powered Enterprise Ontology Analysis)
// ============================================================================

/**
 * POST /api/ontology-investigator/query
 * Ask the Ontology Investigator a question about the enterprise ontology
 */
app.post('/api/ontology-investigator/query', async (req, res) => {
  try {
    console.log('[Gateway] Ontology Investigator query:', req.body?.query?.substring(0, 100));
    const response = await axios.post(
      `${AI_ENGINE_URL}/v1/ontology-investigator/query`,
      req.body,
      {
        timeout: 120000, // 2 minutes for complex reasoning
        headers: { 'Content-Type': 'application/json' }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Ontology Investigator query error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * POST /api/ontology-investigator/gap-analysis
 * Analyze AI coverage gaps across the organization
 */
app.post('/api/ontology-investigator/gap-analysis', async (req, res) => {
  try {
    const { function_id } = req.query;
    console.log(`[Gateway] Ontology Investigator gap analysis - Function: ${function_id || 'all'}`);
    const url = function_id
      ? `${AI_ENGINE_URL}/v1/ontology-investigator/gap-analysis?function_id=${function_id}`
      : `${AI_ENGINE_URL}/v1/ontology-investigator/gap-analysis`;
    const response = await axios.post(url, {}, { timeout: 60000 });
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Ontology Investigator gap analysis error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * POST /api/ontology-investigator/opportunities
 * Score roles by AI transformation opportunity
 */
app.post('/api/ontology-investigator/opportunities', async (req, res) => {
  try {
    const { function_id, limit = 50 } = req.query;
    console.log(`[Gateway] Ontology Investigator opportunities - Function: ${function_id || 'all'}, Limit: ${limit}`);
    let url = `${AI_ENGINE_URL}/v1/ontology-investigator/opportunities?limit=${limit}`;
    if (function_id) url += `&function_id=${function_id}`;
    const response = await axios.post(url, {}, { timeout: 60000 });
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Ontology Investigator opportunities error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/ontology-investigator/persona-insights
 * Analyze persona distribution by archetype
 */
app.get('/api/ontology-investigator/persona-insights', async (req, res) => {
  try {
    console.log('[Gateway] Ontology Investigator persona insights');
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/ontology-investigator/persona-insights`,
      { timeout: 30000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Ontology Investigator persona insights error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/ontology-investigator/hierarchy
 * Get full ontology hierarchy with counts for all 8 layers (L0-L7)
 */
app.get('/api/ontology-investigator/hierarchy', async (req, res) => {
  try {
    const { tenant_id } = req.query;
    console.log(`[Gateway] Ontology Investigator hierarchy - Tenant: ${tenant_id || 'all'}`);
    const url = tenant_id
      ? `${AI_ENGINE_URL}/v1/ontology-investigator/hierarchy?tenant_id=${tenant_id}`
      : `${AI_ENGINE_URL}/v1/ontology-investigator/hierarchy`;
    const response = await axios.get(url, { timeout: 30000 });
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Ontology Investigator hierarchy error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/ontology-investigator/suggestions
 * Get suggested questions for the Ontology Investigator
 */
app.get('/api/ontology-investigator/suggestions', async (req, res) => {
  try {
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/ontology-investigator/suggestions`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Ontology Investigator suggestions error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * GET /api/ontology-investigator/health
 * Health check for Ontology Investigator service
 */
app.get('/api/ontology-investigator/health', async (req, res) => {
  try {
    const response = await axios.get(
      `${AI_ENGINE_URL}/v1/ontology-investigator/health`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Gateway] Ontology Investigator health error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Gateway error', message: error.message });
    }
  }
});

/**
 * LangGraph GUI Proxy Routes
 * Proxy all /api/langgraph-gui/* requests to Python AI Engine
 */
app.all('/api/langgraph-gui/*', async (req, res) => {
  try {
    const tenantId = req.tenantId || '00000000-0000-0000-0000-000000000001';
    // Extract the path after /api/langgraph-gui
    const remainingPath = req.path.replace(/^\/api\/langgraph-gui/, '') || '/';
    const url = `${AI_ENGINE_URL}/api/langgraph-gui${remainingPath}`;
    const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    console.log(`[Gateway] LangGraph GUI - ${req.method} ${remainingPath} - Tenant: ${tenantId}`);

    const config = {
      method: req.method,
      url: fullUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        ...req.headers,
      },
      timeout: 300000, // 5 minutes for long-running workflow executions
      validateStatus: () => true, // Don't throw on any status
    };

    // Add request body for POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      config.data = req.body;
    }

    // Handle streaming responses (SSE)
    if (req.headers.accept?.includes('text/event-stream')) {
      config.responseType = 'stream';
      const response = await axios(config);
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.status(response.status);
      
      response.data.pipe(res);
      return;
    }

    const response = await axios(config);

    // Forward response headers
    Object.keys(response.headers).forEach(key => {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, response.headers[key]);
      }
    });

    res.status(response.status);
    
    // Handle different response types
    if (response.headers['content-type']?.includes('application/json')) {
      res.json(response.data);
    } else if (response.headers['content-type']?.includes('text/')) {
      res.send(response.data);
    } else {
      res.send(response.data);
    }
  } catch (error) {
    console.error('[Gateway] LangGraph GUI error:', error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data || { error: error.message });
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'Service unavailable',
        message: 'AI Engine is not responding. Please try again later.',
      });
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
