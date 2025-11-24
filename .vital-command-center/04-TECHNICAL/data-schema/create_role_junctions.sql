-- =====================================================================
-- PHASE 2.2: CREATE ROLE JUNCTION TABLES
-- Creates all junction tables linking roles to reference data
-- Implements the role baseline that personas will inherit/override
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'CREATING ROLE JUNCTION TABLES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. ROLE GEOGRAPHIC SCOPES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Creating role_geographic_scopes...'; END $$;

DO $$
BEGIN
    -- Check if geographies table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geographies') THEN
        -- Create with foreign key
        CREATE TABLE IF NOT EXISTS public.role_geographic_scopes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            geography_id UUID NOT NULL REFERENCES public.geographies(id) ON DELETE CASCADE,
            scope_type TEXT CHECK (scope_type IN ('primary', 'secondary', 'coverage')),
            sequence_order INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, geography_id)
        );
        RAISE NOTICE '  ✓ role_geographic_scopes created with geography FK';
    ELSE
        -- Create without foreign key (will be added later when geographies is created)
        CREATE TABLE IF NOT EXISTS public.role_geographic_scopes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            geography_id UUID NOT NULL,
            geography_name TEXT,
            scope_type TEXT CHECK (scope_type IN ('primary', 'secondary', 'coverage')),
            sequence_order INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, geography_id)
        );
        RAISE NOTICE '  ⚠ role_geographic_scopes created without geography FK (table does not exist yet)';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_role_geographic_scopes_role ON public.role_geographic_scopes(role_id);
CREATE INDEX IF NOT EXISTS idx_role_geographic_scopes_geo ON public.role_geographic_scopes(geography_id);

DO $$ BEGIN RAISE NOTICE '  ✓ role_geographic_scopes ready'; END $$;

-- =====================================================================
-- 2. ROLE THERAPEUTIC AREAS (Enhance if exists, create if not)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Ensuring role_therapeutic_areas exists...'; END $$;

DO $$
BEGIN
    -- Check if therapeutic_areas table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'therapeutic_areas') THEN
        -- Create with foreign key
        CREATE TABLE IF NOT EXISTS public.role_therapeutic_areas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            therapeutic_area_id UUID NOT NULL REFERENCES public.therapeutic_areas(id) ON DELETE CASCADE,
            expertise_level TEXT CHECK (expertise_level IN ('basic', 'intermediate', 'advanced', 'expert')),
            is_primary BOOLEAN DEFAULT false,
            sequence_order INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(role_id, therapeutic_area_id)
        );
        RAISE NOTICE '  ✓ role_therapeutic_areas created with therapeutic_area FK';
    ELSE
        -- Create without foreign key
        CREATE TABLE IF NOT EXISTS public.role_therapeutic_areas (
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
        RAISE NOTICE '  ⚠ role_therapeutic_areas created without therapeutic_area FK (table does not exist yet)';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_role_therapeutic_areas_role ON public.role_therapeutic_areas(role_id);
CREATE INDEX IF NOT EXISTS idx_role_therapeutic_areas_ta ON public.role_therapeutic_areas(therapeutic_area_id);

DO $$ BEGIN RAISE NOTICE '  ✓ role_therapeutic_areas ready'; END $$;

-- =====================================================================
-- 3. ROLE RESPONSIBILITIES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '3. Creating role_responsibilities...'; END $$;

CREATE TABLE IF NOT EXISTS public.role_responsibilities (
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

CREATE INDEX IF NOT EXISTS idx_role_responsibilities_role ON public.role_responsibilities(role_id);
CREATE INDEX IF NOT EXISTS idx_role_responsibilities_ref ON public.role_responsibilities(responsibility_id);
CREATE INDEX IF NOT EXISTS idx_role_responsibilities_type ON public.role_responsibilities(responsibility_type);

DO $$ BEGIN RAISE NOTICE '  ✓ role_responsibilities created'; END $$;

-- =====================================================================
-- 4. ROLE SUCCESS METRICS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '4. Creating role_success_metrics...'; END $$;

CREATE TABLE IF NOT EXISTS public.role_success_metrics (
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

CREATE INDEX IF NOT EXISTS idx_role_success_metrics_role ON public.role_success_metrics(role_id);
CREATE INDEX IF NOT EXISTS idx_role_success_metrics_ref ON public.role_success_metrics(success_metric_id);
CREATE INDEX IF NOT EXISTS idx_role_success_metrics_primary ON public.role_success_metrics(role_id, is_primary);

DO $$ BEGIN RAISE NOTICE '  ✓ role_success_metrics created'; END $$;

-- =====================================================================
-- 5. ROLE STAKEHOLDERS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '5. Creating role_stakeholders...'; END $$;

CREATE TABLE IF NOT EXISTS public.role_stakeholders (
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

CREATE INDEX IF NOT EXISTS idx_role_stakeholders_role ON public.role_stakeholders(role_id);
CREATE INDEX IF NOT EXISTS idx_role_stakeholders_ref ON public.role_stakeholders(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_role_stakeholders_type ON public.role_stakeholders(relationship_type);

DO $$ BEGIN RAISE NOTICE '  ✓ role_stakeholders created'; END $$;

-- =====================================================================
-- 6. ROLE TOOLS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '6. Creating role_tools...'; END $$;

CREATE TABLE IF NOT EXISTS public.role_tools (
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

CREATE INDEX IF NOT EXISTS idx_role_tools_role ON public.role_tools(role_id);
CREATE INDEX IF NOT EXISTS idx_role_tools_ref ON public.role_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_role_tools_required ON public.role_tools(role_id, is_required);

DO $$ BEGIN RAISE NOTICE '  ✓ role_tools created'; END $$;

-- =====================================================================
-- 7. ROLE SKILLS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '7. Creating role_skills...'; END $$;

CREATE TABLE IF NOT EXISTS public.role_skills (
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

CREATE INDEX IF NOT EXISTS idx_role_skills_role ON public.role_skills(role_id);
CREATE INDEX IF NOT EXISTS idx_role_skills_ref ON public.role_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_role_skills_mandatory ON public.role_skills(role_id, is_mandatory);

DO $$ BEGIN RAISE NOTICE '  ✓ role_skills created'; END $$;

-- =====================================================================
-- 8. ROLE AI MATURITY
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '8. Creating role_ai_maturity...'; END $$;

CREATE TABLE IF NOT EXISTS public.role_ai_maturity (
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

CREATE INDEX IF NOT EXISTS idx_role_ai_maturity_role ON public.role_ai_maturity(role_id);
CREATE INDEX IF NOT EXISTS idx_role_ai_maturity_level ON public.role_ai_maturity(ai_maturity_level_id);
CREATE INDEX IF NOT EXISTS idx_role_ai_maturity_scores ON public.role_ai_maturity(ai_maturity_score, work_complexity_score);

DO $$ BEGIN RAISE NOTICE '  ✓ role_ai_maturity created'; END $$;

-- =====================================================================
-- 9. ROLE VPANES SCORES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '9. Creating role_vpanes_scores...'; END $$;

CREATE TABLE IF NOT EXISTS public.role_vpanes_scores (
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

CREATE INDEX IF NOT EXISTS idx_role_vpanes_scores_role ON public.role_vpanes_scores(role_id);
CREATE INDEX IF NOT EXISTS idx_role_vpanes_scores_dim ON public.role_vpanes_scores(dimension_id);
CREATE INDEX IF NOT EXISTS idx_role_vpanes_scores_score ON public.role_vpanes_scores(score);

DO $$ BEGIN RAISE NOTICE '  ✓ role_vpanes_scores created'; END $$;

-- =====================================================================
-- 10. ROLE JTBD (Jobs To Be Done)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '10. Creating role_jtbd...'; END $$;

CREATE TABLE IF NOT EXISTS public.role_jtbd (
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

CREATE INDEX IF NOT EXISTS idx_role_jtbd_role ON public.role_jtbd(role_id);
CREATE INDEX IF NOT EXISTS idx_role_jtbd_jtbd ON public.role_jtbd(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_role_jtbd_importance ON public.role_jtbd(importance);

DO $$ BEGIN RAISE NOTICE '  ✓ role_jtbd created'; END $$;

-- =====================================================================
-- 11. SUMMARY
-- =====================================================================

DO $$
DECLARE
    total_roles INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_roles FROM public.org_roles WHERE deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ROLE JUNCTION TABLES CREATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Junction Tables Created:';
    RAISE NOTICE '  ✓ role_geographic_scopes - Role location coverage';
    RAISE NOTICE '  ✓ role_therapeutic_areas - TA expertise per role';
    RAISE NOTICE '  ✓ role_responsibilities - Core role responsibilities';
    RAISE NOTICE '  ✓ role_success_metrics - KPIs and metrics';
    RAISE NOTICE '  ✓ role_stakeholders - Key stakeholder relationships';
    RAISE NOTICE '  ✓ role_tools - Required tools and proficiency';
    RAISE NOTICE '  ✓ role_skills - Required skills and proficiency';
    RAISE NOTICE '  ✓ role_ai_maturity - AI adoption baseline';
    RAISE NOTICE '  ✓ role_vpanes_scores - VPANES dimension scores';
    RAISE NOTICE '  ✓ role_jtbd - Jobs to be done mapping';
    RAISE NOTICE '';
    RAISE NOTICE 'Statistics:';
    RAISE NOTICE '  • Total roles ready for enrichment: %', total_roles;
    RAISE NOTICE '';
    RAISE NOTICE 'These tables establish role BASELINES that personas will inherit.';
    RAISE NOTICE 'Personas can add to or override these baselines using the override pattern.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Normalize personas table (normalize_personas_main_table.sql)';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;
