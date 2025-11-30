# Mode 1: Migration Plan - `/api/mode1/manual` → `/api/mode1/interactive`

**Date**: November 23, 2025
**Status**: 🟡 Migration Planning
**Current**: Legacy `/manual` endpoint
**Target**: Modern `/interactive` endpoint

---

## 📊 Current State Analysis

### **Two Parallel Implementations**

#### **Legacy Implementation** (Currently Running)
- **Location**: `/services/ai-engine/src/main.py`
- **Endpoint**: `/api/mode1/manual` ← **CURRENTLY ACTIVE**
- **Port**: 8000
- **Workflow**: `Mode1InteractiveManualWorkflow` (newly fixed)
- **Status**: ✅ Running, ⚠️ Nodes not executing yet

#### **Modern Implementation** (Not Deployed)
- **Location**: `/services/ai-engine/src/api/main.py`
- **Endpoint**: `/api/mode1/interactive`
- **Port**: 8080 (configured but not active)
- **Workflow**: `Mode1InteractiveManualWorkflow`
- **Status**: ❌ Not deployed, code exists

---

## 🎯 Migration Objectives

### **Why Migrate?**

1. **Consistent Naming**: `/interactive` matches documentation and 4-mode system
2. **Modern Architecture**: New API structure in `src/api/` is cleaner
3. **Better Organization**: Separation of concerns (routes in `api/routes/`)
4. **Future-Proof**: Easier to add Mode 2, 3, 4 alongside Mode 1

### **Migration Philosophy**

> **Zero-Downtime Migration**: Run both endpoints in parallel, gradually shift traffic

---

## 📋 Migration Strategy

### **Phase 1: Parallel Deployment** (Week 1)

**Goal**: Both endpoints work simultaneously

#### Actions:
1. ✅ **Fix Legacy Endpoint** (`/api/mode1/manual`)
   - ✅ Updated port from 8080 → 8000 in frontend
   - ✅ Fixed workflow from Mode2 → Mode1
   - ⚠️ Debug node execution issues

2. ⏳ **Deploy Modern Endpoint** (`/api/mode1/interactive`)
   - Include `src/api/main.py` routes in `src/main.py`
   - OR deploy `api/main.py` as separate service on port 8080
   - Test both endpoints work independently

3. ⏳ **Feature Parity Check**
   - Verify both endpoints produce identical results
   - Test with 10+ different queries
   - Compare response times, accuracy, citations

#### Success Criteria:
- [ ] Both `/manual` and `/interactive` respond correctly
- [ ] Both use `Mode1InteractiveManualWorkflow`
- [ ] Response schemas match
- [ ] Processing times similar (±20%)

---

### **Phase 2: Frontend Toggle** (Week 2)

**Goal**: Allow switching between endpoints via feature flag

#### Actions:
1. **Add Feature Flag**
   ```typescript
   // apps/digital-health-startup/.env.local
   USE_NEW_MODE1_ENDPOINT=false  // Start with legacy

   // src/app/api/ask-expert/mode1/chat/route.ts
   const aiEngineEndpoint = process.env.USE_NEW_MODE1_ENDPOINT === 'true'
     ? `${AI_ENGINE_URL}/api/mode1/interactive`  // New
     : `${AI_ENGINE_URL}/api/mode1/manual`;      // Legacy (current)
   ```

2. **Gradual Rollout**
   - Week 2 Day 1-2: Internal testing with new endpoint
   - Week 2 Day 3-4: 10% traffic to new endpoint
   - Week 2 Day 5-7: Monitor errors, adjust as needed

3. **A/B Testing Metrics**
   - Response accuracy
   - Processing time
   - Error rates
   - User satisfaction
   - Node execution success

#### Success Criteria:
- [ ] Can toggle between endpoints without code changes
- [ ] New endpoint handles 10% traffic successfully
- [ ] Error rates < 1%
- [ ] No user-facing bugs

---

### **Phase 3: Full Cutover** (Week 3)

**Goal**: Make new endpoint default, deprecate legacy

#### Actions:
1. **Increase Traffic to New Endpoint**
   - Day 1: 25% traffic
   - Day 2: 50% traffic
   - Day 3: 75% traffic
   - Day 4: 100% traffic

2. **Update Default**
   ```typescript
   // Change default to new endpoint
   USE_NEW_MODE1_ENDPOINT=true  // ← New default
   ```

3. **Monitor Closely**
   - Set up alerts for errors
   - Track response times
   - Monitor node execution
   - User feedback channels

#### Success Criteria:
- [ ] 100% traffic on new endpoint
- [ ] Error rate < 0.5%
- [ ] Performance metrics stable
- [ ] No critical bugs

---

### **Phase 4: Legacy Deprecation** (Week 4)

**Goal**: Remove old endpoint, clean up code

#### Actions:
1. **Mark Legacy Endpoint as Deprecated**
   ```python
   @app.post("/api/mode1/manual", deprecated=True)
   async def execute_mode1_manual_deprecated():
       """
       DEPRECATED: Use /api/mode1/interactive instead
       Will be removed in v3.0.0
       """
       logger.warning("Legacy /api/mode1/manual called - redirect to /interactive")
       # Redirect or return deprecation notice
   ```

2. **Update Documentation**
   - Mark `/manual` as deprecated in OpenAPI docs
   - Update all internal documentation
   - Send migration notices to API consumers

3. **Cleanup (30 days after deprecation)**
   - Remove legacy endpoint from `main.py`
   - Remove old workflow initialization code
   - Archive old tests

#### Success Criteria:
- [ ] No traffic on legacy endpoint
- [ ] All clients migrated
- [ ] Documentation updated
- [ ] Legacy code removed

---

## 🔧 Technical Implementation Details

### **Option A: Include Routes in main.py**

**Pros**: Single server, no port conflicts
**Cons**: main.py gets large, harder to maintain

```python
# In src/main.py
from api.routes import mode1_interactive

app.include_router(mode1_interactive.router)  # Add new routes
```

### **Option B: Separate Service**

**Pros**: Clean separation, modern architecture
**Cons**: Need to manage two servers, port coordination

```bash
# Terminal 1: Legacy server
cd services/ai-engine
python -m uvicorn main:app --port 8000 --app-dir src

# Terminal 2: Modern server
python -m uvicorn api.main:app --port 8080 --app-dir src
```

**Recommendation**: Start with Option A, migrate to Option B later

---

## 🚨 Rollback Plan

### **If Migration Fails**

1. **Immediate Rollback** (< 5 minutes)
   ```bash
   # Set feature flag back
   USE_NEW_MODE1_ENDPOINT=false

   # Restart frontend
   npm run dev
   ```

2. **Identify Root Cause**
   - Check error logs
   - Compare response schemas
   - Test with simple queries

3. **Fix and Retry**
   - Apply fixes to new endpoint
   - Test in staging
   - Retry with smaller traffic %

---

## 📊 Success Metrics

### **Performance**
- Response time P50: < 3 seconds
- Response time P95: < 8 seconds
- Error rate: < 0.5%
- Node execution success: > 95%

### **Quality**
- Response accuracy: > 90%
- Citation relevance: > 85%
- User satisfaction: > 4.0/5

### **Reliability**
- Uptime: > 99.9%
- Timeout rate: < 0.1%
- Retry success: > 90%

---

## 📅 Timeline Summary

| Phase | Duration | Key Milestone |
|-------|----------|---------------|
| Phase 1: Parallel | Week 1 | Both endpoints work |
| Phase 2: Toggle | Week 2 | 10% traffic to new |
| Phase 3: Cutover | Week 3 | 100% traffic to new |
| Phase 4: Cleanup | Week 4 | Legacy removed |
| **Total** | **1 month** | **Migration complete** |

---

## ✅ Pre-Migration Checklist

Before starting migration:

- [ ] Fix node execution in Mode1 workflow (currently empty responses)
- [ ] Verify all Mode1 nodes work correctly
- [ ] Test with 20+ different agent types
- [ ] Confirm RAG integration works
- [ ] Confirm tool execution works
- [ ] Set up monitoring/alerting
- [ ] Create rollback procedures
- [ ] Document new endpoint in OpenAPI
- [ ] Train team on new architecture

---

## 📞 Escalation Path

| Issue | Contact | SLA |
|-------|---------|-----|
| **P0: Service Down** | On-call engineer | 15 min |
| **P1: Errors > 5%** | Backend lead | 1 hour |
| **P2: Performance degradation** | DevOps | 4 hours |
| **P3: Minor bugs** | Regular sprint | Next day |

---

## 🎓 Lessons Learned

### **Why Two main.py Files Existed**

1. **Refactoring in Progress**: Team was modernizing architecture
2. **Risk Mitigation**: Keep old system running while building new
3. **Gradual Migration**: Common pattern in large codebases

### **Best Practices for Future**

1. **Feature Flags First**: Always add toggle before major changes
2. **Parallel Deployment**: Run both versions before switching
3. **Gradual Traffic Shift**: Never go 0% → 100% instantly
4. **Clear Deprecation**: Mark old APIs with warnings
5. **Monitoring First**: Set up alerts before migration

---

**Status**: Ready for Phase 1 execution (pending node execution fix)
