#!/usr/bin/env python3
"""
Discover Enum Mismatches
Analyzes JSON data against schema to find all enum value mismatches
"""

import json
import re
from collections import defaultdict

SCHEMA_FILE = "actual_schema.json"
JSON_DATA_FILE = "/Users/hichamnaim/Downloads/Medical_Affairs_Personas_V5_EXTENDED.json"

# Load schema
with open(SCHEMA_FILE, 'r') as f:
    schema = json.load(f)

# Load JSON data
with open(JSON_DATA_FILE, 'r') as f:
    json_data = json.load(f)

# Build constraint map: table -> column -> allowed values
constraint_map = defaultdict(dict)

for constraint in schema['check_constraints']:
    table_name = constraint['table_name']
    constraint_def = constraint['constraint_def']

    # Extract column name and allowed values from CHECK constraint
    # Pattern: CHECK ((column_name = ANY (ARRAY['value1'::text, 'value2'::text])))
    pattern = r'\(\((\w+) = ANY \(ARRAY\[(.*?)\]\)\)\)'
    match = re.search(pattern, constraint_def)

    if match:
        column_name = match.group(1)
        values_str = match.group(2)
        # Extract individual values
        allowed_values = set(re.findall(r"'([^']+)'", values_str))
        constraint_map[table_name][column_name] = allowed_values

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

# Collect actual values from JSON
json_values = defaultdict(lambda: defaultdict(set))

for persona in json_data['personas']:
    for json_key, table_name in json_to_table.items():
        if json_key not in persona:
            continue

        data = persona[json_key]
        if not data:
            continue

        # Handle both list and dict
        items = data if isinstance(data, list) else [data]

        for item in items:
            if not isinstance(item, dict):
                continue

            for field, value in item.items():
                if isinstance(value, str):
                    json_values[table_name][field].add(value)

# Find mismatches
print("=" * 80)
print("ENUM VALUE MISMATCHES")
print("=" * 80)
print()

mismatches = []

for table_name in sorted(constraint_map.keys()):
    if table_name not in json_values:
        continue

    for column_name, allowed_values in sorted(constraint_map[table_name].items()):
        if column_name not in json_values[table_name]:
            continue

        actual_values = json_values[table_name][column_name]
        invalid_values = actual_values - allowed_values

        if invalid_values:
            mismatches.append({
                'table': table_name,
                'column': column_name,
                'allowed': sorted(allowed_values),
                'invalid': sorted(invalid_values),
                'valid_from_json': sorted(actual_values & allowed_values)
            })

            print(f"Table: {table_name}")
            print(f"Column: {column_name}")
            print(f"  Allowed values: {sorted(allowed_values)}")
            print(f"  Invalid values found: {sorted(invalid_values)}")
            print(f"  Valid values from JSON: {sorted(actual_values & allowed_values)}")
            print()

print("=" * 80)
print(f"SUMMARY: {len(mismatches)} mismatches found")
print("=" * 80)
print()

# Generate suggested VALUE_MAPPINGS
if mismatches:
    print("SUGGESTED VALUE_MAPPINGS:")
    print()
    print("VALUE_MAPPINGS = {")
    for m in mismatches:
        print(f"    '{m['table']}': {{")
        print(f"        '{m['column']}': {{")
        for invalid_val in m['invalid']:
            # Try to suggest a mapping
            suggestion = "# TODO: choose appropriate mapping"
            if m['valid_from_json']:
                suggestion = f"'{m['valid_from_json'][0]}'"  # Suggest first valid value
            print(f"            '{invalid_val}': {suggestion},")
        print(f"        }},")
        print(f"    }},")
    print("}")
