# 🔧 Vercel Environment Variables Setup Guide

This guide will walk you through adding Redis and LangSmith environment variables to your Vercel deployment.

## 📋 Current Environment Variables

Your `.env.production` file contains these variables ready to be added to Vercel:

```bash
# Required (Already Set)
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
NEXT_PUBLIC_APP_URL=https://vital-expert-preprod.vercel.app
NODE_ENV=production

# Required (You Need to Set)
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# Optional - Redis Caching
UPSTASH_REDIS_REST_URL=YOUR_UPSTASH_REDIS_URL_HERE
UPSTASH_REDIS_REST_TOKEN=YOUR_UPSTASH_REDIS_TOKEN_HERE

# Optional - LangSmith Monitoring
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=YOUR_LANGSMITH_API_KEY_HERE
LANGCHAIN_PROJECT=vital-path-production
```

## 🚀 Step-by-Step Vercel Setup

### Step 1: Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `vital-expert-preprod`
3. Click on the project name

### Step 2: Navigate to Environment Variables
1. Click on **Settings** tab
2. Click on **Environment Variables** in the left sidebar
3. You'll see a list of current environment variables

### Step 3: Add Required Variables

#### 3.1 Supabase Service Role Key
1. Click **Add New**
2. **Name**: `SUPABASE_SERVICE_ROLE_KEY`
3. **Value**: Get from [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API → service_role key
4. **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

#### 3.2 OpenAI API Key
1. Click **Add New**
2. **Name**: `OPENAI_API_KEY`
3. **Value**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
4. **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

### Step 4: Add Optional Redis Variables (Recommended)

#### 4.1 Get Upstash Redis Credentials
1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up/Login with your account
3. Click **Create Database**
4. Choose a name: `vital-expert-cache`
5. Select region closest to your Vercel deployment
6. Click **Create**
7. Copy the **REST URL** and **REST Token**

#### 4.2 Add Redis Variables to Vercel
1. Click **Add New**
2. **Name**: `UPSTASH_REDIS_REST_URL`
3. **Value**: Your Upstash REST URL (starts with `https://`)
4. **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

6. Click **Add New**
7. **Name**: `UPSTASH_REDIS_REST_TOKEN`
8. **Value**: Your Upstash REST Token (starts with `AXX...`)
9. **Environment**: Select all (Production, Preview, Development)
10. Click **Save**

### Step 5: Add Optional LangSmith Variables (Recommended)

#### 5.1 Get LangSmith API Key
1. Go to [LangSmith](https://smith.langchain.com/)
2. Sign up/Login with your account
3. Create a new project: `vital-path-production`
4. Go to **Settings** → **API Keys**
5. Click **Create API Key**
6. Copy the key (starts with `lsv2_`)

#### 5.2 Add LangSmith Variables to Vercel
1. Click **Add New**
2. **Name**: `LANGCHAIN_TRACING_V2`
3. **Value**: `true`
4. **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

6. Click **Add New**
7. **Name**: `LANGCHAIN_API_KEY`
8. **Value**: Your LangSmith API key
9. **Environment**: Select all (Production, Preview, Development)
10. Click **Save**

6. Click **Add New**
7. **Name**: `LANGCHAIN_PROJECT`
8. **Value**: `vital-path-production`
9. **Environment**: Select all (Production, Preview, Development)
10. Click **Save**

## 🔍 Verification Steps

### Step 1: Redeploy Application
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete

### Step 2: Test Environment Variables
1. Visit your deployed application
2. Go to `/api/health` endpoint
3. Look for these success messages:
   - `✅ Redis enabled: upstash`
   - `✅ LangSmith tracing enabled`
   - `✅ Supabase connected`
   - `✅ OpenAI connected`

### Step 3: Test Features
1. **Test Chat**: Make a chat request to verify OpenAI is working
2. **Test Caching**: Make the same request twice - second should be faster
3. **Test Monitoring**: Check [LangSmith Dashboard](https://smith.langchain.com/) for traces

## 🎯 Quick Setup Commands

### Using Vercel CLI (Alternative Method)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add LANGCHAIN_TRACING_V2
vercel env add LANGCHAIN_API_KEY
vercel env add LANGCHAIN_PROJECT

# Deploy
vercel --prod
```

## 📊 Expected Results

After setup, you should see:

### Performance Improvements
- **Faster Response Times**: 2-3x faster for cached queries
- **Reduced API Costs**: 70-80% reduction in OpenAI calls
- **Better User Experience**: Instant responses for repeated queries

### Monitoring Capabilities
- **Real-time Tracing**: See all AI conversations in LangSmith
- **Performance Metrics**: Response times, token usage, costs
- **Error Tracking**: Debug issues quickly
- **Cost Analysis**: Optimize AI usage

## 🚨 Troubleshooting

### Common Issues
- **Environment variables not working**: Make sure to redeploy after adding
- **Redis connection failed**: Check URL and token format
- **LangSmith not tracing**: Verify API key and project name
- **Build failures**: Check all required variables are set

### Debug Commands
```bash
# Check environment variables
vercel env ls

# View build logs
vercel logs

# Test locally with production env
vercel dev
```

## ✅ Final Checklist

- [ ] Added `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Added `OPENAI_API_KEY`
- [ ] Added `UPSTASH_REDIS_REST_URL` (optional)
- [ ] Added `UPSTASH_REDIS_REST_TOKEN` (optional)
- [ ] Added `LANGCHAIN_TRACING_V2=true` (optional)
- [ ] Added `LANGCHAIN_API_KEY` (optional)
- [ ] Added `LANGCHAIN_PROJECT` (optional)
- [ ] Redeployed application
- [ ] Tested all features
- [ ] Verified monitoring is working

---

**🎉 You're all set!** Your VITAL Expert application now has optimal performance and monitoring capabilities.
