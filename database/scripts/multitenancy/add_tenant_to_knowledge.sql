-- =====================================================================
-- ADD TENANT SUPPORT TO KNOWLEDGE_DOMAINS
-- =====================================================================

-- Tenant IDs:
-- VITAL Expert Platform: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244
-- Digital Health: 684f6c2c-b50d-4726-ad92-c76c3b785a89
-- Pharmaceuticals: c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

-- Add allowed_tenants column
ALTER TABLE knowledge_domains ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];

-- Set all knowledge domains to be available to all 3 tenants
UPDATE knowledge_domains
SET allowed_tenants = ARRAY[
  'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,
  '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid,
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
]
WHERE allowed_tenants IS NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_allowed_tenants ON knowledge_domains USING GIN (allowed_tenants);

-- Verify
SELECT name,
  CASE WHEN 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants) THEN 'Y' ELSE 'N' END as vital,
  CASE WHEN '684f6c2c-b50d-4726-ad92-c76c3b785a89' = ANY(allowed_tenants) THEN 'Y' ELSE 'N' END as digital_health,
  CASE WHEN 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' = ANY(allowed_tenants) THEN 'Y' ELSE 'N' END as pharma
FROM knowledge_domains
ORDER BY name;
