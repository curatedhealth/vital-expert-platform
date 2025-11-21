-- Medical Affairs Personas v5.0 - Final Deployment
-- Generated: 2025-11-17T13:12:54.201588
-- Includes: DEFAULT_VALUES and VALUE_MAPPINGS

BEGIN;


DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-1'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-1';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_1 (persona_id UUID);
    INSERT INTO temp_persona_ids_1 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.92
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.88
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-2'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-2';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_2 (persona_id UUID);
    INSERT INTO temp_persona_ids_2 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.92
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.88
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-3'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-3';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_3 (persona_id UUID);
    INSERT INTO temp_persona_ids_3 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-4'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-4';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_4 (persona_id UUID);
    INSERT INTO temp_persona_ids_4 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.92
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.88
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-5'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-5';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_5 (persona_id UUID);
    INSERT INTO temp_persona_ids_5 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-6'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-6';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_6 (persona_id UUID);
    INSERT INTO temp_persona_ids_6 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-7'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-7';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_7 (persona_id UUID);
    INSERT INTO temp_persona_ids_7 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-8'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-8';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_8 (persona_id UUID);
    INSERT INTO temp_persona_ids_8 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-9'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-9';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_9 (persona_id UUID);
    INSERT INTO temp_persona_ids_9 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-10'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-10';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_10 (persona_id UUID);
    INSERT INTO temp_persona_ids_10 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-11'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-11';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_11 (persona_id UUID);
    INSERT INTO temp_persona_ids_11 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.92
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.88
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-12'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-12';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_12 (persona_id UUID);
    INSERT INTO temp_persona_ids_12 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-13'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-13';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_13 (persona_id UUID);
    INSERT INTO temp_persona_ids_13 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-14'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-14';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_14 (persona_id UUID);
    INSERT INTO temp_persona_ids_14 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-15'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-15';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_15 (persona_id UUID);
    INSERT INTO temp_persona_ids_15 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-16'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-16';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_16 (persona_id UUID);
    INSERT INTO temp_persona_ids_16 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-17'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-17';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_17 (persona_id UUID);
    INSERT INTO temp_persona_ids_17 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-18'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-18';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_18 (persona_id UUID);
    INSERT INTO temp_persona_ids_18 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-19'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-19';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_19 (persona_id UUID);
    INSERT INTO temp_persona_ids_19 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-20'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-20';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_20 (persona_id UUID);
    INSERT INTO temp_persona_ids_20 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-21'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-21';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_21 (persona_id UUID);
    INSERT INTO temp_persona_ids_21 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-22'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-22';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_22 (persona_id UUID);
    INSERT INTO temp_persona_ids_22 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-23'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-23';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_23 (persona_id UUID);
    INSERT INTO temp_persona_ids_23 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-24'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-24';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_24 (persona_id UUID);
    INSERT INTO temp_persona_ids_24 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-25'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-25';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_25 (persona_id UUID);
    INSERT INTO temp_persona_ids_25 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-26'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-26';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_26 (persona_id UUID);
    INSERT INTO temp_persona_ids_26 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-27'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-27';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_27 (persona_id UUID);
    INSERT INTO temp_persona_ids_27 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-28'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-28';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_28 (persona_id UUID);
    INSERT INTO temp_persona_ids_28 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.92
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.88
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-29'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-29';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_29 (persona_id UUID);
    INSERT INTO temp_persona_ids_29 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-30'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-30';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_30 (persona_id UUID);
    INSERT INTO temp_persona_ids_30 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND slug = 'persona-31'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: persona-31';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_31 (persona_id UUID);
    INSERT INTO temp_persona_ids_31 VALUES (v_persona_id);
    

    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        25,
        3,
        10,
        'very_high',
        9,
        7
    ) ON CONFLICT DO NOTHING;

    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective',
        'Leading Pharma Company',
        'Healthcare',
        'success_story',
        'Launch product in highly competitive oncology market',
        'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education',
        ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores'],
        'Relevant to role',
        8
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.9
    ) ON CONFLICT DO NOTHING;

    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
        'Objective',
        '',
        0.85
    ) ON CONFLICT DO NOTHING;
END $$;

COMMIT;
