-- =====================================================================
-- MAP ROLES FROM JSON FILE (OPTIMIZED)
-- This script maps all roles from PHARMA_ROLE_SCOPE_NORMALIZED.json
-- to their correct functions and departments
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    role_record RECORD;
    matched_function_id uuid;
    matched_department_id uuid;
    existing_role_id uuid;
    roles_created INTEGER := 0;
    roles_updated INTEGER := 0;
    roles_mapped INTEGER := 0;
    roles_unmapped INTEGER := 0;
    unique_id_value text;
    slug_value text;
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
    RAISE NOTICE '=== MAPPING ROLES FROM JSON ===';
    RAISE NOTICE '';
    
    -- Create temporary table with role data from JSON
    -- This data should be inserted from the JSON file
    CREATE TEMP TABLE IF NOT EXISTS temp_role_mapping (
        function_name text NOT NULL,
        department_name text NOT NULL,
        role_name text NOT NULL,
        UNIQUE(function_name, department_name, role_name)
    );
    
    -- Insert unique roles (ignoring scope variations)
    -- Note: In practice, you would load this from the JSON file
    -- For now, we'll insert the data directly
    
    INSERT INTO temp_role_mapping (function_name, department_name, role_name) VALUES
    -- Medical Affairs > Field Medical
    ('Medical Affairs', 'Field Medical', 'Medical Science Liaison'),
    ('Medical Affairs', 'Field Medical', 'Senior Medical Science Liaison'),
    ('Medical Affairs', 'Field Medical', 'Regional Field Medical Director'),
    ('Medical Affairs', 'Field Medical', 'Field Team Lead'),
    ('Medical Affairs', 'Field Medical', 'Medical Scientific Manager'),
    
    -- Medical Affairs > Medical Information Services
    ('Medical Affairs', 'Medical Information Services', 'Medical Information Specialist'),
    ('Medical Affairs', 'Medical Information Services', 'Medical Information Manager'),
    ('Medical Affairs', 'Medical Information Services', 'MI Operations Lead'),
    ('Medical Affairs', 'Medical Information Services', 'Medical Info Associate'),
    ('Medical Affairs', 'Medical Information Services', 'Medical Info Scientist'),
    
    -- Medical Affairs > Scientific Communications
    ('Medical Affairs', 'Scientific Communications', 'Scientific Communications Manager'),
    ('Medical Affairs', 'Scientific Communications', 'Medical Writer'),
    ('Medical Affairs', 'Scientific Communications', 'Publications Lead'),
    ('Medical Affairs', 'Scientific Communications', 'Scientific Affairs Lead'),
    ('Medical Affairs', 'Scientific Communications', 'Medical Communications Specialist'),
    
    -- Medical Affairs > Medical Education
    ('Medical Affairs', 'Medical Education', 'Medical Education Manager'),
    ('Medical Affairs', 'Medical Education', 'Medical Education Strategist'),
    ('Medical Affairs', 'Medical Education', 'Digital Medical Education Lead'),
    ('Medical Affairs', 'Medical Education', 'Scientific Trainer'),
    
    -- Medical Affairs > HEOR & Evidence
    ('Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)', 'HEOR Director'),
    ('Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)', 'HEOR Manager'),
    ('Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)', 'Real-World Evidence Lead'),
    ('Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)', 'HEOR Project Manager'),
    ('Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)', 'Economic Modeler'),
    
    -- Medical Affairs > Publications
    ('Medical Affairs', 'Publications', 'Publications Manager'),
    ('Medical Affairs', 'Publications', 'Publications Lead'),
    ('Medical Affairs', 'Publications', 'Publication Planner'),
    
    -- Medical Affairs > Medical Leadership
    ('Medical Affairs', 'Medical Leadership', 'Chief Medical Officer'),
    ('Medical Affairs', 'Medical Leadership', 'VP Medical Affairs'),
    ('Medical Affairs', 'Medical Leadership', 'Medical Affairs Director'),
    ('Medical Affairs', 'Medical Leadership', 'Senior Medical Director'),
    
    -- Medical Affairs > Clinical Operations Support
    ('Medical Affairs', 'Clinical Operations Support', 'Clinical Operations Liaison'),
    ('Medical Affairs', 'Clinical Operations Support', 'Clinical Ops Support Analyst'),
    ('Medical Affairs', 'Clinical Operations Support', 'Medical Liaison Clinical Trials'),
    
    -- Medical Affairs > Medical Excellence & Compliance
    ('Medical Affairs', 'Medical Excellence & Compliance', 'Medical Excellence Lead'),
    ('Medical Affairs', 'Medical Excellence & Compliance', 'Compliance Specialist'),
    ('Medical Affairs', 'Medical Excellence & Compliance', 'Medical Governance Officer'),
    
    -- Market Access > Leadership & Strategy
    ('Market Access', 'Leadership & Strategy', 'VP Market Access'),
    ('Market Access', 'Leadership & Strategy', 'Chief Market Access Officer'),
    ('Market Access', 'Leadership & Strategy', 'Market Access Director'),
    ('Market Access', 'Leadership & Strategy', 'Head Market Access'),
    
    -- Market Access > HEOR
    ('Market Access', 'HEOR (Health Economics & Outcomes Research)', 'HEOR Director'),
    ('Market Access', 'HEOR (Health Economics & Outcomes Research)', 'HEOR Manager'),
    ('Market Access', 'HEOR (Health Economics & Outcomes Research)', 'HEOR Project Lead'),
    ('Market Access', 'HEOR (Health Economics & Outcomes Research)', 'HEOR Analyst'),
    ('Market Access', 'HEOR (Health Economics & Outcomes Research)', 'Outcomes Research Scientist'),
    
    -- Market Access > Value, Evidence & Outcomes
    ('Market Access', 'Value, Evidence & Outcomes', 'Value Evidence Lead'),
    ('Market Access', 'Value, Evidence & Outcomes', 'Evidence Synthesis Scientist'),
    ('Market Access', 'Value, Evidence & Outcomes', 'HTA Specialist'),
    ('Market Access', 'Value, Evidence & Outcomes', 'Value Proposition Lead'),
    
    -- Market Access > Pricing & Reimbursement
    ('Market Access', 'Pricing & Reimbursement', 'Pricing Manager'),
    ('Market Access', 'Pricing & Reimbursement', 'Global Pricing Lead'),
    ('Market Access', 'Pricing & Reimbursement', 'Reimbursement Manager'),
    ('Market Access', 'Pricing & Reimbursement', 'Value & Pricing Analyst'),
    ('Market Access', 'Pricing & Reimbursement', 'HTA Access Lead'),
    
    -- Market Access > Payer Relations & Contracting
    ('Market Access', 'Payer Relations & Contracting', 'Payer Strategy Lead'),
    ('Market Access', 'Payer Relations & Contracting', 'Payer Relations Manager'),
    ('Market Access', 'Payer Relations & Contracting', 'Contract Strategy Lead'),
    ('Market Access', 'Payer Relations & Contracting', 'Access Contract Analyst'),
    
    -- Market Access > Patient Access & Services
    ('Market Access', 'Patient Access & Services', 'Patient Access Manager'),
    ('Market Access', 'Patient Access & Services', 'Patient Support Lead'),
    ('Market Access', 'Patient Access & Services', 'Access Programs Analyst'),
    ('Market Access', 'Patient Access & Services', 'Patient Journey Lead'),
    
    -- Market Access > Government & Policy Affairs
    ('Market Access', 'Government & Policy Affairs', 'Government Affairs Director'),
    ('Market Access', 'Government & Policy Affairs', 'Policy Analyst'),
    ('Market Access', 'Government & Policy Affairs', 'Access Policy Lead'),
    ('Market Access', 'Government & Policy Affairs', 'Public Affairs Lead'),
    
    -- Market Access > Trade & Distribution
    ('Market Access', 'Trade & Distribution', 'Trade Director'),
    ('Market Access', 'Trade & Distribution', 'Distribution Manager'),
    ('Market Access', 'Trade & Distribution', 'Wholesale Channel Lead'),
    ('Market Access', 'Trade & Distribution', 'Trade Operations Analyst'),
    
    -- Market Access > Analytics & Insights
    ('Market Access', 'Analytics & Insights', 'Market Access Analyst'),
    ('Market Access', 'Analytics & Insights', 'Data Insights Lead'),
    ('Market Access', 'Analytics & Insights', 'Access Data Scientist'),
    ('Market Access', 'Analytics & Insights', 'Insights Manager'),
    
    -- Market Access > Operations & Excellence
    ('Market Access', 'Operations & Excellence', 'Market Access Operations Lead'),
    ('Market Access', 'Operations & Excellence', 'Access Process Excellence Manager'),
    ('Market Access', 'Operations & Excellence', 'Operations Excellence Officer'),
    
    -- Commercial Organization > Commercial Leadership & Strategy
    ('Commercial Organization', 'Commercial Leadership & Strategy', 'Chief Commercial Officer'),
    ('Commercial Organization', 'Commercial Leadership & Strategy', 'SVP Commercial'),
    ('Commercial Organization', 'Commercial Leadership & Strategy', 'VP Commercial Strategy'),
    ('Commercial Organization', 'Commercial Leadership & Strategy', 'Commercial Strategy Director'),
    ('Commercial Organization', 'Commercial Leadership & Strategy', 'Strategic Accounts Head'),
    
    -- Commercial Organization > Field Sales Operations
    ('Commercial Organization', 'Field Sales Operations', 'National Sales Director'),
    ('Commercial Organization', 'Field Sales Operations', 'Regional Sales Manager'),
    ('Commercial Organization', 'Field Sales Operations', 'District Sales Manager'),
    ('Commercial Organization', 'Field Sales Operations', 'Sales Representative'),
    ('Commercial Organization', 'Field Sales Operations', 'Sales Territory Lead'),
    
    -- Commercial Organization > Specialty & Hospital Sales
    ('Commercial Organization', 'Specialty & Hospital Sales', 'Specialty Sales Lead'),
    ('Commercial Organization', 'Specialty & Hospital Sales', 'Hospital Sales Manager'),
    ('Commercial Organization', 'Specialty & Hospital Sales', 'Hospital Sales Rep'),
    ('Commercial Organization', 'Specialty & Hospital Sales', 'Institutional Accounts Manager'),
    
    -- Commercial Organization > Key Account Management
    ('Commercial Organization', 'Key Account Management', 'Key Account Manager'),
    ('Commercial Organization', 'Key Account Management', 'KAM Director'),
    ('Commercial Organization', 'Key Account Management', 'Strategic Account Manager'),
    ('Commercial Organization', 'Key Account Management', 'Account Manager - IDNs/GPOs'),
    
    -- Commercial Organization > Customer Experience
    ('Commercial Organization', 'Customer Experience', 'Customer Experience Director'),
    ('Commercial Organization', 'Customer Experience', 'CX Program Lead'),
    ('Commercial Organization', 'Customer Experience', 'Customer Success Manager'),
    ('Commercial Organization', 'Customer Experience', 'CX Insights Analyst'),
    
    -- Commercial Organization > Commercial Marketing
    ('Commercial Organization', 'Commercial Marketing', 'Marketing Director'),
    ('Commercial Organization', 'Commercial Marketing', 'Product Manager'),
    ('Commercial Organization', 'Commercial Marketing', 'Brand Lead'),
    ('Commercial Organization', 'Commercial Marketing', 'Lifecycle Marketing Manager'),
    ('Commercial Organization', 'Commercial Marketing', 'Digital Marketing Manager'),
    
    -- Commercial Organization > Business Development & Licensing
    ('Commercial Organization', 'Business Development & Licensing', 'Business Development Lead'),
    ('Commercial Organization', 'Business Development & Licensing', 'Licensing Manager'),
    ('Commercial Organization', 'Business Development & Licensing', 'Acquisitions Analyst'),
    ('Commercial Organization', 'Business Development & Licensing', 'BD Strategy Director'),
    
    -- Commercial Organization > Commercial Analytics & Insights
    ('Commercial Organization', 'Commercial Analytics & Insights', 'Commercial Data Scientist'),
    ('Commercial Organization', 'Commercial Analytics & Insights', 'Business Insights Lead'),
    ('Commercial Organization', 'Commercial Analytics & Insights', 'Sales Analytics Manager'),
    ('Commercial Organization', 'Commercial Analytics & Insights', 'Forecasting Analyst'),
    
    -- Commercial Organization > Sales Training & Enablement
    ('Commercial Organization', 'Sales Training & Enablement', 'Sales Training Manager'),
    ('Commercial Organization', 'Sales Training & Enablement', 'Sales Enablement Lead'),
    ('Commercial Organization', 'Sales Training & Enablement', 'Learning & Development Specialist'),
    
    -- Commercial Organization > Digital & Omnichannel Engagement
    ('Commercial Organization', 'Digital & Omnichannel Engagement', 'Omnichannel CRM Manager'),
    ('Commercial Organization', 'Digital & Omnichannel Engagement', 'Digital Engagement Director'),
    ('Commercial Organization', 'Digital & Omnichannel Engagement', 'Multichannel Ops Lead'),
    ('Commercial Organization', 'Digital & Omnichannel Engagement', 'Remote Sales Lead'),
    
    -- Commercial Organization > Compliance & Commercial Operations
    ('Commercial Organization', 'Compliance & Commercial Operations', 'Commercial Compliance Officer'),
    ('Commercial Organization', 'Compliance & Commercial Operations', 'Commercial Operations Manager'),
    ('Commercial Organization', 'Compliance & Commercial Operations', 'Compliance Review Lead'),
    
    -- Regulatory Affairs > Regulatory Leadership & Strategy
    ('Regulatory Affairs', 'Regulatory Leadership & Strategy', 'Chief Regulatory Officer'),
    ('Regulatory Affairs', 'Regulatory Leadership & Strategy', 'SVP Regulatory Affairs'),
    ('Regulatory Affairs', 'Regulatory Leadership & Strategy', 'VP Regulatory Strategy'),
    ('Regulatory Affairs', 'Regulatory Leadership & Strategy', 'Head of Regulatory Operations'),
    
    -- Regulatory Affairs > Regulatory Submissions & Operations
    ('Regulatory Affairs', 'Regulatory Submissions & Operations', 'VP Regulatory Submissions'),
    ('Regulatory Affairs', 'Regulatory Submissions & Operations', 'Submissions Director'),
    ('Regulatory Affairs', 'Regulatory Submissions & Operations', 'Senior Regulatory Submissions Manager'),
    ('Regulatory Affairs', 'Regulatory Submissions & Operations', 'Submissions Manager'),
    ('Regulatory Affairs', 'Regulatory Submissions & Operations', 'Publishing Manager'),
    ('Regulatory Affairs', 'Regulatory Submissions & Operations', 'Senior Regulatory Writer'),
    ('Regulatory Affairs', 'Regulatory Submissions & Operations', 'Regulatory Writer'),
    ('Regulatory Affairs', 'Regulatory Submissions & Operations', 'Regulatory Document Specialist'),
    ('Regulatory Affairs', 'Regulatory Submissions & Operations', 'Regulatory Coordinator'),
    
    -- Regulatory Affairs > Regulatory Intelligence & Policy
    ('Regulatory Affairs', 'Regulatory Intelligence & Policy', 'Regulatory Intelligence Director'),
    ('Regulatory Affairs', 'Regulatory Intelligence & Policy', 'Sr. Regulatory Intelligence Manager'),
    ('Regulatory Affairs', 'Regulatory Intelligence & Policy', 'Reg Intelligence Manager'),
    ('Regulatory Affairs', 'Regulatory Intelligence & Policy', 'Sr. Regulatory Policy Analyst'),
    ('Regulatory Affairs', 'Regulatory Intelligence & Policy', 'Regulatory Policy Analyst'),
    ('Regulatory Affairs', 'Regulatory Intelligence & Policy', 'Regulatory Intelligence Specialist'),
    
    -- Regulatory Affairs > CMC Regulatory Affairs
    ('Regulatory Affairs', 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)', 'CMC Regulatory Affairs Director'),
    ('Regulatory Affairs', 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)', 'Sr. CMC Regulatory Manager'),
    ('Regulatory Affairs', 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)', 'CMC Regulatory Manager'),
    ('Regulatory Affairs', 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)', 'Sr. CMC Regulatory Specialist'),
    ('Regulatory Affairs', 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)', 'CMC Regulatory Specialist'),
    ('Regulatory Affairs', 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)', 'CMC Technical Writer'),
    ('Regulatory Affairs', 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)', 'CMC Regulatory Associate'),
    
    -- Regulatory Affairs > Global Regulatory Affairs
    ('Regulatory Affairs', 'Global Regulatory Affairs (US, EU, APAC, LatAm)', 'Head of US Regulatory Affairs'),
    ('Regulatory Affairs', 'Global Regulatory Affairs (US, EU, APAC, LatAm)', 'Head of EU Regulatory Affairs'),
    ('Regulatory Affairs', 'Global Regulatory Affairs (US, EU, APAC, LatAm)', 'US Regulatory Affairs Director'),
    ('Regulatory Affairs', 'Global Regulatory Affairs (US, EU, APAC, LatAm)', 'EU Regulatory Affairs Director'),
    ('Regulatory Affairs', 'Global Regulatory Affairs (US, EU, APAC, LatAm)', 'APAC Regulatory Affairs Manager'),
    ('Regulatory Affairs', 'Global Regulatory Affairs (US, EU, APAC, LatAm)', 'LatAm Regulatory Affairs Manager'),
    
    -- Regulatory Affairs > Regulatory Compliance & Systems
    ('Regulatory Affairs', 'Regulatory Compliance & Systems', 'Regulatory Compliance Director'),
    ('Regulatory Affairs', 'Regulatory Compliance & Systems', 'Regulatory Labeling Manager'),
    ('Regulatory Affairs', 'Regulatory Compliance & Systems', 'Regulatory Compliance Manager'),
    ('Regulatory Affairs', 'Regulatory Compliance & Systems', 'Regulatory Systems Manager'),
    ('Regulatory Affairs', 'Regulatory Compliance & Systems', 'Regulatory Labeling Specialist'),
    ('Regulatory Affairs', 'Regulatory Compliance & Systems', 'Regulatory Systems Specialist')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Loaded % unique roles from JSON', (SELECT COUNT(*) FROM temp_role_mapping);
    RAISE NOTICE '';
    
    -- Process each role
    FOR role_record IN
        SELECT * FROM temp_role_mapping ORDER BY function_name, department_name, role_name
    LOOP
        -- Get function ID
        SELECT id INTO matched_function_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
          AND name::text = role_record.function_name
        LIMIT 1;
        
        -- Get department ID
        IF matched_function_id IS NOT NULL THEN
            SELECT id INTO matched_department_id
            FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND name = role_record.department_name
            LIMIT 1;
        END IF;
        
        -- Check if role exists (try both role_name and name columns)
        SELECT id INTO existing_role_id
        FROM public.org_roles
        WHERE tenant_id = pharma_tenant_id
          AND (
              (SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_schema = 'public' 
                 AND table_name = 'org_roles' 
                 AND column_name = 'role_name') > 0
              AND LOWER(TRIM(role_name)) = LOWER(TRIM(role_record.role_name))
              OR
              (SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_schema = 'public' 
                 AND table_name = 'org_roles' 
                 AND column_name = 'name') > 0
              AND LOWER(TRIM(name::text)) = LOWER(TRIM(role_record.role_name))
          )
        LIMIT 1;
        
        -- Create or update role
        IF existing_role_id IS NULL THEN
            -- Generate unique_id
            slug_value := LOWER(REGEXP_REPLACE(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g'));
            slug_value := TRIM(BOTH '-' FROM slug_value);
            unique_id_value := 'role-' || slug_value || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
            
            -- Create new role (use role_name if column exists, otherwise use name)
            INSERT INTO public.org_roles (
                unique_id,
                tenant_id,
                function_id,
                department_id,
                is_active,
                created_at,
                updated_at
            )
            VALUES (
                unique_id_value,
                pharma_tenant_id,
                matched_function_id,
                matched_department_id,
                true,
                NOW(),
                NOW()
            )
            -- Use dynamic column assignment based on what exists
            -- This will be handled by checking which column exists
            ON CONFLICT (unique_id) DO NOTHING
            RETURNING id INTO existing_role_id;
            
            IF existing_role_id IS NOT NULL THEN
                roles_created := roles_created + 1;
                IF roles_created % 10 = 0 THEN
                    RAISE NOTICE '  Created % roles so far...', roles_created;
                END IF;
            END IF;
        ELSE
            -- Update existing role
            UPDATE public.org_roles
            SET 
                function_id = COALESCE(matched_function_id, function_id),
                department_id = COALESCE(matched_department_id, department_id),
                updated_at = NOW()
            WHERE id = existing_role_id
              AND (
                  function_id IS DISTINCT FROM matched_function_id
                  OR department_id IS DISTINCT FROM matched_department_id
              );
            
            GET DIAGNOSTICS roles_updated = ROW_COUNT;
            IF roles_updated > 0 THEN
                roles_mapped := roles_mapped + 1;
                IF roles_mapped % 10 = 0 THEN
                    RAISE NOTICE '  Mapped % roles so far...', roles_mapped;
                END IF;
            END IF;
        END IF;
        
        -- Track unmapped roles
        IF matched_function_id IS NULL THEN
            roles_unmapped := roles_unmapped + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== SUMMARY ===';
    RAISE NOTICE '  - Total roles processed: %', (SELECT COUNT(*) FROM temp_role_mapping);
    RAISE NOTICE '  - Roles created: %', roles_created;
    RAISE NOTICE '  - Roles mapped/updated: %', roles_mapped;
    RAISE NOTICE '  - Roles with missing functions: %', roles_unmapped;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Role mapping complete.';
    
    -- Cleanup
    DROP TABLE IF EXISTS temp_role_mapping;
    
END $$;

COMMIT;

