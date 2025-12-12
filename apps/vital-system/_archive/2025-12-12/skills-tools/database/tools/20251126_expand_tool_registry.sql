-- ============================================================================
-- AgentOS 3.0: Expanded Tool Registry - Essential 30 Tools
-- File: 20251126_expand_tool_registry.sql
-- Purpose: Add core tools for production readiness
-- ============================================================================

-- ============================================================================
-- CATEGORY 1: CLINICAL DATA SOURCES (10 tools)
-- ============================================================================

INSERT INTO tool_registry (
    tool_id, tool_name, tool_type, version,
    function_name, function_description,
    input_schema, output_schema,
    avg_latency_ms, rate_limit, timeout_seconds,
    gdpr_compliant, hipaa_compliant, logs_pii,
    cost_per_call
) VALUES

-- 1. ClinicalTrials.gov API
('clinicaltrials_gov_v1', 'clinicaltrials_gov_api', 'api_wrapper', '1.0.0',
 'search_clinical_trials',
 'Search ClinicalTrials.gov database for clinical trials',
 '{"type":"object","required":["query"],"properties":{"query":{"type":"string"},"max_results":{"type":"integer","default":100,"maximum":1000},"status":{"type":"array","items":{"enum":["RECRUITING","COMPLETED","TERMINATED"]}}}}'::jsonb,
 '{"type":"object","properties":{"trials":{"type":"array","items":{"type":"object","properties":{"nct_id":{"type":"string"},"title":{"type":"string"},"status":{"type":"string"},"phase":{"type":"string"},"enrollment":{"type":"integer"}}}},"total_count":{"type":"integer"}}}'::jsonb,
 3000, '100 calls/hour per tenant', 15, TRUE, TRUE, FALSE, 0.0002),

-- 2. FDA API
('fda_drugs_v1', 'fda_drugs_api', 'api_wrapper', '1.0.0',
 'query_fda_drugs',
 'Query FDA Drugs@FDA database',
 '{"type":"object","required":["search"],"properties":{"search":{"type":"string"},"limit":{"type":"integer","default":100}}}'::jsonb,
 '{"type":"object","properties":{"results":{"type":"array"},"total":{"type":"integer"}}}'::jsonb,
 2500, '240 calls/hour per tenant', 10, TRUE, FALSE, FALSE, 0.0001),

-- 3. FDA FAERS (Adverse Events)
('fda_faers_v1', 'fda_faers_api', 'api_wrapper', '1.0.0',
 'query_adverse_events',
 'Query FDA Adverse Event Reporting System',
 '{"type":"object","required":["drug_name"],"properties":{"drug_name":{"type":"string"},"event_type":{"type":"string"},"date_range":{"type":"object"}}}'::jsonb,
 '{"type":"object","properties":{"events":{"type":"array"},"summary":{"type":"object"}}}'::jsonb,
 3500, '100 calls/hour per tenant', 15, TRUE, FALSE, FALSE, 0.0003),

-- 4. EMA Public Data
('ema_public_v1', 'ema_public_api', 'api_wrapper', '1.0.0',
 'search_ema_data',
 'Search European Medicines Agency public data',
 '{"type":"object","required":["query"],"properties":{"query":{"type":"string"},"category":{"type":"string","enum":["medicines","procedures","documents"]}}}'::jsonb,
 '{"type":"object","properties":{"results":{"type":"array"},"count":{"type":"integer"}}}'::jsonb,
 4000, '60 calls/hour per tenant', 20, TRUE, FALSE, FALSE, 0.0002),

-- 5. WHO Drug Information
('who_drug_info_v1', 'who_drug_info_api', 'api_wrapper', '1.0.0',
 'query_who_drug_info',
 'Query WHO Drug Information database',
 '{"type":"object","required":["drug_name"],"properties":{"drug_name":{"type":"string"},"info_type":{"type":"string"}}}'::jsonb,
 '{"type":"object","properties":{"drug_info":{"type":"object"},"sources":{"type":"array"}}}'::jsonb,
 3000, '50 calls/hour per tenant', 15, TRUE, FALSE, FALSE, 0.0002),

-- 6. DrugBank API
('drugbank_v1', 'drugbank_api', 'api_wrapper', '1.0.0',
 'query_drugbank',
 'Query DrugBank pharmaceutical knowledge database',
 '{"type":"object","required":["drug_identifier"],"properties":{"drug_identifier":{"type":"string"},"include_interactions":{"type":"boolean","default":false}}}'::jsonb,
 '{"type":"object","properties":{"drug_data":{"type":"object"},"interactions":{"type":"array"}}}'::jsonb,
 2000, '1000 calls/day per tenant', 10, TRUE, FALSE, FALSE, 0.001),

-- 7. OpenFDA Device API
('openfda_device_v1', 'openfda_device_api', 'api_wrapper', '1.0.0',
 'search_medical_devices',
 'Search FDA medical device database',
 '{"type":"object","required":["search"],"properties":{"search":{"type":"string"},"limit":{"type":"integer","default":100}}}'::jsonb,
 '{"type":"object","properties":{"devices":{"type":"array"},"total":{"type":"integer"}}}'::jsonb,
 2000, '240 calls/hour per tenant', 10, TRUE, FALSE, FALSE, 0.0001),

-- 8. NIH Reporter API
('nih_reporter_v1', 'nih_reporter_api', 'api_wrapper', '1.0.0',
 'search_nih_grants',
 'Search NIH Research Portfolio Online Reporting Tools',
 '{"type":"object","required":["criteria"],"properties":{"criteria":{"type":"object"},"fiscal_year":{"type":"integer"}}}'::jsonb,
 '{"type":"object","properties":{"grants":{"type":"array"},"total_funding":{"type":"number"}}}'::jsonb,
 3000, '50 calls/hour per tenant', 15, TRUE, FALSE, FALSE, 0.0002),

-- 9. RxNorm API
('rxnorm_v1', 'rxnorm_api', 'api_wrapper', '1.0.0',
 'query_rxnorm',
 'Query RxNorm normalized drug names',
 '{"type":"object","required":["drug_name"],"properties":{"drug_name":{"type":"string"},"search_type":{"type":"string","enum":["exact","approximate"]}}}'::jsonb,
 '{"type":"object","properties":{"concepts":{"type":"array"},"rxcui":{"type":"string"}}}'::jsonb,
 1500, 'unlimited', 10, TRUE, FALSE, FALSE, 0.0),

-- 10. ChEMBL API
('chembl_v1', 'chembl_api', 'api_wrapper', '1.0.0',
 'search_chembl',
 'Search ChEMBL bioactivity database',
 '{"type":"object","required":["molecule"],"properties":{"molecule":{"type":"string"},"target":{"type":"string"}}}'::jsonb,
 '{"type":"object","properties":{"activities":{"type":"array"},"count":{"type":"integer"}}}'::jsonb,
 2500, '100 calls/hour per tenant', 15, TRUE, FALSE, FALSE, 0.0001);

DO $$ BEGIN
    RAISE NOTICE '✅ Clinical data source tools added (10)';
END $$;

-- ============================================================================
-- CATEGORY 2: STATISTICAL CALCULATORS (10 tools)
-- ============================================================================

INSERT INTO tool_registry (
    tool_id, tool_name, tool_type, version,
    function_name, function_description,
    input_schema, output_schema,
    avg_latency_ms, rate_limit, timeout_seconds,
    is_deterministic, cost_per_call
) VALUES

-- 11. Power Analysis
('power_analysis_v1', 'power_analysis_calculator', 'calculator', '1.0.0',
 'calculate_statistical_power',
 'Calculate statistical power for study design',
 '{"type":"object","required":["effect_size","sample_size","alpha"],"properties":{"effect_size":{"type":"number"},"sample_size":{"type":"integer"},"alpha":{"type":"number","default":0.05},"test_type":{"type":"string","enum":["t_test","anova","chi_square"]}}}'::jsonb,
 '{"type":"object","properties":{"power":{"type":"number"},"beta":{"type":"number"},"required_n":{"type":"integer"},"formula":{"type":"string"}}}'::jsonb,
 100, 'unlimited', 5, TRUE, 0.0),

-- 12. Survival Analysis
('survival_analysis_v1', 'survival_analysis_calculator', 'calculator', '1.0.0',
 'calculate_survival_metrics',
 'Calculate survival analysis metrics (Kaplan-Meier, hazard ratios)',
 '{"type":"object","required":["time_points","events"],"properties":{"time_points":{"type":"array","items":{"type":"number"}},"events":{"type":"array","items":{"type":"boolean"}},"groups":{"type":"array"}}}'::jsonb,
 '{"type":"object","properties":{"median_survival":{"type":"number"},"hazard_ratio":{"type":"number"},"confidence_interval":{"type":"array"},"p_value":{"type":"number"}}}'::jsonb,
 200, 'unlimited', 5, TRUE, 0.0),

-- 13. ICER Calculator (Cost-Effectiveness)
('icer_calculator_v1', 'icer_calculator', 'calculator', '1.0.0',
 'calculate_icer',
 'Calculate Incremental Cost-Effectiveness Ratio',
 '{"type":"object","required":["cost_intervention","cost_comparator","qaly_intervention","qaly_comparator"],"properties":{"cost_intervention":{"type":"number"},"cost_comparator":{"type":"number"},"qaly_intervention":{"type":"number"},"qaly_comparator":{"type":"number"}}}'::jsonb,
 '{"type":"object","properties":{"icer":{"type":"number"},"incremental_cost":{"type":"number"},"incremental_qaly":{"type":"number"},"interpretation":{"type":"string"}}}'::jsonb,
 50, 'unlimited', 5, TRUE, 0.0),

-- 14. NNT/NNH Calculator
('nnt_calculator_v1', 'nnt_calculator', 'calculator', '1.0.0',
 'calculate_nnt_nnh',
 'Calculate Number Needed to Treat/Harm',
 '{"type":"object","required":["event_rate_treatment","event_rate_control"],"properties":{"event_rate_treatment":{"type":"number"},"event_rate_control":{"type":"number"},"sample_size":{"type":"integer"}}}'::jsonb,
 '{"type":"object","properties":{"nnt":{"type":"number"},"nnh":{"type":"number"},"absolute_risk_reduction":{"type":"number"},"confidence_interval":{"type":"array"}}}'::jsonb,
 50, 'unlimited', 5, TRUE, 0.0),

-- 15. Confidence Interval Calculator
('ci_calculator_v1', 'confidence_interval_calculator', 'calculator', '1.0.0',
 'calculate_confidence_interval',
 'Calculate confidence intervals for various statistics',
 '{"type":"object","required":["statistic","value"],"properties":{"statistic":{"type":"string","enum":["mean","proportion","risk_ratio","odds_ratio"]},"value":{"type":"number"},"standard_error":{"type":"number"},"sample_size":{"type":"integer"},"confidence_level":{"type":"number","default":0.95}}}'::jsonb,
 '{"type":"object","properties":{"lower_bound":{"type":"number"},"upper_bound":{"type":"number"},"confidence_level":{"type":"number"},"interpretation":{"type":"string"}}}'::jsonb,
 50, 'unlimited', 5, TRUE, 0.0),

-- 16. Relative Risk Calculator
('relative_risk_v1', 'relative_risk_calculator', 'calculator', '1.0.0',
 'calculate_relative_risk',
 'Calculate relative risk and odds ratios',
 '{"type":"object","required":["exposed_cases","exposed_total","unexposed_cases","unexposed_total"],"properties":{"exposed_cases":{"type":"integer"},"exposed_total":{"type":"integer"},"unexposed_cases":{"type":"integer"},"unexposed_total":{"type":"integer"}}}'::jsonb,
 '{"type":"object","properties":{"relative_risk":{"type":"number"},"odds_ratio":{"type":"number"},"confidence_interval":{"type":"array"},"p_value":{"type":"number"}}}'::jsonb,
 50, 'unlimited', 5, TRUE, 0.0),

-- 17. ROC Curve Calculator
('roc_calculator_v1', 'roc_curve_calculator', 'calculator', '1.0.0',
 'calculate_roc_metrics',
 'Calculate ROC curve metrics (sensitivity, specificity, AUC)',
 '{"type":"object","required":["predictions","labels"],"properties":{"predictions":{"type":"array","items":{"type":"number"}},"labels":{"type":"array","items":{"type":"integer"}},"thresholds":{"type":"array"}}}'::jsonb,
 '{"type":"object","properties":{"auc":{"type":"number"},"sensitivity":{"type":"array"},"specificity":{"type":"array"},"optimal_threshold":{"type":"number"}}}'::jsonb,
 150, 'unlimited', 5, TRUE, 0.0),

-- 18. Meta-Analysis Calculator
('meta_analysis_v1', 'meta_analysis_calculator', 'calculator', '1.0.0',
 'calculate_meta_analysis',
 'Perform meta-analysis (fixed/random effects)',
 '{"type":"object","required":["effect_sizes","standard_errors"],"properties":{"effect_sizes":{"type":"array","items":{"type":"number"}},"standard_errors":{"type":"array","items":{"type":"number"}},"model":{"type":"string","enum":["fixed","random"],"default":"random"}}}'::jsonb,
 '{"type":"object","properties":{"pooled_effect":{"type":"number"},"confidence_interval":{"type":"array"},"heterogeneity_i2":{"type":"number"},"p_value":{"type":"number"}}}'::jsonb,
 200, 'unlimited', 5, TRUE, 0.0),

-- 19. Bayesian Calculator
('bayesian_v1', 'bayesian_calculator', 'calculator', '1.0.0',
 'calculate_bayesian_probability',
 'Calculate Bayesian posterior probabilities',
 '{"type":"object","required":["prior","likelihood","evidence"],"properties":{"prior":{"type":"number"},"likelihood":{"type":"number"},"evidence":{"type":"number"}}}'::jsonb,
 '{"type":"object","properties":{"posterior":{"type":"number"},"odds":{"type":"number"},"interpretation":{"type":"string"}}}'::jsonb,
 50, 'unlimited', 5, TRUE, 0.0),

-- 20. Dose Escalation Calculator
('dose_escalation_v1', 'dose_escalation_calculator', 'calculator', '1.0.0',
 'calculate_dose_escalation',
 'Calculate dose escalation schemes (3+3, BOIN, etc.)',
 '{"type":"object","required":["method","current_dose","toxicities"],"properties":{"method":{"type":"string","enum":["3+3","BOIN","CRM"]},"current_dose":{"type":"number"},"toxicities":{"type":"integer"},"cohort_size":{"type":"integer"}}}'::jsonb,
 '{"type":"object","properties":{"recommendation":{"type":"string","enum":["escalate","stay","de_escalate","stop"]},"next_dose":{"type":"number"},"rationale":{"type":"string"}}}'::jsonb,
 100, 'unlimited', 5, TRUE, 0.0);

DO $$ BEGIN
    RAISE NOTICE '✅ Statistical calculator tools added (10)';
END $$;

-- ============================================================================
-- CATEGORY 3: FILE PROCESSORS & DATA TOOLS (10 tools)
-- ============================================================================

INSERT INTO tool_registry (
    tool_id, tool_name, tool_type, version,
    function_name, function_description,
    input_schema, output_schema,
    avg_latency_ms, timeout_seconds,
    gdpr_compliant, hipaa_compliant, logs_pii,
    cost_per_call
) VALUES

-- 21. PDF Text Extractor
('pdf_extractor_v1', 'pdf_text_extractor', 'data_processor', '1.0.0',
 'extract_pdf_text',
 'Extract text content from PDF files',
 '{"type":"object","required":["file_path"],"properties":{"file_path":{"type":"string"},"page_range":{"type":"array"},"include_metadata":{"type":"boolean","default":true}}}'::jsonb,
 '{"type":"object","properties":{"text":{"type":"string"},"pages":{"type":"integer"},"metadata":{"type":"object"}}}'::jsonb,
 2000, 30, TRUE, TRUE, FALSE, 0.001),

-- 22. Excel Parser
('excel_parser_v1', 'excel_data_parser', 'data_processor', '1.0.0',
 'parse_excel_data',
 'Parse Excel files to JSON',
 '{"type":"object","required":["file_path"],"properties":{"file_path":{"type":"string"},"sheet_name":{"type":"string"},"header_row":{"type":"integer","default":0}}}'::jsonb,
 '{"type":"object","properties":{"data":{"type":"array"},"columns":{"type":"array"},"row_count":{"type":"integer"}}}'::jsonb,
 1500, 20, TRUE, TRUE, FALSE, 0.001),

-- 23. CSV Converter
('csv_converter_v1', 'csv_converter', 'data_processor', '1.0.0',
 'convert_csv',
 'Convert CSV files between formats',
 '{"type":"object","required":["file_path","output_format"],"properties":{"file_path":{"type":"string"},"output_format":{"type":"string","enum":["json","xml","excel"]}}}'::jsonb,
 '{"type":"object","properties":{"converted_data":{"type":"string"},"format":{"type":"string"},"record_count":{"type":"integer"}}}'::jsonb,
 1000, 15, TRUE, TRUE, FALSE, 0.0005),

-- 24. JSON Schema Validator
('json_validator_v1', 'json_schema_validator', 'data_processor', '1.0.0',
 'validate_json_schema',
 'Validate JSON data against schema',
 '{"type":"object","required":["data","schema"],"properties":{"data":{"type":"object"},"schema":{"type":"object"}}}'::jsonb,
 '{"type":"object","properties":{"is_valid":{"type":"boolean"},"errors":{"type":"array"},"validated_data":{"type":"object"}}}'::jsonb,
 100, 5, TRUE, TRUE, FALSE, 0.0),

-- 25. Data Cleaner
('data_cleaner_v1', 'data_cleaner', 'data_processor', '1.0.0',
 'clean_dataset',
 'Clean and normalize dataset',
 '{"type":"object","required":["data"],"properties":{"data":{"type":"array"},"operations":{"type":"array","items":{"enum":["remove_nulls","trim_strings","normalize_dates","deduplicate"]}}}}'::jsonb,
 '{"type":"object","properties":{"cleaned_data":{"type":"array"},"removed_count":{"type":"integer"},"operations_performed":{"type":"array"}}}'::jsonb,
 500, 10, TRUE, TRUE, FALSE, 0.0005),

-- 26. Text Summarizer
('text_summarizer_v1', 'text_summarizer', 'data_processor', '1.0.0',
 'summarize_text',
 'Summarize long text documents',
 '{"type":"object","required":["text"],"properties":{"text":{"type":"string"},"max_length":{"type":"integer","default":500},"style":{"type":"string","enum":["bullet_points","paragraph"]}}}'::jsonb,
 '{"type":"object","properties":{"summary":{"type":"string"},"original_length":{"type":"integer"},"summary_length":{"type":"integer"},"compression_ratio":{"type":"number"}}}'::jsonb,
 1000, 15, TRUE, TRUE, FALSE, 0.002),

-- 27. Entity Extractor
('entity_extractor_v1', 'entity_extractor', 'data_processor', '1.0.0',
 'extract_entities',
 'Extract named entities from text (drugs, diseases, organizations)',
 '{"type":"object","required":["text"],"properties":{"text":{"type":"string"},"entity_types":{"type":"array","items":{"enum":["drug","disease","organization","person"]}}}}'::jsonb,
 '{"type":"object","properties":{"entities":{"type":"array","items":{"type":"object","properties":{"text":{"type":"string"},"type":{"type":"string"},"confidence":{"type":"number"}}}},"count":{"type":"integer"}}}'::jsonb,
 800, 10, TRUE, TRUE, FALSE, 0.001),

-- 28. URL Content Fetcher
('url_fetcher_v1', 'url_content_fetcher', 'data_processor', '1.0.0',
 'fetch_url_content',
 'Fetch and parse content from URLs',
 '{"type":"object","required":["url"],"properties":{"url":{"type":"string"},"extract_text_only":{"type":"boolean","default":true},"follow_redirects":{"type":"boolean","default":true}}}'::jsonb,
 '{"type":"object","properties":{"content":{"type":"string"},"status_code":{"type":"integer"},"content_type":{"type":"string"},"length":{"type":"integer"}}}'::jsonb,
 2000, 15, TRUE, FALSE, FALSE, 0.0005),

-- 29. Date Parser
('date_parser_v1', 'date_parser', 'data_processor', '1.0.0',
 'parse_date',
 'Parse and normalize dates from various formats',
 '{"type":"object","required":["date_string"],"properties":{"date_string":{"type":"string"},"input_format":{"type":"string"},"output_format":{"type":"string","default":"ISO8601"}}}'::jsonb,
 '{"type":"object","properties":{"parsed_date":{"type":"string"},"is_valid":{"type":"boolean"},"original_format":{"type":"string"}}}'::jsonb,
 50, 5, TRUE, TRUE, FALSE, 0.0),

-- 30. Unit Converter
('unit_converter_v1', 'unit_converter', 'calculator', '1.0.0',
 'convert_units',
 'Convert between medical/pharmaceutical units',
 '{"type":"object","required":["value","from_unit","to_unit"],"properties":{"value":{"type":"number"},"from_unit":{"type":"string"},"to_unit":{"type":"string"},"substance":{"type":"string"}}}'::jsonb,
 '{"type":"object","properties":{"converted_value":{"type":"number"},"from_unit":{"type":"string"},"to_unit":{"type":"string"},"formula":{"type":"string"}}}'::jsonb,
 50, 5, TRUE, FALSE, FALSE, 0.0);

DO $$ BEGIN
    RAISE NOTICE '✅ File processor & data tools added (10)';
END $$;

-- ============================================================================
-- SUCCESS SUMMARY
-- ============================================================================

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ Tool Registry Expanded Successfully!';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '📊 Clinical Data Sources:    10 tools';
    RAISE NOTICE '📊 Statistical Calculators:  10 tools';
    RAISE NOTICE '📊 File Processors & Data:   10 tools';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Total Tools in Registry: 32 (2 existing + 30 new)';
    RAISE NOTICE '🎯 Coverage: Core production functionality';
    RAISE NOTICE '🎯 All tools have proper schemas and metadata';
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;

