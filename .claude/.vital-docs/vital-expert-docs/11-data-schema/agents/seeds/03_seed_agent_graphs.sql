-- =====================================================
-- Agent Graph Seeds for Medical Affairs Analytics
-- =====================================================
-- Creates agent graphs for different execution patterns
-- =====================================================

DO $$
DECLARE
    v_director_id UUID;
    v_rwe_analyst_id UUID;
    v_clinical_ds_id UUID;
    v_market_insights_id UUID;
    v_hcp_analytics_id UUID;
    
    v_graph_strategic_id UUID;
    v_graph_deep_dive_id UUID;
    v_graph_panel_id UUID;
    
    v_node_id UUID;
    v_planner_role_id UUID;
    v_executor_role_id UUID;
    v_critic_role_id UUID;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Seeding Agent Graphs';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';

    -- Get agent IDs
    SELECT id INTO v_director_id FROM agents WHERE name = 'Director of Medical Analytics';
    SELECT id INTO v_rwe_analyst_id FROM agents WHERE name = 'Real-World Evidence Analyst';
    SELECT id INTO v_clinical_ds_id FROM agents WHERE name = 'Clinical Data Scientist';
    SELECT id INTO v_market_insights_id FROM agents WHERE name = 'Market Insights Analyst';
    SELECT id INTO v_hcp_analytics_id FROM agents WHERE name = 'HCP Engagement Analytics Specialist';

    -- Get agent node roles
    SELECT id INTO v_planner_role_id FROM agent_node_roles WHERE name = 'planner';
    SELECT id INTO v_executor_role_id FROM agent_node_roles WHERE name = 'executor';
    SELECT id INTO v_critic_role_id FROM agent_node_roles WHERE name = 'critic';

    -- =====================================================
    -- GRAPH 1: Strategic Analytics Flow (Director-led)
    -- =====================================================
    
    INSERT INTO agent_graphs (
        name,
        description,
        graph_type,
        is_active
    ) VALUES (
        'Strategic Analytics Flow',
        'Director-led strategic analysis with delegation to specialists as needed',
        'sequential',
        true
    )
    RETURNING id INTO v_graph_strategic_id;
    
    RAISE NOTICE '✓ Created Graph: Strategic Analytics Flow';

    -- Node 1: Director (Planner)
    INSERT INTO agent_graph_nodes (
        graph_id,
        agent_id,
        role_id,
        node_name,
        node_type,
        execution_order,
        is_entry_point
    ) VALUES (
        v_graph_strategic_id,
        v_director_id,
        v_planner_role_id,
        'strategic_planner',
        'agent',
        1,
        true
    )
    RETURNING id INTO v_node_id;

    -- Node 2: Director (Executor)
    INSERT INTO agent_graph_nodes (
        graph_id,
        agent_id,
        role_id,
        node_name,
        node_type,
        execution_order,
        is_entry_point
    ) VALUES (
        v_graph_strategic_id,
        v_director_id,
        v_executor_role_id,
        'strategic_executor',
        'agent',
        2,
        false
    );

    RAISE NOTICE '  ✓ Added 2 nodes (Director as planner and executor)';

    -- =====================================================
    -- GRAPH 2: Deep Dive Analysis (Specialist-led)
    -- =====================================================
    
    INSERT INTO agent_graphs (
        name,
        description,
        graph_type,
        is_active
    ) VALUES (
        'Deep Dive Analysis Flow',
        'Specialist-led deep analysis with critic review',
        'sequential',
        true
    )
    RETURNING id INTO v_graph_deep_dive_id;
    
    RAISE NOTICE '✓ Created Graph: Deep Dive Analysis Flow';

    -- Node 1: Specialist (Executor) - will be selected dynamically
    INSERT INTO agent_graph_nodes (
        graph_id,
        agent_id,
        role_id,
        node_name,
        node_type,
        execution_order,
        is_entry_point
    ) VALUES (
        v_graph_deep_dive_id,
        v_rwe_analyst_id,
        v_executor_role_id,
        'specialist_executor',
        'agent',
        1,
        true
    );

    -- Node 2: Director (Critic)
    INSERT INTO agent_graph_nodes (
        graph_id,
        agent_id,
        role_id,
        node_name,
        node_type,
        execution_order,
        is_entry_point
    ) VALUES (
        v_graph_deep_dive_id,
        v_director_id,
        v_critic_role_id,
        'quality_reviewer',
        'agent',
        2,
        false
    );

    RAISE NOTICE '  ✓ Added 2 nodes (Specialist executor + Director critic)';

    -- =====================================================
    -- GRAPH 3: Panel Discussion (Multi-specialist)
    -- =====================================================
    
    INSERT INTO agent_graphs (
        name,
        description,
        graph_type,
        is_active
    ) VALUES (
        'Multi-Specialist Panel',
        'Panel discussion with multiple analytics specialists for complex queries',
        'parallel',
        true
    )
    RETURNING id INTO v_graph_panel_id;
    
    RAISE NOTICE '✓ Created Graph: Multi-Specialist Panel';

    -- Panel node with all specialists
    INSERT INTO agent_graph_nodes (
        graph_id,
        agent_id,
        role_id,
        node_name,
        node_type,
        execution_order,
        is_entry_point
    ) VALUES (
        v_graph_panel_id,
        v_director_id,
        v_planner_role_id,
        'panel_coordinator',
        'panel',
        1,
        true
    );

    RAISE NOTICE '  ✓ Added panel coordinator node';

    -- =====================================================
    -- ASSIGN GRAPHS TO AGENTS
    -- =====================================================
    
    -- Director uses Strategic Analytics Flow by default
    UPDATE agents 
    SET primary_graph_id = v_graph_strategic_id
    WHERE id = v_director_id;
    
    RAISE NOTICE '✓ Assigned Strategic Analytics Flow to Director';

    -- Specialists use Deep Dive Analysis
    UPDATE agents 
    SET primary_graph_id = v_graph_deep_dive_id
    WHERE id IN (v_rwe_analyst_id, v_clinical_ds_id, v_market_insights_id, v_hcp_analytics_id);
    
    RAISE NOTICE '✓ Assigned Deep Dive Analysis Flow to all specialists';

    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Agent Graphs Seeding Complete!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - 3 agent graphs created';
    RAISE NOTICE '  - All agents have primary_graph_id assigned';
    RAISE NOTICE '';

END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Show all graphs
SELECT 
    'Agent Graphs' as summary,
    ag.name,
    ag.graph_type,
    ag.is_active,
    COUNT(DISTINCT agn.id) as node_count
FROM agent_graphs ag
LEFT JOIN agent_graph_nodes agn ON ag.id = agn.graph_id
WHERE ag.name IN (
    'Strategic Analytics Flow',
    'Deep Dive Analysis Flow',
    'Multi-Specialist Panel'
)
GROUP BY ag.id, ag.name, ag.graph_type, ag.is_active
ORDER BY ag.name;

-- Show agent-to-graph assignments
SELECT 
    'Agent Graph Assignments' as summary,
    a.name as agent_name,
    ag.name as primary_graph
FROM agents a
LEFT JOIN agent_graphs ag ON a.primary_graph_id = ag.id
WHERE a.name IN (
    'Director of Medical Analytics',
    'Real-World Evidence Analyst',
    'Clinical Data Scientist',
    'Market Insights Analyst',
    'HCP Engagement Analytics Specialist'
)
ORDER BY 
    CASE 
        WHEN a.name = 'Director of Medical Analytics' THEN 1
        ELSE 2
    END,
    a.name;

