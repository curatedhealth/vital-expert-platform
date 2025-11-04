# AI Engine Connection Issue - Quick Fix Guide 🔧

## Current Problem

**Error**: "Gateway error" - API Gateway can't connect to AI Engine

**Root Cause**: AI Engine (Python service on port 8000) has missing dependencies:
- `vital_shared_kernel` module not installed
- Other Python import errors
- Complex dependency chain

---

## ✅ **Quick Solution Options**

### Option 1: Use Mock Mode (Fastest - 2 minutes)

**Enable mock responses** in the frontend to test UI without backend:

1. Create mock mode environment variable
2. Frontend returns simulated AI responses
3. Test all UI features

**Pros**:
- ✅ Works immediately
- ✅ Test UI/UX
- ✅ No backend needed

**Cons**:
- ❌ Not real AI responses
- ❌ Can't test actual AI logic

---

### Option 2: Fix AI Engine Dependencies (30-60 minutes)

**Install all required Python packages**:

```bash
cd services/ai-engine
source venv/bin/activate

# Install missing dependencies
pip install vital-shared-kernel
pip install langchain langchain-community langchain-openai
pip install supabase
pip install redis
pip install prometheus-client
pip install slowapi
pip install structlog

# Restart AI Engine
python3 -m uvicorn src.main:app --reload --port 8000
```

**Pros**:
- ✅ Real AI responses
- ✅ Full functionality

**Cons**:
- ❌ Time-consuming
- ❌ May have more dependency issues
- ❌ Requires Python environment setup

---

### Option 3: Use External AI Service (Alternative)

**Point to a deployed AI Engine** instead of local:

```typescript
// In mode1-manual-interactive.ts
const API_GATEWAY_URL = 'https://your-deployed-ai-engine.com';
```

**Pros**:
- ✅ No local setup needed
- ✅ Real AI responses

**Cons**:
- ❌ Need deployed instance
- ❌ Network latency

---

## 🚀 Recommended: Quick Mock Mode

Since you want to **test the UI features** (agent deletion, consultations, etc.), let's enable mock mode:

### Step 1: Check Current Gateway Status

```bash
curl http://localhost:3001/health
```

**Output**:
```json
{
  "status": "degraded",
  "aiEngine": "disconnected"  ← Problem!
}
```

### Step 2: For Now - Continue Testing UI

**What still works WITHOUT AI Engine**:
- ✅ Create new consultations
- ✅ Delete agents (instant removal)
- ✅ Browse agent store
- ✅ Switch between consultations
- ✅ View chat history
- ✅ UI/UX features

**What doesn't work**:
- ❌ Sending messages to AI
- ❌ Getting AI responses
- ❌ RAG/search features

---

## 💡 What I Recommend

**For immediate testing**:

1. **Test the UI features I just fixed**:
   - ✅ Agent instant deletion (click trash icon - should disappear immediately)
   - ✅ New Consultation button
   - ✅ Recent Consultations list
   - ✅ Terminology changes

2. **For AI responses**, you have 3 choices:
   - **A)** I can set up mock mode (5 minutes)
   - **B)** You fix AI Engine dependencies (30-60 min)
   - **C)** Skip AI testing for now, focus on UI

**Which would you prefer?** 

---

## If You Want Mock Mode

I can quickly add:

```typescript
// Environment variable
NEXT_PUBLIC_USE_MOCK_AI=true

// Mock responses that return:
{
  type: "chunk",
  content: "This is a simulated AI response...",
  metadata: {
    reasoning: ["Analyzed question", "Retrieved sources", "Generated answer"],
    sources: [{ title: "Mock Source", url: "..." }],
    confidence: 0.85
  }
}
```

This lets you **test all the UI features** (reasoning display, citations, streaming) without the AI Engine.

---

## Current Service Status

✅ **Frontend** (port 3000): Running  
✅ **API Gateway** (port 3001): Running (but can't reach AI Engine)  
❌ **AI Engine** (port 8000): Import errors, not starting

---

## Next Steps

**Tell me which option you prefer**:

1. **"Set up mock mode"** - I'll add mock AI responses (5 min)
2. **"Help me fix AI Engine"** - I'll guide you through Python setup (30-60 min)
3. **"Skip AI for now"** - Continue testing UI features only

**For now**, you can:
- Test agent deletion (should be instant!)
- Create/switch consultations
- Browse agents
- Test all sidebar features

The "Gateway error" only affects **sending messages to AI**, not the other features.

What would you like to do? 🤔

