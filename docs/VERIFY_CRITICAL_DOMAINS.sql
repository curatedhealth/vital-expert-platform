-- ============================================================================
-- Verify Critical Domains Mapping
-- ============================================================================
-- Simple verification queries (no function needed)
-- ============================================================================

-- Check if domains exist
SELECT 
  domain_id,
  domain_name,
  domain_scope,
  access_policy,
  rag_priority_weight,
  regulatory_exposure,
  pii_sensitivity,
  is_active
FROM public.knowledge_domains_new
WHERE domain_id IN ('digital_health', 'regulatory_affairs')
ORDER BY domain_id;

-- Check document counts per domain
SELECT 
  COALESCE(kd.domain_id, kd.domain) as domain_id,
  COUNT(DISTINCT kd.id) as document_count,
  COUNT(DISTINCT dc.id) as chunk_count,
  COALESCE(d.access_policy, 'not_set'::text) as access_policy,
  COALESCE(d.rag_priority_weight, 0) as rag_priority_weight
FROM public.knowledge_documents kd
LEFT JOIN public.knowledge_domains_new d ON d.domain_id = COALESCE(kd.domain_id, kd.domain)
LEFT JOIN public.document_chunks dc ON dc.document_id = kd.id
WHERE 
  COALESCE(kd.domain_id, kd.domain) IN ('digital_health', 'regulatory_affairs')
GROUP BY 
  COALESCE(kd.domain_id, kd.domain),
  COALESCE(d.access_policy, 'not_set'::text),
  COALESCE(d.rag_priority_weight, 0);

-- Check specific documents (first 10)
SELECT 
  id,
  title,
  COALESCE(domain_id, domain) as domain_id,
  access_policy,
  rag_priority_weight,
  status,
  created_at
FROM public.knowledge_documents
WHERE 
  COALESCE(domain_id, domain) IN ('digital_health', 'regulatory_affairs')
ORDER BY created_at DESC
LIMIT 10;

-- Check chunk mapping
SELECT 
  dc.domain_id,
  COUNT(*) as chunk_count,
  COUNT(DISTINCT dc.document_id) as document_count
FROM public.document_chunks dc
WHERE dc.domain_id IN ('digital_health', 'regulatory_affairs')
GROUP BY dc.domain_id;

