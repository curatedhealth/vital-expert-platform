-- =====================================================================
-- ENHANCED PHARMA ROLE MAPPING - Handles All Edge Cases
-- Comprehensive mapping for all unmapped roles
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
    RAISE NOTICE '=== ENHANCED ROLE MAPPING ===';
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
        -- ENHANCED FUNCTION MAPPING - Comprehensive keyword matching
        -- =====================================================================
        
        -- Medical Affairs (check first to avoid conflicts with Market Access HEOR)
        IF role_record.role_name ILIKE '%medical%' 
           OR role_record.role_name ILIKE '%msl%'
           OR role_record.role_name ILIKE '%medical science%'
           OR role_record.role_name ILIKE '%medical information%'
           OR role_record.role_name ILIKE '%scientific communication%'
           OR role_record.role_name ILIKE '%medical education%'
           OR role_record.role_name ILIKE '%medical writer%'
           OR role_record.role_name ILIKE '%publication%'
           OR role_record.role_name ILIKE '%medical director%'
           OR role_record.role_name ILIKE '%chief medical%'
           OR role_record.role_name ILIKE '%cmo%'
           OR role_record.role_name ILIKE '%vp medical%'
           OR role_record.role_name ILIKE '%medical compliance%'
           OR role_record.role_name ILIKE '%medical quality%'
           OR role_record.role_name ILIKE '%medical operations%'
           OR role_record.role_name ILIKE '%medical excellence%'
           OR role_record.role_name ILIKE '%medical librarian%'
           OR role_record.role_name ILIKE '%medical editor%'
           OR role_record.role_name ILIKE '%medical monitor%'
           OR role_record.role_name ILIKE '%safety physician%'
           OR role_record.role_name ILIKE '%rwe specialist%'
           OR role_record.role_name ILIKE '%epidemiologist%'
           OR role_record.role_name ILIKE '%health outcomes%'
           OR role_record.role_name ILIKE '%clinical trial physician%'
           OR role_record.role_name ILIKE '%study site medical%'
           OR role_record.role_name ILIKE '%ta msl%'
           OR role_record.role_name ILIKE '%therapeutic area medical%'
           OR role_record.role_name ILIKE '%regional medical%'
           OR role_record.role_name ILIKE '%medical business partner%'
           OR role_record.role_name ILIKE '%medical affairs%'
           OR role_record.role_name ILIKE '%medical content%'
           OR role_record.role_name ILIKE '%medical training%'
           OR role_record.role_name ILIKE '%field medical%'
           OR role_record.role_name ILIKE '%field trainer%'
           OR role_record.role_name ILIKE '%congress manager%'
           OR role_record.role_name ILIKE '%medical review committee%'
           OR role_record.description ILIKE '%medical affair%'
           OR role_record.description ILIKE '%msl%'
        THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Medical Affairs'
            LIMIT 1;
        END IF;
        
        -- Market Access (check before Commercial to catch Market Access specific roles)
        IF matched_function_id IS NULL AND (
           role_record.role_name ILIKE '%market access%'
           OR role_record.role_name ILIKE '%payer%'
           OR role_record.role_name ILIKE '%reimbursement%'
           OR role_record.role_name ILIKE '%pricing%'
           OR role_record.role_name ILIKE '%value evidence%'
           OR role_record.role_name ILIKE '%value & evidence%'
           OR role_record.role_name ILIKE '%trade%'
           OR role_record.role_name ILIKE '%distribution%'
           OR role_record.role_name ILIKE '%gpo%'
           OR role_record.role_name ILIKE '%idn%'
           OR role_record.role_name ILIKE '%patient access%'
           OR role_record.role_name ILIKE '%patient service%'
           OR role_record.role_name ILIKE '%hub service%'
           OR role_record.role_name ILIKE '%government affair%'
           OR role_record.role_name ILIKE '%policy%'
           OR role_record.role_name ILIKE '%ma %'
           OR role_record.role_name ILIKE '% ma%'
           OR role_record.role_name ILIKE '%chief market access%'
           OR role_record.role_name ILIKE '%vp market access%'
           OR role_record.role_name ILIKE '%head of%' AND (role_record.role_name ILIKE '%payer%' OR role_record.role_name ILIKE '%pricing%' OR role_record.role_name ILIKE '%patient access%' OR role_record.role_name ILIKE '%trade%')
           OR role_record.description ILIKE '%market access%'
           OR role_record.description ILIKE '%payer%'
        ) THEN
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id 
              AND name::text = 'Market Access'
            LIMIT 1;
        END IF;
        
        -- Commercial Organization (comprehensive matching)
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
           OR role_record.role_name ILIKE '%account executive%'
           OR role_record.role_name ILIKE '%account manager%'
           OR role_record.role_name ILIKE '%territory%'
           OR role_record.role_name ILIKE '%district%'
           OR role_record.role_name ILIKE '%regional sales%'
           OR role_record.role_name ILIKE '%area sales%'
           OR role_record.role_name ILIKE '%national account%'
           OR role_record.role_name ILIKE '%specialty account%'
           OR role_record.role_name ILIKE '%hospital%'
           OR role_record.role_name ILIKE '%brand manager%'
           OR role_record.role_name ILIKE '%brand marketing%'
           OR role_record.role_name ILIKE '%product launch%'
           OR role_record.role_name ILIKE '%promotional review%'
           OR role_record.role_name ILIKE '%sample operation%'
           OR role_record.role_name ILIKE '%customer success%'
           OR role_record.role_name ILIKE '%chief commercial%'
           OR role_record.role_name ILIKE '%cco%'
           OR role_record.role_name ILIKE '%chief revenue%'
           OR role_record.role_name ILIKE '%cro%'
           OR role_record.role_name ILIKE '%chief growth%'
           OR role_record.role_name ILIKE '%cgo%'
           OR role_record.role_name ILIKE '%vp%' AND (role_record.role_name ILIKE '%sales%' OR role_record.role_name ILIKE '%commercial%' OR role_record.role_name ILIKE '%marketing%')
           OR role_record.role_name ILIKE '%svp%' AND (role_record.role_name ILIKE '%sales%' OR role_record.role_name ILIKE '%commercial%' OR role_record.role_name ILIKE '%marketing%')
           OR role_record.role_name ILIKE '%executive director%' AND (role_record.role_name ILIKE '%sales%' OR role_record.role_name ILIKE '%commercial%' OR role_record.role_name ILIKE '%marketing%')
           OR role_record.role_name ILIKE '%director%' AND (role_record.role_name ILIKE '%sales%' OR role_record.role_name ILIKE '%commercial%' OR role_record.role_name ILIKE '%marketing%')
           OR role_record.role_name ILIKE '%digital engagement%'
           OR role_record.role_name ILIKE '%digital marketing%'
           OR role_record.role_name ILIKE '%digital commercial%'
           OR role_record.role_name ILIKE '%field enablement%'
           OR role_record.role_name ILIKE '%commercial learning%'
           OR role_record.role_name ILIKE '%commercial planning%'
           OR role_record.role_name ILIKE '%commercial transformation%'
           OR role_record.role_name ILIKE '%commercial compliance%'
           OR role_record.role_name ILIKE '%commercial operation%'
           OR role_record.role_name ILIKE '%commercial analytics%'
           OR role_record.role_name ILIKE '%commercial intelligence%'
           OR role_record.role_name ILIKE '%commercial strategy%'
           OR role_record.role_name ILIKE '%revenue operation%'
           OR role_record.role_name ILIKE '%revops%'
           OR role_record.role_name ILIKE '%patient support service%'
           OR role_record.description ILIKE '%commercial%'
           OR role_record.description ILIKE '%sales%'
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
           OR role_record.role_name ILIKE '%regulatory labeling%'
           OR role_record.role_name ILIKE '%regulatory policy%'
           OR role_record.role_name ILIKE '%regulatory publishing%'
           OR role_record.role_name ILIKE '%regulatory system%'
           OR role_record.role_name ILIKE '%regulatory writer%'
           OR role_record.role_name ILIKE '%regulatory coordinator%'
           OR role_record.role_name ILIKE '%regulatory document%'
           OR role_record.role_name ILIKE '%regulatory strategy%'
           OR role_record.role_name ILIKE '%chief regulatory%'
           OR role_record.role_name ILIKE '%svp regulatory%'
           OR role_record.role_name ILIKE '%vp regulatory%'
           OR role_record.role_name ILIKE '%head of%' AND role_record.role_name ILIKE '%regulatory%'
           OR role_record.role_name ILIKE '%us regulatory%'
           OR role_record.role_name ILIKE '%eu regulatory%'
           OR role_record.role_name ILIKE '%apac regulatory%'
           OR role_record.role_name ILIKE '%latam regulatory%'
           OR role_record.role_name ILIKE '%global regulatory%'
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
           OR role_record.role_name ILIKE '%biostatistic%'
           OR role_record.role_name ILIKE '%statistical programmer%'
           OR role_record.role_name ILIKE '%clinical data manager%'
           OR role_record.role_name ILIKE '%pharmacovigilance%'
           OR role_record.role_name ILIKE '%drug safety%'
           OR role_record.role_name ILIKE '%portfolio%'
           OR role_record.role_name ILIKE '%clinical trial%'
           OR role_record.role_name ILIKE '%clinical research%'
           OR role_record.role_name ILIKE '%clinical study%'
           OR role_record.role_name ILIKE '%clinical program%'
           OR role_record.role_name ILIKE '%clinical operation%'
           OR role_record.role_name ILIKE '%clinical validation%'
           OR role_record.role_name ILIKE '%clinical affair%'
           OR role_record.role_name ILIKE '%director of clinical%'
           OR role_record.role_name ILIKE '%vp of clinical%'
           OR role_record.role_name ILIKE '%head of clinical%'
           OR role_record.role_name ILIKE '%director of drug discovery%'
           OR role_record.role_name ILIKE '%director of biostatistic%'
           OR role_record.role_name ILIKE '%director of pharmacovigilance%'
           OR role_record.role_name ILIKE '%scientist%' AND (role_record.role_name ILIKE '%drug%' OR role_record.role_name ILIKE '%discovery%')
           OR role_record.description ILIKE '%research%'
           OR role_record.description ILIKE '%development%'
           OR role_record.description ILIKE '%clinical trial%'
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
           OR role_record.role_name ILIKE '%production%'
           OR role_record.role_name ILIKE '%logistics%'
           OR role_record.role_name ILIKE '%vp of manufacturing%'
           OR role_record.role_name ILIKE '%vp of supply chain%'
           OR role_record.role_name ILIKE '%director of manufacturing%'
           OR role_record.role_name ILIKE '%director of supply chain%'
           OR role_record.role_name ILIKE '%director of process%'
           OR role_record.role_name ILIKE '%manufacturing supervisor%'
           OR role_record.description ILIKE '%manufacturing%'
           OR role_record.description ILIKE '%supply chain%'
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
           OR role_record.role_name ILIKE '%fpa%'
           OR role_record.role_name ILIKE '%treasury%'
           OR role_record.role_name ILIKE '%tax%'
           OR role_record.role_name ILIKE '%audit%'
           OR role_record.role_name ILIKE '%accountant%'
           OR role_record.role_name ILIKE '%controller%'
           OR role_record.role_name ILIKE '%cfo%'
           OR role_record.role_name ILIKE '%chief financial%'
           OR role_record.role_name ILIKE '%accounts payable%'
           OR role_record.role_name ILIKE '%ap%'
           OR role_record.role_name ILIKE '%accounts receivable%'
           OR role_record.role_name ILIKE '%ar%'
           OR role_record.role_name ILIKE '%general ledger%'
           OR role_record.role_name ILIKE '%gl%'
           OR role_record.role_name ILIKE '%financial reporting%'
           OR role_record.role_name ILIKE '%financial system%'
           OR role_record.role_name ILIKE '%financial planning%'
           OR role_record.role_name ILIKE '%financial analyst%'
           OR role_record.role_name ILIKE '%sox%'
           OR role_record.role_name ILIKE '%internal control%'
           OR role_record.role_name ILIKE '%revenue recognition%'
           OR role_record.role_name ILIKE '%investor relation%'
           OR role_record.role_name ILIKE '%clinical finance%'
           OR role_record.role_name ILIKE '%commercial finance%'
           OR role_record.role_name ILIKE '%business finance%'
           OR role_record.role_name ILIKE '%rd finance%'
           OR role_record.role_name ILIKE '%r&d finance%'
           OR role_record.role_name ILIKE '%manufacturing finance%'
           OR role_record.role_name ILIKE '%supply chain finance%'
           OR role_record.role_name ILIKE '%strategic planning%' AND role_record.role_name ILIKE '%finance%'
           OR role_record.description ILIKE '%finance%'
           OR role_record.description ILIKE '%accounting%'
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
           OR role_record.role_name ILIKE '%recruiter%'
           OR role_record.role_name ILIKE '%learning%'
           OR role_record.role_name ILIKE '%development%' AND (role_record.role_name ILIKE '%hr%' OR role_record.role_name ILIKE '%people%' OR role_record.role_name ILIKE '%talent%')
           OR role_record.role_name ILIKE '%compensation%'
           OR role_record.role_name ILIKE '%benefit%'
           OR role_record.role_name ILIKE '%reward%'
           OR role_record.role_name ILIKE '%organizational development%'
           OR role_record.role_name ILIKE '%people operation%'
           OR role_record.role_name ILIKE '%hr operation%'
           OR role_record.role_name ILIKE '%hr business partner%'
           OR role_record.role_name ILIKE '%hrbp%'
           OR role_record.role_name ILIKE '%chief people%'
           OR role_record.role_name ILIKE '%vp of hr%'
           OR role_record.role_name ILIKE '%vp of human resource%'
           OR role_record.role_name ILIKE '%director of hr%'
           OR role_record.description ILIKE '%human resource%'
           OR role_record.description ILIKE '%hr%'
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
           OR role_record.role_name ILIKE '%digital%' AND NOT role_record.role_name ILIKE '%digital health%' AND NOT role_record.role_name ILIKE '%digital commercial%' AND NOT role_record.role_name ILIKE '%digital marketing%'
           OR role_record.role_name ILIKE '%enterprise%'
           OR role_record.role_name ILIKE '%erp%'
           OR role_record.role_name ILIKE '%data%' AND (role_record.role_name ILIKE '%engineer%' OR role_record.role_name ILIKE '%scientist%' OR role_record.role_name ILIKE '%analyst%')
           OR role_record.role_name ILIKE '%analytics%' AND NOT role_record.role_name ILIKE '%commercial%' AND NOT role_record.role_name ILIKE '%market access%'
           OR role_record.role_name ILIKE '%cybersecurity%'
           OR role_record.role_name ILIKE '%security%' AND (role_record.role_name ILIKE '%information%' OR role_record.role_name ILIKE '%cyber%' OR role_record.role_name ILIKE '%it%')
           OR role_record.role_name ILIKE '%infrastructure%'
           OR role_record.role_name ILIKE '%cloud%'
           OR role_record.role_name ILIKE '%devops%'
           OR role_record.role_name ILIKE '%sre%'
           OR role_record.role_name ILIKE '%site reliability%'
           OR role_record.role_name ILIKE '%end user%'
           OR role_record.role_name ILIKE '%support%' AND (role_record.role_name ILIKE '%technical%' OR role_record.role_name ILIKE '%it%')
           OR role_record.role_name ILIKE '%software engineer%'
           OR role_record.role_name ILIKE '%backend engineer%'
           OR role_record.role_name ILIKE '%frontend engineer%'
           OR role_record.role_name ILIKE '%platform engineer%'
           OR role_record.role_name ILIKE '%ml engineer%'
           OR role_record.role_name ILIKE '%ai research%'
           OR role_record.role_name ILIKE '%data engineer%'
           OR role_record.role_name ILIKE '%data scientist%'
           OR role_record.role_name ILIKE '%chief data%'
           OR role_record.role_name ILIKE '%cdo%' AND NOT role_record.role_name ILIKE '%chief digital%'
           OR role_record.role_name ILIKE '%chief technology%'
           OR role_record.role_name ILIKE '%cto%'
           OR role_record.role_name ILIKE '%chief security%'
           OR role_record.role_name ILIKE '%cso%'
           OR role_record.role_name ILIKE '%vp of it%'
           OR role_record.role_name ILIKE '%director of it%'
           OR role_record.role_name ILIKE '%director of enterprise%'
           OR role_record.role_name ILIKE '%director of cybersecurity%'
           OR role_record.description ILIKE '%information technology%'
           OR role_record.description ILIKE '%software%'
           OR role_record.description ILIKE '%engineering%'
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
           OR role_record.role_name ILIKE '%data privacy%'
           OR role_record.role_name ILIKE '%patent%'
           OR role_record.role_name ILIKE '%general counsel%'
           OR role_record.role_name ILIKE '%deputy general counsel%'
           OR role_record.role_name ILIKE '%legal counsel%'
           OR role_record.role_name ILIKE '%legal associate%'
           OR role_record.role_name ILIKE '%chief privacy%'
           OR role_record.role_name ILIKE '%compliance officer%'
           OR role_record.role_name ILIKE '%compliance director%'
           OR role_record.role_name ILIKE '%compliance manager%'
           OR role_record.role_name ILIKE '%compliance specialist%'
           OR role_record.role_name ILIKE '%director of ip%'
           OR role_record.role_name ILIKE '%vp of ip%'
           OR role_record.description ILIKE '%legal%'
           OR role_record.description ILIKE '%compliance%'
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
           OR role_record.role_name ILIKE '%investor relation%'
           OR role_record.role_name ILIKE '%csr%'
           OR role_record.role_name ILIKE '%corporate social%'
           OR role_record.role_name ILIKE '%director of communication%'
           OR role_record.role_name ILIKE '%vp of brand%'
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
           role_record.role_name ILIKE '%strategic%' AND NOT role_record.role_name ILIKE '%commercial%'
           OR role_record.role_name ILIKE '%corporate development%'
           OR role_record.role_name ILIKE '%m&a%'
           OR role_record.role_name ILIKE '%merger%'
           OR role_record.role_name ILIKE '%acquisition%'
           OR role_record.role_name ILIKE '%pmo%'
           OR role_record.role_name ILIKE '%project management office%'
           OR role_record.role_name ILIKE '%transformation%' AND NOT role_record.role_name ILIKE '%commercial%'
           OR role_record.role_name ILIKE '%foresight%'
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
           OR role_record.role_name ILIKE '%data science%' AND NOT role_record.role_name ILIKE '%commercial%'
           OR role_record.role_name ILIKE '%advanced analytics%'
           OR role_record.role_name ILIKE '%forecasting%'
           OR role_record.role_name ILIKE '%modeling%'
           OR role_record.role_name ILIKE '%competitive intelligence%'
           OR role_record.role_name ILIKE '%director of data science%'
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
           OR role_record.role_name ILIKE '%contracting%' AND role_record.role_name ILIKE '%negotiation%'
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
           OR role_record.role_name ILIKE '%safety%' AND (role_record.role_name ILIKE '%environmental%' OR role_record.role_name ILIKE '%facility%')
           OR role_record.role_name ILIKE '%security%' AND (role_record.role_name ILIKE '%facility%' OR role_record.role_name ILIKE '%emergency%')
           OR role_record.role_name ILIKE '%emergency planning%'
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
        -- ENHANCED DEPARTMENT MAPPING
        -- =====================================================================
        
        IF matched_function_id IS NOT NULL THEN
            -- Medical Affairs departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Medical Affairs' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%field medical%' OR role_record.role_name ILIKE '%msl%' OR role_record.role_name ILIKE '%field trainer%' OR role_record.role_name ILIKE '%ta msl%' OR role_record.role_name ILIKE '%regional medical%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Field Medical%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%medical information%' OR role_record.role_name ILIKE '%medical info%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Medical Information%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%scientific communication%' OR role_record.role_name ILIKE '%medical communication%' OR role_record.role_name ILIKE '%medical content%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Scientific Communication%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%medical education%' OR role_record.role_name ILIKE '%medical training%' OR role_record.role_name ILIKE '%congress%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Medical Education%' LIMIT 1;
                ELSIF (role_record.role_name ILIKE '%heor%' OR role_record.role_name ILIKE '%evidence%' OR role_record.role_name ILIKE '%outcome%' OR role_record.role_name ILIKE '%health economist%' OR role_record.role_name ILIKE '%rwe%') AND role_record.role_name ILIKE '%medical%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%HEOR%Evidence%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%publication%' OR role_record.role_name ILIKE '%medical writer%' OR role_record.role_name ILIKE '%medical editor%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Publication%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%medical leadership%' OR role_record.role_name ILIKE '%chief medical%' OR role_record.role_name ILIKE '%medical director%' OR role_record.role_name ILIKE '%vp medical%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Medical Leadership%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%clinical operation%' AND role_record.role_name ILIKE '%medical%' OR role_record.role_name ILIKE '%clinical trial physician%' OR role_record.role_name ILIKE '%study site medical%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Clinical Operations Support%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%excellence%' OR role_record.role_name ILIKE '%compliance%' AND role_record.role_name ILIKE '%medical%' OR role_record.role_name ILIKE '%medical quality%' OR role_record.role_name ILIKE '%medical review%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Medical Excellence%Compliance%' LIMIT 1;
                END IF;
            END IF;
            
            -- Market Access departments (comprehensive matching)
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Market Access' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%leadership%' OR role_record.role_name ILIKE '%strategy%' AND (role_record.role_name ILIKE '%market access%' OR role_record.role_name ILIKE '%ma %') OR role_record.role_name ILIKE '%chief market access%' OR role_record.role_name ILIKE '%vp market access%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Leadership%Strategy%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%heor%' AND role_record.role_name ILIKE '%market access%' OR role_record.role_name ILIKE '%health economist%' OR role_record.role_name ILIKE '%director heor%' OR role_record.role_name ILIKE '%head of heor%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%HEOR%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%value%' OR role_record.role_name ILIKE '%evidence%' OR role_record.role_name ILIKE '%outcome%' OR role_record.role_name ILIKE '%rwe%' OR role_record.role_name ILIKE '%head of value%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Value%Evidence%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%pricing%' OR role_record.role_name ILIKE '%reimbursement%' OR role_record.role_name ILIKE '%head of pricing%' OR role_record.role_name ILIKE '%director of pricing%' OR role_record.role_name ILIKE '%global pricing%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Pricing%Reimbursement%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%payer%' OR role_record.role_name ILIKE '%contracting%' OR role_record.role_name ILIKE '%head of payer%' OR role_record.role_name ILIKE '%national payer%' OR role_record.role_name ILIKE '%regional payer%' OR role_record.role_name ILIKE '%payer account%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Payer Relations%Contracting%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%patient access%' OR role_record.role_name ILIKE '%patient service%' OR role_record.role_name ILIKE '%hub service%' OR role_record.role_name ILIKE '%head of patient%' OR role_record.role_name ILIKE '%patient access coordinator%' OR role_record.role_name ILIKE '%patient access specialist%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Patient Access%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%government%' OR role_record.role_name ILIKE '%policy%' OR role_record.role_name ILIKE '%head of government%' OR role_record.role_name ILIKE '%government relation%' OR role_record.role_name ILIKE '%policy analyst%' OR role_record.role_name ILIKE '%policy advocacy%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Government%Policy%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%trade%' OR role_record.role_name ILIKE '%distribution%' OR role_record.role_name ILIKE '%gpo%' OR role_record.role_name ILIKE '%idn%' OR role_record.role_name ILIKE '%head of trade%' OR role_record.role_name ILIKE '%trade channel%' OR role_record.role_name ILIKE '%distribution analyst%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Trade%Distribution%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%analytics%' OR role_record.role_name ILIKE '%insight%' OR role_record.role_name ILIKE '%ma data%' OR role_record.role_name ILIKE '%ma analyst%' OR role_record.role_name ILIKE '%head of ma analytics%' OR role_record.role_name ILIKE '%market access analytics%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Analytics%Insights%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%operation%' OR role_record.role_name ILIKE '%excellence%' OR role_record.role_name ILIKE '%ma operation%' OR role_record.role_name ILIKE '%ma process%' OR role_record.role_name ILIKE '%ma strategy%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Operations%Excellence%' LIMIT 1;
                END IF;
            END IF;
            
            -- Commercial Organization departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Commercial Organization' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%leadership%' OR role_record.role_name ILIKE '%strategy%' AND role_record.role_name ILIKE '%commercial%' OR role_record.role_name ILIKE '%chief commercial%' OR role_record.role_name ILIKE '%cco%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Commercial Leadership%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%sales%' AND (role_record.role_name ILIKE '%field%' OR role_record.role_name ILIKE '%territory%' OR role_record.role_name ILIKE '%district%' OR role_record.role_name ILIKE '%area%' OR role_record.role_name ILIKE '%regional%') THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Field Sales%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%specialty%' OR role_record.role_name ILIKE '%hospital%' OR role_record.role_name ILIKE '%institutional%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Specialty%Hospital%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%key account%' OR role_record.role_name ILIKE '%strategic account%' OR role_record.role_name ILIKE '%national account%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Key Account%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%customer experience%' OR role_record.role_name ILIKE '%customer success%' OR role_record.role_name ILIKE '%digital customer%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Customer Experience%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%marketing%' AND NOT role_record.role_name ILIKE '%digital marketing%' OR role_record.role_name ILIKE '%brand%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Commercial Marketing%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%business development%' OR role_record.role_name ILIKE '%licensing%' OR role_record.role_name ILIKE '%partnership%' OR role_record.role_name ILIKE '%corporate development%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Business Development%Licensing%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%analytics%' AND role_record.role_name ILIKE '%commercial%' OR role_record.role_name ILIKE '%sales analytics%' OR role_record.role_name ILIKE '%market intelligence%' OR role_record.role_name ILIKE '%business intelligence%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Commercial Analytics%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%training%' OR role_record.role_name ILIKE '%enablement%' OR role_record.role_name ILIKE '%learning%' AND role_record.role_name ILIKE '%sales%' OR role_record.role_name ILIKE '%field enablement%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Sales Training%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%digital%' OR role_record.role_name ILIKE '%omnichannel%' OR role_record.role_name ILIKE '%digital engagement%' OR role_record.role_name ILIKE '%digital commercial%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Digital%Omnichannel%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%compliance%' AND role_record.role_name ILIKE '%commercial%' OR role_record.role_name ILIKE '%promotional review%' OR role_record.role_name ILIKE '%commercial operation%' OR role_record.role_name ILIKE '%sample operation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Compliance%Commercial Operations%' LIMIT 1;
                END IF;
            END IF;
            
            -- Regulatory Affairs departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Regulatory Affairs' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%leadership%' OR role_record.role_name ILIKE '%strategy%' AND role_record.role_name ILIKE '%regulatory%' OR role_record.role_name ILIKE '%chief regulatory%' OR role_record.role_name ILIKE '%svp regulatory%' OR role_record.role_name ILIKE '%vp regulatory strategy%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Regulatory Leadership%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%submission%' OR role_record.role_name ILIKE '%regulatory writer%' OR role_record.role_name ILIKE '%regulatory coordinator%' OR role_record.role_name ILIKE '%regulatory document%' OR role_record.role_name ILIKE '%regulatory publishing%' OR role_record.role_name ILIKE '%vp regulatory submission%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Regulatory Submissions%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%intelligence%' OR role_record.role_name ILIKE '%policy%' AND role_record.role_name ILIKE '%regulatory%' OR role_record.role_name ILIKE '%regulatory policy%' OR role_record.role_name ILIKE '%regulatory intelligence%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Regulatory Intelligence%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%cmc%' OR role_record.role_name ILIKE '%head of cmc%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%CMC%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%global%' OR role_record.role_name ILIKE '%us regulatory%' OR role_record.role_name ILIKE '%eu regulatory%' OR role_record.role_name ILIKE '%apac regulatory%' OR role_record.role_name ILIKE '%latam regulatory%' OR role_record.role_name ILIKE '%head of us%' OR role_record.role_name ILIKE '%head of eu%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Global Regulatory%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%compliance%' AND role_record.role_name ILIKE '%regulatory%' OR role_record.role_name ILIKE '%regulatory labeling%' OR role_record.role_name ILIKE '%regulatory system%' OR role_record.role_name ILIKE '%regulatory compliance%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Regulatory Compliance%' LIMIT 1;
                END IF;
            END IF;
            
            -- Research & Development departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Research & Development (R&D)' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%discovery%' OR role_record.role_name ILIKE '%drug discovery%' OR role_record.role_name ILIKE '%scientist%' AND role_record.role_name ILIKE '%drug%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Discovery Research%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%translational%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Translational Science%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%preclinical%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Preclinical Development%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%clinical development%' OR role_record.role_name ILIKE '%phase%' OR role_record.role_name ILIKE '%clinical trial%' AND role_record.role_name ILIKE '%physician%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Clinical Development%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%biometric%' OR role_record.role_name ILIKE '%data management%' OR role_record.role_name ILIKE '%biostatistic%' OR role_record.role_name ILIKE '%statistical programmer%' OR role_record.role_name ILIKE '%clinical data manager%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Biometrics%Data Management%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%clinical operation%' AND NOT role_record.role_name ILIKE '%medical%' OR role_record.role_name ILIKE '%clinical research%' OR role_record.role_name ILIKE '%clinical study%' OR role_record.role_name ILIKE '%clinical program%' OR role_record.role_name ILIKE '%clinical trial coordinator%' OR role_record.role_name ILIKE '%clinical trial disclosure%' OR role_record.role_name ILIKE '%clinical trial%' AND role_record.role_name ILIKE '%manager%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Clinical Operations%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%pharmacovigilance%' OR role_record.role_name ILIKE '%drug safety%' OR role_record.role_name ILIKE '%safety physician%' OR role_record.role_name ILIKE '%drug safety officer%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Pharmacovigilance%Drug Safety%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%portfolio%' OR role_record.role_name ILIKE '%project%' AND role_record.role_name ILIKE '%management%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Project%Portfolio%' LIMIT 1;
                END IF;
            END IF;
            
            -- Manufacturing & Supply Chain departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Manufacturing & Supply Chain' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%technical operation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Technical Operations%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%manufacturing%' AND (role_record.role_name ILIKE '%small molecule%' OR role_record.role_name ILIKE '%biotech%' OR role_record.role_name ILIKE '%supervisor%' OR role_record.role_name ILIKE '%director%') THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Manufacturing%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%quality assurance%' OR role_record.role_name ILIKE '%quality control%' OR role_record.role_name ILIKE '%qa%' OR role_record.role_name ILIKE '%qc%' OR role_record.role_name ILIKE '%vp quality%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Quality Assurance%Quality Control%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%supply chain%' OR role_record.role_name ILIKE '%logistics%' OR role_record.role_name ILIKE '%vp of supply chain%' OR role_record.role_name ILIKE '%director of supply chain%' OR role_record.role_name ILIKE '%director of logistics%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Supply Chain%Logistics%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%process engineering%' OR role_record.role_name ILIKE '%process development%' OR role_record.role_name ILIKE '%engineer%' AND role_record.role_name ILIKE '%process%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Process Engineering%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%external manufacturing%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%External Manufacturing%' LIMIT 1;
                END IF;
            END IF;
            
            -- Finance & Accounting departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Finance & Accounting' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%fp&a%' OR role_record.role_name ILIKE '%fpa%' OR role_record.role_name ILIKE '%financial planning%' OR role_record.role_name ILIKE '%analysis%' AND role_record.role_name ILIKE '%financial%' OR role_record.role_name ILIKE '%director of fp%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Financial Planning%Analysis%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%accounting%' OR role_record.role_name ILIKE '%gl%' OR role_record.role_name ILIKE '%ap%' OR role_record.role_name ILIKE '%ar%' OR role_record.role_name ILIKE '%accountant%' OR role_record.role_name ILIKE '%controller%' OR role_record.role_name ILIKE '%general accounting%' OR role_record.role_name ILIKE '%accounts payable%' OR role_record.role_name ILIKE '%staff accountant%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Accounting Operations%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%treasury%' OR role_record.role_name ILIKE '%cash%' OR role_record.role_name ILIKE '%vp treasury%' OR role_record.role_name ILIKE '%director treasury%' OR role_record.role_name ILIKE '%treasury manager%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Treasury%Cash%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%tax%' OR role_record.role_name ILIKE '%vp tax%' OR role_record.role_name ILIKE '%director tax%' OR role_record.role_name ILIKE '%tax manager%' OR role_record.role_name ILIKE '%tax analyst%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Tax%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%audit%' OR role_record.role_name ILIKE '%control%' OR role_record.role_name ILIKE '%sox%' OR role_record.role_name ILIKE '%internal audit%' OR role_record.role_name ILIKE '%internal control%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Internal Audit%Controls%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%business finance%' OR role_record.role_name ILIKE '%commercial finance%' OR role_record.role_name ILIKE '%clinical finance%' OR role_record.role_name ILIKE '%rd finance%' OR role_record.role_name ILIKE '%r&d finance%' OR role_record.role_name ILIKE '%manufacturing finance%' OR role_record.role_name ILIKE '%supply chain finance%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Business%Commercial Finance%' LIMIT 1;
                END IF;
            END IF;
            
            -- Human Resources departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Human Resources' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%talent%' OR role_record.role_name ILIKE '%recruitment%' OR role_record.role_name ILIKE '%recruiter%' OR role_record.role_name ILIKE '%talent acquisition%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Talent Acquisition%Recruitment%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%learning%' OR role_record.role_name ILIKE '%development%' AND (role_record.role_name ILIKE '%hr%' OR role_record.role_name ILIKE '%people%' OR role_record.role_name ILIKE '%talent%' OR role_record.role_name ILIKE '%l&d%') THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Learning%Development%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%compensation%' OR role_record.role_name ILIKE '%benefit%' OR role_record.role_name ILIKE '%reward%' OR role_record.role_name ILIKE '%comp & benefit%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Total Rewards%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%business partner%' OR role_record.role_name ILIKE '%hrbp%' OR role_record.role_name ILIKE '%hr business partner%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%HR Business Partners%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%organizational development%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Organizational Development%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%hr operation%' OR role_record.role_name ILIKE '%service%' AND role_record.role_name ILIKE '%hr%' OR role_record.role_name ILIKE '%people operation%' OR role_record.role_name ILIKE '%director of hr ops%' OR role_record.role_name ILIKE '%director of people ops%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%HR Operations%Services%' LIMIT 1;
                END IF;
            END IF;
            
            -- Information Technology (IT) / Digital departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Information Technology (IT) / Digital' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%enterprise%' OR role_record.role_name ILIKE '%erp%' OR role_record.role_name ILIKE '%sap%' OR role_record.role_name ILIKE '%director of enterprise%' OR role_record.role_name ILIKE '%financial system%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Enterprise Applications%ERP%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%data%' AND role_record.role_name ILIKE '%analytics%' OR role_record.role_name ILIKE '%data engineer%' OR role_record.role_name ILIKE '%data scientist%' OR role_record.role_name ILIKE '%director of data%' OR role_record.role_name ILIKE '%chief data%' OR role_record.role_name ILIKE '%ml engineer%' OR role_record.role_name ILIKE '%ai research%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Data%Analytics%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%digital health%' OR role_record.role_name ILIKE '%platform%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Digital Health%Platforms%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%infrastructure%' OR role_record.role_name ILIKE '%cloud%' OR role_record.role_name ILIKE '%devops%' OR role_record.role_name ILIKE '%sre%' OR role_record.role_name ILIKE '%site reliability%' OR role_record.role_name ILIKE '%director of it ops%' OR role_record.role_name ILIKE '%director of it operation%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%IT Infrastructure%Cloud%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%cybersecurity%' OR role_record.role_name ILIKE '%security%' AND (role_record.role_name ILIKE '%information%' OR role_record.role_name ILIKE '%cyber%' OR role_record.role_name ILIKE '%it%' OR role_record.role_name ILIKE '%chief security%' OR role_record.role_name ILIKE '%cso%' OR role_record.role_name ILIKE '%director of cybersecurity%' OR role_record.role_name ILIKE '%security engineer%' OR role_record.role_name ILIKE '%security lead%') THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Cybersecurity%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%end user%' OR role_record.role_name ILIKE '%support%' AND (role_record.role_name ILIKE '%technical%' OR role_record.role_name ILIKE '%it%' OR role_record.role_name ILIKE '%support specialist%' OR role_record.role_name ILIKE '%support engineer%' OR role_record.role_name ILIKE '%support lead%') THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%End User Services%Support%' LIMIT 1;
                END IF;
            END IF;
            
            -- Legal & Compliance departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Legal & Compliance' LIMIT 1) THEN
                IF (role_record.role_name ILIKE '%corporate legal%' OR role_record.role_name ILIKE '%legal%') AND NOT role_record.role_name ILIKE '%ip%' AND NOT role_record.role_name ILIKE '%intellectual property%' OR role_record.role_name ILIKE '%general counsel%' OR role_record.role_name ILIKE '%deputy general counsel%' OR role_record.role_name ILIKE '%legal counsel%' OR role_record.role_name ILIKE '%legal associate%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Corporate Legal%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%ip%' OR role_record.role_name ILIKE '%intellectual property%' OR role_record.role_name ILIKE '%patent%' OR role_record.role_name ILIKE '%director of ip%' OR role_record.role_name ILIKE '%vp of ip%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Intellectual Property%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%contract%' AND NOT role_record.role_name ILIKE '%data use%' OR role_record.role_name ILIKE '%contract manager%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Contract Management%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%regulatory%' AND role_record.role_name ILIKE '%compliance%' OR role_record.role_name ILIKE '%ethics%' AND role_record.role_name ILIKE '%compliance%' OR role_record.role_name ILIKE '%compliance director%' OR role_record.role_name ILIKE '%compliance manager%' OR role_record.role_name ILIKE '%compliance officer%' OR role_record.role_name ILIKE '%compliance specialist%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Regulatory%Ethics Compliance%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%privacy%' OR role_record.role_name ILIKE '%data protection%' OR role_record.role_name ILIKE '%data privacy%' OR role_record.role_name ILIKE '%chief privacy%' OR role_record.role_name ILIKE '%privacy officer%' OR role_record.role_name ILIKE '%privacy manager%' OR role_record.role_name ILIKE '%data protection officer%' OR role_record.role_name ILIKE '%director of privacy%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Privacy%Data Protection%' LIMIT 1;
                END IF;
            END IF;
            
            -- Corporate Communications departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Corporate Communications' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%external%' OR role_record.role_name ILIKE '%pr%' OR role_record.role_name ILIKE '%public relation%' OR role_record.role_name ILIKE '%pr manager%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%External Communications%PR%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%internal%' AND role_record.role_name ILIKE '%communication%' THEN
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
                IF role_record.role_name ILIKE '%corporate strategy%' OR role_record.role_name ILIKE '%strategic planning%' AND NOT role_record.role_name ILIKE '%finance%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Corporate Strategy%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%business development%' OR role_record.role_name ILIKE '%portfolio%' AND role_record.role_name ILIKE '%development%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Business%Portfolio Development%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%m&a%' OR role_record.role_name ILIKE '%merger%' OR role_record.role_name ILIKE '%acquisition%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Mergers%Acquisitions%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%pmo%' OR role_record.role_name ILIKE '%project management office%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Project Management Office%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%foresight%' OR role_record.role_name ILIKE '%transformation%' AND NOT role_record.role_name ILIKE '%commercial%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Foresight%Transformation%' LIMIT 1;
                END IF;
            END IF;
            
            -- Business Intelligence / Analytics departments
            IF matched_function_id = (SELECT id FROM public.org_functions WHERE tenant_id = pharma_tenant_id AND name::text = 'Business Intelligence / Analytics' LIMIT 1) THEN
                IF role_record.role_name ILIKE '%market insight%' OR role_record.role_name ILIKE '%research%' AND role_record.role_name ILIKE '%market%' THEN
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
                ELSIF role_record.role_name ILIKE '%ehs%' OR role_record.role_name ILIKE '%environmental health%' OR role_record.role_name ILIKE '%safety%' AND (role_record.role_name ILIKE '%environmental%' OR role_record.role_name ILIKE '%facility%') THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Environmental Health%Safety%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%facility operation%' OR role_record.role_name ILIKE '%maintenance%' THEN
                    SELECT id INTO matched_department_id FROM public.org_departments 
                    WHERE tenant_id = pharma_tenant_id AND name ILIKE '%Facility Operations%Maintenance%' LIMIT 1;
                ELSIF role_record.role_name ILIKE '%security%' OR role_record.role_name ILIKE '%emergency%' AND (role_record.role_name ILIKE '%facility%' OR role_record.role_name ILIKE '%emergency planning%') THEN
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
    RAISE NOTICE '✅ Enhanced role mapping complete';
END $$;

COMMIT;

