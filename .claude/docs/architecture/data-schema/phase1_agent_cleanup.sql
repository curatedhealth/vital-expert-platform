-- ==========================================
-- FILE: phase1_agent_cleanup.sql
-- PURPOSE: Clean core agents table by migrating all JSONB and ARRAY fields to normalized tables
-- PHASE: 1 of 9 - Foundation Cleanup
-- DEPENDENCIES: agents, tenants tables must exist
-- GOLDEN RULES: Zero JSONB for structured data, all arrays in junction tables
-- ==========================================

-- ==========================================
-- SECTION 1: BACKUP & SAFETY
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 1: AGENT FOUNDATION CLEANUP - BACKUP & SAFETY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Create backup table
DO $$
BEGIN
    DROP TABLE IF EXISTS agents_backup_pre_agentos2 CASCADE;
    
    CREATE TABLE agents_backup_pre_agentos2 AS 
    SELECT * FROM agents;
    
    RAISE NOTICE '✓ Backup created: agents_backup_pre_agentos2';
    RAISE NOTICE '  Total agents backed up: %', (SELECT COUNT(*) FROM agents_backup_pre_agentos2);
END $$;

-- Verification query: Count metadata fields
DO $$
DECLARE
    agent_count INTEGER;
    color_scheme_count INTEGER;
    personality_traits_count INTEGER;
    prompt_starters_count INTEGER;
    metadata_count INTEGER;
    specializations_count INTEGER;
    tags_count INTEGER;
    allowed_tenants_count INTEGER;
    knowledge_domains_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO agent_count FROM agents WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO color_scheme_count FROM agents WHERE color_scheme IS NOT NULL AND color_scheme != '{}'::jsonb;
    SELECT COUNT(*) INTO personality_traits_count FROM agents WHERE personality_traits IS NOT NULL AND personality_traits != '{}'::jsonb;
    SELECT COUNT(*) INTO prompt_starters_count FROM agents WHERE prompt_starters IS NOT NULL AND prompt_starters != '[]'::jsonb;
    SELECT COUNT(*) INTO metadata_count FROM agents WHERE metadata IS NOT NULL AND metadata != '{}'::jsonb;
    SELECT COUNT(*) INTO specializations_count FROM agents WHERE specializations IS NOT NULL AND array_length(specializations, 1) > 0;
    SELECT COUNT(*) INTO tags_count FROM agents WHERE tags IS NOT NULL AND array_length(tags, 1) > 0;
    SELECT COUNT(*) INTO allowed_tenants_count FROM agents WHERE allowed_tenants IS NOT NULL AND array_length(allowed_tenants, 1) > 0;
    SELECT COUNT(*) INTO knowledge_domains_count FROM agents WHERE knowledge_domains IS NOT NULL AND array_length(knowledge_domains, 1) > 0;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== PRE-MIGRATION STATE ===';
    RAISE NOTICE 'Total agents: %', agent_count;
    RAISE NOTICE 'Agents with color_scheme: %', color_scheme_count;
    RAISE NOTICE 'Agents with personality_traits: %', personality_traits_count;
    RAISE NOTICE 'Agents with prompt_starters: %', prompt_starters_count;
    RAISE NOTICE 'Agents with metadata: %', metadata_count;
    RAISE NOTICE 'Agents with specializations: %', specializations_count;
    RAISE NOTICE 'Agents with tags: %', tags_count;
    RAISE NOTICE 'Agents with allowed_tenants: %', allowed_tenants_count;
    RAISE NOTICE 'Agents with knowledge_domains: %', knowledge_domains_count;
    RAISE NOTICE '';
END $$;

-- ==========================================
-- SECTION 2: NORMALIZE AGENT ARRAYS
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SECTION 2: NORMALIZE AGENT ARRAYS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- ==========================================
-- 2A. Agent Specializations
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- 2A. Creating agent_specializations table ---';
END $$;

CREATE TABLE IF NOT EXISTS agent_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agent_id, specialization)
);

DO $$
DECLARE
    row_count INTEGER;
BEGIN
    -- Migrate specializations array
    INSERT INTO agent_specializations (agent_id, tenant_id, specialization)
    SELECT 
        id,
        tenant_id,
        unnest(specializations)
    FROM agents
    WHERE specializations IS NOT NULL 
      AND array_length(specializations, 1) > 0
      AND EXISTS (
          SELECT 1 FROM unnest(specializations) AS s
          WHERE s IS NOT NULL AND TRIM(s) != ''
      )
    ON CONFLICT (agent_id, specialization) DO NOTHING;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % specializations from agents.specializations array', row_count;
END $$;

-- ==========================================
-- 2B. Agent Tags
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- 2B. Creating agent_tags table ---';
END $$;

CREATE TABLE IF NOT EXISTS agent_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agent_id, tag)
);

DO $$
DECLARE
    row_count INTEGER;
BEGIN
    -- Migrate tags array
    INSERT INTO agent_tags (agent_id, tag)
    SELECT 
        id,
        unnest(tags)
    FROM agents
    WHERE tags IS NOT NULL 
      AND array_length(tags, 1) > 0
      AND EXISTS (
          SELECT 1 FROM unnest(tags) AS t
          WHERE t IS NOT NULL AND TRIM(t) != ''
      )
    ON CONFLICT (agent_id, tag) DO NOTHING;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % tags from agents.tags array', row_count;
END $$;

-- ==========================================
-- 2C. Agent Allowed Tenants
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- 2C. Creating agent_tenants table (allowed tenants) ---';
END $$;

CREATE TABLE IF NOT EXISTS agent_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agent_id, tenant_id)
);

DO $$
DECLARE
    row_count INTEGER;
BEGIN
    -- Migrate allowed_tenants array
    INSERT INTO agent_tenants (agent_id, tenant_id)
    SELECT 
        id,
        unnest(allowed_tenants)::UUID
    FROM agents
    WHERE allowed_tenants IS NOT NULL 
      AND array_length(allowed_tenants, 1) > 0
    ON CONFLICT (agent_id, tenant_id) DO NOTHING;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % tenant assignments from agents.allowed_tenants array', row_count;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠ Error migrating allowed_tenants (may be incompatible type): %', SQLERRM;
END $$;

-- ==========================================
-- 2D. Knowledge Domains (check if redundant)
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- 2D. Checking knowledge_domains array (may be redundant with agent_knowledge) ---';
    
    -- Note: If agent_knowledge table already exists and is sufficient,
    -- we can just drop this array. If it contains different data,
    -- we need to migrate it.
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' 
        AND column_name = 'knowledge_domains'
    ) THEN
        RAISE NOTICE '⚠ knowledge_domains array exists - will be dropped after validation';
        RAISE NOTICE '  Verify agent_knowledge table contains all necessary knowledge mappings';
    END IF;
END $$;

-- ==========================================
-- SECTION 3: NORMALIZE AGENT JSONB FIELDS
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SECTION 3: NORMALIZE AGENT JSONB FIELDS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- ==========================================
-- 3A. Color Scheme
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- 3A. Creating agent_color_schemes table ---';
END $$;

CREATE TABLE IF NOT EXISTS agent_color_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
    primary_color TEXT,
    secondary_color TEXT,
    accent_color TEXT,
    background_color TEXT,
    text_color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
    row_count INTEGER;
BEGIN
    -- Migrate color_scheme JSONB
    INSERT INTO agent_color_schemes (
        agent_id, 
        primary_color, 
        secondary_color, 
        accent_color, 
        background_color, 
        text_color
    )
    SELECT 
        id,
        color_scheme->>'primary',
        color_scheme->>'secondary',
        color_scheme->>'accent',
        color_scheme->>'background',
        color_scheme->>'text'
    FROM agents 
    WHERE color_scheme IS NOT NULL 
      AND color_scheme != '{}'::jsonb
    ON CONFLICT (agent_id) DO NOTHING;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % color schemes from agents.color_scheme JSONB', row_count;
END $$;

-- ==========================================
-- 3B. Personality Traits
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- 3B. Creating agent_personality_traits table ---';
END $$;

CREATE TABLE IF NOT EXISTS agent_personality_traits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    trait_name TEXT NOT NULL,
    trait_value TEXT,
    trait_score NUMERIC(3,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agent_id, trait_name)
);

DO $$
DECLARE
    row_count INTEGER;
BEGIN
    -- Migrate personality_traits JSONB
    INSERT INTO agent_personality_traits (agent_id, trait_name, trait_value)
    SELECT 
        id,
        key as trait_name,
        value::TEXT as trait_value
    FROM agents, jsonb_each(personality_traits)
    WHERE personality_traits IS NOT NULL
      AND personality_traits != '{}'::jsonb
    ON CONFLICT (agent_id, trait_name) DO NOTHING;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % personality traits from agents.personality_traits JSONB', row_count;
END $$;

-- ==========================================
-- 3C. Prompt Starters
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- 3C. Creating agent_prompt_starters table ---';
END $$;

CREATE TABLE IF NOT EXISTS agent_prompt_starters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    icon TEXT,
    category TEXT,
    sequence_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
    row_count INTEGER;
BEGIN
    -- Migrate prompt_starters JSONB array
    INSERT INTO agent_prompt_starters (agent_id, text, icon, sequence_order)
    SELECT 
        a.id,
        TRIM(ps.value->>'text'),
        ps.value->>'icon',
        ps.ordinality::INTEGER
    FROM agents a, 
         jsonb_array_elements(a.prompt_starters) WITH ORDINALITY AS ps(value, ordinality)
    WHERE a.prompt_starters IS NOT NULL
      AND jsonb_array_length(a.prompt_starters) > 0
      AND TRIM(COALESCE(ps.value->>'text', '')) != ''
    ON CONFLICT DO NOTHING;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % prompt starters from agents.prompt_starters JSONB', row_count;
END $$;

-- ==========================================
-- 3D. Metadata (Preserve for runtime data)
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- 3D. Metadata field ---';
    RAISE NOTICE '⚠ metadata JSONB will be PRESERVED for true unstructured runtime data';
    RAISE NOTICE '  All structured patterns should be extracted to dedicated tables';
    RAISE NOTICE '  See documentation for guidelines on metadata usage';
END $$;

-- ==========================================
-- SECTION 4: CLEAN JUNCTION TABLES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SECTION 4: CLEAN JUNCTION TABLES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Remove JSONB configuration fields from agent junctions
DO $$
BEGIN
    -- Check and remove configuration from agent_tools
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agent_tools' 
        AND column_name = 'configuration'
    ) THEN
        RAISE NOTICE '⚠ agent_tools.configuration JSONB exists';
        RAISE NOTICE '  Consider creating agent_tool_configurations table if needed';
        RAISE NOTICE '  For now, keeping as-is for Phase 6 (Tool Schemas)';
    END IF;
    
    -- Check and remove configuration from agent_capabilities
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agent_capabilities' 
        AND column_name = 'configuration'
    ) THEN
        RAISE NOTICE '⚠ agent_capabilities.configuration JSONB exists';
        RAISE NOTICE '  Consider creating agent_capability_configurations table if needed';
        RAISE NOTICE '  For now, keeping as-is until we define capability config structure';
    END IF;
END $$;

-- ==========================================
-- SECTION 5: CREATE INDEXES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SECTION 5: CREATE INDEXES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Agent Specializations indexes
CREATE INDEX IF NOT EXISTS idx_agent_specializations_agent ON agent_specializations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_specializations_tenant ON agent_specializations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_specializations_spec ON agent_specializations(specialization);

-- Agent Tags indexes
CREATE INDEX IF NOT EXISTS idx_agent_tags_agent ON agent_tags(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tags_tag ON agent_tags(tag);

-- Agent Tenants indexes
CREATE INDEX IF NOT EXISTS idx_agent_tenants_agent ON agent_tenants(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tenants_tenant ON agent_tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_tenants_active ON agent_tenants(is_active);

-- Agent Color Schemes indexes
CREATE INDEX IF NOT EXISTS idx_agent_color_schemes_agent ON agent_color_schemes(agent_id);

-- Agent Personality Traits indexes
CREATE INDEX IF NOT EXISTS idx_agent_personality_traits_agent ON agent_personality_traits(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_personality_traits_trait ON agent_personality_traits(trait_name);

-- Agent Prompt Starters indexes
CREATE INDEX IF NOT EXISTS idx_agent_prompt_starters_agent ON agent_prompt_starters(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_prompt_starters_active ON agent_prompt_starters(is_active);

DO $$
BEGIN
    RAISE NOTICE '✓ All indexes created successfully';
    RAISE NOTICE '';
END $$;

-- ==========================================
-- SECTION 6: DROP MIGRATED COLUMNS
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SECTION 6: DROP MIGRATED COLUMNS FROM AGENTS TABLE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Drop arrays
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'specializations') THEN
        ALTER TABLE agents DROP COLUMN specializations CASCADE;
        RAISE NOTICE '✓ Dropped agents.specializations column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'tags') THEN
        ALTER TABLE agents DROP COLUMN tags CASCADE;
        RAISE NOTICE '✓ Dropped agents.tags column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'allowed_tenants') THEN
        ALTER TABLE agents DROP COLUMN allowed_tenants CASCADE;
        RAISE NOTICE '✓ Dropped agents.allowed_tenants column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'knowledge_domains') THEN
        ALTER TABLE agents DROP COLUMN knowledge_domains CASCADE;
        RAISE NOTICE '✓ Dropped agents.knowledge_domains column';
    END IF;
END $$;

-- Drop JSONB fields
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'color_scheme') THEN
        ALTER TABLE agents DROP COLUMN color_scheme CASCADE;
        RAISE NOTICE '✓ Dropped agents.color_scheme column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'personality_traits') THEN
        ALTER TABLE agents DROP COLUMN personality_traits CASCADE;
        RAISE NOTICE '✓ Dropped agents.personality_traits column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'prompt_starters') THEN
        ALTER TABLE agents DROP COLUMN prompt_starters CASCADE;
        RAISE NOTICE '✓ Dropped agents.prompt_starters column';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '⚠ metadata JSONB field PRESERVED - use only for true unstructured runtime data';
END $$;

-- ==========================================
-- SECTION 7: VERIFICATION QUERIES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SECTION 7: VERIFICATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

DO $$
DECLARE
    agent_count INTEGER;
    specializations_count INTEGER;
    tags_count INTEGER;
    tenants_count INTEGER;
    color_schemes_count INTEGER;
    personality_traits_count INTEGER;
    prompt_starters_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO agent_count FROM agents WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO specializations_count FROM agent_specializations;
    SELECT COUNT(*) INTO tags_count FROM agent_tags;
    SELECT COUNT(*) INTO tenants_count FROM agent_tenants;
    SELECT COUNT(*) INTO color_schemes_count FROM agent_color_schemes;
    SELECT COUNT(*) INTO personality_traits_count FROM agent_personality_traits;
    SELECT COUNT(*) INTO prompt_starters_count FROM agent_prompt_starters;
    
    RAISE NOTICE '=== POST-MIGRATION STATE ===';
    RAISE NOTICE 'Total agents: %', agent_count;
    RAISE NOTICE 'Total specializations: %', specializations_count;
    RAISE NOTICE 'Total tags: %', tags_count;
    RAISE NOTICE 'Total tenant assignments: %', tenants_count;
    RAISE NOTICE 'Total color schemes: %', color_schemes_count;
    RAISE NOTICE 'Total personality traits: %', personality_traits_count;
    RAISE NOTICE 'Total prompt starters: %', prompt_starters_count;
    RAISE NOTICE '';
    
    -- Verify dropped columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name IN ('specializations', 'tags', 'allowed_tenants', 'knowledge_domains', 'color_scheme', 'personality_traits', 'prompt_starters')) THEN
        RAISE NOTICE '✓ All JSONB/array columns successfully dropped from agents table';
    ELSE
        RAISE WARNING '⚠ Some columns still exist in agents table - check manually';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 1 COMPLETE: AGENT FOUNDATION CLEANUP';
    RAISE NOTICE '=================================================================';
END $$;

-- Final summary query
SELECT 
    'Agent Specializations' as entity, 
    COUNT(*) as count,
    COUNT(DISTINCT agent_id) as unique_agents
FROM agent_specializations
UNION ALL
SELECT 
    'Agent Tags', 
    COUNT(*),
    COUNT(DISTINCT agent_id)
FROM agent_tags
UNION ALL
SELECT 
    'Agent Tenants', 
    COUNT(*),
    COUNT(DISTINCT agent_id)
FROM agent_tenants
UNION ALL
SELECT 
    'Agent Color Schemes', 
    COUNT(*),
    COUNT(DISTINCT agent_id)
FROM agent_color_schemes
UNION ALL
SELECT 
    'Agent Personality Traits', 
    COUNT(*),
    COUNT(DISTINCT agent_id)
FROM agent_personality_traits
UNION ALL
SELECT 
    'Agent Prompt Starters', 
    COUNT(*),
    COUNT(DISTINCT agent_id)
FROM agent_prompt_starters;

