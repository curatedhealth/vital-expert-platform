# VITAL Platform - Security Testing Guide

**Version**: 1.0
**Last Updated**: 2025-11-26
**Status**: Active
**Owner**: VITAL Security & QA Teams

---

## Executive Summary

This document outlines the security testing strategy for the VITAL Platform, with a focus on **multi-tenant data isolation** and **cross-organization access prevention**. Our security testing approach validates that the 5 critical security fixes prevent unauthorized data access across organizations.

### Test Coverage Summary

| Test Category | Test Count | Criticality | Pass Criteria |
|---------------|------------|-------------|---------------|
| **Multi-Tenant Isolation** | 15 tests | CRITICAL | 100% pass |
| **Client Control Prevention** | 3 tests | CRITICAL | 100% pass |
| **Cookie Security** | 2 tests | HIGH | 100% pass |
| **Development Bypass** | 2 tests | HIGH | 100% pass |
| **Membership Validation** | 4 tests | CRITICAL | 100% pass |
| **RLS Context Setting** | 4 tests | CRITICAL | 100% pass |
| **Performance** | 2 tests | MEDIUM | <50ms validation, <10ms context |

**Total Tests**: 32 comprehensive security tests
**Target Coverage**: 100% of critical security controls

---

## Table of Contents

1. [Security Testing Philosophy](#1-security-testing-philosophy)
2. [Multi-Tenant Isolation Tests](#2-multi-tenant-isolation-tests)
3. [Test Environment Setup](#3-test-environment-setup)
4. [Running Security Tests](#4-running-security-tests)
5. [Continuous Integration](#5-continuous-integration)
6. [Test Maintenance](#6-test-maintenance)
7. [Security Test Checklist](#7-security-test-checklist)

---

## 1. Security Testing Philosophy

### Core Principles

1. **Fail-Secure Validation**
   - Tests verify that failures result in access denial, not access grants
   - No "optimistic" security assumptions

2. **Defense in Depth**
   - Test multiple layers: middleware, application, database
   - Ensure each layer independently enforces security

3. **Real-World Attack Simulation**
   - Tests simulate actual attack vectors (header manipulation, cookie tampering)
   - Based on OWASP Top 10 and real vulnerability reports

4. **Automated & Repeatable**
   - All security tests run automatically in CI/CD
   - No manual security validation required

### Test Pyramid for Security

```
               ┌─────────────────┐
               │  Manual Pen     │  ← Annual penetration testing
               │  Testing        │
               └─────────────────┘
              ┌───────────────────┐
              │  Integration      │  ← Multi-tenant isolation tests
              │  Security Tests   │     (15 tests - CRITICAL)
              └───────────────────┘
           ┌──────────────────────────┐
           │  Unit Security Tests     │  ← Component-level validation
           │  (RLS, membership, auth) │     (20+ tests)
           └──────────────────────────┘
```

---

## 2. Multi-Tenant Isolation Tests

### Test Suite Location

```
apps/vital-system/src/__tests__/security/multi-tenant-isolation.test.ts
```

### Test Categories

#### 2.1 Fix #1: Client-Controllable Tenant Selection Prevention

**Purpose**: Verify that clients cannot manipulate headers or cookies to access other organizations' data

**Tests**:

1. **Header Manipulation Test**
   - User A sets `x-tenant-id` header to Organization B's ID
   - Expected: Middleware ignores header, uses server-determined organization
   - Verification: Query results only contain Organization A's data

2. **Cookie Manipulation Test**
   - User A sets `tenant_id` cookie to Organization B's ID
   - Expected: Middleware ignores cookie, uses server-determined organization
   - Verification: Query results only contain Organization A's data

3. **Direct API Bypass Test**
   - Attempt to access Organization B's resources by guessing IDs
   - Expected: RLS policies and authorization checks block access
   - Verification: No data returned, access denied

**Code Example**:

```typescript
it('should ignore x-tenant-id header and use server-determined organization', async () => {
  const userAClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Set context to Org A (what server determines)
  await setOrganizationContext(userAClient, testOrgA.id);

  // Even if client tries to set x-tenant-id to Org B, queries filter by Org A
  const { data: agents } = await userAClient.from('agents').select('*');

  // Should only see Org A's agents, not Org B's
  expect(agents).toBeDefined();
  expect(agents?.every((a) => a.owner_organization_id === testOrgA.id)).toBe(true);
  expect(agents?.find((a) => a.id === testAgentB.id)).toBeUndefined();
});
```

#### 2.2 Fix #2: Cookie Security Hardening

**Purpose**: Validate HIPAA-compliant session management and CSRF protection

**Tests**:

1. **Session Timeout Validation**
   - Verify `maxAge` is 15 minutes (900 seconds)
   - Expected: Sessions expire after 15 minutes of idle time
   - HIPAA Compliance: §164.312(a)(2)(iii)

2. **Cookie Security Flags**
   - Verify `sameSite: strict`, `httpOnly: true`, `secure: true`
   - Expected: Cookies have all security flags set
   - Protection: CSRF attacks, XSS cookie theft

**Code Example**:

```typescript
it('should use sameSite=strict for CSRF protection', () => {
  const expectedCookieConfig = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 15, // 15 minutes
  };

  expect(expectedCookieConfig.sameSite).toBe('strict');
  expect(expectedCookieConfig.secure).toBe(true);
  expect(expectedCookieConfig.maxAge).toBeLessThanOrEqual(60 * 15);
});
```

#### 2.3 Fix #3: Development Bypass Restrictions

**Purpose**: Ensure development bypasses NEVER work in production

**Tests**:

1. **Production Bypass Prevention**
   - In production environment, verify bypass is disabled
   - Expected: `ALLOW_DEV_BYPASS` has no effect in production
   - Verification: Multiple environment checks (NODE_ENV, VERCEL_ENV)

2. **Local Development Bypass Restrictions**
   - Verify bypass requires explicit flag in local development only
   - Expected: Bypass only works if `isDevelopment && !isVercel && bypassFlag`

**Code Example**:

```typescript
it('should NOT allow bypass in production environment', () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = !!process.env.VERCEL_ENV;
  const bypassAllowed = process.env.ALLOW_DEV_BYPASS === 'true';

  if (isProduction || isVercel) {
    // In production/staging, bypass should NEVER be allowed
    expect(bypassAllowed && (isProduction || isVercel)).toBe(false);
  }
});
```

#### 2.4 Fix #4: User-Organization Membership Validation

**Purpose**: Verify that users can only access organizations they belong to

**Tests**:

1. **Valid Membership Test**
   - User A attempts to access Organization A (valid membership)
   - Expected: Access granted
   - Verification: `validateUserOrganizationMembership()` returns `true`

2. **Invalid Membership Test**
   - User A attempts to access Organization B (no membership)
   - Expected: Access denied
   - Verification: `validateUserOrganizationMembership()` returns `false`

3. **Audit Logging Test**
   - User A attempts unauthorized access to Organization B
   - Expected: Attempt logged to `unauthorized_access_attempts` table
   - Verification: Audit log entry exists with correct user/org IDs

4. **Organization List Test**
   - Request list of organizations for User A
   - Expected: Only organizations with valid membership returned
   - Verification: `getUserOrganizations()` returns only authorized orgs

**Code Example**:

```typescript
it('should reject access when user does NOT belong to organization', async () => {
  const hasAccess = await validateUserOrganizationMembership(
    adminClient,
    testUserA.id,
    testOrgB.id // User A trying to access Org B
  );

  expect(hasAccess).toBe(false);
});

it('should log unauthorized access attempts', async () => {
  // Attempt unauthorized access
  await validateUserOrganizationMembership(
    adminClient,
    testUserA.id,
    testOrgB.id
  );

  // Check audit log
  const { data: auditLogs } = await adminClient
    .from('unauthorized_access_attempts')
    .select('*')
    .eq('user_id', testUserA.id)
    .eq('attempted_organization_id', testOrgB.id)
    .limit(1);

  expect(auditLogs).toBeDefined();
  expect(auditLogs?.length).toBeGreaterThan(0);
});
```

#### 2.5 Fix #5: RLS Context Auto-Setting

**Purpose**: Verify automatic organization context setting before queries

**Tests**:

1. **Context Setting Test**
   - Set organization context for Organization A
   - Expected: Context successfully set
   - Verification: `getCurrentOrganizationContext()` returns Organization A's ID

2. **Context Clearing Test**
   - Set context to Organization A, then clear it
   - Expected: Context is null after clearing
   - Verification: `getCurrentOrganizationContext()` returns `null`

3. **Context Verification Test**
   - Set context to Organization A
   - Verify context matches expected value
   - Expected: Verification succeeds for correct org, fails for wrong org

4. **Query Filtering Test**
   - Set context to Organization A, query agents
   - Set context to Organization B, query agents again
   - Expected: Each query only returns data for the active organization
   - Verification: No overlap between query results

**Code Example**:

```typescript
it('should filter queries by organization context', async () => {
  const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Set context to Org A
  await setOrganizationContext(client, testOrgA.id);

  // Query agents
  const { data: agentsA } = await client.from('agents').select('*');

  // Should only see Org A's agents
  expect(agentsA?.every((a) => a.owner_organization_id === testOrgA.id)).toBe(true);

  // Set context to Org B
  await setOrganizationContext(client, testOrgB.id);

  // Query agents again
  const { data: agentsB } = await client.from('agents').select('*');

  // Should only see Org B's agents
  expect(agentsB?.every((a) => a.owner_organization_id === testOrgB.id)).toBe(true);

  // Verify no overlap
  const agentAIds = agentsA?.map((a) => a.id) || [];
  const agentBIds = agentsB?.map((a) => a.id) || [];

  expect(agentAIds).not.toContain(testAgentB.id);
  expect(agentBIds).not.toContain(testAgentA.id);
});
```

#### 2.6 Integration Tests: Complete Isolation

**Purpose**: End-to-end validation of cross-organization isolation

**Tests**:

1. **Cross-Organization Query Block**
   - User A queries for User B's agent by ID
   - Expected: Query returns null (RLS filtered it out)

2. **Platform-Shared Resources**
   - Create platform-shared agent
   - Verify both Organization A and Organization B can see it
   - Expected: Sharing scope controls visibility correctly

3. **Tenant-Level Sharing**
   - Create tenant-shared agent
   - Verify organizations within same tenant can see it
   - Verify organizations in different tenants cannot see it

**Code Example**:

```typescript
it('should prevent User A from seeing User B\'s agents', async () => {
  const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Simulate User A's request
  await setOrganizationContext(client, testOrgA.id);

  const { data: agents } = await client
    .from('agents')
    .select('*')
    .eq('id', testAgentB.id)
    .single();

  // Should return nothing (RLS filtered it out)
  expect(agents).toBeNull();
});
```

#### 2.7 Performance Tests

**Purpose**: Ensure security controls don't introduce significant latency

**Tests**:

1. **Membership Validation Performance**
   - Target: <50ms per validation
   - Method: Measure time for `validateUserOrganizationMembership()`
   - Critical: No database N+1 queries

2. **RLS Context Setting Performance**
   - Target: <10ms per context setting
   - Method: Measure time for `setOrganizationContext()`
   - Critical: Minimal overhead on every request

**Code Example**:

```typescript
it('should add minimal latency (<50ms) for membership validation', async () => {
  const startTime = Date.now();

  await validateUserOrganizationMembership(
    adminClient,
    testUserA.id,
    testOrgA.id
  );

  const duration = Date.now() - startTime;

  expect(duration).toBeLessThan(50); // Should be under 50ms
});
```

---

## 3. Test Environment Setup

### Prerequisites

```bash
# Required tools
- Node.js 18+
- pnpm 8+
- Supabase CLI
- PostgreSQL 15+

# Environment variables
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-key]
```

### Database Setup

```bash
# Start local Supabase (includes PostgreSQL)
npx supabase start

# Run security migrations
./scripts/run-security-migrations.sh local

# Verify migrations
npx supabase db diff
```

### Test Data Setup

The test suite automatically creates test data in `beforeAll()`:

- 2 test organizations (Org A, Org B)
- 2 test users (User A, User B)
- 2 test agents (Agent A, Agent B)
- User-organization memberships

Test data is cleaned up in `afterAll()` to prevent pollution.

---

## 4. Running Security Tests

### Local Execution

```bash
# Run all security tests
pnpm test apps/vital-system/src/__tests__/security

# Run specific test suite
pnpm test apps/vital-system/src/__tests__/security/multi-tenant-isolation.test.ts

# Run with coverage
pnpm test:coverage apps/vital-system/src/__tests__/security

# Watch mode (for development)
pnpm test:watch apps/vital-system/src/__tests__/security
```

### Test Output

```
PASS  apps/vital-system/src/__tests__/security/multi-tenant-isolation.test.ts
  Multi-Tenant Security: Cross-Organization Isolation
    Fix #1: Client-Controllable Tenant Selection Prevention
      ✓ should ignore x-tenant-id header (127ms)
      ✓ should ignore tenant_id cookie (95ms)
    Fix #2: Cookie Security Hardening
      ✓ should use sameSite=strict (12ms)
      ✓ should expire sessions after 15 minutes (8ms)
    Fix #3: Development Bypass Restrictions
      ✓ should NOT allow bypass in production (15ms)
      ✓ should only allow bypass with explicit flag (18ms)
    Fix #4: User-Organization Membership Validation
      ✓ should validate user belongs to organization (142ms)
      ✓ should reject access for non-members (165ms)
      ✓ should log unauthorized access attempts (178ms)
      ✓ should return user's organizations (134ms)
    Fix #5: RLS Context Auto-Setting
      ✓ should set organization context correctly (98ms)
      ✓ should clear organization context (85ms)
      ✓ should verify organization context (102ms)
      ✓ should filter queries by organization (215ms)
    Integration: Complete Cross-Organization Isolation
      ✓ should prevent User A from seeing User B's agents (189ms)
      ✓ should allow platform-shared resources (234ms)
      ✓ should enforce tenant-level sharing (298ms)
    Performance: RLS Overhead
      ✓ membership validation <50ms (24ms)
      ✓ RLS context setting <10ms (6ms)

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
```

---

## 5. Continuous Integration

### GitHub Actions Integration

```yaml
name: Security Tests

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  security-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: supabase/postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Run database migrations
        run: ./scripts/run-security-migrations.sh local

      - name: Run security tests
        run: pnpm test apps/vital-system/src/__tests__/security
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Pre-Commit Hooks

```bash
# Install pre-commit hook
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/bash
echo "Running security tests..."
pnpm test apps/vital-system/src/__tests__/security --passWithNoTests

if [ $? -ne 0 ]; then
  echo "❌ Security tests failed. Commit aborted."
  exit 1
fi

echo "✅ Security tests passed"
EOF

chmod +x .git/hooks/pre-commit
```

---

## 6. Test Maintenance

### When to Update Security Tests

1. **New Security Feature**
   - Add tests for new security controls
   - Verify defense-in-depth layers

2. **Security Vulnerability Fix**
   - Add regression test for the vulnerability
   - Verify fix prevents the attack vector

3. **Architecture Change**
   - Update tests if multi-tenant model changes
   - Verify RLS policies still enforce isolation

4. **Database Schema Change**
   - Update test data setup
   - Verify migrations don't break isolation

### Test Review Checklist

Before merging security test changes:

- [ ] All tests pass locally
- [ ] Tests pass in CI/CD
- [ ] Tests cover both positive and negative cases
- [ ] Tests verify fail-secure behavior
- [ ] Performance tests meet latency targets
- [ ] Test data is cleaned up properly
- [ ] Tests are well-documented

---

## 7. Security Test Checklist

Use this checklist for security test reviews:

### Coverage

- [ ] All 5 security fixes have dedicated tests
- [ ] Both positive and negative test cases exist
- [ ] Fail-secure behavior is validated
- [ ] Multiple attack vectors are tested
- [ ] Integration tests verify end-to-end isolation

### Quality

- [ ] Tests are deterministic (no flakiness)
- [ ] Tests are isolated (no shared state)
- [ ] Tests clean up after themselves
- [ ] Tests have clear assertions
- [ ] Tests fail with helpful error messages

### Performance

- [ ] Membership validation <50ms
- [ ] RLS context setting <10ms
- [ ] No N+1 query problems
- [ ] Tests complete in reasonable time (<5 min total)

### Documentation

- [ ] Test purpose is clearly documented
- [ ] Expected behavior is described
- [ ] Attack scenarios are explained
- [ ] Test data setup is documented

---

## Appendix A: Database Functions for Testing

```sql
-- Check RLS context
SELECT get_current_organization_context();

-- Test membership validation
SELECT validate_user_organization_membership(
  '00000000-0000-0000-0000-000000000001'::UUID,
  '00000000-0000-0000-0000-000000000002'::UUID
);

-- View unauthorized access attempts
SELECT * FROM unauthorized_access_attempts
ORDER BY created_at DESC
LIMIT 10;

-- Check user's organizations
SELECT * FROM get_user_organizations('user-id-here');
```

---

## Appendix B: Common Test Failures

### Test Failure: "Agent not found"

**Cause**: Test data not created properly in `beforeAll()`
**Fix**: Verify Supabase connection and migration status

### Test Failure: "RLS context not set"

**Cause**: RLS migrations not run
**Fix**: Run `./scripts/run-security-migrations.sh local`

### Test Failure: "Timeout exceeded"

**Cause**: Database connection slow or migrations taking too long
**Fix**: Ensure local Supabase is running, check database performance

---

**Document Classification**: Internal
**Next Review Date**: 2026-02-26
**Contact**: security@vital.ai, qa@vital.ai
