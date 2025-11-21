# VITAL Sidebar Design System

## Overview
This document defines the unified design system for all sidebar implementations across the VITAL platform. All sidebars must follow this pattern to ensure visual consistency and a cohesive user experience.

## Design Principles

### 1. **Collapsible Groups by Default**
All sidebar sections MUST use collapsible groups to allow users to manage their workspace efficiently.

### 2. **Consistent Visual Hierarchy**
- All groups start with `defaultOpen={true}` for first-time users
- Group labels are interactive collapse triggers
- Chevron icons indicate collapsible state
- Consistent spacing and padding throughout

### 3. **Predictable Interaction Patterns**
- Hover states on all interactive elements
- Clear visual feedback for active/selected items
- Loading states for async operations
- Empty states with helpful guidance

## Template Structure

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function SidebarViewContent() {
  return (
    <>
      {/* Group 1: Primary Actions */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Group Name
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <IconComponent className="h-4 w-4" />
                    <span>Menu Item</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Group 2: Secondary Actions */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          {/* ... same structure ... */}
        </SidebarGroup>
      </Collapsible>
    </>
  )
}
```

## Component Specifications

### SidebarGroup
- **Purpose**: Container for related menu items
- **Must be**: Wrapped in `<Collapsible>` component
- **Attributes**: `className="group/collapsible"` for animation control

### SidebarGroupLabel
- **Purpose**: Section header and collapse trigger
- **Must be**: Wrapped in `<CollapsibleTrigger>`
- **Classes**: `flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5`
- **Icon**: `<ChevronDown>` with rotation animation

### SidebarMenuButton
- **Icon Size**: Always `h-4 w-4`
- **Spacing**: Consistent gap between icon and text
- **States**: Default, hover, active, disabled
- **Link**: Use `asChild` prop with Next.js `<Link>` for navigation

### Icons
- **Library**: Lucide React icons only
- **Size**: 4x4 (16px) for menu items
- **Consistency**: Same icon for same concepts across views

## Standard Group Categories

### 1. Quick Actions / Primary Actions
- **Purpose**: Most common user actions
- **Position**: First group in sidebar
- **defaultOpen**: `true`
- **Examples**: Start Conversation, Create Agent, Upload Knowledge

### 2. Recent / History
- **Purpose**: User's recent activity
- **Position**: Second or third group
- **defaultOpen**: `true`
- **Examples**: Recent Chats, Recent Reports, Recent Sessions

### 3. Browse / Library
- **Purpose**: Browsing and discovery
- **Position**: Middle section
- **defaultOpen**: `true`
- **Examples**: Agent Store, Knowledge Domains, Tool Library

### 4. Filters / Settings
- **Purpose**: View customization
- **Position**: Later in sidebar
- **defaultOpen**: `false` (can be collapsed by default)
- **Examples**: Filter by Tier, Filter by Status

## Responsive Behavior

### Mobile (`isMobile` from `useSidebar()`)
- Groups collapse automatically when sidebar is in icon mode
- Use `className="group-data-[collapsible=icon]:hidden"` for mobile-only hiding
- Maintain touch-friendly tap targets (minimum 44x44px)

### Desktop
- All groups visible and collapsible
- Smooth transitions on expand/collapse
- Preserve user's collapse preferences (future: localStorage)

## Loading States

```tsx
<SidebarMenuItem>
  <SidebarMenuButton disabled>
    <Loader2Icon className="h-4 w-4 animate-spin" />
    <span>Loading...</span>
  </SidebarMenuButton>
</SidebarMenuItem>
```

## Empty States

```tsx
{items.length === 0 && (
  <SidebarMenuItem>
    <SidebarMenuButton disabled>
      <IconComponent className="h-4 w-4 opacity-60" />
      <span>No items yet</span>
    </SidebarMenuButton>
  </SidebarMenuItem>
)}
```

## Active State

```tsx
<SidebarMenuButton
  data-active={isActive}
  onClick={handleClick}
>
  {/* content */}
</SidebarMenuButton>
```

## Search Inputs

When a group contains searchable content:

```tsx
<CollapsibleContent>
  <SidebarGroupContent className="space-y-3">
    {/* Search input */}
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="pl-9"
      />
    </div>

    {/* Scrollable results */}
    <ScrollArea className="max-h-[320px] pr-2">
      <SidebarMenu className="space-y-2">
        {/* Menu items */}
      </SidebarMenu>
    </ScrollArea>
  </SidebarGroupContent>
</CollapsibleContent>
```

## Migration Checklist

When updating an existing sidebar:

- [ ] Wrap each `<SidebarGroup>` in `<Collapsible defaultOpen className="group/collapsible">`
- [ ] Convert `<SidebarGroupLabel>` to use `asChild` with `<CollapsibleTrigger>`
- [ ] Add hover classes: `hover:bg-sidebar-accent rounded-md px-2 py-1.5`
- [ ] Add `<ChevronDown>` icon with rotation animation
- [ ] Wrap group content in `<CollapsibleContent>`
- [ ] Ensure all icons are `h-4 w-4`
- [ ] Test collapse/expand functionality
- [ ] Verify mobile responsiveness
- [ ] Check loading and empty states

## Examples by View

### ✅ Dashboard (Reference Implementation)
- 3 collapsible groups: Overview, Quick Actions, Recent
- All default open
- Consistent icon sizes
- Link navigation with Next.js

### ❌ Ask Expert (Needs Update)
- Non-collapsible groups
- Inconsistent spacing
- No collapse affordance

### ❌ Workflows (Needs Update)
- Non-collapsible groups
- Missing group structure

### ❌ Knowledge (Needs Update)
- Partial collapsible implementation
- Inconsistent patterns

## Accessibility

- **Keyboard Navigation**: All collapse triggers are keyboard accessible
- **Screen Readers**: Group labels announce collapsible state
- **Focus Management**: Visible focus indicators on all interactive elements
- **ARIA**: Proper ARIA attributes from Radix UI Collapsible

## Animation Standards

### Collapse/Expand
- **Duration**: 200ms (Radix UI default)
- **Easing**: ease-in-out
- **Icon Rotation**: `rotate-180` on open state
- **Height**: Smooth height transition (CSS)

### Hover States
- **Duration**: 150ms
- **Effect**: Background color change to `sidebar-accent`
- **Border Radius**: `rounded-md`

## Future Enhancements

1. **Persistence**: Save user's collapse preferences to localStorage
2. **Search**: Global sidebar search across all views
3. **Customization**: Allow users to reorder sidebar groups
4. **Badges**: Notification badges for updates/changes
5. **Keyboard Shortcuts**: Quick collapse/expand shortcuts

## Code Quality Standards

- **TypeScript**: Full type safety for all props
- **Performance**: Memo hooks for expensive computations
- **Accessibility**: WCAG 2.1 AA compliance
- **Testing**: Unit tests for collapse/expand logic
- **Documentation**: JSDoc comments for complex logic

---

## Summary

This design system ensures:
- ✅ **Visual Consistency**: All sidebars look and feel the same
- ✅ **Predictable UX**: Users know how to interact with any sidebar
- ✅ **Scalability**: Easy to add new views following this pattern
- ✅ **Maintainability**: Single source of truth for sidebar design
- ✅ **Accessibility**: Inclusive design for all users

Last Updated: 2025-11-14
Version: 1.0.0
