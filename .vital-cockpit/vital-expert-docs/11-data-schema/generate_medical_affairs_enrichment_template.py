#!/usr/bin/env python3
"""
Generate enrichment template with actual database IDs for Medical Affairs roles.
This script connects to Supabase and creates a JSON template with all actual UUIDs.
"""

import json
import os
from supabase import create_client, Client

# Instructions for setup
print("""
=====================================================================
MEDICAL AFFAIRS ENRICHMENT TEMPLATE GENERATOR
=====================================================================

This script will:
1. Connect to your Supabase database
2. Fetch all Medical Affairs functions, departments, and roles with IDs
3. Generate a comprehensive JSON template for enrichment
4. Save the template with actual UUIDs (no placeholders!)

SETUP REQUIRED:
--------------
1. Set environment variables:
   export SUPABASE_URL="your-project-url"
   export SUPABASE_KEY="your-service-role-key"

2. Install supabase-py:
   pip install supabase

3. Run this script:
   python3 generate_medical_affairs_enrichment_template.py

=====================================================================
""")

# Check for environment variables
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Missing environment variables!")
    print("   Please set SUPABASE_URL and SUPABASE_KEY")
    print("\nAlternatively, run get_medical_affairs_structure_for_template.sql")
    print("and manually paste the UUIDs into the template.")
    exit(1)

# Connect to Supabase
print("Connecting to Supabase...")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Fetch Medical Affairs structure
print("Fetching Medical Affairs structure...")

# Get function
function_data = supabase.table('org_functions')\
    .select('id, name, slug')\
    .eq('slug', 'medical-affairs')\
    .is_('deleted_at', 'null')\
    .execute()

if not function_data.data:
    print("❌ ERROR: Medical Affairs function not found!")
    exit(1)

function = function_data.data[0]
print(f"✓ Found function: {function['name']} ({function['id']})")

# Get departments
departments_data = supabase.table('org_departments')\
    .select('id, name, slug')\
    .eq('function_id', function['id'])\
    .is_('deleted_at', 'null')\
    .order('name')\
    .execute()

print(f"✓ Found {len(departments_data.data)} departments")

# Get all roles
template = {
    "medical_affairs_enrichment_template": {
        "metadata": {
            "function_name": function['name'],
            "function_id": function['id'],
            "function_slug": function['slug'],
            "template_version": "1.0",
            "created_date": "2024-11-21",
            "total_departments": len(departments_data.data),
            "note": "All UUIDs are actual database IDs - no placeholders!"
        },
        "departments": []
    }
}

total_roles = 0

for dept in departments_data.data:
    print(f"  Processing: {dept['name']}...")
    
    # Get roles for this department
    roles_data = supabase.table('org_roles')\
        .select('id, name, slug, geographic_scope, seniority_level, role_category, '
                'team_size_min, team_size_max, travel_percentage_min, travel_percentage_max, '
                'budget_min_usd, budget_max_usd, years_experience_min, years_experience_max')\
        .eq('department_id', dept['id'])\
        .is_('deleted_at', 'null')\
        .order('geographic_scope, name')\
        .execute()
    
    dept_template = {
        "department_id": dept['id'],
        "department_name": dept['name'],
        "department_slug": dept['slug'],
        "role_count": len(roles_data.data),
        "roles": []
    }
    
    for role in roles_data.data:
        role_template = {
            "_role_identification": {
                "role_id": role['id'],
                "role_name": role['name'],
                "role_slug": role['slug'],
                "geographic_scope": role['geographic_scope'],
                "seniority_level": role['seniority_level'],
                "role_category": role['role_category']
            },
            "_current_attributes": {
                "team_size_min": role.get('team_size_min'),
                "team_size_max": role.get('team_size_max'),
                "travel_percentage_min": role.get('travel_percentage_min'),
                "travel_percentage_max": role.get('travel_percentage_max'),
                "budget_min_usd": role.get('budget_min_usd'),
                "budget_max_usd": role.get('budget_max_usd'),
                "years_experience_min": role.get('years_experience_min'),
                "years_experience_max": role.get('years_experience_max')
            },
            "_attributes_to_enrich": {
                "description": "TODO: Add role description",
                "role_type": "TODO: Specify role type",
                "leadership_level": "individual_contributor",
                "job_code": "TODO",
                "grade_level": None,
                "direct_reports_min": 0,
                "direct_reports_max": 0,
                "international_travel": False,
                "overnight_travel_frequency": "TODO",
                "budget_authority_type": "none",
                "budget_authority_limit": None
            },
            "_data_to_add": {
                "responsibilities": [],
                "kpis": [],
                "skills": [],
                "tools": [],
                "internal_stakeholders": [],
                "external_stakeholders": [],
                "therapeutic_areas": [],
                "company_sizes_applicable": [],
                "ai_maturity": {},
                "vpanes_scores": []
            },
            "_instructions": "Use the example from MEDICAL_AFFAIRS_ROLE_ENRICHMENT_TEMPLATE.json as a guide"
        }
        
        dept_template['roles'].append(role_template)
        total_roles += 1
    
    template['medical_affairs_enrichment_template']['departments'].append(dept_template)
    print(f"    ✓ {len(roles_data.data)} roles")

template['medical_affairs_enrichment_template']['metadata']['total_roles'] = total_roles

# Save template
output_file = 'MEDICAL_AFFAIRS_ENRICHMENT_WITH_IDS.json'
with open(output_file, 'w') as f:
    json.dump(template, f, indent=2)

print(f"\n✓ Template saved to: {output_file}")
print(f"\nSummary:")
print(f"  • Function: {function['name']}")
print(f"  • Departments: {len(departments_data.data)}")
print(f"  • Total Roles: {total_roles}")
print(f"\nNext Steps:")
print(f"  1. Open {output_file}")
print(f"  2. Use MEDICAL_AFFAIRS_ROLE_ENRICHMENT_TEMPLATE.json as a guide")
print(f"  3. Fill in all TODO fields for each role")
print(f"  4. Add responsibilities, KPIs, skills, tools, stakeholders, etc.")
print(f"  5. Run the import script to populate the database")
print("\n=====================================================================")

