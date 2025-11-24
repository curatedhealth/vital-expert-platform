-- MSL Personas Phase 1 - Deployment (Final Corrected)
-- Generated: 2025-11-17T15:06:05.837287
-- Source: MEDICAL_AFFAIRS_MSL_PERSONAS_PHASE1 (1).json
-- Personas: 10

BEGIN;


-- ========================================
-- Persona 1: Dr. Robert Williams
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
        'Dr. Robert Williams',
        'dr-robert-williams-heor-director-academic',
        'HEOR Director - Academic Researcher',
        'director',
        22,
        6,
        22,
        '48-55',
        'PhD Health Economics',
        'VP Medical Affairs',
        8,
        2500000,
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
        'Publish 3-4 manuscripts in top-tier journals (JAMA, NEJM)',
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
        'Establish 2 new university research partnerships',
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
        'Secure NIH or PCORI grant funding',
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
        'Build academic credibility while maintaining scientific rigor',
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
        'Mentor 2 junior team members toward publication leadership',
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
        'Tension between academic credibility and commercial needs',
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
        'Publication timelines 12-18 months vs business needs',
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
        'Difficulty maintaining NIH collaborations while in industry',
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
        'Internal pressure for quick commercial analysis vs rigorous methodology',
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
        'Peer reviewers scrutinize industry-sponsored research heavily',
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
        'Limited time for deep methodological work with operational demands',
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
        'Balancing scientific rigor with commercial timelines',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Maintaining academic reputation in industry role',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Securing high-impact journal publications with industry affiliation',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building credible academic partnerships from commercial role',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing team expectations for publication timeline',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Research strategy and academic publication leadership',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'University partnerships and investigator-initiated studies',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team leadership and mentoring',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Methodology development and scientific rigor',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Cross-functional collaboration',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'SAS',
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
        'R/RStudio',
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
        'Stata',
        'weekly',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'EndNote',
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
        'TreeAge Pro',
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
        'Excel',
        'daily',
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
        'Chief Medical Officer',
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
        'HEOR Team',
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
        'Email, Zoom, in-person for strategic',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'scheduled_focused',
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
        'analytical_academic',
        4
    );

END $$;


-- ========================================
-- Persona 2: Dr. Jennifer Brown
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
        'Dr. Jennifer Brown',
        'dr-jennifer-brown-heor-director-commercial',
        'HEOR Director - Commercial Champion',
        'director',
        18,
        5,
        18,
        '42-50',
        'PharmD/MBA',
        'VP Medical Affairs',
        10,
        3000000,
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
        'Develop value propositions driving 20% sales lift',
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
        'Achieve 5 formulary wins through payer engagement',
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
        'Create sales force training on value story',
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
        'Establish quarterly business review process with key accounts',
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
        'Mentor team in commercial health economics',
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
        'high',
        1
    );


    -- Pain Point 2
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Payer rejection of value propositions',
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
        'Launch timelines compressed with evidence gaps',
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
        'Slow BIM turnaround vs field needs',
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
        'Managing expectations for timeline vs quality',
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
        'Limited analytics capability for real-time insights',
        'operational',
        'medium',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Proving ROI of health economics investments',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Accelerating evidence generation without compromising quality',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Bridging clinical and commercial perspectives',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing stakeholder expectations for value story',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building field medical and commercial alignment',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Value proposition development and commercial strategy',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Payer engagement and account management',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Sales force training and enablement',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team leadership and budget management',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Business analysis and ROI measurement',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Excel',
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
        'Tableau',
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
        'Salesforce',
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
        'TreeAge Pro',
        'weekly',
        'competent',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
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
        'Marketing',
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
        'Email for formal, Teams for quick, in-person for strategy',
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
        'direct_business',
        4
    );

END $$;


-- ========================================
-- Persona 3: Dr. Michael Davis
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
        'Dr. Michael Davis',
        'dr-michael-davis-heor-director-payer',
        'HEOR Director - Payer Value Lead',
        'director',
        20,
        6,
        20,
        '45-52',
        'PhD/MPH',
        'VP Medical Affairs',
        7,
        2000000,
        'Pennsylvania',
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
        'Win 4 P&T committee approvals with preferred status',
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
        'Establish advisory board with 8 leading payers',
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
        'Develop 3 regional payer value strategies',
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
        'Support 5 contract negotiations with data-driven stories',
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
        'Build team capability in payer engagement',
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
        'Payer skepticism of company-sponsored data',
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
        'BIM assumptions challenged repeatedly',
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
        'Managed care complexity across regions and plans',
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
        'Need for third-party validation of analyses',
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
        'Limited access to real-world claims data',
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
        'Short turnaround times for P&T presentations',
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
        'Building credibility with payers as internal employee',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Rapidly responding to payer requests with quality analyses',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing bias concerns in analyses',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Staying current with evolving payer priorities',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Educating payers on methodology limitations',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'P&T committee preparation and presentations',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Payer advisory board management',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Health economics analysis and modeling',
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
        'Managed care market analysis',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Excel',
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
        'R/SAS',
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
        'TreeAge',
        'weekly',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PowerPoint',
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
        'Teams',
        'daily',
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
        'VP Market Access',
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
        'Legal/Compliance',
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
        'structured_data_focused',
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
        'analytical_precise',
        4
    );

END $$;


-- ========================================
-- Persona 4: Dr. Amanda Lee
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
        'Dr. Amanda Lee',
        'dr-amanda-lee-heor-director-global',
        'HEOR Director - Market Access Global',
        'director',
        19,
        5,
        19,
        '43-51',
        'PhD Economics',
        'VP Medical Affairs',
        12,
        4000000,
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
        'Achieve NICE, G-BA, and HAS approvals within 18 months',
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
        'Develop global market access strategy for 3 major markets',
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
        'Establish 2 new country reimbursement success stories',
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
        'Build coordinated global evidence generation plan',
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
        'Mentor team in multi-country HTA navigation',
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
        'Heterogeneous HTA requirements across Europe/APAC',
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
        'Coordinating evidence generation globally',
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
        'Local reimbursement price pressures',
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
        'Time zone collaboration complexity',
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
        'Country-specific data unavailability',
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
        'Managing multiple stakeholder expectations',
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
        'Navigating diverse HTA methodologies (NICE vs G-BA vs HAS)',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Ensuring country-specific evidence while maintaining consistency',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Coordinating global team across 8+ time zones',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing budget allocations across countries',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building relationships with multiple HTA bodies',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Global market access strategy and planning',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Multi-country HTA dossier development',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team leadership and coordination',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Payer and HTA body engagement',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Budget and resource management',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Excel',
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
        'Tableau',
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
        'R/SAS',
        'weekly',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'HTA Software',
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
        'Teams',
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
        'Regional Directors',
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
        'Email for documentation, Teams for daily, calls for strategy',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'structured_timezone_friendly',
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
        'collaborative_strategic',
        4
    );

END $$;


-- ========================================
-- Persona 5: Dr. Kevin Martinez
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
        'Dr. Kevin Martinez',
        'dr-kevin-martinez-heor-director-digital',
        'HEOR Director - Digital Health',
        'director',
        15,
        3,
        15,
        '38-46',
        'PhD/MS Informatics',
        'VP Medical Affairs',
        6,
        1800000,
        'San Francisco, CA',
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
        'Develop digital biomarker evidence package for product',
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
        'Establish FDA RWE pathway for digital health app',
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
        'Generate 2 publications on wearable device validation',
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
        'Build real-world data infrastructure',
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
        'Mentor team in digital health methodologies',
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
        'Digital health evidence gap - no established methodology',
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
        'Wearable device validation complex and expensive',
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
        'Regulatory pathway for digital evidence still unclear',
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
        'Reimbursement uncertainty for digital therapeutics',
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
        'Data privacy and security concerns',
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
        'Paucity of published validation studies',
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
        'Establishing validation for digital biomarkers',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Navigating FDA regulatory guidance for emerging tech',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing payer expectations for digital app evidence',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Securing partnerships with digital health companies',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Keeping pace with digital health innovation',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Digital health evidence strategy and development',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'FDA pathway navigation for digital apps',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Wearable and remote monitoring studies',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team leadership and innovation',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'External partnerships and collaboration',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Python/R',
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
        'AWS',
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
        'Machine Learning',
        'weekly',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Wearable APIs',
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
        'Jupyter/Notebooks',
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
        'GitHub',
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
        'Innovation Team',
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
        'Regulatory Affairs',
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
        'Slack for quick, Teams for meetings, email for formal',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'collaborative_innovation',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        '4_hours',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'technical_agile',
        4
    );

END $$;


-- ========================================
-- Persona 6: Sarah Thompson
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
        'Sarah Thompson',
        'sarah-thompson-heor-analyst-junior',
        'HEOR Analyst - Junior (0-3 years)',
        'mid-level',
        2,
        2,
        2,
        '25-30',
        'MS Health Economics',
        'HEOR Director',
        0,
        0,
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
        'Master budget impact model development',
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
        'Learn CEA methodology thoroughly',
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
        'Become independent on standard analyses',
        'primary',
        1,
        3
    );


    -- Goal 4
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_type, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Develop R programming skills',
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
        'Contribute to 1 publication',
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
        'Steep learning curve on modeling concepts',
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
        'Excel limitations for complex analysis',
        'operational',
        'medium',
        2
    );


    -- Pain Point 3
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Modeling assumptions unclear - needs frequent clarification',
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
        'Need for extensive supervision slows productivity',
        'operational',
        'medium',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Imposter syndrome in high-pressure healthcare environment',
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
        'Limited mentoring time from busy director',
        'operational',
        'medium',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Mastering health economic methodologies',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building statistical programming skills',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Handling complex real-world data',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing perfectionism in analytical work',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Gaining confidence with stakeholder interactions',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Budget impact model development',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Literature review and data compilation',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Excel modeling and analysis',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Administrative tasks and reporting',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Training and professional development',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Excel',
        'daily',
        'competent',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'R/RStudio',
        'weekly',
        'beginner',
        2
    );


    -- Tool 3
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'SAS',
        'monthly',
        'beginner',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PowerPoint',
        'weekly',
        'competent',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
        'daily',
        'competent',
        5
    );


    -- Tool 6
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PubMed',
        'daily',
        'competent',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'HEOR Director',
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
        'Senior Analyst Mentor',
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
        'Data Team',
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
        'Teams for quick, email for formal, in-person for training',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'learning_focused',
        2
    );


    -- Communication Preference: response_expectation
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'response_expectation',
        'same_day',
        3
    );


    -- Communication Preference: communication_style
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'communication_style',
        'enthusiastic_learning',
        4
    );

END $$;


-- ========================================
-- Persona 7: John Anderson
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
        'John Anderson',
        'john-anderson-heor-analyst-mid',
        'HEOR Analyst - Mid (4-7 years)',
        'mid-level',
        6,
        5,
        6,
        '30-36',
        'PhD candidate Economics',
        'HEOR Director',
        0,
        200000,
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
        'Achieve independent status on complex BIM/CEA',
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
        'Present to 3 payer P&T committees',
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
        'Publish first-author paper in health economics journal',
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
        'Develop expertise in advanced modeling techniques',
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
        'Mentor junior analyst',
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
        'Project overload vs quality standards',
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
        'Anxiety about payer presentations',
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
        'Publication process slower than expected',
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
        'Balancing PhD studies with full-time work',
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
        'Limited time for methodological innovation',
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
        'Unclear career progression path',
        'operational',
        'medium',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing multiple concurrent projects',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building confidence for external presentations',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Transitioning from support to lead role',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Maintaining work-life balance with PhD',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publishing quality work in competitive field',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Lead BIM and CEA projects',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Payer presentations and engagement',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Statistical programming and analysis',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Junior analyst support',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publication development',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'R/RStudio',
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
        'SAS',
        'weekly',
        'competent',
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
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'TreeAge',
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
        'Teams',
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
        'GitHub',
        'weekly',
        'competent',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'HEOR Director',
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
        'Junior Analyst',
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
        'Medical Affairs Team',
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
        'Email for formal, Teams for daily, in-person for strategy',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'data_driven',
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
        'analytical_detail_oriented',
        4
    );

END $$;


-- ========================================
-- Persona 8: Dr. Maria Rodriguez
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
        'Dr. Maria Rodriguez',
        'dr-maria-rodriguez-heor-analyst-senior',
        'HEOR Analyst - Senior (8-12 years)',
        'senior',
        11,
        8,
        11,
        '36-42',
        'PhD Economics',
        'HEOR Director',
        2,
        500000,
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
        'Mentor 2-3 junior analysts to independence',
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
        'Publish 2 thought leadership pieces',
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
        'Lead complex methodology innovation project',
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
        'Establish credibility as industry thought leader',
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
        'Build capability for advanced modeling techniques',
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
        'Mentoring junior analysts takes significant time',
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
        'Limited strategic input in decision-making',
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
        'Stuck doing repetitive analyses rather than innovation',
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
        'Methodology debates drain energy',
        'operational',
        'medium',
        4
    );


    -- Pain Point 5
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Career progression unclear - stay analyst or move to leadership?',
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
        'Work-life balance with mentoring burden',
        'operational',
        'medium',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing technical excellence with mentoring',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Staying current with evolving methodologies',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Establishing thought leadership credentials',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Navigating career transition (analyst vs leadership)',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing perfectionism while mentoring',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Complex health economic analyses and innovation',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Junior analyst mentoring and supervision',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Thought leadership and publications',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Advanced methodology development',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Strategic consultation',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'R/RStudio',
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
        'SAS',
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
        'Python',
        'weekly',
        'proficient',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'TreeAge',
        'weekly',
        'expert',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Teams',
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
        'GitHub',
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
        'HEOR Director',
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
        'Junior Analysts (2)',
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
        'Medical Affairs Leadership',
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
        'Email for formal, Teams for daily, in-person for mentoring',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'strategic_collaborative',
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
        'thoughtful_mentoring',
        4
    );

END $$;


-- ========================================
-- Persona 9: Dr. David Kim
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
        'Dr. David Kim',
        'dr-david-kim-heor-analyst-modeling',
        'HEOR Analyst - Modeling Expert',
        'senior',
        14,
        6,
        14,
        '38-45',
        'PhD/MS Biostatistics',
        'HEOR Director',
        0,
        300000,
        'Philadelphia, PA',
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
        'Publish 2 methodology papers on advanced modeling',
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
        'Master discrete event simulation (DES) and microsimulation',
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
        'Develop company capability in Bayesian modeling',
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
        'Build industry recognition as modeling expert',
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
        'Mentor team on advanced statistical methods',
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
        'Model validation challenges - stakeholders don''t understand assumptions',
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
        'PSA (probabilistic sensitivity analysis) complexity overwhelming',
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
        'Constant push for simpler models when complex is more accurate',
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
        'Limited access to computational resources for complex models',
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
        'Stakeholder buy-in difficult for novel methodologies',
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
        'Professional isolation - few true modeling peers in company',
        'operational',
        'medium',
        6
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Communicating complex modeling to non-specialists',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing rigor with stakeholder understanding',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Staying current with evolving methodologies',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building computational infrastructure for advanced modeling',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Gaining acceptance for novel approaches',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Advanced modeling technique development and application',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Model validation and quality assurance',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Methodology consultation across team',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publication and thought leadership',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Technical mentoring',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'R/RStudio',
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
        'Python',
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
        'TreeAge Pro',
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
        'SimPy',
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
        'Stan/Bayesian',
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
        'Docker/Containers',
        'daily',
        'proficient',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'HEOR Director',
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
        'Medical Affairs Team',
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
        'Email for technical, Teams for quick, calls for complex',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'technical_deep_dives',
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
        'precise_methodological',
        4
    );

END $$;


-- ========================================
-- Persona 10: Dr. Emily White
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
        'Dr. Emily White',
        'dr-emily-white-heor-analyst-rwe',
        'HEOR Analyst - RWE Specialist',
        'senior',
        10,
        4,
        10,
        '34-42',
        'PharmD/MS Epidemiology',
        'HEOR Director',
        0,
        400000,
        'San Diego, CA',
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
        'Lead FDA regulatory-grade RWE studies',
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
        'Publish 2-3 RWE papers in peer-reviewed journals',
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
        'Establish credibility as RWE expert',
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
        'Collaborate with FDA on RWE guidance',
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
        'Build team capability in RWE methodology',
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
        'Claims data quality and completeness challenges',
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
        'Propensity scores and causal inference misunderstood',
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
        'Causality debates with stakeholders endless',
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
        'FDA RWE pathway still evolving - regulatory uncertainty',
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
        'Data privacy and linkage issues',
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
        'Publication process for RWE studies lengthy',
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
        'Validating RWE findings against clinical trial data',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Addressing bias in observational data',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Navigating FDA expectations for RWE',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Building stakeholder confidence in RWE results',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing data access limitations',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'RWE study design and execution',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Claims data analysis and programming',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'FDA regulatory pathway navigation',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publication development',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Methodology consultation',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'SAS',
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
        'R/RStudio',
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
        'Python',
        'weekly',
        'competent',
        3
    );


    -- Tool 4
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'SQL',
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
        'GitHub',
        'weekly',
        'competent',
        6
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'HEOR Director',
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
        'Regulatory Affairs',
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
        'Medical Affairs Team',
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
        'data_driven_collaborative',
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
        'scientific_rigorous',
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
