# RAG Monitoring - Quick Start Guide 🚀

**TL;DR**: Phase 1 monitoring is complete. Use `/api/rag-metrics` to access all metrics.

---

## 🎯 Quick Access

### View Dashboard (Browser)
```
http://localhost:3000/api/rag-metrics?endpoint=dashboard&window=60
```

### CLI Dashboard
```bash
curl "http://localhost:3000/api/rag-metrics?endpoint=dashboard&format=console"
```

### Real-Time Monitoring
```bash
watch -n 5 'curl -s "http://localhost:3000/api/rag-metrics?endpoint=realtime" | jq'
```

---

## 📊 Key Metrics at a Glance

### Latency
```bash
curl "http://localhost:3000/api/rag-metrics?endpoint=latency&window=60" | \
  jq '{p95: .overall.total.p95, p99: .overall.total.p99, cache_hit_rate: .overall.cacheStats.hitRate}'
```

**Target**: P95 < 2000ms, P99 < 5000ms

### Cost
```bash
curl "http://localhost:3000/api/rag-metrics?endpoint=cost&window=60" | \
  jq '{total: .stats.totalCostUsd, per_query: .stats.avgCostPerQuery, queries: .stats.queryCount}'
```

**Target**: < $0.05 per query

### Health
```bash
curl "http://localhost:3000/api/rag-metrics?endpoint=health" | \
  jq '{status: .overallStatus, unhealthy: .unhealthyServices}'
```

**Target**: Status = "healthy", no unhealthy services

---

## ⚙️ Configuration

### Set Budget Limits (.env)
```bash
RAG_DAILY_BUDGET_USD=10
RAG_MONTHLY_BUDGET_USD=300
RAG_PER_QUERY_BUDGET_USD=0.10
RAG_BUDGET_ALERT_THRESHOLD=80
```

---

## 🚨 Emergency Commands

### Reset Circuit Breaker (Service Down)
```bash
curl -X POST http://localhost:3000/api/rag-metrics \
  -H "Content-Type: application/json" \
  -d '{"serviceName": "openai"}'
```

### Reset All Circuit Breakers
```bash
curl -X POST http://localhost:3000/api/rag-metrics \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 📈 What Changed

### New Files (5 files, ~2,200 lines)
1. `rag-latency-tracker.ts` - P50/P95/P99 tracking
2. `rag-cost-tracker.ts` - Per-query cost tracking
3. `circuit-breaker.ts` - Fault tolerance
4. `rag-metrics-dashboard.ts` - Unified dashboard
5. `api/rag-metrics/route.ts` - REST API

### Modified Files (1 file, ~280 lines)
1. `unified-rag-service.ts` - Added monitoring hooks

---

## 🎓 Common Tasks

### Daily Health Check
```bash
curl "http://localhost:3000/api/rag-metrics?endpoint=dashboard&window=1440&format=console"
```

### Find Slow Queries
```bash
curl "http://localhost:3000/api/rag-metrics?endpoint=latency&window=60" | \
  jq '.slowQueries | .[0:5]'
```

### Find Expensive Queries
```bash
curl "http://localhost:3000/api/rag-metrics?endpoint=cost&window=60" | \
  jq '.expensiveQueries | .[0:5]'
```

### Check SLO Compliance
```bash
curl "http://localhost:3000/api/rag-metrics?endpoint=slo&window=60" | jq
```

### Export Metrics for Analysis
```bash
curl "http://localhost:3000/api/rag-metrics?endpoint=export&window=1440" > metrics.json
```

---

## 🔍 Troubleshooting

### P95 Latency High (> 2000ms)
1. Check cache hit rate: Should be > 50%
2. Review slow queries
3. Check if re-ranking is enabled (adds latency)
4. Consider using `text-embedding-3-small` for faster embedding

### Budget Alert Firing
1. Review most expensive queries
2. Check if re-ranking is overused
3. Consider increasing budget limits
4. Optimize chunk sizes

### Circuit Breaker Open
1. Check service status (OpenAI/Pinecone/etc)
2. Review circuit breaker stats
3. If service is healthy, manually reset
4. Check for API key issues

### Low Cache Hit Rate (< 30%)
1. Increase cache TTL in redis-cache-service
2. Lower semantic similarity threshold (currently 85%)
3. Check if queries are too diverse

---

## 💡 Tips

### Monitor in Production
Set up these alerts:
- P95 latency > 2000ms
- Daily budget > 80% consumed
- Circuit breaker state = OPEN
- Cache hit rate < 30%

### Optimize Costs
1. Use cache aggressively (70%+ hit rate saves ~$0.007 per query)
2. Use `text-embedding-3-small` for non-critical queries (-85% embedding cost)
3. Reduce re-ranking frequency if P95 cost is high
4. Monitor most expensive queries and optimize

### Improve Latency
1. Increase cache hit rate (each hit saves ~700ms)
2. Reduce chunk sizes for faster searches
3. Use `text-embedding-3-small` for faster embedding (-40% latency)
4. Consider adding more Pinecone pods for parallel search

---

## 📚 Full Documentation

See [PHASE1_RAG_MONITORING_IMPLEMENTATION_COMPLETE.md](./PHASE1_RAG_MONITORING_IMPLEMENTATION_COMPLETE.md) for:
- Detailed implementation guide
- API endpoint reference
- Code examples
- Best practices
- Troubleshooting guide

---

## ✅ Success Metrics

**Monitoring is working if**:
- ✅ Dashboard shows metrics after processing queries
- ✅ P95 latency < 2000ms
- ✅ Cost per query < $0.05
- ✅ Circuit breakers status = CLOSED
- ✅ Cache hit rate > 50%

---

**Quick Start Guide**
**Created**: October 27, 2025
**Status**: Production Ready ✅
