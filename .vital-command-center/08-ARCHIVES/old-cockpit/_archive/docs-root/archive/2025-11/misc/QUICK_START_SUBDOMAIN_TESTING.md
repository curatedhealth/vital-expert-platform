# 🚀 Quick Start: Multi-Tenant Subdomain Testing

**Ready in 3 simple steps!**

---

## Step 1️⃣: Add Subdomain Entries to /etc/hosts

Run this script (will ask for sudo password):

```bash
./ADD_HOSTS_ENTRIES.sh
```

**Or manually:**
```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 digital-health-startups.localhost
127.0.0.1 pharma.localhost
```

---

## Step 2️⃣: Start Dev Server (if not already running)

```bash
cd apps/digital-health-startup
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

---

## Step 3️⃣: Run Testing Script

```bash
./scripts/setup-subdomain-testing.sh
```

This will:
- ✅ Verify /etc/hosts entries
- ✅ Check dev server is running
- ✅ Test DNS resolution
- ✅ Test tenant detection
- ✅ Verify correct tenant IDs

---

## 🌐 Test in Browser

Open these URLs:

### 1. Platform Tenant (Marketing Website)
```
http://localhost:3000
```
**Expected:** VITAL Platform (ID: 00000000-0000-0000-0000-000000000001)

### 2. Digital Health Startups (Tenant 1)
```
http://digital-health-startups.localhost:3000
```
**Expected:** Digital Health Startups (ID: a2b50378-a21a-467b-ba4c-79ba93f64b2f)

### 3. Pharma Companies (Tenant 2)
```
http://pharma.localhost:3000
```
**Expected:** Pharma Companies (ID: 18c6b106-6f99-4b29-9608-b9a623af37c2)

---

## 🔍 Verify in DevTools

1. Open DevTools (F12 or Cmd+Option+I)
2. Go to **Network** tab
3. Reload the page
4. Click on the first request (document)
5. Check **Response Headers** for:
   - `x-tenant-id` - Should show the correct tenant UUID
   - `x-tenant-detection-method` - Should show `subdomain`

6. Go to **Application** tab → **Cookies**
7. Check for `tenant_id` cookie (should be set with 30-day expiration)

---

## ✅ Expected Results

| URL | Tenant | ID | Method |
|-----|--------|-----|--------|
| localhost:3000 | VITAL Platform | 00000000-0000-0000-0000-000000000001 | fallback |
| digital-health-startups.localhost:3000 | Digital Health Startups | a2b50378-a21a-467b-ba4c-79ba93f64b2f | subdomain |
| pharma.localhost:3000 | Pharma Companies | 18c6b106-6f99-4b29-9608-b9a623af37c2 | subdomain |

---

## 🐛 Troubleshooting

### Issue: Subdomain doesn't resolve
**Solution:** Check /etc/hosts entries exist
```bash
grep "localhost" /etc/hosts | grep -E "digital-health-startups|pharma"
```

### Issue: No x-tenant-id header
**Possible causes:**
1. Middleware not running - Check console for `[Tenant Middleware]` logs
2. Dev server needs restart - Kill and restart `npm run dev`
3. Caching issue - Clear browser cache or use Incognito mode

### Issue: Wrong tenant ID detected
**Check:**
1. Supabase connection - Verify NEXT_PUBLIC_SUPABASE_URL in .env.local
2. Tenant data - Run: `node scripts/create-remote-test-tenants.js`
3. Middleware logs - Check terminal for tenant detection messages

---

## 📝 Manual Testing Commands

```bash
# Test Platform Tenant
curl -I http://localhost:3000 2>&1 | grep -i "x-tenant"

# Test Digital Health Startups
curl -I http://digital-health-startups.localhost:3000 2>&1 | grep -i "x-tenant"

# Test Pharma
curl -I http://pharma.localhost:3000 2>&1 | grep -i "x-tenant"

# View all tenants in database
curl -s "https://xazinxsiglqokwfmogyk.supabase.co/rest/v1/tenants?status=eq.active&select=name,slug,id" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY"
```

---

## 🎉 Success Criteria

You should see:
- ✅ All 3 URLs load successfully
- ✅ Each URL shows correct `x-tenant-id` header
- ✅ Detection method is `subdomain` for tenant URLs
- ✅ `tenant_id` cookie is set in browser
- ✅ Middleware logs show tenant detection in console

---

**Ready to test? Run:** `./ADD_HOSTS_ENTRIES.sh`
