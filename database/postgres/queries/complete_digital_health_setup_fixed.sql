-- =====================================================================
-- COMPLETE DIGITAL HEALTH ORG STRUCTURE SETUP (FIXED VERSION)
-- This version handles the enum type properly
-- =====================================================================
-- Tenant ID: 684f6c2c-b50d-4726-ad92-c76c3b785a89
-- =====================================================================
-- IMPORTANT: Run add_digital_health_enum_values.sql FIRST to add enum values
-- =====================================================================

-- First, add the enum values (must be done outside transaction)
-- Run these commands separately:

DO $$
BEGIN
    -- Add enum values if they don't exist
    -- Note: These need to be run one at a time, not in a transaction
    
    RAISE NOTICE '⚠️  STEP 1: Adding enum values...';
    RAISE NOTICE 'Run these commands OUTSIDE of BEGIN/COMMIT:';
    RAISE NOTICE '';
    RAISE NOTICE 'ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS ''Digital Health Strategy & Innovation'';';
    RAISE NOTICE 'ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS ''Digital Platforms & Solutions'';';
    RAISE NOTICE 'ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS ''Data Science & Analytics'';';
    RAISE NOTICE 'ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS ''Digital Clinical Development'';';
    RAISE NOTICE 'ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS ''Patient & Provider Experience'';';
    RAISE NOTICE 'ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS ''Regulatory, Quality & Compliance'';';
    RAISE NOTICE 'ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS ''Commercialization & Market Access'';';
    RAISE NOTICE 'ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS ''Technology & IT Infrastructure'';';
    RAISE NOTICE 'ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS ''Legal & IP for Digital'';';
    RAISE NOTICE '';
    RAISE NOTICE 'After running the ALTER TYPE commands above, run the rest of this script.';
END $$;

-- =====================================================================
-- STEP 2: POPULATE FUNCTIONS AND DEPARTMENTS
-- =====================================================================

BEGIN;

DO $$
DECLARE
    digital_health_tenant_id uuid := '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid;
    func_id uuid;
    dept_id uuid;
    func_count INTEGER := 0;
    dept_count INTEGER := 0;
    dept_record RECORD;
    enum_check BOOLEAN;
BEGIN
    RAISE NOTICE 'Digital Health Tenant ID: %', digital_health_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '=== POPULATING DIGITAL HEALTH ORG STRUCTURE ===';
    RAISE NOTICE '';

    -- Check if enum values exist
    SELECT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Digital Health Strategy & Innovation'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'functional_area_type')
    ) INTO enum_check;
    
    IF NOT enum_check THEN
        RAISE EXCEPTION 'Enum values not found! Please run the ALTER TYPE commands shown above first.';
    END IF;

    -- =====================================================================
    -- CREATE FUNCTIONS (9 total)
    -- =====================================================================
    RAISE NOTICE '=== CREATING FUNCTIONS ===';
    
    -- Function 1: Digital Health Strategy & Innovation
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (
        digital_health_tenant_id, 
        'Digital Health Strategy & Innovation'::functional_area_type, 
        'digital-health-strategy-innovation', 
        true, 
        NOW(), 
        NOW()
    )
    ON CONFLICT (tenant_id, name) DO UPDATE SET slug = EXCLUDED.slug, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Digital Health Strategy & Innovation';
    
    -- Function 2: Digital Platforms & Solutions
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (
        digital_health_tenant_id, 
        'Digital Platforms & Solutions'::functional_area_type, 
        'digital-platforms-solutions', 
        true, 
        NOW(), 
        NOW()
    )
    ON CONFLICT (tenant_id, name) DO UPDATE SET slug = EXCLUDED.slug, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Digital Platforms & Solutions';
    
    -- Function 3: Data Science & Analytics
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (
        digital_health_tenant_id, 
        'Data Science & Analytics'::functional_area_type, 
        'data-science-analytics', 
        true, 
        NOW(), 
        NOW()
    )
    ON CONFLICT (tenant_id, name) DO UPDATE SET slug = EXCLUDED.slug, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Data Science & Analytics';
    
    -- Function 4: Digital Clinical Development
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (
        digital_health_tenant_id, 
        'Digital Clinical Development'::functional_area_type, 
        'digital-clinical-development', 
        true, 
        NOW(), 
        NOW()
    )
    ON CONFLICT (tenant_id, name) DO UPDATE SET slug = EXCLUDED.slug, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Digital Clinical Development';
    
    -- Function 5: Patient & Provider Experience
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (
        digital_health_tenant_id, 
        'Patient & Provider Experience'::functional_area_type, 
        'patient-provider-experience', 
        true, 
        NOW(), 
        NOW()
    )
    ON CONFLICT (tenant_id, name) DO UPDATE SET slug = EXCLUDED.slug, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Patient & Provider Experience';
    
    -- Function 6: Regulatory, Quality & Compliance
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (
        digital_health_tenant_id, 
        'Regulatory, Quality & Compliance'::functional_area_type, 
        'regulatory-quality-compliance', 
        true, 
        NOW(), 
        NOW()
    )
    ON CONFLICT (tenant_id, name) DO UPDATE SET slug = EXCLUDED.slug, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Regulatory, Quality & Compliance';
    
    -- Function 7: Commercialization & Market Access
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (
        digital_health_tenant_id, 
        'Commercialization & Market Access'::functional_area_type, 
        'commercialization-market-access', 
        true, 
        NOW(), 
        NOW()
    )
    ON CONFLICT (tenant_id, name) DO UPDATE SET slug = EXCLUDED.slug, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Commercialization & Market Access';
    
    -- Function 8: Technology & IT Infrastructure
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (
        digital_health_tenant_id, 
        'Technology & IT Infrastructure'::functional_area_type, 
        'technology-it-infrastructure', 
        true, 
        NOW(), 
        NOW()
    )
    ON CONFLICT (tenant_id, name) DO UPDATE SET slug = EXCLUDED.slug, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Technology & IT Infrastructure';
    
    -- Function 9: Legal & IP for Digital
    INSERT INTO org_functions (tenant_id, name, slug, is_active, created_at, updated_at)
    VALUES (
        digital_health_tenant_id, 
        'Legal & IP for Digital'::functional_area_type, 
        'legal-ip-digital', 
        true, 
        NOW(), 
        NOW()
    )
    ON CONFLICT (tenant_id, name) DO UPDATE SET slug = EXCLUDED.slug, is_active = true
    RETURNING id INTO func_id;
    func_count := func_count + 1;
    RAISE NOTICE '✅ Created: Legal & IP for Digital';
    
    RAISE NOTICE '';
    RAISE NOTICE 'Total functions created: %', func_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== CREATING DEPARTMENTS ===';
    
    -- =====================================================================
    -- CREATE DEPARTMENTS (40 total) - Same as before
    -- =====================================================================
    
    -- Digital Health Strategy & Innovation departments (4)
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Digital Health Strategy & Innovation';
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
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Digital Platforms & Solutions';
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
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Data Science & Analytics';
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
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Digital Clinical Development';
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
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Patient & Provider Experience';
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
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Regulatory, Quality & Compliance';
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
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Commercialization & Market Access';
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
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Technology & IT Infrastructure';
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
    SELECT id INTO func_id FROM org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Legal & IP for Digital';
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

