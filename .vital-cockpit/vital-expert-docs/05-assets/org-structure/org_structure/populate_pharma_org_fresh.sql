-- =====================================================================
-- POPULATE PHARMA ORG-STRUCTURE - FRESH START
-- Single Source of Truth: Comprehensive Pharmaceutical Industry List
-- Creates all 15 functions and 98 departments with clean slugs
-- =====================================================================
-- NOTE: Run add_functional_area_enum_values.sql FIRST if enum values don't exist
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    func_id uuid;
    dept_record RECORD;
    func_count INTEGER := 0;
    dept_count INTEGER := 0;
BEGIN
    -- Get Pharmaceuticals tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;
    
    RAISE NOTICE 'Pharmaceuticals Tenant ID: %', pharma_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '=== POPULATING PHARMA ORG-STRUCTURE ===';
    RAISE NOTICE 'Single Source of Truth: Comprehensive Pharmaceutical Industry List';
    RAISE NOTICE '';
    
    -- =====================================================================
    -- FUNCTIONS (15 total)
    -- =====================================================================
    RAISE NOTICE '=== CREATING FUNCTIONS ===';
    
    -- Medical Affairs
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Medical Affairs'::public.functional_area_type, 'medical-affairs', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Medical Affairs';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Medical Affairs: %', SQLERRM;
    END;
    
    -- Market Access
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Market Access'::public.functional_area_type, 'market-access', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Market Access';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Market Access: %', SQLERRM;
    END;
    
    -- Commercial Organization
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Commercial Organization'::public.functional_area_type, 'commercial-organization', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Commercial Organization';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Commercial Organization: %', SQLERRM;
    END;
    
    -- Regulatory Affairs
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Regulatory Affairs'::public.functional_area_type, 'regulatory-affairs', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Regulatory Affairs';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Regulatory Affairs: %', SQLERRM;
    END;
    
    -- Research & Development (R&D)
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Research & Development (R&D)'::public.functional_area_type, 'research-and-development', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Research & Development (R&D)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Research & Development (R&D): %', SQLERRM;
    END;
    
    -- Manufacturing & Supply Chain
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Manufacturing & Supply Chain'::public.functional_area_type, 'manufacturing-and-supply-chain', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Manufacturing & Supply Chain';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Manufacturing & Supply Chain: %', SQLERRM;
    END;
    
    -- Finance & Accounting
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Finance & Accounting'::public.functional_area_type, 'finance-and-accounting', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Finance & Accounting';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Finance & Accounting: %', SQLERRM;
    END;
    
    -- Human Resources
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Human Resources'::public.functional_area_type, 'human-resources', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Human Resources';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Human Resources: %', SQLERRM;
    END;
    
    -- Information Technology (IT) / Digital
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Information Technology (IT) / Digital'::public.functional_area_type, 'information-technology-it-digital', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Information Technology (IT) / Digital';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Information Technology (IT) / Digital: %', SQLERRM;
    END;
    
    -- Legal & Compliance
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Legal & Compliance'::public.functional_area_type, 'legal-and-compliance', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Legal & Compliance';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Legal & Compliance: %', SQLERRM;
    END;
    
    -- Corporate Communications
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Corporate Communications'::public.functional_area_type, 'corporate-communications', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Corporate Communications';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Corporate Communications: %', SQLERRM;
    END;
    
    -- Strategic Planning / Corporate Development
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Strategic Planning / Corporate Development'::public.functional_area_type, 'strategic-planning-corporate-development', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Strategic Planning / Corporate Development';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Strategic Planning / Corporate Development: %', SQLERRM;
    END;
    
    -- Business Intelligence / Analytics
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Business Intelligence / Analytics'::public.functional_area_type, 'business-intelligence-analytics', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Business Intelligence / Analytics';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Business Intelligence / Analytics: %', SQLERRM;
    END;
    
    -- Procurement
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Procurement'::public.functional_area_type, 'procurement', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Procurement';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Procurement: %', SQLERRM;
    END;
    
    -- Facilities / Workplace Services
    BEGIN
        INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
        VALUES (pharma_tenant_id, 'Facilities / Workplace Services'::public.functional_area_type, 'facilities-workplace-services', true)
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true
        RETURNING id INTO func_id;
        func_count := func_count + 1;
        RAISE NOTICE '✅ Created: Facilities / Workplace Services';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create Facilities / Workplace Services: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Total functions created: %', func_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== CREATING DEPARTMENTS ===';
    
    -- =====================================================================
    -- DEPARTMENTS (98 total)
    -- =====================================================================
    
    -- Medical Affairs departments (9)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Medical Affairs';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Field Medical'),
            ('Medical Information Services'),
            ('Scientific Communications'),
            ('Medical Education'),
            ('HEOR & Evidence (Health Economics & Outcomes Research)'),
            ('Publications'),
            ('Medical Leadership'),
            ('Clinical Operations Support'),
            ('Medical Excellence & Compliance')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Medical Affairs: 9 departments';
    
    -- Market Access departments (10)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Market Access';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Leadership & Strategy'),
            ('HEOR (Health Economics & Outcomes Research)'),
            ('Value, Evidence & Outcomes'),
            ('Pricing & Reimbursement'),
            ('Payer Relations & Contracting'),
            ('Patient Access & Services'),
            ('Government & Policy Affairs'),
            ('Trade & Distribution'),
            ('Analytics & Insights'),
            ('Operations & Excellence')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Market Access: 10 departments';
    
    -- Commercial Organization departments (11)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Commercial Organization';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Commercial Leadership & Strategy'),
            ('Field Sales Operations'),
            ('Specialty & Hospital Sales'),
            ('Key Account Management'),
            ('Customer Experience'),
            ('Commercial Marketing'),
            ('Business Development & Licensing'),
            ('Commercial Analytics & Insights'),
            ('Sales Training & Enablement'),
            ('Digital & Omnichannel Engagement'),
            ('Compliance & Commercial Operations')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Commercial Organization: 11 departments';
    
    -- Regulatory Affairs departments (6)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Regulatory Affairs';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Regulatory Leadership & Strategy'),
            ('Regulatory Submissions & Operations'),
            ('Regulatory Intelligence & Policy'),
            ('CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)'),
            ('Global Regulatory Affairs (US, EU, APAC, LatAm)'),
            ('Regulatory Compliance & Systems')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Regulatory Affairs: 6 departments';
    
    -- Research & Development (R&D) departments (8)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Research & Development (R&D)';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Discovery Research'),
            ('Translational Science'),
            ('Preclinical Development'),
            ('Clinical Development (Phase I-IV)'),
            ('Biometrics & Data Management'),
            ('Clinical Operations'),
            ('Pharmacovigilance & Drug Safety'),
            ('Project & Portfolio Management')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Research & Development (R&D): 8 departments';
    
    -- Manufacturing & Supply Chain departments (6)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Manufacturing & Supply Chain';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Technical Operations'),
            ('Manufacturing (Small Molecule/Biotech)'),
            ('Quality Assurance / Quality Control'),
            ('Supply Chain & Logistics'),
            ('Process Engineering'),
            ('External Manufacturing Management')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Manufacturing & Supply Chain: 6 departments';
    
    -- Finance & Accounting departments (6)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Finance & Accounting';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Financial Planning & Analysis (FP&A)'),
            ('Accounting Operations (GL/AP/AR)'),
            ('Treasury & Cash Management'),
            ('Tax Planning & Compliance'),
            ('Internal Audit & Controls'),
            ('Business/Commercial Finance')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Finance & Accounting: 6 departments';
    
    -- Human Resources departments (6)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Human Resources';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Talent Acquisition & Recruitment'),
            ('Learning & Development'),
            ('Total Rewards (Comp & Benefits)'),
            ('HR Business Partners'),
            ('Organizational Development'),
            ('HR Operations & Services')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Human Resources: 6 departments';
    
    -- Information Technology (IT) / Digital departments (6)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Information Technology (IT) / Digital';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Enterprise Applications & ERP'),
            ('Data & Analytics'),
            ('Digital Health & Platforms'),
            ('IT Infrastructure & Cloud'),
            ('Cybersecurity'),
            ('End User Services & Support')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Information Technology (IT) / Digital: 6 departments';
    
    -- Legal & Compliance departments (5)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Legal & Compliance';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Corporate Legal'),
            ('Intellectual Property (IP)'),
            ('Contract Management'),
            ('Regulatory & Ethics Compliance'),
            ('Privacy & Data Protection')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Legal & Compliance: 5 departments';
    
    -- Corporate Communications departments (5)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Corporate Communications';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('External Communications & PR'),
            ('Internal Communications'),
            ('Media Relations'),
            ('Investor Relations'),
            ('Corporate Social Responsibility (CSR)')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Corporate Communications: 5 departments';
    
    -- Strategic Planning / Corporate Development departments (5)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Strategic Planning / Corporate Development';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Corporate Strategy'),
            ('Business / Portfolio Development'),
            ('Mergers & Acquisitions (M&A)'),
            ('Project Management Office (PMO)'),
            ('Foresight & Transformation')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Strategic Planning / Corporate Development: 5 departments';
    
    -- Business Intelligence / Analytics departments (5)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Business Intelligence / Analytics';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Market Insights & Research'),
            ('Data Science & Advanced Analytics'),
            ('Reporting & Dashboards'),
            ('Forecasting & Modeling'),
            ('Competitive Intelligence')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Business Intelligence / Analytics: 5 departments';
    
    -- Procurement departments (5)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Procurement';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Sourcing & Purchasing'),
            ('Vendor & Supplier Management'),
            ('Category Management'),
            ('Contracting & Negotiations'),
            ('Procurement Operations')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Procurement: 5 departments';
    
    -- Facilities / Workplace Services departments (5)
    SELECT id INTO func_id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Facilities / Workplace Services';
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Real Estate & Site Management'),
            ('Environmental Health & Safety (EHS)'),
            ('Facility Operations & Maintenance'),
            ('Security & Emergency Planning'),
            ('Sustainability Initiatives')
        ) AS v(dept_name)
    LOOP
        INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
        VALUES (
            pharma_tenant_id,
            func_id,
            dept_record.dept_name,
            lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
            true
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;
        dept_count := dept_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Facilities / Workplace Services: 5 departments';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Functions created: %', func_count;
    RAISE NOTICE '  - Departments created: %', dept_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Pharmaceuticals org-structure populated with clean data';
    RAISE NOTICE '   All functions and departments match the comprehensive list';
END $$;

COMMIT;

