-- ============================================================================
-- CONSOLIDATED MIGRATIONS 002-007
-- ============================================================================
-- Run this in Supabase SQL Editor
-- All migrations combined in proper sequence
-- ============================================================================

-- ============================================================================
-- MIGRATION 002: Normalized Agent Schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- LOOKUP TABLES
-- ============================================================================

-- Capabilities lookup table
CREATE TABLE IF NOT EXISTS capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capability_name TEXT NOT NULL UNIQUE,
    capability_slug TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'regulatory', 'clinical', 'market_access',
        'technical_cmc', 'strategic', 'operational',
        'analytical', 'communication'
    )),
    complexity_level TEXT CHECK (complexity_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Skills lookup table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_name TEXT NOT NULL UNIQUE,
    skill_slug TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'creative', 'development', 'document', 'meta',
        'regulatory', 'clinical', 'market_access', 'cmc',
        'strategic', 'operational', 'analytical',
        'marketing', 'executive', 'product', 'engineering',
        'testing', 'scientific', 'compliance', 'education'
    )),
    is_active BOOLEAN DEFAULT true NOT NULL,
    source TEXT DEFAULT 'vital',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Domain Expertise lookup table
CREATE TABLE IF NOT EXISTS domain_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_name TEXT NOT NULL UNIQUE,
    domain_slug TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- CORE AGENT TABLE (FLATTENED - NO JSONB)
-- ============================================================================

-- Add new columns to existing agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS agent_level TEXT CHECK (agent_level IN ('MASTER', 'EXPERT', 'SPECIALIST', 'WORKER', 'TOOL'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0.0';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS complexity_score INTEGER CHECK (complexity_score BETWEEN 1 AND 10);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS avg_response_time_ms INTEGER;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) CHECK (success_rate BETWEEN 0 AND 100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS total_invocations INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS gold_standard_validated BOOLEAN DEFAULT false;

-- Add full-text search
ALTER TABLE agents ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS idx_agents_search ON agents USING gin(search_vector);

-- ============================================================================
-- JUNCTION TABLES (M:M RELATIONSHIPS WITH METADATA)
-- ============================================================================

-- Agent-Capabilities junction (M:M with proficiency)
CREATE TABLE IF NOT EXISTS agent_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    times_used INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    avg_confidence DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_agent_capability UNIQUE(agent_id, capability_id)
);

-- Agent-Skills junction (M:M with proficiency)
CREATE TABLE IF NOT EXISTS agent_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_agent_skill UNIQUE(agent_id, skill_id)
);

-- Capability-Skills junction (M:M - which skills enable which capabilities)
CREATE TABLE IF NOT EXISTS capability_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    importance TEXT CHECK (importance IN ('required', 'recommended', 'optional')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_capability_skill UNIQUE(capability_id, skill_id)
);

-- Agent-Domain Expertise junction (M:M with years of experience)
CREATE TABLE IF NOT EXISTS agent_domain_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domain_expertise(id) ON DELETE CASCADE,
    years_experience INTEGER,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_agent_domain UNIQUE(agent_id, domain_id)
);

-- ============================================================================
-- SUPPORTING TABLES
-- ============================================================================

-- Agent Embeddings (1:M - one agent can have multiple embeddings for different purposes)
CREATE TABLE IF NOT EXISTS agent_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    embedding_type TEXT NOT NULL CHECK (embedding_type IN ('description', 'capabilities', 'full_context')),
    embedding vector(3072),
    model TEXT DEFAULT 'text-embedding-3-large',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_agent_embedding_type UNIQUE(agent_id, embedding_type)
);

-- Agent Performance Metrics
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    invocations INTEGER DEFAULT 0,
    successes INTEGER DEFAULT 0,
    failures INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER,
    avg_confidence_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_agent_metric_date UNIQUE(agent_id, metric_date)
);

-- Agent Collaborations (which agents work well together)
CREATE TABLE IF NOT EXISTS agent_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    collaborator_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    collaboration_type TEXT CHECK (collaboration_type IN ('supervisor', 'peer', 'subordinate')),
    success_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_collaboration UNIQUE(agent_id, collaborator_agent_id),
    CONSTRAINT no_self_collaboration CHECK (agent_id != collaborator_agent_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_capability ON agent_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS idx_agent_skills_agent ON agent_skills(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_skills_skill ON agent_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_capability_skills_capability ON capability_skills(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_skills_skill ON capability_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_agent_domain_agent ON agent_domain_expertise(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_domain_domain ON agent_domain_expertise(domain_id);
CREATE INDEX IF NOT EXISTS idx_agent_embeddings_agent ON agent_embeddings(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent ON agent_performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_collaborations_agent ON agent_collaborations(agent_id);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Gold Standard Agents View
CREATE OR REPLACE VIEW gold_standard_agents AS
SELECT
    a.*,
    COUNT(DISTINCT ac.capability_id) as capabilities_count,
    COUNT(DISTINCT ask.skill_id) as skills_count,
    COUNT(DISTINCT ade.domain_id) as domains_count,
    EXISTS(SELECT 1 FROM agent_embeddings ae WHERE ae.agent_id = a.id) as has_embeddings
FROM agents a
LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
LEFT JOIN agent_skills ask ON a.id = ask.agent_id
LEFT JOIN agent_domain_expertise ade ON a.id = ade.agent_id
WHERE a.gold_standard_validated = true
GROUP BY a.id;

-- Agent Tier Distribution
CREATE OR REPLACE VIEW agent_tier_distribution AS
SELECT
    agent_level,
    COUNT(*) as agent_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM agents
WHERE agent_level IS NOT NULL
GROUP BY agent_level
ORDER BY
    CASE agent_level
        WHEN 'MASTER' THEN 1
        WHEN 'EXPERT' THEN 2
        WHEN 'SPECIALIST' THEN 3
        WHEN 'WORKER' THEN 4
        WHEN 'TOOL' THEN 5
    END;

-- Migration 002 Complete
-- ============================================================================

