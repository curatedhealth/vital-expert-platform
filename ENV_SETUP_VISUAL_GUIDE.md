# 🎯 Environment Variables - Visual Setup Guide

```
┌─────────────────────────────────────────────────────────────────┐
│                   🔐 VITAL PATH - ENV SETUP                      │
│                                                                  │
│  Follow these steps to configure your environment variables     │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║                         STEP 1: OPEN .ENV FILE                    ║
╚═══════════════════════════════════════════════════════════════════╝

    $ cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
    $ nano .env
    
    (or use your favorite editor: code .env, vim .env, etc.)

╔═══════════════════════════════════════════════════════════════════╗
║              STEP 2: GET SUPABASE KEYS (3 required)               ║
╚═══════════════════════════════════════════════════════════════════╝

    🌐 Open: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/settings/api
    
    Copy these 3 values:
    ┌─────────────────────────────────────────────────────────────┐
    │ 1️⃣  Project URL                                              │
    │    → SUPABASE_URL                                           │
    │    → NEXT_PUBLIC_SUPABASE_URL                               │
    │    → NEW_SUPABASE_URL                                       │
    │                                                              │
    │ 2️⃣  anon / public key                                        │
    │    → SUPABASE_ANON_KEY                                      │
    │    → NEXT_PUBLIC_SUPABASE_ANON_KEY                          │
    │                                                              │
    │ 3️⃣  service_role key (click "Reveal")                        │
    │    → SUPABASE_SERVICE_ROLE_KEY                              │
    │    → NEW_SUPABASE_SERVICE_KEY                               │
    └─────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║               STEP 3: GET OPENAI API KEY (1 required)             ║
╚═══════════════════════════════════════════════════════════════════╝

    🌐 Open: https://platform.openai.com/api-keys
    
    Click "Create new secret key"
    ┌─────────────────────────────────────────────────────────────┐
    │ 4️⃣  OpenAI API Key                                           │
    │    → OPENAI_API_KEY                                         │
    │                                                              │
    │    Looks like: sk-proj-...                                  │
    └─────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║            STEP 4: PASTE INTO .ENV FILE (Copy-Paste This)         ║
╚═══════════════════════════════════════════════════════════════════╝

    # ============ Supabase ============
    SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
    SUPABASE_ANON_KEY=<PASTE_YOUR_ANON_KEY>
    SUPABASE_SERVICE_ROLE_KEY=<PASTE_YOUR_SERVICE_ROLE_KEY>
    
    NEXT_PUBLIC_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<PASTE_YOUR_ANON_KEY>
    
    NEW_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
    NEW_SUPABASE_SERVICE_KEY=<PASTE_YOUR_SERVICE_ROLE_KEY>
    
    # ============ OpenAI ============
    OPENAI_API_KEY=<PASTE_YOUR_OPENAI_KEY>
    OPENAI_MODEL=gpt-4-turbo-preview
    OPENAI_EMBEDDING_MODEL=text-embedding-3-large
    
    # ============ AI Engine ============
    PYTHON_AI_ENGINE_URL=http://localhost:8000
    API_GATEWAY_URL=http://localhost:8080
    NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

╔═══════════════════════════════════════════════════════════════════╗
║                  STEP 5: SAVE & RESTART SERVERS                   ║
╚═══════════════════════════════════════════════════════════════════╝

    1️⃣  Save the .env file
    
    2️⃣  Kill existing servers:
        $ lsof -ti:3000 | xargs kill -9 2>/dev/null
        $ lsof -ti:8000 | xargs kill -9 2>/dev/null
    
    3️⃣  Start frontend:
        $ pnpm --filter @vital/vital-system dev
    
    4️⃣  Start AI Engine (new terminal):
        $ cd services/ai-engine
        $ python3 -m uvicorn src.main:app --reload --port 8000

╔═══════════════════════════════════════════════════════════════════╗
║                       STEP 6: TEST IT! 🎉                         ║
╚═══════════════════════════════════════════════════════════════════╝

    1️⃣  Open browser: http://localhost:3000/designer
    
    2️⃣  Click "Templates" button
    
    3️⃣  Select "Panel Consensus Discussion"
    
    4️⃣  Click "Test Workflow" button
    
    5️⃣  Enter: "What are AI best practices in healthcare?"
    
    6️⃣  Press Enter
    
    ✅ SUCCESS! If you see an AI response, everything works!

┌─────────────────────────────────────────────────────────────────┐
│                         📊 STATUS CHECK                          │
├─────────────────────────────────────────────────────────────────┤
│ ✅ Frontend running?     → http://localhost:3000                │
│ ✅ AI Engine running?    → http://localhost:8000/health         │
│ ✅ Database connected?   → Check Supabase dashboard             │
│ ✅ OpenAI working?       → Test workflow in designer            │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║                   🎯 OPTIONAL: ADD MORE FEATURES                  ║
╚═══════════════════════════════════════════════════════════════════╝

    Want more? Add these optional services:
    
    📍 Pinecone (Vector DB for RAG):
       → Get key: https://www.pinecone.io/
       → Add: PINECONE_API_KEY=your-key-here
       → Add: PINECONE_INDEX_NAME=vital-knowledge
    
    🤖 Anthropic Claude (Alternative LLM):
       → Get key: https://console.anthropic.com/
       → Add: ANTHROPIC_API_KEY=sk-ant-your-key
    
    🔍 Tavily (Web Search):
       → Get key: https://app.tavily.com/
       → Add: TAVILY_API_KEY=tvly-your-key
    
    📊 Langfuse (LLM Monitoring):
       → Get keys: https://cloud.langfuse.com/
       → Add: LANGFUSE_SECRET_KEY=sk-lf-...
       → Add: LANGFUSE_PUBLIC_KEY=pk-lf-...
    
    See ENV_VARIABLES_SETUP_GUIDE.md for 100+ more options!

╔═══════════════════════════════════════════════════════════════════╗
║                         ⚠️ TROUBLESHOOTING                        ║
╚═══════════════════════════════════════════════════════════════════╝

    ❌ "Missing Supabase environment variables"
       Fix: Add ALL Supabase variables (including NEXT_PUBLIC_* ones)
    
    ❌ "OpenAI API error" / "Insufficient credits"
       Fix: Check your OpenAI account has credits
       Visit: https://platform.openai.com/account/billing
    
    ❌ "Cannot connect to database"
       Fix: Check Supabase URL and keys are correct
       Test: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
    
    ❌ "Changes not applying"
       Fix: Restart the dev server after editing .env
    
    ❌ Port already in use
       Fix: Kill existing process:
       $ lsof -ti:3000 | xargs kill -9 2>/dev/null

╔═══════════════════════════════════════════════════════════════════╗
║                        🔒 SECURITY REMINDER                        ║
╚═══════════════════════════════════════════════════════════════════╝

    ⚠️  NEVER commit .env to git!
    ⚠️  .env is already in .gitignore (you're safe)
    ⚠️  Don't share your keys publicly
    ⚠️  Rotate keys if they're exposed
    ⚠️  Use different keys for dev/prod

╔═══════════════════════════════════════════════════════════════════╗
║                         📚 MORE RESOURCES                          ║
╚═══════════════════════════════════════════════════════════════════╝

    📖 Full Setup Guide:       ENV_VARIABLES_SETUP_GUIDE.md
    ⚡ Quick Commands:          QUICK_ENV_SETUP.md
    🚀 Workflow Test Guide:    WORKFLOW_TEST_MODAL.md
    🔧 Main Documentation:     README.md

════════════════════════════════════════════════════════════════════

                   🎊 You're all set! Happy coding! 🎊

════════════════════════════════════════════════════════════════════
```






