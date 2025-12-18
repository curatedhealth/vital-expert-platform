-- =============================================================================
-- VITAL Platform - L3 JTBD Database Functions
-- Ontology Layer 3: Jobs-to-be-Done Operations
-- =============================================================================
-- Version: 1.0.0
-- Created: 2025-12-17
-- Description: Database functions for JTBD operations including ODI scoring,
--              relevance matching, and context resolution
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Function: Calculate ODI Opportunity Score
-- Formula: Opportunity = Importance + MAX(Importance - Satisfaction, 0)
-- Returns score between 0 and 20
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_odi_score(
    p_importance NUMERIC,
    p_satisfaction NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    RETURN p_importance + GREATEST(p_importance - p_satisfaction, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_odi_score IS
'Calculate ODI (Outcome-Driven Innovation) opportunity score.
Formula: Importance + MAX(Importance - Satisfaction, 0).
Range: 0-20 where higher = more opportunity.';


-- -----------------------------------------------------------------------------
-- Function: Update JTBD Opportunity Score
-- Recalculates and updates opportunity_score based on importance and satisfaction
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_jtbd_opportunity_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.opportunity_score := calculate_odi_score(NEW.importance_score, NEW.satisfaction_score);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic opportunity score updates
DROP TRIGGER IF EXISTS trg_update_jtbd_opportunity_score ON jtbds;
CREATE TRIGGER trg_update_jtbd_opportunity_score
    BEFORE INSERT OR UPDATE OF importance_score, satisfaction_score
    ON jtbds
    FOR EACH ROW
    EXECUTE FUNCTION update_jtbd_opportunity_score();


-- -----------------------------------------------------------------------------
-- Function: Find JTBDs by Role
-- Returns JTBDs associated with a role via junction table
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION find_jtbds_by_role(
    p_tenant_id UUID,
    p_role_id UUID,
    p_query TEXT DEFAULT NULL,
    p_limit INT DEFAULT 10
) RETURNS TABLE (
    id UUID,
    code TEXT,
    name TEXT,
    job_statement TEXT,
    when_situation TEXT,
    desired_outcome TEXT,
    job_type TEXT,
    complexity TEXT,
    importance_score NUMERIC,
    satisfaction_score NUMERIC,
    opportunity_score NUMERIC,
    runner_family TEXT,
    relevance_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.id,
        j.code,
        j.name,
        j.job_statement,
        j.when_situation,
        j.desired_outcome,
        j.job_type,
        j.complexity,
        j.importance_score,
        j.satisfaction_score,
        j.opportunity_score,
        j.runner_family,
        COALESCE(jr.relevance_score, 0.5) as relevance_score
    FROM jtbds j
    LEFT JOIN jtbd_roles jr ON jr.jtbd_id = j.id AND jr.role_id = p_role_id
    WHERE j.tenant_id = p_tenant_id
    AND j.is_active = TRUE
    AND (jr.role_id = p_role_id OR p_role_id IS NULL)
    AND (
        p_query IS NULL
        OR j.name ILIKE '%' || p_query || '%'
        OR j.job_statement ILIKE '%' || p_query || '%'
        OR j.desired_outcome ILIKE '%' || p_query || '%'
    )
    ORDER BY
        CASE WHEN jr.role_id IS NOT NULL THEN 0 ELSE 1 END,
        j.opportunity_score DESC,
        jr.relevance_score DESC NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_jtbds_by_role IS
'Find JTBDs associated with a role, optionally filtered by query text.
Results ordered by opportunity score and relevance.';


-- -----------------------------------------------------------------------------
-- Function: Find JTBDs by Function
-- Returns JTBDs associated with a business function
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION find_jtbds_by_function(
    p_tenant_id UUID,
    p_function_id UUID,
    p_query TEXT DEFAULT NULL,
    p_limit INT DEFAULT 10
) RETURNS TABLE (
    id UUID,
    code TEXT,
    name TEXT,
    job_statement TEXT,
    when_situation TEXT,
    desired_outcome TEXT,
    job_type TEXT,
    complexity TEXT,
    importance_score NUMERIC,
    satisfaction_score NUMERIC,
    opportunity_score NUMERIC,
    runner_family TEXT,
    relevance_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.id,
        j.code,
        j.name,
        j.job_statement,
        j.when_situation,
        j.desired_outcome,
        j.job_type,
        j.complexity,
        j.importance_score,
        j.satisfaction_score,
        j.opportunity_score,
        j.runner_family,
        COALESCE(jf.relevance_score, 0.5) as relevance_score
    FROM jtbds j
    LEFT JOIN jtbd_functions jf ON jf.jtbd_id = j.id AND jf.function_id = p_function_id
    WHERE j.tenant_id = p_tenant_id
    AND j.is_active = TRUE
    AND (jf.function_id = p_function_id OR p_function_id IS NULL)
    AND (
        p_query IS NULL
        OR j.name ILIKE '%' || p_query || '%'
        OR j.job_statement ILIKE '%' || p_query || '%'
        OR j.desired_outcome ILIKE '%' || p_query || '%'
    )
    ORDER BY
        CASE WHEN jf.function_id IS NOT NULL THEN 0 ELSE 1 END,
        j.opportunity_score DESC,
        jf.relevance_score DESC NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_jtbds_by_function IS
'Find JTBDs associated with a business function, optionally filtered by query text.';


-- -----------------------------------------------------------------------------
-- Function: Get Top JTBD Opportunities
-- Returns JTBDs with highest opportunity scores
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_top_jtbd_opportunities(
    p_tenant_id UUID,
    p_function_id UUID DEFAULT NULL,
    p_min_score NUMERIC DEFAULT 0,
    p_limit INT DEFAULT 10
) RETURNS TABLE (
    id UUID,
    code TEXT,
    name TEXT,
    job_statement TEXT,
    importance_score NUMERIC,
    satisfaction_score NUMERIC,
    opportunity_score NUMERIC,
    runner_family TEXT,
    opportunity_classification TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.id,
        j.code,
        j.name,
        j.job_statement,
        j.importance_score,
        j.satisfaction_score,
        j.opportunity_score,
        j.runner_family,
        CASE
            WHEN j.opportunity_score >= 15 THEN 'high_priority'
            WHEN j.opportunity_score >= 10 THEN 'medium_priority'
            ELSE 'low_priority'
        END as opportunity_classification
    FROM jtbds j
    LEFT JOIN jtbd_functions jf ON jf.jtbd_id = j.id
    WHERE j.tenant_id = p_tenant_id
    AND j.is_active = TRUE
    AND j.opportunity_score >= p_min_score
    AND (p_function_id IS NULL OR jf.function_id = p_function_id)
    ORDER BY j.opportunity_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_top_jtbd_opportunities IS
'Get JTBDs with highest opportunity scores, optionally filtered by function.
Classifications: high_priority (>=15), medium_priority (>=10), low_priority (<10).';


-- -----------------------------------------------------------------------------
-- Function: Get JTBD Context
-- Returns full context for a JTBD including pain points and outcomes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_jtbd_context(
    p_tenant_id UUID,
    p_jtbd_id UUID
) RETURNS TABLE (
    jtbd_data JSONB,
    pain_points JSONB,
    desired_outcomes JSONB,
    success_criteria JSONB,
    value_mappings JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- JTBD data
        (SELECT row_to_json(j.*)::JSONB
         FROM jtbds j
         WHERE j.id = p_jtbd_id AND j.tenant_id = p_tenant_id),

        -- Pain points
        COALESCE(
            (SELECT jsonb_agg(row_to_json(pp.*))
             FROM jtbd_pain_points pp
             WHERE pp.jtbd_id = p_jtbd_id
             AND pp.tenant_id = p_tenant_id
             AND pp.is_active = TRUE),
            '[]'::JSONB
        ),

        -- Desired outcomes
        COALESCE(
            (SELECT jsonb_agg(row_to_json(do.*))
             FROM jtbd_desired_outcomes do
             WHERE do.jtbd_id = p_jtbd_id
             AND do.tenant_id = p_tenant_id
             AND do.is_active = TRUE),
            '[]'::JSONB
        ),

        -- Success criteria
        COALESCE(
            (SELECT jsonb_agg(row_to_json(sc.*))
             FROM jtbd_success_criteria sc
             WHERE sc.jtbd_id = p_jtbd_id
             AND sc.tenant_id = p_tenant_id
             AND sc.is_active = TRUE),
            '[]'::JSONB
        ),

        -- Value mappings (categories and drivers)
        COALESCE(
            (SELECT jsonb_build_object(
                'categories', (
                    SELECT jsonb_agg(jsonb_build_object(
                        'category_id', jvc.category_id,
                        'relevance_score', jvc.relevance_score,
                        'is_primary', jvc.is_primary
                    ))
                    FROM jtbd_value_categories jvc
                    WHERE jvc.jtbd_id = p_jtbd_id
                ),
                'drivers', (
                    SELECT jsonb_agg(jsonb_build_object(
                        'driver_id', jvd.driver_id,
                        'impact_score', jvd.impact_score,
                        'confidence_level', jvd.confidence_level
                    ))
                    FROM jtbd_value_drivers jvd
                    WHERE jvd.jtbd_id = p_jtbd_id
                )
            )),
            '{}'::JSONB
        );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_jtbd_context IS
'Get full context for a JTBD including pain points, outcomes, criteria, and value mappings.';


-- -----------------------------------------------------------------------------
-- Function: Calculate Desired Outcome Opportunity Scores
-- Batch calculates opportunity scores for all outcomes of a JTBD
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_outcome_opportunity_scores(
    p_tenant_id UUID,
    p_jtbd_id UUID
) RETURNS TABLE (
    outcome_id UUID,
    outcome_statement TEXT,
    importance NUMERIC,
    current_satisfaction NUMERIC,
    opportunity_score NUMERIC,
    opportunity_classification TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        do.id as outcome_id,
        do.outcome_statement,
        do.importance,
        do.current_satisfaction,
        calculate_odi_score(do.importance, do.current_satisfaction) as opportunity_score,
        CASE
            WHEN calculate_odi_score(do.importance, do.current_satisfaction) >= 15 THEN 'high_priority'
            WHEN calculate_odi_score(do.importance, do.current_satisfaction) >= 10 THEN 'medium_priority'
            ELSE 'low_priority'
        END as opportunity_classification
    FROM jtbd_desired_outcomes do
    WHERE do.tenant_id = p_tenant_id
    AND do.jtbd_id = p_jtbd_id
    AND do.is_active = TRUE
    ORDER BY calculate_odi_score(do.importance, do.current_satisfaction) DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_outcome_opportunity_scores IS
'Calculate ODI opportunity scores for all desired outcomes of a JTBD.';


-- -----------------------------------------------------------------------------
-- Function: Get JTBD Statistics
-- Returns aggregated statistics for JTBDs in a tenant
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_jtbd_statistics(
    p_tenant_id UUID
) RETURNS TABLE (
    total_jtbds INT,
    high_priority_count INT,
    medium_priority_count INT,
    low_priority_count INT,
    avg_importance NUMERIC,
    avg_satisfaction NUMERIC,
    avg_opportunity NUMERIC,
    total_pain_points INT,
    total_outcomes INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT j.id)::INT as total_jtbds,
        COUNT(DISTINCT CASE WHEN j.opportunity_score >= 15 THEN j.id END)::INT as high_priority_count,
        COUNT(DISTINCT CASE WHEN j.opportunity_score >= 10 AND j.opportunity_score < 15 THEN j.id END)::INT as medium_priority_count,
        COUNT(DISTINCT CASE WHEN j.opportunity_score < 10 THEN j.id END)::INT as low_priority_count,
        ROUND(AVG(j.importance_score), 2) as avg_importance,
        ROUND(AVG(j.satisfaction_score), 2) as avg_satisfaction,
        ROUND(AVG(j.opportunity_score), 2) as avg_opportunity,
        (SELECT COUNT(*)::INT FROM jtbd_pain_points pp WHERE pp.tenant_id = p_tenant_id AND pp.is_active = TRUE) as total_pain_points,
        (SELECT COUNT(*)::INT FROM jtbd_desired_outcomes do WHERE do.tenant_id = p_tenant_id AND do.is_active = TRUE) as total_outcomes
    FROM jtbds j
    WHERE j.tenant_id = p_tenant_id
    AND j.is_active = TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_jtbd_statistics IS
'Get aggregated statistics for all JTBDs in a tenant.';


-- =============================================================================
-- End of L3 JTBD Database Functions
-- =============================================================================
