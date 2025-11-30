-- ============================================================================
-- ADVANCED RLS FOR AGENTS - Multi-Tenant Sharing Support
-- ============================================================================
-- Supports:
-- 1. Public/Shared agents (visible to all tenants)
-- 2. Tenant-specific agents (only visible to owner)
-- 3. Multi-tenant agents (visible to specific tenants via junction table)

-- ============================================================================
-- STEP 1: Add Sharing Support Columns (if not exists)
-- ============================================================================

-- Add is_public flag for shared agents
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

-- Add is_shared flag for multi-tenant agents
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

-- Enable RLS on junction table
ALTER TABLE public.agent_tenant_access ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.agent_tenant_access IS 
'Junction table for multi-tenant agent sharing. Allows agents to be visible to specific tenants.';


-- ============================================================================
-- STEP 3: Advanced RLS Policy for Agents
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "temp_allow_all_agents" ON public.agents;
DROP POLICY IF EXISTS "tenant_isolation_agents" ON public.agents;
DROP POLICY IF EXISTS "service_role_bypass_agents" ON public.agents;
DROP POLICY IF EXISTS "advanced_tenant_access_agents" ON public.agents;

-- Create advanced multi-tenant policy
CREATE POLICY "advanced_tenant_access_agents" ON public.agents
    FOR SELECT  -- Start with SELECT only for safety
    TO public, authenticated, anon
    USING (
        -- Case 1: Public agents (visible to everyone)
        is_public = true
        
        OR
        
        -- Case 2: Agent owned by current tenant
        tenant_id = get_current_tenant_id()
        
        OR
        
        -- Case 3: Agent is shared and tenant has explicit access
        (
            is_shared = true 
            AND EXISTS (
                SELECT 1 FROM public.agent_tenant_access
                WHERE agent_tenant_access.agent_id = agents.id
                AND agent_tenant_access.tenant_id = get_current_tenant_id()
            )
        )
        
        OR
        
        -- Case 4: No tenant context set (allow for now)
        get_current_tenant_id() IS NULL
    );

-- Service role bypass (for admin operations)
CREATE POLICY "service_role_bypass_agents" ON public.agents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON POLICY "advanced_tenant_access_agents" ON public.agents IS 
'Multi-tenant agent access: 1) Public agents visible to all, 2) Tenant-owned agents, 3) Shared agents with explicit access';


-- ============================================================================
-- STEP 4: RLS Policy for Junction Table
-- ============================================================================

DROP POLICY IF EXISTS "tenant_can_see_their_access" ON public.agent_tenant_access;
DROP POLICY IF EXISTS "service_role_bypass_access" ON public.agent_tenant_access;

-- Tenants can see their own access grants
CREATE POLICY "tenant_can_see_their_access" ON public.agent_tenant_access
    FOR SELECT
    TO public, authenticated, anon
    USING (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    );

-- Service role can manage all access
CREATE POLICY "service_role_bypass_access" ON public.agent_tenant_access
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- ============================================================================
-- STEP 5: Helper Functions
-- ============================================================================

-- Function to grant agent access to a tenant
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
    -- First, mark agent as shared
    UPDATE public.agents
    SET is_shared = true
    WHERE id = p_agent_id;
    
    -- Then create access grant
    INSERT INTO public.agent_tenant_access (agent_id, tenant_id, granted_by)
    VALUES (p_agent_id, p_tenant_id, p_granted_by)
    ON CONFLICT (agent_id, tenant_id) DO NOTHING
    RETURNING id INTO v_access_id;
    
    RETURN v_access_id;
END;
$$;

COMMENT ON FUNCTION public.grant_agent_access IS 
'Grant a tenant access to a shared agent. Automatically marks agent as shared.';


-- Function to revoke agent access
CREATE OR REPLACE FUNCTION public.revoke_agent_access(
    p_agent_id UUID,
    p_tenant_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.agent_tenant_access
    WHERE agent_id = p_agent_id
    AND tenant_id = p_tenant_id;
    
    -- If no more tenants have access, unmark as shared
    IF NOT EXISTS (
        SELECT 1 FROM public.agent_tenant_access
        WHERE agent_id = p_agent_id
    ) THEN
        UPDATE public.agents
        SET is_shared = false
        WHERE id = p_agent_id;
    END IF;
    
    RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION public.revoke_agent_access IS 
'Revoke a tenant''s access to a shared agent. Auto-unmarks agent as shared if no more tenants have access.';


-- ============================================================================
-- STEP 6: Seed Data for VITAL System (Master Tenant)
-- ============================================================================

-- Make VITAL system agents public by default
DO $$
BEGIN
    -- Update existing VITAL system agents to be public
    UPDATE public.agents
    SET is_public = true
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::UUID;
    
    RAISE NOTICE '✅ Marked VITAL system agents as public';
END $$;


-- ============================================================================
-- VERIFICATION & TESTING
-- ============================================================================

-- View agent visibility summary
SELECT 
    id,
    name,
    tenant_id,
    is_public,
    is_shared,
    CASE 
        WHEN is_public THEN '🌍 Public (all tenants)'
        WHEN is_shared THEN '🤝 Shared (specific tenants)'
        ELSE '🔒 Private (owner only)'
    END as visibility_type,
    (SELECT COUNT(*) FROM public.agent_tenant_access WHERE agent_id = agents.id) as shared_with_count
FROM public.agents
ORDER BY is_public DESC, is_shared DESC, name
LIMIT 10;

-- View sharing configuration
SELECT 
    a.name as agent_name,
    a.tenant_id as owner_tenant,
    ata.tenant_id as granted_to_tenant,
    ata.granted_at
FROM public.agents a
JOIN public.agent_tenant_access ata ON ata.agent_id = a.id
ORDER BY a.name, ata.granted_at DESC
LIMIT 10;

-- Success message
SELECT 
    '✅ Advanced multi-tenant RLS applied!' as status,
    'Agents can now be: Public, Private, or Shared' as description;


-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Make an agent public (visible to all tenants)
UPDATE agents SET is_public = true WHERE id = 'agent-uuid';

-- Share an agent with specific tenant
SELECT grant_agent_access(
    'agent-uuid'::UUID,
    'tenant-uuid'::UUID,
    'admin-user-uuid'::UUID
);

-- Revoke access
SELECT revoke_agent_access('agent-uuid'::UUID, 'tenant-uuid'::UUID);

-- Make an agent private again
UPDATE agents SET is_public = false, is_shared = false WHERE id = 'agent-uuid';
DELETE FROM agent_tenant_access WHERE agent_id = 'agent-uuid';

-- Test visibility as a tenant
SELECT set_tenant_context('tenant-uuid'::UUID);
SELECT id, name, is_public, is_shared FROM agents;
*/





