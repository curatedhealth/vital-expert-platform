/**
 * Knowledge Designer Types - Brand Guidelines v6.0
 *
 * Type definitions for the Knowledge Designer page
 * Extracted from /designer/knowledge/page.tsx
 *
 * @since December 2025
 */

// Search Result Types
export interface MatchedEntity {
  entity_id: string;
  entity_type: string;
  entity_text: string;
  match_type: 'exact' | 'partial' | 'semantic';
  confidence: number;
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  content: string;
  metadata: Record<string, unknown>;
  scores: {
    vector?: number;
    keyword?: number;
    entity?: number;
    combined: number;
  };
  matched_entities?: MatchedEntity[];
  source_title?: string;
  domain?: string;
}

// Domain Types
export interface KnowledgeDomain {
  domain_id: string;
  domain_name: string;
  description?: string;
  tier: number;
  priority: number;
  document_count: number;
  is_active: boolean;
  function_name?: string;
  embedding_model?: string;
}

// Document Types
export interface KnowledgeDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'failed' | 'pending';
  domain: string | null;
  chunks: number;
}

// Stats Types
export interface KnowledgeStats {
  totalDomains: number;
  totalDocuments: number;
  totalChunks: number;
  recentUploads: number;
}

// External Evidence Types
export interface ClinicalTrialResult {
  id: string;
  nctId: string;
  title: string;
  status: string;
  phase: string;
  conditions: string[];
  interventions: string[];
  sponsor: string;
  startDate?: string;
  completionDate?: string;
  enrollmentCount?: number;
  studyType: string;
  url: string;
  sourceType: 'clinical-trial';
}

export interface FDAResult {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  approvalDate: string;
  indication: string;
  route: string[];
  substanceName: string;
  approvalType: string;
  url: string;
  sourceType: 'fda-approval';
}

export interface PubMedResult {
  id: string;
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  abstract: string | null;
  doi: string | null;
  url: string;
  sourceType: 'pubmed';
}

export interface GuidanceResult {
  note: string;
  searchUrl: string;
  instructions: string[];
  resources: { name: string; url: string; description: string }[];
  sourceType: 'ema-guidance' | 'who-guidance';
  whatIsEML?: {
    purpose: string;
    coreList: string;
    complementaryList: string;
  };
}

export interface ExternalSource {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status: 'connected' | 'available' | 'coming_soon';
  apiAvailable: boolean;
  searchExample: string;
}

// Search Strategy Type
export type SearchStrategy = 'hybrid' | 'vector' | 'keyword' | 'entity';

// Tab Type
export type KnowledgeDesignerTab =
  | 'overview'
  | 'domains'
  | 'upload'
  | 'query'
  | 'embeddings'
  | 'connections'
  | 'analytics'
  | 'entities'
  | 'citations'
  | 'graph';
