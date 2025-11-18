/**
 * WebSocket Real-time Collaboration Service
 * Handles real-time communication for multi-user chat sessions
 */

import { v4 as uuidv4 } from 'uuid';

import type {
  Message,
  Agent,
  CollaborationState,
  Artifact
} from '@/types/chat.types';

export type WebSocketEventType =
  | 'user_joined'
  | 'user_left'
  | 'message_sent'
  | 'message_received'
  | 'agent_response'
  | 'streaming_chunk'
  | 'typing_start'
  | 'typing_stop'
  | 'collaboration_update'
  | 'artifact_generated'
  | 'connection_status'
  | 'error';

export interface WebSocketEvent {
  type: WebSocketEventType;
  id: string;
  timestamp: Date;
  userId: string;
  conversationId: string;
  data: unknown;
}

export interface CollaborativeUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'typing' | 'idle';
  lastSeen: Date;
  cursor?: {
    messageId?: string;
    position?: number;
  };
}

export interface CollaborativeSession {
  id: string;
  conversationId: string;
  users: Map<string, CollaborativeUser>;
  activeAgents: Agent[];
  collaborationState: CollaborationState;
  isRecording: boolean;
  createdAt: Date;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private userId: string;
  private conversationId: string;
  private session: CollaborativeSession | null = null;

  private eventListeners: Map<WebSocketEventType, ((event: WebSocketEvent) => void)[]> = new Map();
  private messageQueue: WebSocketEvent[] = [];

  constructor(userId?: string) {
    this.userId = userId || uuidv4();
    this.conversationId = '';
  }

  static getInstance(userId?: string): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(userId);
    }
    return WebSocketService.instance;
  }

  // Connection Management
  async connect(conversationId: string, wsUrl?: string): Promise<void> {
    this.conversationId = conversationId;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      // console.error('Failed to connect to WebSocket:', error);
      this.emit('connection_status', { status: 'error', error });
    }
  }

  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'User disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.session = null;
    this.emit('connection_status', { status: 'disconnected' });
  }

  // Event Handling
  private handleOpen(): void {
    // this.isConnected = true;
    this.reconnectAttempts = 0;

    // Join conversation
    this.send('user_joined', {
      userId: this.userId,
      conversationId: this.conversationId,
      userInfo: {
        name: 'Healthcare Professional',
        avatar: null,
        status: 'online'
      }
    });

    // Start heartbeat
    this.startHeartbeat();

    // Process queued messages
    this.processMessageQueue();

    this.emit('connection_status', { status: 'connected' });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const wsEvent: WebSocketEvent = JSON.parse(event.data);
      this.handleWebSocketEvent(wsEvent);
    } catch (error) {
      // console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    // this.isConnected = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Attempt reconnection if not intentional
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(this.conversationId);
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }

    this.emit('connection_status', {
      status: 'disconnected',
      code: event.code,
      reason: event.reason
    });
  }

  private handleError(error: Event): void {
    // console.error('WebSocket error:', error);
    this.emit('error', { error });
  }

  private handleWebSocketEvent(event: WebSocketEvent): void {
    switch (event.type) {
      case 'user_joined':
        this.handleUserJoined(event);
        break;
      case 'user_left':
        this.handleUserLeft(event);
        break;
      case 'message_received':
        this.handleMessageReceived(event);
        break;
      case 'agent_response':
        this.handleAgentResponse(event);
        break;
      case 'streaming_chunk':
        this.handleStreamingChunk(event);
        break;
      case 'typing_start':
      case 'typing_stop':
        this.handleTypingEvent(event);
        break;
      case 'collaboration_update':
        this.handleCollaborationUpdate(event);
        break;
      case 'artifact_generated':
        this.handleArtifactGenerated(event);
        break;
      default:
        // console.warn('Unknown WebSocket event type:', event.type);
    }

    // Emit to registered listeners
    this.emit(event.type, event.data);
  }

  // Specific Event Handlers
  private handleUserJoined(event: WebSocketEvent): void {
    if (!this.session) {
      this.session = {
        id: event.conversationId,
        conversationId: event.conversationId,
        users: new Map(),
        activeAgents: [],
        collaborationState: {
          isActive: false,
          status: 'pending',
          activeAgents: [],
          responses: [],
          consensusLevel: 0,
          conflicts: []
        },
        isRecording: false,
        createdAt: new Date()
      };
    }

    const user: CollaborativeUser = {
      id: event.data.userId,
      name: event.data.userInfo.name,
      avatar: event.data.userInfo.avatar,
      status: 'online',
      lastSeen: new Date()
    };

    this.session.users.set(event.data.userId, user);
  }

  private handleUserLeft(event: WebSocketEvent): void {
    if (this.session && this.session.users.has(event.data.userId)) {
      this.session.users.delete(event.data.userId);
    }
  }

  private handleMessageReceived(event: WebSocketEvent): void {
    // Update typing status if user was typing
    if (this.session && this.session.users.has(event.userId)) {

      user.status = 'online';
      user.lastSeen = new Date();
    }
  }

  private handleAgentResponse(event: WebSocketEvent): void {
    if (this.session) {
      this.session.collaborationState = {
        ...this.session.collaborationState,
        ...event.data.collaborationState
      };
    }
  }

  private handleStreamingChunk(event: WebSocketEvent): void {
    // Real-time streaming updates handled by message components
  }

  private handleTypingEvent(event: WebSocketEvent): void {
    if (this.session && this.session.users.has(event.userId)) {

      user.status = event.type === 'typing_start' ? 'typing' : 'online';
      user.lastSeen = new Date();
    }
  }

  private handleCollaborationUpdate(event: WebSocketEvent): void {
    if (this.session) {
      this.session.collaborationState = event.data;
    }
  }

  private handleArtifactGenerated(event: WebSocketEvent): void {
    // Artifact generation updates handled by artifact manager
  }

  // Message Sending
  send(type: WebSocketEventType, data: unknown): void {
    const event: WebSocketEvent = {
      type,
      id: uuidv4(),
      timestamp: new Date(),
      userId: this.userId,
      conversationId: this.conversationId,
      data
    };

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      // Queue message for later
      this.messageQueue.push(event);
    }
  }

  // Collaboration Features
  sendMessage(message: Message): void {
    this.send('message_sent', { message });
  }

  startTyping(): void {
    this.send('typing_start', { timestamp: new Date() });
  }

  stopTyping(): void {
    this.send('typing_stop', { timestamp: new Date() });
  }

  updateCollaborationState(state: Partial<CollaborationState>): void {
    this.send('collaboration_update', state);
  }

  shareArtifact(artifact: Artifact): void {
    this.send('artifact_generated', { artifact });
  }

  // Utility Methods
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date()
        }));
      }
    }, 30000); // 30 seconds
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {

      if (event && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(event));
      }
    }
  }

  // Event Listener Management
  on(eventType: WebSocketEventType, callback: (event: unknown) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)?.push(callback);
  }

  off(eventType: WebSocketEventType, callback: (event: unknown) => void): void {
    if (this.eventListeners.has(eventType)) {

      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(eventType: WebSocketEventType, data: unknown): void {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType)?.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          // console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }

  // Getters
  get connectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.ws) return 'disconnected';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      default:
        return 'disconnected';
    }
  }

  get activeUsers(): CollaborativeUser[] {
    return this.session ? Array.from(this.session.users.values()) : [];
  }

  get currentSession(): CollaborativeSession | null {
    return this.session;
  }
}

export const __webSocketService = WebSocketService.getInstance();