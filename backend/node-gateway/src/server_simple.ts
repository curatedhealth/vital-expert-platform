/**
 * VITAL Path Node.js API Gateway - Simplified Version
 * Hybrid Backend Architecture - Node.js Gateway for Python AI Services
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import expressWinston from 'express-winston';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

class VitalPathGateway {
  private app: express.Application;
  private server: any;
  private logger: winston.Logger;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.setupLogger();
  }

  private setupLogger(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'vital-path-gateway' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(cors({
      origin: ["http://localhost:3000"],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60
      }
    });
    this.app.use('/api/', limiter);

    // Request logging
    this.app.use(expressWinston.logger({
      winstonInstance: this.logger,
      meta: true,
      msg: 'HTTP {{req.method}} {{req.url}}',
      expressFormat: true,
      colorize: false,
      ignoreRoute: (req) => req.url === '/health'
    }));

    this.logger.info('✅ Middleware configured');
  }

  private setupRoutes(): void {
    const PYTHON_BACKEND = process.env.PYTHON_EXPERT_SERVICE_URL || 'http://localhost:8001';

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'vital-path-gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Proxy routes to Python AI Services
    this.app.post('/api/ask-expert/execute', async (req, res) => {
      try {
        const response = await fetch(`${PYTHON_BACKEND}/expert/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        res.json(data);
      } catch (error) {
        this.logger.error('Proxy error:', error);
        res.status(500).json({ error: 'AI service temporarily unavailable' });
      }
    });

    // Stream reasoning (SSE)
    this.app.get('/api/ask-expert/stream/:sessionId', async (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
      
      try {
        const pythonStream = await fetch(
          `${PYTHON_BACKEND}/expert/stream/${req.params.sessionId}`
        );
        
        if (!pythonStream.ok) {
          throw new Error(`Python service error: ${pythonStream.status}`);
        }
        
        // Pipe Python SSE to client
        pythonStream.body.pipe(res);
      } catch (error) {
        this.logger.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    });

    // Mode Management Routes - Proxy to Python backend
    this.app.post('/api/ask-expert/modes/sessions/start', async (req, res) => {
      try {
        const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body)
        });
        res.json(await response.json());
      } catch (error) {
        this.logger.error('Mode start error:', error);
        res.status(500).json({ error: 'Failed to start session' });
      }
    });

    this.app.get('/api/ask-expert/modes/sessions/:sessionId', async (req, res) => {
      try {
        const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/${req.params.sessionId}`);
        res.json(await response.json());
      } catch (error) {
        this.logger.error('Get session error:', error);
        res.status(500).json({ error: 'Failed to get session' });
      }
    });

    this.app.post('/api/ask-expert/modes/sessions/:sessionId/query', async (req, res) => {
      try {
        const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/${req.params.sessionId}/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body)
        });
        res.json(await response.json());
      } catch (error) {
        this.logger.error('Query error:', error);
        res.status(500).json({ error: 'Failed to process query' });
      }
    });

    this.app.post('/api/ask-expert/modes/sessions/:sessionId/switch-mode', async (req, res) => {
      try {
        const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/${req.params.sessionId}/switch-mode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body)
        });
        res.json(await response.json());
      } catch (error) {
        this.logger.error('Switch mode error:', error);
        res.status(500).json({ error: 'Failed to switch mode' });
      }
    });

    this.app.post('/api/ask-expert/modes/sessions/:sessionId/agents/search', async (req, res) => {
      try {
        const response = await fetch(`${PYTHON_BACKEND}/expert/modes/sessions/${req.params.sessionId}/agents/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body)
        });
        res.json(await response.json());
      } catch (error) {
        this.logger.error('Agent search error:', error);
        res.status(500).json({ error: 'Failed to search agents' });
      }
    });

    this.app.post('/api/ask-expert/modes/recommend-mode', async (req, res) => {
      try {
        const response = await fetch(`${PYTHON_BACKEND}/expert/modes/recommend-mode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body)
        });
        res.json(await response.json());
      } catch (error) {
        this.logger.error('Recommend mode error:', error);
        res.status(500).json({ error: 'Failed to recommend mode' });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    this.logger.info('✅ Routes configured');
  }

  public async start(): Promise<void> {
    try {
      // Setup middleware and routes
      this.setupMiddleware();
      this.setupRoutes();

      // Start server
      this.server.listen(3001, '0.0.0.0', () => {
        this.logger.info(`🚀 VITAL Path Gateway started successfully`, {
          host: '0.0.0.0',
          port: 3001,
          environment: 'development'
        });
      });

    } catch (error) {
      this.logger.error('❌ Failed to start gateway:', error);
      process.exit(1);
    }
  }
}

// Start the gateway
const gateway = new VitalPathGateway();
gateway.start().catch((error) => {
  console.error('❌ Failed to start VITAL Path Gateway:', error);
  process.exit(1);
});

export default VitalPathGateway;
