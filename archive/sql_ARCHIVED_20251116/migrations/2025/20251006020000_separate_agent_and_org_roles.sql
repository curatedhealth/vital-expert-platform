-- Migration: Separate Agent Roles from Organizational Roles
-- Description: Creates proper separation between agent functional roles and human organizational roles
-- Date: 2025-10-06

-- =====================================================
-- RENAME EXISTING ROLES TABLE TO ORGANIZATIONAL_ROLES
-- =====================================================
ALTER TABLE IF EXISTS roles RENAME TO organizational_roles;

-- Update references
ALTER INDEX IF EXISTS roles_pkey RENAME TO organizational_roles_pkey;
ALTER INDEX IF EXISTS roles_name_key RENAME TO organizational_roles_name_key;

-- =====================================================
-- CREATE AGENT ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50), -- e.g., 'strategist', 'analyst', 'specialist', 'coordinator'
  capabilities TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADD AGENT_ROLE_ID TO AGENTS TABLE
-- =====================================================
ALTER TABLE agents ADD COLUMN IF NOT EXISTS agent_role_id UUID REFERENCES agent_roles(id) ON DELETE SET NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS agent_role VARCHAR(100); -- Keep string for backward compatibility

-- =====================================================
-- AGENT SUPPORT RELATIONSHIPS (Many-to-Many)
-- Maps which agents support which organizational roles
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_organizational_role_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  organizational_role_id UUID NOT NULL REFERENCES organizational_roles(id) ON DELETE CASCADE,
  support_type VARCHAR(50), -- e.g., 'primary', 'secondary', 'advisory'
  proficiency_level VARCHAR(50), -- e.g., 'basic', 'intermediate', 'advanced', 'expert'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, organizational_role_id)
);

-- =====================================================
-- POPULATE AGENT ROLES FROM EXISTING DATA
-- =====================================================
-- Extract unique agent roles from agents.role column
INSERT INTO agent_roles (name, description, category)
SELECT DISTINCT
  role,
  'Agent functional role: ' || role,
  CASE
    WHEN role ILIKE '%strategist%' THEN 'strategist'
    WHEN role ILIKE '%analyst%' THEN 'analyst'
    WHEN role ILIKE '%specialist%' THEN 'specialist'
    WHEN role ILIKE '%coordinator%' THEN 'coordinator'
    WHEN role ILIKE '%manager%' THEN 'manager'
    WHEN role ILIKE '%officer%' THEN 'officer'
    ELSE 'specialist'
  END
FROM agents
WHERE role IS NOT NULL AND role != ''
ON CONFLICT (name) DO NOTHING;

-- Link agents to their agent roles
UPDATE agents a
SET agent_role_id = ar.id,
    agent_role = ar.name
FROM agent_roles ar
WHERE a.role = ar.name;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_agents_agent_role_id ON agents(agent_role_id);
CREATE INDEX IF NOT EXISTS idx_agent_org_role_support_agent ON agent_organizational_role_support(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_org_role_support_org_role ON agent_organizational_role_support(organizational_role_id);
CREATE INDEX IF NOT EXISTS idx_agent_org_role_support_type ON agent_organizational_role_support(support_type);

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- View: Agents with their roles and supported organizational roles
CREATE OR REPLACE VIEW agent_support_overview AS
SELECT
  a.id as agent_id,
  a.display_name as agent_name,
  a.tier,
  a.status,
  ar.name as agent_role,
  ar.category as agent_role_category,
  COUNT(DISTINCT aors.organizational_role_id) as supported_org_roles_count,
  ARRAY_AGG(DISTINCT or_table.name) FILTER (WHERE or_table.name IS NOT NULL) as supported_org_roles
FROM agents a
LEFT JOIN agent_roles ar ON a.agent_role_id = ar.id
LEFT JOIN agent_organizational_role_support aors ON a.id = aors.agent_id
LEFT JOIN organizational_roles or_table ON aors.organizational_role_id = or_table.id
GROUP BY a.id, a.display_name, a.tier, a.status, ar.name, ar.category;

-- View: Organizational roles with their supporting agents
CREATE OR REPLACE VIEW organizational_role_support AS
SELECT
  or_table.id as org_role_id,
  or_table.name as org_role_name,
  or_table.level,
  d.name as department,
  bf.name as business_function,
  COUNT(DISTINCT aors.agent_id) as supporting_agents_count,
  ARRAY_AGG(DISTINCT a.display_name) FILTER (WHERE a.display_name IS NOT NULL) as supporting_agents
FROM organizational_roles or_table
LEFT JOIN departments d ON or_table.department_id = d.id
LEFT JOIN business_functions bf ON or_table.business_function_id = bf.id
LEFT JOIN agent_organizational_role_support aors ON or_table.id = aors.organizational_role_id
LEFT JOIN agents a ON aors.agent_id = a.id
GROUP BY or_table.id, or_table.name, or_table.level, d.name, bf.name;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE agent_roles IS 'Functional roles that define what an AI agent does (e.g., Strategist, Analyst)';
COMMENT ON TABLE organizational_roles IS 'Human job roles within the pharmaceutical organization';
COMMENT ON TABLE agent_organizational_role_support IS 'Many-to-many mapping of which agents support which organizational roles';

COMMENT ON COLUMN agents.agent_role_id IS 'Foreign key to agent_roles - defines the agents functional role';
COMMENT ON COLUMN agents.role_id IS 'DEPRECATED - Use agent_role_id instead. Kept for backward compatibility';

-- =====================================================
-- SUMMARY
-- =====================================================
--
-- STRUCTURE:
--
-- agent_roles (What the agent does)
--   └── agents (The AI agents)
--       └── agent_organizational_role_support (Support mapping)
--           └── organizational_roles (Human job roles)
--               └── departments
--                   └── business_functions
--
-- Example:
-- - Agent Role: "Regulatory Strategist"
--   - Agent: "FDA Regulatory Strategist Agent"
--     - Supports Org Roles: ["VP Regulatory Affairs", "Regulatory Affairs Manager", "Regulatory Strategy Director"]
