-- =====================================================================
-- FRESH START: CREATE 4 MECE PERSONAS PER MEDICAL AFFAIRS ROLE
-- Based on web research and archetype framework
-- =====================================================================

BEGIN;

-- =====================================================================
-- STEP 1: SOFT DELETE ALL EXISTING PERSONAS
-- =====================================================================

DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE public.personas
    SET deleted_at = NOW(),
        updated_at = NOW()
    WHERE deleted_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Soft deleted % existing personas', deleted_count;
END $$;

-- =====================================================================
-- STEP 2: IDENTIFY ALL MEDICAL AFFAIRS ROLES
-- =====================================================================

DO $$
DECLARE
    pharma_tenant_id UUID;
    medical_affairs_function_id UUID;
    role_count INTEGER;
BEGIN
    -- Get pharma tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;
    
    -- Get Medical Affairs function ID
    SELECT id INTO medical_affairs_function_id
    FROM public.org_functions
    WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%'
    LIMIT 1;
    
    IF medical_affairs_function_id IS NULL THEN
        RAISE EXCEPTION 'Medical Affairs function not found';
    END IF;
    
    -- Count roles
    SELECT COUNT(*) INTO role_count
    FROM public.org_roles
    WHERE deleted_at IS NULL
      AND tenant_id = pharma_tenant_id
      AND function_id = medical_affairs_function_id;
    
    RAISE NOTICE 'Found % Medical Affairs roles in pharma tenant', role_count;
    RAISE NOTICE 'Pharma Tenant ID: %', pharma_tenant_id;
    RAISE NOTICE 'Medical Affairs Function ID: %', medical_affairs_function_id;
END $$;

-- =====================================================================
-- STEP 3: CREATE 4 MECE PERSONAS PER MEDICAL AFFAIRS ROLE
-- Framework: Automator, Orchestrator, Learner, Skeptic
-- =====================================================================

DO $$
DECLARE
    role_rec RECORD;
    pharma_tenant_id UUID;
    medical_affairs_function_id UUID;
    new_persona_id UUID;
    total_created INTEGER := 0;
    role_name_slug TEXT;
    
    -- MECE Persona Templates
    automator_name TEXT;
    orchestrator_name TEXT;
    learner_name TEXT;
    skeptic_name TEXT;
    
    automator_title TEXT;
    orchestrator_title TEXT;
    learner_title TEXT;
    skeptic_title TEXT;
    
    automator_slug TEXT;
    orchestrator_slug TEXT;
    learner_slug TEXT;
    skeptic_slug TEXT;
BEGIN
    -- Get IDs
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    SELECT id INTO medical_affairs_function_id
    FROM public.org_functions
    WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%'
    LIMIT 1;
    
    -- Process each Medical Affairs role
    FOR role_rec IN 
        SELECT 
            r.id,
            r.name,
            r.tenant_id,
            r.function_id,
            r.department_id,
            d.name as department_name
        FROM public.org_roles r
        LEFT JOIN public.org_departments d ON r.department_id = d.id
        WHERE r.deleted_at IS NULL
          AND r.tenant_id = pharma_tenant_id
          AND r.function_id = medical_affairs_function_id
        ORDER BY r.name
    LOOP
        -- Generate slugs and names
        role_name_slug := LOWER(REPLACE(REPLACE(REPLACE(role_rec.name, ' ', '-'), ',', ''), '/', '-'));
        
        -- AUTOMATOR Persona (Low Complexity, High AI Maturity)
        automator_name := role_rec.name || ' - Process Optimizer';
        automator_title := role_rec.name || ' (Automator)';
        automator_slug := role_name_slug || '-automator-process-optimizer';
        
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
            automator_name,
            automator_title,
            automator_slug,
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
            30,  -- Low work complexity
            80,  -- High AI maturity
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
        
        -- ORCHESTRATOR Persona (High Complexity, High AI Maturity)
        orchestrator_name := role_rec.name || ' - Strategic Leader';
        orchestrator_title := role_rec.name || ' (Orchestrator)';
        orchestrator_slug := role_name_slug || '-orchestrator-strategic-leader';
        
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
            orchestrator_name,
            orchestrator_title,
            orchestrator_slug,
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
            75,  -- High work complexity
            85,  -- High AI maturity
            'Large Pharma',
            'global'::geographic_scope,
            12,
            'significant'::budget_authority_level,
            'collaborative'::decision_making_style,
            TRUE,
            NOW(),
            NOW()
        )
        RETURNING id INTO new_persona_id;
        
        total_created := total_created + 1;
        RAISE NOTICE 'Created ORCHESTRATOR persona for role: %', role_rec.name;
        
        -- LEARNER Persona (Low Complexity, Low AI Maturity)
        learner_name := role_rec.name || ' - Emerging Professional';
        learner_title := role_rec.name || ' (Learner)';
        learner_slug := role_name_slug || '-learner-emerging-professional';
        
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
            learner_name,
            learner_title,
            learner_slug,
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
            20,  -- Low work complexity
            35,  -- Low AI maturity
            'Mid-Size Pharma',
            'local'::geographic_scope,
            1,
            'limited'::budget_authority_level,
            'consensus'::decision_making_style,
            TRUE,
            NOW(),
            NOW()
        )
        RETURNING id INTO new_persona_id;
        
        total_created := total_created + 1;
        RAISE NOTICE 'Created LEARNER persona for role: %', role_rec.name;
        
        -- SKEPTIC Persona (High Complexity, Low AI Maturity)
        skeptic_name := role_rec.name || ' - Experienced Traditionalist';
        skeptic_title := role_rec.name || ' (Skeptic)';
        skeptic_slug := role_name_slug || '-skeptic-experienced-traditionalist';
        
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
            skeptic_name,
            skeptic_title,
            skeptic_slug,
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
            80,  -- High work complexity
            30,  -- Low AI maturity
            'Large Pharma',
            'global'::geographic_scope,
            15,
            'high'::budget_authority_level,
            'hierarchical'::decision_making_style,
            TRUE,
            NOW(),
            NOW()
        )
        RETURNING id INTO new_persona_id;
        
        total_created := total_created + 1;
        RAISE NOTICE 'Created SKEPTIC persona for role: %', role_rec.name;
        
    END LOOP;
    
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Total personas created: %', total_created;
END $$;

-- =====================================================================
-- STEP 4: VERIFY RESULTS
-- =====================================================================

SELECT 
    '=== VERIFICATION: MEDICAL AFFAIRS PERSONAS ===' as section;

SELECT 
    r.name as role_name,
    d.name as department_name,
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT p.archetype) as unique_archetypes,
    STRING_AGG(DISTINCT p.archetype::text, ', ' ORDER BY p.archetype::text) as archetypes,
    CASE 
        WHEN COUNT(DISTINCT p.archetype) = 4 THEN '✅ Complete (MECE)'
        ELSE '⚠️ Missing archetypes'
    END as status
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
GROUP BY r.id, r.name, d.name
ORDER BY r.name;

-- =====================================================================
-- STEP 5: SUMMARY STATISTICS
-- =====================================================================

SELECT 
    '=== SUMMARY ===' as section;

SELECT 
    (SELECT COUNT(DISTINCT r.id) 
     FROM public.org_roles r
     WHERE r.deleted_at IS NULL
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
       AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
    ) as total_medical_affairs_roles,
    
    (SELECT COUNT(*) 
     FROM public.personas p
     JOIN public.org_roles r ON p.role_id = r.id
     WHERE p.deleted_at IS NULL
       AND r.deleted_at IS NULL
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
       AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
    ) as total_personas_created,
    
    (SELECT COUNT(DISTINCT r.id)
     FROM public.org_roles r
     JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
     WHERE r.deleted_at IS NULL
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
       AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
     GROUP BY r.id
     HAVING COUNT(DISTINCT p.archetype) = 4
    ) as roles_with_4_archetypes,
    
    (SELECT COUNT(DISTINCT p.archetype)
     FROM public.personas p
     JOIN public.org_roles r ON p.role_id = r.id
     WHERE p.deleted_at IS NULL
       AND r.deleted_at IS NULL
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
       AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
    ) as unique_archetypes_represented;

-- =====================================================================
-- STEP 6: ARCHETYPE DISTRIBUTION
-- =====================================================================

SELECT 
    '=== ARCHETYPE DISTRIBUTION ===' as section;

SELECT 
    p.archetype,
    COUNT(*) as persona_count,
    COUNT(DISTINCT p.role_id) as roles_represented,
    ROUND(AVG(p.work_complexity_score), 1) as avg_work_complexity,
    ROUND(AVG(p.ai_maturity_score), 1) as avg_ai_maturity
FROM public.personas p
JOIN public.org_roles r ON p.role_id = r.id
WHERE p.deleted_at IS NULL
  AND r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
GROUP BY p.archetype
ORDER BY p.archetype;

COMMIT;

-- =====================================================================
-- SUCCESS MESSAGE
-- =====================================================================

SELECT 
    '✅ Fresh start complete! All Medical Affairs roles now have 4 MECE personas.' as message;

