-- ============================================================================
-- Tenant Data Distribution Matrix
-- ============================================================================
-- Shows a matrix of tenants vs data dimensions (agents, knowledge, personas, tools)
-- ============================================================================

-- Main Matrix Query: Tenants vs Data Dimensions
SELECT
  t.name as tenant_name,
  t.slug as tenant_slug,
  COALESCE((SELECT COUNT(*) FROM public.agents WHERE tenant_id = t.id), 0) as agents,
  COALESCE((SELECT COUNT(*) FROM public.knowledge_domains WHERE tenant_id = t.id), 0) as knowledge_domains,
  COALESCE((SELECT COUNT(*) FROM public.personas WHERE tenant_id = t.id), 0) as personas,
  COALESCE((SELECT COUNT(*) FROM public.tools WHERE tenant_id = t.id), 0) as tools,
  COALESCE((SELECT COUNT(*) FROM public.agents WHERE tenant_id = t.id), 0) +
  COALESCE((SELECT COUNT(*) FROM public.knowledge_domains WHERE tenant_id = t.id), 0) +
  COALESCE((SELECT COUNT(*) FROM public.personas WHERE tenant_id = t.id), 0) +
  COALESCE((SELECT COUNT(*) FROM public.tools WHERE tenant_id = t.id), 0) as total_items
FROM public.tenants t
ORDER BY total_items DESC, t.name ASC;

-- Summary Totals
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 SUMMARY TOTALS ACROSS ALL TENANTS';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;

SELECT
  'TOTAL' as summary,
  COUNT(DISTINCT a.id) as total_agents,
  COUNT(DISTINCT k.id) as total_knowledge_domains,
  COUNT(DISTINCT p.id) as total_personas,
  COUNT(DISTINCT t.id) as total_tools,
  COUNT(DISTINCT a.id) + COUNT(DISTINCT k.id) + COUNT(DISTINCT p.id) + COUNT(DISTINCT t.id) as grand_total
FROM
  public.agents a,
  public.knowledge_domains k,
  public.personas p,
  public.tools t;

-- Breakdown by dimension showing which tenants have data
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📋 DETAILED BREAKDOWN BY DIMENSION';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;

-- Agents by Tenant
SELECT
  'AGENTS' as dimension,
  tenant.name as tenant_name,
  COUNT(a.id) as count
FROM public.tenants tenant
LEFT JOIN public.agents a ON a.tenant_id = tenant.id
GROUP BY tenant.id, tenant.name
HAVING COUNT(a.id) > 0
ORDER BY COUNT(a.id) DESC
LIMIT 20;

-- Knowledge Domains by Tenant
SELECT
  'KNOWLEDGE DOMAINS' as dimension,
  tenant.name as tenant_name,
  COUNT(k.id) as count
FROM public.tenants tenant
LEFT JOIN public.knowledge_domains k ON k.tenant_id = tenant.id
GROUP BY tenant.id, tenant.name
HAVING COUNT(k.id) > 0
ORDER BY COUNT(k.id) DESC
LIMIT 20;

-- Personas by Tenant
SELECT
  'PERSONAS' as dimension,
  tenant.name as tenant_name,
  COUNT(p.id) as count
FROM public.tenants tenant
LEFT JOIN public.personas p ON p.tenant_id = tenant.id
GROUP BY tenant.id, tenant.name
HAVING COUNT(p.id) > 0
ORDER BY COUNT(p.id) DESC
LIMIT 20;

-- Tools by Tenant
SELECT
  'TOOLS' as dimension,
  tenant.name as tenant_name,
  COUNT(t.id) as count
FROM public.tenants tenant
LEFT JOIN public.tools t ON t.tenant_id = tenant.id
GROUP BY tenant.id, tenant.name
HAVING COUNT(t.id) > 0
ORDER BY COUNT(t.id) DESC
LIMIT 20;

-- Platform Tenant Detailed View
DO $$
DECLARE
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  v_tenant_name TEXT;
  v_agents_count INT;
  v_knowledge_count INT;
  v_personas_count INT;
  v_tools_count INT;
  v_total INT;
BEGIN
  -- Get tenant name
  SELECT name INTO v_tenant_name
  FROM public.tenants
  WHERE id = v_platform_tenant_id;

  -- Get counts
  SELECT COUNT(*) INTO v_agents_count
  FROM public.agents
  WHERE tenant_id = v_platform_tenant_id;

  SELECT COUNT(*) INTO v_knowledge_count
  FROM public.knowledge_domains
  WHERE tenant_id = v_platform_tenant_id;

  SELECT COUNT(*) INTO v_personas_count
  FROM public.personas
  WHERE tenant_id = v_platform_tenant_id;

  SELECT COUNT(*) INTO v_tools_count
  FROM public.tools
  WHERE tenant_id = v_platform_tenant_id;

  v_total := v_agents_count + v_knowledge_count + v_personas_count + v_tools_count;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🌐 VITAL PLATFORM TENANT (ID: %)', v_platform_tenant_id;
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Tenant Name: %', v_tenant_name;
  RAISE NOTICE '';
  RAISE NOTICE '┌─────────────────────────┬──────────┐';
  RAISE NOTICE '│ Dimension               │ Count    │';
  RAISE NOTICE '├─────────────────────────┼──────────┤';
  RAISE NOTICE '│ Agents                  │ %       │', LPAD(v_agents_count::TEXT, 8);
  RAISE NOTICE '│ Knowledge Domains       │ %       │', LPAD(v_knowledge_count::TEXT, 8);
  RAISE NOTICE '│ Personas                │ %       │', LPAD(v_personas_count::TEXT, 8);
  RAISE NOTICE '│ Tools                   │ %       │', LPAD(v_tools_count::TEXT, 8);
  RAISE NOTICE '├─────────────────────────┼──────────┤';
  RAISE NOTICE '│ TOTAL                   │ %       │', LPAD(v_total::TEXT, 8);
  RAISE NOTICE '└─────────────────────────┴──────────┘';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;

-- Data Distribution Percentage
DO $$
DECLARE
  v_total_agents INT;
  v_total_knowledge INT;
  v_total_personas INT;
  v_total_tools INT;
  v_grand_total INT;
BEGIN
  SELECT COUNT(*) INTO v_total_agents FROM public.agents;
  SELECT COUNT(*) INTO v_total_knowledge FROM public.knowledge_domains;
  SELECT COUNT(*) INTO v_total_personas FROM public.personas;
  SELECT COUNT(*) INTO v_total_tools FROM public.tools;

  v_grand_total := v_total_agents + v_total_knowledge + v_total_personas + v_total_tools;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 DATA DISTRIBUTION BY TYPE';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Agents:             % (%.1f%%)',
    LPAD(v_total_agents::TEXT, 6),
    (v_total_agents::FLOAT / NULLIF(v_grand_total, 0) * 100);
  RAISE NOTICE 'Knowledge Domains:  % (%.1f%%)',
    LPAD(v_total_knowledge::TEXT, 6),
    (v_total_knowledge::FLOAT / NULLIF(v_grand_total, 0) * 100);
  RAISE NOTICE 'Personas:           % (%.1f%%)',
    LPAD(v_total_personas::TEXT, 6),
    (v_total_personas::FLOAT / NULLIF(v_grand_total, 0) * 100);
  RAISE NOTICE 'Tools:              % (%.1f%%)',
    LPAD(v_tools_count::TEXT, 6),
    (v_total_tools::FLOAT / NULLIF(v_grand_total, 0) * 100);
  RAISE NOTICE '────────────────────────────────────';
  RAISE NOTICE 'TOTAL:              %', LPAD(v_grand_total::TEXT, 6);
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
