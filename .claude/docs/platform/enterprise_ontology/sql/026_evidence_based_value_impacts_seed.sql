-- ============================================================================
-- EVIDENCE-BASED VALUE IMPACTS SEED DATA (v7 - CORRECTED CONSTRAINTS)
-- Source: McKinsey, Deloitte, Industry Research (2024)
-- ============================================================================
--
-- VALID impact_type VALUES (CHECK constraint):
--   'time_savings', 'cost_reduction', 'quality_improvement',
--   'risk_reduction', 'revenue_increase'
--
-- VALID confidence_level VALUES (CHECK constraint):
--   'low', 'medium', 'high', 'validated'
--
-- DESIGN PRINCIPLES:
-- 1. Percentage-based metrics (scalable proxies for any organization)
-- 2. Per-FTE, per-project, per-task granularity
-- 3. Hours saved (convertible to $ using org's loaded cost)
-- 4. Actionable improvement benchmarks
-- 5. Linked to Value Driver tree for ROI rollup
--
-- ============================================================================

-- Pharma Enterprise Tenant ID: c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

-- Clear previous seed data
DELETE FROM jtbd_value_impacts WHERE assumptions LIKE '%Evidence-based seed%';

-- ===========================================
-- 1. KOL Engagement Planning - TIME SAVINGS
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '5bdb8e03-96ac-47da-9806-9bd6b4395839',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Reduce KOL engagement plan creation time from 8 hours to 3.5 hours per plan',
    'time_savings',
    8.0, 3.5, 56.0, 40.0, 45.0, 0,
    'hours_saved_per_task', 'high',
    'McKinsey 2024 - 50-80% productivity gains in knowledge work',
    'Evidence-based seed: 4.5 hours saved per KOL engagement plan. Multiply by annual task volume × loaded FTE cost for $ value.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-013';

-- ===========================================
-- 2. KOL Profiling - TIME SAVINGS
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '11111111-0001-0001-0001-000000000005',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Reduce KOL profile creation time from 6 hours to 1.2 hours per profile',
    'time_savings',
    6.0, 1.2, 80.0, 70.0, 20.0, 0,
    'hours_saved_per_task', 'validated',
    'McKinsey 2024 - Data synthesis automation 70-90% efficiency',
    'Evidence-based seed: 4.8 hours saved per KOL profile. AI automates publication mining, network analysis, engagement history.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-013';

-- ===========================================
-- 3. Field Medical Insights - QUALITY IMPROVEMENT
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '11111111-0001-0001-0001-000000000004',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Increase MSL interaction analysis coverage from 25% to 95%',
    'quality_improvement',
    25.0, 95.0, 280.0, 75.0, 15.0, 0,
    'percent_coverage', 'high',
    'McKinsey 2024 - AI enables comprehensive data analysis',
    'Evidence-based seed: From 25% to 95% interaction coverage. AI processes all CRM notes, call logs, meeting summaries.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-010';

-- ===========================================
-- 4. Cost-Effectiveness Modeling - TIME SAVINGS
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    'aae91164-2d2e-47d6-a423-24428071b0ad',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Reduce cost-effectiveness model development from 160 hours to 64 hours',
    'time_savings',
    160.0, 64.0, 60.0, 35.0, 50.0, 0,
    'hours_saved_per_deliverable', 'high',
    'Deloitte 2024 - AI cuts modeling time by up to 70%',
    'Evidence-based seed: 96 hours saved per CE model. AI accelerates literature review, parameter extraction, sensitivity analysis.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-010';

-- ===========================================
-- 5. Budget Impact Modeling - TIME SAVINGS
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '3b0f298d-ba36-4f6a-85ce-dca0ca0bba4d',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Reduce budget impact modeling cycle from 240 hours (6 weeks) to 100 hours (2.5 weeks)',
    'time_savings',
    240.0, 100.0, 58.0, 45.0, 40.0, 0,
    'hours_saved_per_cycle', 'high',
    'McKinsey 2024 - 60-70% lead time reduction in analytical workflows',
    'Evidence-based seed: 140 hours saved per BIM cycle. Faster payer submission, earlier market access.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-010';

-- ===========================================
-- 6. Value Proposition Development - REVENUE INCREASE
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '3bae84ee-3af6-4cf5-8286-cf3dd3af660c',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Improve stakeholder relevance score from 3.2/5.0 to 4.3/5.0',
    'revenue_increase',
    3.2, 4.3, 34.0, 20.0, 65.0, 0,
    'quality_score_delta', 'medium',
    'Industry research - AI-enhanced messaging improves stakeholder resonance',
    'Evidence-based seed: 1.1 point improvement in stakeholder relevance. AI analyzes payer priorities, HCP preferences.'
FROM value_drivers vd WHERE vd.code = 'VD-REV-021';

-- ===========================================
-- 7. Pricing Framework Design - TIME SAVINGS
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '2aa1f4f3-1a4a-4b83-a5d0-eb042b669d77',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Reduce pricing analysis time from 120 hours to 48 hours per analysis',
    'time_savings',
    120.0, 48.0, 60.0, 30.0, 55.0, 0,
    'hours_saved_per_analysis', 'high',
    'McKinsey 2024 - 50-80% productivity in strategic analysis',
    'Evidence-based seed: 72 hours saved per pricing analysis. AI accelerates competitive intelligence, reference pricing analysis.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-020';

-- ===========================================
-- 8. Launch Pricing - COST REDUCTION
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    'c2536dc7-8e2d-4c53-abd8-0a2f19e8d9a2',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Reduce pricing decision cycle from 14 weeks (560 hours) to 7 weeks (280 hours)',
    'cost_reduction',
    560.0, 280.0, 50.0, 35.0, 50.0, 0,
    'hours_saved_per_decision', 'high',
    'McKinsey 2024 - Productivity gains 50-80% in strategic functions',
    'Evidence-based seed: 280 hours (7 weeks) faster to pricing decision. Earlier market entry, reduced opportunity cost.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-020';

-- ===========================================
-- 9. Formulary Positioning - REVENUE INCREASE
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '57d4015b-6de6-423a-afd5-6c3c6dc42b17',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Improve formulary acceptance rate from 62% to 78% (+16 percentage points)',
    'revenue_increase',
    62.0, 78.0, 26.0, 25.0, 60.0, 0,
    'percentage_point_improvement', 'medium',
    'Industry benchmarks - AI-enhanced dossiers improve acceptance',
    'Evidence-based seed: 16 percentage point improvement. Better evidence presentation, targeted gap analysis.'
FROM value_drivers vd WHERE vd.code = 'VD-REV-012';

-- ===========================================
-- 10. Literature Monitoring - QUALITY IMPROVEMENT
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '11111111-0001-0001-0001-000000000002',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Increase literature review throughput from 50 to 500 publications per week (10x)',
    'quality_improvement',
    50.0, 500.0, 900.0, 80.0, 15.0, 0,
    'publications_per_week', 'validated',
    'McKinsey 2024 - AI enables 10x content processing',
    'Evidence-based seed: 10x more publications monitored. AI scans, filters, summarizes; humans review high-priority only.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-011';

-- ===========================================
-- 11. Medical Affairs ROI Tracking - COST REDUCTION
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '11111111-0001-0001-0001-000000000003',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Increase KPI auto-tracking from 30% to 85% of metrics',
    'cost_reduction',
    30.0, 85.0, 183.0, 75.0, 20.0, 0,
    'percent_automated', 'high',
    'McKinsey 2024 - Analytics automation 70-90% achievable',
    'Evidence-based seed: From 30% to 85% auto-tracked KPIs. Eliminates manual data entry, ensures real-time dashboards.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-010';

-- ===========================================
-- 12. Customer 360 - QUALITY IMPROVEMENT
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '22222222-0001-0001-0001-000000000001',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Improve customer data completeness from 45% to 88% field population',
    'quality_improvement',
    45.0, 88.0, 96.0, 60.0, 30.0, 0,
    'percent_complete', 'medium',
    'Industry research - AI data enrichment capabilities',
    'Evidence-based seed: From 45% to 88% data completeness. AI fills gaps, infers attributes, deduplicates records.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-020';

-- ===========================================
-- 13. Evidence-Payer Alignment - REVENUE INCREASE
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '22222222-0001-0001-0001-000000000002',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Improve evidence-payer question alignment from 40% to 75%',
    'revenue_increase',
    40.0, 75.0, 88.0, 25.0, 60.0, 0,
    'percent_aligned', 'medium',
    'McKinsey 2024 - AI improves strategic alignment',
    'Evidence-based seed: From 40% to 75% alignment. AI analyzes payer decisions, identifies evidence gaps.'
FROM value_drivers vd WHERE vd.code = 'VD-REV-021';

-- ===========================================
-- 14. Revenue Forecasting - RISK REDUCTION
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '22222222-0072-0001-0001-000000000001',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Reduce forecast error (MAPE) from 18% to 8%',
    'risk_reduction',
    18.0, 8.0, 56.0, 50.0, 40.0, 0,
    'error_reduction_percent', 'high',
    'Deloitte 2024 - AI improves forecast accuracy significantly',
    'Evidence-based seed: MAPE reduced from 18% to 8%. Better inventory planning, reduced stockouts/overstock.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-021';

-- ===========================================
-- 15. Commercial Strategy - TIME SAVINGS
-- ===========================================
INSERT INTO jtbd_value_impacts (
    jtbd_id, value_driver_id, tenant_id, impact_description, impact_type,
    baseline_metric, target_metric, improvement_pct,
    ai_automation_pct, ai_augmentation_pct, monetary_value,
    value_unit, confidence_level, calculation_method, assumptions
)
SELECT
    '22222222-0069-0001-0001-000000000001',
    vd.id,
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    'Increase strategic scenario analysis from 3 to 12 scenarios per quarter (4x)',
    'time_savings',
    3.0, 12.0, 300.0, 40.0, 50.0, 0,
    'scenarios_per_quarter', 'medium',
    'McKinsey 2024 - AI enables rapid scenario modeling',
    'Evidence-based seed: 4x more scenarios analyzed. Faster response to market changes, better strategic optionality.'
FROM value_drivers vd WHERE vd.code = 'VD-CST-020';

-- ============================================================================
-- SECTION 2: IMPACT BENCHMARKS
-- ============================================================================

INSERT INTO impact_benchmarks (
    impact_type, functional_area, typical_baseline, typical_improvement_pct,
    benchmark_source, industry
) VALUES
('time_savings', 'Medical Affairs', 4.0, 75.0,
 'McKinsey 2024 - Hours per literature review task. AI reduces from 4h to 1h.', 'pharmaceuticals'),
('time_savings', 'Field Medical', 6.0, 80.0,
 'McKinsey 2024 - Hours per KOL profile. AI reduces from 6h to 1.2h.', 'pharmaceuticals'),
('time_savings', 'Field Medical', 2.5, 60.0,
 'Industry benchmark - Hours per HCP meeting prep. AI reduces to 1h.', 'pharmaceuticals'),
('time_savings', 'Medical Information', 45.0, 50.0,
 'Industry benchmark - Minutes per inquiry. AI drafts reduce to 22 min.', 'pharmaceuticals'),
('time_savings', 'Medical Communications', 8.0, 55.0,
 'Industry benchmark - Hours per deck. AI generates first draft, reduces to 3.6h.', 'pharmaceuticals'),
('time_savings', 'HEOR', 160.0, 60.0,
 'Deloitte 2024 - Hours per CE model. AI reduces to 64h.', 'pharmaceuticals'),
('time_savings', 'HEOR', 240.0, 58.0,
 'McKinsey 2024 - Hours per BIM. AI reduces to 100h.', 'pharmaceuticals'),
('time_savings', 'Pricing', 120.0, 60.0,
 'McKinsey 2024 - Hours per pricing analysis. AI reduces to 48h.', 'pharmaceuticals'),
('cost_reduction', 'Commercial', 16.0, 70.0,
 'Industry benchmark - Hours per CI update. AI reduces to 4.8h.', 'pharmaceuticals'),
('risk_reduction', 'Commercial', 24.0, 50.0,
 'Deloitte 2024 - Hours per forecast refresh. AI reduces to 12h.', 'pharmaceuticals')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 3: BENEFIT MILESTONES
-- ============================================================================

DELETE FROM benefit_milestones
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
AND evidence_notes LIKE '%Evidence-based%';

INSERT INTO benefit_milestones (
    tenant_id, milestone_name, milestone_description, target_date,
    target_value, current_value, status, milestone_type, evidence_notes
) VALUES
('c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b',
 'MSL KOL Profiling: 80% Time Reduction',
 'Deploy AI-assisted KOL profiling. Target: 6h to 1.2h per profile',
 '2025-03-31', 80.0, 45.0, 'in_progress', 'efficiency',
 'Evidence-based: McKinsey 2024. Current: 45% achieved (3.3h/profile)'),
('c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b',
 'Literature Monitoring: 10x Throughput',
 'Implement AI literature scanning. Target: 50 to 500 pubs/week',
 '2025-04-30', 900.0, 0.0, 'not_started', 'throughput',
 'Evidence-based: McKinsey 2024. Measure: publications per week'),
('c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b',
 'HEOR Model Development: 60% Faster',
 'AI-assisted CE/BIM modeling. Target: 160h to 64h per model',
 '2025-06-30', 60.0, 0.0, 'not_started', 'efficiency',
 'Evidence-based: Deloitte 2024. Measure: hours per model'),
('c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b',
 'Forecast Accuracy: MAPE < 10%',
 'AI-enhanced forecasting. Target: MAPE from 18% to <10%',
 '2025-09-30', 56.0, 0.0, 'not_started', 'accuracy',
 'Evidence-based: Deloitte 2024. Measure: MAPE');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Evidence-Based Value Impacts v7 Complete' AS status,
       (SELECT COUNT(*) FROM jtbd_value_impacts WHERE assumptions LIKE '%Evidence-based seed%') AS value_impacts_created,
       (SELECT COUNT(*) FROM impact_benchmarks WHERE benchmark_source LIKE '%McKinsey%' OR benchmark_source LIKE '%Deloitte%') AS benchmarks_with_citations,
       (SELECT COUNT(*) FROM benefit_milestones WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') AS milestones_created;
