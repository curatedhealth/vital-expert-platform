-- ============================================================================
-- Migration: Add Gold Standard Agent Fields
-- Date: 2025-11-17
-- Purpose: Add required fields for PRD/ARD gold standard agent structure
-- ============================================================================

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Add tier column (1-5 hierarchy)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS tier INTEGER CHECK (tier >= 1 AND tier <= 5);

COMMENT ON COLUMN agents.tier IS 'Agent tier in 5-level hierarchy: 1=Master, 2=Expert, 3=Specialist, 4=Worker, 5=Tool';

-- Add capabilities array
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS capabilities TEXT[] DEFAULT '{}';

COMMENT ON COLUMN agents.capabilities IS 'Array of specific agent capabilities (e.g., fda_510k_submission, clinical_endpoint_selection)';

-- Add domain_expertise array
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS domain_expertise TEXT[] DEFAULT '{}';

COMMENT ON COLUMN agents.domain_expertise IS 'Array of domain expertise areas (e.g., fda_regulations, oncology, health_economics)';

-- Add specialization field
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS specialization TEXT;

COMMENT ON COLUMN agents.specialization IS 'Agent specialization description (e.g., Regulatory Orchestration, Clinical Trial Design)';

-- Add tools array
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS tools TEXT[] DEFAULT '{}';

COMMENT ON COLUMN agents.tools IS 'Array of tool names available to agent (e.g., write_todos, delegate_task, spawn_specialist)';

-- Add model field (separate from base_model for flexibility)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'gpt-4';

COMMENT ON COLUMN agents.model IS 'LLM model to use for this agent (gpt-4, gpt-4-turbo-preview, gpt-3.5-turbo)';

-- Add embedding vector (text-embedding-3-large = 3072 dimensions)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS embedding vector(3072);

COMMENT ON COLUMN agents.embedding IS 'Text embedding vector for GraphRAG similarity search (3072 dimensions from text-embedding-3-large)';

-- Create index on tier for faster filtering
CREATE INDEX IF NOT EXISTS agents_tier_idx ON agents(tier) WHERE tier IS NOT NULL;

-- Create index on capabilities for array searches
CREATE INDEX IF NOT EXISTS agents_capabilities_idx ON agents USING gin(capabilities);

-- Create index on domain_expertise for array searches
CREATE INDEX IF NOT EXISTS agents_domain_expertise_idx ON agents USING gin(domain_expertise);

-- Create index on embedding for vector similarity search
CREATE INDEX IF NOT EXISTS agents_embedding_idx ON agents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

COMMENT ON INDEX agents_embedding_idx IS 'IVFFlat index for fast cosine similarity search on embeddings';

-- Add check constraint to ensure gold standard agents have required fields
ALTER TABLE agents
ADD CONSTRAINT gold_standard_requirements CHECK (
    (metadata->>'gold_standard')::boolean IS NOT TRUE OR (
        tier IS NOT NULL AND
        array_length(capabilities, 1) >= 3 AND
        array_length(domain_expertise, 1) >= 2 AND
        embedding IS NOT NULL AND
        length(system_prompt) >= 500
    )
);

COMMENT ON CONSTRAINT gold_standard_requirements ON agents IS 'Ensures gold standard agents meet minimum quality requirements';

-- Update metadata jsonb to include gold_standard flag and version
-- This is for existing agents - new agents will have this set via the enhancement tool
UPDATE agents
SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{gold_standard}',
    'false'
)
WHERE metadata->>'gold_standard' IS NULL;

-- Create function to validate agent tier hierarchy
CREATE OR REPLACE FUNCTION validate_agent_tier_hierarchy()
RETURNS TRIGGER AS $
BEGIN
    -- Tier 1 (Master) must have planning tools
    IF NEW.tier = 1 THEN
        IF NOT (NEW.tools @> ARRAY['write_todos', 'delegate_task']) THEN
            RAISE EXCEPTION 'Tier 1 (Master) agents must have write_todos and delegate_task tools';
        END IF;
    END IF;

    -- Tier 2 (Expert) should have at least 3 capabilities
    IF NEW.tier = 2 THEN
        IF array_length(NEW.capabilities, 1) < 3 THEN
            RAISE WARNING 'Tier 2 (Expert) agents should have at least 3 capabilities';
        END IF;
    END IF;

    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger for tier validation
DROP TRIGGER IF EXISTS validate_tier_hierarchy ON agents;
CREATE TRIGGER validate_tier_hierarchy
    BEFORE INSERT OR UPDATE OF tier, tools, capabilities ON agents
    FOR EACH ROW
    WHEN (NEW.tier IS NOT NULL)
    EXECUTE FUNCTION validate_agent_tier_hierarchy();

-- Create view for gold standard agents only
CREATE OR REPLACE VIEW gold_standard_agents AS
SELECT
    id,
    tenant_id,
    name,
    tier,
    specialization,
    description,
    system_prompt,
    capabilities,
    domain_expertise,
    tools,
    model,
    temperature,
    embedding,
    metadata,
    is_active,
    created_at,
    updated_at
FROM agents
WHERE (metadata->>'gold_standard')::boolean = true
  AND tier IS NOT NULL
ORDER BY tier, name;

COMMENT ON VIEW gold_standard_agents IS 'View showing only agents that meet gold standard criteria';

-- Create view for tier distribution
CREATE OR REPLACE VIEW agent_tier_distribution AS
SELECT
    tier,
    CASE
        WHEN tier = 1 THEN 'Master Agents'
        WHEN tier = 2 THEN 'Expert Agents'
        WHEN tier = 3 THEN 'Specialist Sub-Agents'
        WHEN tier = 4 THEN 'Worker Agents'
        WHEN tier = 5 THEN 'Tool Agents'
        ELSE 'Unknown'
    END as tier_name,
    COUNT(*) as agent_count,
    AVG(array_length(capabilities, 1)) as avg_capabilities,
    AVG(array_length(domain_expertise, 1)) as avg_domains
FROM agents
WHERE tier IS NOT NULL
  AND tenant_id IS NOT NULL
GROUP BY tier
ORDER BY tier;

COMMENT ON VIEW agent_tier_distribution IS 'Summary view of agent distribution across tiers with quality metrics';

-- Grant appropriate permissions (adjust based on your RLS policies)
GRANT SELECT ON gold_standard_agents TO authenticated;
GRANT SELECT ON agent_tier_distribution TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verification query
DO $
BEGIN
    RAISE NOTICE 'Migration 002 completed successfully';
    RAISE NOTICE 'Added columns: tier, capabilities, domain_expertise, specialization, tools, model, embedding';
    RAISE NOTICE 'Created indexes: tier, capabilities, domain_expertise, embedding (IVFFlat)';
    RAISE NOTICE 'Created views: gold_standard_agents, agent_tier_distribution';
    RAISE NOTICE 'Added validation: gold_standard_requirements constraint, tier_hierarchy trigger';
END
$;
