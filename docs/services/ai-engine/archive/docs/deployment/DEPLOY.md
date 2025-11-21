# VITAL AI Engine - Docker Deployment Guide

## Quick Start

### Build Docker Image

```bash
cd services/ai-engine
./docker-build.sh
```

Or build with a custom tag:

```bash
./docker-build.sh v1.0.0
```

### Run with Docker Compose

```bash
# From project root
docker-compose up -d python-ai-services
```

### Run Standalone Container

```bash
docker run -d \
  --name vital-ai-engine \
  -p 8000:8000 \
  -e SUPABASE_URL=your_supabase_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -e OPENAI_API_KEY=your_openai_key \
  vital-ai-engine:latest
```

## Manual Build Steps

### 1. Clean Previous Builds

```bash
# Stop and remove containers
docker ps -a --filter "name=vital-ai-engine" --format "{{.ID}}" | xargs docker rm -f

# Remove old images
docker images "vital-ai-engine:*" --format "{{.ID}}" | xargs docker rmi -f

# Optional: Prune build cache
docker builder prune -f
```

### 2. Build Image

```bash
cd services/ai-engine
docker build -t vital-ai-engine:latest .
```

### 3. Verify Build

```bash
docker images vital-ai-engine
docker inspect vital-ai-engine:latest
```

### 4. Test Container

```bash
# Run in foreground for testing
docker run --rm -p 8000:8000 vital-ai-engine:latest

# In another terminal, test health endpoint
curl http://localhost:8000/health
```

## Environment Variables

Required environment variables:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key (for LLM calls)

Optional environment variables:

- `PORT` - Server port (default: 8000)
- `LOG_LEVEL` - Logging level (default: info)
- `WORKERS` - Number of worker processes (default: 1)
- `RELOAD` - Enable auto-reload for development (default: false)

## Production Deployment

### Health Checks

The container includes a health check endpoint at `/health`. Docker will automatically monitor this.

### Logs

View container logs:

```bash
docker logs vital-ai-engine
docker logs -f vital-ai-engine  # Follow logs
```

### Scaling

To scale with docker-compose:

```bash
docker-compose up -d --scale python-ai-services=3
```

## Troubleshooting

### Build Fails

1. Check Python version compatibility (requires 3.12)
2. Verify requirements.txt is correct
3. Check Docker build logs for specific errors

### Container Won't Start

1. Check environment variables are set
2. Verify port 8000 is not in use
3. Check container logs: `docker logs vital-ai-engine`

### Health Check Fails

1. Check if server is responding: `curl http://localhost:8000/health`
2. Verify all dependencies are installed
3. Check logs for startup errors

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Build Docker image
  run: |
    cd services/ai-engine
    docker build -t vital-ai-engine:${{ github.sha }} .
```

### Docker Hub Push

```bash
docker tag vital-ai-engine:latest yourusername/vital-ai-engine:latest
docker push yourusername/vital-ai-engine:latest
```

