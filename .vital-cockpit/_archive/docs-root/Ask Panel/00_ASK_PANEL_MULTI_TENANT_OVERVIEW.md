# 🎯 Ask Panel Multi-Tenant Architecture - Master Overview

**Version**: 1.0  
**Created**: November 1, 2025  
**Architecture**: Domain-Driven Design + Multi-Tenant First  
**Purpose**: Complete guide for building VITAL's Ask Panel Services with multi-tenant architecture

---

## 📋 DOCUMENTATION STRUCTURE

This build guide is organized into separate files for easier navigation:

### **Core Files:**

1. **00_ASK_PANEL_MULTI_TENANT_OVERVIEW.md** (This File)
   - Architecture overview
   - Key concepts
   - File navigation guide
   - Quick start reference

2. **01_PHASE_1_MULTI_TENANT_FOUNDATION.md**
   - Tenant Context Management
   - Tenant-Aware Database Layer (Supabase + Redis)
   - Tenant-Aware Agent Registry
   - Infrastructure setup

3. **02_PHASE_2_TENANT_AWARE_DOMAIN.md**
   - Panel Aggregate Root
   - Domain Models with Tenant Validation
   - Repository Pattern with Multi-Layer Security
   - Domain Services

4. **03_PHASE_3_SHARED_BACKEND_SERVICES.md**
   - Panel Orchestration Logic
   - 6 Panel Strategies (Structured, Open, Socratic, Adversarial, Delphi, Hybrid)
   - LangGraph Workflows
   - Consensus Algorithms

5. **04_PHASE_4_TENANT_FRONTEND_ISOLATION.md**
   - Dedicated Next.js per Tenant
   - Tenant-Specific Branding
   - Frontend API Client with X-Tenant-ID
   - Routing and Navigation

6. **05_PHASE_5_TENANT_CONFIGURATION.md**
   - Per-Tenant Settings
   - Feature Flags and Limits
   - Usage Tracking and Billing
   - Customization Options

7. **06_PHASE_6_TESTING_MULTI_TENANCY.md**
   - Tenant Isolation Tests
   - Cross-Tenant Access Prevention
   - Integration Testing
   - Performance Testing

---

## 🏗️ MULTI-TENANT ARCHITECTURE OVERVIEW

### Architecture Principles

**VITAL's Multi-Tenant Model:**

```
┌─────────────────────────────────────────────────────────────┐
│                    TENANT ISOLATION LAYERS                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Tenant A    │  │  Tenant B    │  │  Tenant C    │     │
│  │  Frontend    │  │  Frontend    │  │  Frontend    │     │
│  │  (Dedicated) │  │  (Dedicated) │  │  (Dedicated) │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│         ┌──────────────────▼──────────────────┐             │
│         │   API Gateway with Tenant Context   │             │
│         │   (X-Tenant-ID header injection)    │             │
│         └──────────────────┬──────────────────┘             │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────┐     │
│  │         SHARED BACKEND SERVICES                    │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │  Ask Panel Service (Shared)              │     │     │
│  │  │  - Multi-tenant orchestration            │     │     │
│  │  │  - Tenant context in all operations      │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │  Shared Kernel (Shared)                  │     │     │
│  │  │  - 136+ Agents (shared)                  │     │     │
│  │  │  - Prompts (shared)                      │     │     │
│  │  │  - RAG Engine (shared)                   │     │     │
│  │  │  - Infrastructure (shared)               │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │         DATABASE WITH RLS (Row Level Security)   │       │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │      │
│  │  │ Tenant A   │  │ Tenant B   │  │ Tenant C   │ │      │
│  │  │ Data       │  │ Data       │  │ Data       │ │      │
│  │  │ (Isolated) │  │ (Isolated) │  │ (Isolated) │ │      │
│  │  └────────────┘  └────────────┘  └────────────┘ │      │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 KEY CONCEPTS

### 1. Dedicated Frontend per Tenant

**What It Means:**
- Each tenant has their own Next.js application deployment
- Unique subdomain or domain (e.g., `acme.vital.health`, `medtech.vital.health`)
- Custom branding (logo, colors, typography)
- Tenant-specific feature sets
- Isolated user sessions and authentication

**Why It Matters:**
- Complete UI/UX customization
- Independent deployment cycles
- Brand isolation
- Security through separation

**Implementation:**
```
apps/
├── tenant-acme/          # Tenant A's frontend
├── tenant-medtech/       # Tenant B's frontend
└── tenant-healthco/      # Tenant C's frontend
```

---

### 2. Shared Backend Services

**What It Means:**
- Single Ask Panel service instance serves ALL tenants
- Tenant context injected via `X-Tenant-ID` HTTP header
- All operations are tenant-aware
- Shared compute resources with strict isolation

**Why It Matters:**
- Cost efficiency (one service, multiple tenants)
- Consistent behavior across tenants
- Centralized updates and maintenance
- Scalable architecture

**Security Layers:**
1. **Middleware**: Validates X-Tenant-ID header
2. **Application**: Tenant context in all operations
3. **Domain**: Tenant validation in aggregates
4. **Database**: Row-Level Security (RLS)

---

### 3. Shared Resources with Tenant Context

**What It Means:**
- 136+ AI agents are SHARED (same instances)
- Agent preferences are PER-TENANT
- Usage tracking is PER-TENANT
- Cache keys are TENANT-PREFIXED

**Resource Sharing Model:**

| Resource | Sharing Level | Tenant-Specific |
|----------|--------------|-----------------|
| AI Agents | Shared instances | Usage tracking, preferences |
| Prompts | Shared templates | Per-tenant overrides |
| RAG Engine | Shared engine | Document access by tenant_id |
| Database | Shared Supabase | RLS filters by tenant_id |
| Redis Cache | Shared Redis | Keys prefixed with tenant_id |

**Example:**
```python
# Same agent instance for all tenants
agent = agent_registry.get_agent("fda_expert")

# But usage tracked per-tenant
await agent_registry.track_agent_usage(
    agent_id="fda_expert",
    query="510k requirements",
    tenant_id=TenantId(value="tenant-123")  # Per-tenant tracking
)
```

---

### 4. Tenant Configuration

**What It Means:**
- Per-tenant settings stored in database
- Feature flags control functionality
- Usage limits enforced
- Billing tracked per-tenant

**Configuration Structure:**
```python
{
    "tenant_id": "acme-corp",
    "name": "Acme Corporation",
    "tier": "enterprise",  # starter, professional, enterprise
    "features": {
        "ask_panel": True,
        "advanced_analytics": True,
        "custom_agents": True,
        "api_access": True
    },
    "limits": {
        "max_panels_per_month": 100,
        "max_experts_per_panel": 8,
        "max_storage_gb": 500
    },
    "branding": {
        "logo_url": "https://...",
        "primary_color": "#1a56db",
        "secondary_color": "#e74c3c"
    }
}
```

---

## 🛡️ SECURITY MODEL

### Defense in Depth (4 Layers)

**Layer 1: API Gateway / Middleware**
- Validates `X-Tenant-ID` header on every request
- Rejects requests without valid tenant
- Sets tenant context for request lifecycle

**Layer 2: Application Layer**
- Services check `TenantContext.get()` before operations
- Explicit tenant_id parameters in all functions
- Tenant validation in use cases

**Layer 3: Domain Layer**
- Aggregates contain immutable `tenant_id` field
- Domain methods validate tenant context matches
- `TenantMismatchError` raised for violations

**Layer 4: Database Layer**
- Row-Level Security (RLS) enabled on all tables
- RLS policies filter by `tenant_id`
- Explicit `tenant_id` filters in all queries
- Post-query validation double-checks

### Security Checklist

✅ **Tenant Context Always Set**
- Middleware injects context on every request
- Context cleared after request completes
- No operation executes without tenant context

✅ **Immutable Tenant IDs**
- `tenant_id` cannot be changed after creation
- Strong typing with `TenantId` value object
- Validation on construction

✅ **Multi-Layer Validation**
- Application validates
- Domain validates
- Database filters
- Post-query validates

✅ **Audit Logging**
- All operations log `tenant_id`
- Security events tracked
- Anomaly detection

---

## 📊 PROJECT STRUCTURE

### Backend Services

```
VITAL/
├── services/
│   ├── shared-kernel/              # 🔷 SHARED ACROSS ALL SERVICES
│   │   ├── src/
│   │   │   └── vital_shared_kernel/
│   │   │       ├── multi_tenant/        # Tenant infrastructure
│   │   │       ├── agents/              # 136+ shared agents
│   │   │       ├── rag/                 # Shared RAG engine
│   │   │       ├── infrastructure/      # Database, cache, etc.
│   │   │       └── domain/              # Shared value objects
│   │   └── setup.py
│   │
│   ├── ask-panel-service/          # 🎭 ASK PANEL ($10K/month)
│   │   ├── src/
│   │   │   ├── domain/                  # Domain models
│   │   │   │   ├── models/              # Panel, Discussion, Consensus
│   │   │   │   ├── services/            # Orchestration, Consensus
│   │   │   │   ├── strategies/          # 6 panel types
│   │   │   │   └── repositories/        # Persistence interfaces
│   │   │   ├── application/             # Use cases
│   │   │   │   ├── use_cases/
│   │   │   │   └── workflows/           # LangGraph workflows
│   │   │   ├── api/                     # FastAPI routes
│   │   │   │   ├── routes/
│   │   │   │   └── middleware/          # Tenant middleware
│   │   │   └── infrastructure/          # Database, streaming
│   │   └── modal_config.py              # Deployment config
│   │
│   ├── ask-expert-service/         # 📊 ASK EXPERT ($2K/month)
│   ├── jtbd-service/               # 🔄 JTBD ($15K/month)
│   └── solution-builder-service/   # 🏗️ SOLUTION BUILDER ($50K+/month)
```

### Frontend Applications

```
VITAL/
├── apps/
│   ├── tenant-shared-components/   # Shared React components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api/                # API client with X-Tenant-ID
│   │
│   ├── tenant-acme/                # Tenant A - Acme Corp
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   └── config/
│   │   │       └── tenant.config.ts  # Tenant-specific config
│   │   └── package.json
│   │
│   ├── tenant-medtech/             # Tenant B - MedTech Inc
│   │   └── ...
│   │
│   └── tenant-healthco/            # Tenant C - HealthCo
│       └── ...
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
**Goal**: Build tenant-aware infrastructure

**Deliverables:**
- ✅ Tenant context management
- ✅ TenantId value object
- ✅ Tenant middleware
- ✅ Database clients (Supabase + Redis)
- ✅ Agent registry

**Validation:**
```bash
# Test tenant context
python -c "from vital_shared_kernel.multi_tenant import TenantContext; print('✅ OK')"
```

### Phase 2: Domain Layer (Week 2-3)
**Goal**: Build tenant-aware domain models

**Deliverables:**
- ✅ Panel aggregate with tenant validation
- ✅ Domain models (Discussion, Consensus, etc.)
- ✅ Repository with 4-layer security
- ✅ Domain services

**Validation:**
```bash
# Test panel creation
pytest tests/domain/test_panel_tenant_validation.py
```

### Phase 3: Backend Services (Week 3-5)
**Goal**: Implement panel orchestration

**Deliverables:**
- ✅ 6 panel strategies
- ✅ LangGraph workflows
- ✅ Consensus algorithms
- ✅ API endpoints
- ✅ SSE streaming

**Validation:**
```bash
# Test panel execution
curl -X POST http://localhost:8000/api/v1/panels \
  -H "X-Tenant-ID: test-tenant" \
  -d '{"query": "...", "panel_type": "structured"}'
```

### Phase 4: Frontend Isolation (Week 5-6)
**Goal**: Dedicated frontend per tenant

**Deliverables:**
- ✅ Tenant-specific Next.js apps
- ✅ Branding and theming
- ✅ API client with X-Tenant-ID
- ✅ Routing and navigation

**Validation:**
```bash
# Test tenant frontend
npm run dev --workspace=tenant-acme
# Visit: http://acme.localhost:3000
```

### Phase 5: Configuration (Week 6-7)
**Goal**: Per-tenant settings and limits

**Deliverables:**
- ✅ Tenant configuration system
- ✅ Feature flags
- ✅ Usage tracking
- ✅ Billing integration

**Validation:**
```bash
# Test feature flag
python -c "from vital_shared_kernel.multi_tenant import TenantRegistry; print('✅ OK')"
```

### Phase 6: Testing (Week 7-8)
**Goal**: Comprehensive multi-tenant testing

**Deliverables:**
- ✅ Tenant isolation tests
- ✅ Cross-tenant prevention tests
- ✅ Integration tests
- ✅ Performance tests

**Validation:**
```bash
# Run full test suite
pytest tests/ -v --cov=src --cov-report=html
```

---

## 🎯 QUICK START GUIDE

### Step 1: Set Up Project Structure

```bash
# Create directories
mkdir -p services/shared-kernel/src/vital_shared_kernel/multi_tenant
mkdir -p services/ask-panel-service/src/{domain,application,api,infrastructure}
```

### Step 2: Start with Phase 1

Open `01_PHASE_1_MULTI_TENANT_FOUNDATION.md` and follow the prompts sequentially with Cursor AI.

### Step 3: Validate Each Phase

After completing each phase, run the validation checklist before moving to the next phase.

### Step 4: Deploy

Follow the deployment guide in Phase 6 for Modal.com deployment.

---

## 📚 DETAILED FILE DESCRIPTIONS

### **01_PHASE_1_MULTI_TENANT_FOUNDATION.md**

**Contents:**
- PROMPT 1.1: Create Multi-Tenant Shared Kernel with Tenant Context
- PROMPT 1.2: Create Tenant-Aware Database Layer
- PROMPT 1.3: Create Tenant-Aware Agent Registry
- Validation checklist

**Time Estimate**: 2-3 days  
**Complexity**: Medium  
**Prerequisites**: Basic Python, FastAPI, Supabase

---

### **02_PHASE_2_TENANT_AWARE_DOMAIN.md**

**Contents:**
- PROMPT 2.1: Create Tenant-Aware Panel Aggregate
- PROMPT 2.2: Create Tenant-Aware Repository
- PROMPT 2.3: Create Domain Services
- Validation checklist

**Time Estimate**: 2-3 days  
**Complexity**: Medium-High  
**Prerequisites**: Phase 1 complete, Domain-Driven Design knowledge

---

### **03_PHASE_3_SHARED_BACKEND_SERVICES.md**

**Contents:**
- PROMPT 3.1: Implement Base Panel Strategy
- PROMPT 3.2: Implement Structured Panel Strategy
- PROMPT 3.3: Implement Remaining Panel Strategies
- PROMPT 3.4: Implement LangGraph Workflows
- PROMPT 3.5: Create API Endpoints
- PROMPT 3.6: Implement SSE Streaming
- Validation checklist

**Time Estimate**: 7-10 days  
**Complexity**: High  
**Prerequisites**: Phase 2 complete, LangGraph knowledge

---

### **04_PHASE_4_TENANT_FRONTEND_ISOLATION.md**

**Contents:**
- PROMPT 4.1: Create Tenant Frontend Template
- PROMPT 4.2: Implement Tenant Configuration
- PROMPT 4.3: Build API Client with X-Tenant-ID
- PROMPT 4.4: Implement Branding System
- PROMPT 4.5: Create Routing and Navigation
- Validation checklist

**Time Estimate**: 5-7 days  
**Complexity**: Medium  
**Prerequisites**: Phase 3 complete, Next.js knowledge

---

### **05_PHASE_5_TENANT_CONFIGURATION.md**

**Contents:**
- PROMPT 5.1: Create Tenant Settings System
- PROMPT 5.2: Implement Feature Flags
- PROMPT 5.3: Build Usage Tracking
- PROMPT 5.4: Create Billing Integration
- Validation checklist

**Time Estimate**: 3-5 days  
**Complexity**: Medium  
**Prerequisites**: Phase 4 complete

---

### **06_PHASE_6_TESTING_MULTI_TENANCY.md**

**Contents:**
- PROMPT 6.1: Create Tenant Isolation Tests
- PROMPT 6.2: Build Cross-Tenant Prevention Tests
- PROMPT 6.3: Implement Integration Tests
- PROMPT 6.4: Create Performance Tests
- PROMPT 6.5: Deploy to Modal.com
- Final validation checklist

**Time Estimate**: 5-7 days  
**Complexity**: Medium-High  
**Prerequisites**: All previous phases complete

---

## 🔍 COMMON PATTERNS

### Pattern 1: Always Check Tenant Context

```python
from vital_shared_kernel.multi_tenant import TenantContext

async def some_operation():
    # ALWAYS get tenant context first
    tenant_id = TenantContext.get()
    
    # Use it in all operations
    result = await database.query(
        table="panels",
        filters={"status": "active"},
        tenant_id=tenant_id  # Explicit tenant
    )
```

### Pattern 2: Validate in Domain

```python
class Panel(BaseModel):
    tenant_id: TenantId
    
    def update_status(self, status: PanelStatus):
        # ALWAYS validate tenant context
        self.validate_tenant_context()
        
        # Then proceed with business logic
        self.status = status
```

### Pattern 3: Double-Check in Repository

```python
async def get_panel(panel_id: str, tenant_id: TenantId):
    # Query with tenant filter
    result = await db.select(
        table="panels",
        filters={"id": panel_id},
        tenant_id=tenant_id
    )
    
    panel = Panel.from_dict(result)
    
    # ALWAYS double-check
    if panel.tenant_id != tenant_id:
        raise TenantMismatchError("Security violation")
    
    return panel
```

---

## 🎓 LEARNING RESOURCES

### Required Knowledge

**Backend:**
- Python 3.11+
- FastAPI
- Pydantic
- Supabase (PostgreSQL)
- Redis
- LangChain / LangGraph
- Domain-Driven Design

**Frontend:**
- Next.js 14
- TypeScript
- React
- TailwindCSS
- shadcn/ui

### Recommended Reading

1. **Domain-Driven Design** by Eric Evans
2. **Implementing Domain-Driven Design** by Vaughn Vernon
3. **Multi-Tenancy in SaaS** - AWS Well-Architected Framework
4. **LangGraph Documentation** - https://langchain-ai.github.io/langgraph/

---

## 💡 TIPS & BEST PRACTICES

### DO's ✅

- Always validate tenant context in domain operations
- Use strong typing (TenantId value object)
- Implement 4-layer security validation
- Log all tenant operations
- Cache tenant configurations
- Test cross-tenant isolation thoroughly

### DON'Ts ❌

- Never trust only Row-Level Security (defense in depth)
- Don't skip tenant validation in any layer
- Never hard-code tenant IDs
- Don't share sessions across tenants
- Never expose tenant data in errors
- Don't forget to clear context after requests

---

## 🆘 TROUBLESHOOTING

### Issue: "TenantContextNotSetError"

**Cause**: Operation attempted without tenant context  
**Solution**: Ensure middleware is installed and X-Tenant-ID header is sent

```python
# Check middleware installation
app.add_middleware(TenantMiddleware)

# Check header
curl -H "X-Tenant-ID: test-tenant" http://localhost:8000/api/v1/panels
```

### Issue: "TenantMismatchError"

**Cause**: Tenant context doesn't match entity's tenant  
**Solution**: Verify tenant_id in all operations

```python
# Debug
tenant_id = TenantContext.get()
print(f"Current tenant: {tenant_id}")
print(f"Panel tenant: {panel.tenant_id}")
```

### Issue: Cross-tenant data visible

**Cause**: Missing tenant filter in query  
**Solution**: Always use TenantAwareSupabaseClient

```python
# ❌ WRONG
result = supabase.table("panels").select("*").execute()

# ✅ CORRECT
result = await TenantAwareSupabaseClient.select(
    table="panels",
    tenant_id=tenant_id
)
```

---

## 📞 SUPPORT & NEXT STEPS

### Ready to Build?

1. **Start with Phase 1**: Open `01_PHASE_1_MULTI_TENANT_FOUNDATION.md`
2. **Use Cursor AI**: Copy prompts one at a time
3. **Validate Each Step**: Run tests after each prompt
4. **Move Sequentially**: Complete phases in order

### Questions?

- Review the detailed phase files
- Check troubleshooting section
- Refer to architecture diagrams
- Run validation tests

---

**Version**: 1.0  
**Last Updated**: November 1, 2025  
**Status**: Ready for Implementation  
**Estimated Total Time**: 6-8 weeks

🚀 **Let's build a world-class multi-tenant Ask Panel service!**
