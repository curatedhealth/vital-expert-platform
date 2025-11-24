-- ============================================================================
-- Share VITAL Platform Data with Pharmaceuticals Tenant
-- ============================================================================
-- Creates duplicate records for Pharmaceuticals tenant with same content
-- as VITAL Platform tenant
-- ============================================================================

DO $$
DECLARE
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  v_pharma_tenant_id UUID;
  v_agents_added INT := 0;
  v_knowledge_added INT := 0;
  v_personas_added INT := 0;
  v_tools_added INT := 0;
BEGIN
  -- Get Pharmaceuticals tenant ID
  SELECT id INTO v_pharma_tenant_id
  FROM public.tenants
  WHERE slug = 'pharmaceuticals';

  IF v_pharma_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Pharmaceuticals tenant not found';
  END IF;

  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🔄 SHARING DATA WITH PHARMACEUTICALS TENANT';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Platform Tenant ID: %', v_platform_tenant_id;
  RAISE NOTICE 'Pharma Tenant ID: %', v_pharma_tenant_id;
  RAISE NOTICE '';

  -- 1. Copy Agents
  RAISE NOTICE '📋 Copying agents...';
  INSERT INTO public.agents (
    id, name, slug, tagline, description, title, expertise_level,
    specializations, avatar_url, system_prompt, base_model, status,
    metadata, tags, tenant_id, created_at, updated_at
  )
  SELECT
    gen_random_uuid(), -- Generate new ID for pharma version
    name, slug, tagline, description, title, expertise_level,
    specializations, avatar_url, system_prompt, base_model, status,
    metadata, tags,
    v_pharma_tenant_id, -- Assign to Pharmaceuticals tenant
    created_at, updated_at
  FROM public.agents
  WHERE tenant_id = v_platform_tenant_id
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_agents_added = ROW_COUNT;
  RAISE NOTICE '   ✅ Added % agents to Pharmaceuticals', v_agents_added;

  -- 2. Copy Knowledge Domains
  RAISE NOTICE '📚 Copying knowledge domains...';
  INSERT INTO public.knowledge_domains (
    id, name, slug, description, metadata, tenant_id, created_at, updated_at
  )
  SELECT
    gen_random_uuid(), -- Generate new ID for pharma version
    name, slug, description, metadata,
    v_pharma_tenant_id, -- Assign to Pharmaceuticals tenant
    created_at, updated_at
  FROM public.knowledge_domains
  WHERE tenant_id = v_platform_tenant_id
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_knowledge_added = ROW_COUNT;
  RAISE NOTICE '   ✅ Added % knowledge domains to Pharmaceuticals', v_knowledge_added;

  -- 3. Copy Personas
  RAISE NOTICE '👤 Copying personas...';
  INSERT INTO public.personas (
    id, name, slug, description, avatar_url, metadata, tenant_id, created_at, updated_at
  )
  SELECT
    gen_random_uuid(), -- Generate new ID for pharma version
    name, slug, description, avatar_url, metadata,
    v_pharma_tenant_id, -- Assign to Pharmaceuticals tenant
    created_at, updated_at
  FROM public.personas
  WHERE tenant_id = v_platform_tenant_id
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_personas_added = ROW_COUNT;
  RAISE NOTICE '   ✅ Added % personas to Pharmaceuticals', v_personas_added;

  -- 4. Copy Tools
  RAISE NOTICE '🔧 Copying tools...';
  INSERT INTO public.tools (
    id, name, slug, description, function_schema, metadata, tenant_id, created_at, updated_at
  )
  SELECT
    gen_random_uuid(), -- Generate new ID for pharma version
    name, slug, description, function_schema, metadata,
    v_pharma_tenant_id, -- Assign to Pharmaceuticals tenant
    created_at, updated_at
  FROM public.tools
  WHERE tenant_id = v_platform_tenant_id
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_tools_added = ROW_COUNT;
  RAISE NOTICE '   ✅ Added % tools to Pharmaceuticals', v_tools_added;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 SUMMARY';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Agents shared:           %', v_agents_added;
  RAISE NOTICE 'Knowledge domains shared: %', v_knowledge_added;
  RAISE NOTICE 'Personas shared:         %', v_personas_added;
  RAISE NOTICE 'Tools shared:            %', v_tools_added;
  RAISE NOTICE '────────────────────────────────────────';
  RAISE NOTICE 'Total items shared:      %', v_agents_added + v_knowledge_added + v_personas_added + v_tools_added;
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Data successfully shared with Pharmaceuticals tenant';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';

END $$;

-- Verify the results
SELECT
  t.name as tenant_name,
  t.slug as tenant_slug,
  (SELECT COUNT(*) FROM public.agents WHERE tenant_id = t.id) as agents,
  (SELECT COUNT(*) FROM public.knowledge_domains WHERE tenant_id = t.id) as knowledge_domains,
  (SELECT COUNT(*) FROM public.personas WHERE tenant_id = t.id) as personas,
  (SELECT COUNT(*) FROM public.tools WHERE tenant_id = t.id) as tools,
  (SELECT COUNT(*) FROM public.agents WHERE tenant_id = t.id) +
  (SELECT COUNT(*) FROM public.knowledge_domains WHERE tenant_id = t.id) +
  (SELECT COUNT(*) FROM public.personas WHERE tenant_id = t.id) +
  (SELECT COUNT(*) FROM public.tools WHERE tenant_id = t.id) as total_items
FROM public.tenants t
WHERE
  t.slug IN ('vital-platform', 'pharmaceuticals', 'digital-health-startup')
ORDER BY total_items DESC;
