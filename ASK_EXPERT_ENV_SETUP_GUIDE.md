# Ask Expert - Environment Variables Setup Guide

## Overview
This guide will help you configure all required API keys for the Ask Expert functionality.

---

## Required API Keys

### 1. OpenAI API Key (CRITICAL - Phase 1 & 2)

**Purpose**: Powers all LLM interactions, chat responses, and autonomous agent reasoning

**How to Get:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**Add to Vercel:**
```
OPENAI_API_KEY=sk-proj-...your-key-here...
```

**Cost**: Pay-as-you-go pricing
- GPT-4: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- GPT-3.5-Turbo: ~$0.0015 per 1K input tokens, ~$0.002 per 1K output tokens

---

### 2. LangChain API Key (CRITICAL - Monitoring & Tracing)

**Purpose**: Enables LangSmith tracing for debugging, token tracking, and performance monitoring

**How to Get:**
1. Go to https://smith.langchain.com
2. Sign up for a free account
3. Go to Settings → API Keys
4. Create a new API key
5. Copy the key (starts with `lsv2_pt_`)

**Add to Vercel:**
```
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_...your-key-here...
LANGCHAIN_PROJECT=vital-advisory-board
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
```

**Cost**: Free tier available with generous limits
- Free: 5K traces/month
- Plus: $39/month for 50K traces/month

---

### 3. Tavily API Key (REQUIRED - Phase 2 Web Search Tool)

**Purpose**: Powers web search tool for autonomous research and real-time information retrieval

**How to Get:**
1. Go to https://tavily.com
2. Sign up for an account
3. Go to API section
4. Copy your API key (starts with `tvly-`)

**Add to Vercel:**
```
TAVILY_API_KEY=tvly-...your-key-here...
```

**Cost**: Free tier available
- Free: 1,000 searches/month
- Pro: $50/month for 10,000 searches/month

---

### 4. HuggingFace API Key (REQUIRED - Phase 2 Embeddings)

**Purpose**: Powers vector embeddings for semantic search, RAG, and long-term memory

**How to Get:**
1. Go to https://huggingface.co
2. Sign up for an account
3. Go to Settings → Access Tokens
4. Create a new token with "Read" permissions
5. Copy the token (starts with `hf_`)

**Add to Vercel:**
```
HUGGINGFACE_API_KEY=hf_...your-key-here...
```

**Cost**: Free for inference API
- Completely free for most embedding models
- No credit card required

---

## How to Add to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project "vital-expert"
3. Go to **Settings** → **Environment Variables**
4. For each variable:
   - Click "Add New"
   - Enter the **Key** (e.g., `OPENAI_API_KEY`)
   - Enter the **Value** (your API key)
   - Select **Production**, **Preview**, and **Development**
   - Click "Save"

5. After adding all variables, click "Redeploy" or run:
   ```bash
   vercel --prod
   ```

### Method 2: Via Vercel CLI

```bash
# Add each variable
vercel env add OPENAI_API_KEY production
vercel env add LANGCHAIN_API_KEY production
vercel env add LANGCHAIN_TRACING_V2 production
vercel env add LANGCHAIN_PROJECT production
vercel env add LANGCHAIN_ENDPOINT production
vercel env add TAVILY_API_KEY production
vercel env add HUGGINGFACE_API_KEY production

# Then redeploy
vercel --prod
```

### Method 3: Via .env.local (Local Development Only)

Create a `.env.local` file in the project root:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# LangChain Tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_...
LANGCHAIN_PROJECT=vital-advisory-board
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com

# Tavily Web Search
TAVILY_API_KEY=tvly-...

# HuggingFace
HUGGINGFACE_API_KEY=hf_...

# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Note**: `.env.local` is for local development only and is NOT deployed to Vercel.

---

## Verification

### Check if API Keys are Working

1. **OpenAI**: 
   - Go to `/ask-expert`
   - Select an agent
   - Send a message
   - Should get a streaming response

2. **LangChain Tracing**:
   - Go to https://smith.langchain.com/projects
   - Select "vital-advisory-board" project
   - Should see traces appearing after using Ask Expert

3. **Tavily**:
   - Use autonomous mode with a query requiring web search
   - Check LangSmith traces for "tavily_search_results" tool calls

4. **HuggingFace**:
   - Use a query that triggers RAG (knowledge retrieval)
   - Check logs for embedding generation

### Check Environment Variables in Vercel

```bash
vercel env ls
```

Should show all your configured variables.

---

## Priority Setup

### Minimum Required (Phase 1 - Manual Chat)
1. ✅ OPENAI_API_KEY
2. ✅ Supabase keys (already configured)

**With these, you can**:
- Chat with 372 agents
- Get streaming responses
- Save conversation history

### Recommended (Phase 2 - Full Autonomous)
3. ✅ LANGCHAIN_API_KEY + LANGCHAIN_TRACING_V2
4. ✅ TAVILY_API_KEY
5. ✅ HUGGINGFACE_API_KEY

**With these, you can**:
- Use autonomous research mode
- Execute 15+ tools (FDA, PubMed, clinical trials, web search)
- RAG with 5 retrieval strategies
- Long-term memory and learning
- Full monitoring and debugging

---

## Cost Estimates

### Low Usage (Testing)
- **OpenAI**: $5-10/month
- **LangChain**: Free tier
- **Tavily**: Free tier
- **HuggingFace**: Free
- **Total**: ~$5-10/month

### Medium Usage (Active Development)
- **OpenAI**: $50-100/month
- **LangChain**: Free tier
- **Tavily**: Free tier
- **HuggingFace**: Free
- **Total**: ~$50-100/month

### High Usage (Production)
- **OpenAI**: $200-500/month
- **LangChain**: $39/month (Plus plan)
- **Tavily**: $50/month (Pro plan)
- **HuggingFace**: Free
- **Total**: ~$289-589/month

---

## Security Best Practices

### ✅ DO:
- Store API keys in Vercel environment variables only
- Use different keys for production vs development
- Rotate keys regularly (every 90 days)
- Monitor usage in each platform's dashboard
- Set spending limits where available

### ❌ DON'T:
- Commit API keys to Git
- Share keys in Slack/email
- Use production keys for development
- Expose keys in client-side code

---

## Troubleshooting

### "OpenAI API error: Unauthorized"
- Check if `OPENAI_API_KEY` is set in Vercel
- Verify key is valid on OpenAI dashboard
- Ensure key starts with `sk-`
- Redeploy after adding key

### "LangSmith traces not appearing"
- Check if `LANGCHAIN_TRACING_V2=true` is set
- Verify `LANGCHAIN_API_KEY` is valid
- Check if project name matches: `vital-advisory-board`
- May take 1-2 minutes for traces to appear

### "Tavily search failing"
- Check if `TAVILY_API_KEY` is set
- Verify you haven't exceeded free tier limit
- Check Tavily dashboard for usage

### "Embedding generation failed"
- Check if `HUGGINGFACE_API_KEY` is set
- Verify token has "Read" permissions
- HuggingFace API may be rate-limited (wait 1 minute)

---

## Quick Start Checklist

- [ ] Create OpenAI account and get API key
- [ ] Create LangChain/LangSmith account and get API key
- [ ] Create Tavily account and get API key
- [ ] Create HuggingFace account and get token
- [ ] Add all keys to Vercel environment variables
- [ ] Redeploy to production
- [ ] Test `/ask-expert` page
- [ ] Check LangSmith for traces
- [ ] Test autonomous mode with tools
- [ ] Monitor usage in each platform

---

## Support Resources

- **OpenAI**: https://platform.openai.com/docs
- **LangChain**: https://docs.smith.langchain.com
- **Tavily**: https://docs.tavily.com
- **HuggingFace**: https://huggingface.co/docs

---

## Next Steps After Setup

1. ✅ Add all API keys to Vercel
2. ✅ Redeploy: `vercel --prod`
3. ✅ Run database migration: `curl -X POST https://your-url.vercel.app/api/migrate-memory`
4. ✅ Test manual chat mode at `/ask-expert`
5. ✅ Test autonomous mode (when UI is added)
6. ✅ Check LangSmith traces for monitoring

---

**Need Help?** Check the deployment status in `ASK_EXPERT_DEPLOYMENT_STATUS.md` for detailed implementation information.
