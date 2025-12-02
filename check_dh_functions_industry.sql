-- Check how Digital Health functions are identified
-- Method 1: Check the industry column on org_functions
SELECT 
  'Functions with industry = Digital Health' as check_type,
  COUNT(*) as count
FROM org_functions 
WHERE industry = 'Digital Health'
  AND tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';


