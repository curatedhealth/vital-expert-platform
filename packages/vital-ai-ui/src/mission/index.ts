/**
 * Domain M: Mission & Team Components
 * 
 * Components for mission discovery, template selection, and team assembly.
 * Used for Mode 3/4 mission control interfaces.
 * 
 * Components (4):
 * - VitalMissionTemplateSelector: Visual browser for JTBD missions
 * - VitalTemplateRecommendation: AI-powered template suggestion
 * - VitalTeamAssemblyView: Agent team selection visualization
 * - VitalGenericTemplateOption: Custom mission creator
 */

export { VitalMissionTemplateSelector, default as MissionTemplateSelector } from './VitalMissionTemplateSelector';
export { VitalTemplateRecommendation, default as TemplateRecommendation } from './VitalTemplateRecommendation';
export { VitalTeamAssemblyView, default as TeamAssemblyView } from './VitalTeamAssemblyView';
export { VitalGenericTemplateOption, default as GenericTemplateOption } from './VitalGenericTemplateOption';

// Re-export types
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
