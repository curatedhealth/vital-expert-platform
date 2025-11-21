-- =====================================================================
-- MAP ALL UNMAPPED ROLES TO FUNCTIONS AND DEPARTMENTS
-- This script maps all roles that currently have NULL function_id or department_id
-- Uses intelligent keyword matching based on role names and descriptions
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    digital_health_tenant_id uuid;
    role_record RECORD;
    matched_function_id uuid;
    matched_department_id uuid;
    roles_updated INTEGER := 0;
    roles_with_function INTEGER := 0;
    roles_with_department INTEGER := 0;
    roles_unmapped INTEGER := 0;
    tenant_id_to_use uuid;
    has_role_name_col boolean;
    has_name_col boolean;
    role_name_value text;
BEGIN
    -- Get tenant IDs
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    SELECT id INTO digital_health_tenant_id
    FROM public.tenants
    WHERE slug = 'digital-health' OR slug = 'digital-health-startup' OR name ILIKE '%digital health%'
    LIMIT 1;
    
    IF pharma_tenant_id IS NULL AND digital_health_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Neither Pharmaceuticals nor Digital Health tenant found';
    END IF;
    
    -- Check which column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'org_roles'
          AND column_name = 'role_name'
    ) INTO has_role_name_col;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'org_roles'
          AND column_name = 'name'
    ) INTO has_name_col;
    
    RAISE NOTICE 'Pharmaceuticals Tenant ID: %', pharma_tenant_id;
    RAISE NOTICE 'Digital Health Tenant ID: %', digital_health_tenant_id;
    RAISE NOTICE 'Has role_name column: %, Has name column: %', has_role_name_col, has_name_col;
    RAISE NOTICE '';
    RAISE NOTICE '=== MAPPING ALL UNMAPPED ROLES ===';
    RAISE NOTICE '';
    
    -- Loop through all unmapped roles
    -- Try to get role name from whichever column exists
    FOR role_record IN
        SELECT 
            r.id,
            r.slug,
            r.description,
            r.tenant_id,
            r.function_id,
            r.department_id
        FROM public.org_roles r
        WHERE (r.function_id IS NULL OR r.department_id IS NULL)
          AND r.is_active = true
        ORDER BY r.id
    LOOP
        matched_function_id := NULL;
        matched_department_id := NULL;
        tenant_id_to_use := role_record.tenant_id;
        
        -- Get role name from the correct column
        IF has_role_name_col THEN
            SELECT role_name INTO role_name_value FROM public.org_roles WHERE id = role_record.id;
        ELSIF has_name_col THEN
            SELECT name::text INTO role_name_value FROM public.org_roles WHERE id = role_record.id;
        ELSE
            RAISE EXCEPTION 'Neither role_name nor name column found in org_roles table';
        END IF;
        
        -- Skip if we couldn't get the role name
        IF role_name_value IS NULL THEN
            CONTINUE;
        END IF;
        
        -- Determine which tenant we're working with
        IF tenant_id_to_use = pharma_tenant_id THEN
            -- =====================================================================
            -- PHARMACEUTICALS TENANT MAPPING
            -- =====================================================================
            
            -- Medical Affairs
            IF role_name_value ILIKE '%medical%' 
               OR role_name_value ILIKE '%msl%'
               OR role_name_value ILIKE '%medical science%'
               OR role_name_value ILIKE '%medical information%'
               OR role_name_value ILIKE '%scientific communication%'
               OR role_name_value ILIKE '%medical education%'
               OR role_name_value ILIKE '%heor%'
               OR role_name_value ILIKE '%publication%'
               OR role_name_value ILIKE '%clinical operation%'
               OR role_name_value ILIKE '%medical excellence%'
               OR role_name_value ILIKE '%medical compliance%'
               OR role_name_value ILIKE '%medical writer%'
               OR role_name_value ILIKE '%medical director%'
               OR role_name_value ILIKE '%medical monitor%'
               OR role_name_value ILIKE '%medical librarian%'
               OR role_name_value ILIKE '%medical quality%'
               OR role_name_value ILIKE '%medical operations%'
               OR role_name_value ILIKE '%medical training%'
               OR role_name_value ILIKE '%medical review%'
               OR role_name_value ILIKE '%medical content%'
               OR role_name_value ILIKE '%medical business partner%'
               OR role_name_value ILIKE '%medical strategist%'
               OR role_name_value ILIKE '%medical affairs%'
               OR role_name_value ILIKE '%cmo%'
               OR role_name_value ILIKE '%chief medical%'
               OR role_name_value ILIKE '%vp medical%'
               OR role_name_value ILIKE '%epidemiologist%'
               OR role_name_value ILIKE '%rwe%'
               OR role_name_value ILIKE '%real-world evidence%'
               OR role_name_value ILIKE '%safety physician%'
               OR role_name_value ILIKE '%study site medical%'
               OR role_name_value ILIKE '%ta msl%'
               OR role_name_value ILIKE '%therapeutic area medical%'
               OR role_name_value ILIKE '%congress%'
               OR COALESCE(role_record.description, '') ILIKE '%medical affair%'
            THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = pharma_tenant_id 
                  AND name::text = 'Medical Affairs'
                LIMIT 1;
                
                -- Map to specific departments within Medical Affairs
                IF matched_function_id IS NOT NULL THEN
                    IF role_name_value ILIKE '%field medical%' 
                       OR role_name_value ILIKE '%msl%'
                       OR role_name_value ILIKE '%medical science liaison%'
                       OR role_name_value ILIKE '%ta msl%'
                       OR role_name_value ILIKE '%field trainer%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Field Medical' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%medical information%' 
                          OR role_name_value ILIKE '%medical info%'
                          OR role_name_value ILIKE '%mi operations%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Medical Information Services' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%scientific communication%' 
                          OR role_name_value ILIKE '%publication%'
                          OR role_name_value ILIKE '%medical writer%'
                          OR role_name_value ILIKE '%publication coordinator%'
                          OR role_name_value ILIKE '%publication strategy%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Scientific Communications' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%medical education%' 
                          OR role_name_value ILIKE '%medical training%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Medical Education' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%heor%' 
                          OR role_name_value ILIKE '%health economics%'
                          OR role_name_value ILIKE '%outcomes research%'
                          OR role_name_value ILIKE '%evidence%'
                          OR role_name_value ILIKE '%rwe%'
                          OR role_name_value ILIKE '%real-world evidence%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'HEOR & Evidence (Health Economics & Outcomes Research)' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%clinical operations support%' 
                          OR role_name_value ILIKE '%clinical ops support%'
                          OR role_name_value ILIKE '%medical liaison clinical%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Clinical Operations Support' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%medical leadership%' 
                          OR role_name_value ILIKE '%cmo%'
                          OR role_name_value ILIKE '%chief medical%'
                          OR role_name_value ILIKE '%vp medical%'
                          OR role_name_value ILIKE '%medical affairs director%'
                          OR role_name_value ILIKE '%senior medical director%'
                          OR role_name_value ILIKE '%regional medical director%'
                          OR role_name_value ILIKE '%therapeutic area medical director%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Medical Leadership' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%medical excellence%' 
                          OR role_name_value ILIKE '%medical compliance%'
                          OR role_name_value ILIKE '%medical quality%'
                          OR role_name_value ILIKE '%medical governance%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Medical Excellence & Compliance' 
                        LIMIT 1;
                    END IF;
                END IF;
            END IF;
            
            -- Market Access
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%market access%'
               OR role_name_value ILIKE '%payer%'
               OR role_name_value ILIKE '%reimbursement%'
               OR role_name_value ILIKE '%pricing%'
               OR role_name_value ILIKE '%value evidence%'
               OR role_name_value ILIKE '%trade%'
               OR role_name_value ILIKE '%distribution%'
               OR role_name_value ILIKE '%government affair%'
               OR role_name_value ILIKE '%policy%'
               OR role_name_value ILIKE '%patient access%'
               OR role_name_value ILIKE '%patient service%'
               OR role_name_value ILIKE '%hub service%'
               OR role_name_value ILIKE '%gpo%'
               OR role_name_value ILIKE '%idn%'
               OR role_record.description ILIKE '%market access%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = pharma_tenant_id 
                  AND name::text = 'Market Access'
                LIMIT 1;
                
                -- Map to specific departments within Market Access
                IF matched_function_id IS NOT NULL THEN
                    IF role_name_value ILIKE '%leadership%' 
                       OR role_name_value ILIKE '%strategy%'
                       OR role_name_value ILIKE '%vp market access%'
                       OR role_name_value ILIKE '%chief market access%'
                       OR role_name_value ILIKE '%head market access%'
                       OR role_name_value ILIKE '%senior director market access%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Leadership & Strategy' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%heor%' 
                          OR role_name_value ILIKE '%health economics%'
                          OR role_name_value ILIKE '%outcomes research%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'HEOR (Health Economics & Outcomes Research)' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%value%' 
                          OR role_name_value ILIKE '%evidence%'
                          OR role_name_value ILIKE '%outcomes%'
                          OR role_name_value ILIKE '%rwe%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Value, Evidence & Outcomes' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%pricing%' 
                          OR role_name_value ILIKE '%reimbursement%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Pricing & Reimbursement' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%payer%' 
                          OR role_name_value ILIKE '%contract%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Payer Relations & Contracting' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%patient access%' 
                          OR role_name_value ILIKE '%patient service%'
                          OR role_name_value ILIKE '%hub service%'
                          OR role_name_value ILIKE '%patient journey%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Patient Access & Services' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%government%' 
                          OR role_name_value ILIKE '%policy%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Government & Policy Affairs' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%trade%' 
                          OR role_name_value ILIKE '%distribution%'
                          OR role_name_value ILIKE '%gpo%'
                          OR role_name_value ILIKE '%idn%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Trade & Distribution' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%analytics%' 
                          OR role_name_value ILIKE '%insights%'
                          OR role_name_value ILIKE '%data analyst%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Analytics & Insights' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%operations%' 
                          OR role_name_value ILIKE '%excellence%'
                          OR role_name_value ILIKE '%process excellence%'
                          OR role_name_value ILIKE '%strategy planning%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Operations & Excellence' 
                        LIMIT 1;
                    END IF;
                END IF;
            END IF;
            
            -- Commercial Organization
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%commercial%'
               OR role_name_value ILIKE '%sales%'
               OR role_name_value ILIKE '%key account%'
               OR role_name_value ILIKE '%customer experience%'
               OR role_name_value ILIKE '%marketing%'
               OR role_name_value ILIKE '%business development%'
               OR role_name_value ILIKE '%licensing%'
               OR role_name_value ILIKE '%brand%'
               OR role_name_value ILIKE '%product manager%'
               OR role_name_value ILIKE '%digital engagement%'
               OR role_name_value ILIKE '%omnichannel%'
               OR role_name_value ILIKE '%remote sales%'
               OR role_name_value ILIKE '%territory%'
               OR role_name_value ILIKE '%district%'
               OR role_name_value ILIKE '%regional sales%'
               OR role_name_value ILIKE '%national sales%'
               OR role_name_value ILIKE '%area sales%'
               OR role_name_value ILIKE '%hospital sales%'
               OR role_name_value ILIKE '%specialty sales%'
               OR role_name_value ILIKE '%institutional%'
               OR role_name_value ILIKE '%account executive%'
               OR role_name_value ILIKE '%account manager%'
               OR role_name_value ILIKE '%customer success%'
               OR role_name_value ILIKE '%commercial analytics%'
               OR role_name_value ILIKE '%sales analytics%'
               OR role_name_value ILIKE '%sales training%'
               OR role_name_value ILIKE '%sales enablement%'
               OR role_name_value ILIKE '%field enablement%'
               OR role_name_value ILIKE '%commercial compliance%'
               OR role_name_value ILIKE '%commercial operations%'
               OR role_name_value ILIKE '%promotional review%'
               OR role_name_value ILIKE '%sample operations%'
               OR role_name_value ILIKE '%market intelligence%'
               OR role_name_value ILIKE '%reimbursement service%'
               OR role_name_value ILIKE '%patient support service%'
               OR role_name_value ILIKE '%cco%'
               OR role_name_value ILIKE '%chief commercial%'
               OR role_name_value ILIKE '%svp commercial%'
               OR role_name_value ILIKE '%vp commercial%'
               OR role_record.description ILIKE '%commercial%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = pharma_tenant_id 
                  AND name::text = 'Commercial Organization'
                LIMIT 1;
                
                -- Map to specific departments within Commercial Organization
                IF matched_function_id IS NOT NULL THEN
                    IF role_name_value ILIKE '%leadership%' 
                       OR role_name_value ILIKE '%strategy%'
                       OR role_name_value ILIKE '%cco%'
                       OR role_name_value ILIKE '%chief commercial%'
                       OR role_name_value ILIKE '%svp commercial%'
                       OR role_name_value ILIKE '%vp commercial strategy%'
                       OR role_name_value ILIKE '%commercial strategy director%'
                       OR role_name_value ILIKE '%strategic accounts head%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Commercial Leadership & Strategy' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%field sales%' 
                          OR role_name_value ILIKE '%sales rep%'
                          OR role_name_value ILIKE '%district manager%'
                          OR role_name_value ILIKE '%regional sales%'
                          OR role_name_value ILIKE '%national sales%'
                          OR role_name_value ILIKE '%area sales%'
                          OR role_name_value ILIKE '%territory%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Field Sales Operations' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%specialty sales%' 
                          OR role_name_value ILIKE '%hospital sales%'
                          OR role_name_value ILIKE '%institutional%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Specialty & Hospital Sales' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%key account%' 
                          OR role_name_value ILIKE '%kam%'
                          OR role_name_value ILIKE '%strategic account%'
                          OR role_name_value ILIKE '%account manager%'
                          OR role_name_value ILIKE '%account executive%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Key Account Management' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%customer experience%' 
                          OR role_name_value ILIKE '%customer success%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Customer Experience' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%marketing%' 
                          OR role_name_value ILIKE '%brand manager%'
                          OR role_name_value ILIKE '%product manager%'
                          OR role_name_value ILIKE '%product launch%'
                          OR role_name_value ILIKE '%marketing automation%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Commercial Marketing' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%business development%' 
                          OR role_name_value ILIKE '%licensing%'
                          OR role_name_value ILIKE '%corporate development%'
                          OR role_name_value ILIKE '%partnership%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Business Development & Licensing' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%commercial analytics%' 
                          OR role_name_value ILIKE '%sales analytics%'
                          OR role_name_value ILIKE '%business intelligence%'
                          OR role_name_value ILIKE '%market intelligence%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Commercial Analytics & Insights' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%sales training%' 
                          OR role_name_value ILIKE '%enablement%'
                          OR role_name_value ILIKE '%field enablement%'
                          OR role_name_value ILIKE '%commercial learning%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Sales Training & Enablement' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%digital engagement%' 
                          OR role_name_value ILIKE '%omnichannel%'
                          OR role_name_value ILIKE '%remote sales%'
                          OR role_name_value ILIKE '%digital commercial%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Digital & Omnichannel Engagement' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%commercial operations%' 
                          OR role_name_value ILIKE '%commercial compliance%'
                          OR role_name_value ILIKE '%promotional review%'
                          OR role_name_value ILIKE '%sample operations%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Compliance & Commercial Operations' 
                        LIMIT 1;
                    END IF;
                END IF;
            END IF;
            
            -- Regulatory Affairs
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%regulatory%'
               OR role_name_value ILIKE '%cmc%'
               OR role_name_value ILIKE '%fda%'
               OR role_name_value ILIKE '%ema%'
               OR role_name_value ILIKE '%submission%'
               OR role_name_value ILIKE '%regulatory writer%'
               OR role_name_value ILIKE '%regulatory intelligence%'
               OR role_name_value ILIKE '%regulatory policy%'
               OR role_name_value ILIKE '%regulatory compliance%'
               OR role_name_value ILIKE '%regulatory labeling%'
               OR role_name_value ILIKE '%regulatory system%'
               OR role_name_value ILIKE '%regulatory coordinator%'
               OR role_name_value ILIKE '%regulatory document%'
               OR role_name_value ILIKE '%regulatory publishing%'
               OR role_name_value ILIKE '%us regulatory%'
               OR role_name_value ILIKE '%eu regulatory%'
               OR role_name_value ILIKE '%apac regulatory%'
               OR role_name_value ILIKE '%latam regulatory%'
               OR role_name_value ILIKE '%head of us regulatory%'
               OR role_name_value ILIKE '%head of eu regulatory%'
               OR role_name_value ILIKE '%cro%'
               OR role_name_value ILIKE '%chief regulatory%'
               OR role_name_value ILIKE '%svp regulatory%'
               OR role_name_value ILIKE '%vp regulatory%'
               OR role_record.description ILIKE '%regulatory affair%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = pharma_tenant_id 
                  AND name::text = 'Regulatory Affairs'
                LIMIT 1;
                
                -- Map to specific departments within Regulatory Affairs
                IF matched_function_id IS NOT NULL THEN
                    IF role_name_value ILIKE '%leadership%' 
                       OR role_name_value ILIKE '%strategy%'
                       OR role_name_value ILIKE '%cro%'
                       OR role_name_value ILIKE '%chief regulatory%'
                       OR role_name_value ILIKE '%svp regulatory%'
                       OR role_name_value ILIKE '%vp regulatory strategy%'
                       OR role_name_value ILIKE '%head of regulatory operations%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Regulatory Leadership & Strategy' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%submission%' 
                          OR role_name_value ILIKE '%regulatory writer%'
                          OR role_name_value ILIKE '%regulatory document%'
                          OR role_name_value ILIKE '%regulatory coordinator%'
                          OR role_name_value ILIKE '%regulatory publishing%'
                          OR role_name_value ILIKE '%publishing manager%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Regulatory Submissions & Operations' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%intelligence%' 
                          OR role_name_value ILIKE '%policy%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Regulatory Intelligence & Policy' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%cmc%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%us regulatory%' 
                          OR role_name_value ILIKE '%eu regulatory%'
                          OR role_name_value ILIKE '%apac regulatory%'
                          OR role_name_value ILIKE '%latam regulatory%'
                          OR role_name_value ILIKE '%head of us regulatory%'
                          OR role_name_value ILIKE '%head of eu regulatory%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Global Regulatory Affairs (US, EU, APAC, LatAm)' 
                        LIMIT 1;
                    ELSIF role_name_value ILIKE '%regulatory compliance%' 
                          OR role_name_value ILIKE '%regulatory labeling%'
                          OR role_name_value ILIKE '%regulatory system%'
                    THEN
                        SELECT id INTO matched_department_id 
                        FROM public.org_departments 
                        WHERE function_id = matched_function_id 
                          AND name ILIKE 'Regulatory Compliance & Systems' 
                        LIMIT 1;
                    END IF;
                END IF;
            END IF;
            
            -- Research & Development (R&D)
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%research%'
               OR role_name_value ILIKE '%development%'
               OR role_name_value ILIKE '%r&d%'
               OR role_name_value ILIKE '%clinical development%'
               OR role_name_value ILIKE '%discovery%'
               OR role_name_value ILIKE '%preclinical%'
               OR role_name_value ILIKE '%biometrics%'
               OR role_name_value ILIKE '%biostatistician%'
               OR role_name_value ILIKE '%statistical programmer%'
               OR role_name_value ILIKE '%clinical operations%'
               OR role_name_value ILIKE '%clinical trial%'
               OR role_name_value ILIKE '%clinical research%'
               OR role_name_value ILIKE '%clinical data%'
               OR role_name_value ILIKE '%clinical program%'
               OR role_name_value ILIKE '%clinical study%'
               OR role_name_value ILIKE '%clinical trial coordinator%'
               OR role_name_value ILIKE '%clinical trial disclosure%'
               OR role_name_value ILIKE '%clinical trial physician%'
               OR role_name_value ILIKE '%clinical trials manager%'
               OR role_name_value ILIKE '%pharmacovigilance%'
               OR role_name_value ILIKE '%drug safety%'
               OR role_name_value ILIKE '%project management%'
               OR role_name_value ILIKE '%portfolio management%'
               OR role_name_value ILIKE '%translational science%'
               OR role_record.description ILIKE '%research and development%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = pharma_tenant_id 
                  AND name::text = 'Research & Development (R&D)'
                LIMIT 1;
            END IF;
            
            -- Finance & Accounting
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%finance%'
               OR role_name_value ILIKE '%accounting%'
               OR role_name_value ILIKE '%treasury%'
               OR role_name_value ILIKE '%tax%'
               OR role_name_value ILIKE '%audit%'
               OR role_name_value ILIKE '%fp&a%'
               OR role_name_value ILIKE '%controller%'
               OR role_name_value ILIKE '%cfo%'
               OR role_name_value ILIKE '%chief financial%'
               OR role_name_value ILIKE '%accountant%'
               OR role_name_value ILIKE '%accounts payable%'
               OR role_name_value ILIKE '%financial analyst%'
               OR role_name_value ILIKE '%financial reporting%'
               OR role_name_value ILIKE '%financial system%'
               OR role_name_value ILIKE '%investor relation%'
               OR role_name_value ILIKE '%sox%'
               OR role_name_value ILIKE '%revenue recognition%'
               OR role_name_value ILIKE '%general accounting%'
               OR role_name_value ILIKE '%internal control%'
               OR role_name_value ILIKE '%strategic planning%'
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
               role_name_value ILIKE '%hr%'
               OR role_name_value ILIKE '%human resources%'
               OR role_name_value ILIKE '%talent acquisition%'
               OR role_name_value ILIKE '%recruitment%'
               OR role_name_value ILIKE '%recruiter%'
               OR role_name_value ILIKE '%learning & development%'
               OR role_name_value ILIKE '%l&d%'
               OR role_name_value ILIKE '%total rewards%'
               OR role_name_value ILIKE '%compensation%'
               OR role_name_value ILIKE '%benefits%'
               OR role_name_value ILIKE '%hr business partner%'
               OR role_name_value ILIKE '%organizational development%'
               OR role_name_value ILIKE '%hr operations%'
               OR role_name_value ILIKE '%people operations%'
               OR role_name_value ILIKE '%chief people%'
               OR role_name_value ILIKE '%vp hr%'
               OR role_name_value ILIKE '%vp people%'
               OR role_record.description ILIKE '%human resources%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = pharma_tenant_id 
                  AND name::text = 'Human Resources'
                LIMIT 1;
            END IF;
            
            -- Information Technology (IT) / Digital
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%it%'
               OR role_name_value ILIKE '%digital%'
               OR role_name_value ILIKE '%engineer%'
               OR role_name_value ILIKE '%developer%'
               OR role_name_value ILIKE '%platform%'
               OR role_name_value ILIKE '%devops%'
               OR role_name_value ILIKE '%cybersecurity%'
               OR role_name_value ILIKE '%data science%'
               OR role_name_value ILIKE '%ml engineer%'
               OR role_name_value ILIKE '%data engineer%'
               OR role_name_value ILIKE '%data scientist%'
               OR role_name_value ILIKE '%software engineer%'
               OR role_name_value ILIKE '%backend%'
               OR role_name_value ILIKE '%frontend%'
               OR role_name_value ILIKE '%qa engineer%'
               OR role_name_value ILIKE '%sre%'
               OR role_name_value ILIKE '%security engineer%'
               OR role_name_value ILIKE '%security lead%'
               OR role_name_value ILIKE '%ai research%'
               OR role_name_value ILIKE '%research scientist%'
               OR role_name_value ILIKE '%product designer%'
               OR role_name_value ILIKE '%ux designer%'
               OR role_name_value ILIKE '%ui designer%'
               OR role_name_value ILIKE '%design lead%'
               OR role_name_value ILIKE '%head of design%'
               OR role_name_value ILIKE '%enterprise system%'
               OR role_name_value ILIKE '%erp%'
               OR role_name_value ILIKE '%cto%'
               OR role_name_value ILIKE '%chief technology%'
               OR role_name_value ILIKE '%chief digital%'
               OR role_name_value ILIKE '%chief data%'
               OR role_name_value ILIKE '%director of it%'
               OR role_name_value ILIKE '%director of cybersecurity%'
               OR role_name_value ILIKE '%director of data science%'
               OR role_name_value ILIKE '%director of enterprise system%'
               OR role_name_value ILIKE '%director of ml engineering%'
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
               role_name_value ILIKE '%legal%'
               OR role_name_value ILIKE '%compliance%'
               OR role_name_value ILIKE '%privacy%'
               OR role_name_value ILIKE '%intellectual property%'
               OR role_name_value ILIKE '%ip%'
               OR role_name_value ILIKE '%contract%'
               OR role_name_value ILIKE '%general counsel%'
               OR role_name_value ILIKE '%deputy general counsel%'
               OR role_name_value ILIKE '%patent%'
               OR role_name_value ILIKE '%data protection%'
               OR role_name_value ILIKE '%chief privacy%'
               OR role_name_value ILIKE '%director of privacy%'
               OR role_name_value ILIKE '%director of ip%'
               OR role_name_value ILIKE '%director of cybersecurity%'
               OR role_name_value ILIKE '%chief security%'
               OR role_record.description ILIKE '%legal%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = pharma_tenant_id 
                  AND name::text = 'Legal & Compliance'
                LIMIT 1;
            END IF;
            
        ELSIF tenant_id_to_use = digital_health_tenant_id THEN
            -- =====================================================================
            -- DIGITAL HEALTH TENANT MAPPING
            -- =====================================================================
            -- Similar logic but for Digital Health functions
            -- For now, we'll use a simplified approach
            
            -- Engineering / Product
            IF role_name_value ILIKE '%engineer%'
               OR role_name_value ILIKE '%developer%'
               OR role_name_value ILIKE '%product manager%'
               OR role_name_value ILIKE '%product designer%'
               OR role_name_value ILIKE '%designer%'
               OR role_name_value ILIKE '%cto%'
               OR role_name_value ILIKE '%chief product%'
               OR role_name_value ILIKE '%vp engineering%'
               OR role_name_value ILIKE '%vp product%'
            THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = digital_health_tenant_id 
                  AND (name::text ILIKE '%engineering%' OR name::text ILIKE '%product%' OR name::text ILIKE '%technology%')
                LIMIT 1;
            END IF;
            
            -- Sales / Commercial
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%sales%'
               OR role_name_value ILIKE '%account executive%'
               OR role_name_value ILIKE '%account manager%'
               OR role_name_value ILIKE '%customer success%'
               OR role_name_value ILIKE '%sdr%'
               OR role_name_value ILIKE '%bdr%'
               OR role_name_value ILIKE '%revenue%'
               OR role_name_value ILIKE '%cro%'
               OR role_name_value ILIKE '%chief revenue%'
               OR role_name_value ILIKE '%vp sales%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = digital_health_tenant_id 
                  AND (name::text ILIKE '%sales%' OR name::text ILIKE '%commercial%' OR name::text ILIKE '%revenue%')
                LIMIT 1;
            END IF;
            
            -- Finance
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%finance%'
               OR role_name_value ILIKE '%accounting%'
               OR role_name_value ILIKE '%cfo%'
               OR role_name_value ILIKE '%chief financial%'
               OR role_name_value ILIKE '%financial analyst%'
               OR role_name_value ILIKE '%accountant%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = digital_health_tenant_id 
                  AND name::text ILIKE '%finance%'
                LIMIT 1;
            END IF;
            
            -- HR / People
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%hr%'
               OR role_name_value ILIKE '%people%'
               OR role_name_value ILIKE '%talent%'
               OR role_name_value ILIKE '%recruiter%'
               OR role_name_value ILIKE '%chief people%'
               OR role_name_value ILIKE '%vp people%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = digital_health_tenant_id 
                  AND (name::text ILIKE '%human resources%' OR name::text ILIKE '%people%')
                LIMIT 1;
            END IF;
            
            -- Legal / Compliance
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%legal%'
               OR role_name_value ILIKE '%compliance%'
               OR role_name_value ILIKE '%privacy%'
               OR role_name_value ILIKE '%general counsel%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = digital_health_tenant_id 
                  AND (name::text ILIKE '%legal%' OR name::text ILIKE '%compliance%')
                LIMIT 1;
            END IF;
            
            -- Marketing / Growth
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%marketing%'
               OR role_name_value ILIKE '%growth%'
               OR role_name_value ILIKE '%content%'
               OR role_name_value ILIKE '%pr manager%'
               OR role_name_value ILIKE '%communications%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = digital_health_tenant_id 
                  AND (name::text ILIKE '%marketing%' OR name::text ILIKE '%growth%' OR name::text ILIKE '%communications%')
                LIMIT 1;
            END IF;
            
            -- Clinical / Medical
            IF matched_function_id IS NULL AND (
               role_name_value ILIKE '%clinical%'
               OR role_name_value ILIKE '%medical%'
               OR role_name_value ILIKE '%regulatory%'
            ) THEN
                SELECT id INTO matched_function_id
                FROM public.org_functions
                WHERE tenant_id = digital_health_tenant_id 
                  AND (name::text ILIKE '%clinical%' OR name::text ILIKE '%medical%' OR name::text ILIKE '%regulatory%')
                LIMIT 1;
            END IF;
        END IF;
        
        -- Update the role if a mapping was found
        IF matched_function_id IS NOT NULL THEN
            UPDATE public.org_roles
            SET 
                function_id = COALESCE(matched_function_id, role_record.function_id),
                department_id = COALESCE(matched_department_id, role_record.department_id),
                updated_at = NOW()
            WHERE id = role_record.id;
            
            GET DIAGNOSTICS roles_updated = ROW_COUNT;
            IF roles_updated > 0 THEN
                roles_with_function := roles_with_function + 1;
                IF matched_department_id IS NOT NULL THEN
                    roles_with_department := roles_with_department + 1;
                END IF;
                
                IF roles_with_function % 50 = 0 THEN
                    RAISE NOTICE '  Mapped % roles so far...', roles_with_function;
                END IF;
            END IF;
        ELSE
            roles_unmapped := roles_unmapped + 1;
            IF roles_unmapped <= 20 THEN
                RAISE NOTICE '  ❌ Role "%" (ID: %) remains unmapped.', role_name_value, role_record.id;
            END IF;
        END IF;
        
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== MAPPING COMPLETE ===';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Total roles processed: %', (SELECT COUNT(*) FROM public.org_roles WHERE (function_id IS NULL OR department_id IS NULL) AND is_active = true);
    RAISE NOTICE '  - Roles updated with at least a function: %', roles_with_function;
    RAISE NOTICE '  - Roles updated with a specific department: %', roles_with_department;
    RAISE NOTICE '  - Roles remaining unmapped: %', roles_unmapped;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Role mapping process finished.';
END $$;

COMMIT;

