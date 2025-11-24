-- ============================================================================
-- Assign all data to VITAL Platform tenant
-- ============================================================================
-- Updates all tables to assign tenant_id to the platform tenant
-- Handles duplicate constraints gracefully
-- ============================================================================

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

  -- Update knowledge_domains (handle duplicates)
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

  -- Update tools (handle duplicates)
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
