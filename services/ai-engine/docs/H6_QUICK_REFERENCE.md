# H6 Quick Reference: Checkpointer Fallback Logging

## TL;DR

The checkpointer now logs all fallbacks with impact assessment. Look for these events in your logs:

- `checkpointer_using_memory` - No DB configured (expected in dev)
- `checkpointer_fallback_to_memory` - Connection failed (investigate)
- `checkpointer_postgres_failed_critical` - Production failure (URGENT)
- `checkpointer_postgres_connected` - Success (normal)

## Log Events Reference

### ✅ Success Event

**Event:** `checkpointer_postgres_connected`

**What it means:** PostgresSaver connected successfully

**Example:**
```json
{
  "event": "checkpointer_postgres_connected",
  "mission_id": "mission-123",
  "persistence": "enabled",
  "latency_ms": 45
}
```

**Action:** None - everything is working

---

### ℹ️ Info Event (No Database)

**Event:** `checkpointer_using_memory`

**What it means:** No DATABASE_URL configured, using MemorySaver

**Example:**
```json
{
  "event": "checkpointer_using_memory",
  "mission_id": "mission-123",
  "reason": "no_connection_string",
  "impact": "mission_state_not_persisted"
}
```

**Action:**
- **Dev:** Normal - set DATABASE_URL if you need persistence
- **Prod:** Configure DATABASE_URL immediately

---

### ⚠️ Warning Event (Fallback)

**Event:** `checkpointer_fallback_to_memory`

**What it means:** PostgresSaver connection failed, falling back to MemorySaver

**Example:**
```json
{
  "event": "checkpointer_fallback_to_memory",
  "mission_id": "mission-123",
  "error": "Connection refused",
  "error_type": "ConnectionRefusedError",
  "impact": "mission_state_not_persisted"
}
```

**Action:**
1. Check if PostgreSQL is running
2. Verify DATABASE_URL is correct
3. Test connection manually
4. Check network connectivity

---

### 🚨 Critical Event (Production Failure)

**Event:** `checkpointer_postgres_failed_critical`

**What it means:** Production checkpointer failed - missions will lose state!

**Example:**
```json
{
  "event": "checkpointer_postgres_failed_critical",
  "mission_id": "mission-123",
  "error": "Connection refused",
  "severity": "HIGH",
  "impact": "Production missions will lose state on restart"
}
```

**Action:**
1. **URGENT:** Page on-call engineer
2. Fix database connection immediately
3. Consider pausing mission creation until resolved
4. Check if any active missions lost state

---

## Quick Diagnostics

### Check Checkpointer Status
```python
from langgraph_compilation.checkpointer import get_checkpointer_status

status = get_checkpointer_status()
print(status)
# {'initialized': True, 'mode': 'postgres', 'postgres_available': True, 'type': 'PostgresSaver'}
```

### Check Checkpointer Health
```python
from langgraph_compilation.checkpointer import check_checkpointer_health

health = await check_checkpointer_health()
print(health)
# {'type': 'postgres', 'healthy': True, 'latency_ms': 45, 'error': None, 'mode': 'postgres'}
```

### Test Database Connection
```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1"

# Check if tables exist
psql $DATABASE_URL -c "\dt checkpoint*"
```

---

## Troubleshooting Guide

### Issue: "checkpointer_using_memory" in production

**Cause:** No DATABASE_URL configured

**Fix:**
```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Or SUPABASE_DB_URL
export SUPABASE_DB_URL="postgresql://user:pass@host:5432/dbname"

# Restart service
```

---

### Issue: "checkpointer_fallback_to_memory" with ConnectionError

**Cause:** PostgreSQL not reachable

**Fix:**
1. Check if PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Check network connectivity: `telnet localhost 5432`
3. Verify credentials: `psql $DATABASE_URL -c "SELECT 1"`
4. Check firewall rules
5. Verify DATABASE_URL format: `postgresql://user:pass@host:5432/dbname`

---

### Issue: "checkpointer_fallback_to_memory" with OperationalError

**Cause:** Database exists but tables not created

**Fix:**
```python
from langgraph_compilation.checkpointer import initialize_checkpointer_tables

await initialize_checkpointer_tables()
```

---

### Issue: High latency_ms in logs

**Cause:** Slow database connection

**Fix:**
1. Check database server load
2. Verify network latency: `ping <db-host>`
3. Consider connection pooling
4. Move database closer to app server

---

## Alert Rules (Recommended)

### Critical Alert
```yaml
alert: CheckpointerFailedInProduction
expr: count(rate(log{event="checkpointer_postgres_failed_critical"}[5m])) > 0
severity: critical
message: "PostgresSaver failed in production - missions losing state!"
```

### Warning Alert
```yaml
alert: CheckpointerFallbackRate
expr: rate(log{event="checkpointer_fallback_to_memory"}[15m]) > 0.1
severity: warning
message: "High checkpointer fallback rate - investigate database connectivity"
```

### Info Alert
```yaml
alert: CheckpointerMemoryInProduction
expr: count(log{event="checkpointer_using_memory", environment="production"}[5m]) > 0
severity: info
message: "Production using MemorySaver - configure DATABASE_URL"
```

---

## Grafana Queries (Example)

### Persistence Success Rate
```promql
100 * (
  rate(log{event="checkpointer_postgres_connected"}[5m])
  /
  rate(log{event=~"checkpointer_.*"}[5m])
)
```

### Fallback Count by Reason
```promql
sum by (reason) (
  rate(log{event="checkpointer_fallback_to_memory"}[5m])
)
```

### Connection Latency P95
```promql
histogram_quantile(0.95,
  rate(log{event="checkpointer_postgres_connected"}[5m])
)
```

---

## Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | Recommended | None | PostgreSQL connection string |
| `SUPABASE_DB_URL` | Alternative | None | Alternative to DATABASE_URL |
| `ENVIRONMENT` | No | `development` | Controls log severity |

**Format:** `postgresql://user:password@host:port/database`

**Example:**
```bash
export DATABASE_URL="postgresql://vital:secret123@localhost:5432/vital_dev"
export ENVIRONMENT="production"
```

---

## Health Check Endpoint (Proposed)

```bash
# Check checkpointer health
curl http://localhost:8000/health/checkpointer

# Response
{
  "type": "postgres",
  "healthy": true,
  "latency_ms": 45,
  "error": null,
  "mode": "postgres"
}
```

---

## Common Log Patterns

### Pattern 1: Normal Operation
```
[INFO] checkpointer_postgres_connecting (mission_id=mission-1)
[INFO] checkpointer_postgres_connected (latency_ms=45, persistence=enabled)
```

### Pattern 2: Development (No DB)
```
[INFO] checkpointer_using_memory (reason=no_connection_string)
```

### Pattern 3: Connection Issue (Dev)
```
[INFO] checkpointer_postgres_connecting
[WARNING] checkpointer_fallback_to_memory (error=Connection refused)
```

### Pattern 4: Production Emergency
```
[INFO] checkpointer_postgres_connecting
[WARNING] checkpointer_fallback_to_memory (error=Connection refused)
[ERROR] checkpointer_postgres_failed_critical (severity=HIGH, action=URGENT)
```

---

## Support Contact

**For urgent production issues:**
1. Page on-call engineer via PagerDuty
2. Check #vital-alerts Slack channel
3. Review runbook: `/docs/runbooks/checkpointer-failure.md`

**For questions:**
- Slack: #vital-engineering
- Email: engineering@vital.com
- Documentation: `/docs/H6_CHECKPOINTER_FALLBACK_LOGGING.md`
