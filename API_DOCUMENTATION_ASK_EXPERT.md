# VITAL Ask Expert - API Documentation

## 🚀 Overview

The VITAL Ask Expert API provides endpoints for interacting with specialized healthcare AI agents, tool selection, and real-time reasoning visualization.

## 📡 Base URL

```
Production: https://api.vital-path.com
Development: http://localhost:3000
```

## 🔐 Authentication

All API requests require authentication via JWT token:

```http
Authorization: Bearer <your-jwt-token>
```

## 📋 Endpoints

### 1. Chat with Expert Agent

**Endpoint:** `POST /api/chat`

**Description:** Send a message to a selected expert agent and receive a response.

#### Request Body

```typescript
interface ChatRequest {
  message: string;                    // User's question (required)
  userId: string;                     // User ID (required)
  sessionId: string;                  // Session ID (required)
  agent?: Agent;                      // Selected agent (required for manual mode)
  interactionMode: 'manual' | 'automatic';  // Interaction mode (default: 'automatic')
  autonomousMode?: boolean;           // Autonomous mode flag (default: false)
  selectedTools?: string[];           // Selected tool IDs (optional)
  chatHistory?: Message[];            // Previous messages (optional)
}
```

#### Agent Object

```typescript
interface Agent {
  id: string;                         // Unique agent identifier
  name: string;                       // Agent name
  display_name: string;               // Display name
  description: string;                // Agent description
  system_prompt: string;              // System prompt for the agent
  model: string;                      // AI model used
  temperature: number;                // Response temperature (0-1)
  max_tokens: number;                 // Maximum response tokens
  tier: number;                       // Expertise tier (1-3)
  capabilities: string[];             // Agent capabilities
  rag_enabled: boolean;               // RAG capability flag
  avatar?: string;                    // Avatar URL (optional)
}
```

#### Message Object

```typescript
interface Message {
  id: string;                         // Message ID
  role: 'user' | 'assistant';        // Message role
  content: string;                    // Message content
  timestamp: Date;                    // Message timestamp
  metadata?: {                        // Additional metadata
    agent?: Agent;
    model?: string;
    tokens?: number;
    sources?: Source[];
  };
}
```

#### Response

```typescript
interface ChatResponse {
  success: boolean;                   // Request success status
  message: Message;                   // AI response message
  reasoning?: ReasoningEvent[];       // Reasoning steps (if available)
  sources?: Source[];                 // Information sources
  metadata: {                         // Response metadata
    agent: Agent;
    model: string;
    tokens: number;
    processingTime: number;
    toolsUsed: string[];
  };
}
```

#### Example Request

```http
POST /api/chat
Content-Type: application/json
Authorization: Bearer <your-token>

{
  "message": "What are the side effects of metformin?",
  "userId": "user123",
  "sessionId": "session456",
  "agent": {
    "id": "endocrinology-expert",
    "name": "Dr. Sarah Chen",
    "display_name": "Dr. Sarah Chen",
    "description": "Endocrinologist specializing in diabetes",
    "system_prompt": "You are an endocrinology expert...",
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000,
    "tier": 3,
    "capabilities": ["diabetes", "endocrinology", "medication"],
    "rag_enabled": true
  },
  "interactionMode": "manual",
  "selectedTools": ["pubmed-search", "fda-database"],
  "chatHistory": []
}
```

#### Example Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": {
    "id": "msg789",
    "role": "assistant",
    "content": "Metformin is generally well-tolerated, but common side effects include...",
    "timestamp": "2024-01-01T10:00:00Z",
    "metadata": {
      "agent": { /* agent object */ },
      "model": "gpt-4",
      "tokens": 150,
      "sources": [
        {
          "title": "Metformin Side Effects Study",
          "url": "https://pubmed.ncbi.nlm.nih.gov/12345678",
          "type": "research"
        }
      ]
    }
  },
  "reasoning": [
    {
      "id": "step1",
      "step": "analysis",
      "description": "Analyzing the question about metformin side effects",
      "data": { "query": "metformin side effects" },
      "timestamp": "2024-01-01T10:00:01Z",
      "status": "completed"
    }
  ],
  "sources": [
    {
      "title": "Metformin Side Effects Study",
      "url": "https://pubmed.ncbi.nlm.nih.gov/12345678",
      "type": "research",
      "relevance": 0.95
    }
  ],
  "metadata": {
    "agent": { /* agent object */ },
    "model": "gpt-4",
    "tokens": 150,
    "processingTime": 2.5,
    "toolsUsed": ["pubmed-search", "fda-database"]
  }
}
```

### 2. Get Available Agents

**Endpoint:** `GET /api/agents`

**Description:** Retrieve list of available expert agents.

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `tier` | number | Filter by expertise tier (1-3) | all |
| `specialty` | string | Filter by medical specialty | all |
| `search` | string | Search agents by name/description | none |
| `limit` | number | Maximum number of agents to return | 50 |
| `offset` | number | Number of agents to skip | 0 |

#### Response

```typescript
interface AgentsResponse {
  success: boolean;
  agents: Agent[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

#### Example Request

```http
GET /api/agents?tier=3&specialty=cardiology&limit=10
Authorization: Bearer <your-token>
```

#### Example Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "agents": [
    {
      "id": "cardiology-expert",
      "name": "Dr. Michael Rodriguez",
      "display_name": "Dr. Michael Rodriguez",
      "description": "Cardiologist with 15 years of experience",
      "system_prompt": "You are a cardiology expert...",
      "model": "gpt-4",
      "temperature": 0.7,
      "max_tokens": 2000,
      "tier": 3,
      "capabilities": ["cardiology", "heart_disease", "diagnosis"],
      "rag_enabled": true,
      "avatar": "/avatars/cardiology.jpg"
    }
  ],
  "total": 1,
  "pagination": {
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

### 3. Get Available Tools

**Endpoint:** `GET /api/tools`

**Description:** Retrieve list of available tools for agent use.

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `category` | string | Filter by tool category | all |
| `agentId` | string | Filter by agent compatibility | all |
| `enabled` | boolean | Filter by enabled status | true |

#### Response

```typescript
interface ToolsResponse {
  success: boolean;
  tools: Tool[];
  categories: string[];
}

interface Tool {
  id: string;                         // Tool identifier
  name: string;                       // Tool name
  description: string;                // Tool description
  icon: string;                       // Tool icon
  category: 'research' | 'knowledge' | 'analysis' | 'regulatory' | 'clinical';
  subcategory?: string;               // Tool subcategory
  enabled: boolean;                   // Tool enabled status
  metadata: {                         // Tool metadata
    apiLimit?: number;                // API rate limit
    cacheEnabled?: boolean;           // Caching enabled
    cacheDuration?: number;           // Cache duration in minutes
    requiresAuth?: boolean;           // Authentication required
    dataSource?: string;              // Data source
    lastUpdated?: string;             // Last update timestamp
  };
  agentCompatibility?: string[];      // Compatible agent IDs
}
```

#### Example Request

```http
GET /api/tools?category=research&agentId=cardiology-expert
Authorization: Bearer <your-token>
```

#### Example Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "tools": [
    {
      "id": "pubmed-search",
      "name": "PubMed Search",
      "description": "Search medical literature database",
      "icon": "📚",
      "category": "research",
      "subcategory": "literature",
      "enabled": true,
      "metadata": {
        "apiLimit": 1000,
        "cacheEnabled": true,
        "cacheDuration": 10,
        "requiresAuth": false,
        "dataSource": "PubMed",
        "lastUpdated": "2024-01-01T00:00:00Z"
      },
      "agentCompatibility": ["cardiology-expert", "endocrinology-expert"]
    }
  ],
  "categories": ["research", "regulatory", "analysis", "clinical"]
}
```

### 4. Execute Tool

**Endpoint:** `POST /api/tools/execute`

**Description:** Execute a specific tool with given parameters.

#### Request Body

```typescript
interface ToolExecuteRequest {
  toolId: string;                     // Tool identifier
  parameters: Record<string, any>;    // Tool parameters
  agentId?: string;                   // Agent ID (optional)
}
```

#### Response

```typescript
interface ToolExecuteResponse {
  success: boolean;
  result: any;                        // Tool execution result
  metadata: {
    toolId: string;
    executionTime: number;
    cacheHit: boolean;
    error?: string;
  };
}
```

#### Example Request

```http
POST /api/tools/execute
Content-Type: application/json
Authorization: Bearer <your-token>

{
  "toolId": "pubmed-search",
  "parameters": {
    "query": "metformin side effects",
    "maxResults": 10
  },
  "agentId": "endocrinology-expert"
}
```

#### Example Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "result": {
    "articles": [
      {
        "title": "Metformin Side Effects in Type 2 Diabetes",
        "authors": ["Smith, J.", "Doe, A."],
        "journal": "Diabetes Care",
        "year": 2023,
        "abstract": "This study examines...",
        "url": "https://pubmed.ncbi.nlm.nih.gov/12345678"
      }
    ],
    "totalResults": 150,
    "query": "metformin side effects"
  },
  "metadata": {
    "toolId": "pubmed-search",
    "executionTime": 1.2,
    "cacheHit": false
  }
}
```

## 🚨 Error Responses

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;                      // Error message
  code: string;                       // Error code
  details?: any;                      // Additional error details
  timestamp: string;                  // Error timestamp
}
```

#### Example Error Response

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Agent selection required in manual mode",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "agent",
    "message": "Agent must be provided when interactionMode is 'manual'"
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## 🔄 Rate Limiting

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/chat` | 100 requests | 1 hour |
| `/api/agents` | 1000 requests | 1 hour |
| `/api/tools` | 1000 requests | 1 hour |
| `/api/tools/execute` | 500 requests | 1 hour |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📊 Webhooks

### Chat Completion Webhook

**Endpoint:** `POST /api/webhooks/chat-completion`

**Description:** Receive notifications when chat responses are completed.

#### Webhook Payload

```typescript
interface ChatCompletionWebhook {
  event: 'chat.completed';
  data: {
    sessionId: string;
    messageId: string;
    agentId: string;
    processingTime: number;
    toolsUsed: string[];
    success: boolean;
    error?: string;
  };
  timestamp: string;
}
```

## 🔧 SDK Examples

### JavaScript/TypeScript

```typescript
import { VITALAskExpertClient } from '@vital/ask-expert-sdk';

const client = new VITALAskExpertClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.vital-path.com'
});

// Send a message
const response = await client.chat({
  message: 'What are the side effects of metformin?',
  userId: 'user123',
  sessionId: 'session456',
  agent: {
    id: 'endocrinology-expert',
    // ... agent details
  },
  interactionMode: 'manual',
  selectedTools: ['pubmed-search', 'fda-database']
});

console.log(response.message.content);
```

### Python

```python
from vital_ask_expert import VITALAskExpertClient

client = VITALAskExpertClient(
    api_key='your-api-key',
    base_url='https://api.vital-path.com'
)

# Send a message
response = client.chat(
    message='What are the side effects of metformin?',
    user_id='user123',
    session_id='session456',
    agent={
        'id': 'endocrinology-expert',
        # ... agent details
    },
    interaction_mode='manual',
    selected_tools=['pubmed-search', 'fda-database']
)

print(response.message.content)
```

## 📚 Additional Resources

- [User Guide](./USER_GUIDE_ASK_EXPERT.md)
- [Implementation Guide](./VITAL_ASK_EXPERT_IMPLEMENTATION_COMPLETE.md)
- [Tool Registry Documentation](./src/lib/services/tool-registry.ts)
- [Error Recovery Guide](./src/core/services/error-recovery.service.ts)

## 🆘 Support

For API support and questions:
- **Email**: api-support@vital-path.com
- **Documentation**: https://docs.vital-path.com
- **Status Page**: https://status.vital-path.com
