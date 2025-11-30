-- ============================================================================
-- MIGRATION 039: PHARMACEUTICAL INDUSTRY JOBS-TO-BE-DONE (JTBD) SEED
-- Version: 1.0.0 | Date: 2025-11-29
-- Purpose: Seed JTBDs for 6 key pharma roles aligned to strategic pillars
-- Total: 24 JTBDs (6 roles × 4 JTBDs each)
-- ============================================================================
--
-- ODI (Outcome-Driven Innovation) Format:
-- "When [situation], I want to [desired outcome], so I can [benefit]"
--
-- Roles Covered:
-- 1. Medical Science Liaison (4 JTBDs)
-- 2. Medical Director (4 JTBDs)
-- 3. Regulatory Affairs Director (4 JTBDs)
-- 4. Brand Manager (4 JTBDs)
-- 5. HEOR Specialist (4 JTBDs)
-- 6. Market Access Director (4 JTBDs)
-- ============================================================================

BEGIN;

-- Set tenant context
SELECT set_config('app.seed_tenant_id', (SELECT id::text FROM tenants WHERE tenant_key = 'vital-system' LIMIT 1), false);

-- ============================================================================
-- ROLE 1: MEDICAL SCIENCE LIAISON - 4 JTBDs
-- ============================================================================

-- JTBD 1: KOL Scientific Exchange
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MSL-001',
    'KOL Scientific Exchange',
    current_setting('app.seed_tenant_id')::uuid,
    'Conduct meaningful scientific exchanges with KOLs that advance understanding and strengthen relationships',
    'When I am preparing for a KOL meeting or responding to a scientific inquiry',
    'I need to quickly synthesize relevant clinical data, competitive landscape, and KOL interests to have productive scientific discussions',
    'Have meaningful scientific exchanges that advance mutual understanding and position our data appropriately',
    'functional',
    'operational',
    'high',
    'daily',
    9,
    'active',
    'bau',
    'operational',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    when_situation = EXCLUDED.when_situation,
    circumstance = EXCLUDED.circumstance,
    desired_outcome = EXCLUDED.desired_outcome,
    updated_at = NOW();

-- JTBD 2: Medical Insights Generation
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MSL-002',
    'Medical Insights Generation',
    current_setting('app.seed_tenant_id')::uuid,
    'Capture and communicate field medical insights that inform company strategy',
    'When I return from KOL interactions or scientific conferences',
    'I need to systematically document insights, identify patterns, and communicate findings to cross-functional stakeholders',
    'Generate actionable medical insights that influence product development, commercialization, and medical strategy',
    'functional',
    'strategic',
    'high',
    'weekly',
    8,
    'active',
    'mixed',
    'strategic',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 3: Scientific Literature Surveillance
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MSL-003',
    'Scientific Literature Surveillance',
    current_setting('app.seed_tenant_id')::uuid,
    'Stay current with scientific literature and communicate relevant findings',
    'When new publications, guidelines, or competitive data emerge',
    'I need to rapidly assess relevance, synthesize key findings, and communicate implications to stakeholders',
    'Maintain deep scientific expertise and proactively communicate relevant developments',
    'functional',
    'operational',
    'medium',
    'daily',
    7,
    'active',
    'bau',
    'operational',
    'standard',
    'medium'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 4: Medical Education Program Delivery
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MSL-004',
    'Medical Education Program Delivery',
    current_setting('app.seed_tenant_id')::uuid,
    'Deliver high-quality medical education programs that advance scientific understanding',
    'When planning or delivering medical education events (symposia, webinars, advisory boards)',
    'I need to develop scientifically accurate, engaging content and ensure compliant execution',
    'Educate HCPs on disease states and therapeutic approaches while building scientific credibility',
    'functional',
    'operational',
    'high',
    'monthly',
    8,
    'active',
    'project',
    'operational',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- ============================================================================
-- ROLE 2: MEDICAL DIRECTOR - 4 JTBDs
-- ============================================================================

-- JTBD 5: Medical Strategy Development
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MED-001',
    'Medical Strategy Development',
    current_setting('app.seed_tenant_id')::uuid,
    'Develop and execute comprehensive medical strategies that support product lifecycle',
    'When creating annual medical plans or responding to strategic opportunities/threats',
    'I need to align medical activities with commercial objectives while maintaining scientific integrity',
    'Create and implement medical strategies that maximize product value and patient outcomes',
    'functional',
    'strategic',
    'very_high',
    'quarterly',
    10,
    'active',
    'mixed',
    'strategic',
    'critical',
    'critical'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 6: Publication Planning & Execution
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MED-002',
    'Publication Planning & Execution',
    current_setting('app.seed_tenant_id')::uuid,
    'Plan and execute publication strategies that communicate clinical evidence effectively',
    'When managing publication timelines and coordinating with authors/agencies',
    'I need to ensure high-quality, compliant publications that reach target audiences at optimal times',
    'Build scientific credibility through strategic, timely publications in high-impact journals',
    'functional',
    'operational',
    'high',
    'weekly',
    9,
    'active',
    'project',
    'operational',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 7: KOL Network Management
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MED-003',
    'KOL Network Management',
    current_setting('app.seed_tenant_id')::uuid,
    'Build and maintain strategic KOL relationships that advance scientific and business objectives',
    'When identifying, engaging, and managing key opinion leader relationships',
    'I need to systematically map, prioritize, and engage KOLs while tracking relationship health',
    'Develop enduring KOL partnerships that drive scientific leadership and product advocacy',
    'functional',
    'strategic',
    'high',
    'weekly',
    9,
    'active',
    'mixed',
    'strategic',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 8: Medical-Legal-Regulatory Review
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MED-004',
    'Medical-Legal-Regulatory Review',
    current_setting('app.seed_tenant_id')::uuid,
    'Ensure medical accuracy and compliance of all promotional and educational materials',
    'When reviewing promotional materials, publications, or medical information responses',
    'I need to efficiently validate scientific accuracy, ensure compliance, and provide constructive feedback',
    'Approve high-quality, compliant materials while minimizing review cycle times',
    'functional',
    'operational',
    'high',
    'daily',
    8,
    'active',
    'bau',
    'operational',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- ============================================================================
-- ROLE 3: REGULATORY AFFAIRS DIRECTOR - 4 JTBDs
-- ============================================================================

-- JTBD 9: Regulatory Submission Strategy
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-REG-001',
    'Regulatory Submission Strategy',
    current_setting('app.seed_tenant_id')::uuid,
    'Develop optimal regulatory strategies that achieve timely product approvals',
    'When planning new drug applications or responding to regulatory questions',
    'I need to analyze regulatory requirements, develop submission strategies, and coordinate cross-functional teams',
    'Achieve first-cycle approvals through well-planned, high-quality regulatory submissions',
    'functional',
    'strategic',
    'very_high',
    'monthly',
    10,
    'active',
    'project',
    'strategic',
    'critical',
    'critical'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 10: Health Authority Interactions
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-REG-002',
    'Health Authority Interactions',
    current_setting('app.seed_tenant_id')::uuid,
    'Manage productive health authority interactions that advance regulatory objectives',
    'When preparing for or responding to FDA/EMA/other agency meetings or queries',
    'I need to develop clear messaging, anticipate questions, and ensure aligned cross-functional input',
    'Build positive regulatory relationships and achieve alignment on development/approval pathways',
    'functional',
    'strategic',
    'very_high',
    'monthly',
    9,
    'active',
    'mixed',
    'strategic',
    'critical',
    'critical'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 11: Regulatory Compliance Monitoring
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-REG-003',
    'Regulatory Compliance Monitoring',
    current_setting('app.seed_tenant_id')::uuid,
    'Ensure ongoing regulatory compliance across all products and activities',
    'When tracking regulatory commitments, post-marketing requirements, or compliance audits',
    'I need to monitor regulatory obligations, track completion status, and ensure timely fulfillment',
    'Maintain zero critical compliance findings and protect company regulatory standing',
    'functional',
    'operational',
    'high',
    'weekly',
    9,
    'active',
    'bau',
    'operational',
    'critical',
    'critical'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 12: Regulatory Intelligence & Policy Tracking
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-REG-004',
    'Regulatory Intelligence & Policy Tracking',
    current_setting('app.seed_tenant_id')::uuid,
    'Monitor and analyze regulatory policy changes that impact development and commercialization',
    'When new guidances, regulations, or policy changes are announced or anticipated',
    'I need to rapidly assess implications, communicate impacts, and recommend strategic responses',
    'Proactively anticipate regulatory changes and position organization for competitive advantage',
    'functional',
    'strategic',
    'high',
    'weekly',
    8,
    'active',
    'bau',
    'strategic',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- ============================================================================
-- ROLE 4: BRAND MANAGER - 4 JTBDs
-- ============================================================================

-- JTBD 13: Brand Strategy & Positioning
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-BRD-001',
    'Brand Strategy & Positioning',
    current_setting('app.seed_tenant_id')::uuid,
    'Develop and execute brand strategies that differentiate our product and drive market share',
    'When creating brand plans, positioning strategies, or responding to competitive threats',
    'I need to analyze market dynamics, customer insights, and competitive landscape to craft compelling positioning',
    'Establish clear brand differentiation that resonates with HCPs and drives prescription preference',
    'functional',
    'strategic',
    'very_high',
    'quarterly',
    10,
    'active',
    'mixed',
    'strategic',
    'critical',
    'critical'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 14: Promotional Campaign Execution
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-BRD-002',
    'Promotional Campaign Execution',
    current_setting('app.seed_tenant_id')::uuid,
    'Execute effective promotional campaigns that engage HCPs and drive brand awareness',
    'When developing and launching promotional tactics across personal and non-personal channels',
    'I need to create compliant, compelling content and coordinate multi-channel execution',
    'Achieve campaign KPIs while maximizing HCP engagement and brand recall',
    'functional',
    'operational',
    'high',
    'weekly',
    8,
    'active',
    'project',
    'operational',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 15: Competitive Intelligence Analysis
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-BRD-003',
    'Competitive Intelligence Analysis',
    current_setting('app.seed_tenant_id')::uuid,
    'Monitor and analyze competitive activities to inform strategic and tactical decisions',
    'When tracking competitor launches, promotional activities, or market share changes',
    'I need to systematically gather, analyze, and communicate competitive intelligence',
    'Enable data-driven competitive responses and maintain market leadership',
    'functional',
    'operational',
    'medium',
    'weekly',
    8,
    'active',
    'bau',
    'operational',
    'high',
    'medium'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 16: Product Launch Planning
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-BRD-004',
    'Product Launch Planning',
    current_setting('app.seed_tenant_id')::uuid,
    'Plan and execute successful product launches that achieve rapid market adoption',
    'When preparing for new product launches or indication expansions',
    'I need to coordinate cross-functional activities, develop launch materials, and ensure readiness',
    'Achieve launch excellence with Day 1 readiness and accelerated market uptake',
    'functional',
    'strategic',
    'very_high',
    'quarterly',
    10,
    'active',
    'project',
    'strategic',
    'critical',
    'critical'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- ============================================================================
-- ROLE 5: HEOR SPECIALIST - 4 JTBDs
-- ============================================================================

-- JTBD 17: Evidence Synthesis & Systematic Reviews
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-HEOR-001',
    'Evidence Synthesis & Systematic Reviews',
    current_setting('app.seed_tenant_id')::uuid,
    'Conduct rigorous evidence synthesis to support value demonstration and payer submissions',
    'When developing systematic literature reviews, meta-analyses, or evidence summaries',
    'I need to systematically search, screen, extract, and synthesize clinical/economic evidence',
    'Generate high-quality evidence synthesis that withstands HTA and payer scrutiny',
    'functional',
    'operational',
    'very_high',
    'monthly',
    9,
    'active',
    'project',
    'operational',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 18: Health Economic Modeling
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-HEOR-002',
    'Health Economic Modeling',
    current_setting('app.seed_tenant_id')::uuid,
    'Develop cost-effectiveness and budget impact models that demonstrate product value',
    'When creating economic models for HTA submissions or payer presentations',
    'I need to build transparent, validated models that accurately reflect clinical and economic outcomes',
    'Demonstrate favorable economic value proposition that supports pricing and market access',
    'functional',
    'strategic',
    'very_high',
    'quarterly',
    10,
    'active',
    'project',
    'strategic',
    'critical',
    'critical'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 19: Value Dossier Development
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-HEOR-003',
    'Value Dossier Development',
    current_setting('app.seed_tenant_id')::uuid,
    'Create comprehensive value dossiers that support payer negotiations and HTA submissions',
    'When developing AMCP dossiers, HTA submissions, or payer value messages',
    'I need to compile clinical, economic, and humanistic evidence into compelling value stories',
    'Enable successful market access through compelling, evidence-based value demonstration',
    'functional',
    'operational',
    'high',
    'quarterly',
    9,
    'active',
    'project',
    'operational',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 20: Real-World Evidence Generation
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-HEOR-004',
    'Real-World Evidence Generation',
    current_setting('app.seed_tenant_id')::uuid,
    'Design and execute real-world evidence studies that demonstrate product value in practice',
    'When planning observational studies, claims analyses, or RWD-based research',
    'I need to design methodologically sound studies using appropriate real-world data sources',
    'Generate actionable RWE that supports regulatory, payer, and clinical decision-making',
    'functional',
    'strategic',
    'very_high',
    'quarterly',
    9,
    'active',
    'project',
    'strategic',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- ============================================================================
-- ROLE 6: MARKET ACCESS DIRECTOR - 4 JTBDs
-- ============================================================================

-- JTBD 21: Payer Strategy Development
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MA-001',
    'Payer Strategy Development',
    current_setting('app.seed_tenant_id')::uuid,
    'Develop comprehensive payer strategies that maximize market access and optimize pricing',
    'When creating market access plans for new or existing products',
    'I need to analyze payer landscape, anticipate coverage decisions, and develop engagement strategies',
    'Achieve optimal formulary positioning and reimbursement that maximizes patient access',
    'functional',
    'strategic',
    'very_high',
    'quarterly',
    10,
    'active',
    'mixed',
    'strategic',
    'critical',
    'critical'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 22: Formulary Access Management
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MA-002',
    'Formulary Access Management',
    current_setting('app.seed_tenant_id')::uuid,
    'Secure and maintain favorable formulary positions across payer segments',
    'When engaging with pharmacy benefit managers, health plans, or IDN formulary committees',
    'I need to present compelling value propositions and navigate P&T committee processes',
    'Achieve and defend preferred formulary status that ensures patient access',
    'functional',
    'operational',
    'high',
    'weekly',
    9,
    'active',
    'mixed',
    'operational',
    'high',
    'high'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 23: Contract Negotiation & Management
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MA-003',
    'Contract Negotiation & Management',
    current_setting('app.seed_tenant_id')::uuid,
    'Negotiate and manage payer contracts that balance access, revenue, and compliance',
    'When developing or renegotiating managed care contracts',
    'I need to analyze contract economics, develop negotiation strategies, and ensure compliant execution',
    'Secure contracts that optimize revenue while maintaining broad patient access',
    'functional',
    'strategic',
    'very_high',
    'monthly',
    9,
    'active',
    'project',
    'strategic',
    'critical',
    'critical'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

-- JTBD 24: Pricing & Reimbursement Optimization
INSERT INTO jtbd (
    id, code, name, tenant_id,
    job_statement, when_situation, circumstance, desired_outcome,
    job_type, job_category, complexity, frequency, priority_score,
    status, work_pattern, jtbd_type, strategic_priority, impact_level
)
VALUES (
    gen_random_uuid(),
    'JTBD-MA-004',
    'Pricing & Reimbursement Optimization',
    current_setting('app.seed_tenant_id')::uuid,
    'Optimize pricing strategies that balance value capture with market access',
    'When setting launch prices or responding to pricing pressures',
    'I need to model pricing scenarios, assess access implications, and develop pricing recommendations',
    'Establish pricing that reflects product value while ensuring sustainable patient access',
    'functional',
    'strategic',
    'very_high',
    'quarterly',
    10,
    'active',
    'mixed',
    'strategic',
    'critical',
    'critical'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    job_statement = EXCLUDED.job_statement,
    updated_at = NOW();

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count JTBDs by role
SELECT
    CASE
        WHEN code LIKE 'JTBD-MSL%' THEN 'Medical Science Liaison'
        WHEN code LIKE 'JTBD-MED%' THEN 'Medical Director'
        WHEN code LIKE 'JTBD-REG%' THEN 'Regulatory Affairs Director'
        WHEN code LIKE 'JTBD-BRD%' THEN 'Brand Manager'
        WHEN code LIKE 'JTBD-HEOR%' THEN 'HEOR Specialist'
        WHEN code LIKE 'JTBD-MA%' THEN 'Market Access Director'
        ELSE 'Other'
    END as role,
    COUNT(*) as jtbd_count
FROM jtbd
WHERE code LIKE 'JTBD-%'
GROUP BY 1
ORDER BY 1;

-- Verify all 24 JTBDs
SELECT code, name, job_category, strategic_priority, impact_level
FROM jtbd
WHERE code LIKE 'JTBD-MSL%'
   OR code LIKE 'JTBD-MED%'
   OR code LIKE 'JTBD-REG%'
   OR code LIKE 'JTBD-BRD%'
   OR code LIKE 'JTBD-HEOR%'
   OR code LIKE 'JTBD-MA%'
ORDER BY code;

-- Summary by strategic priority
SELECT strategic_priority, COUNT(*) as count
FROM jtbd
WHERE code LIKE 'JTBD-%'
GROUP BY strategic_priority
ORDER BY
    CASE strategic_priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'standard' THEN 3
        WHEN 'low' THEN 4
    END;
