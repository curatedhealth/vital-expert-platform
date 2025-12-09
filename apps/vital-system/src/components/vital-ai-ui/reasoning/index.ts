/**
 * VITAL AI UI - Reasoning & Evidence Components (Domain B)
 * 
 * Components for displaying agent reasoning, citations, and evidence.
 * 7 components total.
 */

export { VitalThinking, default as Thinking } from './VitalThinking';
export { VitalCitation, CitationList, default as Citation } from './VitalCitation';
export { VitalEvidencePanel, default as EvidencePanel } from './VitalEvidencePanel';
export { VitalConfidenceMeter, default as ConfidenceMeter } from './VitalConfidenceMeter';
export { VitalToolInvocation, VitalToolInvocationList, default as ToolInvocation } from './VitalToolInvocation';
export { VitalSourcePreview, VitalSourceTrigger } from './VitalSourcePreview';
export { VitalDelegationTrace } from './VitalDelegationTrace';

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
