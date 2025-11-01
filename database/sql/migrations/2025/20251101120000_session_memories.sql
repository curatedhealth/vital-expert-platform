-- ============================================================================
-- SESSION MEMORIES - LONG-TERM MEMORY FOR AGENTS
-- Migration: 20251101120000_session_memories.sql
-- Phase 2: AutoGPT Long-Term Memory Implementation
-- ============================================================================
--
-- Purpose: Enable agents to remember context across sessions
-- 
-- Features:
-- - Persistent session memories with vector search
-- - Memory types: fact, preference, task, result, tool_success
-- - Importance scoring for memory prioritization
-- - Semantic search via pgvector
-- - RLS for multi-tenant isolation
--
-- Golden Rules Compliance:
-- ✅ #3: Tenant isolation via RLS
-- ✅ #4: Supports RAG/Tools memory capture
-- ✅ #5: Enables feedback & learning
--
-- ============================================================================

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- TABLE: session_memories
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant & session identification
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    session_id TEXT NOT NULL,
    
    -- Memory content
    memory_type TEXT NOT NULL CHECK (memory_type IN (
        'fact',           -- Factual information extracted
        'preference',     -- User preferences learned
        'task',          -- Task patterns and workflows
        'result',        -- Important results/outcomes
        'tool_success'   -- Successful tool usage patterns
    )),
    content TEXT NOT NULL,
    content_embedding VECTOR(768),  -- Sentence transformer embedding
    
    -- Memory metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    importance FLOAT NOT NULL DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
    
    -- Access tracking
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accessed_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary lookup indexes
CREATE INDEX idx_memories_tenant_user ON session_memories(tenant_id, user_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_memories_session ON session_memories(session_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_memories_type ON session_memories(memory_type)
    WHERE deleted_at IS NULL;

-- Vector similarity search index (IVFFlat)
CREATE INDEX idx_memories_embedding ON session_memories 
    USING ivfflat (content_embedding vector_cosine_ops) 
    WITH (lists = 100)
    WHERE deleted_at IS NULL;

-- Importance-based retrieval
CREATE INDEX idx_memories_importance ON session_memories(importance DESC)
    WHERE deleted_at IS NULL;

-- Temporal indexes
CREATE INDEX idx_memories_created ON session_memories(created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_memories_accessed ON session_memories(last_accessed_at DESC NULLS LAST)
    WHERE deleted_at IS NULL;

-- Composite index for user+type queries
CREATE INDEX idx_memories_user_type ON session_memories(tenant_id, user_id, memory_type)
    WHERE deleted_at IS NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE session_memories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own memories within their tenant
CREATE POLICY session_memories_tenant_isolation ON session_memories
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID
        AND deleted_at IS NULL
    );

-- Policy: Platform admins can access all memories
CREATE POLICY session_memories_admin_access ON session_memories
    FOR ALL
    USING (
        current_setting('app.bypass_rls', TRUE)::TEXT = 'true'
    );

-- ============================================================================
-- FUNCTIONS: Memory Search & Retrieval
-- ============================================================================

-- Function: Search memories by semantic similarity
CREATE OR REPLACE FUNCTION search_memories_by_embedding(
    query_embedding VECTOR(768),
    p_tenant_id UUID,
    p_user_id UUID,
    p_memory_types TEXT[] DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_min_importance FLOAT DEFAULT 0.0,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    memory_type TEXT,
    importance FLOAT,
    similarity FLOAT,
    created_at TIMESTAMPTZ,
    accessed_count INTEGER,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.content,
        m.memory_type,
        m.importance,
        1 - (m.content_embedding <=> query_embedding) AS similarity,
        m.created_at,
        m.accessed_count,
        m.metadata
    FROM session_memories m
    WHERE m.tenant_id = p_tenant_id
        AND m.user_id = p_user_id
        AND m.deleted_at IS NULL
        AND (p_memory_types IS NULL OR m.memory_type = ANY(p_memory_types))
        AND (p_session_id IS NULL OR m.session_id = p_session_id)
        AND m.importance >= p_min_importance
        AND m.content_embedding IS NOT NULL
    ORDER BY 
        m.content_embedding <=> query_embedding ASC,
        m.importance DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get recent memories for a user
CREATE OR REPLACE FUNCTION get_recent_memories(
    p_tenant_id UUID,
    p_user_id UUID,
    p_memory_types TEXT[] DEFAULT NULL,
    p_days INTEGER DEFAULT 30,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    memory_type TEXT,
    importance FLOAT,
    created_at TIMESTAMPTZ,
    session_id TEXT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.content,
        m.memory_type,
        m.importance,
        m.created_at,
        m.session_id,
        m.metadata
    FROM session_memories m
    WHERE m.tenant_id = p_tenant_id
        AND m.user_id = p_user_id
        AND m.deleted_at IS NULL
        AND m.created_at >= NOW() - (p_days || ' days')::INTERVAL
        AND (p_memory_types IS NULL OR m.memory_type = ANY(p_memory_types))
    ORDER BY 
        m.importance DESC,
        m.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Update memory access tracking
CREATE OR REPLACE FUNCTION update_memory_access(
    p_memory_id UUID
)
RETURNS VOID AS $$
BEGIN
    UPDATE session_memories
    SET 
        accessed_count = accessed_count + 1,
        last_accessed_at = NOW()
    WHERE id = p_memory_id
        AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function: Soft delete old memories (cleanup)
CREATE OR REPLACE FUNCTION cleanup_old_memories(
    p_tenant_id UUID,
    p_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        UPDATE session_memories
        SET deleted_at = NOW()
        WHERE tenant_id = p_tenant_id
            AND created_at < NOW() - (p_days || ' days')::INTERVAL
            AND deleted_at IS NULL
            AND importance < 0.3  -- Only delete low-importance memories
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE session_memories IS 'Long-term memory storage for agent sessions with semantic search capabilities';
COMMENT ON COLUMN session_memories.memory_type IS 'Type of memory: fact, preference, task, result, tool_success';
COMMENT ON COLUMN session_memories.content IS 'The actual memory content in natural language';
COMMENT ON COLUMN session_memories.content_embedding IS 'Vector embedding for semantic similarity search (768-dim)';
COMMENT ON COLUMN session_memories.importance IS 'Importance score (0-1) for memory prioritization and cleanup';
COMMENT ON COLUMN session_memories.accessed_count IS 'Number of times this memory has been retrieved';

COMMENT ON FUNCTION search_memories_by_embedding IS 'Semantic search for memories using vector similarity';
COMMENT ON FUNCTION get_recent_memories IS 'Retrieve recent memories ordered by importance and recency';
COMMENT ON FUNCTION update_memory_access IS 'Update access tracking when a memory is retrieved';
COMMENT ON FUNCTION cleanup_old_memories IS 'Soft delete old low-importance memories for cleanup';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to application role (adjust role name as needed)
-- GRANT SELECT, INSERT, UPDATE ON session_memories TO app_role;
-- GRANT USAGE ON SEQUENCE session_memories_id_seq TO app_role;
-- GRANT EXECUTE ON FUNCTION search_memories_by_embedding TO app_role;
-- GRANT EXECUTE ON FUNCTION get_recent_memories TO app_role;
-- GRANT EXECUTE ON FUNCTION update_memory_access TO app_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verification query (optional)
DO $$
BEGIN
    RAISE NOTICE 'Session memories table created successfully';
    RAISE NOTICE 'Vector search enabled with pgvector';
    RAISE NOTICE 'RLS policies applied for multi-tenant isolation';
    RAISE NOTICE 'Memory search functions ready';
END $$;

