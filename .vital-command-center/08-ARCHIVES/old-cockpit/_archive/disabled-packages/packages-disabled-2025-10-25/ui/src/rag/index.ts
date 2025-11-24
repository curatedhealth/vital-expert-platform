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

// Re-export types for convenience
export type {
  RagKnowledgeBase,
  AgentRagAssignment,
  RagDocument,
  RagUsageAnalytics
} from '@/shared/services/rag/RagService';

export type {
  ChatMessage,
  RagEnhancedMessage,
  AgentChatContext
} from '@/shared/services/chat/ChatRagIntegration';