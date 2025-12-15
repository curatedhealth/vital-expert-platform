-- ==========================================
-- FILE: phase5_verification.sql
-- PURPOSE: Standalone verification queries for Phase 5 Routing Policies & Control Plane
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 5 VERIFICATION: ROUTING POLICIES & CONTROL PLANE';
    RAISE NOTICE '=================================================================';
END $$;

-- Check: Verify all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN ('routing_policies', 'routing_rules', 'agent_routing_eligibility');
    
    IF table_count = 3 THEN
        RAISE NOTICE '✓ All 3 routing tables exist';
    ELSE
        RAISE WARNING '⚠ Expected 3 tables, found %', table_count;
    END IF;
END $$;

-- Row count summary
SELECT 
    'Routing Policies' as entity,
    COUNT(*) as count
FROM routing_policies
UNION ALL
SELECT 'Routing Rules', COUNT(*) FROM routing_rules
UNION ALL
SELECT 'Agent Routing Eligibility', COUNT(*) FROM agent_routing_eligibility;

DO $$
BEGIN
    RAISE NOTICE '✓ PHASE 5 VERIFICATION COMPLETE';
END $$;

