-- =====================================================================
-- Migration: 014 - Effective Views and Ontology Summary
-- Created: 2025-12-03
-- Priority: HIGH - Addresses critical gaps identified in ontology audit
-- =====================================================================
-- COLUMN NAME CORRECTIONS based on actual database schema:
-- - personas.source_role_id (not role_id)
-- - org_roles.name (not role_name)
-- - org_functions.name (not department_name)
-- - org_departments.name (not department_name)
-- - personas.derived_archetype, ai_readiness_score, experience_level
-- - jtbd_ai_suitability.intervention_type_name (not ai_intervention_type)
-- =====================================================================

-- =====================================================================
-- 1. v_persona_work_mix VIEW
-- Analyzes how work patterns influence persona archetypes
-- =====================================================================
CREATE OR REPLACE VIEW v_persona_work_mix AS
SELECT
    p.id AS persona_id,
    p.persona_name,
    p.derived_archetype AS archetype,
    p.ai_readiness_score AS ai_maturity_score,
    p.work_complexity_score,
    p.experience_level AS seniority_level,
    r.name AS role_name,
    r.department_id,
    d.name AS department_name,
    f.name AS function_name,
    -- JTBD metrics (via role)
    COUNT(DISTINCT jr.jtbd_id) AS jtbd_count,
    AVG(CASE
        WHEN j.complexity = 'high' THEN 3
        WHEN j.complexity = 'medium' THEN 2
        WHEN j.complexity = 'low' THEN 1
        ELSE 2
    END) AS avg_jtbd_complexity,
    AVG(jas.overall_ai_readiness) AS avg_ai_potential,
    -- Work distribution by category (using actual enum values: operational, strategic, analytical, technical)
    COUNT(DISTINCT CASE WHEN j.job_category = 'operational' THEN j.id END) AS operational_jtbd_count,
    COUNT(DISTINCT CASE WHEN j.job_category = 'strategic' THEN j.id END) AS strategic_jtbd_count,
    COUNT(DISTINCT CASE WHEN j.job_category = 'analytical' THEN j.id END) AS analytical_jtbd_count,
    COUNT(DISTINCT CASE WHEN j.job_category = 'technical' THEN j.id END) AS technical_jtbd_count,
    -- Value alignment
    COUNT(DISTINCT jvc.category_id) AS value_category_coverage,
    -- Archetype classification helpers (using 0-1 scale)
    CASE
        WHEN p.ai_readiness_score >= 0.70 AND p.work_complexity_score >= 0.70 THEN 'ORCHESTRATOR'
        WHEN p.ai_readiness_score >= 0.70 AND p.work_complexity_score < 0.70 THEN 'AUTOMATOR'
        WHEN p.ai_readiness_score < 0.70 AND p.work_complexity_score >= 0.70 THEN 'SKEPTIC'
        ELSE 'LEARNER'
    END AS computed_archetype
FROM personas p
LEFT JOIN org_roles r ON p.source_role_id = r.id
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN org_functions f ON r.function_id = f.id
LEFT JOIN jtbd_roles jr ON r.id = jr.role_id
LEFT JOIN jtbd j ON jr.jtbd_id = j.id
LEFT JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id
LEFT JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id
GROUP BY
    p.id, p.persona_name, p.derived_archetype, p.ai_readiness_score,
    p.work_complexity_score, p.experience_level,
    r.name, r.department_id, d.name, f.name;

COMMENT ON VIEW v_persona_work_mix IS
'Analyzes how work patterns (JTBDs, complexity, AI potential) influence persona archetypes.
Used for persona classification and work distribution analysis.
Key fields: persona_id, archetype, jtbd_count, avg_ai_potential, computed_archetype';

-- =====================================================================
-- 2. v_jtbd_complete VIEW
-- Complete JTBD view with all relationships
-- =====================================================================
CREATE OR REPLACE VIEW v_jtbd_complete AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.job_statement,
    j.job_category,
    j.complexity,
    j.frequency,
    j.strategic_priority,
    j.odi_tier,
    j.importance_score,
    j.satisfaction_score,
    j.opportunity_score,
    -- Function/Department/Role hierarchy via junction tables
    jf.function_id,
    func.name AS function_name,
    jd.department_id,
    dept.name AS department_name,
    jr.role_id,
    jr.role_name,
    jr.relevance_score AS role_relevance,
    -- Value dimensions (using denormalized names from junction tables)
    ARRAY_AGG(DISTINCT jvc.category_name) FILTER (WHERE jvc.category_name IS NOT NULL) AS value_categories,
    ARRAY_AGG(DISTINCT jvd.driver_name) FILTER (WHERE jvd.driver_name IS NOT NULL) AS value_drivers,
    AVG(jvc.relevance_score) AS avg_value_category_relevance,
    AVG(jvd.impact_score) AS avg_value_driver_impact,
    -- AI readiness
    jas.overall_ai_readiness,
    jas.automation_score,
    jas.intervention_type_name AS ai_intervention_type,
    -- Counts
    COUNT(DISTINCT jr.role_id) AS role_count,
    COUNT(DISTINCT jvc.category_id) AS value_category_count,
    COUNT(DISTINCT jvd.driver_id) AS value_driver_count
FROM jtbd j
-- Join to organizational hierarchy via junction tables
LEFT JOIN jtbd_functions jf ON j.id = jf.jtbd_id
LEFT JOIN org_functions func ON jf.function_id = func.id
LEFT JOIN jtbd_departments jd ON j.id = jd.jtbd_id
LEFT JOIN org_departments dept ON jd.department_id = dept.id
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id
-- Join to value layer
LEFT JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id
LEFT JOIN jtbd_value_drivers jvd ON j.id = jvd.jtbd_id
-- Join to AI layer
LEFT JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id
GROUP BY
    j.id, j.code, j.name, j.job_statement, j.job_category,
    j.complexity, j.frequency, j.strategic_priority, j.odi_tier,
    j.importance_score, j.satisfaction_score, j.opportunity_score,
    jf.function_id, func.name,
    jd.department_id, dept.name,
    jr.role_id, jr.role_name, jr.relevance_score,
    jas.overall_ai_readiness, jas.automation_score, jas.intervention_type_name;

COMMENT ON VIEW v_jtbd_complete IS
'Complete JTBD view with all relationships: org hierarchy, value dimensions, and AI readiness.
Use this view for comprehensive JTBD analysis instead of joining multiple tables.
Includes: function, department, role mappings; value categories/drivers; AI suitability scores.';

-- =====================================================================
-- 3. v_ontology_summary VIEW
-- Executive summary for ontology completeness
-- =====================================================================
CREATE OR REPLACE VIEW v_ontology_summary AS
SELECT
    'org_functions' AS entity_type,
    COUNT(*) AS total_count,
    COUNT(*) AS active_count,
    0::bigint AS mapped_count,
    0::bigint AS unmapped_count
FROM org_functions

UNION ALL

SELECT
    'org_departments' AS entity_type,
    COUNT(*) AS total_count,
    COUNT(*) AS active_count,
    COUNT(*) FILTER (WHERE function_id IS NOT NULL) AS mapped_count,
    COUNT(*) FILTER (WHERE function_id IS NULL) AS unmapped_count
FROM org_departments

UNION ALL

SELECT
    'org_roles' AS entity_type,
    COUNT(*) AS total_count,
    COUNT(*) AS active_count,
    COUNT(*) FILTER (WHERE department_id IS NOT NULL) AS mapped_count,
    COUNT(*) FILTER (WHERE department_id IS NULL) AS unmapped_count
FROM org_roles

UNION ALL

SELECT
    'personas' AS entity_type,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE is_active = true) AS active_count,
    COUNT(*) FILTER (WHERE source_role_id IS NOT NULL) AS mapped_count,
    COUNT(*) FILTER (WHERE source_role_id IS NULL) AS unmapped_count
FROM personas

UNION ALL

SELECT
    'jtbd' AS entity_type,
    COUNT(*) AS total_count,
    COUNT(*) AS active_count,
    (SELECT COUNT(DISTINCT jtbd_id) FROM jtbd_functions) AS mapped_count,
    COUNT(*) - (SELECT COUNT(DISTINCT jtbd_id) FROM jtbd_functions) AS unmapped_count
FROM jtbd

UNION ALL

SELECT
    'value_drivers' AS entity_type,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE is_active = true) AS active_count,
    COUNT(*) FILTER (WHERE value_category IS NOT NULL) AS mapped_count,
    COUNT(*) FILTER (WHERE value_category IS NULL) AS unmapped_count
FROM value_drivers;

COMMENT ON VIEW v_ontology_summary IS
'Executive summary of ontology completeness. Shows counts and mapping status for all entity types.
Use for monitoring data quality and identifying unmapped entities.';

-- =====================================================================
-- 4. v_medical_affairs_coverage VIEW
-- Specific view for Medical Affairs analysis
-- =====================================================================
CREATE OR REPLACE VIEW v_medical_affairs_coverage AS
SELECT
    f.id AS function_id,
    f.name AS function_name,
    'Medical Affairs' AS category,
    COUNT(DISTINCT d.id) AS department_count,
    COUNT(DISTINCT r.id) AS role_count,
    COUNT(DISTINCT jr.jtbd_id) AS jtbd_count,
    COUNT(DISTINCT p.id) AS persona_count,
    AVG(jas.overall_ai_readiness) AS avg_ai_potential
FROM org_functions f
LEFT JOIN org_departments d ON f.id = d.function_id
LEFT JOIN org_roles r ON d.id = r.department_id
LEFT JOIN jtbd_roles jr ON r.id = jr.role_id
LEFT JOIN jtbd j ON jr.jtbd_id = j.id
LEFT JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id
LEFT JOIN personas p ON r.id = p.source_role_id
WHERE f.name ILIKE '%medical%affairs%'
   OR f.name ILIKE '%medical%'
GROUP BY f.id, f.name;

COMMENT ON VIEW v_medical_affairs_coverage IS
'Medical Affairs specific coverage analysis. Shows department, role, JTBD, and persona counts.
Use for analyzing MA function completeness and AI adoption potential.';

-- =====================================================================
-- 5. v_jtbd_odi_opportunities VIEW
-- ODI opportunity analysis for prioritization
-- =====================================================================
CREATE OR REPLACE VIEW v_jtbd_odi_opportunities AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.job_category,
    j.complexity,
    j.odi_tier,
    j.importance_score,
    j.satisfaction_score,
    j.opportunity_score,
    -- Calculate ODI opportunity if not provided
    COALESCE(
        j.opportunity_score,
        CASE
            WHEN j.importance_score IS NOT NULL AND j.satisfaction_score IS NOT NULL
            THEN j.importance_score + (j.importance_score - j.satisfaction_score)
            ELSE NULL
        END
    ) AS calculated_odi_score,
    -- Classify tier based on opportunity score
    CASE
        WHEN COALESCE(j.opportunity_score, 0) >= 15 THEN 'extreme'
        WHEN COALESCE(j.opportunity_score, 0) >= 12 THEN 'high'
        WHEN COALESCE(j.opportunity_score, 0) >= 10 THEN 'promising'
        WHEN COALESCE(j.opportunity_score, 0) >= 7 THEN 'moderate'
        ELSE 'low'
    END AS calculated_odi_tier,
    -- AI readiness
    jas.overall_ai_readiness,
    jas.automation_score,
    -- Organizational context
    jr.role_name,
    func.name AS function_name
FROM jtbd j
LEFT JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id AND jr.is_primary = true
LEFT JOIN jtbd_functions jf ON j.id = jf.jtbd_id
LEFT JOIN org_functions func ON jf.function_id = func.id;

COMMENT ON VIEW v_jtbd_odi_opportunities IS
'ODI (Opportunity-Driven Innovation) analysis view. Shows JTBDs with opportunity scores
and AI readiness for prioritizing value delivery. Calculates ODI tier if not provided.';

-- =====================================================================
-- 6. v_value_coverage VIEW
-- Value category and driver coverage analysis
-- =====================================================================
CREATE OR REPLACE VIEW v_value_coverage AS
SELECT
    vc.id AS category_id,
    vc.code AS category_code,
    vc.name AS category_name,
    vc.description AS category_description,
    vc.color AS category_color,
    COUNT(DISTINCT jvc.jtbd_id) AS jtbd_count,
    AVG(jvc.relevance_score) AS avg_relevance,
    COUNT(DISTINCT vd.id) AS driver_count,
    ARRAY_AGG(DISTINCT vd.name) FILTER (WHERE vd.name IS NOT NULL) AS drivers
FROM value_categories vc
LEFT JOIN jtbd_value_categories jvc ON vc.id = jvc.category_id
LEFT JOIN value_drivers vd ON vc.id = vd.primary_category_id
GROUP BY vc.id, vc.code, vc.name, vc.description, vc.color
ORDER BY vc.sort_order;

COMMENT ON VIEW v_value_coverage IS
'Value category and driver coverage analysis. Shows how many JTBDs map to each value category.
Use for identifying value coverage gaps and prioritizing value delivery.';

-- =====================================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================================

-- Ensure indexes exist for common join columns
CREATE INDEX IF NOT EXISTS idx_personas_source_role_id ON personas(source_role_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_department_id ON org_roles(department_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_function_id ON org_roles(function_id);
CREATE INDEX IF NOT EXISTS idx_org_departments_function_id ON org_departments(function_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_functions_jtbd_id ON jtbd_functions(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_functions_function_id ON jtbd_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_jtbd_id ON jtbd_roles(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_role_id ON jtbd_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_value_drivers_jtbd_id ON jtbd_value_drivers(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_value_categories_jtbd_id ON jtbd_value_categories(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_ai_suitability_jtbd_id ON jtbd_ai_suitability(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_value_drivers_category ON value_drivers(primary_category_id);

-- =====================================================================
-- 8. SECURITY: Row Level Security for Views
-- =====================================================================

-- Grant SELECT on views to authenticated users
GRANT SELECT ON v_persona_work_mix TO authenticated;
GRANT SELECT ON v_jtbd_complete TO authenticated;
GRANT SELECT ON v_ontology_summary TO authenticated;
GRANT SELECT ON v_medical_affairs_coverage TO authenticated;
GRANT SELECT ON v_jtbd_odi_opportunities TO authenticated;
GRANT SELECT ON v_value_coverage TO authenticated;

-- Grant SELECT to anon for public access
GRANT SELECT ON v_ontology_summary TO anon;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Created views:
-- 1. v_persona_work_mix - Work pattern analysis for persona archetypes
-- 2. v_jtbd_complete - Complete JTBD view with all relationships
-- 3. v_ontology_summary - Executive summary of ontology completeness
-- 4. v_medical_affairs_coverage - Medical Affairs specific analysis
-- 5. v_jtbd_odi_opportunities - ODI opportunity analysis
-- 6. v_value_coverage - Value category coverage analysis
-- =====================================================================
