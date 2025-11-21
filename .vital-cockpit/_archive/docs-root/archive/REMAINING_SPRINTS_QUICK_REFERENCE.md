# VITAL RAG - Remaining Sprints Quick Reference

**Current Score:** 90/100 → **Target:** 97/100 (7 points remaining)
**Estimated Time:** 148 hours (3.5 weeks)

---

## Sprint 2: Monitoring Dashboard (+3 points, 40h)

### Files to Create
1. `src/lib/services/monitoring/langextract-metrics-collector.ts` (300 lines)
2. `src/lib/services/monitoring/cost-tracker.ts` (200 lines)
3. `src/app/api/metrics/route.ts` (150 lines)
4. `database/sql/migrations/2025/20250126000001_monitoring.sql` (100 lines)
5. `grafana/dashboards/vital-langextract.json` (500 lines)
6. `scripts/test-monitoring-system.ts` (200 lines)

### Quick Setup
```bash
# 1. Install dependencies
npm install prom-client grafana

# 2. Apply migration
psql < database/sql/migrations/2025/20250126000001_monitoring.sql

# 3. Start Prometheus + Grafana
docker-compose up prometheus grafana

# 4. Import dashboard
curl -X POST http://localhost:3000/api/dashboards/import \
  -d @grafana/dashboards/vital-langextract.json
```

### Key Metrics
- Extraction rate (per hour)
- Processing time (p50, p95, p99)
- Cache hit rate (target >75%)
- API cost per hour
- Error rate (alert if >5%)

### Database Schema
```sql
CREATE TABLE extraction_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_id UUID,
  total_entities INTEGER,
  processing_time_ms INTEGER,
  confidence_avg DECIMAL(5,4),
  api_cost_usd DECIMAL(10,6),
  cache_hit_rate DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cost_tracking (
  id UUID PRIMARY KEY,
  service TEXT, -- 'gemini_api', 'pinecone', 'redis'
  cost_usd DECIMAL(10,6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Sprint 3: Entity-Aware Reranking (+2 points, 48h)

### Files to Create
1. `src/lib/services/search/cross-encoder-reranker.ts` (400 lines)
2. `src/lib/services/search/entity-overlap-scorer.ts` (350 lines)
3. `src/lib/services/search/enhanced-search-service.ts` (300 lines)
4. `database/sql/migrations/2025/20250127000001_reranking.sql` (80 lines)
5. `scripts/test-reranking-system.ts` (250 lines)
6. `scripts/benchmark-search-quality.ts` (300 lines)

### Quick Setup
```bash
# 1. Install Cohere SDK
npm install cohere-ai

# 2. Apply migration
psql < database/sql/migrations/2025/20250127000001_reranking.sql

# 3. Add API key
export COHERE_API_KEY="your-key"

# 4. Test reranking
npm run test:reranking
```

### Integration Point
```typescript
// In src/lib/services/search/enhanced-search-service.ts

async search(query: string): Promise<SearchResult[]> {
  // 1. Initial retrieval (50 results)
  const initial = await this.hybridSearch(query, { top_k: 50 });

  // 2. Rerank with entity awareness
  const reranked = await this.reranker.rerank({
    query,
    results: initial,
    top_k: 10
  });

  return reranked;
}
```

### Expected Improvements
- NDCG@10: +15-25%
- User satisfaction: +20%
- Latency increase: <200ms

### Database Schema
```sql
CREATE TABLE rerank_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE,
  reranked_results JSONB,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour')
);

CREATE TABLE search_quality_metrics (
  id UUID PRIMARY KEY,
  query TEXT,
  variant TEXT, -- 'baseline' or 'reranked'
  ndcg_at_10 DECIMAL(5,4),
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Sprint 4: Automated Evaluation (+2 points, 60h)

### Files to Create
1. `src/lib/services/evaluation/continuous-evaluator.ts` (500 lines)
2. `src/lib/services/evaluation/regression-detector.ts` (300 lines)
3. `src/lib/services/evaluation/ab-testing-framework.ts` (450 lines)
4. `database/sql/migrations/2025/20250128000001_evaluation.sql` (150 lines)
5. `scripts/create-benchmark-dataset.ts` (400 lines)
6. `scripts/run-evaluation.ts` (250 lines)
7. `.github/workflows/evaluation.yml` (80 lines)

### Quick Setup
```bash
# 1. Apply migration
psql < database/sql/migrations/2025/20250128000001_evaluation.sql

# 2. Create benchmark dataset (200 examples)
npm run create-benchmark

# 3. Run baseline evaluation
npm run evaluate

# 4. Add to CI/CD
git add .github/workflows/evaluation.yml
git commit -m "Add continuous evaluation"
```

### CI/CD Integration
```yaml
# .github/workflows/evaluation.yml
name: Continuous Evaluation
on: [push, pull_request]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run evaluate
      - run: npm run check-regression
      - name: Block if regression
        if: failure()
        run: exit 1
```

### Database Schema
```sql
CREATE TABLE benchmark_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text TEXT,
  domain TEXT,
  expected_entities JSONB,
  quality_thresholds JSONB,
  version TEXT DEFAULT 'v1.0'
);

CREATE TABLE evaluation_runs (
  id UUID PRIMARY KEY,
  version TEXT,
  benchmark_version TEXT,
  results JSONB,
  regression_detected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ab_tests (
  id UUID PRIMARY KEY,
  name TEXT,
  variants JSONB,
  traffic_split DECIMAL(3,2) DEFAULT 0.5,
  started_at TIMESTAMPTZ,
  winner TEXT
);
```

---

## Quick Implementation Checklist

### Week 1: Monitoring
- [ ] Create metrics collector service
- [ ] Add Prometheus endpoint `/api/metrics`
- [ ] Set up Grafana dashboard (8 panels)
- [ ] Configure 5 automated alerts
- [ ] Add cost tracking
- [ ] Test end-to-end

### Week 2: Reranking
- [ ] Integrate Cohere Rerank API
- [ ] Create entity overlap scorer
- [ ] Add to search pipeline
- [ ] Create benchmark test (50 queries)
- [ ] A/B test (baseline vs reranked)
- [ ] Document improvements

### Weeks 3-4: Evaluation
- [ ] Create 200-example benchmark dataset
- [ ] Build evaluation pipeline
- [ ] Add regression detection
- [ ] Create A/B testing framework
- [ ] Integrate into CI/CD
- [ ] Run weekly evaluations

---

## Quick Commands

```bash
# Sprint 2: Monitoring
npm run monitoring:setup
npm run monitoring:test

# Sprint 3: Reranking
npm run reranking:setup
npm run reranking:benchmark

# Sprint 4: Evaluation
npm run evaluation:setup
npm run evaluation:create-benchmark
npm run evaluation:run

# Run all tests
npm run test:monitoring
npm run test:reranking
npm run test:evaluation
```

---

## Success Metrics

| Sprint | Metric | Target |
|--------|--------|--------|
| 2 (Monitoring) | Grafana dashboard operational | ✅ 8 panels |
| 2 (Monitoring) | Cost visibility | ✅ Real-time tracking |
| 3 (Reranking) | NDCG@10 improvement | ✅ +15-25% |
| 3 (Reranking) | Latency increase | ✅ <200ms |
| 4 (Evaluation) | Benchmark size | ✅ 200+ examples |
| 4 (Evaluation) | CI/CD integration | ✅ Automated |
| 4 (Evaluation) | F1 score maintained | ✅ >0.87 |

---

## Final Score Projection

| Component | Points |
|-----------|--------|
| **Current Score** | **90/100** |
| + Monitoring Dashboard | +3 |
| + Entity-Aware Reranking | +2 |
| + Automated Evaluation | +2 |
| **Final Score** | **97/100** |

---

## Dependencies & APIs

```bash
# Sprint 2
npm install prom-client

# Sprint 3
npm install cohere-ai
export COHERE_API_KEY="..."

# Sprint 4
# No new dependencies
```

---

**Last Updated:** January 25, 2025
**Status:** Ready to implement
**Estimated Completion:** End of Week 8, Q1 2025
