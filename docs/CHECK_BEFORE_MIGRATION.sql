-- ============================================================================
-- Check Your Data BEFORE Migration
-- ============================================================================
-- Use these queries to see what data you have before running migrations
-- ============================================================================

-- Check if old knowledge_domains table exists and has your domains
SELECT 
  slug,
  name,
  tier,
  priority,
  is_active
FROM public.knowledge_domains
WHERE slug IN ('digital_health', 'regulatory_affairs')
ORDER BY slug;

-- Check your existing documents
SELECT 
  domain,
  COUNT(*) as document_count,
  COUNT(DISTINCT id) as unique_docs,
  MIN(created_at) as first_upload,
  MAX(created_at) as last_upload
FROM public.knowledge_documents
WHERE domain IN ('digital_health', 'regulatory_affairs')
GROUP BY domain
ORDER BY domain;

-- Check document chunks (if they exist)
SELECT 
  dc.document_id,
  COUNT(*) as chunk_count
FROM public.document_chunks dc
INNER JOIN public.knowledge_documents kd ON dc.document_id = kd.id
WHERE kd.domain IN ('digital_health', 'regulatory_affairs')
GROUP BY dc.document_id
LIMIT 10;

-- Summary: What data you have
SELECT 
  'Digital Health' as domain_check,
  (SELECT COUNT(*) FROM public.knowledge_domains WHERE slug = 'digital_health') as domain_exists,
  (SELECT COUNT(*) FROM public.knowledge_documents WHERE domain = 'digital_health') as document_count
UNION ALL
SELECT 
  'Regulatory Affairs' as domain_check,
  (SELECT COUNT(*) FROM public.knowledge_domains WHERE slug = 'regulatory_affairs') as domain_exists,
  (SELECT COUNT(*) FROM public.knowledge_documents WHERE domain = 'regulatory_affairs') as document_count;

