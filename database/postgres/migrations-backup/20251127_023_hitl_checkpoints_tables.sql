-- ============================================================================
-- Migration: HITL Checkpoints and LangGraph Persistence Tables
-- Date: 2025-11-27
-- Purpose: Create tables for HITL approvals and LangGraph checkpoint persistence
--          Supports real-time WebSocket approvals and workflow state management
-- ============================================================================

BEGIN;

-- ============================================================================
-- LANGGRAPH CHECKPOINTS TABLE
-- ============================================================================

-- Main checkpoints table for LangGraph state persistence
CREATE TABLE IF NOT EXISTS langgraph_checkpoints (
    id SERIAL PRIMARY KEY,
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    parent_checkpoint_id TEXT,
    tenant_id UUID,
    checkpoint JSONB NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT langgraph_checkpoints_unique
        UNIQUE(thread_id, checkpoint_ns, checkpoint_id)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_langgraph_checkpoints_thread
ON langgraph_checkpoints(thread_id, checkpoint_ns);

CREATE INDEX IF NOT EXISTS idx_langgraph_checkpoints_tenant
ON langgraph_checkpoints(tenant_id);

CREATE INDEX IF NOT EXISTS idx_langgraph_checkpoints_created
ON langgraph_checkpoints(created_at);

COMMENT ON TABLE langgraph_checkpoints IS
    'LangGraph workflow state checkpoints for persistence and resumption';

-- ============================================================================
-- CHECKPOINT WRITES TABLE (for pending writes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS langgraph_checkpoint_writes (
    id SERIAL PRIMARY KEY,
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    idx INTEGER NOT NULL,
    channel TEXT NOT NULL,
    type TEXT,
    value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT langgraph_writes_unique
        UNIQUE(thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);

CREATE INDEX IF NOT EXISTS idx_langgraph_writes_checkpoint
ON langgraph_checkpoint_writes(thread_id, checkpoint_ns, checkpoint_id);

COMMENT ON TABLE langgraph_checkpoint_writes IS
    'Pending writes for LangGraph checkpoints';

-- ============================================================================
-- HITL APPROVALS TABLE
-- ============================================================================

-- Create status enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hitl_approval_status') THEN
        CREATE TYPE hitl_approval_status AS ENUM (
            'pending',
            'approved',
            'rejected',
            'modified',
            'expired'
        );
    END IF;
END$$;

-- Main HITL approvals queue table
CREATE TABLE IF NOT EXISTS hitl_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkpoint_id TEXT NOT NULL,
    thread_id TEXT NOT NULL,
    tenant_id UUID NOT NULL,
    user_id UUID,
    checkpoint_type TEXT NOT NULL,
    request_data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    response_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    CONSTRAINT hitl_status_check
        CHECK (status IN ('pending', 'approved', 'rejected', 'modified', 'expired'))
);

-- Indexes for HITL queries
CREATE INDEX IF NOT EXISTS idx_hitl_approvals_pending
ON hitl_approvals(tenant_id, status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_hitl_approvals_thread
ON hitl_approvals(thread_id);

CREATE INDEX IF NOT EXISTS idx_hitl_approvals_tenant_created
ON hitl_approvals(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hitl_approvals_user
ON hitl_approvals(user_id) WHERE user_id IS NOT NULL;

COMMENT ON TABLE hitl_approvals IS
    'Human-in-the-Loop approval queue for autonomous workflow checkpoints';

-- ============================================================================
-- HITL STATISTICS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW hitl_stats AS
SELECT
    tenant_id,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
    COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
    COUNT(*) FILTER (WHERE status = 'modified') AS modified_count,
    COUNT(*) FILTER (WHERE status = 'expired') AS expired_count,
    COUNT(*) AS total_count,
    CASE
        WHEN COUNT(*) FILTER (WHERE status IN ('approved', 'rejected', 'modified')) > 0
        THEN COUNT(*) FILTER (WHERE status = 'approved')::NUMERIC /
             COUNT(*) FILTER (WHERE status IN ('approved', 'rejected', 'modified'))
        ELSE 0
    END AS approval_rate,
    AVG(EXTRACT(EPOCH FROM (responded_at - created_at)))
        FILTER (WHERE responded_at IS NOT NULL) AS avg_response_time_seconds
FROM hitl_approvals
GROUP BY tenant_id;

COMMENT ON VIEW hitl_stats IS
    'Aggregated HITL approval statistics per tenant';

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

/**
 * Get pending HITL approvals for tenant
 */
CREATE OR REPLACE FUNCTION get_pending_hitl_approvals(
    p_tenant_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    checkpoint_id TEXT,
    thread_id TEXT,
    checkpoint_type TEXT,
    request_data JSONB,
    created_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        id,
        checkpoint_id,
        thread_id,
        checkpoint_type,
        request_data,
        created_at,
        expires_at
    FROM hitl_approvals
    WHERE tenant_id = p_tenant_id
      AND status = 'pending'
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at ASC
    LIMIT p_limit;
$$;

/**
 * Respond to HITL approval
 */
CREATE OR REPLACE FUNCTION respond_to_hitl_approval(
    p_approval_id UUID,
    p_status TEXT,
    p_response_data JSONB DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated BOOLEAN;
BEGIN
    UPDATE hitl_approvals
    SET
        status = p_status,
        response_data = COALESCE(p_response_data, response_data),
        responded_at = NOW(),
        user_id = COALESCE(p_user_id, user_id)
    WHERE id = p_approval_id
      AND status = 'pending';

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$;

/**
 * Expire old HITL approvals
 */
CREATE OR REPLACE FUNCTION expire_old_hitl_approvals()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE hitl_approvals
    SET status = 'expired'
    WHERE status = 'pending'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

/**
 * Cleanup old checkpoints
 */
CREATE OR REPLACE FUNCTION cleanup_old_checkpoints(
    p_retention_days INTEGER DEFAULT 30
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
    v_cutoff TIMESTAMPTZ;
BEGIN
    v_cutoff := NOW() - (p_retention_days || ' days')::INTERVAL;

    -- Delete old checkpoint writes
    DELETE FROM langgraph_checkpoint_writes
    WHERE created_at < v_cutoff;

    -- Delete old checkpoints
    DELETE FROM langgraph_checkpoints
    WHERE created_at < v_cutoff;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on HITL approvals
ALTER TABLE hitl_approvals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view approvals for their tenant
CREATE POLICY hitl_approvals_tenant_policy ON hitl_approvals
    FOR ALL
    USING (
        tenant_id = COALESCE(
            current_setting('app.tenant_id', true)::UUID,
            (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Policy: Service role has full access
CREATE POLICY hitl_approvals_service_policy ON hitl_approvals
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- VALIDATION
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    -- Check tables exist
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_name IN (
        'langgraph_checkpoints',
        'langgraph_checkpoint_writes',
        'hitl_approvals'
    );

    IF table_count = 3 THEN
        RAISE NOTICE '✅ All HITL/Checkpoint tables created successfully';
    ELSE
        RAISE WARNING '❌ Some tables missing (found %/3)', table_count;
    END IF;

    -- Check functions exist
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_pending_hitl_approvals') THEN
        RAISE NOTICE '✅ get_pending_hitl_approvals function created';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'respond_to_hitl_approval') THEN
        RAISE NOTICE '✅ respond_to_hitl_approval function created';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== HITL & Checkpoint Migration Complete ===';
    RAISE NOTICE 'Tables:';
    RAISE NOTICE '  - langgraph_checkpoints (workflow state persistence)';
    RAISE NOTICE '  - langgraph_checkpoint_writes (pending writes)';
    RAISE NOTICE '  - hitl_approvals (approval queue)';
    RAISE NOTICE 'Functions:';
    RAISE NOTICE '  - get_pending_hitl_approvals(tenant_id, limit)';
    RAISE NOTICE '  - respond_to_hitl_approval(id, status, data, user)';
    RAISE NOTICE '  - expire_old_hitl_approvals()';
    RAISE NOTICE '  - cleanup_old_checkpoints(days)';
END $$;

COMMIT;
