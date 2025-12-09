/**
 * VITAL AI UI - Documents & Artifacts Components (Domain E)
 * 
 * Components for document preview, code display, file uploads,
 * and artifact management. 5 components total.
 */

export { 
  VitalArtifact, 
  VitalArtifactHeader, 
  VitalArtifactContent,
  default as Artifact 
} from './VitalArtifact';

export { 
  VitalCodeBlock, 
  VitalCodeBlockCopyButton,
  default as CodeBlock 
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
