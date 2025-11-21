-- =====================================================================
-- Add Organizational Mapping Columns to Agents Table
-- This migration adds columns to link agents to the organizational structure
-- =====================================================================

-- Add organizational mapping columns to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS function_area VARCHAR(255);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS org_function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS org_department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS org_role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_function_area ON agents(function_area);
CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department);
CREATE INDEX IF NOT EXISTS idx_agents_org_function_id ON agents(org_function_id);
CREATE INDEX IF NOT EXISTS idx_agents_org_department_id ON agents(org_department_id);
CREATE INDEX IF NOT EXISTS idx_agents_org_role_id ON agents(org_role_id);

-- Add comments for documentation
COMMENT ON COLUMN agents.function_area IS 'Business function area (e.g., Research & Development, Clinical Development)';
COMMENT ON COLUMN agents.department IS 'Department within the function (e.g., Drug Discovery, Clinical Operations)';
COMMENT ON COLUMN agents.org_function_id IS 'Foreign key reference to org_functions table';
COMMENT ON COLUMN agents.org_department_id IS 'Foreign key reference to org_departments table';
COMMENT ON COLUMN agents.org_role_id IS 'Foreign key reference to org_roles table';

-- =====================================================================
-- Create Agent-Responsibility Relationship Table
-- =====================================================================

CREATE TABLE IF NOT EXISTS agent_responsibilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    responsibility_id UUID NOT NULL REFERENCES org_responsibilities(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    weight DECIMAL(3,2) CHECK (weight >= 0 AND weight <= 1) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(agent_id, responsibility_id)
);

-- Add indexes for agent_responsibilities
CREATE INDEX IF NOT EXISTS idx_agent_responsibilities_agent_id ON agent_responsibilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_responsibilities_responsibility_id ON agent_responsibilities(responsibility_id);
CREATE INDEX IF NOT EXISTS idx_agent_responsibilities_primary ON agent_responsibilities(is_primary);

-- Add comment for documentation
COMMENT ON TABLE agent_responsibilities IS 'Many-to-many relationship between agents and responsibilities';

-- =====================================================================
-- Create Agent-Function Relationship Table
-- =====================================================================

CREATE TABLE IF NOT EXISTS agent_functions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    weight DECIMAL(3,2) CHECK (weight >= 0 AND weight <= 1) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(agent_id, function_id)
);

-- Add indexes for agent_functions
CREATE INDEX IF NOT EXISTS idx_agent_functions_agent_id ON agent_functions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_functions_function_id ON agent_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_agent_functions_primary ON agent_functions(is_primary);

-- Add comment for documentation
COMMENT ON TABLE agent_functions IS 'Many-to-many relationship between agents and functions';

-- =====================================================================
-- Create Agent-Department Relationship Table
-- =====================================================================

CREATE TABLE IF NOT EXISTS agent_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    weight DECIMAL(3,2) CHECK (weight >= 0 AND weight <= 1) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(agent_id, department_id)
);

-- Add indexes for agent_departments
CREATE INDEX IF NOT EXISTS idx_agent_departments_agent_id ON agent_departments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_departments_department_id ON agent_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_agent_departments_primary ON agent_departments(is_primary);

-- Add comment for documentation
COMMENT ON TABLE agent_departments IS 'Many-to-many relationship between agents and departments';

-- =====================================================================
-- Create Agent-Role Relationship Table
-- =====================================================================

CREATE TABLE IF NOT EXISTS agent_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    weight DECIMAL(3,2) CHECK (weight >= 0 AND weight <= 1) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(agent_id, role_id)
);

-- Add indexes for agent_roles
CREATE INDEX IF NOT EXISTS idx_agent_roles_agent_id ON agent_roles(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_role_id ON agent_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_primary ON agent_roles(is_primary);

-- Add comment for documentation
COMMENT ON TABLE agent_roles IS 'Many-to-many relationship between agents and roles';

-- =====================================================================
-- Helper Functions for Agent-Organization Queries
-- =====================================================================

-- Function to get all organizational mappings for an agent
CREATE OR REPLACE FUNCTION get_agent_organizational_mapping(agent_uuid UUID)
RETURNS TABLE (
    agent_id UUID,
    agent_name VARCHAR,
    function_name VARCHAR,
    department_name VARCHAR,
    role_name VARCHAR,
    responsibilities TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id as agent_id,
        a.display_name as agent_name,
        f.department_name as function_name,
        d.department_name,
        r.role_name,
        ARRAY_AGG(resp.name) as responsibilities
    FROM agents a
    LEFT JOIN org_functions f ON a.org_function_id = f.id
    LEFT JOIN org_departments d ON a.org_department_id = d.id
    LEFT JOIN org_roles r ON a.org_role_id = r.id
    LEFT JOIN agent_responsibilities ar ON a.id = ar.agent_id
    LEFT JOIN org_responsibilities resp ON ar.responsibility_id = resp.id
    WHERE a.id = agent_uuid
    GROUP BY a.id, a.display_name, f.department_name, d.department_name, r.role_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get all agents for a specific function
CREATE OR REPLACE FUNCTION get_agents_by_function(function_uuid UUID)
RETURNS TABLE (
    agent_id UUID,
    agent_name VARCHAR,
    department_name VARCHAR,
    role_name VARCHAR,
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id as agent_id,
        a.display_name as agent_name,
        d.department_name,
        r.role_name,
        a.status
    FROM agents a
    INNER JOIN agent_functions af ON a.id = af.agent_id
    LEFT JOIN org_departments d ON a.org_department_id = d.id
    LEFT JOIN org_roles r ON a.org_role_id = r.id
    WHERE af.function_id = function_uuid
    AND a.status = 'active'
    ORDER BY a.display_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get all agents for a specific department
CREATE OR REPLACE FUNCTION get_agents_by_department(department_uuid UUID)
RETURNS TABLE (
    agent_id UUID,
    agent_name VARCHAR,
    role_name VARCHAR,
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id as agent_id,
        a.display_name as agent_name,
        r.role_name,
        a.status
    FROM agents a
    INNER JOIN agent_departments ad ON a.id = ad.agent_id
    LEFT JOIN org_roles r ON a.org_role_id = r.id
    WHERE ad.department_id = department_uuid
    AND a.status = 'active'
    ORDER BY a.display_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- Update Triggers
-- =====================================================================

-- Apply update triggers to new relationship tables
CREATE TRIGGER update_agent_responsibilities_updated_at BEFORE UPDATE ON agent_responsibilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_functions_updated_at BEFORE UPDATE ON agent_functions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_departments_updated_at BEFORE UPDATE ON agent_departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_roles_updated_at BEFORE UPDATE ON agent_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- Row Level Security (RLS)
-- =====================================================================

-- Enable RLS on new tables
ALTER TABLE agent_responsibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Allow read access to all authenticated users" ON agent_responsibilities
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users" ON agent_functions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users" ON agent_departments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users" ON agent_roles
    FOR SELECT TO authenticated USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON agent_responsibilities
    FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access" ON agent_functions
    FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access" ON agent_departments
    FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access" ON agent_roles
    FOR ALL TO service_role USING (true);
