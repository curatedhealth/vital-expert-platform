-- ============================================================================
-- Migration: GraphRAG Full-Text Search RPC Function
-- Date: 2025-11-27
-- Purpose: Create PostgreSQL RPC function for full-text agent search
--          Used by GraphRAGSelector for the 30% PostgreSQL weight in hybrid selection
-- ============================================================================

BEGIN;

-- ============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For trigram similarity
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;  -- For fuzzy string matching

-- ============================================================================
-- FULL-TEXT SEARCH CONFIGURATION
-- ============================================================================

-- Create a custom text search configuration for medical/pharma terms
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_ts_config WHERE cfgname = 'medical_english'
    ) THEN
        -- Use English as base and customize
        CREATE TEXT SEARCH CONFIGURATION medical_english (COPY = english);
    END IF;
END $$;

-- ============================================================================
-- ADD FULL-TEXT SEARCH COLUMN TO AGENTS TABLE (if not exists)
-- ============================================================================

-- Add tsvector column for efficient full-text search
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'search_vector'
    ) THEN
        ALTER TABLE agents ADD COLUMN search_vector tsvector;
    END IF;
END $$;

-- Create index on search_vector
CREATE INDEX IF NOT EXISTS idx_agents_search_vector
ON agents USING GIN (search_vector);

-- ============================================================================
-- TRIGGER TO UPDATE SEARCH VECTOR
-- ============================================================================

CREATE OR REPLACE FUNCTION update_agents_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.display_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.system_prompt, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.knowledge_domains, ' '), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.capabilities, ' '), '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS agents_search_vector_trigger ON agents;
CREATE TRIGGER agents_search_vector_trigger
BEFORE INSERT OR UPDATE ON agents
FOR EACH ROW EXECUTE FUNCTION update_agents_search_vector();

-- Update existing rows
UPDATE agents SET
    search_vector =
        setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(display_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(system_prompt, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(knowledge_domains, ' '), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(capabilities, ' '), '')), 'B')
WHERE search_vector IS NULL;

-- ============================================================================
-- MAIN RPC FUNCTION: search_agents_fulltext
-- ============================================================================

/**
 * Full-text search for agents using PostgreSQL
 *
 * Used by GraphRAGSelector for the 30% PostgreSQL weight in hybrid selection.
 *
 * Features:
 * - Weighted full-text search (name > description > capabilities)
 * - Trigram similarity fallback for fuzzy matching
 * - Tenant isolation
 * - Active agents only
 *
 * @param search_query - The search query text
 * @param tenant_filter - Tenant ID for multi-tenant isolation
 * @param result_limit - Maximum number of results
 * @returns Table of agents with text_rank scores
 */
CREATE OR REPLACE FUNCTION search_agents_fulltext(
    search_query TEXT,
    tenant_filter UUID,
    result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    display_name VARCHAR,
    description TEXT,
    tier agent_tier,
    knowledge_domains TEXT[],
    capabilities TEXT[],
    text_rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    normalized_query TEXT;
    ts_query tsquery;
BEGIN
    -- Normalize query: lowercase, trim, remove special chars
    normalized_query := regexp_replace(
        lower(trim(search_query)),
        '[^\w\s]', ' ', 'g'
    );

    -- Create tsquery with OR for better recall
    -- Convert "word1 word2" to "word1 | word2" for broader matches
    ts_query := plainto_tsquery('english', normalized_query);

    RETURN QUERY
    WITH ranked_agents AS (
        SELECT
            a.id,
            a.name,
            a.display_name,
            a.description,
            a.tier,
            a.knowledge_domains,
            a.capabilities,
            -- Combined scoring: ts_rank + trigram similarity
            (
                -- Full-text rank (0-1 normalized)
                COALESCE(ts_rank_cd(a.search_vector, ts_query, 32), 0.0) * 0.6
                +
                -- Trigram similarity on name (0-1)
                COALESCE(similarity(a.name, normalized_query), 0.0) * 0.2
                +
                -- Trigram similarity on description (0-1)
                COALESCE(similarity(LEFT(a.description, 500), normalized_query), 0.0) * 0.2
            )::REAL AS text_rank
        FROM agents a
        WHERE
            -- Tenant isolation
            a.tenant_id = tenant_filter
            -- Active agents only
            AND a.status = 'active'
            -- Match via full-text OR trigram
            AND (
                a.search_vector @@ ts_query
                OR similarity(a.name, normalized_query) > 0.1
                OR similarity(LEFT(a.description, 500), normalized_query) > 0.1
            )
    )
    SELECT *
    FROM ranked_agents
    WHERE text_rank > 0.01  -- Minimum threshold
    ORDER BY text_rank DESC
    LIMIT result_limit;
END;
$$;

COMMENT ON FUNCTION search_agents_fulltext IS
    'Full-text search for agents using weighted ts_rank and trigram similarity. Used by GraphRAGSelector (30% weight).';

-- ============================================================================
-- ALTERNATIVE: Simple Keyword Search (fallback)
-- ============================================================================

/**
 * Simple keyword search for agents
 * Fallback when full-text search yields no results
 */
CREATE OR REPLACE FUNCTION search_agents_keywords(
    search_keywords TEXT[],
    tenant_filter UUID,
    result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    display_name VARCHAR,
    description TEXT,
    tier agent_tier,
    knowledge_domains TEXT[],
    capabilities TEXT[],
    keyword_score REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.name,
        a.display_name,
        a.description,
        a.tier,
        a.knowledge_domains,
        a.capabilities,
        -- Score based on keyword matches
        (
            -- Count domain matches
            COALESCE(
                array_length(
                    ARRAY(
                        SELECT unnest(a.knowledge_domains)
                        INTERSECT
                        SELECT unnest(search_keywords)
                    ),
                    1
                ),
                0
            )::REAL * 0.5
            +
            -- Count capability matches
            COALESCE(
                array_length(
                    ARRAY(
                        SELECT unnest(a.capabilities)
                        INTERSECT
                        SELECT unnest(search_keywords)
                    ),
                    1
                ),
                0
            )::REAL * 0.3
            +
            -- Base score
            0.2
        )::REAL AS keyword_score
    FROM agents a
    WHERE
        a.tenant_id = tenant_filter
        AND a.status = 'active'
        AND (
            -- Match in domains
            a.knowledge_domains && search_keywords
            OR
            -- Match in capabilities
            a.capabilities && search_keywords
            OR
            -- Match in name (case-insensitive)
            EXISTS (
                SELECT 1 FROM unnest(search_keywords) AS kw
                WHERE a.name ILIKE '%' || kw || '%'
            )
        )
    ORDER BY keyword_score DESC
    LIMIT result_limit;
END;
$$;

COMMENT ON FUNCTION search_agents_keywords IS
    'Keyword-based search for agents. Fallback for full-text search.';

-- ============================================================================
-- VALIDATION
-- ============================================================================

DO $$
DECLARE
    func_exists BOOLEAN;
BEGIN
    -- Check search_agents_fulltext exists
    SELECT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'search_agents_fulltext'
    ) INTO func_exists;

    IF func_exists THEN
        RAISE NOTICE '✅ search_agents_fulltext function created successfully';
    ELSE
        RAISE WARNING '❌ search_agents_fulltext function creation failed';
    END IF;

    -- Check search_agents_keywords exists
    SELECT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'search_agents_keywords'
    ) INTO func_exists;

    IF func_exists THEN
        RAISE NOTICE '✅ search_agents_keywords function created successfully';
    ELSE
        RAISE WARNING '❌ search_agents_keywords function creation failed';
    END IF;

    -- Check index exists
    IF EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_agents_search_vector'
    ) THEN
        RAISE NOTICE '✅ Full-text search index created';
    ELSE
        RAISE WARNING '❌ Full-text search index missing';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== GraphRAG Full-Text Search Migration Complete ===';
    RAISE NOTICE 'Functions available:';
    RAISE NOTICE '  - search_agents_fulltext(query, tenant_id, limit)';
    RAISE NOTICE '  - search_agents_keywords(keywords[], tenant_id, limit)';
END $$;

COMMIT;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Full-text search
SELECT * FROM search_agents_fulltext(
    'diabetes treatment guidelines',
    '00000000-0000-0000-0000-000000000001',
    10
);

-- Keyword search
SELECT * FROM search_agents_keywords(
    ARRAY['cardiology', 'heart failure', 'ecg'],
    '00000000-0000-0000-0000-000000000001',
    10
);
*/
