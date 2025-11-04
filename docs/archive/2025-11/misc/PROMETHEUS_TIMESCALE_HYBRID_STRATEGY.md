# Hybrid Monitoring Strategy: Prometheus + TimescaleDB

**Date**: October 27, 2025
**Status**: RECOMMENDED APPROACH ⭐
**Context**: You already have Prometheus metrics endpoint implemented

---

## 🎯 Discovery: What You Already Have

### ✅ Prometheus Metrics Endpoint (Implemented)

**Location**: `/api/metrics`

**Features**:
```typescript
// GET /api/metrics - Prometheus-compatible format
// GET /api/metrics?format=json - JSON format

Exports:
- LangExtract metrics (entity extraction stats)
- Cost tracking metrics
- Platform metrics (queries, latency, etc.)
```

**Docker Compose** (archived):
```yaml
prometheus:
  image: prom/prometheus:latest
  # Configuration in archive/old-docker-compose/
```

**OpenTelemetry Integration**:
```
@opentelemetry/exporter-prometheus@0.205.0
```

---

## 🎨 Recommended: Hybrid Strategy (Best of Both Worlds)

### **Use BOTH Prometheus + TimescaleDB** ⭐

**Why Hybrid?**
1. ✅ Keep existing Prometheus endpoint (already implemented)
2. ✅ Add TimescaleDB for long-term storage
3. ✅ Each tool for what it does best
4. ✅ No wasted implementation effort

---

## 📊 Architecture: Hybrid Monitoring

```
┌─────────────────────────────────────────────────────────┐
│                   RAG Operations                        │
│  (unified-rag-service, cloud-rag-service, etc.)        │
└───────────────┬─────────────────────────────────────────┘
                │
                ├──────────────────┬─────────────────────┐
                │                  │                     │
                ▼                  ▼                     ▼
        ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
        │ In-Memory    │   │ Prometheus   │   │ TimescaleDB  │
        │ Trackers     │   │ Metrics      │   │ (Long-term)  │
        │              │   │ Endpoint     │   │              │
        │ • Latency    │   │ /api/metrics │   │ • Supabase   │
        │ • Cost       │   │              │   │ • SQL        │
        │ • Circuit    │   │ Scraped by   │   │ • Years      │
        │   Breaker    │   │ Prometheus   │   │   retention  │
        │              │   │ Server       │   │              │
        │ Last 10K ops │   │ 90 days      │   │ Compressed   │
        └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
               │                  │                   │
               ▼                  ▼                   ▼
        ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
        │ Real-time    │   │ Grafana      │   │ Grafana      │
        │ API          │   │ Dashboards   │   │ Dashboards   │
        │              │   │              │   │              │
        │ /rag-metrics │   │ Infrastructure│   │ Historical   │
        │              │   │ monitoring   │   │ analysis     │
        └──────────────┘   └──────────────┘   └──────────────┘
```

---

## 🎯 Division of Responsibilities

### **In-Memory Trackers** (Phase 1 - Implemented)

**Purpose**: Real-time operational metrics

**Use For**:
- ✅ Real-time dashboard (current values)
- ✅ Instant alerts (P95 > 2000ms)
- ✅ Live debugging (slow queries right now)
- ✅ Circuit breaker state
- ✅ Current cache hit rate

**Retention**: Last 2-3 hours

**API**: `/api/rag-metrics` (7 endpoints)

---

### **Prometheus** (Existing Implementation)

**Purpose**: Infrastructure & aggregate metrics

**Use For**:
- ✅ **Service-level metrics** (not per-query)
  - Total queries per minute
  - Average latency (not P95/P99)
  - Error rate
  - Circuit breaker state counts
  - Cache hit rate percentage
- ✅ **Infrastructure monitoring**
  - CPU/memory usage
  - Request rate
  - Response times
  - Error counts
- ✅ **Alerting** (Prometheus Alertmanager)
  - Service down alerts
  - High error rate alerts
  - Latency SLO breaches
- ✅ **Short-term trends** (90 days default)

**Retention**: 90 days (can extend with Thanos, but expensive)

**API**: `/api/metrics` (Prometheus scrapes this)

**Grafana**: Connect to Prometheus data source

---

### **TimescaleDB** (New - Phase 2)

**Purpose**: Long-term detailed storage

**Use For**:
- ✅ **Per-query granular data**
  - Every query with full metadata
  - Exact P95/P99 calculations
  - Per-user cost attribution
  - Per-agent performance
  - Slow query forensics
- ✅ **Historical analysis**
  - Week-over-week comparisons
  - Month-over-month trends
  - Seasonal patterns
  - Cost forecasting
- ✅ **Compliance & Audit**
  - FDA audit trails (years of data)
  - Cost breakdown reports
  - Performance regression detection
- ✅ **Advanced analytics** (SQL)
  - Multi-dimensional queries
  - Custom aggregations
  - Anomaly detection

**Retention**: Years (with 90% compression)

**API**: SQL queries via Supabase

**Grafana**: Connect to PostgreSQL/TimescaleDB data source

---

## 📋 Comparison Matrix

| Feature | In-Memory | Prometheus | TimescaleDB |
|---------|-----------|------------|-------------|
| **Real-time (<1s)** | ✅ Yes | ⚠️ 15-30s scrape interval | ❌ No (async writes) |
| **Per-Query Detail** | ✅ Yes (last 10K) | ❌ No (aggregates only) | ✅ Yes (all queries) |
| **Retention** | 2-3 hours | 90 days | Years |
| **Alerting** | ✅ API-based | ✅ Built-in | ⚠️ Via queries |
| **SQL Queries** | ❌ No | ❌ No (PromQL) | ✅ Yes |
| **Infrastructure Metrics** | ❌ No | ✅ Yes | ❌ No |
| **Cost** | $0 | $0 (self-hosted) | $0 (Supabase free) |
| **Cardinality Limits** | ✅ No limits | ⚠️ Limited (labels) | ✅ No limits |
| **Grafana Support** | ⚠️ JSON API | ✅ Native | ✅ Native |

---

## 🚀 Implementation Strategy: Keep Both + Add TimescaleDB

### Phase 1 (Done): ✅
- In-memory trackers implemented
- Real-time API (`/api/rag-metrics`)
- Budget management
- Circuit breakers

### Phase 2A: Prometheus Enhancement (30 minutes)

**You already have `/api/metrics` endpoint!**

Just need to:

**1. Add Phase 1 Metrics to Prometheus Endpoint** (15 min)
```typescript
// Modify /api/metrics/route.ts to export Phase 1 metrics

import { ragLatencyTracker } from '@/lib/services/monitoring/rag-latency-tracker';
import { ragCostTracker } from '@/lib/services/monitoring/rag-cost-tracker';
import { circuitBreakerManager } from '@/lib/services/monitoring/circuit-breaker';

async function collectMetrics(supabase: any) {
  const existing = await collectExistingMetrics(supabase);

  // Add Phase 1 metrics
  const latency = ragLatencyTracker.getLatencyBreakdown(5); // Last 5 min
  const cost = ragCostTracker.getCostStats(5);
  const health = circuitBreakerManager.getAllStats();

  return {
    ...existing,

    // Latency metrics
    rag_query_latency_p95_ms: latency.total.p95,
    rag_query_latency_p99_ms: latency.total.p99,
    rag_cache_hit_rate: latency.cacheStats.hitRate,
    rag_total_queries: latency.total.count,

    // Cost metrics
    rag_cost_total_usd: cost.totalCostUsd,
    rag_cost_per_query_usd: cost.avgCostPerQuery,
    rag_query_count: cost.queryCount,

    // Circuit breaker metrics
    rag_circuit_breaker_open_count: Object.values(health).filter(s => s.state === 'OPEN').length,
    rag_unhealthy_services: circuitBreakerManager.getUnhealthyServices().length,
  };
}
```

**2. Deploy Prometheus Server** (15 min)

Option A: Docker Compose (Recommended)
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: vital-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=90d'
    restart: unless-stopped

volumes:
  prometheus-data:
```

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'vital-rag'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 15s
```

Start:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

Option B: Cloud (if you prefer managed)
- Grafana Cloud (free tier: 10K metrics, 14-day retention)
- AWS CloudWatch (with Prometheus exporter)

### Phase 2B: TimescaleDB Setup (1 hour)

**Already covered in previous analysis**

1. Enable TimescaleDB in Supabase (5 min)
2. Create hypertables (10 min)
3. Update trackers to write to DB (30 min)
4. Configure compression/retention (5 min)

### Phase 2C: Grafana Dashboards (1 hour)

**Dashboard 1: Real-time Operations** (Prometheus)
- Current query rate (queries/min)
- Average latency (last 5 min)
- Error rate
- Circuit breaker states
- Cache hit rate

**Dashboard 2: Historical Analysis** (TimescaleDB)
- Week-over-week P95 comparison
- Cost trends (daily, weekly, monthly)
- Per-user cost breakdown
- Per-agent performance
- Slow query analysis

**Dashboard 3: Combined View** (Both)
- Real-time + historical in one view
- Use variables to switch between time ranges
- Alerts from Prometheus
- Drill-down to TimescaleDB for details

---

## 💰 Cost Analysis: Hybrid Approach

| Component | Cost | Purpose |
|-----------|------|---------|
| In-Memory | $0 | Real-time API |
| Prometheus (self-hosted) | $0 | Infrastructure monitoring |
| TimescaleDB (Supabase free) | $0 | Long-term storage |
| Grafana (OSS) | $0 | Visualization |
| **Total Year 1** | **$0** | All free tiers |

**If you exceed free tiers**:
- Supabase Pro: $25/month (unlikely for years)
- Grafana Cloud: $0 (free tier sufficient)
- Prometheus: $0 (self-hosted)

---

## 🎯 Recommendation: Hybrid Strategy

### **DO NOT replace Prometheus**

**Keep**:
✅ Existing `/api/metrics` endpoint
✅ Prometheus for infrastructure monitoring
✅ Prometheus for alerting (Alertmanager)

**Add**:
✅ Phase 1 metrics to Prometheus endpoint (15 min)
✅ TimescaleDB for long-term per-query storage (1 hour)
✅ Grafana with dual data sources (1 hour)

**Benefits**:
1. ✅ Leverage existing Prometheus investment
2. ✅ Get best of both worlds
3. ✅ No migration needed
4. ✅ Each tool for what it does best
5. ✅ Total cost: $0 (all free tiers)

---

## 📊 Use Case Mapping

### When to use In-Memory API (`/api/rag-metrics`):
- ✅ Real-time debugging (what's happening right now?)
- ✅ Live dashboards (embed in admin panel)
- ✅ Instant alerts (check before making decisions)
- ✅ Development/testing

### When to use Prometheus:
- ✅ Infrastructure monitoring (CPU, memory, requests)
- ✅ Service-level aggregates (total queries/min)
- ✅ Alerting (PagerDuty, Slack notifications)
- ✅ Short-term trends (last 90 days)
- ✅ Multi-service monitoring (not just RAG)

### When to use TimescaleDB:
- ✅ Historical analysis (week-over-week, month-over-month)
- ✅ Per-query forensics (why was this query slow?)
- ✅ Cost attribution (how much did user X cost this month?)
- ✅ Compliance reports (FDA audit: show me all queries from Q1)
- ✅ Advanced analytics (SQL queries, custom aggregations)
- ✅ Anomaly detection (find cost spikes, performance regressions)

---

## 🚀 Implementation Roadmap

### ✅ Done (Phase 1):
- In-memory trackers
- Real-time API
- Budget management
- Circuit breakers

### 🔄 Next Steps (Phase 2):

**Week 1: Prometheus Enhancement** (30 minutes)
```bash
# 1. Update /api/metrics to export Phase 1 metrics
# 2. Deploy Prometheus server (Docker Compose)
# 3. Verify scraping works

curl http://localhost:9090  # Prometheus UI
```

**Week 1: TimescaleDB Setup** (1 hour)
```sql
-- 1. Enable extension in Supabase
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 2. Create hypertables
-- 3. Update trackers to write to DB
```

**Week 2: Grafana Dashboards** (2 hours)
```bash
# 1. Install Grafana (Docker or Cloud)
# 2. Add Prometheus data source
# 3. Add TimescaleDB data source
# 4. Import/create dashboards
```

**Week 3: Alerts & Runbooks** (2 hours)
```yaml
# Configure Prometheus Alertmanager
# Set up Slack/PagerDuty integration
# Create runbooks for common issues
```

---

## 🎯 Decision: Hybrid Strategy Approved ⭐

**Summary**:
- ✅ Keep Prometheus (already implemented, excellent for infrastructure)
- ✅ Keep In-Memory (Phase 1, excellent for real-time)
- ✅ Add TimescaleDB (Phase 2, excellent for long-term detailed storage)

**Each tool does what it does best:**
- **In-Memory**: Real-time (<1s latency)
- **Prometheus**: Infrastructure & alerting (15s scrape interval)
- **TimescaleDB**: Long-term detailed storage (years of data)

**Total Cost**: $0 (all free tiers sufficient)

**Total Implementation**: ~4-5 hours across 3 weeks

---

**Analysis Created**: October 27, 2025
**Recommendation**: Hybrid Strategy (Prometheus + TimescaleDB + In-Memory)
**Action**: Keep Prometheus, Add TimescaleDB for long-term storage
**Status**: APPROVED ⭐
