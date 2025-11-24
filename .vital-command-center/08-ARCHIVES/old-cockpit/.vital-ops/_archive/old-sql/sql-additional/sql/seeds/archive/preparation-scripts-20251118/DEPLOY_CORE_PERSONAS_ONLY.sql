-- ===================================================================
-- VITAL Medical Affairs Personas - CORE ONLY
-- ===================================================================
-- Generated: 2025-11-17T10:23:39.907784
-- Personas: 31
-- Tables: 1 (personas only - no v5.0 extensions)
-- ===================================================================

BEGIN;


-- Persona 1: Persona 1
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 1',
    'persona-1',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute chief medical officer core responsibilities', 'Collaborate with cross-functional stakeholders', 'Team management and development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute chief medical officer responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Build and develop high-performing team", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 55, "location": "Boston, MA", "education_level": "MD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 2: Persona 2
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 2',
    'persona-2',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute vp medical affairs core responsibilities', 'Collaborate with cross-functional stakeholders', 'Team management and development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute vp medical affairs responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Build and develop high-performing team", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 48, "location": "New York, NY", "education_level": "MD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 3: Persona 3
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 3',
    'persona-3',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical director core responsibilities', 'Collaborate with cross-functional stakeholders', 'Team management and development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute medical director responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Build and develop high-performing team", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 45, "location": "San Francisco, CA", "education_level": "MD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 4: Persona 4
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 4',
    'persona-4',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute head of field medical core responsibilities', 'Collaborate with cross-functional stakeholders', 'Team management and development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute head of field medical responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Build and develop high-performing team", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 47, "location": "Basel, Switzerland", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 5: Persona 5
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 5',
    'persona-5',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute regional medical director core responsibilities', 'Collaborate with cross-functional stakeholders', 'Team management and development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute regional medical director responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Build and develop high-performing team", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 43, "location": "London, UK", "education_level": "PhD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 6: Persona 6
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 6',
    'persona-6',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute msl manager core responsibilities', 'Collaborate with cross-functional stakeholders', 'Team management and development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute msl manager responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Build and develop high-performing team", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 40, "location": "Chicago, IL", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 7: Persona 7
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 7',
    'persona-7',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute therapeutic area msl lead core responsibilities', 'Collaborate with cross-functional stakeholders', 'Team management and development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute therapeutic area msl lead responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Build and develop high-performing team", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 38, "location": "Philadelphia, PA", "education_level": "PhD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 8: Persona 8
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 8',
    'persona-8',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute senior medical science liaison core responsibilities', 'Collaborate with cross-functional stakeholders', 'Professional development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute senior medical science liaison responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Develop deep expertise in role", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 38, "location": "Seattle, WA", "education_level": "PhD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 9: Persona 9
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 9',
    'persona-9',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical science liaison core responsibilities', 'Collaborate with cross-functional stakeholders', 'Professional development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute medical science liaison responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Develop deep expertise in role", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 33, "location": "Dallas, TX", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 10: Persona 10
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 10',
    'persona-10',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute field medical trainer core responsibilities', 'Collaborate with cross-functional stakeholders', 'Team management and development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute field medical trainer responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Build and develop high-performing team", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 40, "location": "Atlanta, GA", "education_level": "PharmD + Adult Learning"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 11: Persona 11
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 11',
    'persona-11',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute head of medical information core responsibilities', 'Collaborate with cross-functional stakeholders', 'Team management and development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute head of medical information responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Build and develop high-performing team", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 45, "location": "Cambridge, MA", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 12: Persona 12
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 12',
    'persona-12',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical information manager core responsibilities', 'Collaborate with cross-functional stakeholders', 'Team management and development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute medical information manager responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Build and develop high-performing team", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 40, "location": "Princeton, NJ", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 13: Persona 13
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 13',
    'persona-13',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute senior medical information specialist core responsibilities', 'Collaborate with cross-functional stakeholders', 'Professional development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute senior medical information specialist responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Develop deep expertise in role", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 36, "location": "Durham, NC", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 14: Persona 14
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 14',
    'persona-14',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical information specialist core responsibilities', 'Collaborate with cross-functional stakeholders', 'Professional development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute medical information specialist responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Develop deep expertise in role", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 31, "location": "Indianapolis, IN", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 15: Persona 15
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 15',
    'persona-15',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical librarian core responsibilities', 'Collaborate with cross-functional stakeholders', 'Professional development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute medical librarian responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Develop deep expertise in role", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 35, "location": "Ann Arbor, MI", "education_level": "MLS + Science"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 16: Persona 16
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 16',
    'persona-16',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical content manager core responsibilities', 'Collaborate with cross-functional stakeholders', 'Team management and development', 'Administrative and reporting tasks'],
    '[{"pain_point": "Manual data aggregation across systems wastes significant time", "severity": "high", "frequency": "daily"}, {"pain_point": "Difficulty accessing real-time insights for decision making", "severity": "high", "frequency": "weekly"}, {"pain_point": "Coordinating across multiple stakeholders with competing priorities", "severity": "medium", "frequency": "weekly"}]'::jsonb,
    '[{"goal": "Execute medical content manager responsibilities with excellence and measurable impact", "priority": "high", "timeframe": "ongoing"}, {"goal": "Build and develop high-performing team", "priority": "high", "timeframe": "12_months"}, {"goal": "Drive continuous improvement in processes and outcomes", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Keeping pace with evolving regulatory and compliance requirements", "impact_level": "high"}, {"challenge": "Managing workload and priorities effectively", "impact_level": "high"}, {"challenge": "Balancing strategic work with operational demands", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 37, "location": "Raleigh, NC", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 17: Persona 17
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 17',
    'persona-17',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical evidence manager core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in medical evidence manager function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 38, "location": "New York, NY", "education_level": "PhD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 18: Persona 18
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 18',
    'persona-18',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute market access medical lead core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in market access medical lead function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 42, "location": "Chicago, IL", "education_level": "MD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 19: Persona 19
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 19',
    'persona-19',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical monitor core responsibilities', 'Stakeholder engagement and collaboration', 'Continuous improvement', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in medical monitor function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 38, "location": "Philadelphia, PA", "education_level": "MD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 20: Persona 20
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 20',
    'persona-20',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute safety physician core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in safety physician function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 40, "location": "San Diego, CA", "education_level": "MD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 21: Persona 21
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 21',
    'persona-21',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute clinical trial physician core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in clinical trial physician function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 40, "location": "Boston, MA", "education_level": "MD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 22: Persona 22
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 22',
    'persona-22',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute study site medical lead core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in study site medical lead function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 37, "location": "Durham, NC", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 23: Persona 23
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 23',
    'persona-23',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical affairs clinical liaison core responsibilities', 'Stakeholder engagement and collaboration', 'Continuous improvement', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in medical affairs clinical liaison function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 35, "location": "Seattle, WA", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 24: Persona 24
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 24',
    'persona-24',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute head of medical excellence core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in head of medical excellence function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 45, "location": "New York, NY", "education_level": "MD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 25: Persona 25
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 25',
    'persona-25',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical compliance manager core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in medical compliance manager function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 38, "location": "Boston, MA", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 26: Persona 26
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 26',
    'persona-26',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical quality manager core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in medical quality manager function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 39, "location": "San Francisco, CA", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 27: Persona 27
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 27',
    'persona-27',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical training manager core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in medical training manager function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 38, "location": "Philadelphia, PA", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 28: Persona 28
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 28',
    'persona-28',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute head of medical strategy core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in head of medical strategy function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 47, "location": "New York, NY", "education_level": "MD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 29: Persona 29
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 29',
    'persona-29',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical operations manager core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in medical operations manager function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 39, "location": "Chicago, IL", "education_level": "PharmD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 30: Persona 30
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 30',
    'persona-30',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical analytics manager core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in medical analytics manager function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 38, "location": "Boston, MA", "education_level": "MS Analytics"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- Persona 31: Persona 31
INSERT INTO personas (
    id, tenant_id, name, slug, title, tagline,
    role_id, function_id, department_id,
    seniority_level, years_of_experience,
    key_responsibilities, pain_points, goals, challenges,
    preferred_tools, communication_preferences,
    decision_making_style, tags, metadata,
    is_active, validation_status
) VALUES (
    gen_random_uuid(),
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Persona 31',
    'persona-31',
    'Professional',
    '',
    (SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1),
    (SELECT id FROM org_departments WHERE slug = 'medical-affairs' LIMIT 1),
    'senior',
    10,
    ARRAY['Execute medical business partner core responsibilities', 'Stakeholder engagement and collaboration', 'Team leadership and development', 'Administrative and governance'],
    '[{"pain_point": "Manual processes limit efficiency and strategic impact", "severity": "high", "frequency": "daily"}, {"pain_point": "Fragmented systems create data silos", "severity": "high", "frequency": "weekly"}, {"pain_point": "Resource constraints limit optimal performance", "severity": "medium", "frequency": "ongoing"}]'::jsonb,
    '[{"goal": "Drive excellence in medical business partner function", "priority": "high", "timeframe": "ongoing"}, {"goal": "Support organizational strategic objectives", "priority": "high", "timeframe": "12_months"}, {"goal": "Enhance capabilities through innovation", "priority": "medium", "timeframe": "ongoing"}]'::jsonb,
    '[{"challenge": "Balancing quality and speed in deliverables", "impact_level": "high"}, {"challenge": "Navigating complex organizational dynamics", "impact_level": "medium"}, {"challenge": "Staying current with evolving best practices", "impact_level": "medium"}]'::jsonb,
    ARRAY[]::TEXT[],
    '{}'::jsonb,
    'analytical',
    ARRAY[]::TEXT[],
    '{"age": 42, "location": "San Francisco, CA", "education_level": "MD"}'::jsonb::jsonb,
    TRUE,
    'approved'
);

-- ===================================================================
-- VERIFICATION
-- ===================================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    
    RAISE NOTICE '✅ Deployed % personas', v_count;
END $$;

COMMIT;
