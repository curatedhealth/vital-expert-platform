# 🤖 Multi-LLM Provider Setup Guide

This guide covers how to set up and use multiple LLM providers in the Vital Expert Platform.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Supported LLM Providers](#supported-llm-providers)
3. [Environment Variables](#environment-variables)
4. [Vercel Deployment](#vercel-deployment)
5. [Using Different Providers](#using-different-providers)

---

## 🚀 Quick Start

### Minimum Required Variables

Copy these to `apps/digital-health-startup/.env.local`:

```bash
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# OpenAI (Required for Ask Panel embeddings)
OPENAI_API_KEY=sk-proj-...

# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Redis (Caching)
REDIS_URL=redis://localhost:6379

# Security (Generate with: openssl rand -base64 32)
JWT_SECRET=your-32-char-secret
ENCRYPTION_KEY=your-32-char-secret
CSRF_SECRET=your-32-char-secret
```

---

## 🌐 Supported LLM Providers

### 1. **OpenAI** (Required)

**Use Case**: Embeddings for Ask Panel, GPT-4 for consultations

```bash
OPENAI_API_KEY=sk-proj-...
OPENAI_ORG_ID=org-...  # Optional
```

- **Get API Key**: https://platform.openai.com/api-keys
- **Models**: GPT-4, GPT-3.5, text-embedding-3-small
- **Cost**: $$$

---

### 2. **Anthropic Claude** (Recommended)

**Use Case**: Medical consultations, complex reasoning

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

- **Get API Key**: https://console.anthropic.com/settings/keys
- **Models**: Claude 3.5 Sonnet, Claude 3 Opus
- **Cost**: $$
- **Benefits**: Excellent for medical reasoning, longer context windows

---

### 3. **Google Gemini** (Good Alternative)

**Use Case**: Multi-modal tasks, cost-effective

```bash
GOOGLE_API_KEY=AIzaSy...
GOOGLE_GEMINI_MODEL=gemini-1.5-pro  # or gemini-1.5-flash
```

- **Get API Key**: https://makersuite.google.com/app/apikey
- **Models**: Gemini 1.5 Pro, Gemini 1.5 Flash
- **Cost**: $ (Most cost-effective)
- **Benefits**: Fast, multimodal, large context window (1M tokens)

---

### 4. **Groq** (Fastest)

**Use Case**: Real-time responses, low latency

```bash
GROQ_API_KEY=gsk_...
```

- **Get API Key**: https://console.groq.com/keys
- **Models**: Llama 3, Mixtral, Gemma
- **Cost**: $ (Free tier available)
- **Benefits**: **Extremely fast** (100+ tokens/sec), open source models

---

### 5. **Together AI** (Open Source)

**Use Case**: Open source models, cost control

```bash
TOGETHER_API_KEY=...
```

- **Get API Key**: https://api.together.xyz/settings/api-keys
- **Models**: Llama 3, Mistral, CodeLlama, medical models
- **Cost**: $
- **Benefits**: Access to specialized medical models

---

### 6. **HuggingFace** (Medical Specialists)

**Use Case**: Medical-specific models

```bash
HUGGINGFACE_API_KEY=hf_...
HUGGINGFACE_MEDICAL_MODEL=epfl-llm/meditron-70b
HUGGINGFACE_CLINICAL_MODEL=microsoft/BioGPT-Large
```

- **Get API Key**: https://huggingface.co/settings/tokens
- **Models**: Meditron, BioGPT, Clinical-BERT
- **Cost**: Varies
- **Benefits**: Domain-specific medical training

---

### 7. **Mistral AI**

**Use Case**: European data sovereignty, strong performance

```bash
MISTRAL_API_KEY=...
```

- **Get API Key**: https://console.mistral.ai/
- **Models**: Mistral Large, Mistral Medium
- **Cost**: $$
- **Benefits**: GDPR compliant, European hosting

---

### 8. **Cohere**

**Use Case**: Embeddings, classification, reranking

```bash
COHERE_API_KEY=...
```

- **Get API Key**: https://dashboard.cohere.com/api-keys
- **Models**: Command, Embed v3
- **Cost**: $$
- **Benefits**: Excellent for semantic search and RAG

---

### 9. **Replicate**

**Use Case**: Access to various open source models

```bash
REPLICATE_API_TOKEN=r8_...
```

- **Get API Key**: https://replicate.com/account/api-tokens
- **Models**: Llama 3, Mixtral, Stable Diffusion
- **Cost**: Pay-per-use
- **Benefits**: Easy access to bleeding-edge models

---

## 🔑 Environment Variables

### For Vercel (Frontend)

All environment variables listed in `ENV_TEMPLATE.md` should be added to:

**Vercel Dashboard** → **Project Settings** → **Environment Variables**

### Critical Variables for Production:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# LLM Providers (add all you want to use)
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GOOGLE_API_KEY=...
GROQ_API_KEY=...

# Security
JWT_SECRET=...
ENCRYPTION_KEY=...
CSRF_SECRET=...

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=...

# Database
DATABASE_URL=...
REDIS_URL=...
```

---

## 📦 Vercel Deployment Setup

### Step 1: Add Environment Variables to Vercel

```bash
# Via Vercel CLI
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add GOOGLE_API_KEY
vercel env add GROQ_API_KEY
# ... add all variables

# Or via Vercel Dashboard:
# 1. Go to https://vercel.com/your-team/vital-expert
# 2. Settings → Environment Variables
# 3. Add each variable for Production, Preview, and Development
```

### Step 2: Redeploy

```bash
vercel --prod
# Or push to GitHub to trigger automatic deployment
```

---

## 🎯 Using Different Providers

### Option 1: Provider Selection in Code

Update `agent-recommendation-engine.ts` to support multiple providers:

```typescript
// Get the LLM client based on environment
function getLLMClient() {
  // Priority: Groq (fastest) → OpenAI → Anthropic → Google
  if (process.env.GROQ_API_KEY) {
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  throw new Error('No LLM provider configured');
}
```

### Option 2: Use LangChain (Recommended)

LangChain provides a unified interface for all providers:

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Dynamic model selection
const model = process.env.GROQ_API_KEY
  ? new ChatOpenAI({ 
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    })
  : new ChatAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
```

---

## 💰 Cost Optimization Strategy

### Recommended Provider Mix:

1. **Embeddings**: OpenAI `text-embedding-3-small` (required for Ask Panel)
2. **Simple queries**: Groq with Llama 3 (fast + cheap)
3. **Complex medical reasoning**: Anthropic Claude 3.5 Sonnet
4. **Bulk processing**: Google Gemini 1.5 Flash (cost-effective)
5. **Specialized medical**: HuggingFace Meditron

### Example Configuration:

```bash
# Primary providers
OPENAI_API_KEY=sk-proj-...      # For embeddings
GROQ_API_KEY=gsk_...            # For fast responses

# Fallback providers
ANTHROPIC_API_KEY=sk-ant-...    # For complex cases
GOOGLE_API_KEY=AIzaSy...        # For cost savings
```

---

## 🔒 Security Best Practices

### 1. **Never commit `.env.local` to Git**

Already in `.gitignore`:
```
.env*.local
.env.local
```

### 2. **Use different keys for dev/staging/production**

```bash
# Development
OPENAI_API_KEY=sk-proj-dev-...

# Production (in Vercel)
OPENAI_API_KEY=sk-proj-prod-...
```

### 3. **Rotate keys regularly**

Set calendar reminders to rotate API keys every 90 days.

### 4. **Use environment-specific keys**

Vercel allows setting different values per environment:
- **Production**: Production API keys
- **Preview**: Staging API keys
- **Development**: Development API keys

---

## ✅ Verification Checklist

- [ ] All required variables set in `.env.local`
- [ ] All variables added to Vercel dashboard
- [ ] API keys tested and working
- [ ] Security keys generated (32+ characters)
- [ ] Sentry DSN configured
- [ ] Railway backend URL configured
- [ ] Dev server runs without errors: `pnpm dev`
- [ ] Production build succeeds: `pnpm build`

---

## 🆘 Troubleshooting

### "OPENAI_API_KEY is missing"

**Solution**: Add to `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-your-key
```

### "Module not found" errors on Vercel

**Solution**: Ensure all variables are set in Vercel dashboard, then redeploy.

### API calls failing in production

**Solution**: Check Vercel deployment logs and ensure:
1. Environment variables are set for **Production** environment
2. API keys are valid and not rate-limited
3. Check Sentry for detailed error messages

---

## 📚 Additional Resources

- [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) - Complete environment variables reference
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Groq API Docs](https://console.groq.com/docs)
- [LangChain Docs](https://js.langchain.com/docs)

---

## 🎉 Next Steps

1. Copy `ENV_TEMPLATE.md` values to `.env.local`
2. Generate security keys: `openssl rand -base64 32`
3. Add all variables to Vercel dashboard
4. Test locally: `pnpm dev`
5. Deploy to Vercel: `vercel --prod`
6. Monitor with Sentry: https://sentry.io

---

**Need Help?** Check the logs:
- **Local**: Terminal output
- **Vercel**: Dashboard → Deployments → [Your deployment] → Logs
- **Sentry**: Dashboard → Issues

