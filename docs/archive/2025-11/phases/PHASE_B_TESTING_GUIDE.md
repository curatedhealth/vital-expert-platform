# 🧪 PHASE B: RAILWAY TESTING GUIDE

**Purpose:** Test all functionality on Railway deployment  
**Time:** 30 minutes  
**Prerequisites:** Railway deployment complete (check dashboard)

---

## 📍 STEP 1: GET YOUR RAILWAY URL

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your `vital-expert-platform` project
3. Click on the `vital-ai-engine-v2` service
4. Look for **"Domains"** section
5. Copy the Railway-provided URL (e.g., `https://your-service.up.railway.app`)

**Set this as environment variable for testing:**
```bash
export RAILWAY_URL="https://your-service.up.railway.app"
```

---

## 🏥 STEP 2: HEALTH CHECK

Test the health endpoint first:

```bash
curl $RAILWAY_URL/health

# Expected response:
# {
#   "status": "healthy",
#   "version": "2.0.0",
#   "timestamp": "2025-11-01T..."
# }
```

✅ **If this works, your deployment is live!**

---

## 🧪 STEP 3: TEST MODE 1 (Interactive-Auto)

Multi-turn conversation with automatic agent selection:

```bash
curl -X POST "$RAILWAY_URL/api/ask-expert-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the key FDA IND requirements for Phase 1 trials?",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "user_id": "test-user-001",
    "session_id": "test-session-mode1",
    "enable_rag": true,
    "enable_tools": true,
    "model": "gpt-4-turbo-preview"
  }'

# Expected: JSON response with:
# - "answer": comprehensive response
# - "selected_agents": automatically chosen experts
# - "rag_used": true/false
# - "tools_used": list of tools
# - "conversation_history": []
```

**Test Memory (2nd query in same session):**
```bash
curl -X POST "$RAILWAY_URL/api/ask-expert-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Can you elaborate on the preclinical requirements?",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "user_id": "test-user-001",
    "session_id": "test-session-mode1",
    "enable_rag": true,
    "enable_tools": true
  }'

# Expected: Response should reference previous conversation
```

---

## 🧪 STEP 4: TEST MODE 2 (Interactive-Manual)

Multi-turn with manual agent selection:

```bash
curl -X POST "$RAILWAY_URL/api/ask-expert-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Analyze this clinical trial design",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "user_id": "test-user-001",
    "session_id": "test-session-mode2",
    "selected_agent_ids": ["agent-id-1", "agent-id-2"],
    "enable_rag": true,
    "enable_tools": true
  }'
```

---

## 🧪 STEP 5: TEST MODE 3 (Autonomous-Auto)

One-shot autonomous with automatic agent selection:

```bash
curl -X POST "$RAILWAY_URL/api/ask-expert-autonomous" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Create a comprehensive FDA IND submission timeline with all required documents and milestones",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "user_id": "test-user-001",
    "enable_rag": true,
    "enable_tools": true,
    "cost_limit_usd": 2.0,
    "runtime_limit_minutes": 10
  }' | jq '.'

# Expected: JSON with:
# - "answer": comprehensive autonomous response
# - "reasoning_steps": array of thoughts and actions
# - "tools_executed": list of tools used
# - "goal_achieved": true/false
# - "total_cost_usd": actual cost
# - "session_id": for status tracking
```

**Test Autonomous Controller:**

Save the `session_id` from response, then:

```bash
# Check status during execution
SESSION_ID="<session-id-from-response>"
curl "$RAILWAY_URL/api/autonomous/status/$SESSION_ID" | jq '.'

# Expected:
# {
#   "session_id": "...",
#   "status": "running" | "completed",
#   "current_cost_usd": 0.45,
#   "cost_limit_usd": 2.0,
#   "runtime_minutes": 2.3,
#   "runtime_limit_minutes": 10,
#   "stop_requested": false,
#   "goal_progress": 0.65
# }

# Test stop functionality
curl -X POST "$RAILWAY_URL/api/autonomous/stop" \
  -H "Content-Type: application/json" \
  -d "{\"session_id\": \"$SESSION_ID\"}" | jq '.'

# Expected:
# {
#   "session_id": "...",
#   "stop_requested": true,
#   "message": "Stop request sent..."
# }
```

---

## 🧪 STEP 6: TEST MODE 4 (Autonomous-Manual)

One-shot autonomous with manual agent selection:

```bash
curl -X POST "$RAILWAY_URL/api/ask-expert-autonomous" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Develop detailed regulatory strategy for EU market entry",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "user_id": "test-user-001",
    "selected_agent_ids": ["regulatory-expert-id"],
    "enable_rag": true,
    "enable_tools": true,
    "cost_limit_usd": 3.0,
    "runtime_limit_minutes": 15
  }' | jq '.'
```

---

## 🔗 STEP 7: TEST TOOL CHAINING

Verify tool chaining by asking complex query:

```bash
curl -X POST "$RAILWAY_URL/api/ask-expert-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Research the latest FDA guidance on adaptive clinical trials, compare with EMA guidelines, and provide recommendations",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "user_id": "test-user-001",
    "enable_rag": true,
    "enable_tools": true
  }' | jq '.tools_used'

# Expected: Multiple tools in sequence
# - RAG search for FDA guidance
# - RAG search for EMA guidelines
# - Synthesis tool
```

---

## 📚 STEP 8: TEST RAG INTEGRATION

Test RAG search directly:

```bash
curl -X POST "$RAILWAY_URL/api/rag/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "FDA 510k clearance process",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "max_results": 5
  }' | jq '.'

# Expected:
# {
#   "documents": [
#     {
#       "title": "...",
#       "content": "...",
#       "score": 0.85,
#       "source": "..."
#     }
#   ],
#   "total_results": 5
# }
```

---

## 📊 STEP 9: MONITOR LOGS

In Railway Dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. Look for:
   - ✅ "✅ Mode1/2/3/4 initialized with tool chaining + long-term memory"
   - ✅ "✅ Autonomous controller initialized"
   - ✅ Tool execution logs
   - ✅ Memory recall logs
   - ❌ Any error messages

**Key log indicators:**
```
✅ MemoryIntegrationMixin initialized
✅ ToolChainMixin initialized
✅ Autonomous controller initialized
✅ Tool chain executed: 3 steps
✅ Memory recalled: 5 relevant memories
```

---

## ✅ SUCCESS CRITERIA

Phase B is complete when:
- ✅ Health check returns 200
- ✅ All 4 modes return successful responses
- ✅ Tool chaining executes multiple tools
- ✅ RAG search returns results
- ✅ Autonomous status API works
- ✅ Autonomous stop API works
- ✅ Logs show no critical errors
- ✅ Memory integration logs appear

---

## 🚨 TROUBLESHOOTING

### If health check fails:
- Check Railway deployment status
- Check Railway logs for startup errors
- Verify environment variables are set

### If API returns 500:
- Check Railway logs for stack traces
- Verify Supabase connection
- Check OpenAI API key

### If responses are empty:
- Check if database migration was run
- Verify tenant_id exists in database
- Check RAG domain configuration

---

## 📝 TESTING CHECKLIST

Copy this to track your testing:

```
□ Health endpoint works
□ Mode 1 (Interactive-Auto) works
□ Mode 2 (Interactive-Manual) works
□ Mode 3 (Autonomous-Auto) works
□ Mode 4 (Autonomous-Manual) works
□ Tool chaining works
□ RAG search works
□ Autonomous status API works
□ Autonomous stop API works
□ Memory integration logs visible
□ No critical errors in logs
```

---

**Once all tests pass, you're ready for Phase C (Frontend)!**

