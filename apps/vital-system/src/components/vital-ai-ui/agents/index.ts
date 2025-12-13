/**
 * VITAL AI UI - Agent & Collaboration Components (Domain F)
 *
 * Components for displaying agents, teams, and collaboration features.
 * Updated for 5-Level Agent OS Architecture.
 *
 * Reference: AGENT_VIEW_PRD_v4.md, AGENT_OS_GOLD_STANDARD.md
 *
 * CONSOLIDATION (2025-12-14):
 * - VitalAgentCard → Use from @vital/ai-ui package
 * - VitalAgentCardEnhanced → ARCHIVED (use @vital/ai-ui variants)
 * - Unique components kept: VitalLevelBadge, VitalPersonalityBadge, useAgentContext
 */

// Re-export from @vital/ai-ui package for backwards compatibility
export { VitalAgentCard, VitalAgentCard as AgentCard, VitalTeamView, VitalTeamView as TeamView } from '@vital/ai-ui';

// 5-Level Agent OS Components (unique to this app)
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

// Hooks for API integration (unique to this app)
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

// Delegation timeline (placeholder for missions)
export { VitalDelegationFlow, type DelegationStep } from './VitalDelegationFlow';
