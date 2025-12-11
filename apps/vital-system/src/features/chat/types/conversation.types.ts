/**
 * Conversation types for the chat feature
 * TODO: Implement full conversation types when chat feature is developed
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  messages: Message[];
  agentId?: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ConversationMemory {
  conversationId: string;
  summary?: string;
  keyPoints?: string[];
  entities?: string[];
}

export type MessageRole = Message['role'];
