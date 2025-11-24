-- ==========================================
-- FILE: agent_comprehensive_views.sql
-- PURPOSE: Create aggregated views for easy querying across the AgentOS 2.0 schema
-- PHASE: 9 of 9 - Comprehensive Views & Documentation
-- DEPENDENCIES: All previous phases (1-8) must be complete
-- GOLDEN RULES: Views for complex joins, no business logic in views
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 9: COMPREHENSIVE VIEWS & DOCUMENTATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- ==========================================
-- VIEW 1: v_agent_complete
-- Complete agent with all relationships
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- Creating v_agent_complete view ---';
END $$;

CREATE OR REPLACE VIEW v_agent_complete AS
SELECT 
    a.id,
    a.name,
    a.slug,
    a.description,
    a.tagline,
    a.title,
    a.status,
    
    -- Organizational context
    a.role_id,
    a.function_id,
    a.department_id,
    a.tenant_id,
    
    -- Skills aggregation
    STRING_AGG(DISTINCT s.name, ', ' ORDER BY s.name) as skills,
    COUNT(DISTINCT ags.skill_id) as skill_count,
    
    -- Tools aggregation
    STRING_AGG(DISTINCT t.name, ', ' ORDER BY t.name) as tools,
    COUNT(DISTINCT agt.tool_id) as tool_count,
    
    -- Specializations
    STRING_AGG(DISTINCT asp.specialization, ', ' ORDER BY asp.specialization) as specializations,
    
    -- Tags
    STRING_AGG(DISTINCT atg.tag, ', ' ORDER BY atg.tag) as tags,
    
    -- Primary graph
    (SELECT ag.name FROM agent_graphs ag 
     JOIN agent_graph_assignments aga ON ag.id = aga.graph_id 
     WHERE aga.agent_id = a.id AND aga.is_primary_graph = true 
     LIMIT 1) as primary_graph,
    
    -- Primary RAG profile
    (SELECT rp.name FROM rag_profiles rp 
     JOIN agent_rag_policies arp ON rp.id = arp.rag_profile_id 
     WHERE arp.agent_id = a.id AND arp.is_default_policy = true 
     LIMIT 1) as primary_rag_profile,
    
    -- Ratings summary
    AVG(ar.rating) as avg_rating,
    COUNT(DISTINCT ar.id) as total_ratings,
    
    -- Categories
    STRING_AGG(DISTINCT ac.name, ', ' ORDER BY ac.name) as categories,
    
    -- Timestamps
    a.created_at,
    a.updated_at,
    a.deleted_at
FROM agents a
LEFT JOIN agent_skills ags ON a.id = ags.agent_id
LEFT JOIN skills s ON ags.skill_id = s.id
LEFT JOIN agent_tools agt ON a.id = agt.agent_id
LEFT JOIN tools t ON agt.tool_id = t.id
LEFT JOIN agent_specializations asp ON a.id = asp.agent_id
LEFT JOIN agent_tags atg ON a.id = atg.agent_id
LEFT JOIN agent_ratings ar ON a.id = ar.agent_id AND ar.is_public = true
LEFT JOIN agent_category_assignments aca ON a.id = aca.agent_id
LEFT JOIN agent_categories ac ON aca.category_id = ac.id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.name, a.slug, a.description, a.tagline, a.title, a.status,
         a.role_id, a.function_id, a.department_id, a.tenant_id, a.created_at, a.updated_at, a.deleted_at;

COMMENT ON VIEW v_agent_complete IS 'Complete agent view with all aggregated relationships';

DO $$
BEGIN
    RAISE NOTICE '✓ Created v_agent_complete view';
END $$;

-- ==========================================
-- VIEW 2: v_agent_skill_inventory
-- Agent skills with proficiency and executability
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- Creating v_agent_skill_inventory view ---';
END $$;

CREATE OR REPLACE VIEW v_agent_skill_inventory AS
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    s.id as skill_id,
    s.name as skill_name,
    s.skill_type,
    s.is_executable,
    ags.proficiency_level,
    ags.is_enabled,
    ags.execution_priority,
    
    -- Parameter count
    COUNT(spd.id) as parameter_count,
    
    -- Component bindings
    STRING_AGG(lc.name, ', ' ORDER BY lc.name) as bound_components,
    
    -- Timestamps
    ags.created_at as assigned_at
FROM agents a
INNER JOIN agent_skills ags ON a.id = ags.agent_id
INNER JOIN skills s ON ags.skill_id = s.id
LEFT JOIN skill_parameter_definitions spd ON s.id = spd.skill_id
LEFT JOIN skill_components sc ON s.id = sc.skill_id
LEFT JOIN lang_components lc ON sc.component_id = lc.id
WHERE a.deleted_at IS NULL
  AND ags.is_enabled = true
GROUP BY a.id, a.name, s.id, s.name, s.skill_type, s.is_executable,
         ags.proficiency_level, ags.is_enabled, ags.execution_priority, ags.created_at;

COMMENT ON VIEW v_agent_skill_inventory IS 'Agent skill inventory with execution details';

DO $$
BEGIN
    RAISE NOTICE '✓ Created v_agent_skill_inventory view';
END $$;

-- ==========================================
-- VIEW 3: v_agent_graph_topology
-- Agent graphs with node and edge counts
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- Creating v_agent_graph_topology view ---';
END $$;

CREATE OR REPLACE VIEW v_agent_graph_topology AS
SELECT 
    ag.id as graph_id,
    ag.name as graph_name,
    ag.slug,
    ag.graph_type,
    ag.is_active,
    
    -- Node statistics
    COUNT(DISTINCT agn.id) as total_nodes,
    COUNT(DISTINCT agn.id) FILTER (WHERE agn.node_type = 'agent') as agent_nodes,
    COUNT(DISTINCT agn.id) FILTER (WHERE agn.node_type = 'tool') as tool_nodes,
    COUNT(DISTINCT agn.id) FILTER (WHERE agn.node_type = 'router') as router_nodes,
    
    -- Edge statistics
    COUNT(DISTINCT age.id) as total_edges,
    
    -- Entry node
    en.node_name as entry_node_name,
    en.node_type as entry_node_type,
    
    -- Associated agents
    COUNT(DISTINCT aga.agent_id) as assigned_agent_count,
    STRING_AGG(DISTINCT a.name, ', ' ORDER BY a.name) as assigned_agents,
    
    -- Timestamps
    ag.created_at,
    ag.updated_at
FROM agent_graphs ag
LEFT JOIN agent_graph_nodes agn ON ag.id = agn.graph_id
LEFT JOIN agent_graph_edges age ON ag.id = age.graph_id
LEFT JOIN agent_graph_nodes en ON ag.entry_node_id = en.id
LEFT JOIN agent_graph_assignments aga ON ag.id = aga.graph_id AND aga.is_active = true
LEFT JOIN agents a ON aga.agent_id = a.id AND a.deleted_at IS NULL
WHERE ag.deleted_at IS NULL
GROUP BY ag.id, ag.name, ag.slug, ag.graph_type, ag.is_active, en.node_name, en.node_type, ag.created_at, ag.updated_at;

COMMENT ON VIEW v_agent_graph_topology IS 'Agent graph topology with node and edge statistics';

DO $$
BEGIN
    RAISE NOTICE '✓ Created v_agent_graph_topology view';
END $$;

-- ==========================================
-- VIEW 4: v_agent_marketplace
-- Public marketplace view for agent discovery
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- Creating v_agent_marketplace view ---';
END $$;

CREATE OR REPLACE VIEW v_agent_marketplace AS
SELECT 
    a.id,
    a.name,
    a.slug,
    a.tagline,
    a.description,
    a.avatar_url,
    
    -- Categories
    STRING_AGG(DISTINCT ac.name, ', ' ORDER BY ac.name) as categories,
    
    -- Ratings
    ROUND(AVG(ar.rating), 2) as avg_rating,
    COUNT(DISTINCT ar.id) as total_ratings,
    
    -- Usage metrics (only if columns exist)
    a.usage_count,
    a.total_conversations,
    
    -- Featured use cases
    (SELECT COUNT(*) FROM agent_use_cases auc 
     WHERE auc.agent_id = a.id AND auc.is_featured = true) as featured_use_case_count,
    
    -- Status
    a.status,
    
    -- Latest version
    (SELECT version_number FROM agent_versions av 
     WHERE av.agent_id = a.id AND av.is_active = true 
     ORDER BY av.created_at DESC LIMIT 1) as latest_version,
    
    -- Timestamps
    a.created_at,
    a.updated_at
FROM agents a
LEFT JOIN agent_category_assignments aca ON a.id = aca.agent_id
LEFT JOIN agent_categories ac ON aca.category_id = ac.id
LEFT JOIN agent_ratings ar ON a.id = ar.agent_id AND ar.is_public = true
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.name, a.slug, a.tagline, a.description, a.avatar_url,
         a.usage_count, a.total_conversations, a.status, a.created_at, a.updated_at;

COMMENT ON VIEW v_agent_marketplace IS 'Public marketplace view for agent discovery';

DO $$
BEGIN
    RAISE NOTICE '✓ Created v_agent_marketplace view';
END $$;

-- ==========================================
-- VIEW 5: v_agent_eval_summary
-- Latest eval results per agent
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- Creating v_agent_eval_summary view ---';
END $$;

CREATE OR REPLACE VIEW v_agent_eval_summary AS
WITH latest_runs AS (
    SELECT 
        agent_id,
        suite_id,
        MAX(started_at) as latest_run_date
    FROM agent_eval_runs
    WHERE status = 'completed'
    GROUP BY agent_id, suite_id
)
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    es.name as suite_name,
    aer.started_at as latest_run_date,
    aer.pass_rate,
    aer.total_cases,
    aer.passed_cases,
    aer.failed_cases,
    aer.avg_response_time_ms,
    aer.total_cost_usd,
    aer.agent_version,
    
    -- Trend calculation (compare to previous run)
    LAG(aer.pass_rate) OVER (PARTITION BY aer.agent_id, aer.suite_id ORDER BY aer.started_at) as previous_pass_rate,
    CASE 
        WHEN LAG(aer.pass_rate) OVER (PARTITION BY aer.agent_id, aer.suite_id ORDER BY aer.started_at) IS NULL THEN 'new'
        WHEN aer.pass_rate > LAG(aer.pass_rate) OVER (PARTITION BY aer.agent_id, aer.suite_id ORDER BY aer.started_at) THEN 'improving'
        WHEN aer.pass_rate < LAG(aer.pass_rate) OVER (PARTITION BY aer.agent_id, aer.suite_id ORDER BY aer.started_at) THEN 'declining'
        ELSE 'stable'
    END as trend
FROM agents a
INNER JOIN latest_runs lr ON a.id = lr.agent_id
INNER JOIN agent_eval_runs aer ON a.id = aer.agent_id 
    AND lr.suite_id = aer.suite_id 
    AND lr.latest_run_date = aer.started_at
INNER JOIN eval_suites es ON aer.suite_id = es.id
WHERE a.deleted_at IS NULL;

COMMENT ON VIEW v_agent_eval_summary IS 'Latest evaluation results with trends per agent';

DO $$
BEGIN
    RAISE NOTICE '✓ Created v_agent_eval_summary view';
END $$;

-- ==========================================
-- VIEW 6: v_agent_routing_eligibility
-- Agents eligible for routing by policy
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- Creating v_agent_routing_eligibility view ---';
END $$;

CREATE OR REPLACE VIEW v_agent_routing_eligibility AS
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    rp.name as policy_name,
    rp.policy_type,
    are.is_eligible,
    are.priority_boost,
    are.max_concurrent_requests,
    are.rate_limit_per_minute,
    
    -- Policy details
    rp.min_confidence_threshold,
    rp.max_response_time_ms,
    rp.enable_load_balancing,
    
    -- Current metrics (from agent_metrics if exists)
    a.usage_count as total_usage_count,
    a.average_rating,
    
    -- Timestamps
    are.created_at as assigned_at,
    are.updated_at as last_updated
FROM agents a
INNER JOIN agent_routing_eligibility are ON a.id = are.agent_id
INNER JOIN routing_policies rp ON are.routing_policy_id = rp.id
WHERE a.deleted_at IS NULL
  AND rp.is_active = true
  AND are.is_eligible = true;

COMMENT ON VIEW v_agent_routing_eligibility IS 'Eligible agents per routing policy with constraints';

DO $$
BEGIN
    RAISE NOTICE '✓ Created v_agent_routing_eligibility view';
END $$;

-- ==========================================
-- VERIFICATION
-- ==========================================

DO $$
DECLARE
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name LIKE 'v\_agent\_%';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== PHASE 9 COMPLETE ===';
    RAISE NOTICE 'Agent views created: %', view_count;
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 9 COMPLETE: COMPREHENSIVE VIEWS & DOCUMENTATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 AGENTOS 2.0 SCHEMA COMPLETE!';
    RAISE NOTICE '   All 9 phases successfully migrated.';
    RAISE NOTICE '   Total views: %', view_count;
    RAISE NOTICE '=================================================================';
END $$;

-- List all created views
SELECT 
    table_name as view_name,
    obj_description((table_schema || '.' || table_name)::regclass, 'pg_class') as description
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'v_agent_%'
ORDER BY table_name;

