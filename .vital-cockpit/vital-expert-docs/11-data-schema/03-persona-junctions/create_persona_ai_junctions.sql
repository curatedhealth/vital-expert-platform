-- =====================================================================
-- PHASE 3.4: CREATE PERSONA AI & SERVICE LAYER JUNCTIONS
-- Creates persona-specific AI maturity, VPANES, and service layer mappings
-- Implements override pattern for role baselines
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 3.4: CREATING PERSONA AI & SERVICE LAYER JUNCTIONS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. PERSONA_AI_MATURITY (with override pattern)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Creating persona_ai_maturity...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_ai_maturity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    ai_maturity_level_id UUID REFERENCES public.ai_maturity_levels(id) ON DELETE SET NULL,
    ai_maturity_score NUMERIC CHECK (ai_maturity_score >= 0 AND ai_maturity_score <= 100),
    work_complexity_score NUMERIC CHECK (work_complexity_score >= 0 AND work_complexity_score <= 100),
    
    -- Override pattern
    overrides_role BOOLEAN DEFAULT false, -- TRUE = use persona value, not role baseline
    
    rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(persona_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_ai_maturity_persona ON public.persona_ai_maturity(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_ai_maturity_level ON public.persona_ai_maturity(ai_maturity_level_id);
CREATE INDEX IF NOT EXISTS idx_persona_ai_maturity_score ON public.persona_ai_maturity(ai_maturity_score DESC);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_ai_maturity created'; END $$;

-- =====================================================================
-- 2. PERSONA_VPANES_SCORES (with override pattern)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Creating persona_vpanes_scores...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_vpanes_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    dimension_id UUID NOT NULL REFERENCES public.vpanes_dimensions(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
    
    -- Override pattern
    overrides_role BOOLEAN DEFAULT false, -- TRUE = use persona value, not role baseline
    
    scoring_rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(persona_id, dimension_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_vpanes_persona ON public.persona_vpanes_scores(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_vpanes_dimension ON public.persona_vpanes_scores(dimension_id);
CREATE INDEX IF NOT EXISTS idx_persona_vpanes_score ON public.persona_vpanes_scores(score DESC);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_vpanes_scores created'; END $$;

-- =====================================================================
-- 3. SERVICE_LAYERS REFERENCE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '3. Creating service_layers reference...'; END $$;

CREATE TABLE IF NOT EXISTS public.service_layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    layer_type TEXT CHECK (layer_type IN ('foundational', 'core', 'advanced', 'specialized')),
    complexity_level TEXT CHECK (complexity_level IN ('simple', 'moderate', 'complex', 'expert')),
    
    -- Service characteristics
    requires_multi_agent BOOLEAN DEFAULT false,
    supports_reasoning BOOLEAN DEFAULT false,
    supports_synthesis BOOLEAN DEFAULT false,
    typical_response_time TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert standard service layers based on VITAL architecture
INSERT INTO public.service_layers (name, slug, layer_type, complexity_level, requires_multi_agent, supports_reasoning, supports_synthesis) VALUES
    ('Chat', 'chat', 'foundational', 'simple', false, false, false),
    ('Search', 'search', 'foundational', 'simple', false, false, false),
    ('Ask', 'ask', 'core', 'moderate', false, true, false),
    ('Ask Panel', 'ask-panel', 'advanced', 'complex', true, true, true),
    ('Workflows', 'workflows', 'advanced', 'complex', false, true, true),
    ('Agentic Flows', 'agentic-flows', 'specialized', 'expert', true, true, true)
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_service_layers_type ON public.service_layers(layer_type);
CREATE INDEX IF NOT EXISTS idx_service_layers_complexity ON public.service_layers(complexity_level);

DO $$ BEGIN RAISE NOTICE '  ✓ service_layers created with 6 standard layers'; END $$;

-- =====================================================================
-- 4. PERSONA_GOAL_AI_MAPPING
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '4. Creating persona_goal_ai_mapping...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_goal_ai_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_goal_id UUID NOT NULL REFERENCES public.persona_goals(id) ON DELETE CASCADE,
    service_layer_id UUID NOT NULL REFERENCES public.service_layers(id) ON DELETE CASCADE,
    mapping_rationale TEXT,
    confidence_score INTEGER CHECK (confidence_score >= 1 AND confidence_score <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(persona_goal_id, service_layer_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_goal_ai_mapping_goal ON public.persona_goal_ai_mapping(persona_goal_id);
CREATE INDEX IF NOT EXISTS idx_persona_goal_ai_mapping_layer ON public.persona_goal_ai_mapping(service_layer_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_goal_ai_mapping created'; END $$;

-- =====================================================================
-- 5. PERSONA_PAIN_POINT_AI_MAPPING
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '5. Creating persona_pain_point_ai_mapping...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_pain_point_ai_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_pain_point_id UUID NOT NULL REFERENCES public.persona_pain_points(id) ON DELETE CASCADE,
    service_layer_id UUID NOT NULL REFERENCES public.service_layers(id) ON DELETE CASCADE,
    mapping_rationale TEXT,
    addressability_score INTEGER CHECK (addressability_score >= 1 AND addressability_score <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(persona_pain_point_id, service_layer_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_pain_ai_mapping_pain ON public.persona_pain_point_ai_mapping(persona_pain_point_id);
CREATE INDEX IF NOT EXISTS idx_persona_pain_ai_mapping_layer ON public.persona_pain_point_ai_mapping(service_layer_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_pain_point_ai_mapping created'; END $$;

-- =====================================================================
-- 6. PERSONA_SERVICE_LAYER_USAGE (telemetry)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '6. Creating persona_service_layer_usage...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_service_layer_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    service_layer_id UUID NOT NULL REFERENCES public.service_layers(id) ON DELETE CASCADE,
    
    -- Usage metrics
    usage_frequency TEXT CHECK (usage_frequency IN ('never', 'rarely', 'occasionally', 'regularly', 'frequently', 'constantly')),
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 10),
    adoption_stage TEXT CHECK (adoption_stage IN ('awareness', 'exploration', 'adoption', 'mastery', 'champion')),
    
    -- Telemetry
    last_used_at TIMESTAMPTZ,
    total_uses INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(persona_id, service_layer_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_service_usage_persona ON public.persona_service_layer_usage(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_service_usage_layer ON public.persona_service_layer_usage(service_layer_id);
CREATE INDEX IF NOT EXISTS idx_persona_service_usage_frequency ON public.persona_service_layer_usage(usage_frequency);
CREATE INDEX IF NOT EXISTS idx_persona_service_usage_satisfaction ON public.persona_service_layer_usage(satisfaction_score DESC);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_service_layer_usage created'; END $$;

-- =====================================================================
-- 7. SUMMARY
-- =====================================================================

DO $$
DECLARE
    service_layer_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO service_layer_count FROM public.service_layers;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PERSONA AI & SERVICE LAYER JUNCTIONS CREATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Created:';
    RAISE NOTICE '  ✓ persona_ai_maturity - AI maturity with override pattern';
    RAISE NOTICE '  ✓ persona_vpanes_scores - VPANES scores with override pattern';
    RAISE NOTICE '  ✓ service_layers - % standard layers (reference)', service_layer_count;
    RAISE NOTICE '  ✓ persona_goal_ai_mapping - Goals → Service layers';
    RAISE NOTICE '  ✓ persona_pain_point_ai_mapping - Pain points → Service layers';
    RAISE NOTICE '  ✓ persona_service_layer_usage - Usage telemetry';
    RAISE NOTICE '';
    RAISE NOTICE 'Key Features:';
    RAISE NOTICE '  • Override pattern: Personas can override role baselines';
    RAISE NOTICE '  • AI maturity tracking at persona level';
    RAISE NOTICE '  • VPANES scoring per persona';
    RAISE NOTICE '  • Goals/pain points mapped to service layers';
    RAISE NOTICE '  • Usage telemetry for adoption tracking';
    RAISE NOTICE '';
    RAISE NOTICE 'Service Layers Available:';
    RAISE NOTICE '  1. Chat (foundational)';
    RAISE NOTICE '  2. Search (foundational)';
    RAISE NOTICE '  3. Ask (core)';
    RAISE NOTICE '  4. Ask Panel (advanced - multi-agent)';
    RAISE NOTICE '  5. Workflows (advanced)';
    RAISE NOTICE '  6. Agentic Flows (specialized)';
    RAISE NOTICE '';
    RAISE NOTICE 'Phase 3 Complete! Next: Phase 4 - Function Extensions';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

