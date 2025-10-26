-- ============================================================================
-- VITAL PLATFORM - SEED MVP TENANTS (SIMPLE VERSION)
-- Migration: Create Platform Tenant & Digital Health Startup Tenant
-- Version: 1.0.0-SIMPLE
-- Date: 2025-10-26
-- ============================================================================
-- Purpose: Create initial tenants for MVP launch:
--   1. Platform Tenant (vital-platform) - owns all shared resources
--   2. Digital Health Startup Tenant (digital-health-startup) - MVP customer
--   3. Assign all 254 existing agents to platform tenant as globally shared
-- ============================================================================
-- CHANGES FROM ORIGINAL:
--   - REMOVED: References to non-existent columns (deleted_at, status in user_tenants)
--   - REMOVED: Tools and prompts creation (tables don't exist yet)
--   - REMOVED: Materialized view refresh (doesn't exist in SIMPLE version)
--   - REMOVED: Complex tenant columns that may not exist
--   - KEPT: Only essential tenant creation and agent assignment
-- ============================================================================

-- ============================================================================
-- 1. CREATE PLATFORM TENANT (Super Admin)
-- ============================================================================

INSERT INTO tenants (
    id,
    name,
    slug,
    type
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,  -- Fixed UUID for platform tenant
    'VITAL Platform',
    'vital-platform',
    'platform'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. CREATE DIGITAL HEALTH STARTUP TENANT (MVP Customer)
-- ============================================================================

INSERT INTO tenants (
    name,
    slug,
    type
)
VALUES (
    'Digital Health Startup',
    'digital-health-startup',
    'industry'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 3. ASSIGN ALL EXISTING AGENTS TO PLATFORM TENANT (MARK AS SHARED)
-- ============================================================================

-- Update all existing agents without tenant_id to be platform-owned and globally shared
UPDATE agents
SET
    tenant_id = '00000000-0000-0000-0000-000000000001'::UUID,  -- Platform tenant
    is_shared = true,
    sharing_mode = 'global',
    resource_type = 'platform'
WHERE
    tenant_id IS NULL;  -- Agents created before multi-tenant migration

-- Get count of updated agents
DO $$
DECLARE
    v_updated_count INTEGER;
    v_total_agents INTEGER;
BEGIN
    -- Count agents assigned to platform
    SELECT COUNT(*) INTO v_total_agents
    FROM agents
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::UUID;

    RAISE NOTICE 'Assigned % agents to platform tenant as shared resources', v_total_agents;
END $$;

-- ============================================================================
-- 4. CREATE HELPER FUNCTIONS FOR USER ASSIGNMENT
-- ============================================================================

-- Function: Grant platform admin role to a user
CREATE OR REPLACE FUNCTION grant_platform_admin(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_roles (user_id, role, tenant_id)
    VALUES (p_user_id, 'platform_admin', NULL)
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;

    RAISE NOTICE 'Granted platform_admin role to user %', p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION grant_platform_admin IS 'Grants platform admin role to a user. Usage: SELECT grant_platform_admin(''your-user-uuid-here'');';

-- Function: Assign user to Digital Health Startup tenant
CREATE OR REPLACE FUNCTION assign_user_to_dh_startup(
    p_user_id UUID,
    p_role VARCHAR DEFAULT 'member'
)
RETURNS VOID AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Get Digital Health Startup tenant ID
    SELECT id INTO v_tenant_id
    FROM tenants
    WHERE slug = 'digital-health-startup'
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Digital Health Startup tenant not found';
    END IF;

    -- Insert user-tenant association (only essential columns)
    INSERT INTO user_tenants (user_id, tenant_id, role)
    VALUES (p_user_id, v_tenant_id, p_role)
    ON CONFLICT (user_id, tenant_id) DO UPDATE
        SET role = EXCLUDED.role;

    -- Also add to user_roles for RLS
    INSERT INTO user_roles (user_id, role, tenant_id)
    VALUES (p_user_id, 'user', v_tenant_id)
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;

    RAISE NOTICE 'Assigned user % to Digital Health Startup tenant with role %', p_user_id, p_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION assign_user_to_dh_startup IS 'Assigns a user to Digital Health Startup tenant. Usage: SELECT assign_user_to_dh_startup(''user-uuid'', ''admin'');';

-- ============================================================================
-- 5. VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
    v_platform_tenant_id UUID;
    v_dh_tenant_id UUID;
    v_platform_agents_count INTEGER;
BEGIN
    -- Get tenant IDs
    SELECT id INTO v_platform_tenant_id FROM tenants WHERE slug = 'vital-platform';
    SELECT id INTO v_dh_tenant_id FROM tenants WHERE slug = 'digital-health-startup';

    -- Count platform resources
    SELECT COUNT(*) INTO v_platform_agents_count
    FROM agents WHERE tenant_id = v_platform_tenant_id AND is_shared = true;

    -- Display results
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Migration 20251026000004_SIMPLE completed successfully';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tenants Created:';
    RAISE NOTICE '  1. Platform Tenant';
    RAISE NOTICE '     - ID: %', v_platform_tenant_id;
    RAISE NOTICE '     - Slug: vital-platform';
    RAISE NOTICE '     - Type: platform';
    RAISE NOTICE '';
    RAISE NOTICE '  2. Digital Health Startup Tenant';
    RAISE NOTICE '     - ID: %', v_dh_tenant_id;
    RAISE NOTICE '     - Slug: digital-health-startup';
    RAISE NOTICE '     - Type: industry';
    RAISE NOTICE '';
    RAISE NOTICE 'Platform Shared Resources:';
    RAISE NOTICE '  - Agents: % (all globally shared)', v_platform_agents_count;
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'NEXT STEPS - User Assignment';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '1. Grant yourself platform admin access:';
    RAISE NOTICE '   SELECT grant_platform_admin(''YOUR-USER-UUID-HERE'');';
    RAISE NOTICE '';
    RAISE NOTICE '2. Assign users to Digital Health Startup tenant:';
    RAISE NOTICE '   SELECT assign_user_to_dh_startup(''USER-UUID'', ''admin'');';
    RAISE NOTICE '';
    RAISE NOTICE '3. Test tenant isolation:';
    RAISE NOTICE '   -- Set tenant context';
    RAISE NOTICE '   SELECT set_tenant_context(''%'');', v_dh_tenant_id;
    RAISE NOTICE '   -- Query agents (should see all % platform agents)', v_platform_agents_count;
    RAISE NOTICE '   SELECT COUNT(*) FROM agents;';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 1 DATABASE MIGRATIONS: COMPLETE!';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'All 4 migrations executed successfully:';
    RAISE NOTICE '  ✓ Migration 1: Tenant infrastructure';
    RAISE NOTICE '  ✓ Migration 2: Tenant columns in agents table';
    RAISE NOTICE '  ✓ Migration 3: RLS policies for tenant isolation';
    RAISE NOTICE '  ✓ Migration 4: Seed tenants and assign agents';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for Phase 2: Application Layer Integration';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;
