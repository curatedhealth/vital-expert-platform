#!/usr/bin/env python3
"""
Generate SQL merge script from CSV data
Reads the CSV file and generates a targeted merge script
"""

import csv
import json
from collections import defaultdict
from pathlib import Path

def read_csv_data(csv_path):
    """Read CSV and return structured data"""
    roles_data = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            roles_data.append({
                'role_name': row['role_name'],
                'role_id': row['role_id'],
                'tenant_name': row['tenant_name'],
                'persona_count': int(row['persona_count']),
                'tenant_id': row['tenant_id']
            })
    
    return roles_data

def analyze_duplicates(roles_data):
    """Analyze duplicate roles and determine merge strategy"""
    # Group by role name
    role_groups = defaultdict(list)
    for role in roles_data:
        role_groups[role['role_name']].append(role)
    
    # Find duplicates (roles that appear in multiple tenants)
    duplicates = {}
    merge_plan = []
    
    for role_name, instances in role_groups.items():
        if len(instances) > 1:
            # Sort by persona_count DESC, then by role_id for consistency
            sorted_instances = sorted(
                instances,
                key=lambda x: (-x['persona_count'], x['role_id'])
            )
            
            keep_role = sorted_instances[0]
            merge_roles = sorted_instances[1:]
            
            duplicates[role_name] = {
                'keep': keep_role,
                'merge': merge_roles,
                'total_instances': len(instances),
                'roles_to_delete': sum(1 for r in merge_roles if r['persona_count'] == 0),
                'roles_to_merge_with_personas': sum(1 for r in merge_roles if r['persona_count'] > 0),
                'personas_to_reassign': sum(r['persona_count'] for r in merge_roles)
            }
            
            merge_plan.append({
                'role_name': role_name,
                'keep_role_id': keep_role['role_id'],
                'keep_tenant_id': keep_role['tenant_id'],
                'keep_persona_count': keep_role['persona_count'],
                'merge_roles': [
                    {
                        'role_id': r['role_id'],
                        'tenant_id': r['tenant_id'],
                        'persona_count': r['persona_count']
                    }
                    for r in merge_roles
                ]
            })
    
    return duplicates, merge_plan

def generate_sql_script(merge_plan, duplicates, output_path):
    """Generate SQL merge script from merge plan"""
    
    sql_lines = []
    sql_lines.append("-- =====================================================================")
    sql_lines.append("-- MERGE DUPLICATE ROLES FROM CSV DATA")
    sql_lines.append("-- Generated from: Supabase Snippet Multi-level Tenant Foundation (3).csv")
    sql_lines.append("-- Strategy: Keep role with most personas, only delete roles with 0 personas")
    sql_lines.append(f"-- Total roles to merge: {len(merge_plan)}")
    sql_lines.append("-- =====================================================================")
    sql_lines.append("")
    sql_lines.append("BEGIN;")
    sql_lines.append("")
    
    # Preview section
    sql_lines.append("-- =====================================================================")
    sql_lines.append("-- PREVIEW: Roles to be merged")
    sql_lines.append("-- =====================================================================")
    sql_lines.append("SELECT '=== PREVIEW: Roles to be merged ===' as section;")
    sql_lines.append("")
    sql_lines.append("WITH merge_data AS (")
    sql_lines.append("    SELECT * FROM (VALUES")
    
    preview_values = []
    for plan in merge_plan:
        for merge_role in plan['merge_roles']:
            preview_values.append(
                f"        ('{plan['role_name'].replace("'", "''")}', "
                f"'{plan['keep_role_id']}', {plan['keep_persona_count']}, "
                f"'{merge_role['role_id']}', {merge_role['persona_count']})"
            )
    
    sql_lines.append(",\n".join(preview_values))
    sql_lines.append("    ) AS t(role_name, keep_role_id, keep_personas, merge_role_id, merge_personas)")
    sql_lines.append(")")
    sql_lines.append("SELECT ")
    sql_lines.append("    role_name,")
    sql_lines.append("    COUNT(*) as instances_to_merge,")
    sql_lines.append("    SUM(CASE WHEN merge_personas = 0 THEN 1 ELSE 0 END) as roles_to_delete,")
    sql_lines.append("    SUM(CASE WHEN merge_personas > 0 THEN 1 ELSE 0 END) as roles_to_merge_with_personas,")
    sql_lines.append("    SUM(merge_personas) as personas_to_reassign")
    sql_lines.append("FROM merge_data")
    sql_lines.append("GROUP BY role_name")
    sql_lines.append("ORDER BY instances_to_merge DESC, role_name")
    sql_lines.append("LIMIT 20;")
    sql_lines.append("")
    
    # Actual merge script
    sql_lines.append("-- =====================================================================")
    sql_lines.append("-- ACTUAL MERGE SCRIPT")
    sql_lines.append("-- Uncomment the section below to perform the merge")
    sql_lines.append("-- =====================================================================")
    sql_lines.append("")
    sql_lines.append("/*")
    sql_lines.append("DO $$")
    sql_lines.append("DECLARE")
    sql_lines.append("    roles_merged INTEGER := 0;")
    sql_lines.append("    personas_reassigned INTEGER := 0;")
    sql_lines.append("    roles_deleted INTEGER := 0;")
    sql_lines.append("    update_count INTEGER;")
    sql_lines.append("BEGIN")
    sql_lines.append("    RAISE NOTICE '════════════════════════════════════════════════════════════════';")
    sql_lines.append("    RAISE NOTICE '🔄 MERGING DUPLICATE ROLES FROM CSV DATA';")
    sql_lines.append("    RAISE NOTICE '════════════════════════════════════════════════════════════════';")
    sql_lines.append("    RAISE NOTICE '';")
    sql_lines.append("")
    
    # Step 1: Reassign personas
    sql_lines.append("    -- Step 1: Reassign personas from duplicate roles to kept roles")
    sql_lines.append("    RAISE NOTICE 'Step 1: Reassigning personas...';")
    
    for plan in merge_plan:
        for merge_role in plan['merge_roles']:
            if merge_role['persona_count'] > 0:
                sql_lines.append(f"    -- {plan['role_name']}: Reassign {merge_role['persona_count']} personas")
                sql_lines.append(f"    UPDATE public.personas")
                sql_lines.append(f"    SET role_id = '{plan['keep_role_id']}'::uuid, updated_at = NOW()")
                sql_lines.append(f"    WHERE role_id = '{merge_role['role_id']}'::uuid")
                sql_lines.append(f"      AND deleted_at IS NULL;")
                sql_lines.append(f"    GET DIAGNOSTICS update_count = ROW_COUNT;")
                sql_lines.append(f"    personas_reassigned := personas_reassigned + update_count;")
                sql_lines.append("")
    
    # Step 2: Make kept roles tenant-agnostic
    sql_lines.append("    -- Step 2: Make kept roles tenant-agnostic")
    sql_lines.append("    RAISE NOTICE 'Step 2: Making kept roles tenant-agnostic...';")
    
    keep_role_ids = list(set(plan['keep_role_id'] for plan in merge_plan))
    sql_lines.append(f"    UPDATE public.org_roles")
    sql_lines.append(f"    SET tenant_id = NULL, updated_at = NOW()")
    sql_lines.append(f"    WHERE id IN (")
    sql_lines.append(",\n".join(f"        '{rid}'::uuid" for rid in keep_role_ids))
    sql_lines.append(f"    ) AND tenant_id IS NOT NULL;")
    sql_lines.append(f"    GET DIAGNOSTICS update_count = ROW_COUNT;")
    sql_lines.append(f"    roles_merged := update_count;")
    sql_lines.append("")
    
    # Step 3: Delete roles without personas
    sql_lines.append("    -- Step 3: Soft delete roles without personas")
    sql_lines.append("    RAISE NOTICE 'Step 3: Deleting duplicate roles WITHOUT personas...';")
    
    delete_role_ids = []
    for plan in merge_plan:
        for merge_role in plan['merge_roles']:
            if merge_role['persona_count'] == 0:
                delete_role_ids.append(merge_role['role_id'])
    
    if delete_role_ids:
        sql_lines.append(f"    UPDATE public.org_roles")
        sql_lines.append(f"    SET deleted_at = NOW(), updated_at = NOW()")
        sql_lines.append(f"    WHERE id IN (")
        sql_lines.append(",\n".join(f"        '{rid}'::uuid" for rid in delete_role_ids))
        sql_lines.append(f"    ) AND deleted_at IS NULL;")
        sql_lines.append(f"    GET DIAGNOSTICS update_count = ROW_COUNT;")
        sql_lines.append(f"    roles_deleted := update_count;")
    else:
        sql_lines.append("    -- No roles to delete (all have personas)")
        sql_lines.append("    roles_deleted := 0;")
    sql_lines.append("")
    
    # Summary
    sql_lines.append("    RAISE NOTICE '════════════════════════════════════════════════════════════════';")
    sql_lines.append("    RAISE NOTICE '✅ MERGE COMPLETE';")
    sql_lines.append("    RAISE NOTICE '════════════════════════════════════════════════════════════════';")
    sql_lines.append("    RAISE NOTICE 'Personas reassigned: %', personas_reassigned;")
    sql_lines.append("    RAISE NOTICE 'Roles made tenant-agnostic: %', roles_merged;")
    sql_lines.append("    RAISE NOTICE 'Duplicate roles deleted (no personas): %', roles_deleted;")
    sql_lines.append("    RAISE NOTICE '';")
    sql_lines.append("")
    sql_lines.append("END $$;")
    sql_lines.append("*/")
    sql_lines.append("")
    sql_lines.append("COMMIT;")
    sql_lines.append("")
    
    # Verification
    sql_lines.append("-- =====================================================================")
    sql_lines.append("-- VERIFICATION: After merge")
    sql_lines.append("-- =====================================================================")
    sql_lines.append("SELECT '=== VERIFICATION ===' as section;")
    sql_lines.append("")
    sql_lines.append("SELECT ")
    sql_lines.append("    COUNT(DISTINCT r.name) as unique_role_names,")
    sql_lines.append("    COUNT(*) as total_roles,")
    sql_lines.append("    COUNT(DISTINCT r.tenant_id) as unique_tenants,")
    sql_lines.append("    COUNT(CASE WHEN r.tenant_id IS NULL THEN 1 END) as tenant_agnostic_roles,")
    sql_lines.append("    COUNT(CASE WHEN r.deleted_at IS NOT NULL THEN 1 END) as deleted_roles")
    sql_lines.append("FROM public.org_roles r;")
    
    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    return len(merge_plan), sum(p['roles_to_delete'] for p in duplicates.values()), sum(p['personas_to_reassign'] for p in duplicates.values())

def main():
    csv_path = Path("/Users/hichamnaim/Downloads/Supabase Snippet Multi-level Tenant Foundation (3).csv")
    output_path = Path("/Users/hichamnaim/Downloads/Cursor/VITAL path/merge_duplicate_roles_from_csv_generated.sql")
    
    print(f"Reading CSV: {csv_path}")
    roles_data = read_csv_data(csv_path)
    print(f"Found {len(roles_data)} role records")
    
    print("\nAnalyzing duplicates...")
    duplicates, merge_plan = analyze_duplicates(roles_data)
    print(f"Found {len(duplicates)} duplicate role names")
    
    total_to_delete = sum(d['roles_to_delete'] for d in duplicates.values())
    total_to_reassign = sum(d['personas_to_reassign'] for d in duplicates.values())
    
    print(f"\nSummary:")
    print(f"  - Roles to merge: {len(merge_plan)}")
    print(f"  - Roles to delete (no personas): {total_to_delete}")
    print(f"  - Personas to reassign: {total_to_reassign}")
    
    print(f"\nGenerating SQL script: {output_path}")
    roles_count, delete_count, reassign_count = generate_sql_script(merge_plan, duplicates, output_path)
    
    print(f"\n✅ Generated SQL script:")
    print(f"  - {roles_count} roles to process")
    print(f"  - {delete_count} roles will be deleted")
    print(f"  - {reassign_count} personas will be reassigned")

if __name__ == "__main__":
    main()

