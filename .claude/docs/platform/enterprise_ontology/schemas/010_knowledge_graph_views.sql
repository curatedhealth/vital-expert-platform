-- =====================================================================
-- KNOWLEDGE GRAPH PROJECTION VIEWS
-- =====================================================================
-- Version: 1.0.0
-- Created: 2025-11-28
-- Purpose: Views for Knowledge Graph traversal and Neo4j projection
-- Dependencies: All previous schema files
-- =====================================================================
--
-- ARCHITECTURE PRINCIPLE:
-- These views enable graph-like queries in PostgreSQL and serve as
-- the source for CDC projection to Neo4j. They expose:
--   - Node extractions for each entity type
--   - Edge extractions for relationships
--   - Aggregate views for analytics
--   - Cross-layer traversal paths
-- =====================================================================

-- =====================================================================
-- NODE EXTRACTION VIEWS (For Neo4j Projection)
-- =====================================================================

-- KG Nodes: Therapeutic Areas
CREATE OR REPLACE VIEW kg_nodes_therapeutic_areas AS
SELECT
  id AS node_id,
  'TherapeuticArea' AS node_type,
  unique_id,
  name,
  code,
  parent_ta_id,
  level,
  regulatory_complexity,
  rag_collection_id,
  is_active,
  created_at,
  updated_at
FROM l0_therapeutic_areas
WHERE is_active = true;

-- KG Nodes: Products
CREATE OR REPLACE VIEW kg_nodes_products AS
SELECT
  id AS node_id,
  'Product' AS node_type,
  unique_id,
  product_code,
  generic_name,
  brand_names,
  product_type,
  lifecycle_stage,
  primary_therapeutic_area_id,
  rag_collection_id,
  tenant_id,
  is_active,
  created_at,
  updated_at
FROM l0_products
WHERE is_active = true;

-- KG Nodes: Diseases
CREATE OR REPLACE VIEW kg_nodes_diseases AS
SELECT
  id AS node_id,
  'Disease' AS node_type,
  unique_id,
  name,
  code,
  disease_category,
  unmet_need_level,
  therapeutic_area_id,
  rag_collection_id,
  is_active,
  created_at
FROM l0_diseases
WHERE is_active = true;

-- KG Nodes: Business Functions
CREATE OR REPLACE VIEW kg_nodes_functions AS
SELECT
  id AS node_id,
  'Function' AS node_type,
  unique_id,
  name,
  code,
  is_revenue_generating,
  is_support_function,
  regulatory_oversight_level,
  strategic_priority,
  parent_function_id,
  tenant_id,
  is_active,
  created_at
FROM org_business_functions
WHERE is_active = true;

-- KG Nodes: Departments
CREATE OR REPLACE VIEW kg_nodes_departments AS
SELECT
  id AS node_id,
  'Department' AS node_type,
  unique_id,
  name,
  code,
  function_id,
  headcount_range,
  geographic_scope,
  operating_model,
  parent_department_id,
  tenant_id,
  is_active,
  created_at
FROM org_departments
WHERE is_active = true;

-- KG Nodes: Roles
CREATE OR REPLACE VIEW kg_nodes_roles AS
SELECT
  id AS node_id,
  'Role' AS node_type,
  unique_id,
  name,
  function_id,
  department_id,
  role_type,
  seniority_level,
  expected_ai_maturity,
  automation_exposure_percent,
  gxp_critical,
  is_active,
  created_at
FROM org_roles
WHERE is_active = true;

-- KG Nodes: Personas
CREATE OR REPLACE VIEW kg_nodes_personas AS
SELECT
  id AS node_id,
  'Persona' AS node_type,
  unique_id,
  persona_name,
  persona_type AS archetype,
  source_role_id,
  title,
  department,
  function_area,
  experience_level,
  geographic_scope,
  is_active,
  created_at
FROM personas
WHERE is_active = true;

-- KG Nodes: JTBDs
CREATE OR REPLACE VIEW kg_nodes_jtbds AS
SELECT
  id AS node_id,
  'Job' AS node_type,
  unique_id,
  COALESCE(jtbd_statement, 'JTBD-' || id) AS name,
  job_category,
  job_type,
  situation_context,
  desired_outcome,
  odi_importance_baseline,
  odi_satisfaction_baseline,
  created_at
FROM ref_jtbds;

-- KG Nodes: Processes
CREATE OR REPLACE VIEW kg_nodes_processes AS
SELECT
  id AS node_id,
  'Process' AS node_type,
  unique_id,
  name,
  process_category,
  process_type,
  owner_function_id,
  owner_department_id,
  automation_potential,
  current_automation_level,
  gxp_relevant,
  is_active,
  created_at
FROM ref_processes
WHERE is_active = true;

-- KG Nodes: Workflows
CREATE OR REPLACE VIEW kg_nodes_workflows AS
SELECT
  id AS node_id,
  'WorkflowTemplate' AS node_type,
  unique_id,
  name,
  workflow_type,
  source_process_id,
  trigger_type,
  default_service_layer,
  complexity_level,
  gxp_validated,
  is_active,
  created_at
FROM workflow_templates
WHERE is_active = true;

-- KG Nodes: Opportunities
CREATE OR REPLACE VIEW kg_nodes_opportunities AS
SELECT
  o.id AS node_id,
  'Opportunity' AS node_type,
  o.unique_id,
  o.opportunity_name AS name,
  o.opportunity_type,
  o.opportunity_category,
  o.intervention_type,
  o.tier,
  o.target_process_id,
  o.target_jtbd_id,
  o.recommended_service_layer,
  os.weighted_score,
  os.vpanes_total,
  o.created_at
FROM ref_opportunities o
LEFT JOIN opportunity_scores os ON o.id = os.opportunity_id AND os.version = 1;

-- KG Nodes: Pain Points
CREATE OR REPLACE VIEW kg_nodes_pain_points AS
SELECT
  id AS node_id,
  'PainPoint' AS node_type,
  unique_id,
  pain_point_name AS name,
  pain_category,
  root_cause_category,
  impact_area,
  is_systemic,
  solvability,
  created_at
FROM ref_pain_points;

-- KG Nodes: Capabilities
CREATE OR REPLACE VIEW kg_nodes_capabilities AS
SELECT
  id AS node_id,
  'Capability' AS node_type,
  unique_id,
  name,
  capability_category,
  business_impact,
  competitive_differentiation,
  created_at
FROM ref_capabilities;

-- =====================================================================
-- EDGE EXTRACTION VIEWS (For Neo4j Projection)
-- =====================================================================

-- Edges: Function Contains Department
CREATE OR REPLACE VIEW kg_edges_function_department AS
SELECT
  gen_random_uuid() AS edge_id,
  'CONTAINS' AS edge_type,
  function_id AS from_id,
  'Function' AS from_type,
  id AS to_id,
  'Department' AS to_type,
  created_at
FROM org_departments
WHERE function_id IS NOT NULL AND is_active = true;

-- Edges: Department Contains Role
CREATE OR REPLACE VIEW kg_edges_department_role AS
SELECT
  gen_random_uuid() AS edge_id,
  'CONTAINS' AS edge_type,
  department_id AS from_id,
  'Department' AS from_type,
  id AS to_id,
  'Role' AS to_type,
  created_at
FROM org_roles
WHERE department_id IS NOT NULL AND is_active = true;

-- Edges: Role Has Persona
CREATE OR REPLACE VIEW kg_edges_role_persona AS
SELECT
  gen_random_uuid() AS edge_id,
  'HAS_PERSONA' AS edge_type,
  source_role_id AS from_id,
  'Role' AS from_type,
  id AS to_id,
  'Persona' AS to_type,
  persona_type AS archetype,
  created_at
FROM personas
WHERE source_role_id IS NOT NULL AND is_active = true;

-- Edges: Persona Performs JTBD
CREATE OR REPLACE VIEW kg_edges_persona_jtbd AS
SELECT
  id AS edge_id,
  'PERFORMS_JTBD' AS edge_type,
  persona_id AS from_id,
  'Persona' AS from_type,
  jtbd_id AS to_id,
  'Job' AS to_type,
  importance_score,
  satisfaction_score,
  opportunity_score,
  frequency,
  created_at
FROM persona_jtbds;

-- Edges: Persona Has Pain Point
CREATE OR REPLACE VIEW kg_edges_persona_pain AS
SELECT
  id AS edge_id,
  'HAS_PAIN_POINT' AS edge_type,
  persona_id AS from_id,
  'Persona' AS from_type,
  pain_point_id AS to_id,
  'PainPoint' AS to_type,
  severity,
  frequency,
  impact_score,
  vpanes_pain,
  created_at
FROM persona_pain_points;

-- Edges: Pain Point Addressed By Opportunity
CREATE OR REPLACE VIEW kg_edges_pain_opportunity AS
SELECT
  id AS edge_id,
  'ADDRESSED_BY' AS edge_type,
  pain_point_id AS from_id,
  'PainPoint' AS from_type,
  opportunity_id AS to_id,
  'Opportunity' AS to_type,
  resolution_effectiveness,
  implementation_effort,
  roi_estimate,
  created_at
FROM pain_point_opportunities;

-- Edges: JTBD Enables Opportunity
CREATE OR REPLACE VIEW kg_edges_jtbd_opportunity AS
SELECT
  id AS edge_id,
  'ENABLES' AS edge_type,
  jtbd_id AS from_id,
  'Job' AS from_type,
  opportunity_id AS to_id,
  'Opportunity' AS to_type,
  enablement_score,
  created_at
FROM jtbd_opportunities;

-- Edges: Process Has Workflow
CREATE OR REPLACE VIEW kg_edges_process_workflow AS
SELECT
  gen_random_uuid() AS edge_id,
  'HAS_WORKFLOW' AS edge_type,
  source_process_id AS from_id,
  'Process' AS from_type,
  id AS to_id,
  'WorkflowTemplate' AS to_type,
  created_at
FROM workflow_templates
WHERE source_process_id IS NOT NULL AND is_active = true;

-- Edges: Function Collaborates With Function
CREATE OR REPLACE VIEW kg_edges_function_collaboration AS
SELECT
  id AS edge_id,
  'COLLABORATES_WITH' AS edge_type,
  function_a_id AS from_id,
  'Function' AS from_type,
  function_b_id AS to_id,
  'Function' AS to_type,
  collaboration_type,
  interaction_frequency,
  governance_required,
  use_cases,
  common_friction_points,
  created_at
FROM org_function_collaborations;

-- Edges: Product In Therapeutic Area
CREATE OR REPLACE VIEW kg_edges_product_ta AS
SELECT
  id AS edge_id,
  'IN_THERAPEUTIC_AREA' AS edge_type,
  product_id AS from_id,
  'Product' AS from_type,
  therapeutic_area_id AS to_id,
  'TherapeuticArea' AS to_type,
  is_primary,
  created_at
FROM l0_product_therapeutic_areas;

-- Edges: Product Indicated For Disease
CREATE OR REPLACE VIEW kg_edges_product_indication AS
SELECT
  id AS edge_id,
  'INDICATED_FOR' AS edge_type,
  product_id AS from_id,
  'Product' AS from_type,
  disease_id AS to_id,
  'Disease' AS to_type,
  approval_status,
  line_of_therapy,
  is_primary,
  created_at
FROM l0_product_indications;

-- Edges: Role Has Domain Expertise
CREATE OR REPLACE VIEW kg_edges_role_domain AS
SELECT
  id AS edge_id,
  'HAS_EXPERTISE' AS edge_type,
  role_id AS from_id,
  'Role' AS from_type,
  COALESCE(therapeutic_area_id, product_id, disease_id) AS to_id,
  CASE
    WHEN therapeutic_area_id IS NOT NULL THEN 'TherapeuticArea'
    WHEN product_id IS NOT NULL THEN 'Product'
    ELSE 'Disease'
  END AS to_type,
  expertise_level,
  created_at
FROM role_domain_expertise;

-- =====================================================================
-- AGGREGATE/ANALYTICS VIEWS
-- =====================================================================

-- View: High-Opportunity Pain Points by Persona
CREATE OR REPLACE VIEW v_persona_opportunity_radar AS
SELECT
  p.unique_id AS persona_unique_id,
  p.persona_name,
  p.persona_type AS archetype,
  r.name AS role_name,
  d.name AS department_name,
  pp.pain_point_name,
  ppp.severity,
  ppp.vpanes_pain,
  o.opportunity_name,
  os.weighted_score AS opportunity_score,
  os.vpanes_total,
  o.tier AS opportunity_tier,
  o.recommended_service_layer,
  po.resolution_effectiveness
FROM personas p
LEFT JOIN org_roles r ON p.source_role_id = r.id
LEFT JOIN org_departments d ON r.department_id = d.id
JOIN persona_pain_points ppp ON p.id = ppp.persona_id
JOIN ref_pain_points pp ON ppp.pain_point_id = pp.id
LEFT JOIN pain_point_opportunities po ON pp.id = po.pain_point_id
LEFT JOIN ref_opportunities o ON po.opportunity_id = o.id
LEFT JOIN opportunity_scores os ON o.id = os.opportunity_id
WHERE p.is_active = true
ORDER BY ppp.vpanes_pain DESC NULLS LAST, os.weighted_score DESC NULLS LAST;

-- View: JTBD Opportunity Scores (ODI Analysis)
CREATE OR REPLACE VIEW v_jtbd_opportunity_analysis AS
SELECT
  j.unique_id AS jtbd_unique_id,
  j.jtbd_statement,
  j.job_category,
  odi.persona_id,
  p.persona_name,
  p.persona_type AS archetype,
  odi.importance_score,
  odi.satisfaction_score,
  odi.opportunity_score,
  odi.opportunity_classification,
  o.opportunity_name AS linked_opportunity,
  os.weighted_score AS opportunity_weighted_score
FROM ref_jtbds j
LEFT JOIN jtbd_odi_scores odi ON j.id = odi.jtbd_id
LEFT JOIN personas p ON odi.persona_id = p.id
LEFT JOIN jtbd_opportunities jo ON j.id = jo.jtbd_id
LEFT JOIN ref_opportunities o ON jo.opportunity_id = o.id
LEFT JOIN opportunity_scores os ON o.id = os.opportunity_id
ORDER BY odi.opportunity_score DESC NULLS LAST;

-- View: Cross-Functional Pain Points (Shared Across Archetypes)
CREATE OR REPLACE VIEW v_systemic_pain_points AS
SELECT
  pp.unique_id AS pain_point_unique_id,
  pp.pain_point_name,
  pp.pain_category,
  pp.is_systemic,
  COUNT(DISTINCT p.id) AS affected_personas,
  COUNT(DISTINCT p.persona_type) AS affected_archetypes,
  ARRAY_AGG(DISTINCT p.persona_type) AS archetypes,
  ARRAY_AGG(DISTINCT d.name) AS departments,
  AVG(ppp.vpanes_pain) AS avg_pain_score,
  MAX(ppp.severity) AS max_severity,
  COUNT(DISTINCT o.id) AS opportunity_count
FROM ref_pain_points pp
JOIN persona_pain_points ppp ON pp.id = ppp.pain_point_id
JOIN personas p ON ppp.persona_id = p.id
LEFT JOIN org_roles r ON p.source_role_id = r.id
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN pain_point_opportunities po ON pp.id = po.pain_point_id
LEFT JOIN ref_opportunities o ON po.opportunity_id = o.id
GROUP BY pp.id, pp.unique_id, pp.pain_point_name, pp.pain_category, pp.is_systemic
HAVING COUNT(DISTINCT p.persona_type) > 1
ORDER BY affected_archetypes DESC, avg_pain_score DESC;

-- View: Change Readiness Summary by Department
CREATE OR REPLACE VIEW v_change_readiness_summary AS
SELECT
  d.unique_id AS department_unique_id,
  d.name AS department_name,
  f.name AS function_name,
  COUNT(DISTINCT cra.id) AS assessment_count,
  ROUND(AVG(cra.adkar_total), 1) AS avg_adkar_total,
  ROUND(AVG(cra.awareness_score), 1) AS avg_awareness,
  ROUND(AVG(cra.desire_score), 1) AS avg_desire,
  ROUND(AVG(cra.knowledge_score), 1) AS avg_knowledge,
  ROUND(AVG(cra.ability_score), 1) AS avg_ability,
  ROUND(AVG(cra.reinforcement_score), 1) AS avg_reinforcement,
  MODE() WITHIN GROUP (ORDER BY cra.overall_readiness) AS dominant_readiness,
  MODE() WITHIN GROUP (ORDER BY cra.barrier_adkar_stage) AS primary_barrier_stage,
  COUNT(*) FILTER (WHERE cra.overall_readiness = 'low') AS low_readiness_count,
  COUNT(*) FILTER (WHERE cra.overall_readiness = 'very_high') AS high_readiness_count
FROM org_departments d
JOIN org_business_functions f ON d.function_id = f.id
LEFT JOIN change_readiness_assessments cra ON d.id = cra.department_id
WHERE d.is_active = true
GROUP BY d.id, d.unique_id, d.name, f.name;

-- View: AI Maturity Distribution
CREATE OR REPLACE VIEW v_ai_maturity_distribution AS
SELECT
  d.unique_id AS department_unique_id,
  d.name AS department_name,
  f.name AS function_name,
  COUNT(DISTINCT ama.id) AS assessment_count,
  ROUND(AVG(ama.current_maturity_level), 1) AS avg_current_maturity,
  ROUND(AVG(ama.target_maturity_level), 1) AS avg_target_maturity,
  ROUND(AVG(ama.maturity_gap), 1) AS avg_maturity_gap,
  ROUND(AVG(ama.awareness_score), 1) AS avg_awareness,
  ROUND(AVG(ama.capability_score), 1) AS avg_capability,
  ROUND(AVG(ama.adoption_score), 1) AS avg_adoption,
  COUNT(*) FILTER (WHERE ama.current_maturity_level <= 2) AS low_maturity_count,
  COUNT(*) FILTER (WHERE ama.current_maturity_level >= 4) AS high_maturity_count
FROM org_departments d
JOIN org_business_functions f ON d.function_id = f.id
LEFT JOIN ai_maturity_assessments ama ON d.id = ama.department_id
WHERE d.is_active = true
GROUP BY d.id, d.unique_id, d.name, f.name;

-- View: Adoption Funnel by Opportunity
CREATE OR REPLACE VIEW v_adoption_funnel AS
SELECT
  o.unique_id AS opportunity_unique_id,
  o.opportunity_name,
  o.tier AS opportunity_tier,
  os.weighted_score,
  ras.name AS current_stage,
  ras.stage_order,
  COUNT(DISTINCT at.id) AS adopter_count,
  ROUND(AVG(at.satisfaction_score), 1) AS avg_satisfaction,
  ROUND(AVG(at.usage_count), 0) AS avg_usage_count,
  ROUND(AVG(at.churn_risk_score), 1) AS avg_churn_risk
FROM ref_opportunities o
LEFT JOIN opportunity_scores os ON o.id = os.opportunity_id
LEFT JOIN adoption_tracking at ON o.id = at.opportunity_id
LEFT JOIN ref_adoption_stages ras ON at.current_stage_id = ras.id
GROUP BY o.id, o.unique_id, o.opportunity_name, o.tier, os.weighted_score, ras.name, ras.stage_order
ORDER BY os.weighted_score DESC NULLS LAST, ras.stage_order;

-- View: Value Realization Dashboard
CREATE OR REPLACE VIEW v_value_realization AS
SELECT
  o.unique_id AS opportunity_unique_id,
  o.opportunity_name,
  vd.name AS value_driver,
  vd.value_category,
  roi.status AS roi_status,
  roi.implementation_cost,
  roi.expected_annual_benefit,
  roi.roi_percentage AS expected_roi,
  roi.actual_roi_percentage AS actual_roi,
  roi.time_to_value_days,
  bt.baseline_value,
  bt.current_value,
  bt.improvement_percentage,
  im.name AS metric_name,
  im.unit AS metric_unit
FROM ref_opportunities o
LEFT JOIN ref_value_drivers vd ON o.primary_value_driver_id = vd.id
LEFT JOIN opportunity_roi roi ON o.id = roi.opportunity_id
LEFT JOIN benefit_tracking bt ON o.id = bt.opportunity_id
LEFT JOIN ref_impact_metrics im ON bt.impact_metric_id = im.id
ORDER BY roi.expected_annual_benefit DESC NULLS LAST;

-- View: Transformation Initiative Progress
CREATE OR REPLACE VIEW v_initiative_progress AS
SELECT
  ti.unique_id AS initiative_unique_id,
  ti.name AS initiative_name,
  ti.initiative_type,
  ti.status,
  ti.total_budget,
  ti.total_expected_benefit,
  ti.expected_roi_percentage,
  ti.planned_start_date,
  ti.planned_end_date,
  COUNT(DISTINCT io.opportunity_id) AS opportunity_count,
  COUNT(DISTINCT io.opportunity_id) FILTER (WHERE io.status = 'completed') AS completed_opportunities,
  ROUND(
    COUNT(DISTINCT io.opportunity_id) FILTER (WHERE io.status = 'completed') * 100.0 /
    NULLIF(COUNT(DISTINCT io.opportunity_id), 0), 1
  ) AS completion_percentage
FROM transformation_initiatives ti
LEFT JOIN initiative_opportunities io ON ti.id = io.initiative_id
WHERE ti.is_active = true
GROUP BY ti.id, ti.unique_id, ti.name, ti.initiative_type, ti.status,
         ti.total_budget, ti.total_expected_benefit, ti.expected_roi_percentage,
         ti.planned_start_date, ti.planned_end_date;

-- View: Capability Gaps by Role
CREATE OR REPLACE VIEW v_capability_gaps_by_role AS
SELECT
  r.unique_id AS role_unique_id,
  r.name AS role_name,
  d.name AS department_name,
  c.name AS capability_name,
  c.capability_category,
  cga.current_proficiency_level,
  cga.target_proficiency_level,
  cga.gap_score,
  cga.gap_severity,
  cga.estimated_development_months,
  cga.development_priority
FROM org_roles r
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN capability_gap_assessments cga ON r.id = cga.role_id
LEFT JOIN ref_capabilities c ON cga.capability_id = c.id
WHERE r.is_active = true AND cga.gap_score > 0
ORDER BY cga.gap_score DESC;

-- =====================================================================
-- CDC MAPPING CONFIGURATION (Reference for Debezium)
-- =====================================================================

-- This view shows which tables should be synced to Neo4j
CREATE OR REPLACE VIEW cdc_sync_configuration AS
SELECT
  table_name,
  node_label,
  sync_priority,
  relationship_count
FROM (VALUES
  ('l0_therapeutic_areas', 'TherapeuticArea', 1, 3),
  ('l0_diseases', 'Disease', 1, 2),
  ('l0_products', 'Product', 1, 4),
  ('org_business_functions', 'Function', 2, 3),
  ('org_departments', 'Department', 2, 3),
  ('org_roles', 'Role', 2, 4),
  ('personas', 'Persona', 2, 5),
  ('ref_jtbds', 'Job', 3, 3),
  ('ref_processes', 'Process', 3, 2),
  ('workflow_templates', 'WorkflowTemplate', 3, 2),
  ('ref_opportunities', 'Opportunity', 3, 4),
  ('ref_pain_points', 'PainPoint', 3, 3),
  ('ref_capabilities', 'Capability', 4, 2)
) AS t(table_name, node_label, sync_priority, relationship_count)
ORDER BY sync_priority, table_name;

-- =====================================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================================

COMMENT ON VIEW kg_nodes_therapeutic_areas IS 'KG Projection: TherapeuticArea nodes for Neo4j';
COMMENT ON VIEW kg_nodes_products IS 'KG Projection: Product nodes for Neo4j';
COMMENT ON VIEW kg_nodes_personas IS 'KG Projection: Persona nodes for Neo4j';
COMMENT ON VIEW kg_edges_function_department IS 'KG Projection: Function-[CONTAINS]->Department edges';
COMMENT ON VIEW kg_edges_persona_pain IS 'KG Projection: Persona-[HAS_PAIN_POINT]->PainPoint edges';
COMMENT ON VIEW v_persona_opportunity_radar IS 'Analytics: Opportunity radar by persona';
COMMENT ON VIEW v_jtbd_opportunity_analysis IS 'Analytics: ODI-based JTBD opportunity analysis';
COMMENT ON VIEW v_systemic_pain_points IS 'Analytics: Cross-functional systemic pain points';
COMMENT ON VIEW v_change_readiness_summary IS 'Analytics: Change readiness by department';
COMMENT ON VIEW v_value_realization IS 'Analytics: Value realization dashboard';
