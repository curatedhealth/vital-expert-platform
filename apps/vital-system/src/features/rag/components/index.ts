/**
 * RAG Feature Components
 *
 * Export all RAG-related components for use across the application.
 */

// V2 modals using Vital Forms Library
export {
  RagEditModalV2,
  RagDeleteModal,
  RagBatchDeleteModal,
  DEFAULT_RAG_VALUES,
} from './RagModalsV2';

// Re-export types from schema
export type {
  Rag,
  RagType,
  EmbeddingModel,
  AccessLevel,
  LifecycleStatus,
  RagEmbeddingConfig,
  RagComplianceSettings,
  RagAgentAssignment,
  RagDocumentStats,
} from '@/lib/forms/schemas';

export {
  RAG_TYPE_OPTIONS,
  EMBEDDING_MODEL_OPTIONS,
  ACCESS_LEVEL_OPTIONS,
  LIFECYCLE_STATUS_OPTIONS,
} from '@/lib/forms/schemas';

// Re-export healthcare domain constants for convenience
export {
  THERAPEUTIC_AREAS,
  DISEASE_AREAS,
  KNOWLEDGE_DOMAINS,
  EMBEDDING_MODELS,
  ACCESS_LEVELS,
  LIFECYCLE_STATUS,
  DRUG_LIFECYCLE_PHASES,
  getTherapeuticAreaOptions,
  getDiseaseAreasByTherapeuticArea,
  getKnowledgeDomainOptions,
  getKnowledgeDomainCategories,
} from '@/lib/constants/healthcare-domains';
