# VITAL API Documentation

## Overview

The VITAL API provides comprehensive endpoints for healthcare AI agent management, chat workflows, and intelligent agent selection. Built with clean architecture principles and enterprise-grade security.

**Base URL**: `https://vital-expert-6ogba876j-crossroads-catalysts-projects.vercel.app/api`

## Authentication

All API endpoints require authentication via Supabase. Include the user's session token in the request headers:

```http
Authorization: Bearer <session_token>
```

## Rate Limiting

API endpoints are protected by rate limiting:

- **Chat Endpoints**: 10 requests per minute
- **Agent Selection**: 20 requests per minute  
- **Workflow Endpoints**: 5 requests per 5 minutes

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 2024-10-15T22:30:00Z
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `429` - Rate Limited
- `500` - Internal Server Error

---

## Chat API

### POST /api/chat

Stream chat messages with intelligent agent selection.

**Request Body:**
```json
{
  "message": "What are the symptoms of heart disease?",
  "userId": "user-123",
  "sessionId": "session-456",
  "agent": {
    "id": "cardiology-1",
    "name": "cardiology-expert",
    "displayName": "Cardiology Expert",
    "systemPrompt": "You are a cardiology expert..."
  },
  "interactionMode": "automatic",
  "autonomousMode": false,
  "selectedTools": ["medical-knowledge", "diagnosis"],
  "chatHistory": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant", 
      "content": "Hi! How can I help you today?"
    }
  ]
}
```

**Response:**
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type":"reasoning","step":"agent_selection","description":"Selecting best agent for query..."}

data: {"type":"agent_selected","agent":{"id":"cardiology-1","name":"cardiology-expert"},"confidence":0.95,"reasoning":"Perfect match for cardiology query"}

data: {"type":"reasoning","step":"processing","description":"Analyzing symptoms and providing diagnosis..."}

data: {"type":"content","content":"Common symptoms of heart disease include chest pain, shortness of breath, fatigue, and irregular heartbeat..."}

data: {"type":"complete","result":"Response completed successfully"}
```

**Validation:**
- `message`: Required, 1-4000 characters
- `userId`: Required, valid email or UUID
- `sessionId`: Optional, valid UUID
- `agent`: Optional, valid agent object
- `interactionMode`: Optional, "manual" or "automatic"
- `autonomousMode`: Optional, boolean
- `selectedTools`: Optional, array of strings (max 10)
- `chatHistory`: Optional, array of message objects (max 100)

---

## Agent API

### GET /api/agent

Get available agents with filtering and pagination.

**Query Parameters:**
- `search` (optional): Search term for agent names/descriptions
- `tier` (optional): Filter by agent tier (1, 2, 3)
- `capabilities` (optional): Filter by capabilities (comma-separated)
- `domains` (optional): Filter by knowledge domains (comma-separated)
- `ragEnabled` (optional): Filter by RAG capability (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sort` (optional): Sort field (name, tier, createdAt, updatedAt)
- `order` (optional): Sort order (asc, desc)

**Example Request:**
```http
GET /api/agent?tier=2&capabilities=medical-knowledge,diagnosis&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "cardiology-1",
        "name": "cardiology-expert",
        "displayName": "Cardiology Expert",
        "description": "Expert in cardiovascular health and diseases",
        "tier": 2,
        "capabilities": ["medical-knowledge", "cardiology", "diagnosis"],
        "knowledgeDomains": ["cardiology", "heart-health"],
        "ragEnabled": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    },
    "metadata": {
      "processingTime": 45,
      "totalCount": 50
    }
  }
}
```

### POST /api/agent

Create a new agent.

**Request Body:**
```json
{
  "name": "neurology-expert",
  "displayName": "Neurology Expert",
  "description": "Expert in neurological disorders and brain health",
  "systemPrompt": "You are a neurology expert specializing in brain and nervous system disorders...",
  "capabilities": ["medical-knowledge", "neurology", "diagnosis"],
  "knowledgeDomains": ["neurology", "neurosurgery"],
  "tier": 2,
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 4000,
  "ragEnabled": true,
  "metadata": {
    "tags": ["neurology", "brain-health"],
    "category": "medical-specialist",
    "version": "1.0.0",
    "author": "VITAL Team",
    "license": "MIT"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agent": {
      "id": "neurology-1",
      "name": "neurology-expert",
      "displayName": "Neurology Expert",
      "description": "Expert in neurological disorders and brain health",
      "tier": 2,
      "capabilities": ["medical-knowledge", "neurology", "diagnosis"],
      "knowledgeDomains": ["neurology", "neurosurgery"],
      "model": "gpt-4",
      "temperature": 0.7,
      "maxTokens": 4000,
      "ragEnabled": true,
      "createdAt": "2024-10-15T22:00:00.000Z",
      "updatedAt": "2024-10-15T22:00:00.000Z"
    },
    "metadata": {
      "processingTime": 120
    }
  }
}
```

### PUT /api/agent/{id}

Update an existing agent.

**Request Body:** Same as POST, but all fields are optional.

**Response:** Same as POST response.

### DELETE /api/agent/{id}

Delete an agent.

**Response:**
```json
{
  "success": true,
  "message": "Agent deleted successfully"
}
```

---

## Workflow API

### POST /api/workflow/execute

Execute a workflow with streaming response.

**Request Body:**
```json
{
  "query": "What are the treatment options for diabetes?",
  "userId": "user-123",
  "mode": {
    "selection": "automatic",
    "interaction": "interactive"
  },
  "context": {
    "chatHistory": [],
    "userPreferences": {
      "preferredAgents": ["endocrinology-1"],
      "complexity": "high"
    }
  }
}
```

**Response:** Same streaming format as chat API.

### GET /api/workflow/state

Get current workflow state.

**Response:**
```json
{
  "query": "What are the treatment options for diabetes?",
  "agent": {
    "id": "endocrinology-1",
    "name": "endocrinology-expert"
  },
  "mode": {
    "selection": "automatic",
    "interaction": "interactive"
  },
  "status": "running",
  "currentStep": "processing",
  "requiresInput": false,
  "response": "Treatment options for diabetes include..."
}
```

---

## Agent Selection API

### POST /api/agent/select

Get agent recommendations for a query.

**Request Body:**
```json
{
  "query": "I have chest pain and shortness of breath",
  "userId": "user-123",
  "count": 3,
  "filters": {
    "tiers": [2, 3],
    "capabilities": ["medical-knowledge", "diagnosis"],
    "domains": ["cardiology", "emergency-medicine"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "agent": {
          "id": "cardiology-1",
          "name": "cardiology-expert",
          "displayName": "Cardiology Expert"
        },
        "score": 0.95,
        "reasoning": "Perfect match for cardiac symptoms",
        "confidence": "high"
      },
      {
        "agent": {
          "id": "emergency-1", 
          "name": "emergency-medicine-expert",
          "displayName": "Emergency Medicine Expert"
        },
        "score": 0.88,
        "reasoning": "Good match for urgent symptoms",
        "confidence": "medium"
      }
    ],
    "metadata": {
      "processingTime": 150,
      "totalAgents": 50,
      "filteredAgents": 12
    }
  }
}
```

---

## Health & Monitoring API

### GET /api/health

Get system health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-10-15T22:00:00.000Z",
  "services": {
    "database": "healthy",
    "openai": "healthy",
    "supabase": "healthy"
  },
  "metrics": {
    "uptime": "99.9%",
    "responseTime": "45ms",
    "activeConnections": 150
  }
}
```

### GET /api/metrics

Get system metrics and performance data.

**Response:**
```json
{
  "requests": {
    "total": 10000,
    "successful": 9950,
    "failed": 50,
    "rate": "100/min"
  },
  "agents": {
    "total": 50,
    "active": 45,
    "averageScore": 0.87
  },
  "workflows": {
    "completed": 5000,
    "averageDuration": "2.5s",
    "successRate": "98%"
  }
}
```

---

## WebSocket Events

### Connection

Connect to real-time updates:

```javascript
const ws = new WebSocket('wss://vital-expert-6ogba876j-crossroads-catalysts-projects.vercel.app/ws');

ws.onopen = () => {
  console.log('Connected to VITAL WebSocket');
};
```

### Event Types

#### reasoning
```json
{
  "type": "reasoning",
  "step": "agent_selection",
  "description": "Selecting best agent for query...",
  "timestamp": "2024-10-15T22:00:00.000Z"
}
```

#### agent_selected
```json
{
  "type": "agent_selected",
  "agent": {
    "id": "cardiology-1",
    "name": "cardiology-expert"
  },
  "confidence": 0.95,
  "reasoning": "Perfect match for cardiology query",
  "timestamp": "2024-10-15T22:00:00.000Z"
}
```

#### content
```json
{
  "type": "content",
  "content": "Common symptoms of heart disease include...",
  "timestamp": "2024-10-15T22:00:00.000Z"
}
```

#### complete
```json
{
  "type": "complete",
  "result": "Response completed successfully",
  "timestamp": "2024-10-15T22:00:00.000Z"
}
```

#### error
```json
{
  "type": "error",
  "error": "Agent selection failed",
  "details": {
    "code": "AGENT_SELECTION_ERROR",
    "message": "No suitable agent found"
  },
  "timestamp": "2024-10-15T22:00:00.000Z"
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { VITALClient } from '@vital/sdk';

const client = new VITALClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://vital-expert-6ogba876j-crossroads-catalysts-projects.vercel.app'
});

// Send a chat message
const response = await client.chat.sendMessage({
  message: "What are the symptoms of heart disease?",
  userId: "user-123",
  interactionMode: "automatic"
});

// Get agent recommendations
const agents = await client.agents.getRecommendations({
  query: "I have chest pain",
  count: 3
});

// Execute workflow
const workflow = await client.workflow.execute({
  query: "Treatment options for diabetes",
  mode: { selection: "automatic", interaction: "interactive" }
});
```

### Python

```python
from vital_sdk import VITALClient

client = VITALClient(
    api_key="your-api-key",
    base_url="https://vital-expert-6ogba876j-crossroads-catalysts-projects.vercel.app"
)

# Send a chat message
response = client.chat.send_message(
    message="What are the symptoms of heart disease?",
    user_id="user-123",
    interaction_mode="automatic"
)

# Get agent recommendations
agents = client.agents.get_recommendations(
    query="I have chest pain",
    count=3
)
```

---

## Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `VALIDATION_ERROR` | Request validation failed | Check request body format |
| `AUTHENTICATION_ERROR` | Invalid or missing authentication | Provide valid session token |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry |
| `AGENT_NOT_FOUND` | Agent does not exist | Check agent ID |
| `WORKFLOW_ERROR` | Workflow execution failed | Check query and context |
| `INTERNAL_ERROR` | Server error | Contact support |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/chat` | 10 requests | 1 minute |
| `/api/agent` | 20 requests | 1 minute |
| `/api/workflow` | 5 requests | 5 minutes |
| `/api/health` | 60 requests | 1 minute |

---

## Support

For API support and questions:
- **Email**: api-support@vitalpath.ai
- **Documentation**: https://github.com/curatedhealth/vital-expert-platform
- **Status Page**: https://status.vitalpath.ai
