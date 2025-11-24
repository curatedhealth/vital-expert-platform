-- =====================================================================
-- FIX REFERENCE TABLES - Add Missing Columns
-- Ensures all reference tables have the columns needed by junction tables
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'FIXING REFERENCE TABLES - ADDING MISSING COLUMNS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. FIX RESPONSIBILITIES TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Fixing responsibilities table...'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'responsibilities' AND column_name = 'responsibility_type') THEN
        ALTER TABLE public.responsibilities ADD COLUMN responsibility_type TEXT;
        RAISE NOTICE '  ✓ Added responsibility_type column';
    ELSE
        RAISE NOTICE '  ✓ responsibility_type already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'responsibilities' AND column_name = 'category') THEN
        ALTER TABLE public.responsibilities ADD COLUMN category TEXT;
        RAISE NOTICE '  ✓ Added category column';
    ELSE
        RAISE NOTICE '  ✓ category already exists';
    END IF;
END $$;

-- =====================================================================
-- 2. FIX SUCCESS_METRICS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Fixing success_metrics table...'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'success_metrics' AND column_name = 'metric_type') THEN
        ALTER TABLE public.success_metrics ADD COLUMN metric_type TEXT;
        RAISE NOTICE '  ✓ Added metric_type column';
    ELSE
        RAISE NOTICE '  ✓ metric_type already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'success_metrics' AND column_name = 'measurement_unit') THEN
        ALTER TABLE public.success_metrics ADD COLUMN measurement_unit TEXT;
        RAISE NOTICE '  ✓ Added measurement_unit column';
    ELSE
        RAISE NOTICE '  ✓ measurement_unit already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'success_metrics' AND column_name = 'measurement_frequency') THEN
        ALTER TABLE public.success_metrics ADD COLUMN measurement_frequency TEXT;
        RAISE NOTICE '  ✓ Added measurement_frequency column';
    ELSE
        RAISE NOTICE '  ✓ measurement_frequency already exists';
    END IF;
END $$;

-- =====================================================================
-- 3. FIX STAKEHOLDERS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '3. Fixing stakeholders table...'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stakeholders' AND column_name = 'stakeholder_type') THEN
        ALTER TABLE public.stakeholders ADD COLUMN stakeholder_type TEXT;
        RAISE NOTICE '  ✓ Added stakeholder_type column';
    ELSE
        RAISE NOTICE '  ✓ stakeholder_type already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stakeholders' AND column_name = 'typical_role') THEN
        ALTER TABLE public.stakeholders ADD COLUMN typical_role TEXT;
        RAISE NOTICE '  ✓ Added typical_role column';
    ELSE
        RAISE NOTICE '  ✓ typical_role already exists';
    END IF;
END $$;

-- =====================================================================
-- 4. FIX TOOLS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '4. Fixing tools table...'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'category') THEN
        ALTER TABLE public.tools ADD COLUMN category TEXT;
        RAISE NOTICE '  ✓ Added category column';
    ELSE
        RAISE NOTICE '  ✓ category already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'vendor') THEN
        ALTER TABLE public.tools ADD COLUMN vendor TEXT;
        RAISE NOTICE '  ✓ Added vendor column';
    ELSE
        RAISE NOTICE '  ✓ vendor already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'is_enterprise') THEN
        ALTER TABLE public.tools ADD COLUMN is_enterprise BOOLEAN DEFAULT false;
        RAISE NOTICE '  ✓ Added is_enterprise column';
    ELSE
        RAISE NOTICE '  ✓ is_enterprise already exists';
    END IF;
END $$;

-- =====================================================================
-- 5. FIX SKILLS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '5. Fixing skills table...'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'skills' AND column_name = 'category') THEN
        ALTER TABLE public.skills ADD COLUMN category TEXT;
        RAISE NOTICE '  ✓ Added category column';
    ELSE
        RAISE NOTICE '  ✓ category already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'skills' AND column_name = 'complexity_level') THEN
        ALTER TABLE public.skills ADD COLUMN complexity_level TEXT;
        RAISE NOTICE '  ✓ Added complexity_level column';
    ELSE
        RAISE NOTICE '  ✓ complexity_level already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'skills' AND column_name = 'is_core') THEN
        ALTER TABLE public.skills ADD COLUMN is_core BOOLEAN DEFAULT false;
        RAISE NOTICE '  ✓ Added is_core column';
    ELSE
        RAISE NOTICE '  ✓ is_core already exists';
    END IF;
END $$;

-- =====================================================================
-- 6. FIX AI_MATURITY_LEVELS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '6. Fixing ai_maturity_levels table...'; END $$;

DO $$
BEGIN
    -- Check what columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_maturity_levels' AND column_name = 'level_name') THEN
        RAISE NOTICE '  ✓ Using existing level_name column';
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_maturity_levels' AND column_name = 'ai_maturity_level_name') THEN
        ALTER TABLE public.ai_maturity_levels ADD COLUMN ai_maturity_level_name TEXT;
        RAISE NOTICE '  ✓ Added ai_maturity_level_name column';
    ELSE
        RAISE NOTICE '  ✓ ai_maturity_level_name already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_maturity_levels' AND column_name = 'description') THEN
        ALTER TABLE public.ai_maturity_levels ADD COLUMN description TEXT;
        RAISE NOTICE '  ✓ Added description column';
    ELSE
        RAISE NOTICE '  ✓ description already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_maturity_levels' AND column_name = 'characteristics') THEN
        ALTER TABLE public.ai_maturity_levels ADD COLUMN characteristics TEXT[];
        RAISE NOTICE '  ✓ Added characteristics column';
    ELSE
        RAISE NOTICE '  ✓ characteristics already exists';
    END IF;
END $$;

-- =====================================================================
-- 7. FIX VPANES_DIMENSIONS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '7. Fixing vpanes_dimensions table...'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vpanes_dimensions' AND column_name = 'dimension_name') THEN
        ALTER TABLE public.vpanes_dimensions ADD COLUMN dimension_name TEXT;
        RAISE NOTICE '  ✓ Added dimension_name column';
    ELSE
        RAISE NOTICE '  ✓ dimension_name already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vpanes_dimensions' AND column_name = 'description') THEN
        ALTER TABLE public.vpanes_dimensions ADD COLUMN description TEXT;
        RAISE NOTICE '  ✓ Added description column';
    ELSE
        RAISE NOTICE '  ✓ description already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vpanes_dimensions' AND column_name = 'scoring_guidance') THEN
        ALTER TABLE public.vpanes_dimensions ADD COLUMN scoring_guidance TEXT;
        RAISE NOTICE '  ✓ Added scoring_guidance column';
    ELSE
        RAISE NOTICE '  ✓ scoring_guidance already exists';
    END IF;
END $$;

-- =====================================================================
-- 8. CREATE INDEXES (only if columns exist)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '8. Creating indexes...'; END $$;

DO $$
BEGIN
    -- Create indexes only if columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'responsibilities' AND column_name = 'responsibility_type') THEN
        CREATE INDEX IF NOT EXISTS idx_responsibilities_type ON public.responsibilities(responsibility_type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stakeholders' AND column_name = 'stakeholder_type') THEN
        CREATE INDEX IF NOT EXISTS idx_stakeholders_type ON public.stakeholders(stakeholder_type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tools' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'complexity_level') THEN
        CREATE INDEX IF NOT EXISTS idx_skills_complexity ON public.skills(complexity_level);
    END IF;
END $$;

DO $$ BEGIN RAISE NOTICE '  ✓ Indexes created'; END $$;

-- =====================================================================
-- 9. SUMMARY
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'REFERENCE TABLES FIXED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'All reference tables now have the required columns:';
    RAISE NOTICE '  ✓ responsibilities - responsibility_type, category';
    RAISE NOTICE '  ✓ success_metrics - metric_type, measurement_unit, measurement_frequency';
    RAISE NOTICE '  ✓ stakeholders - stakeholder_type, typical_role';
    RAISE NOTICE '  ✓ tools - category, vendor, is_enterprise';
    RAISE NOTICE '  ✓ skills - category, complexity_level, is_core';
    RAISE NOTICE '  ✓ ai_maturity_levels - level_name/ai_maturity_level_name, description, characteristics';
    RAISE NOTICE '  ✓ vpanes_dimensions - dimension_name, description, scoring_guidance';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now run create_role_junctions.sql successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

