-- =====================================================================
-- ADD MISSING COLUMNS TO EXISTING AGENTS TABLE
-- Safe migration for existing agents table
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'UPDATING EXISTING AGENTS TABLE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Add persona_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' AND column_name = 'persona_id'
    ) THEN
        ALTER TABLE public.agents ADD COLUMN persona_id UUID;
        CREATE INDEX idx_agents_persona ON public.agents(persona_id);
        RAISE NOTICE '✓ Added persona_id to agents';
    ELSE
        RAISE NOTICE '  agents.persona_id already exists';
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Agents table updated successfully';
    RAISE NOTICE '';
    RAISE NOTICE 'Now run: add_org_mapping_to_all_tables.sql';
    RAISE NOTICE '';
END $$;

