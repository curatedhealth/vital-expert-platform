# Python AI Engine - Deployment Guide

## Overview

The VITAL Python AI Engine is a FastAPI service that handles all AI/ML operations for the VITAL platform. It follows the Golden Rule: All AI/ML services must be in Python and accessed via API Gateway.

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Start the service
./scripts/docker-python-start.sh

# Or manually:
docker-compose -f docker-compose.python-only.yml up -d

# View logs
docker-compose -f docker-compose.python-only.yml logs -f

# Stop the service
docker-compose -f docker-compose.python-only.yml down
```

### Option 2: Manual Docker Build

```bash
cd services/ai-engine

# Build image
docker build -t vital-ai-engine:latest .

# Run container
docker run -d \
  --name vital-ai-engine \
  -p 8000:8000 \
  -e OPENAI_API_KEY=your_key \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -v $(pwd)/logs:/app/logs \
  vital-ai-engine:latest
```

### Option 3: Local Development

```bash
cd services/ai-engine

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your values

# Run server
python start.py
```

## Environment Variables

Required:
- `OPENAI_API_KEY` - OpenAI API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

Optional:
- `PORT` - Server port (default: 8000)
- `LOG_LEVEL` - Logging level (default: info)
- `REDIS_URL` - Redis connection URL for caching
- `DATABASE_URL` - Database connection string

See `services/ai-engine/.env.example` for all available variables.

## Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0",
  "timestamp": "2025-02-01T12:00:00Z"
}
```

## API Endpoints

All endpoints are documented at `http://localhost:8000/docs` when the service is running.

Key endpoints:
- `POST /api/agents/query` - Query an agent
- `POST /api/agents/select` - Select best agent
- `POST /api/mode1/manual` - Mode 1: Manual Interactive
- `POST /api/mode2/automatic` - Mode 2: Automatic Selection
- `POST /api/mode3/autonomous-automatic` - Mode 3: Autonomous-Automatic
- `POST /api/mode4/autonomous-manual` - Mode 4: Autonomous-Manual
- `POST /api/embeddings/generate` - Generate embeddings
- `POST /api/panel/orchestrate` - Panel orchestration
- `POST /v1/chat/completions` - Chat completions (OpenAI-compatible)

## Monitoring

- Health check: `GET /health`
- Logs: Structured JSON logging via stdout
- Metrics: Prometheus metrics (if enabled)

## Troubleshooting

**Service won't start:**
- Check environment variables are set
- Verify OpenAI API key is valid
- Ensure Supabase connection works
- Check port 8000 is available

**High latency:**
- Check Redis connection (if enabled)
- Verify Supabase database performance
- Monitor OpenAI API rate limits

**Memory issues:**
- Reduce `max_tokens` in requests
- Enable response streaming
- Monitor container memory limits

## Production Considerations

1. **Security:**
   - Never commit `.env` files
   - Use secrets management (e.g., Docker secrets, Kubernetes secrets)
   - Enable HTTPS in production
   - Use authentication for API endpoints

2. **Scaling:**
   - Use Docker Compose with multiple replicas
   - Consider Kubernetes for production
   - Enable Redis for caching
   - Use load balancer for multiple instances

3. **Monitoring:**
   - Set up logging aggregation (e.g., ELK stack)
   - Enable Prometheus metrics
   - Set up alerting for service health
   - Monitor API rate limits

4. **Backup:**
   - Regular database backups
   - Document version pinning
   - Configuration versioning

## Support

For issues or questions, contact the VITAL Platform team.

