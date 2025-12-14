-- ============================================================================
-- FIX TENANT_ID CONSTRAINTS AND RLS POLICIES
-- ============================================================================
-- This migration adds missing foreign key constraints and enables RLS
-- on tables that were identified in the tenant_id audit
-- ============================================================================
-- Date: 2025-01-15
-- Based on: tenant_id_audit_report.md
-- ============================================================================

BEGIN;

-- ============================================================================
-- HELPER FUNCTION: Add FK constraint only if table exists and is a BASE TABLE
-- ============================================================================
CREATE OR REPLACE FUNCTION add_tenant_fk_if_table(
    p_table_name TEXT,
    p_constraint_name TEXT,
    p_on_delete TEXT DEFAULT 'CASCADE'
) RETURNS VOID AS $$
BEGIN
    -- Check if it's a base table (not a view)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = p_table_name
        AND table_type = 'BASE TABLE'
        AND table_schema = 'public'
    ) THEN
        -- Check if constraint doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = p_constraint_name
            AND table_name = p_table_name
        ) THEN
            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE %s',
                p_table_name,
                p_constraint_name,
                p_on_delete
            );
            RAISE NOTICE 'Added FK constraint % to %', p_constraint_name, p_table_name;
        ELSE
            RAISE NOTICE 'FK constraint % already exists on %', p_constraint_name, p_table_name;
        END IF;
    ELSE
        RAISE NOTICE 'Skipping % - not a base table (may be a view)', p_table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 1: ADD MISSING FOREIGN KEY CONSTRAINTS
-- ============================================================================
-- Add FK constraints to critical tables that are missing them
-- ============================================================================

-- Conversations table
SELECT add_tenant_fk_if_table('conversations', 'fk_conversations_tenant', 'SET NULL');

-- Agent sessions
SELECT add_tenant_fk_if_table('agent_sessions', 'fk_agent_sessions_tenant', 'CASCADE');

-- Agent interaction logs
SELECT add_tenant_fk_if_table('agent_interaction_logs', 'fk_agent_interaction_logs_tenant', 'CASCADE');

-- Agent selection logs
SELECT add_tenant_fk_if_table('agent_selection_logs', 'fk_agent_selection_logs_tenant', 'CASCADE');

-- JTBD Core (will be skipped if it's a view)
SELECT add_tenant_fk_if_table('jtbd_core', 'fk_jtbd_core_tenant', 'CASCADE');

-- Knowledge documents
SELECT add_tenant_fk_if_table('knowledge_documents', 'fk_knowledge_documents_tenant', 'CASCADE');

-- Knowledge sources
SELECT add_tenant_fk_if_table('knowledge_sources', 'fk_knowledge_sources_tenant', 'CASCADE');

-- Profiles
SELECT add_tenant_fk_if_table('profiles', 'fk_profiles_tenant', 'SET NULL');

-- Strategic pillars
SELECT add_tenant_fk_if_table('strategic_pillars', 'fk_strategic_pillars_tenant', 'CASCADE');

-- Missions
SELECT add_tenant_fk_if_table('missions', 'fk_missions_tenant', 'CASCADE');

-- Agent tenant access
SELECT add_tenant_fk_if_table('agent_tenant_access', 'fk_agent_tenant_access_tenant', 'CASCADE');

-- Agent validators
SELECT add_tenant_fk_if_table('agent_validators', 'fk_agent_validators_tenant', 'CASCADE');

-- Agent state
SELECT add_tenant_fk_if_table('agent_state', 'fk_agent_state_tenant', 'CASCADE');

-- Deepagents tool usage
SELECT add_tenant_fk_if_table('deepagents_tool_usage', 'fk_deepagents_tool_usage_tenant', 'CASCADE');

-- Tenant configuration tables (these should definitely have FKs)
SELECT add_tenant_fk_if_table('tenant_agents', 'fk_tenant_agents_tenant', 'CASCADE');
SELECT add_tenant_fk_if_table('tenant_apps', 'fk_tenant_apps_tenant', 'CASCADE');
SELECT add_tenant_fk_if_table('tenant_configurations', 'fk_tenant_configurations_tenant', 'CASCADE');
SELECT add_tenant_fk_if_table('tenant_feature_flags', 'fk_tenant_feature_flags_tenant', 'CASCADE');

-- Tool execution log
SELECT add_tenant_fk_if_table('tool_execution_log', 'fk_tool_execution_log_tenant', 'CASCADE');

-- ============================================================================
-- SECTION 2: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on tables that don't have it enabled
-- ============================================================================

-- Agent sessions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_sessions') THEN
        ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on agent_sessions';
    END IF;
END $$;

-- Benefit milestones
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'benefit_milestones') THEN
        ALTER TABLE benefit_milestones ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on benefit_milestones';
    END IF;
END $$;

-- Personas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas') THEN
        ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on personas';
    END IF;
END $$;

-- Strategic pillars
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategic_pillars') THEN
        ALTER TABLE strategic_pillars ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on strategic_pillars';
    END IF;
END $$;

-- Value realization tracking
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'value_realization_tracking') THEN
        ALTER TABLE value_realization_tracking ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on value_realization_tracking';
    END IF;
END $$;

-- ============================================================================
-- SECTION 3: CREATE RLS POLICIES
-- ============================================================================
-- Create basic tenant isolation policies for the tables we just enabled RLS on
-- ============================================================================

-- Helper function to get current tenant (if it doesn't exist)
CREATE OR REPLACE FUNCTION get_current_tenant() RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        NULLIF(current_setting('app.current_tenant', true), '')::uuid,
        NULL
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Agent sessions RLS policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_sessions') THEN
        DROP POLICY IF EXISTS agent_sessions_tenant_isolation ON agent_sessions;
        CREATE POLICY agent_sessions_tenant_isolation 
        ON agent_sessions FOR ALL
        USING (
            tenant_id IS NULL 
            OR tenant_id = get_current_tenant() 
            OR get_current_tenant() IS NULL
        );
        RAISE NOTICE 'Created RLS policy for agent_sessions';
    END IF;
END $$;

-- Benefit milestones RLS policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'benefit_milestones') THEN
        DROP POLICY IF EXISTS benefit_milestones_tenant_isolation ON benefit_milestones;
        CREATE POLICY benefit_milestones_tenant_isolation 
        ON benefit_milestones FOR ALL
        USING (
            tenant_id IS NULL 
            OR tenant_id = get_current_tenant() 
            OR get_current_tenant() IS NULL
        );
        RAISE NOTICE 'Created RLS policy for benefit_milestones';
    END IF;
END $$;

-- Personas RLS policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas') THEN
        DROP POLICY IF EXISTS personas_tenant_isolation ON personas;
        CREATE POLICY personas_tenant_isolation 
        ON personas FOR ALL
        USING (
            tenant_id IS NULL 
            OR tenant_id = get_current_tenant() 
            OR get_current_tenant() IS NULL
        );
        RAISE NOTICE 'Created RLS policy for personas';
    END IF;
END $$;

-- Strategic pillars RLS policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategic_pillars') THEN
        DROP POLICY IF EXISTS strategic_pillars_tenant_isolation ON strategic_pillars;
        CREATE POLICY strategic_pillars_tenant_isolation 
        ON strategic_pillars FOR ALL
        USING (
            tenant_id IS NULL 
            OR tenant_id = get_current_tenant() 
            OR get_current_tenant() IS NULL
        );
        RAISE NOTICE 'Created RLS policy for strategic_pillars';
    END IF;
END $$;

-- Value realization tracking RLS policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'value_realization_tracking') THEN
        DROP POLICY IF EXISTS value_realization_tracking_tenant_isolation ON value_realization_tracking;
        CREATE POLICY value_realization_tracking_tenant_isolation 
        ON value_realization_tracking FOR ALL
        USING (
            tenant_id IS NULL 
            OR tenant_id = get_current_tenant() 
            OR get_current_tenant() IS NULL
        );
        RAISE NOTICE 'Created RLS policy for value_realization_tracking';
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    v_fk_count INTEGER;
    v_rls_count INTEGER;
BEGIN
    -- Count FKs added
    SELECT COUNT(*) INTO v_fk_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE 'fk_%_tenant'
        AND table_schema = 'public';
    
    -- Count RLS enabled tables
    SELECT COUNT(*) INTO v_rls_count
    FROM pg_tables
    WHERE schemaname = 'public'
        AND rowsecurity = true
        AND tablename IN ('agent_sessions', 'benefit_milestones', 'personas', 'strategic_pillars', 'value_realization_tracking');
    
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'TENANT_ID FIXES COMPLETE';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'Foreign Key Constraints Added: %', v_fk_count;
    RAISE NOTICE 'RLS Enabled Tables: %', v_rls_count;
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'Note: Helper function add_tenant_fk_if_table() was created and';
    RAISE NOTICE '      can be reused for future migrations. It automatically';
    RAISE NOTICE '      skips views and only adds constraints to base tables.';
    RAISE NOTICE '================================================================';
END $$;
