-- ============================================================================
-- Comprehensive Tools Seed - ALL VITAL AI Platform Tools
-- Date: 2025-11-02
-- Purpose: Seed all available tools including external API integrations
-- ============================================================================

-- Drop existing tools if re-seeding
-- DELETE FROM tools WHERE tool_code IN ('web_search', 'web_scraper', 'rag_search', 'calculator', 'python_executor');

-- ============================================================================
-- 1. WEB SEARCH & SCRAPING TOOLS
-- ============================================================================

INSERT INTO tools (
  tool_code, tool_name, tool_description, category, subcategory,
  implementation_type, implementation_path, function_name,
  input_schema, output_schema, required_env_vars,
  is_async, max_execution_time_seconds, rate_limit_per_minute, cost_per_execution,
  langgraph_compatible, langgraph_node_name, status, version, access_level, tags, example_usage
) VALUES
-- Tavily Web Search
(
  'web_search', 'Web Search (Tavily)', 
  'Search the web for real-time information using Tavily API. Returns relevant web pages with content snippets, URLs, and relevance scores.',
  'web', 'search', 'python_function', 'tools.web_tools', 'web_search',
  '{"type":"object","properties":{"query":{"type":"string"},"max_results":{"type":"integer","default":5},"search_depth":{"type":"string","enum":["basic","advanced"]}},"required":["query"]}'::jsonb,
  '{"type":"object","properties":{"results":{"type":"array"},"query":{"type":"string"},"total_results":{"type":"integer"}}}'::jsonb,
  ARRAY['TAVILY_API_KEY'], TRUE, 30, 60, 0.0010,
  TRUE, 'web_search_node', 'active', '1.0.0', 'public',
  ARRAY['web', 'search', 'research', 'real-time'],
  '{"example":{"input":{"query":"Latest AI developments","max_results":5}}}'::jsonb
),
-- Web Scraper
(
  'web_scraper', 'Web Page Scraper',
  'Extract and parse content from web pages. Returns cleaned text, metadata, and structured data.',
  'web', 'scraping', 'python_function', 'tools.web_tools', 'web_scraper',
  '{"type":"object","properties":{"url":{"type":"string","format":"uri"},"extract_links":{"type":"boolean","default":false},"extract_images":{"type":"boolean","default":false}},"required":["url"]}'::jsonb,
  '{"type":"object","properties":{"url":{"type":"string"},"title":{"type":"string"},"content":{"type":"string"},"word_count":{"type":"integer"}}}'::jsonb,
  ARRAY[]::TEXT[], TRUE, 45, 30, 0.0005,
  TRUE, 'web_scraper_node', 'active', '1.0.0', 'public',
  ARRAY['web', 'scraping', 'extraction'],
  '{"example":{"input":{"url":"https://example.com","extract_links":true}}}'::jsonb
)
ON CONFLICT (tool_code) DO UPDATE SET updated_at = now();

-- ============================================================================
-- 2. MEDICAL & SCIENTIFIC RESEARCH TOOLS
-- ============================================================================

INSERT INTO tools (
  tool_code, tool_name, tool_description, category, subcategory,
  implementation_type, implementation_path, function_name,
  input_schema, output_schema, required_env_vars,
  is_async, max_execution_time_seconds, rate_limit_per_minute, cost_per_execution,
  langgraph_compatible, langgraph_node_name, status, version, access_level, tags, example_usage
) VALUES
-- PubMed Search
(
  'pubmed_search', 'PubMed Medical Research Search',
  'Search PubMed database for medical research papers, clinical studies, and biomedical literature. Free access to 30+ million citations.',
  'medical', 'research', 'python_function', 'tools.medical_tools', 'pubmed_search',
  '{"type":"object","properties":{"query":{"type":"string"},"max_results":{"type":"integer","default":10},"publication_types":{"type":"array","items":{"type":"string"}},"date_range":{"type":"object"}},"required":["query"]}'::jsonb,
  '{"type":"object","properties":{"results":{"type":"array","items":{"type":"object","properties":{"pmid":{"type":"string"},"title":{"type":"string"},"abstract":{"type":"string"},"authors":{"type":"array"},"journal":{"type":"string"},"publication_date":{"type":"string"},"doi":{"type":"string"}}}},"total_results":{"type":"integer"}}}'::jsonb,
  ARRAY[]::TEXT[], TRUE, 30, 100, 0.0000,  -- Free API
  TRUE, 'pubmed_search_node', 'active', '1.0.0', 'public',
  ARRAY['medical', 'research', 'pubmed', 'clinical', 'biomedical'],
  '{"example":{"input":{"query":"COVID-19 vaccine efficacy","max_results":10}}}'::jsonb
),
-- arXiv Search
(
  'arxiv_search', 'arXiv Scientific Papers Search',
  'Search arXiv.org for scientific papers in physics, mathematics, computer science, and more. Access to 2+ million preprints.',
  'web', 'research', 'python_function', 'tools.research_tools', 'arxiv_search',
  '{"type":"object","properties":{"query":{"type":"string"},"max_results":{"type":"integer","default":10},"categories":{"type":"array","items":{"type":"string"}},"sort_by":{"type":"string","enum":["relevance","lastUpdatedDate","submittedDate"]}},"required":["query"]}'::jsonb,
  '{"type":"object","properties":{"results":{"type":"array","items":{"type":"object","properties":{"arxiv_id":{"type":"string"},"title":{"type":"string"},"abstract":{"type":"string"},"authors":{"type":"array"},"categories":{"type":"array"},"published_date":{"type":"string"},"pdf_url":{"type":"string"}}}},"total_results":{"type":"integer"}}}'::jsonb,
  ARRAY[]::TEXT[], TRUE, 30, 100, 0.0000,  -- Free API
  TRUE, 'arxiv_search_node', 'active', '1.0.0', 'public',
  ARRAY['research', 'arxiv', 'scientific', 'papers', 'preprints'],
  '{"example":{"input":{"query":"large language models","max_results":10}}}'::jsonb
),
-- WHO Guidelines Search
(
  'who_guidelines', 'WHO Health Guidelines Search',
  'Search World Health Organization guidelines, recommendations, and health information. Official WHO database access.',
  'medical', 'guidelines', 'python_function', 'tools.medical_tools', 'who_guidelines_search',
  '{"type":"object","properties":{"query":{"type":"string"},"topics":{"type":"array","items":{"type":"string"}},"max_results":{"type":"integer","default":10}},"required":["query"]}'::jsonb,
  '{"type":"object","properties":{"results":{"type":"array","items":{"type":"object","properties":{"title":{"type":"string"},"url":{"type":"string"},"summary":{"type":"string"},"publication_date":{"type":"string"},"topics":{"type":"array"}}}},"total_results":{"type":"integer"}}}'::jsonb,
  ARRAY[]::TEXT[], TRUE, 30, 60, 0.0000,  -- Free API
  TRUE, 'who_guidelines_node', 'active', '1.0.0', 'public',
  ARRAY['medical', 'who', 'guidelines', 'health', 'recommendations'],
  '{"example":{"input":{"query":"diabetes treatment guidelines","max_results":5}}}'::jsonb
),
-- ClinicalTrials.gov Search
(
  'clinicaltrials_search', 'ClinicalTrials.gov Search',
  'Search ClinicalTrials.gov for ongoing and completed clinical trials. Access to 400,000+ clinical studies worldwide.',
  'medical', 'clinical_trials', 'python_function', 'tools.medical_tools', 'clinicaltrials_search',
  '{"type":"object","properties":{"condition":{"type":"string"},"intervention":{"type":"string"},"status":{"type":"array","items":{"type":"string"}},"max_results":{"type":"integer","default":20}}}'::jsonb,
  '{"type":"object","properties":{"results":{"type":"array","items":{"type":"object","properties":{"nct_id":{"type":"string"},"title":{"type":"string"},"status":{"type":"string"},"phase":{"type":"string"},"conditions":{"type":"array"},"interventions":{"type":"array"},"enrollment":{"type":"integer"},"sponsor":{"type":"string"}}}},"total_results":{"type":"integer"}}}'::jsonb,
  ARRAY[]::TEXT[], TRUE, 30, 60, 0.0000,
  TRUE, 'clinicaltrials_search_node', 'active', '1.0.0', 'public',
  ARRAY['medical', 'clinical_trials', 'research', 'fda'],
  '{"example":{"input":{"condition":"cancer","intervention":"immunotherapy","max_results":20}}}'::jsonb
),
-- FDA Drug Database
(
  'fda_drugs', 'FDA Drug Database Search',
  'Search FDA approved drugs, labels, and adverse events. Official FDA drugs@FDA database.',
  'medical', 'drugs', 'python_function', 'tools.medical_tools', 'fda_drugs_search',
  '{"type":"object","properties":{"drug_name":{"type":"string"},"active_ingredient":{"type":"string"},"application_type":{"type":"string"},"max_results":{"type":"integer","default":10}}}'::jsonb,
  '{"type":"object","properties":{"results":{"type":"array","items":{"type":"object","properties":{"application_number":{"type":"string"},"drug_name":{"type":"string"},"active_ingredient":{"type":"string"},"approval_date":{"type":"string"},"sponsor":{"type":"string"},"dosage_form":{"type":"string"}}}},"total_results":{"type":"integer"}}}'::jsonb,
  ARRAY[]::TEXT[], TRUE, 30, 60, 0.0000,
  TRUE, 'fda_drugs_node', 'active', '1.0.0', 'public',
  ARRAY['medical', 'fda', 'drugs', 'pharmaceutical', 'regulatory'],
  '{"example":{"input":{"drug_name":"aspirin","max_results":5}}}'::jsonb
)
ON CONFLICT (tool_code) DO UPDATE SET updated_at = now();

-- ============================================================================
-- 3. RAG & KNOWLEDGE BASE TOOLS
-- ============================================================================

INSERT INTO tools (
  tool_code, tool_name, tool_description, category, subcategory,
  implementation_type, implementation_path, function_name,
  input_schema, output_schema,
  is_async, max_execution_time_seconds, cost_per_execution,
  langgraph_compatible, langgraph_node_name, status, version, access_level, tags, example_usage
) VALUES
(
  'rag_search', 'RAG Knowledge Search',
  'Search the knowledge base using Retrieval-Augmented Generation. Returns relevant documents with citations.',
  'rag', 'search', 'python_function', 'services.unified_rag_service', 'query',
  '{"type":"object","properties":{"query":{"type":"string"},"strategy":{"type":"string","enum":["semantic","hybrid","agent-optimized","keyword"],"default":"hybrid"},"domain_ids":{"type":"array","items":{"type":"string"}},"max_results":{"type":"integer","default":10}},"required":["query"]}'::jsonb,
  '{"type":"object","properties":{"sources":{"type":"array"},"context":{"type":"string"},"metadata":{"type":"object"}}}'::jsonb,
  TRUE, 15, 0.0020,
  TRUE, 'rag_search_node', 'active', '1.0.0', 'authenticated',
  ARRAY['rag', 'knowledge', 'search', 'retrieval'],
  '{"example":{"input":{"query":"What are regulatory requirements?","strategy":"hybrid","max_results":10}}}'::jsonb
)
ON CONFLICT (tool_code) DO UPDATE SET updated_at = now();

-- ============================================================================
-- 4. COMPUTATION & CODE TOOLS
-- ============================================================================

INSERT INTO tools (
  tool_code, tool_name, tool_description, category, subcategory,
  implementation_type, implementation_path, function_name,
  input_schema, output_schema,
  is_async, max_execution_time_seconds, cost_per_execution,
  langgraph_compatible, langgraph_node_name, status, version, access_level, tags, example_usage
) VALUES
(
  'calculator', 'Calculator',
  'Perform mathematical calculations and evaluate expressions safely.',
  'computation', 'math', 'python_function', 'tools.computation_tools', 'calculator',
  '{"type":"object","properties":{"expression":{"type":"string"},"precision":{"type":"integer","default":2}},"required":["expression"]}'::jsonb,
  '{"type":"object","properties":{"result":{"type":"number"},"expression":{"type":"string"},"formatted_result":{"type":"string"}}}'::jsonb,
  FALSE, 5, 0.0001,
  TRUE, 'calculator_node', 'active', '1.0.0', 'public',
  ARRAY['math', 'calculation', 'computation'],
  '{"example":{"input":{"expression":"2 + 2 * 3","precision":2}}}'::jsonb
),
(
  'python_executor', 'Python Code Executor',
  'Execute Python code in a secure sandboxed environment. Useful for data analysis and computations.',
  'code', 'execution', 'python_function', 'tools.code_tools', 'execute_python',
  '{"type":"object","properties":{"code":{"type":"string"},"timeout":{"type":"integer","default":10},"allowed_imports":{"type":"array","items":{"type":"string"}}},"required":["code"]}'::jsonb,
  '{"type":"object","properties":{"output":{"type":"string"},"error":{"type":"string"},"execution_time_ms":{"type":"integer"},"success":{"type":"boolean"}}}'::jsonb,
  TRUE, 30, 0.0010,
  TRUE, 'python_executor_node', 'beta', '1.0.0', 'premium',
  ARRAY['code', 'python', 'execution', 'sandbox'],
  '{"example":{"input":{"code":"result = 2 + 2\\nprint(result)","timeout":5}}}'::jsonb
)
ON CONFLICT (tool_code) DO UPDATE SET updated_at = now();

-- ============================================================================
-- Display results
-- ============================================================================

DO $$
DECLARE
  tool_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tool_count FROM tools;
  RAISE NOTICE '✅ Seeded % tools in registry', tool_count;
END $$;

SELECT
  tool_code,
  tool_name,
  category,
  subcategory,
  status,
  langgraph_compatible,
  cost_per_execution,
  version
FROM tools
ORDER BY category, subcategory, tool_code;

