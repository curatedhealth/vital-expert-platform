-- Migration script: normalize knowledge domains and agent domain links (backfill-safe)
-- Phases:
-- 1) Schema prep (add columns, tables, constraints stubs)
-- 2) Backfill knowledge_domains slugs and insert missing domains from agent_knowledge_domains.domain_name
-- 3) Backfill agent_knowledge_domains.domain_id from knowledge_domains
-- 4) Add domain_namespaces mapping table
-- 5) Tighten constraints (make nullable cols NOT NULL, add uniques)
-- 6) Validation queries

BEGIN;

---------------------------------------------
-- 1) Schema prep
---------------------------------------------

-- Ensure slug and domain_type exist on knowledge_domains
ALTER TABLE knowledge_domains
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS domain_type text;

-- Temporary helper to generate slug if missing
UPDATE knowledge_domains
SET slug = regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g')
WHERE (slug IS NULL OR slug = '')
  AND name IS NOT NULL;

-- Ensure agent_knowledge_domains has domain_id
ALTER TABLE agent_knowledge_domains
  ADD COLUMN IF NOT EXISTS domain_id uuid;

-- Junction for document ↔ domain (if not already present)
CREATE TABLE IF NOT EXISTS document_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  domain_id uuid NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  relevance_score numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE (document_id, domain_id)
);

-- Domain → namespace mapping (Pinecone, etc.)
CREATE TABLE IF NOT EXISTS domain_namespaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,
  namespace_key text NOT NULL,
  is_default boolean DEFAULT false,
  weight numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE (domain_id, namespace_key)
);

-- Enforce FK on knowledge_domain_mapping.source_id → sources (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'knowledge_domain_mapping_source_id_fkey'
  ) THEN
    ALTER TABLE knowledge_domain_mapping
      ADD CONSTRAINT knowledge_domain_mapping_source_id_fkey
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE;
  END IF;
END $$;

---------------------------------------------
-- 2) Backfill knowledge_domains from agent_knowledge_domains.domain_name
---------------------------------------------

-- Insert missing domain names as new knowledge_domains (default domain_type = 'business_function')
WITH new_domains AS (
  SELECT DISTINCT regexp_replace(lower(trim(domain_name)), '[^a-z0-9]+', '-', 'g') AS slug,
                  domain_name
  FROM agent_knowledge_domains
  WHERE domain_name IS NOT NULL
)
INSERT INTO knowledge_domains (id, name, slug, domain_type, is_active, created_at, updated_at)
SELECT gen_random_uuid(), nd.domain_name, nd.slug, 'business_function', true, now(), now()
FROM new_domains nd
LEFT JOIN knowledge_domains kd ON kd.slug = nd.slug
WHERE kd.id IS NULL;

-- Ensure slugs are unique; append suffix if collision by name mismatch
WITH collisions AS (
  SELECT slug, array_agg(id) AS ids
  FROM knowledge_domains
  GROUP BY slug
  HAVING COUNT(*) > 1
),
renamed AS (
  SELECT c.slug,
         t.id,
         c.slug || '-' || t.ord AS new_slug
  FROM collisions c
  CROSS JOIN LATERAL unnest(c.ids) WITH ORDINALITY AS t(id, ord)
)
UPDATE knowledge_domains kd
SET slug = r.new_slug
FROM renamed r
WHERE kd.id = r.id;

---------------------------------------------
-- 3) Backfill agent_knowledge_domains.domain_id from knowledge_domains
---------------------------------------------

-- Match on lower(name) or slug
WITH kd_map AS (
  SELECT id, lower(name) AS lname, slug FROM knowledge_domains
),
resolved AS (
  SELECT akd.id AS akd_id, kd.id AS domain_id
  FROM agent_knowledge_domains akd
  JOIN kd_map kd
    ON lower(akd.domain_name) = kd.lname
    OR lower(akd.domain_name) = kd.slug
)
UPDATE agent_knowledge_domains akd
SET domain_id = r.domain_id
FROM resolved r
WHERE akd.id = r.akd_id;

---------------------------------------------
-- 4) Tighten constraints (apply after backfill)
---------------------------------------------

-- Ensure slug and domain_type are not null and unique
-- Default null domain_type before enforcing NOT NULL
UPDATE knowledge_domains
SET domain_type = COALESCE(domain_type, 'business_function')
WHERE domain_type IS NULL;

ALTER TABLE knowledge_domains
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN domain_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'knowledge_domains_slug_key'
  ) THEN
    ALTER TABLE knowledge_domains
      ADD CONSTRAINT knowledge_domains_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Make domain_id mandatory after backfill; keep domain_name nullable to allow FK inserts without breaking existing column
ALTER TABLE agent_knowledge_domains
  ALTER COLUMN domain_id SET NOT NULL;

-- Optional: enforce single primary domain per agent
-- NOTE: If duplicates exist, clean data first or comment this block.
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_constraint WHERE conname = 'agent_primary_domain_unique'
--   ) THEN
--     CREATE UNIQUE INDEX agent_primary_domain_unique
--       ON agent_knowledge_domains (agent_id)
--       WHERE is_primary_domain = true;
--   END IF;
-- END $$;

COMMIT;

---------------------------------------------
-- 5) Validation (run manually as needed)
---------------------------------------------
-- Unresolved agent domain links:
-- SELECT COUNT(*) AS unresolved
-- FROM agent_knowledge_domains
-- WHERE domain_id IS NULL;
--
-- Duplicate slugs check:
-- SELECT slug, COUNT(*) FROM knowledge_domains GROUP BY slug HAVING COUNT(*) > 1;
--
-- Invalid source links:
-- SELECT COUNT(*) AS invalid_sources
-- FROM agent_knowledge ak
-- LEFT JOIN sources s ON s.id = ak.source_id
-- WHERE ak.source_id IS NOT NULL AND s.id IS NULL;
--
-- Domain namespace map (if populated):
-- SELECT domain_id, COUNT(*) AS namespaces FROM domain_namespaces GROUP BY domain_id;

-- Agents without any domain link:
-- SELECT COUNT(*) AS agents_without_domain
-- FROM agents a
-- LEFT JOIN agent_knowledge_domains akd ON akd.agent_id = a.id
-- WHERE akd.agent_id IS NULL;

-- Agent-domain distribution:
-- SELECT domain_id, COUNT(*) AS agent_count
-- FROM agent_knowledge_domains
-- GROUP BY domain_id
-- ORDER BY agent_count DESC
-- LIMIT 20;

-- Documents per domain (if document_domains populated):
-- SELECT domain_id, COUNT(*) AS docs
-- FROM document_domains
-- GROUP BY domain_id
-- ORDER BY docs DESC
-- LIMIT 20;
