-- =====================================================================================
-- 36_ACADEMIC_MEDICAL_LITERATURE_TOOLS.SQL
-- =====================================================================================
-- Description: Add 12 Tier 1 academic and medical literature search tools
-- Date: November 3, 2025
-- Tools Added: Europe PMC, BASE, CORE, NIH Reporter, Dimensions, Lens.org,
--               TRIP Database, bioRxiv, medRxiv, OpenCitations, Crossref,
--               Retraction Watch
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
    -- CATEGORY 1: MEDICAL & CLINICAL DATABASES (5 tools)
    -- =====================================================================================

    -- 1. Europe PMC
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-europe_pmc',
        'TOOL-SEARCH-EUROPE_PMC',
        'Europe PMC',
        'Search Europe PMC for biomedical and life sciences literature. Access to 40M+ abstracts and 8M+ full-text articles from European and international sources.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsGetTool',
        'search_europe_pmc',
        true,
        'europe_pmc_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'query', jsonb_build_object('type', 'string', 'description', 'Search query for biomedical literature'),
                'result_type', jsonb_build_object('type', 'string', 'enum', jsonb_build_array('core', 'lite'), 'default', 'core'),
                'page_size', jsonb_build_object('type', 'integer', 'default', 25, 'maximum', 1000)
            ),
            'required', jsonb_build_array('query')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'results', jsonb_build_object('type', 'array', 'description', 'List of matching articles'),
                'hit_count', jsonb_build_object('type', 'integer', 'description', 'Total number of results')
            )
        ),
        true,
        30,
        60,
        0.0000,
        'production',
        true,
        'https://europepmc.org/RestfulWebService',
        jsonb_build_object(
            'example', 'Search for "digital therapeutics clinical trials"',
            'curl', 'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=digital%20therapeutics&format=json'
        ),
        ARRAY[]::text[],
        'public',
        ARRAY['full_text_search', 'biomedical_literature', 'citations', 'patents', 'guidelines'],
        jsonb_build_object(
            'source', 'European Bioinformatics Institute',
            'coverage', '40M+ abstracts, 8M+ full-text',
            'api_base_url', 'https://www.ebi.ac.uk/europepmc/webservices/rest',
            'authentication', 'none',
            'rate_limit', 'none'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    -- 2. NIH Reporter
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-nih_reporter',
        'TOOL-SEARCH-NIH_REPORTER',
        'NIH Reporter',
        'Search NIH-funded research projects and publications. Access to 2M+ projects, $1.6T in funding data, PI information, and project outcomes.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsPostTool',
        'search_nih_reporter',
        true,
        'nih_reporter_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'query', jsonb_build_object('type', 'string', 'description', 'Search query for NIH projects'),
                'criteria', jsonb_build_object(
                    'type', 'object',
                    'properties', jsonb_build_object(
                        'fiscal_years', jsonb_build_object('type', 'array', 'items', jsonb_build_object('type', 'integer')),
                        'agencies', jsonb_build_object('type', 'array', 'items', jsonb_build_object('type', 'string'))
                    )
                ),
                'limit', jsonb_build_object('type', 'integer', 'default', 25, 'maximum', 500)
            ),
            'required', jsonb_build_array('query')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'results', jsonb_build_object('type', 'array', 'description', 'List of NIH projects'),
                'total', jsonb_build_object('type', 'integer', 'description', 'Total number of results')
            )
        ),
        true,
        30,
        60,
        0.0000,
        'production',
        true,
        'https://api.reporter.nih.gov/',
        jsonb_build_object(
            'example', 'Search for "digital health" projects funded in 2023',
            'curl', 'https://api.reporter.nih.gov/v2/projects/search'
        ),
        ARRAY[]::text[],
        'public',
        ARRAY['grant_search', 'funding_data', 'pi_information', 'project_outcomes'],
        jsonb_build_object(
            'source', 'National Institutes of Health',
            'coverage', '2M+ projects, $1.6T funding',
            'api_base_url', 'https://api.reporter.nih.gov/v2',
            'authentication', 'none',
            'rate_limit', 'none'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    -- 3. TRIP Database
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-trip_database',
        'TOOL-SEARCH-TRIP_DATABASE',
        'TRIP Database',
        'Evidence-based medicine search engine. Search clinical articles, systematic reviews, clinical practice guidelines with evidence quality filters.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsGetTool',
        'search_trip_database',
        true,
        'trip_database_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'query', jsonb_build_object('type', 'string', 'description', 'Clinical search query'),
                'criteria', jsonb_build_object(
                    'type', 'string',
                    'enum', jsonb_build_array('systematic_reviews', 'guidelines', 'primary_research', 'all'),
                    'default', 'all'
                )
            ),
            'required', jsonb_build_array('query')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'results', jsonb_build_object('type', 'array', 'description', 'Evidence-based clinical articles'),
                'evidence_quality', jsonb_build_object('type', 'string', 'description', 'Quality rating of evidence')
            )
        ),
        true,
        30,
        30,
        0.0000,
        'production',
        true,
        'https://www.tripdatabase.com/info/about',
        jsonb_build_object(
            'example', 'Search for "diabetes management guidelines"',
            'use_case', 'Clinical decision support, evidence-based practice'
        ),
        ARRAY[]::text[],
        'public',
        ARRAY['evidence_based_medicine', 'clinical_guidelines', 'systematic_reviews', 'quality_filters'],
        jsonb_build_object(
            'source', 'TRIP Database Ltd',
            'focus', 'Evidence-based medicine',
            'unique_features', 'Evidence quality filters, clinical focus'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    -- 4. bioRxiv
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-biorxiv',
        'TOOL-SEARCH-BIORXIV',
        'bioRxiv',
        'Preprint server for biology. Access to 250K+ biology preprints with early access to research, peer-reviewed comments, and version control.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsGetTool',
        'search_biorxiv',
        true,
        'biorxiv_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'query', jsonb_build_object('type', 'string', 'description', 'Search query for biology preprints'),
                'from_date', jsonb_build_object('type', 'string', 'format', 'date', 'description', 'Filter by publication date'),
                'limit', jsonb_build_object('type', 'integer', 'default', 30, 'maximum', 100)
            ),
            'required', jsonb_build_array('query')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'results', jsonb_build_object('type', 'array', 'description', 'List of biology preprints'),
                'total', jsonb_build_object('type', 'integer', 'description', 'Total number of results')
            )
        ),
        true,
        30,
        60,
        0.0000,
        'production',
        true,
        'https://www.biorxiv.org/content/early/recent',
        jsonb_build_object(
            'example', 'Search for "digital biomarkers" preprints',
            'curl', 'https://api.biorxiv.org/details/biorxiv/2023-01-01/2023-12-31'
        ),
        ARRAY[]::text[],
        'public',
        ARRAY['preprints', 'early_research', 'version_control', 'peer_comments'],
        jsonb_build_object(
            'source', 'Cold Spring Harbor Laboratory',
            'coverage', '250K+ biology preprints',
            'api_base_url', 'https://api.biorxiv.org',
            'authentication', 'none',
            'rate_limit', 'none'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    -- 5. medRxiv
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-medrxiv',
        'TOOL-SEARCH-MEDRXIV',
        'medRxiv',
        'Preprint server for clinical and health sciences. Access to 50K+ clinical preprints screened for clinical content with early findings.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsGetTool',
        'search_medrxiv',
        true,
        'medrxiv_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'query', jsonb_build_object('type', 'string', 'description', 'Search query for clinical preprints'),
                'from_date', jsonb_build_object('type', 'string', 'format', 'date', 'description', 'Filter by publication date'),
                'limit', jsonb_build_object('type', 'integer', 'default', 30, 'maximum', 100)
            ),
            'required', jsonb_build_array('query')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'results', jsonb_build_object('type', 'array', 'description', 'List of clinical preprints'),
                'total', jsonb_build_object('type', 'integer', 'description', 'Total number of results')
            )
        ),
        true,
        30,
        60,
        0.0000,
        'production',
        true,
        'https://www.medrxiv.org/content/early/recent',
        jsonb_build_object(
            'example', 'Search for "digital therapeutics efficacy" preprints',
            'curl', 'https://api.medrxiv.org/details/medrxiv/2023-01-01/2023-12-31'
        ),
        ARRAY[]::text[],
        'public',
        ARRAY['clinical_preprints', 'early_findings', 'screened_content', 'health_sciences'],
        jsonb_build_object(
            'source', 'Cold Spring Harbor Laboratory',
            'coverage', '50K+ clinical preprints',
            'api_base_url', 'https://api.medrxiv.org',
            'authentication', 'none',
            'rate_limit', 'none'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    -- =====================================================================================
    -- CATEGORY 2: OPEN ACCESS & DISCOVERY (4 tools)
    -- =====================================================================================

    -- 6. BASE (Bielefeld Academic Search Engine)
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-base',
        'TOOL-SEARCH-BASE',
        'BASE',
        'Bielefeld Academic Search Engine. Multi-disciplinary search for academic web resources with 350M+ documents from 10,000+ sources.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsGetTool',
        'search_base',
        true,
        'base_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'query', jsonb_build_object('type', 'string', 'description', 'Search query for academic resources'),
                'doc_type', jsonb_build_object(
                    'type', 'string',
                    'enum', jsonb_build_array('all', '1', '121', '122'),
                    'description', '1=article, 121=book, 122=conference, all=everything'
                ),
                'hits', jsonb_build_object('type', 'integer', 'default', 10, 'maximum', 125)
            ),
            'required', jsonb_build_array('query')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'results', jsonb_build_object('type', 'array', 'description', 'List of academic documents'),
                'num_found', jsonb_build_object('type', 'integer', 'description', 'Total number of results')
            )
        ),
        true,
        30,
        60,
        0.0000,
        'production',
        true,
        'https://www.base-search.net/about/en/',
        jsonb_build_object(
            'example', 'Search for "machine learning healthcare"',
            'url', 'https://api.base-search.net/cgi-bin/BaseHttpSearchInterface.fcgi'
        ),
        ARRAY[]::text[],
        'public',
        ARRAY['multi_disciplinary', 'open_access', 'metadata_harvesting', 'academic_web'],
        jsonb_build_object(
            'source', 'Bielefeld University Library',
            'coverage', '350M+ documents from 10,000+ sources',
            'api_base_url', 'https://api.base-search.net',
            'authentication', 'none',
            'protocol', 'OAI-PMH'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    -- 7. CORE
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-core',
        'TOOL-SEARCH-CORE',
        'CORE',
        'COnnecting REpositories. World''s largest collection of open access research papers with 240M+ articles, full-text access, and metadata enrichment.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsGetTool',
        'search_core',
        true,
        'core_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'query', jsonb_build_object('type', 'string', 'description', 'Search query for open access papers'),
                'page', jsonb_build_object('type', 'integer', 'default', 1),
                'page_size', jsonb_build_object('type', 'integer', 'default', 10, 'maximum', 100)
            ),
            'required', jsonb_build_array('query')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'results', jsonb_build_object('type', 'array', 'description', 'List of open access articles'),
                'total_hits', jsonb_build_object('type', 'integer', 'description', 'Total number of results')
            )
        ),
        true,
        30,
        10,
        0.0000,
        'production',
        true,
        'https://core.ac.uk/services/api',
        jsonb_build_object(
            'example', 'Search for "digital health interventions"',
            'note', 'Requires free API key (10,000 requests/day)'
        ),
        ARRAY['CORE_API_KEY'],
        'public',
        ARRAY['open_access', 'full_text', 'deduplication', 'metadata_enrichment'],
        jsonb_build_object(
            'source', 'The Open University',
            'coverage', '240M+ open access articles',
            'api_base_url', 'https://api.core.ac.uk/v3',
            'authentication', 'api_key',
            'rate_limit', '10,000/day'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    -- 8. Dimensions
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-dimensions',
        'TOOL-SEARCH-DIMENSIONS',
        'Dimensions',
        'Free research database with citations, grants, and patents. Access to 130M+ publications, 6M+ grants, altmetrics, and policy documents.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsPostTool',
        'search_dimensions',
        true,
        'dimensions_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'query', jsonb_build_object('type', 'string', 'description', 'DSL search query'),
                'return_type', jsonb_build_object(
                    'type', 'string',
                    'enum', jsonb_build_array('publications', 'grants', 'patents', 'clinical_trials'),
                    'default', 'publications'
                ),
                'limit', jsonb_build_object('type', 'integer', 'default', 20, 'maximum', 1000)
            ),
            'required', jsonb_build_array('query')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'results', jsonb_build_object('type', 'array', 'description', 'Search results'),
                'total_count', jsonb_build_object('type', 'integer', 'description', 'Total number of results')
            )
        ),
        true,
        30,
        30,
        0.0000,
        'production',
        true,
        'https://docs.dimensions.ai/dsl/',
        jsonb_build_object(
            'example', 'Search for publications with grants data',
            'note', 'Free tier available, API key required'
        ),
        ARRAY['DIMENSIONS_API_KEY'],
        'public',
        ARRAY['publications', 'grants', 'patents', 'clinical_trials', 'altmetrics', 'policy_documents'],
        jsonb_build_object(
            'source', 'Digital Science',
            'coverage', '130M+ publications, 6M+ grants',
            'api_base_url', 'https://app.dimensions.ai/api',
            'authentication', 'api_key',
            'rate_limit', 'varies by tier'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    -- 9. Lens.org
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-lens',
        'TOOL-SEARCH-LENS',
        'Lens.org',
        'Free global patent and scholarly literature search. Access to 250M+ scholarly works and 130M+ patents with patent-literature connections.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsPostTool',
        'search_lens',
        true,
        'lens_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'query', jsonb_build_object('type', 'string', 'description', 'Search query for patents and literature'),
                'search_type', jsonb_build_object(
                    'type', 'string',
                    'enum', jsonb_build_array('scholarly', 'patent', 'both'),
                    'default', 'scholarly'
                ),
                'size', jsonb_build_object('type', 'integer', 'default', 20, 'maximum', 1000)
            ),
            'required', jsonb_build_array('query')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'results', jsonb_build_object('type', 'array', 'description', 'Patents and/or scholarly works'),
                'total', jsonb_build_object('type', 'integer', 'description', 'Total number of results')
            )
        ),
        true,
        30,
        10,
        0.0000,
        'production',
        true,
        'https://www.lens.org/lens/search/scholar/api',
        jsonb_build_object(
            'example', 'Search for "digital health" patents and papers',
            'note', 'Free API access, 10,000 requests/month'
        ),
        ARRAY['LENS_API_KEY'],
        'public',
        ARRAY['patents', 'scholarly_literature', 'patent_citations', 'citation_analysis'],
        jsonb_build_object(
            'source', 'Cambia',
            'coverage', '250M+ scholarly works, 130M+ patents',
            'api_base_url', 'https://api.lens.org',
            'authentication', 'api_key',
            'rate_limit', '10,000/month'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    -- =====================================================================================
    -- CATEGORY 3: CITATION & QUALITY CONTROL (3 tools)
    -- =====================================================================================

    -- 10. OpenCitations
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-opencitations',
        'TOOL-SEARCH-OPENCITATIONS',
        'OpenCitations',
        'Open database of scholarly citation data. Access to 1.4B+ citations for network analysis, impact assessment, and bibliometrics.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsGetTool',
        'search_opencitations',
        true,
        'opencitations_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'doi', jsonb_build_object('type', 'string', 'description', 'DOI of the publication'),
                'query_type', jsonb_build_object(
                    'type', 'string',
                    'enum', jsonb_build_array('references', 'citations', 'metadata'),
                    'default', 'citations'
                )
            ),
            'required', jsonb_build_array('doi')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'citations', jsonb_build_object('type', 'array', 'description', 'List of citations'),
                'count', jsonb_build_object('type', 'integer', 'description', 'Citation count')
            )
        ),
        true,
        30,
        60,
        0.0000,
        'production',
        true,
        'https://opencitations.net/index/coci/api/v1',
        jsonb_build_object(
            'example', 'Get citations for DOI 10.1038/nature12373',
            'curl', 'https://opencitations.net/index/coci/api/v1/citations/10.1038/nature12373'
        ),
        ARRAY[]::text[],
        'public',
        ARRAY['citation_data', 'network_analysis', 'impact_assessment', 'bibliometrics'],
        jsonb_build_object(
            'source', 'OpenCitations',
            'coverage', '1.4B+ citations',
            'api_base_url', 'https://opencitations.net/index/api/v1',
            'authentication', 'none',
            'rate_limit', 'none'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    -- 11. Crossref
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-crossref',
        'TOOL-SEARCH-CROSSREF',
        'Crossref',
        'Citation linking and metadata for scholarly works. Access to 140M+ metadata records, DOI resolution, and citation tracking.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsGetTool',
        'search_crossref',
        true,
        'crossref_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'query', jsonb_build_object('type', 'string', 'description', 'Search query or DOI'),
                'query_type', jsonb_build_object(
                    'type', 'string',
                    'enum', jsonb_build_array('works', 'journals', 'funders', 'members'),
                    'default', 'works'
                ),
                'rows', jsonb_build_object('type', 'integer', 'default', 20, 'maximum', 1000)
            ),
            'required', jsonb_build_array('query')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'results', jsonb_build_object('type', 'array', 'description', 'Metadata records'),
                'total_results', jsonb_build_object('type', 'integer', 'description', 'Total number of results')
            )
        ),
        true,
        30,
        50,
        0.0000,
        'production',
        true,
        'https://www.crossref.org/documentation/retrieve-metadata/rest-api/',
        jsonb_build_object(
            'example', 'Search for works about "machine learning"',
            'curl', 'https://api.crossref.org/works?query=machine+learning'
        ),
        ARRAY[]::text[],
        'public',
        ARRAY['doi_resolution', 'metadata', 'citation_tracking', 'journal_info'],
        jsonb_build_object(
            'source', 'Crossref',
            'coverage', '140M+ metadata records',
            'api_base_url', 'https://api.crossref.org',
            'authentication', 'none (polite pool recommended)',
            'rate_limit', '50/second'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    -- 12. Retraction Watch
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, langgraph_node_name,
        input_schema, output_schema,
        is_async, max_execution_time_seconds, rate_limit_per_minute,
        cost_per_execution, lifecycle_stage, is_active,
        documentation_url, example_usage,
        required_env_vars, access_level, capabilities, metadata
    ) VALUES (
        v_tenant_id,
        'TL-SEARCH-retraction_watch',
        'TOOL-SEARCH-RETRACTION_WATCH',
        'Retraction Watch',
        'Database of retracted scientific papers. Access to 40K+ retractions with notices, reasons for retraction, and research integrity data.',
        'Research',
        'ai_function',
        'langchain_tool',
        'langchain_community.tools.requests.tool.RequestsGetTool',
        'search_retraction_watch',
        true,
        'retraction_watch_search_node',
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'query', jsonb_build_object('type', 'string', 'description', 'Search for retracted papers'),
                'field', jsonb_build_object(
                    'type', 'string',
                    'enum', jsonb_build_array('title', 'author', 'journal', 'all'),
                    'default', 'all'
                )
            ),
            'required', jsonb_build_array('query')
        ),
        jsonb_build_object(
            'type', 'object',
            'properties', jsonb_build_object(
                'results', jsonb_build_object('type', 'array', 'description', 'Retracted papers'),
                'retraction_reason', jsonb_build_object('type', 'string', 'description', 'Reason for retraction')
            )
        ),
        true,
        30,
        30,
        0.0000,
        'production',
        true,
        'http://retractiondatabase.org/RetractionSearch.aspx',
        jsonb_build_object(
            'example', 'Check if papers on "cancer treatment" have been retracted',
            'use_case', 'Quality control, research integrity verification'
        ),
        ARRAY['RETRACTION_WATCH_API_KEY'],
        'public',
        ARRAY['retraction_notices', 'research_integrity', 'quality_control', 'error_detection'],
        jsonb_build_object(
            'source', 'The Center for Scientific Integrity',
            'coverage', '40K+ retractions',
            'api_access', 'API key required (free for non-commercial)',
            'rate_limit', 'varies'
        )
    ) ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
        name = EXCLUDED.name,
        tool_description = EXCLUDED.tool_description,
        implementation_type = EXCLUDED.implementation_type,
        lifecycle_stage = EXCLUDED.lifecycle_stage,
        updated_at = NOW();

    RAISE NOTICE '✅ Successfully added 12 Tier 1 academic and medical literature search tools';
END $$;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Count new tools
SELECT 
    '✅ NEW TOOLS ADDED' as status,
    COUNT(*) as tool_count
FROM dh_tool
WHERE unique_id IN (
    'TL-SEARCH-europe_pmc', 'TL-SEARCH-nih_reporter', 'TL-SEARCH-trip_database',
    'TL-SEARCH-biorxiv', 'TL-SEARCH-medrxiv', 'TL-SEARCH-base',
    'TL-SEARCH-core', 'TL-SEARCH-dimensions', 'TL-SEARCH-lens',
    'TL-SEARCH-opencitations', 'TL-SEARCH-crossref', 'TL-SEARCH-retraction_watch'
);

-- Show all literature search tools
SELECT 
    unique_id,
    name,
    category,
    implementation_type,
    lifecycle_stage,
    CASE 
        WHEN implementation_type = 'langchain_tool' THEN '🔗 LangChain'
        ELSE '🔧 Custom'
    END as badge
FROM dh_tool
WHERE category = 'Research'
    AND tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
ORDER BY lifecycle_stage, name;

-- Summary statistics
SELECT 
    '📊 RESEARCH TOOLS SUMMARY' as summary,
    COUNT(*) as total_tools,
    COUNT(*) FILTER (WHERE implementation_type = 'langchain_tool') as langchain_tools,
    COUNT(*) FILTER (WHERE lifecycle_stage = 'production') as production_tools
FROM dh_tool
WHERE category = 'Research'
    AND tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1);

