#!/bin/bash
# =====================================================================================
# Fix all Part 2 files by adding session_config setup
# =====================================================================================

cd "$(dirname "$0")"

# Session config block to add
SESSION_CONFIG='
-- Setup session_config for tenant lookup
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Create temp table if it doesn'\''t exist
  CREATE TEMP TABLE IF NOT EXISTS session_config (
    tenant_id UUID,
    tenant_slug TEXT
  );
  
  -- Clear and repopulate
  DELETE FROM session_config;
  
  INSERT INTO session_config (tenant_id, tenant_slug)
  SELECT id, slug FROM tenants WHERE slug = '\''digital-health-startup'\'';
  
  SELECT tenant_id INTO v_tenant_id FROM session_config;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION '\''Tenant "digital-health-startup" not found'\'';
  END IF;
  RAISE NOTICE '\''Using tenant_id: %'\'', v_tenant_id;
END $$;
'

# Find all Part 2 files
for file in *_part2.sql; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        
        # Check if session_config already exists
        if grep -q "CREATE TEMP TABLE IF NOT EXISTS session_config" "$file"; then
            echo "  ✅ Already has session_config"
        else
            echo "  🔧 Adding session_config..."
            
            # Create temp file with session_config added after the header
            awk -v config="$SESSION_CONFIG" '
                /^-- ={5,}$/ { 
                    header_count++
                }
                {
                    print
                    if (header_count == 2 && !added) {
                        print config
                        added = 1
                    }
                }
            ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
            
            echo "  ✅ Updated"
        fi
    fi
done

echo ""
echo "✅ All Part 2 files updated!"

