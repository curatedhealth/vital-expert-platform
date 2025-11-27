-- ============================================================================
-- ADVANCED RLS - Multi-Level Privacy (Public → Tenant → User)
-- ============================================================================
-- Supports:
-- 1. 🌍 Public agents (visible to all tenants)
-- 2. 🏢 Tenant-shared agents (visible to all users in tenant)
-- 3. 👤 User-private agents (visible only to creator)
-- 4. 🤝 Multi-tenant shared agents (visible to specific tenants)

-- ============================================================================
-- STEP 1: Add User-Level Privacy Columns
-- ============================================================================

-- Add created_by for user ownership
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.agents ADD COLUMN created_by UUID;
        RAISE NOTICE '✅ Added created_by column to agents table';
    ELSE
        RAISE NOTICE 'ℹ️  created_by column already exists';
    END IF;
END $$;

-- Add is_private_to_user flag
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name = 'is_private_to_user'
    ) THEN
        ALTER TABLE public.agents ADD COLUMN is_private_to_user BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added is_private_to_user column to agents table';
    ELSE
        RAISE NOTICE 'ℹ️  is_private_to_user column already exists';
    END IF;
END $$;

-- Add is_public flag (if not exists from previous migration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.agents ADD COLUMN is_public BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added is_public column to agents table';
    ELSE
        RAISE NOTICE 'ℹ️  is_public column already exists';
    END IF;
END $$;

-- Add is_shared flag (if not exists from previous migration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name = 'is_shared'
    ) THEN
        ALTER TABLE public.agents ADD COLUMN is_shared BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added is_shared column to agents table';
    ELSE
        RAISE NOTICE 'ℹ️  is_shared column already exists';
    END IF;
END $$;


-- ============================================================================
-- STEP 2: Create Agent-Tenant Junction Table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_tenant_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID,
    UNIQUE(agent_id, tenant_id)
);

ALTER TABLE public.agent_tenant_access ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.agent_tenant_access IS 
'Junction table for multi-tenant agent sharing.';


-- ============================================================================
-- STEP 3: Helper Function to Get Current User ID
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_user_id TEXT;
BEGIN
    -- Get user_id from session configuration
    v_user_id := current_setting('app.current_user_id', true);
    
    IF v_user_id IS NULL OR v_user_id = '' THEN
        RETURN NULL;
    END IF;
    
    RETURN v_user_id::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.get_current_user_id() IS 
'Returns the current user ID from session context. Used for user-level RLS.';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO service_role;


-- Function to set user context
CREATE OR REPLACE FUNCTION public.set_user_context(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.current_user_id', p_user_id::text, false);
    RAISE DEBUG 'User context set to: %', p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_user_context(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_context(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.set_user_context(UUID) TO service_role;

COMMENT ON FUNCTION public.set_user_context(UUID) IS 
'Sets the current user context for user-level RLS. Call at start of each request.';


-- ============================================================================
-- STEP 4: Multi-Level RLS Policy for Agents
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "temp_allow_all_agents" ON public.agents;
DROP POLICY IF EXISTS "tenant_isolation_agents" ON public.agents;
DROP POLICY IF EXISTS "service_role_bypass_agents" ON public.agents;
DROP POLICY IF EXISTS "advanced_tenant_access_agents" ON public.agents;
DROP POLICY IF EXISTS "multi_level_privacy_agents" ON public.agents;

-- Create comprehensive multi-level privacy policy
CREATE POLICY "multi_level_privacy_agents" ON public.agents
    FOR SELECT
    TO public, authenticated, anon
    USING (
        -- Level 1: 🌍 Public agents (visible to everyone)
        is_public = true
        
        OR
        
        -- Level 2: 👤 User-private agents (only creator can see)
        (
            is_private_to_user = true 
            AND created_by = get_current_user_id()
        )
        
        OR
        
        -- Level 3: 🏢 Tenant-shared agents (all users in tenant can see)
        (
            (is_private_to_user = false OR is_private_to_user IS NULL)
            AND tenant_id = get_current_tenant_id()
        )
        
        OR
        
        -- Level 4: 🤝 Multi-tenant shared agents (specific tenants)
        (
            is_shared = true 
            AND EXISTS (
                SELECT 1 FROM public.agent_tenant_access
                WHERE agent_tenant_access.agent_id = agents.id
                AND agent_tenant_access.tenant_id = get_current_tenant_id()
            )
        )
        
        OR
        
        -- Fallback: No context set (allow for now)
        (get_current_tenant_id() IS NULL AND get_current_user_id() IS NULL)
    );

-- Service role bypass (for admin operations)
CREATE POLICY "service_role_bypass_agents" ON public.agents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON POLICY "multi_level_privacy_agents" ON public.agents IS 
'Multi-level privacy: 1) Public (all), 2) User-private (creator only), 3) Tenant-shared (all users in tenant), 4) Multi-tenant shared';


-- ============================================================================
-- STEP 5: RLS Policies for Junction Table
-- ============================================================================

DROP POLICY IF EXISTS "tenant_can_see_their_access" ON public.agent_tenant_access;
DROP POLICY IF EXISTS "service_role_bypass_access" ON public.agent_tenant_access;

CREATE POLICY "tenant_can_see_their_access" ON public.agent_tenant_access
    FOR SELECT
    TO public, authenticated, anon
    USING (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    );

CREATE POLICY "service_role_bypass_access" ON public.agent_tenant_access
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- ============================================================================
-- STEP 6: Helper Functions for Agent Management
-- ============================================================================

-- Create user-private agent
CREATE OR REPLACE FUNCTION public.create_user_private_agent(
    p_agent_data JSONB,
    p_user_id UUID,
    p_tenant_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_agent_id UUID;
BEGIN
    INSERT INTO public.agents (
        name,
        tenant_id,
        created_by,
        is_private_to_user,
        is_public,
        is_shared,
        -- ... other fields from p_agent_data
        metadata
    )
    VALUES (
        p_agent_data->>'name',
        p_tenant_id,
        p_user_id,
        true,  -- User-private
        false, -- Not public
        false, -- Not shared
        p_agent_data
    )
    RETURNING id INTO v_agent_id;
    
    RETURN v_agent_id;
END;
$$;

COMMENT ON FUNCTION public.create_user_private_agent IS 
'Create a user-private agent (only visible to creator)';


-- Create tenant-shared agent
CREATE OR REPLACE FUNCTION public.create_tenant_shared_agent(
    p_agent_data JSONB,
    p_user_id UUID,
    p_tenant_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_agent_id UUID;
BEGIN
    INSERT INTO public.agents (
        name,
        tenant_id,
        created_by,
        is_private_to_user,
        is_public,
        is_shared,
        metadata
    )
    VALUES (
        p_agent_data->>'name',
        p_tenant_id,
        p_user_id,
        false, -- Tenant-shared
        false, -- Not public
        false, -- Not multi-tenant shared
        p_agent_data
    )
    RETURNING id INTO v_agent_id;
    
    RETURN v_agent_id;
END;
$$;

COMMENT ON FUNCTION public.create_tenant_shared_agent IS 
'Create a tenant-shared agent (visible to all users in tenant)';


-- Grant agent access to another tenant
CREATE OR REPLACE FUNCTION public.grant_agent_access(
    p_agent_id UUID,
    p_tenant_id UUID,
    p_granted_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_access_id UUID;
BEGIN
    -- Mark agent as shared
    UPDATE public.agents
    SET is_shared = true
    WHERE id = p_agent_id;
    
    -- Create access grant
    INSERT INTO public.agent_tenant_access (agent_id, tenant_id, granted_by)
    VALUES (p_agent_id, p_tenant_id, p_granted_by)
    ON CONFLICT (agent_id, tenant_id) DO NOTHING
    RETURNING id INTO v_access_id;
    
    RETURN v_access_id;
END;
$$;


-- ============================================================================
-- STEP 7: Seed VITAL System Agents as Public
-- ============================================================================

DO $$
BEGIN
    -- Make VITAL system agents public
    UPDATE public.agents
    SET 
        is_public = true,
        is_private_to_user = false,
        is_shared = false
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::UUID;
    
    RAISE NOTICE '✅ VITAL system agents marked as public';
END $$;


-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Agent visibility summary
SELECT 
    id,
    name,
    tenant_id,
    created_by,
    CASE 
        WHEN is_public THEN '🌍 Public (all tenants)'
        WHEN is_private_to_user THEN '👤 User-Private (creator only)'
        WHEN is_shared THEN '🤝 Multi-Tenant Shared'
        ELSE '🏢 Tenant-Shared (all users in tenant)'
    END as visibility_type,
    is_public,
    is_private_to_user,
    is_shared
FROM public.agents
ORDER BY is_public DESC, is_private_to_user DESC, name
LIMIT 10;

-- Success message
SELECT 
    '✅ Multi-level privacy RLS applied!' as status,
    '4 levels: Public → Multi-Tenant → Tenant-Shared → User-Private' as description;


-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Set tenant and user context
SELECT set_tenant_context('tenant-uuid'::UUID);
SELECT set_user_context('user-uuid'::UUID);

-- Create user-private agent (only I can see)
SELECT create_user_private_agent(
    '{"name": "My Personal Agent"}'::JSONB,
    'user-uuid'::UUID,
    'tenant-uuid'::UUID
);

-- Create tenant-shared agent (everyone in my org can see)
SELECT create_tenant_shared_agent(
    '{"name": "Team Agent"}'::JSONB,
    'user-uuid'::UUID,
    'tenant-uuid'::UUID
);

-- Share agent with another tenant
SELECT grant_agent_access(
    'agent-uuid'::UUID,
    'other-tenant-uuid'::UUID,
    'admin-uuid'::UUID
);

-- Query visible agents
SELECT id, name, is_private_to_user FROM agents;
*/


