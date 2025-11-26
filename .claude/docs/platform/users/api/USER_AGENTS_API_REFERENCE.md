# User Agents API Documentation

**Version**: 3.0.0  
**Last Updated**: November 25, 2025  
**Status**: Active  
**Type**: API Reference

---

## Overview

The User Agents API provides endpoints for managing user-agent relationships, including adding agents, tracking usage, and customizing agent settings.

**Base URL**: `/api/user-agents`  
**Authentication**: Required (Supabase Auth)  
**Rate Limiting**: 100 requests/minute per user

---

## Endpoints

### POST /api/user-agents
Add an agent to user's list

**Request Body:**
```typescript
{
  agentId: string;          // Required: Agent ID
  source?: string;          // Optional: 'store' | 'custom' | 'imported'
  folder?: string;          // Optional: Folder name
  customName?: string;      // Optional: Custom name
  isUserCopy?: boolean;     // Optional: Is this a copy?
  originalAgentId?: string; // Optional: Original agent ID if copy
}
```

**Response: 201 Created**
```typescript
{
  success: true;
  data: {
    id: string;
    user_id: string;
    agent_id: string;
    custom_name: string | null;
    folder: string | null;
    added_at: string;
    // ... other fields
  };
}
```

**Example:**
```typescript
const response = await fetch('/api/user-agents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    agentId: 'agent-uuid',
    source: 'store',
    folder: 'My Agents',
    customName: 'My FDA Expert'
  })
});
```

---

### GET /api/user-agents
Get user's agents

**Query Parameters:**
```typescript
folder?: string;          // Filter by folder
is_favorite?: boolean;    // Only favorites
status?: string;          // Filter by status
include_details?: boolean; // Include agent details (uses view)
```

**Response: 200 OK**
```typescript
{
  success: true;
  data: Array<{
    id: string;
    user_id: string;
    agent_id: string;
    custom_name: string | null;
    folder: string | null;
    tags: string[];
    is_favorite: boolean;
    is_pinned: boolean;
    usage_count: number;
    // ... other fields
    agent?: {              // If include_details=true
      name: string;
      description: string;
      avatar_url: string;
      // ... agent fields
    }
  }>;
}
```

**Examples:**
```typescript
// Get all agents
const response = await fetch('/api/user-agents');

// Get favorites only
const response = await fetch('/api/user-agents?is_favorite=true');

// Get by folder
const response = await fetch('/api/user-agents?folder=Clinical%20Trials');

// Get with details
const response = await fetch('/api/user-agents?include_details=true');
```

---

### PATCH /api/user-agents/:id
Update user-agent relationship

**Request Body:**
```typescript
{
  custom_name?: string;
  custom_description?: string;
  custom_avatar?: string;
  custom_color?: string;
  folder?: string;
  tags?: string[];
  is_favorite?: boolean;
  is_pinned?: boolean;
  sort_order?: number;
  settings?: object;
  preferences?: object;
  notes?: string;
}
```

**Response: 200 OK**
```typescript
{
  success: true;
  data: {
    id: string;
    // ... updated fields
  };
}
```

**Example:**
```typescript
const response = await fetch(`/api/user-agents/${id}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    is_favorite: true,
    folder: 'Priority Agents',
    custom_name: 'Quick FDA Helper'
  })
});
```

---

### DELETE /api/user-agents/:id
Soft delete user-agent relationship

**Response: 200 OK**
```typescript
{
  success: true;
  message: 'Agent removed successfully';
}
```

**Example:**
```typescript
const response = await fetch(`/api/user-agents/${id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

### POST /api/user-agents/:id/restore
Restore soft-deleted agent

**Response: 200 OK**
```typescript
{
  success: true;
  data: {
    id: string;
    deleted_at: null;
    // ... other fields
  };
}
```

---

### POST /api/user-agents/:id/track-usage
Track agent usage

**Request Body:**
```typescript
{
  success: boolean;         // Required: Was interaction successful?
  tokens_used?: number;     // Optional: Tokens consumed
  cost_usd?: number;        // Optional: Cost in USD
  response_time_ms?: number; // Optional: Response time
}
```

**Response: 200 OK**
```typescript
{
  success: true;
  data: {
    usage_count: number;
    success_count: number;
    error_count: number;
    total_tokens_used: number;
    total_cost_usd: number;
    quality_score: number;
  };
}
```

**Example:**
```typescript
const response = await fetch(`/api/user-agents/${id}/track-usage`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    success: true,
    tokens_used: 1500,
    cost_usd: 0.02,
    response_time_ms: 1200
  })
});
```

---

### POST /api/user-agents/:id/rate
Rate an agent

**Request Body:**
```typescript
{
  rating: number;  // Required: 1-5 stars
}
```

**Response: 200 OK**
```typescript
{
  success: true;
  data: {
    user_rating: number;
    quality_score: number;
    last_rating_at: string;
  };
}
```

---

## React Query Hooks

### useUserAgents()

```typescript
import { useUserAgents } from '@/lib/hooks/use-user-agents';

function MyComponent() {
  const {
    data: userAgents,
    isLoading,
    error,
    addAgentAsync,
    removeAgentAsync,
    updateAgentAsync,
    trackUsageAsync
  } = useUserAgents(userId);
  
  return (
    // ... render agents
  );
}
```

### Adding an Agent

```typescript
const { addAgentAsync } = useUserAgents(userId);

await addAgentAsync({
  agentId: 'agent-uuid',
  options: {
    source: 'store',
    folder: 'My Agents',
    customName: 'Quick Helper'
  }
});
```

### Updating an Agent

```typescript
const { updateAgentAsync } = useUserAgents(userId);

await updateAgentAsync({
  userAgentId: 'user-agent-uuid',
  updates: {
    is_favorite: true,
    folder: 'Favorites'
  }
});
```

### Tracking Usage

```typescript
const { trackUsageAsync } = useUserAgents(userId);

await trackUsageAsync({
  userAgentId: 'user-agent-uuid',
  success: true,
  tokens: 1500,
  cost: 0.02
});
```

### Removing an Agent

```typescript
const { removeAgentAsync } = useUserAgents(userId);

await removeAgentAsync('user-agent-uuid');
```

---

## Direct Supabase Client Usage

### Get User's Agents

```typescript
const { data, error } = await supabase
  .from('user_agents')
  .select('*')
  .eq('user_id', userId)
  .is('deleted_at', null)
  .order('is_pinned', { ascending: false })
  .order('sort_order');
```

### Get with Agent Details (Using View)

```typescript
const { data, error } = await supabase
  .from('user_agents_with_details')
  .select('*')
  .eq('user_id', userId);
```

### Add Agent

```typescript
const { data, error } = await supabase
  .from('user_agents')
  .insert({
    user_id: userId,
    agent_id: agentId,
    source: 'store',
    folder: 'My Agents'
  })
  .select()
  .single();
```

### Update Agent

```typescript
const { data, error } = await supabase
  .from('user_agents')
  .update({
    is_favorite: true,
    custom_name: 'My Expert'
  })
  .eq('id', userAgentId)
  .eq('user_id', userId)
  .select()
  .single();
```

### Soft Delete

```typescript
const { error } = await supabase
  .from('user_agents')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', userAgentId)
  .eq('user_id', userId);
```

### Search by Tags

```typescript
const { data, error } = await supabase
  .from('user_agents')
  .select('*')
  .eq('user_id', userId)
  .overlaps('tags', ['medical', 'urgent']);
```

---

## Using Helper Functions

### add_user_agent()

```typescript
const { data, error } = await supabase.rpc('add_user_agent', {
  p_user_id: userId,
  p_agent_id: agentId,
  p_source: 'store',
  p_folder: 'My Agents'
});
```

### track_agent_usage()

```typescript
const { data, error } = await supabase.rpc('track_agent_usage', {
  p_user_id: userId,
  p_agent_id: agentId,
  p_success: true,
  p_tokens_used: 1500,
  p_cost_usd: 0.02,
  p_response_time_ms: 1200
});
```

### soft_delete_user_agent()

```typescript
const { data, error } = await supabase.rpc('soft_delete_user_agent', {
  p_user_id: userId,
  p_agent_id: agentId
});
```

### restore_user_agent()

```typescript
const { data, error } = await supabase.rpc('restore_user_agent', {
  p_user_id: userId,
  p_agent_id: agentId
});
```

---

## Error Handling

### Common Errors

**409 Conflict - Agent Already Added**
```json
{
  "error": "Agent already added to your list",
  "code": "DUPLICATE_AGENT"
}
```

**404 Not Found - Agent Not Found**
```json
{
  "error": "Agent not found",
  "code": "AGENT_NOT_FOUND"
}
```

**401 Unauthorized**
```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**400 Bad Request - Invalid Data**
```json
{
  "error": "Invalid agent ID",
  "code": "INVALID_INPUT"
}
```

### Error Handling Example

```typescript
try {
  const response = await fetch('/api/user-agents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ agentId })
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    if (error.code === 'DUPLICATE_AGENT') {
      toast.error('You already have this agent!');
    } else if (error.code === 'AGENT_NOT_FOUND') {
      toast.error('Agent not found');
    } else {
      toast.error('Failed to add agent');
    }
    
    return;
  }
  
  const { data } = await response.json();
  toast.success('Agent added successfully!');
  
} catch (error) {
  console.error('Network error:', error);
  toast.error('Connection failed');
}
```

---

## Rate Limiting

**Limits:**
- 100 requests/minute per user
- 1000 requests/hour per user

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

**429 Response:**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

---

## TypeScript Types

```typescript
// User-Agent Relationship
interface UserAgent {
  id: string;
  user_id: string;
  agent_id: string;
  original_agent_id: string | null;
  is_user_copy: boolean;
  
  // Customization
  custom_name: string | null;
  custom_description: string | null;
  custom_avatar: string | null;
  custom_color: string | null;
  custom_system_prompt: string | null;
  custom_temperature: number | null;
  custom_max_tokens: number | null;
  
  // Organization
  is_favorite: boolean;
  is_pinned: boolean;
  folder: string | null;
  tags: string[];
  sort_order: number;
  display_position: string | null;
  
  // Usage
  usage_count: number;
  message_count: number;
  conversation_count: number;
  success_count: number;
  error_count: number;
  
  // Quality
  user_rating: number | null;
  quality_score: number | null;
  last_rating_at: string | null;
  
  // Performance
  avg_response_time_ms: number | null;
  total_tokens_used: number;
  total_cost_usd: number;
  
  // Timestamps
  added_at: string;
  first_used_at: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  deleted_at: string | null;
  
  // State
  is_active: boolean;
  is_enabled: boolean;
  is_visible: boolean;
  status: 'active' | 'paused' | 'archived' | 'disabled';
  
  // Config
  settings: Record<string, any>;
  preferences: Record<string, any>;
  ui_config: Record<string, any>;
  
  // Notifications
  notifications_enabled: boolean;
  notification_settings: Record<string, any>;
  
  // Context
  last_conversation_id: string | null;
  notes: string | null;
  quick_notes: string | null;
  
  // Metadata
  metadata: Record<string, any>;
  source: 'store' | 'custom' | 'imported' | 'template' | 'recommended' | null;
  source_details: Record<string, any>;
  
  // Collaboration
  is_shared: boolean;
  shared_with: string[];
  team_id: string | null;
  share_settings: Record<string, any>;
}

// With Agent Details (from view)
interface UserAgentWithDetails extends UserAgent {
  agent_name: string;
  agent_display_name: string;
  agent_tagline: string;
  agent_description: string;
  agent_avatar: string;
  agent_status: string;
  usage_status: 'never_used' | 'active' | 'recent' | 'occasional' | 'inactive';
  success_rate_percent: number;
}
```

---

## Next Steps

- [Code Examples](../guides/GETTING_STARTED_GUIDE.md#common-use-cases) - Working code samples
- [Getting Started](../guides/GETTING_STARTED_GUIDE.md) - Quick start guide
- [Schema Documentation](../schema/USER_AGENTS_SCHEMA.md) - Database schema

---

**API Version**: 3.0.0  
**Last Updated**: 2025-11-25

