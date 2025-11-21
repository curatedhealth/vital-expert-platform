# Railway Service Link - Instructions

## Run This in YOUR Terminal

Since Railway CLI requires interactive prompts, please run this in your own terminal:

```bash
cd services/ai-engine
railway service
```

---

## What You'll See

Railway will ask you:

1. **Select a Project**
   - Choose: `vital-ai-engine-v2` (if exists)
   - OR select "Create a new project"
   - OR use arrow keys to navigate

2. **Select/Create Service**
   - Choose: **"Create a new service"** (recommended)
   - OR select existing `vital-ai-engine` if it exists

3. **Service Name**
   - Enter: `vital-ai-engine` (or press Enter for default)

---

## After Linking

Once the service is linked, you can run:

```bash
# Set environment variables
./set-env-vars.sh

# Set OpenAI key (required)
railway variables --set "OPENAI_API_KEY=your-actual-openai-key"

# Deploy
railway up

# Get URL
railway domain
```

---

## Alternative: Use Railway Dashboard

If you prefer not to use CLI:

1. **Go to:** https://railway.app/dashboard
2. **Select/Create Project:** `vital-ai-engine-v2`
3. **Create Service:**
   - Click "New Service"
   - Select "Empty Service"
   - Name: `vital-ai-engine`
4. **Connect GitHub:**
   - Settings → Source
   - Connect GitHub repo: `curatedhealth/vital-expert-platform`
   - Branch: `restructure/world-class-architecture`
   - Root Directory: `services/ai-engine`
5. **Configure:**
   - Builder: DOCKERFILE
   - Dockerfile Path: `Dockerfile`
6. **Set Variables:**
   - Variables tab
   - Add all required environment variables
7. **Deploy:**
   - Click "Deploy" button

---

**Please run `railway service` in your terminal now!**

