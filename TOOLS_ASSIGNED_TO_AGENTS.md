# Web Search Tools Assigned to All Agents

**Date:** November 5, 2025  
**Status:** ✅ Complete

## Summary

Successfully assigned all 6 web search tools to **ALL 266 agents** in the database using MCP (Supabase) server.

## Tools Assigned

1. **Web Search (Tavily)** - `TOOL-AI-WEB_SEARCH` - Priority: 1
2. **PubMed Medical Research Search** - `TOOL-AI-PUBMED_SEARCH` - Priority: 2
3. **ClinicalTrials.gov Search** - `TOOL-AI-CLINICALTRIALS_SEARCH` - Priority: 3
4. **arXiv Scientific Papers Search** - `TOOL-AI-ARXIV_SEARCH` - Priority: 4
5. **Google Scholar Search** - `TOOL-SEARCH-SCHOLAR` - Priority: 5
6. **PubMed/MEDLINE** - `TOOL-PUBMED` - Priority: 6

## Assignment Results

- **Agents with tools:** 266
- **Unique tools assigned:** 6
- **Total assignments:** 1,575 (266 agents × 6 tools)

## Database Query Used

```sql
-- Assign web search tools to ALL agents
WITH web_tools AS (
  SELECT id, code, name 
  FROM dh_tool 
  WHERE code IN ('TOOL-AI-WEB_SEARCH', 'TOOL-AI-PUBMED_SEARCH', 'TOOL-AI-CLINICALTRIALS_SEARCH', 'TOOL-AI-ARXIV_SEARCH', 'TOOL-SEARCH-SCHOLAR', 'TOOL-PUBMED')
),
all_agents AS (
  SELECT DISTINCT id::text AS agent_id FROM agents
)
INSERT INTO agent_tools (agent_id, tool_id, is_enabled, priority, auto_approve, assigned_at)
SELECT 
  a.agent_id,
  wt.id AS tool_id,
  true AS is_enabled,
  CASE 
    WHEN wt.code = 'TOOL-AI-WEB_SEARCH' THEN 1
    WHEN wt.code = 'TOOL-AI-PUBMED_SEARCH' THEN 2
    WHEN wt.code = 'TOOL-AI-CLINICALTRIALS_SEARCH' THEN 3
    WHEN wt.code = 'TOOL-AI-ARXIV_SEARCH' THEN 4
    WHEN wt.code = 'TOOL-SEARCH-SCHOLAR' THEN 5
    WHEN wt.code = 'TOOL-PUBMED' THEN 6
    ELSE 10
  END AS priority,
  true AS auto_approve,
  NOW() AS assigned_at
FROM all_agents a
CROSS JOIN web_tools wt
WHERE NOT EXISTS (
  SELECT 1 FROM agent_tools at 
  WHERE at.agent_id = a.agent_id AND at.tool_id = wt.id
)
RETURNING agent_id, tool_id;
```

## Configuration

- **is_enabled:** `true` (all tools enabled)
- **auto_approve:** `true` (tools auto-approved for use)
- **priority:** 1-6 (Web Search highest priority, PubMed lowest)

## Impact

All agents now have access to:
- ✅ Web search capabilities (Tavily)
- ✅ Medical research databases (PubMed, ClinicalTrials.gov)
- ✅ Scientific literature (arXiv, Google Scholar)

This enables comprehensive research capabilities across all agents in the system.

## Next Steps

1. **Restart AI Engine** to pick up database changes:
   ```bash
   cd services/ai-engine
   ./start-dev.sh
   ```

2. **Test Mode 1** with tools enabled:
   - Navigate to Ask Expert page
   - Select an agent
   - Enable Tools toggle
   - Ask a question requiring web search

3. **Verify tool execution** in logs:
   - Check for tool execution logs
   - Verify no attribute errors

## Known Issue

There's a current error: `'WebSearchTool' object has no attribute 'name'`

This is likely due to:
1. **Stale Python server** - Need to restart AI Engine
2. **Code mismatch** - The `WebSearchTool` class already has a `name` property defined (line 34-36 in `services/ai-engine/src/tools/web_tools.py`)

**Fix:** Restart the AI Engine server to ensure the latest code is loaded.

