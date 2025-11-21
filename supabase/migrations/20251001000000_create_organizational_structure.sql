-- =====================================================================
-- Organizational Structure Migration
-- Creates tables for Functions, Departments, Roles, and Responsibilities
-- with proper relationships and indexes
-- =====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. ORG_FUNCTIONS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS org_functions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Core Fields
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Status & Metadata
    migration_ready BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),

    -- Search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(department_name, '') || ' ' ||
            coalesce(description, '')
        )
    ) STORED
);

-- =====================================================================
-- 2. DEPARTMENTS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS org_departments (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Core Fields
    unique_id VARCHAR(50) UNIQUE,
    department_id VARCHAR(50),
    department_name VARCHAR(255) NOT NULL,
    department_type VARCHAR(100),
    description TEXT,

    -- Business Context
    function_area VARCHAR(255),

    -- Compliance & Security
    compliance_requirements TEXT[],
    critical_systems TEXT[],
    data_classification VARCHAR(50) CHECK (data_classification IN ('Public', 'Internal', 'Confidential', 'Restricted')),

    -- Status & Metadata
    migration_ready BOOLEAN DEFAULT false,
    export_format VARCHAR(50),

    -- Foreign Key
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(department_name, '') || ' ' ||
            coalesce(description, '') || ' ' ||
            coalesce(function_area, '')
        )
    ) STORED
);

-- =====================================================================
-- 3. ROLES TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS org_roles (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Core Fields
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255),
    description TEXT,

    -- Hierarchy
    seniority_level VARCHAR(50) CHECK (seniority_level IN ('Executive', 'Senior', 'Mid', 'Junior', 'Entry')),
    reports_to_role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,

    -- Business Context
    function_area VARCHAR(255),
    department_name VARCHAR(255),

    -- Requirements
    required_skills TEXT[],
    required_certifications TEXT[],
    years_experience_min INTEGER,
    years_experience_max INTEGER,

    -- Status & Metadata
    migration_ready BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    -- Foreign Keys
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(role_name, '') || ' ' ||
            coalesce(role_title, '') || ' ' ||
            coalesce(description, '')
        )
    ) STORED
);

-- =====================================================================
-- 4. RESPONSIBILITIES TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS org_responsibilities (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Core Fields
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Business Context
    category VARCHAR(100),
    priority INTEGER CHECK (priority >= 0 AND priority <= 100),
    complexity_level VARCHAR(50) CHECK (complexity_level IN ('Low', 'Medium', 'High', 'Critical')),

    -- VITAL Path Integration
    mapped_to_use_cases TEXT[],
    use_case_ids TEXT[],

    -- Status & Metadata
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(name, '') || ' ' ||
            coalesce(description, '')
        )
    ) STORED
);

-- =====================================================================
-- 5. RELATIONSHIP TABLES (Many-to-Many)
-- =====================================================================

-- Function-Department Relationships
CREATE TABLE IF NOT EXISTS org_function_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(function_id, department_id)
);

-- Role-Responsibility Relationships
CREATE TABLE IF NOT EXISTS org_role_responsibilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    responsibility_id UUID NOT NULL REFERENCES org_responsibilities(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    weight DECIMAL(3,2) CHECK (weight >= 0 AND weight <= 1),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, responsibility_id)
);

-- Department-Role Relationships
CREATE TABLE IF NOT EXISTS org_department_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    headcount INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(department_id, role_id)
);

-- Function-Role Relationships
CREATE TABLE IF NOT EXISTS org_function_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(function_id, role_id)
);

-- =====================================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================================

-- Functions Indexes
CREATE INDEX IF NOT EXISTS idx_functions_unique_id ON org_functions(unique_id);
CREATE INDEX IF NOT EXISTS idx_functions_department_name ON org_functions(department_name);
CREATE INDEX IF NOT EXISTS idx_functions_search ON org_functions USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_functions_migration_ready ON org_functions(migration_ready);

-- Departments Indexes
CREATE INDEX IF NOT EXISTS idx_departments_unique_id ON org_departments(unique_id);
CREATE INDEX IF NOT EXISTS idx_departments_department_id ON org_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_name ON org_departments(department_name);
CREATE INDEX IF NOT EXISTS idx_departments_type ON org_departments(department_type);
CREATE INDEX IF NOT EXISTS idx_departments_function_id ON org_departments(function_id);
CREATE INDEX IF NOT EXISTS idx_departments_search ON org_departments USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_departments_data_classification ON org_departments(data_classification);

-- Roles Indexes
CREATE INDEX IF NOT EXISTS idx_roles_unique_id ON org_roles(unique_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON org_roles(role_name);
CREATE INDEX IF NOT EXISTS idx_roles_seniority ON org_roles(seniority_level);
CREATE INDEX IF NOT EXISTS idx_roles_function_id ON org_roles(function_id);
CREATE INDEX IF NOT EXISTS idx_roles_department_id ON org_roles(department_id);
CREATE INDEX IF NOT EXISTS idx_roles_reports_to ON org_roles(reports_to_role_id);
CREATE INDEX IF NOT EXISTS idx_roles_search ON org_roles USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_roles_active ON org_roles(is_active);

-- Responsibilities Indexes
CREATE INDEX IF NOT EXISTS idx_responsibilities_unique_id ON org_responsibilities(unique_id);
CREATE INDEX IF NOT EXISTS idx_responsibilities_name ON org_responsibilities(name);
CREATE INDEX IF NOT EXISTS idx_responsibilities_category ON org_responsibilities(category);
CREATE INDEX IF NOT EXISTS idx_responsibilities_priority ON org_responsibilities(priority);
CREATE INDEX IF NOT EXISTS idx_responsibilities_search ON org_responsibilities USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_responsibilities_active ON org_responsibilities(is_active);

-- Relationship Table Indexes
CREATE INDEX IF NOT EXISTS idx_function_departments_function ON org_function_departments(function_id);
CREATE INDEX IF NOT EXISTS idx_function_departments_department ON org_function_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_role_responsibilities_role ON org_role_responsibilities(role_id);
CREATE INDEX IF NOT EXISTS idx_role_responsibilities_responsibility ON org_role_responsibilities(responsibility_id);
CREATE INDEX IF NOT EXISTS idx_department_roles_department ON org_department_roles(department_id);
CREATE INDEX IF NOT EXISTS idx_department_roles_role ON org_department_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_function_roles_function ON org_function_roles(function_id);
CREATE INDEX IF NOT EXISTS idx_function_roles_role ON org_function_roles(role_id);

-- =====================================================================
-- 7. HELPER FUNCTIONS
-- =====================================================================

-- Function to get all org_roles for a department
CREATE OR REPLACE FUNCTION get_department_roles(dept_id UUID)
RETURNS TABLE (
    role_id UUID,
    role_name VARCHAR,
    role_title VARCHAR,
    seniority_level VARCHAR,
    headcount INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.role_name,
        r.role_title,
        r.seniority_level,
        dr.headcount
    FROM org_roles r
    INNER JOIN org_department_roles dr ON r.id = dr.role_id
    WHERE dr.department_id = dept_id
    AND r.is_active = true
    ORDER BY r.seniority_level, r.role_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get all org_responsibilities for a role
CREATE OR REPLACE FUNCTION get_role_responsibilities(r_id UUID)
RETURNS TABLE (
    responsibility_id UUID,
    responsibility_name VARCHAR,
    description TEXT,
    is_primary BOOLEAN,
    weight DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        resp.id,
        resp.name,
        resp.description,
        rr.is_primary,
        rr.weight
    FROM org_responsibilities resp
    INNER JOIN org_role_responsibilities rr ON resp.id = rr.responsibility_id
    WHERE rr.role_id = r_id
    AND resp.is_active = true
    ORDER BY rr.is_primary DESC, rr.weight DESC, resp.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get organizational hierarchy
CREATE OR REPLACE FUNCTION get_organizational_hierarchy()
RETURNS TABLE (
    function_name VARCHAR,
    function_id UUID,
    department_name VARCHAR,
    department_id UUID,
    role_name VARCHAR,
    role_id UUID,
    seniority_level VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.department_name as function_name,
        f.id as function_id,
        d.department_name,
        d.id as department_id,
        r.role_name,
        r.id as role_id,
        r.seniority_level
    FROM org_functions f
    LEFT JOIN org_departments d ON d.function_id = f.id
    LEFT JOIN org_roles r ON r.department_id = d.id
    WHERE r.is_active = true OR r.is_active IS NULL
    ORDER BY f.department_name, d.department_name, r.seniority_level, r.role_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 8. UPDATE TRIGGERS
-- =====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_functions_updated_at BEFORE UPDATE ON org_functions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON org_departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON org_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responsibilities_updated_at BEFORE UPDATE ON org_responsibilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- 9. ROW LEVEL SECURITY (RLS) - Optional
-- =====================================================================

-- Enable RLS
ALTER TABLE org_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_responsibilities ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users)
CREATE POLICY "Allow read access to all authenticated users" ON org_functions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users" ON org_departments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users" ON org_roles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users" ON org_responsibilities
    FOR SELECT TO authenticated USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON org_functions
    FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access" ON org_departments
    FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access" ON org_roles
    FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access" ON org_responsibilities
    FOR ALL TO service_role USING (true);

-- =====================================================================
-- 10. COMMENTS FOR DOCUMENTATION
-- =====================================================================

COMMENT ON TABLE org_functions IS 'Business org_functions within the organization (e.g., Research & Development, Clinical Development)';
COMMENT ON TABLE org_departments IS 'Departments within each function (e.g., Drug Discovery, Clinical Operations)';
COMMENT ON TABLE org_roles IS 'Job org_roles and positions within org_departments';
COMMENT ON TABLE org_responsibilities IS 'Specific org_responsibilities assigned to org_roles';
COMMENT ON TABLE org_function_departments IS 'Many-to-many relationship between org_functions and org_departments';
COMMENT ON TABLE org_role_responsibilities IS 'Many-to-many relationship between org_roles and org_responsibilities';
COMMENT ON TABLE org_department_roles IS 'Many-to-many relationship between org_departments and org_roles';
COMMENT ON TABLE org_function_roles IS 'Many-to-many relationship between org_functions and org_roles';
