-- =====================================================================
-- CREATE 4 MECE PERSONAS PER ROLE
-- MECE Framework: Mutually Exclusive, Collectively Exhaustive
-- Based on: AI Maturity × Work Complexity (2×2 Matrix)
-- =====================================================================

-- =====================================================================
-- MECE FRAMEWORK DEFINITION
-- =====================================================================

/*
MECE Framework for 4 Personas Per Role:

Matrix: AI Maturity (High/Low) × Work Complexity (Routine/Strategic)

1. AUTOMATOR    - High AI Maturity + Routine Work
2. ORCHESTRATOR - High AI Maturity + Strategic Work  
3. LEARNER      - Low AI Maturity + Routine Work
4. SKEPTIC      - Low AI Maturity + Strategic Work

Each persona is:
- Mutually Exclusive: No overlap in attributes
- Collectively Exhaustive: Covers all combinations

Secondary Differentiators (to ensure distinctiveness):
- Geographic Scope: Global vs Regional/Local
- Organization Size: Large Pharma vs Emerging/Specialty
- Seniority: Mid-level vs Senior/Director
- Experience: Early (3-7 yrs) vs Experienced (8+ yrs)
*/

-- =====================================================================
-- STEP 1: IDENTIFY ROLES AND EXISTING PERSONAS
-- =====================================================================

SELECT 
    '=== ROLES NEEDING PERSONAS ===' as section;

WITH role_persona_analysis AS (
    SELECT 
        r.id as role_id,
        r.name as role_name,
        r.tenant_id,
        r.function_id,
        r.department_id,
        COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'AUTOMATOR' THEN pa.persona_id END) as automator_count,
        COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'ORCHESTRATOR' THEN pa.persona_id END) as orchestrator_count,
        COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'LEARNER' THEN pa.persona_id END) as learner_count,
        COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'SKEPTIC' THEN pa.persona_id END) as skeptic_count,
        COUNT(DISTINCT pa.persona_id) as total_personas
    FROM public.org_roles r
    LEFT JOIN v_persona_archetype_scores pa ON pa.role_id = r.id
    WHERE r.deleted_at IS NULL
      AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
    GROUP BY r.id, r.name, r.tenant_id, r.function_id, r.department_id
)
SELECT 
    role_name,
    total_personas,
    automator_count,
    orchestrator_count,
    learner_count,
    skeptic_count,
    CASE 
        WHEN automator_count = 0 AND orchestrator_count = 0 AND learner_count = 0 AND skeptic_count = 0 THEN '❌ No personas'
        WHEN automator_count > 0 AND orchestrator_count > 0 AND learner_count > 0 AND skeptic_count > 0 THEN '✅ Complete (4 personas)'
        ELSE '⚠️ Incomplete'
    END as status
FROM role_persona_analysis
ORDER BY total_personas DESC, role_name
LIMIT 50;

-- =====================================================================
-- STEP 2: TEMPLATE FOR CREATING 4 MECE PERSONAS
-- =====================================================================

SELECT 
    '=== MECE PERSONA TEMPLATE PER ROLE ===' as section;

/*
For each role, create 4 personas with these distinct attributes:

┌─────────────────────────────────────────────────────────────────────┐
│ PERSONA 1: AUTOMATOR                                                │
│ AI Maturity: HIGH | Work Complexity: ROUTINE                        │
├─────────────────────────────────────────────────────────────────────┤
│ technology_adoption: 'early_adopter'                                │
│ risk_tolerance: 'moderate'                                          │
│ change_readiness: 'high'                                            │
│ work_pattern: 'routine'                                             │
│ work_complexity_score: 30-40 (routine)                              │
│ ai_maturity_score: 70-80 (high)                                     │
│ seniority_level: 'mid' to 'senior'                                   │
│ years_of_experience: 5-10                                           │
│ geographic_scope: 'global' or 'regional'                            │
│ typical_org_size: 'Large Pharma'                                    │
│ preferred_service_layer: 'WORKFLOWS'                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PERSONA 2: ORCHESTRATOR                                             │
│ AI Maturity: HIGH | Work Complexity: STRATEGIC                      │
├─────────────────────────────────────────────────────────────────────┤
│ technology_adoption: 'early_adopter' or 'innovator'                 │
│ risk_tolerance: 'moderate'                                          │
│ change_readiness: 'high'                                            │
│ work_pattern: 'strategic'                                            │
│ work_complexity_score: 60-80 (strategic)                            │
│ ai_maturity_score: 70-85 (high)                                      │
│ seniority_level: 'senior' to 'director' to 'executive'              │
│ years_of_experience: 10-20                                          │
│ geographic_scope: 'global'                                           │
│ typical_org_size: 'Large Pharma' or 'Emerging Biopharma'            │
│ preferred_service_layer: 'ASK_PANEL'                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PERSONA 3: LEARNER                                                  │
│ AI Maturity: LOW | Work Complexity: ROUTINE                         │
├─────────────────────────────────────────────────────────────────────┤
│ technology_adoption: 'early_majority' or 'late_majority'            │
│ risk_tolerance: 'conservative'                                       │
│ change_readiness: 'moderate'                                        │
│ work_pattern: 'routine'                                             │
│ work_complexity_score: 20-40 (routine)                              │
│ ai_maturity_score: 30-45 (low)                                       │
│ seniority_level: 'entry' to 'mid'                                    │
│ years_of_experience: 3-7                                             │
│ geographic_scope: 'local' or 'country'                              │
│ typical_org_size: 'Mid-Size Pharma' or 'Specialty Pharma'           │
│ preferred_service_layer: 'ASK_EXPERT'                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PERSONA 4: SKEPTIC                                                  │
│ AI Maturity: LOW | Work Complexity: STRATEGIC                       │
├─────────────────────────────────────────────────────────────────────┤
│ technology_adoption: 'late_majority' or 'laggard'                   │
│ risk_tolerance: 'very_conservative' or 'conservative'                │
│ change_readiness: 'low'                                             │
│ work_pattern: 'strategic'                                           │
│ work_complexity_score: 60-80 (strategic)                            │
│ ai_maturity_score: 25-45 (low)                                       │
│ seniority_level: 'senior' to 'director' to 'executive'              │
│ years_of_experience: 15-25                                           │
│ geographic_scope: 'global' or 'regional'                             │
│ typical_org_size: 'Large Pharma' (established)                      │
│ preferred_service_layer: 'ASK_PANEL' (with HITL)                    │
└─────────────────────────────────────────────────────────────────────┘
*/

-- =====================================================================
-- STEP 3: GENERATE SQL FOR CREATING MISSING PERSONAS
-- =====================================================================

-- This generates INSERT statements for missing personas
-- Run this to see what would be created, then execute manually

SELECT 
    '=== GENERATED SQL FOR MISSING PERSONAS ===' as section;

-- Note: This query generates SQL statements. Copy and execute them separately.
WITH role_missing_archetypes AS (
    SELECT 
        r.id as role_id,
        r.name as role_name,
        r.tenant_id,
        r.function_id,
        r.department_id,
        CASE WHEN COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'AUTOMATOR' THEN pa.persona_id END) = 0 THEN 'AUTOMATOR' END as missing_automator,
        CASE WHEN COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'ORCHESTRATOR' THEN pa.persona_id END) = 0 THEN 'ORCHESTRATOR' END as missing_orchestrator,
        CASE WHEN COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'LEARNER' THEN pa.persona_id END) = 0 THEN 'LEARNER' END as missing_learner,
        CASE WHEN COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'SKEPTIC' THEN pa.persona_id END) = 0 THEN 'SKEPTIC' END as missing_skeptic,
        (SELECT name FROM public.personas WHERE role_id = r.id AND deleted_at IS NULL LIMIT 1) as base_persona_name,
        (SELECT slug FROM public.personas WHERE role_id = r.id AND deleted_at IS NULL LIMIT 1) as base_persona_slug
    FROM public.org_roles r
    LEFT JOIN v_persona_archetype_scores pa ON pa.role_id = r.id
    WHERE r.deleted_at IS NULL
      AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
    GROUP BY r.id, r.name, r.tenant_id, r.function_id, r.department_id
    HAVING COUNT(DISTINCT pa.persona_id) > 0  -- Only roles with existing personas
)

SELECT 
    '-- Role: ' || role_name || E'\n' ||
    CASE 
        WHEN missing_automator IS NOT NULL THEN
            'INSERT INTO public.personas (name, title, slug, tenant_id, role_id, function_id, department_id, ' ||
            'archetype, seniority_level, years_of_experience, technology_adoption, risk_tolerance, change_readiness, ' ||
            'work_pattern, work_complexity_score, ai_maturity_score, typical_org_size, geographic_scope, is_active) VALUES ' ||
            '(''' || base_persona_name || ' (Automator)'', ''' || role_name || ' - Automator'', ''' || base_persona_slug || '-automator'', ' ||
            '''' || role_id || '''::uuid, ''' || role_id || '''::uuid, ''' || function_id || '''::uuid, ''' || department_id || '''::uuid, ' ||
            '''AUTOMATOR''::archetype_type, ''mid''::seniority_level, 7, ''early_adopter''::technology_adoption, ' ||
            '''moderate''::risk_tolerance, ''high''::change_readiness, ''routine''::work_pattern, 35, 75, ' ||
            '''Large Pharma'', ''global''::geographic_scope, TRUE);' || E'\n'
        ELSE ''
    END ||
    CASE 
        WHEN missing_orchestrator IS NOT NULL THEN
            'INSERT INTO public.personas (name, title, slug, tenant_id, role_id, function_id, department_id, ' ||
            'archetype, seniority_level, years_of_experience, technology_adoption, risk_tolerance, change_readiness, ' ||
            'work_pattern, work_complexity_score, ai_maturity_score, typical_org_size, geographic_scope, is_active) VALUES ' ||
            '(''' || base_persona_name || ' (Orchestrator)'', ''' || role_name || ' - Orchestrator'', ''' || base_persona_slug || '-orchestrator'', ' ||
            '''' || role_id || '''::uuid, ''' || role_id || '''::uuid, ''' || function_id || '''::uuid, ''' || department_id || '''::uuid, ' ||
            '''ORCHESTRATOR''::archetype_type, ''senior''::seniority_level, 15, ''early_adopter''::technology_adoption, ' ||
            '''moderate''::risk_tolerance, ''high''::change_readiness, ''strategic''::work_pattern, 70, 80, ' ||
            '''Large Pharma'', ''global''::geographic_scope, TRUE);' || E'\n'
        ELSE ''
    END ||
    CASE 
        WHEN missing_learner IS NOT NULL THEN
            'INSERT INTO public.personas (name, title, slug, tenant_id, role_id, function_id, department_id, ' ||
            'archetype, seniority_level, years_of_experience, technology_adoption, risk_tolerance, change_readiness, ' ||
            'work_pattern, work_complexity_score, ai_maturity_score, typical_org_size, geographic_scope, is_active) VALUES ' ||
            '(''' || base_persona_name || ' (Learner)'', ''' || role_name || ' - Learner'', ''' || base_persona_slug || '-learner'', ' ||
            '''' || role_id || '''::uuid, ''' || role_id || '''::uuid, ''' || function_id || '''::uuid, ''' || department_id || '''::uuid, ' ||
            '''LEARNER''::archetype_type, ''entry''::seniority_level, 4, ''early_majority''::technology_adoption, ' ||
            '''conservative''::risk_tolerance, ''moderate''::change_readiness, ''routine''::work_pattern, 25, 40, ' ||
            '''Mid-Size Pharma'', ''local''::geographic_scope, TRUE);' || E'\n'
        ELSE ''
    END ||
    CASE 
        WHEN missing_skeptic IS NOT NULL THEN
            'INSERT INTO public.personas (name, title, slug, tenant_id, role_id, function_id, department_id, ' ||
            'archetype, seniority_level, years_of_experience, technology_adoption, risk_tolerance, change_readiness, ' ||
            'work_pattern, work_complexity_score, ai_maturity_score, typical_org_size, geographic_scope, is_active) VALUES ' ||
            '(''' || base_persona_name || ' (Skeptic)'', ''' || role_name || ' - Skeptic'', ''' || base_persona_slug || '-skeptic'', ' ||
            '''' || role_id || '''::uuid, ''' || role_id || '''::uuid, ''' || function_id || '''::uuid, ''' || department_id || '''::uuid, ' ||
            '''SKEPTIC''::archetype_type, ''director''::seniority_level, 20, ''late_majority''::technology_adoption, ' ||
            '''very_conservative''::risk_tolerance, ''low''::change_readiness, ''strategic''::work_pattern, 75, 35, ' ||
            '''Large Pharma'', ''global''::geographic_scope, TRUE);' || E'\n'
        ELSE ''
    END as generated_sql
FROM role_missing_archetypes
WHERE missing_automator IS NOT NULL 
   OR missing_orchestrator IS NOT NULL 
   OR missing_learner IS NOT NULL 
   OR missing_skeptic IS NOT NULL
LIMIT 10;

-- =====================================================================
-- STEP 4: MECE VALIDATION
-- =====================================================================

SELECT 
    '=== MECE VALIDATION CHECK ===' as section;

-- Check that personas are mutually exclusive (no overlap in archetype per role)
SELECT 
    r.name as role_name,
    COUNT(DISTINCT pa.inferred_archetype) as unique_archetypes,
    COUNT(DISTINCT pa.persona_id) as total_personas,
    CASE 
        WHEN COUNT(DISTINCT pa.inferred_archetype) = COUNT(DISTINCT pa.persona_id) THEN '✅ Mutually Exclusive'
        ELSE '⚠️ Overlap detected'
    END as mece_status
FROM public.org_roles r
JOIN v_persona_archetype_scores pa ON pa.role_id = r.id
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name
HAVING COUNT(DISTINCT pa.persona_id) > 0
ORDER BY total_personas DESC
LIMIT 20;

-- Check that we have all 4 archetypes (collectively exhaustive)
SELECT 
    'Total roles with personas: ' || COUNT(DISTINCT role_id) as roles_with_personas,
    'Roles with all 4 archetypes: ' || COUNT(DISTINCT CASE WHEN arch_count = 4 THEN role_id END) as complete_roles,
    'Roles missing archetypes: ' || COUNT(DISTINCT CASE WHEN arch_count < 4 THEN role_id END) as incomplete_roles
FROM (
    SELECT 
        role_id,
        COUNT(DISTINCT inferred_archetype) as arch_count
    FROM v_persona_archetype_scores
    GROUP BY role_id
) role_counts;

