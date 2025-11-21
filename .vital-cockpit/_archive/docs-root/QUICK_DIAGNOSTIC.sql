-- Quick diagnostic to check your document structure
-- Copy and paste into Supabase SQL Editor

-- 1. Do any documents exist?
SELECT COUNT(*) as total_documents FROM public.knowledge_documents;

-- 2. What domain values exist?
SELECT 
  COALESCE(domain, 'NULL') as domain_field,
  COALESCE(domain_id::text, 'NULL') as domain_id_field,
  COUNT(*) as count
FROM public.knowledge_documents
GROUP BY domain, domain_id
ORDER BY count DESC;

-- 3. Sample documents (if any exist)
SELECT 
  id,
  LEFT(title, 50) as title_preview,
  domain,
  domain_id,
  created_at
FROM public.knowledge_documents
ORDER BY created_at DESC
LIMIT 5;

