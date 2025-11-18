-- ============================================================================
-- PHASE 2 MIGRATION RUNNER
-- Run all Phase 2 migrations in order
-- ============================================================================

-- Migration 1: Session Memories Table
\i /Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/migrations/2025/20251101120000_session_memories.sql

-- Verification
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'session_memories'
    ) THEN
        RAISE NOTICE '✅ session_memories table created';
    ELSE
        RAISE EXCEPTION '❌ session_memories table not found';
    END IF;
    
    -- Check if vector extension is enabled
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
    ) THEN
        RAISE NOTICE '✅ pgvector extension enabled';
    ELSE
        RAISE EXCEPTION '❌ pgvector extension not found';
    END IF;
    
    -- Check if RLS is enabled
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'session_memories' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS enabled on session_memories';
    ELSE
        RAISE EXCEPTION '❌ RLS not enabled on session_memories';
    END IF;
    
    -- Check functions
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'search_memories_by_embedding'
    ) THEN
        RAISE NOTICE '✅ search_memories_by_embedding function created';
    ELSE
        RAISE EXCEPTION '❌ search_memories_by_embedding function not found';
    END IF;
    
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ PHASE 2 MIGRATION COMPLETE';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Install Python dependencies:';
    RAISE NOTICE '   pip install sentence-transformers==2.2.2 faiss-cpu==1.7.4';
    RAISE NOTICE '2. Integrate MemoryIntegrationMixin into workflows';
    RAISE NOTICE '3. Test memory recall with sample queries';
END $$;

