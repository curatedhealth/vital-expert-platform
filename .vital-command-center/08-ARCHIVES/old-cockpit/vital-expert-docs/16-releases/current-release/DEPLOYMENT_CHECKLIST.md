# VITAL Platform - Deployment Checklist

**Last Updated**: November 21, 2024  
**Version**: 2.0  
**Environment**: Production

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (unit + integration)
- [ ] Test coverage >= 60%
- [ ] ESLint score >= 95/100
- [ ] TypeScript strict mode enabled
- [ ] No console.log statements in production code
- [ ] All TODOs resolved or documented

### Security
- [ ] RLS policies deployed and verified
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] Security audit completed
- [ ] Dependency vulnerabilities resolved
- [ ] Input validation implemented

### Database
- [ ] Migrations tested in staging
- [ ] Backup created before migration
- [ ] RLS policies verified
- [ ] Indexes optimized
- [ ] Data seeding complete
- [ ] Connection pooling configured

### Documentation
- [ ] API documentation updated
- [ ] Deployment guides current
- [ ] README files updated
- [ ] Changelog prepared
- [ ] Release notes drafted

---

## Deployment Steps

### 1. Backend Deployment (Railway)

```bash
# Navigate to AI engine
cd services/ai-engine

# Link to Railway project
railway link

# Deploy to production
railway up

# Verify deployment
curl https://vital-expert-platform-production.up.railway.app/health
```

### 2. Frontend Deployment (Vercel)

```bash
# Deploy frontend
vercel deploy --prod

# Verify deployment
curl https://vital-platform.com
```

### 3. Database Migration

```bash
# Deploy RLS security
./scripts/database/deploy-rls.sh production

# Verify RLS
./scripts/database/verify-rls.sh production
```

---

## Post-Deployment Verification

### Health Checks
- [ ] Backend health endpoint responding
- [ ] Frontend loading correctly
- [ ] Database connections stable
- [ ] Authentication working
- [ ] Agent selection functional
- [ ] Streaming responses working

### Monitoring
- [ ] LangFuse tracking enabled
- [ ] Error tracking active
- [ ] Performance metrics collected
- [ ] Logs accessible
- [ ] Alerts configured

### Smoke Tests
- [ ] User can log in
- [ ] Agent creator works
- [ ] Chat functionality operational
- [ ] Document upload working
- [ ] Multi-tenant switching works

---

## Rollback Plan

### If Issues Detected

1. **Immediate Actions**
   ```bash
   # Rollback frontend
   vercel rollback
   
   # Rollback backend
   railway rollback
   ```

2. **Database Rollback**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup_YYYYMMDD.sql
   ```

3. **Communication**
   - Notify team via Slack
   - Update status page
   - Document incident

---

## Success Criteria

- [ ] All health checks passing
- [ ] Zero critical errors in logs
- [ ] Response times within targets
- [ ] User authentication working
- [ ] Core features functional
- [ ] Monitoring active

---

## Sign-Off

- [ ] Tech Lead approval
- [ ] QA sign-off
- [ ] Product Owner confirmation
- [ ] DevOps verification

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Verified By**: _______________

