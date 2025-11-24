-- ============================================================================
-- Fix Tenant Constraints to Allow Multi-Tenant Access
-- ============================================================================
-- Removes unique constraints on (tenant_id, slug) to allow data to be
-- shared across multiple tenants
-- ============================================================================

DO $$
BEGIN
  -- Drop unique constraint on knowledge_domains
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'knowledge_domains_tenant_id_slug_key'
  ) THEN
    ALTER TABLE public.knowledge_domains
    DROP CONSTRAINT knowledge_domains_tenant_id_slug_key;
    RAISE NOTICE 'Dropped knowledge_domains_tenant_id_slug_key constraint';
  END IF;

  -- Drop unique constraint on tools
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tools_tenant_id_slug_key'
  ) THEN
    ALTER TABLE public.tools
    DROP CONSTRAINT tools_tenant_id_slug_key;
    RAISE NOTICE 'Dropped tools_tenant_id_slug_key constraint';
  END IF;

  -- Drop unique constraint on agents (if exists)
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'agents_tenant_id_slug_key'
  ) THEN
    ALTER TABLE public.agents
    DROP CONSTRAINT agents_tenant_id_slug_key;
    RAISE NOTICE 'Dropped agents_tenant_id_slug_key constraint';
  END IF;

  -- Drop unique constraint on prompts (if exists)
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'prompts_tenant_id_slug_key'
  ) THEN
    ALTER TABLE public.prompts
    DROP CONSTRAINT prompts_tenant_id_slug_key;
    RAISE NOTICE 'Dropped prompts_tenant_id_slug_key constraint';
  END IF;

  -- Drop unique constraint on personas (if exists)
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'personas_tenant_id_slug_key'
  ) THEN
    ALTER TABLE public.personas
    DROP CONSTRAINT personas_tenant_id_slug_key;
    RAISE NOTICE 'Dropped personas_tenant_id_slug_key constraint';
  END IF;

  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Unique constraints removed - data can now be shared across tenants';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';

END $$;

-- Now update all records to platform tenant
DO $$
DECLARE
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  v_updated_count INT;
BEGIN

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
  RAISE NOTICE '✅ All data assigned to VITAL Platform tenant';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';

END $$;

-- Display summary
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
