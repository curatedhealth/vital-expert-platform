-- Diagnostic queries to understand document linking
-- Run these to see what's in your database

-- ============================================================================
-- 1. Check if documents exist at all
-- ============================================================================
SELECT 
  COUNT(*) as total_documents,
  COUNT(CASE WHEN domain IS NOT NULL THEN 1 END) as docs_with_domain,
  COUNT(CASE WHEN domain_id IS NOT NULL THEN 1 END) as docs_with_domain_id
FROM public.knowledge_documents;

-- ============================================================================
-- 2. See what domain values exist in documents
-- ============================================================================
SELECT 
  domain,
  domain_id,
  COUNT(*) as document_count
FROM public.knowledge_documents
GROUP BY domain, domain_id
ORDER BY document_count DESC;

-- ============================================================================
-- 3. Check if documents are linked to OLD knowledge_domains table
-- ============================================================================
SELECT 
  COUNT(*) as docs_linked_to_old_domains,
  COUNT(DISTINCT domain_id) as unique_old_domain_ids
FROM public.knowledge_documents kd
INNER JOIN public.knowledge_domains kd_old ON kd.domain_id = kd_old.id::text
WHERE kd_old.slug IN ('digital_health', 'regulatory_affairs');

-- ============================================================================
-- 4. Check what slugs exist in OLD knowledge_domains table
-- ============================================================================
SELECT 
  id,
  name,
  slug,
  is_active
FROM public.knowledge_domains
WHERE slug IN ('digital_health', 'regulatory_affairs')
   OR slug LIKE '%digital%'
   OR slug LIKE '%regulatory%'
ORDER BY slug;

-- ============================================================================
-- 5. See sample documents to understand structure
-- ============================================================================
SELECT 
  id,
  title,
  domain,
  domain_id,
  created_at
FROM public.knowledge_documents
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 6. Check document_chunks structure
-- ============================================================================
SELECT 
  COUNT(*) as total_chunks,
  COUNT(CASE WHEN domain IS NOT NULL THEN 1 END) as chunks_with_domain,
  COUNT(CASE WHEN domain_id IS NOT NULL THEN 1 END) as chunks_with_domain_id
FROM public.document_chunks;

-- ============================================================================
-- 7. Check if chunks are linked via document_id
-- ============================================================================
SELECT 
  kd.domain,
  kd.domain_id,
  COUNT(dc.id) as chunk_count
FROM public.document_chunks dc
INNER JOIN public.knowledge_documents kd ON dc.document_id = kd.id
GROUP BY kd.domain, kd.domain_id
ORDER BY chunk_count DESC
LIMIT 10;

