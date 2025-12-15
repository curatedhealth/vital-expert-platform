-- ============================================================================
-- COMPLETE MEDICAL AFFAIRS PERSONAS DEPLOYMENT
-- Run this file to deploy all 8 personas (MSL + Medical Director)
-- Version: 1.0 | Date: 2025-11-27
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Get Required IDs
-- ============================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_msl_role_id UUID;
    v_md_role_id UUID;
    v_function_id UUID;
    v_department_id UUID;
    v_persona_id UUID;
BEGIN
    -- Get Pharma tenant ID
    SELECT id INTO v_tenant_id FROM tenants WHERE slug IN ('pharma', 'pharmaceuticals') LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        -- Create tenant if not exists
        INSERT INTO tenants (name, slug, industry, type)
        VALUES ('Pharmaceuticals', 'pharma', 'Pharmaceutical', 'client')
        RETURNING id INTO v_tenant_id;
        RAISE NOTICE 'Created pharma tenant: %', v_tenant_id;
    END IF;
    
    -- Get or create Medical Affairs function
    SELECT id INTO v_function_id FROM org_functions WHERE name::text ILIKE '%medical%affairs%' LIMIT 1;
    
    -- Get or create MSL role
    SELECT id INTO v_msl_role_id FROM org_roles WHERE slug ILIKE '%medical-science-liaison%' OR name ILIKE '%Medical Science Liaison%' LIMIT 1;
    
    -- Get or create Medical Director role
    SELECT id INTO v_md_role_id FROM org_roles WHERE slug ILIKE '%medical-director%' OR name ILIKE '%Medical Director%' LIMIT 1;
    
    -- Get Field Medical department
    SELECT id INTO v_department_id FROM org_departments WHERE name ILIKE '%field%medical%' OR name ILIKE '%medical%affairs%' LIMIT 1;

    RAISE NOTICE 'Using tenant_id: %', v_tenant_id;
    RAISE NOTICE 'Using function_id: %', v_function_id;
    RAISE NOTICE 'Using msl_role_id: %', v_msl_role_id;
    RAISE NOTICE 'Using md_role_id: %', v_md_role_id;

    -- ========================================================================
    -- MSL PERSONA 1: AUTOMATOR
    -- ========================================================================
    
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline, archetype,
        role_id, role_name, role_slug,
        function_id, function_name,
        department_id, department_name,
        seniority_level, years_of_experience,
        education_level, geographic_scope, typical_organization_size,
        work_pattern, work_complexity_score, ai_maturity_score,
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, collaboration_style,
        preferred_service_layer, budget_authority_level,
        direct_reports, team_size_typical,
        vpanes_scores,
        is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id,
        'Dr. Sarah Chen - MSL Automator',
        'dr-sarah-chen-msl-automator',
        'Medical Science Liaison',
        'Efficiency-Driven Field Medical Expert',
        'AUTOMATOR',
        v_msl_role_id, 'Medical Science Liaison', 'medical-science-liaison',
        v_function_id, 'Medical Affairs',
        v_department_id, 'Field Medical',
        'mid', 6,
        ARRAY['PharmD', 'PhD'], 'regional', 'Large Pharma',
        'routine', 35, 75,
        'early_adopter', 'moderate', 'high',
        'analytical', 'hands_on', 'independent',
        'WORKFLOWS', 'limited',
        0, 0,
        '{"visibility": 8, "pain": 7, "actions": 8, "needs": 5, "emotions": 6, "scenarios": 9}'::jsonb,
        true, NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_persona_id;

    -- MSL Automator: Typical Day Activities
    INSERT INTO persona_typical_day_activities (persona_id, activity_name, activity_category, time_of_day, duration_hours, is_routine, automation_potential, display_order) VALUES
        (v_persona_id, 'Review AI-curated overnight literature alerts', 'focus_work', 'morning', 0.5, true, 'high', 1),
        (v_persona_id, 'Prepare for KOL meeting using AI-generated talking points', 'focus_work', 'morning', 0.5, true, 'high', 2),
        (v_persona_id, 'Conduct scientific exchange with oncology KOL', 'meeting', 'morning', 1.0, false, 'low', 3),
        (v_persona_id, 'Log meeting notes using voice-to-text AI transcription', 'admin', 'midday', 0.25, true, 'high', 4),
        (v_persona_id, 'Auto-generate medical insights report from meeting', 'focus_work', 'midday', 0.25, true, 'high', 5),
        (v_persona_id, 'Review and approve AI-drafted follow-up email to KOL', 'admin', 'midday', 0.25, true, 'high', 6),
        (v_persona_id, 'Attend virtual Medical Affairs team sync', 'meeting', 'afternoon', 0.75, false, 'low', 7),
        (v_persona_id, 'Update KOL database with AI-enriched data', 'admin', 'afternoon', 0.5, true, 'high', 8),
        (v_persona_id, 'Review AI-curated competitive intelligence digest', 'focus_work', 'afternoon', 0.5, true, 'high', 9),
        (v_persona_id, 'Plan next day using AI-suggested priorities', 'admin', 'afternoon', 0.25, true, 'high', 10)
    ON CONFLICT DO NOTHING;

    -- MSL Automator: Motivations
    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Maximize time spent on high-value KOL interactions', 'intrinsic', 'efficiency', 'very_strong', true),
        (v_persona_id, 'Eliminate repetitive administrative tasks', 'extrinsic', 'efficiency', 'strong', true),
        (v_persona_id, 'Stay current with rapidly evolving scientific literature', 'intrinsic', 'mastery', 'strong', true),
        (v_persona_id, 'Deliver more insights to Medical Affairs leadership', 'achievement', 'impact', 'moderate', true),
        (v_persona_id, 'Be recognized as a tech-savvy MSL leader', 'social', 'recognition', 'moderate', true)
    ON CONFLICT DO NOTHING;

    -- MSL Automator: Frustrations
    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Spending 8+ hours weekly on manual CRM data entry', 'process', 'major', 'constant', true),
        (v_persona_id, 'Repetitive literature searches for similar topics', 'process', 'major', 'frequent', true),
        (v_persona_id, 'Manual slide deck creation for each KOL meeting', 'tool', 'moderate', 'frequent', true),
        (v_persona_id, 'Copying data between disconnected systems', 'tool', 'major', 'constant', true),
        (v_persona_id, 'Writing similar follow-up emails repeatedly', 'process', 'moderate', 'frequent', true),
        (v_persona_id, 'Manually formatting meeting notes and reports', 'process', 'moderate', 'frequent', true),
        (v_persona_id, 'Tracking KOL interactions across multiple platforms', 'tool', 'moderate', 'frequent', true),
        (v_persona_id, 'Limited time for strategic thinking due to admin burden', 'time', 'major', 'constant', true)
    ON CONFLICT DO NOTHING;

    -- MSL Automator: Goals
    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Automate call note generation to save 10+ hours/week', 'efficiency', 'high', 'short_term', true),
        (v_persona_id, 'Streamline literature monitoring with AI alerts', 'efficiency', 'high', 'short_term', true),
        (v_persona_id, 'Eliminate manual data entry through workflow automation', 'efficiency', 'high', 'medium_term', true),
        (v_persona_id, 'Scale KOL engagement without proportional time increase', 'growth', 'medium', 'medium_term', true),
        (v_persona_id, 'Become the go-to MSL for AI-powered field medical', 'career', 'medium', 'long_term', true)
    ON CONFLICT DO NOTHING;

    -- MSL Automator: Skills
    INSERT INTO persona_skills (persona_id, skill_name, skill_category, proficiency_level, importance_to_role) VALUES
        (v_persona_id, 'Oncology therapeutic expertise', 'domain', 'expert', 'critical'),
        (v_persona_id, 'Scientific communication', 'soft_skill', 'advanced', 'critical'),
        (v_persona_id, 'KOL relationship management', 'soft_skill', 'advanced', 'critical'),
        (v_persona_id, 'Clinical data interpretation', 'technical', 'advanced', 'important'),
        (v_persona_id, 'CRM systems (Veeva, Salesforce)', 'tool', 'advanced', 'important'),
        (v_persona_id, 'AI tools and automation', 'tool', 'intermediate', 'useful'),
        (v_persona_id, 'Literature database searching', 'technical', 'advanced', 'important'),
        (v_persona_id, 'Presentation and public speaking', 'soft_skill', 'advanced', 'important')
    ON CONFLICT DO NOTHING;

    -- MSL Automator: Tools Used
    INSERT INTO persona_tools_used (persona_id, tool_name, tool_category, usage_frequency, proficiency_level) VALUES
        (v_persona_id, 'Veeva CRM', 'crm', 'daily', 'expert'),
        (v_persona_id, 'PubMed', 'research', 'daily', 'expert'),
        (v_persona_id, 'Microsoft PowerPoint', 'productivity', 'daily', 'advanced'),
        (v_persona_id, 'Outlook/Email', 'communication', 'daily', 'advanced'),
        (v_persona_id, 'Zoom/Teams', 'communication', 'daily', 'advanced'),
        (v_persona_id, 'ChatGPT/Claude', 'ai', 'daily', 'intermediate'),
        (v_persona_id, 'Grammarly', 'productivity', 'daily', 'intermediate'),
        (v_persona_id, 'EndNote/Reference Manager', 'research', 'weekly', 'advanced')
    ON CONFLICT DO NOTHING;

    -- MSL Automator: Success Metrics
    INSERT INTO persona_success_metrics (persona_id, metric_name, metric_category, measurement_frequency, target_value) VALUES
        (v_persona_id, 'KOL interactions per month', 'activity', 'monthly', '40+'),
        (v_persona_id, 'Medical insights submitted', 'output', 'monthly', '15+'),
        (v_persona_id, 'Time saved through automation', 'efficiency', 'weekly', '10+ hours'),
        (v_persona_id, 'KOL satisfaction scores', 'quality', 'quarterly', '4.5+/5')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created MSL Automator persona: %', v_persona_id;

    -- ========================================================================
    -- MSL PERSONA 2: ORCHESTRATOR
    -- ========================================================================
    
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline, archetype,
        role_id, role_name, role_slug,
        function_id, function_name,
        department_id, department_name,
        seniority_level, years_of_experience,
        education_level, geographic_scope, typical_organization_size,
        work_pattern, work_complexity_score, ai_maturity_score,
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, collaboration_style,
        preferred_service_layer, budget_authority_level,
        direct_reports, team_size_typical,
        vpanes_scores,
        is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id,
        'Dr. Michael Rodriguez - MSL Orchestrator',
        'dr-michael-rodriguez-msl-orchestrator',
        'Senior Medical Science Liaison',
        'Strategic KOL Ecosystem Architect',
        'ORCHESTRATOR',
        v_msl_role_id, 'Medical Science Liaison', 'medical-science-liaison',
        v_function_id, 'Medical Affairs',
        v_department_id, 'Field Medical',
        'senior', 12,
        ARRAY['MD', 'PhD'], 'global', 'Large Pharma',
        'strategic', 75, 82,
        'innovator', 'high', 'very_high',
        'analytical', 'self_directed', 'collaborative',
        'SOLUTION_BUILDER', 'moderate',
        3, 8,
        '{"visibility": 9, "pain": 8, "actions": 9, "needs": 7, "emotions": 7, "scenarios": 8}'::jsonb,
        true, NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_persona_id;

    -- MSL Orchestrator: Typical Day Activities
    INSERT INTO persona_typical_day_activities (persona_id, activity_name, activity_category, time_of_day, duration_hours, is_routine, automation_potential, display_order) VALUES
        (v_persona_id, 'Review AI-synthesized KOL ecosystem intelligence', 'focus_work', 'morning', 0.75, false, 'medium', 1),
        (v_persona_id, 'Strategic planning session with AI multi-agent panel', 'focus_work', 'morning', 1.5, false, 'medium', 2),
        (v_persona_id, 'Lead cross-functional launch strategy meeting', 'meeting', 'morning', 1.0, false, 'low', 3),
        (v_persona_id, 'Conduct scientific advisory board with top KOLs', 'meeting', 'midday', 2.0, false, 'low', 4),
        (v_persona_id, 'Analyze competitive intelligence with AI predictive models', 'focus_work', 'afternoon', 1.0, false, 'medium', 5),
        (v_persona_id, 'Coach junior MSLs on AI-powered engagement strategies', 'meeting', 'afternoon', 0.75, false, 'low', 6),
        (v_persona_id, 'Review AI-generated scenario analysis for market access', 'focus_work', 'afternoon', 0.75, false, 'medium', 7),
        (v_persona_id, 'Strategic call with VP Medical Affairs', 'meeting', 'afternoon', 0.5, false, 'low', 8)
    ON CONFLICT DO NOTHING;

    -- MSL Orchestrator: Motivations
    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Drive competitive advantage through AI-powered insights', 'intrinsic', 'impact', 'very_strong', true),
        (v_persona_id, 'Establish thought leadership in AI-enabled Medical Affairs', 'achievement', 'recognition', 'strong', true),
        (v_persona_id, 'Transform how pharmaceutical companies engage with KOLs', 'intrinsic', 'impact', 'strong', true),
        (v_persona_id, 'Mentor next generation of AI-savvy MSLs', 'social', 'growth', 'moderate', true),
        (v_persona_id, 'Synthesize complex multi-source intelligence at scale', 'intrinsic', 'mastery', 'strong', true)
    ON CONFLICT DO NOTHING;

    -- MSL Orchestrator: Frustrations
    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Synthesizing insights from 100+ KOL interactions across regions', 'information', 'major', 'constant', true),
        (v_persona_id, 'Coordinating strategic initiatives across Medical, Clinical, Commercial', 'organizational', 'major', 'frequent', true),
        (v_persona_id, 'Identifying patterns in KOL feedback to inform evidence strategy', 'information', 'moderate', 'frequent', true),
        (v_persona_id, 'Limited tools for multi-source intelligence synthesis', 'tool', 'major', 'constant', true),
        (v_persona_id, 'Slow organizational adoption of AI capabilities', 'organizational', 'moderate', 'constant', false)
    ON CONFLICT DO NOTHING;

    -- MSL Orchestrator: Goals
    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Build AI-powered KOL intelligence platform for the team', 'innovation', 'high', 'medium_term', true),
        (v_persona_id, 'Synthesize multi-source intelligence to inform evidence strategy', 'strategic', 'high', 'short_term', true),
        (v_persona_id, 'Establish company as leader in AI-enabled medical engagement', 'strategic', 'high', 'long_term', true),
        (v_persona_id, 'Train team of 10 MSLs on advanced AI workflows', 'leadership', 'medium', 'short_term', true)
    ON CONFLICT DO NOTHING;

    -- MSL Orchestrator: Skills
    INSERT INTO persona_skills (persona_id, skill_name, skill_category, proficiency_level, importance_to_role) VALUES
        (v_persona_id, 'Strategic planning and execution', 'soft_skill', 'expert', 'critical'),
        (v_persona_id, 'Multi-stakeholder relationship management', 'soft_skill', 'expert', 'critical'),
        (v_persona_id, 'AI/ML concepts and applications', 'technical', 'advanced', 'important'),
        (v_persona_id, 'Data synthesis and analysis', 'technical', 'expert', 'critical'),
        (v_persona_id, 'Executive communication', 'soft_skill', 'expert', 'critical'),
        (v_persona_id, 'Oncology/Immunology therapeutic expertise', 'domain', 'expert', 'critical'),
        (v_persona_id, 'Team leadership and coaching', 'soft_skill', 'advanced', 'important')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created MSL Orchestrator persona: %', v_persona_id;

    -- ========================================================================
    -- MSL PERSONA 3: LEARNER
    -- ========================================================================
    
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline, archetype,
        role_id, role_name, role_slug,
        function_id, function_name,
        department_id, department_name,
        seniority_level, years_of_experience,
        education_level, geographic_scope, typical_organization_size,
        work_pattern, work_complexity_score, ai_maturity_score,
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, collaboration_style,
        preferred_service_layer, budget_authority_level,
        direct_reports, team_size_typical,
        vpanes_scores,
        is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id,
        'Dr. Emily Park - MSL Learner',
        'dr-emily-park-msl-learner',
        'Medical Science Liaison',
        'Early-Career Field Medical Professional',
        'LEARNER',
        v_msl_role_id, 'Medical Science Liaison', 'medical-science-liaison',
        v_function_id, 'Medical Affairs',
        v_department_id, 'Field Medical',
        'entry', 2,
        ARRAY['PharmD'], 'local', 'Mid-Size Pharma',
        'routine', 28, 32,
        'late_majority', 'low', 'moderate',
        'collaborative', 'guided', 'collaborative',
        'ASK_EXPERT', 'none',
        0, 0,
        '{"visibility": 5, "pain": 6, "actions": 4, "needs": 3, "emotions": 5, "scenarios": 7}'::jsonb,
        true, NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_persona_id;

    -- MSL Learner: Typical Day Activities
    INSERT INTO persona_typical_day_activities (persona_id, activity_name, activity_category, time_of_day, duration_hours, is_routine, automation_potential, display_order) VALUES
        (v_persona_id, 'Review daily schedule and prepare materials manually', 'admin', 'morning', 0.75, true, 'high', 1),
        (v_persona_id, 'Study product information and clinical data', 'focus_work', 'morning', 1.5, true, 'medium', 2),
        (v_persona_id, 'Shadow senior MSL on KOL meeting', 'meeting', 'morning', 1.5, false, 'low', 3),
        (v_persona_id, 'Manual literature search on PubMed', 'focus_work', 'midday', 1.0, true, 'high', 4),
        (v_persona_id, 'Write meeting notes by hand/typing', 'admin', 'midday', 0.5, true, 'high', 5),
        (v_persona_id, 'Attend training webinar on MSL best practices', 'meeting', 'afternoon', 1.0, false, 'low', 6),
        (v_persona_id, 'Update CRM with supervisor guidance', 'admin', 'afternoon', 0.75, true, 'high', 7),
        (v_persona_id, 'Debrief with manager on daily activities', 'meeting', 'afternoon', 0.5, false, 'low', 8)
    ON CONFLICT DO NOTHING;

    -- MSL Learner: Motivations
    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Build confidence in scientific communication', 'intrinsic', 'growth', 'very_strong', true),
        (v_persona_id, 'Learn MSL best practices and workflows', 'intrinsic', 'mastery', 'very_strong', true),
        (v_persona_id, 'Avoid making mistakes that could harm KOL relationships', 'extrinsic', 'efficiency', 'strong', true),
        (v_persona_id, 'Get promoted to senior MSL within 3 years', 'achievement', 'growth', 'strong', false)
    ON CONFLICT DO NOTHING;

    -- MSL Learner: Frustrations
    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Uncertain about best practices for KOL engagement', 'information', 'major', 'frequent', true),
        (v_persona_id, 'Overwhelmed by learning curve for MSL tools and processes', 'tool', 'major', 'constant', true),
        (v_persona_id, 'Need step-by-step guidance for scientific presentations', 'process', 'moderate', 'frequent', true),
        (v_persona_id, 'Fear of providing incorrect scientific information', 'personal', 'major', 'frequent', true),
        (v_persona_id, 'Difficulty finding relevant information quickly', 'tool', 'moderate', 'frequent', true)
    ON CONFLICT DO NOTHING;

    -- MSL Learner: Goals
    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Master MSL fundamentals and standard operating procedures', 'learning', 'high', 'short_term', true),
        (v_persona_id, 'Build confidence in scientific communication with KOLs', 'growth', 'high', 'short_term', true),
        (v_persona_id, 'Understand how to use CRM and literature tools effectively', 'learning', 'high', 'short_term', true),
        (v_persona_id, 'Conduct first independent KOL meeting successfully', 'growth', 'medium', 'short_term', true)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created MSL Learner persona: %', v_persona_id;

    -- ========================================================================
    -- MSL PERSONA 4: SKEPTIC
    -- ========================================================================
    
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline, archetype,
        role_id, role_name, role_slug,
        function_id, function_name,
        department_id, department_name,
        seniority_level, years_of_experience,
        education_level, geographic_scope, typical_organization_size,
        work_pattern, work_complexity_score, ai_maturity_score,
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, collaboration_style,
        preferred_service_layer, budget_authority_level,
        direct_reports, team_size_typical,
        vpanes_scores,
        is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id,
        'Dr. James Thompson - MSL Skeptic',
        'dr-james-thompson-msl-skeptic',
        'Principal Medical Science Liaison',
        'Compliance-Focused Medical Affairs Leader',
        'SKEPTIC',
        v_msl_role_id, 'Medical Science Liaison', 'medical-science-liaison',
        v_function_id, 'Medical Affairs',
        v_department_id, 'Field Medical',
        'senior', 18,
        ARRAY['MD', 'MBA'], 'global', 'Large Pharma',
        'strategic', 78, 28,
        'laggard', 'low', 'low',
        'authoritative', 'structured', 'collaborative',
        'ASK_EXPERT', 'significant',
        8, 12,
        '{"visibility": 6, "pain": 5, "actions": 3, "needs": 6, "emotions": 4, "scenarios": 6}'::jsonb,
        true, NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_persona_id;

    -- MSL Skeptic: Typical Day Activities
    INSERT INTO persona_typical_day_activities (persona_id, activity_name, activity_category, time_of_day, duration_hours, is_routine, automation_potential, display_order) VALUES
        (v_persona_id, 'Review team reports and compliance documentation', 'admin', 'morning', 1.0, true, 'medium', 1),
        (v_persona_id, 'Strategic planning meeting with Medical Director', 'meeting', 'morning', 1.5, false, 'low', 2),
        (v_persona_id, 'High-stakes KOL advisory board facilitation', 'meeting', 'morning', 2.0, false, 'low', 3),
        (v_persona_id, 'Review and approve team scientific materials', 'focus_work', 'midday', 1.5, false, 'low', 4),
        (v_persona_id, 'Phone calls with key investigators', 'meeting', 'afternoon', 1.0, false, 'low', 5),
        (v_persona_id, 'Compliance review of MSL activities', 'admin', 'afternoon', 0.75, true, 'medium', 6),
        (v_persona_id, 'Mentor junior MSLs on complex situations', 'meeting', 'afternoon', 0.75, false, 'low', 7)
    ON CONFLICT DO NOTHING;

    -- MSL Skeptic: Motivations
    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Maintain highest standards of scientific accuracy', 'intrinsic', 'mastery', 'very_strong', true),
        (v_persona_id, 'Protect company reputation through rigorous compliance', 'extrinsic', 'efficiency', 'very_strong', false),
        (v_persona_id, 'Preserve proven methods that ensure quality', 'intrinsic', 'efficiency', 'strong', false),
        (v_persona_id, 'Ensure AI does not replace human judgment in critical decisions', 'intrinsic', 'impact', 'strong', false)
    ON CONFLICT DO NOTHING;

    -- MSL Skeptic: Frustrations
    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'AI tools that lack transparency in their reasoning', 'tool', 'major', 'frequent', true),
        (v_persona_id, 'Pressure to adopt AI before it is proven reliable', 'organizational', 'major', 'frequent', false),
        (v_persona_id, 'Concerns about AI errors damaging KOL relationships', 'process', 'major', 'occasional', true),
        (v_persona_id, 'Technology that creates more work than it saves', 'tool', 'moderate', 'frequent', true),
        (v_persona_id, 'AI that does not understand nuance and context', 'tool', 'moderate', 'frequent', true)
    ON CONFLICT DO NOTHING;

    -- MSL Skeptic: Goals
    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Ensure all AI-generated content is medically accurate and cited', 'compliance', 'high', 'ongoing', true),
        (v_persona_id, 'Maintain compliance and regulatory standards in all KOL interactions', 'compliance', 'high', 'ongoing', false),
        (v_persona_id, 'Validate all AI recommendations with human medical review', 'quality', 'high', 'ongoing', true),
        (v_persona_id, 'Gradually adopt AI with appropriate human oversight', 'innovation', 'low', 'long_term', true)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created MSL Skeptic persona: %', v_persona_id;

    -- ========================================================================
    -- MEDICAL DIRECTOR PERSONA 1: AUTOMATOR
    -- ========================================================================
    
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline, archetype,
        role_id, role_name, role_slug, function_id, function_name, department_id, department_name,
        seniority_level, years_of_experience, education_level, geographic_scope, typical_organization_size,
        work_pattern, work_complexity_score, ai_maturity_score,
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, collaboration_style,
        preferred_service_layer, budget_authority_level, direct_reports, team_size_typical,
        vpanes_scores, is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id, 'Dr. Amanda Foster - Medical Director Automator', 'dr-amanda-foster-medical-director-automator',
        'Medical Director, Oncology', 'Data-Driven Medical Strategy Leader',
        'AUTOMATOR', v_md_role_id, 'Medical Director', 'medical-director',
        v_function_id, 'Medical Affairs', v_department_id, 'Medical Affairs',
        'director', 14, ARRAY['MD', 'PhD'], 'regional', 'Large Pharma',
        'mixed', 45, 78,
        'early_adopter', 'moderate', 'high',
        'data_driven', 'hands_on', 'collaborative',
        'WORKFLOWS', 'moderate', 15, 25,
        '{"visibility": 8, "pain": 7, "actions": 8, "needs": 6, "emotions": 5, "scenarios": 8}'::jsonb,
        true, NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_persona_id;

    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Streamline team operations through intelligent automation', 'intrinsic', 'efficiency', 'very_strong', true),
        (v_persona_id, 'Make data-driven decisions faster', 'intrinsic', 'impact', 'strong', true),
        (v_persona_id, 'Free up time for strategic thinking', 'extrinsic', 'efficiency', 'strong', true),
        (v_persona_id, 'Lead Medical Affairs digital transformation', 'achievement', 'recognition', 'moderate', true)
    ON CONFLICT DO NOTHING;

    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Manual compilation of team metrics and reports', 'process', 'major', 'frequent', true),
        (v_persona_id, 'Time spent on administrative coordination', 'process', 'major', 'constant', true),
        (v_persona_id, 'Inconsistent data across multiple systems', 'tool', 'moderate', 'frequent', true),
        (v_persona_id, 'Delayed access to competitive intelligence', 'information', 'moderate', 'frequent', true)
    ON CONFLICT DO NOTHING;

    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Automate 50% of routine reporting tasks', 'efficiency', 'high', 'short_term', true),
        (v_persona_id, 'Implement AI-powered KOL intelligence system', 'innovation', 'high', 'medium_term', true),
        (v_persona_id, 'Reduce medical content review cycle by 40%', 'efficiency', 'medium', 'medium_term', true)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created Medical Director Automator persona: %', v_persona_id;

    -- ========================================================================
    -- MEDICAL DIRECTOR PERSONA 2: ORCHESTRATOR
    -- ========================================================================
    
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline, archetype,
        role_id, role_name, role_slug, function_id, function_name, department_id, department_name,
        seniority_level, years_of_experience, education_level, geographic_scope, typical_organization_size,
        work_pattern, work_complexity_score, ai_maturity_score,
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, collaboration_style,
        preferred_service_layer, budget_authority_level, direct_reports, team_size_typical,
        vpanes_scores, is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id, 'Dr. Robert Martinez - Medical Director Orchestrator', 'dr-robert-martinez-medical-director-orchestrator',
        'Medical Director, Global Immunology', 'AI-Powered Strategic Medical Leader',
        'ORCHESTRATOR', v_md_role_id, 'Medical Director', 'medical-director',
        v_function_id, 'Medical Affairs', v_department_id, 'Medical Affairs',
        'director', 16, ARRAY['MD', 'MBA'], 'global', 'Large Pharma',
        'strategic', 82, 85,
        'innovator', 'high', 'very_high',
        'analytical', 'self_directed', 'facilitator',
        'SOLUTION_BUILDER', 'significant', 25, 40,
        '{"visibility": 9, "pain": 8, "actions": 9, "needs": 8, "emotions": 7, "scenarios": 8}'::jsonb,
        true, NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_persona_id;

    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Transform Medical Affairs through AI-powered intelligence', 'intrinsic', 'impact', 'very_strong', true),
        (v_persona_id, 'Drive competitive advantage through predictive insights', 'achievement', 'impact', 'very_strong', true),
        (v_persona_id, 'Establish industry-leading AI capabilities in medical strategy', 'achievement', 'recognition', 'strong', true)
    ON CONFLICT DO NOTHING;

    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Synthesizing insights across 200+ global KOL interactions', 'information', 'major', 'constant', true),
        (v_persona_id, 'Slow organizational adoption of AI capabilities', 'organizational', 'major', 'constant', false),
        (v_persona_id, 'Limited tools for multi-source strategic intelligence', 'tool', 'major', 'constant', true)
    ON CONFLICT DO NOTHING;

    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Build AI-powered global KOL intelligence platform', 'innovation', 'high', 'medium_term', true),
        (v_persona_id, 'Establish predictive analytics for competitive strategy', 'innovation', 'high', 'medium_term', true),
        (v_persona_id, 'Lead industry in AI-enabled medical engagement', 'strategic', 'high', 'long_term', true)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created Medical Director Orchestrator persona: %', v_persona_id;

    -- ========================================================================
    -- MEDICAL DIRECTOR PERSONA 3: LEARNER
    -- ========================================================================
    
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline, archetype,
        role_id, role_name, role_slug, function_id, function_name, department_id, department_name,
        seniority_level, years_of_experience, education_level, geographic_scope, typical_organization_size,
        work_pattern, work_complexity_score, ai_maturity_score,
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, collaboration_style,
        preferred_service_layer, budget_authority_level, direct_reports, team_size_typical,
        vpanes_scores, is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id, 'Dr. Jennifer Lee - Medical Director Learner', 'dr-jennifer-lee-medical-director-learner',
        'Medical Director, Neurology', 'Newly Promoted Medical Leader',
        'LEARNER', v_md_role_id, 'Medical Director', 'medical-director',
        v_function_id, 'Medical Affairs', v_department_id, 'Medical Affairs',
        'director', 10, ARRAY['PhD', 'PharmD'], 'regional', 'Mid-Size Pharma',
        'mixed', 42, 35,
        'late_majority', 'low', 'moderate',
        'collaborative', 'guided', 'collaborative',
        'ASK_EXPERT', 'limited', 8, 12,
        '{"visibility": 5, "pain": 6, "actions": 4, "needs": 4, "emotions": 5, "scenarios": 6}'::jsonb,
        true, NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_persona_id;

    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Succeed in new leadership role', 'intrinsic', 'growth', 'very_strong', true),
        (v_persona_id, 'Learn best practices for Medical Director responsibilities', 'intrinsic', 'mastery', 'very_strong', true),
        (v_persona_id, 'Build credibility with team and stakeholders', 'social', 'recognition', 'strong', true)
    ON CONFLICT DO NOTHING;

    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Steep learning curve for leadership responsibilities', 'personal', 'major', 'constant', true),
        (v_persona_id, 'Uncertainty about AI tools and when to use them', 'tool', 'moderate', 'frequent', true),
        (v_persona_id, 'Balancing operational tasks with strategic thinking', 'time', 'major', 'constant', true)
    ON CONFLICT DO NOTHING;

    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Master Medical Director responsibilities within first year', 'learning', 'high', 'short_term', true),
        (v_persona_id, 'Build strong relationships with team and stakeholders', 'growth', 'high', 'short_term', false),
        (v_persona_id, 'Learn AI tools with proper training and support', 'learning', 'medium', 'medium_term', true)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created Medical Director Learner persona: %', v_persona_id;

    -- ========================================================================
    -- MEDICAL DIRECTOR PERSONA 4: SKEPTIC
    -- ========================================================================
    
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline, archetype,
        role_id, role_name, role_slug, function_id, function_name, department_id, department_name,
        seniority_level, years_of_experience, education_level, geographic_scope, typical_organization_size,
        work_pattern, work_complexity_score, ai_maturity_score,
        technology_adoption, risk_tolerance, change_readiness,
        decision_making_style, learning_style, collaboration_style,
        preferred_service_layer, budget_authority_level, direct_reports, team_size_typical,
        vpanes_scores, is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id, 'Dr. William Chen - Medical Director Skeptic', 'dr-william-chen-medical-director-skeptic',
        'Medical Director, Cardiovascular', 'Compliance-First Medical Leader',
        'SKEPTIC', v_md_role_id, 'Medical Director', 'medical-director',
        v_function_id, 'Medical Affairs', v_department_id, 'Medical Affairs',
        'director', 20, ARRAY['MD', 'FACC'], 'global', 'Large Pharma',
        'strategic', 80, 25,
        'laggard', 'low', 'low',
        'authoritative', 'structured', 'director',
        'ASK_EXPERT', 'high', 20, 35,
        '{"visibility": 5, "pain": 4, "actions": 2, "needs": 6, "emotions": 3, "scenarios": 5}'::jsonb,
        true, NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_persona_id;

    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Maintain highest standards of medical accuracy', 'intrinsic', 'mastery', 'very_strong', true),
        (v_persona_id, 'Protect company from compliance risks', 'extrinsic', 'efficiency', 'very_strong', false),
        (v_persona_id, 'Ensure human judgment in critical medical decisions', 'intrinsic', 'impact', 'strong', false)
    ON CONFLICT DO NOTHING;

    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Pressure to adopt AI without proven track record', 'organizational', 'major', 'frequent', false),
        (v_persona_id, 'AI tools that lack transparency in reasoning', 'tool', 'major', 'frequent', true),
        (v_persona_id, 'Concerns about AI errors in medical content', 'process', 'major', 'occasional', true)
    ON CONFLICT DO NOTHING;

    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Ensure 100% compliance in all medical communications', 'compliance', 'high', 'ongoing', false),
        (v_persona_id, 'Maintain human oversight for all AI-generated content', 'quality', 'high', 'ongoing', true),
        (v_persona_id, 'Establish clear AI governance policies', 'compliance', 'medium', 'short_term', false)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created Medical Director Skeptic persona: %', v_persona_id;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'DEPLOYMENT COMPLETE!';
    RAISE NOTICE '8 Medical Affairs personas created:';
    RAISE NOTICE '- 4 MSL personas (Automator, Orchestrator, Learner, Skeptic)';
    RAISE NOTICE '- 4 Medical Director personas (Automator, Orchestrator, Learner, Skeptic)';
    RAISE NOTICE '========================================';

END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
    name,
    archetype,
    role_name,
    ai_maturity_score,
    work_complexity_score,
    preferred_service_layer
FROM personas 
WHERE function_name = 'Medical Affairs'
ORDER BY role_name, archetype;

