-- =====================================================================================
-- 02_COMPREHENSIVE_TOOLS_ALL.sql
-- Comprehensive Tools Catalog - Gold Standard Schema
-- =====================================================================================
-- Purpose: Complete platform-level tool catalog for Pharmaceuticals + Digital Health
-- Target Table: tools (gold standard schema)
-- Total Tools: 100+ tools across all categories
-- =====================================================================================
-- Categories:
--   1. Statistical Software (4 tools)
--   2. Clinical Data Management (3 tools)
--   3. Research Databases & APIs (10 tools)
--   4. Medical & Healthcare APIs (10 tools)
--   5. FHIR / Interoperability (10 tools)
--   6. Clinical NLP (8 tools)
--   7. De-identification & Privacy (5 tools)
--   8. Real-World Evidence / OMOP (7 tools)
--   9. Medical Imaging AI (6 tools)
--  10. Bioinformatics (7 tools)
--  11. Data Quality / ETL (5 tools)
--  12. Clinical Decision Support (6 tools)
--  13. AI/LLM Frameworks (5 tools)
--  14. Regulatory & Compliance (8 tools)
--  15. Market Access & HEOR (6 tools)
--  16. Digital Health Specific (10 tools)
-- =====================================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_count INTEGER := 0;
BEGIN
    -- Use platform tenant for platform-level resources
    SELECT id INTO v_tenant_id FROM tenants WHERE id = '11111111-1111-1111-1111-111111111111' LIMIT 1;

    IF v_tenant_id IS NULL THEN
        v_tenant_id := NULL;
        RAISE NOTICE 'Platform tenant not found, using NULL tenant_id (platform-wide tools)';
    ELSE
        RAISE NOTICE 'Using platform tenant for tools (ID: %)', v_tenant_id;
    END IF;

-- =====================================================================================
-- CATEGORY 1: STATISTICAL SOFTWARE (4 tools)
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
        ARRAY['statistical_software', 'psychometric_analysis', 'open_source', 'clinical_trials'],
        jsonb_build_object(
            'vendor', 'R Foundation',
            'version', '4.3+',
            'license', 'GPL-3',
            'deployment', 'Desktop',
            'use_cases', json_build_array('Psychometric analysis', 'Power analysis', 'Sample size calculation', 'Mixed models', 'Survival analysis', 'Digital biomarker validation'),
            'key_packages', json_build_array('pwr', 'lme4', 'lavaan', 'psych', 'survival', 'tidyverse', 'caret', 'ggplot2'),
            'documentation_url', 'https://www.r-project.org/',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    -- SAS
    (
        gen_random_uuid(),
        v_tenant_id,
        'SAS Statistical Software',
        'sas-statistical-software',
        'Industry-standard statistical software for clinical trials. Often required by regulatory agencies and CROs for FDA/EMA submissions.',
        'statistical',
        'sas',
        true,
        ARRAY['statistical_software', 'clinical_trials', 'regulatory', 'commercial', 'cdisc'],
        jsonb_build_object(
            'vendor', 'SAS Institute',
            'version', '9.4+',
            'license', 'Commercial',
            'deployment', 'Desktop',
            'use_cases', json_build_array('Clinical trial analysis', 'Regulatory submissions', 'CDISC compliance', 'Safety analysis', 'TLFs generation'),
            'key_modules', json_build_array('SAS/STAT', 'SAS/GRAPH', 'SAS Clinical Standards Toolkit', 'SAS/IML'),
            'compliance', json_build_array('21 CFR Part 11', 'CDISC', 'ICH E9'),
            'documentation_url', 'https://www.sas.com/',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    -- Stata
    (
        gen_random_uuid(),
        v_tenant_id,
        'Stata Statistical Software',
        'stata-statistical-software',
        'Statistical software popular in epidemiology and health economics research. Excellent for panel data and survey analysis.',
        'statistical',
        'stata',
        true,
        ARRAY['statistical_software', 'epidemiology', 'health_economics', 'commercial', 'heor'],
        jsonb_build_object(
            'vendor', 'StataCorp',
            'version', '18+',
            'license', 'Commercial',
            'deployment', 'Desktop',
            'use_cases', json_build_array('Epidemiological analysis', 'Health economics', 'Panel data analysis', 'Survey data', 'Cost-effectiveness modeling'),
            'documentation_url', 'https://www.stata.com/',
            'tier', 2,
            'priority', 'high'
        )
    ),

    -- SPSS
    (
        gen_random_uuid(),
        v_tenant_id,
        'IBM SPSS Statistics',
        'ibm-spss-statistics',
        'User-friendly statistical software for behavioral and social science research. Widely used for PRO validation.',
        'statistical',
        'spss',
        true,
        ARRAY['statistical_software', 'pro_validation', 'psychometric', 'commercial', 'patient_reported_outcomes'],
        jsonb_build_object(
            'vendor', 'IBM',
            'version', '29+',
            'license', 'Commercial',
            'deployment', 'Desktop',
            'use_cases', json_build_array('PRO validation', 'Psychometric testing', 'Survey analysis', 'Descriptive statistics', 'Factor analysis'),
            'documentation_url', 'https://www.ibm.com/products/spss-statistics',
            'tier', 2,
            'priority', 'high'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 4;
RAISE NOTICE '✅ Added 4 Statistical Software tools';

-- =====================================================================================
-- CATEGORY 2: CLINICAL DATA MANAGEMENT (3 tools)
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
            'use_cases', json_build_array('eCRF design', 'Clinical data collection', 'Study management', 'ePRO integration', 'Risk-based monitoring'),
            'compliance', json_build_array('21 CFR Part 11', 'CDISC CDASH', 'CDISC SDTM', 'GCP', 'GDPR'),
            'documentation_url', 'https://www.medidata.com/en/clinical-trial-products/rave-edc/',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    -- REDCap
    (
        gen_random_uuid(),
        v_tenant_id,
        'REDCap (Research Electronic Data Capture)',
        'redcap',
        'Free, secure web-based application for research data capture. Popular in academic clinical research and small biotech.',
        'edc',
        'redcap',
        true,
        ARRAY['edc_system', 'academic_research', 'free', 'open_source', 'investigator_initiated'],
        jsonb_build_object(
            'vendor', 'Vanderbilt University',
            'version', '13+',
            'license', 'Free for non-profit research',
            'deployment', 'Self-hosted or cloud',
            'use_cases', json_build_array('Data collection', 'Survey management', 'Clinical trial data', 'Registry studies', 'Investigator-initiated trials'),
            'compliance', json_build_array('21 CFR Part 11', 'HIPAA', 'GDPR'),
            'documentation_url', 'https://www.project-redcap.org/',
            'tier', 2,
            'priority', 'high'
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
        ARRAY['ctms', 'clinical_trials', 'site_management', 'commercial', 'study_startup'],
        jsonb_build_object(
            'vendor', 'Veeva Systems',
            'version', 'Cloud',
            'deployment', 'Cloud (SaaS)',
            'use_cases', json_build_array('Study startup', 'Site selection', 'Patient enrollment tracking', 'Budget management', 'Trial master file'),
            'documentation_url', 'https://www.veeva.com/products/vault-ctms/',
            'tier', 1,
            'priority', 'high'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 3;
RAISE NOTICE '✅ Added 3 Clinical Data Management tools';

-- =====================================================================================
-- CATEGORY 3: RESEARCH DATABASES & APIs (10 tools)
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
        ARRAY['research_database', 'literature_search', 'free', 'api', 'systematic_review'],
        jsonb_build_object(
            'vendor', 'NLM/NIH',
            'license', 'Free',
            'database_size', '35+ million citations',
            'api_available', true,
            'use_cases', json_build_array('Literature review', 'Evidence synthesis', 'Clinical guideline development', 'Competitive intelligence'),
            'documentation_url', 'https://www.ncbi.nlm.nih.gov/books/NBK3827/',
            'tier', 1,
            'priority', 'critical'
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
        ARRAY['research_database', 'clinical_trials', 'regulatory', 'free', 'api', 'competitive_intelligence'],
        jsonb_build_object(
            'vendor', 'NIH',
            'license', 'Free',
            'api_available', true,
            'use_cases', json_build_array('Competitive intelligence', 'Trial design benchmarking', 'Regulatory compliance', 'Patient recruitment', 'Landscape analysis'),
            'compliance', json_build_array('FDAAA 801', 'ICH E3'),
            'documentation_url', 'https://clinicaltrials.gov/api/gui',
            'tier', 1,
            'priority', 'critical'
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
        ARRAY['research_database', 'systematic_review', 'meta_analysis', 'subscription', 'evidence_based_medicine'],
        jsonb_build_object(
            'vendor', 'Cochrane Collaboration',
            'license', 'Subscription',
            'use_cases', json_build_array('Evidence synthesis', 'Comparative effectiveness', 'Clinical guidelines', 'HTA submissions', 'Payer value dossiers'),
            'content_types', json_build_array('Systematic reviews', 'Meta-analyses', 'Clinical trials'),
            'documentation_url', 'https://www.cochranelibrary.com/about/about-cochrane-library',
            'tier', 1,
            'priority', 'high'
        )
    ),

    -- OpenFDA Drug Adverse Events
    (
        gen_random_uuid(),
        v_tenant_id,
        'OpenFDA Drug Adverse Events',
        'openfda-adverse-events',
        'Search FDA Adverse Event Reporting System (FAERS) for drug safety signals and adverse event reports.',
        'api',
        'openfda-api',
        'https://open.fda.gov/apis/drug/event/',
        true,
        ARRAY['regulatory', 'safety', 'pharmacovigilance', 'free', 'api', 'faers'],
        jsonb_build_object(
            'vendor', 'FDA',
            'license', 'Free',
            'api_available', true,
            'use_cases', json_build_array('Safety signal detection', 'Pharmacovigilance', 'Competitive benchmarking', 'Risk management planning'),
            'documentation_url', 'https://open.fda.gov/apis/drug/event/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    -- CMS Medicare Data
    (
        gen_random_uuid(),
        v_tenant_id,
        'CMS Medicare Data',
        'cms-medicare-data',
        'Access Medicare claims data, quality measures, and reimbursement information.',
        'api',
        'cms-api',
        'https://data.cms.gov/provider-data/',
        true,
        ARRAY['health_economics', 'reimbursement', 'claims_data', 'free', 'api', 'medicare'],
        jsonb_build_object(
            'vendor', 'CMS',
            'license', 'Free',
            'api_available', true,
            'use_cases', json_build_array('Market access', 'Reimbursement analysis', 'Quality measures', 'Provider analysis', 'Budget impact modeling'),
            'documentation_url', 'https://data.cms.gov/provider-data/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    -- PubChem
    (
        gen_random_uuid(),
        v_tenant_id,
        'PubChem Chemical Database',
        'pubchem',
        'Search PubChem for chemical structures, properties, and bioactivity data.',
        'api',
        'pubchem-api',
        'https://pubchem.ncbi.nlm.nih.gov/',
        true,
        ARRAY['chemistry', 'drug_discovery', 'free', 'api', 'bioactivity'],
        jsonb_build_object(
            'vendor', 'NCBI',
            'license', 'Free',
            'api_available', true,
            'use_cases', json_build_array('Chemical property lookup', 'Bioactivity screening', 'Target identification', 'ADME prediction'),
            'documentation_url', 'https://pubchem.ncbi.nlm.nih.gov/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    -- DrugBank
    (
        gen_random_uuid(),
        v_tenant_id,
        'DrugBank',
        'drugbank',
        'Comprehensive drug and drug target database combining chemical, pharmacological and pharmaceutical data.',
        'research_tool',
        'drugbank',
        'https://go.drugbank.com/',
        true,
        ARRAY['drug_database', 'pharmacology', 'subscription', 'drug_interactions'],
        jsonb_build_object(
            'vendor', 'DrugBank',
            'license', 'Subscription',
            'use_cases', json_build_array('Drug information lookup', 'Drug interactions', 'Target analysis', 'Competitive profiling'),
            'documentation_url', 'https://go.drugbank.com/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    -- WHO Drug Dictionary
    (
        gen_random_uuid(),
        v_tenant_id,
        'WHO Drug Dictionary',
        'who-drug-dictionary',
        'Global pharmaceutical reference for drug coding in pharmacovigilance and clinical research.',
        'research_tool',
        'who-drug',
        'https://www.who-umc.org/vigibase/services/learn-more-about-who-drug-global/',
        true,
        ARRAY['drug_coding', 'pharmacovigilance', 'subscription', 'global_standard'],
        jsonb_build_object(
            'vendor', 'WHO Uppsala Monitoring Centre',
            'license', 'Subscription',
            'use_cases', json_build_array('Drug coding', 'Safety reporting', 'Regulatory submissions', 'Global pharmacovigilance'),
            'documentation_url', 'https://www.who-umc.org/vigibase/services/learn-more-about-who-drug-global/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    -- MedDRA
    (
        gen_random_uuid(),
        v_tenant_id,
        'MedDRA (Medical Dictionary for Regulatory Activities)',
        'meddra',
        'International medical terminology used for regulatory communication and safety reporting.',
        'research_tool',
        'meddra',
        'https://www.meddra.org/',
        true,
        ARRAY['medical_coding', 'regulatory', 'subscription', 'adverse_events', 'global_standard'],
        jsonb_build_object(
            'vendor', 'MedDRA MSSO',
            'license', 'Subscription',
            'use_cases', json_build_array('Adverse event coding', 'Safety reporting', 'Regulatory submissions', 'Clinical trial safety analysis'),
            'compliance', json_build_array('ICH', 'FDA', 'EMA'),
            'documentation_url', 'https://www.meddra.org/',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    -- UMLS Metathesaurus
    (
        gen_random_uuid(),
        v_tenant_id,
        'UMLS Metathesaurus',
        'umls-metathesaurus',
        'Unified Medical Language System - comprehensive source of biomedical terminology.',
        'research_tool',
        'umls',
        'https://www.nlm.nih.gov/research/umls/',
        true,
        ARRAY['medical_terminology', 'free', 'concept_mapping', 'nlp'],
        jsonb_build_object(
            'vendor', 'NLM',
            'license', 'Free (requires license)',
            'use_cases', json_build_array('Concept normalization', 'Medical NLP', 'Terminology mapping', 'Clinical data extraction'),
            'documentation_url', 'https://www.nlm.nih.gov/research/umls/',
            'tier', 1,
            'priority', 'high'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    endpoint_url = EXCLUDED.endpoint_url,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 10;
RAISE NOTICE '✅ Added 10 Research Databases & APIs';

-- =====================================================================================
-- CATEGORY 4: FHIR / INTEROPERABILITY (10 tools)
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    (
        gen_random_uuid(),
        v_tenant_id,
        'HAPI FHIR',
        'hapi-fhir',
        'Java FHIR server & client libraries - Reference JPA server implementation.',
        'api',
        'hapi-fhir',
        true,
        ARRAY['fhir', 'interoperability', 'java', 'open_source', 'hl7'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'Apache-2.0',
            'language', 'Java',
            'use_cases', json_build_array('FHIR server', 'FHIR client', 'Interoperability', 'Health data exchange'),
            'documentation_url', 'https://github.com/hapifhir/hapi-fhir',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'SMART on FHIR JS Client',
        'smart-on-fhir-client',
        'JavaScript client library for SMART on FHIR apps with OAuth2 support.',
        'api',
        'smart-fhir',
        true,
        ARRAY['fhir', 'smart_on_fhir', 'javascript', 'open_source', 'oauth'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'Apache-2.0',
            'language', 'JavaScript',
            'use_cases', json_build_array('SMART on FHIR apps', 'EHR integration', 'Patient portal apps'),
            'documentation_url', 'https://github.com/smart-on-fhir/client-js',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'LinuxForHealth FHIR Server',
        'linuxforhealth-fhir',
        'High-performance Java FHIR R4/R4B server (formerly IBM FHIR).',
        'api',
        'linuxforhealth-fhir',
        true,
        ARRAY['fhir', 'server', 'java', 'open_source', 'high_performance'],
        jsonb_build_object(
            'vendor', 'LinuxForHealth',
            'license', 'Apache-2.0',
            'language', 'Java',
            'use_cases', json_build_array('FHIR R4/R4B server', 'High-performance data repository'),
            'documentation_url', 'https://github.com/LinuxForHealth/FHIR',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'OpenMRS',
        'openmrs',
        'Global open-source modular EMR platform used in developing countries.',
        'edc',
        'openmrs',
        true,
        ARRAY['emr', 'open_source', 'global_health', 'modular'],
        jsonb_build_object(
            'vendor', 'OpenMRS',
            'license', 'MPL-2.0',
            'use_cases', json_build_array('EMR', 'Patient records', 'Global health'),
            'documentation_url', 'https://openmrs.org/',
            'tier', 3,
            'priority', 'low'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'OpenEMR',
        'openemr',
        'Open-source EHR & practice management - ONC certified.',
        'edc',
        'openemr',
        true,
        ARRAY['emr', 'open_source', 'onc_certified', 'practice_management'],
        jsonb_build_object(
            'vendor', 'OpenEMR',
            'license', 'GPL',
            'certification', 'ONC',
            'use_cases', json_build_array('EHR', 'Practice management', 'Billing'),
            'documentation_url', 'https://www.open-emr.org/',
            'tier', 3,
            'priority', 'low'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'EHRbase',
        'ehrbase',
        'OpenEHR clinical data repository/server based on archetype methodology.',
        'edc',
        'ehrbase',
        true,
        ARRAY['openehr', 'open_source', 'clinical_data', 'archetype'],
        jsonb_build_object(
            'vendor', 'EHRbase',
            'license', 'Apache-2.0',
            'standard', 'openEHR',
            'use_cases', json_build_array('Clinical data repository', 'Archetype-based modeling'),
            'documentation_url', 'https://www.ehrbase.org/',
            'tier', 3,
            'priority', 'low'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'OpenHIM (Interoperability Layer)',
        'openhim',
        'Interoperability mediator for routing and transforming health data.',
        'api',
        'openhim',
        true,
        ARRAY['interoperability', 'open_source', 'mediator', 'routing'],
        jsonb_build_object(
            'vendor', 'OpenHIM',
            'license', 'MPL-2.0',
            'use_cases', json_build_array('Data routing', 'Protocol transformation', 'Health information exchange'),
            'documentation_url', 'https://openhim.org/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'OpenSRP',
        'opensrp',
        'FHIR-native mobile platform for frontline health workers.',
        'api',
        'opensrp',
        true,
        ARRAY['mobile', 'fhir', 'open_source', 'frontline_workers'],
        jsonb_build_object(
            'vendor', 'OpenSRP',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('Mobile health', 'Frontline workers', 'Offline-capable data collection'),
            'documentation_url', 'https://opensrp.io/',
            'tier', 3,
            'priority', 'low'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'DHIS2',
        'dhis2',
        'Open-source health management information system for public health.',
        'api',
        'dhis2',
        true,
        ARRAY['hmis', 'public_health', 'open_source', 'data_collection'],
        jsonb_build_object(
            'vendor', 'DHIS2',
            'license', 'BSD-style',
            'use_cases', json_build_array('Health information systems', 'Public health reporting', 'Aggregate data'),
            'documentation_url', 'https://dhis2.org/',
            'tier', 3,
            'priority', 'low'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'OpenLMIS',
        'openlmis',
        'Logistics management info system for health commodities supply chain.',
        'api',
        'openlmis',
        true,
        ARRAY['supply_chain', 'logistics', 'open_source', 'inventory'],
        jsonb_build_object(
            'vendor', 'OpenLMIS',
            'license', 'AGPL-3.0',
            'use_cases', json_build_array('Supply chain management', 'Inventory management', 'Procurement'),
            'documentation_url', 'https://openlmis.org/',
            'tier', 3,
            'priority', 'low'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 10;
RAISE NOTICE '✅ Added 10 FHIR/Interoperability tools';

-- =====================================================================================
-- CATEGORY 5: CLINICAL NLP (8 tools)
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    (
        gen_random_uuid(),
        v_tenant_id,
        'Apache cTAKES',
        'apache-ctakes',
        'Clinical text NLP (UIMA): concept extraction, negation detection, context analysis.',
        'api',
        'ctakes',
        true,
        ARRAY['clinical_nlp', 'open_source', 'concept_extraction', 'umls'],
        jsonb_build_object(
            'vendor', 'Apache Software Foundation',
            'license', 'Apache-2.0',
            'language', 'Java',
            'framework', 'UIMA',
            'use_cases', json_build_array('Clinical concept extraction', 'Negation detection', 'UMLS coding', 'Clinical text mining'),
            'documentation_url', 'https://github.com/apache/ctakes',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'medSpaCy',
        'medspacy',
        'spaCy-based clinical NLP components for sections, negation, context analysis.',
        'api',
        'medspacy',
        true,
        ARRAY['clinical_nlp', 'open_source', 'python', 'spacy'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'MIT',
            'language', 'Python',
            'framework', 'spaCy',
            'use_cases', json_build_array('Clinical NER', 'Section detection', 'Negation detection', 'Context analysis'),
            'documentation_url', 'https://github.com/medspacy/medspacy',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'scispaCy',
        'scispacy',
        'Biomedical spaCy models and pipelines for scientific text processing.',
        'api',
        'scispacy',
        true,
        ARRAY['biomedical_nlp', 'open_source', 'python', 'spacy'],
        jsonb_build_object(
            'vendor', 'AllenAI',
            'license', 'Apache-2.0',
            'language', 'Python',
            'use_cases', json_build_array('Biomedical NER', 'Scientific text processing', 'Entity linking'),
            'documentation_url', 'https://github.com/allenai/scispacy',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'MedCAT',
        'medcat',
        'Medical Concept Annotation & linking to SNOMED/UMLS with active learning.',
        'api',
        'medcat',
        true,
        ARRAY['clinical_nlp', 'open_source', 'python', 'concept_annotation', 'snomed', 'umls'],
        jsonb_build_object(
            'vendor', 'CogStack',
            'license', 'Apache-2.0',
            'language', 'Python',
            'terminologies', json_build_array('SNOMED CT', 'UMLS'),
            'use_cases', json_build_array('Concept annotation', 'Entity linking', 'Active learning', 'Clinical coding'),
            'documentation_url', 'https://github.com/CogStack/MedCAT',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'QuickUMLS',
        'quickumls',
        'Fast approximate UMLS concept matcher using SimString algorithm.',
        'api',
        'quickumls',
        true,
        ARRAY['clinical_nlp', 'open_source', 'python', 'umls', 'concept_matching'],
        jsonb_build_object(
            'vendor', 'Georgetown IR Lab',
            'license', 'MIT',
            'language', 'Python',
            'use_cases', json_build_array('UMLS concept matching', 'Fast lookup', 'Concept normalization'),
            'documentation_url', 'https://github.com/Georgetown-IR-Lab/QuickUMLS',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'MetaMap',
        'metamap',
        'NLM tool for mapping biomedical text to UMLS Metathesaurus concepts.',
        'api',
        'metamap',
        true,
        ARRAY['clinical_nlp', 'free', 'umls', 'concept_mapping'],
        jsonb_build_object(
            'vendor', 'NLM',
            'license', 'Free',
            'use_cases', json_build_array('UMLS concept mapping', 'Biomedical text processing'),
            'documentation_url', 'https://metamap.nlm.nih.gov/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'ClinicalBERT',
        'clinicalbert',
        'BERT model pre-trained on clinical notes for clinical NLP tasks.',
        'api',
        'clinicalbert',
        true,
        ARRAY['clinical_nlp', 'open_source', 'bert', 'deep_learning'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'MIT',
            'use_cases', json_build_array('Clinical text classification', 'Named entity recognition', 'Clinical embeddings'),
            'documentation_url', 'https://github.com/EmilyAlsentzer/clinicalBERT',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'BioBERT',
        'biobert',
        'BERT model pre-trained on biomedical literature for biomedical text mining.',
        'api',
        'biobert',
        true,
        ARRAY['biomedical_nlp', 'open_source', 'bert', 'deep_learning'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('Biomedical NER', 'Relation extraction', 'Question answering'),
            'documentation_url', 'https://github.com/dmis-lab/biobert',
            'tier', 2,
            'priority', 'medium'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 8;
RAISE NOTICE '✅ Added 8 Clinical NLP tools';

-- =====================================================================================
-- CATEGORY 6: DE-IDENTIFICATION & PRIVACY (5 tools)
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    (
        gen_random_uuid(),
        v_tenant_id,
        'Microsoft Presidio',
        'microsoft-presidio',
        'PII detection and anonymization for text and images with customizable recognizers.',
        'api',
        'presidio',
        true,
        ARRAY['de_identification', 'open_source', 'pii', 'privacy', 'gdpr', 'hipaa'],
        jsonb_build_object(
            'vendor', 'Microsoft',
            'license', 'MIT',
            'language', 'Python',
            'use_cases', json_build_array('PII detection', 'De-identification', 'GDPR compliance', 'HIPAA compliance'),
            'compliance', json_build_array('GDPR', 'HIPAA'),
            'documentation_url', 'https://github.com/microsoft/presidio',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Philter',
        'philter',
        'PHI filter for clinical notes - removes protected health information.',
        'api',
        'philter',
        true,
        ARRAY['de_identification', 'open_source', 'phi', 'hipaa', 'clinical_notes'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('PHI removal', 'Clinical note de-identification', 'HIPAA compliance'),
            'compliance', json_build_array('HIPAA'),
            'documentation_url', 'https://github.com/PhenoMe/Philter',
            'tier', 2,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'NER-deid',
        'ner-deid',
        'Named entity recognition for de-identification of clinical notes.',
        'api',
        'ner-deid',
        true,
        ARRAY['de_identification', 'open_source', 'ner', 'clinical_notes'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'MIT',
            'use_cases', json_build_array('De-identification', 'NER', 'Clinical text anonymization'),
            'documentation_url', 'https://github.com/alistairjohnson/ner-deid',
            'tier', 3,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'ARX Data Anonymization Tool',
        'arx-anonymization',
        'Open-source de-identification and anonymization for structured data.',
        'api',
        'arx',
        true,
        ARRAY['de_identification', 'open_source', 'anonymization', 'structured_data'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('Data anonymization', 'K-anonymity', 'L-diversity', 'Privacy preservation'),
            'documentation_url', 'https://arx.deidentifier.org/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Synthea Patient Generator',
        'synthea',
        'Synthetic patient data generator for realistic de-identified test data.',
        'api',
        'synthea',
        true,
        ARRAY['synthetic_data', 'open_source', 'fhir', 'test_data'],
        jsonb_build_object(
            'vendor', 'MITRE',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('Synthetic patient data', 'Testing', 'Development', 'FHIR resources'),
            'documentation_url', 'https://github.com/synthetichealth/synthea',
            'tier', 2,
            'priority', 'medium'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 5;
RAISE NOTICE '✅ Added 5 De-identification & Privacy tools';

-- =====================================================================================
-- CATEGORY 7: REAL-WORLD EVIDENCE / OMOP (7 tools)
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    (
        gen_random_uuid(),
        v_tenant_id,
        'OHDSI ATLAS',
        'ohdsi-atlas',
        'Web-based cohort definition, characterization, and analytics tool for OMOP CDM.',
        'api',
        'atlas',
        true,
        ARRAY['rwe', 'omop', 'open_source', 'cohort_definition', 'observational_research'],
        jsonb_build_object(
            'vendor', 'OHDSI',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('Cohort definition', 'Patient-level prediction', 'Population-level estimation', 'Data quality'),
            'documentation_url', 'https://github.com/OHDSI/Atlas',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'OMOP Common Data Model',
        'omop-cdm',
        'Standardized data model for observational healthcare data and real-world evidence.',
        'api',
        'omop-cdm',
        true,
        ARRAY['rwe', 'omop', 'open_source', 'data_model', 'standardization'],
        jsonb_build_object(
            'vendor', 'OHDSI',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('Real-world evidence', 'Observational research', 'Multi-database studies', 'Data standardization'),
            'documentation_url', 'https://ohdsi.github.io/CommonDataModel/',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'ACHILLES (Data Characterization)',
        'achilles',
        'Automated data quality checks and characterization for OMOP CDM databases.',
        'api',
        'achilles',
        true,
        ARRAY['rwe', 'omop', 'open_source', 'data_quality'],
        jsonb_build_object(
            'vendor', 'OHDSI',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('Data quality assessment', 'Database profiling', 'Descriptive analytics'),
            'documentation_url', 'https://github.com/OHDSI/Achilles',
            'tier', 2,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'HADES (Health Analytics Data-to-Evidence Suite)',
        'hades',
        'R packages for large-scale analytics on observational healthcare data.',
        'api',
        'hades',
        true,
        ARRAY['rwe', 'omop', 'open_source', 'r', 'analytics'],
        jsonb_build_object(
            'vendor', 'OHDSI',
            'license', 'Apache-2.0',
            'language', 'R',
            'use_cases', json_build_array('Patient-level prediction', 'Population-level estimation', 'Large-scale analytics'),
            'documentation_url', 'https://ohdsi.github.io/Hades/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'CohortDiagnostics',
        'cohort-diagnostics',
        'Diagnostic tools for evaluating phenotype definitions on OMOP data.',
        'api',
        'cohort-diagnostics',
        true,
        ARRAY['rwe', 'omop', 'open_source', 'r', 'cohort_validation'],
        jsonb_build_object(
            'vendor', 'OHDSI',
            'license', 'Apache-2.0',
            'language', 'R',
            'use_cases', json_build_array('Cohort validation', 'Phenotype definition evaluation', 'Cohort diagnostics'),
            'documentation_url', 'https://github.com/OHDSI/CohortDiagnostics',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'White Rabbit',
        'white-rabbit',
        'ETL design and mapping tool for converting data to OMOP CDM.',
        'api',
        'white-rabbit',
        true,
        ARRAY['rwe', 'omop', 'open_source', 'etl', 'data_mapping'],
        jsonb_build_object(
            'vendor', 'OHDSI',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('ETL design', 'Source-to-OMOP mapping', 'Data profiling'),
            'documentation_url', 'https://github.com/OHDSI/WhiteRabbit',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Rabbit-In-a-Hat',
        'rabbit-in-a-hat',
        'Visual ETL design tool for mapping source data to OMOP CDM.',
        'api',
        'rabbit-in-a-hat',
        true,
        ARRAY['rwe', 'omop', 'open_source', 'etl', 'visual_mapping'],
        jsonb_build_object(
            'vendor', 'OHDSI',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('Visual ETL design', 'Source-to-OMOP mapping documentation'),
            'documentation_url', 'https://github.com/OHDSI/WhiteRabbit',
            'tier', 3,
            'priority', 'low'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 7;
RAISE NOTICE '✅ Added 7 Real-World Evidence / OMOP tools';

-- =====================================================================================
-- CATEGORY 8: MEDICAL IMAGING AI (6 tools)
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    (
        gen_random_uuid(),
        v_tenant_id,
        'MONAI (Medical Open Network for AI)',
        'monai',
        'PyTorch-based deep learning framework for healthcare imaging.',
        'api',
        'monai',
        true,
        ARRAY['medical_imaging', 'open_source', 'deep_learning', 'pytorch'],
        jsonb_build_object(
            'vendor', 'MONAI Consortium',
            'license', 'Apache-2.0',
            'language', 'Python',
            'use_cases', json_build_array('Medical image analysis', 'Deep learning', 'Image segmentation', 'Image classification'),
            'documentation_url', 'https://monai.io/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        '3D Slicer',
        '3d-slicer',
        'Open-source platform for medical image computing and visualization.',
        'api',
        '3d-slicer',
        true,
        ARRAY['medical_imaging', 'open_source', 'visualization', '3d'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'BSD',
            'use_cases', json_build_array('Medical image visualization', '3D reconstruction', 'Image registration'),
            'documentation_url', 'https://www.slicer.org/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'SimpleITK',
        'simpleitk',
        'Simplified interface to Insight Toolkit for medical image analysis.',
        'api',
        'simpleitk',
        true,
        ARRAY['medical_imaging', 'open_source', 'python', 'image_processing'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'Apache-2.0',
            'language', 'Python',
            'use_cases', json_build_array('Image registration', 'Segmentation', 'Filtering'),
            'documentation_url', 'https://simpleitk.org/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'PyRadiomics',
        'pyradiomics',
        'Extract radiomics features from medical imaging.',
        'api',
        'pyradiomics',
        true,
        ARRAY['medical_imaging', 'open_source', 'radiomics', 'feature_extraction'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'BSD-3-Clause',
            'language', 'Python',
            'use_cases', json_build_array('Radiomics', 'Feature extraction', 'Quantitative imaging'),
            'documentation_url', 'https://pyradiomics.readthedocs.io/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'OHIF Viewer',
        'ohif-viewer',
        'Open-source web-based DICOM viewer with extensible plugins.',
        'api',
        'ohif',
        true,
        ARRAY['medical_imaging', 'open_source', 'dicom', 'viewer'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'MIT',
            'use_cases', json_build_array('DICOM viewing', 'Image annotation', 'Web-based viewer'),
            'documentation_url', 'https://ohif.org/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'nnU-Net',
        'nnu-net',
        'Self-adapting deep learning framework for medical image segmentation.',
        'api',
        'nnu-net',
        true,
        ARRAY['medical_imaging', 'open_source', 'deep_learning', 'segmentation'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'Apache-2.0',
            'language', 'Python',
            'use_cases', json_build_array('Image segmentation', 'Automated model configuration'),
            'documentation_url', 'https://github.com/MIC-DKFZ/nnUNet',
            'tier', 2,
            'priority', 'medium'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 6;
RAISE NOTICE '✅ Added 6 Medical Imaging AI tools';

-- =====================================================================================
-- CATEGORY 9: BIOINFORMATICS (7 tools)
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    (
        gen_random_uuid(),
        v_tenant_id,
        'BioPython',
        'biopython',
        'Python tools for computational molecular biology and bioinformatics.',
        'api',
        'biopython',
        true,
        ARRAY['bioinformatics', 'open_source', 'python', 'genomics'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'BSD',
            'language', 'Python',
            'use_cases', json_build_array('Sequence analysis', 'Phylogenetics', 'Structural bioinformatics'),
            'documentation_url', 'https://biopython.org/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'GATK (Genome Analysis Toolkit)',
        'gatk',
        'Variant discovery and genotyping toolkit from Broad Institute.',
        'api',
        'gatk',
        true,
        ARRAY['bioinformatics', 'open_source', 'genomics', 'variant_calling'],
        jsonb_build_object(
            'vendor', 'Broad Institute',
            'license', 'BSD-3-Clause',
            'use_cases', json_build_array('Variant calling', 'Genotyping', 'Germline/somatic variant discovery'),
            'documentation_url', 'https://gatk.broadinstitute.org/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'SAMtools',
        'samtools',
        'Tools for manipulating next-generation sequencing data.',
        'api',
        'samtools',
        true,
        ARRAY['bioinformatics', 'open_source', 'genomics', 'ngs'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'MIT',
            'use_cases', json_build_array('BAM/SAM file processing', 'NGS data manipulation', 'Alignment indexing'),
            'documentation_url', 'http://www.htslib.org/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'BLAST (Basic Local Alignment Search Tool)',
        'blast',
        'Finds regions of similarity between biological sequences.',
        'api',
        'blast',
        true,
        ARRAY['bioinformatics', 'free', 'sequence_alignment', 'ncbi'],
        jsonb_build_object(
            'vendor', 'NCBI',
            'license', 'Public Domain',
            'use_cases', json_build_array('Sequence alignment', 'Homology search', 'Protein/nucleotide comparison'),
            'documentation_url', 'https://blast.ncbi.nlm.nih.gov/',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'ENSEMBL Genome Browser',
        'ensembl',
        'Genome browser for vertebrate genomes with APIs for programmatic access.',
        'api',
        'ensembl',
        true,
        ARRAY['bioinformatics', 'free', 'genomics', 'genome_browser'],
        jsonb_build_object(
            'vendor', 'EMBL-EBI',
            'license', 'Free',
            'use_cases', json_build_array('Genome browsing', 'Variant annotation', 'Comparative genomics'),
            'documentation_url', 'https://www.ensembl.org/',
            'tier', 2,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'STRING (Protein-Protein Interaction)',
        'string-db',
        'Database of known and predicted protein-protein interactions.',
        'api',
        'string',
        true,
        ARRAY['bioinformatics', 'free', 'proteomics', 'ppi'],
        jsonb_build_object(
            'vendor', 'STRING Consortium',
            'license', 'Free',
            'use_cases', json_build_array('Protein interaction networks', 'Functional enrichment', 'Pathway analysis'),
            'documentation_url', 'https://string-db.org/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Cytoscape',
        'cytoscape',
        'Platform for complex network analysis and visualization.',
        'api',
        'cytoscape',
        true,
        ARRAY['bioinformatics', 'open_source', 'network_analysis', 'visualization'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'LGPL',
            'use_cases', json_build_array('Network visualization', 'Pathway analysis', 'Systems biology'),
            'documentation_url', 'https://cytoscape.org/',
            'tier', 2,
            'priority', 'medium'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 7;
RAISE NOTICE '✅ Added 7 Bioinformatics tools';

-- =====================================================================================
-- CATEGORY 10: DATA QUALITY / ETL (5 tools)
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    (
        gen_random_uuid(),
        v_tenant_id,
        'Great Expectations',
        'great-expectations',
        'Data quality and validation framework for Python.',
        'api',
        'great-expectations',
        true,
        ARRAY['data_quality', 'open_source', 'python', 'validation'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'Apache-2.0',
            'language', 'Python',
            'use_cases', json_build_array('Data validation', 'Quality checks', 'Pipeline testing'),
            'documentation_url', 'https://greatexpectations.io/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Apache Airflow',
        'apache-airflow',
        'Platform to programmatically author, schedule, and monitor workflows.',
        'api',
        'airflow',
        true,
        ARRAY['etl', 'open_source', 'python', 'workflow_orchestration'],
        jsonb_build_object(
            'vendor', 'Apache Software Foundation',
            'license', 'Apache-2.0',
            'language', 'Python',
            'use_cases', json_build_array('ETL orchestration', 'Data pipeline management', 'Workflow scheduling'),
            'documentation_url', 'https://airflow.apache.org/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'dbt (data build tool)',
        'dbt',
        'SQL-based transformation workflow tool for analytics.',
        'api',
        'dbt',
        true,
        ARRAY['etl', 'open_source', 'sql', 'transformation'],
        jsonb_build_object(
            'vendor', 'dbt Labs',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('Data transformation', 'Analytics engineering', 'SQL workflow'),
            'documentation_url', 'https://www.getdbt.com/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Pandas Profiling (ydata-profiling)',
        'pandas-profiling',
        'Automated exploratory data analysis for pandas DataFrames.',
        'api',
        'pandas-profiling',
        true,
        ARRAY['data_quality', 'open_source', 'python', 'eda'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'MIT',
            'language', 'Python',
            'use_cases', json_build_array('Exploratory data analysis', 'Data profiling', 'Quality assessment'),
            'documentation_url', 'https://ydata-profiling.ydata.ai/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'DataCleaner',
        'datacleaner',
        'Open-source data quality analysis and profiling tool.',
        'api',
        'datacleaner',
        true,
        ARRAY['data_quality', 'open_source', 'profiling', 'cleansing'],
        jsonb_build_object(
            'vendor', 'Human Inference',
            'license', 'LGPL',
            'use_cases', json_build_array('Data profiling', 'Quality analysis', 'Data cleansing'),
            'documentation_url', 'https://datacleaner.github.io/',
            'tier', 3,
            'priority', 'low'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 5;
RAISE NOTICE '✅ Added 5 Data Quality / ETL tools';

-- =====================================================================================
-- CATEGORY 11: REGULATORY & COMPLIANCE (8 tools)
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    (
        gen_random_uuid(),
        v_tenant_id,
        'Veeva Vault RIM (Regulatory Information Management)',
        'veeva-vault-rim',
        'Cloud-based regulatory information management for global submissions.',
        'api',
        'veeva-rim',
        true,
        ARRAY['regulatory', 'commercial', 'submissions', 'rim'],
        jsonb_build_object(
            'vendor', 'Veeva Systems',
            'license', 'Commercial',
            'deployment', 'Cloud (SaaS)',
            'use_cases', json_build_array('Regulatory submissions', 'Dossier management', 'Health authority interactions', 'Global regulatory strategy'),
            'compliance', json_build_array('eCTD', 'NeeS', 'CESP'),
            'documentation_url', 'https://www.veeva.com/products/vault-rim/',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Extedo SUBMIT',
        'extedo-submit',
        'eCTD publishing and regulatory submission software.',
        'api',
        'extedo',
        true,
        ARRAY['regulatory', 'commercial', 'ectd', 'submissions'],
        jsonb_build_object(
            'vendor', 'Extedo',
            'license', 'Commercial',
            'use_cases', json_build_array('eCTD publishing', 'Regulatory submissions', 'Dossier validation'),
            'compliance', json_build_array('eCTD', 'NeeS'),
            'documentation_url', 'https://www.extedo.com/',
            'tier', 2,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'MasterControl',
        'mastercontrol',
        'Quality management system for life sciences compliance.',
        'api',
        'mastercontrol',
        true,
        ARRAY['regulatory', 'quality', 'commercial', 'qms'],
        jsonb_build_object(
            'vendor', 'MasterControl',
            'license', 'Commercial',
            'deployment', 'Cloud (SaaS)',
            'use_cases', json_build_array('Document control', 'Training management', 'CAPA', 'Change control', 'Audit management'),
            'compliance', json_build_array('21 CFR Part 11', 'ISO 13485', 'GMP'),
            'documentation_url', 'https://www.mastercontrol.com/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'TrackWise (Sparta Systems)',
        'trackwise',
        'Quality management and compliance software for life sciences.',
        'api',
        'trackwise',
        true,
        ARRAY['regulatory', 'quality', 'commercial', 'qms'],
        jsonb_build_object(
            'vendor', 'Sparta Systems',
            'license', 'Commercial',
            'use_cases', json_build_array('CAPA management', 'Deviation management', 'Change control', 'Audit management'),
            'compliance', json_build_array('21 CFR Part 11', 'GMP', 'ISO'),
            'documentation_url', 'https://www.spartasystems.com/',
            'tier', 2,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Ideagen Gael IMPACT',
        'ideagen-gael-impact',
        'Regulatory dossier management and publishing platform.',
        'api',
        'gael-impact',
        true,
        ARRAY['regulatory', 'commercial', 'dossier_management', 'publishing'],
        jsonb_build_object(
            'vendor', 'Ideagen',
            'license', 'Commercial',
            'use_cases', json_build_array('Dossier management', 'eCTD publishing', 'Label management'),
            'compliance', json_build_array('eCTD', 'NeeS'),
            'documentation_url', 'https://www.ideagen.com/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Synchrogenix (IDERA)',
        'synchrogenix',
        'Regulatory publishing and submissions software.',
        'api',
        'synchrogenix',
        true,
        ARRAY['regulatory', 'commercial', 'ectd', 'publishing'],
        jsonb_build_object(
            'vendor', 'IDERA',
            'license', 'Commercial',
            'use_cases', json_build_array('eCTD publishing', 'Regulatory submissions', 'Document management'),
            'documentation_url', 'https://www.ideracorp.com/',
            'tier', 3,
            'priority', 'low'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Arsenal (eCTD Manager)',
        'arsenal-ectd',
        'eCTD document management and submission preparation.',
        'api',
        'arsenal',
        true,
        ARRAY['regulatory', 'commercial', 'ectd', 'document_management'],
        jsonb_build_object(
            'vendor', 'Freyr Solutions',
            'license', 'Commercial',
            'use_cases', json_build_array('eCTD management', 'Submission preparation', 'Dossier publishing'),
            'tier', 3,
            'priority', 'low'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Lorenz Docubridge',
        'lorenz-docubridge',
        'eCTD/NeeS publishing and validation software.',
        'api',
        'lorenz-docubridge',
        true,
        ARRAY['regulatory', 'commercial', 'ectd', 'validation'],
        jsonb_build_object(
            'vendor', 'Lorenz Life Sciences',
            'license', 'Commercial',
            'use_cases', json_build_array('eCTD publishing', 'Validation', 'Submission preparation'),
            'tier', 3,
            'priority', 'low'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 8;
RAISE NOTICE '✅ Added 8 Regulatory & Compliance tools';

-- =====================================================================================
-- CATEGORY 12: MARKET ACCESS & HEOR (6 tools)
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    (
        gen_random_uuid(),
        v_tenant_id,
        'TreeAge Pro',
        'treeage-pro',
        'Decision tree and Markov modeling software for health economics.',
        'api',
        'treeage',
        true,
        ARRAY['heor', 'commercial', 'modeling', 'cost_effectiveness'],
        jsonb_build_object(
            'vendor', 'TreeAge Software',
            'license', 'Commercial',
            'deployment', 'Desktop',
            'use_cases', json_build_array('Cost-effectiveness modeling', 'Decision analysis', 'Budget impact models', 'Markov models'),
            'documentation_url', 'https://www.treeage.com/',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'R HEEMOD (Health Economic Evaluation Modeling)',
        'r-heemod',
        'R package for Markov models in health economic evaluation.',
        'api',
        'heemod',
        true,
        ARRAY['heor', 'open_source', 'r', 'markov_modeling'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'GPL-3',
            'language', 'R',
            'use_cases', json_build_array('Markov modeling', 'Cost-effectiveness analysis', 'Sensitivity analysis'),
            'documentation_url', 'https://cran.r-project.org/package=heemod',
            'tier', 2,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Excel-based Economic Models',
        'excel-heor-models',
        'Custom Excel-based models for health economic evaluation.',
        'api',
        'excel-heor',
        true,
        ARRAY['heor', 'excel', 'modeling', 'budget_impact'],
        jsonb_build_object(
            'vendor', 'Various',
            'license', 'Commercial',
            'deployment', 'Desktop',
            'use_cases', json_build_array('Budget impact models', 'Cost-effectiveness models', 'Simple decision trees'),
            'tier', 2,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'NICE Decision Support Unit (DSU) Templates',
        'nice-dsu-templates',
        'NICE-endorsed model templates for UK HTA submissions.',
        'research_tool',
        'nice-dsu',
        true,
        ARRAY['heor', 'free', 'hta', 'nice', 'modeling'],
        jsonb_build_object(
            'vendor', 'NICE',
            'license', 'Free',
            'use_cases', json_build_array('HTA submissions', 'NICE technology appraisals', 'UK payer submissions'),
            'documentation_url', 'https://www.nicedsu.org.uk/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'IQVIA HEOR Analytics',
        'iqvia-heor',
        'Commercial platform for health economics and outcomes research.',
        'api',
        'iqvia-heor',
        true,
        ARRAY['heor', 'commercial', 'analytics', 'real_world_data'],
        jsonb_build_object(
            'vendor', 'IQVIA',
            'license', 'Commercial',
            'use_cases', json_build_array('Real-world evidence', 'HEOR analytics', 'Claims data analysis'),
            'documentation_url', 'https://www.iqvia.com/',
            'tier', 1,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Visible Analytics (Evidera)',
        'visible-analytics',
        'Platform for health economics modeling and value demonstration.',
        'api',
        'visible-analytics',
        true,
        ARRAY['heor', 'commercial', 'modeling', 'value_demonstration'],
        jsonb_build_object(
            'vendor', 'Evidera (PPD)',
            'license', 'Commercial',
            'use_cases', json_build_array('Economic modeling', 'Value dossiers', 'Payer engagement'),
            'tier', 2,
            'priority', 'medium'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 6;
RAISE NOTICE '✅ Added 6 Market Access & HEOR tools';

-- =====================================================================================
-- CATEGORY 13: DIGITAL HEALTH SPECIFIC (10 tools)
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    (
        gen_random_uuid(),
        v_tenant_id,
        'Apple HealthKit',
        'apple-healthkit',
        'Framework for accessing health and fitness data from iPhone and Apple Watch.',
        'api',
        'healthkit',
        true,
        ARRAY['digital_health', 'mobile_health', 'wearables', 'ios'],
        jsonb_build_object(
            'vendor', 'Apple',
            'license', 'Commercial',
            'platform', 'iOS',
            'use_cases', json_build_array('Wearable data integration', 'Digital biomarkers', 'mHealth apps', 'Patient monitoring'),
            'documentation_url', 'https://developer.apple.com/health-fitness/',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Google Health Connect',
        'google-health-connect',
        'Platform for health and fitness data sharing on Android.',
        'api',
        'health-connect',
        true,
        ARRAY['digital_health', 'mobile_health', 'wearables', 'android'],
        jsonb_build_object(
            'vendor', 'Google',
            'license', 'Commercial',
            'platform', 'Android',
            'use_cases', json_build_array('Wearable data integration', 'Digital biomarkers', 'mHealth apps', 'Interoperability'),
            'documentation_url', 'https://developer.android.com/health-and-fitness/guides/health-connect',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'ResearchKit (Apple)',
        'researchkit',
        'Open-source framework for creating research study apps on iOS.',
        'api',
        'researchkit',
        true,
        ARRAY['digital_health', 'clinical_trials', 'open_source', 'ios', 'decentralized_trials'],
        jsonb_build_object(
            'vendor', 'Apple',
            'license', 'BSD',
            'platform', 'iOS',
            'use_cases', json_build_array('Digital clinical trials', 'Remote patient monitoring', 'Decentralized trials', 'ePRO collection'),
            'documentation_url', 'https://www.researchandcare.org/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'ResearchStack (Android)',
        'researchstack',
        'Android SDK for building research study mobile apps.',
        'api',
        'researchstack',
        true,
        ARRAY['digital_health', 'clinical_trials', 'open_source', 'android'],
        jsonb_build_object(
            'vendor', 'Open Source',
            'license', 'Apache-2.0',
            'platform', 'Android',
            'use_cases', json_build_array('Digital clinical trials', 'Remote monitoring', 'Data collection'),
            'documentation_url', 'http://researchstack.org/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Sage Bionetworks Bridge Server',
        'sage-bridge',
        'Backend platform for mobile health research studies.',
        'api',
        'sage-bridge',
        true,
        ARRAY['digital_health', 'clinical_trials', 'open_source', 'mhealth', 'backend'],
        jsonb_build_object(
            'vendor', 'Sage Bionetworks',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('mHealth study backend', 'Data collection', 'Consent management', 'Participant management'),
            'documentation_url', 'https://sagebionetworks.org/tools_resources/bridge-server/',
            'tier', 2,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'RADAR-base',
        'radar-base',
        'Open-source platform for wearables and mobile health data collection.',
        'api',
        'radar-base',
        true,
        ARRAY['digital_health', 'wearables', 'open_source', 'remote_monitoring'],
        jsonb_build_object(
            'vendor', 'The Hyve & Kings College London',
            'license', 'Apache-2.0',
            'use_cases', json_build_array('Wearable data collection', 'Remote patient monitoring', 'Real-time data streaming'),
            'documentation_url', 'https://radar-base.org/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Fitbit Web API',
        'fitbit-api',
        'API for accessing Fitbit activity, sleep, and heart rate data.',
        'api',
        'fitbit',
        true,
        ARRAY['digital_health', 'wearables', 'api', 'activity_tracking'],
        jsonb_build_object(
            'vendor', 'Fitbit (Google)',
            'license', 'Commercial',
            'use_cases', json_build_array('Activity data', 'Sleep tracking', 'Heart rate monitoring', 'Digital biomarkers'),
            'documentation_url', 'https://dev.fitbit.com/build/reference/web-api/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Validic',
        'validic',
        'Platform for aggregating remote patient monitoring and wearable data.',
        'api',
        'validic',
        true,
        ARRAY['digital_health', 'wearables', 'commercial', 'data_aggregation'],
        jsonb_build_object(
            'vendor', 'Validic',
            'license', 'Commercial',
            'use_cases', json_build_array('Wearable data aggregation', 'RPM platform', 'Multi-device integration'),
            'documentation_url', 'https://validic.com/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Terra API',
        'terra-api',
        'Unified API for wearables and fitness data (Fitbit, Garmin, Oura, etc.).',
        'api',
        'terra-api',
        true,
        ARRAY['digital_health', 'wearables', 'commercial', 'api', 'multi_device'],
        jsonb_build_object(
            'vendor', 'Terra',
            'license', 'Commercial',
            'use_cases', json_build_array('Multi-device wearable integration', 'Digital biomarkers', 'Unified data access'),
            'documentation_url', 'https://docs.tryterra.co/',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'MyDataHelps SDK',
        'mydatahelps',
        'Platform for participant-centered digital health research.',
        'api',
        'mydatahelps',
        true,
        ARRAY['digital_health', 'clinical_trials', 'commercial', 'patient_engagement'],
        jsonb_build_object(
            'vendor', 'CareEvolution',
            'license', 'Commercial',
            'use_cases', json_build_array('Patient engagement', 'Digital trials', 'Data collection', 'Surveys'),
            'documentation_url', 'https://mydatahelps.org/',
            'tier', 2,
            'priority', 'medium'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 10;
RAISE NOTICE '✅ Added 10 Digital Health Specific tools';

-- =====================================================================================
-- CATEGORY 14: AI/LLM FRAMEWORKS (5 tools)
-- =====================================================================================

INSERT INTO tools (
    id, tenant_id, name, slug, description, tool_type,
    integration_name, is_active, tags, metadata
) VALUES
    (
        gen_random_uuid(),
        v_tenant_id,
        'LangChain',
        'langchain',
        'Framework for developing applications powered by language models.',
        'api',
        'langchain',
        true,
        ARRAY['ai', 'llm', 'open_source', 'framework'],
        jsonb_build_object(
            'vendor', 'LangChain',
            'license', 'MIT',
            'language', 'Python',
            'use_cases', json_build_array('LLM applications', 'Agent workflows', 'RAG systems', 'Chain orchestration'),
            'documentation_url', 'https://python.langchain.com/',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'LangGraph',
        'langgraph',
        'Framework for building stateful multi-actor LLM applications.',
        'api',
        'langgraph',
        true,
        ARRAY['ai', 'llm', 'open_source', 'agents'],
        jsonb_build_object(
            'vendor', 'LangChain',
            'license', 'MIT',
            'language', 'Python',
            'use_cases', json_build_array('Multi-agent systems', 'Stateful workflows', 'Complex LLM orchestration'),
            'documentation_url', 'https://langchain-ai.github.io/langgraph/',
            'tier', 1,
            'priority', 'critical'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'LlamaIndex',
        'llamaindex',
        'Data framework for LLM applications with focus on retrieval.',
        'api',
        'llamaindex',
        true,
        ARRAY['ai', 'llm', 'open_source', 'rag'],
        jsonb_build_object(
            'vendor', 'LlamaIndex',
            'license', 'MIT',
            'language', 'Python',
            'use_cases', json_build_array('RAG systems', 'Document Q&A', 'Knowledge retrieval', 'Index management'),
            'documentation_url', 'https://docs.llamaindex.ai/',
            'tier', 1,
            'priority', 'high'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Semantic Kernel',
        'semantic-kernel',
        'Microsoft SDK for integrating LLMs into apps with semantic functions.',
        'api',
        'semantic-kernel',
        true,
        ARRAY['ai', 'llm', 'open_source', 'microsoft'],
        jsonb_build_object(
            'vendor', 'Microsoft',
            'license', 'MIT',
            'language', 'C#, Python, Java',
            'use_cases', json_build_array('LLM integration', 'Semantic functions', 'AI orchestration'),
            'documentation_url', 'https://github.com/microsoft/semantic-kernel',
            'tier', 2,
            'priority', 'medium'
        )
    ),

    (
        gen_random_uuid(),
        v_tenant_id,
        'Haystack',
        'haystack',
        'End-to-end framework for building production-ready NLP systems.',
        'api',
        'haystack',
        true,
        ARRAY['ai', 'llm', 'open_source', 'nlp', 'rag'],
        jsonb_build_object(
            'vendor', 'deepset',
            'license', 'Apache-2.0',
            'language', 'Python',
            'use_cases', json_build_array('RAG systems', 'Question answering', 'Semantic search', 'Document retrieval'),
            'documentation_url', 'https://haystack.deepset.ai/',
            'tier', 2,
            'priority', 'medium'
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 5;
RAISE NOTICE '✅ Added 5 AI/LLM Framework tools';

-- =====================================================================================
-- FINAL SUMMARY
-- =====================================================================================

RAISE NOTICE '═══════════════════════════════════════════════════════════════';
RAISE NOTICE '📊 COMPREHENSIVE TOOLS IMPORT COMPLETE';
RAISE NOTICE '═══════════════════════════════════════════════════════════════';
RAISE NOTICE 'Total tools imported: %', v_count;
RAISE NOTICE '';
RAISE NOTICE 'Category Breakdown:';
RAISE NOTICE '  Statistical Software:        4 tools';
RAISE NOTICE '  Clinical Data Management:    3 tools';
RAISE NOTICE '  Research Databases & APIs:  10 tools';
RAISE NOTICE '  FHIR / Interoperability:    10 tools';
RAISE NOTICE '  Clinical NLP:                8 tools';
RAISE NOTICE '  De-identification:           5 tools';
RAISE NOTICE '  Real-World Evidence:         7 tools';
RAISE NOTICE '  Medical Imaging AI:          6 tools';
RAISE NOTICE '  Bioinformatics:              7 tools';
RAISE NOTICE '  Data Quality / ETL:          5 tools';
RAISE NOTICE '  Regulatory & Compliance:     8 tools';
RAISE NOTICE '  Market Access & HEOR:        6 tools';
RAISE NOTICE '  Digital Health Specific:    10 tools';
RAISE NOTICE '  AI/LLM Frameworks:           5 tools';
RAISE NOTICE '';
RAISE NOTICE 'Platform resources available for:';
RAISE NOTICE '  ✓ Pharmaceuticals';
RAISE NOTICE '  ✓ Digital Health';
RAISE NOTICE '  ✓ Biotechnology';
RAISE NOTICE '═══════════════════════════════════════════════════════════════';

END $$;
