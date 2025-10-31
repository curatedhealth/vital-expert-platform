# Phase 7.4 Testing Guide: Tenant Isolation & Resource Sharing

**Status:** ✅ TEST SUITES CREATED  
**Date:** February 1, 2025  
**Phase:** 7.4 (Testing & Validation)

---

## Test Suites Created

### 1. Unit Tests

#### API Gateway Tenant Middleware Tests
**File:** `services/api-gateway/src/middleware/__tests__/tenant.test.js`

**Coverage:**
- ✅ Tenant extraction from `x-tenant-id` header
- ✅ Subdomain detection (e.g., `digital-health-startup.vital.expert`)
- ✅ Cookie fallback (`tenant_id` cookie)
- ✅ Platform tenant fallback
- ✅ Common subdomain skipping (`www`, `api`, `app`)
- ✅ Error handling and graceful fallback
- ✅ Development logging

**Run tests:**
```bash
cd services/api-gateway
npm test -- src/middleware/__tests__/tenant.test.js
```

---

#### Python AI Engine Tenant Context Tests
**File:** `services/ai-engine/src/tests/middleware/test_tenant_context.py`

**Coverage:**
- ✅ Tenant ID extraction from headers
- ✅ Platform tenant fallback
- ✅ Request state storage
- ✅ Database tenant context setting
- ✅ Error handling (missing client, RPC errors)
- ✅ Success logging

**Run tests:**
```bash
cd services/ai-engine
pytest src/tests/middleware/test_tenant_context.py -v
```

---

### 2. Integration Tests

#### API Gateway Tenant Isolation Tests
**File:** `services/api-gateway/src/__tests__/integration/tenant-isolation.test.js`

**Coverage:**
- ✅ Tenant isolation: Tenants can only access their own resources
- ✅ Shared resources: Platform agents accessible to all tenants
- ✅ Resource creation: Agents created with correct tenant ID
- ✅ Access prevention: Tenant B cannot access Tenant A's private resources
- ✅ Selective sharing: Resources shared with specific tenants

**Run tests:**
```bash
cd services/api-gateway
npm test -- src/__tests__/integration/tenant-isolation.test.js
```

---

#### Python AI Engine Tenant Isolation Tests
**File:** `services/ai-engine/src/tests/integration/test_tenant_isolation.py`

**Coverage:**
- ✅ Tenant header acceptance
- ✅ Tenant context setting in database
- ✅ Platform tenant fallback
- ✅ Shared resource access
- ✅ Database query tenant context passing

**Run tests:**
```bash
cd services/ai-engine
pytest src/tests/integration/test_tenant_isolation.py -v
```

---

## Running All Tests

### API Gateway Tests

```bash
cd services/api-gateway

# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- src/middleware/__tests__/tenant.test.js
npm test -- src/__tests__/integration/tenant-isolation.test.js
```

### Python AI Engine Tests

```bash
cd services/ai-engine

# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test suite
pytest src/tests/middleware/test_tenant_context.py -v
pytest src/tests/integration/test_tenant_isolation.py -v
```

---

## Test Coverage Checklist

### Tenant Isolation Tests

- [ ] **Unit Tests:**
  - [x] Tenant extraction from header
  - [x] Tenant extraction from subdomain
  - [x] Tenant extraction from cookie
  - [x] Platform tenant fallback
  - [x] Error handling
  - [x] Database context setting

- [ ] **Integration Tests:**
  - [x] Tenant A can access Tenant A resources
  - [x] Tenant B cannot access Tenant A private resources
  - [x] Platform shared resources accessible to all tenants
  - [x] Selective sharing works correctly
  - [x] Resource creation with correct tenant ID
  - [ ] Platform admin bypass (needs platform admin role setup)

---

### Resource Sharing Tests

- [ ] **Global Sharing:**
  - [x] Platform agents visible to all tenants
  - [ ] Platform tools visible to all tenants
  - [ ] Platform prompts visible to all tenants

- [ ] **Selective Sharing:**
  - [x] Agents shared with specific tenants accessible
  - [x] Agents not shared with tenant are inaccessible
  - [ ] Tools shared with specific tenants
  - [ ] Prompts shared with specific tenants

- [ ] **Private Resources:**
  - [x] Private agents only accessible to owner tenant
  - [x] Private resources not accessible to other tenants

---

### RLS Policy Tests

- [ ] **Database Level:**
  - [x] Tenant context set in database session
  - [ ] RLS policies filter queries correctly
  - [ ] Platform admin bypass works (needs admin role setup)

---

## Manual Testing Guide

### 1. Test Tenant Isolation

```bash
# Create tenant A agent
curl -X POST http://localhost:3001/api/agents \
  -H "x-tenant-id: tenant-a-id" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "tenant-a-agent",
    "display_name": "Tenant A Agent",
    "description": "Private agent for tenant A",
    "system_prompt": "You are a test agent"
  }'

# Try to access as tenant B (should fail or return empty)
curl http://localhost:3001/api/agents/tenant-a-agent-id \
  -H "x-tenant-id: tenant-b-id"

# Access as tenant A (should succeed)
curl http://localhost:3001/api/agents/tenant-a-agent-id \
  -H "x-tenant-id: tenant-a-id"
```

### 2. Test Subdomain Detection

```bash
# Configure local DNS or /etc/hosts:
# 127.0.0.1 digital-health-startup.localhost

# Access via subdomain
curl http://digital-health-startup.localhost:3001/api/agents
```

### 3. Test Shared Resources

```bash
# Query platform agents (should be accessible to all tenants)
curl http://localhost:3001/api/agents \
  -H "x-tenant-id: tenant-a-id" \
  | jq '.[] | select(.tenant_id == "00000000-0000-0000-0000-000000000001")'

# Verify same platform agents returned for tenant B
curl http://localhost:3001/api/agents \
  -H "x-tenant-id: tenant-b-id" \
  | jq '.[] | select(.tenant_id == "00000000-0000-0000-0000-000000000001")'
```

---

## Expected Test Results

### Unit Tests

```
✓ Tenant Middleware
  ✓ extractTenantId
    ✓ should extract tenant ID from x-tenant-id header
    ✓ should extract tenant from subdomain
    ✓ should extract tenant from cookie
    ✓ should fallback to platform tenant
  ✓ tenantMiddleware
    ✓ should attach tenant ID to request
    ✓ should continue on error with platform tenant

✓ Tenant Context Middleware
  ✓ get_tenant_id
    ✓ should extract tenant ID from header
    ✓ should fallback to platform tenant
  ✓ set_tenant_context_in_db
    ✓ should set tenant context in database
    ✓ should handle errors gracefully
```

### Integration Tests

```
✓ Tenant Isolation
  ✓ Agent Access
    ✓ should return only tenant A agents for tenant A
    ✓ should not return tenant A agents to tenant B
    ✓ should return platform shared agents to all tenants
  ✓ Resource Creation
    ✓ should create agent with correct tenant ID
    ✓ should prevent tenant B from accessing tenant A agent
  ✓ Selective Sharing
    ✓ should allow tenant B to access selectively shared agent
    ✓ should prevent tenant C from accessing selectively shared agent
```

---

## Next Steps

1. **Run test suites** to verify tenant isolation works
2. **Set up test database** with test tenants and resources
3. **Test platform admin bypass** (requires admin role setup)
4. **Performance testing** for RLS policy overhead
5. **Load testing** with multiple tenants

---

## Troubleshooting

### Tests Fail with "Cannot find module"

```bash
# API Gateway
cd services/api-gateway
npm install

# Python AI Engine
cd services/ai-engine
pip install -r requirements.txt
```

### Tests Fail with Database Connection Errors

Ensure test database is running and environment variables are set:
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key
export DATABASE_URL=postgresql://...
```

### Subdomain Tests Fail

Configure local DNS:
```bash
# Add to /etc/hosts
127.0.0.1 digital-health-startup.localhost
127.0.0.1 tenant-a.localhost
127.0.0.1 tenant-b.localhost
```

---

**Prepared by:** VITAL Platform Architecture Team  
**Last Updated:** February 1, 2025  
**Status:** Test suites created, ready for execution

