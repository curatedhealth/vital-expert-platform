-- ============================================================================
-- Apply RLS Policies for Many-to-Many Agent-Tenant
-- ============================================================================

BEGIN;

-- Drop old single-tenant policies
DROP POLICY IF EXISTS "platform_agents_readable" ON public.agents;
DROP POLICY IF EXISTS "tenant_agents_writable" ON public.agents;
DROP POLICY IF EXISTS "tenant_agents_updatable" ON public.agents;
DROP POLICY IF EXISTS "tenant_agents_deletable" ON public.agents;
DROP POLICY IF EXISTS "authenticated_users_read_agents" ON public.agents;
DROP POLICY IF EXISTS "tenant_agents_insertable" ON public.agents;

-- NEW SELECT POLICY: Super Admin sees ALL agents
CREATE POLICY "super_admin_sees_all_agents"
ON public.agents FOR SELECT
TO authenticated
USING (
  -- Super admin sees everything
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
  )
  OR
  -- Regular users see agents mapped to their tenant
  EXISTS (
    SELECT 1 FROM public.tenant_agents ta
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ta.agent_id = agents.id
      AND ta.tenant_id = p.tenant_id
      AND ta.is_enabled = true
  )
);

-- INSERT POLICY
CREATE POLICY "users_can_create_agents"
ON public.agents FOR INSERT
TO authenticated
WITH CHECK (
  -- Any authenticated user can create agents
  -- Agent will be mapped to their tenant via tenant_agents table
  true
);

-- UPDATE POLICY
CREATE POLICY "users_can_update_accessible_agents"
ON public.agents FOR UPDATE
TO authenticated
USING (
  -- Can update if:
  -- 1. Super admin
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
  OR
  -- 2. Owner of the agent
  created_by = auth.uid()
  OR
  -- 3. Tenant admin with access to this agent
  EXISTS (
    SELECT 1
    FROM public.tenant_agents ta
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ta.agent_id = agents.id
      AND ta.tenant_id = p.tenant_id
      AND p.role IN ('admin', 'tenant_admin')
  )
)
WITH CHECK (true);

-- DELETE POLICY
CREATE POLICY "users_can_delete_owned_agents"
ON public.agents FOR DELETE
TO authenticated
USING (
  -- Super admin can delete anything
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
  OR
  -- Owner can delete their own agents
  created_by = auth.uid()
);

-- Enable RLS on tenant_agents
ALTER TABLE public.tenant_agents ENABLE ROW LEVEL SECURITY;

-- tenant_agents SELECT policy
DROP POLICY IF EXISTS "super_admin_sees_all_mappings" ON public.tenant_agents;
CREATE POLICY "super_admin_sees_all_mappings"
ON public.tenant_agents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
  OR
  -- Users see mappings for their tenant
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.tenant_id = tenant_agents.tenant_id
  )
);

-- tenant_agents WRITE policy
DROP POLICY IF EXISTS "admins_manage_tenant_mappings" ON public.tenant_agents;
CREATE POLICY "admins_manage_tenant_mappings"
ON public.tenant_agents FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.tenant_id = tenant_agents.tenant_id
      AND p.role IN ('admin', 'tenant_admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.tenant_id = tenant_agents.tenant_id
      AND p.role IN ('admin', 'tenant_admin', 'super_admin')
  )
);

COMMIT;

SELECT '✅ RLS policies applied successfully!' as status;
