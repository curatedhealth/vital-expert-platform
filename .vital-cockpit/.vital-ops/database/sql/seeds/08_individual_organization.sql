-- ============================================================================
-- INDIVIDUAL/FREELANCER ORGANIZATION STRUCTURE
-- For Independent Consultants & Freelancers
-- ============================================================================

-- Insert Individual Tenant
INSERT INTO tenants (id, name, slug, industry, type, metadata)
VALUES (
    'f1e2d3c4-b5a6-47e8-9f1a-2b3c4d5e6f7a',
    'Independent Consultant',
    'individual-freelancer',
    'Independent/Freelance',
    'client',
    jsonb_build_object(
        'description', 'Individual consultant, freelancer, or independent professional',
        'organization_type', 'Individual/Freelancer',
        'service_areas', 'Flexible across multiple domains',
        'work_types', ARRAY['Consulting', 'Contract Work', 'Project-Based', 'Advisory', 'Interim Roles']
    )
)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    type = EXCLUDED.type,
    metadata = EXCLUDED.metadata;

-- INDIVIDUAL: Service Areas (Functions)
INSERT INTO org_functions (id, unique_id, department_name, description, migration_ready, created_by)
VALUES
    (gen_random_uuid(), 'FN-IND-REGULATORY', 'Regulatory Consulting', 'Independent regulatory consulting and submissions support', true, 'system'),
    (gen_random_uuid(), 'FN-IND-CLINICAL', 'Clinical & Medical', 'Clinical operations, medical writing, and clinical affairs', true, 'system'),
    (gen_random_uuid(), 'FN-IND-QUALITY', 'Quality & Compliance', 'QA/QC consulting and GMP compliance', true, 'system'),
    (gen_random_uuid(), 'FN-IND-DATATECH', 'Data Science & Analytics', 'Data analysis, statistics, and programming', true, 'system'),
    (gen_random_uuid(), 'FN-IND-MKTACC', 'Market Access & HEOR', 'HEOR, payer strategy, and reimbursement', true, 'system'),
    (gen_random_uuid(), 'FN-IND-DIGITAL', 'Digital Health & Technology', 'DTx, SaMD, and digital health consulting', true, 'system'),
    (gen_random_uuid(), 'FN-IND-STRATEGY', 'Strategy & Business Development', 'Business strategy, BD, and advisory', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

-- INDIVIDUAL: Roles (Freelance Roles)
INSERT INTO org_roles (id, unique_id, role_name, role_title, description, seniority_level, is_active, created_by)
VALUES
    -- Senior Independent Consultants
    (gen_random_uuid(), 'ROLE-IND-SRREG', 'Senior Regulatory Consultant', 'Sr Regulatory Consultant', 'Independent regulatory consulting', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-SRMEDWRITER', 'Senior Medical Writer - Freelance', 'Sr Medical Writer', 'Freelance medical and regulatory writing', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-SRCLINOPS', 'Senior Clinical Operations Consultant', 'Sr Clinical Ops', 'Independent clinical operations', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-SRQA', 'Senior QA/QC Consultant', 'Sr QA Consultant', 'Independent quality consulting', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-SRHEOR', 'Senior HEOR Consultant', 'Sr HEOR Consultant', 'Independent HEOR and market access', 'Senior', true, 'system'),
    -- Mid-Level Freelancers
    (gen_random_uuid(), 'ROLE-IND-REGFREELANCE', 'Regulatory Affairs Freelancer', 'RA Freelancer', 'Contract regulatory work', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-CRADATAMONITOR', 'CRA / Data Monitor', 'CRA/Monitor', 'Site monitoring and data review', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-MEDWRITER', 'Medical Writer - Contract', 'Medical Writer', 'Contract medical writing', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-BIOSTAT', 'Biostatistician - Freelance', 'Biostatistician', 'Statistical analysis and programming', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-DATASCIPROG', 'Data Scientist / Programmer', 'Data Scientist', 'Data analysis and programming', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-CLINDATA', 'Clinical Data Manager', 'Data Manager', 'Clinical database management', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-QAAUDITOR', 'QA Auditor', 'QA Auditor', 'Internal audits and compliance checks', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-SAFETYSCIENTIST', 'Safety Scientist - Contract', 'Safety Scientist', 'Pharmacovigilance and case processing', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-MKTACCFREELANCE', 'Market Access Freelancer', 'Market Access', 'Payer strategy and reimbursement', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-DTXCONSULT', 'Digital Health Consultant', 'DTx Consultant', 'DTx strategy and implementation', 'Mid', true, 'system'),
    -- Specialized Independent Roles
    (gen_random_uuid(), 'ROLE-IND-SASPROGRAM', 'SAS Programmer', 'SAS Programmer', 'Statistical programming', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-PROJMGR', 'Project Manager - Contract', 'Project Manager', 'Clinical or regulatory project management', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-TECHWRITER', 'Technical Writer', 'Technical Writer', 'Technical documentation and SOPs', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-TRAINDEV', 'Training Developer', 'Training Developer', 'Training materials and GMP training', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-IND-INTERIM', 'Interim Manager', 'Interim Manager', 'Temporary management roles', 'Senior', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

SELECT 
    '✅ Individual/Freelancer Organization Created' as status,
    (SELECT name FROM tenants WHERE slug = 'individual-freelancer') as tenant_name,
    (SELECT COUNT(*) FROM org_functions WHERE unique_id LIKE 'FN-IND-%') as functions,
    (SELECT COUNT(*) FROM org_roles WHERE unique_id LIKE 'ROLE-IND-%') as roles;

