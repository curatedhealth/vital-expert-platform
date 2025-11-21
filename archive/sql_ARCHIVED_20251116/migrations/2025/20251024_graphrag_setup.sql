-- ============================================================================
-- GraphRAG Implementation - Phase 3 Week 1
-- PostgreSQL + pgvector for Hybrid Graph + Vector Search
-- ============================================================================
-- Description: Sets up graph-based agent discovery with vector embeddings
-- Features:
--   - Agent embeddings with HNSW indexing
--   - Graph relationships (domains, capabilities, escalations, collaborations)
--   - Hybrid search combining graph traversal and vector similarity
--   - Performance optimized for <300ms P90 latency
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For fuzzy text matching

-- ============================================================================
-- PART 1: Agent Embeddings Table
-- ============================================================================

-- Agent embeddings for vector similarity search
CREATE TABLE IF NOT EXISTS agent_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

    -- Embedding vector (1536 dimensions for OpenAI text-embedding-3-large)
    embedding vector(1536) NOT NULL,

    -- Embedding metadata
    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-3-large',
    embedding_version TEXT NOT NULL DEFAULT '1.0',

    -- What this embedding represents
    embedding_type TEXT NOT NULL DEFAULT 'agent_profile',
    -- Types: 'agent_profile', 'agent_capabilities', 'agent_specialties', 'agent_description'

    -- Source text that was embedded
    source_text TEXT NOT NULL,

    -- Quality metrics
    embedding_quality_score DECIMAL(3,2),  -- 0.0 to 1.0

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure one embedding per type per agent
    UNIQUE(agent_id, embedding_type)
);

-- Create HNSW index for fast vector similarity search
-- HNSW (Hierarchical Navigable Small World) is fastest for high-dimensional vectors
-- m=16: number of connections per layer (higher = more accurate but slower)
-- ef_construction=64: size of dynamic candidate list (higher = better quality index)
CREATE INDEX IF NOT EXISTS agent_embeddings_hnsw_idx
ON agent_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Index for filtering by agent_id
CREATE INDEX IF NOT EXISTS agent_embeddings_agent_id_idx
ON agent_embeddings(agent_id);

-- Index for filtering by embedding_type
CREATE INDEX IF NOT EXISTS agent_embeddings_type_idx
ON agent_embeddings(embedding_type);

-- Index for combined filtering (agent + type)
CREATE INDEX IF NOT EXISTS agent_embeddings_agent_type_idx
ON agent_embeddings(agent_id, embedding_type);

COMMENT ON TABLE agent_embeddings IS 'Agent embeddings for vector similarity search with HNSW indexing';
COMMENT ON COLUMN agent_embeddings.embedding IS 'OpenAI text-embedding-3-large (1536 dimensions)';
COMMENT ON COLUMN agent_embeddings.embedding_type IS 'Type of embedding: agent_profile, agent_capabilities, agent_specialties, or agent_description';
COMMENT ON INDEX agent_embeddings_hnsw_idx IS 'HNSW index for fast approximate nearest neighbor search (m=16, ef_construction=64)';


-- ============================================================================
-- PART 2: Graph Relationship Tables
-- ============================================================================

-- Domains (knowledge areas)
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,

    -- Domain hierarchy (e.g., 'medical.cardiology.interventional')
    parent_domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    domain_path TEXT,  -- Materialized path for fast hierarchy queries

    -- Domain metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS domains_name_idx ON domains(name);
CREATE INDEX IF NOT EXISTS domains_parent_idx ON domains(parent_domain_id);
CREATE INDEX IF NOT EXISTS domains_path_idx ON domains USING GIN(domain_path gin_trgm_ops);

COMMENT ON TABLE domains IS 'Knowledge domains for agent classification';
COMMENT ON COLUMN domains.domain_path IS 'Materialized path (e.g., medical.cardiology.interventional) for fast hierarchy queries';


-- Capabilities (what agents can do)
CREATE TABLE IF NOT EXISTS capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,

    -- Capability category
    category TEXT,  -- 'analysis', 'generation', 'validation', 'research', etc.

    -- Required for compliance (HIPAA, FDA, etc.)
    compliance_required BOOLEAN DEFAULT FALSE,
    compliance_level TEXT,  -- 'tier1_only', 'tier1_tier2', 'all_tiers'

    -- Capability metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS capabilities_name_idx ON capabilities(name);
CREATE INDEX IF NOT EXISTS capabilities_category_idx ON capabilities(category);

COMMENT ON TABLE capabilities IS 'Agent capabilities for skill-based matching';


-- Agent-Domain relationships (many-to-many)
CREATE TABLE IF NOT EXISTS agent_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,

    -- Proficiency level (0.0 to 1.0)
    proficiency_score DECIMAL(3,2) NOT NULL DEFAULT 0.50,

    -- How this relationship was established
    relationship_source TEXT NOT NULL DEFAULT 'manual',
    -- Sources: 'manual', 'inferred_from_specialties', 'learned_from_conversations', 'validated_by_expert'

    -- Confidence in this relationship (0.0 to 1.0)
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.80,

    -- Relationship metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(agent_id, domain_id)
);

CREATE INDEX IF NOT EXISTS agent_domains_agent_idx ON agent_domains(agent_id);
CREATE INDEX IF NOT EXISTS agent_domains_domain_idx ON agent_domains(domain_id);
CREATE INDEX IF NOT EXISTS agent_domains_proficiency_idx ON agent_domains(proficiency_score DESC);

COMMENT ON TABLE agent_domains IS 'Agent-Domain relationships with proficiency scores';


-- Agent-Capability relationships (many-to-many)
CREATE TABLE IF NOT EXISTS agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,

    -- Proficiency level (0.0 to 1.0)
    proficiency_score DECIMAL(3,2) NOT NULL DEFAULT 0.50,

    -- How this relationship was established
    relationship_source TEXT NOT NULL DEFAULT 'manual',

    -- Confidence in this relationship
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.80,

    -- Capability metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(agent_id, capability_id)
);

CREATE INDEX IF NOT EXISTS agent_capabilities_agent_idx ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS agent_capabilities_capability_idx ON agent_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS agent_capabilities_proficiency_idx ON agent_capabilities(proficiency_score DESC);

COMMENT ON TABLE agent_capabilities IS 'Agent-Capability relationships with proficiency scores';


-- Agent escalation relationships (who to escalate to)
CREATE TABLE IF NOT EXISTS agent_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    to_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

    -- Escalation reason/trigger
    escalation_reason TEXT NOT NULL,
    -- Examples: 'complexity_threshold_exceeded', 'safety_critical_decision', 'tier_upgrade_needed'

    -- Priority (higher = preferred escalation path)
    priority INTEGER NOT NULL DEFAULT 5,

    -- Conditions for escalation (JSONB for flexibility)
    escalation_conditions JSONB DEFAULT '{}',
    -- Example: {"confidence_below": 0.70, "domain": "regulatory", "risk_level": "high"}

    -- How many times this escalation has been used
    usage_count INTEGER NOT NULL DEFAULT 0,

    -- Success rate of escalations (0.0 to 1.0)
    success_rate DECIMAL(3,2) DEFAULT 0.80,

    -- Relationship metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,

    -- Prevent self-escalation
    CONSTRAINT no_self_escalation CHECK (from_agent_id != to_agent_id),

    UNIQUE(from_agent_id, to_agent_id, escalation_reason)
);

CREATE INDEX IF NOT EXISTS agent_escalations_from_idx ON agent_escalations(from_agent_id);
CREATE INDEX IF NOT EXISTS agent_escalations_to_idx ON agent_escalations(to_agent_id);
CREATE INDEX IF NOT EXISTS agent_escalations_priority_idx ON agent_escalations(priority DESC);
CREATE INDEX IF NOT EXISTS agent_escalations_conditions_idx ON agent_escalations USING GIN(escalation_conditions);

COMMENT ON TABLE agent_escalations IS 'Agent escalation paths with conditions and success tracking';


-- Agent collaboration relationships (who works well together)
CREATE TABLE IF NOT EXISTS agent_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent1_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    agent2_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

    -- Collaboration type
    collaboration_type TEXT NOT NULL,
    -- Types: 'complementary_expertise', 'cross_validation', 'multi_domain', 'research_partnership'

    -- Collaboration strength (0.0 to 1.0)
    strength DECIMAL(3,2) NOT NULL DEFAULT 0.50,

    -- How many times they've collaborated
    collaboration_count INTEGER NOT NULL DEFAULT 0,

    -- Success rate of collaborations (0.0 to 1.0)
    success_rate DECIMAL(3,2) DEFAULT 0.80,

    -- Domains where they collaborate well
    shared_domains UUID[] DEFAULT '{}',

    -- Relationship metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_collaboration_at TIMESTAMPTZ,

    -- Prevent self-collaboration
    CONSTRAINT no_self_collaboration CHECK (agent1_id != agent2_id),

    -- Ensure bidirectional uniqueness (A->B same as B->A)
    CONSTRAINT unique_collaboration CHECK (agent1_id < agent2_id)
);

CREATE INDEX IF NOT EXISTS agent_collaborations_agent1_idx ON agent_collaborations(agent1_id);
CREATE INDEX IF NOT EXISTS agent_collaborations_agent2_idx ON agent_collaborations(agent2_id);
CREATE INDEX IF NOT EXISTS agent_collaborations_strength_idx ON agent_collaborations(strength DESC);
CREATE INDEX IF NOT EXISTS agent_collaborations_type_idx ON agent_collaborations(collaboration_type);

COMMENT ON TABLE agent_collaborations IS 'Agent collaboration relationships with success tracking';


-- ============================================================================
-- PART 3: Hybrid Search Functions
-- ============================================================================

-- Function: Vector similarity search with filters
CREATE OR REPLACE FUNCTION search_agents_by_embedding(
    query_embedding vector(1536),
    embedding_type_filter TEXT DEFAULT 'agent_profile',
    similarity_threshold DECIMAL DEFAULT 0.70,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    agent_id UUID,
    agent_name TEXT,
    similarity_score DECIMAL,
    embedding_type TEXT,
    source_text TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ae.agent_id,
        a.name AS agent_name,
        (1 - (ae.embedding <=> query_embedding))::DECIMAL(5,4) AS similarity_score,
        ae.embedding_type,
        ae.source_text
    FROM agent_embeddings ae
    JOIN agents a ON ae.agent_id = a.id
    WHERE
        ae.embedding_type = embedding_type_filter
        AND (1 - (ae.embedding <=> query_embedding)) >= similarity_threshold
        AND a.status = 'active'
    ORDER BY ae.embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_agents_by_embedding IS 'Vector similarity search using HNSW index with cosine distance';


-- Function: Find agents by domain with proficiency filtering
CREATE OR REPLACE FUNCTION find_agents_by_domain(
    domain_name_pattern TEXT,
    min_proficiency DECIMAL DEFAULT 0.50,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    agent_id UUID,
    agent_name TEXT,
    agent_tier INTEGER,
    domain_name TEXT,
    proficiency_score DECIMAL,
    confidence DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id AS agent_id,
        a.name AS agent_name,
        a.tier AS agent_tier,
        d.name AS domain_name,
        ad.proficiency_score,
        ad.confidence
    FROM agents a
    JOIN agent_domains ad ON a.id = ad.agent_id
    JOIN domains d ON ad.domain_id = d.id
    WHERE
        d.name ILIKE domain_name_pattern
        AND ad.proficiency_score >= min_proficiency
        AND a.status = 'active'
    ORDER BY ad.proficiency_score DESC, a.tier ASC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_agents_by_domain IS 'Find agents by domain with proficiency filtering';


-- Function: Find escalation path for an agent
CREATE OR REPLACE FUNCTION find_escalation_path(
    source_agent_id UUID,
    escalation_reason_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    from_agent_id UUID,
    from_agent_name TEXT,
    to_agent_id UUID,
    to_agent_name TEXT,
    to_agent_tier INTEGER,
    escalation_reason TEXT,
    priority INTEGER,
    success_rate DECIMAL,
    usage_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ae.from_agent_id,
        a1.name AS from_agent_name,
        ae.to_agent_id,
        a2.name AS to_agent_name,
        a2.tier AS to_agent_tier,
        ae.escalation_reason,
        ae.priority,
        ae.success_rate,
        ae.usage_count
    FROM agent_escalations ae
    JOIN agents a1 ON ae.from_agent_id = a1.id
    JOIN agents a2 ON ae.to_agent_id = a2.id
    WHERE
        ae.from_agent_id = source_agent_id
        AND (escalation_reason_filter IS NULL OR ae.escalation_reason = escalation_reason_filter)
        AND a2.status = 'active'
    ORDER BY ae.priority DESC, ae.success_rate DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_escalation_path IS 'Find escalation paths for an agent with success tracking';


-- Function: Find collaboration partners for an agent
CREATE OR REPLACE FUNCTION find_collaboration_partners(
    source_agent_id UUID,
    collaboration_type_filter TEXT DEFAULT NULL,
    min_strength DECIMAL DEFAULT 0.50
)
RETURNS TABLE (
    partner_agent_id UUID,
    partner_agent_name TEXT,
    partner_agent_tier INTEGER,
    collaboration_type TEXT,
    strength DECIMAL,
    success_rate DECIMAL,
    collaboration_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN ac.agent1_id = source_agent_id THEN ac.agent2_id
            ELSE ac.agent1_id
        END AS partner_agent_id,
        a.name AS partner_agent_name,
        a.tier AS partner_agent_tier,
        ac.collaboration_type,
        ac.strength,
        ac.success_rate,
        ac.collaboration_count
    FROM agent_collaborations ac
    JOIN agents a ON (
        CASE
            WHEN ac.agent1_id = source_agent_id THEN ac.agent2_id
            ELSE ac.agent1_id
        END = a.id
    )
    WHERE
        (ac.agent1_id = source_agent_id OR ac.agent2_id = source_agent_id)
        AND (collaboration_type_filter IS NULL OR ac.collaboration_type = collaboration_type_filter)
        AND ac.strength >= min_strength
        AND a.status = 'active'
    ORDER BY ac.strength DESC, ac.success_rate DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_collaboration_partners IS 'Find collaboration partners for an agent';


-- Function: Hybrid search combining vector similarity and graph relationships
CREATE OR REPLACE FUNCTION hybrid_agent_search(
    query_embedding vector(1536),
    query_domains TEXT[] DEFAULT '{}',
    similarity_threshold DECIMAL DEFAULT 0.70,
    min_proficiency DECIMAL DEFAULT 0.50,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    agent_id UUID,
    agent_name TEXT,
    agent_tier INTEGER,
    vector_score DECIMAL,
    domain_match_count INTEGER,
    avg_domain_proficiency DECIMAL,
    hybrid_score DECIMAL,
    ranking_position INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH vector_results AS (
        -- Vector similarity search
        SELECT
            ae.agent_id,
            (1 - (ae.embedding <=> query_embedding))::DECIMAL(5,4) AS vector_score
        FROM agent_embeddings ae
        WHERE
            ae.embedding_type = 'agent_profile'
            AND (1 - (ae.embedding <=> query_embedding)) >= similarity_threshold
    ),
    domain_results AS (
        -- Domain matching
        SELECT
            ad.agent_id,
            COUNT(DISTINCT d.id) AS domain_match_count,
            AVG(ad.proficiency_score)::DECIMAL(3,2) AS avg_domain_proficiency
        FROM agent_domains ad
        JOIN domains d ON ad.domain_id = d.id
        WHERE
            (ARRAY_LENGTH(query_domains, 1) IS NULL OR d.name = ANY(query_domains))
            AND ad.proficiency_score >= min_proficiency
        GROUP BY ad.agent_id
    )
    SELECT
        a.id AS agent_id,
        a.name AS agent_name,
        a.tier AS agent_tier,
        COALESCE(vr.vector_score, 0.0)::DECIMAL(5,4) AS vector_score,
        COALESCE(dr.domain_match_count, 0) AS domain_match_count,
        COALESCE(dr.avg_domain_proficiency, 0.0)::DECIMAL(3,2) AS avg_domain_proficiency,
        -- Hybrid score: 60% vector + 40% domain proficiency
        (
            COALESCE(vr.vector_score, 0.0) * 0.60 +
            COALESCE(dr.avg_domain_proficiency, 0.0) * 0.40
        )::DECIMAL(5,4) AS hybrid_score,
        ROW_NUMBER() OVER (ORDER BY
            COALESCE(vr.vector_score, 0.0) * 0.60 +
            COALESCE(dr.avg_domain_proficiency, 0.0) * 0.40 DESC
        )::INTEGER AS ranking_position
    FROM agents a
    LEFT JOIN vector_results vr ON a.id = vr.agent_id
    LEFT JOIN domain_results dr ON a.id = dr.agent_id
    WHERE
        a.status = 'active'
        AND (vr.vector_score IS NOT NULL OR dr.domain_match_count > 0)
    ORDER BY hybrid_score DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION hybrid_agent_search IS 'Hybrid search combining vector similarity (60%) and domain proficiency (40%)';


-- ============================================================================
-- PART 4: Updated Timestamp Triggers
-- ============================================================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all new tables
CREATE TRIGGER update_agent_embeddings_updated_at BEFORE UPDATE ON agent_embeddings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capabilities_updated_at BEFORE UPDATE ON capabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_domains_updated_at BEFORE UPDATE ON agent_domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_capabilities_updated_at BEFORE UPDATE ON agent_capabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_escalations_updated_at BEFORE UPDATE ON agent_escalations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_collaborations_updated_at BEFORE UPDATE ON agent_collaborations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- PART 5: Row-Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE agent_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_collaborations ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (for backend operations)
CREATE POLICY "Service role has full access to agent_embeddings"
    ON agent_embeddings FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to domains"
    ON domains FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to capabilities"
    ON capabilities FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to agent_domains"
    ON agent_domains FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to agent_capabilities"
    ON agent_capabilities FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to agent_escalations"
    ON agent_escalations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to agent_collaborations"
    ON agent_collaborations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users read access
CREATE POLICY "Authenticated users can read agent_embeddings"
    ON agent_embeddings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read domains"
    ON domains FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read capabilities"
    ON capabilities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read agent_domains"
    ON agent_domains FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read agent_capabilities"
    ON agent_capabilities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read agent_escalations"
    ON agent_escalations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read agent_collaborations"
    ON agent_collaborations FOR SELECT
    TO authenticated
    USING (true);


-- ============================================================================
-- PART 6: Performance Monitoring Views
-- ============================================================================

-- View: Agent search performance metrics
CREATE OR REPLACE VIEW v_agent_search_metrics AS
SELECT
    a.id AS agent_id,
    a.name AS agent_name,
    a.tier,
    COUNT(DISTINCT ae.id) AS embedding_count,
    COUNT(DISTINCT ad.domain_id) AS domain_count,
    AVG(ad.proficiency_score)::DECIMAL(3,2) AS avg_domain_proficiency,
    COUNT(DISTINCT ac.capability_id) AS capability_count,
    COUNT(DISTINCT esc.id) AS escalation_path_count,
    COUNT(DISTINCT col.id) AS collaboration_count
FROM agents a
LEFT JOIN agent_embeddings ae ON a.id = ae.agent_id
LEFT JOIN agent_domains ad ON a.id = ad.agent_id
LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
LEFT JOIN agent_escalations esc ON a.id = esc.from_agent_id
LEFT JOIN agent_collaborations col ON (a.id = col.agent1_id OR a.id = col.agent2_id)
WHERE a.status = 'active'
GROUP BY a.id, a.name, a.tier
ORDER BY a.tier ASC, a.name ASC;

COMMENT ON VIEW v_agent_search_metrics IS 'Agent search readiness metrics';


-- ============================================================================
-- PART 7: Initial Seed Data
-- ============================================================================

-- Seed common domains
INSERT INTO domains (name, display_name, description, domain_path) VALUES
    ('medical', 'Medical', 'General medical knowledge and practice', 'medical'),
    ('medical.cardiology', 'Cardiology', 'Heart and cardiovascular system', 'medical.cardiology'),
    ('medical.oncology', 'Oncology', 'Cancer diagnosis and treatment', 'medical.oncology'),
    ('medical.neurology', 'Neurology', 'Brain and nervous system', 'medical.neurology'),

    ('regulatory', 'Regulatory Affairs', 'Healthcare regulatory compliance', 'regulatory'),
    ('regulatory.fda', 'FDA Compliance', 'US FDA regulations and submissions', 'regulatory.fda'),
    ('regulatory.ema', 'EMA Compliance', 'European regulatory compliance', 'regulatory.ema'),

    ('clinical', 'Clinical Research', 'Clinical trials and research', 'clinical'),
    ('clinical.trial_design', 'Trial Design', 'Clinical trial methodology', 'clinical.trial_design'),
    ('clinical.biostatistics', 'Biostatistics', 'Statistical analysis for clinical research', 'clinical.biostatistics'),

    ('pharma', 'Pharmaceutical', 'Drug development and manufacturing', 'pharma'),
    ('pharma.drug_development', 'Drug Development', 'Pharmaceutical R&D', 'pharma.drug_development'),
    ('pharma.manufacturing', 'Manufacturing', 'Pharmaceutical manufacturing', 'pharma.manufacturing')
ON CONFLICT (name) DO NOTHING;

-- Seed common capabilities
INSERT INTO capabilities (name, display_name, description, category, compliance_required) VALUES
    ('medical_diagnosis_support', 'Medical Diagnosis Support', 'Assist with diagnostic reasoning', 'analysis', true),
    ('regulatory_submission', 'Regulatory Submission', 'Prepare and review regulatory submissions', 'generation', true),
    ('clinical_trial_design', 'Clinical Trial Design', 'Design and plan clinical trials', 'planning', true),
    ('statistical_analysis', 'Statistical Analysis', 'Perform biostatistical analyses', 'analysis', false),
    ('literature_review', 'Literature Review', 'Conduct systematic literature reviews', 'research', false),
    ('risk_assessment', 'Risk Assessment', 'Identify and assess risks', 'analysis', true),
    ('quality_assurance', 'Quality Assurance', 'Quality system compliance', 'validation', true),
    ('evidence_synthesis', 'Evidence Synthesis', 'Synthesize clinical evidence', 'analysis', false),
    ('guideline_interpretation', 'Guideline Interpretation', 'Interpret clinical and regulatory guidelines', 'analysis', false),
    ('data_validation', 'Data Validation', 'Validate and verify data quality', 'validation', true)
ON CONFLICT (name) DO NOTHING;


-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'GraphRAG setup complete!';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - agent_embeddings table with HNSW index';
    RAISE NOTICE '  - domains, capabilities tables';
    RAISE NOTICE '  - agent_domains, agent_capabilities relationships';
    RAISE NOTICE '  - agent_escalations, agent_collaborations graphs';
    RAISE NOTICE '  - 5 hybrid search functions';
    RAISE NOTICE '  - RLS policies for security';
    RAISE NOTICE '  - Performance monitoring views';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Generate agent embeddings';
    RAISE NOTICE '  2. Map agents to domains and capabilities';
    RAISE NOTICE '  3. Build escalation and collaboration graphs';
    RAISE NOTICE '  4. Test hybrid search functions';
END $$;
