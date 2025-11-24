# 🚀 Quick Commands - Add Environment Variables

## Method 1: Use Terminal (Fastest)

```bash
# Navigate to project root
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Open .env file in your editor
nano .env

# Or use VS Code
code .env

# Or use your default text editor
open .env
```

---

## Method 2: Copy/Paste Template

Add these **MINIMUM REQUIRED** variables to your `.env` file:

```bash
# Supabase (Get from: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/settings/api)
SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
NEXT_PUBLIC_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Aliases for compatibility
NEW_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEW_SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# OpenAI (Get from: https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# AI Engine URLs
PYTHON_AI_ENGINE_URL=http://localhost:8000
API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
```

---

## Method 3: One-Line Command (Advanced)

```bash
cat >> .env << 'EOF'
# Supabase
SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
NEXT_PUBLIC_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
NEW_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEW_SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# OpenAI
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# AI Engine
PYTHON_AI_ENGINE_URL=http://localhost:8000
API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
EOF
```

**Then edit the file to replace placeholder values!**

---

## 🔑 Get Your API Keys

### Supabase Keys
```bash
# Open Supabase dashboard
open https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/settings/api
```

Copy these values:
- **Project URL** → `SUPABASE_URL`
- **anon public** key → `SUPABASE_ANON_KEY`  
- **service_role** key (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

### OpenAI Key
```bash
# Open OpenAI API keys page
open https://platform.openai.com/api-keys
```

Click "Create new secret key" and copy it → `OPENAI_API_KEY`

---

## ✅ Verify Setup

```bash
# Check if .env file exists
ls -la .env

# View (partial) contents (be careful, contains secrets!)
head -10 .env

# Count lines (should have at least 13 lines for minimum config)
wc -l .env
```

---

## 🔄 Restart Services After Adding Variables

```bash
# Kill existing servers
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Start frontend (run in project root)
pnpm --filter @vital/vital-system dev

# Start AI Engine (run in new terminal)
cd services/ai-engine
python3 -m uvicorn src.main:app --reload --port 8000
```

---

## 🧪 Test Everything Works

```bash
# Open the designer
open http://localhost:3000/designer

# Test API connection
curl http://localhost:3000/api/health

# Test AI Engine
curl http://localhost:8000/health
```

Then in the browser:
1. Click **Templates**
2. Select "Panel Consensus Discussion"
3. Click **Test Workflow**
4. Enter: "What are AI best practices in healthcare?"
5. ✅ If you get an AI response, everything works!

---

## ⚠️ Common Issues

### Issue: "Missing Supabase environment variables"
**Fix:** Make sure you've added ALL Supabase variables (including `NEXT_PUBLIC_*` versions)

### Issue: "OpenAI API error"
**Fix:** Check your OpenAI key is valid and has credits

### Issue: "Changes not applying"
**Fix:** Restart the dev server after adding env variables

### Issue: ".env file ignored by git"
**Fix:** This is correct! Never commit `.env` to git

---

## 📚 Full Documentation

See `ENV_VARIABLES_SETUP_GUIDE.md` for:
- Complete list of all 100+ available environment variables
- Optional services (Pinecone, Anthropic, Tavily, etc.)
- Monitoring & observability setup
- Production deployment guides

---

**🎯 Quick Tip:** Start with just the minimum required variables above, then add optional ones as needed!

