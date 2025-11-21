# ASK EXPERT MODE 1 TEST PLAN

**Date**: November 5, 2025
**Test Setup**: Frontend (localhost:3000) + Railway Backend
**Mode**: Mode 1 - Single Expert Query with Automatic Agent Selection

---

## 🏗️ ARCHITECTURE

```
┌──────────────────────────────────────────────────────────┐
│                    YOUR LOCAL MACHINE                     │
│                                                            │
│  ┌─────────────────────────────────────┐                 │
│  │   Frontend (localhost:3000)          │                 │
│  │   - Next.js App                      │                 │
│  │   - Ask Expert UI                    │                 │
│  │   - Mode 1 Selection                 │                 │
│  └───────────────┬─────────────────────┘                 │
│                  │ HTTP                                    │
│                  ▼                                         │
└──────────────────┼─────────────────────────────────────────┘
                   │
                   │ HTTP Request
                   ▼
┌──────────────────────────────────────────────────────────┐
│                    RAILWAY (CLOUD)                        │
│                                                            │
│  ┌─────────────────────────────────────┐                 │
│  │   API Gateway (Port 3001)            │                 │
│  │   - Node.js Express                  │                 │
│  │   - Route: /api/ask-expert           │                 │
│  └───────────────┬─────────────────────┘                 │
│                  │                                         │
│                  ▼                                         │
│  ┌─────────────────────────────────────┐                 │
│  │   AI Engine (Port 8000)              │                 │
│  │   - Python FastAPI                   │                 │
│  │   - Agent Orchestrator               │                 │
│  │   - RAG Pipeline                     │                 │
│  └─────────────────────────────────────┘                 │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 MODE 1: Single Expert Query (Automatic)

### What Mode 1 Does
1. User sends query: "What are FDA clinical trial regulations?"
2. **Automatic agent selection** - system picks best expert
3. **RAG retrieval** - searches knowledge base
4. **Single expert response** - one expert answers
5. **Citations included** - sources shown

### API Flow
```
User Query
    ↓
Frontend (localhost:3000)
    ↓
POST /api/ask-expert
    ↓
API Gateway (Railway:3001)
    ↓
POST /agent-query
    ↓
AI Engine (Railway:8000)
    ↓
Agent Orchestrator
    ├─ Agent Selector (automatic)
    ├─ RAG Pipeline (context)
    └─ LLM Response
    ↓
Stream back to frontend
```

---

## ⚙️ CONFIGURATION CHECK

### Environment Variables Needed

#### Frontend (.env.local)
```bash
# API Gateway URL (Railway)
NEXT_PUBLIC_API_GATEWAY_URL=https://your-gateway.railway.app
# OR
API_GATEWAY_URL=https://your-gateway.railway.app

# Supabase (for frontend auth/data)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# OpenAI (optional - for client-side features)
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
```

#### API Gateway (Railway)
```bash
AI_ENGINE_URL=http://ai-engine:8000
PORT=3001
```

#### AI Engine (Railway)
```bash
PORT=8000
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🚀 STARTUP COMMANDS

### Step 1: Kill All Servers ✅ DONE
```bash
lsof -ti:3000,3001,8000 | xargs kill -9
```

### Step 2: Start Frontend (Local)
```bash
cd apps/digital-health-startup
PORT=3000 npm run dev
```

### Step 3: Verify Railway Services Running
```bash
# Check API Gateway
curl https://your-gateway.railway.app/health

# Check AI Engine  
curl https://your-ai-engine.railway.app/health
```

---

## 🧪 TEST CASES

### Test 1: Basic Query (Mode 1)
**Action**:
1. Open http://localhost:3000/ask-expert
2. Select "Mode 1: Single Expert Query"
3. Toggle: Automatic = ON
4. Send: "What are FDA clinical trial regulations?"

**Expected**:
- ✅ Agent auto-selected (e.g., Regulatory Expert)
- ✅ Response streams back
- ✅ Citations displayed
- ✅ Sources shown
- ✅ Response completes

**Console Logs to Check**:
```
Frontend:
✅ Sending query to API Gateway...
✅ Stream connected
✅ Receiving chunks...

API Gateway (Railway):
✅ Received /api/ask-expert request
✅ Forwarding to AI Engine
✅ Streaming response back

AI Engine (Railway):
✅ Agent query received
✅ Agent selected: Regulatory Expert
✅ RAG search: 5 sources found
✅ LLM response generated
```

---

### Test 2: Cache Performance (Mode 1)
**Action**:
1. Send same query again
2. Measure response time

**Expected**:
- First query: 2-5 seconds (full RAG + LLM)
- Second query: 50-100ms (cached)
- Console shows: "📦 Returning cached result"

---

### Test 3: Different Query (Mode 1)
**Action**:
Send: "What are the requirements for medical device approval?"

**Expected**:
- Different agent might be selected
- Different sources retrieved
- New response generated

---

### Test 4: Error Handling (Mode 1)
**Action**:
1. Send empty query
2. Send very long query (10,000 characters)
3. Disconnect internet mid-stream

**Expected**:
- ✅ Validation errors shown
- ✅ Graceful error messages
- ✅ No crashes

---

## 🔍 DEBUGGING CHECKLIST

### If Frontend Won't Load
```bash
# Check port 3000 is free
lsof -ti:3000

# Check environment variables
cat apps/digital-health-startup/.env.local | grep API_GATEWAY

# Check Next.js logs
# Look for errors in terminal
```

### If No Response from Backend
```bash
# Test API Gateway health
curl https://your-gateway.railway.app/health

# Test AI Engine health
curl https://your-ai-engine.railway.app/health

# Check Railway logs
# Go to Railway dashboard → View logs

# Test direct API call
curl -X POST https://your-gateway.railway.app/api/ask-expert \
  -H "Content-Type: application/json" \
  -d '{"message":"test","agent":"regulatory-expert","mode":"mode-1"}'
```

### If Agent Selection Fails
- Check: Agent exists in Supabase `agents` table
- Check: Agent has proper configuration
- Check: API Gateway can reach AI Engine

### If RAG Fails
- Check: Pinecone API key in AI Engine
- Check: Knowledge documents exist
- Check: Embeddings generated

---

## 📊 SUCCESS CRITERIA

### ✅ Test PASSES if:
1. Frontend loads on localhost:3000
2. Can navigate to /ask-expert
3. Mode 1 selector visible
4. Can send query
5. Response streams back
6. Citations display
7. No console errors
8. Second query uses cache

### ❌ Test FAILS if:
- Frontend won't start
- 404 on API Gateway
- Timeout waiting for response
- Console errors appear
- No citations shown
- Backend errors in Railway logs

---

## 🎯 EXPECTED PERFORMANCE

### Mode 1 Performance Targets
- **First query** (cold): 2-5 seconds
- **Cached query**: 50-100ms
- **Agent selection**: 200-500ms
- **RAG search**: 500-1000ms
- **LLM generation**: 1-3 seconds

### Network
- **Frontend → Gateway**: 50-150ms (Railway)
- **Gateway → AI Engine**: 10-50ms (internal)
- **Total latency**: +200-500ms (Railway overhead)

---

## 📝 TEST LOG TEMPLATE

```
TEST: Ask Expert Mode 1 - Basic Query
DATE: 2025-11-05
TIME: [Current Time]

SETUP:
- Frontend: localhost:3000 ✅
- API Gateway: Railway (URL: _______) ✅
- AI Engine: Railway (URL: _______) ✅

TEST 1: Basic Query
Query: "What are FDA clinical trial regulations?"
Result: [PASS/FAIL]
Response Time: _____ seconds
Agent Selected: _______
Citations Count: _____
Errors: [None/List]

TEST 2: Cache Performance
First Query Time: _____ seconds
Second Query Time: _____ ms
Cache Hit: [YES/NO]

TEST 3: Different Query  
Query: "What are medical device approval requirements?"
Result: [PASS/FAIL]
Agent Selected: _______

ISSUES FOUND:
- [ ] None
- [ ] [List issues]

OVERALL: [PASS/FAIL]
```

---

## 🚀 READY TO START!

### Commands to Run Now:

```bash
# In Terminal 1 (Frontend)
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
PORT=3000 npm run dev

# Wait for: "Ready on http://localhost:3000"

# In Browser:
# Open http://localhost:3000/ask-expert
# Send test query
```

### What to Watch:
- ✅ Terminal output (no errors)
- ✅ Browser console (no red errors)
- ✅ Railway logs (successful processing)
- ✅ Response quality
- ✅ Citation accuracy

---

**LET'S GO! 🚀**

