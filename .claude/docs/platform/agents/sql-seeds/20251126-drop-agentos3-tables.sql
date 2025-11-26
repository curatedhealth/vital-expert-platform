-- ============================================================================
-- AgentOS 3.0: DROP EXISTING TABLES (Run this FIRST if tables exist)
-- ============================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS deepagents_tool_usage CASCADE;
DROP TABLE IF EXISTS agent_prompt_overrides CASCADE;
DROP TABLE IF EXISTS worker_execution_log CASCADE;
DROP TABLE IF EXISTS tool_registry CASCADE;
DROP TABLE IF EXISTS worker_pool_config CASCADE;
DROP TABLE IF EXISTS system_prompt_templates CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS render_system_prompt(UUID, UUID, VARCHAR, JSONB) CASCADE;

-- Verify cleanup
DO $$ BEGIN
    RAISE NOTICE '✅ All AgentOS 3.0 tables and functions dropped';
    RAISE NOTICE '📋 Ready for clean installation';
END $$;

