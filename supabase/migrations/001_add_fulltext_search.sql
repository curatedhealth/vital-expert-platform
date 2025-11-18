-- Migration: Add PostgreSQL Full-Text Search for Agents
-- Date: 2025-11-17
-- Purpose: Enable GraphRAG hybrid search with PostgreSQL full-text (30% weight)

-- ==================== Extensions ====================

-- Enable pg_trgm for trigram-based text similarity
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==================== Text Search Configuration ====================

-- Create custom text search configuration for medical/regulatory domain
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS medical_english (COPY = english);

-- Add custom dictionary for medical terms (optional, can be extended later)
-- COMMENT: In production, add domain-specific stop words and synonyms

-- ==================== Add Full-Text Search Columns ====================

-- Add tsvector column for full-text search
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- ==================== Create Full-Text Search Index ====================

-- GIN index for tsvector (fast full-text search)
CREATE INDEX IF NOT EXISTS agents_search_vector_idx
ON agents USING gin(search_vector);

-- Trigram index for fuzzy matching on name and description
CREATE INDEX IF NOT EXISTS agents_name_trgm_idx
ON agents USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS agents_description_trgm_idx
ON agents USING gin(description gin_trgm_ops);

-- ==================== Update Function for search_vector ====================

-- Function to update search_vector automatically
CREATE OR REPLACE FUNCTION update_agent_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    -- Combine name, description, capabilities, and domains into search vector
    NEW.search_vector :=
        setweight(to_tsvector('medical_english', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('medical_english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('medical_english', coalesce(array_to_string(NEW.capabilities, ' '), '')), 'C') ||
        setweight(to_tsvector('medical_english', coalesce(array_to_string(NEW.domain_expertise, ' '), '')), 'C') ||
        setweight(to_tsvector('medical_english', coalesce(NEW.specialization, '')), 'B');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search_vector on INSERT or UPDATE
DROP TRIGGER IF EXISTS update_agent_search_vector_trigger ON agents;

CREATE TRIGGER update_agent_search_vector_trigger
BEFORE INSERT OR UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION update_agent_search_vector();

-- ==================== Initial Population ====================

-- Populate search_vector for existing agents
UPDATE agents
SET search_vector =
    setweight(to_tsvector('medical_english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('medical_english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('medical_english', coalesce(array_to_string(capabilities, ' '), '')), 'C') ||
    setweight(to_tsvector('medical_english', coalesce(array_to_string(domain_expertise, ' '), '')), 'C') ||
    setweight(to_tsvector('medical_english', coalesce(specialization, '')), 'B');

-- ==================== Search Function (RPC) ====================

-- Function for full-text search with ranking
CREATE OR REPLACE FUNCTION search_agents_fulltext(
    search_query text,
    tenant_filter uuid,
    result_limit integer DEFAULT 20
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    capabilities text[],
    domain_expertise text[],
    specialization text,
    tier integer,
    text_rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.name,
        a.description,
        a.capabilities,
        a.domain_expertise,
        a.specialization,
        a.tier,
        -- Calculate text rank (combination of ts_rank and similarity)
        (
            ts_rank_cd(a.search_vector, query) * 0.7 +
            GREATEST(
                similarity(a.name, search_query),
                similarity(a.description, search_query)
            ) * 0.3
        )::real as text_rank
    FROM agents a,
         to_tsquery('medical_english', plainto_tsquery('medical_english', search_query)::text) query
    WHERE
        a.tenant_id = tenant_filter
        AND a.is_active = true
        AND (
            a.search_vector @@ query
            OR a.name % search_query
            OR a.description % search_query
        )
    ORDER BY text_rank DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================== Performance Indexes ====================

-- Index for filtering active agents
CREATE INDEX IF NOT EXISTS agents_active_idx
ON agents(tenant_id, is_active)
WHERE is_active = true;

-- Index for tier-based queries
CREATE INDEX IF NOT EXISTS agents_tier_idx
ON agents(tier);

-- ==================== Statistics ====================

-- Analyze table for query planner optimization
ANALYZE agents;

-- ==================== Comments ====================

COMMENT ON COLUMN agents.search_vector IS 'Full-text search vector (auto-updated via trigger)';
COMMENT ON FUNCTION search_agents_fulltext IS 'GraphRAG PostgreSQL full-text search (30% weight) with trigram fuzzy matching';
COMMENT ON INDEX agents_search_vector_idx IS 'GIN index for fast full-text search';
COMMENT ON INDEX agents_name_trgm_idx IS 'Trigram index for fuzzy name matching';
COMMENT ON INDEX agents_description_trgm_idx IS 'Trigram index for fuzzy description matching';

-- ==================== Verification ====================

-- Test query (uncomment to verify)
-- SELECT * FROM search_agents_fulltext('regulatory affairs', '00000000-0000-0000-0000-000000000000'::uuid, 5);

-- Performance check
-- EXPLAIN ANALYZE SELECT * FROM search_agents_fulltext('clinical trial design', '00000000-0000-0000-0000-000000000000'::uuid, 10);
