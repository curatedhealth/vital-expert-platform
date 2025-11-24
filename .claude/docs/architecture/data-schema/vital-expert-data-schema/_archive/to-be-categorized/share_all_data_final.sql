-- ============================================================================
-- Complete Data Sharing Script (Final - Auto Column Detection)
-- ============================================================================
-- Shares ALL data from VITAL Platform to:
-- - Pharmaceuticals (agents, knowledge, personas, tools)
-- - Digital Health Startup (agents, knowledge, personas, tools)
-- ============================================================================

DO $$
DECLARE
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  v_pharma_tenant_id UUID;
  v_digital_health_tenant_id UUID;
  v_tenant_id UUID;
  v_tenant_name TEXT;
  v_agents_added INT := 0;
  v_knowledge_added INT := 0;
  v_personas_added INT := 0;
  v_tools_added INT := 0;
  v_total_agents INT := 0;
  v_total_knowledge INT := 0;
  v_total_personas INT := 0;
  v_total_tools INT := 0;
  v_record RECORD;
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🔄 COMPLETE DATA SHARING SCRIPT';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Platform Tenant ID: %', v_platform_tenant_id;
  RAISE NOTICE '';

  -- Get tenant IDs
  SELECT id INTO v_pharma_tenant_id
  FROM public.tenants
  WHERE slug = 'pharmaceuticals';

  SELECT id INTO v_digital_health_tenant_id
  FROM public.tenants
  WHERE slug = 'digital-health-startup';

  IF v_pharma_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Pharmaceuticals tenant not found';
  END IF;

  IF v_digital_health_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Digital Health Startup tenant not found';
  END IF;

  RAISE NOTICE 'Pharma Tenant ID: %', v_pharma_tenant_id;
  RAISE NOTICE 'Digital Health Tenant ID: %', v_digital_health_tenant_id;
  RAISE NOTICE '';

  -- Process each tenant
  FOR v_tenant_id, v_tenant_name IN
    SELECT id, name FROM public.tenants
    WHERE id IN (v_pharma_tenant_id, v_digital_health_tenant_id)
    ORDER BY name
  LOOP
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '📋 Processing: %', v_tenant_name;
    RAISE NOTICE '════════════════════════════════════════════════════════════════';

    -- 1. Copy Agents (using core columns only)
    RAISE NOTICE '👥 Copying agents...';
    DELETE FROM public.agents WHERE tenant_id = v_tenant_id;

    FOR v_record IN
      SELECT * FROM public.agents WHERE tenant_id = v_platform_tenant_id
    LOOP
      INSERT INTO public.agents (
        id, tenant_id, name, slug, tagline, description, title,
        expertise_level, specializations, avatar_url, system_prompt,
        base_model, status, metadata, tags, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), v_tenant_id, v_record.name, v_record.slug,
        v_record.tagline, v_record.description, v_record.title,
        v_record.expertise_level, v_record.specializations, v_record.avatar_url,
        v_record.system_prompt, v_record.base_model, v_record.status,
        v_record.metadata, v_record.tags, v_record.created_at, v_record.updated_at
      );
      v_agents_added := v_agents_added + 1;
    END LOOP;

    RAISE NOTICE '   ✅ Added % agents', v_agents_added;
    v_total_agents := v_total_agents + v_agents_added;
    v_agents_added := 0;

    -- 2. Copy Knowledge Domains
    RAISE NOTICE '📚 Copying knowledge domains...';
    DELETE FROM public.knowledge_domains WHERE tenant_id = v_tenant_id;

    FOR v_record IN
      SELECT * FROM public.knowledge_domains WHERE tenant_id = v_platform_tenant_id
    LOOP
      INSERT INTO public.knowledge_domains (
        id, tenant_id, name, slug, description, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), v_tenant_id, v_record.name, v_record.slug,
        v_record.description, v_record.created_at, v_record.updated_at
      );
      v_knowledge_added := v_knowledge_added + 1;
    END LOOP;

    RAISE NOTICE '   ✅ Added % knowledge domains', v_knowledge_added;
    v_total_knowledge := v_total_knowledge + v_knowledge_added;
    v_knowledge_added := 0;

    -- 3. Copy Personas (using core columns)
    RAISE NOTICE '👤 Copying personas...';
    DELETE FROM public.personas WHERE tenant_id = v_tenant_id;

    FOR v_record IN
      SELECT * FROM public.personas WHERE tenant_id = v_platform_tenant_id
    LOOP
      INSERT INTO public.personas (
        id, tenant_id, name, slug, title, tagline,
        avatar_url, metadata, tags, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), v_tenant_id, v_record.name, v_record.slug,
        v_record.title, v_record.tagline, v_record.avatar_url,
        v_record.metadata, v_record.tags, v_record.created_at, v_record.updated_at
      );
      v_personas_added := v_personas_added + 1;
    END LOOP;

    RAISE NOTICE '   ✅ Added % personas', v_personas_added;
    v_total_personas := v_total_personas + v_personas_added;
    v_personas_added := 0;

    -- 4. Copy Tools
    RAISE NOTICE '🔧 Copying tools...';
    DELETE FROM public.tools WHERE tenant_id = v_tenant_id;

    FOR v_record IN
      SELECT * FROM public.tools WHERE tenant_id = v_platform_tenant_id
    LOOP
      INSERT INTO public.tools (
        id, tenant_id, name, slug, description,
        metadata, tags, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), v_tenant_id, v_record.name, v_record.slug,
        v_record.description, v_record.metadata, v_record.tags,
        v_record.created_at, v_record.updated_at
      );
      v_tools_added := v_tools_added + 1;
    END LOOP;

    RAISE NOTICE '   ✅ Added % tools', v_tools_added;
    v_total_tools := v_total_tools + v_tools_added;
    v_tools_added := 0;

    RAISE NOTICE '';
  END LOOP;

  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 OVERALL SUMMARY';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Total agents shared:           %', v_total_agents;
  RAISE NOTICE 'Total knowledge domains shared: %', v_total_knowledge;
  RAISE NOTICE 'Total personas shared:         %', v_total_personas;
  RAISE NOTICE 'Total tools shared:            %', v_total_tools;
  RAISE NOTICE '';
  RAISE NOTICE 'Each tenant now has:';
  RAISE NOTICE '  - % agents', v_total_agents / 2;
  RAISE NOTICE '  - % knowledge domains', v_total_knowledge / 2;
  RAISE NOTICE '  - % personas', v_total_personas / 2;
  RAISE NOTICE '  - % tools', v_total_tools / 2;
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Data successfully shared with all tenants';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';

END $$;

-- Verification Query
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 VERIFICATION - FINAL DISTRIBUTION';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;

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
WHERE t.slug IN ('vital-platform', 'pharmaceuticals', 'digital-health-startup')
ORDER BY total_items DESC;
