/**
 * Domain L: Advanced Interaction Components
 * 
 * Components for collaboration, experimentation, and data transparency.
 * Used for team collaboration and advanced analysis workflows.
 * 
 * Components (4):
 * - VitalThreadBranch: Conversation forking for hypothesis testing
 * - VitalDiffView: Side-by-side comparison of content versions
 * - VitalAnnotationLayer: Google Docs-style commenting
 * - VitalDataLens: X-Ray vision for data lineage
 */

export { VitalThreadBranch, default as ThreadBranch } from './VitalThreadBranch';
export { VitalDiffView, default as DiffView } from './VitalDiffView';
export { VitalAnnotationLayer, default as AnnotationLayer } from './VitalAnnotationLayer';
export { VitalDataLens, default as DataLens } from './VitalDataLens';

// Re-export types
export type {
  ThreadBranch as ThreadBranchType,
  ThreadMessage,
  VitalThreadBranchProps,
} from './VitalThreadBranch';

export type {
  DiffViewMode,
  DiffLine,
  DiffHunk,
  ContentType,
  VitalDiffViewProps,
} from './VitalDiffView';

export type {
  Annotation,
  AnnotationReply,
  AnnotationUser,
  AnnotationStatus,
  VitalAnnotationLayerProps,
} from './VitalAnnotationLayer';

export type {
  DataLineage,
  DataSource,
  VitalDataLensProps,
} from './VitalDataLens';
