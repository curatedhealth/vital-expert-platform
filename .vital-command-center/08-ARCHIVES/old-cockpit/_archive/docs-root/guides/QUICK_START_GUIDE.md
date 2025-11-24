# 🚀 VITAL UNIFIED INTELLIGENCE - QUICK START GUIDE

## 📋 Summary

You have successfully implemented **Phase A: Analytics Foundation** of the VITAL Unified Intelligence Strategy.

This quick start guide will help you deploy and test the new analytics infrastructure.

---

## ✅ What Was Built

1. **TimescaleDB Analytics Schema** - 3 hypertables, 17 indexes, 5 views
2. **Rate Limiting Dashboard** - Real-time quota monitoring
3. **Abuse Detection Dashboard** - Anomaly detection & security
4. **Cost Analytics Dashboard** - Cost tracking & optimization
5. **Unified Analytics Service** - Event collection with buffering
6. **Integration Examples** - Patterns for RAG, agents, workflows

---

## 🚀 Deployment (5 Minutes)

### Step 1: Execute Database Migration

```bash
# Set your Supabase database URL
export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres'

# Navigate to migrations directory
cd database/sql/migrations/2025/

# Make script executable
chmod +x execute_analytics_migration.sh

# Run migration
./execute_analytics_migration.sh
```

**Expected Output:**
```
✅ Database connection successful
✅ TimescaleDB extension available
✅ Migration completed successfully!
📊 Analytics tables created: 3
📈 Materialized views created: 3
⚡ Continuous aggregates created: 2
```

### Step 2: Start Application

```bash
# Navigate to app directory
cd apps/digital-health-startup

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
> digital-health-startup@0.1.0 dev
> next dev

▲ Next.js 14.x.x
- Local:        http://localhost:3000
- ready in 2.5s
```

### Step 3: Access Dashboards

Open your browser and navigate to:

- **Admin Overview:** http://localhost:3000/admin?view=overview
- **Rate Limits:** http://localhost:3000/admin?view=rate-limits
- **Abuse Detection:** http://localhost:3000/admin?view=abuse-detection
- **Cost Analytics:** http://localhost:3000/admin?view=cost-analytics

---

## 🧪 Testing Checklist

### Database Migration ✓

- [ ] Migration script executed without errors
- [ ] All 3 hypertables created
- [ ] All 17 indexes created
- [ ] Materialized views created
- [ ] Continuous aggregates created
- [ ] Helper functions work

**Test Command:**
```bash
psql "$SUPABASE_DB_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'analytics';"
```

**Expected Output:**
```
         tablename          
----------------------------
 platform_events
 tenant_cost_events
 agent_executions
 tenant_daily_summary
 tenant_cost_summary
 agent_performance_summary
```

### Rate Limiting Dashboard ✓

- [ ] Dashboard loads without errors
- [ ] Stats cards display correctly
- [ ] Filters work (entity type, quota type, status)
- [ ] Search functionality works
- [ ] Table displays quota data
- [ ] Progress bars render
- [ ] Auto-refresh works (30s)

**Test URL:** http://localhost:3000/admin?view=rate-limits

### Abuse Detection Dashboard ✓

- [ ] Dashboard loads without errors
- [ ] Stats cards display correctly
- [ ] Anomaly detection runs
- [ ] Filters work (type, severity, time range)
- [ ] Details dialog opens
- [ ] Export to CSV works
- [ ] Auto-refresh works (30s)

**Test URL:** http://localhost:3000/admin?view=abuse-detection

### Cost Analytics Dashboard ✓

- [ ] Dashboard loads without errors
- [ ] Stats cards display correctly
- [ ] Cost breakdown table displays
- [ ] Cost alerts show
- [ ] Filters work (time range, group by)
- [ ] Export to CSV works

**Test URL:** http://localhost:3000/admin?view=cost-analytics

---

## 💡 Integration (Next Steps)

### Quick Integration Example

```typescript
// In any service file (e.g., RAG query service)
import { getAnalyticsService } from '@/lib/analytics/UnifiedAnalyticsService';

const analytics = getAnalyticsService();

// Track user query
await analytics.trackEvent({
  tenant_id: 'your-tenant-id',
  user_id: 'user-id',
  event_type: 'query_submitted',
  event_category: 'user_behavior',
  event_data: { query: 'What is RAG?' },
});

// Track LLM usage (auto-calculates cost)
await analytics.trackLLMUsage({
  tenant_id: 'your-tenant-id',
  model: 'gpt-4',
  prompt_tokens: 100,
  completion_tokens: 200,
  agent_id: 'agent-123',
});
```

### Integration Points

1. **RAG Query Services** (`/ask-expert`, `/ask-panel`)
2. **Agent Execution** (agent workflows)
3. **Document Processing** (upload, embedding)
4. **Workflow Execution** (start, complete, fail)
5. **API Routes** (requests, responses, errors)
6. **User Authentication** (login, logout)

**See:** `apps/digital-health-startup/src/lib/analytics/integration-examples.ts`

---

## 📊 Dashboard Features

### Rate Limiting Dashboard

**What You'll See:**
- Total quotas, active, violated, at-risk
- Color-coded progress bars (green/yellow/red)
- Time until reset countdown
- Top consumers list
- Hard limit enforcement indicators

**Use Cases:**
- Monitor quota utilization
- Identify users approaching limits
- Prevent service overages
- Enforce rate limits

### Abuse Detection Dashboard

**What You'll See:**
- Total anomalies, critical alerts
- Suspicious IPs flagged
- Blocked requests count
- Anomaly type breakdown (spike, pattern, abuse)
- Severity classification (critical/high/medium/low)

**Use Cases:**
- Detect IP-based attacks
- Identify user abuse patterns
- Export compliance reports
- Block malicious traffic

### Cost Analytics Dashboard

**What You'll See:**
- Total cost for selected period
- Daily burn rate with trend
- Monthly projection
- Cost alerts (budget exceeded, spikes)
- Breakdown by service/model/agent

**Use Cases:**
- Track LLM spending
- Identify cost optimization opportunities
- Monitor burn rate
- Set budget alerts

---

## 🔧 Troubleshooting

### Migration Fails

**Error:** `TimescaleDB extension not available`

**Solution:** The migration will create regular tables instead. For production, consider using a database with TimescaleDB support.

---

**Error:** `Could not connect to database`

**Solution:** Verify your `SUPABASE_DB_URL` is correct and the database is accessible.

```bash
# Test connection
psql "$SUPABASE_DB_URL" -c "SELECT version();"
```

---

### Dashboard Not Loading

**Error:** `Module not found` or blank page

**Solution:** Ensure you're running the latest code and all dependencies are installed.

```bash
cd apps/digital-health-startup
npm install
npm run dev
```

---

**Error:** `Cannot read properties of undefined`

**Solution:** Check browser console for errors. The dashboards use mock data initially if tables are empty.

---

### Analytics Service Not Tracking

**Error:** Events not appearing in database

**Solution:** 
1. Check if UnifiedAnalyticsService is initialized
2. Verify Supabase credentials are set
3. Check for errors in server logs
4. Events are buffered (wait 5 seconds for flush)

```typescript
// Force flush for testing
const analytics = getAnalyticsService();
await analytics.flush();
```

---

## 📚 Documentation

### Key Files

**Database:**
- `database/sql/migrations/2025/20251104000000_unified_analytics_schema.sql`
- `database/sql/migrations/2025/execute_analytics_migration.sh`

**Dashboards:**
- `apps/digital-health-startup/src/components/admin/RateLimitMonitoring.tsx`
- `apps/digital-health-startup/src/components/admin/AbuseDetectionDashboard.tsx`
- `apps/digital-health-startup/src/components/admin/CostAnalyticsDashboard.tsx`

**Service:**
- `apps/digital-health-startup/src/lib/analytics/UnifiedAnalyticsService.ts`
- `apps/digital-health-startup/src/lib/analytics/integration-examples.ts`

**Documentation:**
- `PHASE_A_ANALYTICS_FOUNDATION_COMPLETE.md` (Technical details)
- `IMPLEMENTATION_COMPLETE_SUMMARY.md` (Executive summary)
- `SYSTEM_ARCHITECTURE_DIAGRAM.md` (Architecture diagrams)
- `QUICK_START_GUIDE.md` (This file)

---

## 🎯 Next Steps

### Phase B: Service Integration (Week 2)

Integrate analytics tracking into your services:

1. **RAG Services** - Add event tracking to query handlers
2. **Agent Execution** - Track agent performance and quality
3. **Document Processing** - Track uploads and embeddings
4. **Workflows** - Track workflow execution
5. **API Routes** - Track requests and responses

**Refer to:** `integration-examples.ts` for complete patterns

### Phase C: Real-Time Monitoring (Week 3)

1. Deploy Prometheus + Grafana
2. Deploy LangFuse for LLM observability
3. Configure alert routing
4. Build executive dashboard

### Phase D: Business Intelligence (Week 4)

1. Tenant health scoring dashboard
2. Churn prediction models
3. Cost optimization engine
4. Revenue analytics

---

## 📞 Support

**For Issues:**
1. Check troubleshooting section above
2. Review documentation files
3. Check browser console for errors
4. Check server logs for backend errors

**For Questions:**
1. Review `PHASE_A_ANALYTICS_FOUNDATION_COMPLETE.md`
2. Check `integration-examples.ts` for patterns
3. Review migration logs for database issues

---

## 🎉 You're Ready!

**Phase A is complete!** You now have:

✅ Analytics infrastructure (TimescaleDB)  
✅ Real-time monitoring dashboards  
✅ Automatic cost tracking  
✅ Event collection service  
✅ Complete documentation  

**Start by:**
1. Running the migration
2. Accessing the dashboards
3. Integrating analytics into your services

**Welcome to proactive, intelligent operations!** 🚀
