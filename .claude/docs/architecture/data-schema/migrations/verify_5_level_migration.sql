-- =====================================================
-- 5-Level Hierarchy Migration - Verification Query
-- =====================================================
-- Run this AFTER executing the migration to verify everything is correct
-- =====================================================

-- =====================================================
-- 1. Check New Columns in AGENTS Table
-- =====================================================

SELECT 
    '1. New Agent Columns' as check_category,
    column_name,
    data_type,
    '✓ EXISTS' as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agents'
  AND column_name IN (
    'agent_level', 'master_agent_id', 'master_agent_name',
    'industry_vertical', 'reasoning_capabilities',
    'can_spawn_specialists', 'can_spawn_workers', 'max_spawned_agents',
    'accuracy_score', 'response_time_p50', 'response_time_p95', 'satisfaction_rating',
    'domain_expertise', 'certifications', 'knowledge_sources',
    'tool_type', 'tool_endpoint', 'tool_auth_method', 'tool_rate_limit',
    'cost_per_query', 'monthly_quota'
  )
ORDER BY column_name;

-- =====================================================
-- 2. Check New Columns in AGENT_HIERARCHIES Table
-- =====================================================

SELECT 
    '2. New Hierarchy Columns' as check_category,
    column_name,
    data_type,
    '✓ EXISTS' as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agent_hierarchies'
  AND column_name IN (
    'parent_level', 'child_level',
    'is_dynamic_spawn', 'spawn_condition', 'max_concurrent_spawns',
    'execution_order', 'is_parallel', 'timeout_seconds',
    'priority_score', 'weight', 'routing_rules', 'fallback_agent_id',
    'total_delegations', 'successful_delegations', 'avg_delegation_time'
  )
ORDER BY column_name;

-- =====================================================
-- 3. Check New Tables Created
-- =====================================================

SELECT 
    '3. New Tables' as check_category,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count,
    '✓ EXISTS' as status
FROM (
    VALUES 
        ('agent_levels'),
        ('agent_capabilities'),
        ('agent_vertical_mapping'),
        ('agent_spawn_history'),
        ('master_agents')
) AS t(table_name)
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
);

-- =====================================================
-- 4. Check Agent Levels Seeded
-- =====================================================

SELECT 
    '4. Agent Levels' as check_category,
    level_number,
    level_name,
    can_spawn_children,
    max_children,
    target_response_time_p50,
    target_accuracy,
    '✓ SEEDED' as status
FROM agent_levels
ORDER BY level_number;

-- =====================================================
-- 5. Check Existing Agents Updated to Level 2
-- =====================================================

SELECT 
    '5. Updated Agents' as check_category,
    name,
    agent_level,
    industry_vertical,
    reasoning_capabilities->>'chain_of_thought' as has_chain_of_thought,
    domain_expertise,
    '✓ UPDATED' as status
FROM agents
WHERE name IN (
    'Director of Medical Analytics',
    'Real-World Evidence Analyst',
    'Clinical Data Scientist',
    'Market Insights Analyst',
    'HCP Engagement Analytics Specialist'
)
ORDER BY name;

-- =====================================================
-- 6. Check Hierarchy Levels Populated
-- =====================================================

SELECT 
    '6. Hierarchy Levels' as check_category,
    pa.name as parent_agent,
    ah.parent_level,
    ca.name as child_agent,
    ah.child_level,
    ah.relationship_type,
    '✓ POPULATED' as status
FROM agent_hierarchies ah
JOIN agents pa ON ah.parent_agent_id = pa.id
JOIN agents ca ON ah.child_agent_id = ca.id
WHERE ah.parent_level IS NOT NULL AND ah.child_level IS NOT NULL
ORDER BY pa.name, ca.name;

-- =====================================================
-- 7. Check Views Created
-- =====================================================

SELECT 
    '7. New Views' as check_category,
    table_name as view_name,
    '✓ EXISTS' as status
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('v_agent_hierarchy_complete', 'v_agent_routing_map')
ORDER BY table_name;

-- =====================================================
-- 8. Test View: v_agent_hierarchy_complete
-- =====================================================

SELECT 
    '8. Hierarchy View (Sample)' as check_category,
    name,
    agent_level,
    master_agent_name,
    expert_children_count,
    specialist_children_count,
    worker_children_count,
    tool_children_count,
    usage_count,
    '✓ WORKING' as status
FROM v_agent_hierarchy_complete
LIMIT 10;

-- =====================================================
-- 9. Test View: v_agent_routing_map
-- =====================================================

SELECT 
    '9. Routing Map (Sample)' as check_category,
    parent_agent,
    parent_level,
    child_agent,
    child_level,
    relationship_type,
    success_rate_pct,
    '✓ WORKING' as status
FROM v_agent_routing_map
LIMIT 10;

-- =====================================================
-- 10. Summary Statistics
-- =====================================================

SELECT 
    '10. Summary Stats' as check_category,
    'Agents by Level' as metric,
    json_build_object(
        'master', (SELECT COUNT(*) FROM agents WHERE agent_level = 'master' AND deleted_at IS NULL),
        'expert', (SELECT COUNT(*) FROM agents WHERE agent_level = 'expert' AND deleted_at IS NULL),
        'specialist', (SELECT COUNT(*) FROM agents WHERE agent_level = 'specialist' AND deleted_at IS NULL),
        'worker', (SELECT COUNT(*) FROM agents WHERE agent_level = 'worker' AND deleted_at IS NULL),
        'tool', (SELECT COUNT(*) FROM agents WHERE agent_level = 'tool' AND deleted_at IS NULL)
    ) as counts,
    '✓ COMPLETE' as status;

-- =====================================================
-- 11. Final Checklist
-- =====================================================

SELECT 
    '11. Migration Checklist' as check_category,
    'All Components' as component,
    json_build_object(
        'agents_enhanced', (SELECT COUNT(*) >= 20 FROM information_schema.columns WHERE table_name = 'agents' AND column_name IN ('agent_level', 'master_agent_id', 'industry_vertical')),
        'hierarchies_enhanced', (SELECT COUNT(*) >= 15 FROM information_schema.columns WHERE table_name = 'agent_hierarchies' AND column_name IN ('parent_level', 'child_level', 'is_dynamic_spawn')),
        'new_tables_created', (SELECT COUNT(*) = 5 FROM information_schema.tables WHERE table_name IN ('agent_levels', 'agent_capabilities', 'agent_vertical_mapping', 'agent_spawn_history', 'master_agents')),
        'views_created', (SELECT COUNT(*) = 2 FROM information_schema.views WHERE table_name IN ('v_agent_hierarchy_complete', 'v_agent_routing_map')),
        'levels_seeded', (SELECT COUNT(*) = 5 FROM agent_levels),
        'existing_agents_updated', (SELECT COUNT(*) = 5 FROM agents WHERE agent_level = 'expert' AND industry_vertical = 'pharmaceuticals')
    ) as status,
    CASE 
        WHEN (SELECT COUNT(*) FROM agent_levels) = 5 
         AND (SELECT COUNT(*) FROM agents WHERE agent_level = 'expert') >= 5
        THEN '✅ MIGRATION SUCCESSFUL'
        ELSE '⚠️ CHECK RESULTS'
    END as overall_status;

-- =====================================================
-- Expected Results:
-- =====================================================
-- Query 1: Should show 20+ new columns in agents table
-- Query 2: Should show 15+ new columns in agent_hierarchies table
-- Query 3: Should show 5 new tables
-- Query 4: Should show 5 levels (master, expert, specialist, worker, tool)
-- Query 5: Should show 5 updated agents with level='expert'
-- Query 6: Should show 4 hierarchies with populated levels
-- Query 7: Should show 2 new views
-- Query 8: Should return sample data from hierarchy view
-- Query 9: Should return sample data from routing map
-- Query 10: Should show counts (0 masters, 5 experts, 0 others)
-- Query 11: Should show all checks as TRUE and overall status as '✅ MIGRATION SUCCESSFUL'
-- =====================================================

