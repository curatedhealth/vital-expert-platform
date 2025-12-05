-- =====================================================================
-- DEPLOYMENT SCRIPT: Effective Views for Ontology
-- Execute in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new
-- Created: 2025-12-03
-- =====================================================================

-- DROP existing views first
DROP VIEW IF EXISTS v_effective_jtbd_hierarchy CASCADE;
DROP VIEW IF EXISTS v_effective_jtbd_value CASCADE;
DROP VIEW IF EXISTS v_effective_jtbd_ai CASCADE;
DROP VIEW IF EXISTS v_effective_value_driver_hierarchy CASCADE;
DROP VIEW IF EXISTS v_effective_value_impact CASCADE;
DROP VIEW IF EXISTS v_effective_jtbd_value_matrix CASCADE;
DROP VIEW IF EXISTS v_effective_workflow_complete CASCADE;
DROP VIEW IF EXISTS v_effective_workflow_jtbd CASCADE;
DROP VIEW IF EXISTS v_effective_role_jtbd CASCADE;
DROP VIEW IF EXISTS v_effective_org_hierarchy CASCADE;
DROP VIEW IF EXISTS v_effective_ai_opportunity CASCADE;

-- =====================================================================
-- SECTION 1: EFFECTIVE JTBD VIEWS
-- =====================================================================

-- 1.1 v_effective_jtbd_hierarchy
-- Complete JTBD with full organizational hierarchy
CREATE OR REPLACE VIEW v_effective_jtbd_hierarchy AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.job_statement,
    j.job_category,
    j.complexity,
    j.frequency,
    j.status,
    j.jtbd_type,
    j.work_pattern,
    j.strategic_priority,
    j.impact_level,
    j.compliance_sensitivity,
    j.recommended_service_layer,
    -- Organizational hierarchy
    jf.function_id,
    jf.function_name,
    jd.department_id,
    jd.department_name,
    jr.role_id,
    jr.role_name,
    jr.relevance_score AS role_relevance,
    jr.is_primary AS is_primary_role,
    -- ODI metrics
    j.importance_score,
    j.satisfaction_score,
    j.opportunity_score,
    j.odi_tier,
    -- Counts
    (SELECT COUNT(*) FROM jtbd_roles WHERE jtbd_id = j.id) AS role_count,
    (SELECT COUNT(*) FROM jtbd_functions WHERE jtbd_id = j.id) AS function_count,
    (SELECT COUNT(*) FROM jtbd_value_categories WHERE jtbd_id = j.id) AS value_category_count,
    (SELECT COUNT(*) FROM jtbd_value_drivers WHERE jtbd_id = j.id) AS value_driver_count
FROM jtbd j
LEFT JOIN jtbd_functions jf ON j.id = jf.jtbd_id
LEFT JOIN jtbd_departments jd ON j.id = jd.jtbd_id
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id;

COMMENT ON VIEW v_effective_jtbd_hierarchy IS
'Complete JTBD view with full organizational hierarchy (Function → Department → Role).
Includes ODI metrics and relationship counts. Use for JTBD analysis with org context.';

-- 1.2 v_effective_jtbd_value
-- JTBD with all value dimensions (categories and drivers)
CREATE OR REPLACE VIEW v_effective_jtbd_value AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.job_category,
    j.complexity,
    j.impact_level,
    -- Value categories (aggregated)
    ARRAY_AGG(DISTINCT jvc.category_name) FILTER (WHERE jvc.category_name IS NOT NULL) AS value_categories,
    AVG(jvc.relevance_score) AS avg_category_relevance,
    -- Value drivers (aggregated)
    ARRAY_AGG(DISTINCT jvd.driver_name) FILTER (WHERE jvd.driver_name IS NOT NULL) AS value_drivers,
    AVG(jvd.impact_strength) AS avg_driver_impact,
    -- Quantified value
    SUM(jvd.quantified_value) AS total_quantified_value,
    -- Confidence
    MODE() WITHIN GROUP (ORDER BY jvd.confidence_level) AS dominant_confidence,
    -- ODI
    j.opportunity_score,
    j.odi_tier,
    -- Counts
    COUNT(DISTINCT jvc.category_id) AS category_count,
    COUNT(DISTINCT jvd.driver_id) AS driver_count
FROM jtbd j
LEFT JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id
LEFT JOIN jtbd_value_drivers jvd ON j.id = jvd.jtbd_id
GROUP BY j.id, j.code, j.name, j.job_category, j.complexity, j.impact_level, j.opportunity_score, j.odi_tier;

COMMENT ON VIEW v_effective_jtbd_value IS
'JTBD with aggregated value dimensions (categories and drivers).
Use for value analysis and impact assessment.';

-- 1.3 v_effective_jtbd_ai
-- JTBD with AI suitability and readiness
CREATE OR REPLACE VIEW v_effective_jtbd_ai AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.job_category,
    j.complexity,
    j.recommended_service_layer,
    -- AI Suitability scores
    jas.overall_ai_readiness,
    jas.overall_score,
    jas.automation_score,
    jas.intervention_type_name AS ai_intervention_type,
    jas.confidence_level AS ai_confidence,
    -- Capability scores (actual column names)
    jas.rag_score,
    jas.summary_score,
    jas.generation_score,
    jas.classification_score,
    jas.reasoning_score,
    -- Rationale
    jas.rationale AS ai_rationale,
    jas.limitations AS ai_limitations,
    -- Value context
    j.impact_level,
    j.opportunity_score,
    j.odi_tier,
    -- Calculated AI opportunity score
    CASE
        WHEN jas.overall_ai_readiness IS NOT NULL AND j.opportunity_score IS NOT NULL
        THEN (jas.overall_ai_readiness * 0.4 + (j.opportunity_score / 20.0) * 0.6) * 100
        ELSE NULL
    END AS calculated_ai_opportunity
FROM jtbd j
LEFT JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id;

COMMENT ON VIEW v_effective_jtbd_ai IS
'JTBD with AI suitability metrics and calculated opportunity scores.
Use for AI prioritization and automation planning.';

-- =====================================================================
-- SECTION 2: EFFECTIVE VALUE DRIVER VIEWS
-- =====================================================================

-- 2.1 v_effective_value_driver_hierarchy
-- Value drivers with parent/child hierarchy and category
CREATE OR REPLACE VIEW v_effective_value_driver_hierarchy AS
WITH RECURSIVE driver_tree AS (
    -- Base case: root drivers (no parent)
    SELECT
        vd.id,
        vd.code,
        vd.name,
        vd.driver_type,
        vd.description,
        vd.parent_id,
        vd.level,
        vd.value_category,
        vd.is_active,
        vd.is_quantifiable,
        vc.name AS category_name,
        vc.color AS category_color,
        1 AS depth,
        vd.name::text AS hierarchy_path,
        ARRAY[vd.id] AS path_ids
    FROM value_drivers vd
    LEFT JOIN value_categories vc ON vd.primary_category_id = vc.id
    WHERE vd.parent_id IS NULL

    UNION ALL

    -- Recursive case: child drivers
    SELECT
        vd.id,
        vd.code,
        vd.name,
        vd.driver_type,
        vd.description,
        vd.parent_id,
        vd.level,
        vd.value_category,
        vd.is_active,
        vd.is_quantifiable,
        vc.name AS category_name,
        vc.color AS category_color,
        dt.depth + 1,
        dt.hierarchy_path || ' > ' || vd.name,
        dt.path_ids || vd.id
    FROM value_drivers vd
    JOIN driver_tree dt ON vd.parent_id = dt.id
    LEFT JOIN value_categories vc ON vd.primary_category_id = vc.id
)
SELECT
    dt.*,
    (SELECT COUNT(*) FROM value_drivers WHERE parent_id = dt.id) AS child_count,
    (SELECT COUNT(DISTINCT jtbd_id) FROM jtbd_value_drivers WHERE driver_id = dt.id) AS jtbd_count
FROM driver_tree dt
ORDER BY dt.hierarchy_path;

COMMENT ON VIEW v_effective_value_driver_hierarchy IS
'Value drivers with recursive parent/child hierarchy.
Includes depth, path, and usage counts. Use for value taxonomy navigation.';

-- 2.2 v_effective_value_impact
-- Value drivers with impact metrics across JTBDs
CREATE OR REPLACE VIEW v_effective_value_impact AS
SELECT
    vd.id AS driver_id,
    vd.code AS driver_code,
    vd.name AS driver_name,
    vd.driver_type,
    vd.value_category,
    vd.is_quantifiable,
    -- JTBD impact aggregations
    COUNT(DISTINCT jvd.jtbd_id) AS jtbd_count,
    AVG(jvd.impact_strength) AS avg_impact_strength,
    MAX(jvd.impact_strength) AS max_impact_strength,
    SUM(jvd.quantified_value) AS total_quantified_value,
    -- Confidence distribution
    COUNT(*) FILTER (WHERE jvd.confidence_level = 'high') AS high_confidence_count,
    COUNT(*) FILTER (WHERE jvd.confidence_level = 'medium') AS medium_confidence_count,
    COUNT(*) FILTER (WHERE jvd.confidence_level = 'low') AS low_confidence_count,
    -- Contribution types
    COUNT(*) FILTER (WHERE jvd.contribution_type = 'direct') AS direct_contribution_count,
    COUNT(*) FILTER (WHERE jvd.contribution_type = 'indirect') AS indirect_contribution_count,
    -- Category info
    vc.name AS category_name,
    vc.color AS category_color
FROM value_drivers vd
LEFT JOIN jtbd_value_drivers jvd ON vd.id = jvd.driver_id
LEFT JOIN value_categories vc ON vd.primary_category_id = vc.id
WHERE vd.is_active = true
GROUP BY vd.id, vd.code, vd.name, vd.driver_type, vd.value_category, vd.is_quantifiable,
         vc.name, vc.color;

COMMENT ON VIEW v_effective_value_impact IS
'Value drivers with aggregated impact metrics across all JTBDs.
Use for identifying high-impact value drivers and confidence analysis.';

-- 2.3 v_effective_jtbd_value_matrix
-- Cross-tabulation view for JTBD x Value Category analysis
CREATE OR REPLACE VIEW v_effective_jtbd_value_matrix AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.functional_area,
    j.job_category,
    -- Value category coverage (using category names as columns)
    MAX(CASE WHEN vc.code = 'SMARTER' THEN jvc.relevance_score END) AS smarter_score,
    MAX(CASE WHEN vc.code = 'FASTER' THEN jvc.relevance_score END) AS faster_score,
    MAX(CASE WHEN vc.code = 'BETTER' THEN jvc.relevance_score END) AS better_score,
    MAX(CASE WHEN vc.code = 'EFFICIENT' THEN jvc.relevance_score END) AS efficient_score,
    MAX(CASE WHEN vc.code = 'SAFER' THEN jvc.relevance_score END) AS safer_score,
    MAX(CASE WHEN vc.code = 'SCALABLE' THEN jvc.relevance_score END) AS scalable_score,
    -- Total coverage
    COUNT(DISTINCT jvc.category_id) AS categories_covered,
    AVG(jvc.relevance_score) AS avg_relevance,
    -- ODI context
    j.opportunity_score,
    j.odi_tier
FROM jtbd j
LEFT JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id
LEFT JOIN value_categories vc ON jvc.category_id = vc.id
GROUP BY j.id, j.code, j.name, j.functional_area, j.job_category, j.opportunity_score, j.odi_tier;

COMMENT ON VIEW v_effective_jtbd_value_matrix IS
'Cross-tabulation of JTBD x Value Categories with relevance scores.
Use for heatmap visualization and value coverage analysis.';

-- =====================================================================
-- SECTION 3: EFFECTIVE WORKFLOW VIEWS
-- =====================================================================

-- 3.1 v_effective_workflow_complete
-- Workflows with all stages and task counts
CREATE OR REPLACE VIEW v_effective_workflow_complete AS
SELECT
    wt.id AS workflow_id,
    wt.code AS workflow_code,
    wt.name AS workflow_name,
    wt.description,
    wt.workflow_type,
    wt.work_mode,
    wt.complexity_level,
    wt.status,
    wt.version,
    wt.estimated_duration_hours,
    -- JTBD link
    wt.jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    -- Stage aggregations
    COUNT(DISTINCT ws.id) AS stage_count,
    ARRAY_AGG(ws.stage_name ORDER BY ws.stage_number) FILTER (WHERE ws.stage_name IS NOT NULL) AS stage_names,
    SUM(ws.estimated_duration_hours) AS total_stage_hours,
    -- Task aggregations
    (SELECT COUNT(*) FROM workflow_tasks wta JOIN workflow_stages wsa ON wta.stage_id = wsa.id WHERE wsa.template_id = wt.id) AS total_task_count,
    -- Timestamps
    wt.created_at,
    wt.updated_at
FROM workflow_templates wt
LEFT JOIN jtbd j ON wt.jtbd_id = j.id
LEFT JOIN workflow_stages ws ON wt.id = ws.template_id
GROUP BY wt.id, wt.code, wt.name, wt.description, wt.workflow_type, wt.work_mode,
         wt.complexity_level, wt.status, wt.version, wt.estimated_duration_hours,
         wt.jtbd_id, j.code, j.name, wt.created_at, wt.updated_at;

COMMENT ON VIEW v_effective_workflow_complete IS
'Complete workflow view with stage and task aggregations.
Use for workflow overview and complexity analysis.';

-- 3.2 v_effective_workflow_jtbd
-- Workflows with linked JTBDs and value context
CREATE OR REPLACE VIEW v_effective_workflow_jtbd AS
SELECT
    wt.id AS workflow_id,
    wt.code AS workflow_code,
    wt.name AS workflow_name,
    wt.workflow_type,
    wt.complexity_level,
    wt.status,
    -- JTBD context
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.job_category,
    j.complexity AS jtbd_complexity,
    j.opportunity_score,
    j.odi_tier,
    -- AI context
    jas.overall_ai_readiness,
    jas.intervention_type_name AS ai_intervention,
    -- Value context
    (SELECT COUNT(DISTINCT category_id) FROM jtbd_value_categories WHERE jtbd_id = j.id) AS value_category_count,
    (SELECT AVG(impact_strength) FROM jtbd_value_drivers WHERE jtbd_id = j.id) AS avg_value_impact
FROM workflow_templates wt
JOIN jtbd j ON wt.jtbd_id = j.id
LEFT JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id
WHERE wt.jtbd_id IS NOT NULL;

COMMENT ON VIEW v_effective_workflow_jtbd IS
'Workflows linked to JTBDs with value and AI context.
Use for workflow-JTBD alignment and automation opportunity analysis.';

-- =====================================================================
-- SECTION 4: ADDITIONAL EFFECTIVE VIEWS
-- =====================================================================

-- 4.1 v_effective_role_jtbd
-- Roles with their associated JTBDs
CREATE OR REPLACE VIEW v_effective_role_jtbd AS
SELECT
    r.id AS role_id,
    r.job_code AS role_code,
    r.name AS role_name,
    r.department_id,
    d.name AS department_name,
    r.function_id,
    f.name AS function_name,
    -- JTBD aggregations
    COUNT(DISTINCT jr.jtbd_id) AS jtbd_count,
    ARRAY_AGG(DISTINCT j.name ORDER BY j.name) FILTER (WHERE j.name IS NOT NULL) AS jtbd_names,
    AVG(j.opportunity_score) AS avg_opportunity_score,
    -- Complexity distribution
    COUNT(*) FILTER (WHERE j.complexity = 'high') AS high_complexity_count,
    COUNT(*) FILTER (WHERE j.complexity = 'medium') AS medium_complexity_count,
    COUNT(*) FILTER (WHERE j.complexity = 'low') AS low_complexity_count,
    -- Category distribution
    COUNT(*) FILTER (WHERE j.job_category = 'operational') AS operational_count,
    COUNT(*) FILTER (WHERE j.job_category = 'strategic') AS strategic_count,
    COUNT(*) FILTER (WHERE j.job_category = 'analytical') AS analytical_count,
    COUNT(*) FILTER (WHERE j.job_category = 'technical') AS technical_count,
    -- AI readiness
    AVG(jas.overall_ai_readiness) AS avg_ai_readiness
FROM org_roles r
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN org_functions f ON r.function_id = f.id
LEFT JOIN jtbd_roles jr ON r.id = jr.role_id
LEFT JOIN jtbd j ON jr.jtbd_id = j.id
LEFT JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id
GROUP BY r.id, r.job_code, r.name, r.department_id, d.name, r.function_id, f.name;

COMMENT ON VIEW v_effective_role_jtbd IS
'Roles with aggregated JTBD metrics including complexity, category, and AI readiness.
Use for role workload analysis and automation potential.';

-- 4.2 v_effective_org_hierarchy
-- Full organizational hierarchy (Function → Department → Role → Persona)
CREATE OR REPLACE VIEW v_effective_org_hierarchy AS
SELECT
    f.id AS function_id,
    f.name AS function_name,
    d.id AS department_id,
    d.name AS department_name,
    r.id AS role_id,
    r.job_code AS role_code,
    r.name AS role_name,
    p.id AS persona_id,
    p.persona_name,
    p.derived_archetype AS archetype,
    p.ai_readiness_score,
    p.work_complexity_score,
    p.experience_level,
    -- Counts at each level
    (SELECT COUNT(*) FROM org_departments WHERE function_id = f.id) AS departments_in_function,
    (SELECT COUNT(*) FROM org_roles WHERE department_id = d.id) AS roles_in_department,
    (SELECT COUNT(*) FROM personas WHERE source_role_id = r.id) AS personas_for_role,
    -- JTBD counts
    (SELECT COUNT(DISTINCT jtbd_id) FROM jtbd_functions WHERE function_id = f.id) AS function_jtbd_count,
    (SELECT COUNT(DISTINCT jtbd_id) FROM jtbd_departments WHERE department_id = d.id) AS department_jtbd_count,
    (SELECT COUNT(DISTINCT jtbd_id) FROM jtbd_roles WHERE role_id = r.id) AS role_jtbd_count
FROM org_functions f
LEFT JOIN org_departments d ON f.id = d.function_id
LEFT JOIN org_roles r ON d.id = r.department_id
LEFT JOIN personas p ON r.id = p.source_role_id;

COMMENT ON VIEW v_effective_org_hierarchy IS
'Complete organizational hierarchy from Function to Persona.
Includes relationship counts and JTBD mappings at each level.';

-- 4.3 v_effective_ai_opportunity
-- AI opportunities with full context
CREATE OR REPLACE VIEW v_effective_ai_opportunity AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.job_category,
    j.complexity,
    j.impact_level,
    -- ODI metrics
    j.importance_score,
    j.satisfaction_score,
    j.opportunity_score,
    j.odi_tier,
    -- AI suitability (actual columns)
    jas.overall_ai_readiness,
    jas.overall_score,
    jas.automation_score,
    jas.intervention_type_name AS recommended_intervention,
    jas.confidence_level AS ai_confidence,
    jas.rationale AS ai_rationale,
    -- Calculated priority score
    CASE
        WHEN j.opportunity_score IS NOT NULL AND jas.overall_ai_readiness IS NOT NULL
        THEN ROUND(
            (j.opportunity_score / 20.0 * 50) +
            (jas.overall_ai_readiness * 30) +
            (CASE j.impact_level WHEN 'high' THEN 20 WHEN 'medium' THEN 10 ELSE 0 END)
        , 2)
        ELSE NULL
    END AS priority_score,
    -- Organizational context
    jf.function_name,
    jd.department_name,
    jr.role_name,
    -- Value impact
    (SELECT SUM(impact_strength) FROM jtbd_value_drivers WHERE jtbd_id = j.id) AS total_value_impact,
    (SELECT COUNT(*) FROM jtbd_value_drivers WHERE jtbd_id = j.id AND confidence_level = 'high') AS high_confidence_impacts
FROM jtbd j
LEFT JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id
LEFT JOIN jtbd_functions jf ON j.id = jf.jtbd_id
LEFT JOIN jtbd_departments jd ON j.id = jd.jtbd_id
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id AND jr.is_primary = true
WHERE jas.overall_ai_readiness IS NOT NULL
ORDER BY priority_score DESC NULLS LAST;

COMMENT ON VIEW v_effective_ai_opportunity IS
'AI opportunities ranked by calculated priority score.
Combines ODI metrics, AI readiness, and value impact for prioritization.';

-- =====================================================================
-- SECTION 5: INDEXES FOR PERFORMANCE
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_jtbd_functions_function_id ON jtbd_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_departments_department_id ON jtbd_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_role_id ON jtbd_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_value_drivers_driver_id ON jtbd_value_drivers(driver_id);
CREATE INDEX IF NOT EXISTS idx_value_drivers_parent_id ON value_drivers(parent_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_template_id ON workflow_stages(template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_stage_id ON workflow_tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_function_id ON org_roles(function_id);

-- =====================================================================
-- SECTION 6: PERMISSIONS
-- =====================================================================

GRANT SELECT ON v_effective_jtbd_hierarchy TO authenticated;
GRANT SELECT ON v_effective_jtbd_value TO authenticated;
GRANT SELECT ON v_effective_jtbd_ai TO authenticated;
GRANT SELECT ON v_effective_value_driver_hierarchy TO authenticated;
GRANT SELECT ON v_effective_value_impact TO authenticated;
GRANT SELECT ON v_effective_jtbd_value_matrix TO authenticated;
GRANT SELECT ON v_effective_workflow_complete TO authenticated;
GRANT SELECT ON v_effective_workflow_jtbd TO authenticated;
GRANT SELECT ON v_effective_role_jtbd TO authenticated;
GRANT SELECT ON v_effective_org_hierarchy TO authenticated;
GRANT SELECT ON v_effective_ai_opportunity TO authenticated;

-- Grant anon access to summary views
GRANT SELECT ON v_effective_org_hierarchy TO anon;
GRANT SELECT ON v_effective_ai_opportunity TO anon;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 'Effective views created successfully!' as status;
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'v_effective_%'
ORDER BY table_name;
