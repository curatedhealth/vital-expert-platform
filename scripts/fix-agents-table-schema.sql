-- =====================================================================
-- FIX AGENTS TABLE SCHEMA
-- =====================================================================
-- Add missing columns to agents table before running organizational mappings

-- Add department column
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS department VARCHAR(255);

-- Add role column
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS role VARCHAR(255);

-- Add business_function column (if not exists)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS business_function VARCHAR(255);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);
CREATE INDEX IF NOT EXISTS idx_agents_business_function ON agents(business_function);

-- Add comments
COMMENT ON COLUMN agents.department IS 'Department within the business function (e.g., Quality Management Systems, Regulatory Strategy)';
COMMENT ON COLUMN agents.role IS 'Role within the department (e.g., Principal Scientist, Clinical Trial Manager)';
COMMENT ON COLUMN agents.business_function IS 'Business function (e.g., Research & Development, Clinical Development)';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'agents' 
AND column_name IN ('department', 'role', 'business_function')
ORDER BY column_name;
