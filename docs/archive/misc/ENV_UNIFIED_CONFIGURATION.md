# 🔑 Unified Environment Configuration

## Overview

**TAG: ENV_UNIFIED_CONFIGURATION**

All services now use a **single source of truth** for environment variables to prevent API key mismatches and "Invalid API key" errors.

## Master Configuration File

```
apps/digital-health-startup/.env.local
```

This is the **ONLY file** you should edit when updating API keys.

## Synced Files

The following files are automatically synced from the master `.env.local`:

1. `services/ai-engine/.env` - Python AI Engine (Port 8080)
2. `services/api-gateway/.env` - API Gateway
3. `.env.local` (root) - Root configuration

## Critical Keys Synced

- ✅ `OPENAI_API_KEY` - OpenAI API key (Required for AI)
- ✅ `OPENAI_ORG_ID` - OpenAI Organization ID
- ✅ `PINECONE_API_KEY` - Pinecone vector database (Required for RAG)
- ✅ `PINECONE_INDEX_NAME` - Pinecone index name
- ✅ `PINECONE_ENVIRONMENT` - Pinecone environment
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role (Required for auth)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- ✅ `ANTHROPIC_API_KEY` - Anthropic/Claude API key (Optional)

## Usage

### 1. Update Master Configuration

Edit the master file:
```bash
nano apps/digital-health-startup/.env.local
```

### 2. Sync to All Services

Run the sync script:
```bash
./sync-env.sh
```

### 3. Restart Services

```bash
# Frontend
cd apps/digital-health-startup && pnpm dev

# Backend
cd services/ai-engine && python3 src/main.py
```

## Automatic Sync (Recommended)

Add this to your workflow:

```bash
# Before starting services
./sync-env.sh && \
cd apps/digital-health-startup && pnpm dev &
cd services/ai-engine && python3 src/main.py &
```

## Troubleshooting

### "Invalid API key" errors

1. Check the master `.env.local`:
   ```bash
   grep "^OPENAI_API_KEY=" apps/digital-health-startup/.env.local
   ```

2. Run sync script:
   ```bash
   ./sync-env.sh
   ```

3. Restart all services

### Keys don't match

If you see API key mismatches:

```bash
# Check current keys
echo "Master:" && grep "^OPENAI_API_KEY=" apps/digital-health-startup/.env.local | cut -c1-40
echo "Backend:" && grep "^OPENAI_API_KEY=" services/ai-engine/.env | cut -c1-40

# Force re-sync
./sync-env.sh
```

## Files That Should NOT Be Edited

❌ **DO NOT edit these files directly:**
- `services/ai-engine/.env` (auto-synced)
- `services/api-gateway/.env` (auto-synced)
- `.env.local` (root) (auto-synced)

✅ **ONLY edit:**
- `apps/digital-health-startup/.env.local` (master)

## Benefits

1. **Single Source of Truth** - All API keys in one place
2. **No More Mismatches** - Sync script ensures consistency
3. **Easy Updates** - Change once, sync everywhere
4. **Version Control Safe** - `.env.local` is gitignored
5. **Team Friendly** - Clear documentation on where to update keys

## Architecture

```
apps/digital-health-startup/.env.local (MASTER)
           │
           ├──> sync-env.sh (Sync Script)
           │
           ├──> services/ai-engine/.env
           ├──> services/api-gateway/.env
           └──> .env.local (root)
```

## Notes

- The sync script creates backups before modifying files (`.env.backup-YYYYMMDD`)
- Empty values are preserved as comments (e.g., `# ANTHROPIC_API_KEY=`)
- The script is idempotent (safe to run multiple times)
- All synced files have a header comment indicating they are auto-synced

## Related Files

- `sync-env.sh` - Main sync script
- `apps/digital-health-startup/.env.local` - Master configuration
- `services/ai-engine/.env` - Backend configuration (synced)

## Tags for Search

- `TAG: ENV_UNIFIED_CONFIGURATION`
- `TAG: ENV_SYNC_SCRIPT`
- `TAG: OPENAI_API_KEY_REQUIRED`

