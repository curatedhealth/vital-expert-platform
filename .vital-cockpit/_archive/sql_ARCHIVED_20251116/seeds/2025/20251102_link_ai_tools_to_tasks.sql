-- ============================================================================
-- Link AI Agent Tools to DH Tasks
-- Date: 2025-11-02
-- Purpose: Connect AI tools (tools table) to digital health tasks (dh_task)
--
-- NOTE: This is SEPARATE from dh_task_tool which links dh_tool (domain tools)
--       This links AI Agent tools (web_search, rag_search, etc.) to tasks
-- ============================================================================

-- ============================================================================
-- 1. CREATE AI TOOL-TASK LINKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS dh_task_ai_tool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(tool_id) ON DELETE CASCADE,
  
  -- Tool Role for Task
  is_required BOOLEAN DEFAULT FALSE, -- Must use this AI tool
  is_recommended BOOLEAN DEFAULT TRUE, -- Suggested but optional
  priority INTEGER DEFAULT 50, -- Higher = more important (1-100)
  
  -- Task-Specific Configuration
  task_specific_config JSONB DEFAULT '{}'::jsonb,
  usage_notes TEXT, -- When/how to use this tool for this task
  
  -- Constraints
  max_uses_per_execution INTEGER, -- NULL = unlimited
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(task_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_task_ai_tool_task_id ON dh_task_ai_tool(task_id);
CREATE INDEX IF NOT EXISTS idx_dh_task_ai_tool_tool_id ON dh_task_ai_tool(tool_id);
CREATE INDEX IF NOT EXISTS idx_dh_task_ai_tool_tenant ON dh_task_ai_tool(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dh_task_ai_tool_required ON dh_task_ai_tool(is_required) WHERE is_required = TRUE;

COMMENT ON TABLE dh_task_ai_tool IS 'Links AI agent tools (tools table) to digital health tasks with role definitions';
COMMENT ON COLUMN dh_task_ai_tool.is_required IS 'Whether this AI tool is required for task execution';
COMMENT ON COLUMN dh_task_ai_tool.priority IS 'Tool priority (1-100, higher = more important)';

-- Update trigger
DROP TRIGGER IF EXISTS trg_dh_task_ai_tool_updated ON dh_task_ai_tool;
CREATE TRIGGER trg_dh_task_ai_tool_updated
  BEFORE UPDATE ON dh_task_ai_tool
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. CREATE TASK CATEGORY-TOOL TEMPLATES
-- ============================================================================
-- This table defines AI tool recommendations by task category/type
-- Useful for automatically suggesting AI tools when creating new tasks

CREATE TABLE IF NOT EXISTS task_category_ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- e.g., 'research', 'analysis', 'documentation'
  task_type TEXT, -- Optional subcategory (e.g., 'literature_review', 'data_analysis')
  task_objective_pattern TEXT, -- Regex pattern to match task objectives
  tool_id UUID NOT NULL REFERENCES tools(tool_id) ON DELETE CASCADE,
  
  -- Default recommendations
  is_required BOOLEAN DEFAULT FALSE,
  is_recommended BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 50,
  
  usage_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(category, task_type, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_task_category_ai_tools_category ON task_category_ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_task_category_ai_tools_tool_id ON task_category_ai_tools(tool_id);

COMMENT ON TABLE task_category_ai_tools IS 'AI tool recommendations by task category - templates for task creation';

-- ============================================================================
-- 3. SEED TASK CATEGORY-AI TOOL TEMPLATES
-- ============================================================================

DO $$
DECLARE
  -- AI Tool IDs
  web_search_id UUID;
  web_scraper_id UUID;
  rag_search_id UUID;
  pubmed_id UUID;
  arxiv_id UUID;
  who_id UUID;
  fda_id UUID;
  clinicaltrials_id UUID;
  calculator_id UUID;
  python_executor_id UUID;
BEGIN
  -- Get AI tool IDs
  SELECT tool_id INTO web_search_id FROM tools WHERE tool_code = 'web_search';
  SELECT tool_id INTO web_scraper_id FROM tools WHERE tool_code = 'web_scraper';
  SELECT tool_id INTO rag_search_id FROM tools WHERE tool_code = 'rag_search';
  SELECT tool_id INTO pubmed_id FROM tools WHERE tool_code = 'pubmed_search';
  SELECT tool_id INTO arxiv_id FROM tools WHERE tool_code = 'arxiv_search';
  SELECT tool_id INTO who_id FROM tools WHERE tool_code = 'who_guidelines';
  SELECT tool_id INTO fda_id FROM tools WHERE tool_code = 'fda_drugs';
  SELECT tool_id INTO clinicaltrials_id FROM tools WHERE tool_code = 'clinicaltrials_search';
  SELECT tool_id INTO calculator_id FROM tools WHERE tool_code = 'calculator';
  SELECT tool_id INTO python_executor_id FROM tools WHERE tool_code = 'python_executor';

  -- ========================================================================
  -- RESEARCH CATEGORY
  -- ========================================================================
  INSERT INTO task_category_ai_tools (category, task_type, tool_id, is_required, is_recommended, priority, usage_notes)
  VALUES
  ('research', 'literature_review', rag_search_id, TRUE, TRUE, 100, 'Start with internal knowledge base'),
  ('research', 'literature_review', pubmed_id, TRUE, TRUE, 95, 'Primary source for medical literature'),
  ('research', 'literature_review', arxiv_id, FALSE, TRUE, 90, 'Scientific preprints and papers'),
  ('research', 'literature_review', web_search_id, FALSE, TRUE, 70, 'Supplementary web sources'),
  
  ('research', 'market_intelligence', web_search_id, TRUE, TRUE, 100, 'Primary tool for market intelligence'),
  ('research', 'market_intelligence', rag_search_id, TRUE, TRUE, 90, 'Internal market knowledge'),
  ('research', 'market_intelligence', web_scraper_id, FALSE, TRUE, 80, 'Extract competitor data'),
  
  ('research', 'regulatory_research', rag_search_id, TRUE, TRUE, 100, 'Regulatory knowledge base'),
  ('research', 'regulatory_research', fda_id, TRUE, TRUE, 95, 'FDA regulations and guidance'),
  ('research', 'regulatory_research', who_id, TRUE, TRUE, 90, 'WHO guidelines'),
  ('research', 'regulatory_research', web_search_id, FALSE, TRUE, 75, 'Recent regulatory updates'),
  
  ('research', 'clinical_trial_search', clinicaltrials_id, TRUE, TRUE, 100, 'Primary clinical trials database'),
  ('research', 'clinical_trial_search', rag_search_id, TRUE, TRUE, 90, 'Internal trial knowledge'),
  ('research', 'clinical_trial_search', pubmed_id, FALSE, TRUE, 80, 'Published trial results')
  ON CONFLICT (category, task_type, tool_id) DO UPDATE SET
    is_required = EXCLUDED.is_required,
    priority = EXCLUDED.priority,
    updated_at = now();

  -- ========================================================================
  -- ANALYSIS CATEGORY
  -- ========================================================================
  INSERT INTO task_category_ai_tools (category, task_type, tool_id, is_required, is_recommended, priority, usage_notes)
  VALUES
  ('analysis', 'data_analysis', calculator_id, TRUE, TRUE, 100, 'Statistical calculations'),
  ('analysis', 'data_analysis', python_executor_id, FALSE, TRUE, 95, 'Complex data analysis (premium)'),
  ('analysis', 'data_analysis', rag_search_id, FALSE, TRUE, 70, 'Analysis methodologies'),
  
  ('analysis', 'risk_assessment', rag_search_id, TRUE, TRUE, 100, 'Risk assessment frameworks'),
  ('analysis', 'risk_assessment', fda_id, TRUE, TRUE, 90, 'Safety data and signals'),
  ('analysis', 'risk_assessment', pubmed_id, FALSE, TRUE, 80, 'Published risk data'),
  ('analysis', 'risk_assessment', calculator_id, FALSE, TRUE, 75, 'Risk calculations'),
  
  ('analysis', 'cost_benefit', calculator_id, TRUE, TRUE, 100, 'Financial calculations'),
  ('analysis', 'cost_benefit', rag_search_id, TRUE, TRUE, 90, 'Economic models'),
  ('analysis', 'cost_benefit', pubmed_id, FALSE, TRUE, 70, 'HEOR literature')
  ON CONFLICT (category, task_type, tool_id) DO UPDATE SET
    is_required = EXCLUDED.is_required,
    priority = EXCLUDED.priority,
    updated_at = now();

  -- ========================================================================
  -- DOCUMENTATION CATEGORY
  -- ========================================================================
  INSERT INTO task_category_ai_tools (category, task_type, tool_id, is_required, is_recommended, priority, usage_notes)
  VALUES
  ('documentation', 'report_generation', rag_search_id, TRUE, TRUE, 100, 'Knowledge base for content'),
  ('documentation', 'report_generation', pubmed_id, FALSE, TRUE, 80, 'Citations and references'),
  ('documentation', 'report_generation', web_search_id, FALSE, TRUE, 70, 'Recent developments'),
  
  ('documentation', 'summary_creation', rag_search_id, TRUE, TRUE, 100, 'Source content'),
  ('documentation', 'summary_creation', web_scraper_id, FALSE, TRUE, 70, 'Extract long-form content'),
  
  ('documentation', 'guideline_development', rag_search_id, TRUE, TRUE, 100, 'Existing guidelines'),
  ('documentation', 'guideline_development', who_id, TRUE, TRUE, 95, 'WHO guidelines'),
  ('documentation', 'guideline_development', fda_id, FALSE, TRUE, 90, 'Regulatory requirements'),
  ('documentation', 'guideline_development', pubmed_id, FALSE, TRUE, 80, 'Evidence base')
  ON CONFLICT (category, task_type, tool_id) DO UPDATE SET
    is_required = EXCLUDED.is_required,
    priority = EXCLUDED.priority,
    updated_at = now();

  -- ========================================================================
  -- MONITORING CATEGORY
  -- ========================================================================
  INSERT INTO task_category_ai_tools (category, task_type, tool_id, is_required, is_recommended, priority, usage_notes)
  VALUES
  ('monitoring', 'safety_monitoring', fda_id, TRUE, TRUE, 100, 'FDA adverse events'),
  ('monitoring', 'safety_monitoring', rag_search_id, TRUE, TRUE, 95, 'Safety knowledge base'),
  ('monitoring', 'safety_monitoring', pubmed_id, FALSE, TRUE, 85, 'Safety literature'),
  
  ('monitoring', 'competitor_tracking', web_search_id, TRUE, TRUE, 100, 'Latest competitor news'),
  ('monitoring', 'competitor_tracking', web_scraper_id, FALSE, TRUE, 85, 'Competitor websites'),
  
  ('monitoring', 'regulatory_updates', web_search_id, TRUE, TRUE, 100, 'Latest regulatory updates'),
  ('monitoring', 'regulatory_updates', fda_id, TRUE, TRUE, 95, 'FDA announcements'),
  ('monitoring', 'regulatory_updates', who_id, FALSE, TRUE, 80, 'WHO updates')
  ON CONFLICT (category, task_type, tool_id) DO UPDATE SET
    is_required = EXCLUDED.is_required,
    priority = EXCLUDED.priority,
    updated_at = now();

  -- ========================================================================
  -- DESIGN CATEGORY (Digital Health Specific)
  -- ========================================================================
  INSERT INTO task_category_ai_tools (category, task_type, tool_id, is_required, is_recommended, priority, usage_notes)
  VALUES
  ('design', 'endpoint_selection', rag_search_id, TRUE, TRUE, 100, 'Endpoint libraries and precedents'),
  ('design', 'endpoint_selection', pubmed_id, TRUE, TRUE, 95, 'Published endpoint validation'),
  ('design', 'endpoint_selection', fda_id, TRUE, TRUE, 90, 'FDA endpoint guidance'),
  ('design', 'endpoint_selection', clinicaltrials_id, FALSE, TRUE, 85, 'Precedent trials'),
  
  ('design', 'biomarker_validation', pubmed_id, TRUE, TRUE, 100, 'Biomarker literature'),
  ('design', 'biomarker_validation', rag_search_id, TRUE, TRUE, 95, 'Internal biomarker data'),
  ('design', 'biomarker_validation', fda_id, FALSE, TRUE, 85, 'FDA biomarker guidance'),
  
  ('design', 'study_design', rag_search_id, TRUE, TRUE, 100, 'Study design templates'),
  ('design', 'study_design', clinicaltrials_id, TRUE, TRUE, 95, 'Precedent study designs'),
  ('design', 'study_design', pubmed_id, FALSE, TRUE, 85, 'Design methodology papers'),
  ('design', 'study_design', calculator_id, FALSE, TRUE, 75, 'Sample size and power calculations')
  ON CONFLICT (category, task_type, tool_id) DO UPDATE SET
    is_required = EXCLUDED.is_required,
    priority = EXCLUDED.priority,
    updated_at = now();

  RAISE NOTICE '✅ Seeded AI tool recommendations for task categories';
END $$;

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Get AI tools for a specific task
CREATE OR REPLACE FUNCTION get_ai_tools_for_task(p_task_id UUID)
RETURNS TABLE (
  tool_id UUID,
  tool_code TEXT,
  tool_name TEXT,
  tool_description TEXT,
  category TEXT,
  is_required BOOLEAN,
  is_recommended BOOLEAN,
  priority INTEGER,
  usage_notes TEXT,
  input_schema JSONB,
  output_schema JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tool_id,
    t.tool_code,
    t.tool_name,
    t.tool_description,
    t.category,
    dtat.is_required,
    dtat.is_recommended,
    dtat.priority,
    dtat.usage_notes,
    t.input_schema,
    t.output_schema
  FROM tools t
  INNER JOIN dh_task_ai_tool dtat ON t.tool_id = dtat.tool_id
  WHERE dtat.task_id = p_task_id
    AND t.status = 'active'
  ORDER BY dtat.is_required DESC, dtat.priority DESC, t.tool_name ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_ai_tools_for_task IS 'Get all AI tools configured for a specific dh_task';

-- Get recommended AI tools for a task category/type
CREATE OR REPLACE FUNCTION get_recommended_ai_tools(
  p_category TEXT,
  p_task_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  tool_id UUID,
  tool_code TEXT,
  tool_name TEXT,
  is_required BOOLEAN,
  is_recommended BOOLEAN,
  priority INTEGER,
  usage_notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tool_id,
    t.tool_code,
    t.tool_name,
    tcat.is_required,
    tcat.is_recommended,
    tcat.priority,
    tcat.usage_notes
  FROM tools t
  INNER JOIN task_category_ai_tools tcat ON t.tool_id = tcat.tool_id
  WHERE tcat.category = p_category
    AND (p_task_type IS NULL OR tcat.task_type = p_task_type)
    AND t.status = 'active'
  ORDER BY tcat.is_required DESC, tcat.priority DESC, t.tool_name ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_recommended_ai_tools IS 'Get recommended AI tools for a task category/type';

-- Auto-assign AI tools to task based on category
CREATE OR REPLACE FUNCTION auto_assign_ai_tools_to_task(
  p_task_id UUID,
  p_tenant_id UUID,
  p_category TEXT,
  p_task_type TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  tool_record RECORD;
  assigned_count INTEGER := 0;
BEGIN
  FOR tool_record IN (
    SELECT
      tool_id,
      is_required,
      is_recommended,
      priority,
      usage_notes
    FROM get_recommended_ai_tools(p_category, p_task_type)
  ) LOOP
    INSERT INTO dh_task_ai_tool (
      tenant_id,
      task_id,
      tool_id,
      is_required,
      is_recommended,
      priority,
      usage_notes
    ) VALUES (
      p_tenant_id,
      p_task_id,
      tool_record.tool_id,
      tool_record.is_required,
      tool_record.is_recommended,
      tool_record.priority,
      tool_record.usage_notes
    )
    ON CONFLICT (task_id, tool_id) DO NOTHING;
    
    assigned_count := assigned_count + 1;
  END LOOP;
  
  RETURN assigned_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_assign_ai_tools_to_task IS 'Automatically assign recommended AI tools to a task based on category';

-- ============================================================================
-- 5. SUMMARY
-- ============================================================================

DO $$
DECLARE
  template_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO template_count FROM task_category_ai_tools;
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE '✅ AI TOOL-TASK LINKING COMPLETE';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Created table: dh_task_ai_tool (links tasks to AI tools)';
  RAISE NOTICE 'Created table: task_category_ai_tools (templates)';
  RAISE NOTICE 'Total AI tool templates: %', template_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Helper functions:';
  RAISE NOTICE '  - get_ai_tools_for_task(task_id)';
  RAISE NOTICE '  - get_recommended_ai_tools(category, task_type)';
  RAISE NOTICE '  - auto_assign_ai_tools_to_task(task_id, tenant_id, category, task_type)';
  RAISE NOTICE '';
  RAISE NOTICE 'Example usage:';
  RAISE NOTICE '  SELECT * FROM get_recommended_ai_tools(''research'', ''literature_review'');';
  RAISE NOTICE '  SELECT auto_assign_ai_tools_to_task(task_id, tenant_id, ''research'', ''literature_review'');';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE '';
END $$;

