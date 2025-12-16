/**
 * VITAL AI UI - Reasoning & Evidence Components (Domain B)
 *
 * Components for displaying agent reasoning, citations, and evidence.
 * 8 components total (including VitalSources with Chicago style citations).
 */

export { VitalThinking, default as Thinking } from './VitalThinking';
export { VitalCitation, CitationList, default as Citation } from './VitalCitation';
export { VitalEvidencePanel, default as EvidencePanel } from './VitalEvidencePanel';
export { VitalConfidenceMeter, default as ConfidenceMeter } from './VitalConfidenceMeter';
export { VitalToolInvocation, VitalToolInvocationList, default as ToolInvocation } from './VitalToolInvocation';
export { VitalSourcePreview, VitalSourceTrigger } from './VitalSourcePreview';
export { VitalDelegationTrace } from './VitalDelegationTrace';

// Sources components (Fusion Intelligence - Triple Retrieval + RRF + Chicago Style)
export {
  VitalSources,
  VitalSourcesTrigger,
  VitalSourcesContent,
  VitalSourcesRRFExplanation,
  VitalSource,
  // Aliases
  Sources,
  SourcesTrigger,
  SourcesContent,
  SourcesRRFExplanation,
  Source,
  // Utilities
  retrieverIcons as sourcesRetrieverIcons,
  retrieverColors as sourcesRetrieverColors,
  retrieverLabels as sourcesRetrieverLabels,
  categoryIcons as sourcesCategoryIcons,
  formatChicagoCitation,
} from './VitalSources';

// Re-export types
export type {
  SourceType,
  SourceMetadata,
  VitalSourcePreviewProps,
} from './VitalSourcePreview';

export type {
  DelegationStatus,
  AgentLevel,
  Agent,
  DelegationNode,
  VitalDelegationTraceProps,
} from './VitalDelegationTrace';

export type {
  // Fusion Intelligence types
  RetrieverType as SourcesRetrieverType,
  SourceCategory,
  FusionBreakdown,
  CitationStyle,
  // Component props
  VitalSourcesProps,
  VitalSourcesTriggerProps,
  VitalSourcesContentProps,
  VitalSourcesRRFExplanationProps,
  VitalSourceProps,
} from './VitalSources';
