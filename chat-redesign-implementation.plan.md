<!-- 6382cc21-8d2c-4d5d-a6f1-35cf87f1e1b2 993292f5-a825-405c-b33a-90a4caa9301c -->
# Chat Frontend Redesign & LangGraph Integration - Full Implementation Plan

## Overview

This plan implements all missing UI components and ensures proper LangChain/LangGraph orchestration for all agent selection and conversation handling. No hardcoded scripts - all routing through existing workflow nodes.

## Verification Phase: Confirm ✅ COMPLETED Items

### Step 1: Verify Security Fixes (5 min)

- **File**: `src/lib/supabase/server-only.ts`
- **Check**: Lines 1-24 have proper guards
- **Status**: ✅ CONFIRMED - Has window check, edge runtime check, env validation

### Step 2: Verify SSE Types (5 min)

- **File**: `src/types/sse.types.ts`
- **Check**: Union types and parseSSELine function exist
- **Status**: ✅ CONFIRMED - Complete implementation

### Step 3: Verify Agent Selection Panel (10 min)

- **File**: `src/components/chat/agent-selection-panel.tsx`
- **Check**: Lines 1-248, all features implemented
- **Findings**: ✅ COMPLETE - Search, categories, recent agents, loading states, async pattern (lines 71-92)

### Step 4: Verify Chat Container (10 min)

- **File**: `src/components/ui/chat-container.tsx`
- **Check**: Line 39-52 for return statement
- **Status**: ✅ CONFIRMED - Return statement EXISTS (line 46), plan is outdated

### Step 5: Verify Workflow Validation (10 min)

- **File**: `src/features/chat/services/ask-expert-graph.ts`
- **Check**: Lines 449-473 for manual mode validation
- **Status**: ✅ CONFIRMED - Has full validation before stream starts

### Step 6: Verify Stream Error Handling (10 min)

- **File**: `src/features/chat/services/ask-expert-graph.ts`
- **Check**: Lines 548-724 for try-catch-finally
- **Status**: ✅ CONFIRMED - Has comprehensive error handling

### Step 7: Verify LangGraph Nodes (15 min)

- **File**: `src/features/chat/services/workflow-nodes.ts`
- **Check**: All node implementations use AutomaticAgentOrchestrator
- **Status**: ✅ CONFIRMED - Lines 60-267 show proper LangGraph orchestration

**VERIFICATION RESULT**: All "✅ COMPLETED" items are TRULY complete

---

## Implementation Phase: Fix ❌ GAPS

## Phase 1: Integrate Agent Selection Panel into Chat Page (45 min)

### Goal

Make the existing `AgentSelectionPanel` visible in the chat interface for manual mode

### Files to Modify

1. `src/app/(app)/chat/page.tsx` - Main chat page

### Implementation

**Step 1.1: Add Agent Panel to Chat Page Layout**

```typescript
// src/app/(app)/chat/page.tsx
// Current layout (lines 111-147) - ADD agent panel sidebar

<div className="flex h-screen bg-gray-50">
  {/* LEFT: Agent Selection Panel (Manual Mode Only) */}
  {interactionMode === 'manual' && (
    <div className="w-80 border-r border-gray-200 bg-white overflow-hidden">
      <AgentSelectionPanel
        agents={agents}
        selectedAgent={selectedAgent}
        onSelectAgent={async (agent) => {
          // Async acknowledgment pattern
          await setSelectedAgent(agent);
          return 'ack';
        }}
        isLoading={isLoadingAgents}
        className="h-full"
      />
    </div>
  )}

  {/* RIGHT: Main Content Area (existing code) */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Selected Agent Info */}
    {selectedAgent && (
      <div className="p-4 border-b border-gray-200 bg-white">
        {/* Existing agent info (lines 116-127) */}
      </div>
    )}

    {/* Chat Container */}
    <div className="flex-1">
      <ChatContainer className="h-full" />
    </div>
  </div>
</div>
```

**Step 1.2: Import AgentSelectionPanel**

```typescript
// Add to imports at top of file
import { AgentSelectionPanel } from '@/components/chat/agent-selection-panel';
```

**Step 1.3: Test Integration**

- Switch to manual mode
- Verify agent panel appears on left
- Verify can select agents
- Verify panel disappears in automatic mode

---

## Phase 2: Create Separate Chat Header Component (30 min)

### Goal

Extract header logic into reusable component with mode indicators

### Files to Create

1. `src/components/chat/chat-header.tsx`

### Implementation

**Step 2.1: Create ChatHeader Component**

```typescript
// src/components/chat/chat-header.tsx
'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Zap, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types/agent.types';

interface ChatHeaderProps {
  selectedAgent: Agent | null;
  interactionMode: 'automatic' | 'manual';
  autonomousMode: boolean;
  onToggleMode?: (mode: 'automatic' | 'manual') => void;
  onToggleAutonomous?: (enabled: boolean) => void;
  onChangeAgent?: () => void;
  className?: string;
}

export function ChatHeader({
  selectedAgent,
  interactionMode,
  autonomousMode,
  onToggleMode,
  onToggleAutonomous,
  onChangeAgent,
  className
}: ChatHeaderProps) {
  return (
    <div className={cn("p-4 border-b border-gray-200 bg-white", className)}>
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Left: Agent Info */}
        <div className="flex items-center space-x-3">
          {selectedAgent ? (
            <>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {(selectedAgent.display_name || selectedAgent.name || 'A')[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">
                  {selectedAgent.display_name || selectedAgent.name}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {selectedAgent.description}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-lg">🤖</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-600">
                  {interactionMode === 'automatic' ? 'AI Orchestrator' : 'No Agent Selected'}
                </h4>
                <p className="text-sm text-gray-500">
                  {interactionMode === 'automatic' 
                    ? 'Automatically selecting expert agents' 
                    : 'Please select an agent to continue'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Mode Indicators & Actions */}
        <div className="flex items-center gap-2">
          {/* Interaction Mode Badge */}
          <Badge
            variant={interactionMode === 'automatic' ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {interactionMode === 'automatic' ? (
              <>
                <Zap className="h-3 w-3" />
                Auto
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                Manual
              </>
            )}
          </Badge>

          {/* Autonomous Mode Badge */}
          {autonomousMode && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              Autonomous
            </Badge>
          )}

          {/* Change Agent Button (Manual Mode) */}
          {interactionMode === 'manual' && selectedAgent && onChangeAgent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onChangeAgent}
              className="text-sm"
            >
              Change Agent
            </Button>
          )}

          {/* Settings Button */}
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2.2: Integrate into Chat Page**

```typescript
// src/app/(app)/chat/page.tsx
// Replace existing selected agent info (lines 115-127) with:

<ChatHeader
  selectedAgent={selectedAgent}
  interactionMode={interactionMode}
  autonomousMode={autonomousMode}
  onChangeAgent={() => {
    setSelectedAgent(null);
    // Optionally show agent panel if in manual mode
  }}
/>
```

---

## Phase 3: Create Separate Chat Input Component (30 min)

### Goal

Extract input logic with proper validation and keyboard shortcuts

### Files to Create

1. `src/components/chat/chat-input.tsx`

### Implementation

**Step 3.1: Create ChatInput Component**

```typescript
// src/components/chat/chat-input.tsx
'use client';

import React from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  interactionMode: 'automatic' | 'manual';
  hasSelectedAgent: boolean;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  interactionMode,
  hasSelectedAgent,
  disabled = false,
  className
}: ChatInputProps) {
  // Validation: Check if can send
  const canSend = value.trim() && 
                  !isLoading && 
                  !disabled &&
                  (interactionMode === 'automatic' || hasSelectedAgent);

  // Show warning in manual mode without agent
  const showWarning = interactionMode === 'manual' && !hasSelectedAgent;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSend) {
      onSubmit();
    }
  };

  return (
    <div className={cn("border-t bg-white p-4", className)}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Warning: No agent selected */}
        {showWarning && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select an AI agent before sending a message in Manual Mode.
            </AlertDescription>
          </Alert>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              showWarning
                ? "Please select an AI agent first..."
                : "Ask about digital health, reimbursement, clinical research..."
            }
            className="min-h-[40px] max-h-[120px] resize-none"
            disabled={!canSend}
            rows={1}
          />
          <Button
            type="submit"
            disabled={!canSend}
            className="px-4 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
```

**Step 3.2: Integrate into ChatContainer**

```typescript
// src/components/chat/chat-container.tsx
// Replace input area (lines 202-236) with:

<ChatInput
  value={input}
  onChange={setInput}
  onSubmit={() => sendMessage(input)}
  isLoading={isLoading}
  interactionMode={interactionMode}
  hasSelectedAgent={!!selectedAgent}
  className="border-t"
/>
```

---

## Phase 4: Fix Store Async Acknowledgment Pattern (20 min)

### Goal

Make store's setSelectedAgent return acknowledgment for proper async flow

### Files to Modify

1. `src/lib/stores/chat-store.ts`

### Implementation

**Step 4.1: Update setSelectedAgent to be Async**

```typescript
// src/lib/stores/chat-store.ts
// Replace lines 857-859 with:

setSelectedAgent: async (agent: Agent | null) => {
  return new Promise<string>((resolve) => {
    set({ 
      selectedAgent: agent, 
      error: null,
      // Clear any previous errors when selecting agent
      liveReasoning: '',
      isReasoningActive: false
    });
    
    // Wait for state update to complete
    setTimeout(() => {
      console.log('✅ Agent selection confirmed:', agent?.name);
      resolve('ack'); // Return acknowledgment
    }, 0);
  });
},
```

**Step 4.2: Update selectAgent to use async pattern**

```typescript
// src/lib/stores/chat-store.ts
// Update selectAgent function (~line 1373):

selectAgent: async (agentId: string) => {
  const { agents, setSelectedAgent } = get();
  const agent = agents.find(a => a.id === agentId);
  
  if (!agent) {
    throw new Error(`Agent with ID ${agentId} not found`);
  }

  console.log('✅ Agent selected via selectAgent:', agent.name);
  
  // Use the async setSelectedAgent for proper acknowledgment
  const ack = await setSelectedAgent(agent);
  if (!ack) {
    throw new Error('Agent selection failed - no acknowledgment');
  }
  
  // Update other state
  set({
    showAgentSelection: false,
    isWaitingForAgentSelection: false,
    error: null
  });

  // Create a new chat with the selected agent
  const { createNewChat } = get();
  createNewChat();
},
```

---

## Phase 5: Improve Store Validation - Three Layers (30 min)

### Goal

Implement proper three-layer validation as specified in audit

### Files to Modify

1. `src/lib/stores/chat-store.ts`
2. `src/components/chat/chat-container.tsx`

### Implementation

**Step 5.1: Layer 1 - Store Validation (Already exists, enhance)**

```typescript
// src/lib/stores/chat-store.ts
// Keep existing validation at lines 407-414, enhance with better error:

// LAYER 1: Store-level validation
if (interactionMode === 'manual' && !selectedAgent?.id) {
  console.error('❌ [LAYER 1] No agent selected in manual mode');
  set({ 
    error: 'Manual Mode requires an agent. Please select an AI agent from the left panel.',
    isLoading: false 
  });
  return; // CRITICAL: Stop before creating messages
}
```

**Step 5.2: Layer 2 - UI Input Gate**

```typescript
// src/components/chat/chat-input.tsx
// Already implemented in Phase 3 with canSend logic
// Verify button is disabled when !canSend
```

**Step 5.3: Layer 3 - Backend Validation**

```typescript
// src/features/chat/services/ask-expert-graph.ts
// Already exists at lines 449-473
// Verify it's working - no changes needed
```

**Step 5.4: Add Helper Function to Store**

```typescript
// src/lib/stores/chat-store.ts
// Add new helper at end of store actions:

// Validation helper
validateCanSend: () => {
  const { selectedAgent, interactionMode, isLoading } = get();
  
  if (isLoading) {
    return { valid: false, reason: 'Already processing a message' };
  }
  
  if (interactionMode === 'manual' && !selectedAgent) {
    return { 
      valid: false, 
      reason: 'Please select an AI agent in Manual Mode' 
    };
  }
  
  return { valid: true, reason: null };
},
```

---

## Phase 6: Add Exponential Backoff Retry Logic (25 min)

### Goal

Implement proper retry with exponential backoff for failed requests

### Files to Create

1. `src/lib/utils/retry.ts`

### Files to Modify

1. `src/lib/stores/chat-store.ts`

### Implementation

**Step 6.1: Create Retry Utility**

```typescript
// src/lib/utils/retry.ts
export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
}

export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if this is the last attempt
      if (attempt === maxAttempts - 1) {
        throw lastError;
      }
      
      // Don't retry if error is not retryable
      if (!shouldRetry(lastError)) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      
      console.log(`⚠️ Retry attempt ${attempt + 1}/${maxAttempts} after ${delay}ms`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Helper to determine if error is retryable
export function isRetryableError(error: Error): boolean {
  // Retry on network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // Retry on timeout errors
  if (error.message.includes('timeout')) {
    return true;
  }
  
  // Retry on 5xx errors
  if (error.message.match(/5\d\d/)) {
    return true;
  }
  
  // Don't retry on AbortError
  if (error.name === 'AbortError') {
    return false;
  }
  
  // Don't retry on validation errors (4xx)
  if (error.message.match(/4\d\d/)) {
    return false;
  }
  
  return false;
}
```

**Step 6.2: Integrate Retry into sendMessage**

```typescript
// src/lib/stores/chat-store.ts
// Wrap the fetch call in sendMessage (~line 539) with retry:

import { retryWithExponentialBackoff, isRetryableError } from '@/lib/utils/retry';

// Inside sendMessage function, replace fetch call:
const response = await retryWithExponentialBackoff(
  () => fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
    body: JSON.stringify(requestBody)
  }),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    shouldRetry: isRetryableError
  }
);
```

---

## Phase 7: Verify LangGraph Integration (30 min)

### Goal

Ensure ALL agent selection happens through LangGraph workflow nodes, not hardcoded

### Files to Verify

1. `src/features/chat/services/workflow-nodes.ts`
2. `src/features/chat/services/ask-expert-graph.ts`
3. `src/features/chat/services/automatic-orchestrator.ts`

### Verification Checklist

**Check 1: suggestAgentsNode uses AutomaticAgentOrchestrator**

```typescript
// src/features/chat/services/workflow-nodes.ts (lines 103-137)
// ✅ VERIFIED: Uses orchestrator.getAgentSuggestions(state.query)
```

**Check 2: selectAgentAutomaticNode uses AutomaticAgentOrchestrator**

```typescript
// src/features/chat/services/workflow-nodes.ts (lines 227-267)
// ✅ VERIFIED: Uses orchestrator.chat(state.query)
```

**Check 3: No hardcoded agent lists**

```bash
# Search for hardcoded agent arrays
grep -r "const agents = \[" src/features/chat/services/
# Should find ZERO hardcoded agent lists
```

**Check 4: All routing goes through StateGraph**

```typescript
// src/features/chat/services/ask-expert-graph.ts (lines 273-338)
// ✅ VERIFIED: Uses StateGraph with proper conditional edges
```

**Check 5: AutomaticAgentOrchestrator uses database**

```typescript
// src/features/chat/services/automatic-orchestrator.ts
// ✅ VERIFIED: Lines 384-402 show database filtering
```

### Action Items (if any found)

- If hardcoded agents found → Replace with database calls
- If manual routing found → Replace with StateGraph conditional edges
- If direct agent selection found → Route through workflow nodes

---

## Phase 8: Integration Testing (45 min)

### Test Suite 1: Manual Mode with Agent Selection (15 min)

1. Open chat page
2. Switch to Manual mode
3. ✓ Agent panel appears on left
4. ✓ Cannot send message (input disabled)
5. ✓ Warning message appears
6. Select an agent
7. ✓ Agent appears in header
8. ✓ Input enabled
9. Send message
10. ✓ Receives response
11. ✓ Response attributed to selected agent

### Test Suite 2: Automatic Mode (15 min)

1. Switch to Automatic mode
2. ✓ Agent panel disappears
3. ✓ Can send message immediately
4. Send message
5. ✓ System selects agent (via LangGraph)
6. ✓ Receives response
7. ✓ Response shows which agent was selected

### Test Suite 3: Mode Switching (10 min)

1. Start in Automatic mode
2. Send message
3. Switch to Manual mode mid-conversation
4. ✓ Agent panel appears
5. ✓ Previous messages preserved
6. ✓ Can select different agent
7. Continue conversation
8. ✓ New agent handles new messages

### Test Suite 4: Error Handling (5 min)

1. Manual mode, no agent
2. Try to send message
3. ✓ Error message clear and actionable
4. ✓ No stuck "Processing..." state
5. Select agent
6. ✓ Error clears
7. ✓ Can send message

---

## Phase 9: Performance Optimization (30 min)

### Optimization 1: Memoize Agent Cards

```typescript
// Already implemented in agent-selection-panel.tsx (lines 105-153)
// ✅ VERIFIED: Uses React.memo
```

### Optimization 2: Debounce Agent Selection

```typescript
// src/components/chat/agent-selection-panel.tsx
// Add to handleSelectAgent (~line 71):

const [selectDebounceTimer, setSelectDebounceTimer] = useState<NodeJS.Timeout | null>(null);

const handleSelectAgent = useCallback(
  async (agent: Agent) => {
    if (selectingAgentId) return;
    
    // Clear any pending selection
    if (selectDebounceTimer) {
      clearTimeout(selectDebounceTimer);
    }
    
    // Debounce for 100ms to prevent double-clicks
    const timer = setTimeout(async () => {
      setSelectingAgentId(agent.id);
      try {
        const ack = await onSelectAgent(agent);
        if (!ack) return;
        
        // Update recent agents
        setRecentAgents(prev => {
          const next = [agent.id, ...prev.filter(id => id !== agent.id)].slice(0, 5);
          try { 
            localStorage.setItem('recent-agents', JSON.stringify(next)); 
          } catch (e) {
            console.warn('Failed to persist recent agents', e);
          }
          return next;
        });
      } finally {
        setSelectingAgentId(null);
      }
    }, 100);
    
    setSelectDebounceTimer(timer);
  },
  [onSelectAgent, selectingAgentId, selectDebounceTimer]
);
```

### Optimization 3: AbortController Cleanup in Store

```typescript
// src/lib/stores/chat-store.ts
// Add cleanup on unmount equivalent for store:

// Add to store interface:
cleanup: () => void;

// Implementation:
cleanup: () => {
  const { abortController } = get();
  if (abortController) {
    console.log('🧹 Cleaning up abort controller');
    abortController.abort();
    set({ abortController: null, isLoading: false });
  }
},
```

---

## Phase 10: Documentation (20 min)

### Doc 1: Update Chat Page Documentation

```typescript
// src/app/(app)/chat/page.tsx
// Add comprehensive JSDoc at top:

/**
 * VITAL Expert Chat Page
 * 
 * Supports two interaction modes:
 * 1. **Manual Mode**: User selects AI agent from left panel
 * 2. **Automatic Mode**: System selects best agent via LangGraph workflow
 * 
 * Agent Selection:
 * - All agent routing happens through LangGraph StateGraph
 * - Uses AutomaticAgentOrchestrator for intelligent selection
 * - No hardcoded agent lists - all from database
 * 
 * Validation:
 * - Three-layer validation: Store, UI, Backend
 * - Manual mode requires agent selection before sending messages
 * - Automatic mode works without user intervention
 * 
 * Components:
 * - AgentSelectionPanel: Left sidebar for manual agent selection
 * - ChatHeader: Shows current agent and mode indicators
 * - ChatContainer: Main message display area
 * - ChatInput: Smart input with validation
 * 
 * State Management:
 * - useChatStore: Zustand store for chat state
 * - Async acknowledgment pattern for agent selection
 * - Proper cleanup on unmount
 */
```

### Doc 2: Create README for Chat Components

```markdown
// src/components/chat/README.md

# Chat Components

## AgentSelectionPanel
- **Purpose**: Manual agent selection interface
- **Features**: Search, categories, recent agents, loading states
- **Props**: agents, selectedAgent, onSelectAgent, isLoading
- **Performance**: Memoized cards, debounced search (300ms)

## ChatHeader
- **Purpose**: Display current agent and mode
- **Features**: Mode badges, change agent button, settings
- **Props**: selectedAgent, interactionMode, autonomousMode, callbacks

## ChatInput
- **Purpose**: Message input with validation
- **Features**: Keyboard shortcuts (Enter/Shift+Enter), validation warnings
- **Props**: value, onChange, onSubmit, interactionMode, hasSelectedAgent

## ChatContainer
- **Purpose**: Main message display area
- **Features**: Auto-scroll, loading states, error handling, reasoning display
- **Props**: className

## Integration Example
\`\`\`typescript
<div className="flex h-screen">
  {interactionMode === 'manual' && (
    <AgentSelectionPanel {...agentProps} />
  )}
  <div className="flex-1 flex flex-col">
    <ChatHeader {...headerProps} />
    <ChatContainer />
    <ChatInput {...inputProps} />
  </div>
</div>
\`\`\`
```

---

## Phase 11: Leading Practices Implementation (2 hours)

### Goal

Implement production-grade leading practices for LangChain/LangGraph and modern AI application architecture

### Files to Create

1. `src/lib/utils/input-validation.ts` - Input sanitization and validation
2. `src/lib/utils/rate-limiter.ts` - Rate limiting per user/IP
3. `src/lib/monitoring/audit-logger.ts` - Compliance audit logging
4. `src/lib/cache/redis-cache.ts` - Redis caching layer
5. `src/lib/monitoring/health-checks.ts` - Health check endpoints
6. `src/lib/security/encryption.ts` - Data encryption utilities

### Files to Modify

1. `src/features/chat/services/enhanced-langchain-service.ts` - Update deprecated imports
2. `src/lib/stores/chat-store.ts` - Add comprehensive error handling
3. `src/app/api/chat/route.ts` - Add rate limiting and validation
4. `src/features/chat/services/ask-expert-graph.ts` - Add circuit breaker monitoring

### Implementation

**Step 11.1: Update Deprecated LangChain Imports (30 min)**

```typescript
// src/features/chat/services/enhanced-langchain-service.ts
// Replace deprecated imports with modern ones:

// ❌ DEPRECATED
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { BufferWindowMemory } from 'langchain/memory';

// ✅ MODERN
import { ConversationalRetrievalQAChain } from '@langchain/community/chains/retrieval_qa';
import { BufferWindowMemory } from '@langchain/community/memory/buffer_window_memory';
```

**Step 11.2: Implement Input Validation & Sanitization (25 min)**

```typescript
// src/lib/utils/input-validation.ts
export interface ValidationResult {
  isValid: boolean;
  sanitizedInput: string;
  errors: string[];
}

export function validateAndSanitizeInput(input: string): ValidationResult {
  const errors: string[] = [];
  let sanitizedInput = input.trim();
  
  // Length validation
  if (sanitizedInput.length > 4000) {
    errors.push('Message too long (max 4000 characters)');
    sanitizedInput = sanitizedInput.substring(0, 4000);
  }
  
  // XSS prevention
  sanitizedInput = sanitizedInput
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // SQL injection prevention
  const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi;
  if (sqlPatterns.test(sanitizedInput)) {
    errors.push('Invalid characters detected');
    sanitizedInput = sanitizedInput.replace(sqlPatterns, '[FILTERED]');
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedInput,
    errors
  };
}
```

**Step 11.3: Add Rate Limiting (20 min)**

```typescript
// src/lib/utils/rate-limiter.ts
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (req: Request) => string;
}

export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  
  constructor(private config: RateLimitConfig) {}
  
  async checkLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Clean expired entries
    for (const [k, v] of this.requests.entries()) {
      if (v.resetTime < now) {
        this.requests.delete(k);
      }
    }
    
    const current = this.requests.get(key) || { count: 0, resetTime: now + this.config.windowMs };
    
    if (current.resetTime < now) {
      current.count = 0;
      current.resetTime = now + this.config.windowMs;
    }
    
    const allowed = current.count < this.config.maxRequests;
    if (allowed) {
      current.count++;
      this.requests.set(key, current);
    }
    
    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - current.count),
      resetTime: current.resetTime
    };
  }
}

// Global rate limiter instance
export const chatRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    return `chat:${ip}`;
  }
});
```

**Step 11.4: Implement Audit Logging (25 min)**

```typescript
// src/lib/monitoring/audit-logger.ts
interface AuditEvent {
  timestamp: string;
  userId: string;
  sessionId: string;
  eventType: 'agent_selection' | 'message_sent' | 'error_occurred' | 'mode_switch';
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

export class AuditLogger {
  private async logToDatabase(event: AuditEvent): Promise<void> {
    // Log to Supabase audit table
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    await supabase.from('audit_logs').insert({
      timestamp: event.timestamp,
      user_id: event.userId,
      session_id: event.sessionId,
      event_type: event.eventType,
      details: event.details,
      ip_address: event.ipAddress,
      user_agent: event.userAgent
    });
  }
  
  async logAgentSelection(userId: string, sessionId: string, agentId: string, request: Request): Promise<void> {
    await this.logToDatabase({
      timestamp: new Date().toISOString(),
      userId,
      sessionId,
      eventType: 'agent_selection',
      details: { agentId },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
  }
  
  async logMessageSent(userId: string, sessionId: string, messageLength: number, request: Request): Promise<void> {
    await this.logToDatabase({
      timestamp: new Date().toISOString(),
      userId,
      sessionId,
      eventType: 'message_sent',
      details: { messageLength },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
  }
}

export const auditLogger = new AuditLogger();
```

**Step 11.5: Add Redis Caching Layer (30 min)**

```typescript
// src/lib/cache/redis-cache.ts
interface CacheConfig {
  ttl: number; // Time to live in seconds
  keyPrefix: string;
}

export class RedisCache {
  private redis: any;
  
  constructor() {
    // Initialize Redis connection
    this.initializeRedis();
  }
  
  private async initializeRedis(): Promise<void> {
    try {
      const Redis = await import('ioredis');
      this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    } catch (error) {
      console.warn('Redis not available, using memory cache fallback');
      this.redis = new Map();
    }
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis instanceof Map) {
        return this.redis.get(key) || null;
      }
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      if (this.redis instanceof Map) {
        this.redis.set(key, value);
        setTimeout(() => this.redis.delete(key), ttl * 1000);
      } else {
        await this.redis.setex(key, ttl, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.redis instanceof Map) {
        for (const key of this.redis.keys()) {
          if (key.includes(pattern)) {
            this.redis.delete(key);
          }
        }
      } else {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

export const redisCache = new RedisCache();

// Cache configurations
export const CACHE_CONFIGS = {
  AGENT_SUGGESTIONS: { ttl: 300, keyPrefix: 'agent_suggestions:' },
  EMBEDDINGS: { ttl: 3600, keyPrefix: 'embeddings:' },
  USER_SESSIONS: { ttl: 1800, keyPrefix: 'user_sessions:' }
} as const;
```

**Step 11.6: Add Health Checks (15 min)**

```typescript
// src/lib/monitoring/health-checks.ts
interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  details?: any;
}

export class HealthChecker {
  async checkDatabase(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { error } = await supabase.from('agents').select('id').limit(1);
      const responseTime = Date.now() - start;
      
      return {
        service: 'database',
        status: error ? 'unhealthy' : 'healthy',
        responseTime,
        details: error ? { error: error.message } : undefined
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
  
  async checkOpenAI(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });
      
      const responseTime = Date.now() - start;
      const isHealthy = response.ok;
      
      return {
        service: 'openai',
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        details: isHealthy ? undefined : { status: response.status }
      };
    } catch (error) {
      return {
        service: 'openai',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
  
  async checkAll(): Promise<HealthCheckResult[]> {
    return Promise.all([
      this.checkDatabase(),
      this.checkOpenAI()
    ]);
  }
}

export const healthChecker = new HealthChecker();
```

**Step 11.7: Integrate All Improvements (15 min)**

```typescript
// src/app/api/chat/route.ts
// Add comprehensive validation and monitoring:

import { validateAndSanitizeInput } from '@/lib/utils/input-validation';
import { chatRateLimiter } from '@/lib/utils/rate-limiter';
import { auditLogger } from '@/lib/monitoring/audit-logger';
import { redisCache, CACHE_CONFIGS } from '@/lib/cache/redis-cache';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const rateLimitResult = await chatRateLimiter.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
    
    const body = await request.json();
    
    // Input validation
    const validation = validateAndSanitizeInput(body.message);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.errors }),
        { status: 400 }
      );
    }
    
    // Use sanitized input
    body.message = validation.sanitizedInput;
    
    // Audit logging
    await auditLogger.logMessageSent(
      body.userId || 'anonymous',
      body.sessionId || 'unknown',
      body.message.length,
      request
    );
    
    // Check cache for similar queries
    const cacheKey = `${CACHE_CONFIGS.AGENT_SUGGESTIONS.keyPrefix}${body.message}`;
    const cachedResult = await redisCache.get(cacheKey);
    if (cachedResult) {
      return new Response(JSON.stringify(cachedResult), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Process with existing workflow...
    const result = await streamModeAwareWorkflow(body);
    
    // Cache successful results
    await redisCache.set(cacheKey, result, CACHE_CONFIGS.AGENT_SUGGESTIONS.ttl);
    
    return result;
    
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
```

### Success Criteria

- [ ] All deprecated LangChain imports updated to modern versions
- [ ] Input validation prevents XSS and SQL injection
- [ ] Rate limiting prevents abuse (10 requests/minute per IP)
- [ ] Audit logging captures all user actions for compliance
- [ ] Redis caching reduces API calls by 60%
- [ ] Health checks monitor database and OpenAI availability
- [ ] Error handling includes retry with exponential backoff
- [ ] Security headers prevent common attacks
- [ ] Performance monitoring tracks response times
- [ ] Circuit breakers prevent cascade failures

---

## Success Criteria

### Functional Requirements

- [ ] Agent panel visible in manual mode
- [ ] Agent panel hidden in automatic mode
- [ ] Cannot send without agent in manual mode
- [ ] Can send without agent in automatic mode
- [ ] All agent selection through LangGraph (verified)
- [ ] Proper error messages
- [ ] No "Processing..." stuck states
- [ ] Mode switching works seamlessly

### Non-Functional Requirements

- [ ] Agent selection < 100ms response time
- [ ] Search debounce working (300ms)
- [ ] No memory leaks
- [ ] Proper cleanup on unmount
- [ ] TypeScript: 0 errors
- [ ] Console: 0 warnings (except expected)

### User Experience

- [ ] Agent selection intuitive (< 3 clicks)
- [ ] Error messages clear and actionable
- [ ] Loading states obvious
- [ ] Mode indicators visible
- [ ] Smooth transitions between modes

---

## Rollback Plan

### If Critical Issues

1. **Immediate** (< 5 min): Revert chat page
   ```bash
   git checkout HEAD~1 src/app/(app)/chat/page.tsx
   npm run build
   ```

2. **Partial** (10 min): Keep new components, use old layout
   ```bash
   git checkout HEAD~1 src/app/(app)/chat/page.tsx
   # Keep new components for future use
   ```

3. **Full** (15 min): Complete rollback
   ```bash
   git reset --hard HEAD~N  # N = number of commits
   npm install
   npm run build
   ```


---

## Timeline

| Phase | Time | Priority |
|-------|------|----------|
| Verification | 65 min | Critical |
| Phase 1: Agent Panel Integration | 45 min | High |
| Phase 2: Chat Header | 30 min | Medium |
| Phase 3: Chat Input | 30 min | Medium |
| Phase 4: Async Acknowledgment | 20 min | High |
| Phase 5: Three-Layer Validation | 30 min | High |
| Phase 6: Retry Logic | 25 min | Medium |
| Phase 7: LangGraph Verification | 30 min | Critical |
| Phase 8: Integration Testing | 45 min | Critical |
| Phase 9: Performance Optimization | 30 min | Low |
| Phase 10: Documentation | 20 min | Low |
| **Phase 11: Leading Practices** | **120 min** | **High** |
| **TOTAL** | **8 hours** | - |

**Recommended Schedule**: 1.5 days implementation + testing

---

## Key Files Modified

### New Files

- `src/components/chat/chat-header.tsx`
- `src/components/chat/chat-input.tsx`
- `src/lib/utils/retry.ts`
- `src/lib/utils/input-validation.ts`
- `src/lib/utils/rate-limiter.ts`
- `src/lib/monitoring/audit-logger.ts`
- `src/lib/cache/redis-cache.ts`
- `src/lib/monitoring/health-checks.ts`
- `src/lib/security/encryption.ts`
- `src/components/chat/README.md`

### Modified Files

- `src/app/(app)/chat/page.tsx` - Add agent panel integration
- `src/lib/stores/chat-store.ts` - Async acknowledgment, validation, retry
- `src/components/chat/agent-selection-panel.tsx` - Add debounce optimization
- `src/components/chat/chat-container.tsx` - Use new ChatInput component
- `src/features/chat/services/enhanced-langchain-service.ts` - Update deprecated imports
- `src/app/api/chat/route.ts` - Add rate limiting and validation

### No Changes Needed

- `src/components/ui/chat-container.tsx` - Already has return statement
- `src/features/chat/services/ask-expert-graph.ts` - Already validated
- `src/features/chat/services/workflow-nodes.ts` - Already uses LangGraph
- `src/features/chat/services/automatic-orchestrator.ts` - Already uses database

---

## Critical Reminders

1. ✅ **All agent selection MUST go through LangGraph workflow nodes**
2. ✅ **No hardcoded agent lists - all from database**
3. ✅ **Three-layer validation: Store → UI → Backend**
4. ✅ **Async acknowledgment pattern for agent selection**
5. ✅ **Proper cleanup of AbortController**
6. ✅ **Exponential backoff for retries**
7. ✅ **Mode-specific UI: Panel only in manual mode**
8. ✅ **Clear error messages with actionable guidance**
9. ✅ **Production-grade security and monitoring**
10. ✅ **Leading practices for LangChain/LangGraph**

**END OF PLAN**

### To-dos

- [ ] Verify all ✅ COMPLETED items are truly complete (7 checks)
- [ ] Integrate AgentSelectionPanel into chat page layout with conditional rendering
- [ ] Create ChatHeader component with mode indicators and agent info
- [ ] Create ChatInput component with validation and keyboard shortcuts
- [ ] Fix store async acknowledgment pattern for setSelectedAgent
- [ ] Implement complete three-layer validation (Store, UI, Backend)
- [ ] Create retry utility with exponential backoff and integrate into store
- [ ] Verify all agent orchestration uses LangGraph (no hardcoded scripts)
- [ ] Run comprehensive integration tests (manual, automatic, mode switching, errors)
- [ ] Add debounce, memoization, and AbortController cleanup
- [ ] Add JSDoc comments and create component README
- [ ] **Update deprecated LangChain imports to modern versions**
- [ ] **Implement input validation and sanitization**
- [ ] **Add rate limiting and audit logging**
- [ ] **Integrate Redis caching layer**
- [ ] **Add health checks and monitoring**
- [ ] **Implement comprehensive error handling and security**
