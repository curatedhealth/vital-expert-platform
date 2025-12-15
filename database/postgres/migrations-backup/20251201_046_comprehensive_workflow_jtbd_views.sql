-- Migration: 20251201_046_comprehensive_workflow_jtbd_views.sql
-- Purpose: Create comprehensive views for all workflows and JTBDs across Digital Health and Pharmaceuticals
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Comprehensive Workflow Summary View
-- ============================================================================

CREATE OR REPLACE VIEW v_all_workflow_summary AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  CASE 
    WHEN wt.code LIKE 'WF-DH-%' THEN 'Digital Health'
    WHEN wt.code LIKE 'WF-MAI-%' THEN 'Medical Affairs'
    WHEN wt.code LIKE 'WF-XFI-%' THEN 'Cross-Functional Insights'
    WHEN wt.code LIKE 'WF-COM-%' THEN 'Commercial'
    WHEN wt.code LIKE 'WF-REG-%' THEN 'Regulatory'
    WHEN wt.code LIKE 'WF-RD-%' THEN 'R&D'
    ELSE 'Other'
  END as functional_area,
  wt.workflow_type,
  wt.work_mode,
  wt.complexity_level,
  wt.estimated_duration_hours,
  wt.status,
  COUNT(DISTINCT ws.id) as stages_count,
  COUNT(DISTINCT wa.id) as activities_count,
  COUNT(DISTINCT t.id) as tasks_count,
  ROUND(AVG(t.ai_automation_score)::numeric, 1) as avg_automation_score,
  SUM(CASE WHEN t.is_hitl_checkpoint THEN 1 ELSE 0 END) as hitl_checkpoints,
  wt.created_at,
  wt.updated_at
FROM workflow_templates wt
LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
LEFT JOIN workflow_activities wa ON wa.stage_id = ws.id
LEFT JOIN workflow_tasks t ON t.activity_id = wa.id
GROUP BY wt.id, wt.code, wt.name, wt.workflow_type, wt.work_mode, wt.complexity_level, 
         wt.estimated_duration_hours, wt.status, wt.created_at, wt.updated_at
ORDER BY 
  CASE 
    WHEN wt.code LIKE 'WF-DH-%' THEN 1
    WHEN wt.code LIKE 'WF-MAI-%' THEN 2
    WHEN wt.code LIKE 'WF-XFI-%' THEN 3
    ELSE 4
  END,
  wt.code;

-- ============================================================================
-- STEP 2: Create Comprehensive JTBD Summary View (All Attributes)
-- ============================================================================

CREATE OR REPLACE VIEW v_all_jtbd_summary AS
SELECT
  j.id as jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.description as jtbd_description,
  j.functional_area,
  j.job_category,
  j.job_type,
  j.jtbd_type,
  j.complexity,
  j.frequency,
  j.status,
  j.work_pattern,
  -- Strategic attributes
  j.strategic_priority,
  j.impact_level,
  j.compliance_sensitivity,
  j.compliance_risk_level,
  -- Service layer recommendation
  j.recommended_service_layer,
  -- ODI Scores
  j.importance_score,
  j.satisfaction_score,
  j.opportunity_score,
  j.odi_tier,
  -- Validation
  j.validation_score,
  j.validation_status,
  j.validated_by,
  j.validated_at,
  -- Job statement components (if populated)
  j.job_statement,
  j.when_situation,
  j.circumstance,
  j.desired_outcome,
  -- OKR alignment
  j.active_okr_count,
  j.okr_alignment_score,
  -- Relationships
  COUNT(DISTINCT wj.workflow_id) as linked_workflows,
  COUNT(DISTINCT jr.role_id) as linked_roles,
  -- Metadata
  j.tenant_id,
  j.created_at,
  j.updated_at
FROM jtbd j
LEFT JOIN workflow_jtbd wj ON wj.jtbd_id = j.id
LEFT JOIN jtbd_roles jr ON jr.jtbd_id = j.id
WHERE j.deleted_at IS NULL
GROUP BY j.id
ORDER BY j.functional_area, j.code;

-- ============================================================================
-- STEP 2b: Create Detailed JTBD View with Full ODI Analysis
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_odi_analysis AS
SELECT
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.functional_area,
  j.job_category,
  j.complexity,
  -- ODI Formula: Opportunity = Importance + MAX(Importance - Satisfaction, 0)
  j.importance_score,
  j.satisfaction_score,
  j.opportunity_score,
  j.odi_tier,
  -- Gap Analysis
  ROUND((j.importance_score - j.satisfaction_score)::numeric, 2) as satisfaction_gap,
  -- Priority Classification
  CASE 
    WHEN j.opportunity_score >= 15 THEN 'Extreme Opportunity'
    WHEN j.opportunity_score >= 12 THEN 'High Opportunity'
    WHEN j.opportunity_score >= 10 THEN 'Medium Opportunity'
    ELSE 'Low Opportunity'
  END as opportunity_classification,
  -- Action Recommendation
  CASE 
    WHEN j.opportunity_score >= 15 AND j.strategic_priority = 'critical' THEN 'Immediate Action Required'
    WHEN j.opportunity_score >= 12 THEN 'Prioritize for Next Quarter'
    WHEN j.opportunity_score >= 10 THEN 'Include in Roadmap'
    ELSE 'Monitor'
  END as action_recommendation,
  j.strategic_priority,
  j.impact_level,
  j.recommended_service_layer,
  j.validation_score
FROM jtbd j
WHERE j.deleted_at IS NULL
ORDER BY j.opportunity_score DESC, j.importance_score DESC;

-- ============================================================================
-- STEP 3: Create Workflow-JTBD Mapping View (All)
-- ============================================================================

CREATE OR REPLACE VIEW v_all_workflow_jtbd_mapping AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  CASE 
    WHEN wt.code LIKE 'WF-DH-%' THEN 'Digital Health'
    WHEN wt.code LIKE 'WF-MAI-%' THEN 'Medical Affairs'
    WHEN wt.code LIKE 'WF-XFI-%' THEN 'Cross-Functional Insights'
    ELSE 'Other'
  END as workflow_area,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.functional_area as jtbd_area,
  wj.relevance_score,
  wj.is_primary,
  j.strategic_priority,
  j.opportunity_score,
  j.complexity,
  j.recommended_service_layer
FROM workflow_templates wt
JOIN workflow_jtbd wj ON wj.workflow_id = wt.id
JOIN jtbd j ON j.id = wj.jtbd_id
WHERE j.deleted_at IS NULL
ORDER BY wt.code, wj.is_primary DESC, wj.relevance_score DESC;

-- ============================================================================
-- STEP 4: Create JTBD-Role Mapping View
-- ============================================================================

CREATE OR REPLACE VIEW v_all_jtbd_role_mapping AS
SELECT
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.functional_area,
  r.name as role_name,
  d.name as department_name,
  f.name as function_name,
  jr.relevance_score,
  jr.importance,
  jr.frequency as role_frequency,
  j.strategic_priority,
  j.opportunity_score
FROM jtbd j
JOIN jtbd_roles jr ON jr.jtbd_id = j.id
JOIN org_roles r ON r.id = jr.role_id
LEFT JOIN org_departments d ON d.id = r.department_id
LEFT JOIN org_functions f ON f.id = d.function_id
WHERE j.deleted_at IS NULL
ORDER BY j.functional_area, j.code, jr.relevance_score DESC;

-- ============================================================================
-- STEP 5: Create Workflow by Functional Area Summary
-- ============================================================================

CREATE OR REPLACE VIEW v_workflow_by_area AS
SELECT
  CASE 
    WHEN code LIKE 'WF-DH-%' THEN 'Digital Health'
    WHEN code LIKE 'WF-MAI-%' THEN 'Medical Affairs'
    WHEN code LIKE 'WF-XFI-%' THEN 'Cross-Functional Insights'
    WHEN code LIKE 'WF-COM-%' THEN 'Commercial'
    WHEN code LIKE 'WF-REG-%' THEN 'Regulatory'
    WHEN code LIKE 'WF-RD-%' THEN 'R&D'
    ELSE 'Other'
  END as functional_area,
  COUNT(*) as total_workflows,
  COUNT(CASE WHEN work_mode = 'routine' THEN 1 END) as routine_workflows,
  COUNT(CASE WHEN work_mode = 'project' THEN 1 END) as project_workflows,
  COUNT(CASE WHEN complexity_level = 'low' THEN 1 END) as low_complexity,
  COUNT(CASE WHEN complexity_level = 'medium' THEN 1 END) as medium_complexity,
  COUNT(CASE WHEN complexity_level = 'high' THEN 1 END) as high_complexity,
  ROUND(AVG(estimated_duration_hours)::numeric, 1) as avg_duration_hours
FROM workflow_templates
GROUP BY 1
ORDER BY total_workflows DESC;

-- ============================================================================
-- STEP 6: Create JTBD by Functional Area Summary (Enhanced)
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_by_area AS
SELECT
  functional_area,
  COUNT(*) as total_jtbds,
  -- Job Category breakdown
  COUNT(CASE WHEN job_category = 'strategic' THEN 1 END) as strategic_jtbds,
  COUNT(CASE WHEN job_category = 'operational' THEN 1 END) as operational_jtbds,
  COUNT(CASE WHEN job_category = 'tactical' THEN 1 END) as tactical_jtbds,
  -- Complexity breakdown
  COUNT(CASE WHEN complexity = 'very_high' THEN 1 END) as very_high_complexity,
  COUNT(CASE WHEN complexity = 'high' THEN 1 END) as high_complexity,
  COUNT(CASE WHEN complexity IN ('medium', 'low') THEN 1 END) as lower_complexity,
  -- Priority breakdown
  COUNT(CASE WHEN strategic_priority = 'critical' THEN 1 END) as critical_priority,
  COUNT(CASE WHEN strategic_priority = 'high' THEN 1 END) as high_priority,
  COUNT(CASE WHEN strategic_priority = 'medium' THEN 1 END) as medium_priority,
  -- ODI Tier breakdown
  COUNT(CASE WHEN odi_tier = 'extreme' THEN 1 END) as extreme_opportunity,
  COUNT(CASE WHEN odi_tier = 'high' THEN 1 END) as high_opportunity,
  COUNT(CASE WHEN odi_tier = 'medium' THEN 1 END) as medium_opportunity,
  -- Work Pattern breakdown
  COUNT(CASE WHEN work_pattern = 'project' THEN 1 END) as project_work,
  COUNT(CASE WHEN work_pattern = 'routine' THEN 1 END) as routine_work,
  COUNT(CASE WHEN work_pattern = 'mixed' THEN 1 END) as mixed_work,
  -- Service Layer breakdown
  COUNT(CASE WHEN recommended_service_layer = 'L1_expert' THEN 1 END) as l1_expert_recommended,
  COUNT(CASE WHEN recommended_service_layer = 'L2_panel' THEN 1 END) as l2_panel_recommended,
  COUNT(CASE WHEN recommended_service_layer = 'L3_workflow' THEN 1 END) as l3_workflow_recommended,
  -- Compliance sensitivity
  COUNT(CASE WHEN compliance_sensitivity = 'critical' THEN 1 END) as critical_compliance,
  COUNT(CASE WHEN compliance_sensitivity = 'high' THEN 1 END) as high_compliance,
  -- ODI Metrics
  ROUND(AVG(opportunity_score)::numeric, 2) as avg_opportunity_score,
  ROUND(AVG(importance_score)::numeric, 2) as avg_importance_score,
  ROUND(AVG(satisfaction_score)::numeric, 2) as avg_satisfaction_score,
  ROUND(AVG(importance_score - satisfaction_score)::numeric, 2) as avg_satisfaction_gap,
  ROUND(AVG(validation_score)::numeric, 2) as avg_validation_score
FROM jtbd
WHERE deleted_at IS NULL
GROUP BY functional_area
ORDER BY total_jtbds DESC;

-- ============================================================================
-- STEP 6b: Create JTBD Complexity & Frequency Matrix
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_complexity_frequency_matrix AS
SELECT
  complexity,
  frequency,
  COUNT(*) as jtbd_count,
  ROUND(AVG(opportunity_score)::numeric, 2) as avg_opportunity,
  ROUND(AVG(importance_score)::numeric, 2) as avg_importance,
  STRING_AGG(DISTINCT functional_area, ', ') as functional_areas,
  STRING_AGG(code, ', ' ORDER BY opportunity_score DESC) as jtbd_codes
FROM jtbd
WHERE deleted_at IS NULL
GROUP BY complexity, frequency
ORDER BY 
  CASE complexity 
    WHEN 'very_high' THEN 1 
    WHEN 'high' THEN 2 
    WHEN 'medium' THEN 3 
    WHEN 'low' THEN 4 
  END,
  CASE frequency 
    WHEN 'daily' THEN 1 
    WHEN 'weekly' THEN 2 
    WHEN 'monthly' THEN 3 
    WHEN 'quarterly' THEN 4 
  END;

-- ============================================================================
-- STEP 7: Create Workflow Task Analysis View
-- ============================================================================

CREATE OR REPLACE VIEW v_workflow_task_analysis AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  CASE 
    WHEN wt.code LIKE 'WF-DH-%' THEN 'Digital Health'
    WHEN wt.code LIKE 'WF-MAI-%' THEN 'Medical Affairs'
    WHEN wt.code LIKE 'WF-XFI-%' THEN 'Cross-Functional Insights'
    ELSE 'Other'
  END as functional_area,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.task_type = 'automated' THEN 1 END) as automated_tasks,
  COUNT(CASE WHEN t.task_type = 'manual' THEN 1 END) as manual_tasks,
  COUNT(CASE WHEN t.task_type = 'review' THEN 1 END) as review_tasks,
  COUNT(CASE WHEN t.task_type = 'decision' THEN 1 END) as decision_tasks,
  COUNT(CASE WHEN t.service_layer = 'L1_expert' THEN 1 END) as l1_expert_tasks,
  COUNT(CASE WHEN t.service_layer = 'L2_panel' THEN 1 END) as l2_panel_tasks,
  COUNT(CASE WHEN t.service_layer = 'L3_workflow' THEN 1 END) as l3_workflow_tasks,
  COUNT(CASE WHEN t.service_layer = 'L4_solution' THEN 1 END) as l4_solution_tasks,
  ROUND(AVG(t.ai_automation_score)::numeric, 1) as avg_automation_score,
  SUM(CASE WHEN t.is_hitl_checkpoint THEN 1 ELSE 0 END) as hitl_checkpoints,
  SUM(t.estimated_duration_minutes) as total_duration_minutes
FROM workflow_templates wt
LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
LEFT JOIN workflow_activities wa ON wa.stage_id = ws.id
LEFT JOIN workflow_tasks t ON t.activity_id = wa.id
GROUP BY wt.id, wt.code, wt.name
ORDER BY wt.code;

-- ============================================================================
-- STEP 8: Create High-Opportunity JTBD View (for prioritization)
-- ============================================================================

CREATE OR REPLACE VIEW v_high_opportunity_jtbds AS
SELECT
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.description as jtbd_description,
  j.functional_area,
  j.job_category,
  j.strategic_priority,
  j.opportunity_score,
  j.importance_score,
  j.satisfaction_score,
  ROUND((j.importance_score - j.satisfaction_score)::numeric, 2) as satisfaction_gap,
  j.odi_tier,
  j.complexity,
  j.frequency,
  j.work_pattern,
  j.impact_level,
  j.compliance_sensitivity,
  j.recommended_service_layer,
  j.validation_score,
  COUNT(DISTINCT wj.workflow_id) as workflow_coverage,
  COUNT(DISTINCT jr.role_id) as role_coverage,
  CASE 
    WHEN COUNT(DISTINCT wj.workflow_id) = 0 THEN 'No Workflow - Needs Development'
    WHEN COUNT(DISTINCT wj.workflow_id) = 1 THEN 'Single Workflow'
    ELSE 'Multiple Workflows'
  END as workflow_status,
  -- Priority Score (composite)
  ROUND((
    j.opportunity_score * 0.4 + 
    CASE j.strategic_priority WHEN 'critical' THEN 10 WHEN 'high' THEN 7 WHEN 'medium' THEN 4 ELSE 1 END * 0.3 +
    CASE j.impact_level WHEN 'critical' THEN 10 WHEN 'high' THEN 7 WHEN 'medium' THEN 4 ELSE 1 END * 0.3
  )::numeric, 2) as composite_priority_score
FROM jtbd j
LEFT JOIN workflow_jtbd wj ON wj.jtbd_id = j.id
LEFT JOIN jtbd_roles jr ON jr.jtbd_id = j.id
WHERE j.deleted_at IS NULL
  AND (j.odi_tier IN ('extreme', 'high') OR j.strategic_priority IN ('critical', 'high'))
GROUP BY j.id, j.code, j.name, j.description, j.functional_area, j.job_category,
         j.strategic_priority, j.opportunity_score, j.importance_score, j.satisfaction_score,
         j.odi_tier, j.complexity, j.frequency, j.work_pattern, j.impact_level,
         j.compliance_sensitivity, j.recommended_service_layer, j.validation_score
ORDER BY 
  CASE j.odi_tier 
    WHEN 'extreme' THEN 1 
    WHEN 'high' THEN 2 
    ELSE 3 
  END,
  j.opportunity_score DESC;

-- ============================================================================
-- STEP 8b: Create JTBD Gap Analysis View (Unmet Needs)
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_gap_analysis AS
SELECT
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.functional_area,
  j.job_category,
  j.importance_score,
  j.satisfaction_score,
  ROUND((j.importance_score - j.satisfaction_score)::numeric, 2) as satisfaction_gap,
  j.opportunity_score,
  j.odi_tier,
  -- Gap Classification
  CASE 
    WHEN (j.importance_score - j.satisfaction_score) >= 6 THEN 'Critical Gap'
    WHEN (j.importance_score - j.satisfaction_score) >= 4 THEN 'Significant Gap'
    WHEN (j.importance_score - j.satisfaction_score) >= 2 THEN 'Moderate Gap'
    ELSE 'Acceptable'
  END as gap_classification,
  j.complexity,
  j.recommended_service_layer,
  j.strategic_priority,
  -- Workflow coverage
  (SELECT COUNT(*) FROM workflow_jtbd wj WHERE wj.jtbd_id = j.id) as workflow_count,
  -- Role coverage
  (SELECT COUNT(*) FROM jtbd_roles jr WHERE jr.jtbd_id = j.id) as role_count
FROM jtbd j
WHERE j.deleted_at IS NULL
  AND j.importance_score IS NOT NULL
  AND j.satisfaction_score IS NOT NULL
ORDER BY (j.importance_score - j.satisfaction_score) DESC;

-- ============================================================================
-- STEP 8c: Create JTBD Service Layer Distribution View
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_service_layer_distribution AS
SELECT
  recommended_service_layer,
  COUNT(*) as jtbd_count,
  ROUND(AVG(opportunity_score)::numeric, 2) as avg_opportunity,
  ROUND(AVG(complexity::text::int)::numeric, 2) as avg_complexity,
  COUNT(CASE WHEN strategic_priority = 'critical' THEN 1 END) as critical_count,
  COUNT(CASE WHEN strategic_priority = 'high' THEN 1 END) as high_count,
  STRING_AGG(DISTINCT functional_area, ', ') as functional_areas,
  -- Top 5 JTBDs by opportunity
  (SELECT STRING_AGG(code, ', ') 
   FROM (
     SELECT code 
     FROM jtbd j2 
     WHERE j2.recommended_service_layer = jtbd.recommended_service_layer 
       AND j2.deleted_at IS NULL
     ORDER BY j2.opportunity_score DESC 
     LIMIT 5
   ) top5
  ) as top_jtbds_by_opportunity
FROM jtbd
WHERE deleted_at IS NULL
  AND recommended_service_layer IS NOT NULL
GROUP BY recommended_service_layer
ORDER BY 
  CASE recommended_service_layer 
    WHEN 'L1_expert' THEN 1 
    WHEN 'L2_panel' THEN 2 
    WHEN 'L3_workflow' THEN 3 
    WHEN 'L4_solution' THEN 4 
  END;

-- ============================================================================
-- STEP 9: Create Digital Health Specific Summary
-- ============================================================================

CREATE OR REPLACE VIEW v_digital_health_summary AS
SELECT
  'Workflows' as category,
  COUNT(*) as total_count,
  COUNT(CASE WHEN work_mode = 'project' THEN 1 END) as project_count,
  COUNT(CASE WHEN complexity_level = 'high' THEN 1 END) as high_complexity_count,
  NULL::numeric as avg_opportunity_score
FROM workflow_templates
WHERE code LIKE 'WF-DH-%'

UNION ALL

SELECT
  'JTBDs' as category,
  COUNT(*) as total_count,
  COUNT(CASE WHEN job_category = 'strategic' THEN 1 END) as strategic_count,
  COUNT(CASE WHEN strategic_priority = 'critical' THEN 1 END) as critical_count,
  ROUND(AVG(opportunity_score)::numeric, 2) as avg_opportunity_score
FROM jtbd
WHERE functional_area = 'Medical Affairs' -- Digital Health JTBDs stored under Medical Affairs
  AND deleted_at IS NULL;

-- ============================================================================
-- STEP 10: Create Pharma/Medical Affairs Specific Summary
-- ============================================================================

CREATE OR REPLACE VIEW v_pharma_summary AS
SELECT
  'Medical Affairs Workflows' as category,
  COUNT(*) as total_count,
  COUNT(CASE WHEN work_mode = 'routine' THEN 1 END) as routine_count,
  COUNT(CASE WHEN complexity_level IN ('medium', 'high') THEN 1 END) as complex_count,
  NULL::numeric as avg_opportunity_score
FROM workflow_templates
WHERE code LIKE 'WF-MAI-%'

UNION ALL

SELECT
  'Cross-Functional Workflows' as category,
  COUNT(*) as total_count,
  COUNT(CASE WHEN work_mode = 'project' THEN 1 END) as project_count,
  COUNT(CASE WHEN complexity_level = 'high' THEN 1 END) as high_complexity_count,
  NULL::numeric as avg_opportunity_score
FROM workflow_templates
WHERE code LIKE 'WF-XFI-%'

UNION ALL

SELECT
  'Medical Affairs JTBDs' as category,
  COUNT(*) as total_count,
  COUNT(CASE WHEN job_category = 'operational' THEN 1 END) as operational_count,
  COUNT(CASE WHEN strategic_priority IN ('critical', 'high') THEN 1 END) as priority_count,
  ROUND(AVG(opportunity_score)::numeric, 2) as avg_opportunity_score
FROM jtbd
WHERE functional_area = 'Medical Affairs'
  AND deleted_at IS NULL;

-- ============================================================================
-- STEP 11: Create JTBD Compliance Risk View
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_compliance_risk AS
SELECT
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.functional_area,
  j.compliance_sensitivity,
  j.compliance_risk_level,
  j.impact_level,
  j.strategic_priority,
  j.complexity,
  j.opportunity_score,
  -- Risk Score (higher = more risk)
  CASE 
    WHEN j.compliance_sensitivity = 'critical' AND j.impact_level = 'critical' THEN 'Extreme Risk'
    WHEN j.compliance_sensitivity = 'critical' OR j.impact_level = 'critical' THEN 'High Risk'
    WHEN j.compliance_sensitivity = 'high' OR j.impact_level = 'high' THEN 'Medium Risk'
    ELSE 'Low Risk'
  END as risk_classification,
  j.recommended_service_layer,
  -- Workflow coverage for risk mitigation
  (SELECT COUNT(*) FROM workflow_jtbd wj WHERE wj.jtbd_id = j.id) as workflow_coverage
FROM jtbd j
WHERE j.deleted_at IS NULL
  AND (j.compliance_sensitivity IN ('critical', 'high') OR j.impact_level IN ('critical', 'high'))
ORDER BY 
  CASE j.compliance_sensitivity 
    WHEN 'critical' THEN 1 
    WHEN 'high' THEN 2 
    ELSE 3 
  END,
  CASE j.impact_level 
    WHEN 'critical' THEN 1 
    WHEN 'high' THEN 2 
    ELSE 3 
  END;

-- ============================================================================
-- STEP 12: Create JTBD Work Pattern Analysis View
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_work_pattern_analysis AS
SELECT
  work_pattern,
  COUNT(*) as jtbd_count,
  ROUND(AVG(opportunity_score)::numeric, 2) as avg_opportunity,
  ROUND(AVG(importance_score)::numeric, 2) as avg_importance,
  COUNT(CASE WHEN job_category = 'strategic' THEN 1 END) as strategic_count,
  COUNT(CASE WHEN job_category = 'operational' THEN 1 END) as operational_count,
  COUNT(CASE WHEN complexity IN ('very_high', 'high') THEN 1 END) as high_complexity_count,
  STRING_AGG(DISTINCT functional_area, ', ') as functional_areas,
  -- Automation potential
  ROUND(
    (COUNT(CASE WHEN recommended_service_layer IN ('L3_workflow', 'L4_solution') THEN 1 END)::numeric / 
     NULLIF(COUNT(*)::numeric, 0) * 100), 1
  ) as automation_potential_pct
FROM jtbd
WHERE deleted_at IS NULL
GROUP BY work_pattern
ORDER BY jtbd_count DESC;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Workflow Views
-- SELECT * FROM v_all_workflow_summary;
-- SELECT * FROM v_workflow_by_area;
-- SELECT * FROM v_workflow_task_analysis;

-- JTBD Core Views
-- SELECT * FROM v_all_jtbd_summary LIMIT 20;
-- SELECT * FROM v_jtbd_by_area;
-- SELECT * FROM v_jtbd_odi_analysis ORDER BY opportunity_score DESC LIMIT 20;

-- JTBD Analysis Views
-- SELECT * FROM v_jtbd_complexity_frequency_matrix;
-- SELECT * FROM v_jtbd_gap_analysis WHERE gap_classification IN ('Critical Gap', 'Significant Gap');
-- SELECT * FROM v_jtbd_service_layer_distribution;
-- SELECT * FROM v_jtbd_compliance_risk;
-- SELECT * FROM v_jtbd_work_pattern_analysis;

-- Mapping Views
-- SELECT * FROM v_all_workflow_jtbd_mapping;
-- SELECT * FROM v_all_jtbd_role_mapping LIMIT 50;

-- Priority Views
-- SELECT * FROM v_high_opportunity_jtbds LIMIT 20;

-- Summary Views
-- SELECT * FROM v_digital_health_summary;
-- SELECT * FROM v_pharma_summary;


