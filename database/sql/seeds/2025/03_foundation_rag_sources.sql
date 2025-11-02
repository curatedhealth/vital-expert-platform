-- =====================================================================================
-- 03_foundation_rag_sources.sql
-- Foundation RAG Sources - Regulatory Guidance & Reference Documents
-- =====================================================================================
-- Purpose: Seed foundational RAG sources for AI agent knowledge retrieval
-- Dependencies: Tenant must exist, dh_rag_source table must be created
-- Execution Order: 3 (foundation - after agents, personas, tools)
-- =====================================================================================
--
-- SOURCE CATEGORIES:
-- - FDA Guidance Documents
-- - EMA Guidelines
-- - ICH Guidelines
-- - Industry Standards (CDISC, HL7 FHIR)
-- - Clinical Research Standards
-- - Regulatory Databases
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
-- SECTION 1: FDA GUIDANCE DOCUMENTS
-- =====================================================================================

INSERT INTO dh_rag_source (
  tenant_id,
  code,
  name,
  unique_id,
  source_type,
  uri,
  description,
  metadata
)
SELECT 
  sc.tenant_id,
  r_data.code,
  r_data.name,
  r_data.unique_id,
  r_data.source_type,
  r_data.uri,
  r_data.description,
  r_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- FDA PRO Guidance 2009
    (
      'RAG-FDA-PRO-2009',
      'FDA PRO Guidance (2009)',
      'RAG-FDA-PRO-2009',
      'guidance',
      'https://www.fda.gov/media/77832/download',
      'FDA Guidance for Industry: Patient-Reported Outcome Measures: Use in Medical Product Development to Support Labeling Claims',
      jsonb_build_object(
        'year', 2009,
        'type', 'Final Guidance',
        'domain', 'Clinical Development',
        'topics', json_build_array('PRO instruments', 'COA qualification', 'Labeling claims', 'Psychometric validation'),
        'relevance', json_build_array('UC_CD_005', 'UC_CD_001', 'UC_CD_002'),
        'key_sections', json_build_array(
          'PRO instrument development',
          'Content validity',
          'Other measurement properties',
          'Modification of existing instruments',
          'Documentation requirements'
        )
      )
    ),
    
    -- FDA Digital Health Guidance 2022
    (
      'RAG-FDA-DIGITAL-HEALTH-2022',
      'FDA Digital Health Software Precertification Program',
      'RAG-FDA-DIGITAL-HEALTH-2022',
      'guidance',
      'https://www.fda.gov/medical-devices/digital-health-center-excellence',
      'FDA guidance on digital health technologies including Software as Medical Device (SaMD) and clinical decision support.',
      jsonb_build_object(
        'year', 2022,
        'type', 'Program Guidance',
        'domain', 'Digital Health',
        'topics', json_build_array('SaMD', 'Clinical decision support', 'Digital therapeutics', 'Real-world evidence'),
        'relevance', json_build_array('UC_PD_009', 'UC_DTX_029', 'UC_PD_003')
      )
    ),
    
    -- FDA RWE Framework
    (
      'RAG-FDA-RWE-2018',
      'FDA Real-World Evidence Framework',
      'RAG-FDA-RWE-2018',
      'guidance',
      'https://www.fda.gov/science-research/science-and-research-special-topics/real-world-evidence',
      'FDA framework for using real-world data to generate real-world evidence for regulatory decision-making.',
      jsonb_build_object(
        'year', 2018,
        'type', 'Framework',
        'domain', 'Real-World Evidence',
        'topics', json_build_array('RWD sources', 'Study design', 'Data standards', 'Evidence generation'),
        'relevance', json_build_array('UC_RWE_015', 'UC_MA_021')
      )
    ),
    
    -- FDA Adaptive Design Guidance
    (
      'RAG-FDA-ADAPTIVE-2019',
      'FDA Adaptive Designs for Clinical Trials',
      'RAG-FDA-ADAPTIVE-2019',
      'guidance',
      'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/adaptive-design-clinical-trials-drugs-and-biologics-guidance-industry',
      'FDA guidance on adaptive clinical trial designs including sample size re-estimation and seamless phase transitions.',
      jsonb_build_object(
        'year', 2019,
        'type', 'Final Guidance',
        'domain', 'Clinical Trial Design',
        'topics', json_build_array('Adaptive randomization', 'Sample size re-estimation', 'Futility stopping', 'Seamless designs'),
        'relevance', json_build_array('UC_CD_001', 'UC_CD_002', 'UC_CD_003')
      )
    ),
    
    -- FDA Multiple Endpoints Guidance
    (
      'RAG-FDA-MULTIPLE-ENDPOINTS-2022',
      'FDA Multiple Endpoints in Clinical Trials',
      'RAG-FDA-MULTIPLE-ENDPOINTS-2022',
      'guidance',
      'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/multiple-endpoints-clinical-trials-guidance-industry',
      'FDA guidance on handling multiple endpoints, multiplicity adjustment, and Type I error control.',
      jsonb_build_object(
        'year', 2022,
        'type', 'Final Guidance',
        'domain', 'Biostatistics',
        'topics', json_build_array('Multiple testing', 'Type I error control', 'Hierarchical testing', 'Gatekeeper procedures'),
        'relevance', json_build_array('UC_CD_001', 'UC_CD_003')
      )
    ),
    
    -- FDA Decentralized Clinical Trials
    (
      'RAG-FDA-DCT-2023',
      'FDA Decentralized Clinical Trials Guidance',
      'RAG-FDA-DCT-2023',
      'guidance',
      'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/decentralized-clinical-trials-drugs-biological-products-and-devices',
      'FDA guidance on conducting decentralized clinical trials with remote data collection and telehealth.',
      jsonb_build_object(
        'year', 2023,
        'type', 'Final Guidance',
        'domain', 'Clinical Operations',
        'topics', json_build_array('Remote monitoring', 'Digital endpoints', 'Informed consent', 'Data integrity'),
        'relevance', json_build_array('UC_DTX_029', 'UC_CD_004')
      )
    )
) AS r_data(
  code, name, unique_id, source_type, uri, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  unique_id = EXCLUDED.unique_id,
  source_type = EXCLUDED.source_type,
  uri = EXCLUDED.uri,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: EMA & ICH GUIDELINES
-- =====================================================================================

INSERT INTO dh_rag_source (
  tenant_id, code, name, unique_id, source_type, uri, description, metadata
)
SELECT 
  sc.tenant_id, r_data.code, r_data.name, r_data.unique_id, r_data.source_type, 
  r_data.uri, r_data.description, r_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- ICH E6 GCP
    (
      'RAG-ICH-E6-GCP',
      'ICH E6(R2) Good Clinical Practice',
      'RAG-ICH-E6-GCP',
      'guidance',
      'https://database.ich.org/sites/default/files/E6_R2_Addendum.pdf',
      'International standard for designing, conducting, recording, and reporting clinical trials involving human subjects.',
      jsonb_build_object(
        'year', 2016,
        'type', 'International Standard',
        'domain', 'Clinical Operations',
        'topics', json_build_array('GCP principles', 'Informed consent', 'IRB/IEC', 'Essential documents', 'Data management'),
        'relevance', json_build_array('All clinical use cases')
      )
    ),
    
    -- ICH E9 Statistical Principles
    (
      'RAG-ICH-E9',
      'ICH E9 Statistical Principles for Clinical Trials',
      'RAG-ICH-E9',
      'guidance',
      'https://database.ich.org/sites/default/files/E9_Guideline.pdf',
      'Statistical principles for design, conduct, analysis, and evaluation of clinical trials.',
      jsonb_build_object(
        'year', 1998,
        'type', 'International Guideline',
        'domain', 'Biostatistics',
        'topics', json_build_array('Study design', 'Sample size', 'Randomization', 'Analysis sets', 'Missing data'),
        'relevance', json_build_array('UC_CD_001', 'UC_CD_002', 'UC_CD_003')
      )
    ),
    
    -- ICH E9 R1 Estimands
    (
      'RAG-ICH-E9-R1-ESTIMANDS',
      'ICH E9(R1) Estimands and Sensitivity Analysis',
      'RAG-ICH-E9-R1-ESTIMANDS',
      'guidance',
      'https://database.ich.org/sites/default/files/E9-R1_Step4_Guideline_2019_1203.pdf',
      'Addendum on estimands and sensitivity analysis in clinical trials to align trial design, conduct, and analysis.',
      jsonb_build_object(
        'year', 2019,
        'type', 'International Guideline (Addendum)',
        'domain', 'Biostatistics',
        'topics', json_build_array('Estimands framework', 'Intercurrent events', 'Sensitivity analysis', 'Missing data strategies'),
        'relevance', json_build_array('UC_CD_001', 'UC_CD_002', 'UC_CD_003'),
        'key_concepts', json_build_array('Treatment policy', 'Composite', 'Hypothetical', 'While on treatment', 'Principal stratum')
      )
    ),
    
    -- EMA Guideline on Missing Data
    (
      'RAG-EMA-MISSING-DATA',
      'EMA Guideline on Missing Data in Confirmatory Clinical Trials',
      'RAG-EMA-MISSING-DATA',
      'guidance',
      'https://www.ema.europa.eu/en/documents/scientific-guideline/guideline-missing-data-confirmatory-clinical-trials_en.pdf',
      'EMA guidance on handling missing data in clinical trials with prevention and analysis strategies.',
      jsonb_build_object(
        'year', 2010,
        'type', 'EMA Guideline',
        'domain', 'Biostatistics',
        'topics', json_build_array('MCAR', 'MAR', 'MNAR', 'Multiple imputation', 'Sensitivity analysis'),
        'relevance', json_build_array('UC_CD_002', 'UC_CD_003')
      )
    )
) AS r_data(
  code, name, unique_id, source_type, uri, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  source_type = EXCLUDED.source_type, uri = EXCLUDED.uri,
  description = EXCLUDED.description, metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 3: DATA STANDARDS (CDISC, HL7 FHIR)
-- =====================================================================================

INSERT INTO dh_rag_source (
  tenant_id, code, name, unique_id, source_type, uri, description, metadata
)
SELECT 
  sc.tenant_id, r_data.code, r_data.name, r_data.unique_id, r_data.source_type, 
  r_data.uri, r_data.description, r_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- CDISC SDTM
    (
      'RAG-CDISC-SDTM',
      'CDISC Study Data Tabulation Model (SDTM)',
      'RAG-CDISC-SDTM',
      'document',
      'https://www.cdisc.org/standards/foundational/sdtm',
      'Standard for organizing and formatting clinical trial data for regulatory submissions.',
      jsonb_build_object(
        'version', '1.7',
        'type', 'Data Standard',
        'domain', 'Data Management',
        'topics', json_build_array('Data structure', 'Domain models', 'Controlled terminology', 'SUPPQUAL'),
        'relevance', json_build_array('UC_CD_002', 'UC_PD_003')
      )
    ),
    
    -- CDISC ADaM
    (
      'RAG-CDISC-ADAM',
      'CDISC Analysis Data Model (ADaM)',
      'RAG-CDISC-ADAM',
      'document',
      'https://www.cdisc.org/standards/foundational/adam',
      'Standard for analysis datasets derived from SDTM for statistical analysis.',
      jsonb_build_object(
        'version', '2.1',
        'type', 'Data Standard',
        'domain', 'Biostatistics',
        'topics', json_build_array('ADSL', 'BDS', 'OCCDS', 'Subject-level', 'Analysis datasets'),
        'relevance', json_build_array('UC_CD_002', 'UC_CD_003')
      )
    ),
    
    -- HL7 FHIR
    (
      'RAG-HL7-FHIR-R4',
      'HL7 FHIR R4 Standard',
      'RAG-HL7-FHIR-R4',
      'document',
      'https://www.hl7.org/fhir/',
      'Fast Healthcare Interoperability Resources standard for exchanging healthcare data electronically.',
      jsonb_build_object(
        'version', 'R4',
        'type', 'Interoperability Standard',
        'domain', 'Health IT Integration',
        'topics', json_build_array('REST API', 'Resources', 'Patient', 'Observation', 'Condition', 'MedicationRequest'),
        'relevance', json_build_array('UC_PD_003', 'UC_DTX_029'),
        'key_resources', json_build_array('Patient', 'Observation', 'Condition', 'MedicationStatement', 'DiagnosticReport')
      )
    )
) AS r_data(
  code, name, unique_id, source_type, uri, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  source_type = EXCLUDED.source_type, uri = EXCLUDED.uri,
  description = EXCLUDED.description, metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 4: CLINICAL RESEARCH & VALIDATION REFERENCES
-- =====================================================================================

INSERT INTO dh_rag_source (
  tenant_id, code, name, unique_id, source_type, uri, description, metadata
)
SELECT 
  sc.tenant_id, r_data.code, r_data.name, r_data.unique_id, r_data.source_type, 
  r_data.uri, r_data.description, r_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- ISPOR Good Practices
    (
      'RAG-ISPOR-PRO-2011',
      'ISPOR PRO Good Research Practices',
      'RAG-ISPOR-PRO-2011',
      'document',
      'https://www.ispor.org/heor-resources/good-practices-guidelines',
      'ISPOR task force guidelines for PRO development, validation, and use in clinical research.',
      jsonb_build_object(
        'year', 2011,
        'type', 'Best Practices',
        'domain', 'PRO Development',
        'topics', json_build_array('PRO development', 'Validation', 'Translation', 'Data quality', 'Interpretation'),
        'relevance', json_build_array('UC_CD_005', 'UC_CD_001')
      )
    ),
    
    -- COSMIN Guidelines
    (
      'RAG-COSMIN',
      'COSMIN (Consensus-based Standards for Measurement Properties)',
      'RAG-COSMIN',
      'document',
      'https://www.cosmin.nl/',
      'International consensus on taxonomy and terminology of measurement properties for health status questionnaires.',
      jsonb_build_object(
        'type', 'Measurement Standards',
        'domain', 'Psychometrics',
        'topics', json_build_array('Reliability', 'Validity', 'Responsiveness', 'Interpretability', 'MCID'),
        'relevance', json_build_array('UC_CD_005', 'UC_CD_001'),
        'key_properties', json_build_array('Internal consistency', 'Test-retest reliability', 'Content validity', 'Construct validity', 'Responsiveness')
      )
    ),
    
    -- PROMIS
    (
      'RAG-PROMIS',
      'PROMIS (Patient-Reported Outcomes Measurement Information System)',
      'RAG-PROMIS',
      'database',
      'https://www.healthmeasures.net/explore-measurement-systems/promis',
      'NIH-funded standardized PRO instruments across multiple health domains using item response theory.',
      jsonb_build_object(
        'type', 'PRO Library',
        'domain', 'PRO Instruments',
        'topics', json_build_array('IRT-based measures', 'CAT', 'Short forms', 'Domain frameworks'),
        'relevance', json_build_array('UC_CD_005', 'UC_CD_001'),
        'domains', json_build_array('Physical function', 'Pain', 'Fatigue', 'Emotional distress', 'Social function')
      )
    )
) AS r_data(
  code, name, unique_id, source_type, uri, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  source_type = EXCLUDED.source_type, uri = EXCLUDED.uri,
  description = EXCLUDED.description, metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 5: REGULATORY DATABASES
-- =====================================================================================

INSERT INTO dh_rag_source (
  tenant_id, code, name, unique_id, source_type, uri, description, metadata
)
SELECT 
  sc.tenant_id, r_data.code, r_data.name, r_data.unique_id, r_data.source_type, 
  r_data.uri, r_data.description, r_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- FDA Drugs@FDA Database
    (
      'RAG-FDA-DRUGS-DB',
      'FDA Drugs@FDA Database',
      'RAG-FDA-DRUGS-DB',
      'database',
      'https://www.accessdata.fda.gov/scripts/cder/daf/',
      'FDA database of approved drugs with approval history, labels, and review documents.',
      jsonb_build_object(
        'type', 'Regulatory Database',
        'domain', 'Drug Approvals',
        'topics', json_build_array('Drug approvals', 'FDA labels', 'Review documents', 'Approval letters'),
        'relevance', json_build_array('UC_RA_007', 'UC_RA_008'),
        'search_capabilities', json_build_array('Drug name', 'Active ingredient', 'Application number', 'Company')
      )
    ),
    
    -- FDA 510(k) Database
    (
      'RAG-FDA-510K-DB',
      'FDA 510(k) Premarket Notification Database',
      'RAG-FDA-510K-DB',
      'database',
      'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm',
      'FDA database of 510(k) clearances for medical devices including digital health devices.',
      jsonb_build_object(
        'type', 'Regulatory Database',
        'domain', 'Device Clearances',
        'topics', json_build_array('510(k) clearances', 'Predicate devices', 'Device classifications', 'DTx precedents'),
        'relevance', json_build_array('UC_RA_007', 'UC_DTX_029'),
        'search_capabilities', json_build_array('K number', 'Device name', 'Applicant', 'Product code', 'Decision date')
      )
    ),
    
    -- EMA EudraCT
    (
      'RAG-EMA-EUDRACT',
      'EMA EudraCT Database',
      'RAG-EMA-EUDRACT',
      'database',
      'https://eudract.ema.europa.eu/',
      'European clinical trials database for transparency and registration of clinical trials.',
      jsonb_build_object(
        'type', 'Clinical Trials Registry',
        'domain', 'EU Regulatory',
        'topics', json_build_array('EU clinical trials', 'Trial registration', 'Results disclosure', 'Transparency'),
        'relevance', json_build_array('UC_CD_001', 'UC_CD_002', 'UC_RA_007')
      )
    )
) AS r_data(
  code, name, unique_id, source_type, uri, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  source_type = EXCLUDED.source_type, uri = EXCLUDED.uri,
  description = EXCLUDED.description, metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Summary by source type
SELECT 
  'Foundation RAG Sources by Type' as status,
  source_type,
  COUNT(*) as source_count
FROM dh_rag_source
WHERE tenant_id = (SELECT tenant_id FROM session_config)
GROUP BY source_type
ORDER BY source_count DESC;

-- Overall summary
SELECT 
  'Foundation RAG Sources Seeded' as status,
  jsonb_build_object(
    'total_sources', COUNT(*),
    'fda_guidance', COUNT(*) FILTER (WHERE code LIKE 'RAG-FDA-%' AND source_type = 'guidance'),
    'ich_ema_guidance', COUNT(*) FILTER (WHERE code LIKE 'RAG-ICH-%' OR code LIKE 'RAG-EMA-%'),
    'data_standards', COUNT(*) FILTER (WHERE code LIKE 'RAG-CDISC-%' OR code LIKE 'RAG-HL7-%'),
    'databases', COUNT(*) FILTER (WHERE source_type = 'database'),
    'clinical_standards', COUNT(*) FILTER (WHERE code IN ('RAG-ISPOR-PRO-2011', 'RAG-COSMIN', 'RAG-PROMIS'))
  ) as summary
FROM dh_rag_source
WHERE tenant_id = (SELECT tenant_id FROM session_config);

-- =====================================================================================
-- END OF SCRIPT
-- =====================================================================================

