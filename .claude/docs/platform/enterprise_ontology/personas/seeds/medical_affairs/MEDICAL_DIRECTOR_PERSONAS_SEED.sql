-- =====================================================================
-- MEDICAL DIRECTOR - 4 MECE PERSONAS (COMPLETE)
-- All fields + Junction Tables populated
-- =====================================================================
-- Version: 2.0.0
-- Last Updated: November 27, 2025
-- Status: Active
-- =====================================================================

BEGIN;

-- Temporarily disable the problematic trigger
ALTER TABLE public.personas DISABLE TRIGGER trigger_update_gen_ai_readiness;

DO $$
DECLARE
    v_tenant_id UUID;
    v_automator_id UUID;
    v_orchestrator_id UUID;
    v_learner_id UUID;
    v_skeptic_id UUID;
BEGIN
    -- Get Pharma tenant
    SELECT id INTO v_tenant_id 
    FROM public.tenants 
    WHERE slug IN ('pharmaceuticals', 'pharma') 
    LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharma tenant not found';
    END IF;
    
    RAISE NOTICE 'Pharma tenant ID: %', v_tenant_id;
    
    -- =====================================================================
    -- CLEANUP: Delete existing Medical Director personas and junction data
    -- (Junction tables have ON DELETE CASCADE, so they'll be cleaned automatically)
    -- =====================================================================
    DELETE FROM public.personas WHERE slug LIKE '%medical-director-%';
    RAISE NOTICE 'Cleaned up existing Medical Director personas';
    
    -- =====================================================================
    -- PERSONA 1: AUTOMATOR (High AI Maturity + Routine Work)
    -- =====================================================================
    INSERT INTO public.personas (
        -- Core Identity
        tenant_id, name, slug, title, tagline, one_liner,
        -- Role Context
        role_name, role_slug, function_name, function_slug, department_name, department_slug,
        -- Archetype (MECE Framework)
        archetype, archetype_confidence, work_pattern, work_complexity_score, ai_maturity_score,
        -- Professional Profile
        seniority_level, years_of_experience, years_in_current_role, years_in_industry, years_in_function, education_level,
        -- Organization Context
        typical_organization_size, organization_type, geographic_scope, reporting_to, team_size, team_size_typical, direct_reports, budget_authority, budget_authority_level,
        -- Work Style
        work_style, work_arrangement, decision_making_style, learning_style, technology_adoption, risk_tolerance, change_readiness,
        -- Gen AI Profile
        preferred_service_layer, gen_ai_adoption_score, gen_ai_trust_score, gen_ai_usage_frequency, gen_ai_primary_use_case,
        -- Narrative
        background_story, a_day_in_the_life,
        -- Salary Data
        salary_min_usd, salary_max_usd, salary_median_usd, salary_currency, salary_year,
        -- Metadata
        is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id,
        'Dr. Amanda Foster - Medical Director Automator',
        'dr-amanda-foster-medical-director-automator',
        'Medical Director, Oncology',
        'Data-Driven Medical Strategy Leader',
        'Medical Director who automates team operations through AI',
        'Medical Director', 'medical-director', 'Medical Affairs', 'medical-affairs', 'Medical Strategy', 'medical-strategy',
        'AUTOMATOR', 0.83, 'routine', 45.0, 78.0,
        'director', 14, 3, 18, 14, 'MD, PhD',
        'Large (1000+ employees)', 'Large Pharma', 'Regional (US)', 'VP Medical Affairs', '25', 25, 15, '$5M-$20M', 'significant',
        'Efficient, data-driven', 'Hybrid (25% travel)', 'Analytical, metrics-focused', 'Structured learning, dashboards', 'Early Adopter', 'Moderate', 'High',
        'WORKFLOWS', 80.0, 75.0, 'Daily', 'Automating team reporting, KOL analytics, and content review workflows',
        E'Dr. Amanda Foster spent her first decade in Medical Affairs manually compiling reports and coordinating team activities. When she became Medical Director, she realized the administrative burden was preventing strategic thinking. She championed AI adoption in her department, starting with automated reporting dashboards and expanding to AI-assisted content review. Her team now spends 40% less time on administrative tasks.',
        E'6:00 AM - Reviews AI-generated overnight team activity summary\n7:30 AM - Checks AI-compiled KOL engagement metrics dashboard\n8:30 AM - Leadership standup, shares AI-generated insights\n9:30 AM - Strategic planning session using AI market analysis\n11:00 AM - Reviews AI-flagged content for medical accuracy\n12:00 PM - Lunch with regional MSL manager\n1:30 PM - Budget review with AI-generated forecasts\n3:00 PM - Cross-functional meeting on product launch\n4:30 PM - Coaches team on AI workflow optimization\n6:00 PM - Reviews AI-prepared briefing for tomorrow''s board meeting',
        250000, 400000, 320000, 'USD', 2024,
        true, NOW(), NOW()
    ) RETURNING id INTO v_automator_id;
    
    RAISE NOTICE 'Created AUTOMATOR: % (id: %)', 'Dr. Amanda Foster', v_automator_id;
    
    -- =====================================================================
    -- PERSONA 2: ORCHESTRATOR (High AI Maturity + Strategic Work)
    -- =====================================================================
    INSERT INTO public.personas (
        tenant_id, name, slug, title, tagline, one_liner,
        role_name, role_slug, function_name, function_slug, department_name, department_slug,
        archetype, archetype_confidence, work_pattern, work_complexity_score, ai_maturity_score,
        seniority_level, years_of_experience, years_in_current_role, years_in_industry, years_in_function, education_level,
        typical_organization_size, organization_type, geographic_scope, reporting_to, team_size, team_size_typical, direct_reports, budget_authority, budget_authority_level,
        work_style, work_arrangement, decision_making_style, learning_style, technology_adoption, risk_tolerance, change_readiness,
        preferred_service_layer, gen_ai_adoption_score, gen_ai_trust_score, gen_ai_usage_frequency, gen_ai_primary_use_case,
        background_story, a_day_in_the_life,
        salary_min_usd, salary_max_usd, salary_median_usd, salary_currency, salary_year,
        is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id,
        'Dr. Robert Martinez - Medical Director Orchestrator',
        'dr-robert-martinez-medical-director-orchestrator',
        'Medical Director, Global Immunology',
        'AI-Powered Strategic Medical Leader',
        'Visionary leader orchestrating AI-driven medical strategy across global teams',
        'Medical Director', 'medical-director', 'Medical Affairs', 'medical-affairs', 'Global Medical Strategy', 'global-medical-strategy',
        'ORCHESTRATOR', 0.88, 'strategic', 82.0, 85.0,
        'director', 16, 5, 22, 16, 'MD, MBA',
        'Large (1000+ employees)', 'Top 10 Pharma', 'Global', 'SVP Medical Affairs', '40', 40, 25, '$20M-$50M', 'high',
        'Strategic, collaborative', 'Hybrid (40% travel)', 'Consensus-building, data-informed', 'Peer networks, thought leadership', 'Innovator', 'High', 'Very High',
        'ASK_PANEL', 90.0, 85.0, 'Daily', 'Orchestrating multi-agent workflows for global medical strategy and KOL ecosystem management',
        E'Dr. Robert Martinez is a recognized thought leader in AI-enabled medical affairs. After leading digital transformation at two major pharma companies, he now oversees global immunology medical strategy. He built the industry''s first AI-powered KOL mapping system and regularly speaks at conferences about the future of medical affairs. His vision is to create a fully AI-augmented medical affairs function that can respond to market changes in real-time.',
        E'5:30 AM - Reviews AI-curated global news and competitive intelligence\n7:00 AM - Asia team sync, reviews AI-translated regional insights\n8:30 AM - Global leadership meeting, presents AI-generated strategy recommendations\n10:00 AM - KOL advisory board planning with AI-identified emerging experts\n11:30 AM - Innovation lab session: testing new AI capabilities\n1:00 PM - Lunch meeting with digital health startup CEO\n2:30 PM - EU team sync, discusses AI-powered regulatory intelligence\n4:00 PM - Cross-functional AI governance committee\n5:30 PM - Strategic planning with AI scenario modeling\n7:00 PM - Evening thought leadership webinar preparation',
        300000, 500000, 400000, 'USD', 2024,
        true, NOW(), NOW()
    ) RETURNING id INTO v_orchestrator_id;
    
    RAISE NOTICE 'Created ORCHESTRATOR: % (id: %)', 'Dr. Robert Martinez', v_orchestrator_id;
    
    -- =====================================================================
    -- PERSONA 3: LEARNER (Low AI Maturity + Routine Work)
    -- =====================================================================
    INSERT INTO public.personas (
        tenant_id, name, slug, title, tagline, one_liner,
        role_name, role_slug, function_name, function_slug, department_name, department_slug,
        archetype, archetype_confidence, work_pattern, work_complexity_score, ai_maturity_score,
        seniority_level, years_of_experience, years_in_current_role, years_in_industry, years_in_function, education_level,
        typical_organization_size, organization_type, geographic_scope, reporting_to, team_size, team_size_typical, direct_reports, budget_authority, budget_authority_level,
        work_style, work_arrangement, decision_making_style, learning_style, technology_adoption, risk_tolerance, change_readiness,
        preferred_service_layer, gen_ai_adoption_score, gen_ai_trust_score, gen_ai_usage_frequency, gen_ai_primary_use_case,
        background_story, a_day_in_the_life,
        salary_min_usd, salary_max_usd, salary_median_usd, salary_currency, salary_year,
        is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id,
        'Dr. Jennifer Lee - Medical Director Learner',
        'dr-jennifer-lee-medical-director-learner',
        'Medical Director, Neurology',
        'Newly Promoted Medical Leader',
        'Rising leader eager to learn AI tools to enhance team performance',
        'Medical Director', 'medical-director', 'Medical Affairs', 'medical-affairs', 'Therapeutic Area Medical', 'therapeutic-area-medical',
        'LEARNER', 0.75, 'routine', 42.0, 35.0,
        'director', 10, 1, 12, 10, 'MD',
        'Mid-size (200-1000 employees)', 'Mid-size Pharma', 'Regional (US)', 'VP Medical Affairs', '12', 12, 8, '$2M-$5M', 'moderate',
        'Collaborative, learning-oriented', 'Hybrid (20% travel)', 'Consultative, seeks input', 'Hands-on training, mentorship', 'Early Majority', 'Low', 'Moderate',
        'ASK_EXPERT', 40.0, 50.0, 'Weekly', 'Learning AI basics through conversational interfaces and guided tutorials',
        E'Dr. Jennifer Lee was recently promoted to Medical Director after excelling as a Senior MSL. She''s highly competent in traditional medical affairs but feels overwhelmed by the AI transformation happening in the industry. She wants to learn but doesn''t know where to start. Her team looks to her for guidance on AI adoption, but she''s still figuring it out herself. She''s enrolled in several online courses and seeks mentorship from more AI-savvy colleagues.',
        E'7:00 AM - Reviews emails and team updates (manually)\n8:00 AM - Morning huddle with MSL team\n9:00 AM - Watches AI training video during commute\n10:00 AM - One-on-one with struggling team member\n11:00 AM - Medical review committee meeting\n12:30 PM - Lunch and learn: AI basics for Medical Affairs\n2:00 PM - KOL meeting preparation (traditional approach)\n3:30 PM - Cross-functional meeting on product launch\n5:00 PM - Tries new AI tool with IT support\n6:00 PM - Reviews team performance metrics (Excel)\n7:00 PM - Evening reading: AI in Healthcare articles',
        200000, 320000, 260000, 'USD', 2024,
        true, NOW(), NOW()
    ) RETURNING id INTO v_learner_id;
    
    RAISE NOTICE 'Created LEARNER: % (id: %)', 'Dr. Jennifer Lee', v_learner_id;
    
    -- =====================================================================
    -- PERSONA 4: SKEPTIC (Low AI Maturity + Strategic Work)
    -- =====================================================================
    INSERT INTO public.personas (
        tenant_id, name, slug, title, tagline, one_liner,
        role_name, role_slug, function_name, function_slug, department_name, department_slug,
        archetype, archetype_confidence, work_pattern, work_complexity_score, ai_maturity_score,
        seniority_level, years_of_experience, years_in_current_role, years_in_industry, years_in_function, education_level,
        typical_organization_size, organization_type, geographic_scope, reporting_to, team_size, team_size_typical, direct_reports, budget_authority, budget_authority_level,
        work_style, work_arrangement, decision_making_style, learning_style, technology_adoption, risk_tolerance, change_readiness,
        preferred_service_layer, gen_ai_adoption_score, gen_ai_trust_score, gen_ai_usage_frequency, gen_ai_primary_use_case,
        background_story, a_day_in_the_life,
        salary_min_usd, salary_max_usd, salary_median_usd, salary_currency, salary_year,
        is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id,
        'Dr. William Chen - Medical Director Skeptic',
        'dr-william-chen-medical-director-skeptic',
        'Medical Director, Cardiovascular',
        'Compliance-First Medical Leader',
        'Experienced leader who prioritizes regulatory compliance and scientific rigor over AI adoption',
        'Medical Director', 'medical-director', 'Medical Affairs', 'medical-affairs', 'Regulatory Medical', 'regulatory-medical',
        'SKEPTIC', 0.80, 'strategic', 80.0, 25.0,
        'director', 20, 7, 25, 20, 'MD, PhD',
        'Large (1000+ employees)', 'Top 10 Pharma', 'Global', 'SVP Medical Affairs', '35', 35, 20, '$10M-$30M', 'significant',
        'Methodical, compliance-focused', 'Office-based (10% travel)', 'Evidence-based, cautious', 'Formal training, peer-reviewed sources', 'Late Majority', 'Very Low', 'Low',
        'ASK_EXPERT', 20.0, 30.0, 'Monthly', 'Only using AI for basic information retrieval with heavy human verification',
        E'Dr. William Chen has seen many technology fads come and go in his 25-year career. He''s deeply concerned about AI hallucinations in medical content, regulatory implications, and the potential for bias. He''s been burned before by early technology adoption and now takes a "wait and see" approach. His team respects his scientific rigor but some younger members are frustrated by the slow pace of AI adoption. He requires extensive validation before approving any AI tool.',
        E'6:30 AM - Morning reading of peer-reviewed journals (print)\n8:00 AM - Leadership meeting on regulatory strategy\n9:30 AM - Reviews medical content (manual, thorough)\n11:00 AM - FDA submission strategy discussion\n12:00 PM - Working lunch at desk, reviews adverse event reports\n1:30 PM - Global safety committee meeting\n3:00 PM - Mentoring session with junior medical director\n4:00 PM - Reviews AI tool proposal (with skepticism)\n5:00 PM - Cross-functional compliance review\n6:30 PM - Prepares for tomorrow''s advisory board\n8:00 PM - Evening review of clinical trial data',
        280000, 450000, 360000, 'USD', 2024,
        true, NOW(), NOW()
    ) RETURNING id INTO v_skeptic_id;
    
    RAISE NOTICE 'Created SKEPTIC: % (id: %)', 'Dr. William Chen', v_skeptic_id;
    
    -- =====================================================================
    -- JUNCTION TABLES: VPANES SCORING
    -- =====================================================================
    
    -- AUTOMATOR VPANES
    INSERT INTO persona_vpanes_scoring (persona_id, tenant_id, value_score, priority_score, addressability_score, need_score, engagement_score, scale_score, scoring_rationale)
    VALUES (v_automator_id, v_tenant_id, 8.5, 8.0, 9.0, 7.5, 8.0, 7.0, 'High value from automation, very addressable with workflow tools, strong engagement with AI');
    
    -- ORCHESTRATOR VPANES
    INSERT INTO persona_vpanes_scoring (persona_id, tenant_id, value_score, priority_score, addressability_score, need_score, engagement_score, scale_score, scoring_rationale)
    VALUES (v_orchestrator_id, v_tenant_id, 9.5, 9.0, 8.0, 9.0, 9.5, 9.0, 'Highest value from strategic AI orchestration, strong need for multi-agent coordination, excellent engagement');
    
    -- LEARNER VPANES
    INSERT INTO persona_vpanes_scoring (persona_id, tenant_id, value_score, priority_score, addressability_score, need_score, engagement_score, scale_score, scoring_rationale)
    VALUES (v_learner_id, v_tenant_id, 6.5, 7.0, 8.5, 8.0, 6.0, 7.5, 'Moderate value currently, high addressability with guided learning, needs confidence building');
    
    -- SKEPTIC VPANES
    INSERT INTO persona_vpanes_scoring (persona_id, tenant_id, value_score, priority_score, addressability_score, need_score, engagement_score, scale_score, scoring_rationale)
    VALUES (v_skeptic_id, v_tenant_id, 5.0, 4.0, 5.0, 6.0, 3.0, 6.5, 'Lower engagement due to skepticism, requires compliance-focused value proposition and extensive validation');
    
    -- =====================================================================
    -- JUNCTION TABLES: EDUCATION
    -- Columns: id, persona_id, field_of_study, degree_level, institution, created_at, tenant_id, updated_at, sequence_order, degree, year_completed
    -- =====================================================================
    
    -- AUTOMATOR Education
    INSERT INTO persona_education (persona_id, tenant_id, degree, degree_level, field_of_study, institution, year_completed, sequence_order)
    VALUES 
        (v_automator_id, v_tenant_id, 'MD', 'Doctoral', 'Medicine', 'Johns Hopkins University School of Medicine', 2006, 1),
        (v_automator_id, v_tenant_id, 'PhD', 'Doctoral', 'Oncology', 'Johns Hopkins University', 2010, 2);
    
    -- ORCHESTRATOR Education
    INSERT INTO persona_education (persona_id, tenant_id, degree, degree_level, field_of_study, institution, year_completed, sequence_order)
    VALUES 
        (v_orchestrator_id, v_tenant_id, 'MD', 'Doctoral', 'Medicine', 'Harvard Medical School', 2004, 1),
        (v_orchestrator_id, v_tenant_id, 'MBA', 'Masters', 'Healthcare Management', 'Wharton School of Business', 2012, 2);
    
    -- LEARNER Education
    INSERT INTO persona_education (persona_id, tenant_id, degree, degree_level, field_of_study, institution, year_completed, sequence_order)
    VALUES 
        (v_learner_id, v_tenant_id, 'MD', 'Doctoral', 'Medicine', 'Stanford University School of Medicine', 2012, 1);
    
    -- SKEPTIC Education
    INSERT INTO persona_education (persona_id, tenant_id, degree, degree_level, field_of_study, institution, year_completed, sequence_order)
    VALUES 
        (v_skeptic_id, v_tenant_id, 'MD', 'Doctoral', 'Medicine', 'Yale School of Medicine', 1999, 1),
        (v_skeptic_id, v_tenant_id, 'PhD', 'Doctoral', 'Cardiovascular Pharmacology', 'Yale University', 2003, 2);
    
    -- =====================================================================
    -- JUNCTION TABLES: CERTIFICATIONS
    -- Columns: id, persona_id, certification_name, issuing_organization, year_obtained, is_current, created_at, tenant_id, updated_at, sequence_order
    -- =====================================================================
    
    -- AUTOMATOR Certifications
    INSERT INTO persona_certifications (persona_id, tenant_id, certification_name, issuing_organization, year_obtained, is_current, sequence_order)
    VALUES 
        (v_automator_id, v_tenant_id, 'Board Certified Medical Oncologist', 'American Board of Internal Medicine', 2012, true, 1),
        (v_automator_id, v_tenant_id, 'Certified Medical Affairs Professional (CMAP)', 'MAPS', 2018, true, 2);
    
    -- ORCHESTRATOR Certifications
    INSERT INTO persona_certifications (persona_id, tenant_id, certification_name, issuing_organization, year_obtained, is_current, sequence_order)
    VALUES 
        (v_orchestrator_id, v_tenant_id, 'Board Certified Immunologist', 'American Board of Allergy and Immunology', 2010, true, 1),
        (v_orchestrator_id, v_tenant_id, 'AI in Healthcare Certificate', 'MIT Sloan', 2022, true, 2);
    
    -- LEARNER Certifications
    INSERT INTO persona_certifications (persona_id, tenant_id, certification_name, issuing_organization, year_obtained, is_current, sequence_order)
    VALUES 
        (v_learner_id, v_tenant_id, 'Board Certified Neurologist', 'American Board of Psychiatry and Neurology', 2018, true, 1);
    
    -- SKEPTIC Certifications
    INSERT INTO persona_certifications (persona_id, tenant_id, certification_name, issuing_organization, year_obtained, is_current, sequence_order)
    VALUES 
        (v_skeptic_id, v_tenant_id, 'Board Certified Cardiologist', 'American Board of Internal Medicine', 2005, true, 1),
        (v_skeptic_id, v_tenant_id, 'Fellow of the American College of Cardiology (FACC)', 'ACC', 2010, true, 2);
    
    -- =====================================================================
    -- JUNCTION TABLES: MOTIVATIONS
    -- Columns: id, persona_id, motivation_category, motivation_text, importance, created_at, tenant_id, updated_at, sequence_order
    -- =====================================================================
    
    -- AUTOMATOR Motivations
    INSERT INTO persona_motivations (persona_id, tenant_id, motivation_text, motivation_category, importance, sequence_order)
    VALUES 
        (v_automator_id, v_tenant_id, 'Eliminate repetitive administrative tasks to focus on strategic work', 'professional', 'critical', 1),
        (v_automator_id, v_tenant_id, 'Build a high-performing, AI-enabled team', 'organizational', 'high', 2),
        (v_automator_id, v_tenant_id, 'Be recognized as an innovative leader in Medical Affairs', 'personal', 'high', 3),
        (v_automator_id, v_tenant_id, 'Improve team work-life balance through efficiency gains', 'organizational', 'medium', 4);
    
    -- ORCHESTRATOR Motivations
    INSERT INTO persona_motivations (persona_id, tenant_id, motivation_text, motivation_category, importance, sequence_order)
    VALUES 
        (v_orchestrator_id, v_tenant_id, 'Transform Medical Affairs into a strategic, AI-powered function', 'organizational', 'critical', 1),
        (v_orchestrator_id, v_tenant_id, 'Establish industry thought leadership in AI-enabled medical strategy', 'professional', 'critical', 2),
        (v_orchestrator_id, v_tenant_id, 'Mentor the next generation of AI-savvy medical leaders', 'personal', 'high', 3),
        (v_orchestrator_id, v_tenant_id, 'Drive competitive advantage through AI innovation', 'organizational', 'high', 4);
    
    -- LEARNER Motivations
    INSERT INTO persona_motivations (persona_id, tenant_id, motivation_text, motivation_category, importance, sequence_order)
    VALUES 
        (v_learner_id, v_tenant_id, 'Prove myself as a capable Medical Director', 'professional', 'critical', 1),
        (v_learner_id, v_tenant_id, 'Learn AI tools to keep up with industry changes', 'professional', 'high', 2),
        (v_learner_id, v_tenant_id, 'Build confidence in leading digital transformation', 'personal', 'high', 3),
        (v_learner_id, v_tenant_id, 'Support my team''s professional development', 'organizational', 'medium', 4);
    
    -- SKEPTIC Motivations
    INSERT INTO persona_motivations (persona_id, tenant_id, motivation_text, motivation_category, importance, sequence_order)
    VALUES 
        (v_skeptic_id, v_tenant_id, 'Ensure patient safety and scientific integrity in all activities', 'professional', 'critical', 1),
        (v_skeptic_id, v_tenant_id, 'Maintain regulatory compliance and avoid costly mistakes', 'organizational', 'critical', 2),
        (v_skeptic_id, v_tenant_id, 'Protect the organization from AI-related risks', 'organizational', 'high', 3),
        (v_skeptic_id, v_tenant_id, 'Preserve the value of human expertise and judgment', 'personal', 'high', 4);
    
    -- =====================================================================
    -- JUNCTION TABLES: PERSONALITY TRAITS
    -- Columns: id, persona_id, trait_name, trait_description, strength, created_at, tenant_id, updated_at, sequence_order
    -- =====================================================================
    
    -- AUTOMATOR Traits
    INSERT INTO persona_personality_traits (persona_id, tenant_id, trait_name, trait_description, sequence_order)
    VALUES 
        (v_automator_id, v_tenant_id, 'Efficiency-Driven', 'Constantly seeks ways to optimize processes and eliminate waste', 1),
        (v_automator_id, v_tenant_id, 'Results-Oriented', 'Focused on measurable outcomes and KPIs', 2),
        (v_automator_id, v_tenant_id, 'Pragmatic', 'Practical approach to problem-solving, values what works', 3);
    
    -- ORCHESTRATOR Traits
    INSERT INTO persona_personality_traits (persona_id, tenant_id, trait_name, trait_description, sequence_order)
    VALUES 
        (v_orchestrator_id, v_tenant_id, 'Visionary', 'Sees the big picture and future possibilities', 1),
        (v_orchestrator_id, v_tenant_id, 'Collaborative', 'Builds consensus and brings diverse teams together', 2),
        (v_orchestrator_id, v_tenant_id, 'Innovative', 'Embraces new ideas and technologies enthusiastically', 3);
    
    -- LEARNER Traits
    INSERT INTO persona_personality_traits (persona_id, tenant_id, trait_name, trait_description, sequence_order)
    VALUES 
        (v_learner_id, v_tenant_id, 'Curious', 'Eager to learn and explore new concepts', 1),
        (v_learner_id, v_tenant_id, 'Humble', 'Acknowledges knowledge gaps and seeks help', 2),
        (v_learner_id, v_tenant_id, 'Supportive', 'Prioritizes team development and well-being', 3);
    
    -- SKEPTIC Traits
    INSERT INTO persona_personality_traits (persona_id, tenant_id, trait_name, trait_description, sequence_order)
    VALUES 
        (v_skeptic_id, v_tenant_id, 'Analytical', 'Requires thorough analysis before making decisions', 1),
        (v_skeptic_id, v_tenant_id, 'Cautious', 'Risk-averse, prefers proven approaches', 2),
        (v_skeptic_id, v_tenant_id, 'Detail-Oriented', 'Meticulous attention to accuracy and compliance', 3);
    
    -- =====================================================================
    -- JUNCTION TABLES: VALUES
    -- Columns: id, persona_id, value_name, value_description, rank_order, created_at, tenant_id, updated_at, sequence_order
    -- =====================================================================
    
    -- AUTOMATOR Values
    INSERT INTO persona_values (persona_id, tenant_id, value_name, value_description, sequence_order)
    VALUES 
        (v_automator_id, v_tenant_id, 'Efficiency', 'Maximizing output while minimizing wasted effort', 1),
        (v_automator_id, v_tenant_id, 'Innovation', 'Embracing new technologies to improve performance', 2),
        (v_automator_id, v_tenant_id, 'Team Empowerment', 'Enabling team members to do their best work', 3);
    
    -- ORCHESTRATOR Values
    INSERT INTO persona_values (persona_id, tenant_id, value_name, value_description, sequence_order)
    VALUES 
        (v_orchestrator_id, v_tenant_id, 'Transformation', 'Driving meaningful change in the organization', 1),
        (v_orchestrator_id, v_tenant_id, 'Thought Leadership', 'Shaping industry direction through expertise', 2),
        (v_orchestrator_id, v_tenant_id, 'Collaboration', 'Achieving more together than individually', 3);
    
    -- LEARNER Values
    INSERT INTO persona_values (persona_id, tenant_id, value_name, value_description, sequence_order)
    VALUES 
        (v_learner_id, v_tenant_id, 'Growth', 'Continuous learning and development', 1),
        (v_learner_id, v_tenant_id, 'Integrity', 'Honest about limitations and willing to ask for help', 2),
        (v_learner_id, v_tenant_id, 'Team Success', 'Prioritizing collective achievement over individual recognition', 3);
    
    -- SKEPTIC Values
    INSERT INTO persona_values (persona_id, tenant_id, value_name, value_description, sequence_order)
    VALUES 
        (v_skeptic_id, v_tenant_id, 'Patient Safety', 'Protecting patients through rigorous scientific standards', 1),
        (v_skeptic_id, v_tenant_id, 'Scientific Integrity', 'Evidence-based decision making', 2),
        (v_skeptic_id, v_tenant_id, 'Compliance', 'Adherence to regulations and ethical standards', 3);
    
    -- =====================================================================
    -- JUNCTION TABLES: SUCCESS METRICS
    -- Columns: id, persona_id, metric_name, metric_description, created_at, tenant_id, updated_at, sequence_order
    -- =====================================================================
    
    -- AUTOMATOR Success Metrics
    INSERT INTO persona_success_metrics (persona_id, tenant_id, metric_name, metric_description, sequence_order)
    VALUES 
        (v_automator_id, v_tenant_id, 'Team Administrative Time Reduction', 'Hours saved on administrative tasks per week (current: 20hrs, target: 8hrs, measured weekly)', 1),
        (v_automator_id, v_tenant_id, 'Content Review Turnaround', 'Average time to complete medical content review (current: 5 days, target: 2 days, measured weekly)', 2),
        (v_automator_id, v_tenant_id, 'AI Tool Adoption Rate', 'Percentage of team using AI tools daily (current: 60%, target: 95%, measured monthly)', 3);
    
    -- ORCHESTRATOR Success Metrics
    INSERT INTO persona_success_metrics (persona_id, tenant_id, metric_name, metric_description, sequence_order)
    VALUES 
        (v_orchestrator_id, v_tenant_id, 'Strategic Initiative Delivery', 'On-time delivery of global medical strategy initiatives (current: 75%, target: 95%, measured quarterly)', 1),
        (v_orchestrator_id, v_tenant_id, 'Cross-Regional Collaboration', 'Number of successful cross-regional AI projects (current: 3/year, target: 8/year, measured quarterly)', 2),
        (v_orchestrator_id, v_tenant_id, 'Innovation Pipeline', 'AI use cases in development or deployed (current: 5, target: 15, measured quarterly)', 3);
    
    -- LEARNER Success Metrics
    INSERT INTO persona_success_metrics (persona_id, tenant_id, metric_name, metric_description, sequence_order)
    VALUES 
        (v_learner_id, v_tenant_id, 'AI Skill Development', 'Completion of AI training modules (current: 20%, target: 80%, measured monthly)', 1),
        (v_learner_id, v_tenant_id, 'Team Confidence Score', 'Team confidence in AI adoption survey (current: 55/100, target: 80/100, measured quarterly)', 2),
        (v_learner_id, v_tenant_id, 'First AI Project Success', 'Successful completion of first AI pilot (current: Not started, target: Completed, measured quarterly)', 3);
    
    -- SKEPTIC Success Metrics
    INSERT INTO persona_success_metrics (persona_id, tenant_id, metric_name, metric_description, sequence_order)
    VALUES 
        (v_skeptic_id, v_tenant_id, 'Compliance Rate', 'Medical content passing regulatory review on first submission (current: 92%, target: 98%, measured monthly)', 1),
        (v_skeptic_id, v_tenant_id, 'Adverse Event Response Time', 'Time to complete safety signal assessment (current: 48hrs, target: 24hrs, measured weekly)', 2),
        (v_skeptic_id, v_tenant_id, 'Validated AI Tools', 'Number of AI tools passing validation (current: 0, target: 3, measured quarterly)', 3);
    
    -- =====================================================================
    -- JUNCTION TABLES: TYPICAL DAY ACTIVITIES
    -- Columns: id, persona_id, time_of_day, activity_description, energy_level, sort_order, created_at, tenant_id, updated_at, sequence_order
    -- =====================================================================
    
    -- AUTOMATOR Typical Day
    INSERT INTO persona_typical_day (persona_id, tenant_id, time_of_day, activity_description, sort_order)
    VALUES 
        (v_automator_id, v_tenant_id, '6:00 AM', 'Reviews AI-generated overnight team activity summary', 1),
        (v_automator_id, v_tenant_id, '7:30 AM', 'Checks AI-compiled KOL engagement metrics dashboard', 2),
        (v_automator_id, v_tenant_id, '8:30 AM', 'Leadership standup, shares AI-generated insights', 3),
        (v_automator_id, v_tenant_id, '9:30 AM', 'Strategic planning session using AI market analysis', 4),
        (v_automator_id, v_tenant_id, '11:00 AM', 'Reviews AI-flagged content for medical accuracy', 5),
        (v_automator_id, v_tenant_id, '12:00 PM', 'Lunch with regional MSL manager', 6),
        (v_automator_id, v_tenant_id, '1:30 PM', 'Budget review with AI-generated forecasts', 7),
        (v_automator_id, v_tenant_id, '3:00 PM', 'Cross-functional meeting on product launch', 8),
        (v_automator_id, v_tenant_id, '4:30 PM', 'Coaches team on AI workflow optimization', 9),
        (v_automator_id, v_tenant_id, '6:00 PM', 'Reviews AI-prepared briefing for tomorrow''s board meeting', 10);
    
    -- ORCHESTRATOR Typical Day
    INSERT INTO persona_typical_day (persona_id, tenant_id, time_of_day, activity_description, sort_order)
    VALUES 
        (v_orchestrator_id, v_tenant_id, '5:30 AM', 'Reviews AI-curated global news and competitive intelligence', 1),
        (v_orchestrator_id, v_tenant_id, '7:00 AM', 'Asia team sync, reviews AI-translated regional insights', 2),
        (v_orchestrator_id, v_tenant_id, '8:30 AM', 'Global leadership meeting, presents AI-generated strategy recommendations', 3),
        (v_orchestrator_id, v_tenant_id, '10:00 AM', 'KOL advisory board planning with AI-identified emerging experts', 4),
        (v_orchestrator_id, v_tenant_id, '11:30 AM', 'Innovation lab session: testing new AI capabilities', 5),
        (v_orchestrator_id, v_tenant_id, '1:00 PM', 'Lunch meeting with digital health startup CEO', 6),
        (v_orchestrator_id, v_tenant_id, '2:30 PM', 'EU team sync, discusses AI-powered regulatory intelligence', 7),
        (v_orchestrator_id, v_tenant_id, '4:00 PM', 'Cross-functional AI governance committee', 8),
        (v_orchestrator_id, v_tenant_id, '5:30 PM', 'Strategic planning with AI scenario modeling', 9),
        (v_orchestrator_id, v_tenant_id, '7:00 PM', 'Evening thought leadership webinar preparation', 10);
    
    -- LEARNER Typical Day
    INSERT INTO persona_typical_day (persona_id, tenant_id, time_of_day, activity_description, sort_order)
    VALUES 
        (v_learner_id, v_tenant_id, '7:00 AM', 'Reviews emails and team updates (manually)', 1),
        (v_learner_id, v_tenant_id, '8:00 AM', 'Morning huddle with MSL team', 2),
        (v_learner_id, v_tenant_id, '9:00 AM', 'Watches AI training video during commute', 3),
        (v_learner_id, v_tenant_id, '10:00 AM', 'One-on-one with struggling team member', 4),
        (v_learner_id, v_tenant_id, '11:00 AM', 'Medical review committee meeting', 5),
        (v_learner_id, v_tenant_id, '12:30 PM', 'Lunch and learn: AI basics for Medical Affairs', 6),
        (v_learner_id, v_tenant_id, '2:00 PM', 'KOL meeting preparation (traditional approach)', 7),
        (v_learner_id, v_tenant_id, '3:30 PM', 'Cross-functional meeting on product launch', 8),
        (v_learner_id, v_tenant_id, '5:00 PM', 'Tries new AI tool with IT support', 9),
        (v_learner_id, v_tenant_id, '6:00 PM', 'Reviews team performance metrics (Excel)', 10);
    
    -- SKEPTIC Typical Day
    INSERT INTO persona_typical_day (persona_id, tenant_id, time_of_day, activity_description, sort_order)
    VALUES 
        (v_skeptic_id, v_tenant_id, '6:30 AM', 'Morning reading of peer-reviewed journals (print)', 1),
        (v_skeptic_id, v_tenant_id, '8:00 AM', 'Leadership meeting on regulatory strategy', 2),
        (v_skeptic_id, v_tenant_id, '9:30 AM', 'Reviews medical content (manual, thorough)', 3),
        (v_skeptic_id, v_tenant_id, '11:00 AM', 'FDA submission strategy discussion', 4),
        (v_skeptic_id, v_tenant_id, '12:00 PM', 'Working lunch at desk, reviews adverse event reports', 5),
        (v_skeptic_id, v_tenant_id, '1:30 PM', 'Global safety committee meeting', 6),
        (v_skeptic_id, v_tenant_id, '3:00 PM', 'Mentoring session with junior medical director', 7),
        (v_skeptic_id, v_tenant_id, '4:00 PM', 'Reviews AI tool proposal (with skepticism)', 8),
        (v_skeptic_id, v_tenant_id, '5:00 PM', 'Cross-functional compliance review', 9),
        (v_skeptic_id, v_tenant_id, '6:30 PM', 'Prepares for tomorrow''s advisory board', 10);
    
    -- =====================================================================
    -- JUNCTION TABLES: ASPIRATIONS
    -- Columns: id, persona_id, aspiration_text, timeframe, created_at
    -- Note: timeframe has check constraint - using short_term/medium_term/long_term
    -- =====================================================================
    
    -- AUTOMATOR Aspirations
    INSERT INTO persona_aspirations (persona_id, aspiration_text, timeframe)
    VALUES 
        (v_automator_id, 'Achieve 80% automation of routine medical affairs tasks (target: 2 years)', 'medium_term'),
        (v_automator_id, 'Become VP Medical Affairs (target: 5 years)', 'long_term'),
        (v_automator_id, 'Publish thought leadership on AI in Medical Affairs (target: 1 year)', 'short_term');
    
    -- ORCHESTRATOR Aspirations
    INSERT INTO persona_aspirations (persona_id, aspiration_text, timeframe)
    VALUES 
        (v_orchestrator_id, 'Establish industry-leading AI Center of Excellence (target: 2 years)', 'medium_term'),
        (v_orchestrator_id, 'Become Chief Medical Officer (target: 5 years)', 'long_term'),
        (v_orchestrator_id, 'Keynote at major industry conference on AI transformation (target: 1 year)', 'short_term');
    
    -- LEARNER Aspirations
    INSERT INTO persona_aspirations (persona_id, aspiration_text, timeframe)
    VALUES 
        (v_learner_id, 'Complete AI certification program (target: 1 year)', 'short_term'),
        (v_learner_id, 'Successfully lead first AI pilot project (target: 6 months)', 'short_term'),
        (v_learner_id, 'Build confidence to mentor others on AI (target: 2 years)', 'medium_term');
    
    -- SKEPTIC Aspirations
    INSERT INTO persona_aspirations (persona_id, aspiration_text, timeframe)
    VALUES 
        (v_skeptic_id, 'Establish gold-standard AI validation framework (target: 2 years)', 'medium_term'),
        (v_skeptic_id, 'Ensure zero compliance violations (ongoing)', 'long_term'),
        (v_skeptic_id, 'Mentor the next generation on scientific rigor (target: 5 years)', 'long_term');
    
    -- =====================================================================
    -- JUNCTION TABLES: BUYING PROCESS
    -- Columns: id, persona_id, role_in_purchase, decision_timeframe, typical_budget_range, approval_process_complexity, created_at
    -- Valid values: simple, moderate, complex, very_complex
    -- =====================================================================
    
    INSERT INTO persona_buying_process (persona_id, role_in_purchase, decision_timeframe, typical_budget_range, approval_process_complexity)
    VALUES 
        (v_automator_id, 'Decision Maker', '3-6 months', '$100K-$500K', 'moderate'),
        (v_orchestrator_id, 'Executive Sponsor', '6-12 months', '$500K-$2M', 'complex'),
        (v_learner_id, 'Influencer', '6-9 months', '$50K-$200K', 'moderate'),
        (v_skeptic_id, 'Gatekeeper', '12-18 months', '$200K-$1M', 'very_complex');
    
    -- =====================================================================
    -- JUNCTION TABLES: BUYING TRIGGERS
    -- Valid trigger_type: regulatory, competitive, internal_initiative, crisis, growth
    -- Valid urgency_level: immediate, high, medium, low
    -- =====================================================================
    
    -- AUTOMATOR Buying Triggers
    INSERT INTO persona_buying_triggers (persona_id, trigger_type, trigger_description, urgency_level)
    VALUES 
        (v_automator_id, 'internal_initiative', 'Team spending >30% time on administrative tasks - efficiency drive', 'high'),
        (v_automator_id, 'competitive', 'Competitors gaining advantage through AI automation', 'medium'),
        (v_automator_id, 'growth', 'End of fiscal year budget availability for AI investment', 'medium');
    
    -- ORCHESTRATOR Buying Triggers
    INSERT INTO persona_buying_triggers (persona_id, trigger_type, trigger_description, urgency_level)
    VALUES 
        (v_orchestrator_id, 'internal_initiative', 'New corporate AI transformation mandate', 'high'),
        (v_orchestrator_id, 'growth', 'Breakthrough AI capability becomes available', 'high'),
        (v_orchestrator_id, 'competitive', 'Industry leaders adopting advanced AI solutions', 'medium');
    
    -- LEARNER Buying Triggers
    INSERT INTO persona_buying_triggers (persona_id, trigger_type, trigger_description, urgency_level)
    VALUES 
        (v_learner_id, 'internal_initiative', 'Team requesting AI training and tools', 'medium'),
        (v_learner_id, 'competitive', 'Other departments successfully using AI', 'medium'),
        (v_learner_id, 'internal_initiative', 'Leadership requiring AI adoption', 'high');
    
    -- SKEPTIC Buying Triggers
    INSERT INTO persona_buying_triggers (persona_id, trigger_type, trigger_description, urgency_level)
    VALUES 
        (v_skeptic_id, 'regulatory', 'Regulatory requirement for AI validation', 'high'),
        (v_skeptic_id, 'internal_initiative', 'Peer-reviewed evidence of AI safety and efficacy', 'medium'),
        (v_skeptic_id, 'regulatory', 'Executive mandate with compliance framework', 'high');
    
    -- =====================================================================
    -- JUNCTION TABLES: ANNUAL CONFERENCES
    -- =====================================================================
    
    -- AUTOMATOR Conferences
    INSERT INTO persona_annual_conferences (persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter)
    VALUES 
        (v_automator_id, v_tenant_id, 'MAPS Annual Meeting', 'Industry', 'Attendee/Speaker', 'Best practices in AI automation', 'high', 'Q2'),
        (v_automator_id, v_tenant_id, 'ASCO Annual Meeting', 'Scientific', 'Attendee', 'Oncology updates, KOL networking', 'medium', 'Q2');
    
    -- ORCHESTRATOR Conferences
    INSERT INTO persona_annual_conferences (persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter)
    VALUES 
        (v_orchestrator_id, v_tenant_id, 'DIA Global Annual Meeting', 'Industry', 'Keynote Speaker', 'Thought leadership, industry influence', 'critical', 'Q2'),
        (v_orchestrator_id, v_tenant_id, 'World AI Summit', 'Technology', 'Panelist', 'AI innovation insights, vendor relationships', 'high', 'Q4'),
        (v_orchestrator_id, v_tenant_id, 'ACR/EULAR Annual Meeting', 'Scientific', 'Attendee', 'Immunology updates, global KOL networking', 'high', 'Q4');
    
    -- LEARNER Conferences
    INSERT INTO persona_annual_conferences (persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter)
    VALUES 
        (v_learner_id, v_tenant_id, 'MAPS Annual Meeting', 'Industry', 'Attendee', 'Learning AI best practices', 'medium', 'Q2'),
        (v_learner_id, v_tenant_id, 'AAN Annual Meeting', 'Scientific', 'Attendee', 'Neurology updates, peer networking', 'medium', 'Q2');
    
    -- SKEPTIC Conferences
    INSERT INTO persona_annual_conferences (persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter)
    VALUES 
        (v_skeptic_id, v_tenant_id, 'DIA Annual Meeting', 'Regulatory', 'Attendee', 'Regulatory updates, compliance insights', 'high', 'Q2'),
        (v_skeptic_id, v_tenant_id, 'ACC Scientific Sessions', 'Scientific', 'Attendee/Presenter', 'Cardiovascular research, scientific rigor', 'high', 'Q1');
    
    -- =====================================================================
    -- JUNCTION TABLES: CAREER TRAJECTORY
    -- =====================================================================
    
    INSERT INTO persona_career_trajectory (persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets)
    VALUES 
        (v_automator_id, v_tenant_id, 3, 'VP Medical Affairs in 3-5 years', ARRAY['AI strategy', 'Executive leadership', 'Change management'], ARRAY['Executive MBA', 'AI Leadership Certificate']),
        (v_orchestrator_id, v_tenant_id, 5, 'CMO in 5-7 years', ARRAY['Board governance', 'M&A medical due diligence', 'Global strategy'], ARRAY['Board Director certification']),
        (v_learner_id, v_tenant_id, 1, 'Senior Medical Director in 3 years', ARRAY['AI fundamentals', 'Team leadership', 'Strategic planning'], ARRAY['AI in Healthcare Certificate', 'Leadership development program']),
        (v_skeptic_id, v_tenant_id, 7, 'Chief Scientific Officer in 5 years', ARRAY['AI governance', 'Regulatory strategy', 'Scientific leadership'], ARRAY['Regulatory Affairs certification']);
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created 4 MECE personas for Medical Director';
    RAISE NOTICE 'Populated junction tables: VPANES, Education, Certifications, Motivations, Traits, Values, Success Metrics, Typical Day, Aspirations, Buying Process, Buying Triggers, Conferences, Career Trajectory';
    RAISE NOTICE '========================================';
    
END $$;

-- Re-enable the trigger
ALTER TABLE public.personas ENABLE TRIGGER trigger_update_gen_ai_readiness;

COMMIT;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Verify personas created
SELECT 
    name,
    archetype,
    ai_maturity_score,
    work_complexity_score,
    seniority_level
FROM personas 
WHERE slug LIKE '%medical-director%'
ORDER BY 
    CASE archetype 
        WHEN 'AUTOMATOR' THEN 1 
        WHEN 'ORCHESTRATOR' THEN 2 
        WHEN 'LEARNER' THEN 3 
        WHEN 'SKEPTIC' THEN 4 
    END;

-- Verify junction tables populated
SELECT 
    'VPANES' as table_name, COUNT(*) as count FROM persona_vpanes_scoring WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Education', COUNT(*) FROM persona_education WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Certifications', COUNT(*) FROM persona_certifications WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Motivations', COUNT(*) FROM persona_motivations WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Traits', COUNT(*) FROM persona_personality_traits WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Values', COUNT(*) FROM persona_values WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Success Metrics', COUNT(*) FROM persona_success_metrics WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Typical Day', COUNT(*) FROM persona_typical_day WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Aspirations', COUNT(*) FROM persona_aspirations WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Buying Process', COUNT(*) FROM persona_buying_process WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Buying Triggers', COUNT(*) FROM persona_buying_triggers WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Conferences', COUNT(*) FROM persona_annual_conferences WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%')
UNION ALL
SELECT 'Career Trajectory', COUNT(*) FROM persona_career_trajectory WHERE persona_id IN (SELECT id FROM personas WHERE slug LIKE '%medical-director%');
