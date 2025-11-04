# 🚀 Day 2: Deploy & Verify RLS

**Status**: Ready to Execute  
**Time Estimate**: 8 hours  
**Prerequisites**: ✅ All Day 1 work complete and production-ready

---

## 📋 Day 2 Tasks Overview

### Task 2.1: Deploy RLS to Development (3 hours)
- Deploy migration to dev environment
- Verify deployment successful
- Run all 5 verification checks
- Test cross-tenant isolation

### Task 2.2: Run Security Tests (3 hours)
- Execute security test suite
- Fix any failing tests
- Achieve 100% security test pass rate
- Document test results

### Task 2.3: Deploy to Preview & Production (2 hours)
- Deploy to preview environment
- Verify preview deployment
- Deploy to production (with confirmation)
- Final verification across all environments

---

## 🎯 Task 2.1: Deploy RLS to Development

### Prerequisites Check

Before deploying, we need:
- [ ] Development database URL available
- [ ] `psql` command-line tool installed
- [ ] Database credentials configured
- [ ] Migration file ready (`001_enable_rls_comprehensive.sql`)

### Deployment Steps

#### Step 1: Check Database Connection

```bash
# Navigate to project root
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Test connection (requires DATABASE_URL or DATABASE_URL_DEV)
psql "$DATABASE_URL_DEV" -c "SELECT version();"
```

**Expected**: PostgreSQL version output  
**If fails**: Database connection issue - need to set DATABASE_URL_DEV

#### Step 2: Deploy RLS Migration

```bash
# Deploy to dev
./scripts/deploy-rls.sh dev
```

**Expected Output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 Deploying RLS Policies to VITAL AI Engine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Environment: dev
🗄️  Database: postgres://***@***

📦 Applying RLS migration...

✅ RLS enabled on public.agents
✅ RLS enabled on public.conversations
✅ RLS enabled on public.messages
✅ RLS enabled on public.user_agents
... (more tables)

✅ Policy created for agents
✅ Policy created for conversations
✅ Policy created for messages
✅ Policy created for user_agents
... (more policies)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RLS Migration Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tables with RLS enabled: 4+
Policies created: 4+
Helper functions: 4 (set/get/clear/count)
Indexes created: 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ RLS deployment complete for dev

Next steps:
1. Run verification: ./scripts/verify-rls.sh dev
2. Check health endpoint: curl http://localhost:8000/health
3. Run security tests: pytest tests/security/
```

**If fails**: Review error output, check database permissions

#### Step 3: Verify RLS Deployment

```bash
# Verify RLS working
./scripts/verify-rls.sh dev
```

**Expected Output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 RLS Verification for VITAL AI Engine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Environment: dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ Checking RLS is enabled on tables...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 schemaname | tablename     | rls_status
------------+---------------+-------------
 public     | agents        | ✅ ENABLED
 public     | conversations | ✅ ENABLED
 public     | messages      | ✅ ENABLED
 public     | user_agents   | ✅ ENABLED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣ Counting RLS policies...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Found 4 policies (expected 4+)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣ Listing RLS policies...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 tablename     | policyname                    | type           | cmd
---------------+-------------------------------+----------------+-----
 agents        | tenant_isolation_agents       | ✅ PERMISSIVE  | ALL
 conversations | tenant_isolation_conversations| ✅ PERMISSIVE  | ALL
 messages      | tenant_isolation_messages     | ✅ PERMISSIVE  | ALL
 user_agents   | tenant_isolation_user_agents  | ✅ PERMISSIVE  | ALL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4️⃣ Checking helper functions...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ set_tenant_context() exists
✅ get_tenant_context() exists
✅ clear_tenant_context() exists
✅ count_rls_policies() exists

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5️⃣ Testing RLS enforcement (CRITICAL SECURITY TEST)...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   This test ensures Tenant A cannot see Tenant B's data.

   ✅ RLS TEST PASSED - Tenant isolation working correctly!
   📊 Tenant A saw: 1 agent (expected 1)
   📊 Tenant B saw: 0 agents (expected 0)
   🔒 Cross-tenant data access is BLOCKED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RLS VERIFICATION PASSED FOR dev
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  ✅ RLS enabled on 4+ tables
  ✅ 4 policies active
  ✅ 4 helper functions available
  ✅ Cross-tenant access blocked

Security Status: COMPLIANT ✅
```

**If fails**: 
- Check which verification step failed
- Review database logs
- Ensure tenant_id columns exist on tables
- Verify helper functions created

---

## 🎯 Task 2.2: Run Security Tests

### Step 1: Set Up Test Environment

```bash
cd services/ai-engine

# Set test environment variables
export ENV=test
export SUPABASE_URL="your-dev-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-dev-service-role-key"
export ENABLE_LANGFUSE=false
```

### Step 2: Run Security Tests

```bash
# Run all security tests
pytest tests/security/ -v -m security

# Or run with more detail
pytest tests/security/test_tenant_isolation.py -v -s
```

**Expected Output**:
```
================================ test session starts =================================
platform darwin -- Python 3.13.5, pytest-8.0.0, pluggy-1.4.0
plugins: asyncio-0.23.0, cov-4.1.0

tests/security/test_tenant_isolation.py::test_rls_blocks_cross_tenant_access_agents PASSED [12%]
✅ RLS Test Passed: Cross-tenant access blocked for agents

tests/security/test_tenant_isolation.py::test_rls_blocks_cross_tenant_access_conversations PASSED [25%]
✅ RLS Test Passed: Cross-tenant access blocked for conversations

tests/security/test_tenant_isolation.py::test_rls_allows_same_tenant_access PASSED [37%]
✅ RLS Test Passed: Same-tenant access allowed

tests/security/test_tenant_isolation.py::test_cache_keys_tenant_scoped PASSED [50%]
✅ Cache Test Passed: Tenant-scoped cache keys working

tests/security/test_tenant_isolation.py::test_sql_injection_prevention PASSED [62%]
✅ SQL Injection Test Passed: All malicious inputs handled safely

tests/security/test_tenant_isolation.py::test_tenant_context_required_for_queries PASSED [75%]
✅ Tenant Context Test Passed: Queries require tenant context

tests/security/test_tenant_isolation.py::test_invalid_tenant_id_rejected PASSED [87%]
✅ Validation Test Passed: Invalid tenant IDs rejected

tests/security/test_tenant_isolation.py::test_password_hashing PASSED [100%]
✅ Password Test Passed: Passwords properly hashed

================================= 8 passed in 12.34s =================================
```

**If tests fail**:
- Read failure message carefully
- Check if RLS is actually enabled (run verification script)
- Verify test database credentials
- Ensure test tenant IDs are being set correctly

### Step 3: Generate Test Report

```bash
# Run with coverage
pytest tests/security/ -v -m security --cov=src --cov-report=html

# View coverage report
open htmlcov/index.html
```

---

## 🎯 Task 2.3: Deploy to Preview & Production

### Deploy to Preview

```bash
# Set preview database URL
export DATABASE_URL_PREVIEW="your-preview-db-url"

# Deploy
./scripts/deploy-rls.sh preview

# Verify
./scripts/verify-rls.sh preview
```

### Deploy to Production

```bash
# Set production database URL
export DATABASE_URL_PROD="your-production-db-url"

# Deploy (will ask for confirmation)
./scripts/deploy-rls.sh production
```

**Expected**:
```
⚠️  WARNING: You are about to deploy RLS policies to PRODUCTION
   This will enforce tenant isolation at the database level.

   Type 'yes' to confirm: yes

📦 Applying RLS migration...
[... deployment output ...]
✅ RLS deployment complete for production
```

### Final Verification

```bash
# Verify production
./scripts/verify-rls.sh production
```

---

## ✅ Day 2 Success Criteria

### Deployment Success
- [ ] RLS deployed to dev ✅
- [ ] RLS deployed to preview ✅
- [ ] RLS deployed to production ✅
- [ ] All verification scripts pass ✅

### Testing Success
- [ ] All 8 security tests pass ✅
- [ ] Cross-tenant isolation verified ✅
- [ ] No false positives ✅
- [ ] Test coverage documented ✅

### Documentation Success
- [ ] Deployment logs saved ✅
- [ ] Test results documented ✅
- [ ] Issues (if any) logged ✅
- [ ] Next steps clear ✅

---

## 🚨 Troubleshooting Guide

### Issue: Database connection fails
**Solution**: 
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL_DEV

# Test connection
psql "$DATABASE_URL_DEV" -c "SELECT 1;"
```

### Issue: RLS policy creation fails
**Solution**:
- Check if tables exist: `\dt` in psql
- Verify tenant_id columns exist
- Check database user has CREATE POLICY permission

### Issue: Verification script fails on cross-tenant test
**Solution**:
- RLS may not be enabled correctly
- Check if policies are active: `SELECT * FROM pg_policies;`
- Verify tenant context is being set

### Issue: Security tests fail
**Solution**:
- Ensure test environment variables are set
- Check if test database has RLS enabled
- Verify Supabase client can connect

---

## 📊 Expected Time

| Task | Estimated | Actual |
|------|-----------|--------|
| Deploy to Dev | 1h | TBD |
| Verify Dev | 1h | TBD |
| Run Security Tests | 2h | TBD |
| Fix Issues | 1h | TBD |
| Deploy to Preview/Prod | 2h | TBD |
| Final Verification | 1h | TBD |
| **Total** | **8h** | **TBD** |

---

**Ready to Execute Day 2**: ✅ YES  
**Prerequisites Met**: ✅ YES  
**Confidence**: 95%

Let's begin...

