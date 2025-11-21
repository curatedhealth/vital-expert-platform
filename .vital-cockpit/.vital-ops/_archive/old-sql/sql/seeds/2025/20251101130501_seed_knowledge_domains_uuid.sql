-- ============================================================================
-- Seed canonical knowledge domains (global, enterprise, user scopes)
-- Source: database/sql/seeds/knowledge_domains_full.json
-- Handles both domain_id and domain_name unique constraints
-- ============================================================================

-- Ensure uuid_generate_v5 is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create deterministic UUID function if it doesn't exist
CREATE OR REPLACE FUNCTION text_to_uuid(text_id TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN uuid_generate_v5(uuid_ns_dns(), text_id);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Use procedural approach to handle multiple unique constraints gracefully
DO $$
DECLARE
  domain_data jsonb := jsonb_build_array(
    jsonb_build_object(
      'domain_id', 'regulatory_affairs',
      'parent_domain_id', null,
      'function_id', 'regulatory_compliance',
      'function_name', 'Regulatory & Compliance',
      'domain_name', 'Regulatory Affairs',
      'domain_description_llm', 'Covers regulatory strategy, submissions, approvals, labeling, lifecycle variations and interactions with authorities for medicinal products and digital health solutions.',
      'tenants_primary', ARRAY['Pharmaceutical'],
      'tenants_secondary', ARRAY['Digital Health Startup'],
      'is_cross_tenant', true,
      'domain_scope', 'global',
      'enterprise_id', null,
      'owner_user_id', null,
      'tier', 1,
      'tier_label', 'Core / High Authority',
      'maturity_level', 'Established',
      'regulatory_exposure', 'High',
      'pii_sensitivity', 'Low',
      'lifecycle_stage', ARRAY['Pre-Launch', 'Launch', 'Post-Launch'],
      'governance_owner', 'Regulatory Affairs Function',
      'last_review_owner_role', 'Head of Regulatory Affairs',
      'embedding_model', 'text-embedding-3-large',
      'rag_priority_weight', 0.95,
      'access_policy', 'public'
    )
  );
  domain jsonb;
  domain_uuid uuid;
  existing_id uuid;
BEGIN
  FOR domain IN SELECT jsonb_array_elements(domain_data)
  LOOP
    domain_uuid := text_to_uuid(domain->>'domain_id');
    
    -- Check if domain already exists by domain_id or domain_name
    SELECT domain_id INTO existing_id
    FROM knowledge_domains
    WHERE domain_id = domain_uuid OR domain_name = domain->>'domain_name'
    LIMIT 1;
    
    IF existing_id IS NOT NULL THEN
      -- Update existing domain
      UPDATE knowledge_domains SET
        code = domain->>'domain_id',
        slug = lower(regexp_replace(domain->>'domain_id', '_', '-', 'g')),
        parent_domain_id = CASE WHEN domain->>'parent_domain_id' IS NOT NULL THEN text_to_uuid(domain->>'parent_domain_id') ELSE NULL END,
        function_id = domain->>'function_id',
        function_name = domain->>'function_name',
        domain_name = domain->>'domain_name',
        domain_description_llm = domain->>'domain_description_llm',
        tenants_primary = ARRAY(SELECT jsonb_array_elements_text(domain->'tenants_primary')),
        tenants_secondary = ARRAY(SELECT jsonb_array_elements_text(domain->'tenants_secondary')),
        is_cross_tenant = (domain->>'is_cross_tenant')::boolean,
        domain_scope = domain->>'domain_scope',
        enterprise_id = domain->>'enterprise_id',
        owner_user_id = domain->>'owner_user_id',
        tier = (domain->>'tier')::integer,
        tier_label = domain->>'tier_label',
        maturity_level = domain->>'maturity_level',
        regulatory_exposure = domain->>'regulatory_exposure',
        pii_sensitivity = domain->>'pii_sensitivity',
        lifecycle_stage = ARRAY(SELECT jsonb_array_elements_text(domain->'lifecycle_stage')),
        governance_owner = domain->>'governance_owner',
        last_review_owner_role = domain->>'last_review_owner_role',
        embedding_model = domain->>'embedding_model',
        rag_priority_weight = (domain->>'rag_priority_weight')::numeric,
        access_policy = domain->>'access_policy',
        updated_at = now()
      WHERE domain_id = existing_id;
      
      RAISE NOTICE 'Updated existing domain: % (UUID: %)', domain->>'domain_name', existing_id;
    ELSE
      -- Insert new domain
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
      ) VALUES (
        domain_uuid,
        domain->>'domain_id',
        lower(regexp_replace(domain->>'domain_id', '_', '-', 'g')),
        CASE WHEN domain->>'parent_domain_id' IS NOT NULL THEN text_to_uuid(domain->>'parent_domain_id') ELSE NULL END,
        domain->>'function_id',
        domain->>'function_name',
        domain->>'domain_name',
        domain->>'domain_description_llm',
        ARRAY(SELECT jsonb_array_elements_text(domain->'tenants_primary')),
        ARRAY(SELECT jsonb_array_elements_text(domain->'tenants_secondary')),
        (domain->>'is_cross_tenant')::boolean,
        domain->>'domain_scope',
        domain->>'enterprise_id',
        domain->>'owner_user_id',
        (domain->>'tier')::integer,
        domain->>'tier_label',
        domain->>'maturity_level',
        domain->>'regulatory_exposure',
        domain->>'pii_sensitivity',
        ARRAY(SELECT jsonb_array_elements_text(domain->'lifecycle_stage')),
        domain->>'governance_owner',
        domain->>'last_review_owner_role',
        domain->>'embedding_model',
        (domain->>'rag_priority_weight')::numeric,
        domain->>'access_policy'
      );
      
      RAISE NOTICE 'Inserted new domain: % (UUID: %)', domain->>'domain_name', domain_uuid;
    END IF;
  END LOOP;
END $$;

-- Display inserted/updated domains
SELECT 
  domain_id,
  code,
  slug,
  domain_name,
  domain_scope,
  tier,
  tier_label,
  maturity_level
FROM knowledge_domains
WHERE code IN ('regulatory_affairs')
ORDER BY tier ASC, domain_name ASC;
