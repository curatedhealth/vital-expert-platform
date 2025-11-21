-- ============================================================================
-- Comprehensive Data Distribution Across Tenants
-- ============================================================================
-- Shows distribution of all data types for VITAL Platform, Pharmaceuticals,
-- and Digital Health Startup tenants
-- ============================================================================

-- Main Distribution Matrix
SELECT
  t.name as tenant_name,
  t.slug as tenant_slug,
  COALESCE((SELECT COUNT(*) FROM public.agents WHERE tenant_id = t.id), 0) as agents,
  COALESCE((SELECT COUNT(*) FROM public.knowledge_domains WHERE tenant_id = t.id), 0) as knowledge_domains,
  COALESCE((SELECT COUNT(*) FROM public.personas WHERE tenant_id = t.id), 0) as personas,
  COALESCE((SELECT COUNT(*) FROM public.tools WHERE tenant_id = t.id), 0) as tools,
  COALESCE((SELECT COUNT(*) FROM public.user_roles WHERE tenant_id = t.id), 0) as user_roles,
  -- Calculate total
  COALESCE((SELECT COUNT(*) FROM public.agents WHERE tenant_id = t.id), 0) +
  COALESCE((SELECT COUNT(*) FROM public.knowledge_domains WHERE tenant_id = t.id), 0) +
  COALESCE((SELECT COUNT(*) FROM public.personas WHERE tenant_id = t.id), 0) +
  COALESCE((SELECT COUNT(*) FROM public.tools WHERE tenant_id = t.id), 0) +
  COALESCE((SELECT COUNT(*) FROM public.user_roles WHERE tenant_id = t.id), 0) as total_items
FROM public.tenants t
WHERE t.slug IN ('vital-platform', 'pharmaceuticals', 'digital-health-startup')
ORDER BY total_items DESC;

-- Prompts (Global - No tenant_id)
DO $$
DECLARE
  v_total_prompts INT;
BEGIN
  SELECT COUNT(*) INTO v_total_prompts FROM public.prompts;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📝 PROMPTS (GLOBAL - SHARED ACROSS ALL TENANTS)';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Total Prompts: %', v_total_prompts;
  RAISE NOTICE 'Note: Prompts table does not have tenant_id column';
  RAISE NOTICE 'All prompts are globally accessible to all tenants';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;

-- Detailed breakdown by dimension
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 DETAILED BREAKDOWN BY DIMENSION';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;

-- Agents breakdown
SELECT
  'AGENTS' as dimension,
  t.name as tenant_name,
  COUNT(a.id) as count
FROM public.tenants t
LEFT JOIN public.agents a ON a.tenant_id = t.id
WHERE t.slug IN ('vital-platform', 'pharmaceuticals', 'digital-health-startup')
GROUP BY t.id, t.name
ORDER BY t.name;

-- Knowledge Domains breakdown
SELECT
  'KNOWLEDGE DOMAINS' as dimension,
  t.name as tenant_name,
  COUNT(k.id) as count
FROM public.tenants t
LEFT JOIN public.knowledge_domains k ON k.tenant_id = t.id
WHERE t.slug IN ('vital-platform', 'pharmaceuticals', 'digital-health-startup')
GROUP BY t.id, t.name
ORDER BY t.name;

-- Personas breakdown
SELECT
  'PERSONAS' as dimension,
  t.name as tenant_name,
  COUNT(p.id) as count
FROM public.tenants t
LEFT JOIN public.personas p ON p.tenant_id = t.id
WHERE t.slug IN ('vital-platform', 'pharmaceuticals', 'digital-health-startup')
GROUP BY t.id, t.name
ORDER BY t.name;

-- Tools breakdown
SELECT
  'TOOLS' as dimension,
  t.name as tenant_name,
  COUNT(tool.id) as count
FROM public.tenants t
LEFT JOIN public.tools tool ON tool.tenant_id = t.id
WHERE t.slug IN ('vital-platform', 'pharmaceuticals', 'digital-health-startup')
GROUP BY t.id, t.name
ORDER BY t.name;

-- User Roles breakdown
SELECT
  'USER ROLES' as dimension,
  t.name as tenant_name,
  COUNT(ur.id) as count
FROM public.tenants t
LEFT JOIN public.user_roles ur ON ur.tenant_id = t.id
WHERE t.slug IN ('vital-platform', 'pharmaceuticals', 'digital-health-startup')
GROUP BY t.id, t.name
ORDER BY t.name;

-- Summary Statistics
DO $$
DECLARE
  v_vital_agents INT;
  v_vital_knowledge INT;
  v_vital_personas INT;
  v_vital_tools INT;
  v_pharma_agents INT;
  v_pharma_knowledge INT;
  v_pharma_personas INT;
  v_pharma_tools INT;
  v_digital_agents INT;
  v_digital_knowledge INT;
  v_digital_personas INT;
  v_digital_tools INT;
  v_total_prompts INT;
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  v_pharma_tenant_id UUID;
  v_digital_tenant_id UUID;
BEGIN
  -- Get tenant IDs
  SELECT id INTO v_pharma_tenant_id FROM public.tenants WHERE slug = 'pharmaceuticals';
  SELECT id INTO v_digital_tenant_id FROM public.tenants WHERE slug = 'digital-health-startup';

  -- VITAL Platform counts
  SELECT COUNT(*) INTO v_vital_agents FROM public.agents WHERE tenant_id = v_platform_tenant_id;
  SELECT COUNT(*) INTO v_vital_knowledge FROM public.knowledge_domains WHERE tenant_id = v_platform_tenant_id;
  SELECT COUNT(*) INTO v_vital_personas FROM public.personas WHERE tenant_id = v_platform_tenant_id;
  SELECT COUNT(*) INTO v_vital_tools FROM public.tools WHERE tenant_id = v_platform_tenant_id;

  -- Pharmaceuticals counts
  SELECT COUNT(*) INTO v_pharma_agents FROM public.agents WHERE tenant_id = v_pharma_tenant_id;
  SELECT COUNT(*) INTO v_pharma_knowledge FROM public.knowledge_domains WHERE tenant_id = v_pharma_tenant_id;
  SELECT COUNT(*) INTO v_pharma_personas FROM public.personas WHERE tenant_id = v_pharma_tenant_id;
  SELECT COUNT(*) INTO v_pharma_tools FROM public.tools WHERE tenant_id = v_pharma_tenant_id;

  -- Digital Health counts
  SELECT COUNT(*) INTO v_digital_agents FROM public.agents WHERE tenant_id = v_digital_tenant_id;
  SELECT COUNT(*) INTO v_digital_knowledge FROM public.knowledge_domains WHERE tenant_id = v_digital_tenant_id;
  SELECT COUNT(*) INTO v_digital_personas FROM public.personas WHERE tenant_id = v_digital_tenant_id;
  SELECT COUNT(*) INTO v_digital_tools FROM public.tools WHERE tenant_id = v_digital_tenant_id;

  -- Global prompts count
  SELECT COUNT(*) INTO v_total_prompts FROM public.prompts;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 COMPREHENSIVE SUMMARY';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🌐 VITAL PLATFORM:';
  RAISE NOTICE '   Agents:           %', LPAD(v_vital_agents::TEXT, 6);
  RAISE NOTICE '   Knowledge Domains: %', LPAD(v_vital_knowledge::TEXT, 6);
  RAISE NOTICE '   Personas:         %', LPAD(v_vital_personas::TEXT, 6);
  RAISE NOTICE '   Tools:            %', LPAD(v_vital_tools::TEXT, 6);
  RAISE NOTICE '   ─────────────────────────';
  RAISE NOTICE '   Total:            %', LPAD((v_vital_agents + v_vital_knowledge + v_vital_personas + v_vital_tools)::TEXT, 6);
  RAISE NOTICE '';
  RAISE NOTICE '💊 PHARMACEUTICALS:';
  RAISE NOTICE '   Agents:           %', LPAD(v_pharma_agents::TEXT, 6);
  RAISE NOTICE '   Knowledge Domains: %', LPAD(v_pharma_knowledge::TEXT, 6);
  RAISE NOTICE '   Personas:         %', LPAD(v_pharma_personas::TEXT, 6);
  RAISE NOTICE '   Tools:            %', LPAD(v_pharma_tools::TEXT, 6);
  RAISE NOTICE '   ─────────────────────────';
  RAISE NOTICE '   Total:            %', LPAD((v_pharma_agents + v_pharma_knowledge + v_pharma_personas + v_pharma_tools)::TEXT, 6);
  RAISE NOTICE '';
  RAISE NOTICE '🏥 DIGITAL HEALTH STARTUP:';
  RAISE NOTICE '   Agents:           %', LPAD(v_digital_agents::TEXT, 6);
  RAISE NOTICE '   Knowledge Domains: %', LPAD(v_digital_knowledge::TEXT, 6);
  RAISE NOTICE '   Personas:         %', LPAD(v_digital_personas::TEXT, 6);
  RAISE NOTICE '   Tools:            %', LPAD(v_digital_tools::TEXT, 6);
  RAISE NOTICE '   ─────────────────────────';
  RAISE NOTICE '   Total:            %', LPAD((v_digital_agents + v_digital_knowledge + v_digital_personas + v_digital_tools)::TEXT, 6);
  RAISE NOTICE '';
  RAISE NOTICE '📝 PROMPTS (GLOBAL):      %', LPAD(v_total_prompts::TEXT, 6);
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
