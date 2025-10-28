# User Agents Management System

## Overview
This system manages which agents each user has access to in the Ask Expert sidebar. Users can add agents from the agent store, and only those agents (plus any they create) will appear in their Ask Expert sidebar.

## Database Schema

### `user_agents` Table
```sql
CREATE TABLE user_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  original_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  is_user_copy BOOLEAN NOT NULL DEFAULT false,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);
```

## API Endpoints

### POST `/api/user-agents`
Add an agent to a user's list.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "agentId": "agent-uuid",
  "originalAgentId": "original-agent-uuid", // optional, for user copies
  "isUserCopy": true
}
```

### GET `/api/user-agents?userId=user-uuid`
Get all agents that a user has added to their list.

**Response:**
```json
{
  "success": true,
  "agents": [
    {
      "id": "relationship-uuid",
      "agent_id": "agent-uuid",
      "original_agent_id": "original-agent-uuid",
      "is_user_copy": true,
      "added_at": "2024-01-01T00:00:00Z",
      "agents": {
        "id": "agent-uuid",
        "name": "agent-name",
        "display_name": "Agent Display Name",
        "description": "Agent description",
        "avatar_url": "avatar-url",
        "tier": 1,
        "status": "active",
        "capabilities": ["capability1", "capability2"]
      }
    }
  ]
}
```

### DELETE `/api/user-agents`
Remove an agent from a user's list.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "agentId": "agent-uuid"
}
```

## User Flow

### 1. Agent Store (`/agents`)
- Shows **all available agents** (unfiltered)
- User clicks **"Add to Chat"** button
- System creates **user copy** (if needed)
- **Stores relationship** in `user_agents` table
- **Navigates to Ask Expert** page

### 2. Ask Expert Sidebar (`/ask-expert`)
- **Fetches only user's agents** from `user_agents` table
- **Shows filtered list** of user-added/created agents
- **Updates automatically** when user adds new agents
- **Persists across sessions** and devices

## Security

- **Row Level Security (RLS)** enabled on `user_agents` table
- Users can only view/modify their own agent relationships
- Admin clients bypass RLS for system operations

## Testing

Run the test script:
```bash
./scripts/test-user-agents-api.sh
```

Manual testing:
1. Go to `/agents` page
2. Click "Add to Chat" on any agent
3. Navigate to `/ask-expert`
4. Verify the agent appears in the sidebar
5. Check browser console for success messages

## Benefits

- ✅ **Proper Database Storage**: No localStorage dependency
- ✅ **Multi-User Support**: Each user has their own agent list
- ✅ **Data Persistence**: Agents persist across sessions/devices
- ✅ **Real-Time Updates**: Sidebar updates when agents are added
- ✅ **Security**: RLS policies protect user data
- ✅ **Scalability**: Works with any number of users and agents
