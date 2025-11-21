# Deployment Runbook

**Version**: 1.0  
**Last Updated**: November 21, 2024  
**Owner**: DevOps Team

## Purpose

Standard operating procedure for deploying the VITAL platform to production.

## Prerequisites

- [ ] All tests passing in staging
- [ ] Smoke tests completed
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Change approval obtained
- [ ] Team notification sent

## Pre-Deployment Checklist

```bash
# 1. Verify you're on the correct branch
git branch

# 2. Check for any uncommitted changes
git status

# 3. Pull latest changes
git pull origin main

# 4. Run tests locally
./scripts/testing/integration/run-all.sh

# 5. Create backup
./scripts/database/backups/create-backup.sh
```

## Deployment Steps

### Step 1: Prepare Environment

```bash
# Load production configuration
source config/environments/.env.production

# Verify configuration
./tools/validation/validate-config.sh production
```

### Step 2: Run Database Migrations

```bash
# Check migration status
./scripts/database/migrations/status.sh

# Run migrations
./bin/run-migrations

# Verify migrations
./scripts/database/migrations/verify.sh
```

### Step 3: Deploy Application

```bash
# Deploy to production
./bin/deploy-production

# Expected output:
# - Building application...
# - Running tests...
# - Deploying to production...
# - Deployment successful!
```

### Step 4: Post-Deployment Verification

```bash
# Check system health
./bin/health-check

# Verify services are running
./scripts/services/health-check.sh all

# Check logs for errors
./scripts/monitoring/view-logs.sh --since 5m
```

### Step 5: Smoke Tests

```bash
# Run production smoke tests
./scripts/testing/smoke-test-production.sh

# Verify critical endpoints
curl https://api.vital.example.com/health
curl https://api.vital.example.com/v1/agents
```

## Rollback Procedure

If deployment fails, follow rollback procedure:

```bash
# Emergency rollback
./scripts/deployment/rollback/emergency-rollback.sh

# See: docs/runbooks/rollback.md for details
```

## Post-Deployment

- [ ] Verify all services healthy
- [ ] Check error rates in monitoring
- [ ] Notify team of successful deployment
- [ ] Update deployment log
- [ ] Monitor for 30 minutes

## Troubleshooting

### Common Issues

**Issue**: Migration fails
- **Solution**: See `docs/troubleshooting/database.md`
- **Rollback**: Run `./scripts/database/migrations/rollback.sh`

**Issue**: Service won't start
- **Solution**: Check logs with `./scripts/monitoring/view-logs.sh <service>`
- **Rollback**: Run `./scripts/deployment/rollback/emergency-rollback.sh`

**Issue**: Health check fails
- **Solution**: Check service status and logs
- **Action**: May need to rollback

## Emergency Contacts

- **DevOps Lead**: [Contact Info]
- **Database Admin**: [Contact Info]
- **On-Call Engineer**: [Contact Info]

## Related Documentation

- `docs/runbooks/rollback.md` - Rollback procedures
- `docs/runbooks/incident-response.md` - Incident response
- `docs/guides/deploy-production.md` - Deployment guide
- `docs/troubleshooting/deployment.md` - Troubleshooting

