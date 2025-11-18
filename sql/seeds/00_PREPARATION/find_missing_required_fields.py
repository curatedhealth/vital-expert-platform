#!/usr/bin/env python3
"""
Find Missing Required Fields
Analyzes JSON data to find which required fields are missing
"""

import json
from collections import defaultdict

SCHEMA_FILE = "actual_schema.json"
JSON_DATA_FILE = "/Users/hichamnaim/Downloads/Medical_Affairs_Personas_V5_EXTENDED.json"

# Load schema
with open(SCHEMA_FILE, 'r') as f:
    schema = json.load(f)

# Load JSON data
with open(JSON_DATA_FILE, 'r') as f:
    json_data = json.load(f)

# Mapping of JSON keys to tables
json_to_table = {
    'annual_conferences': 'persona_annual_conferences',
    'career_trajectory': 'persona_career_trajectory',
    'case_studies': 'persona_case_studies',
    'customer_relationships': 'persona_customer_relationships',
    'evidence_summary': 'persona_evidence_summary',
    'expert_opinions': 'persona_expert_opinions',
    'external_stakeholders': 'persona_external_stakeholders',
    'industry_relationships': 'persona_industry_relationships',
    'industry_reports': 'persona_industry_reports',
    'internal_networks': 'persona_internal_networks',
    'internal_stakeholders': 'persona_internal_stakeholders',
    'month_in_life': 'persona_month_in_life',
    'monthly_objectives': 'persona_monthly_objectives',
    'monthly_stakeholders': 'persona_monthly_stakeholders',
    'public_research': 'persona_public_research',
    'regulatory_stakeholders': 'persona_regulatory_stakeholders',
    'stakeholder_influence_map': 'persona_stakeholder_influence_map',
    'stakeholder_journey': 'persona_stakeholder_journey',
    'stakeholder_value_exchange': 'persona_stakeholder_value_exchange',
}

# Get required columns for each table
required_fields = defaultdict(set)
for table_name, columns in schema['tables'].items():
    for col in columns:
        # Required if NOT NULL and no default value
        if col['is_nullable'] == 'NO' and col['column_default'] is None:
            # Skip system columns
            if col['column_name'] not in ['id', 'persona_id', 'tenant_id', 'created_at', 'updated_at']:
                required_fields[table_name].add(col['column_name'])

# Collect fields present in JSON
json_fields = defaultdict(lambda: defaultdict(set))

for persona in json_data['personas']:
    for json_key, table_name in json_to_table.items():
        if json_key not in persona:
            continue

        data = persona[json_key]
        if not data:
            continue

        items = data if isinstance(data, list) else [data]

        for item in items:
            if not isinstance(item, dict):
                continue

            for field in item.keys():
                json_fields[table_name][json_key].add(field)

# Find missing required fields
print("=" * 80)
print("MISSING REQUIRED FIELDS")
print("=" * 80)
print()

missing_by_table = defaultdict(set)

for json_key, table_name in json_to_table.items():
    if table_name not in required_fields:
        continue

    required = required_fields[table_name]
    if table_name not in json_fields or json_key not in json_fields[table_name]:
        # No data for this table in JSON, skip
        continue

    present = json_fields[table_name][json_key]
    missing = required - present

    if missing:
        missing_by_table[table_name] = missing
        print(f"Table: {table_name}")
        print(f"  JSON key: {json_key}")
        print(f"  Required fields: {sorted(required)}")
        print(f"  Present in JSON: {sorted(present)}")
        print(f"  MISSING: {sorted(missing)}")
        print()

print("=" * 80)
print(f"SUMMARY: {len(missing_by_table)} tables have missing required fields")
print("=" * 80)
print()

# Generate DEFAULT_VALUES
if missing_by_table:
    print("SUGGESTED DEFAULT_VALUES:")
    print()
    print("DEFAULT_VALUES = {")
    for table_name, missing_fields in sorted(missing_by_table.items()):
        print(f"    '{table_name}': {{")
        for field in sorted(missing_fields):
            # Get field type
            col_info = None
            for col in schema['tables'][table_name]:
                if col['column_name'] == field:
                    col_info = col
                    break

            if col_info:
                data_type = col_info['data_type']
                udt_name = col_info['udt_name']

                # Suggest default based on type
                if data_type == 'text':
                    default = f"'TBD - {field}'"
                elif data_type == 'integer':
                    default = "0"
                elif data_type == 'numeric':
                    default = "0.0"
                elif data_type == 'boolean':
                    default = "False"
                elif data_type == 'ARRAY':
                    default = "[]"
                else:
                    default = f"# TODO: type={data_type}"

                print(f"        '{field}': {default},  # {data_type}")

        print(f"    }},")
    print("}")
