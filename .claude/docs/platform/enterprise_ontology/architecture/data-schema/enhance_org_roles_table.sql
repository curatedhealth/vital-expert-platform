-- =====================================================================
-- PHASE 2.1: ENHANCE ORG_ROLES TABLE
-- Adds role baseline attributes for scope, budget, domain, hierarchy
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ENHANCING ORG_ROLES TABLE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. ADD SCOPE ATTRIBUTES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Adding scope attributes...'; END $$;

DO $$
BEGIN
    -- Team size
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'team_size_min') THEN
        ALTER TABLE public.org_roles ADD COLUMN team_size_min INTEGER;
        RAISE NOTICE '  ✓ Added team_size_min';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'team_size_max') THEN
        ALTER TABLE public.org_roles ADD COLUMN team_size_max INTEGER;
        RAISE NOTICE '  ✓ Added team_size_max';
    END IF;
    
    -- Direct reports
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'direct_reports_min') THEN
        ALTER TABLE public.org_roles ADD COLUMN direct_reports_min INTEGER;
        RAISE NOTICE '  ✓ Added direct_reports_min';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'direct_reports_max') THEN
        ALTER TABLE public.org_roles ADD COLUMN direct_reports_max INTEGER;
        RAISE NOTICE '  ✓ Added direct_reports_max';
    END IF;
    
    -- Travel percentage
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'travel_percentage_min') THEN
        ALTER TABLE public.org_roles ADD COLUMN travel_percentage_min INTEGER;
        RAISE NOTICE '  ✓ Added travel_percentage_min';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'travel_percentage_max') THEN
        ALTER TABLE public.org_roles ADD COLUMN travel_percentage_max INTEGER;
        RAISE NOTICE '  ✓ Added travel_percentage_max';
    END IF;
END $$;

-- =====================================================================
-- 2. ADD BUDGET ATTRIBUTES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Adding budget attributes...'; END $$;

DO $$
BEGIN
    -- Budget range
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'budget_min_usd') THEN
        ALTER TABLE public.org_roles ADD COLUMN budget_min_usd BIGINT;
        RAISE NOTICE '  ✓ Added budget_min_usd';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'budget_max_usd') THEN
        ALTER TABLE public.org_roles ADD COLUMN budget_max_usd BIGINT;
        RAISE NOTICE '  ✓ Added budget_max_usd';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'budget_currency') THEN
        ALTER TABLE public.org_roles ADD COLUMN budget_currency TEXT DEFAULT 'USD';
        RAISE NOTICE '  ✓ Added budget_currency';
    END IF;
    
    -- Budget authority
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'budget_authority_min') THEN
        ALTER TABLE public.org_roles ADD COLUMN budget_authority_min BIGINT;
        RAISE NOTICE '  ✓ Added budget_authority_min';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'budget_authority_max') THEN
        ALTER TABLE public.org_roles ADD COLUMN budget_authority_max BIGINT;
        RAISE NOTICE '  ✓ Added budget_authority_max';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'budget_authority_type') THEN
        ALTER TABLE public.org_roles ADD COLUMN budget_authority_type TEXT;
        RAISE NOTICE '  ✓ Added budget_authority_type';
    END IF;
END $$;

-- =====================================================================
-- 3. ADD DOMAIN ATTRIBUTES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '3. Adding domain attributes...'; END $$;

DO $$
BEGIN
    -- Organization context
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'typical_organization_size') THEN
        ALTER TABLE public.org_roles ADD COLUMN typical_organization_size TEXT;
        RAISE NOTICE '  ✓ Added typical_organization_size';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'organization_type') THEN
        ALTER TABLE public.org_roles ADD COLUMN organization_type TEXT;
        RAISE NOTICE '  ✓ Added organization_type';
    END IF;
    
    -- Product lifecycle stages
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'product_lifecycle_stages') THEN
        ALTER TABLE public.org_roles ADD COLUMN product_lifecycle_stages TEXT[];
        RAISE NOTICE '  ✓ Added product_lifecycle_stages';
    END IF;
END $$;

-- =====================================================================
-- 4. ADD HIERARCHY ATTRIBUTES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '4. Adding hierarchy attributes...'; END $$;

DO $$
BEGIN
    -- Reporting structure
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'reports_to_role_id') THEN
        ALTER TABLE public.org_roles ADD COLUMN reports_to_role_id UUID REFERENCES public.org_roles(id);
        RAISE NOTICE '  ✓ Added reports_to_role_id';
    END IF;
    
    -- Update role_category if needed (might already exist from org structure setup)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'role_category') THEN
        RAISE NOTICE '  ✓ role_category already exists';
    END IF;
END $$;

-- =====================================================================
-- 5. ADD EXPERIENCE ATTRIBUTES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '5. Adding experience attributes...'; END $$;

DO $$
BEGIN
    -- Years of experience ranges
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'min_years_experience') THEN
        ALTER TABLE public.org_roles ADD COLUMN min_years_experience INTEGER;
        RAISE NOTICE '  ✓ Added min_years_experience';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'max_years_experience') THEN
        ALTER TABLE public.org_roles ADD COLUMN max_years_experience INTEGER;
        RAISE NOTICE '  ✓ Added max_years_experience';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'typical_education_level') THEN
        ALTER TABLE public.org_roles ADD COLUMN typical_education_level TEXT;
        RAISE NOTICE '  ✓ Added typical_education_level';
    END IF;
END $$;

-- =====================================================================
-- 6. ADD WORK MODEL ATTRIBUTES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '6. Adding work model attributes...'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'work_location_model') THEN
        ALTER TABLE public.org_roles ADD COLUMN work_location_model TEXT;
        RAISE NOTICE '  ✓ Added work_location_model';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'typical_work_pattern') THEN
        ALTER TABLE public.org_roles ADD COLUMN typical_work_pattern TEXT;
        RAISE NOTICE '  ✓ Added typical_work_pattern';
    END IF;
END $$;

-- =====================================================================
-- 7. CREATE INDEXES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '7. Creating indexes...'; END $$;

CREATE INDEX IF NOT EXISTS idx_org_roles_reports_to ON public.org_roles(reports_to_role_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_team_size ON public.org_roles(team_size_min, team_size_max);
CREATE INDEX IF NOT EXISTS idx_org_roles_budget ON public.org_roles(budget_min_usd, budget_max_usd);
CREATE INDEX IF NOT EXISTS idx_org_roles_org_size ON public.org_roles(typical_organization_size);
CREATE INDEX IF NOT EXISTS idx_org_roles_experience ON public.org_roles(min_years_experience, max_years_experience);

DO $$ BEGIN RAISE NOTICE '  ✓ Indexes created'; END $$;

-- =====================================================================
-- 8. SUMMARY
-- =====================================================================

DO $$
DECLARE
    total_roles INTEGER;
    roles_with_scope INTEGER;
    roles_with_budget INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_roles FROM public.org_roles WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO roles_with_scope FROM public.org_roles WHERE team_size_min IS NOT NULL;
    SELECT COUNT(*) INTO roles_with_budget FROM public.org_roles WHERE budget_min_usd IS NOT NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ORG_ROLES TABLE ENHANCED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'New Attributes Added:';
    RAISE NOTICE '  ✓ Scope: team_size, direct_reports, travel_percentage';
    RAISE NOTICE '  ✓ Budget: budget_min/max, budget_authority, currency';
    RAISE NOTICE '  ✓ Domain: organization_size, organization_type, product_lifecycle';
    RAISE NOTICE '  ✓ Hierarchy: reports_to_role_id';
    RAISE NOTICE '  ✓ Experience: min/max_years_experience, education_level';
    RAISE NOTICE '  ✓ Work Model: location_model, work_pattern';
    RAISE NOTICE '';
    RAISE NOTICE 'Role Statistics:';
    RAISE NOTICE '  • Total roles: %', total_roles;
    RAISE NOTICE '  • Roles with scope data: %', roles_with_scope;
    RAISE NOTICE '  • Roles with budget data: %', roles_with_budget;
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Create role junction tables (create_role_junctions.sql)';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;
