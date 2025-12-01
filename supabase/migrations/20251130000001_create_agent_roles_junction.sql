-- Migration: Create agent_roles junction table
-- Date: 2025-11-30
-- Description: Links AI agents to organizational roles they can assist

-- Create agent_roles junction table
CREATE TABLE IF NOT EXISTS public.agent_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,

    -- Relationship attributes
    relevance_score NUMERIC(3,2) DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Categorization
    use_case TEXT,  -- 'expert_consultation', 'task_automation', 'data_analysis', etc.

    -- Multi-tenant support
    tenant_id UUID REFERENCES public.tenants(id),

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'system',

    -- Unique constraint: one mapping per agent-role pair
    UNIQUE (agent_id, role_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_roles_agent_id ON public.agent_roles(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_role_id ON public.agent_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_tenant_id ON public.agent_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_is_active ON public.agent_roles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_agent_roles_is_primary ON public.agent_roles(is_primary) WHERE is_primary = TRUE;

-- Enable RLS
ALTER TABLE public.agent_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_roles
-- Service role bypass
DROP POLICY IF EXISTS "Service role bypass for agent_roles" ON public.agent_roles;
CREATE POLICY "Service role bypass for agent_roles"
    ON public.agent_roles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated users can read
DROP POLICY IF EXISTS "Authenticated users can read agent_roles" ON public.agent_roles;
CREATE POLICY "Authenticated users can read agent_roles"
    ON public.agent_roles
    FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

-- Grant permissions
GRANT SELECT ON public.agent_roles TO authenticated;
GRANT ALL ON public.agent_roles TO service_role;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_agent_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agent_roles_updated_at ON public.agent_roles;
CREATE TRIGGER trigger_agent_roles_updated_at
    BEFORE UPDATE ON public.agent_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_roles_updated_at();

-- Comment the table
COMMENT ON TABLE public.agent_roles IS 'Junction table mapping AI agents to organizational roles they can assist';
COMMENT ON COLUMN public.agent_roles.relevance_score IS 'How relevant this agent is for this role (0-1)';
COMMENT ON COLUMN public.agent_roles.is_primary IS 'Is this the primary agent for this role?';
COMMENT ON COLUMN public.agent_roles.use_case IS 'What this agent helps with for this role';
