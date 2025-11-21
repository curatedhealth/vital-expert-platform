-- =====================================================================
-- CREATE MEDICAL AFFAIRS ROLES EFFICIENTLY
-- Run in Supabase Dashboard SQL Editor
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id UUID;
    medical_affairs_function_id UUID;
    dept_field_medical UUID;
    dept_medical_info UUID;
    dept_scientific_comm UUID;
    dept_medical_education UUID;
    dept_heor UUID;
    dept_publications UUID;
    dept_leadership UUID;
    dept_clinical_ops UUID;
    dept_excellence UUID;
    role_data RECORD;
BEGIN
    -- Get IDs
    SELECT id INTO pharma_tenant_id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1;
    SELECT id INTO medical_affairs_function_id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1;
    
    -- Get department IDs
    SELECT id INTO dept_field_medical FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO dept_medical_info FROM public.org_departments WHERE name = 'Medical Information Services' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO dept_scientific_comm FROM public.org_departments WHERE name = 'Scientific Communications' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO dept_medical_education FROM public.org_departments WHERE name = 'Medical Education' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO dept_heor FROM public.org_departments WHERE name = 'HEOR & Evidence' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO dept_publications FROM public.org_departments WHERE name = 'Publications' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO dept_leadership FROM public.org_departments WHERE name = 'Medical Leadership' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO dept_clinical_ops FROM public.org_departments WHERE name = 'Clinical Operations Support' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO dept_excellence FROM public.org_departments WHERE name = 'Medical Excellence & Compliance' AND deleted_at IS NULL LIMIT 1;
    
    -- Create roles - Field Medical
    INSERT INTO public.org_roles (name, slug, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES 
        ('Global Field Medical Lead', 'global-field-medical-lead', medical_affairs_function_id, dept_field_medical, pharma_tenant_id, NOW(), NOW()),
        ('Regional Field Medical Director', 'regional-field-medical-director', medical_affairs_function_id, dept_field_medical, pharma_tenant_id, NOW(), NOW()),
        ('Local Field Medical Team Lead', 'local-field-medical-team-lead', medical_affairs_function_id, dept_field_medical, pharma_tenant_id, NOW(), NOW()),
        ('Local Medical Science Liaison (MSL)', 'local-medical-science-liaison-msl', medical_affairs_function_id, dept_field_medical, pharma_tenant_id, NOW(), NOW()),
        ('Regional Medical Science Liaison', 'regional-medical-science-liaison', medical_affairs_function_id, dept_field_medical, pharma_tenant_id, NOW(), NOW()),
        ('Senior Medical Science Liaison', 'senior-medical-science-liaison', medical_affairs_function_id, dept_field_medical, pharma_tenant_id, NOW(), NOW()),
        ('Field Team Lead', 'field-team-lead', medical_affairs_function_id, dept_field_medical, pharma_tenant_id, NOW(), NOW()),
        ('Medical Scientific Manager', 'medical-scientific-manager', medical_affairs_function_id, dept_field_medical, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Information Services
    INSERT INTO public.org_roles (name, slug, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES 
        ('Global Medical Information Director', 'global-medical-information-director', medical_affairs_function_id, dept_medical_info, pharma_tenant_id, NOW(), NOW()),
        ('Regional Medical Information Manager', 'regional-medical-information-manager', medical_affairs_function_id, dept_medical_info, pharma_tenant_id, NOW(), NOW()),
        ('Local Medical Information Specialist', 'local-medical-information-specialist', medical_affairs_function_id, dept_medical_info, pharma_tenant_id, NOW(), NOW()),
        ('MI Operations Lead', 'mi-operations-lead', medical_affairs_function_id, dept_medical_info, pharma_tenant_id, NOW(), NOW()),
        ('Medical Info Associate/Scientist', 'medical-info-associate-scientist', medical_affairs_function_id, dept_medical_info, pharma_tenant_id, NOW(), NOW()),
        ('Medical Information Specialist', 'medical-information-specialist', medical_affairs_function_id, dept_medical_info, pharma_tenant_id, NOW(), NOW()),
        ('Medical Information Manager', 'medical-information-manager', medical_affairs_function_id, dept_medical_info, pharma_tenant_id, NOW(), NOW()),
        ('Medical Info Associate', 'medical-info-associate', medical_affairs_function_id, dept_medical_info, pharma_tenant_id, NOW(), NOW()),
        ('Medical Info Scientist', 'medical-info-scientist', medical_affairs_function_id, dept_medical_info, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Scientific Communications
    INSERT INTO public.org_roles (name, slug, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES 
        ('Global Scientific Communications Lead', 'global-scientific-communications-lead', medical_affairs_function_id, dept_scientific_comm, pharma_tenant_id, NOW(), NOW()),
        ('Regional Scientific Communications Manager', 'regional-scientific-communications-manager', medical_affairs_function_id, dept_scientific_comm, pharma_tenant_id, NOW(), NOW()),
        ('Local Scientific Communications Specialist', 'local-scientific-communications-specialist', medical_affairs_function_id, dept_scientific_comm, pharma_tenant_id, NOW(), NOW()),
        ('Publications Lead', 'publications-lead', medical_affairs_function_id, dept_scientific_comm, pharma_tenant_id, NOW(), NOW()),
        ('Medical Writer', 'medical-writer', medical_affairs_function_id, dept_scientific_comm, pharma_tenant_id, NOW(), NOW()),
        ('Scientific Communications Manager', 'scientific-communications-manager', medical_affairs_function_id, dept_scientific_comm, pharma_tenant_id, NOW(), NOW()),
        ('Scientific Affairs Lead', 'scientific-affairs-lead', medical_affairs_function_id, dept_scientific_comm, pharma_tenant_id, NOW(), NOW()),
        ('Medical Communications Specialist', 'medical-communications-specialist', medical_affairs_function_id, dept_scientific_comm, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Education
    INSERT INTO public.org_roles (name, slug, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES 
        ('Global Medical Education Director', 'global-medical-education-director', medical_affairs_function_id, dept_medical_education, pharma_tenant_id, NOW(), NOW()),
        ('Regional Medical Education Manager', 'regional-medical-education-manager', medical_affairs_function_id, dept_medical_education, pharma_tenant_id, NOW(), NOW()),
        ('Local Medical Education Specialist', 'local-medical-education-specialist', medical_affairs_function_id, dept_medical_education, pharma_tenant_id, NOW(), NOW()),
        ('Digital Medical Education Lead', 'digital-medical-education-lead', medical_affairs_function_id, dept_medical_education, pharma_tenant_id, NOW(), NOW()),
        ('Medical Education Manager', 'medical-education-manager', medical_affairs_function_id, dept_medical_education, pharma_tenant_id, NOW(), NOW()),
        ('Medical Education Strategist', 'medical-education-strategist', medical_affairs_function_id, dept_medical_education, pharma_tenant_id, NOW(), NOW()),
        ('Scientific Trainer', 'scientific-trainer', medical_affairs_function_id, dept_medical_education, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- HEOR & Evidence
    INSERT INTO public.org_roles (name, slug, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES 
        ('Global HEOR Director', 'global-heor-director', medical_affairs_function_id, dept_heor, pharma_tenant_id, NOW(), NOW()),
        ('Regional HEOR Manager', 'regional-heor-manager', medical_affairs_function_id, dept_heor, pharma_tenant_id, NOW(), NOW()),
        ('Local HEOR Specialist', 'local-heor-specialist', medical_affairs_function_id, dept_heor, pharma_tenant_id, NOW(), NOW()),
        ('Real-World Evidence Lead', 'real-world-evidence-lead', medical_affairs_function_id, dept_heor, pharma_tenant_id, NOW(), NOW()),
        ('Economic Modeler', 'economic-modeler', medical_affairs_function_id, dept_heor, pharma_tenant_id, NOW(), NOW()),
        ('HEOR Director', 'heor-director', medical_affairs_function_id, dept_heor, pharma_tenant_id, NOW(), NOW()),
        ('HEOR Manager', 'heor-manager', medical_affairs_function_id, dept_heor, pharma_tenant_id, NOW(), NOW()),
        ('HEOR Project Manager', 'heor-project-manager', medical_affairs_function_id, dept_heor, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Publications
    INSERT INTO public.org_roles (name, slug, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES 
        ('Global Publications Lead', 'global-publications-lead', medical_affairs_function_id, dept_publications, pharma_tenant_id, NOW(), NOW()),
        ('Regional Publications Manager', 'regional-publications-manager', medical_affairs_function_id, dept_publications, pharma_tenant_id, NOW(), NOW()),
        ('Local Publication Planner', 'local-publication-planner', medical_affairs_function_id, dept_publications, pharma_tenant_id, NOW(), NOW()),
        ('Publications Coordinator', 'publications-coordinator', medical_affairs_function_id, dept_publications, pharma_tenant_id, NOW(), NOW()),
        ('Publications Manager', 'publications-manager', medical_affairs_function_id, dept_publications, pharma_tenant_id, NOW(), NOW()),
        ('Publication Planner', 'publication-planner', medical_affairs_function_id, dept_publications, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Leadership
    INSERT INTO public.org_roles (name, slug, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES 
        ('Chief Medical Officer (Global CMO)', 'chief-medical-officer-global-cmo', medical_affairs_function_id, dept_leadership, pharma_tenant_id, NOW(), NOW()),
        ('Regional Medical Affairs Lead (VP/Director)', 'regional-medical-affairs-lead-vp-director', medical_affairs_function_id, dept_leadership, pharma_tenant_id, NOW(), NOW()),
        ('Local Medical Affairs Manager', 'local-medical-affairs-manager', medical_affairs_function_id, dept_leadership, pharma_tenant_id, NOW(), NOW()),
        ('Senior Medical Director', 'senior-medical-director', medical_affairs_function_id, dept_leadership, pharma_tenant_id, NOW(), NOW()),
        ('Country Medical Director', 'country-medical-director', medical_affairs_function_id, dept_leadership, pharma_tenant_id, NOW(), NOW()),
        ('Chief Medical Officer (CMO)', 'chief-medical-officer-cmo', medical_affairs_function_id, dept_leadership, pharma_tenant_id, NOW(), NOW()),
        ('VP Medical Affairs', 'vp-medical-affairs', medical_affairs_function_id, dept_leadership, pharma_tenant_id, NOW(), NOW()),
        ('Medical Affairs Director', 'medical-affairs-director', medical_affairs_function_id, dept_leadership, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Clinical Operations Support
    INSERT INTO public.org_roles (name, slug, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES 
        ('Global Clinical Operations Liaison', 'global-clinical-operations-liaison', medical_affairs_function_id, dept_clinical_ops, pharma_tenant_id, NOW(), NOW()),
        ('Regional Clinical Ops Support Manager', 'regional-clinical-ops-support-manager', medical_affairs_function_id, dept_clinical_ops, pharma_tenant_id, NOW(), NOW()),
        ('Local Medical Liaison, Clinical Trials', 'local-medical-liaison-clinical-trials', medical_affairs_function_id, dept_clinical_ops, pharma_tenant_id, NOW(), NOW()),
        ('Clinical Operations Liaison', 'clinical-operations-liaison', medical_affairs_function_id, dept_clinical_ops, pharma_tenant_id, NOW(), NOW()),
        ('Clinical Ops Support Analyst', 'clinical-ops-support-analyst', medical_affairs_function_id, dept_clinical_ops, pharma_tenant_id, NOW(), NOW()),
        ('Medical Liaison Clinical Trials', 'medical-liaison-clinical-trials', medical_affairs_function_id, dept_clinical_ops, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Excellence & Compliance
    INSERT INTO public.org_roles (name, slug, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES 
        ('Global Medical Excellence Director', 'global-medical-excellence-director', medical_affairs_function_id, dept_excellence, pharma_tenant_id, NOW(), NOW()),
        ('Regional Medical Excellence Lead', 'regional-medical-excellence-lead', medical_affairs_function_id, dept_excellence, pharma_tenant_id, NOW(), NOW()),
        ('Local Medical Excellence Specialist', 'local-medical-excellence-specialist', medical_affairs_function_id, dept_excellence, pharma_tenant_id, NOW(), NOW()),
        ('Compliance Specialist', 'compliance-specialist', medical_affairs_function_id, dept_excellence, pharma_tenant_id, NOW(), NOW()),
        ('Medical Governance Officer', 'medical-governance-officer', medical_affairs_function_id, dept_excellence, pharma_tenant_id, NOW(), NOW()),
        ('Medical Excellence Lead', 'medical-excellence-lead', medical_affairs_function_id, dept_excellence, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Update existing roles to correct departments
    UPDATE public.org_roles
    SET department_id = dept_field_medical, function_id = medical_affairs_function_id, updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id AND deleted_at IS NULL
      AND name ILIKE '%msl%' AND name ILIKE '%medical science liaison%'
      AND (department_id IS NULL OR department_id != dept_field_medical);
    
    UPDATE public.org_roles
    SET department_id = dept_medical_info, function_id = medical_affairs_function_id, updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id AND deleted_at IS NULL
      AND (name ILIKE '%medical information%' OR name ILIKE '%medical info%')
      AND (department_id IS NULL OR department_id != dept_medical_info);
    
    UPDATE public.org_roles
    SET department_id = dept_scientific_comm, function_id = medical_affairs_function_id, updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id AND deleted_at IS NULL
      AND (name ILIKE '%medical communication%' OR (name ILIKE '%medical writer%' AND name NOT ILIKE '%publication%'))
      AND (department_id IS NULL OR department_id != dept_scientific_comm);
    
    UPDATE public.org_roles
    SET department_id = dept_medical_education, function_id = medical_affairs_function_id, updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id AND deleted_at IS NULL
      AND (name ILIKE '%medical education%' OR name ILIKE '%medical training%')
      AND (department_id IS NULL OR department_id != dept_medical_education);
    
    UPDATE public.org_roles
    SET department_id = dept_heor, function_id = medical_affairs_function_id, updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id AND deleted_at IS NULL
      AND (name ILIKE '%heor%' OR name ILIKE '%epidemiologist%' OR name ILIKE '%evidence%')
      AND (department_id IS NULL OR department_id != dept_heor);
    
    UPDATE public.org_roles
    SET department_id = dept_publications, function_id = medical_affairs_function_id, updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id AND deleted_at IS NULL
      AND (name ILIKE '%publication%' OR (name ILIKE '%medical writer%' AND name ILIKE '%publication%'))
      AND (department_id IS NULL OR department_id != dept_publications);
    
    UPDATE public.org_roles
    SET department_id = dept_leadership, function_id = medical_affairs_function_id, updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id AND deleted_at IS NULL
      AND (name ILIKE '%chief medical%' OR name ILIKE '%vp medical%' OR name ILIKE '%medical director%')
      AND (department_id IS NULL OR department_id != dept_leadership);
    
    UPDATE public.org_roles
    SET department_id = dept_clinical_ops, function_id = medical_affairs_function_id, updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id AND deleted_at IS NULL
      AND (name ILIKE '%safety physician%' OR name ILIKE '%study site medical%' OR name ILIKE '%clinical operations%')
      AND (department_id IS NULL OR department_id != dept_clinical_ops);
    
    UPDATE public.org_roles
    SET department_id = dept_excellence, function_id = medical_affairs_function_id, updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id AND deleted_at IS NULL
      AND (name ILIKE '%medical excellence%' OR name ILIKE '%medical compliance%' OR name ILIKE '%medical qa%')
      AND (department_id IS NULL OR department_id != dept_excellence);
    
    RAISE NOTICE 'All roles created/updated';
END $$;

COMMIT;

