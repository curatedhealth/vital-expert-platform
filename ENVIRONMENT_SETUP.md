# 🔧 Environment Variables Setup Guide

This guide will help you configure all necessary environment variables for Vercel deployment.

## 📋 Required Environment Variables

### 1. Supabase Configuration (Already Set)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
```

### 2. Service Keys (REQUIRED - You Need to Set These)

#### Supabase Service Role Key
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `xazinxsiglqokwfmogyk`
3. Go to **Settings** → **API**
4. Copy the **service_role** key (not the anon key)
5. Set as: `SUPABASE_SERVICE_ROLE_KEY`

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)
4. Set as: `OPENAI_API_KEY`

### 3. Application Configuration
```bash
NEXT_PUBLIC_APP_URL=https://vital-expert-preprod.vercel.app
NODE_ENV=production
```

## 🚀 How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `vital-expert-preprod`
3. Go to **Settings** → **Environment Variables**
4. Add each variable with the values above
5. Click **Save** and **Redeploy**

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NODE_ENV

# Deploy
vercel --prod
```

## 🔧 Optional: Enhanced Features

### Redis Caching (Performance Optimization)

#### Option A: Upstash Redis (Recommended for Vercel)
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and Token
4. Set these variables:
```bash
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
```

#### Option B: Redis Cloud
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a new database
3. Copy the connection URL
4. Set this variable:
```bash
REDIS_URL=your_redis_cloud_url_here
```

### LangSmith Tracing (AI Observability)
1. Go to [LangSmith](https://smith.langchain.com/)
2. Create an account and get your API key
3. Set these variables:
```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_PROJECT=vital-path-production
```

## 📊 Environment Variables Summary

| Variable | Required | Purpose | Default |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase database URL | Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | Set |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key | **You need to set** |
| `OPENAI_API_KEY` | ✅ | OpenAI API access | **You need to set** |
| `NEXT_PUBLIC_APP_URL` | ✅ | Application URL | Set |
| `NODE_ENV` | ✅ | Environment mode | Set |
| `UPSTASH_REDIS_REST_URL` | ❌ | Redis caching (Upstash) | Optional |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ | Redis token (Upstash) | Optional |
| `REDIS_URL` | ❌ | Redis caching (Cloud) | Optional |
| `LANGCHAIN_TRACING_V2` | ❌ | Enable AI tracing | Optional |
| `LANGCHAIN_API_KEY` | ❌ | LangSmith API key | Optional |
| `LANGCHAIN_PROJECT` | ❌ | LangSmith project name | Optional |

## 🔍 Verification Steps

After setting up the environment variables:

1. **Deploy to Vercel** and check the build logs
2. **Test the application** by visiting your Vercel URL
3. **Check the chat functionality** to ensure API calls work
4. **Verify authentication** by testing login/register flows
5. **Monitor the console** for any missing environment variable errors

## 🚨 Troubleshooting

### Common Issues:
- **"Supabase not configured"** → Check `SUPABASE_SERVICE_ROLE_KEY` is set
- **"OpenAI API error"** → Check `OPENAI_API_KEY` is valid
- **"Redis connection failed"** → Redis is optional, app works without it
- **"Build failed"** → Check all required variables are set

### Debug Commands:
```bash
# Check environment variables in Vercel
vercel env ls

# View build logs
vercel logs

# Test locally with production env
vercel dev
```

## 📞 Support

If you encounter issues:
1. Check the [Vercel Documentation](https://vercel.com/docs)
2. Review the [Supabase Documentation](https://supabase.com/docs)
3. Check the application logs in Vercel dashboard
4. Ensure all required environment variables are properly set
