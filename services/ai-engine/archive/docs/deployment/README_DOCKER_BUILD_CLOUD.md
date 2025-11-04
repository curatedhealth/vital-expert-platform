# 🐳 Docker Build Cloud Deployment

This directory now supports deploying via **Docker Build Cloud** to build images faster, then deploying to **Google Cloud Run** for serverless hosting.

---

## Quick Start

### 1. Build with Docker Build Cloud

```bash
# Set your Docker Hub username
export DOCKERHUB_USERNAME=your-username

# Build image (uses cloud builders)
./build-cloud.sh
```

### 2. Deploy to Google Cloud Run

```bash
# Set your Google Cloud project
export GCP_PROJECT_ID=your-project-id

# Deploy (serverless, scales to zero)
./deploy-cloud-run.sh
```

### 3. Get Your URL

After deployment, the script will output your service URL:
```
https://vital-ai-engine-xxxxx-uc.a.run.app
```

---

## What's Different?

### Docker Build Cloud
- ✅ **Faster builds**: 2-5x faster than local builds
- ✅ **Cloud resources**: Offloads CPU/RAM usage
- ✅ **Shared cache**: Team members benefit from cached layers
- ✅ **Multi-architecture**: Native ARM/AMD builds

### Google Cloud Run
- ✅ **Serverless**: Scales to zero (free when idle)
- ✅ **Fast cold starts**: 2-5 seconds
- ✅ **Automatic HTTPS**: Built-in SSL certificates
- ✅ **Auto-scaling**: Handles traffic spikes automatically
- ✅ **Pay per use**: Only pay when handling requests

---

## Documentation

- **[DOCKER_BUILD_CLOUD_QUICKSTART.md](./DOCKER_BUILD_CLOUD_QUICKSTART.md)** - Quick start guide
- **[DOCKER_BUILD_CLOUD_DEPLOY.md](./DOCKER_BUILD_CLOUD_DEPLOY.md)** - Detailed deployment guide
- **[DOCKER_BUILD_CLOUD_DEPLOY.md](./DOCKER_BUILD_CLOUD_DEPLOY.md)** - Comparison with other options

---

## Prerequisites

1. **Docker Desktop** - Latest version with Build Cloud enabled
2. **Docker Hub account** - Free tier works
3. **Google Cloud account** - Free tier ($300 credit) works

---

## Cost

- **Docker Build Cloud**: Free 7-day trial, then $7/month (Pro plan)
- **Google Cloud Run**: Free tier (2M requests/month), then ~$0-5/month for low traffic

**Total: ~$7-12/month** (after free trial/credits)

---

## Comparison with Other Options

| Feature | Railway | Modal | Cloud Run (Docker Build Cloud) |
|---------|---------|-------|-------------------------------|
| **Build Speed** | Normal | Normal | **2-5x faster** |
| **Cost When Idle** | ~$5-20/month | $0 | **$0** (scales to zero) |
| **Cold Start** | 30-60s | 2-5s | **2-5s** |
| **Setup Complexity** | Medium | Medium | **Low** |
| **Free Tier** | Limited | $30/month credit | **$300 credit** |

---

## Next Steps

1. ✅ Enable Docker Build Cloud in Docker Desktop
2. ✅ Build image: `./build-cloud.sh`
3. ✅ Deploy to Cloud Run: `./deploy-cloud-run.sh`
4. ✅ Test deployment: `curl https://YOUR_URL/health`
5. ✅ Update frontend `.env.local` with new URL

---

**Ready to deploy? Follow the [Quick Start Guide](./DOCKER_BUILD_CLOUD_QUICKSTART.md)!**

