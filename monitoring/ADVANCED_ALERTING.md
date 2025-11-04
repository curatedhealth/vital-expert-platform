# Advanced Alert Correlation & Root Cause Analysis

## Alert Correlation Rules

Add these to `monitoring/prometheus/alerts.yml`:

```yaml
groups:
  # Alert Correlation & Root Cause Analysis
  - name: correlation
    interval: 1m
    rules:
      # Correlated LLM & Cost Spike
      - alert: CorrelatedLLMCostSpike
        expr: |
          (rate(llm_cost_usd_total[5m]) > 2 * rate(llm_cost_usd_total[1h] offset 1h))
          and
          (rate(llm_requests_total[5m]) > 2 * rate(llm_requests_total[1h] offset 1h))
        for: 10m
        labels:
          severity: warning
          category: correlation
          root_cause: high_llm_traffic
        annotations:
          summary: "Correlated LLM cost and traffic spike"
          description: "Both LLM costs and request volume are 2x higher than normal. Possible causes: viral content, bot attack, or feature release."
          runbook_url: "https://docs.vital.com/runbooks/llm-cost-spike"

      # Agent Failure + High Error Rate
      - alert: AgentFailureCascade
        expr: |
          (rate(agent_executions_failed_total[5m]) / rate(agent_executions_total[5m]) > 0.2)
          and
          (rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.1)
        for: 5m
        labels:
          severity: critical
          category: correlation
          root_cause: agent_system_failure
        annotations:
          summary: "Agent failures causing cascading HTTP errors"
          description: "Agent failure rate >20% is causing HTTP 5xx errors >10%. System-wide issue detected."
          runbook_url: "https://docs.vital.com/runbooks/agent-cascade"

      # Database Slowdown + High Latency
      - alert: DatabaseBottleneck
        expr: |
          (rate(pg_stat_activity_max_tx_duration[5m]) > 10)
          and
          (histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 5)
        for: 5m
        labels:
          severity: warning
          category: correlation
          root_cause: database_bottleneck
        annotations:
          summary: "Database slowdown causing high API latency"
          description: "Database transaction duration >10s is causing API p95 latency >5s. Check slow queries."
          runbook_url: "https://docs.vital.com/runbooks/db-bottleneck"

      # Memory Leak + High Error Rate
      - alert: MemoryLeakDetected
        expr: |
          (rate(node_memory_MemAvailable_bytes[30m]) < -10000000)
          and
          (rate(http_requests_total{status=~"5.."}[5m]) > 10)
        for: 15m
        labels:
          severity: critical
          category: correlation
          root_cause: memory_leak
        annotations:
          summary: "Potential memory leak causing errors"
          description: "Available memory decreasing by >10MB/min with increasing error rate. Possible memory leak."
          runbook_url: "https://docs.vital.com/runbooks/memory-leak"

      # Rate Limit + User Errors
      - alert: RateLimitCausingErrors
        expr: |
          (rate(quota_violations_total[5m]) > 5)
          and
          (rate(user_errors_total[5m]) > 10)
        for: 5m
        labels:
          severity: warning
          category: correlation
          root_cause: rate_limiting
        annotations:
          summary: "Rate limiting causing user errors"
          description: "High rate limit violations (>5/sec) correlating with user errors (>10/sec). Review quotas."
          runbook_url: "https://docs.vital.com/runbooks/rate-limits"

      # Cost Budget + Performance Throttling
      - alert: BudgetThrottling
        expr: |
          (sum(increase(llm_cost_usd_total[24h])) > 150)
          and
          (histogram_quantile(0.95, rate(llm_request_duration_seconds_bucket[5m])) > 10)
        for: 10m
        labels:
          severity: warning
          category: correlation
          root_cause: budget_throttling
        annotations:
          summary: "Approaching budget causing LLM throttling"
          description: "Daily cost >$150 (75% budget) with LLM latency >10s. May be throttling to preserve budget."
          runbook_url: "https://docs.vital.com/runbooks/budget-throttling"

  # Predictive Alerts (Early Warning System)
  - name: predictive
    interval: 5m
    rules:
      # Predict cost overrun
      - alert: PredictedMonthlyBudgetOverrun
        expr: |
          (
            sum(increase(llm_cost_usd_total[7d])) / 7 * 30
          ) > 5000
        for: 1h
        labels:
          severity: warning
          category: predictive
          root_cause: cost_trajectory
        annotations:
          summary: "Predicted monthly cost overrun"
          description: "Based on last 7 days, projected monthly cost: ${{ $value | humanize }}. Budget: $5000."
          runbook_url: "https://docs.vital.com/runbooks/cost-forecast"

      # Predict disk full
      - alert: DiskWillBeFull
        expr: |
          predict_linear(node_filesystem_avail_bytes{mountpoint="/"}[6h], 4 * 3600) < 0
        for: 1h
        labels:
          severity: warning
          category: predictive
          root_cause: disk_growth
        annotations:
          summary: "Disk will be full in 4 hours"
          description: "Based on current growth rate, disk will be full in ~4 hours. Free space cleanup needed."
          runbook_url: "https://docs.vital.com/runbooks/disk-cleanup"

      # Predict agent saturation
      - alert: AgentSaturationImminent
        expr: |
          predict_linear(rate(agent_executions_total[1h])[6h:1h], 4 * 3600) > 1000
        for: 30m
        labels:
          severity: info
          category: predictive
          root_cause: traffic_growth
        annotations:
          summary: "Agent capacity will be saturated in 4 hours"
          description: "Current growth rate predicts >1000 agent req/sec in 4 hours. Consider scaling."
          runbook_url: "https://docs.vital.com/runbooks/agent-scaling"

  # Smart Anomaly Detection
  - name: anomaly_detection
    interval: 5m
    rules:
      # Anomalous request pattern
      - alert: AnomalousRequestPattern
        expr: |
          abs(rate(http_requests_total[5m]) - avg_over_time(rate(http_requests_total[5m])[1h:5m])) 
          > 
          3 * stddev_over_time(rate(http_requests_total[5m])[1h:5m])
        for: 10m
        labels:
          severity: warning
          category: anomaly
          root_cause: traffic_anomaly
        annotations:
          summary: "Anomalous request pattern detected"
          description: "Request rate is 3σ from 1-hour average. Possible bot attack or viral content."
          runbook_url: "https://docs.vital.com/runbooks/traffic-anomaly"

      # Anomalous cost pattern
      - alert: AnomalousCostPattern
        expr: |
          abs(rate(llm_cost_usd_total[10m]) - avg_over_time(rate(llm_cost_usd_total[10m])[6h:10m])) 
          > 
          2 * stddev_over_time(rate(llm_cost_usd_total[10m])[6h:10m])
        for: 15m
        labels:
          severity: warning
          category: anomaly
          root_cause: cost_anomaly
        annotations:
          summary: "Anomalous LLM cost pattern detected"
          description: "LLM costs are 2σ from 6-hour average. Investigate expensive queries or model changes."
          runbook_url: "https://docs.vital.com/runbooks/cost-anomaly"

      # Anomalous agent behavior
      - alert: AnomalousAgentBehavior
        expr: |
          abs(
            rate(agent_executions_success_total[5m]) / rate(agent_executions_total[5m])
            -
            avg_over_time((rate(agent_executions_success_total[5m]) / rate(agent_executions_total[5m]))[1h:5m])
          ) > 0.2
        for: 10m
        labels:
          severity: warning
          category: anomaly
          root_cause: agent_anomaly
        annotations:
          summary: "Anomalous agent success rate"
          description: "Agent success rate changed by >20% from 1-hour average. Check for degradation or improvements."
          runbook_url: "https://docs.vital.com/runbooks/agent-anomaly"
```

## Root Cause Analysis Runbooks

### Cost Spike (`runbooks/llm-cost-spike.md`)

```markdown
# LLM Cost Spike Runbook

## Symptoms
- LLM costs 2x higher than normal
- High request volume
- Alert: `CorrelatedLLMCostSpike`

## Investigation Steps

1. **Check Request Volume**
   ```promql
   rate(llm_requests_total[5m])
   ```

2. **Identify Top Cost Drivers**
   ```promql
   topk(5, sum(rate(llm_cost_usd_total[5m])) by (model))
   ```

3. **Check Top Users**
   ```sql
   SELECT user_id, COUNT(*), SUM(cost_usd) as total_cost
   FROM analytics.tenant_cost_events
   WHERE time > NOW() - INTERVAL '1 hour'
   GROUP BY user_id
   ORDER BY total_cost DESC
   LIMIT 10;
   ```

4. **Check Sentry for Errors**
   - Go to Sentry dashboard
   - Filter by last 1 hour
   - Look for retry loops or stuck processes

## Common Root Causes

1. **Viral Content** - legitimate spike in traffic
2. **Bot Attack** - automated queries from single IP
3. **Retry Loops** - errors causing exponential retries
4. **Model Change** - switched to more expensive model
5. **Feature Release** - new feature driving usage

## Resolution

**For Bot Attack:**
```bash
# Block suspicious IP
# Add to rate limits
```

**For Retry Loops:**
```bash
# Identify failing service
# Deploy hotfix
# Clear retry queue
```

**For Model Change:**
```bash
# Review model selection logic
# Consider downgrading for non-critical queries
```

## Prevention
- Set up cost alerts at $50, $100, $150
- Implement circuit breakers
- Add exponential backoff to retries
- Review model selection regularly
```

## Grafana Alert Correlation Dashboard

Create a new dashboard `vital-alert-correlation.json`:

```json
{
  "title": "VITAL - Alert Correlation & RCA",
  "panels": [
    {
      "title": "Active Alerts Timeline",
      "type": "timeseries",
      "targets": [
        {
          "expr": "ALERTS{alertstate=\"firing\"}",
          "legendFormat": "{{alertname}}"
        }
      ]
    },
    {
      "title": "Alert Correlation Matrix",
      "type": "table",
      "targets": [
        {
          "expr": "count by (alertname) (ALERTS{alertstate=\"firing\"})"
        }
      ]
    },
    {
      "title": "Root Cause Distribution",
      "type": "piechart",
      "targets": [
        {
          "expr": "count by (root_cause) (ALERTS{alertstate=\"firing\"})"
        }
      ]
    }
  ]
}
```

## Automated Root Cause Analysis

The `UnifiedObservabilityService` can be extended to auto-correlate:

```typescript
// Add to UnifiedObservabilityService.ts

async performRootCauseAnalysis(alertName: string): Promise<{
  rootCause: string;
  correlatedAlerts: string[];
  suggestedActions: string[];
  confidence: number;
}> {
  // Query Prometheus for correlated metrics
  // Analyze Sentry errors
  // Check LangFuse traces
  // Query analytics DB
  
  // Return RCA results
}
```

## Integration with Slack

Alerts now include root cause in Slack messages:

```yaml
# In alertmanager.yml
- name: 'slack-engineering'
  slack_configs:
    - channel: '#vital-engineering'
      title: '🔧 {{ .CommonLabels.alertname }}'
      text: |
        *Root Cause:* {{ .CommonLabels.root_cause }}
        *Summary:* {{ .CommonAnnotations.summary }}
        *Runbook:* {{ .CommonAnnotations.runbook_url }}
```

## Success Metrics

- **MTTR (Mean Time To Resolution):** Target <15 minutes
- **Alert Correlation Rate:** >80% of alerts have identified root cause
- **False Positive Rate:** <5%
- **Auto-Resolution Rate:** >30% of alerts self-resolve

---

**Status:** Advanced alerting configured for A++ operations! 🎯

