/**
 * VITAL AI UI - Shared Types Index
 * 
 * Central export for all shared types used across components.
 * Import from '@vital/ai-ui/types' for type consistency.
 */

export {
  // Agent Level Types
  type AgentLevel,
  type AgentLevelNumber,
  agentLevelToNumber,
  numberToAgentLevel,
  AGENT_LEVEL_COLORS,
  AGENT_LEVEL_LABELS,
  
  // L4 Worker Types
  type WorkerCategory,
  WORKER_CATEGORY_LABELS,
  WORKER_CATEGORY_COLORS,
  
  // L5 Tool Types
  type ToolCategory,
  TOOL_CATEGORY_LABELS,
  TOOL_CATEGORY_COLORS,
  
  // Fusion Intelligence Types
  type RetrieverType,
  RETRIEVER_TYPE_LABELS,
  RETRIEVER_TYPE_COLORS,
  
  // VITAL Mode Types
  type VitalMode,
  VITAL_MODE_LABELS,
  VITAL_MODE_DESCRIPTIONS,
  
  // Risk Level Types
  type RiskLevel,
  RISK_LEVEL_COLORS,
  RISK_LEVEL_LABELS,
} from './shared';
