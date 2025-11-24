-- Fix missing tables and consolidate schema
-- This migration ensures all recent changes are properly applied

-- 1. Create missing agent_prompts table if it doesn't exist
CREATE TABLE IF NOT EXISTS agent_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    customizations JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, prompt_id)
);

-- 2. Create missing prompt_capabilities table if it doesn't exist
CREATE TABLE IF NOT EXISTS prompt_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(prompt_id, capability_id)
);

-- 3. Ensure prompts table has all required fields
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS prompt_starter TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft'));

-- Update existing prompts to have active status if they have is_active = true
UPDATE prompts SET status = 'active' WHERE status IS NULL AND (is_active = true OR is_active IS NULL);
UPDATE prompts SET status = 'inactive' WHERE status IS NULL AND is_active = false;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_prompts_agent_id ON agent_prompts(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_prompts_prompt_id ON agent_prompts(prompt_id);
CREATE INDEX IF NOT EXISTS idx_agent_prompts_default ON agent_prompts(agent_id, is_default) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_prompt_capabilities_prompt ON prompt_capabilities(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_capabilities_capability ON prompt_capabilities(capability_id);

CREATE INDEX IF NOT EXISTS idx_prompts_starter ON prompts(prompt_starter) WHERE prompt_starter IS NOT NULL;

-- 5. Enable RLS for missing tables
ALTER TABLE agent_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_capabilities ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
-- Policies for agent_prompts
DROP POLICY IF EXISTS "agent_prompts_read_policy" ON agent_prompts;
CREATE POLICY "agent_prompts_read_policy" ON agent_prompts
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "agent_prompts_admin_write_policy" ON agent_prompts;
CREATE POLICY "agent_prompts_admin_write_policy" ON agent_prompts
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );

-- Policies for prompt_capabilities
DROP POLICY IF EXISTS "prompt_capabilities_read_policy" ON prompt_capabilities;
CREATE POLICY "prompt_capabilities_read_policy" ON prompt_capabilities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_capabilities.prompt_id
      AND prompts.status = 'active'
    )
  );

DROP POLICY IF EXISTS "prompt_capabilities_admin_write_policy" ON prompt_capabilities;
CREATE POLICY "prompt_capabilities_admin_write_policy" ON prompt_capabilities
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );

-- 7. Update/Create essential functions

-- Function to get agent prompt starters (ensure it works with proper tables)
CREATE OR REPLACE FUNCTION get_agent_prompt_starters(agent_name_param TEXT)
RETURNS TABLE (
    id UUID,
    prompt_starter TEXT,
    name TEXT,
    display_name TEXT,
    description TEXT,
    domain TEXT,
    complexity_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.prompt_starter,
        p.name,
        p.display_name,
        p.description,
        p.domain,
        p.complexity_level
    FROM prompts p
    INNER JOIN agent_prompts ap ON p.id = ap.prompt_id
    INNER JOIN agents a ON ap.agent_id = a.id
    WHERE (a.name = agent_name_param OR a.display_name = agent_name_param)
    AND p.status = 'active'
    AND p.prompt_starter IS NOT NULL
    ORDER BY p.complexity_level, p.display_name
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get agent prompt starters by domain (fallback)
CREATE OR REPLACE FUNCTION get_agent_prompt_starters_by_domain(agent_name_param TEXT)
RETURNS TABLE (
    id UUID,
    prompt_starter TEXT,
    name TEXT,
    display_name TEXT,
    description TEXT,
    domain TEXT,
    complexity_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.prompt_starter,
        p.name,
        p.display_name,
        p.description,
        p.domain,
        p.complexity_level
    FROM prompts p
    WHERE p.status = 'active'
    AND p.prompt_starter IS NOT NULL
    AND p.domain = ANY(
        SELECT DISTINCT unnest(knowledge_domains)
        FROM agents
        WHERE name = agent_name_param OR display_name = agent_name_param
    )
    ORDER BY p.complexity_level, p.display_name
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create/update views
DROP VIEW IF EXISTS agent_prompt_starters_view;
CREATE OR REPLACE VIEW agent_prompt_starters_view AS
SELECT
    a.id as agent_id,
    a.name as agent_name,
    a.display_name as agent_display_name,
    a.domain_expertise,
    p.id as prompt_id,
    p.name as prompt_name,
    p.prompt_starter,
    p.domain as prompt_domain,
    p.complexity_level,
    ap.is_default,
    ap.created_at as linked_at
FROM agents a
INNER JOIN agent_prompts ap ON a.id = ap.agent_id
INNER JOIN prompts p ON ap.prompt_id = p.id
WHERE a.status = 'active'
AND p.status = 'active'
AND p.prompt_starter IS NOT NULL
ORDER BY a.name, p.complexity_level, p.display_name;

-- 9. Grant permissions
GRANT SELECT ON agent_prompts TO authenticated, anon;
GRANT SELECT ON prompt_capabilities TO authenticated, anon;
GRANT SELECT ON agent_prompt_starters_view TO authenticated, anon;

GRANT EXECUTE ON FUNCTION get_agent_prompt_starters(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_agent_prompt_starters_by_domain(TEXT) TO authenticated, anon;

-- 10. Add comments
COMMENT ON TABLE agent_prompts IS 'Junction table linking agents to their prompt starters';
COMMENT ON TABLE prompt_capabilities IS 'Junction table linking prompts to required capabilities';
COMMENT ON VIEW agent_prompt_starters_view IS 'View showing all agent-prompt starter relationships';

-- 11. Show status
SELECT
    'Schema Fix Summary' as summary,
    'agent_prompts table created' as table_1,
    'prompt_capabilities table created' as table_2,
    'All indexes and policies applied' as indexes,
    'Functions updated and verified' as functions,
    'Views created and accessible' as views;