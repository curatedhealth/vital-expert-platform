-- ============================================================================
-- PAYERS ORGANIZATION STRUCTURE
-- For Health Insurance Companies & Payers
-- ============================================================================

-- Insert Payers Tenant
INSERT INTO tenants (id, name, slug, industry, type, metadata)
VALUES (
    '9e1f4c5d-6b2a-47e8-9d3b-4c5e6f7a8b9c',
    'Health Insurance Payer',
    'payer-organization',
    'Healthcare Payers',
    'client',
    jsonb_build_object(
        'description', 'Health insurance payer and managed care organizational structure',
        'organization_type', 'Payer/Insurance',
        'regulatory_focus', 'CMS, State Insurance Departments, ACA Compliance',
        'primary_products', ARRAY['Commercial Insurance', 'Medicare Advantage', 'Medicaid MCO', 'Pharmacy Benefits']
    )
)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    type = EXCLUDED.type,
    metadata = EXCLUDED.metadata;

-- PAYERS: Business Functions
INSERT INTO org_functions (id, unique_id, department_name, description, migration_ready, created_by)
VALUES
    (gen_random_uuid(), 'FN-PAYER-MEDICAL', 'Medical Affairs & Pharmacy', 'Medical policy, pharmacy benefits, and clinical programs', true, 'system'),
    (gen_random_uuid(), 'FN-PAYER-HEOR', 'Health Economics & Value Assessment', 'HEOR, value-based contracting, and pricing', true, 'system'),
    (gen_random_uuid(), 'FN-PAYER-PNDT', 'P&T Committee & Formulary', 'Pharmacy & Therapeutics committee and formulary management', true, 'system'),
    (gen_random_uuid(), 'FN-PAYER-CLAIMS', 'Claims & Utilization Management', 'Claims processing, prior authorization, and UM', true, 'system'),
    (gen_random_uuid(), 'FN-PAYER-CONTRACTING', 'Provider Contracting & Networks', 'Provider networks and contract negotiations', true, 'system'),
    (gen_random_uuid(), 'FN-PAYER-COMPLIANCE', 'Compliance & Regulatory Affairs', 'CMS compliance, state regulations, and audits', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

-- PAYERS: Roles (20+ key roles)
INSERT INTO org_roles (id, unique_id, role_name, role_title, description, seniority_level, is_active, created_by)
VALUES
    -- Executive
    (gen_random_uuid(), 'ROLE-PAYER-CMO', 'Chief Medical Officer', 'CMO', 'Medical strategy and clinical policy', 'Executive', true, 'system'),
    (gen_random_uuid(), 'ROLE-PAYER-VPPHARMA', 'VP Pharmacy Services', 'VP Pharmacy', 'Pharmacy benefits and formulary strategy', 'Executive', true, 'system'),
    -- Medical & Clinical
    (gen_random_uuid(), 'ROLE-PAYER-MEDDIR', 'Medical Director', 'Medical Director', 'Medical policy development and review', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PAYER-CLINPHARM', 'Clinical Pharmacist', 'Clinical Pharmacist', 'Formulary management and drug reviews', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PAYER-MEDPOLICY', 'Medical Policy Writer', 'Medical Policy Writer', 'Clinical policy development', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PAYER-PHARMDIR', 'Pharmacy Director', 'Pharmacy Director', 'PBM strategy and pharmacy operations', 'Senior', true, 'system'),
    -- HEOR & Value Assessment
    (gen_random_uuid(), 'ROLE-PAYER-HEORDIR', 'HEOR Director', 'HEOR Director', 'Health economics and outcomes research', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PAYER-VALUEMGR', 'Value Assessment Manager', 'Value Assessment Mgr', 'Technology assessment and value evaluation', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PAYER-PRICINGANAL', 'Pricing Analyst', 'Pricing Analyst', 'Drug pricing and rebate analysis', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PAYER-CONTRACTMGR', 'Contracting Manager - Pharma', 'Contracting Manager', 'Manufacturer contracting and rebates', 'Mid', true, 'system'),
    -- Utilization Management
    (gen_random_uuid(), 'ROLE-PAYER-UMDIR', 'Utilization Management Director', 'UM Director', 'Prior authorization and UM programs', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PAYER-PARNURSE', 'Prior Authorization Nurse', 'PA Nurse', 'Prior authorization reviews', 'Junior', true, 'system'),
    (gen_random_uuid(), 'ROLE-PAYER-CASEMANAGER', 'Case Manager', 'Case Manager', 'Care management and coordination', 'Mid', true, 'system'),
    -- Claims & Analytics
    (gen_random_uuid(), 'ROLE-PAYER-CLAIMSANAL', 'Claims Data Analyst', 'Claims Analyst', 'Claims data analysis and reporting', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PAYER-ACTUARIAL', 'Actuarial Analyst', 'Actuarial Analyst', 'Risk assessment and pricing models', 'Mid', true, 'system'),
    -- Compliance
    (gen_random_uuid(), 'ROLE-PAYER-COMPLIANCE', 'Compliance Manager', 'Compliance Manager', 'CMS and state regulatory compliance', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-PAYER-QUALITY', 'Quality & Accreditation Manager', 'Quality Manager', 'HEDIS, Stars ratings, and accreditation', 'Mid', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

SELECT 
    '✅ Payer Organization Created' as status,
    (SELECT name FROM tenants WHERE slug = 'payer-organization') as tenant_name,
    (SELECT COUNT(*) FROM org_functions WHERE unique_id LIKE 'FN-PAYER-%') as functions,
    (SELECT COUNT(*) FROM org_roles WHERE unique_id LIKE 'ROLE-PAYER-%') as roles;

