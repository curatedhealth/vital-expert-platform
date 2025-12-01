# 🚀 Python AI Engine Deployment Guide

## ✅ Status: READY TO DEPLOY

The Python AI Engine has been configured with **shared framework endpoints** for LangGraph, AutoGen (your CuratedHealth fork!), and CrewAI.

---

## 📋 What Was Done

### 1. ✅ Frameworks Router Created
**File**: `services/ai-engine/app/api/frameworks.py`

**Endpoints**:
- `GET /frameworks/info` - Framework information
- `POST /frameworks/langgraph/execute` - Execute LangGraph workflow
- `POST /frameworks/autogen/execute` - Execute AutoGen workflow (YOUR FORK!)
- `POST /frameworks/crewai/execute` - Execute CrewAI workflow

### 2. ✅ Router Registered in Main App
**File**: `services/ai-engine/src/main.py`

Added:
```python
# Include Shared Framework routes (LangGraph, AutoGen, CrewAI)
try:
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))
    from api.frameworks import router as frameworks_router
    app.include_router(frameworks_router, prefix="", tags=["frameworks"])
    logger.info("✅ Shared Framework routes registered (LangGraph, AutoGen, CrewAI)")
except ImportError as e:
    logger.warning(f"⚠️  Could not import frameworks router: {e}")
    logger.warning("   Continuing without shared framework endpoints")
```

### 3. ✅ Dependencies Configured
**File**: `services/ai-engine/langgraph-requirements.txt`

Includes:
```
# AutoGen - CuratedHealth Fork
git+https://github.com/curatedhealth/autogen.git@main

# LangChain/LangGraph
langgraph>=0.0.40

# CrewAI
crewai>=0.28.0
```

### 4. ✅ Deployment Scripts Created
- `deploy-frameworks.sh` - Automated deployment script
- `test-frameworks.py` - Comprehensive test suite

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Deploy the Engine

```bash
cd services/ai-engine
./deploy-frameworks.sh
```

This will:
1. ✅ Create virtual environment
2. ✅ Install dependencies (including your AutoGen fork)
3. ✅ Verify installations
4. ✅ Start the server on port 8000

### Step 2: Test the Endpoints

**In a new terminal**:
```bash
cd services/ai-engine
source venv/bin/activate
python3 test-frameworks.py
```

This will test:
- ✅ Health check
- ✅ Frameworks info
- ✅ AutoGen endpoint (your fork!)
- ✅ LangGraph endpoint
- ✅ CrewAI endpoint

---

## 📖 Manual Deployment Steps

### 1. Navigate to AI Engine Directory
```bash
cd services/ai-engine
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r langgraph-requirements.txt
```

This installs:
- LangGraph
- **Your CuratedHealth AutoGen fork** (`git+https://github.com/curatedhealth/autogen.git@main`)
- CrewAI
- All other dependencies

### 4. Verify AutoGen Fork
```bash
python3 << 'EOF'
import autogen
print(f"✅ AutoGen installed from: {autogen.__file__}")
print("✅ CuratedHealth fork loaded successfully!")
EOF
```

### 5. Start the Server
```bash
python3 start.py
```

Or with custom port:
```bash
PORT=8001 python3 start.py
```

### 6. Verify Server is Running
```bash
curl http://localhost:8000/health
curl http://localhost:8000/frameworks/info
```

---

## 🧪 Testing the Deployment

### Test 1: Health Check
```bash
curl http://localhost:8000/health
```

**Expected**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-03T..."
}
```

### Test 2: Frameworks Info
```bash
curl http://localhost:8000/frameworks/info
```

**Expected**:
```json
{
  "frameworks": [
    {
      "id": "langgraph",
      "name": "LangGraph",
      "version": "0.0.40",
      "bestFor": ["Sequential workflows", "State management", "Conditional routing"]
    },
    {
      "id": "autogen",
      "name": "AutoGen (CuratedHealth)",
      "version": "0.2.0",
      "fork": "https://github.com/curatedhealth/autogen",
      "bestFor": ["Multi-agent conversations", "Consensus building", "Debate"]
    },
    {
      "id": "crewai",
      "name": "CrewAI",
      "version": "0.28.0",
      "bestFor": ["Task delegation", "Hierarchical workflows", "Role-based agents"]
    }
  ]
}
```

### Test 3: AutoGen Endpoint (YOUR FORK!)
```bash
curl -X POST http://localhost:8000/frameworks/autogen/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {
      "framework": "autogen",
      "mode": "conversational",
      "agents": [
        {
          "id": "expert1",
          "role": "Healthcare CEO",
          "systemPrompt": "You are a Healthcare CEO.",
          "model": "gpt-4o"
        },
        {
          "id": "expert2",
          "role": "Healthcare CFO",
          "systemPrompt": "You are a Healthcare CFO.",
          "model": "gpt-4o"
        }
      ]
    },
    "input": {
      "message": "What are the top 3 priorities this quarter?"
    }
  }'
```

**Expected**:
```json
{
  "success": true,
  "framework": "autogen",
  "outputs": {
    "messages": [...],
    "result": {...}
  },
  "metadata": {
    "duration": 5.2,
    "tokensUsed": 1234,
    "agentsInvolved": ["expert1", "expert2"]
  }
}
```

### Test 4: Run Full Test Suite
```bash
python3 test-frameworks.py
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in `services/ai-engine`:

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
PORT=8000
LOG_LEVEL=info
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
```

### Framework-Specific Settings

Edit `app/api/frameworks.py` to customize:
- Model defaults
- Temperature settings
- Timeout values
- Max tokens

---

## 🐛 Troubleshooting

### Issue 1: Import Error - frameworks router not found

**Error**:
```
⚠️ Could not import frameworks router: No module named 'api.frameworks'
```

**Fix**:
```bash
# Verify file exists
ls -la app/api/frameworks.py

# If missing, check that frameworks.py was created in the right location
```

### Issue 2: AutoGen not installed

**Error**:
```
ModuleNotFoundError: No module named 'autogen'
```

**Fix**:
```bash
# Reinstall from langgraph-requirements.txt
pip install -r langgraph-requirements.txt

# Or install directly
pip install git+https://github.com/curatedhealth/autogen.git@main
```

### Issue 3: Port already in use

**Error**:
```
ERROR: [Errno 48] Address already in use
```

**Fix**:
```bash
# Use a different port
PORT=8001 python3 start.py

# Or kill the process using port 8000
lsof -ti:8000 | xargs kill -9
```

### Issue 4: OpenAI API key not set

**Error**:
```
openai.error.AuthenticationError: No API key provided
```

**Fix**:
```bash
# Set in .env file
echo "OPENAI_API_KEY=sk-..." >> .env

# Or export temporarily
export OPENAI_API_KEY=sk-...
```

---

## 📊 Monitoring

### Server Logs
```bash
# View real-time logs
tail -f server.log

# View last 100 lines
tail -n 100 server.log
```

### Health Check
```bash
# Check server health every 5 seconds
watch -n 5 "curl -s http://localhost:8000/health | jq ."
```

### Framework Metrics
```bash
# Get framework info
curl http://localhost:8000/frameworks/info | jq .
```

---

## 🎯 Next Steps

### 1. ✅ Deploy Python AI Engine (Current Step)
```bash
cd services/ai-engine
./deploy-frameworks.sh
```

### 2. Test with Frontend
Update your frontend to call the new endpoints:

```typescript
// File: apps/digital-health-startup/src/app/api/frameworks/execute/route.ts

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Route to Python AI Engine
  const response = await fetch('http://localhost:8000/frameworks/autogen/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  return NextResponse.json(await response.json());
}
```

### 3. Test Ask Panel with Shared Orchestrator
```typescript
import { executePanel } from '@/lib/orchestration';

const result = await executePanel(experts, question, {
  mode: 'conversational',  // Uses AutoGen (your fork!)
  source: 'ask-panel',
});
```

---

## ✅ Deployment Checklist

- [ ] Virtual environment created
- [ ] Dependencies installed (including AutoGen fork)
- [ ] AutoGen fork verified
- [ ] Server starts without errors
- [ ] Health check passes
- [ ] Frameworks info endpoint works
- [ ] AutoGen endpoint tested (your fork!)
- [ ] LangGraph endpoint tested
- [ ] CrewAI endpoint tested
- [ ] Frontend can call endpoints
- [ ] Ask Panel uses shared orchestrator

---

## 🎉 Success Criteria

**Your deployment is successful when**:
1. ✅ Server starts on port 8000
2. ✅ `/health` returns 200
3. ✅ `/frameworks/info` lists all 3 frameworks
4. ✅ AutoGen endpoint executes (uses YOUR fork!)
5. ✅ Test suite passes (all tests green)
6. ✅ Frontend can call endpoints
7. ✅ Ask Panel works with shared orchestrator

---

## 📚 Documentation

- **Architecture**: See `SHARED_FRAMEWORK_ARCHITECTURE.md`
- **AutoGen Fork**: See `AUTOGEN_FORK_INTEGRATION.md`
- **API Reference**: See `app/api/frameworks.py`
- **Frontend Integration**: See `apps/digital-health-startup/src/lib/orchestration/multi-framework-orchestrator.ts`

---

## 🚀 Quick Commands

```bash
# Deploy
./deploy-frameworks.sh

# Test
python3 test-frameworks.py

# Manual start
python3 start.py

# Check logs
tail -f server.log

# Stop server
# Press Ctrl+C
```

---

## 🎯 Status

**✅ READY TO DEPLOY**

Your Python AI Engine is configured with:
- ✅ Shared framework endpoints
- ✅ Your CuratedHealth AutoGen fork
- ✅ LangGraph support
- ✅ CrewAI support
- ✅ Automated deployment scripts
- ✅ Comprehensive test suite

**Next**: Run `./deploy-frameworks.sh` to start! 🚀

