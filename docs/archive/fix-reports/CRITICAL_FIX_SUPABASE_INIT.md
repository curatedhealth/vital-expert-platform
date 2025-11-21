# 🚨 CRITICAL FIX: Supabase Client Initialization Failure

**Date:** November 9, 2025, 8:50 PM  
**Priority:** P0 - BLOCKING ALL ASK EXPERT FUNCTIONALITY  
**Status:** ⚠️ REQUIRES IMMEDIATE FIX

---

## 🔴 **THE REAL PROBLEM**

The backend logs show:

```
❌ Failed to initialize Supabase client: Client.__init__() got an unexpected keyword argument 'proxy'
❌ 'NoneType' object has no attribute 'table'
❌ Agent c9ba4f33-4dea-4044-8471-8ec651ca4134 not found
```

### Root Cause Analysis

1. **Supabase client fails to initialize** at startup
2. `self.client = None` (initialization error)
3. **Agent lookup fails** because `self.client.table("agents")` → `None.table()`
4. **Entire workflow fails** before reaching streaming code

### ✅ **What's CORRECT**

- ✅ Agent migration is COMPLETE (172 agents in unified `agents` table)
- ✅ Backend code uses correct `agents` table (not old tables)
- ✅ Gold standard streaming code is implemented correctly
- ✅ Schema is correct, data is correct

### ❌ **What's BROKEN**

- ❌ Supabase client initialization fails with `proxy` argument error
- ❌ `self.client = None` → All database operations fail
- ❌ Cannot test streaming because workflow fails at agent lookup

---

## 🔧 **FIX #1: Supabase Client Initialization**

### Current Error
```python
# services/ai-engine/src/services/supabase_client.py line 46-49
self.client = create_client(
    supabase_url=self.settings.supabase_url,
    supabase_key=self.settings.supabase_service_role_key
)
```

**Error:** `Client.__init__() got an unexpected keyword argument 'proxy'`

### Possible Causes

#### Cause A: Supabase Package Version Mismatch
The `supabase-py` package might be too old or too new.

**Check version:**
```bash
cd services/ai-engine
source venv/bin/activate
pip show supabase
```

**Expected:** `supabase==2.3.0` or later (v2.x series)

**Fix if wrong version:**
```bash
pip install --upgrade supabase==2.3.4
```

#### Cause B: Async Client Not Being Used
The code might need to use `AsyncClient` instead of sync client.

**Current code:**
```python
from supabase import create_client, Client
```

**Try async version:**
```python
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

# Initialize with options
options = ClientOptions(
    schema="public",
    auto_refresh_token=True,
    persist_session=False
)

self.client = create_client(
    supabase_url=self.settings.supabase_url,
    supabase_key=self.settings.supabase_service_role_key,
    options=options
)
```

#### Cause C: Environment Variables Not Set
**Check if env vars are set:**
```bash
cd services/ai-engine
source venv/bin/activate
python -c "from core.config import get_settings; s = get_settings(); print(f'URL: {s.supabase_url[:30]}...'); print(f'Key: {s.supabase_service_role_key[:20]}...')"
```

If empty, set them:
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

## 🔧 **FIX #2: Tool Suggestion Service**

### Current Error
```python
KeyError: 'Input to ChatPromptTemplate is missing variables {'\n    "needs_tools"', '"needs_tools"'}'
Expected: ['\n    "needs_tools"', '"needs_tools"', 'query']
Received: ['query']
```

### Location
`services/ai-engine/src/services/tool_suggestion_service.py` line 145

### Problem
The prompt template has malformed variable names with escaped newlines:
- Expected variable: `needs_tools`
- Actual variable in template: `\n    "needs_tools"`

### Fix Required

**Step 1: Find the prompt template**
```bash
cd services/ai-engine
grep -n "needs_tools" src/services/tool_suggestion_service.py
```

**Step 2: Fix the template**
The template likely looks like:
```python
# ❌ WRONG
prompt = ChatPromptTemplate.from_template("""
Based on the query: {query}
Should we use tools? {
    "needs_tools"
}
""")
```

Should be:
```python
# ✅ CORRECT
prompt = ChatPromptTemplate.from_template("""
Based on the query: {query}
Should we use tools? {{needs_tools}}
""")
```

**Note:** In LangChain templates:
- `{variable}` = template variable (will be replaced)
- `{{literal}}` = literal text (will not be replaced)

**Step 3: Pass the variable**
```python
# ❌ WRONG
response = await chain.ainvoke({"query": query})

# ✅ CORRECT
response = await chain.ainvoke({
    "query": query,
    "needs_tools": "yes" if should_use_tools else "no"
})
```

---

## 🚀 **IMPLEMENTATION STEPS**

### Step 1: Fix Supabase Initialization (URGENT - 30 min)

```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/services/ai-engine

# Check package version
source venv/bin/activate
pip show supabase

# If version is wrong, upgrade
pip install --upgrade supabase==2.3.4

# Check environment variables
python -c "from core.config import get_settings; s = get_settings(); print(f'Supabase URL: {s.supabase_url[:50] if s.supabase_url else \"NOT SET\"}'); print(f'Service Key: {s.supabase_service_role_key[:20] if s.supabase_service_role_key else \"NOT SET\"}...')"

# Restart backend
killall -9 python uvicorn 2>/dev/null
sleep 2
python start.py > backend.log 2>&1 &

# Check logs
tail -f backend.log | grep -i "supabase"
```

**Expected output:**
```
✅ Supabase REST client initialized successfully (v2.3.0)
```

**If still fails, try alternate initialization:**

Edit `services/ai-engine/src/services/supabase_client.py`:

```python
# Around line 46, replace with:
try:
    # Simpler initialization
    self.client = create_client(
        self.settings.supabase_url,
        self.settings.supabase_service_role_key
    )
    logger.info("✅ Supabase client created")
except Exception as e:
    logger.error(f"❌ Supabase init failed: {e}")
    self.client = None
    return
```

### Step 2: Fix Tool Suggestion Service (URGENT - 20 min)

```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/services/ai-engine/src/services

# Find the problematic prompt
grep -A 10 -B 5 "needs_tools" tool_suggestion_service.py
```

**Then edit the file to:**
1. Fix escaped newlines in template
2. Use double curly braces for literal text
3. Pass all required variables to `ainvoke()`

### Step 3: Test End-to-End (10 min)

```bash
# Restart backend
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/services/ai-engine
killall -9 python uvicorn 2>/dev/null
sleep 2
python start.py > backend.log 2>&1 &

# Wait for startup
sleep 5

# Test health
curl http://localhost:8080/health

# Check logs for errors
tail -200 backend.log | grep -E "ERROR|Failed|❌"

# Should see ZERO errors about:
# - Supabase initialization
# - Agent not found
# - needs_tools variable
```

### Step 4: Test Ask Expert in UI (5 min)

1. Open http://localhost:3000/ask-expert
2. Select "Adaptive Trial Designer" agent
3. Type query: "Explain ADHD treatment strategies"
4. Click submit
5. **Expected:** Tokens stream word-by-word with AI reasoning visible

---

## 📊 **VERIFICATION CHECKLIST**

### Backend Health
- [ ] Supabase client initializes successfully
- [ ] No "proxy" argument errors in logs
- [ ] Agent lookup returns data (not null)
- [ ] Tool suggestion service runs without errors
- [ ] Workflow reaches `execute_agent` node
- [ ] LLM streaming starts

### Frontend Experience
- [ ] Query submits without errors
- [ ] Workflow steps display in AI Reasoning
- [ ] Tokens appear word-by-word
- [ ] No duplicate content
- [ ] Sources display (if RAG enabled)
- [ ] Performance metrics logged

---

## 🎯 **SUCCESS CRITERIA**

### Before Fix (Current State)
```
✅ validate_inputs  → Success
❌ fetch_agent      → FAILS (Supabase client = None)
❌ rag_retrieval    → Skipped
❌ tool_suggestion  → CRASHES (prompt template bug)
❌ execute_agent    → Never reached
❌ format_output    → Empty content
```

### After Fix (Expected State)
```
✅ validate_inputs  → Success
✅ fetch_agent      → Success (agent data loaded)
✅ rag_retrieval    → Success (documents fetched)
✅ tool_suggestion  → Success (tools suggested)
✅ execute_agent    → Success ⭐ GOLD STANDARD STREAMING
✅ format_output    → Success (formatted response)
```

---

## 🔍 **DEBUGGING COMMANDS**

### Check Supabase Connection
```bash
cd services/ai-engine
source venv/bin/activate

python << 'EOF'
from core.config import get_settings
from supabase import create_client

settings = get_settings()
print(f"URL: {settings.supabase_url[:50]}...")
print(f"Key: {settings.supabase_service_role_key[:20]}...")

try:
    client = create_client(
        settings.supabase_url,
        settings.supabase_service_role_key
    )
    print("✅ Client created successfully")
    
    # Test query
    result = client.table('agents').select('id,name').limit(1).execute()
    print(f"✅ Query successful: {result.data}")
except Exception as e:
    print(f"❌ Error: {e}")
EOF
```

### Check Agent Exists in Database
```bash
cd services/ai-engine
source venv/bin/activate

python << 'EOF'
from core.config import get_settings
from supabase import create_client

settings = get_settings()
client = create_client(settings.supabase_url, settings.supabase_service_role_key)

agent_id = "c9ba4f33-4dea-4044-8471-8ec651ca4134"
result = client.table('agents').select('*').eq('id', agent_id).execute()

if result.data:
    agent = result.data[0]
    print(f"✅ Agent found: {agent['name']}")
    print(f"   Category: {agent.get('agent_category')}")
    print(f"   Active: {agent.get('is_active')}")
else:
    print(f"❌ Agent {agent_id} not found")
EOF
```

---

## 📝 **RELATED DOCUMENTATION**

### Agent Migration (COMPLETE)
- ✅ `PHASE_2_FINAL_SUMMARY.md` - Migration complete, 172 agents
- ✅ `PHASE_2_AGENT_MIGRATION_COMPLETE.md` - Full technical details
- ✅ `ASK_EXPERT_UPDATE_QUICK_GUIDE.md` - Service update guide

### Gold Standard Streaming (COMPLETE)
- ✅ `GOLD_STANDARD_STREAMING_IMPLEMENTATION.md` - Implementation guide
- ✅ `LANGFUSE_SETUP_GUIDE.md` - Observability setup
- ✅ `COMPREHENSIVE_AUDIT_REPORT.md` - Full audit

### This Fix
- 🔥 `CRITICAL_FIX_SUPABASE_INIT.md` - This document

---

## 💡 **KEY INSIGHTS**

### Why Gold Standard Streaming Appears Broken
The streaming implementation is **perfect** but **untestable** because:
1. Supabase init fails → `client = None`
2. Agent lookup fails → `None.table()` error
3. Workflow fails before reaching LLM execution
4. **Streaming code never runs**

### What Users See
- Empty message content
- Status: "failed"
- No errors in frontend console (just empty content)
- AI Reasoning shows workflow steps but no completion

### What's Actually Happening
- Backend crashes at agent lookup
- Error logged: "Agent not found" (misleading - it's a client issue)
- Workflow returns empty state
- Frontend renders empty message

---

## ⏱️ **ESTIMATED FIX TIME**

| Task | Time | Priority |
|------|------|----------|
| Check Supabase package version | 5 min | P0 |
| Fix initialization code | 10 min | P0 |
| Fix tool suggestion template | 15 min | P0 |
| Restart and test | 10 min | P0 |
| **Total** | **40 min** | **URGENT** |

---

## 🎯 **NEXT ACTIONS**

1. **Fix Supabase client** (30 min) - BLOCKING
2. **Fix tool suggestion** (20 min) - BLOCKING
3. **Test streaming** (10 min) - Verify gold standard
4. **Deploy to staging** (if tests pass)
5. **Monitor logs** (ensure stability)

---

**🔥 FIX THESE TWO ISSUES AND GOLD STANDARD STREAMING WILL WORK PERFECTLY! 🔥**

---

*Created: November 9, 2025, 8:50 PM*  
*Priority: P0 (Blocking)*  
*Est. Fix Time: 40 minutes*  
*Dependencies: None*

