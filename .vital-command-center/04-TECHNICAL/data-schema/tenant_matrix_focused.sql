-- ============================================================================
-- Focused Tenant Data Matrix
-- ============================================================================
-- Shows data distribution for VITAL Platform, Pharmaceuticals, and Digital Health
-- ============================================================================

-- Matrix View: Key Tenants vs Dimensions
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
  OR t.name IN ('VITAL Platform', 'Pharmaceuticals', 'Digital Health Startup')
ORDER BY total_items DESC;
