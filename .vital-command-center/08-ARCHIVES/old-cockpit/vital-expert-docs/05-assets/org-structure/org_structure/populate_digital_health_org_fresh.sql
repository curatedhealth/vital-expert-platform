-- =====================================================================
-- POPULATE DIGITAL HEALTH ORG-STRUCTURE - FRESH START
-- Single Source of Truth: Comprehensive Digital Health Organization List
-- Creates all 9 functions and 40 departments with clean slugs
-- =====================================================================
-- NOTE: Run add_functional_area_enum_values.sql FIRST if enum values don't exist
-- =====================================================================

BEGIN;

DO $$
DECLARE
    digital_health_tenant_id uuid;
    func_id uuid;
    dept_record RECORD;
    func_count INTEGER := 0;
    dept_count INTEGER := 0;
BEGIN
    -- Get Digital Health tenant ID
    SELECT id INTO digital_health_tenant_id
    FROM public.tenants
    WHERE slug = 'digital-health-startup' 
       OR slug = 'digital-health'
       OR name ILIKE '%digital health%'
    LIMIT 1;
    
    IF digital_health_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Digital Health tenant not found';
    END IF;
    
    RAISE NOTICE 'Digital Health Tenant ID: %', digital_health_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '=== POPULATING DIGITAL HEALTH ORG-STRUCTURE ===';
    RAISE NOTICE 'Single Source of Truth: Comprehensive Digital Health Organization List';
    RAISE NOTICE '';
    
    -- =====================================================================
    -- FUNCTIONS (9 total)
    -- =====================================================================
    RAISE NOTICE '=== CREATING FUNCTIONS ===';
    
    -- Digital Health Strategy & Innovation
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (digital_health_tenant_id, 'Digital Health Strategy & Innovation'::public.functional_area_type, 'digital-health-strategy-innovation', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Digital Health Strategy & Innovation';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Digital Health Strategy & Innovation: %', SQLERRM;
    END;
    
    -- Digital Platforms & Solutions
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (digital_health_tenant_id, 'Digital Platforms & Solutions'::public.functional_area_type, 'digital-platforms-solutions', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Digital Platforms & Solutions';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Digital Platforms & Solutions: %', SQLERRM;
    END;
    
    -- Data Science & Analytics
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (digital_health_tenant_id, 'Data Science & Analytics'::public.functional_area_type, 'data-science-analytics', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Data Science & Analytics';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Data Science & Analytics: %', SQLERRM;
    END;
    
    -- Digital Clinical Development
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (digital_health_tenant_id, 'Digital Clinical Development'::public.functional_area_type, 'digital-clinical-development', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Digital Clinical Development';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Digital Clinical Development: %', SQLERRM;
    END;
    
    -- Patient & Provider Experience
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (digital_health_tenant_id, 'Patient & Provider Experience'::public.functional_area_type, 'patient-provider-experience', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Patient & Provider Experience';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Patient & Provider Experience: %', SQLERRM;
    END;
    
    -- Regulatory, Quality & Compliance
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (digital_health_tenant_id, 'Regulatory, Quality & Compliance'::public.functional_area_type, 'regulatory-quality-compliance', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Regulatory, Quality & Compliance';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Regulatory, Quality & Compliance: %', SQLERRM;
    END;
    
    -- Commercialization & Market Access
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (digital_health_tenant_id, 'Commercialization & Market Access'::public.functional_area_type, 'commercialization-market-access', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Commercialization & Market Access';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Commercialization & Market Access: %', SQLERRM;
    END;
    
    -- Technology & IT Infrastructure
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (digital_health_tenant_id, 'Technology & IT Infrastructure'::public.functional_area_type, 'technology-it-infrastructure', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Technology & IT Infrastructure';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Technology & IT Infrastructure: %', SQLERRM;
    END;
    
    -- Legal & IP for Digital
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (digital_health_tenant_id, 'Legal & IP for Digital'::public.functional_area_type, 'legal-ip-digital', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Legal & IP for Digital';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Legal & IP for Digital: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Total functions created: %', func_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== CREATING DEPARTMENTS ===';
    
    -- =====================================================================
    -- DEPARTMENTS (40 total)
    -- =====================================================================
    
    -- Digital Health Strategy & Innovation departments (4)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Digital Health Strategy & Innovation';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Digital Foresight & R&D'),
            ('Digital Product Strategy'),
            ('Partnership & Ecosystem Development'),
            ('Digital Transformation Office')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Digital Health Strategy & Innovation: 4 departments';
    
    -- Digital Platforms & Solutions departments (6)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Digital Platforms & Solutions';
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
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Digital Platforms & Solutions: 6 departments';
    
    -- Data Science & Analytics departments (5)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Data Science & Analytics';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Digital Biomarkers & Real-World Data'),
            ('AI/ML & Predictive Analytics'),
            ('Digital Evidence Generation'),
            ('Data Engineering & Architecture'),
            ('Health Outcomes Analytics')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Data Science & Analytics: 5 departments';
    
    -- Digital Clinical Development departments (4)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Digital Clinical Development';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Decentralized Clinical Trials (DCT)'),
            ('eConsent & ePRO/eCOA'),
            ('Site & Patient Digital Enablement'),
            ('Digital Protocol Design')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Digital Clinical Development: 4 departments';
    
    -- Patient & Provider Experience departments (5)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Patient & Provider Experience';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('UX/UI Design & Research'),
            ('Digital Patient Support Programs'),
            ('Omnichannel Engagement'),
            ('Digital Medical Education'),
            ('Digital Health Literacy')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Patient & Provider Experience: 5 departments';
    
    -- Regulatory, Quality & Compliance departments (5)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Regulatory, Quality & Compliance';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Digital Health Regulatory Affairs'),
            ('Medical Device/Software QA & QMS'),
            ('Data Privacy & Digital Ethics'),
            ('Cybersecurity for Health'),
            ('Digital Risk Management')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Regulatory, Quality & Compliance: 5 departments';
    
    -- Commercialization & Market Access departments (5)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Commercialization & Market Access';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Digital Go-to-Market Strategy'),
            ('Digital Health Business Development'),
            ('Payer & Reimbursement Strategy'),
            ('Real-World Value Demonstration'),
            ('Digital Adoption & Implementation')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Commercialization & Market Access: 5 departments';
    
    -- Technology & IT Infrastructure departments (5)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Technology & IT Infrastructure';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Cloud Platforms & SaaS Ops'),
            ('Interoperability & API Management'),
            ('DevOps & Agile Delivery'),
            ('Data Integration & Exchange (FHIR, HL7)'),
            ('Support & Digital Workplace Services')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Technology & IT Infrastructure: 5 departments';
    
    -- Legal & IP for Digital departments (4)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = digital_health_tenant_id AND name::text = 'Legal & IP for Digital';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Digital Health Law'),
            ('Software Licensing & IP'),
            ('Digital Contracts & Data Use Agreements'),
            ('Regulatory Watch & Digital Policy')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Legal & IP for Digital: 4 departments';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Functions created: %', func_count;
    RAISE NOTICE '  - Departments created: %', dept_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Digital Health org-structure populated with clean data';
    RAISE NOTICE '   All functions and departments match the comprehensive list';
END $$;

COMMIT;

