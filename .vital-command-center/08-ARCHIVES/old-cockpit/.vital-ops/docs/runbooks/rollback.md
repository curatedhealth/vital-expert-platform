# Rollback Procedures

**Emergency Rollback Guide**

⚠️ **For deployment details, see**: `../../vital-expert-docs/09-deployment/`

---

## Quick Rollback Commands

```bash
# Emergency rollback (fastest)
./scripts/deployment/rollback/emergency-rollback.sh

# Rollback specific environment
./scripts/deployment/rollback/rollback-dev.sh
./scripts/deployment/rollback/rollback-staging.sh
./scripts/deployment/rollback/rollback-production.sh
```

---

## When to Rollback

✅ **Roll back immediately if:**
- System is completely down
- Data corruption detected
- Critical security vulnerability
- Major feature completely broken

⚠️ **Consider rollback if:**
- Performance degradation > 50%
- Error rate > 5%
- User-facing bugs affecting > 10% users

❌ **Don't rollback for:**
- Minor UI issues
- Non-critical bugs
- Performance issues < 20%
- Issues with known fixes

---

## Pre-Rollback Checklist

```bash
# 1. Verify issue severity
./bin/health-check

# 2. Check if recent deployment
git log --oneline -5

# 3. Create backup (if time permits)
./scripts/database/backups/create-backup.sh

# 4. Notify team
# Post in #engineering: "Rolling back production due to [issue]"
```

---

## Rollback Steps

### 1. Application Rollback

```bash
# Rollback to previous version
./scripts/deployment/rollback/rollback-production.sh

# This will:
# - Revert to previous git commit
# - Rebuild application
# - Deploy previous version
# - Run smoke tests
```

### 2. Database Rollback (if needed)

```bash
# Check migration status
./scripts/database/migrations/status.sh

# Rollback last migration
./scripts/database/migrations/rollback.sh

# Rollback to specific version
./scripts/database/migrations/rollback.sh --to=<version>
```

### 3. Verification

```bash
# Run health checks
./bin/health-check

# Check error logs
./scripts/monitoring/view-logs.sh --since 5m

# Run smoke tests
./scripts/testing/smoke-test-production.sh
```

---

## Post-Rollback Actions

### Immediate (0-15 minutes)

1. **Verify system is stable**
   ```bash
   ./bin/health-check
   ```

2. **Monitor for 15 minutes**
   - Check error rates
   - Check response times
   - Check user reports

3. **Update team**
   - Post in #engineering
   - Update incident ticket

### Short-term (15-60 minutes)

1. **Investigate root cause**
   - Review logs
   - Reproduce issue in staging
   - Identify fix

2. **Create fix branch**
   ```bash
   git checkout -b hotfix/issue-description
   ```

3. **Plan re-deployment**
   - Fix issue
   - Test thoroughly
   - Schedule deployment

### Long-term (1-24 hours)

1. **Write incident report**
2. **Update documentation**
3. **Create preventive measures**
4. **Team post-mortem**

---

## Database Rollback Details

### Check What Will Be Rolled Back

```bash
# View migration history
./scripts/database/migrations/history.sh

# View specific migration
cat database/migrations/<migration-file>.sql
```

### Rollback with Data Preservation

```bash
# Create backup first
./scripts/database/backups/create-backup.sh

# Rollback migration
./scripts/database/migrations/rollback.sh

# If issues, restore backup
./scripts/database/backups/restore-backup.sh <backup-file>
```

---

## Partial Rollback

Sometimes only part of the system needs rollback:

### Rollback Frontend Only

```bash
cd apps/web
git revert <commit-hash>
pnpm build
# Deploy
```

### Rollback Backend Only

```bash
cd services/ai-engine
git revert <commit-hash>
./deploy.sh
```

### Rollback Database Only

```bash
./scripts/database/migrations/rollback.sh
```

---

## Failed Rollback Recovery

If rollback itself fails:

```bash
# 1. Check service status
docker ps

# 2. Manual service restart
./scripts/services/stop-all.sh
./scripts/services/start-all.sh

# 3. Check database state
psql $DATABASE_URL -c "SELECT version();"

# 4. If database is corrupted, restore from backup
./scripts/database/backups/restore-backup.sh <last-good-backup>

# 5. Escalate to senior engineer
# Contact: [Emergency contacts]
```

---

## Testing Rollback Procedures

**Practice rollbacks in staging regularly:**

```bash
# In staging environment
./scripts/deployment/rollback/rollback-staging.sh

# Verify everything works
./scripts/testing/integration/run-all.sh
```

**Schedule**: Run rollback drill monthly

---

## Related Documentation

- **Deployment Guide**: `../../vital-expert-docs/09-deployment/`
- **Deployment Runbook**: `deployment.md`
- **Incident Response**: `incident-response.md`
- **Database Migrations**: `../../vital-expert-docs/08-implementation/DATABASE_MIGRATIONS.md`

---

**Last Updated**: November 21, 2024  
**Owner**: DevOps Team

