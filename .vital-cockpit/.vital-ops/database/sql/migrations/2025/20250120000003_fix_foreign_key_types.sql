-- Fix business_function and role columns to be proper UUID foreign keys
-- Drop existing columns if they exist with wrong type and recreate them

-- Drop existing columns and constraints if they exist
ALTER TABLE agents DROP COLUMN IF EXISTS business_function CASCADE;
ALTER TABLE agents DROP COLUMN IF EXISTS role CASCADE;

-- Add business_function column as proper UUID foreign key
ALTER TABLE agents
ADD COLUMN business_function uuid REFERENCES business_functions(id) ON DELETE SET NULL;

-- Add role column as proper UUID foreign key
ALTER TABLE agents
ADD COLUMN role uuid REFERENCES roles(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_business_function ON agents(business_function);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);

-- Add helpful comments
COMMENT ON COLUMN agents.business_function IS 'Foreign key to business_functions table';
COMMENT ON COLUMN agents.role IS 'Foreign key to roles table';