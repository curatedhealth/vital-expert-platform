-- =====================================================================
-- PHASE 3.3: ENHANCE EXISTING PERSONA JUNCTIONS
-- Adds override pattern fields to existing persona junction tables
-- Enables personas to add to or override role baselines
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 3.3: ENHANCING EXISTING PERSONA JUNCTIONS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. ENHANCE persona_responsibilities
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Enhancing persona_responsibilities...'; END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_responsibilities') THEN
        -- Add override pattern columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_responsibilities' AND column_name = 'is_additional') THEN
            ALTER TABLE public.persona_responsibilities ADD COLUMN is_additional BOOLEAN DEFAULT false;
            RAISE NOTICE '  ✓ Added is_additional';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_responsibilities' AND column_name = 'overrides_role') THEN
            ALTER TABLE public.persona_responsibilities ADD COLUMN overrides_role BOOLEAN DEFAULT false;
            RAISE NOTICE '  ✓ Added overrides_role';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_responsibilities' AND column_name = 'sequence_order') THEN
            ALTER TABLE public.persona_responsibilities ADD COLUMN sequence_order INTEGER;
            RAISE NOTICE '  ✓ Added sequence_order';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_responsibilities' AND column_name = 'time_allocation_percent') THEN
            ALTER TABLE public.persona_responsibilities ADD COLUMN time_allocation_percent INTEGER CHECK (time_allocation_percent >= 0 AND time_allocation_percent <= 100);
            RAISE NOTICE '  ✓ Added time_allocation_percent';
        END IF;
        
        RAISE NOTICE '  ✓ persona_responsibilities enhanced';
    ELSE
        RAISE NOTICE '  ⚠ persona_responsibilities does not exist';
    END IF;
END $$;

-- =====================================================================
-- 2. ENHANCE persona_tools
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Enhancing persona_tools...'; END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_tools') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_tools' AND column_name = 'is_additional') THEN
            ALTER TABLE public.persona_tools ADD COLUMN is_additional BOOLEAN DEFAULT false;
            RAISE NOTICE '  ✓ Added is_additional';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_tools' AND column_name = 'overrides_role') THEN
            ALTER TABLE public.persona_tools ADD COLUMN overrides_role BOOLEAN DEFAULT false;
            RAISE NOTICE '  ✓ Added overrides_role';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_tools' AND column_name = 'satisfaction_level') THEN
            ALTER TABLE public.persona_tools ADD COLUMN satisfaction_level INTEGER CHECK (satisfaction_level >= 1 AND satisfaction_level <= 10);
            RAISE NOTICE '  ✓ Added satisfaction_level';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_tools' AND column_name = 'sequence_order') THEN
            ALTER TABLE public.persona_tools ADD COLUMN sequence_order INTEGER;
            RAISE NOTICE '  ✓ Added sequence_order';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_tools' AND column_name = 'usage_frequency') THEN
            ALTER TABLE public.persona_tools ADD COLUMN usage_frequency TEXT CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'occasionally', 'rarely'));
            RAISE NOTICE '  ✓ Added usage_frequency';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_tools' AND column_name = 'proficiency_level') THEN
            ALTER TABLE public.persona_tools ADD COLUMN proficiency_level TEXT CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert'));
            RAISE NOTICE '  ✓ Added proficiency_level';
        END IF;
        
        RAISE NOTICE '  ✓ persona_tools enhanced';
    ELSE
        RAISE NOTICE '  ⚠ persona_tools does not exist';
    END IF;
END $$;

-- =====================================================================
-- 3. ENHANCE persona_internal_stakeholders & persona_external_stakeholders
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '3. Enhancing persona stakeholder tables...'; END $$;

DO $$
BEGIN
    -- Internal stakeholders
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_internal_stakeholders') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_internal_stakeholders' AND column_name = 'is_additional') THEN
            ALTER TABLE public.persona_internal_stakeholders ADD COLUMN is_additional BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_internal_stakeholders' AND column_name = 'overrides_role') THEN
            ALTER TABLE public.persona_internal_stakeholders ADD COLUMN overrides_role BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_internal_stakeholders' AND column_name = 'sequence_order') THEN
            ALTER TABLE public.persona_internal_stakeholders ADD COLUMN sequence_order INTEGER;
        END IF;
        
        RAISE NOTICE '  ✓ persona_internal_stakeholders enhanced';
    END IF;
    
    -- External stakeholders
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_external_stakeholders') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_external_stakeholders' AND column_name = 'is_additional') THEN
            ALTER TABLE public.persona_external_stakeholders ADD COLUMN is_additional BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_external_stakeholders' AND column_name = 'overrides_role') THEN
            ALTER TABLE public.persona_external_stakeholders ADD COLUMN overrides_role BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_external_stakeholders' AND column_name = 'sequence_order') THEN
            ALTER TABLE public.persona_external_stakeholders ADD COLUMN sequence_order INTEGER;
        END IF;
        
        RAISE NOTICE '  ✓ persona_external_stakeholders enhanced';
    END IF;
END $$;

-- =====================================================================
-- 4. ENHANCE persona_goals (add JTBD linkage)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '4. Enhancing persona_goals...'; END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_goals') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_goals' AND column_name = 'jtbd_id') THEN
            ALTER TABLE public.persona_goals ADD COLUMN jtbd_id UUID REFERENCES public.jtbd(id) ON DELETE SET NULL;
            RAISE NOTICE '  ✓ Added jtbd_id FK';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_goals' AND column_name = 'sequence_order') THEN
            ALTER TABLE public.persona_goals ADD COLUMN sequence_order INTEGER;
            RAISE NOTICE '  ✓ Added sequence_order';
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_persona_goals_jtbd ON public.persona_goals(jtbd_id);
        
        RAISE NOTICE '  ✓ persona_goals enhanced with JTBD linkage';
    ELSE
        RAISE NOTICE '  ⚠ persona_goals does not exist';
    END IF;
END $$;

-- =====================================================================
-- 5. ENHANCE persona_pain_points (add JTBD linkage)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '5. Enhancing persona_pain_points...'; END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_pain_points') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_pain_points' AND column_name = 'jtbd_id') THEN
            ALTER TABLE public.persona_pain_points ADD COLUMN jtbd_id UUID REFERENCES public.jtbd(id) ON DELETE SET NULL;
            RAISE NOTICE '  ✓ Added jtbd_id FK';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_pain_points' AND column_name = 'sequence_order') THEN
            ALTER TABLE public.persona_pain_points ADD COLUMN sequence_order INTEGER;
            RAISE NOTICE '  ✓ Added sequence_order';
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_persona_pain_points_jtbd ON public.persona_pain_points(jtbd_id);
        
        RAISE NOTICE '  ✓ persona_pain_points enhanced with JTBD linkage';
    ELSE
        RAISE NOTICE '  ⚠ persona_pain_points does not exist';
    END IF;
END $$;

-- =====================================================================
-- 6. ENHANCE persona_challenges (add JTBD linkage)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '6. Enhancing persona_challenges...'; END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_challenges') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_challenges' AND column_name = 'jtbd_id') THEN
            ALTER TABLE public.persona_challenges ADD COLUMN jtbd_id UUID REFERENCES public.jtbd(id) ON DELETE SET NULL;
            RAISE NOTICE '  ✓ Added jtbd_id FK';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_challenges' AND column_name = 'sequence_order') THEN
            ALTER TABLE public.persona_challenges ADD COLUMN sequence_order INTEGER;
            RAISE NOTICE '  ✓ Added sequence_order';
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_persona_challenges_jtbd ON public.persona_challenges(jtbd_id);
        
        RAISE NOTICE '  ✓ persona_challenges enhanced with JTBD linkage';
    ELSE
        RAISE NOTICE '  ⚠ persona_challenges does not exist';
    END IF;
END $$;

-- =====================================================================
-- 7. SUMMARY
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'EXISTING PERSONA JUNCTIONS ENHANCED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Enhanced:';
    RAISE NOTICE '  ✓ persona_responsibilities - Override pattern + time allocation';
    RAISE NOTICE '  ✓ persona_tools - Override pattern + satisfaction + frequency';
    RAISE NOTICE '  ✓ persona_internal_stakeholders - Override pattern';
    RAISE NOTICE '  ✓ persona_external_stakeholders - Override pattern';
    RAISE NOTICE '  ✓ persona_goals - JTBD linkage + sequence';
    RAISE NOTICE '  ✓ persona_pain_points - JTBD linkage + sequence';
    RAISE NOTICE '  ✓ persona_challenges - JTBD linkage + sequence';
    RAISE NOTICE '';
    RAISE NOTICE 'Override Pattern Fields Added:';
    RAISE NOTICE '  • is_additional (TRUE = persona-specific, not from role)';
    RAISE NOTICE '  • overrides_role (TRUE = replaces role baseline)';
    RAISE NOTICE '  • sequence_order (for ordering)';
    RAISE NOTICE '';
    RAISE NOTICE 'JTBD Linkage:';
    RAISE NOTICE '  • Goals, pain points, challenges can now reference JTBDs';
    RAISE NOTICE '  • JTBDs are owned by roles, referenced by personas';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run create_persona_ai_junctions.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

