# VITAL Ask Expert Service - Comprehensive Audit Report

**Audit Date:** November 27, 2025
**Auditor:** Claude Code
**Version:** 1.0
**Status:** COMPLETE

---

## Executive Summary

This audit evaluates the VITAL Ask Expert Service codebase against the PRD v1.2.1 and ARD v1.2.1 requirements, assessing production readiness and identifying gaps.

### Overall Scores

| Category | Score | Status |
|----------|-------|--------|
| **Backend Implementation** | 78/100 | Good |
| **Frontend Implementation** | 70/100 | Good |
| **RAG System** | 82/100 | Very Good |
| **PRD/ARD Alignment** | 72/100 | Good |
| **Production Readiness** | 65/100 | Needs Work |
| **Security & Compliance** | 75/100 | Good |

**Overall: 73.7/100 - GOOD (Phase 1 Ready with Blockers)**

---

## 1. Backend Implementation Audit

### 1.1 LangGraph Workflows (Score: 85/100)

**Location:** `/services/ai-engine/src/langgraph_workflows/`

| Mode | File | Size | Status | Notes |
|------|------|------|--------|-------|
| Mode 1 (Interactive + Manual) | `mode1_interactive_manual.py` | 52KB | COMPLETE | Full implementation |
| Mode 2 (Interactive + Auto) | `mode2_interactive_automatic.py` | 37KB | COMPLETE | Agent selection integrated |
| Mode 3 (Autonomous + Manual) | `mode3_manual_chat_autonomous.py` | 53KB | COMPLETE | HITL checkpoints implemented |
| Mode 4 (Autonomous + Auto) | `mode4_auto_chat_autonomous.py` | 58KB | COMPLETE | Multi-agent orchestration |

**PRD Alignment:**
- All 4 modes from the 2-toggle system implemented
- Chain-of-thought reasoning: IMPLEMENTED
- Checkpoint system: IMPLEMENTED
- Response streaming: IMPLEMENTED

**Gaps:**
- Deep Agent tools (TodoList, Filesystem, SubAgent) are stub implementations
- Evidence scoring not fully integrated into responses

### 1.2 Agent Selector Service (Score: 75/100)

**Location:** `/services/ai-engine/src/services/agent_selector_service.py`

**Features Implemented:**
- LLM-powered query analysis (intent, domains, complexity)
- Embedding-based agent matching
- Multi-criteria ranking
- Structured logging and metrics

**PRD Alignment:**
- **Target:** 3-Method Hybrid Selection (PostgreSQL 30% + Pinecone 50% + Neo4j 20%)
- **Current:** Pinecone-only semantic search (Phase 1 scope)
- RRF Fusion: NOT INTEGRATED (code exists but not wired)

**Critical Gap:**
```
PRD Target: PostgreSQL (30%) + Pinecone (50%) + Neo4j (20%)
Current:    Pinecone (100%) only
```

### 1.3 GraphRAG System (Score: 82/100)

**Location:** `/services/ai-engine/src/graphrag/`

**Components Implemented:**
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Main Service | `service.py` | COMPLETE | Orchestrates all search methods |
| Vector Search | `search/vector_search.py` | COMPLETE | Pinecone integration |
| Keyword Search | `search/keyword_search.py` | COMPLETE | PostgreSQL full-text |
| Graph Search | `search/graph_search.py` | IMPLEMENTED | Needs Neo4j connection |
| Hybrid Fusion | `search/fusion.py` | COMPLETE | RRF implementation |
| Evidence Builder | `evidence_builder.py` | COMPLETE | Citation management |
| Reranker | `reranker.py` | COMPLETE | Optional reranking |

**Clients Implemented:**
| Client | File | Status | Notes |
|--------|------|--------|-------|
| Neo4j Client | `clients/neo4j_client.py` | CODE READY | Needs deployment |
| PostgreSQL Client | `clients/postgres_client.py` | COMPLETE | Working |
| Vector DB Client | `clients/vector_db_client.py` | COMPLETE | Pinecone working |
| Elasticsearch Client | `clients/elastic_client.py` | COMPLETE | Optional |

**Gap:** Neo4j client implemented but **not connected to live database**

### 1.4 Observability (Score: 55/100)

**Location:** `/services/ai-engine/src/langgraph_workflows/observability.py`

**Current State:**
- Using **LangSmith** (not Langfuse as required)
- Langfuse monitor exists at `/services/ai-engine/src/services/langfuse_monitor.py` but **NOT INTEGRATED**

**PRD Requirement:** Langfuse for observability
**Current:** LangSmith stub (fallback to local logging)

**Critical Gap:**
```python
# observability.py currently uses:
from langsmith import Client as LangSmithClient  # NOT Langfuse!

# langfuse_monitor.py exists but is NOT imported anywhere
```

### 1.5 User Context Middleware (Score: 40/100)

**Location:** `/services/api-gateway/src/middleware/`

**Current State:**
- `tenant.js` - Tenant context extraction (COMPLETE)
- `user-context.js` - **DOES NOT EXIST**

**PRD Requirement:** User context middleware for RLS enforcement
**Current:** Tenant context only, no user context

**Critical Gap:** RLS policies depend on `auth.uid()` which requires user context

---

## 2. Frontend Implementation Audit

### 2.1 Ask Expert UI (Score: 70/100)

**Location:** `/apps/vital-system/src/`

**Components Found:**
| Component | Location | Status |
|-----------|----------|--------|
| Ask Expert Context | `contexts/ask-expert-context.tsx` | COMPLETE |
| Ask Panel Context | `contexts/ask-panel-context.tsx` | COMPLETE |
| Ask Panel Page | `app/(app)/ask-panel/page.tsx` | COMPLETE |
| Ask Expert Page | `app/(app)/ask-expert-copy/page.tsx` | PARTIAL |
| Panel Interface | `app/(app)/ask-panel/components/panel-interface.tsx` | COMPLETE |
| Panel Builder | `app/(app)/ask-panel/components/panel-builder.tsx` | COMPLETE |

**PRD Alignment:**
- Mode selection UI: PARTIAL (needs 2x2 grid)
- Expert browser: IMPLEMENTED
- Chat interface: IMPLEMENTED
- Agent selection: IMPLEMENTED
- Conversation history: IMPLEMENTED

**Gaps:**
- No visual 2x2 mode selector grid
- No Mode 3/4 autonomous workflow UI
- HITL checkpoint approval UI not visible in codebase

### 2.2 E2E Tests (Score: 80/100)

**Location:** `/apps/vital-system/e2e/`

**Tests Found:**
- `ask-expert.spec.ts` - Ask Expert flow tests
- `ask-panel.spec.ts` - Ask Panel tests
- `auth.spec.ts` - Authentication tests
- `dashboard.spec.ts` - Dashboard tests

---

## 3. Database & Schema Audit

### 3.1 Agent Activation (Score: 60/100)

**Location:** `/database/migrations/`

**Issue:** PRD requires 136+ active agents for Phase 1, but:
```sql
-- agents table has status column with enum: active, inactive, testing
-- Current query filters: WHERE status = 'active'
```

**Gap:** Need SQL script to activate agents - currently unknown how many are active

### 3.2 RLS Policies (Score: 75/100)

**Location:** `/apps/pharma/database/migrations/002_row_level_security.sql`

**Implemented:**
- Tenant isolation policies
- User-based policies
- Admin escalation
- Audit logging policies

**Gap:** RLS functions use `auth.uid()` which requires Supabase Auth context, but API calls use service role

### 3.3 RLS Context Functions (Score: 85/100)

**Location:** `/database/migrations/20251126_005_fix_rls_context_setting.sql`

**Implemented:**
- `set_organization_context(p_organization_id UUID)` - Sets tenant
- `set_tenant_context(p_tenant_id UUID)` - Legacy alias
- `get_current_organization_context()` - Retrieves context

**Gap:** No `set_user_context()` function for user-level RLS

---

## 4. PRD/ARD Alignment Summary

### 4.1 Phase 1 Requirements vs Implementation

| Requirement | PRD Phase 1 | Current Status | Gap |
|-------------|-------------|----------------|-----|
| Agent Count | 136+ active | Unknown (6 mentioned in fix plan) | CRITICAL |
| Agent Selection | Pinecone semantic | Implemented | OK |
| Mode 1 | Complete | Implemented | OK |
| Mode 2 | Complete | Implemented | OK |
| Mode 3 | Complete | Implemented | OK |
| Mode 4 | Complete | Implemented | OK |
| HITL Checkpoints | Required | Implemented | OK |
| User Context Middleware | Required | NOT DEPLOYED | CRITICAL |
| Langfuse Observability | Required | NOT INTEGRATED | HIGH |
| Neo4j GraphRAG | Phase 2 | Code ready, not deployed | OK (Phase 2) |

### 4.2 Architecture Alignment

| ARD Component | Required | Implemented | Status |
|---------------|----------|-------------|--------|
| LangGraph StateGraph | Yes | Yes | ALIGNED |
| Checkpoint Manager | Yes | Yes | ALIGNED |
| WebSocket Streaming | Yes | Yes | ALIGNED |
| Multi-tenant RLS | Yes | Partial | GAP |
| Hybrid Selection | Phase 2 | Code exists | OK |
| Deep Agents | Phase 2 | Stubs only | OK |
| Evidence Scoring | Phase 2 | Partial | OK |

---

## 5. Production Readiness Assessment

### 5.1 Critical Blockers (Must Fix Before Launch)

| # | Blocker | Impact | Effort | Priority |
|---|---------|--------|--------|----------|
| 1 | **Agent Activation** | Users see no agents | Low | P0 |
| 2 | **User Context Middleware** | RLS fails, security risk | Medium | P0 |
| 3 | **Langfuse Integration** | No observability | Medium | P1 |
| 4 | **Neo4j Connection** | Hybrid selection incomplete | Medium | P2 (Phase 2) |

### 5.2 Recommended Fix Sequence

```
Day 1-2: Agent Activation + User Context Middleware (P0)
Day 3-4: Langfuse Integration (P1)
Day 5-7: Testing + Validation
Phase 2: Neo4j deployment + 3-method hybrid
```

### 5.3 Security Considerations

| Area | Status | Notes |
|------|--------|-------|
| Tenant Isolation | GOOD | RLS policies in place |
| User Authentication | GOOD | Supabase Auth |
| Input Validation | GOOD | Pydantic models |
| API Rate Limiting | PARTIAL | Middleware exists but disabled |
| Audit Logging | GOOD | Policies exist |
| Data Encryption | GOOD | Supabase handles |

---

## 6. Detailed Gaps & Recommendations

### 6.1 Gap #1: Agent Activation

**Problem:** Only 6 agents reported active, PRD requires 136+

**Root Cause:** Agents in database likely have `status = 'inactive'` or `status = 'testing'`

**Fix:**
```sql
-- Run in Supabase SQL Editor
UPDATE agents
SET status = 'active'
WHERE status IN ('inactive', 'testing')
  AND name IS NOT NULL
  AND description IS NOT NULL;

-- Verify count
SELECT status, COUNT(*) FROM agents GROUP BY status;
```

### 6.2 Gap #2: User Context Middleware

**Problem:** Service role API calls don't set user context for RLS

**Fix Required:**
1. Create `user-context.js` middleware in `/services/api-gateway/src/middleware/`
2. Add `set_user_context()` RPC function in database
3. Call RPC at start of every request

**Implementation:**
```javascript
// middleware/user-context.js
async function userContextMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (userId) {
    await supabase.rpc('set_user_context', { p_user_id: userId });
  }
  next();
}
```

### 6.3 Gap #3: Langfuse Integration

**Problem:** observability.py uses LangSmith, not Langfuse

**Fix:**
1. Replace LangSmith imports with Langfuse
2. Wire `langfuse_monitor.py` into workflow execution
3. Add environment variables: `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`

### 6.4 Gap #4: Mode UI (2x2 Grid)

**Problem:** Frontend doesn't show visual 2x2 mode selector

**Recommendation:** Add mode selector component matching PRD spec

---

## 7. Test Coverage Assessment

### 7.1 Backend Tests

**Location:** `/services/ai-engine/src/tests/`

| Category | Files | Coverage |
|----------|-------|----------|
| Unit | `tests/unit/` | GOOD |
| Integration | `tests/integration/` | GOOD |
| GraphRAG | `tests/graphrag/` | GOOD |
| Security | `tests/security/` | PARTIAL |
| Mode 1-4 | `tests/integration/test_mode*.py` | COMPLETE |

### 7.2 Frontend Tests

| Category | Location | Status |
|----------|----------|--------|
| E2E | `e2e/` | GOOD |
| Unit | `__tests__/` | PARTIAL |
| Integration | `tests/integration/` | GOOD |

---

## 8. Performance Benchmarks

### 8.1 PRD Targets vs Actual (from fix plan)

| Mode | PRD Target (API Latency) | Actual | Status |
|------|--------------------------|--------|--------|
| Mode 1 | <500ms | 475ms | PASS |
| Mode 2 | <400ms | 335ms | PASS |
| Mode 3 | <2s | 1.95s | PASS |
| Mode 4 | <5s | 4.67s | PASS |

All API latency targets are being met.

---

## 9. Conclusion & Next Steps

### Summary

The VITAL Ask Expert Service codebase is **substantially complete** for Phase 1 launch with the following caveats:

**Strengths:**
- All 4 modes implemented with LangGraph
- GraphRAG system well-architected
- Checkpoint/HITL system in place
- Good test coverage
- Security policies defined

**Critical Issues:**
1. Agent activation - trivial fix
2. User context middleware - moderate fix
3. Langfuse not integrated - moderate fix

### Recommended Action Plan

| Phase | Days | Tasks |
|-------|------|-------|
| **Phase 1** | 1-3 | Agent activation SQL, User context middleware |
| **Phase 2** | 3-5 | Langfuse integration |
| **Phase 3** | 5-7 | Integration testing, staging deployment |
| **Phase 4** | 7-10 | Production deployment, monitoring setup |

### Sign-off Criteria

- [ ] 136+ agents active in database
- [ ] User context middleware deployed
- [ ] Langfuse receiving traces
- [ ] All mode integration tests passing
- [ ] E2E tests passing
- [ ] Security audit cleared

---

**Report Generated:** November 27, 2025
**Next Review:** Pre-launch checkpoint
