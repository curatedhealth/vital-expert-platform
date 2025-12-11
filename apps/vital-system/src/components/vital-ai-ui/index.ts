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
export * from './conversation';
export * from './reasoning';
export * from './workflow';
export * from './data';
export * from './documents';
export * from './agents';
export * from './layout';
export * from './fusion';
export * from './hooks';
export * from './artifacts';
export * from './error';

// ============================================================================
// Convenience Aliases (Backward Compatibility)
// ============================================================================

// Conversation
export {
  VitalStreamText as StreamText,
  VitalMessage as Message,
  VitalPromptInput as PromptInput,
  VitalModelSelector as ModelSelector,
  VitalSuggestionChips as SuggestionChips,
  VitalQuickActions as QuickActions,
} from './conversation';

// Reasoning
export {
  VitalThinking as Thinking,
  VitalCitation as Citation,
  VitalEvidencePanel as EvidencePanel,
  VitalConfidenceMeter as ConfidenceMeter,
  VitalToolInvocation as ToolInvocation,
  VitalSourcePreview as SourcePreview,
  VitalDelegationTrace as DelegationTrace,
} from './reasoning';

// Workflow
export {
  VitalCheckpointModal as CheckpointModal,
  VitalCostTracker as CostTracker,
  VitalProgressTimeline as ProgressTimeline,
  VitalCircuitBreaker as CircuitBreaker,
  VitalApprovalCard as ApprovalCard,
  VitalTimeoutWarning as TimeoutWarning,
} from './workflow';

// Data
export {
  VitalDataTable as DataTable,
  VitalMetricCard as MetricCard,
} from './data';

// Documents
export {
  VitalArtifact as Artifact,
  VitalCodeBlock as CodeBlock,
  VitalDocumentPreview as DocumentPreview,
  VitalFileUpload as FileUpload,
  VitalDownloadCard as DownloadCard,
} from './documents';

// Agents
export {
  VitalAgentCard as AgentCard,
  VitalTeamView as TeamView,
} from './agents';

// Layout
export {
  VitalSidebar as Sidebar,
  VitalSplitPanel as SplitPanel,
  VitalContextPanel as ContextPanel,
  VitalChatLayout as ChatLayout,
  VitalDashboardLayout as DashboardLayout,
} from './layout';

// Fusion
export {
  VitalFusionExplanation as FusionExplanation,
  VitalDecisionTrace as DecisionTrace,
  VitalRRFVisualization as RRFVisualization,
  VitalTeamRecommendation as TeamRecommendation,
  VitalRetrieverResults as RetrieverResults,
} from './fusion';

// Mission
export {
  VitalTeamAssemblyView as TeamAssemblyView,
} from './mission/VitalTeamAssemblyView';

// Artifacts (Horizontal Capability)
export {
  VitalArtifactPanel as ArtifactPanel,
  VitalArtifactCard as ArtifactCard,
} from './artifacts';

// Error Handling
export {
  VitalStreamErrorBoundary as StreamErrorBoundary,
  createStreamError,
} from './error';
