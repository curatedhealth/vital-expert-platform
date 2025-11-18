-- ==========================================
-- GENERATE JUNCTION DATA FOR REMAINING REGULATORY PERSONAS
-- Target: Personas without junction table data
-- ==========================================
-- Tenant: f7aa6fd4-0af9-4706-8b31-034f1f7accda
-- Function: 43382f04-a819-4839-88c1-c1054d5ae071 (Regulatory Affairs)
-- Date: 2025-11-17
--

-- Get personas without junction data
WITH personas_without_data AS (
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.title,
    r.name as role_name,
    p.seniority_level,
    p.typical_organization_size,
    p.years_of_experience,
    ROW_NUMBER() OVER (ORDER BY p.name) as rn
  FROM personas p
  LEFT JOIN org_roles r ON p.role_id = r.id
  LEFT JOIN persona_goals pg ON pg.persona_id = p.id
  WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
    AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
    AND pg.id IS NULL
)
SELECT * FROM personas_without_data;
-- This is a comment showing the query structure


BEGIN;

-- ==========================================
-- JUNCTION DATA FOR VP PERSONAS
-- ==========================================

-- Goals for vp personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Drive global regulatory strategy and ensure compliance across all markets', 
  'primary', 
  1, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for vp personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Lead regulatory team to achieve 95%+ submission success rate', 
  'secondary', 
  2, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for vp personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Optimize regulatory processes to reduce approval timelines by 20%', 
  'long_term', 
  3, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;


-- Pain points for vp personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Keeping up with emerging regulatory guidance', 
  'operational', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for vp personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Complex documentation requirements and quality standards', 
  'operational', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for vp personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing cross-functional stakeholder expectations', 
  'operational', 
  'medium', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;


-- Challenges for vp personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Ensuring regulatory compliance across global markets', 
  'daily', 
  'high', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for vp personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing complex regulatory documentation', 
  'daily', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;


-- Responsibilities for vp personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Strategic regulatory leadership and planning', 
  'key', 
  35, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for vp personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory team management and development', 
  'daily', 
  25, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for vp personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory authority engagement and relationship management', 
  'weekly', 
  20, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for vp personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Cross-functional collaboration and stakeholder management', 
  'daily', 
  20, 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;


-- Tools for vp personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'MS Office', 
  'daily', 
  'expert', 
  'satisfied', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for vp personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Veeva Vault', 
  'daily', 
  'expert', 
  'satisfied', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for vp personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory databases (eCTD, etc.)', 
  'weekly', 
  'proficient', 
  'satisfied', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;


-- Internal stakeholders for vp personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'R&D/Clinical teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for vp personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Quality/Manufacturing', 
  'cross_functional',
  'bi_weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for vp personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Medical Affairs', 
  'cross_functional',
  'monthly', 
  'good', 
  'medium',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;


-- Quotes for vp personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory excellence requires strategic vision and meticulous execution', 
  'general', 
  'determined', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;

-- Quotes for vp personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Our role is to enable innovation while ensuring patient safety and compliance', 
  'general', 
  'professional', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;


-- Communication preferences for vp personas
INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'channel', 'Email, Teams, In-person', 1, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'meeting', 'efficient', 2, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'meeting'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'response', '24_hours', 3, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'response'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'style', 'professional', 4, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'style'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'vp'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;


-- ==========================================
-- JUNCTION DATA FOR SENIOR_DIRECTOR PERSONAS
-- ==========================================

-- Goals for senior_director personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Ensure successful regulatory approvals for key product portfolio', 
  'primary', 
  1, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for senior_director personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Build and mentor high-performing regulatory team', 
  'secondary', 
  2, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for senior_director personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Strengthen relationships with regulatory authorities', 
  'long_term', 
  3, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;


-- Pain points for senior_director personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing cross-functional stakeholder expectations', 
  'operational', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for senior_director personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Complex documentation requirements and quality standards', 
  'operational', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for senior_director personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Keeping up with emerging regulatory guidance', 
  'operational', 
  'medium', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;


-- Challenges for senior_director personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Maintaining submission quality and timeline adherence', 
  'daily', 
  'high', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for senior_director personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Coordinating with multiple stakeholders', 
  'daily', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;


-- Responsibilities for senior_director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory strategy development and execution', 
  'key', 
  40, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for senior_director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Team management and mentoring', 
  'daily', 
  25, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for senior_director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory submissions oversight', 
  'daily', 
  20, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for senior_director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Stakeholder coordination', 
  'daily', 
  15, 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;


-- Tools for senior_director personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'ARIS Publishing', 
  'weekly', 
  'proficient', 
  'neutral', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for senior_director personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Veeva Vault', 
  'daily', 
  'expert', 
  'satisfied', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for senior_director personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory databases (eCTD, etc.)', 
  'weekly', 
  'proficient', 
  'satisfied', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;


-- Internal stakeholders for senior_director personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Senior Leadership', 
  'executive',
  'monthly', 
  'good', 
  'very_high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for senior_director personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Quality/Manufacturing', 
  'cross_functional',
  'bi_weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for senior_director personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'R&D/Clinical teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;


-- Quotes for senior_director personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Success in regulatory affairs demands both expertise and collaboration', 
  'general', 
  'confident', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;

-- Quotes for senior_director personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'We must balance speed with quality in every submission', 
  'general', 
  'pragmatic', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;


-- Communication preferences for senior_director personas
INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'channel', 'Email, Teams, In-person', 1, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'meeting', 'efficient', 2, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'meeting'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'response', '24_hours', 3, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'response'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'style', 'professional', 4, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'style'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;


-- ==========================================
-- JUNCTION DATA FOR DIRECTOR PERSONAS
-- ==========================================

-- Goals for director personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Lead regulatory submissions and maintain compliance', 
  'primary', 
  1, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for director personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Develop regulatory strategies for assigned therapeutic areas', 
  'secondary', 
  2, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for director personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Coordinate cross-functional regulatory activities', 
  'long_term', 
  3, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;


-- Pain points for director personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Tight timelines and resource constraints for submissions', 
  'operational', 
  'high', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for director personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Complex documentation requirements and quality standards', 
  'operational', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for director personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Constantly changing regulatory requirements across different markets', 
  'operational', 
  'high', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;


-- Challenges for director personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Ensuring regulatory compliance across global markets', 
  'daily', 
  'high', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for director personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing complex regulatory documentation', 
  'daily', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;


-- Responsibilities for director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory submissions and filings management', 
  'key', 
  45, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Team coordination and oversight', 
  'daily', 
  25, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory compliance assurance', 
  'daily', 
  20, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Cross-functional collaboration', 
  'weekly', 
  10, 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;


-- Tools for director personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'MS Office', 
  'daily', 
  'expert', 
  'satisfied', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for director personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Veeva Vault', 
  'daily', 
  'expert', 
  'satisfied', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for director personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'ARIS Publishing', 
  'weekly', 
  'proficient', 
  'neutral', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;


-- Internal stakeholders for director personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Senior Leadership', 
  'executive',
  'monthly', 
  'good', 
  'very_high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for director personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Medical Affairs', 
  'cross_functional',
  'monthly', 
  'good', 
  'medium',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for director personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'R&D/Clinical teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;


-- Quotes for director personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory compliance is a team sport requiring clear communication', 
  'general', 
  'professional', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;

-- Quotes for director personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Staying ahead of regulatory changes is essential to our success', 
  'general', 
  'focused', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;


-- Communication preferences for director personas
INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'channel', 'Email, Teams, In-person', 1, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'meeting', 'efficient', 2, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'meeting'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'response', '24_hours', 3, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'response'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'style', 'professional', 4, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'style'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;


-- ==========================================
-- JUNCTION DATA FOR SENIOR_MANAGER PERSONAS
-- ==========================================

-- Goals for senior_manager personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Manage regulatory submission timelines and quality', 
  'primary', 
  1, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for senior_manager personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Ensure compliance with evolving regulatory requirements', 
  'secondary', 
  2, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for senior_manager personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Support team development and process improvement', 
  'long_term', 
  3, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;


-- Pain points for senior_manager personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Keeping up with emerging regulatory guidance', 
  'operational', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for senior_manager personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Tight timelines and resource constraints for submissions', 
  'operational', 
  'high', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for senior_manager personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing cross-functional stakeholder expectations', 
  'operational', 
  'medium', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;


-- Challenges for senior_manager personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing complex regulatory documentation', 
  'daily', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for senior_manager personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Ensuring regulatory compliance across global markets', 
  'daily', 
  'high', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;


-- Responsibilities for senior_manager personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory operations and submissions', 
  'key', 
  50, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for senior_manager personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Documentation review and approval', 
  'daily', 
  25, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for senior_manager personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Team support and guidance', 
  'daily', 
  15, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for senior_manager personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Process improvement initiatives', 
  'weekly', 
  10, 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;


-- Tools for senior_manager personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Veeva Vault', 
  'daily', 
  'expert', 
  'satisfied', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for senior_manager personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'MS Office', 
  'daily', 
  'expert', 
  'satisfied', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for senior_manager personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'ARIS Publishing', 
  'weekly', 
  'proficient', 
  'neutral', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;


-- Internal stakeholders for senior_manager personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Quality/Manufacturing', 
  'cross_functional',
  'bi_weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for senior_manager personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Senior Leadership', 
  'executive',
  'monthly', 
  'good', 
  'very_high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for senior_manager personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Medical Affairs', 
  'cross_functional',
  'monthly', 
  'good', 
  'medium',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;


-- Quotes for senior_manager personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Attention to detail and process excellence drive regulatory success', 
  'general', 
  'determined', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;

-- Quotes for senior_manager personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Building strong stakeholder relationships is key to timely approvals', 
  'general', 
  'collaborative', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;


-- Communication preferences for senior_manager personas
INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'channel', 'Email, Teams, In-person', 1, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'meeting', 'efficient', 2, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'meeting'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'response', '24_hours', 3, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'response'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'style', 'professional', 4, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'style'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'senior_manager'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;


-- ==========================================
-- JUNCTION DATA FOR MANAGER PERSONAS
-- ==========================================

-- Goals for manager personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Oversee regulatory activities for assigned products', 
  'primary', 
  1, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for manager personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Maintain regulatory documentation and compliance', 
  'secondary', 
  2, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for manager personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Coordinate with cross-functional stakeholders', 
  'long_term', 
  3, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;


-- Pain points for manager personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing cross-functional stakeholder expectations', 
  'operational', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for manager personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Constantly changing regulatory requirements across different markets', 
  'operational', 
  'high', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for manager personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Complex documentation requirements and quality standards', 
  'operational', 
  'medium', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;


-- Challenges for manager personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Coordinating with multiple stakeholders', 
  'daily', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for manager personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing complex regulatory documentation', 
  'daily', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;


-- Responsibilities for manager personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory document preparation and review', 
  'key', 
  55, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for manager personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Submission coordination and tracking', 
  'daily', 
  25, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for manager personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Compliance monitoring', 
  'daily', 
  15, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for manager personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Team collaboration', 
  'daily', 
  5, 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;


-- Tools for manager personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Veeva Vault', 
  'daily', 
  'expert', 
  'satisfied', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for manager personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory databases (eCTD, etc.)', 
  'weekly', 
  'proficient', 
  'satisfied', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for manager personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'MS Office', 
  'daily', 
  'expert', 
  'satisfied', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;


-- Internal stakeholders for manager personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Quality/Manufacturing', 
  'cross_functional',
  'bi_weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for manager personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Senior Leadership', 
  'executive',
  'monthly', 
  'good', 
  'very_high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for manager personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'R&D/Clinical teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;


-- Quotes for manager personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Quality documentation is the foundation of regulatory success', 
  'general', 
  'meticulous', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;

-- Quotes for manager personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Cross-functional alignment is critical for submission success', 
  'general', 
  'practical', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;


-- Communication preferences for manager personas
INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'channel', 'Email, Teams, In-person', 1, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'meeting', 'efficient', 2, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'meeting'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'response', '24_hours', 3, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'response'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'style', 'professional', 4, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'style'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'manager'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;


-- ==========================================
-- JUNCTION DATA FOR ASSOCIATE PERSONAS
-- ==========================================

-- Goals for associate personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Execute regulatory tasks and maintain documentation', 
  'primary', 
  1, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for associate personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Support regulatory submissions and filings', 
  'secondary', 
  2, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for associate personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Develop regulatory expertise and skills', 
  'long_term', 
  3, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;


-- Pain points for associate personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Complex documentation requirements and quality standards', 
  'operational', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for associate personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing cross-functional stakeholder expectations', 
  'operational', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for associate personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Keeping up with emerging regulatory guidance', 
  'operational', 
  'medium', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;


-- Challenges for associate personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Ensuring regulatory compliance across global markets', 
  'daily', 
  'high', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for associate personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing complex regulatory documentation', 
  'daily', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;


-- Responsibilities for associate personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory documentation and data management', 
  'key', 
  60, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for associate personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Submission support and coordination', 
  'daily', 
  25, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for associate personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Compliance tracking', 
  'daily', 
  10, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for associate personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Learning and development', 
  'weekly', 
  5, 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;


-- Tools for associate personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Veeva Vault', 
  'daily', 
  'expert', 
  'satisfied', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for associate personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Regulatory databases (eCTD, etc.)', 
  'weekly', 
  'proficient', 
  'satisfied', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for associate personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'MS Office', 
  'daily', 
  'expert', 
  'satisfied', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;


-- Internal stakeholders for associate personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Senior Leadership', 
  'executive',
  'monthly', 
  'good', 
  'very_high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for associate personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'R&D/Clinical teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for associate personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Quality/Manufacturing', 
  'cross_functional',
  'bi_weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;


-- Quotes for associate personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Learning and attention to detail are essential in regulatory affairs', 
  'general', 
  'eager', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;

-- Quotes for associate personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Every document contributes to patient safety and product approval', 
  'general', 
  'committed', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;


-- Communication preferences for associate personas
INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'channel', 'Email, Teams, In-person', 1, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'meeting', 'efficient', 2, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'meeting'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'response', '24_hours', 3, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'response'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'style', 'professional', 4, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'style'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND p.seniority_level = 'associate'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;


COMMIT;

-- END OF SCRIPT
