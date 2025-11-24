#!/usr/bin/env python3
"""
Generate SQL scripts to populate all remaining pharmaceutical roles from JSON.
Reads PHARMA_ORG_ALL_FUNCTION_DEPT_ROLE_SCOPE.json and creates individual SQL files per function.
"""

import json
import os
from pathlib import Path

def generate_slug(text):
    """Generate a slug from text (Python approximation of PostgreSQL function)"""
    import re
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def infer_seniority(role_name):
    """Infer seniority level from role title"""
    role_lower = role_name.lower()
    if any(keyword in role_lower for keyword in ['chief', 'c-suite', 'cmo', 'cfo', 'cio', 'cco', 'ceo']):
        return 'c_suite'
    elif any(keyword in role_lower for keyword in ['svp', 'senior vp', 'executive vp']):
        return 'executive'
    elif any(keyword in role_lower for keyword in [' vp ', 'vice president', 'executive director']):
        return 'executive'
    elif any(keyword in role_lower for keyword in ['director', 'head of']):
        return 'director'
    elif any(keyword in role_lower for keyword in ['senior', 'lead', 'principal', 'manager']):
        return 'senior'
    elif any(keyword in role_lower for keyword in ['associate', 'coordinator', 'analyst', 'specialist']):
        return 'mid'
    elif any(keyword in role_lower for keyword in ['junior', 'entry', 'assistant']):
        return 'entry'
    else:
        return 'mid'

def infer_category(role_name, dept_name):
    """Infer role category from title and department"""
    role_lower = role_name.lower()
    dept_lower = dept_name.lower()
    
    if any(keyword in role_lower for keyword in ['field', 'territory', 'msl', 'representative', 'rep ']):
        return 'field'
    elif any(keyword in dept_lower for keyword in ['field', 'sales operations']):
        return 'field'
    elif any(keyword in role_lower for keyword in ['remote', 'virtual', 'digital']):
        return 'remote'
    elif 'hybrid' in role_lower:
        return 'hybrid'
    else:
        return 'office'

def create_function_sql_script(function_data, output_dir):
    """Create an SQL script for a single function with all its roles"""
    function_name = function_data['function']
    function_slug = generate_slug(function_name)
    
    # Skip Medical Affairs and Market Access (already done)
    if function_slug in ['medical-affairs', 'market-access']:
        print(f"Skipping {function_name} (already populated)")
        return
    
    script_num = {
        'commercial-organization': '03',
        'regulatory-affairs': '04',
        'research-development-rd': '05',
        'manufacturing-supply-chain': '06',
        'finance-accounting': '07',
        'human-resources': '08',
        'information-technology-it-digital': '09',
        'legal-compliance': '10',
        'corporate-communications': '11',
        'strategic-planning-corporate-development': '12',
        'business-intelligence-analytics': '13',
        'procurement': '14',
        'facilities-workplace-services': '15'
    }.get(function_slug, '99')
    
    filename = f"populate_roles_{script_num}_{function_slug.replace('-', '_')}.sql"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w') as f:
        # Header
        f.write(f"-- =====================================================================\n")
        f.write(f"-- POPULATE {function_name.upper()} ROLES\n")
        
        total_roles = sum(len(dept['roles']) for dept in function_data['departments'])
        f.write(f"-- Function: {function_name} ({len(function_data['departments'])} departments, {total_roles} roles)\n")
        f.write(f"-- =====================================================================\n\n")
        
        f.write("DO $$\nBEGIN\n")
        f.write(f"    RAISE NOTICE '=================================================================';\n")
        f.write(f"    RAISE NOTICE 'POPULATING {function_name.upper()} ROLES';\n")
        f.write(f"    RAISE NOTICE '=================================================================';\n")
        f.write("    RAISE NOTICE '';\n")
        f.write("END $$;\n\n")
        
        # Helper function
        f.write("-- =====================================================================\n")
        f.write("-- HELPER FUNCTION\n")
        f.write("-- =====================================================================\n\n")
        f.write("""CREATE OR REPLACE FUNCTION insert_role(
    p_name TEXT,
    p_department_name TEXT,
    p_function_slug TEXT,
    p_geographic_scope geographic_scope_type,
    p_seniority_level seniority_level_type DEFAULT NULL,
    p_role_category role_category_type DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_function_id UUID;
    v_department_id UUID;
    v_role_id UUID;
    v_slug TEXT;
BEGIN
    SELECT id INTO v_function_id FROM public.org_functions WHERE slug = p_function_slug AND deleted_at IS NULL;
    IF v_function_id IS NULL THEN RAISE EXCEPTION 'Function not found: %', p_function_slug; END IF;
    
    SELECT id INTO v_department_id FROM public.org_departments WHERE function_id = v_function_id AND name = p_department_name AND deleted_at IS NULL;
    IF v_department_id IS NULL THEN RAISE EXCEPTION 'Department not found: % in function %', p_department_name, p_function_slug; END IF;
    
    v_slug := generate_slug(p_name);
    
    INSERT INTO public.org_roles (name, slug, function_id, department_id, geographic_scope, seniority_level, role_category)
    VALUES (p_name, v_slug, v_function_id, v_department_id, p_geographic_scope, p_seniority_level, p_role_category)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, function_id = EXCLUDED.function_id, department_id = EXCLUDED.department_id,
        geographic_scope = EXCLUDED.geographic_scope, seniority_level = EXCLUDED.seniority_level, role_category = EXCLUDED.role_category, updated_at = NOW()
    RETURNING id INTO v_role_id;
    
    RETURN v_role_id;
END;
$$ LANGUAGE plpgsql;\n\n""")
        
        # Process each department
        for dept in function_data['departments']:
            dept_name = dept['department']
            roles = dept['roles']
            
            f.write("-- =====================================================================\n")
            f.write(f"-- DEPARTMENT: {dept_name.upper()} ({len(roles)} roles)\n")
            f.write("-- =====================================================================\n\n")
            f.write(f"DO $$ BEGIN RAISE NOTICE 'Creating {dept_name} roles...'; END $$;\n\n")
            
            # Insert each role
            for role in roles:
                role_name = role['role']
                scope = role['scope']
                seniority = infer_seniority(role_name)
                category = infer_category(role_name, dept_name)
                
                f.write(f"SELECT insert_role('{role_name}', '{dept_name}', '{function_slug}', '{scope}', '{seniority}', '{category}');\n")
            
            f.write("\n")
        
        # Cleanup and verification
        f.write("-- =====================================================================\n")
        f.write("-- CLEANUP\n")
        f.write("-- =====================================================================\n\n")
        f.write("DROP FUNCTION IF EXISTS insert_role(TEXT, TEXT, TEXT, geographic_scope_type, seniority_level_type, role_category_type);\n\n")
        
        f.write("-- =====================================================================\n")
        f.write("-- VERIFICATION\n")
        f.write("-- =====================================================================\n\n")
        f.write("""DO $$
DECLARE role_count INTEGER; dept_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count FROM public.org_roles r JOIN public.org_functions f ON r.function_id = f.id 
    WHERE f.slug = '""" + function_slug + """' AND r.deleted_at IS NULL;
    SELECT COUNT(DISTINCT d.id) INTO dept_count FROM public.org_departments d JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = '""" + function_slug + """' AND d.deleted_at IS NULL;
    RAISE NOTICE ''; RAISE NOTICE '""" + function_name + """ Roles Created: %', role_count;
    RAISE NOTICE '""" + function_name + """ Departments: %', dept_count; RAISE NOTICE '';
END $$;\n""")
    
    print(f"✓ Created {filename} ({total_roles} roles)")
    return total_roles

def main():
    # Paths
    json_path = Path('/Users/hichamnaim/Downloads/PHARMA_ORG_ALL_FUNCTION_DEPT_ROLE_SCOPE.json')
    output_dir = Path('/Users/hichamnaim/Downloads/Cursor/VITAL path')
    
    # Load JSON
    print("Loading JSON...")
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    print(f"Found {len(data)} functions\n")
    
    # Process each function
    total_roles_generated = 0
    for function_data in data:
        roles_count = create_function_sql_script(function_data, output_dir)
        if roles_count:
            total_roles_generated += roles_count
    
    print(f"\n{'='*70}")
    print(f"✓ Generation complete!")
    print(f"  Total roles generated: {total_roles_generated}")
    print(f"  Output directory: {output_dir}")
    print(f"{'='*70}")
    print("\nNext steps:")
    print("  1. Review the generated SQL scripts")
    print("  2. Run them in sequence: populate_roles_03_*.sql, 04_*, etc.")
    print("  3. Or create a master script to run them all")

if __name__ == '__main__':
    main()

