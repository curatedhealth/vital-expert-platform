# Docker Setup Guide for Monitoring Stack

**Status**: Docker installed but not running

---

## 🚀 Quick Start

### Step 1: Start Docker Desktop

**On macOS:**
1. Open **Docker Desktop** from Applications
2. Wait for Docker to start (whale icon in menu bar turns green)
3. Or run: `open -a Docker`

**Verify Docker is running:**
```bash
docker info
```
Should output system information (not an error).

---

### Step 2: Run Monitoring Setup

**Option A: Use the new helper script**
```bash
bash scripts/start-docker-and-monitoring.sh
```

**Option B: Use the original script (after Docker is running)**
```bash
bash scripts/setup-monitoring-stack.sh
```

**Option C: Manual Docker Compose**
```bash
cd monitoring
docker-compose up -d
```

---

## ✅ Verification

After Docker is running, verify services:

```bash
# Check Docker containers
docker ps

# Should show:
# - vital-prometheus
# - vital-grafana
# - vital-alertmanager (optional)

# Test Prometheus
curl http://localhost:9090/-/healthy

# Test Grafana
curl http://localhost:3002/api/health
```

---

## 🔍 Access Services

- **Grafana**: http://localhost:3002
  - Username: `admin`
  - Password: `vital-path-2025`

- **Prometheus**: http://localhost:9090

- **Alertmanager**: http://localhost:9093

- **Agent Analytics Dashboard**: http://localhost:3000/admin?view=agent-analytics
  - (No Docker required - works standalone!)

---

## 🛠️ Troubleshooting

### "Cannot connect to Docker daemon"

**Solution**: Docker Desktop is not running. Start it from Applications.

### "Port already in use"

**Solution**: Another service is using the port. Stop it or change ports in `monitoring/docker-compose.yml`.

### "docker-compose: command not found"

**Solution**: Install Docker Desktop (includes docker-compose).

---

## 📊 What Happens Next

Once Docker is running and services are started:

1. **Prometheus** will start scraping metrics from `/api/metrics`
2. **Grafana** will connect to Prometheus for dashboards
3. **Alertmanager** will receive alerts from Prometheus
4. **Agent Analytics Dashboard** works independently (no Docker needed)

---

**Ready to proceed when Docker Desktop is running!** 🐳

