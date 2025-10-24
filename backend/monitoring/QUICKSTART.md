# VITAL Monitoring Stack - Quick Start

## 🚀 Start Everything (5 Minutes)

### Step 1: Clone & Start LangFuse

```bash
# Get LangFuse
git clone https://github.com/langfuse/langfuse.git
cd langfuse

# Start LangFuse
docker compose up -d

# Wait for health check
curl http://localhost:3000/api/public/health
```

### Step 2: Configure Environment

```bash
# Navigate to VITAL monitoring directory
cd /path/to/vital/backend/monitoring

# Create .env file
cat > .env.monitoring <<EOF
# LangFuse
LANGFUSE_PORT=3000
LANGFUSE_DB_PASSWORD=langfuse_secure_password
LANGFUSE_NEXTAUTH_SECRET=$(openssl rand -base64 32)
LANGFUSE_SALT=$(openssl rand -base64 32)

# Grafana
GRAFANA_PORT=3001
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=vital_admin_2024

# Database
DB_HOST=host.docker.internal
DB_PORT=54322
DB_USER=postgres
DB_PASSWORD=postgres
EOF
```

### Step 3: Start Monitoring Stack

```bash
# Start all services
docker-compose --env-file .env.monitoring -f docker-compose.monitoring.yml up -d

# Check status
docker-compose -f docker-compose.monitoring.yml ps
```

### Step 4: Verify Services

```bash
# LangFuse
curl http://localhost:3000/api/public/health

# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
curl http://localhost:3001/api/health

# All good? ✅
```

### Step 5: Access Dashboards

| Service | URL | Login |
|---------|-----|-------|
| **LangFuse** | http://localhost:3000 | Sign up |
| **Grafana** | http://localhost:3001 | admin / vital_admin_2024 |
| **Prometheus** | http://localhost:9090 | No auth |

---

## 🔧 Configure LangFuse API Keys

1. Open http://localhost:3000
2. Create account
3. Create organization & project
4. Go to Settings → API Keys
5. Create new API key
6. Copy keys to `.env`:

```bash
# Add to main VITAL .env
LANGFUSE_PUBLIC_KEY=pk-lf-xxx
LANGFUSE_SECRET_KEY=sk-lf-xxx
LANGFUSE_HOST=http://localhost:3000
```

---

## 📊 View Dashboards

**Grafana:** http://localhost:3001

1. Login (admin / vital_admin_2024)
2. Go to Dashboards
3. Open "VITAL Platform Overview"

**Panels:**
- Search Performance
- Evidence Detection
- HITL Queue
- Compliance Coverage
- Risk Distribution

---

## 🛑 Stop Everything

```bash
# Stop monitoring stack
docker-compose -f docker-compose.monitoring.yml down

# Stop LangFuse
cd /path/to/langfuse
docker compose down

# Remove volumes (optional - deletes data!)
docker-compose -f docker-compose.monitoring.yml down -v
```

---

## 🔍 Troubleshooting

**Service won't start:**
```bash
# Check logs
docker logs vital-grafana
docker logs vital-prometheus
docker logs vital-langfuse-server

# Check ports
lsof -i :3000  # LangFuse
lsof -i :3001  # Grafana
lsof -i :9090  # Prometheus
```

**Can't connect to database:**
```bash
# Test from container
docker exec -it vital-postgres-exporter sh
ping host.docker.internal

# If fails on Linux, use:
# --add-host=host.docker.internal:172.17.0.1
```

**Dashboard shows no data:**
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq

# Test data source in Grafana
# Configuration → Data Sources → Prometheus → Test
```

---

## 📖 Full Documentation

See [MONITORING_SETUP_GUIDE.md](../../docs/MONITORING_SETUP_GUIDE.md) for detailed setup, configuration, and troubleshooting.

---

**Last Updated:** 2025-10-25
