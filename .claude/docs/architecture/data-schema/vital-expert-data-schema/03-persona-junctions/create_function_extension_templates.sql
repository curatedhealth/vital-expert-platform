-- =====================================================================
-- PHASE 4.2: FUNCTION-SPECIFIC PERSONA EXTENSION TEMPLATES
-- Creates placeholder extension tables for other pharmaceutical functions
-- Ready to be populated with function-specific attributes
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 4.2: FUNCTION EXTENSION TEMPLATES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. COMMERCIAL / SALES & MARKETING ATTRIBUTES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Creating persona_commercial_attributes...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_commercial_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE UNIQUE,
    
    -- Sales & Marketing Specific
    sales_methodology TEXT[], -- ['consultative', 'solution_selling', 'challenger', 'spin']
    crm_proficiency TEXT CHECK (crm_proficiency IN ('basic', 'intermediate', 'advanced', 'expert')),
    territory_size_accounts INTEGER,
    quota_attainment_avg NUMERIC, -- Average quota attainment %
    product_launches_participated INTEGER DEFAULT 0,
    
    -- Channel & Digital
    omnichannel_experience BOOLEAN DEFAULT false,
    digital_marketing_tools TEXT[],
    social_selling_proficiency TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_commercial_persona ON public.persona_commercial_attributes(persona_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_commercial_attributes created (template)'; END $$;

-- =====================================================================
-- 2. REGULATORY AFFAIRS ATTRIBUTES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Creating persona_regulatory_attributes...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_regulatory_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE UNIQUE,
    
    -- Regulatory Specific
    regulatory_certifications TEXT[], -- ['RAC', 'RAC-EU', 'RAC-US']
    submission_types_experienced TEXT[], -- ['NDA', 'BLA', 'IND', 'ANDA', 'MAA']
    regulatory_regions TEXT[], -- ['FDA', 'EMA', 'PMDA', 'NMPA']
    submissions_led_count INTEGER DEFAULT 0,
    
    -- Compliance & Quality
    gmp_experience BOOLEAN DEFAULT false,
    audit_experience INTEGER DEFAULT 0,
    regulatory_strategy_experience BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_regulatory_persona ON public.persona_regulatory_attributes(persona_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_regulatory_attributes created (template)'; END $$;

-- =====================================================================
-- 3. R&D / RESEARCH & DEVELOPMENT ATTRIBUTES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '3. Creating persona_rd_attributes...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_rd_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE UNIQUE,
    
    -- R&D Specific
    research_areas TEXT[], -- ['discovery', 'pre_clinical', 'formulation', 'analytical']
    lab_techniques TEXT[],
    research_tools TEXT[],
    patents_filed INTEGER DEFAULT 0,
    compounds_developed INTEGER DEFAULT 0,
    
    -- Scientific Leadership
    rd_budget_managed NUMERIC,
    lab_team_size INTEGER,
    drug_development_phase_experience TEXT[],
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_rd_persona ON public.persona_rd_attributes(persona_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_rd_attributes created (template)'; END $$;

-- =====================================================================
-- 4. MARKET ACCESS / HEOR ATTRIBUTES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '4. Creating persona_market_access_attributes...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_market_access_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE UNIQUE,
    
    -- Market Access Specific
    heor_methodology_expertise TEXT[], -- ['RCT', 'RWE', 'cost_effectiveness', 'budget_impact']
    payer_relationships TEXT[], -- ['CMS', 'commercial_payers', 'PBMs', 'IDNs']
    health_economics_models_built INTEGER DEFAULT 0,
    pricing_strategy_experience BOOLEAN DEFAULT false,
    
    -- Reimbursement & Access
    formulary_management_experience BOOLEAN DEFAULT false,
    value_dossier_development BOOLEAN DEFAULT false,
    hta_submissions_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_market_access_persona ON public.persona_market_access_attributes(persona_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_market_access_attributes created (template)'; END $$;

-- =====================================================================
-- 5. SUMMARY
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'FUNCTION EXTENSION TEMPLATES CREATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Template Tables Created:';
    RAISE NOTICE '  ✓ persona_commercial_attributes';
    RAISE NOTICE '  ✓ persona_regulatory_attributes';
    RAISE NOTICE '  ✓ persona_rd_attributes';
    RAISE NOTICE '  ✓ persona_market_access_attributes';
    RAISE NOTICE '';
    RAISE NOTICE 'These tables are ready to be populated with function-specific data';
    RAISE NOTICE 'as needed. Medical Affairs attributes are fully defined.';
    RAISE NOTICE '';
    RAISE NOTICE 'Phase 4 Complete! Next: Phase 5 - Effective Views (CRITICAL)';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

