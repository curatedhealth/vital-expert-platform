-- =====================================================================
-- BATCH 1: Create/Update Medical Affairs Departments
-- =====================================================================

BEGIN;

-- Get Medical Affairs function ID
DO $$
DECLARE
    medical_affairs_function_id UUID;
    pharma_tenant_id UUID;
BEGIN
    SELECT id INTO medical_affairs_function_id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO pharma_tenant_id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1;
    
    -- Field Medical
    INSERT INTO public.org_departments (name, slug, function_id, tenant_id, created_at, updated_at)
    SELECT 'Field Medical', 'field-medical', medical_affairs_function_id, pharma_tenant_id, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL);
    
    -- Medical Information Services
    INSERT INTO public.org_departments (name, slug, function_id, tenant_id, created_at, updated_at)
    SELECT 'Medical Information Services', 'medical-information-services', medical_affairs_function_id, pharma_tenant_id, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Medical Information Services' AND deleted_at IS NULL);
    
    -- Scientific Communications
    INSERT INTO public.org_departments (name, slug, function_id, tenant_id, created_at, updated_at)
    SELECT 'Scientific Communications', 'scientific-communications', medical_affairs_function_id, pharma_tenant_id, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Scientific Communications' AND deleted_at IS NULL);
    
    -- Medical Education
    INSERT INTO public.org_departments (name, slug, function_id, tenant_id, created_at, updated_at)
    SELECT 'Medical Education', 'medical-education', medical_affairs_function_id, pharma_tenant_id, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Medical Education' AND deleted_at IS NULL);
    
    -- HEOR & Evidence
    INSERT INTO public.org_departments (name, slug, function_id, tenant_id, created_at, updated_at)
    SELECT 'HEOR & Evidence', 'heor-evidence', medical_affairs_function_id, pharma_tenant_id, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'HEOR & Evidence' AND deleted_at IS NULL);
    
    -- Publications
    INSERT INTO public.org_departments (name, slug, function_id, tenant_id, created_at, updated_at)
    SELECT 'Publications', 'publications', medical_affairs_function_id, pharma_tenant_id, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Publications' AND deleted_at IS NULL);
    
    -- Medical Leadership
    INSERT INTO public.org_departments (name, slug, function_id, tenant_id, created_at, updated_at)
    SELECT 'Medical Leadership', 'medical-leadership', medical_affairs_function_id, pharma_tenant_id, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Medical Leadership' AND deleted_at IS NULL);
    
    -- Clinical Operations Support
    INSERT INTO public.org_departments (name, slug, function_id, tenant_id, created_at, updated_at)
    SELECT 'Clinical Operations Support', 'clinical-operations-support', medical_affairs_function_id, pharma_tenant_id, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Clinical Operations Support' AND deleted_at IS NULL);
    
    -- Medical Excellence & Compliance
    INSERT INTO public.org_departments (name, slug, function_id, tenant_id, created_at, updated_at)
    SELECT 'Medical Excellence & Compliance', 'medical-excellence-compliance', medical_affairs_function_id, pharma_tenant_id, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Medical Excellence & Compliance' AND deleted_at IS NULL);
    
    RAISE NOTICE 'Departments created/verified';
END $$;

COMMIT;

