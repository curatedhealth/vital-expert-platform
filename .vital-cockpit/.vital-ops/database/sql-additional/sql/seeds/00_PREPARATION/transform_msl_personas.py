#!/usr/bin/env python3
"""
MSL Personas Transformation Script - Phase 1
Handles field name mappings and comprehensive persona data deployment
"""
import json
from datetime import datetime
from pathlib import Path

# Configuration
TENANT_ID = "f7aa6fd4-0af9-4706-8b31-034f1f7accda"
JSON_FILE = "/Users/hichamnaim/Downloads/MEDICAL_AFFAIRS_MSL_PERSONAS_PHASE1 (1).json"
OUTPUT_SQL = "DEPLOY_MSL_PHASE1.sql"

# Load configurations
with open('DEFAULT_VALUES.json') as f:
    DEFAULT_VALUES = json.load(f)

with open('VALUE_MAPPINGS.json') as f:
    VALUE_MAPPINGS = json.load(f)

# Load JSON data
with open(JSON_FILE) as f:
    data = json.load(f)

personas = data['personas']

# Field name mappings (JSON → Database)
FIELD_MAPPINGS = {
    'pain_points': {
        'pain': 'pain_point'
    },
    'responsibilities': {
        'task': 'responsibility',
        'allocation': 'time_allocation'
    },
    'stakeholders': {
        'role': 'stakeholder_role'
    },
    'tools': {
        'usage': 'usage_frequency'
    }
}

def map_field_names(section, record):
    """Map JSON field names to database field names"""
    if section not in FIELD_MAPPINGS:
        return record

    mapped = record.copy()
    for json_field, db_field in FIELD_MAPPINGS[section].items():
        if json_field in mapped:
            mapped[db_field] = mapped.pop(json_field)
    return mapped

def apply_value_mapping(table, column, value):
    """Apply value mappings for enum conversions"""
    if table in VALUE_MAPPINGS and column in VALUE_MAPPINGS[table]:
        mappings = VALUE_MAPPINGS[table][column]
        str_value = str(value)
        return mappings.get(str_value, value)
    return value

def apply_defaults(table, record):
    """Apply default values for missing required fields"""
    if table in DEFAULT_VALUES:
        for column, default in DEFAULT_VALUES[table].items():
            if column not in record or record[column] is None:
                record[column] = default
    return record

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
    priority_map = {
        'high': 1,
        'medium': 2,
        'low': 3
    }
    return priority_map.get(str(priority_value).lower(), 2)

def convert_achievement_rate(rate):
    """Convert achievement rate to decimal (0-1)"""
    if isinstance(rate, (int, float)) and rate > 1:
        return rate / 100.0
    return rate

# Generate SQL
sql = f"""-- MSL Personas Phase 1 - Deployment
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

    print(f"{idx}. {name} - {title}")

    # Insert or update base persona
    sql += f"""
-- ========================================
-- Persona {idx}: {name}
-- ========================================

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert or update persona
    INSERT INTO personas (
        id, tenant_id, name, slug, title,
        function_slug, department_slug, seniority_level,
        industry_context, persona_type, is_primary, status
    ) VALUES (
        gen_random_uuid(),
        '{TENANT_ID}'::uuid,
        {escape_sql(name)},
        {escape_sql(slug)},
        {escape_sql(title)},
        'medical-affairs',
        'field-medical',
        {escape_sql(persona.get('seniority_level', 'senior'))},
        'pharmaceutical',
        'job_role',
        TRUE,
        'active'
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE
    SET name = EXCLUDED.name,
        title = EXCLUDED.title,
        seniority_level = EXCLUDED.seniority_level,
        updated_at = NOW()
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Persona ID: %', v_persona_id;

"""

    # Core Profile
    profile = persona.get('core_profile', {})
    if profile:
        sql += f"""
    -- Core Profile
    INSERT INTO persona_core_profile (
        persona_id, tenant_id,
        age_range, location, education_level
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(profile.get('age_range'))},
        {escape_sql(profile.get('location'))},
        {escape_sql(profile.get('education'))}
    ) ON CONFLICT (persona_id) DO UPDATE
    SET age_range = EXCLUDED.age_range,
        location = EXCLUDED.location,
        education_level = EXCLUDED.education_level;

"""

    # Professional Context
    context = persona.get('professional_context', {})
    if context:
        sql += f"""
    -- Professional Context
    INSERT INTO persona_professional_context (
        persona_id, tenant_id,
        current_role, department, reports_to,
        team_size, direct_reports, budget_responsibility
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(context.get('role', title))},
        {escape_sql(context.get('department', 'Field Medical'))},
        {escape_sql(context.get('reports_to'))},
        {escape_sql(context.get('team_size'))},
        {escape_sql(context.get('direct_reports'))},
        {escape_sql(context.get('budget_responsibility'))}
    ) ON CONFLICT (persona_id) DO UPDATE
    SET current_role = EXCLUDED.current_role,
        department = EXCLUDED.department;

"""

    # Experience
    experience = persona.get('experience', {})
    if experience:
        sql += f"""
    -- Experience
    INSERT INTO persona_experience (
        persona_id, tenant_id,
        years_in_role, years_in_function, years_in_industry
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(experience.get('in_role'))},
        {escape_sql(experience.get('in_function'))},
        {escape_sql(experience.get('in_industry'))}
    ) ON CONFLICT (persona_id) DO UPDATE
    SET years_in_role = EXCLUDED.years_in_role,
        years_in_function = EXCLUDED.years_in_function,
        years_in_industry = EXCLUDED.years_in_industry;

"""

    # Work Context
    work = persona.get('work_context', {})
    if work:
        sql += f"""
    -- Work Context
    INSERT INTO persona_work_context (
        persona_id, tenant_id,
        work_arrangement, travel_frequency
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(work.get('arrangement'))},
        {escape_sql(work.get('travel'))}
    ) ON CONFLICT (persona_id) DO UPDATE
    SET work_arrangement = EXCLUDED.work_arrangement,
        travel_frequency = EXCLUDED.travel_frequency;

"""

    # Goals
    for g_idx, goal in enumerate(persona.get('goals', []), 1):
        priority = convert_priority(goal.get('priority', g_idx))
        sql += f"""
    -- Goal {g_idx}
    INSERT INTO persona_goals (
        persona_id, tenant_id,
        goal_text, goal_category, timeframe, priority, sequence_order
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(goal.get('goal'))},
        {escape_sql(goal.get('category', 'professional'))},
        {escape_sql(goal.get('timeframe', 'medium_term'))},
        {priority},
        {g_idx}
    );

"""

    # Pain Points (with field mapping)
    for p_idx, pain in enumerate(persona.get('pain_points', []), 1):
        mapped_pain = map_field_names('pain_points', pain)
        pain_text = mapped_pain.get('pain_point', 'Pain point')
        category = apply_value_mapping('persona_pain_points', 'pain_category',
                                      mapped_pain.get('category', 'operational'))

        sql += f"""
    -- Pain Point {p_idx}
    INSERT INTO persona_pain_points (
        persona_id, tenant_id,
        pain_point, pain_category, severity_level, frequency, sequence_order
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(pain_text)},
        {escape_sql(category)},
        {escape_sql(mapped_pain.get('severity', 'medium'))},
        {escape_sql(mapped_pain.get('frequency', 'weekly'))},
        {p_idx}
    );

"""

    # Challenges
    for c_idx, challenge in enumerate(persona.get('challenges', []), 1):
        sql += f"""
    -- Challenge {c_idx}
    INSERT INTO persona_challenges (
        persona_id, tenant_id,
        challenge_text, challenge_type, impact_level, sequence_order
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(challenge.get('challenge', 'Challenge'))},
        {escape_sql(challenge.get('type', 'operational'))},
        {escape_sql(challenge.get('impact', 'medium'))},
        {c_idx}
    );

"""

    # Responsibilities (with field mapping)
    for r_idx, resp in enumerate(persona.get('responsibilities', []), 1):
        mapped_resp = map_field_names('responsibilities', resp)

        sql += f"""
    -- Responsibility {r_idx}
    INSERT INTO persona_responsibilities (
        persona_id, tenant_id,
        responsibility, time_allocation, sequence_order
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(mapped_resp.get('responsibility', 'Responsibility'))},
        {escape_sql(mapped_resp.get('time_allocation'))},
        {r_idx}
    );

"""

    # Tools (with field mapping)
    for t_idx, tool in enumerate(persona.get('tools', []), 1):
        mapped_tool = map_field_names('tools', tool)

        sql += f"""
    -- Tool {t_idx}
    INSERT INTO persona_tools (
        persona_id, tenant_id,
        tool_name, usage_frequency, proficiency_level, purpose, sequence_order
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(tool.get('tool', 'Tool'))},
        {escape_sql(mapped_tool.get('usage_frequency', 'weekly'))},
        {escape_sql(tool.get('proficiency', 'intermediate'))},
        {escape_sql(tool.get('purpose', ''))},
        {t_idx}
    );

"""

    # Internal Stakeholders (with field mapping)
    for s_idx, stakeholder in enumerate(persona.get('internal_stakeholders', []), 1):
        mapped_stake = map_field_names('stakeholders', stakeholder)

        sql += f"""
    -- Internal Stakeholder {s_idx}
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        'internal',
        {escape_sql(mapped_stake.get('stakeholder_role', 'Stakeholder'))},
        {escape_sql(stakeholder.get('interaction_frequency', 'weekly'))},
        {s_idx}
    );

"""

    # External Stakeholders (with field mapping)
    for s_idx, stakeholder in enumerate(persona.get('external_stakeholders', []), 1):
        mapped_stake = map_field_names('stakeholders', stakeholder)

        sql += f"""
    -- External Stakeholder {s_idx}
    INSERT INTO persona_stakeholders (
        persona_id, tenant_id,
        stakeholder_type, stakeholder_role, interaction_frequency, sequence_order
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        'external',
        {escape_sql(mapped_stake.get('stakeholder_role', 'Stakeholder'))},
        {escape_sql(stakeholder.get('interaction_frequency', 'weekly'))},
        {s_idx}
    );

"""

    # Communication Preferences
    comm_prefs = persona.get('communication_preferences', {})
    if comm_prefs and isinstance(comm_prefs, dict):
        cp_idx = 1
        for pref_type, pref_value in comm_prefs.items():
            sql += f"""
    -- Communication Preference: {pref_type}
    INSERT INTO persona_communication_preferences (
        persona_id, tenant_id,
        preference_type, preference_value, sequence_order
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(pref_type)},
        {escape_sql(pref_value)},
        {cp_idx}
    );

"""
            cp_idx += 1

    # Evidence Summary (with defaults)
    if 'evidence_summary' in persona:
        es = persona['evidence_summary'].copy()
        es = apply_defaults('persona_evidence_summary', es)

        sql += f"""
    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(es.get('total_sources'))},
        {escape_sql(es.get('case_studies_count'))},
        {escape_sql(es.get('statistics_count'))},
        {escape_sql(es.get('overall_confidence_level'))},
        {escape_sql(es.get('evidence_quality_score'))},
        {escape_sql(es.get('evidence_recency_score'))}
    ) ON CONFLICT (persona_id) DO UPDATE
    SET total_sources = EXCLUDED.total_sources,
        updated_at = NOW();

"""

    # Case Studies (with defaults)
    for cs in persona.get('case_studies', []):
        cs_data = cs.copy()
        cs_data = apply_defaults('persona_case_studies', cs_data)

        sql += f"""
    -- Case Study
    INSERT INTO persona_case_studies (
        persona_id, tenant_id,
        case_study_title, challenge_addressed, solution_implemented,
        outcomes_achieved, relevance_to_persona, relevance_score
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(cs.get('title', 'Case Study'))},
        {escape_sql(cs.get('challenge', 'Challenge'))},
        {escape_sql(cs.get('solution', 'Solution'))},
        {escape_sql(cs.get('outcomes', []))},
        {escape_sql(cs.get('relevance', 'Relevant'))},
        {escape_sql(cs_data.get('relevance_score', 8))}
    );

"""

    # Monthly Objectives (with achievement rate conversion)
    for obj in persona.get('monthly_objectives', []):
        achievement_rate = convert_achievement_rate(obj.get('achievement_rate', 0))

        sql += f"""
    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(obj.get('objective', 'Objective'))},
        {escape_sql(obj.get('metric', ''))},
        {achievement_rate}
    );

"""

    # Week in Life
    for day_idx, day in enumerate(persona.get('week_in_life', []), 1):
        sql += f"""
    -- Week in Life - Day {day_idx}
    INSERT INTO persona_week_in_life (
        persona_id, tenant_id,
        day_of_week, morning_routine, afternoon_routine, evening_routine,
        key_activities, meeting_load, energy_pattern, sequence_order
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(day.get('day', 'Monday'))},
        {escape_sql(day.get('morning', ''))},
        {escape_sql(day.get('afternoon', ''))},
        {escape_sql(day.get('evening', ''))},
        {escape_sql(day.get('activities', []))},
        {escape_sql(day.get('meetings', 'moderate'))},
        {escape_sql(day.get('energy', 'medium'))},
        {day_idx}
    );

"""

    # Annual Conferences
    for conf_idx, conf in enumerate(persona.get('annual_conferences', []), 1):
        sql += f"""
    -- Conference {conf_idx}
    INSERT INTO persona_annual_conferences (
        persona_id, tenant_id,
        conference_name, role_at_conference, sequence_order
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(conf.get('name', 'Conference'))},
        {escape_sql(conf.get('role', 'Attendee'))},
        {conf_idx}
    );

"""

    # Quotes
    for q_idx, quote in enumerate(persona.get('quotes', []), 1):
        sql += f"""
    -- Quote {q_idx}
    INSERT INTO persona_quotes (
        persona_id, tenant_id,
        quote_text, context, sequence_order
    ) VALUES (
        v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(quote.get('quote', ''))},
        {escape_sql(quote.get('context', ''))},
        {q_idx}
    );

"""

    sql += "END $$;\n\n"

sql += """
COMMIT;

-- Verification
SELECT
    p.name,
    p.title,
    p.slug,
    COUNT(DISTINCT g.id) as goals,
    COUNT(DISTINCT pp.id) as pain_points,
    COUNT(DISTINCT ch.id) as challenges,
    COUNT(DISTINCT r.id) as responsibilities
FROM personas p
LEFT JOIN persona_goals g ON g.persona_id = p.id
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
LEFT JOIN persona_challenges ch ON ch.persona_id = p.id
LEFT JOIN persona_responsibilities r ON r.persona_id = p.id
WHERE p.slug LIKE '%msl%'
GROUP BY p.id, p.name, p.title, p.slug
ORDER BY p.created_at DESC
LIMIT 5;
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
print(f'   psql "$DATABASE_URL" -f {OUTPUT_SQL}')
