-- ============================================================================
-- AgentOS 3.0: Agent Context Files Infrastructure
-- Migration: 20251126_agent_context_files.sql
-- Purpose: Enable hybrid context loading (load vs. file access architecture)
-- ============================================================================

-- ============================================================================
-- 1. ADD CONTEXT COLUMNS TO AGENTS TABLE
-- ============================================================================

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS context_files TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS required_reading TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS context_loading_strategy VARCHAR(20)
    DEFAULT 'on_demand'
    CHECK (context_loading_strategy IN ('preload', 'on_demand', 'hybrid'));

COMMENT ON COLUMN agents.context_files IS 'Array of file paths available to this agent for dynamic loading';
COMMENT ON COLUMN agents.required_reading IS 'Array of file paths that MUST be loaded before agent initialization';
COMMENT ON COLUMN agents.context_loading_strategy IS 'preload=all files loaded at init, on_demand=load per query, hybrid=required_reading preloaded + context_files on demand';

-- ============================================================================
-- 2. AGENT CONTEXT FILES REGISTRY
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_context_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,

    -- File reference
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN (
        'capability',     -- Agent capability definitions
        'skill',          -- Reusable skills
        'tool',           -- Tool documentation
        'example',        -- Worked examples
        'protocol',       -- Standard operating procedures
        'evidence',       -- Evidence/citation sources
        'domain_context', -- Domain-specific context
        'workflow'        -- Workflow definitions
    )),

    -- Loading behavior
    load_on_init BOOLEAN DEFAULT FALSE,      -- Preload into system prompt
    load_on_demand BOOLEAN DEFAULT TRUE,     -- Load when relevant
    cache_duration_minutes INTEGER DEFAULT 60,

    -- Metadata
    token_estimate INTEGER,                   -- Helps budget context
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10), -- 1-10, higher = load first
    description TEXT,

    -- Keywords for relevance matching
    relevance_keywords TEXT[],               -- What queries trigger this file

    -- Versioning
    version VARCHAR(20) DEFAULT '1.0',
    last_validated_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(agent_id, file_path)
);

CREATE INDEX idx_agent_context_files_agent ON agent_context_files(agent_id);
CREATE INDEX idx_agent_context_files_type ON agent_context_files(file_type);
CREATE INDEX idx_agent_context_files_load_init ON agent_context_files(load_on_init) WHERE load_on_init = TRUE;
CREATE INDEX idx_agent_context_files_keywords ON agent_context_files USING GIN(relevance_keywords);

COMMENT ON TABLE agent_context_files IS 'Registry of context files available to agents for dynamic loading';

-- ============================================================================
-- 3. SHARED PROTOCOL REGISTRY
-- ============================================================================

CREATE TABLE IF NOT EXISTS shared_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Protocol identification
    protocol_name VARCHAR(100) NOT NULL UNIQUE,
    protocol_type VARCHAR(50) NOT NULL CHECK (protocol_type IN (
        'evidence',       -- Evidence requirements
        'escalation',     -- Escalation paths
        'self_critique',  -- Quality assurance
        'verify',         -- Anti-hallucination (VERIFY)
        'safety',         -- Safety constraints
        'compliance',     -- Compliance requirements
        'tool_usage'      -- Tool/worker pool usage
    )),

    -- Content
    file_path VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    token_estimate INTEGER,

    -- Applicability
    applies_to_levels VARCHAR[] DEFAULT ARRAY['L1', 'L2', 'L3', 'L4', 'L5'],
    applies_to_domains TEXT[],               -- NULL = all domains
    is_mandatory BOOLEAN DEFAULT FALSE,      -- Must load for applicable agents

    -- Versioning
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_shared_protocols_type ON shared_protocols(protocol_type);
CREATE INDEX idx_shared_protocols_mandatory ON shared_protocols(is_mandatory) WHERE is_mandatory = TRUE;

COMMENT ON TABLE shared_protocols IS 'Registry of shared protocols that can be loaded by multiple agents';

-- ============================================================================
-- 4. AGENT-PROTOCOL JUNCTION (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    protocol_id UUID REFERENCES shared_protocols(id) ON DELETE CASCADE,

    -- Override behavior
    is_enabled BOOLEAN DEFAULT TRUE,
    custom_threshold DECIMAL(3,2),           -- Override default thresholds
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(agent_id, protocol_id)
);

CREATE INDEX idx_agent_protocols_agent ON agent_protocols(agent_id);
CREATE INDEX idx_agent_protocols_protocol ON agent_protocols(protocol_id);

-- ============================================================================
-- 5. SEED SHARED PROTOCOLS
-- ============================================================================

INSERT INTO shared_protocols (protocol_name, protocol_type, file_path, description, token_estimate, applies_to_levels, is_mandatory)
VALUES
    ('evidence-requirements', 'evidence',
     '.claude/docs/platform/agents/shared/protocols/evidence-requirements.md',
     'Standard evidence citation requirements including confidence levels and source formats',
     400, ARRAY['L1', 'L2', 'L3'], TRUE),

    ('escalation-protocol', 'escalation',
     '.claude/docs/platform/agents/shared/protocols/escalation-protocol.md',
     'Standard escalation decision tree for L3→L2→L1→HITL paths',
     500, ARRAY['L1', 'L2', 'L3'], TRUE),

    ('self-critique-protocol', 'self_critique',
     '.claude/docs/platform/agents/shared/protocols/self-critique-protocol.md',
     'Built-in quality assurance checklist before finalizing responses',
     350, ARRAY['L1', 'L2', 'L3'], TRUE),

    ('verify-protocol', 'verify',
     '.claude/docs/platform/agents/shared/protocols/verify-protocol.md',
     'VERIFY Protocol for preventing hallucinations in pharmaceutical content',
     600, ARRAY['L1', 'L2', 'L3'], TRUE),

    ('tool-registry', 'tool_usage',
     '.claude/docs/platform/agents/shared/tools/tool-registry.md',
     'Canonical registry of tools available via worker pool',
     400, ARRAY['L1', 'L2', 'L3'], FALSE)
ON CONFLICT (protocol_name) DO UPDATE SET
    file_path = EXCLUDED.file_path,
    description = EXCLUDED.description,
    token_estimate = EXCLUDED.token_estimate,
    updated_at = NOW();

-- ============================================================================
-- 6. VIEW: Agent with Context Configuration
-- ============================================================================

CREATE OR REPLACE VIEW v_agent_context_config AS
SELECT
    a.id,
    a.name,
    a.display_name,
    a.agent_level,
    a.context_loading_strategy,
    a.required_reading,
    a.context_files,

    -- Protocols assigned
    (
        SELECT jsonb_agg(jsonb_build_object(
            'protocol_name', sp.protocol_name,
            'file_path', sp.file_path,
            'token_estimate', sp.token_estimate,
            'is_mandatory', sp.is_mandatory
        ))
        FROM agent_protocols ap
        JOIN shared_protocols sp ON ap.protocol_id = sp.id
        WHERE ap.agent_id = a.id AND ap.is_enabled = TRUE
    ) as assigned_protocols,

    -- Context files
    (
        SELECT jsonb_agg(jsonb_build_object(
            'file_path', acf.file_path,
            'file_type', acf.file_type,
            'load_on_init', acf.load_on_init,
            'token_estimate', acf.token_estimate,
            'relevance_keywords', acf.relevance_keywords
        ))
        FROM agent_context_files acf
        WHERE acf.agent_id = a.id
    ) as context_files_detailed,

    -- Total token budget estimate
    COALESCE((
        SELECT SUM(acf.token_estimate)
        FROM agent_context_files acf
        WHERE acf.agent_id = a.id AND acf.load_on_init = TRUE
    ), 0) +
    COALESCE((
        SELECT SUM(sp.token_estimate)
        FROM agent_protocols ap
        JOIN shared_protocols sp ON ap.protocol_id = sp.id
        WHERE ap.agent_id = a.id AND ap.is_enabled = TRUE AND sp.is_mandatory = TRUE
    ), 0) as preload_token_estimate

FROM agents a
WHERE a.status = 'active';

COMMENT ON VIEW v_agent_context_config IS 'View showing agent context configuration with protocols and files';

-- ============================================================================
-- 7. FUNCTION: Get Agent Context for Query
-- ============================================================================

CREATE OR REPLACE FUNCTION get_agent_context_for_query(
    p_agent_id UUID,
    p_query_text TEXT,
    p_max_tokens INTEGER DEFAULT 4000
)
RETURNS TABLE (
    file_path VARCHAR,
    file_type VARCHAR,
    token_estimate INTEGER,
    relevance_score DECIMAL,
    load_priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        acf.file_path,
        acf.file_type,
        acf.token_estimate,
        -- Simple relevance scoring based on keyword match
        (
            SELECT COUNT(*)::DECIMAL / GREATEST(array_length(acf.relevance_keywords, 1), 1)
            FROM unnest(acf.relevance_keywords) kw
            WHERE p_query_text ILIKE '%' || kw || '%'
        ) as relevance_score,
        acf.priority as load_priority
    FROM agent_context_files acf
    WHERE acf.agent_id = p_agent_id
      AND (acf.load_on_init = TRUE OR acf.load_on_demand = TRUE)
    ORDER BY
        acf.load_on_init DESC,  -- Preload files first
        relevance_score DESC,    -- Then by relevance
        acf.priority DESC        -- Then by priority
    LIMIT (
        SELECT COUNT(*)
        FROM (
            SELECT acf2.token_estimate
            FROM agent_context_files acf2
            WHERE acf2.agent_id = p_agent_id
            ORDER BY acf2.priority DESC
        ) sub
        WHERE (SELECT SUM(token_estimate) FROM (
            SELECT token_estimate
            FROM agent_context_files acf3
            WHERE acf3.agent_id = p_agent_id
            ORDER BY acf3.priority DESC
            LIMIT sub.token_estimate
        ) running) <= p_max_tokens
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_agent_context_for_query IS 'Returns relevant context files for a given query, respecting token budget';
