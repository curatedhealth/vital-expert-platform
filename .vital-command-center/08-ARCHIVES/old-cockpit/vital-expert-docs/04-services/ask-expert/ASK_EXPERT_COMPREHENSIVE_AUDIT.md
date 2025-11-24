# ASK EXPERT SERVICES - COMPREHENSIVE END-TO-END AUDIT

**Date**: November 5, 2025
**Scope**: Ask Expert Backend + Frontend + RAG Services + Agent Services
**Goal**: Identify all issues, gaps, and create actionable fix plan

---

## EXECUTIVE SUMMARY

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ASK EXPERT SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Frontend (UI)                                                            │
│  ├─ /app/(app)/ask-expert/page.tsx (Main page - Claude-inspired)        │
│  ├─ /app/(app)/ask-expert/beta/page.tsx (Beta with all 7 components)    │
│  ├─ /app/(app)/ask-expert/page-complete.tsx (Complete integration)      │
│  ├─ /features/ask-expert/components/* (UI Components)                   │
│  └─ /contexts/ask-expert-context.tsx (State management)                 │
│                                                                           │
│  Backend (API Routes)                                                     │
│  ├─ /app/api/ask-expert/route.ts (Main endpoint - streaming)            │
│  ├─ /app/api/ask-expert/chat/route.ts (Chat with mode config)           │
│  └─ /app/api/ask-expert/orchestrate/route.ts (Orchestration)            │
│                                                                           │
│  Core Services (LangGraph Workflow)                                       │
│  ├─ ask-expert-graph.ts (LangGraph workflow orchestration)              │
│  ├─ enhanced-langchain-service.ts (LangChain integration)               │
│  └─ cloud-rag-service.ts (RAG with multiple strategies)                 │
│                                                                           │
│  RAG Services (Knowledge Retrieval)                                       │
│  ├─ unified-rag-service.ts (Pinecone + Supabase)                        │
│  ├─ supabase-rag-service.ts (Supabase vector search)                    │
│  └─ redis-cache-service.ts (Semantic caching) ⚠️ SERVER-ONLY            │
│                                                                           │
│  Agent Services (Multi-Agent)                                             │
│  ├─ master-orchestrator.ts (Single/multi-agent execution)               │
│  ├─ mixture-of-experts.ts (MoE pattern)                                 │
│  ├─ VitalAIOrchestrator.ts (Pharma-focused orchestration)               │
│  ├─ agent-selector-service.ts (Pinecone agent search) ⚠️ SERVER-ONLY    │
│  └─ unified-langgraph-orchestrator-nodes.ts (LangGraph multi-agent)     │
│                                                                           │
│  Python Backend (AI Engine)                                               │
│  ├─ panel_orchestrator.py (Multi-expert panels)                         │
│  └─ medical_orchestrator.py (Medical agent orchestration)               │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Critical Issues Found 🚨

| # | Issue | Severity | Impact | Component |
|---|-------|----------|--------|-----------|
| 1 | **Server-only imports in client code** | 🔴 CRITICAL | Build fails | redis-cache-service, agent-selector-service |
| 2 | **Duplicate Ask Expert pages** | 🟡 MEDIUM | Confusion, maintenance overhead | Multiple page.tsx variants |
| 3 | **Missing 'use client' directives** | 🔴 HIGH | Runtime errors | Context providers, components |
| 4 | **Inconsistent API endpoints** | 🟡 MEDIUM | Unclear which to use | 3 different /api/ask-expert routes |
| 5 | **RAG service architecture mixing** | 🟠 HIGH | Performance, complexity | Multiple RAG services used inconsistently |
| 6 | **Agent orchestration duplication** | 🟡 MEDIUM | Code duplication | 4+ different orchestrators |
| 7 | **Python/TypeScript service boundary unclear** | 🟠 HIGH | Integration issues | Unclear when to use Python vs TS |
| 8 | **Missing error boundaries** | 🟡 MEDIUM | Poor UX on errors | Frontend components |
| 9 | **No loading/skeleton states** | 🟢 LOW | UX polish | Frontend components |
| 10 | **Token tracking inconsistency** | 🟡 MEDIUM | Budget tracking issues | Multiple implementations |

---

## PHASE 1: BACKEND SERVICES AUDIT

### 1.1 API Routes Analysis

#### `/app/api/ask-expert/route.ts` ✅ PRIMARY ENDPOINT
**Status**: Well-implemented, production-ready
**Features**:
- ✅ LangGraph workflow integration
- ✅ Streaming support (SSE)
- ✅ Budget checking
- ✅ Token tracking
- ✅ RAG integration
- ✅ Memory management
- ✅ Analytics tracking

**Issues**:
- ⚠️ Imports `streamAskExpertWorkflow` which uses `ioredis` (server-only)
- ⚠️ No rate limiting
- ⚠️ No request validation schema (Zod)

**Recommendation**: **KEEP** as primary endpoint

#### `/app/api/ask-expert/chat/route.ts` ❓ DUPLICATE
**Status**: Partially implemented, unclear purpose
**Features**:
- Mode configuration mapping
- API Gateway integration (Python backend)
- Domain filtering

**Issues**:
- ⚠️ Duplicate functionality with main route
- ⚠️ Incomplete implementation (no exports)
- ⚠️ References Python AI Engine (integration unclear)

**Recommendation**: **CONSOLIDATE** or **DELETE**

#### `/app/api/ask-expert/orchestrate/route.ts` ❓ UNCLEAR
**Status**: Unknown (not fully scanned)

**Recommendation**: **REVIEW** and decide keep/merge/delete

---

### 1.2 Core Services Analysis

#### `ask-expert-graph.ts` ✅ CORE SERVICE
**Status**: Well-architected, production-ready
**Architecture**: LangGraph StateGraph with 3 nodes
1. `checkBudget` - User limits and budget validation
2. `retrieveContext` - RAG (Pinecone + Supabase)
3. `generateResponse` - AI response with citations

**Strengths**:
- ✅ Excellent architecture (LangGraph)
- ✅ Memory persistence
- ✅ Streaming support
- ✅ Comprehensive logging
- ✅ Error handling
- ✅ Analytics integration

**Issues**:
- ⚠️ Uses `unifiedRAGService` which imports `redis-cache-service` (ioredis - server-only)
- ⚠️ Budget check gracefully degrades but logs warning

**Recommendation**: **KEEP** - Just fix ioredis dependency

---

### 1.3 RAG Services Analysis

#### `unified-rag-service.ts` 🔴 CRITICAL ISSUE
**Status**: Architecture issue - imports server-only module
**Features**:
- Pinecone vector search
- Supabase metadata enrichment
- Agent-optimized strategy

**Issues**:
- 🔴 **BLOCKER**: Imports `redis-cache-service.ts` which uses `ioredis`
- ioredis cannot run in browser (needs Node.js `dns`, `net`, `tls`)

**Fix Options**:
1. **Option A** (Quick): Remove Redis caching from unified-rag-service
2. **Option B** (Proper): Move unified-rag-service to API route only
3. **Option C** (Best): Create thin client wrapper + server implementation

**Recommendation**: **Option B** - Never import in client code

#### `cloud-rag-service.ts` ✅ GOOD
**Status**: Clean, no server-only dependencies
**Features**:
- 8 retrieval strategies (basic, rag_fusion, hybrid, hybrid_rerank, etc.)
- Cohere re-ranking
- Supabase + OpenAI integration

**Issues**:
- ⚠️ Duplicates some unified-rag-service functionality

**Recommendation**: **KEEP** - Consider consolidating with unified-rag-service later

#### `supabase-rag-service.ts` ✅ GOOD
**Status**: Supabase-specific implementation
**Recommendation**: **KEEP**

---

### 1.4 Agent Services Analysis

#### `agent-selector-service.ts` 🔴 CRITICAL ISSUE
**Status**: Uses server-only library (Pinecone SDK)
**Features**:
- Agent search using Pinecone
- Multi-criteria ranking
- Query analysis with OpenAI

**Issues**:
- 🔴 **BLOCKER**: Uses `@pinecone-database/pinecone` (server-only)
- Used in Mode 2 automatic agent selection

**Fix Options**:
1. Move to API route: `/api/agents/select`
2. Use Supabase vector search instead (client-compatible)

**Recommendation**: **Option 1** - Create `/api/agents/select` endpoint

#### `master-orchestrator.ts` ✅ GOOD
**Status**: Clean orchestration service
**Features**:
- Single/multi-agent execution
- Response synthesis
- Confidence calculation

**Recommendation**: **KEEP**

#### `VitalAIOrchestrator.ts` ✅ GOOD
**Status**: Pharma-focused orchestration
**Recommendation**: **KEEP** - Specialized for pharmaceutical use cases

#### `mixture-of-experts.ts` ✅ GOOD
**Status**: MoE pattern implementation
**Recommendation**: **KEEP**

---

## PHASE 2: FRONTEND AUDIT

### 2.1 Pages Analysis

#### `/app/(app)/ask-expert/page.tsx` ✅ PRIMARY
**Status**: Production main page
**Style**: Claude.ai-inspired minimal interface
**Features**:
- Clean prompt composer
- 2 simple toggles (Automatic/Autonomous)
- Real-time streaming
- Conversation sidebar
- Dark/light mode

**Issues**:
- ⚠️ Large file (needs refactoring)
- ⚠️ No error boundaries

**Recommendation**: **KEEP** as primary, refactor later

#### `/app/(app)/ask-expert/beta/page.tsx` ❓ BETA
**Status**: Beta testing page
**Features**: All 7 UI/UX enhancement components

**Recommendation**: **CONSOLIDATE** features into main page or **DELETE**

#### `/app/(app)/ask-expert/page-complete.tsx` ❓ DUPLICATE
**Status**: Duplicate of beta page

**Recommendation**: **DELETE**

#### `/app/(app)/ask-expert/page-gold-standard.tsx` ❓ VARIANT
**Recommendation**: **REVIEW** and **DELETE** if unused

#### `/app/(app)/ask-expert/page-modern.tsx` ❓ VARIANT
**Recommendation**: **REVIEW** and **DELETE** if unused

#### `/app/(app)/ask-expert-copy/page.tsx` ❓ BACKUP
**Recommendation**: **DELETE** (backup file)

---

### 2.2 Components Analysis

#### `features/ask-expert/components/*` ✅ GOOD
**Status**: UI component library
**Components**:
- EnhancedModeSelector
- ExpertAgentCard
- EnhancedMessageDisplay
- InlineDocumentGenerator
- NextGenChatInput
- IntelligentSidebar
- AdvancedStreamingWindow

**Recommendation**: **KEEP** - These are good modular components

#### `contexts/ask-expert-context.tsx` 🔴 MISSING 'use client'
**Status**: Context provider without directive
**Issue**: Will cause hydration errors

**Fix**: Add `'use client'` at top of file

**Recommendation**: **FIX** immediately

---

### 2.3 Chat Components Analysis

#### `chat-messages.tsx` ✅ GOOD
**Status**: Solid message rendering
**Features**:
- Citation rendering
- Source display
- Reasoning display
- Loading states

**Recommendation**: **KEEP**

#### `ChatMessageArea.tsx` ✅ GOOD
**Status**: Main chat area component
**Recommendation**: **KEEP**

---

## PHASE 3: INTEGRATION ISSUES

### 3.1 Python Backend Integration ❓ UNCLEAR

**Files**:
- `services/ai-engine/src/services/panel_orchestrator.py`
- `agents/core/medical_orchestrator.py`

**Issue**: Unclear when TypeScript vs Python backend is used

**Questions**:
1. Is Python AI Engine actively used?
2. What endpoints call Python backend?
3. Is it deployed?

**Recommendation**: **CLARIFY** integration architecture

---

### 3.2 RAG Strategy Selection 🟡 INCONSISTENT

**Multiple Strategies Found**:
- `ask-expert-graph.ts`: Uses `unifiedRAGService` with `'agent-optimized'`
- `cloud-rag-service.ts`: Supports 8 strategies (`hybrid_rerank` recommended)
- `ask-expert/chat/route.ts`: Mode-based strategy mapping

**Issue**: No clear guidance on which strategy to use when

**Recommendation**: **STANDARDIZE** - Create RAG strategy decision matrix

---

## PHASE 4: CRITICAL FIXES REQUIRED

### Priority 1: Build-Blocking Issues 🔴

#### Fix #1: Remove ioredis from client code
**Files to fix**:
1. `unified-rag-service.ts` - Remove redis-cache import
2. `ask-expert-graph.ts` - Use cloud-rag-service instead
3. `redis-cache-service.ts` - Mark as server-only (add comment)

**Implementation**:
```typescript
// Option A: Conditional import (server-side only)
const redisCacheService = typeof window === 'undefined' 
  ? await import('./redis-cache-service')
  : null;

// Option B: Remove caching temporarily
// (Simplest for now)
```

#### Fix #2: Move agent-selector-service to API route
**Create**: `/api/agents/select/route.ts`
**Move**: All agent selection logic to server
**Update**: Frontend to call API instead of direct import

---

### Priority 2: Cleanup & Consolidation 🟡

#### Fix #3: Delete duplicate Ask Expert pages
**Delete**:
- `/app/(app)/ask-expert/page-complete.tsx`
- `/app/(app)/ask-expert/page-gold-standard.tsx` (if unused)
- `/app/(app)/ask-expert/page-modern.tsx` (if unused)
- `/app/(app)/ask-expert-copy/page.tsx`

#### Fix #4: Consolidate or delete `/app/api/ask-expert/chat/route.ts`
**Decision needed**: Merge into main route or delete?

---

### Priority 3: Add Missing Directives 🟠

#### Fix #5: Add 'use client' to context providers
**Files**:
- `/contexts/ask-expert-context.tsx`
- Review all context files in `/contexts/*`

---

## PHASE 5: RECOMMENDATIONS

### Short-term (This Week)
1. ✅ Fix ioredis issue (Priority 1, Fix #1)
2. ✅ Move agent-selector to API (Priority 1, Fix #2)
3. ✅ Delete duplicate pages (Priority 2, Fix #3)
4. ✅ Add 'use client' directives (Priority 3, Fix #5)
5. ✅ Test end-to-end Ask Expert flow

### Medium-term (Next 2 Weeks)
1. Refactor main Ask Expert page into smaller components
2. Add error boundaries
3. Standardize RAG strategy selection
4. Add request validation (Zod schemas)
5. Add rate limiting

### Long-term (Next Month)
1. Consolidate RAG services
2. Consolidate agent orchestrators
3. Add comprehensive testing
4. Performance optimization
5. Documentation

---

## PHASE 6: SUCCESS CRITERIA

### How do we know Ask Expert is production-ready?

✅ **Functional Requirements**:
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] Can send message and get response
- [ ] Streaming works
- [ ] Citations display correctly
- [ ] Agent selection works (auto and manual)
- [ ] Budget tracking works
- [ ] Chat history persists

✅ **Non-Functional Requirements**:
- [ ] < 2s response time (first token)
- [ ] < 5s total response time
- [ ] No memory leaks
- [ ] Graceful error handling
- [ ] Proper loading states
- [ ] Mobile responsive

✅ **Code Quality**:
- [ ] No console errors
- [ ] No build warnings
- [ ] ESLint passes
- [ ] TypeScript strict mode
- [ ] Proper error boundaries

---

## NEXT STEPS

**Recommended approach**:

```bash
# Step 1: Fix build blockers (1-2 hours)
1. Remove ioredis from unified-rag-service
2. Create /api/agents/select endpoint
3. Update imports

# Step 2: Cleanup (30 min)
4. Delete duplicate pages
5. Add 'use client' directives

# Step 3: Test (1 hour)
6. Test Ask Expert end-to-end
7. Verify streaming works
8. Check agent selection
9. Verify citations

# Step 4: Document (30 min)
10. Update README with Ask Expert usage
11. Document API endpoints
12. Create troubleshooting guide
```

**Total estimated time**: 4 hours

---

## APPENDIX: File Inventory

### Backend Services (TypeScript)
```
src/features/chat/services/
├── ask-expert-graph.ts              ✅ CORE (fix ioredis)
├── enhanced-langchain-service.ts    ✅ KEEP
├── cloud-rag-service.ts             ✅ KEEP
├── unified-rag-service.ts           🔴 FIX (remove ioredis)
└── agent-selector-service.ts        🔴 MOVE TO API

src/lib/services/rag/
├── unified-rag-service.ts           🔴 FIX (remove ioredis)
├── supabase-rag-service.ts          ✅ KEEP
└── redis-cache-service.ts           ⚠️ SERVER-ONLY

src/shared/services/orchestration/
├── master-orchestrator.ts           ✅ KEEP
├── response-synthesizer.ts          ✅ KEEP
└── confidence-calculator.ts         ✅ KEEP

src/agents/core/
├── VitalAIOrchestrator.ts           ✅ KEEP
└── medical_orchestrator.py          ❓ REVIEW

src/lib/services/agents/patterns/
└── mixture-of-experts.ts            ✅ KEEP
```

### API Routes
```
src/app/api/ask-expert/
├── route.ts                         ✅ PRIMARY
├── chat/route.ts                    ❓ REVIEW/DELETE
└── orchestrate/route.ts             ❓ REVIEW
```

### Frontend Pages
```
src/app/(app)/ask-expert/
├── page.tsx                         ✅ PRIMARY
├── beta/page.tsx                    ❓ CONSOLIDATE/DELETE
├── page-complete.tsx                ❌ DELETE
├── page-gold-standard.tsx           ❓ REVIEW/DELETE
└── page-modern.tsx                  ❓ REVIEW/DELETE

src/app/(app)/ask-expert-copy/
└── page.tsx                         ❌ DELETE (backup)
```

### Frontend Components
```
src/features/ask-expert/components/
├── EnhancedModeSelector.tsx         ✅ KEEP
├── ExpertAgentCard.tsx              ✅ KEEP
├── EnhancedMessageDisplay.tsx       ✅ KEEP
├── InlineDocumentGenerator.tsx      ✅ KEEP
├── NextGenChatInput.tsx             ✅ KEEP
├── IntelligentSidebar.tsx           ✅ KEEP
└── AdvancedStreamingWindow.tsx      ✅ KEEP

src/features/chat/components/
├── chat-messages.tsx                ✅ KEEP
├── ChatMessageArea.tsx              ✅ KEEP
└── chat-input.tsx                   ✅ KEEP

src/contexts/
└── ask-expert-context.tsx           🔴 FIX ('use client')
```

---

**END OF AUDIT**

Ready to proceed with fixes? Let's start with Priority 1 (build blockers).

