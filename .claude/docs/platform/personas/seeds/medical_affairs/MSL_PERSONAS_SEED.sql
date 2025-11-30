-- ============================================================================
-- MEDICAL SCIENCE LIAISON (MSL) - 4 MECE PERSONAS (COMPLETE)
-- ============================================================================
-- Version: 2.0.0
-- Last Updated: November 28, 2025
-- Status: Production Ready
-- Description: Complete MSL personas with all junction tables and rich data
-- ============================================================================

BEGIN;

-- Temporarily disable the problematic trigger
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_gen_ai_readiness' AND tgrelid = 'personas'::regclass) THEN
        ALTER TABLE public.personas DISABLE TRIGGER trigger_update_gen_ai_readiness;
    END IF;
END $$;

DO $$
DECLARE
    v_tenant_id UUID;
    v_role_id UUID;
    v_function_id UUID;
    v_department_id UUID;
    
    -- Persona IDs
    v_automator_id UUID;
    v_orchestrator_id UUID;
    v_learner_id UUID;
    v_skeptic_id UUID;
BEGIN
    
    -- ========================================================================
    -- LOOKUP ORGANIZATIONAL ENTITIES
    -- ========================================================================
    
    SELECT id INTO v_tenant_id 
    FROM public.tenants 
    WHERE slug IN ('pharma', 'pharmaceuticals') 
    LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharma tenant not found';
    END IF;
    
    SELECT id INTO v_function_id 
    FROM public.org_functions 
    WHERE slug = 'medical-affairs' OR name ILIKE '%medical affairs%'
    LIMIT 1;
    
    SELECT id INTO v_department_id 
    FROM public.org_departments 
    WHERE slug = 'field-medical' OR name ILIKE '%field medical%'
    LIMIT 1;
    
    SELECT id INTO v_role_id 
    FROM public.org_roles 
    WHERE slug = 'medical-science-liaison' OR name ILIKE '%medical science liaison%'
    LIMIT 1;
    
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Function ID: %', v_function_id;
    RAISE NOTICE 'Department ID: %', v_department_id;
    RAISE NOTICE 'Role ID: %', v_role_id;
    
    -- ========================================================================
    -- CLEANUP EXISTING MSL PERSONAS (Idempotent)
    -- ========================================================================
    
    DELETE FROM public.personas 
    WHERE tenant_id = v_tenant_id 
        AND (role_name ILIKE '%medical science liaison%' OR slug LIKE '%msl-%');
    
    RAISE NOTICE 'Cleaned up existing MSL personas';
    
    -- ========================================================================
    -- PERSONA 1: AUTOMATOR (High AI + Routine Work)
    -- ========================================================================
    -- AI Maturity: 75 | Work Complexity: 35 | Service Layer: WORKFLOWS
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
        years_in_industry, years_in_function,
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
        
        -- Salary Data
        salary_min_usd, salary_max_usd, salary_median_usd,
        salary_currency, salary_year,
        
        -- Metadata
        is_active, validation_status, created_at, updated_at
    ) VALUES (
        -- Core Identity
        'Dr. Sarah Chen - MSL Automator',
        'dr-sarah-chen-msl-automator',
        'Medical Science Liaison, Oncology',
        'Efficiency-Driven Field Medical Expert',
        'Regional MSL who automates routine tasks to maximize KOL engagement time',
        'AUTOMATOR', 0.85, 'routine',
        75.0, 35.0,
        
        -- Organizational Context
        v_tenant_id, v_role_id, v_function_id, v_department_id,
        'Medical Science Liaison', 'medical-science-liaison',
        'Medical Affairs', 'medical-affairs',
        'Field Medical', 'field-medical',
        
        -- Professional Profile
        'mid', 6, 3,
        6, 6,
        'Large (1000+ employees)', 'Regional (US Northeast)',
        0, 0,
        
        -- Behavioral Attributes
        'early_adopter', 'moderate', 'high',
        'Data-driven, pragmatic', 'Hands-on, experiential', 'Hybrid (40% travel)',
        
        -- Gen AI Profile
        'WORKFLOWS', 80.0, 75.0,
        'Daily', 'Automating CRM updates, literature monitoring, and presentation prep',
        
        -- Narrative
        E'Dr. Chen transitioned from clinical research to Medical Affairs 6 years ago. After spending countless hours on CRM data entry and literature searches, she became an early adopter of AI tools. She now uses AI workflows to automate routine tasks, freeing up 10+ hours weekly for high-value KOL interactions. Her efficiency gains have made her a role model for the regional team.',
        E'6:00 AM - AI tool reviews overnight literature alerts\n7:00 AM - Quick review of AI-flagged relevant studies\n8:00 AM - KOL meeting prep using AI-generated briefing\n10:00 AM - Virtual KOL advisory board\n12:00 PM - Lunch while AI transcribes morning meeting\n1:00 PM - Review AI-drafted follow-up emails\n2:00 PM - Field visit with sales rep\n4:00 PM - AI assists with CRM updates\n5:00 PM - AI-powered dashboard review\n6:00 PM - Evening planning with AI task prioritization',
        
        -- Salary Data
        140000, 180000, 160000,
        'USD', 2024,
        
        -- Metadata
        true, 'draft', NOW(), NOW()
    ) RETURNING id INTO v_automator_id;
    
    RAISE NOTICE 'Created Automator: %', v_automator_id;
    
    -- ========================================================================
    -- PERSONA 2: ORCHESTRATOR (High AI + Strategic Work)
    -- ========================================================================
    -- AI Maturity: 82 | Work Complexity: 75 | Service Layer: ASK_PANEL
    -- ========================================================================
    
    INSERT INTO public.personas (
        name, slug, title, tagline, one_liner,
        archetype, archetype_confidence, work_pattern,
        ai_maturity_score, work_complexity_score,
        tenant_id, role_id, function_id, department_id,
        role_name, function_name, department_name,
        seniority_level, years_of_experience, years_in_current_role,
        typical_organization_size, geographic_scope,
        team_size_typical, direct_reports,
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, work_arrangement,
        preferred_service_layer, gen_ai_adoption_score, gen_ai_trust_score,
        gen_ai_usage_frequency, gen_ai_primary_use_case,
        background_story, a_day_in_the_life,
        salary_min_usd, salary_max_usd, salary_median_usd,
        salary_currency, salary_year,
        is_active, validation_status, created_at, updated_at
    ) VALUES (
        'Dr. Michael Rodriguez - MSL Orchestrator',
        'dr-michael-rodriguez-msl-orchestrator',
        'Senior Medical Science Liaison, Global Immunology',
        'Strategic KOL Ecosystem Architect',
        'Senior MSL orchestrating AI-powered KOL engagement across multiple countries',
        'ORCHESTRATOR', 0.88, 'strategic',
        82.0, 75.0,
        v_tenant_id, v_role_id, v_function_id, v_department_id,
        'Senior Medical Science Liaison', 'Medical Affairs', 'Field Medical',
        'senior', 12, 5,
        'Large (1000+ employees)', 'Global',
        8, 3,
        'innovator', 'high', 'very_high',
        'Collaborative, strategic', 'Continuous learning', 'Hybrid (50% travel)',
        'ASK_PANEL', 90.0, 85.0,
        'Daily', 'Multi-agent KOL mapping, congress planning, and strategic insight generation',
        E'Dr. Rodriguez has been at the forefront of Medical Affairs digital transformation. He pioneered the use of AI for KOL network analysis and now leads a global team. His AI-augmented approach has doubled KOL engagement efficiency and improved scientific exchange quality. He regularly speaks at industry conferences about AI in Medical Affairs.',
        E'5:30 AM - AI panel reviews global overnight activity\n7:00 AM - Asia team sync via AI-assisted call\n8:30 AM - Strategic planning with AI scenario modeling\n10:00 AM - KOL advisory board planning\n12:00 PM - AI-curated competitive intelligence review\n2:00 PM - Cross-functional leadership meeting\n4:00 PM - Mentor junior MSLs on AI tools\n6:00 PM - Evening congress prep with AI content analysis',
        180000, 240000, 210000,
        'USD', 2024,
        true, 'validated', NOW(), NOW()
    ) RETURNING id INTO v_orchestrator_id;
    
    RAISE NOTICE 'Created Orchestrator: %', v_orchestrator_id;
    
    -- ========================================================================
    -- PERSONA 3: LEARNER (Low AI + Routine Work)
    -- ========================================================================
    -- AI Maturity: 32 | Work Complexity: 28 | Service Layer: ASK_EXPERT
    -- ========================================================================
    
    INSERT INTO public.personas (
        name, slug, title, tagline, one_liner,
        archetype, archetype_confidence, work_pattern,
        ai_maturity_score, work_complexity_score,
        tenant_id, role_id, function_id, department_id,
        role_name, function_name, department_name,
        seniority_level, years_of_experience, years_in_current_role,
        typical_organization_size, geographic_scope,
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, work_arrangement,
        preferred_service_layer, gen_ai_adoption_score, gen_ai_trust_score,
        gen_ai_usage_frequency, gen_ai_primary_use_case,
        background_story, a_day_in_the_life,
        salary_min_usd, salary_max_usd, salary_median_usd,
        salary_currency, salary_year,
        is_active, validation_status, created_at, updated_at
    ) VALUES (
        'Dr. Emily Park - MSL Learner',
        'dr-emily-park-msl-learner',
        'Medical Science Liaison, Cardiology',
        'Early-Career Field Medical Professional',
        'New MSL learning to balance scientific rigor with AI efficiency',
        'LEARNER', 0.80, 'routine',
        32.0, 28.0,
        v_tenant_id, v_role_id, v_function_id, v_department_id,
        'Medical Science Liaison', 'Medical Affairs', 'Field Medical',
        'entry', 2, 2,
        'Mid-size (200-1000 employees)', 'Local (Greater Boston)',
        'early_majority', 'low', 'moderate',
        'Seeks guidance, cautious', 'Structured training', 'Hybrid (30% travel)',
        'ASK_EXPERT', 35.0, 45.0,
        'Weekly', 'Simple Q&A for protocol clarification and basic literature review',
        E'Fresh from a postdoc, Dr. Park joined Medical Affairs 2 years ago. She''s eager to learn but feels overwhelmed by the volume of work. She''s just starting to explore AI tools recommended by colleagues but prefers step-by-step guidance. Her manager is encouraging her to try workflow automation to reduce administrative burden.',
        E'7:00 AM - Manual literature search (1.5 hours)\n8:30 AM - CRM data entry from yesterday\n9:30 AM - Prep for KOL meeting\n11:00 AM - KOL lunch meeting\n1:00 PM - Write up meeting notes manually\n2:30 PM - Team training on new products\n4:00 PM - More CRM updates\n5:30 PM - Email catch-up',
        120000, 150000, 135000,
        'USD', 2024,
        true, 'validated', NOW(), NOW()
    ) RETURNING id INTO v_learner_id;
    
    RAISE NOTICE 'Created Learner: %', v_learner_id;
    
    -- ========================================================================
    -- PERSONA 4: SKEPTIC (Low AI + Strategic Work)
    -- ========================================================================
    -- AI Maturity: 28 | Work Complexity: 78 | Service Layer: ASK_PANEL
    -- ========================================================================
    
    INSERT INTO public.personas (
        name, slug, title, tagline, one_liner,
        archetype, archetype_confidence, work_pattern,
        ai_maturity_score, work_complexity_score,
        tenant_id, role_id, function_id, department_id,
        role_name, function_name, department_name,
        seniority_level, years_of_experience, years_in_current_role,
        typical_organization_size, geographic_scope,
        team_size_typical, direct_reports,
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, work_arrangement,
        preferred_service_layer, gen_ai_adoption_score, gen_ai_trust_score,
        gen_ai_usage_frequency, gen_ai_primary_use_case,
        background_story, a_day_in_the_life,
        salary_min_usd, salary_max_usd, salary_median_usd,
        salary_currency, salary_year,
        is_active, validation_status, created_at, updated_at
    ) VALUES (
        'Dr. James Thompson - MSL Skeptic',
        'dr-james-thompson-msl-skeptic',
        'Principal Medical Science Liaison, Regulatory Focus',
        'Compliance-Focused Medical Affairs Leader',
        'Veteran MSL prioritizing regulatory compliance over AI efficiency',
        'SKEPTIC', 0.82, 'strategic',
        28.0, 78.0,
        v_tenant_id, v_role_id, v_function_id, v_department_id,
        'Principal Medical Science Liaison', 'Medical Affairs', 'Field Medical',
        'senior', 18, 8,
        'Large (1000+ employees)', 'Global',
        12, 5,
        'late_majority', 'very_low', 'low',
        'Risk-averse, methodical', 'Traditional classroom', 'Hybrid (40% travel)',
        'ASK_PANEL', 30.0, 35.0,
        'Monthly', 'Only for regulatory-approved Q&A when required by management',
        E'Dr. Thompson has been with the company for 18 years and remembers when MSLs didn''t even use email regularly. He''s concerned about AI compliance risks and prefers proven, manual methods. However, he recognizes his approach is time-intensive and is under pressure to "modernize." He''ll adopt AI if he can verify it meets regulatory standards.',
        E'6:00 AM - Manual email review\n8:00 AM - Prepare compliance-reviewed materials\n9:30 AM - High-level KOL strategic meeting\n11:30 AM - Cross-functional regulatory discussion\n1:00 PM - Lunch with compliance team\n2:00 PM - Review junior MSL submissions\n3:30 PM - Strategic planning meeting\n5:00 PM - Manual documentation\n6:30 PM - Evening calls with international KOLs',
        170000, 220000, 195000,
        'USD', 2024,
        true, 'validated', NOW(), NOW()
    ) RETURNING id INTO v_skeptic_id;
    
    RAISE NOTICE 'Created Skeptic: %', v_skeptic_id;
    
    -- ========================================================================
    -- JUNCTION TABLE DATA
    -- ========================================================================
    
    RAISE NOTICE 'Populating junction tables...';
    
    -- ------------------------------------------------------------------------
    -- PAIN POINTS
    -- ------------------------------------------------------------------------
    
    INSERT INTO public.persona_pain_points (
        persona_id, tenant_id, pain_point, category, severity, 
        frequency, is_ai_addressable, sequence_order
    ) VALUES
        -- Automator Pain Points
        (v_automator_id, v_tenant_id, 'Manual CRM data entry consumes 8+ hours weekly', 'process', 'high', 'constantly', true, 1),
        (v_automator_id, v_tenant_id, 'Repetitive literature searches for each KOL meeting', 'time', 'moderate', 'frequently', true, 2),
        (v_automator_id, v_tenant_id, 'Manual slide deck creation for presentations', 'process', 'moderate', 'frequently', true, 3),
        (v_automator_id, v_tenant_id, 'Difficulty tracking which KOLs need follow-up', 'organizational', 'moderate', 'often', true, 4),
        
        -- Orchestrator Pain Points
        (v_orchestrator_id, v_tenant_id, 'Fragmented KOL data across multiple systems', 'data', 'high', 'constantly', true, 1),
        (v_orchestrator_id, v_tenant_id, 'Difficulty identifying emerging thought leaders', 'data', 'high', 'frequently', true, 2),
        (v_orchestrator_id, v_tenant_id, 'Time zone coordination for global team', 'organizational', 'moderate', 'frequently', true, 3),
        (v_orchestrator_id, v_tenant_id, 'Competitive intelligence gathering is manual', 'process', 'moderate', 'often', true, 4),
        
        -- Learner Pain Points
        (v_learner_id, v_tenant_id, 'Overwhelmed by volume of new publications', 'knowledge', 'high', 'constantly', true, 1),
        (v_learner_id, v_tenant_id, 'Unsure which AI tools to trust', 'knowledge', 'high', 'constantly', false, 2),
        (v_learner_id, v_tenant_id, 'Lack of time for structured AI training', 'resource', 'moderate', 'often', false, 3),
        (v_learner_id, v_tenant_id, 'Fear of making mistakes with new technology', 'emotional', 'moderate', 'frequently', false, 4),
        
        -- Skeptic Pain Points
        (v_skeptic_id, v_tenant_id, 'Manual processes are extremely time-consuming', 'time', 'critical', 'constantly', true, 1),
        (v_skeptic_id, v_tenant_id, 'Regulatory concerns about AI-generated content', 'compliance', 'critical', 'constantly', false, 2),
        (v_skeptic_id, v_tenant_id, 'Team pressure to adopt unfamiliar technology', 'organizational', 'high', 'frequently', false, 3),
        (v_skeptic_id, v_tenant_id, 'Difficulty maintaining quality control at scale', 'quality', 'high', 'often', true, 4);
    
    RAISE NOTICE 'Created pain points';
    
    -- ------------------------------------------------------------------------
    -- GOALS
    -- ------------------------------------------------------------------------
    
    INSERT INTO public.persona_goals (
        persona_id, tenant_id, goal_text, goal_type, 
        priority, timeframe, is_measurable, sequence_order
    ) VALUES
        -- Automator Goals
        (v_automator_id, v_tenant_id, 'Automate call note generation to save 10+ hours/week', 'efficiency', 'high', 'short_term', true, 1),
        (v_automator_id, v_tenant_id, 'Streamline literature monitoring with AI alerts', 'efficiency', 'medium', 'short_term', true, 2),
        (v_automator_id, v_tenant_id, 'Increase face time with KOLs by 30%', 'quality', 'high', 'medium_term', true, 3),
        
        -- Orchestrator Goals
        (v_orchestrator_id, v_tenant_id, 'Build AI-powered KOL network analysis system', 'innovation', 'high', 'medium_term', true, 1),
        (v_orchestrator_id, v_tenant_id, 'Scale team efficiency globally through AI', 'efficiency', 'high', 'long_term', true, 2),
        (v_orchestrator_id, v_tenant_id, 'Become industry thought leader in AI Medical Affairs', 'career', 'medium', 'long_term', false, 3),
        
        -- Learner Goals
        (v_learner_id, v_tenant_id, 'Gain confidence using basic AI tools safely', 'learning', 'high', 'short_term', true, 1),
        (v_learner_id, v_tenant_id, 'Reduce admin time to spend more on learning science', 'efficiency', 'medium', 'medium_term', true, 2),
        (v_learner_id, v_tenant_id, 'Advance to mid-level MSL within 2 years', 'career', 'high', 'medium_term', false, 3),
        
        -- Skeptic Goals
        (v_skeptic_id, v_tenant_id, 'Ensure all AI usage meets regulatory standards', 'compliance', 'critical', 'short_term', true, 1),
        (v_skeptic_id, v_tenant_id, 'Maintain team quality while increasing efficiency', 'quality', 'high', 'medium_term', true, 2),
        (v_skeptic_id, v_tenant_id, 'Develop validated AI SOPs for Medical Affairs', 'compliance', 'high', 'long_term', true, 3);
    
    RAISE NOTICE 'Created goals';
    
    -- ------------------------------------------------------------------------
    -- MOTIVATIONS
    -- ------------------------------------------------------------------------
    
    INSERT INTO public.persona_motivations (
        persona_id, tenant_id, motivation_text, motivation_category, 
        importance, sequence_order
    ) VALUES
        -- Automator
        (v_automator_id, v_tenant_id, 'More time for meaningful scientific discussions', 'professional', 'critical', 1),
        (v_automator_id, v_tenant_id, 'Recognition as an efficiency leader', 'personal', 'high', 2),
        (v_automator_id, v_tenant_id, 'Help team adopt better workflows', 'organizational', 'medium', 3),
        
        -- Orchestrator
        (v_orchestrator_id, v_tenant_id, 'Transform Medical Affairs through innovation', 'professional', 'critical', 1),
        (v_orchestrator_id, v_tenant_id, 'Build legacy as AI pioneer in pharma', 'personal', 'high', 2),
        (v_orchestrator_id, v_tenant_id, 'Maximize global team impact', 'organizational', 'high', 3),
        
        -- Learner
        (v_learner_id, v_tenant_id, 'Prove capability in new career', 'personal', 'critical', 1),
        (v_learner_id, v_tenant_id, 'Learn from experienced mentors', 'professional', 'high', 2),
        (v_learner_id, v_tenant_id, 'Gain respect of scientific community', 'professional', 'high', 3),
        
        -- Skeptic
        (v_skeptic_id, v_tenant_id, 'Protect company from regulatory risk', 'organizational', 'critical', 1),
        (v_skeptic_id, v_tenant_id, 'Maintain high scientific standards', 'professional', 'critical', 2),
        (v_skeptic_id, v_tenant_id, 'Preserve reputation built over decades', 'personal', 'high', 3);
    
    RAISE NOTICE 'Created motivations';
    
    -- ------------------------------------------------------------------------
    -- VPANES SCORING
    -- ------------------------------------------------------------------------
    
    INSERT INTO public.persona_vpanes_scoring (
        persona_id, tenant_id, visibility, pain, actions, 
        needs, emotions, scenarios, scoring_notes
    ) VALUES
        (v_automator_id, v_tenant_id, 8.0, 7.0, 8.0, 5.0, 6.0, 9.0, 
         'High visibility: Regional MSL. Strong pain from manual work. Takes action readily. Clear automation scenarios.'),
        (v_orchestrator_id, v_tenant_id, 9.0, 6.0, 9.0, 8.0, 7.0, 9.0, 
         'Very high visibility: Senior role, global scope. Active innovator. Strategic needs. Multiple complex scenarios.'),
        (v_learner_id, v_tenant_id, 5.0, 8.0, 4.0, 7.0, 7.0, 5.0, 
         'Lower visibility: Entry level. High pain from overwhelm. Cautious action. Strong emotional component.'),
        (v_skeptic_id, v_tenant_id, 7.0, 9.0, 3.0, 6.0, 8.0, 6.0, 
         'Good visibility: Senior role. Critical pain from manual work. Very low action readiness. Strong concerns.');
    
    RAISE NOTICE 'Created VPANES scores';
    
    -- ------------------------------------------------------------------------
    -- SUCCESS METRICS
    -- ------------------------------------------------------------------------
    
    INSERT INTO public.persona_success_metrics (
        persona_id, tenant_id, metric_name, metric_description, sequence_order
    ) VALUES
        -- Automator
        (v_automator_id, v_tenant_id, 'Time saved on admin tasks', 'Weekly hours saved through automation (target: 10+ hours)', 1),
        (v_automator_id, v_tenant_id, 'KOL meeting frequency', 'Number of quality KOL interactions per month (target: 30+)', 2),
        (v_automator_id, v_tenant_id, 'Literature monitoring efficiency', 'Time to identify relevant publications (target: <1 hour/week)', 3),
        
        -- Orchestrator
        (v_orchestrator_id, v_tenant_id, 'Global KOL coverage', 'Percentage of tier 1 KOLs engaged quarterly (target: 95%)', 1),
        (v_orchestrator_id, v_tenant_id, 'Team AI adoption rate', 'Percentage of team using AI tools daily (target: 80%)', 2),
        (v_orchestrator_id, v_tenant_id, 'Strategic insight generation', 'Number of actionable insights from AI analysis (target: 20/month)', 3),
        
        -- Learner
        (v_learner_id, v_tenant_id, 'AI tool proficiency', 'Number of AI tools used confidently (target: 3 within 6 months)', 1),
        (v_learner_id, v_tenant_id, 'Administrative time reduction', 'Percentage reduction in admin work (target: 25% within 1 year)', 2),
        (v_learner_id, v_tenant_id, 'Manager satisfaction score', 'Quarterly performance rating (target: meets/exceeds expectations)', 3),
        
        -- Skeptic
        (v_skeptic_id, v_tenant_id, 'Regulatory compliance rate', 'Percentage of AI usage meeting regulatory standards (target: 100%)', 1),
        (v_skeptic_id, v_tenant_id, 'Team output quality', 'Quality score of team deliverables (target: maintain 9/10 avg)', 2),
        (v_skeptic_id, v_tenant_id, 'Process efficiency', 'Time saved while maintaining quality (target: 15% reduction)', 3);
    
    RAISE NOTICE 'Created success metrics';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MSL PERSONA SEEDING COMPLETE';
    RAISE NOTICE '4 Personas created with full junction table data';
    RAISE NOTICE '========================================';
    
END $$;

-- Re-enable the trigger
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_gen_ai_readiness' AND tgrelid = 'personas'::regclass) THEN
        ALTER TABLE public.personas ENABLE TRIGGER trigger_update_gen_ai_readiness;
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check personas
SELECT 
    '=== CREATED PERSONAS ===' as section,
    name,
    archetype,
    ROUND(ai_maturity_score::numeric, 0) as ai_maturity,
    ROUND(work_complexity_score::numeric, 0) as work_complexity,
    preferred_service_layer,
    seniority_level
FROM public.personas
WHERE slug LIKE '%msl-%'
ORDER BY 
    CASE archetype 
        WHEN 'AUTOMATOR' THEN 1 
        WHEN 'ORCHESTRATOR' THEN 2 
        WHEN 'LEARNER' THEN 3 
        WHEN 'SKEPTIC' THEN 4 
    END;

-- Check junction table counts
SELECT 
    '=== JUNCTION TABLE COUNTS ===' as section,
    'Pain Points' as table_name,
    COUNT(*) as count
FROM public.persona_pain_points pp
JOIN public.personas p ON pp.persona_id = p.id
WHERE p.slug LIKE '%msl-%'

UNION ALL

SELECT 
    '=== JUNCTION TABLE COUNTS ===',
    'Goals',
    COUNT(*)
FROM public.persona_goals pg
JOIN public.personas p ON pg.persona_id = p.id
WHERE p.slug LIKE '%msl-%'

UNION ALL

SELECT 
    '=== JUNCTION TABLE COUNTS ===',
    'Motivations',
    COUNT(*)
FROM public.persona_motivations pm
JOIN public.personas p ON pm.persona_id = p.id
WHERE p.slug LIKE '%msl-%'

UNION ALL

SELECT 
    '=== JUNCTION TABLE COUNTS ===',
    'VPANES Scores',
    COUNT(*)
FROM public.persona_vpanes_scoring pv
JOIN public.personas p ON pv.persona_id = p.id
WHERE p.slug LIKE '%msl-%'

UNION ALL

SELECT 
    '=== JUNCTION TABLE COUNTS ===',
    'Success Metrics',
    COUNT(*)
FROM public.persona_success_metrics psm
JOIN public.personas p ON psm.persona_id = p.id
WHERE p.slug LIKE '%msl-%';

-- Check VPANES scores
SELECT 
    '=== VPANES SCORES ===' as section,
    p.name,
    v.visibility,
    v.pain,
    v.actions,
    v.needs,
    v.emotions,
    v.scenarios,
    v.total_score,
    v.priority_tier
FROM public.persona_vpanes_scoring v
JOIN public.personas p ON v.persona_id = p.id
WHERE p.slug LIKE '%msl-%'
ORDER BY v.total_score DESC;

COMMIT;

-- ============================================================================
-- SEED COMPLETE - MSL PERSONAS v2.0.0
-- ============================================================================
-- Next steps:
-- 1. Verify personas and junction data above
-- 2. Add additional junction tables as needed (typical_day, tools_used, etc.)
-- 3. Update validation_status to 'published' when ready for production
-- ============================================================================
