-- ============================================================================
-- TOOL REGISTRY EXPANSION - 30 NEW TOOLS
-- ============================================================================
-- Date: November 3, 2025
-- Purpose: Add 30 strategic tools across 7 categories to unified dh_tool table
-- Total Tools After: 56 (26 existing + 30 new)
-- ============================================================================

-- Get tenant_id for digital-health-startup
DO $$
DECLARE
    v_tenant_id uuid;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant not found: digital-health-startup';
    END IF;

-- ============================================================================
-- CATEGORY 1: MEDICAL & HEALTHCARE APIs (7 tools)
-- ============================================================================

-- 1. OpenFDA Drug Adverse Events
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-MED-openfda_ae', 'TOOL-MED-OPENFDA_AE',
    'OpenFDA Drug Adverse Events Search',
    'Search FDA Adverse Event Reporting System (FAERS) for drug safety signals and adverse event reports',
    'Medical', 'ai_function', 'function',
    'medical-tools.createOpenFDAAESearchTool', 'search_openfda_adverse_events',
    '{"type":"object","properties":{"drug_name":{"type":"string","description":"Drug name or active ingredient"},"event_term":{"type":"string","description":"Adverse event MedDRA term"},"limit":{"type":"integer","default":10}},"required":["drug_name"]}'::jsonb,
    '{"type":"object","properties":{"results":{"type":"array"},"total_count":{"type":"integer"}}}'::jsonb,
    true, 0.0000, 30, 60, true,
    'https://open.fda.gov/apis/drug/event/',
    '{"api_endpoint":"https://api.fda.gov/drug/event.json","version":"1.0"}'::jsonb
);

-- 2. CMS Medicare Data
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-MED-cms_medicare', 'TOOL-MED-CMS_MEDICARE',
    'CMS Medicare Data Search',
    'Access Medicare claims data, quality measures, and reimbursement information',
    'Medical', 'ai_function', 'function',
    'medical-tools.createCMSMedicareSearchTool', 'search_cms_medicare',
    '{"type":"object","properties":{"query_type":{"type":"string","enum":["claims","quality","reimbursement"]},"search_term":{"type":"string"},"year":{"type":"integer"}},"required":["query_type","search_term"]}'::jsonb,
    '{"type":"object","properties":{"results":{"type":"array"},"count":{"type":"integer"}}}'::jsonb,
    true, 0.0000, 45, 30, true,
    'https://data.cms.gov/provider-data/',
    '{"api_endpoint":"https://data.cms.gov/api","version":"1.0"}'::jsonb
);

-- 3. HL7 FHIR API Client
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-MED-fhir_client', 'TOOL-MED-FHIR_CLIENT',
    'HL7 FHIR API Client',
    'Interact with FHIR-compliant EHR systems to retrieve patient data, observations, and clinical resources',
    'Medical', 'api', 'api',
    'medical-tools.createFHIRClientTool', 'query_fhir_resource',
    '{"type":"object","properties":{"resource_type":{"type":"string","enum":["Patient","Observation","Condition","Medication"]},"search_params":{"type":"object"},"fhir_server_url":{"type":"string"}},"required":["resource_type"]}'::jsonb,
    '{"type":"object","properties":{"resources":{"type":"array"},"total":{"type":"integer"}}}'::jsonb,
    true, 0.0010, 60, 120, true,
    'https://www.hl7.org/fhir/',
    '{"version":"R4","supports_streaming":false}'::jsonb
);

-- 4. PubChem
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-MED-pubchem', 'TOOL-MED-PUBCHEM',
    'PubChem Chemical Database Search',
    'Search PubChem for chemical structures, properties, and bioactivity data',
    'Medical', 'ai_function', 'function',
    'medical-tools.createPubChemSearchTool', 'search_pubchem',
    '{"type":"object","properties":{"compound_name":{"type":"string"},"search_type":{"type":"string","enum":["name","formula","inchikey"],"default":"name"}},"required":["compound_name"]}'::jsonb,
    '{"type":"object","properties":{"compounds":{"type":"array"},"count":{"type":"integer"}}}'::jsonb,
    true, 0.0000, 30, 60, true,
    'https://pubchem.ncbi.nlm.nih.gov/',
    '{"api_endpoint":"https://pubchem.ncbi.nlm.nih.gov/rest/pug","version":"1.0"}'::jsonb
);

-- 5. UMLS Metathesaurus
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, required_env_vars, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-MED-umls', 'TOOL-MED-UMLS',
    'UMLS Metathesaurus Search',
    'Search Unified Medical Language System for medical terminology mapping and concept relationships',
    'Medical', 'ai_function', 'function',
    'medical-tools.createUMLSSearchTool', 'search_umls',
    '{"type":"object","properties":{"term":{"type":"string","description":"Medical term to search"},"source_vocabulary":{"type":"string","description":"Source vocabulary (e.g., SNOMED, ICD10, LOINC)"}},"required":["term"]}'::jsonb,
    '{"type":"object","properties":{"concepts":{"type":"array"},"cui":{"type":"string"}}}'::jsonb,
    true, 0.0000, 30, 60,
    ARRAY['UMLS_API_KEY']::text[],
    true, 'https://www.nlm.nih.gov/research/umls/',
    '{"api_endpoint":"https://uts-ws.nlm.nih.gov/rest","version":"1.0"}'::jsonb
);

-- 6. RxNorm API
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-MED-rxnorm', 'TOOL-MED-RXNORM',
    'RxNorm Medication Normalizer',
    'Normalize medication names and find related drug concepts using RxNorm',
    'Medical', 'ai_function', 'function',
    'medical-tools.createRxNormSearchTool', 'search_rxnorm',
    '{"type":"object","properties":{"medication_name":{"type":"string"},"search_type":{"type":"string","enum":["approximate","exact"],"default":"approximate"}},"required":["medication_name"]}'::jsonb,
    '{"type":"object","properties":{"rxcui":{"type":"string"},"name":{"type":"string"},"related":{"type":"array"}}}'::jsonb,
    true, 0.0000, 20, 60, true,
    'https://www.nlm.nih.gov/research/umls/rxnorm/',
    '{"api_endpoint":"https://rxnav.nlm.nih.gov/REST","version":"1.0"}'::jsonb
);

-- 7. SNOMED CT Browser
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-MED-snomed', 'TOOL-MED-SNOMED',
    'SNOMED CT Clinical Terminology Search',
    'Search SNOMED CT for standardized clinical terminology and concept relationships',
    'Medical', 'ai_function', 'function',
    'medical-tools.createSNOMEDSearchTool', 'search_snomed',
    '{"type":"object","properties":{"term":{"type":"string"},"semantic_tag":{"type":"string","description":"Filter by semantic tag (e.g., disorder, procedure)"}},"required":["term"]}'::jsonb,
    '{"type":"object","properties":{"concepts":{"type":"array"},"count":{"type":"integer"}}}'::jsonb,
    true, 0.0000, 30, 60, true,
    'https://www.snomed.org/',
    '{"api_endpoint":"https://browser.ihtsdotools.org/snowstorm/snomed-ct","version":"1.0"}'::jsonb
);

-- ============================================================================
-- CATEGORY 2: CODE EXECUTION & ANALYSIS (4 tools)
-- ============================================================================

-- 8. Python Code Interpreter
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, is_async, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-CODE-python_exec', 'TOOL-CODE-PYTHON_EXEC',
    'Python Code Interpreter',
    'Execute Python code for statistical analysis, data manipulation, and scientific computing',
    'Computation', 'ai_function', 'function',
    'code-execution.createPythonInterpreterTool', 'execute_python',
    '{"type":"object","properties":{"code":{"type":"string","description":"Python code to execute"},"timeout":{"type":"integer","default":30},"allowed_imports":{"type":"array"}},"required":["code"]}'::jsonb,
    '{"type":"object","properties":{"output":{"type":"string"},"stdout":{"type":"string"},"stderr":{"type":"string"},"execution_time":{"type":"number"}}}'::jsonb,
    true, 0.0005, 60, true, 10, true,
    'https://docs.python.org/3/',
    '{"sandbox":true,"allowed_packages":["numpy","pandas","scipy","matplotlib","seaborn","statsmodels"]}'::jsonb
);

-- 9. R Code Executor
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, is_async, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-CODE-r_exec', 'TOOL-CODE-R_EXEC',
    'R Code Executor',
    'Execute R scripts for biostatistical analysis and clinical trial data analysis',
    'Computation', 'ai_function', 'function',
    'code-execution.createRExecutorTool', 'execute_r',
    '{"type":"object","properties":{"code":{"type":"string","description":"R code to execute"},"timeout":{"type":"integer","default":30}},"required":["code"]}'::jsonb,
    '{"type":"object","properties":{"output":{"type":"string"},"plots":{"type":"array"},"execution_time":{"type":"number"}}}'::jsonb,
    true, 0.0005, 60, true, 10, true,
    'https://www.r-project.org/',
    '{"sandbox":true,"allowed_packages":["dplyr","ggplot2","survival","lme4"]}'::jsonb
);

-- 10. Jupyter Notebook Runner
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, is_async, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-CODE-jupyter', 'TOOL-CODE-JUPYTER',
    'Jupyter Notebook Runner',
    'Execute Jupyter notebooks for reproducible research and analysis workflows',
    'Computation', 'api', 'api',
    'code-execution.createJupyterRunnerTool', 'run_jupyter_notebook',
    '{"type":"object","properties":{"notebook_path":{"type":"string"},"parameters":{"type":"object"},"kernel":{"type":"string","default":"python3"}},"required":["notebook_path"]}'::jsonb,
    '{"type":"object","properties":{"output_notebook":{"type":"string"},"cells_executed":{"type":"integer"},"errors":{"type":"array"}}}'::jsonb,
    true, 0.0010, 300, true, 5, true,
    'https://jupyter.org/',
    '{"supported_kernels":["python3","r","julia"]}'::jsonb
);

-- 11. SQL Query Executor
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-CODE-sql_exec', 'TOOL-CODE-SQL_EXEC',
    'SQL Query Executor',
    'Execute SQL queries against clinical databases for data extraction and analysis',
    'Database', 'ai_function', 'function',
    'code-execution.createSQLExecutorTool', 'execute_sql',
    '{"type":"object","properties":{"query":{"type":"string","description":"SQL query (SELECT only)"},"database":{"type":"string"},"limit":{"type":"integer","default":100}},"required":["query"]}'::jsonb,
    '{"type":"object","properties":{"rows":{"type":"array"},"columns":{"type":"array"},"row_count":{"type":"integer"}}}'::jsonb,
    true, 0.0002, 30, 30, true,
    'https://www.postgresql.org/docs/',
    '{"read_only":true,"max_rows":10000}'::jsonb
);

-- ============================================================================
-- CATEGORY 3: DOCUMENT PROCESSING (5 tools)
-- ============================================================================

-- 12. PDF Text Extractor
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-DOC-pdf_extract', 'TOOL-DOC-PDF_EXTRACT',
    'PDF Text Extractor',
    'Extract text content from PDF documents including clinical protocols and regulatory submissions',
    'Document Processing', 'ai_function', 'function',
    'document-tools.createPDFExtractorTool', 'extract_pdf_text',
    '{"type":"object","properties":{"pdf_path":{"type":"string"},"extract_tables":{"type":"boolean","default":false},"page_range":{"type":"array"}},"required":["pdf_path"]}'::jsonb,
    '{"type":"object","properties":{"text":{"type":"string"},"pages":{"type":"integer"},"tables":{"type":"array"}}}'::jsonb,
    true, 0.0003, 60, 30, true,
    'https://pypdf.readthedocs.io/',
    '{"max_file_size_mb":50,"supports_ocr":false}'::jsonb
);

-- 13. Medical Image OCR
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-DOC-med_ocr', 'TOOL-DOC-MED_OCR',
    'Medical Image OCR',
    'Extract text from scanned medical documents, prescriptions, and clinical notes using OCR',
    'Document Processing', 'ai_function', 'function',
    'document-tools.createMedicalOCRTool', 'ocr_medical_image',
    '{"type":"object","properties":{"image_path":{"type":"string"},"language":{"type":"string","default":"en"},"enhance_image":{"type":"boolean","default":true}},"required":["image_path"]}'::jsonb,
    '{"type":"object","properties":{"text":{"type":"string"},"confidence":{"type":"number"},"bounding_boxes":{"type":"array"}}}'::jsonb,
    true, 0.0020, 45, 20, true,
    'https://tesseract-ocr.github.io/',
    '{"supported_formats":["png","jpg","tiff"],"medical_terms_optimized":true}'::jsonb
);

-- 14. Document Summarizer
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, required_env_vars, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-DOC-summarizer', 'TOOL-DOC-SUMMARIZER',
    'Clinical Document Summarizer',
    'Generate concise summaries of lengthy clinical documents, protocols, and research papers',
    'Document Processing', 'ai_function', 'function',
    'document-tools.createDocumentSummarizerTool', 'summarize_document',
    '{"type":"object","properties":{"document_path":{"type":"string"},"summary_length":{"type":"string","enum":["short","medium","long"],"default":"medium"},"focus_areas":{"type":"array"}},"required":["document_path"]}'::jsonb,
    '{"type":"object","properties":{"summary":{"type":"string"},"key_points":{"type":"array"},"word_count":{"type":"integer"}}}'::jsonb,
    true, 0.0100, 60, 20,
    ARRAY['OPENAI_API_KEY']::text[],
    true, 'https://platform.openai.com/docs/',
    '{"model":"gpt-4o-mini","max_input_tokens":100000}'::jsonb
);

-- 15. Citation Extractor
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-DOC-citations', 'TOOL-DOC-CITATIONS',
    'Citation Extractor',
    'Extract and format citations and references from academic papers and clinical documents',
    'Document Processing', 'ai_function', 'function',
    'document-tools.createCitationExtractorTool', 'extract_citations',
    '{"type":"object","properties":{"document_path":{"type":"string"},"citation_style":{"type":"string","enum":["AMA","APA","Vancouver"],"default":"AMA"}},"required":["document_path"]}'::jsonb,
    '{"type":"object","properties":{"citations":{"type":"array"},"count":{"type":"integer"},"formatted":{"type":"array"}}}'::jsonb,
    true, 0.0001, 30, 30, true,
    'https://www.ncbi.nlm.nih.gov/books/NBK7256/',
    '{"supported_formats":["pdf","docx","txt"]}'::jsonb
);

-- 16. Table Parser
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-DOC-table_parser', 'TOOL-DOC-TABLE_PARSER',
    'Table Parser',
    'Extract and parse tables from PDFs and images into structured data formats',
    'Document Processing', 'ai_function', 'function',
    'document-tools.createTableParserTool', 'parse_tables',
    '{"type":"object","properties":{"file_path":{"type":"string"},"output_format":{"type":"string","enum":["csv","json","excel"],"default":"csv"}},"required":["file_path"]}'::jsonb,
    '{"type":"object","properties":{"tables":{"type":"array"},"table_count":{"type":"integer"},"data":{"type":"array"}}}'::jsonb,
    true, 0.0015, 60, 20, true,
    'https://camelot-py.readthedocs.io/',
    '{"methods":["lattice","stream"],"accuracy_threshold":0.8}'::jsonb
);

-- ============================================================================
-- CATEGORY 4: REAL-TIME DATA & MONITORING (4 tools)
-- ============================================================================

-- 17. Wearable Device API (Fitbit)
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, required_env_vars, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-SENSOR-fitbit', 'TOOL-SENSOR-FITBIT',
    'Fitbit Health Data API',
    'Retrieve health metrics from Fitbit devices including heart rate, sleep, activity, and steps',
    'Wearables', 'api', 'api',
    'wearable-tools.createFitbitAPITool', 'get_fitbit_data',
    '{"type":"object","properties":{"user_id":{"type":"string"},"data_type":{"type":"string","enum":["heart_rate","steps","sleep","activity"]},"date_range":{"type":"string"}},"required":["user_id","data_type"]}'::jsonb,
    '{"type":"object","properties":{"data":{"type":"array"},"summary":{"type":"object"},"unit":{"type":"string"}}}'::jsonb,
    true, 0.0000, 30, 150,
    ARRAY['FITBIT_CLIENT_ID','FITBIT_CLIENT_SECRET']::text[],
    true, 'https://dev.fitbit.com/build/reference/web-api/',
    '{"oauth_required":true,"rate_limit_per_hour":150}'::jsonb
);

-- 18. Apple Health Integration
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-SENSOR-apple_health', 'TOOL-SENSOR-APPLE_HEALTH',
    'Apple Health Data Reader',
    'Parse and analyze health data exported from Apple Health app',
    'Wearables', 'ai_function', 'function',
    'wearable-tools.createAppleHealthReaderTool', 'read_apple_health',
    '{"type":"object","properties":{"export_file":{"type":"string","description":"Path to Apple Health export.xml"},"data_types":{"type":"array","description":"Health data types to extract"}},"required":["export_file"]}'::jsonb,
    '{"type":"object","properties":{"records":{"type":"array"},"summary":{"type":"object"},"date_range":{"type":"string"}}}'::jsonb,
    true, 0.0000, 60, 10, true,
    'https://developer.apple.com/documentation/healthkit/',
    '{"supported_types":["heart_rate","steps","sleep","workouts","blood_pressure"]}'::jsonb
);

-- 19. Patient Event Logger
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-MONITOR-event_logger', 'TOOL-MONITOR-EVENT_LOGGER',
    'Patient Event Logger',
    'Log and track clinical events, adverse events, and patient milestones in real-time',
    'Monitoring', 'ai_function', 'function',
    'monitoring-tools.createEventLoggerTool', 'log_patient_event',
    '{"type":"object","properties":{"patient_id":{"type":"string"},"event_type":{"type":"string","enum":["adverse_event","milestone","vital_sign","medication"]},"event_data":{"type":"object"},"severity":{"type":"string","enum":["mild","moderate","severe"]}},"required":["patient_id","event_type","event_data"]}'::jsonb,
    '{"type":"object","properties":{"event_id":{"type":"string"},"logged_at":{"type":"string"},"status":{"type":"string"}}}'::jsonb,
    true, 0.0001, 15, 300, true,
    'https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program',
    '{"database":"postgresql","indexed":true,"retention_days":2555}'::jsonb
);

-- 20. Adverse Event Reporter
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-MONITOR-ae_reporter', 'TOOL-MONITOR-AE_REPORTER',
    'Adverse Event Reporter',
    'Submit adverse event reports to FDA MedWatch and other regulatory agencies',
    'Monitoring', 'api', 'api',
    'monitoring-tools.createAEReporterTool', 'submit_adverse_event',
    '{"type":"object","properties":{"event_details":{"type":"object"},"patient_info":{"type":"object"},"product_info":{"type":"object"},"reporter_info":{"type":"object"},"agency":{"type":"string","enum":["FDA","EMA"],"default":"FDA"}},"required":["event_details","product_info"]}'::jsonb,
    '{"type":"object","properties":{"submission_id":{"type":"string"},"status":{"type":"string"},"confirmation_number":{"type":"string"}}}'::jsonb,
    true, 0.0000, 60, 10, true,
    'https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program/medwatch-online-voluntary-reporting-form',
    '{"requires_authorization":true,"submission_format":"E2B"}'::jsonb
);

-- ============================================================================
-- CATEGORY 5: COMMUNICATION & COLLABORATION (4 tools)
-- ============================================================================

-- 21. Email Sender
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, required_env_vars, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-COMM-email', 'TOOL-COMM-EMAIL',
    'Email Sender',
    'Send email notifications to stakeholders, investigators, and team members',
    'Communication', 'api', 'api',
    'communication-tools.createEmailSenderTool', 'send_email',
    '{"type":"object","properties":{"to":{"type":"array","items":{"type":"string"}},"subject":{"type":"string"},"body":{"type":"string"},"attachments":{"type":"array"},"cc":{"type":"array"}},"required":["to","subject","body"]}'::jsonb,
    '{"type":"object","properties":{"message_id":{"type":"string"},"status":{"type":"string"},"sent_at":{"type":"string"}}}'::jsonb,
    true, 0.0001, 30, 60,
    ARRAY['SMTP_HOST','SMTP_USERNAME','SMTP_PASSWORD']::text[],
    true, 'https://docs.sendgrid.com/api-reference/',
    '{"provider":"sendgrid","max_recipients":100}'::jsonb
);

-- 22. Slack Notifier
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, required_env_vars, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-COMM-slack', 'TOOL-COMM-SLACK',
    'Slack Channel Notifier',
    'Post updates and notifications to Slack channels for team collaboration',
    'Communication', 'api', 'api',
    'communication-tools.createSlackNotifierTool', 'post_to_slack',
    '{"type":"object","properties":{"channel":{"type":"string"},"message":{"type":"string"},"thread_ts":{"type":"string"},"attachments":{"type":"array"}},"required":["channel","message"]}'::jsonb,
    '{"type":"object","properties":{"ts":{"type":"string"},"channel":{"type":"string"},"status":{"type":"string"}}}'::jsonb,
    true, 0.0000, 15, 60,
    ARRAY['SLACK_BOT_TOKEN']::text[],
    true, 'https://api.slack.com/methods',
    '{"scopes":["chat:write","files:write"]}'::jsonb
);

-- 23. Calendar Scheduler
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, required_env_vars, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-COMM-calendar', 'TOOL-COMM-CALENDAR',
    'Calendar Event Scheduler',
    'Schedule meetings, milestones, and trial events on Google Calendar',
    'Communication', 'api', 'api',
    'communication-tools.createCalendarSchedulerTool', 'create_calendar_event',
    '{"type":"object","properties":{"summary":{"type":"string"},"start_time":{"type":"string"},"end_time":{"type":"string"},"attendees":{"type":"array"},"description":{"type":"string"}},"required":["summary","start_time","end_time"]}'::jsonb,
    '{"type":"object","properties":{"event_id":{"type":"string"},"html_link":{"type":"string"},"status":{"type":"string"}}}'::jsonb,
    true, 0.0000, 20, 30,
    ARRAY['GOOGLE_CALENDAR_API_KEY']::text[],
    true, 'https://developers.google.com/calendar/api',
    '{"calendar_id":"primary","timezone":"UTC"}'::jsonb
);

-- 24. Document Generator
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-COMM-doc_gen', 'TOOL-COMM-DOC_GEN',
    'Clinical Document Generator',
    'Generate formatted Word/PDF documents from templates for protocols, reports, and submissions',
    'Document Processing', 'ai_function', 'function',
    'document-tools.createDocumentGeneratorTool', 'generate_document',
    '{"type":"object","properties":{"template_name":{"type":"string"},"data":{"type":"object"},"output_format":{"type":"string","enum":["docx","pdf"],"default":"docx"}},"required":["template_name","data"]}'::jsonb,
    '{"type":"object","properties":{"file_path":{"type":"string"},"pages":{"type":"integer"},"size_kb":{"type":"integer"}}}'::jsonb,
    true, 0.0005, 60, 20, true,
    'https://python-docx.readthedocs.io/',
    '{"templates_available":["protocol","csr","sap","dossier"]}'::jsonb
);

-- ============================================================================
-- CATEGORY 6: DATA VALIDATION & QUALITY (4 tools)
-- ============================================================================

-- 25. Clinical Data Validator
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-VALID-clinical_data', 'TOOL-VALID-CLINICAL_DATA',
    'Clinical Data Validator',
    'Validate clinical trial data against CDISC standards (SDTM, ADaM) and protocol specifications',
    'Data Quality', 'ai_function', 'function',
    'validation-tools.createClinicalDataValidatorTool', 'validate_clinical_data',
    '{"type":"object","properties":{"data_file":{"type":"string"},"standard":{"type":"string","enum":["SDTM","ADaM","SEND"],"default":"SDTM"},"validation_level":{"type":"string","enum":["strict","standard","lenient"],"default":"standard"}},"required":["data_file"]}'::jsonb,
    '{"type":"object","properties":{"valid":{"type":"boolean"},"errors":{"type":"array"},"warnings":{"type":"array"},"validation_report":{"type":"string"}}}'::jsonb,
    true, 0.0010, 120, 10, true,
    'https://www.cdisc.org/standards',
    '{"standards_version":"CDISC_2023","report_format":"HTML"}'::jsonb
);

-- 26. Statistical Test Runner
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-VALID-stat_test', 'TOOL-VALID-STAT_TEST',
    'Statistical Test Runner',
    'Execute statistical tests including t-tests, ANOVA, chi-square, and regression analyses',
    'Statistics', 'ai_function', 'function',
    'validation-tools.createStatTestRunnerTool', 'run_statistical_test',
    '{"type":"object","properties":{"test_type":{"type":"string","enum":["t_test","anova","chi_square","regression","survival"]},"data":{"type":"object"},"alpha":{"type":"number","default":0.05},"alternative":{"type":"string","enum":["two-sided","greater","less"],"default":"two-sided"}},"required":["test_type","data"]}'::jsonb,
    '{"type":"object","properties":{"test_statistic":{"type":"number"},"p_value":{"type":"number"},"confidence_interval":{"type":"array"},"interpretation":{"type":"string"}}}'::jsonb,
    true, 0.0005, 60, 30, true,
    'https://docs.scipy.org/doc/scipy/reference/stats.html',
    '{"library":"scipy","supports_multiple_comparisons":true}'::jsonb
);

-- 27. Power Analysis Calculator
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-VALID-power_calc', 'TOOL-VALID-POWER_CALC',
    'Power Analysis & Sample Size Calculator',
    'Calculate required sample size and statistical power for clinical trials',
    'Statistics', 'ai_function', 'function',
    'validation-tools.createPowerCalculatorTool', 'calculate_power',
    '{"type":"object","properties":{"analysis_type":{"type":"string","enum":["t_test","anova","chi_square","survival"]},"effect_size":{"type":"number"},"alpha":{"type":"number","default":0.05},"power":{"type":"number","default":0.8},"groups":{"type":"integer","default":2}},"required":["analysis_type","effect_size"]}'::jsonb,
    '{"type":"object","properties":{"sample_size":{"type":"integer"},"power":{"type":"number"},"effect_size":{"type":"number"},"assumptions":{"type":"object"}}}'::jsonb,
    true, 0.0002, 30, 60, true,
    'https://www.statsmodels.org/stable/stats.html#power-and-sample-size-calculations',
    '{"library":"statsmodels","methods":["analytical","simulation"]}'::jsonb
);

-- 28. Missing Data Analyzer
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-VALID-missing_data', 'TOOL-VALID-MISSING_DATA',
    'Missing Data Pattern Analyzer',
    'Detect, analyze, and report missing data patterns in clinical trial datasets',
    'Data Quality', 'ai_function', 'function',
    'validation-tools.createMissingDataAnalyzerTool', 'analyze_missing_data',
    '{"type":"object","properties":{"data_file":{"type":"string"},"generate_report":{"type":"boolean","default":true},"suggest_imputation":{"type":"boolean","default":false}},"required":["data_file"]}'::jsonb,
    '{"type":"object","properties":{"missing_percentage":{"type":"number"},"pattern_type":{"type":"string","enum":["MCAR","MAR","MNAR"]},"affected_variables":{"type":"array"},"recommendations":{"type":"array"}}}'::jsonb,
    true, 0.0005, 45, 20, true,
    'https://scikit-learn.org/stable/modules/impute.html',
    '{"visualization":true,"imputation_methods":["mean","median","knn","mice"]}'::jsonb
);

-- ============================================================================
-- CATEGORY 7: REGULATORY & COMPLIANCE (6 tools)
-- ============================================================================

-- 29. FDA Guidance Search
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-REG-fda_guidance', 'TOOL-REG-FDA_GUIDANCE',
    'FDA Guidance Document Search',
    'Search and retrieve FDA guidance documents for drugs, devices, and digital health',
    'Regulatory', 'ai_function', 'function',
    'regulatory-tools.createFDAGuidanceSearchTool', 'search_fda_guidance',
    '{"type":"object","properties":{"query":{"type":"string"},"product_area":{"type":"string","enum":["drugs","devices","digital_health","biologics"],"default":"digital_health"},"status":{"type":"string","enum":["final","draft","all"],"default":"all"}},"required":["query"]}'::jsonb,
    '{"type":"object","properties":{"documents":{"type":"array"},"count":{"type":"integer"},"most_relevant":{"type":"object"}}}'::jsonb,
    true, 0.0000, 30, 60, true,
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents',
    '{"api_endpoint":"https://www.fda.gov/api/guidance","database":"FDA_GRaSP"}'::jsonb
);

-- 30. EMA Guideline Search
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-REG-ema_guidance', 'TOOL-REG-EMA_GUIDANCE',
    'EMA Guideline Search',
    'Search European Medicines Agency guidelines and scientific advice',
    'Regulatory', 'ai_function', 'function',
    'regulatory-tools.createEMAGuidelineSearchTool', 'search_ema_guideline',
    '{"type":"object","properties":{"query":{"type":"string"},"therapeutic_area":{"type":"string"},"document_type":{"type":"string","enum":["guideline","qa","reflection"],"default":"guideline"}},"required":["query"]}'::jsonb,
    '{"type":"object","properties":{"guidelines":{"type":"array"},"count":{"type":"integer"},"languages_available":{"type":"array"}}}'::jsonb,
    true, 0.0000, 30, 60, true,
    'https://www.ema.europa.eu/en/human-regulatory/research-development/scientific-guidelines',
    '{"regions":["EU","EEA"],"languages":["en","de","fr"]}'::jsonb
);

-- 31. ICH Guideline Search
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-REG-ich_guidance', 'TOOL-REG-ICH_GUIDANCE',
    'ICH Guideline Search',
    'Search International Council for Harmonisation (ICH) guidelines for global drug development',
    'Regulatory', 'ai_function', 'function',
    'regulatory-tools.createICHGuidelineSearchTool', 'search_ich_guideline',
    '{"type":"object","properties":{"query":{"type":"string"},"guideline_category":{"type":"string","enum":["Q","E","M","S"],"description":"Q=Quality, E=Efficacy, M=Multidisciplinary, S=Safety"},"step":{"type":"integer","description":"ICH step (1-4)"}},"required":["query"]}'::jsonb,
    '{"type":"object","properties":{"guidelines":{"type":"array"},"count":{"type":"integer"},"harmonization_status":{"type":"string"}}}'::jsonb,
    true, 0.0000, 30, 60, true,
    'https://www.ich.org/page/ich-guidelines',
    '{"harmonized":true,"global_adoption":true}'::jsonb
);

-- 32. Regulatory Timeline Calculator
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-REG-timeline_calc', 'TOOL-REG-TIMELINE_CALC',
    'Regulatory Submission Timeline Calculator',
    'Estimate regulatory review timelines for FDA, EMA, and other global agencies',
    'Regulatory', 'ai_function', 'function',
    'regulatory-tools.createTimelineCalculatorTool', 'calculate_reg_timeline',
    '{"type":"object","properties":{"submission_type":{"type":"string","enum":["510k","PMA","De_Novo","IND","NDA","BLA","CE_Mark"]},"agency":{"type":"string","enum":["FDA","EMA","PMDA","HC"],"default":"FDA"},"expedited_pathway":{"type":"boolean","default":false}},"required":["submission_type"]}'::jsonb,
    '{"type":"object","properties":{"estimated_days":{"type":"integer"},"milestones":{"type":"array"},"critical_path":{"type":"array"},"confidence_interval":{"type":"array"}}}'::jsonb,
    true, 0.0001, 20, 60, true,
    'https://www.fda.gov/patients/drug-development-process/step-3-clinical-research',
    '{"historical_data":true,"includes_expedited_pathways":["breakthrough","fast_track","priority_review"]}'::jsonb
);

-- 33. Compliance Checker
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-REG-compliance', 'TOOL-REG-COMPLIANCE',
    'Regulatory Compliance Checker',
    'Check clinical trial protocols and documents for regulatory compliance with FDA/EMA/ICH requirements',
    'Regulatory', 'ai_function', 'function',
    'regulatory-tools.createComplianceCheckerTool', 'check_compliance',
    '{"type":"object","properties":{"document_path":{"type":"string"},"regulation":{"type":"string","enum":["21CFR","EU_MDR","EU_IVDR","ICH_GCP"],"default":"21CFR"},"check_type":{"type":"string","enum":["protocol","csr","dossier"],"default":"protocol"}},"required":["document_path"]}'::jsonb,
    '{"type":"object","properties":{"compliant":{"type":"boolean"},"issues":{"type":"array"},"compliance_score":{"type":"number"},"recommendations":{"type":"array"}}}'::jsonb,
    true, 0.0050, 90, 10, true,
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents',
    '{"regulations_covered":["21CFR11","21CFR312","EU_MDR","ICH_E6"],"ai_powered":true}'::jsonb
);

-- 34. Protocol Deviation Tracker
INSERT INTO dh_tool (
    tenant_id, unique_id, code, name, tool_description, category, tool_type,
    implementation_type, implementation_path, function_name,
    input_schema, output_schema, langgraph_compatible, cost_per_execution,
    max_execution_time_seconds, rate_limit_per_minute, is_active, documentation_url, metadata
) VALUES (
    v_tenant_id, 'TL-REG-deviation_tracker', 'TOOL-REG-DEVIATION_TRACKER',
    'Protocol Deviation Tracker',
    'Track, categorize, and report protocol deviations during clinical trials',
    'Data Quality', 'ai_function', 'function',
    'regulatory-tools.createDeviationTrackerTool', 'track_protocol_deviation',
    '{"type":"object","properties":{"protocol_id":{"type":"string"},"deviation_description":{"type":"string"},"severity":{"type":"string","enum":["minor","major","critical"]},"action_taken":{"type":"string"},"subject_id":{"type":"string"}},"required":["protocol_id","deviation_description","severity"]}'::jsonb,
    '{"type":"object","properties":{"deviation_id":{"type":"string"},"logged_at":{"type":"string"},"requires_reporting":{"type":"boolean"},"capa_required":{"type":"boolean"}}}'::jsonb,
    true, 0.0002, 20, 100, true,
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/oversight-clinical-investigations-risk-based-approach-monitoring',
    '{"capa_integration":true,"audit_trail":true}'::jsonb
);

    RAISE NOTICE '✅ Successfully added 30 new tools to dh_tool registry';
    RAISE NOTICE '✅ Total tools now: 56 (26 existing + 30 new)';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: %', SQLERRM;
        RAISE;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT 
    '🎉 TOOL REGISTRY EXPANSION COMPLETE!' as status,
    COUNT(*) as total_tools,
    COUNT(CASE WHEN tool_type = 'ai_function' THEN 1 END) as ai_function,
    COUNT(CASE WHEN tool_type = 'software_reference' THEN 1 END) as software,
    COUNT(CASE WHEN tool_type = 'database' THEN 1 END) as database,
    COUNT(CASE WHEN tool_type = 'saas' THEN 1 END) as saas,
    COUNT(CASE WHEN tool_type = 'api' THEN 1 END) as api,
    COUNT(CASE WHEN tool_type = 'ai_framework' THEN 1 END) as ai_framework,
    COUNT(CASE WHEN langgraph_compatible = true THEN 1 END) as langgraph_ready
FROM dh_tool
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1);

-- Show breakdown by category
SELECT 
    category,
    COUNT(*) as tool_count,
    string_agg(name, ', ' ORDER BY name) as tools
FROM dh_tool
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
GROUP BY category
ORDER BY tool_count DESC, category;

