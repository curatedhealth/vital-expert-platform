# VITAL Platform - Production Deployment Checklist

## Pre-Deployment Checklist

Use this checklist to ensure your VITAL platform is secure and production-ready.

---

## ✅ Phase 1: Environment Setup

### 1.1 Environment Variables

**Action**: Validate all required environment variables are set

```bash
# Run environment validation
npm run validate:env
```

**Expected Result**: All required variables should show ✅ PASSED

**Required Variables**:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key (must not be 'demo-key')

**Optional but Recommended**:
- `UPSTASH_REDIS_REST_URL` - Redis for rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Redis token
- `SENTRY_DSN` - Error monitoring
- `NEXT_PUBLIC_APP_URL` - Your application URL

**Critical Check**: ❌ Ensure `OPENAI_API_KEY` is NOT set to `demo-key`

### 1.2 Create .env.local File

If you don't have a [.env.local](.env.local) file, create it from the template:

```bash
cp .env.example .env.local
```

Then edit [.env.local](.env.local) with your production values.

---

## ✅ Phase 2: Database Setup

### 2.1 Run Database Migrations

**Action**: Apply performance indexes and schema updates

```bash
# Check migration status
npm run migrate:status

# Dry run (preview changes)
npm run migrate:dry-run

# Apply migrations
npm run migrate
```

**Expected Result**:
```
✅ All migrations applied successfully
📊 Summary:
   ✅ Successful: 1
   ❌ Failed:     0
```

### 2.2 Verify RLS Policies

**Action**: Ensure Row-Level Security is enabled on all tables

```sql
-- Connect to your database and run:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('agents', 'chats', 'knowledge_documents', 'prompts');
```

**Expected Result**: All tables should have `rowsecurity = true`

### 2.3 Verify Indexes

**Action**: Check that performance indexes were created

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

**Expected Result**: Should see 30+ indexes including:
- `idx_agents_status`
- `idx_agents_knowledge_domains`
- `idx_chats_user_agent_created`
- `idx_knowledge_docs_embedding_ivfflat`

---

## ✅ Phase 3: Security Hardening

### 3.1 Apply Secured API Routes

**Action**: Replace existing API routes with secured versions

```bash
# Backup existing routes
mkdir -p src/app/api/backup
cp src/app/api/chat/route.ts src/app/api/backup/chat-route.ts.bak
cp src/app/api/agents-crud/route.ts src/app/api/backup/agents-crud-route.ts.bak
cp src/app/api/panel/orchestrate/route.ts src/app/api/backup/panel-orchestrate-route.ts.bak

# Apply secured routes (rename .secured.ts to .ts)
mv src/app/api/chat/route.secured.ts src/app/api/chat/route.ts
mv src/app/api/agents-crud/route.secured.ts src/app/api/agents-crud/route.ts
mv src/app/api/panel/orchestrate/route.secured.ts src/app/api/panel/orchestrate/route.ts

# Optional: Apply enhanced health check
mv src/app/api/system/health-secure/route.ts src/app/api/system/health/route.ts
```

**⚠️ Warning**: This will replace your existing API routes. Ensure you have backups!

### 3.2 Verify Middleware is Active

**Action**: Ensure [middleware.ts](middleware.ts) has auth enforcement

```typescript
// middleware.ts should have these checks:
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  return NextResponse.json(
    { error: 'Service temporarily unavailable', code: 'AUTH_NOT_CONFIGURED' },
    { status: 503 }
  );
}
```

**Expected Result**: Auth bypass should be removed (fail-closed approach)

### 3.3 Test Rate Limiting

**Action**: Verify rate limiting is working

```bash
# Test with curl (should get rate limited after 60 requests)
for i in {1..65}; do
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "test"}' \
    -i | grep "X-RateLimit"
done
```

**Expected Result**:
- First 60 requests: `200 OK` with rate limit headers
- Request 61+: `429 Too Many Requests`

---

## ✅ Phase 4: Application Testing

### 4.1 Build Application

**Action**: Verify application builds successfully

```bash
npm run build
```

**Expected Result**:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
```

### 4.2 Type Check

**Action**: Ensure no TypeScript errors

```bash
npm run type-check
```

**Expected Result**: `Found 0 errors`

### 4.3 Lint Check

**Action**: Run ESLint

```bash
npm run lint
```

**Expected Result**: No critical errors

### 4.4 Run Tests

**Action**: Execute test suites

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Full test suite with coverage
npm run test:coverage
```

**Expected Result**: All tests should pass with >80% coverage

---

## ✅ Phase 5: Performance Validation

### 5.1 Check Health Endpoint

**Action**: Verify health check returns healthy status

```bash
curl http://localhost:3000/api/system/health | jq .
```

**Expected Result**:
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "ok", "responseTime": 45 },
    "connectionPool": { "status": "ok" },
    "redis": { "status": "ok" },
    "openai": { "status": "ok" },
    "supabase": { "status": "ok" }
  }
}
```

### 5.2 Monitor Connection Pool

**Action**: Check database connection pool stats

```bash
curl http://localhost:3000/api/system/health?detailed=true \
  -H "X-User-Id: your-user-id" | jq '.detailed.poolStats'
```

**Expected Result**:
```json
{
  "total": 10,
  "inUse": 2,
  "idle": 8,
  "waiting": 0
}
```

### 5.3 Load Test (Optional)

**Action**: Run load test to verify performance

```bash
# Install artillery if needed
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:3000/api/chat
```

**Expected Result**:
- 95th percentile response time: <500ms
- No connection pool exhaustion
- Rate limiting working correctly

---

## ✅ Phase 6: Monitoring Setup

### 6.1 Enable Error Monitoring

**Action**: Configure Sentry (optional but recommended)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

Add to [.env.local](.env.local):
```env
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn
```

### 6.2 Set Up Uptime Monitoring

**Recommended Services**:
- Better Uptime
- UptimeRobot
- Pingdom

**Monitor These Endpoints**:
- `GET /api/system/health` - Should return 200
- `GET /` - Should return 200

---

## ✅ Phase 7: Security Audit

### 7.1 Review Security Checklist

- [x] Hardcoded credentials removed
- [x] Auth bypass vulnerability fixed
- [x] RLS validation middleware applied
- [x] Rate limiting enabled
- [x] Error boundaries implemented
- [x] Request validation with Zod
- [x] Connection pooling enabled
- [x] Database indexes created

### 7.2 Verify No Sensitive Data in Logs

**Action**: Check application logs for sensitive data

```bash
# Check for API keys in logs
grep -r "sk-" .next/server/ 2>/dev/null || echo "✅ No API keys found"

# Check for tokens
grep -r "Bearer" .next/server/ 2>/dev/null || echo "✅ No tokens found"
```

### 7.3 CORS Configuration

**Action**: Ensure CORS is properly configured

```typescript
// next.config.js should have:
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
        { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
  ];
}
```

---

## ✅ Phase 8: Final Deployment

### 8.1 Set Production Environment

```bash
export NODE_ENV=production
```

### 8.2 Build for Production

```bash
npm run build
```

### 8.3 Start Production Server

```bash
npm start
```

Or deploy to your hosting provider:

**Vercel**:
```bash
vercel --prod
```

**Docker**:
```bash
docker build -t vital-platform .
docker run -p 3000:3000 vital-platform
```

### 8.4 Post-Deployment Verification

**Action**: Verify all endpoints are working

```bash
# Health check
curl https://your-domain.com/api/system/health

# Chat endpoint (requires auth)
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "test", "agent": null}'

# Agents list
curl https://your-domain.com/api/agents-crud
```

---

## 🚨 Rollback Plan

If issues occur after deployment:

### Quick Rollback

```bash
# Restore backup routes
cp src/app/api/backup/*.bak src/app/api/

# Revert to previous deployment
git revert HEAD
git push origin main
```

### Database Rollback

```bash
# If indexes cause issues, drop them:
psql $DATABASE_URL -c "DROP INDEX IF EXISTS idx_agents_status;"

# Or restore from backup
psql $DATABASE_URL < backup.sql
```

---

## 📊 Success Metrics

After deployment, monitor these metrics:

- **API Response Time**: <500ms (95th percentile)
- **Database Query Time**: <100ms (95th percentile)
- **Error Rate**: <1%
- **Uptime**: >99.9%
- **Connection Pool Utilization**: <80%
- **Rate Limit Hit Rate**: <5% of requests

---

## 📚 Additional Resources

- [SECURITY_HARDENING_GUIDE.md](SECURITY_HARDENING_GUIDE.md) - Detailed security implementation
- [MIGRATION_EXAMPLES.md](MIGRATION_EXAMPLES.md) - Code migration examples
- [README.md](README.md) - General documentation

---

## ✅ Deployment Sign-Off

Before going to production, ensure you can check all these boxes:

- [ ] Environment variables validated (`npm run validate:env`)
- [ ] Database migrations applied (`npm run migrate`)
- [ ] Secured API routes deployed
- [ ] Application builds successfully (`npm run build`)
- [ ] All tests passing (`npm run test`)
- [ ] Health endpoint returns healthy
- [ ] Rate limiting working
- [ ] Connection pool configured
- [ ] Error monitoring enabled
- [ ] Backups configured
- [ ] Rollback plan tested
- [ ] Team notified of deployment

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Deployment Notes**:

_____________________________________________

_____________________________________________

_____________________________________________

**Sign-off**: _____________ Date: _____________
