-- =====================================================================
-- MAP PHARMA ROLES TO FUNCTIONS AND DEPARTMENTS
-- Intelligently maps all existing roles to the new org structure
-- Uses keyword matching and role name analysis
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    role_record RECORD;
    matched_function_id uuid;
    matched_department_id uuid;
    roles_updated INTEGER := 0;
    roles_with_function INTEGER := 0;
    roles_with_department INTEGER := 0;
    roles_unmapped INTEGER := 0;
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
    RAISE NOTICE '=== MAPPING ROLES TO FUNCTIONS AND DEPARTMENTS ===';
    RAISE NOTICE '';
    
    -- Loop through all roles and map them
    FOR role_record IN
        SELECT 
            r.id,
            r.name as role_name,
            r.slug as role_slug,
            r.description,
            r.function_id,
            r.department_id
        FROM public.org_roles r
        WHERE r.tenant_id = pharma_tenant_id
        ORDER BY r.name
    LOOP
        matched_function_id := NULL;
        matched_department_id := NULL;
        
        -- =====================================================================
        -- FUNCTION MAPPING - Based on role name keywords
        -- =====================================================================
        
        -- Medical Affairs
        IF role_record.role_name ILIKE '%medical%' 
           OR role_record.role_name ILIKE '%msl%'
           OR role_record.role_name ILIKE '%medical science%'
           OR role_record.role_name ILIKE '%medical information%'
           OR role_record.role_name ILIKE '%scientific communication%'
           OR role_record.role_name ILIKE '%medical education%'
           OR role_record.role_name ILIKE '%heor%'
           OR role_record.role_name ILIKE '%publication%'
           OR role_record.role_name ILIKE '%clinical operation%'
           OR role_record.description ILIKE '%medical affair%'
        THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Medical Affairs'
            LIMIT 1;
        END IF;
        
        -- Market Access
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%market access%'
           OR role_record.role_name ILIKE '%payer%'
           OR role_record.role_name ILIKE '%reimbursement%'
           OR role_record.role_name ILIKE '%pricing%'
           OR role_record.role_name ILIKE '%value evidence%'
           OR role_record.role_name ILIKE '%trade%'
           OR role_record.role_name ILIKE '%distribution%'
           OR role_record.description ILIKE '%market access%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Market Access'
            LIMIT 1;
        END IF;
        
        -- Commercial Organization
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%commercial%'
           OR role_record.role_name ILIKE '%sales%'
           OR role_record.role_name ILIKE '%key account%'
           OR role_record.role_name ILIKE '%customer experience%'
           OR role_record.role_name ILIKE '%marketing%'
           OR role_record.role_name ILIKE '%business development%'
           OR role_record.role_name ILIKE '%licensing%'
           OR role_record.role_name ILIKE '%sales training%'
           OR role_record.role_name ILIKE '%omnichannel%'
           OR role_record.description ILIKE '%commercial%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Commercial Organization'
            LIMIT 1;
        END IF;
        
        -- Regulatory Affairs
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%regulatory%'
           OR role_record.role_name ILIKE '%submission%'
           OR role_record.role_name ILIKE '%cmc%'
           OR role_record.role_name ILIKE '%regulatory intelligence%'
           OR role_record.role_name ILIKE '%regulatory compliance%'
           OR role_record.description ILIKE '%regulatory%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Regulatory Affairs'
            LIMIT 1;
        END IF;
        
        -- Research & Development (R&D)
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%research%'
           OR role_record.role_name ILIKE '%development%'
           OR role_record.role_name ILIKE '%r&d%'
           OR role_record.role_name ILIKE '%discovery%'
           OR role_record.role_name ILIKE '%translational%'
           OR role_record.role_name ILIKE '%preclinical%'
           OR role_record.role_name ILIKE '%clinical development%'
           OR role_record.role_name ILIKE '%biometric%'
           OR role_record.role_name ILIKE '%pharmacovigilance%'
           OR role_record.role_name ILIKE '%drug safety%'
           OR role_record.role_name ILIKE '%portfolio%'
           OR role_record.description ILIKE '%research%'
           OR role_record.description ILIKE '%development%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Research & Development (R&D)'
            LIMIT 1;
        END IF;
        
        -- Manufacturing & Supply Chain
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%manufacturing%'
           OR role_record.role_name ILIKE '%supply chain%'
           OR role_record.role_name ILIKE '%technical operation%'
           OR role_record.role_name ILIKE '%process engineering%'
           OR role_record.role_name ILIKE '%external manufacturing%'
           OR role_record.description ILIKE '%manufacturing%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Manufacturing & Supply Chain'
            LIMIT 1;
        END IF;
        
        -- Finance & Accounting
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%finance%'
           OR role_record.role_name ILIKE '%accounting%'
           OR role_record.role_name ILIKE '%fp&a%'
           OR role_record.role_name ILIKE '%treasury%'
           OR role_record.role_name ILIKE '%tax%'
           OR role_record.role_name ILIKE '%audit%'
           OR role_record.description ILIKE '%finance%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Finance & Accounting'
            LIMIT 1;
        END IF;
        
        -- Human Resources
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%human resource%'
           OR role_record.role_name ILIKE '%hr%'
           OR role_record.role_name ILIKE '%talent%'
           OR role_record.role_name ILIKE '%recruitment%'
           OR role_record.role_name ILIKE '%learning%'
           OR role_record.role_name ILIKE '%development%'
           OR role_record.role_name ILIKE '%compensation%'
           OR role_record.role_name ILIKE '%benefit%'
           OR role_record.role_name ILIKE '%organizational development%'
           OR role_record.description ILIKE '%human resource%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Human Resources'
            LIMIT 1;
        END IF;
        
        -- Information Technology (IT) / Digital
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%it%'
           OR role_record.role_name ILIKE '%information technology%'
           OR role_record.role_name ILIKE '%digital%'
           OR role_record.role_name ILIKE '%enterprise%'
           OR role_record.role_name ILIKE '%erp%'
           OR role_record.role_name ILIKE '%data%'
           OR role_record.role_name ILIKE '%analytics%'
           OR role_record.role_name ILIKE '%cybersecurity%'
           OR role_record.role_name ILIKE '%infrastructure%'
           OR role_record.description ILIKE '%information technology%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Information Technology (IT) / Digital'
            LIMIT 1;
        END IF;
        
        -- Legal & Compliance
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%legal%'
           OR role_record.role_name ILIKE '%compliance%'
           OR role_record.role_name ILIKE '%ip%'
           OR role_record.role_name ILIKE '%intellectual property%'
           OR role_record.role_name ILIKE '%contract%'
           OR role_record.role_name ILIKE '%privacy%'
           OR role_record.role_name ILIKE '%data protection%'
           OR role_record.description ILIKE '%legal%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Legal & Compliance'
            LIMIT 1;
        END IF;
        
        -- Corporate Communications
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%communication%'
           OR role_record.role_name ILIKE '%pr%'
           OR role_record.role_name ILIKE '%public relation%'
           OR role_record.role_name ILIKE '%media%'
           OR role_record.role_name ILIKE '%investor%'
           OR role_record.role_name ILIKE '%csr%'
           OR role_record.role_name ILIKE '%corporate social%'
           OR role_record.description ILIKE '%communication%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Corporate Communications'
            LIMIT 1;
        END IF;
        
        -- Strategic Planning / Corporate Development
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%strategic%'
           OR role_record.role_name ILIKE '%corporate development%'
           OR role_record.role_name ILIKE '%m&a%'
           OR role_record.role_name ILIKE '%merger%'
           OR role_record.role_name ILIKE '%acquisition%'
           OR role_record.role_name ILIKE '%pmo%'
           OR role_record.role_name ILIKE '%project management%'
           OR role_record.role_name ILIKE '%transformation%'
           OR role_record.description ILIKE '%strategic%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Strategic Planning / Corporate Development'
            LIMIT 1;
        END IF;
        
        -- Business Intelligence / Analytics
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%business intelligence%'
           OR role_record.role_name ILIKE '%market insight%'
           OR role_record.role_name ILIKE '%data science%'
           OR role_record.role_name ILIKE '%forecasting%'
           OR role_record.role_name ILIKE '%modeling%'
           OR role_record.role_name ILIKE '%competitive intelligence%'
           OR role_record.description ILIKE '%business intelligence%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Business Intelligence / Analytics'
            LIMIT 1;
        END IF;
        
        -- Procurement
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%procurement%'
           OR role_record.role_name ILIKE '%sourcing%'
           OR role_record.role_name ILIKE '%purchasing%'
           OR role_record.role_name ILIKE '%vendor%'
           OR role_record.role_name ILIKE '%supplier%'
           OR role_record.role_name ILIKE '%category management%'
           OR role_record.description ILIKE '%procurement%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Procurement'
            LIMIT 1;
        END IF;
        
        -- Facilities / Workplace Services
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%facility%'
           OR role_record.role_name ILIKE '%workplace%'
           OR role_record.role_name ILIKE '%real estate%'
           OR role_record.role_name ILIKE '%ehs%'
           OR role_record.role_name ILIKE '%environmental health%'
           OR role_record.role_name ILIKE '%safety%'
           OR role_record.role_name ILIKE '%security%'
           OR role_record.role_name ILIKE '%sustainability%'
           OR role_record.description ILIKE '%facility%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Facilities / Workplace Services'
            LIMIT 1;
        END IF;
        
        -- =====================================================================
        -- DEPARTMENT MAPPING - Based on role name keywords
        -- =====================================================================
        
        IF matched_function_id IS NOT NULL THEN
            -- Try to match to specific departments within the function
            
            -- Medical Affairs departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Medical Affairs' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%field medical%' OR role_record.role_name ILIKE '%msl%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Field Medical%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%medical information%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Medical Information%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%scientific communication%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Scientific Communication%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%medical education%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Medical Education%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%heor%' OR role_record.role_name ILIKE '%evidence%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%HEOR%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%publication%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Publication%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%medical leadership%' OR role_record.role_name ILIKE '%chief medical%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Medical Leadership%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%clinical operation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Clinical Operations Support%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%excellence%' OR role_record.role_name ILIKE '%compliance%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Medical Excellence%' LIMIT 1;
                END IF;
            END IF;
            
            -- Market Access departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Market Access' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%leadership%' OR role_record.role_name ILIKE '%strategy%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Leadership%Strategy%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%heor%' OR role_record.role_name ILIKE '%outcomes research%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%HEOR%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%value%' OR role_record.role_name ILIKE '%evidence%' OR role_record.role_name ILIKE '%outcome%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Value%Evidence%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%pricing%' OR role_record.role_name ILIKE '%reimbursement%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Pricing%Reimbursement%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%payer%' OR role_record.role_name ILIKE '%contracting%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Payer%Contracting%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%patient access%' OR role_record.role_name ILIKE '%patient service%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Patient Access%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%government%' OR role_record.role_name ILIKE '%policy%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Government%Policy%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%trade%' OR role_record.role_name ILIKE '%distribution%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Trade%Distribution%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%analytics%' OR role_record.role_name ILIKE '%insight%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Analytics%Insights%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%operation%' OR role_record.role_name ILIKE '%excellence%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Operations%Excellence%' LIMIT 1;
                END IF;
            END IF;
            
            -- Commercial Organization departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Commercial Organization' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%leadership%' OR role_record.role_name ILIKE '%strategy%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Commercial Leadership%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%sales%' AND role_record.role_name ILIKE '%field%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Field Sales%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%specialty%' OR role_record.role_name ILIKE '%hospital%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Specialty%Hospital%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%key account%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Key Account%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%customer experience%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Customer Experience%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%marketing%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Commercial Marketing%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%business development%' OR role_record.role_name ILIKE '%licensing%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Business Development%Licensing%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%analytics%' OR role_record.role_name ILIKE '%insight%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Commercial Analytics%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%training%' OR role_record.role_name ILIKE '%enablement%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Sales Training%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%digital%' OR role_record.role_name ILIKE '%omnichannel%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Digital%Omnichannel%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%compliance%' OR role_record.role_name ILIKE '%commercial operation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Compliance%Commercial Operations%' LIMIT 1;
                END IF;
            END IF;
            
            -- Regulatory Affairs departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Regulatory Affairs' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%leadership%' OR role_record.role_name ILIKE '%strategy%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Regulatory Leadership%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%submission%' OR role_record.role_name ILIKE '%operation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Regulatory Submissions%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%intelligence%' OR role_record.role_name ILIKE '%policy%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Regulatory Intelligence%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%cmc%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%CMC%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%global%' OR role_record.role_name ILIKE '%us%' OR role_record.role_name ILIKE '%eu%' OR role_record.role_name ILIKE '%apac%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Global Regulatory%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%compliance%' OR role_record.role_name ILIKE '%system%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Regulatory Compliance%' LIMIT 1;
                END IF;
            END IF;
            
            -- Research & Development departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Research & Development (R&D)' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%discovery%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Discovery Research%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%translational%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Translational Science%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%preclinical%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Preclinical Development%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%clinical development%' OR role_record.role_name ILIKE '%phase%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Clinical Development%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%biometric%' OR role_record.role_name ILIKE '%data management%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Biometrics%Data Management%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%clinical operation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Clinical Operations%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%pharmacovigilance%' OR role_record.role_name ILIKE '%drug safety%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Pharmacovigilance%Drug Safety%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%portfolio%' OR role_record.role_name ILIKE '%project%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Project%Portfolio%' LIMIT 1;
                END IF;
            END IF;
            
            -- Manufacturing & Supply Chain departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Manufacturing & Supply Chain' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%technical operation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Technical Operations%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%manufacturing%' AND (role_record.role_name ILIKE '%small molecule%' OR role_record.role_name ILIKE '%biotech%') THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Manufacturing%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%quality assurance%' OR role_record.role_name ILIKE '%quality control%' OR role_record.role_name ILIKE '%qa%' OR role_record.role_name ILIKE '%qc%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Quality Assurance%Quality Control%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%supply chain%' OR role_record.role_name ILIKE '%logistics%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Supply Chain%Logistics%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%process engineering%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Process Engineering%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%external manufacturing%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%External Manufacturing%' LIMIT 1;
                END IF;
            END IF;
            
            -- Finance & Accounting departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Finance & Accounting' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%fp&a%' OR role_record.role_name ILIKE '%financial planning%' OR role_record.role_name ILIKE '%analysis%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Financial Planning%Analysis%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%accounting%' OR role_record.role_name ILIKE '%gl%' OR role_record.role_name ILIKE '%ap%' OR role_record.role_name ILIKE '%ar%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Accounting Operations%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%treasury%' OR role_record.role_name ILIKE '%cash%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Treasury%Cash%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%tax%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Tax%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%audit%' OR role_record.role_name ILIKE '%control%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Internal Audit%Controls%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%business finance%' OR role_record.role_name ILIKE '%commercial finance%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Business%Commercial Finance%' LIMIT 1;
                END IF;
            END IF;
            
            -- Human Resources departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Human Resources' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%talent%' OR role_record.role_name ILIKE '%recruitment%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Talent Acquisition%Recruitment%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%learning%' OR role_record.role_name ILIKE '%development%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Learning%Development%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%compensation%' OR role_record.role_name ILIKE '%benefit%' OR role_record.role_name ILIKE '%reward%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Total Rewards%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%business partner%' OR role_record.role_name ILIKE '%hrbp%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%HR Business Partners%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%organizational development%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Organizational Development%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%hr operation%' OR role_record.role_name ILIKE '%service%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%HR Operations%Services%' LIMIT 1;
                END IF;
            END IF;
            
            -- Information Technology (IT) / Digital departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Information Technology (IT) / Digital' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%enterprise%' OR role_record.role_name ILIKE '%erp%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Enterprise Applications%ERP%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%data%' AND role_record.role_name ILIKE '%analytics%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Data%Analytics%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%digital health%' OR role_record.role_name ILIKE '%platform%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Digital Health%Platforms%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%infrastructure%' OR role_record.role_name ILIKE '%cloud%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%IT Infrastructure%Cloud%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%cybersecurity%' OR role_record.role_name ILIKE '%security%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Cybersecurity%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%end user%' OR role_record.role_name ILIKE '%support%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%End User Services%Support%' LIMIT 1;
                END IF;
            END IF;
            
            -- Legal & Compliance departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Legal & Compliance' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%corporate legal%' OR role_record.role_name ILIKE '%legal%' AND NOT role_record.role_name ILIKE '%ip%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Corporate Legal%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%ip%' OR role_record.role_name ILIKE '%intellectual property%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Intellectual Property%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%contract%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Contract Management%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%regulatory%' AND role_record.role_name ILIKE '%compliance%' OR role_record.role_name ILIKE '%ethics%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Regulatory%Ethics Compliance%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%privacy%' OR role_record.role_name ILIKE '%data protection%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Privacy%Data Protection%' LIMIT 1;
                END IF;
            END IF;
            
            -- Corporate Communications departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Corporate Communications' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%external%' OR role_record.role_name ILIKE '%pr%' OR role_record.role_name ILIKE '%public relation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%External Communications%PR%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%internal%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Internal Communications%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%media%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Media Relations%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%investor%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Investor Relations%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%csr%' OR role_record.role_name ILIKE '%corporate social%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Corporate Social Responsibility%' LIMIT 1;
                END IF;
            END IF;
            
            -- Strategic Planning / Corporate Development departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Strategic Planning / Corporate Development' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%corporate strategy%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Corporate Strategy%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%business development%' OR role_record.role_name ILIKE '%portfolio%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Business%Portfolio Development%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%m&a%' OR role_record.role_name ILIKE '%merger%' OR role_record.role_name ILIKE '%acquisition%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Mergers%Acquisitions%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%pmo%' OR role_record.role_name ILIKE '%project management%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Project Management Office%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%foresight%' OR role_record.role_name ILIKE '%transformation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Foresight%Transformation%' LIMIT 1;
                END IF;
            END IF;
            
            -- Business Intelligence / Analytics departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Business Intelligence / Analytics' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%market insight%' OR role_record.role_name ILIKE '%research%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Market Insights%Research%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%data science%' OR role_record.role_name ILIKE '%advanced analytics%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Data Science%Advanced Analytics%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%reporting%' OR role_record.role_name ILIKE '%dashboard%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Reporting%Dashboards%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%forecasting%' OR role_record.role_name ILIKE '%modeling%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Forecasting%Modeling%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%competitive intelligence%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Competitive Intelligence%' LIMIT 1;
                END IF;
            END IF;
            
            -- Procurement departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Procurement' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%sourcing%' OR role_record.role_name ILIKE '%purchasing%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Sourcing%Purchasing%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%vendor%' OR role_record.role_name ILIKE '%supplier%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Vendor%Supplier Management%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%category management%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Category Management%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%contracting%' OR role_record.role_name ILIKE '%negotiation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Contracting%Negotiations%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%procurement operation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Procurement Operations%' LIMIT 1;
                END IF;
            END IF;
            
            -- Facilities / Workplace Services departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Facilities / Workplace Services' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%real estate%' OR role_record.role_name ILIKE '%site management%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Real Estate%Site Management%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%ehs%' OR role_record.role_name ILIKE '%environmental health%' OR role_record.role_name ILIKE '%safety%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Environmental Health%Safety%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%facility operation%' OR role_record.role_name ILIKE '%maintenance%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Facility Operations%Maintenance%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%security%' OR role_record.role_name ILIKE '%emergency%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Security%Emergency Planning%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%sustainability%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Sustainability Initiatives%' LIMIT 1;
                END IF;
            END IF;
        END IF;
        
        -- =====================================================================
        -- UPDATE ROLE WITH MAPPINGS
        -- =====================================================================
        
        IF matched_function_id IS NOT NULL OR matched_department_id IS NOT NULL THEN
            UPDATE public.org_roles
            SET 
                function_id = COALESCE(matched_function_id, function_id),
                department_id = COALESCE(matched_department_id, department_id),
                updated_at = now()
            WHERE id = role_record.id;
            
            roles_updated := roles_updated + 1;
            
            IF matched_function_id IS NOT NULL THEN
                roles_with_function := roles_with_function + 1;
            END IF;
            
            IF matched_department_id IS NOT NULL THEN
                roles_with_department := roles_with_department + 1;
            END IF;
        ELSE
            roles_unmapped := roles_unmapped + 1;
            RAISE NOTICE '⚠️  Could not map role: %', role_record.role_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== MAPPING COMPLETE ===';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Total roles processed: %', roles_updated + roles_unmapped;
    RAISE NOTICE '  - Roles with function assigned: %', roles_with_function;
    RAISE NOTICE '  - Roles with department assigned: %', roles_with_department;
    RAISE NOTICE '  - Roles updated: %', roles_updated;
    RAISE NOTICE '  - Roles unmapped: %', roles_unmapped;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Role mapping complete';
END $$;

COMMIT;

