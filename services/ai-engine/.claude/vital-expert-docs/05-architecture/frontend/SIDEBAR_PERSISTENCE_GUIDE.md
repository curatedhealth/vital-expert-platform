# Sidebar Persistence Implementation Guide

## Overview

This guide explains how to add localStorage persistence to sidebar groups so that users' collapsed/expanded preferences are remembered across sessions.

---

## 🎯 What Was Added

### New Hook: `use-sidebar-state.ts`

**Location**: `apps/digital-health-startup/src/hooks/use-sidebar-state.ts`

**Features**:
- ✅ Persists individual group state (collapsed/expanded) to localStorage
- ✅ Provides "expand all" / "collapse all" functionality
- ✅ Syncs state across browser tabs
- ✅ SSR-safe (works with Next.js)
- ✅ Type-safe with TypeScript

---

## 📖 How to Use

### Basic Usage

Replace the standard `defaultOpen` prop with controlled state using the hook:

#### BEFORE (No Persistence):
```tsx
<Collapsible defaultOpen className="group/collapsible">
  <SidebarGroup>
    <SidebarGroupLabel asChild>
      <CollapsibleTrigger>
        Overview
        <ChevronDown />
      </CollapsibleTrigger>
    </SidebarGroupLabel>
    {/* ... */}
  </SidebarGroup>
</Collapsible>
```

#### AFTER (With Persistence):
```tsx
import { useSidebarGroupState } from "@/hooks/use-sidebar-state"

export function SidebarAdminContent() {
  const [overviewOpen, setOverviewOpen] = useSidebarGroupState("admin", "overview", true)
  const [userAccessOpen, setUserAccessOpen] = useSidebarGroupState("admin", "user-access", true)

  return (
    <>
      <Collapsible
        open={overviewOpen}
        onOpenChange={setOverviewOpen}
        className="group/collapsible"
      >
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Overview
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              {/* ... content ... */}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible
        open={userAccessOpen}
        onOpenChange={setUserAccessOpen}
        className="group/collapsible"
      >
        {/* ... */}
      </Collapsible>
    </>
  )
}
```

---

## 🔧 Implementation Steps

### Step 1: Add Import
```tsx
import { useSidebarGroupState } from "@/hooks/use-sidebar-state"
```

### Step 2: Add State Hooks
At the top of your sidebar component function:
```tsx
export function SidebarAdminContent() {
  // Add one hook per group
  const [overviewOpen, setOverviewOpen] = useSidebarGroupState("admin", "overview", true)
  const [userAccessOpen, setUserAccessOpen] = useSidebarGroupState("admin", "user-access", true)
  const [aiResourcesOpen, setAiResourcesOpen] = useSidebarGroupState("admin", "ai-resources", true)
  // ... etc for all groups
```

**Parameters**:
1. `sidebarId` - Unique ID for the sidebar (e.g., "admin", "knowledge", "agents")
2. `groupId` - Unique ID for the group (e.g., "overview", "user-access")
3. `defaultOpen` - Default state (typically `true`)

### Step 3: Replace Collapsible Props
Change from:
```tsx
<Collapsible defaultOpen className="group/collapsible">
```

To:
```tsx
<Collapsible
  open={overviewOpen}
  onOpenChange={setOverviewOpen}
  className="group/collapsible"
>
```

---

## 📋 Full Example: Admin Sidebar

```tsx
"use client"

import { useSidebarGroupState } from "@/hooks/use-sidebar-state"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
// ... other imports

export function SidebarAdminContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') || 'overview'

  // State for each collapsible group
  const [overviewOpen, setOverviewOpen] = useSidebarGroupState("admin", "overview", true)
  const [userAccessOpen, setUserAccessOpen] = useSidebarGroupState("admin", "user-access", true)
  const [aiResourcesOpen, setAiResourcesOpen] = useSidebarGroupState("admin", "ai-resources", true)
  const [analyticsOpen, setAnalyticsOpen] = useSidebarGroupState("admin", "analytics", true)
  const [llmOpen, setLlmOpen] = useSidebarGroupState("admin", "llm", true)
  const [capabilitiesOpen, setCapabilitiesOpen] = useSidebarGroupState("admin", "capabilities", true)
  const [panelMgmtOpen, setPanelMgmtOpen] = useSidebarGroupState("admin", "panel-mgmt", true)
  const [orgOpen, setOrgOpen] = useSidebarGroupState("admin", "organization", true)

  const handleNavigation = (view: string) => {
    router.push(`/admin?view=${view}`)
  }

  const isActive = (view: string) => currentView === view

  return (
    <>
      {/* Overview Group */}
      <Collapsible
        open={overviewOpen}
        onOpenChange={setOverviewOpen}
        className="group/collapsible"
      >
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Overview
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              {/* ... content ... */}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* User & Access Group */}
      <Collapsible
        open={userAccessOpen}
        onOpenChange={setUserAccessOpen}
        className="group/collapsible"
      >
        {/* ... */}
      </Collapsible>

      {/* Repeat for all other groups */}
    </>
  )
}
```

---

## 🎨 Sidebar ID Naming Convention

Use consistent naming for sidebar IDs:

| Sidebar | Sidebar ID | Example Group IDs |
|---------|------------|-------------------|
| Dashboard | `"dashboard"` | `"overview"`, `"quick-actions"`, `"recent"` |
| Admin | `"admin"` | `"overview"`, `"user-access"`, `"ai-resources"` |
| Knowledge | `"knowledge"` | `"actions"`, `"categories"` |
| Agents | `"agents"` | `"browse"`, `"filter"`, `"actions"` |
| Workflows | `"workflows"` | `"status"`, `"integration"` |
| Ask Panel | `"ask-panel"` | `"my-panels"`, `"workflows"`, `"resources"` |
| Solution Builder | `"solution-builder"` | `"builder"`, `"actions"` |
| Prompt Prism | `"prompt-prism"` | `"assets"`, `"actions"` |
| Personas | `"personas"` | `"filters"`, `"quick-filters"`, `"view-options"` |
| Tools | `"tools"` | `"categories"`, `"integrations"`, `"quick-actions"`, `"settings"` |

---

## 🚀 Advanced Features

### Expand All / Collapse All

Add buttons to expand or collapse all groups at once:

```tsx
import { useSidebarActions } from "@/hooks/use-sidebar-state"

export function SidebarAdminContent() {
  const { expandAll, collapseAll } = useSidebarActions("admin")

  const groupIds = [
    "overview",
    "user-access",
    "ai-resources",
    "analytics",
    "llm",
    "capabilities",
    "panel-mgmt",
    "organization"
  ]

  const handleExpandAll = () => expandAll(groupIds)
  const handleCollapseAll = () => collapseAll(groupIds)

  return (
    <>
      {/* Action Buttons */}
      <div className="px-2 pb-2 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExpandAll}
          className="flex-1"
        >
          Expand All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCollapseAll}
          className="flex-1"
        >
          Collapse All
        </Button>
      </div>

      {/* Groups with persistence */}
      <Collapsible open={overviewOpen} onOpenChange={setOverviewOpen}>
        {/* ... */}
      </Collapsible>
    </>
  )
}
```

---

## 📦 localStorage Structure

The state is stored in localStorage with this structure:

```json
{
  "sidebar-state-admin": {
    "overview": true,
    "user-access": false,
    "ai-resources": true,
    "analytics": false,
    "llm": true,
    "capabilities": true,
    "panel-mgmt": false,
    "organization": true
  },
  "sidebar-state-knowledge": {
    "actions": true,
    "categories": false
  }
}
```

---

## 🧪 Testing

### Test Checklist:
- [ ] State persists after page reload
- [ ] State persists across navigation
- [ ] State syncs across browser tabs
- [ ] Default state works on first visit
- [ ] No console errors in SSR
- [ ] Works with keyboard navigation
- [ ] Expand All / Collapse All works (if implemented)

### Manual Test:
1. Open sidebar and collapse some groups
2. Refresh the page → Groups should remain collapsed
3. Open the same page in a new tab → State should match
4. Use expand/collapse all buttons → All groups should respond
5. Clear localStorage → Groups should reset to default open state

---

## 🔍 Troubleshooting

### Issue: State not persisting
**Solution**: Check that you're using `open` and `onOpenChange` props, not `defaultOpen`

### Issue: SSR hydration mismatch
**Solution**: The hook handles SSR safely by returning `defaultOpen` on server

### Issue: State not syncing across tabs
**Solution**: The hook dispatches storage events - ensure you're using the latest version

---

## 📊 Migration Checklist

For each sidebar:

- [ ] Import `useSidebarGroupState` hook
- [ ] Add state hook for each group
- [ ] Replace `defaultOpen` with `open` and `onOpenChange`
- [ ] Use consistent sidebar and group IDs
- [ ] Test persistence works
- [ ] Optional: Add expand/collapse all buttons

---

## 🎯 Benefits

**For Users**:
- ✅ Sidebar preferences remembered across sessions
- ✅ Faster navigation (no need to re-collapse groups)
- ✅ Personalized experience
- ✅ Consistent state across browser tabs

**For Developers**:
- ✅ Simple, reusable hook
- ✅ Type-safe
- ✅ SSR-safe
- ✅ No external dependencies
- ✅ Easy to implement

---

## 📝 Notes

- State is stored per sidebar (isolated)
- State persists indefinitely until cleared
- Clearing browser data will reset state
- Hook is SSR-safe for Next.js
- No performance impact

---

**Last Updated**: 2025-11-14
**Version**: 1.0.0
**Status**: Ready for implementation
