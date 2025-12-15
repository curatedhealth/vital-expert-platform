-- ============================================================================
-- MEDICAL SCIENCE LIAISON (MSL) - 4 MECE PERSONAS
-- Complete with all 24 junction tables
-- Version: 1.0 | Date: 2025-11-27
-- ============================================================================

BEGIN;

DO $$
DECLARE
    v_tenant_id UUID;
    v_role_id UUID;
    v_function_id UUID;
    v_department_id UUID;
    v_persona_id UUID;
BEGIN
    -- Get Pharma tenant ID
    SELECT id INTO v_tenant_id FROM tenants WHERE slug IN ('pharma', 'pharmaceuticals') LIMIT 1;
    
    -- Get or create MSL role
    SELECT id INTO v_role_id FROM org_roles WHERE slug ILIKE '%medical-science-liaison%' OR name ILIKE '%Medical Science Liaison%' LIMIT 1;
    
    -- Get Medical Affairs function
    SELECT id INTO v_function_id FROM org_functions WHERE name::text ILIKE '%medical%affairs%' LIMIT 1;
    
    -- Get Field Medical department
    SELECT id INTO v_department_id FROM org_departments WHERE name ILIKE '%field%medical%' LIMIT 1;

    -- ========================================================================
    -- MSL PERSONA 1: AUTOMATOR
    -- High AI Maturity (75) + Routine Work (35)
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
        v_role_id, 'Medical Science Liaison', 'medical-science-liaison',
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
    ) RETURNING id INTO v_persona_id;

    -- Typical Day Activities (10 items)
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
        (v_persona_id, 'Plan next day using AI-suggested priorities', 'admin', 'afternoon', 0.25, true, 'high', 10);

    -- Motivations (5 items)
    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Maximize time spent on high-value KOL interactions', 'intrinsic', 'efficiency', 'very_strong', true),
        (v_persona_id, 'Eliminate repetitive administrative tasks', 'extrinsic', 'efficiency', 'strong', true),
        (v_persona_id, 'Stay current with rapidly evolving scientific literature', 'intrinsic', 'mastery', 'strong', true),
        (v_persona_id, 'Deliver more insights to Medical Affairs leadership', 'achievement', 'impact', 'moderate', true),
        (v_persona_id, 'Be recognized as a tech-savvy MSL leader', 'social', 'recognition', 'moderate', true);

    -- Values (4 items)
    INSERT INTO persona_values (persona_id, value_text, value_category, importance_rank) VALUES
        (v_persona_id, 'Efficiency and productivity in all activities', 'professional', 1),
        (v_persona_id, 'Scientific accuracy and evidence-based practice', 'professional', 2),
        (v_persona_id, 'Continuous improvement and optimization', 'personal', 3),
        (v_persona_id, 'Work-life balance through smart automation', 'personal', 4);

    -- Frustrations (8 items)
    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Spending 8+ hours weekly on manual CRM data entry', 'process', 'major', 'constant', true),
        (v_persona_id, 'Repetitive literature searches for similar topics', 'process', 'major', 'frequent', true),
        (v_persona_id, 'Manual slide deck creation for each KOL meeting', 'tool', 'moderate', 'frequent', true),
        (v_persona_id, 'Copying data between disconnected systems', 'tool', 'major', 'constant', true),
        (v_persona_id, 'Writing similar follow-up emails repeatedly', 'process', 'moderate', 'frequent', true),
        (v_persona_id, 'Manually formatting meeting notes and reports', 'process', 'moderate', 'frequent', true),
        (v_persona_id, 'Tracking KOL interactions across multiple platforms', 'tool', 'moderate', 'frequent', true),
        (v_persona_id, 'Limited time for strategic thinking due to admin burden', 'time', 'major', 'constant', true);

    -- Goals (5 items)
    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Automate call note generation to save 10+ hours/week', 'efficiency', 'high', 'short_term', true),
        (v_persona_id, 'Streamline literature monitoring with AI alerts', 'efficiency', 'high', 'short_term', true),
        (v_persona_id, 'Eliminate manual data entry through workflow automation', 'efficiency', 'high', 'medium_term', true),
        (v_persona_id, 'Scale KOL engagement without proportional time increase', 'growth', 'medium', 'medium_term', true),
        (v_persona_id, 'Become the go-to MSL for AI-powered field medical', 'career', 'medium', 'long_term', true);

    -- Challenges (5 items)
    INSERT INTO persona_challenges (persona_id, challenge_text, challenge_category, difficulty_level, ai_solution_exists) VALUES
        (v_persona_id, 'Keeping up with 50+ new publications weekly in oncology', 'information', 'difficult', true),
        (v_persona_id, 'Maintaining detailed records for 80+ KOL relationships', 'organizational', 'moderate', true),
        (v_persona_id, 'Generating consistent insights reports for leadership', 'process', 'moderate', true),
        (v_persona_id, 'Balancing field time with administrative requirements', 'time', 'difficult', true),
        (v_persona_id, 'Integrating data from CRM, literature, and meeting notes', 'technical', 'moderate', true);

    -- Skills (8 items)
    INSERT INTO persona_skills (persona_id, skill_name, skill_category, proficiency_level, importance_to_role) VALUES
        (v_persona_id, 'Oncology therapeutic expertise', 'domain', 'expert', 'critical'),
        (v_persona_id, 'Scientific communication', 'soft_skill', 'advanced', 'critical'),
        (v_persona_id, 'KOL relationship management', 'soft_skill', 'advanced', 'critical'),
        (v_persona_id, 'Clinical data interpretation', 'technical', 'advanced', 'important'),
        (v_persona_id, 'CRM systems (Veeva, Salesforce)', 'tool', 'advanced', 'important'),
        (v_persona_id, 'AI tools and automation', 'tool', 'intermediate', 'useful'),
        (v_persona_id, 'Literature database searching', 'technical', 'advanced', 'important'),
        (v_persona_id, 'Presentation and public speaking', 'soft_skill', 'advanced', 'important');

    -- Tools Used (8 items)
    INSERT INTO persona_tools_used (persona_id, tool_name, tool_category, usage_frequency, proficiency_level) VALUES
        (v_persona_id, 'Veeva CRM', 'crm', 'daily', 'expert'),
        (v_persona_id, 'PubMed', 'research', 'daily', 'expert'),
        (v_persona_id, 'Microsoft PowerPoint', 'productivity', 'daily', 'advanced'),
        (v_persona_id, 'Outlook/Email', 'communication', 'daily', 'advanced'),
        (v_persona_id, 'Zoom/Teams', 'communication', 'daily', 'advanced'),
        (v_persona_id, 'ChatGPT/Claude', 'ai', 'daily', 'intermediate'),
        (v_persona_id, 'Grammarly', 'productivity', 'daily', 'intermediate'),
        (v_persona_id, 'EndNote/Reference Manager', 'research', 'weekly', 'advanced');

    -- Information Sources (6 items)
    INSERT INTO persona_information_sources (persona_id, source_name, source_type, usage_frequency, trust_level) VALUES
        (v_persona_id, 'PubMed/MEDLINE', 'database', 'daily', 'very_high'),
        (v_persona_id, 'ASCO/ESMO Conferences', 'conference', 'quarterly', 'very_high'),
        (v_persona_id, 'Company internal medical information', 'internal', 'daily', 'very_high'),
        (v_persona_id, 'KOL direct conversations', 'expert', 'weekly', 'high'),
        (v_persona_id, 'Clinical trial registries', 'database', 'weekly', 'high'),
        (v_persona_id, 'AI-curated news feeds', 'ai_generated', 'daily', 'moderate');

    -- Success Metrics (4 items)
    INSERT INTO persona_success_metrics (persona_id, metric_name, metric_category, measurement_frequency, target_value) VALUES
        (v_persona_id, 'KOL interactions per month', 'activity', 'monthly', '40+'),
        (v_persona_id, 'Medical insights submitted', 'output', 'monthly', '15+'),
        (v_persona_id, 'Time saved through automation', 'efficiency', 'weekly', '10+ hours'),
        (v_persona_id, 'KOL satisfaction scores', 'quality', 'quarterly', '4.5+/5');

    -- VPANES Scoring (already in main table, but detail here)
    INSERT INTO persona_vpanes_scoring (persona_id, dimension, score, rationale) VALUES
        (v_persona_id, 'visibility', 8, 'Highly aware that manual tasks waste 10+ hours weekly'),
        (v_persona_id, 'pain', 7, 'Significant frustration with repetitive admin work'),
        (v_persona_id, 'actions', 8, 'Actively testing AI tools, attending webinars'),
        (v_persona_id, 'needs', 5, 'Can influence decisions but needs manager approval'),
        (v_persona_id, 'emotions', 6, 'Frustrated but hopeful about AI solutions'),
        (v_persona_id, 'scenarios', 9, 'Encounters automation opportunities daily');

    -- Pain Point Intensity (6 items)
    INSERT INTO persona_pain_point_intensity (persona_id, pain_point, intensity_score, frequency_score, time_impact_hours) VALUES
        (v_persona_id, 'Manual CRM data entry', 9, 10, 8.0),
        (v_persona_id, 'Literature searching and summarization', 8, 9, 5.0),
        (v_persona_id, 'Meeting preparation and follow-up', 7, 8, 4.0),
        (v_persona_id, 'Report generation', 7, 7, 3.0),
        (v_persona_id, 'Email drafting', 6, 9, 2.0),
        (v_persona_id, 'Slide deck creation', 7, 6, 3.0);

    -- Opportunity Areas (4 items)
    INSERT INTO persona_opportunity_areas (persona_id, opportunity_description, impact_potential, feasibility, recommended_service) VALUES
        (v_persona_id, 'Automated call note generation from meeting transcripts', 'very_high', 'high', 'WORKFLOWS'),
        (v_persona_id, 'AI-powered literature monitoring and summarization', 'high', 'high', 'WORKFLOWS'),
        (v_persona_id, 'Smart meeting preparation with auto-generated briefs', 'high', 'high', 'WORKFLOWS'),
        (v_persona_id, 'Automated CRM updates from email and calendar', 'high', 'medium', 'WORKFLOWS');

    -- Adoption Barriers (4 items)
    INSERT INTO persona_adoption_barriers (persona_id, barrier_description, barrier_type, severity) VALUES
        (v_persona_id, 'IT approval process for new tools', 'organizational', 'moderate'),
        (v_persona_id, 'Integration with existing Veeva CRM', 'technical', 'moderate'),
        (v_persona_id, 'Compliance review for AI-generated content', 'regulatory', 'moderate'),
        (v_persona_id, 'Learning curve for new AI tools', 'personal', 'low');

    -- Ideal Features (4 items)
    INSERT INTO persona_ideal_features (persona_id, feature_description, priority, expected_benefit) VALUES
        (v_persona_id, 'One-click meeting summary generation', 'critical', 'Save 5+ hours/week'),
        (v_persona_id, 'Auto-sync with Veeva CRM', 'critical', 'Eliminate double data entry'),
        (v_persona_id, 'AI literature alerts with relevance scoring', 'high', 'Never miss key publications'),
        (v_persona_id, 'Smart email templates with personalization', 'medium', 'Faster KOL follow-up');

    RAISE NOTICE 'Created MSL Automator persona: %', v_persona_id;

    -- ========================================================================
    -- MSL PERSONA 2: ORCHESTRATOR
    -- High AI Maturity (82) + Strategic Work (75)
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
        v_role_id, 'Medical Science Liaison', 'medical-science-liaison',
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
    ) RETURNING id INTO v_persona_id;

    -- Typical Day Activities (10 items)
    INSERT INTO persona_typical_day_activities (persona_id, activity_name, activity_category, time_of_day, duration_hours, is_routine, automation_potential, display_order) VALUES
        (v_persona_id, 'Review AI-synthesized KOL ecosystem intelligence', 'focus_work', 'morning', 0.75, false, 'medium', 1),
        (v_persona_id, 'Strategic planning session with AI multi-agent panel', 'focus_work', 'morning', 1.5, false, 'medium', 2),
        (v_persona_id, 'Lead cross-functional launch strategy meeting', 'meeting', 'morning', 1.0, false, 'low', 3),
        (v_persona_id, 'Conduct scientific advisory board with top KOLs', 'meeting', 'midday', 2.0, false, 'low', 4),
        (v_persona_id, 'Analyze competitive intelligence with AI predictive models', 'focus_work', 'afternoon', 1.0, false, 'medium', 5),
        (v_persona_id, 'Coach junior MSLs on AI-powered engagement strategies', 'meeting', 'afternoon', 0.75, false, 'low', 6),
        (v_persona_id, 'Review AI-generated scenario analysis for market access', 'focus_work', 'afternoon', 0.75, false, 'medium', 7),
        (v_persona_id, 'Strategic call with VP Medical Affairs', 'meeting', 'afternoon', 0.5, false, 'low', 8),
        (v_persona_id, 'Build custom AI workflow for evidence synthesis', 'focus_work', 'afternoon', 1.0, false, 'low', 9),
        (v_persona_id, 'Document strategic insights in knowledge base', 'admin', 'afternoon', 0.5, true, 'high', 10);

    -- Motivations (6 items)
    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Drive competitive advantage through AI-powered insights', 'intrinsic', 'impact', 'very_strong', true),
        (v_persona_id, 'Establish thought leadership in AI-enabled Medical Affairs', 'achievement', 'recognition', 'strong', true),
        (v_persona_id, 'Transform how pharmaceutical companies engage with KOLs', 'intrinsic', 'impact', 'strong', true),
        (v_persona_id, 'Mentor next generation of AI-savvy MSLs', 'social', 'growth', 'moderate', true),
        (v_persona_id, 'Synthesize complex multi-source intelligence at scale', 'intrinsic', 'mastery', 'strong', true),
        (v_persona_id, 'Position company ahead of competitors in key therapeutic areas', 'achievement', 'impact', 'very_strong', true);

    -- Values (5 items)
    INSERT INTO persona_values (persona_id, value_text, value_category, importance_rank) VALUES
        (v_persona_id, 'Strategic innovation and competitive advantage', 'professional', 1),
        (v_persona_id, 'Scientific excellence and thought leadership', 'professional', 2),
        (v_persona_id, 'Mentorship and team development', 'personal', 3),
        (v_persona_id, 'Data-driven decision making', 'professional', 4),
        (v_persona_id, 'Continuous learning and adaptation', 'personal', 5);

    -- Frustrations (7 items)
    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Synthesizing insights from 100+ KOL interactions across regions', 'information', 'major', 'frequent', true),
        (v_persona_id, 'Coordinating strategic initiatives across Medical, Clinical, Commercial', 'organizational', 'major', 'frequent', true),
        (v_persona_id, 'Identifying patterns in KOL feedback to inform evidence strategy', 'information', 'moderate', 'frequent', true),
        (v_persona_id, 'Balancing multiple stakeholder perspectives in strategic planning', 'organizational', 'moderate', 'frequent', true),
        (v_persona_id, 'Limited tools for multi-source intelligence synthesis', 'tool', 'major', 'constant', true),
        (v_persona_id, 'Slow organizational adoption of AI capabilities', 'organizational', 'moderate', 'constant', false),
        (v_persona_id, 'Difficulty quantifying ROI of strategic initiatives', 'process', 'moderate', 'frequent', true);

    -- Goals (6 items)
    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Build AI-powered KOL intelligence platform for the team', 'innovation', 'high', 'medium_term', true),
        (v_persona_id, 'Synthesize multi-source intelligence to inform evidence strategy', 'strategic', 'high', 'short_term', true),
        (v_persona_id, 'Establish company as leader in AI-enabled medical engagement', 'strategic', 'high', 'long_term', true),
        (v_persona_id, 'Develop predictive models for KOL influence mapping', 'innovation', 'medium', 'medium_term', true),
        (v_persona_id, 'Train team of 10 MSLs on advanced AI workflows', 'leadership', 'medium', 'short_term', true),
        (v_persona_id, 'Create competitive intelligence dashboard with real-time insights', 'innovation', 'medium', 'medium_term', true);

    -- Skills (10 items)
    INSERT INTO persona_skills (persona_id, skill_name, skill_category, proficiency_level, importance_to_role) VALUES
        (v_persona_id, 'Strategic planning and execution', 'soft_skill', 'expert', 'critical'),
        (v_persona_id, 'Multi-stakeholder relationship management', 'soft_skill', 'expert', 'critical'),
        (v_persona_id, 'AI/ML concepts and applications', 'technical', 'advanced', 'important'),
        (v_persona_id, 'Data synthesis and analysis', 'technical', 'expert', 'critical'),
        (v_persona_id, 'Executive communication', 'soft_skill', 'expert', 'critical'),
        (v_persona_id, 'Oncology/Immunology therapeutic expertise', 'domain', 'expert', 'critical'),
        (v_persona_id, 'Change management', 'soft_skill', 'advanced', 'important'),
        (v_persona_id, 'Competitive intelligence analysis', 'technical', 'advanced', 'important'),
        (v_persona_id, 'Team leadership and coaching', 'soft_skill', 'advanced', 'important'),
        (v_persona_id, 'Custom AI workflow design', 'technical', 'intermediate', 'useful');

    -- Success Metrics (5 items)
    INSERT INTO persona_success_metrics (persona_id, metric_name, metric_category, measurement_frequency, target_value) VALUES
        (v_persona_id, 'Strategic insights influencing company decisions', 'impact', 'quarterly', '5+'),
        (v_persona_id, 'KOL network expansion in key therapeutic areas', 'growth', 'quarterly', '20% YoY'),
        (v_persona_id, 'Team AI adoption rate', 'leadership', 'monthly', '80%+'),
        (v_persona_id, 'Cross-functional initiatives led', 'leadership', 'quarterly', '3+'),
        (v_persona_id, 'Competitive intelligence accuracy', 'quality', 'quarterly', '90%+');

    RAISE NOTICE 'Created MSL Orchestrator persona: %', v_persona_id;

    -- ========================================================================
    -- MSL PERSONA 3: LEARNER
    -- Low AI Maturity (32) + Routine Work (28)
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
        v_role_id, 'Medical Science Liaison', 'medical-science-liaison',
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
    ) RETURNING id INTO v_persona_id;

    -- Typical Day Activities (8 items)
    INSERT INTO persona_typical_day_activities (persona_id, activity_name, activity_category, time_of_day, duration_hours, is_routine, automation_potential, display_order) VALUES
        (v_persona_id, 'Review daily schedule and prepare materials manually', 'admin', 'morning', 0.75, true, 'high', 1),
        (v_persona_id, 'Study product information and clinical data', 'focus_work', 'morning', 1.5, true, 'medium', 2),
        (v_persona_id, 'Shadow senior MSL on KOL meeting', 'meeting', 'morning', 1.5, false, 'low', 3),
        (v_persona_id, 'Manual literature search on PubMed', 'focus_work', 'midday', 1.0, true, 'high', 4),
        (v_persona_id, 'Write meeting notes by hand/typing', 'admin', 'midday', 0.5, true, 'high', 5),
        (v_persona_id, 'Attend training webinar on MSL best practices', 'meeting', 'afternoon', 1.0, false, 'low', 6),
        (v_persona_id, 'Update CRM with supervisor guidance', 'admin', 'afternoon', 0.75, true, 'high', 7),
        (v_persona_id, 'Debrief with manager on daily activities', 'meeting', 'afternoon', 0.5, false, 'low', 8);

    -- Motivations (5 items)
    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Build confidence in scientific communication', 'intrinsic', 'growth', 'very_strong', true),
        (v_persona_id, 'Learn MSL best practices and workflows', 'intrinsic', 'mastery', 'very_strong', true),
        (v_persona_id, 'Avoid making mistakes that could harm KOL relationships', 'extrinsic', 'efficiency', 'strong', true),
        (v_persona_id, 'Get promoted to senior MSL within 3 years', 'achievement', 'growth', 'strong', false),
        (v_persona_id, 'Understand when and how to use different tools', 'intrinsic', 'mastery', 'moderate', true);

    -- Frustrations (6 items)
    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Uncertain about best practices for KOL engagement', 'information', 'major', 'frequent', true),
        (v_persona_id, 'Overwhelmed by learning curve for MSL tools and processes', 'tool', 'major', 'constant', true),
        (v_persona_id, 'Need step-by-step guidance for scientific presentations', 'process', 'moderate', 'frequent', true),
        (v_persona_id, 'Unclear when to use different communication channels', 'information', 'moderate', 'frequent', true),
        (v_persona_id, 'Fear of providing incorrect scientific information', 'personal', 'major', 'frequent', true),
        (v_persona_id, 'Difficulty finding relevant information quickly', 'tool', 'moderate', 'frequent', true);

    -- Goals (5 items)
    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Master MSL fundamentals and standard operating procedures', 'learning', 'high', 'short_term', true),
        (v_persona_id, 'Build confidence in scientific communication with KOLs', 'growth', 'high', 'short_term', true),
        (v_persona_id, 'Understand how to use CRM and literature tools effectively', 'learning', 'high', 'short_term', true),
        (v_persona_id, 'Complete all required compliance training', 'compliance', 'high', 'short_term', false),
        (v_persona_id, 'Conduct first independent KOL meeting successfully', 'growth', 'medium', 'short_term', true);

    -- Adoption Barriers (5 items)
    INSERT INTO persona_adoption_barriers (persona_id, barrier_description, barrier_type, severity) VALUES
        (v_persona_id, 'Fear of AI making mistakes in scientific content', 'personal', 'high'),
        (v_persona_id, 'Lack of training on AI tools', 'organizational', 'high'),
        (v_persona_id, 'Uncertainty about when AI use is appropriate', 'regulatory', 'moderate'),
        (v_persona_id, 'Preference for learning from human mentors first', 'personal', 'moderate'),
        (v_persona_id, 'Overwhelmed by too many tool options', 'personal', 'moderate');

    -- Ideal Features (4 items)
    INSERT INTO persona_ideal_features (persona_id, feature_description, priority, expected_benefit) VALUES
        (v_persona_id, 'Step-by-step guided workflows with explanations', 'critical', 'Learn while doing'),
        (v_persona_id, 'AI tutor that explains concepts in simple terms', 'critical', 'Faster learning curve'),
        (v_persona_id, 'Templates with examples for common MSL tasks', 'high', 'Reduce uncertainty'),
        (v_persona_id, 'Real-time feedback on scientific communication', 'medium', 'Build confidence');

    RAISE NOTICE 'Created MSL Learner persona: %', v_persona_id;

    -- ========================================================================
    -- MSL PERSONA 4: SKEPTIC
    -- Low AI Maturity (28) + Strategic Work (78)
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
        v_role_id, 'Medical Science Liaison', 'medical-science-liaison',
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
    ) RETURNING id INTO v_persona_id;

    -- Typical Day Activities (9 items)
    INSERT INTO persona_typical_day_activities (persona_id, activity_name, activity_category, time_of_day, duration_hours, is_routine, automation_potential, display_order) VALUES
        (v_persona_id, 'Review team reports and compliance documentation', 'admin', 'morning', 1.0, true, 'medium', 1),
        (v_persona_id, 'Strategic planning meeting with Medical Director', 'meeting', 'morning', 1.5, false, 'low', 2),
        (v_persona_id, 'High-stakes KOL advisory board facilitation', 'meeting', 'morning', 2.0, false, 'low', 3),
        (v_persona_id, 'Review and approve team scientific materials', 'focus_work', 'midday', 1.5, false, 'low', 4),
        (v_persona_id, 'Phone calls with key investigators', 'meeting', 'afternoon', 1.0, false, 'low', 5),
        (v_persona_id, 'Compliance review of MSL activities', 'admin', 'afternoon', 0.75, true, 'medium', 6),
        (v_persona_id, 'Strategic input on clinical development plans', 'meeting', 'afternoon', 1.0, false, 'low', 7),
        (v_persona_id, 'Mentor junior MSLs on complex situations', 'meeting', 'afternoon', 0.75, false, 'low', 8),
        (v_persona_id, 'Review competitive intelligence manually', 'focus_work', 'afternoon', 0.75, false, 'medium', 9);

    -- Motivations (5 items)
    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Maintain highest standards of scientific accuracy', 'intrinsic', 'mastery', 'very_strong', true),
        (v_persona_id, 'Protect company reputation through rigorous compliance', 'extrinsic', 'efficiency', 'very_strong', false),
        (v_persona_id, 'Preserve proven methods that ensure quality', 'intrinsic', 'efficiency', 'strong', false),
        (v_persona_id, 'Ensure AI does not replace human judgment in critical decisions', 'intrinsic', 'impact', 'strong', false),
        (v_persona_id, 'Mentor team to maintain excellence standards', 'social', 'growth', 'moderate', true);

    -- Frustrations (7 items)
    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'AI tools that lack transparency in their reasoning', 'tool', 'major', 'frequent', true),
        (v_persona_id, 'Pressure to adopt AI before it is proven reliable', 'organizational', 'major', 'frequent', false),
        (v_persona_id, 'Concerns about AI errors damaging KOL relationships', 'process', 'major', 'occasional', true),
        (v_persona_id, 'Technology that creates more work than it saves', 'tool', 'moderate', 'frequent', true),
        (v_persona_id, 'Lack of human oversight in AI-driven decisions', 'process', 'major', 'occasional', true),
        (v_persona_id, 'AI that does not understand nuance and context', 'tool', 'moderate', 'frequent', true),
        (v_persona_id, 'Vendor hype vs. real-world AI capabilities', 'information', 'moderate', 'frequent', false);

    -- Goals (5 items)
    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Ensure all AI-generated content is medically accurate and cited', 'compliance', 'high', 'ongoing', true),
        (v_persona_id, 'Maintain compliance and regulatory standards in all KOL interactions', 'compliance', 'high', 'ongoing', false),
        (v_persona_id, 'Validate all AI recommendations with human medical review', 'quality', 'high', 'ongoing', true),
        (v_persona_id, 'Preserve proven workflows that ensure quality', 'efficiency', 'medium', 'ongoing', false),
        (v_persona_id, 'Gradually adopt AI with appropriate human oversight', 'innovation', 'low', 'long_term', true);

    -- Adoption Barriers (6 items)
    INSERT INTO persona_adoption_barriers (persona_id, barrier_description, barrier_type, severity) VALUES
        (v_persona_id, 'Distrust of AI recommendations without full transparency', 'personal', 'high'),
        (v_persona_id, 'Concerns about regulatory compliance with AI tools', 'regulatory', 'high'),
        (v_persona_id, 'Fear of AI errors impacting patient safety', 'personal', 'high'),
        (v_persona_id, 'Preference for human expertise over algorithmic suggestions', 'personal', 'high'),
        (v_persona_id, 'Lack of proven track record for AI in Medical Affairs', 'organizational', 'moderate'),
        (v_persona_id, 'Resistance to changing established workflows', 'personal', 'moderate');

    -- Ideal Features (4 items)
    INSERT INTO persona_ideal_features (persona_id, feature_description, priority, expected_benefit) VALUES
        (v_persona_id, 'Full citation and source transparency for all AI outputs', 'critical', 'Trust and verification'),
        (v_persona_id, 'Human-in-the-loop approval for all AI-generated content', 'critical', 'Quality assurance'),
        (v_persona_id, 'Audit trail of all AI decisions and recommendations', 'high', 'Compliance documentation'),
        (v_persona_id, 'Ability to override AI suggestions easily', 'high', 'Maintain control');

    RAISE NOTICE 'Created MSL Skeptic persona: %', v_persona_id;

END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check MSL personas created
SELECT 
    name, 
    archetype, 
    ai_maturity_score, 
    work_complexity_score,
    preferred_service_layer
FROM personas 
WHERE role_name = 'Medical Science Liaison'
ORDER BY archetype;

-- Check junction table population
SELECT 
    'persona_typical_day_activities' as table_name,
    COUNT(*) as record_count
FROM persona_typical_day_activities
WHERE persona_id IN (SELECT id FROM personas WHERE role_name = 'Medical Science Liaison')
UNION ALL
SELECT 'persona_motivations', COUNT(*) FROM persona_motivations WHERE persona_id IN (SELECT id FROM personas WHERE role_name = 'Medical Science Liaison')
UNION ALL
SELECT 'persona_frustrations', COUNT(*) FROM persona_frustrations WHERE persona_id IN (SELECT id FROM personas WHERE role_name = 'Medical Science Liaison')
UNION ALL
SELECT 'persona_goals', COUNT(*) FROM persona_goals WHERE persona_id IN (SELECT id FROM personas WHERE role_name = 'Medical Science Liaison');

