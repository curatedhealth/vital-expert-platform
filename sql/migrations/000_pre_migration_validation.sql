-- ============================================================================
-- PRE-MIGRATION VALIDATION AND DATA EXPORT
-- ============================================================================
-- Description: Export current database state for comparison after migration
-- Date: 2025-11-18
-- Purpose: Create baseline metrics for migration validation
-- ============================================================================

-- ============================================================================
-- PRE-MIGRATION DATA COUNTS
-- ============================================================================

DO $$ BEGIN
    RAISE NOTICE '================================';
    RAISE NOTICE 'PRE-MIGRATION DATA COUNTS';
    RAISE NOTICE 'Date: %', NOW();
    RAISE NOTICE '================================';
    RAISE NOTICE '';
END $$;

-- Table: tenants
DO $$ BEGIN RAISE NOTICE '--- TENANTS ---'; END $$;
SELECT
  'tenants' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN is_active THEN 1 END) as active_count
FROM tenants;

SELECT id, name, slug, compliance_level, is_active
FROM tenants
ORDER BY created_at;

DO $$ BEGIN RAISE NOTICE ''; END $$;

-- Table: agents
DO $$ BEGIN RAISE NOTICE '--- AGENTS ---'; END $$;
SELECT
  'agents' as table_name,
  COUNT(*) as total_count,
  COUNT(tenant_id) as with_tenant_id,
  COUNT(*) - COUNT(tenant_id) as null_tenant_id,
  COUNT(CASE WHEN tier = 'tier_1' THEN 1 END) as tier_1_count,
  COUNT(CASE WHEN tier = 'tier_2' THEN 1 END) as tier_2_count,
  COUNT(CASE WHEN tier = 'tier_3' THEN 1 END) as tier_3_count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM agents;

SELECT
  tier,
  status,
  COUNT(*) as count,
  COUNT(tenant_id) as with_tenant_id
FROM agents
GROUP BY tier, status
ORDER BY tier, status;

DO $$ BEGIN RAISE NOTICE ''; END $$;

-- Table: tools
DO $$ BEGIN RAISE NOTICE '--- TOOLS ---'; END $$;
SELECT
  'tools' as table_name,
  COUNT(*) as total_count,
  COUNT(tenant_id) as with_tenant_id,
  COUNT(*) - COUNT(tenant_id) as null_tenant_id,
  COUNT(CASE WHEN is_active THEN 1 END) as active_count,
  COUNT(CASE WHEN is_premium THEN 1 END) as premium_count
FROM tools;

-- Check if category column exists
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tools'
  AND column_name IN ('category', 'category_id')
ORDER BY column_name;

DO $$ BEGIN RAISE NOTICE ''; END $$;

-- Table: tool_categories
DO $$ BEGIN RAISE NOTICE '--- TOOL CATEGORIES ---'; END $$;
SELECT
  'tool_categories' as table_name,
  COUNT(*) as total_count
FROM tool_categories;

SELECT id, name, description, display_order
FROM tool_categories
ORDER BY display_order;

DO $$ BEGIN RAISE NOTICE ''; END $$;

-- Table: prompts
DO $$ BEGIN RAISE NOTICE '--- PROMPTS ---'; END $$;
SELECT
  'prompts' as table_name,
  COUNT(*) as total_count,
  COUNT(tenant_id) as with_tenant_id,
  COUNT(*) - COUNT(tenant_id) as null_tenant_id,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN created_by IS NULL THEN 1 END) as system_prompts
FROM prompts;

SELECT
  domain,
  COUNT(*) as count,
  COUNT(tenant_id) as with_tenant_id
FROM prompts
GROUP BY domain
ORDER BY count DESC
LIMIT 10;

DO $$ BEGIN RAISE NOTICE ''; END $$;

-- Table: knowledge_base
DO $$ BEGIN RAISE NOTICE '--- KNOWLEDGE BASE ---'; END $$;
SELECT
  'knowledge_base' as table_name,
  COUNT(*) as total_count,
  COUNT(tenant_id) as with_tenant_id,
  COUNT(*) - COUNT(tenant_id) as null_tenant_id,
  COUNT(CASE WHEN is_active THEN 1 END) as active_count
FROM knowledge_base;

SELECT
  domain,
  COUNT(*) as count,
  COUNT(tenant_id) as with_tenant_id
FROM knowledge_base
GROUP BY domain
ORDER BY count DESC
LIMIT 10;

DO $$ BEGIN RAISE NOTICE ''; END $$;

-- Table: knowledge_domains
DO $$ BEGIN RAISE NOTICE '--- KNOWLEDGE DOMAINS ---'; END $$;
SELECT
  'knowledge_domains' as table_name,
  COUNT(*) as total_count
FROM knowledge_domains;

SELECT code, name, tier, priority
FROM knowledge_domains
ORDER BY priority
LIMIT 10;

DO $$ BEGIN RAISE NOTICE ''; END $$;

-- Table: users
DO $$ BEGIN RAISE NOTICE '--- USERS ---'; END $$;
SELECT
  'users' as table_name,
  COUNT(*) as total_count,
  COUNT(tenant_id) as with_tenant_id,
  COUNT(*) - COUNT(tenant_id) as null_tenant_id
FROM users;

SELECT
  role,
  COUNT(*) as count,
  COUNT(tenant_id) as with_tenant_id
FROM users
GROUP BY role
ORDER BY count DESC;

DO $$ BEGIN RAISE NOTICE ''; END $$;

-- Table: conversations
DO $$ BEGIN RAISE NOTICE '--- CONVERSATIONS ---'; END $$;
SELECT
  'conversations' as table_name,
  COUNT(*) as total_count,
  COUNT(tenant_id) as with_tenant_id,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM conversations;

DO $$ BEGIN RAISE NOTICE ''; END $$;

-- Table: messages
DO $$ BEGIN RAISE NOTICE '--- MESSAGES ---'; END $$;
SELECT
  'messages' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as user_messages,
  COUNT(CASE WHEN role = 'assistant' THEN 1 END) as assistant_messages
FROM messages;

DO $$ BEGIN RAISE NOTICE ''; END $$;

-- Check for tables mentioned in code
DO $$ BEGIN RAISE NOTICE '--- CHECKING FOR EXPECTED TABLES ---'; END $$;
SELECT
  table_name,
  CASE
    WHEN table_name IN ('agents', 'tools', 'prompts', 'knowledge_base', 'knowledge_domains',
                        'knowledge_sources', 'users', 'tenants', 'conversations', 'messages',
                        'tool_categories', 'agent_tool_assignments')
    THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'agents', 'tools', 'prompts', 'knowledge_base', 'knowledge_domains',
    'knowledge_sources', 'users', 'tenants', 'conversations', 'messages',
    'tool_categories', 'agent_tool_assignments',
    'chat_messages', 'business_functions', 'departments',
    'organizational_roles', 'organizational_levels', 'org_departments',
    'suite_functions', 'chat_sessions'
  )
ORDER BY table_name;

DO $$ BEGIN RAISE NOTICE ''; END $$;

-- Check for referential integrity issues
DO $$ BEGIN RAISE NOTICE '--- REFERENTIAL INTEGRITY CHECK ---'; END $$;

-- Agents with invalid tenant_id
SELECT
  'agents_invalid_tenant' as issue,
  COUNT(*) as count
FROM agents a
LEFT JOIN tenants t ON a.tenant_id = t.id
WHERE a.tenant_id IS NOT NULL AND t.id IS NULL;

-- Tools with invalid category_id
SELECT
  'tools_invalid_category' as issue,
  COUNT(*) as count
FROM tools t
LEFT JOIN tool_categories tc ON t.category_id = tc.id
WHERE t.category_id IS NOT NULL AND tc.id IS NULL;

-- Agent tool assignments with invalid references
SELECT
  'agent_tools_invalid_agent' as issue,
  COUNT(*) as count
FROM agent_tool_assignments ata
LEFT JOIN agents a ON ata.agent_id = a.id
WHERE a.id IS NULL;

SELECT
  'agent_tools_invalid_tool' as issue,
  COUNT(*) as count
FROM agent_tool_assignments ata
LEFT JOIN tools t ON ata.tool_id = t.id
WHERE t.id IS NULL;

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================';
    RAISE NOTICE 'PRE-MIGRATION VALIDATION COMPLETE';
    RAISE NOTICE '================================';
END $$;

-- Return summary statistics
SELECT
  'PRE-MIGRATION SUMMARY' as report_type,
  (SELECT COUNT(*) FROM tenants) as tenants,
  (SELECT COUNT(*) FROM agents) as agents,
  (SELECT COUNT(*) FROM tools) as tools,
  (SELECT COUNT(*) FROM prompts) as prompts,
  (SELECT COUNT(*) FROM knowledge_base) as knowledge_chunks,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM conversations) as conversations,
  (SELECT COUNT(*) FROM messages) as messages,
  now() as generated_at;

-- Save to migration tracking table
CREATE TABLE IF NOT EXISTS migration_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  migration_name TEXT NOT NULL,
  phase TEXT NOT NULL,
  status TEXT NOT NULL, -- 'started', 'completed', 'failed', 'rolled_back'
  metrics JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

INSERT INTO migration_tracking (migration_name, phase, status, metrics)
VALUES (
  'multi_tenant_migration',
  'pre_validation',
  'completed',
  jsonb_build_object(
    'tenants', (SELECT COUNT(*) FROM tenants),
    'agents', (SELECT COUNT(*) FROM agents),
    'tools', (SELECT COUNT(*) FROM tools),
    'prompts', (SELECT COUNT(*) FROM prompts),
    'knowledge_chunks', (SELECT COUNT(*) FROM knowledge_base)
  )
);
