-- ============================================================================
-- Seed canonical knowledge domains with UUID generation
-- This version generates UUIDs from TEXT domain_ids for existing UUID columns
-- ============================================================================

-- Helper function to generate deterministic UUIDs from text
CREATE OR REPLACE FUNCTION text_to_uuid(text_val TEXT) RETURNS UUID AS $$
BEGIN
  -- Generate a UUID v5 (name-based) from the text
  -- Using the DNS namespace as base
  RETURN uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, text_val);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear existing data (optional - comment out if you want to preserve existing data)
-- TRUNCATE TABLE knowledge_domains CASCADE;

WITH payload AS (
  SELECT
    jsonb_build_object(
      'domains', jsonb '[
        {
          "domain_id": "regulatory_affairs",
          "parent_domain_id": null,
          "function_id": "regulatory_compliance",
          "function_name": "Regulatory & Compliance",
          "domain_name": "Regulatory Affairs",
          "domain_description_llm": "Covers regulatory strategy, submissions, approvals, labeling, lifecycle variations and interactions with authorities for medicinal products and digital health solutions.",
          "tenants_primary": ["Pharmaceutical"],
          "tenants_secondary": ["Digital Health Startup"],
          "is_cross_tenant": true,
          "domain_scope": "global",
          "enterprise_id": null,
          "owner_user_id": null,
          "tier": 1,
          "tier_label": "Core / High Authority",
          "maturity_level": "Established",
          "regulatory_exposure": "High",
          "pii_sensitivity": "Low",
          "lifecycle_stage": ["Pre-Launch", "Launch", "Post-Launch"],
          "governance_owner": "Regulatory Affairs Function",
          "last_review_owner_role": "Head of Regulatory Affairs",
          "embedding_model": "text-embedding-3-large",
          "rag_priority_weight": 0.95,
          "access_policy": "public"
        }
      ]'
    ) AS payload
)
INSERT INTO knowledge_domains (
  domain_id,
  code,
  slug,
  parent_domain_id,
  function_id,
  function_name,
  domain_name,
  domain_description_llm,
  tenants_primary,
  tenants_secondary,
  is_cross_tenant,
  domain_scope,
  enterprise_id,
  owner_user_id,
  tier,
  tier_label,
  maturity_level,
  regulatory_exposure,
  pii_sensitivity,
  lifecycle_stage,
  governance_owner,
  last_review_owner_role,
  embedding_model,
  rag_priority_weight,
  access_policy
)
SELECT
  text_to_uuid(j->>'domain_id'),  -- Convert TEXT to UUID
  j->>'domain_id',  -- Use the text domain_id as code
  lower(regexp_replace(j->>'domain_id', '_', '-', 'g')),  -- Generate slug from domain_id
  CASE 
    WHEN j->>'parent_domain_id' IS NOT NULL THEN text_to_uuid(j->>'parent_domain_id')
    ELSE NULL
  END,
  j->>'function_id',
  j->>'function_name',
  j->>'domain_name',
  j->>'domain_description_llm',
  ARRAY(SELECT jsonb_array_elements_text(j->'tenants_primary')),
  ARRAY(SELECT jsonb_array_elements_text(j->'tenants_secondary')),
  (j->>'is_cross_tenant')::boolean,
  j->>'domain_scope',
  j->>'enterprise_id',
  j->>'owner_user_id',
  (j->>'tier')::integer,
  j->>'tier_label',
  j->>'maturity_level',
  j->>'regulatory_exposure',
  j->>'pii_sensitivity',
  ARRAY(SELECT jsonb_array_elements_text(j->'lifecycle_stage')),
  j->>'governance_owner',
  j->>'last_review_owner_role',
  j->>'embedding_model',
  (j->>'rag_priority_weight')::numeric,
  j->>'access_policy'
FROM payload,
     jsonb_array_elements(payload.payload->'domains') AS j
ON CONFLICT (domain_id) DO UPDATE SET
  code = EXCLUDED.code,
  slug = EXCLUDED.slug,
  parent_domain_id = EXCLUDED.parent_domain_id,
  function_id = EXCLUDED.function_id,
  function_name = EXCLUDED.function_name,
  domain_name = EXCLUDED.domain_name,
  domain_description_llm = EXCLUDED.domain_description_llm,
  tenants_primary = EXCLUDED.tenants_primary,
  tenants_secondary = EXCLUDED.tenants_secondary,
  is_cross_tenant = EXCLUDED.is_cross_tenant,
  domain_scope = EXCLUDED.domain_scope,
  enterprise_id = EXCLUDED.enterprise_id,
  owner_user_id = EXCLUDED.owner_user_id,
  tier = EXCLUDED.tier,
  tier_label = EXCLUDED.tier_label,
  maturity_level = EXCLUDED.maturity_level,
  regulatory_exposure = EXCLUDED.regulatory_exposure,
  pii_sensitivity = EXCLUDED.pii_sensitivity,
  lifecycle_stage = EXCLUDED.lifecycle_stage,
  governance_owner = EXCLUDED.governance_owner,
  last_review_owner_role = EXCLUDED.last_review_owner_role,
  embedding_model = EXCLUDED.embedding_model,
  rag_priority_weight = EXCLUDED.rag_priority_weight,
  access_policy = EXCLUDED.access_policy,
  updated_at = NOW();

-- Optional: Display inserted records
SELECT 
  domain_id,
  domain_name,
  domain_scope,
  tier,
  maturity_level
FROM knowledge_domains
ORDER BY tier ASC, rag_priority_weight DESC;

COMMENT ON FUNCTION text_to_uuid IS 'Generates deterministic UUIDs from text identifiers for knowledge domains';

