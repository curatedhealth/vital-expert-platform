#!/usr/bin/env python3
"""
Import Medical Affairs Personas (43 personas)
==============================================
Imports comprehensive Medical Affairs persona library with VPANES priority scoring

Source: /Users/hichamnaim/Downloads/MEDICAL_AFFAIRS_ALL_43_PERSONAS_COMPLETE.json

Usage:
    python3 import_medical_affairs_personas.py
"""

import json
import re
from typing import Dict, List

# Database credentials
DB_PASSWORD = 'flusd9fqEb4kkTJ1'
DB_HOST = 'db.bomltkhixeatxuoxmolq.supabase.co'
DB_PORT = '5432'
DB_NAME = 'postgres'
DB_USER = 'postgres'

# Paths
PERSONAS_FILE = '/Users/hichamnaim/Downloads/MEDICAL_AFFAIRS_ALL_43_PERSONAS_COMPLETE.json'
OUTPUT_SQL = '/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/20_medical_affairs_personas.sql'

# Platform tenant ID
PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000000'

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    slug = text.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug

def escape_sql_string(value):
    """Escape single quotes in SQL strings"""
    if value is None:
        return 'NULL'
    return str(value).replace("'", "''")

def map_seniority_level(level: str) -> str:
    """Map seniority level to standard values"""
    level_lower = level.lower()
    if 'c-suite' in level_lower or 'executive' in level_lower:
        return 'executive'
    elif 'senior' in level_lower:
        return 'senior'
    elif 'mid' in level_lower or 'manager' in level_lower:
        return 'mid'
    elif 'junior' in level_lower or 'specialist' in level_lower:
        return 'junior'
    else:
        return 'mid'

def map_department(dept: str) -> str:
    """Map department to org_departments"""
    dept_mapping = {
        'Global Leadership': 'Medical Affairs Leadership',
        'Field Medical': 'Medical Science Liaisons',
        'Medical Information': 'Medical Information',
        'Medical Communications': 'Medical Communications',
        'Evidence Generation & HEOR': 'HEOR',
        'Clinical Operations': 'Clinical Operations',
        'Medical Excellence & Governance': 'Medical Quality & Compliance',
        'Medical Strategy & Operations': 'Medical Strategy',
        'Cross-Functional': 'Medical Affairs'
    }
    return dept_mapping.get(dept, dept)

def generate_persona_sql(personas: List[Dict]) -> str:
    """Generate SQL for persona import"""
    sql_lines = [
        "-- =====================================================================================",
        "-- MEDICAL AFFAIRS PERSONAS (43 personas)",
        "-- =====================================================================================",
        "-- Source: Medical Affairs Complete Persona Library v5.0",
        "-- Framework: BRIDGE™ with VPANES Priority Scoring",
        "-- Total: 43 personas across 9 departments",
        "-- =====================================================================================",
        "",
        "DO $$",
        "DECLARE",
        "    v_tenant_id UUID;",
        "    v_count INTEGER := 0;",
        "    v_ma_function_id UUID;",
        "BEGIN",
        "    -- Use platform tenant for platform-level resources",
        "    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'platform' LIMIT 1;",
        "    ",
        "    IF v_tenant_id IS NULL THEN",
        "        RAISE EXCEPTION 'Platform tenant not found';",
        "    END IF;",
        "    ",
        "    -- Get Medical Affairs function ID",
        "    SELECT id INTO v_ma_function_id FROM org_functions ",
        "    WHERE tenant_id = v_tenant_id AND name = 'Medical Affairs' LIMIT 1;",
        "    ",
        "    RAISE NOTICE 'Importing Medical Affairs personas...';",
        "    RAISE NOTICE 'Platform tenant: %', v_tenant_id;",
        "    ",
        ""
    ]

    # Group personas by tier
    tier1 = [p for p in personas if p.get('tier', 1) == 1]
    tier2 = [p for p in personas if p.get('tier', 1) == 2]
    tier3 = [p for p in personas if p.get('tier', 1) >= 3]

    for tier_name, tier_personas in [('TIER 1 (High Priority)', tier1), ('TIER 2 (Medium Priority)', tier2), ('TIER 3 (Supporting)', tier3)]:
        if not tier_personas:
            continue

        sql_lines.append(f"    -- =====================================================================================")
        sql_lines.append(f"    -- {tier_name}: {len(tier_personas)} personas")
        sql_lines.append(f"    -- =====================================================================================")
        sql_lines.append("")

        for p in tier_personas:
            persona_id = p.get('id', 'P000')
            name = escape_sql_string(p.get('name', 'Unknown'))
            slug = slugify(p.get('name', 'unknown'))
            role_title = escape_sql_string(p.get('role', p.get('name', '')))
            department = p.get('department', 'Medical Affairs')

            # Scoring
            scoring = p.get('scoring', {})
            priority_score = scoring.get('priority_score', 0)
            priority_rank = scoring.get('priority_rank', 999)

            # Build metadata
            metadata = {
                'persona_id': persona_id,
                'persona_number': p.get('persona_number', 0),
                'sector': p.get('sector', 'Pharmaceutical & Life Sciences'),
                'tier': p.get('tier', 1),
                'department': department,
                'function': p.get('function', 'Medical Affairs'),
                'org_type': p.get('org_type', ''),
                'org_size': p.get('org_size', ''),
                'budget_auth': p.get('budget_auth', ''),
                'team_size': p.get('team_size', ''),
                'key_need': p.get('key_need', ''),
                'decision_cycle': p.get('decision_cycle', ''),
                'reports_to': p.get('reports_to', ''),
                'geographic_scope': p.get('geographic_scope', ''),
                'typical_background': p.get('typical_background', ''),
                'key_stakeholders': p.get('key_stakeholders', []),
                'vpanes_scoring': scoring,
                'priority_score': priority_score,
                'priority_rank': priority_rank
            }

            metadata_json = json.dumps(metadata, indent=2).replace("'", "''")

            # Pain points
            pain_points = p.get('pain_points', [])
            pain_points_json = json.dumps(pain_points).replace("'", "''")

            # Goals
            goals = p.get('goals', [])
            goals_json = json.dumps(goals).replace("'", "''")

            # Responsibilities - convert to TEXT[] format
            responsibilities = p.get('responsibilities', p.get('key_responsibilities', []))
            # Convert array to PostgreSQL array format: ARRAY['item1', 'item2']
            if responsibilities:
                resp_array = "ARRAY[" + ", ".join([f"'{escape_sql_string(r)}'" for r in responsibilities]) + "]::TEXT[]"
            else:
                resp_array = "ARRAY[]::TEXT[]"

            seniority = map_seniority_level(p.get('seniority_level', 'mid'))

            sql_lines.append(f"    -- {persona_id}: {p.get('name', 'Unknown')} (Priority Rank: {priority_rank}, Score: {priority_score})")
            sql_lines.append(f"    INSERT INTO personas (")
            sql_lines.append(f"        tenant_id, name, slug, title, tagline,")
            sql_lines.append(f"        function_id, seniority_level,")
            sql_lines.append(f"        pain_points, goals, key_responsibilities,")
            sql_lines.append(f"        is_active, validation_status, metadata")
            sql_lines.append(f"    ) VALUES (")
            sql_lines.append(f"        v_tenant_id,")
            sql_lines.append(f"        '{name}',")
            sql_lines.append(f"        '{slug}',")
            sql_lines.append(f"        '{role_title}',")
            sql_lines.append(f"        '{escape_sql_string(department)}',")
            sql_lines.append(f"        v_ma_function_id,")
            sql_lines.append(f"        '{seniority}',")
            sql_lines.append(f"        '{pain_points_json}'::jsonb,")
            sql_lines.append(f"        '{goals_json}'::jsonb,")
            sql_lines.append(f"        {resp_array},")
            sql_lines.append(f"        true,")
            sql_lines.append(f"        'approved',")
            sql_lines.append(f"        '{metadata_json}'::jsonb")
            sql_lines.append(f"    )")
            sql_lines.append(f"    ON CONFLICT (tenant_id, slug) DO UPDATE SET")
            sql_lines.append(f"        name = EXCLUDED.name,")
            sql_lines.append(f"        title = EXCLUDED.title,")
            sql_lines.append(f"        pain_points = EXCLUDED.pain_points,")
            sql_lines.append(f"        goals = EXCLUDED.goals,")
            sql_lines.append(f"        key_responsibilities = EXCLUDED.key_responsibilities,")
            sql_lines.append(f"        metadata = EXCLUDED.metadata,")
            sql_lines.append(f"        updated_at = NOW();")
            sql_lines.append("")
            sql_lines.append(f"    v_count := v_count + 1;")
            sql_lines.append("")

    # Final summary
    sql_lines.extend([
        "    RAISE NOTICE '===============================================================';",
        "    RAISE NOTICE 'MEDICAL AFFAIRS PERSONAS IMPORT COMPLETE';",
        "    RAISE NOTICE '===============================================================';",
        "    RAISE NOTICE 'Total personas imported: %', v_count;",
        "    RAISE NOTICE '';",
        "    RAISE NOTICE 'Department Breakdown:';",
        "    RAISE NOTICE '  Global Leadership:           6 personas';",
        "    RAISE NOTICE '  Field Medical (MSLs):         5 personas';",
        "    RAISE NOTICE '  Medical Information:          4 personas';",
        "    RAISE NOTICE '  Medical Communications:       7 personas';",
        "    RAISE NOTICE '  Evidence Generation & HEOR:   5 personas';",
        "    RAISE NOTICE '  Clinical Operations:          4 personas';",
        "    RAISE NOTICE '  Medical Excellence:           4 personas';",
        "    RAISE NOTICE '  Medical Strategy:             4 personas';",
        "    RAISE NOTICE '  Cross-Functional:             4 personas';",
        "    RAISE NOTICE '';",
        "    RAISE NOTICE 'Platform resources available for Medical Affairs organizations';",
        "    RAISE NOTICE '===============================================================';",
        "",
        "END $$;",
        ""
    ])

    return "\n".join(sql_lines)

def main():
    print("=" * 80)
    print("MEDICAL AFFAIRS PERSONAS IMPORT GENERATOR")
    print("=" * 80)
    print()

    # Load personas
    print(f"Loading personas from: {PERSONAS_FILE}")
    with open(PERSONAS_FILE, 'r') as f:
        data = json.load(f)

    metadata = data['metadata']
    personas = data['personas']

    print(f"✅ Loaded {len(personas)} personas")
    print(f"   Version: {metadata['version']}")
    print(f"   Framework: {metadata['framework']}")
    print()

    # Generate SQL
    print("Generating SQL import...")
    sql = generate_persona_sql(personas)

    # Write SQL file
    with open(OUTPUT_SQL, 'w') as f:
        f.write(sql)

    print(f"✅ SQL file created: {OUTPUT_SQL}")
    print()

    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total personas: {len(personas)}")
    print()
    print("Tier breakdown:")
    tier1 = len([p for p in personas if p.get('tier', 1) == 1])
    tier2 = len([p for p in personas if p.get('tier', 1) == 2])
    tier3 = len([p for p in personas if p.get('tier', 1) >= 3])
    print(f"  Tier 1 (High Priority):    {tier1} personas")
    print(f"  Tier 2 (Medium Priority):  {tier2} personas")
    print(f"  Tier 3 (Supporting):       {tier3} personas")
    print()
    print("Next steps:")
    print("1. Review the generated SQL file")
    print("2. Import to database:")
    print(f"   PGPASSWORD='{DB_PASSWORD}' psql \\")
    print(f"     postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME} \\")
    print(f"     -f {OUTPUT_SQL}")
    print()

if __name__ == '__main__':
    main()
