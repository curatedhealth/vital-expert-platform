-- ============================================================================
-- MIGRATE ALL RAG DOMAINS TO knowledge_domains_new
-- ============================================================================
-- This script migrates all domains from knowledge_domains to knowledge_domains_new
-- and ensures all required domains are present in the new unified architecture
-- ============================================================================

DO $$
DECLARE
    domain_count INTEGER;
BEGIN
    -- Step 1: Verify knowledge_domains_new table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'knowledge_domains_new'
    ) THEN
        RAISE EXCEPTION 'knowledge_domains_new table does not exist. Please run the unified_rag_domain_architecture migration first.';
    END IF;

    -- Step 2: Migrate existing domains from knowledge_domains to knowledge_domains_new
    -- ============================================================================
    RAISE NOTICE 'Starting domain migration from knowledge_domains to knowledge_domains_new...';

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
        is_active,
        -- Legacy fields for backward compatibility
        code,
        slug,
        name,
        description,
        keywords,
        color,
        icon,
        metadata
    )
    SELECT 
        COALESCE(kd.slug, 'domain_' || kd.id::text) as domain_id,
        NULL as parent_domain_id,  -- Can be updated later for hierarchy
        CASE 
            WHEN kd.slug LIKE 'regulatory%' OR kd.slug LIKE 'quality%' OR kd.slug LIKE 'compliance%' 
            THEN 'regulatory_compliance'
            WHEN kd.slug LIKE 'clinical%' OR kd.slug LIKE 'medical%' OR kd.slug LIKE 'biostat%' 
            THEN 'clinical_development'
            WHEN kd.slug LIKE 'market%' OR kd.slug LIKE 'commercial%' OR kd.slug LIKE 'pricing%' 
            THEN 'market_access'
            WHEN kd.slug LIKE 'data%' OR kd.slug LIKE 'analytics%' 
            THEN 'data_science'
            WHEN kd.slug LIKE 'digital%' OR kd.slug LIKE 'health%' 
            THEN 'digital_health'
            ELSE 'general'
        END as function_id,
        CASE 
            WHEN kd.slug LIKE 'regulatory%' OR kd.slug LIKE 'quality%' OR kd.slug LIKE 'compliance%' 
            THEN 'Regulatory & Compliance'
            WHEN kd.slug LIKE 'clinical%' OR kd.slug LIKE 'medical%' OR kd.slug LIKE 'biostat%' 
            THEN 'Clinical Development'
            WHEN kd.slug LIKE 'market%' OR kd.slug LIKE 'commercial%' OR kd.slug LIKE 'pricing%' 
            THEN 'Market Access'
            WHEN kd.slug LIKE 'data%' OR kd.slug LIKE 'analytics%' 
            THEN 'Data Science'
            WHEN kd.slug LIKE 'digital%' OR kd.slug LIKE 'health%' 
            THEN 'Digital Health'
            ELSE 'General'
        END as function_name,
        kd.name as domain_name,
        COALESCE(kd.description, kd.name || ' domain for healthcare and pharmaceutical knowledge') as domain_description_llm,
        'global'::domain_scope as domain_scope,
        COALESCE(kd.tier, 1) as tier,
        CASE 
            WHEN kd.tier = 1 THEN 'Core / High Authority'
            WHEN kd.tier = 2 THEN 'Specialized'
            WHEN kd.tier = 3 THEN 'Emerging'
            ELSE 'Core / High Authority'
        END as tier_label,
        COALESCE(kd.priority, 1) as priority,
        CASE 
            WHEN kd.tier = 1 THEN 'Established'::maturity_level
            WHEN kd.tier = 2 THEN 'Specialized'::maturity_level
            WHEN kd.tier = 3 THEN 'Emerging'::maturity_level
            ELSE 'Established'::maturity_level
        END as maturity_level,
        CASE 
            WHEN kd.slug LIKE 'regulatory%' OR kd.slug LIKE 'safety%' OR kd.slug LIKE 'pharmacovigilance%'
            THEN 'High'::exposure_level
            ELSE 'Medium'::exposure_level
        END as regulatory_exposure,
        CASE 
            WHEN kd.slug LIKE 'safety%' OR kd.slug LIKE 'patient%' OR kd.slug LIKE 'clinical%'
            THEN 'Medium'::exposure_level
            ELSE 'Low'::exposure_level
        END as pii_sensitivity,
        COALESCE(
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'knowledge_domains' 
                    AND column_name = 'recommended_models'
                ) AND kd.recommended_models IS NOT NULL 
                THEN (kd.recommended_models->>'embedding'->>'primary')::text
                ELSE NULL
            END,
            'text-embedding-3-large'
        ) as embedding_model,
        CASE 
            WHEN kd.tier = 1 THEN 0.9
            WHEN kd.tier = 2 THEN 0.75
            WHEN kd.tier = 3 THEN 0.6
            ELSE 0.9
        END as rag_priority_weight,
        'public'::access_policy_level as access_policy,
        COALESCE(kd.is_active, true) as is_active,
        -- Legacy fields
        kd.code,
        kd.slug,
        kd.name,
        kd.description,
        COALESCE(kd.keywords, ARRAY[]::TEXT[]) as keywords,
        COALESCE(kd.color, '#3B82F6') as color,
        COALESCE(kd.icon, 'book') as icon,
        COALESCE(kd.metadata, '{}'::jsonb) as metadata
    FROM public.knowledge_domains kd
    WHERE NOT EXISTS (
        SELECT 1 FROM public.knowledge_domains_new kdn 
        WHERE kdn.domain_id = COALESCE(kd.slug, 'domain_' || kd.id::text)
    )
    ON CONFLICT (domain_id) DO NOTHING;

    GET DIAGNOSTICS domain_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % domains from knowledge_domains to knowledge_domains_new', domain_count;

    -- Step 3: Ensure critical domains exist (even if not in knowledge_domains)
    -- ============================================================================
    RAISE NOTICE 'Ensuring critical domains exist...';

    -- Digital Health domain
    INSERT INTO public.knowledge_domains_new (
        domain_id, parent_domain_id, function_id, function_name,
        domain_name, domain_description_llm, domain_scope, tier, tier_label, priority,
        maturity_level, regulatory_exposure, pii_sensitivity,
        embedding_model, rag_priority_weight, access_policy, is_active,
        slug, name, description, keywords, color, icon
    ) VALUES (
        'digital_health', NULL, 'digital_health', 'Digital Health',
        'Digital Health', 'Covers digital therapeutics, AI/ML validation, digital endpoints, real-world evidence from digital sources, and regulatory guidance for digital health solutions.',
        'global'::domain_scope, 1, 'Core / High Authority', 1,
        'Established'::maturity_level, 'High'::exposure_level, 'Medium'::exposure_level,
        'text-embedding-3-large', 0.95, 'public'::access_policy_level, true,
        'digital_health', 'Digital Health', 'Digital therapeutics, AI/ML validation, and digital endpoints',
        ARRAY['digital health', 'dtx', 'ai/ml', 'digital endpoints', 'real-world evidence'],
        '#2563EB', 'activity'
    )
    ON CONFLICT (domain_id) DO UPDATE SET
        domain_description_llm = EXCLUDED.domain_description_llm,
        updated_at = NOW();

    -- Regulatory Affairs domain
    INSERT INTO public.knowledge_domains_new (
        domain_id, parent_domain_id, function_id, function_name,
        domain_name, domain_description_llm, domain_scope, tier, tier_label, priority,
        maturity_level, regulatory_exposure, pii_sensitivity,
        embedding_model, rag_priority_weight, access_policy, is_active,
        slug, name, description, keywords, color, icon
    ) VALUES (
        'regulatory_affairs', NULL, 'regulatory_compliance', 'Regulatory & Compliance',
        'Regulatory Affairs', 'Covers regulatory strategy, submissions, approvals, labeling, lifecycle variations and interactions with authorities for medicinal products and digital health solutions.',
        'global'::domain_scope, 1, 'Core / High Authority', 1,
        'Established'::maturity_level, 'High'::exposure_level, 'Low'::exposure_level,
        'text-embedding-3-large', 0.95, 'public'::access_policy_level, true,
        'regulatory_affairs', 'Regulatory Affairs', 'FDA, EMA, and global regulatory submissions, approvals, and compliance',
        ARRAY['regulatory', 'fda', 'ema', 'submission', 'approval', 'compliance', '510k', 'pma', 'nda', 'bla'],
        '#DC2626', 'shield-check'
    )
    ON CONFLICT (domain_id) DO UPDATE SET
        domain_description_llm = EXCLUDED.domain_description_llm,
        updated_at = NOW();

    -- Step 4: Update recommended_models if they exist in metadata
    -- ============================================================================
    RAISE NOTICE 'Updating recommended models from metadata...';

    -- Check if recommended_models column exists before updating
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'knowledge_domains' 
        AND column_name = 'recommended_models'
    ) THEN
        UPDATE public.knowledge_domains_new kdn
        SET recommended_models = kd.recommended_models
        FROM public.knowledge_domains kd
        WHERE kdn.slug = kd.slug
        AND kd.recommended_models IS NOT NULL
        AND kdn.recommended_models IS NULL;
        
        RAISE NOTICE 'Updated recommended_models from knowledge_domains';
    ELSE
        RAISE NOTICE 'recommended_models column does not exist in knowledge_domains, skipping update';
    END IF;

    -- Step 5: Verify migration
    -- ============================================================================
    SELECT COUNT(*) INTO domain_count FROM public.knowledge_domains_new;
    RAISE NOTICE '✅ Domain migration completed!';
    RAISE NOTICE '   Total domains in knowledge_domains_new: %', domain_count;

    -- Show summary by tier
    RAISE NOTICE '';
    RAISE NOTICE 'Domain summary by tier:';
    FOR tier_val IN 1..3 LOOP
        SELECT COUNT(*) INTO domain_count 
        FROM public.knowledge_domains_new 
        WHERE tier = tier_val AND is_active = true;
        RAISE NOTICE '   Tier %: % domains', tier_val, domain_count;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Verify domain data: SELECT * FROM knowledge_domains_new ORDER BY tier, priority;';
    RAISE NOTICE '2. Check for missing domains and add manually if needed';
    RAISE NOTICE '3. Set up parent-child relationships for domain hierarchy';

END $$;

