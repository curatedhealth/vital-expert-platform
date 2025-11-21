-- MSL Personas Phase 1 - Deployment
-- Generated: 2025-11-17T14:04:56.198258
-- Source: MEDICAL_AFFAIRS_MSL_PERSONAS_PHASE1 (1).json
-- Personas: 5

BEGIN;


-- ========================================
-- Persona 1: Dr. Emma Rodriguez
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        function_slug, department_slug, seniority_level,
        industry_context, persona_type, is_primary, status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Emma Rodriguez',
        'dr-emma-rodriguez-msl-early-career',
        'Medical Science Liaison - Early Career',
        'medical-affairs',
        'field-medical',
        'senior',
        'pharmaceutical',
        'job_role',
        TRUE,
        'active'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;


    -- Core Profile
    INSERT INTO persona_core_profile (
        persona_id, tenant_id,
        age_range, location, education_level
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        '28-35',
        'Boston, MA',
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET age_range = EXCLUDED.age_range,
        location = EXCLUDED.location,
        education_level = EXCLUDED.education_level;


    -- Professional Context
    INSERT INTO persona_professional_context (
        persona_id, tenant_id,
        current_role, department, reports_to,
        team_size, direct_reports, budget_responsibility
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Medical Science Liaison - Early Career',
        'Field Medical',
        'Regional MSL Manager',
        0,
        0,
        0
    ) ON CONFLICT (persona_id) DO UPDATE
    SET current_role = EXCLUDED.current_role,
        department = EXCLUDED.department;


    -- Experience
    INSERT INTO persona_experience (
        persona_id, tenant_id,
        years_in_role, years_in_function, years_in_industry
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        NULL,
        NULL,
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET years_in_role = EXCLUDED.years_in_role,
        years_in_function = EXCLUDED.years_in_function,
        years_in_industry = EXCLUDED.years_in_industry;


    -- Work Context
    INSERT INTO persona_work_context (
        persona_id, tenant_id,
        work_arrangement, travel_frequency
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        NULL,
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET work_arrangement = EXCLUDED.work_arrangement,
        travel_frequency = EXCLUDED.travel_frequency;


    -- Goal 1
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build foundational relationships with 15 key opinion leaders in my territory',
        'professional',
        '6_months',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Complete MSL certification program and achieve proficiency in scientific exchange',
        'professional',
        '12_months',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Support patient enrollment in 2 clinical trials through site engagement',
        'professional',
        '12_months',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Develop deep immuno-oncology expertise',
        'professional',
        '3_years',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Contribute to 1 peer-reviewed publication as co-author',
        'professional',
        '24_months',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited established KOL relationships - building credibility from scratch',
        'operational',
        'high',
        'daily',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Overwhelmed by volume of oncology literature while managing field schedule',
        'operational',
        'high',
        'daily',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Uncertain navigating complex off-label discussions with renowned KOLs',
        'operational',
        'high',
        'weekly',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Need extensive coaching that requires significant manager time',
        'operational',
        'medium',
        'weekly',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'CRM documentation feels onerous while learning role',
        'operational',
        'medium',
        'daily',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Imposter syndrome engaging with KOLs who have 20+ years experience',
        'operational',
        'high',
        'weekly',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building confidence for independent engagement with thought leaders',
        'operational',
        'high',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing field visits, learning, and administrative requirements',
        'operational',
        'high',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Knowing when to escalate vs. handle independently',
        'operational',
        'medium',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing emotional impact of imposter syndrome',
        'operational',
        'high',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Keeping pace with rapid oncology innovation',
        'operational',
        'high',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'KOL engagement and relationship building',
        40,
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Learning TA, protocols, and products',
        25,
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Clinical trial site support',
        15,
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'CRM documentation',
        10,
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Internal meetings and training',
        10,
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Veeva CRM',
        'daily',
        'intermediate',
        '',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PubMed',
        'daily',
        'advanced',
        '',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Veeva Engage',
        'weekly',
        'intermediate',
        '',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'advanced',
        '',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PowerPoint',
        'weekly',
        'advanced',
        '',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Mendeley',
        'weekly',
        'intermediate',
        '',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Regional MSL Manager',
        'weekly',
        1
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Senior MSL Peer',
        'weekly',
        2
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Medical Information Manager',
        'weekly',
        3
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for scheduling, Teams for quick questions, phone for KOL follow-up',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'in_person',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '24_hours',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'diplomatic',
        4
    );


    -- Quote 1
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'I love the science but constantly worry about saying something wrong with KOLs.',
        '',
        1
    );


    -- Quote 2
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Every KOL interaction is a learning opportunity. I prep for hours before each meeting.',
        '',
        2
    );


    -- Quote 3
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'I wish there was an AI tool to help me synthesize latest trial data before KOL meetings.',
        '',
        3
    );

END $$;


-- ========================================
-- Persona 2: Dr. James Chen
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        function_slug, department_slug, seniority_level,
        industry_context, persona_type, is_primary, status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. James Chen',
        'dr-james-chen-msl-experienced',
        'Medical Science Liaison - Experienced',
        'medical-affairs',
        'field-medical',
        'senior',
        'pharmaceutical',
        'job_role',
        TRUE,
        'active'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;


    -- Core Profile
    INSERT INTO persona_core_profile (
        persona_id, tenant_id,
        age_range, location, education_level
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        '35-42',
        'Chicago, IL',
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET age_range = EXCLUDED.age_range,
        location = EXCLUDED.location,
        education_level = EXCLUDED.education_level;


    -- Professional Context
    INSERT INTO persona_professional_context (
        persona_id, tenant_id,
        current_role, department, reports_to,
        team_size, direct_reports, budget_responsibility
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Medical Science Liaison - Experienced',
        'Field Medical',
        'Regional MSL Manager',
        0,
        0,
        0
    ) ON CONFLICT (persona_id) DO UPDATE
    SET current_role = EXCLUDED.current_role,
        department = EXCLUDED.department;


    -- Experience
    INSERT INTO persona_experience (
        persona_id, tenant_id,
        years_in_role, years_in_function, years_in_industry
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        NULL,
        NULL,
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET years_in_role = EXCLUDED.years_in_role,
        years_in_function = EXCLUDED.years_in_function,
        years_in_industry = EXCLUDED.years_in_industry;


    -- Work Context
    INSERT INTO persona_work_context (
        persona_id, tenant_id,
        work_arrangement, travel_frequency
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        NULL,
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET work_arrangement = EXCLUDED.work_arrangement,
        travel_frequency = EXCLUDED.travel_frequency;


    -- Goal 1
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Maintain active relationships with 25+ KOLs across territory',
        'professional',
        'ongoing',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Support enrollment in 3 investigator-initiated trials',
        'professional',
        '12_months',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Mentor 1-2 early-career MSLs',
        'professional',
        'ongoing',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Co-author 2 peer-reviewed publications',
        'professional',
        '18_months',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Expand into adjacent TA to support portfolio growth',
        'professional',
        '24_months',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Territory expansion competing with established competitors',
        'operational',
        'high',
        'weekly',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited time for strategic planning with increasing operational demands',
        'operational',
        'high',
        'daily',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing mentoring junior MSLs with own KOL engagement',
        'operational',
        'medium',
        'weekly',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Rapid innovation in cell therapy making knowledge maintenance challenging',
        'operational',
        'high',
        'weekly',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited visibility to commercial strategy and competitive positioning',
        'operational',
        'medium',
        'monthly',
        5
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Staying current with rapid innovation in hematologic malignancies',
        'operational',
        'high',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Expanding reach while maintaining relationship depth',
        'operational',
        'high',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Transitioning from execution to strategic thinking',
        'operational',
        'medium',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing competing priorities from field and HQ',
        'operational',
        'medium',
        4
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'KOL relationship management and strategic planning',
        45,
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Clinical trial support and investigator engagement',
        20,
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Junior MSL mentoring',
        15,
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publication strategy and collaboration',
        10,
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Administrative and reporting',
        10,
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Veeva CRM',
        'daily',
        'advanced',
        '',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PubMed',
        'daily',
        'expert',
        '',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Veeva Engage',
        'weekly',
        'advanced',
        '',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'advanced',
        '',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'SalesForce Analytics',
        'weekly',
        'advanced',
        '',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Literature Management',
        'daily',
        'expert',
        '',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Regional Director',
        'monthly',
        1
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Early Career MSL (mentee)',
        'weekly',
        2
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Medical Affairs Strategy Team',
        'monthly',
        3
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for formal updates, Teams for daily, phone for strategic discussions',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'mixed_in_person_virtual',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '24_hours',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'direct_professional',
        4
    );


    -- Quote 1
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'My KOLs trust me to bring them insights they can''t get elsewhere. That''s the real value.',
        '',
        1
    );


    -- Quote 2
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'The hardest part is keeping up with the science while being in the field.',
        '',
        2
    );


    -- Quote 3
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'I need tools that help me synthesize information faster so I can focus on relationships and strategy.',
        '',
        3
    );

END $$;


-- ========================================
-- Persona 3: Dr. Sarah Mitchell
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        function_slug, department_slug, seniority_level,
        industry_context, persona_type, is_primary, status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Sarah Mitchell',
        'dr-sarah-mitchell-msl-senior',
        'Senior Medical Science Liaison',
        'medical-affairs',
        'field-medical',
        'senior',
        'pharmaceutical',
        'job_role',
        TRUE,
        'active'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;


    -- Core Profile
    INSERT INTO persona_core_profile (
        persona_id, tenant_id,
        age_range, location, education_level
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        '42-50',
        'New York, NY',
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET age_range = EXCLUDED.age_range,
        location = EXCLUDED.location,
        education_level = EXCLUDED.education_level;


    -- Professional Context
    INSERT INTO persona_professional_context (
        persona_id, tenant_id,
        current_role, department, reports_to,
        team_size, direct_reports, budget_responsibility
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Senior Medical Science Liaison',
        'Field Medical',
        'Regional Director, Medical Affairs',
        0,
        0,
        0
    ) ON CONFLICT (persona_id) DO UPDATE
    SET current_role = EXCLUDED.current_role,
        department = EXCLUDED.department;


    -- Experience
    INSERT INTO persona_experience (
        persona_id, tenant_id,
        years_in_role, years_in_function, years_in_industry
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        NULL,
        NULL,
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET years_in_role = EXCLUDED.years_in_role,
        years_in_function = EXCLUDED.years_in_function,
        years_in_industry = EXCLUDED.years_in_industry;


    -- Work Context
    INSERT INTO persona_work_context (
        persona_id, tenant_id,
        work_arrangement, travel_frequency
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        NULL,
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET work_arrangement = EXCLUDED.work_arrangement,
        travel_frequency = EXCLUDED.travel_frequency;


    -- Goal 1
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build national KOL network with 50+ established relationships',
        'professional',
        'ongoing',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Lead 2-3 publication collaborations with KOLs',
        'professional',
        '18_months',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Chair or co-chair advisory board for new indication',
        'professional',
        '12_months',
        2,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Shape Medical Affairs strategy for region',
        'professional',
        'ongoing',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Mentor next generation of field medical leaders',
        'professional',
        'ongoing',
        3,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Tension between field time and strategic responsibilities',
        'operational',
        'high',
        'daily',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited C-suite visibility despite strategic impact',
        'operational',
        'medium',
        'monthly',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Difficulty retaining top talent in competitive field',
        'operational',
        'high',
        'quarterly',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Rapid evolution of digital/data-driven medical engagement',
        'operational',
        'high',
        'weekly',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing personalized KOL engagement with organizational scale',
        'operational',
        'medium',
        'weekly',
        5
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Evolving role from execution to strategic leadership',
        'operational',
        'high',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Staying clinically relevant while in administrative role',
        'operational',
        'medium',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Driving organizational change in field medical',
        'operational',
        'high',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing team talent and succession planning',
        'operational',
        'high',
        4
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'National KOL engagement and thought leadership',
        35,
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Strategic planning and organizational leadership',
        30,
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publication strategy and oversight',
        15,
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team leadership and mentoring',
        15,
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Cross-functional strategic alignment',
        5,
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Executive Dashboard',
        'daily',
        'expert',
        '',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PubMed/Literature',
        'weekly',
        'expert',
        '',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'advanced',
        '',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Strategic Planning Tools',
        'monthly',
        'advanced',
        '',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Tableau Analytics',
        'weekly',
        'advanced',
        '',
        5
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Chief Medical Officer',
        'monthly',
        1
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Regional Medical Affairs Leadership',
        'weekly',
        2
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Commercial Leadership',
        'monthly',
        3
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for documentation, phone for strategic discussions, in-person for important meetings',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'in_person_strategic',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '24_hours',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'executive_strategic',
        4
    );


    -- Quote 1
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'My value is in shaping how the field engages with medical community long-term.',
        '',
        1
    );


    -- Quote 2
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'The biggest challenge is scaling personalized KOL relationships across an organization.',
        '',
        2
    );


    -- Quote 3
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'We need strategic tools that help us understand the medical landscape at scale.',
        '',
        3
    );

END $$;


-- ========================================
-- Persona 4: Dr. Marcus Johnson
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        function_slug, department_slug, seniority_level,
        industry_context, persona_type, is_primary, status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Marcus Johnson',
        'dr-marcus-johnson-msl-oncology',
        'Medical Science Liaison - Oncology',
        'medical-affairs',
        'field-medical',
        'senior',
        'pharmaceutical',
        'job_role',
        TRUE,
        'active'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;


    -- Core Profile
    INSERT INTO persona_core_profile (
        persona_id, tenant_id,
        age_range, location, education_level
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        '38-45',
        'Houston, TX',
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET age_range = EXCLUDED.age_range,
        location = EXCLUDED.location,
        education_level = EXCLUDED.education_level;


    -- Professional Context
    INSERT INTO persona_professional_context (
        persona_id, tenant_id,
        current_role, department, reports_to,
        team_size, direct_reports, budget_responsibility
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Medical Science Liaison - Oncology',
        'Field Medical',
        'TA Medical Director',
        0,
        0,
        0
    ) ON CONFLICT (persona_id) DO UPDATE
    SET current_role = EXCLUDED.current_role,
        department = EXCLUDED.department;


    -- Experience
    INSERT INTO persona_experience (
        persona_id, tenant_id,
        years_in_role, years_in_function, years_in_industry
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        NULL,
        NULL,
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET years_in_role = EXCLUDED.years_in_role,
        years_in_function = EXCLUDED.years_in_function,
        years_in_industry = EXCLUDED.years_in_industry;


    -- Work Context
    INSERT INTO persona_work_context (
        persona_id, tenant_id,
        work_arrangement, travel_frequency
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        NULL,
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET work_arrangement = EXCLUDED.work_arrangement,
        travel_frequency = EXCLUDED.travel_frequency;


    -- Goal 1
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Become go-to CAR-T and immunotherapy expert in territory',
        'professional',
        '12_months',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Support CAR-T patient identification and enrollment',
        'professional',
        'ongoing',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build relationships with 20+ CAR-T treating centers',
        'professional',
        '18_months',
        1,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Co-author 2 thought leadership articles',
        'professional',
        '24_months',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Support clinical trial enrollment for 2+ studies',
        'professional',
        'ongoing',
        2,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Rapid innovation in oncology and CAR-T field - hard to stay current',
        'operational',
        'very_high',
        'daily',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Complexity of combination therapy discussions with KOLs',
        'operational',
        'high',
        'weekly',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Off-label and post-approval questions increasing in frequency',
        'operational',
        'high',
        'weekly',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Need to understand complex mechanisms in rapidly evolving space',
        'operational',
        'very_high',
        'daily',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Competition from other companies'' specialized MSLs',
        'operational',
        'high',
        'ongoing',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited time for deep learning with high field engagement demands',
        'operational',
        'high',
        'daily',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Keeping pace with CAR-T and immunotherapy innovation',
        'operational',
        'very_high',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Developing deep expertise in evolving field',
        'operational',
        'very_high',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing complex MOA discussions with diverse KOL backgrounds',
        'operational',
        'high',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Differentiating in crowded specialty TA',
        'operational',
        'high',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing patient safety with KOL engagement',
        'operational',
        'high',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'CAR-T and immunotherapy expertise development',
        35,
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'KOL engagement in oncology specialty',
        35,
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Patient identification and enrollment support',
        15,
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Thought leadership and publications',
        10,
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Training and team support',
        5,
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Veeva CRM',
        'daily',
        'advanced',
        '',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PubMed',
        'daily',
        'expert',
        '',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Journal Clubs & Webinars',
        'weekly',
        'advanced',
        '',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'ASCO/ASH Platforms',
        'quarterly',
        'advanced',
        '',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'CAR-T Registry',
        'weekly',
        'advanced',
        '',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'advanced',
        '',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'TA Medical Director',
        'weekly',
        1
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Medical Safety Team',
        'weekly',
        2
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Clinical Oncology Specialists',
        'bi_weekly',
        3
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Phone for urgent, Email for documentation, Teams for daily updates',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'in_person_for_complex',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '4_hours_urgent',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'detailed_technical',
        4
    );


    -- Quote 1
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'CAR-T evolves so fast that I''m constantly learning just to stay relevant.',
        '',
        1
    );


    -- Quote 2
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'My KOLs expect me to know mechanisms as well as they do - sometimes better.',
        '',
        2
    );


    -- Quote 3
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'I need AI tools that can help me synthesize the latest CAR-T trial data in real-time.',
        '',
        3
    );

END $$;


-- ========================================
-- Persona 5: Dr. Lisa Park
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        function_slug, department_slug, seniority_level,
        industry_context, persona_type, is_primary, status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Lisa Park',
        'dr-lisa-park-msl-rare-disease',
        'Medical Science Liaison - Rare Disease',
        'medical-affairs',
        'field-medical',
        'senior',
        'pharmaceutical',
        'job_role',
        TRUE,
        'active'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;


    -- Core Profile
    INSERT INTO persona_core_profile (
        persona_id, tenant_id,
        age_range, location, education_level
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        '36-44',
        'San Francisco, CA',
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET age_range = EXCLUDED.age_range,
        location = EXCLUDED.location,
        education_level = EXCLUDED.education_level;


    -- Professional Context
    INSERT INTO persona_professional_context (
        persona_id, tenant_id,
        current_role, department, reports_to,
        team_size, direct_reports, budget_responsibility
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Medical Science Liaison - Rare Disease',
        'Field Medical',
        'Rare Disease Medical Director',
        0,
        0,
        0
    ) ON CONFLICT (persona_id) DO UPDATE
    SET current_role = EXCLUDED.current_role,
        department = EXCLUDED.department;


    -- Experience
    INSERT INTO persona_experience (
        persona_id, tenant_id,
        years_in_role, years_in_function, years_in_industry
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        NULL,
        NULL,
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET years_in_role = EXCLUDED.years_in_role,
        years_in_function = EXCLUDED.years_in_function,
        years_in_industry = EXCLUDED.years_in_industry;


    -- Work Context
    INSERT INTO persona_work_context (
        persona_id, tenant_id,
        work_arrangement, travel_frequency
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        NULL,
        NULL
    ) ON CONFLICT (persona_id) DO UPDATE
    SET work_arrangement = EXCLUDED.work_arrangement,
        travel_frequency = EXCLUDED.travel_frequency;


    -- Goal 1
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Build expert network with all major treating centers for rare disease',
        'professional',
        '18_months',
        1,
        1
    );


    -- Goal 2
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Support patient registry enrollment and natural history studies',
        'professional',
        'ongoing',
        1,
        2
    );


    -- Goal 3
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Engage patient advocacy groups effectively and authentically',
        'professional',
        'ongoing',
        1,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Co-author 2-3 rare disease publications',
        'professional',
        '24_months',
        2,
        4
    );


    -- Goal 5
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Develop compassionate use and expanded access programs',
        'professional',
        '12_months',
        2,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Tiny patient population - difficult to build KOL relationships at scale',
        'operational',
        'very_high',
        'daily',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Knowledge gaps on natural history and long-term outcomes',
        'operational',
        'very_high',
        'daily',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Complexity of compassionate use and expanded access mechanics',
        'operational',
        'high',
        'weekly',
        3
    );


    -- Pain Point 4
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Patient advocacy dynamics and authentic engagement',
        'operational',
        'high',
        'weekly',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Limited commercial data to support value propositions',
        'operational',
        'high',
        'ongoing',
        5
    );


    -- Pain Point 6
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regulatory complexity with orphan drugs',
        'operational',
        'high',
        'monthly',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building relationships in ultra-small patient population',
        'operational',
        'very_high',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Understanding and filling natural history knowledge gaps',
        'operational',
        'very_high',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Engaging authentically with patient advocacy groups',
        'operational',
        'high',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Navigating orphan drug regulatory complexity',
        'operational',
        'high',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Long-term patient relationships with limited engagement points',
        'operational',
        'high',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Treating center and expert KOL engagement',
        35,
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Patient advocacy and community engagement',
        25,
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Patient registry and natural history research',
        20,
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Compassionate use program support',
        12,
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regulatory and compliance coordination',
        8,
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Patient Registry Platforms',
        'daily',
        'expert',
        '',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PubMed',
        'daily',
        'expert',
        '',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Patient Advocacy Networks',
        'weekly',
        'advanced',
        '',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'advanced',
        '',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Veeva CRM',
        'daily',
        'advanced',
        '',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regulatory Databases',
        'weekly',
        'advanced',
        '',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Rare Disease Medical Director',
        'weekly',
        1
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Patient Advocacy Team',
        'weekly',
        2
    );


    -- Internal Stakeholder 3
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'internal',
        'Regulatory Affairs',
        'monthly',
        3
    );


    -- Communication Preference: preferred_channels
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'preferred_channels',
        'Email for formal, phone for patient advocacy discussions, Zoom for flexibility',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'flexible_virtual',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '24_hours',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'empathetic_technical',
        4
    );


    -- Quote 1
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'With rare disease, every patient and family matters. The stakes are incredibly high.',
        '',
        1
    );


    -- Quote 2
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'I need to understand natural history gaps to help researchers and clinicians move the field forward.',
        '',
        2
    );


    -- Quote 3
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'An AI tool that could help synthesize rare disease literature and connect insights would be transformative.',
        '',
        3
    );

END $$;


COMMIT;

-- Verification
SELECT
    p.name,
    p.title,
    p.slug,
    COUNT(DISTINCT g.id) as goals,
    COUNT(DISTINCT pp.id) as pain_points,
    COUNT(DISTINCT ch.id) as challenges,
    COUNT(DISTINCT r.id) as responsibilities
FROM personas p
LEFT JOIN persona_goals g ON g.persona_id = p.id
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
LEFT JOIN persona_challenges ch ON ch.persona_id = p.id
LEFT JOIN persona_responsibilities r ON r.persona_id = p.id
WHERE p.slug LIKE '%msl%'
GROUP BY p.id, p.name, p.title, p.slug
ORDER BY p.created_at DESC
LIMIT 5;
