-- ========================================
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


-- Create role: Chief Medical Officer
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Chief Medical Officer',
  'chief-medical-officer',
  'C-Suite Medical Affairs leader responsible for overall medical strategy and operations',
  'executive',
  'CEO',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-leadership'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: VP Medical Affairs
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'VP Medical Affairs',
  'vp-medical-affairs',
  'Executive VP leading Medical Affairs function globally or regionally',
  'executive',
  'Chief Medical Officer',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-leadership'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Director
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Director',
  'medical-director',
  'Medical Director leading therapeutic area or regional medical teams',
  'director',
  'VP Medical Affairs',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-leadership'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Head of Field Medical
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Head of Field Medical',
  'head-of-field-medical',
  'Head of Field Medical leading MSL teams and field medical operations',
  'director',
  'VP Medical Affairs',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'field-medical'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: TA MSL Lead
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'TA MSL Lead',
  'ta-msl-lead',
  'Therapeutic Area MSL Lead managing MSL team for specific disease area',
  'senior',
  'Head of Field Medical',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'field-medical'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Regional Medical Director
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Regional Medical Director',
  'regional-medical-director',
  'Regional Medical Director overseeing field medical activities in geographic region',
  'director',
  'Head of Field Medical',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'field-medical'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: MSL Manager
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'MSL Manager',
  'msl-manager',
  'MSL Manager leading team of Medical Science Liaisons',
  'senior',
  'Regional Medical Director',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'field-medical'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Senior Medical Science Liaison
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Senior Medical Science Liaison',
  'senior-medical-science-liaison',
  'Senior MSL with advanced KOL management and strategic engagement responsibilities',
  'senior',
  'MSL Manager',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'field-medical'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Science Liaison
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Science Liaison',
  'medical-science-liaison',
  'Medical Science Liaison engaging with KOLs and scientific exchange',
  'mid-level',
  'MSL Manager',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'field-medical'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Field Medical Trainer
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Field Medical Trainer',
  'field-medical-trainer',
  'Field Medical Trainer developing and delivering MSL training programs',
  'senior',
  'Head of Field Medical',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'field-medical'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Head of Medical Information
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Head of Medical Information',
  'head-of-medical-information',
  'Head of Medical Information leading global or regional MI function',
  'director',
  'VP Medical Affairs',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-information'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Info Manager
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Info Manager',
  'medical-info-manager',
  'Medical Information Manager leading MI operations and content',
  'senior',
  'Head of Medical Information',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-information'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Senior Medical Info Specialist
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Senior Medical Info Specialist',
  'senior-medical-info-specialist',
  'Senior Medical Information Specialist handling complex inquiries and training',
  'senior',
  'Medical Info Manager',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-information'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Info Specialist
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Info Specialist',
  'medical-info-specialist',
  'Medical Information Specialist responding to medical inquiries',
  'mid-level',
  'Medical Info Manager',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-information'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Librarian
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Librarian',
  'medical-librarian',
  'Medical Librarian managing knowledge resources and literature services',
  'mid-level',
  'Head of Medical Information',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-information'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Content Manager
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Content Manager',
  'medical-content-manager',
  'Medical Content Manager developing and managing medical content platforms',
  'senior',
  'Head of Medical Information',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-information'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Head Medical Communications
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Head Medical Communications',
  'head-medical-communications',
  'Head of Medical Communications leading publications, congress, and medical education',
  'director',
  'VP Medical Affairs',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-communications'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Communications Manager
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Communications Manager',
  'medical-communications-manager',
  'Medical Communications Manager overseeing projects and cross-functional initiatives',
  'senior',
  'Head Medical Communications',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-communications'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Publication Strategy Lead
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Publication Strategy Lead',
  'publication-strategy-lead',
  'Publication Strategy Lead managing publication planning and execution',
  'senior',
  'Head Medical Communications',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-communications'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Education Director
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Education Director',
  'medical-education-director',
  'Medical Education Director leading CME and HCP training programs',
  'director',
  'Head Medical Communications',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-communications'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Writer Regulatory
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Writer Regulatory',
  'medical-writer-regulatory',
  'Medical Writer - Regulatory focused on regulatory documents and submissions',
  'mid-level',
  'Medical Communications Manager',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-communications'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Writer Scientific
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Writer Scientific',
  'medical-writer-scientific',
  'Medical Writer - Scientific creating scientific content and publications',
  'mid-level',
  'Medical Communications Manager',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-communications'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Congress Manager
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Congress Manager',
  'congress-manager',
  'Congress Manager planning and executing medical congress activities',
  'senior',
  'Head Medical Communications',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-communications'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Scientific Publications Manager
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Scientific Publications Manager',
  'scientific-publications-manager',
  'Scientific Publications Manager leading publication operations and strategy',
  'senior',
  'Head Medical Communications',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-publications'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Writer Publications
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Writer Publications',
  'medical-writer-publications',
  'Medical Writer - Publications creating manuscripts and congress materials',
  'mid-level',
  'Scientific Publications Manager',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-publications'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Publication Coordinator
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Publication Coordinator',
  'publication-coordinator',
  'Publication Coordinator managing timelines, submissions, and databases',
  'mid-level',
  'Scientific Publications Manager',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-publications'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Head of Evidence & HEOR
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Head of Evidence & HEOR',
  'head-of-evidence-heor',
  'Head of Evidence & HEOR leading outcomes research and evidence generation',
  'director',
  'VP Medical Affairs',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'evidence-heor'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: HEOR Director
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'HEOR Director',
  'heor-director',
  'HEOR Director leading health economics and outcomes research initiatives',
  'director',
  'Head of Evidence & HEOR',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'evidence-heor'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: RWE Specialist
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'RWE Specialist',
  'rwe-specialist',
  'Real-World Evidence Specialist designing and executing RWE studies',
  'senior',
  'HEOR Director',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'evidence-heor'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: HEOR Analyst
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'HEOR Analyst',
  'heor-analyst',
  'HEOR Analyst conducting health economics analysis and modeling',
  'mid-level',
  'HEOR Director',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'evidence-heor'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Biostatistician
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Biostatistician',
  'biostatistician',
  'Biostatistician providing statistical expertise for clinical and RWE studies',
  'senior',
  'Head of Evidence & HEOR',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'evidence-heor'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Epidemiologist
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Epidemiologist',
  'epidemiologist',
  'Epidemiologist conducting disease burden and surveillance studies',
  'senior',
  'Head of Evidence & HEOR',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'evidence-heor'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Health Outcomes Manager
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Health Outcomes Manager',
  'health-outcomes-manager',
  'Health Outcomes Manager leading outcomes measurement and reporting',
  'senior',
  'HEOR Director',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'evidence-heor'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Head of Clinical Operations Support
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Head of Clinical Operations Support',
  'head-of-clinical-operations-support',
  'Head of Clinical Operations Support leading medical affairs clinical activities',
  'director',
  'VP Medical Affairs',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'clinical-operations-support'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Monitor
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Monitor',
  'medical-monitor',
  'Medical Monitor providing medical oversight of clinical trials',
  'senior',
  'Head of Clinical Operations Support',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'clinical-operations-support'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Clinical Trial Physician
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Clinical Trial Physician',
  'clinical-trial-physician',
  'Clinical Trial Physician managing trial conduct and investigator relations',
  'senior',
  'Head of Clinical Operations Support',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'clinical-operations-support'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Study Site Medical Lead
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Study Site Medical Lead',
  'study-site-medical-lead',
  'Study Site Medical Lead managing site selection, training, and oversight',
  'senior',
  'Head of Clinical Operations Support',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'clinical-operations-support'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Safety Physician
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Safety Physician',
  'safety-physician',
  'Safety Physician conducting safety surveillance and signal detection',
  'senior',
  'Head of Clinical Operations Support',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'clinical-operations-support'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Head of Medical Excellence
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Head of Medical Excellence',
  'head-of-medical-excellence',
  'Head of Medical Excellence leading quality, compliance, and process improvement',
  'director',
  'VP Medical Affairs',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-excellence-governance'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Quality Manager
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Quality Manager',
  'medical-quality-manager',
  'Medical Quality Manager managing QA, audits, and SOPs',
  'senior',
  'Head of Medical Excellence',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-excellence-governance'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Compliance Manager
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Compliance Manager',
  'medical-compliance-manager',
  'Medical Compliance Manager ensuring regulatory and promotional compliance',
  'senior',
  'Head of Medical Excellence',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-excellence-governance'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Training Manager
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Training Manager',
  'medical-training-manager',
  'Medical Training Manager developing and delivering medical training programs',
  'senior',
  'Head of Medical Excellence',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-excellence-governance'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Head of Medical Strategy
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Head of Medical Strategy',
  'head-of-medical-strategy',
  'Head of Medical Strategy leading strategic planning and innovation',
  'director',
  'VP Medical Affairs',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-strategy-operations'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Business Partner
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Business Partner',
  'medical-business-partner',
  'Medical Business Partner partnering with commercial on cross-functional strategies',
  'senior',
  'Head of Medical Strategy',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-strategy-operations'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Affairs Clinical Liaison
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Affairs Clinical Liaison',
  'medical-affairs-clinical-liaison',
  'Medical Affairs Clinical Liaison bridging clinical development and commercial',
  'senior',
  'Head of Medical Strategy',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-strategy-operations'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- Create role: Medical Operations Manager
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
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  d.id,
  'Medical Operations Manager',
  'medical-operations-manager',
  'Medical Operations Manager overseeing budgets, resources, and processes',
  'senior',
  'VP Medical Affairs',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'medical-strategy-operations'
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


COMMIT;

SELECT 'Section 1 Complete: All 43 roles created/updated' as status;

BEGIN;

-- ========================================
-- SECTION 2: MAP ALL 156 PERSONAS TO ROLES
-- ========================================


-- Map personas to role: chief-medical-officer
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'chief-medical-officer'
  AND (p.title ILIKE '%Chief Medical Officer%' OR p.title ILIKE '%CMO %');


-- Map personas to role: vp-medical-affairs
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'vp-medical-affairs'
  AND (p.title ILIKE '%VP Medical Affairs%');


-- Map personas to role: medical-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-director'
  AND (p.title ILIKE '%Medical Director%' OR p.title ILIKE '%Regional Medical Director%');


-- Map personas to role: head-of-field-medical
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'head-of-field-medical'
  AND (p.title ILIKE '%Head%Field Medical%' OR p.title ILIKE '%Head%MSL%');


-- Map personas to role: ta-msl-lead
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'ta-msl-lead'
  AND (p.title ILIKE '%TA MSL Lead%');


-- Map personas to role: regional-medical-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'regional-medical-director'
  AND (p.title ILIKE '%Regional Medical Director%');


-- Map personas to role: msl-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'msl-manager'
  AND (p.title ILIKE '%MSL Manager%');


-- Map personas to role: senior-medical-science-liaison
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'senior-medical-science-liaison'
  AND (p.title ILIKE '%Senior MSL%' OR p.title ILIKE '%Senior Medical Science Liaison%');


-- Map personas to role: medical-science-liaison
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-science-liaison'
  AND (p.title ILIKE '%MSL -%' OR p.title ILIKE '%Medical Science Liaison -%');


-- Map personas to role: field-medical-trainer
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'field-medical-trainer'
  AND (p.title ILIKE '%Field Medical Trainer%');


-- Map personas to role: head-of-medical-information
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'head-of-medical-information'
  AND (p.title ILIKE '%Head Medical Information%');


-- Map personas to role: medical-info-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-info-manager'
  AND (p.title ILIKE '%Medical Info Manager%' OR p.title ILIKE '%Medical Information Manager%');


-- Map personas to role: senior-medical-info-specialist
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'senior-medical-info-specialist'
  AND (p.title ILIKE '%Senior Medical Info Specialist%');


-- Map personas to role: medical-info-specialist
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-info-specialist'
  AND (p.title ILIKE '%Medical Info Specialist%');


-- Map personas to role: medical-librarian
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-librarian'
  AND (p.title ILIKE '%Medical Librarian%');


-- Map personas to role: medical-content-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-content-manager'
  AND (p.title ILIKE '%Medical Content Manager%');


-- Map personas to role: head-medical-communications
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'head-medical-communications'
  AND (p.title ILIKE '%Head Medical Communications%');


-- Map personas to role: medical-communications-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-communications-manager'
  AND (p.title ILIKE '%Medical Communications Manager%');


-- Map personas to role: publication-strategy-lead
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'publication-strategy-lead'
  AND (p.title ILIKE '%Publication Strategy%');


-- Map personas to role: medical-education-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-education-director'
  AND (p.title ILIKE '%Medical Education Director%');


-- Map personas to role: medical-writer-regulatory
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-writer-regulatory'
  AND (p.title ILIKE '%Medical Writer Regulatory%');


-- Map personas to role: medical-writer-scientific
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-writer-scientific'
  AND (p.title ILIKE '%Medical Writer Scientific%');


-- Map personas to role: congress-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'congress-manager'
  AND (p.title ILIKE '%Congress Manager%');


-- Map personas to role: scientific-publications-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'scientific-publications-manager'
  AND (p.title ILIKE '%Scientific Publications Manager%');


-- Map personas to role: medical-writer-publications
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-writer-publications'
  AND (p.title ILIKE '%Medical Writer Publications%');


-- Map personas to role: publication-coordinator
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'publication-coordinator'
  AND (p.title ILIKE '%Publication Coordinator%');


-- Map personas to role: head-of-evidence-heor
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'head-of-evidence-heor'
  AND (p.title ILIKE '%Head%HEOR%' OR p.title ILIKE '%Head%Evidence%');


-- Map personas to role: heor-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'heor-director'
  AND (p.title ILIKE '%HEOR Director%');


-- Map personas to role: rwe-specialist
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'rwe-specialist'
  AND (p.title ILIKE '%RWE Lead%' OR p.title ILIKE '%RWE Specialist%');


-- Map personas to role: heor-analyst
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'heor-analyst'
  AND (p.title ILIKE '%HEOR Analyst%');


-- Map personas to role: biostatistician
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'biostatistician'
  AND (p.title ILIKE '%Biostatistician%');


-- Map personas to role: epidemiologist
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'epidemiologist'
  AND (p.title ILIKE '%Epidemiologist%');


-- Map personas to role: health-outcomes-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'health-outcomes-manager'
  AND (p.title ILIKE '%Senior Health Economist%');


-- Map personas to role: head-of-clinical-operations-support
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'head-of-clinical-operations-support'
  AND (p.title ILIKE '%Head%Clinical%');


-- Map personas to role: medical-monitor
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-monitor'
  AND (p.title ILIKE '%Medical Monitor%');


-- Map personas to role: clinical-trial-physician
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'clinical-trial-physician'
  AND (p.title ILIKE '%Clinical Trial Physician%');


-- Map personas to role: study-site-medical-lead
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'study-site-medical-lead'
  AND (p.title ILIKE '%Study Site Medical Lead%');


-- Map personas to role: safety-physician
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'safety-physician'
  AND (p.title ILIKE '%Safety Physician%');


-- Map personas to role: head-of-medical-excellence
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'head-of-medical-excellence'
  AND (p.title ILIKE '%Head Medical Excellence%');


-- Map personas to role: medical-quality-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-quality-manager'
  AND (p.title ILIKE '%Medical Quality Manager%');


-- Map personas to role: medical-compliance-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-compliance-manager'
  AND (p.title ILIKE '%Medical Compliance Manager%');


-- Map personas to role: medical-training-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-training-manager'
  AND (p.title ILIKE '%Medical Training Manager%');


-- Map personas to role: head-of-medical-strategy
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'head-of-medical-strategy'
  AND (p.title ILIKE '%Head Medical Strategy%');


-- Map personas to role: medical-business-partner
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-business-partner'
  AND (p.title ILIKE '%Medical Business Partner%');


-- Map personas to role: medical-affairs-clinical-liaison
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-affairs-clinical-liaison'
  AND (p.title ILIKE '%Medical Affairs Clinical Liaison%');


-- Map personas to role: medical-operations-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-operations-manager'
  AND (p.title ILIKE '%Medical Operations Manager%' OR p.title ILIKE '%Medical Analytics Manager%');


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

