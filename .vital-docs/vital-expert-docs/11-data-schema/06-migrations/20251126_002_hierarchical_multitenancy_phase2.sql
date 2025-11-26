-- ============================================================================
-- HIERARCHICAL MULTI-TENANCY MIGRATION - PHASE 2
-- ============================================================================
-- Description: Backfill data for 3-level hierarchy
-- Author: VITAL Database Architect
-- Date: 2025-11-26
-- Status: Safe to run (data migration, reversible)
-- Prerequisites: Phase 1 must be completed
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Set up platform organization
-- ============================================================================

DO $$
DECLARE
  v_platform_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Update platform organization
  UPDATE organizations
  SET
    organization_type = 'platform',
    parent_organization_id = NULL,
    slug = COALESCE(slug, 'vital-platform')
  WHERE id = v_platform_id;

  IF FOUND THEN
    RAISE NOTICE '✓ Set platform organization (id: %)', v_platform_id;
  ELSE
    -- Platform doesn't exist, create it
    INSERT INTO organizations (
      id,
      name,
      slug,
      organization_type,
      parent_organization_id,
      settings,
      is_active,
      created_at
    ) VALUES (
      v_platform_id,
      'VITAL Expert Platform',
      'vital-platform',
      'platform',
      NULL,
      '{"description": "VITAL Expert AI Platform - System Root Organization"}',
      true,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      organization_type = 'platform',
      parent_organization_id = NULL,
      slug = 'vital-platform';

    RAISE NOTICE '✓ Created platform organization';
  END IF;
END$$;

-- ============================================================================
-- STEP 2: Identify and set tenant organizations
-- ============================================================================

-- Based on tenant_type column (if exists)
DO $$
DECLARE
  v_platform_id UUID := '00000000-0000-0000-0000-000000000001';
  v_tenant_count INTEGER := 0;
BEGIN
  -- Check if tenant_type column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'tenant_type'
  ) THEN
    -- Set tenants based on tenant_type
    UPDATE organizations
    SET
      organization_type = 'tenant',
      parent_organization_id = v_platform_id,
      slug = CASE
        WHEN tenant_type = 'digital_health' THEN 'digital-health'
        WHEN tenant_type = 'pharmaceuticals' THEN 'pharma'
        WHEN tenant_type = 'system' THEN 'vital-platform'
        ELSE COALESCE(slug, LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')))
      END
    WHERE tenant_type IN ('digital_health', 'pharmaceuticals')
      AND id != v_platform_id;

    GET DIAGNOSTICS v_tenant_count = ROW_COUNT;
    RAISE NOTICE '✓ Set % tenant organizations based on tenant_type', v_tenant_count;
  ELSE
    RAISE NOTICE 'ℹ tenant_type column not found, skipping tenant identification';
  END IF;
END$$;

-- Based on tenant_key column (if exists)
DO $$
DECLARE
  v_platform_id UUID := '00000000-0000-0000-0000-000000000001';
  v_tenant_count INTEGER := 0;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'tenant_key'
  ) THEN
    UPDATE organizations
    SET
      organization_type = 'tenant',
      parent_organization_id = v_platform_id,
      slug = COALESCE(slug, tenant_key)
    WHERE tenant_key IS NOT NULL
      AND tenant_key != ''
      AND id != v_platform_id
      AND organization_type IS NULL; -- Only update if not already set

    GET DIAGNOSTICS v_tenant_count = ROW_COUNT;
    IF v_tenant_count > 0 THEN
      RAISE NOTICE '✓ Set % tenant organizations based on tenant_key', v_tenant_count;
    END IF;
  END IF;
END$$;

-- ============================================================================
-- STEP 3: Set remaining organizations as child organizations
-- ============================================================================

DO $$
DECLARE
  v_platform_id UUID := '00000000-0000-0000-0000-000000000001';
  v_default_tenant_id UUID;
  v_org_count INTEGER := 0;
BEGIN
  -- Find or create a default tenant for orphaned organizations
  SELECT id INTO v_default_tenant_id
  FROM organizations
  WHERE organization_type = 'tenant'
    AND slug = 'digital-health'
  LIMIT 1;

  -- If no tenant exists, use platform as parent (flatten to 2-level)
  IF v_default_tenant_id IS NULL THEN
    v_default_tenant_id := v_platform_id;
    RAISE NOTICE 'ℹ No tenant found, orphaned orgs will be direct children of platform';
  END IF;

  -- Set all unclassified organizations as child organizations
  UPDATE organizations
  SET
    organization_type = 'organization',
    parent_organization_id = COALESCE(parent_organization_id, v_default_tenant_id),
    slug = COALESCE(slug, LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')))
  WHERE organization_type IS NULL
    AND id != v_platform_id;

  GET DIAGNOSTICS v_org_count = ROW_COUNT;
  RAISE NOTICE '✓ Set % child organizations', v_org_count;
END$$;

-- ============================================================================
-- STEP 4: Generate slugs for organizations missing them
-- ============================================================================

DO $$
DECLARE
  v_updated INTEGER := 0;
BEGIN
  UPDATE organizations
  SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
  WHERE slug IS NULL OR slug = '';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated > 0 THEN
    RAISE NOTICE '✓ Generated slugs for % organizations', v_updated;
  END IF;
END$$;

-- Fix duplicate slugs by appending counter
DO $$
DECLARE
  v_dup_slug TEXT;
  v_counter INTEGER;
BEGIN
  FOR v_dup_slug IN
    SELECT slug
    FROM organizations
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
  LOOP
    v_counter := 1;
    FOR v_org_id IN
      SELECT id
      FROM organizations
      WHERE slug = v_dup_slug
      ORDER BY created_at
      OFFSET 1 -- Keep the first one as-is
    LOOP
      UPDATE organizations
      SET slug = v_dup_slug || '-' || v_counter
      WHERE id = v_org_id;

      v_counter := v_counter + 1;
    END LOOP;

    RAISE NOTICE '✓ Fixed duplicate slug: %', v_dup_slug;
  END LOOP;
END$$;

-- ============================================================================
-- STEP 5: Backfill sharing_scope for agents
-- ============================================================================

DO $$
DECLARE
  v_platform_id UUID := '00000000-0000-0000-0000-000000000001';
  v_updated INTEGER := 0;
BEGIN
  -- Set sharing scope based on existing patterns

  -- Platform-level agents (owned by platform)
  UPDATE agents
  SET sharing_scope = 'platform'::sharing_scope_type
  WHERE owner_organization_id = v_platform_id
    AND sharing_scope IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated > 0 THEN
    RAISE NOTICE '✓ Set % agents to platform scope', v_updated;
  END IF;

  -- Check if is_public metadata exists
  IF EXISTS (
    SELECT 1 FROM agents
    WHERE metadata ? 'is_public'
    LIMIT 1
  ) THEN
    UPDATE agents
    SET sharing_scope = CASE
      WHEN metadata->>'is_public' = 'true' THEN 'platform'::sharing_scope_type
      WHEN metadata->>'is_tenant_shared' = 'true' THEN 'tenant'::sharing_scope_type
      ELSE 'organization'::sharing_scope_type
    END
    WHERE sharing_scope IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE '✓ Set sharing_scope for % agents based on metadata', v_updated;
  END IF;

  -- Default: organization-private for remaining agents
  UPDATE agents
  SET sharing_scope = 'organization'::sharing_scope_type
  WHERE sharing_scope IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated > 0 THEN
    RAISE NOTICE '✓ Set % agents to organization scope (default)', v_updated;
  END IF;
END$$;

-- ============================================================================
-- STEP 6: Backfill sharing_scope for knowledge_documents
-- ============================================================================

DO $$
DECLARE
  v_platform_id UUID := '00000000-0000-0000-0000-000000000001';
  v_updated INTEGER := 0;
BEGIN
  -- Platform documents
  UPDATE knowledge_documents
  SET sharing_scope = 'platform'::sharing_scope_type
  WHERE owner_organization_id = v_platform_id
    AND sharing_scope IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated > 0 THEN
    RAISE NOTICE '✓ Set % knowledge docs to platform scope', v_updated;
  END IF;

  -- Check if is_public column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_documents' AND column_name = 'is_public'
  ) THEN
    UPDATE knowledge_documents
    SET sharing_scope = CASE
      WHEN is_public = true THEN 'platform'::sharing_scope_type
      ELSE 'organization'::sharing_scope_type
    END
    WHERE sharing_scope IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE '✓ Set sharing_scope for % knowledge docs based on is_public', v_updated;
  END IF;

  -- Default: organization-private
  UPDATE knowledge_documents
  SET sharing_scope = 'organization'::sharing_scope_type
  WHERE sharing_scope IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated > 0 THEN
    RAISE NOTICE '✓ Set % knowledge docs to organization scope (default)', v_updated;
  END IF;
END$$;

-- ============================================================================
-- STEP 7: Backfill sharing_scope for prompts
-- ============================================================================

DO $$
DECLARE
  v_platform_id UUID := '00000000-0000-0000-0000-000000000001';
  v_updated INTEGER := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompts') THEN
    -- Platform prompts
    UPDATE prompts
    SET sharing_scope = 'platform'::sharing_scope_type
    WHERE owner_organization_id = v_platform_id
      AND sharing_scope IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated > 0 THEN
      RAISE NOTICE '✓ Set % prompts to platform scope', v_updated;
    END IF;

    -- Default: organization-private
    UPDATE prompts
    SET sharing_scope = 'organization'::sharing_scope_type
    WHERE sharing_scope IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated > 0 THEN
      RAISE NOTICE '✓ Set % prompts to organization scope (default)', v_updated;
    END IF;
  END IF;
END$$;

-- ============================================================================
-- STEP 8: Backfill sharing_scope for workflows
-- ============================================================================

DO $$
DECLARE
  v_platform_id UUID := '00000000-0000-0000-0000-000000000001';
  v_updated INTEGER := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
    -- Platform workflows
    UPDATE workflows
    SET sharing_scope = 'platform'::sharing_scope_type
    WHERE owner_organization_id = v_platform_id
      AND sharing_scope IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated > 0 THEN
      RAISE NOTICE '✓ Set % workflows to platform scope', v_updated;
    END IF;

    -- Check is_public or is_template
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'workflows' AND column_name = 'is_public'
    ) THEN
      UPDATE workflows
      SET sharing_scope = CASE
        WHEN is_public = true THEN 'platform'::sharing_scope_type
        ELSE 'organization'::sharing_scope_type
      END
      WHERE sharing_scope IS NULL;

      GET DIAGNOSTICS v_updated = ROW_COUNT;
      IF v_updated > 0 THEN
        RAISE NOTICE '✓ Set % workflows based on is_public', v_updated;
      END IF;
    END IF;

    -- Default: organization-private
    UPDATE workflows
    SET sharing_scope = 'organization'::sharing_scope_type
    WHERE sharing_scope IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated > 0 THEN
      RAISE NOTICE '✓ Set % workflows to organization scope (default)', v_updated;
    END IF;
  END IF;
END$$;

-- ============================================================================
-- STEP 9: Backfill sharing_scope for use_cases and capabilities
-- ============================================================================

DO $$
DECLARE
  v_platform_id UUID := '00000000-0000-0000-0000-000000000001';
  v_updated INTEGER := 0;
BEGIN
  -- Use cases
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'use_cases') THEN
    UPDATE use_cases
    SET sharing_scope = CASE
      WHEN owner_organization_id = v_platform_id THEN 'platform'::sharing_scope_type
      ELSE 'organization'::sharing_scope_type
    END
    WHERE sharing_scope IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated > 0 THEN
      RAISE NOTICE '✓ Set % use_cases sharing_scope', v_updated;
    END IF;
  END IF;

  -- Capabilities
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'capabilities') THEN
    UPDATE capabilities
    SET sharing_scope = CASE
      WHEN owner_organization_id = v_platform_id THEN 'platform'::sharing_scope_type
      ELSE 'organization'::sharing_scope_type
    END
    WHERE sharing_scope IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated > 0 THEN
      RAISE NOTICE '✓ Set % capabilities sharing_scope', v_updated;
    END IF;
  END IF;
END$$;

-- ============================================================================
-- STEP 10: Fix NULL owner_organization_id
-- ============================================================================

DO $$
DECLARE
  v_platform_id UUID := '00000000-0000-0000-0000-000000000001';
  v_default_org_id UUID;
  v_updated INTEGER := 0;
BEGIN
  -- Find a default organization (prefer platform, then first tenant, then first org)
  SELECT id INTO v_default_org_id
  FROM organizations
  WHERE deleted_at IS NULL
  ORDER BY
    CASE organization_type
      WHEN 'platform' THEN 1
      WHEN 'tenant' THEN 2
      WHEN 'organization' THEN 3
    END,
    created_at
  LIMIT 1;

  IF v_default_org_id IS NULL THEN
    RAISE EXCEPTION 'No valid organization found to assign orphaned resources';
  END IF;

  -- Fix agents
  UPDATE agents
  SET owner_organization_id = v_default_org_id
  WHERE owner_organization_id IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated > 0 THEN
    RAISE WARNING '⚠ Fixed % agents with NULL owner_organization_id (set to %)', v_updated, v_default_org_id;
  END IF;

  -- Fix knowledge_documents
  UPDATE knowledge_documents
  SET owner_organization_id = v_default_org_id
  WHERE owner_organization_id IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated > 0 THEN
    RAISE WARNING '⚠ Fixed % knowledge_documents with NULL owner_organization_id', v_updated;
  END IF;

  -- Fix conversations
  UPDATE conversations
  SET owner_organization_id = v_default_org_id
  WHERE owner_organization_id IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated > 0 THEN
    RAISE WARNING '⚠ Fixed % conversations with NULL owner_organization_id', v_updated;
  END IF;
END$$;

-- ============================================================================
-- STEP 11: Verification & Summary
-- ============================================================================

DO $$
DECLARE
  v_platform_count INTEGER;
  v_tenant_count INTEGER;
  v_org_count INTEGER;
  v_agents_platform INTEGER;
  v_agents_tenant INTEGER;
  v_agents_org INTEGER;
  v_null_owner_count INTEGER;
BEGIN
  -- Count organizations by type
  SELECT COUNT(*) INTO v_platform_count FROM organizations WHERE organization_type = 'platform';
  SELECT COUNT(*) INTO v_tenant_count FROM organizations WHERE organization_type = 'tenant';
  SELECT COUNT(*) INTO v_org_count FROM organizations WHERE organization_type = 'organization';

  -- Count agents by sharing scope
  SELECT COUNT(*) INTO v_agents_platform FROM agents WHERE sharing_scope = 'platform';
  SELECT COUNT(*) INTO v_agents_tenant FROM agents WHERE sharing_scope = 'tenant';
  SELECT COUNT(*) INTO v_agents_org FROM agents WHERE sharing_scope = 'organization';

  -- Check for NULL owner_organization_id
  SELECT COUNT(*) INTO v_null_owner_count
  FROM agents
  WHERE owner_organization_id IS NULL;

  -- Summary report
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '✅ PHASE 2 MIGRATION COMPLETED SUCCESSFULLY';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Organization Hierarchy:';
  RAISE NOTICE '  - Platform organizations: %', v_platform_count;
  RAISE NOTICE '  - Tenant organizations: %', v_tenant_count;
  RAISE NOTICE '  - Child organizations: %', v_org_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Agent Sharing Scopes:';
  RAISE NOTICE '  - Platform-wide agents: %', v_agents_platform;
  RAISE NOTICE '  - Tenant-wide agents: %', v_agents_tenant;
  RAISE NOTICE '  - Organization-private agents: %', v_agents_org;
  RAISE NOTICE '';

  IF v_null_owner_count > 0 THEN
    RAISE WARNING '⚠ WARNING: % agents still have NULL owner_organization_id', v_null_owner_count;
  ELSE
    RAISE NOTICE '✓ All agents have valid owner_organization_id';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Review organization hierarchy in database';
  RAISE NOTICE '  2. Verify sharing scopes are correct';
  RAISE NOTICE '  3. Run Phase 3 to add constraints and indexes';
  RAISE NOTICE '';
END$$;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (run separately to inspect data)
-- ============================================================================
/*

-- View organization hierarchy
SELECT
  o.id,
  o.name,
  o.slug,
  o.organization_type,
  p.name as parent_name,
  p.organization_type as parent_type
FROM organizations o
LEFT JOIN organizations p ON o.parent_organization_id = p.id
ORDER BY
  CASE o.organization_type
    WHEN 'platform' THEN 1
    WHEN 'tenant' THEN 2
    WHEN 'organization' THEN 3
  END,
  o.name;

-- View agent distribution by sharing scope
SELECT
  o.name as organization,
  o.organization_type,
  a.sharing_scope,
  COUNT(*) as agent_count
FROM agents a
JOIN organizations o ON a.owner_organization_id = o.id
GROUP BY o.name, o.organization_type, a.sharing_scope
ORDER BY o.organization_type, a.sharing_scope;

-- Find orphaned resources
SELECT 'agents' as table_name, COUNT(*) as orphaned_count
FROM agents WHERE owner_organization_id IS NULL
UNION ALL
SELECT 'knowledge_documents', COUNT(*)
FROM knowledge_documents WHERE owner_organization_id IS NULL
UNION ALL
SELECT 'conversations', COUNT(*)
FROM conversations WHERE owner_organization_id IS NULL;

*/
