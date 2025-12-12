/**
 * VITAL Platform - Autonomous Components Index
 *
 * Exports all components for the Autonomous View (Modes 3 & 4).
 * These components handle mission templates, briefings, execution,
 * progress tracking, and HITL checkpoints.
 *
 * Aligned with: services/ai-engine/docs/FRONTEND_INTEGRATION_REFERENCE.md
 *
 * Phase 3 Implementation - December 11, 2025
 */

// =============================================================================
// MASTER ORCHESTRATOR (from views/ - canonical location)
// =============================================================================

export { AutonomousView } from '../../views/AutonomousView';
export type { AutonomousViewProps } from '../../views/AutonomousView';

// =============================================================================
// MISSION SELECTION & CONFIGURATION
// =============================================================================

export { MissionTemplateSelector } from './MissionTemplateSelector';
export type { MissionTemplateSelectorProps } from './MissionTemplateSelector';

export { MissionBriefing } from './MissionBriefing';
export type { MissionBriefingProps } from './MissionBriefing';

// =============================================================================
// MISSION EXECUTION
// =============================================================================

export { MissionExecutionView } from './MissionExecutionView';
export type { MissionExecutionViewProps, MissionResult } from './MissionExecutionView';

export { MissionTimeline } from './MissionTimeline';
export type { MissionTimelineProps, TimelineStep } from './MissionTimeline';

export { StrategyPane } from './StrategyPane';
export type {
  StrategyPaneProps,
  Strategy,
  StrategyStep,
  StrategyOutput,
  StrategyRisk,
} from './StrategyPane';

// =============================================================================
// PROGRESSIVE DISCLOSURE
// =============================================================================

export {
  ProgressiveAccordion,
  createReasoningSection,
  createToolsSection,
  createSourcesSection,
  createArtifactsSection,
  createQualitySection,
} from './ProgressiveAccordion';
export type { ProgressiveAccordionProps, AccordionSection } from './ProgressiveAccordion';

export { ReasoningChainViewer } from './ReasoningChainViewer';
export type {
  ReasoningChainViewerProps,
  ReasoningNode,
  ReasoningType,
} from './ReasoningChainViewer';

// =============================================================================
// HITL CHECKPOINTS
// =============================================================================

export { VitalCheckpoint } from './VitalCheckpoint';
export type { VitalCheckpointProps, CheckpointDecision } from './VitalCheckpoint';

// =============================================================================
// PROGRESS VISUALIZATION (December 11, 2025)
// =============================================================================

export { StageProgressCard } from './StageProgressCard';
export type {
  StageProgressCardProps,
  StageStatus,
  SubTask,
} from './StageProgressCard';

export { MetricsSummary } from './MetricsSummary';
export type { MetricsSummaryProps } from './MetricsSummary';

export { SubAgentActivityFeed } from './SubAgentActivityFeed';
export type {
  SubAgentActivityFeedProps,
  ActivityEvent,
  ActivityType,
  AgentInfo,
} from './SubAgentActivityFeed';

// =============================================================================
// MISSION COMPLETION
// =============================================================================

export { MissionCompleteView } from './MissionCompleteView';
export type { MissionCompleteViewProps } from './MissionCompleteView';

// =============================================================================
// TYPES (Re-exported from mission-runners.ts)
// =============================================================================

export type {
  // Enums
  RunnerCategory,
  PharmaDomain,
  KnowledgeLayer,
  QualityMetric,
  MissionFamily,
  MissionComplexity,
  CheckpointType,
  MissionStatus,
  AgentLevel,

  // Runner Types
  Runner,
  RunnerInput,
  RunnerResult,
  RunnerOutput,

  // Mission Types
  MissionTemplate,
  MissionTask,
  Checkpoint,
  InputField,
  OutputField,
  ToolRequirement,
  Mode4Constraints,
  Source,
  Artifact,
  Mission,
  MissionConfig,

  // SSE Event Types
  MissionEvent,
  RunnerEvent,

  // Gallery Display Types
  RunnerCard,
  MissionCard,

  // Filter Types
  RunnerFilters,
  MissionFilters,
} from '../../types/mission-runners';

// =============================================================================
// CONSTANTS (Re-exported from mission-runners.ts)
// =============================================================================

export {
  CATEGORY_COLORS,
  DOMAIN_COLORS,
  FAMILY_COLORS,
  COMPLEXITY_BADGES,
  RUNNERS,
  DEFAULT_MISSION_TEMPLATES,
} from '../../types/mission-runners';
