# VITAL Path RAG Monitoring Stack

Complete monitoring setup for RAG operations with Prometheus, Grafana, and Alertmanager.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- VITAL Path application running on `localhost:3000`
- At least 2GB RAM and 50GB disk space for metrics storage

### Start Monitoring Stack

```bash
cd monitoring
docker-compose up -d
```

### Access Dashboards

- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: `vital-path-2025` (⚠️ CHANGE IN PRODUCTION)

- **Prometheus**: http://localhost:9090

- **Alertmanager**: http://localhost:9093

### Verify Metrics Collection

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job, health}'

# View RAG metrics
curl http://localhost:9090/api/v1/query?query=rag_queries_total
```

---

## 📊 Architecture

```
┌──────────────────┐
│  VITAL Path App  │
│  (localhost:3000)│
└────────┬─────────┘
         │ /api/metrics
         ▼
┌─────────────────────┐
│    Prometheus       │
│  (localhost:9090)   │
│  - Scrapes every 15s│
│  - 90 day retention │
│  - 50GB max storage │
└────────┬────────────┘
         │
    ┌────┴────┬──────────────┐
    ▼         ▼              ▼
┌────────┐ ┌────────┐ ┌──────────────┐
│Grafana │ │Alerts  │ │ Long-term    │
│:3001   │ │Manager │ │ Storage      │
└────────┘ └────────┘ └──────────────┘
```

---

## 📁 Directory Structure

```
monitoring/
├── docker-compose.yml          # Container orchestration
├── prometheus/
│   ├── prometheus.yml          # Scrape configuration
│   └── alerts/
│       └── rag-alerts.yml      # 11 alert rules
├── grafana/
│   ├── dashboards/
│   │   └── rag-operations.json # Pre-built dashboard
│   └── provisioning/
│       ├── datasources/        # Auto-config Prometheus
│       └── dashboards/         # Auto-load dashboards
├── alertmanager/
│   └── alertmanager.yml        # Notification routing
└── README.md                   # This file
```

---

## 🎯 Metrics Collected

### Latency (7 metrics)
- `rag_latency_p50_milliseconds` - Median latency
- `rag_latency_p95_milliseconds` - P95 (SLO: <2000ms)
- `rag_latency_p99_milliseconds` - P99 (SLO: <5000ms)
- `rag_latency_mean_milliseconds` - Average latency
- `rag_queries_total` - Total queries
- `rag_cache_hit_rate` - Cache effectiveness (0-1)
- `rag_component_latency_milliseconds{component}` - By component

### Cost (8 metrics)
- `rag_cost_total_usd` - Total cost
- `rag_cost_per_query_usd` - Average per query
- `rag_queries_count` - Query count
- `rag_cost_by_provider_usd{provider}` - OpenAI, Pinecone, Cohere, etc.
- `rag_budget_daily_usage_percent` - Daily budget %
- `rag_budget_monthly_usage_percent` - Monthly budget %

### Circuit Breakers (30 metrics - 5 per service)
- `rag_circuit_breaker_state{service}` - 0=CLOSED, 1=HALF_OPEN, 2=OPEN
- `rag_circuit_breaker_failures_total{service}`
- `rag_circuit_breaker_successes_total{service}`
- `rag_circuit_breaker_requests_total{service}`
- `rag_circuit_breaker_rejected_total{service}`

Services monitored: `openai`, `pinecone`, `cohere`, `supabase`, `redis`, `google`

---

## 🚨 Alert Rules (11 Total)

### Latency Alerts
1. **RAGLatencyHigh** - P95 > 2000ms for 5m
2. **RAGLatencyCritical** - P99 > 5000ms for 2m
3. **RAGCacheHitRateLow** - Cache < 20% for 10m

### Cost Alerts
4. **RAGDailyBudgetWarning** - Daily > 80% for 5m
5. **RAGDailyBudgetExceeded** - Daily >= 100% for 1m
6. **RAGMonthlyBudgetWarning** - Monthly > 80% for 30m
7. **RAGCostPerQueryHigh** - Per-query > $0.05 for 15m

### Health Alerts
8. **RAGCircuitBreakerOpen** - Circuit state = OPEN for 1m
9. **RAGCircuitBreakerHalfOpen** - Circuit testing recovery for 2m
10. **RAGHighFailureRate** - Failure rate > 10% for 5m
11. **RAGRequestsRejected** - Service rejecting requests for 2m

### Availability Alerts
12. **RAGNoQueriesDetected** - No queries for 1h
13. **CohereRerankingDegraded** - Cohere success < 90% for 10m

---

## 📈 Grafana Dashboard

### Included Panels

1. **RAG Latency - P95** (with SLO line at 2000ms)
2. **Queries Per Minute** (throughput tracking)
3. **Cache Hit Rate** (stat with thresholds)
4. **Daily Budget Usage** (stat with 80%/100% thresholds)
5. **Cost Per Query** (stat with $0.05 threshold)
6. **Total Cost (Last Hour)** (running cost)
7. **Circuit Breaker States** (bar gauge for 6 services)
8. **Component Latency Breakdown** (stacked graph)
9. **Cost by Provider** (pie chart)
10. **Service Health** (success vs failure rates)

### Dashboard Features
- 10-second auto-refresh
- Last 1 hour time range (adjustable)
- Color-coded thresholds (green/yellow/red)
- Built-in alert on P95 latency panel

---

## 🔧 Configuration

### Update Prometheus Target (Production)

Edit `prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'vital-path-rag'
    static_configs:
      - targets:
          # - 'localhost:3000'              # Remove for production
          - 'your-app.vercel.app'          # Add your production domain
```

### Configure Notifications

Edit `alertmanager/alertmanager.yml`:

```yaml
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#vital-path-alerts'

  - name: 'email'
    email_configs:
      - to: 'ops@your-domain.com'
        from: 'alertmanager@your-domain.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'your-app-password'
```

### Change Grafana Admin Password

```bash
# Stop Grafana
docker-compose stop grafana

# Reset password
docker-compose exec grafana grafana-cli admin reset-admin-password YOUR_NEW_PASSWORD

# Restart
docker-compose start grafana
```

---

## 🧪 Testing

### Generate Test Metrics

```bash
# Make RAG queries to generate metrics
curl -X POST http://localhost:3000/api/rag-query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are FDA 510(k) requirements?", "strategy": "hybrid_rerank"}'
```

### Verify Prometheus Scraping

```bash
# Check if target is up
curl -s http://localhost:9090/api/v1/targets | \
  jq '.data.activeTargets[] | select(.labels.job=="vital-path-rag")'

# Query specific metric
curl -s 'http://localhost:9090/api/v1/query?query=rag_latency_p95_milliseconds' | \
  jq '.data.result[0].value'
```

### Test Alerts

```bash
# Trigger latency alert (simulate high latency)
# This is automatic when P95 > 2000ms for 5 minutes

# View active alerts
curl http://localhost:9090/api/v1/alerts | jq '.data.alerts'

# View Alertmanager alerts
curl http://localhost:9093/api/v2/alerts | jq '.'
```

---

## 📊 Common Queries

### Grafana/Prometheus Queries

```promql
# Latency over time
rag_latency_p95_milliseconds

# Queries per second
rate(rag_queries_total[1m])

# Total cost last 24h
increase(rag_cost_total_usd[24h])

# Cost per query trend
rate(rag_cost_total_usd[5m]) / rate(rag_queries_count[5m])

# Cache effectiveness
avg_over_time(rag_cache_hit_rate[1h]) * 100

# Circuit breaker health
rag_circuit_breaker_state{service="cohere"}

# Failure rate by service
rate(rag_circuit_breaker_failures_total[5m]) /
rate(rag_circuit_breaker_requests_total[5m])

# Budget status
rag_budget_daily_usage_percent
```

---

## 🐛 Troubleshooting

### Prometheus Not Scraping

**Symptom**: No metrics in Grafana

**Check**:
```bash
# Verify app is running
curl http://localhost:3000/api/metrics?format=prometheus

# Check Prometheus targets
docker-compose logs prometheus | grep "vital-path-rag"

# Verify network connectivity
docker-compose exec prometheus wget -O- http://host.docker.internal:3000/api/metrics
```

**Fix**: Update `prometheus.yml` target to `host.docker.internal:3000` on Mac/Windows

### Grafana Dashboard Not Loading

**Check**:
```bash
# Verify datasource
curl http://localhost:3001/api/datasources | jq '.[] | {name, type, url}'

# Check dashboard provisioning
docker-compose logs grafana | grep "dashboard"
```

**Fix**: Restart Grafana
```bash
docker-compose restart grafana
```

### No Alerts Firing

**Check**:
```bash
# Verify alert rules loaded
curl http://localhost:9090/api/v1/rules | jq '.data.groups[].name'

# Check alert evaluation
docker-compose logs prometheus | grep "Evaluating rule"
```

**Fix**: Ensure metrics have data and thresholds are met

### High Memory Usage

**Symptom**: Prometheus using > 2GB RAM

**Fix**: Reduce retention time in `prometheus.yml`:
```yaml
command:
  - '--storage.tsdb.retention.time=30d'  # Reduce from 90d
  - '--storage.tsdb.retention.size=20GB' # Reduce from 50GB
```

---

## 🔐 Security

### Production Checklist

- [ ] Change Grafana admin password
- [ ] Enable Grafana HTTPS
- [ ] Configure Prometheus authentication
- [ ] Restrict Alertmanager access
- [ ] Use secrets for notification credentials
- [ ] Enable audit logging
- [ ] Set up backup for volumes

### Secure Alertmanager Credentials

Create `.env` file:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SMTP_PASSWORD=your-smtp-password
PAGERDUTY_KEY=your-pagerduty-key
```

Update `docker-compose.yml`:
```yaml
alertmanager:
  env_file:
    - .env
```

---

## 📦 Backup & Restore

### Backup Prometheus Data

```bash
# Stop Prometheus
docker-compose stop prometheus

# Backup volume
docker run --rm -v monitoring_prometheus-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/prometheus-backup-$(date +%Y%m%d).tar.gz -C /data .

# Restart
docker-compose start prometheus
```

### Restore Prometheus Data

```bash
# Stop Prometheus
docker-compose stop prometheus

# Restore volume
docker run --rm -v monitoring_prometheus-data:/data -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/prometheus-backup-YYYYMMDD.tar.gz"

# Restart
docker-compose start prometheus
```

---

## 📚 Resources

### Documentation
- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [Alertmanager Guide](https://prometheus.io/docs/alerting/latest/alertmanager/)

### Related Files
- [Phase 1 Monitoring](../PHASE1_RAG_MONITORING_IMPLEMENTATION_COMPLETE.md)
- [Prometheus Integration](../PROMETHEUS_PHASE1_RAG_METRICS_COMPLETE.md)
- [Quick Reference](../QUICK_MONITORING_REFERENCE.md)

---

## 🆘 Support

### Logs

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
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart prometheus
```

### Stop Monitoring

```bash
# Stop but keep data
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Remove everything including data
docker-compose down -v
```

---

**Setup Complete!** Your monitoring stack is ready for production use. 🚀
