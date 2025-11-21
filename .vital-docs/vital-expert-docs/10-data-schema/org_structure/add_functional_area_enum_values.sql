-- =====================================================================
-- ADD FUNCTIONAL AREA ENUM VALUES
-- Run this BEFORE consolidate_and_normalize_pharma_org.sql
-- Note: Enum values cannot be added inside a transaction
-- =====================================================================

DO $$
DECLARE
    enum_value TEXT;
    enum_exists BOOLEAN;
    enum_type_oid OID;
BEGIN
    -- Get the enum type OID
    SELECT oid INTO enum_type_oid
    FROM pg_type 
    WHERE typname = 'functional_area_type';
    
    IF enum_type_oid IS NULL THEN
        RAISE EXCEPTION 'Enum type functional_area_type not found';
    END IF;
    
    RAISE NOTICE 'Adding enum values to functional_area_type...';
    
    FOR enum_value IN
        SELECT * FROM (VALUES
            ('Commercial Organization'),
            ('Regulatory Affairs'),
            ('Research & Development (R&D)'),
            ('Manufacturing & Supply Chain'),
            ('Finance & Accounting'),
            ('Human Resources'),
            ('Information Technology (IT) / Digital'),
            ('Legal & Compliance'),
            ('Corporate Communications'),
            ('Strategic Planning / Corporate Development'),
            ('Business Intelligence / Analytics'),
            ('Procurement'),
            ('Facilities / Workplace Services')
        ) AS v(enum_val)
    LOOP
        -- Check if enum value exists
        SELECT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = enum_value
            AND enumtypid = enum_type_oid
        ) INTO enum_exists;
        
        IF NOT enum_exists THEN
            BEGIN
                EXECUTE format('ALTER TYPE public.functional_area_type ADD VALUE %L', enum_value);
                RAISE NOTICE '✅ Added enum value: %', enum_value;
            EXCEPTION 
                WHEN duplicate_object THEN
                    RAISE NOTICE 'Enum value already exists: %', enum_value;
                WHEN OTHERS THEN
                    RAISE NOTICE '❌ Could not add enum value %: %', enum_value, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'Enum value already exists: %', enum_value;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Enum values added. You can now run consolidate_and_normalize_pharma_org.sql';
END $$;

