#!/usr/bin/env python3
"""
Fix all Part 2 SQL files by adding session_config setup at the beginning
"""

import os
import re
from pathlib import Path

# Session config block to prepend
SESSION_CONFIG_BLOCK = """-- Setup session_config for tenant lookup
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Create temp table if it doesn't exist
  CREATE TEMP TABLE IF NOT EXISTS session_config (
    tenant_id UUID,
    tenant_slug TEXT
  );
  
  -- Clear and repopulate
  DELETE FROM session_config;
  
  INSERT INTO session_config (tenant_id, tenant_slug)
  SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';
  
  SELECT tenant_id INTO v_tenant_id FROM session_config;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant "digital-health-startup" not found';
  END IF;
  RAISE NOTICE 'Using tenant_id: %', v_tenant_id;
END $$;

"""

def fix_part2_file(filepath):
    """Add session_config setup to a Part 2 file"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if already has session_config
    if 'CREATE TEMP TABLE IF NOT EXISTS session_config' in content:
        return False, "Already has session_config"
    
    # Find the end of the header comments (after the ===== lines)
    lines = content.split('\n')
    insert_pos = 0
    header_count = 0
    
    for i, line in enumerate(lines):
        if line.startswith('-- ='):
            header_count += 1
        if header_count >= 2:  # After second separator line
            insert_pos = i + 1
            break
    
    # Insert session_config block
    if insert_pos > 0:
        lines.insert(insert_pos, SESSION_CONFIG_BLOCK)
        new_content = '\n'.join(lines)
        
        with open(filepath, 'w') as f:
            f.write(new_content)
        
        return True, "Updated"
    else:
        return False, "Could not find insertion point"

def main():
    script_dir = Path(__file__).parent
    part2_files = list(script_dir.glob('*_part2.sql'))
    
    print(f"Found {len(part2_files)} Part 2 files\n")
    
    updated = 0
    skipped = 0
    failed = 0
    
    for filepath in sorted(part2_files):
        filename = filepath.name
        success, message = fix_part2_file(filepath)
        
        if success:
            print(f"✅ {filename}: {message}")
            updated += 1
        elif "Already has" in message:
            print(f"⏭️  {filename}: {message}")
            skipped += 1
        else:
            print(f"❌ {filename}: {message}")
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Updated: {updated}")
    print(f"  Skipped (already fixed): {skipped}")
    print(f"  Failed: {failed}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()

