-- ========================================
-- MARKET ACCESS ORGANIZATIONAL MAPPING REMEDIATION
-- ========================================
-- Date: 2025-11-17
-- Purpose: Create 53 Market Access roles and map 157 personas
-- Function: Market Access (4087be09-38e0-4c84-81e6-f79dd38151d3)
-- Tenant: Medical Affairs (f7aa6fd4-0af9-4706-8b31-034f1f7accda)
--
-- This script:
-- 1. Creates 53 Market Access roles in org_roles table
-- 2. Links each role to correct department via department_id
-- 3. Maps personas to roles based on title matching
-- 4. Updates all Market Access personas with function_id, department_id, role_id
-- ========================================

BEGIN;

-- ========================================
-- STEP 1: INSERT 53 MARKET ACCESS ROLES
-- ========================================

-- Role 1: Chief Market Access Officer
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'd776caa9-451c-407c-8902-8c185a00c22b',
  'Chief Market Access Officer',
  'chief-market-access-officer',
  'C-Suite Executive leading entire MA function globally',
  'executive',
  'CEO',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 2: VP Market Access
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'd776caa9-451c-407c-8902-8c185a00c22b',
  'VP Market Access',
  'vp-market-access',
  'Executive leading global/regional MA strategy',
  'executive',
  'CMAO / CCO',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 3: Senior Director Market Access
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'd776caa9-451c-407c-8902-8c185a00c22b',
  'Senior Director Market Access',
  'senior-director-market-access',
  'Senior leadership for major region or TA',
  'senior',
  'VP Market Access',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 4: Head of HEOR
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'be5ef154-4196-4531-9a40-87ae13295895',
  'Head of HEOR',
  'heor-head-of-heor',
  'Leads global HEOR strategy and evidence generation',
  'senior',
  'VP Market Access',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 5: HEOR Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'be5ef154-4196-4531-9a40-87ae13295895',
  'HEOR Director',
  'heor-heor-director',
  'Leads regional HEOR activities and HTA submissions',
  'senior',
  'Head of HEOR',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 6: Senior HEOR Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'be5ef154-4196-4531-9a40-87ae13295895',
  'Senior HEOR Manager',
  'heor-senior-heor-manager',
  'Manages HEOR projects and economic modeling',
  'senior',
  'HEOR Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 7: HEOR Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'be5ef154-4196-4531-9a40-87ae13295895',
  'HEOR Manager',
  'heor-heor-manager',
  'Manages HEOR projects and team members',
  'senior',
  'HEOR Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 8: Senior Health Economist
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'be5ef154-4196-4531-9a40-87ae13295895',
  'Senior Health Economist',
  'heor-senior-health-economist',
  'Develops economic models and conducts analyses',
  'mid',
  'HEOR Manager',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 9: Health Economist
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'be5ef154-4196-4531-9a40-87ae13295895',
  'Health Economist',
  'heor-health-economist',
  'Conducts economic modeling and data analysis',
  'mid',
  'HEOR Manager',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 10: Health Economics Analyst
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'be5ef154-4196-4531-9a40-87ae13295895',
  'Health Economics Analyst',
  'heor-health-economics-analyst',
  'Supports data extraction and model updates',
  'mid',
  'Health Economist',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 11: HEOR Associate
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'be5ef154-4196-4531-9a40-87ae13295895',
  'HEOR Associate',
  'heor-heor-associate',
  'Entry-level literature searches and data entry',
  'entry',
  'Health Economist',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 12: Head of Value & Evidence
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'a9a2315e-a093-42df-b5db-de9fefc752a4',
  'Head of Value & Evidence',
  'veo-head-of-value-evidence',
  'Leads global value proposition and RWE strategy',
  'senior',
  'VP Market Access',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 13: Value & Evidence Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'a9a2315e-a093-42df-b5db-de9fefc752a4',
  'Value & Evidence Director',
  'veo-value-evidence-director',
  'Leads regional value strategy and evidence generation',
  'senior',
  'Head of Value & Evidence',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 14: Senior Value & Evidence Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'a9a2315e-a093-42df-b5db-de9fefc752a4',
  'Senior Value & Evidence Manager',
  'veo-senior-value-evidence-manager',
  'Manages value projects and RWE studies',
  'senior',
  'V&E Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 15: RWE & Outcomes Lead
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'a9a2315e-a093-42df-b5db-de9fefc752a4',
  'RWE & Outcomes Lead',
  'veo-rwe-outcomes-lead',
  'Leads real-world evidence and outcomes research',
  'senior',
  'V&E Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 16: Value Evidence Specialist
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'a9a2315e-a093-42df-b5db-de9fefc752a4',
  'Value Evidence Specialist',
  'veo-value-evidence-specialist',
  'Develops value propositions and evidence packages',
  'mid',
  'V&E Manager',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 17: Outcomes Research Analyst
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'a9a2315e-a093-42df-b5db-de9fefc752a4',
  'Outcomes Research Analyst',
  'veo-outcomes-research-analyst',
  'Conducts outcomes research and data analysis',
  'mid',
  'RWE Lead',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 18: Head of Pricing Strategy
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  'Head of Pricing Strategy',
  'pricing-head-of-pricing-strategy',
  'Leads global pricing and reimbursement strategy',
  'senior',
  'VP Market Access',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 19: Global Pricing Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  'Global Pricing Director',
  'pricing-global-pricing-director',
  'Directs global pricing strategy and launch pricing',
  'senior',
  'Head of Pricing',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 20: Reimbursement Strategy Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  'Reimbursement Strategy Director',
  'pricing-reimbursement-strategy-director',
  'Directs reimbursement pathways and strategies',
  'senior',
  'Head of Pricing',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 21: Senior Pricing Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  'Senior Pricing Manager',
  'pricing-senior-pricing-manager',
  'Manages pricing analytics and strategy execution',
  'senior',
  'Pricing Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 22: Reimbursement Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  'Reimbursement Manager',
  'pricing-reimbursement-manager',
  'Manages reimbursement pathways and payer strategies',
  'senior',
  'Reimbursement Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 23: Pricing Analyst
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  'Pricing Analyst',
  'pricing-pricing-analyst',
  'Analyzes pricing data and competitive intelligence',
  'mid',
  'Pricing Manager',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 24: Market Access Analyst
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  'Market Access Analyst',
  'pricing-market-access-analyst',
  'Supports MA analytics and reporting',
  'mid',
  'Pricing Manager',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 25: Head of Payer Relations
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '55734f5f-fa05-4955-bb7c-30bc6df979fc',
  'Head of Payer Relations',
  'payer-head-of-payer-relations',
  'Leads national payer strategy and relationships',
  'senior',
  'VP Market Access',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 26: National Payer Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '55734f5f-fa05-4955-bb7c-30bc6df979fc',
  'National Payer Director',
  'payer-national-payer-director',
  'Directs national payer accounts and contracts',
  'senior',
  'Head of Payer Relations',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 27: Regional Payer Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '55734f5f-fa05-4955-bb7c-30bc6df979fc',
  'Regional Payer Director',
  'payer-regional-payer-director',
  'Directs regional payer relationships',
  'senior',
  'Head of Payer Relations',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 28: Payer Account Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '55734f5f-fa05-4955-bb7c-30bc6df979fc',
  'Payer Account Director',
  'payer-payer-account-director',
  'Manages key payer accounts and contracts. Negotiates formulary access and prior authorization policies.',
  'senior',
  'Regional Payer Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 29: Payer Account Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '55734f5f-fa05-4955-bb7c-30bc6df979fc',
  'Payer Account Manager',
  'payer-payer-account-manager',
  'Manages payer relationships and formulary access. Coordinates payer communications and contracting.',
  'mid',
  'Payer Account Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 30: Payer Account Executive
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '55734f5f-fa05-4955-bb7c-30bc6df979fc',
  'Payer Account Executive',
  'payer-payer-account-executive',
  'Executes payer engagement and contracting activities. Supports account management and payer communications.',
  'mid',
  'Payer Account Manager',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 31: Head of Patient Access
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '86ea15a1-cc79-42a7-a8bd-ace52dee81cf',
  'Head of Patient Access',
  'patient-head-of-patient-access',
  'Leads patient assistance programs, hub services, and affordability initiatives. Ensures patient access to therapies.',
  'senior',
  'VP Market Access',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 32: Patient Services Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '86ea15a1-cc79-42a7-a8bd-ace52dee81cf',
  'Patient Services Director',
  'patient-patient-services-director',
  'Directs patient services operations including PAPs, co-pay assistance, and hub services.',
  'senior',
  'Head of Patient Access',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 33: Hub Services Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '86ea15a1-cc79-42a7-a8bd-ace52dee81cf',
  'Hub Services Manager',
  'patient-hub-services-manager',
  'Manages hub operations and patient support services. Oversees benefits investigation and prior authorization support.',
  'senior',
  'Patient Services Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 34: Reimbursement Support Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '86ea15a1-cc79-42a7-a8bd-ace52dee81cf',
  'Reimbursement Support Manager',
  'patient-reimbursement-support-manager',
  'Manages reimbursement support services, appeals, and patient assistance coordination.',
  'senior',
  'Patient Services Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 35: Patient Access Specialist
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '86ea15a1-cc79-42a7-a8bd-ace52dee81cf',
  'Patient Access Specialist',
  'patient-patient-access-specialist',
  'Supports patient access programs, benefits verification, and prior authorization processes.',
  'mid',
  'Hub Services Manager',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 36: Patient Access Coordinator
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '86ea15a1-cc79-42a7-a8bd-ace52dee81cf',
  'Patient Access Coordinator',
  'patient-patient-access-coordinator',
  'Coordinates patient assistance activities, benefits verification, and enrollment support.',
  'mid',
  'Patient Access Specialist',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 37: Head of Government Affairs
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '98091f0a-bba3-41e3-bd23-f91b386a966b',
  'Head of Government Affairs',
  'govt-head-of-government-affairs',
  'Leads government relations, Medicare/Medicaid strategy, and policy advocacy efforts.',
  'senior',
  'VP Market Access',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 38: Government Relations Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '98091f0a-bba3-41e3-bd23-f91b386a966b',
  'Government Relations Director',
  'govt-government-relations-director',
  'Directs government programs (Medicare/Medicaid/340B) and policy advocacy initiatives.',
  'senior',
  'Head of Government Affairs',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 39: Policy & Advocacy Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '98091f0a-bba3-41e3-bd23-f91b386a966b',
  'Policy & Advocacy Manager',
  'govt-policy-advocacy-manager',
  'Manages policy development, advocacy efforts, and legislative monitoring activities.',
  'senior',
  'Government Relations Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 40: Government Affairs Specialist
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '98091f0a-bba3-41e3-bd23-f91b386a966b',
  'Government Affairs Specialist',
  'govt-government-affairs-specialist',
  'Supports government programs compliance and policy analysis. Manages government price reporting.',
  'mid',
  'Policy & Advocacy Manager',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 41: Policy Analyst
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '98091f0a-bba3-41e3-bd23-f91b386a966b',
  'Policy Analyst',
  'govt-policy-analyst',
  'Analyzes policy and regulatory developments. Supports government affairs initiatives and reporting.',
  'mid',
  'Government Affairs Specialist',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 42: Head of Trade Relations
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'a2fb0358-5877-4cfc-bf13-223c4e7d7d4d',
  'Head of Trade Relations',
  'trade-head-of-trade-relations',
  'Leads GPO/IDN strategy, specialty pharmacy networks, and distribution channel management.',
  'senior',
  'VP Market Access',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 43: GPO/IDN Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'a2fb0358-5877-4cfc-bf13-223c4e7d7d4d',
  'GPO/IDN Director',
  'trade-gpo-idn-director',
  'Directs GPO and IDN contracting relationships. Manages specialty pharmacy partnerships.',
  'senior',
  'Head of Trade Relations',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 44: Trade Channel Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'a2fb0358-5877-4cfc-bf13-223c4e7d7d4d',
  'Trade Channel Manager',
  'trade-trade-channel-manager',
  'Manages specialty pharmacy networks and distribution channels. Oversees trade terms and contracting.',
  'senior',
  'GPO/IDN Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 45: Distribution Analyst
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'a2fb0358-5877-4cfc-bf13-223c4e7d7d4d',
  'Distribution Analyst',
  'trade-distribution-analyst',
  'Analyzes distribution data, channel performance, and trade analytics. Supports contracting activities.',
  'mid',
  'Trade Channel Manager',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 46: Head of MA Analytics
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '7d90e4b9-984f-4e1e-bcf8-c307a748d996',
  'Head of MA Analytics',
  'analytics-head-of-ma-analytics',
  'Leads payer intelligence, market insights, and analytics strategy for market access.',
  'senior',
  'VP Market Access',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 47: Market Access Analytics Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '7d90e4b9-984f-4e1e-bcf8-c307a748d996',
  'Market Access Analytics Director',
  'analytics-ma-analytics-director',
  'Directs MA analytics, reporting strategy, and payer intelligence operations.',
  'senior',
  'Head of MA Analytics',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 48: Senior MA Analyst
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '7d90e4b9-984f-4e1e-bcf8-c307a748d996',
  'Senior MA Analyst',
  'analytics-senior-ma-analyst',
  'Conducts advanced payer analysis, formulary tracking, and market access landscape analysis.',
  'mid',
  'MA Analytics Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 49: MA Data Analyst
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  '7d90e4b9-984f-4e1e-bcf8-c307a748d996',
  'MA Data Analyst',
  'analytics-ma-data-analyst',
  'Analyzes payer data, coverage policies, and market access metrics. Creates dashboards and reports.',
  'mid',
  'Senior MA Analyst',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 50: MA Operations Director
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'f6c0c098-102e-45dc-9d55-42c6d3350a47',
  'MA Operations Director',
  'operations-ma-operations-director',
  'Directs MA operations, strategic planning, and process excellence initiatives.',
  'senior',
  'VP Market Access',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 51: MA Strategy & Planning Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'f6c0c098-102e-45dc-9d55-42c6d3350a47',
  'MA Strategy & Planning Manager',
  'operations-ma-strategy-planning-manager',
  'Manages MA strategic planning, budget coordination, and cross-functional initiatives.',
  'senior',
  'MA Operations Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 52: MA Process Excellence Manager
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'f6c0c098-102e-45dc-9d55-42c6d3350a47',
  'MA Process Excellence Manager',
  'operations-ma-process-excellence-manager',
  'Manages process optimization, standardization, and continuous improvement for MA function.',
  'senior',
  'MA Operations Director',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();

-- Role 53: MA Operations Coordinator
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
) VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '4087be09-38e0-4c84-81e6-f79dd38151d3',
  'f6c0c098-102e-45dc-9d55-42c6d3350a47',
  'MA Operations Coordinator',
  'operations-ma-operations-coordinator',
  'Coordinates MA operations activities, reporting, and administrative support functions.',
  'mid',
  'MA Ops Manager',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  department_id = EXCLUDED.department_id,
  function_id = EXCLUDED.function_id,
  reports_to = EXCLUDED.reports_to,
  updated_at = NOW();


-- ========================================
-- STEP 2: UPDATE MARKET ACCESS PERSONAS
-- ========================================
-- Setting function_id for all Market Access personas
-- ========================================

UPDATE personas
SET
  function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3',
  updated_at = NOW()
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
  AND (
    title ILIKE '%market access%'
    OR title ILIKE '%HEOR%'
    OR title ILIKE '%health economist%'
    OR title ILIKE '%VEO%'
    OR title ILIKE '%value evidence%'
    OR title ILIKE '%pricing%'
    OR title ILIKE '%reimbursement%'
    OR title ILIKE '%payer%'
    OR title ILIKE '%patient access%'
    OR title ILIKE '%patient services%'
    OR title ILIKE '%hub services%'
    OR title ILIKE '%government affairs%'
    OR title ILIKE '%trade%'
    OR title ILIKE '%GPO%'
    OR title ILIKE '%IDN%'
    OR title ILIKE '%MA analytics%'
    OR title ILIKE '%MA operations%'
  );


-- ========================================
-- STEP 3: MAP PERSONAS TO ROLES BY TITLE
-- ========================================

-- Map personas to role: chief-market-access-officer
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'd776caa9-451c-407c-8902-8c185a00c22b',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'chief-market-access-officer'
  AND (
    p.title ILIKE '%chief market access%'
    OR p.title ILIKE '%CMAO%'
  );

-- Map personas to role: vp-market-access
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'd776caa9-451c-407c-8902-8c185a00c22b',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'vp-market-access'
  AND (
    p.title ILIKE '%VP market access%'
    OR p.title ILIKE '%vice president market access%'
  );

-- Map personas to role: senior-director-market-access
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'd776caa9-451c-407c-8902-8c185a00c22b',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'senior-director-market-access'
  AND (
    p.title ILIKE '%senior director market access%'
  );

-- Map personas to role: heor-head-of-heor
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'be5ef154-4196-4531-9a40-87ae13295895',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'heor-head-of-heor'
  AND (
    p.title ILIKE '%head of HEOR%'
    OR p.title ILIKE '%head of health economics%'
  );

-- Map personas to role: heor-heor-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'be5ef154-4196-4531-9a40-87ae13295895',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'heor-heor-director'
  AND (
    p.title ILIKE '%HEOR director%'
    OR p.title ILIKE '%director of HEOR%'
    OR p.title ILIKE '%director of health economics%'
  );

-- Map personas to role: heor-senior-heor-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'be5ef154-4196-4531-9a40-87ae13295895',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'heor-senior-heor-manager'
  AND (
    p.title ILIKE '%senior HEOR manager%'
  );

-- Map personas to role: heor-heor-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'be5ef154-4196-4531-9a40-87ae13295895',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'heor-heor-manager'
  AND (
    p.title ILIKE '%HEOR manager%'
  );

-- Map personas to role: heor-senior-health-economist
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'be5ef154-4196-4531-9a40-87ae13295895',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'heor-senior-health-economist'
  AND (
    p.title ILIKE '%senior health economist%'
    OR p.title ILIKE '%senior economist%'
  );

-- Map personas to role: heor-health-economist
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'be5ef154-4196-4531-9a40-87ae13295895',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'heor-health-economist'
  AND (
    p.title ILIKE '%health economist%'
  );

-- Map personas to role: heor-health-economics-analyst
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'be5ef154-4196-4531-9a40-87ae13295895',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'heor-health-economics-analyst'
  AND (
    p.title ILIKE '%health economics analyst%'
    OR p.title ILIKE '%HEOR analyst%'
  );

-- Map personas to role: heor-heor-associate
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'be5ef154-4196-4531-9a40-87ae13295895',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'heor-heor-associate'
  AND (
    p.title ILIKE '%HEOR associate%'
  );

-- Map personas to role: veo-head-of-value-evidence
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'a9a2315e-a093-42df-b5db-de9fefc752a4',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'veo-head-of-value-evidence'
  AND (
    p.title ILIKE '%head of VEO%'
    OR p.title ILIKE '%head of value%'
    OR p.title ILIKE '%head of evidence%'
  );

-- Map personas to role: veo-value-evidence-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'a9a2315e-a093-42df-b5db-de9fefc752a4',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'veo-value-evidence-director'
  AND (
    p.title ILIKE '%VEO director%'
    OR p.title ILIKE '%value evidence director%'
  );

-- Map personas to role: veo-rwe-outcomes-lead
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'a9a2315e-a093-42df-b5db-de9fefc752a4',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'veo-rwe-outcomes-lead'
  AND (
    p.title ILIKE '%RWE lead%'
    OR p.title ILIKE '%outcomes lead%'
    OR p.title ILIKE '%real world evidence lead%'
  );

-- Map personas to role: pricing-head-of-pricing-strategy
UPDATE personas p
SET
  role_id = r.id,
  department_id = '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'pricing-head-of-pricing-strategy'
  AND (
    p.title ILIKE '%head of pricing%'
  );

-- Map personas to role: pricing-global-pricing-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'pricing-global-pricing-director'
  AND (
    p.title ILIKE '%global pricing director%'
    OR p.title ILIKE '%pricing director - global%'
  );

-- Map personas to role: pricing-reimbursement-strategy-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'pricing-reimbursement-strategy-director'
  AND (
    p.title ILIKE '%reimbursement strategy director%'
    OR p.title ILIKE '%reimbursement director%'
  );

-- Map personas to role: pricing-senior-pricing-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'pricing-senior-pricing-manager'
  AND (
    p.title ILIKE '%senior pricing manager%'
  );

-- Map personas to role: pricing-pricing-analyst
UPDATE personas p
SET
  role_id = r.id,
  department_id = '1894d435-bd72-43e6-8fea-0afbb6af0c36',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'pricing-pricing-analyst'
  AND (
    p.title ILIKE '%pricing analyst%'
  );

-- Map personas to role: payer-head-of-payer-relations
UPDATE personas p
SET
  role_id = r.id,
  department_id = '55734f5f-fa05-4955-bb7c-30bc6df979fc',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'payer-head-of-payer-relations'
  AND (
    p.title ILIKE '%head of payer%'
  );

-- Map personas to role: payer-national-payer-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = '55734f5f-fa05-4955-bb7c-30bc6df979fc',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'payer-national-payer-director'
  AND (
    p.title ILIKE '%national payer director%'
    OR p.title ILIKE '%payer director - national%'
  );

-- Map personas to role: payer-regional-payer-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = '55734f5f-fa05-4955-bb7c-30bc6df979fc',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'payer-regional-payer-director'
  AND (
    p.title ILIKE '%regional payer director%'
    OR p.title ILIKE '%payer director - regional%'
  );

-- Map personas to role: payer-payer-account-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = '55734f5f-fa05-4955-bb7c-30bc6df979fc',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'payer-payer-account-director'
  AND (
    p.title ILIKE '%payer account director%'
    OR p.title ILIKE '%payer director%'
  );

-- Map personas to role: payer-payer-account-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = '55734f5f-fa05-4955-bb7c-30bc6df979fc',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'payer-payer-account-manager'
  AND (
    p.title ILIKE '%payer account manager%'
    OR p.title ILIKE '%payer manager%'
  );

-- Map personas to role: patient-head-of-patient-access
UPDATE personas p
SET
  role_id = r.id,
  department_id = '86ea15a1-cc79-42a7-a8bd-ace52dee81cf',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'patient-head-of-patient-access'
  AND (
    p.title ILIKE '%head of patient access%'
  );

-- Map personas to role: patient-patient-services-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = '86ea15a1-cc79-42a7-a8bd-ace52dee81cf',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'patient-patient-services-director'
  AND (
    p.title ILIKE '%patient services director%'
  );

-- Map personas to role: patient-hub-services-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = '86ea15a1-cc79-42a7-a8bd-ace52dee81cf',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'patient-hub-services-manager'
  AND (
    p.title ILIKE '%hub services manager%'
  );

-- Map personas to role: patient-reimbursement-support-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = '86ea15a1-cc79-42a7-a8bd-ace52dee81cf',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'patient-reimbursement-support-manager'
  AND (
    p.title ILIKE '%reimbursement support manager%'
  );

-- Map personas to role: patient-patient-access-specialist
UPDATE personas p
SET
  role_id = r.id,
  department_id = '86ea15a1-cc79-42a7-a8bd-ace52dee81cf',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'patient-patient-access-specialist'
  AND (
    p.title ILIKE '%patient access specialist%'
  );

-- Map personas to role: govt-head-of-government-affairs
UPDATE personas p
SET
  role_id = r.id,
  department_id = '98091f0a-bba3-41e3-bd23-f91b386a966b',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'govt-head-of-government-affairs'
  AND (
    p.title ILIKE '%head of government affairs%'
  );

-- Map personas to role: govt-government-relations-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = '98091f0a-bba3-41e3-bd23-f91b386a966b',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'govt-government-relations-director'
  AND (
    p.title ILIKE '%government relations director%'
    OR p.title ILIKE '%government affairs director%'
  );

-- Map personas to role: trade-head-of-trade-relations
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'a2fb0358-5877-4cfc-bf13-223c4e7d7d4d',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'trade-head-of-trade-relations'
  AND (
    p.title ILIKE '%head of trade%'
  );

-- Map personas to role: trade-gpo-idn-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'a2fb0358-5877-4cfc-bf13-223c4e7d7d4d',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'trade-gpo-idn-director'
  AND (
    p.title ILIKE '%GPO director%'
    OR p.title ILIKE '%IDN director%'
    OR p.title ILIKE '%trade director%'
  );

-- Map personas to role: analytics-head-of-ma-analytics
UPDATE personas p
SET
  role_id = r.id,
  department_id = '7d90e4b9-984f-4e1e-bcf8-c307a748d996',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'analytics-head-of-ma-analytics'
  AND (
    p.title ILIKE '%head of MA analytics%'
    OR p.title ILIKE '%head of market access analytics%'
  );

-- Map personas to role: analytics-ma-analytics-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = '7d90e4b9-984f-4e1e-bcf8-c307a748d996',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'analytics-ma-analytics-director'
  AND (
    p.title ILIKE '%MA analytics director%'
    OR p.title ILIKE '%market access analytics director%'
  );

-- Map personas to role: analytics-senior-ma-analyst
UPDATE personas p
SET
  role_id = r.id,
  department_id = '7d90e4b9-984f-4e1e-bcf8-c307a748d996',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'analytics-senior-ma-analyst'
  AND (
    p.title ILIKE '%senior MA analyst%'
    OR p.title ILIKE '%senior market access analyst%'
  );

-- Map personas to role: operations-ma-operations-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'f6c0c098-102e-45dc-9d55-42c6d3350a47',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'operations-ma-operations-director'
  AND (
    p.title ILIKE '%MA operations director%'
    OR p.title ILIKE '%market access operations director%'
  );

-- Map personas to role: operations-ma-strategy-planning-manager
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'f6c0c098-102e-45dc-9d55-42c6d3350a47',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.slug = 'operations-ma-strategy-planning-manager'
  AND (
    p.title ILIKE '%MA strategy manager%'
    OR p.title ILIKE '%MA planning manager%'
  );


COMMIT;

-- ========================================
-- VALIDATION QUERIES
-- ========================================

-- Check how many Market Access personas now have role mappings
SELECT 
  COUNT(*) as total_ma_personas,
  COUNT(role_id) as mapped_to_role,
  COUNT(*) - COUNT(role_id) as unmapped
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
  AND function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3';

-- Show persona distribution by role
SELECT 
  r.name as role_name,
  d.name as department_name,
  COUNT(p.id) as persona_count
FROM personas p
JOIN org_roles r ON p.role_id = r.id
JOIN org_departments d ON r.department_id = d.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
GROUP BY r.name, d.name
ORDER BY persona_count DESC, d.name, r.name;
