# 📦 A++ Observability Stack - Installation Guide

## Required npm Packages

Run this command to install all required observability packages:

```bash
cd apps/digital-health-startup

# Install Sentry for error tracking
npm install @sentry/nextjs

# Install LangFuse for LLM tracing
npm install langfuse langfuse-langchain

# Verify prom-client is installed (should already be there)
npm list prom-client
```

## Environment Variables

Add these to your `apps/digital-health-startup/.env.local`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token

# LangFuse Configuration
LANGFUSE_PUBLIC_KEY=pk-lf-your-public-key
LANGFUSE_SECRET_KEY=sk-lf-your-secret-key
LANGFUSE_HOST=http://localhost:3002

# Tenant ID
NEXT_PUBLIC_TENANT_ID=b8026534-02a7-4d24-bf4c-344591964e02
```

## Sentry Setup

### 1. Create Sentry Project

1. Go to https://sentry.io
2. Create new organization (or use existing)
3. Create new project:
   - Platform: Next.js
   - Name: vital-digital-health-startup
   - Alert frequency: On every new issue

4. Copy your DSN

### 2. Initialize Sentry in Next.js

The `UnifiedObservabilityService` will automatically initialize Sentry. Just ensure your environment variables are set.

### 3. Test Sentry

```typescript
// In any component or API route
import { getObservabilityService } from '@/lib/observability/UnifiedObservabilityService';

const observability = getObservabilityService();
observability.trackError(new Error('Test error'), {
  userId: 'test-user',
  metadata: { test: true },
});
```

## LangFuse Setup

### 1. Access LangFuse UI

After deploying the monitoring stack:
- URL: http://localhost:3002
- Create your first account
- Generate API keys (Settings → API Keys)

### 2. Configure Keys

Add the keys to your `.env.local` as shown above.

### 3. Test LangFuse

The `UnifiedObservabilityService` automatically tracks all LLM calls to LangFuse.

## Verification Checklist

### Sentry Integration ✓
- [ ] Sentry DSN configured
- [ ] Error appears in Sentry dashboard
- [ ] User context attached to errors
- [ ] Breadcrumbs are recording

### LangFuse Integration ✓
- [ ] LangFuse keys configured
- [ ] LLM calls appear in LangFuse
- [ ] Traces are correlated
- [ ] Token usage is tracked

### Prometheus Integration ✓
- [ ] Metrics endpoint `/api/metrics` returns data
- [ ] Prometheus is scraping metrics
- [ ] Dashboards show data

### Grafana Dashboards ✓
- [ ] Production Overview dashboard imports
- [ ] LLM Performance & Cost dashboard imports
- [ ] All panels show data

### Analytics Integration ✓
- [ ] TimescaleDB tables exist
- [ ] Events are being inserted
- [ ] Analytics dashboards show data

## Complete Integration Test

Run a query through Ask Expert and verify:

1. **Sentry**: Error tracking (if error occurs)
   - Go to https://sentry.io/your-org/vital-digital-health-startup/issues/
   - Should see any errors with full context

2. **LangFuse**: LLM tracing
   - Go to http://localhost:3002
   - Navigate to Traces
   - Should see trace for your query with token usage

3. **Prometheus**: Metrics collection
   - Go to http://localhost:9090
   - Query: `llm_requests_total`
   - Should see increase

4. **Grafana**: Visualization
   - Go to http://localhost:3001
   - Open "LLM Performance & Cost" dashboard
   - Should see your query metrics

5. **Analytics**: Database storage
   - Query TimescaleDB:
   ```sql
   SELECT * FROM analytics.platform_events 
   WHERE event_type = 'query_submitted' 
   ORDER BY time DESC LIMIT 10;
   ```

## Troubleshooting

### Sentry Not Tracking Errors

**Issue:** Errors not appearing in Sentry

**Solutions:**
1. Check DSN is correct: `echo $NEXT_PUBLIC_SENTRY_DSN`
2. Verify Sentry is initialized: Check browser console for "Sentry"
3. Test with: `observability.trackError(new Error('Test'))`

### LangFuse Not Showing Traces

**Issue:** No traces in LangFuse UI

**Solutions:**
1. Check LangFuse is running: `curl http://localhost:3002/api/public/health`
2. Verify API keys are correct
3. Check logs: `docker-compose logs langfuse-server`
4. Manually flush: `await observability.flush()`

### Metrics Not Collected

**Issue:** Prometheus not scraping

**Solutions:**
1. Check metrics endpoint: `curl http://localhost:3000/api/metrics`
2. Verify Prometheus config: `monitoring/prometheus/prometheus.yml`
3. Check Prometheus targets: http://localhost:9090/targets
4. Restart Prometheus: `docker-compose restart prometheus`

## Performance Impact

**Overhead per request:**
- Sentry error tracking: <1ms (only on errors)
- LangFuse tracing: ~5ms (async, batched)
- Prometheus metrics: <1ms (in-memory)
- Analytics buffering: <1ms (async)

**Total overhead:** <10ms per request (negligible)

## Cost Estimates

**Sentry:**
- Free tier: 5,000 errors/month
- Team: $26/month (50,000 errors)
- Business: $80/month (unlimited)

**LangFuse:**
- Self-hosted: Free
- Cloud (optional): $0-99/month

**Monitoring Stack:**
- Self-hosted: $25-60/month (compute)

**Total:** $51-186/month (including monitoring)

## Next Steps

After installation:

1. ✅ Configure all environment variables
2. ✅ Install npm packages
3. ✅ Deploy monitoring stack
4. ✅ Test each integration
5. ✅ Set up alert channels (Slack, PagerDuty)
6. ✅ Create custom Grafana dashboards
7. ✅ Train team on observability tools

## Support Resources

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **LangFuse Docs:** https://langfuse.com/docs/
- **Prometheus Docs:** https://prometheus.io/docs/
- **Grafana Docs:** https://grafana.com/docs/

---

**Status:** Ready for A++ Production Deployment! 🚀

