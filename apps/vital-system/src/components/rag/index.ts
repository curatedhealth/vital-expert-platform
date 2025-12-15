/**
 * RAG Components Index
 * Export all RAG-related components for easy importing
 */

export { RagManagement } from './RagManagement';
export { AgentRagAssignments } from './AgentRagAssignments';
export { RagKnowledgeBaseSelector } from './RagKnowledgeBaseSelector';
export { CreateRagModal } from './CreateRagModal';
export { RagContextModal } from './RagContextModal';
export { RagAnalytics } from './RagAnalytics';

// Export unified RAG component types
export type {
  RagKnowledgeBase,
  AgentRagAssignment,
} from './types';

// Re-export database types (for when we need the actual database types)
export type {
  KnowledgeSource,
  DocumentChunk as RagDocument,
  SearchResult,
} from '@/lib/rag/supabase-rag-service';

export interface RagUsageAnalytics {
  rag_id: string;
  total_queries: number;
  avg_relevance_score: number;
  last_used_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface RagEnhancedMessage extends ChatMessage {
  sources?: Array<{ title: string; content: string; relevance: number }>;
}

export interface AgentChatContext {
  agent_id: string;
  session_id: string;
  messages: ChatMessage[];
}