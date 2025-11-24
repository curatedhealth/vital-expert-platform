-- ==========================================
-- FILE: jtbd_comprehensive_views.sql
-- PURPOSE: Create comprehensive views for aggregated JTBD data across all normalized tables
-- PHASE: 4 of 4 - Views
-- DEPENDENCIES: All Phase 1-3 migrations must be complete
-- GOLDEN RULES: Provides easy querying while maintaining normalized data integrity
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== PHASE 4: COMPREHENSIVE VIEWS ===';
  RAISE NOTICE 'Creating aggregated views for JTBD data...';
END $$;

-- ==========================================
-- VIEW 1: v_jtbd_complete
-- Complete JTBD with all aggregated mappings
-- ==========================================

CREATE OR REPLACE VIEW v_jtbd_complete AS
SELECT 
  -- Core JTBD fields
  j.id,
  j.code,
  j.name,
  j.job_statement,
  j.when_situation,
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
  COUNT(DISTINCT ao.id) as ai_opportunity_count
  
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
WHERE j.deleted_at IS NULL
GROUP BY 
  j.id, j.code, j.name, j.job_statement, j.when_situation, j.circumstance,
  j.desired_outcome, j.job_type, j.functional_area, j.job_category,
  j.complexity, j.frequency, j.status, j.validation_score,
  j.tenant_id, j.created_at, j.updated_at,
  ai.overall_ai_readiness, ai.automation_score, ai.rag_score,
  ai.summary_score, ai.generation_score, ait.name;

DO $$
BEGIN
  RAISE NOTICE '✓ Created view: v_jtbd_complete';
END $$;

-- ==========================================
-- VIEW 2: v_persona_jtbd_inherited
-- Shows how personas inherit JTBDs from roles
-- ==========================================

CREATE OR REPLACE VIEW v_persona_jtbd_inherited AS
SELECT 
  p.id as persona_id,
  p.name as persona_name,
  p.archetype,
  p.seniority_level,
  r.id as role_id,
  r.name as role_name,
  j.id as jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.job_type,
  j.complexity,
  j.frequency,
  jr.relevance_score,
  jr.importance,
  jr.frequency as role_frequency,
  jr.sequence_order,
  'inherited_from_role' as source
FROM personas p
JOIN org_roles r ON p.role_id = r.id
JOIN jtbd_roles jr ON r.id = jr.role_id
JOIN jtbd j ON jr.jtbd_id = j.id
WHERE p.deleted_at IS NULL 
  AND j.deleted_at IS NULL;

DO $$
BEGIN
  RAISE NOTICE '✓ Created view: v_persona_jtbd_inherited';
END $$;

-- ==========================================
-- VIEW 3: v_jtbd_by_org
-- Easy filtering by organizational entity
-- ==========================================

CREATE OR REPLACE VIEW v_jtbd_by_org AS
-- Function-based view
SELECT 
  'function' as entity_type,
  jf.function_id as entity_id,
  jf.function_name as entity_name,
  j.*
FROM jtbd_functions jf
JOIN jtbd j ON jf.jtbd_id = j.id
WHERE j.deleted_at IS NULL

UNION ALL

-- Department-based view
SELECT 
  'department' as entity_type,
  jd.department_id as entity_id,
  jd.department_name as entity_name,
  j.*
FROM jtbd_departments jd
JOIN jtbd j ON jd.jtbd_id = j.id
WHERE j.deleted_at IS NULL

UNION ALL

-- Role-based view
SELECT 
  'role' as entity_type,
  jr.role_id as entity_id,
  jr.role_name as entity_name,
  j.*
FROM jtbd_roles jr
JOIN jtbd j ON jr.jtbd_id = j.id
WHERE j.deleted_at IS NULL;

DO $$
BEGIN
  RAISE NOTICE '✓ Created view: v_jtbd_by_org';
END $$;

-- ==========================================
-- VIEW 4: v_jtbd_value_ai_summary
-- Quick Value + AI summary per JTBD
-- ==========================================

CREATE OR REPLACE VIEW v_jtbd_value_ai_summary AS
SELECT 
  j.id as jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.job_category,
  j.complexity,
  
  -- Value dimensions
  STRING_AGG(DISTINCT vc.name, ', ' ORDER BY vc.name) as value_categories,
  AVG(jvc.relevance_score) as avg_value_category_relevance,
  STRING_AGG(DISTINCT vd.name, ', ' ORDER BY vd.name) as value_drivers,
  AVG(jvd.impact_strength) as avg_value_driver_impact,
  
  -- AI dimensions
  ai.overall_ai_readiness,
  ai.automation_score,
  ait.name as ai_intervention_type,
  COUNT(DISTINCT ao.id) as ai_opportunity_count,
  COUNT(DISTINCT auc.id) as ai_use_case_count,
  
  -- Combined scoring (for prioritization)
  COALESCE(ai.overall_ai_readiness, 0) * COALESCE(AVG(jvd.impact_strength), 0) as priority_score
  
FROM jtbd j
LEFT JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id
LEFT JOIN value_categories vc ON jvc.category_id = vc.id
LEFT JOIN jtbd_value_drivers jvd ON j.id = jvd.jtbd_id
LEFT JOIN value_drivers vd ON jvd.driver_id = vd.id
LEFT JOIN jtbd_ai_suitability ai ON j.id = ai.jtbd_id
LEFT JOIN ai_intervention_types ait ON ai.intervention_type_id = ait.id
LEFT JOIN ai_opportunities ao ON j.id = ao.jtbd_id
LEFT JOIN ai_use_cases auc ON ao.id = auc.opportunity_id
WHERE j.deleted_at IS NULL
GROUP BY 
  j.id, j.code, j.name, j.job_category, j.complexity,
  ai.overall_ai_readiness, ai.automation_score, ait.name;

DO $$
BEGIN
  RAISE NOTICE '✓ Created view: v_jtbd_value_ai_summary';
END $$;

-- ==========================================
-- VIEW 5: v_role_persona_jtbd_hierarchy
-- Complete org hierarchy with JTBDs
-- ==========================================

CREATE OR REPLACE VIEW v_role_persona_jtbd_hierarchy AS
SELECT 
  t.id as tenant_id,
  t.name as tenant_name,
  f.id as function_id,
  f.name as function_name,
  d.id as department_id,
  d.name as department_name,
  r.id as role_id,
  r.name as role_name,
  r.seniority_level as role_seniority,
  
  COUNT(DISTINCT p.id) as persona_count,
  COUNT(DISTINCT jr.jtbd_id) as jtbd_count,
  STRING_AGG(DISTINCT j.name, ', ' ORDER BY j.name) FILTER (WHERE jr.is_primary = TRUE) as primary_jtbds,
  
  ARRAY_AGG(DISTINCT j.name ORDER BY j.name) FILTER (WHERE j.name IS NOT NULL) as all_jtbds
  
FROM org_roles r
LEFT JOIN tenants t ON r.tenant_id = t.id
LEFT JOIN org_functions f ON r.function_id = f.id
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN personas p ON r.id = p.role_id AND p.deleted_at IS NULL
LEFT JOIN jtbd_roles jr ON r.id = jr.role_id
LEFT JOIN jtbd j ON jr.jtbd_id = j.id AND j.deleted_at IS NULL
WHERE r.deleted_at IS NULL
GROUP BY 
  t.id, t.name, f.id, f.name, d.id, d.name,
  r.id, r.name, r.seniority_level;

DO $$
BEGIN
  RAISE NOTICE '✓ Created view: v_role_persona_jtbd_hierarchy';
END $$;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

DO $$
DECLARE
  view_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== PHASE 4 VERIFICATION ===';
  
  -- Count created views
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name IN (
      'v_jtbd_complete',
      'v_persona_jtbd_inherited',
      'v_jtbd_by_org',
      'v_jtbd_value_ai_summary',
      'v_role_persona_jtbd_hierarchy'
    );
  
  RAISE NOTICE 'Created views: % (expected 5)', view_count;
  
  IF view_count = 5 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✓✓✓ PHASE 4 COMPLETE - ALL VIEWS CREATED ✓✓✓';
  ELSE
    RAISE WARNING 'Phase 4 completed with warnings - not all views created';
  END IF;
END $$;

-- Human-readable verification
SELECT 
  'v_jtbd_complete' as view_name,
  COUNT(*)::TEXT as row_count
FROM v_jtbd_complete

UNION ALL

SELECT 
  'v_persona_jtbd_inherited',
  COUNT(*)::TEXT
FROM v_persona_jtbd_inherited

UNION ALL

SELECT 
  'v_jtbd_by_org',
  COUNT(*)::TEXT
FROM v_jtbd_by_org

UNION ALL

SELECT 
  'v_jtbd_value_ai_summary',
  COUNT(*)::TEXT
FROM v_jtbd_value_ai_summary

UNION ALL

SELECT 
  'v_role_persona_jtbd_hierarchy',
  COUNT(*)::TEXT
FROM v_role_persona_jtbd_hierarchy;

