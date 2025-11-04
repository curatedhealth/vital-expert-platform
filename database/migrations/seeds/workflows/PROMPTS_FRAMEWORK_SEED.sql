-- =========================================================================
-- PROMPTS™ FRAMEWORK - Complete Suite and Sub-Suite Seeding
-- =========================================================================
-- Purpose: Seed all 10 PROMPTS™ suites and their sub-acronyms
-- Framework: Purpose-driven Robust Outcomes Master Prompting Toolkit & Suites
-- Version: 1.0.0
-- Date: January 2025
-- =========================================================================

WITH tenant_info AS (
    SELECT id as tenant_id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1
)

-- =========================================================================
-- LEVEL 2: THE 10 PROMPTS™ SUITES
-- =========================================================================

, suite_inserts AS (
    INSERT INTO dh_prompt_suite (
        tenant_id,
        unique_id,
        name,
        description,
        category,
        tags,
        metadata,
        is_active,
        position
    )
    SELECT
        ti.tenant_id,
        suite_data.unique_id,
        suite_data.name,
        suite_data.description,
        suite_data.category,
        suite_data.tags,
        suite_data.metadata,
        true as is_active,
        suite_data.position
    FROM tenant_info ti
    CROSS JOIN (VALUES
        (
            'SUITE-RULES',
            'RULES™ - Regulatory Excellence',
            'Regulatory Understanding & Legal Excellence Standards. Navigate complex regulatory landscapes with expert-level guidance on FDA, EMA, and global submissions.',
            'Regulatory & Compliance',
            ARRAY['regulatory', 'FDA', 'EMA', 'compliance', 'submissions'],
            jsonb_build_object(
                'acronym', 'RULES™',
                'full_name', 'Regulatory Understanding & Legal Excellence Standards',
                'tagline', 'Navigate Regulatory Excellence',
                'domain', 'Pharmaceutical Industry',
                'function', 'REGULATORY',
                'prompt_count', 200,
                'complexity_levels', jsonb_build_array('BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
                'key_areas', jsonb_build_array(
                    'FDA pathways (510(k), PMA, De Novo, IND, NDA, BLA)',
                    'European Medicines Agency (EMA) submissions',
                    'Global regulatory authorities',
                    'Regulatory strategy and planning',
                    'Compliance and quality systems'
                ),
                'target_roles', jsonb_build_array(
                    'Regulatory Affairs Managers',
                    'Compliance Officers',
                    'Quality Assurance Professionals'
                )
            ),
            1
        ),
        (
            'SUITE-TRIALS',
            'TRIALS™ - Clinical Development',
            'Therapeutic Research & Investigation Analysis & Leadership Standards. Design, execute, and analyze clinical trials with scientific rigor and regulatory compliance.',
            'Clinical Research',
            ARRAY['clinical_trials', 'protocol', 'endpoints', 'statistics'],
            jsonb_build_object(
                'acronym', 'TRIALS™',
                'full_name', 'Therapeutic Research & Investigation Analysis & Leadership Standards',
                'tagline', 'Lead Clinical Excellence',
                'domain', 'Pharmaceutical Industry',
                'function', 'CLINICAL',
                'prompt_count', 180,
                'key_areas', jsonb_build_array(
                    'Study design and protocols',
                    'Endpoint selection and validation',
                    'Statistical analysis planning',
                    'Clinical trial operations',
                    'Patient recruitment and retention'
                ),
                'target_roles', jsonb_build_array(
                    'Clinical Research Associates',
                    'Study Coordinators',
                    'Biostatisticians',
                    'Medical Directors'
                )
            ),
            2
        ),
        (
            'SUITE-GUARD',
            'GUARD™ - Safety Framework',
            'Global Understanding & Assessment of Risk & Drug Safety. Ensure patient safety through comprehensive pharmacovigilance, risk management, and safety surveillance.',
            'Safety & Pharmacovigilance',
            ARRAY['pharmacovigilance', 'safety', 'adverse_events', 'risk_management'],
            jsonb_build_object(
                'acronym', 'GUARD™',
                'full_name', 'Global Understanding & Assessment of Risk & Drug Safety',
                'tagline', 'Safeguard Patient Well-being',
                'domain', 'Pharmaceutical Industry',
                'function', 'SAFETY',
                'prompt_count', 150,
                'key_areas', jsonb_build_array(
                    'Adverse event detection and reporting',
                    'Safety signal detection and evaluation',
                    'Risk management planning (RMP)',
                    'Pharmacovigilance systems',
                    'Post-market surveillance'
                ),
                'target_roles', jsonb_build_array(
                    'Drug Safety Associates',
                    'Pharmacovigilance Managers',
                    'Medical Safety Officers'
                )
            ),
            3
        ),
        (
            'SUITE-VALUE',
            'VALUE™ - Market Access',
            'Value Assessment & Leadership Understanding & Economic Excellence. Demonstrate product value, navigate payer landscapes, and optimize market access strategies.',
            'Market Access & HEOR',
            ARRAY['market_access', 'HEOR', 'pricing', 'reimbursement', 'value_dossier'],
            jsonb_build_object(
                'acronym', 'VALUE™',
                'full_name', 'Value Assessment & Leadership Understanding & Economic Excellence',
                'tagline', 'Maximize Market Value',
                'domain', 'Payers & Health Plans',
                'function', 'HEOR',
                'prompt_count', 170,
                'key_areas', jsonb_build_array(
                    'Health economics and outcomes research (HEOR)',
                    'Pricing and reimbursement strategies',
                    'Value dossier and evidence generation',
                    'Payer engagement and contracting',
                    'Health technology assessment (HTA)'
                ),
                'target_roles', jsonb_build_array(
                    'Market Access Directors',
                    'HEOR Analysts',
                    'Pricing Strategists',
                    'Payer Relations Managers'
                )
            ),
            4
        ),
        (
            'SUITE-BRIDGE',
            'BRIDGE™ - Stakeholder Engagement',
            'Building Relationships & Intelligence Development & Global Engagement. Build and maintain strategic relationships with key opinion leaders, investigators, and healthcare stakeholders.',
            'Medical Affairs',
            ARRAY['medical_affairs', 'KOL', 'MSL', 'advisory_boards', 'speaker_programs'],
            jsonb_build_object(
                'acronym', 'BRIDGE™',
                'full_name', 'Building Relationships & Intelligence Development & Global Engagement',
                'tagline', 'Connect Clinical Communities',
                'domain', 'Pharmaceutical Industry',
                'function', 'MEDICAL_AFFAIRS',
                'prompt_count', 140,
                'key_areas', jsonb_build_array(
                    'KOL identification and engagement',
                    'Advisory board planning and execution',
                    'Investigator initiated studies (IIS)',
                    'Speaker programs and training',
                    'Medical information and inquiry response'
                ),
                'target_roles', jsonb_build_array(
                    'Medical Science Liaisons (MSLs)',
                    'Medical Affairs Directors',
                    'KOL Managers'
                )
            ),
            5
        ),
        (
            'SUITE-PROOF',
            'PROOF™ - Evidence Analytics',
            'Professional Research & Outcomes Optimization & Framework. Generate, analyze, and synthesize clinical evidence to support product value and decision-making.',
            'Evidence Generation',
            ARRAY['evidence', 'RWE', 'analytics', 'outcomes', 'meta_analysis'],
            jsonb_build_object(
                'acronym', 'PROOF™',
                'full_name', 'Professional Research & Outcomes Optimization & Framework',
                'tagline', 'Prove Clinical Value',
                'domain', 'Pharmaceutical Industry',
                'function', 'DATA_ANALYTICS',
                'prompt_count', 160,
                'key_areas', jsonb_build_array(
                    'Real-world evidence (RWE) generation',
                    'Systematic literature reviews and meta-analyses',
                    'Evidence synthesis and gap analysis',
                    'Data mining and advanced analytics',
                    'Patient-reported outcomes (PRO) analysis'
                ),
                'target_roles', jsonb_build_array(
                    'Clinical Data Analysts',
                    'Evidence Synthesis Specialists',
                    'Outcomes Researchers'
                )
            ),
            6
        ),
        (
            'SUITE-CRAFT',
            'CRAFT™ - Medical Writing',
            'Creative Regulatory & Academic Framework & Technical Excellence. Create clear, compelling, and compliant medical and scientific documents across all formats.',
            'Medical Writing',
            ARRAY['medical_writing', 'publications', 'manuscripts', 'CSR', 'regulatory_writing'],
            jsonb_build_object(
                'acronym', 'CRAFT™',
                'full_name', 'Creative Regulatory & Academic Framework & Technical Excellence',
                'tagline', 'Craft Scientific Excellence',
                'domain', 'Pharmaceutical Industry',
                'function', 'MEDICAL_AFFAIRS',
                'prompt_count', 150,
                'key_areas', jsonb_build_array(
                    'Clinical study reports (CSRs)',
                    'Regulatory submission documents',
                    'Manuscripts and publications',
                    'Abstracts and posters',
                    'Patient education materials'
                ),
                'target_roles', jsonb_build_array(
                    'Medical Writers',
                    'Regulatory Writers',
                    'Scientific Communications Specialists'
                )
            ),
            7
        ),
        (
            'SUITE-SCOUT',
            'SCOUT™ - Competitive Intelligence',
            'Strategic Competitive & Operational Understanding & Tactical Intelligence. Gather, analyze, and act on competitive and market intelligence to inform strategic decisions.',
            'Competitive Intelligence',
            ARRAY['competitive_intelligence', 'market_analysis', 'pipeline', 'SWOT'],
            jsonb_build_object(
                'acronym', 'SCOUT™',
                'full_name', 'Strategic Competitive & Operational Understanding & Tactical Intelligence',
                'tagline', 'Scout Market Opportunities',
                'domain', 'Pharmaceutical Industry',
                'function', 'BUSINESS_DEV',
                'prompt_count', 130,
                'key_areas', jsonb_build_array(
                    'Competitive landscape analysis',
                    'Pipeline intelligence and patent monitoring',
                    'Market trends and forecasting',
                    'SWOT analysis and strategic positioning',
                    'Deal flow and partnership opportunities'
                ),
                'target_roles', jsonb_build_array(
                    'Competitive Intelligence Analysts',
                    'Strategic Planning Managers',
                    'Business Development'
                )
            ),
            8
        ),
        (
            'SUITE-PROJECT',
            'PROJECT™ - Project Management',
            'Planning Resources Objectives Justification Execution Control Tracking. Plan, execute, and control complex life sciences projects with professional project management methodologies.',
            'Project Management',
            ARRAY['project_management', 'planning', 'execution', 'control', 'delivery'],
            jsonb_build_object(
                'acronym', 'PROJECT™',
                'full_name', 'Planning Resources Objectives Justification Execution Control Tracking',
                'tagline', 'Manage Excellence Delivery',
                'domain', 'Pharmaceutical Industry',
                'function', 'OPERATIONS',
                'prompt_count', 120,
                'key_areas', jsonb_build_array(
                    'Project planning and initiation',
                    'Resource allocation and budgeting',
                    'Timeline development and critical path',
                    'Risk management and mitigation',
                    'Stakeholder communication and reporting'
                ),
                'target_roles', jsonb_build_array(
                    'Project Managers',
                    'Program Directors',
                    'Clinical Operations Managers'
                )
            ),
            9
        ),
        (
            'SUITE-FORGE',
            'FORGE™ - Digital Health Development',
            'Foundation Optimization Regulatory Guidelines Engineering. Navigate the unique challenges of digital health, digital therapeutics (DTx), and software as a medical device (SaMD).',
            'Digital Health',
            ARRAY['digital_health', 'DTx', 'SaMD', 'digital_biomarkers', 'mobile_health'],
            jsonb_build_object(
                'acronym', 'FORGE™',
                'full_name', 'Foundation Optimization Regulatory Guidelines Engineering',
                'tagline', 'Forge Digital Innovation',
                'domain', 'Digital Health & DTx',
                'function', 'DIGITAL_HEALTH',
                'prompt_count', 140,
                'key_areas', jsonb_build_array(
                    'Digital therapeutics (DTx) development',
                    'Software as a Medical Device (SaMD) pathways',
                    'Digital biomarker validation',
                    'Mobile health app development',
                    'Clinical validation of digital health'
                ),
                'target_roles', jsonb_build_array(
                    'Digital Health Developers',
                    'DTx Clinical Teams',
                    'SaMD Regulatory Specialists'
                )
            ),
            10
        )
    ) AS suite_data(unique_id, name, description, category, tags, metadata, position)
    ON CONFLICT (tenant_id, unique_id)
    DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id, unique_id, name
)

SELECT 
    '✅ PROMPTS™ Framework Seeded' as status,
    COUNT(*) as suite_count
FROM suite_inserts;

-- Show seeded suites
SELECT 
    unique_id,
    name,
    category,
    metadata->>'acronym' as acronym,
    (metadata->>'prompt_count')::int as prompt_count,
    position
FROM dh_prompt_suite
ORDER BY position;

