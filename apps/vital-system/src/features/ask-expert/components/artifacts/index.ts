/**
 * VITAL Platform - Artifact Components Index
 *
 * Exports all components for artifact handling in the Ask Expert service.
 * These components provide preview, download, and version history
 * functionality for mission-generated artifacts.
 *
 * Phase 3 Implementation - December 11, 2025
 */

// =============================================================================
// ARTIFACT PREVIEW
// =============================================================================

export { ArtifactPreview } from './ArtifactPreview';
export type {
  ArtifactPreviewProps,
  ArtifactData,
  ArtifactType,
} from './ArtifactPreview';

// =============================================================================
// ARTIFACT DOWNLOAD
// =============================================================================

export { ArtifactDownload } from './ArtifactDownload';
export type {
  ArtifactDownloadProps,
  ExportFormat,
  ExportOption,
} from './ArtifactDownload';

// =============================================================================
// ARTIFACT VERSION HISTORY
// =============================================================================

export { ArtifactVersionHistory } from './ArtifactVersionHistory';
export type {
  ArtifactVersionHistoryProps,
  ArtifactVersion,
  VersionAuthor,
  ChangeType,
  ContentDiff,
  DiffHunk,
  DiffLine,
} from './ArtifactVersionHistory';
