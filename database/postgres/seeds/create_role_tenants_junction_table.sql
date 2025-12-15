-- =============================================
-- Create Role-Tenant Junction Table
-- Migrate from single tenant_id to many-to-many
-- =============================================

-- STEP 1: Create junction table
CREATE TABLE IF NOT EXISTS public.role_tenants (
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, tenant_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_tenants_role_id ON public.role_tenants(role_id);
CREATE INDEX IF NOT EXISTS idx_role_tenants_tenant_id ON public.role_tenants(tenant_id);

-- Add RLS policy (if using RLS)
ALTER TABLE public.role_tenants ENABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE public.role_tenants IS 'Junction table mapping roles to multiple tenants (many-to-many)';

RAISE NOTICE '✓ Created role_tenants junction table';

-- STEP 2: Migrate existing tenant_id data to junction table
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

RAISE NOTICE '✓ Migrated existing tenant_id data to role_tenants junction table';

-- STEP 3: Drop the unique constraint on (tenant_id, slug) since roles can now have multiple tenants
ALTER TABLE public.org_roles DROP CONSTRAINT IF EXISTS org_roles_tenant_id_slug_key;

RAISE NOTICE '✓ Removed (tenant_id, slug) unique constraint';

-- STEP 4: Add new unique constraint on slug only (across all tenants)
-- Or keep slug unique per role if you want different tenants to have different role names
ALTER TABLE public.org_roles ADD CONSTRAINT IF NOT EXISTS org_roles_slug_key UNIQUE (slug);

RAISE NOTICE '✓ Added unique constraint on slug';

-- STEP 5: Make tenant_id nullable (it will be deprecated in favor of junction table)
ALTER TABLE public.org_roles ALTER COLUMN tenant_id DROP NOT NULL;

RAISE NOTICE '✓ Made tenant_id nullable (will be deprecated)';

-- STEP 6: Add comment to tenant_id indicating it's deprecated
COMMENT ON COLUMN public.org_roles.tenant_id IS 'DEPRECATED: Use role_tenants junction table instead. This column is kept for backward compatibility.';

RAISE NOTICE '✓ Marked tenant_id as deprecated';

-- Verification
SELECT 
    COUNT(*) as total_role_tenant_mappings,
    COUNT(DISTINCT role_id) as unique_roles,
    COUNT(DISTINCT tenant_id) as unique_tenants
FROM public.role_tenants;

