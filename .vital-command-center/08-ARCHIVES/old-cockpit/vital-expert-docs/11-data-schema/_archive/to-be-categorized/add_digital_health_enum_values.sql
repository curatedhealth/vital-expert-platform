-- =====================================================================
-- ADD DIGITAL HEALTH ENUM VALUES TO functional_area_type
-- This must be run BEFORE populate_digital_health_org_structure
-- Note: ALTER TYPE cannot be run inside a transaction block
-- =====================================================================

DO $$
DECLARE
    enum_exists BOOLEAN;
    enum_value TEXT;
BEGIN
    -- Check if enum type exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'functional_area_type'
    ) INTO enum_exists;
    
    IF NOT enum_exists THEN
        RAISE EXCEPTION 'Enum type functional_area_type does not exist. Please create it first.';
    END IF;
    
    RAISE NOTICE 'Adding Digital Health enum values to functional_area_type...';
    
    -- Add each Digital Health function as an enum value
    -- Note: ALTER TYPE ADD VALUE cannot be run in a transaction
    -- So we need to run these one at a time outside of BEGIN/COMMIT
    
    -- These will be added one by one
    FOR enum_value IN
        SELECT * FROM (VALUES
            ('Digital Health Strategy & Innovation'),
            ('Digital Platforms & Solutions'),
            ('Data Science & Analytics'),
            ('Digital Clinical Development'),
            ('Patient & Provider Experience'),
            ('Regulatory, Quality & Compliance'),
            ('Commercialization & Market Access'),
            ('Technology & IT Infrastructure'),
            ('Legal & IP for Digital')
        ) AS v(enum_val)
    LOOP
        -- Check if value already exists
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumlabel = enum_value 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'functional_area_type')
        ) THEN
            -- Note: This will fail if run inside a transaction
            -- The user needs to run these ALTER TYPE commands manually or outside BEGIN/COMMIT
            RAISE NOTICE 'Need to add enum value: %', enum_value;
            RAISE NOTICE 'Run: ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS ''%'';', enum_value;
        ELSE
            RAISE NOTICE 'Enum value already exists: %', enum_value;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: ALTER TYPE cannot be run in a transaction.';
    RAISE NOTICE 'You need to run the ALTER TYPE commands shown above separately,';
    RAISE NOTICE 'or use the script below that handles this properly.';
    
END $$;

-- =====================================================================
-- ALTERNATIVE: Add enum values (run these OUTSIDE of BEGIN/COMMIT)
-- =====================================================================

-- Uncomment and run these one at a time, or use the script below

/*
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Digital Health Strategy & Innovation';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Digital Platforms & Solutions';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Data Science & Analytics';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Digital Clinical Development';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Patient & Provider Experience';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Regulatory, Quality & Compliance';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Commercialization & Market Access';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Technology & IT Infrastructure';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Legal & IP for Digital';
*/

