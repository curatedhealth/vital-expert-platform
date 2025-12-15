/**
 * SECURITY AUDIT: Security Definer Views Analysis (Cloud Database)
 *
 * This is a simplified version for running in Supabase Dashboard SQL Editor
 */

-- ============================================================================
-- ANALYSIS 1: List All Security Definer Views with Details
-- ============================================================================

SELECT
  'SECURITY DEFINER VIEWS REPORT' as report_section,
  viewname as view_name,
  viewowner as owner,
  'SECURITY DEFINER' as security_mode,
  LENGTH(definition) as definition_size
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN (
    'v_jtbd_complete',
    'v_effective_persona_responsibilities',
    'v_jtbd_by_org',
    'v_role_evidence_summary',
    'v_projects_hierarchy',
    'v_personas_full_org',
    'v_routine_workflows',
    'user_popular_agents',
    'v_agent_skill_inventory',
    'user_recent_agents',
    'v_effective_persona_stakeholders',
    'v_effective_persona_skills',
    'knowledge_sources',
    'v_effective_persona_tools',
    'v_effective_persona_ai_maturity',
    'v_agent_personality',
    'v_agent_routing_eligibility',
    'user_favorite_agents',
    'v_role_persona_jtbd_hierarchy',
    'v_agent_eval_summary',
    'v_persona_gen_ai_readiness',
    'v_agent_with_defaults',
    'v_agent_complete',
    'v_project_workflows',
    'v_operations_hierarchy',
    'v_persona_evidence_summary',
    'v_agent_graph_topology',
    'jtbd_core',
    'v_agent_marketplace',
    'v_persona_complete_context',
    'v_jtbd_value_ai_summary',
    'v_gen_ai_opportunities_by_archetype',
    'v_jtbd_workflow_coverage',
    'v_workflow_complete',
    'v_persona_jtbd_inherited',
    'v_effective_persona_vpanes',
    'v_agents_full_org',
    'jtbd_personas',
    'user_agents_with_details'
  )
ORDER BY viewname;

-- ============================================================================
-- ANALYSIS 2: Check for RLS Policies on Views
-- ============================================================================

SELECT
  'RLS POLICY CHECK' as report_section,
  v.viewname as view_name,
  COALESCE(p.policy_count, 0) as rls_policies,
  CASE
    WHEN COALESCE(p.policy_count, 0) > 0 THEN 'Has RLS'
    ELSE '⚠ NO RLS'
  END as rls_status,
  CASE
    WHEN v.viewname LIKE 'user_%' THEN 'HIGH RISK - User Facing'
    WHEN v.viewname LIKE '%_complete' THEN 'HIGH RISK - Complete Data'
    WHEN v.viewname LIKE '%_summary' THEN 'MEDIUM RISK - Aggregation'
    WHEN v.viewname LIKE '%_hierarchy' THEN 'MEDIUM RISK - Hierarchy'
    ELSE 'REVIEW NEEDED'
  END as risk_category
FROM pg_views v
LEFT JOIN (
  SELECT tablename, COUNT(*) as policy_count
  FROM pg_policies
  GROUP BY tablename
) p ON v.viewname = p.tablename
WHERE v.schemaname = 'public'
  AND v.viewname IN (
    'v_jtbd_complete',
    'v_effective_persona_responsibilities',
    'v_jtbd_by_org',
    'v_role_evidence_summary',
    'v_projects_hierarchy',
    'v_personas_full_org',
    'v_routine_workflows',
    'user_popular_agents',
    'v_agent_skill_inventory',
    'user_recent_agents',
    'v_effective_persona_stakeholders',
    'v_effective_persona_skills',
    'knowledge_sources',
    'v_effective_persona_tools',
    'v_effective_persona_ai_maturity',
    'v_agent_personality',
    'v_agent_routing_eligibility',
    'user_favorite_agents',
    'v_role_persona_jtbd_hierarchy',
    'v_agent_eval_summary',
    'v_persona_gen_ai_readiness',
    'v_agent_with_defaults',
    'v_agent_complete',
    'v_project_workflows',
    'v_operations_hierarchy',
    'v_persona_evidence_summary',
    'v_agent_graph_topology',
    'jtbd_core',
    'v_agent_marketplace',
    'v_persona_complete_context',
    'v_jtbd_value_ai_summary',
    'v_gen_ai_opportunities_by_archetype',
    'v_jtbd_workflow_coverage',
    'v_workflow_complete',
    'v_persona_jtbd_inherited',
    'v_effective_persona_vpanes',
    'v_agents_full_org',
    'jtbd_personas',
    'user_agents_with_details'
  )
ORDER BY
  CASE risk_category
    WHEN 'HIGH RISK - User Facing' THEN 1
    WHEN 'HIGH RISK - Complete Data' THEN 2
    WHEN 'MEDIUM RISK - Aggregation' THEN 3
    WHEN 'MEDIUM RISK - Hierarchy' THEN 4
    ELSE 5
  END,
  view_name;

-- ============================================================================
-- ANALYSIS 3: Categorize Views by Risk and Recommendation
-- ============================================================================

SELECT
  'RECOMMENDATIONS BY CATEGORY' as report_section,
  risk_category,
  COUNT(*) as view_count,
  CASE risk_category
    WHEN 'HIGH RISK - User Facing' THEN 'URGENT: Convert to SECURITY INVOKER + Add RLS'
    WHEN 'HIGH RISK - Complete Data' THEN 'HIGH PRIORITY: Review necessity of SECURITY DEFINER, add RLS'
    WHEN 'MEDIUM RISK - Aggregation' THEN 'MEDIUM PRIORITY: Document justification, consider RLS'
    WHEN 'MEDIUM RISK - Hierarchy' THEN 'MEDIUM PRIORITY: Review for tenant isolation needs'
    ELSE 'REVIEW: Assess business need for SECURITY DEFINER'
  END as recommended_action
FROM (
  SELECT
    viewname,
    CASE
      WHEN viewname LIKE 'user_%' THEN 'HIGH RISK - User Facing'
      WHEN viewname LIKE '%_complete' THEN 'HIGH RISK - Complete Data'
      WHEN viewname LIKE '%_summary' THEN 'MEDIUM RISK - Aggregation'
      WHEN viewname LIKE '%_hierarchy' THEN 'MEDIUM RISK - Hierarchy'
      ELSE 'REVIEW NEEDED'
    END as risk_category
  FROM pg_views
  WHERE schemaname = 'public'
    AND viewname IN (
      'v_jtbd_complete', 'v_effective_persona_responsibilities', 'v_jtbd_by_org',
      'v_role_evidence_summary', 'v_projects_hierarchy', 'v_personas_full_org',
      'v_routine_workflows', 'user_popular_agents', 'v_agent_skill_inventory',
      'user_recent_agents', 'v_effective_persona_stakeholders', 'v_effective_persona_skills',
      'knowledge_sources', 'v_effective_persona_tools', 'v_effective_persona_ai_maturity',
      'v_agent_personality', 'v_agent_routing_eligibility', 'user_favorite_agents',
      'v_role_persona_jtbd_hierarchy', 'v_agent_eval_summary', 'v_persona_gen_ai_readiness',
      'v_agent_with_defaults', 'v_agent_complete', 'v_project_workflows',
      'v_operations_hierarchy', 'v_persona_evidence_summary', 'v_agent_graph_topology',
      'jtbd_core', 'v_agent_marketplace', 'v_persona_complete_context',
      'v_jtbd_value_ai_summary', 'v_gen_ai_opportunities_by_archetype',
      'v_jtbd_workflow_coverage', 'v_workflow_complete', 'v_persona_jtbd_inherited',
      'v_effective_persona_vpanes', 'v_agents_full_org', 'jtbd_personas',
      'user_agents_with_details'
    )
) categorized
GROUP BY risk_category, recommended_action
ORDER BY
  CASE risk_category
    WHEN 'HIGH RISK - User Facing' THEN 1
    WHEN 'HIGH RISK - Complete Data' THEN 2
    WHEN 'MEDIUM RISK - Aggregation' THEN 3
    WHEN 'MEDIUM RISK - Hierarchy' THEN 4
    ELSE 5
  END;
