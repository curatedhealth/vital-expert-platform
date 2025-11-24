-- Migration: Update Organizational Structure to Many-to-Many Relationships
-- Description: Creates junction tables for many-to-many relationships between agents and org structure
-- Date: 2025-10-06

-- =====================================================
-- AGENT-ROLE JUNCTION TABLE (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, role_id)
);

-- =====================================================
-- AGENT-DEPARTMENT JUNCTION TABLE (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, department_id)
);

-- =====================================================
-- AGENT-BUSINESS FUNCTION JUNCTION TABLE (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_business_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  business_function_id UUID NOT NULL REFERENCES business_functions(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, business_function_id)
);

-- =====================================================
-- MIGRATE EXISTING DATA TO JUNCTION TABLES
-- =====================================================

-- Migrate business functions
INSERT INTO agent_business_functions (agent_id, business_function_id, is_primary)
SELECT id, business_function_id, true
FROM agents
WHERE business_function_id IS NOT NULL
ON CONFLICT (agent_id, business_function_id) DO NOTHING;

-- Migrate departments
INSERT INTO agent_departments (agent_id, department_id, is_primary)
SELECT id, department_id, true
FROM agents
WHERE department_id IS NOT NULL
ON CONFLICT (agent_id, department_id) DO NOTHING;

-- Migrate roles
INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT id, role_id, true
FROM agents
WHERE role_id IS NOT NULL
ON CONFLICT (agent_id, role_id) DO NOTHING;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_agent_roles_agent_id ON agent_roles(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_role_id ON agent_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_primary ON agent_roles(agent_id, is_primary) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_agent_departments_agent_id ON agent_departments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_departments_dept_id ON agent_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_agent_departments_primary ON agent_departments(agent_id, is_primary) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_agent_business_functions_agent_id ON agent_business_functions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_business_functions_func_id ON agent_business_functions(business_function_id);
CREATE INDEX IF NOT EXISTS idx_agent_business_functions_primary ON agent_business_functions(agent_id, is_primary) WHERE is_primary = true;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE agent_roles IS 'Many-to-many relationship between agents and roles';
COMMENT ON TABLE agent_departments IS 'Many-to-many relationship between agents and departments';
COMMENT ON TABLE agent_business_functions IS 'Many-to-many relationship between agents and business functions';

COMMENT ON COLUMN agent_roles.is_primary IS 'Indicates if this is the primary role for the agent';
COMMENT ON COLUMN agent_departments.is_primary IS 'Indicates if this is the primary department for the agent';
COMMENT ON COLUMN agent_business_functions.is_primary IS 'Indicates if this is the primary business function for the agent';

-- =====================================================
-- KEEP OLD COLUMNS FOR BACKWARD COMPATIBILITY
-- =====================================================
-- Note: We're keeping business_function_id, department_id, role_id columns in agents table
-- for backward compatibility and quick access to primary assignments
-- These will be kept in sync with the is_primary=true records in junction tables
