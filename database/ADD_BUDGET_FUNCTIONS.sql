-- ============================================================================
-- VITAL Path - Additional Helper Functions
-- December 5, 2025
-- ============================================================================
-- 
-- These functions ADD to your existing RLS setup.
-- They don't replace any existing policies.
--
-- Your database already has:
-- ✅ RLS enabled on most tables
-- ✅ is_superadmin() function
-- ✅ get_current_organization_context() function
-- ✅ Organization-based isolation (organization_id)
-- ============================================================================

-- ============================================================================
-- Budget Check Function
-- ============================================================================
-- Check if user/organization has token budget remaining

CREATE OR REPLACE FUNCTION public.check_token_budget(
    p_user_id uuid DEFAULT NULL,
    p_estimated_tokens integer DEFAULT 0
)
RETURNS TABLE (
    allowed boolean,
    current_usage bigint,
    monthly_limit bigint,
    remaining bigint,
    usage_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_current_usage bigint;
    v_monthly_limit bigint;
BEGIN
    -- Use provided user_id or get from auth
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Default monthly limit (customize per organization/tier)
    v_monthly_limit := 1000000;  -- 1M tokens default
    
    -- Get current month usage from llm_usage_logs
    SELECT COALESCE(SUM(total_tokens), 0)
    INTO v_current_usage
    FROM llm_usage_logs
    WHERE user_id = v_user_id
      AND created_at >= date_trunc('month', CURRENT_TIMESTAMP);
    
    -- Return budget info
    RETURN QUERY SELECT
        (v_current_usage + p_estimated_tokens) <= v_monthly_limit AS allowed,
        v_current_usage AS current_usage,
        v_monthly_limit AS monthly_limit,
        GREATEST(0, v_monthly_limit - v_current_usage) AS remaining,
        ROUND((v_current_usage::numeric / NULLIF(v_monthly_limit, 0)::numeric) * 100, 2) AS usage_percentage;
END;
$$;

-- ============================================================================
-- User Token Usage Summary
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_token_usage(
    p_period text DEFAULT 'month',
    p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
    total_tokens bigint,
    total_cost numeric,
    request_count bigint,
    avg_tokens_per_request numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_start_date timestamp;
BEGIN
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Calculate start date based on period
    v_start_date := CASE p_period
        WHEN 'day' THEN date_trunc('day', CURRENT_TIMESTAMP)
        WHEN 'week' THEN date_trunc('week', CURRENT_TIMESTAMP)
        WHEN 'month' THEN date_trunc('month', CURRENT_TIMESTAMP)
        WHEN 'year' THEN date_trunc('year', CURRENT_TIMESTAMP)
        ELSE date_trunc('month', CURRENT_TIMESTAMP)
    END;
    
    RETURN QUERY SELECT
        COALESCE(SUM(ul.total_tokens), 0)::bigint AS total_tokens,
        COALESCE(SUM(ul.cost), 0)::numeric AS total_cost,
        COUNT(*)::bigint AS request_count,
        ROUND(AVG(ul.total_tokens), 2)::numeric AS avg_tokens_per_request
    FROM llm_usage_logs ul
    WHERE ul.user_id = v_user_id
      AND ul.created_at >= v_start_date;
END;
$$;

-- ============================================================================
-- Vector Search Function (uses existing knowledge_documents access)
-- ============================================================================
-- Performs similarity search while respecting existing RLS on knowledge_documents

CREATE OR REPLACE FUNCTION public.search_document_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    chunk_id uuid,
    document_id uuid,
    content text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id AS chunk_id,
        dc.document_id,
        dc.content,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    JOIN knowledge_documents kd ON kd.id = dc.document_id
    WHERE 
        -- Respect existing access policy on knowledge_documents
        (
            auth.uid() = kd.user_id 
            OR kd.access_policy = 'public'
            OR (auth.uid() IS NOT NULL AND kd.access_policy <> 'private')
            OR auth.role() = 'service_role'
        )
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================================
-- Convenience: Get current user's organization
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
$$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these to test the functions:

-- SELECT * FROM public.check_token_budget();
-- SELECT * FROM public.get_user_token_usage('month');
-- SELECT public.get_user_organization_id();

-- ============================================================================
-- DONE!
-- ============================================================================
-- These functions integrate with your existing RLS setup.
-- No existing policies were modified.


