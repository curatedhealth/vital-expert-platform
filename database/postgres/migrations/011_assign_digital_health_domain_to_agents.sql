-- Migration: Assign "Digital Health" and "Regulatory Affairs" domains to all agents
-- Date: 2025-01-28
-- Purpose: Ensure all agents have both Digital Health and Regulatory Affairs domains assigned for use in Ask Expert modes

-- Step 1: Update agents to include "Digital Health" and "Regulatory Affairs" in knowledge_domains array
-- This handles both existing arrays and null values

UPDATE agents
SET 
  knowledge_domains = (
    -- Start with existing domains (or empty array if null)
    SELECT ARRAY(
      SELECT DISTINCT domain 
      FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain
      WHERE domain IS NOT NULL
    )
    -- Add Digital Health if not present
    || CASE 
      WHEN NOT EXISTS (
        SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
        WHERE LOWER(domain) IN ('digital health', 'digital-health', 'digital_health')
      ) THEN ARRAY['Digital Health']::TEXT[]
      ELSE ARRAY[]::TEXT[]
    END
    -- Add Regulatory Affairs if not present
    || CASE 
      WHEN NOT EXISTS (
        SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
        WHERE LOWER(domain) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs')
      ) THEN ARRAY['Regulatory Affairs']::TEXT[]
      ELSE ARRAY[]::TEXT[]
    END
  ),
  updated_at = NOW()
WHERE 
  -- Only update agents that don't have both domains
  (
    NOT EXISTS (
      SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
      WHERE LOWER(domain) IN ('digital health', 'digital-health', 'digital_health')
    )
    OR NOT EXISTS (
      SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
      WHERE LOWER(domain) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs')
    )
    OR knowledge_domains IS NULL
  );

-- Step 2: Update agent_knowledge_domains join table for Digital Health
INSERT INTO agent_knowledge_domains (agent_id, domain_name, expertise_level)
SELECT 
  a.id,
  'Digital Health',
  3 -- High expertise level
FROM agents a
WHERE 
  NOT EXISTS (
    SELECT 1 
    FROM agent_knowledge_domains akd 
    WHERE akd.agent_id = a.id 
    AND LOWER(akd.domain_name) IN ('digital health', 'digital-health', 'digital_health')
  );

-- Step 3: Update agent_knowledge_domains join table for Regulatory Affairs
INSERT INTO agent_knowledge_domains (agent_id, domain_name, expertise_level)
SELECT 
  a.id,
  'Regulatory Affairs',
  3 -- High expertise level
FROM agents a
WHERE 
  NOT EXISTS (
    SELECT 1 
    FROM agent_knowledge_domains akd 
    WHERE akd.agent_id = a.id 
    AND LOWER(akd.domain_name) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs')
  );

-- Step 4: Verify the update
SELECT 
  id,
  name,
  display_name,
  knowledge_domains,
  array_length(knowledge_domains, 1) as domain_count
FROM agents
WHERE 
  'Digital Health' = ANY(knowledge_domains) 
  OR 'Regulatory Affairs' = ANY(knowledge_domains)
ORDER BY name;

-- Step 5: Show summary statistics
SELECT 
  COUNT(*) as total_agents,
  COUNT(*) FILTER (WHERE 'Digital Health' = ANY(knowledge_domains)) as agents_with_digital_health,
  COUNT(*) FILTER (WHERE 'Regulatory Affairs' = ANY(knowledge_domains)) as agents_with_regulatory_affairs,
  COUNT(*) FILTER (
    WHERE 'Digital Health' = ANY(knowledge_domains) 
    AND 'Regulatory Affairs' = ANY(knowledge_domains)
  ) as agents_with_both_domains,
  COUNT(*) FILTER (WHERE knowledge_domains IS NULL) as agents_without_domains
FROM agents;

