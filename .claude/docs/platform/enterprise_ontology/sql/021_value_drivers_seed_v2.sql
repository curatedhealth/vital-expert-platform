-- ============================================================================
-- VALUE DRIVERS SEED DATA v2 (Compatible with Existing Database)
-- Pharmaceutical Value Driver Tree with Dedicated Codes
-- Code Pattern: VD-{CATEGORY}-{SEQUENCE}
-- Categories: REV (Revenue), CST (Cost), RSK (Risk)
-- ============================================================================

-- ============================================================================
-- PREREQUISITE: Ensure UNIQUE constraint on code column
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'value_drivers_code_unique'
        AND conrelid = 'value_drivers'::regclass
    ) THEN
        -- Only add if no duplicate codes exist
        IF NOT EXISTS (
            SELECT code, COUNT(*) FROM value_drivers
            GROUP BY code HAVING COUNT(*) > 1
        ) THEN
            ALTER TABLE value_drivers ADD CONSTRAINT value_drivers_code_unique UNIQUE (code);
            RAISE NOTICE 'Added UNIQUE constraint on value_drivers.code';
        ELSE
            RAISE NOTICE 'Cannot add UNIQUE constraint - duplicate codes exist';
        END IF;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'UNIQUE constraint may already exist or cannot be added: %', SQLERRM;
END$$;

-- ============================================================================
-- SECTION 1: ROOT VALUE DRIVER
-- ============================================================================

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
VALUES
    ('VD-ROOT-001', 'Sustainable Business', 'Root value driver - overall business sustainability and growth', NULL, 0, 'external', NULL, '$M/y', 1, true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    level = EXCLUDED.level,
    driver_type = EXCLUDED.driver_type,
    unit = EXCLUDED.unit,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- ============================================================================
-- SECTION 2: L1 - PRIMARY VALUE CATEGORIES
-- ============================================================================

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
VALUES
    -- Revenue Growth
    ('VD-REV-001', 'Revenue Growth', 'Increase top-line revenue through volume, price, and product value', (SELECT id FROM value_drivers WHERE code = 'VD-ROOT-001'), 1, 'external', 'revenue', '$M/y', 1, true),

    -- Cost Savings
    ('VD-CST-001', 'Cost Savings', 'Reduce operational costs through efficiency improvements', (SELECT id FROM value_drivers WHERE code = 'VD-ROOT-001'), 1, 'external', 'cost', '$M/y', 2, true),

    -- Risk Reduction
    ('VD-RSK-001', 'Risk Reduction', 'Mitigate regulatory, legal, operational, and compliance risks', (SELECT id FROM value_drivers WHERE code = 'VD-ROOT-001'), 1, 'external', 'risk', '$M/y', 3, true)

ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    parent_id = EXCLUDED.parent_id,
    level = EXCLUDED.level,
    driver_type = EXCLUDED.driver_type,
    value_category = EXCLUDED.value_category,
    unit = EXCLUDED.unit,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- ============================================================================
-- SECTION 3: REVENUE DRIVERS (VD-REV-0XX)
-- ============================================================================

-- L2: Revenue Sub-categories
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-010', 'Increase Volume', 'Grow product volume through market expansion and share gains', id, 2, 'external', 'revenue', 'M units/y', 1, true
FROM value_drivers WHERE code = 'VD-REV-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-020', 'Increase Product Value', 'Enhance perceived and real value of products', id, 2, 'external', 'revenue', '$M/y', 2, true
FROM value_drivers WHERE code = 'VD-REV-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L3: Volume Drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-011', 'Increase Market Size', 'Expand the total addressable market through awareness and access', id, 3, 'external', 'revenue', '%', 1, true
FROM value_drivers WHERE code = 'VD-REV-010'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-012', 'Increase Market Share', 'Capture greater share of existing market', id, 3, 'external', 'revenue', '%', 2, true
FROM value_drivers WHERE code = 'VD-REV-010'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-013', 'Increase Length of Therapy', 'Extend treatment duration through efficacy and adherence', id, 3, 'external', 'revenue', 'months', 3, true
FROM value_drivers WHERE code = 'VD-REV-010'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L3: Product Value Drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-021', 'Build Product Value Story', 'Develop compelling evidence-based value propositions', id, 3, 'external', 'revenue', '%', 1, true
FROM value_drivers WHERE code = 'VD-REV-020'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-022', 'Offer Additional Services', 'Provide value-added services beyond the product', id, 3, 'external', 'revenue', '$M/y', 2, true
FROM value_drivers WHERE code = 'VD-REV-020'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L4: Market Size Sub-drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-111', 'Increase Disease Awareness', 'Improve public and HCP awareness of disease conditions', id, 4, 'external', 'revenue', '%', 1, true
FROM value_drivers WHERE code = 'VD-REV-011'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-112', 'Increase Diagnostics', 'Improve diagnostic rates for target conditions', id, 4, 'external', 'revenue', '%', 2, true
FROM value_drivers WHERE code = 'VD-REV-011'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-113', 'Increase Access to Treatment', 'Remove barriers to treatment access', id, 4, 'external', 'revenue', '%', 3, true
FROM value_drivers WHERE code = 'VD-REV-011'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L4: Market Share Sub-drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-121', 'Enhance Medical Efforts', 'Optimize medical affairs strategy and execution', id, 4, 'external', 'revenue', '%', 1, true
FROM value_drivers WHERE code = 'VD-REV-012'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-122', 'Enhance Sales & Marketing', 'Optimize commercial sales and marketing activities', id, 4, 'external', 'revenue', '%', 2, true
FROM value_drivers WHERE code = 'VD-REV-012'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-123', 'Enhance Brand Image', 'Strengthen brand positioning and perception', id, 4, 'external', 'revenue', '%', 3, true
FROM value_drivers WHERE code = 'VD-REV-012'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-124', 'Enhance HCP Loyalty', 'Build stronger relationships with healthcare providers', id, 4, 'external', 'revenue', '%', 4, true
FROM value_drivers WHERE code = 'VD-REV-012'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L4: Length of Therapy Sub-drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-131', 'Prove Long-term Efficacy', 'Generate evidence for sustained treatment benefits', id, 4, 'external', 'revenue', '%', 1, true
FROM value_drivers WHERE code = 'VD-REV-013'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-132', 'Develop Patient Support Programs', 'Create programs to support patient adherence and outcomes', id, 4, 'external', 'revenue', '%', 2, true
FROM value_drivers WHERE code = 'VD-REV-013'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-REV-133', 'Reduce Product Switch', 'Minimize patient switching to competitive products', id, 4, 'external', 'revenue', '%', 3, true
FROM value_drivers WHERE code = 'VD-REV-013'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- ============================================================================
-- SECTION 4: COST DRIVERS (VD-CST-0XX)
-- ============================================================================

-- L2: Cost Sub-categories
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-010', 'Improve Medical Operations Efficiency', 'Optimize Medical Affairs operational processes', id, 2, 'external', 'cost', '$M/y', 1, true
FROM value_drivers WHERE code = 'VD-CST-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-020', 'Improve Commercial Operations Efficiency', 'Optimize Commercial operational processes', id, 2, 'external', 'cost', '$M/y', 2, true
FROM value_drivers WHERE code = 'VD-CST-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-030', 'Improve Business Operations Efficiency', 'Optimize cross-functional business processes', id, 2, 'external', 'cost', '$M/y', 3, true
FROM value_drivers WHERE code = 'VD-CST-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-040', 'Improve IT Operations Efficiency', 'Optimize technology and infrastructure costs', id, 2, 'external', 'cost', '$M/y', 4, true
FROM value_drivers WHERE code = 'VD-CST-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L3: Medical Ops Efficiency Sub-drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-011', 'Automate Literature Review', 'Reduce manual effort in scientific literature analysis', id, 3, 'internal', 'cost', 'hours/week', 1, true
FROM value_drivers WHERE code = 'VD-CST-010'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-012', 'Streamline Medical Information', 'Optimize medical inquiry response processes', id, 3, 'internal', 'cost', 'hours/week', 2, true
FROM value_drivers WHERE code = 'VD-CST-010'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-013', 'Optimize KOL Management', 'Improve efficiency of KOL engagement activities', id, 3, 'internal', 'cost', 'FTE', 3, true
FROM value_drivers WHERE code = 'VD-CST-010'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L3: Commercial Ops Efficiency Sub-drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-021', 'Automate Sales Reporting', 'Reduce manual sales reporting and analysis', id, 3, 'internal', 'cost', 'hours/week', 1, true
FROM value_drivers WHERE code = 'VD-CST-020'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-022', 'Optimize Marketing Operations', 'Streamline marketing campaign execution', id, 3, 'internal', 'cost', '$K/campaign', 2, true
FROM value_drivers WHERE code = 'VD-CST-020'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-023', 'Improve Territory Management', 'Optimize sales territory planning and allocation', id, 3, 'internal', 'cost', 'FTE', 3, true
FROM value_drivers WHERE code = 'VD-CST-020'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L3: Business Ops Efficiency Sub-drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-031', 'Streamline Cross-functional Processes', 'Reduce friction in cross-team workflows', id, 3, 'internal', 'cost', 'hours/week', 1, true
FROM value_drivers WHERE code = 'VD-CST-030'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-032', 'Automate Compliance Monitoring', 'Reduce manual compliance checking effort', id, 3, 'internal', 'cost', 'FTE', 2, true
FROM value_drivers WHERE code = 'VD-CST-030'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L3: IT Ops Efficiency Sub-drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-041', 'Optimize Infrastructure Costs', 'Reduce cloud and on-premise infrastructure spend', id, 3, 'internal', 'cost', '$K/month', 1, true
FROM value_drivers WHERE code = 'VD-CST-040'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-CST-042', 'Consolidate Technology Platforms', 'Reduce tool sprawl and licensing costs', id, 3, 'internal', 'cost', '$K/year', 2, true
FROM value_drivers WHERE code = 'VD-CST-040'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- ============================================================================
-- SECTION 5: RISK DRIVERS (VD-RSK-0XX)
-- ============================================================================

-- L2: Risk Sub-categories
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-010', 'Mitigate Regulatory Risks', 'Ensure compliance with FDA, EMA, and other regulatory requirements', id, 2, 'external', 'risk', '$M/y', 1, true
FROM value_drivers WHERE code = 'VD-RSK-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-020', 'Mitigate Legal Risks', 'Reduce exposure to litigation and legal challenges', id, 2, 'external', 'risk', '$M/y', 2, true
FROM value_drivers WHERE code = 'VD-RSK-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-030', 'Minimize Financial Risks', 'Protect against financial exposure and volatility', id, 2, 'external', 'risk', '$M/y', 3, true
FROM value_drivers WHERE code = 'VD-RSK-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-040', 'Reduce Operational Risks', 'Minimize operational disruptions and failures', id, 2, 'external', 'risk', '$M/y', 4, true
FROM value_drivers WHERE code = 'VD-RSK-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-050', 'Mitigate Reputational Risks', 'Protect brand and corporate reputation', id, 2, 'external', 'risk', '$M/y', 5, true
FROM value_drivers WHERE code = 'VD-RSK-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-060', 'Minimize Environmental Risks', 'Ensure environmental compliance and sustainability', id, 2, 'external', 'risk', '$M/y', 6, true
FROM value_drivers WHERE code = 'VD-RSK-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-070', 'Mitigate Compliance Risks', 'Ensure adherence to industry standards and policies', id, 2, 'external', 'risk', '$M/y', 7, true
FROM value_drivers WHERE code = 'VD-RSK-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-080', 'Manage Supply Chain Risks', 'Ensure supply chain resilience and continuity', id, 2, 'external', 'risk', '$M/y', 8, true
FROM value_drivers WHERE code = 'VD-RSK-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-090', 'Reduce Data Protection Risks', 'Protect sensitive data and ensure privacy compliance', id, 2, 'external', 'risk', '$M/y', 9, true
FROM value_drivers WHERE code = 'VD-RSK-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-100', 'Protect IP Rights', 'Safeguard intellectual property and patents', id, 2, 'external', 'risk', '$M/y', 10, true
FROM value_drivers WHERE code = 'VD-RSK-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L3: Regulatory Risk Sub-drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-011', 'Ensure FDA Compliance', 'Maintain compliance with FDA regulations', id, 3, 'internal', 'risk', 'incidents/year', 1, true
FROM value_drivers WHERE code = 'VD-RSK-010'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-012', 'Ensure EMA Compliance', 'Maintain compliance with EMA regulations', id, 3, 'internal', 'risk', 'incidents/year', 2, true
FROM value_drivers WHERE code = 'VD-RSK-010'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-013', 'Monitor Regulatory Changes', 'Track and respond to regulatory updates', id, 3, 'internal', 'risk', 'hours/week', 3, true
FROM value_drivers WHERE code = 'VD-RSK-010'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L3: Compliance Risk Sub-drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-071', 'Ensure HCP Engagement Compliance', 'Maintain compliant HCP interactions', id, 3, 'internal', 'risk', 'incidents/year', 1, true
FROM value_drivers WHERE code = 'VD-RSK-070'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-072', 'Ensure Promotional Compliance', 'Maintain compliant promotional activities', id, 3, 'internal', 'risk', 'incidents/year', 2, true
FROM value_drivers WHERE code = 'VD-RSK-070'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-073', 'Automate Compliance Monitoring', 'Use AI to detect compliance issues early', id, 3, 'internal', 'risk', 'detection rate', 3, true
FROM value_drivers WHERE code = 'VD-RSK-070'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- L3: Data Protection Risk Sub-drivers
INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-091', 'Ensure HIPAA Compliance', 'Maintain patient data privacy', id, 3, 'internal', 'risk', 'incidents/year', 1, true
FROM value_drivers WHERE code = 'VD-RSK-090'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO value_drivers (code, name, description, parent_id, level, driver_type, value_category, unit, display_order, is_active)
SELECT 'VD-RSK-092', 'Ensure GDPR Compliance', 'Maintain EU data protection compliance', id, 3, 'internal', 'risk', 'incidents/year', 2, true
FROM value_drivers WHERE code = 'VD-RSK-090'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- ============================================================================
-- SECTION 6: TACTICS (Leaf-Level Actions)
-- Note: Tactics are skipped in v2 to simplify initial seed
-- The value_driver_tactics table can be populated later once drivers are stable
-- ============================================================================

-- Tactics will be added in a separate migration after value drivers are confirmed working

-- ============================================================================
-- SECTION 7: FUNCTION -> VALUE DRIVER MAPPING
-- ============================================================================

-- Medical Affairs Primary Ownership
INSERT INTO function_value_drivers (function_id, value_driver_id, ownership_type, accountability_level)
SELECT f.id, vd.id, 'primary', 'accountable'
FROM org_functions f, value_drivers vd
WHERE f.name = 'Medical Affairs'
AND vd.code IN ('VD-REV-011', 'VD-REV-013', 'VD-REV-121', 'VD-REV-131', 'VD-CST-010', 'VD-RSK-010', 'VD-RSK-070')
ON CONFLICT (function_id, value_driver_id) DO UPDATE SET ownership_type = EXCLUDED.ownership_type;

-- Market Access Primary Ownership
INSERT INTO function_value_drivers (function_id, value_driver_id, ownership_type, accountability_level)
SELECT f.id, vd.id, 'primary', 'accountable'
FROM org_functions f, value_drivers vd
WHERE f.name = 'Market Access'
AND vd.code IN ('VD-REV-020', 'VD-REV-021', 'VD-REV-022', 'VD-REV-113')
ON CONFLICT (function_id, value_driver_id) DO UPDATE SET ownership_type = EXCLUDED.ownership_type;

-- Commercial Organization Primary Ownership
INSERT INTO function_value_drivers (function_id, value_driver_id, ownership_type, accountability_level)
SELECT f.id, vd.id, 'primary', 'accountable'
FROM org_functions f, value_drivers vd
WHERE f.name = 'Commercial Organization'
AND vd.code IN ('VD-REV-012', 'VD-REV-122', 'VD-REV-123', 'VD-REV-124', 'VD-CST-020')
ON CONFLICT (function_id, value_driver_id) DO UPDATE SET ownership_type = EXCLUDED.ownership_type;

-- Supporting Relationships - Medical Affairs
INSERT INTO function_value_drivers (function_id, value_driver_id, ownership_type, accountability_level)
SELECT f.id, vd.id, 'supporting', 'contributor'
FROM org_functions f, value_drivers vd
WHERE f.name = 'Medical Affairs'
AND vd.code IN ('VD-REV-012', 'VD-REV-020')
ON CONFLICT (function_id, value_driver_id) DO NOTHING;

-- Supporting Relationships - Market Access
INSERT INTO function_value_drivers (function_id, value_driver_id, ownership_type, accountability_level)
SELECT f.id, vd.id, 'supporting', 'contributor'
FROM org_functions f, value_drivers vd
WHERE f.name = 'Market Access'
AND vd.code IN ('VD-REV-011', 'VD-REV-013', 'VD-RSK-010')
ON CONFLICT (function_id, value_driver_id) DO NOTHING;

-- Supporting Relationships - Commercial
INSERT INTO function_value_drivers (function_id, value_driver_id, ownership_type, accountability_level)
SELECT f.id, vd.id, 'supporting', 'contributor'
FROM org_functions f, value_drivers vd
WHERE f.name = 'Commercial Organization'
AND vd.code IN ('VD-REV-011', 'VD-REV-013', 'VD-RSK-070')
ON CONFLICT (function_id, value_driver_id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT '=== VALUE DRIVERS SUMMARY ===' AS report;

SELECT
    COALESCE(level, 0) AS level,
    COALESCE(value_category, 'root') AS value_category,
    COUNT(*) AS driver_count
FROM value_drivers
GROUP BY level, value_category
ORDER BY level, value_category;

SELECT '=== CODE PATTERN VERIFICATION ===' AS report;

SELECT
    CASE
        WHEN code LIKE 'VD-REV-%' THEN 'Revenue'
        WHEN code LIKE 'VD-CST-%' THEN 'Cost'
        WHEN code LIKE 'VD-RSK-%' THEN 'Risk'
        WHEN code LIKE 'VD-ROOT-%' THEN 'Root'
        ELSE 'Other'
    END AS category,
    COUNT(*) AS count
FROM value_drivers
GROUP BY category
ORDER BY category;

SELECT '=== TOTALS ===' AS report;
SELECT COUNT(*) AS total_drivers FROM value_drivers;
SELECT COUNT(*) AS total_tactics FROM value_driver_tactics;
SELECT COUNT(*) AS total_function_mappings FROM function_value_drivers;

SELECT '=== HIERARCHY VERIFICATION (First 10 rows) ===' AS report;
SELECT code, name, parent_id IS NOT NULL AS has_parent, level
FROM value_drivers
ORDER BY code
LIMIT 10;

SELECT 'Value Drivers Seed Data v2 Loaded Successfully' AS status;
