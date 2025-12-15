-- Add department column to agents table
-- This allows agents to be associated with a specific department within their business function

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS department VARCHAR(255);

-- Add index for department filtering
CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department);

-- Add comment
COMMENT ON COLUMN agents.department IS 'Department within the business function (e.g., Quality Management Systems, Regulatory Strategy)';
