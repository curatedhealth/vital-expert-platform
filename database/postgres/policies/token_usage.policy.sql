-- ============================================================================
-- VITAL Path - Token Usage Table RLS Policies
-- ============================================================================
-- 
-- Token usage tracking for budget management.
-- Users can view their own usage.
-- Tenant admins can view all usage in their tenant (for billing).
-- ============================================================================

-- Enable RLS on token_usage table
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners
ALTER TABLE token_usage FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Users can view their own token usage
CREATE POLICY "token_usage_select_own"
ON token_usage
FOR SELECT
USING (
    tenant_id = auth.tenant_id()
    AND user_id = auth.uid()
);

-- Tenant admins can view all usage in their tenant (billing)
CREATE POLICY "token_usage_select_tenant_admin"
ON token_usage
FOR SELECT
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
);

-- System admins can view all usage
CREATE POLICY "token_usage_select_system"
ON token_usage
FOR SELECT
USING (
    auth.is_system_admin()
);

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Token usage is recorded by the system, not users
CREATE POLICY "token_usage_insert_system"
ON token_usage
FOR INSERT
WITH CHECK (
    -- Must have valid tenant context
    tenant_id IS NOT NULL
);

-- ============================================================================
-- UPDATE/DELETE POLICIES
-- ============================================================================

-- Token usage records are immutable (audit trail)
-- No update or delete policies for regular users

-- System can update for corrections (rare)
CREATE POLICY "token_usage_update_system"
ON token_usage
FOR UPDATE
USING (
    auth.is_system_admin()
)
WITH CHECK (
    auth.is_system_admin()
);

-- System can delete for purging old records
CREATE POLICY "token_usage_delete_system"
ON token_usage
FOR DELETE
USING (
    auth.is_system_admin()
);

-- ============================================================================
-- INDEXES FOR RLS + AGGREGATION PERFORMANCE
-- ============================================================================

-- Index for user's usage
CREATE INDEX IF NOT EXISTS idx_token_usage_tenant_user 
ON token_usage(tenant_id, user_id);

-- Index for monthly aggregation (budget checking)
CREATE INDEX IF NOT EXISTS idx_token_usage_tenant_month 
ON token_usage(tenant_id, date_trunc('month', created_at));

-- Index for per-request queries
CREATE INDEX IF NOT EXISTS idx_token_usage_request 
ON token_usage(request_id);

-- Index for model analysis
CREATE INDEX IF NOT EXISTS idx_token_usage_model 
ON token_usage(tenant_id, model);

-- ============================================================================
-- BUDGET FUNCTIONS
-- ============================================================================

-- Check tenant's token budget
CREATE OR REPLACE FUNCTION check_token_budget(
    p_tenant_id uuid DEFAULT NULL,
    p_estimated_tokens int DEFAULT 0
)
RETURNS TABLE (
    monthly_limit int,
    monthly_used bigint,
    remaining bigint,
    can_proceed boolean,
    percent_used numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id uuid;
    v_limit int;
    v_used bigint;
BEGIN
    v_tenant_id := COALESCE(p_tenant_id, auth.tenant_id());
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant context required for budget check';
    END IF;
    
    -- Get tenant's monthly limit
    SELECT token_limit_monthly INTO v_limit
    FROM tenants 
    WHERE id = v_tenant_id;
    
    -- Default limit if not set
    v_limit := COALESCE(v_limit, 1000000);
    
    -- Get current month's usage
    SELECT COALESCE(SUM(total_tokens), 0) INTO v_used
    FROM token_usage
    WHERE tenant_id = v_tenant_id
    AND created_at >= date_trunc('month', NOW());
    
    RETURN QUERY SELECT 
        v_limit,
        v_used,
        v_limit - v_used,
        (v_used + p_estimated_tokens) <= v_limit,
        ROUND((v_used::numeric / v_limit::numeric) * 100, 2);
END;
$$;

GRANT EXECUTE ON FUNCTION check_token_budget TO authenticated;

-- Get user's token usage for current period
CREATE OR REPLACE FUNCTION get_user_token_usage(
    p_period text DEFAULT 'month',  -- 'day', 'week', 'month', 'year'
    p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
    period_start timestamptz,
    period_end timestamptz,
    total_tokens bigint,
    total_cost numeric,
    by_model jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_tenant_id uuid;
    v_start timestamptz;
BEGIN
    v_user_id := COALESCE(p_user_id, auth.uid());
    v_tenant_id := auth.tenant_id();
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant context required';
    END IF;
    
    -- Calculate period start
    v_start := date_trunc(p_period, NOW());
    
    RETURN QUERY
    SELECT 
        v_start as period_start,
        NOW() as period_end,
        COALESCE(SUM(tu.total_tokens), 0)::bigint as total_tokens,
        COALESCE(SUM(tu.cost_usd), 0)::numeric as total_cost,
        jsonb_object_agg(
            tu.model, 
            jsonb_build_object(
                'tokens', SUM(tu.total_tokens),
                'cost', SUM(tu.cost_usd),
                'calls', COUNT(*)
            )
        ) as by_model
    FROM token_usage tu
    WHERE tu.tenant_id = v_tenant_id
    AND tu.user_id = v_user_id
    AND tu.created_at >= v_start
    GROUP BY tu.model;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_token_usage TO authenticated;






