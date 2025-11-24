# 🚀 Docker Build Cloud Quick Start

## What You Need

✅ Docker Desktop installed  
✅ Docker Hub account (free tier works)  
✅ Google Cloud account (free tier: $300 credit)

---

## Step-by-Step Deployment

### Step 1: Enable Docker Build Cloud

**Option A: Via Docker Desktop UI**
1. Open Docker Desktop
2. Go to Settings → Build Cloud
3. Sign in to Docker Hub (if not already)
4. Enable Build Cloud (free 7-day trial)

**Option B: Via CLI**
```bash
# Login to Docker Hub
docker login

# Verify Buildx is available
docker buildx version
```

---

### Step 2: Build Image with Docker Build Cloud

```bash
cd services/ai-engine

# Set your Docker Hub username
export DOCKERHUB_USERNAME=your-username

# Build using cloud builder
./build-cloud.sh
```

**What this does:**
- ✅ Builds Docker image in the cloud (faster than local)
- ✅ Pushes image to Docker Hub
- ✅ Uses shared cache (faster subsequent builds)

---

### Step 3: Deploy to Google Cloud Run

```bash
# Install Google Cloud SDK (if not installed)
brew install google-cloud-sdk  # macOS

# Login to Google Cloud
gcloud auth login

# Set your project
export GCP_PROJECT_ID=your-project-id
gcloud config set project $GCP_PROJECT_ID

# Deploy to Cloud Run
./deploy-cloud-run.sh
```

**What this does:**
- ✅ Pulls image from Docker Hub
- ✅ Deploys to Cloud Run (serverless)
- ✅ Provides HTTPS URL automatically
- ✅ Scales to zero when idle (free when not in use)

---

### Step 4: Test Deployment

After deployment, you'll get a URL like:
```
https://vital-ai-engine-xxxxx-uc.a.run.app
```

Test it:
```bash
curl https://vital-ai-engine-xxxxx-uc.a.run.app/health
```

---

### Step 5: Update Frontend

**In `apps/digital-health-startup/.env.local`:**
```bash
AI_ENGINE_URL=https://vital-ai-engine-xxxxx-uc.a.run.app
NEXT_PUBLIC_AI_ENGINE_URL=https://vital-ai-engine-xxxxx-uc.a.run.app
```

---

## Complete Command Sequence

```bash
# 1. Navigate to AI Engine
cd services/ai-engine

# 2. Set Docker Hub username
export DOCKERHUB_USERNAME=your-username

# 3. Build with Docker Build Cloud
./build-cloud.sh

# 4. Set Google Cloud project
export GCP_PROJECT_ID=your-project-id
gcloud config set project $GCP_PROJECT_ID

# 5. Login to Google Cloud (if not already)
gcloud auth login

# 6. Deploy to Cloud Run
./deploy-cloud-run.sh

# 7. Test
curl https://YOUR_SERVICE_URL/health
```

---

## Benefits

| Feature | Docker Build Cloud | Cloud Run |
|---------|-------------------|-----------|
| **Build Speed** | 2-5x faster than local | N/A |
| **Local Resources** | Frees CPU/RAM | N/A |
| **Cost When Idle** | N/A | $0 (scales to zero) |
| **Cold Start** | N/A | 2-5 seconds |
| **Scaling** | N/A | Automatic |
| **HTTPS** | N/A | Built-in |

---

## Troubleshooting

### "Build Cloud not available"
- Update Docker Desktop to latest version
- Check Docker Hub subscription (trial or paid plan)

### "Image not found"
- Verify image was pushed: Check Docker Hub dashboard
- Rebuild: `./build-cloud.sh`

### "Cloud Run deployment failed"
- Check logs: `gcloud run services logs read vital-ai-engine --region us-central1`
- Verify environment variables are set in `.env.local`
- Check project has billing enabled (even with free tier)

---

## Cost Estimate

### Docker Build Cloud
- **Free trial**: 7 days
- **After trial**: $7/month (Pro plan)

### Google Cloud Run
- **Free tier**: 2M requests/month, 360K GB-seconds/month
- **After free tier**: ~$0-5/month for low traffic

**Total: ~$7-12/month** (after free trial/credits)

---

**Ready to deploy? Run the commands above!**

