#!/usr/bin/env python3
"""
Generate SQL to add 4th persona to Commercial Organization roles that only have 3
"""

import json
import uuid
from datetime import datetime
import random

# Constants
TENANT_ID = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
COMMERCIAL_FUNCTION_ID = '598c6096-4894-458c-be34-c82e13a743e8'

# Names pool for variation
FIRST_NAMES = [
    "Alexander", "Samantha", "Nicholas", "Rebecca", "Jonathan", "Katherine",
    "Benjamin", "Elizabeth", "Zachary", "Victoria", "Anthony", "Natalie",
    "Timothy", "Stephanie", "Gregory", "Melissa", "Kenneth", "Ashley",
    "Raymond", "Kimberly", "Jeffrey", "Heather", "Dennis", "Brittany",
    "Ryan", "Danielle", "Justin", "Rachel", "Brandon", "Lauren",
    "Kevin", "Christina", "Tyler", "Megan", "Steven", "Amy"
]

LAST_NAMES = [
    "Mitchell", "Stewart", "Turner", "Phillips", "Parker", "Edwards",
    "Collins", "Morris", "Rogers", "Reed", "Cook", "Morgan",
    "Bell", "Murphy", "Bailey", "Cooper", "Richardson", "Cox",
    "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez",
    "James", "Watson", "Brooks", "Kelly", "Sanders", "Price",
    "Bennett", "Wood", "Barnes", "Ross", "Henderson", "Coleman"
]

COMPANY_VARIATIONS = ['large', 'mid', 'specialty', 'biotech']
LOCATION_VARIATIONS = [
    'Boston, MA', 'San Francisco, CA', 'Chicago, IL', 'Philadelphia, PA',
    'Seattle, WA', 'San Diego, CA', 'Austin, TX', 'Denver, CO'
]

def sql_escape(text):
    """Escape single quotes for SQL"""
    if text is None:
        return ''
    return str(text).replace("'", "''")

def map_proficiency(level):
    """Map proficiency level to database enum"""
    mapping = {
        'advanced': 'expert',
        'intermediate': 'proficient',
        'basic': 'competent',
        'beginner': 'beginner',
        'expert': 'expert',
        'proficient': 'proficient',
        'competent': 'competent'
    }
    return mapping.get(level, 'proficient')

def map_satisfaction(level):
    """Map satisfaction level to database enum"""
    mapping = {
        'high': 'satisfied',
        'medium': 'neutral',
        'low': 'dissatisfied',
        'satisfied': 'satisfied',
        'neutral': 'neutral',
        'dissatisfied': 'dissatisfied'
    }
    return mapping.get(level, 'neutral')

def generate_persona_from_template(role_base, template_persona, variation_num):
    """Generate a new persona based on template with variations"""

    # Generate unique name
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    name = f"{first_name} {last_name}"

    # Get template data
    core = template_persona.get('core_profile', {})
    prof_ctx = template_persona.get('professional_context', {})

    # Determine variation type
    company_size = COMPANY_VARIATIONS[variation_num % len(COMPANY_VARIATIONS)]
    location = LOCATION_VARIATIONS[variation_num % len(LOCATION_VARIATIONS)]

    # Create slug
    role_slug = role_base.lower().replace(' ', '-').replace('&', 'and')
    slug = f"{first_name.lower()}-{last_name.lower()}-{role_slug}-{company_size}-v{variation_num}"

    # Adjust experience based on seniority
    seniority = core.get('seniority_level', 'manager')
    if seniority == 'c-suite':
        years_exp = random.randint(20, 30)
    elif seniority in ['vp', 'senior_director', 'executive_director']:
        years_exp = random.randint(15, 25)
    elif seniority == 'director':
        years_exp = random.randint(10, 18)
    elif seniority in ['senior_manager', 'manager']:
        years_exp = random.randint(7, 15)
    else:
        years_exp = random.randint(3, 10)

    return {
        'name': name,
        'slug': slug,
        'title': template_persona.get('title', role_base),
        'role_base': role_base,
        'seniority_level': seniority,
        'company_size': company_size,
        'location': location,
        'years_of_experience': years_exp,
        'years_in_industry': years_exp + random.randint(0, 5),
        'age_range': core.get('age_range', '30-40'),
        'education_level': core.get('education_level', 'Bachelor'),
        'template': template_persona
    }

def generate_sql_for_persona(persona, tenant_id, function_id):
    """Generate SQL INSERT statements for a persona and all junction tables"""

    sql_lines = []
    name = persona['name']
    slug = persona['slug']
    role_base = persona['role_base']
    template = persona['template']

    # Generate persona ID (consistent UUID from slug)
    persona_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, slug))

    sql_lines.append(f"\n-- ============================================================================")
    sql_lines.append(f"-- {name} - {role_base} ({persona['company_size']})")
    sql_lines.append(f"-- ============================================================================\n")

    # Insert persona
    sql_lines.append(f"-- Insert persona: {name}")
    sql_lines.append("INSERT INTO personas (")
    sql_lines.append("  id, tenant_id, function_id, name, slug,")
    sql_lines.append("  age_range, location_type, education_level, years_of_experience, seniority_level,")
    sql_lines.append("  typical_organization_size, years_in_industry,")
    sql_lines.append("  created_at, updated_at")
    sql_lines.append(") VALUES (")
    sql_lines.append(f"  '{persona_id}'::uuid,")
    sql_lines.append(f"  '{tenant_id}'::uuid,")
    sql_lines.append(f"  '{function_id}'::uuid,")
    sql_lines.append(f"  '{sql_escape(name)}',")
    sql_lines.append(f"  '{sql_escape(slug)}',")
    sql_lines.append(f"  '{sql_escape(persona['age_range'])}',")
    sql_lines.append(f"  '{sql_escape(persona['location'])}',")
    sql_lines.append(f"  '{sql_escape(persona['education_level'])}',")
    sql_lines.append(f"  {persona['years_of_experience']},")
    sql_lines.append(f"  '{sql_escape(persona['seniority_level'])}',")
    sql_lines.append(f"  '{sql_escape(persona['company_size'])}',")
    sql_lines.append(f"  {persona['years_in_industry']},")
    sql_lines.append(f"  NOW(),")
    sql_lines.append(f"  NOW()")
    sql_lines.append(") ON CONFLICT (slug, tenant_id) DO NOTHING;\n")

    # Insert goals (adapt from template)
    if 'goals' in template and template['goals']:
        sql_lines.append(f"-- Goals for {name}")
        for seq, goal_template in enumerate(template['goals'][:3], 1):  # Take up to 3 goals
            goal_text = goal_template.get('goal', f'Strategic objective for {role_base}')
            goal_type = 'primary' if seq == 1 else ('secondary' if seq == 2 else 'long_term')

            sql_lines.append("INSERT INTO persona_goals (persona_id, goal_text, goal_type, priority, sequence_order, tenant_id, created_at, updated_at)")
            sql_lines.append("SELECT p.id,")
            sql_lines.append(f"  '{sql_escape(goal_text)}',")
            sql_lines.append(f"  '{goal_type}',")
            sql_lines.append(f"  {seq},")
            sql_lines.append(f"  {seq},")
            sql_lines.append(f"  '{tenant_id}'::uuid,")
            sql_lines.append(f"  NOW(), NOW()")
            sql_lines.append(f"FROM personas p WHERE p.tenant_id = '{tenant_id}'::uuid AND p.slug = '{sql_escape(slug)}'")
            sql_lines.append("ON CONFLICT DO NOTHING;\n")

    # Insert pain points (adapt from template)
    if 'pain_points' in template and template['pain_points']:
        sql_lines.append(f"-- Pain Points for {name}")
        for seq, pain_template in enumerate(template['pain_points'][:3], 1):
            pain_text = pain_template.get('pain', f'Key challenge in {role_base}')
            severity = pain_template.get('severity', 'high')
            category = 'operational' if 'operational' in pain_text.lower() else 'strategic'

            sql_lines.append("INSERT INTO persona_pain_points (persona_id, pain_point_text, pain_category, severity, sequence_order, tenant_id, created_at, updated_at)")
            sql_lines.append("SELECT p.id,")
            sql_lines.append(f"  '{sql_escape(pain_text)}',")
            sql_lines.append(f"  '{category}',")
            sql_lines.append(f"  '{severity}',")
            sql_lines.append(f"  {seq},")
            sql_lines.append(f"  '{tenant_id}'::uuid,")
            sql_lines.append(f"  NOW(), NOW()")
            sql_lines.append(f"FROM personas p WHERE p.tenant_id = '{tenant_id}'::uuid AND p.slug = '{sql_escape(slug)}'")
            sql_lines.append("ON CONFLICT DO NOTHING;\n")

    # Insert challenges (adapt from template)
    if 'challenges' in template and template['challenges']:
        sql_lines.append(f"-- Challenges for {name}")
        for seq, challenge_template in enumerate(template['challenges'][:2], 1):
            challenge_text = challenge_template.get('challenge', f'Challenge in {role_base}')
            impact = challenge_template.get('impact', 'high')
            challenge_type = 'strategic' if seq == 1 else 'daily'

            sql_lines.append("INSERT INTO persona_challenges (persona_id, challenge_text, challenge_type, impact_level, sequence_order, tenant_id, created_at, updated_at)")
            sql_lines.append("SELECT p.id,")
            sql_lines.append(f"  '{sql_escape(challenge_text)}',")
            sql_lines.append(f"  '{challenge_type}',")
            sql_lines.append(f"  '{impact}',")
            sql_lines.append(f"  {seq},")
            sql_lines.append(f"  '{tenant_id}'::uuid,")
            sql_lines.append(f"  NOW(), NOW()")
            sql_lines.append(f"FROM personas p WHERE p.tenant_id = '{tenant_id}'::uuid AND p.slug = '{sql_escape(slug)}'")
            sql_lines.append("ON CONFLICT DO NOTHING;\n")

    # Insert responsibilities (adapt from template)
    if 'responsibilities' in template and template['responsibilities']:
        sql_lines.append(f"-- Responsibilities for {name}")
        for seq, resp_template in enumerate(template['responsibilities'][:3], 1):
            resp_text = resp_template.get('responsibility', f'Responsibility for {role_base}')
            resp_type = 'key' if seq == 1 else ('daily' if seq == 2 else 'weekly')
            time_allocation = resp_template.get('time_allocation_percentage', 30)

            sql_lines.append("INSERT INTO persona_responsibilities (persona_id, responsibility_text, responsibility_type, time_allocation_percent, sequence_order, tenant_id, created_at, updated_at)")
            sql_lines.append("SELECT p.id,")
            sql_lines.append(f"  '{sql_escape(resp_text)}',")
            sql_lines.append(f"  '{resp_type}',")
            sql_lines.append(f"  {time_allocation},")
            sql_lines.append(f"  {seq},")
            sql_lines.append(f"  '{tenant_id}'::uuid,")
            sql_lines.append(f"  NOW(), NOW()")
            sql_lines.append(f"FROM personas p WHERE p.tenant_id = '{tenant_id}'::uuid AND p.slug = '{sql_escape(slug)}'")
            sql_lines.append("ON CONFLICT DO NOTHING;\n")

    # Insert tools (adapt from template)
    if 'tools' in template and template['tools']:
        sql_lines.append(f"-- Tools for {name}")
        for seq, tool_template in enumerate(template['tools'][:3], 1):
            tool_name = tool_template.get('tool', 'Salesforce')
            usage_freq = tool_template.get('usage', 'daily')
            proficiency = map_proficiency(tool_template.get('proficiency', 'proficient'))
            satisfaction = map_satisfaction(tool_template.get('satisfaction', 'neutral'))

            sql_lines.append("INSERT INTO persona_tools (persona_id, tool_name, usage_frequency, proficiency_level, satisfaction_level, tenant_id, created_at, updated_at)")
            sql_lines.append("SELECT p.id,")
            sql_lines.append(f"  '{sql_escape(tool_name)}',")
            sql_lines.append(f"  '{usage_freq}',")
            sql_lines.append(f"  '{proficiency}',")
            sql_lines.append(f"  '{satisfaction}',")
            sql_lines.append(f"  '{tenant_id}'::uuid,")
            sql_lines.append(f"  NOW(), NOW()")
            sql_lines.append(f"FROM personas p WHERE p.tenant_id = '{tenant_id}'::uuid AND p.slug = '{sql_escape(slug)}'")
            sql_lines.append("ON CONFLICT DO NOTHING;\n")

    # Insert internal stakeholders (adapt from template)
    if 'internal_stakeholders' in template and template['internal_stakeholders']:
        sql_lines.append(f"-- Internal Stakeholders for {name}")
        for seq, stakeholder_template in enumerate(template['internal_stakeholders'][:2], 1):
            stakeholder_role = stakeholder_template.get('role', 'Cross-functional team')
            relationship = stakeholder_template.get('relationship_type', 'peer')
            if relationship == 'cross-functional':
                relationship = 'cross_functional'
            frequency = stakeholder_template.get('interaction_frequency', 'weekly')
            quality = stakeholder_template.get('relationship_quality', 'good')
            influence = stakeholder_template.get('influence_level', 'medium')

            sql_lines.append("INSERT INTO persona_internal_stakeholders (persona_id, stakeholder_role, relationship_type, interaction_frequency, relationship_quality, influence_level, tenant_id, created_at, updated_at)")
            sql_lines.append("SELECT p.id,")
            sql_lines.append(f"  '{sql_escape(stakeholder_role)}',")
            sql_lines.append(f"  '{relationship}',")
            sql_lines.append(f"  '{frequency}',")
            sql_lines.append(f"  '{quality}',")
            sql_lines.append(f"  '{influence}',")
            sql_lines.append(f"  '{tenant_id}'::uuid,")
            sql_lines.append(f"  NOW(), NOW()")
            sql_lines.append(f"FROM personas p WHERE p.tenant_id = '{tenant_id}'::uuid AND p.slug = '{sql_escape(slug)}'")
            sql_lines.append("ON CONFLICT DO NOTHING;\n")

    # Insert communication preferences (adapt from template or use defaults)
    comm_prefs = template.get('communication_preferences', [])
    if comm_prefs and isinstance(comm_prefs, list):
        sql_lines.append(f"-- Communication Preferences for {name}")
        for seq, pref_template in enumerate(comm_prefs[:3], 1):
            pref_type = pref_template.get('type', 'channel')
            pref_value = pref_template.get('preference', 'Email')

            sql_lines.append("INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)")
            sql_lines.append("SELECT p.id,")
            sql_lines.append(f"  '{pref_type}',")
            sql_lines.append(f"  '{sql_escape(pref_value)}',")
            sql_lines.append(f"  {seq},")
            sql_lines.append(f"  '{tenant_id}'::uuid,")
            sql_lines.append(f"  NOW(), NOW()")
            sql_lines.append(f"FROM personas p WHERE p.tenant_id = '{tenant_id}'::uuid AND p.slug = '{sql_escape(slug)}'")
            sql_lines.append("ON CONFLICT DO NOTHING;\n")
    else:
        # Use default communication preferences
        sql_lines.append(f"-- Communication Preferences for {name} (defaults)")
        default_prefs = [
            ('channel', 'Email'),
            ('meeting_style', 'Efficient, agenda-driven'),
            ('response_time', '24 hours for non-urgent')
        ]
        for seq, (pref_type, pref_value) in enumerate(default_prefs, 1):
            sql_lines.append("INSERT INTO persona_communication_preferences (persona_id, preference_type, preference_value, sequence_order, tenant_id, created_at, updated_at)")
            sql_lines.append("SELECT p.id,")
            sql_lines.append(f"  '{pref_type}',")
            sql_lines.append(f"  '{sql_escape(pref_value)}',")
            sql_lines.append(f"  {seq},")
            sql_lines.append(f"  '{tenant_id}'::uuid,")
            sql_lines.append(f"  NOW(), NOW()")
            sql_lines.append(f"FROM personas p WHERE p.tenant_id = '{tenant_id}'::uuid AND p.slug = '{sql_escape(slug)}'")
            sql_lines.append("ON CONFLICT DO NOTHING;\n")

    # Insert quote (adapt from template or use default)
    quotes = template.get('quotes', [])
    if quotes and isinstance(quotes, list) and len(quotes) > 0:
        sql_lines.append(f"-- Quote for {name}")
        quote_template = quotes[0]
        quote_text = quote_template.get('quote', f'Success in {role_base} requires focus and execution')

        sql_lines.append("INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)")
        sql_lines.append("SELECT p.id,")
        sql_lines.append(f"  '{sql_escape(quote_text)}',")
        sql_lines.append(f"  'Professional perspective',")
        sql_lines.append(f"  '{tenant_id}'::uuid,")
        sql_lines.append(f"  NOW(), NOW()")
        sql_lines.append(f"FROM personas p WHERE p.tenant_id = '{tenant_id}'::uuid AND p.slug = '{sql_escape(slug)}'")
        sql_lines.append("ON CONFLICT DO NOTHING;\n")
    else:
        # Use default quote
        sql_lines.append(f"-- Quote for {name} (default)")
        default_quote = f'Success in {role_base} requires strategic thinking and consistent execution'

        sql_lines.append("INSERT INTO persona_quotes (persona_id, quote_text, context, tenant_id, created_at, updated_at)")
        sql_lines.append("SELECT p.id,")
        sql_lines.append(f"  '{sql_escape(default_quote)}',")
        sql_lines.append(f"  'Professional perspective',")
        sql_lines.append(f"  '{tenant_id}'::uuid,")
        sql_lines.append(f"  NOW(), NOW()")
        sql_lines.append(f"FROM personas p WHERE p.tenant_id = '{tenant_id}'::uuid AND p.slug = '{sql_escape(slug)}'")
        sql_lines.append("ON CONFLICT DO NOTHING;\n")

    return '\n'.join(sql_lines)

def main():
    print("Loading roles needing 4th persona...")

    # Load the analysis
    with open('/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/00_PREPARATION/roles_needing_4th_persona.json', 'r') as f:
        data = json.load(f)

    roles_needing = data['roles_needing_personas']
    role_examples = data['role_examples']

    print(f"Found {len(roles_needing)} roles needing a 4th persona")

    # Generate SQL
    sql_lines = []

    # Header
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- ADD 4TH PERSONA TO COMMERCIAL ORGANIZATION ROLES")
    sql_lines.append("-- ============================================================================")
    sql_lines.append(f"-- Date: {datetime.now().strftime('%Y-%m-%d')}")
    sql_lines.append(f"-- Total Additional Personas: {len(roles_needing)}")
    sql_lines.append("-- Purpose: Bring all roles to exactly 4 personas each")
    sql_lines.append("-- ============================================================================\n")

    stats = {'personas': 0, 'goals': 0, 'pain_points': 0, 'challenges': 0,
             'responsibilities': 0, 'tools': 0, 'stakeholders': 0,
             'comm_prefs': 0, 'quotes': 0}

    # Generate personas
    for idx, (role, count) in enumerate(roles_needing, 1):
        print(f"Processing {idx}/{len(roles_needing)}: {role}")

        template_persona = role_examples[role]
        new_persona = generate_persona_from_template(role, template_persona, 4)  # 4th variation

        persona_sql = generate_sql_for_persona(new_persona, TENANT_ID, COMMERCIAL_FUNCTION_ID)
        sql_lines.append(persona_sql)

        stats['personas'] += 1
        stats['goals'] += min(3, len(template_persona.get('goals', [])))
        stats['pain_points'] += min(3, len(template_persona.get('pain_points', [])))
        stats['challenges'] += min(2, len(template_persona.get('challenges', [])))
        stats['responsibilities'] += min(3, len(template_persona.get('responsibilities', [])))
        stats['tools'] += min(3, len(template_persona.get('tools', [])))
        stats['stakeholders'] += min(2, len(template_persona.get('internal_stakeholders', [])))
        stats['comm_prefs'] += min(3, len(template_persona.get('communication_preferences', [])))
        stats['quotes'] += min(1, len(template_persona.get('quotes', [])))

    # Verification query
    sql_lines.append("\n-- ============================================================================")
    sql_lines.append("-- VERIFICATION")
    sql_lines.append("-- ============================================================================\n")
    sql_lines.append("SELECT COUNT(*) as total_commercial_personas")
    sql_lines.append("FROM personas")
    sql_lines.append(f"WHERE tenant_id = '{TENANT_ID}'::uuid")
    sql_lines.append(f"  AND function_id = '{COMMERCIAL_FUNCTION_ID}'::uuid;")

    # Write SQL file
    output_file = '/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/00_PREPARATION/ADD_4TH_COMMERCIAL_PERSONAS.sql'
    with open(output_file, 'w') as f:
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
    print(f"\nFile: {output_file}")

if __name__ == '__main__':
    main()
