# Sidebar Design System - Quick Reference Card

## ⚡ Quick Start

### 1. Add Imports
```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
```

### 2. Wrap Each Group
```tsx
<Collapsible defaultOpen className="group/collapsible">
  {/* existing SidebarGroup */}
</Collapsible>
```

### 3. Update Label
```tsx
<SidebarGroupLabel asChild>
  <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
    Section Name
    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
  </CollapsibleTrigger>
</SidebarGroupLabel>
```

### 4. Wrap Content
```tsx
<CollapsibleContent>
  <SidebarGroupContent>
    {/* existing content */}
  </SidebarGroupContent>
</CollapsibleContent>
```

---

## 📋 Copy-Paste Template

```tsx
<Collapsible defaultOpen className="group/collapsible">
  <SidebarGroup>
    <SidebarGroupLabel asChild>
      <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
        SECTION_NAME
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
```

---

## ✅ Checklist

- [ ] Imports added
- [ ] `<Collapsible>` wrapper added
- [ ] `defaultOpen` prop set
- [ ] `className="group/collapsible"` added
- [ ] `<SidebarGroupLabel asChild>` updated
- [ ] `<CollapsibleTrigger>` with correct classes
- [ ] `<ChevronDown>` icon added
- [ ] `<CollapsibleContent>` wrapper added
- [ ] All closing tags matched
- [ ] No TypeScript errors
- [ ] Tested collapse/expand
- [ ] Verified mobile behavior

---

## 🎨 Key Classes

| Element | Classes |
|---------|---------|
| Trigger | `flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5` |
| Chevron | `ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180` |
| Icon | `h-4 w-4` |
| Collapsible | `group/collapsible` with `defaultOpen` |

---

## 📍 Files to Update

### High Priority
1. `sidebar-view-content.tsx` → `SidebarAdminContent()`
2. `sidebar-view-content.tsx` → `SidebarKnowledgeContent()`
3. `sidebar-view-content.tsx` → `SidebarAgentsContent()`

### Medium Priority
4. `sidebar-view-content.tsx` → `SidebarAskPanelContent()`
5. `sidebar-view-content.tsx` → `SidebarSolutionBuilderContent()`
6. `sidebar-view-content.tsx` → `SidebarPersonasContent()`

### Low Priority
7. `sidebar-view-content.tsx` → `SidebarPromptPrismContent()`
8. `sidebar-view-content.tsx` → `SidebarToolsContent()`

---

## ⚠️ Don't Forget

- Keep `defaultOpen` prop
- Maintain existing hooks/state
- Preserve event handlers
- Test on mobile
- Check keyboard navigation

---

## 🔍 Testing

1. Click label → should collapse/expand
2. Chevron → should rotate
3. Keyboard (Tab + Enter) → should work
4. Mobile → should be responsive
5. Console → no errors

---

## 📚 Full Docs

- Design System: `SIDEBAR_DESIGN_SYSTEM.md`
- Implementation: `SIDEBAR_REMAINING_UPDATES.md`
- Visual Guide: `SIDEBAR_VISUAL_COMPARISON.md`
- Summary: `SIDEBAR_UNIFICATION_SUMMARY.md`

---

## 💡 Tips

- Start with simple sidebars first
- Test after each sidebar
- Keep existing functionality intact
- Use Dashboard as reference
- Check completed examples (Ask Expert, Workflows)

---

**Ready to implement?** Start with `SidebarAdminContent()` in `sidebar-view-content.tsx`!
