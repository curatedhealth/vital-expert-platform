-- ============================================================================
-- VERIFY RAG DOMAINS MIGRATION
-- ============================================================================
-- Run this after the migration to verify all domains were migrated correctly
-- ============================================================================

-- 1. Count domains in knowledge_domains_new
SELECT 
    'Total domains in knowledge_domains_new' as check_type,
    COUNT(*) as count
FROM public.knowledge_domains_new;

-- 2. Show domains by tier
SELECT 
    tier,
    tier_label,
    COUNT(*) as domain_count,
    string_agg(domain_name, ', ' ORDER BY priority) as domains
FROM public.knowledge_domains_new
WHERE is_active = true
GROUP BY tier, tier_label
ORDER BY tier;

-- 3. Show domains by function
SELECT 
    function_id,
    function_name,
    COUNT(*) as domain_count,
    string_agg(domain_name, ', ' ORDER BY priority) as domains
FROM public.knowledge_domains_new
WHERE is_active = true
GROUP BY function_id, function_name
ORDER BY function_id;

-- 4. Verify critical domains exist
SELECT 
    'Critical domains check' as check_type,
    domain_id,
    domain_name,
    tier,
    embedding_model,
    rag_priority_weight
FROM public.knowledge_domains_new
WHERE domain_id IN ('digital_health', 'regulatory_affairs')
ORDER BY domain_id;

-- 5. Check for recommended_models
SELECT 
    'Domains with recommended_models' as check_type,
    COUNT(*) as count
FROM public.knowledge_domains_new
WHERE recommended_models IS NOT NULL 
AND recommended_models != '{}'::jsonb;

-- 6. Show sample domain with all fields
SELECT 
    domain_id,
    domain_name,
    function_name,
    tier,
    tier_label,
    priority,
    embedding_model,
    rag_priority_weight,
    domain_scope,
    maturity_level,
    regulatory_exposure,
    pii_sensitivity,
    access_policy,
    is_active,
    slug,
    code,
    color,
    icon
FROM public.knowledge_domains_new
ORDER BY tier, priority
LIMIT 5;

