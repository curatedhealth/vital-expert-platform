-- ============================================================================
-- Simple Distribution Report - All Data in One View
-- ============================================================================

-- Main distribution table showing everything
WITH tenant_stats AS (
  SELECT
    t.id,
    t.name as tenant_name,
    t.slug as tenant_slug,
    (SELECT COUNT(*) FROM public.agents WHERE tenant_id = t.id) as agents,
    (SELECT COUNT(*) FROM public.knowledge_domains WHERE tenant_id = t.id) as knowledge_domains,
    (SELECT COUNT(*) FROM public.personas WHERE tenant_id = t.id) as personas,
    (SELECT COUNT(*) FROM public.tools WHERE tenant_id = t.id) as tools,
    (SELECT COUNT(*) FROM public.user_roles WHERE tenant_id = t.id) as user_roles
  FROM public.tenants t
  WHERE t.slug IN ('vital-platform', 'pharmaceuticals', 'digital-health-startup')
)
SELECT
  tenant_name,
  tenant_slug,
  agents,
  knowledge_domains,
  personas,
  tools,
  user_roles,
  (agents + knowledge_domains + personas + tools + user_roles) as total_items
FROM tenant_stats
ORDER BY total_items DESC;

-- Get prompts count (global)
SELECT 'PROMPTS (Global - Shared)' as info, COUNT(*) as count FROM public.prompts;

-- Summary counts
SELECT
  'VITAL Platform' as tenant,
  (SELECT COUNT(*) FROM public.agents WHERE tenant_id = '00000000-0000-0000-0000-000000000001') as agents,
  (SELECT COUNT(*) FROM public.knowledge_domains WHERE tenant_id = '00000000-0000-0000-0000-000000000001') as knowledge,
  (SELECT COUNT(*) FROM public.personas WHERE tenant_id = '00000000-0000-0000-0000-000000000001') as personas,
  (SELECT COUNT(*) FROM public.tools WHERE tenant_id = '00000000-0000-0000-0000-000000000001') as tools
UNION ALL
SELECT
  'Pharmaceuticals',
  (SELECT COUNT(*) FROM public.agents a JOIN public.tenants t ON a.tenant_id = t.id WHERE t.slug = 'pharmaceuticals'),
  (SELECT COUNT(*) FROM public.knowledge_domains k JOIN public.tenants t ON k.tenant_id = t.id WHERE t.slug = 'pharmaceuticals'),
  (SELECT COUNT(*) FROM public.personas p JOIN public.tenants t ON p.tenant_id = t.id WHERE t.slug = 'pharmaceuticals'),
  (SELECT COUNT(*) FROM public.tools tool JOIN public.tenants t ON tool.tenant_id = t.id WHERE t.slug = 'pharmaceuticals')
UNION ALL
SELECT
  'Digital Health Startup',
  (SELECT COUNT(*) FROM public.agents a JOIN public.tenants t ON a.tenant_id = t.id WHERE t.slug = 'digital-health-startup'),
  (SELECT COUNT(*) FROM public.knowledge_domains k JOIN public.tenants t ON k.tenant_id = t.id WHERE t.slug = 'digital-health-startup'),
  (SELECT COUNT(*) FROM public.personas p JOIN public.tenants t ON p.tenant_id = t.id WHERE t.slug = 'digital-health-startup'),
  (SELECT COUNT(*) FROM public.tools tool JOIN public.tenants t ON tool.tenant_id = t.id WHERE t.slug = 'digital-health-startup');
