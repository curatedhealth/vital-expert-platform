# 🏢 Multi-Tenant Agent Sharing Strategy

## 📋 **Overview**

Your RLS setup now supports **3 types of agent visibility**:

### **1. 🌍 Public Agents (Global)**
- **Visibility:** All tenants can see and use
- **Example:** VITAL system agents, standard templates
- **Flag:** `is_public = true`
- **Use Case:** Core agents provided by platform

### **2. 🔒 Private Agents (Tenant-Only)**
- **Visibility:** Only the owning tenant
- **Example:** Custom agents created by a specific organization
- **Flag:** `is_public = false`, `is_shared = false`
- **Use Case:** Tenant-specific customizations

### **3. 🤝 Shared Agents (Multi-Tenant)**
- **Visibility:** Owner + explicitly granted tenants
- **Example:** Agent shared between partner organizations
- **Flag:** `is_shared = true` + entries in `agent_tenant_access`
- **Use Case:** Collaboration between specific tenants

---

## 🔐 **RLS Policy Logic**

A tenant can see an agent if **ANY** of these conditions are true:

```sql
1. is_public = true              -- Public agents
   OR
2. tenant_id = current_tenant    -- Owned by tenant
   OR
3. is_shared = true AND          -- Shared agents with explicit grant
   EXISTS (access grant for current tenant)
```

---

## 📊 **Database Schema**

### **Agents Table - New Columns:**
```sql
is_public  BOOLEAN  -- True = visible to all tenants
is_shared  BOOLEAN  -- True = multi-tenant sharing enabled
```

### **New Junction Table:**
```sql
agent_tenant_access
├── id           UUID
├── agent_id     UUID  (references agents)
├── tenant_id    UUID  (which tenant has access)
├── granted_at   TIMESTAMPTZ
└── granted_by   UUID  (who granted access)
```

---

## 🎯 **Usage Examples**

### **Make VITAL System Agents Public:**
```sql
-- All VITAL system agents visible to everyone
UPDATE agents 
SET is_public = true 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
```

### **Share Agent with Specific Tenant:**
```sql
-- Grant access
SELECT grant_agent_access(
    'agent-uuid'::UUID,      -- Agent to share
    'tenant-uuid'::UUID,     -- Tenant to grant access
    'admin-uuid'::UUID       -- Who granted it
);
```

### **Revoke Access:**
```sql
SELECT revoke_agent_access(
    'agent-uuid'::UUID,
    'tenant-uuid'::UUID
);
```

### **Make Agent Private:**
```sql
UPDATE agents 
SET is_public = false, is_shared = false 
WHERE id = 'agent-uuid';

DELETE FROM agent_tenant_access 
WHERE agent_id = 'agent-uuid';
```

---

## 🧪 **Testing Scenarios**

### **Scenario 1: VITAL System Tenant**
```sql
SELECT set_tenant_context('00000000-0000-0000-0000-000000000001'::UUID);
SELECT id, name, is_public FROM agents;
-- Should see: ALL agents (owned + all public agents)
```

### **Scenario 2: Regular Tenant A**
```sql
SELECT set_tenant_context('tenant-a-uuid'::UUID);
SELECT id, name, is_public, is_shared FROM agents;
-- Should see:
-- ✅ Public agents (is_public=true)
-- ✅ Their own agents (tenant_id = tenant-a)
-- ✅ Agents shared with them (in agent_tenant_access)
-- ❌ Other tenants' private agents
```

### **Scenario 3: Share Between Tenants**
```sql
-- Tenant A shares agent with Tenant B
SELECT grant_agent_access(
    'agent-123'::UUID,
    'tenant-b-uuid'::UUID,
    'admin-a-uuid'::UUID
);

-- Tenant B can now see agent-123
SELECT set_tenant_context('tenant-b-uuid'::UUID);
SELECT * FROM agents WHERE id = 'agent-123';
-- ✅ Returns the agent
```

---

## 📈 **Visibility Matrix**

| Agent Type | VITAL Tenant | Tenant A | Tenant B |
|------------|-------------|----------|----------|
| **Public Agent** | ✅ See | ✅ See | ✅ See |
| **Tenant A Agent (Private)** | ✅ See (all) | ✅ See (owner) | ❌ No access |
| **Tenant A Agent (Shared with B)** | ✅ See (all) | ✅ See (owner) | ✅ See (granted) |
| **Tenant B Agent (Private)** | ✅ See (all) | ❌ No access | ✅ See (owner) |

---

## 🚀 **Migration Steps**

### **Step 1: Run the Migration**
```sql
-- Run: 006_rls_advanced_multi_tenant_sharing.sql
-- This will:
-- ✅ Add is_public, is_shared columns
-- ✅ Create agent_tenant_access table
-- ✅ Update RLS policies
-- ✅ Create helper functions
-- ✅ Mark VITAL system agents as public
```

### **Step 2: Configure Your Agents**
```sql
-- Option A: Make all VITAL agents public (already done)
-- Option B: Keep some VITAL agents private
UPDATE agents 
SET is_public = false 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
AND name IN ('Internal Agent 1', 'Beta Agent 2');
```

### **Step 3: Test Visibility**
```sql
-- Test as different tenants
SELECT set_tenant_context('tenant-uuid'::UUID);
SELECT COUNT(*) as visible_agents FROM agents;
```

---

## 🔧 **Helper Functions Provided**

### **`grant_agent_access(agent_id, tenant_id, granted_by)`**
- Grants a tenant access to an agent
- Automatically marks agent as `is_shared = true`
- Returns access grant ID

### **`revoke_agent_access(agent_id, tenant_id)`**
- Revokes a tenant's access
- Auto-unmarks `is_shared` if no more tenants have access
- Returns success boolean

---

## 💡 **Best Practices**

### **For VITAL System Tenant:**
1. ✅ Mark core/template agents as `is_public = true`
2. ✅ Keep internal/beta agents as private
3. ✅ Use sharing for pilot programs with specific tenants

### **For Regular Tenants:**
1. ✅ Default: Create private agents (`is_public = false`)
2. ✅ Use sharing for partner collaborations
3. ✅ Never make agents public (only VITAL can do this)

### **For Multi-Tenant Sharing:**
1. ✅ Use `grant_agent_access()` function (cleaner)
2. ✅ Track who granted access (`granted_by`)
3. ✅ Regularly audit `agent_tenant_access` table
4. ✅ Revoke access when partnerships end

---

## 📊 **Monitoring Queries**

### **See All Public Agents:**
```sql
SELECT id, name, tenant_id
FROM agents
WHERE is_public = true;
```

### **See Shared Agents:**
```sql
SELECT 
    a.name as agent,
    a.tenant_id as owner,
    COUNT(ata.tenant_id) as shared_with_count
FROM agents a
LEFT JOIN agent_tenant_access ata ON ata.agent_id = a.id
WHERE a.is_shared = true
GROUP BY a.id, a.name, a.tenant_id;
```

### **Audit Access Grants:**
```sql
SELECT 
    a.name as agent,
    ata.tenant_id as granted_to,
    ata.granted_at,
    ata.granted_by
FROM agent_tenant_access ata
JOIN agents a ON a.id = ata.agent_id
ORDER BY ata.granted_at DESC;
```

---

## ✅ **Summary**

Your multi-tenant RLS now supports:
- ✅ **Public agents** (VITAL system → all tenants)
- ✅ **Private agents** (tenant → tenant only)
- ✅ **Shared agents** (tenant → specific tenants)
- ✅ **Helper functions** for easy management
- ✅ **Audit trail** (who granted what, when)

**This is production-ready for a sophisticated multi-tenant SaaS!** 🚀






