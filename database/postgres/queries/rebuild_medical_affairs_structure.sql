-- =====================================================================
-- REBUILD MEDICAL AFFAIRS ORGANIZATIONAL STRUCTURE
-- Multi-Tenant Architecture
-- =====================================================================
-- This script rebuilds the Medical Affairs function, departments, and roles
-- using the new multi-tenant junction table approach.
-- =====================================================================

DO $$
DECLARE
    pharma_tenant_id UUID;
    medical_affairs_function_id UUID;
    
    -- Department IDs
    dept_field_medical UUID;
    dept_medical_info UUID;
    dept_scientific_comms UUID;
    dept_medical_education UUID;
    dept_heor UUID;
    dept_publications UUID;
    dept_leadership UUID;
    dept_clinical_ops UUID;
    dept_medical_excellence UUID;
    
BEGIN
    -- Get Pharmaceuticals tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug IN ('pharmaceuticals', 'pharma')
    LIMIT 1;
    
    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION '❌ Pharmaceuticals tenant not found!';
    END IF;
    
    RAISE NOTICE '✓ Found Pharmaceuticals tenant: %', pharma_tenant_id;
    
    -- =====================================================================
    -- STEP 1: CREATE MEDICAL AFFAIRS FUNCTION
    -- =====================================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 1: Creating Medical Affairs Function ===';
    
    INSERT INTO public.org_functions (name, slug, description, created_at, updated_at)
    VALUES (
        'Medical Affairs',
        'medical-affairs',
        'Strategic medical and scientific leadership, evidence generation, and healthcare professional engagement',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO medical_affairs_function_id;
    
    RAISE NOTICE '✓ Medical Affairs Function: %', medical_affairs_function_id;
    
    -- Map function to Pharmaceuticals tenant
    INSERT INTO public.function_tenants (function_id, tenant_id, created_at)
    VALUES (medical_affairs_function_id, pharma_tenant_id, NOW())
    ON CONFLICT (function_id, tenant_id) DO NOTHING;
    
    RAISE NOTICE '✓ Mapped to Pharmaceuticals tenant';
    
    -- =====================================================================
    -- STEP 2: CREATE MEDICAL AFFAIRS DEPARTMENTS
    -- =====================================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 2: Creating Medical Affairs Departments ===';
    
    -- 1. Field Medical
    INSERT INTO public.org_departments (name, slug, function_id, description, created_at, updated_at)
    VALUES (
        'Field Medical',
        'field-medical',
        medical_affairs_function_id,
        'MSL teams, KOL engagement, and field-based scientific support',
        NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO dept_field_medical;
    
    INSERT INTO public.department_tenants (department_id, tenant_id, created_at)
    VALUES (dept_field_medical, pharma_tenant_id, NOW())
    ON CONFLICT (department_id, tenant_id) DO NOTHING;
    
    RAISE NOTICE '✓ Field Medical: %', dept_field_medical;
    
    -- 2. Medical Information Services
    INSERT INTO public.org_departments (name, slug, function_id, description, created_at, updated_at)
    VALUES (
        'Medical Information Services',
        'medical-information-services',
        medical_affairs_function_id,
        'Medical inquiry response, content management, and information dissemination',
        NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO dept_medical_info;
    
    INSERT INTO public.department_tenants (department_id, tenant_id, created_at)
    VALUES (dept_medical_info, pharma_tenant_id, NOW())
    ON CONFLICT (department_id, tenant_id) DO NOTHING;
    
    RAISE NOTICE '✓ Medical Information Services: %', dept_medical_info;
    
    -- 3. Scientific Communications
    INSERT INTO public.org_departments (name, slug, function_id, description, created_at, updated_at)
    VALUES (
        'Scientific Communications',
        'scientific-communications',
        medical_affairs_function_id,
        'Medical writing, congress support, and scientific messaging',
        NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO dept_scientific_comms;
    
    INSERT INTO public.department_tenants (department_id, tenant_id, created_at)
    VALUES (dept_scientific_comms, pharma_tenant_id, NOW())
    ON CONFLICT (department_id, tenant_id) DO NOTHING;
    
    RAISE NOTICE '✓ Scientific Communications: %', dept_scientific_comms;
    
    -- 4. Medical Education
    INSERT INTO public.org_departments (name, slug, function_id, description, created_at, updated_at)
    VALUES (
        'Medical Education',
        'medical-education',
        medical_affairs_function_id,
        'HCP education, training programs, and educational content development',
        NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO dept_medical_education;
    
    INSERT INTO public.department_tenants (department_id, tenant_id, created_at)
    VALUES (dept_medical_education, pharma_tenant_id, NOW())
    ON CONFLICT (department_id, tenant_id) DO NOTHING;
    
    RAISE NOTICE '✓ Medical Education: %', dept_medical_education;
    
    -- 5. HEOR & Evidence
    INSERT INTO public.org_departments (name, slug, function_id, description, created_at, updated_at)
    VALUES (
        'HEOR & Evidence',
        'heor-evidence',
        medical_affairs_function_id,
        'Health economics, outcomes research, and real-world evidence generation',
        NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO dept_heor;
    
    INSERT INTO public.department_tenants (department_id, tenant_id, created_at)
    VALUES (dept_heor, pharma_tenant_id, NOW())
    ON CONFLICT (department_id, tenant_id) DO NOTHING;
    
    RAISE NOTICE '✓ HEOR & Evidence: %', dept_heor;
    
    -- 6. Publications
    INSERT INTO public.org_departments (name, slug, function_id, description, created_at, updated_at)
    VALUES (
        'Publications',
        'publications',
        medical_affairs_function_id,
        'Publication planning, manuscript development, and authorship coordination',
        NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO dept_publications;
    
    INSERT INTO public.department_tenants (department_id, tenant_id, created_at)
    VALUES (dept_publications, pharma_tenant_id, NOW())
    ON CONFLICT (department_id, tenant_id) DO NOTHING;
    
    RAISE NOTICE '✓ Publications: %', dept_publications;
    
    -- 7. Medical Leadership
    INSERT INTO public.org_departments (name, slug, function_id, description, created_at, updated_at)
    VALUES (
        'Medical Leadership',
        'medical-leadership',
        medical_affairs_function_id,
        'Medical Affairs executive leadership and strategic direction',
        NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO dept_leadership;
    
    INSERT INTO public.department_tenants (department_id, tenant_id, created_at)
    VALUES (dept_leadership, pharma_tenant_id, NOW())
    ON CONFLICT (department_id, tenant_id) DO NOTHING;
    
    RAISE NOTICE '✓ Medical Leadership: %', dept_leadership;
    
    -- 8. Clinical Operations Support
    INSERT INTO public.org_departments (name, slug, function_id, description, created_at, updated_at)
    VALUES (
        'Clinical Operations Support',
        'clinical-operations-support',
        medical_affairs_function_id,
        'Medical monitoring, safety oversight, and clinical trial medical support',
        NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO dept_clinical_ops;
    
    INSERT INTO public.department_tenants (department_id, tenant_id, created_at)
    VALUES (dept_clinical_ops, pharma_tenant_id, NOW())
    ON CONFLICT (department_id, tenant_id) DO NOTHING;
    
    RAISE NOTICE '✓ Clinical Operations Support: %', dept_clinical_ops;
    
    -- 9. Medical Excellence & Compliance
    INSERT INTO public.org_departments (name, slug, function_id, description, created_at, updated_at)
    VALUES (
        'Medical Excellence & Compliance',
        'medical-excellence-compliance',
        medical_affairs_function_id,
        'Quality assurance, compliance oversight, and medical governance',
        NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO dept_medical_excellence;
    
    INSERT INTO public.department_tenants (department_id, tenant_id, created_at)
    VALUES (dept_medical_excellence, pharma_tenant_id, NOW())
    ON CONFLICT (department_id, tenant_id) DO NOTHING;
    
    RAISE NOTICE '✓ Medical Excellence & Compliance: %', dept_medical_excellence;
    
    -- =====================================================================
    -- STEP 3: CREATE ROLES BY DEPARTMENT
    -- =====================================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 3: Creating Medical Affairs Roles ===';
    
    -- Helper function to create role with tenant mapping
    CREATE OR REPLACE FUNCTION create_ma_role(
        role_name TEXT,
        role_slug TEXT,
        dept_id UUID,
        func_id UUID,
        tenant_id UUID
    ) RETURNS UUID AS $role$
    DECLARE
        new_role_id UUID;
    BEGIN
        INSERT INTO public.org_roles (name, slug, department_id, function_id, created_at, updated_at)
        VALUES (role_name, role_slug, dept_id, func_id, NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            department_id = EXCLUDED.department_id,
            function_id = EXCLUDED.function_id,
            updated_at = NOW()
        RETURNING id INTO new_role_id;
        
        INSERT INTO public.role_tenants (role_id, tenant_id, created_at)
        VALUES (new_role_id, tenant_id, NOW())
        ON CONFLICT (role_id, tenant_id) DO NOTHING;
        
        RETURN new_role_id;
    END;
    $role$ LANGUAGE plpgsql;
    
    -- FIELD MEDICAL ROLES
    RAISE NOTICE '';
    RAISE NOTICE '--- Field Medical Roles ---';
    PERFORM create_ma_role('Global Field Medical Lead', 'global-field-medical-lead', dept_field_medical, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Regional Field Medical Director', 'regional-field-medical-director', dept_field_medical, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Local Field Medical Team Lead', 'local-field-medical-team-lead', dept_field_medical, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Science Liaison (MSL)', 'medical-science-liaison', dept_field_medical, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Senior Medical Science Liaison', 'senior-medical-science-liaison', dept_field_medical, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('MSL Manager', 'msl-manager', dept_field_medical, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Field Medical Trainer', 'field-medical-trainer', dept_field_medical, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('TA MSL Lead', 'ta-msl-lead', dept_field_medical, medical_affairs_function_id, pharma_tenant_id);
    RAISE NOTICE '✓ Created 8 Field Medical roles';
    
    -- MEDICAL INFORMATION SERVICES ROLES
    RAISE NOTICE '--- Medical Information Services Roles ---';
    PERFORM create_ma_role('Global Medical Information Director', 'global-medical-information-director', dept_medical_info, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Regional Medical Information Manager', 'regional-medical-information-manager', dept_medical_info, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Local Medical Information Specialist', 'local-medical-information-specialist', dept_medical_info, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Information Manager', 'medical-information-manager', dept_medical_info, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Information Specialist', 'medical-information-specialist', dept_medical_info, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('MI Operations Lead', 'mi-operations-lead', dept_medical_info, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Content Manager', 'medical-content-manager', dept_medical_info, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Head of Medical Information', 'head-of-medical-information', dept_medical_info, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Senior Medical Information Specialist', 'senior-medical-information-specialist', dept_medical_info, medical_affairs_function_id, pharma_tenant_id);
    RAISE NOTICE '✓ Created 9 Medical Information roles';
    
    -- SCIENTIFIC COMMUNICATIONS ROLES
    RAISE NOTICE '--- Scientific Communications Roles ---';
    PERFORM create_ma_role('Global Scientific Communications Lead', 'global-scientific-communications-lead', dept_scientific_comms, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Regional Scientific Communications Manager', 'regional-scientific-communications-manager', dept_scientific_comms, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Local Scientific Communications Specialist', 'local-scientific-communications-specialist', dept_scientific_comms, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Writer Scientific', 'medical-writer-scientific', dept_scientific_comms, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Writer', 'medical-writer', dept_scientific_comms, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Congress Manager', 'congress-manager', dept_scientific_comms, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Communications Manager', 'medical-communications-manager', dept_scientific_comms, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Editor', 'medical-editor', dept_scientific_comms, medical_affairs_function_id, pharma_tenant_id);
    RAISE NOTICE '✓ Created 8 Scientific Communications roles';
    
    -- MEDICAL EDUCATION ROLES
    RAISE NOTICE '--- Medical Education Roles ---';
    PERFORM create_ma_role('Global Medical Education Director', 'global-medical-education-director', dept_medical_education, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Regional Medical Education Manager', 'regional-medical-education-manager', dept_medical_education, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Local Medical Education Specialist', 'local-medical-education-specialist', dept_medical_education, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Education Director', 'medical-education-director', dept_medical_education, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Education Manager', 'medical-education-manager', dept_medical_education, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Digital Medical Education Lead', 'digital-medical-education-lead', dept_medical_education, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Training Manager', 'medical-training-manager', dept_medical_education, medical_affairs_function_id, pharma_tenant_id);
    RAISE NOTICE '✓ Created 7 Medical Education roles';
    
    -- HEOR & EVIDENCE ROLES
    RAISE NOTICE '--- HEOR & Evidence Roles ---';
    PERFORM create_ma_role('Global HEOR Director', 'global-heor-director', dept_heor, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Regional HEOR Manager', 'regional-heor-manager', dept_heor, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Local HEOR Specialist', 'local-heor-specialist', dept_heor, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('HEOR Director', 'heor-director', dept_heor, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('HEOR Manager', 'heor-manager', dept_heor, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Real-World Evidence Lead', 'real-world-evidence-lead', dept_heor, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Economic Modeler', 'economic-modeler', dept_heor, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Epidemiologist', 'epidemiologist', dept_heor, medical_affairs_function_id, pharma_tenant_id);
    RAISE NOTICE '✓ Created 8 HEOR & Evidence roles';
    
    -- PUBLICATIONS ROLES
    RAISE NOTICE '--- Publications Roles ---';
    PERFORM create_ma_role('Global Publications Lead', 'global-publications-lead', dept_publications, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Regional Publications Manager', 'regional-publications-manager', dept_publications, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Local Publication Planner', 'local-publication-planner', dept_publications, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Director of Medical Publications', 'director-of-medical-publications', dept_publications, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Senior Medical Writer', 'senior-medical-writer', dept_publications, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Publications Coordinator', 'publications-coordinator', dept_publications, medical_affairs_function_id, pharma_tenant_id);
    RAISE NOTICE '✓ Created 6 Publications roles';
    
    -- MEDICAL LEADERSHIP ROLES
    RAISE NOTICE '--- Medical Leadership Roles ---';
    PERFORM create_ma_role('Chief Medical Officer', 'chief-medical-officer', dept_leadership, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('VP Medical Affairs', 'vp-medical-affairs', dept_leadership, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Affairs Director', 'medical-affairs-director', dept_leadership, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Director', 'medical-director', dept_leadership, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Senior Medical Director', 'senior-medical-director', dept_leadership, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Regional Medical Affairs Lead', 'regional-medical-affairs-lead', dept_leadership, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Country Medical Director', 'country-medical-director', dept_leadership, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Therapeutic Area Medical Director', 'therapeutic-area-medical-director', dept_leadership, medical_affairs_function_id, pharma_tenant_id);
    RAISE NOTICE '✓ Created 8 Medical Leadership roles';
    
    -- CLINICAL OPERATIONS SUPPORT ROLES
    RAISE NOTICE '--- Clinical Operations Support Roles ---';
    PERFORM create_ma_role('Global Clinical Operations Liaison', 'global-clinical-operations-liaison', dept_clinical_ops, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Regional Clinical Ops Support Manager', 'regional-clinical-ops-support-manager', dept_clinical_ops, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Local Medical Liaison Clinical Trials', 'local-medical-liaison-clinical-trials', dept_clinical_ops, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Monitor', 'medical-monitor', dept_clinical_ops, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Safety Physician', 'safety-physician', dept_clinical_ops, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Study Site Medical Lead', 'study-site-medical-lead', dept_clinical_ops, medical_affairs_function_id, pharma_tenant_id);
    RAISE NOTICE '✓ Created 6 Clinical Operations Support roles';
    
    -- MEDICAL EXCELLENCE & COMPLIANCE ROLES
    RAISE NOTICE '--- Medical Excellence & Compliance Roles ---';
    PERFORM create_ma_role('Global Medical Excellence Director', 'global-medical-excellence-director', dept_medical_excellence, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Regional Medical Excellence Lead', 'regional-medical-excellence-lead', dept_medical_excellence, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Local Medical Excellence Specialist', 'local-medical-excellence-specialist', dept_medical_excellence, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Compliance Manager', 'medical-compliance-manager', dept_medical_excellence, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical QA Manager', 'medical-qa-manager', dept_medical_excellence, medical_affairs_function_id, pharma_tenant_id);
    PERFORM create_ma_role('Medical Governance Officer', 'medical-governance-officer', dept_medical_excellence, medical_affairs_function_id, pharma_tenant_id);
    RAISE NOTICE '✓ Created 6 Medical Excellence & Compliance roles';
    
    -- Clean up helper function
    DROP FUNCTION IF EXISTS create_ma_role(TEXT, TEXT, UUID, UUID, UUID);
    
    -- =====================================================================
    -- SUMMARY
    -- =====================================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== ✅ REBUILD COMPLETE ===';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - 1 Function (Medical Affairs)';
    RAISE NOTICE '  - 9 Departments';
    RAISE NOTICE '  - 66 Roles';
    RAISE NOTICE '  - All mapped to Pharmaceuticals tenant via junction tables';
    
END $$;

-- =====================================================================
-- VERIFICATION QUERY
-- =====================================================================
SELECT '=== VERIFICATION: Medical Affairs Structure ===' as section;

SELECT
    f.name as function_name,
    d.name as department_name,
    COUNT(r.id) as role_count
FROM public.org_functions f
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.deleted_at IS NULL
LEFT JOIN public.org_roles r ON r.department_id = d.id AND r.deleted_at IS NULL
WHERE f.slug = 'medical-affairs' AND f.deleted_at IS NULL
GROUP BY f.name, d.name
ORDER BY d.name;

SELECT '=== VERIFICATION: Total Counts ===' as section;

SELECT
    (SELECT COUNT(*) FROM public.org_functions WHERE deleted_at IS NULL) as total_functions,
    (SELECT COUNT(*) FROM public.org_departments WHERE deleted_at IS NULL) as total_departments,
    (SELECT COUNT(*) FROM public.org_roles WHERE deleted_at IS NULL) as total_roles,
    (SELECT COUNT(*) FROM public.function_tenants) as function_tenant_mappings,
    (SELECT COUNT(*) FROM public.department_tenants) as department_tenant_mappings,
    (SELECT COUNT(*) FROM public.role_tenants) as role_tenant_mappings;

