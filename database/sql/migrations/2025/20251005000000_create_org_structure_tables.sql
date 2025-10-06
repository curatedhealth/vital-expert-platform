-- Migration: Create organizational structure tables
-- Created: 2025-10-05
-- Description: Create org_functions, org_departments, and org_roles tables for organizational hierarchy

-- Create org_functions table
CREATE TABLE IF NOT EXISTS public.org_functions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    department_name text,
    description text,
    healthcare_category text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create org_departments table
CREATE TABLE IF NOT EXISTS public.org_departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    department_name text NOT NULL UNIQUE,
    function_id uuid REFERENCES public.org_functions(id) ON DELETE CASCADE,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create org_roles table
CREATE TABLE IF NOT EXISTS public.org_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    role_name text NOT NULL UNIQUE,
    department_id uuid REFERENCES public.org_departments(id) ON DELETE CASCADE,
    function_id uuid REFERENCES public.org_functions(id) ON DELETE CASCADE,
    description text,
    competency_level text,
    required_skills jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_departments_function_id ON public.org_departments(function_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_department_id ON public.org_roles(department_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_function_id ON public.org_roles(function_id);

-- Add comments
COMMENT ON TABLE public.org_functions IS 'Business functions in the organization';
COMMENT ON TABLE public.org_departments IS 'Departments within business functions';
COMMENT ON TABLE public.org_roles IS 'Roles within departments';

-- Enable RLS
ALTER TABLE public.org_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now - can be restricted later)
CREATE POLICY "Enable read access for all users" ON public.org_functions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.org_departments FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.org_roles FOR SELECT USING (true);
