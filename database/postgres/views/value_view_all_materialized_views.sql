-- =====================================================================
-- VALUE VIEW MATERIALIZED VIEWS - Complete Set
-- =====================================================================
-- Purpose: Pre-computed aggregations for VITAL Platform Value View dashboard
-- Created: December 1, 2025
-- Maintained By: VITAL Data Strategist Agent
-- Refresh Schedule: See documentation for pg_cron configuration
-- =====================================================================

-- =====================================================================
-- 1. ODI OPPORTUNITY HEATMAP (Primary Dashboard View)
-- =====================================================================
-- Persona × JTBD opportunity matrix with full ontology context
-- Refresh: Daily (2am UTC)
-- Est. Rows: ~30,000 (43 personas × 700 JTBDs)
-- =====================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_value_view_odi_heatmap AS
SELECT
    -- Persona Context (L3)
    p.id AS persona_id,
    p.persona_name,
    p.archetype,
    p.ai_maturity_score,
    p.work_complexity_score,
    p.gen_ai_readiness_level,

    -- Role Context (L2)
    r.id AS role_id,
    r.role_name,
    r.seniority_level,

    -- Department Context (L2)
    d.id AS department_id,
    d.department_name,

    -- Function Context (L2)
    f.id AS function_id,
    f.function_name,

    -- Industry Context (L0)
    i.id AS industry_id,
    i.industry_name,

    -- JTBD Context (L4)
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.job_statement,
    j.complexity,
    j.frequency,
    j.job_type,
    j.job_category,

    -- ODI Metrics (L5)
    jos.importance_score,
    jos.satisfaction_score,
    jos.opportunity_score,
    jos.opportunity_classification,
    jos.sample_size AS odi_sample_size,
    jos.confidence_level AS odi_confidence,

    -- AI Layer (L6)
    ais.overall_score AS ai_suitability_score,
    ais.rag_score,
    ais.summary_score,
    ais.generation_score,
    ais.classification_score,
    ais.reasoning_score,
    ais.automation_score,
    ais.recommended_intervention_type,
    ais.recommended_service_layer,

    -- Value Layer (L7)
    vd.id AS primary_value_driver_id,
    vd.name AS primary_value_driver,
    vd.value_category,
    vd.value_type,

    -- Strategic Alignment (L1)
    string_agg(DISTINCT sp.code, ', ' ORDER BY sp.code) AS strategic_pillars,
    string_agg(DISTINCT sp.name, ', ' ORDER BY sp.code) AS strategic_pillar_names,

    -- Workflow Metrics (L6)
    COUNT(DISTINCT wt.id) AS workflow_count,
    AVG(wt.estimated_duration_hours) AS avg_workflow_duration_hours,
    SUM(wt.estimated_duration_hours) AS total_workflow_hours,

    -- Computed Metrics
    CASE
        WHEN jos.opportunity_score > 15 THEN 'critical'
        WHEN jos.opportunity_score >= 12 THEN 'high'
        WHEN jos.opportunity_score >= 8 THEN 'medium'
        ELSE 'low'
    END AS opportunity_priority,

    CASE
        WHEN ais.overall_score >= 0.8 THEN 'high'
        WHEN ais.overall_score >= 0.6 THEN 'medium'
        ELSE 'low'
    END AS ai_readiness,

    -- Metadata
    j.tenant_id,
    NOW() AS last_refreshed

FROM personas p
JOIN org_roles r ON r.id = p.role_id
JOIN org_departments d ON d.id = r.department_id
JOIN org_business_functions f ON f.id = d.function_id
JOIN industries i ON i.id = f.industry_id
JOIN jtbd_roles jr ON jr.role_id = r.id
JOIN jtbd j ON j.id = jr.jtbd_id
LEFT JOIN jtbd_odi_scores jos ON jos.jtbd_id = j.id AND jos.persona_id = p.id
LEFT JOIN jtbd_ai_suitability ais ON ais.jtbd_id = j.id
LEFT JOIN ref_opportunities ro ON ro.target_jtbd_id = j.id
LEFT JOIN ref_value_drivers vd ON vd.id = ro.primary_value_driver_id
LEFT JOIN jtbd_category_mappings jcm ON jcm.jtbd_id = j.id
LEFT JOIN strategic_pillars sp ON sp.id = jcm.pillar_id
LEFT JOIN workflow_templates wt ON wt.jtbd_id = j.id AND wt.status = 'active'

WHERE j.deleted_at IS NULL
  AND p.validation_status = 'published'
  AND r.is_active = TRUE

GROUP BY
    p.id, p.persona_name, p.archetype, p.ai_maturity_score, p.work_complexity_score, p.gen_ai_readiness_level,
    r.id, r.role_name, r.seniority_level,
    d.id, d.department_name,
    f.id, f.function_name,
    i.id, i.industry_name,
    j.id, j.code, j.name, j.job_statement, j.complexity, j.frequency, j.job_type, j.job_category, j.tenant_id,
    jos.importance_score, jos.satisfaction_score, jos.opportunity_score, jos.opportunity_classification,
    jos.sample_size, jos.confidence_level,
    ais.overall_score, ais.rag_score, ais.summary_score, ais.generation_score,
    ais.classification_score, ais.reasoning_score, ais.automation_score,
    ais.recommended_intervention_type, ais.recommended_service_layer,
    vd.id, vd.name, vd.value_category, vd.value_type;

-- Indexes for fast filtering
CREATE INDEX idx_mv_odi_heatmap_persona ON mv_value_view_odi_heatmap(persona_id);
CREATE INDEX idx_mv_odi_heatmap_persona_name ON mv_value_view_odi_heatmap(persona_name);
CREATE INDEX idx_mv_odi_heatmap_archetype ON mv_value_view_odi_heatmap(archetype);
CREATE INDEX idx_mv_odi_heatmap_role ON mv_value_view_odi_heatmap(role_id);
CREATE INDEX idx_mv_odi_heatmap_department ON mv_value_view_odi_heatmap(department_id);
CREATE INDEX idx_mv_odi_heatmap_function ON mv_value_view_odi_heatmap(function_id);
CREATE INDEX idx_mv_odi_heatmap_industry ON mv_value_view_odi_heatmap(industry_id);
CREATE INDEX idx_mv_odi_heatmap_jtbd ON mv_value_view_odi_heatmap(jtbd_id);
CREATE INDEX idx_mv_odi_heatmap_opp_score ON mv_value_view_odi_heatmap(opportunity_score DESC) WHERE opportunity_score IS NOT NULL;
CREATE INDEX idx_mv_odi_heatmap_opp_priority ON mv_value_view_odi_heatmap(opportunity_priority);
CREATE INDEX idx_mv_odi_heatmap_classification ON mv_value_view_odi_heatmap(opportunity_classification);
CREATE INDEX idx_mv_odi_heatmap_ai_suitability ON mv_value_view_odi_heatmap(ai_suitability_score DESC) WHERE ai_suitability_score IS NOT NULL;
CREATE INDEX idx_mv_odi_heatmap_service_layer ON mv_value_view_odi_heatmap(recommended_service_layer);
CREATE INDEX idx_mv_odi_heatmap_tenant ON mv_value_view_odi_heatmap(tenant_id);

COMMENT ON MATERIALIZED VIEW mv_value_view_odi_heatmap IS
'ODI Opportunity Heatmap: Persona × JTBD matrix with full ontology context (L0-L7). Refresh: Daily 2am UTC';

-- =====================================================================
-- 2. PERSONA DASHBOARD (Per-Persona Aggregated Metrics)
-- =====================================================================
-- Refresh: Daily (3am UTC)
-- Est. Rows: ~43 (one per persona)
-- =====================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_value_view_persona_dashboard AS
SELECT
    -- Persona Identity
    p.id AS persona_id,
    p.persona_name,
    p.archetype,
    p.ai_maturity_score,
    p.work_complexity_score,
    p.gen_ai_readiness_level,

    -- Context
    r.role_name,
    d.department_name,
    f.function_name,
    i.industry_name,

    -- JTBD Metrics
    COUNT(DISTINCT j.id) AS total_jtbd_count,
    COUNT(DISTINCT j.id) FILTER (WHERE j.complexity = 'high' OR j.complexity = 'very_high') AS high_complexity_jtbd_count,
    COUNT(DISTINCT j.id) FILTER (WHERE j.frequency = 'daily') AS daily_frequency_jtbd_count,
    COUNT(DISTINCT j.id) FILTER (WHERE j.frequency = 'weekly') AS weekly_frequency_jtbd_count,

    -- ODI Metrics (Aggregated)
    ROUND(AVG(jos.importance_score), 1) AS avg_importance_score,
    ROUND(AVG(jos.satisfaction_score), 1) AS avg_satisfaction_score,
    ROUND(AVG(jos.opportunity_score), 1) AS avg_opportunity_score,
    COUNT(DISTINCT jos.id) FILTER (WHERE jos.opportunity_classification = 'highly_underserved') AS highly_underserved_count,
    COUNT(DISTINCT jos.id) FILTER (WHERE jos.opportunity_classification = 'underserved') AS underserved_count,
    COUNT(DISTINCT jos.id) FILTER (WHERE jos.opportunity_score >= 12) AS high_priority_opportunity_count,

    -- AI Metrics
    ROUND(AVG(ais.overall_score), 2) AS avg_ai_suitability,
    ROUND(AVG(ais.automation_score), 2) AS avg_automation_score,
    COUNT(DISTINCT ais.id) FILTER (WHERE ais.overall_score >= 0.8) AS high_ai_readiness_count,
    COUNT(DISTINCT ais.id) FILTER (WHERE ais.recommended_service_layer = 'workflow') AS workflow_automation_count,

    -- Value Metrics (Estimated)
    COUNT(DISTINCT aio.id) AS ai_opportunity_count,
    SUM(aio.time_savings_hours_per_week) AS total_time_savings_hours_per_week,

    -- Workflow Metrics
    COUNT(DISTINCT wt.id) AS assigned_workflow_count,
    SUM(wt.estimated_duration_hours) AS total_workflow_hours,

    -- Strategic Alignment
    string_agg(DISTINCT sp.code, ', ' ORDER BY sp.code) AS aligned_strategic_pillars,

    -- Metadata
    p.tenant_id,
    NOW() AS last_refreshed

FROM personas p
JOIN org_roles r ON r.id = p.role_id
JOIN org_departments d ON d.id = r.department_id
JOIN org_business_functions f ON f.id = d.function_id
JOIN industries i ON i.id = f.industry_id
LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
LEFT JOIN jtbd j ON j.id = jr.jtbd_id AND j.deleted_at IS NULL
LEFT JOIN jtbd_odi_scores jos ON jos.jtbd_id = j.id AND jos.persona_id = p.id
LEFT JOIN jtbd_ai_suitability ais ON ais.jtbd_id = j.id
LEFT JOIN ai_opportunities aio ON aio.jtbd_id = j.id
LEFT JOIN workflow_templates wt ON wt.jtbd_id = j.id AND wt.status = 'active'
LEFT JOIN jtbd_category_mappings jcm ON jcm.jtbd_id = j.id
LEFT JOIN strategic_pillars sp ON sp.id = jcm.pillar_id

WHERE p.validation_status = 'published'
  AND r.is_active = TRUE

GROUP BY
    p.id, p.persona_name, p.archetype, p.ai_maturity_score, p.work_complexity_score, p.gen_ai_readiness_level,
    r.role_name, d.department_name, f.function_name, i.industry_name, p.tenant_id;

CREATE INDEX idx_mv_persona_dashboard_persona ON mv_value_view_persona_dashboard(persona_id);
CREATE INDEX idx_mv_persona_dashboard_archetype ON mv_value_view_persona_dashboard(archetype);
CREATE INDEX idx_mv_persona_dashboard_role ON mv_value_view_persona_dashboard(role_name);
CREATE INDEX idx_mv_persona_dashboard_dept ON mv_value_view_persona_dashboard(department_name);
CREATE INDEX idx_mv_persona_dashboard_function ON mv_value_view_persona_dashboard(function_name);
CREATE INDEX idx_mv_persona_dashboard_avg_opp ON mv_value_view_persona_dashboard(avg_opportunity_score DESC);
CREATE INDEX idx_mv_persona_dashboard_tenant ON mv_value_view_persona_dashboard(tenant_id);

COMMENT ON MATERIALIZED VIEW mv_value_view_persona_dashboard IS
'Persona Dashboard: Aggregated metrics per persona across all ontology layers. Refresh: Daily 3am UTC';

-- =====================================================================
-- 3. WORKFLOW ANALYTICS (Workflow-Level Metrics)
-- =====================================================================
-- Refresh: Daily (4am UTC)
-- Est. Rows: ~400 (one per workflow template)
-- =====================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_value_view_workflow_analytics AS
SELECT
    -- Workflow Identity
    wt.id AS workflow_id,
    wt.name AS workflow_name,
    wt.description,
    wt.status,
    wt.automation_level,

    -- JTBD Context
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.complexity AS jtbd_complexity,
    j.frequency AS jtbd_frequency,

    -- Workflow Structure Metrics
    COUNT(DISTINCT ws.id) AS stage_count,
    COUNT(DISTINCT wts.id) AS task_count,
    COUNT(DISTINCT wts.id) FILTER (WHERE wts.requires_human_approval = TRUE) AS human_approval_task_count,
    COUNT(DISTINCT wts.id) FILTER (WHERE wts.ai_agent_id IS NOT NULL) AS ai_automated_task_count,

    -- Effort Metrics
    wt.estimated_duration_hours,
    SUM(wts.estimated_duration_minutes) / 60.0 AS total_task_hours,
    AVG(wts.estimated_duration_minutes) AS avg_task_duration_minutes,

    -- Tools & Skills
    COUNT(DISTINCT wtt.tool_id) AS required_tools_count,
    COUNT(DISTINCT wtsk.skill_id) AS required_skills_count,

    -- AI Metrics
    ais.overall_score AS jtbd_ai_suitability,
    ais.automation_score AS jtbd_automation_score,
    ais.recommended_service_layer,

    -- Value Metrics
    vd.name AS primary_value_driver,
    vd.value_category,

    -- Strategic Alignment
    string_agg(DISTINCT sp.code, ', ' ORDER BY sp.code) AS strategic_pillars,

    -- Assigned Roles
    COUNT(DISTINCT rw.role_id) AS assigned_role_count,

    -- Metadata
    wt.tenant_id,
    wt.created_at,
    wt.updated_at,
    NOW() AS last_refreshed

FROM workflow_templates wt
LEFT JOIN jtbd j ON j.id = wt.jtbd_id
LEFT JOIN workflow_stages ws ON ws.workflow_template_id = wt.id
LEFT JOIN workflow_tasks wts ON wts.workflow_stage_id = ws.id
LEFT JOIN workflow_task_tools wtt ON wtt.workflow_task_id = wts.id
LEFT JOIN workflow_task_skills wtsk ON wtsk.workflow_task_id = wts.id
LEFT JOIN jtbd_ai_suitability ais ON ais.jtbd_id = j.id
LEFT JOIN ref_opportunities ro ON ro.target_workflow_id = wt.id
LEFT JOIN ref_value_drivers vd ON vd.id = ro.primary_value_driver_id
LEFT JOIN jtbd_category_mappings jcm ON jcm.jtbd_id = j.id
LEFT JOIN strategic_pillars sp ON sp.id = jcm.pillar_id
LEFT JOIN role_workflows rw ON rw.workflow_id = wt.id

WHERE wt.status IN ('active', 'published')
  AND (j.deleted_at IS NULL OR j.id IS NULL)

GROUP BY
    wt.id, wt.name, wt.description, wt.status, wt.automation_level, wt.estimated_duration_hours,
    wt.tenant_id, wt.created_at, wt.updated_at,
    j.id, j.code, j.name, j.complexity, j.frequency,
    ais.overall_score, ais.automation_score, ais.recommended_service_layer,
    vd.name, vd.value_category;

CREATE INDEX idx_mv_workflow_analytics_workflow ON mv_value_view_workflow_analytics(workflow_id);
CREATE INDEX idx_mv_workflow_analytics_jtbd ON mv_value_view_workflow_analytics(jtbd_id);
CREATE INDEX idx_mv_workflow_analytics_status ON mv_value_view_workflow_analytics(status);
CREATE INDEX idx_mv_workflow_analytics_automation ON mv_value_view_workflow_analytics(automation_level);
CREATE INDEX idx_mv_workflow_analytics_service_layer ON mv_value_view_workflow_analytics(recommended_service_layer);
CREATE INDEX idx_mv_workflow_analytics_tenant ON mv_value_view_workflow_analytics(tenant_id);

COMMENT ON MATERIALIZED VIEW mv_value_view_workflow_analytics IS
'Workflow Analytics: Aggregated metrics per workflow with JTBD, AI, and value context. Refresh: Daily 4am UTC';

-- =====================================================================
-- 4. STRATEGIC ALIGNMENT (Strategic Pillar → JTBD Mapping)
-- =====================================================================
-- Refresh: Weekly (Sun 1am UTC)
-- Est. Rows: ~7 (one per strategic pillar)
-- =====================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_value_view_strategic_alignment AS
SELECT
    -- Strategic Pillar
    sp.id AS pillar_id,
    sp.code AS pillar_code,
    sp.name AS pillar_name,
    sp.description,
    sp.sequence_order,

    -- JTBD Metrics
    COUNT(DISTINCT j.id) AS total_jtbd_count,
    COUNT(DISTINCT j.id) FILTER (WHERE j.complexity = 'high' OR j.complexity = 'very_high') AS high_complexity_jtbd_count,
    COUNT(DISTINCT j.id) FILTER (WHERE j.frequency IN ('daily', 'weekly')) AS high_frequency_jtbd_count,

    -- ODI Metrics
    ROUND(AVG(jos.opportunity_score), 1) AS avg_opportunity_score,
    COUNT(DISTINCT jos.id) FILTER (WHERE jos.opportunity_classification = 'highly_underserved') AS highly_underserved_count,

    -- AI Metrics
    ROUND(AVG(ais.overall_score), 2) AS avg_ai_suitability,
    COUNT(DISTINCT ais.id) FILTER (WHERE ais.overall_score >= 0.8) AS high_ai_readiness_count,

    -- Workflow Metrics
    COUNT(DISTINCT wt.id) AS workflow_count,
    SUM(wt.estimated_duration_hours) AS total_workflow_hours,

    -- Opportunity Metrics
    COUNT(DISTINCT aio.id) AS ai_opportunity_count,
    SUM(aio.time_savings_hours_per_week) AS total_time_savings_hours_per_week,

    -- Roles & Personas
    COUNT(DISTINCT jr.role_id) AS impacted_role_count,
    COUNT(DISTINCT jos.persona_id) AS impacted_persona_count,

    -- Functions & Departments
    COUNT(DISTINCT jf.function_id) AS impacted_function_count,
    COUNT(DISTINCT jd.department_id) AS impacted_department_count,

    -- Metadata
    sp.tenant_id,
    NOW() AS last_refreshed

FROM strategic_pillars sp
LEFT JOIN jtbd_category_mappings jcm ON jcm.pillar_id = sp.id
LEFT JOIN jtbd j ON j.id = jcm.jtbd_id AND j.deleted_at IS NULL
LEFT JOIN jtbd_odi_scores jos ON jos.jtbd_id = j.id
LEFT JOIN jtbd_ai_suitability ais ON ais.jtbd_id = j.id
LEFT JOIN workflow_templates wt ON wt.jtbd_id = j.id AND wt.status = 'active'
LEFT JOIN ai_opportunities aio ON aio.jtbd_id = j.id
LEFT JOIN jtbd_roles jr ON jr.jtbd_id = j.id
LEFT JOIN jtbd_functions jf ON jf.jtbd_id = j.id
LEFT JOIN jtbd_departments jd ON jd.jtbd_id = j.id

GROUP BY sp.id, sp.code, sp.name, sp.description, sp.sequence_order, sp.tenant_id
ORDER BY sp.sequence_order;

CREATE INDEX idx_mv_strategic_alignment_pillar ON mv_value_view_strategic_alignment(pillar_id);
CREATE INDEX idx_mv_strategic_alignment_code ON mv_value_view_strategic_alignment(pillar_code);
CREATE INDEX idx_mv_strategic_alignment_tenant ON mv_value_view_strategic_alignment(tenant_id);

COMMENT ON MATERIALIZED VIEW mv_value_view_strategic_alignment IS
'Strategic Alignment: JTBD and opportunity metrics per strategic pillar (L1). Refresh: Weekly Sun 1am UTC';

-- =====================================================================
-- 5. VALUE REALIZATION (Realized Benefits Tracking)
-- =====================================================================
-- Refresh: Daily (5am UTC)
-- Est. Rows: ~5,000 (benefit tracking records)
-- =====================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_value_view_value_realization AS
SELECT
    -- Opportunity
    ro.id AS opportunity_id,
    ro.unique_id AS opportunity_code,
    ro.name AS opportunity_name,
    ro.opportunity_category,
    ro.intervention_type,

    -- Value Driver
    vd.id AS value_driver_id,
    vd.name AS value_driver_name,
    vd.value_category,
    vd.value_type,

    -- ROI Metrics
    oroi.implementation_cost,
    oroi.expected_annual_benefit,
    oroi.roi_percentage,
    oroi.payback_period_months,
    oroi.fte_saved_ongoing,
    oroi.status AS roi_status,

    -- Realized Benefits
    COUNT(DISTINCT bt.id) AS benefit_tracking_count,
    SUM(bt.improvement_absolute) AS total_improvement_absolute,
    AVG(bt.improvement_percentage) AS avg_improvement_percentage,

    -- Impact Metrics
    im.name AS primary_impact_metric,
    im.unit AS metric_unit,
    AVG(bt.baseline_value) AS avg_baseline_value,
    AVG(bt.current_value) AS avg_current_value,
    AVG(bt.target_value) AS avg_target_value,

    -- Context
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,

    -- Strategic Alignment
    string_agg(DISTINCT sp.code, ', ' ORDER BY sp.code) AS strategic_pillars,

    -- Timeline
    oroi.benefit_realization_start,
    MIN(bt.measurement_period_start) AS first_measurement_date,
    MAX(bt.measurement_period_end) AS latest_measurement_date,

    -- Metadata
    ro.tenant_id,
    NOW() AS last_refreshed

FROM ref_opportunities ro
LEFT JOIN ref_value_drivers vd ON vd.id = ro.primary_value_driver_id
LEFT JOIN opportunity_roi oroi ON oroi.opportunity_id = ro.id
LEFT JOIN benefit_tracking bt ON bt.opportunity_id = ro.id
LEFT JOIN ref_impact_metrics im ON im.id = bt.impact_metric_id
LEFT JOIN jtbd j ON j.id = ro.target_jtbd_id
LEFT JOIN jtbd_category_mappings jcm ON jcm.jtbd_id = j.id
LEFT JOIN strategic_pillars sp ON sp.id = jcm.pillar_id

WHERE ro.is_active = TRUE

GROUP BY
    ro.id, ro.unique_id, ro.name, ro.opportunity_category, ro.intervention_type, ro.tenant_id,
    vd.id, vd.name, vd.value_category, vd.value_type,
    oroi.implementation_cost, oroi.expected_annual_benefit, oroi.roi_percentage,
    oroi.payback_period_months, oroi.fte_saved_ongoing, oroi.status,
    oroi.benefit_realization_start,
    im.name, im.unit,
    j.id, j.code, j.name;

CREATE INDEX idx_mv_value_realization_opp ON mv_value_view_value_realization(opportunity_id);
CREATE INDEX idx_mv_value_realization_jtbd ON mv_value_view_value_realization(jtbd_id);
CREATE INDEX idx_mv_value_realization_vd ON mv_value_view_value_realization(value_driver_id);
CREATE INDEX idx_mv_value_realization_roi ON mv_value_view_value_realization(roi_percentage DESC) WHERE roi_percentage IS NOT NULL;
CREATE INDEX idx_mv_value_realization_status ON mv_value_view_value_realization(roi_status);
CREATE INDEX idx_mv_value_realization_tenant ON mv_value_view_value_realization(tenant_id);

COMMENT ON MATERIALIZED VIEW mv_value_view_value_realization IS
'Value Realization: Realized benefits and ROI tracking for opportunities (L7). Refresh: Daily 5am UTC';

-- =====================================================================
-- 6. JTBD SUMMARY (Master JTBD List with Aggregates)
-- =====================================================================
-- Refresh: Hourly
-- Est. Rows: ~700 (one per JTBD)
-- =====================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_value_view_jtbd_summary AS
SELECT
    -- JTBD Identity
    j.id AS jtbd_id,
    j.code,
    j.name,
    j.job_statement,
    j.complexity,
    j.frequency,
    j.job_type,
    j.job_category,
    j.priority_score,
    j.status,

    -- Organizational Scope
    COUNT(DISTINCT jf.function_id) AS function_count,
    COUNT(DISTINCT jd.department_id) AS department_count,
    COUNT(DISTINCT jr.role_id) AS role_count,
    string_agg(DISTINCT jf.function_name, ', ' ORDER BY jf.function_name) AS functions,

    -- Persona Engagement
    COUNT(DISTINCT jos.persona_id) AS persona_count,
    COUNT(DISTINCT jos.persona_id) FILTER (WHERE jos.archetype = 'AUTOMATOR') AS automator_count,
    COUNT(DISTINCT jos.persona_id) FILTER (WHERE jos.archetype = 'ORCHESTRATOR') AS orchestrator_count,

    -- ODI Metrics
    ROUND(AVG(jos.importance_score), 1) AS avg_importance,
    ROUND(AVG(jos.satisfaction_score), 1) AS avg_satisfaction,
    ROUND(AVG(jos.opportunity_score), 1) AS avg_opportunity_score,
    COUNT(DISTINCT jos.id) FILTER (WHERE jos.opportunity_classification = 'highly_underserved') AS highly_underserved_persona_count,

    -- AI Metrics
    ais.overall_score AS ai_suitability,
    ais.automation_score,
    ais.recommended_intervention_type,
    ais.recommended_service_layer,

    -- Opportunities
    COUNT(DISTINCT aio.id) AS ai_opportunity_count,
    SUM(aio.time_savings_hours_per_week) AS total_time_savings_hours_per_week,

    -- Workflows
    COUNT(DISTINCT wt.id) AS workflow_count,
    SUM(wt.estimated_duration_hours) AS total_workflow_hours,

    -- Strategic Alignment
    string_agg(DISTINCT sp.code, ', ' ORDER BY sp.code) AS strategic_pillars,

    -- Metadata
    j.tenant_id,
    NOW() AS last_refreshed

FROM jtbd j
LEFT JOIN jtbd_functions jf ON jf.jtbd_id = j.id
LEFT JOIN jtbd_departments jd ON jd.jtbd_id = j.id
LEFT JOIN jtbd_roles jr ON jr.jtbd_id = j.id
LEFT JOIN jtbd_odi_scores jos ON jos.jtbd_id = j.id
LEFT JOIN jtbd_ai_suitability ais ON ais.jtbd_id = j.id
LEFT JOIN ai_opportunities aio ON aio.jtbd_id = j.id
LEFT JOIN workflow_templates wt ON wt.jtbd_id = j.id AND wt.status = 'active'
LEFT JOIN jtbd_category_mappings jcm ON jcm.jtbd_id = j.id
LEFT JOIN strategic_pillars sp ON sp.id = jcm.pillar_id

WHERE j.deleted_at IS NULL
  AND j.status IN ('validated', 'active')

GROUP BY
    j.id, j.code, j.name, j.job_statement, j.complexity, j.frequency,
    j.job_type, j.job_category, j.priority_score, j.status, j.tenant_id,
    ais.overall_score, ais.automation_score, ais.recommended_intervention_type, ais.recommended_service_layer;

CREATE INDEX idx_mv_jtbd_summary_jtbd ON mv_value_view_jtbd_summary(jtbd_id);
CREATE INDEX idx_mv_jtbd_summary_code ON mv_value_view_jtbd_summary(code);
CREATE INDEX idx_mv_jtbd_summary_complexity ON mv_value_view_jtbd_summary(complexity);
CREATE INDEX idx_mv_jtbd_summary_frequency ON mv_value_view_jtbd_summary(frequency);
CREATE INDEX idx_mv_jtbd_summary_ai_suitability ON mv_value_view_jtbd_summary(ai_suitability DESC) WHERE ai_suitability IS NOT NULL;
CREATE INDEX idx_mv_jtbd_summary_avg_opp ON mv_value_view_jtbd_summary(avg_opportunity_score DESC) WHERE avg_opportunity_score IS NOT NULL;
CREATE INDEX idx_mv_jtbd_summary_service_layer ON mv_value_view_jtbd_summary(recommended_service_layer);
CREATE INDEX idx_mv_jtbd_summary_tenant ON mv_value_view_jtbd_summary(tenant_id);

COMMENT ON MATERIALIZED VIEW mv_value_view_jtbd_summary IS
'JTBD Summary: Master JTBD list with aggregated ODI, AI, and organizational metrics. Refresh: Hourly';

-- =====================================================================
-- REFRESH SCHEDULE (pg_cron)
-- =====================================================================
-- Run this after creating all materialized views
-- =====================================================================

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily refreshes (staggered)
SELECT cron.schedule('refresh-odi-heatmap', '0 2 * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_odi_heatmap');

SELECT cron.schedule('refresh-persona-dashboard', '0 3 * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_persona_dashboard');

SELECT cron.schedule('refresh-workflow-analytics', '0 4 * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_workflow_analytics');

SELECT cron.schedule('refresh-value-realization', '0 5 * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_value_realization');

-- Weekly refresh for stable data
SELECT cron.schedule('refresh-strategic-alignment', '0 1 * * 0',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_strategic_alignment');

-- Hourly refresh for frequently changing data
SELECT cron.schedule('refresh-jtbd-summary', '0 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_jtbd_summary');

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Check materialized view sizes
SELECT
    schemaname,
    matviewname,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) AS size,
    last_refresh
FROM pg_matviews
WHERE matviewname LIKE 'mv_value_view_%'
ORDER BY matviewname;

-- Check row counts
SELECT 'mv_value_view_odi_heatmap' AS view_name, COUNT(*) AS row_count FROM mv_value_view_odi_heatmap
UNION ALL
SELECT 'mv_value_view_persona_dashboard', COUNT(*) FROM mv_value_view_persona_dashboard
UNION ALL
SELECT 'mv_value_view_workflow_analytics', COUNT(*) FROM mv_value_view_workflow_analytics
UNION ALL
SELECT 'mv_value_view_strategic_alignment', COUNT(*) FROM mv_value_view_strategic_alignment
UNION ALL
SELECT 'mv_value_view_value_realization', COUNT(*) FROM mv_value_view_value_realization
UNION ALL
SELECT 'mv_value_view_jtbd_summary', COUNT(*) FROM mv_value_view_jtbd_summary;

-- =====================================================================
-- MANUAL REFRESH COMMANDS (for testing)
-- =====================================================================

-- Refresh all views (run in order)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_strategic_alignment;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_jtbd_summary;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_workflow_analytics;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_persona_dashboard;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_odi_heatmap;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_value_realization;
