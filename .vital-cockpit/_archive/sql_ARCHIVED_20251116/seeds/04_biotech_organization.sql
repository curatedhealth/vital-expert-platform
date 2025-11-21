-- ============================================================================
-- BIOTECH ORGANIZATION STRUCTURE
-- For Biotechnology & Life Sciences Companies
-- ============================================================================

-- Insert Biotech Tenant
INSERT INTO tenants (id, name, slug, industry, type, metadata)
VALUES (
    '3c8f5e2a-b1d4-4f6e-8a9c-2d1b7e4f3a5c',
    'Biotechnology Company',
    'biotech-company',
    'Biotechnology',
    'client',
    jsonb_build_object(
        'description', 'Biotechnology and life sciences company organizational structure',
        'organization_type', 'Biotech/Life Sciences',
        'regulatory_focus', 'FDA Biologics, EMA ATMPs, Gene Therapy',
        'primary_products', ARRAY['Biologics', 'Cell Therapy', 'Gene Therapy', 'mAbs', 'Biosimilars']
    )
)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    type = EXCLUDED.type,
    metadata = EXCLUDED.metadata;

-- BIOTECH: Business Functions
INSERT INTO org_functions (id, unique_id, department_name, description, migration_ready, created_by)
VALUES
    (gen_random_uuid(), 'FN-BIOTECH-RD', 'Research & Development', 'Discovery biology, preclinical, and clinical development', true, 'system'),
    (gen_random_uuid(), 'FN-BIOTECH-BIOPROCESS', 'Bioprocess & Manufacturing', 'Cell culture, purification, and biomanufacturing', true, 'system'),
    (gen_random_uuid(), 'FN-BIOTECH-REG', 'Regulatory & Quality', 'Biologics regulatory strategy and quality assurance', true, 'system'),
    (gen_random_uuid(), 'FN-BIOTECH-CLIN', 'Clinical Development', 'Clinical trials and medical affairs', true, 'system'),
    (gen_random_uuid(), 'FN-BIOTECH-COM', 'Commercial & Market Access', 'Sales, marketing, and market access', true, 'system'),
    (gen_random_uuid(), 'FN-BIOTECH-STRAT', 'Strategy & Partnerships', 'Business development, partnerships, and corporate strategy', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

-- BIOTECH: Roles (20+ key roles)
INSERT INTO org_roles (id, unique_id, role_name, role_title, description, seniority_level, is_active, created_by)
VALUES
    -- Executive
    (gen_random_uuid(), 'ROLE-BIOTECH-CSO', 'Chief Scientific Officer', 'CSO', 'Head of R&D and discovery', 'Executive', true, 'system'),
    (gen_random_uuid(), 'ROLE-BIOTECH-CMO', 'Chief Medical Officer', 'CMO', 'Clinical development and medical strategy', 'Executive', true, 'system'),
    (gen_random_uuid(), 'ROLE-BIOTECH-VPBIOPROCESS', 'VP Bioprocess Development', 'VP Bioprocess', 'Biomanufacturing and process development', 'Executive', true, 'system'),
    -- R&D
    (gen_random_uuid(), 'ROLE-BIOTECH-DISCBIO', 'Discovery Biologist', 'Discovery Biologist', 'Target identification and validation', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-BIOTECH-PROTENG', 'Protein Engineering Scientist', 'Protein Engineer', 'Antibody and protein engineering', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-BIOTECH-CELLBIO', 'Cell Biology Scientist', 'Cell Biologist', 'Cell line development and characterization', 'Mid', true, 'system'),
    -- Bioprocess
    (gen_random_uuid(), 'ROLE-BIOTECH-UPSTREAMENG', 'Upstream Process Engineer', 'Upstream Engineer', 'Cell culture and fermentation', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-BIOTECH-DOWNSTREAMENG', 'Downstream Process Engineer', 'Downstream Engineer', 'Purification and chromatography', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-BIOTECH-ANALYTICAL', 'Analytical Development Scientist', 'Analytical Scientist', 'Method development and validation', 'Mid', true, 'system'),
    -- Clinical & Medical
    (gen_random_uuid(), 'ROLE-BIOTECH-CLINDEV', 'Clinical Development Director', 'Clinical Dev Director', 'Clinical trial strategy and execution', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-BIOTECH-MSL', 'Medical Science Liaison', 'MSL', 'KOL engagement and medical education', 'Mid', true, 'system'),
    -- Regulatory
    (gen_random_uuid(), 'ROLE-BIOTECH-REGCMC', 'Regulatory CMC Specialist', 'Regulatory CMC', 'CMC regulatory submissions', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-BIOTECH-REGBIOL', 'Regulatory Affairs Manager - Biologics', 'RA Manager Biologics', 'BLA/MAA submissions', 'Mid', true, 'system'),
    -- Quality
    (gen_random_uuid(), 'ROLE-BIOTECH-QCBIO', 'Quality Control Biologist', 'QC Biologist', 'Biological product testing', 'Junior', true, 'system'),
    (gen_random_uuid(), 'ROLE-BIOTECH-QABIO', 'Quality Assurance Manager - Biologics', 'QA Manager Biologics', 'GMP compliance for biologics', 'Mid', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

SELECT 
    '✅ Biotech Organization Created' as status,
    (SELECT name FROM tenants WHERE slug = 'biotech-company') as tenant_name,
    (SELECT COUNT(*) FROM org_functions WHERE unique_id LIKE 'FN-BIOTECH-%') as functions,
    (SELECT COUNT(*) FROM org_roles WHERE unique_id LIKE 'ROLE-BIOTECH-%') as roles;

