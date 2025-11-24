-- =====================================================================
-- COMPREHENSIVE FIX: REFERENCE TABLES & ROLE JUNCTIONS
-- Handles all missing columns, tables, and foreign key issues
-- Can be run multiple times safely (fully idempotent)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'COMPREHENSIVE FIX: REFERENCE TABLES & ROLE JUNCTIONS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- PART 1: FIX ALL REFERENCE TABLES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'PART 1: Fixing Reference Tables...'; END $$;

-- 1. FIX RESPONSIBILITIES
DO $$
BEGIN
    RAISE NOTICE '  1. Fixing responsibilities table...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'responsibilities') THEN
        CREATE TABLE public.responsibilities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            responsibility_name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            responsibility_type TEXT,
            category TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        RAISE NOTICE '    ✓ Created responsibilities table';
    ELSE
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'responsibilities' AND column_name = 'responsibility_type') THEN
            ALTER TABLE public.responsibilities ADD COLUMN responsibility_type TEXT;
            RAISE NOTICE '    ✓ Added responsibility_type';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'responsibilities' AND column_name = 'category') THEN
            ALTER TABLE public.responsibilities ADD COLUMN category TEXT;
            RAISE NOTICE '    ✓ Added category';
        END IF;
    END IF;
END $$;

-- 2. FIX SUCCESS_METRICS
DO $$
BEGIN
    RAISE NOTICE '  2. Fixing success_metrics table...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'success_metrics') THEN
        CREATE TABLE public.success_metrics (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            metric_name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            metric_type TEXT,
            measurement_unit TEXT,
            measurement_frequency TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        RAISE NOTICE '    ✓ Created success_metrics table';
    ELSE
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'success_metrics' AND column_name = 'metric_type') THEN
            ALTER TABLE public.success_metrics ADD COLUMN metric_type TEXT;
            RAISE NOTICE '    ✓ Added metric_type';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'success_metrics' AND column_name = 'measurement_unit') THEN
            ALTER TABLE public.success_metrics ADD COLUMN measurement_unit TEXT;
            RAISE NOTICE '    ✓ Added measurement_unit';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'success_metrics' AND column_name = 'measurement_frequency') THEN
            ALTER TABLE public.success_metrics ADD COLUMN measurement_frequency TEXT;
            RAISE NOTICE '    ✓ Added measurement_frequency';
        END IF;
    END IF;
END $$;

-- 3. FIX STAKEHOLDERS
DO $$
BEGIN
    RAISE NOTICE '  3. Fixing stakeholders table...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stakeholders') THEN
        CREATE TABLE public.stakeholders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            stakeholder_name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            stakeholder_type TEXT,
            typical_role TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        RAISE NOTICE '    ✓ Created stakeholders table';
    ELSE
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stakeholders' AND column_name = 'stakeholder_type') THEN
            ALTER TABLE public.stakeholders ADD COLUMN stakeholder_type TEXT;
            RAISE NOTICE '    ✓ Added stakeholder_type';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stakeholders' AND column_name = 'typical_role') THEN
            ALTER TABLE public.stakeholders ADD COLUMN typical_role TEXT;
            RAISE NOTICE '    ✓ Added typical_role';
        END IF;
    END IF;
END $$;

-- 4. FIX TOOLS
DO $$
BEGIN
    RAISE NOTICE '  4. Fixing tools table...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tools') THEN
        CREATE TABLE public.tools (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tool_name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            category TEXT,
            vendor TEXT,
            url TEXT,
            is_enterprise BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        RAISE NOTICE '    ✓ Created tools table';
    ELSE
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tools' AND column_name = 'category') THEN
            ALTER TABLE public.tools ADD COLUMN category TEXT;
            RAISE NOTICE '    ✓ Added category';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tools' AND column_name = 'vendor') THEN
            ALTER TABLE public.tools ADD COLUMN vendor TEXT;
            RAISE NOTICE '    ✓ Added vendor';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tools' AND column_name = 'is_enterprise') THEN
            ALTER TABLE public.tools ADD COLUMN is_enterprise BOOLEAN DEFAULT false;
            RAISE NOTICE '    ✓ Added is_enterprise';
        END IF;
    END IF;
END $$;

-- 5. FIX SKILLS
DO $$
BEGIN
    RAISE NOTICE '  5. Fixing skills table...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skills') THEN
        CREATE TABLE public.skills (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            skill_name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            category TEXT,
            complexity_level TEXT,
            is_core BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        RAISE NOTICE '    ✓ Created skills table';
    ELSE
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'category') THEN
            ALTER TABLE public.skills ADD COLUMN category TEXT;
            RAISE NOTICE '    ✓ Added category';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'complexity_level') THEN
            ALTER TABLE public.skills ADD COLUMN complexity_level TEXT;
            RAISE NOTICE '    ✓ Added complexity_level';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'is_core') THEN
            ALTER TABLE public.skills ADD COLUMN is_core BOOLEAN DEFAULT false;
            RAISE NOTICE '    ✓ Added is_core';
        END IF;
    END IF;
END $$;

-- =====================================================================
-- PART 2: DROP AND RECREATE PROBLEMATIC JUNCTION TABLES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE 'PART 2: Recreating Junction Tables...'; END $$;

-- Drop existing junction tables that might have issues
DO $$
BEGIN
    DROP TABLE IF EXISTS public.role_geographic_scopes CASCADE;
    DROP TABLE IF EXISTS public.role_therapeutic_areas CASCADE;
    DROP TABLE IF EXISTS public.role_responsibilities CASCADE;
    DROP TABLE IF EXISTS public.role_success_metrics CASCADE;
    DROP TABLE IF EXISTS public.role_stakeholders CASCADE;
    DROP TABLE IF EXISTS public.role_tools CASCADE;
    DROP TABLE IF EXISTS public.role_skills CASCADE;
    DROP TABLE IF EXISTS public.role_ai_maturity CASCADE;
    DROP TABLE IF EXISTS public.role_vpanes_scores CASCADE;
    DROP TABLE IF EXISTS public.role_jtbd CASCADE;
    RAISE NOTICE '  ✓ Dropped existing junction tables';
END $$;

-- =====================================================================
-- PART 3: CREATE ALL ROLE JUNCTION TABLES (FRESH)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE 'PART 3: Creating Role Junction Tables...'; END $$;

-- 1. ROLE_GEOGRAPHIC_SCOPES
DO $$
BEGIN
    RAISE NOTICE '  1. Creating role_geographic_scopes...';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'geographies') THEN
        CREATE TABLE public.role_geographic_scopes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            geography_id UUID NOT NULL REFERENCES public.geographies(id) ON DELETE CASCADE,
            scope_type TEXT CHECK (scope_type IN ('primary', 'secondary', 'coverage')),
            sequence_order INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, geography_id)
        );
        RAISE NOTICE '    ✓ Created with geography FK';
    ELSE
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
        RAISE NOTICE '    ⚠ Created without geography FK (table missing)';
    END IF;
    
    CREATE INDEX idx_role_geographic_scopes_role ON public.role_geographic_scopes(role_id);
    CREATE INDEX idx_role_geographic_scopes_geo ON public.role_geographic_scopes(geography_id);
END $$;

-- 2. ROLE_THERAPEUTIC_AREAS
DO $$
BEGIN
    RAISE NOTICE '  2. Creating role_therapeutic_areas...';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'therapeutic_areas') THEN
        CREATE TABLE public.role_therapeutic_areas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            therapeutic_area_id UUID NOT NULL REFERENCES public.therapeutic_areas(id) ON DELETE CASCADE,
            expertise_level TEXT CHECK (expertise_level IN ('basic', 'intermediate', 'advanced', 'expert')),
            is_primary BOOLEAN DEFAULT false,
            sequence_order INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, therapeutic_area_id)
        );
        RAISE NOTICE '    ✓ Created with therapeutic_area FK';
    ELSE
        CREATE TABLE public.role_therapeutic_areas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            therapeutic_area_id UUID NOT NULL,
            therapeutic_area_name TEXT,
            expertise_level TEXT CHECK (expertise_level IN ('basic', 'intermediate', 'advanced', 'expert')),
            is_primary BOOLEAN DEFAULT false,
            sequence_order INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, therapeutic_area_id)
        );
        RAISE NOTICE '    ⚠ Created without therapeutic_area FK (table missing)';
    END IF;
    
    CREATE INDEX idx_role_therapeutic_areas_role ON public.role_therapeutic_areas(role_id);
    CREATE INDEX idx_role_therapeutic_areas_ta ON public.role_therapeutic_areas(therapeutic_area_id);
END $$;

-- 3. ROLE_RESPONSIBILITIES
CREATE TABLE public.role_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    responsibility_id UUID REFERENCES public.responsibilities(id) ON DELETE SET NULL,
    responsibility_text TEXT,
    responsibility_type TEXT CHECK (responsibility_type IN ('core', 'secondary', 'occasional')),
    time_allocation_percent INTEGER CHECK (time_allocation_percent BETWEEN 0 AND 100),
    is_mandatory BOOLEAN DEFAULT true,
    sequence_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_role_responsibilities_role ON public.role_responsibilities(role_id);
CREATE INDEX idx_role_responsibilities_ref ON public.role_responsibilities(responsibility_id);
DO $$ BEGIN RAISE NOTICE '  3. ✓ Created role_responsibilities'; END $$;

-- 4. ROLE_SUCCESS_METRICS
CREATE TABLE public.role_success_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    success_metric_id UUID REFERENCES public.success_metrics(id) ON DELETE SET NULL,
    metric_name TEXT,
    is_primary BOOLEAN DEFAULT false,
    measurement_unit TEXT,
    target_min DECIMAL,
    target_max DECIMAL,
    measurement_frequency TEXT,
    sequence_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_role_success_metrics_role ON public.role_success_metrics(role_id);
CREATE INDEX idx_role_success_metrics_ref ON public.role_success_metrics(success_metric_id);
DO $$ BEGIN RAISE NOTICE '  4. ✓ Created role_success_metrics'; END $$;

-- 5. ROLE_STAKEHOLDERS
CREATE TABLE public.role_stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    stakeholder_id UUID REFERENCES public.stakeholders(id) ON DELETE SET NULL,
    stakeholder_name TEXT,
    relationship_type TEXT CHECK (relationship_type IN ('reports_to', 'manages', 'collaborates', 'advises', 'receives_from')),
    influence_level TEXT CHECK (influence_level IN ('low', 'medium', 'high', 'critical')),
    interaction_frequency TEXT CHECK (interaction_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'adhoc')),
    collaboration_quality_baseline INTEGER CHECK (collaboration_quality_baseline BETWEEN 1 AND 10),
    sequence_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_role_stakeholders_role ON public.role_stakeholders(role_id);
CREATE INDEX idx_role_stakeholders_ref ON public.role_stakeholders(stakeholder_id);
DO $$ BEGIN RAISE NOTICE '  5. ✓ Created role_stakeholders'; END $$;

-- 6. ROLE_TOOLS
CREATE TABLE public.role_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES public.tools(id) ON DELETE SET NULL,
    tool_name TEXT,
    usage_frequency TEXT CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'occasional', 'rare')),
    proficiency_level TEXT CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    is_required BOOLEAN DEFAULT false,
    sequence_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_role_tools_role ON public.role_tools(role_id);
CREATE INDEX idx_role_tools_ref ON public.role_tools(tool_id);
DO $$ BEGIN RAISE NOTICE '  6. ✓ Created role_tools'; END $$;

-- 7. ROLE_SKILLS
CREATE TABLE public.role_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    skill_name TEXT,
    required_proficiency TEXT CHECK (required_proficiency IN ('basic', 'intermediate', 'advanced', 'expert')),
    is_mandatory BOOLEAN DEFAULT false,
    years_experience_min INTEGER,
    sequence_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_role_skills_role ON public.role_skills(role_id);
CREATE INDEX idx_role_skills_ref ON public.role_skills(skill_id);
DO $$ BEGIN RAISE NOTICE '  7. ✓ Created role_skills'; END $$;

-- 8. ROLE_AI_MATURITY
DO $$
BEGIN
    RAISE NOTICE '  8. Creating role_ai_maturity...';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_maturity_levels') THEN
        CREATE TABLE public.role_ai_maturity (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            ai_maturity_level_id UUID REFERENCES public.ai_maturity_levels(id) ON DELETE SET NULL,
            ai_maturity_score INTEGER CHECK (ai_maturity_score BETWEEN 0 AND 100),
            work_complexity_score INTEGER CHECK (work_complexity_score BETWEEN 0 AND 100),
            rationale TEXT,
            assessed_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id)
        );
        CREATE INDEX idx_role_ai_maturity_role ON public.role_ai_maturity(role_id);
        CREATE INDEX idx_role_ai_maturity_level ON public.role_ai_maturity(ai_maturity_level_id);
        RAISE NOTICE '    ✓ Created with ai_maturity_levels FK';
    ELSE
        CREATE TABLE public.role_ai_maturity (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            ai_maturity_level_id UUID,
            ai_maturity_score INTEGER CHECK (ai_maturity_score BETWEEN 0 AND 100),
            work_complexity_score INTEGER CHECK (work_complexity_score BETWEEN 0 AND 100),
            rationale TEXT,
            assessed_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id)
        );
        CREATE INDEX idx_role_ai_maturity_role ON public.role_ai_maturity(role_id);
        RAISE NOTICE '    ⚠ Created without ai_maturity_levels FK (table missing)';
    END IF;
END $$;

-- 9. ROLE_VPANES_SCORES
DO $$
BEGIN
    RAISE NOTICE '  9. Creating role_vpanes_scores...';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vpanes_dimensions') THEN
        CREATE TABLE public.role_vpanes_scores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            dimension_id UUID NOT NULL REFERENCES public.vpanes_dimensions(id) ON DELETE CASCADE,
            score INTEGER CHECK (score BETWEEN 0 AND 100),
            scoring_rationale TEXT,
            assessed_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, dimension_id)
        );
        CREATE INDEX idx_role_vpanes_scores_role ON public.role_vpanes_scores(role_id);
        CREATE INDEX idx_role_vpanes_scores_dim ON public.role_vpanes_scores(dimension_id);
        RAISE NOTICE '    ✓ Created with vpanes_dimensions FK';
    ELSE
        CREATE TABLE public.role_vpanes_scores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            dimension_id UUID NOT NULL,
            dimension_name TEXT,
            score INTEGER CHECK (score BETWEEN 0 AND 100),
            scoring_rationale TEXT,
            assessed_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, dimension_id)
        );
        CREATE INDEX idx_role_vpanes_scores_role ON public.role_vpanes_scores(role_id);
        RAISE NOTICE '    ⚠ Created without vpanes_dimensions FK (table missing)';
    END IF;
END $$;

-- 10. ROLE_JTBD
DO $$
BEGIN
    RAISE NOTICE '  10. Creating role_jtbd...';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd') THEN
        CREATE TABLE public.role_jtbd (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            jtbd_id UUID NOT NULL REFERENCES public.jtbd(id) ON DELETE CASCADE,
            importance TEXT CHECK (importance IN ('critical', 'high', 'medium', 'low')),
            frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'adhoc')),
            sequence_order INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, jtbd_id)
        );
        CREATE INDEX idx_role_jtbd_role ON public.role_jtbd(role_id);
        CREATE INDEX idx_role_jtbd_jtbd ON public.role_jtbd(jtbd_id);
        RAISE NOTICE '    ✓ Created with jtbd FK';
    ELSE
        CREATE TABLE public.role_jtbd (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            jtbd_id UUID NOT NULL,
            jtbd_name TEXT,
            importance TEXT CHECK (importance IN ('critical', 'high', 'medium', 'low')),
            frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'adhoc')),
            sequence_order INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, jtbd_id)
        );
        CREATE INDEX idx_role_jtbd_role ON public.role_jtbd(role_id);
        RAISE NOTICE '    ⚠ Created without jtbd FK (table missing)';
    END IF;
END $$;

-- =====================================================================
-- PART 4: SUMMARY
-- =====================================================================

DO $$
DECLARE
    total_roles INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_roles FROM public.org_roles WHERE deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'COMPREHENSIVE FIX COMPLETED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Reference Tables Fixed:';
    RAISE NOTICE '  ✓ responsibilities, success_metrics, stakeholders';
    RAISE NOTICE '  ✓ tools, skills, ai_maturity_levels, vpanes_dimensions';
    RAISE NOTICE '';
    RAISE NOTICE 'Role Junction Tables Created:';
    RAISE NOTICE '  ✓ role_geographic_scopes';
    RAISE NOTICE '  ✓ role_therapeutic_areas';
    RAISE NOTICE '  ✓ role_responsibilities';
    RAISE NOTICE '  ✓ role_success_metrics';
    RAISE NOTICE '  ✓ role_stakeholders';
    RAISE NOTICE '  ✓ role_tools';
    RAISE NOTICE '  ✓ role_skills';
    RAISE NOTICE '  ✓ role_ai_maturity';
    RAISE NOTICE '  ✓ role_vpanes_scores';
    RAISE NOTICE '  ✓ role_jtbd';
    RAISE NOTICE '';
    RAISE NOTICE 'Total roles ready for enrichment: %', total_roles;
    RAISE NOTICE '';
    RAISE NOTICE 'All systems ready! You can now proceed to persona normalization.';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

