#!/usr/bin/env python3
"""
Fix ON CONFLICT clauses to match actual UNIQUE constraints

Actual constraints:
- dh_task_tool: UNIQUE (task_id, tool_id) - no tenant_id!
- dh_task_rag: UNIQUE (task_id, rag_source_id) - no tenant_id!
"""

import re
from pathlib import Path

def fix_on_conflict(filepath):
    """Fix ON CONFLICT clauses in a file"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Fix tool ON CONFLICT
    content = re.sub(
        r'ON CONFLICT \(tenant_id, task_id, tool_id\)',
        'ON CONFLICT (task_id, tool_id)',
        content
    )
    
    # Fix RAG ON CONFLICT
    content = re.sub(
        r'ON CONFLICT \(tenant_id, task_id, rag_source_id\)',
        'ON CONFLICT (task_id, rag_source_id)',
        content
    )
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    script_dir = Path(__file__).parent
    
    # Fix all RA Part 2 files
    ra_files = sorted(script_dir.glob('*_ra_*_part2.sql'))
    
    print(f"Fixing ON CONFLICT clauses in {len(ra_files)} files...\n")
    
    fixed = 0
    unchanged = 0
    
    for filepath in ra_files:
        if fix_on_conflict(filepath):
            print(f"✅ {filepath.name}: Fixed")
            fixed += 1
        else:
            print(f"⏭️  {filepath.name}: No changes needed")
            unchanged += 1
    
    print(f"\n{'='*70}")
    print(f"Fixed: {fixed}, Unchanged: {unchanged}")
    print(f"{'='*70}\n")
    print("✅ ON CONFLICT clauses now match UNIQUE constraints:")
    print("   - dh_task_tool: ON CONFLICT (task_id, tool_id)")
    print("   - dh_task_rag: ON CONFLICT (task_id, rag_source_id)")

if __name__ == '__main__':
    main()

