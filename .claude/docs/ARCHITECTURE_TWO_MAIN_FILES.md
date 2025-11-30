# AI Engine Architecture: Why Two main.py Files?

**Date**: November 23, 2025
**Status**: 📚 Architecture Documentation
**Applies To**: `/services/ai-engine/src/`

---

## 🏗️ Current Architecture

### **Two FastAPI Applications Coexist**

```
services/ai-engine/src/
├── main.py                    ← Legacy (CURRENTLY RUNNING)
│   └── Port 8000
│   └── Endpoints: /api/mode1/manual, /v1/ai/ask-expert/*
│
└── api/
    ├── main.py                ← Modern (NOT DEPLOYED YET)
    │   └── Port 8080 (configured)
    │   └── Endpoints: /api/mode1/interactive, /api/v1/search/*
    │
    └── routes/
        ├── mode1_interactive.py    ← New Mode 1 implementation
        ├── hybrid_search.py
        └── ask_expert.py
```

---

## 🤔 Why Two Files?

### **The Story**

This is a **refactoring-in-progress** pattern, extremely common in production systems. Here's what happened:

#### **Phase 1: Original System** (October 2025)
- Single `main.py` with all routes
- Direct workflow imports
- Monolithic structure
- Routes defined inline

#### **Phase 2: Modernization Started** (November 2025)
- Team decided to refactor for better organization
- Created new `api/` directory structure
- Separated routes into `api/routes/`
- Created modern `api/main.py`
- **BUT**: Kept old `main.py` running (zero-downtime requirement)

#### **Phase 3: Parallel Operation** (Now - November 23, 2025)
- **Old main.py**: Still serving production traffic
- **New api/main.py**: Built but not deployed
- **Migration**: Planned but not executed yet

---

## 🎯 Design Patterns Observed

### **Pattern 1: Strangler Fig**

> **Definition**: Gradually replace legacy system by building new system alongside, then slowly migrate

```
Step 1: [Legacy System] ──────────────> 100% traffic

Step 2: [Legacy System] ──> 80% traffic
        [New System]    ──> 20% traffic

Step 3: [Legacy System] ──> 0% traffic (retired)
        [New System]    ──> 100% traffic
```

**Benefits**:
- Zero downtime
- Gradual migration
- Easy rollback
- Risk mitigation

**In VITAL**:
- Legacy: `src/main.py` (running)
- New: `src/api/main.py` (ready)
- Migration: In planning

---

### **Pattern 2: Blue-Green Deployment**

> **Definition**: Run two identical production environments, switch traffic instantly

```
Blue Environment (Current):  main.py on port 8000
Green Environment (Staging): api/main.py on port 8080
```

**When Ready**:
1. Test Green thoroughly
2. Switch traffic from Blue → Green
3. Keep Blue as fallback
4. Retire Blue after confidence

---

## 📊 Comparison: Legacy vs Modern

| Aspect | Legacy (`src/main.py`) | Modern (`src/api/main.py`) |
|--------|------------------------|----------------------------|
| **Status** | ✅ Running | ⚠️ Built, not deployed |
| **Port** | 8000 | 8080 (configured) |
| **Lines** | ~1800 | ~430 |
| **Routes** | Inline | Organized in `api/routes/` |
| **Mode 1** | `/api/mode1/manual` | `/api/mode1/interactive` |
| **Structure** | Monolithic | Modular |
| **Imports** | Direct | Via routers |
| **Docs** | Basic | Enhanced |
| **CORS** | Basic | Advanced |
| **Middleware** | Rate limiting, tenant isolation | Same + enhanced logging |
| **Maintainability** | 🟡 Medium | 🟢 High |

---

## 🔍 Detailed Analysis

### **Legacy main.py (src/main.py)**

**Strengths**:
- ✅ Battle-tested in production
- ✅ All features working
- ✅ Team familiar with structure
- ✅ Comprehensive (handles all modes)

**Weaknesses**:
- ❌ Large file (~1800 lines)
- ❌ Routes defined inline (hard to test)
- ❌ Mixed concerns (routes + business logic)
- ❌ Harder to scale team (merge conflicts)

**Current Endpoints**:
```python
# Ask Expert
POST /api/mode1/manual                 # Mode 1 (Interactive Manual)
POST /api/mode2/auto                   # Mode 2
POST /api/mode3/chat                   # Mode 3
POST /api/mode4/autonomous             # Mode 4

# Legacy
POST /v1/ai/ask-expert/query
GET  /v1/ai/ask-expert/modes

# Utility
GET  /health
GET  /metrics
GET  /cache/stats
```

---

### **Modern api/main.py (src/api/main.py)**

**Strengths**:
- ✅ Clean separation (routes in `api/routes/`)
- ✅ Smaller, focused files
- ✅ Easier to test
- ✅ Better documentation
- ✅ Scalable architecture
- ✅ Modern FastAPI patterns

**Weaknesses**:
- ❌ Not deployed yet
- ❌ Needs testing in production
- ❌ Team less familiar
- ❌ Only Mode 1 implemented so far

**Current Endpoints**:
```python
# Mode 1 (from api/routes/mode1_interactive.py)
POST /api/mode1/interactive            # Mode 1 (Interactive Manual)
GET  /api/mode1/sessions/{session_id}  # Session info
DELETE /api/mode1/sessions/{session_id} # End session

# Search (from api/routes/hybrid_search.py)
POST /api/v1/search/agents             # Agent search
GET  /api/v1/search/agents/{id}/similar # Similar agents

# System
GET  /api/health
GET  /api/info
GET  /                                  # Redirects to /docs
```

---

## 🚦 Migration Path

### **Current State** (November 23, 2025)

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                         │
│  Port: 3001                                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Calls: AI_ENGINE_URL/api/mode1/manual
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Legacy AI Engine (main.py)                                 │
│  Port: 8000 ✅ RUNNING                                      │
│  Endpoints: /api/mode1/manual                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Modern AI Engine (api/main.py)                             │
│  Port: 8080 ❌ NOT DEPLOYED                                 │
│  Endpoints: /api/mode1/interactive                          │
└─────────────────────────────────────────────────────────────┘
```

---

### **Target State** (End of Migration)

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                         │
│  Port: 3001                                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Calls: AI_ENGINE_URL/api/mode1/interactive
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Modern AI Engine (api/main.py)                             │
│  Port: 8000 ✅ RUNNING                                      │
│  Endpoints: /api/mode1/interactive                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Legacy AI Engine (main.py)                                 │
│  ❌ RETIRED                                                 │
│  File archived to: _archive/legacy-main-py/                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Industry Best Practices

### **Why This Approach is Smart**

1. **Risk Mitigation**
   - Production stays up during refactor
   - Can rollback instantly if issues
   - No "big bang" deployment

2. **Team Velocity**
   - Team can work on new architecture without disrupting production
   - No rush to finish migration
   - Can iterate on design

3. **Testing**
   - New system can be tested thoroughly before switch
   - A/B testing possible
   - Gradual traffic shift

### **Similar Patterns in Major Companies**

#### **Netflix** (Chaos Monkey)
- Run old and new systems in parallel
- Randomly kill old system to force fallback to new
- Builds confidence in new system

#### **GitHub** (Chatops Deployment)
- Deploy new version alongside old
- Route small % of traffic to new
- Monitor metrics, increase traffic gradually

#### **Stripe** (Feature Flags)
- Deploy code with feature flags
- Enable new code path for 1% users
- Gradual rollout to 100%

---

## 📖 Code Organization

### **Legacy Structure**

```python
# src/main.py (monolithic)
from fastapi import FastAPI
import everything

app = FastAPI()

# All routes defined inline
@app.post("/api/mode1/manual")
async def mode1_handler():
    # 100+ lines of logic here
    pass

@app.post("/api/mode2/auto")
async def mode2_handler():
    # 100+ lines of logic here
    pass

# ... 1800 lines total
```

---

### **Modern Structure**

```python
# src/api/main.py (modular)
from fastapi import FastAPI
from api.routes import mode1_interactive, hybrid_search

app = FastAPI()

# Routes imported from separate files
app.include_router(mode1_interactive.router)
app.include_router(hybrid_search.router)

# Clean, focused, testable
```

```python
# src/api/routes/mode1_interactive.py (focused)
from fastapi import APIRouter

router = APIRouter(prefix="/api/mode1", tags=["Mode 1"])

@router.post("/interactive")
async def execute_mode1():
    # Mode 1 logic here
    pass

# Single responsibility, easy to test
```

---

## 🔧 How to Work With Both

### **For Developers**

#### **Adding a New Feature**

**Option A: Add to Legacy (Quick Fix)**
```bash
# If urgent bug fix needed NOW
vim src/main.py
# Add fix to existing endpoint
# Restart server
```

**Option B: Add to Modern (Preferred)**
```bash
# If new feature with time
vim src/api/routes/mode1_interactive.py
# Add feature to new architecture
# Plan migration timeline
```

#### **Testing**

```bash
# Test Legacy
curl http://localhost:8000/api/mode1/manual

# Test Modern (if deployed)
curl http://localhost:8080/api/mode1/interactive

# Compare responses
diff legacy_response.json modern_response.json
```

---

## 🚨 Common Pitfalls

### **Mistake 1: Forgetting Which Server is Running**

**Problem**: Make changes to `api/main.py` but test against `main.py`

**Solution**:
```bash
# Always check which server is running
ps aux | grep uvicorn
# Look for: main:app (legacy) or api.main:app (modern)
```

---

### **Mistake 2: Port Confusion**

**Problem**: Frontend calls port 8080, but only 8000 is running

**Solution**:
```bash
# Check what's listening
lsof -i :8000  # Should see Python/uvicorn
lsof -i :8080  # Should be empty or modern server

# Update frontend .env
AI_ENGINE_URL=http://localhost:8000  # ← Use running port
```

---

### **Mistake 3: Endpoint Name Mismatch**

**Problem**: Code calls `/interactive` but server has `/manual`

**Solution**:
```typescript
// Use feature flag to switch
const endpoint = USE_NEW_API
  ? '/api/mode1/interactive'  // Modern
  : '/api/mode1/manual';      // Legacy (current)
```

---

## 📚 Related Documentation

- [Migration Plan](./MODE1_MIGRATION_PLAN.md) - How to migrate from legacy to modern
- [Mode 1 PRD](./ASK_EXPERT_PRD.md) - Product requirements
- [Mode 1 ARD](./ASK_EXPERT_ARD.md) - Architecture requirements
- [LangGraph Workflow Spec](./LANGGRAPH_WORKFLOW_SPEC.md) - Workflow details

---

## ✅ Decision Matrix: Which main.py to Use?

| Scenario | Use Legacy | Use Modern | Rationale |
|----------|-----------|------------|-----------|
| **Urgent hotfix** | ✅ Yes | ❌ No | Legacy is running |
| **New feature** | ❌ No | ✅ Yes | Build on modern |
| **Production traffic** | ✅ Yes | ❌ No | Not deployed yet |
| **Development testing** | ❌ No | ✅ Yes | Test new code |
| **Bug in Mode 1** | ✅ Yes | ⚠️ Also | Fix both versions |
| **Refactoring** | ❌ No | ✅ Yes | Improve modern |

---

## 🎯 Recommendations

### **Short Term** (This Week)

1. ✅ Keep using `src/main.py` for production
2. ✅ Fix Mode1 workflow in legacy (already done)
3. ⏳ Test new `api/main.py` in local environment
4. ⏳ Document differences between endpoints

### **Medium Term** (This Month)

1. Deploy `api/main.py` on port 8080
2. Run A/B test with 10% traffic
3. Migrate to `/interactive` endpoint
4. Monitor metrics closely

### **Long Term** (Next Month)

1. Retire `src/main.py` completely
2. Consolidate on `api/main.py` architecture
3. Add remaining modes (2, 3, 4) to modern structure
4. Archive legacy code

---

## 📞 Questions?

### **"Which file should I edit for Mode 1?"**

**Now**: Edit `src/main.py` (it's running)
**Soon**: Edit `src/api/routes/mode1_interactive.py` (after migration)

### **"Why not delete old main.py now?"**

**Answer**: It's serving 100% of production traffic! Would cause outage.

### **"When will migration finish?"**

**Answer**: See [Migration Plan](./MODE1_MIGRATION_PLAN.md) - Estimated 1 month

### **"Can I run both servers at once?"**

**Answer**: Yes! Run on different ports (8000 and 8080)

---

**Summary**: Two `main.py` files is a **intentional architectural pattern** during refactoring. It's safe, smart, and industry-standard. We're in the middle of a well-planned migration.

**Next Steps**: Follow [Migration Plan](./MODE1_MIGRATION_PLAN.md) to complete the transition.
