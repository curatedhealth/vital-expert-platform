-- ============================================================================
-- ADD 4TH PERSONA TO COMMERCIAL ORGANIZATION ROLES
-- ============================================================================
-- Date: 2025-11-17
-- Total Additional Personas: 36
-- Purpose: Bring all roles to exactly 4 personas each
-- ============================================================================


-- ============================================================================
-- Gregory Cox - Director Territory Management (large)
-- ============================================================================

-- Insert persona: Gregory Cox
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '34310065-56f0-5f3b-9c8f-5d0861d4af60'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Gregory Cox',
  'gregory-cox-director-territory-management-large-v4',
  '33-43',
  'Seattle, WA',
  'MBA',
  18,
  'director',
  'large',
  21,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Gregory Cox
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Field Sales Operations',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Field Sales Operations',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Gregory Cox
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Field Sales Operations execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Gregory Cox
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Gregory Cox
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Territory Management',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Territory Management',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Territory Management',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Gregory Cox
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Gregory Cox
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Gregory Cox (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Gregory Cox
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Field Sales Operations requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'gregory-cox-director-territory-management-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Kimberly Kelly - Director Sales Analytics (large)
-- ============================================================================

-- Insert persona: Kimberly Kelly
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '999765b6-1702-5ccf-874c-bd5a6d10d800'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Kimberly Kelly',
  'kimberly-kelly-director-sales-analytics-large-v4',
  '32-42',
  'Seattle, WA',
  'MBA',
  15,
  'director',
  'large',
  16,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Kimberly Kelly
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Field Sales Operations',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Field Sales Operations',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Kimberly Kelly
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Field Sales Operations execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Kimberly Kelly
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Kimberly Kelly
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Sales Analytics',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Sales Analytics',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Sales Analytics',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Kimberly Kelly
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Kimberly Kelly
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Kimberly Kelly (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Kimberly Kelly
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Field Sales Operations requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kimberly-kelly-director-sales-analytics-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Heather Morris - Sales Operations Manager (large)
-- ============================================================================

-- Insert persona: Heather Morris
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'ef71bea6-d4c2-5706-bef1-b1a193eaddac'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Heather Morris',
  'heather-morris-sales-operations-manager-large-v4',
  '31-41',
  'Seattle, WA',
  'MBA',
  4,
  'senior',
  'large',
  5,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Heather Morris
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Field Sales Operations',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Field Sales Operations',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Heather Morris
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Field Sales Operations execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Heather Morris
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Heather Morris
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Sales Operations Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Sales Operations Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Sales Operations Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Heather Morris
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Heather Morris
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Heather Morris (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Heather Morris
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Field Sales Operations requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-morris-sales-operations-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Justin Parker - District Sales Manager (large)
-- ============================================================================

-- Insert persona: Justin Parker
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '7cc32a12-1cb2-5436-a131-ea3d87011d7d'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Justin Parker',
  'justin-parker-district-sales-manager-large-v4',
  '32-42',
  'Seattle, WA',
  'Bachelor''s',
  7,
  'mid-level',
  'large',
  12,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Justin Parker
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Field Sales Operations',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Field Sales Operations',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Justin Parker
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Field Sales Operations execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Justin Parker
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Justin Parker
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for District Sales Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for District Sales Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for District Sales Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Justin Parker
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Justin Parker
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Justin Parker (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Justin Parker
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Field Sales Operations requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-parker-district-sales-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Dennis Richardson - Sales Representative (large)
-- ============================================================================

-- Insert persona: Dennis Richardson
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'f3d9242f-a85a-581e-8573-8ee66857f135'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Dennis Richardson',
  'dennis-richardson-sales-representative-large-v4',
  '30-40',
  'Seattle, WA',
  'Bachelor''s',
  3,
  'mid-level',
  'large',
  3,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Dennis Richardson
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Field Sales Operations',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Field Sales Operations',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Dennis Richardson
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Field Sales Operations execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Dennis Richardson
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Dennis Richardson
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Sales Representative',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Sales Representative',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Sales Representative',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Dennis Richardson
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Dennis Richardson
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Dennis Richardson (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Dennis Richardson
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Field Sales Operations requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'dennis-richardson-sales-representative-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Elizabeth Gray - Senior Sales Representative (large)
-- ============================================================================

-- Insert persona: Elizabeth Gray
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '8e157904-8e19-53d7-b98e-b129cd23cb3a'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Elizabeth Gray',
  'elizabeth-gray-senior-sales-representative-large-v4',
  '31-41',
  'Seattle, WA',
  'BS/MS',
  4,
  'senior',
  'large',
  5,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Elizabeth Gray
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Field Sales Operations',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Field Sales Operations',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Elizabeth Gray
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Field Sales Operations execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Elizabeth Gray
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Elizabeth Gray
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Sales Representative',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Sales Representative',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Sales Representative',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Elizabeth Gray
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Elizabeth Gray
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Elizabeth Gray (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Elizabeth Gray
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Field Sales Operations requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-gray-senior-sales-representative-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Brandon Bell - Director Specialty Sales (large)
-- ============================================================================

-- Insert persona: Brandon Bell
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'b0ac6a99-50df-53fd-b0e2-f02c4edb8460'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Brandon Bell',
  'brandon-bell-director-specialty-sales-large-v4',
  '33-43',
  'Seattle, WA',
  'MBA',
  17,
  'director',
  'large',
  22,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Brandon Bell
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Specialty & Hospital Sales',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Specialty & Hospital Sales',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Brandon Bell
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Specialty & Hospital Sales execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Brandon Bell
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Brandon Bell
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Specialty Sales',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Specialty Sales',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Specialty Sales',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Brandon Bell
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Brandon Bell
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Brandon Bell (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Brandon Bell
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Specialty & Hospital Sales requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brandon-bell-director-specialty-sales-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Stephanie Cox - Specialty Sales Manager (large)
-- ============================================================================

-- Insert persona: Stephanie Cox
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '7f2dbb58-d45d-5d1b-a269-f9ca8f99b95b'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Stephanie Cox',
  'stephanie-cox-specialty-sales-manager-large-v4',
  '32-42',
  'Seattle, WA',
  'BS/MS',
  6,
  'senior',
  'large',
  10,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Stephanie Cox
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Specialty & Hospital Sales',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Specialty & Hospital Sales',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Stephanie Cox
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Specialty & Hospital Sales execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Stephanie Cox
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Stephanie Cox
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Specialty Sales Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Specialty Sales Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Specialty Sales Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Stephanie Cox
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Stephanie Cox
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Stephanie Cox (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Stephanie Cox
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Specialty & Hospital Sales requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'stephanie-cox-specialty-sales-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Timothy Watson - Hospital Account Manager (large)
-- ============================================================================

-- Insert persona: Timothy Watson
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '9c90afed-6e04-58ff-b0a9-e952962f6336'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Timothy Watson',
  'timothy-watson-hospital-account-manager-large-v4',
  '32-42',
  'Seattle, WA',
  'BS/MS',
  5,
  'senior',
  'large',
  9,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Timothy Watson
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Specialty & Hospital Sales',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Specialty & Hospital Sales',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Timothy Watson
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Specialty & Hospital Sales execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Timothy Watson
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Timothy Watson
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Hospital Account Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Hospital Account Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Hospital Account Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Timothy Watson
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Timothy Watson
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Timothy Watson (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Timothy Watson
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Specialty & Hospital Sales requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-watson-hospital-account-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Justin Sanders - Specialty Sales Representative (large)
-- ============================================================================

-- Insert persona: Justin Sanders
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '7b3a84cd-9695-5c26-8dbf-3a82ec3dd4fd'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Justin Sanders',
  'justin-sanders-specialty-sales-representative-large-v4',
  '30-40',
  'Seattle, WA',
  'Bachelor''s',
  5,
  'mid-level',
  'large',
  10,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Justin Sanders
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Specialty & Hospital Sales',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Specialty & Hospital Sales',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Justin Sanders
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Specialty & Hospital Sales execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Justin Sanders
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Justin Sanders
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Specialty Sales Representative',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Specialty Sales Representative',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Specialty Sales Representative',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Justin Sanders
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Justin Sanders
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Justin Sanders (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Justin Sanders
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Specialty & Hospital Sales requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'justin-sanders-specialty-sales-representative-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Rebecca Bennett - Hospital Sales Representative (large)
-- ============================================================================

-- Insert persona: Rebecca Bennett
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'e01ee5ca-30ae-5721-a7f7-8febd989d508'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Rebecca Bennett',
  'rebecca-bennett-hospital-sales-representative-large-v4',
  '30-40',
  'Seattle, WA',
  'Bachelor''s',
  5,
  'mid-level',
  'large',
  6,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Rebecca Bennett
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Specialty & Hospital Sales',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Specialty & Hospital Sales',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Rebecca Bennett
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Specialty & Hospital Sales execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Rebecca Bennett
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Rebecca Bennett
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Hospital Sales Representative',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Hospital Sales Representative',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Hospital Sales Representative',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Rebecca Bennett
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Rebecca Bennett
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Rebecca Bennett (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Rebecca Bennett
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Specialty & Hospital Sales requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-bennett-hospital-sales-representative-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Timothy Bennett - VP Key Accounts (large)
-- ============================================================================

-- Insert persona: Timothy Bennett
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'e611c698-7023-5362-9f4c-f7d4d896dcb1'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Timothy Bennett',
  'timothy-bennett-vp-key-accounts-large-v4',
  '36-46',
  'Seattle, WA',
  'MBA',
  17,
  'director',
  'large',
  21,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Timothy Bennett
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Specialty & Hospital Sales',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Specialty & Hospital Sales',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Timothy Bennett
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Specialty & Hospital Sales execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Timothy Bennett
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Timothy Bennett
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Key Accounts',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Key Accounts',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Key Accounts',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Timothy Bennett
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Timothy Bennett
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Timothy Bennett (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Timothy Bennett
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Specialty & Hospital Sales requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'timothy-bennett-vp-key-accounts-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Jonathan Reed - ED Strategic Accounts (large)
-- ============================================================================

-- Insert persona: Jonathan Reed
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'cc67303e-6010-5430-86e9-c6deea89d626'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Jonathan Reed',
  'jonathan-reed-ed-strategic-accounts-large-v4',
  '34-44',
  'Seattle, WA',
  'MBA',
  18,
  'director',
  'large',
  21,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Jonathan Reed
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Specialty & Hospital Sales',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Specialty & Hospital Sales',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Jonathan Reed
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Specialty & Hospital Sales execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Jonathan Reed
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Jonathan Reed
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for ED Strategic Accounts',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for ED Strategic Accounts',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for ED Strategic Accounts',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Jonathan Reed
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Jonathan Reed
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Jonathan Reed (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Jonathan Reed
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Specialty & Hospital Sales requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-ed-strategic-accounts-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Jeffrey Barnes - Director Key Account Management (large)
-- ============================================================================

-- Insert persona: Jeffrey Barnes
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'b3a435af-ee47-5165-b873-a71a8270a0fb'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Jeffrey Barnes',
  'jeffrey-barnes-director-key-account-management-large-v4',
  '33-43',
  'Seattle, WA',
  'MBA',
  11,
  'director',
  'large',
  15,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Jeffrey Barnes
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Specialty & Hospital Sales',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Specialty & Hospital Sales',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Jeffrey Barnes
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Specialty & Hospital Sales execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Jeffrey Barnes
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Jeffrey Barnes
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Key Account Management',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Key Account Management',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Key Account Management',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Jeffrey Barnes
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Jeffrey Barnes
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Jeffrey Barnes (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Jeffrey Barnes
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Specialty & Hospital Sales requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-barnes-director-key-account-management-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Benjamin Peterson - Senior Key Account Manager (large)
-- ============================================================================

-- Insert persona: Benjamin Peterson
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '1fc19cb6-8f8d-524a-a942-460a97f547d9'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Benjamin Peterson',
  'benjamin-peterson-senior-key-account-manager-large-v4',
  '32-42',
  'Seattle, WA',
  'BS/MS',
  7,
  'senior',
  'large',
  10,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Benjamin Peterson
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Specialty & Hospital Sales',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Specialty & Hospital Sales',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Benjamin Peterson
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Specialty & Hospital Sales execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Benjamin Peterson
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Benjamin Peterson
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Key Account Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Key Account Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Key Account Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Benjamin Peterson
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Benjamin Peterson
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Benjamin Peterson (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Benjamin Peterson
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Specialty & Hospital Sales requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-peterson-senior-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Raymond Mitchell - Key Account Manager (large)
-- ============================================================================

-- Insert persona: Raymond Mitchell
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '021f258c-54c4-5def-9ae3-161586dbca64'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Raymond Mitchell',
  'raymond-mitchell-key-account-manager-large-v4',
  '30-40',
  'Seattle, WA',
  'Bachelor''s',
  3,
  'mid-level',
  'large',
  8,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Raymond Mitchell
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Key Account Management',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Key Account Management',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Raymond Mitchell
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Key Account Management execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Raymond Mitchell
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Raymond Mitchell
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Key Account Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Key Account Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Key Account Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Raymond Mitchell
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Raymond Mitchell
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Raymond Mitchell (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Raymond Mitchell
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Key Account Management requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-mitchell-key-account-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Kevin Watson - VP Customer Experience (large)
-- ============================================================================

-- Insert persona: Kevin Watson
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '87bb7414-1f25-5ced-9be4-8b70926eb755'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Kevin Watson',
  'kevin-watson-vp-customer-experience-large-v4',
  '35-45',
  'Seattle, WA',
  'MBA',
  14,
  'director',
  'large',
  15,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Kevin Watson
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Key Account Management',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Key Account Management',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Kevin Watson
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Key Account Management execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Kevin Watson
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Kevin Watson
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Customer Experience',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Customer Experience',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Customer Experience',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Kevin Watson
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Kevin Watson
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Kevin Watson (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Kevin Watson
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Key Account Management requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kevin-watson-vp-customer-experience-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Victoria Collins - Director Customer Insights (large)
-- ============================================================================

-- Insert persona: Victoria Collins
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '5c2e0aae-0fd7-5a02-b66a-42390ac80ff0'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Victoria Collins',
  'victoria-collins-director-customer-insights-large-v4',
  '32-42',
  'Seattle, WA',
  'MBA',
  7,
  'senior',
  'large',
  7,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Victoria Collins
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Key Account Management',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Key Account Management',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Victoria Collins
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Key Account Management execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Victoria Collins
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Victoria Collins
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Customer Insights',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Customer Insights',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Customer Insights',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Victoria Collins
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Victoria Collins
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Victoria Collins (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Victoria Collins
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Key Account Management requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'victoria-collins-director-customer-insights-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Heather Peterson - Customer Experience Manager (large)
-- ============================================================================

-- Insert persona: Heather Peterson
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '55d9b5e0-b98a-57a5-ad67-6713ebed1701'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Heather Peterson',
  'heather-peterson-customer-experience-manager-large-v4',
  '31-41',
  'Seattle, WA',
  'Bachelor''s',
  5,
  'mid-level',
  'large',
  8,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Heather Peterson
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Key Account Management',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Key Account Management',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Heather Peterson
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Key Account Management execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Heather Peterson
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Heather Peterson
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Customer Experience Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Customer Experience Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Customer Experience Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Heather Peterson
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Heather Peterson
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Heather Peterson (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Heather Peterson
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Key Account Management requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'heather-peterson-customer-experience-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Jonathan Cooper - Senior Product Manager (large)
-- ============================================================================

-- Insert persona: Jonathan Cooper
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '0ab43403-2cc6-5dfc-a869-6a3f11b3450c'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Jonathan Cooper',
  'jonathan-cooper-senior-product-manager-large-v4',
  '31-41',
  'Seattle, WA',
  'Bachelor''s',
  7,
  'mid-level',
  'large',
  8,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Jonathan Cooper
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Commercial Marketing',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Commercial Marketing',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Jonathan Cooper
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Commercial Marketing execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Jonathan Cooper
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Jonathan Cooper
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Product Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Product Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Product Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Jonathan Cooper
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Jonathan Cooper
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Jonathan Cooper (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Jonathan Cooper
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Commercial Marketing requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-cooper-senior-product-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Rachel Torres - Marketing Operations Manager (large)
-- ============================================================================

-- Insert persona: Rachel Torres
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'a9a601ad-66c9-57d5-856b-eb40ebd59413'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Rachel Torres',
  'rachel-torres-marketing-operations-manager-large-v4',
  '31-41',
  'Seattle, WA',
  'MBA',
  5,
  'senior',
  'large',
  5,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Rachel Torres
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Commercial Marketing',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Commercial Marketing',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Rachel Torres
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Commercial Marketing execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Rachel Torres
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Rachel Torres
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Marketing Operations Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Marketing Operations Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Marketing Operations Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Rachel Torres
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Rachel Torres
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Rachel Torres (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Rachel Torres
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Commercial Marketing requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rachel-torres-marketing-operations-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Raymond Stewart - Digital Marketing Specialist (large)
-- ============================================================================

-- Insert persona: Raymond Stewart
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'db9c3666-dfce-5b04-91df-d9b2c873e42b'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Raymond Stewart',
  'raymond-stewart-digital-marketing-specialist-large-v4',
  '30-40',
  'Seattle, WA',
  'Bachelor''s',
  3,
  'mid-level',
  'large',
  4,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Raymond Stewart
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Commercial Marketing',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Commercial Marketing',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Raymond Stewart
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Commercial Marketing execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Raymond Stewart
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Raymond Stewart
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Digital Marketing Specialist',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Digital Marketing Specialist',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Digital Marketing Specialist',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Raymond Stewart
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Raymond Stewart
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Raymond Stewart (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Raymond Stewart
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Commercial Marketing requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'raymond-stewart-digital-marketing-specialist-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Elizabeth Morgan - Senior Manager Competitive Intelligence (large)
-- ============================================================================

-- Insert persona: Elizabeth Morgan
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'dacbeccc-4da6-591f-bb23-3b7c348ea2c5'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Elizabeth Morgan',
  'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4',
  '32-42',
  'Seattle, WA',
  'MBA',
  6,
  'senior',
  'large',
  6,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Elizabeth Morgan
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Commercial Marketing',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Commercial Marketing',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Elizabeth Morgan
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Commercial Marketing execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Elizabeth Morgan
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Elizabeth Morgan
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Manager Competitive Intelligence',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Manager Competitive Intelligence',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Manager Competitive Intelligence',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Elizabeth Morgan
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Elizabeth Morgan
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Elizabeth Morgan (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Elizabeth Morgan
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Commercial Marketing requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'elizabeth-morgan-senior-manager-competitive-intelligence-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Alexander Coleman - Senior Analytics Manager (large)
-- ============================================================================

-- Insert persona: Alexander Coleman
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '097337c5-9084-5b1e-915a-bc631c89fb10'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Alexander Coleman',
  'alexander-coleman-senior-analytics-manager-large-v4',
  '31-41',
  'Seattle, WA',
  'MBA',
  9,
  'senior',
  'large',
  11,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Alexander Coleman
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Business Development & Licensing',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Business Development & Licensing',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Alexander Coleman
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Business Development & Licensing execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Alexander Coleman
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Alexander Coleman
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Analytics Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Analytics Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Analytics Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Alexander Coleman
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Alexander Coleman
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Alexander Coleman (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Alexander Coleman
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Business Development & Licensing requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'alexander-coleman-senior-analytics-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Jonathan Reed - Data Scientist (large)
-- ============================================================================

-- Insert persona: Jonathan Reed
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'dadef2c6-df63-5a98-921f-8192eb47435c'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Jonathan Reed',
  'jonathan-reed-data-scientist-large-v4',
  '30-40',
  'Seattle, WA',
  'Bachelor''s',
  5,
  'mid-level',
  'large',
  10,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Jonathan Reed
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Business Development & Licensing',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Business Development & Licensing',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Jonathan Reed
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Business Development & Licensing execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Jonathan Reed
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Jonathan Reed
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Data Scientist',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Data Scientist',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Data Scientist',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Jonathan Reed
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Jonathan Reed
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Jonathan Reed (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Jonathan Reed
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Business Development & Licensing requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jonathan-reed-data-scientist-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Jeffrey Morris - Business Intelligence Developer (large)
-- ============================================================================

-- Insert persona: Jeffrey Morris
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'ce7c2628-1083-52d6-8707-e68a0dfee942'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Jeffrey Morris',
  'jeffrey-morris-business-intelligence-developer-large-v4',
  '31-41',
  'Seattle, WA',
  'Bachelor''s',
  5,
  'mid-level',
  'large',
  6,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Jeffrey Morris
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Business Development & Licensing',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Business Development & Licensing',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Jeffrey Morris
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Business Development & Licensing execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Jeffrey Morris
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Jeffrey Morris
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Business Intelligence Developer',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Business Intelligence Developer',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Business Intelligence Developer',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Jeffrey Morris
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Jeffrey Morris
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Jeffrey Morris (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Jeffrey Morris
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Business Development & Licensing requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-morris-business-intelligence-developer-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Rebecca Henderson - VP Sales Training & Development (large)
-- ============================================================================

-- Insert persona: Rebecca Henderson
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '77a459b0-eb36-573f-a004-a6f6fd9f4012'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Rebecca Henderson',
  'rebecca-henderson-vp-sales-training-and-development-large-v4',
  '35-45',
  'Seattle, WA',
  'MBA',
  14,
  'director',
  'large',
  16,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Rebecca Henderson
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Business Development & Licensing',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Business Development & Licensing',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Rebecca Henderson
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Business Development & Licensing execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Rebecca Henderson
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Rebecca Henderson
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Sales Training & Development',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Sales Training & Development',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Sales Training & Development',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Rebecca Henderson
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Rebecca Henderson
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Rebecca Henderson (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Rebecca Henderson
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Business Development & Licensing requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'rebecca-henderson-vp-sales-training-and-development-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Christina Ross - ED Commercial Learning (large)
-- ============================================================================

-- Insert persona: Christina Ross
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '407d88f4-f2b2-5540-85a2-094d6590bcbf'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Christina Ross',
  'christina-ross-ed-commercial-learning-large-v4',
  '33-43',
  'Seattle, WA',
  'MBA',
  16,
  'director',
  'large',
  18,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Christina Ross
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Commercial Analytics & Insights',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Commercial Analytics & Insights',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Christina Ross
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Commercial Analytics & Insights execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Christina Ross
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Christina Ross
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for ED Commercial Learning',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for ED Commercial Learning',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for ED Commercial Learning',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Christina Ross
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Christina Ross
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Christina Ross (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Christina Ross
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Commercial Analytics & Insights requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'christina-ross-ed-commercial-learning-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Jeffrey Kelly - Director Field Enablement (large)
-- ============================================================================

-- Insert persona: Jeffrey Kelly
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'bf8760d1-ae4c-5c5f-8f63-24d17236b4ee'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Jeffrey Kelly',
  'jeffrey-kelly-director-field-enablement-large-v4',
  '32-42',
  'Seattle, WA',
  'MBA',
  4,
  'senior',
  'large',
  6,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Jeffrey Kelly
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Commercial Analytics & Insights',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Commercial Analytics & Insights',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Jeffrey Kelly
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Commercial Analytics & Insights execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Jeffrey Kelly
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Jeffrey Kelly
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Field Enablement',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Field Enablement',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Field Enablement',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Jeffrey Kelly
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Jeffrey Kelly
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Jeffrey Kelly (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Jeffrey Kelly
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Commercial Analytics & Insights requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'jeffrey-kelly-director-field-enablement-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Brittany Bennett - Senior Training Manager (large)
-- ============================================================================

-- Insert persona: Brittany Bennett
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '44aef00d-81c9-582e-b060-2f253888b751'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Brittany Bennett',
  'brittany-bennett-senior-training-manager-large-v4',
  '31-41',
  'Seattle, WA',
  'MBA',
  5,
  'senior',
  'large',
  7,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Brittany Bennett
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Commercial Analytics & Insights',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Commercial Analytics & Insights',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Brittany Bennett
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Commercial Analytics & Insights execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Brittany Bennett
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Brittany Bennett
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Training Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Training Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Senior Training Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Brittany Bennett
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Brittany Bennett
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Brittany Bennett (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Brittany Bennett
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Commercial Analytics & Insights requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'brittany-bennett-senior-training-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Lauren Edwards - Instructional Designer (large)
-- ============================================================================

-- Insert persona: Lauren Edwards
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  'd39326bd-b36b-5d29-b012-03ccd04155bf'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Lauren Edwards',
  'lauren-edwards-instructional-designer-large-v4',
  '30-40',
  'Seattle, WA',
  'Bachelor''s',
  3,
  'mid-level',
  'large',
  3,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Lauren Edwards
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Commercial Analytics & Insights',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Commercial Analytics & Insights',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Lauren Edwards
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Commercial Analytics & Insights execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Lauren Edwards
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Lauren Edwards
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Instructional Designer',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Instructional Designer',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Instructional Designer',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Lauren Edwards
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Lauren Edwards
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Lauren Edwards (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Lauren Edwards
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Commercial Analytics & Insights requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'lauren-edwards-instructional-designer-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Kenneth Ward - Director Digital CX (large)
-- ============================================================================

-- Insert persona: Kenneth Ward
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '30eb6050-2f09-5f60-85c7-f4cb738dc263'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Kenneth Ward',
  'kenneth-ward-director-digital-cx-large-v4',
  '32-42',
  'Seattle, WA',
  'MBA',
  7,
  'senior',
  'large',
  7,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Kenneth Ward
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Commercial Analytics & Insights',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Commercial Analytics & Insights',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Kenneth Ward
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Commercial Analytics & Insights execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Kenneth Ward
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Kenneth Ward
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Digital CX',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Digital CX',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Director Digital CX',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Kenneth Ward
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Kenneth Ward
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Kenneth Ward (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Kenneth Ward
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Commercial Analytics & Insights requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'kenneth-ward-director-digital-cx-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Amy Cox - Remote Sales Manager (large)
-- ============================================================================

-- Insert persona: Amy Cox
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '1a630417-d098-5105-8c0e-5154f7befdd2'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Amy Cox',
  'amy-cox-remote-sales-manager-large-v4',
  '31-41',
  'Seattle, WA',
  'BS/MS',
  7,
  'senior',
  'large',
  12,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Amy Cox
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Sales Training & Enablement',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Sales Training & Enablement',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Amy Cox
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Sales Training & Enablement execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Amy Cox
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Amy Cox
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Remote Sales Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Remote Sales Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Remote Sales Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Amy Cox
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Amy Cox
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Amy Cox (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Amy Cox
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Sales Training & Enablement requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'amy-cox-remote-sales-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Melissa Richardson - Digital Engagement Specialist (large)
-- ============================================================================

-- Insert persona: Melissa Richardson
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '9e172a35-15c0-5d58-ac15-2c24c9ba39fa'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Melissa Richardson',
  'melissa-richardson-digital-engagement-specialist-large-v4',
  '30-40',
  'Seattle, WA',
  'Bachelor''s',
  9,
  'mid-level',
  'large',
  11,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Melissa Richardson
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Sales Training & Enablement',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Sales Training & Enablement',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Melissa Richardson
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Sales Training & Enablement execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Melissa Richardson
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Melissa Richardson
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Digital Engagement Specialist',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Digital Engagement Specialist',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Digital Engagement Specialist',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Melissa Richardson
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Melissa Richardson
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Melissa Richardson (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Melissa Richardson
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Sales Training & Enablement requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'melissa-richardson-digital-engagement-specialist-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Danielle Ross - Marketing Automation Manager (large)
-- ============================================================================

-- Insert persona: Danielle Ross
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '65dce927-0662-5013-90e8-ef4347916bc9'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Danielle Ross',
  'danielle-ross-marketing-automation-manager-large-v4',
  '31-41',
  'Seattle, WA',
  'MBA',
  3,
  'mid-level',
  'large',
  5,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Danielle Ross
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Sales Training & Enablement',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Sales Training & Enablement',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Danielle Ross
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Sales Training & Enablement execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Danielle Ross
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Danielle Ross
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Marketing Automation Manager',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Marketing Automation Manager',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for Marketing Automation Manager',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Danielle Ross
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Danielle Ross
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Danielle Ross (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Danielle Ross
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Sales Training & Enablement requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'danielle-ross-marketing-automation-manager-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Benjamin Howard - VP Commercial Compliance (large)
-- ============================================================================

-- Insert persona: Benjamin Howard
INSERT INTO personas (
  id, tenant_id, function_id, name, slug,
  age_range, location_type, education_level, years_of_experience, seniority_level,
  typical_organization_size, years_in_industry,
  created_at, updated_at
) VALUES (
  '20b49a53-469d-5102-8851-7e7bc59ec88f'::uuid,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  '598c6096-4894-458c-be34-c82e13a743e8'::uuid,
  'Benjamin Howard',
  'benjamin-howard-vp-commercial-compliance-large-v4',
  '36-46',
  'Seattle, WA',
  'MBA',
  13,
  'director',
  'large',
  13,
  NOW(),
  NOW()
) ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Goals for Benjamin Howard
INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic objective for Sales Training & Enablement',
  'primary',
  1,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational excellence in Sales Training & Enablement',
  'secondary',
  2,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Team development and capability building',
  'long_term',
  3,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

-- Pain Points for Benjamin Howard
INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Key challenge in Sales Training & Enablement execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Resource allocation and prioritization',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional alignment and collaboration',
  'strategic',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

-- Challenges for Benjamin Howard
INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Strategic planning and execution',
  'strategic',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Operational efficiency and innovation',
  'daily',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

-- Responsibilities for Benjamin Howard
INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Commercial Compliance',
  'key',
  30,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Commercial Compliance',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'Responsibility for VP Commercial Compliance',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

-- Tools for Benjamin Howard
INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Veeva CRM',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Salesforce',
  'weekly',
  'proficient',
  'neutral',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Analytics Platform',
  'daily',
  'expert',
  'satisfied',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

-- Internal Stakeholders for Benjamin Howard
INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Cross-functional teams',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)
SELECT p.id,
  'Executive leadership',
  'peer',
  'weekly',
  'good',
  'medium',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

-- Communication Preferences for Benjamin Howard (defaults)
INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'channel',
  'Email',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'meeting_style',
  'Efficient, agenda-driven',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)
SELECT p.id,
  'response_time',
  '24 hours for non-urgent',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;

-- Quote for Benjamin Howard
INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)
SELECT p.id,
  'Success in Sales Training & Enablement requires strategic vision and flawless execution',
  'Professional perspective',
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(), NOW()
FROM personas p WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AND p.slug = 'benjamin-howard-vp-commercial-compliance-large-v4'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT COUNT(*) as total_commercial_personas
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
  AND function_id = '598c6096-4894-458c-be34-c82e13a743e8'::uuid;