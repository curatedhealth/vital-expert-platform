-- Query 1: Count workflows by type
SELECT 
  CASE 
    WHEN code LIKE 'WF-DH-%' THEN 'Digital Health'
    WHEN code LIKE 'WF-MAI-%' THEN 'Medical Affairs'
    WHEN code LIKE 'WF-XFI-%' THEN 'Cross-Functional'
    ELSE 'Other'
  END as workflow_type,
  COUNT(*) as count
FROM workflow_templates
GROUP BY 1
ORDER BY 2 DESC;

-- Query 2: Count JTBDs by functional area
SELECT 
  functional_area,
  COUNT(*) as count
FROM jtbd
WHERE deleted_at IS NULL
GROUP BY 1
ORDER BY 2 DESC;
