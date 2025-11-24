-- ============================================================================
-- PHASE 0 VERIFICATION: Schema Completion
-- ============================================================================
-- Purpose: Verify all Phase 0 schema components are correctly created
-- Run after: phase0_schema_completion.sql
-- ============================================================================

\echo '=== PHASE 0 VERIFICATION: SCHEMA COMPLETION ==='
\echo ''

-- ============================================================================
-- 1. TABLE EXISTENCE CHECKS
-- ============================================================================

\echo '1. Verifying table existence...'

SELECT 
    'kg_node_types' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kg_node_types') 
        THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
UNION ALL
SELECT 'kg_edge_types',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kg_edge_types')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'agent_kg_views',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_kg_views')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'kg_sync_log',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kg_sync_log')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'agent_node_roles',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_node_roles')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'agent_validators',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_validators')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'agent_node_validators',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_node_validators')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'agent_memory_episodic',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_memory_episodic')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'agent_memory_semantic',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_memory_semantic')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'agent_memory_instructions',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_memory_instructions')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'agent_state',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_state')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'agent_panel_votes',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_panel_votes')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'agent_panel_arbitrations',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_panel_arbitrations')
        THEN '✓ EXISTS' ELSE '✗ MISSING' END;

\echo ''

-- ============================================================================
-- 2. COLUMN ADDITIONS CHECK
-- ============================================================================

\echo '2. Verifying column additions...'

SELECT 
    'agent_graph_nodes.role_id' as column_addition,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agent_graph_nodes' AND column_name = 'role_id'
    ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status;

\echo ''

-- ============================================================================
-- 3. SEEDED DATA CHECK
-- ============================================================================

\echo '3. Verifying seeded data...'

SELECT 
    'agent_node_roles' as table_name,
    COUNT(*) as row_count,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✓ SEEDED'
        WHEN COUNT(*) > 0 THEN '⚠ PARTIAL'
        ELSE '✗ EMPTY'
    END as status
FROM agent_node_roles;

\echo ''

-- ============================================================================
-- 4. FOREIGN KEY CONSTRAINTS CHECK
-- ============================================================================

\echo '4. Verifying foreign key constraints...'

SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    '✓ VALID' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN (
    'agent_kg_views', 'agent_node_validators', 'agent_memory_episodic',
    'agent_memory_semantic', 'agent_memory_instructions', 'agent_state',
    'agent_panel_votes', 'agent_panel_arbitrations'
)
ORDER BY tc.table_name, tc.constraint_name;

\echo ''

-- ============================================================================
-- 5. INDEX VERIFICATION
-- ============================================================================

\echo '5. Verifying indexes...'

SELECT 
    schemaname,
    tablename,
    indexname,
    '✓ EXISTS' as status
FROM pg_indexes
WHERE tablename IN (
    'kg_node_types', 'kg_edge_types', 'agent_kg_views', 'kg_sync_log',
    'agent_validators', 'agent_node_validators',
    'agent_memory_episodic', 'agent_memory_semantic', 'agent_memory_instructions', 'agent_state',
    'agent_panel_votes', 'agent_panel_arbitrations', 'agent_graph_nodes'
)
AND schemaname = 'public'
ORDER BY tablename, indexname;

\echo ''

-- ============================================================================
-- 6. CHECK CONSTRAINTS VERIFICATION
-- ============================================================================

\echo '6. Verifying check constraints...'

SELECT 
    tc.table_name,
    tc.constraint_name,
    cc.check_clause,
    '✓ VALID' as status
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
AND tc.table_name IN (
    'agent_kg_views', 'kg_sync_log', 'agent_node_roles',
    'agent_validators', 'agent_memory_semantic', 'agent_state',
    'agent_panel_votes', 'agent_panel_arbitrations'
)
ORDER BY tc.table_name, tc.constraint_name;

\echo ''

-- ============================================================================
-- 7. SUMMARY STATISTICS
-- ============================================================================

\echo '7. Summary statistics...'

SELECT 
    'Total new tables' as metric,
    COUNT(*) as value
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'kg_node_types', 'kg_edge_types', 'agent_kg_views', 'kg_sync_log',
    'agent_node_roles', 'agent_validators', 'agent_node_validators',
    'agent_memory_episodic', 'agent_memory_semantic', 'agent_memory_instructions', 'agent_state',
    'agent_panel_votes', 'agent_panel_arbitrations'
)
UNION ALL
SELECT 
    'Total new indexes',
    COUNT(*)
FROM pg_indexes
WHERE tablename IN (
    'kg_node_types', 'kg_edge_types', 'agent_kg_views', 'kg_sync_log',
    'agent_validators', 'agent_node_validators',
    'agent_memory_episodic', 'agent_memory_semantic', 'agent_memory_instructions', 'agent_state',
    'agent_panel_votes', 'agent_panel_arbitrations', 'agent_graph_nodes'
)
AND schemaname = 'public'
UNION ALL
SELECT 
    'Agent node roles seeded',
    COUNT(*)
FROM agent_node_roles;

\echo ''
\echo '=== PHASE 0 VERIFICATION COMPLETE ==='
\echo ''
\echo 'Expected Results:'
\echo '- 13 new tables created'
\echo '- 1 column added (agent_graph_nodes.role_id)'
\echo '- 10 agent node roles seeded'
\echo '- Multiple indexes and constraints created'
\echo ''
\echo 'Next Steps:'
\echo '1. Run seed_kg_metadata.sql to populate KG types'
\echo '2. Run seed_agent_kg_views.sql to create agent KG views'
\echo '3. Proceed to Phase 1: GraphRAG Foundation'

