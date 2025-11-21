-- =====================================================================
-- CREATE 4 MECE PERSONAS FOR EXISTING MEDICAL AFFAIRS ROLES
-- =====================================================================

BEGIN;

DO $$
DECLARE
    role_rec RECORD;
    pharma_tenant_id UUID;
    new_persona_id UUID;
    total_created INTEGER := 0;
    role_name_slug TEXT;
BEGIN
    -- Get pharma tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;
    
    -- Process each role that exists
    FOR role_rec IN 
        SELECT 
            r.id,
            r.name,
            r.tenant_id,
            r.function_id,
            r.department_id
        FROM public.org_roles r
        WHERE r.deleted_at IS NULL
          AND r.tenant_id = pharma_tenant_id
          AND r.name IN ('Medical Affairs Director', 'Medical Information Manager')
    LOOP
        -- Generate slug
        role_name_slug := LOWER(REPLACE(REPLACE(REPLACE(role_rec.name, ' ', '-'), ',', ''), '/', '-'));
        
        -- AUTOMATOR Persona
        INSERT INTO public.personas (
            name, title, slug,
            tenant_id, role_id, function_id, department_id,
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
            team_size_typical,
            budget_authority_level,
            decision_making_style,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            role_rec.name || ' - Process Optimizer',
            role_rec.name || ' (Automator)',
            role_name_slug || '-automator-process-optimizer',
            role_rec.tenant_id,
            role_rec.id,
            role_rec.function_id,
            role_rec.department_id,
            'AUTOMATOR'::archetype_type,
            'mid'::seniority_level,
            6,
            'early_adopter'::technology_adoption,
            'moderate'::risk_tolerance,
            'high'::change_readiness,
            'routine'::work_pattern,
            30,
            80,
            'Large Pharma',
            'regional'::geographic_scope,
            3,
            'moderate'::budget_authority_level,
            'data_driven'::decision_making_style,
            TRUE,
            NOW(),
            NOW()
        )
        RETURNING id INTO new_persona_id;
        
        total_created := total_created + 1;
        RAISE NOTICE 'Created AUTOMATOR persona for role: %', role_rec.name;
        
        -- ORCHESTRATOR Persona
        INSERT INTO public.personas (
            name, title, slug,
            tenant_id, role_id, function_id, department_id,
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
            team_size_typical,
            budget_authority_level,
            decision_making_style,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            role_rec.name || ' - Strategic Leader',
            role_rec.name || ' (Orchestrator)',
            role_name_slug || '-orchestrator-strategic-leader',
            role_rec.tenant_id,
            role_rec.id,
            role_rec.function_id,
            role_rec.department_id,
            'ORCHESTRATOR'::archetype_type,
            'senior'::seniority_level,
            12,
            'early_adopter'::technology_adoption,
            'moderate'::risk_tolerance,
            'high'::change_readiness,
            'strategic'::work_pattern,
            75,
            85,
            'Large Pharma',
            'global'::geographic_scope,
            12,
            'significant'::budget_authority_level,
            'collaborative'::decision_making_style,
            TRUE,
            NOW(),
            NOW()
        );
        
        total_created := total_created + 1;
        RAISE NOTICE 'Created ORCHESTRATOR persona for role: %', role_rec.name;
        
        -- LEARNER Persona
        INSERT INTO public.personas (
            name, title, slug,
            tenant_id, role_id, function_id, department_id,
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
            team_size_typical,
            budget_authority_level,
            decision_making_style,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            role_rec.name || ' - Emerging Professional',
            role_rec.name || ' (Learner)',
            role_name_slug || '-learner-emerging-professional',
            role_rec.tenant_id,
            role_rec.id,
            role_rec.function_id,
            role_rec.department_id,
            'LEARNER'::archetype_type,
            'entry'::seniority_level,
            2,
            'early_majority'::technology_adoption,
            'conservative'::risk_tolerance,
            'moderate'::change_readiness,
            'routine'::work_pattern,
            20,
            35,
            'Mid-Size Pharma',
            'local'::geographic_scope,
            1,
            'limited'::budget_authority_level,
            'consensus'::decision_making_style,
            TRUE,
            NOW(),
            NOW()
        );
        
        total_created := total_created + 1;
        RAISE NOTICE 'Created LEARNER persona for role: %', role_rec.name;
        
        -- SKEPTIC Persona
        INSERT INTO public.personas (
            name, title, slug,
            tenant_id, role_id, function_id, department_id,
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
            team_size_typical,
            budget_authority_level,
            decision_making_style,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            role_rec.name || ' - Experienced Traditionalist',
            role_rec.name || ' (Skeptic)',
            role_name_slug || '-skeptic-experienced-traditionalist',
            role_rec.tenant_id,
            role_rec.id,
            role_rec.function_id,
            role_rec.department_id,
            'SKEPTIC'::archetype_type,
            'director'::seniority_level,
            18,
            'late_majority'::technology_adoption,
            'very_conservative'::risk_tolerance,
            'low'::change_readiness,
            'strategic'::work_pattern,
            80,
            30,
            'Large Pharma',
            'global'::geographic_scope,
            15,
            'high'::budget_authority_level,
            'hierarchical'::decision_making_style,
            TRUE,
            NOW(),
            NOW()
        );
        
        total_created := total_created + 1;
        RAISE NOTICE 'Created SKEPTIC persona for role: %', role_rec.name;
        
    END LOOP;
    
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Total personas created: %', total_created;
END $$;

-- Verify
SELECT 
    '=== VERIFICATION ===' as section;

SELECT 
    COALESCE(d.name, 'No Department') as department_name,
    r.name as role_name,
    COUNT(p.id) as persona_count,
    STRING_AGG(DISTINCT p.archetype::text, ', ' ORDER BY p.archetype::text) as archetypes
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND r.name IN ('Medical Affairs Director', 'Medical Information Manager')
GROUP BY d.name, r.id, r.name
ORDER BY r.name;

COMMIT;

