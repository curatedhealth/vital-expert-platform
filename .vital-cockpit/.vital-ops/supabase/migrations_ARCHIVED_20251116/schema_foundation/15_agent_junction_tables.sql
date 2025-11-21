-- =============================================================================
-- PHASE 15: Agent Relationship Junction Tables
-- =============================================================================
-- PURPOSE: Verify all agent junction tables are created
-- TABLES: 8 tables (agent_prompts, agent_tools, agent_skills, agent_knowledge, agent_industries - already created in previous phases)
-- TIME: ~5 minutes (verification only)
-- =============================================================================

-- NOTE: Most agent junction tables were already created in earlier phases:
-- - agent_prompts (Phase 07)
-- - agent_tools (Phase 10)
-- - agent_skills (Phase 10)
-- - agent_knowledge (Phase 10)
-- - agent_industries (Phase 05)
-- - task_agents (Phase 13)

-- This phase adds any remaining agent relationship tables if needed

-- =============================================================================
-- VERIFICATION: Check all agent junction tables exist
-- =============================================================================

DO $$
DECLARE
    existing_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'agent_prompts',
        'agent_tools',
        'agent_skills',
        'agent_knowledge',
        'agent_industries',
        'task_agents'
    ];
    missing_table TEXT;
BEGIN
    SELECT COUNT(*) INTO existing_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = ANY(expected_tables);

    IF existing_count < array_length(expected_tables, 1) THEN
        RAISE NOTICE 'WARNING: Not all agent junction tables exist';
        FOR missing_table IN
            SELECT unnest(expected_tables)
            EXCEPT
            SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        LOOP
            RAISE NOTICE 'Missing table: %', missing_table;
        END LOOP;
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ PHASE 15 COMPLETE (VERIFICATION)';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Agent junction tables verified: %', existing_count;
        RAISE NOTICE '';
        RAISE NOTICE 'Junction Tables:';
        RAISE NOTICE '  - agent_prompts (agents → prompts)';
        RAISE NOTICE '  - agent_tools (agents → tools)';
        RAISE NOTICE '  - agent_skills (agents → skills)';
        RAISE NOTICE '  - agent_knowledge (agents → knowledge)';
        RAISE NOTICE '  - agent_industries (agents → industries)';
        RAISE NOTICE '  - task_agents (tasks → agents)';
        RAISE NOTICE '';
        RAISE NOTICE 'Cumulative Progress: 83 tables verified';
        RAISE NOTICE '';
        RAISE NOTICE 'Next: Run Phase 16 (Workflow Execution Runtime)';
        RAISE NOTICE '';
    END IF;
END $$;
