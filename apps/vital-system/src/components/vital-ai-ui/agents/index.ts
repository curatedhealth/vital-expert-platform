/**
 * VITAL AI UI - Agent & Collaboration Components (Domain F)
 * 
 * Components for displaying agents, teams, and collaboration features.
 * Updated for 5-Level Agent OS Architecture.
 * 
 * Reference: AGENT_VIEW_PRD_v4.md, AGENT_OS_GOLD_STANDARD.md
 */

// Original components
export { VitalAgentCard, default as AgentCard } from './VitalAgentCard';
export { VitalTeamView, default as TeamView } from './VitalTeamView';

// NEW: 5-Level Agent OS Components
export {
  VitalLevelBadge,
  getLevelConfig,
  getLevelIcon,
  isConversationalLevel,
} from './VitalLevelBadge';
export type { AgentLevel } from './VitalLevelBadge';

export {
  VitalPersonalityBadge,
  getPersonalityConfig,
  getPersonalityIcon,
  getAllPersonalityTypes,
} from './VitalPersonalityBadge';
export type { PersonalitySlug } from './VitalPersonalityBadge';

export { VitalAgentCardEnhanced } from './VitalAgentCardEnhanced';

export {
  VitalAgentContextSelector,
  VitalAgentContextDisplay,
} from './VitalAgentContextSelector';
export type {
  ContextRegion,
  ContextDomain,
  ContextTherapeuticArea,
  ContextPhase,
  SelectedContext,
} from './VitalAgentContextSelector';

// NEW: Hooks for API integration
export {
  useAgentContext,
  useAgentSynergies,
} from './useAgentContext';
export type {
  PersonalityType,
  AllContextLookups,
  InstantiatedAgent,
  AgentSession,
} from './useAgentContext';
