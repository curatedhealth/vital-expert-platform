-- =====================================================================
-- DEPLOYMENT SCRIPT: Execute in Supabase SQL Editor
-- Copy and paste this entire script into the Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new
-- =====================================================================

-- DROP existing views first (cannot drop columns with CREATE OR REPLACE)
DROP VIEW IF EXISTS v_persona_work_mix CASCADE;
DROP VIEW IF EXISTS v_jtbd_complete CASCADE;
DROP VIEW IF EXISTS v_ontology_summary CASCADE;
DROP VIEW IF EXISTS v_medical_affairs_coverage CASCADE;
DROP VIEW IF EXISTS v_jtbd_odi_opportunities CASCADE;
DROP VIEW IF EXISTS v_value_coverage CASCADE;

-- 1. v_persona_work_mix VIEW
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
    COUNT(DISTINCT jr.jtbd_id) AS jtbd_count,
    AVG(CASE
        WHEN j.complexity = 'high' THEN 3
        WHEN j.complexity = 'medium' THEN 2
        WHEN j.complexity = 'low' THEN 1
        ELSE 2
    END) AS avg_jtbd_complexity,
    AVG(jas.overall_ai_readiness) AS avg_ai_potential,
    COUNT(DISTINCT CASE WHEN j.job_category = 'operational' THEN j.id END) AS operational_jtbd_count,
    COUNT(DISTINCT CASE WHEN j.job_category = 'strategic' THEN j.id END) AS strategic_jtbd_count,
    COUNT(DISTINCT CASE WHEN j.job_category = 'analytical' THEN j.id END) AS analytical_jtbd_count,
    COUNT(DISTINCT CASE WHEN j.job_category = 'technical' THEN j.id END) AS technical_jtbd_count,
    COUNT(DISTINCT jvc.category_id) AS value_category_coverage,
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

-- 2. v_jtbd_complete VIEW
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
    jf.function_id,
    func.name AS function_name,
    jd.department_id,
    dept.name AS department_name,
    jr.role_id,
    jr.role_name,
    jr.relevance_score AS role_relevance,
    ARRAY_AGG(DISTINCT jvc.category_name) FILTER (WHERE jvc.category_name IS NOT NULL) AS value_categories,
    ARRAY_AGG(DISTINCT jvd.driver_name) FILTER (WHERE jvd.driver_name IS NOT NULL) AS value_drivers,
    AVG(jvc.relevance_score) AS avg_value_category_relevance,
    AVG(jvd.impact_score) AS avg_value_driver_impact,
    jas.overall_ai_readiness,
    jas.automation_score,
    jas.intervention_type_name AS ai_intervention_type,
    COUNT(DISTINCT jr.role_id) AS role_count,
    COUNT(DISTINCT jvc.category_id) AS value_category_count,
    COUNT(DISTINCT jvd.driver_id) AS value_driver_count
FROM jtbd j
LEFT JOIN jtbd_functions jf ON j.id = jf.jtbd_id
LEFT JOIN org_functions func ON jf.function_id = func.id
LEFT JOIN jtbd_departments jd ON j.id = jd.jtbd_id
LEFT JOIN org_departments dept ON jd.department_id = dept.id
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id
LEFT JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id
LEFT JOIN jtbd_value_drivers jvd ON j.id = jvd.jtbd_id
LEFT JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id
GROUP BY
    j.id, j.code, j.name, j.job_statement, j.job_category,
    j.complexity, j.frequency, j.strategic_priority, j.odi_tier,
    j.importance_score, j.satisfaction_score, j.opportunity_score,
    jf.function_id, func.name,
    jd.department_id, dept.name,
    jr.role_id, jr.role_name, jr.relevance_score,
    jas.overall_ai_readiness, jas.automation_score, jas.intervention_type_name;

-- 3. v_ontology_summary VIEW
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

-- 4. v_medical_affairs_coverage VIEW
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

-- 5. v_jtbd_odi_opportunities VIEW
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
    COALESCE(
        j.opportunity_score,
        CASE
            WHEN j.importance_score IS NOT NULL AND j.satisfaction_score IS NOT NULL
            THEN j.importance_score + (j.importance_score - j.satisfaction_score)
            ELSE NULL
        END
    ) AS calculated_odi_score,
    CASE
        WHEN COALESCE(j.opportunity_score, 0) >= 15 THEN 'extreme'
        WHEN COALESCE(j.opportunity_score, 0) >= 12 THEN 'high'
        WHEN COALESCE(j.opportunity_score, 0) >= 10 THEN 'promising'
        WHEN COALESCE(j.opportunity_score, 0) >= 7 THEN 'moderate'
        ELSE 'low'
    END AS calculated_odi_tier,
    jas.overall_ai_readiness,
    jas.automation_score,
    jr.role_name,
    func.name AS function_name
FROM jtbd j
LEFT JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id AND jr.is_primary = true
LEFT JOIN jtbd_functions jf ON j.id = jf.jtbd_id
LEFT JOIN org_functions func ON jf.function_id = func.id;

-- 6. v_value_coverage VIEW
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

-- 7. Performance Indexes
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

-- 8. Grant permissions
GRANT SELECT ON v_persona_work_mix TO authenticated;
GRANT SELECT ON v_jtbd_complete TO authenticated;
GRANT SELECT ON v_ontology_summary TO authenticated;
GRANT SELECT ON v_medical_affairs_coverage TO authenticated;
GRANT SELECT ON v_jtbd_odi_opportunities TO authenticated;
GRANT SELECT ON v_value_coverage TO authenticated;
GRANT SELECT ON v_ontology_summary TO anon;

-- Verify creation
SELECT 'Views created successfully!' as status;
SELECT table_name FROM information_schema.views WHERE table_schema = 'public' AND table_name LIKE 'v_%' ORDER BY table_name;
