-- ============================================================================
-- VITAL Path - Agent RLS Policies Deployment Script
-- ============================================================================
--
-- This script enables Row Level Security for agents and related junction tables.
--
-- DEPLOYMENT ORDER:
--   1. Create RLS helper functions in PUBLIC schema (Supabase compatible)
--   2. Drop existing policies (if any)
--   3. Enable RLS on all tables
--   4. Create agents table policies
--   5. Create junction table policies
--   6. Create performance indexes
--
-- NOTE: Functions are created in PUBLIC schema because Supabase restricts
-- modifications to the AUTH schema. All functions use SECURITY DEFINER
-- to ensure they run with the definer's privileges.
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 0: CREATE RLS HELPER FUNCTIONS (PUBLIC Schema - Supabase Compatible)
-- ============================================================================
-- These functions extract tenant context from JWT claims
-- Using public schema because Supabase restricts the auth schema

-- Get tenant_id from JWT claims
CREATE OR REPLACE FUNCTION public.rls_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT NULLIF(
        COALESCE(
            current_setting('request.jwt.claims', true)::json->>'tenant_id',
            current_setting('request.jwt.claim.tenant_id', true)
        ),
        ''
    )::UUID;
$$;

-- Check if user is a tenant admin
CREATE OR REPLACE FUNCTION public.rls_is_tenant_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'role') = 'tenant_admin'
        OR (current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role') = 'tenant_admin',
        false
    );
$$;

-- Check if user is a system admin (service_role or system_admin)
CREATE OR REPLACE FUNCTION public.rls_is_system_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
        OR (current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role') = 'system_admin'
        OR (current_setting('request.jwt.claims', true)::json->>'role') = 'system_admin',
        false
    );
$$;

-- Grant execute permissions on RLS helper functions
GRANT EXECUTE ON FUNCTION public.rls_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rls_tenant_id() TO anon;
GRANT EXECUTE ON FUNCTION public.rls_tenant_id() TO service_role;

GRANT EXECUTE ON FUNCTION public.rls_is_tenant_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rls_is_tenant_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.rls_is_tenant_admin() TO service_role;

GRANT EXECUTE ON FUNCTION public.rls_is_system_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rls_is_system_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.rls_is_system_admin() TO service_role;

-- ============================================================================
-- STEP 1: DROP EXISTING POLICIES (Idempotent)
-- ============================================================================

-- Drop agents policies if they exist
DROP POLICY IF EXISTS "agents_select_tenant" ON agents;
DROP POLICY IF EXISTS "agents_select_public" ON agents;
DROP POLICY IF EXISTS "agents_select_shared" ON agents;
DROP POLICY IF EXISTS "agents_select_system" ON agents;
DROP POLICY IF EXISTS "agents_insert_tenant" ON agents;
DROP POLICY IF EXISTS "agents_insert_system" ON agents;
DROP POLICY IF EXISTS "agents_update_own" ON agents;
DROP POLICY IF EXISTS "agents_update_tenant_admin" ON agents;
DROP POLICY IF EXISTS "agents_update_system" ON agents;
DROP POLICY IF EXISTS "agents_delete_own" ON agents;
DROP POLICY IF EXISTS "agents_delete_tenant_admin" ON agents;
DROP POLICY IF EXISTS "agents_delete_system" ON agents;

-- Drop agent_prompt_starters policies
DROP POLICY IF EXISTS "agent_prompt_starters_select" ON agent_prompt_starters;
DROP POLICY IF EXISTS "agent_prompt_starters_insert" ON agent_prompt_starters;
DROP POLICY IF EXISTS "agent_prompt_starters_update" ON agent_prompt_starters;
DROP POLICY IF EXISTS "agent_prompt_starters_delete" ON agent_prompt_starters;

-- Drop agent_capabilities policies
DROP POLICY IF EXISTS "agent_capabilities_select" ON agent_capabilities;
DROP POLICY IF EXISTS "agent_capabilities_insert" ON agent_capabilities;
DROP POLICY IF EXISTS "agent_capabilities_update" ON agent_capabilities;
DROP POLICY IF EXISTS "agent_capabilities_delete" ON agent_capabilities;

-- Drop agent_skill_assignments policies
DROP POLICY IF EXISTS "agent_skill_assignments_select" ON agent_skill_assignments;
DROP POLICY IF EXISTS "agent_skill_assignments_insert" ON agent_skill_assignments;
DROP POLICY IF EXISTS "agent_skill_assignments_update" ON agent_skill_assignments;
DROP POLICY IF EXISTS "agent_skill_assignments_delete" ON agent_skill_assignments;

-- Drop agent_tool_assignments policies
DROP POLICY IF EXISTS "agent_tool_assignments_select" ON agent_tool_assignments;
DROP POLICY IF EXISTS "agent_tool_assignments_insert" ON agent_tool_assignments;
DROP POLICY IF EXISTS "agent_tool_assignments_update" ON agent_tool_assignments;
DROP POLICY IF EXISTS "agent_tool_assignments_delete" ON agent_tool_assignments;

-- ============================================================================
-- STEP 2: ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Enable RLS on agents table
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents FORCE ROW LEVEL SECURITY;

-- Enable RLS on junction tables
ALTER TABLE agent_prompt_starters ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_prompt_starters FORCE ROW LEVEL SECURITY;

ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capabilities FORCE ROW LEVEL SECURITY;

ALTER TABLE agent_skill_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_skill_assignments FORCE ROW LEVEL SECURITY;

ALTER TABLE agent_tool_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tool_assignments FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: AGENTS TABLE POLICIES
-- ============================================================================

-- Users can view agents in their own tenant
CREATE POLICY "agents_select_tenant"
ON agents
FOR SELECT
USING (
    tenant_id = public.rls_tenant_id()
    AND (
        -- Not private, or user is the creator
        is_private_to_user = false
        OR created_by = auth.uid()
    )
);

-- Users can view public agents from any tenant (read-only)
CREATE POLICY "agents_select_public"
ON agents
FOR SELECT
USING (
    is_public = true
);

-- Users can view shared agents from any tenant (read-only)
CREATE POLICY "agents_select_shared"
ON agents
FOR SELECT
USING (
    is_shared = true
);

-- System admins can view all agents
CREATE POLICY "agents_select_system"
ON agents
FOR SELECT
USING (
    public.rls_is_system_admin()
);

-- Users can create agents in their own tenant
CREATE POLICY "agents_insert_tenant"
ON agents
FOR INSERT
WITH CHECK (
    tenant_id = public.rls_tenant_id()
    AND created_by = auth.uid()
);

-- System admins can create agents for any tenant
CREATE POLICY "agents_insert_system"
ON agents
FOR INSERT
WITH CHECK (
    public.rls_is_system_admin()
);

-- Users can update agents they created
CREATE POLICY "agents_update_own"
ON agents
FOR UPDATE
USING (
    tenant_id = public.rls_tenant_id()
    AND created_by = auth.uid()
)
WITH CHECK (
    tenant_id = public.rls_tenant_id()
);

-- Tenant admins can update any agent in their tenant
CREATE POLICY "agents_update_tenant_admin"
ON agents
FOR UPDATE
USING (
    tenant_id = public.rls_tenant_id()
    AND public.rls_is_tenant_admin()
)
WITH CHECK (
    tenant_id = public.rls_tenant_id()
);

-- System admins can update any agent
CREATE POLICY "agents_update_system"
ON agents
FOR UPDATE
USING (
    public.rls_is_system_admin()
)
WITH CHECK (
    public.rls_is_system_admin()
);

-- Users can delete agents they created
CREATE POLICY "agents_delete_own"
ON agents
FOR DELETE
USING (
    tenant_id = public.rls_tenant_id()
    AND created_by = auth.uid()
);

-- Tenant admins can delete any agent in their tenant
CREATE POLICY "agents_delete_tenant_admin"
ON agents
FOR DELETE
USING (
    tenant_id = public.rls_tenant_id()
    AND public.rls_is_tenant_admin()
);

-- System admins can delete any agent
CREATE POLICY "agents_delete_system"
ON agents
FOR DELETE
USING (
    public.rls_is_system_admin()
);

-- ============================================================================
-- STEP 4: AGENT_PROMPT_STARTERS POLICIES
-- ============================================================================

-- SELECT: Can view prompt starters for agents user can access
CREATE POLICY "agent_prompt_starters_select"
ON agent_prompt_starters
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_prompt_starters.agent_id
        AND (
            a.tenant_id = public.rls_tenant_id()
            OR a.is_public = true
            OR a.is_shared = true
            OR public.rls_is_system_admin()
        )
    )
);

-- INSERT: Can add prompt starters to agents user owns/can edit
CREATE POLICY "agent_prompt_starters_insert"
ON agent_prompt_starters
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_prompt_starters.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_tenant_admin()
            OR public.rls_is_system_admin()
        )
    )
);

-- UPDATE: Same as insert
CREATE POLICY "agent_prompt_starters_update"
ON agent_prompt_starters
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_prompt_starters.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_tenant_admin()
            OR public.rls_is_system_admin()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_prompt_starters.agent_id
        AND a.tenant_id = public.rls_tenant_id()
    )
);

-- DELETE: Same as update
CREATE POLICY "agent_prompt_starters_delete"
ON agent_prompt_starters
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_prompt_starters.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_tenant_admin()
            OR public.rls_is_system_admin()
        )
    )
);

-- ============================================================================
-- STEP 5: AGENT_CAPABILITIES POLICIES
-- ============================================================================

-- SELECT: Can view capabilities for agents user can access
CREATE POLICY "agent_capabilities_select"
ON agent_capabilities
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_capabilities.agent_id
        AND (
            a.tenant_id = public.rls_tenant_id()
            OR a.is_public = true
            OR a.is_shared = true
            OR public.rls_is_system_admin()
        )
    )
);

-- INSERT: Can add capabilities to agents user owns/can edit
CREATE POLICY "agent_capabilities_insert"
ON agent_capabilities
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_capabilities.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_tenant_admin()
            OR public.rls_is_system_admin()
        )
    )
);

-- UPDATE: Same as insert
CREATE POLICY "agent_capabilities_update"
ON agent_capabilities
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_capabilities.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_tenant_admin()
            OR public.rls_is_system_admin()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_capabilities.agent_id
        AND a.tenant_id = public.rls_tenant_id()
    )
);

-- DELETE: Same as update
CREATE POLICY "agent_capabilities_delete"
ON agent_capabilities
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_capabilities.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_tenant_admin()
            OR public.rls_is_system_admin()
        )
    )
);

-- ============================================================================
-- STEP 6: AGENT_SKILL_ASSIGNMENTS POLICIES
-- ============================================================================

-- SELECT: Can view skill assignments for agents user can access
CREATE POLICY "agent_skill_assignments_select"
ON agent_skill_assignments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_skill_assignments.agent_id
        AND (
            a.tenant_id = public.rls_tenant_id()
            OR a.is_public = true
            OR a.is_shared = true
            OR public.rls_is_system_admin()
        )
    )
);

-- INSERT: Can add skills to agents user owns/can edit
CREATE POLICY "agent_skill_assignments_insert"
ON agent_skill_assignments
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_skill_assignments.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_tenant_admin()
            OR public.rls_is_system_admin()
        )
    )
);

-- UPDATE: Same as insert
CREATE POLICY "agent_skill_assignments_update"
ON agent_skill_assignments
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_skill_assignments.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_tenant_admin()
            OR public.rls_is_system_admin()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_skill_assignments.agent_id
        AND a.tenant_id = public.rls_tenant_id()
    )
);

-- DELETE: Same as update
CREATE POLICY "agent_skill_assignments_delete"
ON agent_skill_assignments
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_skill_assignments.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_tenant_admin()
            OR public.rls_is_system_admin()
        )
    )
);

-- ============================================================================
-- STEP 7: AGENT_TOOL_ASSIGNMENTS POLICIES
-- ============================================================================

-- SELECT: Can view tool assignments for agents user can access
CREATE POLICY "agent_tool_assignments_select"
ON agent_tool_assignments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_tool_assignments.agent_id
        AND (
            a.tenant_id = public.rls_tenant_id()
            OR a.is_public = true
            OR a.is_shared = true
            OR public.rls_is_system_admin()
        )
    )
);

-- INSERT: Can add tools to agents user owns/can edit
CREATE POLICY "agent_tool_assignments_insert"
ON agent_tool_assignments
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_tool_assignments.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_system_admin()
            OR public.rls_is_tenant_admin()
        )
    )
);

-- UPDATE: Same as insert
CREATE POLICY "agent_tool_assignments_update"
ON agent_tool_assignments
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_tool_assignments.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_tenant_admin()
            OR public.rls_is_system_admin()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_tool_assignments.agent_id
        AND a.tenant_id = public.rls_tenant_id()
    )
);

-- DELETE: Same as update
CREATE POLICY "agent_tool_assignments_delete"
ON agent_tool_assignments
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_tool_assignments.agent_id
        AND a.tenant_id = public.rls_tenant_id()
        AND (
            a.created_by = auth.uid()
            OR public.rls_is_tenant_admin()
            OR public.rls_is_system_admin()
        )
    )
);

-- ============================================================================
-- STEP 8: PERFORMANCE INDEXES
-- ============================================================================

-- Indexes for agents table
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agents_visibility ON agents(is_public, is_shared) WHERE is_public = true OR is_shared = true;
CREATE INDEX IF NOT EXISTS idx_agents_tenant_user ON agents(tenant_id, created_by);
CREATE INDEX IF NOT EXISTS idx_agents_private ON agents(tenant_id, created_by, is_private_to_user) WHERE is_private_to_user = true;
CREATE INDEX IF NOT EXISTS idx_agents_tenant_status ON agents(tenant_id, status) WHERE status = 'active';

-- Indexes for junction tables
CREATE INDEX IF NOT EXISTS idx_agent_prompt_starters_agent_id ON agent_prompt_starters(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent_id ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_skill_assignments_agent_id ON agent_skill_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tool_assignments_agent_id ON agent_tool_assignments(agent_id);

COMMIT;

-- ============================================================================
-- VERIFICATION QUERY (Run after deployment)
-- ============================================================================
-- SELECT
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd
-- FROM pg_policies
-- WHERE tablename LIKE 'agent%'
-- ORDER BY tablename, cmd;

-- ============================================================================
-- HELPER FUNCTION VERIFICATION
-- ============================================================================
-- SELECT
--     routine_schema,
--     routine_name,
--     routine_type
-- FROM information_schema.routines
-- WHERE routine_name LIKE 'rls_%'
-- ORDER BY routine_name;
