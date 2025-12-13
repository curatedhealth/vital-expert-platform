/**
 * VITAL AI UI Component Library - App Re-exports
 * 
 * This file re-exports all components from the shared @vital/ai-ui package.
 * It also provides local UI component bindings for the package to use.
 * 
 * For new code, prefer importing directly from '@vital/ai-ui':
 *   import { VitalMessage, VitalThinking } from '@vital/ai-ui';
 * 
 * This file exists for backward compatibility and to provide the UI bindings.
 */

// Local re-exports (no external @vital/ai-ui dependency)
// Note: Using explicit exports to avoid TS2308 conflicts (duplicate exports)

// Conversation components
export {
  VitalStreamText,
  VitalMessage,
  VitalPromptInput,
  VitalModelSelector,
  VitalSuggestionChips,
  VitalQuickActions,
} from './conversation';
export type { CitationData } from './conversation';

// Reasoning components (AgentLevel type from here takes precedence)
export {
  VitalThinking,
  VitalCitation,
  CitationList,
  VitalEvidencePanel,
  VitalConfidenceMeter,
  VitalToolInvocation,
  VitalToolInvocationList,
  VitalSourcePreview,
  VitalSourceTrigger,
  VitalDelegationTrace,
} from './reasoning';
export type {
  SourceType,
  SourceMetadata,
  VitalSourcePreviewProps,
  DelegationStatus,
  AgentLevel,  // Primary source for AgentLevel
  DelegationNode,
  VitalDelegationTraceProps,
} from './reasoning';

// Workflow components
export {
  VitalCheckpointModal,
  VitalCostTracker,
  VitalProgressTimeline,
  VitalCircuitBreaker,
  VitalApprovalCard,
  VitalTimeoutWarning,
  VitalWorkflowProgress,
  VitalPreFlightCheck,
} from './workflow';

// Data components
export {
  VitalDataTable,
  VitalMetricCard,
} from './data';

// Document components
export {
  VitalArtifact,
  VitalCodeBlock,
  VitalDocumentPreview,
  VitalFileUpload,
  VitalDownloadCard,
} from './documents';

// Agent components (excluding AgentLevel which comes from reasoning)
export {
  VitalAgentCard,
  AgentCard,
  VitalTeamView,
  TeamView,
  VitalLevelBadge,
  getLevelConfig,
  getLevelIcon,
  isConversationalLevel,
  VitalPersonalityBadge,
  getPersonalityConfig,
  getPersonalityIcon,
  getAllPersonalityTypes,
  VitalAgentContextSelector,
  VitalAgentContextDisplay,
  useAgentContext,
  useAgentSynergies,
  VitalDelegationFlow,
} from './agents';
export type {
  PersonalitySlug,
  ContextRegion,
  ContextDomain,
  ContextTherapeuticArea,
  ContextPhase,
  SelectedContext,
  PersonalityType,
  AllContextLookups,
  InstantiatedAgent,
  AgentSession,
  DelegationStep,
} from './agents';

// Layout components
export {
  VitalSidebar,
  VitalSplitPanel,
  VitalContextPanel,
  VitalChatLayout,
  VitalDashboardLayout,
  VitalLoadingStates,
} from './layout';

// Fusion components
export {
  VitalFusionExplanation,
  VitalDecisionTrace,
  VitalRRFVisualization,
  VitalTeamRecommendation,
  VitalRetrieverResults,
} from './fusion';

// Hooks
export {
  useAskExpert,
  useExpertCompletion,
} from './hooks';
export type {
  AskExpertMode,
  AskExpertOptions,
  AgentInfo,
  FusionEvidence,
  ReasoningStep,
} from './hooks';

// Artifacts
export {
  VitalArtifactPanel,
  VitalArtifactCard,
} from './artifacts';

// Error handling
export {
  VitalStreamErrorBoundary,
  createStreamError,
} from './error';

// ============================================================================
// Convenience Aliases (Backward Compatibility) - SHORT NAMES
// ============================================================================

// Short aliases for common components
export { VitalStreamText as StreamText } from './conversation';
export { VitalMessage as Message } from './conversation';
export { VitalPromptInput as PromptInput } from './conversation';
export { VitalModelSelector as ModelSelector } from './conversation';
export { VitalSuggestionChips as SuggestionChips } from './conversation';
// Note: VitalQuickActions already exported above, alias not needed

export { VitalThinking as Thinking } from './reasoning';
export { VitalCitation as Citation } from './reasoning';
export { VitalEvidencePanel as EvidencePanel } from './reasoning';
export { VitalConfidenceMeter as ConfidenceMeter } from './reasoning';
export { VitalToolInvocation as ToolInvocation } from './reasoning';
export { VitalSourcePreview as SourcePreview } from './reasoning';
export { VitalDelegationTrace as DelegationTrace } from './reasoning';

export { VitalCheckpointModal as CheckpointModal } from './workflow';
export { VitalCostTracker as CostTracker } from './workflow';
export { VitalProgressTimeline as ProgressTimeline } from './workflow';
export { VitalCircuitBreaker as CircuitBreaker } from './workflow';
export { VitalApprovalCard as ApprovalCard } from './workflow';
export { VitalTimeoutWarning as TimeoutWarning } from './workflow';

export { VitalDataTable as DataTable } from './data';
export { VitalMetricCard as MetricCard } from './data';

export { VitalArtifact as Artifact } from './documents';
export { VitalCodeBlock as CodeBlock } from './documents';
export { VitalDocumentPreview as DocumentPreview } from './documents';
export { VitalFileUpload as FileUpload } from './documents';
export { VitalDownloadCard as DownloadCard } from './documents';

// Note: AgentCard, TeamView already exported above from ./agents

export { VitalSidebar as Sidebar } from './layout';
export { VitalSplitPanel as SplitPanel } from './layout';
export { VitalContextPanel as ContextPanel } from './layout';
export { VitalChatLayout as ChatLayout } from './layout';
export { VitalDashboardLayout as DashboardLayout } from './layout';

export { VitalFusionExplanation as FusionExplanation } from './fusion';
export { VitalDecisionTrace as DecisionTrace } from './fusion';
export { VitalRRFVisualization as RRFVisualization } from './fusion';
export { VitalTeamRecommendation as TeamRecommendation } from './fusion';
export { VitalRetrieverResults as RetrieverResults } from './fusion';

export { VitalTeamAssemblyView as TeamAssemblyView } from './mission/VitalTeamAssemblyView';

export { VitalArtifactPanel as ArtifactPanel } from './artifacts';
export { VitalArtifactCard as ArtifactCard } from './artifacts';

export { VitalStreamErrorBoundary as StreamErrorBoundary } from './error';
