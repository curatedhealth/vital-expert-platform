# 🚂 Railway Deployment Documentation

**Project**: VITAL Path AI Engine  
**Last Updated**: November 4, 2025  
**Status**: ✅ Deployed to Production

---

## 📋 Quick Links

| Document | Purpose | Location |
|----------|---------|----------|
| **Environment Variables Guide** | Complete reference for all 40+ env vars | [`guides/RAILWAY_ENVIRONMENT_VARIABLES_GUIDE.md`](./guides/RAILWAY_ENVIRONMENT_VARIABLES_GUIDE.md) |
| **Setup Complete Guide** | Quick start checklist | [`guides/RAILWAY_ENV_SETUP_COMPLETE.md`](./guides/RAILWAY_ENV_SETUP_COMPLETE.md) |
| **Port Configuration** | Port 8080 alignment fix | [`guides/RAILWAY_PORT_FIX_APPLIED.md`](./guides/RAILWAY_PORT_FIX_APPLIED.md) |
| **Setup Helper Script** | Interactive setup script | [`guides/setup-railway-env.sh`](./guides/setup-railway-env.sh) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Railway account and project created
- AI Engine service deployed (or ready to deploy)
- Access to `.env.vercel` for API keys

### 2. Quick Deployment (5 Minutes)

```bash
# Step 1: Set up Railway configuration (already done)
# railway.toml is at repo root
# Dockerfile is at services/ai-engine/Dockerfile

# Step 2: Link to Railway project
cd services/ai-engine
railway link

# Step 3: Set environment variables
# Go to Railway Dashboard → Variables tab
# Copy from .env.vercel or use guides/RAILWAY_ENVIRONMENT_VARIABLES_GUIDE.md

# Step 4: Deploy
railway up

# Step 5: Verify
curl https://your-app.railway.app/health
```

### 3. Detailed Setup

Follow the comprehensive guide: [`guides/RAILWAY_ENV_SETUP_COMPLETE.md`](./guides/RAILWAY_ENV_SETUP_COMPLETE.md)

---

## 🔧 Configuration Files

### At Repo Root
- **`railway.toml`** - Railway service configuration
  - Specifies Dockerfile path for monorepo
  - Sets health check path and timeout
  - Configures restart policy

### In `services/ai-engine/`
- **`Dockerfile`** - Container build configuration
- **`start.py`** - Application startup script
- **`requirements.txt`** - Python dependencies

---

## 📊 Current Deployment

### Production URL
```
https://vital-expert-platform-production.up.railway.app
```

### Configuration
- **Port**: 8080
- **Health Check**: `/health` (60s timeout)
- **Restart Policy**: ON_FAILURE (max 10 retries)
- **Regions**: us-west2, europe-west4

### Environment Variables
See [`guides/RAILWAY_ENVIRONMENT_VARIABLES_GUIDE.md`](./guides/RAILWAY_ENVIRONMENT_VARIABLES_GUIDE.md)

**Critical (5 vars)**:
- PORT, OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

**High Priority (7 vars)**:
- TAVILY_API_KEY, LANGCHAIN_API_KEY, HUGGINGFACE_API_KEY, GOOGLE_API_KEY, etc.

**Optional (30+ vars)**:
- Pinecone, Redis, LangFuse, confidence tuning, etc.

---

## 🔍 Troubleshooting

### Common Issues

| Issue | Solution | Reference |
|-------|----------|-----------|
| **502 Bad Gateway** | Check port alignment (8080) and environment variables | [`troubleshooting/RAILWAY_DEPLOYMENT_FAILURE_REPORT.md`](./troubleshooting/RAILWAY_DEPLOYMENT_FAILURE_REPORT.md) |
| **Health Check Failing** | Verify app starts correctly, check logs | [`troubleshooting/RAILWAY_HEALTH_CHECK_FAILURE_DIAGNOSIS.md`](./troubleshooting/RAILWAY_HEALTH_CHECK_FAILURE_DIAGNOSIS.md) |
| **Build Errors** | Check Dockerfile, dependencies | [`troubleshooting/RAILWAY_BUILD_ERROR_FIX.md`](./troubleshooting/RAILWAY_BUILD_ERROR_FIX.md) |
| **Services "unavailable"** | Add missing API keys | [`guides/RAILWAY_ENVIRONMENT_VARIABLES_GUIDE.md`](./guides/RAILWAY_ENVIRONMENT_VARIABLES_GUIDE.md) |

### Debugging Steps
1. Check Railway logs for startup errors
2. Verify all CRITICAL environment variables are set
3. Test health endpoint: `curl https://your-app.railway.app/health`
4. Check service status in health response (supabase, agent_orchestrator, etc.)

See: [`troubleshooting/RAILWAY_URGENT_DEBUG_GUIDE.md`](./troubleshooting/RAILWAY_URGENT_DEBUG_GUIDE.md)

---

## 📂 Directory Structure

```
docs/deployment/railway/
├── README.md (this file)
├── guides/
│   ├── RAILWAY_ENVIRONMENT_VARIABLES_GUIDE.md  # Complete env vars reference
│   ├── RAILWAY_ENV_SETUP_COMPLETE.md          # Quick start guide
│   ├── RAILWAY_PORT_FIX_APPLIED.md            # Port configuration
│   └── setup-railway-env.sh                    # Interactive setup script
├── troubleshooting/
│   ├── RAILWAY_DEPLOYMENT_FAILURE_REPORT.md   # Deployment failure analysis
│   ├── RAILWAY_HEALTH_CHECK_FAILURE_DIAGNOSIS.md
│   ├── RAILWAY_BUILD_ERROR_FIX.md
│   └── RAILWAY_URGENT_DEBUG_GUIDE.md
└── archive/
    ├── RAILWAY_DEPLOYMENT_IN_PROGRESS.md      # Historical docs
    ├── RAILWAY_DIAGNOSTIC_IN_PROGRESS.md
    ├── RAILWAY_NEXT_STEPS.md
    ├── NEXT_STEP_RAILWAY.md
    ├── RAILWAY_ROOT_DIRECTORY_FIX.md
    └── RAILWAY_MONOREPO_FIX_COMPLETE.md
```

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] Railway project created
- [ ] Service linked to GitHub repo
- [ ] `railway.toml` at repo root
- [ ] Dockerfile in `services/ai-engine/`
- [ ] All secrets available in `.env.vercel`

### Deployment
- [ ] Set 5 CRITICAL environment variables
- [ ] Deploy and verify app starts (port 8080)
- [ ] Test health endpoint returns 200
- [ ] Add HIGH PRIORITY variables
- [ ] Verify services show "healthy"

### Post-Deployment
- [ ] Monitor logs for errors
- [ ] Test AI endpoints (Mode 1-4)
- [ ] Verify web search works (Tavily)
- [ ] Check LangSmith traces
- [ ] Set up monitoring/alerts

---

## 📈 Monitoring

### Health Check
```bash
curl https://vital-expert-platform-production.up.railway.app/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0",
  "services": {
    "supabase": "healthy",
    "agent_orchestrator": "healthy",
    "rag_pipeline": "healthy",
    "unified_rag_service": "healthy"
  },
  "ready": true
}
```

### LangSmith Dashboard
- Project: `vital-advisory-board`
- URL: https://smith.langchain.com

### Railway Dashboard
- Logs: Real-time application logs
- Metrics: CPU, memory, network usage
- Deployments: Version history and rollback

---

## 🔐 Security

### API Keys Management
- ✅ All secrets stored in Railway Variables (not in code)
- ✅ `.gitignore` configured to exclude secret files
- ✅ GitHub push protection enabled
- ✅ Service role key used for backend operations
- ✅ Anon key used for client operations (RLS enforced)

### Best Practices
1. Never commit API keys to git
2. Rotate keys periodically
3. Use environment-specific keys (dev/staging/prod)
4. Monitor for unauthorized access
5. Enable Railway IP allowlisting if needed

---

## 🚀 CI/CD

### Current Setup
- **Trigger**: Push to `main` branch
- **Build**: Docker build from `services/ai-engine/Dockerfile`
- **Deploy**: Automatic deployment to production
- **Health Check**: Automatic with 60s timeout
- **Rollback**: Available via Railway dashboard

### Future Enhancements
- [ ] Staging environment (preview deployments)
- [ ] Automated testing before deployment
- [ ] Deployment notifications (Slack/Discord)
- [ ] Automated database migrations
- [ ] Blue-green deployments

---

## 📞 Support

### Documentation
- **Main Guide**: [`guides/RAILWAY_ENV_SETUP_COMPLETE.md`](./guides/RAILWAY_ENV_SETUP_COMPLETE.md)
- **Troubleshooting**: [`troubleshooting/`](./troubleshooting/)
- **Railway Docs**: https://docs.railway.app

### Quick Commands
```bash
# View logs
railway logs

# Open dashboard
railway open

# Deploy manually
railway up

# Check service status
railway status

# List environment variables
railway variables
```

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Health endpoint returns `200 OK`
- ✅ Services show `"healthy"` (not "unavailable")
- ✅ Railway logs show port 8080
- ✅ No 502 errors
- ✅ AI chat responds correctly
- ✅ Web search works (if Tavily configured)
- ✅ LangSmith traces appear

---

**Last Deployment**: November 4, 2025  
**Status**: ✅ Production Ready  
**Uptime**: Monitored via Railway dashboard

