# Phase 7.3 Complete: API Context Updates

**Status:** ✅ COMPLETE  
**Date:** February 1, 2025  
**Phase:** 7.3 (API Context Updates)

---

## Summary

Completed Phase 7.3 by implementing tenant context middleware and tenant-aware Supabase clients, replacing service role key usage with tenant-scoped access.

---

## Components Created

### 1. API Gateway Tenant Middleware

**File:** `services/api-gateway/src/middleware/tenant.js`

**Purpose:** Extract tenant context from requests and attach to request object.

**Features:**
- **Priority 1:** `x-tenant-id` header (explicit override)
- **Priority 2:** Subdomain detection (e.g., `digital-health-startup.vital.expert`)
- **Priority 3:** Cookie (`tenant_id`)
- **Priority 4:** Fallback to platform tenant

**Implementation:**
- Extracts tenant ID from subdomain by querying Supabase `tenants` table
- Sets `req.tenantId` for all routes
- Sets `req.headers['x-tenant-id']` for downstream services
- Logs tenant detection method for debugging
- Gracefully falls back to platform tenant on errors

---

### 2. API Gateway Tenant-Aware Supabase Client Factory

**File:** `services/api-gateway/src/utils/supabase-client.js`

**Purpose:** Create tenant-aware Supabase clients that respect RLS.

**Functions:**

1. **`createTenantAwareClient(tenantId, userId?)`**
   - Uses anon key with RLS enabled
   - Sets `x-tenant-id` header for tenant context
   - Stores tenant ID and user ID on client object
   - **Should be used for all tenant operations**

2. **`createAdminClient()`**
   - Uses service role key (bypasses RLS)
   - **Only for platform-level operations**
   - Logs warning when used
   - **DO NOT use for regular tenant operations**

3. **`executeWithTenantContext(client, tenantId, queryFn)`**
   - Sets tenant context via `set_tenant_context()` PostgreSQL function
   - Executes query with tenant context
   - Returns query result

---

### 3. Python AI Engine Tenant Context Middleware

**File:** `services/ai-engine/src/middleware/tenant_context.py`

**Purpose:** Extract tenant context from FastAPI requests and set in database.

**Functions:**

1. **`get_tenant_id(request, x_tenant_id)`**
   - FastAPI dependency function
   - Extracts tenant ID from `x-tenant-id` header
   - Falls back to platform tenant if not provided
   - Stores in `request.state.tenant_id`
   - Returns tenant ID string

2. **`set_tenant_context_in_db(tenant_id, supabase_client)`**
   - Calls `set_tenant_context()` PostgreSQL function
   - Sets `app.tenant_id` session variable for RLS
   - Logs success/failure
   - Gracefully handles errors (doesn't block request)

---

## Updates Made

### API Gateway (`services/api-gateway/src/index.js`)

**Changes:**
- Added `cookie-parser` middleware
- Added `tenantMiddleware` (after body parsing, before routes)
- Replaced all `req.headers['x-tenant-id']` with `req.tenantId`
  - All routes now use tenant from middleware instead of manual extraction
- Tenant ID automatically forwarded to Python AI Engine via `x-tenant-id` header

**Routes Updated:**
- `/v1/chat/completions`
- `/api/rag/query`
- `/api/mode2/automatic`
- `/api/mode3/autonomous-automatic`
- `/api/mode4/autonomous-manual`
- `/api/agents/:id/stats`
- `/api/embeddings/generate`
- `/api/embeddings/generate/batch`
- `/api/agents/select`
- `/api/panel/orchestrate`

### Python AI Engine (`services/ai-engine/src/main.py`)

**Changes:**
- Imported tenant context dependencies
- Updated `/api/mode1/manual` endpoint:
  - Added `Request` parameter
  - Added `tenant_id: str = Depends(get_tenant_id)` dependency
  - Calls `set_tenant_context_in_db()` before queries
- Tenant context now set in database session for RLS policies

### Package Dependencies

**File:** `services/api-gateway/package.json`
- Added `cookie-parser: ^1.4.6` dependency

---

## How It Works

### Request Flow

1. **Request arrives at API Gateway**
   - Tenant middleware extracts tenant ID
   - Sets `req.tenantId` and `req.headers['x-tenant-id']`

2. **API Gateway routes to Python AI Engine**
   - Forwards `x-tenant-id` header
   - Python AI Engine receives tenant ID

3. **Python AI Engine sets tenant context**
   - `get_tenant_id()` dependency extracts tenant ID
   - `set_tenant_context_in_db()` calls PostgreSQL function
   - Sets `app.tenant_id` session variable

4. **Database queries respect tenant context**
   - RLS policies check `get_current_tenant_id()`
   - Returns only resources accessible to tenant
   - Platform shared resources accessible to all tenants

---

## Tenant Detection Priority

1. **`x-tenant-id` Header** (Highest Priority)
   - Explicit override from client
   - Used when client explicitly sets tenant

2. **Subdomain Detection**
   - Extracts subdomain from `Host` header
   - Queries Supabase for tenant by `slug`
   - Example: `digital-health-startup.vital.expert` → queries `tenants.slug = 'digital-health-startup'`

3. **Cookie (`tenant_id`)**
   - Fallback if subdomain not found
   - Persistent across requests

4. **Platform Tenant** (Fallback)
   - Fixed UUID: `00000000-0000-0000-0000-000000000001`
   - Used when no tenant detected

---

## Next Steps

### Phase 7.4: Testing & Validation

Now that tenant context is implemented, test:

- [ ] Tenant isolation: Agents not accessible across tenants
- [ ] Shared resource access: Platform agents accessible to all tenants
- [ ] Selective sharing: Resources shared with specific tenants only
- [ ] Platform admin bypass: Platform admins can access all resources
- [ ] RLS policies: Queries automatically filtered by tenant context
- [ ] API middleware: Tenant context extracted from requests correctly
- [ ] Subdomain detection: Tenant detected from subdomain correctly
- [ ] Header detection: Tenant detected from `x-tenant-id` header correctly
- [ ] Cookie detection: Tenant detected from cookie correctly
- [ ] Fallback: Platform tenant used when no tenant detected

---

## Migration Path

### Replace Service Role Key Usage

**Before:**
```javascript
const supabase = createClient(url, SERVICE_ROLE_KEY);
```

**After:**
```javascript
const { createTenantAwareClient } = require('./utils/supabase-client');
const supabase = createTenantAwareClient(req.tenantId);
```

### Update Database Queries

**Before:**
```javascript
const { data } = await supabase.from('agents').select('*');
// Returns ALL agents (bypasses RLS)
```

**After:**
```javascript
const supabase = createTenantAwareClient(req.tenantId);
const { data } = await supabase.from('agents').select('*');
// Returns only tenant's agents + shared platform agents (respects RLS)
```

---

## Files Changed

1. ✅ `services/api-gateway/src/middleware/tenant.js` - Created
2. ✅ `services/api-gateway/src/utils/supabase-client.js` - Created
3. ✅ `services/api-gateway/src/index.js` - Updated
4. ✅ `services/api-gateway/package.json` - Updated
5. ✅ `services/ai-engine/src/middleware/tenant_context.py` - Created
6. ✅ `services/ai-engine/src/main.py` - Updated

---

**Prepared by:** VITAL Platform Architecture Team  
**Last Updated:** February 1, 2025  
**Status:** Phase 7.3 complete, Phase 7.4 (Testing) next

