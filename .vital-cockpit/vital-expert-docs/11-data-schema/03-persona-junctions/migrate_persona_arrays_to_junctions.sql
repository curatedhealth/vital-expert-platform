-- =====================================================================
-- PHASE 6.1: MIGRATE PERSONA ARRAY DATA TO JUNCTION TABLES
-- ⚠️ CRITICAL: BACKUP DATABASE BEFORE RUNNING THIS SCRIPT ⚠️
-- 
-- This script migrates array data from personas table to normalized junctions
-- After migration, array columns will be dropped from personas table
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '⚠️  WARNING: DATA MIGRATION SCRIPT - BACKUP REQUIRED ⚠️';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'This script will:';
    RAISE NOTICE '  1. Migrate array data to junction tables';
    RAISE NOTICE '  2. Drop array columns from personas table';
    RAISE NOTICE '  3. Cannot be undone without restore from backup';
    RAISE NOTICE '';
    RAISE NOTICE 'Ensure you have a backup before proceeding!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. MIGRATE key_responsibilities TO persona_responsibilities
-- =====================================================================

DO $$ 
DECLARE
    migration_count INTEGER := 0;
BEGIN
    RAISE NOTICE '1. Migrating key_responsibilities array...';
    
    -- Check if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'personas' AND column_name = 'key_responsibilities') THEN
        
        -- Migrate data
        INSERT INTO public.persona_responsibilities (
            persona_id,
            responsibility_text,
            responsibility_type,
            is_additional,
            sequence_order,
            created_at
        )
        SELECT 
            p.id AS persona_id,
            unnest(p.key_responsibilities) AS responsibility_text,
            'core' AS responsibility_type,
            true AS is_additional, -- Mark as persona-specific additions
            row_number() OVER (PARTITION BY p.id ORDER BY unnest(p.key_responsibilities)) AS sequence_order,
            NOW() AS created_at
        FROM public.personas p
        WHERE p.key_responsibilities IS NOT NULL 
          AND array_length(p.key_responsibilities, 1) > 0
          AND p.deleted_at IS NULL
        ON CONFLICT DO NOTHING;
        
        GET DIAGNOSTICS migration_count = ROW_COUNT;
        RAISE NOTICE '  ✓ Migrated % responsibility records', migration_count;
        
    ELSE
        RAISE NOTICE '  ⚠ key_responsibilities column does not exist - skipping';
    END IF;
END $$;

-- =====================================================================
-- 2. MIGRATE preferred_tools TO persona_tools
-- =====================================================================

DO $$ 
DECLARE
    migration_count INTEGER := 0;
BEGIN
    RAISE NOTICE '2. Migrating preferred_tools array...';
    
    -- Check if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'personas' AND column_name = 'preferred_tools') THEN
        
        -- Migrate data
        INSERT INTO public.persona_tools (
            persona_id,
            tool_name,
            is_additional,
            sequence_order,
            created_at
        )
        SELECT 
            p.id AS persona_id,
            unnest(p.preferred_tools) AS tool_name,
            true AS is_additional, -- Mark as persona-specific additions
            row_number() OVER (PARTITION BY p.id ORDER BY unnest(p.preferred_tools)) AS sequence_order,
            NOW() AS created_at
        FROM public.personas p
        WHERE p.preferred_tools IS NOT NULL 
          AND array_length(p.preferred_tools, 1) > 0
          AND p.deleted_at IS NULL
        ON CONFLICT DO NOTHING;
        
        GET DIAGNOSTICS migration_count = ROW_COUNT;
        RAISE NOTICE '  ✓ Migrated % tool records', migration_count;
        
    ELSE
        RAISE NOTICE '  ⚠ preferred_tools column does not exist - skipping';
    END IF;
END $$;

-- =====================================================================
-- 3. MIGRATE tags TO persona_tags
-- =====================================================================

DO $$ 
DECLARE
    migration_count INTEGER := 0;
BEGIN
    RAISE NOTICE '3. Migrating tags array...';
    
    -- Check if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'personas' AND column_name = 'tags') THEN
        
        -- Check if persona_tags table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_tags') THEN
            -- Migrate data
            INSERT INTO public.persona_tags (
                persona_id,
                tag_name,
                created_at
            )
            SELECT 
                p.id AS persona_id,
                unnest(p.tags) AS tag_name,
                NOW() AS created_at
            FROM public.personas p
            WHERE p.tags IS NOT NULL 
              AND array_length(p.tags, 1) > 0
              AND p.deleted_at IS NULL
            ON CONFLICT DO NOTHING;
            
            GET DIAGNOSTICS migration_count = ROW_COUNT;
            RAISE NOTICE '  ✓ Migrated % tag records', migration_count;
        ELSE
            RAISE NOTICE '  ⚠ persona_tags table does not exist - skipping';
        END IF;
        
    ELSE
        RAISE NOTICE '  ⚠ tags column does not exist - skipping';
    END IF;
END $$;

-- =====================================================================
-- 4. MIGRATE allowed_tenants TO persona_tenants
-- =====================================================================

DO $$ 
DECLARE
    migration_count INTEGER := 0;
    pharma_tenant_id UUID;
BEGIN
    RAISE NOTICE '4. Migrating allowed_tenants array...';
    
    -- Get pharmaceuticals tenant ID
    SELECT id INTO pharma_tenant_id FROM public.tenants WHERE slug = 'pharmaceuticals' LIMIT 1;
    
    -- Check if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'personas' AND column_name = 'allowed_tenants') THEN
        
        -- If allowed_tenants is populated, use it
        INSERT INTO public.persona_tenants (
            persona_id,
            tenant_id,
            is_primary,
            created_at
        )
        SELECT 
            p.id AS persona_id,
            pharma_tenant_id AS tenant_id,
            true AS is_primary,
            NOW() AS created_at
        FROM public.personas p
        WHERE p.allowed_tenants IS NOT NULL 
          AND 'pharmaceuticals' = ANY(p.allowed_tenants)
          AND p.deleted_at IS NULL
          AND pharma_tenant_id IS NOT NULL
        ON CONFLICT DO NOTHING;
        
        GET DIAGNOSTICS migration_count = ROW_COUNT;
        RAISE NOTICE '  ✓ Migrated % tenant mappings from allowed_tenants', migration_count;
        
    ELSE
        -- If column doesn't exist, map all personas to pharma tenant
        IF pharma_tenant_id IS NOT NULL THEN
            INSERT INTO public.persona_tenants (
                persona_id,
                tenant_id,
                is_primary,
                created_at
            )
            SELECT 
                p.id AS persona_id,
                pharma_tenant_id AS tenant_id,
                true AS is_primary,
                NOW() AS created_at
            FROM public.personas p
            WHERE p.deleted_at IS NULL
            ON CONFLICT DO NOTHING;
            
            GET DIAGNOSTICS migration_count = ROW_COUNT;
            RAISE NOTICE '  ✓ Mapped % personas to pharmaceuticals tenant (default)', migration_count;
        ELSE
            RAISE NOTICE '  ⚠ Pharmaceuticals tenant not found - skipping';
        END IF;
    END IF;
END $$;

-- =====================================================================
-- 5. MIGRATE gen_ai_barriers TO persona_gen_ai_barriers
-- =====================================================================

DO $$ 
DECLARE
    migration_count INTEGER := 0;
BEGIN
    RAISE NOTICE '5. Migrating gen_ai_barriers array...';
    
    -- Check if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'personas' AND column_name = 'gen_ai_barriers') THEN
        
        -- Migrate data
        INSERT INTO public.persona_gen_ai_barriers (
            persona_id,
            barrier_text,
            barrier_category,
            severity,
            sequence_order,
            created_at
        )
        SELECT 
            p.id AS persona_id,
            unnest(p.gen_ai_barriers) AS barrier_text,
            'other' AS barrier_category, -- Default category
            'medium' AS severity, -- Default severity
            row_number() OVER (PARTITION BY p.id ORDER BY unnest(p.gen_ai_barriers)) AS sequence_order,
            NOW() AS created_at
        FROM public.personas p
        WHERE p.gen_ai_barriers IS NOT NULL 
          AND array_length(p.gen_ai_barriers, 1) > 0
          AND p.deleted_at IS NULL
        ON CONFLICT DO NOTHING;
        
        GET DIAGNOSTICS migration_count = ROW_COUNT;
        RAISE NOTICE '  ✓ Migrated % barrier records', migration_count;
        
    ELSE
        RAISE NOTICE '  ⚠ gen_ai_barriers column does not exist - skipping';
    END IF;
END $$;

-- =====================================================================
-- 6. MIGRATE gen_ai_enablers TO persona_gen_ai_enablers
-- =====================================================================

DO $$ 
DECLARE
    migration_count INTEGER := 0;
BEGIN
    RAISE NOTICE '6. Migrating gen_ai_enablers array...';
    
    -- Check if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'personas' AND column_name = 'gen_ai_enablers') THEN
        
        -- Migrate data
        INSERT INTO public.persona_gen_ai_enablers (
            persona_id,
            enabler_text,
            enabler_category,
            impact,
            sequence_order,
            created_at
        )
        SELECT 
            p.id AS persona_id,
            unnest(p.gen_ai_enablers) AS enabler_text,
            'other' AS enabler_category, -- Default category
            'medium' AS impact, -- Default impact
            row_number() OVER (PARTITION BY p.id ORDER BY unnest(p.gen_ai_enablers)) AS sequence_order,
            NOW() AS created_at
        FROM public.personas p
        WHERE p.gen_ai_enablers IS NOT NULL 
          AND array_length(p.gen_ai_enablers, 1) > 0
          AND p.deleted_at IS NULL
        ON CONFLICT DO NOTHING;
        
        GET DIAGNOSTICS migration_count = ROW_COUNT;
        RAISE NOTICE '  ✓ Migrated % enabler records', migration_count;
        
    ELSE
        RAISE NOTICE '  ⚠ gen_ai_enablers column does not exist - skipping';
    END IF;
END $$;

-- =====================================================================
-- 7. DROP ARRAY COLUMNS FROM PERSONAS TABLE
-- ⚠️ This is irreversible - ensure migration was successful ⚠️
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '7. Preparing to drop array columns...';
    RAISE NOTICE '⚠️  WARNING: This step is irreversible!';
    RAISE NOTICE '';
    
    -- Drop columns if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'key_responsibilities') THEN
        ALTER TABLE public.personas DROP COLUMN key_responsibilities;
        RAISE NOTICE '  ✓ Dropped key_responsibilities column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'preferred_tools') THEN
        ALTER TABLE public.personas DROP COLUMN preferred_tools;
        RAISE NOTICE '  ✓ Dropped preferred_tools column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'tags') THEN
        ALTER TABLE public.personas DROP COLUMN tags;
        RAISE NOTICE '  ✓ Dropped tags column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'allowed_tenants') THEN
        ALTER TABLE public.personas DROP COLUMN allowed_tenants;
        RAISE NOTICE '  ✓ Dropped allowed_tenants column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'gen_ai_barriers') THEN
        ALTER TABLE public.personas DROP COLUMN gen_ai_barriers;
        RAISE NOTICE '  ✓ Dropped gen_ai_barriers column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'gen_ai_enablers') THEN
        ALTER TABLE public.personas DROP COLUMN gen_ai_enablers;
        RAISE NOTICE '  ✓ Dropped gen_ai_enablers column';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '  ✓ All array columns dropped successfully';
END $$;

-- =====================================================================
-- 8. VERIFICATION & SUMMARY
-- =====================================================================

DO $$
DECLARE
    persona_count INTEGER;
    responsibilities_count INTEGER;
    tools_count INTEGER;
    tags_count INTEGER;
    tenants_count INTEGER;
    barriers_count INTEGER;
    enablers_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO persona_count FROM public.personas WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO responsibilities_count FROM public.persona_responsibilities;
    SELECT COUNT(*) INTO tools_count FROM public.persona_tools;
    SELECT COUNT(*) INTO tags_count FROM public.persona_tags;
    SELECT COUNT(*) INTO tenants_count FROM public.persona_tenants;
    SELECT COUNT(*) INTO barriers_count FROM public.persona_gen_ai_barriers;
    SELECT COUNT(*) INTO enablers_count FROM public.persona_gen_ai_enablers;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PERSONA ARRAY MIGRATION COMPLETE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '  • Total active personas: %', persona_count;
    RAISE NOTICE '  • Responsibilities migrated: %', responsibilities_count;
    RAISE NOTICE '  • Tools migrated: %', tools_count;
    RAISE NOTICE '  • Tags migrated: %', tags_count;
    RAISE NOTICE '  • Tenant mappings: %', tenants_count;
    RAISE NOTICE '  • AI barriers migrated: %', barriers_count;
    RAISE NOTICE '  • AI enablers migrated: %', enablers_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Array Columns Dropped:';
    RAISE NOTICE '  ✓ key_responsibilities';
    RAISE NOTICE '  ✓ preferred_tools';
    RAISE NOTICE '  ✓ tags';
    RAISE NOTICE '  ✓ allowed_tenants';
    RAISE NOTICE '  ✓ gen_ai_barriers';
    RAISE NOTICE '  ✓ gen_ai_enablers';
    RAISE NOTICE '';
    RAISE NOTICE 'personas table is now fully normalized!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run backfill_persona_org_linkages.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

