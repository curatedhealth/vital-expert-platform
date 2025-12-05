-- ==========================================
-- FILE: phase6_verification.sql
-- PURPOSE: Standalone verification queries for Phase 6 Tool Schemas & Hardening
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 6 VERIFICATION: TOOL SCHEMAS & HARDENING';
    RAISE NOTICE '=================================================================';
END $$;

-- Check: Verify all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN ('tool_schemas', 'tool_safety_scopes', 'tool_execution_policies');
    
    IF table_count = 3 THEN
        RAISE NOTICE '✓ All 3 tool hardening tables exist';
    ELSE
        RAISE WARNING '⚠ Expected 3 tables, found %', table_count;
    END IF;
END $$;

-- Check: Verify tools table enhancements
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'tools'
      AND column_name IN ('safety_level', 'requires_human_approval', 'has_side_effects');
    
    IF column_count = 3 THEN
        RAISE NOTICE '✓ Tools table enhanced with safety columns';
    ELSE
        RAISE WARNING '⚠ Expected 3 new columns in tools table, found %', column_count;
    END IF;
END $$;

-- Row count summary
SELECT 
    'Tool Schemas' as entity,
    COUNT(*) as count
FROM tool_schemas
UNION ALL
SELECT 'Tool Safety Scopes', COUNT(*) FROM tool_safety_scopes
UNION ALL
SELECT 'Tool Execution Policies', COUNT(*) FROM tool_execution_policies;

DO $$
BEGIN
    RAISE NOTICE '✓ PHASE 6 VERIFICATION COMPLETE';
END $$;

