-- Create organizational structure tables
-- Business Functions (top level)
CREATE TABLE IF NOT EXISTS public.business_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments (belong to business functions)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_function_id UUID REFERENCES public.business_functions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_function_id, name)
);

-- Organizational Roles (belong to departments and functions)
CREATE TABLE IF NOT EXISTS public.organizational_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_function_id UUID REFERENCES public.business_functions(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  level TEXT, -- seniority level (e.g., Senior, Junior, Lead, Manager)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department_id, name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_departments_business_function ON public.departments(business_function_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_business_function ON public.organizational_roles(business_function_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_department ON public.organizational_roles(department_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.business_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_roles ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access to business_functions" ON public.business_functions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Allow public read access to organizational_roles" ON public.organizational_roles FOR SELECT USING (true);
