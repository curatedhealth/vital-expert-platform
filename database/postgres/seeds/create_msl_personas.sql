-- =====================================================================
-- CREATE 4 MECE PERSONAS FOR MEDICAL SCIENCE LIAISON (MSL) ROLE
-- Based on Gold Standard: AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC
-- =====================================================================

BEGIN;

DO $$
DECLARE
    msl_role_id UUID;
    pharma_tenant_id UUID;
    medical_affairs_function_id UUID;
    field_medical_dept_id UUID;
    persona_id_var UUID;
BEGIN
    -- Get IDs
    SELECT id INTO msl_role_id 
    FROM public.org_roles 
    WHERE name ILIKE '%medical science liaison%' 
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
    
    SELECT id INTO field_medical_dept_id 
    FROM public.org_departments 
    WHERE name = 'Field Medical' 
      AND deleted_at IS NULL 
    LIMIT 1;
    
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
        'Dr. Sarah Chen - MSL Automator',
        'dr-sarah-chen-msl-automator',
        'Medical Science Liaison',
        'Efficiency-Driven Field Medical Expert',
        'AUTOMATOR',
        msl_role_id, medical_affairs_function_id, field_medical_dept_id, pharma_tenant_id,
        'mid', 6, 0, 50000,
        'routine', 'early_adopter', 'moderate', 'high',
        75.0, 35.0,
        'hands_on', 'independent', 'analytical',
        'regional', 'large_pharma',
        NOW(), NOW()
    ) RETURNING id INTO persona_id_var;
    
    -- Pain Points for Automator MSL
    INSERT INTO public.persona_pain_points (persona_id, pain_point_text, severity, created_at)
    VALUES 
        (persona_id_var, 'Spending 8+ hours weekly on manual call note documentation and CRM updates', 'high', NOW()),
        (persona_id_var, 'Repetitive literature searches and summary generation for KOL meetings', 'high', NOW()),
        (persona_id_var, 'Manual slide deck creation for scientific presentations', 'medium', NOW()),
        (persona_id_var, 'Time-consuming data entry across multiple systems', 'high', NOW());
    
    -- Goals for Automator MSL
    INSERT INTO public.persona_goals (persona_id, goal_text, priority, created_at)
    VALUES 
        (persona_id_var, 'Automate call note generation and CRM updates to save 10+ hours/week', 'high', NOW()),
        (persona_id_var, 'Streamline literature monitoring and summary creation', 'high', NOW()),
        (persona_id_var, 'Eliminate manual data entry through workflow automation', 'high', NOW()),
        (persona_id_var, 'Scale KOL engagement without proportional time increase', 'medium', NOW());
    
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
        'Dr. Michael Rodriguez - MSL Orchestrator',
        'dr-michael-rodriguez-msl-orchestrator',
        'Senior Medical Science Liaison',
        'Strategic KOL Ecosystem Architect',
        'ORCHESTRATOR',
        msl_role_id, medical_affairs_function_id, field_medical_dept_id, pharma_tenant_id,
        'senior', 12, 8, 500000,
        'strategic', 'early_adopter', 'moderate', 'high',
        80.0, 72.0,
        'self_directed', 'collaborative', 'analytical',
        'global', 'large_pharma',
        NOW(), NOW()
    ) RETURNING id INTO persona_id_var;
    
    -- Pain Points for Orchestrator MSL
    INSERT INTO public.persona_pain_points (persona_id, pain_point_text, severity, created_at)
    VALUES 
        (persona_id_var, 'Synthesizing insights from 50+ KOL interactions across multiple therapeutic areas', 'high', NOW()),
        (persona_id_var, 'Coordinating strategic initiatives across Medical Affairs, Clinical, and Commercial', 'high', NOW()),
        (persona_id_var, 'Identifying patterns in KOL feedback to inform evidence generation strategy', 'medium', NOW()),
        (persona_id_var, 'Balancing multiple stakeholder perspectives in strategic planning', 'medium', NOW());
    
    -- Goals for Orchestrator MSL
    INSERT INTO public.persona_goals (persona_id, goal_text, priority, created_at)
    VALUES 
        (persona_id_var, 'Synthesize multi-source KOL intelligence to inform strategic evidence planning', 'high', NOW()),
        (persona_id_var, 'Coordinate cross-functional initiatives with Medical, Clinical, and Commercial', 'high', NOW()),
        (persona_id_var, 'Identify strategic opportunities from KOL ecosystem patterns', 'high', NOW()),
        (persona_id_var, 'Build comprehensive KOL engagement strategies across therapeutic areas', 'medium', NOW());
    
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
        'Dr. Emily Park - MSL Learner',
        'dr-emily-park-msl-learner',
        'Medical Science Liaison',
        'Early-Career Field Medical Professional',
        'LEARNER',
        msl_role_id, medical_affairs_function_id, field_medical_dept_id, pharma_tenant_id,
        'entry', 2, 0, 0,
        'routine', 'late_majority', 'conservative', 'moderate',
        25.0, 20.0,
        'guided', 'collaborative', 'collaborative',
        'local', 'mid_size_pharma',
        NOW(), NOW()
    ) RETURNING id INTO persona_id_var;
    
    -- Pain Points for Learner MSL
    INSERT INTO public.persona_pain_points (persona_id, pain_point_text, severity, created_at)
    VALUES 
        (persona_id_var, 'Uncertain about best practices for KOL engagement and scientific exchange', 'high', NOW()),
        (persona_id_var, 'Overwhelmed by learning curve for MSL tools and processes', 'high', NOW()),
        (persona_id_var, 'Need step-by-step guidance for preparing scientific presentations', 'medium', NOW()),
        (persona_id_var, 'Unclear when to use different communication channels with KOLs', 'medium', NOW());
    
    -- Goals for Learner MSL
    INSERT INTO public.persona_goals (persona_id, goal_text, priority, created_at)
    VALUES 
        (persona_id_var, 'Learn MSL best practices and standard operating procedures', 'high', NOW()),
        (persona_id_var, 'Build confidence in scientific communication and KOL engagement', 'high', NOW()),
        (persona_id_var, 'Understand when and how to use different tools and resources', 'high', NOW()),
        (persona_id_var, 'Complete tasks correctly without making compliance errors', 'medium', NOW());
    
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
        'Dr. James Thompson - MSL Skeptic',
        'dr-james-thompson-msl-skeptic',
        'Senior Medical Science Liaison',
        'Compliance-Focused Medical Affairs Leader',
        'SKEPTIC',
        msl_role_id, medical_affairs_function_id, field_medical_dept_id, pharma_tenant_id,
        'senior', 18, 12, 1000000,
        'strategic', 'laggard', 'very_conservative', 'low',
        30.0, 78.0,
        'guided', 'collaborative', 'authoritative',
        'global', 'large_pharma',
        NOW(), NOW()
    ) RETURNING id INTO persona_id_var;
    
    -- Pain Points for Skeptic MSL
    INSERT INTO public.persona_pain_points (persona_id, pain_point_text, severity, created_at)
    VALUES 
        (persona_id_var, 'Cannot trust AI-generated scientific content without full source verification', 'high', NOW()),
        (persona_id_var, 'Compliance risks too high for automated KOL communications', 'high', NOW()),
        (persona_id_var, 'Need to maintain quality control and medical accuracy standards', 'high', NOW()),
        (persona_id_var, 'Reputation depends on getting scientific information exactly right', 'high', NOW());
    
    -- Goals for Skeptic MSL
    INSERT INTO public.persona_goals (persona_id, goal_text, priority, created_at)
    VALUES 
        (persona_id_var, 'Ensure all AI-generated content is medically accurate and fully cited', 'high', NOW()),
        (persona_id_var, 'Maintain compliance and regulatory standards in all KOL interactions', 'high', NOW()),
        (persona_id_var, 'Validate all recommendations with human medical review', 'high', NOW()),
        (persona_id_var, 'Preserve proven workflows that ensure quality and compliance', 'medium', NOW());
    
    RAISE NOTICE 'Created 4 MECE personas for Medical Science Liaison role';
END $$;

COMMIT;

