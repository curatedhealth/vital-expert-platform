-- =====================================================================
-- POPULATE ROLES FOR DIGITAL HEALTH ORG TENANT
-- Creates roles for all departments in the Digital Health tenant
-- =====================================================================
-- Digital Health Tenant ID: 684f6c2c-b50d-4726-ad92-c76c3b785a89
-- =====================================================================

BEGIN;

DO $$
DECLARE
    digital_health_tenant_id uuid := '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid;
    dept_id uuid;
    func_id uuid;
    role_count INTEGER := 0;
    dept_record RECORD;
    role_record RECORD;
BEGIN
    RAISE NOTICE 'Digital Health Tenant ID: %', digital_health_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '=== POPULATING ROLES FOR DIGITAL HEALTH ===';
    RAISE NOTICE '';

    -- =====================================================================
    -- FUNCTION 1: Digital Health Strategy & Innovation
    -- =====================================================================
    
    -- Department: Digital Foresight & R&D
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Foresight & R&D';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Digital Foresight & R&D', 'Director', 'Lead digital health innovation and R&D strategy', 'Executive'),
                ('Senior Manager, Digital Innovation', 'Senior Manager', 'Manage digital health innovation projects', 'Senior'),
                ('Digital Health Strategist', 'Strategist', 'Develop digital health strategies and roadmaps', 'Mid'),
                ('R&D Analyst', 'Analyst', 'Research and analyze digital health trends', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id,
                function_id,
                department_id,
                name,
                slug,
                description,
                seniority_level,
                is_active,
                created_at,
                updated_at
            )
            VALUES (
                digital_health_tenant_id,
                func_id,
                dept_id,
                role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description,
                role_record.seniority,
                true,
                NOW(),
                NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level,
                is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Foresight & R&D: 4 roles';
    END IF;

    -- Department: Digital Product Strategy
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Product Strategy';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('VP, Digital Product Strategy', 'VP', 'Lead digital product strategy and vision', 'Executive'),
                ('Director, Product Strategy', 'Director', 'Develop and execute product strategies', 'Executive'),
                ('Senior Product Strategist', 'Senior Strategist', 'Define product roadmaps and priorities', 'Senior'),
                ('Product Strategy Analyst', 'Analyst', 'Support product strategy development', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Product Strategy: 4 roles';
    END IF;

    -- Department: Partnership & Ecosystem Development
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Partnership & Ecosystem Development';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Partnerships & Ecosystem', 'Director', 'Lead partnership strategy and ecosystem development', 'Executive'),
                ('Senior Manager, Strategic Partnerships', 'Senior Manager', 'Develop and manage strategic partnerships', 'Senior'),
                ('Partnership Manager', 'Manager', 'Manage partner relationships and agreements', 'Mid'),
                ('Ecosystem Development Coordinator', 'Coordinator', 'Support ecosystem development activities', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Partnership & Ecosystem Development: 4 roles';
    END IF;

    -- Department: Digital Transformation Office
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Transformation Office';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Chief Digital Transformation Officer', 'CDTO', 'Lead digital transformation initiatives', 'Executive'),
                ('Director, Digital Transformation', 'Director', 'Drive digital transformation programs', 'Executive'),
                ('Senior Transformation Manager', 'Senior Manager', 'Manage transformation projects', 'Senior'),
                ('Transformation Analyst', 'Analyst', 'Support transformation initiatives', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Transformation Office: 4 roles';
    END IF;

    -- =====================================================================
    -- FUNCTION 2: Digital Platforms & Solutions
    -- =====================================================================
    
    -- Department: Virtual Care & Telehealth
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Virtual Care & Telehealth';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('VP, Virtual Care & Telehealth', 'VP', 'Lead virtual care platform strategy', 'Executive'),
                ('Director, Telehealth Solutions', 'Director', 'Develop telehealth solutions and services', 'Executive'),
                ('Senior Product Manager, Virtual Care', 'Senior PM', 'Manage virtual care product development', 'Senior'),
                ('Telehealth Platform Engineer', 'Engineer', 'Develop and maintain telehealth platforms', 'Mid'),
                ('Virtual Care Coordinator', 'Coordinator', 'Support virtual care operations', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Virtual Care & Telehealth: 5 roles';
    END IF;

    -- Department: Remote Patient Monitoring (RPM)
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Remote Patient Monitoring (RPM)';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Remote Patient Monitoring', 'Director', 'Lead RPM platform development', 'Executive'),
                ('Senior Manager, RPM Solutions', 'Senior Manager', 'Manage RPM solution development', 'Senior'),
                ('RPM Product Manager', 'PM', 'Manage RPM product features and roadmap', 'Mid'),
                ('RPM Clinical Specialist', 'Specialist', 'Provide clinical expertise for RPM', 'Mid'),
                ('RPM Data Analyst', 'Analyst', 'Analyze RPM data and outcomes', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Remote Patient Monitoring (RPM): 5 roles';
    END IF;

    -- Department: Digital Therapeutics (DTx)
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Therapeutics (DTx)';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('VP, Digital Therapeutics', 'VP', 'Lead DTx product development and strategy', 'Executive'),
                ('Director, DTx Development', 'Director', 'Oversee DTx product development', 'Executive'),
                ('Senior DTx Product Manager', 'Senior PM', 'Manage DTx product lifecycle', 'Senior'),
                ('DTx Clinical Scientist', 'Clinical Scientist', 'Provide clinical science for DTx', 'Senior'),
                ('DTx Software Engineer', 'Engineer', 'Develop DTx software solutions', 'Mid'),
                ('DTx UX Designer', 'Designer', 'Design DTx user experiences', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Therapeutics (DTx): 6 roles';
    END IF;

    -- Department: Engagement & Behavior Change Platforms
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Engagement & Behavior Change Platforms';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Engagement Platforms', 'Director', 'Lead engagement platform strategy', 'Executive'),
                ('Senior Manager, Behavior Change', 'Senior Manager', 'Manage behavior change programs', 'Senior'),
                ('Behavioral Scientist', 'Scientist', 'Design behavior change interventions', 'Mid'),
                ('Engagement Platform Engineer', 'Engineer', 'Develop engagement platforms', 'Mid'),
                ('Engagement Analyst', 'Analyst', 'Analyze user engagement metrics', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Engagement & Behavior Change Platforms: 5 roles';
    END IF;

    -- Department: Mobile Health (mHealth) Apps
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Mobile Health (mHealth) Apps';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, mHealth Apps', 'Director', 'Lead mobile health app development', 'Executive'),
                ('Senior Product Manager, mHealth', 'Senior PM', 'Manage mHealth app products', 'Senior'),
                ('Mobile App Developer', 'Developer', 'Develop mobile health applications', 'Mid'),
                ('mHealth UX/UI Designer', 'Designer', 'Design mobile health app interfaces', 'Mid'),
                ('mHealth QA Engineer', 'QA Engineer', 'Test mobile health applications', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Mobile Health (mHealth) Apps: 5 roles';
    END IF;

    -- Department: Connected Devices & Wearables
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Connected Devices & Wearables';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Connected Devices', 'Director', 'Lead connected device strategy', 'Executive'),
                ('Senior Manager, Wearables', 'Senior Manager', 'Manage wearables product development', 'Senior'),
                ('IoT Engineer', 'Engineer', 'Develop IoT and connected device solutions', 'Mid'),
                ('Wearables Product Manager', 'PM', 'Manage wearables product features', 'Mid'),
                ('Device Integration Specialist', 'Specialist', 'Integrate devices with platforms', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Connected Devices & Wearables: 5 roles';
    END IF;

    -- =====================================================================
    -- FUNCTION 3: Data Science & Analytics
    -- =====================================================================
    
    -- Department: Digital Biomarkers & Real-World Data
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Biomarkers & Real-World Data';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Digital Biomarkers', 'Director', 'Lead digital biomarker research', 'Executive'),
                ('Senior Data Scientist, Biomarkers', 'Senior Data Scientist', 'Develop digital biomarker algorithms', 'Senior'),
                ('Real-World Data Analyst', 'Analyst', 'Analyze real-world health data', 'Mid'),
                ('Biomarker Validation Scientist', 'Scientist', 'Validate digital biomarkers', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Biomarkers & Real-World Data: 4 roles';
    END IF;

    -- Department: AI/ML & Predictive Analytics
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'AI/ML & Predictive Analytics';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('VP, AI/ML', 'VP', 'Lead AI/ML strategy and development', 'Executive'),
                ('Director, Machine Learning', 'Director', 'Oversee ML model development', 'Executive'),
                ('Senior ML Engineer', 'Senior Engineer', 'Develop ML models for health', 'Senior'),
                ('ML Scientist', 'Scientist', 'Research and develop ML algorithms', 'Mid'),
                ('Data Engineer, ML', 'Data Engineer', 'Build ML data pipelines', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ AI/ML & Predictive Analytics: 5 roles';
    END IF;

    -- Department: Digital Evidence Generation
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Evidence Generation';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Digital Evidence', 'Director', 'Lead digital evidence generation', 'Executive'),
                ('Senior Evidence Scientist', 'Senior Scientist', 'Design evidence generation studies', 'Senior'),
                ('Evidence Analyst', 'Analyst', 'Analyze digital health evidence', 'Mid'),
                ('Clinical Data Manager', 'Data Manager', 'Manage clinical data for evidence', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Evidence Generation: 4 roles';
    END IF;

    -- Department: Data Engineering & Architecture
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Data Engineering & Architecture';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Data Engineering', 'Director', 'Lead data engineering and architecture', 'Executive'),
                ('Senior Data Architect', 'Senior Architect', 'Design data architectures', 'Senior'),
                ('Data Engineer', 'Engineer', 'Build data pipelines and systems', 'Mid'),
                ('Data Platform Engineer', 'Platform Engineer', 'Maintain data platforms', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Data Engineering & Architecture: 4 roles';
    END IF;

    -- Department: Health Outcomes Analytics
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Health Outcomes Analytics';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Health Outcomes', 'Director', 'Lead health outcomes analytics', 'Executive'),
                ('Senior Outcomes Analyst', 'Senior Analyst', 'Analyze health outcomes data', 'Senior'),
                ('HEOR Analyst', 'Analyst', 'Perform health economics outcomes research', 'Mid'),
                ('Outcomes Data Scientist', 'Data Scientist', 'Model health outcomes', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Health Outcomes Analytics: 4 roles';
    END IF;

    -- =====================================================================
    -- FUNCTION 4: Digital Clinical Development
    -- =====================================================================
    
    -- Department: Decentralized Clinical Trials (DCT)
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Decentralized Clinical Trials (DCT)';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, DCT', 'Director', 'Lead decentralized clinical trials', 'Executive'),
                ('Senior DCT Manager', 'Senior Manager', 'Manage DCT operations', 'Senior'),
                ('DCT Clinical Coordinator', 'Coordinator', 'Coordinate DCT activities', 'Mid'),
                ('DCT Technology Specialist', 'Specialist', 'Support DCT technology platforms', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Decentralized Clinical Trials (DCT): 4 roles';
    END IF;

    -- Department: eConsent & ePRO/eCOA
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'eConsent & ePRO/eCOA';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, eConsent & ePRO', 'Director', 'Lead eConsent and ePRO solutions', 'Executive'),
                ('Senior ePRO Manager', 'Senior Manager', 'Manage ePRO platform development', 'Senior'),
                ('eConsent Specialist', 'Specialist', 'Develop eConsent solutions', 'Mid'),
                ('eCOA Analyst', 'Analyst', 'Support eCOA implementation', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ eConsent & ePRO/eCOA: 4 roles';
    END IF;

    -- Department: Site & Patient Digital Enablement
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Site & Patient Digital Enablement';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Digital Enablement', 'Director', 'Lead digital enablement programs', 'Executive'),
                ('Senior Enablement Manager', 'Senior Manager', 'Manage enablement initiatives', 'Senior'),
                ('Patient Enablement Specialist', 'Specialist', 'Enable patients with digital tools', 'Mid'),
                ('Site Enablement Coordinator', 'Coordinator', 'Support site digital enablement', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Site & Patient Digital Enablement: 4 roles';
    END IF;

    -- Department: Digital Protocol Design
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Protocol Design';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Protocol Design', 'Director', 'Lead digital protocol design', 'Executive'),
                ('Senior Protocol Designer', 'Senior Designer', 'Design digital clinical protocols', 'Senior'),
                ('Protocol Design Specialist', 'Specialist', 'Develop protocol designs', 'Mid'),
                ('Digital Protocol Analyst', 'Analyst', 'Support protocol design activities', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Protocol Design: 4 roles';
    END IF;

    -- =====================================================================
    -- FUNCTION 5: Patient & Provider Experience
    -- =====================================================================
    
    -- Department: UX/UI Design & Research
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'UX/UI Design & Research';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, UX/UI Design', 'Director', 'Lead UX/UI design strategy', 'Executive'),
                ('Senior UX Designer', 'Senior Designer', 'Design user experiences', 'Senior'),
                ('UI Designer', 'Designer', 'Design user interfaces', 'Mid'),
                ('UX Researcher', 'Researcher', 'Conduct UX research', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ UX/UI Design & Research: 4 roles';
    END IF;

    -- Department: Digital Patient Support Programs
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Patient Support Programs';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Patient Support', 'Director', 'Lead patient support programs', 'Executive'),
                ('Senior Manager, Support Programs', 'Senior Manager', 'Manage support programs', 'Senior'),
                ('Patient Support Specialist', 'Specialist', 'Deliver patient support services', 'Mid'),
                ('Support Program Coordinator', 'Coordinator', 'Coordinate support activities', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Patient Support Programs: 4 roles';
    END IF;

    -- Department: Omnichannel Engagement
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Omnichannel Engagement';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Omnichannel', 'Director', 'Lead omnichannel engagement strategy', 'Executive'),
                ('Senior Manager, Engagement', 'Senior Manager', 'Manage engagement channels', 'Senior'),
                ('Engagement Specialist', 'Specialist', 'Execute engagement campaigns', 'Mid'),
                ('Channel Coordinator', 'Coordinator', 'Coordinate channel activities', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Omnichannel Engagement: 4 roles';
    END IF;

    -- Department: Digital Medical Education
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Medical Education';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Medical Education', 'Director', 'Lead medical education programs', 'Executive'),
                ('Senior Medical Education Manager', 'Senior Manager', 'Manage education content', 'Senior'),
                ('Medical Education Specialist', 'Specialist', 'Develop education materials', 'Mid'),
                ('Education Content Coordinator', 'Coordinator', 'Coordinate education content', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Medical Education: 4 roles';
    END IF;

    -- Department: Digital Health Literacy
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Health Literacy';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Health Literacy', 'Director', 'Lead health literacy initiatives', 'Executive'),
                ('Senior Literacy Manager', 'Senior Manager', 'Manage literacy programs', 'Senior'),
                ('Health Literacy Specialist', 'Specialist', 'Develop literacy content', 'Mid'),
                ('Literacy Program Coordinator', 'Coordinator', 'Coordinate literacy activities', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Health Literacy: 4 roles';
    END IF;

    -- =====================================================================
    -- FUNCTION 6: Regulatory, Quality & Compliance
    -- =====================================================================
    
    -- Department: Digital Health Regulatory Affairs
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Health Regulatory Affairs';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('VP, Regulatory Affairs', 'VP', 'Lead regulatory strategy and submissions', 'Executive'),
                ('Director, Digital Health Regulatory', 'Director', 'Oversee regulatory activities', 'Executive'),
                ('Senior Regulatory Manager', 'Senior Manager', 'Manage regulatory submissions', 'Senior'),
                ('Regulatory Affairs Specialist', 'Specialist', 'Prepare regulatory documents', 'Mid'),
                ('Regulatory Coordinator', 'Coordinator', 'Support regulatory activities', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Health Regulatory Affairs: 5 roles';
    END IF;

    -- Department: Medical Device/Software QA & QMS
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Medical Device/Software QA & QMS';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, QA & QMS', 'Director', 'Lead quality assurance and QMS', 'Executive'),
                ('Senior QA Manager', 'Senior Manager', 'Manage QA processes', 'Senior'),
                ('QA Engineer', 'Engineer', 'Perform quality assurance testing', 'Mid'),
                ('QMS Specialist', 'Specialist', 'Maintain quality management systems', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Medical Device/Software QA & QMS: 4 roles';
    END IF;

    -- Department: Data Privacy & Digital Ethics
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Data Privacy & Digital Ethics';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Privacy & Ethics', 'Director', 'Lead privacy and ethics programs', 'Executive'),
                ('Senior Privacy Manager', 'Senior Manager', 'Manage privacy compliance', 'Senior'),
                ('Privacy Specialist', 'Specialist', 'Ensure privacy compliance', 'Mid'),
                ('Ethics Coordinator', 'Coordinator', 'Support ethics initiatives', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Data Privacy & Digital Ethics: 4 roles';
    END IF;

    -- Department: Cybersecurity for Health
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Cybersecurity for Health';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Cybersecurity', 'Director', 'Lead cybersecurity strategy', 'Executive'),
                ('Senior Security Engineer', 'Senior Engineer', 'Design security solutions', 'Senior'),
                ('Security Analyst', 'Analyst', 'Monitor and analyze security threats', 'Mid'),
                ('Security Operations Specialist', 'Specialist', 'Manage security operations', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Cybersecurity for Health: 4 roles';
    END IF;

    -- Department: Digital Risk Management
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Risk Management';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Risk Management', 'Director', 'Lead risk management programs', 'Executive'),
                ('Senior Risk Manager', 'Senior Manager', 'Manage risk assessments', 'Senior'),
                ('Risk Analyst', 'Analyst', 'Analyze and assess risks', 'Mid'),
                ('Risk Coordinator', 'Coordinator', 'Support risk management activities', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Risk Management: 4 roles';
    END IF;

    -- =====================================================================
    -- FUNCTION 7: Commercialization & Market Access
    -- =====================================================================
    
    -- Department: Digital Go-to-Market Strategy
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Go-to-Market Strategy';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('VP, Go-to-Market', 'VP', 'Lead go-to-market strategy', 'Executive'),
                ('Director, GTM Strategy', 'Director', 'Develop GTM strategies', 'Executive'),
                ('Senior GTM Manager', 'Senior Manager', 'Execute GTM plans', 'Senior'),
                ('GTM Analyst', 'Analyst', 'Support GTM activities', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Go-to-Market Strategy: 4 roles';
    END IF;

    -- Department: Digital Health Business Development
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Health Business Development';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('VP, Business Development', 'VP', 'Lead business development', 'Executive'),
                ('Director, BD', 'Director', 'Develop business opportunities', 'Executive'),
                ('Senior BD Manager', 'Senior Manager', 'Manage BD activities', 'Senior'),
                ('BD Analyst', 'Analyst', 'Support BD initiatives', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Health Business Development: 4 roles';
    END IF;

    -- Department: Payer & Reimbursement Strategy
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Payer & Reimbursement Strategy';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Payer Strategy', 'Director', 'Lead payer and reimbursement strategy', 'Executive'),
                ('Senior Payer Manager', 'Senior Manager', 'Manage payer relationships', 'Senior'),
                ('Reimbursement Specialist', 'Specialist', 'Develop reimbursement strategies', 'Mid'),
                ('Payer Analyst', 'Analyst', 'Analyze payer markets', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Payer & Reimbursement Strategy: 4 roles';
    END IF;

    -- Department: Real-World Value Demonstration
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Real-World Value Demonstration';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Value Demonstration', 'Director', 'Lead value demonstration programs', 'Executive'),
                ('Senior Value Manager', 'Senior Manager', 'Manage value studies', 'Senior'),
                ('Value Analyst', 'Analyst', 'Analyze value data', 'Mid'),
                ('Value Coordinator', 'Coordinator', 'Support value activities', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Real-World Value Demonstration: 4 roles';
    END IF;

    -- Department: Digital Adoption & Implementation
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Adoption & Implementation';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Adoption & Implementation', 'Director', 'Lead adoption and implementation', 'Executive'),
                ('Senior Implementation Manager', 'Senior Manager', 'Manage implementation projects', 'Senior'),
                ('Adoption Specialist', 'Specialist', 'Drive user adoption', 'Mid'),
                ('Implementation Coordinator', 'Coordinator', 'Support implementation activities', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Adoption & Implementation: 4 roles';
    END IF;

    -- =====================================================================
    -- FUNCTION 8: Technology & IT Infrastructure
    -- =====================================================================
    
    -- Department: Cloud Platforms & SaaS Ops
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Cloud Platforms & SaaS Ops';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Cloud Platforms', 'Director', 'Lead cloud platform strategy', 'Executive'),
                ('Senior Cloud Architect', 'Senior Architect', 'Design cloud architectures', 'Senior'),
                ('Cloud Engineer', 'Engineer', 'Build and maintain cloud infrastructure', 'Mid'),
                ('SaaS Operations Specialist', 'Specialist', 'Manage SaaS operations', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Cloud Platforms & SaaS Ops: 4 roles';
    END IF;

    -- Department: Interoperability & API Management
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Interoperability & API Management';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Interoperability', 'Director', 'Lead interoperability strategy', 'Executive'),
                ('Senior API Architect', 'Senior Architect', 'Design API architectures', 'Senior'),
                ('API Engineer', 'Engineer', 'Develop and maintain APIs', 'Mid'),
                ('Interoperability Specialist', 'Specialist', 'Ensure system interoperability', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Interoperability & API Management: 4 roles';
    END IF;

    -- Department: DevOps & Agile Delivery
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'DevOps & Agile Delivery';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, DevOps', 'Director', 'Lead DevOps and delivery strategy', 'Executive'),
                ('Senior DevOps Engineer', 'Senior Engineer', 'Design DevOps pipelines', 'Senior'),
                ('DevOps Engineer', 'Engineer', 'Build and maintain CI/CD pipelines', 'Mid'),
                ('Agile Coach', 'Coach', 'Coach agile delivery practices', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ DevOps & Agile Delivery: 4 roles';
    END IF;

    -- Department: Data Integration & Exchange (FHIR, HL7)
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Data Integration & Exchange (FHIR, HL7)';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Data Integration', 'Director', 'Lead data integration strategy', 'Executive'),
                ('Senior Integration Engineer', 'Senior Engineer', 'Design integration solutions', 'Senior'),
                ('FHIR Specialist', 'Specialist', 'Implement FHIR standards', 'Mid'),
                ('HL7 Integration Engineer', 'Engineer', 'Develop HL7 integrations', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Data Integration & Exchange (FHIR, HL7): 4 roles';
    END IF;

    -- Department: Support & Digital Workplace Services
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Support & Digital Workplace Services';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Support Services', 'Director', 'Lead support and workplace services', 'Executive'),
                ('Senior Support Manager', 'Senior Manager', 'Manage support operations', 'Senior'),
                ('Support Specialist', 'Specialist', 'Provide technical support', 'Mid'),
                ('Workplace Services Coordinator', 'Coordinator', 'Coordinate workplace services', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Support & Digital Workplace Services: 4 roles';
    END IF;

    -- =====================================================================
    -- FUNCTION 9: Legal & IP for Digital
    -- =====================================================================
    
    -- Department: Digital Health Law
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Health Law';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('General Counsel, Digital Health', 'General Counsel', 'Lead legal strategy for digital health', 'Executive'),
                ('Director, Digital Health Law', 'Director', 'Oversee digital health legal matters', 'Executive'),
                ('Senior Legal Counsel', 'Senior Counsel', 'Provide legal guidance', 'Senior'),
                ('Legal Associate', 'Associate', 'Support legal activities', 'Mid')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Health Law: 4 roles';
    END IF;

    -- Department: Software Licensing & IP
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Software Licensing & IP';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, IP & Licensing', 'Director', 'Lead IP and licensing strategy', 'Executive'),
                ('Senior IP Counsel', 'Senior Counsel', 'Manage IP portfolio', 'Senior'),
                ('Licensing Specialist', 'Specialist', 'Manage software licenses', 'Mid'),
                ('IP Coordinator', 'Coordinator', 'Support IP activities', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Software Licensing & IP: 4 roles';
    END IF;

    -- Department: Digital Contracts & Data Use Agreements
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Contracts & Data Use Agreements';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Contracts', 'Director', 'Lead contract management', 'Executive'),
                ('Senior Contract Manager', 'Senior Manager', 'Manage digital contracts', 'Senior'),
                ('Contract Specialist', 'Specialist', 'Draft and review contracts', 'Mid'),
                ('Data Agreement Coordinator', 'Coordinator', 'Support data use agreements', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Digital Contracts & Data Use Agreements: 4 roles';
    END IF;

    -- Department: Regulatory Watch & Digital Policy
    SELECT id INTO dept_id FROM org_departments 
    WHERE tenant_id = digital_health_tenant_id AND name = 'Regulatory Watch & Digital Policy';
    
    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;
        
        FOR role_record IN
            SELECT * FROM (VALUES
                ('Director, Policy & Regulatory Watch', 'Director', 'Lead policy and regulatory monitoring', 'Executive'),
                ('Senior Policy Analyst', 'Senior Analyst', 'Analyze regulatory policies', 'Senior'),
                ('Regulatory Watch Specialist', 'Specialist', 'Monitor regulatory changes', 'Mid'),
                ('Policy Coordinator', 'Coordinator', 'Support policy activities', 'Entry')
            ) AS r(role_name, role_title, description, seniority)
        LOOP
            INSERT INTO org_roles (
                tenant_id, function_id, department_id, name, slug, description, seniority_level, is_active, created_at, updated_at
            )
            VALUES (
                digital_health_tenant_id, func_id, dept_id, role_record.role_name,
                lower(regexp_replace(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g')),
                role_record.description, role_record.seniority, true, NOW(), NOW()
            )
            ON CONFLICT (tenant_id, slug) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description,
                seniority_level = EXCLUDED.seniority_level, is_active = true;
            role_count := role_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Regulatory Watch & Digital Policy: 4 roles';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Total roles created/updated: %', role_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Digital Health roles populated successfully';
    
END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION QUERY
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

