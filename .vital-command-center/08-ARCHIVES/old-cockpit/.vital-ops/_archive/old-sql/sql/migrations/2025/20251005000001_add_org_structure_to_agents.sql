-- Migration: Add organization structure foreign keys to agents table
-- Created: 2025-10-05
-- Description: Add function_id, department_id, role_id columns to link agents to organizational structure

-- Add foreign key columns to agents table
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS function_id uuid REFERENCES public.org_functions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.org_departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES public.org_roles(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agents_function_id ON public.agents(function_id);
CREATE INDEX IF NOT EXISTS idx_agents_department_id ON public.agents(department_id);
CREATE INDEX IF NOT EXISTS idx_agents_role_id ON public.agents(role_id);

-- Add helpful comment
COMMENT ON COLUMN public.agents.function_id IS 'Foreign key to org_functions table - defines the business function this agent belongs to';
COMMENT ON COLUMN public.agents.department_id IS 'Foreign key to org_departments table - defines the department this agent belongs to';
COMMENT ON COLUMN public.agents.role_id IS 'Foreign key to org_roles table - defines the role this agent is designed for';
