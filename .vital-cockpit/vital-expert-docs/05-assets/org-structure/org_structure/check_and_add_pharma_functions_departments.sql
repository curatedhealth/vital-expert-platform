-- =====================================================================
-- CHECK AND ADD MISSING PHARMA FUNCTIONS & DEPARTMENTS
-- =====================================================================
-- This script checks current functions and departments in Pharmaceuticals
-- tenant and adds any missing ones from the comprehensive list
-- =====================================================================

BEGIN;

-- Get Pharmaceuticals tenant ID
DO $$
DECLARE
    pharma_tenant_id uuid;
    function_record RECORD;
    dept_record RECORD;
    missing_count INTEGER := 0;
    added_count INTEGER := 0;
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
    
    -- =====================================================================
    -- FUNCTIONS (Top-level business functions)
    -- =====================================================================
    RAISE NOTICE '=== CHECKING FUNCTIONS ===';
    
    -- List of required functions
    -- Note: Handle enum type carefully - try casting, if fails use text
    FOR function_record IN
        SELECT * FROM (VALUES
            ('Medical Affairs'),
            ('Market Access'),
            ('Commercial Organization'),
            ('Regulatory Affairs'),
            ('Research & Development (R&D)'),
            ('Manufacturing & Supply Chain'),
            ('Finance & Accounting'),
            ('Human Resources'),
            ('Information Technology (IT) / Digital'),
            ('Legal & Compliance'),
            ('Corporate Communications'),
            ('Strategic Planning / Corporate Development'),
            ('Business Intelligence / Analytics'),
            ('Procurement'),
            ('Facilities / Workplace Services')
        ) AS v(function_name)
    LOOP
        -- Check if function exists (compare as text)
        IF NOT EXISTS (
            SELECT 1 FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = function_record.function_name
        ) THEN
            -- Try to insert - handle enum type gracefully
            BEGIN
                INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    function_record.function_name,
                    lower(regexp_replace(function_record.function_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added function: %', function_record.function_name;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not add function %: %', function_record.function_name, SQLERRM;
            END;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Functions added: %', added_count;
    
    -- =====================================================================
    -- DEPARTMENTS (Under each function)
    -- =====================================================================
    RAISE NOTICE '=== CHECKING DEPARTMENTS ===';
    added_count := 0;
    
    -- Medical Affairs departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Medical Affairs', 'Field Medical'),
            ('Medical Affairs', 'Medical Information Services'),
            ('Medical Affairs', 'Scientific Communications'),
            ('Medical Affairs', 'Medical Education'),
            ('Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)'),
            ('Medical Affairs', 'Publications'),
            ('Medical Affairs', 'Medical Leadership'),
            ('Medical Affairs', 'Clinical Operations Support'),
            ('Medical Affairs', 'Medical Excellence & Compliance')
        ) AS v(function_name, dept_name)
    LOOP
        -- Get function ID
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Market Access departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Market Access', 'Leadership & Strategy'),
            ('Market Access', 'HEOR (Health Economics & Outcomes Research)'),
            ('Market Access', 'Value, Evidence & Outcomes'),
            ('Market Access', 'Pricing & Reimbursement'),
            ('Market Access', 'Payer Relations & Contracting'),
            ('Market Access', 'Patient Access & Services'),
            ('Market Access', 'Government & Policy Affairs'),
            ('Market Access', 'Trade & Distribution'),
            ('Market Access', 'Analytics & Insights'),
            ('Market Access', 'Operations & Excellence')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Commercial Organization departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Commercial Organization', 'Commercial Leadership & Strategy'),
            ('Commercial Organization', 'Field Sales Operations'),
            ('Commercial Organization', 'Specialty & Hospital Sales'),
            ('Commercial Organization', 'Key Account Management'),
            ('Commercial Organization', 'Customer Experience'),
            ('Commercial Organization', 'Commercial Marketing'),
            ('Commercial Organization', 'Business Development & Licensing'),
            ('Commercial Organization', 'Commercial Analytics & Insights'),
            ('Commercial Organization', 'Sales Training & Enablement'),
            ('Commercial Organization', 'Digital & Omnichannel Engagement'),
            ('Commercial Organization', 'Compliance & Commercial Operations')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Regulatory Affairs departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Regulatory Affairs', 'Regulatory Leadership & Strategy'),
            ('Regulatory Affairs', 'Regulatory Submissions & Operations'),
            ('Regulatory Affairs', 'Regulatory Intelligence & Policy'),
            ('Regulatory Affairs', 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)'),
            ('Regulatory Affairs', 'Global Regulatory Affairs (US, EU, APAC, LatAm)'),
            ('Regulatory Affairs', 'Regulatory Compliance & Systems')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Research & Development (R&D) departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Research & Development (R&D)', 'Discovery Research'),
            ('Research & Development (R&D)', 'Translational Science'),
            ('Research & Development (R&D)', 'Preclinical Development'),
            ('Research & Development (R&D)', 'Clinical Development (Phase I-IV)'),
            ('Research & Development (R&D)', 'Biometrics & Data Management'),
            ('Research & Development (R&D)', 'Clinical Operations'),
            ('Research & Development (R&D)', 'Pharmacovigilance & Drug Safety'),
            ('Research & Development (R&D)', 'Project & Portfolio Management')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Manufacturing & Supply Chain departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Manufacturing & Supply Chain', 'Technical Operations'),
            ('Manufacturing & Supply Chain', 'Manufacturing (Small Molecule/Biotech)'),
            ('Manufacturing & Supply Chain', 'Quality Assurance / Quality Control'),
            ('Manufacturing & Supply Chain', 'Supply Chain & Logistics'),
            ('Manufacturing & Supply Chain', 'Process Engineering'),
            ('Manufacturing & Supply Chain', 'External Manufacturing Management')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Finance & Accounting departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Finance & Accounting', 'Financial Planning & Analysis (FP&A)'),
            ('Finance & Accounting', 'Accounting Operations (GL/AP/AR)'),
            ('Finance & Accounting', 'Treasury & Cash Management'),
            ('Finance & Accounting', 'Tax Planning & Compliance'),
            ('Finance & Accounting', 'Internal Audit & Controls'),
            ('Finance & Accounting', 'Business/Commercial Finance')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Human Resources departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Human Resources', 'Talent Acquisition & Recruitment'),
            ('Human Resources', 'Learning & Development'),
            ('Human Resources', 'Total Rewards (Comp & Benefits)'),
            ('Human Resources', 'HR Business Partners'),
            ('Human Resources', 'Organizational Development'),
            ('Human Resources', 'HR Operations & Services')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Information Technology (IT) / Digital departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Information Technology (IT) / Digital', 'Enterprise Applications & ERP'),
            ('Information Technology (IT) / Digital', 'Data & Analytics'),
            ('Information Technology (IT) / Digital', 'Digital Health & Platforms'),
            ('Information Technology (IT) / Digital', 'IT Infrastructure & Cloud'),
            ('Information Technology (IT) / Digital', 'Cybersecurity'),
            ('Information Technology (IT) / Digital', 'End User Services & Support')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Legal & Compliance departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Legal & Compliance', 'Corporate Legal'),
            ('Legal & Compliance', 'Intellectual Property (IP)'),
            ('Legal & Compliance', 'Contract Management'),
            ('Legal & Compliance', 'Regulatory & Ethics Compliance'),
            ('Legal & Compliance', 'Privacy & Data Protection')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Corporate Communications departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Corporate Communications', 'External Communications & PR'),
            ('Corporate Communications', 'Internal Communications'),
            ('Corporate Communications', 'Media Relations'),
            ('Corporate Communications', 'Investor Relations'),
            ('Corporate Communications', 'Corporate Social Responsibility (CSR)')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Strategic Planning / Corporate Development departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Strategic Planning / Corporate Development', 'Corporate Strategy'),
            ('Strategic Planning / Corporate Development', 'Business / Portfolio Development'),
            ('Strategic Planning / Corporate Development', 'Mergers & Acquisitions (M&A)'),
            ('Strategic Planning / Corporate Development', 'Project Management Office (PMO)'),
            ('Strategic Planning / Corporate Development', 'Foresight & Transformation')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Business Intelligence / Analytics departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Business Intelligence / Analytics', 'Market Insights & Research'),
            ('Business Intelligence / Analytics', 'Data Science & Advanced Analytics'),
            ('Business Intelligence / Analytics', 'Reporting & Dashboards'),
            ('Business Intelligence / Analytics', 'Forecasting & Modeling'),
            ('Business Intelligence / Analytics', 'Competitive Intelligence')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Procurement departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Procurement', 'Sourcing & Purchasing'),
            ('Procurement', 'Vendor & Supplier Management'),
            ('Procurement', 'Category Management'),
            ('Procurement', 'Contracting & Negotiations'),
            ('Procurement', 'Procurement Operations')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    -- Facilities / Workplace Services departments
    FOR dept_record IN
        SELECT * FROM (VALUES
            ('Facilities / Workplace Services', 'Real Estate & Site Management'),
            ('Facilities / Workplace Services', 'Environmental Health & Safety (EHS)'),
            ('Facilities / Workplace Services', 'Facility Operations & Maintenance'),
            ('Facilities / Workplace Services', 'Security & Emergency Planning'),
            ('Facilities / Workplace Services', 'Sustainability Initiatives')
        ) AS v(function_name, dept_name)
    LOOP
        DECLARE
            func_id uuid;
        BEGIN
            SELECT id INTO func_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = dept_record.function_name;
            
            IF func_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                AND function_id = func_id
                AND name = dept_record.dept_name
            ) THEN
                INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
                VALUES (
                    pharma_tenant_id,
                    func_id,
                    dept_record.dept_name,
                    lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                    true
                )
                ON CONFLICT (tenant_id, slug) DO NOTHING;
                
                added_count := added_count + 1;
                RAISE NOTICE 'Added department: % -> %', dept_record.function_name, dept_record.dept_name;
            END IF;
        END;
    END LOOP;
    
    RAISE NOTICE 'Total departments added: %', added_count;
    RAISE NOTICE '=== COMPLETE ===';
END $$;

COMMIT;

