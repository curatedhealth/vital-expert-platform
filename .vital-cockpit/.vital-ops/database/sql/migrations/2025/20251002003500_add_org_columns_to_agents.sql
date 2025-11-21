-- Migration: Add organizational foreign key columns to agents table
-- Created: 2025-10-02
-- Purpose: Add function_id, department_id, and role_id columns to agents table

-- Add foreign key columns
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_function_id ON agents(function_id);
CREATE INDEX IF NOT EXISTS idx_agents_department_id ON agents(department_id);
CREATE INDEX IF NOT EXISTS idx_agents_role_id ON agents(role_id);

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agents'
  AND column_name IN ('function_id', 'department_id', 'role_id')
ORDER BY column_name;
