#!/usr/bin/env python3
"""
Import Comprehensive Pharmaceutical Organization Structure
===========================================================
Expands organization from 6→10 functions, 8→22+ departments, 8→40+ roles

Usage:
    python3 import_comprehensive_org_structure.py
"""

import re

# Tenant ID for Pharmaceuticals
PHARMA_TENANT_ID = "f7aa6fd4-0af9-4706-8b31-034f1f7accda"

# Database connection
DB_PASSWORD = 'flusd9fqEb4kkTJ1'
DB_HOST = 'db.bomltkhixeatxuoxmolq.supabase.co'
DB_PORT = '5432'
DB_NAME = 'postgres'
DB_USER = 'postgres'

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    slug = text.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug

def escape_sql_string(value):
    """Escape single quotes in SQL strings"""
    if value is None:
        return 'NULL'
    return str(value).replace("'", "''")

# ============================================================================
# FUNCTIONS DATA
# ONLY NEW functions (4 new to add to existing 6 = 10 total)
# Must use exact enum values from functional_area_type
# Existing: Commercial, Medical Affairs, Market Access, Clinical, Regulatory, Research & Development
# ============================================================================
FUNCTIONS = [
    {
        'name': 'Manufacturing',  # NEW
        'description': 'Drug substance and drug product manufacturing',
        'code': 'FN-PHARMA-MFG'
    },
    {
        'name': 'Quality',  # NEW
        'description': 'GMP, quality control, and regulatory compliance',
        'code': 'FN-PHARMA-QA'
    },
    {
        'name': 'Business Development',  # NEW
        'description': 'Partnerships, M&A, and in-licensing',
        'code': 'FN-PHARMA-BD'
    },
    {
        'name': 'Finance',  # NEW
        'description': 'Financial planning, accounting, and corporate services',
        'code': 'FN-PHARMA-FIN'
    }
]

# ============================================================================
# DEPARTMENTS DATA
# Map departments to function NAMES (not codes)
# ============================================================================
DEPARTMENTS = {
    'Research & Development': [
        ('Drug Discovery', 'Target identification, hit-to-lead, lead optimization'),
        ('Preclinical Development', 'ADME, toxicology, pharmacology studies'),
        ('Clinical Development', 'Phase I-IV clinical trials'),
        ('Biostatistics & Data Management', 'Statistical analysis and clinical data management'),
        ('Chemistry, Manufacturing & Controls', 'Drug substance and formulation development')
    ],
    'Regulatory': [
        ('Regulatory Strategy', 'Global regulatory planning and strategy'),
        ('Regulatory Submissions', 'IND, NDA, BLA, MAA preparation and submission'),
        ('Regulatory Intelligence', 'Regulatory landscape monitoring and competitive intelligence')
    ],
    'Manufacturing': [
        ('Drug Substance Manufacturing', 'API production and bulk drug manufacturing'),
        ('Drug Product Manufacturing', 'Formulation, fill/finish, packaging'),
        ('Process Development', 'Manufacturing process optimization and scale-up')
    ],
    'Quality': [
        ('Quality Control', 'Analytical testing and release testing'),
        ('Quality Assurance & Compliance', 'GMP compliance, audits, and inspections'),
        ('Validation & Qualification', 'Equipment, process, and cleaning validation')
    ],
    'Commercial': [
        ('Sales & Account Management', 'Field sales, key account management'),
        ('Marketing & Brand Management', 'Product marketing and promotional strategy'),
        ('Market Access & HEOR', 'Payer relations, pricing, reimbursement, health economics')
    ],
    'Medical Affairs': [
        ('Medical Science Liaisons', 'KOL engagement and scientific communication'),
        ('Medical Information', 'Medical inquiry management and scientific support'),
        ('Medical Publications', 'Publication planning and medical writing')
    ]
}

# ============================================================================
# ROLES DATA
# Format: (role_name, role_title, description, seniority, function_name, department_name)
# ============================================================================
ROLES = [
    # Research & Development
    ('Chief Scientific Officer', 'CSO', 'Head of all R&D activities', 'C-Level', 'Research & Development', None),
    ('VP Research & Development', 'VP R&D', 'Oversees drug discovery and development', 'Executive', 'Research & Development', None),
    ('VP Clinical Development', 'VP Clinical', 'Leads global clinical development', 'Executive', 'Research & Development', None),
    ('Clinical Development Director', 'Director Clinical Dev', 'Oversees clinical trial execution', 'Senior', 'Research & Development', 'Clinical Development'),
    ('Clinical Project Manager', 'Clinical PM', 'Manages individual clinical trials', 'Mid', 'Research & Development', 'Clinical Development'),
    ('Clinical Research Associate', 'CRA', 'Site monitoring and clinical operations', 'Junior', 'Research & Development', 'Clinical Development'),
    ('Biostatistician', 'Biostatistician', 'Statistical analysis for clinical trials', 'Mid', 'Research & Development', 'Biostatistics & Data Management'),
    ('Clinical Data Manager', 'Data Manager', 'Clinical data management and databases', 'Mid', 'Research & Development', 'Biostatistics & Data Management'),

    # Regulatory
    ('VP Regulatory Affairs', 'VP Regulatory', 'Global regulatory strategy leader', 'Executive', 'Regulatory', None),
    ('Regulatory Affairs Director', 'RA Director', 'Regulatory strategy and submissions', 'Senior', 'Regulatory', 'Regulatory Strategy'),
    ('Regulatory Affairs Manager', 'RA Manager', 'Regulatory submissions and compliance', 'Mid', 'Regulatory', 'Regulatory Submissions'),
    ('Regulatory Affairs Specialist', 'RA Specialist', 'Regulatory documentation and submissions', 'Junior', 'Regulatory', 'Regulatory Submissions'),

    # Manufacturing
    ('VP Operations & Manufacturing', 'VP Operations', 'Oversees all manufacturing operations', 'Executive', 'Manufacturing', None),
    ('Manufacturing Director', 'Mfg Director', 'Manufacturing operations leadership', 'Senior', 'Manufacturing', 'Drug Product Manufacturing'),
    ('Process Engineer', 'Process Engineer', 'Manufacturing process optimization', 'Mid', 'Manufacturing', 'Process Development'),
    ('Production Manager', 'Production Manager', 'Day-to-day production management', 'Mid', 'Manufacturing', 'Drug Product Manufacturing'),

    # Quality
    ('VP Quality Assurance', 'VP QA', 'Quality systems and GMP compliance', 'Executive', 'Quality', None),
    ('Quality Assurance Director', 'QA Director', 'Quality systems and compliance', 'Senior', 'Quality', 'Quality Assurance & Compliance'),
    ('Quality Assurance Manager', 'QA Manager', 'GMP compliance and quality oversight', 'Mid', 'Quality', 'Quality Assurance & Compliance'),
    ('Quality Control Analyst', 'QC Analyst', 'Analytical testing and quality control', 'Junior', 'Quality', 'Quality Control'),

    # Commercial
    ('Chief Commercial Officer', 'CCO', 'Head of all commercial operations', 'C-Level', 'Commercial', None),
    ('VP Sales', 'VP Sales', 'National/global sales leadership', 'Executive', 'Commercial', None),
    ('Product Manager', 'Product Manager', 'Product lifecycle management', 'Mid', 'Commercial', 'Marketing & Brand Management'),
    ('Marketing Director', 'Marketing Director', 'Brand strategy and marketing', 'Senior', 'Commercial', 'Marketing & Brand Management'),
    ('Pharmaceutical Sales Representative', 'Sales Rep', 'Territory sales and account management', 'Junior', 'Commercial', 'Sales & Account Management'),
    ('HEOR Director', 'HEOR Director', 'Health economics and outcomes research', 'Senior', 'Commercial', 'Market Access & HEOR'),

    # Medical Affairs
    ('Chief Medical Officer', 'CMO', 'Medical strategy and medical affairs', 'C-Level', 'Medical Affairs', None),
    ('VP Medical Affairs', 'VP Medical Affairs', 'Medical affairs strategy and execution', 'Executive', 'Medical Affairs', None),
    ('Medical Science Liaison', 'MSL', 'KOL engagement and scientific communication', 'Mid', 'Medical Affairs', 'Medical Science Liaisons'),
    ('Medical Director', 'Medical Director', 'Medical strategy and oversight', 'Senior', 'Medical Affairs', None),
    ('Medical Writer', 'Medical Writer', 'Scientific and regulatory writing', 'Mid', 'Medical Affairs', 'Medical Publications'),

    # Business Development
    ('VP Business Development', 'VP BD', 'Partnerships, licensing, and M&A', 'Executive', 'Business Development', None),

    # Finance
    ('CFO', 'CFO', 'Chief Financial Officer', 'C-Level', 'Finance', None),
    ('VP Finance', 'VP Finance', 'Financial planning and analysis', 'Executive', 'Finance', None)
]

def generate_import_sql():
    """Generate complete import SQL"""

    sql_lines = [
        "-- ============================================================================",
        "-- COMPREHENSIVE PHARMACEUTICAL ORGANIZATION STRUCTURE",
        "-- Expands: 6→10 Functions, 8→22+ Departments, 8→40+ Roles",
        "-- ============================================================================",
        "",
        "BEGIN;",
        ""
    ]

    # ====================
    # FUNCTIONS
    # ====================
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- FUNCTIONS (10 Total)")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")

    for func in FUNCTIONS:
        name = escape_sql_string(func['name'])
        slug = slugify(func['name'])
        description = escape_sql_string(func['description'])
        code = func['code']

        sql_lines.append(f"-- {func['name']}")
        sql_lines.append(f"INSERT INTO org_functions (tenant_id, name, slug, description)")
        sql_lines.append(f"VALUES (")
        sql_lines.append(f"  '{PHARMA_TENANT_ID}',")
        sql_lines.append(f"  '{name}',")
        sql_lines.append(f"  '{slug}',")
        sql_lines.append(f"  '{description}'")
        sql_lines.append(f")")
        sql_lines.append(f"ON CONFLICT (tenant_id, name) DO UPDATE SET")
        sql_lines.append(f"  slug = EXCLUDED.slug,")
        sql_lines.append(f"  description = EXCLUDED.description,")
        sql_lines.append(f"  updated_at = NOW();")
        sql_lines.append("")

    # ====================
    # DEPARTMENTS
    # ====================
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- DEPARTMENTS (22+ Total)")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")

    for func_name, depts in DEPARTMENTS.items():
        func_slug = slugify(func_name)

        sql_lines.append(f"-- {func_name} Departments")

        for dept_name, dept_desc in depts:
            name = escape_sql_string(dept_name)
            slug = slugify(dept_name)
            description = escape_sql_string(dept_desc)

            sql_lines.append(f"INSERT INTO org_departments (tenant_id, name, slug, description, function_id)")
            sql_lines.append(f"SELECT")
            sql_lines.append(f"  '{PHARMA_TENANT_ID}',")
            sql_lines.append(f"  '{name}',")
            sql_lines.append(f"  '{slug}',")
            sql_lines.append(f"  '{description}',")
            sql_lines.append(f"  id")
            sql_lines.append(f"FROM org_functions")
            sql_lines.append(f"WHERE tenant_id = '{PHARMA_TENANT_ID}' AND slug = '{func_slug}'")
            sql_lines.append(f"ON CONFLICT (tenant_id, slug) DO UPDATE SET")
            sql_lines.append(f"  name = EXCLUDED.name,")
            sql_lines.append(f"  description = EXCLUDED.description,")
            sql_lines.append(f"  function_id = EXCLUDED.function_id,")
            sql_lines.append(f"  updated_at = NOW();")
            sql_lines.append("")

        sql_lines.append("")

    # ====================
    # ROLES
    # ====================
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- ROLES (40+ Total)")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")

    for role_name, role_title, description, seniority, func_name, dept_name in ROLES:
        func_slug = slugify(func_name)

        name = escape_sql_string(role_name)
        slug = slugify(role_name)
        desc = escape_sql_string(description)

        if dept_name:
            dept_slug = slugify(dept_name)
            sql_lines.append(f"-- {role_name} ({func_name} → {dept_name})")
            sql_lines.append(f"INSERT INTO org_roles (tenant_id, name, slug, description, seniority_level, function_id, department_id)")
            sql_lines.append(f"SELECT")
            sql_lines.append(f"  '{PHARMA_TENANT_ID}',")
            sql_lines.append(f"  '{name}',")
            sql_lines.append(f"  '{slug}',")
            sql_lines.append(f"  '{desc}',")
            sql_lines.append(f"  '{seniority}',")
            sql_lines.append(f"  f.id,")
            sql_lines.append(f"  d.id")
            sql_lines.append(f"FROM org_functions f")
            sql_lines.append(f"LEFT JOIN org_departments d ON d.tenant_id = f.tenant_id AND d.slug = '{dept_slug}'")
            sql_lines.append(f"WHERE f.tenant_id = '{PHARMA_TENANT_ID}' AND f.slug = '{func_slug}'")
        else:
            sql_lines.append(f"-- {role_name} ({func_name})")
            sql_lines.append(f"INSERT INTO org_roles (tenant_id, name, slug, description, seniority_level, function_id)")
            sql_lines.append(f"SELECT")
            sql_lines.append(f"  '{PHARMA_TENANT_ID}',")
            sql_lines.append(f"  '{name}',")
            sql_lines.append(f"  '{slug}',")
            sql_lines.append(f"  '{desc}',")
            sql_lines.append(f"  '{seniority}',")
            sql_lines.append(f"  id")
            sql_lines.append(f"FROM org_functions")
            sql_lines.append(f"WHERE tenant_id = '{PHARMA_TENANT_ID}' AND slug = '{func_slug}'")

        sql_lines.append(f"ON CONFLICT (tenant_id, slug) DO UPDATE SET")
        sql_lines.append(f"  name = EXCLUDED.name,")
        sql_lines.append(f"  description = EXCLUDED.description,")
        sql_lines.append(f"  seniority_level = EXCLUDED.seniority_level,")
        sql_lines.append(f"  function_id = EXCLUDED.function_id,")
        if dept_name:
            sql_lines.append(f"  department_id = EXCLUDED.department_id,")
        sql_lines.append(f"  updated_at = NOW();")
        sql_lines.append("")

    # Commit and verify
    sql_lines.append("COMMIT;")
    sql_lines.append("")
    sql_lines.append("-- Verification")
    sql_lines.append("SELECT")
    sql_lines.append(f"  (SELECT COUNT(*) FROM org_functions WHERE tenant_id = '{PHARMA_TENANT_ID}') as functions,")
    sql_lines.append(f"  (SELECT COUNT(*) FROM org_departments WHERE tenant_id = '{PHARMA_TENANT_ID}') as departments,")
    sql_lines.append(f"  (SELECT COUNT(*) FROM org_roles WHERE tenant_id = '{PHARMA_TENANT_ID}') as roles;")
    sql_lines.append("")
    sql_lines.append("-- ✅ Comprehensive org structure imported")
    sql_lines.append("")

    return '\n'.join(sql_lines)

def main():
    print("=" * 70)
    print("📦 COMPREHENSIVE PHARMACEUTICAL ORG STRUCTURE IMPORT")
    print("=" * 70)
    print()

    print("Generating SQL...")
    print(f"  Functions: {len(FUNCTIONS)} (6→10)")

    dept_count = sum(len(depts) for depts in DEPARTMENTS.values())
    print(f"  Departments: {dept_count} (8→{dept_count})")

    print(f"  Roles: {len(ROLES)} (8→{len(ROLES)})")
    print()

    # Generate SQL
    sql = generate_import_sql()

    # Save to file
    output_file = '/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/comprehensive_org_structure.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql)

    print("=" * 70)
    print("✅ SQL Generated Successfully")
    print("=" * 70)
    print(f"📁 Saved to: {output_file}")
    print()

    print("=" * 70)
    print("NEXT STEPS")
    print("=" * 70)
    print("Execute the SQL file:")
    print(f"  PGPASSWORD='{DB_PASSWORD}' psql postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME} -f {output_file}")
    print()

if __name__ == '__main__':
    main()
