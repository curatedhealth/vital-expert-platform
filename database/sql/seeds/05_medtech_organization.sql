-- ============================================================================
-- MEDTECH ORGANIZATION STRUCTURE  
-- For Medical Device & MedTech Companies
-- ============================================================================

-- Insert MedTech Tenant
INSERT INTO tenants (id, name, slug, industry, type, metadata)
VALUES (
    '7d2e9f3b-c4a5-46d7-9e8f-3a1c5b6d4e7a',
    'Medical Device Company',
    'medtech-company',
    'Medical Devices',
    'client',
    jsonb_build_object(
        'description', 'Medical device and MedTech company organizational structure',
        'organization_type', 'MedTech/Medical Devices',
        'regulatory_focus', 'FDA Devices, CE Mark, ISO 13485, MDR',
        'primary_products', ARRAY['Class II/III Devices', 'Implants', 'Diagnostics', 'Surgical Instruments', 'Imaging Systems']
    )
)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    type = EXCLUDED.type,
    metadata = EXCLUDED.metadata;

-- MEDTECH: Business Functions
INSERT INTO org_functions (id, unique_id, department_name, description, migration_ready, created_by)
VALUES
    (gen_random_uuid(), 'FN-MEDTECH-RD', 'R&D & Engineering', 'Product development, design, and engineering', true, 'system'),
    (gen_random_uuid(), 'FN-MEDTECH-REG', 'Regulatory & Clinical Affairs', 'Device regulatory strategy and clinical studies', true, 'system'),
    (gen_random_uuid(), 'FN-MEDTECH-QA', 'Quality & Compliance', 'ISO 13485, design controls, and quality systems', true, 'system'),
    (gen_random_uuid(), 'FN-MEDTECH-MFG', 'Manufacturing & Operations', 'Device manufacturing and supply chain', true, 'system'),
    (gen_random_uuid(), 'FN-MEDTECH-COM', 'Commercial & Market Access', 'Sales, marketing, and reimbursement', true, 'system'),
    (gen_random_uuid(), 'FN-MEDTECH-CLIN', 'Clinical & Medical Affairs', 'Clinical evidence and medical education', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

-- MEDTECH: Roles (25+ key roles)
INSERT INTO org_roles (id, unique_id, role_name, role_title, description, seniority_level, is_active, created_by)
VALUES
    -- Executive
    (gen_random_uuid(), 'ROLE-MEDTECH-CTO', 'Chief Technology Officer', 'CTO', 'Technology and product development strategy', 'Executive', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-VPREG', 'VP Regulatory & Clinical Affairs', 'VP Regulatory', 'Device regulatory strategy', 'Executive', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-VPQA', 'VP Quality Assurance', 'VP QA', 'Quality systems and compliance', 'Executive', true, 'system'),
    -- R&D & Engineering
    (gen_random_uuid(), 'ROLE-MEDTECH-BMENG', 'Biomedical Engineer', 'Biomedical Engineer', 'Medical device design and development', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-MECHENG', 'Mechanical Engineer', 'Mechanical Engineer', 'Mechanical design and prototyping', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-ELECENG', 'Electrical Engineer', 'Electrical Engineer', 'Electronics and embedded systems', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-SWENG', 'Software Engineer - Medical Devices', 'SW Engineer Medical', 'Medical device software development', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-USABILITY', 'Human Factors Engineer', 'Human Factors Engineer', 'Usability and human factors validation', 'Mid', true, 'system'),
    -- Regulatory & Clinical
    (gen_random_uuid(), 'ROLE-MEDTECH-REGMGR', 'Regulatory Affairs Manager - Devices', 'RA Manager Devices', '510(k), PMA, CE Mark submissions', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-CLINAFFAIRS', 'Clinical Affairs Manager', 'Clinical Affairs Manager', 'Clinical study design and execution', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-REGSTRAT', 'Regulatory Strategy Director', 'Regulatory Strategy Dir', 'Global device regulatory strategy', 'Senior', true, 'system'),
    -- Quality & Compliance
    (gen_random_uuid(), 'ROLE-MEDTECH-DESIGNQA', 'Design Quality Engineer', 'Design QA Engineer', 'Design controls and DHF management', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-QAMGR', 'Quality Assurance Manager', 'QA Manager', 'ISO 13485 and QMS', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-COMPLAINTS', 'Complaints & Vigilance Specialist', 'Complaints Specialist', 'MDR, adverse event reporting', 'Junior', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-CAPA', 'CAPA Specialist', 'CAPA Specialist', 'Corrective and preventive actions', 'Junior', true, 'system'),
    -- Manufacturing
    (gen_random_uuid(), 'ROLE-MEDTECH-MFGENG', 'Manufacturing Engineer', 'Manufacturing Engineer', 'Production process optimization', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-VALIDATION', 'Validation Engineer', 'Validation Engineer', 'Process and equipment validation', 'Mid', true, 'system'),
    -- Commercial
    (gen_random_uuid(), 'ROLE-MEDTECH-PRODMGR', 'Product Manager - Medical Devices', 'Product Manager', 'Product lifecycle management', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-CLINSPECIALIST', 'Clinical Specialist', 'Clinical Specialist', 'Clinical training and support', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-MEDTECH-REIMB', 'Reimbursement Specialist', 'Reimbursement Specialist', 'CPT coding and reimbursement', 'Mid', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

SELECT 
    '✅ MedTech Organization Created' as status,
    (SELECT name FROM tenants WHERE slug = 'medtech-company') as tenant_name,
    (SELECT COUNT(*) FROM org_functions WHERE unique_id LIKE 'FN-MEDTECH-%') as functions,
    (SELECT COUNT(*) FROM org_roles WHERE unique_id LIKE 'ROLE-MEDTECH-%') as roles;

