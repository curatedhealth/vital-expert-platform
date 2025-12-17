# VITAL Platform - Docker Infrastructure

Production-ready Docker configuration for the VITAL AI Platform.

## Quick Start

### 1. Copy Environment File
```bash
cd infrastructure/docker
cp .env.example .env
# Edit .env with your credentials
```

### 2. Start Services

**Development (API + Workers + Redis):**
```bash
docker-compose up -d
```

**Full Stack (includes Frontend):**
```bash
docker-compose --profile full-stack up -d
```

**With Local PostgreSQL (for offline development):**
```bash
docker-compose --profile local-db up -d
```

### 3. Verify Services
```bash
# Check all services
docker-compose ps

# Check API health
curl http://localhost:8000/health

# Check Flower dashboard (Celery monitoring)
open http://localhost:5555
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Compose Stack                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Frontend   │───▶│     API      │◀──▶│    Redis     │       │
│  │  (Next.js)   │    │  (FastAPI)   │    │  (Broker)    │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                    │               │
│         │                   │                    ▼               │
│         │                   │           ┌──────────────┐        │
│         │                   │           │   Workers    │        │
│         │                   │           │ ┌──────────┐ │        │
│         │                   │           │ │Execution │ │        │
│         │                   │           │ ├──────────┤ │        │
│         │                   │           │ │Ingestion │ │        │
│         │                   │           │ ├──────────┤ │        │
│         │                   │           │ │Discovery │ │        │
│         │                   │           │ └──────────┘ │        │
│         │                   │           └──────────────┘        │
│         │                   │                    │               │
│         ▼                   ▼                    ▼               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Supabase (External) / PostgreSQL           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| `api` | 8000 | FastAPI backend server |
| `worker-execution` | - | Mode 3/4, Panels, Workflows |
| `worker-ingestion` | - | Document processing, embeddings |
| `worker-discovery` | - | Ontology scanning, personalization |
| `celery-beat` | - | Scheduled task scheduler |
| `flower` | 5555 | Celery monitoring dashboard |
| `redis` | 6379 | Message broker & cache |
| `postgres` | 5432 | Local database (optional) |
| `frontend` | 3000 | Next.js frontend (optional) |

## Commands

### Build
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build api

# Build with no cache
docker-compose build --no-cache
```

### Run
```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d api redis worker-execution

# View logs
docker-compose logs -f api
docker-compose logs -f worker-execution

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ data loss)
docker-compose down -v
```

### Scale Workers
```bash
# Scale execution workers for high load
docker-compose up -d --scale worker-execution=4

# Scale ingestion workers
docker-compose up -d --scale worker-ingestion=2
```

### Debug
```bash
# Shell into API container
docker-compose exec api bash

# Shell into worker container
docker-compose exec worker-execution bash

# Run tests in container
docker-compose run --rm api pytest tests/ -v

# Check Redis
docker-compose exec redis redis-cli
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | Anthropic API key (for Claude) |
| `PINECONE_API_KEY` | Yes | Pinecone vector DB key |
| `JWT_SECRET` | Yes | JWT signing secret |
| `SENTRY_DSN` | No | Sentry error tracking |

## Production Deployment

### 1. Use Production Compose File
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. Security Checklist
- [ ] Change default passwords
- [ ] Enable TLS/HTTPS
- [ ] Set secure JWT_SECRET (32+ chars)
- [ ] Restrict Redis access
- [ ] Enable Sentry monitoring
- [ ] Configure resource limits
- [ ] Set up log aggregation

### 3. Monitoring
- **Flower**: http://localhost:5555 (Celery tasks)
- **Health Check**: http://localhost:8000/health
- **Readiness**: http://localhost:8000/ready
- **Metrics**: http://localhost:8000/metrics (Prometheus)

## Troubleshooting

### API won't start
```bash
# Check logs
docker-compose logs api

# Verify dependencies
docker-compose exec api pip list

# Test database connection
docker-compose exec api python -c "from supabase import create_client; print('OK')"
```

### Workers not processing tasks
```bash
# Check worker logs
docker-compose logs worker-execution

# Verify Redis connection
docker-compose exec redis redis-cli ping

# Check Flower for task status
open http://localhost:5555
```

### Redis connection refused
```bash
# Ensure Redis is healthy
docker-compose ps redis

# Restart Redis
docker-compose restart redis
```

## Development Tips

### Hot Reload
The development API container includes hot reload:
```bash
docker-compose up api
# Changes to src/ will auto-reload
```

### Run Specific Tests
```bash
docker-compose run --rm api pytest tests/integration/test_workflow_execution_e2e.py -v
```

### Access Container Shell
```bash
docker-compose exec api bash
```

---

**Version**: 1.0.0  
**Last Updated**: December 5, 2025











