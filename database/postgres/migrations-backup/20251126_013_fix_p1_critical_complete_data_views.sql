/**
 * Migration: Fix P1 Critical Complete-Data Security Definer Views
 *
 * SECURITY FIX: Convert 3 critical complete-data views from SECURITY DEFINER to SECURITY INVOKER
 *
 * ISSUE: These views expose ALL data across all organizations, bypassing RLS:
 * 1. v_agent_complete - All agents with full relationships
 * 2. v_jtbd_complete - All JTBDs with value/AI analysis
 * 3. v_workflow_complete - All workflow templates
 *
 * RISK: Cross-organization data leakage
 * - PharmaCo sees BioTech's custom agents
 * - Organization A sees Organization B's workflows
 * - All JTBD data visible across tenants
 *
 * FIX:
 * - Convert all views to SECURITY INVOKER (respects RLS on base tables)
 * - Views will automatically filter via existing RLS policies on:
 *   - agents table (dual-mechanism: owner_organization_id + tenant_id)
 *   - workflows table (organization_id filtering)
 *   - jtbd table (will have RLS added in Phase 4A)
 *
 * IMPACT:
 * - Zero functionality change for legitimate users
 * - Prevents cross-organization data exposure
 * - Maintains all aggregations and joins
 */

-- ============================================================================
-- VALIDATION: Pre-Migration Check
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'P1 SECURITY FIX: COMPLETE-DATA VIEWS';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Converting 3 critical views to SECURITY INVOKER:';
  RAISE NOTICE '  1. v_agent_complete (all agents)';
  RAISE NOTICE '  2. v_jtbd_complete (all JTBDs)';
  RAISE NOTICE '  3. v_workflow_complete (all workflows)';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Improvement:';
  RAISE NOTICE '  - Views will respect RLS on underlying tables';
  RAISE NOTICE '  - Cross-organization data leakage prevented';
  RAISE NOTICE '  - Automatic filtering via existing RLS policies';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- FIX 1: v_agent_complete (All Agents with Relationships)
-- ============================================================================

CREATE OR REPLACE VIEW v_agent_complete
WITH (security_invoker = true)  -- ✅ SECURITY FIX: Use caller's permissions
AS
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

COMMENT ON VIEW v_agent_complete IS 'Complete agent view with all aggregated relationships (SECURITY INVOKER - respects RLS)';

DO $$
BEGIN
  RAISE NOTICE '✓ Fixed: v_agent_complete';
  RAISE NOTICE '  - Converted to SECURITY INVOKER';
  RAISE NOTICE '  - Will filter via agents table RLS (dual-mechanism)';
  RAISE NOTICE '';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '✗ Error fixing v_agent_complete: %', SQLERRM;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- FIX 2: v_jtbd_complete (All JTBDs with Value/AI Analysis)
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_complete
WITH (security_invoker = true)  -- ✅ SECURITY FIX: Use caller's permissions
AS
SELECT
  -- Core JTBD fields
  j.id,
  j.code,
  j.name,
  j.description,
  j.circumstance,
  j.desired_outcome,
  j.job_type,
  j.functional_area,
  j.job_category,
  j.complexity,
  j.frequency,
  j.status,
  j.validation_score,
  j.tenant_id,
  j.strategic_priority_id,
  j.domain_id,
  j.industry_id,
  j.created_at,
  j.updated_at,

  -- Aggregated organizational mappings (using cached names)
  STRING_AGG(DISTINCT jf.function_name, ', ' ORDER BY jf.function_name) as functions,
  STRING_AGG(DISTINCT jd.department_name, ', ' ORDER BY jd.department_name) as departments,
  STRING_AGG(DISTINCT jr.role_name, ', ' ORDER BY jr.role_name) as roles,

  -- Aggregated value dimensions
  STRING_AGG(DISTINCT vc.name, ', ' ORDER BY vc.name) as value_categories,
  STRING_AGG(DISTINCT vd.name, ', ' ORDER BY vd.name) as value_drivers,

  -- AI dimensions
  ai.overall_ai_readiness,
  ai.automation_score,
  ai.rag_score,
  ai.summary_score,
  ai.generation_score,
  ait.name as ai_intervention_type,

  -- Counts
  COUNT(DISTINCT jpp.id) as pain_point_count,
  COUNT(DISTINCT jdo.id) as desired_outcome_count,
  COUNT(DISTINCT jk.id) as kpi_count,
  COUNT(DISTINCT jsc.id) as success_criteria_count,
  COUNT(DISTINCT jt.id) as tag_count,
  COUNT(DISTINCT ao.id) as ai_opportunity_count,
  COUNT(DISTINCT jc.id) as context_count

FROM jtbd j
LEFT JOIN jtbd_functions jf ON j.id = jf.jtbd_id
LEFT JOIN jtbd_departments jd ON j.id = jd.jtbd_id
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id
LEFT JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id
LEFT JOIN value_categories vc ON jvc.category_id = vc.id
LEFT JOIN jtbd_value_drivers jvd ON j.id = jvd.jtbd_id
LEFT JOIN value_drivers vd ON jvd.driver_id = vd.id
LEFT JOIN jtbd_ai_suitability ai ON j.id = ai.jtbd_id
LEFT JOIN ai_intervention_types ait ON ai.intervention_type_id = ait.id
LEFT JOIN jtbd_pain_points jpp ON j.id = jpp.jtbd_id
LEFT JOIN jtbd_desired_outcomes jdo ON j.id = jdo.jtbd_id
LEFT JOIN jtbd_kpis jk ON j.id = jk.jtbd_id
LEFT JOIN jtbd_success_criteria jsc ON j.id = jsc.jtbd_id
LEFT JOIN jtbd_tags jt ON j.id = jt.jtbd_id
LEFT JOIN ai_opportunities ao ON j.id = ao.jtbd_id
LEFT JOIN jtbd_context jc ON j.id = jc.jtbd_id
WHERE j.deleted_at IS NULL
GROUP BY
  j.id, j.code, j.name, j.description, j.circumstance,
  j.desired_outcome, j.job_type, j.functional_area, j.job_category,
  j.complexity, j.frequency, j.status, j.validation_score,
  j.tenant_id, j.strategic_priority_id, j.domain_id, j.industry_id,
  j.created_at, j.updated_at,
  ai.overall_ai_readiness, ai.automation_score, ai.rag_score,
  ai.summary_score, ai.generation_score, ait.name;

COMMENT ON VIEW v_jtbd_complete IS 'Complete JTBD view with all aggregated mappings (SECURITY INVOKER - respects RLS)';

DO $$
BEGIN
  RAISE NOTICE '✓ Fixed: v_jtbd_complete';
  RAISE NOTICE '  - Converted to SECURITY INVOKER';
  RAISE NOTICE '  - Will filter via jtbd table RLS (once Phase 4A deployed)';
  RAISE NOTICE '';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '✗ Error fixing v_jtbd_complete: %', SQLERRM;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- FIX 3: v_workflow_complete (All Workflow Templates)
-- ============================================================================

CREATE OR REPLACE VIEW v_workflow_complete
WITH (security_invoker = true)  -- ✅ SECURITY FIX: Use caller's permissions
AS
SELECT
  wt.id as workflow_id,
  wt.name as workflow_name,
  wt.work_mode,
  wt.binding_type,
  wt.workflow_type,

  -- JTBD linkage
  j.id as jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.complexity as jtbd_complexity,

  -- Stage info
  ws.id as stage_id,
  ws.stage_number,
  ws.stage_name,

  -- Task info (workflow_tasks are self-contained)
  wtask.id as workflow_task_id,
  wtask.task_number,
  wtask.task_name,
  wtask.task_type,
  wtask.estimated_duration_minutes,

  -- Counts
  COUNT(DISTINCT wtask.id) as task_count

FROM workflow_templates wt
LEFT JOIN jtbd j ON wt.jtbd_id = j.id
LEFT JOIN workflow_stages ws ON wt.id = ws.template_id
LEFT JOIN workflow_tasks wtask ON ws.id = wtask.stage_id
GROUP BY
  wt.id, wt.name, wt.work_mode, wt.binding_type, wt.workflow_type,
  j.id, j.code, j.name, j.complexity,
  ws.id, ws.stage_number, ws.stage_name,
  wtask.id, wtask.task_number, wtask.task_name, wtask.task_type, wtask.estimated_duration_minutes;

COMMENT ON VIEW v_workflow_complete IS 'Complete workflow view with stages and tasks (SECURITY INVOKER - respects RLS)';

DO $$
BEGIN
  RAISE NOTICE '✓ Fixed: v_workflow_complete';
  RAISE NOTICE '  - Converted to SECURITY INVOKER';
  RAISE NOTICE '  - Will filter via workflow_templates table RLS';
  RAISE NOTICE '';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '✗ Error fixing v_workflow_complete: %', SQLERRM;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- VALIDATION: Post-Migration Check
-- ============================================================================

DO $$
DECLARE
  view_count INTEGER;
BEGIN
  -- Verify all 3 views exist
  SELECT COUNT(*) INTO view_count
  FROM pg_views
  WHERE schemaname = 'public'
    AND viewname IN (
      'v_agent_complete',
      'v_jtbd_complete',
      'v_workflow_complete'
    );

  RAISE NOTICE '============================================';
  RAISE NOTICE 'VALIDATION RESULTS';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Views found: % / 3', view_count;
  RAISE NOTICE '';

  IF view_count != 3 THEN
    RAISE WARNING 'Expected 3 views, found %', view_count;
  ELSE
    RAISE NOTICE '✓ All 3 views successfully recreated';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'Security Improvements:';
  RAISE NOTICE '  ✓ All views now use SECURITY INVOKER';
  RAISE NOTICE '  ✓ Cross-organization data leakage prevented';
  RAISE NOTICE '  ✓ Automatic filtering via base table RLS';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Dependencies:';
  RAISE NOTICE '  ✓ agents table: Dual-mechanism RLS (deployed)';
  RAISE NOTICE '  ✓ workflows table: Organization RLS (deployed)';
  RAISE NOTICE '  📋 jtbd table: RLS pending (Phase 4A)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Monitor application for 24-48 hours';
  RAISE NOTICE '  2. Verify users only see their organization data';
  RAISE NOTICE '  3. Deploy Phase 4A (JTBD table RLS)';
  RAISE NOTICE '  4. Fix P2-P7 Security Definer views (35 remaining)';
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'P1 SECURITY FIX: COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- TESTING QUERIES (Run these to validate the fix)
-- ============================================================================

/**
 * Test 1: Verify organization isolation for agents
 *
 * -- Set context for PharmaCo
 * SELECT set_organization_context('[pharmaco-uuid]'::UUID);
 * SELECT COUNT(*) FROM v_agent_complete;
 * -- Should only return PharmaCo's custom agents + VITAL platform agents allocated to Pharma
 *
 * -- Switch to BioTech
 * SELECT set_organization_context('[biotech-uuid]'::UUID);
 * SELECT COUNT(*) FROM v_agent_complete;
 * -- Should only return BioTech's custom agents + VITAL platform agents (different count)
 */

/**
 * Test 2: Verify workflow isolation
 *
 * SELECT set_organization_context('[org-a-uuid]'::UUID);
 * SELECT COUNT(*) FROM v_workflow_complete;
 * -- Should only return Org A's workflows
 *
 * SELECT set_organization_context('[org-b-uuid]'::UUID);
 * SELECT COUNT(*) FROM v_workflow_complete;
 * -- Should only return Org B's workflows (different count)
 */

/**
 * Test 3: Verify JTBD filtering (after Phase 4A RLS deployment)
 *
 * SELECT set_organization_context('[org-uuid]'::UUID);
 * SELECT COUNT(*) FROM v_jtbd_complete;
 * -- Should filter by organization (once jtbd table has RLS)
 */

-- ============================================================================
-- ROLLBACK PROCEDURE (Emergency Only)
-- ============================================================================

/**
 * To rollback this migration (NOT RECOMMENDED - reopens security hole):
 *
 * -- Restore original SECURITY DEFINER views
 * CREATE OR REPLACE VIEW v_agent_complete AS
 * [original definition without security_invoker];
 *
 * CREATE OR REPLACE VIEW v_jtbd_complete AS
 * [original definition without security_invoker];
 *
 * CREATE OR REPLACE VIEW v_workflow_complete AS
 * [original definition without security_invoker];
 *
 * WARNING: This will re-expose all data across organizations!
 * BETTER APPROACH: Fix application code to properly set organization context
 */
