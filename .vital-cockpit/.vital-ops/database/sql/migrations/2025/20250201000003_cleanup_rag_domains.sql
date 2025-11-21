-- ============================================================================
-- CLEANUP RAG DOMAINS - Fix Duplicates and Normalize Data
-- ============================================================================
-- This script fixes duplicate domains, normalizes domain_ids, and ensures
-- consistent function classifications and access policies
-- ============================================================================

DO $$
DECLARE
    duplicate_count INTEGER;
    fixed_count INTEGER;
BEGIN
    -- Step 1: Fix duplicate regulatory_affairs domains
    -- ============================================================================
    RAISE NOTICE 'Checking for duplicate domains...';
    
    -- Find duplicates based on similar slugs/names
    SELECT COUNT(*) INTO duplicate_count
    FROM public.knowledge_domains_new
    WHERE domain_id IN ('regulatory_affairs', 'regulatory-affairs');
    
    IF duplicate_count > 1 THEN
        RAISE NOTICE 'Found duplicate regulatory_affairs domains, merging...';
        
        -- Keep the one with underscore (regulatory_affairs) and merge data
        UPDATE public.knowledge_domains_new
        SET 
            -- Use best values from both
            domain_description_llm = COALESCE(
                (SELECT domain_description_llm FROM public.knowledge_domains_new WHERE domain_id = 'regulatory_affairs' AND domain_description_llm IS NOT NULL LIMIT 1),
                (SELECT domain_description_llm FROM public.knowledge_domains_new WHERE domain_id = 'regulatory-affairs' AND domain_description_llm IS NOT NULL LIMIT 1),
                'Covers regulatory strategy, submissions, approvals, labeling, lifecycle variations and interactions with authorities for medicinal products and digital health solutions.'
            ),
            rag_priority_weight = GREATEST(
                (SELECT rag_priority_weight FROM public.knowledge_domains_new WHERE domain_id = 'regulatory_affairs' LIMIT 1),
                (SELECT rag_priority_weight FROM public.knowledge_domains_new WHERE domain_id = 'regulatory-affairs' LIMIT 1),
                0.95
            ),
            access_policy = COALESCE(
                (SELECT access_policy FROM public.knowledge_domains_new WHERE domain_id = 'regulatory_affairs' AND access_policy = 'enterprise_confidential' LIMIT 1),
                'public'
            )::access_policy_level,
            code = COALESCE(
                (SELECT code FROM public.knowledge_domains_new WHERE domain_id = 'regulatory_affairs' AND code IS NOT NULL LIMIT 1),
                'REG_AFFAIRS'
            ),
            updated_at = NOW()
        WHERE domain_id = 'regulatory_affairs';
        
        -- Delete the duplicate with hyphen
        DELETE FROM public.knowledge_domains_new
        WHERE domain_id = 'regulatory-affairs';
        
        RAISE NOTICE 'Merged duplicate regulatory_affairs domains';
    END IF;

    -- Step 2: Normalize domain_id formats (ensure all use underscores)
    -- ============================================================================
    RAISE NOTICE 'Normalizing domain_id formats...';
    
    -- Fix domains with hyphens to use underscores
    UPDATE public.knowledge_domains_new
    SET domain_id = REPLACE(domain_id, '-', '_'),
        slug = REPLACE(slug, '-', '_'),
        updated_at = NOW()
    WHERE domain_id LIKE '%-%' 
    AND NOT EXISTS (
        SELECT 1 FROM public.knowledge_domains_new kdn2 
        WHERE kdn2.domain_id = REPLACE(knowledge_domains_new.domain_id, '-', '_')
        AND kdn2.domain_id != knowledge_domains_new.domain_id
    );
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    RAISE NOTICE 'Normalized % domain_ids', fixed_count;

    -- Step 3: Fix function classifications
    -- ============================================================================
    RAISE NOTICE 'Fixing function classifications...';
    
    -- Fix pharmacovigilance function
    UPDATE public.knowledge_domains_new
    SET 
        function_id = 'regulatory_compliance',
        function_name = 'Regulatory & Compliance',
        updated_at = NOW()
    WHERE domain_id IN ('pharmacovigilance', 'safety_pharmacovigilance')
    AND (function_id = 'general' OR function_name = 'General');
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    IF fixed_count > 0 THEN
        RAISE NOTICE 'Fixed function classification for % domains', fixed_count;
    END IF;

    -- Fix medical affairs function (should be Medical Affairs, not Clinical Development)
    UPDATE public.knowledge_domains_new
    SET 
        function_id = 'medical_affairs',
        function_name = 'Medical Affairs',
        updated_at = NOW()
    WHERE domain_id IN ('medical_affairs', 'medical-affairs')
    AND function_id = 'clinical_development';
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    IF fixed_count > 0 THEN
        RAISE NOTICE 'Fixed function classification for medical affairs';
    END IF;

    -- Step 4: Ensure consistent access policies for critical domains
    -- ============================================================================
    RAISE NOTICE 'Ensuring consistent access policies...';
    
    -- Regulatory and safety domains should be enterprise_confidential if they contain sensitive data
    UPDATE public.knowledge_domains_new
    SET 
        access_policy = 'enterprise_confidential'::access_policy_level,
        updated_at = NOW()
    WHERE domain_id IN ('regulatory_affairs', 'pharmacovigilance', 'safety_pharmacovigilance')
    AND regulatory_exposure = 'High'
    AND access_policy = 'public';
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    IF fixed_count > 0 THEN
        RAISE NOTICE 'Updated access policy for % high-exposure domains', fixed_count;
    END IF;

    -- Step 5: Fix domain descriptions if missing
    -- ============================================================================
    RAISE NOTICE 'Fixing missing domain descriptions...';
    
    UPDATE public.knowledge_domains_new
    SET domain_description_llm = CASE domain_id
        WHEN 'pharmacovigilance' THEN 
            'Covers safety surveillance, adverse event collection, signal detection, risk management plans, and benefit-risk monitoring for products in market and in clinical development. Use this domain for questions about safety obligations, safety signal escalation, and post-marketing safety commitments.'
        WHEN 'medical_affairs' THEN
            'Covers medical information, scientific communication, KOL engagement, publication planning, medical writing, and medical education. Use this domain for questions about medical strategy, medical communications, and scientific data dissemination.'
        WHEN 'clinical_development' THEN
            'Covers clinical trial design, protocol development, study execution, data management, and regulatory submissions of clinical data. Use this domain for questions about trial design, endpoints, patient recruitment, and clinical study conduct.'
        ELSE domain_description_llm
    END,
    updated_at = NOW()
    WHERE domain_description_llm IS NULL OR domain_description_llm = '';
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    IF fixed_count > 0 THEN
        RAISE NOTICE 'Fixed domain descriptions for % domains', fixed_count;
    END IF;

    -- Step 6: Verify cleanup results
    -- ============================================================================
    RAISE NOTICE '';
    RAISE NOTICE '✅ Cleanup completed!';
    RAISE NOTICE '';
    
    -- Show summary
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT domain_id, COUNT(*) as cnt
        FROM public.knowledge_domains_new
        GROUP BY domain_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE '⚠️  Warning: % duplicate domain_ids still exist', duplicate_count;
    ELSE
        RAISE NOTICE '✅ No duplicate domain_ids found';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run verification script to see final results';

END $$;

