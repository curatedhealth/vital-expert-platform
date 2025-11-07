# Knowledge Pipeline - Environment Setup Guide

## 📋 Required Environment Variables

The knowledge pipeline requires the following environment variables. These should already be in your `.env.local` and `.env.vercel` files.

## 🔑 API Keys Needed

### 1. **Supabase** (Required)

```bash
# In .env.local or .env.vercel
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# For the pipeline script (server-side)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ⚠️ Keep this secret!
```

**Where to find:**
- Supabase Dashboard → Settings → API
- URL: Found under "Project URL"
- Service Role Key: Found under "Project API keys" → "service_role"

### 2. **Pinecone** (Optional, but recommended for RAG)

```bash
# In .env.local or .env.vercel
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_environment  # e.g., "us-west1-gcp"
PINECONE_INDEX=vital-knowledge  # Your index name
```

**Where to find:**
- Pinecone Console → API Keys
- Environment: Listed next to your index name

**If not using Pinecone:**
- Pipeline will skip vector upload
- Content will still be saved to Supabase
- Warning will be logged but script continues

### 3. **OpenAI** (Not Required!)

```bash
# ❌ NOT NEEDED for the knowledge pipeline!
# The pipeline uses Hugging Face models (free, local)
OPENAI_API_KEY=your_key  # Only needed for other features
```

**Note:** The knowledge pipeline uses Hugging Face sentence-transformers, so OpenAI API key is NOT required for embeddings!

## 🚀 Quick Setup Script

Create a file `scripts/.env` with your keys:

```bash
#!/bin/bash
# Knowledge Pipeline Environment Variables
# Copy from your .env.local file

# Required
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Optional (for vector storage)
export PINECONE_API_KEY="your-key"
export PINECONE_ENVIRONMENT="us-west1-gcp"
```

Then run:
```bash
source scripts/.env
python scripts/knowledge-pipeline.py --config your-config.json
```

## 📝 Step-by-Step Setup

### Step 1: Copy Keys from Your Existing Files

**From `.env.local`:**
```bash
# Look for these variables:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PINECONE_API_KEY=...
```

### Step 2: Create Pipeline Environment File

```bash
# Create a new file for the pipeline
cp .env.local scripts/.env

# Or manually create it
cat > scripts/.env << 'EOF'
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=us-west1-gcp
EOF
```

### Step 3: Load and Test

```bash
# Load environment variables
source scripts/.env

# Test the pipeline (dry run)
python scripts/knowledge-pipeline.py \
  --config scripts/knowledge-pipeline-config.example.json \
  --dry-run

# If successful, you'll see:
# ✅ Environment variables validated
# ✅ Pinecone configuration found
# 🤗 Loading Hugging Face model: sentence-transformers/all-MiniLM-L6-v2
```

## 🔐 Security Best Practices

### ⚠️ Important Security Notes:

1. **Never commit `.env` files to git**
   ```bash
   # Already in .gitignore
   .env
   .env.local
   .env.*.local
   scripts/.env
   ```

2. **Use service role key only server-side**
   - ❌ Don't expose in frontend code
   - ❌ Don't commit to version control
   - ✅ Only use in backend scripts
   - ✅ Keep in `.env.local` (gitignored)

3. **Rotate keys if exposed**
   - Generate new service role key in Supabase
   - Create new Pinecone API key
   - Update all environments

## 🎯 Environment-Specific Setup

### Development (Local)

```bash
# .env.local
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=dev-service-key
PINECONE_API_KEY=dev-pinecone-key
```

### Production (Vercel)

```bash
# .env.vercel or Vercel Dashboard
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod-service-key
PINECONE_API_KEY=prod-pinecone-key
```

**Set in Vercel:**
1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable
4. Select "Production" environment
5. Save

### Staging

```bash
# .env.staging
SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=staging-service-key
PINECONE_API_KEY=staging-pinecone-key
```

## 🧪 Testing Your Setup

### Test 1: Check Environment Variables

```bash
# Check if variables are set
python -c "
import os
from dotenv import load_dotenv

load_dotenv()

keys = {
    'SUPABASE_URL': os.getenv('SUPABASE_URL'),
    'SUPABASE_SERVICE_ROLE_KEY': os.getenv('SUPABASE_SERVICE_ROLE_KEY')[:20] + '...' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else None,
    'PINECONE_API_KEY': os.getenv('PINECONE_API_KEY')[:20] + '...' if os.getenv('PINECONE_API_KEY') else None,
}

for key, value in keys.items():
    status = '✅' if value else '❌'
    print(f'{status} {key}: {value or \"Not set\"}')
"
```

### Test 2: Test Supabase Connection

```bash
python -c "
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

try:
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    )
    # Try a simple query
    result = supabase.table('knowledge_documents').select('count').execute()
    print('✅ Supabase connection successful!')
except Exception as e:
    print(f'❌ Supabase connection failed: {e}')
"
```

### Test 3: Test Pinecone Connection

```bash
python -c "
import pinecone
import os
from dotenv import load_dotenv

load_dotenv()

if os.getenv('PINECONE_API_KEY'):
    try:
        pinecone.init(api_key=os.getenv('PINECONE_API_KEY'))
        indexes = pinecone.list_indexes()
        print(f'✅ Pinecone connection successful! Indexes: {indexes}')
    except Exception as e:
        print(f'❌ Pinecone connection failed: {e}')
else:
    print('⚠️  Pinecone API key not set (optional)')
"
```

## 🔧 Troubleshooting

### Issue: "Missing required environment variables"

**Solution:**
```bash
# Check if .env file is loaded
echo $SUPABASE_URL

# If empty, load manually
source .env.local
# or
export $(cat .env.local | xargs)
```

### Issue: "Supabase authentication failed"

**Check:**
1. URL format: `https://your-project.supabase.co`
2. Using service_role key (not anon key)
3. Key hasn't expired or been rotated

**Fix:**
```bash
# Get new keys from Supabase Dashboard
# Settings → API → Copy new service_role key
```

### Issue: "Pinecone index not found"

**Check:**
```bash
# List available indexes
python -c "
import pinecone
import os
pinecone.init(api_key=os.getenv('PINECONE_API_KEY'))
print(pinecone.list_indexes())
"
```

**Create index if needed:**
```bash
# In Pinecone console or via API
# Dimensions: 384 (for all-MiniLM-L6-v2)
# Dimensions: 768 (for all-mpnet-base-v2)
```

## 📋 Complete Example

**File: `scripts/.env`**
```bash
# Supabase (Required)
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYzMDAwMDAwMCwiZXhwIjoxOTQ1NTc2MDAwfQ.xyz123

# Pinecone (Optional)
PINECONE_API_KEY=12345678-1234-1234-1234-123456789abc
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX=vital-knowledge
```

**Run pipeline:**
```bash
# Load environment
source scripts/.env

# Run pipeline
python scripts/knowledge-pipeline.py \
  --config my-config.json \
  --embedding-model sentence-transformers/all-MiniLM-L6-v2 \
  --output-dir ./knowledge
```

## 🎯 Using with UI

The knowledge pipeline UI (`/admin?view=knowledge-pipeline`) exports configuration files that work directly with these environment variables.

**Workflow:**
1. Configure sources in UI → Export JSON
2. Load environment: `source scripts/.env`
3. Run pipeline with exported config
4. Content automatically uploads to your Supabase + Pinecone

## 📦 Environment Variables Summary

| Variable | Required | Purpose | Where to Find |
|----------|----------|---------|---------------|
| `SUPABASE_URL` | ✅ Yes | Supabase project URL | Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Server-side auth | Dashboard → Settings → API → service_role |
| `PINECONE_API_KEY` | ⚠️ Optional | Vector storage | Pinecone Console → API Keys |
| `PINECONE_ENVIRONMENT` | ⚠️ Optional | Pinecone region | Next to index name |
| `PINECONE_INDEX` | ⚠️ Optional | Index name | Your index name (default: vital-knowledge) |

## 🚀 Quick Start Command

```bash
# 1. Copy keys from .env.local to scripts/.env
grep -E 'SUPABASE_|PINECONE_' .env.local > scripts/.env

# 2. Load environment
source scripts/.env

# 3. Test setup
python scripts/knowledge-pipeline.py \
  --config scripts/knowledge-pipeline-config.example.json \
  --dry-run

# 4. If successful, run for real
python scripts/knowledge-pipeline.py \
  --config your-config.json
```

---

**Last Updated:** 2025-11-05
**Status:** Ready for use with your existing `.env.local` and `.env.vercel` files

