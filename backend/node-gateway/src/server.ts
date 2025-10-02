/**
 * VITAL Path Node.js API Gateway
 * Hybrid Backend Architecture - Node.js Gateway for Python AI Services
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import winston from 'winston';
import expressWinston from 'express-winston';
import dotenv from 'dotenv';
import { register as promRegister } from 'prom-client';

// Import services and middleware
import { setupRoutes } from './routes';
import { authMiddleware } from './middleware/auth';
import { validationMiddleware } from './middleware/validation';
import { errorHandler } from './middleware/error-handler';
import { WebSocketManager } from './websocket/websocket-manager';
import { PythonServiceProxy } from './services/python-service-proxy';
import { RedisService } from './services/redis-service';
import { MetricsService } from './services/metrics-service';
import { config } from './config';

// Load environment variables
dotenv.config();

class VitalPathGateway {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private wsManager: WebSocketManager;
  private pythonProxy: PythonServiceProxy;
  private redisService: RedisService;
  private metricsService: MetricsService;
  private logger: winston.Logger;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.cors.origins,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupLogger();
    this.initializeServices();
  }

  private setupLogger(): void {
    this.logger = winston.createLogger({
      level: config.logging.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'vital-path-gateway' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize Redis service
      this.redisService = new RedisService(config.redis);
      await this.redisService.connect();

      // Initialize metrics service
      this.metricsService = new MetricsService();

      // Initialize Python service proxy
      this.pythonProxy = new PythonServiceProxy(config.pythonService);

      // Initialize WebSocket manager
      this.wsManager = new WebSocketManager(this.io, this.pythonProxy, this.redisService);

      this.logger.info('🚀 All services initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize services:', error);
      throw error;
    }
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"]
        }
      }
    }));

    // CORS middleware
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: config.server.maxRequestSize }));
    this.app.use(express.urlencoded({ extended: true, limit: config.server.maxRequestSize }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: config.rateLimit.windowMs / 1000
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
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

    // Metrics collection
    this.app.use((req, res, next) => {
      this.metricsService.recordRequest(req.method, req.route?.path || req.path);
      next();
    });

    this.logger.info('✅ Middleware configured');
  }

  private setupProxyRoutes(): void {
    // Health check endpoint (local)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'vital-path-gateway',
        version: config.server.version,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        python_service: this.pythonProxy.isHealthy() ? 'connected' : 'disconnected'
      });
    });

    // Metrics endpoint
    this.app.get('/metrics', async (req, res) => {
      res.set('Content-Type', promRegister.contentType);
      res.end(await promRegister.metrics());
    });

    // Proxy routes to Python AI Services
    const pythonProxy = createProxyMiddleware({
      target: config.pythonService.url,
      changeOrigin: true,
      timeout: config.pythonService.timeout,
      retries: config.pythonService.retries,
      pathRewrite: {
        '^/api/ai/': '/api/', // Rewrite /api/ai/* to /api/*
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add authentication headers if needed
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }

        // Add request ID for tracing
        const requestId = req.headers['x-request-id'] || this.generateRequestId();
        proxyReq.setHeader('X-Request-ID', requestId);

        this.logger.info('🔀 Proxying request to Python service', {
          method: req.method,
          url: req.url,
          requestId
        });
      },
      onProxyRes: (proxyRes, req, res) => {
        this.metricsService.recordProxyResponse(
          req.method,
          req.url,
          proxyRes.statusCode || 0
        );
      },
      onError: (err, req, res) => {
        this.logger.error('❌ Proxy error:', err);
        this.metricsService.recordProxyError(req.method, req.url);

        if (!res.headersSent) {
          res.status(503).json({
            error: 'AI service temporarily unavailable',
            message: 'Please try again in a moment',
            requestId: req.headers['x-request-id']
          });
        }
      }
    });

    // Apply proxy middleware to AI service routes
    this.app.use('/api/ai', authMiddleware, pythonProxy);

    // Direct routes for Node.js handled endpoints
    setupRoutes(this.app, {
      pythonProxy: this.pythonProxy,
      redisService: this.redisService,
      wsManager: this.wsManager,
      logger: this.logger
    });

    this.logger.info('✅ Proxy routes configured');
  }

  private setupWebSocket(): void {
    this.wsManager.initialize();
    this.logger.info('✅ WebSocket server configured');
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use(errorHandler);

    // Error logging
    this.app.use(expressWinston.errorLogger({
      winstonInstance: this.logger
    }));

    this.logger.info('✅ Error handling configured');
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async start(): Promise<void> {
    try {
      // Setup middleware and routes
      this.setupMiddleware();
      this.setupProxyRoutes();
      this.setupWebSocket();
      this.setupErrorHandling();

      // Start server
      this.server.listen(config.server.port, config.server.host, () => {
        this.logger.info(`🚀 VITAL Path Gateway started successfully`, {
          host: config.server.host,
          port: config.server.port,
          environment: config.server.environment,
          pythonService: config.pythonService.url
        });
      });

      // Graceful shutdown handling
      this.setupGracefulShutdown();

    } catch (error) {
      this.logger.error('❌ Failed to start gateway:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      this.logger.info(`🔄 Received ${signal}, starting graceful shutdown...`);

      try {
        // Close WebSocket connections
        this.wsManager.closeAllConnections();

        // Close Redis connection
        await this.redisService.disconnect();

        // Close HTTP server
        this.server.close(() => {
          this.logger.info('✅ Gateway shutdown completed');
          process.exit(0);
        });

        // Force exit after timeout
        setTimeout(() => {
          this.logger.error('❌ Forced shutdown due to timeout');
          process.exit(1);
        }, config.server.shutdownTimeout);

      } catch (error) {
        this.logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      this.logger.error('❌ Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }
}

// Start the gateway
const gateway = new VitalPathGateway();
gateway.start().catch((error) => {
  console.error('❌ Failed to start VITAL Path Gateway:', error);
  process.exit(1);
});

export default VitalPathGateway;