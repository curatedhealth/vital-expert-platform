# ⚡ Quick Environment Variables Setup

## 🎯 What You Need to Do

Add these environment variables to your Vercel project to enable Redis caching and LangSmith monitoring.

## 🚀 Method 1: Vercel Dashboard (Recommended)

### Step 1: Go to Vercel Dashboard
1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `vital-expert-preprod`
3. Click **Settings** → **Environment Variables**

### Step 2: Add Required Variables
```bash
# Required for basic functionality
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 3: Add Redis Variables (Optional - Recommended)
```bash
# Redis caching for 70-80% cost reduction
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_rest_token_here
```

### Step 4: Add LangSmith Variables (Optional - Recommended)
```bash
# AI monitoring and tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_your_langsmith_api_key_here
LANGCHAIN_PROJECT=vital-path-production
```

## 🛠️ Method 2: Vercel CLI (Automated)

### Run the Interactive Setup Script
```bash
node scripts/add-vercel-env.js
```

This script will:
- Check if Vercel CLI is installed
- Guide you through adding each variable
- Automatically add them to your Vercel project

## 🔍 Method 3: Manual CLI Commands

### Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### Add Variables One by One
```bash
# Required variables
echo "your_supabase_service_role_key" | vercel env add SUPABASE_SERVICE_ROLE_KEY
echo "your_openai_api_key" | vercel env add OPENAI_API_KEY

# Optional Redis variables
echo "https://your-database.upstash.io" | vercel env add UPSTASH_REDIS_REST_URL
echo "your_rest_token" | vercel env add UPSTASH_REDIS_REST_TOKEN

# Optional LangSmith variables
echo "true" | vercel env add LANGCHAIN_TRACING_V2
echo "lsv2_your_langsmith_api_key" | vercel env add LANGCHAIN_API_KEY
echo "vital-path-production" | vercel env add LANGCHAIN_PROJECT
```

## 🔑 Where to Get API Keys

### Supabase Service Role Key
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `xazinxsiglqokwfmogyk`
3. Go to **Settings** → **API**
4. Copy the **service_role** key (not the anon key)

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

### Upstash Redis (Optional)
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the **REST URL** and **REST Token**

### LangSmith API Key (Optional)
1. Go to [LangSmith](https://smith.langchain.com/)
2. Create account and project
3. Go to **Settings** → **API Keys**
4. Create new API key (starts with `lsv2_`)

## ✅ Verification

### Test Your Setup
```bash
# Test environment variables
node scripts/test-environment.js

# Deploy and test
vercel --prod

# Test health endpoint
curl https://your-app.vercel.app/api/health
```

### Expected Results
After setup, you should see:
- `✅ Redis enabled: upstash`
- `✅ LangSmith tracing enabled`
- `✅ Supabase connected`
- `✅ OpenAI connected`

## 📊 Benefits After Setup

### Redis Caching
- **70-80% reduction** in API costs
- **2-3x faster** response times
- **Better user experience** with instant responses

### LangSmith Monitoring
- **Real-time AI conversation tracing**
- **Performance monitoring** and optimization
- **Cost analysis** and debugging
- **Error tracking** and alerts

## 🚨 Troubleshooting

### Common Issues
- **Variables not working**: Make sure to redeploy after adding
- **Build failures**: Check all required variables are set
- **Redis connection failed**: Verify URL and token format
- **LangSmith not tracing**: Check API key and project name

### Debug Commands
```bash
# Check current environment
node scripts/test-environment.js

# Check Vercel environment variables
vercel env ls

# View build logs
vercel logs

# Test locally
vercel dev
```

## 📚 Full Documentation

- **Complete Setup Guide**: `VERCEL_ENV_SETUP_GUIDE.md`
- **Optional Features**: `OPTIONAL_FEATURES_SETUP.md`
- **Environment Setup**: `ENVIRONMENT_SETUP.md`

---

**🎉 Ready to go!** Once you add these variables, your VITAL Expert application will have optimal performance and monitoring capabilities.
