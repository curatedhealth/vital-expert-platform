# 🔐 Multi-Level Agent Privacy System

## 📋 **4-Level Privacy Hierarchy**

Your system now supports **4 levels of agent visibility**, checked in order:

```
Priority Order (most restrictive to least restrictive):
1. 👤 User-Private     → Only creator can see
2. 🏢 Tenant-Shared    → All users in tenant can see  
3. 🤝 Multi-Tenant     → Specific tenants can see
4. 🌍 Public           → Everyone can see
```

---

## 🔍 **Privacy Level Details**

### **Level 1: 👤 User-Private Agents**
**Visibility:** Only the user who created it
```sql
is_private_to_user = true
created_by = current_user
```

**Use Cases:**
- Personal AI assistants
- User's custom templates
- Draft/experimental agents
- Private research agents

**Example:**
```sql
-- User A creates private agent
created_by: user-a-uuid
is_private_to_user: true
tenant_id: tenant-123

-- Result:
-- ✅ User A (creator) → can see
-- ❌ User B (same tenant) → cannot see
-- ❌ User C (different tenant) → cannot see
```

---

### **Level 2: 🏢 Tenant-Shared Agents**
**Visibility:** All users within the tenant
```sql
is_private_to_user = false
tenant_id = current_tenant
```

**Use Cases:**
- Team-shared agents
- Department agents
- Organization templates
- Collaborative agents

**Example:**
```sql
-- User A creates tenant-shared agent
created_by: user-a-uuid
is_private_to_user: false
tenant_id: tenant-123

-- Result:
-- ✅ User A (same tenant) → can see
-- ✅ User B (same tenant) → can see
-- ❌ User C (different tenant) → cannot see
```

---

### **Level 3: 🤝 Multi-Tenant Shared**
**Visibility:** Specific tenants with explicit grants
```sql
is_shared = true
AND EXISTS (access grant for current tenant)
```

**Use Cases:**
- Partner collaborations
- Client-specific agents
- Vendor integrations
- Strategic partnerships

**Example:**
```sql
-- Tenant A shares with Tenant B
agent_id: agent-123
tenant_id: tenant-a (owner)
is_shared: true

-- agent_tenant_access table:
agent_id: agent-123
tenant_id: tenant-b (granted)

-- Result:
-- ✅ All users in Tenant A (owner) → can see
-- ✅ All users in Tenant B (granted) → can see
-- ❌ Users in Tenant C (not granted) → cannot see
```

---

### **Level 4: 🌍 Public Agents**
**Visibility:** All tenants, all users
```sql
is_public = true
```

**Use Cases:**
- VITAL system agents
- Platform defaults
- Community agents
- Standard templates

**Example:**
```sql
-- VITAL creates public agent
created_by: admin-uuid
tenant_id: vital-system-uuid
is_public: true

-- Result:
-- ✅ All users in all tenants → can see
```

---

## 📊 **Privacy Matrix**

| Agent Type | Creator | Same Tenant User | Other Tenant | VITAL Admin |
|------------|---------|------------------|--------------|-------------|
| **User-Private** | ✅ See | ❌ No | ❌ No | ✅ See (admin) |
| **Tenant-Shared** | ✅ See | ✅ See | ❌ No | ✅ See (admin) |
| **Multi-Tenant** | ✅ See | ✅ See | ✅ See (if granted) | ✅ See (admin) |
| **Public** | ✅ See | ✅ See | ✅ See | ✅ See |

---

## 🎯 **Database Schema**

### **Agents Table - Privacy Columns:**
```sql
tenant_id            UUID      -- Which tenant owns it
created_by           UUID      -- Which user created it
is_public            BOOLEAN   -- Public to all tenants
is_shared            BOOLEAN   -- Shared with specific tenants
is_private_to_user   BOOLEAN   -- Private to creator only
```

### **Junction Table:**
```sql
agent_tenant_access
├── agent_id      UUID    -- Which agent
├── tenant_id     UUID    -- Which tenant has access
├── granted_by    UUID    -- Who granted access
└── granted_at    TIMESTAMP
```

---

## 🚀 **Usage Examples**

### **Setup Context (Required):**
```sql
-- Set both tenant and user context
SELECT set_tenant_context('tenant-uuid'::UUID);
SELECT set_user_context('user-uuid'::UUID);
```

### **Create User-Private Agent:**
```sql
-- Only I can see this
INSERT INTO agents (name, tenant_id, created_by, is_private_to_user)
VALUES ('My Personal Agent', 'tenant-uuid', 'user-uuid', true);
```

### **Create Tenant-Shared Agent:**
```sql
-- Everyone in my org can see this
INSERT INTO agents (name, tenant_id, created_by, is_private_to_user)
VALUES ('Team Agent', 'tenant-uuid', 'user-uuid', false);
```

### **Share with Another Tenant:**
```sql
-- Let partner tenant access our agent
SELECT grant_agent_access(
    'agent-uuid'::UUID,
    'partner-tenant-uuid'::UUID,
    'admin-uuid'::UUID
);
```

### **Make Agent Public (VITAL only):**
```sql
-- Make visible to all tenants
UPDATE agents 
SET is_public = true 
WHERE id = 'agent-uuid'
AND tenant_id = '00000000-0000-0000-0000-000000000001'; -- VITAL only
```

---

## 🧪 **Testing Scenarios**

### **Scenario 1: User-Private Agent**
```sql
-- User A creates private agent
SET app.current_tenant_id = 'tenant-123';
SET app.current_user_id = 'user-a';

INSERT INTO agents (name, tenant_id, created_by, is_private_to_user)
VALUES ('My Secret Agent', 'tenant-123', 'user-a', true);

-- User A can see it
SELECT * FROM agents WHERE name = 'My Secret Agent';
-- ✅ Returns 1 row

-- User B (same tenant) tries to see it
SET app.current_user_id = 'user-b';
SELECT * FROM agents WHERE name = 'My Secret Agent';
-- ❌ Returns 0 rows (RLS blocks it)
```

### **Scenario 2: Tenant-Shared Agent**
```sql
-- User A creates team agent
SET app.current_tenant_id = 'tenant-123';
SET app.current_user_id = 'user-a';

INSERT INTO agents (name, tenant_id, created_by, is_private_to_user)
VALUES ('Team Agent', 'tenant-123', 'user-a', false);

-- User B (same tenant) can see it
SET app.current_user_id = 'user-b';
SELECT * FROM agents WHERE name = 'Team Agent';
-- ✅ Returns 1 row
```

### **Scenario 3: Multi-Tenant Shared**
```sql
-- Tenant A shares agent with Tenant B
SELECT grant_agent_access(
    'agent-123'::UUID,
    'tenant-b'::UUID,
    'admin-a'::UUID
);

-- Users in Tenant B can now see it
SET app.current_tenant_id = 'tenant-b';
SET app.current_user_id = 'user-from-tenant-b';
SELECT * FROM agents WHERE id = 'agent-123';
-- ✅ Returns 1 row
```

---

## 🔧 **Backend Integration**

### **FastAPI Middleware (Recommended):**
```python
from fastapi import Request, Depends
from services.supabase_client import SupabaseClient

async def set_request_context(
    request: Request,
    supabase: SupabaseClient = Depends(get_supabase)
):
    """Set both tenant and user context for RLS"""
    tenant_id = request.headers.get('x-tenant-id')
    user_id = request.headers.get('x-user-id')  # From JWT
    
    if tenant_id:
        await supabase.rpc('set_tenant_context', {'p_tenant_id': tenant_id})
    
    if user_id:
        await supabase.rpc('set_user_context', {'p_user_id': user_id})
```

### **Agent Creation API:**
```python
@app.post("/api/agents")
async def create_agent(
    request: AgentCreateRequest,
    tenant_id: str = Depends(get_tenant_id),
    user_id: str = Depends(get_user_id),
    supabase: SupabaseClient = Depends(get_supabase)
):
    """Create agent with appropriate privacy level"""
    
    agent_data = {
        "name": request.name,
        "tenant_id": tenant_id,
        "created_by": user_id,
        "is_private_to_user": request.is_private,  # User choice
        "is_public": False,  # Only VITAL can set true
        "is_shared": False
    }
    
    result = await supabase.table('agents').insert(agent_data).execute()
    return result
```

---

## 📈 **Decision Flow**

When a user queries agents, RLS checks in this order:

```
User queries: SELECT * FROM agents

RLS evaluates:
┌─────────────────────────────────────┐
│ 1. Is agent public?                 │
│    → Yes: Return ✅                  │
│    → No: Continue to 2              │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 2. Is it user-private AND           │
│    created by current user?         │
│    → Yes: Return ✅                  │
│    → No: Continue to 3              │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 3. Is it tenant-shared AND          │
│    owned by current tenant?         │
│    → Yes: Return ✅                  │
│    → No: Continue to 4              │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 4. Is it multi-tenant shared AND    │
│    current tenant has access grant? │
│    → Yes: Return ✅                  │
│    → No: Block ❌                    │
└─────────────────────────────────────┘
```

---

## 💡 **Best Practices**

### **For End Users:**
1. ✅ Create private agents for personal use
2. ✅ Create tenant-shared agents for team collaboration
3. ❌ Can't create public agents (VITAL only)

### **For Tenant Admins:**
1. ✅ Can share agents with partner tenants
2. ✅ Can see all agents in their tenant (except user-private)
3. ✅ Can revoke access grants

### **For VITAL System:**
1. ✅ Make core agents public
2. ✅ Can access all agents (service role)
3. ✅ Can grant/revoke any access

---

## ✅ **Summary**

Your privacy system now supports:
- 👤 **User-Private:** Personal agents (creator only)
- 🏢 **Tenant-Shared:** Team agents (all users in org)
- 🤝 **Multi-Tenant:** Partner agents (specific tenants)
- 🌍 **Public:** Platform agents (everyone)

**This is enterprise-grade multi-level privacy!** 🚀

Run `007_rls_multi_level_privacy.sql` to implement it!






