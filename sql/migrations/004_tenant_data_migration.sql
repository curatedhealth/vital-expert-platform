-- ============================================================================
-- TENANT-SPECIFIC DATA MIGRATION
-- ============================================================================
-- Description: Migrate tenant-specific data to Digital Health and Pharma
-- Date: 2025-11-18
-- Purpose: Assign remaining data to appropriate tenants
-- Dependencies: 003_platform_data_migration.sql
-- Rollback: 004_tenant_data_migration_rollback.sql
-- ============================================================================

BEGIN;

-- Track migration progress
INSERT INTO migration_tracking (migration_name, phase, status)
VALUES ('multi_tenant_migration', '004_tenant_data_migration', 'started');

SAVEPOINT tenant_data_start;

-- Constants
DO $$
BEGIN
    RAISE NOTICE 'Starting tenant-specific data migration...';
    RAISE NOTICE 'Digital Health Tenant: 11111111-1111-1111-1111-111111111111';
    RAISE NOTICE 'Pharma Tenant: f7aa6fd4-0af9-4706-8b31-034f1f7accda';
END $$;

-- ============================================================================
-- MIGRATE TIER 3 AGENTS TO TENANTS
-- ============================================================================

\echo 'Migrating Tier 3 agents to appropriate tenants...'

-- Digital Health focused agents
UPDATE agents
SET tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
WHERE tier = 'tier_3'
  AND tenant_id IS NULL
  AND (
    -- Check knowledge domains
    knowledge_domains && ARRAY[
        'digital_health',
        'digital_medicine',
        'telemedicine',
        'remote_monitoring',
        'wearables',
        'mobile_health',
        'digital_therapeutics'
    ]
    OR
    -- Check agent name
    LOWER(name) LIKE '%digital%'
    OR LOWER(name) LIKE '%telehealth%'
    OR LOWER(name) LIKE '%remote%'
  );

-- Pharmaceutical/Clinical focused agents
UPDATE agents
SET tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
WHERE tier = 'tier_3'
  AND tenant_id IS NULL
  AND (
    -- Check knowledge domains
    knowledge_domains && ARRAY[
        'regulatory_affairs',
        'clinical_trials',
        'clinical_research',
        'pharmacovigilance',
        'drug_safety',
        'market_access',
        'medical_writing',
        'medical_affairs',
        'clinical_validation'
    ]
    OR
    -- Check agent name
    LOWER(name) LIKE '%regulatory%'
    OR LOWER(name) LIKE '%clinical trial%'
    OR LOWER(name) LIKE '%pharmacovigilance%'
    OR LOWER(name) LIKE '%drug%'
  );

-- Remaining Tier 3 agents → Digital Health (default for existing data)
UPDATE agents
SET tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
WHERE tier = 'tier_3'
  AND tenant_id IS NULL;

-- Count agents by tenant
SELECT
    'AGENTS BY TENANT' as report,
    COALESCE(t.name, 'No Tenant') as tenant_name,
    a.tier,
    COUNT(*) as count
FROM agents a
LEFT JOIN tenants t ON a.tenant_id = t.id
GROUP BY t.name, a.tier
ORDER BY t.name, a.tier;

-- ============================================================================
-- MIGRATE PROMPTS TO TENANTS
-- ============================================================================

\echo 'Migrating prompts to appropriate tenants...'

-- PRISM Suite prompts → Pharma
UPDATE prompts
SET tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
WHERE tenant_id IS NULL
  AND (
    LOWER(name) LIKE '%prism%'
    OR domain IN (
        'regulatory_affairs',
        'clinical_research',
        'clinical_trials',
        'pharmacovigilance',
        'market_access',
        'medical_writing',
        'clinical_validation',
        'medical_affairs'
    )
  );

-- Digital health prompts → Digital Health
UPDATE prompts
SET tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
WHERE tenant_id IS NULL
  AND domain IN (
    'digital_health',
    'digital_medicine',
    'telemedicine',
    'remote_monitoring'
  );

-- Remaining prompts → Digital Health (default for existing data)
UPDATE prompts
SET tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
WHERE tenant_id IS NULL
  AND created_by IS NOT NULL; -- User-created, not system prompts

-- Count prompts by tenant
SELECT
    'PROMPTS BY TENANT' as report,
    COALESCE(t.name, 'No Tenant') as tenant_name,
    p.domain,
    COUNT(*) as count
FROM prompts p
LEFT JOIN tenants t ON p.tenant_id = t.id
GROUP BY t.name, p.domain
ORDER BY t.name, p.domain;

-- ============================================================================
-- MIGRATE KNOWLEDGE BASE TO TENANTS
-- ============================================================================

\echo 'Migrating knowledge base to appropriate tenants...'

-- Pharmaceutical/Regulatory knowledge → Pharma
UPDATE knowledge_base
SET tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
WHERE tenant_id IS NULL
  AND domain IN (
    'regulatory',
    'regulatory_affairs',
    'clinical_trials',
    'clinical_research',
    'pharmacovigilance',
    'drug_development',
    'pharmaceutical',
    'market_access',
    'health_economics'
  );

-- Update corresponding sources
UPDATE knowledge_sources
SET tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
WHERE tenant_id IS NULL
  AND domain IN (
    'regulatory',
    'regulatory_affairs',
    'clinical_trials',
    'clinical_research',
    'pharmacovigilance',
    'drug_development',
    'pharmaceutical',
    'market_access',
    'health_economics'
  );

-- Digital health knowledge → Digital Health
UPDATE knowledge_base
SET tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
WHERE tenant_id IS NULL
  AND domain IN (
    'digital_health',
    'digital_medicine',
    'telemedicine',
    'remote_monitoring',
    'wearables',
    'mobile_health'
  );

-- Update corresponding sources
UPDATE knowledge_sources
SET tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
WHERE tenant_id IS NULL
  AND domain IN (
    'digital_health',
    'digital_medicine',
    'telemedicine',
    'remote_monitoring',
    'wearables',
    'mobile_health'
  );

-- Remaining knowledge → Digital Health (default)
UPDATE knowledge_base
SET tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
WHERE tenant_id IS NULL;

UPDATE knowledge_sources
SET tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
WHERE tenant_id IS NULL;

-- Count knowledge by tenant
SELECT
    'KNOWLEDGE BY TENANT' as report,
    COALESCE(t.name, 'No Tenant') as tenant_name,
    kb.domain,
    COUNT(*) as chunks,
    COUNT(DISTINCT kb.source_id) as sources
FROM knowledge_base kb
LEFT JOIN tenants t ON kb.tenant_id = t.id
GROUP BY t.name, kb.domain
ORDER BY t.name, kb.domain;

-- ============================================================================
-- MIGRATE USERS TO TENANTS (If tenant_id is NULL)
-- ============================================================================

\echo 'Checking user tenant assignments...'

-- Report on users without tenant
SELECT
    'USERS WITHOUT TENANT' as report,
    COUNT(*) as count
FROM users
WHERE tenant_id IS NULL;

-- Note: Cannot auto-assign users to tenants - must be done manually
-- based on business rules. This is a manual step.

DO $$
DECLARE
    v_users_without_tenant INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_users_without_tenant
    FROM users
    WHERE tenant_id IS NULL;

    IF v_users_without_tenant > 0 THEN
        RAISE WARNING '% users found without tenant_id. These must be assigned manually.', v_users_without_tenant;
        RAISE NOTICE 'Consider default assignment or contact users for their tenant preference.';
    ELSE
        RAISE NOTICE 'All users have tenant assignments.';
    END IF;
END $$;

-- ============================================================================
-- MIGRATE CONVERSATIONS TO TENANTS
-- ============================================================================

\echo 'Migrating conversations to match user tenants...'

-- Update conversations to match their user's tenant
UPDATE conversations c
SET tenant_id = u.tenant_id
FROM users u
WHERE c.user_id = u.id
  AND c.tenant_id IS NULL
  AND u.tenant_id IS NOT NULL;

-- Report conversations without tenant
SELECT
    'CONVERSATIONS WITHOUT TENANT' as report,
    COUNT(*) as count
FROM conversations
WHERE tenant_id IS NULL;

-- ============================================================================
-- CREATE TENANT-SPECIFIC TOOL ASSIGNMENTS
-- ============================================================================

\echo 'Creating tool assignments for tenant agents...'

-- Assign all platform tools to Digital Health Tier 3 agents
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT
    a.id as agent_id,
    t.id as tool_id,
    true as is_enabled,
    false as auto_use,
    t.display_order as priority
FROM agents a
CROSS JOIN tools t
WHERE a.tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  AND a.tier = 'tier_3'
  AND t.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  AND t.is_active = true
  -- Only insert if not already assigned
  AND NOT EXISTS (
    SELECT 1 FROM agent_tool_assignments ata
    WHERE ata.agent_id = a.id AND ata.tool_id = t.id
  );

-- Assign all platform tools to Pharma Tier 3 agents
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT
    a.id as agent_id,
    t.id as tool_id,
    true as is_enabled,
    false as auto_use,
    t.display_order as priority
FROM agents a
CROSS JOIN tools t
WHERE a.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
  AND a.tier = 'tier_3'
  AND t.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  AND t.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM agent_tool_assignments ata
    WHERE ata.agent_id = a.id AND ata.tool_id = t.id
  );

SELECT
    'TOOL ASSIGNMENTS CREATED' as report,
    COUNT(*) as total_assignments
FROM agent_tool_assignments;

-- ============================================================================
-- VALIDATION
-- ============================================================================

\echo 'Validating tenant data migration...'

DO $$
DECLARE
    v_agents_without_tenant INTEGER;
    v_prompts_without_tenant INTEGER;
    v_knowledge_without_tenant INTEGER;
    v_users_without_tenant INTEGER;
    v_conversations_without_tenant INTEGER;
BEGIN
    -- Count records without tenant
    SELECT COUNT(*) INTO v_agents_without_tenant
    FROM agents WHERE tenant_id IS NULL;

    SELECT COUNT(*) INTO v_prompts_without_tenant
    FROM prompts WHERE tenant_id IS NULL;

    SELECT COUNT(*) INTO v_knowledge_without_tenant
    FROM knowledge_base WHERE tenant_id IS NULL;

    SELECT COUNT(*) INTO v_users_without_tenant
    FROM users WHERE tenant_id IS NULL;

    SELECT COUNT(*) INTO v_conversations_without_tenant
    FROM conversations WHERE tenant_id IS NULL;

    RAISE NOTICE 'Tenant Data Migration Validation:';
    RAISE NOTICE '  - Agents without tenant: %', v_agents_without_tenant;
    RAISE NOTICE '  - Prompts without tenant: %', v_prompts_without_tenant;
    RAISE NOTICE '  - Knowledge without tenant: %', v_knowledge_without_tenant;
    RAISE NOTICE '  - Users without tenant: %', v_users_without_tenant;
    RAISE NOTICE '  - Conversations without tenant: %', v_conversations_without_tenant;

    IF v_agents_without_tenant > 0 THEN
        RAISE WARNING 'Some agents still lack tenant assignment!';
    END IF;

    IF v_users_without_tenant > 0 THEN
        RAISE WARNING 'Some users lack tenant assignment - manual intervention required!';
    END IF;
END $$;

-- ============================================================================
-- CREATE FINAL MIGRATION SUMMARY
-- ============================================================================

CREATE TEMP TABLE tenant_data_summary AS
SELECT
    t.id,
    t.name as tenant_name,
    COUNT(DISTINCT a.id) as agents,
    COUNT(DISTINCT tl.id) as tools,
    COUNT(DISTINCT p.id) as prompts,
    COUNT(DISTINCT kb.id) as knowledge_chunks,
    COUNT(DISTINCT ks.id) as knowledge_sources,
    COUNT(DISTINCT u.id) as users,
    COUNT(DISTINCT c.id) as conversations,
    COUNT(DISTINCT ata.id) as tool_assignments
FROM tenants t
LEFT JOIN agents a ON a.tenant_id = t.id
LEFT JOIN tools tl ON tl.tenant_id = t.id
LEFT JOIN prompts p ON p.tenant_id = t.id
LEFT JOIN knowledge_base kb ON kb.tenant_id = t.id
LEFT JOIN knowledge_sources ks ON ks.tenant_id = t.id
LEFT JOIN users u ON u.tenant_id = t.id
LEFT JOIN conversations c ON c.tenant_id = t.id
LEFT JOIN agent_tool_assignments ata ON ata.agent_id = a.id
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

SELECT
    'TENANT DATA SUMMARY' as report_title,
    *
FROM tenant_data_summary;

-- ============================================================================
-- COMMIT
-- ============================================================================

-- Update migration tracking
UPDATE migration_tracking
SET status = 'completed',
    completed_at = NOW(),
    metrics = jsonb_agg(row_to_json(tenant_data_summary))
FROM tenant_data_summary
WHERE migration_name = 'multi_tenant_migration'
  AND phase = '004_tenant_data_migration';

COMMIT;

\echo '============================================'
\echo 'Tenant data migration completed successfully!'
\echo '============================================'

-- Final report
SELECT * FROM tenant_data_summary;
