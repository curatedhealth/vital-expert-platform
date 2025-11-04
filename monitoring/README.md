# 🔥 VITAL Real-Time Monitoring Stack

## Overview

Complete observability and monitoring solution for the VITAL Platform, providing:
- **Real-time metrics collection** (Prometheus)
- **Beautiful dashboards** (Grafana)
- **Intelligent alerting** (Alertmanager)
- **LLM observability** (LangFuse)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   VITAL Platform                             │
│  (Next.js + Analytics Service)                               │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
┌─────────────────────┐      ┌──────────────────────┐
│   Node Exporter     │      │  Postgres Exporter   │
│  (System Metrics)   │      │  (DB Metrics)        │
└──────────┬──────────┘      └──────────┬───────────┘
           │                             │
           └─────────────┬───────────────┘
                         ▼
                 ┌───────────────┐
                 │  Prometheus   │
                 │  (Metrics DB) │
                 └───────┬───────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
    ┌──────────────┐        ┌─────────────────┐
    │   Grafana    │        │  Alertmanager   │
    │  (Dashboards)│        │  (Alerts)       │
    └──────────────┘        └────────┬────────┘
                                     │
                         ┌───────────┴───────────┐
                         ▼                       ▼
                    ┌─────────┐           ┌──────────┐
                    │  Slack  │           │PagerDuty │
                    └─────────┘           └──────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Supabase database with analytics schema (Phase A)
- Analytics service running (Phase B)

### 1. Configure Environment

```bash
cd monitoring
cp env.example .env
```

Edit `.env` and set:
```bash
# Required
SUPABASE_HOST=your-project.supabase.co
SUPABASE_PASSWORD=your-password

# Generate these with: openssl rand -hex 32
LANGFUSE_DB_PASSWORD=<random-32-char-hex>
LANGFUSE_NEXTAUTH_SECRET=<random-32-char-hex>
LANGFUSE_SALT=<random-32-char-hex>

# Optional (for alerts)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
PAGERDUTY_SERVICE_KEY=your-key
```

### 2. Deploy Stack

```bash
./deploy.sh
```

### 3. Access Services

- **Grafana:** http://localhost:3001
  - Username: `admin`
  - Password: `vital_admin_2025`
  
- **Prometheus:** http://localhost:9090
- **Alertmanager:** http://localhost:9093
- **LangFuse:** http://localhost:3002

---

## 📊 Monitoring Components

### 1. Prometheus
**Purpose:** Metrics collection and storage

**Metrics Collected:**
- System metrics (CPU, memory, disk)
- Database metrics (connections, queries, performance)
- Application metrics (requests, errors, latency)
- Analytics metrics (costs, usage, agent performance)

**Access:** http://localhost:9090

**Query Examples:**
```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Daily LLM cost
sum(increase(llm_cost_usd_total[24h]))

# Agent success rate
rate(agent_executions_success_total[15m]) / rate(agent_executions_total[15m])
```

### 2. Grafana
**Purpose:** Visualization and dashboards

**Pre-configured Dashboards:**
- **System Overview** - CPU, memory, disk, network
- **Database Performance** - Queries, connections, slow queries
- **Application Performance** - Requests, errors, latency
- **Cost Analytics** - LLM costs, trends, projections
- **Agent Performance** - Success rates, latency, failures
- **User Analytics** - Sessions, queries, engagement

**Access:** http://localhost:3001

**Default Credentials:**
- Username: `admin`
- Password: `vital_admin_2025`

### 3. Alertmanager
**Purpose:** Alert routing and deduplication

**Alert Categories:**
- **Critical** → PagerDuty (immediate response)
- **Warning** → Slack (team notification)
- **Cost** → Slack finance channel
- **Security** → Slack security channel
- **Info** → Slack info channel (low priority)

**Access:** http://localhost:9093

### 4. LangFuse
**Purpose:** LLM observability and tracing

**Features:**
- LLM request tracing
- Token usage tracking
- Latency monitoring
- Error tracking
- Cost attribution

**Access:** http://localhost:3002

**Integration:** See `docs/LANGFUSE_INTEGRATION.md`

---

## 🚨 Alerting

### Alert Rules Configured

#### System Health
- High CPU usage (>80% for 5min)
- High memory usage (>85% for 5min)
- Low disk space (<15%)

#### Database
- PostgreSQL down
- High connection count (>80)
- Slow queries (>30s)

#### Application
- High error rate (>5%)
- Slow API responses (>2s p95)
- High request rate (>1000 req/sec)

#### Cost Monitoring
- Daily cost >$200
- Cost spike (2x normal)
- Monthly budget >$5000

#### Agent Performance
- Success rate <90%
- High latency (>10s p95)
- Failure spikes (>10/sec)

#### Security
- Suspicious IP activity (>100 req/sec)
- High auth failure rate (>10/sec)
- Quota violations (>5/sec)

### Alert Channels

#### Slack Integration
1. Create Slack incoming webhook:
   - Go to https://api.slack.com/apps
   - Create new app → Incoming Webhooks
   - Copy webhook URL

2. Add to `.env`:
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. Create channels:
   - `#vital-alerts` (default)
   - `#vital-warnings` (warnings)
   - `#vital-finance` (cost alerts)
   - `#vital-security` (security)
   - `#vital-engineering` (technical)

#### PagerDuty Integration
1. Get service key from PagerDuty
2. Add to `.env`:
   ```bash
   PAGERDUTY_SERVICE_KEY=your-integration-key
   ```

---

## 📈 Dashboards

### Executive Dashboard
**Metrics:**
- Platform health (uptime, error rate)
- Active users & sessions
- Daily/monthly costs
- Agent performance summary
- Top alerts & incidents

### Cost Analytics Dashboard
**Metrics:**
- Real-time burn rate
- Cost by service (OpenAI, embeddings)
- Cost by agent
- Budget vs. actual
- Cost trends & predictions

### Agent Performance Dashboard
**Metrics:**
- Success rate by agent
- Average latency
- Error rates & types
- Token usage
- Quality scores (RAGAS)

### User Analytics Dashboard
**Metrics:**
- Active users (hourly/daily)
- Session duration
- Query volume
- User engagement score
- Feature usage

---

## 🔧 Configuration

### Adding Custom Metrics

1. **Export metrics from your service:**
```typescript
// In your Next.js API route
import client from 'prom-client';

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

// In your handler
const end = httpRequestDuration.startTimer();
// ... handle request ...
end({ method: 'POST', route: '/api/query', status: 200 });
```

2. **Add scrape config to `prometheus.yml`:**
```yaml
scrape_configs:
  - job_name: 'my-service'
    static_configs:
      - targets: ['host.docker.internal:9091']
```

### Creating Custom Dashboards

1. Log into Grafana (http://localhost:3001)
2. Click "+" → "Dashboard"
3. Add panels with PromQL queries
4. Save dashboard
5. Export JSON and save to `grafana/dashboards/`

### Modifying Alert Rules

1. Edit `prometheus/alerts.yml`
2. Reload Prometheus:
   ```bash
   docker-compose restart prometheus
   ```

---

## 🛠️ Maintenance

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f prometheus
docker-compose logs -f grafana
docker-compose logs -f alertmanager
```

### Restart Services
```bash
# All
docker-compose restart

# Specific
docker-compose restart grafana
```

### Update Services
```bash
docker-compose pull
docker-compose up -d
```

### Backup Data
```bash
# Backup Grafana dashboards
docker-compose exec grafana grafana-cli admin export-dashboard

# Backup Prometheus data
docker cp vital-prometheus:/prometheus ./prometheus-backup
```

---

## 📊 Performance Metrics

### Resource Requirements
- **Prometheus:** 512MB RAM, 10GB disk
- **Grafana:** 256MB RAM, 1GB disk
- **Alertmanager:** 128MB RAM, 500MB disk
- **LangFuse:** 512MB RAM, 5GB disk (database)

**Total:** ~1.5GB RAM, ~17GB disk

### Data Retention
- **Prometheus:** 30 days (configurable)
- **Grafana:** Unlimited (dashboards)
- **LangFuse:** 90 days (traces)

---

## 🐛 Troubleshooting

### Prometheus Not Scraping Targets
```bash
# Check targets
curl http://localhost:9090/api/v1/targets

# Verify connectivity
docker-compose exec prometheus wget -O- http://host.docker.internal:9091/metrics
```

### Grafana Can't Connect to Prometheus
```bash
# Check network
docker-compose exec grafana ping prometheus

# Verify datasource
curl http://localhost:3001/api/datasources
```

### Alerts Not Firing
```bash
# Check alert rules
curl http://localhost:9090/api/v1/rules

# Check Alertmanager status
curl http://localhost:9093/api/v1/status
```

### LangFuse Not Starting
```bash
# Check logs
docker-compose logs langfuse-server

# Verify database connection
docker-compose exec langfuse-db psql -U postgres -d langfuse -c "\dt"
```

---

## 📚 Additional Resources

- **Prometheus Documentation:** https://prometheus.io/docs/
- **Grafana Documentation:** https://grafana.com/docs/
- **LangFuse Documentation:** https://langfuse.com/docs/
- **PromQL Tutorial:** https://prometheus.io/docs/prometheus/latest/querying/basics/

---

## 🎯 Next Steps

1. **Deploy the stack:** `./deploy.sh`
2. **Explore Grafana dashboards**
3. **Configure Slack alerts**
4. **Set up PagerDuty** (optional)
5. **Integrate LangFuse** into your LLM calls
6. **Create custom dashboards** for your use cases

---

## 🤝 Support

For issues or questions:
1. Check logs: `docker-compose logs [service]`
2. Review troubleshooting section above
3. Check service health endpoints
4. Verify environment variables in `.env`

---

**Status:** ✅ Ready for Production
**Phase:** C - Real-Time Monitoring Stack
**Version:** 1.0.0
