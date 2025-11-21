WITH medical_affairs_function AS (
  SELECT id
  FROM org_functions
  WHERE name = 'Medical Affairs'
), medical_affairs_departments AS (
  SELECT id
  FROM org_departments
  WHERE function_id IN (SELECT id FROM medical_affairs_function)
), medical_affairs_roles AS (
  SELECT id
  FROM org_roles
  WHERE department_id IN (SELECT id FROM medical_affairs_departments)
)
SELECT
  f.name as function_name,
  d.department_name as department_name,
  r.role_name,
  p.name as persona_name,
  j.name as jtbd_name
FROM org_functions f
JOIN org_departments d ON f.id = d.function_id
JOIN org_roles r ON d.id = r.department_id
JOIN personas p ON r.id = p.role_id
LEFT JOIN persona_jtbd pj ON p.id = pj.persona_id
LEFT JOIN jtbd_core j ON pj.jtbd_id = j.id
WHERE f.id IN (SELECT id FROM medical_affairs_function);
