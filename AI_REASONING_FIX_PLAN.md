# 🎯 AI REASONING COMPONENT - FIX PLAN

**TAG: AI_REASONING_FIX**

## 🔍 Issues Identified

### Issue 1: **Content Disappears After Streaming**
**Root Cause**: The Reasoning component has an **AUTO_CLOSE** feature (line 82-89 in `reasoning.tsx`):
```typescript
else if (!isStreaming && isOpen && !defaultOpen && !hasAutoClosedRef) {
  const timer = setTimeout(() => {
    setIsOpen(false);  // ❌ CLOSES AFTER 1 SECOND
    setHasAutoClosedRef(true);
  }, AUTO_CLOSE_DELAY);  // 1000ms
}
```

**Impact**: 
- Reasoning opens during streaming ✅
- Closes 1 second after streaming ends ❌
- User can't see the reasoning results ❌

### Issue 2: **Not Progressively Disclosed**
**Current**: All reasoning steps render at once
**Expected**: Steps should appear one by one as they're received

---

## ✅ Fix Strategy

### Fix 1: Keep Reasoning Open After Completion
**Option A**: Set `defaultOpen={true}` (keeps it open permanently)
**Option B**: Remove auto-close behavior
**Option C**: Add `keepOpenAfterStreaming` prop

**Recommended**: **Option A** - Simple, effective

### Fix 2: Progressive Disclosure
**Implementation**: Use AnimatePresence to animate each step as it appears

---

## 🔧 Implementation

### Step 1: Fix Auto-Close in EnhancedMessageDisplay

**File**: `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx`

**Change**: Line 943
```typescript
// BEFORE
<Reasoning 
  isStreaming={isStreaming} 
  defaultOpen={true}  // ❌ Still closes because auto-close doesn't check defaultOpen properly
  open={showReasoning}
  onOpenChange={setShowReasoning}
>

// AFTER
<Reasoning 
  isStreaming={isStreaming} 
  defaultOpen={true}
  open={true}  // ✅ FORCE KEEP OPEN
  onOpenChange={(open) => {
    // Only allow user to close manually, never auto-close
    if (!isStreaming) {
      setShowReasoning(open);
    }
  }}
>
```

### Step 2: Fix Reasoning Component Auto-Close

**File**: `apps/digital-health-startup/src/components/ui/shadcn-io/ai/reasoning.tsx`

**Option A**: Add a prop to disable auto-close
```typescript
export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
  keepOpen?: boolean;  // ✅ NEW PROP
};

// Then in the auto-close logic (line 82):
else if (!isStreaming && isOpen && !defaultOpen && !hasAutoClosedRef && !keepOpen) {
  // Auto-close logic
}
```

**Option B**: Remove auto-close entirely (simpler)
```typescript
// Just comment out or remove lines 82-89
// No auto-close at all - let user control it
```

### Step 3: Progressive Disclosure for Reasoning Steps

**File**: `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx`

**Current**: Lines 999-1036 (reasoningSteps rendering)

**Enhanced Version**:
```typescript
{metadata.reasoningSteps && metadata.reasoningSteps.length > 0 && (
  <div className="space-y-2">
    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
      Reasoning Process
    </div>
    <AnimatePresence mode="popLayout">
      {metadata.reasoningSteps.map((step: any, index: number) => (
        <motion.div
          key={step.id || `reasoning-${index}`}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ 
            duration: 0.3,
            delay: index * 0.1  // Stagger animation
          }}
          className={cn(
            "p-3 rounded-lg border",
            step.type === 'thought' && "bg-purple-50 border-purple-200",
            step.type === 'action' && "bg-blue-50 border-blue-200",
            step.type === 'observation' && "bg-green-50 border-green-200",
            !step.type && "bg-gray-50 border-gray-200"
          )}
        >
          <div className="flex items-start gap-2">
            {/* Icon based on type */}
            {step.type === 'thought' && <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />}
            {step.type === 'action' && <Zap className="w-4 h-4 text-blue-600 mt-0.5" />}
            {step.type === 'observation' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />}
            {!step.type && <Circle className="w-4 h-4 text-gray-400 mt-0.5" />}
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                {step.type ? step.type.charAt(0).toUpperCase() + step.type.slice(1) : 'Step'}
              </div>
              <div className="text-sm text-gray-700 mt-1">
                {step.content}
              </div>
              {step.confidence && (
                <Badge variant="secondary" className="mt-2">
                  {Math.round(step.confidence * 100)}% confident
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
)}
```

---

## 📝 Quick Fix Code

I'll apply the fixes now with proper comments for easy identification.

