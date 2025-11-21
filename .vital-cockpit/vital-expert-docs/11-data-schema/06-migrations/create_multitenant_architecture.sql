-- =============================================
-- Create Multi-Tenant Junction Tables
-- Functions, Departments, Roles → Multiple Tenants
-- =============================================

-- =============================================
-- STEP 1: Create Junction Tables
-- =============================================

-- 1.1 Function-Tenant Junction Table
CREATE TABLE IF NOT EXISTS public.function_tenants (
    function_id UUID NOT NULL REFERENCES public.org_functions(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (function_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_function_tenants_function_id ON public.function_tenants(function_id);
CREATE INDEX IF NOT EXISTS idx_function_tenants_tenant_id ON public.function_tenants(tenant_id);

ALTER TABLE public.function_tenants ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.function_tenants IS 'Junction table: functions can be available to multiple tenants';

-- 1.2 Department-Tenant Junction Table
CREATE TABLE IF NOT EXISTS public.department_tenants (
    department_id UUID NOT NULL REFERENCES public.org_departments(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (department_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_department_tenants_department_id ON public.department_tenants(department_id);
CREATE INDEX IF NOT EXISTS idx_department_tenants_tenant_id ON public.department_tenants(tenant_id);

ALTER TABLE public.department_tenants ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.department_tenants IS 'Junction table: departments can be available to multiple tenants';

-- 1.3 Role-Tenant Junction Table
CREATE TABLE IF NOT EXISTS public.role_tenants (
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_role_tenants_role_id ON public.role_tenants(role_id);
CREATE INDEX IF NOT EXISTS idx_role_tenants_tenant_id ON public.role_tenants(tenant_id);

ALTER TABLE public.role_tenants ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.role_tenants IS 'Junction table: roles can be available to multiple tenants';

-- =============================================
-- STEP 2: Migrate Existing Data to Junction Tables
-- =============================================

-- 2.1 Migrate Functions
INSERT INTO public.function_tenants (function_id, tenant_id, created_at, updated_at)
SELECT 
    id as function_id,
    tenant_id,
    NOW() as created_at,
    NOW() as updated_at
FROM public.org_functions
WHERE tenant_id IS NOT NULL
  AND deleted_at IS NULL
ON CONFLICT (function_id, tenant_id) DO NOTHING;

-- 2.2 Migrate Departments
INSERT INTO public.department_tenants (department_id, tenant_id, created_at, updated_at)
SELECT 
    id as department_id,
    tenant_id,
    NOW() as created_at,
    NOW() as updated_at
FROM public.org_departments
WHERE tenant_id IS NOT NULL
  AND deleted_at IS NULL
ON CONFLICT (department_id, tenant_id) DO NOTHING;

-- 2.3 Migrate Roles
INSERT INTO public.role_tenants (role_id, tenant_id, created_at, updated_at)
SELECT 
    id as role_id,
    tenant_id,
    NOW() as created_at,
    NOW() as updated_at
FROM public.org_roles
WHERE tenant_id IS NOT NULL
  AND deleted_at IS NULL
ON CONFLICT (role_id, tenant_id) DO NOTHING;

-- =============================================
-- STEP 3: Update Schema Constraints
-- =============================================

-- 3.1 Drop unique constraints that include tenant_id
ALTER TABLE public.org_functions DROP CONSTRAINT IF EXISTS org_functions_tenant_id_slug_key;
ALTER TABLE public.org_functions DROP CONSTRAINT IF EXISTS org_functions_tenant_id_name_key;

ALTER TABLE public.org_departments DROP CONSTRAINT IF EXISTS org_departments_tenant_id_slug_key;
ALTER TABLE public.org_departments DROP CONSTRAINT IF EXISTS org_departments_tenant_id_name_key;

ALTER TABLE public.org_roles DROP CONSTRAINT IF EXISTS org_roles_tenant_id_slug_key;
ALTER TABLE public.org_roles DROP CONSTRAINT IF EXISTS org_roles_tenant_id_name_key;

-- 3.2 Add new unique constraints on slug only (globally unique)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'org_functions_slug_key'
    ) THEN
        ALTER TABLE public.org_functions ADD CONSTRAINT org_functions_slug_key UNIQUE (slug);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'org_departments_slug_key'
    ) THEN
        ALTER TABLE public.org_departments ADD CONSTRAINT org_departments_slug_key UNIQUE (slug);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'org_roles_slug_key'
    ) THEN
        ALTER TABLE public.org_roles ADD CONSTRAINT org_roles_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 3.3 Make tenant_id nullable (deprecated column)
ALTER TABLE public.org_functions ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE public.org_departments ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE public.org_roles ALTER COLUMN tenant_id DROP NOT NULL;

-- 3.4 Add deprecation comments
COMMENT ON COLUMN public.org_functions.tenant_id IS 'DEPRECATED: Use function_tenants junction table. Kept for backward compatibility.';
COMMENT ON COLUMN public.org_departments.tenant_id IS 'DEPRECATED: Use department_tenants junction table. Kept for backward compatibility.';
COMMENT ON COLUMN public.org_roles.tenant_id IS 'DEPRECATED: Use role_tenants junction table. Kept for backward compatibility.';

-- =============================================
-- STEP 4: Create Helper Views
-- =============================================

-- 4.1 View: Functions with their tenants
CREATE OR REPLACE VIEW public.v_functions_with_tenants AS
SELECT 
    f.id as function_id,
    f.name as function_name,
    f.slug as function_slug,
    f.tenant_id as deprecated_tenant_id,
    ARRAY_AGG(ft.tenant_id ORDER BY t.name) as tenant_ids,
    ARRAY_AGG(t.name ORDER BY t.name) as tenant_names,
    COUNT(ft.tenant_id) as tenant_count
FROM public.org_functions f
LEFT JOIN public.function_tenants ft ON f.id = ft.function_id
LEFT JOIN public.tenants t ON ft.tenant_id = t.id
WHERE f.deleted_at IS NULL
GROUP BY f.id, f.name, f.slug, f.tenant_id;

COMMENT ON VIEW public.v_functions_with_tenants IS 'Shows functions with all their mapped tenants';

-- 4.2 View: Departments with their tenants
CREATE OR REPLACE VIEW public.v_departments_with_tenants AS
SELECT 
    d.id as department_id,
    d.name as department_name,
    d.slug as department_slug,
    d.function_id,
    d.tenant_id as deprecated_tenant_id,
    ARRAY_AGG(dt.tenant_id ORDER BY t.name) as tenant_ids,
    ARRAY_AGG(t.name ORDER BY t.name) as tenant_names,
    COUNT(dt.tenant_id) as tenant_count
FROM public.org_departments d
LEFT JOIN public.department_tenants dt ON d.id = dt.department_id
LEFT JOIN public.tenants t ON dt.tenant_id = t.id
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.name, d.slug, d.function_id, d.tenant_id;

COMMENT ON VIEW public.v_departments_with_tenants IS 'Shows departments with all their mapped tenants';

-- 4.3 View: Roles with their tenants
CREATE OR REPLACE VIEW public.v_roles_with_tenants AS
SELECT 
    r.id as role_id,
    r.name as role_name,
    r.slug as role_slug,
    r.function_id,
    r.department_id,
    r.tenant_id as deprecated_tenant_id,
    ARRAY_AGG(rt.tenant_id ORDER BY t.name) as tenant_ids,
    ARRAY_AGG(t.name ORDER BY t.name) as tenant_names,
    COUNT(rt.tenant_id) as tenant_count
FROM public.org_roles r
LEFT JOIN public.role_tenants rt ON r.id = rt.role_id
LEFT JOIN public.tenants t ON rt.tenant_id = t.id
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name, r.slug, r.function_id, r.department_id, r.tenant_id;

COMMENT ON VIEW public.v_roles_with_tenants IS 'Shows roles with all their mapped tenants';

-- =============================================
-- Verification Queries
-- =============================================

SELECT '=== JUNCTION TABLE COUNTS ===' as section;

SELECT 
    'function_tenants' as table_name,
    COUNT(*) as mapping_count,
    COUNT(DISTINCT function_id) as unique_functions,
    COUNT(DISTINCT tenant_id) as unique_tenants
FROM public.function_tenants
UNION ALL
SELECT 
    'department_tenants' as table_name,
    COUNT(*) as mapping_count,
    COUNT(DISTINCT department_id) as unique_departments,
    COUNT(DISTINCT tenant_id) as unique_tenants
FROM public.department_tenants
UNION ALL
SELECT 
    'role_tenants' as table_name,
    COUNT(*) as mapping_count,
    COUNT(DISTINCT role_id) as unique_roles,
    COUNT(DISTINCT tenant_id) as unique_tenants
FROM public.role_tenants;

-- Show sample data
SELECT '=== SAMPLE: FUNCTIONS WITH TENANTS ===' as section;
SELECT * FROM public.v_functions_with_tenants LIMIT 5;

SELECT '=== SAMPLE: DEPARTMENTS WITH TENANTS ===' as section;
SELECT * FROM public.v_departments_with_tenants LIMIT 5;

SELECT '=== SAMPLE: ROLES WITH TENANTS ===' as section;
SELECT * FROM public.v_roles_with_tenants LIMIT 5;

