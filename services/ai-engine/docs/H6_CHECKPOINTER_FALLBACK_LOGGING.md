# H6: PostgresSaver Fallback Logging Implementation

**Priority:** HIGH
**Status:** ✅ COMPLETE
**Date:** 2025-12-13

## Problem Statement

The unified autonomous workflow silently fell back to MemorySaver when PostgresSaver failed, causing:
- **Silent state loss** - missions lost progress on restart without warning
- **No visibility** - operators couldn't tell if persistence was working
- **No diagnostics** - impossible to troubleshoot connection issues
- **Production risk** - critical missions could lose state without awareness

## Solution Overview

Implemented comprehensive fallback logging with impact assessment using the `WorkflowCheckpointerFactory` pattern.

## Implementation

### 1. WorkflowCheckpointerFactory Class

**Location:** `/services/ai-engine/src/langgraph_workflows/modes34/unified_autonomous_workflow.py`

**Features:**
- ✅ Explicit logging for all 4 fallback scenarios
- ✅ Mission-specific context (mission_id parameter)
- ✅ Impact assessment ("mission_state_not_persisted")
- ✅ Recovery guidance ("restart_will_lose_progress")
- ✅ Environment-aware logging (production gets ERROR, dev gets INFO/WARNING)

**Fallback Scenarios:**

| Scenario | Log Level | Fields Logged |
|----------|-----------|---------------|
| No connection string | `INFO` | reason, impact, recovery, recommendation |
| PostgresSaver not installed | `WARNING` | reason, impact, recovery, recommendation |
| Connection failure (dev) | `WARNING` | error, error_type, impact, recovery, action |
| Connection failure (prod) | `ERROR` | error, error_type, severity=HIGH, impact, action=URGENT |

### 2. Centralized Factory

**Location:** `/services/ai-engine/src/langgraph_compilation/checkpointer.py`

**Features:**
- ✅ Reusable across all workflows
- ✅ Optional `connection_string` parameter for explicit DB URL
- ✅ Consistent logging format
- ✅ Used by `get_postgres_checkpointer()` for unified behavior

**Usage:**
```python
from langgraph_compilation.checkpointer import WorkflowCheckpointerFactory

checkpointer = WorkflowCheckpointerFactory.create(
    mission_id="my-mission-123",
    connection_string="postgresql://..."  # optional
)
```

### 3. Enhanced Health Check

**Location:** `/services/ai-engine/src/langgraph_compilation/checkpointer.py`

**New function:** `check_checkpointer_health()`

**Returns:**
```python
{
    "type": "postgres" | "memory",
    "healthy": bool,
    "latency_ms": int,
    "error": str | None,
    "mode": str
}
```

## Logging Examples

### Scenario 1: No Database Configured
```json
{
  "event": "checkpointer_using_memory",
  "mission_id": "workflow_graph",
  "reason": "no_connection_string",
  "environment": "development",
  "impact": "mission_state_not_persisted",
  "recovery": "restart_will_lose_progress",
  "recommendation": "Set DATABASE_URL or SUPABASE_DB_URL for persistence"
}
```

### Scenario 2: Connection Failure (Development)
```json
{
  "event": "checkpointer_fallback_to_memory",
  "mission_id": "workflow_graph",
  "error": "Connection refused",
  "error_type": "ConnectionError",
  "environment": "development",
  "impact": "mission_state_not_persisted",
  "recovery": "restart_will_lose_progress",
  "action": "Check database connectivity and credentials",
  "db_url_prefix": "postgresql://localhost/test..."
}
```

### Scenario 3: Connection Failure (Production)
```json
{
  "event": "checkpointer_postgres_failed_critical",
  "mission_id": "workflow_graph",
  "error": "Connection refused",
  "error_type": "ConnectionError",
  "severity": "HIGH",
  "impact": "Production missions will lose state on restart",
  "action": "URGENT: Fix database connection or disable production mode"
}
```

### Scenario 4: Successful Connection
```json
{
  "event": "checkpointer_postgres_connecting",
  "mission_id": "workflow_graph",
  "db_url_prefix": "postgresql://localhost/vital...",
  "environment": "production"
}
{
  "event": "checkpointer_postgres_connected",
  "mission_id": "workflow_graph",
  "environment": "production",
  "persistence": "enabled"
}
```

## Testing

### Unit Tests

**Location:** `/services/ai-engine/tests/unit/test_checkpointer_h6.py`

**Coverage:**
- ✅ Factory creation with no database
- ✅ Factory creation with mission_id
- ✅ Centralized factory usage
- ✅ Multiple checkpointer creation
- ✅ Environment-specific behavior
- ✅ Status tracking

**Run tests:**
```bash
cd services/ai-engine
pytest tests/unit/test_checkpointer_h6.py -v
```

### Integration Tests

**Location:** `/services/ai-engine/tests/unit/test_checkpointer_factory.py`

**Coverage:**
- ✅ Logging verification for all scenarios
- ✅ PostgresSaver availability detection
- ✅ Connection failure handling
- ✅ Production vs development logging
- ✅ Error message truncation
- ✅ Mission ID propagation

## Metrics Integration (Future)

The enhanced logging enables metrics tracking:

```python
# Prometheus metrics example
checkpointer_fallback_total = Counter(
    'checkpointer_fallback_total',
    'Total checkpointer fallbacks',
    ['reason', 'environment']
)

checkpointer_persistence_success_rate = Gauge(
    'checkpointer_persistence_success_rate',
    'Percentage of missions with persistence enabled'
)
```

## Operational Guidance

### For Developers

1. **Always pass mission_id** when creating checkpointers for better debugging
2. **Monitor logs** for `checkpointer_fallback_to_memory` events
3. **Set DATABASE_URL** in development for testing persistence
4. **Use `check_checkpointer_health()`** in health check endpoints

### For Operations

1. **Alert on** `checkpointer_postgres_failed_critical` events
2. **Track** persistence success rate via logs
3. **Verify** PostgresSaver is enabled in production
4. **Investigate** any fallback events in production immediately

### For Product

1. **Surface** persistence status in mission UI
2. **Warn users** if mission state won't be persisted
3. **Provide** resume capability only when persistence is enabled
4. **Track** mission completion rate by persistence mode

## Success Criteria

✅ All checkpointer fallbacks logged with impact assessment
✅ Production failures trigger CRITICAL logs
✅ Metrics can track persistence success rate
✅ Clear visibility into which missions lost persistence
✅ Recovery guidance in all fallback scenarios
✅ Mission-specific context in all logs

## Related Issues

- **C1-C5:** Resilience infrastructure (error handling, graceful degradation)
- **H7:** Metrics integration for tracking fallback rates
- **H8:** Health check endpoints using `check_checkpointer_health()`

## Files Modified

1. `/services/ai-engine/src/langgraph_workflows/modes34/unified_autonomous_workflow.py`
   - Added `WorkflowCheckpointerFactory` class
   - Enhanced `_get_checkpointer()` to use factory

2. `/services/ai-engine/src/langgraph_compilation/checkpointer.py`
   - Added centralized `WorkflowCheckpointerFactory`
   - Refactored `get_postgres_checkpointer()` to use factory
   - Added `check_checkpointer_health()` function

3. `/services/ai-engine/tests/unit/test_checkpointer_h6.py` (NEW)
   - Integration tests for factory behavior

4. `/services/ai-engine/tests/unit/test_checkpointer_factory.py` (NEW)
   - Unit tests with mocking for logging verification

## Code Quality

- **Type hints:** Full typing throughout
- **Documentation:** Comprehensive docstrings
- **Logging:** Structured logging with `structlog`
- **Error handling:** All exceptions caught and logged
- **Testing:** Both unit and integration tests
- **Reusability:** Centralized factory for all workflows

## Next Steps

1. ✅ **Deploy** and monitor fallback logs in staging
2. ⏳ **Add metrics** integration (H7)
3. ⏳ **Add health check** endpoint using `check_checkpointer_health()` (H8)
4. ⏳ **Surface** persistence status in mission UI
5. ⏳ **Alert** on production fallback events
