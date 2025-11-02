# Ask Panel MVP Fast Track Roadmap

**Goal**: Working Ask Panel prototype in 4-6 weeks  
**Strategy**: Focus on core features, defer optimizations  
**Current Progress**: Phase 0 ✅ & Phase 1 ✅ Complete (~10%)

---

## 🎯 MVP Scope Definition

### What We're Building (MVP Features)

✅ **Core Multi-Expert Panel**
- Create panel with 3-5 experts
- Parallel expert responses
- Basic consensus mechanism
- Simple synthesis generation

✅ **Essential API**
- Create panel endpoint
- Get panel status endpoint
- Server-Sent Events for real-time updates
- Basic authentication via tenant ID

✅ **Minimum Viable UX**
- Panel creation form
- Real-time discussion view
- Basic consensus display
- Simple evidence list

### What We're Deferring (Post-MVP)

⏸️ Advanced consensus algorithms (quantum, weighted)
⏸️ Evidence pack generation with citations
⏸️ Redis caching layer
⏸️ Advanced rate limiting
⏸️ Complex panel strategies (debate, research)
⏸️ Performance optimization
⏸️ Comprehensive security audit

---

## 📅 4-Week Sprint Plan

### Week 1: Infrastructure Foundation (Phase 2)
**Days 1-5: Tenant-Aware Infrastructure**

#### Day 1-2: Tenant Middleware & DB Client
- ✅ Goal: Every request automatically tenant-isolated
- [ ] FastAPI tenant extraction middleware
- [ ] Tenant-aware Supabase client wrapper
- [ ] Integration with existing TenantContext
- [ ] Unit tests for tenant isolation

#### Day 3-4: Agent Usage Tracking
- ✅ Goal: Track AI usage per tenant
- [ ] Agent usage tracking service
- [ ] Usage limits per tenant
- [ ] Basic rate limiting (simple counter)
- [ ] Usage metrics logging

#### Day 5: Redis Integration (Basic)
- ✅ Goal: Session state storage only
- [ ] Redis client setup
- [ ] Session state caching
- [ ] Simple key prefixing by tenant
- [ ] Cache invalidation logic

**Week 1 Deliverable**: All database/cache operations are tenant-aware

---

### Week 2: Core Orchestration (Phase 3 - Simplified)
**Days 6-12: LangGraph Panel Workflow**

#### Day 6-7: Panel Domain Model
- ✅ Goal: Type-safe panel aggregate
- [ ] Panel aggregate root (DDD)
- [ ] Expert value object
- [ ] Reply value object
- [ ] Panel status state machine
- [ ] Domain events

#### Day 8-10: LangGraph Workflow (Simplified)
- ✅ Goal: Working multi-expert coordination
- [ ] Panel state definition
- [ ] Expert selection node (simple algorithm)
- [ ] Parallel expert execution node
- [ ] Reply collection node
- [ ] Basic consensus node (majority vote)
- [ ] Synthesis generation node (LLM)
- [ ] Workflow orchestration

#### Day 11-12: Panel Repository
- ✅ Goal: Persist panel state
- [ ] Panel repository implementation
- [ ] State serialization/deserialization
- [ ] Tenant-filtered queries
- [ ] Transaction handling
- [ ] Integration tests

**Week 2 Deliverable**: Working panel orchestration (3 experts, simple consensus)

---

### Week 3: API & Streaming (Phase 4 - Simplified)
**Days 13-17: REST API + SSE**

#### Day 13-14: REST API Endpoints
- ✅ Goal: Basic CRUD for panels
- [ ] POST /api/v1/panels (create)
- [ ] GET /api/v1/panels/{id} (status)
- [ ] GET /api/v1/panels (list by tenant)
- [ ] Request/response validation
- [ ] Error handling
- [ ] API tests

#### Day 15-16: SSE Streaming
- ✅ Goal: Real-time panel updates
- [ ] SSE endpoint for panel events
- [ ] Event stream management
- [ ] Progress updates during panel execution
- [ ] Expert reply streaming
- [ ] Connection handling
- [ ] Client reconnection logic

#### Day 17: Integration Layer
- ✅ Goal: Connect API → Domain → DB
- [ ] Application service layer
- [ ] Command handlers
- [ ] Query handlers
- [ ] Event publishing
- [ ] End-to-end tests

**Week 3 Deliverable**: Working API with real-time updates

---

### Week 4: Frontend & Testing (Phase 5 & 6 - Simplified)
**Days 18-22: Minimal Viable Frontend**

#### Day 18-19: Panel Creation UI
- ✅ Goal: Create panels from UI
- [ ] Panel creation form component
- [ ] Expert selection dropdown
- [ ] Question input
- [ ] Tenant context handling
- [ ] Form validation
- [ ] API integration

#### Day 20-21: Panel Discussion View
- ✅ Goal: Watch panel in real-time
- [ ] Discussion view component
- [ ] SSE client integration
- [ ] Real-time expert replies display
- [ ] Consensus progress indicator
- [ ] Final synthesis display
- [ ] Loading states

#### Day 22: Testing & Bug Fixes
- ✅ Goal: Stable MVP
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Error handling improvements
- [ ] Basic deployment docs

**Week 4 Deliverable**: Working end-to-end MVP

---

## 📦 MVP Architecture (Simplified)

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│  ┌──────────────┐         ┌──────────────┐             │
│  │ Create Panel │         │ Panel View   │             │
│  │ Component    │────────▶│ (SSE Client) │             │
│  └──────────────┘         └──────────────┘             │
└─────────────┬───────────────────┬───────────────────────┘
              │ REST API          │ SSE Stream
              ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (FastAPI + LangGraph)              │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Tenant Middleware (Phase 1 ✅)                   │   │
│  └────────────────────┬─────────────────────────────┘   │
│                       │                                 │
│  ┌────────────────────▼───────────────┐                 │
│  │   API Layer (Week 3)               │                 │
│  │   • POST /panels                   │                 │
│  │   • GET /panels/{id}               │                 │
│  │   • SSE /panels/{id}/stream        │                 │
│  └────────────────────┬───────────────┘                 │
│                       │                                 │
│  ┌────────────────────▼───────────────┐                 │
│  │   LangGraph Workflow (Week 2)      │                 │
│  │   1. Select 3-5 experts            │                 │
│  │   2. Execute in parallel           │                 │
│  │   3. Collect replies               │                 │
│  │   4. Simple consensus (majority)   │                 │
│  │   5. Generate synthesis (LLM)      │                 │
│  └────────────────────┬───────────────┘                 │
│                       │                                 │
│  ┌────────────────────▼───────────────┐                 │
│  │   Tenant-Aware Clients (Week 1)    │                 │
│  │   • Supabase (auto-filter)         │                 │
│  │   • Redis (key prefixing)          │                 │
│  │   • Agent tracker                  │                 │
│  └────────────────────┬───────────────┘                 │
└────────────────────────┼───────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         DATABASE (Supabase) + CACHE (Redis)             │
│  Phase 0 ✅: Tables, Indexes, RLS Policies              │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 MVP Success Criteria

### Functional Requirements
- [ ] User can create a panel with a question
- [ ] System selects 3-5 relevant experts automatically
- [ ] Experts provide responses in parallel
- [ ] System calculates simple consensus (majority agreement)
- [ ] System generates final synthesis
- [ ] User sees real-time updates as panel progresses
- [ ] All operations are tenant-isolated

### Technical Requirements
- [ ] API responds in <5s for panel creation
- [ ] Expert responses complete in <30s
- [ ] SSE streams updates with <1s latency
- [ ] No cross-tenant data leakage
- [ ] 90%+ uptime during testing
- [ ] Basic error handling and logging

### Quality Requirements
- [ ] Core flows have integration tests
- [ ] API has request/response validation
- [ ] Frontend has loading/error states
- [ ] Basic deployment documentation

---

## 🚀 Implementation Strategy

### Week-by-Week Focus

**Week 1**: Foundation
- Make everything tenant-aware
- No new features, just infrastructure
- Heavy testing of tenant isolation

**Week 2**: Core Magic
- Get panel orchestration working
- Simplified algorithms (no fancy consensus)
- Focus on reliability over sophistication

**Week 3**: Expose via API
- Clean REST endpoints
- Real-time streaming
- Good error messages

**Week 4**: Make it Usable
- Minimal but functional UI
- Real-time updates work smoothly
- Fix critical bugs

---

## 📋 Daily Standup Format

Each day, track:
1. **Yesterday**: What got completed
2. **Today**: What we're building
3. **Blockers**: Any issues
4. **Tests**: What's passing/failing

---

## 🔄 Post-MVP Roadmap (Weeks 5-8)

Once MVP proves the concept:

### Week 5: Enhanced Consensus
- Implement weighted consensus
- Add confidence scoring
- Evidence aggregation

### Week 6: Performance & Scale
- Redis caching layer
- Query optimization
- Load testing

### Week 7: Advanced Features
- Evidence packs with citations
- Multiple panel strategies
- Advanced expert selection

### Week 8: Production Hardening
- Security audit
- Comprehensive testing
- Production deployment
- Monitoring & alerting

---

## 🎬 Getting Started: Week 1, Day 1

**Immediate Next Steps:**

1. **Read Phase 2 Documentation**
   - `docs/Ask Panel/PHASE_2_TENANT_AWARE_INFRASTRUCTURE.md`
   - Review the full implementation guide

2. **Set Up Development Environment**
   - Confirm Modal.com access
   - Verify Supabase connection
   - Test Redis connection (Upstash)

3. **Start Building: Tenant Middleware**
   - Follow PROMPT 2.1 from Phase 2 guide
   - Implement FastAPI middleware for X-Tenant-ID
   - Write tests for tenant extraction

Ready to start Week 1, Day 1?

---

## 📊 Progress Tracking

| Week | Phase | Status | Completion |
|------|-------|--------|------------|
| Setup | Phase 0 & 1 | ✅ Complete | 100% |
| Week 1 | Phase 2 | ⏳ Ready | 0% |
| Week 2 | Phase 3 (Simplified) | ⏳ Pending | 0% |
| Week 3 | Phase 4 (Simplified) | ⏳ Pending | 0% |
| Week 4 | Phase 5 & 6 (Simplified) | ⏳ Pending | 0% |

**Current Status**: Ready to begin Week 1 🚀

