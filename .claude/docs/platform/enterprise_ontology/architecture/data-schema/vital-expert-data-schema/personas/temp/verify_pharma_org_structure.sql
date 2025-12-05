WITH pharma_tenant AS (
  SELECT id
  FROM tenants
  WHERE name = 'Pharmaceuticals'
)
SELECT
  t.name as tenant_name,
  f.department_name as function_name,
  d.department_name as department_name,
  r.role_name
FROM tenants t
LEFT JOIN org_functions f ON t.id = f.tenant_id
LEFT JOIN org_departments d ON f.id = d.function_id
LEFT JOIN org_roles r ON d.id = r.department_id
WHERE t.id IN (SELECT id FROM pharma_tenant);
