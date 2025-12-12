/**
 * VITAL AI UI - Reasoning & Evidence Components (Domain B)
 * 
 * Components for displaying agent reasoning, citations, and evidence.
 * 13 components total (including ChainOfThought with 7 sub-components, InlineCitation with 14 sub-components).
 */

export { VitalThinking, default as Thinking } from './VitalThinking';
export {
  VitalCitation,
  CitationList,
  Citation,
  // Utilities
  sourceIcons as citationSourceIcons,
  sourceLabels as citationSourceLabels,
  sourceColors as citationSourceColors,
  retrieverIcons as citationRetrieverIcons,
  retrieverColors as citationRetrieverColors,
  retrieverLabels as citationRetrieverLabels,
  default as CitationDefault,
} from './VitalCitation';
export { VitalEvidencePanel, default as EvidencePanel } from './VitalEvidencePanel';
export { VitalConfidenceMeter, default as ConfidenceMeter } from './VitalConfidenceMeter';
export { VitalToolInvocation, VitalToolInvocationList, default as ToolInvocation } from './VitalToolInvocation';
export { VitalSourcePreview, VitalSourceTrigger } from './VitalSourcePreview';
export { VitalDelegationTrace } from './VitalDelegationTrace';

// Inline Citation (compound component with 14 sub-components)
export {
  VitalInlineCitation,
  VitalInlineCitationText,
  VitalInlineCitationCard,
  VitalInlineCitationCardTrigger,
  VitalInlineCitationCardBody,
  VitalInlineCitationCarousel,
  VitalInlineCitationCarouselContent,
  VitalInlineCitationCarouselItem,
  VitalInlineCitationCarouselHeader,
  VitalInlineCitationCarouselIndex,
  VitalInlineCitationCarouselPrev,
  VitalInlineCitationCarouselNext,
  VitalInlineCitationSource,
  VitalInlineCitationQuote,
  // Aliases
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationSource,
  InlineCitationQuote,
} from './VitalInlineCitation';

// Reasoning components (Deepseek R1 style)
export {
  VitalReasoning,
  VitalReasoningTrigger,
  VitalReasoningContent,
  useReasoning,
  // Aliases
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from './VitalReasoning';

// Sources components (Fusion Intelligence - Triple Retrieval + RRF)
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
} from './VitalSources';

// Legacy source list (more complex, bibliography style)
export { VitalSourceList, default as SourceList } from './VitalSourceList';
export { VitalContextPill, VitalContextPillList, default as ContextPill } from './VitalContextPill';
export { VitalRedPenPanel, default as RedPenPanel } from './VitalRedPenPanel';

// Chain of Thought (L1-L5 Agent Hierarchy visualization)
export {
  VitalChainOfThought,
  VitalChainOfThoughtHeader,
  VitalChainOfThoughtStep,
  VitalChainOfThoughtSearchResults,
  VitalChainOfThoughtSearchResult,
  VitalChainOfThoughtContent,
  VitalChainOfThoughtImage,
  // Aliases
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtContent,
  ChainOfThoughtImage,
  // Utilities
  levelStyles as chainOfThoughtLevelStyles,
  levelIcons as chainOfThoughtLevelIcons,
  levelBadgeColors as chainOfThoughtLevelBadgeColors,
} from './VitalChainOfThought';

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
  ReasoningContextValue,
  VitalReasoningProps,
  VitalReasoningTriggerProps,
  VitalReasoningContentProps,
} from './VitalReasoning';

export type {
  // Fusion Intelligence types
  RetrieverType as SourcesRetrieverType,
  SourceCategory,
  FusionBreakdown,
  // Component props
  VitalSourcesProps,
  VitalSourcesTriggerProps,
  VitalSourcesContentProps,
  VitalSourcesRRFExplanationProps,
  VitalSourceProps,
} from './VitalSources';

export type {
  Source as SourceListItem,
  VitalSourceListProps,
} from './VitalSourceList';

export type {
  ContextItem,
  ContextType,
  VitalContextPillProps,
} from './VitalContextPill';

export type {
  HighlightedSection,
  SourceDocument,
  VitalRedPenPanelProps,
} from './VitalRedPenPanel';

export type {
  // L1-L5 Agent Hierarchy types
  AgentLevel as ChainOfThoughtAgentLevel,
  VitalMode as ChainOfThoughtVitalMode,
  StepStatus as ChainOfThoughtStepStatus,
  StepAgent,
  // Component props
  VitalChainOfThoughtProps,
  VitalChainOfThoughtHeaderProps,
  VitalChainOfThoughtStepProps,
  VitalChainOfThoughtSearchResultsProps,
  VitalChainOfThoughtSearchResultProps,
  VitalChainOfThoughtContentProps,
  VitalChainOfThoughtImageProps,
} from './VitalChainOfThought';

export type {
  VitalInlineCitationProps,
  VitalInlineCitationTextProps,
  VitalInlineCitationCardProps,
  VitalInlineCitationCardTriggerProps,
  VitalInlineCitationCardBodyProps,
  VitalInlineCitationCarouselProps,
  VitalInlineCitationCarouselContentProps,
  VitalInlineCitationCarouselItemProps,
  VitalInlineCitationCarouselHeaderProps,
  VitalInlineCitationCarouselIndexProps,
  VitalInlineCitationCarouselPrevProps,
  VitalInlineCitationCarouselNextProps,
  VitalInlineCitationSourceProps,
  VitalInlineCitationQuoteProps,
} from './VitalInlineCitation';

export type {
  // RRF Citation types
  RetrieverType as CitationRetrieverType,
  SourceType as CitationSourceType,
  CitationMetadata,
  Citation as CitationType,
  VitalCitationProps,
  CitationListProps,
} from './VitalCitation';
