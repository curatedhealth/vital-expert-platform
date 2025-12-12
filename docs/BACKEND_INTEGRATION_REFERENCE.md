# VITAL Platform - Backend Integration Reference

**Version:** 2.0.0
**Date:** December 11, 2025
**Authors:** Frontend Team
**Audience:** Backend/AI Engine Team

---

## Executive Summary

This document provides **all API contracts, data structures, and SSE event specifications** required to wire up the Ask Expert frontend components across all four modes:

| Mode | Name | Type | Status |
|------|------|------|--------|
| **Mode 1** | Interactive Manual | Streaming Chat | ✅ Implemented |
| **Mode 2** | Query Automatic | Auto-Select Agent | ✅ Implemented |
| **Mode 3** | Query Automatic (Deep) | Autonomous Missions | 🔄 New |
| **Mode 4** | Chat Automatic | Background Missions | 🔄 New |

**Total API Endpoints Required:** 24
**Total SSE Event Types:** 25+
**Total Database Tables Referenced:** 15+

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Authentication & Headers](#2-authentication--headers)
3. [Mode 1: Interactive Manual APIs](#3-mode-1-interactive-manual-apis)
4. [Mode 2: Query Automatic APIs](#4-mode-2-query-automatic-apis)
5. [Mode 3 & 4: Autonomous Mission APIs](#5-mode-3--4-autonomous-mission-apis)
6. [SSE Event Specifications](#6-sse-event-specifications)
7. [Database Schema Requirements](#7-database-schema-requirements)
8. [Error Handling Standards](#8-error-handling-standards)
9. [Rate Limiting & Quotas](#9-rate-limiting--quotas)
10. [Testing Checklist](#10-testing-checklist)

---

## 1. Architecture Overview

### 1.1 System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Mode 1: ChatInterface    │  Mode 2: AgentSelector  │  Mode 3/4: Autonomous │
│  - Streaming messages     │  - Auto-select agent    │  - Mission templates   │
│  - Conversation history   │  - Query routing        │  - SSE streaming       │
│  - Tool usage display     │  - Confidence scores    │  - HITL checkpoints    │
└────────────┬──────────────┴───────────┬─────────────┴──────────┬────────┘
             │                          │                        │
             ▼                          ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (FastAPI)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  /api/ask-expert/v1/       │  Base path for all Ask Expert APIs        │
│  /api/ask-expert/v2/       │  New endpoints for Modes 3 & 4            │
└────────────┬──────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI ENGINE (LangGraph)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Agent Selection  │  Runner Execution  │  Mission Orchestration         │
│  RAG Retrieval    │  Tool Calling      │  HITL Checkpoints              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Base URLs

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:8000/api` |
| Staging | `https://staging-api.vital.ai/api` |
| Production | `https://api.vital.ai/api` |

---

## 2. Authentication & Headers

### 2.1 Required Headers (All Requests)

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-Tenant-ID: <tenant_uuid>
X-Request-ID: <unique_request_uuid>
```

### 2.2 Optional Headers

```http
X-Session-ID: <session_uuid>           # For conversation continuity
X-Client-Version: <semver>             # Frontend version for compatibility
X-Correlation-ID: <trace_uuid>         # For distributed tracing
Accept: text/event-stream              # Required for SSE endpoints
```

### 2.3 JWT Token Payload (Expected)

```typescript
interface JWTPayload {
  sub: string;           // User ID
  tenant_id: string;     // Tenant UUID
  roles: string[];       // User roles
  permissions: string[]; // Specific permissions
  exp: number;           // Expiration timestamp
  iat: number;           // Issued at timestamp
}
```

---

## 3. Mode 1: Interactive Manual APIs

### 3.1 Start Conversation

**Endpoint:** `POST /ask-expert/v1/conversations`

**Request:**
```typescript
interface CreateConversationRequest {
  agent_id: string;                    // Selected agent UUID
  initial_message?: string;            // Optional first message
  context?: {
    documents?: string[];              // Document IDs for context
    knowledge_namespaces?: string[];   // RAG namespaces to query
  };
  settings?: {
    temperature?: number;              // 0.0 - 1.0
    max_tokens?: number;               // Max response tokens
    stream?: boolean;                  // Enable streaming (default: true)
  };
}
```

**Response:**
```typescript
interface CreateConversationResponse {
  conversation_id: string;
  agent: {
    id: string;
    name: string;
    display_name: string;
    avatar_url?: string;
    level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
    capabilities: string[];
  };
  created_at: string;                  // ISO 8601
  session_id: string;
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Invalid agent_id or parameters
- `401 Unauthorized` - Invalid/missing token
- `403 Forbidden` - Tenant mismatch
- `404 Not Found` - Agent not found
- `429 Too Many Requests` - Rate limited

---

### 3.2 Send Message (Streaming)

**Endpoint:** `POST /ask-expert/v1/conversations/{conversation_id}/messages/stream`

**Headers:**
```http
Accept: text/event-stream
```

**Request:**
```typescript
interface SendMessageRequest {
  content: string;                     // User message
  attachments?: Array<{
    type: 'file' | 'image' | 'document';
    url: string;
    name: string;
    mime_type: string;
  }>;
  metadata?: Record<string, unknown>;
}
```

**SSE Response Events:**

```typescript
// Event: message_start
data: {"type": "message_start", "message_id": "msg_123"}

// Event: content_block_start
data: {"type": "content_block_start", "index": 0, "content_block": {"type": "text"}}

// Event: content_block_delta
data: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Hello"}}

// Event: tool_use (when agent uses a tool)
data: {"type": "tool_use", "tool_name": "web_search", "tool_input": {"query": "..."}, "tool_id": "tool_123"}

// Event: tool_result
data: {"type": "tool_result", "tool_id": "tool_123", "result": {...}}

// Event: content_block_stop
data: {"type": "content_block_stop", "index": 0}

// Event: message_stop
data: {"type": "message_stop", "message_id": "msg_123", "stop_reason": "end_turn"}

// Event: error
data: {"type": "error", "error": {"code": "rate_limit", "message": "..."}}
```

---

### 3.3 Get Conversation History

**Endpoint:** `GET /ask-expert/v1/conversations/{conversation_id}/messages`

**Query Parameters:**
```typescript
interface GetMessagesParams {
  limit?: number;          // Default: 50, Max: 100
  before?: string;         // Message ID for pagination
  after?: string;          // Message ID for pagination
}
```

**Response:**
```typescript
interface GetMessagesResponse {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    attachments?: Attachment[];
    tool_calls?: ToolCall[];
    created_at: string;
    tokens_used?: number;
  }>;
  has_more: boolean;
  total_count: number;
}
```

---

### 3.4 List User Conversations

**Endpoint:** `GET /ask-expert/v1/conversations`

**Query Parameters:**
```typescript
interface ListConversationsParams {
  limit?: number;          // Default: 20
  offset?: number;         // Pagination offset
  agent_id?: string;       // Filter by agent
  status?: 'active' | 'archived';
  sort?: 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
}
```

**Response:**
```typescript
interface ListConversationsResponse {
  conversations: Array<{
    id: string;
    agent: {
      id: string;
      name: string;
      avatar_url?: string;
    };
    last_message?: {
      content: string;
      created_at: string;
    };
    message_count: number;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
  has_more: boolean;
}
```

---

## 4. Mode 2: Query Automatic APIs

### 4.1 Auto-Select Agent

**Endpoint:** `POST /ask-expert/v1/agents/select`

**Request:**
```typescript
interface AgentSelectRequest {
  query: string;                       // User's question
  context?: {
    function_name?: string;            // e.g., "Medical Affairs"
    department_name?: string;          // e.g., "HEOR"
    domain?: string;                   // e.g., "market_access"
    conversation_history?: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  };
  preferences?: {
    preferred_level?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
    require_rag?: boolean;
    require_tools?: string[];
  };
  top_k?: number;                      // Number of candidates (default: 3)
}
```

**Response:**
```typescript
interface AgentSelectResponse {
  selected_agent: {
    id: string;
    name: string;
    display_name: string;
    avatar_url?: string;
    level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
    confidence_score: number;          // 0.0 - 1.0
    reasoning: string;                 // Why this agent was selected
  };
  candidates: Array<{
    id: string;
    name: string;
    display_name: string;
    avatar_url?: string;
    level: string;
    confidence_score: number;
    match_reasons: string[];
  }>;
  query_classification: {
    intent: string;
    domain: string;
    complexity: 'low' | 'medium' | 'high';
    requires_specialist: boolean;
  };
}
```

---

### 4.2 Execute Query with Auto-Selected Agent

**Endpoint:** `POST /ask-expert/v1/query/auto`

**Request:**
```typescript
interface AutoQueryRequest {
  query: string;
  agent_id?: string;                   // Optional: override auto-selection
  enable_rag?: boolean;                // Default: true
  enable_web_search?: boolean;         // Default: false
  stream?: boolean;                    // Default: true
  session_id?: string;                 // For conversation continuity
}
```

**Response (Non-Streaming):**
```typescript
interface AutoQueryResponse {
  response: {
    content: string;
    citations?: Citation[];
    confidence: number;
  };
  agent: {
    id: string;
    name: string;
    level: string;
  };
  sources?: Source[];
  tokens_used: number;
  cost_usd: number;
  duration_ms: number;
}
```

**Response (Streaming):** Same SSE format as Mode 1 Section 3.2

---

## 5. Mode 3 & 4: Autonomous Mission APIs

### 5.1 List Mission Templates

**Endpoint:** `GET /ask-expert/v2/missions/templates`

**Query Parameters:**
```typescript
interface ListTemplatesParams {
  family?: MissionFamily;              // Filter by family
  complexity?: MissionComplexity;      // Filter by complexity
  domain?: PharmaDomain;               // Filter by domain
  search?: string;                     // Full-text search
  limit?: number;                      // Default: 20
  offset?: number;
}
```

**Response:**
```typescript
interface ListTemplatesResponse {
  templates: MissionTemplate[];
  total: number;
  has_more: boolean;
}
```

**MissionTemplate Schema:**
```typescript
interface MissionTemplate {
  id: string;
  name: string;
  family: 'DEEP_RESEARCH' | 'EVALUATION' | 'INVESTIGATION' | 'STRATEGY' |
          'PREPARATION' | 'MONITORING' | 'PROBLEM_SOLVING' | 'GENERIC';
  category: string;
  description: string;
  long_description?: string;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration_min: number;      // Minutes
  estimated_duration_max: number;      // Minutes
  estimated_cost_min: number;          // USD
  estimated_cost_max: number;          // USD
  required_agent_tiers: ('L1' | 'L2' | 'L3' | 'L4' | 'L5')[];
  recommended_agents: string[];        // Agent IDs
  min_agents: number;
  max_agents: number;
  tasks: MissionTask[];
  checkpoints: Checkpoint[];
  required_inputs: InputField[];
  optional_inputs: InputField[];
  outputs: OutputField[];
  tags: string[];
  use_cases: string[];
  example_queries: string[];
  workflow_config: Record<string, unknown>;
  tool_requirements: ToolRequirement[];
  mode4_constraints: Mode4Constraints;
  is_active: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}
```

**Sub-Types:**
```typescript
interface MissionTask {
  id: string;
  name: string;
  description: string;
  assigned_level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  assigned_archetype?: string;
  estimated_minutes: number;
  required: boolean;
  tools?: string[];
  depends_on?: string[];               // Task IDs this depends on
}

interface Checkpoint {
  id: string;
  name: string;
  type: 'approval' | 'quality' | 'budget' | 'timeout';
  after_task: string;                  // Task ID
  description?: string;
  options?: string[];                  // For quality checkpoints
  timeout_minutes?: number;
  requires_approval?: boolean;
  auto_approve_after?: number;         // Seconds
}

interface InputField {
  name: string;
  type: 'string' | 'text' | 'textarea' | 'number' | 'boolean' |
        'select' | 'multiselect' | 'file' | 'array' | 'object';
  description: string;
  required: boolean;
  placeholder?: string;
  options?: string[];                  // For select/multiselect
  default_value?: unknown;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    min_length?: number;
    max_length?: number;
  };
}

interface OutputField {
  name: string;
  type: 'markdown' | 'document' | 'table' | 'array' |
        'structured_data' | 'file' | 'number' | 'object' | 'chart';
  description: string;
  format?: string;
}

interface ToolRequirement {
  tool_id: string;
  tool_name: string;
  required: boolean;
  purpose: string;
}

interface Mode4Constraints {
  max_cost: number;                    // USD
  max_api_calls: number;
  max_iterations: number;
  allow_auto_continue: boolean;
  max_wall_time_minutes: number;
  budget_warning_threshold?: number;   // Percentage (0-1)
  quality_checkpoint_interval?: number; // After N tasks
}
```

---

### 5.2 Get Single Mission Template

**Endpoint:** `GET /ask-expert/v2/missions/templates/{template_id}`

**Response:** Single `MissionTemplate` object

---

### 5.3 Start Mission (Mode 3 & 4)

**Endpoint:** `POST /ask-expert/v2/missions`

**Request:**
```typescript
interface StartMissionRequest {
  template_id: string;
  agent_id: string;                    // Lead agent
  goal: string;                        // User's objective
  inputs: Record<string, unknown>;     // Template-defined inputs
  config: {
    autonomy_band: 'supervised' | 'guided' | 'autonomous';
    checkpoint_overrides?: Record<string, boolean>; // Enable/disable specific checkpoints
    max_budget?: number;               // Override template budget
    deadline?: string;                 // ISO 8601 timestamp
    notify_on_checkpoint?: boolean;    // Send notifications
    notify_on_complete?: boolean;
  };
  mode: 3 | 4;                         // Mode 3 = Query Auto, Mode 4 = Chat Auto
}
```

**Response:**
```typescript
interface StartMissionResponse {
  mission_id: string;
  status: 'pending' | 'running';
  template: {
    id: string;
    name: string;
  };
  agent: {
    id: string;
    name: string;
    display_name: string;
  };
  estimated_completion: string;        // ISO 8601
  stream_url: string;                  // SSE endpoint for real-time updates
  created_at: string;
}
```

---

### 5.4 Mission Stream (SSE)

**Endpoint:** `GET /ask-expert/v2/missions/{mission_id}/stream`

**Headers:**
```http
Accept: text/event-stream
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
```

**SSE Events:** See [Section 6.2](#62-mode-3--4-mission-events) for complete event specifications.

---

### 5.5 Get Mission Status

**Endpoint:** `GET /ask-expert/v2/missions/{mission_id}`

**Response:**
```typescript
interface MissionStatusResponse {
  id: string;
  template_id: string;
  template_name: string;
  agent_id: string;
  agent_name: string;
  tenant_id: string;
  goal: string;
  inputs: Record<string, unknown>;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: {
    current_task_id?: string;
    current_task_name?: string;
    completed_tasks: string[];
    failed_tasks: string[];
    total_tasks: number;
    percentage: number;
  };
  checkpoint?: {
    id: string;
    name: string;
    type: string;
    waiting_since: string;
  };
  outputs?: Record<string, unknown>;
  artifacts: Artifact[];
  sources: Source[];
  quality_scores: Record<string, number>;
  cost: {
    current: number;
    max_budget: number;
    percentage: number;
  };
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  timing: {
    started_at?: string;
    completed_at?: string;
    elapsed_seconds: number;
    estimated_remaining_seconds?: number;
  };
  error?: {
    code: string;
    message: string;
    task_id?: string;
  };
  created_at: string;
  updated_at: string;
}
```

---

### 5.6 Resolve Checkpoint (HITL)

**Endpoint:** `POST /ask-expert/v2/missions/{mission_id}/checkpoints/{checkpoint_id}/resolve`

**Request:**
```typescript
interface ResolveCheckpointRequest {
  decision: 'approve' | 'reject' | 'modify';
  feedback?: string;                   // User feedback/instructions
  modifications?: Record<string, unknown>; // For 'modify' decision
  selected_option?: string;            // For quality checkpoints
}
```

**Response:**
```typescript
interface ResolveCheckpointResponse {
  checkpoint_id: string;
  decision: string;
  mission_status: 'running' | 'paused' | 'cancelled';
  next_task?: {
    id: string;
    name: string;
  };
  resolved_at: string;
}
```

---

### 5.7 Pause Mission

**Endpoint:** `POST /ask-expert/v2/missions/{mission_id}/pause`

**Request:**
```typescript
interface PauseMissionRequest {
  reason?: string;
}
```

**Response:**
```typescript
interface PauseMissionResponse {
  mission_id: string;
  status: 'paused';
  paused_at: string;
  current_task?: string;
}
```

---

### 5.8 Resume Mission

**Endpoint:** `POST /ask-expert/v2/missions/{mission_id}/resume`

**Response:**
```typescript
interface ResumeMissionResponse {
  mission_id: string;
  status: 'running';
  resumed_at: string;
  stream_url: string;
}
```

---

### 5.9 Cancel Mission

**Endpoint:** `POST /ask-expert/v2/missions/{mission_id}/cancel`

**Request:**
```typescript
interface CancelMissionRequest {
  reason?: string;
  save_partial_results?: boolean;      // Default: true
}
```

**Response:**
```typescript
interface CancelMissionResponse {
  mission_id: string;
  status: 'cancelled';
  cancelled_at: string;
  partial_outputs?: Record<string, unknown>;
  artifacts?: Artifact[];
  refund_amount?: number;              // If applicable
}
```

---

### 5.10 List User Missions

**Endpoint:** `GET /ask-expert/v2/missions`

**Query Parameters:**
```typescript
interface ListMissionsParams {
  status?: MissionStatus | MissionStatus[];
  template_id?: string;
  agent_id?: string;
  mode?: 3 | 4;
  from_date?: string;                  // ISO 8601
  to_date?: string;                    // ISO 8601
  limit?: number;                      // Default: 20
  offset?: number;
  sort?: 'created_at' | 'updated_at' | 'status';
  order?: 'asc' | 'desc';
}
```

**Response:**
```typescript
interface ListMissionsResponse {
  missions: Array<{
    id: string;
    template_name: string;
    agent_name: string;
    goal: string;
    status: MissionStatus;
    progress_percentage: number;
    created_at: string;
    completed_at?: string;
  }>;
  total: number;
  has_more: boolean;
}
```

---

### 5.11 Get Mission Artifacts

**Endpoint:** `GET /ask-expert/v2/missions/{mission_id}/artifacts`

**Response:**
```typescript
interface MissionArtifactsResponse {
  artifacts: Artifact[];
  total_size_bytes: number;
}

interface Artifact {
  id: string;
  name: string;
  type: 'document' | 'table' | 'chart' | 'summary' |
        'analysis' | 'presentation' | 'data' | 'image';
  format: string;                      // e.g., 'pdf', 'xlsx', 'png'
  size_bytes?: number;
  download_url: string;                // Signed URL, expires in 1 hour
  preview_url?: string;                // For images/charts
  content?: unknown;                   // Inline content for small artifacts
  metadata?: Record<string, unknown>;
  created_at: string;
}
```

---

### 5.12 Download Artifact

**Endpoint:** `GET /ask-expert/v2/missions/{mission_id}/artifacts/{artifact_id}/download`

**Response:** Binary file stream with appropriate `Content-Type` and `Content-Disposition` headers.

---

## 6. SSE Event Specifications

### 6.1 Mode 1 & 2 Streaming Events

```typescript
// Message lifecycle events
type Mode1Event =
  | { type: 'message_start'; message_id: string }
  | { type: 'content_block_start'; index: number; content_block: { type: 'text' } }
  | { type: 'content_block_delta'; index: number; delta: { type: 'text_delta'; text: string } }
  | { type: 'content_block_stop'; index: number }
  | { type: 'message_stop'; message_id: string; stop_reason: 'end_turn' | 'max_tokens' | 'tool_use' }

  // Tool events
  | { type: 'tool_use'; tool_name: string; tool_input: Record<string, unknown>; tool_id: string }
  | { type: 'tool_result'; tool_id: string; result: unknown; is_error?: boolean }

  // RAG events
  | { type: 'rag_search_start'; namespaces: string[] }
  | { type: 'rag_search_result'; sources: Source[]; total_chunks: number }

  // Metadata events
  | { type: 'usage'; input_tokens: number; output_tokens: number }
  | { type: 'cost'; amount_usd: number }

  // Error events
  | { type: 'error'; error: { code: string; message: string; retryable: boolean } };
```

---

### 6.2 Mode 3 & 4 Mission Events

```typescript
type MissionEvent =
  // Mission lifecycle
  | {
      event: 'mission_started';
      mission_id: string;
      template_id: string;
      template_name: string;
      estimated_duration_minutes: number;
    }
  | {
      event: 'mission_completed';
      outputs: Record<string, unknown>;
      total_cost: number;           // USD
      total_tokens: number;
      total_duration: number;       // Milliseconds
      quality_score: number;        // 0-1
    }
  | {
      event: 'mission_failed';
      error: string;
      error_code: string;
      failed_task?: string;
      recoverable: boolean;
    }
  | {
      event: 'mission_paused';
      reason: string;
      checkpoint_id?: string;
    }
  | {
      event: 'mission_cancelled';
      reason?: string;
      partial_results_saved: boolean;
    }

  // Task lifecycle
  | {
      event: 'task_started';
      task_id: string;
      task_name: string;
      task_description: string;
      level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
      assigned_agent?: string;
      estimated_minutes: number;
    }
  | {
      event: 'task_progress';
      task_id: string;
      progress: number;             // 0-100
      message: string;
    }
  | {
      event: 'task_completed';
      task_id: string;
      output: unknown;
      duration_ms: number;
      tokens_used: number;
      quality_score?: number;
    }
  | {
      event: 'task_failed';
      task_id: string;
      error: string;
      error_code: string;
      retry_count: number;
      will_retry: boolean;
    }
  | {
      event: 'task_skipped';
      task_id: string;
      reason: string;
    }

  // HITL Checkpoints
  | {
      event: 'checkpoint_reached';
      checkpoint_id: string;
      checkpoint_name: string;
      type: 'approval' | 'quality' | 'budget' | 'timeout';
      requires_approval: boolean;
      description: string;
      context: {
        summary?: string;
        details?: Array<{ label: string; value: string }>;
        preview?: string;
        warnings?: string[];
        impact?: 'low' | 'medium' | 'high';
      };
      options?: Array<{
        id: string;
        label: string;
        description?: string;
      }>;
      timeout_seconds?: number;
      auto_approve?: boolean;
    }
  | {
      event: 'checkpoint_resolved';
      checkpoint_id: string;
      decision: 'approve' | 'reject' | 'modify';
      resolved_by: 'user' | 'timeout' | 'system';
      feedback?: string;
    }

  // Delegation & Agent Activity
  | {
      event: 'delegation';
      from_agent: string;
      from_agent_name: string;
      from_level: string;
      to_agent: string;
      to_agent_name: string;
      to_level: string;
      reason: string;
      task_id: string;
    }
  | {
      event: 'thinking';
      agent_id: string;
      agent_name: string;
      content: string;              // Brief thinking indicator
    }
  | {
      event: 'reasoning';
      step: number;
      type: 'analysis' | 'search' | 'synthesis' | 'calculation' |
            'inference' | 'validation' | 'decision' | 'warning' | 'insight';
      content: string;
      confidence?: number;          // 0-1
      sources?: Array<{ title: string; url?: string }>;
    }

  // Artifacts & Sources
  | {
      event: 'artifact_created';
      artifact_id: string;
      name: string;
      type: 'document' | 'table' | 'chart' | 'summary' |
            'analysis' | 'presentation' | 'data';
      format: string;
      size_bytes?: number;
      preview_url?: string;
    }
  | {
      event: 'source_found';
      source_id: string;
      title: string;
      url?: string;
      type: 'publication' | 'website' | 'database' | 'internal' | 'api';
      relevance_score: number;      // 0-1
      citation?: string;
    }

  // Quality & Budget
  | {
      event: 'quality_score';
      metric: 'relevance' | 'accuracy' | 'comprehensiveness' |
              'expression' | 'faithfulness' | 'coverage' |
              'timeliness' | 'confidence';
      score: number;                // 0-1
      details?: string;
    }
  | {
      event: 'budget_warning';
      current_cost: number;         // USD
      max_cost: number;             // USD
      percentage: number;           // 0-100
      recommendation: string;
    }

  // Tool Usage
  | {
      event: 'tool_started';
      tool_id: string;
      tool_name: string;
      task_id: string;
      input_preview?: string;
    }
  | {
      event: 'tool_completed';
      tool_id: string;
      tool_name: string;
      success: boolean;
      duration_ms: number;
      output_preview?: string;
    };
```

---

### 6.3 SSE Format Specification

All SSE events MUST follow this format:

```
event: <event_name>
data: <json_payload>

```

**Example:**
```
event: task_started
data: {"event":"task_started","task_id":"task_001","task_name":"Research Phase","level":"L2","estimated_minutes":15}

event: reasoning
data: {"event":"reasoning","step":1,"type":"analysis","content":"Breaking down the research question into components...","confidence":0.95}

event: checkpoint_reached
data: {"event":"checkpoint_reached","checkpoint_id":"cp_001","type":"approval","requires_approval":true,"description":"Review research plan before proceeding","context":{"summary":"Found 15 relevant sources","impact":"medium"}}

```

**Important Requirements:**
1. Each event MUST have both `event:` and `data:` lines
2. JSON payload MUST be valid and parseable
3. Events MUST be terminated with double newline (`\n\n`)
4. Event names MUST match the `event` field in the JSON payload
5. Use `: keepalive` comments every 15 seconds to prevent timeouts

---

## 7. Database Schema Requirements

### 7.1 Core Tables

```sql
-- Mission Templates (Backend owns this)
CREATE TABLE mission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  family VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  complexity VARCHAR(20) NOT NULL CHECK (complexity IN ('low', 'medium', 'high', 'critical')),
  estimated_duration_min INTEGER NOT NULL,
  estimated_duration_max INTEGER NOT NULL,
  estimated_cost_min DECIMAL(10,2) NOT NULL,
  estimated_cost_max DECIMAL(10,2) NOT NULL,
  required_agent_tiers TEXT[] NOT NULL DEFAULT '{}',
  recommended_agents UUID[] DEFAULT '{}',
  min_agents INTEGER DEFAULT 1,
  max_agents INTEGER DEFAULT 5,
  tasks JSONB NOT NULL DEFAULT '[]',
  checkpoints JSONB NOT NULL DEFAULT '[]',
  required_inputs JSONB NOT NULL DEFAULT '[]',
  optional_inputs JSONB NOT NULL DEFAULT '[]',
  outputs JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  use_cases TEXT[] DEFAULT '{}',
  example_queries TEXT[] DEFAULT '{}',
  workflow_config JSONB DEFAULT '{}',
  tool_requirements JSONB DEFAULT '[]',
  mode4_constraints JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  version VARCHAR(20) DEFAULT '1.0.0',
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Missions
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES mission_templates(id),
  agent_id UUID NOT NULL REFERENCES agents(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL,
  goal TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  config JSONB NOT NULL DEFAULT '{}',
  mode INTEGER NOT NULL CHECK (mode IN (3, 4)),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  current_task_id VARCHAR(100),
  completed_tasks TEXT[] DEFAULT '{}',
  failed_tasks TEXT[] DEFAULT '{}',
  outputs JSONB,
  quality_scores JSONB DEFAULT '{}',
  total_cost DECIMAL(10,4) DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  error_message TEXT,
  error_code VARCHAR(50),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mission Artifacts
CREATE TABLE mission_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  format VARCHAR(20) NOT NULL,
  size_bytes INTEGER,
  storage_path TEXT NOT NULL,
  content JSONB,                       -- For small inline artifacts
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mission Sources
CREATE TABLE mission_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  type VARCHAR(50) NOT NULL,
  citation TEXT,
  relevance_score DECIMAL(3,2),
  retrieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- HITL Checkpoints (Runtime State)
CREATE TABLE mission_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  checkpoint_id VARCHAR(100) NOT NULL,  -- From template
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'modified', 'timeout')),
  context JSONB DEFAULT '{}',
  decision VARCHAR(20),
  feedback TEXT,
  modifications JSONB,
  resolved_by VARCHAR(20),              -- 'user', 'timeout', 'system'
  reached_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Mission Events Log (For Audit)
CREATE TABLE mission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_missions_tenant_status ON missions(tenant_id, status);
CREATE INDEX idx_missions_user ON missions(user_id);
CREATE INDEX idx_missions_template ON missions(template_id);
CREATE INDEX idx_mission_artifacts_mission ON mission_artifacts(mission_id);
CREATE INDEX idx_mission_sources_mission ON mission_sources(mission_id);
CREATE INDEX idx_mission_checkpoints_mission ON mission_checkpoints(mission_id);
CREATE INDEX idx_mission_events_mission ON mission_events(mission_id);
CREATE INDEX idx_mission_events_type ON mission_events(event_type);
```

### 7.2 Existing Tables Referenced

The frontend expects these existing tables to have specific fields:

```sql
-- Agents table (must have these fields)
agents (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  display_name VARCHAR(255),
  slug VARCHAR(255),
  avatar_url TEXT,
  level VARCHAR(10),                   -- 'L1', 'L2', 'L3', 'L4', 'L5'
  tier VARCHAR(20),
  function_name VARCHAR(255),
  department_name VARCHAR(255),
  capabilities TEXT[],
  status VARCHAR(20),
  tenant_id UUID,
  -- ... other fields
);

-- Conversations table
conversations (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  user_id UUID,
  tenant_id UUID,
  status VARCHAR(20),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Messages table
messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(20),                    -- 'user', 'assistant', 'system'
  content TEXT,
  attachments JSONB,
  tool_calls JSONB,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ
);
```

---

## 8. Error Handling Standards

### 8.1 Error Response Format

All API errors MUST return this format:

```typescript
interface ErrorResponse {
  error: {
    code: string;                      // Machine-readable code
    message: string;                   // Human-readable message
    details?: Record<string, unknown>; // Additional context
    request_id?: string;               // For support/debugging
    retryable?: boolean;               // Can client retry?
    retry_after?: number;              // Seconds until retry allowed
  };
}
```

### 8.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_request` | 400 | Malformed request body |
| `missing_parameter` | 400 | Required parameter missing |
| `invalid_parameter` | 400 | Parameter validation failed |
| `unauthorized` | 401 | Invalid or missing auth token |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource not found |
| `conflict` | 409 | Resource state conflict |
| `rate_limited` | 429 | Too many requests |
| `budget_exceeded` | 402 | Mission budget exhausted |
| `agent_unavailable` | 503 | Agent temporarily unavailable |
| `mission_failed` | 500 | Mission execution error |
| `checkpoint_timeout` | 408 | HITL checkpoint timed out |
| `internal_error` | 500 | Unexpected server error |

### 8.3 SSE Error Events

```typescript
// Stream error (recoverable)
event: error
data: {"type":"error","error":{"code":"rate_limited","message":"Rate limit exceeded","retryable":true,"retry_after":30}}

// Fatal error (stream ends)
event: error
data: {"type":"error","error":{"code":"mission_failed","message":"Task execution failed","retryable":false,"details":{"task_id":"task_003","reason":"Tool timeout"}}}
```

---

## 9. Rate Limiting & Quotas

### 9.1 Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Standard APIs | 100 requests | Per minute |
| Streaming APIs | 10 concurrent | Per user |
| Mission Start | 5 missions | Per hour |
| File Upload | 20 uploads | Per hour |

### 9.2 Quotas

| Resource | Default Limit | Notes |
|----------|---------------|-------|
| Active Missions | 3 concurrent | Per user |
| Mission Duration | 4 hours | Max wall time |
| Mission Cost | $50 | Per mission |
| Artifact Storage | 100 MB | Per mission |
| Conversation History | 1000 messages | Per conversation |

### 9.3 Headers

Rate limit info MUST be returned in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702300800
X-RateLimit-Window: 60
```

---

## 10. Testing Checklist

### 10.1 Mode 1 & 2 Tests

- [ ] Create conversation with valid agent
- [ ] Create conversation with invalid agent (404)
- [ ] Stream message and receive all event types
- [ ] Handle tool_use → tool_result flow
- [ ] Get conversation history with pagination
- [ ] List conversations with filters
- [ ] Auto-select agent returns top candidates
- [ ] Auto-select confidence scores are valid (0-1)

### 10.2 Mode 3 & 4 Tests

- [ ] List templates with filters
- [ ] Get single template by ID
- [ ] Start mission with valid inputs
- [ ] Start mission with missing required inputs (400)
- [ ] Receive mission_started event on stream
- [ ] Receive task lifecycle events (started → progress → completed)
- [ ] Checkpoint reached pauses mission
- [ ] Resolve checkpoint continues mission
- [ ] Pause/resume mission flow
- [ ] Cancel mission returns partial results
- [ ] Budget warning at threshold
- [ ] Mission fails gracefully on error
- [ ] Artifacts downloadable after completion
- [ ] Sources have relevance scores

### 10.3 SSE Tests

- [ ] Events parse as valid JSON
- [ ] Event names match payload `event` field
- [ ] Keepalive prevents timeout
- [ ] Error events are recoverable vs fatal
- [ ] Stream reconnection works
- [ ] All event types documented are emitted

### 10.4 Integration Tests

- [ ] Full mission lifecycle (start → complete)
- [ ] HITL checkpoint approve flow
- [ ] HITL checkpoint reject flow
- [ ] HITL checkpoint modify flow
- [ ] Multi-task mission with delegations
- [ ] Mission with quality checkpoints
- [ ] Mission with budget warning
- [ ] Concurrent missions per user limit
- [ ] Cross-tenant isolation

---

## 11. Frontend Artifact System

### 11.1 Architecture Overview

The frontend implements a **dedicated renderer architecture** where each artifact type is handled by specialized components that wrap core VITAL UI components:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      VitalArtifactPanel (Container)                      │
│  - Panel layout, actions, metadata display                               │
│  - Delegates rendering to type-specific renderers                        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ArtifactRenderer (Router)                           │
│  - Routes by artifact.type                                               │
│  - Handles fallbacks for unknown types                                   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────────────┐
           ▼                   ▼                           ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│ MarkdownRenderer │  │   CodeRenderer   │  │  ChartRenderer           │
│ → VitalStreamText│  │ → VitalCodeBlock │  │ → Recharts (standalone)  │
└──────────────────┘  └──────────────────┘  └──────────────────────────┘
           │
           ▼
┌──────────────────┐
│  TableRenderer   │
│ → VitalDataTable │
└──────────────────┘
```

### 11.2 Supported Artifact Types

| Type | Renderer | VITAL Component | Content Format |
|------|----------|-----------------|----------------|
| `document` | MarkdownRenderer | VitalStreamText | Markdown string |
| `code` | CodeRenderer | VitalCodeBlock | Source code string |
| `chart` | ChartRenderer | Recharts | JSON string or array |
| `table` | TableRenderer | VitalDataTable | JSON string, CSV, or array |
| `diagram` | CodeRenderer (fallback) | VitalCodeBlock | Mermaid syntax |
| `image` | MarkdownRenderer | Native `<img>` | Base64 data URL or URL |
| `generic` | MarkdownRenderer | VitalStreamText | Any text |

### 11.3 Artifact Data Contract

**Expected Artifact Object from Backend:**

```typescript
interface Artifact {
  id: string;                            // Unique artifact ID
  type: ArtifactType;                    // See supported types above
  title: string;                         // Display name
  content: string;                       // Content (format varies by type)
  language?: string;                     // For code artifacts (e.g., 'typescript', 'python')
  metadata?: {
    wordCount?: number;                  // For documents
    lineCount?: number;                  // For code
    generatedBy?: string;                // Tool/agent that created it
    agentName?: string;                  // Agent display name
    model?: string;                      // LLM model used
    createdAt?: string;                  // ISO 8601 timestamp
    version?: number;                    // Artifact version (for editing)
    chartType?: string;                  // For charts: 'line', 'bar', 'area', 'pie', 'scatter'
    mimeType?: string;                   // For files/images
    size?: number;                       // File size in bytes
  };
  actions?: ('download' | 'copy' | 'share' | 'edit' | 'regenerate')[];
}

type ArtifactType =
  | 'document'    // Markdown/text documents
  | 'code'        // Source code with syntax highlighting
  | 'chart'       // Data visualizations
  | 'table'       // Tabular data
  | 'diagram'     // Mermaid diagrams (future)
  | 'image'       // Images
  | 'generic';    // Fallback for unknown types
```

### 11.4 Content Format Specifications

#### 11.4.1 Document Content (Markdown)

```typescript
// Backend should send GitHub-flavored markdown
{
  "type": "document",
  "content": "# Executive Summary\n\n**Key Findings:**\n\n- Finding 1\n- Finding 2\n\n## Details\n\nThe analysis shows..."
}
```

**Supported Markdown Features:**
- Headers (h1-h6)
- Bold, italic, strikethrough
- Code blocks with syntax highlighting
- Tables
- Lists (ordered/unordered)
- Blockquotes
- Links and images
- Horizontal rules

#### 11.4.2 Code Content

```typescript
// Backend should send raw code string
{
  "type": "code",
  "language": "typescript",  // Required for syntax highlighting
  "content": "interface User {\n  id: string;\n  name: string;\n}\n\nfunction getUser(id: string): User {\n  // implementation\n}"
}
```

**Supported Languages:** `javascript`, `typescript`, `python`, `java`, `csharp`, `cpp`, `go`, `rust`, `ruby`, `php`, `swift`, `kotlin`, `sql`, `html`, `css`, `json`, `yaml`, `markdown`, `bash`, `powershell`, `docker`, `hcl`, `graphql`, `tsx`, `jsx`

#### 11.4.3 Chart Content

The frontend accepts **two formats** for chart data:

**Format 1: JSON Array (Recommended)**
```typescript
{
  "type": "chart",
  "metadata": { "chartType": "bar" },
  "content": "[{\"name\":\"Q1\",\"revenue\":4000,\"costs\":2400},{\"name\":\"Q2\",\"revenue\":3000,\"costs\":1398},{\"name\":\"Q3\",\"revenue\":2000,\"costs\":9800},{\"name\":\"Q4\",\"revenue\":2780,\"costs\":3908}]"
}
```

**Format 2: Structured Object**
```typescript
{
  "type": "chart",
  "content": "{\"chartType\":\"line\",\"data\":[{\"name\":\"Jan\",\"value\":400},{\"name\":\"Feb\",\"value\":300}],\"dataKeys\":[\"value\"],\"xAxisKey\":\"name\"}"
}
```

**Chart Data Requirements:**
- Each data point MUST have a `name` property (x-axis label)
- Numeric values are auto-detected for y-axis
- `chartType` can be: `line`, `bar`, `area`, `pie`, `scatter`
- Default chart type is `line` if not specified

#### 11.4.4 Table Content

The frontend accepts **three formats** for table data:

**Format 1: JSON Array (Recommended)**
```typescript
{
  "type": "table",
  "content": "[{\"drug\":\"Aspirin\",\"indication\":\"Pain\",\"status\":\"Approved\"},{\"drug\":\"Ibuprofen\",\"indication\":\"Inflammation\",\"status\":\"Approved\"}]"
}
```

**Format 2: JSON Object with Data Array**
```typescript
{
  "type": "table",
  "content": "{\"data\":[{\"drug\":\"Aspirin\",\"indication\":\"Pain\"}],\"columns\":[{\"key\":\"drug\",\"label\":\"Drug Name\"},{\"key\":\"indication\",\"label\":\"Indication\"}]}"
}
```

**Format 3: CSV String**
```typescript
{
  "type": "table",
  "content": "drug,indication,status\nAspirin,Pain,Approved\nIbuprofen,Inflammation,Approved"
}
```

**Table Parsing Rules:**
- JSON is tried first, then CSV fallback
- Column labels are auto-inferred from keys (snake_case → Title Case)
- Numeric values are right-aligned, text left-aligned
- Columns are sortable by default
- Search and CSV export are enabled

#### 11.4.5 Image Content

```typescript
// Base64 data URL
{
  "type": "image",
  "title": "Clinical Trial Results",
  "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}

// Or regular URL (rendered via markdown)
{
  "type": "image",
  "title": "Organizational Chart",
  "content": "https://storage.vital.ai/artifacts/org-chart-123.png"
}
```

### 11.5 SSE Events with Artifacts

When streaming missions, artifact creation should emit this event:

```typescript
// Event: artifact_created
event: artifact_created
data: {
  "event": "artifact_created",
  "artifact_id": "art_123",
  "name": "Competitive Analysis Report",
  "type": "document",
  "format": "markdown",
  "size_bytes": 15420,
  "preview_url": null,
  "content": "# Competitive Analysis\n\n## Market Overview\n\n..."
}
```

**For large artifacts**, omit `content` and provide `download_url`:

```typescript
event: artifact_created
data: {
  "event": "artifact_created",
  "artifact_id": "art_456",
  "name": "Full Dataset",
  "type": "table",
  "format": "csv",
  "size_bytes": 5242880,
  "preview_url": "https://api.vital.ai/v2/missions/m_123/artifacts/art_456/preview",
  "download_url": "https://api.vital.ai/v2/missions/m_123/artifacts/art_456/download"
}
```

### 11.6 Artifact Size Limits

| Artifact Type | Max Inline Content | Preview Available | Download Available |
|---------------|-------------------|-------------------|-------------------|
| `document` | 10 MB | No | Yes |
| `code` | 10 MB | No | Yes |
| `chart` | 1 MB | Yes (image) | Yes (JSON) |
| `table` | 5 MB | Yes (first 100 rows) | Yes (full CSV) |
| `image` | 2 MB | Yes | Yes |

### 11.7 Frontend Component Props Reference

**MarkdownRenderer Props:**
```typescript
interface MarkdownRendererProps {
  content: string;              // Markdown content
  isStreaming?: boolean;        // Enable streaming mode (default: false)
  title?: string;               // Optional title
  version?: number;             // Version number
  lastModified?: string;        // ISO timestamp
  maxHeight?: number | string;  // Max height before scroll
  showToolbar?: boolean;        // Show word count, export (default: true)
  highlightCode?: boolean;      // Syntax highlight code blocks (default: true)
  onComplete?: () => void;      // Called when streaming completes
  onCopy?: () => void;          // Called on copy
  onExport?: () => void;        // Called on export
  onRegenerate?: () => void;    // Called on regenerate request
}
```

**CodeRenderer Props:**
```typescript
interface CodeRendererProps {
  content: string;              // Code content
  language?: string;            // Programming language (default: 'text')
  showLineNumbers?: boolean;    // Show line numbers (default: true)
  highlightLines?: number[];    // Lines to highlight (1-indexed)
  theme?: 'dark' | 'light';     // Color theme (default: 'dark')
  wordWrap?: boolean;           // Enable word wrap (default: false)
  maxHeight?: number | string;  // Max height (default: '600px')
  fileName?: string;            // File name to display
  useSimpleMode?: boolean;      // Use VitalCodeBlock directly (default: false)
}
```

**ChartRenderer Props:**
```typescript
interface ChartRendererProps {
  content: string;              // JSON data string or array
  chartType?: ChartType;        // Override auto-detected type
  title?: string;               // Chart title
  height?: number;              // Chart height (default: 300)
  showGrid?: boolean;           // Show grid lines (default: true)
  showLegend?: boolean;         // Show legend (default: true)
  showTooltip?: boolean;        // Show hover tooltips (default: true)
  colors?: string[];            // Custom color palette
}

type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'scatter';
```

**TableRenderer Props:**
```typescript
interface TableRendererProps {
  content: string | Record<string, unknown>[]; // Data (JSON/CSV/array)
  columns?: TableColumn[];      // Column definitions (auto-inferred if omitted)
  title?: string;               // Table title
  searchable?: boolean;         // Enable search (default: true)
  exportable?: boolean;         // Enable CSV export (default: true)
  maxHeight?: number;           // Max height before scroll (default: 400)
  showRowCount?: boolean;       // Show row count badge (default: true)
}

interface TableColumn {
  key: string;                  // Data key
  label: string;                // Display label
  sortable?: boolean;           // Enable sorting (default: true)
  align?: 'left' | 'center' | 'right';
  width?: string;               // CSS width
}
```

### 11.8 Testing Artifact Rendering

**Test Checklist:**

- [ ] Document artifact renders markdown correctly
- [ ] Code artifact shows syntax highlighting for all languages
- [ ] Code artifact language badge shows correct name
- [ ] Chart artifact auto-detects chart type from data
- [ ] Chart artifact renders with VITAL purple (#9055E0) branding
- [ ] Table artifact parses JSON array correctly
- [ ] Table artifact parses CSV correctly
- [ ] Table artifact search filters rows
- [ ] Table artifact CSV export works
- [ ] Large artifacts (>10MB) show download prompt
- [ ] Image data URLs render correctly
- [ ] Unknown artifact types fall back to markdown
- [ ] Artifact panel actions (copy, download) work

---

## Appendix A: Quick Reference

### A.1 Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/conversations` | Create conversation |
| `POST` | `/v1/conversations/{id}/messages/stream` | Send message (SSE) |
| `GET` | `/v1/conversations/{id}/messages` | Get history |
| `GET` | `/v1/conversations` | List conversations |
| `POST` | `/v1/agents/select` | Auto-select agent |
| `POST` | `/v1/query/auto` | Query with auto-select |
| `GET` | `/v2/missions/templates` | List templates |
| `GET` | `/v2/missions/templates/{id}` | Get template |
| `POST` | `/v2/missions` | Start mission |
| `GET` | `/v2/missions/{id}/stream` | Mission stream (SSE) |
| `GET` | `/v2/missions/{id}` | Get mission status |
| `POST` | `/v2/missions/{id}/checkpoints/{cpId}/resolve` | Resolve checkpoint |
| `POST` | `/v2/missions/{id}/pause` | Pause mission |
| `POST` | `/v2/missions/{id}/resume` | Resume mission |
| `POST` | `/v2/missions/{id}/cancel` | Cancel mission |
| `GET` | `/v2/missions` | List missions |
| `GET` | `/v2/missions/{id}/artifacts` | Get artifacts |
| `GET` | `/v2/missions/{id}/artifacts/{aId}/download` | Download artifact |

### A.2 Event Types Summary

**Mode 1 & 2:** `message_start`, `content_block_start`, `content_block_delta`, `content_block_stop`, `message_stop`, `tool_use`, `tool_result`, `rag_search_start`, `rag_search_result`, `usage`, `cost`, `error`

**Mode 3 & 4:** `mission_started`, `mission_completed`, `mission_failed`, `mission_paused`, `mission_cancelled`, `task_started`, `task_progress`, `task_completed`, `task_failed`, `task_skipped`, `checkpoint_reached`, `checkpoint_resolved`, `delegation`, `thinking`, `reasoning`, `artifact_created`, `source_found`, `quality_score`, `budget_warning`, `tool_started`, `tool_completed`

---

## Appendix B: Change Log

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2025-12-11 | Added Section 11: Frontend Artifact System with renderer architecture |
| 2.0.0 | 2025-12-11 | Added Mode 3 & 4 APIs, SSE events, database schema |
| 1.0.0 | 2025-11-15 | Initial Mode 1 & 2 documentation |

---

**Document Owner:** Frontend Team
**Last Updated:** December 11, 2025
**Review Status:** Ready for Backend Implementation
