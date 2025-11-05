# Ask Expert Page Header Standardization

## Summary
Updated the Ask Expert page to use the standardized `PageHeaderCompact` component while maintaining its unique chat interface design.

## Changes Made

### Before
- Custom header with inline styles
- h-14 height, manual flex layout
- text-base title, text-[10px] description
- Custom mode badge with conditional colors
- Separate header element

### After
- **Component**: `PageHeaderCompact` from `@/components/page-header`
- **Icon**: MessageSquare (w-5 h-5)
- **Title**: "Ask Expert" (text-base font-semibold)
- **Description**: "1:1 expert consultation with AI agents" (text-xs)
- **Badge**: Mode indicator (simplified, secondary variant)
- **Actions**: 
  - Selected agent indicator (when agent is selected)
  - Settings button
  - Dark mode toggle

## Standardized Structure

```typescript
<PageHeaderCompact
  icon={MessageSquare}
  title="Ask Expert"
  description="1:1 expert consultation with AI agents"
  badge={{
    label: `Mode ${currentMode.id}: ${currentMode.name}`,
    variant: 'secondary'
  }}
  actions={
    <div className="flex items-center gap-2">
      {/* Agent indicator */}
      {/* Settings button */}
      {/* Dark mode toggle */}
    </div>
  }
/>
```

## Benefits

### ✅ Consistency
- Same header structure as other pages
- Predictable layout and positioning
- Unified design language

### ✅ Maintainability  
- Single component to update
- Centralized styling
- Easier to fix bugs

### ✅ Chat-Optimized
- Compact version (`PageHeaderCompact`) for chat UI
- Smaller h-14 equivalent height
- Space-efficient for message display

## Comparison with Standard Pages

| Feature | Standard Pages | Ask Expert (Compact) |
|---------|---------------|---------------------|
| **Component** | `PageHeader` | `PageHeaderCompact` |
| **Height** | py-4 (larger) | py-3 (smaller) |
| **Icon Size** | h-8 w-8 | h-5 w-5 |
| **Title Size** | text-3xl | text-base |
| **Description** | text-sm | text-xs |
| **Use Case** | Standard pages | Chat/compact UIs |

## Why Compact Version?

The Ask Expert page uses `PageHeaderCompact` because:
1. **Chat Interface**: Needs more vertical space for messages
2. **Always Visible**: Header stays on screen during conversations  
3. **Frequent Interactions**: More focus on chat, less on header
4. **Claude-like Design**: Mimics Claude.ai's minimal header approach

## All Pages Now Standardized

### Standard Header Pages:
- ✅ Dashboard
- ✅ Tools Registry
- ✅ Knowledge
- ✅ Agents
- ✅ Workflows
- ✅ Ask Panel

### Compact Header Pages:
- ✅ Ask Expert (chat interface)

## Files Modified
- ✅ Updated: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`
  - Imported `PageHeaderCompact`
  - Replaced custom header with component
  - Simplified mode badge logic
  - Kept all interactive elements (settings, dark mode, agent indicator)

---

**Status**: ✅ Complete
**Date**: November 4, 2025
**Result**: All application pages now use standardized header components with consistent size, layout, and positioning

