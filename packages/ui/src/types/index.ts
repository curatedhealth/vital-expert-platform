/**
 * Type Exports - @vital/ui
 *
 * Canonical type definitions for the VITAL platform.
 */

// Agent Types (canonical)
export type {
  // Enums / Union types
  AgentStatus,
  ValidationStatus,
  DomainExpertise,
  DataClassification,
  RiskLevel,
  AgentLevelNumber,
  AgentLevelCode,
  AgentLevelName,
  PersonaArchetypeCode,
  CommunicationStyleCode,
  ResponseFormat,
  // Core interfaces
  Agent,
  AgentLevel,
  PersonaArchetype,
  CommunicationStyle,
  // Junction table types
  CapabilityEntity,
  SkillEntity,
  ResponsibilityEntity,
  ToolEntity,
  EnrichedCapability,
  EnrichedSkill,
  AgentResponsibility,
  AgentPromptStarter,
  AgentToolAssignment,
  EnrichedKnowledgeDomain,
  // UI types
  AgentCardData,
  AgentMetrics,
  AgentFilters,
  AgentSort,
  // API types
  AgentResponse,
  AgentListResponse,
  // Utility types
  AgentCreateInput,
  AgentUpdateInput,
} from './agent.types';

// Constants
export {
  DOMAIN_COLORS,
  AGENT_LEVEL_LABELS,
  TIER_LABELS,
  STATUS_COLORS,
} from './agent.types';

// Mission Types
export type {
  Mission,
  MissionArtifact,
  MissionCheckpoint,
  MissionStatus,
} from './mission.types';
