#!/usr/bin/env python3
"""
Seed File Transformation Script
Transforms OLD DB seed files to NEW DB schema
- Changes table names (dh_agent -> agents, dh_personas -> personas)
- Updates tenant references to use digital-health-startup tenant ID
- Adapts SQL syntax to match NEW DB schema
"""

import os
import re
from pathlib import Path

# Configuration
SEEDS_DIR = Path("/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025")
OUTPUT_DIR = SEEDS_DIR / "transformed"
DIGITAL_HEALTH_STARTUP_TENANT_ID = "11111111-1111-1111-1111-111111111111"

# Table name mappings: OLD DB -> NEW DB
TABLE_MAPPINGS = {
    'dh_agent': 'agents',
    'dh_agents': 'agents',
    'dh_persona': 'personas',
    'dh_personas': 'personas',
    'dh_tool': 'tools',
    'dh_tools': 'tools',
    'dh_prompt': 'prompts',
    'dh_prompts': 'prompts',
    'dh_knowledge_domain': 'knowledge_domains',
    'dh_knowledge_domains': 'knowledge_domains',
    'dh_jtbd': 'jobs_to_be_done',
    'jobs_to_be_done': 'jobs_to_be_done',
}

# Tenant slug mappings
TENANT_SLUG_REPLACEMENTS = {
    'digital-health-startup': DIGITAL_HEALTH_STARTUP_TENANT_ID,
    'platform': DIGITAL_HEALTH_STARTUP_TENANT_ID,  # Map platform tenant to digital-health-startup
}

def transform_sql_content(content: str, filename: str) -> str:
    """
    Transform SQL content to match NEW DB schema
    """
    original = content

    # Step 1: Replace table names
    for old_table, new_table in TABLE_MAPPINGS.items():
        # Case-insensitive replacement for INSERT INTO, FROM, etc.
        content = re.sub(
            rf'\bINSERT\s+INTO\s+{old_table}\b',
            f'INSERT INTO {new_table}',
            content,
            flags=re.IGNORECASE
        )
        content = re.sub(
            rf'\bFROM\s+{old_table}\b',
            f'FROM {new_table}',
            content,
            flags=re.IGNORECASE
        )
        content = re.sub(
            rf'\bUPDATE\s+{old_table}\b',
            f'UPDATE {new_table}',
            content,
            flags=re.IGNORECASE
        )
        content = re.sub(
            rf'\bJOIN\s+{old_table}\b',
            f'JOIN {new_table}',
            content,
            flags=re.IGNORECASE
        )

    # Step 2: Replace tenant slug lookups with actual tenant ID
    # Find patterns like: WHERE slug = 'digital-health-startup'
    # Replace with: WHERE id = '11111111-1111-1111-1111-111111111111'
    for slug, tenant_id in TENANT_SLUG_REPLACEMENTS.items():
        # Replace in tenant lookups
        content = re.sub(
            rf"WHERE\s+slug\s*=\s*'{slug}'",
            f"WHERE id = '{tenant_id}'",
            content,
            flags=re.IGNORECASE
        )

        # Replace in DO blocks - variable declaration
        content = re.sub(
            rf"v_tenant_slug\s+TEXT\s*:=\s*'{slug}'",
            f"v_tenant_id UUID := '{tenant_id}'::uuid",
            content,
            flags=re.IGNORECASE
        )

        # Direct tenant_id assignments
        content = re.sub(
            rf"tenant_id\s*=\s*\(SELECT id FROM tenants WHERE slug = '{slug}'\)",
            f"tenant_id = '{tenant_id}'::uuid",
            content,
            flags=re.IGNORECASE
        )

    # Step 3: Fix DECLARE blocks - remove v_tenant_slug, keep only v_tenant_id
    content = re.sub(
        r'DECLARE\s+v_tenant_id\s+UUID;\s+v_tenant_id\s+UUID\s*:=',
        f"DECLARE\n  v_tenant_id UUID :=",
        content,
        flags=re.IGNORECASE | re.DOTALL
    )

    # Remove standalone v_tenant_slug declarations
    content = re.sub(
        r'v_tenant_slug\s+TEXT;',
        '',
        content,
        flags=re.IGNORECASE
    )

    # Step 4: Replace old column names with NEW DB schema columns
    # Agents table: code -> slug, unique_id -> removed, agent_type -> removed, framework -> removed
    # Personas table: code -> slug, unique_id -> removed
    # jobs_to_be_done table: KEEP code (do NOT change to slug)

    # Replace 'code' column with 'slug' ONLY for agents and personas tables
    # Check if this is a JTBD file - if so, skip the code->slug replacement
    is_jtbd_file = 'jtbd' in filename.lower() or 'jobs_to_be_done' in filename.lower()

    if not is_jtbd_file:
        # Replace 'code' column with 'slug' in column lists (for agents/personas)
        content = re.sub(
            r'\bcode\s*,',
            'slug,',
            content,
            flags=re.IGNORECASE
        )

    # Remove 'unique_id' column (not needed, slug is sufficient)
    content = re.sub(
        r',?\s*unique_id\s*,',
        ',',
        content,
        flags=re.IGNORECASE
    )

    # Remove 'agent_type' column (doesn't exist in NEW DB)
    content = re.sub(
        r',?\s*agent_type\s*,',
        ',',
        content,
        flags=re.IGNORECASE
    )

    # Remove 'framework' column (doesn't exist in NEW DB)
    content = re.sub(
        r',?\s*framework\s*,',
        ',',
        content,
        flags=re.IGNORECASE
    )

    # Remove 'autonomy_level' column (doesn't exist in NEW DB)
    content = re.sub(
        r',?\s*autonomy_level\s*,',
        ',',
        content,
        flags=re.IGNORECASE
    )

    # Remove 'model_config' column (NEW DB uses base_model, temperature, max_tokens separately)
    content = re.sub(
        r',?\s*model_config\s*,',
        ',',
        content,
        flags=re.IGNORECASE
    )

    # Replace 'capabilities' with 'specializations'
    content = re.sub(
        r'\bcapabilities\s*,',
        'specializations,',
        content,
        flags=re.IGNORECASE
    )

    # Step 5: Fix tenant ID selection in DO blocks
    content = re.sub(
        r'SELECT id INTO v_tenant_id\s+FROM tenants\s+WHERE slug = v_tenant_slug;',
        f"-- Tenant ID directly assigned",
        content,
        flags=re.IGNORECASE
    )

    # Remove references to v_tenant_slug in RAISE statements
    content = re.sub(
        r"RAISE NOTICE 'Using tenant: % \(ID: %\)', v_tenant_slug, v_tenant_id;",
        f"RAISE NOTICE 'Using tenant: digital-health-startup (ID: %)', v_tenant_id;",
        content,
        flags=re.IGNORECASE
    )

    content = re.sub(
        r'RAISE EXCEPTION \'Tenant with slug "%" not found\. Please create tenant first\.\', v_tenant_slug;',
        f"RAISE EXCEPTION 'Tenant with ID {DIGITAL_HEALTH_STARTUP_TENANT_ID} not found. Please create tenant first.';",
        content,
        flags=re.IGNORECASE
    )

    # Step 5: Add header comment
    header = f"""-- =====================================================================================
-- TRANSFORMED FOR NEW DB (Vital-expert)
-- Original file: {filename}
-- Transformed: {Path(__file__).name}
-- Target tenant: digital-health-startup ({DIGITAL_HEALTH_STARTUP_TENANT_ID})
-- =====================================================================================

"""

    if not content.startswith('-- ====='):
        content = header + content

    return content

def transform_file(input_path: Path, output_path: Path):
    """Transform a single SQL file"""
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()

        transformed = transform_sql_content(content, input_path.name)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(transformed)

        return True
    except Exception as e:
        print(f"❌ Error transforming {input_path.name}: {e}")
        return False

def main():
    print("=" * 80)
    print("🔄 Seed File Transformation Tool")
    print("=" * 80)
    print(f"Source directory: {SEEDS_DIR}")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Target tenant ID: {DIGITAL_HEALTH_STARTUP_TENANT_ID}")
    print()

    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Files to transform
    files_to_transform = [
        "00_foundation_agents.sql",
        "01_foundation_personas.sql",
        "02_COMPREHENSIVE_TOOLS_ALL.sql",
        "05_COMPREHENSIVE_PROMPTS_ALL.sql",
        "06_COMPREHENSIVE_KNOWLEDGE_DOMAINS_ALL.sql",
        "20_medical_affairs_personas.sql",
        "21_phase2_jtbds.sql",
        "22_digital_health_jtbds.sql",
    ]

    success_count = 0
    failed_count = 0

    print("Transforming files...")
    print("-" * 80)

    for filename in files_to_transform:
        input_path = SEEDS_DIR / filename
        output_path = OUTPUT_DIR / filename

        if not input_path.exists():
            print(f"⚠️  {filename:<50} NOT FOUND")
            continue

        print(f"📝 {filename:<50} ", end="")

        if transform_file(input_path, output_path):
            print("✅")
            success_count += 1
        else:
            print("❌")
            failed_count += 1

    print("-" * 80)
    print()
    print("=" * 80)
    print("📊 TRANSFORMATION SUMMARY")
    print("=" * 80)
    print(f"✅ Successfully transformed: {success_count}")
    print(f"❌ Failed:                   {failed_count}")
    print()
    print(f"Transformed files saved to: {OUTPUT_DIR}")
    print()

    if success_count > 0:
        print("🎉 Transformation complete!")
        print()
        print("Next steps:")
        print(f"1. Review transformed files in: {OUTPUT_DIR}")
        print("2. Run the transformed seed files:")
        print()
        print(f"   cd {OUTPUT_DIR}")
        print("   for file in *.sql; do")
        print(f"     PGPASSWORD='flusd9fqEb4kkTJ1' psql \\")
        print(f"       postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \\")
        print(f"       -f \"$file\"")
        print("   done")
        print()

    return success_count, failed_count

if __name__ == "__main__":
    success, failed = main()
    exit(0 if failed == 0 else 1)
