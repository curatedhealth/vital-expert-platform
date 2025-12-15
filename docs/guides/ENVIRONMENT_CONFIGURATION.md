# Environment Configuration Guide

**Version:** 1.0  
**Date:** December 14, 2025  
**Purpose:** Comprehensive guide for environment variable configuration  
**Status:** ✅ Complete

---

## Overview

This guide explains how to configure environment variables for the VITAL Platform across different deployment environments.

---

## Quick Start

### Local Development

1. **Frontend (Next.js):**
   ```bash
   cp .env.example apps/vital-system/.env.local
   # Edit apps/vital-system/.env.local with your values
   ```

2. **Backend (FastAPI):**
   ```bash
   cp .env.example services/ai-engine/.env
   # Edit services/ai-engine/.env with your values
   ```

3. **Docker Compose:**
   ```bash
   cp infrastructure/docker/env.example infrastructure/docker/.env
   # Edit infrastructure/docker/.env with your values
   ```

---

## Environment Files Reference

### Root `.env.example`
**Location:** `/`  
**Purpose:** Comprehensive template for all environment variables  
**Usage:** Copy to `.env.local` (frontend) or `.env` (backend)

**Contains:**
- Frontend (Next.js) variables
- Backend (FastAPI) variables
- Database configuration
- AI provider keys
- Feature flags
- Monitoring configuration

---

### Railway Environment Files

**Location:** `services/ai-engine/`

#### `railway.env.template`
**Purpose:** Template for Railway environment variables  
**Usage:** Reference for setting variables in Railway Dashboard

#### `.railway.env.dev`
**Purpose:** Development environment variables for Railway  
**Status:** ✅ Kept for reference (gitignored)  
**Usage:** Copy values to Railway → ai-engine-dev → Variables

#### `.railway.env.preview`
**Purpose:** Preview/Staging environment variables for Railway  
**Status:** ✅ Kept for reference (gitignored)  
**Usage:** Copy values to Railway → ai-engine-preview → Variables

#### `.railway.env.production`
**Purpose:** Production environment variables for Railway  
**Status:** ✅ Kept for reference (gitignored)  
**Usage:** Copy values to Railway → ai-engine-prod → Variables

**Note:** These files are gitignored but kept in the repository as templates. Never commit actual secrets.

---

### Docker Environment File

**Location:** `infrastructure/docker/env.example`  
**Purpose:** Template for Docker Compose environment variables  
**Usage:** Copy to `infrastructure/docker/.env` for local Docker development

---

### Vercel Environment File

**Location:** `.vercel/env.example`  
**Purpose:** Template for Vercel environment variables  
**Usage:** Set variables in Vercel Dashboard → Settings → Environment Variables

---

## Environment Variables by Category

### Frontend (Next.js) - Public Variables

These variables are prefixed with `NEXT_PUBLIC_` and are exposed to the browser.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Yes | Frontend application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | `eyJhbGc...` |
| `NEXT_PUBLIC_PLATFORM_TENANT_ID` | Yes | Platform tenant UUID | `c1977eb4-...` |
| `NEXT_PUBLIC_STARTUP_TENANT_ID` | No | Startup tenant UUID | `550e8400-...` |

**⚠️ Security Note:** Never put secrets in `NEXT_PUBLIC_` variables. They are visible in the browser.

---

### Frontend (Next.js) - Server-Only Variables

These variables are only available on the server side.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key | `eyJhbGc...` |
| `SUPABASE_JWT_SECRET` | No | Supabase JWT secret | `your-jwt-secret` |
| `NEXTAUTH_SECRET` | Yes | NextAuth secret (min 32 chars) | `your-secret-32-chars` |
| `NEXTAUTH_URL` | Yes | NextAuth callback URL | `http://localhost:3000` |

---

### Backend (FastAPI) - Database

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://...` |
| `SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key | `eyJhbGc...` |
| `SUPABASE_ANON_KEY` | No | Supabase anonymous key | `eyJhbGc...` |
| `DB_POOL_SIZE` | No | Connection pool size | `10` |
| `DB_MAX_OVERFLOW` | No | Max pool overflow | `20` |
| `DB_POOL_TIMEOUT` | No | Pool timeout (seconds) | `30` |

---

### Backend (FastAPI) - AI Providers

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OPENAI_API_KEY` | Yes | OpenAI API key | `sk-...` |
| `ANTHROPIC_API_KEY` | No | Anthropic API key (Claude) | `sk-ant-...` |
| `LANGSMITH_API_KEY` | No | LangSmith API key (tracing) | `lsv2_...` |
| `LANGCHAIN_TRACING_V2` | No | Enable LangChain tracing | `true` |
| `LANGCHAIN_PROJECT` | No | LangChain project name | `vital-dev` |

---

### Backend (FastAPI) - Vector Database

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PINECONE_API_KEY` | No | Pinecone API key | `your-key` |
| `PINECONE_ENVIRONMENT` | No | Pinecone environment | `us-east-1` |
| `PINECONE_INDEX_NAME` | No | Pinecone index name | `vital-production` |

---

### Backend (FastAPI) - Redis

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REDIS_URL` | No | Redis connection URL | `redis://localhost:6379/0` |
| `CELERY_BROKER_URL` | No | Celery broker URL | `redis://localhost:6379/1` |
| `CELERY_RESULT_BACKEND` | No | Celery result backend | `redis://localhost:6379/2` |
| `CACHE_TTL` | No | Cache TTL (seconds) | `3600` |

---

### Backend (FastAPI) - Application Settings

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ENVIRONMENT` | Yes | Environment name | `development` |
| `LOG_LEVEL` | Yes | Logging level | `debug`, `info`, `warning`, `error` |
| `DEBUG` | No | Enable debug mode | `true`, `false` |
| `CORS_ORIGINS` | Yes | Allowed CORS origins | `http://localhost:3000` |
| `PLATFORM_TENANT_ID` | Yes | Platform tenant UUID | `550e8400-...` |
| `RATE_LIMIT_RPM` | No | Rate limit (requests/min) | `1000` |
| `RATE_LIMIT_TPM` | No | Rate limit (tokens/min) | `500000` |
| `WORKERS` | No | Number of workers | `0` (auto) |
| `PYTHONUNBUFFERED` | No | Python unbuffered output | `1` |
| `PYTHONDONTWRITEBYTECODE` | No | Don't write .pyc files | `1` |

---

### Backend (FastAPI) - LangGraph & AI

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EMBEDDING_MODEL` | No | Embedding model name | `all-mpnet-base-v2` |
| `MEMORY_CACHE_TTL` | No | Memory cache TTL (seconds) | `86400` |
| `AUTONOMOUS_COST_LIMIT` | No | Autonomous cost limit ($) | `10.0` |
| `AUTONOMOUS_RUNTIME_LIMIT` | No | Autonomous runtime limit (min) | `30` |
| `MAX_TOOL_CHAIN_LENGTH` | No | Max tool chain length | `5` |
| `TOOL_CHAIN_PLANNING_MODEL` | No | Planning model | `gpt-4-turbo-preview` |
| `TOOL_CHAIN_SYNTHESIS_MODEL` | No | Synthesis model | `gpt-4-turbo-preview` |

---

### Monitoring & Observability

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SENTRY_DSN` | No | Sentry DSN for error tracking | `https://...` |
| `SENTRY_ENVIRONMENT` | No | Sentry environment | `development` |

---

### Feature Flags

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ENABLE_RAG` | No | Enable RAG features | `true`, `false` |
| `ENABLE_LANGGRAPH` | No | Enable LangGraph workflows | `true`, `false` |
| `ENABLE_STREAMING` | No | Enable streaming responses | `true`, `false` |

---

## Deployment Environments

### Local Development

**Frontend:**
- File: `apps/vital-system/.env.local`
- Source: Root `.env.example`

**Backend:**
- File: `services/ai-engine/.env`
- Source: Root `.env.example`

**Docker:**
- File: `infrastructure/docker/.env`
- Source: `infrastructure/docker/env.example`

---

### Vercel (Frontend)

**Configuration:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all `NEXT_PUBLIC_*` variables
3. Add server-only variables (SUPABASE_SERVICE_ROLE_KEY, NEXTAUTH_SECRET, etc.)
4. Set environment-specific values (development, preview, production)

**Reference:** `.vercel/env.example`

---

### Railway (Backend)

**Configuration:**
1. Go to Railway Dashboard → Your Service → Variables
2. Add all backend environment variables
3. Use Railway service references:
   - `REDIS_URL=${{Redis.REDIS_URL}}` (if using Railway Redis)
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}` (if using Railway Postgres)

**Reference Files:**
- `services/ai-engine/railway.env.template` (general template)
- `services/ai-engine/.railway.env.dev` (development)
- `services/ai-engine/.railway.env.preview` (preview/staging)
- `services/ai-engine/.railway.env.production` (production)

---

## Security Best Practices

### ✅ DO:

1. **Use environment-specific files:**
   - Development: `.env.local` (frontend), `.env` (backend)
   - Production: Set in deployment platform (Vercel/Railway)

2. **Keep secrets out of code:**
   - Never commit `.env` files with actual secrets
   - Use `.env.example` as templates only

3. **Use platform secrets management:**
   - Vercel: Environment Variables dashboard
   - Railway: Variables dashboard
   - AWS: Secrets Manager (for Terraform deployments)

4. **Rotate secrets regularly:**
   - API keys
   - Database passwords
   - JWT secrets

5. **Use different keys per environment:**
   - Development keys for dev
   - Production keys for prod
   - Never use production keys in development

### ❌ DON'T:

1. **Don't commit secrets:**
   - Never commit `.env` files with real values
   - Never commit `.railway.env.*` files with secrets
   - Never commit API keys or passwords

2. **Don't use NEXT_PUBLIC_ for secrets:**
   - `NEXT_PUBLIC_*` variables are exposed to the browser
   - Never put API keys or secrets in `NEXT_PUBLIC_*` variables

3. **Don't hardcode values:**
   - Always use environment variables
   - Never hardcode API keys or URLs in code

4. **Don't share secrets:**
   - Don't share `.env` files via email or chat
   - Use secure secret sharing tools (1Password, AWS Secrets Manager, etc.)

---

## Verification

### Check .gitignore Coverage

The `.gitignore` file should exclude:
- ✅ `.env` (all .env files)
- ✅ `.env.local` (local environment files)
- ✅ `.env*.local` (all local env variants)
- ✅ `.railway.env.*` (Railway env files with secrets)
- ✅ `!.railway.env.template` (template is allowed)
- ✅ `.env.bak`, `.env.*.backup` (backup files)

**Status:** ✅ All environment files are properly gitignored

---

## Troubleshooting

### Missing Environment Variables

**Error:** `Environment variable X is not set`

**Solution:**
1. Check if variable is in `.env.example`
2. Copy variable to your `.env.local` or `.env` file
3. Restart the development server
4. For production, set in deployment platform

---

### Frontend Variables Not Available

**Error:** `NEXT_PUBLIC_*` variable is undefined in browser

**Solution:**
1. Ensure variable is prefixed with `NEXT_PUBLIC_`
2. Restart Next.js dev server (variables are loaded at build time)
3. Check Vercel environment variables if deployed

---

### Backend Variables Not Loading

**Error:** Backend can't read environment variable

**Solution:**
1. Check `.env` file is in `services/ai-engine/` directory
2. Ensure variable name matches exactly (case-sensitive)
3. Restart the FastAPI server
4. Check Railway variables if deployed

---

## Reference Files

| File | Location | Purpose |
|------|----------|---------|
| `.env.example` | `/` | Comprehensive template (all variables) |
| `railway.env.template` | `services/ai-engine/` | Railway template |
| `.railway.env.dev` | `services/ai-engine/` | Railway dev example |
| `.railway.env.preview` | `services/ai-engine/` | Railway preview example |
| `.railway.env.production` | `services/ai-engine/` | Railway production example |
| `env.example` | `infrastructure/docker/` | Docker Compose template |
| `env.example` | `.vercel/` | Vercel template |

---

## Next Steps

1. ✅ **Environment Configuration** - COMPLETE
2. ⏳ **Code Directory Audit** - Next (Option 3)
3. ⏳ **Dependencies Audit** - Future (Option 4)

---

**Last Updated:** December 14, 2025  
**Status:** ✅ Complete  
**Next:** Proceed to Option 3: Code Directory Audit
