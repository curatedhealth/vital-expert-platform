-- ============================================================================
-- Migration 013: Migrate Knowledge Domains from Metadata to Junction Table
-- ============================================================================
-- Date: 2025-11-21
-- Purpose: Extract metadata.knowledge_domains and populate agent_knowledge_domains
-- Dependencies: 012_agent_workflow_integration.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Extract and insert from metadata.knowledge_domains
-- ============================================================================

INSERT INTO public.agent_knowledge_domains (
    agent_id,
    knowledge_domain_id,
    domain_name,
    proficiency_level,
    is_primary_domain
)
SELECT
    a.id as agent_id,
    kd.id as knowledge_domain_id,
    domain_codes.domain_code as domain_name,

    -- Infer proficiency from agent tier
    CASE
        WHEN a.tier = 1 THEN 'expert'
        WHEN a.tier = 2 THEN 'advanced'
        WHEN a.tier = 3 THEN 'intermediate'
        ELSE 'basic'
    END as proficiency_level,

    -- Mark first domain as primary
    (row_number() OVER (PARTITION BY a.id ORDER BY COALESCE(kd.priority, 999))) = 1 as is_primary_domain

FROM agents a
CROSS JOIN LATERAL (
    SELECT jsonb_array_elements_text(a.metadata->'knowledge_domains') as domain_code
) as domain_codes
LEFT JOIN knowledge_domains kd ON (
    kd.code = domain_codes.domain_code
    OR kd.slug = domain_codes.domain_code
    OR kd.name = domain_codes.domain_code
)

WHERE a.metadata ? 'knowledge_domains'
  AND jsonb_typeof(a.metadata->'knowledge_domains') = 'array'
  AND a.status IN ('active', 'testing')
  AND (kd.is_active = true OR kd.id IS NULL)

ON CONFLICT (agent_id, knowledge_domain_id)
DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary_domain = EXCLUDED.is_primary_domain,
    updated_at = NOW();

-- ============================================================================
-- STEP 2: Handle agents with domain_expertise array (fallback)
-- ============================================================================

-- Some agents might have domain_expertise array but not metadata.knowledge_domains
-- Let's insert those as well

INSERT INTO public.agent_knowledge_domains (
    agent_id,
    domain_name,
    proficiency_level,
    is_primary_domain
)
SELECT
    a.id as agent_id,
    domain_exp as domain_name,

    -- Infer proficiency from agent tier
    CASE
        WHEN a.tier = 1 THEN 'expert'
        WHEN a.tier = 2 THEN 'advanced'
        WHEN a.tier = 3 THEN 'intermediate'
        ELSE 'basic'
    END as proficiency_level,

    -- Mark first domain as primary
    (row_number() OVER (PARTITION BY a.id ORDER BY domain_exp)) = 1 as is_primary_domain

FROM agents a
CROSS JOIN LATERAL unnest(a.domain_expertise) as domain_exp

WHERE a.domain_expertise IS NOT NULL
  AND array_length(a.domain_expertise, 1) > 0
  AND a.status IN ('active', 'testing')
  -- Only insert if not already present
  AND NOT EXISTS (
      SELECT 1 FROM agent_knowledge_domains akd
      WHERE akd.agent_id = a.id AND akd.domain_name = domain_exp
  )

ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: Update knowledge_domain_id for existing records
-- ============================================================================

-- For records that were inserted with domain_name but without knowledge_domain_id
-- (because knowledge_domains table didn't have matching records)
-- Try to link them now

UPDATE public.agent_knowledge_domains akd
SET knowledge_domain_id = kd.id
FROM public.knowledge_domains kd
WHERE akd.knowledge_domain_id IS NULL
  AND akd.domain_name IS NOT NULL
  AND (
      kd.code = akd.domain_name
      OR kd.slug = akd.domain_name
      OR kd.name = akd.domain_name
  )
  AND kd.is_active = true;

-- ============================================================================
-- STEP 4: Set default proficiency for records missing it
-- ============================================================================

UPDATE public.agent_knowledge_domains akd
SET proficiency_level = CASE
    WHEN a.tier = 1 THEN 'expert'
    WHEN a.tier = 2 THEN 'advanced'
    WHEN a.tier = 3 THEN 'intermediate'
    ELSE 'basic'
END
FROM agents a
WHERE akd.agent_id = a.id
  AND akd.proficiency_level IS NULL;

-- ============================================================================
-- STEP 5: Ensure at least one primary domain per agent
-- ============================================================================

-- For agents with domains but no primary domain set, mark the first one as primary
WITH first_domains AS (
    SELECT DISTINCT ON (agent_id)
        id as akd_id,
        agent_id
    FROM agent_knowledge_domains
    WHERE is_primary_domain = false OR is_primary_domain IS NULL
    ORDER BY agent_id, created_at
)
UPDATE agent_knowledge_domains akd
SET is_primary_domain = true
FROM first_domains fd
WHERE akd.id = fd.akd_id
  -- Only if agent has no primary domain yet
  AND NOT EXISTS (
      SELECT 1 FROM agent_knowledge_domains akd2
      WHERE akd2.agent_id = fd.agent_id AND akd2.is_primary_domain = true
  );

-- ============================================================================
-- STEP 6: Verification Report
-- ============================================================================

DO $$
DECLARE
    v_total_links INTEGER;
    v_agents_with_domains INTEGER;
    v_total_active_agents INTEGER;
    v_agents_with_primary INTEGER;
    v_agents_missing_domains INTEGER;
    v_avg_domains_per_agent NUMERIC;
BEGIN
    -- Count total links
    SELECT COUNT(*) INTO v_total_links FROM agent_knowledge_domains;

    -- Count agents with assigned domains
    SELECT COUNT(DISTINCT agent_id) INTO v_agents_with_domains FROM agent_knowledge_domains;

    -- Count total active agents
    SELECT COUNT(*) INTO v_total_active_agents FROM agents WHERE status IN ('active', 'testing');

    -- Count agents with primary domain set
    SELECT COUNT(DISTINCT agent_id) INTO v_agents_with_primary
    FROM agent_knowledge_domains WHERE is_primary_domain = true;

    -- Count agents missing domains
    SELECT COUNT(*) INTO v_agents_missing_domains
    FROM agents a
    WHERE a.status IN ('active', 'testing')
      AND NOT EXISTS (SELECT 1 FROM agent_knowledge_domains akd WHERE akd.agent_id = a.id);

    -- Calculate average domains per agent
    SELECT ROUND(AVG(domain_count), 2) INTO v_avg_domains_per_agent
    FROM (
        SELECT COUNT(*) as domain_count
        FROM agent_knowledge_domains
        GROUP BY agent_id
    ) as counts;

    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ Knowledge Domain Migration Report';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE 'Total agent-domain links created: %', v_total_links;
    RAISE NOTICE 'Agents with assigned domains: %', v_agents_with_domains;
    RAISE NOTICE 'Total active agents: %', v_total_active_agents;
    RAISE NOTICE 'Coverage: %%', ROUND(100.0 * v_agents_with_domains / NULLIF(v_total_active_agents, 0), 2);
    RAISE NOTICE '';
    RAISE NOTICE 'Agents with primary domain set: %', v_agents_with_primary;
    RAISE NOTICE 'Average domains per agent: %', v_avg_domains_per_agent;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Agents missing domains: %', v_agents_missing_domains;
    RAISE NOTICE '';

    -- List agents missing domains
    IF v_agents_missing_domains > 0 THEN
        RAISE NOTICE 'Agents without knowledge domains:';
        FOR i IN (
            SELECT a.name, a.display_name
            FROM agents a
            WHERE a.status IN ('active', 'testing')
              AND NOT EXISTS (SELECT 1 FROM agent_knowledge_domains akd WHERE akd.agent_id = a.id)
            LIMIT 10
        ) LOOP
            RAISE NOTICE '  - % (%)', i.display_name, i.name;
        END LOOP;
        IF v_agents_missing_domains > 10 THEN
            RAISE NOTICE '  ... and % more', v_agents_missing_domains - 10;
        END IF;
    END IF;

    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ Migration 013 completed successfully';
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;

COMMIT;
