-- ============================================================================
-- CONSULTING ORGANIZATION STRUCTURE
-- For Healthcare Consulting Firms
-- ============================================================================

-- Insert Consulting Tenant
INSERT INTO tenants (id, name, slug, industry, type, metadata)
VALUES (
    'a2b3c4d5-e6f7-4a8b-9c1d-2e3f4a5b6c7d',
    'Healthcare Consulting Firm',
    'consulting-firm',
    'Healthcare Consulting',
    'client',
    jsonb_build_object(
        'description', 'Healthcare and life sciences consulting firm organizational structure',
        'organization_type', 'Consulting/Advisory',
        'service_areas', 'Strategy, Regulatory, Clinical, Market Access, Digital Health',
        'client_types', ARRAY['Pharma', 'Biotech', 'MedTech', 'Digital Health', 'Payers', 'Providers']
    )
)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    type = EXCLUDED.type,
    metadata = EXCLUDED.metadata;

-- CONSULTING: Practice Areas (Functions)
INSERT INTO org_functions (id, unique_id, department_name, description, migration_ready, created_by)
VALUES
    (gen_random_uuid(), 'FN-CONSULT-REGCLIN', 'Regulatory & Clinical Strategy', 'Regulatory strategy, clinical development, and submissions support', true, 'system'),
    (gen_random_uuid(), 'FN-CONSULT-MKTACC', 'Market Access & HEOR', 'Payer strategy, HEOR, and reimbursement consulting', true, 'system'),
    (gen_random_uuid(), 'FN-CONSULT-STRATEGY', 'Corporate Strategy & BD', 'Portfolio strategy, M&A, and business development', true, 'system'),
    (gen_random_uuid(), 'FN-CONSULT-DIGITAL', 'Digital Health & Innovation', 'DTx strategy, digital health transformation, and innovation', true, 'system'),
    (gen_random_uuid(), 'FN-CONSULT-QUALITY', 'Quality & Compliance', 'GMP consulting, remediation, and quality systems', true, 'system'),
    (gen_random_uuid(), 'FN-CONSULT-DATATECH', 'Data Science & Technology', 'Real-world data, analytics, and AI/ML consulting', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

-- CONSULTING: Roles (25+ key roles)
INSERT INTO org_roles (id, unique_id, role_name, role_title, description, seniority_level, is_active, created_by)
VALUES
    -- Leadership
    (gen_random_uuid(), 'ROLE-CONSULT-PARTNER', 'Partner', 'Partner', 'Practice leader and client relationship owner', 'Executive', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-PRINCIPAL', 'Principal Consultant', 'Principal', 'Senior consultant and project leader', 'Executive', true, 'system'),
    -- Regulatory & Clinical
    (gen_random_uuid(), 'ROLE-CONSULT-REGDIR', 'Regulatory Strategy Director', 'Regulatory Director', 'Regulatory consulting and submissions support', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-REGCONSULT', 'Regulatory Consultant', 'Regulatory Consultant', 'Regulatory guidance and submissions', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-CLINSTRAT', 'Clinical Strategy Consultant', 'Clinical Consultant', 'Clinical development strategy', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-MEDWRITING', 'Medical Writing Consultant', 'Medical Writer', 'Regulatory and clinical writing', 'Mid', true, 'system'),
    -- Market Access & HEOR
    (gen_random_uuid(), 'ROLE-CONSULT-HEORDIR', 'HEOR Director', 'HEOR Director', 'Health economics consulting', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-MKTACCCONSULT', 'Market Access Consultant', 'Market Access Consultant', 'Payer strategy and reimbursement', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-PRICINGCONSULT', 'Pricing & Reimbursement Consultant', 'Pricing Consultant', 'Pricing strategy and value demonstration', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-VALUEDOSSIER', 'Value Dossier Lead', 'Value Dossier Lead', 'Global value dossier development', 'Mid', true, 'system'),
    -- Corporate Strategy
    (gen_random_uuid(), 'ROLE-CONSULT-STRATCONSULT', 'Strategy Consultant', 'Strategy Consultant', 'Portfolio and corporate strategy', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-BDCONSULT', 'Business Development Consultant', 'BD Consultant', 'M&A, licensing, and partnerships', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-COMMANAL', 'Commercial Analytics Consultant', 'Commercial Analyst', 'Market analysis and forecasting', 'Mid', true, 'system'),
    -- Digital Health
    (gen_random_uuid(), 'ROLE-CONSULT-DTXSTRAT', 'Digital Health Strategy Consultant', 'DTx Consultant', 'DTx strategy and regulatory guidance', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-DIGITALXFORM', 'Digital Transformation Consultant', 'Digital Xform Consultant', 'Digital health transformation', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-HEALTHTECH', 'Health Tech Consultant', 'Health Tech Consultant', 'SaMD and health technology assessment', 'Mid', true, 'system'),
    -- Quality & Compliance
    (gen_random_uuid(), 'ROLE-CONSULT-QACONSULT', 'Quality Systems Consultant', 'QA Consultant', 'GMP remediation and quality systems', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-COMPLIANCE', 'Compliance Consultant', 'Compliance Consultant', 'Regulatory compliance and audits', 'Mid', true, 'system'),
    -- Data Science & Analytics
    (gen_random_uuid(), 'ROLE-CONSULT-RWECONSULT', 'RWE Consultant', 'RWE Consultant', 'Real-world evidence and data analytics', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-DATASCI', 'Data Science Consultant', 'Data Science Consultant', 'Advanced analytics and predictive modeling', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-AICONSULT', 'AI/ML Consultant', 'AI/ML Consultant', 'AI/ML strategy and implementation', 'Mid', true, 'system'),
    -- Junior Roles
    (gen_random_uuid(), 'ROLE-CONSULT-ANALYST', 'Analyst', 'Analyst', 'Research, analysis, and project support', 'Junior', true, 'system'),
    (gen_random_uuid(), 'ROLE-CONSULT-ASSOCIATE', 'Associate Consultant', 'Associate', 'Project delivery and client support', 'Junior', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

SELECT 
    '✅ Consulting Organization Created' as status,
    (SELECT name FROM tenants WHERE slug = 'consulting-firm') as tenant_name,
    (SELECT COUNT(*) FROM org_functions WHERE unique_id LIKE 'FN-CONSULT-%') as functions,
    (SELECT COUNT(*) FROM org_roles WHERE unique_id LIKE 'ROLE-CONSULT-%') as roles;

