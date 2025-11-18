# 🔴 Mode 1 Critical Fixes - Missing Sources & Reasoning

## **Problem Summary**
Three critical issues preventing Mode 1 from working properly:

1. ✅ **Backend sends 10 sources** → ❌ **Frontend displays 0 sources**
2. ✅ **Reasoning visible during streaming** → ❌ **Collapses after completion**
3. ❌ **Inline citations not rendering** (frontend receives them, but pills don't show)

---

## **Root Causes**

### 1. Sources Not Displaying
**Evidence from logs:**
```javascript
// Backend (format_output update):
✅ [Updates Mode] Found 10 sources

// Frontend (final message):
❌ ragSummary: { totalSources: 0 }  // <-- BUG!
✅ sources: [10 source objects]      // Data is present!
```

**Root Cause:**
- Sources ARE being extracted from `updates` mode
- Sources ARE in `streamingMeta.sources` and `finalSources`
- BUT `ragSummary.totalSources` is hardcoded to `0` in `page.tsx` (line 1155)
- The `Sources` component checks `ragSummary && metadata.sources.length > 0` (EnhancedMessageDisplay.tsx line 1166)
- Since `ragSummary.totalSources = 0`, the condition fails even though sources exist!

**Fix Location:** `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`
- Line ~1155: `ragSummary` initialization
- Line ~1927-1930: `finalRagSummary` calculation

**The Fix:**
```typescript
// BEFORE (line 1155):
const ragSummary = { totalSources: 0, domains: [] };

// AFTER:
const ragSummary = { 
  totalSources: 0,  // Will be updated later
  domains: selectedRagDomains || []  // ✅ Use actual selected domains
};

// BEFORE (line 1927-1930):
const finalRagSummary = {
  ...ragSummary,
  totalSources: finalSources.length,  // ✅ Correct count
};

// AFTER - ADD domain update from streamingMeta:
const finalRagSummary = {
  totalSources: finalSources.length,  // ✅ Correct count
  strategy: streamingMeta?.ragSummary?.strategy || ragSummary.strategy || 'hybrid',
  domains: streamingMeta?.ragSummary?.domains || selectedRagDomains || [],
  cacheHit: streamingMeta?.ragSummary?.cacheHit || false,
};
```

---

### 2. AI Reasoning Collapses After Streaming
**Evidence from logs:**
```javascript
// During streaming:
✅ reasoningSteps: [4 steps]  // Visible!

// After completion:
❌ showReasoning: false  // Collapsed!
```

**Root Cause:**
- `EnhancedMessageDisplay.tsx` line 473: `setShowReasoning(false)` (initial state)
- Component doesn't auto-expand when `metadata.reasoningSteps` or `metadata.reasoning` exists
- UX expectation: If AI generated reasoning, show it by default!

**Fix Location:** `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx`
- Line ~473: Initial `showReasoning` state
- Add `useEffect` to auto-expand when reasoning is available

**The Fix:**
```typescript
// BEFORE (line 473):
const [showReasoning, setShowReasoning] = useState(false);

// AFTER - Auto-expand if reasoning exists:
const [showReasoning, setShowReasoning] = useState(false);

// ✅ NEW: Auto-expand reasoning if available
useEffect(() => {
  const hasReasoning = 
    (metadata?.reasoningSteps && metadata.reasoningSteps.length > 0) ||
    (metadata?.workflowSteps && metadata.workflowSteps.length > 0) ||
    (metadata?.reasoning && metadata.reasoning.length > 0);
  
  if (hasReasoning && !isStreaming) {
    setShowReasoning(true);
  }
}, [metadata, isStreaming]);
```

---

### 3. Inline Citations Not Rendering
**Evidence from logs:**
```javascript
// Backend sends:
✅ citations: [10 citations with number, id, title, url, etc.]

// Frontend receives:
✅ metadata.citations: [10 citations]

// But UI shows:
❌ Plain text instead of interactive pills
```

**Root Cause:**
- Citations ARE in `metadata.citations`
- But `AIResponse` component expects citations in a specific format
- Need to verify citation format matches what `InlineCitation` component expects

**Fix Location:** `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx`
- Line ~645-660: Citation processing for `AIResponse`

**Verification Needed:**
Check if backend citations match this format:
```typescript
{
  number: "1",  // ✅ String (backend sends string)
  id: "source-1",
  title: "Source 1",
  url: "#",
  description: "...",
  quote: "...",
}
```

---

## **Implementation Priority**

### **Phase 1: Fix Sources Display (30 min)**
1. Fix `ragSummary` initialization in `page.tsx`
2. Fix `finalRagSummary` calculation to include domains and strategy
3. Test: Sources should show "Used 10 sources"

### **Phase 2: Fix AI Reasoning Auto-Expand (15 min)**
1. Add `useEffect` to `EnhancedMessageDisplay.tsx` to auto-expand reasoning
2. Test: Reasoning should stay visible after completion

### **Phase 3: Verify Inline Citations (30 min)**
1. Check backend citation format in `mode1_manual_workflow.py`
2. Verify frontend `InlineCitation` component expectations
3. Add debug logging to citation rendering
4. Fix format mismatch if found

---

## **Expected Outcome**

### ✅ **After Fix:**
1. **Sources**: "Used 10 sources" collapsible section with source cards
2. **Reasoning**: Auto-expanded "Show AI Reasoning" with workflow steps
3. **Citations**: Interactive `[1]`, `[2]` pills with hover cards

### 🎯 **User Experience:**
- Sources visible and clickable
- AI reasoning transparent and visible by default
- Citations interactive and informative
- No manual expansion required!

---

## **Testing Checklist**

### Test 1: Sources Display
- [ ] Send query: "Develop a digital strategy for patients with ADHD"
- [ ] Verify backend logs: "Found 5 relevant sources" → "Found 10 sources" (after format_output)
- [ ] Verify frontend logs: `ragSummary.totalSources: 10` (not 0!)
- [ ] Verify UI: "Evidence summary: 10 sources" collapsible section
- [ ] Click to expand: Should show 10 source cards

### Test 2: AI Reasoning Auto-Expand
- [ ] Same query as above
- [ ] Verify frontend logs: `reasoningSteps: [4 steps]`
- [ ] Verify UI: "Show AI Reasoning" section auto-expanded
- [ ] Should see: "Searching 2 domains...", "Found 5 sources", etc.

### Test 3: Inline Citations
- [ ] Same query as above
- [ ] Verify backend logs: `citations: [10 citations]`
- [ ] Verify frontend logs: `metadata.citations: [10 citations]`
- [ ] Verify UI: Interactive `[1]`, `[2]`, `[3]` pills in response text
- [ ] Hover over pill: Should show source preview card

---

## **Files to Modify**

1. `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`
   - Fix `ragSummary` initialization (~line 1155)
   - Fix `finalRagSummary` calculation (~line 1927-1930)

2. `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx`
   - Add auto-expand `useEffect` for reasoning (~line 473)

3. `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py` (if needed)
   - Verify citation format in `format_output_node` (~line 770-813)

