-- Ensure every agent has core domain coverage and valid source references.
-- Safe to rerun; uses idempotent upserts/inserts with conflict checks.

BEGIN;

------------------------------------------------------------
-- 0) Relax domain_name nullability (needed for clean inserts)
------------------------------------------------------------
ALTER TABLE agent_knowledge_domains
  ALTER COLUMN domain_name DROP NOT NULL;

------------------------------------------------------------
-- 1) Ensure core domains exist (regulatory, digital health, strategy, unassigned)
------------------------------------------------------------
WITH upsert_domains AS (
  INSERT INTO knowledge_domains (id, name, slug, domain_type, is_active, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'Regulatory',     'regulatory',     'regulatory',       true, now(), now()),
    (gen_random_uuid(), 'Digital Health', 'digital-health', 'digital_health',   true, now(), now()),
    (gen_random_uuid(), 'Strategy',       'strategy',       'operating_model',  true, now(), now()),
    (gen_random_uuid(), 'Unassigned',     'unassigned',     'business_function', true, now(), now())
  ON CONFLICT (slug) DO UPDATE
    SET name        = EXCLUDED.name,
        domain_type = EXCLUDED.domain_type,
        is_active   = true,
        updated_at  = now()
  RETURNING id, name, slug
)
SELECT * FROM upsert_domains;

------------------------------------------------------------
-- 2) Attach every agent to the core domains (skip existing pairs)
------------------------------------------------------------
WITH target_domains AS (
  SELECT id, name FROM knowledge_domains WHERE slug IN ('regulatory','digital-health','strategy','unassigned')
),
all_agents AS (
  SELECT id AS agent_id FROM agents
)
INSERT INTO agent_knowledge_domains (
  id, agent_id, domain_id, domain_name, proficiency_level, expertise_level, is_primary_domain, created_at, updated_at
)
SELECT gen_random_uuid(), a.agent_id, d.id, d.name, 'intermediate', 3, false, now(), now()
FROM all_agents a
CROSS JOIN target_domains d
LEFT JOIN agent_knowledge_domains akd ON akd.agent_id = a.agent_id AND akd.domain_id = d.id
WHERE akd.agent_id IS NULL
ON CONFLICT DO NOTHING;

------------------------------------------------------------
-- 3) Ensure existing rows have domain_name filled from FK (for legacy consumers)
------------------------------------------------------------
UPDATE agent_knowledge_domains akd
SET domain_name = kd.name
FROM knowledge_domains kd
WHERE akd.domain_id = kd.id
  AND (akd.domain_name IS NULL OR akd.domain_name = '');

------------------------------------------------------------
-- 4) Fix invalid sources in agent_knowledge by inserting placeholders
-- If you prefer to null them instead, comment this block and run:
-- UPDATE agent_knowledge ak SET source_id = NULL
-- FROM sources s WHERE ak.source_id IS NOT NULL AND s.id IS NULL;
------------------------------------------------------------
WITH missing_sources AS (
  SELECT DISTINCT ak.source_id
  FROM agent_knowledge ak
  LEFT JOIN sources s ON s.id = ak.source_id
  WHERE ak.source_id IS NOT NULL AND s.id IS NULL
)
INSERT INTO sources (
  id, code, name, short_name, category_id, authority_level, rag_priority_weight,
  is_active, created_at, updated_at
)
SELECT ms.source_id,
       'placeholder-' || substr(ms.source_id::text, 1, 8) AS code,
       'Placeholder Source ' || substr(ms.source_id::text, 1, 8) AS name,
       'Placeholder',
       NULL,
       5,
       0.5,
       true,
       now(),
       now()
FROM missing_sources ms
ON CONFLICT (id) DO NOTHING;

------------------------------------------------------------
-- 5) Quick validation checks (uncomment to run inline)
------------------------------------------------------------
-- SELECT COUNT(*) AS agents_without_domain
-- FROM agents a
-- LEFT JOIN agent_knowledge_domains akd ON akd.agent_id = a.id
-- WHERE akd.agent_id IS NULL;
--
-- SELECT kd.name, kd.slug, COUNT(*) AS agent_count
-- FROM agent_knowledge_domains akd
-- JOIN knowledge_domains kd ON kd.id = akd.domain_id
-- GROUP BY kd.name, kd.slug
-- ORDER BY agent_count DESC
-- LIMIT 20;
--
-- SELECT COUNT(*) AS invalid_sources
-- FROM agent_knowledge ak
-- LEFT JOIN sources s ON s.id = ak.source_id
-- WHERE ak.source_id IS NOT NULL AND s.id IS NULL;

COMMIT;
