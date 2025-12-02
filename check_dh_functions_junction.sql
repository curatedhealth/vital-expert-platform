-- Check Digital Health functions via function_industries junction table
SELECT 
  'Functions linked to Digital Health via junction' as check_type,
  COUNT(DISTINCT fi.function_id) as count
FROM function_industries fi
JOIN industries i ON fi.industry_id = i.id
WHERE i.slug = 'digital_health';


