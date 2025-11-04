/**
 * WebSocket Manager for VITAL Path Gateway
 * Handles real-time communication between frontend and Python AI services
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import winston from 'winston';
import { PythonServiceProxy } from '../services/python-service-proxy';
import { RedisService } from '../services/redis-service';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  organizationId?: string;
  userRole?: string;
}

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  messageId: string;
}

interface AgentSession {
  socketId: string;
  agentId: string;
  userId: string;
  organizationId: string;
  startedAt: string;
  lastActivity: string;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private pythonProxy: PythonServiceProxy;
  private redisService: RedisService;
  private logger: winston.Logger;
  private activeSessions: Map<string, AgentSession> = new Map();
  private socketToSessions: Map<string, Set<string>> = new Map();

  constructor(
    io: SocketIOServer,
    pythonProxy: PythonServiceProxy,
    redisService: RedisService
  ) {
    this.io = io;
    this.pythonProxy = pythonProxy;
    this.redisService = redisService;

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'websocket-manager' }
    });
  }

  public initialize(): void {
    // Authentication middleware
    this.io.use(this.authenticationMiddleware.bind(this));

    // Connection handling
    this.io.on('connection', this.handleConnection.bind(this));

    // Setup periodic cleanup
    setInterval(() => this.cleanupInactiveSessions(), 300000); // 5 minutes

    this.logger.info('✅ WebSocket manager initialized');
  }

  private async authenticationMiddleware(socket: AuthenticatedSocket, next: (err?: Error) => void): Promise<void> {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.auth.jwtSecret) as any;

      // Add user information to socket
      socket.userId = decoded.sub || decoded.userId;
      socket.organizationId = decoded.organizationId;
      socket.userRole = decoded.role;

      this.logger.info('🔐 WebSocket authentication successful', {
        socketId: socket.id,
        userId: socket.userId,
        organizationId: socket.organizationId
      });

      next();
    } catch (error) {
      this.logger.error('❌ WebSocket authentication failed', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(new Error('Authentication failed'));
    }
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    this.logger.info('🔌 New WebSocket connection', {
      socketId: socket.id,
      userId: socket.userId,
      organizationId: socket.organizationId
    });

    // Initialize socket session tracking
    this.socketToSessions.set(socket.id, new Set());

    // Join user-specific room
    socket.join(`user:${socket.userId}`);
    socket.join(`org:${socket.organizationId}`);

    // Set up event handlers
    this.setupEventHandlers(socket);

    // Send welcome message
    socket.emit('connection:established', {
      socketId: socket.id,
      userId: socket.userId,
      timestamp: new Date().toISOString(),
      availableEvents: [
        'agent:start-session',
        'agent:query',
        'agent:end-session',
        'system:status',
        'monitoring:subscribe'
      ]
    });
  }

  private setupEventHandlers(socket: AuthenticatedSocket): void {
    // Agent session management
    socket.on('agent:start-session', (data) => this.handleStartAgentSession(socket, data));
    socket.on('agent:end-session', (data) => this.handleEndAgentSession(socket, data));
    socket.on('agent:query', (data) => this.handleAgentQuery(socket, data));

    // System monitoring
    socket.on('system:status', () => this.handleSystemStatus(socket));
    socket.on('monitoring:subscribe', (data) => this.handleMonitoringSubscribe(socket, data));
    socket.on('monitoring:unsubscribe', (data) => this.handleMonitoringUnsubscribe(socket, data));

    // Real-time RAG search
    socket.on('rag:search', (data) => this.handleRAGSearch(socket, data));

    // Document processing updates
    socket.on('documents:subscribe', () => this.handleDocumentSubscribe(socket));

    // Heartbeat
    socket.on('ping', () => socket.emit('pong', { timestamp: new Date().toISOString() }));

    // Disconnection handling
    socket.on('disconnect', (reason) => this.handleDisconnection(socket, reason));

    // Error handling
    socket.on('error', (error) => {
      this.logger.error('❌ WebSocket error', {
        socketId: socket.id,
        userId: socket.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    });
  }

  private async handleStartAgentSession(socket: AuthenticatedSocket, data: any): Promise<void> {
    try {
      const { agentId, agentType } = data;
      const sessionId = `session_${socket.id}_${agentId}_${Date.now()}`;

      const session: AgentSession = {
        socketId: socket.id,
        agentId,
        userId: socket.userId!,
        organizationId: socket.organizationId!,
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      // Store session
      this.activeSessions.set(sessionId, session);
      this.socketToSessions.get(socket.id)?.add(sessionId);

      // Join agent-specific room
      socket.join(`agent:${agentId}`);

      // Store session in Redis for persistence
      await this.redisService.setWithExpiry(
        `ws_session:${sessionId}`,
        JSON.stringify(session),
        3600 // 1 hour
      );

      this.logger.info('🤖 Agent session started', {
        sessionId,
        agentId,
        userId: socket.userId,
        socketId: socket.id
      });

      socket.emit('agent:session-started', {
        sessionId,
        agentId,
        status: 'active',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('❌ Failed to start agent session', error);
      socket.emit('agent:error', {
        error: 'Failed to start agent session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleAgentQuery(socket: AuthenticatedSocket, data: any): Promise<void> {
    try {
      const { sessionId, query, agentType, messageId } = data;

      // Validate session
      const session = this.activeSessions.get(sessionId);
      if (!session || session.socketId !== socket.id) {
        socket.emit('agent:error', {
          messageId,
          error: 'Invalid or expired session',
          sessionId
        });
        return;
      }

      // Update session activity
      session.lastActivity = new Date().toISOString();

      this.logger.info('💬 Processing agent query via WebSocket', {
        sessionId,
        agentId: session.agentId,
        queryLength: query.length,
        messageId
      });

      // Send acknowledgment
      socket.emit('agent:query-received', {
        messageId,
        sessionId,
        status: 'processing',
        timestamp: new Date().toISOString()
      });

      // Prepare request for Python service
      const request = {
        agent_id: session.agentId,
        agent_type: agentType,
        query,
        user_id: session.userId,
        organization_id: session.organizationId,
        session_id: sessionId,
        message_id: messageId,
        ...data.options // Additional options like similarity_threshold, etc.
      };

      // Proxy to Python service
      const response = await this.pythonProxy.queryAgent(request);

      // Update session with response metadata
      await this.redisService.setWithExpiry(
        `ws_session:${sessionId}`,
        JSON.stringify(session),
        3600
      );

      // Send response to client
      socket.emit('agent:query-response', {
        messageId,
        sessionId,
        response: response.response,
        confidence: response.confidence,
        citations: response.citations,
        medical_context: response.medical_context,
        processing_metadata: response.processing_metadata,
        timestamp: new Date().toISOString()
      });

      this.logger.info('✅ Agent query processed successfully', {
        sessionId,
        messageId,
        confidence: response.confidence
      });

    } catch (error) {
      this.logger.error('❌ Agent query processing failed', error);
      socket.emit('agent:error', {
        messageId: data.messageId,
        error: 'Query processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleRAGSearch(socket: AuthenticatedSocket, data: any): Promise<void> {
    try {
      const { query, filters, messageId } = data;

      this.logger.info('🔍 Processing RAG search via WebSocket', {
        userId: socket.userId,
        queryLength: query.length,
        messageId
      });

      // Send acknowledgment
      socket.emit('rag:search-received', {
        messageId,
        status: 'processing',
        timestamp: new Date().toISOString()
      });

      // Prepare request
      const request = {
        query,
        filters: {
          ...filters,
          organization_id: socket.organizationId
        },
        max_results: data.maxResults || 10,
        similarity_threshold: data.similarityThreshold || 0.7,
        include_metadata: true
      };

      // Proxy to Python service
      const response = await this.pythonProxy.searchRAG(request);

      // Send response
      socket.emit('rag:search-response', {
        messageId,
        results: response.results,
        total_results: response.total_results,
        context_summary: response.context_summary,
        processing_time_ms: response.processing_time_ms,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('❌ RAG search failed', error);
      socket.emit('rag:error', {
        messageId: data.messageId,
        error: 'RAG search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleSystemStatus(socket: AuthenticatedSocket): Promise<void> {
    try {
      // Get system metrics from Python service
      const metrics = await this.pythonProxy.getSystemMetrics();

      socket.emit('system:status-response', {
        ...metrics,
        gateway_status: 'healthy',
        active_sessions: this.activeSessions.size,
        connected_users: this.io.sockets.sockets.size,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('❌ System status request failed', error);
      socket.emit('system:error', {
        error: 'Failed to get system status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private handleMonitoringSubscribe(socket: AuthenticatedSocket, data: any): void {
    const { topics } = data;

    for (const topic of topics) {
      socket.join(`monitoring:${topic}`);
    }

    socket.emit('monitoring:subscribed', {
      topics,
      timestamp: new Date().toISOString()
    });

    this.logger.info('📊 Monitoring subscription added', {
      userId: socket.userId,
      topics
    });
  }

  private handleMonitoringUnsubscribe(socket: AuthenticatedSocket, data: any): void {
    const { topics } = data;

    for (const topic of topics) {
      socket.leave(`monitoring:${topic}`);
    }

    socket.emit('monitoring:unsubscribed', {
      topics,
      timestamp: new Date().toISOString()
    });
  }

  private handleDocumentSubscribe(socket: AuthenticatedSocket): void {
    socket.join(`documents:${socket.organizationId}`);
    socket.emit('documents:subscribed', {
      organizationId: socket.organizationId,
      timestamp: new Date().toISOString()
    });
  }

  private async handleEndAgentSession(socket: AuthenticatedSocket, data: any): Promise<void> {
    const { sessionId } = data;

    try {
      const session = this.activeSessions.get(sessionId);
      if (session && session.socketId === socket.id) {
        // Remove from active sessions
        this.activeSessions.delete(sessionId);
        this.socketToSessions.get(socket.id)?.delete(sessionId);

        // Remove from Redis
        await this.redisService.delete(`ws_session:${sessionId}`);

        // Leave agent room
        socket.leave(`agent:${session.agentId}`);

        this.logger.info('🔚 Agent session ended', {
          sessionId,
          agentId: session.agentId,
          duration: Date.now() - new Date(session.startedAt).getTime()
        });

        socket.emit('agent:session-ended', {
          sessionId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      this.logger.error('❌ Failed to end agent session', error);
    }
  }

  private async handleDisconnection(socket: AuthenticatedSocket, reason: string): Promise<void> {
    this.logger.info('🔌 WebSocket disconnection', {
      socketId: socket.id,
      userId: socket.userId,
      reason
    });

    try {
      // Clean up all sessions for this socket
      const sessionIds = this.socketToSessions.get(socket.id) || new Set();
      for (const sessionId of sessionIds) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
          this.activeSessions.delete(sessionId);
          await this.redisService.delete(`ws_session:${sessionId}`);
        }
      }

      // Remove socket tracking
      this.socketToSessions.delete(socket.id);

    } catch (error) {
      this.logger.error('❌ Error during disconnection cleanup', error);
    }
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const lastActivity = new Date(session.lastActivity).getTime();

      if (now - lastActivity > timeout) {
        this.logger.info('🧹 Cleaning up inactive session', { sessionId });
        this.activeSessions.delete(sessionId);

        // Also remove from socket tracking
        this.socketToSessions.get(session.socketId)?.delete(sessionId);
      }
    }
  }

  // Broadcast methods for external use
  public broadcastToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public broadcastToOrganization(organizationId: string, event: string, data: any): void {
    this.io.to(`org:${organizationId}`).emit(event, data);
  }

  public broadcastToAgent(agentId: string, event: string, data: any): void {
    this.io.to(`agent:${agentId}`).emit(event, data);
  }

  public broadcastMonitoring(topic: string, data: any): void {
    this.io.to(`monitoring:${topic}`).emit('monitoring:update', {
      topic,
      data,
      timestamp: new Date().toISOString()
    });
  }

  public getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  public getConnectedUsersCount(): number {
    return this.io.sockets.sockets.size;
  }

  public closeAllConnections(): void {
    this.io.close();
    this.logger.info('🔌 All WebSocket connections closed');
  }
}