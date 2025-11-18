# VITAL AI Platform - API Documentation

## Overview

Complete API documentation for the VITAL AI Platform. This platform provides AI-powered healthcare agents, multi-agent workflows, and knowledge management capabilities.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Formats](#requestresponse-formats)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)
8. [Postman Collection](#postman-collection)

---

## Getting Started

### Base URLs

- **Development:** `http://localhost:3000`
- **Staging:** `https://staging.vital-ai.com`
- **Production:** `https://api.vital-ai.com`

### Quick Start

1. **Import Postman Collection**
   ```bash
   # Located at: VITAL_AI_Platform.postman_collection.json
   # Import into Postman: File → Import → Select file
   ```

2. **Set Environment**
   ```bash
   # Located at: VITAL_AI_Platform.postman_environment.json
   # Set in Postman: Environments → Import → Select file
   ```

3. **Get Access Token**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "your-password"
     }'
   ```

4. **Make Authenticated Request**
   ```bash
   curl -X GET http://localhost:3000/api/agents \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

---

## Authentication

All protected endpoints require JWT authentication.

### Sign In

**Endpoint:** `POST /api/auth/signin`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "user",
    "tenant_id": "tenant-456"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "refresh_token_here",
    "expires_at": 1234567890,
    "expires_in": 3600
  }
}
```

### Using Tokens

Include the access token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Refresh

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```json
{
  "refresh_token": "your_refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_access_token",
  "expires_at": 1234567890
}
```

---

## API Endpoints

### Agents

#### List Agents

```http
GET /api/agents?category=clinical&tier=1&limit=20
```

**Query Parameters:**
- `category` (optional) - Filter by category: `clinical`, `administrative`, `research`
- `tier` (optional) - Filter by tier: `1-5`
- `limit` (optional) - Number of results (default: 20, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "agent-123",
      "name": "Clinical Advisor",
      "description": "Provides evidence-based clinical guidance",
      "category": "clinical",
      "tier": 1,
      "capabilities": [
        "diagnosis_support",
        "treatment_planning"
      ],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

#### Get Agent by ID

```http
GET /api/agents/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "agent-123",
    "name": "Clinical Advisor",
    "description": "Detailed description...",
    "system_prompt": "You are an expert clinical advisor...",
    "tools": [
      {
        "id": "tool-1",
        "name": "Medical Literature Search",
        "type": "rag_search"
      }
    ],
    "prompts": [
      {
        "id": "prompt-1",
        "title": "Diagnosis Support",
        "content": "Analyze the following symptoms..."
      }
    ],
    "config": {
      "model": "gpt-4",
      "temperature": 0.7,
      "max_tokens": 2000
    }
  }
}
```

#### Search Agents (Semantic)

```http
POST /api/agents/search
```

**Request:**
```json
{
  "query": "diabetes management specialist",
  "filters": {
    "category": "clinical",
    "tier": [1, 2]
  },
  "limit": 10,
  "minSimilarity": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "agent": { ... },
      "similarity": 0.94,
      "reason": "Specialized in endocrinology and diabetes care"
    }
  ]
}
```

#### Recommend Agents

```http
POST /api/agents/recommend
```

**Request:**
```json
{
  "userQuery": "I need help managing patient appointments and follow-ups",
  "context": {
    "domain": "healthcare",
    "role": "clinician",
    "specialty": "internal_medicine"
  },
  "limit": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "agent": { ... },
        "score": 0.92,
        "reason": "Excellent for appointment scheduling and patient management",
        "useCase": "Automate appointment reminders and follow-up scheduling"
      }
    ],
    "alternativeAgents": [ ... ]
  }
}
```

---

### Chat & Conversations

#### Create Conversation

```http
POST /api/conversations
```

**Request:**
```json
{
  "agentId": "agent-123",
  "title": "Patient Care Consultation",
  "mode": "automatic",
  "metadata": {
    "patient_id": "patient-456",
    "case_type": "follow_up"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv-789",
    "agentId": "agent-123",
    "title": "Patient Care Consultation",
    "status": "active",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

#### Send Message

```http
POST /api/chat/messages
```

**Request:**
```json
{
  "conversationId": "conv-789",
  "content": "What are the treatment options for hypertension in elderly patients?",
  "attachments": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-123",
      "conversationId": "conv-789",
      "role": "user",
      "content": "What are the treatment options...",
      "created_at": "2024-01-01T12:05:00Z"
    },
    "response": {
      "id": "msg-124",
      "role": "assistant",
      "content": "For elderly patients with hypertension...",
      "metadata": {
        "citations": [1, 2, 3],
        "sources": [ ... ],
        "processingTime": 2340,
        "tokenUsage": {
          "promptTokens": 450,
          "completionTokens": 380,
          "totalTokens": 830
        }
      }
    }
  }
}
```

#### Stream Chat Response (SSE)

```http
POST /api/chat/stream
Content-Type: application/json
Accept: text/event-stream
```

**Request:**
```json
{
  "conversationId": "conv-789",
  "query": "Explain the pathophysiology of Type 2 diabetes",
  "agentId": "agent-123",
  "mode": "automatic"
}
```

**SSE Event Stream:**
```
event: thinking
data: {"content": "Analyzing query and retrieving relevant medical literature..."}

event: rag_context
data: {"sources": [...], "count": 5}

event: tool_call
data: {"tool": "medical_search", "status": "executing"}

event: content
data: {"content": "Type 2 diabetes is characterized by ", "delta": "Type 2 diabetes is characterized by "}

event: content
data: {"content": "insulin resistance and ", "delta": "insulin resistance and "}

event: done
data: {"messageId": "msg-125", "tokens": 450, "cost": 0.0234, "citations": [1,2,3]}
```

**Event Types:**
- `thinking` - Agent reasoning/planning steps
- `tool_call` - External tool execution
- `rag_context` - Retrieved knowledge chunks
- `content` - Response text (streamed incrementally)
- `done` - Completion with metadata

---

### Ask Expert (Mode 1 - Manual Workflow)

#### Execute Mode 1 Workflow

```http
POST /api/ask-expert
```

**Request:**
```json
{
  "query": "What are evidence-based treatment options for moderate hypertension?",
  "agentId": "clinical-advisor-01",
  "context": {
    "patient_demographics": {
      "age": 65,
      "sex": "male",
      "comorbidities": ["type_2_diabetes", "overweight"]
    },
    "current_medications": [
      "metformin 1000mg BID"
    ]
  },
  "preferences": {
    "include_citations": true,
    "max_response_length": "medium",
    "enable_rag": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": {
      "content": "For a 65-year-old male patient with moderate hypertension...",
      "citations": [
        {
          "id": 1,
          "source": "AHA/ACC Hypertension Guidelines 2023",
          "excerpt": "...",
          "url": "https://..."
        }
      ],
      "tools_used": [
        {
          "name": "medical_literature_search",
          "results_count": 12
        }
      ],
      "rag_context": [
        {
          "source": "Clinical Guidelines",
          "similarity": 0.94,
          "content": "..."
        }
      ]
    },
    "metadata": {
      "workflow_steps": [
        "validate_inputs",
        "fetch_agent",
        "rag_retrieval",
        "tool_suggestion",
        "tool_execution",
        "execute_agent",
        "format_output"
      ],
      "execution_time_ms": 3450,
      "model_used": "gpt-4",
      "token_usage": {
        "total": 1250,
        "cost_usd": 0.0625
      }
    }
  }
}
```

---

### Ask Panel (Multi-Agent Orchestration)

#### Orchestrate Panel

```http
POST /api/panel/orchestrate
```

**Request:**
```json
{
  "query": "Develop a comprehensive diabetes management plan for newly diagnosed Type 2 patient",
  "panelConfig": {
    "agents": [
      {
        "id": "endocrinologist-agent",
        "role": "primary",
        "weight": 0.4
      },
      {
        "id": "nutritionist-agent",
        "role": "specialist",
        "weight": 0.3
      },
      {
        "id": "fitness-agent",
        "role": "specialist",
        "weight": 0.3
      }
    ],
    "mode": "collaborative",
    "orchestration_strategy": "sequential"
  },
  "context": {
    "patient_profile": {
      "age": 52,
      "bmi": 31.2,
      "hba1c": 8.5,
      "lifestyle": {
        "physical_activity": "sedentary",
        "diet": "high_carb"
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "panel_response": {
      "synthesis": "Comprehensive diabetes management plan...",
      "agent_contributions": [
        {
          "agent": "endocrinologist-agent",
          "response": "Medical management recommendations...",
          "confidence": 0.95
        },
        {
          "agent": "nutritionist-agent",
          "response": "Dietary recommendations...",
          "confidence": 0.92
        },
        {
          "agent": "fitness-agent",
          "response": "Exercise plan...",
          "confidence": 0.89
        }
      ],
      "consensus_score": 0.94,
      "action_items": [
        {
          "category": "medication",
          "task": "Initiate metformin 500mg BID",
          "priority": "high",
          "assigned_to": "endocrinologist"
        }
      ]
    },
    "metadata": {
      "execution_time_ms": 8750,
      "total_tokens": 3450,
      "total_cost_usd": 0.1725
    }
  }
}
```

---

### RAG & Knowledge Management

#### Semantic Search

```http
POST /api/rag/search
```

**Request:**
```json
{
  "query": "latest clinical guidelines for hypertension management",
  "domain": "clinical_guidelines",
  "filters": {
    "publication_year": {
      "min": 2020
    },
    "source_type": ["guideline", "systematic_review"]
  },
  "limit": 10,
  "minSimilarity": 0.75
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "doc-123",
        "title": "2023 ACC/AHA Hypertension Guidelines",
        "content": "Key recommendations for hypertension management...",
        "similarity": 0.94,
        "metadata": {
          "source": "American College of Cardiology",
          "publication_date": "2023-11-15",
          "document_type": "guideline"
        },
        "embedding_model": "text-embedding-ada-002"
      }
    ],
    "total": 45,
    "query_embedding_time_ms": 120
  }
}
```

#### Upload Document

```http
POST /api/knowledge/documents
Content-Type: multipart/form-data
```

**Form Data:**
```
file: [binary PDF/DOCX/TXT file]
domain: clinical_guidelines
metadata: {
  "source": "WHO",
  "publication_year": 2023,
  "document_type": "guideline",
  "tags": ["diabetes", "treatment"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "doc-456",
      "filename": "diabetes_guidelines_2023.pdf",
      "status": "processing",
      "domain": "clinical_guidelines",
      "size_bytes": 2457600
    },
    "processing": {
      "estimated_time_seconds": 45,
      "job_id": "job-789"
    }
  }
}
```

#### Get Document Processing Status

```http
GET /api/knowledge/documents/:id/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "progress": 100,
    "chunks_created": 47,
    "embeddings_generated": 47,
    "indexed_at": "2024-01-01T12:30:00Z"
  }
}
```

---

### Workflows

#### List Workflows

```http
GET /api/workflows?status=published&category=clinical
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "workflow-123",
      "name": "Patient Intake Assessment",
      "description": "Comprehensive patient intake and triage workflow",
      "category": "clinical",
      "status": "published",
      "steps": 8,
      "estimated_duration_minutes": 15
    }
  ]
}
```

#### Execute Workflow

```http
POST /api/workflows/execute
```

**Request:**
```json
{
  "workflowId": "workflow-123",
  "inputs": {
    "patient_data": {
      "demographics": { ... },
      "chief_complaint": "Chest pain",
      "vital_signs": { ... }
    },
    "request_type": "initial_assessment"
  },
  "config": {
    "timeout_ms": 300000,
    "notify_on_completion": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "execution_id": "exec-456",
    "status": "running",
    "current_step": 2,
    "total_steps": 8,
    "outputs": {
      "triage_level": "urgent",
      "recommended_actions": [ ... ]
    }
  }
}
```

---

## Request/Response Formats

### Standard Response Structure

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T12:00:00Z",
    "request_id": "req-123",
    "version": "v1"
  }
}
```

### Pagination

For list endpoints:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "has_more": true,
    "next_offset": 60
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token",
    "details": {
      "reason": "token_expired",
      "expired_at": "2024-01-01T11:00:00Z"
    }
  },
  "meta": {
    "request_id": "req-456",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_ERROR` | 401 | Invalid or expired authentication token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions for this operation |
| `NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Rate Limiting

### Limits by Role

| Role | Requests/Minute | Requests/Hour | Requests/Day |
|------|----------------|---------------|--------------|
| **User** | 100 | 3,000 | 50,000 |
| **Clinician** | 200 | 6,000 | 100,000 |
| **Admin** | 500 | 15,000 | 250,000 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1704110400
```

### Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 100,
      "reset_at": "2024-01-01T12:15:00Z"
    }
  }
}
```

---

## Postman Collection

### Import Collection

1. Download collection: `VITAL_AI_Platform.postman_collection.json`
2. Open Postman
3. Click "Import" → Select file
4. Collection will appear in sidebar

### Import Environment

1. Download environment: `VITAL_AI_Platform.postman_environment.json`
2. Open Postman
3. Click "Environments" → "Import" → Select file
4. Set as active environment

### Setup

1. **Sign In**
   - Run "Authentication → Sign In" request
   - Token auto-saved to environment variable `auth_token`

2. **Make Requests**
   - All requests automatically use saved token
   - Edit environment variables as needed

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3000` |
| `auth_token` | JWT access token | `eyJhbGc...` |
| `tenant_id` | Tenant identifier | `tenant-123` |
| `agent_id` | Current agent ID | `agent-456` |
| `conversation_id` | Active conversation | `conv-789` |

---

## Webhooks

### Subscribe to Events

```http
POST /api/webhooks/subscribe
```

**Request:**
```json
{
  "url": "https://your-app.com/webhooks/vital",
  "events": [
    "conversation.completed",
    "workflow.finished",
    "document.processed"
  ],
  "secret": "your_webhook_secret"
}
```

### Webhook Payload

```json
{
  "event": "conversation.completed",
  "data": {
    "conversation_id": "conv-123",
    "status": "completed",
    "message_count": 15,
    "completed_at": "2024-01-01T12:30:00Z"
  },
  "timestamp": "2024-01-01T12:30:00Z",
  "signature": "sha256=..."
}
```

### Verify Webhook Signature

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

---

## Best Practices

### 1. Authentication

✅ **DO:**
- Store tokens securely (httpOnly cookies recommended)
- Implement token refresh before expiration
- Use HTTPS in production

❌ **DON'T:**
- Store tokens in localStorage (XSS risk)
- Share tokens between users
- Embed tokens in URLs

### 2. Error Handling

✅ **DO:**
- Check `success` field before accessing `data`
- Implement exponential backoff for retries
- Log `request_id` for debugging

### 3. Performance

✅ **DO:**
- Use pagination for large datasets
- Implement caching for frequently accessed data
- Use SSE for real-time updates

### 4. Rate Limiting

✅ **DO:**
- Respect rate limit headers
- Implement request queuing
- Cache responses when possible

---

## Support

- **Documentation:** https://docs.vital-ai.com
- **API Status:** https://status.vital-ai.com
- **Support Email:** support@vital-ai.com
- **GitHub Issues:** https://github.com/vital-ai/platform/issues

---

**Last Updated:** 2025-11-12
**API Version:** v1.0.0
**Collection Version:** 1.0.0
