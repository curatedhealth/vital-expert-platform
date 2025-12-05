-- ============================================================================
-- PHARMACEUTICAL ONTOLOGY REMEDIATION MIGRATION
-- Migration: 014_pharma_ontology_remediation.sql
-- Date: 2025-12-02
-- Purpose: Close gaps identified in pharma ontology audit
-- Location: .claude/docs/platform/enterprise_ontology/sql/
-- ============================================================================
-- Valid enum values (from live database schema):
--   functional_area: 'Medical Affairs', 'Commercial', 'Market Access', 'Clinical',
--                    'Regulatory', 'Research & Development', 'Operations', 'IT/Digital'
--   job_type: 'main', 'related', 'consumption_chain'
--   complexity: 'low', 'medium', 'high', 'very_high'
--   frequency: 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
--   recommended_service_layer: 'L1_expert', 'L2_panel', 'L3_workflow', 'L4_solution'
-- ============================================================================

-- ============================================================================
-- PHASE 1: COMMERCIAL JTBD-ROLE GAP CLOSURE
-- ============================================================================

-- Step 1.1: Create new Commercial JTBDs for unmapped role categories
-- Using correct column format from working migration (20251201_031_l6_insights_analytics_workflows.sql)

-- JTBD COM-069: Commercial Strategy Development (Leadership)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0069-0001-0001-000000000001',
  'COM-JTBD-069',
  'Commercial Strategy Development',
  'When developing annual commercial strategy, I want to analyze market dynamics, competitive positioning, and portfolio performance, so I can maximize revenue growth and market share.',
  'developing annual commercial strategy',
  'market dynamics require strategic response',
  'maximize revenue growth and market share',
  'main',
  'high',
  'yearly',
  'L3_workflow',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-070: Commercial Leadership & Governance (Leadership)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0070-0001-0001-000000000001',
  'COM-JTBD-070',
  'Commercial Leadership & Governance',
  'When leading commercial organization, I want to establish governance frameworks and performance metrics, so I can ensure alignment and accountability across teams.',
  'leading commercial organization',
  'need for governance and alignment',
  'ensure alignment and accountability across teams',
  'main',
  'high',
  'daily',
  'L1_expert',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-071: Cross-Functional Commercial Alignment (Leadership)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0071-0001-0001-000000000001',
  'COM-JTBD-071',
  'Cross-Functional Commercial Alignment',
  'When coordinating with medical and market access teams, I want to align commercial messaging with scientific evidence and access strategies, so I can deliver compliant and effective go-to-market execution.',
  'coordinating with medical and market access teams',
  'need for cross-functional alignment',
  'deliver compliant and effective go-to-market execution',
  'main',
  'high',
  'quarterly',
  'L2_panel',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-072: Revenue Forecasting & Planning (Analytics)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0072-0001-0001-000000000001',
  'COM-JTBD-072',
  'Revenue Forecasting & Planning',
  'When preparing revenue forecasts, I want to integrate sales data, market trends, and pipeline analysis, so I can provide accurate predictions for financial planning.',
  'preparing revenue forecasts',
  'quarterly planning cycle requires accuracy',
  'provide accurate predictions for financial planning',
  'main',
  'high',
  'quarterly',
  'L3_workflow',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-073: Business Intelligence & Insights Generation (Analytics)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0073-0001-0001-000000000001',
  'COM-JTBD-073',
  'Business Intelligence & Insights Generation',
  'When analyzing commercial performance, I want to synthesize data from multiple sources and identify actionable insights, so I can inform strategic decision-making.',
  'analyzing commercial performance',
  'need for data-driven decisions',
  'inform strategic decision-making',
  'main',
  'high',
  'weekly',
  'L3_workflow',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-074: Market Intelligence Analysis (Analytics)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0074-0001-0001-000000000001',
  'COM-JTBD-074',
  'Market Intelligence Analysis',
  'When monitoring market dynamics, I want to track competitor activities, market trends, and customer behavior, so I can identify opportunities and threats early.',
  'monitoring market dynamics',
  'rapidly changing competitive landscape',
  'identify opportunities and threats early',
  'main',
  'medium',
  'weekly',
  'L1_expert',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-075: Sales Analytics & Performance Tracking (Analytics)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0075-0001-0001-000000000001',
  'COM-JTBD-075',
  'Sales Analytics & Performance Tracking',
  'When evaluating sales performance, I want to analyze territory metrics, rep productivity, and conversion rates, so I can optimize sales force effectiveness.',
  'evaluating sales performance',
  'need to optimize sales outcomes',
  'optimize sales force effectiveness',
  'main',
  'medium',
  'weekly',
  'L3_workflow',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-076: Brand Portfolio Management (Marketing)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0076-0001-0001-000000000001',
  'COM-JTBD-076',
  'Brand Portfolio Management',
  'When managing brand portfolio, I want to optimize positioning, messaging, and resource allocation across products, so I can maximize portfolio value and growth.',
  'managing brand portfolio',
  'multiple brands competing for resources',
  'maximize portfolio value and growth',
  'main',
  'high',
  'quarterly',
  'L3_workflow',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-077: Product Launch Planning & Execution (Marketing)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0077-0001-0001-000000000001',
  'COM-JTBD-077',
  'Product Launch Planning & Execution',
  'When launching new products, I want to coordinate cross-functional readiness and execute integrated campaigns, so I can achieve successful market entry and adoption.',
  'launching new products',
  'critical market entry window',
  'achieve successful market entry and adoption',
  'main',
  'high',
  'quarterly',
  'L3_workflow',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-078: Digital Marketing ROI Optimization (Marketing)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0078-0001-0001-000000000001',
  'COM-JTBD-078',
  'Digital Marketing ROI Optimization',
  'When managing digital marketing spend, I want to track campaign performance and optimize channel mix, so I can maximize return on marketing investment.',
  'managing digital marketing spend',
  'pressure to demonstrate marketing ROI',
  'maximize return on marketing investment',
  'main',
  'medium',
  'monthly',
  'L3_workflow',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-079: Brand Positioning & Messaging Strategy (Marketing)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0079-0001-0001-000000000001',
  'COM-JTBD-079',
  'Brand Positioning & Messaging Strategy',
  'When developing brand positioning, I want to differentiate our products based on clinical evidence and value proposition, so I can create compelling messaging for target audiences.',
  'developing brand positioning',
  'competitive differentiation needed',
  'create compelling messaging for target audiences',
  'main',
  'high',
  'yearly',
  'L2_panel',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-080: Acquisition Target Evaluation (Business Development)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0080-0001-0001-000000000001',
  'COM-JTBD-080',
  'Acquisition Target Evaluation',
  'When evaluating acquisition targets, I want to assess strategic fit, financial value, and integration complexity, so I can make informed recommendations to leadership.',
  'evaluating acquisition targets',
  'growth through M&A strategy',
  'make informed recommendations to leadership',
  'main',
  'high',
  'quarterly',
  'L2_panel',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-081: Competitive Intelligence Gathering (Business Development)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0081-0001-0001-000000000001',
  'COM-JTBD-081',
  'Competitive Intelligence Gathering',
  'When monitoring competitors, I want to systematically gather and analyze competitive information, so I can provide actionable intelligence for strategic planning.',
  'monitoring competitors',
  'dynamic competitive environment',
  'provide actionable intelligence for strategic planning',
  'main',
  'medium',
  'weekly',
  'L1_expert',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-082: Business Development Opportunity Assessment (Business Development)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0082-0001-0001-000000000001',
  'COM-JTBD-082',
  'Business Development Opportunity Assessment',
  'When identifying partnership opportunities, I want to evaluate potential collaborations and licensing deals, so I can expand our portfolio and capabilities.',
  'identifying partnership opportunities',
  'need to expand capabilities',
  'expand our portfolio and capabilities',
  'main',
  'high',
  'quarterly',
  'L2_panel',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-083: Commercial Operations Excellence (Operations)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0083-0001-0001-000000000001',
  'COM-JTBD-083',
  'Commercial Operations Excellence',
  'When managing commercial operations, I want to streamline processes and improve operational efficiency, so I can enable the sales and marketing teams to focus on customers.',
  'managing commercial operations',
  'need for operational efficiency',
  'enable teams to focus on customers',
  'main',
  'medium',
  'daily',
  'L1_expert',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD COM-084: Sales Force Effectiveness Optimization (Operations)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0084-0001-0001-000000000001',
  'COM-JTBD-084',
  'Sales Force Effectiveness Optimization',
  'When optimizing sales force, I want to analyze territory alignment, call patterns, and resource allocation, so I can maximize sales productivity and coverage.',
  'optimizing sales force',
  'need to improve sales productivity',
  'maximize sales productivity and coverage',
  'main',
  'medium',
  'quarterly',
  'L3_workflow',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- Step 1.2: Map new JTBDs to Commercial Organization function
INSERT INTO jtbd_functions (jtbd_id, function_id, function_name, relevance_score)
SELECT
    j.id,
    f.id,
    f.name,
    0.95
FROM jtbd j
CROSS JOIN org_functions f
WHERE j.code LIKE 'COM-JTBD-0%'
AND j.code >= 'COM-JTBD-069'
AND f.name = 'Commercial Organization'
ON CONFLICT DO NOTHING;

-- Step 1.3: Map JTBDs to unmapped Leadership roles
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score)
SELECT DISTINCT
    j.id as jtbd_id,
    r.id as role_id,
    r.name as role_name,
    0.90 as relevance_score
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
CROSS JOIN jtbd j
LEFT JOIN jtbd_roles existing ON existing.role_id = r.id AND existing.jtbd_id = j.id
WHERE f.name = 'Commercial Organization'
AND existing.role_id IS NULL
AND (
    -- Leadership roles get leadership JTBDs
    (r.name ILIKE '%chief%' OR r.name ILIKE '%vice president%' OR r.name ILIKE '%director%')
    AND j.code IN ('COM-JTBD-069', 'COM-JTBD-070', 'COM-JTBD-071')
)
ON CONFLICT DO NOTHING;

-- Step 1.4: Map JTBDs to unmapped Analytics roles
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score)
SELECT DISTINCT
    j.id as jtbd_id,
    r.id as role_id,
    r.name as role_name,
    0.90 as relevance_score
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
CROSS JOIN jtbd j
LEFT JOIN jtbd_roles existing ON existing.role_id = r.id AND existing.jtbd_id = j.id
WHERE f.name = 'Commercial Organization'
AND existing.role_id IS NULL
AND (
    -- Analytics roles get analytics JTBDs
    (r.name ILIKE '%analyst%' OR r.name ILIKE '%analytics%' OR r.name ILIKE '%insights%' OR r.name ILIKE '%forecast%' OR r.name ILIKE '%data%')
    AND j.code IN ('COM-JTBD-072', 'COM-JTBD-073', 'COM-JTBD-074', 'COM-JTBD-075')
)
ON CONFLICT DO NOTHING;

-- Step 1.5: Map JTBDs to unmapped Marketing roles
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score)
SELECT DISTINCT
    j.id as jtbd_id,
    r.id as role_id,
    r.name as role_name,
    0.88 as relevance_score
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
CROSS JOIN jtbd j
LEFT JOIN jtbd_roles existing ON existing.role_id = r.id AND existing.jtbd_id = j.id
WHERE f.name = 'Commercial Organization'
AND existing.role_id IS NULL
AND (
    -- Marketing roles get marketing JTBDs
    (r.name ILIKE '%marketing%' OR r.name ILIKE '%brand%' OR r.name ILIKE '%product%')
    AND j.code IN ('COM-JTBD-076', 'COM-JTBD-077', 'COM-JTBD-078', 'COM-JTBD-079')
)
ON CONFLICT DO NOTHING;

-- Step 1.6: Map JTBDs to unmapped Business Development roles
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score)
SELECT DISTINCT
    j.id as jtbd_id,
    r.id as role_id,
    r.name as role_name,
    0.85 as relevance_score
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
CROSS JOIN jtbd j
LEFT JOIN jtbd_roles existing ON existing.role_id = r.id AND existing.jtbd_id = j.id
WHERE f.name = 'Commercial Organization'
AND existing.role_id IS NULL
AND (
    -- BizDev roles get bizdev JTBDs
    (r.name ILIKE '%acquisition%' OR r.name ILIKE '%licensing%' OR r.name ILIKE '%intelligence%' OR r.name ILIKE '%business%')
    AND j.code IN ('COM-JTBD-080', 'COM-JTBD-081', 'COM-JTBD-082')
)
ON CONFLICT DO NOTHING;

-- Step 1.7: Map JTBDs to remaining unmapped roles (Operations catch-all)
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score)
SELECT DISTINCT
    j.id as jtbd_id,
    r.id as role_id,
    r.name as role_name,
    0.80 as relevance_score
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
CROSS JOIN jtbd j
LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
WHERE f.name = 'Commercial Organization'
AND jr.role_id IS NULL  -- Still unmapped after previous steps
AND j.code IN ('COM-JTBD-083', 'COM-JTBD-084')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PHASE 2: DATA QUALITY CLEANUP
-- ============================================================================

-- Step 2.1: Identify duplicate departments (diagnostic - no changes)
DO $$
DECLARE
    dup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO dup_count
    FROM (
        SELECT name FROM org_departments GROUP BY name HAVING COUNT(*) > 1
    ) dups;

    IF dup_count > 0 THEN
        RAISE NOTICE 'Found % duplicate department names. Review before cleanup.', dup_count;
    ELSE
        RAISE NOTICE 'No duplicate departments found.';
    END IF;
END $$;

-- Step 2.2: Remove empty "Sales" department if it exists and has no roles
DELETE FROM org_departments
WHERE name = 'Sales'
AND id IN (
    SELECT d.id
    FROM org_departments d
    JOIN org_functions f ON d.function_id = f.id
    LEFT JOIN org_roles r ON r.department_id = d.id
    WHERE f.name = 'Commercial Organization'
    GROUP BY d.id
    HAVING COUNT(r.id) = 0
);

-- Step 2.3: Check for incomplete MECE personas and report
DO $$
DECLARE
    incomplete_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO incomplete_count
    FROM (
        SELECT r.id
        FROM org_roles r
        JOIN org_departments d ON r.department_id = d.id
        JOIN org_functions f ON d.function_id = f.id
        LEFT JOIN personas p ON p.source_role_id = r.id
        WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
        GROUP BY r.id
        HAVING COUNT(DISTINCT p.derived_archetype) BETWEEN 1 AND 3
    ) incomplete;

    IF incomplete_count > 0 THEN
        RAISE NOTICE 'Found % roles with incomplete MECE personas. Manual review needed.', incomplete_count;
    ELSE
        RAISE NOTICE 'All roles have complete MECE personas (4 archetypes each).';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these after migration to confirm success
-- ============================================================================

-- Verification 1: Commercial JTBD-Role Coverage
SELECT
    'Commercial JTBD-Role Coverage' as metric,
    COUNT(DISTINCT r.id) as total_roles,
    COUNT(DISTINCT jr.role_id) as mapped_roles,
    ROUND(COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0) * 100, 1) as coverage_pct
FROM org_functions f
JOIN org_departments d ON d.function_id = f.id
JOIN org_roles r ON r.department_id = d.id
LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
WHERE f.name = 'Commercial Organization';

-- Verification 2: New JTBDs Created
SELECT
    'New Commercial JTBDs' as metric,
    COUNT(*) as count
FROM jtbd
WHERE code LIKE 'COM-JTBD-0%'
AND code >= 'COM-JTBD-069';

-- Verification 3: Empty Departments
SELECT
    'Empty Departments' as metric,
    COUNT(*) as count
FROM org_departments d
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY d.id
HAVING COUNT(r.id) = 0;

-- Verification 4: Overall Completeness Summary
SELECT
    f.name as function_name,
    COUNT(DISTINCT d.id) as departments,
    COUNT(DISTINCT r.id) as roles,
    COUNT(DISTINCT p.id) as personas,
    COUNT(DISTINCT jr.role_id) as roles_with_jtbd,
    ROUND(COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0) * 100, 1) as jtbd_coverage_pct
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
LEFT JOIN personas p ON p.source_role_id = r.id
LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY f.name
ORDER BY f.name;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
