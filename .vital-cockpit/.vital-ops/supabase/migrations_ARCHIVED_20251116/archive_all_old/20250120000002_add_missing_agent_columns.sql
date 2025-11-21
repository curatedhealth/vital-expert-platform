-- Add missing business_function and role columns to agents table
-- These are foreign key references to business_functions and roles tables

-- Add business_function column as UUID foreign key
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS business_function uuid REFERENCES business_functions(id);

-- Add role column as UUID foreign key
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS role uuid REFERENCES roles(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_business_function ON agents(business_function);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);

-- Update RLS policies to handle new columns (they inherit existing agent policies)
-- No additional policies needed as they're part of the agents table