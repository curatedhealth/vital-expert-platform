-- Total count of ALL roles in the tenant (regardless of industry)
SELECT 
  'Total Roles in Tenant' as metric,
  COUNT(*) as count
FROM org_roles
WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';


