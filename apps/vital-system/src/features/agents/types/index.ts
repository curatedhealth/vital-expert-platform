// Agents Types Module
// Export agent-related types

// Core agent types
export type {
  Agent,
  AgentWithRelationships,
  AgentFilters,
  AgentLevelNumber,
  AgentLevels,
  DomainExpertise,
} from './agent.types';

// Hierarchy & Subagent types
export type {
  RecommendedSubagent,
  ConfiguredSubagent,
  SubagentHierarchyConfig,
  L4WorkersConfig,
  L5ToolsConfig,
  ContextEngineerConfig,
  SpawningRelationship,
  RecommendSubagentsRequest,
  RecommendSubagentsResponse,
} from './agent.types';

// Constants
export { DEFAULT_HIERARCHY_CONFIG } from './agent.types';