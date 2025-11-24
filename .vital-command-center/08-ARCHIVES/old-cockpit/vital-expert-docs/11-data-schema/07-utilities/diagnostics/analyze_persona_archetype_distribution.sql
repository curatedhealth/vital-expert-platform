-- =====================================================================
-- ANALYZE PERSONA ARCHETYPE DISTRIBUTION
-- Purpose: Understand current persona distribution and identify gaps
-- =====================================================================

-- =====================================================================
-- CURRENT ARCHETYPE DISTRIBUTION
-- =====================================================================

SELECT 
    '=== CURRENT ARCHETYPE DISTRIBUTION ===' as section;

SELECT 
    inferred_archetype,
    COUNT(*) as persona_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage,
    ROUND(AVG(work_complexity_score), 1) as avg_work_complexity,
    ROUND(AVG(ai_maturity_score), 1) as avg_ai_maturity,
    ROUND(AVG(confidence_score), 1) as avg_confidence
FROM v_persona_archetype_scores
GROUP BY inferred_archetype
ORDER BY persona_count DESC;

-- =====================================================================
-- DISTRIBUTION BY ROLE
-- =====================================================================

SELECT 
    '=== ARCHETYPE DISTRIBUTION BY ROLE ===' as section;

SELECT 
    r.name as role_name,
    r.id as role_id,
    COUNT(DISTINCT pa.persona_id) as total_personas,
    COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'AUTOMATOR' THEN pa.persona_id END) as automator_count,
    COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'ORCHESTRATOR' THEN pa.persona_id END) as orchestrator_count,
    COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'LEARNER' THEN pa.persona_id END) as learner_count,
    COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'SKEPTIC' THEN pa.persona_id END) as skeptic_count,
    CASE 
        WHEN COUNT(DISTINCT pa.inferred_archetype) = 4 THEN '✅ Complete'
        WHEN COUNT(DISTINCT pa.inferred_archetype) = 3 THEN '⚠️ Missing 1'
        WHEN COUNT(DISTINCT pa.inferred_archetype) = 2 THEN '⚠️ Missing 2'
        WHEN COUNT(DISTINCT pa.inferred_archetype) = 1 THEN '⚠️ Missing 3'
        ELSE '❌ No personas'
    END as status
FROM public.org_roles r
LEFT JOIN v_persona_archetype_scores pa ON pa.role_id = r.id
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name
HAVING COUNT(DISTINCT pa.persona_id) > 0
ORDER BY total_personas DESC, status
LIMIT 50;

-- =====================================================================
-- ROLES NEEDING COMPLETE PERSONA SET (4 per role)
-- =====================================================================

SELECT 
    '=== ROLES NEEDING COMPLETE PERSONA SET ===' as section;

WITH role_archetype_counts AS (
    SELECT 
        r.id as role_id,
        r.name as role_name,
        COUNT(DISTINCT pa.inferred_archetype) as archetype_count,
        COUNT(DISTINCT pa.persona_id) as total_personas,
        STRING_AGG(DISTINCT pa.inferred_archetype, ', ' ORDER BY pa.inferred_archetype) as existing_archetypes,
        CASE 
            WHEN COUNT(DISTINCT pa.inferred_archetype) < 4 THEN 'INCOMPLETE'
            ELSE 'COMPLETE'
        END as status
    FROM public.org_roles r
    LEFT JOIN v_persona_archetype_scores pa ON pa.role_id = r.id
    WHERE r.deleted_at IS NULL
    GROUP BY r.id, r.name
    HAVING COUNT(DISTINCT pa.persona_id) > 0
)

SELECT 
    role_name,
    total_personas,
    archetype_count,
    existing_archetypes,
    status,
    CASE 
        WHEN existing_archetypes NOT LIKE '%AUTOMATOR%' THEN 'Missing AUTOMATOR'
        WHEN existing_archetypes NOT LIKE '%ORCHESTRATOR%' THEN 'Missing ORCHESTRATOR'
        WHEN existing_archetypes NOT LIKE '%LEARNER%' THEN 'Missing LEARNER'
        WHEN existing_archetypes NOT LIKE '%SKEPTIC%' THEN 'Missing SKEPTIC'
        ELSE 'Complete'
    END as missing_archetypes
FROM role_archetype_counts
WHERE status = 'INCOMPLETE'
ORDER BY total_personas DESC, archetype_count ASC
LIMIT 50;

-- =====================================================================
-- SUMMARY STATISTICS
-- =====================================================================

SELECT 
    '=== SUMMARY STATISTICS ===' as section;

SELECT 
    (SELECT COUNT(DISTINCT role_id) FROM v_persona_archetype_scores) as roles_with_personas,
    (SELECT COUNT(DISTINCT role_id) FROM public.org_roles WHERE deleted_at IS NULL) as total_roles,
    (SELECT COUNT(*) FROM v_persona_archetype_scores) as total_personas,
    (SELECT COUNT(DISTINCT inferred_archetype) FROM v_persona_archetype_scores) as unique_archetypes,
    (SELECT COUNT(DISTINCT role_id) 
     FROM (
         SELECT role_id, COUNT(DISTINCT inferred_archetype) as arch_count
         FROM v_persona_archetype_scores
         GROUP BY role_id
         HAVING COUNT(DISTINCT inferred_archetype) = 4
     ) complete_roles
    ) as roles_with_4_archetypes,
    (SELECT COUNT(DISTINCT role_id) 
     FROM (
         SELECT role_id, COUNT(DISTINCT inferred_archetype) as arch_count
         FROM v_persona_archetype_scores
         GROUP BY role_id
         HAVING COUNT(DISTINCT inferred_archetype) < 4
     ) incomplete_roles
    ) as roles_needing_more_personas;

