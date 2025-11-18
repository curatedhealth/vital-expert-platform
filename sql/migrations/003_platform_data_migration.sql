-- ============================================================================
-- PLATFORM DATA MIGRATION (Shared Resources)
-- ============================================================================
-- Description: Migrate shared data to Platform tenant
-- Date: 2025-11-18
-- Purpose: Move system-level agents, tools, and knowledge to platform tenant
-- Dependencies: 001_schema_fixes.sql, 002_tenant_setup.sql
-- Rollback: 003_platform_data_migration_rollback.sql
-- ============================================================================

BEGIN;

-- Track migration progress
INSERT INTO migration_tracking (migration_name, phase, status)
VALUES ('multi_tenant_migration', '003_platform_data_migration', 'started');

SAVEPOINT platform_data_start;

-- Define constants
DO $$
DECLARE
    PLATFORM_TENANT_ID UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Store in temp table for use in this session
    CREATE TEMP TABLE migration_constants (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );

    INSERT INTO migration_constants (key, value) VALUES
        ('PLATFORM_TENANT_ID', '00000000-0000-0000-0000-000000000001'),
        ('DIGITAL_HEALTH_TENANT_ID', '11111111-1111-1111-1111-111111111111'),
        ('PHARMA_TENANT_ID', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda');
END $$;

-- ============================================================================
-- MIGRATE TOOLS TO PLATFORM
-- ============================================================================

\echo 'Migrating tools to Platform tenant...'

-- All tools are platform-level (shared across tenants)
-- Tool assignments are tenant-specific
UPDATE tools
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- Count migrated tools
SELECT
    'TOOLS MIGRATION' as phase,
    COUNT(*) as total_tools,
    COUNT(CASE WHEN tenant_id = '00000000-0000-0000-0000-000000000001'::uuid THEN 1 END) as platform_tools
FROM tools;

-- ============================================================================
-- MIGRATE TIER 1 & TIER 2 AGENTS TO PLATFORM
-- ============================================================================

\echo 'Migrating Tier 1 & Tier 2 agents to Platform tenant...'

-- Strategic (Tier 1) and Specialized (Tier 2) agents are shared
-- These should be available to all tenants
UPDATE agents
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tier IN ('tier_1', 'tier_2')
  AND (tenant_id IS NULL OR tenant_id != '00000000-0000-0000-0000-000000000001'::uuid);

-- Count migrated agents
SELECT
    'AGENTS MIGRATION' as phase,
    tier,
    COUNT(*) as count,
    COUNT(CASE WHEN tenant_id = '00000000-0000-0000-0000-000000000001'::uuid THEN 1 END) as platform_count
FROM agents
GROUP BY tier
ORDER BY tier;

-- ============================================================================
-- MIGRATE SYSTEM PROMPTS TO PLATFORM
-- ============================================================================

\echo 'Migrating system prompts to Platform tenant...'

-- System prompts (not user-created) go to platform
-- These serve as templates for all tenants
UPDATE prompts
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE created_by IS NULL
  AND (tenant_id IS NULL OR tenant_id != '00000000-0000-0000-0000-000000000001'::uuid);

-- Also migrate prompts that are marked as templates
UPDATE prompts
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE metadata->>'is_template' = 'true'
  AND (tenant_id IS NULL OR tenant_id != '00000000-0000-0000-0000-000000000001'::uuid);

-- Count migrated prompts
SELECT
    'PROMPTS MIGRATION' as phase,
    COUNT(*) as total_prompts,
    COUNT(CASE WHEN tenant_id = '00000000-0000-0000-0000-000000000001'::uuid THEN 1 END) as platform_prompts,
    COUNT(CASE WHEN created_by IS NULL THEN 1 END) as system_prompts
FROM prompts;

-- ============================================================================
-- MIGRATE GENERAL KNOWLEDGE TO PLATFORM
-- ============================================================================

\echo 'Migrating general healthcare knowledge to Platform tenant...'

-- General healthcare knowledge that all tenants can use
-- Domain-specific knowledge stays with respective tenants (handled in next migration)
UPDATE knowledge_base kb
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE kb.domain IN (
    'general_medicine',
    'healthcare_standards',
    'medical_terminology',
    'anatomy',
    'physiology',
    'diagnostics',
    'therapeutics'
)
AND (kb.tenant_id IS NULL OR kb.tenant_id != '00000000-0000-0000-0000-000000000001'::uuid);

-- Also migrate knowledge sources
UPDATE knowledge_sources ks
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE ks.domain IN (
    'general_medicine',
    'healthcare_standards',
    'medical_terminology',
    'anatomy',
    'physiology',
    'diagnostics',
    'therapeutics'
)
AND (ks.tenant_id IS NULL OR ks.tenant_id != '00000000-0000-0000-0000-000000000001'::uuid);

-- Count migrated knowledge
SELECT
    'KNOWLEDGE MIGRATION' as phase,
    COUNT(DISTINCT kb.id) as knowledge_chunks,
    COUNT(DISTINCT ks.id) as knowledge_sources
FROM knowledge_base kb
LEFT JOIN knowledge_sources ks ON kb.source_id = ks.id
WHERE kb.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid;

-- ============================================================================
-- MIGRATE KNOWLEDGE DOMAINS (ALL TO PLATFORM)
-- ============================================================================

\echo 'Migrating knowledge domains to Platform tenant...'

-- Knowledge domains are system-wide classifications
-- Add tenant_id if column exists, otherwise skip
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'knowledge_domains' AND column_name = 'tenant_id'
    ) THEN
        EXECUTE 'UPDATE knowledge_domains
                 SET tenant_id = ''00000000-0000-0000-0000-000000000001''::uuid
                 WHERE tenant_id IS NULL OR tenant_id != ''00000000-0000-0000-0000-000000000001''::uuid';
        RAISE NOTICE 'Knowledge domains migrated to platform';
    ELSE
        RAISE NOTICE 'knowledge_domains table does not have tenant_id column, skipping';
    END IF;
END $$;

-- ============================================================================
-- CREATE PLATFORM ADMIN USER (If doesn't exist)
-- ============================================================================

\echo 'Checking for platform admin user...'

DO $$
DECLARE
    v_admin_exists BOOLEAN;
    v_admin_user_id UUID;
BEGIN
    -- Check if a super_admin user exists
    SELECT COUNT(*) > 0 INTO v_admin_exists
    FROM users
    WHERE role = 'super_admin'
      AND tenant_id = '00000000-0000-0000-0000-000000000001'::uuid;

    IF NOT v_admin_exists THEN
        RAISE NOTICE 'No platform admin user found. Create one manually in auth.users first.';
    ELSE
        SELECT id INTO v_admin_user_id
        FROM users
        WHERE role = 'super_admin'
          AND tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
        LIMIT 1;

        RAISE NOTICE 'Platform admin user exists: %', v_admin_user_id;
    END IF;
END $$;

-- ============================================================================
-- UPDATE AGENT METADATA FOR SHARED AGENTS
-- ============================================================================

\echo 'Updating metadata for platform agents...'

UPDATE agents
SET metadata = metadata || jsonb_build_object(
    'shared_resource', true,
    'available_to_all_tenants', true,
    'migrated_to_platform', NOW()
)
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  AND tier IN ('tier_1', 'tier_2');

-- ============================================================================
-- VALIDATION
-- ============================================================================

\echo 'Validating platform data migration...'

DO $$
DECLARE
    v_platform_tools INTEGER;
    v_platform_agents INTEGER;
    v_platform_prompts INTEGER;
    v_platform_knowledge INTEGER;
    v_null_tenant_count INTEGER;
BEGIN
    -- Count platform resources
    SELECT COUNT(*) INTO v_platform_tools
    FROM tools WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid;

    SELECT COUNT(*) INTO v_platform_agents
    FROM agents WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid;

    SELECT COUNT(*) INTO v_platform_prompts
    FROM prompts WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid;

    SELECT COUNT(*) INTO v_platform_knowledge
    FROM knowledge_base WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid;

    -- Check for remaining NULL tenant_id (should be minimal)
    SELECT COUNT(*) INTO v_null_tenant_count
    FROM (
        SELECT 1 FROM agents WHERE tenant_id IS NULL
        UNION ALL
        SELECT 1 FROM tools WHERE tenant_id IS NULL
        UNION ALL
        SELECT 1 FROM prompts WHERE tenant_id IS NULL
        UNION ALL
        SELECT 1 FROM knowledge_base WHERE tenant_id IS NULL
    ) AS nulls;

    RAISE NOTICE 'Platform Data Migration Summary:';
    RAISE NOTICE '  - Tools: %', v_platform_tools;
    RAISE NOTICE '  - Agents: %', v_platform_agents;
    RAISE NOTICE '  - Prompts: %', v_platform_prompts;
    RAISE NOTICE '  - Knowledge chunks: %', v_platform_knowledge;
    RAISE NOTICE '  - Remaining NULL tenant_id records: %', v_null_tenant_count;

    IF v_platform_tools = 0 THEN
        RAISE WARNING 'No tools migrated to platform! This may be expected if no tools exist yet.';
    END IF;

    IF v_platform_agents = 0 THEN
        RAISE WARNING 'No agents migrated to platform! This may indicate an issue.';
    END IF;
END $$;

-- ============================================================================
-- CREATE MIGRATION SUMMARY REPORT
-- ============================================================================

CREATE TEMP TABLE platform_migration_summary AS
SELECT
    'Platform Data Migration Summary' as report_title,
    NOW() as migration_date,
    (SELECT COUNT(*) FROM tools WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid) as platform_tools,
    (SELECT COUNT(*) FROM agents WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid) as platform_agents,
    (SELECT COUNT(*) FROM agents WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid AND tier = 'tier_1') as tier_1_agents,
    (SELECT COUNT(*) FROM agents WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid AND tier = 'tier_2') as tier_2_agents,
    (SELECT COUNT(*) FROM prompts WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid) as platform_prompts,
    (SELECT COUNT(*) FROM knowledge_base WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid) as platform_knowledge_chunks,
    (SELECT COUNT(*) FROM knowledge_sources WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid) as platform_knowledge_sources;

SELECT * FROM platform_migration_summary;

-- ============================================================================
-- COMMIT
-- ============================================================================

-- Update migration tracking
UPDATE migration_tracking
SET status = 'completed',
    completed_at = NOW(),
    metrics = (
        SELECT row_to_json(t)
        FROM (SELECT * FROM platform_migration_summary) t
    )
WHERE migration_name = 'multi_tenant_migration'
  AND phase = '003_platform_data_migration';

COMMIT;

\echo '============================================'
\echo 'Platform data migration completed successfully!'
\echo '============================================'

-- Final summary
SELECT
    t.name as tenant,
    COUNT(DISTINCT a.id) as agents,
    COUNT(DISTINCT tl.id) as tools,
    COUNT(DISTINCT p.id) as prompts,
    COUNT(DISTINCT kb.id) as knowledge_chunks
FROM tenants t
LEFT JOIN agents a ON a.tenant_id = t.id
LEFT JOIN tools tl ON tl.tenant_id = t.id
LEFT JOIN prompts p ON p.tenant_id = t.id
LEFT JOIN knowledge_base kb ON kb.tenant_id = t.id
WHERE t.id = '00000000-0000-0000-0000-000000000001'::uuid
GROUP BY t.id, t.name;
