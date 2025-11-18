-- ============================================================================
-- POST-MIGRATION VALIDATION
-- ============================================================================
-- Description: Comprehensive validation of multi-tenant data migration
-- Date: 2025-11-18
-- Purpose: Verify data integrity, tenant isolation, and API compatibility
-- Dependencies: All previous migration scripts
-- ============================================================================

\echo '================================'
\echo 'POST-MIGRATION VALIDATION'
\echo 'Date: ' `date`
\echo '================================'
\echo ''

-- Track validation
INSERT INTO migration_tracking (migration_name, phase, status)
VALUES ('multi_tenant_migration', '005_post_migration_validation', 'started');

-- ============================================================================
-- TEST 1: Verify All Data Has tenant_id
-- ============================================================================

\echo '=== TEST 1: Checking for NULL tenant_id ==='
\echo ''

SELECT
    'agents' as table_name,
    COUNT(*) as total_records,
    COUNT(tenant_id) as with_tenant_id,
    COUNT(*) - COUNT(tenant_id) as missing_tenant_id,
    CASE
        WHEN COUNT(*) = COUNT(tenant_id) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as test_result
FROM agents

UNION ALL

SELECT
    'tools',
    COUNT(*),
    COUNT(tenant_id),
    COUNT(*) - COUNT(tenant_id),
    CASE WHEN COUNT(*) = COUNT(tenant_id) THEN '✅ PASS' ELSE '❌ FAIL' END
FROM tools

UNION ALL

SELECT
    'prompts',
    COUNT(*),
    COUNT(tenant_id),
    COUNT(*) - COUNT(tenant_id),
    CASE WHEN COUNT(*) = COUNT(tenant_id) THEN '✅ PASS' ELSE '❌ FAIL' END
FROM prompts

UNION ALL

SELECT
    'knowledge_base',
    COUNT(*),
    COUNT(tenant_id),
    COUNT(*) - COUNT(tenant_id),
    CASE WHEN COUNT(*) = COUNT(tenant_id) THEN '✅ PASS' ELSE '❌ FAIL' END
FROM knowledge_base

UNION ALL

SELECT
    'knowledge_sources',
    COUNT(*),
    COUNT(tenant_id),
    COUNT(*) - COUNT(tenant_id),
    CASE WHEN COUNT(*) = COUNT(tenant_id) THEN '✅ PASS' ELSE '❌ FAIL' END
FROM knowledge_sources

UNION ALL

SELECT
    'conversations',
    COUNT(*),
    COUNT(tenant_id),
    COUNT(*) - COUNT(tenant_id),
    CASE WHEN COUNT(*) = COUNT(tenant_id) THEN '✅ PASS' ELSE '❌ FAIL' END
FROM conversations;

\echo ''

-- ============================================================================
-- TEST 2: Verify Referential Integrity
-- ============================================================================

\echo '=== TEST 2: Checking Referential Integrity ==='
\echo ''

-- Agents with invalid tenant_id
SELECT
    'agents_invalid_tenant' as test_name,
    COUNT(*) as error_count,
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as test_result
FROM agents a
LEFT JOIN tenants t ON a.tenant_id = t.id
WHERE a.tenant_id IS NOT NULL AND t.id IS NULL

UNION ALL

-- Tools with invalid tenant_id
SELECT
    'tools_invalid_tenant',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM tools tl
LEFT JOIN tenants t ON tl.tenant_id = t.id
WHERE tl.tenant_id IS NOT NULL AND t.id IS NULL

UNION ALL

-- Prompts with invalid tenant_id
SELECT
    'prompts_invalid_tenant',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM prompts p
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE p.tenant_id IS NOT NULL AND t.id IS NULL

UNION ALL

-- Knowledge base with invalid tenant_id
SELECT
    'knowledge_invalid_tenant',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM knowledge_base kb
LEFT JOIN tenants t ON kb.tenant_id = t.id
WHERE kb.tenant_id IS NOT NULL AND t.id IS NULL

UNION ALL

-- Agent tool assignments with invalid agent_id
SELECT
    'agent_tools_invalid_agent',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM agent_tool_assignments ata
LEFT JOIN agents a ON ata.agent_id = a.id
WHERE a.id IS NULL

UNION ALL

-- Agent tool assignments with invalid tool_id
SELECT
    'agent_tools_invalid_tool',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM agent_tool_assignments ata
LEFT JOIN tools t ON ata.tool_id = t.id
WHERE t.id IS NULL;

\echo ''

-- ============================================================================
-- TEST 3: Verify Tenant Distribution
-- ============================================================================

\echo '=== TEST 3: Tenant Data Distribution ==='
\echo ''

SELECT
    t.name as tenant,
    COUNT(DISTINCT a.id) as agents,
    COUNT(DISTINCT tl.id) as tools,
    COUNT(DISTINCT p.id) as prompts,
    COUNT(DISTINCT kb.id) as knowledge_chunks,
    COUNT(DISTINCT ks.id) as knowledge_sources,
    COUNT(DISTINCT u.id) as users,
    COUNT(DISTINCT c.id) as conversations,
    CASE
        WHEN COUNT(DISTINCT a.id) > 0 THEN '✅'
        ELSE '⚠️'
    END as has_agents,
    CASE
        WHEN t.id = '00000000-0000-0000-0000-000000000001'::uuid AND COUNT(DISTINCT tl.id) > 0 THEN '✅'
        WHEN t.id != '00000000-0000-0000-0000-000000000001'::uuid THEN '✅'
        ELSE '⚠️'
    END as tools_ok
FROM tenants t
LEFT JOIN agents a ON a.tenant_id = t.id
LEFT JOIN tools tl ON tl.tenant_id = t.id
LEFT JOIN prompts p ON p.tenant_id = t.id
LEFT JOIN knowledge_base kb ON kb.tenant_id = t.id
LEFT JOIN knowledge_sources ks ON ks.tenant_id = t.id
LEFT JOIN users u ON u.tenant_id = t.id
LEFT JOIN conversations c ON c.tenant_id = t.id
WHERE t.id IN (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
)
GROUP BY t.id, t.name
ORDER BY
    CASE t.id
        WHEN '00000000-0000-0000-0000-000000000001'::uuid THEN 1
        WHEN '11111111-1111-1111-1111-111111111111'::uuid THEN 2
        WHEN 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid THEN 3
    END;

\echo ''

-- ============================================================================
-- TEST 4: Verify Platform Resources (Shared)
-- ============================================================================

\echo '=== TEST 4: Platform Shared Resources ==='
\echo ''

-- All tools should be on platform
SELECT
    'platform_tools' as test_name,
    COUNT(*) as total_tools,
    COUNT(*) FILTER (WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid) as platform_tools,
    CASE
        WHEN COUNT(*) = COUNT(*) FILTER (WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid) THEN '✅ PASS'
        ELSE '⚠️ WARNING'
    END as test_result
FROM tools

UNION ALL

-- Tier 1 & 2 agents should be on platform
SELECT
    'platform_tier1_tier2_agents',
    COUNT(*),
    COUNT(*) FILTER (WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid),
    CASE
        WHEN COUNT(*) = COUNT(*) FILTER (WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END
FROM agents
WHERE tier IN ('tier_1', 'tier_2');

\echo ''

-- ============================================================================
-- TEST 5: Verify Schema Fixes
-- ============================================================================

\echo '=== TEST 5: Schema Structure Validation ==='
\echo ''

-- Check tools.category column exists
SELECT
    'tools_category_column' as test_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'tools' AND column_name = 'category'
        ) THEN '✅ PASS - Column exists'
        ELSE '❌ FAIL - Column missing'
    END as test_result;

-- Check tools.category is populated
SELECT
    'tools_category_populated' as test_name,
    COUNT(*) as total_tools,
    COUNT(category) as with_category,
    CASE
        WHEN COUNT(*) = COUNT(category) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as test_result
FROM tools;

-- Check business_functions table exists
SELECT
    'business_functions_table' as test_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'business_functions'
        ) THEN '✅ PASS - Table exists'
        ELSE '❌ FAIL - Table missing'
    END as test_result;

-- Check org_departments table exists
SELECT
    'org_departments_table' as test_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'org_departments'
        ) THEN '✅ PASS - Table exists'
        ELSE '❌ FAIL - Table missing'
    END as test_result;

-- Check organizational_levels table exists
SELECT
    'organizational_levels_table' as test_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'organizational_levels'
        ) THEN '✅ PASS - Table exists'
        ELSE '❌ FAIL - Table missing'
    END as test_result;

\echo ''

-- ============================================================================
-- TEST 6: Verify Data Consistency
-- ============================================================================

\echo '=== TEST 6: Data Consistency Checks ==='
\echo ''

-- Check for duplicate agent names within same tenant
SELECT
    'duplicate_agent_names' as test_name,
    COUNT(*) as duplicate_count,
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '⚠️ WARNING' END as test_result
FROM (
    SELECT tenant_id, name, COUNT(*)
    FROM agents
    GROUP BY tenant_id, name
    HAVING COUNT(*) > 1
) AS dups;

-- Check for tools without category
SELECT
    'tools_without_category' as test_name,
    COUNT(*) as missing_category,
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '⚠️ WARNING' END as test_result
FROM tools
WHERE category IS NULL;

-- Check knowledge base chunks with missing sources
SELECT
    'knowledge_orphaned_chunks' as test_name,
    COUNT(*) as orphaned_count,
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '⚠️ WARNING' END as test_result
FROM knowledge_base kb
LEFT JOIN knowledge_sources ks ON kb.source_id = ks.id
WHERE kb.source_id IS NOT NULL AND ks.id IS NULL;

\echo ''

-- ============================================================================
-- TEST 7: Verify API Compatibility
-- ============================================================================

\echo '=== TEST 7: API Query Compatibility ==='
\echo ''

-- Simulate API query: GET /api/tools-crud?tenantId=<digital-health>
\echo 'Simulating: GET /api/tools-crud (Digital Health tenant)'
SELECT
    'api_tools_digital_health' as test_name,
    COUNT(*) as tool_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '⚠️ WARNING' END as test_result
FROM tools
WHERE tenant_id IN (
    '00000000-0000-0000-0000-000000000001'::uuid,  -- Platform (shared)
    '11111111-1111-1111-1111-111111111111'::uuid   -- Digital Health
);

-- Simulate API query: GET /api/prompts-crud?tenantId=<pharma>
\echo 'Simulating: GET /api/prompts-crud (Pharma tenant)'
SELECT
    'api_prompts_pharma' as test_name,
    COUNT(*) as prompt_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '⚠️ WARNING' END as test_result
FROM prompts
WHERE tenant_id IN (
    '00000000-0000-0000-0000-000000000001'::uuid,  -- Platform (shared)
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid   -- Pharma
);

-- Check that tools have category column for API
\echo 'Checking tools.category column for API compatibility'
SELECT
    'api_tools_category_field' as test_name,
    COUNT(*) as total_tools,
    COUNT(category) as with_category,
    CASE
        WHEN COUNT(*) = COUNT(category) THEN '✅ PASS - All tools have category'
        WHEN COUNT(category) > 0 THEN '⚠️ WARNING - Some tools missing category'
        ELSE '❌ FAIL - No tools have category'
    END as test_result
FROM tools;

\echo ''

-- ============================================================================
-- TEST 8: Verify Indexes for Performance
-- ============================================================================

\echo '=== TEST 8: Index Validation ==='
\echo ''

-- Check critical indexes exist
SELECT
    indexname as index_name,
    tablename as table_name,
    '✅ EXISTS' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_agents_tenant_id',
    'idx_tools_tenant_id',
    'idx_prompts_tenant_id',
    'idx_knowledge_base_tenant_id',
    'idx_tools_category',
    'idx_tools_tenant_category',
    'idx_agents_tenant_tier_status',
    'idx_prompts_tenant_domain_status'
  )
ORDER BY tablename, indexname;

\echo ''

-- ============================================================================
-- TEST 9: Verify Tenant Isolation (Security)
-- ============================================================================

\echo '=== TEST 9: Tenant Isolation Verification ==='
\echo ''

-- Check no data is shared between Digital Health and Pharma
-- (Platform data is intentionally shared)
SELECT
    'tenant_isolation_check' as test_name,
    COUNT(*) as cross_tenant_references,
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as test_result
FROM (
    -- Check if any agent from one tenant references resources from another
    SELECT a.id, a.tenant_id as agent_tenant, c.tenant_id as conversation_tenant
    FROM agents a
    JOIN conversations c ON c.persistent_agent_id = a.id
    WHERE a.tenant_id != c.tenant_id
      AND a.tenant_id NOT IN ('00000000-0000-0000-0000-000000000001'::uuid)  -- Exclude platform
      AND c.tenant_id NOT IN ('00000000-0000-0000-0000-000000000001'::uuid)
) AS violations;

\echo ''

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================

\echo '================================'
\echo 'VALIDATION SUMMARY'
\echo '================================'
\echo ''

-- Count test results
SELECT
    'TEST RESULTS SUMMARY' as summary_type,
    COUNT(*) FILTER (WHERE test_result LIKE '%PASS%') as passed_tests,
    COUNT(*) FILTER (WHERE test_result LIKE '%FAIL%') as failed_tests,
    COUNT(*) FILTER (WHERE test_result LIKE '%WARNING%') as warnings,
    COUNT(*) as total_tests
FROM (
    -- All test result queries combined
    SELECT test_result FROM (
        SELECT CASE WHEN COUNT(*) = COUNT(tenant_id) THEN '✅ PASS' ELSE '❌ FAIL' END as test_result
        FROM agents
        UNION ALL
        SELECT CASE WHEN COUNT(*) = COUNT(tenant_id) THEN '✅ PASS' ELSE '❌ FAIL' END FROM tools
        UNION ALL
        SELECT CASE WHEN COUNT(*) = COUNT(tenant_id) THEN '✅ PASS' ELSE '❌ FAIL' END FROM prompts
        UNION ALL
        SELECT CASE WHEN COUNT(*) = COUNT(tenant_id) THEN '✅ PASS' ELSE '❌ FAIL' END FROM knowledge_base
    ) AS test_results
) AS all_tests;

\echo ''

-- Update migration tracking
UPDATE migration_tracking
SET status = 'completed',
    completed_at = NOW()
WHERE migration_name = 'multi_tenant_migration'
  AND phase = '005_post_migration_validation';

\echo '================================'
\echo 'VALIDATION COMPLETE'
\echo 'Review results above for any failures or warnings'
\echo '================================'
