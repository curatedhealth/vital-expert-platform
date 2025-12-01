---
# ============================================================================
# L5 TOOL System Prompt Template
# ============================================================================
# Template for creating deterministic tool definitions
# Token Budget: 100-200 tokens (often no LLM needed)
# Model Tier: Code-based (no LLM) or Tier 1
# ============================================================================

template_type: L5-TOOL
template_version: "2.0"
last_updated: "2025-11-26"

# Tool Identity
tool_id: "{{TOOL_ID}}"
tool_name: "{{TOOL_NAME}}"
tool_type: "{{TOOL_TYPE}}"  # api_wrapper | calculation | database_query | conversion | validation

# Tool Level Configuration
agent_level: L5
agent_level_name: TOOL
tier: 0  # Often no LLM

# Execution Configuration
implementation_type: "{{IMPLEMENTATION_TYPE}}"  # code | api | query
is_deterministic: true
timeout_ms: "{{TIMEOUT_MS}}"
rate_limit_per_minute: "{{RATE_LIMIT}}"

# Token Budget (if LLM used)
token_budget:
  min: 100
  max: 200
  recommended: 150

# Input/Output Schemas
input_schema:
  type: object
  required: "{{REQUIRED_FIELDS}}"
  properties: "{{INPUT_PROPERTIES}}"

output_schema:
  type: object
  properties: "{{OUTPUT_PROPERTIES}}"

# Tool Characteristics
requires_auth: "{{REQUIRES_AUTH}}"
external_dependencies: "{{EXTERNAL_DEPS}}"
idempotent: true

# Registration
registered_in: tool_registry
available_to:
  - L1
  - L2
  - L3
  - L4
---

# {{TOOL_NAME}}

## FUNCTION

{{TOOL_DESCRIPTION}}

**Type**: L5 TOOL (Deterministic)
**Implementation**: {{IMPLEMENTATION_TYPE}}
**Timeout**: {{TIMEOUT_MS}}ms

---

## INPUT SCHEMA

```json
{
  "type": "object",
  "required": {{REQUIRED_FIELDS}},
  "properties": {
    {{#each INPUT_PROPERTIES}}
    "{{@key}}": {
      "type": "{{this.type}}",
      "description": "{{this.description}}"
      {{#if this.enum}},
      "enum": {{this.enum}}
      {{/if}}
      {{#if this.minimum}},
      "minimum": {{this.minimum}}
      {{/if}}
      {{#if this.maximum}},
      "maximum": {{this.maximum}}
      {{/if}}
    }{{#unless @last}},{{/unless}}
    {{/each}}
  }
}
```

---

## OUTPUT SCHEMA

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["success", "error"]
    },
    "result": {
      {{#each OUTPUT_PROPERTIES}}
      "{{@key}}": {
        "type": "{{this.type}}"
      }{{#unless @last}},{{/unless}}
      {{/each}}
    },
    "error": {
      "type": "object",
      "properties": {
        "code": {"type": "string"},
        "message": {"type": "string"}
      }
    }
  }
}
```

---

## IMPLEMENTATION

```{{IMPLEMENTATION_LANGUAGE}}
{{IMPLEMENTATION_CODE}}
```

---

## EXECUTION RULES

1. **Deterministic**: Same input → Same output (always)
2. **No interpretation**: Execute exactly as specified
3. **Schema validation**: Reject invalid input immediately
4. **Timeout enforcement**: {{TIMEOUT_MS}}ms maximum
5. **No side effects**: Read-only unless explicitly write tool

---

## ERROR CODES

| Code | Description |
|------|-------------|
| `INVALID_INPUT` | Input failed schema validation |
| `TIMEOUT` | Execution exceeded {{TIMEOUT_MS}}ms |
| `RATE_LIMITED` | Exceeded {{RATE_LIMIT}}/minute |
| `EXTERNAL_ERROR` | External API/DB error |
| `NOT_FOUND` | Requested resource not found |

---

## EXAMPLE USAGE

### Request

```json
{
  "tool": "{{TOOL_NAME}}",
  "params": {
    {{EXAMPLE_INPUT}}
  }
}
```

### Response (Success)

```json
{
  "status": "success",
  "result": {
    {{EXAMPLE_OUTPUT}}
  }
}
```

### Response (Error)

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_INPUT",
    "message": "Field 'x' is required"
  }
}
```

---

## TOOL REGISTRATION SQL

```sql
INSERT INTO tool_registry (
    tool_name,
    tool_type,
    description,
    input_schema,
    output_schema,
    implementation_type,
    timeout_ms,
    rate_limit_per_minute,
    is_deterministic,
    requires_auth,
    is_active
) VALUES (
    '{{TOOL_NAME}}',
    '{{TOOL_TYPE}}',
    '{{TOOL_DESCRIPTION}}',
    '{{INPUT_SCHEMA}}'::jsonb,
    '{{OUTPUT_SCHEMA}}'::jsonb,
    '{{IMPLEMENTATION_TYPE}}',
    {{TIMEOUT_MS}},
    {{RATE_LIMIT}},
    true,
    {{REQUIRES_AUTH}},
    true
);
```

---

## COMMON TOOL TYPES

### API Wrapper

```yaml
tool_type: api_wrapper
implementation: |
  async function execute(params) {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      params: params
    });
    return response.json();
  }
timeout_ms: 5000
```

### Calculation

```yaml
tool_type: calculation
implementation: |
  function execute(params) {
    const { value, operation } = params;
    switch(operation) {
      case 'square': return { result: value * value };
      case 'sqrt': return { result: Math.sqrt(value) };
      default: throw new Error('Unknown operation');
    }
  }
timeout_ms: 100
```

### Database Query

```yaml
tool_type: database_query
implementation: |
  async function execute(params) {
    const result = await db.query(
      'SELECT * FROM table WHERE id = $1',
      [params.id]
    );
    return { result: result.rows[0] };
  }
timeout_ms: 1000
```

### Conversion

```yaml
tool_type: conversion
implementation: |
  const FACTORS = { mg_to_g: 0.001, g_to_kg: 0.001 };
  function execute(params) {
    const { value, from, to } = params;
    const key = `${from}_to_${to}`;
    return { result: value * FACTORS[key] };
  }
timeout_ms: 50
```

### Validation

```yaml
tool_type: validation
implementation: |
  function execute(params) {
    const { data, schema } = params;
    const errors = validate(data, schema);
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
timeout_ms: 100
```
