-- ============================================================================
-- Link Tools to Agents
-- Date: 2025-11-02
-- Purpose: Configure which tools each agent can use with priorities
-- ============================================================================

-- ============================================================================
-- 1. REGULATORY AFFAIRS AGENT
-- ============================================================================

-- Get tool IDs for linking
DO $$
DECLARE
  agent_id_val TEXT := 'regulatory_affairs_expert';
  web_search_id UUID;
  web_scraper_id UUID;
  rag_search_id UUID;
  pubmed_id UUID;
  who_id UUID;
  fda_id UUID;
  clinicaltrials_id UUID;
BEGIN
  -- Get tool IDs
  SELECT tool_id INTO web_search_id FROM tools WHERE tool_code = 'web_search';
  SELECT tool_id INTO web_scraper_id FROM tools WHERE tool_code = 'web_scraper';
  SELECT tool_id INTO rag_search_id FROM tools WHERE tool_code = 'rag_search';
  SELECT tool_id INTO pubmed_id FROM tools WHERE tool_code = 'pubmed_search';
  SELECT tool_id INTO who_id FROM tools WHERE tool_code = 'who_guidelines';
  SELECT tool_id INTO fda_id FROM tools WHERE tool_code = 'fda_drugs';
  SELECT tool_id INTO clinicaltrials_id FROM tools WHERE tool_code = 'clinicaltrials_search';
  
  -- Link tools to Regulatory Affairs Agent
  INSERT INTO agent_tools (agent_id, tool_id, is_enabled, priority, auto_approve, allowed_contexts, notes)
  VALUES
  (agent_id_val, rag_search_id, TRUE, 100, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Primary knowledge base search'),
  (agent_id_val, fda_id, TRUE, 95, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'FDA regulatory information'),
  (agent_id_val, who_id, TRUE, 90, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'WHO guidelines'),
  (agent_id_val, clinicaltrials_id, TRUE, 85, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Clinical trials data'),
  (agent_id_val, pubmed_id, TRUE, 80, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Medical research papers'),
  (agent_id_val, web_search_id, TRUE, 70, TRUE, ARRAY['autonomous', 'interactive'], 'General web search'),
  (agent_id_val, web_scraper_id, TRUE, 60, FALSE, ARRAY['autonomous'], 'Web content extraction - needs approval')
  ON CONFLICT (agent_id, tool_id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    priority = EXCLUDED.priority,
    auto_approve = EXCLUDED.auto_approve,
    allowed_contexts = EXCLUDED.allowed_contexts,
    updated_at = now();
  
  RAISE NOTICE '✅ Linked 7 tools to Regulatory Affairs Expert';
END $$;

-- ============================================================================
-- 2. CLINICAL RESEARCH AGENT
-- ============================================================================

DO $$
DECLARE
  agent_id_val TEXT := 'clinical_research_expert';
  web_search_id UUID;
  rag_search_id UUID;
  pubmed_id UUID;
  arxiv_id UUID;
  clinicaltrials_id UUID;
  calculator_id UUID;
BEGIN
  -- Get tool IDs
  SELECT tool_id INTO web_search_id FROM tools WHERE tool_code = 'web_search';
  SELECT tool_id INTO rag_search_id FROM tools WHERE tool_code = 'rag_search';
  SELECT tool_id INTO pubmed_id FROM tools WHERE tool_code = 'pubmed_search';
  SELECT tool_id INTO arxiv_id FROM tools WHERE tool_code = 'arxiv_search';
  SELECT tool_id INTO clinicaltrials_id FROM tools WHERE tool_code = 'clinicaltrials_search';
  SELECT tool_id INTO calculator_id FROM tools WHERE tool_code = 'calculator';
  
  -- Link tools to Clinical Research Agent
  INSERT INTO agent_tools (agent_id, tool_id, is_enabled, priority, auto_approve, allowed_contexts, notes)
  VALUES
  (agent_id_val, rag_search_id, TRUE, 100, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Primary knowledge base'),
  (agent_id_val, pubmed_id, TRUE, 95, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Medical research primary source'),
  (agent_id_val, clinicaltrials_id, TRUE, 90, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Clinical trials database'),
  (agent_id_val, arxiv_id, TRUE, 75, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Scientific preprints'),
  (agent_id_val, calculator_id, TRUE, 70, TRUE, ARRAY['autonomous', 'interactive'], 'Statistical calculations'),
  (agent_id_val, web_search_id, TRUE, 60, TRUE, ARRAY['autonomous', 'interactive'], 'General web search')
  ON CONFLICT (agent_id, tool_id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    priority = EXCLUDED.priority,
    updated_at = now();
  
  RAISE NOTICE '✅ Linked 6 tools to Clinical Research Expert';
END $$;

-- ============================================================================
-- 3. PHARMACOVIGILANCE AGENT
-- ============================================================================

DO $$
DECLARE
  agent_id_val TEXT := 'pharmacovigilance_expert';
  web_search_id UUID;
  rag_search_id UUID;
  pubmed_id UUID;
  fda_id UUID;
  who_id UUID;
  calculator_id UUID;
BEGIN
  -- Get tool IDs
  SELECT tool_id INTO web_search_id FROM tools WHERE tool_code = 'web_search';
  SELECT tool_id INTO rag_search_id FROM tools WHERE tool_code = 'rag_search';
  SELECT tool_id INTO pubmed_id FROM tools WHERE tool_code = 'pubmed_search';
  SELECT tool_id INTO fda_id FROM tools WHERE tool_code = 'fda_drugs';
  SELECT tool_id INTO who_id FROM tools WHERE tool_code = 'who_guidelines';
  SELECT tool_id INTO calculator_id FROM tools WHERE tool_code = 'calculator';
  
  -- Link tools to Pharmacovigilance Agent
  INSERT INTO agent_tools (agent_id, tool_id, is_enabled, priority, auto_approve, allowed_contexts, notes)
  VALUES
  (agent_id_val, rag_search_id, TRUE, 100, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Safety knowledge base'),
  (agent_id_val, fda_id, TRUE, 95, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'FDA adverse events & labels'),
  (agent_id_val, pubmed_id, TRUE, 90, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Safety literature'),
  (agent_id_val, who_id, TRUE, 85, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Global safety guidelines'),
  (agent_id_val, calculator_id, TRUE, 75, TRUE, ARRAY['autonomous', 'interactive'], 'Risk calculations'),
  (agent_id_val, web_search_id, TRUE, 60, TRUE, ARRAY['autonomous', 'interactive'], 'Current safety information')
  ON CONFLICT (agent_id, tool_id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    priority = EXCLUDED.priority,
    updated_at = now();
  
  RAISE NOTICE '✅ Linked 6 tools to Pharmacovigilance Expert';
END $$;

-- ============================================================================
-- 4. MARKET ACCESS AGENT
-- ============================================================================

DO $$
DECLARE
  agent_id_val TEXT := 'market_access_expert';
  web_search_id UUID;
  web_scraper_id UUID;
  rag_search_id UUID;
  pubmed_id UUID;
  calculator_id UUID;
BEGIN
  -- Get tool IDs
  SELECT tool_id INTO web_search_id FROM tools WHERE tool_code = 'web_search';
  SELECT tool_id INTO web_scraper_id FROM tools WHERE tool_code = 'web_scraper';
  SELECT tool_id INTO rag_search_id FROM tools WHERE tool_code = 'rag_search';
  SELECT tool_id INTO pubmed_id FROM tools WHERE tool_code = 'pubmed_search';
  SELECT tool_id INTO calculator_id FROM tools WHERE tool_code = 'calculator';
  
  -- Link tools to Market Access Agent
  INSERT INTO agent_tools (agent_id, tool_id, is_enabled, priority, auto_approve, allowed_contexts, notes)
  VALUES
  (agent_id_val, rag_search_id, TRUE, 100, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Pricing & reimbursement knowledge'),
  (agent_id_val, web_search_id, TRUE, 90, TRUE, ARRAY['autonomous', 'interactive'], 'Current market information'),
  (agent_id_val, pubmed_id, TRUE, 80, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'HEOR literature'),
  (agent_id_val, calculator_id, TRUE, 75, TRUE, ARRAY['autonomous', 'interactive'], 'Economic calculations'),
  (agent_id_val, web_scraper_id, TRUE, 60, FALSE, ARRAY['autonomous'], 'Payer website data extraction')
  ON CONFLICT (agent_id, tool_id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    priority = EXCLUDED.priority,
    updated_at = now();
  
  RAISE NOTICE '✅ Linked 5 tools to Market Access Expert';
END $$;

-- ============================================================================
-- 5. DIGITAL HEALTH AGENT
-- ============================================================================

DO $$
DECLARE
  agent_id_val TEXT := 'digital_health_expert';
  web_search_id UUID;
  web_scraper_id UUID;
  rag_search_id UUID;
  arxiv_id UUID;
  python_executor_id UUID;
BEGIN
  -- Get tool IDs
  SELECT tool_id INTO web_search_id FROM tools WHERE tool_code = 'web_search';
  SELECT tool_id INTO web_scraper_id FROM tools WHERE tool_code = 'web_scraper';
  SELECT tool_id INTO rag_search_id FROM tools WHERE tool_code = 'rag_search';
  SELECT tool_id INTO arxiv_id FROM tools WHERE tool_code = 'arxiv_search';
  SELECT tool_id INTO python_executor_id FROM tools WHERE tool_code = 'python_executor';
  
  -- Link tools to Digital Health Agent
  INSERT INTO agent_tools (agent_id, tool_id, is_enabled, priority, auto_approve, allowed_contexts, notes)
  VALUES
  (agent_id_val, rag_search_id, TRUE, 100, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Digital health knowledge'),
  (agent_id_val, web_search_id, TRUE, 95, TRUE, ARRAY['autonomous', 'interactive'], 'Latest tech & trends'),
  (agent_id_val, arxiv_id, TRUE, 85, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'AI/ML research'),
  (agent_id_val, web_scraper_id, TRUE, 70, FALSE, ARRAY['autonomous'], 'Competitor analysis'),
  (agent_id_val, python_executor_id, TRUE, 60, FALSE, ARRAY['autonomous'], 'Data analysis - premium')
  ON CONFLICT (agent_id, tool_id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    priority = EXCLUDED.priority,
    updated_at = now();
  
  RAISE NOTICE '✅ Linked 5 tools to Digital Health Expert';
END $$;

-- ============================================================================
-- 6. GENERAL RESEARCH ASSISTANT (Default Agent)
-- ============================================================================

DO $$
DECLARE
  agent_id_val TEXT := 'general_research_assistant';
  web_search_id UUID;
  rag_search_id UUID;
  arxiv_id UUID;
  calculator_id UUID;
BEGIN
  -- Get tool IDs
  SELECT tool_id INTO web_search_id FROM tools WHERE tool_code = 'web_search';
  SELECT tool_id INTO rag_search_id FROM tools WHERE tool_code = 'rag_search';
  SELECT tool_id INTO arxiv_id FROM tools WHERE tool_code = 'arxiv_search';
  SELECT tool_id INTO calculator_id FROM tools WHERE tool_code = 'calculator';
  
  -- Link tools to General Research Assistant
  INSERT INTO agent_tools (agent_id, tool_id, is_enabled, priority, auto_approve, allowed_contexts, notes)
  VALUES
  (agent_id_val, rag_search_id, TRUE, 100, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Knowledge base'),
  (agent_id_val, web_search_id, TRUE, 90, TRUE, ARRAY['autonomous', 'interactive'], 'Web search'),
  (agent_id_val, arxiv_id, TRUE, 70, TRUE, ARRAY['autonomous', 'interactive', 'research'], 'Scientific papers'),
  (agent_id_val, calculator_id, TRUE, 60, TRUE, ARRAY['autonomous', 'interactive'], 'Calculations')
  ON CONFLICT (agent_id, tool_id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    priority = EXCLUDED.priority,
    updated_at = now();
  
  RAISE NOTICE '✅ Linked 4 tools to General Research Assistant';
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
DECLARE
  agent_tools_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO agent_tools_count FROM agent_tools;
  RAISE NOTICE '';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE '✅ TOOL LINKING COMPLETE';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Total agent-tool links: %', agent_tools_count;
  RAISE NOTICE '';
END $$;

-- Display agent-tool matrix
SELECT
  at.agent_id,
  t.tool_code,
  t.tool_name,
  t.category,
  at.priority,
  at.auto_approve,
  at.allowed_contexts,
  at.is_enabled
FROM agent_tools at
JOIN tools t ON at.tool_id = t.tool_id
WHERE at.is_enabled = TRUE
ORDER BY at.agent_id, at.priority DESC, t.tool_code;

