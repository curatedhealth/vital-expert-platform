-- =====================================================================
-- PHASE 3.2: CREATE MISSING PERSONA JUNCTION TABLES
-- Creates new junction tables that don't exist yet
-- Prepares for migration of array data from personas main table
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 3.2: CREATING MISSING PERSONA JUNCTIONS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. PERSONA_TENANTS (Multi-tenant support)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Creating persona_tenants...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(persona_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_tenants_persona ON public.persona_tenants(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_tenants_tenant ON public.persona_tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_persona_tenants_primary ON public.persona_tenants(is_primary) WHERE is_primary = true;

DO $$ BEGIN RAISE NOTICE '  ✓ persona_tenants created'; END $$;

-- =====================================================================
-- 2. PERSONA_GEN_AI_BARRIERS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Creating persona_gen_ai_barriers...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_gen_ai_barriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    barrier_text TEXT NOT NULL,
    barrier_category TEXT CHECK (barrier_category IN (
        'trust', 'skills', 'access', 'cost', 'compliance', 
        'data_quality', 'integration', 'change_management', 'other'
    )),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    sequence_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_gen_ai_barriers_persona ON public.persona_gen_ai_barriers(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_gen_ai_barriers_category ON public.persona_gen_ai_barriers(barrier_category);
CREATE INDEX IF NOT EXISTS idx_persona_gen_ai_barriers_severity ON public.persona_gen_ai_barriers(severity);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_gen_ai_barriers created'; END $$;

-- =====================================================================
-- 3. PERSONA_GEN_AI_ENABLERS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '3. Creating persona_gen_ai_enablers...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_gen_ai_enablers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    enabler_text TEXT NOT NULL,
    enabler_category TEXT CHECK (enabler_category IN (
        'training', 'tools', 'support', 'incentives', 'use_cases',
        'champions', 'resources', 'governance', 'other'
    )),
    impact TEXT CHECK (impact IN ('low', 'medium', 'high', 'transformative')),
    sequence_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_gen_ai_enablers_persona ON public.persona_gen_ai_enablers(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_gen_ai_enablers_category ON public.persona_gen_ai_enablers(enabler_category);
CREATE INDEX IF NOT EXISTS idx_persona_gen_ai_enablers_impact ON public.persona_gen_ai_enablers(impact);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_gen_ai_enablers created'; END $$;

-- =====================================================================
-- 4. PERSONA_SKILLS (with override pattern)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '4. Creating persona_skills...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level TEXT CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    is_required BOOLEAN DEFAULT true,
    years_experience INTEGER,
    
    -- Override pattern
    is_additional BOOLEAN DEFAULT false, -- TRUE = persona-specific, not from role
    overrides_role BOOLEAN DEFAULT false, -- TRUE = replaces role baseline
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(persona_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_skills_persona ON public.persona_skills(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_skills_skill ON public.persona_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_persona_skills_proficiency ON public.persona_skills(proficiency_level);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_skills created with override pattern'; END $$;

-- =====================================================================
-- 5. SUMMARY
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MISSING PERSONA JUNCTIONS CREATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'New Tables Created:';
    RAISE NOTICE '  ✓ persona_tenants - Multi-tenant persona assignment';
    RAISE NOTICE '  ✓ persona_gen_ai_barriers - Gen AI adoption barriers';
    RAISE NOTICE '  ✓ persona_gen_ai_enablers - Gen AI adoption enablers';
    RAISE NOTICE '  ✓ persona_skills - Skills with override pattern';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for data migration from personas table arrays!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Run enhance_persona_junctions.sql';
    RAISE NOTICE '  2. Run migrate_persona_arrays_to_junctions.sql (BACKUP FIRST)';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

