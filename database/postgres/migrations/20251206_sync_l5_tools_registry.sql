-- =============================================================================
-- VITAL Platform - L5 Tools Registry Sync Migration
-- Date: 2025-12-06
-- Description: Updates tools table with comprehensive L5 tool configurations
--              from Ask Expert agent hierarchy implementation
-- =============================================================================

-- =============================================================================
-- PART 1: ADD NEW COLUMNS (if not exist)
-- =============================================================================

-- Add new columns for L5 tool tracking
DO $$ 
BEGIN
    -- Tool implementation tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'implementation_status') THEN
        ALTER TABLE tools ADD COLUMN implementation_status VARCHAR(50) DEFAULT 'pending';
    END IF;
    
    -- L5 tool ID (e.g., L5-PM, L5-CT)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'l5_id') THEN
        ALTER TABLE tools ADD COLUMN l5_id VARCHAR(20);
    END IF;
    
    -- Python module path
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'python_module') THEN
        ALTER TABLE tools ADD COLUMN python_module VARCHAR(255);
    END IF;
    
    -- Rate limit per minute
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'rate_limit_per_minute') THEN
        ALTER TABLE tools ADD COLUMN rate_limit_per_minute INTEGER DEFAULT 10;
    END IF;
    
    -- Cache TTL in seconds
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'cache_ttl_seconds') THEN
        ALTER TABLE tools ADD COLUMN cache_ttl_seconds INTEGER DEFAULT 3600;
    END IF;
    
    -- Cost per API call (for tracking)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'cost_per_call') THEN
        ALTER TABLE tools ADD COLUMN cost_per_call DECIMAL(10,6) DEFAULT 0.001;
    END IF;
END $$;

-- =============================================================================
-- PART 2: UPDATE EXISTING TOOLS WITH L5 METADATA
-- =============================================================================

-- Literature Research Tools
UPDATE tools SET
    l5_id = 'L5-PM',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_literature',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 3600,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "literature", "handler": "_execute_pubmed", "tool_class": "LiteratureL5Tool"}'
    )
WHERE slug = 'pubmed-medline';

UPDATE tools SET
    l5_id = 'L5-CO',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_literature',
    rate_limit_per_minute = 5,
    cache_ttl_seconds = 7200,
    cost_per_call = 0.002,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "literature", "handler": "_execute_cochrane", "tool_class": "LiteratureL5Tool"}'
    )
WHERE slug = 'cochrane-library';

UPDATE tools SET
    l5_id = 'L5-CT',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_literature',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 1800,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "literature", "handler": "_execute_clinicaltrials", "tool_class": "LiteratureL5Tool"}'
    )
WHERE slug = 'clinicaltrials-gov';

-- Regulatory Tools
UPDATE tools SET
    l5_id = 'L5-MD',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_regulatory',
    rate_limit_per_minute = 5,
    cache_ttl_seconds = 86400,
    cost_per_call = 0.005,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "regulatory", "handler": "_execute_meddra", "tool_class": "RegulatoryL5Tool"}'
    )
WHERE slug = 'meddra';

-- NLP Tools
UPDATE tools SET
    l5_id = 'L5-UM',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_nlp',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 3600,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "nlp", "handler": "_execute_umls", "tool_class": "NLPL5Tool"}'
    )
WHERE slug = 'umls-metathesaurus';

UPDATE tools SET
    l5_id = 'L5-CK',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_nlp',
    rate_limit_per_minute = 5,
    cache_ttl_seconds = 3600,
    cost_per_call = 0.002,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "nlp", "handler": "_execute_ctakes", "tool_class": "NLPL5Tool"}'
    )
WHERE slug = 'apache-ctakes';

UPDATE tools SET
    l5_id = 'L5-SP',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_nlp',
    rate_limit_per_minute = 100,
    cache_ttl_seconds = 300,
    cost_per_call = 0.0001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "nlp", "handler": "_execute_scispacy", "tool_class": "NLPL5Tool"}'
    )
WHERE slug = 'scispacy';

UPDATE tools SET
    l5_id = 'L5-MC',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_nlp',
    rate_limit_per_minute = 50,
    cache_ttl_seconds = 1800,
    cost_per_call = 0.0005,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "nlp", "handler": "_execute_medcat", "tool_class": "NLPL5Tool"}'
    )
WHERE slug = 'medcat';

UPDATE tools SET
    l5_id = 'L5-MM',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_nlp',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 3600,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "nlp", "handler": "_execute_metamap", "tool_class": "NLPL5Tool"}'
    )
WHERE slug = 'metamap';

UPDATE tools SET
    l5_id = 'L5-CB',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_nlp',
    rate_limit_per_minute = 50,
    cache_ttl_seconds = 600,
    cost_per_call = 0.0005,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "nlp", "handler": "_execute_clinicalbert", "tool_class": "NLPL5Tool"}'
    )
WHERE slug = 'clinicalbert';

UPDATE tools SET
    l5_id = 'L5-BB',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_nlp',
    rate_limit_per_minute = 50,
    cache_ttl_seconds = 600,
    cost_per_call = 0.0005,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "nlp", "handler": "_execute_biobert", "tool_class": "NLPL5Tool"}'
    )
WHERE slug = 'biobert';

-- Privacy Tools
UPDATE tools SET
    l5_id = 'L5-PR',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_privacy',
    rate_limit_per_minute = 100,
    cache_ttl_seconds = 0,
    cost_per_call = 0.0001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "privacy", "handler": "_execute_presidio", "tool_class": "PrivacyL5Tool"}'
    )
WHERE slug = 'microsoft-presidio';

UPDATE tools SET
    l5_id = 'L5-PH',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_privacy',
    rate_limit_per_minute = 50,
    cache_ttl_seconds = 0,
    cost_per_call = 0.0002,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "privacy", "handler": "_execute_philter", "tool_class": "PrivacyL5Tool"}'
    )
WHERE slug = 'philter';

UPDATE tools SET
    l5_id = 'L5-AX',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_privacy',
    rate_limit_per_minute = 20,
    cache_ttl_seconds = 0,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "privacy", "handler": "_execute_arx", "tool_class": "PrivacyL5Tool"}'
    )
WHERE slug = 'arx-anonymization';

UPDATE tools SET
    l5_id = 'L5-ND',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_privacy',
    rate_limit_per_minute = 50,
    cache_ttl_seconds = 0,
    cost_per_call = 0.0002,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "privacy", "handler": "_execute_ner_deid", "tool_class": "PrivacyL5Tool"}'
    )
WHERE slug = 'ner-deid';

-- RWE Tools
UPDATE tools SET
    l5_id = 'L5-OM',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_rwe',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 3600,
    cost_per_call = 0.005,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "rwe", "handler": "_execute_omop", "tool_class": "RWEL5Tool"}'
    )
WHERE slug = 'omop-cdm';

UPDATE tools SET
    l5_id = 'L5-HD',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_rwe',
    rate_limit_per_minute = 5,
    cache_ttl_seconds = 7200,
    cost_per_call = 0.01,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "rwe", "handler": "_execute_hades", "tool_class": "RWEL5Tool"}'
    )
WHERE slug = 'hades';

UPDATE tools SET
    l5_id = 'L5-AC',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_rwe',
    rate_limit_per_minute = 5,
    cache_ttl_seconds = 3600,
    cost_per_call = 0.005,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "rwe", "handler": "_execute_achilles", "tool_class": "RWEL5Tool"}'
    )
WHERE slug = 'achilles';

UPDATE tools SET
    l5_id = 'L5-CD',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_rwe',
    rate_limit_per_minute = 5,
    cache_ttl_seconds = 3600,
    cost_per_call = 0.005,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "rwe", "handler": "_execute_cohort_diagnostics", "tool_class": "RWEL5Tool"}'
    )
WHERE slug = 'cohort-diagnostics';

UPDATE tools SET
    l5_id = 'L5-WR',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_rwe',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 1800,
    cost_per_call = 0.002,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "rwe", "handler": "_execute_white_rabbit", "tool_class": "RWEL5Tool"}'
    )
WHERE slug = 'white-rabbit';

UPDATE tools SET
    l5_id = 'L5-RH',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_rwe',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 1800,
    cost_per_call = 0.002,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "rwe", "handler": "_execute_rabbit_in_a_hat", "tool_class": "RWEL5Tool"}'
    )
WHERE slug = 'rabbit-in-a-hat';

-- Bioinformatics Tools
UPDATE tools SET
    l5_id = 'L5-BL',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_bioinformatics',
    rate_limit_per_minute = 3,
    cache_ttl_seconds = 86400,
    cost_per_call = 0.01,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "bioinformatics", "handler": "_execute_blast", "tool_class": "BioinfoL5Tool"}'
    )
WHERE slug = 'blast';

UPDATE tools SET
    l5_id = 'L5-BP',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_bioinformatics',
    rate_limit_per_minute = 100,
    cache_ttl_seconds = 600,
    cost_per_call = 0.0001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "bioinformatics", "handler": "_execute_biopython", "tool_class": "BioinfoL5Tool"}'
    )
WHERE slug = 'biopython';

UPDATE tools SET
    l5_id = 'L5-GK',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_bioinformatics',
    rate_limit_per_minute = 5,
    cache_ttl_seconds = 3600,
    cost_per_call = 0.02,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "bioinformatics", "handler": "_execute_gatk", "tool_class": "BioinfoL5Tool"}'
    )
WHERE slug = 'gatk';

UPDATE tools SET
    l5_id = 'L5-EN',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_bioinformatics',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 7200,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "bioinformatics", "handler": "_execute_ensembl", "tool_class": "BioinfoL5Tool"}'
    )
WHERE slug = 'ensembl';

UPDATE tools SET
    l5_id = 'L5-ST',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_bioinformatics',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 7200,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "bioinformatics", "handler": "_execute_string", "tool_class": "BioinfoL5Tool"}'
    )
WHERE slug = 'string-db';

UPDATE tools SET
    l5_id = 'L5-CY',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_bioinformatics',
    rate_limit_per_minute = 20,
    cache_ttl_seconds = 3600,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "bioinformatics", "handler": "_execute_cytoscape", "tool_class": "BioinfoL5Tool"}'
    )
WHERE slug = 'cytoscape';

-- Digital Health Tools
UPDATE tools SET
    l5_id = 'L5-HK',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_digital_health',
    rate_limit_per_minute = 60,
    cache_ttl_seconds = 300,
    cost_per_call = 0.0001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "digital_health", "handler": "_execute_healthkit", "tool_class": "DigitalHealthL5Tool"}'
    )
WHERE slug = 'apple-healthkit';

UPDATE tools SET
    l5_id = 'L5-HC',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_digital_health',
    rate_limit_per_minute = 60,
    cache_ttl_seconds = 300,
    cost_per_call = 0.0001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "digital_health", "handler": "_execute_health_connect", "tool_class": "DigitalHealthL5Tool"}'
    )
WHERE slug = 'google-health-connect';

UPDATE tools SET
    l5_id = 'L5-RK',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_digital_health',
    rate_limit_per_minute = 30,
    cache_ttl_seconds = 600,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "digital_health", "handler": "_execute_researchkit", "tool_class": "DigitalHealthL5Tool"}'
    )
WHERE slug = 'researchkit';

UPDATE tools SET
    l5_id = 'L5-RS',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_digital_health',
    rate_limit_per_minute = 30,
    cache_ttl_seconds = 600,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "digital_health", "handler": "_execute_researchstack", "tool_class": "DigitalHealthL5Tool"}'
    )
WHERE slug = 'researchstack';

UPDATE tools SET
    l5_id = 'L5-FB',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_digital_health',
    rate_limit_per_minute = 30,
    cache_ttl_seconds = 300,
    cost_per_call = 0.002,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "digital_health", "handler": "_execute_fitbit", "tool_class": "DigitalHealthL5Tool"}'
    )
WHERE slug = 'fitbit-api';

UPDATE tools SET
    l5_id = 'L5-TR',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_digital_health',
    rate_limit_per_minute = 30,
    cache_ttl_seconds = 300,
    cost_per_call = 0.005,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "digital_health", "handler": "_execute_terra", "tool_class": "DigitalHealthL5Tool"}'
    )
WHERE slug = 'terra-api';

UPDATE tools SET
    l5_id = 'L5-MH',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_digital_health',
    rate_limit_per_minute = 20,
    cache_ttl_seconds = 600,
    cost_per_call = 0.003,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "digital_health", "handler": "_execute_mydatahelps", "tool_class": "DigitalHealthL5Tool"}'
    )
WHERE slug = 'mydatahelps';

UPDATE tools SET
    l5_id = 'L5-SB',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_digital_health',
    rate_limit_per_minute = 20,
    cache_ttl_seconds = 600,
    cost_per_call = 0.002,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "digital_health", "handler": "_execute_sage_bridge", "tool_class": "DigitalHealthL5Tool"}'
    )
WHERE slug = 'sage-bridge';

-- HEOR Tools
UPDATE tools SET
    l5_id = 'L5-CM',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_heor',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 86400,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "heor", "handler": "_execute_cms_medicare", "tool_class": "HEORL5Tool"}'
    )
WHERE slug = 'cms-medicare-data';

UPDATE tools SET
    l5_id = 'L5-NC',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_heor',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 86400,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "heor", "handler": "_execute_nice_dsu", "tool_class": "HEORL5Tool"}'
    )
WHERE slug = 'nice-dsu-templates';

UPDATE tools SET
    l5_id = 'L5-IQ',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_heor',
    rate_limit_per_minute = 5,
    cache_ttl_seconds = 3600,
    cost_per_call = 0.05,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "heor", "handler": "_execute_iqvia_heor", "tool_class": "HEORL5Tool"}'
    )
WHERE slug = 'iqvia-heor';

UPDATE tools SET
    l5_id = 'L5-SA',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_heor',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 1800,
    cost_per_call = 0.01,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "heor", "handler": "_execute_stata", "tool_class": "HEORL5Tool"}'
    )
WHERE slug = 'stata-statistical-software';

UPDATE tools SET
    l5_id = 'L5-VA',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_heor',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 3600,
    cost_per_call = 0.02,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "heor", "handler": "_execute_visible_analytics", "tool_class": "HEORL5Tool"}'
    )
WHERE slug = 'visible-analytics';

UPDATE tools SET
    l5_id = 'L5-EX',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_heor',
    rate_limit_per_minute = 20,
    cache_ttl_seconds = 0,
    cost_per_call = 0.0001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "heor", "handler": "_execute_excel_heor", "tool_class": "HEORL5Tool"}'
    )
WHERE slug = 'excel-heor-models';

-- Statistics Tools
UPDATE tools SET
    l5_id = 'L5-RS',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_statistics',
    rate_limit_per_minute = 20,
    cache_ttl_seconds = 0,
    cost_per_call = 0.0001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "statistics", "handler": "_execute_r_stats", "tool_class": "StatisticsL5Tool"}'
    )
WHERE slug = 'r-statistical-software';

UPDATE tools SET
    l5_id = 'L5-SS',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_statistics',
    rate_limit_per_minute = 20,
    cache_ttl_seconds = 0,
    cost_per_call = 0.01,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "statistics", "handler": "_execute_spss", "tool_class": "StatisticsL5Tool"}'
    )
WHERE slug = 'ibm-spss-statistics';

-- Data Quality Tools
UPDATE tools SET
    l5_id = 'L5-GE',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_data_quality',
    rate_limit_per_minute = 30,
    cache_ttl_seconds = 600,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "data_quality", "handler": "_execute_great_expectations", "tool_class": "DataQualityL5Tool"}'
    )
WHERE slug = 'great-expectations';

UPDATE tools SET
    l5_id = 'L5-AF',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_data_quality',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 300,
    cost_per_call = 0.005,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "data_quality", "handler": "_execute_airflow", "tool_class": "DataQualityL5Tool"}'
    )
WHERE slug = 'apache-airflow';

UPDATE tools SET
    l5_id = 'L5-PP',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_data_quality',
    rate_limit_per_minute = 20,
    cache_ttl_seconds = 600,
    cost_per_call = 0.0005,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "data_quality", "handler": "_execute_pandas_profiling", "tool_class": "DataQualityL5Tool"}'
    )
WHERE slug = 'pandas-profiling';

-- Clinical Systems Tools
UPDATE tools SET
    l5_id = 'L5-MR',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_clinical_systems',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 1800,
    cost_per_call = 0.02,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "clinical_systems", "handler": "_execute_medidata_rave", "tool_class": "ClinicalSystemsL5Tool"}'
    )
WHERE slug = 'medidata-rave-edc';

UPDATE tools SET
    l5_id = 'L5-VC',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_clinical_systems',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 1800,
    cost_per_call = 0.02,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "clinical_systems", "handler": "_execute_veeva_ctms", "tool_class": "ClinicalSystemsL5Tool"}'
    )
WHERE slug = 'veeva-vault-ctms';

-- EHR Tools
UPDATE tools SET
    l5_id = 'L5-OE',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_ehr',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 600,
    cost_per_call = 0.002,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "ehr", "handler": "_execute_openemr", "tool_class": "EHRL5Tool"}'
    )
WHERE slug = 'openemr';

UPDATE tools SET
    l5_id = 'L5-OMS',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_ehr',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 600,
    cost_per_call = 0.002,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "ehr", "handler": "_execute_openmrs", "tool_class": "EHRL5Tool"}'
    )
WHERE slug = 'openmrs';

UPDATE tools SET
    l5_id = 'L5-SY',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_ehr',
    rate_limit_per_minute = 20,
    cache_ttl_seconds = 0,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "ehr", "handler": "_execute_synthea", "tool_class": "EHRL5Tool"}'
    )
WHERE slug = 'synthea';

UPDATE tools SET
    l5_id = 'L5-OH',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_ehr',
    rate_limit_per_minute = 20,
    cache_ttl_seconds = 600,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "ehr", "handler": "_execute_openhim", "tool_class": "EHRL5Tool"}'
    )
WHERE slug = 'openhim';

UPDATE tools SET
    l5_id = 'L5-EB',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_ehr',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 600,
    cost_per_call = 0.002,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "ehr", "handler": "_execute_ehrbase", "tool_class": "EHRL5Tool"}'
    )
WHERE slug = 'ehrbase';

-- Imaging Tools
UPDATE tools SET
    l5_id = 'L5-OI',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_imaging',
    rate_limit_per_minute = 20,
    cache_ttl_seconds = 300,
    cost_per_call = 0.005,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "imaging", "handler": "_execute_ohif", "tool_class": "ImagingL5Tool"}'
    )
WHERE slug = 'ohif-viewer';

UPDATE tools SET
    l5_id = 'L5-SL',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_imaging',
    rate_limit_per_minute = 10,
    cache_ttl_seconds = 600,
    cost_per_call = 0.01,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "imaging", "handler": "_execute_slicer_3d", "tool_class": "ImagingL5Tool"}'
    )
WHERE slug = '3d-slicer';

-- AI Framework Tools
UPDATE tools SET
    l5_id = 'L5-LI',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_ai_frameworks',
    rate_limit_per_minute = 50,
    cache_ttl_seconds = 300,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "ai_frameworks", "handler": "_execute_llamaindex", "tool_class": "AIFrameworksL5Tool"}'
    )
WHERE slug = 'llamaindex';

UPDATE tools SET
    l5_id = 'L5-SK',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_ai_frameworks',
    rate_limit_per_minute = 50,
    cache_ttl_seconds = 300,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "ai_frameworks", "handler": "_execute_semantic_kernel", "tool_class": "AIFrameworksL5Tool"}'
    )
WHERE slug = 'semantic-kernel';

UPDATE tools SET
    l5_id = 'L5-HS',
    implementation_status = 'implemented',
    python_module = 'modules.ask_expert.agents.l5_tools.ask_expert_l5_ai_frameworks',
    rate_limit_per_minute = 50,
    cache_ttl_seconds = 300,
    cost_per_call = 0.001,
    metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        '{l5_config}',
        '{"domain": "ai_frameworks", "handler": "_execute_haystack", "tool_class": "AIFrameworksL5Tool"}'
    )
WHERE slug = 'haystack';

-- =============================================================================
-- PART 3: CREATE INDEX FOR L5 LOOKUPS
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_tools_l5_id ON tools(l5_id);
CREATE INDEX IF NOT EXISTS idx_tools_implementation_status ON tools(implementation_status);
CREATE INDEX IF NOT EXISTS idx_tools_python_module ON tools(python_module);

-- =============================================================================
-- PART 4: ADD COMMENTS
-- =============================================================================

COMMENT ON COLUMN tools.l5_id IS 'L5 Tool identifier (e.g., L5-PM for PubMed)';
COMMENT ON COLUMN tools.implementation_status IS 'Status: pending, implemented, deprecated';
COMMENT ON COLUMN tools.python_module IS 'Python module path for L5 tool implementation';
COMMENT ON COLUMN tools.rate_limit_per_minute IS 'Maximum API calls per minute';
COMMENT ON COLUMN tools.cache_ttl_seconds IS 'Cache time-to-live in seconds (0 = no caching)';
COMMENT ON COLUMN tools.cost_per_call IS 'Estimated cost per API call in USD';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Show summary of L5 tool mappings
DO $$
DECLARE
    total_tools INTEGER;
    implemented_tools INTEGER;
    pending_tools INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tools FROM tools WHERE is_active = true;
    SELECT COUNT(*) INTO implemented_tools FROM tools WHERE implementation_status = 'implemented';
    SELECT COUNT(*) INTO pending_tools FROM tools WHERE implementation_status = 'pending' OR implementation_status IS NULL;
    
    RAISE NOTICE '=== L5 Tools Migration Summary ===';
    RAISE NOTICE 'Total active tools: %', total_tools;
    RAISE NOTICE 'Implemented: %', implemented_tools;
    RAISE NOTICE 'Pending: %', pending_tools;
    RAISE NOTICE 'Coverage: %', ROUND(implemented_tools::numeric / total_tools * 100, 1) || '%';
END $$;
