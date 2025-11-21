-- =====================================================================================
-- 02_foundation_tools_NEW_SCHEMA.sql
-- Foundation Tools - Transformed for New `tools` Schema
-- =====================================================================================
-- Purpose: Seed foundational software tools used across use cases
-- Target Table: tools (NOT dh_tool)
-- =====================================================================================

-- Tools are platform-level (use platform tenant or NULL)
-- Per user: "tools, prompts, and knowledge are not tenant specific"
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Use platform tenant for platform-level resources
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'platform' LIMIT 1;

    IF v_tenant_id IS NULL THEN
        -- If platform tenant doesn't exist, use NULL (platform-wide)
        v_tenant_id := NULL;
        RAISE NOTICE 'Platform tenant not found, using NULL tenant_id (platform-wide tools)';
    ELSE
        RAISE NOTICE 'Using platform tenant for tools (ID: %)', v_tenant_id;
    END IF;

-- =====================================================================================
-- SECTION 1: STATISTICAL SOFTWARE TOOLS
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    -- R Statistical Software
    (
        gen_random_uuid(),
        v_tenant_id,
        'R Statistical Software',
        'r-statistical-software',
        'Open-source statistical computing environment. Primary tool for psychometric analysis, sample size calculation, and advanced statistical modeling.',
        'statistical',
        'r-lang',
        true,
        ARRAY['statistical_software', 'psychometric_analysis', 'open_source'],
        jsonb_build_object(
            'vendor', 'R Foundation',
            'version', '4.3+',
            'license', 'GPL-3',
            'use_cases', json_build_array('Psychometric analysis', 'Power analysis', 'Sample size calculation', 'Mixed models', 'Survival analysis'),
            'key_packages', json_build_array('pwr', 'lme4', 'lavaan', 'psych', 'survival', 'tidyverse'),
            'documentation_url', 'https://www.r-project.org/'
        )
    ),

    -- SAS
    (
        gen_random_uuid(),
        v_tenant_id,
        'SAS Statistical Software',
        'sas-statistical-software',
        'Industry-standard statistical software for clinical trials. Often required by regulatory agencies and CROs.',
        'statistical',
        'sas',
        true,
        ARRAY['statistical_software', 'clinical_trials', 'regulatory', 'commercial'],
        jsonb_build_object(
            'vendor', 'SAS Institute',
            'version', '9.4+',
            'license', 'Commercial',
            'use_cases', json_build_array('Clinical trial analysis', 'Regulatory submissions', 'CDISC compliance', 'Safety analysis'),
            'key_modules', json_build_array('SAS/STAT', 'SAS/GRAPH', 'SAS Clinical Standards Toolkit'),
            'documentation_url', 'https://www.sas.com/'
        )
    ),

    -- Stata
    (
        gen_random_uuid(),
        v_tenant_id,
        'Stata Statistical Software',
        'stata-statistical-software',
        'Statistical software popular in epidemiology and health economics research.',
        'statistical',
        'stata',
        true,
        ARRAY['statistical_software', 'epidemiology', 'health_economics', 'commercial'],
        jsonb_build_object(
            'vendor', 'StataCorp',
            'version', '18+',
            'license', 'Commercial',
            'use_cases', json_build_array('Epidemiological analysis', 'Health economics', 'Panel data analysis', 'Survey data'),
            'documentation_url', 'https://www.stata.com/'
        )
    ),

    -- SPSS
    (
        gen_random_uuid(),
        v_tenant_id,
        'IBM SPSS Statistics',
        'ibm-spss-statistics',
        'User-friendly statistical software for behavioral and social science research.',
        'statistical',
        'spss',
        true,
        ARRAY['statistical_software', 'pro_validation', 'psychometric', 'commercial'],
        jsonb_build_object(
            'vendor', 'IBM',
            'version', '29+',
            'license', 'Commercial',
            'use_cases', json_build_array('PRO validation', 'Psychometric testing', 'Survey analysis', 'Descriptive statistics'),
            'documentation_url', 'https://www.ibm.com/products/spss-statistics'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- =====================================================================================
-- SECTION 2: CLINICAL DATA MANAGEMENT TOOLS
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    -- Medidata Rave
    (
        gen_random_uuid(),
        v_tenant_id,
        'Medidata Rave EDC',
        'medidata-rave-edc',
        'Industry-leading electronic data capture system for clinical trials. CDISC-compliant, 21 CFR Part 11 validated.',
        'edc',
        'medidata-rave',
        true,
        ARRAY['edc_system', 'clinical_trials', 'cdisc', 'gcp_compliant', 'commercial'],
        jsonb_build_object(
            'vendor', 'Medidata Solutions',
            'version', 'Cloud',
            'deployment', 'Cloud (SaaS)',
            'use_cases', json_build_array('eCRF design', 'Clinical data collection', 'Study management', 'ePRO integration'),
            'compliance', json_build_array('21 CFR Part 11', 'CDISC CDASH', 'CDISC SDTM', 'GCP'),
            'documentation_url', 'https://www.medidata.com/en/clinical-trial-products/rave-edc/'
        )
    ),

    -- REDCap
    (
        gen_random_uuid(),
        v_tenant_id,
        'REDCap (Research Electronic Data Capture)',
        'redcap',
        'Free, secure web-based application for research data capture. Popular in academic clinical research.',
        'edc',
        'redcap',
        true,
        ARRAY['edc_system', 'academic_research', 'free', 'open_source'],
        jsonb_build_object(
            'vendor', 'Vanderbilt University',
            'version', '13+',
            'license', 'Free for non-profit research',
            'deployment', 'Self-hosted or cloud',
            'use_cases', json_build_array('Data collection', 'Survey management', 'Clinical trial data', 'Registry studies'),
            'documentation_url', 'https://www.project-redcap.org/'
        )
    ),

    -- Veeva Vault CTMS
    (
        gen_random_uuid(),
        v_tenant_id,
        'Veeva Vault CTMS',
        'veeva-vault-ctms',
        'Clinical Trial Management System for study startup, site management, and operational oversight.',
        'ctms',
        'veeva-vault',
        true,
        ARRAY['ctms', 'clinical_trials', 'site_management', 'commercial'],
        jsonb_build_object(
            'vendor', 'Veeva Systems',
            'version', 'Cloud',
            'deployment', 'Cloud (SaaS)',
            'use_cases', json_build_array('Study startup', 'Site selection', 'Patient enrollment tracking', 'Budget management'),
            'documentation_url', 'https://www.veeva.com/products/vault-ctms/'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- =====================================================================================
-- SECTION 3: RESEARCH DATABASES
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, endpoint_url, is_active, tags, metadata
) VALUES
    -- PubMed
    (
        gen_random_uuid(),
        v_tenant_id,
        'PubMed/MEDLINE',
        'pubmed-medline',
        'US National Library of Medicine biomedical literature database. Primary source for systematic literature reviews.',
        'api',
        'pubmed-api',
        'https://pubmed.ncbi.nlm.nih.gov/',
        true,
        ARRAY['research_database', 'literature_search', 'free', 'api'],
        jsonb_build_object(
            'vendor', 'NLM/NIH',
            'license', 'Free',
            'database_size', '35+ million citations',
            'api_available', true,
            'use_cases', json_build_array('Literature review', 'Evidence synthesis', 'Clinical guideline development'),
            'documentation_url', 'https://www.ncbi.nlm.nih.gov/books/NBK3827/'
        )
    ),

    -- ClinicalTrials.gov
    (
        gen_random_uuid(),
        v_tenant_id,
        'ClinicalTrials.gov',
        'clinicaltrials-gov',
        'US registry of clinical studies. Required for FDA compliance, provides competitive intelligence.',
        'api',
        'clinicaltrials-api',
        'https://clinicaltrials.gov/',
        true,
        ARRAY['research_database', 'clinical_trials', 'regulatory', 'free', 'api'],
        jsonb_build_object(
            'vendor', 'NIH',
            'license', 'Free',
            'api_available', true,
            'use_cases', json_build_array('Competitive intelligence', 'Trial design benchmarking', 'Regulatory compliance', 'Patient recruitment'),
            'compliance', json_build_array('FDAAA 801', 'ICH E3'),
            'documentation_url', 'https://clinicaltrials.gov/api/gui'
        )
    ),

    -- Cochrane Library
    (
        gen_random_uuid(),
        v_tenant_id,
        'Cochrane Library',
        'cochrane-library',
        'Gold-standard source for systematic reviews and meta-analyses in healthcare.',
        'research_tool',
        'cochrane',
        'https://www.cochranelibrary.com/',
        true,
        ARRAY['research_database', 'systematic_review', 'meta_analysis', 'subscription'],
        jsonb_build_object(
            'vendor', 'Cochrane Collaboration',
            'license', 'Subscription',
            'use_cases', json_build_array('Evidence synthesis', 'Comparative effectiveness', 'Clinical guidelines', 'HTA submissions'),
            'content_types', json_build_array('Systematic reviews', 'Meta-analyses', 'Clinical trials'),
            'documentation_url', 'https://www.cochranelibrary.com/about/about-cochrane-library'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    endpoint_url = EXCLUDED.endpoint_url,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

    RAISE NOTICE '✅ Imported % foundation tools', (SELECT COUNT(*) FROM tools WHERE tenant_id = v_tenant_id);

END $$;
