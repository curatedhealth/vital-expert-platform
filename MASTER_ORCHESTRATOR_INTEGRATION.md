# Master Orchestrator Integration - Quick Guide

## ✅ Phase 1 Files Created Successfully

All three files are created and ready:
- [enhanced-agent-orchestrator.ts](src/features/chat/services/enhanced-agent-orchestrator.ts) (15KB)
- [tool-usage-display.tsx](src/features/chat/components/tool-usage-display.tsx) (5.2KB)
- [citation-display.tsx](src/features/chat/components/citation-display.tsx) (8.4KB)

## 🎯 Integration Steps

### Step 1: Update MasterOrchestrator

**File**: `/src/shared/services/orchestration/master-orchestrator.ts`

Add at the top:
```typescript
import { enhancedAgentOrchestrator } from '@/features/chat/services/enhanced-agent-orchestrator';
import type { Citation, ThinkingStep } from '@/features/chat/services/enhanced-agent-orchestrator';
```

Find your main orchestrate/chat method and add enhanced mode option:
```typescript
// Add parameter for enhanced tools
async orchestrate(params: {
  // ... existing params
  useEnhancedTools?: boolean;  // NEW
  onThinkingUpdate?: (step: ThinkingStep) => void;  // NEW
}) {
  // For single agent mode with enhanced tools
  if (params.mode === 'single' && params.useEnhancedTools && params.agentId) {
    const response = await enhancedAgentOrchestrator.chat({
      agentId: params.agentId,
      message: params.message,
      conversationHistory: params.history || [],
      conversationId: params.conversationId,
      userId: params.userId,
      onThinkingUpdate: params.onThinkingUpdate
    });

    return {
      content: response.content,
      toolCalls: response.toolCalls,
      citations: response.citations,
      confidence: response.confidence,
      confidenceLevel: response.confidenceLevel,
      evidenceSummary: response.evidenceSummary
    };
  }

  // ... existing orchestration logic
}
```

### Step 2: Update ChatMessages Component

**File**: `/src/features/chat/components/chat-messages.tsx`

Add imports:
```typescript
import { ToolUsageDisplay } from './tool-usage-display';
import { CitationDisplay } from './citation-display';
import { Badge } from '@/shared/components/ui/badge';
```

In your message map, after message content:
```tsx
{/* Existing message content */}
<div className="message-content">
  {message.content}
</div>

{/* NEW: Tool Usage */}
{message.role === 'assistant' && message.toolCalls?.length > 0 && (
  <div className="mt-3">
    <ToolUsageDisplay toolCalls={message.toolCalls} compact={false} />
  </div>
)}

{/* NEW: Citations */}
{message.role === 'assistant' && message.citations?.length > 0 && (
  <div className="mt-3">
    <CitationDisplay citations={message.citations} format="apa" compact={false} />
  </div>
)}

{/* NEW: Confidence Badge */}
{message.role === 'assistant' && message.confidence && (
  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
    <span>Confidence:</span>
    <Badge variant={
      message.confidenceLevel === 'very-high' || message.confidenceLevel === 'high'
        ? 'default'
        : message.confidenceLevel === 'medium'
        ? 'secondary'
        : 'destructive'
    }>
      {Math.round(message.confidence * 100)}%
    </Badge>
  </div>
)}
```

### Step 3: Update Message Type

Add enhanced fields to your Message interface:
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // NEW Enhanced fields
  toolCalls?: Array<{
    toolName: string;
    input: any;
    output: string;
    timestamp: string;
    duration: number;
  }>;
  citations?: Array<{
    type: string;
    id: string;
    title: string;
    source: string;
    url: string;
    relevance: number;
  }>;
  confidence?: number;
  confidenceLevel?: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
}
```

### Step 4: Enable Enhanced Mode in Chat Interface

**File**: `/src/features/chat/components/enhanced-chat-interface.tsx`

Add state and toggle:
```typescript
const [enhancedToolsEnabled, setEnhancedToolsEnabled] = useState(true); // Enable by default

// In your send message handler:
const handleSendMessage = async (message: string) => {
  const response = await masterOrchestrator.orchestrate({
    message,
    mode: mode === 'single' ? 'single' : 'multi',
    agentId: selectedAgent?.id,
    useEnhancedTools: enhancedToolsEnabled,  // NEW
    conversationId: currentChat?.id,
    userId: session?.user?.id,
    onThinkingUpdate: (step) => {
      // Optional: show real-time thinking
      console.log('Thinking:', step.description);
    }
  });

  // Add message with enhanced data
  setMessages(prev => [...prev, {
    id: Date.now().toString(),
    role: 'assistant',
    content: response.content,
    toolCalls: response.toolCalls,
    citations: response.citations,
    confidence: response.confidence,
    confidenceLevel: response.confidenceLevel,
    timestamp: new Date()
  }]);
};
```

## 🧪 Testing

### Test Query 1: Clinical
```
"What clinical trials exist for psoriasis biologics?"
```
**Expected**:
- Tools: PubMed Search, ClinicalTrials.gov Search
- Citations: 5-10 from both sources
- Confidence: 75-90%

### Test Query 2: Regulatory
```
"What are FDA requirements for biologic approval?"
```
**Expected**:
- Tools: FDA OpenFDA, ICH Guidelines
- Citations: Regulatory documents
- Confidence: 80-95%

### Test Query 3: Digital Health
```
"Best practices for decentralized clinical trials?"
```
**Expected**:
- Tools: DiMe Resources, ICHOM Standards
- Citations: DiMe playbooks
- Confidence: 70-85%

## ✅ Integration Checklist

- [ ] Add imports to master-orchestrator.ts
- [ ] Add useEnhancedTools parameter
- [ ] Add enhanced orchestrator call
- [ ] Update chat-messages.tsx imports
- [ ] Add ToolUsageDisplay component
- [ ] Add CitationDisplay component
- [ ] Add confidence badge
- [ ] Update Message interface
- [ ] Enable enhanced mode in chat interface
- [ ] Test with 3 sample queries

## 🚀 Expected Results

After integration:
- ✅ 13 expert tools available
- ✅ Automatic citation extraction
- ✅ Confidence scoring (60-95%)
- ✅ Tool transparency
- ✅ Evidence-based responses

## 📚 Documentation

- [UI_INTEGRATION_COMPLETE.md](UI_INTEGRATION_COMPLETE.md) - Full guide
- [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md) - Overview
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) - Quick reference

---

**Status**: Phase 1 files ready ✅ | Integration guide complete
**Time**: 30-60 minutes
**Result**: Individual agents with 13 tools, citations, transparency
