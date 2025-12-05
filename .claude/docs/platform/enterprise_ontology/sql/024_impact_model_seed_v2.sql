-- ============================================================================
-- IMPACT MODEL SEED DATA AND VIEWS (FIXED v2)
-- Fixed: jtbd_value_impacts table missing jtbd_id column
-- ============================================================================

-- ============================================================================
-- SECTION 1: FIX jtbd_value_impacts TABLE - Add missing columns
-- ============================================================================

-- First, add missing columns if they don't exist
DO $$
BEGIN
    -- Add jtbd_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'jtbd_id') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN jtbd_id UUID REFERENCES jtbd(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added jtbd_id column to jtbd_value_impacts';
    END IF;

    -- Add impact_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'impact_type') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN impact_type TEXT;
        RAISE NOTICE 'Added impact_type column to jtbd_value_impacts';
    END IF;

    -- Add baseline_metric if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'baseline_metric') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN baseline_metric NUMERIC;
        RAISE NOTICE 'Added baseline_metric column to jtbd_value_impacts';
    END IF;

    -- Add target_metric if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'target_metric') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN target_metric NUMERIC;
        RAISE NOTICE 'Added target_metric column to jtbd_value_impacts';
    END IF;

    -- Add improvement_pct if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'improvement_pct') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN improvement_pct NUMERIC(5,2);
        RAISE NOTICE 'Added improvement_pct column to jtbd_value_impacts';
    END IF;

    -- Add ai_automation_pct if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'ai_automation_pct') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN ai_automation_pct NUMERIC(5,2);
        RAISE NOTICE 'Added ai_automation_pct column to jtbd_value_impacts';
    END IF;

    -- Add ai_augmentation_pct if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'ai_augmentation_pct') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN ai_augmentation_pct NUMERIC(5,2);
        RAISE NOTICE 'Added ai_augmentation_pct column to jtbd_value_impacts';
    END IF;

    -- Add monetary_value if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'monetary_value') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN monetary_value NUMERIC(12,2);
        RAISE NOTICE 'Added monetary_value column to jtbd_value_impacts';
    END IF;

    -- Add value_unit if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'value_unit') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN value_unit TEXT;
        RAISE NOTICE 'Added value_unit column to jtbd_value_impacts';
    END IF;

    -- Add confidence_level if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'confidence_level') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN confidence_level TEXT DEFAULT 'medium';
        RAISE NOTICE 'Added confidence_level column to jtbd_value_impacts';
    END IF;

    -- Add calculation_method if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'calculation_method') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN calculation_method TEXT;
        RAISE NOTICE 'Added calculation_method column to jtbd_value_impacts';
    END IF;

    -- Add assumptions if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'assumptions') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN assumptions TEXT;
        RAISE NOTICE 'Added assumptions column to jtbd_value_impacts';
    END IF;

    -- Add timestamps if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'created_at') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jtbd_value_impacts' AND column_name = 'updated_at') THEN
        ALTER TABLE jtbd_value_impacts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_jvi_jtbd ON jtbd_value_impacts(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jvi_type ON jtbd_value_impacts(impact_type);

-- ============================================================================
-- SECTION 2: IMPACT BENCHMARK DATA
-- Standard benchmarks by functional area and impact type
-- ============================================================================

CREATE TABLE IF NOT EXISTS impact_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    functional_area TEXT NOT NULL,
    impact_type TEXT NOT NULL,

    -- Benchmark metrics
    typical_baseline NUMERIC,
    typical_target NUMERIC,
    typical_improvement_pct NUMERIC(5,2),

    -- AI impact ranges
    min_ai_automation_pct NUMERIC(5,2),
    max_ai_automation_pct NUMERIC(5,2),
    typical_ai_automation_pct NUMERIC(5,2),

    -- Value ranges
    min_monetary_value NUMERIC(12,2),
    max_monetary_value NUMERIC(12,2),
    typical_monetary_value NUMERIC(12,2),
    value_unit TEXT,

    -- Source
    benchmark_source TEXT,
    industry TEXT DEFAULT 'pharmaceuticals',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed benchmark data
INSERT INTO impact_benchmarks (
    functional_area, impact_type,
    typical_baseline, typical_target, typical_improvement_pct,
    min_ai_automation_pct, max_ai_automation_pct, typical_ai_automation_pct,
    min_monetary_value, max_monetary_value, typical_monetary_value, value_unit,
    benchmark_source
) VALUES
    -- Medical Affairs
    ('Medical Affairs', 'faster', 40, 8, 80.00, 60, 95, 80, 80000, 200000, 120000, '$K/year', 'Industry benchmark - Literature review automation'),
    ('Medical Affairs', 'smarter', 60, 90, 50.00, 30, 70, 50, 150000, 350000, 200000, '$K/year', 'Industry benchmark - HCP engagement intelligence'),
    ('Medical Affairs', 'better', 75, 95, 26.67, 40, 80, 60, 100000, 250000, 150000, '$K/year', 'Industry benchmark - Medical content quality'),
    ('Medical Affairs', 'efficient', 2.0, 0.5, 75.00, 60, 90, 75, 120000, 280000, 180000, '$K/year', 'Industry benchmark - FTE optimization'),
    ('Medical Affairs', 'safer', 72, 4, 94.44, 80, 98, 95, 300000, 800000, 500000, '$K/year', 'Industry benchmark - AE detection time (hours)'),
    ('Medical Affairs', 'scalable', 10, 100, 900.00, 50, 90, 70, 200000, 500000, 300000, '$K/year', 'Industry benchmark - Content reach'),

    -- Market Access
    ('Market Access', 'faster', 180, 60, 66.67, 40, 70, 55, 100000, 300000, 180000, '$K/year', 'Industry benchmark - Dossier preparation (days)'),
    ('Market Access', 'smarter', 50, 85, 70.00, 30, 60, 45, 200000, 500000, 320000, '$K/year', 'Industry benchmark - Pricing strategy accuracy'),
    ('Market Access', 'better', 65, 90, 38.46, 35, 65, 50, 150000, 400000, 250000, '$K/year', 'Industry benchmark - HTA submission success'),
    ('Market Access', 'efficient', 1.5, 0.3, 80.00, 50, 80, 65, 100000, 250000, 160000, '$K/year', 'Industry benchmark - FTE on analytics'),

    -- Commercial Operations
    ('Commercial', 'faster', 30, 5, 83.33, 60, 90, 75, 80000, 180000, 120000, '$K/year', 'Industry benchmark - Report generation (days)'),
    ('Commercial', 'smarter', 55, 85, 54.55, 35, 65, 50, 180000, 450000, 280000, '$K/year', 'Industry benchmark - Sales forecasting accuracy'),
    ('Commercial', 'better', 70, 92, 31.43, 40, 70, 55, 120000, 320000, 200000, '$K/year', 'Industry benchmark - Territory optimization'),
    ('Commercial', 'efficient', 3.0, 1.0, 66.67, 50, 80, 65, 150000, 350000, 220000, '$K/year', 'Industry benchmark - Analytics FTE'),

    -- Clinical Operations
    ('Clinical Operations', 'faster', 365, 180, 50.68, 30, 60, 45, 500000, 1500000, 800000, '$K/year', 'Industry benchmark - Trial enrollment (days)'),
    ('Clinical Operations', 'smarter', 45, 80, 77.78, 25, 55, 40, 300000, 800000, 500000, '$K/year', 'Industry benchmark - Site selection accuracy'),
    ('Clinical Operations', 'safer', 48, 6, 87.50, 70, 95, 85, 400000, 1200000, 700000, '$K/year', 'Industry benchmark - Safety signal detection (hours)'),
    ('Clinical Operations', 'efficient', 4.0, 1.5, 62.50, 40, 70, 55, 250000, 600000, 380000, '$K/year', 'Industry benchmark - Data management FTE'),

    -- Regulatory Affairs
    ('Regulatory', 'faster', 90, 30, 66.67, 40, 70, 55, 200000, 500000, 320000, '$K/year', 'Industry benchmark - Submission prep (days)'),
    ('Regulatory', 'better', 85, 98, 15.29, 50, 85, 70, 150000, 400000, 250000, '$K/year', 'Industry benchmark - First-pass approval rate'),
    ('Regulatory', 'safer', 5, 0.5, 90.00, 60, 90, 75, 300000, 900000, 550000, '$K/year', 'Industry benchmark - Compliance gap reduction'),

    -- R&D
    ('R&D', 'smarter', 40, 75, 87.50, 25, 50, 38, 400000, 1200000, 700000, '$K/year', 'Industry benchmark - Target identification accuracy'),
    ('R&D', 'faster', 720, 360, 50.00, 20, 45, 32, 800000, 2500000, 1500000, '$K/year', 'Industry benchmark - Discovery cycle (days)')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 3: IMPACT MODEL VIEWS
-- ============================================================================

-- View: JTBD Impact Summary (complete value picture per JTBD)
CREATE OR REPLACE VIEW v_jtbd_impact_summary AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.functional_area,

    -- Impact counts by type
    COUNT(DISTINCT jvi.id) AS impact_count,
    COUNT(DISTINCT jvi.id) FILTER (WHERE jvi.impact_type = 'smarter') AS smarter_impacts,
    COUNT(DISTINCT jvi.id) FILTER (WHERE jvi.impact_type = 'faster') AS faster_impacts,
    COUNT(DISTINCT jvi.id) FILTER (WHERE jvi.impact_type = 'better') AS better_impacts,
    COUNT(DISTINCT jvi.id) FILTER (WHERE jvi.impact_type = 'efficient') AS efficient_impacts,
    COUNT(DISTINCT jvi.id) FILTER (WHERE jvi.impact_type = 'safer') AS safer_impacts,
    COUNT(DISTINCT jvi.id) FILTER (WHERE jvi.impact_type = 'scalable') AS scalable_impacts,

    -- Value aggregation
    SUM(jvi.monetary_value) AS total_monetary_value,
    AVG(jvi.improvement_pct) AS avg_improvement_pct,
    AVG(jvi.ai_automation_pct) AS avg_automation_pct,
    AVG(jvi.ai_augmentation_pct) AS avg_augmentation_pct,

    -- Confidence distribution
    COUNT(*) FILTER (WHERE jvi.confidence_level = 'high') AS high_confidence_count,
    COUNT(*) FILTER (WHERE jvi.confidence_level = 'medium') AS medium_confidence_count,
    COUNT(*) FILTER (WHERE jvi.confidence_level = 'low') AS low_confidence_count,

    -- Value driver coverage
    COUNT(DISTINCT jvd.driver_id) AS value_driver_count
FROM jtbd j
LEFT JOIN jtbd_value_impacts jvi ON jvi.jtbd_id = j.id
LEFT JOIN jtbd_value_drivers jvd ON jvd.jtbd_id = j.id
GROUP BY j.id, j.code, j.name, j.functional_area
ORDER BY total_monetary_value DESC NULLS LAST;

-- View: Impact by Functional Area
CREATE OR REPLACE VIEW v_impact_by_function AS
SELECT
    COALESCE(j.functional_area::text, 'Unassigned') AS functional_area,
    jvi.impact_type,

    -- Counts
    COUNT(DISTINCT j.id) AS jtbd_count,
    COUNT(DISTINCT jvi.id) AS impact_count,

    -- Value metrics
    SUM(jvi.monetary_value) AS total_value,
    AVG(jvi.monetary_value) AS avg_value_per_impact,

    -- Improvement metrics
    AVG(jvi.improvement_pct) AS avg_improvement_pct,
    MIN(jvi.improvement_pct) AS min_improvement_pct,
    MAX(jvi.improvement_pct) AS max_improvement_pct,

    -- AI contribution
    AVG(jvi.ai_automation_pct) AS avg_automation_pct,
    AVG(jvi.ai_augmentation_pct) AS avg_augmentation_pct
FROM jtbd j
JOIN jtbd_value_impacts jvi ON jvi.jtbd_id = j.id
GROUP BY j.functional_area, jvi.impact_type
ORDER BY total_value DESC;

-- View: Total Value Dashboard
CREATE OR REPLACE VIEW v_impact_dashboard AS
SELECT
    'Total' AS metric_type,
    COUNT(DISTINCT j.id) AS total_jtbds,
    COUNT(DISTINCT jvi.id) AS total_impacts,
    SUM(jvi.monetary_value)::NUMERIC(15,2) AS total_value,
    AVG(jvi.improvement_pct)::NUMERIC(5,2) AS avg_improvement_pct,
    AVG(jvi.ai_automation_pct)::NUMERIC(5,2) AS avg_automation_pct,
    AVG(jvi.ai_augmentation_pct)::NUMERIC(5,2) AS avg_augmentation_pct
FROM jtbd j
LEFT JOIN jtbd_value_impacts jvi ON jvi.jtbd_id = j.id

UNION ALL

SELECT
    jvi.impact_type AS metric_type,
    COUNT(DISTINCT j.id) AS total_jtbds,
    COUNT(DISTINCT jvi.id) AS total_impacts,
    SUM(jvi.monetary_value)::NUMERIC(15,2) AS total_value,
    AVG(jvi.improvement_pct)::NUMERIC(5,2) AS avg_improvement_pct,
    AVG(jvi.ai_automation_pct)::NUMERIC(5,2) AS avg_automation_pct,
    AVG(jvi.ai_augmentation_pct)::NUMERIC(5,2) AS avg_augmentation_pct
FROM jtbd j
JOIN jtbd_value_impacts jvi ON jvi.jtbd_id = j.id
GROUP BY jvi.impact_type
ORDER BY total_value DESC NULLS LAST;

-- View: High-Value Opportunities (Top ROI potential)
CREATE OR REPLACE VIEW v_high_value_opportunities AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.functional_area,
    jvi.impact_type,
    jvi.monetary_value,
    jvi.improvement_pct,
    jvi.ai_automation_pct,
    jvi.confidence_level,
    -- ROI Score = (Value * Automation%) / (100 - Confidence penalty)
    (jvi.monetary_value * COALESCE(jvi.ai_automation_pct, 50) / 100) /
        (CASE jvi.confidence_level
            WHEN 'high' THEN 1.0
            WHEN 'medium' THEN 1.2
            ELSE 1.5
        END) AS roi_score
FROM jtbd j
JOIN jtbd_value_impacts jvi ON jvi.jtbd_id = j.id
WHERE jvi.monetary_value > 50000
  AND COALESCE(jvi.ai_automation_pct, 0) > 30
ORDER BY roi_score DESC
LIMIT 100;

-- ============================================================================
-- SECTION 4: IMPACT MODEL FUNCTIONS
-- ============================================================================

-- Function: Calculate total impact value for a tenant (updated - no tenant_id filter)
CREATE OR REPLACE FUNCTION calculate_impact_summary()
RETURNS TABLE (
    impact_type TEXT,
    jtbd_count BIGINT,
    total_value NUMERIC,
    avg_automation_pct NUMERIC,
    avg_improvement_pct NUMERIC
) AS $func$
BEGIN
    RETURN QUERY
    SELECT
        jvi.impact_type,
        COUNT(DISTINCT j.id)::BIGINT,
        SUM(jvi.monetary_value),
        AVG(jvi.ai_automation_pct),
        AVG(jvi.improvement_pct)
    FROM jtbd j
    JOIN jtbd_value_impacts jvi ON jvi.jtbd_id = j.id
    GROUP BY jvi.impact_type
    ORDER BY SUM(jvi.monetary_value) DESC;
END;
$func$ LANGUAGE plpgsql;

-- Function: Get impact breakdown for a specific JTBD
CREATE OR REPLACE FUNCTION get_jtbd_impact_breakdown(p_jtbd_id UUID)
RETURNS TABLE (
    impact_type TEXT,
    baseline_metric NUMERIC,
    target_metric NUMERIC,
    improvement_pct NUMERIC,
    ai_automation_pct NUMERIC,
    ai_augmentation_pct NUMERIC,
    monetary_value NUMERIC,
    confidence_level TEXT
) AS $func$
BEGIN
    RETURN QUERY
    SELECT
        jvi.impact_type,
        jvi.baseline_metric,
        jvi.target_metric,
        jvi.improvement_pct,
        jvi.ai_automation_pct,
        jvi.ai_augmentation_pct,
        jvi.monetary_value,
        jvi.confidence_level
    FROM jtbd_value_impacts jvi
    WHERE jvi.jtbd_id = p_jtbd_id
    ORDER BY jvi.monetary_value DESC;
END;
$func$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 5: VERIFICATION
-- ============================================================================

SELECT 'Impact Model Seed Complete' AS status,
       (SELECT COUNT(*) FROM impact_benchmarks) AS benchmark_records,
       (SELECT COUNT(*) FROM jtbd_value_impacts) AS impact_records,
       EXISTS(SELECT 1 FROM information_schema.views WHERE table_name = 'v_jtbd_impact_summary') AS summary_view,
       EXISTS(SELECT 1 FROM information_schema.views WHERE table_name = 'v_impact_dashboard') AS dashboard_view;
