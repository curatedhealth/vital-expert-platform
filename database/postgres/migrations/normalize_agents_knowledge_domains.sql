-- Normalize agent knowledge into a junction table
-- Target tenant is hard-coded per request.

-- Prereqs (run manually before this script):
-- 1) Import your CSV of agent→domain links into a staging table:
--    \copy staging_agent_knowledge_domains(agent_id, domain_id) FROM '/path/to/agent_knowledge_domains_rows.csv' CSV HEADER;
-- 2) Ensure knowledge domains are already loaded into knowledge_domains(id, ...).

DO $$
DECLARE
  target_tenant UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Ensure staging table exists (empty if not populated).
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'staging_agent_knowledge_domains'
  ) THEN
    CREATE TEMP TABLE staging_agent_knowledge_domains (
      agent_id UUID,
      domain_id UUID
    ) ON COMMIT DROP;
  END IF;

  -- Create normalized junction table.
  CREATE TABLE IF NOT EXISTS agent_knowledge_domains (
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL DEFAULT target_tenant,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (agent_id, domain_id, tenant_id)
  );

  -- Normalize agent tenant_id.
  UPDATE agents
  SET tenant_id = target_tenant
  WHERE tenant_id IS DISTINCT FROM target_tenant;

  -- Load data from staging into the normalized table, de-duplicated.
  INSERT INTO agent_knowledge_domains (agent_id, domain_id, tenant_id)
  SELECT DISTINCT s.agent_id, s.domain_id, target_tenant
  FROM staging_agent_knowledge_domains s
  JOIN agents a ON a.id = s.agent_id
  JOIN knowledge_domains kd ON kd.id = s.domain_id
  ON CONFLICT (agent_id, domain_id, tenant_id) DO NOTHING;

  -- Optional: if agents table has embedded lists (e.g., knowledge_namespaces),
  -- you can null them out to avoid future drift:
  -- UPDATE agents SET knowledge_namespaces = NULL;
END $$;

-- Verification: counts per agent and overall.
SELECT COUNT(*) AS total_links FROM agent_knowledge_domains;
SELECT agent_id, COUNT(*) AS domains FROM agent_knowledge_domains GROUP BY agent_id ORDER BY domains DESC LIMIT 20;

