-- ============================================================================
-- Seed Core Tools for VITAL AI Platform
-- Date: 2025-11-02
-- Purpose: Populate tools registry with essential tools
-- ============================================================================

-- ============================================================================
-- 1. WEB TOOLS
-- ============================================================================

-- Tavily Web Search
INSERT INTO tools (
  tool_code,
  tool_name,
  tool_description,
  category,
  subcategory,
  implementation_type,
  implementation_path,
  function_name,
  input_schema,
  output_schema,
  required_env_vars,
  is_async,
  max_execution_time_seconds,
  rate_limit_per_minute,
  cost_per_execution,
  langgraph_compatible,
  langgraph_node_name,
  status,
  version,
  access_level,
  tags,
  example_usage
) VALUES (
  'web_search',
  'Web Search (Tavily)',
  'Search the web for real-time information using Tavily API. Returns relevant web pages with content snippets, URLs, and relevance scores.',
  'web',
  'search',
  'python_function',
  'tools.web_tools',
  'web_search',
  '{
    "type": "object",
    "properties": {
      "query": {"type": "string", "description": "Search query"},
      "max_results": {"type": "integer", "default": 5, "minimum": 1, "maximum": 20},
      "search_depth": {"type": "string", "enum": ["basic", "advanced"], "default": "basic"},
      "include_domains": {"type": "array", "items": {"type": "string"}},
      "exclude_domains": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["query"]
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "results": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "title": {"type": "string"},
            "url": {"type": "string"},
            "content": {"type": "string"},
            "score": {"type": "number"},
            "published_date": {"type": "string"}
          }
        }
      },
      "query": {"type": "string"},
      "total_results": {"type": "integer"}
    }
  }'::jsonb,
  ARRAY['TAVILY_API_KEY'],
  TRUE,
  30,
  60,
  0.0010,
  TRUE,
  'web_search_node',
  'active',
  '1.0.0',
  'public',
  ARRAY['web', 'search', 'research', 'real-time'],
  '{
    "example": {
      "input": {"query": "Latest AI developments", "max_results": 5},
      "output": {"results": [{"title": "...", "url": "...", "content": "..."}], "total_results": 5}
    }
  }'::jsonb
)
ON CONFLICT (tool_code) DO UPDATE SET
  updated_at = now();

-- Web Scraper
INSERT INTO tools (
  tool_code,
  tool_name,
  tool_description,
  category,
  subcategory,
  implementation_type,
  implementation_path,
  function_name,
  input_schema,
  output_schema,
  required_env_vars,
  is_async,
  max_execution_time_seconds,
  rate_limit_per_minute,
  cost_per_execution,
  langgraph_compatible,
  langgraph_node_name,
  status,
  version,
  access_level,
  tags,
  example_usage
) VALUES (
  'web_scraper',
  'Web Page Scraper',
  'Extract and parse content from web pages. Returns cleaned text, metadata, and structured data.',
  'web',
  'scraping',
  'python_function',
  'tools.web_tools',
  'web_scraper',
  '{
    "type": "object",
    "properties": {
      "url": {"type": "string", "format": "uri", "description": "URL to scrape"},
      "extract_links": {"type": "boolean", "default": false},
      "extract_images": {"type": "boolean", "default": false},
      "css_selector": {"type": "string", "description": "Optional CSS selector to target specific content"},
      "wait_for_js": {"type": "boolean", "default": false, "description": "Wait for JavaScript to execute"}
    },
    "required": ["url"]
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "url": {"type": "string"},
      "title": {"type": "string"},
      "content": {"type": "string"},
      "metadata": {"type": "object"},
      "links": {"type": "array", "items": {"type": "string"}},
      "images": {"type": "array", "items": {"type": "string"}},
      "word_count": {"type": "integer"},
      "scraped_at": {"type": "string", "format": "date-time"}
    }
  }'::jsonb,
  ARRAY[]::TEXT[],
  TRUE,
  45,
  30,
  0.0005,
  TRUE,
  'web_scraper_node',
  'active',
  '1.0.0',
  'public',
  ARRAY['web', 'scraping', 'extraction', 'parsing'],
  '{
    "example": {
      "input": {"url": "https://example.com/article", "extract_links": true},
      "output": {"title": "Article Title", "content": "...", "links": ["https://..."], "word_count": 1500}
    }
  }'::jsonb
)
ON CONFLICT (tool_code) DO UPDATE SET
  updated_at = now();

-- ============================================================================
-- 2. RAG TOOLS
-- ============================================================================

-- RAG Search
INSERT INTO tools (
  tool_code,
  tool_name,
  tool_description,
  category,
  subcategory,
  implementation_type,
  implementation_path,
  function_name,
  input_schema,
  output_schema,
  is_async,
  max_execution_time_seconds,
  cost_per_execution,
  langgraph_compatible,
  langgraph_node_name,
  status,
  version,
  access_level,
  tags,
  example_usage
) VALUES (
  'rag_search',
  'RAG Knowledge Search',
  'Search the knowledge base using Retrieval-Augmented Generation. Returns relevant documents with citations.',
  'rag',
  'search',
  'python_function',
  'services.unified_rag_service',
  'query',
  '{
    "type": "object",
    "properties": {
      "query": {"type": "string", "description": "Search query"},
      "strategy": {"type": "string", "enum": ["semantic", "hybrid", "agent-optimized", "keyword"], "default": "hybrid"},
      "domain_ids": {"type": "array", "items": {"type": "string"}},
      "max_results": {"type": "integer", "default": 10, "minimum": 1, "maximum": 50},
      "similarity_threshold": {"type": "number", "default": 0.7, "minimum": 0, "maximum": 1}
    },
    "required": ["query"]
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "sources": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "page_content": {"type": "string"},
            "metadata": {"type": "object"}
          }
        }
      },
      "context": {"type": "string"},
      "metadata": {"type": "object"}
    }
  }'::jsonb,
  TRUE,
  15,
  0.0020,
  TRUE,
  'rag_search_node',
  'active',
  '1.0.0',
  'authenticated',
  ARRAY['rag', 'knowledge', 'search', 'retrieval'],
  '{
    "example": {
      "input": {"query": "What are regulatory requirements?", "strategy": "hybrid", "max_results": 10},
      "output": {"sources": [...], "context": "...", "metadata": {"totalSources": 10, "cached": false}}
    }
  }'::jsonb
)
ON CONFLICT (tool_code) DO UPDATE SET
  updated_at = now();

-- ============================================================================
-- 3. COMPUTATION TOOLS
-- ============================================================================

-- Calculator
INSERT INTO tools (
  tool_code,
  tool_name,
  tool_description,
  category,
  subcategory,
  implementation_type,
  implementation_path,
  function_name,
  input_schema,
  output_schema,
  is_async,
  max_execution_time_seconds,
  cost_per_execution,
  langgraph_compatible,
  langgraph_node_name,
  status,
  version,
  access_level,
  tags,
  example_usage
) VALUES (
  'calculator',
  'Calculator',
  'Perform mathematical calculations and evaluate expressions safely.',
  'computation',
  'math',
  'python_function',
  'tools.computation_tools',
  'calculator',
  '{
    "type": "object",
    "properties": {
      "expression": {"type": "string", "description": "Mathematical expression to evaluate"},
      "precision": {"type": "integer", "default": 2, "minimum": 0, "maximum": 10}
    },
    "required": ["expression"]
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "result": {"type": "number"},
      "expression": {"type": "string"},
      "formatted_result": {"type": "string"}
    }
  }'::jsonb,
  FALSE,
  5,
  0.0001,
  TRUE,
  'calculator_node',
  'active',
  '1.0.0',
  'public',
  ARRAY['math', 'calculation', 'computation'],
  '{
    "example": {
      "input": {"expression": "2 + 2 * 3", "precision": 2},
      "output": {"result": 8.0, "expression": "2 + 2 * 3", "formatted_result": "8.00"}
    }
  }'::jsonb
)
ON CONFLICT (tool_code) DO UPDATE SET
  updated_at = now();

-- ============================================================================
-- 4. CODE EXECUTION TOOLS
-- ============================================================================

-- Python Code Executor (Sandboxed)
INSERT INTO tools (
  tool_code,
  tool_name,
  tool_description,
  category,
  subcategory,
  implementation_type,
  implementation_path,
  function_name,
  input_schema,
  output_schema,
  is_async,
  max_execution_time_seconds,
  cost_per_execution,
  langgraph_compatible,
  langgraph_node_name,
  status,
  version,
  access_level,
  tags,
  example_usage
) VALUES (
  'python_executor',
  'Python Code Executor',
  'Execute Python code in a secure sandboxed environment. Useful for data analysis and computations.',
  'code',
  'execution',
  'python_function',
  'tools.code_tools',
  'execute_python',
  '{
    "type": "object",
    "properties": {
      "code": {"type": "string", "description": "Python code to execute"},
      "timeout": {"type": "integer", "default": 10, "minimum": 1, "maximum": 30},
      "allowed_imports": {"type": "array", "items": {"type": "string"}, "default": ["math", "json", "datetime"]}
    },
    "required": ["code"]
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "output": {"type": "string"},
      "error": {"type": "string"},
      "execution_time_ms": {"type": "integer"},
      "success": {"type": "boolean"}
    }
  }'::jsonb,
  TRUE,
  30,
  0.0010,
  TRUE,
  'python_executor_node',
  'beta',
  '1.0.0',
  'premium',
  ARRAY['code', 'python', 'execution', 'sandbox'],
  '{
    "example": {
      "input": {"code": "result = 2 + 2\\nprint(result)", "timeout": 5},
      "output": {"output": "4", "error": null, "execution_time_ms": 12, "success": true}
    }
  }'::jsonb
)
ON CONFLICT (tool_code) DO UPDATE SET
  updated_at = now();

-- ============================================================================
-- 5. DISPLAY RESULTS
-- ============================================================================

-- Count inserted tools
DO $$
DECLARE
  tool_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tool_count FROM tools;
  RAISE NOTICE '✅ Seeded % tools in registry', tool_count;
END $$;

-- Display seeded tools
SELECT
  tool_code,
  tool_name,
  category,
  status,
  langgraph_compatible,
  version
FROM tools
ORDER BY category, tool_code;

