-- =====================================================================
-- COMPLETE DIGITAL HEALTH ORG STRUCTURE SETUP
-- This script populates functions, departments, and roles for Digital Health
-- =====================================================================
-- Tenant ID: 684f6c2c-b50d-4726-ad92-c76c3b785a89
-- =====================================================================

BEGIN;

DO $$
DECLARE
    digital_health_tenant_id uuid := '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid;
    func_id uuid;
    dept_id uuid;
    func_count INTEGER := 0;
    dept_count INTEGER := 0;
    role_count INTEGER := 0;
    dept_record RECORD;
BEGIN
    RAISE NOTICE 'Digital Health Tenant ID: %', digital_health_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '=== POPULATING DIGITAL HEALTH ORG STRUCTURE ===';
    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 1: CREATE FUNCTIONS (9 total)
    -- =====================================================================
    RAISE NOTICE '=== STEP 1: CREATING FUNCTIONS ===';
    
    -- Function 1: Digital Health Strategy & Innovation
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (digital_health_tenant_id, 'Digital Health Strategy & Innovation', 'digital-health-strategy-innovation', true, NOW(), NOW())
    ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Digital Health Strategy & Innovation';
    
    -- Function 2: Digital Platforms & Solutions
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (digital_health_tenant_id, 'Digital Platforms & Solutions', 'digital-platforms-solutions', true, NOW(), NOW())
    ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Digital Platforms & Solutions';
    
    -- Function 3: Data Science & Analytics
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (digital_health_tenant_id, 'Data Science & Analytics', 'data-science-analytics', true, NOW(), NOW())
    ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Data Science & Analytics';
    
    -- Function 4: Digital Clinical Development
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (digital_health_tenant_id, 'Digital Clinical Development', 'digital-clinical-development', true, NOW(), NOW())
    ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Digital Clinical Development';
    
    -- Function 5: Patient & Provider Experience
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (digital_health_tenant_id, 'Patient & Provider Experience', 'patient-provider-experience', true, NOW(), NOW())
    ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Patient & Provider Experience';
    
    -- Function 6: Regulatory, Quality & Compliance
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (digital_health_tenant_id, 'Regulatory, Quality & Compliance', 'regulatory-quality-compliance', true, NOW(), NOW())
    ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Regulatory, Quality & Compliance';
    
    -- Function 7: Commercialization & Market Access
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (digital_health_tenant_id, 'Commercialization & Market Access', 'commercialization-market-access', true, NOW(), NOW())
    ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Commercialization & Market Access';
    
    -- Function 8: Technology & IT Infrastructure
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (digital_health_tenant_id, 'Technology & IT Infrastructure', 'technology-it-infrastructure', true, NOW(), NOW())
    ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Technology & IT Infrastructure';
    
    -- Function 9: Legal & IP for Digital
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (digital_health_tenant_id, 'Legal & IP for Digital', 'legal-ip-digital', true, NOW(), NOW())
    ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Legal & IP for Digital';
    
    RAISE NOTICE '';
    RAISE NOTICE 'Total functions created: %', func_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 2: CREATING DEPARTMENTS ===';
    
    -- =====================================================================
    -- STEP 2: CREATE DEPARTMENTS (40 total)
    -- =====================================================================
    
    -- Digital Health Strategy & Innovation departments (4)
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Health Strategy & Innovation';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Digital Foresight & R&D'),
            ('Digital Product Strategy'),
            ('Partnership & Ecosystem Development'),
            ('Digital Transformation Office')
        ) AS v(dept_name)
    LOOP
        INSERT INTO org_departments (tenant_id, function_id, name, slug, is_active, created_at, updated_at)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Digital Health Strategy & Innovation: 4 departments';
    
    -- Digital Platforms & Solutions departments (6)
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Platforms & Solutions';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Virtual Care & Telehealth'),
            ('Remote Patient Monitoring (RPM)'),
            ('Digital Therapeutics (DTx)'),
            ('Engagement & Behavior Change Platforms'),
            ('Mobile Health (mHealth) Apps'),
            ('Connected Devices & Wearables')
        ) AS v(dept_name)
    LOOP
        INSERT INTO org_departments (tenant_id, function_id, name, slug, is_active, created_at, updated_at)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Digital Platforms & Solutions: 6 departments';
    
    -- Data Science & Analytics departments (5)
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name = 'Data Science & Analytics';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Digital Biomarkers & Real-World Data'),
            ('AI/ML & Predictive Analytics'),
            ('Digital Evidence Generation'),
            ('Data Engineering & Architecture'),
            ('Health Outcomes Analytics')
        ) AS v(dept_name)
    LOOP
        INSERT INTO org_departments (tenant_id, function_id, name, slug, is_active, created_at, updated_at)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Data Science & Analytics: 5 departments';
    
    -- Digital Clinical Development departments (4)
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Clinical Development';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Decentralized Clinical Trials (DCT)'),
            ('eConsent & ePRO/eCOA'),
            ('Site & Patient Digital Enablement'),
            ('Digital Protocol Design')
        ) AS v(dept_name)
    LOOP
        INSERT INTO org_departments (tenant_id, function_id, name, slug, is_active, created_at, updated_at)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Digital Clinical Development: 4 departments';
    
    -- Patient & Provider Experience departments (5)
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name = 'Patient & Provider Experience';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('UX/UI Design & Research'),
            ('Digital Patient Support Programs'),
            ('Omnichannel Engagement'),
            ('Digital Medical Education'),
            ('Digital Health Literacy')
        ) AS v(dept_name)
    LOOP
        INSERT INTO org_departments (tenant_id, function_id, name, slug, is_active, created_at, updated_at)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Patient & Provider Experience: 5 departments';
    
    -- Regulatory, Quality & Compliance departments (5)
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name = 'Regulatory, Quality & Compliance';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Digital Health Regulatory Affairs'),
            ('Medical Device/Software QA & QMS'),
            ('Data Privacy & Digital Ethics'),
            ('Cybersecurity for Health'),
            ('Digital Risk Management')
        ) AS v(dept_name)
    LOOP
        INSERT INTO org_departments (tenant_id, function_id, name, slug, is_active, created_at, updated_at)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Regulatory, Quality & Compliance: 5 departments';
    
    -- Commercialization & Market Access departments (5)
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name = 'Commercialization & Market Access';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Digital Go-to-Market Strategy'),
            ('Digital Health Business Development'),
            ('Payer & Reimbursement Strategy'),
            ('Real-World Value Demonstration'),
            ('Digital Adoption & Implementation')
        ) AS v(dept_name)
    LOOP
        INSERT INTO org_departments (tenant_id, function_id, name, slug, is_active, created_at, updated_at)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Commercialization & Market Access: 5 departments';
    
    -- Technology & IT Infrastructure departments (5)
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name = 'Technology & IT Infrastructure';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Cloud Platforms & SaaS Ops'),
            ('Interoperability & API Management'),
            ('DevOps & Agile Delivery'),
            ('Data Integration & Exchange (FHIR, HL7)'),
            ('Support & Digital Workplace Services')
        ) AS v(dept_name)
    LOOP
        INSERT INTO org_departments (tenant_id, function_id, name, slug, is_active, created_at, updated_at)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Technology & IT Infrastructure: 5 departments';
    
    -- Legal & IP for Digital departments (4)
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name = 'Legal & IP for Digital';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Digital Health Law'),
            ('Software Licensing & IP'),
            ('Digital Contracts & Data Use Agreements'),
            ('Regulatory Watch & Digital Policy')
        ) AS v(dept_name)
    LOOP
        INSERT INTO org_departments (tenant_id, function_id, name, slug, is_active, created_at, updated_at)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Legal & IP for Digital: 4 departments';
    
    RAISE NOTICE '';
    RAISE NOTICE 'Total departments created: %', dept_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 3: ROLES WILL BE POPULATED SEPARATELY ===';
    RAISE NOTICE 'Run populate_digital_health_roles_from_json.sql after this completes';
    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Functions created: %', func_count;
    RAISE NOTICE '  - Departments created: %', dept_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Digital Health functions and departments populated successfully';
    
END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 
    'org_functions' as table_name,
    COUNT(*) as count
FROM org_functions
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
UNION ALL
SELECT 
    'org_departments',
    COUNT(*)
FROM org_departments
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
UNION ALL
SELECT 
    'org_roles',
    COUNT(*)
FROM org_roles
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89';

