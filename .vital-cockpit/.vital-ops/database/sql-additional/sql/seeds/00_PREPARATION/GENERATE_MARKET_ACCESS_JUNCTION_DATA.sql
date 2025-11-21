-- ==========================================
-- GENERATE JUNCTION DATA FOR MARKET ACCESS PERSONAS
-- Target: 144 personas without junction data
-- ==========================================
-- Tenant: f7aa6fd4-0af9-4706-8b31-034f1f7accda
-- Function: 4087be09-38e0-4c84-81e6-f79dd38151d3 (Market Access)
-- Date: 2025-11-17
--

BEGIN;

-- ==========================================
-- JUNCTION DATA FOR DIRECTOR PERSONAS
-- ==========================================

-- Goals for director personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Achieve market access objectives for assigned products and territories', 
  'primary', 
  1, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for director personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Build and maintain strong stakeholder relationships', 
  'secondary', 
  2, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for director personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Develop expertise in market access strategies and best practices', 
  'long_term', 
  3, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;


-- Pain points for director personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Complex pricing and contracting landscape', 
  'operational', 
  'high', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for director personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Competition from biosimilars and generics', 
  'operational', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for director personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Difficulty coordinating across cross-functional stakeholders', 
  'operational', 
  'medium', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for director personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Pressure to demonstrate real-world value and outcomes', 
  'operational', 
  'high', 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;


-- Challenges for director personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Keeping pace with evolving payer policies', 
  'daily', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for director personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing pricing pressures and discount demands', 
  'daily', 
  'high', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for director personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Coordinating market access strategy across stakeholders', 
  'daily', 
  'medium', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;


-- Responsibilities for director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Market access strategy development and execution', 
  'key', 
  35, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Payer engagement and relationship management', 
  'daily', 
  30, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Team leadership and cross-functional coordination', 
  'daily', 
  20, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for director personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Value evidence development and communication', 
  'weekly', 
  15, 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;


-- Tools for director personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Excel/Analytics tools', 
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
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for director personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'CRM systems (Salesforce, Veeva)', 
  'daily', 
  'proficient', 
  'satisfied', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for director personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Market access platforms', 
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
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for director personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Payer databases (MMIT, Managed Markets Insight)', 
  'weekly', 
  'proficient', 
  'satisfied', 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
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
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
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
  'HEOR/Value & Evidence teams', 
  'cross_functional',
  'weekly', 
  'excellent', 
  'very_high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
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
  'bi_weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
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
  'Commercial/Sales teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;


-- Quotes for director personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Market access requires understanding both clinical and economic value', 
  'general', 
  'professional', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;

-- Quotes for director personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Successful access strategies balance patient needs with payer requirements', 
  'general', 
  'thoughtful', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;


-- Communication preferences for director personas
INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'channel', 'Email, Phone, Video calls', 1, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'meeting', 'structured', 2, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'meeting'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'response', '24_hours', 3, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'response'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'style', 'data-driven', 4, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'style'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;


-- ==========================================
-- JUNCTION DATA FOR SENIOR PERSONAS
-- ==========================================

-- Goals for senior personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Achieve market access objectives for assigned products and territories', 
  'primary', 
  1, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for senior personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Build and maintain strong stakeholder relationships', 
  'secondary', 
  2, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for senior personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Develop expertise in market access strategies and best practices', 
  'long_term', 
  3, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;


-- Pain points for senior personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Limited budget and resources for market access activities', 
  'operational', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for senior personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Rapidly changing payer landscape and policies', 
  'operational', 
  'high', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for senior personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Complex pricing and contracting landscape', 
  'operational', 
  'high', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for senior personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Competition from biosimilars and generics', 
  'operational', 
  'medium', 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;


-- Challenges for senior personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Demonstrating product value to payers and providers', 
  'daily', 
  'high', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for senior personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Keeping pace with evolving payer policies', 
  'daily', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for senior personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Navigating complex payer access pathways', 
  'daily', 
  'high', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;


-- Responsibilities for senior personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Market access planning and implementation', 
  'key', 
  40, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for senior personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Payer account management and negotiations', 
  'daily', 
  30, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for senior personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Value proposition development', 
  'weekly', 
  20, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for senior personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Team collaboration and stakeholder management', 
  'daily', 
  10, 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;


-- Tools for senior personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'MS Office Suite', 
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
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for senior personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'CRM systems (Salesforce, Veeva)', 
  'daily', 
  'proficient', 
  'satisfied', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for senior personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Market access platforms', 
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
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for senior personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Payer databases (MMIT, Managed Markets Insight)', 
  'weekly', 
  'proficient', 
  'satisfied', 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;


-- Internal stakeholders for senior personas
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
  'bi_weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for senior personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'HEOR/Value & Evidence teams', 
  'cross_functional',
  'weekly', 
  'excellent', 
  'very_high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for senior personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Finance/Pricing teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for senior personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Commercial/Sales teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;


-- Quotes for senior personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Market access requires understanding both clinical and economic value', 
  'general', 
  'professional', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;

-- Quotes for senior personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Successful access strategies balance patient needs with payer requirements', 
  'general', 
  'thoughtful', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;


-- Communication preferences for senior personas
INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'channel', 'Email, Phone, Video calls', 1, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'meeting', 'structured', 2, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'meeting'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'response', '24_hours', 3, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'response'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'style', 'data-driven', 4, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'style'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;


-- ==========================================
-- JUNCTION DATA FOR MID-LEVEL PERSONAS
-- ==========================================

-- Goals for mid-level personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Achieve market access objectives for assigned products and territories', 
  'primary', 
  1, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for mid-level personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Build and maintain strong stakeholder relationships', 
  'secondary', 
  2, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for mid-level personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Develop expertise in market access strategies and best practices', 
  'long_term', 
  3, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;


-- Pain points for mid-level personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Limited budget and resources for market access activities', 
  'operational', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for mid-level personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Pressure to demonstrate real-world value and outcomes', 
  'operational', 
  'high', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for mid-level personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Increasingly restrictive payer policies and formulary access', 
  'operational', 
  'high', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for mid-level personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Patient affordability and out-of-pocket cost concerns', 
  'operational', 
  'high', 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;


-- Challenges for mid-level personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Managing pricing pressures and discount demands', 
  'daily', 
  'high', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for mid-level personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Navigating complex payer access pathways', 
  'daily', 
  'high', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for mid-level personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Keeping pace with evolving payer policies', 
  'daily', 
  'medium', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;


-- Responsibilities for mid-level personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Market access execution and support', 
  'key', 
  50, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for mid-level personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Data analysis and reporting', 
  'daily', 
  25, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for mid-level personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Stakeholder coordination', 
  'weekly', 
  15, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for mid-level personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Process and tool management', 
  'weekly', 
  10, 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;


-- Tools for mid-level personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Payer databases (MMIT, Managed Markets Insight)', 
  'weekly', 
  'proficient', 
  'satisfied', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for mid-level personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'CRM systems (Salesforce, Veeva)', 
  'daily', 
  'proficient', 
  'satisfied', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for mid-level personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'MS Office Suite', 
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
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for mid-level personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Excel/Analytics tools', 
  'daily', 
  'expert', 
  'satisfied', 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;


-- Internal stakeholders for mid-level personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Commercial/Sales teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for mid-level personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'HEOR/Value & Evidence teams', 
  'cross_functional',
  'weekly', 
  'excellent', 
  'very_high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for mid-level personas
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
  'bi_weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;

-- Internal stakeholders for mid-level personas
INSERT INTO persona_internal_stakeholders (
  persona_id, tenant_id, stakeholder_role, relationship_type, 
  interaction_frequency, relationship_quality, influence_level,
  created_at, updated_at
)
SELECT 
  p.id, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  'Finance/Pricing teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;


-- Quotes for mid-level personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Market access requires understanding both clinical and economic value', 
  'general', 
  'professional', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;

-- Quotes for mid-level personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Successful access strategies balance patient needs with payer requirements', 
  'general', 
  'thoughtful', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;


-- Communication preferences for mid-level personas
INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'channel', 'Email, Phone, Video calls', 1, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'meeting', 'structured', 2, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'meeting'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'response', '24_hours', 3, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'response'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'style', 'data-driven', 4, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'style'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'mid-level'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;


-- ==========================================
-- JUNCTION DATA FOR ASSOCIATE PERSONAS
-- ==========================================

-- Goals for associate personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Achieve market access objectives for assigned products and territories', 
  'primary', 
  1, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for associate personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Build and maintain strong stakeholder relationships', 
  'secondary', 
  2, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;

-- Goals for associate personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Develop expertise in market access strategies and best practices', 
  'long_term', 
  3, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_goals pg ON pg.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pg.id IS NULL
ON CONFLICT DO NOTHING;


-- Pain points for associate personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Competition from biosimilars and generics', 
  'operational', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for associate personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Increasingly restrictive payer policies and formulary access', 
  'operational', 
  'high', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for associate personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Pressure to demonstrate real-world value and outcomes', 
  'operational', 
  'high', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;

-- Pain points for associate personas
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Limited budget and resources for market access activities', 
  'operational', 
  'medium', 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pp.id IS NULL
ON CONFLICT DO NOTHING;


-- Challenges for associate personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Keeping pace with evolving payer policies', 
  'daily', 
  'medium', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for associate personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Coordinating market access strategy across stakeholders', 
  'daily', 
  'medium', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;

-- Challenges for associate personas
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Navigating complex payer access pathways', 
  'daily', 
  'high', 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_challenges pc ON pc.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pc.id IS NULL
ON CONFLICT DO NOTHING;


-- Responsibilities for associate personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Market access operations and analytics', 
  'key', 
  55, 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for associate personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Documentation and reporting', 
  'daily', 
  25, 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for associate personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Research and analysis support', 
  'daily', 
  15, 
  3, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;

-- Responsibilities for associate personas
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Learning and skill development', 
  'weekly', 
  5, 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pr.id IS NULL
ON CONFLICT DO NOTHING;


-- Tools for associate personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'MS Office Suite', 
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
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for associate personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Market access platforms', 
  'weekly', 
  'proficient', 
  'neutral', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for associate personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Payer databases (MMIT, Managed Markets Insight)', 
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
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pt.id IS NULL
ON CONFLICT DO NOTHING;

-- Tools for associate personas
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'CRM systems (Salesforce, Veeva)', 
  'daily', 
  'proficient', 
  'satisfied', 
  4, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_tools pt ON pt.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
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
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
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
  'Commercial/Sales teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
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
  'Medical Affairs', 
  'cross_functional',
  'bi_weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
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
  'Finance/Pricing teams', 
  'cross_functional',
  'weekly', 
  'good', 
  'high',
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders pis ON pis.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pis.id IS NULL
ON CONFLICT DO NOTHING;


-- Quotes for associate personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Market access requires understanding both clinical and economic value', 
  'general', 
  'professional', 
  1, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;

-- Quotes for associate personas
INSERT INTO persona_quotes (persona_id, quote_text, context, emotion, sequence_order, tenant_id, created_at, updated_at)
SELECT 
  p.id, 
  'Successful access strategies balance patient needs with payer requirements', 
  'general', 
  'thoughtful', 
  2, 
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 
  NOW(), 
  NOW()
FROM personas p
LEFT JOIN persona_quotes pq ON pq.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pq.id IS NULL
ON CONFLICT DO NOTHING;


-- Communication preferences for associate personas
INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'channel', 'Email, Phone, Video calls', 1, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'meeting', 'structured', 2, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'meeting'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'response', '24_hours', 3, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'response'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, tenant_id, preference_type, preference_value, sequence_order, created_at, updated_at)
SELECT p.id, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, 'style', 'data-driven', 4, NOW(), NOW()
FROM personas p
LEFT JOIN persona_communication_preferences pcp ON pcp.persona_id = p.id AND pcp.preference_type = 'style'
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'associate'
  AND pcp.id IS NULL
ON CONFLICT DO NOTHING;


COMMIT;

-- END OF SCRIPT
