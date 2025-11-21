-- =====================================================================
-- ADD DIGITAL HEALTH ENUM VALUES TO functional_area_type
-- This MUST be run BEFORE complete_digital_health_setup_fixed.sql
-- 
-- IMPORTANT: ALTER TYPE ADD VALUE cannot be run inside a transaction
-- Run each ALTER TYPE command separately, or run this entire file
-- =====================================================================

-- Check if enum type exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'functional_area_type') THEN
        RAISE EXCEPTION 'Enum type functional_area_type does not exist. Please create it first.';
    END IF;
    
    RAISE NOTICE 'Enum type functional_area_type exists. Adding Digital Health values...';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: The ALTER TYPE commands below must be run OUTSIDE of BEGIN/COMMIT';
    RAISE NOTICE 'Run them one at a time, or run this entire file (which has no BEGIN/COMMIT)';
    RAISE NOTICE '';
END $$;

-- Add enum values (these must be run outside of BEGIN/COMMIT)
-- PostgreSQL will skip if the value already exists (it will error but we can ignore)

-- Function 1
DO $$
BEGIN
    BEGIN
        ALTER TYPE functional_area_type ADD VALUE 'Digital Health Strategy & Innovation';
        RAISE NOTICE '✅ Added: Digital Health Strategy & Innovation';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  Already exists: Digital Health Strategy & Innovation';
    END;
END $$;

-- Function 2
DO $$
BEGIN
    BEGIN
        ALTER TYPE functional_area_type ADD VALUE 'Digital Platforms & Solutions';
        RAISE NOTICE '✅ Added: Digital Platforms & Solutions';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  Already exists: Digital Platforms & Solutions';
    END;
END $$;

-- Function 3
DO $$
BEGIN
    BEGIN
        ALTER TYPE functional_area_type ADD VALUE 'Data Science & Analytics';
        RAISE NOTICE '✅ Added: Data Science & Analytics';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  Already exists: Data Science & Analytics';
    END;
END $$;

-- Function 4
DO $$
BEGIN
    BEGIN
        ALTER TYPE functional_area_type ADD VALUE 'Digital Clinical Development';
        RAISE NOTICE '✅ Added: Digital Clinical Development';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  Already exists: Digital Clinical Development';
    END;
END $$;

-- Function 5
DO $$
BEGIN
    BEGIN
        ALTER TYPE functional_area_type ADD VALUE 'Patient & Provider Experience';
        RAISE NOTICE '✅ Added: Patient & Provider Experience';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  Already exists: Patient & Provider Experience';
    END;
END $$;

-- Function 6
DO $$
BEGIN
    BEGIN
        ALTER TYPE functional_area_type ADD VALUE 'Regulatory, Quality & Compliance';
        RAISE NOTICE '✅ Added: Regulatory, Quality & Compliance';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  Already exists: Regulatory, Quality & Compliance';
    END;
END $$;

-- Function 7
DO $$
BEGIN
    BEGIN
        ALTER TYPE functional_area_type ADD VALUE 'Commercialization & Market Access';
        RAISE NOTICE '✅ Added: Commercialization & Market Access';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  Already exists: Commercialization & Market Access';
    END;
END $$;

-- Function 8
DO $$
BEGIN
    BEGIN
        ALTER TYPE functional_area_type ADD VALUE 'Technology & IT Infrastructure';
        RAISE NOTICE '✅ Added: Technology & IT Infrastructure';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  Already exists: Technology & IT Infrastructure';
    END;
END $$;

-- Function 9
DO $$
BEGIN
    BEGIN
        ALTER TYPE functional_area_type ADD VALUE 'Legal & IP for Digital';
        RAISE NOTICE '✅ Added: Legal & IP for Digital';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  Already exists: Legal & IP for Digital';
    END;
END $$;

-- Verification
DO $$
DECLARE
    enum_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO enum_count
    FROM pg_enum
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'functional_area_type')
    AND enumlabel IN (
        'Digital Health Strategy & Innovation',
        'Digital Platforms & Solutions',
        'Data Science & Analytics',
        'Digital Clinical Development',
        'Patient & Provider Experience',
        'Regulatory, Quality & Compliance',
        'Commercialization & Market Access',
        'Technology & IT Infrastructure',
        'Legal & IP for Digital'
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICATION ===';
    RAISE NOTICE 'Digital Health enum values found: % / 9', enum_count;
    
    IF enum_count = 9 THEN
        RAISE NOTICE '✅ All enum values added successfully!';
        RAISE NOTICE 'You can now run complete_digital_health_setup_fixed.sql';
    ELSE
        RAISE WARNING '⚠️  Only % enum values found. Some may have failed to add.', enum_count;
    END IF;
END $$;

