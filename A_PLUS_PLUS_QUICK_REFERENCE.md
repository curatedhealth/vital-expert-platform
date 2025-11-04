# 🌟 A++ Observability - Quick Reference

## 📞 One-Liner Access

```typescript
import { getObservabilityService } from '@/lib/observability/UnifiedObservabilityService';
const observability = getObservabilityService();
```

---

## ⚡ Common Operations

### Track HTTP Request
```typescript
await observability.trackHttpRequest({
  method: 'POST',
  route: '/api/endpoint',
  status: 200,
  duration: 1.5, // seconds
  userId: 'user-123',
  requestId: 'req-xyz',
  error: error, // optional, only if error
});
```

### Track LLM Call
```typescript
const traceId = await observability.trackLLMCall({
  model: 'gpt-4',
  provider: 'openai',
  promptTokens: 1000,
  completionTokens: 500,
  totalTokens: 1500,
  costUsd: 0.045,
  duration: 3.5, // seconds
  agentId: 'agent-123',
  userId: 'user-123',
  sessionId: 'session-xyz',
  quality: 87, // optional quality score
});
```

### Track Agent Execution
```typescript
await observability.trackAgentExecution({
  agentId: 'agent-ask-expert',
  agentType: 'ask_expert',
  success: true,
  duration: 5.2, // seconds
  userId: 'user-123',
  sessionId: 'session-xyz',
  traceId: 'trace-abc',
  qualityScore: 85,
  metadata: {
    sources_count: 5,
    citations_count: 3,
  },
});
```

### Track Error
```typescript
observability.trackError(error, {
  userId: 'user-123',
  sessionId: 'session-xyz',
  agentId: 'agent-123',
  requestId: 'req-xyz',
  metadata: {
    context: 'additional context',
  },
});
```

### Set User Context
```typescript
observability.setUser('user-123', 'john@example.com', 'John Doe');
```

### Add Breadcrumb
```typescript
observability.addBreadcrumb('User clicked button', 'ui', {
  button_id: 'submit-query',
});
```

---

## 🔍 Where to Check

| What | Where | URL |
|------|-------|-----|
| **Errors** | Sentry | https://sentry.io/your-org/vital |
| **LLM Traces** | LangFuse | http://localhost:3002 |
| **Metrics** | Prometheus | http://localhost:9090 |
| **Dashboards** | Grafana | http://localhost:3001 |
| **Alerts** | Alertmanager | http://localhost:9093 |
| **Analytics** | Admin Dashboard | http://localhost:3000/admin?view=executive |

---

## 📊 Key Grafana Dashboards

1. **VITAL Platform - Production Overview**
   - Service availability
   - Request rates
   - Error rates
   - LLM costs
   - Agent performance

2. **VITAL Platform - LLM Performance & Cost**
   - Cost tracking (24h, MTD)
   - Token usage breakdown
   - Latency percentiles
   - Model comparison

---

## 🚨 Alert Severity Levels

| Level | Route | Response | Examples |
|-------|-------|----------|----------|
| **Critical** | PagerDuty | Immediate | System down, cascade failures |
| **Warning** | Slack | 15 min | High costs, anomalies |
| **Info** | Slack | 1 hour | Predictive warnings |

---

## 🔧 Common Queries

### Prometheus

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Daily LLM cost
sum(increase(llm_cost_usd_total[24h]))

# Agent success rate
rate(agent_executions_success_total[15m]) / rate(agent_executions_total[15m])

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### TimescaleDB

```sql
-- Recent queries
SELECT * FROM analytics.platform_events 
WHERE event_type = 'query_submitted' 
ORDER BY time DESC LIMIT 10;

-- Hourly cost
SELECT 
  time_bucket('1 hour', time) as hour,
  SUM(cost_usd) as hourly_cost
FROM analytics.tenant_cost_events
WHERE time > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

-- Agent performance
SELECT 
  agent_id,
  COUNT(*) as executions,
  AVG(execution_time_ms) as avg_time,
  COUNT(*) FILTER (WHERE success) * 100.0 / COUNT(*) as success_rate
FROM analytics.agent_executions
WHERE time > NOW() - INTERVAL '1 hour'
GROUP BY agent_id;
```

---

## 🎯 Health Check

```bash
# Check all services
curl http://localhost:3000/api/metrics  # Application
curl http://localhost:9090/-/healthy    # Prometheus
curl http://localhost:3001/api/health   # Grafana
curl http://localhost:9093/-/healthy    # Alertmanager
curl http://localhost:3002/api/public/health  # LangFuse (if running)

# Check Sentry integration
# Run a test query and check Sentry dashboard
```

---

## 📦 Installation (Quick)

```bash
# 1. Install packages
cd apps/digital-health-startup
npm install @sentry/nextjs langfuse langfuse-langchain

# 2. Set environment variables (see .env.local)
# 3. Deploy monitoring stack
cd monitoring && ./deploy.sh

# 4. Import Grafana dashboards
# 5. Verify integration
```

---

## 🐛 Troubleshooting

**Sentry not tracking:**
```typescript
// Test manually
observability.trackError(new Error('Test'), { userId: 'test' });
```

**LangFuse not showing traces:**
```typescript
// Force flush
await observability.flush();
```

**Metrics not appearing:**
```bash
# Check endpoint
curl http://localhost:3000/api/metrics

# Check Prometheus targets
open http://localhost:9090/targets
```

---

## 💡 Pro Tips

1. **Always set user context** at login
2. **Add breadcrumbs** for important user actions
3. **Use trace IDs** to correlate across tools
4. **Check Executive Dashboard** daily
5. **Review Sentry issues** weekly
6. **Analyze LangFuse traces** for expensive queries
7. **Set up Slack alerts** immediately
8. **Create custom Grafana dashboards** for your team

---

## 🎯 Performance Targets

| Metric | Target | Check In |
|--------|--------|----------|
| Error Rate | <1% | Executive Dashboard |
| P95 Latency | <2s | Grafana |
| Agent Success | >95% | Analytics Dashboard |
| Daily Cost | <$200 | Cost Dashboard |
| Uptime | >99.9% | Grafana |

---

## 📚 Quick Links

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **LangFuse Docs:** https://langfuse.com/docs/
- **Prometheus Docs:** https://prometheus.io/docs/
- **Grafana Docs:** https://grafana.com/docs/

---

**Print this for your desk! 📄**

**Version:** A++ (v1.0.0)  
**Last Updated:** November 4, 2025  
**Status:** 🌟 Production Ready

