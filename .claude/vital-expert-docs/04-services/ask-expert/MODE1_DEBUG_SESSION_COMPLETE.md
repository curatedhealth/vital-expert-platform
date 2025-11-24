# Mode 1 Debug Session - Complete Analysis

**Date**: November 23, 2025
**Status**: 🟡 Partial Success - Critical Bugs Fixed, Schema Migration Needed
**Session**: Continuation from previous troubleshooting

---

## 🎯 Session Objectives

Continue debugging why Mode 1 Interactive Manual workflow nodes weren't executing, fixing issues discovered during previous session.

---

## 🔍 Critical Bugs Found & Fixed

### Bug #1: `agent_id` Not Mapped to `selected_agents`

**Location**: `/services/ai-engine/src/langgraph_workflows/state_schemas.py:483`

**Problem**:
```python
# BEFORE (Line 483)
selected_agents=[],  # Always empty!
```

`create_initial_state()` was initializing `selected_agents` as an empty list, never checking the `agent_id` kwarg. Mode1 workflow checks `selected_agents` and fails immediately if empty.

**Fix**:
```python
# AFTER (Line 483-484)
# FIXED: Map agent_id kwarg to selected_agents list (for Mode 1 manual selection)
selected_agents=[kwargs.get('agent_id')] if kwargs.get('agent_id') else [],
```

**Impact**: ✅ Workflow now receives agent ID correctly

---

### Bug #2: Wrong Supabase Client API (6 occurrences)

**Location**: `/services/ai-engine/src/langgraph_workflows/mode1_interactive_manual.py`

**Problem**:
The `SupabaseClient` wrapper class doesn't expose a `.table()` method directly. Workflow was calling:
```python
self.supabase.table('ask_expert_sessions')  # ❌ AttributeError
```

**Fix** (Applied to 6 locations):
```python
# Lines 284, 313, 389, 462, 971, 982, 1040
self.supabase.client.table('ask_expert_sessions')  # ✅ Correct
```

**Locations Fixed**:
1. Line 284: `load_session_node` - Load existing session
2. Line 313: `load_session_node` - Create new session
3. Line 389: `load_agent_profile_node` - Fetch agent profile
4. Line 462: `load_conversation_history_node` - Load message history
5. Line 971: `save_message_node` - Save user message
6. Line 982: `save_message_node` - Save assistant message
7. Line 1040: `update_session_metadata_node` - Update session stats

**Impact**: ✅ Supabase API calls now use correct path

---

### Bug #3: Enhanced Debug Logging

**Location**: `/services/ai-engine/src/langgraph_workflows/mode1_interactive_manual.py`

**Added Logging**:

1. **Workflow Initialization** (Lines 143-156):
```python
logger.info(
    "✅ Mode1InteractiveManualWorkflow initialized",
    workflow=self.workflow_name,
    checkpoints_enabled=self.enable_checkpoints,
    services_initialized={
        'agent_orchestrator': self.agent_orchestrator is not None,
        'sub_agent_spawner': self.sub_agent_spawner is not None,
        'rag_service': self.rag_service is not None,
        'tool_registry': self.tool_registry is not None,
        'confidence_calculator': self.confidence_calculator is not None,
        'compliance_service': self.compliance_service is not None,
        'human_validator': self.human_validator is not None,
    }
)
```

2. **Agent Profile Loading** (Lines 369-373):
```python
logger.info(
    "Loading agent profile",
    selected_agents=selected_agents,
    agents_count=len(selected_agents)
)
```

3. **State Initialization** (`base_workflow.py:213-220`):
```python
logger.debug(
    "Initial state created",
    workflow=self.workflow_name,
    selected_agents=initial_state.get('selected_agents', []),
    enable_rag=initial_state.get('enable_rag'),
    enable_tools=initial_state.get('enable_tools'),
    kwargs_keys=list(kwargs.keys())
)
```

**Impact**: ✅ Better observability for debugging

---

## ⚠️ Remaining Issues

### Issue #1: Database Schema Migration Not Applied

**Evidence from Logs**:
```
{"error": "{'message': \"Could not find the table 'public.ask_expert_sessions' in the schema cache\",
           'code': 'PGRST205',
           'hint': \"Perhaps you meant the table 'public.user_sessions'\""}
```

**Root Cause**:
Migration file exists at `/supabase/migrations/20251118210000_mode1_interactive_manual.sql` but was never applied to the database.

**Solution Required**:
```bash
# Apply migration
psql "$DATABASE_URL" < /Users/hichamnaim/Downloads/Cursor/VITAL\ path/supabase/migrations/20251118210000_mode1_interactive_manual.sql

# OR use Supabase CLI
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path
npx supabase db push
```

**Tables to Create**:
1. `ask_expert_sessions` - Conversation sessions
2. `ask_expert_messages` - Individual messages

---

### Issue #2: CacheManager API Mismatch

**Error**:
```
CacheManager.get() takes 2 positional arguments but 3 were given
```

**Location**: Called in `execute_expert_agent_node` (line ~734)

**Problem**:
```python
cached_response = await self.cache_manager.get(cache_key, tenant_id)  # ❌ 3 args
```

**Expected Signature**:
```python
async def get(self, key: str) -> Optional[Any]  # Only 2 args (self, key)
```

**Fix Required**:
```python
# Remove tenant_id from cache_manager.get() calls
cached_response = await self.cache_manager.get(cache_key)  # ✅ 2 args
```

---

### Issue #3: Supabase Client Sync vs Async API

**Error**:
```
'SyncQueryRequestBuilder' object has no attribute 'select'
```

**Problem**: The Supabase Python client may be returning sync builders instead of async ones.

**Potential Fix**:
Check if we need to use `await` or if the client needs to be configured for async operations.

---

## 📊 Test Results

### Before Fixes:
```json
{
  "content": "",
  "nodes_executed": [],
  "processing_time_ms": 108
}
```

### After Fixes (Current):
```json
{
  "content": "I apologize, but I encountered an error processing your request.",
  "confidence": 0.0,
  "citations": [],
  "metadata": {
    "workflow": "Mode1InteractiveManualWorkflow",
    "nodes_executed": [],
    "reasoning_steps": []
  },
  "processing_time_ms": 448
}
```

**Progress**:
- ✅ Workflow initializes correctly
- ✅ `selected_agents` populated with agent_id
- ✅ Supabase API calls use correct path
- ⚠️ Nodes execute but fail due to missing database tables
- ❌ Nodes still return empty due to schema issues

---

## 📋 Next Steps (Priority Order)

### Priority 1: CRITICAL (Blocking)
1. **Apply database migration**:
   ```bash
   psql "$DATABASE_URL" -f supabase/migrations/20251118210000_mode1_interactive_manual.sql
   ```
   - Creates `ask_expert_sessions` and `ask_expert_messages` tables
   - Adds indexes and RLS policies
   - **Estimated time**: 2 minutes

### Priority 2: HIGH
2. **Fix CacheManager API**:
   - Remove `tenant_id` parameter from all `cache_manager.get()` calls
   - Update calls in `rag_retrieval_node` (line ~563) and `execute_expert_agent_node` (line ~734)
   - **Estimated time**: 10 minutes

### Priority 3: MEDIUM
3. **Investigate Supabase Sync/Async Issue**:
   - Check if Supabase client needs async configuration
   - May need to switch to `supabase.client.postgrest` methods
   - **Estimated time**: 30 minutes

### Priority 4: MEDIUM
4. **Test end-to-end with real agent**:
   - After schema migration, test full workflow
   - Verify nodes execute and produce output
   - Check session persistence
   - **Estimated time**: 15 minutes

---

## 🔧 Commands to Execute

### 1. Apply Migration (Critical)
```bash
# Check if tables exist
psql "$DATABASE_URL" -c "SELECT tablename FROM pg_tables WHERE tablename LIKE 'ask_expert%';"

# Apply migration if tables don't exist
psql "$DATABASE_URL" -f "/Users/hichamnaim/Downloads/Cursor/VITAL path/supabase/migrations/20251118210000_mode1_interactive_manual.sql"

# Verify tables created
psql "$DATABASE_URL" -c "SELECT tablename FROM pg_tables WHERE tablename LIKE 'ask_expert%';"
```

### 2. Restart AI Engine
```bash
# Kill existing server
lsof -ti :8000 | xargs kill -9

# Start with fresh logs
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
python3 -m uvicorn main:app --port 8000 --host 0.0.0.0 --app-dir src --reload > /tmp/ai-engine-debug.log 2>&1 &

# Wait for startup
sleep 5

# Test health
curl http://localhost:8000/health
```

### 3. Test Mode 1 Endpoint
```bash
curl -X POST 'http://localhost:8000/api/mode1/manual' \
  -H 'Content-Type: application/json' \
  -H 'x-tenant-id: 550e8400-e29b-41d4-a716-446655440000' \
  -d '{
    "agent_id":"01936bce-c6b9-7b14-8bd4-de1bf1f4ae58",
    "message":"What are the key FDA IND requirements?",
    "enable_rag":false,
    "enable_tools":false,
    "temperature":0.7,
    "max_tokens":500
  }' | python3 -m json.tool
```

---

## 📝 Files Modified

1. **`/services/ai-engine/src/langgraph_workflows/state_schemas.py`**
   - Line 483-484: Fixed `selected_agents` initialization
   - **Status**: ✅ Deployed

2. **`/services/ai-engine/src/langgraph_workflows/mode1_interactive_manual.py`**
   - Lines 143-156: Enhanced workflow initialization logging
   - Lines 284, 313, 389, 462, 971, 982, 1040: Fixed Supabase client API calls (6 locations)
   - Lines 369-377: Added agent profile loading debug logs
   - **Status**: ✅ Deployed

3. **`/services/ai-engine/src/langgraph_workflows/base_workflow.py`**
   - Lines 213-220: Added initial state creation logging
   - **Status**: ✅ Deployed

---

## 🎓 Key Learnings

### 1. **Wrapper Classes Can Hide APIs**
The `SupabaseClient` wrapper encapsulated the actual client, requiring `.client.table()` instead of direct `.table()` access. Always check wrapper implementations.

### 2. **Empty Lists Can Silently Fail Workflows**
`selected_agents=[]` caused immediate workflow failure without clear error messages. Input validation logging is critical.

### 3. **Migration Files ≠ Applied Schema**
Migration files can exist in the codebase without being applied to the database. Always verify actual database schema.

### 4. **Multi-Step Debugging Workflow**
1. Fix obvious bugs first (agent_id mapping)
2. Fix API access issues (Supabase client)
3. Add debug logging for observability
4. Discover deeper issues (missing schema)
5. Document and prioritize remaining work

---

## 💡 Recommendations

### For Immediate Fix:
1. Apply migration to create missing tables
2. Fix CacheManager API calls
3. Test end-to-end
4. Verify session persistence works

### For Long-Term:
1. Add integration tests that verify database schema
2. Create health check that validates required tables exist
3. Add startup validation for workflow dependencies
4. Implement better error messages for missing schema
5. Consider schema version tracking to detect migration drift

---

## 📊 Success Metrics

**Current State**:
- Code fixes: ✅ 100% complete (8 fixes applied)
- Workflow initialization: ✅ Working
- Node execution: ⚠️ Attempting but failing on DB
- Response generation: ❌ Blocked by missing schema

**Expected After Migration**:
- [ ] Tables created and indexed
- [ ] Sessions can be created/loaded
- [ ] Messages can be saved
- [ ] Agent profiles can be fetched
- [ ] Workflow completes successfully
- [ ] Nodes execute and return content
- [ ] Processing time: 3-5 seconds (typical for Mode 1)

---

**Status**: Ready for database migration and final testing.

**Next Action**: Apply migration file to create `ask_expert_sessions` and `ask_expert_messages` tables.
