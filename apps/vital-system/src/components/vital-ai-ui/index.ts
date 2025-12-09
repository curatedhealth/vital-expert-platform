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

// Re-export everything from shared package
export * from '@vital/ai-ui';

// Re-export hooks
export * from '@vital/ai-ui/hooks';

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
} from '@vital/ai-ui/conversation';

// Reasoning
export {
  VitalThinking as Thinking,
  VitalCitation as Citation,
  VitalEvidencePanel as EvidencePanel,
  VitalConfidenceMeter as ConfidenceMeter,
  VitalToolInvocation as ToolInvocation,
  VitalSourcePreview as SourcePreview,
  VitalDelegationTrace as DelegationTrace,
} from '@vital/ai-ui/reasoning';

// Workflow
export {
  VitalCheckpointModal as CheckpointModal,
  VitalCostTracker as CostTracker,
  VitalProgressTimeline as ProgressTimeline,
  VitalCircuitBreaker as CircuitBreaker,
  VitalApprovalCard as ApprovalCard,
  VitalTimeoutWarning as TimeoutWarning,
} from '@vital/ai-ui/workflow';

// Data
export {
  VitalDataTable as DataTable,
  VitalMetricCard as MetricCard,
} from '@vital/ai-ui/data';

// Documents
export {
  VitalArtifact as Artifact,
  VitalCodeBlock as CodeBlock,
  VitalDocumentPreview as DocumentPreview,
  VitalFileUpload as FileUpload,
  VitalDownloadCard as DownloadCard,
} from '@vital/ai-ui/documents';

// Agents
export {
  VitalAgentCard as AgentCard,
  VitalTeamView as TeamView,
} from '@vital/ai-ui/agents';

// Layout
export {
  VitalSidebar as Sidebar,
  VitalSplitPanel as SplitPanel,
  VitalContextPanel as ContextPanel,
  VitalChatLayout as ChatLayout,
  VitalDashboardLayout as DashboardLayout,
} from '@vital/ai-ui/layout';

// Fusion
export {
  VitalFusionExplanation as FusionExplanation,
  VitalDecisionTrace as DecisionTrace,
  VitalRRFVisualization as RRFVisualization,
  VitalTeamRecommendation as TeamRecommendation,
  VitalRetrieverResults as RetrieverResults,
} from '@vital/ai-ui/fusion';
