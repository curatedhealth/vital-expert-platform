-- ==========================================
-- FILE: phase4_rag_profiles.sql
-- PURPOSE: Externalize RAG behavior into first-class profiles and agent-specific policies
-- PHASE: 4 of 9 - RAG Profiles & Policies
-- DEPENDENCIES: agents table, knowledge_sources table
-- GOLDEN RULES: RAG configuration as data, not code
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 4: RAG PROFILES & POLICIES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- ==========================================
-- SECTION 1: CREATE RAG PROFILES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS rag_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- RAG Strategy
    strategy_type TEXT NOT NULL CHECK (strategy_type IN (
        'semantic', 'hybrid', 'graphrag', 'agent_optimized', 'entity_aware', 'custom'
    )),
    
    -- Retrieval Parameters
    top_k INTEGER DEFAULT 5,
    similarity_threshold NUMERIC(3,2) DEFAULT 0.7 CHECK (similarity_threshold >= 0 AND similarity_threshold <= 1),
    rerank_enabled BOOLEAN DEFAULT false,
    rerank_model TEXT,
    
    -- Chunking Strategy
    chunk_size INTEGER DEFAULT 1000,
    chunk_overlap INTEGER DEFAULT 200,
    chunking_method TEXT CHECK (chunking_method IN ('fixed', 'semantic', 'recursive', 'markdown')),
    
    -- Embedding Config
    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
    embedding_dimension INTEGER DEFAULT 1536,
    
    -- Graph-RAG Specific
    enable_graph_traversal BOOLEAN DEFAULT false,
    max_graph_hops INTEGER DEFAULT 2,
    entity_extraction_enabled BOOLEAN DEFAULT false,
    
    -- Query Enhancement
    query_expansion_enabled BOOLEAN DEFAULT false,
    hypothetical_document_enabled BOOLEAN DEFAULT false,
    multi_query_enabled BOOLEAN DEFAULT false,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    version TEXT DEFAULT '1.0.0',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE rag_profiles IS 'RAG strategy templates with retrieval, chunking, and embedding configurations';

-- ==========================================
-- SECTION 2: CREATE AGENT RAG POLICIES
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_rag_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    rag_profile_id UUID NOT NULL REFERENCES rag_profiles(id) ON DELETE CASCADE,
    
    -- Policy specifics
    is_default_policy BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Context-specific overrides
    context_filter TEXT,
    priority_order INTEGER DEFAULT 50,
    
    -- Agent-specific tuning
    agent_specific_top_k INTEGER,
    agent_specific_threshold NUMERIC(3,2) CHECK (agent_specific_threshold >= 0 AND agent_specific_threshold <= 1),
    
    -- Knowledge source filters (temporary arrays, normalize if needed)
    restrict_to_domains TEXT[],
    restrict_to_sources TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agent_id, rag_profile_id)
);

COMMENT ON TABLE agent_rag_policies IS 'Agent-specific RAG configurations with overrides and filters';

-- ==========================================
-- SECTION 3: CREATE RAG PROFILE KNOWLEDGE SOURCES (OPTIONAL)
-- ==========================================

CREATE TABLE IF NOT EXISTS rag_profile_knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rag_profile_id UUID NOT NULL REFERENCES rag_profiles(id) ON DELETE CASCADE,
    knowledge_source_id UUID, -- Generic UUID, may not have FK if table doesn't exist
    
    -- Source priority
    priority INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(rag_profile_id, knowledge_source_id)
);

COMMENT ON TABLE rag_profile_knowledge_sources IS 'Maps RAG profiles to preferred knowledge sources';

-- ==========================================
-- SECTION 4: CREATE INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_rag_profiles_strategy ON rag_profiles(strategy_type);
CREATE INDEX IF NOT EXISTS idx_rag_profiles_active ON rag_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_rag_profiles_slug ON rag_profiles(slug);

CREATE INDEX IF NOT EXISTS idx_agent_rag_policies_agent ON agent_rag_policies(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_rag_policies_profile ON agent_rag_policies(rag_profile_id);
CREATE INDEX IF NOT EXISTS idx_agent_rag_policies_active ON agent_rag_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_rag_policies_default ON agent_rag_policies(is_default_policy);

CREATE INDEX IF NOT EXISTS idx_rag_profile_sources_profile ON rag_profile_knowledge_sources(rag_profile_id);
CREATE INDEX IF NOT EXISTS idx_rag_profile_sources_source ON rag_profile_knowledge_sources(knowledge_source_id);

-- ==========================================
-- SECTION 5: SEED COMMON RAG PROFILES
-- ==========================================

INSERT INTO rag_profiles (name, slug, description, strategy_type, top_k, similarity_threshold, embedding_model)
VALUES 
    ('Semantic Standard', 'semantic_standard', 'Standard semantic search with cosine similarity', 'semantic', 5, 0.7, 'text-embedding-ada-002'),
    ('Hybrid Enhanced', 'hybrid_enhanced', 'Hybrid search combining semantic and keyword with reranking', 'hybrid', 10, 0.65, 'text-embedding-ada-002'),
    ('GraphRAG Entity', 'graphrag_entity', 'Graph-RAG with entity extraction and traversal', 'graphrag', 8, 0.7, 'text-embedding-ada-002'),
    ('Agent Optimized', 'agent_optimized', 'Multi-query with hypothetical document generation', 'agent_optimized', 7, 0.75, 'text-embedding-ada-002')
ON CONFLICT (slug) DO NOTHING;

-- Update seeded profiles with advanced configs
UPDATE rag_profiles SET 
    rerank_enabled = true,
    rerank_model = 'cohere-rerank-v3'
WHERE slug = 'hybrid_enhanced';

UPDATE rag_profiles SET 
    enable_graph_traversal = true,
    max_graph_hops = 2,
    entity_extraction_enabled = true
WHERE slug = 'graphrag_entity';

UPDATE rag_profiles SET 
    query_expansion_enabled = true,
    hypothetical_document_enabled = true,
    multi_query_enabled = true
WHERE slug = 'agent_optimized';

-- ==========================================
-- VERIFICATION
-- ==========================================

DO $$
DECLARE
    profile_count INTEGER;
    policy_count INTEGER;
    source_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM rag_profiles WHERE is_active = true;
    SELECT COUNT(*) INTO policy_count FROM agent_rag_policies;
    SELECT COUNT(*) INTO source_count FROM rag_profile_knowledge_sources;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== PHASE 4 COMPLETE ===';
    RAISE NOTICE 'RAG profiles: %', profile_count;
    RAISE NOTICE 'Agent policies: %', policy_count;
    RAISE NOTICE 'Profile-source mappings: %', source_count;
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 4 COMPLETE: RAG PROFILES & POLICIES';
    RAISE NOTICE '=================================================================';
END $$;

SELECT 
    'RAG Profiles' as entity,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM rag_profiles
UNION ALL
SELECT 'Agent RAG Policies', COUNT(*), COUNT(*) FILTER (WHERE is_active = true)
FROM agent_rag_policies
UNION ALL
SELECT 'Profile Knowledge Sources', COUNT(*), COUNT(*) FILTER (WHERE is_active = true)
FROM rag_profile_knowledge_sources;

