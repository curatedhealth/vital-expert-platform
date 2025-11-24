-- ============================================================================
-- View Data Distribution Across All Tenants
-- ============================================================================
-- Shows count of records per tenant for all tables with tenant_id column
-- ============================================================================

-- Summary by Tenant
WITH tenant_data AS (
  SELECT
    t.id as tenant_id,
    t.name as tenant_name,
    t.slug as tenant_slug,
    (SELECT COUNT(*) FROM public.agents WHERE tenant_id = t.id) as agents_count,
    (SELECT COUNT(*) FROM public.knowledge_domains WHERE tenant_id = t.id) as knowledge_domains_count,
    (SELECT COUNT(*) FROM public.personas WHERE tenant_id = t.id) as personas_count,
    (SELECT COUNT(*) FROM public.tools WHERE tenant_id = t.id) as tools_count
  FROM public.tenants t
  ORDER BY t.name
)
SELECT
  tenant_name,
  tenant_slug,
  agents_count,
  knowledge_domains_count,
  personas_count,
  tools_count,
  (agents_count + knowledge_domains_count + personas_count + tools_count) as total_items
FROM tenant_data
ORDER BY total_items DESC;

-- Detailed breakdown by table and tenant
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 DETAILED BREAKDOWN BY TABLE';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;

-- Agents by tenant
SELECT
  'AGENTS' as table_name,
  t.name as tenant_name,
  COUNT(a.id) as record_count
FROM public.tenants t
LEFT JOIN public.agents a ON a.tenant_id = t.id
GROUP BY t.id, t.name
HAVING COUNT(a.id) > 0
ORDER BY COUNT(a.id) DESC;

-- Knowledge Domains by tenant
SELECT
  'KNOWLEDGE DOMAINS' as table_name,
  t.name as tenant_name,
  COUNT(k.id) as record_count
FROM public.tenants t
LEFT JOIN public.knowledge_domains k ON k.tenant_id = t.id
GROUP BY t.id, t.name
HAVING COUNT(k.id) > 0
ORDER BY COUNT(k.id) DESC;

-- Personas by tenant
SELECT
  'PERSONAS' as table_name,
  t.name as tenant_name,
  COUNT(p.id) as record_count
FROM public.tenants t
LEFT JOIN public.personas p ON p.tenant_id = t.id
GROUP BY t.id, t.name
HAVING COUNT(p.id) > 0
ORDER BY COUNT(p.id) DESC;

-- Tools by tenant
SELECT
  'TOOLS' as table_name,
  t.name as tenant_name,
  COUNT(tool.id) as record_count
FROM public.tenants t
LEFT JOIN public.tools tool ON tool.tenant_id = t.id
GROUP BY t.id, t.name
HAVING COUNT(tool.id) > 0
ORDER BY COUNT(tool.id) DESC;

-- Platform Tenant Summary
DO $$
DECLARE
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  v_platform_name TEXT;
  v_agents INT;
  v_knowledge INT;
  v_personas INT;
  v_tools INT;
  v_total INT;
BEGIN
  -- Get platform tenant name
  SELECT name INTO v_platform_name FROM public.tenants WHERE id = v_platform_tenant_id;

  -- Get counts
  SELECT COUNT(*) INTO v_agents FROM public.agents WHERE tenant_id = v_platform_tenant_id;
  SELECT COUNT(*) INTO v_knowledge FROM public.knowledge_domains WHERE tenant_id = v_platform_tenant_id;
  SELECT COUNT(*) INTO v_personas FROM public.personas WHERE tenant_id = v_platform_tenant_id;
  SELECT COUNT(*) INTO v_tools FROM public.tools WHERE tenant_id = v_platform_tenant_id;

  v_total := v_agents + v_knowledge + v_personas + v_tools;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🌐 VITAL PLATFORM TENANT SUMMARY';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Tenant: %', v_platform_name;
  RAISE NOTICE 'Tenant ID: %', v_platform_tenant_id;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Data Distribution:';
  RAISE NOTICE '   - Agents: %', v_agents;
  RAISE NOTICE '   - Knowledge Domains: %', v_knowledge;
  RAISE NOTICE '   - Personas: %', v_personas;
  RAISE NOTICE '   - Tools: %', v_tools;
  RAISE NOTICE '   ─────────────────────';
  RAISE NOTICE '   Total Items: %', v_total;
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
