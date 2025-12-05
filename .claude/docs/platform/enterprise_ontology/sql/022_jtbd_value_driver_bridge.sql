-- ============================================================================
-- JTBD VALUE DRIVER BRIDGE MIGRATION
-- Bridges existing L0 value driver mappings to new hierarchical VD-* drivers
-- ============================================================================

-- ============================================================================
-- SECTION 1: BRIDGE MAPPING TABLE (Old L0 → New Hierarchical)
-- ============================================================================

CREATE TABLE IF NOT EXISTS value_driver_bridge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    old_driver_code TEXT NOT NULL,
    old_driver_name TEXT NOT NULL,
    new_driver_code TEXT NOT NULL,
    mapping_rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'value_driver_bridge_unique'
        AND table_name = 'value_driver_bridge'
    ) THEN
        ALTER TABLE value_driver_bridge
        ADD CONSTRAINT value_driver_bridge_unique
        UNIQUE (old_driver_code, new_driver_code);
    END IF;
END$$;

-- ============================================================================
-- SECTION 2: POPULATE BRIDGE MAPPINGS
-- Maps 13 L0 drivers to appropriate hierarchical VD-* drivers
-- ============================================================================

INSERT INTO value_driver_bridge (old_driver_code, old_driver_name, new_driver_code, mapping_rationale)
VALUES
    -- COST_REDUCTION → Cost Savings hierarchy
    ('COST_REDUCTION', 'Cost Reduction', 'VD-CST-001', 'Direct mapping: Cost savings category'),
    ('COST_REDUCTION', 'Cost Reduction', 'VD-CST-010', 'Cost reduction improves Medical ops efficiency'),
    ('COST_REDUCTION', 'Cost Reduction', 'VD-CST-020', 'Cost reduction improves Commercial ops efficiency'),

    -- OPERATIONAL_EFFICIENCY → Cost Savings + IT Operations
    ('OPERATIONAL_EFFICIENCY', 'Operational Efficiency', 'VD-CST-030', 'Operational efficiency improves business operations'),
    ('OPERATIONAL_EFFICIENCY', 'Operational Efficiency', 'VD-CST-040', 'Operational efficiency optimizes IT operations'),

    -- COMPLIANCE → Risk Reduction hierarchy
    ('COMPLIANCE', 'Regulatory Compliance', 'VD-RSK-001', 'Compliance is core to risk reduction'),
    ('COMPLIANCE', 'Regulatory Compliance', 'VD-RSK-010', 'Compliance mitigates regulatory risks'),
    ('COMPLIANCE', 'Regulatory Compliance', 'VD-RSK-011', 'Compliance ensures FDA compliance'),
    ('COMPLIANCE', 'Regulatory Compliance', 'VD-RSK-012', 'Compliance ensures EMA compliance'),

    -- SCIENTIFIC_QUALITY → Revenue via product value
    ('SCIENTIFIC_QUALITY', 'Scientific Quality', 'VD-REV-020', 'Scientific quality increases product value'),
    ('SCIENTIFIC_QUALITY', 'Scientific Quality', 'VD-REV-021', 'Scientific quality builds product value story'),
    ('SCIENTIFIC_QUALITY', 'Scientific Quality', 'VD-REV-131', 'Scientific quality proves long-term efficacy'),

    -- PATIENT_IMPACT → Revenue via volume and value
    ('PATIENT_IMPACT', 'Patient Impact', 'VD-REV-010', 'Patient impact drives volume growth'),
    ('PATIENT_IMPACT', 'Patient Impact', 'VD-REV-113', 'Patient impact increases access to treatment'),
    ('PATIENT_IMPACT', 'Patient Impact', 'VD-REV-132', 'Patient impact drives patient support programs'),

    -- MARKET_ACCESS → Revenue via volume
    ('MARKET_ACCESS', 'Market Access', 'VD-REV-001', 'Market access drives revenue growth'),
    ('MARKET_ACCESS', 'Market Access', 'VD-REV-010', 'Market access increases volume'),
    ('MARKET_ACCESS', 'Market Access', 'VD-REV-011', 'Market access increases market size'),
    ('MARKET_ACCESS', 'Market Access', 'VD-REV-012', 'Market access increases market share'),

    -- HCP_EXPERIENCE → Revenue via sales/marketing
    ('HCP_EXPERIENCE', 'HCP Experience', 'VD-REV-122', 'HCP experience enhances sales & marketing'),
    ('HCP_EXPERIENCE', 'HCP Experience', 'VD-REV-124', 'HCP experience enhances HCP loyalty'),

    -- DECISION_QUALITY → Cost via efficiency + Risk
    ('DECISION_QUALITY', 'Decision Quality', 'VD-CST-010', 'Better decisions improve medical ops'),
    ('DECISION_QUALITY', 'Decision Quality', 'VD-RSK-030', 'Better decisions reduce operational risks'),

    -- KNOWLEDGE_MANAGEMENT → Cost via efficiency
    ('KNOWLEDGE_MANAGEMENT', 'Knowledge Management', 'VD-CST-011', 'Knowledge management automates literature review'),
    ('KNOWLEDGE_MANAGEMENT', 'Knowledge Management', 'VD-CST-012', 'Knowledge management streamlines medical information'),

    -- EMPLOYEE_EXPERIENCE → Cost via efficiency
    ('EMPLOYEE_EXPERIENCE', 'Employee Experience', 'VD-CST-030', 'Employee experience improves business operations'),
    ('EMPLOYEE_EXPERIENCE', 'Employee Experience', 'VD-CST-031', 'Better experience streamlines cross-functional processes'),

    -- BRAND_REPUTATION → Revenue via brand image
    ('BRAND_REPUTATION', 'Brand Reputation', 'VD-REV-123', 'Brand reputation enhances brand image'),
    ('BRAND_REPUTATION', 'Brand Reputation', 'VD-REV-020', 'Brand reputation increases product value'),

    -- COMPETITIVE_ADVANTAGE → Revenue growth
    ('COMPETITIVE_ADVANTAGE', 'Competitive Advantage', 'VD-REV-001', 'Competitive advantage drives revenue'),
    ('COMPETITIVE_ADVANTAGE', 'Competitive Advantage', 'VD-REV-012', 'Competitive advantage increases market share'),

    -- STAKEHOLDER_TRUST → Risk reduction + Revenue
    ('STAKEHOLDER_TRUST', 'Stakeholder Trust', 'VD-RSK-001', 'Stakeholder trust reduces overall risk'),
    ('STAKEHOLDER_TRUST', 'Stakeholder Trust', 'VD-REV-124', 'Stakeholder trust enhances HCP loyalty')
ON CONFLICT (old_driver_code, new_driver_code) DO NOTHING;

-- ============================================================================
-- SECTION 3: CREATE ADDITIONAL JTBD-VALUE DRIVER MAPPINGS
-- For each existing mapping, add corresponding new hierarchical mappings
-- ============================================================================

-- Insert new mappings for JTBDs based on their existing L0 driver mappings
-- Uses ON CONFLICT to safely handle duplicates (idempotent)
INSERT INTO jtbd_value_drivers (
    jtbd_id,
    driver_id,
    driver_name,
    impact_strength,
    confidence_level,
    rationale,
    contribution_type
)
SELECT DISTINCT ON (jvd.jtbd_id, vd_new.id)
    jvd.jtbd_id,
    vd_new.id AS driver_id,
    vd_new.name AS driver_name,
    jvd.impact_strength * 0.9 AS impact_strength, -- Slightly lower for derived mappings
    'medium' AS confidence_level,
    'Derived from ' || vd_old.name || ' mapping via bridge: ' || vdb.mapping_rationale AS rationale,
    'derived' AS contribution_type
FROM jtbd_value_drivers jvd
JOIN value_drivers vd_old ON jvd.driver_id = vd_old.id
JOIN value_driver_bridge vdb ON vdb.old_driver_code = vd_old.code
JOIN value_drivers vd_new ON vd_new.code = vdb.new_driver_code
ORDER BY jvd.jtbd_id, vd_new.id, jvd.impact_strength DESC
ON CONFLICT (jtbd_id, driver_id) DO NOTHING;

-- ============================================================================
-- SECTION 4: UPDATE STATISTICS VIEW
-- ============================================================================

-- View: JTBD with hierarchical value driver mappings
CREATE OR REPLACE VIEW v_jtbd_hierarchical_value_drivers AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.functional_area,
    vd.code AS driver_code,
    vd.name AS driver_name,
    vd.level AS driver_level,
    vd.value_category,
    jvd.impact_strength,
    jvd.confidence_level,
    jvd.contribution_type,
    -- Parent chain
    vd_parent.code AS parent_code,
    vd_parent.name AS parent_name
FROM jtbd j
JOIN jtbd_value_drivers jvd ON jvd.jtbd_id = j.id
JOIN value_drivers vd ON vd.id = jvd.driver_id
LEFT JOIN value_drivers vd_parent ON vd_parent.id = vd.parent_id
ORDER BY j.code, vd.code;

-- View: Value driver impact summary across all JTBDs
CREATE OR REPLACE VIEW v_value_driver_impact_summary AS
SELECT
    vd.code,
    vd.name,
    vd.level,
    vd.value_category,
    vd_parent.code AS parent_code,
    COUNT(DISTINCT jvd.jtbd_id) AS jtbd_count,
    AVG(jvd.impact_strength) AS avg_impact,
    COUNT(CASE WHEN jvd.contribution_type = 'direct' THEN 1 END) AS direct_mappings,
    COUNT(CASE WHEN jvd.contribution_type = 'derived' THEN 1 END) AS derived_mappings
FROM value_drivers vd
LEFT JOIN jtbd_value_drivers jvd ON jvd.driver_id = vd.id
LEFT JOIN value_drivers vd_parent ON vd_parent.id = vd.parent_id
GROUP BY vd.id, vd.code, vd.name, vd.level, vd.value_category, vd_parent.code
ORDER BY jtbd_count DESC, vd.code;

-- ============================================================================
-- SECTION 5: VERIFICATION
-- ============================================================================

-- Output summary
SELECT 'Bridge Mapping Complete' AS status,
       (SELECT COUNT(*) FROM value_driver_bridge) AS bridge_mappings,
       (SELECT COUNT(*) FROM jtbd_value_drivers) AS total_jtbd_mappings,
       (SELECT COUNT(*) FROM jtbd_value_drivers WHERE contribution_type = 'derived') AS derived_mappings;
