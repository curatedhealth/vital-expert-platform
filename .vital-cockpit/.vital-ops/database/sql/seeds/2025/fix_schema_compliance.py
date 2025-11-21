#!/usr/bin/env python3
"""
Fix all RA seed files to match actual database schema
Issues to fix:
1. dh_task_tool: Remove 'is_required', 'connection_config', 'metadata' - only has 'purpose'
2. dh_task_rag: Remove 'query_context', 'search_config', 'metadata' - only has 'note'
"""

import re
from pathlib import Path

def fix_tool_assignments(content):
    """Fix dh_task_tool INSERT statements"""
    # Pattern for tool assignments
    tool_pattern = r'INSERT INTO dh_task_tool \(\s*tenant_id,\s*task_id,\s*tool_id,.*?\)'
    
    # Replace with correct schema
    fixed = re.sub(
        tool_pattern,
        'INSERT INTO dh_task_tool (\n  tenant_id, task_id, tool_id, purpose\n)',
        content,
        flags=re.DOTALL
    )
    
    # Fix the VALUES section for tools - extract purpose from metadata
    # Pattern: ('TASK', 'TOOL', true, {...}, '{"purpose": "..."}')
    # Replace with: ('TASK', 'TOOL', 'purpose text')
    
    # Find tool assignment sections
    tool_section_pattern = r'(INSERT INTO dh_task_tool.*?VALUES\s*\((.*?)\)\s*AS tool_data.*?ON CONFLICT)'
    
    def fix_tool_values(match):
        full_match = match.group(0)
        values_section = match.group(2)
        
        # Parse each VALUE tuple
        # ('TSK-...', 'TOOL-...', true, '{...}'::jsonb, '{"purpose": "..."}')
        # Extract just task_code, tool_code, and purpose text
        value_pattern = r"\('(TSK-[^']+)',\s*'(TOOL-[^']+)',\s*[^,]+,\s*[^,]+,\s*'{\"purpose\":\s*\"([^\"]+)\"}'::jsonb\)"
        
        new_values = []
        for value_match in re.finditer(value_pattern, values_section):
            task_code = value_match.group(1)
            tool_code = value_match.group(2)
            purpose = value_match.group(3)
            new_values.append(f"  ('{task_code}', '{tool_code}', '{purpose}')")
        
        if new_values:
            new_values_str = ',\n'.join(new_values)
            # Reconstruct the INSERT
            return full_match.replace(
                f'({values_section})',
                f'(\n{new_values_str}\n)'
            ).replace(
                'AS tool_data(task_code, tool_code, is_required, connection_config, metadata)',
                'AS tool_data(task_code, tool_code, purpose)'
            ).replace(
                '(tenant_id, task_id, tool_id)',
                '(tenant_id, task_id, tool_id, purpose)'
            )
        
        return full_match
    
    fixed = re.sub(tool_section_pattern, fix_tool_values, fixed, flags=re.DOTALL)
    
    return fixed

def fix_rag_assignments(content):
    """Fix dh_task_rag INSERT statements"""
    # Pattern for RAG assignments
    rag_pattern = r'INSERT INTO dh_task_rag \(\s*tenant_id,\s*task_id,\s*rag_source_id,.*?\)'
    
    # Replace with correct schema
    fixed = re.sub(
        rag_pattern,
        'INSERT INTO dh_task_rag (\n  tenant_id, task_id, rag_source_id, note\n)',
        content,
        flags=re.DOTALL
    )
    
    # Fix the VALUES section for RAGs - use query_context as note
    rag_section_pattern = r'(INSERT INTO dh_task_rag.*?VALUES\s*\((.*?)\)\s*AS rag_data.*?ON CONFLICT)'
    
    def fix_rag_values(match):
        full_match = match.group(0)
        values_section = match.group(2)
        
        # Parse each VALUE tuple
        # ('TSK-...', 'RAG-...', 'query context text', {...}, {...})
        # Extract just task_code, rag_code, and query_context as note
        value_pattern = r"\('(TSK-[^']+)',\s*'(RAG-[^']+)',\s*\n\s*'([^']+)',\s*\n\s*'{[^}]+}'::jsonb,\s*\n\s*'{[^}]+}'::jsonb\)"
        
        new_values = []
        for value_match in re.finditer(value_pattern, values_section):
            task_code = value_match.group(1)
            rag_code = value_match.group(2)
            note = value_match.group(3)
            new_values.append(f"  ('{task_code}', '{rag_code}', '{note}')")
        
        if new_values:
            new_values_str = ',\n'.join(new_values)
            # Reconstruct the INSERT
            return full_match.replace(
                f'({values_section})',
                f'(\n{new_values_str}\n)'
            ).replace(
                'AS rag_data(task_code, rag_code, query_context, search_config, metadata)',
                'AS rag_data(task_code, rag_code, note)'
            ).replace(
                '(tenant_id, task_id, rag_source_id)',
                '(tenant_id, task_id, rag_source_id, note)'
            )
        
        return full_match
    
    fixed = re.sub(rag_section_pattern, fix_rag_values, fixed, flags=re.DOTALL)
    
    return fixed

def fix_file(filepath):
    """Fix a single SQL file"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Apply fixes
    content = fix_tool_assignments(content)
    content = fix_rag_assignments(content)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        return True, "Fixed"
    
    return False, "No changes needed"

def main():
    script_dir = Path(__file__).parent
    ra_files = sorted(script_dir.glob('*_ra_*_part2.sql'))
    
    print(f"Checking {len(ra_files)} RA Part 2 files for schema compliance...\n")
    
    fixed_count = 0
    unchanged_count = 0
    
    for filepath in ra_files:
        filename = filepath.name
        changed, message = fix_file(filepath)
        
        if changed:
            print(f"✅ {filename}: {message}")
            fixed_count += 1
        else:
            print(f"⏭️  {filename}: {message}")
            unchanged_count += 1
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Fixed: {fixed_count}")
    print(f"  Unchanged: {unchanged_count}")
    print(f"{'='*60}")
    
    if fixed_count > 0:
        print(f"\n✅ Schema compliance fixes applied!")
        print(f"Files now match actual database schema:")
        print(f"  - dh_task_tool: only 'purpose' column")
        print(f"  - dh_task_rag: only 'note' column")

if __name__ == '__main__':
    main()

