# 🔄 AI Engine Setup - Current Status

**Last Updated**: November 4, 2025  
**Current Configuration**: **FULL AI ENGINE** ✅

---

## 📊 CURRENT STATUS

### **What's Running**

| Environment | Engine Type | Status | File Used |
|-------------|-------------|--------|-----------|
| **Railway Production** | **Full Engine** | ✅ Deployed | `start.py` → `main.py` |
| **Local Development** | Your choice | ⚙️ Configurable | See below |

---

## 🎯 QUICK ANSWER

**YES, both engines exist, but you're using the FULL ENGINE in production.**

### Files in Your Project:

1. **`start.py`** ✅ **ACTIVE IN PRODUCTION**
   - Starts the **full AI Engine**
   - Imports from `src/main.py`
   - Uses real LangGraph workflows
   - Requires: OpenAI, Supabase, etc.
   - **This is what Railway uses**

2. **`minimal_ai_engine.py`** 💤 **AVAILABLE BUT NOT USED**
   - Standalone minimal engine
   - No external dependencies
   - Mock responses
   - **Only for local development/testing**

3. **`start_minimal.py`** 🔧 **DIAGNOSTIC TOOL**
   - Ultra-minimal diagnostic server
   - Only `/health` and `/debug` endpoints
   - Used for debugging Railway issues
   - **Not a full engine**

---

## 🚀 PRODUCTION CONFIGURATION

### Railway (Production) ✅

**Current Setup**:
```toml
# railway.toml
[deploy]
startCommand = "cd services/ai-engine && python start.py"
```

**Dockerfile**:
```dockerfile
# services/ai-engine/Dockerfile
CMD ["python3", "start.py"]
```

**Result**: **FULL AI ENGINE** with all features:
- ✅ Real LangGraph workflows (Mode 1-4)
- ✅ Multi-branching decision trees
- ✅ 136+ AI agents
- ✅ Real OpenAI GPT-4 calls
- ✅ Supabase database integration
- ✅ RAG pipeline with vector search
- ✅ Redis caching (optional)
- ✅ Real reasoning and citations

---

## 🛠️ LOCAL DEVELOPMENT OPTIONS

### Option 1: Full Engine (Recommended for Full Testing)

**When to use**: Testing complete workflows, database integration

**Setup**:
```bash
cd services/ai-engine

# Set environment variables
export OPENAI_API_KEY=your-key
export SUPABASE_URL=your-url
export SUPABASE_SERVICE_ROLE_KEY=your-key

# Start full engine
python start.py
```

**Requires**:
- OpenAI API key
- Supabase database
- (Optional) Redis, Pinecone

**Pros**:
- ✅ Real AI responses
- ✅ Real database operations
- ✅ Full feature testing

**Cons**:
- ⏳ Requires setup time
- 💰 Costs API credits

---

### Option 2: Minimal Engine (Quick Frontend Development)

**When to use**: Frontend development without backend setup

**Setup**:
```bash
cd services/ai-engine

# Start minimal engine (no dependencies needed)
python minimal_ai_engine.py
```

**Requires**:
- Nothing! Works immediately

**Pros**:
- ✅ Instant startup
- ✅ No API keys needed
- ✅ No database needed
- ✅ Works for frontend testing

**Cons**:
- ❌ Mock responses only
- ❌ No real AI
- ❌ No database persistence

---

## 📋 COMPARISON TABLE

| Feature | Minimal Engine | Full Engine (Production) |
|---------|----------------|--------------------------|
| **LangGraph Workflows** | ❌ Simulated | ✅ Real (Mode 1-4) |
| **Multi-branching** | ❌ No | ✅ 12-20 paths per mode |
| **AI Responses** | ❌ Mock | ✅ Real GPT-4 |
| **Database** | ❌ Not needed | ✅ Supabase |
| **OpenAI API** | ❌ Not needed | ✅ Required |
| **Setup Time** | ✅ Instant | ⚠️ 5-10 min (with keys) |
| **Cost** | ✅ Free | 💰 API usage |
| **Reasoning Steps** | ✅ Mock | ✅ Real |
| **Citations** | ✅ Mock | ✅ Real |
| **Use Case** | Frontend dev | Production / Full testing |

---

## 🎯 RECOMMENDATION

### **For Your Current Setup**

**Production (Railway)**: ✅ **Already using FULL ENGINE** - Perfect!

**Local Development**: Choose based on your needs:

1. **Testing Frontend Only?**
   ```bash
   python minimal_ai_engine.py
   ```
   Fast, no setup needed

2. **Testing Full Workflows?**
   ```bash
   python start.py
   ```
   Real AI, requires environment variables

3. **Debugging Railway Issues?**
   ```bash
   python start_minimal.py
   ```
   Diagnostic server only

---

## 🔄 SWITCHING BETWEEN ENGINES

### To Use Minimal Engine Locally

```bash
cd services/ai-engine
python minimal_ai_engine.py
# Server starts on http://localhost:8000
```

### To Use Full Engine Locally

```bash
cd services/ai-engine

# Option 1: Use environment variables
export OPENAI_API_KEY=your-key
export SUPABASE_URL=your-url
export SUPABASE_SERVICE_ROLE_KEY=your-key
python start.py

# Option 2: Use .env file
cp .env.example .env
# Edit .env with your keys
python start.py
```

### Production (Railway) - Already Set

No changes needed! Railway uses:
- ✅ `start.py` (full engine)
- ✅ All environment variables from Railway dashboard
- ✅ Full features enabled

---

## ✅ SUMMARY

**Current Status**:
- 🚀 **Production (Railway)**: Using **FULL ENGINE** ✅
- 🛠️ **Local Dev**: Both engines available, choose based on needs
- 📁 **Files**:
  - `start.py` → Full engine (production)
  - `minimal_ai_engine.py` → Minimal engine (local dev)
  - `start_minimal.py` → Diagnostic (debugging)

**Bottom Line**: 
- ✅ Production is correctly using the FULL ENGINE
- ✅ Minimal engine still exists for local development
- ✅ You can use either locally based on your needs
- ✅ No changes needed for production deployment

---

## 🎉 YOU'RE ALL SET!

Your production environment is using the **full, production-grade AI Engine** with all features enabled. The minimal engine is just an option for quick local development when you don't want to set up all the dependencies.

**Best of both worlds!** 🚀

