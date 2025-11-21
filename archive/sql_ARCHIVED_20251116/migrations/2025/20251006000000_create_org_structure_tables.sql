-- Migration: Create Organizational Structure Tables
-- Description: Creates tables for business functions, departments, and roles
-- Date: 2025-10-06

-- =====================================================
-- BUSINESS FUNCTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS business_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  business_function_id UUID REFERENCES business_functions(id) ON DELETE SET NULL,
  parent_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  hipaa_required BOOLEAN DEFAULT false,
  gdpr_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  business_function_id UUID REFERENCES business_functions(id) ON DELETE SET NULL,
  level VARCHAR(50), -- e.g., 'Senior', 'Junior', 'Lead', 'Manager'
  responsibilities TEXT[],
  required_capabilities TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- UPDATE AGENTS TABLE TO ADD FOREIGN KEYS
-- =====================================================
-- Add foreign key columns if they don't exist
ALTER TABLE agents ADD COLUMN IF NOT EXISTS business_function_id UUID REFERENCES business_functions(id) ON DELETE SET NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_departments_business_function ON departments(business_function_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_roles_department ON roles(department_id);
CREATE INDEX IF NOT EXISTS idx_roles_business_function ON roles(business_function_id);
CREATE INDEX IF NOT EXISTS idx_agents_business_function ON agents(business_function_id);
CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department_id);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role_id);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE business_functions IS 'High-level business functions within the pharmaceutical organization';
COMMENT ON TABLE departments IS 'Organizational departments, hierarchical structure with parent departments';
COMMENT ON TABLE roles IS 'Job roles within departments, linked to business functions';
COMMENT ON COLUMN agents.business_function_id IS 'Foreign key to business_functions table';
COMMENT ON COLUMN agents.department_id IS 'Foreign key to departments table';
COMMENT ON COLUMN agents.role_id IS 'Foreign key to roles table';
