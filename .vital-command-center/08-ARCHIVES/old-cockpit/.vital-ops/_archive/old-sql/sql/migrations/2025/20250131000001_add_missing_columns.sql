-- ============================================================================
-- Add Missing Columns to knowledge_documents and document_chunks
-- ============================================================================
-- Run this AFTER Step 1 minimal migration to ensure all columns exist
-- ============================================================================

-- Step 1: Add columns to knowledge_documents (if not exists)
-- ============================================================================

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS domain_id TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS enterprise_id TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS owner_user_id TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS access_policy access_policy_level DEFAULT 'public';

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS rag_priority_weight DECIMAL(3,2) DEFAULT 0.9;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS pii_sensitivity exposure_level DEFAULT 'Low';

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS regulatory_exposure exposure_level DEFAULT 'Medium';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_domain_id 
  ON public.knowledge_documents(domain_id) WHERE domain_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_enterprise 
  ON public.knowledge_documents(enterprise_id) WHERE enterprise_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_access_policy 
  ON public.knowledge_documents(access_policy);

-- Step 2: Add columns to document_chunks (if not exists)
-- ============================================================================

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS domain_id TEXT;

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS enterprise_id TEXT;

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS access_policy access_policy_level;

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS rag_priority_weight DECIMAL(3,2);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_chunks_domain_id 
  ON public.document_chunks(domain_id) WHERE domain_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_document_chunks_enterprise 
  ON public.document_chunks(enterprise_id) WHERE enterprise_id IS NOT NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Missing columns added to knowledge_documents and document_chunks!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Columns added:';
  RAISE NOTICE '   - knowledge_documents: domain_id, enterprise_id, owner_user_id, access_policy, rag_priority_weight, pii_sensitivity, regulatory_exposure';
  RAISE NOTICE '   - document_chunks: domain_id, enterprise_id, access_policy, rag_priority_weight';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Ready for Step 2 migration!';
END $$;

