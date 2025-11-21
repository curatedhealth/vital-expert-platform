-- =====================================================================
-- CONSOLIDATE AND NORMALIZE PHARMA ORG-STRUCTURE
-- Single Source of Truth: Comprehensive Pharmaceutical Industry List
-- =====================================================================
-- This script:
-- 1. Merges duplicate functions (keeps one with more data)
-- 2. Renames functions to match comprehensive list
-- 3. Adds missing functions
-- 4. Adds/updates departments to match comprehensive list exactly
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    func_record RECORD;
    dept_record RECORD;
    primary_func_id uuid;
    duplicate_func_id uuid;
    dept_count_primary INTEGER;
    dept_count_duplicate INTEGER;
    role_count_primary INTEGER;
    role_count_duplicate INTEGER;
    merged_count INTEGER := 0;
    renamed_count INTEGER := 0;
    added_func_count INTEGER := 0;
    added_dept_count INTEGER := 0;
    -- Enum verification variables
    enum_value TEXT;
    enum_exists BOOLEAN;
    enum_type_oid OID;
    missing_values TEXT[] := ARRAY[]::TEXT[];
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
    RAISE NOTICE '=== STEP 1: MERGE DUPLICATE FUNCTIONS ===';
    
    -- Merge duplicates: For each duplicate, keep the one with more data
    FOR func_record IN
        SELECT 
            f.name,
            array_agg(f.id ORDER BY 
                (SELECT COUNT(*) FROM public.org_departments d WHERE d.function_id = f.id AND d.tenant_id = f.tenant_id) DESC,
                (SELECT COUNT(*) FROM public.org_roles r WHERE r.function_id = f.id AND r.tenant_id = f.tenant_id) DESC,
                f.created_at DESC
            ) as func_ids
        FROM public.org_functions f
        WHERE f.tenant_id = pharma_tenant_id
        GROUP BY f.name
        HAVING COUNT(*) > 1
    LOOP
        -- Primary is the first one (most data)
        primary_func_id := func_record.func_ids[1];
        
        -- Get counts for primary
        SELECT COUNT(*) INTO dept_count_primary
        FROM public.org_departments
        WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id;
        
        SELECT COUNT(*) INTO role_count_primary
        FROM public.org_roles
        WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id;
        
        RAISE NOTICE 'Merging duplicates for: %', func_record.name;
        RAISE NOTICE '  Primary function ID: % (% departments, % roles)', 
            primary_func_id, dept_count_primary, role_count_primary;
        
        -- Process each duplicate (skip the first one which is the primary)
        FOR i IN 2..array_length(func_record.func_ids, 1) LOOP
            duplicate_func_id := func_record.func_ids[i];
            
            SELECT COUNT(*) INTO dept_count_duplicate
            FROM public.org_departments
            WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id;
            
            SELECT COUNT(*) INTO role_count_duplicate
            FROM public.org_roles
            WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id;
            
            RAISE NOTICE '  Merging duplicate ID: % (% departments, % roles)', 
                duplicate_func_id, dept_count_duplicate, role_count_duplicate;
            
            -- Move departments from duplicate to primary
            UPDATE public.org_departments
            SET function_id = primary_func_id
            WHERE function_id = duplicate_func_id 
            AND tenant_id = pharma_tenant_id
            AND NOT EXISTS (
                -- Avoid duplicates: don't move if department with same name already exists in primary
                SELECT 1 FROM public.org_departments d2
                WHERE d2.function_id = primary_func_id
                AND d2.tenant_id = pharma_tenant_id
                AND d2.name = org_departments.name
            );
            
            -- Move roles from duplicate to primary
            UPDATE public.org_roles
            SET function_id = primary_func_id
            WHERE function_id = duplicate_func_id 
            AND tenant_id = pharma_tenant_id;
            
            -- Update roles' department_id if department was moved
            UPDATE public.org_roles r
            SET department_id = d_new.id
            FROM public.org_departments d_old, public.org_departments d_new
            WHERE r.department_id = d_old.id
            AND d_old.function_id = duplicate_func_id
            AND d_new.function_id = primary_func_id
            AND d_new.tenant_id = pharma_tenant_id
            AND d_old.name = d_new.name
            AND r.tenant_id = pharma_tenant_id;
            
            -- Delete duplicate function
            DELETE FROM public.org_functions
            WHERE id = duplicate_func_id AND tenant_id = pharma_tenant_id;
            
            merged_count := merged_count + 1;
            RAISE NOTICE '  ✅ Merged and deleted duplicate';
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Total duplicates merged: %', merged_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 2: VERIFY ENUM VALUES EXIST ===';
    RAISE NOTICE 'Note: Run add_functional_area_enum_values.sql FIRST if enum values are missing';
    
    -- Verify required enum values exist
    -- Get the enum type OID
    SELECT oid INTO enum_type_oid
    FROM pg_type 
    WHERE typname = 'functional_area_type';
    
    IF enum_type_oid IS NULL THEN
        RAISE EXCEPTION 'Enum type functional_area_type not found. Please check your schema.';
    END IF;
    
    missing_values := ARRAY[]::TEXT[];
    
    FOR enum_value IN
        SELECT * FROM (VALUES
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
        ) AS v(enum_val)
    LOOP
        -- Check if enum value exists
        SELECT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = enum_value
            AND enumtypid = enum_type_oid
        ) INTO enum_exists;
        
        IF NOT enum_exists THEN
            missing_values := array_append(missing_values, enum_value);
        END IF;
    END LOOP;
    
    IF array_length(missing_values, 1) > 0 THEN
        RAISE EXCEPTION 'Missing enum values: %. Please run add_functional_area_enum_values.sql first!', array_to_string(missing_values, ', ');
    ELSE
        RAISE NOTICE '✅ All required enum values exist';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 3: RENAME FUNCTIONS TO MATCH COMPREHENSIVE LIST ===';
    
    -- Rename functions to match comprehensive list
    FOR func_record IN
        SELECT * FROM (VALUES
            ('Commercial', 'Commercial Organization'),
            ('Regulatory', 'Regulatory Affairs'),
            ('Research & Development', 'Research & Development (R&D)'),
            ('Manufacturing', 'Manufacturing & Supply Chain'),
            ('Finance', 'Finance & Accounting'),
            ('HR', 'Human Resources'),
            ('IT/Digital', 'Information Technology (IT) / Digital'),
            ('Legal', 'Legal & Compliance')
        ) AS v(current_name, required_name)
    LOOP
        -- Update function name if it exists
        BEGIN
            UPDATE public.org_functions
            SET name = func_record.required_name::public.functional_area_type
            WHERE tenant_id = pharma_tenant_id
            AND name::text = func_record.current_name
            AND name::text != func_record.required_name;
            
            IF FOUND THEN
                renamed_count := renamed_count + 1;
                RAISE NOTICE 'Renamed: % → %', func_record.current_name, func_record.required_name;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not rename % to %: %', func_record.current_name, func_record.required_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Total functions renamed: %', renamed_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 4: ADD MISSING FUNCTIONS ===';
    
    -- Add missing functions
    FOR func_record IN
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
        WHERE NOT EXISTS (
            SELECT 1 FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = v.function_name
        )
    LOOP
        BEGIN
            INSERT INTO public.org_functions (tenant_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                func_record.function_name::public.functional_area_type,
                lower(regexp_replace(func_record.function_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_func_count := added_func_count + 1;
                RAISE NOTICE 'Added function: %', func_record.function_name;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add function %: %', func_record.function_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Total functions added: %', added_func_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 5: ADD/UPDATE DEPARTMENTS TO MATCH COMPREHENSIVE LIST ===';
    
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
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
        SELECT id INTO primary_func_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
        AND name::text = dept_record.function_name;
        
        IF primary_func_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
            AND function_id = primary_func_id
            AND name = dept_record.dept_name
        ) THEN
            INSERT INTO public.org_departments (tenant_id, function_id, name, slug, is_active)
            VALUES (
                pharma_tenant_id,
                primary_func_id,
                dept_record.dept_name,
                lower(regexp_replace(dept_record.dept_name, '[^a-zA-Z0-9]+', '-', 'g')),
                true
            )
            ON CONFLICT (tenant_id, slug) DO NOTHING;
            
            IF FOUND THEN
                added_dept_count := added_dept_count + 1;
            END IF;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Total departments added: %', added_dept_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Duplicates merged: %', merged_count;
    RAISE NOTICE '  - Functions renamed: %', renamed_count;
    RAISE NOTICE '  - Functions added: %', added_func_count;
    RAISE NOTICE '  - Departments added: %', added_dept_count;
END $$;

COMMIT;

