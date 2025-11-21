# Mode 1 Root Cause Analysis - CONFIRMED

**Status**: ✅ **ROOT CAUSE IDENTIFIED**

**Date**: November 5, 2025 15:50 PST

---

## 🎯 Critical Issues Found

### 1. **Agent ID Not Being Passed** ❌
**Log Evidence**:
```
2025-11-05 15:45:56 - "selected_agents": []
2025-11-05 15:45:56 - ERROR - "No agents selected by user"
```

**Expected Agent**:
- Name: `digital_therapeutic_specialist`
- ID: `89167a66-8ac8-4969-a651-6d5ab1ac10f0` (UUID)
- Tenant: `11111111-1111-1111-1111-111111111111`

**Fix Required**: Frontend is not passing the selected agent ID to the backend.

---

### 2. **Invalid Tenant ID Format** ❌
**Log Evidence**:
```
2025-11-05 15:46:54 - ERROR - "Invalid tenant ID format: vital-default-tenant"
```

**Problem**: 
- Sent: `vital-default-tenant` (string slug)
- Expected: `11111111-1111-1111-1111-111111111111` (UUID)

**Fix Required**: Convert tenant slug to tenant UUID in frontend or middleware.

---

### 3. **Supabase Client Not Initialized** ❌
**Log Evidence**:
```
"event": "❌ All Supabase initialization methods failed"
"event": "   Method 1: Client.__init__() got an unexpected keyword argument 'proxy'"
"event": "⚠️ Supabase-dependent features will be unavailable"
```

**Problem**: The `proxy` parameter is incompatible with the current `supabase-py` version.

**Impact**:
- RAG queries fail
- Agent data cannot be fetched
- Memory retrieval fails

**Fix Required**: Remove `proxy` parameter or upgrade `supabase-py` client.

---

### 4. **Invalid Pinecone API Key** ❌
**Log Evidence**:
```
"error": "(401) Reason: Unauthorized ... Invalid API Key"
"event": "⚠️ Pinecone agents index not found"
"event": "⚠️ Pinecone RAG index not found, will use Supabase only"
```

**Problem**: The Pinecone API key in `.env` is invalid or expired.

**Current Key** (from logs): Returns `401 Unauthorized`

**User Provided Key**: `pcsk_6B4sVX_3WkUSw4xggc1k5w18FGxKhA3264v2yE3FuoeUHufUTRFuWr6n2AUkjenDSRt5PK`

**Fix Required**: Update `PINECONE_API_KEY` in `.env` file with the correct key.

---

## 📊 Database Verification

### Agents Table Structure ✅
```sql
- id: UUID (primary key)
- name: text (e.g., "digital_therapeutic_specialist")
- slug: text (e.g., "digital-therapeutic-specialist")
- tenant_id: UUID (e.g., "11111111-1111-1111-1111-111111111111")
```

### Agent Tools Table Structure ✅
```sql
- agent_id: text (should match agents.id or agents.name)
- tool_id: UUID
- is_enabled: boolean
```

**Note**: `agent_tools.agent_id` is `text` type, which may cause join issues with `agents.id` (UUID type).

---

## 🔧 Required Fixes (Priority Order)

### Fix 1: Supabase Client Initialization (CRITICAL)
**File**: `services/ai-engine/src/services/supabase_client.py`

**Action**: Remove the `proxy` parameter from all Supabase client initialization calls.

```python
# Before
self.client = create_client(
    supabase_url=supabase_url,
    supabase_key=supabase_key,
    options=ClientOptions(
        schema=schema,
        proxy=proxy,  # ❌ REMOVE THIS
        # ... other options
    )
)

# After
self.client = create_client(
    supabase_url=supabase_url,
    supabase_key=supabase_key,
    options=ClientOptions(
        schema=schema,
        # proxy parameter removed ✅
        # ... other options
    )
)
```

---

### Fix 2: Pinecone API Key Update (CRITICAL)
**File**: `.env.local` or `services/ai-engine/.env`

**Action**: Update the Pinecone API key.

```bash
# Update this line
PINECONE_API_KEY=pcsk_6B4sVX_3WkUSw4xggc1k5w18FGxKhA3264v2yE3FuoeUHufUTRFuWr6n2AUkjenDSRt5PK
```

---

### Fix 3: Frontend Agent ID Passing (CRITICAL)
**File**: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

**Debug Steps**:
1. Check browser console for debug logs showing agent ID
2. Verify `selectedAgents` array is populated
3. Ensure `agentId` is correctly extracted from `selectedAgents[0]`

**Expected Debug Output**:
```
🔍 [Mode 1 Debug] Request Details
Mode: manual
Agent ID: 89167a66-8ac8-4969-a651-6d5ab1ac10f0
Selected Agents Array: ["89167a66-8ac8-4969-a651-6d5ab1ac10f0"]
Agents List: [{id: "89167a66-8ac8-4969-a651-6d5ab1ac10f0", name: "digital_therapeutic_specialist"}, ...]
```

---

### Fix 4: Tenant ID Format (HIGH)
**File**: Frontend middleware or API route

**Action**: Ensure `tenantId` is converted from slug to UUID before sending to AI Engine.

```typescript
// If tenantId is a slug like "vital-default-tenant"
// Convert to UUID: "11111111-1111-1111-1111-111111111111"

const TENANT_SLUG_TO_UUID_MAP = {
  'vital-default-tenant': '11111111-1111-1111-1111-111111111111',
  // ... other tenants
};

const tenantUuid = TENANT_SLUG_TO_UUID_MAP[tenantId] || tenantId;
```

---

## 🚀 Verification Steps

After applying fixes:

1. **Check Supabase Initialization**:
   ```bash
   # Look for this log
   ✅ Supabase client initialized successfully
   ```

2. **Check Pinecone Initialization**:
   ```bash
   # Look for this log
   ✅ Pinecone agents index connected: vital-knowledge
   ✅ Pinecone RAG index connected: vital-rag-production
   ```

3. **Check Agent Selection**:
   ```bash
   # Look for this log
   "selected_agents": ["89167a66-8ac8-4969-a651-6d5ab1ac10f0"]
   ✅ Agent digital_therapeutic_specialist selected
   ```

4. **Check Tenant ID**:
   ```bash
   # Look for this log
   "tenant_id": "11111111-1111-1111-1111-111111111111"
   ✅ Valid tenant ID format
   ```

5. **Test Mode 1 in Browser**:
   - Navigate to Ask Expert page
   - Select "digital_therapeutic_specialist" agent
   - Enable RAG and Tools
   - Send a test query
   - Verify AI response with sources and tools used

---

## 📝 Next Steps

1. ✅ Fix Supabase `proxy` parameter issue
2. ✅ Update Pinecone API key
3. ✅ Debug frontend agent ID passing
4. ✅ Fix tenant ID format
5. ✅ Restart AI Engine and Frontend
6. ✅ Test Mode 1 end-to-end
7. ✅ Verify RAG and Tools are working

---

**End of Root Cause Analysis**

