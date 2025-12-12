/**
 * Ask Expert - Service-Specific Components
 * 
 * These components are ONLY for the Ask Expert service and implement
 * the 4-Mode Execution Matrix specific UI.
 * 
 * For SHARED components, import from '@vital/ai-ui':
 *   import { 
 *     VitalMessage, VitalThinking, VitalFusionExplanation,  // Core AI UI
 *     VitalHITLControls, VitalPlanApprovalModal,            // HITL
 *     VitalAdvancedChatInput, VitalEnhancedMessageDisplay,  // Chat
 *     VitalExpertAgentCard, VitalToolExecutionCard,         // Agents
 *     VitalStatusIndicators, VitalProgressTracker,          // Workflow
 *     VitalIntelligentSidebar                               // Layout
 *   } from '@vital/ai-ui';
 * 
 * For Ask Expert SPECIFIC components (4-Mode selection), import from here:
 *   import { ModeSelector, WorkflowSelector } from '@/features/ask-expert/components';
 */

// ============================================================================
// Layout Components - ADAPTIVE WORKSPACE SHELL
// ============================================================================

export {
  VitalWorkspace,
  type VitalWorkspaceProps,
  type WorkspaceMode,
  type SidebarPosition,
} from './VitalWorkspace';

// ============================================================================
// Mode Selection (5 components) - ASK EXPERT SPECIFIC
// ============================================================================
// These implement the 4-Mode Execution Matrix UI specific to Ask Expert

export { default as ModeSelector } from './ModeSelector';
export { default as EnhancedModeSelector } from './EnhancedModeSelector';
export { default as SimplifiedModeSelector } from './SimplifiedModeSelector';
export { default as ModeSelectionModal } from './ModeSelectionModal';
export { default as WorkflowSelector } from './WorkflowSelector';

// ============================================================================
// Artifacts - ASK EXPERT SPECIFIC
// ============================================================================
// Inline artifact generation specific to Ask Expert workflow

export { default as InlineArtifactGenerator } from './InlineArtifactGenerator';
export { default as InlineDocumentGenerator } from './InlineDocumentGenerator';

// ============================================================================
// Artifact Renderers (Phase 4) - Wrappers around VITAL Components
// ============================================================================
// These wrap core VITAL components for artifact-specific rendering

export {
  MarkdownRenderer,
  CodeRenderer,
  ChartRenderer,
  TableRenderer,
  ARTIFACT_RENDERERS,
  getArtifactRenderer,
  detectArtifactType,
} from './artifacts/renderers';
export type {
  MarkdownRendererProps,
  CodeRendererProps,
  ChartRendererProps,
  ChartType,
  ChartDataPoint,
  TableRendererProps,
  TableColumn,
} from './artifacts/renderers';

// ============================================================================
// Autonomous Mode Components (Mode 3 & 4)
// ============================================================================
// Mission templates, execution, HITL checkpoints for autonomous operations

export {
  // Master Orchestrator
  AutonomousView,

  // Mission Selection & Configuration
  MissionTemplateSelector,
  MissionBriefing,

  // Mission Execution
  MissionExecutionView,
  MissionTimeline,
  StrategyPane,

  // Progressive Disclosure
  ProgressiveAccordion,
  createReasoningSection,
  createToolsSection,
  createSourcesSection,
  createArtifactsSection,
  createQualitySection,
  ReasoningChainViewer,

  // HITL Checkpoints
  VitalCheckpoint,

  // Mission Completion
  MissionCompleteView,

  // Constants
  CATEGORY_COLORS,
  DOMAIN_COLORS,
  FAMILY_COLORS,
  COMPLEXITY_BADGES,
  RUNNERS,
  DEFAULT_MISSION_TEMPLATES,
} from './autonomous';

export type {
  // Component Props
  AutonomousViewProps,
  MissionTemplateSelectorProps,
  MissionBriefingProps,
  MissionExecutionViewProps,
  MissionResult,
  MissionTimelineProps,
  TimelineStep,
  StrategyPaneProps,
  Strategy,
  StrategyStep,
  StrategyOutput,
  StrategyRisk,
  ProgressiveAccordionProps,
  AccordionSection,
  ReasoningChainViewerProps,
  ReasoningNode,
  ReasoningType,
  VitalCheckpointProps,
  CheckpointDecision,
  MissionCompleteViewProps,

  // Mission Types
  RunnerCategory,
  PharmaDomain,
  KnowledgeLayer,
  QualityMetric,
  MissionFamily,
  MissionComplexity,
  CheckpointType,
  MissionStatus,
  AgentLevel,
  Runner,
  RunnerInput,
  RunnerResult,
  RunnerOutput,
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
  MissionEvent,
  RunnerEvent,
  RunnerCard,
  MissionCard,
  RunnerFilters,
  MissionFilters,
} from './autonomous';

// ============================================================================
// Mission Template System (Phase 3 Enhancement) - December 11, 2025
// ============================================================================
// Rich template browsing, preview, and customization for mission selection

export {
  // Template Selection
  TemplateCard,
  TemplateGallery,

  // Template Details
  TemplatePreview,

  // Template Configuration
  TemplateCustomizer,

  // Re-exported types and constants from mission-runners
  FAMILY_COLORS as MISSION_FAMILY_COLORS,
  COMPLEXITY_BADGES as MISSION_COMPLEXITY_BADGES,
  DEFAULT_MISSION_TEMPLATES as MISSION_TEMPLATES,
  RUNNERS as MISSION_RUNNERS,
  CORE_COGNITIVE_RUNNERS,
  PHARMA_DOMAIN_RUNNERS,
} from './missions';

export type {
  TemplateCardData,
  TemplateCardProps,
  TemplateGalleryProps,
  TemplatePreviewData,
  TemplatePreviewProps,
  ExpectedInput,
  ExpectedOutput,
  TemplateCustomizerData,
  TemplateCustomizerProps,
  MissionCustomizations,
} from './missions';

// ============================================================================
// Artifact Enhancement System (Phase 3) - December 11, 2025
// ============================================================================
// Rich artifact preview, download, and version history

export {
  // Preview & Interaction
  ArtifactPreview,
  ArtifactDownload,

  // Version History
  ArtifactVersionHistory,
} from './artifacts';

export type {
  // Preview Types
  ArtifactPreviewProps,
  ArtifactData,
  ArtifactType,

  // Download Types
  ArtifactDownloadProps,
  ExportFormat,
  ExportOption,

  // Version History Types
  ArtifactVersionHistoryProps,
  ArtifactVersion,
  VersionAuthor,
  ChangeType,
  ContentDiff,
  DiffHunk,
  DiffLine,
} from './artifacts';

// ============================================================================
// Polish Features (Phase 3 Final) - December 11, 2025
// ============================================================================
// Keyboard shortcuts, onboarding tour, and mobile responsive utilities

export {
  // Keyboard Shortcuts
  KeyboardShortcutsProvider,
  useKeyboardShortcuts,
  ShortcutHint,
  KeyboardShortcutsHelp,

  // Onboarding Tour
  OnboardingTourProvider,
  useOnboardingTour,
  StartTourButton,
  TourTarget,

  // Mobile Responsive
  ResponsiveProvider,
  useResponsive,
  ShowOn,
  HideOn,
  MobileOnly,
  DesktopOnly,
  MobileDrawer,
  MobileBottomSheet,
  MobileMenuButton,
  SwipeAction,
  PullToRefresh,
  ResponsiveGrid,
} from './polish';

export type {
  // Keyboard Shortcut Types
  Shortcut,
  ShortcutCategory,
  KeyboardShortcutsContextValue,
  KeyboardShortcutsProviderProps,
  ShortcutHintProps,
  KeyboardShortcutsHelpProps,

  // Onboarding Tour Types
  TourStep,
  TourStepPosition,
  TourAction,
  OnboardingTourContextValue,
  OnboardingTourProviderProps,
  StartTourButtonProps,
  TourTargetProps,

  // Mobile Responsive Types
  Breakpoint,
  ResponsiveContextValue,
  ResponsiveProviderProps,
  ShowOnProps,
  MobileDrawerProps,
  MobileBottomSheetProps,
  MobileMenuButtonProps,
  SwipeActionProps,
  PullToRefreshProps,
  ResponsiveGridProps,
} from './polish';

// ============================================================================
// Legacy HITL Components (ARCHIVED - moved to shared or replaced)
// ============================================================================
// NOTE: Use VitalCheckpoint from ./autonomous for new HITL implementations
//
// ARCHIVED exports (removed December 12, 2025 - files no longer exist):
// - PlanApprovalModal → Use autonomous/VitalCheckpoint
// - UserPromptModal → Use autonomous/VitalCheckpoint
// - ProgressTracker → Use VitalProgressTimeline from vital-ai-ui
// - ToolExecutionCard → Use reasoning/VitalToolInvocation from vital-ai-ui
// - SubAgentApprovalCard → Use autonomous/VitalCheckpoint
// - FinalReviewPanel → Use autonomous/VitalArtifactPreview

// ============================================================================
// COMPONENT SUMMARY (Phase 4 Complete + Phase 3 Final)
// ============================================================================
//
// Ask Expert Specific:
// - Mode Selection (5): ModeSelector, EnhancedModeSelector, SimplifiedModeSelector, ModeSelectionModal, WorkflowSelector
// - Inline Artifacts (2): InlineArtifactGenerator, InlineDocumentGenerator
// - Artifact Renderers (4): MarkdownRenderer, CodeRenderer, ChartRenderer, TableRenderer
// - Artifact Enhancement (3): ArtifactPreview, ArtifactDownload, ArtifactVersionHistory [Dec 11, 2025]
// - Autonomous (14): AutonomousView, MissionTemplateSelector, MissionBriefing, MissionExecutionView,
//                    MissionTimeline, StrategyPane, ProgressiveAccordion, ReasoningChainViewer,
//                    VitalCheckpoint, MissionCompleteView, StageProgressCard, MetricsSummary,
//                    SubAgentActivityFeed [Dec 11, 2025]
// - Mission Templates (4): TemplateCard, TemplateGallery, TemplatePreview, TemplateCustomizer [Dec 11, 2025]
// - Polish Features (16): KeyboardShortcutsProvider, useKeyboardShortcuts, ShortcutHint,
//                         KeyboardShortcutsHelp, OnboardingTourProvider, useOnboardingTour,
//                         StartTourButton, TourTarget, ResponsiveProvider, useResponsive,
//                         MobileDrawer, MobileBottomSheet, MobileMenuButton, SwipeAction,
//                         PullToRefresh, ResponsiveGrid [Dec 11, 2025]
// - Legacy HITL (6): PlanApprovalModal, UserPromptModal, ProgressTracker, ToolExecutionCard,
//                    SubAgentApprovalCard, FinalReviewPanel
//
// TOTAL: 54 Ask Expert Specific Components
//
// Shared components in @vital/ai-ui:
// - Core AI UI: VitalMessage, VitalThinking, VitalFusionExplanation, VitalStreamText
// - HITL: VitalHITLControls, VitalHITLCheckpointModal
// - Chat: VitalAdvancedChatInput, VitalEnhancedMessageDisplay
// - Agents: VitalExpertAgentCard, VitalToolExecutionCard
// - Workflow: VitalStatusIndicators, VitalProgressTracker
// - Layout: VitalIntelligentSidebar
// - Data: VitalDataTable, VitalCodeBlock
