# Chat Store Refactoring Guide

## Overview

The monolithic `chat-store.ts` (884 lines) has been refactored into **4 focused stores** for better maintainability, testability, and separation of concerns.

## New Structure

```
lib/stores/chat/
├── index.ts (120 lines)               # Unified exports
├── chat-messages-store.ts (220 lines) # Message CRUD operations
├── chat-agents-store.ts (280 lines)   # Agent selection & management
├── chat-streaming-store.ts (180 lines) # SSE streaming & live updates
└── chat-memory-store.ts (240 lines)   # Conversation context & memory

Total: 1,040 lines across 5 files (vs 884 in one file)
Lines increased by: 18% (+156 lines)
Benefit: Each store is now <300 lines, focused on single responsibility
```

## Benefits

✅ **Better Separation of Concerns**
- Each store handles one specific domain
- Easier to understand and maintain
- Clearer responsibilities

✅ **Improved Testability**
- Test each store independently
- Mock dependencies easier
- Faster test execution

✅ **Easier Debugging**
- Smaller files to navigate
- Clear data flow
- Isolated state updates

✅ **Better Performance**
- Selective re-renders (use only what you need)
- Smaller bundle chunks
- Tree-shaking friendly

---

## Migration Path

### Option 1: Backward Compatible (Recommended)

Use the unified `useChatStore()` hook for minimal changes:

```tsx
// OLD CODE (still works!)
import { useChatStore } from '@/lib/stores/chat-store'

function ChatComponent() {
  const { messages, selectedAgent, isLoading } = useChatStore()
  // Works exactly the same!
}
```

```tsx
// NEW CODE (recommended)
import { useChatStore } from '@/lib/stores/chat'

function ChatComponent() {
  const chat = useChatStore()

  // Access specific stores
  const { messages, addMessage } = chat.messages
  const { selectedAgent } = chat.agents
  const { isLoading } = chat.streaming
}
```

### Option 2: Granular Control (Best Performance)

Use individual stores for better performance:

```tsx
// Import only what you need
import { useMessages, useAgents, useStreaming } from '@/lib/stores/chat'

function MessageList() {
  // Only re-renders when messages change
  const { messages } = useMessages()

  return (
    <div>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
    </div>
  )
}

function AgentSelector() {
  // Only re-renders when agent selection changes
  const { agents, selectedAgent, setSelectedAgent } = useAgents()

  return (
    <select value={selectedAgent?.id} onChange={e => ...}>
      {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
    </select>
  )
}
```

---

## API Comparison

### Messages Store

**OLD:**
```tsx
const {
  messages,
  currentChat,
  createNewChat,
  selectChat,
  deleteChat,
  editMessage,
} = useChatStore()
```

**NEW:**
```tsx
const {
  messages,
  currentChat,
  createNewChat,
  selectChat,
  deleteChat,
  addMessage,
  updateMessage,
  editMessage,
  deleteMessage,
} = useMessages()
```

**New Methods:**
- `addMessage(message)` - Add a message programmatically
- `updateMessage(id, updates)` - Update specific message fields
- `deleteMessage(id)` - Delete a single message
- `saveMessagesToStorage(chatId)` - Manual save
- `loadMessagesFromStorage(chatId)` - Manual load

### Agents Store

**OLD:**
```tsx
const {
  agents,
  selectedAgent,
  setSelectedAgent,
  interactionMode,
  autonomousMode,
  libraryAgents,
  addToLibrary,
} = useChatStore()
```

**NEW:**
```tsx
const {
  agents,
  selectedAgent,
  setSelectedAgent,
  interactionMode,
  autonomousMode,
  libraryAgents,
  addToLibrary,
  removeFromLibrary,
  isInLibrary,
  createCustomAgent,
  updateAgent,
  deleteAgent,
  loadAgentsFromDatabase,
  searchAgents,
} = useAgents()
```

**New Methods:**
- `updateAgent(id, updates)` - Update agent configuration
- `deleteAgent(id)` - Delete custom agent
- `searchAgents(term)` - Search agents
- `getAgentsByCategory(category)` - Filter by category
- `getAgentsByTier(tier)` - Filter by tier

### Streaming Store

**OLD:**
```tsx
const {
  isLoading,
  liveReasoning,
  isReasoningActive,
  abortController,
  stopGeneration,
} = useChatStore()
```

**NEW:**
```tsx
const {
  isLoading,
  liveReasoning,
  isReasoningActive,
  startStreaming,
  stopStreaming,
  appendToReasoning,
  updateStreamingProgress,
  streamingProgress, // New!
  currentStreamingMessageId, // New!
} = useStreaming()

// Or use the helper hook
const { connect, disconnect } = useSSEStream()
```

**New Features:**
- Progress tracking with status
- Better error handling
- Automatic cleanup

### Memory Store

**OLD:**
```tsx
const {
  conversationContext,
} = useChatStore()
```

**NEW:**
```tsx
const {
  conversationContext,
  memories,
  addMemory,
  getRelevantMemories,
  getContextSummary,
  initializeSession,
  incrementMessageCount,
  addTokenUsage,
} = useChatMemory()

// Or use the helper hook
const {
  addFactFromMessage,
  addPreference,
  addDecision,
  getStats,
} = useMemory()
```

**New Features:**
- Long-term memory storage
- Relevance scoring
- Session tracking
- Token & cost tracking

---

## Step-by-Step Migration

### Step 1: Update Imports

```tsx
// OLD
import { useChatStore } from '@/lib/stores/chat-store'

// NEW
import { useChatStore } from '@/lib/stores/chat'
// OR
import { useMessages, useAgents, useStreaming, useChatMemory } from '@/lib/stores/chat'
```

### Step 2: Update Component Logic

**Before:**
```tsx
function ChatInterface() {
  const {
    messages,
    selectedAgent,
    isLoading,
    sendMessage,
    setSelectedAgent,
  } = useChatStore()

  return (
    <div>
      <AgentSelector
        agents={agents}
        selected={selectedAgent}
        onChange={setSelectedAgent}
      />
      <MessageList messages={messages} loading={isLoading} />
      <MessageInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}
```

**After (Option 1 - Backward Compatible):**
```tsx
function ChatInterface() {
  const chat = useChatStore()

  return (
    <div>
      <AgentSelector
        agents={chat.agents.agents}
        selected={chat.agents.selectedAgent}
        onChange={chat.agents.setSelectedAgent}
      />
      <MessageList
        messages={chat.messages.messages}
        loading={chat.streaming.isLoading}
      />
      <MessageInput
        onSend={chat.sendMessage}
        disabled={chat.streaming.isLoading}
      />
    </div>
  )
}
```

**After (Option 2 - Granular):**
```tsx
function ChatInterface() {
  const { messages } = useMessages()
  const { agents, selectedAgent, setSelectedAgent } = useAgents()
  const { isLoading } = useStreaming()
  const chat = useChatStore() // For sendMessage

  return (
    <div>
      <AgentSelector
        agents={agents}
        selected={selectedAgent}
        onChange={setSelectedAgent}
      />
      <MessageList messages={messages} loading={isLoading} />
      <MessageInput onSend={chat.sendMessage} disabled={isLoading} />
    </div>
  )
}
```

### Step 3: Add New Features

Take advantage of new functionality:

```tsx
function EnhancedChat() {
  const { addMessage, updateMessage } = useMessages()
  const { startStreaming, stopStreaming, streamingProgress } = useStreaming()
  const { addMemory, getRelevantMemories } = useChatMemory()

  // Add streaming progress indicator
  const showProgress = streamingProgress.status !== 'idle'

  // Add memory-based suggestions
  const suggestions = getRelevantMemories(currentQuery, 3)

  // Programmatically add messages
  const addSystemMessage = (content: string) => {
    addMessage({
      content,
      role: 'assistant',
      metadata: { workflow_step: 'system' }
    })
  }

  return (
    <div>
      {showProgress && (
        <ProgressBar
          progress={streamingProgress.progress}
          status={streamingProgress.currentStep}
        />
      )}
      {/* Rest of UI */}
    </div>
  )
}
```

---

## Testing

### Old Way (Monolithic)

```tsx
// Hard to test - everything is coupled
import { useChatStore } from '@/lib/stores/chat-store'

describe('Chat functionality', () => {
  it('should send message', () => {
    const store = useChatStore.getState()
    // Test everything at once 😢
  })
})
```

### New Way (Modular)

```tsx
// Easy to test - each store is isolated
import { useMessages } from '@/lib/stores/chat'

describe('Messages Store', () => {
  it('should add message', () => {
    const { addMessage } = useMessages.getState()

    const messageId = addMessage({
      content: 'Test',
      role: 'user',
    })

    expect(messageId).toBeDefined()
    expect(useMessages.getState().messages).toHaveLength(1)
  })

  it('should update message', () => {
    const { addMessage, updateMessage } = useMessages.getState()

    const id = addMessage({ content: 'Test', role: 'user' })
    updateMessage(id, { content: 'Updated' })

    const message = useMessages.getState().messages.find(m => m.id === id)
    expect(message?.content).toBe('Updated')
  })
})
```

---

## Performance Tips

### 1. Selective Subscriptions

```tsx
// ❌ BAD: Re-renders on ANY state change
function Component() {
  const state = useChatStore()
  // Re-renders for messages, agents, streaming, everything!
}

// ✅ GOOD: Only re-renders when messages change
function Component() {
  const messages = useMessages((state) => state.messages)
  // Only re-renders when messages array changes
}
```

### 2. Use Selectors

```tsx
// ❌ BAD: Accesses entire store
const { messages, agents, streaming } = useChatStore()

// ✅ GOOD: Select only what you need
const messageCount = useMessages((state) => state.messages.length)
const isLoading = useStreaming((state) => state.isLoading)
```

### 3. Memoize Derived State

```tsx
import { useMemo } from 'react'

function MessageStats() {
  const messages = useMessages((state) => state.messages)

  const stats = useMemo(() => ({
    total: messages.length,
    user: messages.filter(m => m.role === 'user').length,
    assistant: messages.filter(m => m.role === 'assistant').length,
  }), [messages])

  return <div>Total: {stats.total}</div>
}
```

---

## Common Patterns

### Pattern 1: Send Message with Streaming

```tsx
async function handleSendMessage(content: string) {
  const chat = useChatStore()
  const { addMessage, updateMessage } = useMessages.getState()
  const { startStreaming, stopStreaming } = useStreaming.getState()
  const { incrementMessageCount } = useChatMemory.getState()

  // Add user message
  const userMsgId = addMessage({ content, role: 'user' })

  // Add loading assistant message
  const assistantMsgId = addMessage({
    content: '',
    role: 'assistant',
    isLoading: true,
  })

  try {
    startStreaming(assistantMsgId)

    // Stream response
    await chat.sendMessage(content)

    incrementMessageCount()
  } catch (error) {
    updateMessage(assistantMsgId, {
      content: 'Error occurred',
      error: true,
      isLoading: false,
    })
  } finally {
    stopStreaming()
  }
}
```

### Pattern 2: Auto-Save to Database

```tsx
useEffect(() => {
  const { currentChat, saveMessagesToStorage } = useMessages.getState()

  if (currentChat) {
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      saveMessagesToStorage(currentChat.id)
    }, 30000)

    return () => clearInterval(interval)
  }
}, [])
```

### Pattern 3: Track Usage Metrics

```tsx
function TrackUsage() {
  const { conversationContext } = useChatMemory()
  const { getStats } = useMemory()

  const stats = getStats()

  return (
    <div>
      <h3>Current Session</h3>
      <p>Messages: {stats.currentSession.messages}</p>
      <p>Tokens: {stats.currentSession.tokens}</p>
      <p>Cost: ${stats.currentSession.cost.toFixed(4)}</p>

      <h3>All Time</h3>
      <p>Sessions: {stats.allTime.sessions}</p>
      <p>Total Messages: {stats.allTime.totalMessages}</p>
    </div>
  )
}
```

---

## Troubleshooting

### Issue: "Cannot find module '@/lib/stores/chat'"

**Solution:** Make sure you've created the `chat/` directory and all 5 files.

### Issue: "useChatStore is not a function"

**Solution:** Check your import:
```tsx
// ❌ Wrong
import useChatStore from '@/lib/stores/chat'

// ✅ Correct
import { useChatStore } from '@/lib/stores/chat'
```

### Issue: State not persisting

**Solution:** Ensure persistence keys are unique:
```tsx
// Each store has its own persistence key:
// - vital-chat-messages
// - vital-chat-agents
// - vital-chat-memory
```

### Issue: Circular dependencies

**Solution:** Don't import stores inside stores. Use the `get()` method instead:
```tsx
// ❌ Bad
import { useAgents } from './chat-agents-store'

// ✅ Good
const { selectedAgent } = useAgents.getState()
```

---

## Rollback Plan

If you need to rollback to the old store:

1. Keep the old `chat-store.ts` file as `chat-store.legacy.ts`
2. Update imports to use `.legacy`:
   ```tsx
   import { useChatStore } from '@/lib/stores/chat-store.legacy'
   ```
3. Everything works as before

---

## Next Steps

1. ✅ All 4 stores created
2. ✅ Unified export created
3. ✅ Backward compatibility maintained
4. ⏭️ Update components gradually
5. ⏭️ Add unit tests for each store
6. ⏭️ Deprecate old chat-store.ts

---

## Summary

**Benefits:**
- ✅ Better code organization (4 focused stores vs 1 monolith)
- ✅ Easier to test (isolated concerns)
- ✅ Better performance (selective re-renders)
- ✅ Backward compatible (minimal migration effort)
- ✅ New features (memory, better streaming, etc.)

**Trade-offs:**
- Slightly more complex imports (but better IDE autocomplete)
- Slightly more lines of code (+18%, but each file is smaller)
- Need to understand the store structure (but clearer responsibilities)

**Recommendation:**
Start with the unified `useChatStore()` hook for backward compatibility, then gradually migrate to granular stores for better performance.
