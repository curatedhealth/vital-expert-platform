-- =====================================================================
-- Set All Imported Agents to Active Status
-- Ensures agents are visible in the platform UI
-- =====================================================================

-- Update all agents with 'development' status to 'active'
UPDATE agents
SET status = 'active'
WHERE status = 'development';

-- Add comment explaining the change
COMMENT ON COLUMN agents.status IS
'Agent status: active (visible in UI), development (hidden), retired (archived). Default should be active for imported agents.';
