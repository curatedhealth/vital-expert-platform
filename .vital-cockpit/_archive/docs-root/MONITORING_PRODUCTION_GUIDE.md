# Monitoring & Observability - Production Guide

**Status:** Production Ready ✅  
**Date:** February 1, 2025  
**Phase:** 8.3 (Monitoring & Observability)

---

## Overview

Complete monitoring stack for VITAL Platform with Prometheus, Grafana, and Alertmanager.

---

## Monitoring Stack Components

### 1. Prometheus
- **Purpose:** Metrics collection and storage
- **Port:** 9090
- **Retention:** 90 days / 50GB
- **Scrape Interval:** 15 seconds

### 2. Grafana
- **Purpose:** Metrics visualization and dashboards
- **Port:** 3002
- **Credentials:** admin / vital-path-2025 (change in production!)
- **Dashboards:** Auto-provisioned from `monitoring/grafana/dashboards/`

### 3. Alertmanager
- **Purpose:** Alert routing and notifications
- **Port:** 9093
- **Configuration:** `monitoring/alertmanager/alertmanager.yml`

### 4. Node Exporter (Optional)
- **Purpose:** System metrics collection
- **Port:** 9100

---

## Metrics Endpoints

### Python AI Engine
- **Endpoint:** `http://localhost:8000/metrics`
- **Format:** Prometheus text format
- **Metrics:**
  - `vital_ai_requests_total` - Request count
  - `vital_ai_request_duration_seconds` - Request duration histogram
  - `vital_ai_rag_queries_total` - RAG query count
  - `vital_ai_rag_query_duration_seconds` - RAG query duration histogram
  - `vital_ai_vector_searches_total` - Vector search count
  - `vital_ai_vector_search_duration_seconds` - Vector search duration histogram
  - `vital_ai_active_agents` - Active agents gauge
  - `vital_ai_database_connections` - Database connections gauge

### API Gateway
- **Endpoint:** `http://localhost:3001/metrics`
- **Format:** Prometheus text format
- **Metrics:**
  - `api_gateway_uptime_seconds` - Service uptime
  - `api_gateway_memory_used_mb` - Memory usage
  - `api_gateway_memory_total_mb` - Total memory

### Frontend (Next.js)
- **Endpoint:** `http://localhost:3000/api/metrics`
- **Format:** Prometheus text format
- **Metrics:** Application-specific metrics

---

## Prometheus Configuration

### Scrape Targets

**Python AI Engine:**
- Job: `vital-python-ai-engine`
- Target: `host.docker.internal:8000` (local) or production URL
- Path: `/metrics`
- Interval: 15s

**API Gateway:**
- Job: `vital-api-gateway`
- Target: `host.docker.internal:3001` (local) or production URL
- Path: `/metrics`
- Interval: 15s

**Frontend:**
- Job: `vital-path-frontend`
- Target: `host.docker.internal:3000` (local) or production URL
- Path: `/api/metrics`
- Interval: 15s

### Alert Rules

**Python AI Engine Alerts** (`monitoring/prometheus/alerts/python-ai-engine-alerts.yml`):
- High error rate (>0.1 errors/sec for 5m)
- High request latency (P95 >5s for 10m)
- High RAG query latency (P95 >10s for 10m)
- Service unavailable (down for 2m)
- High database connections (>50 for 5m)
- High vector search latency (P95 >3s for 10m)

**RAG Alerts** (`monitoring/prometheus/alerts/rag-alerts.yml`):
- Existing RAG operation alerts

**Agent Operations Alerts** (`monitoring/prometheus/alerts/agent-operations-alerts.yml`):
- Agent search performance alerts

---

## Grafana Dashboards

### 1. Python AI Engine Dashboard
**File:** `monitoring/grafana/dashboards/python-ai-engine.json`

**Panels:**
1. Request Rate - Requests per second
2. Request Duration - P95 latency
3. Error Rate - Errors per second
4. RAG Query Rate - RAG queries per second
5. RAG Query Duration - P95 RAG latency
6. Vector Search Rate - Vector searches per second
7. Vector Search Duration - P95 vector search latency
8. Active Agents - Current active agents count
9. Database Connections - Current DB connections
10. Service Health - Up/Down status

### 2. Agent Operations Dashboard
**File:** `monitoring/grafana/dashboards/agent-operations.json`

**Panels:**
- Agent search performance
- GraphRAG metrics
- Agent selection metrics

### 3. RAG Operations Dashboard
**File:** `monitoring/grafana/dashboards/rag-operations.json`

**Panels:**
- RAG query performance
- Vector search metrics
- Embedding generation metrics

---

## Deployment

### Local Development

```bash
cd monitoring
docker-compose up -d
```

**Access:**
- Grafana: http://localhost:3002 (admin / vital-path-2025)
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

### Production Deployment

**Option 1: Docker Compose (Recommended for VPS/Dedicated Server)**
```bash
cd monitoring
docker-compose up -d
```

**Option 2: Kubernetes (For Cloud)**
- Deploy Prometheus via Helm chart
- Deploy Grafana via Helm chart
- Configure service discovery for metrics endpoints

**Option 3: Managed Services**
- Prometheus: Use Prometheus Cloud or Grafana Cloud
- Grafana: Use Grafana Cloud

---

## Structured Logging

### Python AI Engine
- **Library:** `structlog`
- **Format:** JSON
- **Output:** STDOUT (containerized)
- **Includes:** Request ID, tenant ID, correlation ID

### API Gateway
- **Library:** `morgan` (HTTP logging)
- **Format:** Combined/Dev format
- **Output:** STDOUT
- **Includes:** Request details, response time

### Frontend
- **Format:** Structured logging via Next.js
- **Output:** Vercel logs
- **Includes:** Request context, error details

---

## Distributed Tracing

**Status:** ⏳ Future Enhancement

**Recommendations:**
- Use OpenTelemetry for distributed tracing
- Integrate with Jaeger or Zipkin
- Trace requests across: Frontend → API Gateway → Python AI Engine

---

## Alerting Configuration

### Alertmanager Routes

**Critical Alerts:**
- Route to: PagerDuty / On-call rotation
- Examples: Service down, high error rate

**Warning Alerts:**
- Route to: Slack / Email
- Examples: High latency, resource usage

### Notification Channels

**Configure in:** `monitoring/alertmanager/alertmanager.yml`

**Supported:**
- Slack
- Email
- PagerDuty
- Webhook

---

## Metrics Export

### Python AI Engine

**Endpoint:** `GET /metrics`

**Example:**
```bash
curl http://localhost:8000/metrics
```

**Response:**
```
# HELP vital_ai_requests_total Total number of requests
# TYPE vital_ai_requests_total counter
vital_ai_requests_total{method="POST",endpoint="/api/mode1/manual",status="200"} 1523
...
```

### API Gateway

**Endpoint:** `GET /metrics`

**Example:**
```bash
curl http://localhost:3001/metrics
```

**Response:**
```
# HELP api_gateway_uptime_seconds API Gateway uptime in seconds
# TYPE api_gateway_uptime_seconds gauge
api_gateway_uptime_seconds 12345.67
...
```

---

## Production Configuration

### Prometheus Retention

**Current:** 90 days / 50GB

**For Production:**
- Increase retention if needed: `--storage.tsdb.retention.time=180d`
- Increase size limit: `--storage.tsdb.retention.size=100GB`

### Grafana Security

**Current Password:** `vital-path-2025`

**Production Actions:**
1. Change admin password
2. Create read-only user for dashboards
3. Enable authentication (LDAP/OAuth)
4. Enable HTTPS

### Network Configuration

**Local Development:**
- Prometheus connects to `host.docker.internal` to access services
- Works on Mac/Windows Docker Desktop

**Production:**
- Update `prometheus.yml` with production URLs
- Use service discovery for dynamic targets
- Configure authentication for metrics endpoints

---

## Monitoring Best Practices

### 1. Alert Fatigue Prevention
- Set reasonable thresholds
- Use alert grouping
- Configure alert silence rules

### 2. Dashboard Organization
- Group related metrics
- Use consistent naming
- Include alert annotations

### 3. Performance Monitoring
- Monitor P95/P99 latencies
- Track error rates
- Watch resource usage (CPU, Memory)

### 4. Business Metrics
- Track user requests
- Monitor agent usage
- Track RAG query patterns

---

## Troubleshooting

### Metrics Not Appearing

1. **Check Prometheus Targets:**
   - Go to Prometheus UI: http://localhost:9090/targets
   - Verify targets are "UP"
   - Check for scrape errors

2. **Verify Endpoints:**
   ```bash
   curl http://localhost:8000/metrics  # Python AI Engine
   curl http://localhost:3001/metrics  # API Gateway
   ```

3. **Check Network:**
   - Verify Docker networks are connected
   - Check firewall rules
   - Verify ports are accessible

### Grafana Dashboards Not Loading

1. **Check Provisioning:**
   - Verify dashboard files in `monitoring/grafana/dashboards/`
   - Check provisioning config: `monitoring/grafana/provisioning/dashboards/dashboards.yml`

2. **Check Permissions:**
   - Verify Grafana has read access to dashboard files
   - Check file permissions

### Alerts Not Firing

1. **Check Alert Rules:**
   - Verify rules loaded: Prometheus UI → Alerts
   - Check rule evaluation

2. **Check Alertmanager:**
   - Verify Alertmanager is configured in Prometheus
   - Check Alertmanager UI: http://localhost:9093

---

## Next Steps

### Immediate
- [ ] Deploy monitoring stack to production
- [ ] Configure production URLs in Prometheus
- [ ] Set up alert notifications (Slack/PagerDuty)
- [ ] Change Grafana admin password

### Future Enhancements
- [ ] Set up distributed tracing (OpenTelemetry)
- [ ] Add custom business metrics
- [ ] Create additional dashboards
- [ ] Set up log aggregation (ELK/Loki)

---

**Last Updated:** February 1, 2025  
**Status:** Production Ready ✅

