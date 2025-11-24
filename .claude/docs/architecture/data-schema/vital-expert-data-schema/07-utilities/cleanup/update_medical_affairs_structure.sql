-- =====================================================================
-- UPDATE MEDICAL AFFAIRS STRUCTURE FOR PHARMACEUTICALS TENANT
-- Based on provided organizational hierarchy
-- =====================================================================

BEGIN;

-- Get IDs
DO $$
DECLARE
    pharma_tenant_id UUID;
    medical_affairs_function_id UUID;
BEGIN
    -- Get pharma tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    -- Get Medical Affairs function ID
    SELECT id INTO medical_affairs_function_id
    FROM public.org_functions
    WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%')
      AND deleted_at IS NULL
    LIMIT 1;
    
    RAISE NOTICE 'Pharma Tenant ID: %', pharma_tenant_id;
    RAISE NOTICE 'Medical Affairs Function ID: %', medical_affairs_function_id;
END $$;

-- =====================================================================
-- STEP 1: CREATE/UPDATE DEPARTMENTS
-- =====================================================================

-- Field Medical
INSERT INTO public.org_departments (name, function_id, tenant_id, created_at, updated_at)
SELECT 'Field Medical', 
       (SELECT id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1),
       (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL)
ON CONFLICT DO NOTHING;

-- Medical Information Services
INSERT INTO public.org_departments (name, function_id, tenant_id, created_at, updated_at)
SELECT 'Medical Information Services',
       (SELECT id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1),
       (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Medical Information Services' AND deleted_at IS NULL)
ON CONFLICT DO NOTHING;

-- Scientific Communications
INSERT INTO public.org_departments (name, function_id, tenant_id, created_at, updated_at)
SELECT 'Scientific Communications',
       (SELECT id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1),
       (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Scientific Communications' AND deleted_at IS NULL)
ON CONFLICT DO NOTHING;

-- Medical Education
INSERT INTO public.org_departments (name, function_id, tenant_id, created_at, updated_at)
SELECT 'Medical Education',
       (SELECT id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1),
       (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Medical Education' AND deleted_at IS NULL)
ON CONFLICT DO NOTHING;

-- HEOR & Evidence
INSERT INTO public.org_departments (name, function_id, tenant_id, created_at, updated_at)
SELECT 'HEOR & Evidence',
       (SELECT id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1),
       (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'HEOR & Evidence' AND deleted_at IS NULL)
ON CONFLICT DO NOTHING;

-- Publications
INSERT INTO public.org_departments (name, function_id, tenant_id, created_at, updated_at)
SELECT 'Publications',
       (SELECT id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1),
       (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Publications' AND deleted_at IS NULL)
ON CONFLICT DO NOTHING;

-- Medical Leadership
INSERT INTO public.org_departments (name, function_id, tenant_id, created_at, updated_at)
SELECT 'Medical Leadership',
       (SELECT id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1),
       (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Medical Leadership' AND deleted_at IS NULL)
ON CONFLICT DO NOTHING;

-- Clinical Operations Support
INSERT INTO public.org_departments (name, function_id, tenant_id, created_at, updated_at)
SELECT 'Clinical Operations Support',
       (SELECT id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1),
       (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Clinical Operations Support' AND deleted_at IS NULL)
ON CONFLICT DO NOTHING;

-- Medical Excellence & Compliance
INSERT INTO public.org_departments (name, function_id, tenant_id, created_at, updated_at)
SELECT 'Medical Excellence & Compliance',
       (SELECT id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1),
       (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.org_departments WHERE name = 'Medical Excellence & Compliance' AND deleted_at IS NULL)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- STEP 2: CREATE/UPDATE ROLES AND MAP TO DEPARTMENTS
-- =====================================================================

DO $$
DECLARE
    pharma_tenant_id UUID;
    medical_affairs_function_id UUID;
    dept_id UUID;
    role_id_var UUID;
BEGIN
    -- Get IDs
    SELECT id INTO pharma_tenant_id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1;
    SELECT id INTO medical_affairs_function_id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1;
    
    -- =====================================================================
    -- FIELD MEDICAL ROLES
    -- =====================================================================
    SELECT id INTO dept_id FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL LIMIT 1;
    
    -- Global Field Medical Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Global Field Medical Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Regional Field Medical Director
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Regional Field Medical Director', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Local Field Medical Team Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Local Field Medical Team Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Local Medical Science Liaison (MSL)
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Local Medical Science Liaison (MSL)', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Regional Medical Science Liaison
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Regional Medical Science Liaison', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Senior Medical Science Liaison
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Senior Medical Science Liaison', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Field Team Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Field Team Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Scientific Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Scientific Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- =====================================================================
    -- MEDICAL INFORMATION SERVICES ROLES
    -- =====================================================================
    SELECT id INTO dept_id FROM public.org_departments WHERE name = 'Medical Information Services' AND deleted_at IS NULL LIMIT 1;
    
    -- Global Medical Information Director
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Global Medical Information Director', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Regional Medical Information Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Regional Medical Information Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Local Medical Information Specialist
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Local Medical Information Specialist', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- MI Operations Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('MI Operations Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Info Associate/Scientist
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Info Associate/Scientist', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Information Specialist
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Information Specialist', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Information Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Information Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Info Associate
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Info Associate', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Info Scientist
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Info Scientist', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- =====================================================================
    -- SCIENTIFIC COMMUNICATIONS ROLES
    -- =====================================================================
    SELECT id INTO dept_id FROM public.org_departments WHERE name = 'Scientific Communications' AND deleted_at IS NULL LIMIT 1;
    
    -- Global Scientific Communications Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Global Scientific Communications Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Regional Scientific Communications Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Regional Scientific Communications Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Local Scientific Communications Specialist
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Local Scientific Communications Specialist', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Publications Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Publications Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Writer
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Writer', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Scientific Communications Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Scientific Communications Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Scientific Affairs Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Scientific Affairs Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Communications Specialist
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Communications Specialist', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- =====================================================================
    -- MEDICAL EDUCATION ROLES
    -- =====================================================================
    SELECT id INTO dept_id FROM public.org_departments WHERE name = 'Medical Education' AND deleted_at IS NULL LIMIT 1;
    
    -- Global Medical Education Director
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Global Medical Education Director', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Regional Medical Education Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Regional Medical Education Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Local Medical Education Specialist
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Local Medical Education Specialist', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Digital Medical Education Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Digital Medical Education Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Education Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Education Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Education Strategist
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Education Strategist', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Scientific Trainer
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Scientific Trainer', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- =====================================================================
    -- HEOR & EVIDENCE ROLES
    -- =====================================================================
    SELECT id INTO dept_id FROM public.org_departments WHERE name = 'HEOR & Evidence' AND deleted_at IS NULL LIMIT 1;
    
    -- Global HEOR Director
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Global HEOR Director', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Regional HEOR Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Regional HEOR Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Local HEOR Specialist
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Local HEOR Specialist', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Real-World Evidence Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Real-World Evidence Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Economic Modeler
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Economic Modeler', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- HEOR Director
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('HEOR Director', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- HEOR Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('HEOR Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- HEOR Project Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('HEOR Project Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- =====================================================================
    -- PUBLICATIONS ROLES
    -- =====================================================================
    SELECT id INTO dept_id FROM public.org_departments WHERE name = 'Publications' AND deleted_at IS NULL LIMIT 1;
    
    -- Global Publications Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Global Publications Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Regional Publications Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Regional Publications Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Local Publication Planner
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Local Publication Planner', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Publications Coordinator
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Publications Coordinator', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Publications Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Publications Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Publication Planner
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Publication Planner', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- =====================================================================
    -- MEDICAL LEADERSHIP ROLES
    -- =====================================================================
    SELECT id INTO dept_id FROM public.org_departments WHERE name = 'Medical Leadership' AND deleted_at IS NULL LIMIT 1;
    
    -- Chief Medical Officer (Global CMO)
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Chief Medical Officer (Global CMO)', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Regional Medical Affairs Lead (VP/Director)
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Regional Medical Affairs Lead (VP/Director)', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Local Medical Affairs Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Local Medical Affairs Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Senior Medical Director
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Senior Medical Director', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Country Medical Director
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Country Medical Director', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Chief Medical Officer (CMO)
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Chief Medical Officer (CMO)', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- VP Medical Affairs
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('VP Medical Affairs', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Affairs Director
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Affairs Director', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- =====================================================================
    -- CLINICAL OPERATIONS SUPPORT ROLES
    -- =====================================================================
    SELECT id INTO dept_id FROM public.org_departments WHERE name = 'Clinical Operations Support' AND deleted_at IS NULL LIMIT 1;
    
    -- Global Clinical Operations Liaison
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Global Clinical Operations Liaison', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Regional Clinical Ops Support Manager
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Regional Clinical Ops Support Manager', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Local Medical Liaison, Clinical Trials
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Local Medical Liaison, Clinical Trials', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Clinical Operations Liaison
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Clinical Operations Liaison', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Clinical Ops Support Analyst
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Clinical Ops Support Analyst', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Liaison Clinical Trials
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Liaison Clinical Trials', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- =====================================================================
    -- MEDICAL EXCELLENCE & COMPLIANCE ROLES
    -- =====================================================================
    SELECT id INTO dept_id FROM public.org_departments WHERE name = 'Medical Excellence & Compliance' AND deleted_at IS NULL LIMIT 1;
    
    -- Global Medical Excellence Director
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Global Medical Excellence Director', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Regional Medical Excellence Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Regional Medical Excellence Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Local Medical Excellence Specialist
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Local Medical Excellence Specialist', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Compliance Specialist
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Compliance Specialist', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Governance Officer
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Governance Officer', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Medical Excellence Lead
    INSERT INTO public.org_roles (name, function_id, department_id, tenant_id, created_at, updated_at)
    VALUES ('Medical Excellence Lead', medical_affairs_function_id, dept_id, pharma_tenant_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Roles created/updated successfully';
END $$;

-- =====================================================================
-- STEP 3: UPDATE EXISTING ROLES TO CORRECT DEPARTMENTS
-- =====================================================================

-- Update existing roles to match new department structure
DO $$
DECLARE
    pharma_tenant_id UUID;
    medical_affairs_function_id UUID;
BEGIN
    SELECT id INTO pharma_tenant_id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1;
    SELECT id INTO medical_affairs_function_id FROM public.org_functions WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%') AND deleted_at IS NULL LIMIT 1;
    
    -- Map existing roles to new departments
    -- Field Medical roles
    UPDATE public.org_roles r
    SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL LIMIT 1),
        function_id = medical_affairs_function_id,
        updated_at = NOW()
    WHERE r.deleted_at IS NULL
      AND r.tenant_id = pharma_tenant_id
      AND r.name ILIKE '%msl%'
      AND r.name ILIKE '%medical science liaison%'
      AND r.name ILIKE '%field medical%';
    
    -- Medical Information roles
    UPDATE public.org_roles r
    SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Information Services' AND deleted_at IS NULL LIMIT 1),
        function_id = medical_affairs_function_id,
        updated_at = NOW()
    WHERE r.deleted_at IS NULL
      AND r.tenant_id = pharma_tenant_id
      AND (r.name ILIKE '%medical information%' OR r.name ILIKE '%medical info%');
    
    -- Medical Communications roles
    UPDATE public.org_roles r
    SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Scientific Communications' AND deleted_at IS NULL LIMIT 1),
        function_id = medical_affairs_function_id,
        updated_at = NOW()
    WHERE r.deleted_at IS NULL
      AND r.tenant_id = pharma_tenant_id
      AND (r.name ILIKE '%medical communication%' OR r.name ILIKE '%medical writer%' AND r.name NOT ILIKE '%publication%');
    
    -- Medical Education roles
    UPDATE public.org_roles r
    SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Education' AND deleted_at IS NULL LIMIT 1),
        function_id = medical_affairs_function_id,
        updated_at = NOW()
    WHERE r.deleted_at IS NULL
      AND r.tenant_id = pharma_tenant_id
      AND (r.name ILIKE '%medical education%' OR r.name ILIKE '%medical training%');
    
    -- HEOR roles
    UPDATE public.org_roles r
    SET department_id = (SELECT id FROM public.org_departments WHERE name = 'HEOR & Evidence' AND deleted_at IS NULL LIMIT 1),
        function_id = medical_affairs_function_id,
        updated_at = NOW()
    WHERE r.deleted_at IS NULL
      AND r.tenant_id = pharma_tenant_id
      AND (r.name ILIKE '%heor%' OR r.name ILIKE '%health economics%' OR r.name ILIKE '%epidemiologist%' OR r.name ILIKE '%evidence%');
    
    -- Publications roles
    UPDATE public.org_roles r
    SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Publications' AND deleted_at IS NULL LIMIT 1),
        function_id = medical_affairs_function_id,
        updated_at = NOW()
    WHERE r.deleted_at IS NULL
      AND r.tenant_id = pharma_tenant_id
      AND (r.name ILIKE '%publication%' OR (r.name ILIKE '%medical writer%' AND r.name ILIKE '%publication%'));
    
    -- Leadership roles
    UPDATE public.org_roles r
    SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Leadership' AND deleted_at IS NULL LIMIT 1),
        function_id = medical_affairs_function_id,
        updated_at = NOW()
    WHERE r.deleted_at IS NULL
      AND r.tenant_id = pharma_tenant_id
      AND (r.name ILIKE '%chief medical%' OR r.name ILIKE '%vp medical%' OR r.name ILIKE '%medical director%' OR r.name ILIKE '%medical affairs director%');
    
    -- Clinical Operations Support roles
    UPDATE public.org_roles r
    SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Clinical Operations Support' AND deleted_at IS NULL LIMIT 1),
        function_id = medical_affairs_function_id,
        updated_at = NOW()
    WHERE r.deleted_at IS NULL
      AND r.tenant_id = pharma_tenant_id
      AND (r.name ILIKE '%safety physician%' OR r.name ILIKE '%study site medical%' OR r.name ILIKE '%medical monitor%' OR r.name ILIKE '%clinical operations%');
    
    -- Medical Excellence roles
    UPDATE public.org_roles r
    SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Excellence & Compliance' AND deleted_at IS NULL LIMIT 1),
        function_id = medical_affairs_function_id,
        updated_at = NOW()
    WHERE r.deleted_at IS NULL
      AND r.tenant_id = pharma_tenant_id
      AND (r.name ILIKE '%medical excellence%' OR r.name ILIKE '%medical compliance%' OR r.name ILIKE '%medical qa%' OR r.name ILIKE '%medical governance%');
    
    RAISE NOTICE 'Existing roles updated to new structure';
END $$;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 
    '=== VERIFICATION: Medical Affairs Structure ===' as section;

SELECT 
    d.name as department_name,
    COUNT(DISTINCT r.id) as role_count,
    COUNT(DISTINCT p.id) as persona_count
FROM public.org_departments d
LEFT JOIN public.org_roles r ON r.department_id = d.id AND r.deleted_at IS NULL
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE d.deleted_at IS NULL
  AND d.name IN (
    'Field Medical',
    'Medical Information Services',
    'Scientific Communications',
    'Medical Education',
    'HEOR & Evidence',
    'Publications',
    'Medical Leadership',
    'Clinical Operations Support',
    'Medical Excellence & Compliance'
  )
GROUP BY d.id, d.name
ORDER BY d.name;

COMMIT;

