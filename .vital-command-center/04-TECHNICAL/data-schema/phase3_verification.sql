-- ==========================================
-- FILE: phase3_verification.sql
-- PURPOSE: Standalone verification queries for Phase 3 Agent Graph Model
-- PHASE: 3 of 9 - Agent Graph Model Verification
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 3 VERIFICATION: AGENT GRAPH MODEL';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Check 1: Verify all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN ('agent_graphs', 'agent_graph_nodes', 'agent_graph_edges', 
                         'agent_hierarchies', 'agent_graph_assignments');
    
    IF table_count = 5 THEN
        RAISE NOTICE '✓ All 5 graph tables exist';
    ELSE
        RAISE WARNING '⚠ Expected 5 tables, found %', table_count;
    END IF;
END $$;

-- Check 2: Verify foreign key integrity
DO $$
DECLARE
    orphan_nodes INTEGER;
    orphan_edges INTEGER;
    orphan_assignments INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_nodes 
    FROM agent_graph_nodes 
    WHERE NOT EXISTS (SELECT 1 FROM agent_graphs WHERE id = agent_graph_nodes.graph_id);
    
    SELECT COUNT(*) INTO orphan_edges 
    FROM agent_graph_edges 
    WHERE NOT EXISTS (SELECT 1 FROM agent_graphs WHERE id = agent_graph_edges.graph_id);
    
    SELECT COUNT(*) INTO orphan_assignments 
    FROM agent_graph_assignments 
    WHERE NOT EXISTS (SELECT 1 FROM agents WHERE id = agent_graph_assignments.agent_id)
       OR NOT EXISTS (SELECT 1 FROM agent_graphs WHERE id = agent_graph_assignments.graph_id);
    
    IF orphan_nodes = 0 AND orphan_edges = 0 AND orphan_assignments = 0 THEN
        RAISE NOTICE '✓ No orphaned records - all foreign keys valid';
    ELSE
        RAISE WARNING '⚠ Found orphaned records: nodes=%, edges=%, assignments=%', 
                      orphan_nodes, orphan_edges, orphan_assignments;
    END IF;
END $$;

-- Check 3: Verify graph type constraints
SELECT 
    'Graph Type Distribution' as metric,
    graph_type,
    COUNT(*) as count
FROM agent_graphs
GROUP BY graph_type
ORDER BY count DESC;

-- Check 4: Verify node type distribution
SELECT 
    'Node Type Distribution' as metric,
    node_type,
    COUNT(*) as count
FROM agent_graph_nodes
GROUP BY node_type
ORDER BY count DESC;

-- ROW COUNT SUMMARY
SELECT 
    'Agent Graphs' as entity,
    COUNT(*) as count
FROM agent_graphs
UNION ALL
SELECT 'Graph Nodes', COUNT(*) FROM agent_graph_nodes
UNION ALL
SELECT 'Graph Edges', COUNT(*) FROM agent_graph_edges
UNION ALL
SELECT 'Agent Hierarchies', COUNT(*) FROM agent_hierarchies
UNION ALL
SELECT 'Agent-Graph Assignments', COUNT(*) FROM agent_graph_assignments;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ PHASE 3 VERIFICATION COMPLETE';
END $$;

