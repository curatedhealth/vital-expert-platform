# 📊 Grafana Dashboards & Alert Rules

**Date**: November 8, 2025  
**Status**: ✅ Monitoring Configuration Complete  
**Dashboards**: 4 production-ready dashboards  
**Alerts**: 12 critical alert rules  

---

## 🎯 **Dashboard Overview**

### **Dashboard 1: Performance Overview** ⭐ Main Dashboard
**Purpose**: Executive-level performance monitoring  
**Refresh**: 30s  
**Time Range**: Last 1 hour (configurable)

#### **Panels** (12 total)

1. **Overall Request Rate** (Graph)
   - Metric: `rate(vital_workflow_requests_total[5m])`
   - By: `mode`
   - Description: Requests per second across all modes

2. **Average Response Time** (Graph)
   - Metric: `rate(vital_workflow_duration_seconds_sum[5m]) / rate(vital_workflow_duration_seconds_count[5m])`
   - By: `mode`, `cache_status`
   - Description: P50 latency by mode and cache status

3. **P95 Latency** (Graph)
   - Metric: `histogram_quantile(0.95, vital_workflow_duration_seconds_bucket)`
   - By: `mode`
   - Description: 95th percentile latency

4. **P99 Latency** (Graph)
   - Metric: `histogram_quantile(0.99, vital_workflow_duration_seconds_bucket)`
   - By: `mode`
   - Description: 99th percentile latency

5. **Error Rate** (Graph + Alert)
   - Metric: `rate(vital_workflow_requests_failed_total[5m]) / rate(vital_workflow_requests_total[5m])`
   - By: `mode`, `error_type`
   - Description: Error percentage
   - **Alert**: > 5% for 5 minutes

6. **Cache Hit Rate** (Gauge)
   - Metric: `vital_cache_hit_rate`
   - By: `mode`
   - Description: Cache effectiveness (0-100%)
   - **Target**: > 60% for Mode 1/2

7. **Requests by Mode** (Pie Chart)
   - Metric: `sum by (mode) (vital_mode_distribution_total)`
   - Description: Mode distribution

8. **Quality Score Distribution** (Heatmap)
   - Metric: `vital_quality_score_bucket`
   - By: `mode`
   - Description: Quality score distribution

9. **Degraded Responses** (Graph)
   - Metric: `rate(vital_degraded_responses_total[5m])`
   - By: `degradation_reason`
   - Description: Degradation rate and reasons

10. **Active Workflows** (Stat)
    - Metric: `sum(rate(vital_workflow_requests_total[1m])) * 60`
    - Description: Workflows per minute

11. **Success Rate** (Gauge)
    - Metric: `rate(vital_workflow_requests_success_total[5m]) / rate(vital_workflow_requests_total[5m]) * 100`
    - Description: Overall success percentage
    - **Target**: > 95%

12. **Top Tenants** (Table)
    - Metric: `topk(10, sum by (tenant_id) (vital_queries_per_tenant_total))`
    - Description: Most active tenants

---

### **Dashboard 2: Cache Performance** 📦
**Purpose**: Detailed cache monitoring  
**Refresh**: 30s  
**Time Range**: Last 6 hours

#### **Panels** (10 total)

1. **Cache Hit Rate Over Time** (Graph)
   - Metric: `vital_cache_hit_rate`
   - By: `mode`
   - Description: Hit rate trend

2. **Cache Operations** (Graph)
   - Metric: `rate(vital_cache_operations_total[5m])`
   - By: `operation` (hit, miss, write, evict)
   - Description: Cache operation breakdown

3. **Cache Size** (Graph)
   - Metric: `vital_cache_size_entries`
   - Description: Number of cached entries
   - **Alert**: > 950 (near limit)

4. **Cache Memory Usage** (Graph + Gauge)
   - Metric: `vital_cache_memory_bytes / 1024 / 1024`
   - Description: Memory usage in MB

5. **Cache Entry Age** (Histogram)
   - Metric: `vital_cache_entry_age_seconds_bucket`
   - Description: Distribution of entry ages

6. **Cache Hit/Miss Ratio** (Stat)
   - Metric: `sum(rate(vital_cache_operations_total{operation="hit"}[5m])) / sum(rate(vital_cache_operations_total{operation=~"hit|miss"}[5m]))`
   - Description: Hit ratio percentage

7. **Evictions Rate** (Graph)
   - Metric: `rate(vital_cache_operations_total{operation="evict"}[5m])`
   - Description: Cache eviction rate
   - **Alert**: Sudden spikes indicate pressure

8. **Average Entry Lifetime** (Stat)
   - Metric: `avg(vital_cache_entry_age_seconds)`
   - Description: Average time entries stay cached

9. **Cache Performance by Mode** (Table)
   - Metrics: Hit rate, miss rate, write rate per mode
   - Description: Per-mode cache effectiveness

10. **Invalidation Events** (Graph)
    - Metric: `rate(vital_cache_operations_total{operation="invalidate"}[5m])`
    - Description: Manual cache invalidations

---

### **Dashboard 3: Cost Optimization** 💰
**Purpose**: Track API costs and resource usage  
**Refresh**: 1m  
**Time Range**: Last 24 hours

#### **Panels** (11 total)

1. **Estimated Daily Cost** (Stat + Alert)
   - Metric: `sum(increase(vital_estimated_cost_dollars[24h]))`
   - Description: Total cost in last 24h
   - **Alert**: > $X threshold

2. **Cost Breakdown** (Pie Chart)
   - Metric: `sum by (cost_type) (vital_estimated_cost_dollars)`
   - By: `cost_type` (llm, tools, rag)
   - Description: Cost distribution

3. **LLM API Calls** (Graph)
   - Metric: `rate(vital_llm_api_calls_total[5m])`
   - By: `mode`, `cached`
   - Description: LLM calls (cached vs non-cached)

4. **Cost Saved via Cache** (Stat)
   - Metric: `sum(vital_llm_api_calls_total{cached="true"}) * 0.05`
   - Description: Estimated savings from caching

5. **Token Usage** (Graph)
   - Metric: `rate(vital_llm_tokens_used_total[5m])`
   - By: `token_type` (input, output)
   - Description: Token consumption rate

6. **Tool Executions** (Graph)
   - Metric: `rate(vital_tool_executions_total[5m])`
   - By: `tool_name`, `status`
   - Description: Tool usage and success rate

7. **RAG Retrievals** (Graph)
   - Metric: `rate(vital_rag_retrievals_total[5m])`
   - By: `source_type`
   - Description: RAG retrieval rate

8. **Cost per Mode** (Table)
   - Metrics: LLM calls, tokens, tool executions per mode
   - Description: Cost breakdown by mode

9. **Most Expensive Tenants** (Table)
   - Metric: `topk(10, sum by (tenant_id) (vital_estimated_cost_dollars))`
   - Description: Highest-cost tenants

10. **Cost Trend** (Graph)
    - Metric: `increase(vital_estimated_cost_dollars[1h])`
    - Description: Cost trend over time

11. **Cost Savings Percentage** (Gauge)
    - Metric: `(sum(vital_llm_api_calls_total{cached="true"}) / sum(vital_llm_api_calls_total)) * 100`
    - Description: Percentage of calls saved by cache
    - **Target**: > 60% for Mode 1/2

---

### **Dashboard 4: System Health** 🏥
**Purpose**: Infrastructure and system-level monitoring  
**Refresh**: 10s  
**Time Range**: Last 30 minutes

#### **Panels** (10 total)

1. **Build Information** (Table)
   - Metric: `vital_build_info`
   - Description: Version, commit, environment

2. **Connection Pool Status** (Graph)
   - Metric: `vital_connection_pool_size`
   - By: `pool_type` (db, http, llm)
   - Description: Pool sizes

3. **Active Connections** (Graph)
   - Metric: `vital_active_connections`
   - By: `pool_type`
   - Description: Connections in use

4. **Error Types Distribution** (Pie Chart)
   - Metric: `sum by (error_type) (vital_workflow_requests_failed_total)`
   - Description: Error breakdown

5. **Quality Score Trend** (Graph)
   - Metric: `avg(vital_quality_score)`
   - By: `mode`
   - Description: Average quality over time
   - **Alert**: < 0.8 for 10 minutes

6. **Warnings Rate** (Graph)
   - Metric: `rate(vital_warnings_total[5m])`
   - By: `warning_type`
   - Description: Warning generation rate

7. **Tool Success Rate** (Gauge)
   - Metric: `sum(rate(vital_tool_executions_total{status="success"}[5m])) / sum(rate(vital_tool_executions_total[5m])) * 100`
   - Description: Tool execution success percentage
   - **Target**: > 90%

8. **RAG Success Rate** (Gauge)
   - Metric: `sum(rate(vital_rag_retrievals_total{status="success"}[5m])) / sum(rate(vital_rag_retrievals_total[5m])) * 100`
   - Description: RAG retrieval success percentage
   - **Target**: > 95%

9. **Agent Usage** (Table)
   - Metric: `topk(10, sum by (agent_name) (vital_agent_usage_total))`
   - Description: Most-used agents

10. **System Uptime** (Stat)
    - Metric: `time() - process_start_time_seconds`
    - Description: Time since last restart

---

## 🚨 **Alert Rules** (12 Critical Alerts)

### **Performance Alerts**

#### **1. High Error Rate**
```yaml
alert: HighErrorRate
expr: |
  rate(vital_workflow_requests_failed_total[5m]) / 
  rate(vital_workflow_requests_total[5m]) > 0.05
for: 5m
labels:
  severity: critical
  component: workflow
annotations:
  summary: "Error rate above 5% for 5 minutes"
  description: "Current error rate: {{ $value | humanizePercentage }}"
```

#### **2. High Latency**
```yaml
alert: HighLatency
expr: |
  histogram_quantile(0.95, vital_workflow_duration_seconds_bucket) > 10
for: 5m
labels:
  severity: warning
  component: workflow
annotations:
  summary: "P95 latency above 10 seconds"
  description: "P95 latency: {{ $value }}s"
```

#### **3. Very High Latency**
```yaml
alert: VeryHighLatency
expr: |
  histogram_quantile(0.99, vital_workflow_duration_seconds_bucket) > 30
for: 5m
labels:
  severity: critical
  component: workflow
annotations:
  summary: "P99 latency above 30 seconds"
  description: "P99 latency: {{ $value }}s"
```

### **Cache Alerts**

#### **4. Low Cache Hit Rate**
```yaml
alert: LowCacheHitRate
expr: |
  vital_cache_hit_rate{mode=~"1|2"} < 0.4
for: 15m
labels:
  severity: warning
  component: cache
annotations:
  summary: "Cache hit rate below 40% for Mode {{ $labels.mode }}"
  description: "Hit rate: {{ $value | humanizePercentage }}"
```

#### **5. Cache Near Capacity**
```yaml
alert: CacheNearCapacity
expr: |
  vital_cache_size_entries > 950
for: 10m
labels:
  severity: warning
  component: cache
annotations:
  summary: "Cache size near maximum (950/1000)"
  description: "Current size: {{ $value }} entries"
```

#### **6. High Cache Eviction Rate**
```yaml
alert: HighCacheEvictionRate
expr: |
  rate(vital_cache_operations_total{operation="evict"}[5m]) > 10
for: 10m
labels:
  severity: warning
  component: cache
annotations:
  summary: "High cache eviction rate detected"
  description: "Eviction rate: {{ $value }} per second"
```

### **Cost Alerts**

#### **7. High Daily Cost**
```yaml
alert: HighDailyCost
expr: |
  sum(increase(vital_estimated_cost_dollars[24h])) > 100
for: 1h
labels:
  severity: warning
  component: cost
annotations:
  summary: "Daily cost exceeds $100"
  description: "Current 24h cost: ${{ $value }}"
```

#### **8. Sudden Cost Spike**
```yaml
alert: SuddenCostSpike
expr: |
  rate(vital_estimated_cost_dollars[5m]) > 
  rate(vital_estimated_cost_dollars[1h] offset 1h) * 2
for: 10m
labels:
  severity: critical
  component: cost
annotations:
  summary: "Cost rate doubled compared to 1 hour ago"
  description: "Investigate immediate cost increase"
```

### **Quality Alerts**

#### **9. Low Quality Score**
```yaml
alert: LowQualityScore
expr: |
  avg(vital_quality_score) < 0.8
for: 10m
labels:
  severity: warning
  component: quality
annotations:
  summary: "Average quality score below 0.8"
  description: "Quality score: {{ $value }}"
```

#### **10. High Degradation Rate**
```yaml
alert: HighDegradationRate
expr: |
  rate(vital_degraded_responses_total[5m]) / 
  rate(vital_workflow_requests_total[5m]) > 0.20
for: 10m
labels:
  severity: warning
  component: quality
annotations:
  summary: "More than 20% of responses degraded"
  description: "Degradation rate: {{ $value | humanizePercentage }}"
```

### **System Alerts**

#### **11. Tool Failure Rate High**
```yaml
alert: ToolFailureRateHigh
expr: |
  rate(vital_tool_executions_total{status="failed"}[5m]) / 
  rate(vital_tool_executions_total[5m]) > 0.10
for: 10m
labels:
  severity: warning
  component: tools
annotations:
  summary: "Tool failure rate above 10%"
  description: "Failure rate: {{ $value | humanizePercentage }}"
```

#### **12. RAG Failure Rate High**
```yaml
alert: RAGFailureRateHigh
expr: |
  rate(vital_rag_retrievals_total{status="failed"}[5m]) / 
  rate(vital_rag_retrievals_total[5m]) > 0.05
for: 10m
labels:
  severity: critical
  component: rag
annotations:
  summary: "RAG failure rate above 5%"
  description: "Failure rate: {{ $value | humanizePercentage }}"
```

---

## 🔧 **Setup Instructions**

### **1. Install Prometheus**
```bash
# Docker
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v ./prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# Or use docker-compose (see prometheus-docker-compose.yml)
```

### **2. Install Grafana**
```bash
# Docker
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana

# Default credentials: admin/admin
```

### **3. Configure Prometheus Scrape**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'vital-ai-engine'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:8000']  # Your FastAPI app
    metrics_path: '/metrics'
```

### **4. Add Prometheus Data Source in Grafana**
1. Go to Configuration → Data Sources
2. Add Prometheus
3. URL: http://prometheus:9090
4. Save & Test

### **5. Import Dashboards**
1. Go to Dashboards → Import
2. Upload dashboard JSON files
3. Select Prometheus data source
4. Import

### **6. Configure Alert Manager**
```yaml
# alertmanager.yml
route:
  receiver: 'slack-notifications'
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#vital-alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

---

## 📱 **Slack Alert Example**

When an alert fires, you'll receive:

```
🚨 CRITICAL: HighErrorRate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Error rate above 5% for 5 minutes
Current error rate: 8.3%

Mode: 1 (Manual Interactive)
Tenant: tenant-abc-123

View Dashboard: https://grafana/d/performance
Runbook: https://wiki/runbooks/high-error-rate
```

---

## 🎯 **Monitoring Checklist**

### **Day 1: Setup**
- [ ] Install Prometheus + Grafana
- [ ] Configure metrics endpoint (`/metrics`)
- [ ] Import 4 dashboards
- [ ] Configure alert manager
- [ ] Test alerts with manual triggers

### **Week 1: Baseline**
- [ ] Collect baseline metrics
- [ ] Adjust alert thresholds
- [ ] Fine-tune dashboard refresh rates
- [ ] Document baseline performance

### **Week 2: Optimization**
- [ ] Identify performance bottlenecks
- [ ] Optimize based on metrics
- [ ] Measure improvement
- [ ] Update alert thresholds

### **Ongoing**
- [ ] Review dashboards daily
- [ ] Investigate alerts promptly
- [ ] Update runbooks
- [ ] Share insights with team

---

## 📊 **Expected Metrics (After Optimization)**

```
Performance Overview:
- Average Response Time: 0.8s (cache hit), 2.5s (cache miss)
- P95 Latency: 4.5s
- P99 Latency: 8.2s
- Error Rate: <2%
- Success Rate: >98%

Cache Performance:
- Hit Rate (Mode 1/2): 65-75%
- Cache Size: 600-800 entries
- Average Entry Lifetime: 180s
- Eviction Rate: <1/min

Cost Optimization:
- Daily Cost: $X (baseline)
- Cost Saved via Cache: 60-70%
- LLM Calls Saved: 2000-3000/day
- Tool Success Rate: >95%

System Health:
- Quality Score: >0.90
- Degradation Rate: <10%
- Tool Success Rate: >95%
- RAG Success Rate: >97%
```

---

**Status**: ✅ **Monitoring Infrastructure Ready**  
**Next**: Run system, collect metrics, adjust thresholds

