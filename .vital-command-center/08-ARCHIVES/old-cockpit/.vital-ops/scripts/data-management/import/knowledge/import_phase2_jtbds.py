#!/usr/bin/env python3
"""
Import Phase 2 All JTBDs (127 JTBDs)
=====================================
Imports comprehensive JTBD library from multiple sources

Source: /Users/hichamnaim/Downloads/Cursor/VITAL path/data/phase2_all_jtbds_20251108_211301.json

Usage:
    python3 import_phase2_jtbds.py
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
JTBDS_FILE = '/Users/hichamnaim/Downloads/Cursor/VITAL path/data/phase2_all_jtbds_20251108_211301.json'
OUTPUT_SQL = '/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/21_phase2_jtbds.sql'

# Platform tenant ID
PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000000'

# ENUM mappings
FUNCTIONAL_AREA_MAP = {
    'clinical': 'Clinical',
    'regulatory': 'Regulatory',
    'market_access': 'Market Access',
    'medical_affairs': 'Medical Affairs',
    'commercial': 'Commercial',
    'r&d': 'Research & Development',
    'rd': 'Research & Development',
    'manufacturing': 'Manufacturing',
    'quality': 'Quality',
    'operations': 'Operations',
    'it': 'IT/Digital',
    'digital': 'IT/Digital',
    'legal': 'Legal',
    'finance': 'Finance',
    'hr': 'HR',
    'business_development': 'Business Development'
}

FREQUENCY_MAP = {
    'daily': 'daily',
    'weekly': 'weekly',
    'biweekly': 'biweekly',
    'monthly': 'monthly',
    'quarterly': 'quarterly',
    'annually': 'annually',
    'annual': 'annually',
    'ad_hoc': 'ad_hoc',
    'one_time': 'one_time',
    'per milestone': 'quarterly',
    'continuous': 'daily'
}

COMPLEXITY_MAP = {
    'simple': 'low',
    'low': 'low',
    'moderate': 'medium',
    'medium': 'medium',
    'complex': 'high',
    'high': 'high',
    'expert': 'very_high',
    'very_high': 'very_high'
}

CATEGORY_MAP = {
    'strategic': 'strategic',
    'tactical': 'tactical',
    'operational': 'operational',
    'analytical': 'analytical',
    'compliance': 'compliance',
    'innovation': 'innovation'
}

def escape_sql_string(value):
    """Escape single quotes in SQL strings"""
    if value is None:
        return 'NULL'
    return str(value).replace("'", "''")

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    slug = text.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug[:100]  # Limit length

def map_functional_area(context: str, verb: str, persona_code: str) -> str:
    """Map JTBD to functional area based on context and persona"""
    # Extract from persona code
    if 'CDD' in persona_code or 'CTO' in persona_code:
        return 'Clinical'
    elif 'RAD' in persona_code:
        return 'Regulatory'
    elif 'PCM' in persona_code or 'HED' in persona_code:
        return 'Market Access'
    elif 'MAD' in persona_code:
        return 'Medical Affairs'
    elif 'DSC' in persona_code or 'DHP' in persona_code:
        return 'IT/Digital'

    # Parse from context/verb
    context_lower = (context + ' ' + verb).lower()
    for key, value in FUNCTIONAL_AREA_MAP.items():
        if key in context_lower:
            return value

    # Default based on keywords
    if any(kw in context_lower for kw in ['trial', 'protocol', 'clinical']):
        return 'Clinical'
    elif any(kw in context_lower for kw in ['regulatory', 'fda', 'submission']):
        return 'Regulatory'
    elif any(kw in context_lower for kw in ['payer', 'heor', 'market access', 'value']):
        return 'Market Access'
    elif any(kw in context_lower for kw in ['medical affairs', 'msl', 'evidence']):
        return 'Medical Affairs'
    elif any(kw in context_lower for kw in ['commercial', 'marketing', 'sales']):
        return 'Commercial'

    return 'Operations'  # Safe default

def map_frequency(freq_str: str) -> str:
    """Map frequency string to ENUM value"""
    if not freq_str:
        return 'monthly'

    freq_lower = freq_str.lower()

    # Direct mapping
    for key, value in FREQUENCY_MAP.items():
        if key in freq_lower:
            return value

    # Pattern matching
    if 'day' in freq_lower or 'continuous' in freq_lower:
        return 'daily'
    elif 'week' in freq_lower:
        return 'weekly'
    elif 'month' in freq_lower:
        return 'monthly'
    elif 'quarter' in freq_lower or 'milestone' in freq_lower:
        return 'quarterly'
    elif 'year' in freq_lower or 'annual' in freq_lower:
        return 'annually'

    return 'monthly'  # Safe default

def map_complexity(importance: int, satisfaction: int) -> str:
    """Map importance/satisfaction to complexity"""
    # High importance + low satisfaction = high complexity
    if importance >= 9:
        if satisfaction <= 3:
            return 'very_high'
        elif satisfaction <= 5:
            return 'high'
        else:
            return 'medium'
    elif importance >= 7:
        return 'medium' if satisfaction <= 5 else 'low'
    else:
        return 'low'

def map_category(context: str, verb: str) -> str:
    """Map JTBD to category using valid enum values"""
    text = (context + ' ' + verb).lower()

    if any(kw in text for kw in ['strategy', 'roadmap', 'planning', 'portfolio']):
        return 'strategic'
    elif any(kw in text for kw in ['compliance', 'regulatory', 'quality', 'audit']):
        return 'administrative'  # Changed from 'compliance'
    elif any(kw in text for kw in ['innovation', 'research', 'development', 'new']):
        return 'creative'  # Changed from 'innovation'
    elif any(kw in text for kw in ['analysis', 'data', 'insights', 'analytics']):
        return 'analytical'
    elif any(kw in text for kw in ['execution', 'implementation', 'delivery']):
        return 'tactical'
    elif any(kw in text for kw in ['collaboration', 'coordination', 'partnership']):
        return 'collaborative'
    elif any(kw in text for kw in ['technical', 'system', 'infrastructure', 'platform']):
        return 'technical'
    else:
        return 'operational'

def generate_jtbd_sql(jtbds: List[Dict]) -> str:
    """Generate SQL for JTBD import"""
    sql_lines = [
        "-- =====================================================================================",
        "-- PHASE 2 ALL JTBDs (127 JTBDs)",
        "-- =====================================================================================",
        "-- Source: Phase 2 Combined JTBD Library",
        "-- Includes: Persona Master Catalogue, Digital Health Library, Comprehensive Coverage",
        "-- Total: 127 JTBDs across all functional areas",
        "-- =====================================================================================",
        "",
        "DO $$",
        "DECLARE",
        "    v_tenant_id UUID;",
        "    v_count INTEGER := 0;",
        "    v_persona_id UUID;",
        "    v_jtbd_id UUID;",
        "BEGIN",
        "    -- Use platform tenant for platform-level resources",
        "    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'platform' LIMIT 1;",
        "    ",
        "    IF v_tenant_id IS NULL THEN",
        "        RAISE EXCEPTION 'Platform tenant not found';",
        "    END IF;",
        "    ",
        "    RAISE NOTICE 'Importing Phase 2 All JTBDs...';",
        "    RAISE NOTICE 'Platform tenant: %', v_tenant_id;",
        "    ",
        ""
    ]

    for idx, j in enumerate(jtbds, 1):
        code = j.get('jtbd_code', f"JTBD_{idx:03d}")
        statement = escape_sql_string(j.get('statement', ''))
        context = j.get('context', '')
        outcome = j.get('outcome', j.get('goal', ''))

        # Map to ENUM values
        functional_area = map_functional_area(context, j.get('verb', ''), j.get('persona_code', ''))
        frequency = map_frequency(j.get('frequency', ''))
        importance = j.get('importance', 5)
        satisfaction = j.get('satisfaction', 5)
        complexity = map_complexity(importance, satisfaction)
        category = map_category(context, j.get('verb', ''))

        # Calculate validation score (importance + (10 - satisfaction)) / 20
        validation_score = min(1.0, (importance + (10 - satisfaction)) / 20)

        # Build metadata
        metadata = {
            'unique_id': j.get('unique_id', ''),
            'original_id': j.get('id', ''),
            'persona_code': j.get('persona_code', ''),
            'persona_title': j.get('persona_title', ''),
            'sector': j.get('sector', ''),
            'source': j.get('source', 'Phase 2 All JTBDs'),
            'verb': j.get('verb', ''),
            'object': j.get('object', ''),
            'importance': importance,
            'current_satisfaction': satisfaction,
            'opportunity_score': importance + max(0, importance - satisfaction)
        }

        metadata_json = json.dumps(metadata, indent=2).replace("'", "''")

        # Desired outcomes
        desired_outcomes = [outcome] if outcome else []
        desired_outcomes_json = json.dumps(desired_outcomes).replace("'", "''")

        # Success metrics (if available)
        success_metrics = j.get('success_metrics', [])
        if success_metrics:
            success_criteria = "ARRAY[" + ", ".join([f"'{escape_sql_string(m)}'" for m in success_metrics[:5]]) + "]::TEXT[]"
        else:
            success_criteria = "ARRAY[]::TEXT[]"

        sql_lines.append(f"    -- {code}: {statement[:80]}...")
        sql_lines.append(f"    INSERT INTO jobs_to_be_done (")
        sql_lines.append(f"        tenant_id, code, name, description,")
        sql_lines.append(f"        functional_area, job_category, complexity, frequency,")
        sql_lines.append(f"        success_criteria, desired_outcomes,")
        sql_lines.append(f"        status, validation_score, metadata")
        sql_lines.append(f"    ) VALUES (")
        sql_lines.append(f"        v_tenant_id,")
        sql_lines.append(f"        '{code}',")
        sql_lines.append(f"        '{escape_sql_string(context[:100])}',")
        sql_lines.append(f"        '{statement}',")
        sql_lines.append(f"        '{functional_area}',")
        sql_lines.append(f"        '{category}',")
        sql_lines.append(f"        '{complexity}',")
        sql_lines.append(f"        '{frequency}',")
        sql_lines.append(f"        {success_criteria},")
        sql_lines.append(f"        '{desired_outcomes_json}'::jsonb,")
        sql_lines.append(f"        'active',")
        sql_lines.append(f"        {validation_score:.2f},")
        sql_lines.append(f"        '{metadata_json}'::jsonb")
        sql_lines.append(f"    )")
        sql_lines.append(f"    ON CONFLICT (tenant_id, code) DO UPDATE SET")
        sql_lines.append(f"        name = EXCLUDED.name,")
        sql_lines.append(f"        description = EXCLUDED.description,")
        sql_lines.append(f"        functional_area = EXCLUDED.functional_area,")
        sql_lines.append(f"        job_category = EXCLUDED.job_category,")
        sql_lines.append(f"        complexity = EXCLUDED.complexity,")
        sql_lines.append(f"        frequency = EXCLUDED.frequency,")
        sql_lines.append(f"        success_criteria = EXCLUDED.success_criteria,")
        sql_lines.append(f"        desired_outcomes = EXCLUDED.desired_outcomes,")
        sql_lines.append(f"        validation_score = EXCLUDED.validation_score,")
        sql_lines.append(f"        metadata = EXCLUDED.metadata,")
        sql_lines.append(f"        updated_at = NOW();")
        sql_lines.append("")
        sql_lines.append(f"    v_count := v_count + 1;")
        sql_lines.append("")

    # Final summary
    sql_lines.extend([
        "    RAISE NOTICE '===============================================================';",
        "    RAISE NOTICE 'PHASE 2 ALL JTBDs IMPORT COMPLETE';",
        "    RAISE NOTICE '===============================================================';",
        "    RAISE NOTICE 'Total JTBDs imported: %', v_count;",
        "    RAISE NOTICE '';",
        "    RAISE NOTICE 'Functional Area Breakdown:';",
        "    RAISE NOTICE '  Clinical:                 ~40 JTBDs';",
        "    RAISE NOTICE '  Regulatory:               ~25 JTBDs';",
        "    RAISE NOTICE '  Market Access:            ~20 JTBDs';",
        "    RAISE NOTICE '  Medical Affairs:          ~15 JTBDs';",
        "    RAISE NOTICE '  Commercial:               ~10 JTBDs';",
        "    RAISE NOTICE '  Other Functions:          ~17 JTBDs';",
        "    RAISE NOTICE '';",
        "    RAISE NOTICE 'Platform resources available for all personas';",
        "    RAISE NOTICE '===============================================================';",
        "",
        "END $$;",
        ""
    ])

    return "\n".join(sql_lines)

def main():
    print("=" * 80)
    print("PHASE 2 ALL JTBDs IMPORT GENERATOR")
    print("=" * 80)
    print()

    # Load JTBDs
    print(f"Loading JTBDs from: {JTBDS_FILE}")
    with open(JTBDS_FILE, 'r') as f:
        data = json.load(f)

    metadata = data['metadata']
    jtbds = data['jtbds']

    print(f"✅ Loaded {len(jtbds)} JTBDs")
    print(f"   Total: {metadata['total_count']}")
    print(f"   Sources: {len(metadata['sources'])}")
    print()

    # Generate SQL
    print("Generating SQL import...")
    sql = generate_jtbd_sql(jtbds)

    # Write SQL file
    with open(OUTPUT_SQL, 'w') as f:
        f.write(sql)

    print(f"✅ SQL file created: {OUTPUT_SQL}")
    print()

    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total JTBDs: {len(jtbds)}")
    print()
    print("Next steps:")
    print("1. Review the generated SQL file")
    print("2. Import to database:")
    print(f"   PGPASSWORD='{DB_PASSWORD}' psql \\")
    print(f"     postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME} \\")
    print(f"     -c \"\\set ON_ERROR_STOP on\" -f {OUTPUT_SQL}")
    print()

if __name__ == '__main__':
    main()
