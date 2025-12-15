-- ============================================================================
-- Migration: 052 - Commercial Organization JTBDs Seed
-- Description: Comprehensive JTBDs for Commercial Organization function
-- Created: 2024-11-29
-- Tenant: Pharmaceuticals (c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b)
-- Function: Commercial Organization (b718e2d1-40c4-478c-9bbb-695b931ce1bb)
-- ============================================================================

-- JTBDs organized by specialty:
-- 1. Sales Leadership & Strategy - 6 JTBDs
-- 2. Field Sales Execution - 6 JTBDs
-- 3. Key Account Management - 5 JTBDs
-- 4. Sales Force Effectiveness - 5 JTBDs
-- 5. Business Development - 5 JTBDs
-- 6. Trade & Distribution - 4 JTBDs
-- 7. Sales Analytics & Operations - 5 JTBDs
-- 8. Customer Engagement - 4 JTBDs

DO $$
DECLARE
    v_tenant_id UUID := 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';
    v_function_id UUID := 'b718e2d1-40c4-478c-9bbb-695b931ce1bb';
BEGIN
    RAISE NOTICE 'Starting Commercial Organization JTBDs seed...';
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Function ID: %', v_function_id;

    -- =========================================================================
    -- 1. SALES LEADERSHIP & STRATEGY - 6 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-CO-SL001: Sales Strategy Development
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SL001', 'Develop National Sales Strategy',
         'When planning for the fiscal year, I want to develop a comprehensive national sales strategy that aligns sales targets, resource allocation, and go-to-market approach with corporate objectives, so I can position my organization to achieve and exceed revenue goals while maximizing market share.',
         'Commercial', 'strategic', 'high', 'annually', 'active', 0.92,
         'strategic', 'project', 'critical', 'critical', 'medium', 'L1_expert'),

        -- JTBD-CO-SL002: Territory Design & Optimization
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SL002', 'Optimize Sales Territory Design',
         'When balancing sales resources, I want to design and optimize sales territories that equalize opportunity, minimize travel burden, and align with customer concentration patterns, so I can ensure fair quota distribution and maximize field team productivity.',
         'Commercial', 'analytical', 'high', 'annually', 'active', 0.89,
         'operational', 'project', 'high', 'high', 'low', 'L1_expert'),

        -- JTBD-CO-SL003: Sales Force Sizing
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SL003', 'Determine Optimal Sales Force Size',
         'When planning resource investments, I want to conduct rigorous sales force sizing analyses that model the relationship between call frequency, reach, and revenue, so I can optimize our sales investment and justify headcount decisions to leadership.',
         'Commercial', 'analytical', 'high', 'annually', 'active', 0.88,
         'strategic', 'project', 'high', 'high', 'low', 'L1_expert'),

        -- JTBD-CO-SL004: Launch Readiness
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SL004', 'Execute Commercial Launch Readiness',
         'When preparing for product launches, I want to orchestrate comprehensive commercial launch readiness activities including field training, materials development, and customer targeting, so I can ensure maximum impact from day one of product availability.',
         'Commercial', 'coordination', 'high', 'quarterly', 'active', 0.91,
         'strategic', 'project', 'critical', 'critical', 'high', 'L1_expert'),

        -- JTBD-CO-SL005: Sales Performance Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SL005', 'Drive Sales Performance Management',
         'When managing team performance, I want to implement robust performance management systems that set clear expectations, track leading indicators, and enable timely coaching interventions, so I can develop high-performing sales teams that consistently hit targets.',
         'Commercial', 'management', 'high', 'weekly', 'active', 0.90,
         'operational', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-SL006: Incentive Compensation Design
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SL006', 'Design Incentive Compensation Plans',
         'When motivating sales performance, I want to design incentive compensation plans that align rep behaviors with strategic priorities while remaining competitive for talent acquisition, so I can drive the right selling behaviors and retain top performers.',
         'Commercial', 'strategic', 'high', 'annually', 'active', 0.87,
         'operational', 'project', 'high', 'high', 'medium', 'L2_panel')
    ON CONFLICT (code, tenant_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        validation_score = EXCLUDED.validation_score,
        jtbd_type = EXCLUDED.jtbd_type,
        work_pattern = EXCLUDED.work_pattern,
        strategic_priority = EXCLUDED.strategic_priority,
        impact_level = EXCLUDED.impact_level,
        compliance_sensitivity = EXCLUDED.compliance_sensitivity,
        recommended_service_layer = EXCLUDED.recommended_service_layer,
        updated_at = NOW();

    RAISE NOTICE '✓ Created 6 Sales Leadership & Strategy JTBDs';

    -- =========================================================================
    -- 2. FIELD SALES EXECUTION - 6 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-CO-FS001: Call Planning
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-FS001', 'Plan Effective Customer Calls',
         'When preparing for customer interactions, I want to develop call plans that are tailored to each HCP''s prescribing patterns, patient population, and previous interactions, so I can deliver relevant, personalized messages that advance my commercial objectives.',
         'Commercial', 'operational', 'medium', 'daily', 'active', 0.88,
         'operational', 'recurring', 'high', 'high', 'high', 'L1_expert'),

        -- JTBD-CO-FS002: Territory Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-FS002', 'Manage Territory Effectively',
         'When managing my assigned territory, I want to strategically prioritize accounts, plan efficient routing, and balance call frequency across customer segments, so I can maximize my reach and impact within available selling time.',
         'Commercial', 'operational', 'medium', 'weekly', 'active', 0.87,
         'operational', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-FS003: HCP Engagement
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-FS003', 'Execute Effective HCP Engagements',
         'When interacting with healthcare professionals, I want to deliver compelling, compliant scientific discussions that address their clinical questions and patient needs, so I can build trusted relationships and drive appropriate product consideration.',
         'Commercial', 'stakeholder', 'medium', 'daily', 'active', 0.90,
         'operational', 'recurring', 'high', 'high', 'critical', 'L1_expert'),

        -- JTBD-CO-FS004: Competitive Response
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-FS004', 'Respond to Competitive Activity',
         'When facing competitive pressures, I want to identify and respond to competitor moves in my territory with appropriate counter-messaging and intensified coverage, so I can protect and grow my market share position.',
         'Commercial', 'tactical', 'medium', 'weekly', 'active', 0.86,
         'operational', 'recurring', 'high', 'medium', 'high', 'L1_expert'),

        -- JTBD-CO-FS005: Speaker Program Execution
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-FS005', 'Execute Local Speaker Programs',
         'When leveraging peer influence, I want to plan and execute local speaker programs that feature credible KOLs presenting to relevant HCP audiences, so I can extend my reach and drive adoption through peer-to-peer education.',
         'Commercial', 'events', 'medium', 'monthly', 'active', 0.85,
         'operational', 'project', 'medium', 'medium', 'critical', 'L2_panel'),

        -- JTBD-CO-FS006: Sample Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-FS006', 'Manage Sample Distribution',
         'When providing product samples, I want to strategically distribute samples to appropriate HCPs while maintaining full compliance with sample accountability requirements, so I can facilitate trial while managing inventory and audit risk.',
         'Commercial', 'compliance', 'low', 'daily', 'active', 0.84,
         'operational', 'recurring', 'medium', 'medium', 'critical', 'L0_ask')
    ON CONFLICT (code, tenant_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        validation_score = EXCLUDED.validation_score,
        jtbd_type = EXCLUDED.jtbd_type,
        work_pattern = EXCLUDED.work_pattern,
        strategic_priority = EXCLUDED.strategic_priority,
        impact_level = EXCLUDED.impact_level,
        compliance_sensitivity = EXCLUDED.compliance_sensitivity,
        recommended_service_layer = EXCLUDED.recommended_service_layer,
        updated_at = NOW();

    RAISE NOTICE '✓ Created 6 Field Sales Execution JTBDs';

    -- =========================================================================
    -- 3. KEY ACCOUNT MANAGEMENT - 5 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-CO-KA001: Strategic Account Planning
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-KA001', 'Develop Strategic Account Plans',
         'When managing major accounts, I want to develop comprehensive strategic account plans that map decision-makers, understand organizational priorities, and identify value-creation opportunities, so I can build deep partnerships that drive preferred access and growth.',
         'Commercial', 'strategic', 'high', 'quarterly', 'active', 0.91,
         'strategic', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-KA002: IDN/Health System Contracting
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-KA002', 'Negotiate IDN/Health System Contracts',
         'When engaging integrated delivery networks, I want to negotiate value-based contracts that align our products with health system quality and cost objectives, so I can secure preferred formulary positioning and pull-through commitment.',
         'Commercial', 'negotiation', 'high', 'quarterly', 'active', 0.89,
         'operational', 'project', 'high', 'critical', 'high', 'L1_expert'),

        -- JTBD-CO-KA003: GPO Relationship Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-KA003', 'Manage GPO Relationships',
         'When working with group purchasing organizations, I want to maintain strong GPO relationships that secure favorable contract positioning and drive member awareness, so I can leverage GPO influence to expand institutional access.',
         'Commercial', 'stakeholder', 'high', 'monthly', 'active', 0.87,
         'operational', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-KA004: Account Performance Tracking
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-KA004', 'Track Key Account Performance',
         'When monitoring account health, I want to track key account performance metrics including contract compliance, market share, and relationship scores, so I can identify issues early and demonstrate value delivered to account stakeholders.',
         'Commercial', 'analytical', 'medium', 'weekly', 'active', 0.86,
         'operational', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-KA005: Cross-Functional Account Coordination
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-KA005', 'Coordinate Cross-Functional Account Teams',
         'When managing complex accounts, I want to orchestrate cross-functional account teams including Medical, Access, and Commercial colleagues, so I can deliver integrated solutions that address the full range of account needs.',
         'Commercial', 'coordination', 'high', 'monthly', 'active', 0.88,
         'operational', 'recurring', 'high', 'high', 'medium', 'L2_panel')
    ON CONFLICT (code, tenant_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        validation_score = EXCLUDED.validation_score,
        jtbd_type = EXCLUDED.jtbd_type,
        work_pattern = EXCLUDED.work_pattern,
        strategic_priority = EXCLUDED.strategic_priority,
        impact_level = EXCLUDED.impact_level,
        compliance_sensitivity = EXCLUDED.compliance_sensitivity,
        recommended_service_layer = EXCLUDED.recommended_service_layer,
        updated_at = NOW();

    RAISE NOTICE '✓ Created 5 Key Account Management JTBDs';

    -- =========================================================================
    -- 4. SALES FORCE EFFECTIVENESS - 5 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-CO-SF001: Sales Training Program Design
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SF001', 'Design Sales Training Programs',
         'When developing sales capabilities, I want to design and deliver comprehensive training programs that build product knowledge, selling skills, and market understanding, so I can equip sales teams to execute effectively in the field.',
         'Commercial', 'enablement', 'high', 'quarterly', 'active', 0.89,
         'operational', 'project', 'high', 'high', 'high', 'L1_expert'),

        -- JTBD-CO-SF002: Sales Coaching Programs
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SF002', 'Implement Sales Coaching Programs',
         'When developing sales talent, I want to implement systematic coaching programs that provide managers with tools and skills to develop their teams through observation, feedback, and role-playing, so I can build a coaching culture that drives continuous improvement.',
         'Commercial', 'development', 'high', 'monthly', 'active', 0.87,
         'operational', 'recurring', 'high', 'high', 'medium', 'L2_panel'),

        -- JTBD-CO-SF003: CRM Adoption & Optimization
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SF003', 'Drive CRM Adoption and Optimization',
         'When leveraging sales technology, I want to maximize CRM adoption and usage through training, process integration, and continuous optimization, so I can ensure data quality and provide reps with actionable customer insights.',
         'Commercial', 'operational', 'medium', 'monthly', 'active', 0.85,
         'operational', 'recurring', 'medium', 'medium', 'low', 'L2_panel'),

        -- JTBD-CO-SF004: Sales Content Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SF004', 'Manage Sales Content Library',
         'When enabling customer conversations, I want to curate and maintain a library of approved sales content including presentations, leave-behinds, and digital assets, so I can ensure reps have easy access to current, compliant materials.',
         'Commercial', 'content', 'medium', 'monthly', 'active', 0.84,
         'operational', 'recurring', 'medium', 'medium', 'high', 'L2_panel'),

        -- JTBD-CO-SF005: Field Force Communication
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SF005', 'Execute Field Force Communications',
         'When informing the sales organization, I want to develop and deliver timely, relevant field communications that update teams on strategy changes, competitive intelligence, and operational matters, so I can keep the field informed and aligned.',
         'Commercial', 'communication', 'medium', 'weekly', 'active', 0.83,
         'operational', 'recurring', 'medium', 'medium', 'medium', 'L0_ask')
    ON CONFLICT (code, tenant_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        validation_score = EXCLUDED.validation_score,
        jtbd_type = EXCLUDED.jtbd_type,
        work_pattern = EXCLUDED.work_pattern,
        strategic_priority = EXCLUDED.strategic_priority,
        impact_level = EXCLUDED.impact_level,
        compliance_sensitivity = EXCLUDED.compliance_sensitivity,
        recommended_service_layer = EXCLUDED.recommended_service_layer,
        updated_at = NOW();

    RAISE NOTICE '✓ Created 5 Sales Force Effectiveness JTBDs';

    -- =========================================================================
    -- 5. BUSINESS DEVELOPMENT - 5 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-CO-BD001: Partnership Opportunity Assessment
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-BD001', 'Assess Partnership Opportunities',
         'When evaluating strategic opportunities, I want to conduct rigorous assessments of potential licensing, co-promotion, and distribution partnerships, so I can identify opportunities that strengthen our portfolio and provide attractive risk-adjusted returns.',
         'Commercial', 'analytical', 'high', 'monthly', 'active', 0.90,
         'strategic', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-BD002: Deal Structuring
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-BD002', 'Structure Business Development Deals',
         'When negotiating partnerships, I want to structure deal terms including economics, governance, and performance milestones that protect our interests while creating win-win arrangements, so I can close deals that deliver sustainable value.',
         'Commercial', 'negotiation', 'high', 'quarterly', 'active', 0.88,
         'strategic', 'project', 'high', 'critical', 'high', 'L1_expert'),

        -- JTBD-CO-BD003: Pipeline Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-BD003', 'Manage BD Pipeline',
         'When tracking business development activities, I want to maintain a robust pipeline of opportunities at various stages, so I can ensure consistent deal flow and provide accurate forecasting to leadership.',
         'Commercial', 'operational', 'medium', 'weekly', 'active', 0.86,
         'operational', 'recurring', 'high', 'medium', 'medium', 'L1_expert'),

        -- JTBD-CO-BD004: Market Scanning
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-BD004', 'Scan Market for BD Opportunities',
         'When searching for growth opportunities, I want to systematically scan the market for assets, companies, and technologies that fit our strategic priorities, so I can identify attractive opportunities before competitors.',
         'Commercial', 'research', 'medium', 'weekly', 'active', 0.85,
         'strategic', 'recurring', 'high', 'medium', 'low', 'L1_expert'),

        -- JTBD-CO-BD005: Integration Planning
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-BD005', 'Plan Deal Integration',
         'When closing business development transactions, I want to develop comprehensive integration plans that address commercial, operational, and organizational requirements, so I can ensure smooth transitions and rapid value realization.',
         'Commercial', 'coordination', 'high', 'quarterly', 'active', 0.87,
         'operational', 'project', 'high', 'high', 'medium', 'L2_panel')
    ON CONFLICT (code, tenant_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        validation_score = EXCLUDED.validation_score,
        jtbd_type = EXCLUDED.jtbd_type,
        work_pattern = EXCLUDED.work_pattern,
        strategic_priority = EXCLUDED.strategic_priority,
        impact_level = EXCLUDED.impact_level,
        compliance_sensitivity = EXCLUDED.compliance_sensitivity,
        recommended_service_layer = EXCLUDED.recommended_service_layer,
        updated_at = NOW();

    RAISE NOTICE '✓ Created 5 Business Development JTBDs';

    -- =========================================================================
    -- 6. TRADE & DISTRIBUTION - 4 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-CO-TD001: Distribution Network Strategy
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-TD001', 'Optimize Distribution Network',
         'When managing product distribution, I want to design and optimize our distribution network including wholesaler relationships, specialty distribution, and direct-to-patient channels, so I can ensure product availability while managing inventory costs and channel conflict.',
         'Commercial', 'strategic', 'high', 'quarterly', 'active', 0.88,
         'operational', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-TD002: Trade Relations Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-TD002', 'Manage Wholesaler Relationships',
         'When working with trade partners, I want to maintain productive relationships with wholesalers and distributors through regular business reviews and collaborative problem-solving, so I can ensure reliable product flow and favorable trade terms.',
         'Commercial', 'stakeholder', 'medium', 'monthly', 'active', 0.86,
         'operational', 'recurring', 'medium', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-TD003: Inventory Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-TD003', 'Manage Channel Inventory',
         'When balancing product availability and working capital, I want to monitor and manage inventory levels across the distribution channel, so I can prevent stockouts while minimizing excess inventory and product expiration.',
         'Commercial', 'operational', 'medium', 'weekly', 'active', 0.85,
         'operational', 'recurring', 'high', 'high', 'low', 'L1_expert'),

        -- JTBD-CO-TD004: Specialty Channel Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-TD004', 'Manage Specialty Distribution Channels',
         'When distributing specialty products, I want to manage limited distribution networks and specialty pharmacies that can handle complex products and patient support requirements, so I can ensure appropriate handling and patient access support.',
         'Commercial', 'operational', 'high', 'monthly', 'active', 0.87,
         'operational', 'recurring', 'high', 'high', 'high', 'L1_expert')
    ON CONFLICT (code, tenant_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        validation_score = EXCLUDED.validation_score,
        jtbd_type = EXCLUDED.jtbd_type,
        work_pattern = EXCLUDED.work_pattern,
        strategic_priority = EXCLUDED.strategic_priority,
        impact_level = EXCLUDED.impact_level,
        compliance_sensitivity = EXCLUDED.compliance_sensitivity,
        recommended_service_layer = EXCLUDED.recommended_service_layer,
        updated_at = NOW();

    RAISE NOTICE '✓ Created 4 Trade & Distribution JTBDs';

    -- =========================================================================
    -- 7. SALES ANALYTICS & OPERATIONS - 5 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-CO-SA001: Sales Forecasting
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SA001', 'Develop Sales Forecasts',
         'When projecting business performance, I want to develop accurate sales forecasts using statistical models, market intelligence, and field input, so I can provide leadership with reliable projections for financial planning and resource allocation.',
         'Commercial', 'analytical', 'high', 'monthly', 'active', 0.90,
         'operational', 'recurring', 'critical', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-SA002: Sales Performance Analytics
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SA002', 'Analyze Sales Performance',
         'When evaluating sales effectiveness, I want to conduct deep-dive analyses of sales performance by geography, product, customer segment, and rep, so I can identify improvement opportunities and provide actionable insights to field leadership.',
         'Commercial', 'analytical', 'high', 'weekly', 'active', 0.89,
         'operational', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-SA003: Targeting & Segmentation
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SA003', 'Develop Customer Targeting & Segmentation',
         'When prioritizing sales effort, I want to develop data-driven customer segmentation and targeting models that identify high-potential HCPs and accounts, so I can optimize field resource allocation for maximum impact.',
         'Commercial', 'analytical', 'high', 'quarterly', 'active', 0.88,
         'strategic', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-SA004: Quota Setting
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SA004', 'Set Sales Quotas',
         'When establishing performance expectations, I want to set fair, motivating quotas that are grounded in market opportunity and aligned with strategic priorities, so I can drive the right behaviors while maintaining rep engagement.',
         'Commercial', 'analytical', 'high', 'annually', 'active', 0.87,
         'operational', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-SA005: Competitive Intelligence
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-SA005', 'Gather and Analyze Competitive Intelligence',
         'When monitoring the competitive landscape, I want to systematically gather and analyze competitive intelligence on products, pricing, and market activities, so I can inform strategy and equip the field to compete effectively.',
         'Commercial', 'research', 'medium', 'weekly', 'active', 0.86,
         'operational', 'recurring', 'high', 'medium', 'medium', 'L1_expert')
    ON CONFLICT (code, tenant_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        validation_score = EXCLUDED.validation_score,
        jtbd_type = EXCLUDED.jtbd_type,
        work_pattern = EXCLUDED.work_pattern,
        strategic_priority = EXCLUDED.strategic_priority,
        impact_level = EXCLUDED.impact_level,
        compliance_sensitivity = EXCLUDED.compliance_sensitivity,
        recommended_service_layer = EXCLUDED.recommended_service_layer,
        updated_at = NOW();

    RAISE NOTICE '✓ Created 5 Sales Analytics & Operations JTBDs';

    -- =========================================================================
    -- 8. CUSTOMER ENGAGEMENT - 4 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-CO-CE001: Omnichannel Strategy
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-CE001', 'Develop Omnichannel Engagement Strategy',
         'When orchestrating customer engagement, I want to develop integrated omnichannel strategies that coordinate personal, remote, and digital touchpoints based on customer preferences, so I can maximize engagement effectiveness across all channels.',
         'Commercial', 'strategic', 'high', 'quarterly', 'active', 0.89,
         'strategic', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-CO-CE002: Digital Customer Engagement
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-CE002', 'Execute Digital Customer Engagement',
         'When engaging customers digitally, I want to execute compelling digital campaigns through email, web, and social channels that deliver personalized content and drive meaningful interactions, so I can extend reach and complement field efforts.',
         'Commercial', 'digital', 'medium', 'weekly', 'active', 0.87,
         'operational', 'recurring', 'high', 'medium', 'high', 'L2_panel'),

        -- JTBD-CO-CE003: Virtual Engagement Capabilities
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-CE003', 'Build Virtual Engagement Capabilities',
         'When adapting to changing customer preferences, I want to develop robust virtual engagement capabilities including remote detailing and digital events, so I can maintain customer relationships regardless of access constraints.',
         'Commercial', 'enablement', 'high', 'quarterly', 'active', 0.86,
         'operational', 'project', 'high', 'high', 'medium', 'L2_panel'),

        -- JTBD-CO-CE004: Customer Experience Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-CO-CE004', 'Manage Customer Experience',
         'When optimizing customer relationships, I want to monitor and improve the end-to-end customer experience across all touchpoints, so I can build loyalty and differentiate through superior service.',
         'Commercial', 'quality', 'medium', 'monthly', 'active', 0.85,
         'operational', 'recurring', 'medium', 'medium', 'medium', 'L2_panel')
    ON CONFLICT (code, tenant_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        validation_score = EXCLUDED.validation_score,
        jtbd_type = EXCLUDED.jtbd_type,
        work_pattern = EXCLUDED.work_pattern,
        strategic_priority = EXCLUDED.strategic_priority,
        impact_level = EXCLUDED.impact_level,
        compliance_sensitivity = EXCLUDED.compliance_sensitivity,
        recommended_service_layer = EXCLUDED.recommended_service_layer,
        updated_at = NOW();

    RAISE NOTICE '✓ Created 4 Customer Engagement JTBDs';

    -- =========================================================================
    -- SUMMARY
    -- =========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Commercial Organization JTBDs Migration Complete!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total JTBDs Created: 40';
    RAISE NOTICE '  - Sales Leadership & Strategy: 6';
    RAISE NOTICE '  - Field Sales Execution: 6';
    RAISE NOTICE '  - Key Account Management: 5';
    RAISE NOTICE '  - Sales Force Effectiveness: 5';
    RAISE NOTICE '  - Business Development: 5';
    RAISE NOTICE '  - Trade & Distribution: 4';
    RAISE NOTICE '  - Sales Analytics & Operations: 5';
    RAISE NOTICE '  - Customer Engagement: 4';
    RAISE NOTICE '============================================';

END $$;
