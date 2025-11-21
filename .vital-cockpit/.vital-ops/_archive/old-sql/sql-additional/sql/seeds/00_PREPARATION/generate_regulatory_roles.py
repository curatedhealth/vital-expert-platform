#!/usr/bin/env python3
"""
Generate SQL to create 38 Regulatory Affairs roles
Based on the Regulatory Affairs organizational structure
"""

# Regulatory Affairs function_id and tenant_id
FUNCTION_ID = '43382f04-a819-4839-88c1-c1054d5ae071'
TENANT_ID = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'

# Define all 38 roles organized by department
# Structure: (role_name, slug, description, seniority, leadership_level, career_level, reports_to, department_slug, geographic_scope)

REGULATORY_ROLES = [
    # ===========================================
    # DEPARTMENT 1: Regulatory Leadership & Strategy (4 roles)
    # ===========================================
    (
        'Chief Regulatory Officer',
        'chief-regulatory-officer',
        'C-Suite regulatory leader responsible for global regulatory strategy, submissions, and compliance across all products and regions',
        'executive',
        'L1',
        10,
        'CEO',
        'regulatory-leadership-strategy',
        'global'
    ),
    (
        'SVP Regulatory Affairs',
        'svp-regulatory-affairs',
        'Senior Vice President leading global regulatory operations, submissions, and regional regulatory teams',
        'executive',
        'L2',
        9,
        'Chief Regulatory Officer',
        'regulatory-leadership-strategy',
        'global'
    ),
    (
        'VP Regulatory Strategy',
        'vp-regulatory-strategy',
        'Vice President leading regulatory strategy, intelligence, policy, and strategic regulatory planning',
        'director',
        'L3',
        8,
        'SVP Regulatory Affairs',
        'regulatory-leadership-strategy',
        'global'
    ),
    (
        'Head of Regulatory Operations',
        'head-of-regulatory-operations',
        'Head of Regulatory Operations managing regulatory systems, processes, compliance, and operational excellence',
        'director',
        'L3',
        8,
        'SVP Regulatory Affairs',
        'regulatory-leadership-strategy',
        'global'
    ),

    # ===========================================
    # DEPARTMENT 2: Regulatory Submissions & Operations (9 roles)
    # ===========================================
    (
        'VP Regulatory Submissions',
        'vp-regulatory-submissions',
        'Vice President leading global regulatory submissions (NDA, BLA, MAA) and regulatory writing teams',
        'director',
        'L3',
        8,
        'SVP Regulatory Affairs',
        'regulatory-submissions-operations',
        'global'
    ),
    (
        'Regulatory Submissions Director',
        'regulatory-submissions-director',
        'Director managing regulatory submission preparation, review, and filing for assigned region or portfolio',
        'director',
        'L4',
        7,
        'VP Regulatory Submissions',
        'regulatory-submissions-operations',
        'regional'
    ),
    (
        'Senior Regulatory Submissions Manager',
        'senior-regulatory-submissions-manager',
        'Senior Manager leading regulatory submission projects and regulatory writing for specific products or therapeutic areas',
        'senior',
        'L5',
        6,
        'Regulatory Submissions Director',
        'regulatory-submissions-operations',
        'product'
    ),
    (
        'Regulatory Submissions Manager',
        'regulatory-submissions-manager',
        'Manager coordinating regulatory submissions, dossier preparation, and agency interactions for assigned products',
        'senior',
        'L5',
        6,
        'Regulatory Submissions Director',
        'regulatory-submissions-operations',
        'product'
    ),
    (
        'Senior Regulatory Writer',
        'senior-regulatory-writer',
        'Senior Regulatory Writer authoring complex regulatory documents (Module 2, CSRs, briefing documents)',
        'senior',
        'L6',
        5,
        'Regulatory Submissions Manager',
        'regulatory-submissions-operations',
        'product'
    ),
    (
        'Regulatory Writer',
        'regulatory-writer',
        'Regulatory Writer preparing regulatory documents and sections for submissions under guidance',
        'mid-level',
        'L6',
        4,
        'Regulatory Submissions Manager',
        'regulatory-submissions-operations',
        'product'
    ),
    (
        'Regulatory Publishing Manager',
        'regulatory-publishing-manager',
        'Manager overseeing regulatory publishing, eCTD compilation, and submission delivery',
        'senior',
        'L5',
        6,
        'VP Regulatory Submissions',
        'regulatory-submissions-operations',
        'global'
    ),
    (
        'Regulatory Document Specialist',
        'regulatory-document-specialist',
        'Specialist managing regulatory document control, publishing, and eCTD compilation',
        'mid-level',
        'L6',
        4,
        'Regulatory Publishing Manager',
        'regulatory-submissions-operations',
        'centralized'
    ),
    (
        'Regulatory Coordinator',
        'regulatory-coordinator',
        'Coordinator providing administrative and operational support for regulatory submissions and activities',
        'entry',
        'L7',
        3,
        'Regulatory Submissions Manager',
        'regulatory-submissions-operations',
        'centralized'
    ),

    # ===========================================
    # DEPARTMENT 3: Regulatory Intelligence & Policy (6 roles)
    # ===========================================
    (
        'Regulatory Intelligence Director',
        'regulatory-intelligence-director',
        'Director leading regulatory intelligence, policy monitoring, and strategic regulatory insights',
        'director',
        'L4',
        7,
        'VP Regulatory Strategy',
        'regulatory-intelligence-policy',
        'global'
    ),
    (
        'Senior Regulatory Intelligence Manager',
        'senior-regulatory-intelligence-manager',
        'Senior Manager leading regulatory intelligence activities and strategic policy analysis',
        'senior',
        'L5',
        6,
        'Regulatory Intelligence Director',
        'regulatory-intelligence-policy',
        'global'
    ),
    (
        'Regulatory Intelligence Manager',
        'regulatory-intelligence-manager',
        'Manager conducting regulatory intelligence, policy monitoring, and competitive analysis for assigned regions',
        'senior',
        'L5',
        6,
        'Regulatory Intelligence Director',
        'regulatory-intelligence-policy',
        'regional'
    ),
    (
        'Senior Regulatory Policy Analyst',
        'senior-regulatory-policy-analyst',
        'Senior Analyst analyzing regulatory policies, guidelines, and emerging regulatory trends',
        'senior',
        'L6',
        5,
        'Regulatory Intelligence Manager',
        'regulatory-intelligence-policy',
        'regional'
    ),
    (
        'Regulatory Policy Analyst',
        'regulatory-policy-analyst',
        'Analyst monitoring and analyzing regulatory policies and their impact on submissions',
        'mid-level',
        'L6',
        4,
        'Regulatory Intelligence Manager',
        'regulatory-intelligence-policy',
        'regional'
    ),
    (
        'Regulatory Intelligence Specialist',
        'regulatory-intelligence-specialist',
        'Specialist supporting regulatory intelligence research, data collection, and reporting',
        'entry',
        'L7',
        3,
        'Regulatory Intelligence Manager',
        'regulatory-intelligence-policy',
        'centralized'
    ),

    # ===========================================
    # DEPARTMENT 4: CMC Regulatory Affairs (7 roles)
    # ===========================================
    (
        'CMC Regulatory Affairs Director',
        'cmc-regulatory-affairs-director',
        'Director leading CMC regulatory strategy, submissions, and lifecycle management for Chemistry, Manufacturing, and Controls',
        'director',
        'L4',
        7,
        'VP Regulatory Submissions',
        'cmc-regulatory-affairs',
        'global'
    ),
    (
        'Senior CMC Regulatory Manager',
        'senior-cmc-regulatory-manager',
        'Senior Manager leading CMC regulatory activities for assigned products or regions',
        'senior',
        'L5',
        6,
        'CMC Regulatory Affairs Director',
        'cmc-regulatory-affairs',
        'product'
    ),
    (
        'CMC Regulatory Manager',
        'cmc-regulatory-manager',
        'Manager coordinating CMC regulatory strategy and submissions for assigned products',
        'senior',
        'L5',
        6,
        'CMC Regulatory Affairs Director',
        'cmc-regulatory-affairs',
        'product'
    ),
    (
        'Senior CMC Regulatory Specialist',
        'senior-cmc-regulatory-specialist',
        'Senior Specialist managing CMC regulatory sections, supporting submissions and lifecycle changes',
        'senior',
        'L6',
        5,
        'CMC Regulatory Manager',
        'cmc-regulatory-affairs',
        'product'
    ),
    (
        'CMC Regulatory Specialist',
        'cmc-regulatory-specialist',
        'Specialist preparing CMC regulatory documents and supporting submission activities',
        'mid-level',
        'L6',
        4,
        'CMC Regulatory Manager',
        'cmc-regulatory-affairs',
        'product'
    ),
    (
        'CMC Regulatory Associate',
        'cmc-regulatory-associate',
        'Associate providing support for CMC regulatory documentation and submissions',
        'entry',
        'L7',
        3,
        'CMC Regulatory Specialist',
        'cmc-regulatory-affairs',
        'centralized'
    ),
    (
        'CMC Technical Writer',
        'cmc-technical-writer',
        'Technical Writer authoring CMC sections (Module 3) and supporting CMC regulatory documentation',
        'mid-level',
        'L6',
        4,
        'CMC Regulatory Manager',
        'cmc-regulatory-affairs',
        'product'
    ),

    # ===========================================
    # DEPARTMENT 5: Global Regulatory Affairs (6 roles)
    # ===========================================
    (
        'Head of US Regulatory Affairs',
        'head-of-us-regulatory-affairs',
        'Head of US Regulatory Affairs leading FDA strategy, submissions, and regulatory operations',
        'director',
        'L3',
        8,
        'SVP Regulatory Affairs',
        'global-regulatory-affairs',
        'national'
    ),
    (
        'Head of EU Regulatory Affairs',
        'head-of-eu-regulatory-affairs',
        'Head of EU Regulatory Affairs leading EMA strategy, submissions, and European regulatory operations',
        'director',
        'L3',
        8,
        'SVP Regulatory Affairs',
        'global-regulatory-affairs',
        'regional'
    ),
    (
        'US Regulatory Affairs Director',
        'us-regulatory-affairs-director',
        'Director managing US FDA submissions, regulatory strategy, and agency interactions',
        'director',
        'L4',
        7,
        'Head of US Regulatory Affairs',
        'global-regulatory-affairs',
        'national'
    ),
    (
        'EU Regulatory Affairs Director',
        'eu-regulatory-affairs-director',
        'Director managing EU EMA submissions, regulatory strategy, and European agency interactions',
        'director',
        'L4',
        7,
        'Head of EU Regulatory Affairs',
        'global-regulatory-affairs',
        'regional'
    ),
    (
        'APAC Regulatory Affairs Manager',
        'apac-regulatory-affairs-manager',
        'Manager leading regulatory strategy and submissions for APAC region (PMDA, NMPA, TGA, etc.)',
        'senior',
        'L5',
        6,
        'SVP Regulatory Affairs',
        'global-regulatory-affairs',
        'regional'
    ),
    (
        'LatAm Regulatory Affairs Manager',
        'latam-regulatory-affairs-manager',
        'Manager leading regulatory strategy and submissions for Latin America region (ANVISA, COFEPRIS, etc.)',
        'senior',
        'L5',
        6,
        'SVP Regulatory Affairs',
        'global-regulatory-affairs',
        'regional'
    ),

    # ===========================================
    # DEPARTMENT 6: Regulatory Compliance & Systems (6 roles)
    # ===========================================
    (
        'Regulatory Compliance Director',
        'regulatory-compliance-director',
        'Director leading regulatory compliance, labeling, advertising review, and regulatory quality',
        'director',
        'L4',
        7,
        'Head of Regulatory Operations',
        'regulatory-compliance-systems',
        'global'
    ),
    (
        'Regulatory Labeling Manager',
        'regulatory-labeling-manager',
        'Manager overseeing regulatory labeling strategy, development, and global harmonization',
        'senior',
        'L5',
        6,
        'Regulatory Compliance Director',
        'regulatory-compliance-systems',
        'global'
    ),
    (
        'Regulatory Compliance Manager',
        'regulatory-compliance-manager',
        'Manager ensuring regulatory compliance with GxP, CFR, and regulatory requirements',
        'senior',
        'L5',
        6,
        'Regulatory Compliance Director',
        'regulatory-compliance-systems',
        'regional'
    ),
    (
        'Regulatory Labeling Specialist',
        'regulatory-labeling-specialist',
        'Specialist developing and maintaining regulatory labeling for assigned products',
        'senior',
        'L6',
        5,
        'Regulatory Labeling Manager',
        'regulatory-compliance-systems',
        'product'
    ),
    (
        'Regulatory Systems Manager',
        'regulatory-systems-manager',
        'Manager overseeing regulatory information management systems (Veeva Vault, ARIS, etc.)',
        'senior',
        'L5',
        6,
        'Head of Regulatory Operations',
        'regulatory-compliance-systems',
        'centralized'
    ),
    (
        'Regulatory Systems Specialist',
        'regulatory-systems-specialist',
        'Specialist managing regulatory systems, publishing tools, and eCTD platforms',
        'mid-level',
        'L7',
        4,
        'Regulatory Systems Manager',
        'regulatory-compliance-systems',
        'centralized'
    ),
]

def generate_sql():
    """Generate complete SQL script"""

    sql_parts = []

    # Header
    sql_parts.append("""-- ========================================
-- CREATE 38 REGULATORY AFFAIRS ROLES
-- ========================================
-- Purpose: Create complete Regulatory Affairs organizational structure
-- Date: 2025-11-17
-- Function: Regulatory (43382f04-a819-4839-88c1-c1054d5ae071)
-- Tenant: Medical Affairs (f7aa6fd4-0af9-4706-8b31-034f1f7accda)
-- ========================================

BEGIN;

-- ========================================
-- CREATE ALL 38 REGULATORY ROLES
-- ========================================
""")

    # Generate role insertions
    for role_name, slug, description, seniority, leadership_level, career_level, reports_to, dept_slug, geo_scope in REGULATORY_ROLES:
        sql_parts.append(f"""
-- Create role: {role_name}
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  '{TENANT_ID}',
  '{FUNCTION_ID}',
  d.id,
  '{role_name}',
  '{slug}',
  '{description}',
  '{seniority}',
  '{leadership_level}',
  {career_level},
  '{reports_to}',
  '{geo_scope}',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = '{TENANT_ID}'
  AND d.slug = '{dept_slug}'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();
""")

    sql_parts.append("""
COMMIT;

SELECT 'All 38 Regulatory roles created successfully' as status;

-- ========================================
-- VALIDATION QUERIES
-- ========================================

-- Count roles by department
SELECT
  d.name as department,
  COUNT(r.id) as role_count
FROM org_departments d
LEFT JOIN org_roles r ON r.department_id = d.id AND r.deleted_at IS NULL
WHERE d.tenant_id = '{TENANT_ID}'
  AND d.function_id = '{FUNCTION_ID}'
  AND d.deleted_at IS NULL
GROUP BY d.name
ORDER BY d.name;

-- Count roles by leadership level
SELECT
  leadership_level,
  COUNT(*) as count
FROM org_roles
WHERE tenant_id = '{TENANT_ID}'
  AND function_id = '{FUNCTION_ID}'
  AND deleted_at IS NULL
GROUP BY leadership_level
ORDER BY leadership_level;

-- Show all roles
SELECT
  d.name as department,
  r.name as role_name,
  r.leadership_level,
  r.seniority_level,
  r.career_level,
  r.reports_to
FROM org_roles r
JOIN org_departments d ON d.id = r.department_id
WHERE r.tenant_id = '{TENANT_ID}'
  AND r.function_id = '{FUNCTION_ID}'
  AND r.deleted_at IS NULL
ORDER BY d.name, r.career_level DESC, r.name;
""".format(TENANT_ID=TENANT_ID, FUNCTION_ID=FUNCTION_ID))

    return '\n'.join(sql_parts)

if __name__ == '__main__':
    sql = generate_sql()
    print(sql)
