# Environment Variables Setup

All environment variables are configured in **ONE file**: `.env.local` in the `apps/digital-health-startup/` directory.

## Quick Setup

1. Navigate to `apps/digital-health-startup/`
2. Create `.env.local` file
3. Copy all required variables from the sections below

## Required Environment Variables

### Next.js & Application
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=https://app.vital.expert
PORT=3000
```

### Database
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vital_path
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes
```

### Redis & Caching
```bash
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_REST_URL=https://square-halibut-35639.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYs3AAIncDE1Y2RmMGUwYmY1Mzk0YTU4OWFhNjAzMjk0MWVjYzhmM3AxMzU2Mzk
```

### LLM Providers (Required: OPENAI_API_KEY)
```bash
# Required
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# Optional
HUGGINGFACE_API_KEY=YOUR_HUGGINGFACE_API_KEY_HERE
ANTHROPIC_API_KEY=
GEMINI_API_KEY=AIzaSyDeOjggoNgBU0Z6mlpUiiZKsFM43vHjFX0
```

### Vector Stores
```bash
PINECONE_API_KEY=pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR
PINECONE_INDEX_NAME=vital-knowledge
```

### Observability
```bash
LANGFUSE_PUBLIC_KEY=b1fe4bae-221e-4c74-8e97-6bd73c0ab30e
LANGFUSE_HOST=https://cloud.langfuse.com
```

### Security (Generate Strong Secrets)
```bash
JWT_SECRET=YOUR_JWT_SECRET_HERE_MIN_32_CHARS
ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY_HERE_MIN_32_CHARS
CSRF_SECRET=YOUR_CSRF_SECRET_HERE_MIN_32_CHARS
```

### External Integrations (Optional)
```bash
NOTION_API_KEY=YOUR_NOTION_API_KEY_HERE
```

### Multi-Tenant
```bash
NEXT_PUBLIC_ENABLE_MULTI_TENANT=true
NEXT_PUBLIC_DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000001
```

## Important Notes

- **Never commit `.env.local`** - It's already in `.gitignore`
- **Replace all `YOUR_*_HERE` placeholders** with actual API keys
- **All secrets should be at least 32 characters** for security keys
- **Use different values for production** vs development

## Security Best Practices

1. Keep `.env.local` file secure and local only
2. Use environment variable management tools for production (Vercel, Railway, etc.)
3. Rotate secrets regularly
4. Never share API keys in code or documentation

