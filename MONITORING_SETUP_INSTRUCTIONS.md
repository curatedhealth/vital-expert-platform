# Monitoring Stack Setup Instructions

**Status**: Docker not running (required for full stack)

---

## ✅ Option 1: Start Docker and Run Script (Recommended)

### Step 1: Start Docker Desktop

1. Open Docker Desktop application
2. Wait for Docker to fully start (whale icon in menu bar should be green)
3. Verify Docker is running:
   ```bash
   docker info
   ```

### Step 2: Run Setup Script

```bash
bash scripts/setup-monitoring-stack.sh
```

**What it does:**
- Starts Prometheus (port 9090)
- Starts Grafana (port 3002)
- Starts Alertmanager (port 9093)
- Verifies all services are healthy

**Access:**
- Grafana: http://localhost:3002 (admin / vital-path-2025)
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

---

## ✅ Option 2: Manual Docker Compose

If the script doesn't work, you can start services manually:

```bash
cd monitoring
docker-compose up -d
```

**Check status:**
```bash
docker-compose ps
```

**View logs:**
```bash
docker-compose logs -f
```

**Stop services:**
```bash
docker-compose down
```

---

## ✅ Option 3: View Metrics Without Docker (Application Only)

You can view metrics directly from your application without Docker:

### Check Application Metrics

```bash
# Main metrics endpoint
curl http://localhost:3000/api/metrics?format=prometheus

# Agent analytics (in admin dashboard)
# Navigate to: http://localhost:3000/admin?view=agent-analytics

# Mode 1 metrics
curl http://localhost:3000/api/ask-expert/mode1/metrics?endpoint=stats
```

### View in Browser

1. **Start your Next.js app:**
   ```bash
   npm run dev
   ```

2. **Access Agent Analytics Dashboard:**
   - URL: http://localhost:3000/admin?view=agent-analytics
   - Shows real-time agent operation metrics
   - Auto-refreshes every 30 seconds
   - No Docker required!

---

## 📊 What Each Service Does

### Prometheus
- **Purpose**: Metrics collection and storage
- **Port**: 9090
- **URL**: http://localhost:9090
- **Features**:
  - Scrapes metrics from `/api/metrics`
  - Stores time-series data
  - Provides query interface (PromQL)

### Grafana
- **Purpose**: Metrics visualization and dashboards
- **Port**: 3002
- **URL**: http://localhost:3002
- **Credentials**: admin / vital-path-2025
- **Dashboards**:
  - Agent Operations (auto-imported)
  - RAG Operations (auto-imported)

### Alertmanager
- **Purpose**: Alert routing and notifications
- **Port**: 9093
- **URL**: http://localhost:9093
- **Features**:
  - Receives alerts from Prometheus
  - Routes to Slack/Email/PagerDuty
  - Manages alert grouping and silencing

---

## 🔧 Configuration

### Prometheus Config
**File**: `monitoring/prometheus/prometheus.yml`

Scrapes from: `http://host.docker.internal:3000/api/metrics` (when running in Docker)

### Grafana Config
**File**: `monitoring/grafana/provisioning/datasources/prometheus.yml`

Connects to: `http://prometheus:9090` (Docker network)

### Alert Rules
**File**: `monitoring/prometheus/alerts/agent-operations-alerts.yml`

9 alert rules for:
- Agent search latency
- GraphRAG fallback rate
- Error rates
- Mode execution duration

---

## ✅ Verification Steps

### 1. Check Docker is Running

```bash
docker info
```

Should output Docker system information (not an error).

### 2. Check Services Started

```bash
docker ps
```

Should show:
- `vital-prometheus`
- `vital-grafana`
- `vital-alertmanager` (optional)

### 3. Test Prometheus

```bash
curl http://localhost:9090/-/healthy
```

Should return: `Prometheus is Healthy.`

### 4. Test Grafana

```bash
curl http://localhost:3002/api/health
```

Should return JSON with status.

### 5. Test Application Metrics

```bash
# Make sure your app is running
curl http://localhost:3000/api/metrics?format=prometheus | grep agent_
```

Should show agent operation metrics.

### 6. Test Prometheus Scraping

Visit: http://localhost:9090/targets

Should show targets as "UP" after ~30 seconds.

---

## 🚨 Troubleshooting

### Issue: "Docker is not running"

**Solution**: Start Docker Desktop

### Issue: Port Already in Use

**Solution**: Stop conflicting services or change ports in `docker-compose.yml`

```yaml
ports:
  - "9091:9090"  # Change external port
```

### Issue: Prometheus Can't Scrape

**Check**:
1. App is running on port 3000
2. `/api/metrics` endpoint is accessible
3. Prometheus config uses correct URL:
   - Docker: `http://host.docker.internal:3000/api/metrics`
   - Local: `http://localhost:3000/api/metrics`

### Issue: Grafana Shows No Data

**Solution**:
1. Verify Prometheus data source is connected
2. Check time range (set to "Last 1 hour")
3. Generate some agent operations first (metrics start empty)

### Issue: Container Won't Start

**Solution**:
```bash
# View logs
docker-compose logs prometheus
docker-compose logs grafana

# Restart specific service
docker-compose restart prometheus
```

---

## 🎯 Next Steps After Setup

1. **Generate Metrics**:
   - Run some agent operations in your app
   - Create agent searches
   - Use Mode 2/3 workflows

2. **View in Grafana**:
   - Access: http://localhost:3002
   - Login: admin / vital-path-2025
   - View "Agent Operations" dashboard

3. **Configure Alerts**:
   - Edit `monitoring/alertmanager/alertmanager.yml`
   - Add Slack webhook or email
   - Test alert: http://localhost:9090/alerts

4. **View in Admin Dashboard**:
   - Access: http://localhost:3000/admin?view=agent-analytics
   - No Docker required!
   - Real-time metrics display

---

## 💡 Quick Reference

**Start Stack:**
```bash
docker-compose up -d
```

**Stop Stack:**
```bash
docker-compose down
```

**View Logs:**
```bash
docker-compose logs -f
```

**Restart:**
```bash
docker-compose restart
```

**Check Status:**
```bash
docker-compose ps
```

---

**Ready to monitor!** 🚀

After starting Docker and running the setup script, you'll have full observability for your agent operations.

