-- ============================================================================
-- Migration: 051 - Market Access JTBDs Seed
-- Description: Comprehensive JTBDs for Market Access function
-- Created: 2024-11-29
-- Tenant: Pharmaceuticals (c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b)
-- Function: Market Access (b7fed05f-90b2-4c4a-a7a8-8346a3159127)
-- ============================================================================

-- JTBDs organized by specialty:
-- 1. Health Economics & Outcomes Research (HEOR) - 6 JTBDs
-- 2. Pricing Strategy - 5 JTBDs
-- 3. Payer Relations & Contracting - 6 JTBDs
-- 4. Value & Evidence - 5 JTBDs
-- 5. Market Access Strategy - 5 JTBDs
-- 6. Health Technology Assessment (HTA) - 5 JTBDs
-- 7. Real-World Evidence (RWE) - 5 JTBDs
-- 8. Access Operations - 3 JTBDs

DO $$
DECLARE
    v_tenant_id UUID := 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';
    v_function_id UUID := 'b7fed05f-90b2-4c4a-a7a8-8346a3159127';
BEGIN
    RAISE NOTICE 'Starting Market Access JTBDs seed...';
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Function ID: %', v_function_id;

    -- =========================================================================
    -- 1. HEALTH ECONOMICS & OUTCOMES RESEARCH (HEOR) - 6 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-MA-HE001: Cost-Effectiveness Analysis
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-HE001', 'Develop Cost-Effectiveness Models',
         'When preparing for HTA submissions and payer negotiations, I want to develop robust cost-effectiveness models that accurately estimate the economic value of our treatment compared to alternatives, so I can demonstrate favorable incremental cost-effectiveness ratios (ICERs) that support favorable reimbursement decisions.',
         'Market Access', 'analytical', 'high', 'quarterly', 'active', 0.91,
         'strategic', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-HE002: Budget Impact Analysis
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-HE002', 'Conduct Budget Impact Modeling',
         'When engaging with payers and health systems, I want to develop budget impact models that project the financial impact of adopting our therapy on their overall healthcare budget, so I can address affordability concerns and demonstrate manageable budget implications.',
         'Market Access', 'analytical', 'high', 'quarterly', 'active', 0.89,
         'operational', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-HE003: Systematic Literature Reviews
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-HE003', 'Execute Systematic Literature Reviews',
         'When building the evidence base for HTA submissions, I want to conduct comprehensive systematic literature reviews and meta-analyses that synthesize all relevant clinical and economic evidence, so I can provide HTA bodies with the rigorous evidence synthesis they require for assessments.',
         'Market Access', 'research', 'high', 'monthly', 'active', 0.90,
         'strategic', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-HE004: HEOR Publication Strategy
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-HE004', 'Develop HEOR Publication Strategy',
         'When building external credibility for our value proposition, I want to develop and execute a strategic HEOR publication plan that disseminates our economic evidence to peer-reviewed journals and congresses, so I can establish our product''s value credentials in the scientific community.',
         'Market Access', 'strategic', 'medium', 'quarterly', 'active', 0.87,
         'strategic', 'recurring', 'medium', 'medium', 'medium', 'L2_panel'),

        -- JTBD-MA-HE005: Economic Model Validation
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-HE005', 'Validate Economic Models',
         'When preparing models for HTA submission, I want to conduct thorough validation of our economic models including technical verification, face validity with clinical experts, and external validation against real-world data, so I can ensure our models withstand rigorous HTA scrutiny.',
         'Market Access', 'quality', 'high', 'quarterly', 'active', 0.88,
         'operational', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-HE006: Comparative Effectiveness Research
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-HE006', 'Design Comparative Effectiveness Studies',
         'When addressing evidence gaps for payer decision-making, I want to design and execute comparative effectiveness research studies that demonstrate our product''s clinical and economic advantages versus relevant comparators, so I can generate the head-to-head evidence that payers demand.',
         'Market Access', 'research', 'high', 'quarterly', 'active', 0.86,
         'strategic', 'project', 'high', 'high', 'high', 'L1_expert')
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

    RAISE NOTICE '✓ Created 6 HEOR JTBDs';

    -- =========================================================================
    -- 2. PRICING STRATEGY - 5 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-MA-PR001: Global Pricing Strategy
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PR001', 'Develop Global Pricing Strategy',
         'When launching a new product globally, I want to develop a comprehensive global pricing strategy that optimizes list prices across markets while accounting for international reference pricing and local market dynamics, so I can maximize global revenue while maintaining sustainable market access.',
         'Market Access', 'strategic', 'high', 'annually', 'active', 0.93,
         'strategic', 'project', 'critical', 'critical', 'high', 'L1_expert'),

        -- JTBD-MA-PR002: Value-Based Pricing
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PR002', 'Design Value-Based Pricing Frameworks',
         'When positioning our therapy in the market, I want to develop value-based pricing models that align our price with demonstrated clinical and economic value outcomes, so I can justify premium pricing through transparent value-price relationships that resonate with payers.',
         'Market Access', 'strategic', 'high', 'quarterly', 'active', 0.90,
         'strategic', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-PR003: Launch Price Optimization
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PR003', 'Optimize Launch Pricing',
         'When preparing for product launch, I want to conduct comprehensive price optimization analyses including willingness-to-pay research, competitive pricing intelligence, and scenario modeling, so I can set an optimal launch price that balances access, revenue, and long-term market position.',
         'Market Access', 'analytical', 'high', 'quarterly', 'active', 0.91,
         'strategic', 'project', 'critical', 'critical', 'medium', 'L1_expert'),

        -- JTBD-MA-PR004: Reference Pricing Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PR004', 'Manage International Reference Pricing',
         'When setting prices across multiple markets, I want to model and manage the impact of international reference pricing on our global price corridor, so I can optimize launch sequencing and minimize adverse reference pricing spillover effects.',
         'Market Access', 'analytical', 'high', 'monthly', 'active', 0.88,
         'operational', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-PR005: Contracting Strategy
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PR005', 'Develop Innovative Contracting Models',
         'When negotiating with payers, I want to develop innovative contracting approaches including outcomes-based contracts, volume-based agreements, and risk-sharing arrangements, so I can address payer budget concerns while protecting our price integrity and market access.',
         'Market Access', 'strategic', 'high', 'quarterly', 'active', 0.87,
         'strategic', 'project', 'high', 'high', 'high', 'L2_panel')
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

    RAISE NOTICE '✓ Created 5 Pricing Strategy JTBDs';

    -- =========================================================================
    -- 3. PAYER RELATIONS & CONTRACTING - 6 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-MA-PC001: Payer Engagement Strategy
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PC001', 'Develop Payer Engagement Strategy',
         'When launching products or expanding access, I want to develop comprehensive payer engagement strategies that identify key payer decision-makers, understand their priorities, and establish credible relationships, so I can effectively communicate our value proposition to influence formulary and coverage decisions.',
         'Market Access', 'strategic', 'high', 'quarterly', 'active', 0.90,
         'strategic', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-PC002: Formulary Positioning
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PC002', 'Secure Optimal Formulary Positioning',
         'When seeking formulary inclusion, I want to develop compelling formulary dossiers and conduct effective P&T committee presentations that differentiate our therapy, so I can achieve optimal tier placement and minimal prior authorization barriers.',
         'Market Access', 'strategic', 'high', 'monthly', 'active', 0.89,
         'operational', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-PC003: Contract Negotiation
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PC003', 'Execute Payer Contract Negotiations',
         'When establishing commercial agreements with payers, I want to negotiate contracts that balance favorable rebate/discount terms with access commitments, so I can secure broad patient access while protecting net revenue and avoiding adverse precedents.',
         'Market Access', 'operational', 'high', 'monthly', 'active', 0.91,
         'operational', 'recurring', 'critical', 'critical', 'high', 'L1_expert'),

        -- JTBD-MA-PC004: IDN/Health System Strategy
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PC004', 'Develop IDN/Health System Strategy',
         'When targeting integrated delivery networks and health systems, I want to develop tailored value propositions that address their specific clinical, operational, and financial priorities, so I can secure preferred product positioning within these increasingly influential healthcare organizations.',
         'Market Access', 'strategic', 'high', 'quarterly', 'active', 0.88,
         'strategic', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-PC005: Government Payer Relations
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PC005', 'Manage Government Payer Relationships',
         'When engaging with Medicare, Medicaid, and other government payers, I want to navigate complex government pricing regulations and coverage determination processes, so I can secure favorable coverage while ensuring full compliance with government pricing requirements.',
         'Market Access', 'compliance', 'high', 'monthly', 'active', 0.92,
         'operational', 'recurring', 'high', 'high', 'critical', 'L1_expert'),

        -- JTBD-MA-PC006: Account Performance Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PC006', 'Monitor Account Performance',
         'When managing payer account portfolios, I want to track and analyze account-level performance metrics including market share, access metrics, and contract compliance, so I can identify opportunities to improve access and optimize contract terms at renewal.',
         'Market Access', 'analytical', 'medium', 'monthly', 'active', 0.86,
         'operational', 'recurring', 'medium', 'high', 'medium', 'L2_panel')
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

    RAISE NOTICE '✓ Created 6 Payer Relations & Contracting JTBDs';

    -- =========================================================================
    -- 4. VALUE & EVIDENCE - 5 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-MA-VE001: Value Proposition Development
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-VE001', 'Develop Compelling Value Propositions',
         'When positioning our product for payers and HTA bodies, I want to develop evidence-based value propositions that articulate our clinical, economic, and humanistic value in terms that resonate with each stakeholder, so I can create compelling narratives that differentiate our therapy and support access.',
         'Market Access', 'strategic', 'high', 'quarterly', 'active', 0.91,
         'strategic', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-VE002: Evidence Gap Analysis
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-VE002', 'Conduct Evidence Gap Analysis',
         'When planning our evidence generation strategy, I want to conduct systematic evidence gap analyses that identify deficiencies in our clinical, economic, and real-world evidence base relative to payer and HTA requirements, so I can prioritize evidence investments that address critical access barriers.',
         'Market Access', 'analytical', 'high', 'quarterly', 'active', 0.89,
         'strategic', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-VE003: AMCP Dossier Development
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-VE003', 'Develop AMCP Format Dossiers',
         'When seeking formulary consideration, I want to develop comprehensive AMCP-format dossiers that present our clinical and economic evidence in a standardized, payer-friendly format, so I can facilitate efficient payer review and communicate our full value story.',
         'Market Access', 'documentation', 'high', 'quarterly', 'active', 0.88,
         'operational', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-VE004: Value Communication Materials
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-VE004', 'Create Value Communication Materials',
         'When arming our field teams for payer interactions, I want to develop compliant value communication materials including economic models, budget impact tools, and slide decks, so I can equip our team with compelling, legally-reviewed resources for customer engagements.',
         'Market Access', 'content', 'medium', 'monthly', 'active', 0.87,
         'operational', 'recurring', 'medium', 'medium', 'high', 'L2_panel'),

        -- JTBD-MA-VE005: Competitive Value Analysis
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-VE005', 'Analyze Competitive Value Positioning',
         'When tracking our competitive positioning, I want to continuously monitor and analyze competitor value propositions, pricing, and market access status, so I can identify threats and opportunities and adjust our value strategy accordingly.',
         'Market Access', 'analytical', 'medium', 'monthly', 'active', 0.86,
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

    RAISE NOTICE '✓ Created 5 Value & Evidence JTBDs';

    -- =========================================================================
    -- 5. MARKET ACCESS STRATEGY - 5 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-MA-AS001: Market Access Planning
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-AS001', 'Develop Market Access Strategic Plans',
         'When preparing for product launches, I want to develop comprehensive market access strategic plans that define our target access profiles, evidence requirements, pricing corridors, and stakeholder engagement approach by market, so I can ensure coordinated execution toward optimal access outcomes.',
         'Market Access', 'strategic', 'high', 'annually', 'active', 0.92,
         'strategic', 'project', 'critical', 'critical', 'medium', 'L1_expert'),

        -- JTBD-MA-AS002: Launch Sequencing Strategy
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-AS002', 'Optimize Global Launch Sequencing',
         'When planning multi-country launches, I want to develop optimal launch sequencing strategies that consider regulatory timelines, reference pricing implications, and commercial priorities, so I can maximize global value capture while protecting price integrity.',
         'Market Access', 'strategic', 'high', 'quarterly', 'active', 0.90,
         'strategic', 'project', 'critical', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-AS003: Access Barrier Assessment
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-AS003', 'Assess Market Access Barriers',
         'When evaluating market opportunities, I want to conduct systematic assessments of market access barriers including reimbursement hurdles, prior authorization requirements, and step therapy protocols, so I can develop mitigation strategies and realistic access forecasts.',
         'Market Access', 'analytical', 'high', 'quarterly', 'active', 0.88,
         'operational', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-AS004: Policy Landscape Monitoring
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-AS004', 'Monitor Healthcare Policy Landscape',
         'When navigating the evolving policy environment, I want to continuously monitor healthcare policy developments including drug pricing legislation, coverage policies, and reimbursement changes, so I can anticipate impacts on our products and proactively adapt our access strategies.',
         'Market Access', 'research', 'medium', 'weekly', 'active', 0.87,
         'operational', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-AS005: Cross-Functional Access Alignment
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-AS005', 'Align Cross-Functional Access Strategy',
         'When coordinating market access activities, I want to ensure alignment between Market Access, Commercial, Medical Affairs, and Regulatory functions on access strategy, evidence planning, and customer engagement, so I can drive integrated execution that maximizes access success.',
         'Market Access', 'coordination', 'high', 'monthly', 'active', 0.89,
         'strategic', 'recurring', 'high', 'high', 'medium', 'L2_panel')
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

    RAISE NOTICE '✓ Created 5 Market Access Strategy JTBDs';

    -- =========================================================================
    -- 6. HEALTH TECHNOLOGY ASSESSMENT (HTA) - 5 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-MA-HT001: HTA Submission Preparation
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-HT001', 'Prepare HTA Submissions',
         'When seeking reimbursement through HTA pathways, I want to develop comprehensive HTA submission dossiers that meet agency-specific requirements and present compelling clinical, economic, and budget impact evidence, so I can achieve positive HTA recommendations that enable reimbursement.',
         'Market Access', 'documentation', 'high', 'quarterly', 'active', 0.92,
         'strategic', 'project', 'critical', 'critical', 'high', 'L1_expert'),

        -- JTBD-MA-HT002: HTA Agency Engagement
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-HT002', 'Engage HTA Agencies',
         'When navigating HTA processes, I want to establish and maintain productive relationships with key HTA agencies through scientific advice meetings, public consultations, and post-submission dialogues, so I can understand agency expectations and address concerns proactively.',
         'Market Access', 'stakeholder', 'high', 'monthly', 'active', 0.90,
         'strategic', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-HT003: HTA Landscape Analysis
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-HT003', 'Analyze Global HTA Landscape',
         'When planning global access strategy, I want to analyze HTA requirements, timelines, and decision patterns across key markets, so I can identify optimal submission strategies and anticipate likely outcomes based on precedent decisions.',
         'Market Access', 'analytical', 'high', 'quarterly', 'active', 0.88,
         'strategic', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-HT004: HTA Outcome Appeals
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-HT004', 'Manage HTA Appeals Process',
         'When receiving unfavorable HTA recommendations, I want to develop and execute effective appeal strategies that address agency concerns with additional evidence or refined analyses, so I can reverse negative decisions or improve recommended coverage restrictions.',
         'Market Access', 'strategic', 'high', 'quarterly', 'active', 0.86,
         'operational', 'project', 'high', 'high', 'high', 'L1_expert'),

        -- JTBD-MA-HT005: HTA-Aligned Evidence Planning
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-HT005', 'Align Evidence Generation with HTA Needs',
         'When planning clinical development, I want to ensure that trial designs and endpoints address HTA evidence requirements, so I can generate the comparative, quality of life, and economic evidence that HTA bodies need for favorable assessments.',
         'Market Access', 'strategic', 'high', 'quarterly', 'active', 0.89,
         'strategic', 'project', 'high', 'high', 'medium', 'L2_panel')
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

    RAISE NOTICE '✓ Created 5 Health Technology Assessment JTBDs';

    -- =========================================================================
    -- 7. REAL-WORLD EVIDENCE (RWE) - 5 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-MA-RW001: RWE Strategy Development
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-RW001', 'Develop Real-World Evidence Strategy',
         'When planning post-launch evidence generation, I want to develop comprehensive RWE strategies that identify priority research questions, data sources, and analytical approaches, so I can generate the real-world effectiveness and safety evidence that payers and regulators increasingly require.',
         'Market Access', 'strategic', 'high', 'annually', 'active', 0.90,
         'strategic', 'project', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-RW002: RWE Study Execution
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-RW002', 'Execute Real-World Evidence Studies',
         'When generating post-launch evidence, I want to design and execute rigorous real-world studies using claims data, registries, or electronic health records, so I can demonstrate real-world effectiveness, safety, and economic outcomes in diverse patient populations.',
         'Market Access', 'research', 'high', 'quarterly', 'active', 0.88,
         'operational', 'project', 'high', 'high', 'high', 'L1_expert'),

        -- JTBD-MA-RW003: RWD Partnership Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-RW003', 'Manage Real-World Data Partnerships',
         'When accessing real-world data, I want to establish and manage strategic partnerships with data vendors, academic institutions, and health systems, so I can secure access to high-quality, representative data sources for our evidence generation programs.',
         'Market Access', 'stakeholder', 'medium', 'quarterly', 'active', 0.86,
         'operational', 'recurring', 'medium', 'medium', 'medium', 'L2_panel'),

        -- JTBD-MA-RW004: Outcomes-Based Contract Support
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-RW004', 'Support Outcomes-Based Contracts',
         'When implementing outcomes-based agreements, I want to design RWE measurement frameworks that accurately capture the contracted outcomes and enable fair performance assessment, so I can support successful OBC execution and demonstrate real-world value.',
         'Market Access', 'analytical', 'high', 'quarterly', 'active', 0.87,
         'operational', 'project', 'high', 'high', 'high', 'L1_expert'),

        -- JTBD-MA-RW005: RWE Regulatory Submissions
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-RW005', 'Support RWE Regulatory Submissions',
         'When seeking label expansions or post-marketing commitments, I want to generate regulatory-grade real-world evidence that meets FDA/EMA standards for decision-making, so I can support label updates and fulfill post-marketing evidence requirements.',
         'Market Access', 'compliance', 'high', 'quarterly', 'active', 0.89,
         'operational', 'project', 'high', 'high', 'critical', 'L1_expert')
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

    RAISE NOTICE '✓ Created 5 Real-World Evidence JTBDs';

    -- =========================================================================
    -- 8. ACCESS OPERATIONS - 3 JTBDs
    -- =========================================================================

    INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
    VALUES
        -- JTBD-MA-AO001: Access Metrics & Analytics
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-AO001', 'Track Market Access Metrics',
         'When monitoring access performance, I want to track comprehensive market access metrics including formulary status, tier positioning, prior authorization rates, and lives covered, so I can identify access issues early and measure the effectiveness of our access strategies.',
         'Market Access', 'analytical', 'medium', 'weekly', 'active', 0.88,
         'operational', 'recurring', 'high', 'high', 'medium', 'L1_expert'),

        -- JTBD-MA-AO002: PA/Step Therapy Management
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-AO002', 'Manage Prior Authorization Requirements',
         'When addressing access barriers, I want to monitor and optimize our response to prior authorization and step therapy requirements, including criteria simplification efforts and PA support programs, so I can minimize patient access barriers and administrative burden on prescribers.',
         'Market Access', 'operational', 'medium', 'monthly', 'active', 0.86,
         'operational', 'recurring', 'medium', 'high', 'medium', 'L2_panel'),

        -- JTBD-MA-AO003: Field Team Enablement
        (gen_random_uuid(), v_tenant_id, 'JTBD-MA-AO003', 'Enable Market Access Field Teams',
         'When equipping field-based market access teams, I want to provide them with current account intelligence, competitive insights, and compliant selling tools, so I can maximize their effectiveness in payer and health system customer engagements.',
         'Market Access', 'enablement', 'medium', 'monthly', 'active', 0.85,
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

    RAISE NOTICE '✓ Created 3 Access Operations JTBDs';

    -- =========================================================================
    -- SUMMARY
    -- =========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Market Access JTBDs Migration Complete!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total JTBDs Created: 40';
    RAISE NOTICE '  - HEOR: 6';
    RAISE NOTICE '  - Pricing Strategy: 5';
    RAISE NOTICE '  - Payer Relations & Contracting: 6';
    RAISE NOTICE '  - Value & Evidence: 5';
    RAISE NOTICE '  - Market Access Strategy: 5';
    RAISE NOTICE '  - Health Technology Assessment: 5';
    RAISE NOTICE '  - Real-World Evidence: 5';
    RAISE NOTICE '  - Access Operations: 3';
    RAISE NOTICE '============================================';

END $$;
