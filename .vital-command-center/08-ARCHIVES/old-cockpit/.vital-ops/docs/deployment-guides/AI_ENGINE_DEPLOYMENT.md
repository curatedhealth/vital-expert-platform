# VITAL AI Engine - Deployment Guide

## Quick Start (Port 8080)

### 1. Install Dependencies

```bash
cd services/ai-engine
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create `.env` file:
```bash
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Server
PORT=8080
HOST=0.0.0.0

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379
```

### 3. Run the Server

#### Option A: Using uvicorn (Recommended)
```bash
cd services/ai-engine
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8080
```

#### Option B: Using Python directly
```bash
cd services/ai-engine
python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8080
```

#### Option C: Production (with workers)
```bash
cd services/ai-engine
uvicorn src.api.main:app --host 0.0.0.0 --port 8080 --workers 4
```

### 4. Verify Server is Running

```bash
# Health check
curl http://localhost:8080/health

# Mode 1 health check
curl http://localhost:8080/api/mode1/health

# API documentation
open http://localhost:8080/docs
```

## Production Deployment

### Railway.app

1. Create `railway.toml`:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn src.api.main:app --host 0.0.0.0 --port 8080 --workers 4"
healthcheckPath = "/health"
healthcheckTimeout = 100

[[deploy.envs]]
PORT = "8080"
```

2. Deploy:
```bash
railway up
```

### Docker

1. Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "4"]
```

2. Build and run:
```bash
docker build -t vital-ai-engine .
docker run -p 8080:8080 --env-file .env vital-ai-engine
```

### Vercel (Edge Functions)

Not recommended for LangGraph workflows due to 10-second timeout limit.
Use Railway, Render, or AWS Lambda with longer timeouts.

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 8080 | Server port |
| `HOST` | No | 0.0.0.0 | Server host |
| `SUPABASE_URL` | Yes | - | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | - | Supabase service role key |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `REDIS_URL` | No | - | Redis connection URL (for caching) |
| `AI_ENGINE_URL` | No | http://localhost:8080 | AI Engine base URL |

## Monitoring

### Check Logs
```bash
# View real-time logs
tail -f ai-engine.log

# Search for errors
grep ERROR ai-engine.log

# Mode 1 specific logs
grep "Mode1" ai-engine.log
```

### Health Checks
```bash
# Overall health
curl http://localhost:8080/health

# Mode 1 health
curl http://localhost:8080/api/mode1/health

# Hybrid search health
curl http://localhost:8080/api/hybrid-search/health
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Connection Refused
```bash
# Check if server is running
ps aux | grep uvicorn

# Check if port is open
telnet localhost 8080
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check Python path
echo $PYTHONPATH

# Set Python path if needed
export PYTHONPATH="${PYTHONPATH}:/path/to/services/ai-engine/src"
```

## Performance Tuning

### Workers Configuration
```bash
# Development: 1 worker
uvicorn src.api.main:app --port 8080 --workers 1

# Production: 4 workers (CPU cores * 2)
uvicorn src.api.main:app --port 8080 --workers 4

# High traffic: 8 workers
uvicorn src.api.main:app --port 8080 --workers 8
```

### Memory Optimization
```bash
# Limit memory per worker
uvicorn src.api.main:app --port 8080 --workers 4 --limit-max-requests 1000
```

## Next Steps

After deploying the Python backend:

1. ✅ Update Next.js environment variables
2. ✅ Deploy Next.js frontend
3. ✅ Test end-to-end Mode 1 workflow
4. ✅ Set up monitoring (Prometheus + Grafana)
5. ✅ Configure auto-scaling

---

**Port**: 8080  
**Documentation**: http://localhost:8080/docs  
**Health**: http://localhost:8080/health


