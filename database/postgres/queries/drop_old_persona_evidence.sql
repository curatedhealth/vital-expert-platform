-- Drop ONLY the old persona_evidence_sources table that's causing the conflict
DROP TABLE IF EXISTS public.persona_evidence_sources CASCADE;

-- Confirm it's gone
SELECT 
    'persona_evidence_sources' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'persona_evidence_sources') as exists;

