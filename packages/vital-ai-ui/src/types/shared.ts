/**
 * VITAL AI UI - Shared Types
 * 
 * Central type definitions shared across all VITAL AI UI components.
 * These types align with backend definitions in:
 * - services/ai-engine/src/agents/l4_workers/l4_base.py (WorkerCategory)
 * - services/ai-engine/src/agents/l5_tools/l5_base.py (ToolCategory)
 * - services/ai-engine/src/services/agent_hierarchy_service.py (AgentLevel)
 * - services/ai-engine/src/fusion/retrievers/ (RetrieverType)
 * 
 * Phase 2 ↔ Phase 3 Alignment
 */

// ============================================================================
// 5-Level Agent Hierarchy Types
// Aligned with: agent_hierarchy_service.py AgentLevel
// ============================================================================

/**
 * Agent level in the 5-level hierarchy.
 * - L1: Master Orchestrator (strategic planning)
 * - L2: Domain Experts (specialized knowledge)
 * - L3: Task Specialists (execution)
 * - L4: Context Workers (data processing)
 * - L5: Tools (atomic operations)
 */
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/**
 * Numeric agent level (1-5).
 * Used for comparison and sorting.
 */
export type AgentLevelNumber = 1 | 2 | 3 | 4 | 5;

/**
 * Convert string level to number.
 */
export function agentLevelToNumber(level: AgentLevel): AgentLevelNumber {
  const map: Record<AgentLevel, AgentLevelNumber> = {
    L1: 1, L2: 2, L3: 3, L4: 4, L5: 5
  };
  return map[level];
}

/**
 * Convert number to string level.
 */
export function numberToAgentLevel(num: AgentLevelNumber): AgentLevel {
  const map: Record<AgentLevelNumber, AgentLevel> = {
    1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5'
  };
  return map[num];
}

// ============================================================================
// L4 Worker Category Types
// Aligned with: l4_base.py WorkerCategory enum
// ============================================================================

/**
 * L4 Worker categories.
 * Must match backend WorkerCategory enum values.
 */
export type WorkerCategory =
  | 'data_processing'
  | 'analysis'
  | 'clinical'
  | 'regulatory'
  | 'evidence_synthesis'
  | 'risk'
  | 'strategic'
  | 'heor'
  | 'bioinformatics'
  | 'digital_health'
  | 'rwe'
  | 'medical_affairs'
  | 'commercial'
  | 'decision_making'
  | 'financial'
  | 'design'
  | 'communication'
  | 'innovation'
  | 'agile'
  | 'operational_excellence'
  | 'design_thinking';

/**
 * Worker category display labels.
 */
export const WORKER_CATEGORY_LABELS: Record<WorkerCategory, string> = {
  data_processing: 'Data Processing',
  analysis: 'Analysis',
  clinical: 'Clinical',
  regulatory: 'Regulatory',
  evidence_synthesis: 'Evidence Synthesis',
  risk: 'Risk',
  strategic: 'Strategic',
  heor: 'HEOR',
  bioinformatics: 'Bioinformatics',
  digital_health: 'Digital Health',
  rwe: 'Real-World Evidence',
  medical_affairs: 'Medical Affairs',
  commercial: 'Commercial',
  decision_making: 'Decision Making',
  financial: 'Financial',
  design: 'Design',
  communication: 'Communication',
  innovation: 'Innovation',
  agile: 'Agile',
  operational_excellence: 'Operational Excellence',
  design_thinking: 'Design Thinking',
};

/**
 * Worker category colors for UI.
 */
export const WORKER_CATEGORY_COLORS: Record<WorkerCategory, string> = {
  data_processing: 'bg-blue-500',
  analysis: 'bg-purple-500',
  clinical: 'bg-red-500',
  regulatory: 'bg-amber-500',
  evidence_synthesis: 'bg-emerald-500',
  risk: 'bg-orange-500',
  strategic: 'bg-indigo-500',
  heor: 'bg-cyan-500',
  bioinformatics: 'bg-pink-500',
  digital_health: 'bg-teal-500',
  rwe: 'bg-lime-500',
  medical_affairs: 'bg-rose-500',
  commercial: 'bg-violet-500',
  decision_making: 'bg-fuchsia-500',
  financial: 'bg-green-500',
  design: 'bg-sky-500',
  communication: 'bg-yellow-500',
  innovation: 'bg-orange-400',
  agile: 'bg-blue-400',
  operational_excellence: 'bg-slate-500',
  design_thinking: 'bg-purple-400',
};

// ============================================================================
// L5 Tool Category Types
// Aligned with: l5_base.py ToolCategory enum
// ============================================================================

/**
 * L5 Tool categories.
 * Must match backend ToolCategory enum values.
 */
export type ToolCategory =
  | 'search'
  | 'database'
  | 'api'
  | 'calculation'
  | 'validation'
  | 'formatting'
  | 'file'
  | 'web'
  | 'ai'
  | 'healthcare'
  | 'regulatory'
  | 'clinical';

/**
 * Tool category display labels.
 */
export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  search: 'Search',
  database: 'Database',
  api: 'API',
  calculation: 'Calculation',
  validation: 'Validation',
  formatting: 'Formatting',
  file: 'File',
  web: 'Web',
  ai: 'AI',
  healthcare: 'Healthcare',
  regulatory: 'Regulatory',
  clinical: 'Clinical',
};

/**
 * Tool category colors for UI.
 */
export const TOOL_CATEGORY_COLORS: Record<ToolCategory, string> = {
  search: 'bg-blue-500',
  database: 'bg-green-500',
  api: 'bg-purple-500',
  calculation: 'bg-orange-500',
  validation: 'bg-yellow-500',
  formatting: 'bg-gray-500',
  file: 'bg-teal-500',
  web: 'bg-indigo-500',
  ai: 'bg-pink-500',
  healthcare: 'bg-red-500',
  regulatory: 'bg-amber-500',
  clinical: 'bg-rose-500',
};

// ============================================================================
// Fusion Intelligence Types
// Aligned with: fusion/retrievers/ (Vector, Graph, Relational)
// ============================================================================

/**
 * Retriever types for Fusion Intelligence.
 * - vector: Semantic similarity (pgvector/Pinecone)
 * - graph: Relationship paths (Neo4j)
 * - relational: Historical patterns (PostgreSQL)
 * - web: Real-time web search
 * - hybrid: Combined retrieval (RRF fusion)
 */
export type RetrieverType = 'vector' | 'graph' | 'relational' | 'web' | 'hybrid';

/**
 * Retriever display labels.
 */
export const RETRIEVER_TYPE_LABELS: Record<RetrieverType, string> = {
  vector: 'Vector (Semantic)',
  graph: 'Graph (Relationships)',
  relational: 'Relational (Historical)',
  web: 'Web (Real-time)',
  hybrid: 'Hybrid (RRF Fusion)',
};

/**
 * Retriever colors for UI.
 */
export const RETRIEVER_TYPE_COLORS: Record<RetrieverType, string> = {
  vector: 'bg-blue-500',
  graph: 'bg-purple-500',
  relational: 'bg-green-500',
  web: 'bg-orange-500',
  hybrid: 'bg-gradient-to-r from-blue-500 via-purple-500 to-green-500',
};

// ============================================================================
// VITAL Mode Types
// Aligned with: 2x2 Matrix (Manual/Auto × Interactive/Autonomous)
// ============================================================================

/**
 * VITAL Mode from 2x2 Matrix.
 * - mode1: Manual + Interactive (Expert Chat)
 * - mode2: Auto + Interactive (Smart Copilot)
 * - mode3: Manual + Autonomous (Mission Control)
 * - mode4: Auto + Autonomous (Background Mission)
 */
export type VitalMode = 'mode1' | 'mode2' | 'mode3' | 'mode4';

/**
 * Mode display labels.
 */
export const VITAL_MODE_LABELS: Record<VitalMode, string> = {
  mode1: 'Expert Chat',
  mode2: 'Smart Copilot',
  mode3: 'Mission Control',
  mode4: 'Background Mission',
};

/**
 * Mode descriptions.
 */
export const VITAL_MODE_DESCRIPTIONS: Record<VitalMode, string> = {
  mode1: 'Manual selection, interactive conversation',
  mode2: 'Auto selection, interactive conversation',
  mode3: 'Manual selection, autonomous execution',
  mode4: 'Auto selection, autonomous execution',
};

// ============================================================================
// Risk Level Types
// Used across HITL checkpoints, approvals, and safety gates
// ============================================================================

/**
 * Risk levels for HITL controls.
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Risk level colors.
 */
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

/**
 * Risk level labels.
 */
export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical',
};

// ============================================================================
// Agent Level Colors (for UI consistency)
// ============================================================================

/**
 * Agent level colors for badges and UI.
 */
export const AGENT_LEVEL_COLORS: Record<AgentLevel, string> = {
  L1: 'bg-purple-600',  // Master Orchestrator
  L2: 'bg-blue-600',    // Domain Experts
  L3: 'bg-cyan-500',    // Task Specialists
  L4: 'bg-green-500',   // Context Workers
  L5: 'bg-gray-500',    // Tools
};

/**
 * Agent level labels.
 */
export const AGENT_LEVEL_LABELS: Record<AgentLevel, string> = {
  L1: 'Master Orchestrator',
  L2: 'Domain Expert',
  L3: 'Task Specialist',
  L4: 'Context Worker',
  L5: 'Tool',
};
