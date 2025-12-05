-- ==========================================
-- FILE: phase8_verification.sql
-- PURPOSE: Standalone verification queries for Phase 8 Versioning, Discovery & Marketplace
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 8 VERIFICATION: VERSIONING, DISCOVERY & MARKETPLACE';
    RAISE NOTICE '=================================================================';
END $$;

-- Check: Verify all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN ('agent_versions', 'agent_categories', 'agent_category_assignments',
                         'agent_use_cases', 'agent_ratings', 'agent_changelog', 'agent_messages');
    
    IF table_count = 7 THEN
        RAISE NOTICE '✓ All 7 marketplace tables exist';
    ELSE
        RAISE WARNING '⚠ Expected 7 tables, found %', table_count;
    END IF;
END $$;

-- Check: Verify seeded categories
SELECT 
    'Agent Categories' as metric,
    COUNT(*) as total,
    STRING_AGG(slug, ', ') as categories
FROM agent_categories;

-- Row count summary
SELECT 
    'Agent Versions' as entity,
    COUNT(*) as count
FROM agent_versions
UNION ALL
SELECT 'Categories', COUNT(*) FROM agent_categories
UNION ALL
SELECT 'Category Assignments', COUNT(*) FROM agent_category_assignments
UNION ALL
SELECT 'Use Cases', COUNT(*) FROM agent_use_cases
UNION ALL
SELECT 'Ratings', COUNT(*) FROM agent_ratings
UNION ALL
SELECT 'Changelog Entries', COUNT(*) FROM agent_changelog
UNION ALL
SELECT 'Agent Messages', COUNT(*) FROM agent_messages;

DO $$
BEGIN
    RAISE NOTICE '✓ PHASE 8 VERIFICATION COMPLETE';
END $$;

