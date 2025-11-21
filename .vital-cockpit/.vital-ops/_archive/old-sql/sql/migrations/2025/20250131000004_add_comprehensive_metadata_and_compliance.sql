-- ============================================================================
-- Add Comprehensive Metadata and Compliance Fields
-- ============================================================================
-- Adds all metadata fields from smart extraction and compliance tracking
-- Includes copyright checking and data sanitization status
-- ============================================================================

-- Add comprehensive metadata columns to knowledge_documents
-- ============================================================================

-- Source & Publication Metadata
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS clean_file_name TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS source_name TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS source_url TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS publication_date DATE;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS author TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS authors TEXT[];

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS organization TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS publisher TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS doi TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS isbn TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS journal TEXT;

-- Document Classification
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS document_type TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS category TEXT;

-- Healthcare/Pharma Specific
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS regulatory_body TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS therapeutic_area TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS product_name TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS indication TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS development_phase TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS geographic_scope TEXT;

-- Content & Quality
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS summary TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS abstract TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS keywords TEXT[];

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS content_preview TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,2);

-- Technical Metadata
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS page_count INTEGER;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS word_count INTEGER;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS embedding_model TEXT DEFAULT 'text-embedding-3-large';

-- Copyright & Compliance
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS copyright_status TEXT DEFAULT 'unknown'; -- 'unknown', 'checked', 'cleared', 'risk', 'violation'

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS copyright_risk_level TEXT; -- 'none', 'low', 'medium', 'high', 'critical'

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS copyright_notice TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS copyright_checked_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS copyright_checked_by TEXT; -- User ID

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS copyright_requires_approval BOOLEAN DEFAULT false;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS copyright_issues JSONB DEFAULT '[]'; -- Array of copyright issues

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS attribution_required BOOLEAN DEFAULT false;

-- Data Sanitization
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS sanitization_status TEXT DEFAULT 'pending'; -- 'pending', 'sanitized', 'failed', 'skipped'

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS sanitization_risk_level TEXT; -- 'none', 'low', 'medium', 'high', 'critical'

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS sanitization_checked_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS sanitization_checked_by TEXT; -- User ID

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS sanitization_needs_review BOOLEAN DEFAULT false;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS pii_detected JSONB DEFAULT '[]'; -- Array of PII detection results

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS removed_content_summary JSONB DEFAULT '[]'; -- Summary of removed content

-- Extraction Metadata
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS extraction_confidence DECIMAL(3,2);

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS extracted_metadata JSONB DEFAULT '{}'; -- Full extracted metadata object

-- Compliance & Validation
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'pending'; -- 'pending', 'validated', 'failed', 'warned'

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS evidence_level TEXT; -- 'A', 'B', 'C', 'D' for clinical evidence

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS review_date DATE;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS reviewer TEXT; -- User ID

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- Access & Audit
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0;

-- Version Control
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS is_latest BOOLEAN DEFAULT true;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS parent_version_id UUID REFERENCES public.knowledge_documents(id);

-- Add indexes for new metadata fields
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_source_name 
  ON public.knowledge_documents(source_name) WHERE source_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_document_type 
  ON public.knowledge_documents(document_type) WHERE document_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_language 
  ON public.knowledge_documents(language) WHERE language IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_regulatory_body 
  ON public.knowledge_documents(regulatory_body) WHERE regulatory_body IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_therapeutic_area 
  ON public.knowledge_documents(therapeutic_area) WHERE therapeutic_area IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_publication_date 
  ON public.knowledge_documents(publication_date) WHERE publication_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_copyright_status 
  ON public.knowledge_documents(copyright_status);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_copyright_risk 
  ON public.knowledge_documents(copyright_risk_level) WHERE copyright_risk_level IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_sanitization_status 
  ON public.knowledge_documents(sanitization_status);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_sanitization_risk 
  ON public.knowledge_documents(sanitization_risk_level) WHERE sanitization_risk_level IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_validation_status 
  ON public.knowledge_documents(validation_status);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_keywords 
  ON public.knowledge_documents USING GIN(keywords) WHERE keywords IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_authors 
  ON public.knowledge_documents USING GIN(authors) WHERE authors IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_extracted_metadata 
  ON public.knowledge_documents USING GIN(extracted_metadata);

-- Add similar fields to document_chunks for inheritance
-- ============================================================================

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS copyright_status TEXT;

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS sanitization_status TEXT;

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS pii_detected JSONB DEFAULT '[]';

-- Verification queries
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Comprehensive metadata and compliance fields added';
  RAISE NOTICE 'New columns added:';
  RAISE NOTICE '  - Source: source_name, source_url, publication_date, author, organization, doi, isbn, journal';
  RAISE NOTICE '  - Classification: document_type, language, category';
  RAISE NOTICE '  - Healthcare: regulatory_body, therapeutic_area, product_name, indication, development_phase';
  RAISE NOTICE '  - Content: summary, abstract, keywords, content_preview, quality_score';
  RAISE NOTICE '  - Technical: page_count, word_count, embedding_model';
  RAISE NOTICE '  - Copyright: copyright_status, copyright_risk_level, copyright_notice, copyright_requires_approval';
  RAISE NOTICE '  - Sanitization: sanitization_status, sanitization_risk_level, sanitization_needs_review, pii_detected';
  RAISE NOTICE '  - Compliance: validation_status, evidence_level, review_date';
  RAISE NOTICE '  - Audit: last_accessed_at, access_count';
  RAISE NOTICE '  - Version: version, is_latest, parent_version_id';
END $$;

