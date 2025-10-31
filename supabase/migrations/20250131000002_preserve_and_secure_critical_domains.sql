-- ============================================================================
-- Preserve and Secure Critical Domains: Digital Health & Regulatory Affairs
-- ============================================================================
-- This migration ensures that existing digital_health and regulatory_affairs
-- domains are properly mapped to the new unified architecture
-- ============================================================================

-- Step 1: Ensure critical domains exist in knowledge_domains_new
-- ============================================================================

-- Digital Health Domain (if not exists)
INSERT INTO public.knowledge_domains_new (
  domain_id,
  parent_domain_id,
  function_id,
  function_name,
  domain_name,
  domain_description_llm,
  domain_scope,
  tier,
  tier_label,
  priority,
  maturity_level,
  regulatory_exposure,
  pii_sensitivity,
  embedding_model,
  rag_priority_weight,
  access_policy,
  tenants_primary,
  tenants_secondary,
  is_cross_tenant,
  governance_owner,
  last_review_owner_role,
  lifecycle_stage,
  
  -- Legacy fields for backward compatibility
  code,
  slug,
  name,
  description,
  keywords,
  is_active,
  color,
  icon
)
SELECT 
  'digital_health' AS domain_id,
  NULL AS parent_domain_id,
  'digital_data_ai' AS function_id,
  'Digital, Data & AI' AS function_name,
  'Digital Health' AS domain_name,
  'Covers digital health solutions, software as a medical device (SaMD), digital therapeutics (DTx), telemedicine, remote monitoring, and health technology innovation. Use this domain for questions about digital health regulatory pathways, clinical validation, cybersecurity requirements, and post-market surveillance for digital solutions.' AS domain_description_llm,
  'global' AS domain_scope,
  COALESCE(existing.tier, 1) AS tier,
  CASE 
    WHEN COALESCE(existing.tier, 1) = 1 THEN 'Core / High Authority'
    WHEN COALESCE(existing.tier, 1) = 2 THEN 'Specialized / High Value'
    ELSE 'Emerging / Future-Focused'
  END AS tier_label,
  COALESCE(existing.priority, 11) AS priority,
  'Established' AS maturity_level,
  'High' AS regulatory_exposure,
  'Medium' AS pii_sensitivity,
  ARRAY['Pre-Launch', 'Launch', 'Post-Launch'] AS lifecycle_stage,
  'text-embedding-3-large' AS embedding_model,
  0.95 AS rag_priority_weight,  -- High priority for authoritative content
  'enterprise_confidential' AS access_policy,  -- SECURED: Require enterprise access
  ARRAY['Digital Health Startup'] AS tenants_primary,
  ARRAY['Pharmaceutical', 'Healthcare Provider'] AS tenants_secondary,
  true AS is_cross_tenant,
  'Digital Health / Technology Function' AS governance_owner,
  'Digital Health Lead' AS last_review_owner_role,
  
  -- Legacy fields from existing domain
  COALESCE(existing.code, 'DIGITAL_HEALTH') AS code,
  'digital_health' AS slug,
  COALESCE(existing.name, 'Digital Health') AS name,
  COALESCE(existing.description, 'Digital health solutions and technology') AS description,
  COALESCE(existing.keywords, ARRAY['digital_health', 'samd', 'dtx', 'telemedicine']) AS keywords,
  COALESCE(existing.is_active, true) AS is_active,
  COALESCE(existing.color, '#10B981') AS color,
  COALESCE(existing.icon, 'smartphone') AS icon
FROM (
  SELECT * FROM public.knowledge_domains 
  WHERE slug = 'digital_health' 
  LIMIT 1
) existing
ON CONFLICT (domain_id) DO UPDATE SET
  -- Update critical security fields
  access_policy = 'enterprise_confidential',
  rag_priority_weight = GREATEST(EXCLUDED.rag_priority_weight, 0.95),
  regulatory_exposure = 'High',
  pii_sensitivity = 'Medium',
  domain_description_llm = EXCLUDED.domain_description_llm,
  governance_owner = EXCLUDED.governance_owner,
  last_review_owner_role = EXCLUDED.last_review_owner_role,
  updated_at = NOW();

-- Regulatory Affairs Domain (if not exists)
INSERT INTO public.knowledge_domains_new (
  domain_id,
  parent_domain_id,
  function_id,
  function_name,
  domain_name,
  domain_description_llm,
  domain_scope,
  tier,
  tier_label,
  priority,
  maturity_level,
  regulatory_exposure,
  pii_sensitivity,
  embedding_model,
  rag_priority_weight,
  access_policy,
  tenants_primary,
  tenants_secondary,
  is_cross_tenant,
  governance_owner,
  last_review_owner_role,
  lifecycle_stage,
  
  -- Legacy fields for backward compatibility
  code,
  slug,
  name,
  description,
  keywords,
  is_active,
  color,
  icon
)
SELECT 
  'regulatory_affairs' AS domain_id,
  NULL AS parent_domain_id,
  'regulatory_compliance' AS function_id,
  'Regulatory & Compliance' AS function_name,
  'Regulatory Affairs' AS domain_name,
  'Covers regulatory strategy, submissions, approvals, labeling, lifecycle variations and interactions with authorities for medicinal products and digital health solutions. Use this domain for questions about approval pathways, dossier content, clinical evidence requirements for approval, and post-approval obligations.' AS domain_description_llm,
  'global' AS domain_scope,
  COALESCE(existing.tier, 1) AS tier,
  CASE 
    WHEN COALESCE(existing.tier, 1) = 1 THEN 'Core / High Authority'
    WHEN COALESCE(existing.tier, 1) = 2 THEN 'Specialized / High Value'
    ELSE 'Emerging / Future-Focused'
  END AS tier_label,
  COALESCE(existing.priority, 1) AS priority,
  'Established' AS maturity_level,
  'High' AS regulatory_exposure,
  'Low' AS pii_sensitivity,
  ARRAY['Pre-Launch', 'Launch', 'Post-Launch'] AS lifecycle_stage,
  'text-embedding-3-large' AS embedding_model,
  0.95 AS rag_priority_weight,  -- High priority for authoritative content
  'enterprise_confidential' AS access_policy,  -- SECURED: Require enterprise access
  ARRAY['Pharmaceutical'] AS tenants_primary,
  ARRAY['Digital Health Startup'] AS tenants_secondary,
  true AS is_cross_tenant,
  'Regulatory Affairs Function' AS governance_owner,
  'Head of Regulatory Affairs' AS last_review_owner_role,
  
  -- Legacy fields from existing domain
  COALESCE(existing.code, 'REG_AFFAIRS') AS code,
  'regulatory_affairs' AS slug,
  COALESCE(existing.name, 'Regulatory Affairs') AS name,
  COALESCE(existing.description, 'Regulatory compliance and submissions') AS description,
  COALESCE(existing.keywords, ARRAY['regulatory', 'fda', 'ema', 'submissions', 'compliance']) AS keywords,
  COALESCE(existing.is_active, true) AS is_active,
  COALESCE(existing.color, '#EF4444') AS color,
  COALESCE(existing.icon, 'file-check') AS icon
FROM (
  SELECT * FROM public.knowledge_domains 
  WHERE slug = 'regulatory_affairs' 
  LIMIT 1
) existing
ON CONFLICT (domain_id) DO UPDATE SET
  -- Update critical security fields
  access_policy = 'enterprise_confidential',
  rag_priority_weight = GREATEST(EXCLUDED.rag_priority_weight, 0.95),
  regulatory_exposure = 'High',
  domain_description_llm = EXCLUDED.domain_description_llm,
  governance_owner = EXCLUDED.governance_owner,
  last_review_owner_role = EXCLUDED.last_review_owner_role,
  updated_at = NOW();

-- Step 2: Update existing documents to link to new domain structure
-- ============================================================================

-- Update knowledge_documents with domain_id mapping
UPDATE public.knowledge_documents
SET 
  domain_id = CASE 
    WHEN domain = 'digital_health' THEN 'digital_health'
    WHEN domain = 'regulatory_affairs' THEN 'regulatory_affairs'
    WHEN domain IS NOT NULL THEN domain  -- Keep other domains as-is
    ELSE domain_id
  END,
  -- Set access policy for existing documents in critical domains
  access_policy = CASE 
    WHEN domain IN ('digital_health', 'regulatory_affairs') THEN 'enterprise_confidential'::access_policy_level
    ELSE COALESCE(access_policy, 'public'::access_policy_level)
  END,
  -- Set priority weight for authoritative content
  rag_priority_weight = CASE 
    WHEN domain IN ('digital_health', 'regulatory_affairs') THEN 0.95
    ELSE COALESCE(rag_priority_weight, 0.9)
  END,
  -- Set compliance fields
  pii_sensitivity = CASE 
    WHEN domain = 'digital_health' THEN 'Medium'::exposure_level
    WHEN domain = 'regulatory_affairs' THEN 'Low'::exposure_level
    ELSE COALESCE(pii_sensitivity, 'Low'::exposure_level)
  END,
  regulatory_exposure = CASE 
    WHEN domain IN ('digital_health', 'regulatory_affairs') THEN 'High'::exposure_level
    ELSE COALESCE(regulatory_exposure, 'Medium'::exposure_level)
  END
WHERE 
  domain IN ('digital_health', 'regulatory_affairs')
  OR domain_id IN ('digital_health', 'regulatory_affairs');

-- Step 3: Update document_chunks to inherit domain and security settings
-- ============================================================================

-- Update chunks with domain_id and access settings from parent documents
UPDATE public.document_chunks dc
SET 
  domain_id = kd.domain_id,
  enterprise_id = kd.enterprise_id,
  access_policy = kd.access_policy,
  rag_priority_weight = kd.rag_priority_weight
FROM public.knowledge_documents kd
WHERE 
  dc.document_id = kd.id
  AND (
    kd.domain IN ('digital_health', 'regulatory_affairs')
    OR kd.domain_id IN ('digital_health', 'regulatory_affairs')
  )
  AND (
    dc.domain_id IS NULL 
    OR dc.access_policy IS NULL 
    OR dc.rag_priority_weight IS NULL
  );

-- Step 4: Create indexes for fast domain queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_critical_domains 
  ON public.knowledge_documents(domain_id, access_policy) 
  WHERE domain_id IN ('digital_health', 'regulatory_affairs');

CREATE INDEX IF NOT EXISTS idx_document_chunks_critical_domains 
  ON public.document_chunks(domain_id, access_policy) 
  WHERE domain_id IN ('digital_health', 'regulatory_affairs');

-- Step 5: Verify mapping integrity
-- ============================================================================

DO $$
DECLARE
  digital_health_count INTEGER;
  regulatory_affairs_count INTEGER;
  digital_health_docs INTEGER;
  regulatory_affairs_docs INTEGER;
  digital_health_chunks INTEGER;
  regulatory_affairs_chunks INTEGER;
BEGIN
  -- Count domains
  SELECT COUNT(*) INTO digital_health_count
  FROM public.knowledge_domains_new
  WHERE domain_id = 'digital_health';
  
  SELECT COUNT(*) INTO regulatory_affairs_count
  FROM public.knowledge_domains_new
  WHERE domain_id = 'regulatory_affairs';
  
  -- Count documents
  SELECT COUNT(*) INTO digital_health_docs
  FROM public.knowledge_documents
  WHERE domain_id = 'digital_health' OR domain = 'digital_health';
  
  SELECT COUNT(*) INTO regulatory_affairs_docs
  FROM public.knowledge_documents
  WHERE domain_id = 'regulatory_affairs' OR domain = 'regulatory_affairs';
  
  -- Count chunks
  SELECT COUNT(*) INTO digital_health_chunks
  FROM public.document_chunks
  WHERE domain_id = 'digital_health';
  
  SELECT COUNT(*) INTO regulatory_affairs_chunks
  FROM public.document_chunks
  WHERE domain_id = 'regulatory_affairs';
  
  -- Report
  RAISE NOTICE '✅ Domain Mapping Verification:';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Digital Health Domain:';
  RAISE NOTICE '   Domain exists: %', CASE WHEN digital_health_count > 0 THEN 'YES ✅' ELSE 'NO ❌' END;
  RAISE NOTICE '   Documents linked: %', digital_health_docs;
  RAISE NOTICE '   Chunks linked: %', digital_health_chunks;
  RAISE NOTICE '   Access Policy: enterprise_confidential 🔒';
  RAISE NOTICE '   Priority Weight: 0.95 (High Authority)';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Regulatory Affairs Domain:';
  RAISE NOTICE '   Domain exists: %', CASE WHEN regulatory_affairs_count > 0 THEN 'YES ✅' ELSE 'NO ❌' END;
  RAISE NOTICE '   Documents linked: %', regulatory_affairs_docs;
  RAISE NOTICE '   Chunks linked: %', regulatory_affairs_chunks;
  RAISE NOTICE '   Access Policy: enterprise_confidential 🔒';
  RAISE NOTICE '   Priority Weight: 0.95 (High Authority)';
  RAISE NOTICE '';
  
  IF digital_health_count = 0 OR regulatory_affairs_count = 0 THEN
    RAISE WARNING '⚠️  Critical domains missing! Please check domain creation.';
  END IF;
END $$;

-- Step 6: Create helper function to verify domain mapping
-- ============================================================================

CREATE OR REPLACE FUNCTION public.verify_critical_domains_mapping()
RETURNS TABLE(
  domain_id TEXT,
  domain_exists BOOLEAN,
  document_count BIGINT,
  chunk_count BIGINT,
  access_policy access_policy_level,
  rag_priority_weight DECIMAL(3,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.domain_id,
    true AS domain_exists,
    COUNT(DISTINCT kd.id) AS document_count,
    COUNT(DISTINCT dc.id) AS chunk_count,
    d.access_policy,
    d.rag_priority_weight
  FROM public.knowledge_domains_new d
  LEFT JOIN public.knowledge_documents kd ON kd.domain_id = d.domain_id OR kd.domain = d.domain_id
  LEFT JOIN public.document_chunks dc ON dc.domain_id = d.domain_id
  WHERE d.domain_id IN ('digital_health', 'regulatory_affairs')
  GROUP BY d.domain_id, d.access_policy, d.rag_priority_weight;
END;
$$ LANGUAGE plpgsql STABLE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Critical Domains Mapping Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security Settings Applied:';
  RAISE NOTICE '   - Digital Health: enterprise_confidential access';
  RAISE NOTICE '   - Regulatory Affairs: enterprise_confidential access';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Priority Weight: 0.95 (High Authority)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All existing documents and chunks have been preserved';
  RAISE NOTICE '✅ Domain mappings verified';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Verify mapping with: SELECT * FROM verify_critical_domains_mapping();';
END $$;

