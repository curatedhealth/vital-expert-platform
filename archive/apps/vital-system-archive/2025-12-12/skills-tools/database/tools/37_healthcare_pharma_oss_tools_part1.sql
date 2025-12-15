-- =====================================================================================
-- 37_HEALTHCARE_PHARMA_OSS_TOOLS.SQL
-- =====================================================================================
-- Description: Add 47 open-source healthcare, pharma, and digital health tools
-- Date: November 3, 2025
-- Categories: Interoperability/FHIR, EHR, Clinical NLP, De-identification, 
--             RWE/OMOP, Medical Imaging AI, Bioinformatics, Data Quality/ETL,
--             Clinical Decision Support, Agent/LLM Frameworks
-- Source: Curated from authoritative GitHub sources and healthcare community
-- =====================================================================================

-- Get tenant_id
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant not found';
    END IF;

    -- =====================================================================================
    -- CATEGORY 1: INTEROPERABILITY / FHIR (10 tools)
    -- =====================================================================================

    INSERT INTO dh_tool (tenant_id, unique_id, code, name, tool_description, category, tool_type, implementation_type, implementation_path, function_name, langgraph_compatible, is_active, lifecycle_stage, cost_per_execution, rate_limit_per_minute, max_execution_time_seconds, documentation_url, required_env_vars, access_level, capabilities, metadata)
    VALUES
    (v_tenant_id, 'TL-FHIR-hapi_fhir', 'TOOL-FHIR-HAPI', 'HAPI FHIR', 'Java FHIR server & client libraries - Reference JPA server implementation', 'Interoperability', 'ai_function', 'custom', 'healthcare.fhir.hapi_fhir', 'connect_hapi_fhir', true, true, 'production', 0.0, 60, 120, 'https://github.com/hapifhir/hapi-fhir', ARRAY[]::text[], 'public', ARRAY['fhir_server', 'fhir_client', 'java_sdk', 'jpa_persistence'], jsonb_build_object('license', 'Apache-2.0', 'language', 'Java', 'type', 'interoperability')),
    
    (v_tenant_id, 'TL-FHIR-linuxforhealth', 'TOOL-FHIR-LFH', 'LinuxForHealth FHIR Server', 'High-performance Java FHIR R4/R4B server (ex-IBM FHIR)', 'Interoperability', 'ai_function', 'custom', 'healthcare.fhir.linuxforhealth', 'connect_lfh_fhir', true, true, 'production', 0.0, 60, 120, 'https://github.com/LinuxForHealth/FHIR', ARRAY[]::text[], 'public', ARRAY['fhir_server', 'high_performance', 'r4', 'r4b'], jsonb_build_object('license', 'Apache-2.0', 'language', 'Java', 'type', 'interoperability')),
    
    (v_tenant_id, 'TL-FHIR-smart_client', 'TOOL-FHIR-SMART', 'SMART on FHIR JS Client', 'JavaScript client library for SMART on FHIR apps', 'Interoperability', 'ai_function', 'custom', 'healthcare.fhir.smart_client', 'connect_smart_fhir', true, true, 'production', 0.0, 60, 60, 'https://github.com/smart-on-fhir/client-js', ARRAY[]::text[], 'public', ARRAY['smart_on_fhir', 'javascript', 'fhir_client', 'auth'], jsonb_build_object('license', 'Apache-2.0', 'language', 'JavaScript', 'type', 'interoperability')),
    
    (v_tenant_id, 'TL-EHR-openmrs', 'TOOL-EHR-OPENMRS', 'OpenMRS', 'Global open-source modular EMR platform', 'EHR Platform', 'ai_function', 'custom', 'healthcare.ehr.openmrs', 'connect_openmrs', true, true, 'production', 0.0, 60, 120, 'https://openmrs.org/', ARRAY[]::text[], 'public', ARRAY['emr', 'modular', 'global_health', 'patient_records'], jsonb_build_object('license', 'MPL-2.0', 'type', 'ehr_platform')),
    
    (v_tenant_id, 'TL-EHR-openemr', 'TOOL-EHR-OPENEMR', 'OpenEMR', 'Open-source EHR & practice management - ONC certified', 'EHR Platform', 'ai_function', 'custom', 'healthcare.ehr.openemr', 'connect_openemr', true, true, 'production', 0.0, 60, 120, 'https://www.open-emr.org/', ARRAY[]::text[], 'public', ARRAY['emr', 'practice_management', 'onc_certified', 'billing'], jsonb_build_object('license', 'GPL', 'certification', 'ONC', 'type', 'ehr_platform')),
    
    (v_tenant_id, 'TL-EHR-ehrbase', 'TOOL-EHR-EHRBASE', 'EHRbase', 'OpenEHR clinical data repository/server', 'EHR Platform', 'ai_function', 'custom', 'healthcare.ehr.ehrbase', 'connect_ehrbase', true, true, 'production', 0.0, 60, 120, 'https://www.ehrbase.org/', ARRAY[]::text[], 'public', ARRAY['openehr', 'clinical_data_repository', 'archetype_based'], jsonb_build_object('license', 'Apache-2.0', 'standard', 'openEHR', 'type', 'ehr_platform')),
    
    (v_tenant_id, 'TL-HMIS-dhis2', 'TOOL-HMIS-DHIS2', 'DHIS2', 'Open-source health management information system for public health', 'Public Health', 'ai_function', 'custom', 'healthcare.hmis.dhis2', 'connect_dhis2', true, true, 'production', 0.0, 60, 120, 'https://dhis2.org/', ARRAY[]::text[], 'public', ARRAY['hmis', 'public_health', 'data_collection', 'reporting'], jsonb_build_object('license', 'BSD-style', 'type', 'public_health', 'deployment', 'global')),
    
    (v_tenant_id, 'TL-INTEROP-openhim', 'TOOL-INTEROP-OPENHIM', 'OpenHIM', 'Interoperability mediator for routing/transforming health data', 'Interoperability', 'ai_function', 'custom', 'healthcare.interop.openhim', 'connect_openhim', true, true, 'production', 0.0, 60, 120, 'https://openhim.org/', ARRAY[]::text[], 'public', ARRAY['mediator', 'routing', 'transformation', 'governance'], jsonb_build_object('license', 'MPL-2.0', 'type', 'interoperability_middleware')),
    
    (v_tenant_id, 'TL-MOBILE-opensrp', 'TOOL-MOBILE-OPENSRP', 'OpenSRP', 'FHIR-native mobile platform for frontline health workers', 'Community Health', 'ai_function', 'custom', 'healthcare.mobile.opensrp', 'connect_opensrp', true, true, 'production', 0.0, 60, 120, 'https://opensrp.io/', ARRAY[]::text[], 'public', ARRAY['mobile', 'fhir_native', 'frontline_workers', 'offline_capable'], jsonb_build_object('license', 'Apache-2.0', 'type', 'mobile_health')),
    
    (v_tenant_id, 'TL-SCM-openlmis', 'TOOL-SCM-OPENLMIS', 'OpenLMIS', 'Logistics management info system for health commodities', 'Supply Chain', 'ai_function', 'custom', 'healthcare.supply.openlmis', 'connect_openlmis', true, true, 'production', 0.0, 60, 120, 'https://openlmis.org/', ARRAY[]::text[], 'public', ARRAY['supply_chain', 'logistics', 'inventory', 'procurement'], jsonb_build_object('license', 'AGPL-3.0', 'type', 'supply_chain'))
    
    ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    RAISE NOTICE '✅ Added 10 Interoperability/FHIR/EHR tools';

    -- =====================================================================================
    -- CATEGORY 2: CLINICAL NLP / TEXT MINING (5 tools)
    -- =====================================================================================

    INSERT INTO dh_tool (tenant_id, unique_id, code, name, tool_description, category, tool_type, implementation_type, implementation_path, function_name, langgraph_compatible, is_active, lifecycle_stage, cost_per_execution, rate_limit_per_minute, max_execution_time_seconds, documentation_url, required_env_vars, access_level, capabilities, metadata)
    VALUES
    (v_tenant_id, 'TL-NLP-ctakes', 'TOOL-NLP-CTAKES', 'Apache cTAKES', 'Clinical text NLP (UIMA): concept extraction, negation detection, context analysis', 'Clinical NLP', 'ai_function', 'custom', 'healthcare.nlp.ctakes', 'extract_clinical_concepts', true, true, 'production', 0.0020, 30, 180, 'https://github.com/apache/ctakes', ARRAY[]::text[], 'public', ARRAY['concept_extraction', 'negation_detection', 'context_analysis', 'umls'], jsonb_build_object('license', 'Apache-2.0', 'language', 'Java', 'framework', 'UIMA')),
    
    (v_tenant_id, 'TL-NLP-medspacy', 'TOOL-NLP-MEDSPACY', 'medSpaCy', 'spaCy-based clinical NLP components for sections, negation, context', 'Clinical NLP', 'ai_function', 'langchain_tool', 'langchain_community.tools.python', 'extract_clinical_entities', true, true, 'production', 0.0015, 60, 120, 'https://github.com/medspacy/medspacy', ARRAY[]::text[], 'public', ARRAY['spacy', 'clinical_ner', 'sections', 'negation', 'context'], jsonb_build_object('license', 'MIT', 'language', 'Python', 'framework', 'spaCy')),
    
    (v_tenant_id, 'TL-NLP-scispacy', 'TOOL-NLP-SCISPACY', 'scispaCy', 'Biomedical spaCy models/pipelines for scientific text', 'Clinical NLP', 'ai_function', 'langchain_tool', 'langchain_community.tools.python', 'extract_biomedical_entities', true, true, 'production', 0.0015, 60, 120, 'https://github.com/allenai/scispacy', ARRAY[]::text[], 'public', ARRAY['biomedical_ner', 'spacy_models', 'scientific_text'], jsonb_build_object('license', 'Apache-2.0', 'language', 'Python', 'provider', 'AllenAI')),
    
    (v_tenant_id, 'TL-NLP-medcat', 'TOOL-NLP-MEDCAT', 'MedCAT', 'Medical Concept Annotation & linking to SNOMED/UMLS with active learning', 'Clinical NLP', 'ai_function', 'custom', 'healthcare.nlp.medcat', 'annotate_medical_concepts', true, true, 'production', 0.0025, 30, 180, 'https://github.com/CogStack/MedCAT', ARRAY['UMLS_API_KEY'], 'public', ARRAY['concept_annotation', 'snomed', 'umls', 'active_learning', 'entity_linking'], jsonb_build_object('license', 'Apache-2.0', 'language', 'Python', 'terminologies', ARRAY['SNOMED CT', 'UMLS'])),
    
    (v_tenant_id, 'TL-NLP-quickumls', 'TOOL-NLP-QUICKUMLS', 'QuickUMLS', 'Fast approximate UMLS concept matcher via SimString', 'Clinical NLP', 'ai_function', 'custom', 'healthcare.nlp.quickumls', 'match_umls_concepts', true, true, 'production', 0.0010, 60, 60, 'https://github.com/Georgetown-IR-Lab/QuickUMLS', ARRAY['UMLS_LICENSE'], 'public', ARRAY['umls_matching', 'fast_lookup', 'concept_normalization'], jsonb_build_object('license', 'MIT', 'language', 'Python', 'provider', 'Georgetown'))
    
    ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    RAISE NOTICE '✅ Added 5 Clinical NLP tools';

    -- =====================================================================================
    -- CATEGORY 3: DE-IDENTIFICATION / PRIVACY (6 tools)
    -- =====================================================================================

    INSERT INTO dh_tool (tenant_id, unique_id, code, name, tool_description, category, tool_type, implementation_type, implementation_path, function_name, langgraph_compatible, is_active, lifecycle_stage, cost_per_execution, rate_limit_per_minute, max_execution_time_seconds, documentation_url, required_env_vars, access_level, capabilities, metadata)
    VALUES
    (v_tenant_id, 'TL-DEID-presidio', 'TOOL-DEID-PRESIDIO', 'Microsoft Presidio', 'PII/PHI detection & anonymization for text and images', 'De-identification', 'ai_function', 'langchain_tool', 'langchain_community.tools.python', 'detect_and_anonymize_phi', true, true, 'production', 0.0020, 60, 120, 'https://github.com/microsoft/presidio', ARRAY[]::text[], 'public', ARRAY['pii_detection', 'phi_detection', 'anonymization', 'redaction', 'image_redaction'], jsonb_build_object('license', 'MIT', 'language', 'Python', 'provider', 'Microsoft')),
    
    (v_tenant_id, 'TL-DEID-philter', 'TOOL-DEID-PHILTER', 'Philter (UCSF)', 'Clinical text PHI de-identification - Certified pipeline', 'De-identification', 'ai_function', 'custom', 'healthcare.deid.philter', 'deidentify_clinical_text', true, true, 'production', 0.0015, 60, 120, 'https://github.com/BCHSI/philter-ucsf', ARRAY[]::text[], 'public', ARRAY['phi_removal', 'clinical_text', 'certified', 'hipaa_compliant'], jsonb_build_object('license', 'Apache-2.0', 'certification', 'JAMIA Open 2023', 'provider', 'UCSF')),
    
    (v_tenant_id, 'TL-DEID-dicomcleaner', 'TOOL-DEID-DICOMCLEANER', 'PixelMed DicomCleaner', 'GUI tool for DICOM header/pixel anonymization and redaction', 'De-identification', 'ai_function', 'custom', 'healthcare.deid.dicomcleaner', 'anonymize_dicom', true, true, 'production', 0.0, 30, 300, 'https://www.pixelmed.com/cleaner.html', ARRAY[]::text[], 'public', ARRAY['dicom_anonymization', 'header_redaction', 'pixel_redaction', 'gui'], jsonb_build_object('license', 'Open Source', 'file_type', 'DICOM')),
    
    (v_tenant_id, 'TL-DEID-pydicom', 'TOOL-DEID-PYDICOM', 'pydicom', 'Python library to read/write DICOM with anonymization workflows', 'De-identification', 'ai_function', 'langchain_tool', 'langchain_community.tools.python', 'process_dicom_files', true, true, 'production', 0.0005, 60, 120, 'https://github.com/pydicom/pydicom', ARRAY[]::text[], 'public', ARRAY['dicom_io', 'anonymization', 'metadata_editing'], jsonb_build_object('license', 'MIT', 'language', 'Python', 'file_type', 'DICOM')),
    
    (v_tenant_id, 'TL-DEID-pynetdicom', 'TOOL-DEID-PYNETDICOM', 'pynetdicom', 'Python DICOM networking (SCU/SCP) for anonymization workflows', 'De-identification', 'ai_function', 'custom', 'healthcare.deid.pynetdicom', 'dicom_network_transfer', true, true, 'production', 0.0005, 60, 180, 'https://github.com/pydicom/pynetdicom', ARRAY[]::text[], 'public', ARRAY['dicom_networking', 'scu', 'scp', 'pacs_integration'], jsonb_build_object('license', 'MIT', 'language', 'Python', 'protocol', 'DICOM')),
    
    (v_tenant_id, 'TL-SYNTH-synthea', 'TOOL-SYNTH-SYNTHEA', 'Synthea', 'Synthetic patient generator (EHR/FHIR/CCD) for safe testing', 'Synthetic Data', 'ai_function', 'custom', 'healthcare.synth.synthea', 'generate_synthetic_patients', true, true, 'production', 0.0, 30, 300, 'https://github.com/synthetichealth/synthea', ARRAY[]::text[], 'public', ARRAY['synthetic_patients', 'fhir_generation', 'ehr_generation', 'testing'], jsonb_build_object('license', 'Apache-2.0', 'language', 'Java', 'output_formats', ARRAY['FHIR', 'C-CDA', 'CSV']))
    
    ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    RAISE NOTICE '✅ Added 6 De-identification/Privacy tools';

    -- =====================================================================================
    -- CATEGORY 4: OBSERVATIONAL DATA / RWE (4 tools)
    -- =====================================================================================

    INSERT INTO dh_tool (tenant_id, unique_id, code, name, tool_description, category, tool_type, implementation_type, implementation_path, function_name, langgraph_compatible, is_active, lifecycle_stage, cost_per_execution, rate_limit_per_minute, max_execution_time_seconds, documentation_url, required_env_vars, access_level, capabilities, metadata)
    VALUES
    (v_tenant_id, 'TL-OMOP-cdm', 'TOOL-OMOP-CDM', 'OHDSI OMOP CDM', 'Common Data Model for observational health data (RWE)', 'RWE/OMOP', 'ai_function', 'custom', 'healthcare.omop.cdm', 'query_omop_database', true, true, 'production', 0.0, 30, 300, 'https://github.com/OHDSI/CommonDataModel', ARRAY[]::text[], 'public', ARRAY['common_data_model', 'observational_data', 'standardization'], jsonb_build_object('license', 'Apache-2.0', 'organization', 'OHDSI', 'type', 'data_standard')),
    
    (v_tenant_id, 'TL-OMOP-atlas', 'TOOL-OMOP-ATLAS', 'OHDSI ATLAS', 'Web app for cohort definition & analytics on OMOP CDM', 'RWE/OMOP', 'ai_function', 'custom', 'healthcare.omop.atlas', 'define_cohorts', true, true, 'production', 0.0, 30, 300, 'https://github.com/OHDSI/Atlas', ARRAY['OMOP_DB_URL'], 'public', ARRAY['cohort_definition', 'analytics', 'visualization', 'characterization'], jsonb_build_object('license', 'Apache-2.0', 'organization', 'OHDSI', 'type', 'analytics_ui')),
    
    (v_tenant_id, 'TL-OMOP-achilles', 'TOOL-OMOP-ACHILLES', 'OHDSI Achilles', 'Descriptive characterization of OMOP CDM databases (250+ analyses)', 'RWE/OMOP', 'ai_function', 'custom', 'healthcare.omop.achilles', 'characterize_database', true, true, 'production', 0.0, 20, 600, 'https://github.com/OHDSI/Achilles', ARRAY['OMOP_DB_URL'], 'public', ARRAY['data_characterization', 'quality_checks', 'descriptive_analytics'], jsonb_build_object('license', 'Apache-2.0', 'organization', 'OHDSI', 'language', 'R', 'analyses_count', 250)),
    
    (v_tenant_id, 'TL-OMOP-hades', 'TOOL-OMOP-HADES', 'OHDSI HADES', 'Suite of R packages for causal inference & prediction on observational data', 'RWE/OMOP', 'ai_function', 'custom', 'healthcare.omop.hades', 'run_causal_analysis', true, true, 'production', 0.0, 20, 600, 'https://ohdsi.github.io/Hades/', ARRAY['OMOP_DB_URL'], 'public', ARRAY['causal_inference', 'prediction', 'population_level_estimation', 'patient_level_prediction'], jsonb_build_object('license', 'Apache-2.0', 'organization', 'OHDSI', 'language', 'R', 'validation', 'peer-reviewed'))
    
    ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    RAISE NOTICE '✅ Added 4 OMOP/RWE tools';

    -- Continue with remaining categories...
    -- (Due to length, I'll create the remaining categories in the next part)

    RAISE NOTICE '✅ Phase 1 Complete: 25 tools added';
    RAISE NOTICE '📊 Remaining: 22 tools (Medical Imaging, Bioinformatics, Data Quality, CDS, Agent Frameworks)';
END $$;

-- Verification query
SELECT 
    '✅ HEALTHCARE/PHARMA TOOLS ADDED' as status,
    COUNT(*) as tool_count
FROM dh_tool
WHERE unique_id LIKE 'TL-FHIR-%' 
   OR unique_id LIKE 'TL-EHR-%'
   OR unique_id LIKE 'TL-NLP-%'
   OR unique_id LIKE 'TL-DEID-%'
   OR unique_id LIKE 'TL-OMOP-%';

