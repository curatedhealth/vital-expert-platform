/**
 * Domain M: Mission & Team Components
 *
 * Components for mission discovery, template selection, team assembly,
 * execution monitoring, and results display.
 * Used for Mode 3/4 mission control interfaces.
 *
 * Components (8):
 * - VitalMissionTemplateSelector: Visual browser for JTBD missions
 * - VitalTemplateRecommendation: AI-powered template suggestion
 * - VitalTeamAssemblyView: Agent team selection visualization
 * - VitalGenericTemplateOption: Custom mission creator
 * - VitalMissionGoalInput: Research goal input for Mode 3/4
 * - VitalMissionBriefing: Pre-flight mission configuration
 * - VitalMissionExecution: Live streaming execution display
 * - VitalMissionComplete: Mission results and artifacts display
 */

// Original components
export { VitalMissionTemplateSelector, default as MissionTemplateSelector } from './VitalMissionTemplateSelector';
export { VitalTemplateRecommendation, default as TemplateRecommendation } from './VitalTemplateRecommendation';
export { VitalTeamAssemblyView, default as TeamAssemblyView } from './VitalTeamAssemblyView';
export { VitalGenericTemplateOption, default as GenericTemplateOption } from './VitalGenericTemplateOption';

// New mission flow components (Phase 3 - December 2025)
export { VitalMissionGoalInput, default as MissionGoalInput } from './VitalMissionGoalInput';
export { VitalMissionBriefing, default as MissionBriefing } from './VitalMissionBriefing';
export { VitalMissionExecution, default as MissionExecution } from './VitalMissionExecution';
export { VitalMissionComplete, default as MissionComplete } from './VitalMissionComplete';

// Re-export types from original components
export type {
  MissionTemplate,
  MissionCategory,
  MissionComplexity,
  VitalMissionTemplateSelectorProps,
} from './VitalMissionTemplateSelector';

export type {
  TemplateRecommendation as TemplateRecommendationType,
  RecommendationReason,
  VitalTemplateRecommendationProps,
} from './VitalTemplateRecommendation';

export type {
  AgentCandidate,
  AssemblyPhase,
  VitalTeamAssemblyViewProps,
} from './VitalTeamAssemblyView';

export type {
  CustomMissionConfig,
  MissionMode,
  VitalGenericTemplateOptionProps,
} from './VitalGenericTemplateOption';

// Re-export types from new components
export type {
  MissionMode as GoalInputMissionMode,
  Industry,
  ExamplePrompt,
  VitalMissionGoalInputProps,
} from './VitalMissionGoalInput';

export type {
  MissionMode as BriefingMissionMode,
  AutonomyBand,
  MissionInputField,
  MissionCheckpoint,
  BriefingTemplate,
  BriefingExpert,
  MissionBriefingConfig,
  VitalMissionBriefingProps,
} from './VitalMissionBriefing';

export type {
  MissionStatus,
  EventType,
  MissionEvent,
  HITLCheckpoint,
  MissionArtifact as ExecutionArtifact,
  MissionMetrics,
  VitalMissionExecutionProps,
} from './VitalMissionExecution';

export type {
  MissionOutcome,
  ArtifactType,
  MissionResult,
  MissionArtifact,
  ExecutionMetrics as CompleteExecutionMetrics,
  RelatedMission,
  VitalMissionCompleteProps,
} from './VitalMissionComplete';
