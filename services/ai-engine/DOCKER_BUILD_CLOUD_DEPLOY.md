# 🚀 Docker Build Cloud + Serverless Deployment Guide

This guide shows how to use [Docker Build Cloud](https://www.docker.com/products/build-cloud/) to build your Docker images faster, then deploy them to a serverless platform.

---

## Overview

1. **Docker Build Cloud** - Builds Docker images in the cloud (faster, frees local resources)
2. **Serverless Platform** - Runs the built image as a serverless service (Google Cloud Run, AWS Lambda, etc.)

---

## Step 1: Set Up Docker Build Cloud

### Prerequisites

- Docker Desktop installed
- Docker Hub account (or Docker Pro/Team/Business plan)

### Enable Docker Build Cloud

1. **Open Docker Desktop**
2. **Go to Settings → Build Cloud**
3. **Sign in to Docker Hub** (if not already)
4. **Enable Build Cloud**

**OR use CLI:**

```bash
# Install Docker CLI (if not already installed)
# Docker Desktop includes it

# Login to Docker Hub
docker login

# Verify Build Cloud is available
docker buildx version
```

---

## Step 2: Build Image with Docker Build Cloud

### Option A: Using Docker Desktop UI

1. **Open Docker Desktop**
2. **Go to Build Cloud tab**
3. **Select "Cloud Builders"**
4. **Create new builder or use default**
5. **Build your image:**
   ```bash
   cd services/ai-engine
   docker buildx build --platform linux/amd64,linux/arm64 \
     --builder cloud \
     -t your-dockerhub-username/vital-ai-engine:latest \
     --push .
   ```

### Option B: Using CLI with Build Cloud

```bash
# Navigate to AI Engine directory
cd services/ai-engine

# Create a cloud builder instance
docker buildx create --name cloud-builder --use \
  --driver docker-container \
  --driver-opt image=docker/buildx-cloud:latest

# Build using cloud builder
docker buildx build --builder cloud-builder \
  --platform linux/amd64 \
  -t your-dockerhub-username/vital-ai-engine:latest \
  --push .
```

### Option C: Using Build Cloud Script

```bash
# Use the provided script (we'll create this)
cd services/ai-engine
./build-cloud.sh
```

---

## Step 3: Deploy to Serverless Platform

### Option 1: Google Cloud Run (Recommended)

**Why Cloud Run:**
- ✅ Serverless containers (scales to zero)
- ✅ Pay only for what you use
- ✅ Fast cold starts (2-5 seconds)
- ✅ Automatic HTTPS
- ✅ Built-in health checks

#### Prerequisites

```bash
# Install Google Cloud SDK
# macOS:
brew install google-cloud-sdk

# Initialize
gcloud init
```

#### Deploy to Cloud Run

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and deploy in one command
gcloud run deploy vital-ai-engine \
  --source services/ai-engine \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000 \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars SUPABASE_URL=your_url,SUPABASE_SERVICE_ROLE_KEY=your_key,OPENAI_API_KEY=your_key
```

**OR deploy from Docker Hub image:**

```bash
# If you already built and pushed to Docker Hub
gcloud run deploy vital-ai-engine \
  --image your-dockerhub-username/vital-ai-engine:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000 \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars SUPABASE_URL=your_url,SUPABASE_SERVICE_ROLE_KEY=your_key,OPENAI_API_KEY=your_key
```

**After deployment:**
- Get URL: `gcloud run services describe vital-ai-engine --format="value(status.url)"`
- Test: `curl https://YOUR_URL/health`

---

### Option 2: AWS Lambda (with Container Image)

**Prerequisites:**

```bash
# Install AWS CLI
brew install awscli  # macOS
# Or: https://aws.amazon.com/cli/

# Configure
aws configure
```

**Deploy to Lambda:**

```bash
# Build and push to ECR (AWS Container Registry)
aws ecr create-repository --repository-name vital-ai-engine

# Get login command
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag vital-ai-engine:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/vital-ai-engine:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/vital-ai-engine:latest

# Create Lambda function (requires Lambda function configuration)
# Note: Lambda requires special handler - we'd need to adapt the FastAPI app
```

**Note:** Lambda with containers requires a different setup. Cloud Run is easier for FastAPI apps.

---

### Option 3: Azure Container Instances (ACI)

**Prerequisites:**

```bash
# Install Azure CLI
brew install azure-cli  # macOS
# Or: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login
```

**Deploy to ACI:**

```bash
# Create resource group
az group create --name vital-rg --location eastus

# Create container instance
az container create \
  --resource-group vital-rg \
  --name vital-ai-engine \
  --image your-dockerhub-username/vital-ai-engine:latest \
  --dns-name-label vital-ai-engine \
  --ports 8000 \
  --memory 4 \
  --cpu 2 \
  --environment-variables \
    SUPABASE_URL=your_url \
    SUPABASE_SERVICE_ROLE_KEY=your_key \
    OPENAI_API_KEY=your_key
```

---

## Complete Workflow Script

I'll create a script that combines Docker Build Cloud + Cloud Run deployment:

---

## Docker Build Cloud Benefits

| Feature | Local Build | Docker Build Cloud |
|---------|-------------|-------------------|
| **Speed** | ~5-10 min | ~2-5 min |
| **Resources** | Uses local CPU/RAM | Cloud resources |
| **Cache** | Local only | Shared team cache |
| **Parallel** | Limited | Unlimited (Team plans) |
| **Multi-arch** | Slow emulation | Native ARM/AMD |

---

## Pricing

### Docker Build Cloud
- **Personal**: Free 7-day trial, then $7/month
- **Pro**: $7/month (200 build minutes/month)
- **Team**: $18/user/month (500 build minutes/month)
- **Business**: Custom pricing (1500+ build minutes/month)

### Serverless Platforms (Example: Cloud Run)
- **Free tier**: 2 million requests/month, 360K GB-seconds/month
- **After free tier**: ~$0.0000025 per request, $0.000024 per GB-second

**Typical monthly cost for low traffic:** $0-5/month

---

## Troubleshooting

### Issue: "Build Cloud not available"

**Fix:**
1. Update Docker Desktop to latest version
2. Check Docker Hub subscription (Build Cloud requires Pro/Team/Business or trial)
3. Verify internet connection

### Issue: "Authentication failed"

**Fix:**
```bash
docker login
# Enter Docker Hub credentials
```

### Issue: "Image not found in registry"

**Fix:**
1. Verify image was pushed: `docker images your-dockerhub-username/vital-ai-engine`
2. Check Docker Hub: https://hub.docker.com/
3. Rebuild and push: `docker buildx build --push ...`

### Issue: "Cloud Run deployment failed"

**Fix:**
1. Check logs: `gcloud run services logs read vital-ai-engine`
2. Verify environment variables are set
3. Check health endpoint works in local Docker container
4. Verify Dockerfile exposes port 8000

---

## Next Steps

1. ✅ Set up Docker Build Cloud
2. ✅ Build image using cloud builder
3. ✅ Push to Docker Hub (or ECR/GCR)
4. ✅ Deploy to Cloud Run (or Lambda/ACI)
5. ✅ Test deployment
6. ✅ Update frontend `.env.local` with new URL

---

**Ready to proceed? I'll create the build and deploy scripts!**

