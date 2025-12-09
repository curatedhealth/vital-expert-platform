# Ask Expert Deployment Runbook

**Version:** 2.0.0  
**Last Updated:** December 6, 2025  
**Service:** Ask Expert (4-Mode Execution Matrix)  
**Owner:** AI Platform Team

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Service Architecture](#service-architecture)
3. [Deployment Steps](#deployment-steps)
4. [Rollback Procedures](#rollback-procedures)
5. [Health Checks](#health-checks)
6. [Monitoring & Alerting](#monitoring--alerting)
7. [Incident Response](#incident-response)
8. [Configuration Reference](#configuration-reference)

---

## Pre-Deployment Checklist

### Environment Requirements

| Requirement | Staging | Production |
|-------------|---------|------------|
| **API Instances** | 2 | 3+ |
| **Worker Instances** | 1 | 2+ |
| **Memory per Instance** | 2GB | 4GB |
| **CPU per Instance** | 1 core | 2 cores |
| **Redis** | 1GB | 4GB |
| **Database** | Supabase Pro | Supabase Pro |

### Pre-Flight Checks

```bash
# 1. Verify environment variables
./scripts/check-env.sh

# 2. Run database migrations status
alembic current
alembic heads

# 3. Verify Supabase connectivity
curl -s $SUPABASE_URL/rest/v1/ -H "apikey: $SUPABASE_ANON_KEY" | jq .

# 4. Verify Redis connectivity
redis-cli -u $REDIS_URL PING

# 5. Verify LLM API keys
curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"ping"}]}'

# 6. Check Langfuse connectivity
curl -s $LANGFUSE_HOST/api/public/health

# 7. Run smoke tests
pytest tests/smoke/ -v
```

### Code Verification

```bash
# 1. Ensure all tests pass
pytest services/ai-engine/src/tests/ -v --cov

# 2. Verify linting
ruff check services/ai-engine/src/

# 3. Type checking
mypy services/ai-engine/src/ --ignore-missing-imports

# 4. Security scan
bandit -r services/ai-engine/src/
```

---

## Service Architecture

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                           │
│                    (AWS ALB / Cloudflare)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  API Pod 1  │ │  API Pod 2  │ │  API Pod 3  │
    │   FastAPI   │ │   FastAPI   │ │   FastAPI   │
    │  (8 workers)│ │  (8 workers)│ │  (8 workers)│
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Redis     │ │  Supabase   │ │  Langfuse   │
    │  (Cache/Q)  │ │  (DB/Vec)   │ │  (Observ)   │
    └─────────────┘ └─────────────┘ └─────────────┘
```

### Mode-Specific Endpoints

| Mode | Endpoint | Method | Timeout |
|------|----------|--------|---------|
| Mode 1 | `/api/v1/expert/mode1/stream` | POST (SSE) | 60s |
| Mode 2 | `/api/v1/expert/mode2/stream` | POST (SSE) | 90s |
| Mode 3 | `/api/v1/expert/mode3/stream` | POST (SSE) | 300s |
| Mode 4 | `/api/v1/expert/mode4/stream` | POST (SSE) | 600s |

---

## Deployment Steps

### Standard Deployment (CI/CD)

The CI/CD pipeline handles deployments automatically:

1. Push to `develop` → Deploys to **staging**
2. Push to `main` → Deploys to **production** (after staging verification)

### Manual Deployment

#### Step 1: Pull Latest Images

```bash
# Production
ssh production-host
cd /opt/vital-path-production

# Update image tags
export IMAGE_TAG=main-abc1234

# Pull images
docker compose pull
```

#### Step 2: Database Migrations

```bash
# Run migrations (if any)
docker compose run --rm api alembic upgrade head

# Verify migration status
docker compose run --rm api alembic current
```

#### Step 3: Deploy Services

```bash
# Rolling deployment (zero downtime)
docker compose up -d --no-deps --scale api=3 api

# Wait for health checks
./scripts/wait-for-healthy.sh api 30

# Deploy workers
docker compose up -d --no-deps worker
```

#### Step 4: Verify Deployment

```bash
# Health check
curl -f https://api.vitalpath.ai/health

# Mode-specific health checks
curl -f https://api.vitalpath.ai/api/v1/expert/mode1/health
curl -f https://api.vitalpath.ai/api/v1/expert/mode2/health
curl -f https://api.vitalpath.ai/api/v1/expert/mode3/health
curl -f https://api.vitalpath.ai/api/v1/expert/mode4/health

# Run smoke tests
./scripts/smoke-tests.sh production
```

#### Step 5: Post-Deployment Monitoring

```bash
# Watch logs for errors
docker compose logs -f api --since 5m | grep -E "(ERROR|CRITICAL)"

# Check Langfuse traces
# Visit: https://cloud.langfuse.com/project/vital/traces

# Monitor metrics
# Visit: https://monitoring.vitalpath.ai/d/ask-expert
```

---

## Rollback Procedures

### Automatic Rollback (CI/CD)

The CI/CD pipeline automatically rolls back if:
- Health checks fail after 60 seconds
- Error rate exceeds 5% within 5 minutes
- P99 latency exceeds 30 seconds

### Manual Rollback

#### Quick Rollback (< 5 minutes)

```bash
# SSH to production
ssh production-host
cd /opt/vital-path-production

# Rollback to previous image
export IMAGE_TAG=main-previous123
docker compose up -d --no-deps api worker

# Verify
curl -f https://api.vitalpath.ai/health
```

#### Database Rollback (if migrations failed)

```bash
# Rollback last migration
docker compose run --rm api alembic downgrade -1

# Verify
docker compose run --rm api alembic current
```

#### Full Rollback (disaster recovery)

```bash
# Execute full rollback script
./scripts/rollback.sh

# This will:
# 1. Stop current containers
# 2. Restore previous image tags
# 3. Restore database from backup (if needed)
# 4. Restart services
# 5. Run health checks
```

---

## Health Checks

### Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/health` | Basic liveness | `{"status": "healthy"}` |
| `/health/detailed` | Full system check | All components healthy |
| `/api/v1/expert/mode{N}/health` | Mode-specific | Mode available |
| `/metrics` | Prometheus metrics | Metrics text |

### Health Check Script

```bash
#!/bin/bash
# scripts/health-check.sh

BASE_URL=${1:-"https://api.vitalpath.ai"}

echo "Checking health endpoints..."

# Basic health
if curl -sf "$BASE_URL/health" > /dev/null; then
    echo "✅ Basic health: OK"
else
    echo "❌ Basic health: FAILED"
    exit 1
fi

# Detailed health
DETAILED=$(curl -sf "$BASE_URL/health/detailed")
if echo "$DETAILED" | jq -e '.database == "healthy" and .redis == "healthy"' > /dev/null; then
    echo "✅ Detailed health: OK"
else
    echo "❌ Detailed health: FAILED"
    echo "$DETAILED" | jq .
    exit 1
fi

# Mode endpoints
for MODE in 1 2 3 4; do
    if curl -sf "$BASE_URL/api/v1/expert/mode${MODE}/health" > /dev/null; then
        echo "✅ Mode $MODE: OK"
    else
        echo "❌ Mode $MODE: FAILED"
        exit 1
    fi
done

echo "All health checks passed!"
```

---

## Monitoring & Alerting

### Key Metrics

| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate (5xx) | > 1% | > 5% |
| P95 Latency | > 3s | > 10s |
| Mode 1 TTFT | > 1s | > 3s |
| Mode 2 Fusion Time | > 2s | > 5s |
| Queue Depth | > 50 | > 200 |
| Memory Usage | > 70% | > 90% |
| CPU Usage | > 70% | > 90% |

### Grafana Dashboards

- **Ask Expert Overview**: `https://monitoring.vitalpath.ai/d/ask-expert`
- **Mode Performance**: `https://monitoring.vitalpath.ai/d/ask-expert-modes`
- **Agent Activity**: `https://monitoring.vitalpath.ai/d/agent-hierarchy`
- **Fusion Intelligence**: `https://monitoring.vitalpath.ai/d/fusion-engine`

### Alert Configuration

```yaml
# alerts/ask-expert-alerts.yml
groups:
  - name: ask-expert
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{service="ask-expert",status=~"5.."}[5m]) / rate(http_requests_total{service="ask-expert"}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on Ask Expert service"
          
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service="ask-expert"}[5m])) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency on Ask Expert service"
          
      - alert: FusionEngineTimeout
        expr: rate(fusion_timeouts_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Fusion Engine experiencing timeouts"
```

### Langfuse Traces

All Ask Expert requests are traced in Langfuse:

```python
# Trace naming convention
trace_name = f"ask_expert_{mode}_{session_id[:8]}"

# Key spans to monitor
# - agent_instantiation
# - context_resolution
# - fusion_selection
# - rag_retrieval
# - llm_generation
# - tool_execution
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **SEV1** | Service down | 15 min | All modes unavailable |
| **SEV2** | Major degradation | 30 min | One mode failing |
| **SEV3** | Minor degradation | 2 hours | High latency |
| **SEV4** | Issue detected | 24 hours | Sporadic errors |

### On-Call Escalation

1. **First Responder**: On-call engineer (PagerDuty)
2. **Escalation 1**: Team lead (15 min no response)
3. **Escalation 2**: Engineering manager (30 min no response)
4. **Escalation 3**: VP Engineering (1 hour, SEV1 only)

### Common Issues & Resolutions

#### Issue: High Error Rate

```bash
# 1. Check recent deployments
git log --oneline -10

# 2. Check error logs
docker compose logs api --since 10m | grep ERROR

# 3. Check external dependencies
./scripts/check-dependencies.sh

# 4. If deployment related, rollback
./scripts/rollback.sh
```

#### Issue: High Latency

```bash
# 1. Check resource usage
docker stats

# 2. Check database connections
docker compose exec api python -c "from core.database import check_pool; check_pool()"

# 3. Check Redis
redis-cli -u $REDIS_URL INFO clients

# 4. Scale if needed
docker compose up -d --scale api=5 api
```

#### Issue: Fusion Engine Failing

```bash
# 1. Check Pinecone/Vector DB
curl -s $PINECONE_URL/describe_index_stats

# 2. Check Neo4j (if using graph)
curl -s $NEO4J_URL/db/neo4j/cluster/available

# 3. Fallback to default agent selection
# Set FUSION_FALLBACK_ENABLED=true
```

#### Issue: LLM API Errors

```bash
# 1. Check API status
curl -s https://status.anthropic.com/api/v2/status.json | jq .

# 2. Check rate limits
# Review Langfuse traces for 429 errors

# 3. Enable fallback model
# Set LLM_FALLBACK_MODEL=gpt-4-turbo
```

---

## Configuration Reference

### Environment Variables

#### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJ...` |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `<random-32-chars>` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |

#### Optional (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `INFO` | Logging level |
| `WORKERS` | `8` | Uvicorn workers per instance |
| `MODE1_TIMEOUT` | `60` | Mode 1 request timeout (s) |
| `MODE2_TIMEOUT` | `90` | Mode 2 request timeout (s) |
| `MODE3_TIMEOUT` | `300` | Mode 3 request timeout (s) |
| `MODE4_TIMEOUT` | `600` | Mode 4 request timeout (s) |
| `FUSION_TIMEOUT` | `5` | Fusion retrieval timeout (s) |
| `FUSION_FALLBACK_ENABLED` | `true` | Enable fusion fallback |
| `LANGFUSE_ENABLED` | `true` | Enable Langfuse tracing |
| `LANGFUSE_HOST` | `https://cloud.langfuse.com` | Langfuse host |

### Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `FF_MODE4_ENABLED` | `true` | Enable Mode 4 autonomous |
| `FF_FUSION_SYNERGY` | `true` | Enable synergy boosting |
| `FF_HITL_STRICT` | `true` | Require HITL for critical actions |
| `FF_COST_TRACKING` | `true` | Enable cost tracking |

---

## Appendix

### Scripts Location

```
scripts/
├── check-env.sh           # Verify environment
├── check-dependencies.sh  # Check external deps
├── health-check.sh        # Run health checks
├── smoke-tests.sh         # Run smoke tests
├── rollback.sh            # Full rollback
├── backup-before-deploy.sh# Create backup
├── blue-green-deploy.sh   # Blue-green deployment
└── post-deploy-tests.sh   # Post-deployment tests
```

### Useful Commands

```bash
# View real-time logs
docker compose logs -f api worker

# Check active sessions
redis-cli -u $REDIS_URL KEYS "session:*" | wc -l

# Check queue depth
redis-cli -u $REDIS_URL LLEN ask_expert_queue

# Force garbage collection
docker compose exec api python -c "import gc; gc.collect()"

# Restart single container
docker compose restart api

# Check image versions
docker compose images
```

### Contact

- **Slack**: #ask-expert-ops
- **PagerDuty**: ask-expert-oncall
- **Email**: ai-platform@company.com

---

**Document Owner:** AI Platform Team  
**Review Cycle:** Monthly  
**Next Review:** January 6, 2026
