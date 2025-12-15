-- ============================================================================
-- PHASE 0 CLEANUP & FIX
-- ============================================================================
-- Purpose: Drop partially created tables and recreate them correctly
-- Run this BEFORE running phase0_schema_completion.sql
-- ============================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS agent_panel_arbitrations CASCADE;
DROP TABLE IF EXISTS agent_panel_votes CASCADE;
DROP TABLE IF EXISTS agent_state CASCADE;
DROP TABLE IF EXISTS agent_memory_instructions CASCADE;
DROP TABLE IF EXISTS agent_memory_semantic CASCADE;
DROP TABLE IF EXISTS agent_memory_episodic CASCADE;
DROP TABLE IF EXISTS agent_node_validators CASCADE;
DROP TABLE IF EXISTS agent_validators CASCADE;
DROP TABLE IF EXISTS agent_node_roles CASCADE;
DROP TABLE IF EXISTS kg_sync_log CASCADE;
DROP TABLE IF EXISTS agent_kg_views CASCADE;
DROP TABLE IF EXISTS kg_edge_types CASCADE;
DROP TABLE IF EXISTS kg_node_types CASCADE;

-- Remove the role_id column from agent_graph_nodes if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agent_graph_nodes' AND column_name = 'role_id'
    ) THEN
        ALTER TABLE agent_graph_nodes DROP COLUMN role_id CASCADE;
    END IF;
END $$;

-- Verification
DO $$
BEGIN
    RAISE NOTICE '=== CLEANUP COMPLETE ===';
    RAISE NOTICE 'All Phase 0 tables have been dropped';
    RAISE NOTICE '';
    RAISE NOTICE '=== NEXT STEP ===';
    RAISE NOTICE 'Now run: phase0_schema_completion.sql';
    RAISE NOTICE 'Then run: seed_kg_metadata.sql';
    RAISE NOTICE 'Finally run: seed_agent_kg_views.sql';
END $$;

