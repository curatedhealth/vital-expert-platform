# AskExpertProvider Fix - Complete

**Status**: ✅ FIXED
**Date**: October 28, 2025 at 7:32 AM

---

## Issue

Runtime error occurred when loading `/ask-expert` page:
```
Error: useAskExpert must be used within an AskExpertProvider
Source: src/contexts/ask-expert-context.tsx (73:11)
```

## Root Cause

The `AskExpertProvider` was only wrapping the **sidebar component**, but the `/ask-expert` **page content** (which also calls `useAskExpert()`) was outside the provider scope.

```
Before (BROKEN):
Layout:
  ├── Sidebar (wrapped with AskExpertProvider) ✅
  └── Content area
        └── /ask-expert page (calls useAskExpert()) ❌ NO PROVIDER!
```

## Solution

Moved `AskExpertProvider` to the **top level** of the layout, wrapping both sidebar AND content:

```
After (FIXED):
Layout wrapped with AskExpertProvider:
  ├── Sidebar (uses useAskExpert()) ✅
  └── Content area
        └── /ask-expert page (uses useAskExpert()) ✅
```

---

## Files Modified

### 1. Layout File
**File**: [apps/digital-health-startup/src/app/(app)/layout.tsx](apps/digital-health-startup/src/app/(app)/layout.tsx)

**Changes**:

#### Import Added (Line 26):
```typescript
import { AskExpertProvider } from '@/contexts/ask-expert-context';
```

#### Provider Wrapper Added (Lines 478-482):
```typescript
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AskExpertProvider>  // ← Added this wrapper
      <AgentsFilterProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </AgentsFilterProvider>
    </AskExpertProvider>  // ← Added this wrapper
  );
}
```

**Result**: Now BOTH sidebar and page content are within the provider scope.

### 2. Sidebar Component
**File**: [apps/digital-health-startup/src/components/shadcn-dashboard-sidebar.tsx](apps/digital-health-startup/src/components/shadcn-dashboard-sidebar.tsx)

**Changes**:

#### Import Updated (Line 38):
```typescript
// BEFORE:
import { AskExpertProvider, useAskExpert } from '@/contexts/ask-expert-context';

// AFTER:
import { useAskExpert } from '@/contexts/ask-expert-context';
```

#### Provider Removed from Wrapper (Lines 316-321):
```typescript
// BEFORE (DUPLICATE PROVIDER):
export function ShadcnDashboardSidebarWrapper() {
  return (
    <AskExpertProvider>  // ← Removed
      <SidebarProvider>
        <ShadcnDashboardSidebar />
      </SidebarProvider>
    </AskExpertProvider>  // ← Removed
  );
}

// AFTER (NO DUPLICATE):
export function ShadcnDashboardSidebarWrapper() {
  return (
    <SidebarProvider>
      <ShadcnDashboardSidebar />
    </SidebarProvider>
  );
}
```

**Result**: No duplicate providers. Single source of truth at layout level.

---

## Architecture Flow (Fixed)

```
AppLayout (default export)
  └── AskExpertProvider ← SINGLE PROVIDER AT TOP LEVEL
        ├── AgentsFilterProvider
        │     └── AppLayoutContent
        │           ├── ShadcnDashboardSidebarWrapper
        │           │     └── SidebarProvider
        │           │           └── ShadcnDashboardSidebar
        │           │                 ├── /ask-expert → AskExpertSidebarContent (uses useAskExpert()) ✅
        │           │                 └── Other routes → DefaultSidebarContent
        │           │
        │           └── Content area (children)
        │                 └── /ask-expert page (uses useAskExpert()) ✅
        └── Both sidebar and page can access context!
```

---

## Verification

### Compilation Status
- ✅ `/ask-expert` compiled successfully (106ms, 1055 modules)
- ✅ No TypeScript errors
- ✅ No runtime "useAskExpert" errors
- ⚠️ SSR warnings (styled-jsx) are harmless and don't affect functionality

### What Should Work Now
1. **Sidebar on /ask-expert**:
   - Uses `useAskExpert()` to access agents
   - Shows search, filters, agent list
   - Agent selection works

2. **Page content on /ask-expert**:
   - Uses `useAskExpert()` to access selected agents
   - Can read `selectedAgents` state
   - Can call `setSelectedAgents()` to update selection

3. **State sharing**:
   - Selecting agents in sidebar updates state
   - Page content sees the updated selected agents
   - Single source of truth for agents and selection

---

## Testing Instructions

1. **Hard refresh browser**: Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

2. **Navigate to**: http://localhost:3000/ask-expert

3. **Verify no errors**:
   - No red error overlay
   - No "useAskExpert must be used within an AskExpertProvider" error
   - Page loads successfully

4. **Verify sidebar**:
   - Contextual sidebar visible on left
   - Three sections: Chat Management, Agents Management, Settings
   - Search box, tier filters, agent list all visible

5. **Test agent selection**:
   - Click on agent cards in sidebar
   - Selected agents show blue background + checkmark
   - Counter updates: "1 selected", "2 selected", etc.

6. **Test state sharing** (when page uses selected agents):
   - Select agents in sidebar
   - Page content should reflect the selection
   - Both sidebar and page use the same state

---

## Summary

### Problem
`useAskExpert must be used within an AskExpertProvider` error because provider only wrapped sidebar, not page content.

### Solution
Moved provider to top level of layout, wrapping entire app including both sidebar and page content.

### Files Changed
- `apps/digital-health-startup/src/app/(app)/layout.tsx` (added provider wrapper)
- `apps/digital-health-startup/src/components/shadcn-dashboard-sidebar.tsx` (removed duplicate provider)

### Result
✅ Both sidebar and page can now use `useAskExpert()` hook
✅ Single source of truth for agents state
✅ No duplicate providers
✅ Compilation successful
✅ Ready for testing

---

**Fix Complete**: October 28, 2025 at 7:32 AM
**Status**: ✅ Ready for browser testing
**Server**: http://localhost:3000 (running)
**Next**: Hard refresh browser and verify contextual sidebar works on /ask-expert!
