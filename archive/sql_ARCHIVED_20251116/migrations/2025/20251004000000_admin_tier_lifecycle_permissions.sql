-- ========================================
-- VITAL PATH: Admin Permissions for Tier and Lifecycle Stage
-- Allows admins to update agent tier and status (lifecycle_stage) fields
-- ========================================

-- Grant UPDATE permissions on agents table for tier and status columns to admins
-- This works with the existing RLS policies that already restrict modifications to admins

-- Add comment to clarify admin edit capabilities
COMMENT ON COLUMN agents.tier IS 'Agent tier classification: 0=Core, 1=Tier 1, 2=Tier 2, 3=Tier 3 (Admin editable)';
COMMENT ON COLUMN agents.status IS 'Agent lifecycle stage: active, inactive, development, testing, deprecated, planned, pipeline (Admin editable)';

-- Create a helper function for admins to batch update agent tiers
CREATE OR REPLACE FUNCTION admin_update_agent_tier(
    agent_id_param UUID,
    new_tier INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT auth.jwt() ->> 'email' IN (
        'admin@vitalpath.ai',
        'hicham.naim@example.com'
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only admins can update agent tier';
    END IF;

    -- Validate tier value
    IF new_tier < 0 OR new_tier > 3 THEN
        RAISE EXCEPTION 'Tier must be between 0 (Core) and 3 (Tier 3)';
    END IF;

    -- Update the tier
    UPDATE agents
    SET tier = new_tier,
        updated_at = NOW()
    WHERE id = agent_id_param;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a helper function for admins to batch update agent lifecycle stage
CREATE OR REPLACE FUNCTION admin_update_agent_lifecycle_stage(
    agent_id_param UUID,
    new_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT auth.jwt() ->> 'email' IN (
        'admin@vitalpath.ai',
        'hicham.naim@example.com'
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only admins can update agent lifecycle stage';
    END IF;

    -- Validate status value
    IF new_status NOT IN ('active', 'inactive', 'development', 'testing', 'deprecated', 'planned', 'pipeline') THEN
        RAISE EXCEPTION 'Invalid lifecycle stage. Must be one of: active, inactive, development, testing, deprecated, planned, pipeline';
    END IF;

    -- Update the status
    UPDATE agents
    SET status = new_status,
        updated_at = NOW()
    WHERE id = agent_id_param;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a combined function for admins to update both tier and lifecycle stage
CREATE OR REPLACE FUNCTION admin_update_agent_tier_and_lifecycle(
    agent_id_param UUID,
    new_tier INTEGER DEFAULT NULL,
    new_status TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT auth.jwt() ->> 'email' IN (
        'admin@vitalpath.ai',
        'hicham.naim@example.com'
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only admins can update agent tier and lifecycle stage';
    END IF;

    -- Validate tier if provided
    IF new_tier IS NOT NULL AND (new_tier < 0 OR new_tier > 3) THEN
        RAISE EXCEPTION 'Tier must be between 0 (Core) and 3 (Tier 3)';
    END IF;

    -- Validate status if provided
    IF new_status IS NOT NULL AND new_status NOT IN ('active', 'inactive', 'development', 'testing', 'deprecated', 'planned', 'pipeline') THEN
        RAISE EXCEPTION 'Invalid lifecycle stage. Must be one of: active, inactive, development, testing, deprecated, planned, pipeline';
    END IF;

    -- Update the agent
    UPDATE agents
    SET
        tier = COALESCE(new_tier, tier),
        status = COALESCE(new_status, status),
        updated_at = NOW()
    WHERE id = agent_id_param;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant EXECUTE permissions on admin functions
GRANT EXECUTE ON FUNCTION admin_update_agent_tier(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_agent_lifecycle_stage(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_agent_tier_and_lifecycle(UUID, INTEGER, TEXT) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION admin_update_agent_tier(UUID, INTEGER) IS 'Admin-only function to update agent tier (0=Core, 1-3=Tiers)';
COMMENT ON FUNCTION admin_update_agent_lifecycle_stage(UUID, TEXT) IS 'Admin-only function to update agent lifecycle stage';
COMMENT ON FUNCTION admin_update_agent_tier_and_lifecycle(UUID, INTEGER, TEXT) IS 'Admin-only function to update both tier and lifecycle stage in one call';

-- Create view for admin tier and lifecycle management
CREATE OR REPLACE VIEW admin_agent_tier_lifecycle_view AS
SELECT
    a.id,
    a.name,
    a.display_name,
    a.tier,
    CASE
        WHEN a.tier = 0 THEN 'Core'
        WHEN a.tier = 1 THEN 'Tier 1'
        WHEN a.tier = 2 THEN 'Tier 2'
        WHEN a.tier = 3 THEN 'Tier 3'
        ELSE 'Unknown'
    END as tier_label,
    a.status as lifecycle_stage,
    a.created_at,
    a.updated_at,
    a.created_by
FROM agents a
ORDER BY a.tier, a.status, a.name;

-- Grant permissions on the admin view
GRANT SELECT ON admin_agent_tier_lifecycle_view TO authenticated;

COMMENT ON VIEW admin_agent_tier_lifecycle_view IS 'Admin view for managing agent tier and lifecycle stage attributes';

-- Create audit log for tier and lifecycle changes
CREATE TABLE IF NOT EXISTS agent_tier_lifecycle_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    old_tier INTEGER,
    new_tier INTEGER,
    old_status TEXT,
    new_status TEXT,
    change_reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create trigger to log tier and lifecycle changes
CREATE OR REPLACE FUNCTION log_agent_tier_lifecycle_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if tier or status actually changed
    IF (OLD.tier IS DISTINCT FROM NEW.tier) OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO agent_tier_lifecycle_audit (
            agent_id,
            changed_by,
            old_tier,
            new_tier,
            old_status,
            new_status
        ) VALUES (
            NEW.id,
            auth.uid(),
            OLD.tier,
            NEW.tier,
            OLD.status,
            NEW.status
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS agent_tier_lifecycle_audit_trigger ON agents;
CREATE TRIGGER agent_tier_lifecycle_audit_trigger
    AFTER UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION log_agent_tier_lifecycle_changes();

-- Enable RLS on audit table
ALTER TABLE agent_tier_lifecycle_audit ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit table (admins can view all, users can view their own changes)
CREATE POLICY "Admins can view all tier lifecycle changes" ON agent_tier_lifecycle_audit
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'admin@vitalpath.ai',
            'hicham.naim@example.com'
        )
    );

CREATE POLICY "Users can view their own tier lifecycle changes" ON agent_tier_lifecycle_audit
    FOR SELECT USING (auth.uid() = changed_by);

-- Grant permissions on audit table
GRANT SELECT ON agent_tier_lifecycle_audit TO authenticated;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_agent_tier_lifecycle_audit_agent_id ON agent_tier_lifecycle_audit(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tier_lifecycle_audit_changed_at ON agent_tier_lifecycle_audit(changed_at);

-- Update table statistics
ANALYZE agents;
ANALYZE agent_tier_lifecycle_audit;
