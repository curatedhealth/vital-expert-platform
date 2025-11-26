-- Migration: Create agent_capabilities junction table
-- Description: Links agents to their capabilities with proficiency levels
-- Capabilities are parents to skills - each capability groups related skills

-- Create agent_capabilities junction table
CREATE TABLE IF NOT EXISTS agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    proficiency_score DECIMAL(3,2) CHECK (proficiency_score >= 0 AND proficiency_score <= 1),
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, capability_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent_id ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_capability_id ON agent_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_primary ON agent_capabilities(agent_id) WHERE is_primary = true;

-- Add RLS policies
ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to agent_capabilities" ON agent_capabilities
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON agent_capabilities
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON agent_capabilities
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete for authenticated users" ON agent_capabilities
    FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_agent_capabilities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agent_capabilities_updated_at ON agent_capabilities;
CREATE TRIGGER trigger_agent_capabilities_updated_at
    BEFORE UPDATE ON agent_capabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_capabilities_updated_at();

-- Add comments
COMMENT ON TABLE agent_capabilities IS 'Junction table linking agents to their capabilities with proficiency levels. Capabilities are parent groupings of skills.';
COMMENT ON COLUMN agent_capabilities.proficiency_level IS 'Categorical proficiency: beginner, intermediate, advanced, expert';
COMMENT ON COLUMN agent_capabilities.proficiency_score IS 'Numeric proficiency score from 0.00 to 1.00';
COMMENT ON COLUMN agent_capabilities.is_primary IS 'Whether this is a primary/core capability for the agent';

