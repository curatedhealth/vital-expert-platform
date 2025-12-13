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

// Re-export types from supabase-rag-service
export type {
  KnowledgeSource as RagKnowledgeBase,
  DocumentChunk as RagDocument,
  SearchResult,
} from '@/lib/rag/supabase-rag-service';

// Local type definitions for missing types
export interface AgentRagAssignment {
  agent_id: string;
  rag_id: string;
  priority: number;
  is_enabled: boolean;
  usage_context?: string;
  custom_prompt_instructions?: string;
  is_primary?: boolean;
}

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