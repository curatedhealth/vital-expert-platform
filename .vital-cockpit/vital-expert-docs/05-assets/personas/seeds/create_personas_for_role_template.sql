-- =====================================================================
-- TEMPLATE: CREATE 4 MECE PERSONAS FOR A ROLE
-- Replace [ROLE_NAME] and [ROLE_SLUG_PATTERN] with actual values
-- =====================================================================

BEGIN;

DO $$
DECLARE
    target_role_id UUID;
    pharma_tenant_id UUID;
    medical_affairs_function_id UUID;
    target_dept_id UUID;
    persona_id_var UUID;
BEGIN
    -- Get IDs
    SELECT id INTO target_role_id 
    FROM public.org_roles 
    WHERE name ILIKE '[ROLE_SLUG_PATTERN]' 
      AND deleted_at IS NULL 
    LIMIT 1;
    
    SELECT id INTO pharma_tenant_id 
    FROM public.tenants 
    WHERE slug IN ('pharmaceuticals', 'pharma') 
    LIMIT 1;
    
    SELECT id INTO medical_affairs_function_id 
    FROM public.org_functions 
    WHERE name::text ILIKE '%medical%affairs%' 
      AND deleted_at IS NULL 
    LIMIT 1;
    
    SELECT d.id INTO target_dept_id 
    FROM public.org_roles r
    JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.id = target_role_id
      AND d.deleted_at IS NULL
    LIMIT 1;
    
    -- Verify we found the role
    IF target_role_id IS NULL THEN
        RAISE EXCEPTION 'Role not found. Check role name pattern.';
    END IF;
    
    -- =====================================================================
    -- PERSONA 1: AUTOMATOR (High AI Maturity + Routine Work)
    -- =====================================================================
    INSERT INTO public.personas (
        name, slug, title, tagline, archetype,
        role_id, function_id, department_id, tenant_id,
        seniority_level, years_of_experience, team_size_typical, budget_authority,
        work_pattern, technology_adoption, risk_tolerance, change_readiness,
        ai_maturity_score, work_complexity_score,
        learning_preference, collaboration_style, decision_making_style,
        geographic_scope, typical_org_size,
        created_at, updated_at
    ) VALUES (
        '[PERSONA_NAME] - Automator',
        '[PERSONA_SLUG]-automator',
        '[ROLE_TITLE]',
        '[AUTOMATOR_TAGLINE]',
        'AUTOMATOR',
        target_role_id, medical_affairs_function_id, target_dept_id, pharma_tenant_id,
        'mid', 6, 0, 50000,
        'routine', 'early_adopter', 'moderate', 'high',
        75.0, 35.0,
        'hands_on', 'independent', 'analytical',
        'regional', 'large_pharma',
        NOW(), NOW()
    ) RETURNING id INTO persona_id_var;
    
    -- Pain Points for Automator
    INSERT INTO public.persona_pain_points (persona_id, pain_point_text, severity, created_at)
    VALUES 
        (persona_id_var, '[AUTOMATOR_PAIN_1]', 'high', NOW()),
        (persona_id_var, '[AUTOMATOR_PAIN_2]', 'high', NOW()),
        (persona_id_var, '[AUTOMATOR_PAIN_3]', 'medium', NOW()),
        (persona_id_var, '[AUTOMATOR_PAIN_4]', 'high', NOW());
    
    -- Goals for Automator
    INSERT INTO public.persona_goals (persona_id, goal_text, priority, created_at)
    VALUES 
        (persona_id_var, '[AUTOMATOR_GOAL_1]', 'high', NOW()),
        (persona_id_var, '[AUTOMATOR_GOAL_2]', 'high', NOW()),
        (persona_id_var, '[AUTOMATOR_GOAL_3]', 'high', NOW()),
        (persona_id_var, '[AUTOMATOR_GOAL_4]', 'medium', NOW());
    
    -- =====================================================================
    -- PERSONA 2: ORCHESTRATOR (High AI Maturity + Strategic Work)
    -- =====================================================================
    INSERT INTO public.personas (
        name, slug, title, tagline, archetype,
        role_id, function_id, department_id, tenant_id,
        seniority_level, years_of_experience, team_size_typical, budget_authority,
        work_pattern, technology_adoption, risk_tolerance, change_readiness,
        ai_maturity_score, work_complexity_score,
        learning_preference, collaboration_style, decision_making_style,
        geographic_scope, typical_org_size,
        created_at, updated_at
    ) VALUES (
        '[PERSONA_NAME] - Orchestrator',
        '[PERSONA_SLUG]-orchestrator',
        '[ROLE_TITLE]',
        '[ORCHESTRATOR_TAGLINE]',
        'ORCHESTRATOR',
        target_role_id, medical_affairs_function_id, target_dept_id, pharma_tenant_id,
        'senior', 12, 8, 500000,
        'strategic', 'early_adopter', 'moderate', 'high',
        80.0, 72.0,
        'self_directed', 'collaborative', 'analytical',
        'global', 'large_pharma',
        NOW(), NOW()
    ) RETURNING id INTO persona_id_var;
    
    -- Pain Points for Orchestrator
    INSERT INTO public.persona_pain_points (persona_id, pain_point_text, severity, created_at)
    VALUES 
        (persona_id_var, '[ORCHESTRATOR_PAIN_1]', 'high', NOW()),
        (persona_id_var, '[ORCHESTRATOR_PAIN_2]', 'high', NOW()),
        (persona_id_var, '[ORCHESTRATOR_PAIN_3]', 'medium', NOW()),
        (persona_id_var, '[ORCHESTRATOR_PAIN_4]', 'medium', NOW());
    
    -- Goals for Orchestrator
    INSERT INTO public.persona_goals (persona_id, goal_text, priority, created_at)
    VALUES 
        (persona_id_var, '[ORCHESTRATOR_GOAL_1]', 'high', NOW()),
        (persona_id_var, '[ORCHESTRATOR_GOAL_2]', 'high', NOW()),
        (persona_id_var, '[ORCHESTRATOR_GOAL_3]', 'high', NOW()),
        (persona_id_var, '[ORCHESTRATOR_GOAL_4]', 'medium', NOW());
    
    -- =====================================================================
    -- PERSONA 3: LEARNER (Low AI Maturity + Routine Work)
    -- =====================================================================
    INSERT INTO public.personas (
        name, slug, title, tagline, archetype,
        role_id, function_id, department_id, tenant_id,
        seniority_level, years_of_experience, team_size_typical, budget_authority,
        work_pattern, technology_adoption, risk_tolerance, change_readiness,
        ai_maturity_score, work_complexity_score,
        learning_preference, collaboration_style, decision_making_style,
        geographic_scope, typical_org_size,
        created_at, updated_at
    ) VALUES (
        '[PERSONA_NAME] - Learner',
        '[PERSONA_SLUG]-learner',
        '[ROLE_TITLE]',
        '[LEARNER_TAGLINE]',
        'LEARNER',
        target_role_id, medical_affairs_function_id, target_dept_id, pharma_tenant_id,
        'entry', 2, 0, 0,
        'routine', 'late_majority', 'conservative', 'moderate',
        25.0, 20.0,
        'guided', 'collaborative', 'collaborative',
        'local', 'mid_size_pharma',
        NOW(), NOW()
    ) RETURNING id INTO persona_id_var;
    
    -- Pain Points for Learner
    INSERT INTO public.persona_pain_points (persona_id, pain_point_text, severity, created_at)
    VALUES 
        (persona_id_var, '[LEARNER_PAIN_1]', 'high', NOW()),
        (persona_id_var, '[LEARNER_PAIN_2]', 'high', NOW()),
        (persona_id_var, '[LEARNER_PAIN_3]', 'medium', NOW()),
        (persona_id_var, '[LEARNER_PAIN_4]', 'medium', NOW());
    
    -- Goals for Learner
    INSERT INTO public.persona_goals (persona_id, goal_text, priority, created_at)
    VALUES 
        (persona_id_var, '[LEARNER_GOAL_1]', 'high', NOW()),
        (persona_id_var, '[LEARNER_GOAL_2]', 'high', NOW()),
        (persona_id_var, '[LEARNER_GOAL_3]', 'high', NOW()),
        (persona_id_var, '[LEARNER_GOAL_4]', 'medium', NOW());
    
    -- =====================================================================
    -- PERSONA 4: SKEPTIC (Low AI Maturity + Strategic Work)
    -- =====================================================================
    INSERT INTO public.personas (
        name, slug, title, tagline, archetype,
        role_id, function_id, department_id, tenant_id,
        seniority_level, years_of_experience, team_size_typical, budget_authority,
        work_pattern, technology_adoption, risk_tolerance, change_readiness,
        ai_maturity_score, work_complexity_score,
        learning_preference, collaboration_style, decision_making_style,
        geographic_scope, typical_org_size,
        created_at, updated_at
    ) VALUES (
        '[PERSONA_NAME] - Skeptic',
        '[PERSONA_SLUG]-skeptic',
        '[ROLE_TITLE]',
        '[SKEPTIC_TAGLINE]',
        'SKEPTIC',
        target_role_id, medical_affairs_function_id, target_dept_id, pharma_tenant_id,
        'senior', 18, 12, 1000000,
        'strategic', 'laggard', 'very_conservative', 'low',
        30.0, 78.0,
        'guided', 'collaborative', 'authoritative',
        'global', 'large_pharma',
        NOW(), NOW()
    ) RETURNING id INTO persona_id_var;
    
    -- Pain Points for Skeptic
    INSERT INTO public.persona_pain_points (persona_id, pain_point_text, severity, created_at)
    VALUES 
        (persona_id_var, '[SKEPTIC_PAIN_1]', 'high', NOW()),
        (persona_id_var, '[SKEPTIC_PAIN_2]', 'high', NOW()),
        (persona_id_var, '[SKEPTIC_PAIN_3]', 'high', NOW()),
        (persona_id_var, '[SKEPTIC_PAIN_4]', 'high', NOW());
    
    -- Goals for Skeptic
    INSERT INTO public.persona_goals (persona_id, goal_text, priority, created_at)
    VALUES 
        (persona_id_var, '[SKEPTIC_GOAL_1]', 'high', NOW()),
        (persona_id_var, '[SKEPTIC_GOAL_2]', 'high', NOW()),
        (persona_id_var, '[SKEPTIC_GOAL_3]', 'high', NOW()),
        (persona_id_var, '[SKEPTIC_GOAL_4]', 'medium', NOW());
    
    RAISE NOTICE 'Created 4 MECE personas for [ROLE_NAME]';
END $$;

COMMIT;

