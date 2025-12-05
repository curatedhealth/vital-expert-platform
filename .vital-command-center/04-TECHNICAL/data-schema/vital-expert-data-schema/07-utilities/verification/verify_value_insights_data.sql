-- Verification Query: Check if data exists for Value Insights
-- Run this to verify the AI Powered Insight feature has data to work with
-- Location: .vital-command-center/04-TECHNICAL/data-schema/vital-expert-data-schema/07-utilities/verification/
-- Updated: 2025-12-02 - Fixed column names based on actual schema
-- Default tenant: Pharma Enterprise (c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b)

SET search_path TO public;

-- 1. Check JTBD with Value Categories
SELECT
  'JTBD Value Categories' as check_name,
  COUNT(DISTINCT j.id) as total_jtbds,
  COUNT(DISTINCT jvc.category_id) as categories_used,
  COUNT(jvc.id) as total_mappings
FROM jtbd j
LEFT JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id
WHERE j.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- 2. Value Category Distribution
SELECT
  'Value Category Distribution' as check_name,
  vc.name as category,
  COUNT(jvc.jtbd_id) as jtbd_count,
  ROUND(AVG(jvc.relevance_score), 2) as avg_relevance
FROM value_categories vc
LEFT JOIN jtbd_value_categories jvc ON vc.id = jvc.category_id
GROUP BY vc.name
ORDER BY jtbd_count DESC;

-- 3. ODI Scores Coverage
SELECT
  'ODI Scores' as check_name,
  COUNT(*) as total_jtbds,
  COUNT(CASE WHEN importance_score IS NOT NULL THEN 1 END) as with_importance,
  COUNT(CASE WHEN satisfaction_score IS NOT NULL THEN 1 END) as with_satisfaction,
  COUNT(CASE WHEN opportunity_score IS NOT NULL THEN 1 END) as with_opportunity,
  COUNT(CASE WHEN opportunity_score >= 15 THEN 1 END) as extreme_opportunities,
  ROUND(AVG(opportunity_score), 2) as avg_opportunity
FROM jtbd
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- 4. AI Suitability Coverage
SELECT
  'AI Suitability' as check_name,
  COUNT(*) as total_with_scores,
  ROUND(AVG(overall_score), 3) as avg_overall,
  ROUND(AVG(rag_score), 3) as avg_rag,
  ROUND(AVG(summary_score), 3) as avg_summary,
  ROUND(AVG(generation_score), 3) as avg_generation,
  ROUND(AVG(automation_score), 3) as avg_automation,
  COUNT(CASE WHEN automation_score >= 0.7 THEN 1 END) as high_automation
FROM jtbd_ai_suitability jas
JOIN jtbd j ON jas.jtbd_id = j.id
WHERE j.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- 5. Value Drivers (Internal vs External)
SELECT
  'Value Drivers' as check_name,
  vd.driver_type,
  COUNT(jvd.id) as driver_count,
  ROUND(AVG(jvd.impact_strength), 2) as avg_impact
FROM value_drivers vd
LEFT JOIN jtbd_value_drivers jvd ON vd.id = jvd.driver_id
GROUP BY vd.driver_type;

-- 6. Quick Wins (High ODI + High Automation)
SELECT
  'Quick Wins Analysis' as check_name,
  COUNT(*) as quick_win_candidates,
  ROUND(AVG(j.opportunity_score), 2) as avg_odi,
  ROUND(AVG(jas.automation_score), 2) as avg_automation
FROM jtbd j
JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id
WHERE j.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
  AND j.opportunity_score >= 12
  AND jas.automation_score >= 0.6;

-- 7. Sample High-Opportunity JTBDs
SELECT
  'Top 5 Opportunities' as check_name,
  j.name as jtbd_name,
  j.opportunity_score,
  jas.automation_score,
  jvc.category_name as primary_value_category
FROM jtbd j
LEFT JOIN jtbd_ai_suitability jas ON j.id = jas.jtbd_id
LEFT JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id AND jvc.is_primary = true
WHERE j.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
  AND j.opportunity_score IS NOT NULL
ORDER BY j.opportunity_score DESC
LIMIT 5;
