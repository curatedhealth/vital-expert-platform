-- ==========================================
-- FILE: phase4_verification.sql
-- PURPOSE: Standalone verification queries for Phase 4 RAG Profiles & Policies
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 4 VERIFICATION: RAG PROFILES & POLICIES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Check: Verify all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN ('rag_profiles', 'agent_rag_policies', 'rag_profile_knowledge_sources');
    
    IF table_count = 3 THEN
        RAISE NOTICE '✓ All 3 RAG tables exist';
    ELSE
        RAISE WARNING '⚠ Expected 3 tables, found %', table_count;
    END IF;
END $$;

-- Check: Verify seeded profiles
SELECT 
    'RAG Profiles' as metric,
    COUNT(*) as total,
    STRING_AGG(slug, ', ') as profiles
FROM rag_profiles
WHERE is_active = true;

-- Row count summary
SELECT 
    'RAG Profiles' as entity,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM rag_profiles
UNION ALL
SELECT 'Agent RAG Policies', COUNT(*), COUNT(*) FILTER (WHERE is_active = true)
FROM agent_rag_policies
UNION ALL
SELECT 'Profile Knowledge Sources', COUNT(*), COUNT(*) FILTER (WHERE is_active = true)
FROM rag_profile_knowledge_sources;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ PHASE 4 VERIFICATION COMPLETE';
END $$;

