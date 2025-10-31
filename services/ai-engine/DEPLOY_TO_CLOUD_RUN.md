# 🚀 Deploy to Google Cloud Run - Step by Step

## ✅ What's Done

1. ✅ **Docker image built**: `mzouda/vital-ai-engine:latest`
2. ✅ **Image pushed to Docker Hub**: https://hub.docker.com/r/mzouda/vital-ai-engine
3. ✅ **Google Cloud SDK installed**

---

## Next Steps

### Step 1: Initialize Google Cloud

```bash
# Add gcloud to PATH (if not already added to your shell profile)
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"

# Initialize Google Cloud
gcloud init
```

**This will:**
1. Open browser for authentication
2. Ask you to select or create a Google Cloud project
3. Configure default region

**OR if you already have a project:**

```bash
# Login
gcloud auth login

# Set your project
export GCP_PROJECT_ID=your-project-id
gcloud config set project $GCP_PROJECT_ID
```

---

### Step 2: Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API (for pulling from Docker Hub)
gcloud services enable cloudbuild.googleapis.com
```

---

### Step 3: Deploy to Cloud Run

**Option A: Use the deployment script**

```bash
cd services/ai-engine
export DOCKERHUB_USERNAME=mzouda
export GCP_PROJECT_ID=your-project-id
./deploy-cloud-run.sh
```

**Option B: Manual deployment**

```bash
gcloud run deploy vital-ai-engine \
  --image docker.io/mzouda/vital-ai-engine:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000 \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars "SUPABASE_URL=your_url,SUPABASE_SERVICE_ROLE_KEY=your_key,OPENAI_API_KEY=your_key,PINECONE_API_KEY=your_key,PINECONE_INDEX_NAME=vital-knowledge,LOG_LEVEL=info"
```

---

### Step 4: Get Your Service URL

After deployment, get the URL:

```bash
gcloud run services describe vital-ai-engine \
  --platform managed \
  --region us-central1 \
  --format="value(status.url)"
```

**Expected output:**
```
https://vital-ai-engine-xxxxx-uc.a.run.app
```

---

### Step 5: Test Deployment

```bash
# Replace with your actual URL
curl https://vital-ai-engine-xxxxx-uc.a.run.app/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0",
  ...
}
```

---

### Step 6: Update Frontend Configuration

**In `apps/digital-health-startup/.env.local`:**
```bash
AI_ENGINE_URL=https://vital-ai-engine-xxxxx-uc.a.run.app
NEXT_PUBLIC_AI_ENGINE_URL=https://vital-ai-engine-xxxxx-uc.a.run.app
```

---

## Environment Variables Needed

Make sure to set these in Cloud Run (via `--set-env-vars`):

```
SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key
OPENAI_API_KEY=your_key
PINECONE_API_KEY=your_key
PINECONE_INDEX_NAME=vital-knowledge
LOG_LEVEL=info
```

**OR** create a `.env.local` file in `services/ai-engine/` and the script will load it automatically.

---

## Cost Estimate

### Google Cloud Run
- **Free tier**: 2 million requests/month, 360K GB-seconds/month
- **After free tier**: ~$0-5/month for low traffic

**Total cost: ~$0-5/month** for low to moderate traffic.

---

## Troubleshooting

### Issue: "Permission denied" or "API not enabled"

**Fix:**
```bash
# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Check billing
gcloud billing accounts list
gcloud billing projects link YOUR_PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT
```

### Issue: "Image pull failed"

**Fix:**
1. Verify image exists: https://hub.docker.com/r/mzouda/vital-ai-engine
2. Check image is public or you have access
3. Try pulling locally: `docker pull mzouda/vital-ai-engine:latest`

### Issue: "Health check fails"

**Fix:**
1. Check logs: `gcloud run services logs read vital-ai-engine --region us-central1`
2. Verify environment variables are set correctly
3. Test locally first: `docker run -p 8000:8000 -e ... mzouda/vital-ai-engine:latest`

---

## Quick Commands Reference

```bash
# View logs
gcloud run services logs read vital-ai-engine --region us-central1 --follow

# Update environment variables
gcloud run services update vital-ai-engine \
  --region us-central1 \
  --update-env-vars "KEY=value"

# Delete service
gcloud run services delete vital-ai-engine --region us-central1
```

---

**Ready to deploy? Run `gcloud init` or `gcloud auth login` first!**

