-- ============================================================================
-- FILL MARKET ACCESS PERSONA JUNCTION TABLE FINAL GAPS
-- ============================================================================
-- Date: 2025-11-17
-- Purpose: Fill remaining gaps to reach 99%+ coverage
--   - 12 personas missing all core junction data
--   - Additional personas missing quotes, stakeholders, communication prefs
-- ============================================================================

-- Set tenant ID
\set tenant_id 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'

-- ============================================================================
-- PHASE 1: Fill Core Junction Data for 12 Entry-Level Personas
-- ============================================================================

-- ============================================================================
-- persona_goals (12 missing)
-- ============================================================================

-- Entry-level goals for all 12 personas
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Learn and develop expertise in market access and payer engagement',
  'professional_development',
  1,
  1,
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Support team in delivering high-quality market access work',
  'performance',
  2,
  2,
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Gain experience across different market access functions',
  'professional_development',
  3,
  3,
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- persona_pain_points (12 missing)
-- ============================================================================

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, frequency, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Steep learning curve in understanding complex payer landscape',
  'knowledge_gaps',
  'medium',
  'daily',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, frequency, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Limited exposure to strategic decision-making processes',
  'career_development',
  'low',
  'weekly',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, frequency, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Balancing multiple tasks with tight deadlines',
  'workload',
  'medium',
  'daily',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- persona_challenges (12 missing)
-- ============================================================================

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Learning to navigate complex payer requirements and regulations',
  'technical',
  'medium',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Developing effective communication with senior stakeholders',
  'interpersonal',
  'medium',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Managing workload while maintaining high quality standards',
  'operational',
  'medium',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- persona_responsibilities (12 missing)
-- ============================================================================

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Supporting data analysis and research activities',
  'operational',
  40,
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Assisting with document preparation and coordination',
  'operational',
  30,
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Learning and professional development',
  'development',
  20,
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Administrative support and coordination tasks',
  'operational',
  10,
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- persona_tools (12 missing)
-- ============================================================================

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Excel/Analytics tools',
  'daily',
  'proficient',
  'satisfied',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'MS Office Suite',
  'daily',
  'expert',
  'satisfied',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Payer databases (MMIT, etc.)',
  'weekly',
  'learning',
  'neutral',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.slug IN (
    'amanda-lee-heor-associate-22',
    'brian-moore-ma-operations-coordinator-55',
    'christopher-wilson-patient-access-coordinator-59',
    'james-garcia-heor-associate-23',
    'kevin-anderson-ma-operations-coordinator-52',
    'lauren-martinez-patient-access-coordinator-58',
    'lauren-young-heor-associate-21',
    'matthew-hall-patient-access-coordinator-57',
    'michelle-lopez-heor-associate-20',
    'michelle-thompson-patient-access-coordinator-56',
    'michelle-walker-ma-operations-coordinator-53',
    'robert-hill-ma-operations-coordinator-54'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PHASE 2: Fill Missing Internal Stakeholders (18 missing)
-- ============================================================================

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_type, interaction_frequency, influence_level, relationship_type, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Market Access Leadership',
  'weekly',
  'high',
  'reporting',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders stake ON stake.persona_id = p.id
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND stake.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_type, interaction_frequency, influence_level, relationship_type, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Marketing/Commercial teams',
  'bi-weekly',
  'medium',
  'cross-functional',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders stake ON stake.persona_id = p.id AND stake.stakeholder_type = 'Marketing/Commercial teams'
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND stake.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_type, interaction_frequency, influence_level, relationship_type, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Medical Affairs',
  'monthly',
  'medium',
  'cross-functional',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
LEFT JOIN persona_internal_stakeholders stake ON stake.persona_id = p.id AND stake.stakeholder_type = 'Medical Affairs'
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND stake.id IS NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PHASE 3: Fill Missing Communication Preferences (18 missing)
-- ============================================================================

INSERT INTO persona_communication_preferences (persona_id, channel, meeting_style, response_time_expectation, communication_style, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Email, Teams, In-person',
  'efficient',
  '24_hours',
  'professional',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
LEFT JOIN persona_communication_preferences comm ON comm.persona_id = p.id
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND comm.id IS NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PHASE 4: Fill Missing Quotes (28 missing)
-- ============================================================================

-- Entry-level quotes
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Every day is a learning opportunity in market access - the payer landscape is complex but fascinating',
  'career_development',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
LEFT JOIN persona_quotes quotes ON quotes.persona_id = p.id
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'entry'
  AND quotes.id IS NULL
ON CONFLICT DO NOTHING;

-- Manager-level quotes
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Success in market access requires balancing clinical value with economic realities',
  'market_access_philosophy',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
LEFT JOIN persona_quotes quotes ON quotes.persona_id = p.id
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'manager'
  AND quotes.id IS NULL
ON CONFLICT DO NOTHING;

-- Senior Manager quotes
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Strong payer relationships are built on trust, data, and consistent delivery',
  'stakeholder_management',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
LEFT JOIN persona_quotes quotes ON quotes.persona_id = p.id
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior_manager'
  AND quotes.id IS NULL
ON CONFLICT DO NOTHING;

-- Director-level quotes
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Our role is to ensure patients get access to innovative therapies while demonstrating clear value to payers',
  'mission_driven',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
LEFT JOIN persona_quotes quotes ON quotes.persona_id = p.id
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'director'
  AND quotes.id IS NULL
ON CONFLICT DO NOTHING;

-- Senior Director quotes
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Strategic market access planning starts at product development and continues through lifecycle management',
  'strategic_perspective',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
LEFT JOIN persona_quotes quotes ON quotes.persona_id = p.id
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'senior_director'
  AND quotes.id IS NULL
ON CONFLICT DO NOTHING;

-- VP-level quotes
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Market access excellence requires cross-functional alignment and data-driven strategy',
  'leadership_philosophy',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
LEFT JOIN persona_quotes quotes ON quotes.persona_id = p.id
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level = 'vp'
  AND quotes.id IS NULL
ON CONFLICT DO NOTHING;

-- Executive/C-Suite quotes
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT
  p.id,
  'Market access is not just about price - it''s about demonstrating value and ensuring patient access to innovation',
  'executive_vision',
  :'tenant_id'::uuid,
  NOW(),
  NOW()
FROM personas p
LEFT JOIN persona_quotes quotes ON quotes.persona_id = p.id
WHERE p.tenant_id = :'tenant_id'::uuid
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND p.seniority_level IN ('executive', 'c-suite')
  AND quotes.id IS NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo 'VERIFICATION: Market Access Persona Junction Table Coverage'
\echo '============================================================================'
\echo ''

WITH our_personas AS (
  SELECT id FROM personas
  WHERE tenant_id = :'tenant_id'::uuid
    AND function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
)
SELECT
  'Market Access' as function,
  COUNT(DISTINCT p.id) as total_personas,
  COUNT(DISTINCT goals.persona_id) as with_goals,
  ROUND(COUNT(DISTINCT goals.persona_id)::numeric / COUNT(DISTINCT p.id) * 100, 1) as goals_pct,
  COUNT(DISTINCT chall.persona_id) as with_challenges,
  ROUND(COUNT(DISTINCT chall.persona_id)::numeric / COUNT(DISTINCT p.id) * 100, 1) as challenges_pct,
  COUNT(DISTINCT resp.persona_id) as with_responsibilities,
  ROUND(COUNT(DISTINCT resp.persona_id)::numeric / COUNT(DISTINCT p.id) * 100, 1) as resp_pct,
  COUNT(DISTINCT pain.persona_id) as with_pain_points,
  ROUND(COUNT(DISTINCT pain.persona_id)::numeric / COUNT(DISTINCT p.id) * 100, 1) as pain_pct,
  COUNT(DISTINCT tools.persona_id) as with_tools,
  ROUND(COUNT(DISTINCT tools.persona_id)::numeric / COUNT(DISTINCT p.id) * 100, 1) as tools_pct,
  COUNT(DISTINCT int_stake.persona_id) as with_internal_stakeholders,
  ROUND(COUNT(DISTINCT int_stake.persona_id)::numeric / COUNT(DISTINCT p.id) * 100, 1) as stakeholders_pct,
  COUNT(DISTINCT comm.persona_id) as with_communication_prefs,
  ROUND(COUNT(DISTINCT comm.persona_id)::numeric / COUNT(DISTINCT p.id) * 100, 1) as comm_pct,
  COUNT(DISTINCT quotes.persona_id) as with_quotes,
  ROUND(COUNT(DISTINCT quotes.persona_id)::numeric / COUNT(DISTINCT p.id) * 100, 1) as quotes_pct
FROM our_personas p
LEFT JOIN persona_goals goals ON goals.persona_id = p.id
LEFT JOIN persona_challenges chall ON chall.persona_id = p.id
LEFT JOIN persona_responsibilities resp ON resp.persona_id = p.id
LEFT JOIN persona_pain_points pain ON pain.persona_id = p.id
LEFT JOIN persona_tools tools ON tools.persona_id = p.id
LEFT JOIN persona_internal_stakeholders int_stake ON int_stake.persona_id = p.id
LEFT JOIN persona_communication_preferences comm ON comm.persona_id = p.id
LEFT JOIN persona_quotes quotes ON quotes.persona_id = p.id;

\echo ''
\echo 'Target: 99%+ coverage across all junction tables'
\echo 'Expected: 278/278 or 277/278 for all tables'
\echo ''
