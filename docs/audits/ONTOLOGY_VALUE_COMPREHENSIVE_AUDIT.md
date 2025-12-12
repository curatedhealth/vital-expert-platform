# VITAL ONTOLOGY & VALUE FRAMEWORK - COMPREHENSIVE AUDIT REPORT

**Generated:** December 11, 2025
**Scope:** Backend (`services/ai-engine/`) + Frontend (`apps/vital-system/`) + Database (`database/`)
**Focus:** `/discover` (ontology) and `/optimize` (value framework) functionality

---

## EXECUTIVE SUMMARY

### Overall Assessment

**Overall Grade: F (35/100)** - **NOT DEPLOYMENT READY**

| Component | Grade | Status | Notes |
|-----------|-------|--------|-------|
| **Backend API Routes** | C- (60/100) | Partial | Well-structured but dependent on stub workflows |
| **LangGraph Workflows** | **F (0/100)** | **STUB** | **11/11 functions return stub responses** |
| **Database Services** | C (55/100) | Partial | Functional but has critical security issues |
| **Database Migrations** | B- (70/100) | Functional | 40+ migrations exist, no validation script |
| **Frontend Pages** | C+ (65/100) | Functional | Working UI but relies on working backend APIs |
| **RLS Policies** | **F (0/100)** | **MISSING** | **No ontology-specific RLS policies found** |

### Critical Deployment Blockers

1. **STUB IMPLEMENTATIONS IN PRODUCTION CODE** (Critical)
   - ALL 11 Ontology Investigator endpoints return "not yet implemented"
   - ALL 5 Value Investigator endpoints return stub responses
   - **Impact:** Exposed API routes are completely non-functional

2. **SQL INJECTION VULNERABILITY** (Critical - SECURITY)
   - `/services/supabase_client.py` line 132 - Direct string interpolation
   - **Attack vector:** `tenant_id = "'; DROP TABLE agents; --"`

3. **MISSING ROW-LEVEL SECURITY** (Critical - SECURITY)
   - No RLS policies for `personas`, `jtbd`, `org_roles`, `org_departments`, `org_functions`
   - **Impact:** Cross-tenant data leakage possible

4. **ASYNC/AWAIT PATTERN VIOLATIONS** (High)
   - Invalid `async with asyncio.create_task()` usage (lines 126-137 in supabase_client.py)
   - Will raise `TypeError` at runtime

5. **UNINITIALIZED CLIENT USAGE** (High)
   - Supabase client methods callable before `initialize()` called
   - Will crash with `AttributeError: 'NoneType' object has no attribute...`

---

## 1. BACKEND API ROUTES ANALYSIS

### File: `/services/ai-engine/src/api/routes/ontology_investigator.py` (575 lines)

#### Purpose
Provides REST API for AI-powered ontology analysis including gap analysis, opportunity scoring, persona insights.

#### Critical Issues

**CRITICAL #1: ALL ENDPOINTS RELY ON STUB IMPLEMENTATIONS**

```python
# Line 22-34: Import stub functions
from langgraph_workflows.ontology_investigator import (
    investigate_ontology,  # ❌ Returns stub response
    get_ontology_investigator,  # ❌ Returns None
    get_ontology_stats,  # ❌ Returns zeros
    get_gap_analysis,  # ❌ Returns zeros
    get_opportunity_scores,  # ❌ Returns empty list
    get_persona_distribution,  # ❌ Returns stub
    get_all_tenants,  # ❌ Returns empty list
    get_all_industries,  # ❌ Returns empty list
    get_departments_by_function,  # ❌ Returns empty list
    get_roles_by_department,  # ❌ Returns empty list
    get_jtbds_filtered  # ❌ Returns empty list
)
```

**Impact:** All 11 API endpoints return stub/empty responses:
- `POST /v1/ontology-investigator/query` → `{"success": false, "response": "not yet implemented"}`
- `POST /v1/ontology-investigator/gap-analysis` → `{"total_roles": 0, "coverage_percentage": 0.0}`
- `POST /v1/ontology-investigator/opportunities` → `[]`
- `GET /v1/ontology-investigator/hierarchy` → All zeros
- `GET /v1/ontology-investigator/tenants` → `[]`
- `GET /v1/ontology-investigator/industries` → `[]`
- `GET /v1/ontology-investigator/departments` → `[]`
- `GET /v1/ontology-investigator/roles` → `[]`
- `GET /v1/ontology-investigator/jtbds` → `[]`

**HIGH #1: NO AUTHENTICATION/AUTHORIZATION**

```python
# No auth decorators on ANY route
@router.post("/query", response_model=InvestigatorResponse)
async def query_ontology_investigator(request: InvestigatorQueryRequest):
    # ❌ No @require_auth
    # ❌ No tenant isolation check
    # ❌ No permission validation
```

**Impact:** Anyone can call these endpoints without authentication.

**MEDIUM #1: HARDCODED MODEL LIST IN HEALTH CHECK**

```python
# Lines 446-456: Hardcoded reasoning models
"reasoning_models": {
    "level_1_primary": "claude-opus-4-5-20251101",
    "level_2_secondary": "o1",
    "level_3_tertiary": "gemini-2.5-pro",
    # ... etc
}
```

**Issue:** Models list doesn't match actual LangGraph configuration (which is a stub).

#### Positive Observations
- Well-structured Pydantic models for request/response
- Good API documentation in docstrings
- Comprehensive error handling structure (though handling stub responses)
- Follows FastAPI best practices for route organization

---

### File: `/services/ai-engine/src/api/routes/value_investigator.py` (379 lines)

#### Purpose
REST API for value framework analysis, ROI insights, JTBD/role value analysis.

#### Critical Issues

**CRITICAL #1: ALL ENDPOINTS USE STUB IMPLEMENTATION**

```python
# Line 20: Import stub function
from langgraph_workflows.value_investigator import investigate_value  # ❌ STUB

# Lines 88-131: All endpoints get stub responses
@router.post("/query", response_model=InvestigatorResponse)
async def query_investigator(request: InvestigatorQueryRequest):
    result = await investigate_value(...)  # ❌ Returns {"success": false, "response": "not yet implemented"}
```

**Impact:** All value investigator endpoints non-functional:
- `POST /v1/value-investigator/query` → stub response
- `POST /v1/value-investigator/analyze-jtbd/{id}` → stub response
- `POST /v1/value-investigator/analyze-role/{id}` → stub response

**HIGH #1: NO AUTHENTICATION**

Same issue as ontology routes - no auth decorators.

#### Positive Observations
- Clean API design
- Comprehensive suggested questions for user guidance
- Good health check endpoint structure

---

### File: `/services/ai-engine/src/api/routes/value_framework.py` (362 lines)

#### Purpose
REST API for ROI calculations and value metrics (JTBD/role level).

#### Critical Issues

**MEDIUM #1: DEPENDENCY ON roi_calculator_service WITHOUT VALIDATION**

```python
# Lines 114-136: No validation that calculator is initialized
calculator = get_roi_calculator()  # Could be None
dashboard = await calculator.get_value_dashboard(tenant_uuid)  # May fail
```

**Fix:** Add initialization check:
```python
calculator = get_roi_calculator()
if not calculator or not calculator.supabase:
    raise HTTPException(status_code=503, detail="ROI Calculator not initialized")
```

**MEDIUM #2: UUID CONVERSION WITHOUT VALIDATION**

```python
# Line 115: Direct UUID conversion without try/catch
tenant_uuid = UUID(tenant_id) if tenant_id else None
```

**Fix:**
```python
try:
    tenant_uuid = UUID(tenant_id) if tenant_id else None
except ValueError:
    raise HTTPException(status_code=400, detail=f"Invalid tenant ID format: {tenant_id}")
```

#### Positive Observations
- Actually functional (unlike investigator routes)
- Good use of dataclasses for response models
- Proper error handling in most places
- Returns real calculated data from database

---

## 2. BACKEND SERVICES ANALYSIS

### File: `/services/ai-engine/src/services/supabase_client.py` (760 lines)

#### Purpose
Supabase database client with vector operations and RLS support.

#### CRITICAL SECURITY VULNERABILITIES

**CRITICAL #1: SQL INJECTION - Line 132**

```python
# Lines 126-134: DIRECT STRING INTERPOLATION IN SQL
async with asyncio.create_task(asyncio.to_thread(self.engine.connect)) as conn:
    await asyncio.create_task(
        asyncio.to_thread(
            conn.execute,
            text(f"SET LOCAL app.tenant_id = '{tenant_id}'")  # ❌ SQL INJECTION
        )
    )
```

**Attack Vector:**
```python
# Malicious input
tenant_id = "fake'; DROP TABLE agents CASCADE; --"

# Results in SQL:
# SET LOCAL app.tenant_id = 'fake'; DROP TABLE agents CASCADE; --'
```

**Fix:**
```python
# Use parameterized query
conn.execute(
    text("SET LOCAL app.tenant_id = :tenant_id"),
    {"tenant_id": tenant_id}
)
```

**CRITICAL #2: INVALID ASYNC CONTEXT MANAGER - Lines 126-137**

```python
# ❌ WRONG: asyncio.create_task() is NOT an async context manager
async with asyncio.create_task(asyncio.to_thread(self.engine.connect)) as conn:
    # This will raise TypeError at runtime
```

**Fix:**
```python
# Use proper threading with asyncio
conn = await asyncio.to_thread(self.engine.connect)
try:
    await asyncio.to_thread(
        conn.execute,
        text("SET LOCAL app.tenant_id = :tenant_id"),
        {"tenant_id": tenant_id}
    )
    await asyncio.to_thread(conn.commit)
finally:
    await asyncio.to_thread(conn.close)
```

**HIGH #1: NO INITIALIZATION CHECK IN PUBLIC METHODS**

```python
# Lines 273-306: get_agent_by_id() doesn't check if client initialized
async def get_agent_by_id(self, agent_id: str) -> Optional[Dict[str, Any]]:
    try:
        # ❌ self.client could be None if initialize() never called
        result = self.client.table("agents").select("*").eq("id", agent_id).execute()
```

**Impact:** Will crash with `AttributeError: 'NoneType' object has no attribute 'table'`

**Fix:** Add check in all public methods:
```python
async def get_agent_by_id(self, agent_id: str) -> Optional[Dict[str, Any]]:
    if not self.client:
        raise RuntimeError("Supabase client not initialized. Call initialize() first.")
    try:
        result = self.client.table("agents").select("*").eq("id", agent_id).execute()
```

**MEDIUM #1: GRACEFUL DEGRADATION SWALLOWS ERRORS**

```python
# Lines 139-150: Silently ignoring tenant context failures
except Exception as e:
    logger.error("Failed to set tenant context", tenant_id=tenant_id, error=str(e))
    # Don't raise - allow graceful degradation
    pass  # ❌ Security issue - RLS may not be enforced
```

**Issue:** If RLS setup fails, queries continue without tenant filtering → data leakage.

**Fix:** Raise exception for critical security failures:
```python
except Exception as e:
    logger.error("Failed to set tenant context", tenant_id=tenant_id, error=str(e))
    raise RuntimeError(f"Cannot enforce tenant isolation: {e}")
```

#### Positive Observations
- Well-structured singleton pattern
- Good logging throughout
- Comprehensive method coverage (agents, queries, documents, metrics)
- Proper async/await in most places
- Good separation of concerns (REST vs vector operations)

---

### File: `/services/ai-engine/src/services/roi_calculator_service.py` (596 lines)

#### Purpose
Calculates ROI and value metrics for JTBDs and roles.

#### Issues

**MEDIUM #1: HARDCODED BUSINESS LOGIC VALUES**

```python
# Lines 173-180: Hardcoded multipliers and rates
complexity_multiplier = {
    "low": 2, "medium": 5, "high": 10, "very_high": 20
}.get(jtbd.get("complexity", "medium"), 5)

hourly_rate = 75  # ❌ Hardcoded $75/hour
cost_savings = hours_saved * 12 * hourly_rate
```

**Issue:** Should be configurable per tenant/industry.

**Fix:**
```python
# Get from settings or tenant config
hourly_rate = await self.get_tenant_hourly_rate(tenant_id) or 75
```

**LOW #1: DIVISION BY ZERO PROTECTION INCONSISTENT**

```python
# Line 169: Good protection
total_value_score = ... / max(len(categories) + len(drivers), 1) * 100

# Line 282: Missing protection (could divide by 0 if no JTBDs)
category_breakdown = {name: score / len(jtbd_ids) for name, score in category_totals.items()}
```

**Fix:** Use `max(len(jtbd_ids), 1)` consistently.

#### Positive Observations
- Actually functional (calculates real ROI from database)
- Clean dataclass usage for type safety
- Proper async throughout
- Good separation of JTBD vs Role calculations
- Comprehensive value metrics (categories, drivers, impact)

---

## 3. LANGGRAPH WORKFLOWS ANALYSIS

### File: `/services/ai-engine/src/langgraph_workflows/ontology_investigator.py` (214 lines)

#### CRITICAL: 100% STUB IMPLEMENTATION

```python
# Lines 1-16: Explicit deprecation warning
"""
Ontology Investigator stub for legacy compatibility.

DEPRECATED: This module provides stub implementations for backward compatibility.
The actual Ontology Investigator functionality is under development.
"""

warnings.warn(
    "langgraph_workflows.ontology_investigator is deprecated and provides stub responses.",
    DeprecationWarning,
    stacklevel=2
)
```

**All 11 functions return stub/empty responses:**

1. `investigate_ontology()` → `{"success": false, "response": "not yet implemented"}`
2. `get_ontology_investigator()` → `None`
3. `get_ontology_stats()` → All zeros with `"is_stub": True`
4. `get_gap_analysis()` → All zeros
5. `get_opportunity_scores()` → `[]`
6. `get_persona_distribution()` → All zeros
7. `get_all_tenants()` → `[]`
8. `get_all_industries()` → `[]`
9. `get_departments_by_function()` → `[]`
10. `get_roles_by_department()` → `[]`
11. `get_jtbds_filtered()` → `[]`

**Impact:**
- `/discover` route completely non-functional
- Frontend will display "0 personas", "0 roles", "0 departments"
- Any ontology analysis features broken

**Estimated Implementation Effort:** 2-4 weeks
- Need to implement actual LangGraph workflow with reasoning models
- Need to connect to Supabase to query ontology data
- Need to implement gap analysis algorithms
- Need to implement opportunity scoring logic

---

### File: `/services/ai-engine/src/langgraph_workflows/value_investigator.py` (61 lines)

#### CRITICAL: 100% STUB IMPLEMENTATION

```python
# Similar stub pattern
async def investigate_value(...) -> Dict[str, Any]:
    return {
        "success": False,
        "response": "Value Investigator is not yet implemented. This is a stub response.",
        "analysis_type": "stub",
        # ...
    }
```

**Impact:**
- `/optimize` intelligent analysis features broken
- Value insights, ROI recommendations non-functional
- Only basic ROI calculations work (from roi_calculator_service)

---

## 4. DATABASE MIGRATIONS ANALYSIS

### Migration Files Overview

**Total Migration Files:** 40+ files related to ontology

| Category | Count | Examples |
|----------|-------|----------|
| Ontology Core | 4 | `003_normalize_ontology.sql`, `053_enterprise_ontology_complete.sql` |
| JTBD | 12 | `028-031_jtbd_gold_standard_phase*.sql`, `039_pharma_jtbd_seed.sql` |
| Personas | 21 | `038-049_pharma_personas_*.sql`, `030-041_dh_*_personas.sql` |
| Role Mappings | 3 | `034_jtbd_role_bulk_mapping.sql`, `130_create_agent_roles_junction.sql` |

### Issues

**CRITICAL #1: NO MIGRATION EXECUTION ORDER VALIDATION**

- 40+ migration files with complex interdependencies
- No `depends_on` metadata or execution order enforcement
- Files named with dates/numbers but no rollback validation

**Fix:** Create migration validation script:
```python
# scripts/validate_migrations.py
def validate_migration_order(migration_files):
    # Check for missing dependencies
    # Verify chronological order
    # Detect circular dependencies
```

**HIGH #1: NO ROLLBACK SCRIPTS**

- All migrations are forward-only
- No documented rollback procedures
- Risky for production deployment

**Fix:** Create corresponding `*_rollback.sql` for each migration.

**MEDIUM #1: LARGE SEED DATA IN MIGRATIONS**

```sql
-- 20251129_040_pharma_personas_complete.sql
-- Likely 1000+ INSERT statements
```

**Issue:** Migrations are slow, hard to debug, risk timeout on Railway.

**Fix:**
- Split seed data into separate `/database/seeds/` directory
- Use `COPY FROM` for bulk inserts
- Make seeds optional, run separately from schema migrations

#### Positive Observations
- Comprehensive ontology schema coverage
- Well-organized persona seed data by function
- Good use of UUIDs for references
- Proper foreign key constraints (based on file 003 preview)

---

## 5. DATABASE POLICIES ANALYSIS

### RLS Policy Files Found

**Files in `/database/policies/`:**
- `agents.policy.sql` - RLS for agents table
- `agents-junction.policy.sql` - RLS for agent_roles junction
- `knowledge.policy.sql` - RLS for knowledge base
- `conversations.policy.sql` - RLS for chat conversations
- `workflows.policy.sql` - RLS for workflows
- `tenants.policy.sql` - RLS for tenants
- `jobs.policy.sql` - RLS for background jobs
- `token_usage.policy.sql` - RLS for token usage tracking
- `vectors.policy.sql` - RLS for vector embeddings

### CRITICAL MISSING POLICIES

**The following ontology tables have NO RLS policies:**

1. **personas** - No RLS policy file found
   - **Risk:** Users can query all personas across all tenants
   - **Fix:** Create `personas.policy.sql` with tenant isolation

2. **org_roles** - No RLS policy
   - **Risk:** Cross-tenant role data leakage

3. **org_departments** - No RLS policy

4. **org_functions** - No RLS policy

5. **jtbd** - No RLS policy
   - **Risk:** Users can see JTBD from other tenants

6. **jtbd_value_categories** - No RLS policy

7. **jtbd_value_drivers** - No RLS policy

8. **value_categories** - No RLS policy (may be okay if global reference data)

9. **value_drivers** - No RLS policy (may be okay if global reference data)

**Impact:**
- Any user with database access can query all ontology data across tenants
- Violates multi-tenancy security model
- Compliance risk (HIPAA, GDPR if PHI/PII in personas)

**Fix Priority:** CRITICAL - Must be fixed before production deployment

**Recommended Policy Template:**
```sql
-- personas.policy.sql
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their tenant's personas
CREATE POLICY personas_tenant_isolation ON personas
FOR SELECT
TO authenticated
USING (
  tenant_id = current_setting('app.tenant_id', true)::uuid
);

-- Service role can see all
CREATE POLICY personas_service_role ON personas
FOR ALL
TO service_role
USING (true);
```

---

## 6. FRONTEND ANALYSIS

### File: `/apps/vital-system/src/app/(app)/personas/page.tsx` (651 lines)

#### Purpose
Displays persona cards with filtering, grouping, and detailed views.

#### Issues

**MEDIUM #1: NO ERROR BOUNDARY**

```tsx
// No React Error Boundary wrapping the page
// If component crashes, entire page goes blank
```

**Fix:**
```tsx
import { ErrorBoundary } from '@/components/error-boundary';

export default function PersonasPageWithErrorBoundary() {
  return (
    <ErrorBoundary fallback={<ErrorFallbackUI />}>
      <PersonasPage />
    </ErrorBoundary>
  );
}
```

**LOW #1: HARDCODED ARCHETYPE CONFIG**

```tsx
// Lines 22-43: Hardcoded archetype metadata
const archetypeConfig: Record<string, {...}> = {
  AUTOMATOR: { icon: <Zap />, color: 'text-blue-600', ... },
  // ...
};
```

**Issue:** Should come from database or config file for consistency.

**LOW #2: NO VIRTUALIZATION FOR LARGE LISTS**

```tsx
// Lines 442-450: Rendering all personas without virtualization
{sortedPersonas.map((persona) => (
  <PersonaCard key={persona.id} persona={persona} ... />
))}
```

**Issue:** Could be slow if 1000+ personas loaded.

**Fix:** Use `react-window` or `react-virtualized` for grid view.

#### Positive Observations
- Excellent UX with multiple views (grid, list, by archetype, by department, focus)
- Good use of memoization (`useMemo`) for filtering
- Proper loading states
- Good error handling with retry
- Clean TypeScript types
- Responsive design
- Accessible (uses proper ARIA via shadcn/ui)

---

### File: `/apps/vital-system/src/app/(app)/jobs-to-be-done/page.tsx` (689 lines)

#### Purpose
Displays JTBD cards with filtering by category, priority, status.

#### Issues

Similar to personas page:
- **MEDIUM:** No error boundary
- **LOW:** No virtualization for large lists
- **LOW:** Hardcoded color mappings

#### Positive Observations
- Comprehensive stats dashboard
- Good filtering UX
- ODI (Opportunity-Difficulty-Importance) score visualization
- Clean card/list view toggle
- Proper TypeScript typing

---

## 7. SECURITY AUDIT SUMMARY

### Vulnerabilities Found

| Severity | Issue | File | Line | Impact |
|----------|-------|------|------|--------|
| **CRITICAL** | SQL Injection | `supabase_client.py` | 132 | Database compromise |
| **CRITICAL** | Missing RLS Policies | `database/policies/` | N/A | Cross-tenant data leakage |
| **CRITICAL** | Invalid async context manager | `supabase_client.py` | 126 | Runtime crash |
| **HIGH** | No authentication on API routes | `ontology_investigator.py` | All | Unauthorized access |
| **HIGH** | Uninitialized client usage | `supabase_client.py` | 273+ | Runtime crash |
| **MEDIUM** | Gracefully ignoring RLS failures | `supabase_client.py` | 149 | Security bypass |
| **LOW** | No CORS configuration visible | API routes | N/A | Potential CSRF |

### Security Recommendations

1. **IMMEDIATE (Pre-Deployment):**
   - Fix SQL injection (use parameterized queries)
   - Create RLS policies for all ontology tables
   - Add authentication middleware to all routes
   - Fix async context manager usage

2. **HIGH PRIORITY:**
   - Add API rate limiting
   - Implement request validation middleware
   - Add audit logging for all ontology queries
   - Set up CORS properly

3. **MEDIUM PRIORITY:**
   - Add JWT token validation
   - Implement role-based access control (RBAC)
   - Add input sanitization for all user inputs
   - Set up API gateway with WAF rules

---

## 8. PERFORMANCE ISSUES

### Backend Performance

**Issue #1: N+1 Query Potential in ROI Calculator**

```python
# roi_calculator_service.py lines 261-270
# For each JTBD, fetches categories and drivers separately
for jtbd_id in jtbd_ids:
    cat_response = self.supabase.table("jtbd_value_categories").select(...)
    drv_response = self.supabase.table("jtbd_value_drivers").select(...)
```

**Fix:** Use `.in_()` filter to batch fetch:
```python
# Fetch all at once
cat_response = self.supabase.table("jtbd_value_categories").select(...).in_("jtbd_id", jtbd_ids)
```

**Issue #2: No Caching for Reference Data**

```python
# value_framework.py line 237
# Fetches value_categories on every request
response = supabase.table("value_categories").select("id, name, code, description").execute()
```

**Fix:** Add Redis caching or in-memory LRU cache:
```python
@lru_cache(maxsize=1, ttl=3600)
async def get_value_categories():
    return supabase.table("value_categories").select(...).execute()
```

### Frontend Performance

**Issue #1: No Virtualization for Large Lists**

Both personas and JTBD pages render all items, could be slow with 1000+ records.

**Fix:** Use `react-window` for virtualized scrolling.

**Issue #2: No Image Optimization**

Icons/avatars loaded without Next.js Image optimization.

**Fix:** Use `next/image` component with proper sizing.

---

## 9. DEPLOYMENT CHECKLIST

### Pre-Deployment (MUST FIX)

- [ ] **FIX SQL INJECTION** - Parameterize all SQL queries
- [ ] **CREATE RLS POLICIES** - Add RLS for personas, roles, departments, functions, jtbd
- [ ] **IMPLEMENT LANGGRAPH WORKFLOWS** - Replace stub implementations OR remove routes from `register.py`
- [ ] **FIX ASYNC CONTEXT MANAGER** - Correct `asyncio.create_task()` usage
- [ ] **ADD AUTHENTICATION** - Add `@require_auth` to all API routes
- [ ] **ADD INITIALIZATION CHECKS** - Validate Supabase client initialized before use
- [ ] **CREATE MIGRATION VALIDATION** - Script to verify migration order and dependencies
- [ ] **CREATE ROLLBACK SCRIPTS** - For each migration, create rollback SQL

### Railway Deployment Configuration

```yaml
# railway.json (Backend)
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "uvicorn src.main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  },
  "env": {
    "PYTHONPATH": "/app/services/ai-engine/src",  # CRITICAL for imports
    "SUPABASE_URL": "${{SUPABASE_URL}}",
    "SUPABASE_SERVICE_ROLE_KEY": "${{SUPABASE_SERVICE_ROLE_KEY}}",
    "DATABASE_URL": "${{DATABASE_URL}}",
    "OPENAI_API_KEY": "${{OPENAI_API_KEY}}"
  }
}
```

### Vercel Deployment (Frontend)

```json
// vercel.json
{
  "buildCommand": "cd apps/vital-system && pnpm build",
  "outputDirectory": "apps/vital-system/.next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://vital-api.railway.app",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

---

## 10. RECOMMENDATIONS (PRIORITIZED)

### CRITICAL (Fix Before ANY Deployment)

1. **Fix SQL Injection Vulnerability**
   - File: `supabase_client.py` line 132
   - Use parameterized queries
   - **Time:** 15 minutes

2. **Create RLS Policies for Ontology Tables**
   - Tables: `personas`, `org_roles`, `org_departments`, `org_functions`, `jtbd`, `jtbd_value_*`
   - Use template from Section 5
   - **Time:** 2-3 hours

3. **Remove Stub Routes OR Implement Workflows**
   - **Option A:** Remove `/ontology-investigator` and `/value-investigator` routes from `register.py`
   - **Option B:** Implement actual LangGraph workflows (2-4 weeks)
   - **Time:** 5 minutes (Option A) or 2-4 weeks (Option B)

4. **Fix Async Context Manager**
   - File: `supabase_client.py` lines 126-137
   - Remove `async with asyncio.create_task()`
   - **Time:** 30 minutes

### HIGH PRIORITY (Fix Within 1 Week)

5. **Add Authentication to API Routes**
   - Add `@require_auth` decorator to all routes
   - Validate JWT tokens
   - **Time:** 1 day

6. **Add Initialization Checks to Supabase Client**
   - Check `self.client is not None` in all public methods
   - **Time:** 2 hours

7. **Create Migration Validation Script**
   - Validate execution order
   - Check dependencies
   - **Time:** 4 hours

8. **Add API Rate Limiting**
   - Use FastAPI middleware or Nginx
   - **Time:** 2 hours

### MEDIUM PRIORITY (Fix Within 2 Weeks)

9. **Add Caching for Reference Data**
   - Cache `value_categories`, `value_drivers`
   - Use Redis or in-memory cache
   - **Time:** 4 hours

10. **Add Error Boundaries to Frontend Pages**
    - Wrap personas and JTBD pages
    - **Time:** 1 hour

11. **Optimize Frontend Performance**
    - Add virtualization for large lists
    - Use Next.js Image optimization
    - **Time:** 4 hours

12. **Create Rollback Scripts for Migrations**
    - For critical migrations
    - **Time:** 1 day

### LOW PRIORITY (Nice to Have)

13. **Move Seed Data Out of Migrations**
    - Create `/database/seeds/` directory
    - **Time:** 2 hours

14. **Add API Documentation**
    - Use FastAPI's auto-generated Swagger UI
    - **Time:** 1 hour

15. **Add Request Validation Middleware**
    - Sanitize inputs
    - **Time:** 4 hours

---

## 11. EVIDENCE APPENDIX

### Backend Files Reviewed

```
services/ai-engine/src/
├── api/routes/
│   ├── ontology_investigator.py (575 lines) ✅ Reviewed
│   ├── value_investigator.py (379 lines) ✅ Reviewed
│   └── value_framework.py (362 lines) ✅ Reviewed
├── services/
│   ├── supabase_client.py (760 lines) ✅ Reviewed
│   └── roi_calculator_service.py (596 lines) ✅ Reviewed
└── langgraph_workflows/
    ├── ontology_investigator.py (214 lines) ✅ Reviewed - STUB
    └── value_investigator.py (61 lines) ✅ Reviewed - STUB
```

### Frontend Files Reviewed

```
apps/vital-system/src/app/(app)/
├── personas/
│   ├── page.tsx (651 lines) ✅ Reviewed
│   ├── [slug]/page.tsx ⚠️ Not reviewed (detail page)
│   ├── test-page.tsx ⚠️ Test file
│   └── simple-test.tsx ⚠️ Test file
└── jobs-to-be-done/
    └── page.tsx (689 lines) ✅ Reviewed
```

### Database Files Reviewed

```
database/
├── migrations/ (40+ ontology-related files)
│   ├── 003_normalize_ontology.sql (100 lines reviewed)
│   ├── 028-031_jtbd_gold_standard_phase*.sql
│   ├── 038-049_pharma_personas_*.sql
│   └── 030-041_dh_*_personas.sql
└── policies/ (10 policy files)
    ├── agents.policy.sql ✅ Exists
    ├── agents-junction.policy.sql ✅ Exists
    ├── knowledge.policy.sql ✅ Exists
    ├── personas.policy.sql ❌ MISSING
    ├── org_roles.policy.sql ❌ MISSING
    ├── org_departments.policy.sql ❌ MISSING
    ├── org_functions.policy.sql ❌ MISSING
    ├── jtbd.policy.sql ❌ MISSING
    ├── jtbd_value_categories.policy.sql ❌ MISSING
    └── jtbd_value_drivers.policy.sql ❌ MISSING
```

---

## 12. DEPLOYMENT READINESS MATRIX

| Component | Status | Blockers | ETA to Deploy |
|-----------|--------|----------|---------------|
| **Ontology API (Stub Routes)** | ❌ NOT READY | Stub implementations | Remove routes: 5 min OR implement: 2-4 weeks |
| **Value API (ROI Calculator)** | ⚠️ PARTIAL | Missing RLS, auth | Fix security: 1 day |
| **Supabase Client** | ❌ NOT READY | SQL injection, async bug | Fix critical bugs: 1-2 hours |
| **ROI Calculator Service** | ⚠️ FUNCTIONAL | Minor improvements | Optional refinements: 4 hours |
| **Frontend (Personas)** | ⚠️ FUNCTIONAL | Depends on backend | No blockers if backend fixed |
| **Frontend (JTBD)** | ⚠️ FUNCTIONAL | Depends on backend | No blockers if backend fixed |
| **Database Migrations** | ⚠️ FUNCTIONAL | No validation script | Create validation: 4 hours |
| **RLS Policies** | ❌ MISSING | No ontology RLS | Create policies: 2-3 hours |

**Overall Deployment Readiness: NOT READY**

**Minimum time to deploy-ready state:**
- **Option A (Remove stub routes):** 1-2 days (fix security, add RLS)
- **Option B (Implement full features):** 2-4 weeks (implement workflows + fix security)

---

## CONCLUSION

The VITAL ontology and value framework codebase has a **solid architectural foundation** but contains **multiple critical deployment blockers**:

1. **Stub implementations** for key features (Ontology Investigator, Value Investigator)
2. **Security vulnerabilities** (SQL injection, missing RLS policies, no authentication)
3. **Runtime errors** (invalid async patterns, uninitialized client usage)

**Recommended Path Forward:**

**SHORT TERM (Deploy in 1-2 days):**
- Remove stub investigator routes from production
- Fix SQL injection and async bugs
- Add RLS policies for ontology tables
- Add authentication to remaining routes
- Deploy with limited functionality (basic ROI calculations only)

**LONG TERM (Full feature deployment in 2-4 weeks):**
- Implement LangGraph workflows with actual reasoning models
- Add comprehensive testing (unit, integration, E2E)
- Add performance optimizations (caching, virtualization)
- Add monitoring and alerting
- Deploy full ontology analysis capabilities

**Choose based on business priority:** Quick deployment with limited features vs. full feature deployment with delay.

---

**Report End**
