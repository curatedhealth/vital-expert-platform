# Multi-Tenant Testing Guide

**Status:** Ready to test subdomain routing
**Date:** October 26, 2025
**Progress:** 90% → 100% (final steps)

---

## 📋 **Step-by-Step Testing Instructions**

### Step 1: Create Test Tenants in Remote Supabase ✅

**File Created:** [scripts/create-test-tenants.sql](scripts/create-test-tenants.sql)

**Action Required:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **SQL Editor**
3. Click: **New Query**
4. Copy/paste the entire contents of `scripts/create-test-tenants.sql`
5. Click: **Run** (or press Cmd+Enter)

**Expected Result:**
```
Tenant 1: Digital Health Startups
- ID: digital-health-startups-123
- Slug: digital-health-startups
- Type: client

Tenant 2: Pharma Companies
- ID: pharma-companies-456
- Slug: pharma
- Type: client
```

**Verify:**
```sql
SELECT id, name, slug, type, is_active
FROM tenants
WHERE slug IN ('digital-health-startups', 'pharma');
```

---

### Step 2: Setup Local Subdomain Routing

**Edit your `/etc/hosts` file:**

```bash
sudo nano /etc/hosts
```

**Add these lines:**
```
127.0.0.1 digital-health-startups.localhost
127.0.0.1 pharma.localhost
127.0.0.1 app.localhost
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

**Verify:**
```bash
ping -c 1 digital-health-startups.localhost
ping -c 1 pharma.localhost
```

---

### Step 3: Test Tenant Detection

**Your dev server is already running on http://localhost:3000**

#### Test 1: Platform Tenant (Default)
```bash
curl -v http://localhost:3000 2>&1 | grep "x-tenant-id"
```
**Expected:** `x-tenant-id: 00000000-0000-0000-0000-000000000001`

#### Test 2: Digital Health Startups Tenant (Subdomain)
```bash
curl -v http://digital-health-startups.localhost:3000 2>&1 | grep "x-tenant-id"
```
**Expected:** `x-tenant-id: digital-health-startups-123`

#### Test 3: Pharma Tenant (Subdomain)
```bash
curl -v http://pharma.localhost:3000 2>&1 | grep "x-tenant-id"
```
**Expected:** `x-tenant-id: pharma-companies-456`

#### Test 4: Header Override
```bash
curl -H "x-tenant-id: custom-tenant-test" http://localhost:3000 -v 2>&1 | grep "x-tenant-id"
```
**Expected:** `x-tenant-id: custom-tenant-test`

#### Test 5: Detection Method Header
```bash
curl -v http://digital-health-startups.localhost:3000 2>&1 | grep "x-tenant-detection-method"
```
**Expected:** `x-tenant-detection-method: subdomain`

---

### Step 4: Test in Browser

#### Test A: Platform Tenant
1. Open: http://localhost:3000
2. Open DevTools (F12) → Network tab
3. Refresh page
4. Click on any request → Headers tab
5. Look for Response Headers:
   - `x-tenant-id: 00000000-0000-0000-0000-000000000001`
   - `x-tenant-detection-method: fallback`

#### Test B: Digital Health Startups Tenant
1. Open: http://digital-health-startups.localhost:3000
2. Open DevTools → Network tab
3. Check Response Headers:
   - `x-tenant-id: digital-health-startups-123`
   - `x-tenant-detection-method: subdomain`
4. Check Console tab for logs:
   - Look for: `[Tenant Middleware] Detected tenant from subdomain: digital-health-startups → digital-health-startups-123`

#### Test C: Pharma Tenant
1. Open: http://pharma.localhost:3000
2. Verify:
   - `x-tenant-id: pharma-companies-456`
   - `x-tenant-detection-method: subdomain`

---

### Step 5: Check Server Logs

In the terminal where `npm run dev` is running, you should see logs like:

```
[Tenant Middleware] Using Platform Tenant (fallback)
[Tenant Middleware] Detected tenant from subdomain: digital-health-startups → digital-health-startups-123
[Tenant Middleware] Detected tenant from subdomain: pharma → pharma-companies-456
```

---

## 🧪 **End-to-End Testing (Optional but Recommended)**

### E2E Test 1: Verify Cookie Persistence

1. Visit: http://digital-health-startups.localhost:3000
2. Open DevTools → Application tab → Cookies
3. Look for cookie: `tenant_id`
4. Value should be: `digital-health-startups-123`
5. Close browser tab
6. Open new tab: http://localhost:3000
7. Check cookie - should still have `digital-health-startups-123`
8. Middleware should detect from cookie (priority 3)

### E2E Test 2: Verify Tenant Isolation (Database)

**If you have a test user in Supabase Auth:**

```sql
-- Assign user to Digital Health Startups tenant
INSERT INTO user_tenants (user_id, tenant_id, role)
VALUES (
  'YOUR_USER_ID_HERE',  -- Get from Supabase Auth → Users
  'digital-health-startups-123',
  'member'
)
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Assign same user to Pharma tenant
INSERT INTO user_tenants (user_id, tenant_id, role)
VALUES (
  'YOUR_USER_ID_HERE',
  'pharma-companies-456',
  'member'
)
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Verify user-tenant relationships
SELECT ut.user_id, t.name, ut.role
FROM user_tenants ut
JOIN tenants t ON ut.tenant_id = t.id
WHERE ut.user_id = 'YOUR_USER_ID_HERE';
```

### E2E Test 3: Test Tenant Switching in UI

1. Login to the app
2. Look for TenantSwitcher component in navigation
3. Should see dropdown with:
   - Platform Tenant
   - Digital Health Startups
   - Pharma Companies
4. Switch between tenants
5. Verify `x-tenant-id` header changes in Network tab

---

## ✅ **Success Criteria Checklist**

### Middleware Detection
- [ ] Platform Tenant works (localhost:3000)
- [ ] Digital Health Startups tenant detected (digital-health-startups.localhost:3000)
- [ ] Pharma tenant detected (pharma.localhost:3000)
- [ ] Header override works
- [ ] Detection method header present
- [ ] Server logs show correct detection

### Browser Testing
- [ ] All subdomains load without errors
- [ ] Headers present in Network tab
- [ ] Console logs show tenant detection
- [ ] No 500 errors
- [ ] styled-jsx error only on /_error page (non-critical)

### Cookie Persistence
- [ ] tenant_id cookie set
- [ ] Cookie persists across page reloads
- [ ] Cookie detected by middleware

### Database Integration
- [ ] Test tenants exist in remote Supabase
- [ ] Can query tenants by slug
- [ ] User-tenant relationships work (if tested)

---

## 🐛 **Troubleshooting**

### Issue 1: Subdomain not detected
**Symptom:** All requests return Platform Tenant ID

**Check:**
```bash
# 1. Verify /etc/hosts entry
cat /etc/hosts | grep localhost

# 2. Verify tenants exist in database
# Run in Supabase SQL Editor:
SELECT * FROM tenants WHERE slug IN ('digital-health-startups', 'pharma');

# 3. Check server logs for errors
# Look in terminal running npm run dev
```

**Fix:**
- If /etc/hosts missing entries → Add them (Step 2 above)
- If tenants not in DB → Run SQL script (Step 1 above)
- If server not logging → Check middleware.ts is updated

### Issue 2: Server logs not showing
**Symptom:** No `[Tenant Middleware]` logs in console

**Check:**
```bash
# Verify middleware file is updated
cat apps/digital-health-startup/src/middleware/tenant-middleware.ts | grep "console.log"
```

**Fix:**
- If no console.log statements → Middleware not updated
- Clear Next.js cache: `rm -rf .next && npm run dev`

### Issue 3: 500 Error on subdomain
**Symptom:** Server returns 500 when accessing subdomain

**Check:**
```bash
# Check server error logs
# Terminal running npm run dev will show stack trace
```

**Common Causes:**
- Supabase environment variables missing
- Database connection issue
- Middleware trying to query non-existent table

**Fix:**
- Verify .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Test Supabase connection: `curl https://YOUR_SUPABASE_URL/rest/v1/tenants?select=*`

### Issue 4: Cookie not persisting
**Symptom:** Cookie disappears on page reload

**Check:**
- Browser cookies settings (must allow localhost cookies)
- Cookie expiration (should be 30 days)

**Fix:**
- Check browser settings → Privacy → Allow all cookies (for testing)
- Check middleware sets cookie with correct options

---

## 📊 **Testing Results Template**

Copy this to track your testing:

```
## Multi-Tenant Testing Results

**Date:** _______________
**Tester:** _______________

### Test Tenants Created
- [ ] Digital Health Startups (slug: digital-health-startups)
- [ ] Pharma Companies (slug: pharma)

### Subdomain Detection
- [ ] localhost:3000 → Platform Tenant
- [ ] digital-health-startups.localhost:3000 → Digital Health Startups
- [ ] pharma.localhost:3000 → Pharma
- [ ] Header override works
- [ ] Detection method header present

### Browser Testing
- [ ] All subdomains load in browser
- [ ] Headers visible in DevTools
- [ ] Server logs show detection
- [ ] No critical errors

### Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Overall Status
- [ ] ✅ All tests pass - Ready to deploy
- [ ] ⚠️ Minor issues - Can deploy with notes
- [ ] ❌ Critical issues - Need fixes before deploy
```

---

## 🚀 **Next Steps After Testing**

### If All Tests Pass ✅

**You're ready for deployment!**

1. **Prepare for Production Build:**
   ```bash
   cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
   npm run build
   ```

2. **Deploy to Vercel:**
   - Follow: [MULTI_TENANT_COMPLETION_PLAN.md](MULTI_TENANT_COMPLETION_PLAN.md) Section 6
   - Configure wildcard domains: `*.vital.expert`
   - Set environment variables in Vercel dashboard

3. **Test in Production:**
   - https://app.vital.expert → Platform Tenant
   - https://digital-health-startups.vital.expert → Digital Health Startups
   - https://pharma.vital.expert → Pharma

### If Tests Fail ⚠️

**Report back what's not working, and I'll help fix it!**

Provide:
- Which test failed (test number and description)
- Error messages from browser console
- Error messages from server logs
- Screenshots if helpful

---

## 📚 **Reference Documents**

- [MULTI_TENANT_COMPLETION_PLAN.md](MULTI_TENANT_COMPLETION_PLAN.md) - Complete implementation guide
- [MULTI_TENANT_PROGRESS.md](MULTI_TENANT_PROGRESS.md) - Progress tracking
- [tenant-middleware.ts](apps/digital-health-startup/src/middleware/tenant-middleware.ts) - Implementation code
- [create-test-tenants.sql](scripts/create-test-tenants.sql) - SQL to create tenants

---

**Good luck with testing! 🎉**

Once you've run through these tests, let me know the results and we'll proceed with deployment!
