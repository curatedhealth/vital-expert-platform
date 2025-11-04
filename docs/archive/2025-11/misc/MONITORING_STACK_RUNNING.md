# Monitoring Stack - Running Successfully ✅

**Date**: January 2025  
**Status**: All Services Operational

---

## ✅ Services Running

### Prometheus
- **Status**: ✅ Running
- **URL**: http://localhost:9090
- **Port**: 9090
- **Purpose**: Metrics collection and storage

### Grafana
- **Status**: ✅ Running  
- **URL**: http://localhost:3002
- **Port**: 3002
- **Credentials**: `admin` / `vital-path-2025`
- **Purpose**: Metrics visualization and dashboards

### Alertmanager
- **Status**: ⚠️ Optional (can be started later)
- **URL**: http://localhost:9093
- **Port**: 9093
- **Purpose**: Alert routing and notifications

### Node Exporter
- **Status**: ✅ Running (system metrics)
- **Port**: 9100

---

## 📊 Access Dashboards

### 1. Grafana Dashboards

**Access**: http://localhost:3002

**Available Dashboards:**
- **Agent Operations**: Comprehensive agent analytics
  - Agent search performance
  - GraphRAG hit rates
  - Error monitoring
  - Mode execution metrics
  
- **RAG Operations**: RAG system metrics
  - Query performance
  - Cache hit rates
  - Relevance scores

**How to Access:**
1. Login: `admin` / `vital-path-2025`
2. Navigate to Dashboards
3. Select "Agent Operations" or "RAG Operations"

### 2. Agent Analytics Dashboard (No Docker Required)

**Access**: http://localhost:3000/admin?view=agent-analytics

**Features:**
- Real-time metrics
- Auto-refresh every 30 seconds
- Time range selector (1h, 6h, 24h, 7d)
- Multiple tab views:
  - Overview
  - Search Performance
  - GraphRAG Metrics
  - Mode Execution

**Benefits:**
- No Docker required
- Integrated in admin panel
- Easy access for team members

### 3. Prometheus UI

**Access**: http://localhost:9090

**Features:**
- Query metrics (PromQL)
- View targets (scrape status)
- View alerts
- Graph metrics

**Key Queries:**
```
# Agent search operations
agent_search_total

# Agent search latency
rate(agent_search_duration_ms_sum[5m]) / rate(agent_search_duration_ms_count[5m])

# GraphRAG hit rate
rate(graphrag_search_hits_total[5m]) / (rate(graphrag_search_hits_total[5m]) + rate(graphrag_search_fallback_total[5m]))

# Error rate
rate(agent_search_errors_total[5m]) / rate(agent_search_total[5m])
```

---

## 🔍 Verification Steps

### Check Prometheus Targets

```bash
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[].health'
```

Should show targets as `"up"` after ~30 seconds.

### Check Metrics Available

```bash
# Agent metrics
curl "http://localhost:9090/api/v1/query?query=agent_search_total"

# Application metrics endpoint
curl http://localhost:3000/api/metrics?format=prometheus | grep agent_
```

### Check Grafana Data Source

1. Go to http://localhost:3002
2. Navigate to Configuration → Data Sources
3. Verify Prometheus is connected
4. Test connection

---

## 📈 Generating Metrics

Metrics will be empty until agent operations occur. To populate:

1. **Run Agent Searches**:
   - Use Mode 1, 2, or 3 in your application
   - Create agent searches
   - Add/remove agents

2. **Wait 15-30 seconds** for Prometheus to scrape

3. **Check Metrics**:
   - View in Grafana dashboards
   - View in Admin Analytics Dashboard
   - Query in Prometheus

---

## 🔔 Alert Rules

**Location**: `monitoring/prometheus/alerts/agent-operations-alerts.yml`

**Configured Alerts:**
1. ⚠️ Agent search latency > 1s (warning)
2. 🚨 Agent search latency > 2s (critical)
3. ⚠️ GraphRAG fallback rate > 30%
4. 🚨 GraphRAG not working (all fallbacks)
5. ⚠️ Agent selection low confidence > 50%
6. ⚠️ Mode 2 execution duration > 5s
7. ⚠️ Mode 3 execution duration > 30s
8. ⚠️ User agent operation errors

**View Alerts**: http://localhost:9090/alerts

**Configure Notifications**: Edit `monitoring/alertmanager/alertmanager.yml`

---

## 🛠️ Managing Services

### Stop Services
```bash
cd monitoring
docker-compose down
```

### Restart Services
```bash
cd monitoring
docker-compose restart
```

### View Logs
```bash
cd monitoring
docker-compose logs -f prometheus
docker-compose logs -f grafana
```

### Check Status
```bash
docker-compose ps
```

---

## 📊 Next Steps

1. **Generate Metrics**:
   - Run some agent operations
   - Create agent searches
   - Use Mode 2/3 workflows

2. **View Dashboards**:
   - Agent Analytics: http://localhost:3000/admin?view=agent-analytics
   - Grafana: http://localhost:3002

3. **Configure Alerts** (Optional):
   - Set up Slack/Email notifications
   - Customize alert thresholds

4. **Monitor Performance**:
   - Check latency targets (<1s P95)
   - Verify GraphRAG hit rate (>70%)
   - Monitor error rates (<1%)

---

## ✅ Success Indicators

- ✅ Prometheus scraping metrics successfully
- ✅ Grafana dashboards showing data
- ✅ Agent Analytics Dashboard accessible
- ✅ Metrics flowing from application
- ✅ No errors in service logs

---

**Monitoring stack is fully operational!** 🚀

All services are running and ready to collect metrics from your agent operations.

