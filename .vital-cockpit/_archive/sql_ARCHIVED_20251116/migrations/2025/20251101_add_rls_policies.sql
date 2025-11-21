-- ================================================
-- RLS (Row-Level Security) Policies Migration
-- 
-- This migration enables Row-Level Security on all tenant-aware tables
-- and creates policies to enforce tenant isolation.
-- 
-- Date: 2025-11-01
-- Purpose: Enforce multi-tenant data isolation at database level
-- ================================================

-- Enable RLS on tenant-aware tables
-- ================================================

ALTER TABLE IF EXISTS agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS query_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Tenant Isolation
-- ================================================
-- These policies filter data based on current_setting('app.tenant_id')
-- which is set by the middleware for each request

-- Agents Table
-- ================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS tenant_isolation_agents ON agents;

-- Create policy: Users can only see agents in their tenant
CREATE POLICY tenant_isolation_agents ON agents
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL  -- Allow when tenant not set (for migrations)
    );

-- Agent Metrics Table
-- ================================================

DROP POLICY IF EXISTS tenant_isolation_metrics ON agent_metrics;

CREATE POLICY tenant_isolation_metrics ON agent_metrics
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

-- Knowledge Documents Table
-- ================================================

DROP POLICY IF EXISTS tenant_isolation_knowledge ON knowledge_documents;

CREATE POLICY tenant_isolation_knowledge ON knowledge_documents
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

-- Query Logs Table
-- ================================================

DROP POLICY IF EXISTS tenant_isolation_query_logs ON query_logs;

CREATE POLICY tenant_isolation_query_logs ON query_logs
    USING (
        organization_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

-- Create Helper Function for Tenant Context
-- ================================================
-- This function helps with debugging and testing tenant isolation

CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS uuid AS $$
BEGIN
    RETURN current_setting('app.tenant_id', true)::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_current_tenant_id() IS 'Returns the current tenant_id from session context, or NULL if not set';

-- Create Function to Verify RLS is Working
-- ================================================

CREATE OR REPLACE FUNCTION verify_rls_enabled(table_name text)
RETURNS boolean AS $$
DECLARE
    rls_enabled boolean;
BEGIN
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_name;
    
    RETURN COALESCE(rls_enabled, false);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION verify_rls_enabled(text) IS 'Checks if RLS is enabled on a given table';

-- Grant Necessary Permissions
-- ================================================
-- Ensure authenticated users can access their own data

GRANT SELECT, INSERT, UPDATE, DELETE ON agents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON agent_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON query_logs TO authenticated;

-- Create Indexes for Performance
-- ================================================
-- tenant_id indexes improve RLS policy performance

CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_tenant_id ON agent_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tenant_id ON knowledge_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_organization_id ON query_logs(organization_id);

-- Verify RLS is Enabled
-- ================================================

DO $$
DECLARE
    table_rec RECORD;
    tables_checked INTEGER := 0;
    tables_enabled INTEGER := 0;
BEGIN
    FOR table_rec IN
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('agents', 'agent_metrics', 'knowledge_documents', 'query_logs')
    LOOP
        tables_checked := tables_checked + 1;
        
        IF verify_rls_enabled(table_rec.tablename) THEN
            tables_enabled := tables_enabled + 1;
            RAISE NOTICE 'RLS is ENABLED on table: %', table_rec.tablename;
        ELSE
            RAISE WARNING 'RLS is NOT ENABLED on table: %', table_rec.tablename;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'RLS verification complete: % / % tables have RLS enabled', tables_enabled, tables_checked;
    
    IF tables_enabled < tables_checked THEN
        RAISE WARNING 'Some tables do not have RLS enabled! Please review configuration.';
    END IF;
END $$;

-- ================================================
-- Migration Notes
-- ================================================
-- 
-- This migration implements Row-Level Security (RLS) for multi-tenant isolation.
-- 
-- Key Features:
-- 1. RLS is enabled on all tenant-aware tables
-- 2. Policies filter data by tenant_id from session context
-- 3. Helper functions for debugging and verification
-- 4. Performance indexes on tenant_id columns
-- 
-- Usage:
-- - Middleware sets tenant context: SET LOCAL app.tenant_id = '<tenant_uuid>';
-- - Policies automatically filter queries to only return tenant's data
-- - Platform admin can bypass by not setting tenant context
-- 
-- Security Notes:
-- - RLS policies enforce tenant isolation at the database level
-- - Even direct SQL queries are filtered by tenant_id
-- - Bypassing requires superuser privileges or not setting tenant context
-- 
-- Testing:
-- - Use verify_rls_enabled() to check if RLS is enabled
-- - Use get_current_tenant_id() to verify tenant context
-- - Test with different tenant_ids to ensure isolation
-- 
-- Rollback:
-- To disable RLS (not recommended for production):
--   ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE agent_metrics DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE knowledge_documents DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE query_logs DISABLE ROW LEVEL SECURITY;
-- 
-- ================================================

