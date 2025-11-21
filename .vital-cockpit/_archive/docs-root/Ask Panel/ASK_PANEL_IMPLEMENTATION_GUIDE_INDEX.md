# 🚀 Ask Panel Multi-Tenant Implementation Guide
## Complete Production Build Guide with Cursor AI

**Version**: 4.0  
**Created**: November 1, 2025  
**Total Duration**: 6-8 weeks  
**Skill Level**: Intermediate to Advanced  
**Stack**: Next.js + Python FastAPI + Supabase + Modal.com

---

## 📖 What This Guide Covers

This is a **comprehensive, step-by-step implementation guide** for building the **VITAL Ask Panel** - a multi-tenant Virtual Advisory Board platform that orchestrates AI expert discussions for complex healthcare decisions.

You'll build a production-ready SaaS application with:
- ✅ Multi-tenant architecture (shared backend, isolated frontends)
- ✅ 6 panel orchestration types
- ✅ Real-time streaming (SSE)
- ✅ 4-layer security with Row-Level Security (RLS)
- ✅ LangGraph state machines
- ✅ Modal.com serverless deployment
- ✅ Comprehensive testing

---

## 📚 Phase-by-Phase Implementation

### [Phase 0: Pre-Implementation Setup](./PHASE_0_PRE_IMPLEMENTATION_SETUP.md)
**Duration**: 1 day | **Complexity**: Easy

**What You'll Do:**
- Set up all external services (Supabase, Modal, Pinecone, OpenAI, etc.)
- Configure environment variables
- Create project directory structure
- Initialize multi-tenant database schema with RLS
- Insert test tenants

**Deliverables:**
- ✅ All service accounts configured
- ✅ `.env.local` with all credentials
- ✅ Complete project structure
- ✅ Database schema with 6 tables
- ✅ RLS policies enabled
- ✅ 3 test tenants inserted

**Key Files Created:**
- `scripts/database/00_create_base_schema.sql`
- `scripts/database/01_enable_rls.sql`
- `scripts/database/02_verify_setup.sql`

---

### [Phase 1: Multi-Tenant Foundation](./PHASE_1_MULTI_TENANT_FOUNDATION.md)
**Duration**: 2-3 days | **Complexity**: Medium

**What You'll Build:**
- `TenantId` value object (immutable, type-safe tenant identifiers)
- `TenantContext` (thread-safe context variable management)
- Custom error types for multi-tenant operations

**Deliverables:**
- ✅ Type-safe TenantId with UUID validation
- ✅ Thread-safe and async-safe context management
- ✅ 21+ unit tests (100% coverage)
- ✅ Installable Python package

**Key Files Created:**
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/tenant_id.py`
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/tenant_context.py`
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/errors.py`
- `services/shared-kernel/tests/test_tenant_id.py`
- `services/shared-kernel/tests/test_tenant_context.py`

**Cursor AI Prompts:**
- PROMPT 1.1: Create TenantId Value Object
- PROMPT 1.2: Create Tenant Context Management

---

### Phase 2: Tenant-Aware Infrastructure
**Duration**: 2-3 days | **Complexity**: Medium-High

**What You'll Build:**
- `TenantMiddleware` (FastAPI middleware for X-Tenant-ID header extraction)
- `TenantAwareSupabaseClient` (database client with 4-layer security)
- `TenantAwareRedisClient` (cache client with automatic key prefixing)
- `TenantAwareAgentRegistry` (agent management with tenant context)

**Deliverables:**
- ✅ Automatic tenant context injection from HTTP headers
- ✅ Database queries automatically filtered by tenant_id
- ✅ Cache keys automatically prefixed with tenant_id
- ✅ 4-layer security validation (Middleware → Application → Domain → Database)
- ✅ Integration tests with real Supabase

**Key Files:**
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/middleware.py`
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/database.py`
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/cache.py`
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/agent_registry.py`

**Cursor AI Prompts:**
- PROMPT 2.1: Create Tenant Middleware
- PROMPT 2.2: Create Tenant-Aware Database Client
- PROMPT 2.3: Create Tenant-Aware Redis Client
- PROMPT 2.4: Create Tenant-Aware Agent Registry

---

### Phase 3: Domain Layer & Panel Orchestration
**Duration**: 7-10 days | **Complexity**: High

**What You'll Build:**
- Panel Aggregate Root (DDD pattern)
- 6 Panel Strategies (Structured, Open, Socratic, Adversarial, Delphi, Hybrid)
- LangGraph workflows for each panel type
- Consensus algorithms (Quantum Consensus, Swarm Intelligence)
- Repository pattern with tenant isolation

**Deliverables:**
- ✅ Complete domain models (Panel, Discussion, Consensus, Expert)
- ✅ 6 working panel orchestration strategies
- ✅ LangGraph state machines for each panel type
- ✅ Consensus building algorithms
- ✅ Domain services (PanelOrchestrator, ConsensusBuilder)
- ✅ Repository implementations

**Key Files:**
- `services/ask-panel-service/src/domain/models/panel.py`
- `services/ask-panel-service/src/domain/strategies/structured_panel.py`
- `services/ask-panel-service/src/domain/strategies/open_panel.py`
- `services/ask-panel-service/src/domain/strategies/socratic_panel.py`
- `services/ask-panel-service/src/domain/strategies/adversarial_panel.py`
- `services/ask-panel-service/src/domain/strategies/delphi_panel.py`
- `services/ask-panel-service/src/domain/strategies/hybrid_panel.py`
- `services/ask-panel-service/src/domain/services/consensus_builder.py`
- `services/ask-panel-service/src/application/workflows/panel_workflow.py`

**Cursor AI Prompts:**
- PROMPT 3.1: Create Panel Aggregate Root
- PROMPT 3.2: Create Panel Repository
- PROMPT 3.3: Implement Structured Panel Strategy
- PROMPT 3.4: Implement Open Panel Strategy
- PROMPT 3.5: Implement Socratic Panel Strategy
- PROMPT 3.6: Implement Adversarial Panel Strategy
- PROMPT 3.7: Implement Delphi Panel Strategy
- PROMPT 3.8: Implement Hybrid Panel Strategy
- PROMPT 3.9: Create LangGraph Workflows
- PROMPT 3.10: Implement Consensus Algorithms

---

### Phase 4: API Layer & Real-time Streaming
**Duration**: 5-7 days | **Complexity**: Medium-High

**What You'll Build:**
- FastAPI routes with automatic tenant validation
- Server-Sent Events (SSE) streaming infrastructure
- API client with X-Tenant-ID injection
- WebSocket support for real-time updates

**Deliverables:**
- ✅ RESTful API endpoints (/panels, /panels/{id}, /agents)
- ✅ SSE streaming for live panel execution
- ✅ Middleware stack (Tenant, CORS, Auth, Logging)
- ✅ OpenAPI documentation
- ✅ Rate limiting per tenant

**Key Files:**
- `services/ask-panel-service/src/api/routes/v1/panels.py`
- `services/ask-panel-service/src/api/routes/v1/agents.py`
- `services/ask-panel-service/src/api/middleware/tenant_middleware.py`
- `services/ask-panel-service/src/infrastructure/streaming/sse.py`
- `services/ask-panel-service/src/api/main.py`

**Cursor AI Prompts:**
- PROMPT 4.1: Create Panel API Routes
- PROMPT 4.2: Implement SSE Streaming
- PROMPT 4.3: Create Agent API Routes
- PROMPT 4.4: Add API Middleware Stack
- PROMPT 4.5: Generate OpenAPI Documentation

---

### Phase 5: Frontend - Multi-Tenant Isolation
**Duration**: 5-7 days | **Complexity**: Medium

**What You'll Build:**
- Shared React components for panels
- Tenant-specific Next.js applications
- API client with automatic X-Tenant-ID injection
- Real-time SSE integration
- Tenant-specific branding and theming

**Deliverables:**
- ✅ Shared component library (panel display, expert cards, consensus meters)
- ✅ 3 tenant-specific frontends (Acme, MedTech, HealthCo)
- ✅ Tenant configuration system
- ✅ Real-time streaming UI components
- ✅ Branding and theme customization

**Key Files:**
- `apps/tenant-shared-components/src/components/PanelDisplay.tsx`
- `apps/tenant-shared-components/src/components/ExpertCard.tsx`
- `apps/tenant-shared-components/src/components/ConsensusMeter.tsx`
- `apps/tenant-shared-components/src/hooks/usePanelStream.ts`
- `apps/tenant-shared-components/src/api/panelClient.ts`
- `apps/tenant-acme/src/app/panel/[id]/page.tsx`
- `apps/tenant-acme/src/config/tenant.config.ts`

**Cursor AI Prompts:**
- PROMPT 5.1: Create Shared Panel Components
- PROMPT 5.2: Build SSE Streaming Hook
- PROMPT 5.3: Create Tenant-Specific Apps
- PROMPT 5.4: Implement Tenant Configuration
- PROMPT 5.5: Add Branding System

---

### Phase 6: Testing & Deployment
**Duration**: 5-7 days | **Complexity**: Medium-High

**What You'll Build:**
- Comprehensive test suite (unit, integration, e2e)
- Modal.com deployment configuration
- CI/CD pipeline
- Monitoring and observability

**Deliverables:**
- ✅ 200+ unit tests
- ✅ 50+ integration tests
- ✅ 20+ e2e tests
- ✅ Modal.com deployment working
- ✅ Vercel deployment for frontends
- ✅ LangFuse monitoring integrated
- ✅ Production-ready logging

**Key Files:**
- `services/ask-panel-service/tests/unit/test_panel_strategies.py`
- `services/ask-panel-service/tests/integration/test_panel_api.py`
- `services/ask-panel-service/tests/e2e/test_full_panel_flow.py`
- `services/ask-panel-service/modal_config.py`
- `.github/workflows/deploy.yml`

**Cursor AI Prompts:**
- PROMPT 6.1: Create Unit Test Suite
- PROMPT 6.2: Create Integration Tests
- PROMPT 6.3: Create E2E Tests
- PROMPT 6.4: Configure Modal Deployment
- PROMPT 6.5: Set Up Monitoring
- PROMPT 6.6: Create CI/CD Pipeline

---

## 🏗️ Architecture Overview

### Multi-Tenant Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                       TENANT LAYER                          │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐           │
│   │ Tenant A  │   │ Tenant B  │   │ Tenant C  │           │
│   │ Frontend  │   │ Frontend  │   │ Frontend  │           │
│   │ (Next.js) │   │ (Next.js) │   │ (Next.js) │           │
│   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘           │
│         │               │               │                   │
│         └───────────────┴───────────────┘                   │
│                         │                                   │
│                         ▼                                   │
│         ┌────────────────────────────────┐                 │
│         │  X-Tenant-ID Header Middleware │                 │
│         │  • Validate tenant             │                 │
│         │  • Set context                 │                 │
│         └───────────────┬────────────────┘                 │
│                         │                                   │
│                         ▼                                   │
│   ┌─────────────────────────────────────────────────────┐ │
│   │        SHARED BACKEND SERVICES                      │ │
│   │   ┌───────────────────────────────────────────┐    │ │
│   │   │  Ask Panel Service (Python FastAPI)      │    │ │
│   │   │  • Panel Orchestration                    │    │ │
│   │   │  • LangGraph Workflows                    │    │ │
│   │   │  • 6 Panel Strategies                     │    │ │
│   │   │  • Consensus Algorithms                   │    │ │
│   │   │  • 136+ AI Agents (shared)                │    │ │
│   │   │  • RAG Engine (shared)                    │    │ │
│   │   └───────────────────────────────────────────┘    │ │
│   └─────────────────────────────────────────────────────┘ │
│                         │                                   │
│                         ▼                                   │
│   ┌─────────────────────────────────────────────────────┐ │
│   │  DATABASE (Supabase PostgreSQL + RLS)              │ │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│   │   │Tenant A  │  │Tenant B  │  │Tenant C  │       │ │
│   │   │Data      │  │Data      │  │Data      │       │ │
│   │   │(Isolated)│  │(Isolated)│  │(Isolated)│       │ │
│   │   └──────────┘  └──────────┘  └──────────┘       │ │
│   └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4-Layer Security

```
Layer 1: MIDDLEWARE
  ↓ Extract & validate X-Tenant-ID header
  ↓ Set TenantContext

Layer 2: APPLICATION
  ↓ Inject tenant_id into operations
  ↓ Validate tenant_id in requests

Layer 3: DOMAIN
  ↓ Validate tenant_id in aggregates
  ↓ Business logic validation

Layer 4: DATABASE
  ↓ Row-Level Security (RLS)
  ↓ PostgreSQL enforces tenant isolation
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 | React framework with SSR |
| | TypeScript | Type safety |
| | TailwindCSS | Styling |
| | shadcn/ui | UI components |
| **Backend** | Python 3.11+ | Main language |
| | FastAPI | REST API framework |
| | LangChain | LLM orchestration |
| | LangGraph | State machine workflows |
| | Pydantic | Data validation |
| **Database** | Supabase | PostgreSQL + Auth |
| | pgvector | Vector embeddings |
| | RLS | Row-Level Security |
| **Cache** | Redis (Upstash) | Session, rate limiting |
| **Vector DB** | Pinecone | Agent embeddings |
| **AI Models** | OpenAI GPT-4 | Primary LLM |
| | Claude 3.5 Sonnet | Alternative LLM |
| **Deployment** | Modal.com | Python serverless |
| | Vercel | Next.js hosting |
| **Monitoring** | LangFuse | LLM observability |
| | Prometheus | Metrics |

---

## 📊 Implementation Timeline

```
Week 1:   Phase 0-1  ████████░░░░░░░░░░░░  Setup + Foundation
Week 2:   Phase 2    ████████░░░░░░░░░░░░  Infrastructure
Week 3-4: Phase 3    ████████████████░░░░  Domain + Orchestration
Week 5-6: Phase 4-5  ████████████████░░░░  API + Frontend
Week 7-8: Phase 6    ████████████████████  Testing + Deployment
```

---

## 💡 Key Concepts You'll Learn

### Domain-Driven Design (DDD)
- **Aggregates**: Panel is the aggregate root
- **Value Objects**: TenantId, ExpertId are immutable value objects
- **Repositories**: Abstract data access with tenant isolation
- **Domain Services**: Complex business logic coordination

### Multi-Tenant Patterns
- **Shared Infrastructure**: One service, multiple tenants
- **Row-Level Security**: Database enforces isolation
- **Context Variables**: Thread-safe tenant tracking
- **Key Prefixing**: Cache isolation strategy

### LangChain/LangGraph
- **State Machines**: Panel workflows as graphs
- **Nodes**: Individual expert contributions
- **Edges**: Conditional routing based on consensus
- **Checkpointing**: Save/resume panel state

### Real-time Communication
- **Server-Sent Events (SSE)**: Unidirectional streaming
- **Event Types**: expert_speaking, round_complete, consensus_update
- **Connection Management**: Reconnection, heartbeat

---

## 🎯 Success Criteria

By the end of this guide, you'll have:

### Functional Requirements
- ✅ Users can create panels with 3-12 AI experts
- ✅ 6 panel types work correctly (Structured, Open, Socratic, etc.)
- ✅ Real-time streaming shows expert responses
- ✅ Consensus building produces coherent recommendations
- ✅ Multi-tenant isolation prevents data leaks

### Technical Requirements
- ✅ 200+ tests with 80%+ coverage
- ✅ API response times < 500ms
- ✅ Panel execution completes in 5-15 minutes
- ✅ Handles 100+ concurrent panels
- ✅ Zero cross-tenant data access

### Production Requirements
- ✅ Deployed to Modal.com (backend)
- ✅ Deployed to Vercel (frontend)
- ✅ Monitoring with LangFuse
- ✅ Error tracking and logging
- ✅ CI/CD pipeline working

---

## 📖 How to Use This Guide

### For Solo Developers

1. **Linear Approach**: Complete phases in order (0 → 1 → 2 → ... → 6)
2. **Copy-paste Cursor prompts**: Each prompt is self-contained
3. **Validate after each prompt**: Run tests before proceeding
4. **Commit frequently**: Git commit after each completed prompt

**Time Commitment**: 6-8 weeks, 20-30 hours/week

### For Teams

1. **Parallel Development**: Split phases across team members
   - Developer A: Phases 0-2 (Infrastructure)
   - Developer B: Phase 3 (Domain)
   - Developer C: Phases 4-5 (API + Frontend)
   - Developer D: Phase 6 (Testing)

2. **Code Reviews**: Review each phase before merge
3. **Integration**: Combine phases weekly

**Time Commitment**: 3-4 weeks, 2-3 developers

### For Learning

1. **Start with Phase 0-1**: Understand foundation
2. **Experiment with Phase 3**: Try different panel types
3. **Skip deployment (Phase 6)**: Focus on concepts

**Time Commitment**: 2-3 weeks, flexible pace

---

## 🔗 Quick Links

### Phase Documents
- [Phase 0: Pre-Implementation Setup](./PHASE_0_PRE_IMPLEMENTATION_SETUP.md)
- [Phase 1: Multi-Tenant Foundation](./PHASE_1_MULTI_TENANT_FOUNDATION.md)
- Phase 2: Tenant-Aware Infrastructure (Coming soon)
- Phase 3: Domain Layer & Panel Orchestration (Coming soon)
- Phase 4: API Layer & Real-time Streaming (Coming soon)
- Phase 5: Frontend - Multi-Tenant Isolation (Coming soon)
- Phase 6: Testing & Deployment (Coming soon)

### External Documentation
- [VITAL Backend Architecture](../VITAL_BACKEND_ENHANCED_ARCHITECTURE.md)
- [Ask Panel Comprehensive Docs](../ASK_PANEL_COMPREHENSIVE_DOCUMENTATION.md)
- [Multi-Tenant Overview](../00_ASK_PANEL_MULTI_TENANT_OVERVIEW.md)

---

## 🆘 Getting Help

### Common Issues

**Q: Tests fail with "Module not found"**
```bash
# Solution: Install package in dev mode
cd services/shared-kernel
pip install -e ".[dev]"
```

**Q: Supabase connection refused**
```bash
# Solution: Check .env.local has correct URL
echo $NEXT_PUBLIC_SUPABASE_URL
# Should be: https://your-project.supabase.co
```

**Q: Modal deployment fails**
```bash
# Solution: Re-authenticate
modal setup
modal token verify
```

### Resources

- **Supabase Docs**: https://supabase.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **LangGraph Docs**: https://langchain-ai.github.io/langgraph/
- **Modal Docs**: https://modal.com/docs

---

## 🎉 Ready to Begin?

Start with **[Phase 0: Pre-Implementation Setup](./PHASE_0_PRE_IMPLEMENTATION_SETUP.md)**

This phase will help you:
- Set up all required services
- Configure environment variables
- Create project structure
- Initialize database

**Time**: 1 day | **Difficulty**: Easy

---

**Version**: 4.0  
**Last Updated**: November 1, 2025  
**Status**: Phases 0-1 Complete, 2-6 In Progress  
**License**: Proprietary - VITAL Platform

---

**Let's build a world-class multi-tenant SaaS platform!** 🚀
