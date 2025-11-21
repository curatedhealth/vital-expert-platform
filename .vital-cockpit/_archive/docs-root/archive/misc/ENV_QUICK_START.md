# 🚀 Quick Start - Environment Configuration

## ⚡ TL;DR

1. **Edit ONLY this file**: `apps/digital-health-startup/.env.local`
2. **Run sync script**: `./sync-env.sh`  
3. **Restart services**

## 📝 Update API Keys

```bash
# 1. Edit master config
nano apps/digital-health-startup/.env.local

# 2. Sync to all services
./sync-env.sh

# 3. Restart
# Kill existing
lsof -ti tcp:8080 tcp:3000 | xargs kill -9

# Start backend
cd services/ai-engine && python3 src/main.py > ../../backend.log 2>&1 &

# Start frontend
cd apps/digital-health-startup && pnpm dev > ../../frontend.log 2>&1 &
```

## 🔑 Required Keys

In `apps/digital-health-startup/.env.local`:

```bash
# Required for AI
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_ORG_ID=org-your-org-here

# Required for RAG/Sources
PINECONE_API_KEY=pcsk_your-key-here
PINECONE_INDEX_NAME=vital-knowledge
PINECONE_ENVIRONMENT=us-east-1-aws

# Required for Auth
SUPABASE_SERVICE_ROLE_KEY=your-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here

# Optional
ANTHROPIC_API_KEY=your-key-here
```

## 🎯 Where to Get Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Pinecone**: https://www.pinecone.io/
- **Supabase**: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

## ✅ Verify Sync

```bash
# Check if keys match
diff \
  <(grep "^OPENAI_API_KEY=" apps/digital-health-startup/.env.local) \
  <(grep "^OPENAI_API_KEY=" services/ai-engine/.env)

# Should output nothing if synced correctly
```

## 🔧 Troubleshooting

### Backend shows "Invalid API key"
```bash
./sync-env.sh
cd services/ai-engine && python3 src/main.py
```

### Frontend can't connect
```bash
# Check port
lsof -ti tcp:8080

# Restart backend on port 8080
cd services/ai-engine && PORT=8080 python3 src/main.py
```

## 📁 File Structure

```
VITAL path/
├── apps/digital-health-startup/
│   └── .env.local                    ← ✅ MASTER (edit this)
├── services/
│   ├── ai-engine/
│   │   └── .env                      ← ❌ Auto-synced (don't edit)
│   └── api-gateway/
│       └── .env                      ← ❌ Auto-synced (don't edit)
├── .env.local                        ← ❌ Auto-synced (don't edit)
├── sync-env.sh                       ← 🔄 Sync script
└── ENV_UNIFIED_CONFIGURATION.md      ← 📖 Full docs
```

## 🏷️ Tags

- `TAG: ENV_QUICK_START`
- `TAG: ENV_UNIFIED_CONFIGURATION`
- `TAG: OPENAI_API_KEY_REQUIRED`

