-- Verify migration results
SELECT 
  'Total Prompts' as metric,
  COUNT(*)::text as value
FROM prompts
UNION ALL
SELECT 
  'Active Prompts',
  COUNT(*)::text
FROM prompts 
WHERE status = 'active'
UNION ALL
SELECT 
  'Prompts with Suite',
  COUNT(*)::text
FROM prompts 
WHERE suite IS NOT NULL AND suite != ''
UNION ALL
SELECT 
  'Total Suites',
  COUNT(*)::text
FROM prompt_suites 
WHERE is_active = TRUE
UNION ALL
SELECT 
  'Prompts by Suite: ' || suite,
  COUNT(*)::text
FROM prompts
WHERE suite IS NOT NULL
GROUP BY suite
ORDER BY metric;
