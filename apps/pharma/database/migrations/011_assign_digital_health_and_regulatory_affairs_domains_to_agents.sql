-- Migration: Assign "Digital Health" and "Regulatory Affairs" domains to all agents
-- Date: 2025-01-28
-- Purpose: Ensure all agents have both Digital Health and Regulatory Affairs domains assigned for use in Ask Expert modes
-- Note: knowledge_domains are stored in the metadata JSONB column

-- Step 1: Update agents.metadata to include "Digital Health" and "Regulatory Affairs" in knowledge_domains array
-- Use a simpler approach with a function to build the new array
UPDATE agents
SET 
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{knowledge_domains}',
    (
      SELECT jsonb_agg(DISTINCT domain_value ORDER BY domain_value)
      FROM (
        -- Get existing domains from metadata
        SELECT jsonb_array_elements_text(
          COALESCE(metadata->'knowledge_domains', '[]'::jsonb)
        ) AS domain_value
        UNION ALL
        -- Always add "Digital Health" (distinct will remove duplicates)
        SELECT 'Digital Health'::text AS domain_value
        UNION ALL
        -- Always add "Regulatory Affairs" (distinct will remove duplicates)
        SELECT 'Regulatory Affairs'::text AS domain_value
      ) AS all_domains
    )
  ),
  updated_at = NOW()
WHERE metadata IS NOT NULL OR metadata IS NULL; -- Update all agents

-- Step 2: Verify the update - Show sample of agents with their assigned domains
SELECT 
  id,
  name,
  COALESCE(metadata->>'display_name', name) as display_name,
  metadata->'knowledge_domains' as knowledge_domains,
  jsonb_array_length(COALESCE(metadata->'knowledge_domains', '[]'::jsonb)) as domain_count
FROM agents
WHERE metadata->'knowledge_domains' IS NOT NULL
ORDER BY name
LIMIT 20;

-- Step 3: Show summary statistics
WITH domain_check AS (
  SELECT 
    id,
    CASE 
      WHEN EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(COALESCE(metadata->'knowledge_domains', '[]'::jsonb)) AS domain
        WHERE LOWER(domain) IN ('digital health', 'digital-health', 'digital_health')
      ) THEN true 
      ELSE false 
    END as has_digital_health,
    CASE 
      WHEN EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(COALESCE(metadata->'knowledge_domains', '[]'::jsonb)) AS domain
        WHERE LOWER(domain) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs')
      ) THEN true 
      ELSE false 
    END as has_regulatory_affairs
  FROM agents
)
SELECT 
  COUNT(*) as total_agents,
  COUNT(*) FILTER (WHERE has_digital_health) as agents_with_digital_health,
  COUNT(*) FILTER (WHERE has_regulatory_affairs) as agents_with_regulatory_affairs,
  COUNT(*) FILTER (WHERE has_digital_health AND has_regulatory_affairs) as agents_with_both_domains,
  COUNT(*) FILTER (WHERE NOT has_digital_health AND NOT has_regulatory_affairs) as agents_without_domains
FROM domain_check;
