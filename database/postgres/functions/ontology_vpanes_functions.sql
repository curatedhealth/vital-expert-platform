-- =============================================================================
-- VITAL Platform - L7 Value Database Functions
-- Ontology Layer 7: VPANES Scoring and Value Transformation
-- =============================================================================
-- Version: 1.0.0
-- Created: 2025-12-17
-- Description: Database functions for VPANES scoring, ROI calculation,
--              and value realization tracking
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Function: Calculate VPANES Total Score
-- Sums all 6 VPANES dimensions (0-60 range)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_vpanes_total(
    p_value_score NUMERIC,
    p_pain_score NUMERIC,
    p_adoption_score NUMERIC,
    p_network_score NUMERIC,
    p_ease_score NUMERIC,
    p_strategic_score NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    RETURN COALESCE(p_value_score, 0) +
           COALESCE(p_pain_score, 0) +
           COALESCE(p_adoption_score, 0) +
           COALESCE(p_network_score, 0) +
           COALESCE(p_ease_score, 0) +
           COALESCE(p_strategic_score, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_vpanes_total IS
'Calculate total VPANES score (0-60) from 6 dimensions.
VPANES = Value + Pain + Adoption + Network + Ease + Strategic.';


-- -----------------------------------------------------------------------------
-- Function: Calculate VPANES Normalized Score
-- Converts total score to 0-100 scale
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_vpanes_normalized(
    p_total_score NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND((p_total_score / 60.0) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_vpanes_normalized IS
'Normalize VPANES score from 0-60 to 0-100 scale.';


-- -----------------------------------------------------------------------------
-- Function: Classify VPANES Priority
-- Returns priority classification based on normalized score
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION classify_vpanes_priority(
    p_normalized_score NUMERIC
) RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN p_normalized_score >= 75 THEN 'high_priority'
        WHEN p_normalized_score >= 50 THEN 'medium_priority'
        ELSE 'low_priority'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION classify_vpanes_priority IS
'Classify VPANES priority: high_priority (>=75), medium_priority (>=50), low_priority (<50).';


-- -----------------------------------------------------------------------------
-- Function: Get VPANES Score with Calculated Fields
-- Returns VPANES score with total, normalized, and classification
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_vpanes_score(
    p_tenant_id UUID,
    p_jtbd_id UUID
) RETURNS TABLE (
    id UUID,
    jtbd_id UUID,
    value_score NUMERIC,
    value_rationale TEXT,
    value_category TEXT,
    pain_score NUMERIC,
    pain_rationale TEXT,
    adoption_score NUMERIC,
    adoption_rationale TEXT,
    network_score NUMERIC,
    network_rationale TEXT,
    ease_score NUMERIC,
    ease_rationale TEXT,
    strategic_score NUMERIC,
    strategic_rationale TEXT,
    intervention_type TEXT,
    ai_suitability_score NUMERIC,
    total_score NUMERIC,
    normalized_score NUMERIC,
    priority_classification TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
DECLARE
    v_total NUMERIC;
    v_normalized NUMERIC;
BEGIN
    RETURN QUERY
    SELECT
        vs.id,
        vs.jtbd_id,
        vs.value_score,
        vs.value_rationale,
        vs.value_category,
        vs.pain_score,
        vs.pain_rationale,
        vs.adoption_score,
        vs.adoption_rationale,
        vs.network_score,
        vs.network_rationale,
        vs.ease_score,
        vs.ease_rationale,
        vs.strategic_score,
        vs.strategic_rationale,
        vs.intervention_type,
        vs.ai_suitability_score,
        calculate_vpanes_total(
            vs.value_score, vs.pain_score, vs.adoption_score,
            vs.network_score, vs.ease_score, vs.strategic_score
        ) as total_score,
        calculate_vpanes_normalized(
            calculate_vpanes_total(
                vs.value_score, vs.pain_score, vs.adoption_score,
                vs.network_score, vs.ease_score, vs.strategic_score
            )
        ) as normalized_score,
        classify_vpanes_priority(
            calculate_vpanes_normalized(
                calculate_vpanes_total(
                    vs.value_score, vs.pain_score, vs.adoption_score,
                    vs.network_score, vs.ease_score, vs.strategic_score
                )
            )
        ) as priority_classification,
        vs.created_at,
        vs.updated_at
    FROM vpanes_scores vs
    WHERE vs.tenant_id = p_tenant_id
    AND vs.jtbd_id = p_jtbd_id
    ORDER BY vs.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_vpanes_score IS
'Get VPANES score for a JTBD with calculated total, normalized score, and priority classification.';


-- -----------------------------------------------------------------------------
-- Function: Get Top VPANES Opportunities
-- Returns JTBDs ranked by VPANES score
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_top_vpanes_opportunities(
    p_tenant_id UUID,
    p_value_category TEXT DEFAULT NULL,
    p_min_score NUMERIC DEFAULT 0,
    p_limit INT DEFAULT 10
) RETURNS TABLE (
    jtbd_id UUID,
    jtbd_name TEXT,
    jtbd_code TEXT,
    value_score NUMERIC,
    pain_score NUMERIC,
    adoption_score NUMERIC,
    network_score NUMERIC,
    ease_score NUMERIC,
    strategic_score NUMERIC,
    total_score NUMERIC,
    normalized_score NUMERIC,
    priority_classification TEXT,
    value_category TEXT,
    intervention_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.id as jtbd_id,
        j.name as jtbd_name,
        j.code as jtbd_code,
        vs.value_score,
        vs.pain_score,
        vs.adoption_score,
        vs.network_score,
        vs.ease_score,
        vs.strategic_score,
        calculate_vpanes_total(
            vs.value_score, vs.pain_score, vs.adoption_score,
            vs.network_score, vs.ease_score, vs.strategic_score
        ) as total_score,
        calculate_vpanes_normalized(
            calculate_vpanes_total(
                vs.value_score, vs.pain_score, vs.adoption_score,
                vs.network_score, vs.ease_score, vs.strategic_score
            )
        ) as normalized_score,
        classify_vpanes_priority(
            calculate_vpanes_normalized(
                calculate_vpanes_total(
                    vs.value_score, vs.pain_score, vs.adoption_score,
                    vs.network_score, vs.ease_score, vs.strategic_score
                )
            )
        ) as priority_classification,
        vs.value_category,
        vs.intervention_type
    FROM vpanes_scores vs
    JOIN jtbds j ON j.id = vs.jtbd_id
    WHERE vs.tenant_id = p_tenant_id
    AND (p_value_category IS NULL OR vs.value_category = p_value_category)
    AND calculate_vpanes_normalized(
        calculate_vpanes_total(
            vs.value_score, vs.pain_score, vs.adoption_score,
            vs.network_score, vs.ease_score, vs.strategic_score
        )
    ) >= p_min_score
    ORDER BY calculate_vpanes_total(
        vs.value_score, vs.pain_score, vs.adoption_score,
        vs.network_score, vs.ease_score, vs.strategic_score
    ) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_top_vpanes_opportunities IS
'Get top VPANES opportunities ranked by total score, optionally filtered by category.';


-- -----------------------------------------------------------------------------
-- Function: Calculate ROI Metrics
-- Calculates all derived ROI metrics from base inputs
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_roi_metrics(
    p_time_saved_hours_per_week NUMERIC,
    p_hourly_rate NUMERIC DEFAULT 150.0,
    p_implementation_cost NUMERIC DEFAULT 0,
    p_annual_operating_cost NUMERIC DEFAULT 0,
    p_training_cost NUMERIC DEFAULT 0,
    p_other_cost_savings NUMERIC DEFAULT 0
) RETURNS TABLE (
    time_saved_annual_hours NUMERIC,
    fte_equivalent NUMERIC,
    annual_labor_savings NUMERIC,
    total_annual_savings NUMERIC,
    total_investment NUMERIC,
    net_annual_benefit NUMERIC,
    roi_percent NUMERIC,
    payback_months NUMERIC,
    npv_3_year NUMERIC
) AS $$
DECLARE
    v_annual_hours NUMERIC;
    v_labor_savings NUMERIC;
    v_total_savings NUMERIC;
    v_investment NUMERIC;
    v_net_benefit NUMERIC;
    v_roi NUMERIC;
    v_payback NUMERIC;
    v_npv NUMERIC;
    v_discount_rate NUMERIC := 0.10;
BEGIN
    -- Calculate derived values
    v_annual_hours := p_time_saved_hours_per_week * 52;
    v_labor_savings := v_annual_hours * p_hourly_rate;
    v_total_savings := v_labor_savings + p_other_cost_savings;
    v_investment := p_implementation_cost + p_training_cost;
    v_net_benefit := v_total_savings - p_annual_operating_cost;

    -- ROI calculation
    IF v_investment > 0 THEN
        v_roi := ((v_net_benefit - v_investment) / v_investment) * 100;
        IF v_net_benefit > 0 THEN
            v_payback := v_investment / (v_net_benefit / 12);
        ELSE
            v_payback := 999;  -- Indicates never pays back
        END IF;
    ELSE
        v_roi := 0;
        v_payback := 0;
    END IF;

    -- NPV calculation (3-year, 10% discount rate)
    v_npv := (v_net_benefit / POWER(1 + v_discount_rate, 1)) +
             (v_net_benefit / POWER(1 + v_discount_rate, 2)) +
             (v_net_benefit / POWER(1 + v_discount_rate, 3)) -
             v_investment;

    RETURN QUERY SELECT
        v_annual_hours,
        ROUND(v_annual_hours / 2080, 2),  -- FTE equivalent
        ROUND(v_labor_savings, 2),
        ROUND(v_total_savings, 2),
        v_investment,
        ROUND(v_net_benefit, 2),
        ROUND(v_roi, 2),
        ROUND(v_payback, 1),
        ROUND(v_npv, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_roi_metrics IS
'Calculate all derived ROI metrics from base inputs.
Includes FTE equivalent, ROI percentage, payback period, and 3-year NPV.';


-- -----------------------------------------------------------------------------
-- Function: Get ROI Summary
-- Returns aggregated ROI metrics for a tenant
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_roi_summary(
    p_tenant_id UUID
) RETURNS TABLE (
    total_estimates INT,
    total_annual_savings NUMERIC,
    total_investment NUMERIC,
    avg_roi_percent NUMERIC,
    avg_payback_months NUMERIC,
    total_fte_equivalent NUMERIC,
    total_npv_3_year NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INT as total_estimates,
        ROUND(SUM(re.total_annual_savings), 2) as total_annual_savings,
        ROUND(SUM(re.total_investment), 2) as total_investment,
        ROUND(AVG(re.roi_percent), 2) as avg_roi_percent,
        ROUND(AVG(re.payback_months), 1) as avg_payback_months,
        ROUND(SUM(re.fte_equivalent), 2) as total_fte_equivalent,
        ROUND(SUM(re.npv_3_year), 2) as total_npv_3_year
    FROM roi_estimates re
    WHERE re.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_roi_summary IS
'Get aggregated ROI summary for all estimates in a tenant.';


-- -----------------------------------------------------------------------------
-- Function: Get Value Realization Summary
-- Returns aggregated value realization metrics
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_value_realization_summary(
    p_tenant_id UUID,
    p_days INT DEFAULT 30
) RETURNS TABLE (
    total_realizations INT,
    total_time_saved_minutes NUMERIC,
    total_time_saved_hours NUMERIC,
    avg_satisfaction NUMERIC,
    avg_value_score NUMERIC,
    recommendation_rate NUMERIC,
    value_by_category JSONB
) AS $$
DECLARE
    v_since TIMESTAMPTZ;
BEGIN
    v_since := NOW() - (p_days || ' days')::INTERVAL;

    RETURN QUERY
    SELECT
        COUNT(*)::INT as total_realizations,
        ROUND(SUM(vr.actual_time_saved_minutes), 2) as total_time_saved_minutes,
        ROUND(SUM(vr.actual_time_saved_minutes) / 60, 2) as total_time_saved_hours,
        ROUND(AVG(vr.user_satisfaction), 2) as avg_satisfaction,
        ROUND(AVG(vr.value_score), 2) as avg_value_score,
        ROUND(
            COUNT(CASE WHEN vr.would_recommend THEN 1 END)::NUMERIC /
            NULLIF(COUNT(*), 0),
            2
        ) as recommendation_rate,
        COALESCE(
            (SELECT jsonb_object_agg(cat, cnt)
             FROM (
                 SELECT unnest(vr2.value_categories) as cat, COUNT(*) as cnt
                 FROM value_realizations vr2
                 WHERE vr2.tenant_id = p_tenant_id
                 AND vr2.created_at >= v_since
                 GROUP BY cat
             ) sub),
            '{}'::JSONB
        ) as value_by_category
    FROM value_realizations vr
    WHERE vr.tenant_id = p_tenant_id
    AND vr.created_at >= v_since;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_value_realization_summary IS
'Get aggregated value realization summary for a time period.';


-- -----------------------------------------------------------------------------
-- Function: Calculate Value Score
-- Calculates composite value score from realization data
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_value_score(
    p_user_satisfaction NUMERIC,
    p_actual_time_saved_minutes NUMERIC,
    p_actual_quality_improvement NUMERIC,
    p_would_recommend BOOLEAN
) RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(
        (
            (p_user_satisfaction / 10) * 0.4 +
            LEAST(p_actual_time_saved_minutes / 30, 1.0) * 0.3 +
            p_actual_quality_improvement * 0.2 +
            (CASE WHEN p_would_recommend THEN 1.0 ELSE 0.0 END) * 0.1
        ) * 10,
        2
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_value_score IS
'Calculate composite value score (0-10) from realization metrics.
Weights: satisfaction (40%), time saved (30%), quality (20%), recommendation (10%).';


-- -----------------------------------------------------------------------------
-- Function: Get Business Value Dashboard
-- Returns comprehensive business value dashboard data
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_business_value_dashboard(
    p_tenant_id UUID
) RETURNS TABLE (
    top_opportunities JSONB,
    roi_summary JSONB,
    value_summary JSONB,
    category_breakdown JSONB,
    generated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- Top VPANES opportunities
        COALESCE(
            (SELECT jsonb_agg(row_to_json(opp.*))
             FROM (
                 SELECT * FROM get_top_vpanes_opportunities(p_tenant_id, NULL, 0, 10)
             ) opp),
            '[]'::JSONB
        ) as top_opportunities,

        -- ROI summary
        COALESCE(
            (SELECT row_to_json(roi.*)::JSONB
             FROM (
                 SELECT * FROM get_roi_summary(p_tenant_id)
             ) roi),
            '{}'::JSONB
        ) as roi_summary,

        -- Value realization summary
        COALESCE(
            (SELECT row_to_json(val.*)::JSONB
             FROM (
                 SELECT * FROM get_value_realization_summary(p_tenant_id, 30)
             ) val),
            '{}'::JSONB
        ) as value_summary,

        -- Category breakdown
        COALESCE(
            (SELECT jsonb_object_agg(
                vs.value_category,
                jsonb_build_object(
                    'count', COUNT(*),
                    'avg_score', ROUND(AVG(
                        calculate_vpanes_normalized(
                            calculate_vpanes_total(
                                vs.value_score, vs.pain_score, vs.adoption_score,
                                vs.network_score, vs.ease_score, vs.strategic_score
                            )
                        )
                    ), 2)
                )
             )
             FROM vpanes_scores vs
             WHERE vs.tenant_id = p_tenant_id
             AND vs.value_category IS NOT NULL
             GROUP BY vs.value_category),
            '{}'::JSONB
        ) as category_breakdown,

        NOW() as generated_at;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_business_value_dashboard IS
'Get comprehensive business value dashboard including opportunities, ROI, and realizations.';


-- -----------------------------------------------------------------------------
-- Function: Select Agents for JTBDs
-- Selects best agents based on JTBD mappings
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION select_agents_for_jtbds(
    p_tenant_id UUID,
    p_jtbd_ids UUID[],
    p_limit INT DEFAULT 5
) RETURNS TABLE (
    agent_id UUID,
    agent_code TEXT,
    agent_name TEXT,
    tier TEXT,
    model TEXT,
    cost_per_query NUMERIC,
    relevance_score NUMERIC,
    is_primary BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (a.id)
        a.id as agent_id,
        a.code as agent_code,
        a.name as agent_name,
        a.tier,
        a.model,
        a.cost_per_query,
        COALESCE(ajm.relevance_score, 0.5) as relevance_score,
        COALESCE(ajm.is_primary, FALSE) as is_primary
    FROM agents a
    LEFT JOIN agent_jtbd_mappings ajm ON ajm.agent_id = a.id
    WHERE a.tenant_id = p_tenant_id
    AND a.is_active = TRUE
    AND (ajm.jtbd_id = ANY(p_jtbd_ids) OR ajm.jtbd_id IS NULL)
    ORDER BY
        a.id,
        CASE WHEN ajm.is_primary THEN 0 ELSE 1 END,
        ajm.relevance_score DESC NULLS LAST,
        a.cost_per_query ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION select_agents_for_jtbds IS
'Select best agents for a set of JTBDs based on mappings and relevance.';


-- =============================================================================
-- End of L7 Value Database Functions
-- =============================================================================
