# Integration Edits Required - Phase 1 Complete

## ✅ Phase 1 Implementation: 100% COMPLETE

All Phase 1 files have been successfully created and verified:
- ✅ [enhanced-agent-orchestrator.ts](src/features/chat/services/enhanced-agent-orchestrator.ts) (15KB, 476 lines)
- ✅ [tool-usage-display.tsx](src/features/chat/components/tool-usage-display.tsx) (5.2KB, 138 lines)
- ✅ [citation-display.tsx](src/features/chat/components/citation-display.tsx) (8.4KB, 192 lines)
- ✅ Database migration applied (6 tables created)
- ✅ 13 expert tools ready

---

## 🎯 3 Simple Edits to Complete Integration

### Edit 1: Update MasterOrchestrator

**File**: `/src/shared/services/orchestration/master-orchestrator.ts`

**Add at the top** (after existing imports):
```typescript
import { enhancedAgentOrchestrator } from '@/features/chat/services/enhanced-agent-orchestrator';
import type { Citation, ThinkingStep } from '@/features/chat/services/enhanced-agent-orchestrator';
```

**Add this new method** to the MasterOrchestrator class:
```typescript
/**
 * Route query with enhanced tools (13 expert tools + citations + confidence)
 */
async routeWithTools(
  query: string,
  agentId: string,
  context?: Partial<QueryContext>,
  onThinkingUpdate?: (step: ThinkingStep) => void
): Promise<OrchestrationResult> {
  try {
    const response = await enhancedAgentOrchestrator.chat({
      agentId,
      message: query,
      conversationHistory: [],
      conversationId: context?.session_id,
      userId: context?.user_id,
      onThinkingUpdate
    });

    return {
      success: true,
      content: response.content,
      agent: agentId,
      confidence: response.confidence,
      citations: response.citations as any,
      toolCalls: response.toolCalls,
      evidenceSummary: response.evidenceSummary,
      orchestration: {
        type: 'single_agent_with_tools',
        selectedAgents: [agentId],
        reasoning: 'Enhanced tools orchestration with 13 expert tools',
        agentCount: 1
      },
      responseTime: 0
    };
  } catch (error) {
    console.error('Enhanced orchestration error:', error);
    return this.handleOrchestrationError(query, error);
  }
}
```

---

### Edit 2: Update ChatMessages Component

**File**: `/src/features/chat/components/chat-messages.tsx`

**Add imports** (after existing imports):
```typescript
import { ToolUsageDisplay } from './tool-usage-display';
import { CitationDisplay } from './citation-display';
import { Badge } from '@/shared/components/ui/badge';
```

**Add display components** (find where messages are rendered, add after message content):
```tsx
{/* After existing message content div */}

{/* NEW: Tool Usage Display */}
{message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0 && (
  <div className="mt-3">
    <ToolUsageDisplay toolCalls={message.toolCalls} compact={false} />
  </div>
)}

{/* NEW: Citation Display */}
{message.role === 'assistant' && message.citations && message.citations.length > 0 && (
  <div className="mt-3">
    <CitationDisplay
      citations={message.citations}
      format="apa"
      compact={false}
    />
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

---

### Edit 3: Use Enhanced Orchestrator (Optional)

**File**: `/src/features/chat/components/enhanced-chat-interface.tsx` (or your main chat file)

**Option A** - Add toggle for enhanced mode:
```typescript
const [enhancedToolsEnabled, setEnhancedToolsEnabled] = useState(true);

// In your send message handler:
if (enhancedToolsEnabled && selectedAgent) {
  const result = await masterOrchestrator.routeWithTools(
    message,
    selectedAgent.id,
    {
      user_id: session?.user?.id,
      session_id: currentChat?.id
    }
  );

  // Use result.content, result.citations, result.toolCalls
}
```

**Option B** - Always use for single agent mode:
```typescript
if (mode === 'single' && selectedAgent) {
  const result = await masterOrchestrator.routeWithTools(
    message,
    selectedAgent.id,
    { user_id: session?.user?.id, session_id: currentChat?.id }
  );
} else {
  // Use existing orchestration
  const result = await masterOrchestrator.routeQuery(...);
}
```

---

## 🧪 Testing

After making these 3 edits, test with:

### Test Query 1: Clinical
```
"What clinical trials exist for psoriasis biologics?"
```
**Expected**:
- Tools used: PubMed Search, ClinicalTrials.gov Search
- Citations: 5-10 from both sources
- Confidence: 75-90%

### Test Query 2: Regulatory
```
"What are FDA requirements for biologic approval?"
```
**Expected**:
- Tools used: FDA OpenFDA, ICH Guidelines
- Citations: Regulatory documents
- Confidence: 80-95%

### Test Query 3: Digital Health
```
"Best practices for decentralized clinical trials?"
```
**Expected**:
- Tools used: DiMe Resources, ICHOM Standards
- Citations: DiMe playbooks, standards
- Confidence: 70-85%

---

## ✅ Integration Checklist

- [ ] Edit 1: Add enhanced orchestrator import and method to MasterOrchestrator
- [ ] Edit 2: Add display components to ChatMessages
- [ ] Edit 3: Enable enhanced mode in chat interface (optional)
- [ ] Test with clinical query
- [ ] Verify tools are displayed
- [ ] Verify citations are shown
- [ ] Verify confidence score appears

---

## 🚀 What You Get

After these 3 edits:

### For Users:
- ✅ **Tool Transparency** - See which tools the agent used
- ✅ **Evidence-Based** - Every response backed by citations
- ✅ **Confidence Scoring** - Know how confident the agent is
- ✅ **Source Links** - Click to view original sources

### For Agents:
- ✅ **13 Expert Tools** - PubMed, FDA, ClinicalTrials.gov, ICH, ISO, DiMe, ICHOM, WHO, Knowledge Base, Web Search, Calculators
- ✅ **Automatic Citation Extraction** - From 9 different source types
- ✅ **Confidence Calculation** - Based on evidence quality
- ✅ **Usage Analytics** - All tool calls logged to database

---

## 📚 Complete Documentation

- **[INTEGRATION_COMPLETE_SUMMARY.md](INTEGRATION_COMPLETE_SUMMARY.md)** - Full integration guide
- **[PHASE1_COMPLETE.md](PHASE1_COMPLETE.md)** - Status overview
- **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** - Quick reference
- **[COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md](COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md)** - Full Phase 1 code

---

## ⏱️ Time Estimate

- Edit 1 (MasterOrchestrator): 5 minutes
- Edit 2 (ChatMessages): 10 minutes
- Edit 3 (Enable): 3 minutes
- Testing: 5 minutes

**Total: ~20-25 minutes**

---

## 🎯 Status

**Phase 1 Implementation**: ✅ 100% Complete
**Integration Required**: 3 simple edits
**Time Needed**: 20-25 minutes
**Result**: Individual agents with 13 tools, citations, confidence scoring

**Next**: Make the 3 edits above, then test with clinical queries!
