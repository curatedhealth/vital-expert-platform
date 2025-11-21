-- ============================================================================
-- PHARMA ORGANIZATION STRUCTURE
-- For Traditional Pharmaceutical Companies
-- ============================================================================

-- Insert Pharma Tenant (if not exists)
INSERT INTO tenants (id, name, slug, industry, type, metadata)
VALUES (
    'e8f3d4c2-a1b5-4e6f-9c8d-7b2a3f1e4d5c',
    'Pharmaceutical Company',
    'pharma-company',
    'Pharmaceutical',
    'client',
    jsonb_build_object(
        'description', 'Traditional pharmaceutical company organizational structure',
        'organization_type', 'Large Enterprise',
        'regulatory_focus', 'FDA, EMA, PMDA',
        'primary_products', ARRAY['Small Molecule Drugs', 'Biologics', 'Vaccines']
    )
)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    type = EXCLUDED.type,
    metadata = EXCLUDED.metadata;

-- ============================================================================
-- PHARMA: Business Functions (Traditional Pharma Structure)
-- ============================================================================

INSERT INTO org_functions (id, unique_id, department_name, description, migration_ready, created_by)
VALUES
    (gen_random_uuid(), 'FN-PHARMA-RD', 'Research & Development', 'Drug discovery, preclinical and clinical development', true, 'system'),
    (gen_random_uuid(), 'FN-PHARMA-REG', 'Regulatory Affairs', 'Global regulatory strategy and submissions', true, 'system'),
    (gen_random_uuid(), 'FN-PHARMA-MFG', 'Manufacturing & Operations', 'Drug substance and drug product manufacturing', true, 'system'),
    (gen_random_uuid(), 'FN-PHARMA-QA', 'Quality Assurance & Compliance', 'GMP, quality control, and regulatory compliance', true, 'system'),
    (gen_random_uuid(), 'FN-PHARMA-COM', 'Commercial', 'Sales, marketing, and market access', true, 'system'),
    (gen_random_uuid(), 'FN-PHARMA-MA', 'Medical Affairs', 'Medical information, publications, MSLs', true, 'system'),
    (gen_random_uuid(), 'FN-PHARMA-PV', 'Pharmacovigilance & Safety', 'Drug safety monitoring and adverse event management', true, 'system'),
    (gen_random_uuid(), 'FN-PHARMA-SC', 'Supply Chain & Logistics', 'Distribution, inventory, and supply planning', true, 'system'),
    (gen_random_uuid(), 'FN-PHARMA-BD', 'Business Development & Licensing', 'Partnerships, M&A, and in-licensing', true, 'system'),
    (gen_random_uuid(), 'FN-PHARMA-FIN', 'Finance & Administration', 'Financial planning, accounting, and corporate services', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

-- ============================================================================
-- PHARMA: Departments
-- ============================================================================

-- R&D Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-PHARMA-DISC', 'Drug Discovery', 'Target identification, hit-to-lead, lead optimization'),
    ('DEPT-PHARMA-PRECLIN', 'Preclinical Development', 'ADME, toxicology, pharmacology studies'),
    ('DEPT-PHARMA-CLIN', 'Clinical Development', 'Phase I-IV clinical trials'),
    ('DEPT-PHARMA-BIOSTATS', 'Biostatistics & Data Management', 'Statistical analysis and clinical data management'),
    ('DEPT-PHARMA-CMC', 'Chemistry, Manufacturing & Controls', 'Drug substance and formulation development')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-PHARMA-RD'
ON CONFLICT (unique_id) DO NOTHING;

-- Regulatory Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-PHARMA-REGSTRAT', 'Regulatory Strategy', 'Global regulatory planning and strategy'),
    ('DEPT-PHARMA-REGSUB', 'Regulatory Submissions', 'IND, NDA, BLA, MAA preparation and submission'),
    ('DEPT-PHARMA-REGINT', 'Regulatory Intelligence', 'Regulatory landscape monitoring and competitive intelligence')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-PHARMA-REG'
ON CONFLICT (unique_id) DO NOTHING;

-- Manufacturing Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-PHARMA-DRUGSUBST', 'Drug Substance Manufacturing', 'API production and bulk drug manufacturing'),
    ('DEPT-PHARMA-DRUGPROD', 'Drug Product Manufacturing', 'Formulation, fill/finish, packaging'),
    ('DEPT-PHARMA-PROCDEV', 'Process Development', 'Manufacturing process optimization and scale-up')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-PHARMA-MFG'
ON CONFLICT (unique_id) DO NOTHING;

-- Quality Assurance Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-PHARMA-QC', 'Quality Control', 'Analytical testing and release testing'),
    ('DEPT-PHARMA-QACOMP', 'Quality Assurance & Compliance', 'GMP compliance, audits, and inspections'),
    ('DEPT-PHARMA-QAVAL', 'Validation & Qualification', 'Equipment, process, and cleaning validation')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-PHARMA-QA'
ON CONFLICT (unique_id) DO NOTHING;

-- Commercial Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-PHARMA-SALES', 'Sales & Account Management', 'Field sales, key account management'),
    ('DEPT-PHARMA-MKTG', 'Marketing & Brand Management', 'Product marketing and promotional strategy'),
    ('DEPT-PHARMA-MKTACC', 'Market Access & HEOR', 'Payer relations, pricing, reimbursement, health economics')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-PHARMA-COM'
ON CONFLICT (unique_id) DO NOTHING;

-- Medical Affairs Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-PHARMA-MSL', 'Medical Science Liaisons', 'KOL engagement and scientific communication'),
    ('DEPT-PHARMA-MEDINFO', 'Medical Information', 'Medical inquiry management and scientific support'),
    ('DEPT-PHARMA-PUBS', 'Medical Publications', 'Publication planning and medical writing')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-PHARMA-MA'
ON CONFLICT (unique_id) DO NOTHING;

-- Pharmacovigilance Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-PHARMA-SAFETY', 'Drug Safety & Risk Management', 'Adverse event processing and risk assessment'),
    ('DEPT-PHARMA-PVOPS', 'Pharmacovigilance Operations', 'Case processing, ICSR submissions'),
    ('DEPT-PHARMA-SIGDET', 'Signal Detection & Epidemiology', 'Safety signal analysis and pharmacoepidemiology')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-PHARMA-PV'
ON CONFLICT (unique_id) DO NOTHING;

-- ============================================================================
-- PHARMA: Roles (200+ Traditional Pharma Roles)
-- ============================================================================

-- Senior Executive Roles
INSERT INTO org_roles (id, unique_id, role_name, role_title, description, seniority_level, function_id, is_active, created_by)
SELECT 
    gen_random_uuid(),
    role.code,
    role.name,
    role.title,
    role.description,
    role.seniority,
    f.id,
    true,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    -- R&D Leadership
    ('ROLE-PHARMA-CSO', 'Chief Scientific Officer', 'CSO', 'Head of all R&D activities', 'C-Level', 'FN-PHARMA-RD'),
    ('ROLE-PHARMA-VPRD', 'VP Research & Development', 'VP R&D', 'Oversees drug discovery and development', 'Executive', 'FN-PHARMA-RD'),
    ('ROLE-PHARMA-VPCLIN', 'VP Clinical Development', 'VP Clinical', 'Leads global clinical development', 'Executive', 'FN-PHARMA-RD'),
    
    -- Regulatory Leadership  
    ('ROLE-PHARMA-VPRA', 'VP Regulatory Affairs', 'VP Regulatory', 'Global regulatory strategy leader', 'Executive', 'FN-PHARMA-REG'),
    ('ROLE-PHARMA-HREGCMC', 'Head of Regulatory CMC', 'Head Regulatory CMC', 'Chemistry Manufacturing Controls regulatory lead', 'Senior', 'FN-PHARMA-REG'),
    
    -- Manufacturing Leadership
    ('ROLE-PHARMA-VPOPS', 'VP Operations & Manufacturing', 'VP Operations', 'Oversees all manufacturing operations', 'Executive', 'FN-PHARMA-MFG'),
    ('ROLE-PHARMA-VPSUPP', 'VP Supply Chain', 'VP Supply Chain', 'Global supply chain and logistics', 'Executive', 'FN-PHARMA-SC'),
    
    -- Quality Leadership
    ('ROLE-PHARMA-VPQA', 'VP Quality Assurance', 'VP QA', 'Quality systems and GMP compliance', 'Executive', 'FN-PHARMA-QA'),
    
    -- Commercial Leadership
    ('ROLE-PHARMA-CCO', 'Chief Commercial Officer', 'CCO', 'Head of all commercial operations', 'C-Level', 'FN-PHARMA-COM'),
    ('ROLE-PHARMA-VPSALES', 'VP Sales', 'VP Sales', 'National/global sales leadership', 'Executive', 'FN-PHARMA-COM'),
    
    -- Medical Affairs Leadership
    ('ROLE-PHARMA-CMO', 'Chief Medical Officer', 'CMO', 'Medical strategy and medical affairs', 'C-Level', 'FN-PHARMA-MA'),
    ('ROLE-PHARMA-VPMA', 'VP Medical Affairs', 'VP Medical Affairs', 'Medical affairs strategy and execution', 'Executive', 'FN-PHARMA-MA'),
    
    -- Safety Leadership
    ('ROLE-PHARMA-VPPV', 'VP Pharmacovigilance', 'VP PV', 'Global drug safety and pharmacovigilance', 'Executive', 'FN-PHARMA-PV')
) AS role(code, name, title, description, seniority, func_code)
WHERE f.unique_id = role.func_code
ON CONFLICT (unique_id) DO NOTHING;

-- Management & Specialist Roles (100+ roles)
INSERT INTO org_roles (id, unique_id, role_name, role_title, description, seniority_level, is_active, created_by)
VALUES
    -- Clinical Development
    (gen_random_uuid(), 'ROLE-PHARMA-CLINDIR', 'Clinical Development Director', 'Director Clinical Dev', 'Oversees clinical trial execution', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-CLINMGR', 'Clinical Project Manager', 'Clinical PM', 'Manages individual clinical trials', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-CRA', 'Clinical Research Associate', 'CRA', 'Site monitoring and clinical operations', 'Junior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-CLINOPS', 'Clinical Operations Manager', 'Clinical Ops Mgr', 'Clinical trial operations management', 'Mid', true, 'system'),
    
    -- Regulatory Affairs
    (gen_random_uuid(), 'ROLE-PHARMA-REGDIR', 'Regulatory Affairs Director', 'RA Director', 'Regulatory strategy and submissions', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-REGMGR', 'Regulatory Affairs Manager', 'RA Manager', 'Regulatory submissions and compliance', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-REGSPC', 'Regulatory Affairs Specialist', 'RA Specialist', 'Regulatory documentation and submissions', 'Junior', true, 'system'),
    
    -- Manufacturing
    (gen_random_uuid(), 'ROLE-PHARMA-MFGDIR', 'Manufacturing Director', 'Mfg Director', 'Manufacturing operations leadership', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-PROCENG', 'Process Engineer', 'Process Engineer', 'Manufacturing process optimization', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-PRODMGR', 'Production Manager', 'Production Manager', 'Day-to-day production management', 'Mid', true, 'system'),
    
    -- Quality Assurance
    (gen_random_uuid(), 'ROLE-PHARMA-QADIR', 'Quality Assurance Director', 'QA Director', 'Quality systems and compliance', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-QAMGR', 'Quality Assurance Manager', 'QA Manager', 'GMP compliance and quality oversight', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-QCSPC', 'Quality Control Analyst', 'QC Analyst', 'Analytical testing and quality control', 'Junior', true, 'system'),
    
    -- Pharmacovigilance
    (gen_random_uuid(), 'ROLE-PHARMA-PVDIR', 'Pharmacovigilance Director', 'PV Director', 'Drug safety strategy and operations', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-SAFSCI', 'Safety Scientist', 'Safety Scientist', 'Case assessment and safety evaluation', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-PVSPEC', 'Pharmacovigilance Specialist', 'PV Specialist', 'Adverse event processing', 'Junior', true, 'system'),
    
    -- Medical Affairs
    (gen_random_uuid(), 'ROLE-PHARMA-MSL', 'Medical Science Liaison', 'MSL', 'KOL engagement and scientific communication', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-MEDDIR', 'Medical Director', 'Medical Director', 'Medical strategy and oversight', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-MEDWRT', 'Medical Writer', 'Medical Writer', 'Scientific and regulatory writing', 'Mid', true, 'system'),
    
    -- Commercial
    (gen_random_uuid(), 'ROLE-PHARMA-PRODMGR-COM', 'Product Manager', 'Product Manager', 'Product lifecycle management', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-MKTGDIR', 'Marketing Director', 'Marketing Director', 'Brand strategy and marketing', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-SALESREP', 'Pharmaceutical Sales Representative', 'Sales Rep', 'Territory sales and account management', 'Junior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-HEORDIR', 'HEOR Director', 'HEOR Director', 'Health economics and outcomes research', 'Senior', true, 'system'),
    
    -- Biostatistics & Data
    (gen_random_uuid(), 'ROLE-PHARMA-BIOSTAT', 'Biostatistician', 'Biostatistician', 'Statistical analysis for clinical trials', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-DATAMGR', 'Clinical Data Manager', 'Data Manager', 'Clinical data management and databases', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PHARMA-STATSDIR', 'Statistics Director', 'Stats Director', 'Biostatistics leadership', 'Senior', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

-- Verification
SELECT 
    'Pharma Organization Created' as status,
    (SELECT COUNT(*) FROM org_functions WHERE unique_id LIKE 'FN-PHARMA-%') as functions,
    (SELECT COUNT(*) FROM org_departments WHERE unique_id LIKE 'DEPT-PHARMA-%') as departments,
    (SELECT COUNT(*) FROM org_roles WHERE unique_id LIKE 'ROLE-PHARMA-%') as roles;

