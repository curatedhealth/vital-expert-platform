#!/usr/bin/env python3
"""
Import Digital Health JTBDs (110 JTBDs)
========================================
Imports Digital Health JTBD library with opportunity scores

Source: /Users/hichamnaim/Downloads/Cursor/VITAL path/data/dh_jtbd_library_enhanced_20251108_192510.json

Usage:
    python3 import_dh_jtbds.py
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
DH_FILE = '/Users/hichamnaim/Downloads/Cursor/VITAL path/data/dh_jtbd_library_enhanced_20251108_192510.json'
OUTPUT_SQL = '/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/22_digital_health_jtbds.sql'

# Platform tenant ID
PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000000'

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
    return slug[:100]

def map_frequency(freq_str: str) -> str:
    """Map frequency string to ENUM value"""
    if not freq_str:
        return 'monthly'

    freq_lower = freq_str.lower()

    if 'daily' in freq_lower:
        return 'daily'
    elif 'week' in freq_lower:
        return 'weekly'
    elif 'month' in freq_lower:
        return 'monthly'
    elif 'quarter' in freq_lower:
        return 'quarterly'
    elif 'annual' in freq_lower or 'year' in freq_lower:
        return 'annually'

    return 'monthly'

def parse_importance(imp_str: str) -> int:
    """Parse importance score from string like '10/10'"""
    if not imp_str:
        return 5
    if isinstance(imp_str, int):
        return min(10, max(1, imp_str))

    # Parse "10/10" format
    if '/' in str(imp_str):
        try:
            return int(str(imp_str).split('/')[0])
        except:
            return 5

    try:
        return int(imp_str)
    except:
        return 5

def map_functional_area(statement: str, persona_title: str) -> str:
    """Map JTBD to functional area"""
    text = (statement + ' ' + persona_title).lower()

    if any(kw in text for kw in ['patient', 'adherence', 'engagement', 'support']):
        return 'Commercial'
    elif any(kw in text for kw in ['clinical', 'trial', 'evidence', 'study']):
        return 'Clinical'
    elif any(kw in text for kw in ['regulatory', 'compliance', 'fda', 'submission']):
        return 'Regulatory'
    elif any(kw in text for kw in ['market access', 'payer', 'heor', 'reimbursement']):
        return 'Market Access'
    elif any(kw in text for kw in ['medical affairs', 'msl', 'scientific']):
        return 'Medical Affairs'
    elif any(kw in text for kw in ['digital', 'platform', 'technology', 'data', 'analytics']):
        return 'IT/Digital'

    return 'Operations'

def map_complexity(importance: int, satisfaction: int, opportunity_score: int) -> str:
    """Map to complexity based on scores"""
    if opportunity_score >= 16:
        return 'very_high'
    elif opportunity_score >= 14:
        return 'high'
    elif opportunity_score >= 12:
        return 'medium'
    else:
        return 'low'

def map_category(statement: str) -> str:
    """Map JTBD to category using valid enum values"""
    text = statement.lower()

    if any(kw in text for kw in ['strategy', 'roadmap', 'planning', 'ecosystem']):
        return 'strategic'
    elif any(kw in text for kw in ['compliance', 'regulatory', 'privacy', 'security', 'audit', 'quality']):
        return 'administrative'  # Changed from 'compliance'
    elif any(kw in text for kw in ['innovation', 'design', 'develop', 'create', 'research']):
        return 'creative'  # Changed from 'innovation'
    elif any(kw in text for kw in ['analysis', 'analytics', 'insights', 'data']):
        return 'analytical'
    elif any(kw in text for kw in ['implement', 'execute', 'delivery', 'deploy']):
        return 'tactical'
    elif any(kw in text for kw in ['collaboration', 'coordination', 'partnership', 'engagement']):
        return 'collaborative'
    elif any(kw in text for kw in ['technical', 'system', 'infrastructure', 'platform', 'digital', 'technology']):
        return 'technical'

    return 'operational'

def generate_jtbd_sql(jtbds_by_persona: List[Dict]) -> str:
    """Generate SQL for JTBD import"""
    sql_lines = [
        "-- =====================================================================================",
        "-- DIGITAL HEALTH JTBDs (110 JTBDs)",
        "-- =====================================================================================",
        "-- Source: Digital Health JTBD Library Complete v1.0",
        "-- Total: 110 JTBDs across 66 personas",
        "-- Includes: Opportunity scores and success metrics",
        "-- =====================================================================================",
        "",
        "DO $$",
        "DECLARE",
        "    v_tenant_id UUID;",
        "    v_count INTEGER := 0;",
        "BEGIN",
        "    -- Use platform tenant for platform-level resources",
        "    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'platform' LIMIT 1;",
        "    ",
        "    IF v_tenant_id IS NULL THEN",
        "        RAISE EXCEPTION 'Platform tenant not found';",
        "    END IF;",
        "    ",
        "    RAISE NOTICE 'Importing Digital Health JTBDs...';",
        "    RAISE NOTICE 'Platform tenant: %', v_tenant_id;",
        "    ",
        ""
    ]

    jtbd_counter = 0
    for persona in jtbds_by_persona:
        persona_title = persona.get('persona_title', '')
        jobs = persona.get('jobs_to_be_done', [])

        for job in jobs:
            jtbd_counter += 1

            code = job.get('jtbd_code', f"DH_{jtbd_counter:03d}")
            statement = escape_sql_string(job.get('statement', ''))
            frequency = map_frequency(job.get('frequency', ''))

            importance = parse_importance(job.get('importance', '5/10'))
            satisfaction = parse_importance(job.get('current_satisfaction', '3/10'))
            opportunity_score = parse_importance(job.get('opportunity_score', '12'))

            functional_area = map_functional_area(statement, persona_title)
            complexity = map_complexity(importance, satisfaction, opportunity_score)
            category = map_category(statement)

            # Calculate validation score
            validation_score = min(1.0, opportunity_score / 20)

            # Success metrics
            success_metrics = job.get('success_metrics', [])
            if success_metrics:
                success_criteria = "ARRAY[" + ", ".join([f"'{escape_sql_string(m)}'" for m in success_metrics[:5]]) + "]::TEXT[]"
            else:
                success_criteria = "ARRAY[]::TEXT[]"

            # Build metadata
            metadata = {
                'jtbd_id': job.get('jtbd_id', ''),
                'unique_id': job.get('unique_id', ''),
                'original_id': job.get('original_id', ''),
                'persona_title': persona_title,
                'importance': importance,
                'current_satisfaction': satisfaction,
                'opportunity_score': opportunity_score,
                'source': 'Digital Health JTBD Library v1.0'
            }

            metadata_json = json.dumps(metadata, indent=2).replace("'", "''")

            sql_lines.append(f"    -- {code}: {statement[:80]}...")
            sql_lines.append(f"    INSERT INTO jobs_to_be_done (")
            sql_lines.append(f"        tenant_id, code, name, description,")
            sql_lines.append(f"        functional_area, job_category, complexity, frequency,")
            sql_lines.append(f"        success_criteria,")
            sql_lines.append(f"        status, validation_score, metadata")
            sql_lines.append(f"    ) VALUES (")
            sql_lines.append(f"        v_tenant_id,")
            sql_lines.append(f"        '{code}',")
            sql_lines.append(f"        '{escape_sql_string(persona_title[:100])}',")
            sql_lines.append(f"        '{statement}',")
            sql_lines.append(f"        '{functional_area}',")
            sql_lines.append(f"        '{category}',")
            sql_lines.append(f"        '{complexity}',")
            sql_lines.append(f"        '{frequency}',")
            sql_lines.append(f"        {success_criteria},")
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
            sql_lines.append(f"        validation_score = EXCLUDED.validation_score,")
            sql_lines.append(f"        metadata = EXCLUDED.metadata,")
            sql_lines.append(f"        updated_at = NOW();")
            sql_lines.append("")
            sql_lines.append(f"    v_count := v_count + 1;")
            sql_lines.append("")

    # Final summary
    sql_lines.extend([
        "    RAISE NOTICE '===============================================================';",
        "    RAISE NOTICE 'DIGITAL HEALTH JTBDs IMPORT COMPLETE';",
        "    RAISE NOTICE '===============================================================';",
        "    RAISE NOTICE 'Total JTBDs imported: %', v_count;",
        "    RAISE NOTICE '';",
        "    RAISE NOTICE 'Category Breakdown:';",
        "    RAISE NOTICE '  Patient Solutions & Services:  ~20 JTBDs';",
        "    RAISE NOTICE '  Clinical & Evidence:           ~25 JTBDs';",
        "    RAISE NOTICE '  Digital Product & Platform:    ~30 JTBDs';",
        "    RAISE NOTICE '  Commercial & Market Access:    ~20 JTBDs';",
        "    RAISE NOTICE '  Regulatory & Compliance:       ~15 JTBDs';",
        "    RAISE NOTICE '';",
        "    RAISE NOTICE 'Platform resources available for Digital Health organizations';",
        "    RAISE NOTICE '===============================================================';",
        "",
        "END $$;",
        ""
    ])

    return "\n".join(sql_lines)

def main():
    print("=" * 80)
    print("DIGITAL HEALTH JTBDs IMPORT GENERATOR")
    print("=" * 80)
    print()

    # Load data
    print(f"Loading JTBDs from: {DH_FILE}")
    with open(DH_FILE, 'r') as f:
        data = json.load(f)

    metadata = data['metadata']
    personas = data['personas']

    # Count total JTBDs
    total_jtbds = sum(len(p.get('jobs_to_be_done', [])) for p in personas)

    print(f"✅ Loaded {total_jtbds} JTBDs from {len(personas)} personas")
    print(f"   Version: {metadata['source']}")
    print()

    # Generate SQL
    print("Generating SQL import...")
    sql = generate_jtbd_sql(personas)

    # Write SQL file
    with open(OUTPUT_SQL, 'w') as f:
        f.write(sql)

    print(f"✅ SQL file created: {OUTPUT_SQL}")
    print()

    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total JTBDs: {total_jtbds}")
    print(f"From personas: {len(personas)}")
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
