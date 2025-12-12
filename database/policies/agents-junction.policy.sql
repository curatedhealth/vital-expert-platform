-- ============================================================================
-- VITAL Path - Agent Junction Tables RLS Policies
-- ============================================================================
--
-- RLS policies for agent-related junction tables:
-- - agent_prompt_starters: Prompt starters linked to agents
-- - agent_capabilities: Capability assignments
-- - agent_skill_assignments: Skill assignments
-- - agent_tool_assignments: Tool assignments
--
-- These tables inherit security from the parent agent table:
-- - If user can access the agent, they can access its junction data
-- - Modifications follow same rules as agent table
--
-- PREREQUISITES: Run tenants.policy.sql and agents.policy.sql first.
-- ============================================================================

-- ============================================================================
-- AGENT_PROMPT_STARTERS
-- ============================================================================

ALTER TABLE agent_prompt_starters ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_prompt_starters FORCE ROW LEVEL SECURITY;

-- SELECT: Can view prompt starters for agents user can access
CREATE POLICY "agent_prompt_starters_select"
ON agent_prompt_starters
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_prompt_starters.agent_id
        AND (
            -- User's tenant agents
            a.tenant_id = auth.tenant_id()
            -- OR public/shared agents
            OR a.is_public = true
            OR a.is_shared = true
            -- OR system admin
            OR auth.is_system_admin()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_prompt_starters.agent_id
        AND a.tenant_id = auth.tenant_id()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
        )
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_agent_prompt_starters_agent_id
ON agent_prompt_starters(agent_id);

-- ============================================================================
-- AGENT_CAPABILITIES
-- ============================================================================

ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capabilities FORCE ROW LEVEL SECURITY;

-- SELECT: Can view capabilities for agents user can access
CREATE POLICY "agent_capabilities_select"
ON agent_capabilities
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_capabilities.agent_id
        AND (
            a.tenant_id = auth.tenant_id()
            OR a.is_public = true
            OR a.is_shared = true
            OR auth.is_system_admin()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_capabilities.agent_id
        AND a.tenant_id = auth.tenant_id()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
        )
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent_id
ON agent_capabilities(agent_id);

-- ============================================================================
-- AGENT_SKILL_ASSIGNMENTS
-- ============================================================================

ALTER TABLE agent_skill_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_skill_assignments FORCE ROW LEVEL SECURITY;

-- SELECT: Can view skill assignments for agents user can access
CREATE POLICY "agent_skill_assignments_select"
ON agent_skill_assignments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_skill_assignments.agent_id
        AND (
            a.tenant_id = auth.tenant_id()
            OR a.is_public = true
            OR a.is_shared = true
            OR auth.is_system_admin()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_skill_assignments.agent_id
        AND a.tenant_id = auth.tenant_id()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
        )
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_agent_skill_assignments_agent_id
ON agent_skill_assignments(agent_id);

-- ============================================================================
-- AGENT_TOOL_ASSIGNMENTS
-- ============================================================================

ALTER TABLE agent_tool_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tool_assignments FORCE ROW LEVEL SECURITY;

-- SELECT: Can view tool assignments for agents user can access
CREATE POLICY "agent_tool_assignments_select"
ON agent_tool_assignments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_tool_assignments.agent_id
        AND (
            a.tenant_id = auth.tenant_id()
            OR a.is_public = true
            OR a.is_shared = true
            OR auth.is_system_admin()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM agents a
        WHERE a.id = agent_tool_assignments.agent_id
        AND a.tenant_id = auth.tenant_id()
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
        AND a.tenant_id = auth.tenant_id()
        AND (
            a.created_by = auth.uid()
            OR auth.is_tenant_admin()
            OR auth.is_system_admin()
        )
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_agent_tool_assignments_agent_id
ON agent_tool_assignments(agent_id);
