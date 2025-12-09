# Ask Expert API Reference

**Version:** 2.0.0  
**Base URL:** `https://api.vitalpath.ai/api/v1/expert`  
**Last Updated:** December 6, 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [Common Headers](#common-headers)
3. [Mode 1: Manual Interactive](#mode-1-manual-interactive)
4. [Mode 2: Auto Interactive](#mode-2-auto-interactive)
5. [Mode 3: Manual Autonomous](#mode-3-manual-autonomous)
6. [Mode 4: Auto Autonomous](#mode-4-auto-autonomous)
7. [Shared Endpoints](#shared-endpoints)
8. [SSE Event Types](#sse-event-types)
9. [Error Handling](#error-handling)
10. [Rate Limits](#rate-limits)

---

## Authentication

All API requests require authentication via JWT token.

```http
Authorization: Bearer <jwt_token>
```

### Obtaining a Token

```http
POST /api/v1/auth/token
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "your_password"
}
```

**Response:**

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "eyJ..."
}
```

---

## Common Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token |
| `X-Tenant-ID` | Yes | Tenant identifier |
| `X-User-ID` | No | User identifier (extracted from token if not provided) |
| `X-Request-ID` | No | Request tracking ID |
| `Accept` | No | `text/event-stream` for SSE endpoints |

---

## Mode 1: Manual Interactive

Expert Chat - User manually selects expert and engages interactively.

### Stream Query

```http
POST /mode1/stream
Content-Type: application/json
Accept: text/event-stream
```

**Request Body:**

```json
{
  "query": "What are the FDA requirements for 510(k) submissions?",
  "agent_id": "agent-regulatory-expert",
  "session_id": "optional-session-uuid",
  "conversation_history": [
    {"role": "user", "content": "Previous question"},
    {"role": "assistant", "content": "Previous answer"}
  ],
  "options": {
    "include_citations": true,
    "include_reasoning": true,
    "max_tokens": 2048
  },
  "context": {
    "region_id": "reg-fda",
    "domain_id": "dom-medical-devices",
    "therapeutic_area_id": "ta-cardiology",
    "phase_id": "phase-premarket"
  }
}
```

**SSE Response Events:**

```
event: token
data: {"content": "The FDA "}

event: token
data: {"content": "510(k) process "}

event: reasoning
data: {"step": "Analyzing regulatory requirements", "agent": "regulatory-expert"}

event: citation
data: {"id": "1", "source": "FDA Guidance 2024", "title": "510(k) Program", "url": "https://fda.gov/...", "relevance": 0.95}

event: cost
data: {"inputTokens": 500, "outputTokens": 800, "totalTokens": 1300, "estimatedCost": 0.015}

event: done
data: {"success": true, "session_id": "session-uuid", "response_time_ms": 2500}
```

### Non-Streaming Query

```http
POST /mode1/query
Content-Type: application/json
```

**Response:**

```json
{
  "response": "The FDA 510(k) premarket notification process...",
  "citations": [
    {
      "id": "1",
      "source": "FDA Guidance",
      "title": "510(k) Program",
      "url": "https://fda.gov/...",
      "relevance": 0.95
    }
  ],
  "reasoning": [
    {"step": "Analyzing requirements", "detail": "..."}
  ],
  "confidence": 0.92,
  "session_id": "session-uuid",
  "cost": {
    "inputTokens": 500,
    "outputTokens": 800,
    "estimatedCost": 0.015
  },
  "response_time_ms": 2500
}
```

### Health Check

```http
GET /mode1/health
```

**Response:**

```json
{
  "status": "healthy",
  "mode": "mode1_manual_interactive",
  "features": {
    "streaming": true,
    "citations": true,
    "reasoning": true
  }
}
```

---

## Mode 2: Auto Interactive

Smart Copilot - System automatically selects expert team via Fusion Intelligence.

### Stream Query

```http
POST /mode2/stream
Content-Type: application/json
Accept: text/event-stream
```

**Request Body:**

```json
{
  "query": "Analyze the competitive landscape for diabetes treatments in the EU market",
  "session_id": "optional-session-uuid",
  "conversation_history": [],
  "options": {
    "enable_fusion": true,
    "max_experts": 3,
    "include_evidence": true,
    "fusion_weights": {
      "vector": 0.4,
      "graph": 0.35,
      "relational": 0.25
    }
  },
  "context": {
    "region_id": "reg-ema",
    "domain_id": "dom-pharma"
  }
}
```

**SSE Response Events:**

```
event: progress
data: {"stage": "fusion", "message": "Selecting expert team...", "progress": 10}

event: fusion
data: {
  "selectedExperts": [
    {"id": "agent-clinical", "name": "Clinical Expert", "confidence": 100, "role": "L2 Clinical"},
    {"id": "agent-regulatory", "name": "Regulatory Expert", "confidence": 92, "role": "L2 Regulatory"},
    {"id": "agent-heor", "name": "HEOR Specialist", "confidence": 85, "role": "L3 HEOR"}
  ],
  "evidence": {
    "method": "weighted_rrf",
    "weights": {"vector": 0.4, "graph": 0.35, "relational": 0.25},
    "sources_used": ["vector", "graph", "relational"],
    "retrieval_time_ms": 450
  }
}

event: progress
data: {"stage": "executing", "message": "Experts analyzing...", "progress": 30}

event: token
data: {"content": "Based on our multi-expert analysis..."}

event: citation
data: {"id": "1", "source": "EMA Guidelines", "relevance": 0.95}

event: cost
data: {"inputTokens": 800, "outputTokens": 1500, "totalTokens": 2300, "estimatedCost": 0.025}

event: done
data: {"success": true, "session_id": "session-uuid", "experts_used": ["agent-clinical", "agent-regulatory", "agent-heor"]}
```

### Fusion Selection Only

```http
POST /mode2/fusion/select
Content-Type: application/json
```

**Request Body:**

```json
{
  "query": "Drug interaction analysis",
  "max_experts": 5,
  "context": {
    "domain_id": "dom-pharma"
  }
}
```

**Response:**

```json
{
  "selected_experts": [
    {
      "id": "agent-clinical",
      "name": "Clinical Expert",
      "confidence": 100,
      "level": 2,
      "specialty": "Clinical Pharmacology"
    },
    {
      "id": "agent-safety",
      "name": "Safety Expert",
      "confidence": 88,
      "level": 2,
      "specialty": "Pharmacovigilance"
    }
  ],
  "fusion_evidence": {
    "method": "weighted_rrf",
    "vector_scores": {"agent-clinical": 0.92, "agent-safety": 0.88},
    "graph_paths": {"agent-clinical": ["drug-interaction", "clinical-review"]},
    "retrieval_time_ms": 350
  }
}
```

---

## Mode 3: Manual Autonomous

Mission Control - User selects expert and delegates autonomous execution.

### Create Mission

```http
POST /mode3/mission/create
Content-Type: application/json
```

**Request Body:**

```json
{
  "goal": "Conduct comprehensive literature review on CAR-T cell therapy efficacy",
  "agent_id": "agent-clinical-research",
  "options": {
    "max_steps": 10,
    "budget_limit_usd": 5.00,
    "require_checkpoints": true,
    "checkpoint_types": ["budget", "critical_decision", "external_action"]
  },
  "context": {
    "therapeutic_area_id": "ta-oncology",
    "phase_id": "phase-research"
  }
}
```

**Response:**

```json
{
  "mission_id": "mission-uuid",
  "status": "created",
  "goal": "Conduct comprehensive literature review...",
  "agent": {
    "id": "agent-clinical-research",
    "name": "Clinical Research Expert"
  },
  "created_at": "2025-12-06T10:00:00Z"
}
```

### Start Mission (Stream)

```http
POST /mode3/stream
Content-Type: application/json
Accept: text/event-stream
```

**Request Body:**

```json
{
  "mission_id": "mission-uuid"
}
```

**SSE Response Events:**

```
event: mission_started
data: {"mission_id": "mission-uuid", "status": "running"}

event: plan
data: {
  "steps": [
    {"id": "step-1", "name": "Search PubMed", "status": "pending", "estimated_time_s": 30},
    {"id": "step-2", "name": "Filter Results", "status": "pending"},
    {"id": "step-3", "name": "Extract Key Findings", "status": "pending"},
    {"id": "step-4", "name": "Synthesize Report", "status": "pending"}
  ]
}

event: step_started
data: {"step_id": "step-1", "name": "Search PubMed"}

event: tool_call
data: {"tool": "pubmed_search", "input": {"query": "CAR-T cell therapy efficacy"}}

event: tool_result
data: {"tool": "pubmed_search", "output": {"results": 127, "top_papers": [...]}}

event: step_completed
data: {"step_id": "step-1", "duration_ms": 5000}

event: checkpoint
data: {
  "id": "checkpoint-1",
  "type": "decision",
  "urgency": "medium",
  "question": "Found 127 papers. Proceed with full analysis or filter further?",
  "options": ["Proceed (Est. $3.50)", "Filter to top 50", "Cancel"],
  "timeout_s": 300
}

event: artifact
data: {
  "id": "artifact-1",
  "type": "report",
  "title": "CAR-T Literature Review",
  "format": "markdown",
  "preview": "## Executive Summary\n\n..."
}

event: mission_completed
data: {
  "mission_id": "mission-uuid",
  "status": "completed",
  "artifacts": ["artifact-1"],
  "metrics": {
    "duration_minutes": 15,
    "steps_executed": 4,
    "total_cost_usd": 2.50
  }
}
```

### Approve Checkpoint

```http
POST /mode3/checkpoint/{checkpoint_id}/approve
Content-Type: application/json
```

**Request Body:**

```json
{
  "decision": "proceed",
  "comment": "Proceed with full analysis"
}
```

### Pause Mission

```http
POST /mode3/mission/{mission_id}/pause
```

### Resume Mission

```http
POST /mode3/mission/{mission_id}/resume
```

### Cancel Mission

```http
POST /mode3/mission/{mission_id}/cancel
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "Changed requirements"
}
```

---

## Mode 4: Auto Autonomous

Background Dashboard - Fully autonomous with automatic expert team selection.

### Create Mission

```http
POST /mode4/mission/create
Content-Type: application/json
```

**Request Body:**

```json
{
  "goal": "Generate complete competitive intelligence report for Drug X",
  "title": "Q4 2025 Competitive Analysis",
  "options": {
    "enable_fusion": true,
    "max_team_size": 4,
    "budget_limit_usd": 10.00,
    "priority": "normal",
    "notify_on_completion": true,
    "checkpoint_auto_timeout_s": 600
  },
  "context": {
    "domain_id": "dom-pharma",
    "therapeutic_area_id": "ta-oncology"
  }
}
```

**Response:**

```json
{
  "mission_id": "mission-uuid",
  "status": "created",
  "title": "Q4 2025 Competitive Analysis",
  "created_at": "2025-12-06T10:00:00Z"
}
```

### Run Pre-Flight Checks

```http
POST /mode4/mission/{mission_id}/preflight
```

**Response:**

```json
{
  "mission_id": "mission-uuid",
  "preflight_passed": true,
  "checks": [
    {"id": "budget", "name": "Budget Available", "status": "passed", "detail": "$10.00 available"},
    {"id": "tools", "name": "Required Tools", "status": "passed", "detail": "All tools accessible"},
    {"id": "permissions", "name": "User Permissions", "status": "passed"},
    {"id": "context", "name": "Context Valid", "status": "passed"}
  ],
  "estimated_cost_usd": 7.50,
  "estimated_duration_minutes": 45
}
```

### Launch Mission (Stream)

```http
POST /mode4/stream
Content-Type: application/json
Accept: text/event-stream
```

**Request Body:**

```json
{
  "mission_id": "mission-uuid"
}
```

**SSE Response Events:**

```
event: preflight
data: {"status": "passed", "checks": [...]}

event: team_assembly
data: {
  "team": [
    {"id": "agent-strategic", "name": "Strategic Analyst", "confidence": 100, "role": "Lead"},
    {"id": "agent-clinical", "name": "Clinical Expert", "confidence": 95, "role": "Clinical Analysis"},
    {"id": "agent-regulatory", "name": "Regulatory Expert", "confidence": 88, "role": "Regulatory Review"},
    {"id": "agent-market", "name": "Market Analyst", "confidence": 82, "role": "Market Analysis"}
  ],
  "assembly_time_ms": 1200,
  "fusion_evidence": {...}
}

event: mission_started
data: {"mission_id": "mission-uuid", "status": "running"}

event: delegation
data: {"from": "agent-strategic", "to": "agent-clinical", "task": "Analyze clinical trial data"}

event: step_progress
data: {"step": 1, "total": 8, "name": "Market Research", "progress": 50}

event: notification
data: {"type": "progress", "title": "25% Complete", "message": "Market research phase completed"}

event: checkpoint
data: {"id": "cp-1", "type": "review", "question": "Review preliminary findings?"}

event: artifact
data: {"id": "artifact-1", "type": "report", "title": "Competitive Intelligence Report"}

event: mission_completed
data: {
  "mission_id": "mission-uuid",
  "status": "completed",
  "artifacts": ["artifact-1", "artifact-2"],
  "metrics": {...}
}
```

### Get Mission Status (Polling)

```http
GET /mode4/mission/{mission_id}/status
```

**Response:**

```json
{
  "mission_id": "mission-uuid",
  "status": "running",
  "progress": 65,
  "current_step": {
    "id": "step-5",
    "name": "Synthesizing findings",
    "started_at": "2025-12-06T10:45:00Z"
  },
  "team_status": [
    {"agent_id": "agent-strategic", "status": "active", "current_task": "Coordinating synthesis"},
    {"agent_id": "agent-clinical", "status": "completed"},
    {"agent_id": "agent-regulatory", "status": "waiting"}
  ],
  "artifacts_count": 2,
  "checkpoints_pending": 0,
  "estimated_completion": "2025-12-06T11:15:00Z"
}
```

### Get Mission History

```http
GET /mode4/missions/history
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 20 | Max results |
| `offset` | int | 0 | Pagination offset |
| `status` | string | all | Filter by status |

**Response:**

```json
{
  "missions": [
    {
      "mission_id": "mission-1",
      "title": "Q4 Analysis",
      "status": "completed",
      "created_at": "2025-12-06T10:00:00Z",
      "completed_at": "2025-12-06T10:45:00Z",
      "artifacts_count": 2
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

---

## Shared Endpoints

### Mission Control (Shared between Mode 3 & 4)

```http
# Pause any mission
POST /mission/pause
Content-Type: application/json
{"mission_id": "uuid", "mode": 3}

# Resume any mission
POST /mission/resume
Content-Type: application/json
{"mission_id": "uuid", "mode": 4}

# Cancel any mission
POST /mission/cancel
Content-Type: application/json
{"mission_id": "uuid", "mode": 3, "reason": "User cancelled"}

# Get mission status
GET /mission/status/{mission_id}?mode=4

# Handle checkpoint
POST /mission/checkpoint/{checkpoint_id}
Content-Type: application/json
{"decision": "approve", "mode": 3}

# Get mission history
GET /mission/history?mode=4&limit=20
```

### Agent Information

```http
# List available agents
GET /agents
```

**Response:**

```json
{
  "agents": [
    {
      "id": "agent-clinical",
      "name": "clinical-expert",
      "display_name": "Clinical Expert",
      "level": 2,
      "capabilities": ["clinical-analysis", "trial-review"],
      "status": "active"
    }
  ]
}
```

```http
# Get specific agent
GET /agents/{agent_id}
```

---

## SSE Event Types

| Event | Description | Modes |
|-------|-------------|-------|
| `token` | Streaming text chunk | 1, 2, 3, 4 |
| `reasoning` | Agent reasoning step | 1, 2, 3, 4 |
| `citation` | Evidence citation | 1, 2, 3, 4 |
| `tool_call` | Tool invocation start | 1, 2, 3, 4 |
| `tool_result` | Tool execution result | 1, 2, 3, 4 |
| `progress` | Progress update | 2, 3, 4 |
| `fusion` | Fusion selection result | 2, 4 |
| `team_assembly` | Team assembled | 4 |
| `delegation` | Task delegation | 3, 4 |
| `plan` | Mission plan | 3, 4 |
| `step_started` | Step execution start | 3, 4 |
| `step_completed` | Step execution end | 3, 4 |
| `checkpoint` | HITL checkpoint | 3, 4 |
| `artifact` | Generated artifact | 3, 4 |
| `notification` | User notification | 4 |
| `cost` | Cost tracking | 1, 2, 3, 4 |
| `error` | Error occurred | 1, 2, 3, 4 |
| `done` | Stream complete | 1, 2, 3, 4 |
| `heartbeat` | Keep-alive | 1, 2, 3, 4 |

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Query must be at least 5 characters",
    "details": {
      "field": "query",
      "min_length": 5,
      "actual_length": 3
    },
    "request_id": "req-uuid"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `AGENT_NOT_FOUND` | 404 | Agent does not exist |
| `MISSION_NOT_FOUND` | 404 | Mission does not exist |
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `BUDGET_EXCEEDED` | 402 | Token budget exceeded |
| `FUSION_TIMEOUT` | 504 | Fusion retrieval timeout |
| `LLM_ERROR` | 502 | LLM provider error |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Mode 1/2 Interactive | 60 | per minute |
| Mode 3/4 Mission Create | 10 | per minute |
| Mode 3/4 Stream | 5 | concurrent |
| Mission Status Poll | 120 | per minute |
| Agent List | 30 | per minute |

Rate limit headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1701864000
```

---

## SDK Examples

### Python

```python
from vital_sdk import AskExpert

client = AskExpert(api_key="your_api_key")

# Mode 1: Interactive chat
for chunk in client.mode1.stream(
    query="What are FDA requirements?",
    agent_id="agent-regulatory"
):
    if chunk.type == "token":
        print(chunk.content, end="")
    elif chunk.type == "citation":
        print(f"\n[{chunk.id}] {chunk.source}")

# Mode 2: Auto-select experts
response = client.mode2.query(
    query="Analyze diabetes market",
    enable_fusion=True
)
print(f"Experts: {[e['name'] for e in response.selected_experts]}")
print(response.content)

# Mode 4: Background mission
mission = client.mode4.create_mission(
    goal="Generate competitive report",
    budget_limit_usd=10.0
)

preflight = client.mode4.run_preflight(mission.id)
if preflight.passed:
    for event in client.mode4.launch(mission.id):
        if event.type == "notification":
            print(f"📢 {event.title}")
        elif event.type == "artifact":
            print(f"📄 Generated: {event.title}")
```

### TypeScript

```typescript
import { AskExpert } from '@vital/sdk';

const client = new AskExpert({ apiKey: 'your_api_key' });

// Mode 1: Interactive chat
const stream = await client.mode1.stream({
  query: 'What are FDA requirements?',
  agentId: 'agent-regulatory',
});

for await (const chunk of stream) {
  if (chunk.type === 'token') {
    process.stdout.write(chunk.content);
  }
}

// Mode 4: Background mission
const mission = await client.mode4.createMission({
  goal: 'Generate competitive report',
  budgetLimitUsd: 10.0,
});

const preflight = await client.mode4.runPreflight(mission.id);
if (preflight.passed) {
  const eventStream = await client.mode4.launch(mission.id);
  for await (const event of eventStream) {
    console.log(`${event.type}: ${JSON.stringify(event.data)}`);
  }
}
```

---

**API Version:** 2.0.0  
**OpenAPI Spec:** `/api/v1/expert/openapi.json`  
**Last Updated:** December 6, 2025
