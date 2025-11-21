#!/usr/bin/env python3
"""
Generate SQL to create 43 Medical Affairs roles and map 156 personas
Based on the Medical Affairs organizational structure
"""

# Medical Affairs function_id and tenant_id
FUNCTION_ID = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
TENANT_ID = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'

# Define the 43 roles organized by department/group
# Structure: (role_name, slug, description, seniority_level, reports_to, department_slug, title_patterns)

MEDICAL_AFFAIRS_ROLES = [
    # ===========================================
    # GROUP 1: LEADERSHIP (3 roles)
    # ===========================================
    (
        'Chief Medical Officer',
        'chief-medical-officer',
        'C-Suite Medical Affairs leader responsible for overall medical strategy and operations',
        'executive',
        'CEO',
        'medical-leadership',
        ['%Chief Medical Officer%', '%CMO %']
    ),
    (
        'VP Medical Affairs',
        'vp-medical-affairs',
        'Executive VP leading Medical Affairs function globally or regionally',
        'executive',
        'Chief Medical Officer',
        'medical-leadership',
        ['%VP Medical Affairs%']
    ),
    (
        'Medical Director',
        'medical-director',
        'Medical Director leading therapeutic area or regional medical teams',
        'director',
        'VP Medical Affairs',
        'medical-leadership',
        ['%Medical Director%', '%Regional Medical Director%']
    ),

    # ===========================================
    # GROUP 2: FIELD MEDICAL (7 roles)
    # ===========================================
    (
        'Head of Field Medical',
        'head-of-field-medical',
        'Head of Field Medical leading MSL teams and field medical operations',
        'director',
        'VP Medical Affairs',
        'field-medical',
        ['%Head%Field Medical%', '%Head%MSL%']
    ),
    (
        'TA MSL Lead',
        'ta-msl-lead',
        'Therapeutic Area MSL Lead managing MSL team for specific disease area',
        'senior',
        'Head of Field Medical',
        'field-medical',
        ['%TA MSL Lead%']
    ),
    (
        'Regional Medical Director',
        'regional-medical-director',
        'Regional Medical Director overseeing field medical activities in geographic region',
        'director',
        'Head of Field Medical',
        'field-medical',
        ['%Regional Medical Director%']
    ),
    (
        'MSL Manager',
        'msl-manager',
        'MSL Manager leading team of Medical Science Liaisons',
        'senior',
        'Regional Medical Director',
        'field-medical',
        ['%MSL Manager%']
    ),
    (
        'Senior Medical Science Liaison',
        'senior-medical-science-liaison',
        'Senior MSL with advanced KOL management and strategic engagement responsibilities',
        'senior',
        'MSL Manager',
        'field-medical',
        ['%Senior MSL%', '%Senior Medical Science Liaison%']
    ),
    (
        'Medical Science Liaison',
        'medical-science-liaison',
        'Medical Science Liaison engaging with KOLs and scientific exchange',
        'mid-level',
        'MSL Manager',
        'field-medical',
        ['%MSL -%', '%Medical Science Liaison -%']
    ),
    (
        'Field Medical Trainer',
        'field-medical-trainer',
        'Field Medical Trainer developing and delivering MSL training programs',
        'senior',
        'Head of Field Medical',
        'field-medical',
        ['%Field Medical Trainer%']
    ),

    # ===========================================
    # GROUP 3: MEDICAL INFORMATION (6 roles)
    # ===========================================
    (
        'Head of Medical Information',
        'head-of-medical-information',
        'Head of Medical Information leading global or regional MI function',
        'director',
        'VP Medical Affairs',
        'medical-information',
        ['%Head Medical Information%']
    ),
    (
        'Medical Info Manager',
        'medical-info-manager',
        'Medical Information Manager leading MI operations and content',
        'senior',
        'Head of Medical Information',
        'medical-information',
        ['%Medical Info Manager%', '%Medical Information Manager%']
    ),
    (
        'Senior Medical Info Specialist',
        'senior-medical-info-specialist',
        'Senior Medical Information Specialist handling complex inquiries and training',
        'senior',
        'Medical Info Manager',
        'medical-information',
        ['%Senior Medical Info Specialist%']
    ),
    (
        'Medical Info Specialist',
        'medical-info-specialist',
        'Medical Information Specialist responding to medical inquiries',
        'mid-level',
        'Medical Info Manager',
        'medical-information',
        ['%Medical Info Specialist%']
    ),
    (
        'Medical Librarian',
        'medical-librarian',
        'Medical Librarian managing knowledge resources and literature services',
        'mid-level',
        'Head of Medical Information',
        'medical-information',
        ['%Medical Librarian%']
    ),
    (
        'Medical Content Manager',
        'medical-content-manager',
        'Medical Content Manager developing and managing medical content platforms',
        'senior',
        'Head of Medical Information',
        'medical-information',
        ['%Medical Content Manager%']
    ),

    # ===========================================
    # GROUP 4: MEDICAL COMMUNICATIONS (7 roles)
    # ===========================================
    (
        'Head Medical Communications',
        'head-medical-communications',
        'Head of Medical Communications leading publications, congress, and medical education',
        'director',
        'VP Medical Affairs',
        'medical-communications',
        ['%Head Medical Communications%']
    ),
    (
        'Medical Communications Manager',
        'medical-communications-manager',
        'Medical Communications Manager overseeing projects and cross-functional initiatives',
        'senior',
        'Head Medical Communications',
        'medical-communications',
        ['%Medical Communications Manager%']
    ),
    (
        'Publication Strategy Lead',
        'publication-strategy-lead',
        'Publication Strategy Lead managing publication planning and execution',
        'senior',
        'Head Medical Communications',
        'medical-communications',
        ['%Publication Strategy%']
    ),
    (
        'Medical Education Director',
        'medical-education-director',
        'Medical Education Director leading CME and HCP training programs',
        'director',
        'Head Medical Communications',
        'medical-communications',
        ['%Medical Education Director%']
    ),
    (
        'Medical Writer Regulatory',
        'medical-writer-regulatory',
        'Medical Writer - Regulatory focused on regulatory documents and submissions',
        'mid-level',
        'Medical Communications Manager',
        'medical-communications',
        ['%Medical Writer Regulatory%']
    ),
    (
        'Medical Writer Scientific',
        'medical-writer-scientific',
        'Medical Writer - Scientific creating scientific content and publications',
        'mid-level',
        'Medical Communications Manager',
        'medical-communications',
        ['%Medical Writer Scientific%']
    ),
    (
        'Congress Manager',
        'congress-manager',
        'Congress Manager planning and executing medical congress activities',
        'senior',
        'Head Medical Communications',
        'medical-communications',
        ['%Congress Manager%']
    ),

    # ===========================================
    # GROUP 5: PUBLICATIONS (3 roles)
    # ===========================================
    (
        'Scientific Publications Manager',
        'scientific-publications-manager',
        'Scientific Publications Manager leading publication operations and strategy',
        'senior',
        'Head Medical Communications',
        'medical-publications',
        ['%Scientific Publications Manager%']
    ),
    (
        'Medical Writer Publications',
        'medical-writer-publications',
        'Medical Writer - Publications creating manuscripts and congress materials',
        'mid-level',
        'Scientific Publications Manager',
        'medical-publications',
        ['%Medical Writer Publications%']
    ),
    (
        'Publication Coordinator',
        'publication-coordinator',
        'Publication Coordinator managing timelines, submissions, and databases',
        'mid-level',
        'Scientific Publications Manager',
        'medical-publications',
        ['%Publication Coordinator%']
    ),

    # ===========================================
    # GROUP 6: EVIDENCE & HEOR (7 roles)
    # ===========================================
    (
        'Head of Evidence & HEOR',
        'head-of-evidence-heor',
        'Head of Evidence & HEOR leading outcomes research and evidence generation',
        'director',
        'VP Medical Affairs',
        'evidence-heor',
        ['%Head%HEOR%', '%Head%Evidence%']
    ),
    (
        'HEOR Director',
        'heor-director',
        'HEOR Director leading health economics and outcomes research initiatives',
        'director',
        'Head of Evidence & HEOR',
        'evidence-heor',
        ['%HEOR Director%']
    ),
    (
        'RWE Specialist',
        'rwe-specialist',
        'Real-World Evidence Specialist designing and executing RWE studies',
        'senior',
        'HEOR Director',
        'evidence-heor',
        ['%RWE Lead%', '%RWE Specialist%']
    ),
    (
        'HEOR Analyst',
        'heor-analyst',
        'HEOR Analyst conducting health economics analysis and modeling',
        'mid-level',
        'HEOR Director',
        'evidence-heor',
        ['%HEOR Analyst%']
    ),
    (
        'Biostatistician',
        'biostatistician',
        'Biostatistician providing statistical expertise for clinical and RWE studies',
        'senior',
        'Head of Evidence & HEOR',
        'evidence-heor',
        ['%Biostatistician%']
    ),
    (
        'Epidemiologist',
        'epidemiologist',
        'Epidemiologist conducting disease burden and surveillance studies',
        'senior',
        'Head of Evidence & HEOR',
        'evidence-heor',
        ['%Epidemiologist%']
    ),
    (
        'Health Outcomes Manager',
        'health-outcomes-manager',
        'Health Outcomes Manager leading outcomes measurement and reporting',
        'senior',
        'HEOR Director',
        'evidence-heor',
        ['%Senior Health Economist%']
    ),

    # ===========================================
    # GROUP 7: CLINICAL OPERATIONS (5 roles)
    # ===========================================
    (
        'Head of Clinical Operations Support',
        'head-of-clinical-operations-support',
        'Head of Clinical Operations Support leading medical affairs clinical activities',
        'director',
        'VP Medical Affairs',
        'clinical-operations-support',
        ['%Head%Clinical%']
    ),
    (
        'Medical Monitor',
        'medical-monitor',
        'Medical Monitor providing medical oversight of clinical trials',
        'senior',
        'Head of Clinical Operations Support',
        'clinical-operations-support',
        ['%Medical Monitor%']
    ),
    (
        'Clinical Trial Physician',
        'clinical-trial-physician',
        'Clinical Trial Physician managing trial conduct and investigator relations',
        'senior',
        'Head of Clinical Operations Support',
        'clinical-operations-support',
        ['%Clinical Trial Physician%']
    ),
    (
        'Study Site Medical Lead',
        'study-site-medical-lead',
        'Study Site Medical Lead managing site selection, training, and oversight',
        'senior',
        'Head of Clinical Operations Support',
        'clinical-operations-support',
        ['%Study Site Medical Lead%']
    ),
    (
        'Safety Physician',
        'safety-physician',
        'Safety Physician conducting safety surveillance and signal detection',
        'senior',
        'Head of Clinical Operations Support',
        'clinical-operations-support',
        ['%Safety Physician%']
    ),

    # ===========================================
    # GROUP 8: MEDICAL EXCELLENCE (4 roles)
    # ===========================================
    (
        'Head of Medical Excellence',
        'head-of-medical-excellence',
        'Head of Medical Excellence leading quality, compliance, and process improvement',
        'director',
        'VP Medical Affairs',
        'medical-excellence-governance',
        ['%Head Medical Excellence%']
    ),
    (
        'Medical Quality Manager',
        'medical-quality-manager',
        'Medical Quality Manager managing QA, audits, and SOPs',
        'senior',
        'Head of Medical Excellence',
        'medical-excellence-governance',
        ['%Medical Quality Manager%']
    ),
    (
        'Medical Compliance Manager',
        'medical-compliance-manager',
        'Medical Compliance Manager ensuring regulatory and promotional compliance',
        'senior',
        'Head of Medical Excellence',
        'medical-excellence-governance',
        ['%Medical Compliance Manager%']
    ),
    (
        'Medical Training Manager',
        'medical-training-manager',
        'Medical Training Manager developing and delivering medical training programs',
        'senior',
        'Head of Medical Excellence',
        'medical-excellence-governance',
        ['%Medical Training Manager%']
    ),

    # ===========================================
    # GROUP 9: MEDICAL STRATEGY (4 roles)
    # ===========================================
    (
        'Head of Medical Strategy',
        'head-of-medical-strategy',
        'Head of Medical Strategy leading strategic planning and innovation',
        'director',
        'VP Medical Affairs',
        'medical-strategy-operations',
        ['%Head Medical Strategy%']
    ),
    (
        'Medical Business Partner',
        'medical-business-partner',
        'Medical Business Partner partnering with commercial on cross-functional strategies',
        'senior',
        'Head of Medical Strategy',
        'medical-strategy-operations',
        ['%Medical Business Partner%']
    ),
    (
        'Medical Affairs Clinical Liaison',
        'medical-affairs-clinical-liaison',
        'Medical Affairs Clinical Liaison bridging clinical development and commercial',
        'senior',
        'Head of Medical Strategy',
        'medical-strategy-operations',
        ['%Medical Affairs Clinical Liaison%']
    ),
    (
        'Medical Operations Manager',
        'medical-operations-manager',
        'Medical Operations Manager overseeing budgets, resources, and processes',
        'senior',
        'VP Medical Affairs',
        'medical-strategy-operations',
        ['%Medical Operations Manager%', '%Medical Analytics Manager%']
    ),
]

def generate_sql():
    """Generate complete SQL script"""

    sql_parts = []

    # Header
    sql_parts.append("""-- ========================================
-- CREATE 43 MEDICAL AFFAIRS ROLES & MAP 156 PERSONAS
-- ========================================
-- Purpose: Complete Medical Affairs organizational structure normalization
-- Date: 2025-11-17
-- Function: Medical Affairs (bd4cbbef-e3a2-4b22-836c-61ccfd7f042d)
-- Tenant: Medical Affairs (f7aa6fd4-0af9-4706-8b31-034f1f7accda)
-- ========================================

BEGIN;

-- ========================================
-- SECTION 1: CREATE ALL 43 ROLES
-- ========================================
""")

    # Generate role insertions
    for role_name, slug, description, seniority, reports_to, dept_slug, patterns in MEDICAL_AFFAIRS_ROLES:
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
  reports_to,
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
  '{reports_to}',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = '{TENANT_ID}'
  AND d.slug = '{dept_slug}'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();
""")

    sql_parts.append("""
COMMIT;

SELECT 'Section 1 Complete: All 43 roles created/updated' as status;

BEGIN;

-- ========================================
-- SECTION 2: MAP ALL 156 PERSONAS TO ROLES
-- ========================================
""")

    # Generate persona mappings
    for role_name, slug, description, seniority, reports_to, dept_slug, patterns in MEDICAL_AFFAIRS_ROLES:
        if not patterns:
            continue

        pattern_condition = ' OR '.join([f"p.title ILIKE '{pattern}'" for pattern in patterns])

        sql_parts.append(f"""
-- Map personas to role: {slug}
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = '{TENANT_ID}'
  AND p.deleted_at IS NULL
  AND r.tenant_id = '{TENANT_ID}'
  AND r.slug = '{slug}'
  AND ({pattern_condition});
""")

    sql_parts.append("""
COMMIT;

SELECT 'Section 2 Complete: All personas mapped to roles' as status;

-- ========================================
-- VALIDATION QUERIES
-- ========================================

-- Check Medical Affairs mapping status
SELECT
  COUNT(*) as total_ma_personas,
  COUNT(function_id) as has_function,
  COUNT(department_id) as has_department,
  COUNT(role_id) as has_role,
  COUNT(*) - COUNT(role_id) as unmapped_roles
FROM personas
WHERE tenant_id = '{TENANT_ID}'
  AND deleted_at IS NULL
  AND function_id = '{FUNCTION_ID}';

-- Show distribution by role
SELECT
  r.name as role_name,
  COUNT(p.id) as persona_count
FROM org_roles r
LEFT JOIN personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.tenant_id = '{TENANT_ID}'
  AND r.function_id = '{FUNCTION_ID}'
GROUP BY r.name
ORDER BY persona_count DESC;

-- Show any unmapped personas
SELECT title
FROM personas
WHERE tenant_id = '{TENANT_ID}'
  AND deleted_at IS NULL
  AND function_id = '{FUNCTION_ID}'
  AND role_id IS NULL
ORDER BY title;
""")

    return '\n'.join(sql_parts)

if __name__ == '__main__':
    sql = generate_sql()
    print(sql)
