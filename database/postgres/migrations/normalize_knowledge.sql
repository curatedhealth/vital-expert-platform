-- Normalize agent knowledge to proper FKs and junction tables.
-- Assumptions:
-- - knowledge_domains is the canonical reference table (already exists).
-- - agent_knowledge_domains is/should be the junction table.
-- - agent_knowledge is a separate junction to knowledge sources (kept intact).
-- - domain_name in staging maps to knowledge_domains.name or slug (case-insensitive).

BEGIN;

-- 1) Prepare a staging table for agent_knowledge_domains import.
CREATE TEMP TABLE IF NOT EXISTS staging_agent_knowledge_domains (
  agent_id UUID,
  domain_name TEXT,
  proficiency_level TEXT,
  is_primary_domain BOOLEAN,
  expertise_level TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) ON COMMIT PRESERVE ROWS;

-- Example import (run manually before this script):
-- \copy staging_agent_knowledge_domains(agent_id, domain_name, proficiency_level, is_primary_domain, expertise_level, created_at, updated_at)
--   FROM '/path/to/agent_knowledge_domains_rows.csv' CSV HEADER;

-- 2) Ensure agent_knowledge_domains table exists with proper FKs.
CREATE TABLE IF NOT EXISTS agent_knowledge_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,
  proficiency_level TEXT,
  is_primary_domain BOOLEAN DEFAULT FALSE,
  expertise_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Resolve domain_name → domain_id by matching against knowledge_domains.name or slug (case-insensitive).
WITH domain_map AS (
  SELECT kd.id AS domain_id, kd.name, kd.slug
  FROM knowledge_domains kd
),
resolved AS (
  SELECT
    s.agent_id,
    COALESCE(dm.domain_id, kd_by_slug.id) AS domain_id,
    s.proficiency_level,
    s.is_primary_domain,
    s.expertise_level,
    s.created_at,
    s.updated_at
  FROM staging_agent_knowledge_domains s
  LEFT JOIN domain_map dm ON LOWER(dm.name) = LOWER(s.domain_name)
  LEFT JOIN knowledge_domains kd_by_slug ON LOWER(kd_by_slug.slug) = LOWER(s.domain_name)
  WHERE COALESCE(dm.domain_id, kd_by_slug.id) IS NOT NULL
)
INSERT INTO agent_knowledge_domains (agent_id, domain_id, proficiency_level, is_primary_domain, expertise_level, created_at, updated_at)
SELECT DISTINCT
  r.agent_id,
  r.domain_id,
  r.proficiency_level,
  COALESCE(r.is_primary_domain, FALSE),
  r.expertise_level,
  COALESCE(r.created_at, NOW()),
  COALESCE(r.updated_at, NOW())
FROM resolved r
ON CONFLICT (agent_id, domain_id) DO UPDATE
SET proficiency_level = EXCLUDED.proficiency_level,
    is_primary_domain = EXCLUDED.is_primary_domain,
    expertise_level = EXCLUDED.expertise_level,
    updated_at = NOW();

-- 4) Optional cleanup: null out embedded knowledge arrays in agents to avoid drift.
-- Uncomment if desired:
-- UPDATE agents SET knowledge_namespaces = NULL;

COMMIT;

-- Verification:
-- SELECT COUNT(*) FROM agent_knowledge_domains;
-- SELECT agent_id, COUNT(*) AS domains FROM agent_knowledge_domains GROUP BY agent_id ORDER BY domains DESC LIMIT 20;
