# Digital Health Startup Tenant - Access Guide

**Date:** October 27, 2025
**Status:** READY FOR ACCESS

---

## 🎯 Tenant Information

- **Tenant Name:** Digital Health Startup
- **Tenant Slug:** `digital-health-startup`
- **Domain (Production):** `digital-health-startup.vital.expert`
- **Type:** Industry Tenant
- **Subscription:** Professional (30-day trial)
- **Status:** Active

---

## 🔐 Three Ways to Access the Tenant

### Option 1: Subdomain Access (Recommended)

**For Local Development:**

1. **Add hosts file entry:**
   ```bash
   sudo nano /etc/hosts
   ```

2. **Add this line:**
   ```
   127.0.0.1  digital-health-startup.localhost
   ```

3. **Save and exit** (Ctrl+O, Enter, Ctrl+X)

4. **Access the tenant:**
   ```
   http://digital-health-startup.localhost:3001
   ```

**How it works:**
- Middleware detects the subdomain `digital-health-startup`
- Queries Supabase for tenant with `slug='digital-health-startup'`
- Sets tenant context for all requests

---

### Option 2: HTTP Header (Best for API Testing)

**Access via header:**
```bash
curl "http://localhost:3001/api/agents" \
  -H "x-tenant-id: <TENANT_UUID_HERE>"
```

**To get the tenant UUID:**
```bash
# Query Supabase directly
# Or check the database via Supabase dashboard
```

**Browser Extension:**
- Use ModHeader (Chrome/Firefox) to set custom headers
- Add header: `x-tenant-id: <TENANT_UUID_HERE>`

---

### Option 3: Cookie (Browser Persistence)

**Set a cookie manually:**
```javascript
// In browser console on localhost:3001
document.cookie = "tenant_id=<TENANT_UUID_HERE>; path=/; max-age=2592000";
location.reload();
```

**How it works:**
- Cookie persists for 30 days
- All subsequent requests use this tenant
- Can clear by deleting cookie in DevTools

---

## 📊 Tenant Features & Limits

### Enabled Features
✅ RAG Enabled
✅ Expert Panels
✅ Workflows
✅ Analytics
✅ Multi-model support
❌ API Access (Professional tier limitation)
❌ White-label

### Resource Quotas
- **Max Users:** 100
- **Max Custom Agents:** 50
- **Max Documents:** 10,000
- **Max RAG Storage:** 25 GB
- **Max Concurrent Chats:** 10
- **Retention:** 90 days

### Shared Resources
✅ Access to all 254+ platform agents
✅ Access to platform tools (FDA, PubMed, ClinicalTrials)
✅ Access to platform prompts
✅ Platform RAG knowledge

---

## 🔍 Verify Tenant Detection

### Check Current Tenant
```bash
curl -s "http://localhost:3001/api/rag-metrics?endpoint=health" -I | grep x-tenant
```

**Expected output:**
```
x-tenant-id: <tenant-uuid>
x-tenant-detection-method: subdomain|header|cookie|fallback
```

### Check with Subdomain
```bash
curl -s "http://digital-health-startup.localhost:3001/api/agents" -I | grep x-tenant
```

**Expected:**
```
x-tenant-detection-method: subdomain
```

### Check Middleware Logs
Look in the dev server logs for:
```
[Tenant Middleware] Detected tenant from subdomain: digital-health-startup → <uuid>
```

---

## 🎨 Industry-Specific Features

The Digital Health Startup tenant is configured with:

### Focus Areas (from metadata)
- DTx Development (Digital Therapeutics)
- FDA Regulatory Compliance
- Clinical Trials

### Available Domain Agents
The tenant has access to specialized agents for:
- **Regulatory:** FDA 510(k), De Novo, PMA pathways
- **Clinical:** Trial design, protocol development
- **Reimbursement:** CPT codes, payer strategies
- **Product Development:** DTx validation, evidence generation

---

## 🚀 Quick Start for Testing

### 1. Set Up Subdomain Access (1 minute)
```bash
echo "127.0.0.1  digital-health-startup.localhost" | sudo tee -a /etc/hosts
```

### 2. Verify Setup
```bash
ping digital-health-startup.localhost
# Should ping 127.0.0.1
```

### 3. Access the Tenant
Open browser:
```
http://digital-health-startup.localhost:3001
```

### 4. Check Tenant Detection in Console
Open browser DevTools (F12) → Console tab

Look for logs:
```
[Tenant Context] Tenant ID: <uuid>
[Tenant Context] Detection Method: subdomain
```

---

## 🐛 Troubleshooting

### Issue: Still shows "Platform Tenant (fallback)"

**Causes:**
1. Hosts file not updated
2. Tenant migration not run
3. Tenant not in database

**Solutions:**
```bash
# 1. Verify hosts file
cat /etc/hosts | grep digital-health-startup

# 2. Check dev server logs
# Look for: [Tenant Middleware] Detected tenant from subdomain

# 3. Check if tenant exists in database
# Via Supabase dashboard: Table Editor → tenants → filter slug='digital-health-startup'
```

### Issue: "No tenant found for subdomain"

**Cause:** Tenant migration hasn't been run

**Solution:** Run the migration:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/migrations/2025"
# Run via Supabase SQL Editor or psql
psql $DATABASE_URL -f 20251026000004_seed_mvp_tenants.sql
```

### Issue: Can't modify /etc/hosts

**Cause:** Need sudo permissions

**Workaround:** Use Option 2 (HTTP Header) or Option 3 (Cookie) instead

---

## 📁 Related Files

**Tenant Migration:**
- [20251026000004_seed_mvp_tenants.sql](database/sql/migrations/2025/20251026000004_seed_mvp_tenants.sql)

**Middleware:**
- [tenant-middleware.ts](apps/digital-health-startup/src/middleware/tenant-middleware.ts)

**Environment:**
- [.env.local](apps/digital-health-startup/.env.local) - Line 35: `NEXT_PUBLIC_DEFAULT_TENANT_ID`

---

## 🎯 Next Steps

1. **Access the tenant** using one of the three methods above
2. **Test agent access** - Verify you can see all 254+ platform agents
3. **Create custom agents** - Test tenant isolation (up to 50 custom agents)
4. **Test RAG uploads** - Upload documents (up to 25GB)
5. **Monitor usage** - Check quotas and limits

---

## 💡 Production Deployment

When deploying to production:

1. **DNS Configuration:**
   ```
   CNAME: digital-health-startup.vital.expert → your-vercel-domain.vercel.app
   ```

2. **Vercel Domain Setup:**
   - Add `digital-health-startup.vital.expert` to your Vercel project
   - Configure wildcard: `*.vital.expert`

3. **Environment Variables:**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
   - Production URLs in `.env.production`

---

**Status:** ✅ Tenant configured and ready for local development
**Access URL:** `http://digital-health-startup.localhost:3001` (after hosts file setup)
**Alternative:** Use header `x-tenant-id` or cookie `tenant_id` with tenant UUID

---

**Questions?** Check the [tenant middleware implementation](apps/digital-health-startup/src/middleware/tenant-middleware.ts:20-108) for details on how tenant detection works.
