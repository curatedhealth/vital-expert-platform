-- =====================================================================
-- POPULATE ROLES FOR DIGITAL HEALTH FROM JSON DATA
-- Generated from DIGITAL_HEALTH_ROLE_SCOPE_NORMALIZED.json
-- =====================================================================

BEGIN;

DO $$
DECLARE
    digital_health_tenant_id uuid;
    dept_id uuid;
    func_id uuid;
    role_count INTEGER := 0;
BEGIN
    -- Get Digital Health tenant ID dynamically
    SELECT id INTO digital_health_tenant_id
    FROM tenants
    WHERE slug ILIKE '%digital%health%'
       OR slug ILIKE '%digital-health%'
       OR name ILIKE '%digital health%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF digital_health_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Digital Health tenant not found. Please create the tenant first.';
    END IF;
    
    RAISE NOTICE 'Digital Health Tenant ID: %', digital_health_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '=== POPULATING ROLES FROM JSON DATA ===';
    RAISE NOTICE '';

    -- =====================================================================
    -- FUNCTION: Commercialization & Market Access
    -- =====================================================================

    -- Department: Digital Adoption & Implementation
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Adoption & Implementation';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Adoption Specialist Digital Health (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Adoption Specialist Digital Health (Global)',
            'adoption-specialist-digital-health-global',
            'Adoption Specialist Digital Health role with global scope in Digital Adoption & Implementation',
            'Entry',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Adoption Specialist Digital Health (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Adoption Specialist Digital Health (Local)',
            'adoption-specialist-digital-health-local',
            'Adoption Specialist Digital Health role with local scope in Digital Adoption & Implementation',
            'Entry',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Adoption Specialist Digital Health (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Adoption Specialist Digital Health (Regional)',
            'adoption-specialist-digital-health-regional',
            'Adoption Specialist Digital Health role with regional scope in Digital Adoption & Implementation',
            'Entry',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Go-to-Market Strategy
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Go-to-Market Strategy';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital GTM Director (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital GTM Director (Global)',
            'digital-gtm-director-global',
            'Digital GTM Director role with global scope in Digital Go-to-Market Strategy',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital GTM Director (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital GTM Director (Local)',
            'digital-gtm-director-local',
            'Digital GTM Director role with local scope in Digital Go-to-Market Strategy',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital GTM Director (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital GTM Director (Regional)',
            'digital-gtm-director-regional',
            'Digital GTM Director role with regional scope in Digital Go-to-Market Strategy',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Health Business Development
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Health Business Development';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital BD Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital BD Manager (Global)',
            'digital-bd-manager-global',
            'Digital BD Manager role with global scope in Digital Health Business Development',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital BD Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital BD Manager (Local)',
            'digital-bd-manager-local',
            'Digital BD Manager role with local scope in Digital Health Business Development',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital BD Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital BD Manager (Regional)',
            'digital-bd-manager-regional',
            'Digital BD Manager role with regional scope in Digital Health Business Development',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Payer & Reimbursement Strategy
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Payer & Reimbursement Strategy';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Payer Access Digital Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Payer Access Digital Lead (Global)',
            'payer-access-digital-lead-global',
            'Payer Access Digital Lead role with global scope in Payer & Reimbursement Strategy',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Payer Access Digital Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Payer Access Digital Lead (Local)',
            'payer-access-digital-lead-local',
            'Payer Access Digital Lead role with local scope in Payer & Reimbursement Strategy',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Payer Access Digital Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Payer Access Digital Lead (Regional)',
            'payer-access-digital-lead-regional',
            'Payer Access Digital Lead role with regional scope in Payer & Reimbursement Strategy',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Real-World Value Demonstration
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Real-World Value Demonstration';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Value Evidence Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Value Evidence Lead (Global)',
            'digital-value-evidence-lead-global',
            'Digital Value Evidence Lead role with global scope in Real-World Value Demonstration',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Value Evidence Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Value Evidence Lead (Local)',
            'digital-value-evidence-lead-local',
            'Digital Value Evidence Lead role with local scope in Real-World Value Demonstration',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Value Evidence Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Value Evidence Lead (Regional)',
            'digital-value-evidence-lead-regional',
            'Digital Value Evidence Lead role with regional scope in Real-World Value Demonstration',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;


    -- =====================================================================
    -- FUNCTION: Data Science & Analytics
    -- =====================================================================

    END IF;

    -- Department: AI/ML & Predictive Analytics
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'AI/ML & Predictive Analytics';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- AI Product Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'AI Product Manager (Global)',
            'ai-product-manager-global',
            'AI Product Manager role with global scope in AI/ML & Predictive Analytics',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- AI Product Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'AI Product Manager (Local)',
            'ai-product-manager-local',
            'AI Product Manager role with local scope in AI/ML & Predictive Analytics',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- AI Product Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'AI Product Manager (Regional)',
            'ai-product-manager-regional',
            'AI Product Manager role with regional scope in AI/ML & Predictive Analytics',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Medical Data Scientist (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Medical Data Scientist (Global)',
            'medical-data-scientist-global',
            'Medical Data Scientist role with global scope in AI/ML & Predictive Analytics',
            'Mid',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Medical Data Scientist (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Medical Data Scientist (Local)',
            'medical-data-scientist-local',
            'Medical Data Scientist role with local scope in AI/ML & Predictive Analytics',
            'Mid',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Medical Data Scientist (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Medical Data Scientist (Regional)',
            'medical-data-scientist-regional',
            'Medical Data Scientist role with regional scope in AI/ML & Predictive Analytics',
            'Mid',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Data Engineering & Architecture
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Data Engineering & Architecture';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Data Architect (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Data Architect (Global)',
            'data-architect-global',
            'Data Architect role with global scope in Data Engineering & Architecture',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Data Architect (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Data Architect (Local)',
            'data-architect-local',
            'Data Architect role with local scope in Data Engineering & Architecture',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Data Architect (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Data Architect (Regional)',
            'data-architect-regional',
            'Data Architect role with regional scope in Data Engineering & Architecture',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Biomarkers & Real-World Data
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Biomarkers & Real-World Data';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Biomarker Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Biomarker Lead (Global)',
            'digital-biomarker-lead-global',
            'Digital Biomarker Lead role with global scope in Digital Biomarkers & Real-World Data',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Biomarker Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Biomarker Lead (Local)',
            'digital-biomarker-lead-local',
            'Digital Biomarker Lead role with local scope in Digital Biomarkers & Real-World Data',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Biomarker Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Biomarker Lead (Regional)',
            'digital-biomarker-lead-regional',
            'Digital Biomarker Lead role with regional scope in Digital Biomarkers & Real-World Data',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- RWD Scientist (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'RWD Scientist (Global)',
            'rwd-scientist-global',
            'RWD Scientist role with global scope in Digital Biomarkers & Real-World Data',
            'Mid',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- RWD Scientist (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'RWD Scientist (Local)',
            'rwd-scientist-local',
            'RWD Scientist role with local scope in Digital Biomarkers & Real-World Data',
            'Mid',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- RWD Scientist (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'RWD Scientist (Regional)',
            'rwd-scientist-regional',
            'RWD Scientist role with regional scope in Digital Biomarkers & Real-World Data',
            'Mid',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Evidence Generation
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Evidence Generation';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Evidence Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Evidence Lead (Global)',
            'digital-evidence-lead-global',
            'Digital Evidence Lead role with global scope in Digital Evidence Generation',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Evidence Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Evidence Lead (Local)',
            'digital-evidence-lead-local',
            'Digital Evidence Lead role with local scope in Digital Evidence Generation',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Evidence Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Evidence Lead (Regional)',
            'digital-evidence-lead-regional',
            'Digital Evidence Lead role with regional scope in Digital Evidence Generation',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Health Outcomes Analytics
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Health Outcomes Analytics';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Outcomes Analytics Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Outcomes Analytics Manager (Global)',
            'outcomes-analytics-manager-global',
            'Outcomes Analytics Manager role with global scope in Health Outcomes Analytics',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Outcomes Analytics Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Outcomes Analytics Manager (Local)',
            'outcomes-analytics-manager-local',
            'Outcomes Analytics Manager role with local scope in Health Outcomes Analytics',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Outcomes Analytics Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Outcomes Analytics Manager (Regional)',
            'outcomes-analytics-manager-regional',
            'Outcomes Analytics Manager role with regional scope in Health Outcomes Analytics',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;


    -- =====================================================================
    -- FUNCTION: Digital Clinical Development
    -- =====================================================================

    END IF;

    -- Department: Decentralized Clinical Trials (DCT)
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Decentralized Clinical Trials (DCT)';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- DCT Operations Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DCT Operations Lead (Global)',
            'dct-operations-lead-global',
            'DCT Operations Lead role with global scope in Decentralized Clinical Trials (DCT)',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- DCT Operations Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DCT Operations Lead (Local)',
            'dct-operations-lead-local',
            'DCT Operations Lead role with local scope in Decentralized Clinical Trials (DCT)',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- DCT Operations Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DCT Operations Lead (Regional)',
            'dct-operations-lead-regional',
            'DCT Operations Lead role with regional scope in Decentralized Clinical Trials (DCT)',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- DCT Program Director (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DCT Program Director (Global)',
            'dct-program-director-global',
            'DCT Program Director role with global scope in Decentralized Clinical Trials (DCT)',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- DCT Program Director (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DCT Program Director (Local)',
            'dct-program-director-local',
            'DCT Program Director role with local scope in Decentralized Clinical Trials (DCT)',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- DCT Program Director (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DCT Program Director (Regional)',
            'dct-program-director-regional',
            'DCT Program Director role with regional scope in Decentralized Clinical Trials (DCT)',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Protocol Design
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Protocol Design';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Protocol Designer (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Protocol Designer (Global)',
            'digital-protocol-designer-global',
            'Digital Protocol Designer role with global scope in Digital Protocol Design',
            'Mid',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Protocol Designer (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Protocol Designer (Local)',
            'digital-protocol-designer-local',
            'Digital Protocol Designer role with local scope in Digital Protocol Design',
            'Mid',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Protocol Designer (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Protocol Designer (Regional)',
            'digital-protocol-designer-regional',
            'Digital Protocol Designer role with regional scope in Digital Protocol Design',
            'Mid',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Site & Patient Digital Enablement
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Site & Patient Digital Enablement';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Enablement Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Enablement Lead (Global)',
            'digital-enablement-lead-global',
            'Digital Enablement Lead role with global scope in Site & Patient Digital Enablement',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Enablement Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Enablement Lead (Local)',
            'digital-enablement-lead-local',
            'Digital Enablement Lead role with local scope in Site & Patient Digital Enablement',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Enablement Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Enablement Lead (Regional)',
            'digital-enablement-lead-regional',
            'Digital Enablement Lead role with regional scope in Site & Patient Digital Enablement',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: eConsent & ePRO/eCOA
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'eConsent & ePRO/eCOA';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- ePRO Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'ePRO Manager (Global)',
            'epro-manager-global',
            'ePRO Manager role with global scope in eConsent & ePRO/eCOA',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- ePRO Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'ePRO Manager (Local)',
            'epro-manager-local',
            'ePRO Manager role with local scope in eConsent & ePRO/eCOA',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- ePRO Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'ePRO Manager (Regional)',
            'epro-manager-regional',
            'ePRO Manager role with regional scope in eConsent & ePRO/eCOA',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;


    -- =====================================================================
    -- FUNCTION: Digital Health Strategy & Innovation
    -- =====================================================================

    END IF;

    -- Department: Digital Foresight & R&D
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Foresight & R&D';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Innovation Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Innovation Lead (Global)',
            'digital-innovation-lead-global',
            'Digital Innovation Lead role with global scope in Digital Foresight & R&D',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Innovation Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Innovation Lead (Local)',
            'digital-innovation-lead-local',
            'Digital Innovation Lead role with local scope in Digital Foresight & R&D',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Innovation Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Innovation Lead (Regional)',
            'digital-innovation-lead-regional',
            'Digital Innovation Lead role with regional scope in Digital Foresight & R&D',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital R&D Strategist (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital R&D Strategist (Global)',
            'digital-r-d-strategist-global',
            'Digital R&D Strategist role with global scope in Digital Foresight & R&D',
            'Mid',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital R&D Strategist (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital R&D Strategist (Local)',
            'digital-r-d-strategist-local',
            'Digital R&D Strategist role with local scope in Digital Foresight & R&D',
            'Mid',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital R&D Strategist (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital R&D Strategist (Regional)',
            'digital-r-d-strategist-regional',
            'Digital R&D Strategist role with regional scope in Digital Foresight & R&D',
            'Mid',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Product Strategy
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Product Strategy';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Product Director (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Product Director (Global)',
            'digital-product-director-global',
            'Digital Product Director role with global scope in Digital Product Strategy',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Product Director (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Product Director (Local)',
            'digital-product-director-local',
            'Digital Product Director role with local scope in Digital Product Strategy',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Product Director (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Product Director (Regional)',
            'digital-product-director-regional',
            'Digital Product Director role with regional scope in Digital Product Strategy',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Product Lifecycle Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Product Lifecycle Manager (Global)',
            'product-lifecycle-manager-global',
            'Product Lifecycle Manager role with global scope in Digital Product Strategy',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Product Lifecycle Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Product Lifecycle Manager (Local)',
            'product-lifecycle-manager-local',
            'Product Lifecycle Manager role with local scope in Digital Product Strategy',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Product Lifecycle Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Product Lifecycle Manager (Regional)',
            'product-lifecycle-manager-regional',
            'Product Lifecycle Manager role with regional scope in Digital Product Strategy',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Transformation Office
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Transformation Office';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Transformation Director (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Transformation Director (Global)',
            'transformation-director-global',
            'Transformation Director role with global scope in Digital Transformation Office',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Transformation Director (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Transformation Director (Local)',
            'transformation-director-local',
            'Transformation Director role with local scope in Digital Transformation Office',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Transformation Director (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Transformation Director (Regional)',
            'transformation-director-regional',
            'Transformation Director role with regional scope in Digital Transformation Office',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Transformation Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Transformation Manager (Global)',
            'transformation-manager-global',
            'Transformation Manager role with global scope in Digital Transformation Office',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Transformation Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Transformation Manager (Local)',
            'transformation-manager-local',
            'Transformation Manager role with local scope in Digital Transformation Office',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Transformation Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Transformation Manager (Regional)',
            'transformation-manager-regional',
            'Transformation Manager role with regional scope in Digital Transformation Office',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Partnership & Ecosystem Development
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Partnership & Ecosystem Development';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Partner Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Partner Manager (Global)',
            'partner-manager-global',
            'Partner Manager role with global scope in Partnership & Ecosystem Development',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Partner Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Partner Manager (Local)',
            'partner-manager-local',
            'Partner Manager role with local scope in Partnership & Ecosystem Development',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Partner Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Partner Manager (Regional)',
            'partner-manager-regional',
            'Partner Manager role with regional scope in Partnership & Ecosystem Development',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Partnership Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Partnership Lead (Global)',
            'partnership-lead-global',
            'Partnership Lead role with global scope in Partnership & Ecosystem Development',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Partnership Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Partnership Lead (Local)',
            'partnership-lead-local',
            'Partnership Lead role with local scope in Partnership & Ecosystem Development',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Partnership Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Partnership Lead (Regional)',
            'partnership-lead-regional',
            'Partnership Lead role with regional scope in Partnership & Ecosystem Development',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;


    -- =====================================================================
    -- FUNCTION: Digital Platforms & Solutions
    -- =====================================================================

    END IF;

    -- Department: Connected Devices & Wearables
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Connected Devices & Wearables';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Wearable Device Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Wearable Device Manager (Global)',
            'wearable-device-manager-global',
            'Wearable Device Manager role with global scope in Connected Devices & Wearables',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Wearable Device Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Wearable Device Manager (Local)',
            'wearable-device-manager-local',
            'Wearable Device Manager role with local scope in Connected Devices & Wearables',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Wearable Device Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Wearable Device Manager (Regional)',
            'wearable-device-manager-regional',
            'Wearable Device Manager role with regional scope in Connected Devices & Wearables',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Therapeutics (DTx)
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Therapeutics (DTx)';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- DTx Program Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DTx Program Lead (Global)',
            'dtx-program-lead-global',
            'DTx Program Lead role with global scope in Digital Therapeutics (DTx)',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- DTx Program Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DTx Program Lead (Local)',
            'dtx-program-lead-local',
            'DTx Program Lead role with local scope in Digital Therapeutics (DTx)',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- DTx Program Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DTx Program Lead (Regional)',
            'dtx-program-lead-regional',
            'DTx Program Lead role with regional scope in Digital Therapeutics (DTx)',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Engagement & Behavior Change Platforms
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Engagement & Behavior Change Platforms';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Behavioral Insights Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Behavioral Insights Lead (Global)',
            'behavioral-insights-lead-global',
            'Behavioral Insights Lead role with global scope in Engagement & Behavior Change Platforms',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Behavioral Insights Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Behavioral Insights Lead (Local)',
            'behavioral-insights-lead-local',
            'Behavioral Insights Lead role with local scope in Engagement & Behavior Change Platforms',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Behavioral Insights Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Behavioral Insights Lead (Regional)',
            'behavioral-insights-lead-regional',
            'Behavioral Insights Lead role with regional scope in Engagement & Behavior Change Platforms',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Engagement Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Engagement Manager (Global)',
            'engagement-manager-global',
            'Engagement Manager role with global scope in Engagement & Behavior Change Platforms',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Engagement Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Engagement Manager (Local)',
            'engagement-manager-local',
            'Engagement Manager role with local scope in Engagement & Behavior Change Platforms',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Engagement Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Engagement Manager (Regional)',
            'engagement-manager-regional',
            'Engagement Manager role with regional scope in Engagement & Behavior Change Platforms',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Mobile Health (mHealth) Apps
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Mobile Health (mHealth) Apps';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- mHealth Product Owner (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'mHealth Product Owner (Global)',
            'mhealth-product-owner-global',
            'mHealth Product Owner role with global scope in Mobile Health (mHealth) Apps',
            'Mid',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- mHealth Product Owner (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'mHealth Product Owner (Local)',
            'mhealth-product-owner-local',
            'mHealth Product Owner role with local scope in Mobile Health (mHealth) Apps',
            'Mid',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- mHealth Product Owner (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'mHealth Product Owner (Regional)',
            'mhealth-product-owner-regional',
            'mHealth Product Owner role with regional scope in Mobile Health (mHealth) Apps',
            'Mid',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Remote Patient Monitoring (RPM)
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Remote Patient Monitoring (RPM)';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- RPM Product Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'RPM Product Lead (Global)',
            'rpm-product-lead-global',
            'RPM Product Lead role with global scope in Remote Patient Monitoring (RPM)',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- RPM Product Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'RPM Product Lead (Local)',
            'rpm-product-lead-local',
            'RPM Product Lead role with local scope in Remote Patient Monitoring (RPM)',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- RPM Product Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'RPM Product Lead (Regional)',
            'rpm-product-lead-regional',
            'RPM Product Lead role with regional scope in Remote Patient Monitoring (RPM)',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Virtual Care & Telehealth
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Virtual Care & Telehealth';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Telehealth Program Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Telehealth Program Manager (Global)',
            'telehealth-program-manager-global',
            'Telehealth Program Manager role with global scope in Virtual Care & Telehealth',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Telehealth Program Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Telehealth Program Manager (Local)',
            'telehealth-program-manager-local',
            'Telehealth Program Manager role with local scope in Virtual Care & Telehealth',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Telehealth Program Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Telehealth Program Manager (Regional)',
            'telehealth-program-manager-regional',
            'Telehealth Program Manager role with regional scope in Virtual Care & Telehealth',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Virtual Care Architect (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Virtual Care Architect (Global)',
            'virtual-care-architect-global',
            'Virtual Care Architect role with global scope in Virtual Care & Telehealth',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Virtual Care Architect (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Virtual Care Architect (Local)',
            'virtual-care-architect-local',
            'Virtual Care Architect role with local scope in Virtual Care & Telehealth',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Virtual Care Architect (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Virtual Care Architect (Regional)',
            'virtual-care-architect-regional',
            'Virtual Care Architect role with regional scope in Virtual Care & Telehealth',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;


    -- =====================================================================
    -- FUNCTION: Legal & IP for Digital
    -- =====================================================================

    END IF;

    -- Department: Digital Contracts & Data Use Agreements
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Contracts & Data Use Agreements';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Contracts Manager Digital (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Contracts Manager Digital (Global)',
            'contracts-manager-digital-global',
            'Contracts Manager Digital role with global scope in Digital Contracts & Data Use Agreements',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Contracts Manager Digital (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Contracts Manager Digital (Local)',
            'contracts-manager-digital-local',
            'Contracts Manager Digital role with local scope in Digital Contracts & Data Use Agreements',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Contracts Manager Digital (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Contracts Manager Digital (Regional)',
            'contracts-manager-digital-regional',
            'Contracts Manager Digital role with regional scope in Digital Contracts & Data Use Agreements',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Health Law
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Health Law';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Health Legal Counsel (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Health Legal Counsel (Global)',
            'digital-health-legal-counsel-global',
            'Digital Health Legal Counsel role with global scope in Digital Health Law',
            'Mid',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Health Legal Counsel (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Health Legal Counsel (Local)',
            'digital-health-legal-counsel-local',
            'Digital Health Legal Counsel role with local scope in Digital Health Law',
            'Mid',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Health Legal Counsel (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Health Legal Counsel (Regional)',
            'digital-health-legal-counsel-regional',
            'Digital Health Legal Counsel role with regional scope in Digital Health Law',
            'Mid',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Regulatory Watch & Digital Policy
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Regulatory Watch & Digital Policy';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Policy Analyst (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Policy Analyst (Global)',
            'digital-policy-analyst-global',
            'Digital Policy Analyst role with global scope in Regulatory Watch & Digital Policy',
            'Entry',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Policy Analyst (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Policy Analyst (Local)',
            'digital-policy-analyst-local',
            'Digital Policy Analyst role with local scope in Regulatory Watch & Digital Policy',
            'Entry',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Policy Analyst (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Policy Analyst (Regional)',
            'digital-policy-analyst-regional',
            'Digital Policy Analyst role with regional scope in Regulatory Watch & Digital Policy',
            'Entry',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Software Licensing & IP
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Software Licensing & IP';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital IP Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital IP Manager (Global)',
            'digital-ip-manager-global',
            'Digital IP Manager role with global scope in Software Licensing & IP',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital IP Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital IP Manager (Local)',
            'digital-ip-manager-local',
            'Digital IP Manager role with local scope in Software Licensing & IP',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital IP Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital IP Manager (Regional)',
            'digital-ip-manager-regional',
            'Digital IP Manager role with regional scope in Software Licensing & IP',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;


    -- =====================================================================
    -- FUNCTION: Patient & Provider Experience
    -- =====================================================================

    END IF;

    -- Department: Digital Health Literacy
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Health Literacy';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Health Literacy Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Health Literacy Lead (Global)',
            'health-literacy-lead-global',
            'Health Literacy Lead role with global scope in Digital Health Literacy',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Health Literacy Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Health Literacy Lead (Local)',
            'health-literacy-lead-local',
            'Health Literacy Lead role with local scope in Digital Health Literacy',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Health Literacy Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Health Literacy Lead (Regional)',
            'health-literacy-lead-regional',
            'Health Literacy Lead role with regional scope in Digital Health Literacy',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Medical Education
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Medical Education';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Med Ed Content Designer (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Med Ed Content Designer (Global)',
            'med-ed-content-designer-global',
            'Med Ed Content Designer role with global scope in Digital Medical Education',
            'Mid',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Med Ed Content Designer (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Med Ed Content Designer (Local)',
            'med-ed-content-designer-local',
            'Med Ed Content Designer role with local scope in Digital Medical Education',
            'Mid',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Med Ed Content Designer (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Med Ed Content Designer (Regional)',
            'med-ed-content-designer-regional',
            'Med Ed Content Designer role with regional scope in Digital Medical Education',
            'Mid',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Patient Support Programs
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Patient Support Programs';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Patient Support Digital Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Patient Support Digital Manager (Global)',
            'patient-support-digital-manager-global',
            'Patient Support Digital Manager role with global scope in Digital Patient Support Programs',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Patient Support Digital Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Patient Support Digital Manager (Local)',
            'patient-support-digital-manager-local',
            'Patient Support Digital Manager role with local scope in Digital Patient Support Programs',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Patient Support Digital Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Patient Support Digital Manager (Regional)',
            'patient-support-digital-manager-regional',
            'Patient Support Digital Manager role with regional scope in Digital Patient Support Programs',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Omnichannel Engagement
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Omnichannel Engagement';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Omnichannel Experience Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Omnichannel Experience Lead (Global)',
            'omnichannel-experience-lead-global',
            'Omnichannel Experience Lead role with global scope in Omnichannel Engagement',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Omnichannel Experience Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Omnichannel Experience Lead (Local)',
            'omnichannel-experience-lead-local',
            'Omnichannel Experience Lead role with local scope in Omnichannel Engagement',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Omnichannel Experience Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Omnichannel Experience Lead (Regional)',
            'omnichannel-experience-lead-regional',
            'Omnichannel Experience Lead role with regional scope in Omnichannel Engagement',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: UX/UI Design & Research
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'UX/UI Design & Research';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital UX Researcher (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital UX Researcher (Global)',
            'digital-ux-researcher-global',
            'Digital UX Researcher role with global scope in UX/UI Design & Research',
            'Mid',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital UX Researcher (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital UX Researcher (Local)',
            'digital-ux-researcher-local',
            'Digital UX Researcher role with local scope in UX/UI Design & Research',
            'Mid',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital UX Researcher (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital UX Researcher (Regional)',
            'digital-ux-researcher-regional',
            'Digital UX Researcher role with regional scope in UX/UI Design & Research',
            'Mid',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- UX Designer (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'UX Designer (Global)',
            'ux-designer-global',
            'UX Designer role with global scope in UX/UI Design & Research',
            'Mid',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- UX Designer (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'UX Designer (Local)',
            'ux-designer-local',
            'UX Designer role with local scope in UX/UI Design & Research',
            'Mid',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- UX Designer (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'UX Designer (Regional)',
            'ux-designer-regional',
            'UX Designer role with regional scope in UX/UI Design & Research',
            'Mid',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;


    -- =====================================================================
    -- FUNCTION: Regulatory, Quality & Compliance
    -- =====================================================================

    END IF;

    -- Department: Cybersecurity for Health
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Cybersecurity for Health';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Health Security Analyst (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Health Security Analyst (Global)',
            'digital-health-security-analyst-global',
            'Digital Health Security Analyst role with global scope in Cybersecurity for Health',
            'Entry',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Health Security Analyst (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Health Security Analyst (Local)',
            'digital-health-security-analyst-local',
            'Digital Health Security Analyst role with local scope in Cybersecurity for Health',
            'Entry',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Health Security Analyst (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Health Security Analyst (Regional)',
            'digital-health-security-analyst-regional',
            'Digital Health Security Analyst role with regional scope in Cybersecurity for Health',
            'Entry',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Data Privacy & Digital Ethics
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Data Privacy & Digital Ethics';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Ethics Officer (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Ethics Officer (Global)',
            'digital-ethics-officer-global',
            'Digital Ethics Officer role with global scope in Data Privacy & Digital Ethics',
            'Mid',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Ethics Officer (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Ethics Officer (Local)',
            'digital-ethics-officer-local',
            'Digital Ethics Officer role with local scope in Data Privacy & Digital Ethics',
            'Mid',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Ethics Officer (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Ethics Officer (Regional)',
            'digital-ethics-officer-regional',
            'Digital Ethics Officer role with regional scope in Data Privacy & Digital Ethics',
            'Mid',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Health Regulatory Affairs
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Health Regulatory Affairs';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital Reg Affairs Manager (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Reg Affairs Manager (Global)',
            'digital-reg-affairs-manager-global',
            'Digital Reg Affairs Manager role with global scope in Digital Health Regulatory Affairs',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Reg Affairs Manager (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Reg Affairs Manager (Local)',
            'digital-reg-affairs-manager-local',
            'Digital Reg Affairs Manager role with local scope in Digital Health Regulatory Affairs',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital Reg Affairs Manager (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital Reg Affairs Manager (Regional)',
            'digital-reg-affairs-manager-regional',
            'Digital Reg Affairs Manager role with regional scope in Digital Health Regulatory Affairs',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Digital Risk Management
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Digital Risk Management';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Risk Manager Digital Health (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Risk Manager Digital Health (Global)',
            'risk-manager-digital-health-global',
            'Risk Manager Digital Health role with global scope in Digital Risk Management',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Risk Manager Digital Health (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Risk Manager Digital Health (Local)',
            'risk-manager-digital-health-local',
            'Risk Manager Digital Health role with local scope in Digital Risk Management',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Risk Manager Digital Health (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Risk Manager Digital Health (Regional)',
            'risk-manager-digital-health-regional',
            'Risk Manager Digital Health role with regional scope in Digital Risk Management',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Medical Device/Software QA & QMS
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Medical Device/Software QA & QMS';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- QA Digital Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'QA Digital Lead (Global)',
            'qa-digital-lead-global',
            'QA Digital Lead role with global scope in Medical Device/Software QA & QMS',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- QA Digital Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'QA Digital Lead (Local)',
            'qa-digital-lead-local',
            'QA Digital Lead role with local scope in Medical Device/Software QA & QMS',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- QA Digital Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'QA Digital Lead (Regional)',
            'qa-digital-lead-regional',
            'QA Digital Lead role with regional scope in Medical Device/Software QA & QMS',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;


    -- =====================================================================
    -- FUNCTION: Technology & IT Infrastructure
    -- =====================================================================

    END IF;

    -- Department: Cloud Platforms & SaaS Ops
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Cloud Platforms & SaaS Ops';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Cloud Solutions Architect (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Cloud Solutions Architect (Global)',
            'cloud-solutions-architect-global',
            'Cloud Solutions Architect role with global scope in Cloud Platforms & SaaS Ops',
            'Senior',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Cloud Solutions Architect (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Cloud Solutions Architect (Local)',
            'cloud-solutions-architect-local',
            'Cloud Solutions Architect role with local scope in Cloud Platforms & SaaS Ops',
            'Senior',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Cloud Solutions Architect (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Cloud Solutions Architect (Regional)',
            'cloud-solutions-architect-regional',
            'Cloud Solutions Architect role with regional scope in Cloud Platforms & SaaS Ops',
            'Senior',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Data Integration & Exchange (FHIR, HL7)
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Data Integration & Exchange (FHIR, HL7)';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Data Integration Engineer (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Data Integration Engineer (Global)',
            'data-integration-engineer-global',
            'Data Integration Engineer role with global scope in Data Integration & Exchange (FHIR, HL7)',
            'Mid',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Data Integration Engineer (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Data Integration Engineer (Local)',
            'data-integration-engineer-local',
            'Data Integration Engineer role with local scope in Data Integration & Exchange (FHIR, HL7)',
            'Mid',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Data Integration Engineer (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Data Integration Engineer (Regional)',
            'data-integration-engineer-regional',
            'Data Integration Engineer role with regional scope in Data Integration & Exchange (FHIR, HL7)',
            'Mid',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: DevOps & Agile Delivery
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'DevOps & Agile Delivery';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- DevOps Digital Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DevOps Digital Lead (Global)',
            'devops-digital-lead-global',
            'DevOps Digital Lead role with global scope in DevOps & Agile Delivery',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- DevOps Digital Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DevOps Digital Lead (Local)',
            'devops-digital-lead-local',
            'DevOps Digital Lead role with local scope in DevOps & Agile Delivery',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- DevOps Digital Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'DevOps Digital Lead (Regional)',
            'devops-digital-lead-regional',
            'DevOps Digital Lead role with regional scope in DevOps & Agile Delivery',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Interoperability & API Management
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Interoperability & API Management';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Interoperability Lead (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Interoperability Lead (Global)',
            'interoperability-lead-global',
            'Interoperability Lead role with global scope in Interoperability & API Management',
            'Executive',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Interoperability Lead (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Interoperability Lead (Local)',
            'interoperability-lead-local',
            'Interoperability Lead role with local scope in Interoperability & API Management',
            'Executive',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Interoperability Lead (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Interoperability Lead (Regional)',
            'interoperability-lead-regional',
            'Interoperability Lead role with regional scope in Interoperability & API Management',
            'Executive',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

    END IF;

    -- Department: Support & Digital Workplace Services
    SELECT id INTO dept_id FROM org_departments
    WHERE tenant_id = digital_health_tenant_id AND name = 'Support & Digital Workplace Services';

    IF dept_id IS NOT NULL THEN
        SELECT function_id INTO func_id FROM org_departments WHERE id = dept_id;

        -- Digital IT Support Specialist (Global)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital IT Support Specialist (Global)',
            'digital-it-support-specialist-global',
            'Digital IT Support Specialist role with global scope in Support & Digital Workplace Services',
            'Entry',
            'Global',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital IT Support Specialist (Local)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital IT Support Specialist (Local)',
            'digital-it-support-specialist-local',
            'Digital IT Support Specialist role with local scope in Support & Digital Workplace Services',
            'Entry',
            'Local',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

        -- Digital IT Support Specialist (Regional)
        INSERT INTO org_roles (
            tenant_id,
            function_id,
            department_id,
            name,
            slug,
            description,
            seniority_level,
            geographic_scope,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            digital_health_tenant_id,
            func_id,
            dept_id,
            'Digital IT Support Specialist (Regional)',
            'digital-it-support-specialist-regional',
            'Digital IT Support Specialist role with regional scope in Support & Digital Workplace Services',
            'Entry',
            'Regional',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            seniority_level = EXCLUDED.seniority_level,
            geographic_scope = EXCLUDED.geographic_scope,
            is_active = true;
        role_count := role_count + 1;

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

WITH digital_health_tenant AS (
    SELECT id as tenant_id
    FROM tenants
    WHERE slug ILIKE '%digital%health%'
       OR slug ILIKE '%digital-health%'
       OR name ILIKE '%digital health%'
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    'org_functions' as table_name,
    COUNT(*) as count
FROM org_functions f
CROSS JOIN digital_health_tenant t
WHERE f.tenant_id = t.tenant_id
UNION ALL
SELECT 
    'org_departments',
    COUNT(*)
FROM org_departments d
CROSS JOIN digital_health_tenant t
WHERE d.tenant_id = t.tenant_id
UNION ALL
SELECT 
    'org_roles',
    COUNT(*)
FROM org_roles r
CROSS JOIN digital_health_tenant t
WHERE r.tenant_id = t.tenant_id;