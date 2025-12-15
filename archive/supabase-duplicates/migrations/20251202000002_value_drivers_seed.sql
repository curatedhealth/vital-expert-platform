-- ============================================================================
-- VALUE DRIVERS SEED DATA
-- Pharmaceutical Value Driver Tree with Dedicated Codes
-- Code Pattern: VD-{CATEGORY}-{SEQUENCE}
-- Categories: REV (Revenue), CST (Cost), RSK (Risk)
-- Location: .claude/docs/platform/enterprise_ontology/sql/
-- ============================================================================

-- ============================================================================
-- SECTION 1: ROOT VALUE DRIVER
-- ============================================================================

INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    ('vd000000-0000-0000-0000-000000000000', 'VD-ROOT-001', 'Sustainable Business', 'Root value driver - overall business sustainability and growth', NULL, 0, 'outcome', NULL, '$M/y', 1)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ============================================================================
-- SECTION 2: L1 - PRIMARY VALUE CATEGORIES
-- ============================================================================

INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    -- Revenue Growth
    ('vd-rev-0001-0000-0000-000000000000', 'VD-REV-001', 'Revenue Growth', 'Increase top-line revenue through volume, price, and product value', 'vd000000-0000-0000-0000-000000000000', 1, 'outcome', 'revenue', '$M/y', 1),

    -- Cost Savings
    ('vd-cst-0001-0000-0000-000000000000', 'VD-CST-001', 'Cost Savings', 'Reduce operational costs through efficiency improvements', 'vd000000-0000-0000-0000-000000000000', 1, 'outcome', 'cost', '$M/y', 2),

    -- Risk Reduction
    ('vd-rsk-0001-0000-0000-000000000000', 'VD-RSK-001', 'Risk Reduction', 'Mitigate regulatory, legal, operational, and compliance risks', 'vd000000-0000-0000-0000-000000000000', 1, 'outcome', 'risk', '$M/y', 3)

ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ============================================================================
-- SECTION 3: REVENUE DRIVERS (VD-REV-0XX)
-- ============================================================================

-- L2: Revenue Sub-categories
INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    -- Increase Volume
    ('vd-rev-0010-0000-0000-000000000000', 'VD-REV-010', 'Increase Volume', 'Grow product volume through market expansion and share gains', 'vd-rev-0001-0000-0000-000000000000', 2, 'lever', 'revenue', 'M units/y', 1),

    -- Increase Product Value
    ('vd-rev-0020-0000-0000-000000000000', 'VD-REV-020', 'Increase Product Value', 'Enhance perceived and real value of products', 'vd-rev-0001-0000-0000-000000000000', 2, 'lever', 'revenue', '$M/y', 2)

ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- L3: Volume Drivers
INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    -- Market Size
    ('vd-rev-0011-0000-0000-000000000000', 'VD-REV-011', 'Increase Market Size', 'Expand the total addressable market through awareness and access', 'vd-rev-0010-0000-0000-000000000000', 3, 'lever', 'revenue', '%', 1),

    -- Market Share
    ('vd-rev-0012-0000-0000-000000000000', 'VD-REV-012', 'Increase Market Share', 'Capture greater share of existing market', 'vd-rev-0010-0000-0000-000000000000', 3, 'lever', 'revenue', '%', 2),

    -- Length of Therapy
    ('vd-rev-0013-0000-0000-000000000000', 'VD-REV-013', 'Increase Length of Therapy', 'Extend treatment duration through efficacy and adherence', 'vd-rev-0010-0000-0000-000000000000', 3, 'lever', 'revenue', 'months', 3)

ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- L3: Product Value Drivers
INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    ('vd-rev-0021-0000-0000-000000000000', 'VD-REV-021', 'Build Product Value Story', 'Develop compelling evidence-based value propositions', 'vd-rev-0020-0000-0000-000000000000', 3, 'lever', 'revenue', '%', 1),
    ('vd-rev-0022-0000-0000-000000000000', 'VD-REV-022', 'Offer Additional Services', 'Provide value-added services beyond the product', 'vd-rev-0020-0000-0000-000000000000', 3, 'lever', 'revenue', '$M/y', 2)

ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- L4: Market Size Sub-drivers
INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    ('vd-rev-0111-0000-0000-000000000000', 'VD-REV-111', 'Increase Disease Awareness', 'Improve public and HCP awareness of disease conditions', 'vd-rev-0011-0000-0000-000000000000', 4, 'lever', 'revenue', '%', 1),
    ('vd-rev-0112-0000-0000-000000000000', 'VD-REV-112', 'Increase Diagnostics', 'Improve diagnostic rates for target conditions', 'vd-rev-0011-0000-0000-000000000000', 4, 'lever', 'revenue', '%', 2),
    ('vd-rev-0113-0000-0000-000000000000', 'VD-REV-113', 'Increase Access to Treatment', 'Remove barriers to treatment access', 'vd-rev-0011-0000-0000-000000000000', 4, 'lever', 'revenue', '%', 3)

ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- L4: Market Share Sub-drivers
INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    ('vd-rev-0121-0000-0000-000000000000', 'VD-REV-121', 'Enhance Medical Efforts', 'Optimize medical affairs strategy and execution', 'vd-rev-0012-0000-0000-000000000000', 4, 'lever', 'revenue', '%', 1),
    ('vd-rev-0122-0000-0000-000000000000', 'VD-REV-122', 'Enhance Sales & Marketing', 'Optimize commercial sales and marketing activities', 'vd-rev-0012-0000-0000-000000000000', 4, 'lever', 'revenue', '%', 2),
    ('vd-rev-0123-0000-0000-000000000000', 'VD-REV-123', 'Enhance Brand Image', 'Strengthen brand positioning and perception', 'vd-rev-0012-0000-0000-000000000000', 4, 'lever', 'revenue', '%', 3),
    ('vd-rev-0124-0000-0000-000000000000', 'VD-REV-124', 'Enhance HCP Loyalty', 'Build stronger relationships with healthcare providers', 'vd-rev-0012-0000-0000-000000000000', 4, 'lever', 'revenue', '%', 4)

ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- L4: Length of Therapy Sub-drivers
INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    ('vd-rev-0131-0000-0000-000000000000', 'VD-REV-131', 'Prove Long-term Efficacy', 'Generate evidence for sustained treatment benefits', 'vd-rev-0013-0000-0000-000000000000', 4, 'lever', 'revenue', '%', 1),
    ('vd-rev-0132-0000-0000-000000000000', 'VD-REV-132', 'Develop Patient Support Programs', 'Create programs to support patient adherence and outcomes', 'vd-rev-0013-0000-0000-000000000000', 4, 'lever', 'revenue', '%', 2),
    ('vd-rev-0133-0000-0000-000000000000', 'VD-REV-133', 'Reduce Product Switch', 'Minimize patient switching to competitive products', 'vd-rev-0013-0000-0000-000000000000', 4, 'lever', 'revenue', '%', 3)

ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ============================================================================
-- SECTION 4: COST DRIVERS (VD-CST-0XX)
-- ============================================================================

INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    ('vd-cst-0010-0000-0000-000000000000', 'VD-CST-010', 'Improve Medical Operations Efficiency', 'Optimize Medical Affairs operational processes', 'vd-cst-0001-0000-0000-000000000000', 2, 'lever', 'cost', '$M/y', 1),
    ('vd-cst-0020-0000-0000-000000000000', 'VD-CST-020', 'Improve Commercial Operations Efficiency', 'Optimize Commercial operational processes', 'vd-cst-0001-0000-0000-000000000000', 2, 'lever', 'cost', '$M/y', 2),
    ('vd-cst-0030-0000-0000-000000000000', 'VD-CST-030', 'Improve Business Operations Efficiency', 'Optimize cross-functional business processes', 'vd-cst-0001-0000-0000-000000000000', 2, 'lever', 'cost', '$M/y', 3),
    ('vd-cst-0040-0000-0000-000000000000', 'VD-CST-040', 'Improve IT Operations Efficiency', 'Optimize technology and infrastructure costs', 'vd-cst-0001-0000-0000-000000000000', 2, 'lever', 'cost', '$M/y', 4)

ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- L3: Cost Sub-drivers
INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    -- Medical Ops Efficiency
    ('vd-cst-0011-0000-0000-000000000000', 'VD-CST-011', 'Automate Literature Review', 'Reduce manual effort in scientific literature analysis', 'vd-cst-0010-0000-0000-000000000000', 3, 'tactic', 'cost', 'hours/week', 1),
    ('vd-cst-0012-0000-0000-000000000000', 'VD-CST-012', 'Streamline Medical Information', 'Optimize medical inquiry response processes', 'vd-cst-0010-0000-0000-000000000000', 3, 'tactic', 'cost', 'hours/week', 2),
    ('vd-cst-0013-0000-0000-000000000000', 'VD-CST-013', 'Optimize KOL Management', 'Improve efficiency of KOL engagement activities', 'vd-cst-0010-0000-0000-000000000000', 3, 'tactic', 'cost', 'FTE', 3),

    -- Commercial Ops Efficiency
    ('vd-cst-0021-0000-0000-000000000000', 'VD-CST-021', 'Automate Sales Reporting', 'Reduce manual sales reporting and analysis', 'vd-cst-0020-0000-0000-000000000000', 3, 'tactic', 'cost', 'hours/week', 1),
    ('vd-cst-0022-0000-0000-000000000000', 'VD-CST-022', 'Optimize Marketing Operations', 'Streamline marketing campaign execution', 'vd-cst-0020-0000-0000-000000000000', 3, 'tactic', 'cost', '$K/campaign', 2),
    ('vd-cst-0023-0000-0000-000000000000', 'VD-CST-023', 'Improve Territory Management', 'Optimize sales territory planning and allocation', 'vd-cst-0020-0000-0000-000000000000', 3, 'tactic', 'cost', 'FTE', 3),

    -- Business Ops Efficiency
    ('vd-cst-0031-0000-0000-000000000000', 'VD-CST-031', 'Streamline Cross-functional Processes', 'Reduce friction in cross-team workflows', 'vd-cst-0030-0000-0000-000000000000', 3, 'tactic', 'cost', 'hours/week', 1),
    ('vd-cst-0032-0000-0000-000000000000', 'VD-CST-032', 'Automate Compliance Monitoring', 'Reduce manual compliance checking effort', 'vd-cst-0030-0000-0000-000000000000', 3, 'tactic', 'cost', 'FTE', 2),

    -- IT Ops Efficiency
    ('vd-cst-0041-0000-0000-000000000000', 'VD-CST-041', 'Optimize Infrastructure Costs', 'Reduce cloud and on-premise infrastructure spend', 'vd-cst-0040-0000-0000-000000000000', 3, 'tactic', 'cost', '$K/month', 1),
    ('vd-cst-0042-0000-0000-000000000000', 'VD-CST-042', 'Consolidate Technology Platforms', 'Reduce tool sprawl and licensing costs', 'vd-cst-0040-0000-0000-000000000000', 3, 'tactic', 'cost', '$K/year', 2)

ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ============================================================================
-- SECTION 5: RISK DRIVERS (VD-RSK-0XX)
-- ============================================================================

INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    ('vd-rsk-0010-0000-0000-000000000000', 'VD-RSK-010', 'Mitigate Regulatory Risks', 'Ensure compliance with FDA, EMA, and other regulatory requirements', 'vd-rsk-0001-0000-0000-000000000000', 2, 'lever', 'risk', '$M/y', 1),
    ('vd-rsk-0020-0000-0000-000000000000', 'VD-RSK-020', 'Mitigate Legal Risks', 'Reduce exposure to litigation and legal challenges', 'vd-rsk-0001-0000-0000-000000000000', 2, 'lever', 'risk', '$M/y', 2),
    ('vd-rsk-0030-0000-0000-000000000000', 'VD-RSK-030', 'Minimize Financial Risks', 'Protect against financial exposure and volatility', 'vd-rsk-0001-0000-0000-000000000000', 2, 'lever', 'risk', '$M/y', 3),
    ('vd-rsk-0040-0000-0000-000000000000', 'VD-RSK-040', 'Reduce Operational Risks', 'Minimize operational disruptions and failures', 'vd-rsk-0001-0000-0000-000000000000', 2, 'lever', 'risk', '$M/y', 4),
    ('vd-rsk-0050-0000-0000-000000000000', 'VD-RSK-050', 'Mitigate Reputational Risks', 'Protect brand and corporate reputation', 'vd-rsk-0001-0000-0000-000000000000', 2, 'lever', 'risk', '$M/y', 5),
    ('vd-rsk-0060-0000-0000-000000000000', 'VD-RSK-060', 'Minimize Environmental Risks', 'Ensure environmental compliance and sustainability', 'vd-rsk-0001-0000-0000-000000000000', 2, 'lever', 'risk', '$M/y', 6),
    ('vd-rsk-0070-0000-0000-000000000000', 'VD-RSK-070', 'Mitigate Compliance Risks', 'Ensure adherence to industry standards and policies', 'vd-rsk-0001-0000-0000-000000000000', 2, 'lever', 'risk', '$M/y', 7),
    ('vd-rsk-0080-0000-0000-000000000000', 'VD-RSK-080', 'Manage Supply Chain Risks', 'Ensure supply chain resilience and continuity', 'vd-rsk-0001-0000-0000-000000000000', 2, 'lever', 'risk', '$M/y', 8),
    ('vd-rsk-0090-0000-0000-000000000000', 'VD-RSK-090', 'Reduce Data Protection Risks', 'Protect sensitive data and ensure privacy compliance', 'vd-rsk-0001-0000-0000-000000000000', 2, 'lever', 'risk', '$M/y', 9),
    ('vd-rsk-0100-0000-0000-000000000000', 'VD-RSK-100', 'Protect IP Rights', 'Safeguard intellectual property and patents', 'vd-rsk-0001-0000-0000-000000000000', 2, 'lever', 'risk', '$M/y', 10)

ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- L3: Risk Sub-drivers
INSERT INTO value_drivers (id, code, name, description, parent_id, level, driver_type, value_category, unit, display_order)
VALUES
    -- Regulatory Risk
    ('vd-rsk-0011-0000-0000-000000000000', 'VD-RSK-011', 'Ensure FDA Compliance', 'Maintain compliance with FDA regulations', 'vd-rsk-0010-0000-0000-000000000000', 3, 'tactic', 'risk', 'incidents/year', 1),
    ('vd-rsk-0012-0000-0000-000000000000', 'VD-RSK-012', 'Ensure EMA Compliance', 'Maintain compliance with EMA regulations', 'vd-rsk-0010-0000-0000-000000000000', 3, 'tactic', 'risk', 'incidents/year', 2),
    ('vd-rsk-0013-0000-0000-000000000000', 'VD-RSK-013', 'Monitor Regulatory Changes', 'Track and respond to regulatory updates', 'vd-rsk-0010-0000-0000-000000000000', 3, 'tactic', 'risk', 'hours/week', 3),

    -- Compliance Risk
    ('vd-rsk-0071-0000-0000-000000000000', 'VD-RSK-071', 'Ensure HCP Engagement Compliance', 'Maintain compliant HCP interactions', 'vd-rsk-0070-0000-0000-000000000000', 3, 'tactic', 'risk', 'incidents/year', 1),
    ('vd-rsk-0072-0000-0000-000000000000', 'VD-RSK-072', 'Ensure Promotional Compliance', 'Maintain compliant promotional activities', 'vd-rsk-0070-0000-0000-000000000000', 3, 'tactic', 'risk', 'incidents/year', 2),
    ('vd-rsk-0073-0000-0000-000000000000', 'VD-RSK-073', 'Automate Compliance Monitoring', 'Use AI to detect compliance issues early', 'vd-rsk-0070-0000-0000-000000000000', 3, 'tactic', 'risk', 'detection rate', 3),

    -- Data Protection Risk
    ('vd-rsk-0091-0000-0000-000000000000', 'VD-RSK-091', 'Ensure HIPAA Compliance', 'Maintain patient data privacy', 'vd-rsk-0090-0000-0000-000000000000', 3, 'tactic', 'risk', 'incidents/year', 1),
    ('vd-rsk-0092-0000-0000-000000000000', 'VD-RSK-092', 'Ensure GDPR Compliance', 'Maintain EU data protection compliance', 'vd-rsk-0090-0000-0000-000000000000', 3, 'tactic', 'risk', 'incidents/year', 2)

ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ============================================================================
-- SECTION 6: TACTICS (Leaf-Level Actions)
-- ============================================================================

-- Disease Awareness Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0111-0000-0000-000000000000', 'VD-TAC-REV-111-01', 'Implement data-driven communication strategies', 'data_analytics', 'high'),
    ('vd-rev-0111-0000-0000-000000000000', 'VD-TAC-REV-111-02', 'Leverage digital channels and platforms', 'digital_platform', 'high'),
    ('vd-rev-0111-0000-0000-000000000000', 'VD-TAC-REV-111-03', 'Utilize patient data for targeted campaigns', 'data_analytics', 'high')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- Diagnostics Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0112-0000-0000-000000000000', 'VD-TAC-REV-112-01', 'Develop digital diagnostic tools', 'digital_platform', 'high'),
    ('vd-rev-0112-0000-0000-000000000000', 'VD-TAC-REV-112-02', 'Utilize analytics to improve diagnostic accuracy', 'data_analytics', 'high'),
    ('vd-rev-0112-0000-0000-000000000000', 'VD-TAC-REV-112-03', 'Leverage platforms for patient identification', 'digital_platform', 'medium')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- Access to Treatment Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0113-0000-0000-000000000000', 'VD-TAC-REV-113-01', 'Use analytics to identify unmet needs', 'data_analytics', 'high'),
    ('vd-rev-0113-0000-0000-000000000000', 'VD-TAC-REV-113-02', 'Generate evidence to address access barriers', 'data_analytics', 'medium'),
    ('vd-rev-0113-0000-0000-000000000000', 'VD-TAC-REV-113-03', 'Leverage digital channels for value dissemination', 'digital_platform', 'high')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- Medical Efforts Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0121-0000-0000-000000000000', 'VD-TAC-REV-121-01', 'Utilize analytics to optimize medical strategy', 'data_analytics', 'high'),
    ('vd-rev-0121-0000-0000-000000000000', 'VD-TAC-REV-121-02', 'Leverage digital platforms for medical education', 'digital_platform', 'high'),
    ('vd-rev-0121-0000-0000-000000000000', 'VD-TAC-REV-121-03', 'Use data-driven capabilities for HCP engagement', 'data_analytics', 'high')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- Sales & Marketing Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0122-0000-0000-000000000000', 'VD-TAC-REV-122-01', 'Utilize analytics to optimize sales strategies', 'data_analytics', 'high'),
    ('vd-rev-0122-0000-0000-000000000000', 'VD-TAC-REV-122-02', 'Leverage digital platforms for reach and conversion', 'digital_platform', 'high'),
    ('vd-rev-0122-0000-0000-000000000000', 'VD-TAC-REV-122-03', 'Implement AI-powered customer engagement', 'ai_automation', 'high'),
    ('vd-rev-0122-0000-0000-000000000000', 'VD-TAC-REV-122-04', 'Use digital campaigns for targeted audiences', 'digital_platform', 'high'),
    ('vd-rev-0122-0000-0000-000000000000', 'VD-TAC-REV-122-05', 'Develop self-service portals for customers', 'digital_platform', 'medium'),
    ('vd-rev-0122-0000-0000-000000000000', 'VD-TAC-REV-122-06', 'Implement chatbot for customer service', 'ai_automation', 'high'),
    ('vd-rev-0122-0000-0000-000000000000', 'VD-TAC-REV-122-07', 'Track and measure digital engagement effectiveness', 'data_analytics', 'high')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- Brand Image Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0123-0000-0000-000000000000', 'VD-TAC-REV-123-01', 'Use analytics to inform brand positioning', 'data_analytics', 'medium'),
    ('vd-rev-0123-0000-0000-000000000000', 'VD-TAC-REV-123-02', 'Leverage digital channels for brand promotion', 'digital_platform', 'medium'),
    ('vd-rev-0123-0000-0000-000000000000', 'VD-TAC-REV-123-03', 'Utilize analytics to measure brand perception', 'data_analytics', 'high')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- HCP Loyalty Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0124-0000-0000-000000000000', 'VD-TAC-REV-124-01', 'Use analytics to understand HCP needs', 'data_analytics', 'high'),
    ('vd-rev-0124-0000-0000-000000000000', 'VD-TAC-REV-124-02', 'Develop digital engagement programs for HCPs', 'digital_platform', 'high'),
    ('vd-rev-0124-0000-0000-000000000000', 'VD-TAC-REV-124-03', 'Use analytics to measure HCP experience', 'data_analytics', 'high')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- Long-term Efficacy Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0131-0000-0000-000000000000', 'VD-TAC-REV-131-01', 'Utilize analytics for clinical trial design', 'data_analytics', 'high'),
    ('vd-rev-0131-0000-0000-000000000000', 'VD-TAC-REV-131-02', 'Leverage platforms for patient recruitment', 'digital_platform', 'high'),
    ('vd-rev-0131-0000-0000-000000000000', 'VD-TAC-REV-131-03', 'Use analytics to generate real-world evidence', 'data_analytics', 'high')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- Patient Support Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0132-0000-0000-000000000000', 'VD-TAC-REV-132-01', 'Utilize analytics to identify patient needs', 'data_analytics', 'high'),
    ('vd-rev-0132-0000-0000-000000000000', 'VD-TAC-REV-132-02', 'Develop digital engagement programs for patients', 'digital_platform', 'high'),
    ('vd-rev-0132-0000-0000-000000000000', 'VD-TAC-REV-132-03', 'Use analytics to measure patient adherence', 'data_analytics', 'high')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- Reduce Product Switch Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0133-0000-0000-000000000000', 'VD-TAC-REV-133-01', 'Utilize analytics to identify switching factors', 'data_analytics', 'high'),
    ('vd-rev-0133-0000-0000-000000000000', 'VD-TAC-REV-133-02', 'Develop digital tools for treatment adherence', 'digital_platform', 'high'),
    ('vd-rev-0133-0000-0000-000000000000', 'VD-TAC-REV-133-03', 'Use analytics to improve product retention', 'data_analytics', 'high')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- Product Value Story Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0021-0000-0000-000000000000', 'VD-TAC-REV-021-01', 'Leverage analytics to demonstrate patient outcomes', 'data_analytics', 'high'),
    ('vd-rev-0021-0000-0000-000000000000', 'VD-TAC-REV-021-02', 'Use analytics to identify unmet patient needs', 'data_analytics', 'high'),
    ('vd-rev-0021-0000-0000-000000000000', 'VD-TAC-REV-021-03', 'Generate real-world evidence for value demonstration', 'data_analytics', 'high'),
    ('vd-rev-0021-0000-0000-000000000000', 'VD-TAC-REV-021-04', 'Measure and communicate value to stakeholders', 'data_analytics', 'high')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- Additional Services Tactics
INSERT INTO value_driver_tactics (value_driver_id, code, name, tactic_type, ai_enablement_potential)
VALUES
    ('vd-rev-0022-0000-0000-000000000000', 'VD-TAC-REV-022-01', 'Develop digital services for payers', 'digital_platform', 'medium'),
    ('vd-rev-0022-0000-0000-000000000000', 'VD-TAC-REV-022-02', 'Develop digital services for HCPs and hospitals', 'digital_platform', 'high'),
    ('vd-rev-0022-0000-0000-000000000000', 'VD-TAC-REV-022-03', 'Leverage platforms for value-based pricing', 'digital_platform', 'medium')
ON CONFLICT (value_driver_id, code) DO NOTHING;

-- ============================================================================
-- SECTION 7: FUNCTION ↔ VALUE DRIVER MAPPING
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
-- VERIFICATION
-- ============================================================================

SELECT '=== VALUE DRIVERS SUMMARY ===' AS report;

SELECT
    level,
    value_category,
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
        ELSE 'Other'
    END AS category,
    COUNT(*) AS count
FROM value_drivers
WHERE code != 'VD-ROOT-001'
GROUP BY category
ORDER BY category;

SELECT '=== TOTALS ===' AS report;
SELECT COUNT(*) AS total_drivers FROM value_drivers;
SELECT COUNT(*) AS total_tactics FROM value_driver_tactics;
SELECT COUNT(*) AS total_function_mappings FROM function_value_drivers;

SELECT 'Value Drivers Seed Data with Dedicated Codes Loaded Successfully' AS status;
