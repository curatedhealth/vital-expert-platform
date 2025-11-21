# Conversations API Documentation

## Overview

The Conversations API provides CRUD operations for managing user conversations, replacing localStorage-based persistence with database-backed storage.

**Base URL:** `/api/conversations`

---

## Endpoints

### GET `/api/conversations?userId={userId}`

Get all conversations for a user.

**Query Parameters:**
- `userId` (required, UUID): The user ID

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "uuid",
      "title": "Conversation Title",
      "messages": [
        {
          "role": "user",
          "content": "Hello",
          "timestamp": 1234567890
        }
      ],
      "createdAt": 1234567890,
      "updatedAt": 1234567890,
      "isPinned": false,
      "userId": "user-uuid",
      "agentId": "agent-uuid",
      "mode": "mode_1_interactive_manual"
    }
  ],
  "count": 1,
  "requestId": "req_xxx"
}
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Missing or invalid userId
- `500 Internal Server Error`: Server error

---

### POST `/api/conversations`

Create a new conversation.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "title": "New Conversation",
  "messages": [],
  "agentId": "agent-uuid",
  "mode": "mode_1_interactive_manual",
  "isPinned": false
}
```

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": "conversation-uuid",
    "title": "New Conversation",
    "messages": [],
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  },
  "message": "Conversation created successfully",
  "requestId": "req_xxx"
}
```

**Status Codes:**
- `201 Created`: Success
- `400 Bad Request`: Missing or invalid userId
- `500 Internal Server Error`: Server error

---

### PUT `/api/conversations`

Update an existing conversation.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "conversationId": "conversation-uuid",
  "title": "Updated Title",
  "messages": [...],
  "isPinned": true
}
```

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": "conversation-uuid",
    "title": "Updated Title",
    "messages": [...],
    "updatedAt": 1234567890
  },
  "message": "Conversation updated successfully",
  "requestId": "req_xxx"
}
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Missing userId or conversationId
- `404 Not Found`: Conversation not found or user doesn't own it
- `500 Internal Server Error`: Server error

---

### DELETE `/api/conversations`

Delete a conversation.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "conversationId": "conversation-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully",
  "requestId": "req_xxx"
}
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Missing userId or conversationId
- `404 Not Found`: Conversation not found
- `500 Internal Server Error`: Server error

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "requestId": "req_xxx",
  "context": {
    "additional": "context"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `DATABASE_ERROR`: Database operation failed
- `PERMISSION_DENIED`: User doesn't have permission

---

## Rate Limiting

- **Rate Limit:** 100 requests per minute per user
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## Authentication

Currently, userId is passed in the request body/query. Future versions will use JWT tokens in the `Authorization` header.

---

## Examples

### Fetch User Conversations

```typescript
const response = await fetch('/api/conversations?userId=user-123');
const data = await response.json();
console.log(data.conversations);
```

### Create Conversation

```typescript
const response = await fetch('/api/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    title: 'New Conversation',
    messages: [],
  }),
});
const data = await response.json();
```

### Update Conversation

```typescript
const response = await fetch('/api/conversations', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    conversationId: 'conv-123',
    title: 'Updated Title',
    messages: [...],
  }),
});
```

---

## Changelog

### v1.0.0 (2025-01-29)
- Initial API release
- Full CRUD operations
- localStorage migration support

