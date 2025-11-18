-- Essential fix for missing columns in agents table
-- Run this SQL in your Supabase SQL Editor to fix the agent update issue

-- Add the missing business_function and role columns
ALTER TABLE agents ADD COLUMN IF NOT EXISTS business_function text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS role text;

-- Add other commonly needed healthcare fields from the migration
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_specialty text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS hipaa_compliant boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS pharma_enabled boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS verify_enabled boolean DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_business_function ON agents(business_function);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);
CREATE INDEX IF NOT EXISTS idx_agents_medical_specialty ON agents(medical_specialty);

-- Add comments for documentation
COMMENT ON COLUMN agents.business_function IS 'Primary business function the agent serves';
COMMENT ON COLUMN agents.role IS 'Specific role or job function the agent fulfills';