# Input Validation Coverage Map - All Modes

**Last Updated:** 2025-12-13
**Coverage:** Mode 1, 2, 3, 4

---

## Overview

This document maps input validation coverage across all Ask Expert modes, showing where validation is applied and what patterns are detected.

---

## Mode Coverage Matrix

| Mode | Type | Agent Selection | Validation Schema | Injection Detection | Status |
|------|------|----------------|-------------------|---------------------|--------|
| **Mode 1** | Interactive | Manual | `AskExpertRequest` | ✅ Yes | ✅ Production |
| **Mode 2** | Interactive | Auto | `AskExpertRequest` | ✅ Yes | ✅ Production |
| **Mode 3** | Autonomous | Manual | `MissionCreateRequest` | ✅ Yes | ✅ Production |
| **Mode 4** | Autonomous | Auto | `MissionCreateRequest` | ✅ Yes | ✅ Production |

---

## Validation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                              │
│                 (FastAPI Middleware)                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │   Mode 1/2 (Interactive)            │
         │   Schema: AskExpertRequest          │
         │   Location: api/schemas/ask_expert.py│
         └─────────────────────────────────────┘
                           │
                           ├─── @field_validator("query")
                           │    ├─ sanitize_query() [ask_expert.py]
                           │    ├─ INJECTION_PATTERNS detection
                           │    └─ XSS/SQL/Command/Prompt injection checks
                           │
                           └─── Validated Request → Routes
                                ├─ /consultations
                                ├─ /consultations/{id}/messages/stream
                                └─ /query/auto

         ┌─────────────────────────────────────┐
         │   Mode 3/4 (Autonomous)             │
         │   Schema: MissionCreateRequest      │
         │   Location: api/schemas/research.py │
         └─────────────────────────────────────┘
                           │
                           ├─── @field_validator("goal")
                           │    ├─ sanitize_research_query() [research.py]
                           │    ├─ INJECTION_PATTERNS detection
                           │    └─ XSS/SQL/Command/Prompt injection checks
                           │
                           └─── Validated Request → Routes
                                ├─ /missions
                                ├─ /missions/{id}/stream
                                └─ /autonomous
```

---

## Schema Locations

### Mode 1/2: Interactive Schemas

**File:** `src/api/schemas/ask_expert.py`

**Key Schemas:**
- `AskExpertRequest` - Main request schema
- `Message` - Conversation message
- `AgentInfo` - Selected agent info
- `Citation` - Evidence citations

**Validation Functions:**
- `sanitize_query(value: str, strict: bool)` - Query sanitization
- `INJECTION_PATTERNS` - Pattern list (26 patterns)

**Applied In:**
- `/ask-expert/consultations` (Mode 1)
- `/ask-expert/consultations/{id}/messages/stream` (Mode 1)
- `/ask-expert/query/auto` (Mode 2)

---

### Mode 3/4: Autonomous Schemas

**File:** `src/api/schemas/research.py`

**Key Schemas:**
- `ResearchQueryRequest` - Research query validation
- `MissionCreateRequest` - Mission creation validation
- `MissionUpdateRequest` - Mission updates
- `RunnerExecuteRequest` - Execution params
- `MissionStreamRequest` - Streaming params

**Validation Functions:**
- `sanitize_research_query(value: str, strict: bool)` - Query sanitization
- `INJECTION_PATTERNS` - Pattern list (shared with ask_expert.py)

**Applied In:**
- `/ask-expert/missions` (Mode 3/4)
- `/ask-expert/autonomous` (Mode 3/4 alias)
- `/ask-expert/missions/{id}/stream` (Mode 3/4)

---

## Injection Patterns (Unified)

Both `ask_expert.py` and `research.py` use the same pattern list:

### SQL Injection
```python
r"(?i)\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\s+",
r"(?i)(\-\-|\/\*|\*\/|;)",
r"(?i)\bOR\s+1\s*=\s*1",
r"(?i)\bAND\s+1\s*=\s*1",
```

### Command Injection
```python
r"(?i)(;|\||`|\$\(|\$\{)",
r"(?i)\b(cat|rm|chmod|curl|wget|bash|sh|nc|netcat)\s+",
```

### Prompt Injection
```python
r"(?i)(ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?))",
r"(?i)(you\s+are\s+now|pretend\s+you|act\s+as\s+if|forget\s+(everything|all))",
r"(?i)(disregard\s+(all|previous)|override\s+instructions?)",
r"(?i)\[SYSTEM\]|\[INST\]|\<\|im_start\|\>",
```

### XSS
```python
r"(?i)<\s*script",
r"(?i)javascript\s*:",
r"(?i)on(load|error|click|mouseover)\s*=",
r"(?i)data\s*:",
```

---

## Field Validation Coverage

### Mode 1/2 Fields

| Field | Validation | Range | Format |
|-------|-----------|-------|--------|
| `query` | ✅ Sanitized | 1-10,000 chars | Text |
| `isAutomatic` | ✅ Type check | - | Boolean |
| `isAutonomous` | ✅ Type check | - | Boolean |
| `selectedAgents` | ✅ List validation | - | List[str] |
| `model` | ✅ String | - | Model name |
| `temperature` | ✅ Range | 0.0-2.0 | Float |
| `max_tokens` | ✅ Range | 1-32,000 | Integer |

---

### Mode 3/4 Fields

| Field | Validation | Range | Format |
|-------|-----------|-------|--------|
| `goal` | ✅ Sanitized | 1-5,000 chars | Text |
| `query` | ✅ Sanitized | 1-10,000 chars | Text |
| `template_id` | ✅ Format | - | Alphanumeric + `-_` |
| `agent_id` | ✅ Format | - | UUID or slug |
| `mode` | ✅ Enum | 3-4 | Integer |
| `max_iterations` | ✅ Range | 1-20 | Integer |
| `temperature` | ✅ Range | 0.0-2.0 | Float |
| `budget_limit` | ✅ Range | 0-1,000 | Float (USD) |
| `timeout_minutes` | ✅ Range | 1-480 | Integer |

---

## Route Coverage

### Interactive Routes (Mode 1/2)

**File:** `src/api/routes/ask_expert_interactive.py`

```
✅ POST   /ask-expert/consultations
   Schema: CreateConsultationRequest
   Fields: agent_id (validated)

✅ POST   /ask-expert/consultations/{id}/messages/stream
   Schema: StreamMessageRequest
   Fields: message (sanitized)

✅ POST   /ask-expert/agents/select
   Schema: AgentSelectRequest
   Fields: query (sanitized)

✅ POST   /ask-expert/query/auto
   Schema: AutoQueryRequest
   Fields: message (sanitized)
```

---

### Autonomous Routes (Mode 3/4)

**File:** `src/api/routes/ask_expert_autonomous.py`

```
✅ POST   /ask-expert/missions
   Schema: MissionCreateRequest (ValidatedMissionRequest)
   Fields: goal (sanitized), template_id, budget_limit, etc.

✅ POST   /ask-expert/autonomous
   Schema: MissionCreateRequest (alias)
   Fields: Same as /missions

✅ GET    /ask-expert/missions/{id}/stream
   Validation: mission_id (UUID format)

✅ POST   /ask-expert/missions/{id}/checkpoints/{cpId}/resolve
   Schema: CheckpointResolveRequest
   Fields: action, feedback (sanitized)
```

---

## Error Handling

### 422 Validation Error Format

**Unified across all modes:**

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "query",
      "message": "String should have at least 1 character",
      "pattern_matched": null
    }
  ],
  "suggestions": [
    "Ensure all fields meet validation requirements",
    "Remove special characters or injection patterns"
  ]
}
```

**Where Generated:**
- Mode 1/2: Pydantic automatic (FastAPI integration)
- Mode 3/4: Custom `ValidationErrorResponse` schema

---

## Testing Coverage

### Mode 1/2 Tests

**File:** `tests/unit/test_ask_expert_schemas.py` (if exists)

**Coverage:**
- Query sanitization
- Agent selection validation
- Message validation

---

### Mode 3/4 Tests

**File:** `tests/unit/test_validation.py`

**Coverage:**
- ✅ Query sanitization (26 tests)
- ✅ Mission creation validation
- ✅ Injection pattern detection
- ✅ Range validation
- ✅ Format validation
- ✅ Edge cases (unicode, null bytes)

---

## Security Gaps (Future Work)

### Identified Gaps

1. **CAPTCHA Integration**
   - Not yet implemented
   - Recommended after N failed validations

2. **Rate Limiting at Validation Level**
   - Validation happens, but rate limiting is at route level
   - Consider moving to middleware

3. **ML-Based Anomaly Detection**
   - Current: Regex-based pattern matching
   - Future: ML model for outlier detection

4. **Context-Aware Validation**
   - Current: Same rules for all templates
   - Future: Template-specific validation rules

---

## Monitoring Dashboard

### Recommended Metrics

**Validation Failures:**
```
- validation_errors_total (counter)
  Labels: mode, field, pattern_type

- validation_latency_ms (histogram)
  Labels: mode, schema_type

- injection_attempts_total (counter)
  Labels: pattern_type, severity
```

**Alerting Rules:**
```
# Alert if >5% of requests fail validation
rate(validation_errors_total[5m]) / rate(requests_total[5m]) > 0.05

# Alert if validation latency >10ms consistently
histogram_quantile(0.95, validation_latency_ms) > 10
```

---

## Migration Guide

### Adding Validation to New Routes

**Step 1: Choose Schema**
```python
# For interactive (Mode 1/2)
from api.schemas.ask_expert import AskExpertRequest

# For autonomous (Mode 3/4)
from api.schemas.research import MissionCreateRequest
```

**Step 2: Apply Validation**
```python
@router.post("/new-endpoint")
async def new_endpoint(request: YourRequest):
    try:
        validated = ValidatedSchema(
            field1=request.field1,
            field2=request.field2,
        )
    except ValidationError as ve:
        raise HTTPException(status_code=422, detail=...)
```

**Step 3: Add Tests**
```python
def test_new_endpoint_validation():
    with pytest.raises(ValidationError):
        ValidatedSchema(field1="<script>xss</script>")
```

---

## References

- **Mode 1/2 Schema:** `src/api/schemas/ask_expert.py`
- **Mode 3/4 Schema:** `src/api/schemas/research.py`
- **Interactive Routes:** `src/api/routes/ask_expert_interactive.py`
- **Autonomous Routes:** `src/api/routes/ask_expert_autonomous.py`
- **Tests:** `tests/unit/test_validation.py`
- **Full Docs:** `docs/H1_INPUT_VALIDATION_IMPLEMENTATION.md`

---

**Status:** ✅ All modes covered
**Last Reviewed:** 2025-12-13
**Next Review:** 2025-01-13
