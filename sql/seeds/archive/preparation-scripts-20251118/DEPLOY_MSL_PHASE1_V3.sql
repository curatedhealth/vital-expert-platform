-- MSL Personas Phase 1 - Deployment (Final Corrected)
-- Generated: 2025-11-17T14:12:09.753622
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
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Emma Rodriguez',
        'dr-emma-rodriguez-msl-early-career',
        'Medical Science Liaison - Early Career',
        'mid-level',
        3,
        2,
        3,
        '28-35',
        'PharmD',
        'Regional MSL Manager',
        0,
        0,
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
        'Build foundational relationships with 15 key opinion leaders in my territory',
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
        'Complete MSL certification program and achieve proficiency in scientific exchange',
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
        'Support patient enrollment in 2 clinical trials through site engagement',
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
        'Develop deep immuno-oncology expertise',
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
        'Contribute to 1 peer-reviewed publication as co-author',
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
        'Limited established KOL relationships - building credibility from scratch',
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
        'Overwhelmed by volume of oncology literature while managing field schedule',
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
        'Uncertain navigating complex off-label discussions with renowned KOLs',
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
        'Need extensive coaching that requires significant manager time',
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
        'CRM documentation feels onerous while learning role',
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
        'Imposter syndrome engaging with KOLs who have 20+ years experience',
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
        'Building confidence for independent engagement with thought leaders',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing field visits, learning, and administrative requirements',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Knowing when to escalate vs. handle independently',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing emotional impact of imposter syndrome',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Keeping pace with rapid oncology innovation',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'KOL engagement and relationship building',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Learning TA, protocols, and products',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Clinical trial site support',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'CRM documentation',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Internal meetings and training',
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
        'competent',
        1
    );


    -- Tool 2
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'PubMed',
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
        'Veeva Engage',
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
        'PowerPoint',
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
        'Mendeley',
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
        'Regional MSL Manager',
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
        'Senior MSL Peer',
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
        'Medical Information Manager',
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
        'Email for scheduling, Teams for quick questions, phone for KOL follow-up',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'in_person',
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
        'diplomatic',
        4
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
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. James Chen',
        'dr-james-chen-msl-experienced',
        'Medical Science Liaison - Experienced',
        'senior',
        8,
        6,
        8,
        '35-42',
        'PhD Pharmacology',
        'Regional MSL Manager',
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
        'Maintain active relationships with 25+ KOLs across territory',
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
        'Support enrollment in 3 investigator-initiated trials',
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
        'Mentor 1-2 early-career MSLs',
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
        'Co-author 2 peer-reviewed publications',
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
        'Expand into adjacent TA to support portfolio growth',
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
        'Territory expansion competing with established competitors',
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
        'Limited time for strategic planning with increasing operational demands',
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
        'Balancing mentoring junior MSLs with own KOL engagement',
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
        'Rapid innovation in cell therapy making knowledge maintenance challenging',
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
        'Limited visibility to commercial strategy and competitive positioning',
        'operational',
        'medium',
        5
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Staying current with rapid innovation in hematologic malignancies',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Expanding reach while maintaining relationship depth',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Transitioning from execution to strategic thinking',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing competing priorities from field and HQ',
        'daily',
        4
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'KOL relationship management and strategic planning',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Clinical trial support and investigator engagement',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Junior MSL mentoring',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publication strategy and collaboration',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Administrative and reporting',
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
        'PubMed',
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
        'Veeva Engage',
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
        'SalesForce Analytics',
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
        'Literature Management',
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
        'Regional Director',
        'monthly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Early Career MSL (mentee)',
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
        'Medical Affairs Strategy Team',
        'monthly',
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
        'Email for formal updates, Teams for daily, phone for strategic discussions',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'mixed_in_person_virtual',
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
        'direct_professional',
        4
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
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Sarah Mitchell',
        'dr-sarah-mitchell-msl-senior',
        'Senior Medical Science Liaison',
        'director',
        15,
        8,
        15,
        '42-50',
        'MD',
        'Regional Director, Medical Affairs',
        0,
        0,
        'New York, NY',
        'flexible',
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
        'Build national KOL network with 50+ established relationships',
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
        'Lead 2-3 publication collaborations with KOLs',
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
        'Chair or co-chair advisory board for new indication',
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
        'Shape Medical Affairs strategy for region',
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
        'Mentor next generation of field medical leaders',
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
        'Tension between field time and strategic responsibilities',
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
        'Limited C-suite visibility despite strategic impact',
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
        'Difficulty retaining top talent in competitive field',
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
        'Rapid evolution of digital/data-driven medical engagement',
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
        'Balancing personalized KOL engagement with organizational scale',
        'operational',
        'medium',
        5
    );


    -- Challenge 1
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Evolving role from execution to strategic leadership',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Staying clinically relevant while in administrative role',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Driving organizational change in field medical',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing team talent and succession planning',
        'daily',
        4
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'National KOL engagement and thought leadership',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Strategic planning and organizational leadership',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Publication strategy and oversight',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Team leadership and mentoring',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Cross-functional strategic alignment',
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
        'PubMed/Literature',
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
        'Strategic Planning Tools',
        'monthly',
        'proficient',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Tableau Analytics',
        'weekly',
        'proficient',
        5
    );


    -- Internal Stakeholder 1
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Chief Medical Officer',
        'monthly',
        'cross_functional',
        'medium'
    );


    -- Internal Stakeholder 2
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, relationship_type, influence_level
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regional Medical Affairs Leadership',
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
        'monthly',
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
        'Email for documentation, phone for strategic discussions, in-person for important meetings',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'in_person_strategic',
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
        'executive_strategic',
        4
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
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Marcus Johnson',
        'dr-marcus-johnson-msl-oncology',
        'Medical Science Liaison - Oncology',
        'senior',
        9,
        5,
        9,
        '38-45',
        'PharmD/BCOP',
        'TA Medical Director',
        0,
        0,
        'Houston, TX',
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
        'Become go-to CAR-T and immunotherapy expert in territory',
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
        'Support CAR-T patient identification and enrollment',
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
        'Build relationships with 20+ CAR-T treating centers',
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
        'Co-author 2 thought leadership articles',
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
        'Support clinical trial enrollment for 2+ studies',
        'primary',
        2,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Rapid innovation in oncology and CAR-T field - hard to stay current',
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
        'Complexity of combination therapy discussions with KOLs',
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
        'Off-label and post-approval questions increasing in frequency',
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
        'Need to understand complex mechanisms in rapidly evolving space',
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
        'Competition from other companies'' specialized MSLs',
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
        'Limited time for deep learning with high field engagement demands',
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
        'Keeping pace with CAR-T and immunotherapy innovation',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Developing deep expertise in evolving field',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Managing complex MOA discussions with diverse KOL backgrounds',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Differentiating in crowded specialty TA',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Balancing patient safety with KOL engagement',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'CAR-T and immunotherapy expertise development',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'KOL engagement in oncology specialty',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Patient identification and enrollment support',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Thought leadership and publications',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Training and team support',
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
        'PubMed',
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
        'Journal Clubs & Webinars',
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
        'ASCO/ASH Platforms',
        'monthly',
        'proficient',
        4
    );


    -- Tool 5
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'CAR-T Registry',
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
        'TA Medical Director',
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
        'Medical Safety Team',
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
        'Clinical Oncology Specialists',
        'bi_weekly',
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
        'Phone for urgent, Email for documentation, Teams for daily updates',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'in_person_for_complex',
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
        'detailed_technical',
        4
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
        seniority_level, years_of_experience,
        years_in_current_role, years_in_industry,
        age_range, education_level,
        reporting_to, team_size, budget_authority,
        location_type, work_style,
        persona_type, is_active, validation_status
    ) VALUES (
        gen_random_uuid(),
        'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Dr. Lisa Park',
        'dr-lisa-park-msl-rare-disease',
        'Medical Science Liaison - Rare Disease',
        'senior',
        10,
        4,
        10,
        '36-44',
        'MD/PhD',
        'Rare Disease Medical Director',
        0,
        0,
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
        'Build expert network with all major treating centers for rare disease',
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
        'Support patient registry enrollment and natural history studies',
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
        'Engage patient advocacy groups effectively and authentically',
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
        'Co-author 2-3 rare disease publications',
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
        'Develop compassionate use and expanded access programs',
        'primary',
        2,
        5
    );


    -- Pain Point 1
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point_text, pain_category, severity, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Tiny patient population - difficult to build KOL relationships at scale',
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
        'Knowledge gaps on natural history and long-term outcomes',
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
        'Complexity of compassionate use and expanded access mechanics',
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
        'Patient advocacy dynamics and authentic engagement',
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
        'Limited commercial data to support value propositions',
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
        'Regulatory complexity with orphan drugs',
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
        'Building relationships in ultra-small patient population',
        'daily',
        1
    );


    -- Challenge 2
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Understanding and filling natural history knowledge gaps',
        'daily',
        2
    );


    -- Challenge 3
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Engaging authentically with patient advocacy groups',
        'daily',
        3
    );


    -- Challenge 4
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Navigating orphan drug regulatory complexity',
        'daily',
        4
    );


    -- Challenge 5
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Long-term patient relationships with limited engagement points',
        'daily',
        5
    );


    -- Responsibility 1
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Treating center and expert KOL engagement',
        'key',
        1
    );


    -- Responsibility 2
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Patient advocacy and community engagement',
        'key',
        2
    );


    -- Responsibility 3
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Patient registry and natural history research',
        'key',
        3
    );


    -- Responsibility 4
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Compassionate use program support',
        'key',
        4
    );


    -- Responsibility 5
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility_text, responsibility_type, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Regulatory and compliance coordination',
        'key',
        5
    );


    -- Tool 1
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Patient Registry Platforms',
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
        'PubMed',
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
        'Patient Advocacy Networks',
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
        'Veeva CRM',
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
        'Regulatory Databases',
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
        'Rare Disease Medical Director',
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
        'Patient Advocacy Team',
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
        'monthly',
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
        'Email for formal, phone for patient advocacy discussions, Zoom for flexibility',
        1
    );


    -- Communication Preference: meeting_preference
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'meeting_preference',
        'flexible_virtual',
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
        'empathetic_technical',
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
