# BUILD FIX PLAN - SERVER/CLIENT ARCHITECTURE REFACTOR

**Goal**: Get `npm run build` working
**Commitment**: Don't stop until build succeeds
**Estimated Time**: 20-40 hours

---

## PHASE 1: IDENTIFY ALL PROBLEMATIC IMPORTS

### Files Using Server-Only Libraries in Client Context:

From build error analysis:

1. **Redis (ioredis) - Server Only**
   - `src/features/rag/caching/redis-cache-service.ts`
   - `src/lib/services/rag/unified-rag-service.ts` (imports redis-cache)
   - `src/features/chat/services/react-engine.ts`
   - `src/features/chat/services/mode2-automatic-agent-selection.ts`
   - `src/features/chat/services/mode3-autonomous-automatic.ts`
   - `src/features/chat/services/mode4-autonomous-manual.ts`
   - `src/features/chat/services/langgraph-mode-orchestrator.ts`

2. **Pinecone SDK - Server Only**
   - `src/features/chat/services/agent-selector-service.ts`
   - `src/features/chat/services/mode2-automatic-agent-selection.ts`

3. **next/headers - Server Only**
   - `src/lib/supabase/server.ts` (imported in client services)

---

## PHASE 2: REFACTORING STRATEGY

### Option A: Move Services to API Routes (CHOSEN)
For each problematic service, create an API endpoint and refactor client to call it.

### Steps:
1. Create API route for service
2. Move service logic to API route
3. Update client code to call API via fetch
4. Handle loading/error states

---

## PHASE 3: EXECUTION PLAN

### Batch 1: Redis Services (High Priority)
**Files**: redis-cache-service, unified-rag-service
**Action**: Create `/api/cache/*` and `/api/rag/*` endpoints
**Time**: 4-6 hours

### Batch 2: Mode Services (Critical)
**Files**: mode2, mode3, mode4 services  
**Action**: Move logic to API routes, update client calls
**Time**: 6-8 hours

### Batch 3: Agent Selector (High Priority)
**Files**: agent-selector-service
**Action**: Create `/api/agents/select` endpoint
**Time**: 2-3 hours

### Batch 4: LangGraph Orchestrator (Complex)
**Files**: langgraph-mode-orchestrator
**Action**: Create `/api/orchestrate/*` endpoints
**Time**: 4-6 hours

### Batch 5: React Engine (Complex)
**Files**: react-engine
**Action**: Refactor to server-only or API
**Time**: 3-4 hours

### Batch 6: Testing & Verification
**Action**: Run build, fix any new issues
**Time**: 2-4 hours

---

## TOTAL ESTIMATED TIME: 21-31 HOURS

---

## TRACKING

- [ ] Phase 1: Identify (Complete)
- [ ] Phase 2: Strategy (Complete)  
- [ ] Phase 3: Execute Batch 1 (Redis)
- [ ] Phase 3: Execute Batch 2 (Modes)
- [ ] Phase 3: Execute Batch 3 (Agent Selector)
- [ ] Phase 3: Execute Batch 4 (LangGraph)
- [ ] Phase 3: Execute Batch 5 (React Engine)
- [ ] Phase 3: Execute Batch 6 (Testing)
- [ ] VERIFY: npm run build succeeds


