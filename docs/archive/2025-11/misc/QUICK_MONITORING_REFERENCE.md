# RAG Monitoring Quick Reference 🚀

## Access Metrics

### Real-Time (JSON)
```bash
# Full dashboard
curl "http://localhost:3000/api/rag-metrics?endpoint=dashboard&format=console"

# Latency only
curl "http://localhost:3000/api/rag-metrics?endpoint=latency"

# Cost only
curl "http://localhost:3000/api/rag-metrics?endpoint=cost"

# Health check
curl "http://localhost:3000/api/rag-metrics?endpoint=health"
```

### Prometheus Format
```bash
# All RAG metrics
curl "http://localhost:3000/api/metrics?format=prometheus" | grep "^rag_"

# Circuit breaker states
curl "http://localhost:3000/api/metrics?format=prometheus" | grep "circuit_breaker_state"
```

## Key Metrics

| Metric | SLO Target | Alert At |
|--------|------------|----------|
| `rag_latency_p95_milliseconds` | < 2000ms | > 2000ms |
| `rag_budget_daily_usage_percent` | < 100% | > 80% |
| `rag_circuit_breaker_state` | 0 (CLOSED) | 2 (OPEN) |
| `rag_cache_hit_rate` | > 0.3 | < 0.2 |

## Circuit Breaker States

- **0 = CLOSED** ✅ Healthy
- **1 = HALF_OPEN** ⚠️ Testing recovery  
- **2 = OPEN** ❌ Unhealthy (using fallback)

## Services Monitored

1. `openai` - Embeddings
2. `pinecone` - Vector search
3. `cohere` - Re-ranking
4. `supabase` - Database
5. `redis` - Caching
6. `google` - LangExtract

## Grafana Queries

```promql
# Latency trend
rag_latency_p95_milliseconds

# Cost per hour
rate(rag_cost_total_usd[1h])

# Cohere health
rag_circuit_breaker_state{service="cohere"}

# Budget usage
rag_budget_daily_usage_percent
```

## Configuration

Location: `apps/digital-health-startup/.env.local`
```bash
RAG_DAILY_BUDGET_USD=10
RAG_MONTHLY_BUDGET_USD=300
RAG_PER_QUERY_BUDGET_USD=0.10
RAG_BUDGET_ALERT_THRESHOLD=80
```

## Troubleshooting

### No metrics showing?
- Check if RAG queries have been made (metrics only show after first query)
- Verify dev server is running: `npm run dev`

### Circuit breaker stuck OPEN?
- Check service health manually
- Wait for timeout (default 60s)
- Review logs for errors

### High costs?
- Check expensive queries: `/api/rag-metrics?endpoint=cost`
- Review strategy (hybrid_rerank is most expensive)
- Consider increasing cache TTL

## Documentation

- Full implementation: [PROMETHEUS_PHASE1_RAG_METRICS_COMPLETE.md](./PROMETHEUS_PHASE1_RAG_METRICS_COMPLETE.md)
- Middleware fixes: [MIDDLEWARE_AND_CLOUD_RAG_MONITORING_COMPLETE.md](./MIDDLEWARE_AND_CLOUD_RAG_MONITORING_COMPLETE.md)
- Phase 1 overview: [PHASE1_RAG_MONITORING_IMPLEMENTATION_COMPLETE.md](./PHASE1_RAG_MONITORING_IMPLEMENTATION_COMPLETE.md)
