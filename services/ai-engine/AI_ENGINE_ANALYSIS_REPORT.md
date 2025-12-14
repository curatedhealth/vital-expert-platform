# AI Engine Analysis Report
**Date:** December 12, 2025
**Scope:** Complete analysis of `/services/ai-engine/src/`

---

## Executive Summary

The AI Engine has **705 Python files** with sophisticated architecture but contains significant technical debt requiring attention:

| Issue Category | Count | Priority |
|----------------|-------|----------|
| **Missing DB Tables** | 3 tables | 🔴 CRITICAL |
| **In-Memory Repositories** | 2 repos | 🔴 CRITICAL |
| **TODOs** | 76 unique | 🟠 HIGH |
| **Mock/Fallback Code** | 45+ functions | 🟠 HIGH |
| **Example Code** | 15+ sections | 🟡 MEDIUM |

---

## 1. MISSING DATABASE TABLES 🔴 CRITICAL

### Tables Not Created in Supabase

| Table | Migration File | Used By | Impact |
|-------|----------------|---------|--------|
| `panel_response_templates` | `20251211_create_panel_response_templates.sql` | `panel_response_template_service.py`, `simple_panel_workflow.py` | Ask Panel uses hardcoded fallbacks |
| `user_panels` | `20251211_create_user_panels_table.sql` | `user_panels/route.ts` | User panels not persisted |
| `jobs` | None exists | `job_repo.py` | Background jobs use in-memory only |
| `knowledge_bases` | `20251128_024_create_knowledge_base_table.sql` | `unified_rag_service.py` | RAG cannot reference knowledge bases |

### Current Database State (Verified)

```
✅ agents: 1,271 rows
✅ conversations: 33 rows
✅ missions: 14 rows
✅ mission_steps: 12 rows
✅ agent_levels: 5 rows
❌ agent_tools: 0 rows (needs seeding)
❌ panel_response_templates: NOT FOUND
❌ user_panels: NOT FOUND
❌ jobs: NOT FOUND
❌ knowledge_bases: NOT FOUND
```

### Fix Required

```bash
# Run migrations in order:
psql $DATABASE_URL < database/migrations/20251211_create_panel_response_templates.sql
psql $DATABASE_URL < database/migrations/20251211_create_user_panels_table.sql
# Create jobs table migration (needs to be written)
```

---

## 2. IN-MEMORY REPOSITORIES 🔴 CRITICAL

### Repositories Using In-Memory Storage

**File: `infrastructure/database/repositories/job_repo.py`**
```python
# Line 50-51
# In-memory store for development (replace with actual DB)
_jobs: Dict[str, Job] = {}
```

**File: `infrastructure/database/repositories/conversation_repo.py`**
```python
# Line 68-70
# In-memory store for development (replace with actual DB)
_conversations: Dict[str, Conversation] = {}
_messages: Dict[str, List[Message]] = {}
```

**Impact:**
- ❌ Jobs lost on server restart
- ❌ Conversations not persisted (bypassing existing `conversations` table!)
- ❌ No cross-instance consistency
- ❌ Mode 3/4 background workflows broken

### Other In-Memory Components

| File | Purpose | Production Ready |
|------|---------|------------------|
| `checkpoint_store.py` | LangGraph checkpoints | ❌ |
| `graphrag/api/rate_limit.py` | Rate limiting | ❌ Redis needed |
| `ab_testing_framework.py` | A/B test experiments | ❌ |
| `monitoring/performance_monitor.py` | Metrics storage | ❌ |

---

## 3. ALL TODOs IN CODEBASE (76 Total)

### Critical TODOs (Database Operations)

| File | Line | TODO |
|------|------|------|
| `job_repo.py` | 100 | `# TODO: Replace with actual database insert` |
| `job_repo.py` | 124 | `# TODO: Replace with actual database query` |
| `job_repo.py` | 151 | `# TODO: Replace with actual database update` |
| `job_repo.py` | 188 | `# TODO: Replace with actual database update` |
| `job_repo.py` | 223 | `# TODO: Replace with actual database update` |
| `job_repo.py` | 244 | `# TODO: Replace with actual database update` |
| `job_repo.py` | 283 | `# TODO: Replace with actual database query` |
| `job_repo.py` | 342 | `# TODO: Replace with actual database query` |
| `conversation_repo.py` | 109 | `# TODO: Replace with actual database insert` |
| `conversation_repo.py` | 134 | `# TODO: Replace with actual database query` |
| `conversation_repo.py` | 178 | `# TODO: Replace with actual database update` |
| `conversation_repo.py` | 228 | `# TODO: Replace with actual database insert` |
| `conversation_repo.py` | 265 | `# TODO: Replace with actual database query` |
| `conversation_repo.py` | 295 | `# TODO: Replace with actual database query` |
| `conversation_repo.py` | 336 | `# TODO: Replace with actual database query` |
| `conversation_repo.py` | 418 | `# TODO: Replace with actual full-text search` |

### High Priority TODOs (Feature Implementation)

| File | Line | TODO |
|------|------|------|
| `api/routes/streaming.py` | 83 | `# TODO: Fetch from database` |
| `api/routes/streaming.py` | 288 | `# TODO: Implement streaming via Ask Expert workflows` |
| `api/routes/panels.py` | 330 | `# TODO: Implement get_panel_responses in repository` |
| `api/routes/panels.py` | 367 | `# TODO: Implement get_panel_consensus in repository` |
| `services/hitl_service.py` | 438 | `# TODO: Implement actual waiting mechanism` |
| `langgraph_compilation/checkpointer.py` | 6 | `TODO: Implement AsyncPostgresSaver for production` |
| `langgraph_compilation/compiler.py` | 6 | `TODO: Upgrade to AsyncPostgresSaver for production` |

### Medium Priority TODOs

| File | Line | TODO |
|------|------|------|
| `tenant_isolation.py` | 203, 216 | Admin permission/token verification |
| `sub_agent_spawner.py` | 110, 219, 291, 363 | Permission enforcement |
| `evidence_based_selector.py` | 844, 884, 897, 919, 1000, 1010 | Domain/skill matching |
| `panel_orchestrator.py` | 600, 640, 675, 685 | Risks extraction, NLP themes, recommendations, streaming |
| `workers/tasks/*.py` | Multiple | Execution tasks, ingestion, cleanup, discovery |

### Full TODO List by Category

```
Repositories (16 TODOs): job_repo.py, conversation_repo.py
API Routes (6 TODOs): streaming.py, panels.py, hybrid_search.py
Services (25 TODOs): evidence_based_selector.py, panel_orchestrator.py, etc.
Infrastructure (5 TODOs): checkpointer.py, compiler.py, auth.py
Workers (12 TODOs): execution_tasks.py, ingestion_tasks.py, etc.
Middleware (4 TODOs): tenant_isolation.py, rate_limiting.py, tenant.py
Integrations (3 TODOs): agent_registry.py
GraphRAG (5 TODOs): auth.py, evaluation.py
```

---

## 4. MOCK/FALLBACK CODE 🟠 HIGH

### Mock Responses (Need Real Implementation)

| File | Functions | Purpose |
|------|-----------|---------|
| `runners/pharma/medical_affairs.py` | `_mock_medical_affairs()` | Pharma runner |
| `runners/pharma/digital_health.py` | `_mock_digital_health()` | Digital health runner |
| `runners/pharma/market_access.py` | `_mock_market_access()` | Market access runner |
| `runners/pharma/design_thinking.py` | `_mock_design_thinking()` | Design thinking runner |
| `runners/pharma/foresight.py` | `_mock_foresight()` | Foresight runner |
| `runners/pharma/brand_strategy.py` | `_mock_brand_strategy()` | Brand strategy runner |
| `runners/core/investigate.py` | `_mock_investigate()` | Core investigate |
| `runners/core/critique.py` | `_mock_critique()` | Core critique |
| `runners/core/recommend.py` | `_mock_recommend()` | Core recommend |
| `runners/core/validate.py` | `_mock_validate()` | Core validate |
| `runners/core/synthesize.py` | `_mock_synthesis()` | Core synthesize |
| `runners/core/decompose.py` | `_mock_decompose()` | Core decompose |

### Mock Configuration (Currently Enabled)

```python
# services/ask_panel_config.py lines 142-143
mock_api_delay_seconds: float = 0.5
mock_enabled: bool = True  # ⚠️ SHOULD BE FALSE IN PRODUCTION
```

### Fallback Agents

| File | Function | Fallback Behavior |
|------|----------|-------------------|
| `unified_agent_loader.py` | `_create_fallback_agent()` | Returns hardcoded "General Assistant" |
| `agent_pool_manager.py` | Lines 334, 349, 373 | Uses `load_default_agent_for_domain()` |
| `agent_hierarchy_service.py` | `_create_mock_expert()` | Creates fake expert agent |
| `_legacy_archive/enhanced_agent_selector.py` | `_get_fallback_agent()` | Legacy fallback |

### Knowledge Graph Mock Data

**File: `api/routes/knowledge_graph.py`**
```python
# Lines 1034-1092 - All mock generators
def _generate_mock_ontology_data() -> KGResponse:
def _generate_mock_agent_data() -> KGResponse:
def _generate_mock_neighbors(node_id: str) -> KGResponse:
```

### Mode 2 Auto-Interactive Mock

**File: `api/routes/mode2_auto_interactive.py`**
```python
# Lines 252-270
# Mock response for development
mock_response = f"""Based on your query about "{query[:50]}...", here is the synthesized analysis...
```

---

## 5. EXAMPLE/PLACEHOLDER CODE 🟡 MEDIUM

### Example Code to Remove

| File | Lines | Content |
|------|-------|---------|
| `unified_agent_loader.py` | 548-586 | `if __name__ == "__main__": example_usage()` |
| `protocols/protocol_manager.py` | 295-298, 425-428, 564-567 | Hardcoded example strings |
| `database/seeds/seed_mode3_4_sample.sql` | 1-87 | Sample/placeholder mission data |
| `skills_loader_service.py` | 296-300 | `usage_example` parsing from docs |

### Hardcoded Configuration

**File: `unified_agent_loader.py` line 133**
```python
self._platform_tenant_id = "platform"  # Hardcoded tenant ID
```

**File: `services/ask_panel_config.py`**
```python
# Lines 260-261 - Mock mode enabled by default
mock_api_delay_seconds=float(os.getenv("ASK_PANEL_MOCK_DELAY", "0.5")),
mock_enabled=os.getenv("ASK_PANEL_MOCK_ENABLED", "true").lower() == "true",
```

---

## 6. SIMPLE PANEL WORKFLOW - MOCK ANALYSIS

**File:** `workflows/simple_panel_workflow.py`

### Current State
- Lines 236-240: `For MVP: Using mock responses. In production, this would call actual AI agents.`
- Line 85: Logs `mock_enabled=self._config.mock_enabled`
- Lines 326-347: Uses templates OR falls back to hardcoded string

### Missing Real Implementation

```python
# Line 343 - Hardcoded fallback response
content = f"Expert analysis of '{query}': This requires careful consideration..."
```

**Should be replaced with:**
1. Load agent from database by ID
2. Build LLM messages with agent's system prompt
3. Call LLM API (OpenAI/Anthropic)
4. Parse and validate response
5. Extract confidence score from response quality

---

## 7. ACTION PLAN

### Phase 1: Database Tables (Day 1-2) 🔴

```bash
# 1. Run existing migrations
psql $DATABASE_URL < database/migrations/20251211_create_panel_response_templates.sql
psql $DATABASE_URL < database/migrations/20251211_create_user_panels_table.sql

# 2. Create jobs table migration
# File: database/migrations/20251212_create_jobs_table.sql
```

### Phase 2: Repository Rewrites (Day 3-5) 🔴

1. **Replace `job_repo.py` in-memory with Supabase**
   - Create migration for `jobs` table
   - Rewrite all methods to use `self.supabase.table('jobs')`

2. **Replace `conversation_repo.py` in-memory with Supabase**
   - Use existing `conversations` table
   - Add messages to existing conversation structure

### Phase 3: Mock Removal (Day 6-8) 🟠

1. **Disable mock mode in config**
   ```python
   # ask_panel_config.py
   mock_enabled=os.getenv("ASK_PANEL_MOCK_ENABLED", "false").lower() == "true"
   ```

2. **Implement real runner execution**
   - Replace `_mock_*` functions with LLM calls
   - Use agent system prompts from database

3. **Implement real panel expert execution**
   - Load agent configs from database
   - Call LLM with proper prompts
   - Extract structured responses

### Phase 4: TODO Cleanup (Day 9-12) 🟡

1. Implement PostgreSQL checkpointer for LangGraph
2. Add proper admin verification in middleware
3. Implement panel response/consensus repository methods
4. Add streaming support for workflows

### Phase 5: Example Code Cleanup (Day 13-14) 🟡

1. Remove `if __name__ == "__main__":` blocks
2. Move example SQL to separate documentation
3. Replace hardcoded tenant IDs with environment variables

---

## 8. PRIORITY IMPLEMENTATION ORDER

| Priority | Item | Estimated Effort |
|----------|------|------------------|
| 1 | Run missing migrations | 1 hour |
| 2 | Create `jobs` table migration | 2 hours |
| 3 | Rewrite `job_repo.py` to use Supabase | 4 hours |
| 4 | Rewrite `conversation_repo.py` to use Supabase | 4 hours |
| 5 | Disable mock mode, test | 2 hours |
| 6 | Replace runner mocks with real LLM calls | 8 hours |
| 7 | Replace panel expert mocks with real LLM calls | 8 hours |
| 8 | Implement PostgreSQL checkpointer | 6 hours |
| 9 | Implement remaining TODOs | 16 hours |
| 10 | Code cleanup and documentation | 4 hours |

**Total Estimated: ~55 hours**

---

## 9. VERIFICATION COMMANDS

```bash
# Check database tables
source .env && python3 -c "
from supabase import create_client
import os
client = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
for table in ['agents', 'panel_response_templates', 'user_panels', 'jobs', 'conversations']:
    try:
        r = client.table(table).select('*', count='exact').limit(1).execute()
        print(f'{table}: {r.count} rows')
    except: print(f'{table}: NOT FOUND')
"

# Find all TODOs
grep -rn "TODO" services/ai-engine/src --include="*.py" | wc -l

# Find all mock functions
grep -rn "_mock_\|mock_enabled\|MockAgent" services/ai-engine/src --include="*.py"

# Find in-memory stores
grep -rn "In-memory\|_jobs\[" services/ai-engine/src --include="*.py"
```

---

## 10. CONCLUSION

The AI Engine has a mature architecture but is running in "development mode" with:
- **3 missing database tables** preventing persistence
- **2 repositories using in-memory storage** losing data on restart
- **45+ mock functions** returning fake responses
- **76 TODOs** marking incomplete implementations

**Immediate action required:** Run migrations and rewrite repositories before any production use.
