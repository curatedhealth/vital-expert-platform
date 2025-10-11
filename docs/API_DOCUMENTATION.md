# VITAL AI API Documentation

## Overview

This document provides comprehensive API documentation for the VITAL AI chat service, including all endpoints, request/response formats, authentication, and usage examples.

## Table of Contents

1. [Authentication](#authentication)
2. [Base URLs](#base-urls)
3. [Core Chat Endpoints](#core-chat-endpoints)
4. [Agent Management](#agent-management)
5. [RAG System](#rag-system)
6. [Memory Management](#memory-management)
7. [Monitoring & Metrics](#monitoring--metrics)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Webhooks](#webhooks)

## Authentication

### API Key Authentication

All API requests require authentication using an API key:

```http
Authorization: Bearer <your-api-key>
```

### Session-Based Authentication

For web applications, session-based authentication is supported:

```http
Cookie: session=<session-token>
```

## Base URLs

- **Production**: `https://api.vital-ai.com`
- **Staging**: `https://staging-api.vital-ai.com`
- **Development**: `http://localhost:3001`

## Core Chat Endpoints

### 1. Standard Chat

**Endpoint**: `POST /api/chat`

**Description**: Main chat endpoint with automatic agent selection and routing.

**Request Body**:
```json
{
  "message": "What are the FDA requirements for medical device software?",
  "mode": "automatic",
  "context": {
    "user_id": "user_123",
    "session_id": "session_456",
    "compliance_level": "hipaa",
    "audit_required": true
  },
  "options": {
    "stream": true,
    "max_tokens": 2000,
    "temperature": 0.7
  }
}
```

**Response** (Streaming):
```json
{
  "id": "chat_789",
  "message": "Based on FDA guidelines for medical device software...",
  "agent": {
    "name": "regulatory-expert",
    "confidence": 0.92,
    "tier": "expert"
  },
  "sources": [
    {
      "title": "FDA Software Guidance",
      "url": "https://fda.gov/...",
      "relevance": 0.95
    }
  ],
  "metadata": {
    "response_time": 1.2,
    "tokens_used": 150,
    "compliance_checked": true
  }
}
```

### 2. Autonomous Chat

**Endpoint**: `POST /api/chat/autonomous`

**Description**: Advanced chat with full LangChain agents, tools, and long-term memory.

**Request Body**:
```json
{
  "message": "Help me develop a clinical trial protocol for a new diabetes medication",
  "context": {
    "user_id": "user_123",
    "project_id": "project_456",
    "compliance_level": "fda"
  },
  "tools": ["fda-tools", "clinical-trials-tools", "research-tools"],
  "memory": {
    "enable_long_term": true,
    "enable_learning": true
  }
}
```

**Response**:
```json
{
  "id": "autonomous_789",
  "message": "I'll help you develop a comprehensive clinical trial protocol...",
  "agent": {
    "name": "clinical-research-specialist",
    "tools_used": ["fda-tools", "clinical-trials-tools"],
    "reasoning": "Analyzing FDA requirements and best practices..."
  },
  "actions": [
    {
      "type": "tool_call",
      "tool": "fda-tools",
      "action": "search_guidance",
      "result": "Found relevant FDA guidance documents"
    }
  ],
  "memory": {
    "learned_patterns": ["diabetes_trial_protocol"],
    "user_preferences": ["detailed_explanations", "regulatory_focus"]
  }
}
```

### 3. Enhanced Chat

**Endpoint**: `POST /api/chat/enhanced`

**Description**: Intelligent multi-agent collaboration with advanced orchestration.

**Request Body**:
```json
{
  "message": "I need a comprehensive strategy for bringing a new medical device to market",
  "context": {
    "user_id": "user_123",
    "complexity": "high",
    "domains": ["regulatory", "clinical", "business", "technical"]
  },
  "collaboration": {
    "strategy": "consensus",
    "max_agents": 5,
    "synthesis_method": "hierarchical"
  }
}
```

**Response**:
```json
{
  "id": "enhanced_789",
  "message": "Here's a comprehensive market entry strategy...",
  "collaboration": {
    "agents_used": [
      "regulatory-expert",
      "clinical-specialist", 
      "business-analyst",
      "technical-architect"
    ],
    "strategy": "consensus",
    "conflicts_resolved": 2,
    "synthesis_method": "hierarchical"
  },
  "sections": {
    "regulatory": "FDA submission pathway and requirements...",
    "clinical": "Clinical trial design and endpoints...",
    "business": "Market analysis and go-to-market strategy...",
    "technical": "Technical specifications and validation..."
  },
  "follow_up_questions": [
    "What's your target market size?",
    "Do you have existing clinical data?",
    "What's your timeline for market entry?"
  ]
}
```

### 4. Orchestrator Chat

**Endpoint**: `POST /api/chat/orchestrator`

**Description**: Contextual chat with compliance-aware orchestration.

**Request Body**:
```json
{
  "message": "Review our data privacy practices for GDPR compliance",
  "context": {
    "user_id": "user_123",
    "compliance_level": "gdpr",
    "audit_required": true,
    "data_types": ["patient_data", "research_data"]
  }
}
```

**Response**:
```json
{
  "id": "orchestrator_789",
  "message": "I've reviewed your data privacy practices...",
  "compliance": {
    "gdpr_score": 0.87,
    "violations_found": 2,
    "recommendations": [
      "Implement data minimization",
      "Update consent mechanisms"
    ]
  },
  "audit_trail": {
    "reviewed_areas": ["data_processing", "consent_management", "data_retention"],
    "compliance_checks": 15,
    "risk_assessment": "medium"
  }
}
```

## Agent Management

### 1. List Available Agents

**Endpoint**: `GET /api/agents`

**Description**: Get list of available agents with their capabilities.

**Response**:
```json
{
  "agents": [
    {
      "id": "regulatory-expert",
      "name": "Regulatory Expert",
      "type": "specialist",
      "tier": "expert",
      "capabilities": [
        "fda_compliance",
        "regulatory_submissions",
        "quality_systems"
      ],
      "domains": ["regulatory", "compliance"],
      "confidence_threshold": 0.8,
      "status": "active"
    }
  ]
}
```

### 2. Get Agent Details

**Endpoint**: `GET /api/agents/{agent_id}`

**Description**: Get detailed information about a specific agent.

**Response**:
```json
{
  "id": "regulatory-expert",
  "name": "Regulatory Expert",
  "description": "Specialized in FDA regulations and compliance",
  "capabilities": {
    "fda_compliance": {
      "level": "expert",
      "description": "FDA regulatory compliance expertise"
    }
  },
  "performance": {
    "accuracy": 0.94,
    "response_time": 1.2,
    "user_satisfaction": 0.91
  },
  "tools": ["fda-tools", "compliance-tools"],
  "memory": {
    "short_term": true,
    "long_term": true,
    "learning": true
  }
}
```

### 3. Agent Performance Metrics

**Endpoint**: `GET /api/agents/{agent_id}/metrics`

**Description**: Get performance metrics for a specific agent.

**Query Parameters**:
- `time_range`: Time range for metrics (e.g., "1h", "24h", "7d")
- `metric_type`: Type of metrics to retrieve

**Response**:
```json
{
  "agent_id": "regulatory-expert",
  "time_range": "24h",
  "metrics": {
    "response_time": {
      "avg": 1.2,
      "p95": 2.1,
      "p99": 3.5
    },
    "accuracy": 0.94,
    "confidence": 0.89,
    "throughput": 45.2,
    "error_rate": 0.02
  }
}
```

## RAG System

### 1. Enhanced RAG Query

**Endpoint**: `POST /api/rag/enhanced`

**Description**: Advanced RAG query with multiple retrieval strategies.

**Request Body**:
```json
{
  "query": "What are the latest FDA guidelines for AI in medical devices?",
  "strategies": ["vector_search", "hybrid_search", "multi_query"],
  "filters": {
    "document_types": ["guidance", "regulation"],
    "date_range": "2023-01-01:2024-01-01",
    "domains": ["ai", "medical_devices"]
  },
  "options": {
    "max_results": 10,
    "rerank": true,
    "include_metadata": true
  }
}
```

**Response**:
```json
{
  "query": "What are the latest FDA guidelines for AI in medical devices?",
  "results": [
    {
      "title": "FDA Guidance on AI/ML in Medical Devices",
      "content": "The FDA has issued new guidance...",
      "relevance_score": 0.95,
      "metadata": {
        "document_type": "guidance",
        "date": "2023-12-01",
        "source": "fda.gov"
      }
    }
  ],
  "strategy_used": "hybrid_search",
  "total_results": 8,
  "search_time": 0.45
}
```

### 2. Knowledge Base Management

**Endpoint**: `POST /api/rag/knowledge-base`

**Description**: Add documents to the knowledge base.

**Request Body**:
```json
{
  "documents": [
    {
      "title": "FDA Software Guidance 2023",
      "content": "This guidance document...",
      "metadata": {
        "document_type": "guidance",
        "domain": "software",
        "date": "2023-12-01"
      }
    }
  ],
  "indexing_options": {
    "chunk_size": 1000,
    "overlap": 200,
    "embedding_model": "text-embedding-ada-002"
  }
}
```

**Response**:
```json
{
  "status": "success",
  "documents_processed": 1,
  "indexing_time": 2.3,
  "document_ids": ["doc_123"]
}
```

## Memory Management

### 1. Get User Memory

**Endpoint**: `GET /api/memory/{user_id}`

**Description**: Retrieve user's memory and context.

**Query Parameters**:
- `memory_type`: Type of memory to retrieve (short_term, long_term, all)
- `limit`: Maximum number of memories to return

**Response**:
```json
{
  "user_id": "user_123",
  "memories": {
    "short_term": [
      {
        "id": "mem_456",
        "content": "User is working on diabetes medication clinical trial",
        "timestamp": "2024-01-15T10:30:00Z",
        "relevance": 0.9
      }
    ],
    "long_term": [
      {
        "id": "mem_789",
        "content": "User prefers detailed regulatory explanations",
        "timestamp": "2024-01-01T00:00:00Z",
        "type": "preference"
      }
    ]
  },
  "learned_patterns": [
    "diabetes_research_focus",
    "regulatory_compliance_emphasis"
  ]
}
```

### 2. Update Memory

**Endpoint**: `POST /api/memory/{user_id}`

**Description**: Update or add to user's memory.

**Request Body**:
```json
{
  "memory_type": "long_term",
  "content": "User is interested in FDA breakthrough device designation",
  "metadata": {
    "domain": "regulatory",
    "importance": "high",
    "tags": ["breakthrough", "fda", "device"]
  }
}
```

**Response**:
```json
{
  "status": "success",
  "memory_id": "mem_101112",
  "timestamp": "2024-01-15T11:00:00Z"
}
```

## Monitoring & Metrics

### 1. System Metrics

**Endpoint**: `GET /api/metrics`

**Description**: Get Prometheus-formatted system metrics.

**Response**: Prometheus metrics format

### 2. Healthcare Metrics

**Endpoint**: `GET /api/healthcare-metrics`

**Description**: Get healthcare-specific metrics.

**Response**: Prometheus metrics format

### 3. Agent Metrics

**Endpoint**: `GET /api/agent-metrics`

**Description**: Get agent performance metrics.

**Response**: Prometheus metrics format

### 4. RAG Metrics

**Endpoint**: `GET /api/rag-metrics`

**Description**: Get RAG system metrics.

**Response**: Prometheus metrics format

### 5. Security Metrics

**Endpoint**: `GET /api/security-metrics`

**Description**: Get security and compliance metrics.

**Response**: Prometheus metrics format

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request body is invalid",
    "details": {
      "field": "message",
      "reason": "required field is missing"
    },
    "request_id": "req_123456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Invalid request format or parameters |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

### Rate Limits

- **Standard Chat**: 100 requests/minute per user
- **Autonomous Chat**: 50 requests/minute per user
- **Enhanced Chat**: 30 requests/minute per user
- **RAG Queries**: 200 requests/minute per user
- **Metrics**: 1000 requests/minute per user

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Webhooks

### 1. Chat Completion Webhook

**Endpoint**: `POST /api/webhooks/chat-completion`

**Description**: Webhook triggered when a chat conversation is completed.

**Payload**:
```json
{
  "event": "chat.completed",
  "data": {
    "chat_id": "chat_123",
    "user_id": "user_456",
    "agent": "regulatory-expert",
    "duration": 1.2,
    "tokens_used": 150,
    "satisfaction_score": 0.9
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Compliance Alert Webhook

**Endpoint**: `POST /api/webhooks/compliance-alert`

**Description**: Webhook triggered when compliance violations are detected.

**Payload**:
```json
{
  "event": "compliance.violation",
  "data": {
    "violation_type": "phi_access",
    "severity": "high",
    "user_id": "user_456",
    "details": "Unauthorized PHI access attempt",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @vital-ai/sdk
```

```typescript
import { VitalAI } from '@vital-ai/sdk';

const client = new VitalAI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.vital-ai.com'
});

const response = await client.chat.send({
  message: 'What are FDA requirements?',
  mode: 'automatic'
});
```

### Python

```bash
pip install vital-ai-sdk
```

```python
from vital_ai import VitalAI

client = VitalAI(api_key='your-api-key')

response = client.chat.send(
    message='What are FDA requirements?',
    mode='automatic'
)
```

## Support

For API support and questions:

- **Documentation**: https://docs.vital-ai.com
- **Support Email**: support@vital-ai.com
- **Status Page**: https://status.vital-ai.com
- **Community Forum**: https://community.vital-ai.com
