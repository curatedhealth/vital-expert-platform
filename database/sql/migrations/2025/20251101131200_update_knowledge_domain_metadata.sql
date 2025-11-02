-- ============================================================================
-- Normalize knowledge_domains metadata for legacy entries
-- Date: 2025-11-01
-- Notes:
--   * Fills in missing descriptive fields for historical domain rows.
--   * Ensures tier labels, priority weights, and descriptions are populated.
--   * Standardizes default function identifiers.
-- ============================================================================

-- Provide tier labels where missing
UPDATE knowledge_domains
SET tier_label = CASE tier
    WHEN 1 THEN 'Core / High Authority'
    WHEN 2 THEN 'Specialized Knowledge'
    WHEN 3 THEN 'Emerging / Exploratory'
    ELSE 'Baseline'
  END
WHERE tier_label IS NULL
   OR trim(tier_label) = ''
   OR tier_label ILIKE 'null%';

-- Default function metadata for placeholder rows
UPDATE knowledge_domains
SET function_id = 'general_operations',
    function_name = 'General Operations'
WHERE function_id IS NULL
   OR trim(function_id) IN ('', 'default')
   OR function_id ILIKE 'default%';

UPDATE knowledge_domains
SET function_name = 'General Operations'
WHERE trim(function_name) = ''
  AND (function_id = 'general_operations' OR function_id ILIKE 'default%');

-- Populate missing domain descriptions
UPDATE knowledge_domains
SET domain_description_llm = CONCAT(
    domain_name,
    ' domain: curated knowledge assets covering processes, governance, and best practices for this focus area. ',
    'Update with enterprise-specific guidance as RAG content is onboarded.'
  )
WHERE domain_description_llm IS NULL
   OR TRIM(domain_description_llm) = ''
   OR domain_description_llm ILIKE 'null%';

-- Set default lifecycle stage if missing
UPDATE knowledge_domains
SET lifecycle_stage = ARRAY['General']
WHERE lifecycle_stage IS NULL
   OR array_length(lifecycle_stage, 1) IS NULL;

-- Ensure rag priority weights exist (respect existing non-null values)
UPDATE knowledge_domains
SET rag_priority_weight = CASE tier
    WHEN 1 THEN 0.90
    WHEN 2 THEN 0.70
    WHEN 3 THEN 0.55
    ELSE 0.50
  END
WHERE rag_priority_weight IS NULL
   OR rag_priority_weight = 0;

-- Default maturity level if somehow blank
UPDATE knowledge_domains
SET maturity_level = CASE
    WHEN tier = 1 THEN 'Established'
    WHEN tier = 2 THEN 'Specialized'
    ELSE 'Emerging'
  END
WHERE maturity_level IS NULL
   OR TRIM(maturity_level) = '';

