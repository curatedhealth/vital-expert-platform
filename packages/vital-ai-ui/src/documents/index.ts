/**
 * VITAL AI UI - Documents & Artifacts Components (Domain E)
 * 
 * Components for document preview, code display, file uploads,
 * and artifact management. 8 components total.
 */

// Artifact compound component (7 sub-components)
export { 
  VitalArtifact, 
  VitalArtifactHeader, 
  VitalArtifactTitle,
  VitalArtifactDescription,
  VitalArtifactActions,
  VitalArtifactAction,
  VitalArtifactClose,
  VitalArtifactContent,
  // Aliases
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactActions,
  ArtifactAction,
  ArtifactClose,
  ArtifactContent,
} from './VitalArtifact';

// CodeBlock compound component (2 sub-components + utility)
export { 
  VitalCodeBlock, 
  VitalCodeBlockCopyButton,
  highlightCode,
  useCodeBlockContext,
  // Aliases
  CodeBlock,
  CodeBlockCopyButton,
} from './VitalCodeBlock';

export { 
  VitalDocumentPreview, 
  VitalDocumentList,
  default as DocumentPreview 
} from './VitalDocumentPreview';

export { 
  VitalFileUpload, 
  default as FileUpload 
} from './VitalFileUpload';

export { 
  VitalDownloadCard, 
  default as DownloadCard 
} from './VitalDownloadCard';

// WebPreview compound component (6 sub-components)
export {
  VitalWebPreview,
  VitalWebPreviewNavigation,
  VitalWebPreviewNavigationButton,
  VitalWebPreviewUrl,
  VitalWebPreviewBody,
  VitalWebPreviewConsole,
  useWebPreview,
  // Aliases
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
} from './VitalWebPreview';
export { VitalDocumentation, default as Documentation } from './VitalDocumentation';

// Image components
export {
  VitalImage,
  VitalImageWithCaption,
  VitalImageGallery,
  Image,
  ImageWithCaption,
  ImageGallery,
} from './VitalImage';

// Re-export types
export type {
  WebPreviewContextValue,
  VitalWebPreviewProps,
  VitalWebPreviewNavigationProps,
  VitalWebPreviewNavigationButtonProps,
  VitalWebPreviewUrlProps,
  VitalWebPreviewBodyProps,
  VitalWebPreviewConsoleProps,
  ConsoleLogEntry,
} from './VitalWebPreview';

export type {
  DocumentSection,
  DocumentMetadata,
  VitalDocumentationProps,
} from './VitalDocumentation';

export type {
  Experimental_GeneratedImage,
  VitalImageProps,
  VitalImageWithCaptionProps,
  VitalImageGalleryProps,
} from './VitalImage';

export type {
  VitalArtifactProps,
  VitalArtifactHeaderProps,
  VitalArtifactTitleProps,
  VitalArtifactDescriptionProps,
  VitalArtifactActionsProps,
  VitalArtifactActionProps,
  VitalArtifactCloseProps,
  VitalArtifactContentProps,
} from './VitalArtifact';

export type {
  VitalCodeBlockProps,
  VitalCodeBlockCopyButtonProps,
} from './VitalCodeBlock';
