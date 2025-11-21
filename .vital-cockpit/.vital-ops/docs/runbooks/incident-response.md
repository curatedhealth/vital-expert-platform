# Incident Response Runbook

**EMERGENCY PROCEDURES - Quick Reference**

⚠️ **For detailed technical documentation, see**: `../../vital-expert-docs/13-operations/`

---

## 🚨 Severity Levels

| Level | Response Time | Description |
|-------|--------------|-------------|
| **P0** | Immediate | System down, data loss risk |
| **P1** | < 15 min | Major feature broken |
| **P2** | < 1 hour | Minor feature issue |
| **P3** | < 1 day | Non-critical issue |

---

## P0: System Down

### Immediate Actions (First 5 Minutes)

```bash
# 1. Check system status
./bin/health-check

# 2. Check all services
./scripts/services/health/health-check.sh all

# 3. Check recent deployments
git log --oneline -10

# 4. Rollback if recent deployment
./scripts/deployment/rollback/emergency-rollback.sh
```

### If Rollback Doesn't Work

```bash
# 1. Check logs
./scripts/monitoring/view-logs.sh --since 30m

# 2. Restart services
./scripts/services/restart.sh

# 3. Check database connectivity
psql $DATABASE_URL -c "SELECT 1"

# 4. Check external dependencies
curl https://api.openai.com/v1/models
curl $SUPABASE_URL/rest/v1/
```

---

## P1: Major Feature Broken

### Quick Diagnosis

```bash
# Check specific service
./scripts/services/health/health-check.sh <service-name>

# View service logs
./scripts/monitoring/view-logs.sh <service-name>

# Check error rates
# → See Grafana dashboard
```

### Common Fixes

**AI Engine Not Responding:**
```bash
cd services/ai-engine
./restart.sh
# Check logs
tail -f ai-engine.log
```

**Database Errors:**
```bash
# Check connections
./scripts/database/maintenance/check-connections.sh

# Check slow queries
./database/queries/diagnostics/slow-queries.sql
```

---

## Database Issues

### Quick Diagnostics

```bash
# Run diagnostic queries
psql $DATABASE_URL -f database/queries/diagnostics/check-health.sql

# Check table sizes
psql $DATABASE_URL -f database/queries/diagnostics/table-sizes.sql

# Check connections
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
```

### Migration Failed

```bash
# Check migration status
./scripts/database/migrations/status.sh

# Rollback last migration
./scripts/database/migrations/rollback.sh

# See: ../../vital-expert-docs/08-implementation/DATABASE_MIGRATIONS.md
```

---

## Service Issues

### Service Won't Start

```bash
# Check configuration
./tools/validation/validate-config.sh

# Check environment variables
env | grep -E "DATABASE|SUPABASE|OPENAI"

# Check port availability
lsof -i :<port>

# Check dependencies
./scripts/setup/check-dependencies.sh
```

### Service Performance Issues

```bash
# Check resource usage
top
df -h

# Check service metrics
./scripts/monitoring/export-metrics.sh

# Run performance tests
./scripts/testing/performance/quick-test.sh
```

---

## Network/Connectivity Issues

### External API Not Responding

```bash
# Check API status
curl -v https://api.openai.com/v1/models
curl -v $SUPABASE_URL/rest/v1/

# Check network
ping 8.8.8.8

# Check DNS
nslookup api.openai.com
```

---

## Communication Protocol

### During Incident

1. **Acknowledge** in #incidents channel
2. **Update** every 15 minutes
3. **Document** actions taken
4. **Resolve** and post-mortem

### Post-Incident

1. Write incident report
2. Update runbook with learnings
3. Create preventive tickets
4. Team retrospective

---

## Emergency Contacts

- **On-Call Engineer**: [Slack: @oncall]
- **DevOps Lead**: [Contact Info]
- **Database Admin**: [Contact Info]
- **Engineering Manager**: [Contact Info]

---

## Related Documentation

- **Deep Technical Docs**: `../../vital-expert-docs/13-operations/`
- **Rollback Procedures**: `rollback.md`
- **Monitoring Setup**: `../../vital-expert-docs/13-operations/monitoring/`
- **Troubleshooting**: `../troubleshooting/`

---

**Last Updated**: November 21, 2024  
**Owner**: DevOps Team

