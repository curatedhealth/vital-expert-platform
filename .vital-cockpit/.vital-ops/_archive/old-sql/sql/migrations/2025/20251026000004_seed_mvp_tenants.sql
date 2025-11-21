-- ============================================================================
-- VITAL PLATFORM - SEED MVP TENANTS
-- Migration: Create Platform Tenant & Digital Health Startup Tenant
-- Version: 1.0.0
-- Date: 2025-10-26
-- ============================================================================
-- Purpose: Create initial tenants for MVP launch:
--   1. Platform Tenant (vital-platform) - owns all shared resources
--   2. Digital Health Startup Tenant (digital-health-startup) - MVP customer
--
-- Post-Migration: All existing agents will be owned by platform and shared globally
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
        'migration_version', '20251026000004'
    )
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. CREATE DIGITAL HEALTH STARTUP TENANT (MVP Customer)
-- ============================================================================

INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    subscription_tier,
    subscription_status,
    trial_ends_at,
    resource_access_config,
    features,
    config,
    quotas,
    industry,
    company_size,
    country_code,
    timezone,
    hipaa_compliant,
    gdpr_compliant,
    status,
    activated_at,
    metadata
)
VALUES (
    uuid_generate_v4(),
    'Digital Health Startup',
    'digital-health-startup',
    'digital-health-startup.vital.expert',
    'industry',
    'professional',
    'active',
    NOW() + INTERVAL '30 days',  -- 30-day trial
    jsonb_build_object(
        'shared_resources', jsonb_build_object(
            'agents', true,   -- Can access all platform agents
            'tools', true,    -- Can access all platform tools
            'prompts', true,  -- Can access all platform prompts
            'rag', true,      -- Can access platform RAG
            'capabilities', true,
            'workflows', true
        ),
        'custom_resources', jsonb_build_object(
            'agents', true,   -- Can create custom agents
            'rag', true,      -- Can create custom RAG sources
            'workflows', true,
            'max_agents', 50,           -- Limit: 50 custom agents
            'max_rag_storage_gb', 25    -- Limit: 25GB RAG storage
        ),
        'sharing', jsonb_build_object(
            'can_share_resources', false,  -- Cannot share resources (industry tier)
            'can_receive_shared', true     -- Can receive shared resources
        )
    ),
    jsonb_build_object(
        'rag_enabled', true,
        'expert_panels', true,
        'workflows', true,
        'analytics', true,
        'api_access', false,      -- No API access (professional tier)
        'white_label', false,
        'multi_model', true
    ),
    jsonb_build_object(
        'default_model', 'gpt-4',
        'max_concurrent_chats', 10,
        'retention_days', 90,
        'allowed_domains', '["digital-health-startup.vital.expert"]'::jsonb
    ),
    jsonb_build_object(
        'max_users', 100,
        'max_agents', 50,
        'max_documents', 10000,
        'max_api_calls_per_month', 0,  -- No API access
        'max_storage_gb', 25
    ),
    'Healthcare',
    'startup',
    'US',
    'America/New_York',
    false,  -- HIPAA pending certification
    true,   -- GDPR compliant
    'active',
    NOW(),
    jsonb_build_object(
        'description', 'MVP tenant for digital health startup industry vertical',
        'focus_areas', '["DTx Development", "FDA Regulatory", "Clinical Trials"]'::jsonb,
        'created_by', 'migration',
        'migration_version', '20251026000004'
    )
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 3. ASSIGN EXISTING AGENTS TO PLATFORM TENANT (MARK AS SHARED)
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
    AND deleted_at IS NULL;

-- Log how many agents were updated
DO $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RAISE NOTICE 'Assigned % existing agents to platform tenant as shared resources', v_updated_count;
END $$;

-- ============================================================================
-- 4. CREATE PLATFORM ADMIN USER ROLE
-- ============================================================================

-- This will need to be updated with actual user IDs after users are created
-- For now, create a placeholder function that can be called later

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
-- 5. ASSIGN USERS TO DIGITAL HEALTH STARTUP TENANT
-- ============================================================================

-- Create function to assign user to DH Startup tenant
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

    -- Insert user-tenant association
    INSERT INTO user_tenants (user_id, tenant_id, role, status, joined_at)
    VALUES (p_user_id, v_tenant_id, p_role, 'active', NOW())
    ON CONFLICT (user_id, tenant_id) DO UPDATE
        SET role = EXCLUDED.role,
            status = 'active';

    -- Also add to user_roles for RLS
    INSERT INTO user_roles (user_id, role, tenant_id)
    VALUES (p_user_id, 'user', v_tenant_id)
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;

    RAISE NOTICE 'Assigned user % to Digital Health Startup tenant with role %', p_user_id, p_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION assign_user_to_dh_startup IS 'Assigns a user to the Digital Health Startup tenant. Call after user signup.';

-- ============================================================================
-- 6. CREATE SAMPLE TOOLS FOR PLATFORM (Optional)
-- ============================================================================

-- Sample platform tools that all tenants can use
INSERT INTO tools (
    tenant_id,
    name,
    display_name,
    description,
    tool_type,
    category,
    is_shared,
    sharing_mode,
    resource_type,
    status,
    enabled
)
VALUES
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    'fda-database-search',
    'FDA Database Search',
    'Search FDA databases for regulatory information, guidance documents, and device classifications',
    'api',
    'Regulatory',
    true,
    'global',
    'platform',
    'active',
    true
),
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    'clinicaltrials-search',
    'ClinicalTrials.gov Search',
    'Search ClinicalTrials.gov database for clinical trial information',
    'api',
    'Clinical Research',
    true,
    'global',
    'platform',
    'active',
    true
),
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    'pubmed-search',
    'PubMed Literature Search',
    'Search PubMed for medical literature and research papers',
    'api',
    'Research',
    true,
    'global',
    'platform',
    'active',
    true
)
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ============================================================================
-- 7. CREATE SAMPLE PROMPTS FOR PLATFORM (Optional)
-- ============================================================================

INSERT INTO prompts (
    tenant_id,
    name,
    display_name,
    description,
    category,
    prompt_text,
    is_shared,
    sharing_mode,
    resource_type,
    status
)
VALUES
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    '510k-submission-review',
    '510(k) Submission Review',
    'Template for reviewing 510(k) premarket submissions',
    'Regulatory',
    'Analyze the following 510(k) submission materials and provide a comprehensive review covering: regulatory pathway suitability, predicate device comparison, substantial equivalence justification, and potential FDA questions.',
    true,
    'global',
    'platform',
    'active'
),
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    'clinical-protocol-analysis',
    'Clinical Trial Protocol Analysis',
    'Template for analyzing clinical trial protocols',
    'Clinical Research',
    'Review the following clinical trial protocol and assess: study design appropriateness, endpoint selection, sample size justification, statistical methods, and regulatory compliance.',
    true,
    'global',
    'platform',
    'active'
)
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ============================================================================
-- 8. REFRESH MATERIALIZED VIEW
-- ============================================================================

-- Refresh the platform shared resources materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_platform_shared_resources;

-- ============================================================================
-- 9. VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
    v_platform_tenant_id UUID;
    v_dh_tenant_id UUID;
    v_platform_agents_count INTEGER;
    v_platform_tools_count INTEGER;
    v_platform_prompts_count INTEGER;
BEGIN
    -- Get tenant IDs
    SELECT id INTO v_platform_tenant_id FROM tenants WHERE slug = 'vital-platform';
    SELECT id INTO v_dh_tenant_id FROM tenants WHERE slug = 'digital-health-startup';

    -- Count platform resources
    SELECT COUNT(*) INTO v_platform_agents_count
    FROM agents WHERE tenant_id = v_platform_tenant_id AND is_shared = true;

    SELECT COUNT(*) INTO v_platform_tools_count
    FROM tools WHERE tenant_id = v_platform_tenant_id AND is_shared = true;

    SELECT COUNT(*) INTO v_platform_prompts_count
    FROM prompts WHERE tenant_id = v_platform_tenant_id AND is_shared = true;

    -- Display results
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Migration 20251026000004 completed successfully';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Platform Tenant ID: %', v_platform_tenant_id;
    RAISE NOTICE 'Digital Health Startup Tenant ID: %', v_dh_tenant_id;
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
    RAISE NOTICE '  2. Assign users to Digital Health Startup tenant:';
    RAISE NOTICE '     SELECT assign_user_to_dh_startup(''user-uuid'', ''admin'');';
    RAISE NOTICE '';
    RAISE NOTICE '  3. Test tenant isolation by setting tenant context:';
    RAISE NOTICE '     SELECT set_tenant_context(''%'');', v_dh_tenant_id;
    RAISE NOTICE '     SELECT * FROM get_accessible_agents(''%'');', v_dh_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;
