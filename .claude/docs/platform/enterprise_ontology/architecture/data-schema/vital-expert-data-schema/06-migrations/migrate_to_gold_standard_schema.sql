-- =====================================================================
-- SCHEMA MIGRATION: Add Gold Standard Columns to Existing Tables
-- This script enhances existing org tables with new gold standard attributes
-- Safe to run multiple times (idempotent)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MIGRATING TO GOLD STANDARD SCHEMA';
    RAISE NOTICE 'Adding enhancement columns to existing tables';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- ENHANCE ORG_FUNCTIONS
-- =====================================================================

DO $$ 
BEGIN
    RAISE NOTICE 'Enhancing org_functions table...';
    
    -- Add mission_statement
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_functions' 
                   AND column_name = 'mission_statement') THEN
        ALTER TABLE public.org_functions ADD COLUMN mission_statement TEXT;
        RAISE NOTICE '  ✓ Added column: mission_statement';
    ELSE
        RAISE NOTICE '  - Column already exists: mission_statement';
    END IF;
    
    -- Add regulatory_sensitivity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_functions' 
                   AND column_name = 'regulatory_sensitivity') THEN
        ALTER TABLE public.org_functions ADD COLUMN regulatory_sensitivity regulatory_sensitivity_type DEFAULT 'medium';
        RAISE NOTICE '  ✓ Added column: regulatory_sensitivity';
    ELSE
        RAISE NOTICE '  - Column already exists: regulatory_sensitivity';
    END IF;
    
    -- Add strategic_priority
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_functions' 
                   AND column_name = 'strategic_priority') THEN
        ALTER TABLE public.org_functions ADD COLUMN strategic_priority INTEGER CHECK (strategic_priority >= 0 AND strategic_priority <= 100);
        RAISE NOTICE '  ✓ Added column: strategic_priority';
    ELSE
        RAISE NOTICE '  - Column already exists: strategic_priority';
    END IF;
END $$;

-- =====================================================================
-- ENHANCE ORG_DEPARTMENTS
-- =====================================================================

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Enhancing org_departments table...';
    
    -- Add operating_model
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_departments' 
                   AND column_name = 'operating_model') THEN
        ALTER TABLE public.org_departments ADD COLUMN operating_model operating_model_type DEFAULT 'hybrid';
        RAISE NOTICE '  ✓ Added column: operating_model';
    ELSE
        RAISE NOTICE '  - Column already exists: operating_model';
    END IF;
    
    -- Add field_vs_office_mix
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_departments' 
                   AND column_name = 'field_vs_office_mix') THEN
        ALTER TABLE public.org_departments ADD COLUMN field_vs_office_mix INTEGER CHECK (field_vs_office_mix >= 0 AND field_vs_office_mix <= 100);
        RAISE NOTICE '  ✓ Added column: field_vs_office_mix';
    ELSE
        RAISE NOTICE '  - Column already exists: field_vs_office_mix';
    END IF;
    
    -- Add typical_team_size_min
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_departments' 
                   AND column_name = 'typical_team_size_min') THEN
        ALTER TABLE public.org_departments ADD COLUMN typical_team_size_min INTEGER;
        RAISE NOTICE '  ✓ Added column: typical_team_size_min';
    ELSE
        RAISE NOTICE '  - Column already exists: typical_team_size_min';
    END IF;
    
    -- Add typical_team_size_max
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_departments' 
                   AND column_name = 'typical_team_size_max') THEN
        ALTER TABLE public.org_departments ADD COLUMN typical_team_size_max INTEGER;
        RAISE NOTICE '  ✓ Added column: typical_team_size_max';
    ELSE
        RAISE NOTICE '  - Column already exists: typical_team_size_max';
    END IF;
END $$;

-- =====================================================================
-- ENHANCE ORG_ROLES
-- =====================================================================

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Enhancing org_roles table...';
    
    -- Add role_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'role_type') THEN
        ALTER TABLE public.org_roles ADD COLUMN role_type TEXT;
        RAISE NOTICE '  ✓ Added column: role_type';
    ELSE RAISE NOTICE '  - Column already exists: role_type'; END IF;
    
    -- Add role_category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'role_category') THEN
        ALTER TABLE public.org_roles ADD COLUMN role_category role_category_type;
        RAISE NOTICE '  ✓ Added column: role_category';
    ELSE RAISE NOTICE '  - Column already exists: role_category'; END IF;
    
    -- Add reports_to_role_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'reports_to_role_id') THEN
        ALTER TABLE public.org_roles ADD COLUMN reports_to_role_id UUID REFERENCES public.org_roles(id) ON DELETE SET NULL;
        RAISE NOTICE '  ✓ Added column: reports_to_role_id';
    ELSE RAISE NOTICE '  - Column already exists: reports_to_role_id'; END IF;
    
    -- Add seniority_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'seniority_level') THEN
        ALTER TABLE public.org_roles ADD COLUMN seniority_level seniority_level_type;
        RAISE NOTICE '  ✓ Added column: seniority_level';
    ELSE RAISE NOTICE '  - Column already exists: seniority_level'; END IF;
    
    -- Add leadership_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'leadership_level') THEN
        ALTER TABLE public.org_roles ADD COLUMN leadership_level leadership_level_type DEFAULT 'individual_contributor';
        RAISE NOTICE '  ✓ Added column: leadership_level';
    ELSE RAISE NOTICE '  - Column already exists: leadership_level'; END IF;
    
    -- Add job_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'job_code') THEN
        ALTER TABLE public.org_roles ADD COLUMN job_code TEXT;
        RAISE NOTICE '  ✓ Added column: job_code';
    ELSE RAISE NOTICE '  - Column already exists: job_code'; END IF;
    
    -- Add grade_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'grade_level') THEN
        ALTER TABLE public.org_roles ADD COLUMN grade_level INTEGER;
        RAISE NOTICE '  ✓ Added column: grade_level';
    ELSE RAISE NOTICE '  - Column already exists: grade_level'; END IF;
    
    -- Add team_size columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'team_size_min') THEN
        ALTER TABLE public.org_roles ADD COLUMN team_size_min INTEGER;
        RAISE NOTICE '  ✓ Added column: team_size_min';
    ELSE RAISE NOTICE '  - Column already exists: team_size_min'; END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'team_size_max') THEN
        ALTER TABLE public.org_roles ADD COLUMN team_size_max INTEGER;
        RAISE NOTICE '  ✓ Added column: team_size_max';
    ELSE RAISE NOTICE '  - Column already exists: team_size_max'; END IF;
    
    -- Add direct_reports columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'direct_reports_min') THEN
        ALTER TABLE public.org_roles ADD COLUMN direct_reports_min INTEGER;
        RAISE NOTICE '  ✓ Added column: direct_reports_min';
    ELSE RAISE NOTICE '  - Column already exists: direct_reports_min'; END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'direct_reports_max') THEN
        ALTER TABLE public.org_roles ADD COLUMN direct_reports_max INTEGER;
        RAISE NOTICE '  ✓ Added column: direct_reports_max';
    ELSE RAISE NOTICE '  - Column already exists: direct_reports_max'; END IF;
    
    -- Add indirect_reports columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'indirect_reports_min') THEN
        ALTER TABLE public.org_roles ADD COLUMN indirect_reports_min INTEGER;
        RAISE NOTICE '  ✓ Added column: indirect_reports_min';
    ELSE RAISE NOTICE '  - Column already exists: indirect_reports_min'; END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'indirect_reports_max') THEN
        ALTER TABLE public.org_roles ADD COLUMN indirect_reports_max INTEGER;
        RAISE NOTICE '  ✓ Added column: indirect_reports_max';
    ELSE RAISE NOTICE '  - Column already exists: indirect_reports_max'; END IF;
    
    -- Add layers_below
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'layers_below') THEN
        ALTER TABLE public.org_roles ADD COLUMN layers_below INTEGER DEFAULT 0;
        RAISE NOTICE '  ✓ Added column: layers_below';
    ELSE RAISE NOTICE '  - Column already exists: layers_below'; END IF;
    
    -- Add travel columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'travel_percentage_min') THEN
        ALTER TABLE public.org_roles ADD COLUMN travel_percentage_min INTEGER;
        RAISE NOTICE '  ✓ Added column: travel_percentage_min';
    ELSE RAISE NOTICE '  - Column already exists: travel_percentage_min'; END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'travel_percentage_max') THEN
        ALTER TABLE public.org_roles ADD COLUMN travel_percentage_max INTEGER;
        RAISE NOTICE '  ✓ Added column: travel_percentage_max';
    ELSE RAISE NOTICE '  - Column already exists: travel_percentage_max'; END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'international_travel') THEN
        ALTER TABLE public.org_roles ADD COLUMN international_travel BOOLEAN DEFAULT false;
        RAISE NOTICE '  ✓ Added column: international_travel';
    ELSE RAISE NOTICE '  - Column already exists: international_travel'; END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'overnight_travel_frequency') THEN
        ALTER TABLE public.org_roles ADD COLUMN overnight_travel_frequency TEXT;
        RAISE NOTICE '  ✓ Added column: overnight_travel_frequency';
    ELSE RAISE NOTICE '  - Column already exists: overnight_travel_frequency'; END IF;
    
    -- Add budget columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'budget_min_usd') THEN
        ALTER TABLE public.org_roles ADD COLUMN budget_min_usd NUMERIC(15, 2);
        RAISE NOTICE '  ✓ Added column: budget_min_usd';
    ELSE RAISE NOTICE '  - Column already exists: budget_min_usd'; END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'budget_max_usd') THEN
        ALTER TABLE public.org_roles ADD COLUMN budget_max_usd NUMERIC(15, 2);
        RAISE NOTICE '  ✓ Added column: budget_max_usd';
    ELSE RAISE NOTICE '  - Column already exists: budget_max_usd'; END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'budget_authority_type') THEN
        ALTER TABLE public.org_roles ADD COLUMN budget_authority_type budget_authority_type DEFAULT 'none';
        RAISE NOTICE '  ✓ Added column: budget_authority_type';
    ELSE RAISE NOTICE '  - Column already exists: budget_authority_type'; END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'budget_authority_limit') THEN
        ALTER TABLE public.org_roles ADD COLUMN budget_authority_limit NUMERIC(15, 2);
        RAISE NOTICE '  ✓ Added column: budget_authority_limit';
    ELSE RAISE NOTICE '  - Column already exists: budget_authority_limit'; END IF;
    
    -- Add experience columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'years_experience_min') THEN
        ALTER TABLE public.org_roles ADD COLUMN years_experience_min INTEGER;
        RAISE NOTICE '  ✓ Added column: years_experience_min';
    ELSE RAISE NOTICE '  - Column already exists: years_experience_min'; END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_roles' AND column_name = 'years_experience_max') THEN
        ALTER TABLE public.org_roles ADD COLUMN years_experience_max INTEGER;
        RAISE NOTICE '  ✓ Added column: years_experience_max';
    ELSE RAISE NOTICE '  - Column already exists: years_experience_max'; END IF;
END $$;

-- =====================================================================
-- ENHANCE REFERENCE TABLES
-- =====================================================================

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Ensuring all reference tables exist with proper structure...';
    
    -- Create skills table if not exists
    CREATE TABLE IF NOT EXISTS public.skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    -- Add category column to skills
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'skills' 
                   AND column_name = 'category') THEN
        ALTER TABLE public.skills ADD COLUMN category TEXT;
        RAISE NOTICE '  ✓ Added column skills.category';
    ELSE
        RAISE NOTICE '  - Column already exists: skills.category';
    END IF;
    
    -- Add description column to skills
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'skills' 
                   AND column_name = 'description') THEN
        ALTER TABLE public.skills ADD COLUMN description TEXT;
        RAISE NOTICE '  ✓ Added column skills.description';
    ELSE
        RAISE NOTICE '  - Column already exists: skills.description';
    END IF;
    
    -- Create tools table if not exists
    CREATE TABLE IF NOT EXISTS public.tools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    -- Add category column to tools
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'tools' 
                   AND column_name = 'category') THEN
        ALTER TABLE public.tools ADD COLUMN category TEXT;
        RAISE NOTICE '  ✓ Added column tools.category';
    ELSE
        RAISE NOTICE '  - Column already exists: tools.category';
    END IF;
    
    -- Add vendor column to tools
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'tools' 
                   AND column_name = 'vendor') THEN
        ALTER TABLE public.tools ADD COLUMN vendor TEXT;
        RAISE NOTICE '  ✓ Added column tools.vendor';
    ELSE
        RAISE NOTICE '  - Column already exists: tools.vendor';
    END IF;
    
    -- Add description column to tools
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'tools' 
                   AND column_name = 'description') THEN
        ALTER TABLE public.tools ADD COLUMN description TEXT;
        RAISE NOTICE '  ✓ Added column tools.description';
    ELSE
        RAISE NOTICE '  - Column already exists: tools.description';
    END IF;
    
    -- Create stakeholders table if not exists
    CREATE TABLE IF NOT EXISTS public.stakeholders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    -- Add stakeholder_type_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'stakeholders' 
                   AND column_name = 'stakeholder_type_id') THEN
        ALTER TABLE public.stakeholders ADD COLUMN stakeholder_type_id UUID;
        RAISE NOTICE '  ✓ Added column stakeholders.stakeholder_type_id';
    ELSE
        RAISE NOTICE '  - Column already exists: stakeholders.stakeholder_type_id';
    END IF;
    
    -- Add description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'stakeholders' 
                   AND column_name = 'description') THEN
        ALTER TABLE public.stakeholders ADD COLUMN description TEXT;
        RAISE NOTICE '  ✓ Added column stakeholders.description';
    ELSE
        RAISE NOTICE '  - Column already exists: stakeholders.description';
    END IF;
    
    -- Add is_internal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'stakeholders' 
                   AND column_name = 'is_internal') THEN
        ALTER TABLE public.stakeholders ADD COLUMN is_internal BOOLEAN DEFAULT true;
        RAISE NOTICE '  ✓ Added column stakeholders.is_internal';
    ELSE
        RAISE NOTICE '  - Column already exists: stakeholders.is_internal';
    END IF;
    
    -- Create responsibilities table if not exists
    CREATE TABLE IF NOT EXISTS public.responsibilities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    -- Add category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'responsibilities' 
                   AND column_name = 'category') THEN
        ALTER TABLE public.responsibilities ADD COLUMN category TEXT;
        RAISE NOTICE '  ✓ Added column responsibilities.category';
    ELSE
        RAISE NOTICE '  - Column already exists: responsibilities.category';
    END IF;
    
    -- Add description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'responsibilities' 
                   AND column_name = 'description') THEN
        ALTER TABLE public.responsibilities ADD COLUMN description TEXT;
        RAISE NOTICE '  ✓ Added column responsibilities.description';
    ELSE
        RAISE NOTICE '  - Column already exists: responsibilities.description';
    END IF;
    
    -- Add complexity_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'responsibilities' 
                   AND column_name = 'complexity_level') THEN
        ALTER TABLE public.responsibilities ADD COLUMN complexity_level TEXT;
        RAISE NOTICE '  ✓ Added column responsibilities.complexity_level';
    ELSE
        RAISE NOTICE '  - Column already exists: responsibilities.complexity_level';
    END IF;
    
    -- Create kpi_definitions table if not exists
    CREATE TABLE IF NOT EXISTS public.kpi_definitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    -- Add category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'kpi_definitions' 
                   AND column_name = 'category') THEN
        ALTER TABLE public.kpi_definitions ADD COLUMN category TEXT;
        RAISE NOTICE '  ✓ Added column kpi_definitions.category';
    ELSE
        RAISE NOTICE '  - Column already exists: kpi_definitions.category';
    END IF;
    
    -- Add description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'kpi_definitions' 
                   AND column_name = 'description') THEN
        ALTER TABLE public.kpi_definitions ADD COLUMN description TEXT;
        RAISE NOTICE '  ✓ Added column kpi_definitions.description';
    ELSE
        RAISE NOTICE '  - Column already exists: kpi_definitions.description';
    END IF;
    
    -- Add measurement_unit
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'kpi_definitions' 
                   AND column_name = 'measurement_unit') THEN
        ALTER TABLE public.kpi_definitions ADD COLUMN measurement_unit TEXT;
        RAISE NOTICE '  ✓ Added column kpi_definitions.measurement_unit';
    ELSE
        RAISE NOTICE '  - Column already exists: kpi_definitions.measurement_unit';
    END IF;
    
    -- Create therapeutic_areas, disease_areas, company_sizes, ai_maturity_levels, vpanes_dimensions
    CREATE TABLE IF NOT EXISTS public.therapeutic_areas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS public.disease_areas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        therapeutic_area_id UUID REFERENCES public.therapeutic_areas(id) ON DELETE SET NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS public.company_sizes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        employee_min INTEGER,
        employee_max INTEGER,
        revenue_min_usd NUMERIC(15, 2),
        revenue_max_usd NUMERIC(15, 2),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS public.ai_maturity_levels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        level_name TEXT NOT NULL UNIQUE,
        level_number INTEGER NOT NULL UNIQUE,
        description TEXT,
        score_min INTEGER CHECK (score_min >= 0 AND score_min <= 100),
        score_max INTEGER CHECK (score_max >= 0 AND score_max <= 100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS public.vpanes_dimensions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dimension_name TEXT NOT NULL UNIQUE,
        dimension_code TEXT NOT NULL UNIQUE,
        description TEXT,
        weight NUMERIC(3, 2) CHECK (weight >= 0 AND weight <= 1),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    RAISE NOTICE '  ✓ All reference tables ensured';
    
END $$;

-- =====================================================================
-- COMPLETION
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SCHEMA MIGRATION COMPLETE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'All enhancement columns have been added to existing tables.';
    RAISE NOTICE 'All reference tables have been created or updated.';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now proceed with:';
    RAISE NOTICE '  1. populate_pharma_functions.sql';
    RAISE NOTICE '  2. populate_pharma_departments.sql';
    RAISE NOTICE '  3. populate_roles_01_medical_affairs.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

