# 🏆 GOLD STANDARD Ask Expert UI - Implementation Plan

**Date:** November 2, 2025  
**Goal:** Merge the best features from all page versions into ONE ultimate UI  
**Backup:** page-backup-before-gold.tsx created ✅

---

## 📊 Feature Matrix - What to Take From Each

### From page.tsx (Current - 2,242 lines) ⭐⭐⭐⭐⭐
**KEEP ALL OF THESE:**
- ✅ Full conversation management + history
- ✅ Chat history sidebar integration (`ChatHistoryProvider`, `useChatHistory`)
- ✅ AskExpert context provider integration
- ✅ Attachment support (`attachments`, `File[]` handling)
- ✅ Dark mode toggle (`darkMode` state)
- ✅ Token counter (`tokenCount` display)
- ✅ Comprehensive streaming logic (all event types)
- ✅ Mode 1-4 system with simple toggles
- ✅ Agent memory display (`primaryAgentMemory`)
- ✅ RAG domain selection
- ✅ Tool selection
- ✅ Prompt starters
- ✅ Conversation sidebar
- ✅ Branch handling (multi-path responses)
- ✅ Full metadata collection (sources, reasoning, autonomous)
- ✅ `EnhancedMessageDisplay` component
- ✅ `InlineArtifactGenerator` component
- ✅ Debug logs (keep for now, can remove later)

### From page-complete.tsx (701 lines) ⭐⭐⭐⭐
**ADD THESE:**
- ✅ `AdvancedStreamingWindow` component (lines 619-628)
- ✅ Workflow steps tracking (`workflowSteps` state)
- ✅ Reasoning steps tracking (`reasoningSteps` state with type: thought/action/observation)
- ✅ Streaming metrics (`streamingMetrics` with tokensPerSecond, elapsedTime)
- ✅ Pause/Resume streaming controls
- ✅ Session stats tracking (`SessionStats` interface)
- ✅ Cleaner tab layout approach (optional)

### From page-enhanced.tsx (590 lines) ⚠️
**SKIP - Too basic:**
- ❌ Uses ReactMarkdown instead of EnhancedMessageDisplay
- ❌ Missing most features

### From beta/page.tsx (701 lines)
**Same as page-complete.tsx** - already covered above

---

## 🎯 Implementation Strategy

### Phase 1: Add Missing Interfaces & State (✅ Easy)
Add to page.tsx around line 150:
```tsx
interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  startTime?: Date;
  endTime?: Date;
}

interface ReasoningStep {
  id: string;
  type: 'thought' | 'action' | 'observation';
  content: string;
  confidence?: number;
  timestamp: Date;
}

interface StreamingMetrics {
  tokensGenerated: number;
  tokensPerSecond: number;
  elapsedTime: number;
  estimatedTimeRemaining?: number;
}

interface SessionStats {
  totalConversations: number;
  totalMessages: number;
  avgSessionDuration: string;
  mostUsedMode: string;
  mostUsedAgent: string;
}
```

Add state variables around line 216:
```tsx
const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
const [streamingMetrics, setStreamingMetrics] = useState<StreamingMetrics>({
  tokensGenerated: 0,
  tokensPerSecond: 0,
  elapsedTime: 0
});
const [isPaused, setIsPaused] = useState(false);
const [sessionStats, setSessionStats] = useState<SessionStats>({
  totalConversations: 0,
  totalMessages: 0,
  avgSessionDuration: '0m',
  mostUsedMode: 'Mode 1',
  mostUsedAgent: ''
});
```

---

### Phase 2: Add AdvancedStreamingWindow Import (✅ Easy)
Add to imports section (around line 31):
```tsx
import { AdvancedStreamingWindow } from '@/features/ask-expert/components/AdvancedStreamingWindow';
```

---

### Phase 3: Enhance Streaming Logic (⚠️ Moderate)
In `handleSend` function, around where we process stream chunks:

**Add workflow step tracking:**
```tsx
// When agent_selection event
case 'agent_selection': {
  setWorkflowSteps(prev => [
    ...prev.filter(s => s.id !== 'agent-selection'),
    {
      id: 'agent-selection',
      name: 'Agent Selection',
      status: 'completed',
      startTime: new Date(),
      endTime: new Date()
    }
  ]);
  // ... existing code
}

// When RAG starts
if (data.type === 'source' || data.type === 'sources') {
  setWorkflowSteps(prev => {
    const existing = prev.find(s => s.id === 'rag-retrieval');
    if (!existing) {
      return [...prev, {
        id: 'rag-retrieval',
        name: 'Knowledge Retrieval',
        status: 'running',
        startTime: new Date()
      }];
    }
    return prev;
  });
}

// When content starts streaming
if (data.type === 'content' && fullResponse.length === 0) {
  setWorkflowSteps(prev => [
    ...prev.map(s => s.id === 'rag-retrieval' ? {...s, status: 'completed', endTime: new Date()} : s),
    {
      id: 'response-generation',
      name: 'Response Generation',
      status: 'running',
      startTime: new Date()
    }
  ]);
}
```

**Add reasoning step tracking:**
```tsx
// When thought event
else if (data.type === 'thought') {
  setReasoningSteps(prev => [
    ...prev,
    {
      id: `thought-${Date.now()}`,
      type: 'thought',
      content: data.content,
      confidence: data.metadata?.confidence,
      timestamp: new Date()
    }
  ]);
  // ... existing code
}

// When action event
else if (data.type === 'action') {
  setReasoningSteps(prev => [
    ...prev,
    {
      id: `action-${Date.now()}`,
      type: 'action',
      content: data.content,
      timestamp: new Date()
    }
  ]);
  // ... existing code
}

// When observation event
else if (data.type === 'observation') {
  setReasoningSteps(prev => [
    ...prev,
    {
      id: `observation-${Date.now()}`,
      type: 'observation',
      content: data.content,
      timestamp: new Date()
    }
  ]);
  // ... existing code
}
```

**Add streaming metrics tracking:**
```tsx
// At start of streaming
const streamStartTime = Date.now();
let totalTokens = 0;

// During content streaming
if (data.type === 'content') {
  totalTokens += (data.content?.length || 0);
  const elapsedSeconds = (Date.now() - streamStartTime) / 1000;
  setStreamingMetrics({
    tokensGenerated: totalTokens,
    tokensPerSecond: totalTokens / elapsedSeconds,
    elapsedTime: elapsedSeconds,
    estimatedTimeRemaining: undefined // Can calculate based on estimated total
  });
}
```

---

### Phase 4: Add Pause/Resume Handlers (✅ Easy)
Add around line 400:
```tsx
const handlePauseStreaming = useCallback(() => {
  setIsPaused(true);
  // Note: Actual pause logic would need backend support
  // For now, just update UI state
}, []);

const handleResumeStreaming = useCallback(() => {
  setIsPaused(false);
}, []);
```

---

### Phase 5: Add AdvancedStreamingWindow to JSX (✅ Easy)
In the messages area, around line 1842, **BEFORE the messages list**:
```tsx
{/* Advanced Streaming Window */}
{isLoading && (
  <div className="mb-6">
    <AdvancedStreamingWindow
      workflowSteps={workflowSteps}
      reasoningSteps={reasoningSteps}
      metrics={streamingMetrics}
      isStreaming={isLoading}
      canPause={true}
      onPause={handlePauseStreaming}
      onResume={handleResumeStreaming}
    />
  </div>
)}
```

---

### Phase 6: Add Session Stats Tracking (✅ Easy - Optional)
Add handlers for tracking:
```tsx
const updateSessionStats = useCallback(() => {
  setSessionStats(prev => ({
    totalConversations: conversations.length,
    totalMessages: messages.length,
    avgSessionDuration: calculateAvgDuration(conversations),
    mostUsedMode: calculateMostUsedMode(conversations),
    mostUsedAgent: calculateMostUsedAgent(messages)
  }));
}, [conversations, messages]);

useEffect(() => {
  updateSessionStats();
}, [updateSessionStats]);
```

---

### Phase 7: Reset State on New Message (✅ Easy)
At start of `handleSend`:
```tsx
// Reset streaming state
setWorkflowSteps([]);
setReasoningSteps([]);
setStreamingMetrics({
  tokensGenerated: 0,
  tokensPerSecond: 0,
  elapsedTime: 0
});
```

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  GOLD STANDARD ASK EXPERT                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FROM page.txt (2,242 lines):                              │
│  ✅ Conversation Management                                 │
│  ✅ Chat History Sidebar                                    │
│  ✅ Attachments                                            │
│  ✅ Dark Mode                                               │
│  ✅ Token Counter                                           │
│  ✅ Mode 1-4 System                                         │
│  ✅ Agent Memory Display                                    │
│  ✅ RAG/Tool Selection                                      │
│  ✅ EnhancedMessageDisplay                                  │
│  ✅ Full Metadata Collection                                │
│                                                             │
│  ADDING from page-complete.tsx (701 lines):                │
│  ➕ AdvancedStreamingWindow                                 │
│  ➕ Workflow Steps Tracking                                 │
│  ➕ Reasoning Steps (typed)                                 │
│  ➕ Streaming Metrics                                       │
│  ➕ Pause/Resume Controls                                   │
│  ➕ Session Stats                                           │
│                                                             │
│  RESULT:                                                    │
│  🏆 Most comprehensive Ask Expert UI                        │
│  🏆 All advanced features integrated                        │
│  🏆 Best UX from all versions                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Enhancements

### Visual Flow:
```
┌──────────────────────────────────────────────┐
│  Chat History Sidebar │ Main Chat Area       │
│  (Existing)            │                      │
│                        │  [Mode Selector]     │
│  ├─ Conversation 1     │  [Agent Memory]      │
│  ├─ Conversation 2     │                      │
│  └─ Conversation 3     │  ┌────────────────┐ │
│                        │  │ ADVANCED       │ │ ← NEW!
│  [Dark Mode Toggle]    │  │ STREAMING      │ │
│  [Token Counter]       │  │ WINDOW         │ │
│                        │  │ • Workflow     │ │
│                        │  │ • Reasoning    │ │
│                        │  │ • Metrics      │ │
│                        │  └────────────────┘ │
│                        │                      │
│                        │  [Messages with      │
│                        │   Enhanced Display]  │
│                        │                      │
│                        │  [Prompt Input +     │
│                        │   Attachments]       │
└──────────────────────────────────────────────┘
```

---

## 🔧 Implementation Checklist

- [x] Phase 1: Add interfaces & state ✅
- [ ] Phase 2: Add AdvancedStreamingWindow import
- [ ] Phase 3: Enhance streaming logic
- [ ] Phase 4: Add pause/resume handlers
- [ ] Phase 5: Add component to JSX
- [ ] Phase 6: Add session stats (optional)
- [ ] Phase 7: Reset state on new message
- [ ] Phase 8: Test all modes
- [ ] Phase 9: Clean up debug logs (optional)
- [ ] Phase 10: Update documentation

---

## 📊 Expected File Size

**Current page.tsx:** 2,242 lines  
**+AdvancedStreamingWindow logic:** ~150 lines  
**+Enhanced tracking:** ~100 lines  
**+Pause/Resume:** ~30 lines  
**+Session stats:** ~50 lines  
**= Gold Standard:** ~2,570 lines

Still reasonable for a comprehensive enterprise UI!

---

## 🎯 Success Criteria

After implementation, the Gold Standard UI will have:
- ✅ ALL features from current page.tsx
- ✅ AdvancedStreamingWindow showing live progress
- ✅ Workflow step visualization
- ✅ Typed reasoning steps (thought/action/observation)
- ✅ Real-time streaming metrics
- ✅ Pause/resume capability (UI ready, backend when available)
- ✅ Session statistics
- ✅ Clean, maintainable code
- ✅ Optimal performance

---

## 🚀 Next Steps

1. Implement Phase 1-7 in sequence
2. Test each phase incrementally
3. Verify no regressions
4. Test all 4 modes with new UI
5. Document new features
6. Optional: Remove debug logs
7. Optional: Add session stats display to sidebar

---

**Status:** Ready to implement ✅  
**Estimated Time:** 30-45 minutes  
**Confidence:** 95%

