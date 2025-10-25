/**
 * Conversation Types
 */

import { Message } from './message.types';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  agentId?: string;
  metadata?: ConversationMetadata;
}

export interface ConversationMetadata {
  category?: string;
  tags?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  avgResponseTime?: number;
  totalMessages?: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  lastMessage?: string;
  lastUpdated: Date;
}
