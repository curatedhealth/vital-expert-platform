-- Fix role_geographic_scopes table
-- Drop and recreate with proper structure

DO $$
BEGIN
    -- Drop the existing table if it exists
    DROP TABLE IF EXISTS public.role_geographic_scopes CASCADE;
    RAISE NOTICE '✓ Dropped existing role_geographic_scopes table';
    
    -- Check if geographies table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geographies') THEN
        -- Create with foreign key
        CREATE TABLE public.role_geographic_scopes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            geography_id UUID NOT NULL REFERENCES public.geographies(id) ON DELETE CASCADE,
            scope_type TEXT CHECK (scope_type IN ('primary', 'secondary', 'coverage')),
            sequence_order INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, geography_id)
        );
        RAISE NOTICE '✓ Created role_geographic_scopes with geography FK';
    ELSE
        -- Create without foreign key
        CREATE TABLE public.role_geographic_scopes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            geography_id UUID NOT NULL,
            geography_name TEXT,
            scope_type TEXT CHECK (scope_type IN ('primary', 'secondary', 'coverage')),
            sequence_order INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, geography_id)
        );
        RAISE NOTICE '⚠ Created role_geographic_scopes without geography FK (geographies table does not exist)';
    END IF;
    
    -- Create indexes
    CREATE INDEX idx_role_geographic_scopes_role ON public.role_geographic_scopes(role_id);
    CREATE INDEX idx_role_geographic_scopes_geo ON public.role_geographic_scopes(geography_id);
    
    RAISE NOTICE '✓ Indexes created';
    RAISE NOTICE '';
    RAISE NOTICE 'role_geographic_scopes table is ready!';
END $$;

