-- =====================================================================
-- AUTO-GENERATE MISSING PERSONAS TO REACH 4 PER ROLE
-- This script automatically creates missing personas based on MECE framework
-- =====================================================================

BEGIN;

-- =====================================================================
-- STEP 1: CREATE MISSING AUTOMATOR PERSONAS
-- =====================================================================

DO $$
DECLARE
    role_rec RECORD;
    base_persona RECORD;
    new_persona_id UUID;
    pharma_tenant_id UUID;
    created_count INTEGER := 0;
BEGIN
    -- Get pharma tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;
    
    -- For each role missing an AUTOMATOR
    FOR role_rec IN 
        SELECT DISTINCT 
            r.id, 
            r.name, 
            r.tenant_id, 
            r.function_id, 
            r.department_id
        FROM public.org_roles r
        WHERE r.deleted_at IS NULL
          AND r.tenant_id = pharma_tenant_id
          AND NOT EXISTS (
              SELECT 1 FROM public.personas p 
              WHERE p.role_id = r.id 
                AND p.archetype = 'AUTOMATOR' 
                AND p.deleted_at IS NULL
          )
          -- Include roles with or without existing personas
    LOOP
        -- Get a base persona from this role to copy attributes
        SELECT * INTO base_persona
        FROM public.personas
        WHERE role_id = role_rec.id
          AND deleted_at IS NULL
        LIMIT 1;
        
        -- Create new AUTOMATOR persona (even if no base persona exists)
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
            typical_org_size,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            COALESCE(base_persona.name, role_rec.name) || ' (Automator)',
            COALESCE(base_persona.title, role_rec.name) || ' - Automator',
            COALESCE(base_persona.slug, LOWER(REPLACE(role_rec.name, ' ', '-'))) || '-automator',
            role_rec.tenant_id,
            role_rec.id,
            role_rec.function_id,
            role_rec.department_id,
            'AUTOMATOR'::archetype_type,
            'mid'::seniority_level,
            7,
            'early_adopter'::technology_adoption,
            'moderate'::risk_tolerance,
            'high'::change_readiness,
            'routine'::work_pattern,
            35,  -- Low work complexity (routine)
            75,  -- High AI maturity
            'Large Pharma',
            'global'::geographic_scope,
            TRUE,
            NOW(),
            NOW()
        )
        RETURNING id INTO new_persona_id;
        
        created_count := created_count + 1;
        RAISE NOTICE 'Created AUTOMATOR persona % for role %', new_persona_id, role_rec.name;
    END LOOP;
    
    RAISE NOTICE 'Created % AUTOMATOR personas', created_count;
END $$;

-- =====================================================================
-- STEP 2: CREATE MISSING ORCHESTRATOR PERSONAS
-- =====================================================================

DO $$
DECLARE
    role_rec RECORD;
    base_persona RECORD;
    new_persona_id UUID;
    pharma_tenant_id UUID;
    created_count INTEGER := 0;
BEGIN
    -- Get pharma tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    -- For each role missing an ORCHESTRATOR
    FOR role_rec IN 
        SELECT DISTINCT 
            r.id, 
            r.name, 
            r.tenant_id, 
            r.function_id, 
            r.department_id
        FROM public.org_roles r
        WHERE r.deleted_at IS NULL
          AND r.tenant_id = pharma_tenant_id
          AND NOT EXISTS (
              SELECT 1 FROM public.personas p 
              WHERE p.role_id = r.id 
                AND p.archetype = 'ORCHESTRATOR' 
                AND p.deleted_at IS NULL
          )
          -- Include all roles (with or without existing personas)
    LOOP
        SELECT * INTO base_persona
        FROM public.personas
        WHERE role_id = role_rec.id
          AND deleted_at IS NULL
        LIMIT 1;
        
        -- Create persona (even if no base persona exists)
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
                typical_org_size,
                geographic_scope,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                COALESCE(base_persona.name, role_rec.name) || ' (Orchestrator)',
                COALESCE(base_persona.title, role_rec.name) || ' - Orchestrator',
                COALESCE(base_persona.slug, LOWER(REPLACE(role_rec.name, ' ', '-'))) || '-orchestrator',
                role_rec.tenant_id,
                role_rec.id,
                role_rec.function_id,
                role_rec.department_id,
                'ORCHESTRATOR'::archetype_type,
                'senior'::seniority_level,
                15,
                'early_adopter'::technology_adoption,
                'moderate'::risk_tolerance,
                'high'::change_readiness,
                'strategic'::work_pattern,
                70,  -- High work complexity (strategic)
                80,  -- High AI maturity
                'Large Pharma',
                'global'::geographic_scope,
                TRUE,
                NOW(),
                NOW()
            )
            RETURNING id INTO new_persona_id;
        
        created_count := created_count + 1;
        RAISE NOTICE 'Created ORCHESTRATOR persona % for role %', new_persona_id, role_rec.name;
    END LOOP;
    
    RAISE NOTICE 'Created % ORCHESTRATOR personas', created_count;
END $$;

-- =====================================================================
-- STEP 3: CREATE MISSING LEARNER PERSONAS
-- =====================================================================

DO $$
DECLARE
    role_rec RECORD;
    base_persona RECORD;
    new_persona_id UUID;
    pharma_tenant_id UUID;
    created_count INTEGER := 0;
BEGIN
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    FOR role_rec IN 
        SELECT DISTINCT 
            r.id, 
            r.name, 
            r.tenant_id, 
            r.function_id, 
            r.department_id
        FROM public.org_roles r
        WHERE r.deleted_at IS NULL
          AND r.tenant_id = pharma_tenant_id
          AND NOT EXISTS (
              SELECT 1 FROM public.personas p 
              WHERE p.role_id = r.id 
                AND p.archetype = 'LEARNER' 
                AND p.deleted_at IS NULL
          )
          -- Include all roles (with or without existing personas)
    LOOP
        SELECT * INTO base_persona
        FROM public.personas
        WHERE role_id = role_rec.id
          AND deleted_at IS NULL
        LIMIT 1;
        
        -- Create persona (even if no base persona exists)
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
                typical_org_size,
                geographic_scope,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                COALESCE(base_persona.name, role_rec.name) || ' (Learner)',
                COALESCE(base_persona.title, role_rec.name) || ' - Learner',
                COALESCE(base_persona.slug, LOWER(REPLACE(role_rec.name, ' ', '-'))) || '-learner',
                role_rec.tenant_id,
                role_rec.id,
                role_rec.function_id,
                role_rec.department_id,
                'LEARNER'::archetype_type,
                'entry'::seniority_level,
                4,
                'early_majority'::technology_adoption,
                'conservative'::risk_tolerance,
                'moderate'::change_readiness,
                'routine'::work_pattern,
                25,  -- Low work complexity (routine)
                40,  -- Low AI maturity
                'Mid-Size Pharma',
                'local'::geographic_scope,
                TRUE,
                NOW(),
                NOW()
            )
            RETURNING id INTO new_persona_id;
        
        created_count := created_count + 1;
        RAISE NOTICE 'Created LEARNER persona % for role %', new_persona_id, role_rec.name;
    END LOOP;
    
    RAISE NOTICE 'Created % LEARNER personas', created_count;
END $$;

-- =====================================================================
-- STEP 4: CREATE MISSING SKEPTIC PERSONAS
-- =====================================================================

DO $$
DECLARE
    role_rec RECORD;
    base_persona RECORD;
    new_persona_id UUID;
    pharma_tenant_id UUID;
    created_count INTEGER := 0;
BEGIN
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    FOR role_rec IN 
        SELECT DISTINCT 
            r.id, 
            r.name, 
            r.tenant_id, 
            r.function_id, 
            r.department_id
        FROM public.org_roles r
        WHERE r.deleted_at IS NULL
          AND r.tenant_id = pharma_tenant_id
          AND NOT EXISTS (
              SELECT 1 FROM public.personas p 
              WHERE p.role_id = r.id 
                AND p.archetype = 'SKEPTIC' 
                AND p.deleted_at IS NULL
          )
          -- Include all roles (with or without existing personas)
    LOOP
        SELECT * INTO base_persona
        FROM public.personas
        WHERE role_id = role_rec.id
          AND deleted_at IS NULL
        LIMIT 1;
        
        -- Create persona (even if no base persona exists)
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
                typical_org_size,
                geographic_scope,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                COALESCE(base_persona.name, role_rec.name) || ' (Skeptic)',
                COALESCE(base_persona.title, role_rec.name) || ' - Skeptic',
                COALESCE(base_persona.slug, LOWER(REPLACE(role_rec.name, ' ', '-'))) || '-skeptic',
                role_rec.tenant_id,
                role_rec.id,
                role_rec.function_id,
                role_rec.department_id,
                'SKEPTIC'::archetype_type,
                'director'::seniority_level,
                20,
                'late_majority'::technology_adoption,
                'very_conservative'::risk_tolerance,
                'low'::change_readiness,
                'strategic'::work_pattern,
                75,  -- High work complexity (strategic)
                35,  -- Low AI maturity
                'Large Pharma',
                'global'::geographic_scope,
                TRUE,
                NOW(),
                NOW()
            )
            RETURNING id INTO new_persona_id;
        
        created_count := created_count + 1;
        RAISE NOTICE 'Created SKEPTIC persona % for role %', new_persona_id, role_rec.name;
    END LOOP;
    
    RAISE NOTICE 'Created % SKEPTIC personas', created_count;
END $$;

-- =====================================================================
-- STEP 5: REFRESH VIEW AND VERIFY
-- =====================================================================

-- Refresh the view to include new personas
DROP VIEW IF EXISTS v_persona_archetype_scores CASCADE;

-- Recreate the view (from identify_gen_ai_opportunities_from_personas.sql)
CREATE OR REPLACE VIEW v_persona_archetype_scores AS
WITH persona_archetype_scores AS (
    SELECT 
        p.id as persona_id,
        p.name as persona_name,
        p.role_id,
        r.name as role_name,
        
        -- Work Complexity Score (0-100)
        (
            CASE 
                WHEN p.seniority_level = 'entry' THEN 10
                WHEN p.seniority_level = 'mid' THEN 20
                WHEN p.seniority_level = 'senior' THEN 30
                WHEN p.seniority_level = 'director' THEN 40
                WHEN p.seniority_level = 'executive' THEN 50
                WHEN p.seniority_level = 'c_suite' THEN 60
                ELSE 20
            END +
            COALESCE(
                CASE 
                    WHEN p.team_size_typical = 0 THEN 5
                    WHEN p.team_size_typical BETWEEN 1 AND 5 THEN 10
                    WHEN p.team_size_typical BETWEEN 6 AND 15 THEN 20
                    WHEN p.team_size_typical > 15 THEN 30
                    ELSE 10
                END, 10
            ) +
            CASE 
                WHEN p.budget_authority_level = 'none' THEN 5
                WHEN p.budget_authority_level = 'limited' THEN 10
                WHEN p.budget_authority_level = 'moderate' THEN 20
                WHEN p.budget_authority_level = 'significant' THEN 30
                WHEN p.budget_authority_level = 'high' THEN 40
                ELSE 10
            END +
            COALESCE(
                CASE 
                    WHEN p.years_of_experience < 3 THEN 5
                    WHEN p.years_of_experience BETWEEN 3 AND 7 THEN 10
                    WHEN p.years_of_experience BETWEEN 8 AND 12 THEN 20
                    WHEN p.years_of_experience > 12 THEN 30
                    ELSE 10
                END, 10
            )
        ) as work_complexity_score,
        
        -- AI Maturity Score (0-100)
        (
            CASE 
                WHEN p.technology_adoption = 'laggard' THEN 10
                WHEN p.technology_adoption = 'late_majority' THEN 20
                WHEN p.technology_adoption = 'early_majority' THEN 40
                WHEN p.technology_adoption = 'early_adopter' THEN 60
                WHEN p.technology_adoption = 'innovator' THEN 80
                ELSE 30
            END +
            CASE 
                WHEN p.risk_tolerance = 'very_conservative' THEN 10
                WHEN p.risk_tolerance = 'conservative' THEN 20
                WHEN p.risk_tolerance = 'moderate' THEN 40
                WHEN p.risk_tolerance = 'aggressive' THEN 60
                ELSE 30
            END +
            CASE 
                WHEN p.change_readiness = 'low' THEN 10
                WHEN p.change_readiness = 'moderate' THEN 30
                WHEN p.change_readiness = 'high' THEN 50
                ELSE 25
            END
        ) as ai_maturity_score
        
    FROM public.personas p
    LEFT JOIN public.org_roles r ON p.role_id = r.id
    WHERE p.deleted_at IS NULL
),
persona_archetypes AS (
    SELECT 
        *,
        CASE 
            WHEN work_complexity_score < 50 AND ai_maturity_score >= 50 THEN 'AUTOMATOR'
            WHEN work_complexity_score >= 50 AND ai_maturity_score >= 50 THEN 'ORCHESTRATOR'
            WHEN work_complexity_score < 50 AND ai_maturity_score < 50 THEN 'LEARNER'
            WHEN work_complexity_score >= 50 AND ai_maturity_score < 50 THEN 'SKEPTIC'
            ELSE 'LEARNER'
        END as inferred_archetype,
        CASE 
            WHEN ABS(work_complexity_score - 50) > 20 AND ABS(ai_maturity_score - 50) > 20 THEN 90
            WHEN ABS(work_complexity_score - 50) > 15 AND ABS(ai_maturity_score - 50) > 15 THEN 75
            WHEN ABS(work_complexity_score - 50) > 10 AND ABS(ai_maturity_score - 50) > 10 THEN 60
            ELSE 50
        END as confidence_score
    FROM persona_archetype_scores
)
SELECT * FROM persona_archetypes;

-- Verify results
SELECT 
    '=== VERIFICATION: ROLES WITH 4 PERSONAS ===' as section;

SELECT 
    r.name as role_name,
    COUNT(DISTINCT pa.inferred_archetype) as unique_archetypes,
    COUNT(DISTINCT pa.persona_id) as total_personas,
    STRING_AGG(DISTINCT pa.inferred_archetype, ', ' ORDER BY pa.inferred_archetype) as archetypes,
    CASE 
        WHEN COUNT(DISTINCT pa.inferred_archetype) = 4 THEN '✅ Complete'
        ELSE '⚠️ Missing ' || (4 - COUNT(DISTINCT pa.inferred_archetype))::text || ' archetype(s)'
    END as status
FROM public.org_roles r
JOIN v_persona_archetype_scores pa ON pa.role_id = r.id
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
GROUP BY r.id, r.name
ORDER BY unique_archetypes DESC, total_personas DESC
LIMIT 50;

COMMIT;

-- =====================================================================
-- SUMMARY
-- =====================================================================

SELECT 
    '=== SUMMARY ===' as section;

SELECT 
    (SELECT COUNT(DISTINCT role_id) FROM v_persona_archetype_scores) as roles_with_personas,
    (SELECT COUNT(DISTINCT CASE WHEN arch_count = 4 THEN role_id END)
     FROM (
         SELECT role_id, COUNT(DISTINCT inferred_archetype) as arch_count
         FROM v_persona_archetype_scores
         GROUP BY role_id
     ) role_counts
    ) as roles_with_4_archetypes,
    (SELECT COUNT(DISTINCT CASE WHEN arch_count < 4 THEN role_id END)
     FROM (
         SELECT role_id, COUNT(DISTINCT inferred_archetype) as arch_count
         FROM v_persona_archetype_scores
         GROUP BY role_id
     ) role_counts
    ) as roles_still_incomplete;

