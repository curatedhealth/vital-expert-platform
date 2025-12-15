-- ============================================================================
-- MEDICAL DIRECTOR - 4 MECE PERSONAS
-- Complete with all junction tables
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
    SELECT id INTO v_tenant_id FROM tenants WHERE slug IN ('pharma', 'pharmaceuticals') LIMIT 1;
    SELECT id INTO v_role_id FROM org_roles WHERE slug ILIKE '%medical-director%' OR name ILIKE '%Medical Director%' LIMIT 1;
    SELECT id INTO v_function_id FROM org_functions WHERE name::text ILIKE '%medical%affairs%' LIMIT 1;
    SELECT id INTO v_department_id FROM org_departments WHERE name ILIKE '%medical%affairs%' LIMIT 1;

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
        'AUTOMATOR', v_role_id, 'Medical Director', 'medical-director',
        v_function_id, 'Medical Affairs', v_department_id, 'Medical Affairs',
        'director', 14, ARRAY['MD', 'PhD'], 'regional', 'Large Pharma',
        'mixed', 45, 78,
        'early_adopter', 'moderate', 'high',
        'data_driven', 'hands_on', 'collaborative',
        'WORKFLOWS', 'moderate', 15, 25,
        '{"visibility": 8, "pain": 7, "actions": 8, "needs": 6, "emotions": 5, "scenarios": 8}'::jsonb,
        true, NOW(), NOW()
    ) RETURNING id INTO v_persona_id;

    INSERT INTO persona_typical_day_activities (persona_id, activity_name, activity_category, time_of_day, duration_hours, is_routine, automation_potential, display_order) VALUES
        (v_persona_id, 'Review AI-generated team performance dashboard', 'admin', 'morning', 0.5, true, 'high', 1),
        (v_persona_id, 'Automated literature review synthesis', 'focus_work', 'morning', 0.75, true, 'high', 2),
        (v_persona_id, 'MSL team strategy meeting', 'meeting', 'morning', 1.0, false, 'low', 3),
        (v_persona_id, 'KOL engagement planning with AI recommendations', 'focus_work', 'midday', 1.0, false, 'medium', 4),
        (v_persona_id, 'Cross-functional alignment call (R&D, Commercial)', 'meeting', 'midday', 1.0, false, 'low', 5),
        (v_persona_id, 'Review AI-drafted medical strategy documents', 'focus_work', 'afternoon', 1.0, false, 'medium', 6),
        (v_persona_id, 'Budget and resource planning', 'admin', 'afternoon', 0.75, true, 'high', 7),
        (v_persona_id, 'One-on-ones with direct reports', 'meeting', 'afternoon', 1.0, false, 'low', 8);

    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Streamline team operations through intelligent automation', 'intrinsic', 'efficiency', 'very_strong', true),
        (v_persona_id, 'Make data-driven decisions faster', 'intrinsic', 'impact', 'strong', true),
        (v_persona_id, 'Free up time for strategic thinking', 'extrinsic', 'efficiency', 'strong', true),
        (v_persona_id, 'Lead Medical Affairs digital transformation', 'achievement', 'recognition', 'moderate', true);

    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Manual compilation of team metrics and reports', 'process', 'major', 'frequent', true),
        (v_persona_id, 'Time spent on administrative coordination', 'process', 'major', 'constant', true),
        (v_persona_id, 'Inconsistent data across multiple systems', 'tool', 'moderate', 'frequent', true),
        (v_persona_id, 'Delayed access to competitive intelligence', 'information', 'moderate', 'frequent', true),
        (v_persona_id, 'Manual approval workflows for medical content', 'process', 'moderate', 'frequent', true);

    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Automate 50% of routine reporting tasks', 'efficiency', 'high', 'short_term', true),
        (v_persona_id, 'Implement AI-powered KOL intelligence system', 'innovation', 'high', 'medium_term', true),
        (v_persona_id, 'Reduce medical content review cycle by 40%', 'efficiency', 'medium', 'medium_term', true),
        (v_persona_id, 'Build real-time competitive intelligence dashboard', 'innovation', 'medium', 'medium_term', true);

    INSERT INTO persona_skills (persona_id, skill_name, skill_category, proficiency_level, importance_to_role) VALUES
        (v_persona_id, 'Medical strategy development', 'domain', 'expert', 'critical'),
        (v_persona_id, 'Team leadership and management', 'soft_skill', 'expert', 'critical'),
        (v_persona_id, 'Oncology therapeutic expertise', 'domain', 'expert', 'critical'),
        (v_persona_id, 'Data analysis and visualization', 'technical', 'advanced', 'important'),
        (v_persona_id, 'AI/ML tool adoption', 'technical', 'intermediate', 'useful'),
        (v_persona_id, 'Cross-functional collaboration', 'soft_skill', 'expert', 'critical'),
        (v_persona_id, 'Budget management', 'technical', 'advanced', 'important');

    INSERT INTO persona_tools_used (persona_id, tool_name, tool_category, usage_frequency, proficiency_level) VALUES
        (v_persona_id, 'Veeva Vault', 'content_management', 'daily', 'expert'),
        (v_persona_id, 'Power BI/Tableau', 'analytics', 'daily', 'advanced'),
        (v_persona_id, 'Microsoft Teams', 'communication', 'daily', 'expert'),
        (v_persona_id, 'Salesforce/CRM', 'crm', 'daily', 'advanced'),
        (v_persona_id, 'ChatGPT/Claude', 'ai', 'daily', 'intermediate'),
        (v_persona_id, 'PubMed', 'research', 'weekly', 'advanced');

    INSERT INTO persona_success_metrics (persona_id, metric_name, metric_category, measurement_frequency, target_value) VALUES
        (v_persona_id, 'Team productivity improvement', 'efficiency', 'quarterly', '25%+ YoY'),
        (v_persona_id, 'Medical content approval cycle time', 'efficiency', 'monthly', '<5 days'),
        (v_persona_id, 'KOL engagement satisfaction', 'quality', 'quarterly', '4.5+/5'),
        (v_persona_id, 'AI tool adoption across team', 'innovation', 'monthly', '80%+');

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
        'ORCHESTRATOR', v_role_id, 'Medical Director', 'medical-director',
        v_function_id, 'Medical Affairs', v_department_id, 'Medical Affairs',
        'director', 16, ARRAY['MD', 'MBA'], 'global', 'Large Pharma',
        'strategic', 82, 85,
        'innovator', 'high', 'very_high',
        'analytical', 'self_directed', 'facilitator',
        'SOLUTION_BUILDER', 'significant', 25, 40,
        '{"visibility": 9, "pain": 8, "actions": 9, "needs": 8, "emotions": 7, "scenarios": 8}'::jsonb,
        true, NOW(), NOW()
    ) RETURNING id INTO v_persona_id;

    INSERT INTO persona_typical_day_activities (persona_id, activity_name, activity_category, time_of_day, duration_hours, is_routine, automation_potential, display_order) VALUES
        (v_persona_id, 'AI multi-agent strategic analysis session', 'focus_work', 'morning', 1.5, false, 'medium', 1),
        (v_persona_id, 'Global Medical Affairs leadership meeting', 'meeting', 'morning', 1.5, false, 'low', 2),
        (v_persona_id, 'KOL advisory board with AI-synthesized insights', 'meeting', 'midday', 2.0, false, 'medium', 3),
        (v_persona_id, 'Cross-functional strategic planning (R&D, Commercial, Market Access)', 'meeting', 'afternoon', 1.5, false, 'low', 4),
        (v_persona_id, 'Review AI-generated competitive landscape analysis', 'focus_work', 'afternoon', 1.0, false, 'medium', 5),
        (v_persona_id, 'Build custom AI workflow for evidence synthesis', 'focus_work', 'afternoon', 1.0, false, 'low', 6),
        (v_persona_id, 'Executive briefing preparation with AI assistance', 'focus_work', 'afternoon', 0.75, false, 'medium', 7);

    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Transform Medical Affairs through AI-powered intelligence', 'intrinsic', 'impact', 'very_strong', true),
        (v_persona_id, 'Drive competitive advantage through predictive insights', 'achievement', 'impact', 'very_strong', true),
        (v_persona_id, 'Establish industry-leading AI capabilities in medical strategy', 'achievement', 'recognition', 'strong', true),
        (v_persona_id, 'Orchestrate complex multi-stakeholder initiatives', 'intrinsic', 'mastery', 'strong', true),
        (v_persona_id, 'Mentor next generation of AI-enabled medical leaders', 'social', 'growth', 'moderate', true);

    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Synthesizing insights across 200+ global KOL interactions', 'information', 'major', 'constant', true),
        (v_persona_id, 'Slow organizational adoption of AI capabilities', 'organizational', 'major', 'constant', false),
        (v_persona_id, 'Coordinating global strategy across regions with different needs', 'organizational', 'major', 'frequent', true),
        (v_persona_id, 'Limited tools for multi-source strategic intelligence', 'tool', 'major', 'constant', true),
        (v_persona_id, 'Difficulty predicting competitive moves', 'information', 'moderate', 'frequent', true);

    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Build AI-powered global KOL intelligence platform', 'innovation', 'high', 'medium_term', true),
        (v_persona_id, 'Establish predictive analytics for competitive strategy', 'innovation', 'high', 'medium_term', true),
        (v_persona_id, 'Lead industry in AI-enabled medical engagement', 'strategic', 'high', 'long_term', true),
        (v_persona_id, 'Train 100+ Medical Affairs professionals on AI tools', 'leadership', 'medium', 'medium_term', true);

    INSERT INTO persona_skills (persona_id, skill_name, skill_category, proficiency_level, importance_to_role) VALUES
        (v_persona_id, 'Strategic planning and execution', 'soft_skill', 'expert', 'critical'),
        (v_persona_id, 'AI/ML strategy and implementation', 'technical', 'advanced', 'critical'),
        (v_persona_id, 'Global stakeholder management', 'soft_skill', 'expert', 'critical'),
        (v_persona_id, 'Immunology therapeutic expertise', 'domain', 'expert', 'critical'),
        (v_persona_id, 'Change management', 'soft_skill', 'expert', 'important'),
        (v_persona_id, 'Executive communication', 'soft_skill', 'expert', 'critical'),
        (v_persona_id, 'Custom AI workflow design', 'technical', 'intermediate', 'useful');

    INSERT INTO persona_success_metrics (persona_id, metric_name, metric_category, measurement_frequency, target_value) VALUES
        (v_persona_id, 'Strategic initiatives driving company decisions', 'impact', 'quarterly', '10+'),
        (v_persona_id, 'Global AI adoption rate', 'innovation', 'quarterly', '70%+'),
        (v_persona_id, 'Competitive intelligence accuracy', 'quality', 'quarterly', '90%+'),
        (v_persona_id, 'Cross-functional alignment score', 'leadership', 'quarterly', '4.5+/5');

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
        'LEARNER', v_role_id, 'Medical Director', 'medical-director',
        v_function_id, 'Medical Affairs', v_department_id, 'Medical Affairs',
        'director', 10, ARRAY['PhD', 'PharmD'], 'regional', 'Mid-Size Pharma',
        'mixed', 42, 35,
        'late_majority', 'low', 'moderate',
        'collaborative', 'guided', 'collaborative',
        'ASK_EXPERT', 'limited', 8, 12,
        '{"visibility": 5, "pain": 6, "actions": 4, "needs": 4, "emotions": 5, "scenarios": 6}'::jsonb,
        true, NOW(), NOW()
    ) RETURNING id INTO v_persona_id;

    INSERT INTO persona_typical_day_activities (persona_id, activity_name, activity_category, time_of_day, duration_hours, is_routine, automation_potential, display_order) VALUES
        (v_persona_id, 'Review emails and daily priorities', 'admin', 'morning', 0.75, true, 'medium', 1),
        (v_persona_id, 'Team meeting with direct reports', 'meeting', 'morning', 1.0, false, 'low', 2),
        (v_persona_id, 'One-on-one coaching sessions', 'meeting', 'morning', 1.5, false, 'low', 3),
        (v_persona_id, 'Manual literature review and analysis', 'focus_work', 'midday', 1.5, true, 'high', 4),
        (v_persona_id, 'Cross-functional meeting with Commercial', 'meeting', 'afternoon', 1.0, false, 'low', 5),
        (v_persona_id, 'Training on new Medical Affairs systems', 'meeting', 'afternoon', 1.0, false, 'low', 6),
        (v_persona_id, 'Administrative tasks and approvals', 'admin', 'afternoon', 1.0, true, 'high', 7);

    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Succeed in new leadership role', 'intrinsic', 'growth', 'very_strong', true),
        (v_persona_id, 'Learn best practices for Medical Director responsibilities', 'intrinsic', 'mastery', 'very_strong', true),
        (v_persona_id, 'Build credibility with team and stakeholders', 'social', 'recognition', 'strong', true),
        (v_persona_id, 'Gradually adopt AI tools with proper training', 'intrinsic', 'growth', 'moderate', true);

    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Steep learning curve for leadership responsibilities', 'personal', 'major', 'constant', true),
        (v_persona_id, 'Uncertainty about AI tools and when to use them', 'tool', 'moderate', 'frequent', true),
        (v_persona_id, 'Balancing operational tasks with strategic thinking', 'time', 'major', 'constant', true),
        (v_persona_id, 'Need guidance on Medical Affairs best practices', 'information', 'moderate', 'frequent', true),
        (v_persona_id, 'Limited time for training and development', 'time', 'moderate', 'frequent', false);

    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Master Medical Director responsibilities within first year', 'learning', 'high', 'short_term', true),
        (v_persona_id, 'Build strong relationships with team and stakeholders', 'growth', 'high', 'short_term', false),
        (v_persona_id, 'Learn AI tools with proper training and support', 'learning', 'medium', 'medium_term', true),
        (v_persona_id, 'Develop strategic planning capabilities', 'growth', 'medium', 'medium_term', true);

    INSERT INTO persona_adoption_barriers (persona_id, barrier_description, barrier_type, severity) VALUES
        (v_persona_id, 'Already overwhelmed with new role responsibilities', 'personal', 'high'),
        (v_persona_id, 'Lack of training on AI tools', 'organizational', 'high'),
        (v_persona_id, 'Uncertainty about AI reliability for medical content', 'personal', 'moderate'),
        (v_persona_id, 'Preference for learning fundamentals before advanced tools', 'personal', 'moderate');

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
        'SKEPTIC', v_role_id, 'Medical Director', 'medical-director',
        v_function_id, 'Medical Affairs', v_department_id, 'Medical Affairs',
        'director', 20, ARRAY['MD', 'FACC'], 'global', 'Large Pharma',
        'strategic', 80, 25,
        'laggard', 'low', 'low',
        'authoritative', 'structured', 'director',
        'ASK_EXPERT', 'high', 20, 35,
        '{"visibility": 5, "pain": 4, "actions": 2, "needs": 6, "emotions": 3, "scenarios": 5}'::jsonb,
        true, NOW(), NOW()
    ) RETURNING id INTO v_persona_id;

    INSERT INTO persona_typical_day_activities (persona_id, activity_name, activity_category, time_of_day, duration_hours, is_routine, automation_potential, display_order) VALUES
        (v_persona_id, 'Review compliance reports and approvals', 'admin', 'morning', 1.0, true, 'medium', 1),
        (v_persona_id, 'Strategic planning meeting with VP', 'meeting', 'morning', 1.5, false, 'low', 2),
        (v_persona_id, 'KOL advisory board facilitation', 'meeting', 'midday', 2.0, false, 'low', 3),
        (v_persona_id, 'Manual review of medical content for accuracy', 'focus_work', 'afternoon', 1.5, false, 'low', 4),
        (v_persona_id, 'Phone calls with key investigators', 'meeting', 'afternoon', 1.0, false, 'low', 5),
        (v_persona_id, 'Team performance reviews', 'meeting', 'afternoon', 1.0, false, 'low', 6),
        (v_persona_id, 'Regulatory compliance review', 'focus_work', 'afternoon', 0.75, false, 'medium', 7);

    INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, motivation_category, strength, ai_can_support) VALUES
        (v_persona_id, 'Maintain highest standards of medical accuracy', 'intrinsic', 'mastery', 'very_strong', true),
        (v_persona_id, 'Protect company from compliance risks', 'extrinsic', 'efficiency', 'very_strong', false),
        (v_persona_id, 'Ensure human judgment in critical medical decisions', 'intrinsic', 'impact', 'strong', false),
        (v_persona_id, 'Preserve proven processes that ensure quality', 'intrinsic', 'efficiency', 'strong', false);

    INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity, impact_frequency, ai_can_resolve) VALUES
        (v_persona_id, 'Pressure to adopt AI without proven track record', 'organizational', 'major', 'frequent', false),
        (v_persona_id, 'AI tools that lack transparency in reasoning', 'tool', 'major', 'frequent', true),
        (v_persona_id, 'Concerns about AI errors in medical content', 'process', 'major', 'occasional', true),
        (v_persona_id, 'Vendor overselling AI capabilities', 'information', 'moderate', 'frequent', false),
        (v_persona_id, 'Team members bypassing review processes with AI', 'organizational', 'moderate', 'occasional', false);

    INSERT INTO persona_goals (persona_id, goal_text, goal_category, priority, time_horizon, ai_can_assist) VALUES
        (v_persona_id, 'Ensure 100% compliance in all medical communications', 'compliance', 'high', 'ongoing', false),
        (v_persona_id, 'Maintain human oversight for all AI-generated content', 'quality', 'high', 'ongoing', true),
        (v_persona_id, 'Establish clear AI governance policies', 'compliance', 'medium', 'short_term', false),
        (v_persona_id, 'Gradually evaluate AI tools with proper validation', 'innovation', 'low', 'long_term', true);

    INSERT INTO persona_adoption_barriers (persona_id, barrier_description, barrier_type, severity) VALUES
        (v_persona_id, 'Deep concerns about AI reliability for medical content', 'personal', 'high'),
        (v_persona_id, 'Regulatory uncertainty around AI use in Medical Affairs', 'regulatory', 'high'),
        (v_persona_id, 'Preference for human expertise and judgment', 'personal', 'high'),
        (v_persona_id, 'Lack of proven AI track record in cardiovascular', 'organizational', 'moderate'),
        (v_persona_id, 'Concerns about liability for AI errors', 'regulatory', 'high');

    INSERT INTO persona_ideal_features (persona_id, feature_description, priority, expected_benefit) VALUES
        (v_persona_id, 'Complete audit trail for all AI decisions', 'critical', 'Compliance documentation'),
        (v_persona_id, 'Human approval required before any AI output is used', 'critical', 'Quality control'),
        (v_persona_id, 'Full citation transparency with source verification', 'critical', 'Medical accuracy'),
        (v_persona_id, 'Easy override of AI recommendations', 'high', 'Maintain control');

    RAISE NOTICE 'Created Medical Director Skeptic persona: %', v_persona_id;

END $$;

COMMIT;

