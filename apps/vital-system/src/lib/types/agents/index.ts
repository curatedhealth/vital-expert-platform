/**
 * Unified Agent Types - Single Source of Truth
 * 
 * This is the canonical export for all Agent-related types.
 * Import from here: `import type { Agent } from '@/lib/types/agents'`
 * 
 * Migration Guide:
 * - Replace imports from `@/lib/shared/types/agent.types` → `@/lib/types/agents`
 * - Replace imports from `@/types/agent.types` → `@/lib/types/agents`
 * - Replace imports from `@/features/agents/types/agent.types` → `@/lib/types/agents`
 */

// Re-export canonical Agent type and related types
export type {
  Agent,
  ChatAgent,
  AgentCategory,
  AgentFilters,
  AgentPayload,
} from '../agent.types';

// Re-export adapter functions
export {
  agentToChatAgent,
  chatAgentToAgent,
  agentsToChatAgents,
  chatAgentsToAgents,
  isAgent,
  isChatAgent,
  normalizeAgent,
} from '../agent.types';

// Re-export enums and supporting types from shared types
export type {
  ValidationMetadata,
  PerformanceMetrics,
  RegulatoryContext,
  ConfidenceThresholds,
  RateLimits,
  LegalSpecialties,
  ValidationHistoryEntry,
  AgentBulkImport,
  ImportMetadata,
  AgentSearchResult,
  UserAgent,
} from '@/lib/shared/types/agent.types';

export {
  AgentStatus,
  ValidationStatus,
  DomainExpertise,
  DataClassification,
  RiskLevel,
  ClinicalValidationStatus,
  FDASaMDClass,
} from '@/lib/shared/types/agent.types';

/**
 * Unified Agent Search Result
 * Combines GraphRAG and database search results
 */
export interface UnifiedAgentSearchResult {
  agent: Agent;
  similarity?: number;
  score?: number;
  matchReason?: string[];
  metadata?: Record<string, any>;
  source: 'graphrag' | 'database' | 'fallback';
}

/**
 * Agent with relationships
 */
export interface AgentWithRelationships extends Agent {
  parent_agent?: Agent;
  compatible_agents?: Agent[];
  prerequisite_agents?: Agent[];
}

/**
 * Agent selection result (for Mode 2/3)
 */
export interface AgentSelectionResult {
  selectedAgent: Agent;
  confidence: number;
  reasoning: string;
  alternativeAgents: Array<{
    agent: Agent;
    score: number;
    reason: string;
  }>;
}

