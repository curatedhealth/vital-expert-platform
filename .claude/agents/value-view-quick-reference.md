# Value View Data Strategy - Quick Reference

**Last Updated**: December 1, 2025

---

## 1. Materialized Views at a Glance

| View Name | Purpose | Refresh | Rows | Query Use Case |
|-----------|---------|---------|------|----------------|
| **`mv_value_view_odi_heatmap`** | Persona × JTBD matrix | Daily 2am | ~30K | Main dashboard heatmap |
| **`mv_value_view_persona_dashboard`** | Per-persona metrics | Daily 3am | ~43 | Persona detail pages |
| **`mv_value_view_workflow_analytics`** | Workflow metrics | Daily 4am | ~400 | Workflow explorer |
| **`mv_value_view_strategic_alignment`** | Strategic pillars | Weekly Sun 1am | 7 | Strategic overview |
| **`mv_value_view_value_realization`** | ROI tracking | Daily 5am | ~5K | Value dashboards |
| **`mv_value_view_jtbd_summary`** | Master JTBD list | Hourly | ~700 | JTBD search/filter |

---

## 2. Common Query Patterns

### Get All Opportunities for AUTOMATOR Personas

```sql
SELECT
    persona_name,
    jtbd_code,
    jtbd_name,
    opportunity_score,
    opportunity_priority,
    ai_suitability_score,
    recommended_service_layer
FROM mv_value_view_odi_heatmap
WHERE archetype = 'AUTOMATOR'
  AND opportunity_score >= 10
ORDER BY opportunity_score DESC
LIMIT 50;
```

### Get Top JTBDs by Function

```sql
SELECT
    function_name,
    jtbd_code,
    jtbd_name,
    complexity,
    frequency,
    avg_opportunity_score,
    ai_suitability
FROM mv_value_view_jtbd_summary
WHERE function_name = 'Medical Affairs'
  AND ai_suitability >= 0.7
ORDER BY avg_opportunity_score DESC;
```

### Get Strategic Pillar Performance

```sql
SELECT
    pillar_code,
    pillar_name,
    total_jtbd_count,
    avg_opportunity_score,
    high_ai_readiness_count,
    workflow_count,
    total_time_savings_hours_per_week
FROM mv_value_view_strategic_alignment
ORDER BY avg_opportunity_score DESC;
```

### Get Persona-Specific Dashboard

```sql
SELECT *
FROM mv_value_view_persona_dashboard
WHERE persona_id = 'uuid-here';
```

---

## 3. Filter API Example (TypeScript)

```typescript
interface FilterState {
  tenant_id?: string;
  industry_id?: string;
  function_id?: string;
  department_id?: string;
  role_id?: string;
  persona_id?: string;
  archetype?: 'AUTOMATOR' | 'ORCHESTRATOR' | 'LEARNER' | 'SKEPTIC';
  complexity?: ('low' | 'medium' | 'high' | 'very_high')[];
  frequency?: ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually')[];
  min_opportunity_score?: number;
  strategic_pillars?: string[]; // SP01-SP07
  service_layers?: ('ask_me' | 'ask_expert' | 'ask_panel' | 'workflow')[];
}

// Example usage
const filters: FilterState = {
  tenant_id: 'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  function_id: 'medical-affairs-uuid',
  archetype: 'AUTOMATOR',
  complexity: ['high', 'very_high'],
  min_opportunity_score: 12,
  strategic_pillars: ['SP03'], // Regulatory Compliance
};
```

---

## 4. Redis Cache Keys

```typescript
const CACHE_KEYS = {
  // Filter options (5 min TTL)
  filterOptions: (tenantId: string) =>
    `value_view:${tenantId}:filters`,

  // ODI heatmap (24 hour TTL)
  odiHeatmap: (tenantId: string, filters: string) =>
    `value_view:${tenantId}:odi:${filters}`,

  // Persona dashboard (24 hour TTL)
  personaDashboard: (tenantId: string, personaId: string) =>
    `value_view:${tenantId}:persona:${personaId}`,

  // Workflow analytics (24 hour TTL)
  workflowAnalytics: (tenantId: string, filters: string) =>
    `value_view:${tenantId}:workflows:${filters}`,

  // User preferences (1 hour TTL)
  userPreferences: (userId: string) =>
    `value_view:user:${userId}:prefs`,
};
```

---

## 5. Performance Thresholds

| Query Type | Max Time | Action if Exceeded |
|------------|----------|--------------------|
| Filter options | 50ms | Check index usage |
| ODI heatmap | 200ms | Verify MV refresh |
| Persona dashboard | 100ms | Check cache hit ratio |
| Workflow analytics | 500ms | Add covering index |
| JTBD search | 100ms | Optimize LIKE queries |

---

## 6. Index Reference

### Most Important Indexes

```sql
-- ODI Heatmap (primary dashboard)
idx_mv_odi_heatmap_archetype
idx_mv_odi_heatmap_opp_score
idx_mv_odi_heatmap_function
idx_mv_odi_heatmap_department

-- JTBD Summary (search/filter)
idx_mv_jtbd_summary_code
idx_mv_jtbd_summary_complexity
idx_mv_jtbd_summary_ai_suitability
idx_mv_jtbd_summary_service_layer

-- Persona Dashboard
idx_mv_persona_dashboard_persona
idx_mv_persona_dashboard_archetype
```

---

## 7. Manual Refresh Commands

```sql
-- Refresh a single view
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_odi_heatmap;

-- Refresh all views (in dependency order)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_strategic_alignment;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_jtbd_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_workflow_analytics;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_persona_dashboard;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_odi_heatmap;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_value_realization;
```

---

## 8. Monitoring Queries

### Check View Sizes

```sql
SELECT
    matviewname,
    pg_size_pretty(pg_total_relation_size('public.'||matviewname)) AS size,
    last_refresh
FROM pg_matviews
WHERE matviewname LIKE 'mv_value_view_%'
ORDER BY matviewname;
```

### Check Row Counts

```sql
SELECT 'mv_value_view_odi_heatmap' AS view, COUNT(*) AS rows FROM mv_value_view_odi_heatmap
UNION ALL
SELECT 'mv_value_view_persona_dashboard', COUNT(*) FROM mv_value_view_persona_dashboard
UNION ALL
SELECT 'mv_value_view_jtbd_summary', COUNT(*) FROM mv_value_view_jtbd_summary;
```

### Check Slow Queries

```sql
SELECT
    query,
    calls,
    total_time / calls AS avg_time_ms,
    min_time AS min_ms,
    max_time AS max_ms
FROM pg_stat_statements
WHERE query LIKE '%mv_value_view_%'
ORDER BY total_time DESC
LIMIT 10;
```

---

## 9. Troubleshooting

### Issue: Dashboard Loading Slowly

**Checklist**:
1. Check if materialized views are refreshed: `SELECT last_refresh FROM pg_matviews WHERE matviewname = 'mv_value_view_odi_heatmap'`
2. Verify cache hit ratio: Check Redis metrics
3. Run EXPLAIN ANALYZE on slow queries
4. Check for missing indexes

### Issue: Stale Data

**Checklist**:
1. Verify pg_cron is running: `SELECT * FROM cron.job WHERE jobname LIKE 'refresh-%'`
2. Check for failed refreshes: `SELECT * FROM cron.job_run_details WHERE status = 'failed'`
3. Manually refresh: `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_value_view_odi_heatmap`

### Issue: Out of Memory During Refresh

**Solution**:
1. Increase `maintenance_work_mem`: `SET maintenance_work_mem = '2GB'`
2. Refresh during off-peak hours
3. Consider partitioning large views by tenant

---

## 10. Deployment Checklist

### Pre-Deployment
- [ ] Test all views in staging
- [ ] Verify index coverage
- [ ] Load test with 10K+ rows
- [ ] Benchmark query performance
- [ ] Test Redis caching

### Deployment
- [ ] Create views: `psql -f value_view_all_materialized_views.sql`
- [ ] Configure pg_cron schedules
- [ ] Enable Redis cluster
- [ ] Deploy API endpoints
- [ ] Configure monitoring

### Post-Deployment
- [ ] Monitor refresh times
- [ ] Track cache hit ratios
- [ ] Analyze slow queries
- [ ] User acceptance testing

---

## 11. Quick Links

**Main Strategy Document**:
`/Users/hichamnaim/Downloads/Cursor/VITAL path/.claude/agents/value-view-data-strategy.md`

**SQL Views**:
`/Users/hichamnaim/Downloads/Cursor/VITAL path/database/views/value_view_all_materialized_views.sql`

**Executive Summary**:
`/Users/hichamnaim/Downloads/Cursor/VITAL path/.claude/agents/value-view-data-strategy-summary.md`

---

**Last Updated**: December 1, 2025
**Maintained By**: VITAL Data Strategist Agent
