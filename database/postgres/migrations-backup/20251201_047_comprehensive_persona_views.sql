-- Migration: 20251201_047_comprehensive_persona_views.sql
-- Purpose: Create comprehensive views for all personas across Digital Health and Pharmaceuticals
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Comprehensive Persona Summary View (All Attributes)
-- ============================================================================

CREATE OR REPLACE VIEW v_all_persona_summary AS
SELECT
  p.id as persona_id,
  p.unique_id,
  p.persona_name,
  p.persona_type,
  p.title,
  p.description,
  p.is_active,
  -- Demographics
  p.age_range,
  p.experience_level,
  p.education_level,
  -- Organization
  p.department,
  p.function_area,
  p.geographic_scope,
  -- Role relationship
  p.source_role_id,
  r.name as role_name,
  d.name as department_name,
  f.name as function_name,
  -- MECE Archetype attributes
  p.ai_readiness_score,
  p.work_complexity_score,
  p.derived_archetype,
  p.preferred_service_layer,
  -- Work mix
  p.project_work_ratio,
  p.bau_work_ratio,
  p.work_dominance,
  -- OKR ownership
  p.owned_okr_count,
  p.contributed_okr_count,
  -- Goals & Challenges (JSONB)
  p.goals,
  p.challenges,
  p.motivations,
  p.frustrations,
  -- Professional context
  p.daily_activities,
  p.tools_used,
  p.communication_preferences,
  p.skills,
  p.competencies,
  p.success_metrics,
  -- Pharma-specific
  p.gxp_requirements,
  p.regulatory_context,
  p.therapeutic_areas,
  -- Quality & Validation
  p.data_quality_score,
  p.validated_by,
  p.last_validated,
  -- Metadata
  p.tenant_id,
  p.created_by,
  p.created_at,
  p.updated_at
FROM personas p
LEFT JOIN org_roles r ON r.id = p.source_role_id
LEFT JOIN org_departments d ON d.id = r.department_id
LEFT JOIN org_functions f ON f.id = d.function_id
WHERE p.is_active = true
ORDER BY p.function_area, p.department, p.persona_name;

-- ============================================================================
-- STEP 2: Create Persona by Archetype Distribution View
-- ============================================================================

CREATE OR REPLACE VIEW v_persona_by_archetype AS
SELECT
  derived_archetype,
  COUNT(*) as persona_count,
  ROUND(AVG(ai_readiness_score)::numeric, 2) as avg_ai_readiness,
  ROUND(AVG(work_complexity_score)::numeric, 2) as avg_work_complexity,
  COUNT(CASE WHEN preferred_service_layer = 'L1_expert' THEN 1 END) as l1_expert_count,
  COUNT(CASE WHEN preferred_service_layer = 'L2_panel' THEN 1 END) as l2_panel_count,
  COUNT(CASE WHEN preferred_service_layer = 'L3_workflow' THEN 1 END) as l3_workflow_count,
  COUNT(CASE WHEN preferred_service_layer = 'L4_solution' THEN 1 END) as l4_solution_count,
  STRING_AGG(DISTINCT function_area, ', ') as function_areas,
  -- Archetype description
  CASE derived_archetype
    WHEN 'AUTOMATOR' THEN 'High AI + Low Complexity: Efficiency-focused, automation champions'
    WHEN 'ORCHESTRATOR' THEN 'High AI + High Complexity: Strategic leaders, AI power users'
    WHEN 'LEARNER' THEN 'Low AI + Low Complexity: Guided support needed, building AI skills'
    WHEN 'SKEPTIC' THEN 'Low AI + High Complexity: Proof-driven, multi-perspective seekers'
    ELSE 'Unknown'
  END as archetype_description
FROM personas
WHERE is_active = true
  AND derived_archetype IS NOT NULL
GROUP BY derived_archetype
ORDER BY persona_count DESC;

-- ============================================================================
-- STEP 3: Create Persona by Function Area View
-- ============================================================================

CREATE OR REPLACE VIEW v_persona_by_function AS
SELECT
  function_area,
  COUNT(*) as total_personas,
  -- Archetype distribution
  COUNT(CASE WHEN derived_archetype = 'AUTOMATOR' THEN 1 END) as automators,
  COUNT(CASE WHEN derived_archetype = 'ORCHESTRATOR' THEN 1 END) as orchestrators,
  COUNT(CASE WHEN derived_archetype = 'LEARNER' THEN 1 END) as learners,
  COUNT(CASE WHEN derived_archetype = 'SKEPTIC' THEN 1 END) as skeptics,
  -- Experience level distribution
  COUNT(CASE WHEN experience_level IN ('Director', 'VP', 'C-Level') THEN 1 END) as senior_leaders,
  COUNT(CASE WHEN experience_level IN ('Senior', 'Manager') THEN 1 END) as mid_level,
  COUNT(CASE WHEN experience_level IN ('Junior', 'Associate') THEN 1 END) as early_career,
  -- AI readiness
  ROUND(AVG(ai_readiness_score)::numeric, 2) as avg_ai_readiness,
  ROUND(AVG(work_complexity_score)::numeric, 2) as avg_work_complexity,
  -- Service layer preference
  COUNT(CASE WHEN preferred_service_layer = 'L1_expert' THEN 1 END) as prefer_l1,
  COUNT(CASE WHEN preferred_service_layer = 'L2_panel' THEN 1 END) as prefer_l2,
  COUNT(CASE WHEN preferred_service_layer = 'L3_workflow' THEN 1 END) as prefer_l3,
  COUNT(CASE WHEN preferred_service_layer = 'L4_solution' THEN 1 END) as prefer_l4,
  -- Data quality
  ROUND(AVG(data_quality_score)::numeric, 2) as avg_data_quality
FROM personas
WHERE is_active = true
GROUP BY function_area
ORDER BY total_personas DESC;

-- ============================================================================
-- STEP 4: Create Persona by Department View
-- ============================================================================

CREATE OR REPLACE VIEW v_persona_by_department AS
SELECT
  p.function_area,
  p.department,
  COUNT(*) as persona_count,
  COUNT(DISTINCT p.source_role_id) as unique_roles,
  -- Archetype distribution
  COUNT(CASE WHEN p.derived_archetype = 'AUTOMATOR' THEN 1 END) as automators,
  COUNT(CASE WHEN p.derived_archetype = 'ORCHESTRATOR' THEN 1 END) as orchestrators,
  COUNT(CASE WHEN p.derived_archetype = 'LEARNER' THEN 1 END) as learners,
  COUNT(CASE WHEN p.derived_archetype = 'SKEPTIC' THEN 1 END) as skeptics,
  -- AI metrics
  ROUND(AVG(p.ai_readiness_score)::numeric, 2) as avg_ai_readiness,
  ROUND(AVG(p.work_complexity_score)::numeric, 2) as avg_work_complexity,
  -- Check if MECE complete (should have 4 personas per role)
  CASE 
    WHEN COUNT(*) >= COUNT(DISTINCT p.source_role_id) * 4 THEN 'Complete'
    WHEN COUNT(*) >= COUNT(DISTINCT p.source_role_id) * 2 THEN 'Partial'
    ELSE 'Incomplete'
  END as mece_coverage_status
FROM personas p
WHERE p.is_active = true
GROUP BY p.function_area, p.department
ORDER BY p.function_area, p.department;

-- ============================================================================
-- STEP 5: Create Persona Service Layer Preference View
-- ============================================================================

CREATE OR REPLACE VIEW v_persona_service_layer_preference AS
SELECT
  preferred_service_layer,
  COUNT(*) as persona_count,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 1) as percentage,
  -- Archetype distribution
  COUNT(CASE WHEN derived_archetype = 'AUTOMATOR' THEN 1 END) as automators,
  COUNT(CASE WHEN derived_archetype = 'ORCHESTRATOR' THEN 1 END) as orchestrators,
  COUNT(CASE WHEN derived_archetype = 'LEARNER' THEN 1 END) as learners,
  COUNT(CASE WHEN derived_archetype = 'SKEPTIC' THEN 1 END) as skeptics,
  -- AI metrics
  ROUND(AVG(ai_readiness_score)::numeric, 2) as avg_ai_readiness,
  ROUND(AVG(work_complexity_score)::numeric, 2) as avg_work_complexity,
  -- Service layer description
  CASE preferred_service_layer
    WHEN 'L1_expert' THEN 'Quick expert answers with optional human review'
    WHEN 'L2_panel' THEN 'Multi-expert panel for diverse perspectives'
    WHEN 'L3_workflow' THEN 'Guided workflow with automation and HITL checkpoints'
    WHEN 'L4_solution' THEN 'Full end-to-end solution with orchestration'
    ELSE 'Default expert service'
  END as service_description,
  STRING_AGG(DISTINCT function_area, ', ') as function_areas
FROM personas
WHERE is_active = true
  AND preferred_service_layer IS NOT NULL
GROUP BY preferred_service_layer
ORDER BY 
  CASE preferred_service_layer 
    WHEN 'L1_expert' THEN 1 
    WHEN 'L2_panel' THEN 2 
    WHEN 'L3_workflow' THEN 3 
    WHEN 'L4_solution' THEN 4 
  END;

-- ============================================================================
-- STEP 6: Create Persona AI Readiness Matrix View
-- ============================================================================

CREATE OR REPLACE VIEW v_persona_ai_readiness_matrix AS
SELECT
  -- AI Readiness Tier
  CASE 
    WHEN ai_readiness_score >= 0.8 THEN 'High AI Ready (0.8+)'
    WHEN ai_readiness_score >= 0.5 THEN 'Medium AI Ready (0.5-0.8)'
    ELSE 'Low AI Ready (<0.5)'
  END as ai_readiness_tier,
  -- Work Complexity Tier
  CASE 
    WHEN work_complexity_score >= 0.7 THEN 'High Complexity (0.7+)'
    WHEN work_complexity_score >= 0.4 THEN 'Medium Complexity (0.4-0.7)'
    ELSE 'Low Complexity (<0.4)'
  END as work_complexity_tier,
  COUNT(*) as persona_count,
  STRING_AGG(DISTINCT derived_archetype, ', ') as archetypes,
  STRING_AGG(DISTINCT preferred_service_layer, ', ') as service_layers,
  STRING_AGG(DISTINCT function_area, ', ') as function_areas
FROM personas
WHERE is_active = true
  AND ai_readiness_score IS NOT NULL
  AND work_complexity_score IS NOT NULL
GROUP BY 
  CASE 
    WHEN ai_readiness_score >= 0.8 THEN 'High AI Ready (0.8+)'
    WHEN ai_readiness_score >= 0.5 THEN 'Medium AI Ready (0.5-0.8)'
    ELSE 'Low AI Ready (<0.5)'
  END,
  CASE 
    WHEN work_complexity_score >= 0.7 THEN 'High Complexity (0.7+)'
    WHEN work_complexity_score >= 0.4 THEN 'Medium Complexity (0.4-0.7)'
    ELSE 'Low Complexity (<0.4)'
  END
ORDER BY ai_readiness_tier, work_complexity_tier;

-- ============================================================================
-- STEP 7: Create Persona Role Coverage View
-- ============================================================================

CREATE OR REPLACE VIEW v_persona_role_coverage AS
SELECT
  r.id as role_id,
  r.name as role_name,
  d.name as department_name,
  f.name as function_name,
  COUNT(p.id) as persona_count,
  COUNT(CASE WHEN p.derived_archetype = 'AUTOMATOR' THEN 1 END) as has_automator,
  COUNT(CASE WHEN p.derived_archetype = 'ORCHESTRATOR' THEN 1 END) as has_orchestrator,
  COUNT(CASE WHEN p.derived_archetype = 'LEARNER' THEN 1 END) as has_learner,
  COUNT(CASE WHEN p.derived_archetype = 'SKEPTIC' THEN 1 END) as has_skeptic,
  -- MECE completeness check
  CASE 
    WHEN COUNT(p.id) >= 4 
      AND COUNT(CASE WHEN p.derived_archetype = 'AUTOMATOR' THEN 1 END) >= 1
      AND COUNT(CASE WHEN p.derived_archetype = 'ORCHESTRATOR' THEN 1 END) >= 1
      AND COUNT(CASE WHEN p.derived_archetype = 'LEARNER' THEN 1 END) >= 1
      AND COUNT(CASE WHEN p.derived_archetype = 'SKEPTIC' THEN 1 END) >= 1
    THEN 'MECE Complete'
    WHEN COUNT(p.id) > 0 THEN 'Partial Coverage'
    ELSE 'No Personas'
  END as mece_status,
  STRING_AGG(p.persona_name, ', ' ORDER BY p.derived_archetype) as persona_names
FROM org_roles r
LEFT JOIN org_departments d ON d.id = r.department_id
LEFT JOIN org_functions f ON f.id = d.function_id
LEFT JOIN personas p ON p.source_role_id = r.id AND p.is_active = true
GROUP BY r.id, r.name, d.name, f.name
ORDER BY f.name, d.name, r.name;

-- ============================================================================
-- STEP 8: Create Persona Experience Level Distribution View
-- ============================================================================

CREATE OR REPLACE VIEW v_persona_experience_distribution AS
SELECT
  experience_level,
  COUNT(*) as persona_count,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 1) as percentage,
  -- Archetype distribution
  COUNT(CASE WHEN derived_archetype = 'AUTOMATOR' THEN 1 END) as automators,
  COUNT(CASE WHEN derived_archetype = 'ORCHESTRATOR' THEN 1 END) as orchestrators,
  COUNT(CASE WHEN derived_archetype = 'LEARNER' THEN 1 END) as learners,
  COUNT(CASE WHEN derived_archetype = 'SKEPTIC' THEN 1 END) as skeptics,
  -- AI metrics
  ROUND(AVG(ai_readiness_score)::numeric, 2) as avg_ai_readiness,
  ROUND(AVG(work_complexity_score)::numeric, 2) as avg_work_complexity,
  -- Most common service layer
  MODE() WITHIN GROUP (ORDER BY preferred_service_layer) as most_common_service_layer,
  STRING_AGG(DISTINCT function_area, ', ') as function_areas
FROM personas
WHERE is_active = true
GROUP BY experience_level
ORDER BY 
  CASE experience_level
    WHEN 'C-Level' THEN 1
    WHEN 'VP' THEN 2
    WHEN 'Director' THEN 3
    WHEN 'Senior' THEN 4
    WHEN 'Manager' THEN 5
    WHEN 'Associate' THEN 6
    WHEN 'Junior' THEN 7
    ELSE 8
  END;

-- ============================================================================
-- STEP 9: Create Digital Health Persona Summary View
-- ============================================================================

CREATE OR REPLACE VIEW v_digital_health_personas AS
SELECT
  p.id as persona_id,
  p.unique_id,
  p.persona_name,
  p.title,
  p.derived_archetype,
  p.preferred_service_layer,
  p.ai_readiness_score,
  p.work_complexity_score,
  p.department,
  p.function_area,
  p.experience_level,
  r.name as role_name,
  -- Archetype characteristics
  CASE p.derived_archetype
    WHEN 'AUTOMATOR' THEN 'Efficiency-focused, seeks automation'
    WHEN 'ORCHESTRATOR' THEN 'Strategic, orchestrates complex work'
    WHEN 'LEARNER' THEN 'Building skills, needs guidance'
    WHEN 'SKEPTIC' THEN 'Proof-driven, values multiple perspectives'
  END as archetype_behavior,
  p.goals,
  p.challenges,
  p.data_quality_score
FROM personas p
LEFT JOIN org_roles r ON r.id = p.source_role_id
WHERE p.is_active = true
  AND (p.function_area ILIKE '%Digital%' 
       OR p.department ILIKE '%Digital%'
       OR p.function_area ILIKE '%Technology%'
       OR p.function_area ILIKE '%Innovation%')
ORDER BY p.function_area, p.department, p.derived_archetype;

-- ============================================================================
-- STEP 10: Create Pharma/Medical Affairs Persona Summary View
-- ============================================================================

CREATE OR REPLACE VIEW v_pharma_personas AS
SELECT
  p.id as persona_id,
  p.unique_id,
  p.persona_name,
  p.title,
  p.derived_archetype,
  p.preferred_service_layer,
  p.ai_readiness_score,
  p.work_complexity_score,
  p.department,
  p.function_area,
  p.experience_level,
  r.name as role_name,
  -- Pharma-specific context
  p.gxp_requirements,
  p.regulatory_context,
  p.therapeutic_areas,
  p.goals,
  p.challenges,
  p.data_quality_score
FROM personas p
LEFT JOIN org_roles r ON r.id = p.source_role_id
WHERE p.is_active = true
  AND (p.function_area ILIKE '%Medical%'
       OR p.function_area ILIKE '%Commercial%'
       OR p.function_area ILIKE '%Regulatory%'
       OR p.function_area ILIKE '%Clinical%'
       OR p.function_area ILIKE '%R&D%')
ORDER BY p.function_area, p.department, p.derived_archetype;

-- ============================================================================
-- STEP 11: Create Persona JTBD Mapping View
-- ============================================================================

CREATE OR REPLACE VIEW v_persona_jtbd_mapping AS
SELECT
  p.persona_name,
  p.title,
  p.derived_archetype,
  p.preferred_service_layer,
  p.function_area,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.job_category,
  j.opportunity_score,
  j.strategic_priority,
  pm.relevance_score,
  pm.frequency as engagement_frequency
FROM personas p
JOIN jtbd_persona_mapping pm ON pm.persona_id = p.id
JOIN jtbd j ON j.id = pm.jtbd_id
WHERE p.is_active = true
  AND j.deleted_at IS NULL
ORDER BY p.function_area, p.persona_name, pm.relevance_score DESC;

-- ============================================================================
-- STEP 12: Create Persona Summary Statistics View
-- ============================================================================

CREATE OR REPLACE VIEW v_persona_statistics AS
SELECT
  'Total Active Personas' as metric,
  COUNT(*)::text as value
FROM personas WHERE is_active = true

UNION ALL

SELECT
  'Unique Roles with Personas' as metric,
  COUNT(DISTINCT source_role_id)::text as value
FROM personas WHERE is_active = true

UNION ALL

SELECT
  'MECE Complete Roles' as metric,
  COUNT(*)::text as value
FROM (
  SELECT source_role_id
  FROM personas
  WHERE is_active = true
  GROUP BY source_role_id
  HAVING COUNT(DISTINCT derived_archetype) >= 4
) mece

UNION ALL

SELECT
  'Avg AI Readiness Score' as metric,
  ROUND(AVG(ai_readiness_score)::numeric, 2)::text as value
FROM personas WHERE is_active = true

UNION ALL

SELECT
  'Avg Work Complexity Score' as metric,
  ROUND(AVG(work_complexity_score)::numeric, 2)::text as value
FROM personas WHERE is_active = true

UNION ALL

SELECT
  'Avg Data Quality Score' as metric,
  ROUND(AVG(data_quality_score)::numeric, 2)::text as value
FROM personas WHERE is_active = true

UNION ALL

SELECT
  'Functions Covered' as metric,
  COUNT(DISTINCT function_area)::text as value
FROM personas WHERE is_active = true

UNION ALL

SELECT
  'Departments Covered' as metric,
  COUNT(DISTINCT department)::text as value
FROM personas WHERE is_active = true;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Core Views
-- SELECT * FROM v_all_persona_summary LIMIT 20;
-- SELECT * FROM v_persona_statistics;

-- Distribution Views
-- SELECT * FROM v_persona_by_archetype;
-- SELECT * FROM v_persona_by_function;
-- SELECT * FROM v_persona_by_department;
-- SELECT * FROM v_persona_service_layer_preference;
-- SELECT * FROM v_persona_experience_distribution;

-- Analysis Views
-- SELECT * FROM v_persona_ai_readiness_matrix;
-- SELECT * FROM v_persona_role_coverage WHERE mece_status != 'MECE Complete';

-- Domain-specific Views
-- SELECT * FROM v_digital_health_personas LIMIT 20;
-- SELECT * FROM v_pharma_personas LIMIT 20;

-- Mapping Views
-- SELECT * FROM v_persona_jtbd_mapping LIMIT 50;










