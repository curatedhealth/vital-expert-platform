# VITAL System Tenant Testing Guide

**Date**: 2025-11-19  
**Status**: Ready for Testing  
**Tenant**: VITAL Expert Platform (vital-system)

---

## 🎯 Quick Reference

### Tenant Configuration

| Property | Value |
|----------|-------|
| **Tenant Name** | VITAL Expert Platform |
| **Tenant Key** | `vital-system` |
| **Tenant ID** | `c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244` |
| **Type** | `system` |
| **Subdomain** | `vital-system.localhost:3000` |
| **Default URL** | `http://vital-system.localhost:3000` |

---

## 🚀 Setup Instructions

### Step 1: Configure /etc/hosts

Add the subdomain mapping to your hosts file:

**macOS/Linux:**
```bash
sudo nano /etc/hosts
```

Add this line:
```
127.0.0.1   vital-system.localhost
```

Save and flush DNS cache:
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Windows:**
1. Open Notepad as Administrator
2. Open: `C:\Windows\System32\drivers\etc\hosts`
3. Add: `127.0.0.1   vital-system.localhost`
4. Save and close

### Step 2: Start Development Server

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/vital-system"
pnpm dev
```

The server will start on port 3000.

### Step 3: Access the Application

Open your browser and navigate to:
```
http://vital-system.localhost:3000
```

**Important**: Use the subdomain URL, not `localhost:3000` directly!

---

## 🧪 Testing the Personas Page

### Access URL
```
http://vital-system.localhost:3000/personas
```

### What to Test

1. **Stats Cards**
   - ✅ Total Personas count
   - ✅ Roles count
   - ✅ Departments count
   - ✅ Functions count
   - ✅ Seniority Levels count

2. **Filters**
   - ✅ Search by name, title, tagline
   - ✅ Filter by Role
   - ✅ Filter by Department
   - ✅ Filter by Function
   - ✅ Filter by Seniority Level
   - ✅ Reset filters button

3. **Views**
   - ✅ Grid View - Persona cards with full details
   - ✅ List View - Compact persona list items
   - ✅ By Department - Grouped by department

4. **Persona Cards**
   - ✅ Name and title display
   - ✅ Tagline or one-liner
   - ✅ Badges (role, department, function, seniority)
   - ✅ Key information (years of experience, team size, geographic scope, salary)
   - ✅ Key responsibilities count
   - ✅ Tags display (up to 3 visible)

5. **Data Access**
   - ✅ Only personas with `allowed_tenants` containing vital-system tenant ID
   - ✅ Tenant filtering working correctly
   - ✅ No cross-tenant data leakage

---

## 🔍 Tenant Data Access

### Tables with Access

According to the tenant access matrix, **vital-system** has access to:

| Table | Access |
|-------|--------|
| `org_functions` | ✅ Full access |
| `org_departments` | ✅ Full access |
| `org_roles` | ✅ Full access |
| `personas` | ✅ Full access |
| `tools` | ✅ Full access |
| `prompts` | ✅ Full access |
| `agents` | ✅ Full access |
| `knowledge_domains` | ✅ Full access |

### API Filtering

All API endpoints use tenant filtering:
```typescript
query = query.contains('allowed_tenants', [profile.tenant_id]);
```

The personas API (`/api/personas`) automatically filters by tenant.

---

## 🐛 Troubleshooting

### Issue: Empty Personas List

**Check:**
1. Verify tenant ID in database:
   ```sql
   SELECT id, name, slug, tenant_key 
   FROM organizations 
   WHERE tenant_key = 'vital-system';
   ```

2. Check personas have correct `allowed_tenants`:
   ```sql
   SELECT id, name, allowed_tenants 
   FROM personas 
   WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)
   LIMIT 10;
   ```

3. Verify user profile has correct tenant_id:
   ```sql
   SELECT id, email, tenant_id 
   FROM profiles 
   WHERE email = 'your-email@example.com';
   ```

### Issue: Wrong Tenant Detected

**Check:**
1. Verify `/etc/hosts` configuration
2. Check browser is using `vital-system.localhost:3000` (not `localhost:3000`)
3. Check middleware logs in terminal
4. Clear browser cookies and cache

### Issue: 404 or Routing Errors

**Check:**
1. Verify middleware is running (check terminal logs)
2. Check `apps/vital-system/src/middleware.ts` exists
3. Verify Next.js config allows middleware

---

## 📊 Expected Data Counts

After proper setup, you should see:

- **Personas**: Varies by tenant (vital-system should have access to all system personas)
- **Roles**: Multiple roles across functions
- **Departments**: Multiple departments
- **Functions**: Multiple business functions
- **Seniority Levels**: Various levels (junior, mid, senior, executive)

---

## 🔐 Authentication

### Testing with Authentication

1. **Sign In**: Use your test account
2. **Verify Tenant**: Check that your profile has the correct `tenant_id`
3. **Check Permissions**: Verify you have access to personas

### Test Accounts

If you need to create a test account:
```sql
-- Check existing accounts
SELECT id, email, tenant_id, role 
FROM profiles 
WHERE email LIKE '%@%';

-- Update tenant_id if needed
UPDATE profiles 
SET tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
WHERE email = 'your-email@example.com';
```

---

## 📝 Testing Checklist

- [ ] `/etc/hosts` configured with `vital-system.localhost`
- [ ] Development server running on port 3000
- [ ] Can access `http://vital-system.localhost:3000`
- [ ] Can navigate to `/personas` page
- [ ] Stats cards display correctly
- [ ] Filters work (search, role, department, function, seniority)
- [ ] Grid view shows persona cards
- [ ] List view shows persona list items
- [ ] Department view groups personas correctly
- [ ] Persona cards display all information
- [ ] No console errors
- [ ] No cross-tenant data visible
- [ ] Tenant filtering working correctly

---

## 🔗 Related Documentation

- [Multi-tenancy Infrastructure](../../05-architecture/data/MULTITENANCY_AND_RAG_INFRASTRUCTURE.md)
- [Subdomain Multitenancy Setup](../../../../SUBDOMAIN_MULTITENANCY_SETUP.md)
- [Personas UI Components](./PERSONAS_UI_COMPONENTS.md)
- [Persona Seeding Guide](./PERSONA_SEEDING_COMPLETE_GUIDE.md)

---

## 🎯 Quick Test Commands

### Check Tenant in Database
```sql
SELECT id, name, slug, tenant_key, tenant_type 
FROM organizations 
WHERE tenant_key = 'vital-system';
```

### Check Personas for Tenant
```sql
SELECT COUNT(*) as persona_count
FROM personas 
WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants);
```

### Check User Profile
```sql
SELECT id, email, tenant_id, role 
FROM profiles 
WHERE email = 'your-email@example.com';
```

---

**Status**: ✅ Ready for Testing  
**Last Updated**: 2025-11-19

