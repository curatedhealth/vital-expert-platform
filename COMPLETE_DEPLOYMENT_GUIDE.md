# 🚀 VITAL Platform - Complete Deployment Guide

## Overview

Complete end-to-end deployment guide for the VITAL Unified Intelligence platform with Analytics Foundation, Service Integration, and Real-Time Monitoring.

---

## 📋 Prerequisites

### Required

- **Node.js** 18+ and npm/pnpm
- **Docker** & Docker Compose
- **Supabase** account & project
- **Pinecone** account & API key
- **OpenAI** API key
- **Git** (for version control)

### Optional (for full monitoring)

- **Slack** workspace (for alerts)
- **PagerDuty** account (for critical alerts)
- **Vercel/Railway** (for hosting)

---

## 🏗️ Architecture Phases

| Phase | Focus | Status | Time |
|-------|-------|--------|------|
| **Phase A** | Analytics Foundation | ✅ Complete | 26 hours |
| **Phase B** | Service Integration | ✅ Complete | 2 hours |
| **Phase C** | Real-Time Monitoring | ✅ Complete | 8 hours |
| **Phase D** | Business Intelligence | ⏳ Next | TBD |

**Total Investment:** ~36 hours for Phases A-C

---

## 📦 Step 1: Database Setup

### 1.1 Supabase Configuration

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and API keys

2. **Enable TimescaleDB Extension**
   ```sql
   -- In Supabase SQL Editor
   CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
   ```

3. **Run Analytics Migration**
   ```bash
   # Set your Supabase connection string
   export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres'
   
   # Navigate to migrations
   cd database/sql/migrations/2025/
   
   # Make script executable
   chmod +x execute_analytics_migration.sh
   
   # Execute
   ./execute_analytics_migration.sh
   ```

   **Expected Output:**
   ```
   ✅ Database connection successful
   ✅ TimescaleDB extension available
   ✅ Migration completed successfully!
   📊 Analytics tables created: platform_events, tenant_cost_events, agent_executions
   📈 Materialized views created: tenant_daily_summary, tenant_cost_summary, agent_performance_summary
   ⚡ Continuous aggregates created: tenant_metrics_realtime, cost_metrics_realtime
   ```

### 1.2 Pinecone Setup

1. **Create Pinecone Index**
   - Go to https://pinecone.io
   - Create new index:
     - Name: `vital-knowledge-base`
     - Dimension: `1536` (for text-embedding-ada-002)
     - Metric: `cosine`

2. **Note API Keys**
   - API Key
   - Environment
   - Index Name

---

## 📦 Step 2: Application Setup

### 2.1 Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd vital-platform

# Install dependencies
npm install
```

### 2.2 Environment Variables

Create `.env.local` in `apps/digital-health-startup/`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# OpenAI
OPENAI_API_KEY=sk-your-key

# Pinecone
PINECONE_API_KEY=your-key
PINECONE_ENVIRONMENT=your-environment
PINECONE_INDEX_NAME=vital-knowledge-base

# Analytics (Optional - for custom deployment)
ANALYTICS_DB_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres

# Redis (Optional - for caching)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 2.3 Build & Run

```bash
cd apps/digital-health-startup

# Development
npm run dev

# Production build
npm run build
npm run start
```

**Verify:**
- App runs at http://localhost:3000
- Can log in
- Ask Expert works
- Admin dashboard accessible at http://localhost:3000/admin

---

## 📦 Step 3: Monitoring Stack Setup

### 3.1 Configure Monitoring

```bash
cd monitoring

# Copy environment template
cp env.example .env
```

Edit `.env`:

```bash
# Required
SUPABASE_HOST=your-project.supabase.co
SUPABASE_PASSWORD=your-postgres-password

# Generate these with: openssl rand -hex 32
LANGFUSE_DB_PASSWORD=$(openssl rand -hex 32)
LANGFUSE_NEXTAUTH_SECRET=$(openssl rand -hex 32)
LANGFUSE_SALT=$(openssl rand -hex 32)

# Optional (highly recommended)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
PAGERDUTY_SERVICE_KEY=your-pagerduty-key
```

### 3.2 Deploy Monitoring Stack

```bash
# From monitoring/ directory
./deploy.sh
```

**Expected Output:**
```
✅ Environment variables loaded
✅ Docker is running
📥 Pulling Docker images...
✅ Images pulled
🚀 Starting monitoring stack...
✅ Prometheus is healthy (http://localhost:9090)
✅ Grafana is healthy (http://localhost:3001)
✅ Alertmanager is healthy (http://localhost:9093)
⚠️  LangFuse is starting (may take a minute)
🎉 Monitoring Stack Deployed Successfully!
```

### 3.3 Verify Monitoring

**Access Points:**

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3001 | admin / vital_admin_2025 |
| Prometheus | http://localhost:9090 | (none) |
| Alertmanager | http://localhost:9093 | (none) |
| LangFuse | http://localhost:3002 | (create on first visit) |

**Test Queries in Prometheus:**

```promql
# System health
up

# HTTP request rate
rate(http_requests_total[5m])

# LLM costs (24h)
sum(increase(llm_cost_usd_total[24h]))

# Agent success rate
rate(agent_executions_success_total[15m]) / rate(agent_executions_total[15m])
```

---

## 📦 Step 4: Slack Integration (Optional but Recommended)

### 4.1 Create Slack Webhook

1. Go to https://api.slack.com/apps
2. Create new app
3. Enable "Incoming Webhooks"
4. Create webhooks for channels:
   - `#vital-alerts` (default)
   - `#vital-warnings` (warnings)
   - `#vital-finance` (cost alerts)
   - `#vital-security` (security alerts)
   - `#vital-engineering` (technical alerts)

5. Copy webhook URL

### 4.2 Update Alertmanager

Add to `monitoring/.env`:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Restart Alertmanager:
```bash
cd monitoring
docker-compose restart alertmanager
```

### 4.3 Test Alert

```bash
# Send test alert to Alertmanager
curl -X POST http://localhost:9093/api/v1/alerts -d '[
  {
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning"
    },
    "annotations": {
      "summary": "Test alert from deployment",
      "description": "This is a test alert to verify Slack integration"
    }
  }
]'
```

**Check Slack:** You should receive a message in configured channels.

---

## 📦 Step 5: Verify Complete System

### 5.1 Application Health Check

- [x] Application runs at http://localhost:3000
- [x] Can log in successfully
- [x] Ask Expert responds to queries
- [x] Document upload works
- [x] Admin dashboard accessible
- [x] All dashboards load without errors

### 5.2 Analytics Health Check

```bash
# Check analytics tables exist
psql "$SUPABASE_DB_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'analytics';"
```

**Expected:**
```
         tablename          
----------------------------
 platform_events
 tenant_cost_events
 agent_executions
 tenant_daily_summary
 tenant_cost_summary
 agent_performance_summary
 tenant_metrics_realtime
 cost_metrics_realtime
```

### 5.3 Monitoring Health Check

```bash
# Check all containers are running
cd monitoring
docker-compose ps
```

**Expected:**
```
NAME                  STATE
vital-prometheus      Up
vital-grafana         Up
vital-alertmanager    Up
vital-node-exporter   Up
vital-postgres-exporter Up
vital-langfuse        Up
vital-langfuse-db     Up
```

### 5.4 End-to-End Test

1. **Submit a Query:**
   - Go to http://localhost:3000/ask-expert
   - Submit: "What is VITAL Platform?"
   - Verify response

2. **Check Analytics:**
   - Go to http://localhost:3000/admin?view=executive
   - Verify metrics update
   - Check active users count

3. **Check Prometheus:**
   - Go to http://localhost:9090
   - Query: `http_requests_total`
   - Verify data is being collected

4. **Check Grafana:**
   - Go to http://localhost:3001
   - Login (admin / vital_admin_2025)
   - Explore → Metrics → `http_requests_total`

---

## 🎯 Post-Deployment Configuration

### 1. Create Grafana Dashboards

**Option A: Import Pre-built (Recommended)**
1. In Grafana, go to Dashboards → Import
2. Import dashboard IDs:
   - `1860` - Node Exporter Full
   - `9628` - PostgreSQL Database
   - `7039` - Prometheus Stats

**Option B: Create Custom**
1. Dashboards → New Dashboard
2. Add panels with PromQL queries
3. Save to `monitoring/grafana/dashboards/`

### 2. Tune Alert Thresholds

Edit `monitoring/prometheus/alerts.yml`:

```yaml
# Example: Adjust cost alert threshold
- alert: HighDailyCost
  expr: sum(increase(llm_cost_usd_total[24h])) > 200  # Change this value
  for: 1h
```

Reload Prometheus:
```bash
docker-compose restart prometheus
```

### 3. Set Up User Roles

In Supabase SQL Editor:
```sql
-- Create admin role
INSERT INTO user_roles (user_id, role) 
VALUES ('user-uuid', 'admin');

-- Create standard user role
INSERT INTO user_roles (user_id, role) 
VALUES ('user-uuid', 'user');
```

### 4. Configure Rate Limits

```sql
-- Set default quota limits
INSERT INTO quota_limits (entity_id, entity_type, quota_type, quota_limit, time_window)
VALUES 
  ('default', 'user', 'queries', 100, '1 hour'),
  ('default', 'user', 'documents', 50, '1 day'),
  ('default', 'tenant', 'monthly_cost', 5000, '30 days');
```

---

## 📊 Accessing Dashboards

### Admin Dashboards

| Dashboard | URL | Purpose |
|-----------|-----|---------|
| Executive | http://localhost:3000/admin?view=executive | Real-time system health |
| Admin Overview | http://localhost:3000/admin?view=overview | Platform statistics |
| Users | http://localhost:3000/admin?view=users | User management |
| Agents | http://localhost:3000/admin?view=agents | Agent management |
| Prompts | http://localhost:3000/admin?view=prompts | Prompt management |
| Tools | http://localhost:3000/admin?view=tools | Tool management |
| Agent Analytics | http://localhost:3000/admin?view=agent-analytics | Agent performance |
| Feedback | http://localhost:3000/admin?view=feedback-analytics | User feedback |
| LLM Providers | http://localhost:3000/admin?view=llm-providers | Provider status |
| Usage Analytics | http://localhost:3000/admin?view=usage-analytics | Token usage |
| System Metrics | http://localhost:3000/admin?view=system-metrics | Real-time metrics |

### Monitoring Dashboards

| Dashboard | URL | Credentials |
|-----------|-----|-------------|
| Grafana | http://localhost:3001 | admin / vital_admin_2025 |
| Prometheus | http://localhost:9090 | (none) |
| Alertmanager | http://localhost:9093 | (none) |
| LangFuse | http://localhost:3002 | (create account) |

---

## 🔧 Maintenance & Operations

### Daily Tasks

- Monitor Executive Dashboard for anomalies
- Check Slack for alerts
- Review daily cost reports

### Weekly Tasks

- Review Grafana dashboards
- Analyze agent performance trends
- Check for slow queries
- Review security alerts

### Monthly Tasks

- Review monthly costs vs budget
- Analyze user engagement trends
- Update alert thresholds
- Review and rotate credentials
- Backup analytics data
- Update documentation

---

## 🐛 Troubleshooting

### Application Won't Start

**Symptom:** `npm run dev` fails

**Solution:**
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache
rm -rf node_modules .next
npm install

# Check environment variables
cat apps/digital-health-startup/.env.local
```

### Database Connection Fails

**Symptom:** "Could not connect to database"

**Solution:**
```bash
# Test connection
psql "$SUPABASE_DB_URL" -c "SELECT 1;"

# Check environment variable
echo $SUPABASE_DB_URL

# Verify IP is whitelisted in Supabase
```

### Monitoring Stack Won't Start

**Symptom:** Docker Compose fails

**Solution:**
```bash
# Check Docker
docker info

# Check port availability
lsof -i :9090  # Prometheus
lsof -i :3001  # Grafana

# View logs
cd monitoring
docker-compose logs -f
```

### Analytics Not Tracking

**Symptom:** No data in analytics dashboards

**Solution:**
```bash
# Check analytics tables exist
psql "$SUPABASE_DB_URL" -c "\dt analytics.*"

# Verify service is writing data
# Check application logs for errors

# Test direct insert
psql "$SUPABASE_DB_URL" -c "INSERT INTO analytics.platform_events (time, tenant_id, event_type) VALUES (NOW(), 'test-id', 'test');"
```

### Alerts Not Firing

**Symptom:** No Slack notifications

**Solution:**
```bash
# Check Alertmanager config
cat monitoring/alertmanager/alertmanager.yml

# Test webhook
curl -X POST $SLACK_WEBHOOK_URL -d '{"text": "Test message"}'

# Check Alertmanager logs
docker-compose logs alertmanager
```

---

## 📚 Additional Resources

### Documentation Files

- `PHASE_A_ANALYTICS_FOUNDATION_COMPLETE.md` - Analytics foundation details
- `PHASE_B_SERVICE_INTEGRATION_PROGRESS.md` - Service integration guide
- `PHASE_C_MONITORING_COMPLETE.md` - Monitoring stack guide
- `SYSTEM_ARCHITECTURE_COMPLETE.md` - Complete system architecture
- `QUICK_START_GUIDE.md` - Quick reference for analytics
- `monitoring/README.md` - Monitoring stack documentation

### External Resources

- **Prometheus Documentation:** https://prometheus.io/docs/
- **Grafana Documentation:** https://grafana.com/docs/
- **LangFuse Documentation:** https://langfuse.com/docs/
- **Supabase Documentation:** https://supabase.com/docs
- **Next.js Documentation:** https://nextjs.org/docs

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Application runs and responds to queries
- ✅ Analytics data is being collected in TimescaleDB
- ✅ Prometheus is scraping metrics
- ✅ Grafana dashboards display data
- ✅ Alerts are routing to Slack/PagerDuty
- ✅ Executive Dashboard shows real-time metrics
- ✅ All admin dashboards load without errors
- ✅ Document upload and processing works
- ✅ Agent executions are tracked
- ✅ Costs are calculated and displayed

---

## 🚀 Next Steps

### Phase D: Business Intelligence

1. **Tenant Health Scoring**
   - Engagement metrics
   - Quality scores
   - Risk indicators

2. **Churn Prediction**
   - ML models for user retention
   - Early warning system
   - Proactive interventions

3. **Cost Optimization Engine**
   - Automated recommendations
   - Model selection optimization
   - Caching strategies

4. **Revenue Analytics**
   - Usage-based pricing models
   - Revenue forecasting
   - Customer lifetime value

---

## 📞 Support

**For Deployment Issues:**
1. Check this guide's troubleshooting section
2. Review relevant documentation files
3. Check Docker logs: `docker-compose logs [service]`
4. Verify environment variables
5. Check database connectivity

**For Development Issues:**
1. Check application logs
2. Review browser console
3. Verify API responses
4. Check Supabase logs

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** November 4, 2025  
**Phases Covered:** A, B, C  
**Status:** ✅ Production Ready

---

**Congratulations! Your VITAL Platform is now fully deployed with complete observability! 🎉**

