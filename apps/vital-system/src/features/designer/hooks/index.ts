/**
 * Designer Feature Hooks
 *
 * Reusable hooks for Designer pages (Knowledge Builder, Agent Designer, etc.)
 *
 * @since December 2025
 */

// Knowledge Designer hooks
export { useKnowledgeDesigner } from './useKnowledgeDesigner';
export { useKnowledgeQuery } from './useKnowledgeQuery';
export { useExternalEvidence } from './useExternalEvidence';

// Types re-export
export type {
  KnowledgeDomain,
  KnowledgeDocument,
  KnowledgeStats,
  SearchResult,
  MatchedEntity,
  SearchStrategy,
  KnowledgeDesignerTab,
  ClinicalTrialResult,
  FDAResult,
  PubMedResult,
  GuidanceResult,
  ExternalSource,
} from '../types/knowledge-designer.types';
