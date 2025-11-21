-- RAG-Agent Integration System
-- This migration creates the complete RAG system for global and agent-specific knowledge bases

-- 1. Create RAG knowledge bases table
CREATE TABLE IF NOT EXISTS rag_knowledge_bases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    purpose_description TEXT NOT NULL, -- What this RAG should be used for

    -- RAG Configuration
    rag_type VARCHAR(50) DEFAULT 'global' CHECK (rag_type IN ('global', 'agent_specific')),
    vector_store_config JSONB DEFAULT '{}', -- Pinecone, Weaviate, etc. configuration
    embedding_model VARCHAR(100) DEFAULT 'text-embedding-ada-002',
    chunk_size INTEGER DEFAULT 1000,
    chunk_overlap INTEGER DEFAULT 200,
    similarity_threshold DECIMAL(3,2) DEFAULT 0.7,

    -- Content Metadata
    document_count INTEGER DEFAULT 0,
    total_chunks INTEGER DEFAULT 0,
    knowledge_domains TEXT[] DEFAULT '{}', -- e.g., ['clinical_trials', 'regulatory']
    content_types TEXT[] DEFAULT '{}', -- e.g., ['pdf', 'clinical_protocol', 'guideline']
    data_sources TEXT[] DEFAULT '{}', -- e.g., ['FDA', 'EMA', 'internal_docs']

    -- Access Control
    is_public BOOLEAN DEFAULT false,
    access_level VARCHAR(20) DEFAULT 'private' CHECK (access_level IN ('public', 'organization', 'private')),
    created_by UUID,

    -- Quality & Performance
    last_indexed_at TIMESTAMPTZ,
    index_status VARCHAR(20) DEFAULT 'ready' CHECK (index_status IN ('indexing', 'ready', 'error', 'updating')),
    quality_score DECIMAL(3,2), -- Overall quality assessment
    performance_metrics JSONB DEFAULT '{}',

    -- Compliance & Security
    contains_phi BOOLEAN DEFAULT false,
    hipaa_compliant BOOLEAN DEFAULT true,
    data_retention_days INTEGER DEFAULT 2555, -- ~7 years default
    encryption_enabled BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version VARCHAR(20) DEFAULT '1.0.0',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'))
);

-- 2. Create agent-RAG relationships table
CREATE TABLE IF NOT EXISTS agent_rag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    rag_id UUID NOT NULL REFERENCES rag_knowledge_bases(id) ON DELETE CASCADE,

    -- Assignment Configuration
    is_primary BOOLEAN DEFAULT false, -- Primary RAG for this agent
    priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100), -- Higher = more priority
    usage_context TEXT, -- When this RAG should be used
    query_filters JSONB DEFAULT '{}', -- Filters to apply when querying this RAG

    -- Performance Tracking
    usage_count INTEGER DEFAULT 0,
    avg_relevance_score DECIMAL(3,2),
    last_used_at TIMESTAMPTZ,

    -- Configuration
    max_results INTEGER DEFAULT 5,
    custom_prompt_instructions TEXT, -- Custom instructions for using this RAG

    -- Metadata
    assigned_by UUID,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(agent_id, rag_id)
);

-- 3. Create RAG documents table for tracking individual documents
CREATE TABLE IF NOT EXISTS rag_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rag_id UUID NOT NULL REFERENCES rag_knowledge_bases(id) ON DELETE CASCADE,

    -- Document Identity
    document_name VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500),
    file_path TEXT,
    document_type VARCHAR(100), -- 'clinical_protocol', 'guideline', 'research_paper', etc.

    -- Content Metadata
    content_hash VARCHAR(64), -- SHA-256 hash for deduplication
    file_size_bytes BIGINT,
    page_count INTEGER,
    word_count INTEGER,

    -- Processing Status
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')),
    chunk_count INTEGER DEFAULT 0,
    embedding_count INTEGER DEFAULT 0,

    -- Content Classification
    content_categories TEXT[] DEFAULT '{}',
    extracted_entities JSONB DEFAULT '{}', -- NER results
    key_topics TEXT[] DEFAULT '{}',
    confidence_score DECIMAL(3,2),

    -- Quality Metrics
    readability_score DECIMAL(3,2),
    relevance_score DECIMAL(3,2),
    completeness_score DECIMAL(3,2),

    -- Compliance
    contains_phi BOOLEAN DEFAULT false,
    redaction_applied BOOLEAN DEFAULT false,
    compliance_tags TEXT[] DEFAULT '{}',

    -- Metadata
    uploaded_by UUID,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create RAG usage analytics table
CREATE TABLE IF NOT EXISTS rag_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rag_id UUID NOT NULL REFERENCES rag_knowledge_bases(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

    -- Query Information
    query_text TEXT NOT NULL,
    query_embedding_model VARCHAR(100),
    query_timestamp TIMESTAMPTZ DEFAULT NOW(),

    -- Results
    results_count INTEGER DEFAULT 0,
    top_relevance_score DECIMAL(3,2),
    avg_relevance_score DECIMAL(3,2),
    response_time_ms INTEGER,

    -- Context
    conversation_id UUID, -- Link to chat conversation
    user_id UUID,
    query_intent VARCHAR(100), -- 'research', 'compliance_check', 'protocol_review', etc.

    -- Performance
    cache_hit BOOLEAN DEFAULT false,
    tokens_used INTEGER,
    cost_estimate DECIMAL(10,4),

    -- Quality Feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    relevance_confirmed BOOLEAN,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_bases_type ON rag_knowledge_bases(rag_type);
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_bases_status ON rag_knowledge_bases(status);
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_bases_domains ON rag_knowledge_bases USING GIN(knowledge_domains);
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_bases_public ON rag_knowledge_bases(is_public, access_level);

CREATE INDEX IF NOT EXISTS idx_agent_rag_agent ON agent_rag_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_rag_rag ON agent_rag_assignments(rag_id);
CREATE INDEX IF NOT EXISTS idx_agent_rag_primary ON agent_rag_assignments(agent_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_agent_rag_priority ON agent_rag_assignments(agent_id, priority DESC);

CREATE INDEX IF NOT EXISTS idx_rag_documents_rag ON rag_documents(rag_id);
CREATE INDEX IF NOT EXISTS idx_rag_documents_status ON rag_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_rag_documents_type ON rag_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_rag_documents_hash ON rag_documents(content_hash);

CREATE INDEX IF NOT EXISTS idx_rag_analytics_rag ON rag_usage_analytics(rag_id);
CREATE INDEX IF NOT EXISTS idx_rag_analytics_agent ON rag_usage_analytics(agent_id);
CREATE INDEX IF NOT EXISTS idx_rag_analytics_timestamp ON rag_usage_analytics(query_timestamp);
CREATE INDEX IF NOT EXISTS idx_rag_analytics_conversation ON rag_usage_analytics(conversation_id);

-- 6. Enable RLS for all tables
ALTER TABLE rag_knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_rag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_usage_analytics ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies

-- RAG Knowledge Bases policies
CREATE POLICY "Public RAG knowledge bases are viewable by everyone"
    ON rag_knowledge_bases FOR SELECT
    USING (is_public = true AND status = 'active');

CREATE POLICY "Users can view organization RAG knowledge bases"
    ON rag_knowledge_bases FOR SELECT
    USING (access_level IN ('public', 'organization') AND status = 'active');

CREATE POLICY "Admin users can manage RAG knowledge bases"
    ON rag_knowledge_bases FOR ALL
    USING (
        auth.jwt() ->> 'email' IN (
            'admin@vitalpath.ai',
            'hicham@vitalpath.ai'
        )
    );

-- Agent RAG assignments policies
CREATE POLICY "Users can view agent RAG assignments"
    ON agent_rag_assignments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rag_knowledge_bases rkb
            WHERE rkb.id = agent_rag_assignments.rag_id
            AND (rkb.is_public = true OR rkb.access_level = 'organization')
        )
    );

CREATE POLICY "Admin users can manage agent RAG assignments"
    ON agent_rag_assignments FOR ALL
    USING (
        auth.jwt() ->> 'email' IN (
            'admin@vitalpath.ai',
            'hicham@vitalpath.ai'
        )
    );

-- RAG documents policies
CREATE POLICY "Users can view RAG documents for accessible RAGs"
    ON rag_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rag_knowledge_bases rkb
            WHERE rkb.id = rag_documents.rag_id
            AND (rkb.is_public = true OR rkb.access_level = 'organization')
            AND rkb.status = 'active'
        )
    );

-- RAG usage analytics policies
CREATE POLICY "Users can view RAG analytics for accessible RAGs"
    ON rag_usage_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rag_knowledge_bases rkb
            WHERE rkb.id = rag_usage_analytics.rag_id
            AND (rkb.is_public = true OR rkb.access_level = 'organization')
        )
    );

-- 8. Create database functions for RAG management

-- Function to get available RAG knowledge bases for an agent
CREATE OR REPLACE FUNCTION get_available_rag_for_agent(agent_name_param TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    display_name TEXT,
    description TEXT,
    purpose_description TEXT,
    rag_type TEXT,
    knowledge_domains TEXT[],
    document_count INTEGER,
    is_assigned BOOLEAN,
    assignment_priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rkb.id,
        rkb.name,
        rkb.display_name,
        rkb.description,
        rkb.purpose_description,
        rkb.rag_type,
        rkb.knowledge_domains,
        rkb.document_count,
        CASE WHEN ara.rag_id IS NOT NULL THEN true ELSE false END as is_assigned,
        COALESCE(ara.priority, 0) as assignment_priority
    FROM rag_knowledge_bases rkb
    LEFT JOIN agent_rag_assignments ara ON rkb.id = ara.rag_id
        AND ara.agent_id = (
            SELECT id FROM agents
            WHERE name = agent_name_param OR display_name = agent_name_param
            LIMIT 1
        )
    WHERE rkb.status = 'active'
    AND (rkb.is_public = true OR rkb.access_level = 'organization')
    ORDER BY
        is_assigned DESC,
        assignment_priority DESC,
        rkb.rag_type,
        rkb.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get assigned RAG databases for an agent
CREATE OR REPLACE FUNCTION get_agent_assigned_rag(agent_name_param TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    display_name TEXT,
    description TEXT,
    purpose_description TEXT,
    usage_context TEXT,
    priority INTEGER,
    is_primary BOOLEAN,
    document_count INTEGER,
    last_used_at TIMESTAMPTZ,
    custom_prompt_instructions TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rkb.id,
        rkb.name,
        rkb.display_name,
        rkb.description,
        rkb.purpose_description,
        ara.usage_context,
        ara.priority,
        ara.is_primary,
        rkb.document_count,
        ara.last_used_at,
        ara.custom_prompt_instructions
    FROM rag_knowledge_bases rkb
    INNER JOIN agent_rag_assignments ara ON rkb.id = ara.rag_id
    INNER JOIN agents a ON ara.agent_id = a.id
    WHERE (a.name = agent_name_param OR a.display_name = agent_name_param)
    AND rkb.status = 'active'
    ORDER BY ara.is_primary DESC, ara.priority DESC, rkb.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get global RAG databases
CREATE OR REPLACE FUNCTION get_global_rag_databases()
RETURNS TABLE (
    id UUID,
    name TEXT,
    display_name TEXT,
    description TEXT,
    purpose_description TEXT,
    knowledge_domains TEXT[],
    document_count INTEGER,
    total_chunks INTEGER,
    last_indexed_at TIMESTAMPTZ,
    quality_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rkb.id,
        rkb.name,
        rkb.display_name,
        rkb.description,
        rkb.purpose_description,
        rkb.knowledge_domains,
        rkb.document_count,
        rkb.total_chunks,
        rkb.last_indexed_at,
        rkb.quality_score
    FROM rag_knowledge_bases rkb
    WHERE rkb.rag_type = 'global'
    AND rkb.status = 'active'
    AND (rkb.is_public = true OR rkb.access_level = 'organization')
    ORDER BY rkb.quality_score DESC NULLS LAST, rkb.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create update triggers
CREATE TRIGGER update_rag_knowledge_bases_updated_at
    BEFORE UPDATE ON rag_knowledge_bases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rag_documents_updated_at
    BEFORE UPDATE ON rag_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Grant permissions
GRANT SELECT ON rag_knowledge_bases TO authenticated, anon;
GRANT SELECT ON agent_rag_assignments TO authenticated, anon;
GRANT SELECT ON rag_documents TO authenticated, anon;
GRANT SELECT ON rag_usage_analytics TO authenticated, anon;

GRANT EXECUTE ON FUNCTION get_available_rag_for_agent(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_agent_assigned_rag(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_global_rag_databases() TO authenticated, anon;

-- 11. Add table comments
COMMENT ON TABLE rag_knowledge_bases IS 'RAG knowledge bases for global and agent-specific use';
COMMENT ON TABLE agent_rag_assignments IS 'Links agents to their assigned RAG knowledge bases';
COMMENT ON TABLE rag_documents IS 'Individual documents within RAG knowledge bases';
COMMENT ON TABLE rag_usage_analytics IS 'Analytics and usage tracking for RAG queries';

-- 12. Show completion status
SELECT
    'RAG System Setup Complete' as status,
    '4 tables created' as tables,
    '3 functions created' as functions,
    'RLS policies applied' as security,
    'Ready for RAG-agent integration' as ready;