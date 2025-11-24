-- ========================================
-- VITAL PATH: UPDATE TIER AND LIFECYCLE CONSTRAINTS
-- Updates agent tier and status field constraints
-- ========================================

-- Update tier constraint to support Core (0), Tier 1 (1), Tier 2 (2), Tier 3 (3)
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_tier_check;
ALTER TABLE agents ADD CONSTRAINT agents_tier_check
  CHECK (tier >= 0 AND tier <= 3);

-- Update status constraint to include planned and pipeline
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_status_check;
ALTER TABLE agents ADD CONSTRAINT agents_status_check
  CHECK (status IN ('active', 'inactive', 'development', 'deprecated', 'testing', 'planned', 'pipeline'));

-- Update the default tier value to 1 (Tier 1) to maintain consistency
ALTER TABLE agents ALTER COLUMN tier SET DEFAULT 1;

-- Add indexes for new status values
CREATE INDEX IF NOT EXISTS idx_agents_tier_lifecycle ON agents(tier, status);

-- Add comments for documentation
COMMENT ON COLUMN agents.tier IS 'Agent tier classification: 0=Core, 1=Tier 1, 2=Tier 2, 3=Tier 3';
COMMENT ON COLUMN agents.status IS 'Agent lifecycle stage: active, inactive, development, testing, deprecated, planned, pipeline';

-- Create or replace function to validate tier and status combinations
CREATE OR REPLACE FUNCTION validate_agent_tier_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate tier values
    IF NEW.tier IS NOT NULL AND (NEW.tier < 0 OR NEW.tier > 3) THEN
        RAISE EXCEPTION 'Agent tier must be between 0 (Core) and 3 (Tier 3)';
    END IF;

    -- Validate status values
    IF NEW.status IS NOT NULL AND NEW.status NOT IN ('active', 'inactive', 'development', 'testing', 'deprecated', 'planned', 'pipeline') THEN
        RAISE EXCEPTION 'Invalid agent status. Must be one of: active, inactive, development, testing, deprecated, planned, pipeline';
    END IF;

    -- Business logic: Core agents (tier 0) should typically be active or development
    IF NEW.tier = 0 AND NEW.status IN ('deprecated', 'inactive') THEN
        RAISE WARNING 'Core agents (tier 0) should typically not be deprecated or inactive';
    END IF;

    -- Business logic: Pipeline agents should typically be planned initially
    IF OLD.status IS NULL AND NEW.status = 'pipeline' AND NEW.tier IS NULL THEN
        -- Auto-assign tier 1 for new pipeline agents if not specified
        NEW.tier = COALESCE(NEW.tier, 1);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tier and status validation
DROP TRIGGER IF EXISTS agent_tier_status_validation ON agents;
CREATE TRIGGER agent_tier_status_validation
    BEFORE INSERT OR UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION validate_agent_tier_status();

-- Create view for agent tier summary
CREATE OR REPLACE VIEW agent_tier_summary AS
SELECT
    CASE
        WHEN tier = 0 THEN 'Core'
        WHEN tier = 1 THEN 'Tier 1'
        WHEN tier = 2 THEN 'Tier 2'
        WHEN tier = 3 THEN 'Tier 3'
        ELSE 'Unknown'
    END as tier_label,
    tier,
    status,
    COUNT(*) as agent_count,
    ROUND(AVG(CASE WHEN status = 'active' THEN 1 ELSE 0 END) * 100, 2) as active_percentage
FROM agents
GROUP BY tier, status
ORDER BY tier, status;

-- Grant permissions on the view
GRANT SELECT ON agent_tier_summary TO authenticated;

-- Update table statistics
ANALYZE agents;