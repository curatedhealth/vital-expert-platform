-- =====================================================================
-- COMPARE CURRENT PHARMA ORG-STRUCTURE WITH COMPREHENSIVE LIST
-- Identifies which functions and departments from the comprehensive list
-- are missing from the current database
-- =====================================================================

-- Get Pharmaceuticals tenant ID
DO $$
DECLARE
    pharma_tenant_id uuid;
    missing_function TEXT;
    missing_dept RECORD;
    missing_count INTEGER := 0;
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
    RAISE NOTICE '=== MISSING FUNCTIONS ===';
    
    -- Check for missing functions
    FOR missing_function IN
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
        RAISE NOTICE 'Missing Function: %', missing_function;
        missing_count := missing_count + 1;
    END LOOP;
    
    IF missing_count = 0 THEN
        RAISE NOTICE 'All required functions exist!';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== MISSING DEPARTMENTS ===';
    missing_count := 0;
    
    -- Check for missing departments
    FOR missing_dept IN
        SELECT * FROM (VALUES
            ('Medical Affairs', 'Field Medical'),
            ('Medical Affairs', 'Medical Information Services'),
            ('Medical Affairs', 'Scientific Communications'),
            ('Medical Affairs', 'Medical Education'),
            ('Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)'),
            ('Medical Affairs', 'Publications'),
            ('Medical Affairs', 'Medical Leadership'),
            ('Medical Affairs', 'Clinical Operations Support'),
            ('Medical Affairs', 'Medical Excellence & Compliance'),
            ('Market Access', 'Leadership & Strategy'),
            ('Market Access', 'HEOR (Health Economics & Outcomes Research)'),
            ('Market Access', 'Value, Evidence & Outcomes'),
            ('Market Access', 'Pricing & Reimbursement'),
            ('Market Access', 'Payer Relations & Contracting'),
            ('Market Access', 'Patient Access & Services'),
            ('Market Access', 'Government & Policy Affairs'),
            ('Market Access', 'Trade & Distribution'),
            ('Market Access', 'Analytics & Insights'),
            ('Market Access', 'Operations & Excellence'),
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
            ('Commercial Organization', 'Compliance & Commercial Operations'),
            ('Regulatory Affairs', 'Regulatory Leadership & Strategy'),
            ('Regulatory Affairs', 'Regulatory Submissions & Operations'),
            ('Regulatory Affairs', 'Regulatory Intelligence & Policy'),
            ('Regulatory Affairs', 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)'),
            ('Regulatory Affairs', 'Global Regulatory Affairs (US, EU, APAC, LatAm)'),
            ('Regulatory Affairs', 'Regulatory Compliance & Systems'),
            ('Research & Development (R&D)', 'Discovery Research'),
            ('Research & Development (R&D)', 'Translational Science'),
            ('Research & Development (R&D)', 'Preclinical Development'),
            ('Research & Development (R&D)', 'Clinical Development (Phase I-IV)'),
            ('Research & Development (R&D)', 'Biometrics & Data Management'),
            ('Research & Development (R&D)', 'Clinical Operations'),
            ('Research & Development (R&D)', 'Pharmacovigilance & Drug Safety'),
            ('Research & Development (R&D)', 'Project & Portfolio Management'),
            ('Manufacturing & Supply Chain', 'Technical Operations'),
            ('Manufacturing & Supply Chain', 'Manufacturing (Small Molecule/Biotech)'),
            ('Manufacturing & Supply Chain', 'Quality Assurance / Quality Control'),
            ('Manufacturing & Supply Chain', 'Supply Chain & Logistics'),
            ('Manufacturing & Supply Chain', 'Process Engineering'),
            ('Manufacturing & Supply Chain', 'External Manufacturing Management'),
            ('Finance & Accounting', 'Financial Planning & Analysis (FP&A)'),
            ('Finance & Accounting', 'Accounting Operations (GL/AP/AR)'),
            ('Finance & Accounting', 'Treasury & Cash Management'),
            ('Finance & Accounting', 'Tax Planning & Compliance'),
            ('Finance & Accounting', 'Internal Audit & Controls'),
            ('Finance & Accounting', 'Business/Commercial Finance'),
            ('Human Resources', 'Talent Acquisition & Recruitment'),
            ('Human Resources', 'Learning & Development'),
            ('Human Resources', 'Total Rewards (Comp & Benefits)'),
            ('Human Resources', 'HR Business Partners'),
            ('Human Resources', 'Organizational Development'),
            ('Human Resources', 'HR Operations & Services'),
            ('Information Technology (IT) / Digital', 'Enterprise Applications & ERP'),
            ('Information Technology (IT) / Digital', 'Data & Analytics'),
            ('Information Technology (IT) / Digital', 'Digital Health & Platforms'),
            ('Information Technology (IT) / Digital', 'IT Infrastructure & Cloud'),
            ('Information Technology (IT) / Digital', 'Cybersecurity'),
            ('Information Technology (IT) / Digital', 'End User Services & Support'),
            ('Legal & Compliance', 'Corporate Legal'),
            ('Legal & Compliance', 'Intellectual Property (IP)'),
            ('Legal & Compliance', 'Contract Management'),
            ('Legal & Compliance', 'Regulatory & Ethics Compliance'),
            ('Legal & Compliance', 'Privacy & Data Protection'),
            ('Corporate Communications', 'External Communications & PR'),
            ('Corporate Communications', 'Internal Communications'),
            ('Corporate Communications', 'Media Relations'),
            ('Corporate Communications', 'Investor Relations'),
            ('Corporate Communications', 'Corporate Social Responsibility (CSR)'),
            ('Strategic Planning / Corporate Development', 'Corporate Strategy'),
            ('Strategic Planning / Corporate Development', 'Business / Portfolio Development'),
            ('Strategic Planning / Corporate Development', 'Mergers & Acquisitions (M&A)'),
            ('Strategic Planning / Corporate Development', 'Project Management Office (PMO)'),
            ('Strategic Planning / Corporate Development', 'Foresight & Transformation'),
            ('Business Intelligence / Analytics', 'Market Insights & Research'),
            ('Business Intelligence / Analytics', 'Data Science & Advanced Analytics'),
            ('Business Intelligence / Analytics', 'Reporting & Dashboards'),
            ('Business Intelligence / Analytics', 'Forecasting & Modeling'),
            ('Business Intelligence / Analytics', 'Competitive Intelligence'),
            ('Procurement', 'Sourcing & Purchasing'),
            ('Procurement', 'Vendor & Supplier Management'),
            ('Procurement', 'Category Management'),
            ('Procurement', 'Contracting & Negotiations'),
            ('Procurement', 'Procurement Operations'),
            ('Facilities / Workplace Services', 'Real Estate & Site Management'),
            ('Facilities / Workplace Services', 'Environmental Health & Safety (EHS)'),
            ('Facilities / Workplace Services', 'Facility Operations & Maintenance'),
            ('Facilities / Workplace Services', 'Security & Emergency Planning'),
            ('Facilities / Workplace Services', 'Sustainability Initiatives')
        ) AS v(function_name, dept_name)
        WHERE NOT EXISTS (
            SELECT 1 
            FROM public.org_functions f
            INNER JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
            WHERE f.tenant_id = pharma_tenant_id
            AND f.name::text = v.function_name
            AND d.name = v.dept_name
        )
    LOOP
        RAISE NOTICE 'Missing Department: % -> %', missing_dept.function_name, missing_dept.dept_name;
        missing_count := missing_count + 1;
    END LOOP;
    
    IF missing_count = 0 THEN
        RAISE NOTICE 'All required departments exist!';
    ELSE
        RAISE NOTICE 'Total missing departments: %', missing_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== SUMMARY ===';
    RAISE NOTICE 'Run check_and_add_pharma_functions_departments.sql to add missing items';
END $$;

