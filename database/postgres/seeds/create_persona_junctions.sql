-- =====================================================================
-- PHASE 3: CREATE PERSONA JUNCTION TABLES WITH OVERRIDE PATTERN
-- Creates all persona-level junction tables that inherit/override role baselines
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'CREATING PERSONA JUNCTION TABLES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- PART 1: PERSONA RESPONSIBILITIES (with override pattern)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Creating persona_responsibilities...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    responsibility_id UUID REFERENCES public.responsibilities(id) ON DELETE SET NULL,
    responsibility_text TEXT,
    responsibility_type TEXT CHECK (responsibility_type IN ('core', 'secondary', 'occasional')),
    time_allocation_percent INTEGER CHECK (time_allocation_percent BETWEEN 0 AND 100),
    
    -- Override pattern fields
    is_additional BOOLEAN DEFAULT false,  -- New responsibility not in role baseline
    overrides_role BOOLEAN DEFAULT false, -- Replaces role baseline for same responsibility_id
    sequence_order INTEGER,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_responsibilities_persona ON public.persona_responsibilities(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_responsibilities_ref ON public.persona_responsibilities(responsibility_id);
CREATE INDEX IF NOT EXISTS idx_persona_responsibilities_override ON public.persona_responsibilities(persona_id, overrides_role);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_responsibilities created'; END $$;

-- =====================================================================
-- PART 2: PERSONA TOOLS (with override pattern)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Creating persona_tools...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES public.tools(id) ON DELETE SET NULL,
    tool_name TEXT,
    usage_frequency TEXT CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'occasional', 'rare')),
    proficiency_level TEXT CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    satisfaction_level INTEGER CHECK (satisfaction_level BETWEEN 1 AND 10),
    
    -- Override pattern fields
    is_additional BOOLEAN DEFAULT false,
    overrides_role BOOLEAN DEFAULT false,
    sequence_order INTEGER,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_tools_persona ON public.persona_tools(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_tools_ref ON public.persona_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_persona_tools_override ON public.persona_tools(persona_id, overrides_role);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_tools created'; END $$;

-- =====================================================================
-- PART 3: PERSONA SKILLS (with override pattern)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '3. Creating persona_skills...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    skill_name TEXT,
    proficiency_level TEXT CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER,
    
    -- Override pattern fields
    is_additional BOOLEAN DEFAULT false,
    overrides_role BOOLEAN DEFAULT false,
    sequence_order INTEGER,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_skills_persona ON public.persona_skills(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_skills_ref ON public.persona_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_persona_skills_override ON public.persona_skills(persona_id, overrides_role);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_skills created'; END $$;

-- =====================================================================
-- PART 4: PERSONA STAKEHOLDERS (with override pattern)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '4. Creating persona_stakeholders...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    stakeholder_id UUID REFERENCES public.stakeholders(id) ON DELETE SET NULL,
    stakeholder_name TEXT,
    relationship_type TEXT CHECK (relationship_type IN ('reports_to', 'manages', 'collaborates', 'advises', 'receives_from')),
    influence_level TEXT CHECK (influence_level IN ('low', 'medium', 'high', 'critical')),
    interaction_frequency TEXT CHECK (interaction_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'adhoc')),
    collaboration_quality INTEGER CHECK (collaboration_quality BETWEEN 1 AND 10),
    
    -- Override pattern fields
    is_additional BOOLEAN DEFAULT false,
    overrides_role BOOLEAN DEFAULT false,
    sequence_order INTEGER,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_stakeholders_persona ON public.persona_stakeholders(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_stakeholders_ref ON public.persona_stakeholders(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_persona_stakeholders_override ON public.persona_stakeholders(persona_id, overrides_role);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_stakeholders created'; END $$;

-- =====================================================================
-- PART 5: PERSONA AI MATURITY (with override pattern)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '5. Creating persona_ai_maturity...'; END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_maturity_levels') THEN
        CREATE TABLE IF NOT EXISTS public.persona_ai_maturity (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
            ai_maturity_level_id UUID REFERENCES public.ai_maturity_levels(id) ON DELETE SET NULL,
            ai_maturity_score INTEGER CHECK (ai_maturity_score BETWEEN 0 AND 100),
            work_complexity_score INTEGER CHECK (work_complexity_score BETWEEN 0 AND 100),
            overrides_role BOOLEAN DEFAULT false,
            rationale TEXT,
            assessed_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(persona_id)
        );
        RAISE NOTICE '  ✓ persona_ai_maturity created with FK';
    ELSE
        CREATE TABLE IF NOT EXISTS public.persona_ai_maturity (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
            ai_maturity_level_id UUID,
            ai_maturity_score INTEGER CHECK (ai_maturity_score BETWEEN 0 AND 100),
            work_complexity_score INTEGER CHECK (work_complexity_score BETWEEN 0 AND 100),
            overrides_role BOOLEAN DEFAULT false,
            rationale TEXT,
            assessed_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(persona_id)
        );
        RAISE NOTICE '  ⚠ persona_ai_maturity created without FK';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_persona_ai_maturity_persona ON public.persona_ai_maturity(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_ai_maturity_level ON public.persona_ai_maturity(ai_maturity_level_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_ai_maturity ready'; END $$;

-- =====================================================================
-- PART 6: PERSONA VPANES SCORES (with override pattern)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '6. Creating persona_vpanes_scores...'; END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vpanes_dimensions') THEN
        CREATE TABLE IF NOT EXISTS public.persona_vpanes_scores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
            dimension_id UUID NOT NULL REFERENCES public.vpanes_dimensions(id) ON DELETE CASCADE,
            score INTEGER CHECK (score BETWEEN 0 AND 100),
            scoring_rationale TEXT,
            overrides_role BOOLEAN DEFAULT false,
            assessed_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(persona_id, dimension_id)
        );
        RAISE NOTICE '  ✓ persona_vpanes_scores created with FK';
    ELSE
        CREATE TABLE IF NOT EXISTS public.persona_vpanes_scores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
            dimension_id UUID NOT NULL,
            dimension_name TEXT,
            score INTEGER CHECK (score BETWEEN 0 AND 100),
            scoring_rationale TEXT,
            overrides_role BOOLEAN DEFAULT false,
            assessed_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(persona_id, dimension_id)
        );
        RAISE NOTICE '  ⚠ persona_vpanes_scores created without FK';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_persona_vpanes_scores_persona ON public.persona_vpanes_scores(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_vpanes_scores_dim ON public.persona_vpanes_scores(dimension_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_vpanes_scores ready'; END $$;

-- =====================================================================
-- PART 7: PERSONA GOALS (enhance if exists, create if not)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '7. Ensuring persona_goals exists...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    goal_text TEXT NOT NULL,
    goal_type TEXT CHECK (goal_type IN ('professional', 'personal', 'organizational', 'career')),
    priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    jtbd_id UUID,  -- Optional link to JTBD
    sequence_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_goals_persona ON public.persona_goals(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_goals_jtbd ON public.persona_goals(jtbd_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_goals ready'; END $$;

-- =====================================================================
-- PART 8: PERSONA PAIN POINTS (enhance if exists, create if not)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '8. Ensuring persona_pain_points exists...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_pain_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    pain_point_text TEXT NOT NULL,
    pain_category TEXT CHECK (pain_category IN ('process', 'technology', 'people', 'resource', 'knowledge')),
    severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    jtbd_id UUID,  -- Optional link to JTBD
    sequence_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_pain_points_persona ON public.persona_pain_points(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_pain_points_jtbd ON public.persona_pain_points(jtbd_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_pain_points ready'; END $$;

-- =====================================================================
-- PART 9: PERSONA CHALLENGES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '9. Ensuring persona_challenges exists...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    challenge_text TEXT NOT NULL,
    challenge_type TEXT CHECK (challenge_type IN ('technical', 'organizational', 'resource', 'strategic', 'operational')),
    impact TEXT CHECK (impact IN ('critical', 'high', 'medium', 'low')),
    jtbd_id UUID,  -- Optional link to JTBD
    sequence_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_challenges_persona ON public.persona_challenges(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_challenges_jtbd ON public.persona_challenges(jtbd_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_challenges ready'; END $$;

-- =====================================================================
-- PART 10: PERSONA TENANTS (new junction table)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '10. Creating persona_tenants...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(persona_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_tenants_persona ON public.persona_tenants(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_tenants_tenant ON public.persona_tenants(tenant_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_tenants created'; END $$;

-- =====================================================================
-- PART 11: SUMMARY
-- =====================================================================

DO $$
DECLARE
    total_personas INTEGER;
    total_roles INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_personas FROM public.personas WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO total_roles FROM public.org_roles WHERE deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PERSONA JUNCTION TABLES CREATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables with Override Pattern Created:';
    RAISE NOTICE '  ✓ persona_responsibilities (can add/override role baseline)';
    RAISE NOTICE '  ✓ persona_tools (can add/override role baseline)';
    RAISE NOTICE '  ✓ persona_skills (can add/override role baseline)';
    RAISE NOTICE '  ✓ persona_stakeholders (can add/override role baseline)';
    RAISE NOTICE '  ✓ persona_ai_maturity (can override role baseline)';
    RAISE NOTICE '  ✓ persona_vpanes_scores (can override role baseline)';
    RAISE NOTICE '';
    RAISE NOTICE 'Persona-Specific Tables Created:';
    RAISE NOTICE '  ✓ persona_goals (linked to JTBD)';
    RAISE NOTICE '  ✓ persona_pain_points (linked to JTBD)';
    RAISE NOTICE '  ✓ persona_challenges (linked to JTBD)';
    RAISE NOTICE '  ✓ persona_tenants (many-to-many)';
    RAISE NOTICE '';
    RAISE NOTICE 'Statistics:';
    RAISE NOTICE '  • Total roles: %', total_roles;
    RAISE NOTICE '  • Total personas: %', total_personas;
    RAISE NOTICE '';
    RAISE NOTICE 'Override Pattern Explained:';
    RAISE NOTICE '  • is_additional = TRUE: Persona has this, role does not';
    RAISE NOTICE '  • overrides_role = TRUE: Persona value replaces role value';
    RAISE NOTICE '  • Both FALSE: Persona inherits from role';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Create effective views (create_effective_views.sql)';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

