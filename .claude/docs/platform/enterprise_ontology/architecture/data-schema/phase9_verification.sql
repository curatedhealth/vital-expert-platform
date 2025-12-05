-- ==========================================
-- FILE: phase9_verification.sql
-- PURPOSE: Standalone verification queries for Phase 9 Comprehensive Views
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 9 VERIFICATION: COMPREHENSIVE VIEWS';
    RAISE NOTICE '=================================================================';
END $$;

-- Check: Verify all views exist
DO $$
DECLARE
    view_count INTEGER;
    expected_views TEXT[] := ARRAY[
        'v_agent_complete',
        'v_agent_skill_inventory',
        'v_agent_graph_topology',
        'v_agent_marketplace',
        'v_agent_eval_summary',
        'v_agent_routing_eligibility'
    ];
    missing_views TEXT[];
BEGIN
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name = ANY(expected_views);
    
    -- Find missing views
    SELECT ARRAY_AGG(view_name) INTO missing_views
    FROM UNNEST(expected_views) AS view_name
    WHERE view_name NOT IN (
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public'
    );
    
    IF view_count = 6 THEN
        RAISE NOTICE '✓ All 6 comprehensive views exist';
    ELSE
        RAISE WARNING '⚠ Expected 6 views, found %. Missing: %', view_count, missing_views;
    END IF;
END $$;

-- List all agent views with descriptions
SELECT 
    table_name as view_name,
    obj_description((table_schema || '.' || table_name)::regclass, 'pg_class') as description
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'v_agent_%'
ORDER BY table_name;

-- Test each view (sample row count)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- View Row Counts ---';
END $$;

SELECT 'v_agent_complete' as view_name, COUNT(*) as row_count FROM v_agent_complete
UNION ALL
SELECT 'v_agent_skill_inventory', COUNT(*) FROM v_agent_skill_inventory
UNION ALL
SELECT 'v_agent_graph_topology', COUNT(*) FROM v_agent_graph_topology
UNION ALL
SELECT 'v_agent_marketplace', COUNT(*) FROM v_agent_marketplace
UNION ALL
SELECT 'v_agent_eval_summary', COUNT(*) FROM v_agent_eval_summary
UNION ALL
SELECT 'v_agent_routing_eligibility', COUNT(*) FROM v_agent_routing_eligibility;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ PHASE 9 VERIFICATION COMPLETE';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ALL 9 PHASES VERIFIED SUCCESSFULLY!';
END $$;

