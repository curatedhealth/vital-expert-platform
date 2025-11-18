# Remaining Sidebar Updates Guide

## Overview
This document provides step-by-step instructions for updating the remaining sidebars to match the unified design system. All changes are to be made in: `apps/digital-health-startup/src/components/sidebar-view-content.tsx`

---

## Required Imports (Add at top of file if missing)

```typescript
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
```

---

## Update Pattern

For EVERY `SidebarGroup` in the functions below, wrap it with the Collapsible pattern:

### BEFORE:
```tsx
<SidebarGroup>
  <SidebarGroupLabel>Section Name</SidebarGroupLabel>
  <SidebarGroupContent>
    {/* content */}
  </SidebarGroupContent>
</SidebarGroup>
```

### AFTER:
```tsx
<Collapsible defaultOpen className="group/collapsible">
  <SidebarGroup>
    <SidebarGroupLabel asChild>
      <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
        Section Name
        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
      </CollapsibleTrigger>
    </SidebarGroupLabel>
    <CollapsibleContent>
      <SidebarGroupContent>
        {/* content */}
      </SidebarGroupContent>
    </CollapsibleContent>
  </SidebarGroup>
</Collapsible>
```

---

## 1. SidebarAgentsContent()

**Location**: Find `export function SidebarAgentsContent()`

**Groups to Update**:
1. "Browse Agents"
2. "Filter by Tier" (if exists)
3. Any other groups

**Example**:
```tsx
export function SidebarAgentsContent() {
  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Browse Agents
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              {/* existing content */}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Repeat for each group */}
    </>
  )
}
```

---

## 2. SidebarKnowledgeContent()

**Location**: Find `export function SidebarKnowledgeContent()`

**Groups to Update**:
1. "Browse Documents"
2. "Quick Upload"
3. "Knowledge Domains" (complex - handle carefully)

**Special Note**: The Knowledge Domains group has async data loading. Make sure to preserve all existing logic inside the CollapsibleContent.

---

## 3. SidebarSolutionBuilderContent()

**Location**: Find `export function SidebarSolutionBuilderContent()`

**Groups to Update**:
1. "Components"
2. "Actions"

---

## 4. SidebarPromptPrismContent()

**Location**: Find `export function SidebarPromptPrismContent()`

**Groups to Update**:
1. "Prompt Assets"
2. "Actions"

---

## 5. SidebarAskPanelContent()

**Location**: Find `export function SidebarAskPanelContent()`

**Groups to Update**:
1. "My Panels" (has dynamic content - preserve logic)
2. "Panel Workflows"
3. "Quick Start"

**Special Note**: This function uses `useSavedPanels()` hook. Preserve all conditional rendering.

---

## 6. SidebarAdminContent() ⚠️ MOST IMPORTANT

**Location**: Find `export function SidebarAdminContent()`

**Groups to Update** (8 groups total):
1. "Overview"
2. "User & Access"
3. "AI Resources"
4. "Knowledge Management"
5. "Compliance & Security"
6. "System & Platform"
7. "Healthcare Operations"
8. "Enterprise & Integrations"

**Special Note**: This function has:
- `useRouter()` and `useSearchParams()` hooks
- `handleNavigation()` function
- `isActive()` function
- ALL must be preserved!

**Example for first group**:
```tsx
export function SidebarAdminContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') || 'overview'

  const handleNavigation = (view: string) => {
    router.push(`/admin?view=${view}`)
  }

  const isActive = (view: string) => currentView === view

  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Overview
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('executive')}
                    isActive={isActive('executive')}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Executive Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* ... rest of items */}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Repeat for remaining 7 groups */}
    </>
  )
}
```

---

## 7. SidebarPersonasContent()

**Location**: Find `export function SidebarPersonasContent()`

**Groups to Update**:
1. "Persona Library"
2. "Filter Options"
3. "Quick Filters"

---

## 8. SidebarToolsContent()

**Location**: Find `export function SidebarToolsContent()`

**Groups to Update**:
1. "Tools Library"
2. "Categories"
3. "Actions"

---

## Verification Checklist

After updating each sidebar function, verify:

- [ ] All `<SidebarGroup>` elements are wrapped in `<Collapsible defaultOpen className="group/collapsible">`
- [ ] `<SidebarGroupLabel>` has `asChild` prop
- [ ] `<CollapsibleTrigger>` has correct classes: `flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5`
- [ ] `<ChevronDown>` icon added with classes: `ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180`
- [ ] `<SidebarGroupContent>` is wrapped in `<CollapsibleContent>`
- [ ] All existing functionality (hooks, handlers, conditionals) preserved
- [ ] No syntax errors (matching brackets, proper nesting)

---

## Testing Steps

After all updates:

1. **Visual Check**: Navigate to each view and verify chevron icons appear
2. **Collapse Test**: Click each group label to test collapse/expand
3. **Animation Test**: Verify smooth rotation of chevron icons
4. **Mobile Test**: Check responsive behavior on small screens
5. **Keyboard Test**: Tab through and press Enter to collapse/expand
6. **Console Check**: No React errors or warnings

---

## Common Pitfalls to Avoid

❌ **DON'T**:
- Remove existing hooks or state management
- Change the order of elements
- Forget to close tags properly
- Remove conditional rendering logic
- Change icon sizes from `h-4 w-4`

✅ **DO**:
- Preserve all existing functionality
- Keep all event handlers intact
- Maintain proper JSX nesting
- Test after each function update
- Check for TypeScript errors

---

## Estimated Time

- Simple sidebars (2-3 groups): 5-10 minutes each
- Medium sidebars (4-5 groups): 10-15 minutes each
- Complex admin sidebar (8 groups): 20-30 minutes

**Total Estimated Time**: 1.5 - 2 hours

---

## Priority Order

1. **High Priority** (User-facing, most used):
   - ✅ Ask Expert (DONE)
   - ✅ Workflows (DONE)
   - 🔴 Admin (DO NEXT)
   - 🔴 Knowledge
   - 🔴 Agents

2. **Medium Priority**:
   - Ask Panel
   - Solution Builder
   - Personas

3. **Low Priority** (Less frequently used):
   - Prompt Prism
   - Tools

---

## After Completion

Once all sidebars are updated:

1. Create a PR with title: "feat: Unified Sidebar Design System - Collapsible Groups"
2. Add before/after screenshots
3. Document in CHANGELOG.md
4. Update component documentation
5. Add to design system documentation

---

## Support

If you encounter issues:
- Check SIDEBAR_DESIGN_SYSTEM.md for the full design spec
- Review completed sidebars (Ask Expert, Workflows, Dashboard) as examples
- Ensure Radix UI Collapsible is properly installed

---

Last Updated: 2025-11-14
Status: 2 of 11 sidebars completed (18%)
