-- ============================================================================
-- VITAL Path - Jobs Table RLS Policies
-- ============================================================================
-- 
-- Async jobs track long-running operations (Mode 3-4, Panel simulations, etc.)
-- Users can only access their own jobs.
-- ============================================================================

-- Enable RLS on jobs table
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners
ALTER TABLE jobs FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Users can view their own jobs
CREATE POLICY "jobs_select_own"
ON jobs
FOR SELECT
USING (
    tenant_id = auth.tenant_id()
    AND user_id = auth.uid()
);

-- Tenant admins can view all jobs in their tenant (monitoring)
CREATE POLICY "jobs_select_tenant_admin"
ON jobs
FOR SELECT
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
);

-- System admins can view all jobs
CREATE POLICY "jobs_select_system"
ON jobs
FOR SELECT
USING (
    auth.is_system_admin()
);

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Jobs are created by the system when async operations start
CREATE POLICY "jobs_insert_tenant"
ON jobs
FOR INSERT
WITH CHECK (
    tenant_id = auth.tenant_id()
    AND user_id = auth.uid()
);

-- Workers can create jobs on behalf of users
CREATE POLICY "jobs_insert_worker"
ON jobs
FOR INSERT
WITH CHECK (
    auth.is_system_admin()
);

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Workers update job status (running, completed, failed)
-- Users cannot update their own jobs directly
CREATE POLICY "jobs_update_worker"
ON jobs
FOR UPDATE
USING (
    auth.is_system_admin()
)
WITH CHECK (
    auth.is_system_admin()
);

-- Users can cancel their own jobs
CREATE POLICY "jobs_update_cancel_own"
ON jobs
FOR UPDATE
USING (
    tenant_id = auth.tenant_id()
    AND user_id = auth.uid()
    AND status IN ('queued', 'running')
)
WITH CHECK (
    tenant_id = auth.tenant_id()
    AND status = 'cancelled'
);

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Users can delete their completed jobs (cleanup)
CREATE POLICY "jobs_delete_own_completed"
ON jobs
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND user_id = auth.uid()
    AND status IN ('completed', 'failed', 'cancelled')
);

-- System can purge old jobs
CREATE POLICY "jobs_delete_system"
ON jobs
FOR DELETE
USING (
    auth.is_system_admin()
);

-- ============================================================================
-- INDEXES FOR RLS PERFORMANCE
-- ============================================================================

-- Index for user's jobs
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_user 
ON jobs(tenant_id, user_id);

-- Index for status polling
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_user_status 
ON jobs(tenant_id, user_id, status);

-- Index for active jobs
CREATE INDEX IF NOT EXISTS idx_jobs_active 
ON jobs(status) WHERE status IN ('queued', 'running');

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_jobs_completed_at 
ON jobs(completed_at) WHERE status IN ('completed', 'failed', 'cancelled');






