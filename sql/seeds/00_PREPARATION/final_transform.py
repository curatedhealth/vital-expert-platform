#!/usr/bin/env python3
"""
Final Corrected Transformation Script
Applies DEFAULT_VALUES and VALUE_MAPPINGS configurations
"""
import json
from datetime import datetime
from pathlib import Path

# Configuration
TENANT_ID = "f7aa6fd4-0af9-4706-8b31-034f1f7accda"
JSON_FILE = "/Users/hichamnaim/Downloads/Medical_Affairs_Personas_V5_EXTENDED.json"
OUTPUT_SQL = "DEPLOY_MA_V5_FINAL.sql"

# Load configurations
with open('DEFAULT_VALUES.json') as f:
    DEFAULT_VALUES = json.load(f)

with open('VALUE_MAPPINGS.json') as f:
    VALUE_MAPPINGS = json.load(f)

# Load JSON data
with open(JSON_FILE) as f:
    data = json.load(f)

personas = data['personas']

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

# Generate SQL
sql = f"""-- Medical Affairs Personas v5.0 - Final Deployment
-- Generated: {datetime.now().isoformat()}
-- Includes: DEFAULT_VALUES and VALUE_MAPPINGS

BEGIN;

"""

print(f"Processing {len(personas)} personas...")

for idx, persona in enumerate(personas, 1):
    name = persona.get('core_profile', {}).get('name', f'Persona {idx}')
    slug = persona.get('core_profile', {}).get('slug', name.lower().replace(' ', '-').replace('.', ''))
    
    print(f"{idx}. {name}")
    
    # Create temp table for this persona's ID
    sql += f"""
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Get or create persona
    SELECT id INTO v_persona_id
    FROM personas
    WHERE tenant_id = '{TENANT_ID}'::uuid
      AND slug = '{slug}'
    LIMIT 1;
    
    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: {slug}';
    END IF;
    
    -- Store ID for this persona
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids_{idx} (persona_id UUID);
    INSERT INTO temp_persona_ids_{idx} VALUES (v_persona_id);
    
"""
    
    # Process evidence_summary with defaults
    if 'evidence_summary' in persona:
        es = persona['evidence_summary'].copy()
        es = apply_defaults('persona_evidence_summary', es)
        
        sql += f"""
    -- Evidence Summary
    INSERT INTO persona_evidence_summary (
        id, persona_id, tenant_id,
        total_sources, case_studies_count, statistics_count,
        overall_confidence_level, evidence_quality_score, evidence_recency_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(es.get('total_sources'))},
        {escape_sql(es.get('case_studies_count'))},
        {escape_sql(es.get('statistics_count'))},
        {escape_sql(es.get('overall_confidence_level'))},
        {escape_sql(es.get('evidence_quality_score'))},
        {escape_sql(es.get('evidence_recency_score'))}
    ) ON CONFLICT DO NOTHING;
"""
    
    # Process case_studies with defaults
    for cs in persona.get('case_studies', []):
        cs = cs.copy()
        cs = apply_defaults('persona_case_studies', cs)
        
        sql += f"""
    -- Case Study
    INSERT INTO persona_case_studies (
        id, persona_id, tenant_id,
        case_study_title, organization_name, industry, case_type,
        challenge_addressed, solution_implemented, outcomes_achieved,
        relevance_to_persona, relevance_score
    ) VALUES (
        gen_random_uuid(), v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(cs.get('case_study_title', 'Case Study'))},
        {escape_sql(cs.get('organization_name', 'Organization'))},
        {escape_sql(cs.get('industry'))},
        {escape_sql(cs.get('case_type'))},
        {escape_sql(cs.get('challenge_addressed', 'Challenge'))},
        {escape_sql(cs.get('solution_implemented', 'Solution'))},
        {escape_sql(cs.get('outcomes_achieved', []))},
        {escape_sql(cs.get('relevance_to_persona'))},
        {escape_sql(cs.get('relevance_score'))}
    ) ON CONFLICT DO NOTHING;
"""
    
    # Process monthly_objectives with achievement_rate conversion
    for obj in persona.get('monthly_objectives', []):
        achievement_rate = obj.get('achievement_rate', 0)
        # Convert percentage to decimal if needed
        if isinstance(achievement_rate, (int, float)) and achievement_rate > 1:
            achievement_rate = achievement_rate / 100.0
        
        sql += f"""
    -- Monthly Objective
    INSERT INTO persona_monthly_objectives (
        id, persona_id, tenant_id,
        objective_text, success_metric, achievement_rate
    ) VALUES (
        gen_random_uuid(), v_persona_id, '{TENANT_ID}'::uuid,
        {escape_sql(obj.get('objective_description', 'Objective'))},
        {escape_sql(obj.get('success_criteria', ''))},
        {achievement_rate}
    ) ON CONFLICT DO NOTHING;
"""
    
    sql += "END $$;\n"

sql += "\nCOMMIT;\n"

# Write SQL file
with open(OUTPUT_SQL, 'w') as f:
    f.write(sql)

print(f"\n✅ Generated: {OUTPUT_SQL}")
print(f"📊 {len(personas)} personas processed")
print(f"\nNext: Deploy with:")
print(f'psql "$DB_URL" -f {OUTPUT_SQL}')
