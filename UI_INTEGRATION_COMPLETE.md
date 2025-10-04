# UI Integration Complete Guide

## Current Chat Architecture

Your chat system uses:
- **Main Interface**: [enhanced-chat-interface.tsx](src/features/chat/components/enhanced-chat-interface.tsx)
- **Message Display**: [chat-messages.tsx](src/features/chat/components/chat-messages.tsx)
- **Input**: [chat-input.tsx](src/features/chat/components/chat-input.tsx)
- **Orchestrators**: MasterOrchestrator, EnhancedConversationManager

## Integration Strategy

### Option 1: Add to Existing MasterOrchestrator (Recommended)

Your system already has orchestrators. Enhance them with the new enhanced-agent-orchestrator.

#### Step 1: Update MasterOrchestrator

File: `/services/orchestration/master-orchestrator.ts`

```typescript
// Add import
import { enhancedAgentOrchestrator } from '@/features/chat/services/enhanced-agent-orchestrator';
import type { Citation, ThinkingStep } from '@/features/chat/services/enhanced-agent-orchestrator';

// In your orchestration method, add option to use enhanced agent:
async orchestrate(params: {
  message: string;
  mode: 'single' | 'multi' | 'advisory';
  agentId?: string;
  useEnhancedTools?: boolean; // NEW
}) {
  if (params.mode === 'single' && params.useEnhancedTools && params.agentId) {
    // Use enhanced orchestrator with 13 tools
    return await enhancedAgentOrchestrator.chat({
      agentId: params.agentId,
      message: params.message,
      conversationHistory: this.getHistory(),
      conversationId: this.conversationId,
      userId: this.userId,
      onThinkingUpdate: (step) => {
        this.emit('thinking-update', step);
      }
    });
  }

  // Existing orchestration logic...
}
```

#### Step 2: Update ChatMessages Component

File: `/src/features/chat/components/chat-messages.tsx`

```typescript
// Add imports at top
import { ToolUsageDisplay } from './tool-usage-display';
import { CitationDisplay } from './citation-display';
import { Badge } from '@/shared/components/ui/badge';

// In message rendering (find where messages are mapped):
{messages.map((message) => (
  <div key={message.id} className="message-wrapper">
    {/* Existing message content */}
    <div className="message-content">
      {message.content}
    </div>

    {/* NEW: Tool Usage Display */}
    {message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0 && (
      <div className="mt-3">
        <ToolUsageDisplay
          toolCalls={message.toolCalls}
          compact={false}
        />
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
  </div>
))}
```

#### Step 3: Update Message Type

Add enhanced fields to your message interface (likely in types file):

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // NEW: Enhanced fields
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
    authors?: string[];
    date?: string;
  }>;
  confidence?: number;
  confidenceLevel?: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
}
```

### Option 2: Create Separate Enhanced Mode (Alternative)

Add a toggle in your chat interface to enable "Enhanced Mode" with tools.

#### Add Toggle to ChatInterface

```typescript
// In enhanced-chat-interface.tsx
const [enhancedMode, setEnhancedMode] = useState(false);

// Add toggle in header or settings
<div className="flex items-center gap-2">
  <Switch
    checked={enhancedMode}
    onCheckedChange={setEnhancedMode}
  />
  <label>Enhanced Tools Mode</label>
</div>

// When sending message, check mode:
const handleSendMessage = async (message: string) => {
  if (enhancedMode && selectedAgent) {
    // Use enhanced orchestrator
    const response = await enhancedAgentOrchestrator.chat({
      agentId: selectedAgent.id,
      message,
      conversationHistory: messages,
      conversationId: currentChat?.id,
      userId: session?.user?.id
    });

    // Add enhanced response to messages
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
  } else {
    // Use existing orchestration
    await onSendMessage?.(message);
  }
};
```

## Quick Integration Steps

### 5-Minute Quick Test

1. **Add imports** to `chat-messages.tsx`:
```typescript
import { ToolUsageDisplay } from './tool-usage-display';
import { CitationDisplay } from './citation-display';
```

2. **Add display components** after message content in `chat-messages.tsx`:
```typescript
{message.toolCalls && <ToolUsageDisplay toolCalls={message.toolCalls} />}
{message.citations && <CitationDisplay citations={message.citations} format="apa" />}
```

3. **Test with mock data** - add to a test message:
```typescript
const testMessage = {
  id: '1',
  role: 'assistant',
  content: 'Based on clinical trials...',
  toolCalls: [{
    toolName: 'pubmed_search',
    input: { query: 'psoriasis biologics' },
    output: '{"results": [...]}',
    timestamp: new Date().toISOString(),
    duration: 1500
  }],
  citations: [{
    type: 'pubmed',
    id: 'PMC12345',
    title: 'Clinical efficacy of biologics in psoriasis',
    source: 'PubMed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/12345',
    relevance: 0.9
  }]
};
```

## Testing Checklist

### Test 1: Tool Usage Display
- [ ] Import ToolUsageDisplay component
- [ ] Add to message rendering
- [ ] Test with mock toolCalls data
- [ ] Verify tool icons and badges appear
- [ ] Test expand/collapse functionality

### Test 2: Citation Display
- [ ] Import CitationDisplay component
- [ ] Add to message rendering
- [ ] Test with mock citations data
- [ ] Verify citation formatting (APA)
- [ ] Test clickable links

### Test 3: Enhanced Orchestrator
- [ ] Import enhancedAgentOrchestrator
- [ ] Replace or add alongside existing orchestrator
- [ ] Test with real agent query
- [ ] Verify tools are called
- [ ] Verify citations are extracted

### Test 4: Full Integration
- [ ] Send query: "What clinical trials exist for psoriasis biologics?"
- [ ] Verify 2-3 tools used (PubMed, ClinicalTrials.gov)
- [ ] Verify 5-10 citations displayed
- [ ] Verify confidence score shown
- [ ] Verify all citations are clickable

## Troubleshooting

### Issue: "Cannot find module './tool-usage-display'"
**Fix**: Verify file exists at `/src/features/chat/components/tool-usage-display.tsx`

### Issue: "toolCalls is undefined"
**Fix**: Add optional chaining:
```typescript
{message.toolCalls?.length > 0 && <ToolUsageDisplay.../>}
```

### Issue: "enhancedAgentOrchestrator is not a function"
**Fix**: Check import path and ensure file exists:
```typescript
import { enhancedAgentOrchestrator } from '../services/enhanced-agent-orchestrator';
```

### Issue: Tools not loading
**Fix**: Verify database migration:
```bash
node scripts/apply-tool-registry-migration.js
```

### Issue: No citations appearing
**Fix**: Check tool outputs are in correct JSON format. Add logging:
```typescript
console.log('Tool output:', toolCall.output);
```

## Environment Variables Needed

Add to `.env.local`:

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (for specific tools)
TAVILY_API_KEY=...           # Web search
LANGCHAIN_API_KEY=...        # Debugging
LANGCHAIN_TRACING_V2=true    # Optional tracing
```

## File Checklist

### Created Files (Phase 1) ✅
- [x] `/src/features/chat/services/enhanced-agent-orchestrator.ts` (15KB)
- [x] `/src/features/chat/components/tool-usage-display.tsx` (5.2KB)
- [x] `/src/features/chat/components/citation-display.tsx` (8.4KB)

### Files to Modify
- [ ] `/src/features/chat/components/chat-messages.tsx` - Add display components
- [ ] `/services/orchestration/master-orchestrator.ts` - Integrate enhanced orchestrator
- [ ] `/types/...` - Update Message interface

### Optional Modifications
- [ ] `/src/features/chat/components/enhanced-chat-interface.tsx` - Add enhanced mode toggle
- [ ] `/src/features/chat/components/chat-header.tsx` - Add tools indicator

## Success Criteria

After integration, you should see:

✅ **Tool Transparency**
- Users see which tools were used for each response
- Tool inputs and outputs are visible
- Tool execution time is displayed

✅ **Evidence-Based Responses**
- Citations appear below agent responses
- 5-10 citations per complex query
- Citations are clickable and formatted

✅ **Confidence Scoring**
- Confidence percentage shown (60-95%)
- Higher for regulatory/clinical sources
- Visual badge indicating confidence level

## Next Steps After Integration

### Immediate (Week 1)
1. Test with 3 sample queries
2. Verify all tools work correctly
3. Check citation extraction accuracy
4. Monitor tool usage in database

### Phase 2 (Week 2)
- Add confidence badge component
- Add evidence summary cards
- Add enhanced thinking indicators

### Phase 3 (Week 3)
- Add mini risk assessment
- Add action item extraction
- Add Ask 3 Experts feature

## Support

- **Integration Guide**: [PHASE1_UI_INTEGRATION_GUIDE.md](PHASE1_UI_INTEGRATION_GUIDE.md)
- **Full Implementation**: [COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md](COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md)
- **Quick Reference**: [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)

---

**Current Status**: Phase 1 files created ✅ | UI integration in progress
**Estimated Time**: 30-60 minutes for basic integration
**Expected Result**: Individual agents with 13 tools, citations, and transparency
