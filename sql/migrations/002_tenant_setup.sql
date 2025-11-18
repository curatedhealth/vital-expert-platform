-- ============================================================================
-- TENANT SETUP FOR MULTI-TENANT MIGRATION
-- ============================================================================
-- Description: Ensure all three tenants exist with proper configuration
-- Date: 2025-11-18
-- Purpose: Create/update tenant records for migration
-- Dependencies: 001_schema_fixes.sql
-- Rollback: 002_tenant_setup_rollback.sql
-- ============================================================================

BEGIN;

-- Track migration progress
INSERT INTO migration_tracking (migration_name, phase, status)
VALUES ('multi_tenant_migration', '002_tenant_setup', 'started');

SAVEPOINT tenant_setup_start;

-- ============================================================================
-- TENANT 1: Platform (Admin/Shared Resources)
-- ============================================================================

\echo 'Setting up Platform tenant...'

INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    compliance_level,
    is_active,
    settings,
    metadata
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'VITAL Platform',
    'vital-platform',
    'platform.vital.ai',
    'hipaa',
    true,
    jsonb_build_object(
        'features', jsonb_build_object(
            'mode_5_enabled', true,
            'rag_enabled', true,
            'agent_creation', true,
            'tool_management', true,
            'knowledge_management', true
        ),
        'limits', jsonb_build_object(
            'max_agents_per_query', 10,
            'max_conversations', -1,  -- Unlimited
            'max_agents', -1,
            'max_tools', -1,
            'max_knowledge_chunks', -1
        ),
        'security', jsonb_build_object(
            'require_mfa', true,
            'session_timeout_minutes', 60,
            'max_failed_login_attempts', 5
        )
    ),
    jsonb_build_object(
        'type', 'platform',
        'description', 'Central platform for admin and shared resources',
        'industry', 'healthcare_technology',
        'country', 'US',
        'is_system_tenant', true
    )
)
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    settings = EXCLUDED.settings,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- ============================================================================
-- TENANT 2: Digital Health Startup
-- ============================================================================

\echo 'Setting up Digital Health Startup tenant...'

INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    compliance_level,
    is_active,
    settings,
    metadata
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Digital Health Startup',
    'digital-health',
    'digital-health.vital.ai',
    'hipaa',
    true,
    jsonb_build_object(
        'features', jsonb_build_object(
            'mode_5_enabled', true,
            'rag_enabled', true,
            'agent_creation', true,
            'tool_management', false,  -- Can use, but not create tools
            'knowledge_management', true
        ),
        'limits', jsonb_build_object(
            'max_agents_per_query', 5,
            'max_conversations', 10000,
            'max_agents', 100,
            'max_tools', 50,
            'max_knowledge_chunks', 50000
        ),
        'security', jsonb_build_object(
            'require_mfa', false,
            'session_timeout_minutes', 120,
            'max_failed_login_attempts', 5
        ),
        'branding', jsonb_build_object(
            'primary_color', '#10b981',
            'logo_url', '/tenants/digital-health/logo.png',
            'custom_domain_enabled', false
        )
    ),
    jsonb_build_object(
        'type', 'customer',
        'description', 'Digital health and telemedicine focused organization',
        'industry', 'digital_health',
        'country', 'US',
        'focus_areas', ARRAY['telemedicine', 'digital_therapeutics', 'wearables', 'remote_monitoring'],
        'plan', 'growth',
        'onboarded_at', NOW()
    )
)
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    settings = EXCLUDED.settings,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- ============================================================================
-- TENANT 3: Pharmaceuticals
-- ============================================================================

\echo 'Setting up Pharmaceuticals tenant...'

INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    compliance_level,
    is_active,
    settings,
    metadata
) VALUES (
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
    'Pharmaceutical Enterprise',
    'pharma',
    'pharma.vital.ai',
    'hipaa',
    true,
    jsonb_build_object(
        'features', jsonb_build_object(
            'mode_5_enabled', true,
            'rag_enabled', true,
            'agent_creation', true,
            'tool_management', false,
            'knowledge_management', true,
            'prism_suite_enabled', true  -- PRISM suite access
        ),
        'limits', jsonb_build_object(
            'max_agents_per_query', 7,
            'max_conversations', 50000,
            'max_agents', 250,
            'max_tools', 100,
            'max_knowledge_chunks', 100000
        ),
        'security', jsonb_build_object(
            'require_mfa', true,
            'session_timeout_minutes', 30,
            'max_failed_login_attempts', 3,
            'ip_whitelist_enabled', false
        ),
        'branding', jsonb_build_object(
            'primary_color', '#3b82f6',
            'logo_url', '/tenants/pharma/logo.png',
            'custom_domain_enabled', true,
            'custom_domain', 'prism.pharmaceutical.com'
        )
    ),
    jsonb_build_object(
        'type', 'enterprise',
        'description', 'Pharmaceutical R&D and regulatory affairs organization',
        'industry', 'pharmaceutical',
        'country', 'US',
        'focus_areas', ARRAY[
            'regulatory_affairs',
            'clinical_trials',
            'pharmacovigilance',
            'market_access',
            'medical_writing',
            'clinical_validation'
        ],
        'plan', 'enterprise',
        'contract_start_date', '2025-01-01',
        'contract_end_date', '2026-12-31',
        'prism_suite_modules', ARRAY[
            'RULES', 'TRIALS', 'GUARD', 'VALUE',
            'BRIDGE', 'PROOF', 'CRAFT', 'SCOUT', 'PROJECT'
        ],
        'onboarded_at', NOW()
    )
)
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    settings = EXCLUDED.settings,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- ============================================================================
-- SEED ORGANIZATIONAL DATA FOR TENANTS
-- ============================================================================

\echo 'Seeding organizational departments...'

-- Digital Health Departments
INSERT INTO org_departments (tenant_id, code, name, description, healthcare_domain, level, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'DIGITAL_HEALTH', 'Digital Health', 'Digital health and telemedicine', 'digital_health', 1, true),
    ('11111111-1111-1111-1111-111111111111', 'PRODUCT', 'Product Development', 'Digital health product development', 'digital_health', 2, true),
    ('11111111-1111-1111-1111-111111111111', 'CLINICAL', 'Clinical Operations', 'Clinical validation and trials', 'clinical_research', 2, true),
    ('11111111-1111-1111-1111-111111111111', 'DATA_SCI', 'Data Science', 'Analytics and AI development', 'data_analytics', 2, true)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- Pharma Departments
INSERT INTO org_departments (tenant_id, code, name, description, healthcare_domain, level, is_active)
VALUES
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'REG_AFFAIRS', 'Regulatory Affairs', 'Regulatory compliance and submissions', 'regulatory_affairs', 1, true),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CLINICAL_OPS', 'Clinical Operations', 'Clinical trial management', 'clinical_research', 1, true),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'PHARMA_VIGIL', 'Pharmacovigilance', 'Drug safety monitoring', 'pharmacovigilance', 1, true),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'MKT_ACCESS', 'Market Access', 'Pricing and reimbursement', 'market_access', 1, true),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'MED_AFFAIRS', 'Medical Affairs', 'Medical information and education', 'medical_affairs', 1, true),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'QUAL_ASSURE', 'Quality Assurance', 'Quality management and compliance', 'quality_management', 1, true)
ON CONFLICT (tenant_id, code) DO NOTHING;

\echo 'Seeding organizational levels...'

-- Digital Health Organizational Levels
INSERT INTO organizational_levels (tenant_id, code, name, description, level_number, role_type, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'EXEC', 'Executive', 'C-level executives', 1, 'executive', true),
    ('11111111-1111-1111-1111-111111111111', 'DIR', 'Director', 'Department directors', 2, 'management', true),
    ('11111111-1111-1111-1111-111111111111', 'MGR', 'Manager', 'Team managers', 3, 'management', true),
    ('11111111-1111-1111-1111-111111111111', 'LEAD', 'Team Lead', 'Technical/project leads', 4, 'professional', true),
    ('11111111-1111-1111-1111-111111111111', 'PROF', 'Professional', 'Individual contributors', 5, 'professional', true)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- Pharma Organizational Levels
INSERT INTO organizational_levels (tenant_id, code, name, description, level_number, role_type, is_active)
VALUES
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'VP', 'Vice President', 'VP-level leadership', 1, 'executive', true),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'SR_DIR', 'Senior Director', 'Senior department leadership', 2, 'management', true),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'DIR', 'Director', 'Department directors', 3, 'management', true),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'SR_MGR', 'Senior Manager', 'Senior team managers', 4, 'management', true),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'MGR', 'Manager', 'Team managers', 5, 'management', true),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'SR_SPEC', 'Senior Specialist', 'Senior subject matter experts', 6, 'professional', true),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'SPEC', 'Specialist', 'Subject matter experts', 7, 'professional', true)
ON CONFLICT (tenant_id, code) DO NOTHING;

\echo 'Seeding business functions...'

-- Pharma Business Functions (PRISM Suite aligned)
INSERT INTO business_functions (tenant_id, name, description, department, healthcare_category, regulatory_requirements)
VALUES
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Regulatory Submissions', 'Prepare and submit regulatory dossiers', 'Regulatory Affairs', 'regulatory_affairs', ARRAY['21 CFR Part 11', 'ICH Guidelines', 'EU CTR']),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Clinical Trial Design', 'Design and protocol development for clinical trials', 'Clinical Operations', 'clinical_research', ARRAY['ICH-GCP', '21 CFR Part 312']),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Safety Signal Detection', 'Monitor and analyze adverse events', 'Pharmacovigilance', 'pharmacovigilance', ARRAY['21 CFR Part 312.32', 'EU Regulation 1235/2010']),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HTA Strategy', 'Health technology assessment and value dossiers', 'Market Access', 'market_access', ARRAY['EUnetHTA Guidelines', 'NICE Methods']),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Information', 'Medical inquiry responses and literature monitoring', 'Medical Affairs', 'medical_affairs', ARRAY['FDA Guidance', 'EFPIA Code']),
    ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Quality Management', 'QMS and compliance monitoring', 'Quality Assurance', 'quality_management', ARRAY['21 CFR Part 211', 'ICH Q10'])
ON CONFLICT (tenant_id, name) DO NOTHING;

-- Digital Health Business Functions
INSERT INTO business_functions (tenant_id, name, description, department, healthcare_category, regulatory_requirements)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Digital Therapeutic Development', 'Develop prescription digital therapeutics', 'Product Development', 'digital_health', ARRAY['FDA Digital Health Guidance', 'IEC 62304']),
    ('11111111-1111-1111-1111-111111111111', 'Remote Patient Monitoring', 'Design RPM solutions and workflows', 'Product Development', 'digital_health', ARRAY['HIPAA', 'FDA 21 CFR Part 11']),
    ('11111111-1111-1111-1111-111111111111', 'Clinical Validation', 'Validate digital health technologies', 'Clinical Operations', 'clinical_validation', ARRAY['HIPAA', 'ISO 14155']),
    ('11111111-1111-1111-1111-111111111111', 'AI/ML Model Development', 'Develop and validate healthcare AI models', 'Data Science', 'data_analytics', ARRAY['FDA AI/ML Guidance', 'EU AI Act'])
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ============================================================================
-- VALIDATION
-- ============================================================================

\echo 'Validating tenant setup...'

DO $$
DECLARE
    v_platform_tenant_count INTEGER;
    v_digital_health_tenant_count INTEGER;
    v_pharma_tenant_count INTEGER;
    v_total_dept_count INTEGER;
    v_total_level_count INTEGER;
    v_total_func_count INTEGER;
BEGIN
    -- Check all three tenants exist
    SELECT COUNT(*) INTO v_platform_tenant_count
    FROM tenants WHERE id = '00000000-0000-0000-0000-000000000001';

    SELECT COUNT(*) INTO v_digital_health_tenant_count
    FROM tenants WHERE id = '11111111-1111-1111-1111-111111111111';

    SELECT COUNT(*) INTO v_pharma_tenant_count
    FROM tenants WHERE id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    IF v_platform_tenant_count != 1 THEN
        RAISE EXCEPTION 'Platform tenant not created properly';
    END IF;

    IF v_digital_health_tenant_count != 1 THEN
        RAISE EXCEPTION 'Digital Health tenant not created properly';
    END IF;

    IF v_pharma_tenant_count != 1 THEN
        RAISE EXCEPTION 'Pharma tenant not created properly';
    END IF;

    -- Check organizational data
    SELECT COUNT(*) INTO v_total_dept_count FROM org_departments;
    SELECT COUNT(*) INTO v_total_level_count FROM organizational_levels;
    SELECT COUNT(*) INTO v_total_func_count FROM business_functions;

    RAISE NOTICE 'Tenant setup validation passed!';
    RAISE NOTICE '  - Tenants created: 3';
    RAISE NOTICE '  - Departments: %', v_total_dept_count;
    RAISE NOTICE '  - Organizational levels: %', v_total_level_count;
    RAISE NOTICE '  - Business functions: %', v_total_func_count;
END $$;

-- ============================================================================
-- COMMIT
-- ============================================================================

-- Update migration tracking
UPDATE migration_tracking
SET status = 'completed',
    completed_at = NOW(),
    metrics = jsonb_build_object(
        'tenants_created', 3,
        'departments_created', (SELECT COUNT(*) FROM org_departments),
        'levels_created', (SELECT COUNT(*) FROM organizational_levels),
        'functions_created', (SELECT COUNT(*) FROM business_functions)
    )
WHERE migration_name = 'multi_tenant_migration'
  AND phase = '002_tenant_setup';

COMMIT;

\echo '============================================'
\echo 'Tenant setup completed successfully!'
\echo '============================================'

-- Display summary
SELECT
    'TENANT SETUP SUMMARY' as report,
    id,
    name,
    slug,
    compliance_level,
    is_active
FROM tenants
WHERE id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
)
ORDER BY
    CASE id
        WHEN '00000000-0000-0000-0000-000000000001' THEN 1
        WHEN '11111111-1111-1111-1111-111111111111' THEN 2
        WHEN 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' THEN 3
    END;
