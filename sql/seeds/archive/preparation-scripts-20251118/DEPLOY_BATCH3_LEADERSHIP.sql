-- MSL Personas Phase 1 - Deployment (Final Corrected)
-- Generated: 2025-11-17T15:10:34.091298
-- Source: MEDICAL_AFFAIRS_MSL_PERSONAS_PHASE1 (1).json
-- Personas: 10

BEGIN;


-- ========================================
-- Persona 1: Dr. Thomas Anderson
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Thomas Anderson',
        'dr-thomas-anderson-vp-medical-affairs-tactical',
        'VP Medical Affairs - Tactical Executor',
        'executive',
        26,
        5,
        26,
        '48-56',
        'MD/MBA',
        'Chief Medical Officer',
        45,
        12000000,
        'New Jersey',
        'hybrid',
        'job_role',
        TRUE,
        'approved'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;

    -- Clean up old related data for re-deployment
    DELETE FROM persona_goals WHERE persona_id = v_persona_id;
    DELETE FROM persona_pain_points WHERE persona_id = v_persona_id;
    DELETE FROM persona_challenges WHERE persona_id = v_persona_id;
    DELETE FROM persona_responsibilities WHERE persona_id = v_persona_id;
    DELETE FROM persona_tools WHERE persona_id = v_persona_id;
    DELETE FROM persona_internal_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_external_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_communication_preferences WHERE persona_id = v_persona_id;


    -- Goal 1
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Deliver operational excellence metrics: 95% on-time, <3% error rate',
        'primary',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Reduce medical affairs operational costs 15% while maintaining quality',
        'primary',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Implement new CRM system with 90% adoption',
        'primary',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Achieve 100% MSL territory coverage and productivity targets',
        'primary',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Develop 3 process improvement initiatives',
        'primary',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Day-to-day firefighting leaves no strategic thinking time',
        'operational',
        'critical',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team performance inconsistencies require constant oversight',
        'operational',
        'high',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Budget pressures vs operational needs constant tension',
        'operational',
        'high',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Legacy systems and processes slow innovation',
        'operational',
        'critical',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited insight into field performance in real-time',
        'operational',
        'high',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Compliance complexity across regions and functions',
        'operational',
        'high',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing 45-person team with diverse skill levels',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing cost control with quality and innovation',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Implementing system changes while maintaining operations',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Staying compliant across multiple jurisdictions',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Driving team accountability and performance',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Day-to-day operations and team management',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Budget and financial management',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Compliance and quality assurance',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Cross-functional coordination',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Strategic input and planning',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Veeva CRM',
        'daily',
        'proficient',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'SAP/ERP',
        'daily',
        'proficient',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Excel',
        'daily',
        'expert',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'proficient',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Tableau',
        'weekly',
        'proficient',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Project Mgmt',
        'daily',
        'expert',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Chief Medical Officer',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Direct Reports (12)',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'CFO/Finance',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for formal, Teams for daily, calls for urgent',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'action_oriented',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '2_hours_urgent',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'direct_executive',
        4
    );

END $$;


-- ========================================
-- Persona 2: Dr. Patricia Wilson
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Patricia Wilson',
        'dr-patricia-wilson-vp-medical-affairs-strategic',
        'VP Medical Affairs - Strategic Visionary',
        'executive',
        28,
        6,
        28,
        '50-58',
        'MD',
        'Chief Medical Officer',
        50,
        14000000,
        'Boston, MA',
        'very_flexible',
        'job_role',
        TRUE,
        'approved'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;

    -- Clean up old related data for re-deployment
    DELETE FROM persona_goals WHERE persona_id = v_persona_id;
    DELETE FROM persona_pain_points WHERE persona_id = v_persona_id;
    DELETE FROM persona_challenges WHERE persona_id = v_persona_id;
    DELETE FROM persona_responsibilities WHERE persona_id = v_persona_id;
    DELETE FROM persona_tools WHERE persona_id = v_persona_id;
    DELETE FROM persona_internal_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_external_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_communication_preferences WHERE persona_id = v_persona_id;


    -- Goal 1
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Develop 3-5 year medical affairs transformation strategy',
        'primary',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Implement AI/digital innovation in medical engagement',
        'primary',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Establish center of excellence for medical innovation',
        'primary',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build organizational capability for emerging technologies',
        'primary',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Achieve thought leadership position in industry',
        'primary',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Internal resistance to organizational transformation',
        'operational',
        'critical',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'C-suite alignment difficult on medical affairs priorities',
        'operational',
        'high',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Innovation pace slower than industry evolution',
        'operational',
        'critical',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Talent retention challenges as industry evolves',
        'operational',
        'high',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Digital transformation complexity and cost',
        'operational',
        'critical',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited budget for innovation vs operational needs',
        'operational',
        'high',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Leading organizational transformation while managing operations',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building case for digital/AI investment with ROI uncertainty',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing change resistance across organization',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Attracting and retaining top talent amid change',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Staying ahead of industry disruption',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Strategic vision and transformation leadership',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Digital and innovation initiatives',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team and organizational development',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'C-suite collaboration and alignment',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'External thought leadership',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Strategic Planning',
        'weekly',
        'expert',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Innovation Platforms',
        'weekly',
        'proficient',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Analytics Dashboards',
        'weekly',
        'proficient',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Project Mgmt',
        'weekly',
        'proficient',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Collaboration',
        'daily',
        'expert',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Chief Medical Officer',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'C-Suite',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Direct Reports (8)',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for strategic, Teams for collaboration, calls for important',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'strategic_visionary',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '24_hours',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'inspiring_strategic',
        4
    );

END $$;


-- ========================================
-- Persona 3: Dr. Richard Chen
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Richard Chen',
        'dr-richard-chen-vp-medical-affairs-portfolio',
        'VP Medical Affairs - Portfolio Manager',
        'executive',
        30,
        7,
        30,
        '52-60',
        'MD/PhD',
        'Chief Medical Officer',
        55,
        16000000,
        'San Francisco, CA',
        'hybrid',
        'job_role',
        TRUE,
        'approved'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;

    -- Clean up old related data for re-deployment
    DELETE FROM persona_goals WHERE persona_id = v_persona_id;
    DELETE FROM persona_pain_points WHERE persona_id = v_persona_id;
    DELETE FROM persona_challenges WHERE persona_id = v_persona_id;
    DELETE FROM persona_responsibilities WHERE persona_id = v_persona_id;
    DELETE FROM persona_tools WHERE persona_id = v_persona_id;
    DELETE FROM persona_internal_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_external_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_communication_preferences WHERE persona_id = v_persona_id;


    -- Goal 1
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Optimize resource allocation across 5-TA portfolio',
        'primary',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Achieve 30% improvement in medical affairs ROI across portfolio',
        'primary',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Support 4 successful launches with coordinated medical strategy',
        'primary',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build cross-TA centers of excellence',
        'primary',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Integrate acquired portfolio medical assets',
        'primary',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Resource allocation conflicts between TAs constant',
        'operational',
        'critical',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'TA prioritization debates with commercial teams',
        'operational',
        'critical',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'M&A integration complexity for medical teams',
        'operational',
        'high',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited visibility into cross-TA opportunities',
        'operational',
        'high',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Duplication across TA teams inefficient',
        'operational',
        'high',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Competing priorities with limited budget',
        'operational',
        'critical',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Optimizing portfolio resource allocation fairly',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing immediate needs with long-term strategy',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing TA conflicts and competing interests',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Identifying and capturing synergies',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Measuring medical affairs contribution to portfolio',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Portfolio strategy and resource optimization',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'TA medical director oversight',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Cross-TA initiatives and synergies',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Financial management and ROI tracking',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'M&A integration support',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Portfolio Analysis',
        'weekly',
        'expert',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Excel/Tableau',
        'daily',
        'expert',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Project Mgmt',
        'weekly',
        'proficient',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'ERP/SAP',
        'weekly',
        'proficient',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Analytics',
        'weekly',
        'proficient',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Chief Medical Officer',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'TA Medical Directors (5)',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Commercial Leadership',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for formal, Teams for updates, calls for complex',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'data_driven_strategic',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '24_hours',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'analytical_diplomatic',
        4
    );

END $$;


-- ========================================
-- Persona 4: Dr. Laura Martinez
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Laura Martinez',
        'dr-laura-martinez-vp-medical-affairs-launch',
        'VP Medical Affairs - Launch Leader',
        'executive',
        24,
        4,
        24,
        '46-54',
        'MD/MBA',
        'Chief Medical Officer',
        40,
        10000000,
        'Philadelphia, PA',
        'hybrid',
        'job_role',
        TRUE,
        'approved'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;

    -- Clean up old related data for re-deployment
    DELETE FROM persona_goals WHERE persona_id = v_persona_id;
    DELETE FROM persona_pain_points WHERE persona_id = v_persona_id;
    DELETE FROM persona_challenges WHERE persona_id = v_persona_id;
    DELETE FROM persona_responsibilities WHERE persona_id = v_persona_id;
    DELETE FROM persona_tools WHERE persona_id = v_persona_id;
    DELETE FROM persona_internal_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_external_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_communication_preferences WHERE persona_id = v_persona_id;


    -- Goal 1
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Execute 3 major launches with >$100M peak sales support',
        'primary',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Achieve 90% pre-launch readiness score',
        'primary',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build commercial-medical alignment for launch success',
        'primary',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Create launch playbook and best practices toolkit',
        'primary',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Mentor medical team in launch excellence',
        'primary',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Launch timelines compressed - 12 months instead of 18',
        'operational',
        'critical',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Cross-functional misalignment between medical and commercial',
        'operational',
        'critical',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Evidence gaps at launch with limited time for generation',
        'operational',
        'critical',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team burn-out from launch intensity',
        'operational',
        'high',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regulatory changes impacting readiness',
        'operational',
        'high',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Payer pushback on value proposition late in launch',
        'operational',
        'high',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Compressing launch timelines without sacrificing quality',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Ensuring pre-launch evidence completeness',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Achieving commercial-medical alignment',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing team stress and burn-out',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Adapting to regulatory/payer changes mid-launch',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Launch strategy and planning',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Cross-functional launch coordination',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team leadership and motivation',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Payer and regulator engagement',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Pre-launch readiness assessment',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Launch Planning Tools',
        'daily',
        'expert',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Project Mgmt',
        'daily',
        'expert',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Excel',
        'daily',
        'expert',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Roadmapping',
        'weekly',
        'proficient',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Analytics',
        'weekly',
        'proficient',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Chief Medical Officer',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'VP Commercial',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Launch Team',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for formal, Teams for daily, calls for urgent',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'action_focused',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '2_hours_urgent',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'inspiring_directive',
        4
    );

END $$;


-- ========================================
-- Persona 5: Dr. Steven Bennett
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Steven Bennett',
        'dr-steven-bennett-medical-director-academic',
        'Medical Director - Academic',
        'director',
        20,
        4,
        20,
        '45-52',
        'MD',
        'VP Medical Affairs',
        15,
        2000000,
        'New York, NY',
        'hybrid',
        'job_role',
        TRUE,
        'approved'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;

    -- Clean up old related data for re-deployment
    DELETE FROM persona_goals WHERE persona_id = v_persona_id;
    DELETE FROM persona_pain_points WHERE persona_id = v_persona_id;
    DELETE FROM persona_challenges WHERE persona_id = v_persona_id;
    DELETE FROM persona_responsibilities WHERE persona_id = v_persona_id;
    DELETE FROM persona_tools WHERE persona_id = v_persona_id;
    DELETE FROM persona_internal_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_external_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_communication_preferences WHERE persona_id = v_persona_id;


    -- Goal 1
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publish 3-4 manuscripts in top journals',
        'primary',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Establish 3 academic research partnerships',
        'primary',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build academic credibility for company initiatives',
        'primary',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Mentor academic researchers on industry collaboration',
        'primary',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Support 2 investigator-initiated study programs',
        'primary',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Academic standards vs commercial timelines tension',
        'operational',
        'high',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publication delays and peer review challenges',
        'operational',
        'high',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited budget for academic partnerships',
        'operational',
        'medium',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing commercial focus with academic excellence',
        'operational',
        'high',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team development for academic skillset',
        'operational',
        'medium',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Maintaining academic reputation while in industry',
        'operational',
        'high',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publishing quality work amid commercial pressure',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building academic collaborations from industry role',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Establishing credibility in peer-review process',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Allocating time between commercial and academic',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Securing research funding for academic projects',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Academic partnerships and collaboration',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publication strategy and execution',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Medical affairs team leadership',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Research methodology and design',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Commercial medical support',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PubMed/Literature',
        'daily',
        'expert',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Statistical Software',
        'weekly',
        'proficient',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'EndnoteWriteM',
        'daily',
        'expert',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'proficient',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Project Mgmt',
        'weekly',
        'proficient',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Collaboration',
        'daily',
        'expert',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'VP Medical Affairs',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Medical Team',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Academic Collaborators',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for formal, Teams for collaboration, calls for strategic',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'collaborative_academic',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '24_hours',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'scholarly_collaborative',
        4
    );

END $$;


-- ========================================
-- Persona 6: Dr. Jennifer Hayes
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Jennifer Hayes',
        'dr-jennifer-hayes-medical-director-commercial',
        'Medical Director - Commercial',
        'director',
        18,
        3,
        18,
        '42-50',
        'MD/MBA',
        'VP Medical Affairs',
        12,
        1500000,
        'Chicago, IL',
        'hybrid',
        'job_role',
        TRUE,
        'approved'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;

    -- Clean up old related data for re-deployment
    DELETE FROM persona_goals WHERE persona_id = v_persona_id;
    DELETE FROM persona_pain_points WHERE persona_id = v_persona_id;
    DELETE FROM persona_challenges WHERE persona_id = v_persona_id;
    DELETE FROM persona_responsibilities WHERE persona_id = v_persona_id;
    DELETE FROM persona_tools WHERE persona_id = v_persona_id;
    DELETE FROM persona_internal_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_external_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_communication_preferences WHERE persona_id = v_persona_id;


    -- Goal 1
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Increase sales team medical engagement effectiveness 25%',
        'primary',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Develop 5 value proposition campaigns for key products',
        'primary',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Train 100+ sales reps on medical messaging',
        'primary',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Support 2 regional expansion initiatives',
        'primary',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build medical-sales alignment metrics',
        'primary',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Sales force disconnected from medical strategy',
        'operational',
        'critical',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Sales feedback not integrated into medical decisions',
        'operational',
        'high',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited time for sales training with operational demands',
        'operational',
        'high',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regional variation in sales effectiveness',
        'operational',
        'high',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Measuring impact of medical engagement on sales',
        'operational',
        'high',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing compliance with sales enablement',
        'operational',
        'high',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Bridging medical and sales perspectives',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Scaling training across geographically dispersed team',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Proving ROI of medical engagement',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Keeping sales updated with latest evidence',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing compliance while enabling sales',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Sales force training and enablement',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Value proposition development',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regional medical support',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team leadership',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Commercial strategy alignment',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Veeva',
        'daily',
        'proficient',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Salesforce',
        'daily',
        'proficient',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PowerPoint',
        'daily',
        'expert',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'proficient',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Analytics',
        'weekly',
        'proficient',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Training Platforms',
        'weekly',
        'proficient',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'VP Medical Affairs',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'VP Sales',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regional Managers',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for formal, Teams for daily, calls for field',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'action_oriented',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '4_hours_urgent',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'direct_practical',
        4
    );

END $$;


-- ========================================
-- Persona 7: Dr. Michael Rodriguez
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Michael Rodriguez',
        'dr-michael-rodriguez-medical-director-launch',
        'Medical Director - Launch',
        'director',
        16,
        3,
        16,
        '40-48',
        'MD/MBA',
        'VP Medical Affairs',
        10,
        1200000,
        'San Francisco, CA',
        'hybrid',
        'job_role',
        TRUE,
        'approved'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;

    -- Clean up old related data for re-deployment
    DELETE FROM persona_goals WHERE persona_id = v_persona_id;
    DELETE FROM persona_pain_points WHERE persona_id = v_persona_id;
    DELETE FROM persona_challenges WHERE persona_id = v_persona_id;
    DELETE FROM persona_responsibilities WHERE persona_id = v_persona_id;
    DELETE FROM persona_tools WHERE persona_id = v_persona_id;
    DELETE FROM persona_internal_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_external_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_communication_preferences WHERE persona_id = v_persona_id;


    -- Goal 1
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Execute 2 successful major launches',
        'primary',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Achieve 90% pre-launch readiness on all launches',
        'primary',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build launch excellence playbook',
        'primary',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Support >$50M peak sales launches',
        'primary',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Mentor medical team in launch process',
        'primary',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Launch timelines constantly compressed',
        'operational',
        'critical',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Evidence gaps at launch',
        'operational',
        'high',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Cross-functional coordination challenges',
        'operational',
        'critical',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team stress and burn-out from intensity',
        'operational',
        'high',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Payer and regulator changes mid-launch',
        'operational',
        'high',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited resources for launch support',
        'operational',
        'high',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Executing launches with compressed timelines',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Ensuring cross-functional alignment',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing evidence gaps',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Adapting to regulatory changes',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building team resilience',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Launch execution and coordination',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Medical team leadership',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Payer and regulator engagement',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Evidence gathering and validation',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Post-launch support',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Launch Planning',
        'daily',
        'expert',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Project Mgmt',
        'daily',
        'expert',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Analytics',
        'weekly',
        'proficient',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Excel',
        'daily',
        'expert',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Roadmapping',
        'weekly',
        'expert',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'VP Medical Affairs',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Launch Team',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Commercial',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for formal, Teams for daily, calls for urgent',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'action_focused',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '2_hours_urgent',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'direct_motivating',
        4
    );

END $$;


-- ========================================
-- Persona 8: Dr. Akiko Tanaka
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Akiko Tanaka',
        'dr-akiko-tanaka-medical-director-global',
        'Medical Director - Global',
        'director',
        19,
        4,
        19,
        '44-52',
        'MD',
        'VP Medical Affairs',
        18,
        2000000,
        'London, UK',
        'very_flexible',
        'job_role',
        TRUE,
        'approved'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;

    -- Clean up old related data for re-deployment
    DELETE FROM persona_goals WHERE persona_id = v_persona_id;
    DELETE FROM persona_pain_points WHERE persona_id = v_persona_id;
    DELETE FROM persona_challenges WHERE persona_id = v_persona_id;
    DELETE FROM persona_responsibilities WHERE persona_id = v_persona_id;
    DELETE FROM persona_tools WHERE persona_id = v_persona_id;
    DELETE FROM persona_internal_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_external_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_communication_preferences WHERE persona_id = v_persona_id;


    -- Goal 1
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Achieve harmonized medical strategy across 6 regions',
        'primary',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Support 3 global launches with regional adaptations',
        'primary',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build global center of excellence',
        'primary',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Develop region medical directors',
        'primary',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Reduce regional variation in key metrics',
        'primary',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regional medical strategy heterogeneity',
        'operational',
        'critical',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Time zone coordination complexity',
        'operational',
        'high',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regulatory variability across regions',
        'operational',
        'critical',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Cultural and organizational differences',
        'operational',
        'high',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited budget for global coordination',
        'operational',
        'high',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regional medical director capability variation',
        'operational',
        'high',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Harmonizing medical strategy across regions',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing time zone and cultural differences',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Navigating diverse regulatory environments',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building coordinated teams',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Ensuring consistent quality globally',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Global medical strategy and coordination',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regional medical director leadership',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Global launch support',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regulatory coordination',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Cross-regional initiatives',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Strategic Planning',
        'weekly',
        'expert',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'expert',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Project Mgmt',
        'daily',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Analytics',
        'weekly',
        'proficient',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regulatory Tools',
        'weekly',
        'proficient',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Collaboration',
        'daily',
        'expert',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'VP Medical Affairs',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regional Directors (6)',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Global Commercial',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for formal, Teams for daily, calls for complex',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'asynchronous_global',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '24_hours',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'diplomatic_collaborative',
        4
    );

END $$;


-- ========================================
-- Persona 9: Dr. David Richardson
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. David Richardson',
        'dr-david-richardson-cmo-large-pharma',
        'Chief Medical Officer - Large Pharma',
        'c-suite',
        35,
        8,
        35,
        '55-65',
        'MD',
        'Chief Executive Officer',
        200,
        100000000,
        'New York, NY',
        'hybrid',
        'job_role',
        TRUE,
        'approved'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;

    -- Clean up old related data for re-deployment
    DELETE FROM persona_goals WHERE persona_id = v_persona_id;
    DELETE FROM persona_pain_points WHERE persona_id = v_persona_id;
    DELETE FROM persona_challenges WHERE persona_id = v_persona_id;
    DELETE FROM persona_responsibilities WHERE persona_id = v_persona_id;
    DELETE FROM persona_tools WHERE persona_id = v_persona_id;
    DELETE FROM persona_internal_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_external_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_communication_preferences WHERE persona_id = v_persona_id;


    -- Goal 1
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Achieve $5B revenue medical affairs contribution',
        'primary',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build world-class medical organization',
        'primary',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Drive digital transformation of medical',
        'primary',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Establish thought leadership in industry',
        'primary',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Develop C-suite successor',
        'primary',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Board pressure for ROI from medical affairs',
        'operational',
        'high',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Digital/AI transformation pace slower than needed',
        'operational',
        'critical',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Talent attraction and retention in competitive market',
        'operational',
        'high',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Budget constraints vs innovation needs',
        'operational',
        'critical',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regulatory and compliance complexity increasing',
        'operational',
        'high',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Cross-portfolio coordination at scale',
        'operational',
        'high',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Proving medical affairs ROI to board',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Leading digital transformation at organizational scale',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing 200+ person organization',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Staying ahead of industry disruption',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building sustainable organizational model',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Corporate medical strategy and vision',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'C-suite and board engagement',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Digital and innovation leadership',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'VP leadership and oversight',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'External thought leadership',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Executive Dashboard',
        'daily',
        'expert',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Strategic Planning',
        'weekly',
        'expert',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Analytics',
        'weekly',
        'proficient',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'ERP/SAP',
        'monthly',
        'proficient',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Board Portals',
        'monthly',
        'proficient',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Chief Executive Officer',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Board of Directors',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'VP Medical Affairs (8)',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for formal, Teams for daily, executive calls',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'strategic_executive',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '24_hours',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'executive_visionary',
        4
    );

END $$;


-- ========================================
-- Persona 10: Dr. Margaret O'Connor
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Margaret O''Connor',
        'dr-margaret-oconnor-cmo-mid-pharma',
        'Chief Medical Officer - Mid-Size Pharma',
        'c-suite',
        28,
        5,
        28,
        '50-60',
        'MD',
        'Chief Executive Officer',
        80,
        40000000,
        'Boston, MA',
        'hybrid',
        'job_role',
        TRUE,
        'approved'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;

    -- Clean up old related data for re-deployment
    DELETE FROM persona_goals WHERE persona_id = v_persona_id;
    DELETE FROM persona_pain_points WHERE persona_id = v_persona_id;
    DELETE FROM persona_challenges WHERE persona_id = v_persona_id;
    DELETE FROM persona_responsibilities WHERE persona_id = v_persona_id;
    DELETE FROM persona_tools WHERE persona_id = v_persona_id;
    DELETE FROM persona_internal_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_external_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_communication_preferences WHERE persona_id = v_persona_id;


    -- Goal 1
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build scalable medical organization for growth',
        'primary',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Support 2 major launches with integrated medical strategy',
        'primary',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Develop digital-first engagement model',
        'primary',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Establish medical excellence culture',
        'primary',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Create transparent ROI measurement system',
        'primary',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited budget vs ambitions - constant trade-offs',
        'operational',
        'critical',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Small team wearing multiple hats',
        'operational',
        'critical',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Scaling processes as company grows',
        'operational',
        'high',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Attracting talent to smaller company',
        'operational',
        'high',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Technology and tools lag large pharma',
        'operational',
        'high',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited resources for innovation',
        'operational',
        'critical',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Doing more with less resources',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building scalable processes',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Competing with large pharma for talent',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Implementing systems and tools efficiently',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Maintaining quality with limited budget',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Medical strategy and execution',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team leadership and development',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Launch support and execution',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Systems and process optimization',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Investor and board relations',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Microsoft Tools',
        'daily',
        'expert',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Salesforce',
        'daily',
        'proficient',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Analytics',
        'weekly',
        'proficient',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Project Mgmt',
        'daily',
        'proficient',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Collaboration',
        'daily',
        'expert',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Chief Executive Officer',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Board of Directors',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Direct Reports (5)',
        'weekly',
        'cross_functional',
        'medium'
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for formal, Teams for daily, calls for strategy',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'efficient_action',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '24_hours',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'pragmatic_motivating',
        4
    );

END $$;


COMMIT;

-- Verification Query
SELECT
    p.name,
    p.title,
    p.slug,
    p.seniority_level,
    COUNT(DISTINCT g.id) as goals,
    COUNT(DISTINCT pp.id) as pain_points,
    COUNT(DISTINCT ch.id) as challenges,
    COUNT(DISTINCT r.id) as responsibilities,
    COUNT(DISTINCT t.id) as tools,
    COUNT(DISTINCT ins.id) + COUNT(DISTINCT exs.id) as stakeholders
FROM personas p
LEFT JOIN persona_goals g ON g.persona_id = p.id
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
LEFT JOIN persona_challenges ch ON ch.persona_id = p.id
LEFT JOIN persona_responsibilities r ON r.persona_id = p.id
LEFT JOIN persona_tools t ON t.persona_id = p.id
LEFT JOIN persona_internal_stakeholders ins ON ins.persona_id = p.id
LEFT JOIN persona_external_stakeholders exs ON exs.persona_id = p.id
WHERE p.slug LIKE '%msl%'
  AND p.deleted_at IS NULL
GROUP BY p.id, p.name, p.title, p.slug, p.seniority_level
ORDER BY p.created_at DESC
LIMIT 10;
