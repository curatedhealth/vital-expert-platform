-- ============================================================================
-- Fix Tenant Constraints to Allow Multi-Tenant Access (Version 2)
-- ============================================================================
-- Phase 1: Drop unique constraints on (tenant_id, slug)
-- Phase 2: Handle duplicates by keeping platform tenant version
-- Phase 3: Assign remaining records to platform tenant
-- ============================================================================

-- PHASE 1: Drop all unique constraints first
-- ============================================================================

-- Drop unique constraint on knowledge_domains
ALTER TABLE IF EXISTS public.knowledge_domains
DROP CONSTRAINT IF EXISTS knowledge_domains_tenant_id_slug_key;

-- Drop unique constraint on tools
ALTER TABLE IF EXISTS public.tools
DROP CONSTRAINT IF EXISTS tools_tenant_id_slug_key;

-- Drop unique constraint on agents (if exists)
ALTER TABLE IF EXISTS public.agents
DROP CONSTRAINT IF EXISTS agents_tenant_id_slug_key;

-- Drop unique constraint on prompts (if exists)
ALTER TABLE IF EXISTS public.prompts
DROP CONSTRAINT IF EXISTS prompts_tenant_id_slug_key;

-- Drop unique constraint on personas (if exists)
ALTER TABLE IF EXISTS public.personas
DROP CONSTRAINT IF EXISTS personas_tenant_id_slug_key;

-- Confirm constraints dropped
DO $$
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Phase 1 Complete: All unique constraints dropped';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;


-- PHASE 2: Handle duplicates by removing non-platform versions
-- ============================================================================
-- For each table, if there are records with same slug but different tenant_ids,
-- keep the platform tenant version and delete others

DO $$
DECLARE
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  v_deleted_count INT;
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🔄 Phase 2: Handling duplicate records';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';

  -- Handle knowledge_domains duplicates
  DELETE FROM public.knowledge_domains
  WHERE id IN (
    SELECT kd1.id
    FROM public.knowledge_domains kd1
    WHERE EXISTS (
      SELECT 1 FROM public.knowledge_domains kd2
      WHERE kd2.slug = kd1.slug
      AND kd2.tenant_id = v_platform_tenant_id
      AND kd1.tenant_id != v_platform_tenant_id
    )
  );
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Removed % duplicate knowledge_domains (kept platform tenant version)', v_deleted_count;

  -- Handle tools duplicates
  DELETE FROM public.tools
  WHERE id IN (
    SELECT t1.id
    FROM public.tools t1
    WHERE EXISTS (
      SELECT 1 FROM public.tools t2
      WHERE t2.slug = t1.slug
      AND t2.tenant_id = v_platform_tenant_id
      AND t1.tenant_id != v_platform_tenant_id
    )
  );
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Removed % duplicate tools (kept platform tenant version)', v_deleted_count;

  -- Handle agents duplicates
  DELETE FROM public.agents
  WHERE id IN (
    SELECT a1.id
    FROM public.agents a1
    WHERE EXISTS (
      SELECT 1 FROM public.agents a2
      WHERE a2.slug = a1.slug
      AND a2.tenant_id = v_platform_tenant_id
      AND a1.tenant_id != v_platform_tenant_id
    )
  );
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Removed % duplicate agents (kept platform tenant version)', v_deleted_count;

  -- Handle prompts duplicates
  DELETE FROM public.prompts
  WHERE id IN (
    SELECT p1.id
    FROM public.prompts p1
    WHERE EXISTS (
      SELECT 1 FROM public.prompts p2
      WHERE p2.slug = p1.slug
      AND p2.tenant_id = v_platform_tenant_id
      AND p1.tenant_id != v_platform_tenant_id
    )
  );
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Removed % duplicate prompts (kept platform tenant version)', v_deleted_count;

  -- Handle personas duplicates
  DELETE FROM public.personas
  WHERE id IN (
    SELECT p1.id
    FROM public.personas p1
    WHERE EXISTS (
      SELECT 1 FROM public.personas p2
      WHERE p2.slug = p1.slug
      AND p2.tenant_id = v_platform_tenant_id
      AND p1.tenant_id != v_platform_tenant_id
    )
  );
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Removed % duplicate personas (kept platform tenant version)', v_deleted_count;

  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Phase 2 Complete: Duplicates handled';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;


-- PHASE 3: Assign all remaining records to platform tenant
-- ============================================================================

DO $$
DECLARE
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  v_updated_count INT;
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🔄 Phase 3: Assigning all records to VITAL Platform tenant';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';

  -- Update agents
  UPDATE public.agents
  SET tenant_id = v_platform_tenant_id
  WHERE tenant_id IS NULL OR tenant_id != v_platform_tenant_id;
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % agents', v_updated_count;

  -- Update knowledge_domains
  UPDATE public.knowledge_domains
  SET tenant_id = v_platform_tenant_id
  WHERE tenant_id IS NULL OR tenant_id != v_platform_tenant_id;
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % knowledge_domains', v_updated_count;

  -- Update prompts
  UPDATE public.prompts
  SET tenant_id = v_platform_tenant_id
  WHERE tenant_id IS NULL OR tenant_id != v_platform_tenant_id;
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % prompts', v_updated_count;

  -- Update personas
  UPDATE public.personas
  SET tenant_id = v_platform_tenant_id
  WHERE tenant_id IS NULL OR tenant_id != v_platform_tenant_id;
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % personas', v_updated_count;

  -- Update tools
  UPDATE public.tools
  SET tenant_id = v_platform_tenant_id
  WHERE tenant_id IS NULL OR tenant_id != v_platform_tenant_id;
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % tools', v_updated_count;

  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Phase 3 Complete: All data assigned to VITAL Platform tenant';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;


-- PHASE 4: Display summary
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 Final Summary';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;

SELECT
  'agents' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE tenant_id = '00000000-0000-0000-0000-000000000001') as platform_records
FROM public.agents
UNION ALL
SELECT
  'knowledge_domains',
  COUNT(*),
  COUNT(*) FILTER (WHERE tenant_id = '00000000-0000-0000-0000-000000000001')
FROM public.knowledge_domains
UNION ALL
SELECT
  'prompts',
  COUNT(*),
  COUNT(*) FILTER (WHERE tenant_id = '00000000-0000-0000-0000-000000000001')
FROM public.prompts
UNION ALL
SELECT
  'personas',
  COUNT(*),
  COUNT(*) FILTER (WHERE tenant_id = '00000000-0000-0000-0000-000000000001')
FROM public.personas
UNION ALL
SELECT
  'tools',
  COUNT(*),
  COUNT(*) FILTER (WHERE tenant_id = '00000000-0000-0000-0000-000000000001')
FROM public.tools
ORDER BY table_name;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🎉 MIGRATION COMPLETE!';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ All unique constraints removed';
  RAISE NOTICE '✅ Duplicate records handled (platform version kept)';
  RAISE NOTICE '✅ All data assigned to VITAL Platform tenant';
  RAISE NOTICE '✅ Data can now be shared across multiple tenants';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
