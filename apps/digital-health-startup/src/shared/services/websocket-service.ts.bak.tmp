// WebSocket service for real-time communication
export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: number;
  id: string;
}

export interface WebSocketService {
  connect: (url: string) => Promise<void>;
  disconnect: () => void;
  send: (message: WebSocketMessage) => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback: (data: unknown) => void) => void;
  isConnected: () => boolean;
  startTyping: (userId: string, conversationId: string) => void;
  stopTyping: (userId: string, conversationId: string) => void;
  sendMessage: (message: unknown) => void;
  updateCollaborationState: (state: unknown) => void;
  shareArtifact: (artifact: unknown) => void;
}

class WebSocketServiceImpl implements WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private url: string | null = null;

  async connect(url: string): Promise<void> {
    this.url = url;
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
          // resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.emit(message.type, message.data);
          } catch (error) {
            // console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.ws.onclose = () => {
          // };
        
        this.ws.onerror = (error) => {
          // console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // console.warn('WebSocket is not connected');
    }
  }

  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: (data: unknown) => void): void {

    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: unknown): void {

    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  startTyping(userId: string, conversationId: string): void {
    this.send({
      type: 'typing_start',
      data: { userId, conversationId },
      timestamp: Date.now(),
      id: `typing-${Date.now()}`
    });
  }

  stopTyping(userId: string, conversationId: string): void {
    this.send({
      type: 'typing_stop',
      data: { userId, conversationId },
      timestamp: Date.now(),
      id: `typing-stop-${Date.now()}`
    });
  }

  sendMessage(message: unknown): void {
    this.send({
      type: 'message',
      data: message,
      timestamp: Date.now(),
      id: `msg-${Date.now()}`
    });
  }

  updateCollaborationState(state: unknown): void {
    this.send({
      type: 'collaboration_update',
      data: state,
      timestamp: Date.now(),
      id: `collab-${Date.now()}`
    });
  }

  shareArtifact(artifact: unknown): void {
    this.send({
      type: 'artifact_share',
      data: artifact,
      timestamp: Date.now(),
      id: `artifact-${Date.now()}`
    });
  }
}

export const __websocketService = new WebSocketServiceImpl();
export default websocketService;
