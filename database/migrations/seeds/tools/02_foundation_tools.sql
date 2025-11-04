-- =====================================================================================
-- 02_foundation_tools.sql
-- Foundation Tools - Cross-Domain Software Tools & Resources
-- =====================================================================================
-- Purpose: Seed foundational software tools used across use cases
-- Dependencies: Tenant must exist, dh_tool table must be created
-- Execution Order: 2 (foundation - after agents and personas)
-- =====================================================================================
--
-- TOOL CATEGORIES:
-- - Statistical Software (R, SAS, Stata, SPSS)
-- - Clinical Data Management (EDC systems, CTMS)
-- - Research Databases (PubMed, ClinicalTrials.gov, Cochrane)
-- - Decision Analysis (TreeAge, Crystal Ball)
-- - PRO/COA Development Tools (PROQOLID, ePROVIDE)
-- - Regulatory Submission (eCTD software)
-- - Health Economics (various HEOR tools)
-- - Data Visualization & Reporting
-- =====================================================================================

-- =====================================================================================
-- SECTION 0: TENANT LOOKUP & SESSION CONFIGURATION
-- =====================================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_tenant_slug TEXT := 'digital-health-startup';
BEGIN
  SELECT id INTO v_tenant_id 
  FROM tenants 
  WHERE slug = v_tenant_slug;
  
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant with slug "%" not found. Please create tenant first.', v_tenant_slug;
  END IF;
  
  RAISE NOTICE 'Using tenant: % (ID: %)', v_tenant_slug, v_tenant_id;
END $$;

CREATE TEMP TABLE IF NOT EXISTS session_config (
  tenant_id UUID,
  tenant_slug TEXT
);

DELETE FROM session_config;

INSERT INTO session_config (tenant_id, tenant_slug)
SELECT id, slug 
FROM tenants 
WHERE slug = 'digital-health-startup';

-- =====================================================================================
-- SECTION 1: STATISTICAL SOFTWARE TOOLS
-- =====================================================================================

INSERT INTO dh_tool (
  tenant_id,
  code,
  name,
  unique_id,
  category,
  vendor,
  version,
  notes,
  metadata
)
SELECT 
  sc.tenant_id,
  t_data.code,
  t_data.name,
  t_data.unique_id,
  t_data.category,
  t_data.vendor,
  t_data.version,
  t_data.notes,
  t_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- R Statistical Software
    (
      'TOOL-R-STATS',
      'R Statistical Software',
      'TLR-R-STATS',
      'STATISTICAL_SOFTWARE',
      'R Foundation',
      '4.3+',
      'Open-source statistical computing environment. Primary tool for psychometric analysis, sample size calculation, and advanced statistical modeling.',
      jsonb_build_object(
        'use_cases', json_build_array('Psychometric analysis', 'Power analysis', 'Sample size calculation', 'Mixed models', 'Survival analysis'),
        'key_packages', json_build_array('pwr', 'lme4', 'lavaan', 'psych', 'survival', 'tidyverse'),
        'documentation_url', 'https://www.r-project.org/',
        'license', 'GPL-3'
      )
    ),
    
    -- SAS
    (
      'TOOL-SAS',
      'SAS Statistical Software',
      'TLR-SAS',
      'STATISTICAL_SOFTWARE',
      'SAS Institute',
      '9.4+',
      'Industry-standard statistical software for clinical trials. Often required by regulatory agencies and CROs.',
      jsonb_build_object(
        'use_cases', json_build_array('Clinical trial analysis', 'Regulatory submissions', 'CDISC compliance', 'Safety analysis'),
        'key_modules', json_build_array('SAS/STAT', 'SAS/GRAPH', 'SAS Clinical Standards Toolkit'),
        'documentation_url', 'https://www.sas.com/',
        'license', 'Commercial'
      )
    ),
    
    -- Stata
    (
      'TOOL-STATA',
      'Stata Statistical Software',
      'TLR-STATA',
      'STATISTICAL_SOFTWARE',
      'StataCorp',
      '18+',
      'Statistical software popular in epidemiology and health economics research.',
      jsonb_build_object(
        'use_cases', json_build_array('Epidemiological analysis', 'Health economics', 'Panel data analysis', 'Survey data'),
        'documentation_url', 'https://www.stata.com/',
        'license', 'Commercial'
      )
    ),
    
    -- SPSS
    (
      'TOOL-SPSS',
      'IBM SPSS Statistics',
      'TLR-SPSS',
      'STATISTICAL_SOFTWARE',
      'IBM',
      '29+',
      'User-friendly statistical software for behavioral and social science research.',
      jsonb_build_object(
        'use_cases', json_build_array('PRO validation', 'Psychometric testing', 'Survey analysis', 'Descriptive statistics'),
        'documentation_url', 'https://www.ibm.com/products/spss-statistics',
        'license', 'Commercial'
      )
    )
) AS t_data(
  code, name, unique_id, category, vendor, version, notes, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  unique_id = EXCLUDED.unique_id,
  category = EXCLUDED.category,
  vendor = EXCLUDED.vendor,
  version = EXCLUDED.version,
  notes = EXCLUDED.notes,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: CLINICAL DATA MANAGEMENT TOOLS
-- =====================================================================================

INSERT INTO dh_tool (
  tenant_id, code, name, unique_id, category, vendor, version, notes, metadata
)
SELECT 
  sc.tenant_id, t_data.code, t_data.name, t_data.unique_id, t_data.category, 
  t_data.vendor, t_data.version, t_data.notes, t_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Medidata Rave
    (
      'TOOL-RAVE-EDC',
      'Medidata Rave EDC',
      'TLR-RAVE-EDC',
      'EDC_SYSTEM',
      'Medidata Solutions',
      'Cloud',
      'Industry-leading electronic data capture system for clinical trials. CDISC-compliant, 21 CFR Part 11 validated.',
      jsonb_build_object(
        'use_cases', json_build_array('eCRF design', 'Clinical data collection', 'Study management', 'ePRO integration'),
        'compliance', json_build_array('21 CFR Part 11', 'CDISC CDASH', 'CDISC SDTM', 'GCP'),
        'documentation_url', 'https://www.medidata.com/en/clinical-trial-products/rave-edc/',
        'deployment', 'Cloud (SaaS)'
      )
    ),
    
    -- REDCap
    (
      'TOOL-REDCAP',
      'REDCap (Research Electronic Data Capture)',
      'TLR-REDCAP',
      'EDC_SYSTEM',
      'Vanderbilt University',
      '13+',
      'Free, secure web-based application for research data capture. Popular in academic clinical research.',
      jsonb_build_object(
        'use_cases', json_build_array('Data collection', 'Survey management', 'Clinical trial data', 'Registry studies'),
        'deployment', 'Self-hosted or cloud',
        'documentation_url', 'https://www.project-redcap.org/',
        'license', 'Free for non-profit research'
      )
    ),
    
    -- Veeva Vault CTMS
    (
      'TOOL-VEEVA-CTMS',
      'Veeva Vault CTMS',
      'TLR-VEEVA-CTMS',
      'CTMS',
      'Veeva Systems',
      'Cloud',
      'Clinical Trial Management System for study startup, site management, and operational oversight.',
      jsonb_build_object(
        'use_cases', json_build_array('Study startup', 'Site selection', 'Patient enrollment tracking', 'Budget management'),
        'documentation_url', 'https://www.veeva.com/products/vault-ctms/',
        'deployment', 'Cloud (SaaS)'
      )
    )
) AS t_data(
  code, name, unique_id, category, vendor, version, notes, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  category = EXCLUDED.category, vendor = EXCLUDED.vendor,
  version = EXCLUDED.version, notes = EXCLUDED.notes,
  metadata = EXCLUDED.metadata, updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 3: RESEARCH DATABASES
-- =====================================================================================

INSERT INTO dh_tool (
  tenant_id, code, name, unique_id, category, vendor, version, notes, metadata
)
SELECT 
  sc.tenant_id, t_data.code, t_data.name, t_data.unique_id, t_data.category, 
  t_data.vendor, t_data.version, t_data.notes, t_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- PubMed
    (
      'TOOL-PUBMED',
      'PubMed/MEDLINE',
      'TLR-PUBMED',
      'RESEARCH_DATABASE',
      'NIH/NLM',
      'Current',
      'Medical literature database for PRO instrument research, validation studies, and clinical evidence.',
      jsonb_build_object(
        'url', 'https://pubmed.ncbi.nlm.nih.gov',
        'access_type', 'PUBLIC',
        'search_capabilities', json_build_array('MeSH terms', 'Boolean operators', 'Filters', 'Clinical Queries'),
        'use_cases', json_build_array('Literature review', 'Instrument validation research', 'Clinical precedent', 'Systematic reviews')
      )
    ),
    
    -- ClinicalTrials.gov
    (
      'TOOL-CLINTRIALS',
      'ClinicalTrials.gov',
      'TLR-CLINTRIALS',
      'RESEARCH_DATABASE',
      'NIH/NLM',
      'Current',
      'Registry of clinical trials worldwide. Essential for precedent research and endpoint selection.',
      jsonb_build_object(
        'url', 'https://clinicaltrials.gov',
        'access_type', 'PUBLIC',
        'use_cases', json_build_array('Endpoint precedent research', 'Trial design research', 'Competitor analysis', 'Recruitment feasibility'),
        'api_available', true
      )
    ),
    
    -- Cochrane Library
    (
      'TOOL-COCHRANE',
      'Cochrane Library',
      'TLR-COCHRANE',
      'RESEARCH_DATABASE',
      'Cochrane Collaboration',
      'Current',
      'Database of systematic reviews and clinical trial evidence. Gold standard for evidence synthesis.',
      jsonb_build_object(
        'url', 'https://www.cochranelibrary.com',
        'access_type', 'SUBSCRIPTION',
        'use_cases', json_build_array('Systematic reviews', 'Meta-analyses', 'Evidence synthesis', 'Comparative effectiveness'),
        'content_types', json_build_array('Cochrane Reviews', 'Clinical Trials Registry', 'Methods Studies')
      )
    ),
    
    -- PROQOLID
    (
      'TOOL-PROQOLID',
      'PROQOLID (Patient-Reported Outcome and Quality of Life Instruments Database)',
      'TLR-PROQOLID',
      'PRO_REGISTRY',
      'Mapi Research Trust',
      'Current',
      'Comprehensive database of PRO instruments with psychometric properties and translations.',
      jsonb_build_object(
        'url', 'https://eprovide.mapi-trust.org/about/about-proqolid',
        'access_type', 'SUBSCRIPTION',
        'use_cases', json_build_array('PRO instrument selection', 'Psychometric property research', 'Translation availability', 'Licensing contacts'),
        'instrument_count', '1000+'
      )
    )
) AS t_data(
  code, name, unique_id, category, vendor, version, notes, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  category = EXCLUDED.category, vendor = EXCLUDED.vendor,
  version = EXCLUDED.version, notes = EXCLUDED.notes,
  metadata = EXCLUDED.metadata, updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 4: DECISION ANALYSIS & MODELING TOOLS
-- =====================================================================================

INSERT INTO dh_tool (
  tenant_id, code, name, unique_id, category, vendor, version, notes, metadata
)
SELECT 
  sc.tenant_id, t_data.code, t_data.name, t_data.unique_id, t_data.category, 
  t_data.vendor, t_data.version, t_data.notes, t_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- TreeAge Pro
    (
      'TOOL-TREEAGE',
      'TreeAge Pro',
      'TLR-TREEAGE',
      'DECISION_ANALYSIS',
      'TreeAge Software',
      '2024+',
      'Decision analysis software for cost-effectiveness modeling, Markov models, and health economic evaluation.',
      jsonb_build_object(
        'use_cases', json_build_array('Cost-effectiveness analysis', 'Markov models', 'Monte Carlo simulation', 'Budget impact models'),
        'documentation_url', 'https://www.treeage.com/',
        'license', 'Commercial'
      )
    ),
    
    -- Crystal Ball
    (
      'TOOL-CRYSTALBALL',
      'Oracle Crystal Ball',
      'TLR-CRYSTALBALL',
      'SIMULATION',
      'Oracle',
      '11.1+',
      'Monte Carlo simulation and predictive modeling software. Excel add-in for probabilistic modeling.',
      jsonb_build_object(
        'use_cases', json_build_array('Risk analysis', 'Probabilistic forecasting', 'Sensitivity analysis', 'Optimization'),
        'platform', 'Excel Add-in',
        'documentation_url', 'https://www.oracle.com/applications/crystalball/',
        'license', 'Commercial'
      )
    )
) AS t_data(
  code, name, unique_id, category, vendor, version, notes, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  category = EXCLUDED.category, vendor = EXCLUDED.vendor,
  version = EXCLUDED.version, notes = EXCLUDED.notes,
  metadata = EXCLUDED.metadata, updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 5: REGULATORY & SUBMISSION TOOLS
-- =====================================================================================

INSERT INTO dh_tool (
  tenant_id, code, name, unique_id, category, vendor, version, notes, metadata
)
SELECT 
  sc.tenant_id, t_data.code, t_data.name, t_data.unique_id, t_data.category, 
  t_data.vendor, t_data.version, t_data.notes, t_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Lorenz Docubridge
    (
      'TOOL-DOCUBRIDGE',
      'Lorenz Docubridge',
      'TLR-DOCUBRIDGE',
      'REGULATORY_SUBMISSION',
      'Lorenz Life Sciences',
      '8+',
      'eCTD publishing software for FDA, EMA, and global regulatory submissions.',
      jsonb_build_object(
        'use_cases', json_build_array('eCTD compilation', 'Regulatory document management', 'Submission publishing'),
        'compliance', json_build_array('eCTD 3.2.2', 'FDA ESG', 'EMA specifications'),
        'documentation_url', 'https://www.lorenz-lifesciences.com/',
        'license', 'Commercial'
      )
    ),
    
    -- Veeva Vault RIM
    (
      'TOOL-VEEVA-RIM',
      'Veeva Vault RIM',
      'TLR-VEEVA-RIM',
      'REGULATORY_INFORMATION_MANAGEMENT',
      'Veeva Systems',
      'Cloud',
      'Regulatory Information Management system for global submission and registration management.',
      jsonb_build_object(
        'use_cases', json_build_array('Global submission tracking', 'Registration management', 'Document management', 'Regulatory intelligence'),
        'documentation_url', 'https://www.veeva.com/products/vault-rim/',
        'deployment', 'Cloud (SaaS)'
      )
    )
) AS t_data(
  code, name, unique_id, category, vendor, version, notes, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  category = EXCLUDED.category, vendor = EXCLUDED.vendor,
  version = EXCLUDED.version, notes = EXCLUDED.notes,
  metadata = EXCLUDED.metadata, updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 6: LANGGRAPH SDK & AI TOOLS
-- =====================================================================================

INSERT INTO dh_tool (
  tenant_id, code, name, unique_id, category, vendor, version, notes, metadata
)
SELECT 
  sc.tenant_id, t_data.code, t_data.name, t_data.unique_id, t_data.category, 
  t_data.vendor, t_data.version, t_data.notes, t_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- LangGraph SDK
    (
      'TOOL-LANGGRAPH-SDK',
      'LangGraph SDK',
      'TLR-LANGGRAPH-SDK',
      'AI_ORCHESTRATION',
      'LangChain',
      '0.2+',
      'Framework for building stateful, multi-agent AI workflows with cycles and branching logic.',
      jsonb_build_object(
        'use_cases', json_build_array('Multi-agent orchestration', 'Workflow automation', 'State management', 'Agent coordination'),
        'documentation_url', 'https://langchain-ai.github.io/langgraph/',
        'license', 'MIT',
        'language', 'Python'
      )
    ),
    
    -- Task Manager Tool
    (
      'TOOL-TASK-MANAGER',
      'Task Manager',
      'TLR-TASK-MANAGER',
      'WORKFLOW_MANAGEMENT',
      'Internal',
      '1.0',
      'Internal task management and dependency resolution tool for workflow execution.',
      jsonb_build_object(
        'use_cases', json_build_array('Task sequencing', 'Dependency management', 'Status tracking', 'Execution coordination'),
        'integration', 'VITAL platform native'
      )
    )
) AS t_data(
  code, name, unique_id, category, vendor, version, notes, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  category = EXCLUDED.category, vendor = EXCLUDED.vendor,
  version = EXCLUDED.version, notes = EXCLUDED.notes,
  metadata = EXCLUDED.metadata, updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Summary by category
SELECT 
  'Foundation Tools by Category' as status,
  category,
  COUNT(*) as tool_count
FROM dh_tool
WHERE tenant_id = (SELECT tenant_id FROM session_config)
GROUP BY category
ORDER BY tool_count DESC;

-- Overall summary
SELECT 
  'Foundation Tools Seeded' as status,
  jsonb_build_object(
    'total_tools', COUNT(*),
    'statistical_software', COUNT(*) FILTER (WHERE category = 'STATISTICAL_SOFTWARE'),
    'edc_systems', COUNT(*) FILTER (WHERE category = 'EDC_SYSTEM'),
    'research_databases', COUNT(*) FILTER (WHERE category = 'RESEARCH_DATABASE'),
    'decision_analysis', COUNT(*) FILTER (WHERE category = 'DECISION_ANALYSIS'),
    'regulatory', COUNT(*) FILTER (WHERE category LIKE 'REGULATORY%'),
    'ai_tools', COUNT(*) FILTER (WHERE category LIKE 'AI_%' OR category LIKE 'WORKFLOW_%')
  ) as summary
FROM dh_tool
WHERE tenant_id = (SELECT tenant_id FROM session_config);

-- =====================================================================================
-- END OF SCRIPT
-- =====================================================================================

