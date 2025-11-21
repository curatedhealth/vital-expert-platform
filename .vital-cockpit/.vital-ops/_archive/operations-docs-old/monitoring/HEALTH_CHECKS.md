# Health Checks Guide

**Last Updated**: November 21, 2024  
**Version**: 2.0  
**Status**: Production Ready

---

## Health Endpoints

### Backend Health Check
```bash
# AI Engine Health
curl https://vital-expert-platform-production.up.railway.app/health

# Expected Response:
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2024-11-21T10:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "langfuse": "connected"
  }
}
```

### Frontend Health Check
```bash
# Frontend Health
curl https://vital-platform.com/api/health

# Expected Response:
{
  "status": "healthy",
  "version": "2.0.0"
}
```

---

## Monitoring Setup

### Automated Health Checks
- **Frequency**: Every 1 minute
- **Timeout**: 5 seconds
- **Alert Threshold**: 3 consecutive failures
- **Recovery**: Auto-restart on failure

### Manual Health Checks
```bash
# Run all health checks
./scripts/health-check.sh

# Check specific service
./scripts/health-check.sh backend
./scripts/health-check.sh frontend
./scripts/health-check.sh database
```

---

## Troubleshooting

### Backend Unhealthy
1. Check Railway logs
2. Verify database connection
3. Check Redis connection
4. Restart service if needed

### Database Connection Issues
1. Verify Supabase status
2. Check connection pool
3. Verify RLS policies
4. Check network connectivity

---

## Related Documentation
- [LangFuse Setup](./LANGFUSE_SETUP.md)
- [Alerting Guide](./ALERTING.md)
- [Deployment Guide](../../09-deployment/README.md)

