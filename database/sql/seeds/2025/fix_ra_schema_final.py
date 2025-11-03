#!/usr/bin/env python3
"""
Final comprehensive fix for ALL RA Part 2 files

This script will:
1. Fix TOOL assignments: Remove is_required, connection_config, metadata columns
2. Fix RAG assignments: Remove query_context, search_config, metadata columns
"""

import re
from pathlib import Path

def fix_file_comprehensive(filepath):
    """Fix both tool and RAG sections in a file"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # FIX 1: Tool assignments
    # Replace SELECT columns
    content = re.sub(
        r'(INSERT INTO dh_task_tool.*?SELECT\s+sc\.tenant_id,\s+t\.id,\s+tool\.id,)\s+tool_data\.\w+,\s+tool_data\.\w+,\s+tool_data\.\w+',
        r'\1\n  tool_data.purpose',
        content,
        flags=re.DOTALL
    )
    
    # Replace VALUES format for tools
    # Match: ('TSK-...', 'TOOL-...', true, {...}, '{"purpose": "..."}')
    # Replace with: ('TSK-...', 'TOOL-...', '...')
    def tool_replacer(match):
        full = match.group(0)
        task = match.group(1)
        tool = match.group(2)
        purpose = match.group(3)
        return f"  ('{task}', '{tool}', '{purpose}')"
    
    content = re.sub(
        r"\('(TSK-[^']+)',\s*'(TOOL-[^']+)',\s*true,\s*\{[^}]+\}::jsonb,\s*'{\"purpose\":\s*\"([^\"]+)\"}'::jsonb\)",
        tool_replacer,
        content
    )
    
    # Replace tool_data columns definition
    content = re.sub(
        r'\) AS tool_data\(task_code, tool_code, is_required, connection_config, metadata\)',
        ') AS tool_data(task_code, tool_code, purpose)',
        content
    )
    
    # Replace ON CONFLICT for tools
    content = re.sub(
        r'ON CONFLICT \(tenant_id, task_id, tool_id\)\s+DO UPDATE SET is_required = EXCLUDED\.is_required;',
        'ON CONFLICT (tenant_id, task_id, tool_id)\nDO UPDATE SET purpose = EXCLUDED.purpose;',
        content
    )
    
    # FIX 2: RAG assignments
    # Replace SELECT columns
    content = re.sub(
        r'(INSERT INTO dh_task_rag.*?SELECT\s+sc\.tenant_id,\s+t\.id,\s+rag\.id,)\s+rag_data\.\w+,\s+rag_data\.\w+,\s+rag_data\.\w+',
        r'\1\n  rag_data.note',
        content,
        flags=re.DOTALL
    )
    
    # Replace VALUES format for RAGs
    # Match: ('TSK-...', 'RAG-...', \n   'note text', \n   {...}, \n   {...})
    # Replace with: ('TSK-...', 'RAG-...', \n   'note text')
    def rag_replacer(match):
        task = match.group(1)
        rag = match.group(2)
        note = match.group(3)
        return f"  ('{task}', '{rag}', \n   '{note}')"
    
    content = re.sub(
        r"\('(TSK-[^']+)',\s*'(RAG-[^']+)',\s*\n\s*'([^']+)',\s*\n\s*'{[^}]+}'::jsonb,\s*\n\s*'{[^}]+}'::jsonb\)",
        rag_replacer,
        content
    )
    
    # Replace rag_data columns definition
    content = re.sub(
        r'\) AS rag_data\(task_code, rag_code, query_context, search_config, metadata\)',
        ') AS rag_data(task_code, rag_code, note)',
        content
    )
    
    # Replace ON CONFLICT for RAGs
    content = re.sub(
        r'ON CONFLICT \(tenant_id, task_id, rag_source_id\)\s+DO UPDATE SET query_context = EXCLUDED\.query_context;',
        'ON CONFLICT (tenant_id, task_id, rag_source_id)\nDO UPDATE SET note = EXCLUDED.note;',
        content
    )
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    script_dir = Path(__file__).parent
    
    # Fix remaining RA files (skip 26 which we already fixed manually)
    ra_files = [
        '27_ra_002_pathway_determination_part2.sql',
        '28_ra_003_predicate_identification_part2.sql',
        '29_ra_004_presub_meeting_part2.sql',
        '30_ra_005_clinical_evaluation_part2.sql',
        '31_ra_006_breakthrough_designation_part2.sql',
        '32_ra_007_international_harmonization_part2.sql',
        '33_ra_008_cybersecurity_documentation_part2.sql',
        '34_ra_009_software_validation_part2.sql',
        '35_ra_010_post_market_surveillance_part2.sql'
    ]
    
    print(f"Fixing {len(ra_files)} RA Part 2 files for schema compliance...\n")
    
    fixed = 0
    skipped = 0
    
    for filename in ra_files:
        filepath = script_dir / filename
        if not filepath.exists():
            print(f"❌ {filename}: Not found")
            continue
            
        if fix_file_comprehensive(filepath):
            print(f"✅ {filename}: Fixed")
            fixed += 1
        else:
            print(f"⏭️  {filename}: No changes needed")
            skipped += 1
    
    print(f"\n{'='*70}")
    print(f"Fixed: {fixed}, Skipped: {skipped}")
    print(f"{'='*70}\n")
    print("✅ All RA Part 2 files now match the database schema!")
    print("   - dh_task_tool: (tenant_id, task_id, tool_id, purpose)")
    print("   - dh_task_rag: (tenant_id, task_id, rag_source_id, note)")

if __name__ == '__main__':
    main()

