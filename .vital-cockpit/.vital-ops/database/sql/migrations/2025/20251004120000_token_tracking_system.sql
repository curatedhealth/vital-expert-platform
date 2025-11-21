-- Token Tracking System - Fixed for Standard PostgreSQL
-- Removes Supabase-specific auth dependencies

-- Fix RLS policies to work without auth.uid() and auth.jwt()

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "Service role can insert usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "Service role can view all usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "Users can view their own budget limits" ON budget_limits;
DROP POLICY IF EXISTS "Service role can manage budget limits" ON budget_limits;
DROP POLICY IF EXISTS "Users can view alerts related to them" ON cost_alerts;
DROP POLICY IF EXISTS "Service role can manage alerts" ON cost_alerts;
DROP POLICY IF EXISTS "Anyone can view service performance metrics" ON service_performance_metrics;
DROP POLICY IF EXISTS "Service role can manage service metrics" ON service_performance_metrics;
DROP POLICY IF EXISTS "Users can view their own workflow analytics" ON workflow_analytics;
DROP POLICY IF EXISTS "Service role can manage workflow analytics" ON workflow_analytics;

-- Disable RLS for now (we'll use application-level security)
ALTER TABLE token_usage_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE cost_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_performance_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_analytics DISABLE ROW LEVEL SECURITY;

-- Grant permissions to all users (since we're using service role key)
GRANT SELECT, INSERT ON token_usage_logs TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON budget_limits TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON cost_alerts TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON service_performance_metrics TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON workflow_analytics TO PUBLIC;
GRANT SELECT ON mv_service_costs TO PUBLIC;
GRANT SELECT ON mv_workflow_efficiency TO PUBLIC;
GRANT SELECT ON mv_panel_performance TO PUBLIC;
GRANT SELECT ON mv_user_service_usage TO PUBLIC;

-- Update check_user_budget function to work without auth schema
CREATE OR REPLACE FUNCTION check_user_budget(
    p_user_id UUID,
    p_session_id TEXT,
    p_estimated_cost DECIMAL
) RETURNS TABLE (
    allowed BOOLEAN,
    reason TEXT,
    remaining_budget DECIMAL
) AS $$
DECLARE
    v_session_limit DECIMAL;
    v_session_spent DECIMAL;
    v_daily_limit DECIMAL;
    v_daily_spent DECIMAL;
    v_monthly_limit DECIMAL;
    v_monthly_spent DECIMAL;
BEGIN
    -- Session limit
    SELECT daily_limit INTO v_session_limit
    FROM budget_limits
    WHERE entity_type = 'session' AND entity_id = p_session_id;

    v_session_limit := COALESCE(v_session_limit, 999999.99);

    SELECT COALESCE(SUM(total_cost), 0) INTO v_session_spent
    FROM token_usage_logs
    WHERE session_id = p_session_id;

    IF v_session_spent + p_estimated_cost > v_session_limit THEN
        RETURN QUERY SELECT FALSE, 'Session budget exceeded', v_session_limit - v_session_spent;
        RETURN;
    END IF;

    -- Daily limit
    SELECT daily_limit INTO v_daily_limit
    FROM budget_limits
    WHERE entity_type = 'user' AND entity_id = p_user_id::TEXT;

    v_daily_limit := COALESCE(v_daily_limit, 999999.99);

    SELECT COALESCE(SUM(total_cost), 0) INTO v_daily_spent
    FROM token_usage_logs
    WHERE user_id = p_user_id AND created_at >= CURRENT_DATE;

    IF v_daily_spent + p_estimated_cost > v_daily_limit THEN
        RETURN QUERY SELECT FALSE, 'Daily budget exceeded', v_daily_limit - v_daily_spent;
        RETURN;
    END IF;

    -- Monthly limit
    SELECT monthly_limit INTO v_monthly_limit
    FROM budget_limits
    WHERE entity_type = 'user' AND entity_id = p_user_id::TEXT;

    v_monthly_limit := COALESCE(v_monthly_limit, 999999.99);

    SELECT COALESCE(SUM(total_cost), 0) INTO v_monthly_spent
    FROM token_usage_logs
    WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE);

    IF v_monthly_spent + p_estimated_cost > v_monthly_limit THEN
        RETURN QUERY SELECT FALSE, 'Monthly budget exceeded', v_monthly_limit - v_monthly_spent;
        RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, 'Within budget', LEAST(
        v_session_limit - v_session_spent,
        v_daily_limit - v_daily_spent,
        v_monthly_limit - v_monthly_spent
    );
END;
$$ LANGUAGE plpgsql;

-- Create test user for tracking
INSERT INTO auth.users (id, email, email_confirmed, is_active)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test@vital.ai', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert default budget limits (from migration)
INSERT INTO budget_limits (entity_type, entity_id, daily_limit, monthly_limit, action_on_breach, notes)
VALUES
    ('organization', 'mvp', 50.00, 500.00, 'alert', 'MVP total budget'),
    ('service', '1:1_conversation', 5.00, 100.00, 'alert', '1:1 conversation service budget'),
    ('service', 'virtual_panel', 10.00, 200.00, 'alert', 'Virtual panel service budget'),
    ('service', 'workflow', 15.00, 300.00, 'alert', 'Workflow service budget'),
    ('service', 'solution_builder', 20.00, 400.00, 'alert', 'Solution builder service budget'),
    ('tier', 'tier_1', 30.00, 600.00, 'alert', 'Tier 1 agents'),
    ('tier', 'tier_2', 15.00, 300.00, 'throttle', 'Tier 2 agents'),
    ('tier', 'tier_3', 5.00, 100.00, 'downgrade', 'Tier 3 agents')
ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    daily_limit = EXCLUDED.daily_limit,
    monthly_limit = EXCLUDED.monthly_limit,
    updated_at = NOW();

-- Insert test user budget limit
INSERT INTO budget_limits (entity_type, entity_id, daily_limit, monthly_limit, action_on_breach, notes)
VALUES ('user', '550e8400-e29b-41d4-a716-446655440000', 5.00, 100.00, 'alert', 'Test user budget')
ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    daily_limit = EXCLUDED.daily_limit,
    monthly_limit = EXCLUDED.monthly_limit,
    updated_at = NOW();
