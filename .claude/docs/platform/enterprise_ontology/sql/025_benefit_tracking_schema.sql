-- ============================================================================
-- BENEFIT TRACKING SYSTEM
-- Comprehensive schema for tracking realized value over time
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENHANCE value_realization_tracking TABLE
-- ============================================================================

-- Ensure table exists with full schema
CREATE TABLE IF NOT EXISTS value_realization_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Entity references
    value_driver_id UUID REFERENCES value_drivers(id),
    jtbd_id UUID REFERENCES jtbd(id),
    tenant_id UUID REFERENCES tenants(id),

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT DEFAULT 'monthly',  -- 'weekly', 'monthly', 'quarterly', 'annual'

    -- Targets vs Actuals
    target_value NUMERIC(15,2),
    actual_value NUMERIC(15,2),
    variance_pct NUMERIC(5,2),
    variance_amount NUMERIC(15,2),

    -- Attribution
    ai_contribution_pct NUMERIC(5,2),      -- % attributed to AI/automation
    manual_contribution_pct NUMERIC(5,2),  -- % manual effort
    process_contribution_pct NUMERIC(5,2), -- % process improvement

    -- Status
    status TEXT DEFAULT 'pending',  -- 'pending', 'partial', 'achieved', 'exceeded', 'missed'

    -- Metadata
    measurement_method TEXT,
    data_source TEXT,
    notes TEXT,

    -- Verification
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    verification_evidence TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT vrt_period_type_check CHECK (period_type IN ('weekly', 'monthly', 'quarterly', 'annual')),
    CONSTRAINT vrt_status_check CHECK (status IN ('pending', 'partial', 'achieved', 'exceeded', 'missed'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vrt_driver ON value_realization_tracking(value_driver_id);
CREATE INDEX IF NOT EXISTS idx_vrt_jtbd ON value_realization_tracking(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_vrt_tenant ON value_realization_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vrt_period ON value_realization_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_vrt_status ON value_realization_tracking(status);

-- ============================================================================
-- SECTION 2: BENEFIT MILESTONES TABLE
-- Track progress toward value targets
-- ============================================================================

CREATE TABLE IF NOT EXISTS benefit_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Context
    jtbd_id UUID REFERENCES jtbd(id),
    value_driver_id UUID REFERENCES value_drivers(id),
    tenant_id UUID REFERENCES tenants(id),

    -- Milestone definition
    milestone_name TEXT NOT NULL,
    milestone_description TEXT,
    milestone_type TEXT NOT NULL,  -- 'adoption', 'efficiency', 'quality', 'value', 'capability'

    -- Progress tracking
    target_value NUMERIC(15,2),
    current_value NUMERIC(15,2),
    progress_pct NUMERIC(5,2),
    unit TEXT,  -- '$K', 'hours', '%', 'count'

    -- Timeline
    target_date DATE,
    achieved_date DATE,
    days_variance INTEGER,  -- Positive = late, Negative = early

    -- Status
    status TEXT DEFAULT 'not_started',  -- 'not_started', 'in_progress', 'at_risk', 'on_track', 'achieved', 'blocked'
    risk_level TEXT DEFAULT 'low',  -- 'low', 'medium', 'high', 'critical'

    -- Dependencies
    depends_on_milestone_ids UUID[],
    blocking_issues TEXT[],

    -- Ownership
    owner_id UUID,
    owner_name TEXT,

    -- Evidence
    evidence_url TEXT,
    evidence_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT bm_type_check CHECK (milestone_type IN ('adoption', 'efficiency', 'quality', 'value', 'capability', 'deployment')),
    CONSTRAINT bm_status_check CHECK (status IN ('not_started', 'in_progress', 'at_risk', 'on_track', 'achieved', 'blocked')),
    CONSTRAINT bm_risk_check CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bm_jtbd ON benefit_milestones(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_bm_driver ON benefit_milestones(value_driver_id);
CREATE INDEX IF NOT EXISTS idx_bm_tenant ON benefit_milestones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bm_status ON benefit_milestones(status);
CREATE INDEX IF NOT EXISTS idx_bm_target_date ON benefit_milestones(target_date);

-- ============================================================================
-- SECTION 3: BENEFIT TRACKING LOG (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS benefit_tracking_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference
    entity_type TEXT NOT NULL,  -- 'realization', 'milestone'
    entity_id UUID NOT NULL,

    -- Change tracking
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,

    -- Audit info
    changed_by UUID,
    changed_by_name TEXT,
    change_reason TEXT,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_btl_entity ON benefit_tracking_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_btl_created ON benefit_tracking_log(created_at DESC);

-- ============================================================================
-- SECTION 4: BENEFIT TRACKING VIEWS
-- ============================================================================

-- View: Realization Summary by Value Driver
CREATE OR REPLACE VIEW v_benefit_realization_summary AS
SELECT
    vd.code AS driver_code,
    vd.name AS driver_name,
    vd.value_category,

    -- Period metrics
    COUNT(DISTINCT vrt.id) AS tracking_periods,
    SUM(vrt.target_value) AS total_target,
    SUM(vrt.actual_value) AS total_actual,

    -- Variance analysis
    SUM(vrt.actual_value) - SUM(vrt.target_value) AS total_variance,
    CASE
        WHEN SUM(vrt.target_value) > 0
        THEN ((SUM(vrt.actual_value) - SUM(vrt.target_value)) / SUM(vrt.target_value) * 100)::NUMERIC(5,2)
        ELSE 0
    END AS variance_pct,

    -- Attribution
    AVG(vrt.ai_contribution_pct) AS avg_ai_contribution_pct,

    -- Status distribution
    COUNT(*) FILTER (WHERE vrt.status = 'achieved') AS achieved_count,
    COUNT(*) FILTER (WHERE vrt.status = 'exceeded') AS exceeded_count,
    COUNT(*) FILTER (WHERE vrt.status = 'missed') AS missed_count,

    -- Achievement rate
    CASE
        WHEN COUNT(vrt.id) > 0
        THEN (COUNT(*) FILTER (WHERE vrt.status IN ('achieved', 'exceeded'))::NUMERIC / COUNT(vrt.id) * 100)::NUMERIC(5,2)
        ELSE 0
    END AS achievement_rate_pct

FROM value_drivers vd
LEFT JOIN value_realization_tracking vrt ON vrt.value_driver_id = vd.id
GROUP BY vd.id, vd.code, vd.name, vd.value_category
ORDER BY total_actual DESC NULLS LAST;

-- View: Milestone Dashboard
CREATE OR REPLACE VIEW v_milestone_dashboard AS
SELECT
    bm.status,
    bm.milestone_type,
    bm.risk_level,

    -- Counts
    COUNT(*) AS milestone_count,

    -- Value metrics
    SUM(bm.target_value) AS total_target_value,
    SUM(bm.current_value) AS total_current_value,
    AVG(bm.progress_pct) AS avg_progress_pct,

    -- Timeline metrics
    COUNT(*) FILTER (WHERE bm.target_date < CURRENT_DATE AND bm.status != 'achieved') AS overdue_count,
    COUNT(*) FILTER (WHERE bm.target_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') AS due_soon_count,

    -- Achievement
    AVG(bm.days_variance) FILTER (WHERE bm.achieved_date IS NOT NULL) AS avg_days_variance

FROM benefit_milestones bm
GROUP BY bm.status, bm.milestone_type, bm.risk_level
ORDER BY milestone_count DESC;

-- View: Tenant Benefit Summary
CREATE OR REPLACE VIEW v_tenant_benefit_summary AS
SELECT
    t.id AS tenant_id,
    t.name AS tenant_name,

    -- Realization metrics
    COUNT(DISTINCT vrt.id) AS tracking_periods,
    SUM(vrt.actual_value) AS total_realized_value,
    AVG(vrt.ai_contribution_pct) AS avg_ai_contribution_pct,

    -- Milestone metrics
    COUNT(DISTINCT bm.id) AS total_milestones,
    COUNT(DISTINCT bm.id) FILTER (WHERE bm.status = 'achieved') AS achieved_milestones,
    COUNT(DISTINCT bm.id) FILTER (WHERE bm.status IN ('at_risk', 'blocked')) AS at_risk_milestones,

    -- Overall progress
    CASE
        WHEN COUNT(DISTINCT bm.id) > 0
        THEN (COUNT(DISTINCT bm.id) FILTER (WHERE bm.status = 'achieved')::NUMERIC / COUNT(DISTINCT bm.id) * 100)::NUMERIC(5,2)
        ELSE 0
    END AS milestone_achievement_rate,

    -- Latest activity
    MAX(vrt.period_end) AS latest_realization_period,
    MAX(bm.updated_at) AS latest_milestone_update

FROM tenants t
LEFT JOIN value_realization_tracking vrt ON vrt.tenant_id = t.id
LEFT JOIN benefit_milestones bm ON bm.tenant_id = t.id
GROUP BY t.id, t.name
ORDER BY total_realized_value DESC NULLS LAST;

-- View: JTBD Benefit Progress
CREATE OR REPLACE VIEW v_jtbd_benefit_progress AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.functional_area,

    -- Value drivers mapped
    COUNT(DISTINCT jvd.value_driver_id) AS mapped_drivers,

    -- Impact potential
    COALESCE(SUM(jvi.monetary_value), 0) AS potential_value,

    -- Realized value
    COALESCE(SUM(vrt.actual_value), 0) AS realized_value,

    -- Realization rate
    CASE
        WHEN SUM(jvi.monetary_value) > 0
        THEN (COALESCE(SUM(vrt.actual_value), 0) / SUM(jvi.monetary_value) * 100)::NUMERIC(5,2)
        ELSE 0
    END AS realization_rate_pct,

    -- Milestone progress
    COUNT(DISTINCT bm.id) AS total_milestones,
    COUNT(DISTINCT bm.id) FILTER (WHERE bm.status = 'achieved') AS completed_milestones,
    AVG(bm.progress_pct) AS avg_milestone_progress

FROM jtbd j
LEFT JOIN jtbd_value_drivers jvd ON jvd.jtbd_id = j.id
LEFT JOIN jtbd_value_impacts jvi ON jvi.jtbd_id = j.id
LEFT JOIN value_realization_tracking vrt ON vrt.jtbd_id = j.id
LEFT JOIN benefit_milestones bm ON bm.jtbd_id = j.id
GROUP BY j.id, j.code, j.name, j.functional_area
ORDER BY potential_value DESC;

-- ============================================================================
-- SECTION 5: BENEFIT TRACKING FUNCTIONS
-- ============================================================================

-- Function: Record value realization
CREATE OR REPLACE FUNCTION record_value_realization(
    p_jtbd_id UUID,
    p_value_driver_id UUID,
    p_period_start DATE,
    p_period_end DATE,
    p_target_value NUMERIC,
    p_actual_value NUMERIC,
    p_ai_contribution_pct NUMERIC DEFAULT NULL,
    p_data_source TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
    v_variance_pct NUMERIC;
    v_status TEXT;
BEGIN
    -- Calculate variance
    IF p_target_value > 0 THEN
        v_variance_pct := ((p_actual_value - p_target_value) / p_target_value * 100);
    ELSE
        v_variance_pct := 0;
    END IF;

    -- Determine status
    IF v_variance_pct >= 10 THEN
        v_status := 'exceeded';
    ELSIF v_variance_pct >= -5 THEN
        v_status := 'achieved';
    ELSIF v_variance_pct >= -20 THEN
        v_status := 'partial';
    ELSE
        v_status := 'missed';
    END IF;

    INSERT INTO value_realization_tracking (
        jtbd_id,
        value_driver_id,
        period_start,
        period_end,
        target_value,
        actual_value,
        variance_pct,
        variance_amount,
        ai_contribution_pct,
        status,
        data_source
    ) VALUES (
        p_jtbd_id,
        p_value_driver_id,
        p_period_start,
        p_period_end,
        p_target_value,
        p_actual_value,
        v_variance_pct,
        p_actual_value - p_target_value,
        p_ai_contribution_pct,
        v_status,
        p_data_source
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Update milestone progress
CREATE OR REPLACE FUNCTION update_milestone_progress(
    p_milestone_id UUID,
    p_current_value NUMERIC,
    p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_target NUMERIC;
    v_progress NUMERIC;
    v_status TEXT;
    v_old_value NUMERIC;
BEGIN
    -- Get target and old value
    SELECT target_value, current_value INTO v_target, v_old_value
    FROM benefit_milestones WHERE id = p_milestone_id;

    -- Calculate progress
    IF v_target > 0 THEN
        v_progress := (p_current_value / v_target * 100);
    ELSE
        v_progress := 0;
    END IF;

    -- Determine status
    IF v_progress >= 100 THEN
        v_status := 'achieved';
    ELSIF v_progress >= 70 THEN
        v_status := 'on_track';
    ELSIF v_progress >= 40 THEN
        v_status := 'in_progress';
    ELSIF v_progress > 0 THEN
        v_status := 'at_risk';
    ELSE
        v_status := 'not_started';
    END IF;

    -- Update milestone
    UPDATE benefit_milestones SET
        current_value = p_current_value,
        progress_pct = v_progress,
        status = v_status,
        achieved_date = CASE WHEN v_progress >= 100 THEN CURRENT_DATE ELSE achieved_date END,
        updated_at = NOW()
    WHERE id = p_milestone_id;

    -- Log the change
    INSERT INTO benefit_tracking_log (entity_type, entity_id, field_changed, old_value, new_value, change_reason)
    VALUES ('milestone', p_milestone_id, 'current_value', v_old_value::TEXT, p_current_value::TEXT, p_notes);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 6: SAMPLE MILESTONES (for demonstration)
-- ============================================================================

-- Insert sample milestones for common pharmaceutical use cases
INSERT INTO benefit_milestones (
    milestone_name, milestone_description, milestone_type,
    target_value, current_value, progress_pct, unit,
    target_date, status, risk_level
)
SELECT
    ms.name,
    ms.description,
    ms.type,
    ms.target,
    ms.current,
    (ms.current / ms.target * 100)::NUMERIC(5,2),
    ms.unit,
    ms.target_date,
    ms.status,
    ms.risk
FROM (VALUES
    ('Literature Review Automation', 'Deploy AI-assisted literature review for Medical Affairs', 'deployment', 100, 75, '$K savings', DATE '2025-03-31', 'in_progress', 'medium'),
    ('HCP Engagement Intelligence', 'Launch AI-powered HCP engagement recommendations', 'capability', 200, 40, '$K savings', DATE '2025-06-30', 'in_progress', 'low'),
    ('Medical Information Response', 'Automate 80% of standard medical inquiries', 'efficiency', 80, 55, '% automated', DATE '2025-04-30', 'in_progress', 'low'),
    ('Adverse Event Detection', 'Deploy real-time AE signal detection', 'quality', 500, 200, '$K savings', DATE '2025-05-31', 'in_progress', 'medium'),
    ('KOL Mapping Optimization', 'AI-driven KOL identification and prioritization', 'efficiency', 150, 90, '$K savings', DATE '2025-03-15', 'on_track', 'low'),
    ('Content Personalization', 'Deploy personalized HCP content engine', 'capability', 300, 50, '$K savings', DATE '2025-09-30', 'in_progress', 'medium'),
    ('Regulatory Intelligence', 'AI-powered regulatory change monitoring', 'quality', 250, 180, '$K savings', DATE '2025-04-15', 'on_track', 'low'),
    ('Clinical Trial Analytics', 'Deploy predictive trial enrollment analytics', 'value', 800, 200, '$K savings', DATE '2025-12-31', 'at_risk', 'high')
) AS ms(name, description, type, target, current, unit, target_date, status, risk)
WHERE NOT EXISTS (SELECT 1 FROM benefit_milestones WHERE milestone_name = ms.name);

-- ============================================================================
-- SECTION 7: VERIFICATION
-- ============================================================================

SELECT 'Benefit Tracking Schema Complete' AS status,
       (SELECT COUNT(*) FROM benefit_milestones) AS milestone_count,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'benefit_tracking_log') AS log_table,
       EXISTS(SELECT 1 FROM information_schema.views WHERE table_name = 'v_benefit_realization_summary') AS summary_view,
       EXISTS(SELECT 1 FROM information_schema.views WHERE table_name = 'v_milestone_dashboard') AS dashboard_view;
