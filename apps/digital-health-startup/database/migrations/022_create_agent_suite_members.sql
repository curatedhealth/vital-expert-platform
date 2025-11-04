-- ============================================================================
-- Migration: Create Agent Suite Mapping Table
-- Description: Create a proper mapping between AI agents and agent suites
-- Note: dh_agent_suite_member references dh_role (humans), so we need a new table
-- ============================================================================

-- Step 1: Create new table for AI agent suite membership
CREATE TABLE IF NOT EXISTS agent_suite_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  suite_id uuid NOT NULL REFERENCES dh_agent_suite(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT agent_suite_members_unique UNIQUE (suite_id, agent_id)
);

-- Step 2: Add RLS policies
ALTER TABLE agent_suite_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agent suite members from their tenant"
  ON agent_suite_members FOR SELECT
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid OR tenant_id = '11111111-1111-1111-1111-111111111111'::uuid);

CREATE POLICY "Users can manage agent suite members in their tenant"
  ON agent_suite_members FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Step 3: Add indexes
CREATE INDEX idx_agent_suite_members_suite_id ON agent_suite_members(suite_id);
CREATE INDEX idx_agent_suite_members_agent_id ON agent_suite_members(agent_id);
CREATE INDEX idx_agent_suite_members_tenant_id ON agent_suite_members(tenant_id);
CREATE INDEX idx_agent_suite_members_position ON agent_suite_members(suite_id, position);

-- Step 4: Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_agent_suite_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_suite_members_updated_at
  BEFORE UPDATE ON agent_suite_members
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_suite_members_updated_at();

-- Step 5: Populate with AI agents for each suite
-- Clinical Excellence Suite
INSERT INTO agent_suite_members (tenant_id, suite_id, agent_id, position, is_primary)
SELECT 
  '11111111-1111-1111-1111-111111111111'::uuid,
  (SELECT id FROM dh_agent_suite WHERE unique_id = 'AST-CLINICAL-EXCELLENCE'),
  a.id,
  ROW_NUMBER() OVER (ORDER BY a.popularity_score DESC, a.rating DESC) - 1,
  ROW_NUMBER() OVER (ORDER BY a.popularity_score DESC, a.rating DESC) = 1
FROM agents a
WHERE a.slug IN (
  'clinical-trial-designer',
  'clinical-protocol-writer',
  'clinical-operations-coordinator',
  'medical-monitor',
  'clinical-data-manager'
)
AND a.is_active = true
ON CONFLICT (suite_id, agent_id) DO NOTHING;

-- Regulatory Fast Track Suite
INSERT INTO agent_suite_members (tenant_id, suite_id, agent_id, position, is_primary)
SELECT 
  '11111111-1111-1111-1111-111111111111'::uuid,
  (SELECT id FROM dh_agent_suite WHERE unique_id = 'AST-REGULATORY-FAST-TRACK'),
  a.id,
  ROW_NUMBER() OVER (ORDER BY a.popularity_score DESC, a.rating DESC) - 1,
  ROW_NUMBER() OVER (ORDER BY a.popularity_score DESC, a.rating DESC) = 1
FROM agents a
WHERE a.slug IN (
  'fda-regulatory-strategist',
  'breakthrough-therapy-advisor',
  'hipaa-compliance-officer',
  'advanced-therapy-regulatory-expert'
)
AND a.is_active = true
ON CONFLICT (suite_id, agent_id) DO NOTHING;

-- Market Launch Suite
INSERT INTO agent_suite_members (tenant_id, suite_id, agent_id, position, is_primary)
SELECT 
  '11111111-1111-1111-1111-111111111111'::uuid,
  (SELECT id FROM dh_agent_suite WHERE unique_id = 'AST-MARKET-LAUNCH'),
  a.id,
  ROW_NUMBER() OVER (ORDER BY a.popularity_score DESC, a.rating DESC) - 1,
  ROW_NUMBER() OVER (ORDER BY a.popularity_score DESC, a.rating DESC) = 1
FROM agents a
WHERE a.slug IN (
  'product-launch-strategist',
  'payer-strategy-advisor',
  'health-economics-modeler',
  'digital-marketing-strategist'
)
AND a.is_active = true
ON CONFLICT (suite_id, agent_id) DO NOTHING;

-- Data & Analytics Suite
INSERT INTO agent_suite_members (tenant_id, suite_id, agent_id, position, is_primary)
SELECT 
  '11111111-1111-1111-1111-111111111111'::uuid,
  (SELECT id FROM dh_agent_suite WHERE unique_id = 'AST-DATA-ANALYTICS'),
  a.id,
  ROW_NUMBER() OVER (ORDER BY a.popularity_score DESC, a.rating DESC) - 1,
  ROW_NUMBER() OVER (ORDER BY a.popularity_score DESC, a.rating DESC) = 1
FROM agents a
WHERE a.slug IN (
  'biostatistician-digital-health',
  'real-world-evidence-analyst',
  'evidence-generation-planner',
  'data-visualization-specialist'
)
AND a.is_active = true
ON CONFLICT (suite_id, agent_id) DO NOTHING;

-- Digital Health Innovation Suite
INSERT INTO agent_suite_members (tenant_id, suite_id, agent_id, position, is_primary)
SELECT 
  '11111111-1111-1111-1111-111111111111'::uuid,
  (SELECT id FROM dh_agent_suite WHERE unique_id = 'AST-DIGITAL-INNOVATION'),
  a.id,
  ROW_NUMBER() OVER (ORDER BY a.popularity_score DESC, a.rating DESC) - 1,
  ROW_NUMBER() OVER (ORDER BY a.popularity_score DESC, a.rating DESC) = 1
FROM agents a
WHERE a.slug IN (
  'nlp-expert',
  'data-visualization-specialist',
  'personalized-medicine-specialist',
  'geriatric-clinical-specialist',
  'rare-disease-specialist'
)
AND a.is_active = true
ON CONFLICT (suite_id, agent_id) DO NOTHING;

-- Step 6: Add helpful comment
COMMENT ON TABLE agent_suite_members IS 'Maps AI agents to agent suites (not to be confused with dh_agent_suite_member which maps human personas)';

