#!/usr/bin/env python3
"""
MSL Personas Transformation Script - Phase 1 (Schema-Aligned)
Matches actual Supabase schema structure
"""
import json
from datetime import datetime
from pathlib import Path

# Configuration
TENANT_ID = "f7aa6fd4-0af9-4706-8b31-034f1f7accda"
JSON_FILE = "/Users/hichamnaim/Downloads/MEDICAL_AFFAIRS_MSL_PERSONAS_PHASE1 (1).json"
OUTPUT_SQL = "DEPLOY_MSL_PHASE1_V2.sql"

# Load JSON data
with open(JSON_FILE) as f:
    data = json.load(f)

personas = data['personas']

def escape_sql(value):
    """Escape value for SQL"""
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        if not value:
            return "ARRAY[]::TEXT[]"
        escaped = [f"'{str(v).replace(chr(39), chr(39)+chr(39))}'" for v in value]
        return f"ARRAY[{', '.join(escaped)}]"
    escaped = str(value).replace("'", "''")
    return f"'{escaped}'"

def convert_priority(priority_value):
    """Convert priority string to integer"""
    if isinstance(priority_value, int):
        return priority_value
    priority_map = {'high': 1, 'medium': 2, 'low': 3}
    return priority_map.get(str(priority_value).lower(), 2)

# Generate SQL
sql = f"""-- MSL Personas Phase 1 - Deployment (Schema-Aligned)
-- Generated: {datetime.now().isoformat()}
-- Source: MEDICAL_AFFAIRS_MSL_PERSONAS_PHASE1 (1).json
-- Personas: {len(personas)}

BEGIN;

"""

print(f"Processing {len(personas)} MSL personas...")

for idx, persona in enumerate(personas, 1):
    name = persona.get('name', f'Persona {idx}')
    slug = persona.get('slug', name.lower().replace(' ', '-').replace('.', ''))
    title = persona.get('title', 'Professional')

    core = persona.get('core_profile', {})
    prof = persona.get('professional_context', {})
    exp = persona.get('experience', {})
    work = persona.get('work_context', {})

    print(f"{idx}. {name} - {title}")

    # Insert or update main persona record
    sql += f"""
-- ========================================
-- Persona {idx}: {name}
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona (all fields in personas table)
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
        '{TENANT_ID}'::uuid,
        {escape_sql(name)},
        {escape_sql(slug)},
        {escape_sql(title)},
        {escape_sql(core.get('seniority_level', 'senior'))},
        {escape_sql(core.get('years_of_experience', exp.get('years_in_industry')))},
        {escape_sql(exp.get('years_in_current_role'))},
        {escape_sql(exp.get('years_in_industry'))},
        {escape_sql(core.get('age_range'))},
        {escape_sql(core.get('education_level'))},
        {escape_sql(prof.get('reports_to'))},
        {escape_sql(prof.get('team_size'))},
        {escape_sql(prof.get('budget_responsibility'))},
        {escape_sql(core.get('location'))},
        {escape_sql(work.get('work_arrangement'))},
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

    -- Clean up old related data for this persona (for re-deployment)
    DELETE FROM persona_goals WHERE persona_id = v_persona_id;
    DELETE FROM persona_pain_points WHERE persona_id = v_persona_id;
    DELETE FROM persona_challenges WHERE persona_id = v_persona_id;
    DELETE FROM persona_responsibilities WHERE persona_id = v_persona_id;
    DELETE FROM persona_tools WHERE persona_id = v_persona_id;
    DELETE FROM persona_internal_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_external_stakeholders WHERE persona_id = v_persona_id;
    DELETE FROM persona_communication_preferences WHERE persona_id = v_persona_id;

"""

    # Goals
    for g_idx, goal in enumerate(persona.get('goals', []), 1):
        priority = convert_priority(goal.get('priority', g_idx))
        sql += f"""
    -- Goal {g_idx}
    INSERT INTO persona_goals (
        id, persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(goal.get('goal'))},
        'professional',
        {escape_sql(goal.get('timeframe', 'medium_term'))},
        {priority},
        {g_idx}
    );

"""

    # Pain Points (map 'pain' to 'pain_point')
    for p_idx, pain in enumerate(persona.get('pain_points', []), 1):
        pain_text = pain.get('pain', pain.get('pain_point', 'Pain point'))

        sql += f"""
    -- Pain Point {p_idx}
    INSERT INTO persona_pain_points (
        id, persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(pain_text)},
        'operational',
        {escape_sql(pain.get('severity', 'medium'))},
        {escape_sql(pain.get('frequency', 'weekly'))},
        {p_idx}
    );

"""

    # Challenges
    for c_idx, challenge in enumerate(persona.get('challenges', []), 1):
        challenge_text = challenge.get('challenge', challenge.get('description', 'Challenge'))

        sql += f"""
    -- Challenge {c_idx}
    INSERT INTO persona_challenges (
        id, persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(challenge_text)},
        'operational',
        {escape_sql(challenge.get('impact', 'medium'))},
        {c_idx}
    );

"""

    # Responsibilities (map 'task' to 'responsibility' and 'allocation' to 'time_allocation')
    for r_idx, resp in enumerate(persona.get('responsibilities', []), 1):
        resp_text = resp.get('task', resp.get('responsibility', 'Responsibility'))
        time_alloc = resp.get('allocation', resp.get('time_allocation'))

        sql += f"""
    -- Responsibility {r_idx}
    INSERT INTO persona_responsibilities (
        id, persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(resp_text)},
        {escape_sql(time_alloc)},
        {r_idx}
    );

"""

    # Tools (map 'usage' to 'usage_frequency')
    for t_idx, tool in enumerate(persona.get('tools', []), 1):
        tool_name = tool.get('tool', tool.get('name', 'Tool'))
        usage_freq = tool.get('usage', tool.get('usage_frequency', 'weekly'))

        sql += f"""
    -- Tool {t_idx}
    INSERT INTO persona_tools (
        id, persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(tool_name)},
        {escape_sql(usage_freq)},
        {escape_sql(tool.get('proficiency', 'intermediate'))},
        {escape_sql(tool.get('purpose', ''))},
        {t_idx}
    );

"""

    # Internal Stakeholders (map 'role' to 'stakeholder_role')
    for s_idx, stakeholder in enumerate(persona.get('internal_stakeholders', []), 1):
        stake_role = stakeholder.get('role', stakeholder.get('stakeholder_role', 'Stakeholder'))

        sql += f"""
    -- Internal Stakeholder {s_idx}
    INSERT INTO persona_internal_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(stake_role)},
        {escape_sql(stakeholder.get('interaction_frequency', 'weekly'))},
        {s_idx}
    );

"""

    # External Stakeholders
    for s_idx, stakeholder in enumerate(persona.get('external_stakeholders', []), 1):
        stake_role = stakeholder.get('role', stakeholder.get('stakeholder_role', 'Stakeholder'))

        sql += f"""
    -- External Stakeholder {s_idx}
    INSERT INTO persona_external_stakeholders (
        id, persona_id, tenant_id,
        stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(stake_role)},
        {escape_sql(stakeholder.get('interaction_frequency', 'weekly'))},
        {s_idx}
    );

"""

    # Communication Preferences (handle as dict)
    comm_prefs = persona.get('communication_preferences', {})
    if comm_prefs and isinstance(comm_prefs, dict):
        cp_idx = 1
        for pref_type, pref_value in comm_prefs.items():
            sql += f"""
    -- Communication Preference: {pref_type}
    INSERT INTO persona_communication_preferences (
        id, persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        gen_random_uuid(), v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(pref_type)},
        {escape_sql(pref_value)},
        {cp_idx}
    );

"""
            cp_idx += 1

    sql += "END $$;\n\n"

sql += """
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
    COUNT(DISTINCT is.id) + COUNT(DISTINCT es.id) as stakeholders
FROM personas p
LEFT JOIN persona_goals g ON g.persona_id = p.id
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
LEFT JOIN persona_challenges ch ON ch.persona_id = p.id
LEFT JOIN persona_responsibilities r ON r.persona_id = p.id
LEFT JOIN persona_tools t ON t.persona_id = p.id
LEFT JOIN persona_internal_stakeholders is ON is.persona_id = p.id
LEFT JOIN persona_external_stakeholders es ON es.persona_id = p.id
WHERE p.slug LIKE '%msl%'
  AND p.deleted_at IS NULL
GROUP BY p.id, p.name, p.title, p.slug, p.seniority_level
ORDER BY p.created_at DESC
LIMIT 10;
"""

# Write SQL file
output_path = Path(OUTPUT_SQL)
with open(output_path, 'w') as f:
    f.write(sql)

print(f"\n✅ Generated: {OUTPUT_SQL}")
print(f"📊 {len(personas)} MSL personas processed")
print(f"\nPersonas included:")
for idx, persona in enumerate(personas, 1):
    print(f"  {idx}. {persona.get('name')} - {persona.get('title')}")

print(f"\n🚀 Next steps:")
print(f"1. Review: {OUTPUT_SQL}")
print(f"2. Deploy:")
print(f'   cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/00_PREPARATION"')
print(f'   psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres" -f {OUTPUT_SQL}')
