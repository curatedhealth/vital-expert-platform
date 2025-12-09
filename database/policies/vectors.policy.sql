-- ============================================================================
-- VITAL Path - Knowledge Vectors Table RLS Policies
-- ============================================================================
-- 
-- Vector embeddings for RAG are tenant-isolated.
-- This is CRITICAL for preventing cross-tenant data leakage in AI responses.
-- ============================================================================

-- Enable RLS on knowledge_vectors table
ALTER TABLE knowledge_vectors ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners
ALTER TABLE knowledge_vectors FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Users can query vectors in their tenant only
CREATE POLICY "knowledge_vectors_select_tenant"
ON knowledge_vectors
FOR SELECT
USING (
    tenant_id = auth.tenant_id()
);

-- Shared knowledge base vectors visible to all authenticated users
CREATE POLICY "knowledge_vectors_select_shared"
ON knowledge_vectors
FOR SELECT
USING (
    is_shared = true
);

-- System admins can view all vectors
CREATE POLICY "knowledge_vectors_select_system"
ON knowledge_vectors
FOR SELECT
USING (
    auth.is_system_admin()
);

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Vectors are inserted by the system during document processing
-- Users don't directly insert vectors
CREATE POLICY "knowledge_vectors_insert_tenant"
ON knowledge_vectors
FOR INSERT
WITH CHECK (
    tenant_id = auth.tenant_id()
);

-- System can insert shared vectors
CREATE POLICY "knowledge_vectors_insert_system"
ON knowledge_vectors
FOR INSERT
WITH CHECK (
    auth.is_system_admin()
);

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Vectors are generally not updated, but allow for reprocessing
CREATE POLICY "knowledge_vectors_update_tenant"
ON knowledge_vectors
FOR UPDATE
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
)
WITH CHECK (
    tenant_id = auth.tenant_id()
);

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Vectors are deleted when parent document is deleted (cascade)
-- But allow manual deletion by tenant admins
CREATE POLICY "knowledge_vectors_delete_tenant_admin"
ON knowledge_vectors
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
);

-- System admins can delete any vectors
CREATE POLICY "knowledge_vectors_delete_system"
ON knowledge_vectors
FOR DELETE
USING (
    auth.is_system_admin()
);

-- ============================================================================
-- INDEXES FOR RLS + VECTOR SEARCH PERFORMANCE
-- ============================================================================

-- Index for tenant filtering (CRITICAL for vector search)
CREATE INDEX IF NOT EXISTS idx_knowledge_vectors_tenant_id 
ON knowledge_vectors(tenant_id);

-- Index for document reference
CREATE INDEX IF NOT EXISTS idx_knowledge_vectors_document_id 
ON knowledge_vectors(document_id);

-- Composite index for tenant + domain filtering
CREATE INDEX IF NOT EXISTS idx_knowledge_vectors_tenant_domain 
ON knowledge_vectors(tenant_id, domain_id);

-- Index for shared vectors
CREATE INDEX IF NOT EXISTS idx_knowledge_vectors_shared 
ON knowledge_vectors(is_shared) WHERE is_shared = true;

-- ============================================================================
-- VECTOR SEARCH FUNCTION (Tenant-Isolated)
-- ============================================================================
-- This function is the ONLY way vectors should be queried.
-- It enforces tenant isolation at the database level.
-- ============================================================================

CREATE OR REPLACE FUNCTION match_knowledge_vectors(
    query_embedding vector(1536),
    p_tenant_id uuid DEFAULT NULL,
    p_domain_id uuid DEFAULT NULL,
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    include_shared boolean DEFAULT true
)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    content text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with elevated privileges
SET search_path = public
AS $$
DECLARE
    v_tenant_id uuid;
BEGIN
    -- Get tenant ID from JWT if not provided
    v_tenant_id := COALESCE(p_tenant_id, auth.tenant_id());
    
    -- CRITICAL: Fail if no tenant context
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant context required for vector search. Access denied.';
    END IF;
    
    RETURN QUERY
    SELECT
        kv.id,
        kv.document_id,
        kv.content,
        kv.metadata,
        1 - (kv.embedding <=> query_embedding) as similarity
    FROM knowledge_vectors kv
    WHERE 
        -- Tenant isolation OR shared content
        (kv.tenant_id = v_tenant_id OR (include_shared AND kv.is_shared = true))
        -- Optional domain filter
        AND (p_domain_id IS NULL OR kv.domain_id = p_domain_id)
        -- Similarity threshold
        AND 1 - (kv.embedding <=> query_embedding) > match_threshold
    ORDER BY kv.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_knowledge_vectors TO authenticated;

-- ============================================================================
-- HYBRID SEARCH FUNCTION (Vector + Keyword)
-- ============================================================================

CREATE OR REPLACE FUNCTION hybrid_search_knowledge(
    query_text text,
    query_embedding vector(1536),
    p_tenant_id uuid DEFAULT NULL,
    p_domain_id uuid DEFAULT NULL,
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10,
    vector_weight float DEFAULT 0.7,
    include_shared boolean DEFAULT true
)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    content text,
    metadata jsonb,
    vector_score float,
    text_score float,
    hybrid_score float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id uuid;
BEGIN
    v_tenant_id := COALESCE(p_tenant_id, auth.tenant_id());
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant context required for search. Access denied.';
    END IF;
    
    RETURN QUERY
    SELECT
        kv.id,
        kv.document_id,
        kv.content,
        kv.metadata,
        (1 - (kv.embedding <=> query_embedding)) as vector_score,
        ts_rank_cd(to_tsvector('english', kv.content), plainto_tsquery('english', query_text)) as text_score,
        (
            vector_weight * (1 - (kv.embedding <=> query_embedding)) +
            (1 - vector_weight) * ts_rank_cd(to_tsvector('english', kv.content), plainto_tsquery('english', query_text))
        ) as hybrid_score
    FROM knowledge_vectors kv
    WHERE 
        (kv.tenant_id = v_tenant_id OR (include_shared AND kv.is_shared = true))
        AND (p_domain_id IS NULL OR kv.domain_id = p_domain_id)
        AND (
            1 - (kv.embedding <=> query_embedding) > match_threshold
            OR to_tsvector('english', kv.content) @@ plainto_tsquery('english', query_text)
        )
    ORDER BY hybrid_score DESC
    LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION hybrid_search_knowledge TO authenticated;


