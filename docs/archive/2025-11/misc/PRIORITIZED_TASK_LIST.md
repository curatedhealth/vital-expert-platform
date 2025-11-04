# Prioritized Task List - Remaining Items

**Date**: January 2025  
**Status**: Core functionality complete, infrastructure created  
**Completion**: ~85% of original plan

---

## 🚨 CRITICAL PRIORITY (Must Complete Before Production)

### ✅ Already Complete
- ✅ localStorage migration (ALL modes)
- ✅ Agent fetching fixes (namespace bug, GraphRAG integration)
- ✅ Structured logging and observability
- ✅ Error handling with typed exceptions
- ✅ Database migrations created

### 📋 Immediate Actions Needed

#### 1. Run Database Migrations (5 min)
**Priority**: CRITICAL  
**Status**: Pending

- [ ] Run `20250129000001_create_ask_expert_sessions.sql` (manual in Supabase SQL Editor)
- [ ] Run `20250129000002_create_user_conversations_table.sql` (manual in Supabase SQL Editor)
- [ ] Verify tables exist:
  ```sql
  SELECT COUNT(*) FROM ask_expert_sessions;
  SELECT COUNT(*) FROM ask_expert_messages;
  SELECT COUNT(*) FROM user_conversations;
  ```

**Impact**: Without these tables, conversations and session tracking won't work.

---

#### 2. Testing Suite (High Priority for Production)
**Priority**: CRITICAL  
**Status**: Not Started  
**Est. Time**: 2-3 days

**Unit Tests:**
- [ ] `user-agents-service.test.ts` - Service methods, error handling, validation
- [ ] `conversations-service.test.ts` - CRUD operations, migration
- [ ] `agent-selector-service.test.ts` - GraphRAG search, fallbacks, ranking
- [ ] `circuit-breaker.test.ts` - State transitions, timeout handling
- [ ] `embedding-cache.test.ts` - Cache hit/miss, TTL, eviction

**Integration Tests:**
- [ ] `user-agents-api.test.ts` - API endpoints, authentication
- [ ] `conversations-api.test.ts` - API endpoints (if created)
- [ ] `agent-fetching-integration.test.ts` - GraphRAG → fallback flow

**E2E Tests:**
- [ ] `chat-agent-management.e2e.test.ts` - Add/remove agents
- [ ] `mode2-agent-selection.e2e.test.ts` - Automatic selection
- [ ] `mode3-agent-selection.e2e.test.ts` - Autonomous selection

**Coverage Target**: >80% for critical services

---

#### 3. API Endpoint for Conversations (High Priority)
**Priority**: HIGH  
**Status**: Service created, API endpoint missing  
**Est. Time**: 1-2 hours

**File**: `apps/digital-health-startup/src/app/api/conversations/route.ts` (new)

**Endpoints Needed:**
- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create conversation
- `PUT /api/conversations/[id]` - Update conversation
- `DELETE /api/conversations/[id]` - Delete conversation

**Should Include:**
- Zod validation
- Structured logging
- Error handling with typed exceptions
- Authentication/authorization
- Rate limiting

---

## 🔴 HIGH PRIORITY (For Production Quality)

### 4. Type System Consolidation (Code Quality)
**Priority**: HIGH  
**Status**: Not Started  
**Est. Time**: 4-6 hours

**Problem**: 9 different Agent type definitions exist across codebase

**Files to Consolidate:**
- `lib/types/agent.types.ts`
- `shared/types/agent.types.ts`
- `shared/types/digital-health-agent.types.ts`
- `features/agents/types/agent.types.ts`
- `types/agent.types.ts`
- `types/enhanced-agent-types.ts`
- `types/autonomous-agent.types.ts`
- `types/digital-health-agent.types.ts`
- `packages/types/src/agents/agent.types.ts`

**Action:**
- [ ] Create unified `lib/types/agents/index.ts`
- [ ] Create type adapters for migration
- [ ] Update all imports across codebase
- [ ] Remove duplicate definitions

**Benefit**: Better type safety, easier maintenance

---

### 5. Enhanced Error Recovery (Resilience)
**Priority**: HIGH  
**Status**: Circuit breaker created, integration needed  
**Est. Time**: 2-3 hours

**Integrate Circuit Breakers:**
- [ ] Integrate Pinecone circuit breaker in `agent-selector-service.ts`
- [ ] Integrate Supabase circuit breaker in `user-agents-service.ts`
- [ ] Integrate circuit breaker in `conversations-service.ts`

**Example Integration:**
```typescript
import { getPineconeCircuitBreaker } from '@/lib/services/resilience/circuit-breaker';

const breaker = getPineconeCircuitBreaker();
const results = await breaker.execute(() => agentsNamespace.query(searchParams));
```

**Add Retry Logic:**
- [ ] Implement exponential backoff retry in services
- [ ] Add retry only for transient errors
- [ ] Log retry attempts

---

### 6. Performance Optimizations (High Impact)
**Priority**: HIGH  
**Status**: Embedding cache created, integration needed  
**Est. Time**: 2-3 hours

**Integrate Embedding Cache:**
- [ ] Integrate in `agent-selector-service.ts` (before OpenAI API call)
- [ ] Integrate in `agent-embedding-service.ts`
- [ ] Add cache metrics to Prometheus

**Example Integration:**
```typescript
import { getEmbeddingCache } from '@/lib/services/cache/embedding-cache';

const cache = getEmbeddingCache();
let embedding = cache.get(query);
if (!embedding) {
  embedding = await generateEmbedding(query);
  cache.set(query, embedding);
}
```

**Connection Pooling:**
- [ ] Verify Supabase client pooling is optimal
- [ ] Verify Pinecone connection reuse
- [ ] Add connection metrics

---

## 🟡 MEDIUM PRIORITY (Nice to Have)

### 7. Distributed Tracing Integration
**Priority**: MEDIUM  
**Status**: Service created, integration needed  
**Est. Time**: 3-4 hours

**Integrate Tracing:**
- [ ] Add tracing to agent search operations
- [ ] Add tracing to GraphRAG calls
- [ ] Add tracing to user agent CRUD
- [ ] Integrate with OpenTelemetry (optional, for production)

**Consider Full OpenTelemetry:**
- [ ] Install @opentelemetry packages
- [ ] Configure exporters (Jaeger, Datadog, etc.)
- [ ] Add automatic instrumentation

---

### 8. Documentation
**Priority**: MEDIUM  
**Status**: Partial  
**Est. Time**: 4-6 hours

**API Documentation:**
- [ ] `docs/API/user-agents.md` - API endpoints, schemas, examples
- [ ] `docs/API/conversations.md` - API endpoints (if created)
- [ ] `docs/API/agent-search.md` - Search API documentation

**Service Documentation:**
- [ ] `docs/services/user-agents-service.md` - Architecture, usage, examples
- [ ] `docs/services/conversations-service.md` - Architecture, usage
- [ ] `docs/services/agent-selector-service.md` - GraphRAG, fallbacks

**Migration Guide:**
- [ ] `docs/migrations/localStorage-to-database.md` - Step-by-step migration
- [ ] Rollback procedures
- [ ] Testing checklist
- [ ] Troubleshooting guide

---

### 9. Enhanced Observability
**Priority**: MEDIUM  
**Status**: Metrics created, enhancements possible  
**Est. Time**: 2-3 hours

**Additional Metrics:**
- [ ] Add conversation CRUD metrics
- [ ] Add circuit breaker state metrics
- [ ] Add cache hit/miss metrics
- [ ] Add embedding generation metrics

**Enhanced Logging:**
- [ ] Add more context to critical operations
- [ ] Add user journey tracking
- [ ] Add performance profiling logs

---

## 🟢 LOW PRIORITY (Future Enhancements)

### 10. Additional Resilience Patterns
**Priority**: LOW  
**Status**: Basic fallback exists  
**Est. Time**: 3-4 hours

- [ ] Enhanced graceful degradation
- [ ] Bulkhead pattern for resource isolation
- [ ] Timeout configuration management
- [ ] Health check endpoints

---

### 11. Advanced Caching
**Priority**: LOW  
**Status**: Embedding cache exists  
**Est. Time**: 2-3 hours

- [ ] Redis integration for production
- [ ] Agent metadata caching
- [ ] Query result caching
- [ ] Multi-layer cache strategy

---

### 12. Performance Monitoring
**Priority**: LOW  
**Status**: Basic metrics exist  
**Est. Time**: 2-3 hours

- [ ] APM integration (Datadog, New Relic)
- [ ] Performance budgets
- [ ] Automated performance regression detection
- [ ] Load testing scenarios

---

## 📊 Progress Summary

### ✅ Completed (~85%)
- Core localStorage migration (ALL modes)
- Agent fetching fixes
- Structured logging
- Error handling
- Observability infrastructure
- Circuit breaker service
- Embedding cache service
- Tracing service
- Conversations service

### ⚠️ Needs Verification (~5%)
- ask-expert/page.tsx localStorage removal (needs testing)
- Fallback logic enhancements (verify implemented correctly)
- Ranking observability (verify metrics)

### ❌ Not Started (~10%)
- Testing suite
- Type consolidation
- Full documentation
- Advanced resilience patterns

---

## 🎯 Recommended Execution Order

### Week 1: Critical Path
1. ✅ **Day 1**: Run database migrations (30 min)
2. ✅ **Day 1**: Create conversations API endpoint (2 hours)
3. ⚠️ **Day 1-2**: Start unit tests (user-agents-service, conversations-service)
4. ⚠️ **Day 2-3**: Continue testing suite

### Week 2: Production Readiness
5. ⚠️ **Day 4-5**: Type consolidation
6. ⚠️ **Day 5**: Integrate circuit breakers
7. ⚠️ **Day 5-6**: Integrate embedding cache
8. ⚠️ **Day 6**: Integration tests

### Week 3: Polish
9. ⚠️ **Day 7-8**: E2E tests
10. ⚠️ **Day 8-9**: Documentation
11. ⚠️ **Day 9**: Final testing and verification

---

## ✅ Definition of Done

**Before Production Deployment:**

- [ ] All database migrations run successfully
- [ ] Unit test coverage >80% for critical services
- [ ] Integration tests passing
- [ ] E2E tests for critical user flows
- [ ] Circuit breakers integrated and tested
- [ ] Embedding cache integrated and tested
- [ ] API documentation complete
- [ ] Service documentation complete
- [ ] Performance benchmarks meet targets (<500ms search P95)
- [ ] Security review completed
- [ ] All localStorage references removed (verified)
- [ ] Error tracking configured (Sentry/Datadog)

---

## 📝 Notes

- **Testing is critical** - Don't skip tests for production
- **Type consolidation improves maintainability** but not blocking
- **Documentation helps team velocity** but can be done incrementally
- **Circuit breakers and caching** should be integrated before production load

**Current Status**: System is functional and ready for staging deployment with proper testing.

