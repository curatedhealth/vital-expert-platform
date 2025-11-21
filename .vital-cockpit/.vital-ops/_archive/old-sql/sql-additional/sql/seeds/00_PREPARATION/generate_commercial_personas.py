#!/usr/bin/env python3
"""
Generate SQL to load Commercial Organization personas and junction tables from JSON
"""

import json
import uuid
from datetime import datetime

# Constants
TENANT_ID = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
COMMERCIAL_FUNCTION_ID = '598c6096-4894-458c-be34-c82e13a743e8'

# JSON file path
JSON_FILE = '/Users/hichamnaim/Downloads/COMMERCIAL_ORG_224_PERSONAS_3_5_PER_ROLE.json'
OUTPUT_FILE = '/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/00_PREPARATION/LOAD_COMMERCIAL_224_PERSONAS.sql'

# Column mappings based on actual database schema
GOAL_TYPE_MAP = {'strategic': 'primary', 'operational': 'secondary', 'team': 'long_term'}
PAIN_CATEGORY_MAP = {'execution': 'operational', 'planning': 'strategic', 'technology': 'technology', 'collaboration': 'interpersonal'}
CHALLENGE_TYPE_MAP = {'strategic': 'strategic', 'operational': 'daily', 'innovation': 'weekly', 'external': 'external'}
IMPACT_LEVEL_MAP = {'high': 'high', 'medium': 'medium', 'low': 'low'}
RESPONSIBILITY_TYPE_MAP = {'primary': 'key', 'secondary': 'daily', 'tertiary': 'weekly'}
PROFICIENCY_MAP = {'advanced': 'expert', 'intermediate': 'proficient', 'basic': 'competent', 'beginner': 'beginner'}
SATISFACTION_MAP = {'high': 'satisfied', 'medium': 'neutral', 'low': 'dissatisfied'}
FREQUENCY_MAP = {'daily': 'daily', 'weekly': 'weekly', 'monthly': 'monthly', 'bi_weekly': 'bi_weekly'}
QUALITY_MAP = {'excellent': 'excellent', 'good': 'good', 'neutral': 'neutral', 'poor': 'poor'}
INFLUENCE_MAP = {'very_high': 'very_high', 'high': 'high', 'medium': 'medium', 'low': 'low'}
RELATIONSHIP_TYPE_MAP = {'cross-functional': 'cross_functional', 'executive': 'executive', 'reporting': 'reports_to', 'peer': 'peer'}

def sql_escape(text):
    """Escape single quotes for SQL"""
    if text is None:
        return ''
    return str(text).replace("'", "''")

def map_goal_type(timeframe):
    """Map timeframe to goal_type"""
    if '12' in str(timeframe):
        return 'primary'
    elif '18' in str(timeframe):
        return 'secondary'
    else:
        return 'long_term'

def map_pain_category(pain_text):
    """Map pain point text to category"""
    pain_lower = pain_text.lower()
    if 'resource' in pain_lower or 'execution' in pain_lower:
        return 'operational'
    elif 'strategic' in pain_lower or 'planning' in pain_lower:
        return 'strategic'
    elif 'tool' in pain_lower or 'technology' in pain_lower or 'system' in pain_lower:
        return 'technology'
    else:
        return 'interpersonal'

def map_challenge_type(challenge_text):
    """Map challenge text to type"""
    challenge_lower = challenge_text.lower()
    if 'strategic' in challenge_lower or 'planning' in challenge_lower:
        return 'strategic'
    elif 'daily' in challenge_lower or 'operational' in challenge_lower:
        return 'daily'
    elif 'innovation' in challenge_lower:
        return 'weekly'
    else:
        return 'external'

def map_relationship_type(role_text):
    """Map stakeholder role to relationship type"""
    role_lower = role_text.lower()
    if 'executive' in role_lower or 'leadership' in role_lower or 'ceo' in role_lower:
        return 'executive'
    elif 'team' in role_lower or 'cross-functional' in role_lower:
        return 'cross_functional'
    elif 'report' in role_lower:
        return 'reports_to'
    else:
        return 'peer'

def main():
    print("Loading JSON file...")
    with open(JSON_FILE, 'r') as f:
        data = json.load(f)

    personas = data['personas']
    print(f"Found {len(personas)} personas")

    sql_lines = []

    # Header
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- LOAD COMMERCIAL ORGANIZATION PERSONAS AND JUNCTION TABLES")
    sql_lines.append("-- ============================================================================")
    sql_lines.append(f"-- Date: {datetime.now().strftime('%Y-%m-%d')}")
    sql_lines.append(f"-- Total Personas: {len(personas)}")
    sql_lines.append("-- Source: COMMERCIAL_ORG_224_PERSONAS_3_5_PER_ROLE.json")
    sql_lines.append("-- ============================================================================\n")

    sql_lines.append(f"\\set tenant_id '{TENANT_ID}'")
    sql_lines.append(f"\\set function_id '{COMMERCIAL_FUNCTION_ID}'\n")

    # Track statistics
    stats = {
        'personas': 0,
        'goals': 0,
        'pain_points': 0,
        'challenges': 0,
        'responsibilities': 0,
        'tools': 0,
        'stakeholders': 0,
        'comm_prefs': 0,
        'quotes': 0
    }

    # Process each persona
    for idx, persona in enumerate(personas, 1):
        slug = persona['slug']
        name = persona['name']

        print(f"Processing {idx}/{len(personas)}: {name} ({slug})")

        # Core profile
        core = persona['core_profile']
        prof_context = persona['professional_context']
        experience = persona['experience']
        work_context = persona['work_context']
        metadata = persona.get('metadata', {})

        # Generate persona ID (consistent UUID from slug)
        persona_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, slug))

        sql_lines.append(f"\n-- ============================================================================")
        sql_lines.append(f"-- Persona {idx}: {name} ({slug})")
        sql_lines.append(f"-- ============================================================================\n")

        # Insert persona (using correct schema columns)
        sql_lines.append(f"-- Insert persona: {name}")
        sql_lines.append("INSERT INTO personas (")
        sql_lines.append("  id, tenant_id, function_id, name, slug,")
        sql_lines.append("  age_range, location_type, education_level, years_of_experience, seniority_level,")
        sql_lines.append("  typical_organization_size, work_arrangement, years_in_industry,")
        sql_lines.append("  created_at, updated_at")
        sql_lines.append(") VALUES (")
        sql_lines.append(f"  '{persona_id}'::uuid,")
        sql_lines.append(f"  :'tenant_id'::uuid,")
        sql_lines.append(f"  :'function_id'::uuid,")
        sql_lines.append(f"  '{sql_escape(name)}',")
        sql_lines.append(f"  '{sql_escape(slug)}',")
        sql_lines.append(f"  '{sql_escape(core.get('age_range', '30-40'))}',")
        sql_lines.append(f"  '{sql_escape(core.get('location_type', core.get('location', 'United States')))}',")  # Fixed: use location_type or location
        sql_lines.append(f"  '{sql_escape(core.get('education_level', 'Bachelor'))}',")
        sql_lines.append(f"  {core.get('years_of_experience', 10)},")
        sql_lines.append(f"  '{sql_escape(core.get('seniority_level', 'manager'))}',")
        sql_lines.append(f"  '{sql_escape(core.get('typical_organization_size', core.get('company_size', 'large')))}',")  # Fixed: use typical_organization_size or company_size
        sql_lines.append(f"  '{sql_escape(work_context.get('work_arrangement', 'hybrid'))}',")
        sql_lines.append(f"  {experience.get('years_in_industry', core.get('years_of_experience', 10))},")
        sql_lines.append(f"  NOW(),")
        sql_lines.append(f"  NOW()")
        sql_lines.append(") ON CONFLICT (slug, tenant_id) DO NOTHING;\n")
        stats['personas'] += 1

        # Insert goals
        if 'goals' in persona and persona['goals']:
            sql_lines.append(f"-- Goals for {name}")
            for seq, goal in enumerate(persona['goals'], 1):
                goal_type = map_goal_type(goal.get('timeframe', '12_months'))
                priority = goal.get('priority', seq)
                sql_lines.append("INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)")
                sql_lines.append("SELECT")
                sql_lines.append(f"  p.id,")
                sql_lines.append(f"  '{sql_escape(goal['goal'])}',")
                sql_lines.append(f"  '{goal_type}',")
                sql_lines.append(f"  {priority},")
                sql_lines.append(f"  {seq},")
                sql_lines.append(f"  :'tenant_id'::uuid,")
                sql_lines.append(f"  NOW(),")
                sql_lines.append(f"  NOW()")
                sql_lines.append(f"FROM personas p")
                sql_lines.append(f"WHERE p.tenant_id = :'tenant_id'::uuid AND p.slug = '{sql_escape(slug)}'")
                sql_lines.append(f"ON CONFLICT DO NOTHING;\n")
                stats['goals'] += 1

        # Insert pain points
        if 'pain_points' in persona and persona['pain_points']:
            sql_lines.append(f"-- Pain points for {name}")
            for seq, pain in enumerate(persona['pain_points'], 1):
                pain_category = map_pain_category(pain['pain'])
                severity = pain.get('severity', 'medium')
                sql_lines.append("INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, tenant_id, created_at, updated_at)")
                sql_lines.append("SELECT")
                sql_lines.append(f"  p.id,")
                sql_lines.append(f"  '{sql_escape(pain['pain'])}',")
                sql_lines.append(f"  '{pain_category}',")
                sql_lines.append(f"  '{severity}',")
                sql_lines.append(f"  :'tenant_id'::uuid,")
                sql_lines.append(f"  NOW(),")
                sql_lines.append(f"  NOW()")
                sql_lines.append(f"FROM personas p")
                sql_lines.append(f"WHERE p.tenant_id = :'tenant_id'::uuid AND p.slug = '{sql_escape(slug)}'")
                sql_lines.append(f"ON CONFLICT DO NOTHING;\n")
                stats['pain_points'] += 1

        # Insert challenges
        if 'challenges' in persona and persona['challenges']:
            sql_lines.append(f"-- Challenges for {name}")
            for seq, challenge in enumerate(persona['challenges'], 1):
                challenge_type = map_challenge_type(challenge['challenge'])
                impact = challenge.get('impact', 'medium')
                sql_lines.append("INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, tenant_id, created_at, updated_at)")
                sql_lines.append("SELECT")
                sql_lines.append(f"  p.id,")
                sql_lines.append(f"  '{sql_escape(challenge['challenge'])}',")
                sql_lines.append(f"  '{challenge_type}',")
                sql_lines.append(f"  '{impact}',")
                sql_lines.append(f"  :'tenant_id'::uuid,")
                sql_lines.append(f"  NOW(),")
                sql_lines.append(f"  NOW()")
                sql_lines.append(f"FROM personas p")
                sql_lines.append(f"WHERE p.tenant_id = :'tenant_id'::uuid AND p.slug = '{sql_escape(slug)}'")
                sql_lines.append(f"ON CONFLICT DO NOTHING;\n")
                stats['challenges'] += 1

        # Insert responsibilities
        if 'responsibilities' in persona and persona['responsibilities']:
            sql_lines.append(f"-- Responsibilities for {name}")
            for seq, resp in enumerate(persona['responsibilities'], 1):
                resp_type = 'key' if seq == 1 else ('daily' if seq == 2 else 'weekly')
                allocation = resp.get('allocation', 33)
                sql_lines.append("INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, tenant_id, created_at, updated_at)")
                sql_lines.append("SELECT")
                sql_lines.append(f"  p.id,")
                sql_lines.append(f"  '{sql_escape(resp['task'])}',")
                sql_lines.append(f"  '{resp_type}',")
                sql_lines.append(f"  {allocation},")
                sql_lines.append(f"  :'tenant_id'::uuid,")
                sql_lines.append(f"  NOW(),")
                sql_lines.append(f"  NOW()")
                sql_lines.append(f"FROM personas p")
                sql_lines.append(f"WHERE p.tenant_id = :'tenant_id'::uuid AND p.slug = '{sql_escape(slug)}'")
                sql_lines.append(f"ON CONFLICT DO NOTHING;\n")
                stats['responsibilities'] += 1

        # Insert tools
        if 'tools' in persona and persona['tools']:
            sql_lines.append(f"-- Tools for {name}")
            for tool in persona['tools']:
                usage = tool.get('usage', 'weekly')
                proficiency = PROFICIENCY_MAP.get(tool.get('proficiency', 'intermediate'), 'proficient')
                satisfaction = SATISFACTION_MAP.get(tool.get('satisfaction', 'medium'), 'neutral')
                sql_lines.append("INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)")
                sql_lines.append("SELECT")
                sql_lines.append(f"  p.id,")
                sql_lines.append(f"  '{sql_escape(tool['tool'])}',")
                sql_lines.append(f"  '{usage}',")
                sql_lines.append(f"  '{proficiency}',")
                sql_lines.append(f"  '{satisfaction}',")
                sql_lines.append(f"  :'tenant_id'::uuid,")
                sql_lines.append(f"  NOW(),")
                sql_lines.append(f"  NOW()")
                sql_lines.append(f"FROM personas p")
                sql_lines.append(f"WHERE p.tenant_id = :'tenant_id'::uuid AND p.slug = '{sql_escape(slug)}'")
                sql_lines.append(f"ON CONFLICT DO NOTHING;\n")
                stats['tools'] += 1

        # Insert internal stakeholders
        if 'internal_stakeholders' in persona and persona['internal_stakeholders']:
            sql_lines.append(f"-- Internal stakeholders for {name}")
            for stakeholder in persona['internal_stakeholders']:
                role = stakeholder['role']
                frequency = FREQUENCY_MAP.get(stakeholder.get('frequency', 'weekly'), 'weekly')
                influence = INFLUENCE_MAP.get(stakeholder.get('influence', 'medium'), 'medium')
                relationship_type = map_relationship_type(role)
                sql_lines.append("INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, tenant_id, created_at, updated_at)")
                sql_lines.append("SELECT")
                sql_lines.append(f"  p.id,")
                sql_lines.append(f"  '{sql_escape(role)}',")
                sql_lines.append(f"  '{relationship_type}',")
                sql_lines.append(f"  '{frequency}',")
                sql_lines.append(f"  '{influence}',")
                sql_lines.append(f"  :'tenant_id'::uuid,")
                sql_lines.append(f"  NOW(),")
                sql_lines.append(f"  NOW()")
                sql_lines.append(f"FROM personas p")
                sql_lines.append(f"WHERE p.tenant_id = :'tenant_id'::uuid AND p.slug = '{sql_escape(slug)}'")
                sql_lines.append(f"ON CONFLICT DO NOTHING;\n")
                stats['stakeholders'] += 1

        # Insert communication preferences
        if 'communication_preferences' in persona:
            sql_lines.append(f"-- Communication preferences for {name}")
            comm_prefs = persona['communication_preferences']

            # Channel preference
            if 'preferred_channels' in comm_prefs:
                sql_lines.append("INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, tenant_id, created_at, updated_at)")
                sql_lines.append("SELECT")
                sql_lines.append(f"  p.id,")
                sql_lines.append(f"  'channel',")
                sql_lines.append(f"  '{sql_escape(comm_prefs['preferred_channels'])}',")
                sql_lines.append(f"  :'tenant_id'::uuid,")
                sql_lines.append(f"  NOW(),")
                sql_lines.append(f"  NOW()")
                sql_lines.append(f"FROM personas p")
                sql_lines.append(f"WHERE p.tenant_id = :'tenant_id'::uuid AND p.slug = '{sql_escape(slug)}'")
                sql_lines.append(f"ON CONFLICT DO NOTHING;\n")
                stats['comm_prefs'] += 1

            # Meeting preference
            if 'meeting_preference' in comm_prefs:
                sql_lines.append("INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, tenant_id, created_at, updated_at)")
                sql_lines.append("SELECT")
                sql_lines.append(f"  p.id,")
                sql_lines.append(f"  'meeting_style',")
                sql_lines.append(f"  '{sql_escape(comm_prefs['meeting_preference'])}',")
                sql_lines.append(f"  :'tenant_id'::uuid,")
                sql_lines.append(f"  NOW(),")
                sql_lines.append(f"  NOW()")
                sql_lines.append(f"FROM personas p")
                sql_lines.append(f"WHERE p.tenant_id = :'tenant_id'::uuid AND p.slug = '{sql_escape(slug)}'")
                sql_lines.append(f"ON CONFLICT DO NOTHING;\n")
                stats['comm_prefs'] += 1

            # Response time preference
            if 'response_expectation' in comm_prefs:
                sql_lines.append("INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, tenant_id, created_at, updated_at)")
                sql_lines.append("SELECT")
                sql_lines.append(f"  p.id,")
                sql_lines.append(f"  'response_time',")
                sql_lines.append(f"  '{sql_escape(comm_prefs['response_expectation'])}',")
                sql_lines.append(f"  :'tenant_id'::uuid,")
                sql_lines.append(f"  NOW(),")
                sql_lines.append(f"  NOW()")
                sql_lines.append(f"FROM personas p")
                sql_lines.append(f"WHERE p.tenant_id = :'tenant_id'::uuid AND p.slug = '{sql_escape(slug)}'")
                sql_lines.append(f"ON CONFLICT DO NOTHING;\n")
                stats['comm_prefs'] += 1

        # Insert quotes
        if 'quotes' in persona and persona['quotes']:
            sql_lines.append(f"-- Quotes for {name}")
            for quote in persona['quotes']:
                context = quote.get('emotion', 'general')
                sql_lines.append("INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)")
                sql_lines.append("SELECT")
                sql_lines.append(f"  p.id,")
                sql_lines.append(f"  '{sql_escape(quote['quote'])}',")
                sql_lines.append(f"  '{sql_escape(context)}',")
                sql_lines.append(f"  :'tenant_id'::uuid,")
                sql_lines.append(f"  NOW(),")
                sql_lines.append(f"  NOW()")
                sql_lines.append(f"FROM personas p")
                sql_lines.append(f"WHERE p.tenant_id = :'tenant_id'::uuid AND p.slug = '{sql_escape(slug)}'")
                sql_lines.append(f"ON CONFLICT DO NOTHING;\n")
                stats['quotes'] += 1

    # Verification queries
    sql_lines.append("\n-- ============================================================================")
    sql_lines.append("-- VERIFICATION QUERIES")
    sql_lines.append("-- ============================================================================\n")

    sql_lines.append("\\echo ''")
    sql_lines.append("\\echo '============================================================================'")
    sql_lines.append("\\echo 'VERIFICATION: Commercial Organization Persona Junction Table Coverage'")
    sql_lines.append("\\echo '============================================================================'")
    sql_lines.append("\\echo ''\n")

    sql_lines.append("WITH our_personas AS (")
    sql_lines.append("  SELECT id FROM personas")
    sql_lines.append("  WHERE tenant_id = :'tenant_id'::uuid")
    sql_lines.append("    AND function_id = :'function_id'::uuid")
    sql_lines.append(")")
    sql_lines.append("SELECT")
    sql_lines.append("  'Commercial' as function,")
    sql_lines.append("  COUNT(DISTINCT p.id) as total_personas,")
    sql_lines.append("  COUNT(DISTINCT goals.persona_id) as with_goals,")
    sql_lines.append("  COUNT(DISTINCT pain.persona_id) as with_pain_points,")
    sql_lines.append("  COUNT(DISTINCT chall.persona_id) as with_challenges,")
    sql_lines.append("  COUNT(DISTINCT resp.persona_id) as with_responsibilities,")
    sql_lines.append("  COUNT(DISTINCT tools.persona_id) as with_tools,")
    sql_lines.append("  COUNT(DISTINCT stake.persona_id) as with_stakeholders,")
    sql_lines.append("  COUNT(DISTINCT comm.persona_id) as with_comm_prefs,")
    sql_lines.append("  COUNT(DISTINCT quotes.persona_id) as with_quotes")
    sql_lines.append("FROM our_personas p")
    sql_lines.append("LEFT JOIN persona_goals goals ON goals.persona_id = p.id")
    sql_lines.append("LEFT JOIN persona_pain_points pain ON pain.persona_id = p.id")
    sql_lines.append("LEFT JOIN persona_challenges chall ON chall.persona_id = p.id")
    sql_lines.append("LEFT JOIN persona_responsibilities resp ON resp.persona_id = p.id")
    sql_lines.append("LEFT JOIN persona_tools tools ON tools.persona_id = p.id")
    sql_lines.append("LEFT JOIN persona_internal_stakeholders stake ON stake.persona_id = p.id")
    sql_lines.append("LEFT JOIN persona_communication_preferences comm ON comm.persona_id = p.id")
    sql_lines.append("LEFT JOIN persona_quotes quotes ON quotes.persona_id = p.id;")

    sql_lines.append("\n\\echo ''")
    sql_lines.append("\\echo 'Expected: 224 personas with junction data'")
    sql_lines.append("\\echo 'Target: 100% coverage on all junction tables'")
    sql_lines.append("\\echo ''")

    # Write SQL file
    print(f"\nWriting SQL to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w') as f:
        f.write('\n'.join(sql_lines))

    print(f"\n✅ SQL file generated successfully!")
    print(f"\nStatistics:")
    print(f"  Personas: {stats['personas']}")
    print(f"  Goals: {stats['goals']}")
    print(f"  Pain Points: {stats['pain_points']}")
    print(f"  Challenges: {stats['challenges']}")
    print(f"  Responsibilities: {stats['responsibilities']}")
    print(f"  Tools: {stats['tools']}")
    print(f"  Internal Stakeholders: {stats['stakeholders']}")
    print(f"  Communication Preferences: {stats['comm_prefs']}")
    print(f"  Quotes: {stats['quotes']}")
    print(f"\nTotal junction records: {sum(stats.values()) - stats['personas']}")
    print(f"\nFile size: {len('\n'.join(sql_lines))} bytes")
    print(f"\nReady to execute: psql ... -f {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
