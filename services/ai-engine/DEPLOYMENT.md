# VITAL AI Engine - Deployment Guide

This guide covers deployment options for the VITAL AI Engine (Python FastAPI service).

---

## Deployment Options

### 1. Docker Compose (Local/Development)

**Quick Start:**
```bash
# Build and start the service
docker-compose -f docker-compose.python-only.yml up -d --build

# View logs
docker-compose -f docker-compose.python-only.yml logs -f python-ai-engine

# Stop the service
docker-compose -f docker-compose.python-only.yml down
```

**Configuration:**
- Resource limits: 2 CPUs, 4GB RAM
- Health check: Automatic every 30s
- Logs: Mounted to `./logs/python/`

---

### 2. Modal (Serverless Containers)

**Prerequisites:**
```bash
pip install modal
modal setup
```

**Deployment:**
```bash
cd services/ai-engine
modal deploy modal_deploy.py
```

**Configuration:**
- **Secrets:** Create `vital-ai-engine-secrets` in Modal dashboard with:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - `PINECONE_API_KEY`
  - `PINECONE_INDEX_NAME`
  - Other required environment variables

**Resource Limits:**
- CPU: 2.0 cores
- Memory: 4GB
- Concurrent requests: 10
- Container idle timeout: 5 minutes

**Access:**
- Health check: `https://<your-app>.modal.run/health`
- Main API: `https://<your-app>.modal.run/`

---

### 3. Railway (Docker Containers)

**Prerequisites:**
1. Create Railway account
2. Install Railway CLI: `npm i -g @railway/cli`

**Deployment:**
```bash
cd services/ai-engine
railway login
railway init
railway up
```

**Configuration:**
- Resource limits: 2 CPUs, 4GB RAM
- Health check: Automatic via `/health` endpoint
- Auto-restart: On failure (max 10 retries)

**Environment Variables:**
Set in Railway dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `PORT` (optional, defaults to 8000)
- `LOG_LEVEL` (optional, defaults to info)

**Monitoring:**
- Railway provides built-in metrics and logs
- Health checks displayed in dashboard

---

## Docker Image Optimization

The Dockerfile uses a **multi-stage build** for smaller production images:

**Stage 1 (Builder):**
- Installs build dependencies (gcc, g++, build-essential)
- Creates Python virtual environment
- Installs all Python dependencies

**Stage 2 (Runtime):**
- Minimal base image (python:3.12-slim)
- Only runtime dependencies (curl for health checks)
- Copies virtual environment from builder
- Non-root user for security

**Benefits:**
- Smaller final image (~400MB vs ~800MB)
- Faster deployments
- Better security (minimal attack surface)
- No build tools in production image

---

## Health Checks

All deployment methods use the `/health` endpoint:

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "vital-ai-engine",
  "version": "1.0.0"
}
```

**Health Check Configuration:**
- Interval: 30 seconds
- Timeout: 10 seconds
- Start period: 40 seconds (allows app to start)
- Retries: 3

---

## Resource Limits

**Production Recommendations:**
- **CPU:** 2.0 cores (handles concurrent requests)
- **Memory:** 4GB (enough for LangChain + embeddings)
- **Concurrent Requests:** 10 (adjust based on load)

**Minimum (Development):**
- **CPU:** 0.5 cores
- **Memory:** 512MB
- **Concurrent Requests:** 5

---

## Environment Variables

### Required
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_INDEX_NAME` - Pinecone index name

### Optional
- `PORT` - Server port (default: 8000)
- `LOG_LEVEL` - Logging level (default: info)
- `EMBEDDING_PROVIDER` - Embedding provider (default: openai)
- `REDIS_URL` - Redis connection URL (optional)
- `DATABASE_URL` - Direct PostgreSQL connection (optional)
- `WORKERS` - Uvicorn workers (default: 1, not recommended for Docker)

---

## Logging

**Log Location:**
- Docker Compose: `./logs/python/`
- Container: `/app/logs/`

**Log Levels:**
- `debug` - Verbose debugging
- `info` - Production (recommended)
- `warning` - Warnings only
- `error` - Errors only

**Structured Logging:**
- Uses `structlog` for JSON-formatted logs
- Includes request IDs for tracing
- Exports metrics to Prometheus

---

## Troubleshooting

### Container won't start
1. Check health endpoint: `curl http://localhost:8000/health`
2. View logs: `docker-compose logs python-ai-engine`
3. Verify environment variables are set
4. Check resource limits (may need to increase)

### Out of memory
1. Increase memory limit to 4GB or higher
2. Check for memory leaks in logs
3. Reduce concurrent requests

### Health check failing
1. Verify `/health` endpoint responds: `curl http://localhost:8000/health`
2. Check start period (app needs time to start)
3. Verify port is correct (default: 8000)

### Slow responses
1. Increase CPU limit to 2.0+ cores
2. Check database connection pooling
3. Verify Redis is configured (for caching)
4. Monitor external API latency (OpenAI, Pinecone)

---

## Security Best Practices

1. **Non-root user:** Container runs as `appuser` (UID 1000)
2. **Minimal base image:** Only essential packages in runtime
3. **Secrets management:** Use environment variables or secrets manager
4. **Health checks:** Monitor container health automatically
5. **Resource limits:** Prevent resource exhaustion attacks

---

## Monitoring

**Metrics Endpoint:**
```bash
curl http://localhost:8000/metrics
```

**Prometheus Metrics:**
- Request count
- Request duration
- Error rate
- Active connections

**Integration:**
- Configure Prometheus to scrape `/metrics`
- Set up Grafana dashboards
- Create alerting rules

---

**Last Updated:** February 1, 2025
**Status:** Production Ready ✅

