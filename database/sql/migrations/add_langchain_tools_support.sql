-- 🔄 Add LangChain Tools Support to VITAL AI Engine
-- Date: November 3, 2025
-- Purpose: Enable LangChain tool integration

-- ============================================================================
-- STEP 1: Add implementation_type column
-- ============================================================================

ALTER TABLE dh_tool 
ADD COLUMN IF NOT EXISTS implementation_type VARCHAR(50) DEFAULT 'custom'
CHECK (implementation_type IN ('custom', 'langchain_tool', 'api', 'function'));

COMMENT ON COLUMN dh_tool.implementation_type IS 
'Tool implementation type:
- custom: Our custom implementation
- langchain_tool: LangChain community tool
- api: External API wrapper
- function: Utility function';

-- ============================================================================
-- STEP 2: Update Phase 1 Tools (5 Quick Wins)
-- ============================================================================

-- Get tenant_id for digital-health-startup
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1;
    
    -- 1. Python Code Interpreter → Python REPL
    UPDATE dh_tool 
    SET 
        lifecycle_stage = 'production',
        implementation_type = 'langchain_tool',
        implementation_path = 'langchain_experimental.tools.python.tool.PythonREPLTool',
        function_name = 'PythonREPLTool',
        langgraph_compatible = true,
        updated_at = NOW(),
        metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{langchain}',
            '{"package": "langchain_experimental", "version": "0.0.50", "sandboxed": true}'::jsonb
        )
    WHERE unique_id = 'TL-CODE-python_exec' AND tenant_id = v_tenant_id;
    
    -- 2. SQL Query Executor → SQLDatabase Toolkit
    UPDATE dh_tool 
    SET 
        lifecycle_stage = 'production',
        implementation_type = 'langchain_tool',
        implementation_path = 'langchain_community.tools.sql_database.tool.QuerySQLDataBaseTool',
        function_name = 'QuerySQLDataBaseTool',
        langgraph_compatible = true,
        updated_at = NOW(),
        metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{langchain}',
            '{"package": "langchain_community", "version": "0.0.20", "safe_mode": true}'::jsonb
        )
    WHERE unique_id = 'TL-CODE-sql_exec' AND tenant_id = v_tenant_id;
    
    -- 3. Email Sender → Gmail Toolkit
    UPDATE dh_tool 
    SET 
        lifecycle_stage = 'production',
        implementation_type = 'langchain_tool',
        implementation_path = 'langchain_community.agent_toolkits.gmail.toolkit.GmailToolkit',
        function_name = 'GmailToolkit',
        langgraph_compatible = true,
        updated_at = NOW(),
        metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{langchain}',
            '{"package": "langchain_community", "version": "0.0.20", "oauth": true, "quota": "250 per user per second"}'::jsonb
        )
    WHERE unique_id = 'TL-COMM-email' AND tenant_id = v_tenant_id;
    
    -- 4. Slack Notifier → Slack Toolkit
    UPDATE dh_tool 
    SET 
        lifecycle_stage = 'production',
        implementation_type = 'langchain_tool',
        implementation_path = 'langchain_community.agent_toolkits.slack.toolkit.SlackToolkit',
        function_name = 'SlackToolkit',
        langgraph_compatible = true,
        updated_at = NOW(),
        metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{langchain}',
            '{"package": "langchain_community", "version": "0.0.20", "pricing": "free"}'::jsonb
        )
    WHERE unique_id = 'TL-COMM-slack' AND tenant_id = v_tenant_id;
    
    -- 5. Web Scraper → PlayWright Browser Toolkit
    UPDATE dh_tool 
    SET 
        lifecycle_stage = 'production',
        implementation_type = 'langchain_tool',
        implementation_path = 'langchain_community.agent_toolkits.playwright.toolkit.PlayWrightBrowserToolkit',
        function_name = 'PlayWrightBrowserToolkit',
        langgraph_compatible = true,
        updated_at = NOW(),
        metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{langchain}',
            '{"package": "langchain_community", "version": "0.0.20", "browser": "chromium", "headless": true}'::jsonb
        )
    WHERE unique_id = 'TL-AI-web_scraper' AND tenant_id = v_tenant_id;
    
    RAISE NOTICE '✅ Updated 5 Phase 1 tools to LangChain';
END $$;

-- ============================================================================
-- STEP 3: Add 10 New Strategic Tools from LangChain
-- ============================================================================

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1;
    
    -- 1. Google Scholar
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        input_schema, output_schema,
        langgraph_compatible, lifecycle_stage, is_active,
        documentation_url, metadata
    ) VALUES (
        v_tenant_id, 'TL-SEARCH-google_scholar', 'TOOL-SEARCH-SCHOLAR',
        'Google Scholar Search',
        'Search academic papers and citations on Google Scholar',
        'Research', 'ai_function', 'langchain_tool',
        'langchain_community.tools.google_scholar.GoogleScholarQueryRun', 'GoogleScholarQueryRun',
        '{"type":"object","properties":{"query":{"type":"string","description":"Search query"}},"required":["query"]}'::jsonb,
        '{"type":"object","properties":{"results":{"type":"array"},"citations":{"type":"integer"}}}'::jsonb,
        true, 'production', true,
        'https://docs.langchain.com/oss/python/integrations/tools/google_scholar',
        '{"langchain":{"package":"langchain_community","version":"0.0.20"},"pricing":"free"}'::jsonb
    );
    
    -- 2. Semantic Scholar
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, lifecycle_stage, is_active,
        documentation_url, metadata
    ) VALUES (
        v_tenant_id, 'TL-SEARCH-semantic_scholar', 'TOOL-SEARCH-SEMANTIC',
        'Semantic Scholar API',
        'AI-powered academic paper search with citations and influence metrics',
        'Research', 'ai_function', 'langchain_tool',
        'langchain_community.tools.semanticscholar.SemanticScholarQueryRun', 'SemanticScholarQueryRun',
        true, 'production', true,
        'https://docs.langchain.com/oss/python/integrations/tools/semanticscholar',
        '{"langchain":{"package":"langchain_community"},"pricing":"free"}'::jsonb
    );
    
    -- 3. Wikipedia
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, lifecycle_stage, is_active,
        documentation_url, metadata
    ) VALUES (
        v_tenant_id, 'TL-SEARCH-wikipedia', 'TOOL-SEARCH-WIKI',
        'Wikipedia Search',
        'Search and retrieve Wikipedia articles for reference information',
        'Research', 'ai_function', 'langchain_tool',
        'langchain_community.tools.wikipedia.tool.WikipediaQueryRun', 'WikipediaQueryRun',
        true, 'production', true,
        'https://docs.langchain.com/oss/python/integrations/tools/wikipedia',
        '{"langchain":{"package":"langchain_community"},"pricing":"free"}'::jsonb
    );
    
    -- 4. Exa Search
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, lifecycle_stage, is_active,
        documentation_url, metadata
    ) VALUES (
        v_tenant_id, 'TL-SEARCH-exa', 'TOOL-SEARCH-EXA',
        'Exa Search',
        'Neural search engine with 1000 free searches/month, returns author and date',
        'Web', 'ai_function', 'langchain_tool',
        'langchain_community.tools.exa_search.ExaSearchResults', 'ExaSearchResults',
        true, 'production', true,
        'https://docs.langchain.com/oss/python/integrations/tools/exa_search',
        '{"langchain":{"package":"langchain_community"},"pricing":"1000 free/month"}'::jsonb
    );
    
    -- 5. Pandas Dataframe Analyzer
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, lifecycle_stage, is_active,
        documentation_url, metadata
    ) VALUES (
        v_tenant_id, 'TL-DATA-pandas', 'TOOL-DATA-PANDAS',
        'Pandas Dataframe Analyzer',
        'Query and analyze pandas dataframes using natural language',
        'Data Analysis', 'ai_function', 'langchain_tool',
        'langchain_experimental.agents.agent_toolkits.pandas.create_pandas_dataframe_agent', 'create_pandas_dataframe_agent',
        true, 'production', true,
        'https://docs.langchain.com/oss/python/integrations/tools/pandas',
        '{"langchain":{"package":"langchain_experimental"},"pricing":"free"}'::jsonb
    );
    
    -- 6. Wolfram Alpha
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, lifecycle_stage, is_active,
        documentation_url, metadata
    ) VALUES (
        v_tenant_id, 'TL-COMPUTE-wolfram', 'TOOL-COMPUTE-WOLFRAM',
        'Wolfram Alpha',
        'Advanced mathematical and scientific computations',
        'Computation', 'ai_function', 'langchain_tool',
        'langchain_community.utilities.wolfram_alpha.WolframAlphaAPIWrapper', 'WolframAlphaAPIWrapper',
        true, 'production', true,
        'https://docs.langchain.com/oss/python/integrations/tools/wolfram_alpha',
        '{"langchain":{"package":"langchain_community"},"pricing":"free tier available"}'::jsonb
    );
    
    -- 7. GraphQL Query Tool
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, lifecycle_stage, is_active,
        documentation_url, metadata
    ) VALUES (
        v_tenant_id, 'TL-API-graphql', 'TOOL-API-GRAPHQL',
        'GraphQL Query Tool',
        'Execute GraphQL queries against any GraphQL API',
        'API', 'ai_function', 'langchain_tool',
        'langchain_community.tools.graphql.tool.BaseGraphQLTool', 'BaseGraphQLTool',
        true, 'production', true,
        'https://docs.langchain.com/oss/python/integrations/tools/graphql',
        '{"langchain":{"package":"langchain_community"},"pricing":"free"}'::jsonb
    );
    
    -- 8. Github Toolkit
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, lifecycle_stage, is_active,
        documentation_url, metadata
    ) VALUES (
        v_tenant_id, 'TL-PROD-github', 'TOOL-PROD-GITHUB',
        'Github Toolkit',
        'Interact with Github repositories, issues, PRs, and code',
        'Productivity', 'ai_function', 'langchain_tool',
        'langchain_community.agent_toolkits.github.toolkit.GitHubToolkit', 'GitHubToolkit',
        true, 'production', true,
        'https://docs.langchain.com/oss/python/integrations/tools/github',
        '{"langchain":{"package":"langchain_community"},"pricing":"free"}'::jsonb
    );
    
    -- 9. Jira Toolkit
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, lifecycle_stage, is_active,
        documentation_url, metadata
    ) VALUES (
        v_tenant_id, 'TL-PROD-jira', 'TOOL-PROD-JIRA',
        'Jira Toolkit',
        'Manage Jira issues, projects, and workflows',
        'Productivity', 'ai_function', 'langchain_tool',
        'langchain_community.agent_toolkits.jira.toolkit.JiraToolkit', 'JiraToolkit',
        true, 'production', true,
        'https://docs.langchain.com/oss/python/integrations/tools/jira',
        '{"langchain":{"package":"langchain_community"},"pricing":"free with rate limits"}'::jsonb
    );
    
    -- 10. Google Drive
    INSERT INTO dh_tool (
        tenant_id, unique_id, code, name, tool_description,
        category, tool_type, implementation_type, implementation_path, function_name,
        langgraph_compatible, lifecycle_stage, is_active,
        documentation_url, metadata
    ) VALUES (
        v_tenant_id, 'TL-PROD-gdrive', 'TOOL-PROD-GDRIVE',
        'Google Drive',
        'Access and manage files in Google Drive',
        'Productivity', 'ai_function', 'langchain_tool',
        'langchain_community.utilities.google_drive.GoogleDriveAPIWrapper', 'GoogleDriveAPIWrapper',
        true, 'production', true,
        'https://docs.langchain.com/oss/python/integrations/tools/google_drive',
        '{"langchain":{"package":"langchain_community"},"pricing":"free with Google Workspace"}'::jsonb
    );
    
    RAISE NOTICE '✅ Added 10 new strategic tools from LangChain';
END $$;

-- ============================================================================
-- STEP 4: Verification Queries
-- ============================================================================

-- Count tools by implementation type
SELECT 
    implementation_type,
    lifecycle_stage,
    COUNT(*) as count
FROM dh_tool
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
GROUP BY implementation_type, lifecycle_stage
ORDER BY implementation_type, lifecycle_stage;

-- Show all LangChain tools
SELECT 
    unique_id,
    name,
    implementation_type,
    lifecycle_stage,
    langgraph_compatible
FROM dh_tool
WHERE implementation_type = 'langchain_tool'
    AND tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
ORDER BY lifecycle_stage, name;

-- Summary
SELECT 
    '✅ LangChain Integration Complete!' as status,
    (SELECT COUNT(*) FROM dh_tool WHERE implementation_type = 'langchain_tool' AND lifecycle_stage = 'production') as langchain_production_tools,
    (SELECT COUNT(*) FROM dh_tool WHERE lifecycle_stage = 'production') as total_production_tools,
    (SELECT COUNT(*) FROM dh_tool) as total_tools;

