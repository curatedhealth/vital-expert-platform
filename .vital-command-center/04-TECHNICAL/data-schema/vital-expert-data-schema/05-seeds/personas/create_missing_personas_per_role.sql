-- =====================================================================
-- CREATE MISSING PERSONAS TO REACH 4 PER ROLE
-- Strategy: For each role, ensure we have one persona per archetype
-- =====================================================================

BEGIN;

-- =====================================================================
-- STEP 1: IDENTIFY ROLES AND MISSING ARCHETYPES
-- =====================================================================

WITH role_archetype_analysis AS (
    SELECT 
        r.id as role_id,
        r.name as role_name,
        r.tenant_id,
        r.function_id,
        r.department_id,
        COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'AUTOMATOR' THEN pa.persona_id END) as has_automator,
        COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'ORCHESTRATOR' THEN pa.persona_id END) as has_orchestrator,
        COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'LEARNER' THEN pa.persona_id END) as has_learner,
        COUNT(DISTINCT CASE WHEN pa.inferred_archetype = 'SKEPTIC' THEN pa.persona_id END) as has_skeptic
    FROM public.org_roles r
    LEFT JOIN v_persona_archetype_scores pa ON pa.role_id = r.id
    WHERE r.deleted_at IS NULL
    GROUP BY r.id, r.name, r.tenant_id, r.function_id, r.department_id
    HAVING COUNT(DISTINCT pa.persona_id) > 0  -- Only roles that already have personas
)

SELECT 
    '=== ROLES NEEDING ADDITIONAL PERSONAS ===' as section;

SELECT 
    role_name,
    CASE WHEN has_automator = 0 THEN 'Missing AUTOMATOR' ELSE '' END ||
    CASE WHEN has_orchestrator = 0 THEN ' Missing ORCHESTRATOR' ELSE '' END ||
    CASE WHEN has_learner = 0 THEN ' Missing LEARNER' ELSE '' END ||
    CASE WHEN has_skeptic = 0 THEN ' Missing SKEPTIC' ELSE '' END as missing_archetypes
FROM role_archetype_analysis
WHERE has_automator = 0 OR has_orchestrator = 0 OR has_learner = 0 OR has_skeptic = 0
ORDER BY role_name
LIMIT 20;

-- =====================================================================
-- STEP 2: CREATE MISSING PERSONAS (Template - Review before executing)
-- =====================================================================

-- NOTE: This is a template. Review the results above and create personas manually
-- or use this as a guide for bulk creation.

-- Example: Create missing AUTOMATOR persona for a role
/*
DO $$
DECLARE
    role_rec RECORD;
    new_persona_id UUID;
    base_persona RECORD;
BEGIN
    -- For each role missing an AUTOMATOR
    FOR role_rec IN 
        SELECT DISTINCT r.id, r.name, r.tenant_id, r.function_id, r.department_id
        FROM public.org_roles r
        LEFT JOIN v_persona_archetype_scores pa ON pa.role_id = r.id AND pa.inferred_archetype = 'AUTOMATOR'
        WHERE r.deleted_at IS NULL
          AND pa.persona_id IS NULL
          AND EXISTS (SELECT 1 FROM v_persona_archetype_scores WHERE role_id = r.id) -- Has other personas
        LIMIT 10  -- Process in batches
    LOOP
        -- Get a base persona from this role to copy attributes
        SELECT * INTO base_persona
        FROM public.personas
        WHERE role_id = role_rec.id
          AND deleted_at IS NULL
        LIMIT 1;
        
        IF base_persona IS NOT NULL THEN
            -- Create new AUTOMATOR persona
            INSERT INTO public.personas (
                name,
                title,
                slug,
                tenant_id,
                role_id,
                function_id,
                department_id,
                archetype,
                seniority_level,
                years_of_experience,
                technology_adoption,
                risk_tolerance,
                change_readiness,
                work_pattern,
                work_complexity_score,
                ai_maturity_score,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                base_persona.name || ' (Automator)',  -- Modify name
                base_persona.title,
                base_persona.slug || '-automator',  -- Unique slug
                role_rec.tenant_id,
                role_rec.id,
                role_rec.function_id,
                role_rec.department_id,
                'AUTOMATOR'::archetype_type,
                COALESCE(base_persona.seniority_level, 'mid')::seniority_level,
                COALESCE(base_persona.years_of_experience, 5),
                'early_adopter'::technology_adoption,  -- High AI maturity
                'moderate'::risk_tolerance,
                'high'::change_readiness,
                'routine'::work_pattern,  -- Routine work
                30,  -- Low work complexity (< 50)
                70,  -- High AI maturity (>= 50)
                TRUE,
                NOW(),
                NOW()
            )
            RETURNING id INTO new_persona_id;
            
            RAISE NOTICE 'Created AUTOMATOR persona % for role %', new_persona_id, role_rec.name;
        END IF;
    END LOOP;
END $$;
*/

-- =====================================================================
-- RECOMMENDATION: Manual Creation Strategy
-- =====================================================================

SELECT 
    '=== RECOMMENDATION: How to Create Missing Personas ===' as section;

SELECT 
    'For each role missing personas:' as step,
    '1. Identify existing persona(s) for the role' as action_1,
    '2. Create variants with different archetype attributes:' as action_2,
    '   - AUTOMATOR: technology_adoption=early_adopter, work_pattern=routine, ai_maturity_score>=50, work_complexity_score<50' as automator_attrs,
    '   - ORCHESTRATOR: technology_adoption=early_adopter, work_pattern=strategic, ai_maturity_score>=50, work_complexity_score>=50' as orchestrator_attrs,
    '   - LEARNER: technology_adoption=early_majority, work_pattern=routine, ai_maturity_score<50, work_complexity_score<50' as learner_attrs,
    '   - SKEPTIC: technology_adoption=late_majority, work_pattern=strategic, ai_maturity_score<50, work_complexity_score>=50' as skeptic_attrs,
    '3. Use different names/slugs but same role_id, function_id, department_id' as action_3,
    '4. The trigger will auto-calculate gen_ai_readiness_level and preferred_service_layer' as action_4;

COMMIT;

