#!/usr/bin/env python3
"""
Generate SQL script to populate Digital Health roles from JSON file
"""
import json
import re

# Read the JSON file
with open('/Users/hichamnaim/Downloads/DIGITAL_HEALTH_ROLE_SCOPE_NORMALIZED.json', 'r') as f:
    roles_data = json.load(f)

# Digital Health Tenant ID
tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'

# Generate SQL
sql_statements = []
sql_statements.append("-- =====================================================================")
sql_statements.append("-- POPULATE ROLES FOR DIGITAL HEALTH FROM JSON DATA")
sql_statements.append("-- Generated from DIGITAL_HEALTH_ROLE_SCOPE_NORMALIZED.json")
sql_statements.append("-- =====================================================================")
sql_statements.append("")
sql_statements.append("BEGIN;")
sql_statements.append("")
sql_statements.append("DO $$")
sql_statements.append("DECLARE")
sql_statements.append("    digital_health_tenant_id uuid;")
sql_statements.append("    dept_id uuid;")
sql_statements.append("    func_id uuid;")
sql_statements.append("    role_count INTEGER := 0;")
sql_statements.append("BEGIN")
sql_statements.append("    -- Get Digital Health tenant ID dynamically")
sql_statements.append("    SELECT id INTO digital_health_tenant_id")
sql_statements.append("    FROM tenants")
sql_statements.append("    WHERE slug ILIKE '%digital%health%'")
sql_statements.append("       OR slug ILIKE '%digital-health%'")
sql_statements.append("       OR name ILIKE '%digital health%'")
sql_statements.append("    ORDER BY created_at DESC")
sql_statements.append("    LIMIT 1;")
sql_statements.append("    ")
sql_statements.append("    IF digital_health_tenant_id IS NULL THEN")
sql_statements.append("        RAISE EXCEPTION 'Digital Health tenant not found. Please create the tenant first.';")
sql_statements.append("    END IF;")
sql_statements.append("    ")
sql_statements.append("    RAISE NOTICE 'Digital Health Tenant ID: %', digital_health_tenant_id;")
sql_statements.append("    RAISE NOTICE '';")
sql_statements.append("    RAISE NOTICE '=== POPULATING ROLES FROM JSON DATA ===';")
sql_statements.append("    RAISE NOTICE '';")
sql_statements.append("")

# Group by function, department, and role to avoid duplicates
processed = set()
role_entries = []

for entry in roles_data:
    key = (entry['function'], entry['department'], entry['role'], entry['scope'])
    if key not in processed:
        processed.add(key)
        role_entries.append(entry)

# Sort by function, department, role, scope
role_entries.sort(key=lambda x: (x['function'], x['department'], x['role'], x['scope']))

current_function = None
current_department = None

for entry in role_entries:
    func_name = entry['function']
    dept_name = entry['department']
    role_name = entry['role']
    scope = entry['scope']
    scope_category = entry['scope_category']
    
    # Create role name with scope
    role_name_with_scope = f"{role_name} ({scope})"
    
    # Generate slug
    slug_base = re.sub(r'[^a-zA-Z0-9]+', '-', role_name.lower())
    slug = f"{slug_base}-{scope_category}"
    
    # Determine seniority based on role name
    seniority = 'Mid'
    if any(word in role_name.lower() for word in ['director', 'vp', 'lead', 'chief', 'head']):
        seniority = 'Executive'
    elif any(word in role_name.lower() for word in ['senior', 'manager', 'architect']):
        seniority = 'Senior'
    elif any(word in role_name.lower() for word in ['analyst', 'coordinator', 'specialist']):
        seniority = 'Entry'
    
    # Generate description
    description = f"{role_name} role with {scope.lower()} scope in {dept_name}"
    
    # Function change
    if current_function != func_name:
        if current_function is not None:
            sql_statements.append("")
        sql_statements.append(f"    -- =====================================================================")
        sql_statements.append(f"    -- FUNCTION: {func_name}")
        sql_statements.append(f"    -- =====================================================================")
        sql_statements.append("")
        current_function = func_name
    
    # Department change
    if current_department != dept_name:
        # Close previous department's IF block if it exists
        if current_department is not None:
            sql_statements.append("    END IF;")
            sql_statements.append("")
        
        sql_statements.append(f"    -- Department: {dept_name}")
        sql_statements.append(f"    SELECT id INTO dept_id FROM org_departments")
        sql_statements.append(f"    WHERE tenant_id = digital_health_tenant_id AND name = '{dept_name}';")
        sql_statements.append("")
        sql_statements.append("    IF dept_id IS NOT NULL THEN")
        sql_statements.append("        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;")
        sql_statements.append("")
        current_department = dept_name
    
    # Insert role
    sql_statements.append(f"        -- {role_name_with_scope}")
    sql_statements.append(f"        INSERT INTO org_roles (")
    sql_statements.append(f"            tenant_id,")
    sql_statements.append(f"            function_id,")
    sql_statements.append(f"            department_id,")
    sql_statements.append(f"            name,")
    sql_statements.append(f"            slug,")
    sql_statements.append(f"            description,")
    sql_statements.append(f"            seniority_level,")
    sql_statements.append(f"            geographic_scope,")
    sql_statements.append(f"            is_active,")
    sql_statements.append(f"            created_at,")
    sql_statements.append(f"            updated_at")
    sql_statements.append(f"        )")
    sql_statements.append(f"        VALUES (")
    sql_statements.append(f"            digital_health_tenant_id,")
    sql_statements.append(f"            func_id,")
    sql_statements.append(f"            dept_id,")
    sql_statements.append(f"            '{role_name_with_scope}',")
    sql_statements.append(f"            '{slug}',")
    sql_statements.append(f"            '{description.replace(chr(39), chr(39)+chr(39))}',")
    sql_statements.append(f"            '{seniority}',")
    sql_statements.append(f"            '{scope}',")
    sql_statements.append(f"            true,")
    sql_statements.append(f"            NOW(),")
    sql_statements.append(f"            NOW()")
    sql_statements.append(f"        )")
    sql_statements.append(f"        ON CONFLICT (tenant_id, slug) DO UPDATE SET")
    sql_statements.append(f"            name = EXCLUDED.name,")
    sql_statements.append(f"            description = EXCLUDED.description,")
    sql_statements.append(f"            seniority_level = EXCLUDED.seniority_level,")
    sql_statements.append(f"            geographic_scope = EXCLUDED.geographic_scope,")
    sql_statements.append(f"            is_active = true;")
    sql_statements.append(f"        role_count := role_count + 1;")
    sql_statements.append("")

# Close the last department IF block
sql_statements.append("    END IF;")
sql_statements.append("")

sql_statements.append("    RAISE NOTICE '';")
sql_statements.append("    RAISE NOTICE '=== COMPLETE ===';")
sql_statements.append("    RAISE NOTICE 'Total roles created/updated: %', role_count;")
sql_statements.append("    RAISE NOTICE '';")
sql_statements.append("    RAISE NOTICE '✅ Digital Health roles populated successfully';")
sql_statements.append("")
sql_statements.append("END $$;")
sql_statements.append("")
sql_statements.append("COMMIT;")
sql_statements.append("")
sql_statements.append("-- =====================================================================")
sql_statements.append("-- VERIFICATION QUERY")
sql_statements.append("-- =====================================================================")
sql_statements.append("")
sql_statements.append("WITH digital_health_tenant AS (")
sql_statements.append("    SELECT id as tenant_id")
sql_statements.append("    FROM tenants")
sql_statements.append("    WHERE slug ILIKE '%digital%health%'")
sql_statements.append("       OR slug ILIKE '%digital-health%'")
sql_statements.append("       OR name ILIKE '%digital health%'")
sql_statements.append("    ORDER BY created_at DESC")
sql_statements.append("    LIMIT 1")
sql_statements.append(")")
sql_statements.append("SELECT ")
sql_statements.append("    'org_functions' as table_name,")
sql_statements.append("    COUNT(*) as count")
sql_statements.append("FROM org_functions f")
sql_statements.append("CROSS JOIN digital_health_tenant t")
sql_statements.append("WHERE f.tenant_id = t.tenant_id")
sql_statements.append("UNION ALL")
sql_statements.append("SELECT ")
sql_statements.append("    'org_departments',")
sql_statements.append("    COUNT(*)")
sql_statements.append("FROM org_departments d")
sql_statements.append("CROSS JOIN digital_health_tenant t")
sql_statements.append("WHERE d.tenant_id = t.tenant_id")
sql_statements.append("UNION ALL")
sql_statements.append("SELECT ")
sql_statements.append("    'org_roles',")
sql_statements.append("    COUNT(*)")
sql_statements.append("FROM org_roles r")
sql_statements.append("CROSS JOIN digital_health_tenant t")
sql_statements.append("WHERE r.tenant_id = t.tenant_id;")

# Write to file
output_file = 'populate_digital_health_roles_from_json.sql'
with open(output_file, 'w') as f:
    f.write('\n'.join(sql_statements))

print(f"✅ Generated {output_file} with {len(role_entries)} role entries")
print(f"   Total roles (with scopes): {len(role_entries)}")
print(f"   Unique role names: {len(set((e['function'], e['department'], e['role']) for e in role_entries))}")

