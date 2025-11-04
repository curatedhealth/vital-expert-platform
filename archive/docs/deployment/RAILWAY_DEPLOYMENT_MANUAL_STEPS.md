# 🚀 Railway Deployment - Manual Steps

Since Railway CLI requires interactive terminal input, please run these commands manually:

---

## Step 1: Link Railway Service

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
railway service
```

**Then:**
- Use arrow keys to select existing service OR
- Select "Create new service" and name it: `vital-ai-engine`

---

## Step 2: Verify Link

```bash
railway status
```

You should see your service name displayed.

---

## Step 3: Set Environment Variables (if not already set)

```bash
railway variables --set "OPENAI_API_KEY=your-actual-openai-key"
railway variables --set "SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co"
railway variables --set "SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key"
```

---

## Step 4: Deploy

```bash
cd ../..
./deploy-ask-panel-railway.sh
```

Or manually:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
railway up
```

---

## Step 5: Get Your Deployment URL

```bash
railway domain
```

Copy the URL (something like: `https://vital-ai-engine-production.up.railway.app`)

---

## Step 6: Test Deployment

```bash
# Replace YOUR_RAILWAY_URL with your actual URL
curl https://YOUR_RAILWAY_URL/health
curl https://YOUR_RAILWAY_URL/frameworks/info
```

---

## Step 7: Update Frontend Environment

Edit: `apps/digital-health-startup/.env.local`

Add or update:
```bash
AI_ENGINE_URL=https://YOUR_RAILWAY_URL
NEXT_PUBLIC_AI_ENGINE_URL=https://YOUR_RAILWAY_URL
```

---

## Step 8: Test Ask Panel

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
pnpm dev
```

Then open: `http://localhost:3000/ask-panel`

---

## 🎯 Quick Command Summary

```bash
# Navigate and link
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
railway service

# Deploy
railway up

# Get URL
railway domain

# Monitor logs
railway logs --follow
```

---

## ✅ Success Indicators

After deployment, you should see:
- ✅ Build success message
- ✅ Health endpoint responding: `/health`
- ✅ Frameworks info endpoint: `/frameworks/info`
- ✅ Service URL active

---

## 📊 Expected Results

### Health Check Response:
```json
{
  "status": "healthy",
  "version": "2.0.0"
}
```

### Frameworks Info Response:
```json
{
  "status": "active",
  "langgraph_available": true,
  "autogen_available": true,
  "crewai_available": true,
  "openai_api_key_set": true
}
```

---

## 🐛 Troubleshooting

### If deployment fails:

1. **Check logs:**
   ```bash
   railway logs
   ```

2. **Verify environment variables:**
   ```bash
   railway variables
   ```

3. **Restart service:**
   ```bash
   railway restart
   ```

4. **Redeploy:**
   ```bash
   railway up --detach
   ```

---

**Ready to deploy! Run these commands in your terminal.**

