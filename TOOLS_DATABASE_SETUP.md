# Tools Database Setup Guide

## 🎯 Quick Start

Run these commands in order to set up the tools database:

### Step 1: Drop Old Tables (if needed)
```bash
psql "$SUPABASE_DB_URL" -f drop_old_tools.sql
```

**What it does:** Removes any existing `tools`, `agent_tools`, `tool_executions` tables with old schema.

---

### Step 2: Create Tools Registry Schema
```bash
psql "$SUPABASE_DB_URL" -f database/sql/migrations/2025/20251102_create_tools_registry.sql
```

**What it creates:**
- `tools` - Tool registry with metadata
- `agent_tools` - Agent-tool linking (many-to-many)
- `tool_executions` - Execution history
- `tool_analytics` - Analytics materialized view
- Helper functions: `get_agent_tools()`, `log_tool_execution()`
- RLS policies for security

---

### Step 3: Seed All Tools
```bash
psql "$SUPABASE_DB_URL" -f database/sql/seeds/2025/20251102_seed_all_tools.sql
```

**What it seeds:**
1. **Web Tools:**
   - `web_search` - Tavily web search
   - `web_scraper` - HTML content extraction

2. **Medical/Research Tools:**
   - `pubmed_search` - PubMed medical research
   - `arxiv_search` - arXiv scientific papers
   - `who_guidelines` - WHO health guidelines
   - `clinicaltrials_search` - ClinicalTrials.gov
   - `fda_drugs` - FDA drug database

3. **RAG Tools:**
   - `rag_search` - Knowledge base search

4. **Computation Tools:**
   - `calculator` - Math calculations
   - `python_executor` - Sandboxed Python execution

**Total:** 10 tools

---

### Step 4: Link Tools to Agents
```bash
psql "$SUPABASE_DB_URL" -f database/sql/seeds/2025/20251102_link_tools_to_agents.sql
```

**What it links:**

| Agent | Tools Linked | Top Priority Tools |
|-------|--------------|-------------------|
| **Regulatory Affairs Expert** | 7 tools | RAG → FDA → WHO → Clinical Trials |
| **Clinical Research Expert** | 6 tools | RAG → PubMed → Clinical Trials → arXiv |
| **Pharmacovigilance Expert** | 6 tools | RAG → FDA → PubMed → WHO |
| **Market Access Expert** | 5 tools | RAG → Web Search → PubMed |
| **Digital Health Expert** | 5 tools | RAG → Web Search → arXiv |
| **General Research Assistant** | 4 tools | RAG → Web Search → arXiv → Calculator |

**Total:** 33 agent-tool links

---

## ✅ Verification

After running all migrations, verify setup:

```bash
# Count tools
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) as tool_count FROM tools;"

# Count agent-tool links  
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) as link_count FROM agent_tools;"

# View agent-tool matrix
psql "$SUPABASE_DB_URL" -c "
SELECT 
  at.agent_id,
  t.tool_code,
  at.priority,
  at.auto_approve,
  at.is_enabled
FROM agent_tools at
JOIN tools t ON at.tool_id = t.tool_id
WHERE at.is_enabled = TRUE
ORDER BY at.agent_id, at.priority DESC
LIMIT 20;
"
```

**Expected Output:**
- ✅ 10 tools in registry
- ✅ 33 agent-tool links
- ✅ Tools properly prioritized per agent

---

## 🔧 Troubleshooting

### Error: "column tool_code does not exist"
**Problem:** Old `tools` table exists with different schema

**Solution:**
```bash
# Drop old tables
psql "$SUPABASE_DB_URL" -f drop_old_tools.sql

# Then rerun Step 2
psql "$SUPABASE_DB_URL" -f database/sql/migrations/2025/20251102_create_tools_registry.sql
```

---

### Error: "duplicate key value"
**Problem:** Tools already seeded

**Solution:**
```bash
# Seed files use ON CONFLICT DO UPDATE, so just rerun:
psql "$SUPABASE_DB_URL" -f database/sql/seeds/2025/20251102_seed_all_tools.sql
```

---

## 📊 Tool Details

### Web Tools (2)
- **web_search**: Tavily API, $0.001/call, 60 req/min
- **web_scraper**: BeautifulSoup4, $0.0005/call, 30 req/min

### Medical Tools (5)
- **pubmed_search**: PubMed API, FREE, 100 req/min
- **arxiv_search**: arXiv API, FREE, 100 req/min
- **who_guidelines**: WHO API, FREE, 60 req/min
- **clinicaltrials_search**: ClinicalTrials.gov, FREE, 60 req/min
- **fda_drugs**: FDA API, FREE, 60 req/min

### RAG Tools (1)
- **rag_search**: Pinecone + Supabase, $0.002/call, 15s timeout

### Computation Tools (2)
- **calculator**: Python eval, $0.0001/call, 5s timeout
- **python_executor**: Sandboxed Python, $0.001/call, 30s timeout (BETA, premium)

---

## 🎯 Next Steps

1. ✅ Database setup complete
2. ⏳ Implement Python functions for medical tools
3. ⏳ Integrate with LangGraph workflows
4. ⏳ Test with autonomous modes
5. ⏳ Monitor tool usage analytics

---

## 📝 Quick Commands

```bash
# Complete setup (run all at once)
psql "$SUPABASE_DB_URL" -f drop_old_tools.sql && \
psql "$SUPABASE_DB_URL" -f database/sql/migrations/2025/20251102_create_tools_registry.sql && \
psql "$SUPABASE_DB_URL" -f database/sql/seeds/2025/20251102_seed_all_tools.sql && \
psql "$SUPABASE_DB_URL" -f database/sql/seeds/2025/20251102_link_tools_to_agents.sql

# Verify
psql "$SUPABASE_DB_URL" -c "SELECT tool_code, tool_name, category, status FROM tools ORDER BY category, tool_code;"
```

---

**Last Updated:** November 2, 2025  
**Status:** Ready for deployment

