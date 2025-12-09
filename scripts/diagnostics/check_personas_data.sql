-- Check what personas exist and their tenant_ids
SELECT 
  COUNT(*) as total_personas,
  tenant_id,
  COUNT(DISTINCT derived_archetype) as archetypes,
  COUNT(DISTINCT function_area) as functions
FROM personas
WHERE is_active = true
GROUP BY tenant_id;
