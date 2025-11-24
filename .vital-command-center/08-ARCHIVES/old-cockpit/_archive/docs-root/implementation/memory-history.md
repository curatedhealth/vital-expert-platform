# Memory/Message History Implementation Guide

**Feature**: Multi-turn conversation support for Virtual Advisory Board
**Status**: 0% → Implementation Ready
**Time**: 4-6 hours
**Priority**: ⭐⭐⭐⭐⭐

---

## 🎯 What This Enables

**Before (No Memory)**:
```
User: "Should we launch in Q2?"
[Panel discusses launch timing]

User: "What if we target EMEA instead?"
[Panel has NO CONTEXT about Q2 discussion - starts fresh]
```

**After (With Memory)**:
```
User: "Should we launch in Q2?"
[Panel discusses launch timing]

User: "What if we target EMEA instead?"
[Panel REMEMBERS Q2 discussion and considers regional implications]
```

---

## 📋 Implementation Tasks

### Task 1: Add messageHistory to State (30 mins)
### Task 2: Update Expert Nodes for Context (2 hours)
### Task 3: Create Conversation API (1 hour)
### Task 4: Test Multi-turn Flow (30 mins)

---

## 🔧 Task 1: Add messageHistory to State

**File**: `/src/lib/services/langgraph-orchestrator.ts`
**Location**: In `OrchestrationStateAnnotation` (around line 16)

**ADD THIS FIELD** (after line 23):

```typescript
const OrchestrationStateAnnotation = Annotation.Root({
  // Input
  question: Annotation<string>(),
  personas: Annotation<string[]>(),
  mode: Annotation<string>(),
  evidenceSources: Annotation<any[]>({
    default: () => []
  }),

  // NEW: Message history for multi-turn conversations
  messageHistory: Annotation<Array<{role: 'user' | 'assistant', content: string, timestamp: string}>>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),

  // ... rest of existing fields
```

---

## 🔧 Task 2: Update Expert Nodes for Context

### Part A: Update consultParallelNode

**File**: `/src/lib/services/langgraph-orchestrator.ts`
**Location**: `consultParallelNode` method (around line 520)

**FIND THIS**:
```typescript
  private async consultParallelNode(state: OrchestrationState): Promise<Partial<OrchestrationState>> {
    const logs = [`Consulting ${state.personas.length} experts in parallel...`];

    // Run all expert consultations in parallel
    const expertPromises = state.personas.map(async (persona) => {
      const reply = await this.runExpert(persona, state.question, state.evidenceSources);
```

**REPLACE WITH**:
```typescript
  private async consultParallelNode(state: OrchestrationState): Promise<Partial<OrchestrationState>> {
    const logs = [`Consulting ${state.personas.length} experts in parallel...`];

    // Build conversation context from message history
    const conversationContext = this.buildConversationContext(state.messageHistory);

    // Run all expert consultations in parallel with context
    const expertPromises = state.personas.map(async (persona) => {
      const reply = await this.runExpert(
        persona,
        state.question,
        state.evidenceSources,
        conversationContext // NEW: Pass conversation context
      );
```

### Part B: Add buildConversationContext Method

**File**: `/src/lib/services/langgraph-orchestrator.ts`
**Location**: Add after `updateState()` method (around line 478)

**ADD THIS METHOD**:
```typescript
  /**
   * Build conversation context string from message history
   */
  private buildConversationContext(messageHistory: Array<{role: string, content: string, timestamp: string}>): string {
    if (!messageHistory || messageHistory.length === 0) {
      return '';
    }

    let context = '\n\n## Previous Conversation Context:\n\n';

    // Include last 5 messages for context (to avoid token bloat)
    const recentMessages = messageHistory.slice(-5);

    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        context += `**User Question**: ${msg.content}\n\n`;
      } else {
        context += `**Panel Response Summary**: ${msg.content.substring(0, 300)}...\n\n`;
      }
    }

    context += `\n**Current Question**: `;

    return context;
  }
```

### Part C: Update runExpert to Accept Context

**File**: `/src/lib/services/langgraph-orchestrator.ts`
**Location**: `runExpert` method (around line 650)

**FIND THIS**:
```typescript
  private async runExpert(
    persona: string,
    question: string,
    evidenceSources: any[]
  ): Promise<AgentReply> {
```

**REPLACE WITH**:
```typescript
  private async runExpert(
    persona: string,
    question: string,
    evidenceSources: any[],
    conversationContext: string = '' // NEW: Optional conversation context
  ): Promise<AgentReply> {
```

**THEN FIND THIS** (in the same method, where the prompt is built):
```typescript
    const messages = [
      new SystemMessage(`You are ${persona}. Provide expert analysis.`),
      new HumanMessage(question)
    ];
```

**REPLACE WITH**:
```typescript
    const messages = [
      new SystemMessage(`You are ${persona}. Provide expert analysis.`),
      new HumanMessage(conversationContext + question) // Include context before question
    ];
```

---

## 🔧 Task 3: Update Orchestrate Method to Store Messages

**File**: `/src/lib/services/langgraph-orchestrator.ts`
**Location**: At the END of `orchestrate()` method (around line 205, before the return)

**FIND THIS**:
```typescript
    // Execute workflow with thread_id for checkpointing
    const result = await app.invoke(
      {
        question: params.question,
        personas: params.personas,
        mode: params.mode,
        evidenceSources: params.evidenceSources || [],
        sessionId,
        maxRounds: pattern.config?.maxRounds || 3
      },
      {
        configurable: {
          thread_id: sessionId
        }
      }
    );

    return result;
  }
```

**REPLACE WITH**:
```typescript
    // Execute workflow with thread_id for checkpointing
    const result = await app.invoke(
      {
        question: params.question,
        personas: params.personas,
        mode: params.mode,
        evidenceSources: params.evidenceSources || [],
        sessionId,
        maxRounds: pattern.config?.maxRounds || 3,
        messageHistory: [] // Initialize empty for new conversations
      },
      {
        configurable: {
          thread_id: sessionId
        }
      }
    );

    // Store the question and response in message history
    const updatedHistory = [
      {
        role: 'user' as const,
        content: params.question,
        timestamp: new Date().toISOString()
      },
      {
        role: 'assistant' as const,
        content: result.summaryMd || 'No response generated',
        timestamp: new Date().toISOString()
      }
    ];

    // Update state with message history using updateState
    await this.updateState({
      threadId: sessionId,
      updates: {
        messageHistory: updatedHistory
      }
    });

    return result;
  }
```

---

## 🔧 Task 4: Create Conversation API Endpoint

**File**: Create `/src/app/api/panel/conversations/route.ts`

**FULL FILE CONTENT**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

/**
 * GET /api/panel/conversations
 * List all conversation sessions with message history
 */
export async function GET(request: NextRequest) {
  try {
    const sessions = await langGraphOrchestrator.listSessions();

    return NextResponse.json({
      success: true,
      conversations: sessions,
      count: sessions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch conversations',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
```

**File**: Create `/src/app/api/panel/conversations/[threadId]/route.ts`

**FULL FILE CONTENT**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

/**
 * GET /api/panel/conversations/[threadId]
 * Get message history for a specific conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const history = await langGraphOrchestrator.getSessionHistory(params.threadId);

    // Extract message history from session state
    const messageHistory = history.messageHistory || [];

    return NextResponse.json({
      success: true,
      threadId: params.threadId,
      messageHistory,
      messageCount: messageHistory.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error(`Error fetching conversation ${params.threadId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch conversation',
        threadId: params.threadId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/panel/conversations/[threadId]/continue
 * Continue an existing conversation with a new question
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const body = await request.json();
    const { message, panel } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Resume session with new question (existing context will be loaded automatically)
    const result = await langGraphOrchestrator.resumeSession(params.threadId, {
      question: message,
      personas: panel || []
    });

    return NextResponse.json({
      success: true,
      threadId: params.threadId,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error(`Error continuing conversation ${params.threadId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to continue conversation',
        threadId: params.threadId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Testing Instructions

### Test 1: Basic Multi-turn Conversation

```bash
# Start a conversation
POST /api/panel/orchestrate
{
  "message": "Should we launch in Q2 2025?",
  "panel": ["Commercial Expert", "Regulatory Expert"],
  "mode": "parallel"
}
# Response includes threadId: "session_123456"

# Continue the conversation with context
POST /api/panel/conversations/session_123456/continue
{
  "message": "What if we target EMEA first instead of US?",
  "panel": ["Commercial Expert", "Regulatory Expert"]
}
# Panel should reference Q2 discussion in their response
```

### Test 2: View Conversation History

```bash
GET /api/panel/conversations/session_123456

# Expected response:
{
  "success": true,
  "threadId": "session_123456",
  "messageHistory": [
    {
      "role": "user",
      "content": "Should we launch in Q2 2025?",
      "timestamp": "2025-10-03T20:00:00Z"
    },
    {
      "role": "assistant",
      "content": "# Panel Recommendation\n\n...",
      "timestamp": "2025-10-03T20:00:15Z"
    },
    {
      "role": "user",
      "content": "What if we target EMEA first instead of US?",
      "timestamp": "2025-10-03T20:05:00Z"
    },
    {
      "role": "assistant",
      "content": "# Panel Recommendation\n\n...",
      "timestamp": "2025-10-03T20:05:20Z"
    }
  ]
}
```

### Test 3: List All Conversations

```bash
GET /api/panel/conversations

# Expected response:
{
  "success": true,
  "conversations": [
    {
      "threadId": "session_123456",
      "lastUpdate": "2025-10-03T20:05:20Z",
      "messageCount": 4
    },
    ...
  ]
}
```

---

## ✅ Completion Checklist

- [ ] Add `messageHistory` field to OrchestrationStateAnnotation
- [ ] Add `buildConversationContext()` method
- [ ] Update `consultParallelNode` to use context
- [ ] Update `runExpert` to accept context parameter
- [ ] Update `orchestrate()` to store messages after execution
- [ ] Create `/src/app/api/panel/conversations/route.ts`
- [ ] Create `/src/app/api/panel/conversations/[threadId]/route.ts`
- [ ] Test basic multi-turn conversation
- [ ] Test conversation history retrieval
- [ ] Test context retention between turns

---

## 📊 Impact

**When Complete**:
- Memory/History: 0% → 100% ✅
- Overall system: 92% → 94%
- Multi-turn conversations enabled
- Context-aware expert responses
- Conversation history API

**Time**: 4-6 hours total

---

## 🎯 Next Features After This

1. **Tool Calling** (6-8 hours) - Enable real data fetching
2. **Multi-Dimensional Consensus** (2-3 days) - Advanced visualization
3. **Enhanced Board Templates** (3-4 days) - Industry-specific boards

---

**File**: MEMORY_HISTORY_IMPLEMENTATION.md
**Created**: 2025-10-03
**Instructions**: Follow each task sequentially to implement memory/history
