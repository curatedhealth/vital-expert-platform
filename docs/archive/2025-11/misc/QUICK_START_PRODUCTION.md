# Quick Start: Production Deployment

**Date**: January 2025  
**Status**: Ready  
**Time**: ~30 minutes

---

## 🚀 Quick Deployment Steps

### Step 1: Database Migration (5 minutes)

**Option A: Manual (Recommended for Production)**
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Copy contents of: `supabase/migrations/20250129000001_create_ask_expert_sessions.sql`
4. Execute the migration
5. Verify: `SELECT COUNT(*) FROM ask_expert_sessions;`

**Option B: Automated Script**
```bash
# Ensure .env.local has Supabase credentials
tsx scripts/run-ask-expert-sessions-migration.ts

# Verify migration
tsx scripts/verify-migration.ts
```

---

### Step 2: Start Monitoring Stack (5 minutes)

```bash
# Start Prometheus + Grafana + Alertmanager
bash scripts/setup-monitoring-stack.sh

# Or manually:
cd monitoring
docker-compose up -d
```

**Access:**
- Grafana: http://localhost:3002 (admin / vital-path-2025)
- Prometheus: http://localhost:9090

---

### Step 3: Deploy Application (10 minutes)

```bash
# Build
npm run build

# Type check
npm run type-check

# Deploy (your deployment method)
# Vercel: vercel --prod
# Railway: railway up
# etc.
```

---

### Step 4: Test Metrics (5 minutes)

```bash
# Test all metrics endpoints
bash scripts/test-metrics-endpoints.sh

# Or manually:
curl http://localhost:3000/api/metrics?format=prometheus | grep agent_
curl http://localhost:3000/api/ask-expert/mode1/metrics?endpoint=stats
```

---

### Step 5: Verify Dashboards (5 minutes)

1. **Access Grafana**: http://localhost:3002
2. **Login**: admin / vital-path-2025
3. **View Dashboards**:
   - Agent Operations: Auto-imported
   - RAG Operations: Auto-imported
4. **Configure Prometheus Data Source** (if needed):
   - URL: http://prometheus:9090 (container) or http://localhost:9090 (host)

---

## 📊 What to Monitor

### Real-Time Metrics

**Agent Operations Dashboard** shows:
- ✅ Agent search latency (P95 target: <1s)
- ✅ GraphRAG hit rate (target: >70%)
- ✅ Fallback usage (should be <30%)
- ✅ Error rates (target: <1%)
- ✅ Mode 2/3 execution duration

**Key Queries:**
```promql
# Agent Search P95 Latency
histogram_quantile(0.95, rate(agent_search_duration_ms_bucket[5m]))

# GraphRAG Hit Rate
rate(graphrag_search_hits_total[5m]) / 
(rate(graphrag_search_hits_total[5m]) + rate(graphrag_search_fallback_total[5m]))

# Error Rate
rate(agent_search_errors_total[5m]) / rate(agent_search_total[5m])
```

---

## 🔔 Alerts Configured

Automatic alerts for:
- ⚠️ Agent search latency > 1s (warning)
- 🚨 Agent search latency > 2s (critical)
- ⚠️ GraphRAG fallback rate > 30%
- 🚨 GraphRAG not working (all fallbacks)
- ⚠️ Agent selection low confidence > 50%
- ⚠️ Mode execution duration high

**Configure notifications:**
Edit `monitoring/alertmanager/alertmanager.yml` with Slack/PagerDuty webhooks.

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Migration completed: Tables `ask_expert_sessions` and `ask_expert_messages` exist
- [ ] Metrics endpoint responding: `curl /api/metrics?format=prometheus | grep agent_`
- [ ] Prometheus scraping: Targets show "up" in http://localhost:9090
- [ ] Grafana dashboards loaded: Agent Operations dashboard visible
- [ ] Alerts configured: `curl http://localhost:9090/api/v1/rules | jq`
- [ ] Mode 1 metrics working: `curl /api/ask-expert/mode1/metrics?endpoint=stats`

---

## 🎯 Next Steps

1. **Generate Metrics**:
   - Run some agent operations
   - Create agent searches
   - Use Mode 2/3 workflows

2. **Wait 15-30 seconds** for Prometheus to scrape

3. **View in Grafana**:
   - Check real-time metrics
   - Verify no alerts firing
   - Review performance baselines

4. **Configure Notifications** (Optional):
   - Add Slack webhook
   - Set up email alerts
   - Configure PagerDuty

---

## 🐛 Troubleshooting

### Metrics Not Showing?

```bash
# 1. Check if app is running
curl http://localhost:3000/api/metrics

# 2. Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq

# 3. Check for agent operations logs
# Look for structured logs with "agent_search", "graphrag", etc.

# 4. Verify Prometheus exporter is working
# Check browser console for any Prometheus export errors
```

### Dashboard Empty?

- Wait 15-30 seconds after generating metrics
- Check time range (set to "Last 1 hour")
- Verify data source is connected
- Generate some agent operations first

### Alerts Not Firing?

```bash
# Check if rules are loaded
curl http://localhost:9090/api/v1/rules | jq '.data.groups[].name'

# Check current alerts
curl http://localhost:9090/api/v1/alerts | jq

# Verify Alertmanager
curl http://localhost:9093/api/v2/alerts | jq
```

---

## 📚 Documentation

- **Deployment Guide**: `DEPLOYMENT_PRODUCTION_CHECKLIST.md`
- **Observability Summary**: `OBSERVABILITY_INTEGRATION_SUMMARY.md`
- **Monitoring Setup**: `MONITORING_STACK_COMPLETE.md`

---

**Ready to Deploy!** 🚀

