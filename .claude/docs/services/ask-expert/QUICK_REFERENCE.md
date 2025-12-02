# Ask Expert System - Developer Quick Reference

**Version:** 2.0 | **Status:** ✅ Production-Ready

---

## 🚀 **Quick Start**

### **Make an API Call:**
```python
import httpx

# Mode 1: User picks expert, multi-turn chat
response = httpx.post(
    "http://localhost:8000/api/mode1/manual",
    json={
        "query": "How do I optimize SQL queries?",
        "agent_id": "uuid-of-database-expert",
        "session_id": "session-123",
        "user_id": "user-456",
        "tenant_id": "tenant-789"
    }
)

# Mode 2: AI picks expert, multi-turn chat
response = httpx.post(
    "http://localhost:8000/api/mode2/automatic",
    json={
        "query": "Help me with cloud architecture",
        "session_id": "session-123",
        "user_id": "user-456",
        "tenant_id": "tenant-789",
        "model": "gpt-4"  # optional
    }
)

# Mode 3: User picks expert, deep reasoning
response = httpx.post(
    "http://localhost:8000/api/mode3/autonomous-automatic",
    json={
        "query": "Design a scalable microservices system",
        "agent_id": "uuid-of-architect",
        "session_id": "session-123",
        "user_id": "user-456",
        "tenant_id": "tenant-789"
    }
)

# Mode 4: AI picks experts, panel discussion
response = httpx.post(
    "http://localhost:8000/api/mode4/autonomous-manual",
    json={
        "query": "Should we migrate to Kubernetes?",
        "session_id": "session-123",
        "user_id": "user-456",
        "tenant_id": "tenant-789",
        "model": "gpt-4"  # optional
    }
)
```

---

## 📊 **4 Modes Comparison**

| Feature | Mode 1 | Mode 2 | Mode 3 | Mode 4 |
|---------|--------|--------|--------|--------|
| **Selection** | User | AI | User | AI |
| **Reasoning** | Simple | Simple | Deep | Deep |
| **Multi-Turn** | ✅ | ✅ | ✅ | ✅ |
| **Performance** | ~475ms | ~335ms | ~1951ms | ~4665ms |
| **Agent Count** | 1 | 1 | 1 | 3+ |
| **Use Case** | Direct consult | Smart routing | Complex problem | Panel discussion |

---

## 🔧 **Common Tasks**

### **Get Agent List:**
```python
agents = supabase.table('agents').select('*').eq('status', 'active').execute()
```

### **Create Session:**
```python
session = {
    "id": str(uuid.uuid4()),
    "user_id": user_id,
    "tenant_id": tenant_id,
    "created_at": datetime.now()
}
```

### **Set RLS Context:**
```python
# In middleware (required for RLS)
await supabase.rpc('set_tenant_context', {'p_tenant_id': tenant_id})
await supabase.rpc('set_user_context', {'p_user_id': user_id})
```

---

## 🔐 **Agent Privacy Levels**

```python
# 1. User-Private (only you)
agent = {
    "name": "My Agent",
    "tenant_id": tenant_id,
    "created_by": user_id,
    "is_private_to_user": True,
    "is_public": False,
    "is_shared": False
}

# 2. Tenant-Shared (your team)
agent = {
    "name": "Team Agent",
    "tenant_id": tenant_id,
    "created_by": user_id,
    "is_private_to_user": False,
    "is_public": False,
    "is_shared": False
}

# 3. Multi-Tenant (specific partners)
agent = {
    "name": "Partner Agent",
    "tenant_id": owner_tenant_id,
    "created_by": user_id,
    "is_private_to_user": False,
    "is_public": False,
    "is_shared": True  # Then grant access via agent_tenant_access
}

# 4. Public (everyone - VITAL only)
agent = {
    "name": "VITAL Expert",
    "tenant_id": "vital-system",
    "created_by": "vital-admin",
    "is_private_to_user": False,
    "is_public": True,
    "is_shared": False
}
```

---

## 🛠️ **Troubleshooting**

### **Empty Response:**
```python
# Check agent exists and is visible
agent = supabase.table('agents').select('*').eq('id', agent_id).execute()
if not agent.data:
    print("Agent not found or not accessible")
```

### **Slow Response (Mode 3/4):**
```python
# These modes use deep reasoning (normal to be slower)
# Mode 3: ~2s for Chain-of-Thought
# Mode 4: ~5s for multi-agent panel
```

### **Permission Denied:**
```python
# Check RLS context is set
result = await supabase.rpc('get_current_tenant_id')
if not result:
    print("RLS context not set - add to middleware")
```

---

## 📁 **Key Files**

### **Workflows:**
- `mode1_interactive_manual.py` - Mode 1 (user + simple)
- `mode2_interactive_manual_workflow.py` - Mode 2 (AI + simple)
- `mode3_manual_chat_autonomous.py` - Mode 3 (user + deep)
- `mode4_auto_chat_autonomous.py` - Mode 4 (AI + deep)

### **Services:**
- `agent_orchestrator.py` - Executes agents
- `agent_selector_service.py` - AI selection
- `unified_rag_service.py` - RAG retrieval
- `panel_orchestrator.py` - Multi-agent panels

### **Models:**
- `requests.py` - Request/response models
- `state_schemas.py` - Workflow state

---

## 🧪 **Testing**

### **Test Mode 1:**
```bash
curl -X POST http://localhost:8000/api/mode1/manual \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Test query",
    "agent_id": "test-uuid",
    "session_id": "test-session",
    "user_id": "test-user",
    "tenant_id": "test-tenant"
  }'
```

### **Test RLS:**
```sql
-- Should return your tenant ID
SELECT get_current_tenant_id();

-- Should return your user ID
SELECT get_current_user_id();

-- Should only show accessible agents
SELECT * FROM agents;
```

---

## 💡 **Best Practices**

### **DO:**
- ✅ Always set RLS context at request start
- ✅ Use Mode 1/2 for simple queries (<500ms)
- ✅ Use Mode 3/4 for complex reasoning
- ✅ Include session_id for conversation history
- ✅ Validate agent_id exists before calling

### **DON'T:**
- ❌ Skip RLS context (breaks security)
- ❌ Use Mode 4 for simple queries (overkill)
- ❌ Hardcode agent UUIDs (use agent selection)
- ❌ Forget error handling
- ❌ Create public agents without approval

---

## 🔗 **Useful Links**

- **Full Docs:** `.claude/docs/services/ask-expert/README.md`
- **Status:** `.claude/docs/services/ask-expert/IMPLEMENTATION_STATUS.md`
- **RLS Guide:** `.claude/docs/platform/rls/README.md`
- **Migrations:** `.claude/docs/platform/rls/migrations/`

---

## 📞 **Quick Help**

| Issue | Solution |
|-------|----------|
| Empty response | Check agent accessibility + RLS context |
| Slow response | Mode 3/4 are slow by design (deep reasoning) |
| 404 error | Check endpoint URL and method (POST) |
| Validation error | Check all required fields in request |
| Permission denied | Set RLS context in middleware |

---

**Happy Coding!** 🚀

**Last Updated:** 2025-11-26  
**Support:** See full documentation in `.claude/docs/`










