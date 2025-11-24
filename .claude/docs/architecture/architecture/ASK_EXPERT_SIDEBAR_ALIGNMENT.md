# Ask Expert Sidebar Alignment - November 18, 2025

## Summary

Updated the Ask Expert sidebar to align with the unified collapsible design system used across all other views in the application.

---

## Changes Made

### File Updated

**File**: `apps/digital-health-startup/src/components/sidebar-ask-expert.tsx`

**Changes**:
1. ✅ Added `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` imports
2. ✅ Added `ChevronDown` icon import
3. ✅ Wrapped all 3 `SidebarGroup` components with `Collapsible` wrappers
4. ✅ Added collapsible triggers with chevron icons to all group labels
5. ✅ All groups default to `open` state (`defaultOpen`)

---

## Three Collapsible Sections

### 1. Quick Actions
**Contents**:
- New Consultation button (with selected agent count badge)
- Refresh button
- Browse Agent Store link

**Design**:
```tsx
<Collapsible defaultOpen className="group/collapsible">
  <SidebarGroup>
    <SidebarGroupLabel asChild>
      <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
        Quick Actions
        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
      </CollapsibleTrigger>
    </SidebarGroupLabel>
    <CollapsibleContent>
      <SidebarGroupContent>
        {/* Menu items */}
      </SidebarGroupContent>
    </CollapsibleContent>
  </SidebarGroup>
</Collapsible>
```

### 2. Recent Consultations
**Contents**:
- List of recent chat sessions
- Session metadata (agent name, message count, timestamp)
- Active session highlighting

**Features**:
- Shows agent avatar or generic user icon
- Displays relative timestamps (e.g., "2 hrs ago")
- Badge showing message count per session
- Loading state with spinner
- Empty state message

### 3. My Agents
**Contents**:
- Search input for filtering agents
- Scrollable list of user's agents (grouped by tier)
- Agent selection with checkmarks
- Add/Remove agent buttons

**Features**:
- Search functionality
- Tier-based grouping (Tier 3, Tier 2, Tier 1)
- Agent avatars with selection state
- Visual indicators for user-added agents (green border)
- Selected agents have primary color styling
- Max height with scroll area (320px)
- Mobile-specific "Manage Agents" button

---

## Design Pattern Consistency

### Before (Old Design)
- ❌ Static, non-collapsible groups
- ❌ No chevron indicators
- ❌ Inconsistent with other views

### After (New Design)
- ✅ Collapsible groups with smooth animations
- ✅ ChevronDown icons that rotate on toggle
- ✅ Hover states on group labels
- ✅ Consistent with Dashboard, Agents, Workflows, etc.

---

## Visual Behavior

### Collapsible Interaction
1. **Closed State**:
   - Group label visible
   - Chevron points down
   - Content hidden
   - Space conserved

2. **Open State** (default):
   - Group label visible
   - Chevron rotates 180° (points up)
   - Content displayed with smooth slide animation
   - Full functionality accessible

3. **Hover State**:
   - Group label gets `bg-sidebar-accent` background
   - Cursor changes to pointer
   - Visual feedback for interactivity

---

## Alignment with Other Views

The Ask Expert sidebar now matches the design pattern used in:

### ✅ Dashboard Sidebar
- `SidebarDashboardContent` - Overview, Quick Actions groups

### ✅ Agents Sidebar
- `SidebarAgentsContent` - Agent Store, My Agents groups

### ✅ Workflows Sidebar
- `SidebarWorkflowsContent` - Workflows, Templates groups

### ✅ Solution Builder Sidebar
- `SidebarSolutionBuilderContent` - Solutions, Components groups

### ✅ Knowledge Sidebar
- `SidebarKnowledgeContent` - Knowledge Base, Documents groups

### ✅ Prompt Prism Sidebar
- `SidebarPromptPrismContent` - Prompts, Collections groups

### ✅ Admin Sidebar
- `SidebarAdminContent` - System, Users, Settings groups

---

## Technical Implementation

### Imports Added
```typescript
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
```

### Pattern Applied
```typescript
<Collapsible defaultOpen className="group/collapsible">
  <SidebarGroup>
    <SidebarGroupLabel asChild>
      <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
        {groupTitle}
        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
      </CollapsibleTrigger>
    </SidebarGroupLabel>
    <CollapsibleContent>
      <SidebarGroupContent>
        {/* Content */}
      </SidebarGroupContent>
    </CollapsibleContent>
  </SidebarGroup>
</Collapsible>
```

### Key CSS Classes
- `group/collapsible` - Parent container for group state management
- `group-data-[state=open]/collapsible:rotate-180` - Chevron rotation animation
- `hover:bg-sidebar-accent` - Hover background on trigger
- `rounded-md px-2 py-1.5` - Trigger padding and border radius

---

## User Experience Improvements

### 1. Space Efficiency
- Users can collapse sections they don't frequently use
- More vertical space for important content
- Cleaner, less cluttered interface

### 2. Consistent Interaction
- Same collapsible behavior across all views
- Reduced cognitive load (familiar patterns)
- Predictable user experience

### 3. Visual Feedback
- Clear indicators for collapsible sections (chevron icons)
- Smooth animations on expand/collapse
- Hover states for better affordance

### 4. Accessibility
- Keyboard navigation support (via Radix UI primitives)
- ARIA attributes automatically handled
- Screen reader friendly

---

## Testing Checklist

- [ ] Verify all 3 groups are collapsible
- [ ] Check chevron icons rotate correctly
- [ ] Test hover states on group labels
- [ ] Verify default open state works
- [ ] Test collapse/expand animations
- [ ] Check search functionality in "My Agents"
- [ ] Verify agent selection still works
- [ ] Test "New Consultation" button
- [ ] Check session list display
- [ ] Test on mobile (responsive behavior)
- [ ] Verify keyboard navigation
- [ ] Check screen reader compatibility

---

## Related Documentation

- [Sidebar Design System](.claude/vital-expert-docs/05-architecture/frontend/SIDEBAR_DESIGN_SYSTEM.md)
- [Sidebar Enhancements Complete](.claude/vital-expert-docs/05-architecture/frontend/SIDEBAR_ENHANCEMENTS_COMPLETE.md)
- [Ask Expert 4-Mode System](.claude/vital-expert-docs/04-services/ask-expert/4_MODE_SYSTEM_FINAL.md)

---

## Before/After Comparison

### Before
```tsx
<SidebarGroup>
  <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
  <SidebarGroupContent>
    {/* Content */}
  </SidebarGroupContent>
</SidebarGroup>
```

### After
```tsx
<Collapsible defaultOpen className="group/collapsible">
  <SidebarGroup>
    <SidebarGroupLabel asChild>
      <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
        Quick Actions
        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
      </CollapsibleTrigger>
    </SidebarGroupLabel>
    <CollapsibleContent>
      <SidebarGroupContent>
        {/* Content */}
      </SidebarGroupContent>
    </CollapsibleContent>
  </SidebarGroup>
</Collapsible>
```

---

## Status

✅ **COMPLETE** - Ask Expert sidebar now fully aligned with the unified collapsible design system used across all application views.

---

## Next Steps (Optional Enhancements)

### 1. Persist Collapse State
- Store user's collapse/expand preferences in localStorage
- Restore state on page reload
- Per-user customization

### 2. Keyboard Shortcuts
- Add keyboard shortcuts for toggling sections
- Quick navigation between groups
- Improved power-user experience

### 3. Section Settings
- Allow users to reorder sections
- Show/hide sections based on preferences
- Customizable sidebar layout

---

## Impact

### Code Consistency
- ✅ All sidebar views now use same pattern
- ✅ Easier to maintain and update
- ✅ Reduced code duplication

### User Experience
- ✅ Consistent behavior across all views
- ✅ More efficient use of screen space
- ✅ Better visual organization

### Developer Experience
- ✅ Clear pattern to follow for new views
- ✅ Well-documented implementation
- ✅ Reusable components
