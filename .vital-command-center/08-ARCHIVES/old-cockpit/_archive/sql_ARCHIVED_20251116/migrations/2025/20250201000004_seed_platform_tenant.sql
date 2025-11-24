-- ============================================================================
-- VITAL PLATFORM - SEED PLATFORM TENANT (Phase 7.1)
-- Migration: Create Platform Tenant & Assign Existing Resources
-- Version: 2.0.0
-- Date: 2025-02-01
-- ============================================================================
-- Purpose: Create platform tenant and assign all existing agents as shared
-- ============================================================================
-- Note: This migration is idempotent (checks for existing tenant first)
-- ============================================================================

-- ============================================================================
-- 1. CREATE PLATFORM TENANT (Super Admin)
-- ============================================================================

INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    subscription_tier,
    subscription_status,
    resource_access_config,
    features,
    config,
    status,
    activated_at,
    metadata
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,  -- Fixed UUID for platform tenant
    'VITAL Platform',
    'vital-platform',
    'www.vital.expert',
    'platform',
    'enterprise',
    'active',
    jsonb_build_object(
        'shared_resources', jsonb_build_object(
            'agents', true,
            'tools', true,
            'prompts', true,
            'rag', true,
            'capabilities', true,
            'workflows', true
        ),
        'custom_resources', jsonb_build_object(
            'agents', true,
            'rag', true,
            'workflows', true,
            'max_agents', 999999,
            'max_rag_storage_gb', 999999
        ),
        'sharing', jsonb_build_object(
            'can_share_resources', true,
            'can_receive_shared', false
        )
    ),
    jsonb_build_object(
        'rag_enabled', true,
        'expert_panels', true,
        'workflows', true,
        'analytics', true,
        'api_access', true,
        'white_label', false,
        'multi_model', true,
        'advanced_rag', true
    ),
    jsonb_build_object(
        'default_model', 'gpt-4',
        'max_concurrent_chats', 999,
        'retention_days', 365,
        'allowed_domains', '["vital.expert"]'::jsonb
    ),
    'active',
    NOW(),
    jsonb_build_object(
        'description', 'Platform tenant owning all shared resources',
        'created_by', 'migration',
        'migration_version', '20250201000004'
    )
)
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    domain = EXCLUDED.domain,
    type = EXCLUDED.type,
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_status = EXCLUDED.subscription_status,
    resource_access_config = EXCLUDED.resource_access_config,
    features = EXCLUDED.features,
    config = EXCLUDED.config,
    status = EXCLUDED.status,
    updated_at = NOW();

-- ============================================================================
-- 2. ASSIGN EXISTING AGENTS TO PLATFORM TENANT (MARK AS SHARED)
-- ============================================================================

-- Update all existing agents without tenant_id to be platform-owned and globally shared
UPDATE agents
SET
    tenant_id = '00000000-0000-0000-0000-000000000001'::UUID,  -- Platform tenant
    is_shared = true,
    sharing_mode = 'global',
    resource_type = 'platform',
    created_by_user_id = NULL  -- Platform-created, not user-created
WHERE
    tenant_id IS NULL  -- Agents created before multi-tenant migration
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::UUID;  -- Update if already set

-- Log how many agents were updated
DO $$
DECLARE
    v_updated_count INTEGER;
    v_platform_agents_count INTEGER;
BEGIN
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    -- Count platform agents
    SELECT COUNT(*) INTO v_platform_agents_count
    FROM agents
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::UUID
    AND is_shared = true;
    
    RAISE NOTICE 'Updated % existing agents to platform tenant', v_updated_count;
    RAISE NOTICE 'Total platform shared agents: %', v_platform_agents_count;
END $$;

-- ============================================================================
-- 3. CREATE HELPER FUNCTIONS FOR TENANT OPERATIONS
-- ============================================================================

-- Function: Grant platform admin role
CREATE OR REPLACE FUNCTION grant_platform_admin(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_roles (user_id, role, tenant_id)
    VALUES (p_user_id, 'platform_admin', NULL)
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;

    RAISE NOTICE 'Granted platform_admin role to user %', p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION grant_platform_admin IS 'Grants platform admin role to a user. Call this after user signup: SELECT grant_platform_admin(''user-uuid-here'')';

-- ============================================================================
-- 4. VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
    v_platform_tenant_id UUID;
    v_platform_agents_count INTEGER;
    v_platform_tools_count INTEGER;
    v_platform_prompts_count INTEGER;
BEGIN
    -- Get platform tenant ID
    SELECT id INTO v_platform_tenant_id
    FROM tenants
    WHERE slug = 'vital-platform'
    LIMIT 1;

    -- Count platform resources
    SELECT COUNT(*) INTO v_platform_agents_count
    FROM agents
    WHERE tenant_id = v_platform_tenant_id
    AND is_shared = true;

    -- Count tools (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tools') THEN
        SELECT COUNT(*) INTO v_platform_tools_count
        FROM tools
        WHERE tenant_id = v_platform_tenant_id
        AND is_shared = true;
    ELSE
        v_platform_tools_count := 0;
    END IF;

    -- Count prompts (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompts') THEN
        SELECT COUNT(*) INTO v_platform_prompts_count
        FROM prompts
        WHERE tenant_id = v_platform_tenant_id
        AND is_shared = true;
    ELSE
        v_platform_prompts_count := 0;
    END IF;

    -- Display results
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Migration 20250201000004: Seed Platform Tenant - COMPLETE';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Platform Tenant ID: %', v_platform_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Platform Shared Resources:';
    RAISE NOTICE '  - Agents: %', v_platform_agents_count;
    RAISE NOTICE '  - Tools: %', v_platform_tools_count;
    RAISE NOTICE '  - Prompts: %', v_platform_prompts_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Assign your user as platform admin:';
    RAISE NOTICE '     SELECT grant_platform_admin(''your-user-uuid'');';
    RAISE NOTICE '';
    RAISE NOTICE '  2. Test tenant isolation by setting tenant context:';
    RAISE NOTICE '     SELECT set_tenant_context(''%'');', v_platform_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
END $$;

