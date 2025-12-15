-- ==========================================
-- FILE: phase7_verification.sql
-- PURPOSE: Standalone verification queries for Phase 7 Evaluation Framework
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 7 VERIFICATION: EVALUATION FRAMEWORK';
    RAISE NOTICE '=================================================================';
END $$;

-- Check: Verify all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN ('eval_suites', 'eval_cases', 'agent_eval_runs', 'agent_eval_cases');
    
    IF table_count = 4 THEN
        RAISE NOTICE '✓ All 4 evaluation tables exist';
    ELSE
        RAISE WARNING '⚠ Expected 4 tables, found %', table_count;
    END IF;
END $$;

-- Row count summary
SELECT 
    'Eval Suites' as entity,
    COUNT(*) as count
FROM eval_suites
UNION ALL
SELECT 'Eval Cases', COUNT(*) FROM eval_cases
UNION ALL
SELECT 'Agent Eval Runs', COUNT(*) FROM agent_eval_runs
UNION ALL
SELECT 'Case Results', COUNT(*) FROM agent_eval_cases;

DO $$
BEGIN
    RAISE NOTICE '✓ PHASE 7 VERIFICATION COMPLETE';
END $$;

