-- ============================================================================
-- Agent Schema Verification Script
-- ============================================================================
-- Purpose: Verify database schema is ready for Ask Expert/Panel workflows
-- Run this after applying migrations 012 and 013
-- ============================================================================

\timing on
\set ECHO all

-- ============================================================================
-- PART 1: Table Existence Check
-- ============================================================================

\echo ''
\echo '════════════════════════════════════════════════════════════════'
\echo 'PART 1: Verifying Table Existence'
\echo '════════════════════════════════════════════════════════════════'
\echo ''

SELECT
    table_name,
    CASE
        WHEN table_name IN (
            'agents',
            'agent_knowledge_domains',
            'agent_capabilities',
            'capabilities',
            'skills',
            'knowledge_domains',
            'tenant_agents',
            'workflow_instances',
            'workflow_steps',
            'agent_assignments'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'agents',
    'agent_knowledge_domains',
    'agent_capabilities',
    'capabilities',
    'skills',
    'knowledge_domains',
    'tenant_agents',
    'workflow_instances',
    'workflow_steps',
    'agent_assignments'
  )
ORDER BY table_name;

-- ============================================================================
-- PART 2: Required Columns Check
-- ============================================================================

\echo ''
\echo '════════════════════════════════════════════════════════════════'
\echo 'PART 2: Verifying Required Columns in agents Table'
\echo '════════════════════════════════════════════════════════════════'
\echo ''

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE
        WHEN column_name IN (
            'id', 'tenant_id', 'name', 'display_name', 'tier',
            'capabilities', 'domain_expertise', 'knowledge_domains',
            'status', 'system_prompt', 'model', 'metadata'
        ) THEN '✅ PRESENT'
        ELSE 'ℹ️  OPTIONAL'
    END as importance
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'agents'
ORDER BY
    CASE
        WHEN column_name IN ('id', 'tenant_id', 'name', 'display_name', 'tier') THEN 1
        WHEN column_name IN ('capabilities', 'domain_expertise', 'knowledge_domains') THEN 2
        WHEN column_name IN ('status', 'system_prompt', 'model') THEN 3
        ELSE 4
    END,
    column_name;

-- ============================================================================
-- PART 3: Index Check
-- ============================================================================

\echo ''
\echo '════════════════════════════════════════════════════════════════'
\echo 'PART 3: Verifying Performance Indexes'
\echo '════════════════════════════════════════════════════════════════'
\echo ''

SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'agents',
    'agent_knowledge_domains',
    'workflow_instances',
    'agent_assignments'
  )
ORDER BY tablename, indexname;

-- ============================================================================
-- PART 4: Function Check
-- ============================================================================

\echo ''
\echo '════════════════════════════════════════════════════════════════'
\echo 'PART 4: Verifying Helper Functions'
\echo '════════════════════════════════════════════════════════════════'
\echo ''

SELECT
    proname as function_name,
    prokind as function_type,
    CASE
        WHEN proname = 'get_workflow_compatible_agents' THEN '✅ CRITICAL'
        WHEN proname = 'get_agents_by_tier_specialty' THEN '✅ USEFUL'
        WHEN proname LIKE 'update_%_duration' THEN '✅ TRIGGER'
        ELSE 'ℹ️  OTHER'
    END as importance
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND (
    proname LIKE '%workflow%'
    OR proname LIKE '%agent%'
    OR proname LIKE '%duration%'
  )
ORDER BY importance, proname;

-- ============================================================================
-- PART 5: Data Population Check
-- ============================================================================

\echo ''
\echo '════════════════════════════════════════════════════════════════'
\echo 'PART 5: Checking Data Population'
\echo '════════════════════════════════════════════════════════════════'
\echo ''

SELECT
    'agents' as table_name,
    COUNT(*) as total_rows,
    COUNT(*) FILTER (WHERE status = 'active') as active_rows,
    COUNT(*) FILTER (WHERE tier IS NOT NULL) as rows_with_tier,
    COUNT(*) FILTER (WHERE capabilities IS NOT NULL AND array_length(capabilities, 1) > 0) as rows_with_capabilities
FROM agents
UNION ALL
SELECT
    'knowledge_domains',
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true),
    COUNT(*) FILTER (WHERE tier IS NOT NULL),
    NULL
FROM knowledge_domains
UNION ALL
SELECT
    'agent_knowledge_domains',
    COUNT(*),
    NULL,
    COUNT(*) FILTER (WHERE proficiency_level IS NOT NULL),
    COUNT(*) FILTER (WHERE is_primary_domain = true)
FROM agent_knowledge_domains
UNION ALL
SELECT
    'capabilities',
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    NULL,
    NULL
FROM capabilities
UNION ALL
SELECT
    'skills',
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true),
    NULL,
    NULL
FROM skills;

-- ============================================================================
-- PART 6: Agent Coverage Analysis
-- ============================================================================

\echo ''
\echo '════════════════════════════════════════════════════════════════'
\echo 'PART 6: Agent Coverage Analysis'
\echo '════════════════════════════════════════════════════════════════'
\echo ''

-- Agents by tier
SELECT
    tier,
    CASE
        WHEN tier = 1 THEN 'Master Agents'
        WHEN tier = 2 THEN 'Expert Agents'
        WHEN tier = 3 THEN 'Specialist Sub-Agents'
        WHEN tier = 4 THEN 'Worker Agents'
        WHEN tier = 5 THEN 'Tool Agents'
        ELSE 'No Tier Assigned'
    END as tier_name,
    COUNT(*) as agent_count,
    ROUND(AVG(array_length(capabilities, 1)), 2) as avg_capabilities,
    ROUND(AVG(array_length(domain_expertise, 1)), 2) as avg_domain_expertise
FROM agents
WHERE status IN ('active', 'testing')
GROUP BY tier
ORDER BY tier NULLS LAST;

-- Agents with knowledge domains
\echo ''
\echo 'Knowledge Domain Coverage:'
\echo ''

SELECT
    COALESCE(kd.name, akd.domain_name, 'UNMAPPED') as domain_name,
    COUNT(DISTINCT akd.agent_id) as agent_count,
    COUNT(*) FILTER (WHERE akd.proficiency_level = 'expert') as expert_count,
    COUNT(*) FILTER (WHERE akd.proficiency_level = 'advanced') as advanced_count,
    COUNT(*) FILTER (WHERE akd.is_primary_domain = true) as primary_specialists
FROM agent_knowledge_domains akd
LEFT JOIN knowledge_domains kd ON akd.knowledge_domain_id = kd.id
GROUP BY COALESCE(kd.name, akd.domain_name)
ORDER BY agent_count DESC
LIMIT 10;

-- ============================================================================
-- PART 7: Performance Test
-- ============================================================================

\echo ''
\echo '════════════════════════════════════════════════════════════════'
\echo 'PART 7: Performance Test (Target: < 50ms for agent selection)'
\echo '════════════════════════════════════════════════════════════════'
\echo ''

-- Get first tenant_id for testing
DO $$
DECLARE
    v_tenant_id UUID;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_duration_ms NUMERIC;
    v_agent_count INTEGER;
BEGIN
    -- Get first tenant
    SELECT id INTO v_tenant_id FROM organizations LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE NOTICE '⚠️  No tenants found. Cannot run performance test.';
        RETURN;
    END IF;

    RAISE NOTICE 'Testing with tenant_id: %', v_tenant_id;
    RAISE NOTICE '';

    -- Test 1: Ask Expert agent selection
    v_start_time := clock_timestamp();

    SELECT COUNT(*) INTO v_agent_count
    FROM get_workflow_compatible_agents(
        p_tenant_id := v_tenant_id,
        p_workflow_type := 'ask_expert',
        p_required_capabilities := ARRAY['fda_510k_submission'],
        p_required_domains := ARRAY['FDA_REGULATORY'],
        p_min_tier := 1,
        p_max_tier := 2
    )
    LIMIT 1;

    v_end_time := clock_timestamp();
    v_duration_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;

    RAISE NOTICE 'Test 1: Ask Expert Agent Selection';
    RAISE NOTICE '  Duration: % ms', ROUND(v_duration_ms, 2);
    RAISE NOTICE '  Agents returned: %', v_agent_count;
    RAISE NOTICE '  Status: %', CASE WHEN v_duration_ms < 50 THEN '✅ FAST' WHEN v_duration_ms < 200 THEN '⚠️  ACCEPTABLE' ELSE '❌ SLOW' END;
    RAISE NOTICE '';

    -- Test 2: Ask Panel agent selection
    v_start_time := clock_timestamp();

    SELECT COUNT(*) INTO v_agent_count
    FROM get_workflow_compatible_agents(
        p_tenant_id := v_tenant_id,
        p_workflow_type := 'ask_panel',
        p_required_capabilities := ARRAY['clinical_trial_design', 'statistical_planning'],
        p_required_domains := ARRAY['CLINICAL_TRIALS'],
        p_min_tier := 2,
        p_max_tier := 3
    )
    LIMIT 5;

    v_end_time := clock_timestamp();
    v_duration_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;

    RAISE NOTICE 'Test 2: Ask Panel Selection (5 agents)';
    RAISE NOTICE '  Duration: % ms', ROUND(v_duration_ms, 2);
    RAISE NOTICE '  Agents returned: %', v_agent_count;
    RAISE NOTICE '  Status: %', CASE WHEN v_duration_ms < 150 THEN '✅ FAST' WHEN v_duration_ms < 300 THEN '⚠️  ACCEPTABLE' ELSE '❌ SLOW' END;

END $$;

-- ============================================================================
-- PART 8: RLS Policy Check
-- ============================================================================

\echo ''
\echo '════════════════════════════════════════════════════════════════'
\echo 'PART 8: Row Level Security Policies'
\echo '════════════════════════════════════════════════════════════════'
\echo ''

SELECT
    schemaname,
    tablename,
    policyname,
    CASE
        WHEN policyname LIKE '%service_role%' THEN '✅ SERVICE ROLE'
        WHEN policyname LIKE '%read%' OR policyname LIKE '%SELECT%' THEN '👁️  READ ACCESS'
        WHEN policyname LIKE '%create%' OR policyname LIKE '%INSERT%' THEN '✏️  CREATE ACCESS'
        ELSE 'ℹ️  OTHER'
    END as policy_type
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'agents',
    'agent_knowledge_domains',
    'workflow_instances',
    'workflow_steps',
    'agent_assignments'
  )
ORDER BY tablename, policyname;

-- ============================================================================
-- PART 9: Sample Agent Query
-- ============================================================================

\echo ''
\echo '════════════════════════════════════════════════════════════════'
\echo 'PART 9: Sample Agent Data (First 5 Active Agents)'
\echo '════════════════════════════════════════════════════════════════'
\echo ''

SELECT
    a.name,
    a.display_name,
    a.tier,
    a.status,
    array_length(a.capabilities, 1) as capability_count,
    (
        SELECT COUNT(*)
        FROM agent_knowledge_domains akd
        WHERE akd.agent_id = a.id
    ) as knowledge_domain_count
FROM agents a
WHERE a.status IN ('active', 'testing')
ORDER BY a.tier, a.name
LIMIT 5;

-- ============================================================================
-- PART 10: Warnings & Recommendations
-- ============================================================================

\echo ''
\echo '════════════════════════════════════════════════════════════════'
\echo 'PART 10: Warnings & Recommendations'
\echo '════════════════════════════════════════════════════════════════'
\echo ''

DO $$
DECLARE
    v_agents_without_tier INTEGER;
    v_agents_without_capabilities INTEGER;
    v_agents_without_domains INTEGER;
    v_total_active_agents INTEGER;
BEGIN
    -- Count issues
    SELECT COUNT(*) INTO v_total_active_agents FROM agents WHERE status IN ('active', 'testing');
    SELECT COUNT(*) INTO v_agents_without_tier FROM agents WHERE status IN ('active', 'testing') AND tier IS NULL;
    SELECT COUNT(*) INTO v_agents_without_capabilities FROM agents WHERE status IN ('active', 'testing') AND (capabilities IS NULL OR array_length(capabilities, 1) = 0);
    SELECT COUNT(*) INTO v_agents_without_domains FROM agents WHERE status IN ('active', 'testing') AND NOT EXISTS (SELECT 1 FROM agent_knowledge_domains akd WHERE akd.agent_id = agents.id);

    RAISE NOTICE 'Total active agents: %', v_total_active_agents;
    RAISE NOTICE '';

    IF v_agents_without_tier > 0 THEN
        RAISE NOTICE '⚠️  WARNING: % agents missing tier classification', v_agents_without_tier;
        RAISE NOTICE '   Fix: UPDATE agents SET tier = ? WHERE tier IS NULL;';
        RAISE NOTICE '';
    END IF;

    IF v_agents_without_capabilities > 0 THEN
        RAISE NOTICE '⚠️  WARNING: % agents missing capabilities', v_agents_without_capabilities;
        RAISE NOTICE '   Fix: Assign capabilities to agents via agent_capabilities table';
        RAISE NOTICE '';
    END IF;

    IF v_agents_without_domains > 0 THEN
        RAISE NOTICE '⚠️  WARNING: % agents missing knowledge domains', v_agents_without_domains;
        RAISE NOTICE '   Fix: Run migration 013 or manually assign domains';
        RAISE NOTICE '';
    END IF;

    IF v_agents_without_tier = 0 AND v_agents_without_capabilities = 0 AND v_agents_without_domains = 0 THEN
        RAISE NOTICE '✅ ALL CHECKS PASSED - Schema is ready for production!';
        RAISE NOTICE '';
        RAISE NOTICE 'Next steps:';
        RAISE NOTICE '  1. Test workflow creation in development';
        RAISE NOTICE '  2. Update API routes to use new tables';
        RAISE NOTICE '  3. Integrate with Ask Expert/Panel UI';
        RAISE NOTICE '  4. Monitor query performance in production';
    ELSE
        RAISE NOTICE '⚠️  SCHEMA NEEDS ATTENTION - Fix warnings above before production deployment';
    END IF;

END $$;

\echo ''
\echo '════════════════════════════════════════════════════════════════'
\echo 'Verification Complete'
\echo '════════════════════════════════════════════════════════════════'
\echo ''
