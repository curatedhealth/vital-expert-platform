# Phase 1 UI Integration Guide

## ✅ Files Successfully Created

All Phase 1 implementation files have been successfully created:

1. ✅ [src/features/chat/services/enhanced-agent-orchestrator.ts](src/features/chat/services/enhanced-agent-orchestrator.ts) (15KB, 476 lines)
2. ✅ [src/features/chat/components/tool-usage-display.tsx](src/features/chat/components/tool-usage-display.tsx) (5.2KB, 138 lines)
3. ✅ [src/features/chat/components/citation-display.tsx](src/features/chat/components/citation-display.tsx) (8.4KB, 192 lines)

---

## 📋 Next Step: UI Integration

### Step 1: Find Your Chat Interface Component

Your chat interface is likely in one of these locations:
- `/src/features/chat/components/chat-interface.tsx`
- `/src/features/chat/components/chat-window.tsx`
- `/src/features/chat/components/agent-chat.tsx`

Let's call it `ChatInterface` for this guide.

---

### Step 2: Add Imports

At the top of your `ChatInterface` component, add:

```typescript
// Add these imports
import { enhancedAgentOrchestrator } from '../services/enhanced-agent-orchestrator';
import { ToolUsageDisplay } from './tool-usage-display';
import { CitationDisplay } from './citation-display';
import type { Citation, ThinkingStep, EnhancedAgentResponse } from '../services/enhanced-agent-orchestrator';
```

---

### Step 3: Add State for Enhanced Features

Add these state variables to your component:

```typescript
const [enhancedResponse, setEnhancedResponse] = useState<EnhancedAgentResponse | null>(null);
const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
const [isThinking, setIsThinking] = useState(false);
```

---

### Step 4: Update Your Send Message Function

Replace your current agent call with the enhanced orchestrator:

```typescript
const sendMessage = async (messageText: string) => {
  setIsLoading(true);
  setIsThinking(true);
  setThinkingSteps([]);

  try {
    // Call the enhanced orchestrator instead of basic agent
    const response = await enhancedAgentOrchestrator.chat({
      agentId: currentAgent.id,
      message: messageText,
      conversationHistory: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      conversationId: conversationId,
      userId: session?.user?.id,
      onThinkingUpdate: (step: ThinkingStep) => {
        // Real-time thinking updates
        setThinkingSteps(prev => {
          const existing = prev.find(s => s.step === step.step);
          if (existing) {
            return prev.map(s => s.step === step.step ? step : s);
          }
          return [...prev, step];
        });
      }
    });

    setEnhancedResponse(response);
    setIsThinking(false);

    // Add the assistant message with enhanced data
    const assistantMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: response.content,
      timestamp: new Date(response.timestamp),
      // Store enhanced data
      toolCalls: response.toolCalls,
      citations: response.citations,
      confidence: response.confidence,
      confidenceLevel: response.confidenceLevel
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Save to database if needed
    if (conversationId) {
      await saveMessageToDatabase(assistantMessage);
    }

  } catch (error) {
    console.error('Enhanced agent error:', error);
    setIsThinking(false);
  } finally {
    setIsLoading(false);
  }
};
```

---

### Step 5: Update Message Display Component

In your message rendering section, add the enhanced components:

```tsx
{messages.map((message) => (
  <div key={message.id} className={cn(
    "flex gap-3",
    message.role === 'user' ? 'justify-end' : 'justify-start'
  )}>
    {/* Existing message display */}
    <div className="flex flex-col gap-2 max-w-[80%]">
      {/* Agent avatar and name */}
      <div className="flex items-center gap-2">
        {message.role === 'assistant' && (
          <>
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentAgent?.avatar_url} />
              <AvatarFallback>{currentAgent?.name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{currentAgent?.name}</span>
          </>
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        "rounded-lg p-4",
        message.role === 'user'
          ? "bg-primary text-primary-foreground"
          : "bg-muted"
      )}>
        <div className="prose prose-sm max-w-none">
          {message.content}
        </div>
      </div>

      {/* NEW: Tool Usage Display */}
      {message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0 && (
        <ToolUsageDisplay
          toolCalls={message.toolCalls}
          compact={false}
        />
      )}

      {/* NEW: Citation Display */}
      {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
        <CitationDisplay
          citations={message.citations}
          format="apa"
          compact={false}
        />
      )}

      {/* NEW: Confidence Badge (optional) */}
      {message.role === 'assistant' && message.confidence && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
  </div>
))}

{/* NEW: Thinking Indicator (while agent is working) */}
{isThinking && thinkingSteps.length > 0 && (
  <div className="flex gap-3 justify-start">
    <div className="flex flex-col gap-2 max-w-[80%]">
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="text-sm font-medium mb-2">Researching...</div>
        <div className="space-y-2">
          {thinkingSteps.map((step) => (
            <div key={step.step} className="flex items-center gap-2 text-xs">
              <div className={cn(
                "h-2 w-2 rounded-full",
                step.status === 'completed' ? "bg-green-500" :
                step.status === 'running' ? "bg-blue-500 animate-pulse" :
                step.status === 'error' ? "bg-red-500" :
                "bg-gray-300"
              )} />
              <span>{step.description}</span>
              {step.duration && (
                <span className="text-muted-foreground">
                  ({(step.duration / 1000).toFixed(1)}s)
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
```

---

### Step 6: Update TypeScript Types

Add enhanced fields to your message interface:

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
  citations?: Citation[];
  confidence?: number;
  confidenceLevel?: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
}
```

---

## 🎨 Optional: Styling Enhancements

### Add Custom Styles for Tool Cards

Add to your global CSS or component styles:

```css
.tool-card {
  transition: all 0.2s ease;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.citation-link {
  transition: color 0.2s ease;
}

.citation-link:hover {
  color: hsl(var(--primary));
}
```

---

## 🧪 Testing Your Integration

### Test Case 1: Clinical Query

**Query**: "What clinical trials exist for psoriasis biologics?"

**Expected Results**:
- ✅ Tool usage display shows: PubMed Search, ClinicalTrials.gov Search
- ✅ Citation display shows: 5-10 citations from both sources
- ✅ Citations are clickable and open in new tabs
- ✅ Confidence score: 75-90% (high)

### Test Case 2: Regulatory Query

**Query**: "What are FDA requirements for biologic approval?"

**Expected Results**:
- ✅ Tool usage display shows: FDA OpenFDA, ICH Guidelines
- ✅ Citation display shows: FDA regulations, ICH guideline documents
- ✅ Confidence score: 80-95% (very high, due to regulatory sources)

### Test Case 3: Digital Health Query

**Query**: "Best practices for decentralized clinical trials?"

**Expected Results**:
- ✅ Tool usage display shows: DiMe Resources, ICHOM Standards
- ✅ Citation display shows: DiMe playbooks, ICHOM standard sets
- ✅ Confidence score: 70-85% (high)

---

## 🔧 Troubleshooting

### Issue: Tools not loading

**Solution**: Check that tools are assigned to agent in database
```bash
node scripts/apply-tool-registry-migration.js
```

### Issue: Citations not displaying

**Solution**: Verify tool outputs are in expected format. Check console for parsing errors.

### Issue: TypeScript errors

**Solution**: Ensure all imports are correct:
```typescript
import type { Citation, ThinkingStep } from '../services/enhanced-agent-orchestrator';
```

### Issue: Thinking steps not updating

**Solution**: Ensure `onThinkingUpdate` callback is properly set in orchestrator call.

---

## 📊 Success Metrics

After integration, you should see:

✅ **Tool Transparency**
- Users can see which tools were used
- Tool inputs/outputs are visible
- Research process is transparent

✅ **Evidence-Based Responses**
- Citations from 9 different source types
- Clickable links to original sources
- Multiple citation formats supported

✅ **Confidence Scoring**
- 60-95% confidence range based on evidence
- Higher scores for regulatory/clinical sources
- Visual confidence indicators

---

## 🚀 What's Next

### Phase 2: Enhanced Trust & Transparency (Week 2)

After Phase 1 is working, implement:
- Confidence badge component (with tooltips)
- Evidence summary cards (visual breakdown)
- Real-time thinking indicators (enhanced version)

See [PHASES_2_3_4_COMPLETE_IMPLEMENTATION.md](PHASES_2_3_4_COMPLETE_IMPLEMENTATION.md) for code.

### Phase 3: Advanced Features (Week 3)

- Mini risk assessment
- Action item extraction
- Ask 3 Experts quick consultation

### Phase 4: Polish & Export (Week 4)

- Structured output templates
- PDF/DOCX/MD export
- Enhanced conversation memory

---

## 📚 Reference Files

- [enhanced-agent-orchestrator.ts](src/features/chat/services/enhanced-agent-orchestrator.ts) - Core orchestrator
- [tool-usage-display.tsx](src/features/chat/components/tool-usage-display.tsx) - Tool UI component
- [citation-display.tsx](src/features/chat/components/citation-display.tsx) - Citation UI component
- [COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md](COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md) - Full Phase 1 code
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) - Quick reference

---

**Status**: Phase 1 files created successfully. Ready for UI integration.

**Next Action**: Integrate enhanced orchestrator into your chat interface following steps above.
