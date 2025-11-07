# 🔬 Mode 1 - Comprehensive Root Cause Analysis & Fix Plan

**Date**: November 7, 2025  
**Status**: CRITICAL - Multiple UX Issues Identified  
**Approach**: End-to-End Audit → Root Cause → Systematic Fix

---

## 🔍 Issue #1: AI Reasoning Not in Markdown Format

### Current State
**Location**: Lines 974-1009 in `EnhancedMessageDisplay.tsx`

```typescript
{metadata.reasoningSteps.map((step: any, idx: number) => (
  <div className="...">
    <span>{step.content}</span>  // ❌ Plain text rendering
  </div>
))}
```

### Root Cause
**Problem**: Reasoning steps render as plain text, not markdown
**Why**: Content is wrapped in `<span>` instead of using `Response` component with ReactMarkdown

### Evidence From Screenshots
- Reasoning shows "\*\*Retrieving Knowledge:\*\*" instead of **bold text**
- No markdown formatting applied to step content

### Solution
```typescript
import { Response } from '@/components/ui/shadcn-io/ai/response';

{metadata.reasoningSteps.map((step: any, idx: number) => (
  <div className="..." key={step.id || `step-${idx}`}>
    {getReasoningIcon(step.type)}
    <div className="flex-1">
      <Response className="text-xs">
        {step.content}  // ✅ Now renders markdown
      </Response>
    </div>
  </div>
))}
```

---

## 🔍 Issue #2: AI Reasoning Content Disappears After Completion

### Current State
**Location**: Line 916 in `EnhancedMessageDisplay.tsx`

```typescript
<Reasoning 
  isStreaming={isStreaming}  // ✅ Correct
  defaultOpen={showReasoning}  // ❌ PROBLEM: Uses controlled state
  className="mt-3"
>
```

### Root Cause Analysis

**Problem 1: Auto-Close Behavior**
- `Reasoning` component from Shadcn AI has built-in auto-close logic
- Located in `reasoning.tsx` lines 97-107:
```typescript
// Auto-open when streaming starts, auto-close when streaming ends
useEffect(() => {
  if (isStreaming && !isOpen) {
    setIsOpen(true);
  } else if (!isStreaming && isOpen && !defaultOpen && !hasAutoClosedRef) {
    const timer = setTimeout(() => {
      setIsOpen(false);  // ❌ Closes after 1 second
      setHasAutoClosedRef(true);
    }, AUTO_CLOSE_DELAY);  // 1000ms
    return () => clearTimeout(timer);
  }
}, [isStreaming, isOpen, defaultOpen, setIsOpen, hasAutoClosedRef]);
```

**Problem 2: Conditional Rendering**
- Line 913 condition checks if data exists:
```typescript
{!isUser && (metadata?.reasoning || metadata?.workflowSteps || metadata?.reasoningSteps) && (
  <Reasoning>...</Reasoning>
)}
```
- If `metadata.reasoningSteps` becomes undefined after streaming, entire component unmounts

### Evidence From Screenshots
1. During streaming: AI Reasoning visible with steps
2. After completion: "Thinking..." collapses and content hidden
3. User must manually re-expand to see steps

### Solution (Two-Part Fix)

**Part A: Force Always Open**
```typescript
<Reasoning 
  isStreaming={isStreaming}
  defaultOpen={true}  // ✅ Always start expanded
  open={true}  // ✅ Force controlled open state
  onOpenChange={(open) => {
    // Allow manual toggle but prevent auto-close
    setShowReasoning(open);
  }}
  className="mt-3"
>
```

**Part B: Persist Data**
Ensure `metadata.reasoningSteps` persists after streaming completes (check parent component state management)

---

## 🔍 Issue #3: Final Formatted Message Not Displayed/Rendered

### Current State
**Location**: Lines 1055-1088 in `EnhancedMessageDisplay.tsx`

```typescript
{/* Message Content */}
<div ref={messageRef}>
  {isUser ? (
    <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
      {displayContent}
    </div>
  ) : (
    <>
      {isStreaming && (
        <span role="status" aria-live="polite" className="sr-only">
          Assistant is typing
        </span>
      )}
      <AIResponse
        className={cn('prose prose-sm max-w-none dark:prose-invert leading-relaxed text-gray-800')}
        remarkPlugins={citationRemarkPlugins}
        components={citationComponents}
        isStreaming={isStreaming}
      >
        {deferredContent}  // ❌ PROBLEM: Uses deferred value
      </AIResponse>
    </>
  )}
  
  {isStreaming && (  // ❌ PROBLEM: Cursor only shows during streaming
    <motion.span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse rounded-sm" />
  )}
</div>
```

### Root Cause Analysis

**Problem 1: Deferred Content**
- Uses `useDeferredValue(displayContent)` which may lag behind actual content
- Line 560:
```typescript
const deferredContent = useDeferredValue(displayContent);
```

**Problem 2: isStreaming Flag**
- Content may not update when `isStreaming` becomes `false`
- Need to verify parent component (`page.tsx`) properly sets `isStreaming={false}` after completion

**Problem 3: No Completion Indicator**
- No visual indication that message is complete
- Streaming cursor disappears but no "✓ Complete" indicator

### Evidence From Screenshots
- Screenshot shows "Thinking..." but no final message content below
- Only AI Reasoning visible, main response missing

### Investigation Needed
1. Check parent `page.tsx` - when does it set `isStreaming={false}`?
2. Check if `displayContent` is properly updated with final message
3. Verify `deferredContent` catches up after streaming stops

### Solution

**Part A: Remove Deferred Value (if causing lag)**
```typescript
// Option 1: Direct rendering
<AIResponse>{displayContent}</AIResponse>

// Option 2: Force sync after streaming
useEffect(() => {
  if (!isStreaming) {
    // Force re-render with final content
    setDisplayContent(content);
  }
}, [isStreaming, content]);
```

**Part B: Add Completion Indicator**
```typescript
{!isStreaming && content && (
  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
    <CheckCircle className="h-3 w-3" />
    <span>Response complete</span>
  </div>
)}
```

---

## 🔍 Issue #4: References/Sources Not Properly Rendered

### Current State (After User's Manual Edit)
**Location**: Lines 1176-1232 in `EnhancedMessageDisplay.tsx`

User added Chicago citation list:
```typescript
<div className="mt-4 space-y-2">
  <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
    <BookOpen className="h-3.5 w-3.5" />
    <span>References ({metadata.sources.length})</span>
  </div>
  <div className="space-y-1.5">
    {metadata.sources.map((source, idx) => (
      <div key={source.id || `source-${idx}`}>  // ❌ Still using source.id (duplicate keys)
        <Badge>[{idx + 1}]</Badge>
        <span>{formatChicagoCitation(source, idx)}</span>  // ✅ Chicago formatting
        {tag && <Badge>{tag}</Badge>}
        {source.url && (
          <a href={source.url} className="opacity-0 group-hover:opacity-100">
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    ))}
  </div>
</div>
```

### Problems Identified

**Problem 1: Duplicate Keys**
- Still using `source.id` which has duplicates
- Console errors: "Encountered two children with the same key"

**Problem 2: Chicago Citations Not Rendering**
- Screenshot shows: `[1] "UI:UX design requirements..." Digital Health URL: #`
- Format is text, not proper hyperlinks
- Domain appears as plain text "Digital Health" repeated multiple times

**Problem 3: formatChicagoCitation() Issues**
Lines 355-411:
```typescript
function formatChicagoCitation(source: Source, index: number): string {
  const parts: string[] = [];
  
  if (source.organization) {
    parts.push(source.organization);
  }
  
  if (source.title) {
    parts.push(`"${source.title}"`);  // ❌ Quotes in plain text
  }
  
  if (source.domain) {
    parts.push(source.domain);  // ❌ "Digital Health" repeated
  }
  
  if (source.url) {
    const hostname = url.hostname.replace(/^www\./, '');
    parts.push(`accessed via ${hostname}`);  // ❌ Not a clickable link
  }
  
  return `[${index + 1}] ${parts.join(', ')}`;  // ❌ Returns plain string
}
```

### Root Cause
**Chicago citation returns plain text string, not JSX**  
→ Can't have clickable links  
→ Can't style different parts  
→ Domain duplicated because it's in the formatted string AND as a badge

### Solution: Redesign as JSX Component

```typescript
// DELETE formatChicagoCitation function entirely

// REPLACE with clean JSX rendering:
{metadata.sources.map((source, idx) => (
  <div
    key={`ref-${idx}`}  // ✅ Unique key based on index
    className="flex items-start gap-2 pb-2 border-b border-gray-100 last:border-0"
  >
    <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
      [{idx + 1}]
    </Badge>
    <div className="flex-1 min-w-0 space-y-1">
      {/* Title as clickable link */}
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline text-sm block"
        >
          {source.title || `Source ${idx + 1}`}
        </a>
      ) : (
        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm block">
          {source.title || `Source ${idx + 1}`}
        </span>
      )}
      
      {/* Excerpt */}
      {source.excerpt && (
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
          {source.excerpt}
        </p>
      )}
      
      {/* Badges - NO duplication */}
      <div className="flex flex-wrap items-center gap-1.5">
        {getSourceTypePresentation(source.sourceType)?.label && (
          <Badge variant="secondary" className="text-[10px]">
            {getSourceTypePresentation(source.sourceType).label}
          </Badge>
        )}
        {typeof source.similarity === 'number' && source.similarity > 0 && (
          <Badge variant="secondary" className="text-[10px]">
            {Math.round(source.similarity * 100)}% match
          </Badge>
        )}
        {/* Show domain ONLY if different from source type */}
        {source.domain && source.domain !== getSourceTypePresentation(source.sourceType)?.label && (
          <span className="text-[10px] text-gray-500">
            {source.domain}
          </span>
        )}
      </div>
    </div>
  </div>
))}
```

---

## 🔍 Issue #5: Delete "Evidence Summary" - Duplication of References

### Current State
**Duplicate Display**:
1. **References** section (lines 1176-1232) - Chicago citations
2. **Evidence Summary** collapsible (lines 1234-1382) - Detailed cards with same sources

### Root Cause
User added References list but kept original Evidence Summary → Same data shown twice

### Solution
**Option A: Remove Evidence Summary Entirely**
```typescript
// DELETE lines 1234-1382 (Sources collapsible component)
```

**Option B: Keep Evidence Summary, Remove References**
- If user wants detailed view with cards, remove the References list
- If user wants clean list, remove Evidence Summary

**Recommendation**: Keep ONLY References (clean list), delete Evidence Summary

---

## 🔍 Issue #6: Insight Box Timing

### Current State
**Location**: Lines 1414-1442

```typescript
{/* Key Insights Callout - ✅ Show both during streaming and after completion */}
{!isUser && (keyInsights.length > 0 || (metadata?.confidence ?? 0) > 0.85) && (
  <motion.div
    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
    className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3"
  >
    {/* Insight content */}
  </motion.div>
)}
```

### Root Cause
**No isStreaming check** → Shows immediately when `metadata.confidence` is available  
→ Appears during streaming, then disappears when metadata updates  
→ Reappears after completion

### Evidence From Screenshots
User reports: "Insight Box appear at the start... then disappear... should appear after final message rendered"

### Solution
```typescript
{/* Show Insights ONLY after streaming completes */}
{!isUser && !isStreaming && (keyInsights.length > 0 || (metadata?.confidence ?? 0) > 0.85) && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}  // ✅ Animate out if needed
    transition={{ duration: 0.3, delay: 0.2 }}  // ✅ Delay after message completes
    className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3"
  >
    {/* Insight content */}
  </motion.div>
)}
```

---

## 📋 COMPREHENSIVE FIX PLAN

### Phase 1: Critical Fixes (Immediate)

1. **Fix Reasoning Markdown Rendering**
   - Lines 974-1009: Wrap `step.content` in `<Response>` component
   - Test: Verify \*\*bold\*\* renders as **bold**

2. **Fix Reasoning Persistence**
   - Line 916: Add `open={true}` prop
   - Verify reasoning stays visible after completion

3. **Fix Final Message Rendering**
   - Investigate `deferredContent` vs `displayContent`
   - Ensure content shows after `isStreaming` becomes false
   - Add completion indicator

### Phase 2: References Redesign

4. **Delete formatChicagoCitation Function**
   - Remove lines 355-411
   - Replace with JSX component rendering

5. **Fix Duplicate Keys**
   - Change all `key={source.id || `source-${idx}`}` to `key={`ref-${idx}`}`

6. **Delete Evidence Summary Duplication**
   - Remove lines 1234-1382 (entire Sources collapsible)
   - Keep only References list

### Phase 3: UX Polish

7. **Fix Insight Box Timing**
   - Add `!isStreaming` condition
   - Add 200ms delay after completion

8. **Add Progressive Disclosure**
   - Wrap reasoning steps in `AnimatePresence`
   - Stagger animation: `delay: idx * 0.15`

---

## 🧪 Testing Checklist

After fixes, verify:

- [ ] AI Reasoning renders markdown (bold, italics, lists)
- [ ] AI Reasoning stays visible after completion
- [ ] AI Reasoning is expanded by default
- [ ] Final message content displays after streaming
- [ ] No duplicate key errors in console
- [ ] References show as clean list with clickable links
- [ ] No "Digital Health" duplication
- [ ] No Evidence Summary duplication
- [ ] Insight box appears ONLY after message completes
- [ ] Insight box appears BELOW final message
- [ ] No flickering or disappearing content

---

## 📝 Files to Modify

1. `/apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx`
   - Delete: Lines 355-411 (formatChicagoCitation)
   - Modify: Lines 916 (Reasoning props)
   - Modify: Lines 974-1009 (Reasoning steps rendering)
   - Modify: Lines 1055-1088 (Final message rendering - investigate)
   - Modify: Lines 1176-1232 (References with JSX, not Chicago string)
   - Delete: Lines 1234-1382 (Evidence Summary duplication)
   - Modify: Line 1415 (Insight box timing)

**Total Changes**: ~200 lines modified/deleted

---

**Next Step**: Begin implementation starting with Phase 1 (Critical Fixes)
