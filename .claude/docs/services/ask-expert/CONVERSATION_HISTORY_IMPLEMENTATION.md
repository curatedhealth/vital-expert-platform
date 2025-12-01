# Conversation History Implementation

**Date:** November 30, 2024
**Status:** ✅ COMPLETE
**Components:** API Route, Sidebar, Ask Expert Page, Database

---

## Overview

This document describes the implementation of conversation history persistence, title generation, and session restoration for the Ask Expert feature (Mode 1).

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Sidebar       │───▶│  Ask Expert API  │───▶│   Supabase      │
│   Component     │    │  /api/ask-expert │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                      ▲                        │
        │ CustomEvent          │                        │
        ▼                      │                        │
┌─────────────────┐    ┌──────────────────┐            │
│ Ask Expert Page │◀───│ Context Provider │◀───────────┘
└─────────────────┘    └──────────────────┘
```

### Port Architecture
- **Next.js Frontend:** Port 3000
- **API Gateway:** Port 4000
- **AI Engine (Python):** Port 8000

---

## Database Schema

### Conversations Table

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT,                           -- Generated from first message
  metadata JSONB DEFAULT '{}'::jsonb,   -- Contains agent_id, mode, is_pinned
  context JSONB DEFAULT '{}'::jsonb,    -- Contains messages array
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Fields

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Session/conversation ID |
| `user_id` | UUID | User who owns the conversation |
| `title` | TEXT | Auto-generated from first user message |
| `metadata.agent_id` | UUID | Agent ID used for this conversation |
| `metadata.mode` | TEXT | Mode indicator (e.g., "mode1") |
| `metadata.is_pinned` | BOOLEAN | User pinned for quick access |
| `context.messages` | JSONB[] | Array of `{role, content}` objects |

---

## Implementation Details

### 1. Title Generation

**Location:** `apps/vital-system/src/app/api/ask-expert/route.ts` (line ~490)

```typescript
const generateTitle = (message: string): string => {
  // Remove extra whitespace and truncate
  const cleaned = message.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 50) return cleaned;
  // Truncate at word boundary if possible
  const truncated = cleaned.substring(0, 50);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 30 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};
```

**Behavior:**
- Extracts first 50 characters from the user's first message
- Truncates at word boundary to avoid cutting mid-word
- Appends `...` if truncated
- Only generates title for NEW conversations (existing ones keep their title)

### 2. Conversation Persistence (saveConversation)

**Location:** `apps/vital-system/src/app/api/ask-expert/route.ts` (line ~484-565)

**Upsert Pattern:**
```typescript
async function saveConversation(...) {
  // Check if conversation exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('id, context')
    .eq('id', sessionId)
    .single();

  if (existing) {
    // UPDATE: Append messages to existing context
    const existingMessages = existing.context?.messages || [];
    const updatedMessages = [...existingMessages, ...newMessages];

    await supabase.from('conversations').update({
      context: { messages: updatedMessages },
      updated_at: new Date().toISOString(),
    }).eq('id', sessionId);
  } else {
    // INSERT: Create new conversation with generated title
    const title = generateTitle(userMessage);

    await supabase.from('conversations').insert({
      id: sessionId,
      user_id: userId,
      title: title,
      metadata: { agent_id: agentId },
      context: { messages: newMessages },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Also save to chat_messages for backwards compatibility
  await supabase.from('chat_messages').insert([...]);
}
```

### 3. API Conversation Fetching

**GET `/api/ask-expert`**

#### Fetch All Sessions (Sidebar)
```typescript
// Query parameters: userId
GET /api/ask-expert?userId=<uuid>

// Response
{
  "success": true,
  "sessions": [
    {
      "id": "uuid",
      "title": "How do I analyze clinical...",
      "metadata": { "agent_id": "uuid" },
      "agent": { "id": "uuid", "name": "...", "avatar_url": "..." },
      "created_at": "2024-11-30T...",
      "updated_at": "2024-11-30T..."
    }
  ]
}
```

#### Fetch Single Conversation (Page Load)
```typescript
// Query parameters: conversationId
GET /api/ask-expert?conversationId=<uuid>

// Response
{
  "success": true,
  "conversation": {
    "id": "uuid",
    "title": "How do I analyze clinical...",
    "metadata": { "agent_id": "uuid" },
    "context": {
      "messages": [
        { "role": "user", "content": "How do I analyze..." },
        { "role": "assistant", "content": "I'd be happy to help..." }
      ]
    },
    "agent": { "id": "uuid", "name": "...", "avatar_url": "..." },
    "created_at": "2024-11-30T...",
    "updated_at": "2024-11-30T..."
  }
}
```

### 4. Sidebar-to-Page Communication

**Problem:** Sidebar and Page are separate components with different state.

**Solution:** CustomEvent pattern for cross-component communication.

#### Sidebar Click Handler
**Location:** `apps/vital-system/src/components/sidebar-ask-expert.tsx`

```typescript
const handleSessionClick = (session: AskExpertSession) => {
  // Dispatch event for page to handle
  const event = new CustomEvent('ask-expert:open-chat', {
    detail: { sessionId: session.id, agent: session.agent }
  });
  window.dispatchEvent(event);
};
```

#### Page Event Listener
**Location:** `apps/vital-system/src/app/(app)/ask-expert/page.tsx`

```typescript
useEffect(() => {
  const handleOpenChatEvent = async (e: CustomEvent) => {
    const { sessionId, agent } = e.detail;

    // Fetch full conversation from API
    const response = await fetch(`/api/ask-expert?conversationId=${sessionId}`);
    const data = await response.json();

    if (data.success && data.conversation) {
      // Extract messages from context
      const messages = data.conversation.context?.messages || [];

      // Update page state
      setSelectedAgent(agent || data.conversation.agent);
      setMessages(messages);
      setCurrentSessionId(sessionId);
    }
  };

  window.addEventListener('ask-expert:open-chat', handleOpenChatEvent);
  return () => window.removeEventListener('ask-expert:open-chat', handleOpenChatEvent);
}, []);
```

### 5. Session Interface

**Location:** `apps/vital-system/src/contexts/ask-expert-context.tsx`

```typescript
export interface AskExpertSession {
  id: string;
  title?: string;        // Added for conversation topic display
  agent?: {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    avatar_url?: string;
  };
  metadata?: {
    agent_id?: string;
    mode?: string;
    is_pinned?: boolean;
  };
  created_at: string;
  updated_at?: string;
}
```

---

## User Flow

### Starting a New Conversation

1. User selects agent and sends message
2. API creates new session UUID
3. Message sent to AI Engine for processing
4. On response, `saveConversation()` is called:
   - Generates title from user's first message
   - Creates new row in `conversations` table
   - Also saves to `chat_messages` for backwards compatibility
5. Sidebar auto-refreshes to show new session with title

### Resuming an Existing Conversation

1. User clicks session in sidebar
2. Sidebar dispatches `ask-expert:open-chat` CustomEvent
3. Page receives event, extracts `sessionId`
4. Page fetches full conversation: `GET /api/ask-expert?conversationId=...`
5. API returns conversation with all messages from `context.messages`
6. Page updates state with messages and agent info
7. User can continue chatting (messages appended to existing context)

---

## Files Modified

| File | Changes |
|------|---------|
| `apps/vital-system/src/app/api/ask-expert/route.ts` | Added `conversationId` param, title generation, upsert logic |
| `apps/vital-system/src/contexts/ask-expert-context.tsx` | Added `title` field to interface |
| `apps/vital-system/src/components/sidebar-ask-expert.tsx` | Event dispatch, title display |
| `apps/vital-system/src/app/(app)/ask-expert/page.tsx` | Event listener, conversation restoration |

---

## Testing Checklist

- [x] New conversations create title from first message
- [x] Title displays in sidebar instead of "Ask Expert"
- [x] Clicking session in sidebar loads full conversation
- [x] Messages appear in correct order (user, assistant alternating)
- [x] Agent info (name, avatar) loads when opening session
- [x] Sending new message in existing conversation appends to history
- [x] Sessions persist across page reloads

---

## Known Limitations

1. **Title is static:** Once generated, title doesn't update as conversation evolves
2. **No title editing:** Users cannot manually rename conversations
3. **Backward compatibility:** Old sessions without titles show agent name or "Consultation"

---

## Future Enhancements

1. **AI-generated titles:** Use LLM to generate descriptive title after 3+ messages
2. **Title editing:** Allow users to rename conversations
3. **Search:** Full-text search across conversation history
4. **Export:** Download conversation as PDF/Markdown
