/**
 * Chat Message Types
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  agentId?: string;
  confidence?: number;
  citations?: Citation[];
}

export interface Citation {
  id: string;
  title: string;
  authors?: string;
  year?: number;
  url?: string;
  relevance: number;
}

export interface MessageMetadata {
  processingTime?: number;
  model?: string;
  tokens?: number;
  cost?: number;
}
