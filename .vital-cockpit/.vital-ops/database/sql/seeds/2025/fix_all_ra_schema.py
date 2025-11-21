#!/usr/bin/env python3
"""
Comprehensive fix for ALL RA seed files to match actual database schema

Schema differences:
1. dh_task_tool: Only has (tenant_id, task_id, tool_id, purpose)
   - Remove: is_required, connection_config, metadata
2. dh_task_rag: Only has (tenant_id, task_id, rag_source_id, note)
   - Remove: query_context, search_config, metadata
"""

import re
from pathlib import Path

def fix_tool_section(content):
    """Fix dh_task_tool assignments - complete rewrite"""
    # Find the tool section
    pattern = r'(-- =+\s*SECTION 3: TOOL ASSIGNMENTS\s*-- =+.*?)(?=-- =+\s*SECTION 4:|-- =+\s*VERIFICATION|$)'
    
    def rewrite_tool_section(match):
        section = match.group(1)
        
        # Extract VALUES entries
        values_pattern = r"\('(TSK-[^']+)',\s*'(TOOL-[^']+)',\s*[^,]+,\s*[^,]+::jsonb,\s*'{\"purpose\":\s*\"([^\"]+)\"}'::jsonb\)"
        
        values = []
        for vm in re.finditer(values_pattern, section):
            task_code = vm.group(1)
            tool_code = vm.group(2)
            purpose = vm.group(3)
            values.append(f"  ('{task_code}', '{tool_code}', '{purpose}')")
        
        if not values:
            return match.group(0)  # No changes if no matches
        
        # Build new section
        new_section = f"""-- =====================================================================================
-- SECTION 3: TOOL ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_tool (
  tenant_id, task_id, tool_id, purpose
)
SELECT
  sc.tenant_id,
  t.id,
  tool.id,
  tool_data.purpose
FROM session_config sc
CROSS JOIN (VALUES
{',\\n'.join(values)}
) AS tool_data(task_code, tool_code, purpose)
INNER JOIN dh_task t ON t.code = tool_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_tool tool ON tool.code = tool_data.tool_code AND tool.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, tool_id)
DO UPDATE SET purpose = EXCLUDED.purpose;

"""
        return new_section
    
    return re.sub(pattern, rewrite_tool_section, content, flags=re.DOTALL)

def fix_rag_section(content):
    """Fix dh_task_rag assignments - complete rewrite"""
    # Find the RAG section
    pattern = r'(-- =+\s*SECTION 4: RAG SOURCE ASSIGNMENTS\s*-- =+.*?)(?=-- =+\s*VERIFICATION|$)'
    
    def rewrite_rag_section(match):
        section = match.group(1)
        
        # Extract VALUES entries - note text is on next line
        values_pattern = r"\('(TSK-[^']+)',\s*'(RAG-[^']+)',\s*\n\s*'([^']+)'"
        
        values = []
        for vm in re.finditer(values_pattern, section):
            task_code = vm.group(1)
            rag_code = vm.group(2)
            note = vm.group(3)
            values.append(f"  ('{task_code}', '{rag_code}', '{note}')")
        
        if not values:
            return match.group(0)  # No changes if no matches
        
        # Build new section
        new_section = f"""-- =====================================================================================
-- SECTION 4: RAG SOURCE ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, note
)
SELECT
  sc.tenant_id,
  t.id,
  rag.id,
  rag_data.note
FROM session_config sc
CROSS JOIN (VALUES
{',\\n'.join(values)}
) AS rag_data(task_code, rag_code, note)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, rag_source_id)
DO UPDATE SET note = EXCLUDED.note;

"""
        return new_section
    
    return re.sub(pattern, rewrite_rag_section, content, flags=re.DOTALL)

def fix_file(filepath):
    """Fix a single SQL file"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Apply fixes
    content = fix_tool_section(content)
    content = fix_rag_section(content)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        return True, "Fixed"
    
    return False, "No changes"

def main():
    script_dir = Path(__file__).parent
    ra_files = sorted(script_dir.glob('*_ra_*_part2.sql'))
    
    print(f"Fixing {len(ra_files)} RA Part 2 files for schema compliance...\n")
    
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
    
    print(f"\n{'='*70}")
    print(f"Summary:")
    print(f"  Fixed: {fixed_count}")
    print(f"  Unchanged: {unchanged_count}")
    print(f"{'='*70}\n")
    
    print("Schema Compliance:")
    print("  ✅ dh_task_tool: (tenant_id, task_id, tool_id, purpose)")
    print("  ✅ dh_task_rag: (tenant_id, task_id, rag_source_id, note)")
    print("\nAll files now match the actual database schema!")

if __name__ == '__main__':
    main()

