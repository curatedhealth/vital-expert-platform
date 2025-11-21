-- Migration: Comprehensive Schema
-- Created: 2025-11-20
-- Description: This migration creates the complete schema for the VITAL platform, including organizational structure, personas, and JTBDs. It is a unified migration that should be run on a clean database.

-- =====================================================================
-- 0. Extensions
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. ORGANIZATIONAL STRUCTURE
-- =====================================================================

CREATE TABLE IF NOT EXISTS org_functions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    description TEXT,
    migration_ready BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(department_name, '') || ' ' ||
            coalesce(description, '')
        )
    ) STORED
);

CREATE TABLE IF NOT EXISTS org_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(50) UNIQUE,
    department_id VARCHAR(50),
    department_name VARCHAR(255) NOT NULL,
    department_type VARCHAR(100),
    description TEXT,
    function_area VARCHAR(255),
    compliance_requirements TEXT[],
    critical_systems TEXT[],
    data_classification VARCHAR(50) CHECK (data_classification IN ('Public', 'Internal', 'Confidential', 'Restricted')),
    migration_ready BOOLEAN DEFAULT false,
    export_format VARCHAR(50),
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(department_name, '') || ' ' ||
            coalesce(description, '') || ' ' ||
            coalesce(function_area, '')
        )
    ) STORED
);

CREATE TABLE IF NOT EXISTS org_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255),
    description TEXT,
    seniority_level VARCHAR(50) CHECK (seniority_level IN ('Executive', 'Senior', 'Mid', 'Junior', 'Entry')),
    reports_to_role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
    function_area VARCHAR(255),
    department_name VARCHAR(255),
    required_skills TEXT[],
    required_certifications TEXT[],
    years_experience_min INTEGER,
    years_experience_max INTEGER,
    migration_ready BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(role_name, '') || ' ' ||
            coalesce(role_title, '') || ' ' ||
            coalesce(description, '')
        )
    ) STORED
);

CREATE TABLE IF NOT EXISTS org_responsibilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority INTEGER CHECK (priority >= 0 AND priority <= 100),
    complexity_level VARCHAR(50) CHECK (complexity_level IN ('Low', 'Medium', 'High', 'Critical')),
    mapped_to_use_cases TEXT[],
    use_case_ids TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(name, '') || ' ' ||
            coalesce(description, '')
        )
    ) STORED
);

CREATE TABLE IF NOT EXISTS org_function_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(function_id, department_id)
);

CREATE TABLE IF NOT EXISTS org_role_responsibilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    responsibility_id UUID NOT NULL REFERENCES org_responsibilities(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    weight DECIMAL(3,2) CHECK (weight >= 0 AND weight <= 1),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, responsibility_id)
);

CREATE TABLE IF NOT EXISTS org_department_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    headcount INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(department_id, role_id)
);

CREATE TABLE IF NOT EXISTS org_function_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(function_id, role_id)
);

-- =====================================================================
-- 2. JTBD
-- =====================================================================

CREATE TABLE IF NOT EXISTS jtbd_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jtbd_core (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    job_statement TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES jtbd_categories(id) ON DELETE SET NULL,
    when_situation TEXT,
    desired_outcome TEXT,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- 3. PERSONAS
-- =====================================================================

CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- 4. NORMALIZED ATTRIBUTES
-- =====================================================================

CREATE TABLE IF NOT EXISTS pain_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS current_solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS success_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS motivations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- 5. JUNCTION TABLES
-- =====================================================================

CREATE TABLE IF NOT EXISTS jtbd_pain_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jtbd_id UUID NOT NULL REFERENCES jtbd_core(id) ON DELETE CASCADE,
    pain_point_id UUID NOT NULL REFERENCES pain_points(id) ON DELETE CASCADE,
    UNIQUE(jtbd_id, pain_point_id)
);

CREATE TABLE IF NOT EXISTS jtbd_current_solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jtbd_id UUID NOT NULL REFERENCES jtbd_core(id) ON DELETE CASCADE,
    current_solution_id UUID NOT NULL REFERENCES current_solutions(id) ON DELETE CASCADE,
    UNIQUE(jtbd_id, current_solution_id)
);

CREATE TABLE IF NOT EXISTS jtbd_success_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jtbd_id UUID NOT NULL REFERENCES jtbd_core(id) ON DELETE CASCADE,
    success_criterion_id UUID NOT NULL REFERENCES success_criteria(id) ON DELETE CASCADE,
    UNIQUE(jtbd_id, success_criterion_id)
);

CREATE TABLE IF NOT EXISTS persona_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    UNIQUE(persona_id, goal_id)
);

CREATE TABLE IF NOT EXISTS persona_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    UNIQUE(persona_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS persona_motivations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    motivation_id UUID NOT NULL REFERENCES motivations(id) ON DELETE CASCADE,
    UNIQUE(persona_id, motivation_id)
);

CREATE TABLE IF NOT EXISTS role_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    UNIQUE(role_id, goal_id)
);

CREATE TABLE IF NOT EXISTS role_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    UNIQUE(role_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS role_motivations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    motivation_id UUID NOT NULL REFERENCES motivations(id) ON DELETE CASCADE,
    UNIQUE(role_id, motivation_id)
);

CREATE TABLE IF NOT EXISTS persona_jtbd (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    jtbd_id UUID NOT NULL REFERENCES jtbd_core(id) ON DELETE CASCADE,
    UNIQUE(persona_id, jtbd_id)
);

-- =====================================================================
-- 6. HIERARCHICAL MAPPING
-- =====================================================================

ALTER TABLE org_functions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE org_departments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE org_responsibilities ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE jtbd_core ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE pain_points ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE current_solutions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE success_criteria ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE motivations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- =====================================================================
-- 7. TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_functions_updated_at BEFORE UPDATE ON org_functions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON org_departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON org_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responsibilities_updated_at BEFORE UPDATE ON org_responsibilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jtbd_core_updated_at
    BEFORE UPDATE ON jtbd_core
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jtbd_categories_updated_at
    BEFORE UPDATE ON jtbd_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personas_updated_at
    BEFORE UPDATE ON personas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pain_points_updated_at
    BEFORE UPDATE ON pain_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_current_solutions_updated_at
    BEFORE UPDATE ON current_solutions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_success_criteria_updated_at
    BEFORE UPDATE ON success_criteria
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_motivations_updated_at
    BEFORE UPDATE ON motivations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- 8. ROW LEVEL SECURITY
-- =====================================================================

ALTER TABLE org_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_responsibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pain_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all authenticated users" ON org_functions
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON org_departments
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON org_roles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON org_responsibilities
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all users" ON jtbd_categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON jtbd_core FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON personas FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON pain_points FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON current_solutions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON success_criteria FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON goals FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON challenges FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON motivations FOR SELECT USING (true);

-- =====================================================================
-- 9. COMMENTS
-- =====================================================================

COMMENT ON TABLE org_functions IS 'Business org_functions within the organization (e.g., Research & Development, Clinical Development)';
COMMENT ON TABLE org_departments IS 'Departments within each function (e.g., Drug Discovery, Clinical Operations)';
COMMENT ON TABLE org_roles IS 'Job org_roles and positions within org_departments';
COMMENT ON TABLE org_responsibilities IS 'Specific org_responsibilities assigned to org_roles';
COMMENT ON TABLE jtbd_categories IS 'Categories for Jobs-to-be-Done';
COMMENT ON TABLE jtbd_core IS 'Core table for Jobs-to-be-Done framework';
COMMENT ON TABLE personas IS 'User personas';
COMMENT ON TABLE pain_points IS 'Normalized table for pain points';
COMMENT ON TABLE current_solutions IS 'Normalized table for current solutions';
COMMENT ON TABLE success_criteria IS 'Normalized table for success criteria';
COMMENT ON TABLE goals IS 'Normalized table for goals';
COMMENT ON TABLE challenges IS 'Normalized table for challenges';
COMMENT ON TABLE motivations IS 'Normalized table for motivations';
COMMENT ON TABLE jtbd_pain_points IS 'Junction table to link JTBDs to pain points';
COMMENT ON TABLE jtbd_current_solutions IS 'Junction table to link JTBDs to current solutions';
COMMENT ON TABLE jtbd_success_criteria IS 'Junction table to link JTBDs to success criteria';
COMMENT ON TABLE persona_goals IS 'Junction table to link personas to goals';
COMMENT ON TABLE persona_challenges IS 'Junction table to link personas to challenges';
COMMENT ON TABLE persona_motivations IS 'Junction table to link personas to motivations';
COMMENT ON TABLE role_goals IS 'Junction table to link roles to goals';
COMMENT ON TABLE role_challenges IS 'Junction table to link roles to challenges';
COMMENT ON TABLE role_motivations IS 'Junction table to link roles to motivations';
COMMENT ON TABLE persona_jtbd IS 'Junction table to link personas to JTBDs';
