# Tenant UUID Reference
**Generated:** October 27, 2025 at 10:20 AM

---

## ✅ Tenants Created Successfully

### Platform Tenant
- **Name:** VITAL Platform
- **Slug:** `vital-platform`
- **UUID:** `00000000-0000-0000-0000-000000000001`
- **Domain:** www.vital.expert
- **Type:** Platform
- **Status:** Active

### Digital Health Startup Tenant
- **Name:** Digital Health Startup
- **Slug:** `digital-health-startup`
- **UUID:** `4672a45d-880b-4a45-a82e-8be8cfe08251`
- **Domain:** digital-health-startup.vital.expert
- **Type:** Industry
- **Status:** Active

---

## 🔑 Access Methods

### Method 1: Cookie (Browser)
```javascript
// In browser console (F12):
document.cookie = "tenant_id=4672a45d-880b-4a45-a82e-8be8cfe08251; path=/; max-age=2592000";
location.reload();
```

### Method 2: HTTP Header (API)
```bash
curl "http://localhost:3000/api/agents" \
  -H "x-tenant-id: 4672a45d-880b-4a45-a82e-8be8cfe08251"
```

### Method 3: Subdomain (Local)
**Requires hosts file entry:**
```bash
# Add to /etc/hosts (requires sudo):
sudo sh -c 'echo "127.0.0.1  digital-health-startup.localhost" >> /etc/hosts'

# Then access:
http://digital-health-startup.localhost:3000
```

### Method 4: Cookie with Slug (Alternative)
```javascript
// The middleware accepts slug as tenant_id:
document.cookie = "tenant_id=digital-health-startup; path=/; max-age=2592000";
location.reload();
```

---

## 📊 Verification

### Test Tenant Detection
```bash
# With UUID:
curl -s "http://localhost:3000/api/rag-metrics?endpoint=health" \
  -H "Cookie: tenant_id=4672a45d-880b-4a45-a82e-8be8cfe08251" \
  -I | grep x-tenant

# With Slug:
curl -s "http://localhost:3000/api/rag-metrics?endpoint=health" \
  -H "Cookie: tenant_id=digital-health-startup" \
  -I | grep x-tenant
```

**Expected Response:**
```
x-tenant-id: 4672a45d-880b-4a45-a82e-8be8cfe08251
x-tenant-detection-method: cookie
```

---

## 🎯 Quick Start

### Fastest Way (Cookie with Slug):
1. Open [http://localhost:3000](http://localhost:3000)
2. Open DevTools Console (F12)
3. Run:
   ```javascript
   document.cookie = "tenant_id=digital-health-startup; path=/";
   location.reload();
   ```
4. Done! You're now on the Digital Health Startup tenant.

### Verify Tenant Context:
Check browser console logs for:
```
[Tenant Middleware] Detected tenant from cookie: digital-health-startup → 4672a45d-880b-4a45-a82e-8be8cfe08251
```

Or check response headers for:
```
x-tenant-id: 4672a45d-880b-4a45-a82e-8be8cfe08251
x-tenant-detection-method: cookie
```

---

## 🏢 Tenant Features

### Digital Health Startup Tenant Configuration:

**Subscription:**
- Tier: Professional
- Trial: 30 days
- Status: Active

**Features:**
- ✅ RAG Enabled
- ✅ Expert Panels
- ✅ Workflows
- ✅ Analytics
- ✅ Multi-model support
- ❌ API Access (Professional tier)
- ❌ White-label

**Resource Quotas:**
- Max Users: 100
- Max Custom Agents: 50
- Max Documents: 10,000
- Max RAG Storage: 25 GB
- Max Concurrent Chats: 10
- Retention: 90 days

**Shared Resources:**
- ✅ Access to all 254+ platform agents
- ✅ Access to platform tools (FDA, PubMed, ClinicalTrials)
- ✅ Access to platform prompts
- ✅ Platform RAG knowledge

**Industry Focus:**
- Healthcare
- DTx Development
- FDA Regulatory
- Clinical Trials

---

## 📝 Environment Variables

Add to `.env.local`:
```bash
# Tenant Configuration
NEXT_PUBLIC_PLATFORM_TENANT_ID=00000000-0000-0000-0000-000000000001
NEXT_PUBLIC_DIGITAL_HEALTH_TENANT_ID=4672a45d-880b-4a45-a82e-8be8cfe08251
NEXT_PUBLIC_DEFAULT_TENANT_SLUG=digital-health-startup
```

---

## 🔍 Database Queries

### Get All Tenants:
```sql
SELECT id, name, slug, domain, type, status
FROM tenants
ORDER BY created_at;
```

### Get Tenant by Slug:
```sql
SELECT * FROM tenants
WHERE slug = 'digital-health-startup';
```

### Get Tenant by UUID:
```sql
SELECT * FROM tenants
WHERE id = '4672a45d-880b-4a45-a82e-8be8cfe08251';
```

---

**Status:** ✅ Tenants Created & Ready to Use
**Next Step:** Use cookie or header method to access Digital Health Startup tenant
