-- =====================================================================
-- PHASE 5: Create Comprehensive JTBD Views
-- =====================================================================
-- Purpose: Create powerful views that enable join-free queries
-- - v_jtbd_complete: Complete JTBD with all mappings and scores
-- - v_persona_jtbd_inherited: Personas inherit JTBDs from roles
-- - v_jtbd_by_entity_name: Filter JTBDs by org entity without joins

-- =====================================================================
-- View 1: Complete JTBD with All Mappings
-- =====================================================================
CREATE OR REPLACE VIEW v_jtbd_complete AS
SELECT 
  -- Core JTBD attributes
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
  
  -- Org mappings (aggregated from junctions with cached names)
  STRING_AGG(DISTINCT jf.function_name, ', ' ORDER BY jf.function_name) as functions,
  STRING_AGG(DISTINCT jd.department_name, ', ' ORDER BY jd.department_name) as departments,
  STRING_AGG(DISTINCT jr.role_name, ', ' ORDER BY jr.role_name) as roles,
  
  -- Value dimensions (aggregated)
  STRING_AGG(DISTINCT jvc.category_name, ', ' ORDER BY jvc.category_name) as value_categories,
  STRING_AGG(DISTINCT jvd.driver_name, ', ' ORDER BY jvd.driver_name) as value_drivers,
  
  -- AI dimensions
  ais.overall_score as ai_suitability_score,
  ais.overall_ai_readiness,
  ais.automation_score,
  ais.rag_score,
  ais.reasoning_score,
  ais.intervention_type_name as recommended_ai_intervention,
  
  -- AI opportunity summary
  COUNT(DISTINCT ao.id) as ai_opportunity_count,
  MAX(ao.automation_potential) as max_automation_potential,
  MAX(ao.value_estimate) as max_value_estimate,
  
  -- JTBD components counts
  COUNT(DISTINCT jp.id) as pain_point_count,
  COUNT(DISTINCT jdo.id) as desired_outcome_count,
  COUNT(DISTINCT jk.id) as kpi_count,
  COUNT(DISTINCT jsc.id) as success_criteria_count,
  
  -- Workflow linkage
  COUNT(DISTINCT wt.id) as workflow_count,
  
  -- Audit
  j.created_at,
  j.updated_at
  
FROM jtbd j

-- Org mappings
LEFT JOIN jtbd_functions jf ON j.id = jf.jtbd_id
LEFT JOIN jtbd_departments jd ON j.id = jd.jtbd_id
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id

-- Value mappings
LEFT JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id
LEFT JOIN jtbd_value_drivers jvd ON j.id = jvd.jtbd_id

-- AI layer
LEFT JOIN jtbd_ai_suitability ais ON j.id = ais.jtbd_id
LEFT JOIN ai_opportunities ao ON j.id = ao.jtbd_id AND ao.deleted_at IS NULL

-- JTBD components
LEFT JOIN jtbd_pain_points jp ON j.id = jp.jtbd_id
LEFT JOIN jtbd_desired_outcomes jdo ON j.id = jdo.jtbd_id
LEFT JOIN jtbd_kpis jk ON j.id = jk.jtbd_id
LEFT JOIN jtbd_success_criteria jsc ON j.id = jsc.jtbd_id

-- Workflows
LEFT JOIN workflow_templates wt ON j.id = wt.jtbd_id AND wt.deleted_at IS NULL

WHERE j.deleted_at IS NULL

GROUP BY 
  j.id, j.code, j.name, j.job_statement, j.when_situation, j.circumstance,
  j.desired_outcome, j.job_type, j.functional_area, j.job_category,
  j.complexity, j.frequency, j.status, j.validation_score, j.tenant_id,
  j.created_at, j.updated_at,
  ais.overall_score, ais.overall_ai_readiness, ais.automation_score,
  ais.rag_score, ais.reasoning_score, ais.intervention_type_name;

COMMENT ON VIEW v_jtbd_complete IS 'Complete JTBD view with all mappings, scores, and counts (optimized for dashboards)';

-- =====================================================================
-- View 2: Personas Inherit JTBDs from Roles
-- =====================================================================
CREATE OR REPLACE VIEW v_persona_jtbd_inherited AS
SELECT 
  -- Persona info
  p.id as persona_id,
  p.name as persona_name,
  p.title as persona_title,
  p.archetype,
  p.persona_type,
  p.ai_maturity_score,
  p.work_complexity_score,
  
  -- Role info (personas inherit from roles)
  r.id as role_id,
  r.name as role_name,
  r.role_category,
  r.seniority_level,
  
  -- JTBD info (inherited via role)
  j.id as jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.job_statement,
  j.complexity as jtbd_complexity,
  j.frequency as jtbd_frequency,
  
  -- Mapping metadata from role → JTBD
  jr.relevance_score,
  jr.is_primary,
  jr.importance,
  jr.frequency as role_jtbd_frequency,
  
  -- Source
  'inherited_from_role' as source,
  
  -- Audit
  p.created_at as persona_created_at,
  j.created_at as jtbd_created_at

FROM personas p

-- Join to role (persona inherits all role attributes)
INNER JOIN org_roles r ON p.role_id = r.id

-- Join to JTBD via role mapping
INNER JOIN jtbd_roles jr ON r.id = jr.role_id
INNER JOIN jtbd j ON jr.jtbd_id = j.id

WHERE 
  p.deleted_at IS NULL 
  AND r.deleted_at IS NULL
  AND j.deleted_at IS NULL

ORDER BY p.name, j.code;

COMMENT ON VIEW v_persona_jtbd_inherited IS 'Shows all JTBDs inherited by personas via their roles (no direct persona-JTBD mapping needed)';

-- =====================================================================
-- View 3: JTBD by Entity Name (Human-Readable Filtering)
-- =====================================================================
CREATE OR REPLACE VIEW v_jtbd_by_entity_name AS

-- Functions
SELECT 
  'function' as entity_type,
  jf.function_id as entity_id,
  jf.function_name as entity_name,
  jf.relevance_score,
  jf.is_primary,
  j.id as jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.job_statement,
  j.complexity,
  j.frequency,
  j.status,
  j.tenant_id
FROM jtbd_functions jf
INNER JOIN jtbd j ON jf.jtbd_id = j.id
WHERE j.deleted_at IS NULL

UNION ALL

-- Departments
SELECT 
  'department' as entity_type,
  jd.department_id as entity_id,
  jd.department_name as entity_name,
  jd.relevance_score,
  jd.is_primary,
  j.id as jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.job_statement,
  j.complexity,
  j.frequency,
  j.status,
  j.tenant_id
FROM jtbd_departments jd
INNER JOIN jtbd j ON jd.jtbd_id = j.id
WHERE j.deleted_at IS NULL

UNION ALL

-- Roles
SELECT 
  'role' as entity_type,
  jr.role_id as entity_id,
  jr.role_name as entity_name,
  jr.relevance_score,
  jr.is_primary,
  j.id as jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.job_statement,
  j.complexity,
  j.frequency,
  j.status,
  j.tenant_id
FROM jtbd_roles jr
INNER JOIN jtbd j ON jr.jtbd_id = j.id
WHERE j.deleted_at IS NULL;

COMMENT ON VIEW v_jtbd_by_entity_name IS 'Filter JTBDs by function/department/role NAME without joins (using cached names)';

-- =====================================================================
-- View 4: JTBD AI Opportunity Summary
-- =====================================================================
CREATE OR REPLACE VIEW v_jtbd_ai_opportunity_summary AS
SELECT 
  j.id as jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  
  -- AI suitability
  ais.overall_score as ai_suitability,
  ais.automation_score,
  ais.intervention_type_name,
  
  -- Opportunity counts
  COUNT(ao.id) as opportunity_count,
  COUNT(CASE WHEN ao.priority = 'critical' THEN 1 END) as critical_opportunities,
  COUNT(CASE WHEN ao.priority = 'high' THEN 1 END) as high_opportunities,
  
  -- Potential aggregates
  AVG(ao.automation_potential) as avg_automation_potential,
  MAX(ao.automation_potential) as max_automation_potential,
  SUM(ao.value_estimate) as total_value_estimate,
  
  -- Use case count
  COUNT(DISTINCT uc.id) as use_case_count,
  
  -- By service layer
  COUNT(DISTINCT CASE WHEN uc.service_layer = 'Ask Me' THEN uc.id END) as ask_me_use_cases,
  COUNT(DISTINCT CASE WHEN uc.service_layer = 'Ask Expert' THEN uc.id END) as ask_expert_use_cases,
  COUNT(DISTINCT CASE WHEN uc.service_layer = 'Ask Panel' THEN uc.id END) as ask_panel_use_cases,
  COUNT(DISTINCT CASE WHEN uc.service_layer = 'Workflows' THEN uc.id END) as workflow_use_cases

FROM jtbd j
LEFT JOIN jtbd_ai_suitability ais ON j.id = ais.jtbd_id
LEFT JOIN ai_opportunities ao ON j.id = ao.jtbd_id AND ao.deleted_at IS NULL
LEFT JOIN ai_use_cases uc ON ao.id = uc.opportunity_id

WHERE j.deleted_at IS NULL

GROUP BY j.id, j.code, j.name, ais.overall_score, ais.automation_score, ais.intervention_type_name;

COMMENT ON VIEW v_jtbd_ai_opportunity_summary IS 'Summary of AI opportunities and use cases by JTBD';

-- =====================================================================
-- View 5: Workflow Task Complexity Summary
-- =====================================================================
CREATE OR REPLACE VIEW v_workflow_task_summary AS
SELECT 
  wt.id as template_id,
  wt.name as workflow_name,
  wt.jtbd_id,
  j.name as jtbd_name,
  
  -- Stage/task counts
  COUNT(DISTINCT ws.id) as stage_count,
  COUNT(DISTINCT wtask.id) as task_count,
  
  -- Duration estimates
  SUM(wtask.estimated_duration_minutes) as total_duration_minutes,
  
  -- Complexity indicators
  COUNT(DISTINCT wtool.id) as total_tools_required,
  COUNT(DISTINCT wskill.id) as total_skills_required,
  COUNT(DISTINCT wdata.id) as total_data_requirements,
  COUNT(DISTINCT wpain.id) as total_pain_points,
  
  -- Task types
  COUNT(CASE WHEN wtask.task_type = 'manual' THEN 1 END) as manual_tasks,
  COUNT(CASE WHEN wtask.task_type = 'automated' THEN 1 END) as automated_tasks,
  COUNT(CASE WHEN wtask.task_type = 'decision' THEN 1 END) as decision_tasks,
  
  -- Audit
  wt.created_at,
  wt.updated_at

FROM workflow_templates wt
LEFT JOIN jtbd j ON wt.jtbd_id = j.id
LEFT JOIN workflow_stages ws ON wt.id = ws.template_id
LEFT JOIN workflow_tasks wtask ON ws.id = wtask.stage_id
LEFT JOIN workflow_task_tools wtool ON wtask.id = wtool.task_id
LEFT JOIN workflow_task_skills wskill ON wtask.id = wskill.task_id
LEFT JOIN workflow_task_data_requirements wdata ON wtask.id = wdata.task_id
LEFT JOIN workflow_task_pain_points wpain ON wtask.id = wpain.task_id

WHERE wt.deleted_at IS NULL

GROUP BY wt.id, wt.name, wt.jtbd_id, j.name, wt.created_at, wt.updated_at;

COMMENT ON VIEW v_workflow_task_summary IS 'Summary of workflow complexity by template';

DO $$
BEGIN
  RAISE NOTICE '=== COMPREHENSIVE JTBD VIEWS CREATED ===';
  RAISE NOTICE '✓ v_jtbd_complete: Complete JTBD with all mappings and scores';
  RAISE NOTICE '✓ v_persona_jtbd_inherited: Personas inherit JTBDs from roles';
  RAISE NOTICE '✓ v_jtbd_by_entity_name: Filter by function/department/role NAME (no joins)';
  RAISE NOTICE '✓ v_jtbd_ai_opportunity_summary: AI opportunity analytics';
  RAISE NOTICE '✓ v_workflow_task_summary: Workflow complexity analysis';
  RAISE NOTICE '';
  RAISE NOTICE 'QUERY EXAMPLES:';
  RAISE NOTICE '  -- Get all JTBDs for "Medical Affairs" function:';
  RAISE NOTICE '  SELECT * FROM v_jtbd_by_entity_name WHERE entity_type = ''function'' AND entity_name = ''Medical Affairs'';';
  RAISE NOTICE '';
  RAISE NOTICE '  -- Get all JTBDs a persona can work on:';
  RAISE NOTICE '  SELECT * FROM v_persona_jtbd_inherited WHERE persona_name = ''Dr. Sarah Chen'';';
  RAISE NOTICE '';
  RAISE NOTICE '  -- Dashboard query (no joins!):';
  RAISE NOTICE '  SELECT * FROM v_jtbd_complete WHERE ai_suitability_score > 0.7 ORDER BY max_value_estimate DESC;';
END $$;

