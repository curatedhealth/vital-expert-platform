-- ============================================================================
-- PERSONA SEED TEMPLATE - Gold Standard
-- ============================================================================
-- Purpose: Template for creating 4 MECE personas for any role
-- Version: 1.0.0
-- Date: 2025-11-28
-- ============================================================================
-- 
-- USAGE INSTRUCTIONS:
-- 1. Copy this template
-- 2. Replace {ROLE_NAME}, {ROLE_SLUG}, and other placeholders
-- 3. Fill in the 4 archetype personas (Automator, Orchestrator, Learner, Skeptic)
-- 4. Populate junction tables as needed
-- 5. Run verification queries at the end
--
-- PLACEHOLDER REFERENCE:
-- {TENANT_SLUG}         - 'pharma', 'digital-health', etc.
-- {ROLE_NAME}           - 'Medical Science Liaison', 'Medical Director', etc.
-- {ROLE_SLUG}           - 'medical-science-liaison', 'medical-director', etc.
-- {FUNCTION_NAME}       - 'Medical Affairs', 'Sales', etc.
-- {DEPARTMENT_NAME}     - 'Field Medical', 'Clinical Development', etc.
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: DISABLE TRIGGERS (Temporary)
-- ============================================================================
-- Note: The trigger recalculates gen_ai_readiness_level which can cause issues
-- We'll re-enable it at the end

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_gen_ai_readiness' AND tgrelid = 'personas'::regclass) THEN
        ALTER TABLE public.personas DISABLE TRIGGER trigger_update_gen_ai_readiness;
    END IF;
END $$;

-- ============================================================================
-- STEP 2: VARIABLE DECLARATION & LOOKUP
-- ============================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_role_id UUID;
    v_function_id UUID;
    v_department_id UUID;
    
    -- Persona IDs for the 4 archetypes
    v_automator_id UUID;
    v_orchestrator_id UUID;
    v_learner_id UUID;
    v_skeptic_id UUID;
BEGIN
    
    -- ========================================================================
    -- Lookup organizational entities
    -- ========================================================================
    
    SELECT id INTO v_tenant_id 
    FROM public.tenants 
    WHERE slug IN ('{TENANT_SLUG}', 'pharma', 'pharmaceuticals') 
    LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant not found: {TENANT_SLUG}';
    END IF;
    
    SELECT id INTO v_function_id 
    FROM public.org_functions 
    WHERE slug = '{FUNCTION_SLUG}' OR name ILIKE '%{FUNCTION_NAME}%'
    LIMIT 1;
    
    SELECT id INTO v_department_id 
    FROM public.org_departments 
    WHERE slug = '{DEPARTMENT_SLUG}' OR name ILIKE '%{DEPARTMENT_NAME}%'
    LIMIT 1;
    
    SELECT id INTO v_role_id 
    FROM public.org_roles 
    WHERE slug = '{ROLE_SLUG}' OR name ILIKE '%{ROLE_NAME}%'
    LIMIT 1;
    
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Function ID: %', v_function_id;
    RAISE NOTICE 'Department ID: %', v_department_id;
    RAISE NOTICE 'Role ID: %', v_role_id;
    
    -- ========================================================================
    -- Cleanup existing personas for this role (idempotent)
    -- ========================================================================
    
    DELETE FROM public.personas 
    WHERE tenant_id = v_tenant_id 
        AND role_name = '{ROLE_NAME}';
    
    RAISE NOTICE 'Cleaned up existing personas for role: {ROLE_NAME}';
    
    -- ========================================================================
    -- PERSONA 1: AUTOMATOR (High AI + Routine Work)
    -- ========================================================================
    -- Characteristics:
    -- - AI Maturity Score: 70-85 (High)
    -- - Work Complexity Score: 20-45 (Routine)
    -- - Preferred Service Layer: WORKFLOWS
    -- - Focus: Efficiency, automation, streamlining processes
    -- ========================================================================
    
    INSERT INTO public.personas (
        -- Core Identity
        name, slug, title, tagline, one_liner,
        archetype, archetype_confidence, work_pattern,
        ai_maturity_score, work_complexity_score,
        
        -- Organizational Context
        tenant_id, role_id, function_id, department_id,
        role_name, role_slug,
        function_name, function_slug,
        department_name, department_slug,
        
        -- Professional Profile
        seniority_level, years_of_experience, years_in_current_role,
        typical_organization_size, geographic_scope,
        team_size_typical, direct_reports,
        
        -- Behavioral Attributes
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, work_arrangement,
        
        -- Gen AI Profile
        preferred_service_layer, gen_ai_adoption_score, gen_ai_trust_score,
        gen_ai_usage_frequency, gen_ai_primary_use_case,
        
        -- Narrative
        background_story, a_day_in_the_life,
        
        -- Salary Data (optional)
        salary_min_usd, salary_max_usd, salary_median_usd,
        salary_currency, salary_year,
        
        -- Metadata
        is_active, validation_status, created_at, updated_at
    ) VALUES (
        -- Core Identity
        '{FIRST_NAME} {LAST_NAME} - {ROLE_NAME} Automator',
        '{first-name}-{last-name}-{role-slug}-automator',
        '{ROLE_NAME}, {SPECIALTY}',
        '{TAGLINE}',
        '{ONE_LINER_DESCRIPTION}',
        'AUTOMATOR', 0.85, 'routine',
        75.0, 35.0,
        
        -- Organizational Context
        v_tenant_id, v_role_id, v_function_id, v_department_id,
        '{ROLE_NAME}', '{ROLE_SLUG}',
        '{FUNCTION_NAME}', '{FUNCTION_SLUG}',
        '{DEPARTMENT_NAME}', '{DEPARTMENT_SLUG}',
        
        -- Professional Profile
        '{SENIORITY_LEVEL}', {YEARS_EXPERIENCE}, {YEARS_IN_ROLE},
        '{ORG_SIZE}', '{GEOGRAPHIC_SCOPE}',
        {TEAM_SIZE}, {DIRECT_REPORTS},
        
        -- Behavioral Attributes
        'early_adopter', 'moderate', 'high',
        '{DECISION_STYLE}', '{LEARNING_STYLE}', '{WORK_ARRANGEMENT}',
        
        -- Gen AI Profile
        'WORKFLOWS', 80.0, 75.0,
        'Daily', '{GEN_AI_USE_CASE}',
        
        -- Narrative
        '{BACKGROUND_STORY}',
        '{DAY_IN_LIFE}',
        
        -- Salary Data
        {SALARY_MIN}, {SALARY_MAX}, {SALARY_MEDIAN},
        'USD', 2024,
        
        -- Metadata
        true, 'draft', NOW(), NOW()
    ) RETURNING id INTO v_automator_id;
    
    RAISE NOTICE 'Created Automator persona: %', v_automator_id;
    
    -- ========================================================================
    -- PERSONA 2: ORCHESTRATOR (High AI + Strategic Work)
    -- ========================================================================
    -- Characteristics:
    -- - AI Maturity Score: 80-95 (Very High)
    -- - Work Complexity Score: 70-90 (Strategic)
    -- - Preferred Service Layer: ASK_PANEL or SOLUTION_BUILDER
    -- - Focus: Vision, coordination, strategic transformation
    -- ========================================================================
    
    INSERT INTO public.personas (
        name, slug, title, tagline, one_liner,
        archetype, archetype_confidence, work_pattern,
        ai_maturity_score, work_complexity_score,
        tenant_id, role_id, function_id, department_id,
        role_name, function_name, department_name,
        seniority_level, years_of_experience,
        technology_adoption, risk_tolerance, change_readiness,
        preferred_service_layer, gen_ai_adoption_score,
        is_active, created_at, updated_at
    ) VALUES (
        '{NAME} - {ROLE_NAME} Orchestrator',
        '{slug}-orchestrator',
        '{TITLE}',
        '{TAGLINE}',
        '{ONE_LINER}',
        'ORCHESTRATOR', 0.88, 'strategic',
        85.0, 80.0,
        v_tenant_id, v_role_id, v_function_id, v_department_id,
        '{ROLE_NAME}', '{FUNCTION_NAME}', '{DEPARTMENT_NAME}',
        '{SENIORITY}', {YEARS_EXP},
        'innovator', 'high', 'very_high',
        'ASK_PANEL', 90.0,
        true, NOW(), NOW()
    ) RETURNING id INTO v_orchestrator_id;
    
    RAISE NOTICE 'Created Orchestrator persona: %', v_orchestrator_id;
    
    -- ========================================================================
    -- PERSONA 3: LEARNER (Low AI + Routine Work)
    -- ========================================================================
    -- Characteristics:
    -- - AI Maturity Score: 20-40 (Low)
    -- - Work Complexity Score: 20-45 (Routine)
    -- - Preferred Service Layer: ASK_EXPERT
    -- - Focus: Learning, following best practices, building confidence
    -- ========================================================================
    
    INSERT INTO public.personas (
        name, slug, title, tagline, one_liner,
        archetype, archetype_confidence, work_pattern,
        ai_maturity_score, work_complexity_score,
        tenant_id, role_id, function_id, department_id,
        role_name, function_name, department_name,
        seniority_level, years_of_experience,
        technology_adoption, risk_tolerance, change_readiness,
        preferred_service_layer, gen_ai_adoption_score,
        is_active, created_at, updated_at
    ) VALUES (
        '{NAME} - {ROLE_NAME} Learner',
        '{slug}-learner',
        '{TITLE}',
        '{TAGLINE}',
        '{ONE_LINER}',
        'LEARNER', 0.80, 'routine',
        32.0, 35.0,
        v_tenant_id, v_role_id, v_function_id, v_department_id,
        '{ROLE_NAME}', '{FUNCTION_NAME}', '{DEPARTMENT_NAME}',
        'entry', {YEARS_EXP},
        'early_majority', 'low', 'moderate',
        'ASK_EXPERT', 35.0,
        true, NOW(), NOW()
    ) RETURNING id INTO v_learner_id;
    
    RAISE NOTICE 'Created Learner persona: %', v_learner_id;
    
    -- ========================================================================
    -- PERSONA 4: SKEPTIC (Low AI + Strategic Work)
    -- ========================================================================
    -- Characteristics:
    -- - AI Maturity Score: 20-35 (Low)
    -- - Work Complexity Score: 70-90 (Strategic)
    -- - Preferred Service Layer: ASK_PANEL
    -- - Focus: Caution, compliance, proven methods, risk mitigation
    -- ========================================================================
    
    INSERT INTO public.personas (
        name, slug, title, tagline, one_liner,
        archetype, archetype_confidence, work_pattern,
        ai_maturity_score, work_complexity_score,
        tenant_id, role_id, function_id, department_id,
        role_name, function_name, department_name,
        seniority_level, years_of_experience,
        technology_adoption, risk_tolerance, change_readiness,
        preferred_service_layer, gen_ai_adoption_score,
        is_active, created_at, updated_at
    ) VALUES (
        '{NAME} - {ROLE_NAME} Skeptic',
        '{slug}-skeptic',
        '{TITLE}',
        '{TAGLINE}',
        '{ONE_LINER}',
        'SKEPTIC', 0.82, 'strategic',
        28.0, 78.0,
        v_tenant_id, v_role_id, v_function_id, v_department_id,
        '{ROLE_NAME}', '{FUNCTION_NAME}', '{DEPARTMENT_NAME}',
        'senior', {YEARS_EXP},
        'late_majority', 'low', 'low',
        'ASK_PANEL', 30.0,
        true, NOW(), NOW()
    ) RETURNING id INTO v_skeptic_id;
    
    RAISE NOTICE 'Created Skeptic persona: %', v_skeptic_id;
    
    -- ========================================================================
    -- JUNCTION TABLES (Optional but recommended)
    -- ========================================================================
    
    -- Pain Points (3-5 per persona)
    INSERT INTO public.persona_pain_points (
        persona_id, tenant_id, pain_point, category, severity, 
        frequency, is_ai_addressable, sequence_order
    ) VALUES
        (v_automator_id, v_tenant_id, '{PAIN_POINT_1}', 'process', 'high', 'constantly', true, 1),
        (v_automator_id, v_tenant_id, '{PAIN_POINT_2}', 'time', 'moderate', 'frequently', true, 2);
    
    -- Goals (2-4 per persona)
    INSERT INTO public.persona_goals (
        persona_id, tenant_id, goal_text, goal_type, 
        priority, timeframe, is_measurable, sequence_order
    ) VALUES
        (v_automator_id, v_tenant_id, '{GOAL_1}', 'efficiency', 'high', 'short_term', true, 1),
        (v_automator_id, v_tenant_id, '{GOAL_2}', 'quality', 'medium', 'medium_term', true, 2);
    
    -- VPANES Scoring (1 per persona)
    INSERT INTO public.persona_vpanes_scoring (
        persona_id, tenant_id, visibility, pain, actions, 
        needs, emotions, scenarios, scoring_notes
    ) VALUES
        (v_automator_id, v_tenant_id, 8.0, 7.0, 8.0, 5.0, 6.0, 9.0, 
         'High automation potential, clear pain points');
    
    -- Typical Day Activities (8-12 per persona)
    INSERT INTO public.persona_typical_day (
        persona_id, tenant_id, time_slot, activity_description, 
        duration_minutes, is_ai_automatable, sort_order
    ) VALUES
        (v_automator_id, v_tenant_id, '07:00', '{ACTIVITY_1}', 30, true, 1),
        (v_automator_id, v_tenant_id, '08:00', '{ACTIVITY_2}', 60, true, 2);
    
    -- Success Metrics (3-5 per persona)
    INSERT INTO public.persona_success_metrics (
        persona_id, tenant_id, metric_name, metric_description, sequence_order
    ) VALUES
        (v_automator_id, v_tenant_id, '{METRIC_1}', '{METRIC_1_DESC}', 1),
        (v_automator_id, v_tenant_id, '{METRIC_2}', '{METRIC_2_DESC}', 2);
    
    -- Repeat for other personas...
    
END $$;

-- ============================================================================
-- STEP 3: RE-ENABLE TRIGGERS
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_gen_ai_readiness' AND tgrelid = 'personas'::regclass) THEN
        ALTER TABLE public.personas ENABLE TRIGGER trigger_update_gen_ai_readiness;
    END IF;
END $$;

-- ============================================================================
-- STEP 4: VERIFICATION QUERIES
-- ============================================================================

-- Check created personas
SELECT 
    name,
    archetype,
    ai_maturity_score,
    work_complexity_score,
    preferred_service_layer
FROM public.personas
WHERE role_name = '{ROLE_NAME}'
ORDER BY 
    CASE archetype
        WHEN 'AUTOMATOR' THEN 1
        WHEN 'ORCHESTRATOR' THEN 2
        WHEN 'LEARNER' THEN 3
        WHEN 'SKEPTIC' THEN 4
    END;

-- Check junction table counts
SELECT 
    'Pain Points' as table_name,
    COUNT(*) as count
FROM public.persona_pain_points pp
JOIN public.personas p ON pp.persona_id = p.id
WHERE p.role_name = '{ROLE_NAME}'

UNION ALL

SELECT 
    'Goals',
    COUNT(*)
FROM public.persona_goals pg
JOIN public.personas p ON pg.persona_id = p.id
WHERE p.role_name = '{ROLE_NAME}'

UNION ALL

SELECT 
    'VPANES Scores',
    COUNT(*)
FROM public.persona_vpanes_scoring pv
JOIN public.personas p ON pv.persona_id = p.id
WHERE p.role_name = '{ROLE_NAME}';

COMMIT;

-- ============================================================================
-- SEED COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Verify personas were created correctly
-- 2. Add additional junction table data as needed
-- 3. Update validation_status to 'validated' when ready
-- ============================================================================
