# VITAL Platform - Monitoring Setup Guide

**Created:** 2025-10-25
**Phase:** 5 Week 1 - Monitoring Dashboards
**Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [LangFuse Setup](#langfuse-setup)
6. [Prometheus & Grafana Setup](#prometheus--grafana-setup)
7. [Configuration](#configuration)
8. [Dashboards](#dashboards)
9. [Alerts](#alerts)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The VITAL Platform monitoring stack provides comprehensive observability across:

- **LangFuse** - LLM observability and tracing
- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards
- **AlertManager** - Alert routing and management

### Key Capabilities

✅ **LLM Observability**
- Request/response tracing
- Token usage and cost tracking
- Latency monitoring
- A/B test tracking

✅ **Application Metrics**
- Search performance (P50, P90, P99)
- Evidence detection analytics
- HITL queue statistics
- Compliance reporting

✅ **Infrastructure Metrics**
- Database performance
- Cache hit rates
- System resources
- Network latency

✅ **Alerts**
- SLA breach detection
- Compliance violations
- Performance degradation
- Resource exhaustion

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VITAL Platform                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Next.js    │  │   Python AI  │  │  PostgreSQL  │     │
│  │   Frontend   │  │   Services   │  │   Database   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         │ metrics          │ traces           │ metrics     │
│         ▼                  ▼                  ▼             │
└─────────────────────────────────────────────────────────────┘
         │                  │                  │
         │                  │                  │
         ▼                  ▼                  ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   Prometheus   │  │    LangFuse    │  │   Exporters    │
│   (Metrics)    │  │   (Traces)     │  │   (DB, Redis)  │
└────────┬───────┘  └────────┬───────┘  └────────┬───────┘
         │                   │                   │
         └───────────────────┴───────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │    Grafana     │
                    │  (Dashboards)  │
                    └────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  AlertManager  │
                    │   (Alerts)     │
                    └────────────────┘
```

---

## Prerequisites

### Required Software

- **Docker** 20.10+ & **Docker Compose** 2.0+
- **Git** (to clone LangFuse repository)
- **curl** or **wget** (for health checks)

### Required Ports

Ensure these ports are available:

| Service | Port | Purpose |
|---------|------|---------|
| LangFuse | 3000 | LLM observability UI |
| Grafana | 3001 | Dashboard UI |
| Prometheus | 9090 | Metrics API |
| AlertManager | 9093 | Alert management |
| Postgres Exporter | 9187 | DB metrics |
| Redis Exporter | 9121 | Cache metrics |
| Node Exporter | 9100 | System metrics |

### Environment Variables

Create a `.env.monitoring` file:

```bash
# LangFuse
LANGFUSE_PORT=3000
LANGFUSE_URL=http://localhost:3000
LANGFUSE_DB_PASSWORD=your_secure_langfuse_password
LANGFUSE_NEXTAUTH_SECRET=your_secret_key_min_32_chars_long
LANGFUSE_SALT=your_unique_salt_min_32_chars_long
LANGFUSE_TELEMETRY_ENABLED=false

# Grafana
GRAFANA_PORT=3001
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your_secure_admin_password
GRAFANA_URL=http://localhost:3001

# Prometheus
PROMETHEUS_PORT=9090

# Database
DB_HOST=host.docker.internal
DB_PORT=54322
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=host.docker.internal
REDIS_PORT=6379
REDIS_PASSWORD=

# Environment
ENVIRONMENT=production
```

---

## Quick Start

### 1. Clone LangFuse Repository

```bash
# Get LangFuse
git clone https://github.com/langfuse/langfuse.git
cd langfuse

# Run LangFuse
docker compose up -d
```

**Wait for LangFuse to be ready:**
```bash
# Check health
curl http://localhost:3000/api/public/health
```

### 2. Start VITAL Monitoring Stack

```bash
# Navigate to monitoring directory
cd /path/to/vital/backend/monitoring

# Start all services
docker-compose -f docker-compose.monitoring.yml up -d
```

### 3. Verify Services

```bash
# Check all services are running
docker-compose -f docker-compose.monitoring.yml ps

# Expected output:
# vital-langfuse-server   running   0.0.0.0:3000->3000/tcp
# vital-grafana           running   0.0.0.0:3001->3000/tcp
# vital-prometheus        running   0.0.0.0:9090->9090/tcp
# vital-alertmanager      running   0.0.0.0:9093->9093/tcp
```

### 4. Access Dashboards

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| **LangFuse** | http://localhost:3000 | Sign up on first visit |
| **Grafana** | http://localhost:3001 | admin / admin_password |
| **Prometheus** | http://localhost:9090 | No auth |
| **AlertManager** | http://localhost:9093 | No auth |

---

## LangFuse Setup

### Initial Configuration

1. **Access LangFuse UI**
   ```
   http://localhost:3000
   ```

2. **Create Account**
   - Sign up with email
   - Create organization
   - Create first project

3. **Generate API Keys**
   - Navigate to Settings → API Keys
   - Click "Create new API key"
   - Copy `Public Key` and `Secret Key`

4. **Configure VITAL Platform**

   Add to `.env` or `.env.local`:
   ```bash
   # LangFuse Integration
   LANGFUSE_PUBLIC_KEY=pk-lf-xxx
   LANGFUSE_SECRET_KEY=sk-lf-xxx
   LANGFUSE_HOST=http://localhost:3000
   ```

5. **Update Python Services**

   ```python
   # backend/python-ai-services/.env
   LANGFUSE_PUBLIC_KEY=pk-lf-xxx
   LANGFUSE_SECRET_KEY=sk-lf-xxx
   LANGFUSE_HOST=http://localhost:3000
   ```

### Using LangFuse in Code

**Example: Track Search Operation**

```python
from services.langfuse_monitor import get_langfuse_monitor

monitor = get_langfuse_monitor()

# Track search
trace_id = await monitor.track_search(
    user_id="user123",
    session_id="session456",
    query="diabetes management",
    results=search_results,
    search_time_ms=245.3,
    cache_hit=False,
    experiment_variant="control"
)

# Track evidence detection
await monitor.track_evidence_detection(
    trace_id=trace_id,
    text=agent_response,
    evidence_count=3,
    entities_count=5,
    citations_count=2,
    detection_time_ms=187.5
)
```

**Example: Using Decorator**

```python
@monitor.trace(name="generate_recommendations")
async def generate_recommendations(user_id: str):
    # Automatically traced
    recommendations = await recommendation_engine.generate_recommendations(user_id)
    return recommendations
```

### LangFuse Features

**Traces Tab:**
- View all LLM requests
- Inspect input/output
- See token usage
- Track latency

**Users Tab:**
- User activity analytics
- Session tracking
- Usage patterns

**Prompts Tab:**
- Manage prompt versions
- A/B test prompts
- Track performance

**Dashboard Tab:**
- Cost analytics
- Token usage over time
- Request volume
- Error rates

---

## Prometheus & Grafana Setup

### Prometheus Configuration

The Prometheus config ([`prometheus.yml`](../backend/monitoring/prometheus/prometheus.yml)) scrapes:

- **PostgreSQL** - Database metrics
- **Redis** - Cache metrics
- **Node** - System metrics
- **Python AI Services** - Application metrics
- **Next.js Frontend** - Frontend metrics
- **LangFuse** - LLM metrics

### Grafana Configuration

**Data Sources:**
1. Prometheus (default)
2. PostgreSQL (VITAL database)
3. LangFuse database

**Dashboards:**
1. **VITAL Platform Overview** - Main operational dashboard
2. **Search Performance** - Search analytics
3. **Evidence Detection** - Evidence metrics
4. **HITL Queue** - Review queue monitoring
5. **Compliance** - Compliance and audit metrics

### Import Dashboards

**Option 1: Auto-provisioned (Recommended)**

Dashboards in `/backend/monitoring/grafana/dashboards/` are automatically loaded.

**Option 2: Manual Import**

1. Access Grafana: http://localhost:3001
2. Login (admin / admin_password)
3. Click "+" → Import
4. Upload JSON or paste ID
5. Select data source
6. Click Import

### Custom Dashboard Queries

**Search Performance (P90 Latency):**
```promql
histogram_quantile(0.9,
  rate(vital_search_duration_seconds_bucket[5m])
)
```

**Evidence Detection Rate:**
```sql
SELECT
  DATE_TRUNC('minute', occurred_at) as time,
  COUNT(*) as value
FROM compliance_audit_log
WHERE event_type = 'compliance_check'
AND action = 'evidence_detected'
AND occurred_at > NOW() - INTERVAL '24 hours'
GROUP BY time
ORDER BY time
```

**HITL Queue Size:**
```sql
SELECT COUNT(*) as value
FROM review_queue
WHERE status = 'pending'
AND sla_breached = FALSE
```

**Compliance Violations:**
```sql
SELECT
  compliance_tags->>0 as framework,
  COUNT(*) as violations
FROM compliance_audit_log
WHERE compliant = FALSE
AND occurred_at > NOW() - INTERVAL '7 days'
GROUP BY framework
ORDER BY violations DESC
```

---

## Configuration

### Alert Rules

Alerts are defined in [`vital_alerts.yml`](../backend/monitoring/prometheus/alerts/vital_alerts.yml).

**Key Alert Groups:**
- `search_performance` - Search latency, cache hit rate
- `hitl_review` - Queue backlog, SLA breaches
- `compliance` - Violations, audit failures
- `evidence_detection` - Detection rate, errors
- `database` - Connections, query time, deadlocks
- `redis` - Memory usage, evictions
- `system_resources` - CPU, memory, disk

**Example Alert:**
```yaml
- alert: HighSearchLatency
  expr: histogram_quantile(0.9, rate(vital_search_duration_seconds_bucket[5m])) > 0.5
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High search latency detected"
    description: "P90 search latency is {{ $value }}s"
```

### AlertManager Configuration

Configure notification channels in `alertmanager/alertmanager.yml`:

**Email Notifications:**
```yaml
receivers:
  - name: 'email-alerts'
    email_configs:
      - to: 'ops@vital-platform.com'
        from: 'alerts@vital-platform.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@vital-platform.com'
        auth_password: 'app_password'
```

**Slack Notifications:**
```yaml
receivers:
  - name: 'slack-alerts'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#vital-alerts'
        title: 'VITAL Platform Alert'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

**PagerDuty:**
```yaml
receivers:
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
        severity: 'critical'
```

---

## Dashboards

### VITAL Platform Overview

**Panels:**

1. **Search Performance** (Graph)
   - P50, P90, P99 latency
   - Request volume

2. **Evidence Detection Rate** (Stat)
   - Detections per hour
   - Threshold alerts

3. **Active Sessions** (Stat)
   - Current active sessions
   - Threshold colors

4. **HITL Review Queue** (Stat)
   - Pending reviews
   - SLA status

5. **Risk Level Distribution** (Pie Chart)
   - Critical, High, Medium, Low, Minimal
   - 24-hour window

6. **Compliance Framework Coverage** (Bar Gauge)
   - FDA, HIPAA, GDPR, EMA, MHRA, TGA
   - Compliant agent counts

7. **Top Agents by Usage** (Table)
   - Agent name
   - Interaction count
   - Average duration

8. **Multi-Domain Evidence** (Stat)
   - Medical, Digital Health, Regulatory, Compliance
   - Detection counts

**Access:**
```
http://localhost:3001/d/vital-overview
```

### Custom Dashboards

**Create New Dashboard:**

1. Click "+" → Dashboard
2. Add panel
3. Select data source
4. Write query
5. Configure visualization
6. Save dashboard

---

## Alerts

### Alert Severity Levels

| Severity | Response Time | Notification |
|----------|---------------|--------------|
| **Critical** | Immediate | PagerDuty, Slack, Email |
| **Warning** | 15 minutes | Slack, Email |
| **Info** | 1 hour | Email |

### Critical Alerts

**SLA Breach:**
- **Trigger:** Review items breach SLA
- **Action:** Escalate to on-call reviewer

**Compliance Violation:**
- **Trigger:** Audit log detects violation
- **Action:** Notify compliance team

**Service Down:**
- **Trigger:** Service unreachable for 2 minutes
- **Action:** Page on-call engineer

**Database Connections Exhausted:**
- **Trigger:** >95% connections used
- **Action:** Scale database or restart services

### Warning Alerts

**High Search Latency:**
- **Trigger:** P90 latency >500ms for 5 minutes
- **Action:** Investigate cache, database

**Review Queue Backlog:**
- **Trigger:** >20 pending reviews
- **Action:** Assign additional reviewers

**Low Cache Hit Rate:**
- **Trigger:** <50% for 10 minutes
- **Action:** Review cache strategy

### Alert Testing

**Trigger Test Alert:**
```bash
# Prometheus
curl -X POST http://localhost:9090/-/reload

# AlertManager
curl -X POST http://localhost:9093/api/v1/alerts

# Check pending alerts
curl http://localhost:9090/api/v1/alerts | jq
```

---

## Troubleshooting

### LangFuse Issues

**Problem: LangFuse UI not loading**
```bash
# Check container
docker ps | grep langfuse

# Check logs
docker logs vital-langfuse-server

# Check health
curl http://localhost:3000/api/public/health
```

**Problem: Traces not appearing**
- Verify API keys are correct
- Check LangFuse is accessible from Python services
- Review Python service logs for errors

### Grafana Issues

**Problem: No data in dashboard**
- Verify data source connection (Configuration → Data Sources)
- Test query in Explore tab
- Check Prometheus has scraped targets

**Problem: Cannot login**
```bash
# Reset admin password
docker exec -it vital-grafana grafana-cli admin reset-admin-password newpassword
```

### Prometheus Issues

**Problem: Targets down**
```bash
# Check targets
curl http://localhost:9090/api/v1/targets | jq

# Verify service is running
docker ps | grep exporter

# Check network
docker network inspect vital-monitoring
```

**Problem: No metrics**
- Verify scrape config in `prometheus.yml`
- Check target application exposes `/metrics`
- Review Prometheus logs

### Database Connection Issues

**Problem: Postgres exporter can't connect**
```bash
# Test connection from container
docker exec -it vital-postgres-exporter sh
psql postgresql://postgres:password@host.docker.internal:54322/postgres

# If fails, verify:
# 1. DB is running
# 2. host.docker.internal resolves
# 3. Credentials are correct
```

### Performance Issues

**High memory usage:**
```bash
# Check Prometheus retention
docker exec vital-prometheus prometheus --help | grep retention

# Reduce retention (default 30d)
# Edit docker-compose.monitoring.yml:
--storage.tsdb.retention.time=7d
```

**Slow dashboard loading:**
- Reduce query time range
- Add query caching
- Optimize SQL queries

---

## Production Checklist

### Security

- [ ] Change all default passwords
- [ ] Enable HTTPS (reverse proxy)
- [ ] Configure firewall rules
- [ ] Enable authentication on all services
- [ ] Set up VPN access for dashboards
- [ ] Enable audit logging
- [ ] Configure secret management (Vault, AWS Secrets Manager)

### High Availability

- [ ] Deploy Prometheus with redundancy
- [ ] Configure Grafana HA (external DB)
- [ ] Set up AlertManager cluster
- [ ] Configure backup for Grafana dashboards
- [ ] Set up backup for Prometheus data

### Monitoring the Monitors

- [ ] Monitor Prometheus storage usage
- [ ] Monitor Grafana performance
- [ ] Monitor LangFuse database size
- [ ] Set alerts for monitoring stack health

### Documentation

- [ ] Document custom dashboards
- [ ] Document alert runbooks
- [ ] Document escalation procedures
- [ ] Train team on dashboards

---

## Support

**Issues:**
- LangFuse: https://github.com/langfuse/langfuse/issues
- VITAL Platform: Internal issue tracker

**Documentation:**
- LangFuse: https://langfuse.com/docs
- Prometheus: https://prometheus.io/docs
- Grafana: https://grafana.com/docs

---

**Last Updated:** 2025-10-25
**Version:** 1.0.0
**Author:** VITAL Platform Team
