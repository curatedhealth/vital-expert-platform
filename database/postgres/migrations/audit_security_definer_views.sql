/**
 * SECURITY AUDIT: Security Definer Views Analysis
 *
 * PURPOSE:
 * Audit all 39 views that use SECURITY DEFINER to identify potential security risks.
 *
 * SECURITY CONCERN:
 * Views with SECURITY DEFINER run queries with the creator's permissions (typically superuser),
 * bypassing Row Level Security (RLS) policies. This can lead to:
 * - Cross-tenant data leakage
 * - Unauthorized access to sensitive data
 * - Privilege escalation vulnerabilities
 *
 * SAFER ALTERNATIVE:
 * SECURITY INVOKER - Runs queries with the caller's permissions, respecting RLS policies
 *
 * This script generates a report of all SECURITY DEFINER views and provides
 * recommendations for remediation.
 */

-- ============================================================================
-- ANALYSIS 1: List All Security Definer Views
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'SECURITY DEFINER VIEWS AUDIT';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total Security Definer Views: 39';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ANALYSIS 2: Detailed View Information
-- ============================================================================

SELECT
  'SECURITY DEFINER VIEW REPORT' as report_type,
  schemaname as schema,
  viewname as view_name,
  viewowner as owner,
  CASE
    WHEN definition LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_mode
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
-- ANALYSIS 3: Check for RLS Policies on Views
-- ============================================================================

DO $$
DECLARE
  view_name TEXT;
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'RLS POLICY CHECK FOR SECURITY DEFINER VIEWS';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';

  -- Check if any of the views have RLS policies
  FOR view_name IN
    SELECT viewname FROM pg_views
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
  LOOP
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = view_name;

    IF policy_count > 0 THEN
      RAISE NOTICE 'View: % - Has % RLS policies', view_name, policy_count;
    ELSE
      RAISE NOTICE 'View: % - ⚠ NO RLS policies', view_name;
    END IF;
  END LOOP;

  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ANALYSIS 4: Check Which Base Tables Views Query
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'BASE TABLE DEPENDENCIES';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Run this query to see which tables each view depends on:';
  RAISE NOTICE '';
  RAISE NOTICE 'SELECT';
  RAISE NOTICE '  v.viewname as view,';
  RAISE NOTICE '  d.refobjid::regclass as referenced_table';
  RAISE NOTICE 'FROM pg_views v';
  RAISE NOTICE 'JOIN pg_depend d ON d.objid = v.viewname::regclass';
  RAISE NOTICE 'WHERE v.schemaname = ''public''';
  RAISE NOTICE '  AND v.viewname = ''<view_name_here>'';';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- RECOMMENDATIONS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'RECOMMENDATIONS';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'For each SECURITY DEFINER view, evaluate:';
  RAISE NOTICE '';
  RAISE NOTICE '1. IS SECURITY DEFINER NECESSARY?';
  RAISE NOTICE '   - If NO: Convert to SECURITY INVOKER (safer)';
  RAISE NOTICE '   - If YES: Document the business reason';
  RAISE NOTICE '';
  RAISE NOTICE '2. DOES THE VIEW NEED RLS POLICIES?';
  RAISE NOTICE '   - User-facing views (user_*, v_agent_marketplace): YES';
  RAISE NOTICE '   - Aggregate/Summary views: MAYBE (depends on use case)';
  RAISE NOTICE '   - System views: MAYBE (depends on sensitivity)';
  RAISE NOTICE '';
  RAISE NOTICE '3. CONVERSION TEMPLATE:';
  RAISE NOTICE '   To convert a view from SECURITY DEFINER to SECURITY INVOKER:';
  RAISE NOTICE '';
  RAISE NOTICE '   CREATE OR REPLACE VIEW view_name';
  RAISE NOTICE '   WITH (security_invoker = true)  -- Safe: uses caller permissions';
  RAISE NOTICE '   AS SELECT ...';
  RAISE NOTICE '';
  RAISE NOTICE '4. ADDING RLS TO A VIEW:';
  RAISE NOTICE '   ALTER VIEW view_name ENABLE ROW LEVEL SECURITY;';
  RAISE NOTICE '';
  RAISE NOTICE '   CREATE POLICY "view_isolation" ON view_name';
  RAISE NOTICE '     FOR SELECT';
  RAISE NOTICE '     USING (organization_id = get_current_organization_context()::UUID);';
  RAISE NOTICE '';
  RAISE NOTICE '5. HIGH PRIORITY VIEWS TO REVIEW:';
  RAISE NOTICE '   - user_popular_agents (user-facing, exposes agent data)';
  RAISE NOTICE '   - user_recent_agents (user-facing, exposes usage data)';
  RAISE NOTICE '   - user_favorite_agents (user-facing, exposes preferences)';
  RAISE NOTICE '   - user_agents_with_details (user-facing, exposes full details)';
  RAISE NOTICE '   - v_agent_marketplace (public marketplace, needs tenant filtering)';
  RAISE NOTICE '   - v_agent_complete (exposes complete agent data)';
  RAISE NOTICE '   - v_workflow_complete (exposes complete workflow data)';
  RAISE NOTICE '   - v_persona_complete_context (exposes persona data)';
  RAISE NOTICE '';
  RAISE NOTICE '6. VIEW CATEGORIZATION:';
  RAISE NOTICE '';
  RAISE NOTICE '   Category A: User-Facing (Highest Risk)';
  RAISE NOTICE '   - user_popular_agents';
  RAISE NOTICE '   - user_recent_agents';
  RAISE NOTICE '   - user_favorite_agents';
  RAISE NOTICE '   - user_agents_with_details';
  RAISE NOTICE '   - v_agent_marketplace';
  RAISE NOTICE '   → Convert to SECURITY INVOKER + Add RLS policies';
  RAISE NOTICE '';
  RAISE NOTICE '   Category B: Complete/Detail Views (High Risk)';
  RAISE NOTICE '   - v_agent_complete';
  RAISE NOTICE '   - v_workflow_complete';
  RAISE NOTICE '   - v_persona_complete_context';
  RAISE NOTICE '   - v_jtbd_complete';
  RAISE NOTICE '   → Review if SECURITY DEFINER needed, add RLS if kept';
  RAISE NOTICE '';
  RAISE NOTICE '   Category C: Aggregation/Summary Views (Medium Risk)';
  RAISE NOTICE '   - v_role_evidence_summary';
  RAISE NOTICE '   - v_persona_evidence_summary';
  RAISE NOTICE '   - v_agent_eval_summary';
  RAISE NOTICE '   - v_jtbd_value_ai_summary';
  RAISE NOTICE '   → Document why SECURITY DEFINER needed';
  RAISE NOTICE '';
  RAISE NOTICE '   Category D: Hierarchy/Relationship Views (Medium Risk)';
  RAISE NOTICE '   - v_projects_hierarchy';
  RAISE NOTICE '   - v_operations_hierarchy';
  RAISE NOTICE '   - v_role_persona_jtbd_hierarchy';
  RAISE NOTICE '   - v_agent_graph_topology';
  RAISE NOTICE '   → Review for tenant isolation needs';
  RAISE NOTICE '';
  RAISE NOTICE '   Category E: Configuration/Context Views (Lower Risk)';
  RAISE NOTICE '   - v_agent_with_defaults';
  RAISE NOTICE '   - v_agent_personality';
  RAISE NOTICE '   - v_agent_routing_eligibility';
  RAISE NOTICE '   → May be safe as SECURITY DEFINER if read-only';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- MANUAL REVIEW CHECKLIST
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'MANUAL REVIEW CHECKLIST';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'For each view, answer these questions:';
  RAISE NOTICE '';
  RAISE NOTICE '[ ] 1. What data does this view expose?';
  RAISE NOTICE '[ ] 2. Who should have access to this data?';
  RAISE NOTICE '[ ] 3. Does it include multi-tenant data?';
  RAISE NOTICE '[ ] 4. Can it leak cross-organization data?';
  RAISE NOTICE '[ ] 5. Why was SECURITY DEFINER used?';
  RAISE NOTICE '[ ] 6. Can it be converted to SECURITY INVOKER?';
  RAISE NOTICE '[ ] 7. Does it need RLS policies?';
  RAISE NOTICE '[ ] 8. Are there any comments documenting its purpose?';
  RAISE NOTICE '';
  RAISE NOTICE 'Document findings in: .vital-docs/vital-expert-docs/11-data-schema/security/';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- OUTPUT: Create CSV Report for Manual Review
-- ============================================================================

\echo 'Generating CSV report of Security Definer views...'
\echo ''

\copy (SELECT viewname as "View Name", viewowner as "Owner", 'SECURITY DEFINER' as "Security Mode", 'NEEDS REVIEW' as "Status", '' as "Risk Level", '' as "Recommendation", '' as "Notes" FROM pg_views WHERE schemaname = 'public' AND viewname IN ('v_jtbd_complete', 'v_effective_persona_responsibilities', 'v_jtbd_by_org', 'v_role_evidence_summary', 'v_projects_hierarchy', 'v_personas_full_org', 'v_routine_workflows', 'user_popular_agents', 'v_agent_skill_inventory', 'user_recent_agents', 'v_effective_persona_stakeholders', 'v_effective_persona_skills', 'knowledge_sources', 'v_effective_persona_tools', 'v_effective_persona_ai_maturity', 'v_agent_personality', 'v_agent_routing_eligibility', 'user_favorite_agents', 'v_role_persona_jtbd_hierarchy', 'v_agent_eval_summary', 'v_persona_gen_ai_readiness', 'v_agent_with_defaults', 'v_agent_complete', 'v_project_workflows', 'v_operations_hierarchy', 'v_persona_evidence_summary', 'v_agent_graph_topology', 'jtbd_core', 'v_agent_marketplace', 'v_persona_complete_context', 'v_jtbd_value_ai_summary', 'v_gen_ai_opportunities_by_archetype', 'v_jtbd_workflow_coverage', 'v_workflow_complete', 'v_persona_jtbd_inherited', 'v_effective_persona_vpanes', 'v_agents_full_org', 'jtbd_personas', 'user_agents_with_details') ORDER BY viewname) TO 'security_definer_views_audit.csv' WITH CSV HEADER

\echo ''
\echo 'CSV report saved to: security_definer_views_audit.csv'
\echo 'Fill in Risk Level, Recommendation, and Notes columns for each view.'
\echo ''
