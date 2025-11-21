# 🚀 Ask Panel Multi-Tenant Implementation Guide
## Complete Production Build - All Phases (0-6)

**Version**: 5.0  
**Created**: November 1, 2025  
**Total Duration**: 6-8 weeks  
**Skill Level**: Intermediate to Advanced  
**Stack**: Next.js + Python FastAPI + Supabase + Modal.com

---

## 📖 What This Guide Provides

This is the **complete, step-by-step implementation guide** for building the **VITAL Ask Panel** - a production-ready, multi-tenant Virtual Advisory Board platform that orchestrates AI expert discussions for complex healthcare decisions.

### What You'll Build

```
┌─────────────────────────────────────────────────────────┐
│           VITAL ASK PANEL - COMPLETE SYSTEM             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Phase 0: Pre-Implementation (1 day)                    │
│  ├─ Service account setup                               │
│  ├─ Database schema creation                            │
│  └─ Environment configuration                           │
│                                                         │
│  Phase 1: Multi-Tenant Foundation (2-3 days)            │
│  ├─ TenantId value object                               │
│  ├─ TenantContext management                            │
│  └─ Core multi-tenant types                             │
│                                                         │
│  Phase 2: Tenant-Aware Infrastructure (2-3 days)        │
│  ├─ FastAPI middleware                                  │
│  ├─ Database client (4-layer security)                  │
│  ├─ Redis cache client                                  │
│  └─ Agent registry                                      │
│                                                         │
│  Phase 3: Domain Layer & Orchestration (7-10 days)      │
│  ├─ Panel aggregate root                                │
│  ├─ 6 panel strategies                                  │
│  ├─ LangGraph workflows                                 │
│  └─ Consensus algorithms                                │
│                                                         │
│  Phase 4: API Layer & Streaming (5-7 days)              │
│  ├─ REST API endpoints                                  │
│  ├─ Application services                                │
│  ├─ SSE streaming                                       │
│  └─ Repository implementation                           │
│                                                         │
│  Phase 5: Frontend Isolation (5-7 days)                 │
│  ├─ Tenant configuration system                         │
│  ├─ Next.js tenant apps                                 │
│  ├─ API client with X-Tenant-ID                         │
│  └─ Real-time streaming UI                              │
│                                                         │
│  Phase 6: Testing & Deployment (5-7 days)               │
│  ├─ Comprehensive unit tests                            │
│  ├─ Integration testing                                 │
│  ├─ Performance & load tests                            │
│  └─ Modal.com production deployment                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Start

### Choose Your Path

**Solo Developer** (8 weeks):
1. Follow phases sequentially (0 → 6)
2. Copy Cursor AI prompts exactly as written
3. Validate after each prompt
4. Commit frequently

**Team of 2-3** (4 weeks):
1. Split phases across developers
2. Developer A: Phases 0-2 (Infrastructure)
3. Developer B: Phase 3-4 (Domain + API)
4. Developer C: Phases 5-6 (Frontend + Testing)

**Learning Focus** (Flexible):
1. Study Phases 0-1 for foundations
2. Experiment with Phase 3 strategies
3. Skip deployment (Phase 6)

---

## 📚 Phase-by-Phase Breakdown

### [Phase 0: Pre-Implementation Setup](./PHASE_0_PRE_IMPLEMENTATION_SETUP.md)
**Duration**: 1 day | **Complexity**: Easy

**What You'll Do:**
- Set up Supabase, Modal, OpenAI, Anthropic, Redis
- Configure environment variables
- Create project directory structure
- Initialize database schema with RLS
- Insert test tenants

**Deliverables:**
- ✅ All service accounts configured
- ✅ `.env.local` with all credentials
- ✅ Complete project structure
- ✅ Database schema with 6 tables
- ✅ RLS policies enabled
- ✅ 3 test tenants inserted

**Key Files:**
- `scripts/database/00_create_base_schema.sql`
- `scripts/database/01_enable_rls.sql`
- `.env.local`

---

### [Phase 1: Multi-Tenant Foundation](./PHASE_1_MULTI_TENANT_FOUNDATION.md)
**Duration**: 2-3 days | **Complexity**: Medium

**What You'll Build:**
- `TenantId` value object (immutable, type-safe)
- `TenantContext` (thread-safe context management)
- Custom error types
- Shared kernel package

**Deliverables:**
- ✅ Type-safe TenantId with UUID validation
- ✅ Thread-safe and async-safe context management
- ✅ 21+ unit tests (100% coverage)
- ✅ Installable Python package

**Key Files:**
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/tenant_id.py`
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/tenant_context.py`
- `services/shared-kernel/tests/test_tenant_id.py`

**Cursor AI Prompts:**
- PROMPT 1.1: Create TenantId Value Object
- PROMPT 1.2: Create Tenant Context Management

---

### [Phase 2: Tenant-Aware Infrastructure](./PHASE_2_TENANT_AWARE_INFRASTRUCTURE.md)
**Duration**: 2-3 days | **Complexity**: Medium-High

**What You'll Build:**
- `TenantMiddleware` (FastAPI X-Tenant-ID extraction)
- `TenantAwareSupabaseClient` (4-layer security)
- `TenantAwareRedisClient` (automatic key prefixing)
- `TenantAwareAgentRegistry` (usage tracking)

**Deliverables:**
- ✅ Automatic tenant context injection from headers
- ✅ Database queries automatically filtered by tenant_id
- ✅ Cache keys automatically prefixed
- ✅ 4-layer security validation
- ✅ 12+ integration tests

**Key Files:**
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/middleware.py`
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/database.py`
- `services/shared-kernel/src/vital_shared_kernel/multi_tenant/cache.py`

**Cursor AI Prompts:**
- PROMPT 2.1: Tenant Middleware
- PROMPT 2.2: Tenant-Aware Database Client
- PROMPT 2.3: Tenant-Aware Redis Client
- PROMPT 2.4: Tenant-Aware Agent Registry

---

### [Phase 3: Domain Layer & Panel Orchestration](./PHASE_3_DOMAIN_PANEL_ORCHESTRATION.md)
**Duration**: 7-10 days | **Complexity**: High

**What You'll Build:**
- Panel aggregate root (DDD pattern)
- Value objects: PanelId, PanelType, PanelStatus, ConsensusResult
- 6 panel strategies:
  - Structured (regulatory strategy)
  - Open (brainstorming)
  - Socratic (deep analysis)
  - Adversarial (risk assessment)
  - Delphi (consensus building)
  - Hybrid (human + AI)
- LangGraph state machines
- Consensus algorithms (standard + quantum)

**Deliverables:**
- ✅ Rich domain model with business logic
- ✅ 6 complete panel strategies
- ✅ LangGraph workflows for orchestration
- ✅ Consensus builder with multiple algorithms
- ✅ Domain events for state changes
- ✅ 50+ domain tests

**Key Files:**
- `services/ask-panel-service/src/domain/models/panel.py`
- `services/ask-panel-service/src/domain/strategies/structured_strategy.py`
- `services/ask-panel-service/src/domain/strategies/open_strategy.py`
- `services/ask-panel-service/src/orchestration/graphs/panel_deliberation.py`

**Cursor AI Prompts:**
- PROMPT 3.1: Panel Domain Model (Aggregate Root)
- PROMPT 3.2: Panel Strategy Interface
- PROMPT 3.3: Concrete Panel Strategies (Structured & Open)
- PROMPT 3.4: Remaining Panel Strategies (4 types)
- PROMPT 3.5: LangGraph State Machines
- PROMPT 3.6: Consensus Algorithms

---

### [Phase 4: API Layer & Real-time Streaming](./PHASE_4_API_STREAMING.md)
**Duration**: 5-7 days | **Complexity**: Medium-High

**What You'll Build:**
- REST API endpoints (Create, Read, List, Execute panels)
- Panel application service (orchestration layer)
- SSE streaming infrastructure
- Panel repository implementation
- API documentation (OpenAPI)

**Deliverables:**
- ✅ Complete REST API with multi-tenant security
- ✅ Real-time Server-Sent Events streaming
- ✅ Application service with transaction coordination
- ✅ Repository with tenant filtering
- ✅ API integration tests

**Key Files:**
- `services/ask-panel-service/src/api/routes/v1/panels.py`
- `services/ask-panel-service/src/api/routes/v1/streaming.py`
- `services/ask-panel-service/src/application/services/panel_service.py`
- `services/ask-panel-service/src/infrastructure/repositories/panel_repository.py`

**Cursor AI Prompts:**
- PROMPT 4.1: REST API Endpoints
- PROMPT 4.2: Panel Application Service
- PROMPT 4.3: SSE Streaming Infrastructure
- PROMPT 4.4: Panel Repository
- PROMPT 4.5: API Testing

---

### [Phase 5: Frontend Multi-Tenant Isolation](./PHASE_5_FRONTEND_ISOLATION.md)
**Duration**: 5-7 days | **Complexity**: Medium

**What You'll Build:**
- Tenant configuration system
- Dedicated Next.js apps per tenant
- API client with X-Tenant-ID injection
- Real-time panel streaming UI
- Custom branding & theming

**Deliverables:**
- ✅ Tenant configuration with branding
- ✅ Next.js app with tenant isolation
- ✅ API client with automatic tenant context
- ✅ Real-time streaming React component
- ✅ Custom CSS and theme injection
- ✅ Feature flags per tenant

**Key Files:**
- `apps/tenant-app/src/app/layout.tsx`
- `apps/tenant-app/src/components/providers/tenant-provider.tsx`
- `apps/tenant-app/src/lib/api-client.ts`
- `apps/tenant-app/src/components/panel-stream.tsx`

**Cursor AI Prompts:**
- PROMPT 5.1: Tenant Configuration System
- PROMPT 5.2: Tenant-Specific Next.js App
- PROMPT 5.3: Real-time Panel Streaming UI
- PROMPT 5.4: Custom Branding & Theming

---

### [Phase 6: Testing & Deployment](./PHASE_6_TESTING_DEPLOYMENT.md)
**Duration**: 5-7 days | **Complexity**: Medium-High

**What You'll Build:**
- Comprehensive unit tests (80%+ coverage)
- Integration tests (API + Database)
- Multi-tenant security testing
- Performance & load testing
- Modal.com production deployment
- Monitoring & observability (LangFuse)

**Deliverables:**
- ✅ 100+ unit tests across all layers
- ✅ Integration tests for all API endpoints
- ✅ Multi-tenant isolation validated
- ✅ Performance benchmarks met
- ✅ Production deployment on Modal.com
- ✅ Monitoring and alerting configured
- ✅ Rollback procedures tested

**Key Files:**
- `services/ask-panel-service/tests/domain/test_panel_aggregate.py`
- `services/ask-panel-service/tests/integration/test_panel_api.py`
- `services/ask-panel-service/modal_deploy.py`
- `services/ask-panel-service/deploy.sh`

**Cursor AI Prompts:**
- PROMPT 6.1: Comprehensive Unit Tests
- PROMPT 6.2: Integration Testing
- PROMPT 6.3: Modal.com Deployment Configuration
- PROMPT 6.4: Performance Testing
- PROMPT 6.5: Monitoring Setup

---

## 🔄 Implementation Workflow

### Daily Workflow

```bash
# Morning
git checkout -b phase-X-feature-Y
git pull origin main

# Implementation
1. Open Cursor AI
2. Copy prompt from phase guide
3. Review generated code
4. Run validation tests
5. Commit changes

# End of Day
git add .
git commit -m "Phase X: Implemented feature Y"
git push origin phase-X-feature-Y

# Create PR for review
```

### Weekly Milestones

**Week 1**: Phases 0-1 (Foundation)
- Setup complete
- Multi-tenant core ready
- 21 tests passing

**Week 2**: Phase 2 (Infrastructure)
- Middleware complete
- Database client ready
- Redis integration working
- 33 total tests passing

**Week 3-4**: Phase 3 (Domain)
- Panel aggregate complete
- All 6 strategies implemented
- LangGraph workflows working
- Consensus algorithms validated
- 80+ total tests passing

**Week 5**: Phase 4 (API)
- REST API complete
- SSE streaming working
- Repository implemented
- API tests passing

**Week 6**: Phase 5 (Frontend)
- Next.js apps deployed
- Branding applied
- Real-time UI working
- Tenant isolation verified

**Week 7**: Phase 6 (Testing)
- All tests passing
- Performance benchmarks met
- Security validated

**Week 8**: Phase 6 (Deployment)
- Modal.com deployment
- Monitoring configured
- Production ready!

---

## 🧪 Testing Strategy

### Unit Tests (Phase 6.1)
```bash
# Run all unit tests
pytest tests/domain tests/infrastructure -v --cov=src

# Target: 80%+ coverage
# Focus: Domain logic, value objects, strategies
```

### Integration Tests (Phase 6.2)
```bash
# Run integration tests
pytest tests/integration -v

# Target: All API endpoints covered
# Focus: Multi-tenant security, error handling
```

### Load Tests (Phase 6.3)
```bash
# Run load tests
locust -f tests/load/locustfile.py

# Target: 100+ concurrent panels
# Focus: Performance, memory, database
```

---

## 🚀 Deployment Strategy

### Development Environment
```bash
# Backend (FastAPI)
cd services/ask-panel-service
uvicorn src.api.main:app --reload

# Frontend (Next.js)
cd apps/tenant-app
npm run dev
```

### Staging Deployment
```bash
# Deploy to Modal staging
modal deploy modal_deploy.py --env staging

# Deploy frontend to Vercel
vercel deploy --env staging
```

### Production Deployment
```bash
# Deploy backend
./deploy.sh production

# Deploy frontend
vercel deploy --prod

# Verify health
curl https://api.vitalplatform.ai/health
```

---

## 📊 Success Criteria

### Phase Completion Checklist

**Phase 0**: ✅
- [ ] All service accounts created
- [ ] Database schema with RLS
- [ ] Environment variables configured
- [ ] Test tenants inserted

**Phase 1**: ✅
- [ ] TenantId value object complete
- [ ] TenantContext working
- [ ] 21+ tests passing
- [ ] Package installable

**Phase 2**: ✅
- [ ] Middleware extracting X-Tenant-ID
- [ ] Database client filtering by tenant
- [ ] Redis client prefixing keys
- [ ] 33+ total tests passing

**Phase 3**: ✅
- [ ] Panel aggregate root complete
- [ ] All 6 strategies implemented
- [ ] LangGraph workflows working
- [ ] Consensus algorithms validated
- [ ] 80+ total tests passing

**Phase 4**: ✅
- [ ] REST API endpoints working
- [ ] SSE streaming functional
- [ ] Application service coordinating
- [ ] Repository with tenant filtering
- [ ] API tests passing

**Phase 5**: ✅
- [ ] Tenant configuration loading
- [ ] Next.js apps with branding
- [ ] API client with X-Tenant-ID
- [ ] Real-time UI displaying panels
- [ ] Feature flags enforced

**Phase 6**: ✅
- [ ] 100+ unit tests passing
- [ ] Integration tests complete
- [ ] Performance benchmarks met
- [ ] Modal.com deployment successful
- [ ] Monitoring configured
- [ ] Production ready!

---

## 🎓 Learning Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [Modal Docs](https://modal.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

### Patterns & Architecture
- Domain-Driven Design (DDD)
- Multi-tenancy patterns
- Event sourcing
- CQRS (Command Query Responsibility Segregation)
- Repository pattern

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: Tests fail with "Module not found"
```bash
# Solution: Install package in dev mode
cd services/shared-kernel
pip install -e ".[dev]"
```

**Issue**: Supabase connection refused
```bash
# Solution: Check .env.local
echo $NEXT_PUBLIC_SUPABASE_URL
# Should be: https://your-project.supabase.co
```

**Issue**: Modal deployment fails
```bash
# Solution: Re-authenticate
modal setup
modal token verify
```

**Issue**: X-Tenant-ID header missing
```bash
# Solution: Ensure middleware is registered
# Check src/api/main.py for:
app.add_middleware(TenantMiddleware)
```

**Issue**: Cross-tenant data access
```bash
# Solution: Verify RLS policies
# Check database/01_enable_rls.sql
# Test with: SELECT * FROM panels WHERE tenant_id != current_tenant_id
```

---

## 📞 Support & Community

### Getting Help

**For Implementation Questions**:
1. Check phase-specific guide
2. Review Cursor AI prompt examples
3. Search project documentation
4. Open GitHub issue

**For Technical Issues**:
1. Check logs (Modal/Vercel)
2. Review error messages
3. Verify environment variables
4. Check service status

**For Architecture Questions**:
1. Review VITAL_BACKEND_ENHANCED_ARCHITECTURE.md
2. Check ASK_PANEL_COMPREHENSIVE_DOCUMENTATION.md
3. Study domain model diagrams
4. Review design patterns

---

## 🎉 You're Ready!

Start with **[Phase 0: Pre-Implementation Setup](./PHASE_0_PRE_IMPLEMENTATION_SETUP.md)**

This phase will help you:
- Set up all required services
- Configure environment variables
- Create project structure
- Initialize database

**Time**: 1 day | **Difficulty**: Easy

---

## 📈 Version History

**v5.0** - November 1, 2025
- ✅ All 7 phases complete (0-6)
- ✅ Phase 3 expanded with all strategies
- ✅ Phase 4 with SSE streaming
- ✅ Phase 5 with frontend isolation
- ✅ Phase 6 with testing & deployment
- ✅ Complete Cursor AI prompts
- ✅ Production deployment guide

**v4.0** - October 30, 2025
- Phases 0-1 complete
- Phase 2 in progress

**v3.0** - October 29, 2025
- Initial structure
- Phase 0 complete

---

## 📄 License

Proprietary - VITAL Platform  
© 2025 All Rights Reserved

---

**Let's build a world-class multi-tenant SaaS platform!** 🚀

**Total Implementation Time**: 6-8 weeks  
**Total Phases**: 7 (0-6)  
**Total Prompts**: 25+  
**Total Tests**: 100+  
**Production Ready**: ✅
