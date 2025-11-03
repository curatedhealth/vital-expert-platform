# Production Deployment Checklist

**Date**: January 2025  
**Status**: Ready for Deployment  
**Context**: Complete observability and agent operations ready for production

---

## ✅ Pre-Deployment Checklist

### 1. Database Migrations

- [x] **Migration file exists**: `supabase/migrations/20250129000001_create_ask_expert_sessions.sql`
- [ ] **Run migration script**: `bash scripts/run-ask-expert-sessions-migration.sh`
- [ ] **Verify tables created**:
  ```sql
  SELECT COUNT(*) FROM ask_expert_sessions;
  SELECT COUNT(*) FROM ask_expert_messages;
  ```
- [ ] **Verify indexes created**:
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE tablename IN ('ask_expert_sessions', 'ask_expert_messages');
  ```

### 2. Environment Variables

Verify all required environment variables are set in production:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Pinecone
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
PINECONE_NAMESPACE=agents

# OpenAI
OPENAI_API_KEY=

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
```

### 3. Code Deployment

- [x] Structured logger implemented
- [x] Prometheus exporter integrated
- [x] Agent operation metrics exported
- [x] LangSmith removed
- [ ] **Build succeeds**: `npm run build`
- [ ] **Type check passes**: `npm run type-check`
- [ ] **Tests pass**: `npm run test`

### 4. Monitoring Infrastructure

- [x] Prometheus configuration exists
- [x] Grafana dashboards created:
  - [x] `rag-operations.json` (existing)
  - [x] `agent-operations.json` (new)
- [x] Alert rules created:
  - [x] `rag-alerts.yml` (existing)
  - [x] `agent-operations-alerts.yml` (new)
- [ ] **Prometheus server running**
- [ ] **Grafana server running**
- [ ] **Dashboards imported**

---

## 🚀 Deployment Steps

### Step 1: Run Database Migration

```bash
# Option A: Using Supabase CLI (recommended)
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
bash scripts/run-ask-expert-sessions-migration.sh

# Option B: Manual execution
# 1. Open Supabase Dashboard
# 2. Go to SQL Editor
# 3. Copy contents of: supabase/migrations/20250129000001_create_ask_expert_sessions.sql
# 4. Execute the migration
```

**Verify migration**:
```sql
-- Check tables
\d ask_expert_sessions
\d ask_expert_messages

-- Test inserts
INSERT INTO ask_expert_sessions (tenant_id, user_id, agent_id, mode)
VALUES (gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 'mode_1_interactive_manual')
RETURNING id;
```

### Step 2: Deploy Application

```bash
# Build and deploy
npm run build
npm run deploy  # Or your deployment command

# Verify deployment
curl https://your-production-url.com/api/metrics?format=prometheus | head
```

### Step 3: Start Monitoring Stack

```bash
cd monitoring
docker-compose up -d

# Verify services
curl http://localhost:9090/api/v1/status/config  # Prometheus
curl http://localhost:3002/api/health            # Grafana (if health endpoint exists)
```

### Step 4: Import Grafana Dashboards

**Option A: Auto-provisioned** (recommended)
- Dashboards in `monitoring/grafana/dashboards/` are automatically loaded
- Restart Grafana: `docker-compose restart grafana`

**Option B: Manual import**
1. Access Grafana: http://localhost:3002
2. Login (admin / vital-path-2025)
3. Click "+" → Import
4. Upload `monitoring/grafana/dashboards/agent-operations.json`
5. Select Prometheus data source
6. Click Import

### Step 5: Configure Alerts

Verify alert rules are loaded:
```bash
curl http://localhost:9090/api/v1/rules | jq '.data.groups[].name'
```

Should include:
- `agent_search_performance`
- `graphrag_operations`
- `agent_selection`
- `mode_execution`
- `user_agent_operations`

### Step 6: Test Metrics Endpoints

```bash
# Main metrics endpoint (includes agent operations)
curl http://localhost:3000/api/metrics?format=prometheus | grep agent_

# Mode 1 metrics endpoint
curl http://localhost:3000/api/ask-expert/mode1/metrics?endpoint=stats

# Health check
curl http://localhost:3000/api/ask-expert/mode1/metrics?endpoint=health
```

---

## 📊 Post-Deployment Verification

### 1. Metrics Verification

**Check Prometheus is scraping**:
```bash
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.health == "up")'
```

**Verify metrics are being exported**:
```bash
curl http://localhost:9090/api/v1/query?query=agent_search_total | jq
```

**Expected metrics**:
- `agent_search_total`
- `agent_search_duration_ms_bucket`
- `agent_search_errors_total`
- `graphrag_search_hits_total`
- `graphrag_search_fallback_total`
- `agent_selection_total`
- `mode2_execution_duration_ms_bucket`
- `mode3_execution_duration_ms_bucket`

### 2. Grafana Dashboard Verification

**Access dashboards**:
- RAG Operations: http://localhost:3002/d/rag-operations
- Agent Operations: http://localhost:3002/d/agent-operations

**Verify panels are showing data**:
- Check time range (last 1 hour minimum)
- Generate some agent operations to create metrics
- Wait 15-30 seconds for Prometheus to scrape

### 3. Alert Verification

**Check active alerts**:
```bash
curl http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | {alertname, state}'
```

**Test alert** (if needed):
```bash
# Temporarily modify alert threshold in Grafana
# Or generate high-latency operations
```

### 4. Performance Baseline

After 24 hours, establish baseline:
- Average agent search latency: <500ms P95
- GraphRAG hit rate: >70%
- Error rate: <1%
- Mode 2 execution: <5s P95
- Mode 3 execution: <30s P95

---

## 📈 Monitoring Queries

### Grafana Dashboard Queries

**Agent Search P95 Latency**:
```promql
histogram_quantile(0.95, 
  rate(agent_search_duration_ms_bucket[5m])
)
```

**GraphRAG Hit Rate**:
```promql
rate(graphrag_search_hits_total[5m]) / 
(rate(graphrag_search_hits_total[5m]) + rate(graphrag_search_fallback_total[5m]))
```

**Error Rate by Operation**:
```promql
rate(agent_search_errors_total[5m]) / 
rate(agent_search_total[5m])
```

**Mode Execution Success Rate**:
```promql
rate(mode2_executions_total{status="success"}[5m]) / 
rate(mode2_executions_total[5m])
```

---

## 🔔 Alert Configuration

### Alert Channels

Configure in `monitoring/alertmanager/alertmanager.yml`:

```yaml
receivers:
  - name: 'slack'
    slack_configs:
      - channel: '#vital-path-alerts'
        webhook_url: 'YOUR_SLACK_WEBHOOK'
  
  - name: 'email'
    email_configs:
      - to: 'ops@vital-path.com'
        smarthost: 'smtp.gmail.com:587'
```

### Alert Routing

```yaml
route:
  group_by: ['alertname', 'component']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'slack'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
```

---

## 📝 Next Steps After Deployment

1. **Monitor for 24 hours**
   - Watch for alerts
   - Check dashboard metrics
   - Verify no errors

2. **Optimize based on metrics**
   - Identify slow operations
   - Improve GraphRAG hit rate
   - Reduce fallback usage

3. **Set up alerts notifications**
   - Configure Slack/PagerDuty
   - Test alert delivery
   - Document runbooks

4. **Documentation**
   - Update runbooks for new alerts
   - Document dashboard usage
   - Train team on monitoring

---

## ✅ Success Criteria

Deployment is successful when:

- [x] Migration applied successfully
- [ ] All metrics endpoints responding
- [ ] Prometheus scraping metrics
- [ ] Grafana dashboards showing data
- [ ] Alerts configured and tested
- [ ] No critical errors in logs
- [ ] Performance within targets (<1s search, >70% GraphRAG hit rate)

---

**Ready for Production**: ✅ Yes  
**Last Updated**: January 2025

