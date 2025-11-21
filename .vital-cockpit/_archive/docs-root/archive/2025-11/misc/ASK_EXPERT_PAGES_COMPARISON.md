# 📊 Ask Expert Pages - Complete Comparison & Recommendation

**Date:** November 2, 2025  
**Analysis:** 4 versions reviewed  
**Recommendation:** ✅ Use **page.tsx** (current) - it's already the best!

---

## 🎯 **SURPRISING DISCOVERY**

**The current `page.tsx` is ALREADY the most comprehensive version!** ✅

You're already using the best version - it has:
- ✅ `EnhancedMessageDisplay` (line 58)
- ✅ `InlineArtifactGenerator` (line 59)
- ✅ `Reasoning` components (line 53)
- ✅ Full conversation management
- ✅ 2,242 lines of features

**The issue is NOT the page version - it's how Mode 3 data is being passed to EnhancedMessageDisplay!**

---

## Comparison Matrix

| Feature | page.tsx (Current) | page-enhanced.tsx | page-complete.tsx | beta/page.tsx |
|---------|-------------------|-------------------|-------------------|---------------|
| **Lines of Code** | 2,242 | 590 | 701 | 701 |
| **Status** | ✅ Production | ⚠️ Simple | ✅ Enhanced | ✅ Enhanced |
| **EnhancedMessageDisplay** | ✅ YES (line 58) | ❌ NO | ✅ YES | ✅ YES |
| **AdvancedStreamingWindow** | ❌ NO | ❌ NO | ✅ YES | ✅ YES |
| **InlineArtifactGenerator** | ✅ YES (line 59) | ❌ NO | ✅ YES | ❌ NO |
| **Reasoning Component** | ✅ YES (line 53) | ❌ NO | ❌ NO | ❌ NO |
| **PromptInput** | ✅ YES (line 44) | ❌ NO | ❌ NO | ❌ NO |
| **Conversation Management** | ✅ Full | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic |
| **Sidebar Integration** | ✅ YES | ❌ NO | ✅ YES | ✅ YES |
| **Dark Mode** | ✅ YES | ❌ NO | ❌ NO | ❌ NO |
| **Token Counter** | ✅ YES | ❌ NO | ❌ NO | ❌ NO |
| **Attachments** | ✅ YES | ❌ NO | ❌ NO | ❌ NO |
| **Context Providers** | ✅ YES | ❌ NO | ❌ NO | ❌ NO |
| **Inline Citations** | ✅ Should work | ❌ NO | ✅ Should work | ✅ Should work |

---

## 📁 File Details

### 1. ✅ **page.tsx** (Current Production Version)
**Path:** `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`  
**Lines:** 2,242  
**Route:** `/ask-expert` ← **YOU ARE HERE**

**Imports:**
```tsx
import { EnhancedMessageDisplay } from '@/features/ask-expert/components/EnhancedMessageDisplay';
import { InlineArtifactGenerator } from '@/features/ask-expert/components/InlineArtifactGenerator';
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ui/shadcn-io/ai/reasoning';
import { PromptInput } from '@/components/prompt-input';
import { AskExpertProvider, useAskExpert } from '@/contexts/ask-expert-context';
import { ChatHistoryProvider, useChatHistory } from '@/contexts/chat-history-context';
```

**Message Rendering (lines 2011-2046):**
```tsx
<EnhancedMessageDisplay
  key={msg.id}
  id={msg.id}
  role={msg.role}
  content={msg.content}
  timestamp={msg.timestamp}
  metadata={msg.metadata}  // ← This is the key!
  agentName={msg.agentName}
  agentAvatar={msg.agentAvatar}
  isStreaming={msg.isStreaming}
  // ... more props
/>
```

**Features:**
- ✅ Claude.ai-inspired interface
- ✅ Full conversation sidebar
- ✅ Enhanced message display with inline citations
- ✅ Reasoning component
- ✅ Document generator
- ✅ Dark mode toggle
- ✅ Token counter
- ✅ Attachment support
- ✅ Streaming responses
- ✅ Context management

**Pros:**
- Most feature-complete
- Production-ready
- Already using best components
- Excellent UX

**Cons:**
- Complex codebase (2,242 lines)
- Mode 3 metadata not being passed correctly to messages

---

### 2. ⚠️ **page-enhanced.tsx** (Simpler Version)
**Path:** `apps/digital-health-startup/src/app/(app)/ask-expert/page-enhanced.tsx`  
**Lines:** 590  
**Route:** Not routed (orphan file)

**Imports:**
```tsx
import ReactMarkdown from 'react-markdown';  // ← Basic rendering!
import { EnhancedModeSelector, ExpertAgentCard } from '@/features/ask-expert/components';
```

**Message Rendering (lines 446-509):**
```tsx
<ReactMarkdown>  ← ❌ Basic only - NO citations, NO reasoning
  {message.content}
</ReactMarkdown>
```

**Features:**
- ✅ Mode selector
- ✅ Agent cards with stats
- ✅ Progress tracking
- ❌ NO enhanced message display
- ❌ NO inline citations
- ❌ NO reasoning display
- ❌ NO document generator

**Pros:**
- Simpler code
- Easier to understand
- Faster rendering

**Cons:**
- Missing all advanced features
- Basic message display only
- No inline citations
- No reasoning visualization

**Verdict:** ❌ **Don't use** - missing too many features

---

### 3. ✅ **page-complete.tsx** (7 Components Version)
**Path:** `apps/digital-health-startup/src/app/(app)/ask-expert/page-complete.tsx`  
**Lines:** 701  
**Route:** Not routed (orphan file)

**Imports:**
```tsx
import {
  EnhancedModeSelector,
  ExpertAgentCard,
  EnhancedMessageDisplay,
  InlineDocumentGenerator,
  NextGenChatInput,
  IntelligentSidebar,
  AdvancedStreamingWindow  // ← Has this!
} from '@/features/ask-expert/components';
```

**Message Rendering (lines 642-649):**
```tsx
<EnhancedMessageDisplay
  key={msg.id}
  {...(msg as any)}
  onCopy={() => handleCopyMessage(msg)}
  onRegenerate={() => handleRegenerateMessage(msg)}
  onFeedback={(type) => handleFeedback(msg, type)}
/>
```

**Features:**
- ✅ All 7 enhancement components
- ✅ Enhanced message display
- ✅ **AdvancedStreamingWindow** (current page.txt doesn't have this!)
- ✅ Document generator
- ✅ Tabs (Settings, Chat, Documents)
- ❌ NO conversation sidebar
- ❌ NO dark mode
- ❌ NO token counter
- ❌ NO attachment support

**Pros:**
- Clean, focused design
- Advanced streaming visualization
- All 7 UI components integrated
- Good for demos

**Cons:**
- Missing conversation management
- Missing sidebar integration
- Missing some UX polish
- Simpler than current page.tsx

**Verdict:** ⚠️ **Has AdvancedStreamingWindow** but missing other features

---

### 4. ✅ **beta/page.tsx** (Identical to page-complete)
**Path:** `apps/digital-health-startup/src/app/(app)/ask-expert/beta/page.tsx`  
**Lines:** 701  
**Route:** `/ask-expert/beta` ← **TEST THIS**

**IDENTICAL to page-complete.tsx!**

Same features, same code, just different route.

**Verdict:** ✅ **Test this** to see AdvancedStreamingWindow in action

---

## 🔍 The REAL Problem

### Current page.tsx Message Creation (Line ~1225-1287)

**Problem Code:**
```tsx
const assistantMessage: Message = {
  id: `assistant-${Date.now()}`,
  role: 'assistant',
  content: fullResponse,  // ✅ Has content
  timestamp: Date.now(),
  selectedAgent,          // ✅ Has agent
  selectionReason,        // ✅ Has reason
  confidence,             // ✅ Has confidence
  // ❌ MISSING: metadata!
};
```

**What's Missing:**
```tsx
metadata: {
  sources,              // ❌ NOT PASSED
  reasoning,            // ❌ NOT PASSED
  autonomousMetadata,   // ❌ NOT PASSED
  ragSummary,          // ❌ NOT PASSED
  toolSummary,         // ❌ NOT PASSED
  ...finalMeta         // ❌ NOT PASSED
}
```

**Variables ARE Collected (lines 817-836):**
```tsx
let fullResponse = '';
let reasoning: string[] = [];
let sources: Source[] = [];
let selectedAgent: Message['selectedAgent'] = undefined;
let autonomousMetadata: any = {};
let ragSummary = { /* ... */ };
let toolSummary = { /* ... */ };
let finalMeta: any = null;
```

**But NEVER added to the message object!**

---

## AdvancedStreamingWindow Comparison

### Current page.tsx: ❌ Does NOT have it
**No AdvancedStreamingWindow component**

Just basic streaming with cursor animation.

### page-complete.tsx & beta/page.tsx: ✅ HAS it
**Lines 619-628:**
```tsx
{isStreaming && (
  <div className="px-6 pt-4">
    <AdvancedStreamingWindow
      workflowSteps={workflowSteps}
      reasoningSteps={reasoningSteps}
      metrics={streamingMetrics}
      isStreaming={isStreaming}
      canPause={true}
      onPause={handlePauseStreaming}
      onResume={handleResumeStreaming}
    />
  </div>
)}
```

**Shows:**
- Workflow progress bar
- Current step indicator
- Live reasoning steps
- Pause/Resume controls
- Metrics (tokens/sec, latency)

---

## 🎯 Recommendation

### **Option 1: Fix Current page.tsx** (Recommended) ⭐

**Why:** Current page.tx is already the most comprehensive!

**What to do:**
1. Fix metadata passing in message creation (line ~1225-1287)
2. Optionally add AdvancedStreamingWindow component
3. Test Mode 3 again

**Changes needed:**
```tsx
// Around line 1225-1287, change:
const assistantMessage: Message = {
  id: `assistant-${Date.now()}`,
  role: 'assistant',
  content: fullResponse,
  timestamp: Date.now(),
  selectedAgent,
  selectionReason,
  confidence,
  metadata: {  // ← ADD THIS!
    sources,
    reasoning,
    autonomousMetadata,
    ragSummary,
    toolSummary,
    ...finalMeta
  },
  autonomousMetadata,  // Also keep at top level for backward compat
  // ... rest of properties
};
```

**Result:**
- ✅ All features preserved
- ✅ Citations will display
- ✅ Reasoning will show
- ✅ Metadata will render
- ✅ Mode 3 will work!

---

### **Option 2: Test beta/page.tsx First**

**Why:** See if you like the AdvancedStreamingWindow

**What to do:**
1. Navigate to `http://localhost:3000/ask-expert/beta`
2. Test Mode 3
3. Observe the streaming window
4. Decide if you want it in main page

**Pros:**
- See advanced streaming viz
- Cleaner demo UI
- All 7 components working

**Cons:**
- Missing conversation sidebar
- Missing some current page.tsx features
- Need to merge if you like it

---

### **Option 3: Hybrid Approach**

**What:** Add AdvancedStreamingWindow to current page.txt

**Steps:**
1. Import `AdvancedStreamingWindow`
2. Add state for `workflowSteps`, `reasoningSteps`, `streamingMetrics`
3. Render above messages when `isStreaming`
4. Keep all other current features

**Result:** Best of both worlds!

---

## Summary Table

| Page Version | Route | Features | Status | Recommendation |
|-------------|-------|----------|--------|----------------|
| **page.tsx** | `/ask-expert` | 2,242 lines, most comprehensive | ✅ Production | **Use this** + fix metadata |
| **page-enhanced.tsx** | Not routed | 590 lines, basic display | ⚠️ Simple | ❌ Don't use |
| **page-complete.tsx** | Not routed | 701 lines, 7 components | ✅ Enhanced | ⚠️ Missing some features |
| **beta/page.tsx** | `/ask-expert/beta` | 701 lines, same as complete | ✅ Enhanced | ✅ Test to see streaming viz |

---

## Action Plan

### Immediate (5 minutes):
1. ✅ Test `/ask-expert/beta` to see if you like AdvancedStreamingWindow
2. ✅ Compare UX with current page

### Short-term (30 minutes):
1. Fix metadata passing in current page.txt (lines 1225-1287)
2. Test Mode 3 again
3. Verify citations and reasoning display

### Optional (1 hour):
1. Add AdvancedStreamingWindow to current page.txt
2. Merge best features from all versions
3. Clean up orphan files

---

## Conclusion

**You're already on the best version!** ✅

The current `page.tsx` at `/ask-expert` is the most comprehensive with:
- EnhancedMessageDisplay ✅
- InlineArtifactGenerator ✅
- Reasoning components ✅
- Full conversation management ✅

**The only issue:** Mode 3 metadata not being passed to the message object.

**Fix:** Add metadata to message creation (one code change!)

**Optional:** Test `/ask-expert/beta` to see if you want AdvancedStreamingWindow.

---

**Generated:** November 2, 2025  
**Analysis Status:** Complete ✅  
**Next Step:** Fix metadata passing OR test beta version

