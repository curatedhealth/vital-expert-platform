-- ============================================================
-- Medical Affairs V5.0 Extension Tables Fix
-- Generated: 2025-11-17T10:46:27.577939
-- ============================================================

BEGIN;

-- First, get all Medical Affairs persona IDs
WITH medical_affairs_personas AS (
    SELECT id, name, slug
    FROM personas
    WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
    AND function_id = (SELECT id FROM org_functions WHERE slug = 'medical-affairs')
)


-- Week in Life for Persona 1
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['Executive team meeting', 'Strategic planning session', '1:1s with direct reports (3-4)', 'Budget review']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 1
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '6',
    1.5,
    ARRAY['Board preparation', 'Cross-functional leadership meetings', 'Regulatory affairs sync', 'External stakeholder calls']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 1
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['Medical affairs team all-hands', 'Clinical development review', 'Innovation pipeline review', 'Lunch with KOL']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 1
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '4',
    3.0,
    ARRAY['Industry conference (virtual or travel)', 'Keynote preparation', 'Publication review', 'Analyst briefing']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 1
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Week-in-review with leadership team', 'Strategic planning', 'Email/admin catch-up', 'Prep for next week']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 1
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    3.0,
    ARRAY['Literature review', 'Conference attendance (if applicable)', 'Strategic thinking time']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 1
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    2.0,
    ARRAY['Weekly planning', 'Reading industry reports', 'Prep for Monday meetings']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 1
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'CEO',
    'reports_to',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 1
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'CFO',
    'peer',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 1
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Chief Scientific Officer',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 2
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['Executive team meeting', 'Strategic planning session', '1:1s with direct reports (3-4)', 'Budget review']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 2
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '6',
    1.5,
    ARRAY['Board preparation', 'Cross-functional leadership meetings', 'Regulatory affairs sync', 'External stakeholder calls']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 2
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['Medical affairs team all-hands', 'Clinical development review', 'Innovation pipeline review', 'Lunch with KOL']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 2
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '4',
    3.0,
    ARRAY['Industry conference (virtual or travel)', 'Keynote preparation', 'Publication review', 'Analyst briefing']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 2
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Week-in-review with leadership team', 'Strategic planning', 'Email/admin catch-up', 'Prep for next week']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 2
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    3.0,
    ARRAY['Literature review', 'Conference attendance (if applicable)', 'Strategic thinking time']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 2
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    2.0,
    ARRAY['Weekly planning', 'Reading industry reports', 'Prep for Monday meetings']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 2
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'CEO',
    'reports_to',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 2
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'CFO',
    'peer',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 2
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Chief Scientific Officer',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 3
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 3
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 3
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 3
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 3
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 3
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 3
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 3
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 3
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 4
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['Executive team meeting', 'Strategic planning session', '1:1s with direct reports (3-4)', 'Budget review']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 4
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '6',
    1.5,
    ARRAY['Board preparation', 'Cross-functional leadership meetings', 'Regulatory affairs sync', 'External stakeholder calls']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 4
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['Medical affairs team all-hands', 'Clinical development review', 'Innovation pipeline review', 'Lunch with KOL']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 4
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '4',
    3.0,
    ARRAY['Industry conference (virtual or travel)', 'Keynote preparation', 'Publication review', 'Analyst briefing']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 4
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Week-in-review with leadership team', 'Strategic planning', 'Email/admin catch-up', 'Prep for next week']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 4
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    3.0,
    ARRAY['Literature review', 'Conference attendance (if applicable)', 'Strategic thinking time']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 4
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    2.0,
    ARRAY['Weekly planning', 'Reading industry reports', 'Prep for Monday meetings']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 4
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'CEO',
    'reports_to',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 4
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'CFO',
    'peer',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 4
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Chief Scientific Officer',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 5
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 5
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 5
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 5
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 5
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 5
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 5
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 5
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 5
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 6
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    3.0,
    ARRAY['Territory planning', 'CRM updates from previous week', 'Internal medical affairs call', 'Prep for field visits']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 6
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '4',
    1.0,
    ARRAY['Travel to territory', 'KOL visits (2-3)', 'Hospital rounds observation', 'Site investigator meeting']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 6
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['KOL visits (2-3)', 'Advisory board attendance', 'Clinical trial site visit', 'Documentation (hotel evening)']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 6
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '4',
    1.5,
    ARRAY['KOL visits (2-3)', 'Medical information response', 'Field team training', 'Evening documentation']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 6
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '2',
    4.0,
    ARRAY['Final KOL visit', 'Travel home', 'Insights synthesis', 'Expense reports', 'Week wrap-up call']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 6
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    0.0,
    ARRAY['Recovery', 'Conference attendance (quarterly)']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 6
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    2.0,
    ARRAY['Literature review', 'Conference prep', 'Next week planning']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 6
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 6
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 7
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    3.0,
    ARRAY['Territory planning', 'CRM updates from previous week', 'Internal medical affairs call', 'Prep for field visits']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 7
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '4',
    1.0,
    ARRAY['Travel to territory', 'KOL visits (2-3)', 'Hospital rounds observation', 'Site investigator meeting']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 7
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['KOL visits (2-3)', 'Advisory board attendance', 'Clinical trial site visit', 'Documentation (hotel evening)']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 7
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '4',
    1.5,
    ARRAY['KOL visits (2-3)', 'Medical information response', 'Field team training', 'Evening documentation']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 7
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '2',
    4.0,
    ARRAY['Final KOL visit', 'Travel home', 'Insights synthesis', 'Expense reports', 'Week wrap-up call']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 7
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    0.0,
    ARRAY['Recovery', 'Conference attendance (quarterly)']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 7
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    2.0,
    ARRAY['Literature review', 'Conference prep', 'Next week planning']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 7
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 7
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 8
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    3.0,
    ARRAY['Territory planning', 'CRM updates from previous week', 'Internal medical affairs call', 'Prep for field visits']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 8
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '4',
    1.0,
    ARRAY['Travel to territory', 'KOL visits (2-3)', 'Hospital rounds observation', 'Site investigator meeting']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 8
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['KOL visits (2-3)', 'Advisory board attendance', 'Clinical trial site visit', 'Documentation (hotel evening)']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 8
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '4',
    1.5,
    ARRAY['KOL visits (2-3)', 'Medical information response', 'Field team training', 'Evening documentation']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 8
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '2',
    4.0,
    ARRAY['Final KOL visit', 'Travel home', 'Insights synthesis', 'Expense reports', 'Week wrap-up call']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 8
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    0.0,
    ARRAY['Recovery', 'Conference attendance (quarterly)']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 8
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    2.0,
    ARRAY['Literature review', 'Conference prep', 'Next week planning']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 8
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 8
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 9
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    3.0,
    ARRAY['Territory planning', 'CRM updates from previous week', 'Internal medical affairs call', 'Prep for field visits']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 9
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '4',
    1.0,
    ARRAY['Travel to territory', 'KOL visits (2-3)', 'Hospital rounds observation', 'Site investigator meeting']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 9
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['KOL visits (2-3)', 'Advisory board attendance', 'Clinical trial site visit', 'Documentation (hotel evening)']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 9
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '4',
    1.5,
    ARRAY['KOL visits (2-3)', 'Medical information response', 'Field team training', 'Evening documentation']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 9
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '2',
    4.0,
    ARRAY['Final KOL visit', 'Travel home', 'Insights synthesis', 'Expense reports', 'Week wrap-up call']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 9
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    0.0,
    ARRAY['Recovery', 'Conference attendance (quarterly)']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 9
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    2.0,
    ARRAY['Literature review', 'Conference prep', 'Next week planning']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 9
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 9
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 10
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 10
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 10
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 10
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 10
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 10
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 10
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 10
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 10
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 11
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['Executive team meeting', 'Strategic planning session', '1:1s with direct reports (3-4)', 'Budget review']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 11
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '6',
    1.5,
    ARRAY['Board preparation', 'Cross-functional leadership meetings', 'Regulatory affairs sync', 'External stakeholder calls']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 11
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['Medical affairs team all-hands', 'Clinical development review', 'Innovation pipeline review', 'Lunch with KOL']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 11
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '4',
    3.0,
    ARRAY['Industry conference (virtual or travel)', 'Keynote preparation', 'Publication review', 'Analyst briefing']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 11
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Week-in-review with leadership team', 'Strategic planning', 'Email/admin catch-up', 'Prep for next week']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 11
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    3.0,
    ARRAY['Literature review', 'Conference attendance (if applicable)', 'Strategic thinking time']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 11
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    2.0,
    ARRAY['Weekly planning', 'Reading industry reports', 'Prep for Monday meetings']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 11
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'CEO',
    'reports_to',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 11
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'CFO',
    'peer',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 11
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Chief Scientific Officer',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 12
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 12
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 12
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 12
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 12
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 12
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 12
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 12
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 12
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 13
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 13
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 13
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 13
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 13
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 13
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 13
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 13
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 13
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 14
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 14
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 14
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 14
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 14
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 14
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 14
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 14
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 14
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 15
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 15
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 15
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 15
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 15
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 15
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 15
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 15
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 15
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 16
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 16
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 16
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 16
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 16
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 16
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 16
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 16
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 16
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 17
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 17
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 17
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 17
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 17
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 17
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 17
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 17
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 17
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 18
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 18
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 18
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 18
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 18
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 18
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 18
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 18
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 18
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 19
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 19
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 19
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 19
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 19
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 19
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 19
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 19
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 19
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 20
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 20
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 20
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 20
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 20
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 20
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 20
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 20
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 20
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 21
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 21
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 21
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 21
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 21
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 21
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 21
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 21
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 21
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 22
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 22
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 22
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 22
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 22
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 22
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 22
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 22
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 22
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 23
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    3.0,
    ARRAY['Territory planning', 'CRM updates from previous week', 'Internal medical affairs call', 'Prep for field visits']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 23
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '4',
    1.0,
    ARRAY['Travel to territory', 'KOL visits (2-3)', 'Hospital rounds observation', 'Site investigator meeting']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 23
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['KOL visits (2-3)', 'Advisory board attendance', 'Clinical trial site visit', 'Documentation (hotel evening)']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 23
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '4',
    1.5,
    ARRAY['KOL visits (2-3)', 'Medical information response', 'Field team training', 'Evening documentation']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 23
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '2',
    4.0,
    ARRAY['Final KOL visit', 'Travel home', 'Insights synthesis', 'Expense reports', 'Week wrap-up call']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 23
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    0.0,
    ARRAY['Recovery', 'Conference attendance (quarterly)']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 23
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    2.0,
    ARRAY['Literature review', 'Conference prep', 'Next week planning']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 23
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 23
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 24
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 24
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 24
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 24
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 24
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 24
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 24
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 24
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 24
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 25
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 25
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 25
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 25
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 25
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 25
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 25
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 25
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 25
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 26
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 26
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 26
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 26
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 26
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 26
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 26
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 26
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 26
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 27
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 27
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 27
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 27
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 27
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 27
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 27
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 27
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 27
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 28
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['Executive team meeting', 'Strategic planning session', '1:1s with direct reports (3-4)', 'Budget review']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 28
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '6',
    1.5,
    ARRAY['Board preparation', 'Cross-functional leadership meetings', 'Regulatory affairs sync', 'External stakeholder calls']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 28
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '5',
    2.0,
    ARRAY['Medical affairs team all-hands', 'Clinical development review', 'Innovation pipeline review', 'Lunch with KOL']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 28
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '4',
    3.0,
    ARRAY['Industry conference (virtual or travel)', 'Keynote preparation', 'Publication review', 'Analyst briefing']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 28
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Week-in-review with leadership team', 'Strategic planning', 'Email/admin catch-up', 'Prep for next week']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 28
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    3.0,
    ARRAY['Literature review', 'Conference attendance (if applicable)', 'Strategic thinking time']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 28
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    2.0,
    ARRAY['Weekly planning', 'Reading industry reports', 'Prep for Monday meetings']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 28
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'CEO',
    'reports_to',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 28
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'CFO',
    'peer',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 28
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Chief Scientific Officer',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 29
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 29
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 29
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 29
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 29
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 29
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 29
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 29
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 29
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 30
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 30
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 30
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 30
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 30
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 30
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 30
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 30
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 30
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 31
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Monday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 31
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Tuesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 31
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Wednesday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 31
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Thursday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 31
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Friday',
    '09:00'::time,
    '18:00'::time,
    '3',
    4.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 31
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Saturday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Week in Life for Persona 31
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Sunday',
    '09:00'::time,
    '18:00'::time,
    '0',
    1.0,
    ARRAY['Team meetings', 'Project work', 'Stakeholder engagement']::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 31
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Direct Manager',
    'reports_to',
    'weekly',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Internal Stakeholder for Persona 31
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    'Stakeholder',
    'Peer Team Members',
    'peer',
    'daily',
    'medium',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = ''
ON CONFLICT DO NOTHING;


-- Validate extension data
SELECT
    'Week in Life' as table_name,
    COUNT(*) as records
FROM persona_week_in_life
WHERE tenant_id = '{self.config.tenant_id}'
UNION ALL
SELECT
    'Internal Stakeholders',
    COUNT(*)
FROM persona_internal_stakeholders
WHERE tenant_id = '{self.config.tenant_id}';

COMMIT;
