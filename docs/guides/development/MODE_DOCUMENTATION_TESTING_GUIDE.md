# Mode Documentation Testing Guide

**Version**: 1.0  
**Date**: November 2025  
**Purpose**: Comprehensive testing guide for all 4 Mode Documentation components

---

## Overview

This guide provides step-by-step instructions for testing the Mode Documentation components (Mode 1, Mode 2, Mode 3, and Mode 4) in the WorkflowBuilder interface.

---

## Prerequisites

1. **Application Running**: Ensure the digital-health-startup app is running
2. **Access to WorkflowBuilder**: Navigate to the WorkflowBuilder page
3. **Browser DevTools**: Open browser developer tools to check for console errors

---

## Testing Checklist

### ✅ Component Creation

- [ ] Mode1Documentation component exists and imports correctly
- [ ] Mode2Documentation component exists and imports correctly
- [ ] Mode3Documentation component exists and imports correctly
- [ ] Mode4Documentation component exists and imports correctly
- [ ] All components are imported in WorkflowBuilder.tsx

### ✅ Basic Functionality

#### Mode 1: Interactive Manual
- [ ] Modal opens when `showMode1Docs` is set to `true`
- [ ] Modal closes when close button is clicked
- [ ] Modal closes when clicking outside (overlay click)
- [ ] All sections are collapsible
- [ ] Default sections (overview, architecture) are expanded on open
- [ ] Content is scrollable when it exceeds viewport height

#### Mode 2: Interactive Automatic
- [ ] Modal opens when `showMode2Docs` is set to `true`
- [ ] Modal closes when close button is clicked
- [ ] Modal closes when clicking outside (overlay click)
- [ ] All sections are collapsible
- [ ] Default sections (overview, architecture) are expanded on open
- [ ] Content is scrollable when it exceeds viewport height

#### Mode 3: Autonomous Manual
- [ ] Modal opens when `showMode3Docs` is set to `true`
- [ ] Modal closes when close button is clicked
- [ ] Modal closes when clicking outside (overlay click)
- [ ] All sections are collapsible
- [ ] Default sections (overview, architecture) are expanded on open
- [ ] Content is scrollable when it exceeds viewport height

#### Mode 4: Autonomous Automatic
- [ ] Modal opens when `showMode4Docs` is set to `true`
- [ ] Modal closes when close button is clicked
- [ ] Modal closes when clicking outside (overlay click)
- [ ] All sections are collapsible
- [ ] Default sections (overview, architecture) are expanded on open
- [ ] Content is scrollable when it exceeds viewport height

### ✅ Content Verification

#### Mode 1 Content
- [ ] Title: "Ask Expert Mode 1: Interactive Manual - Documentation"
- [ ] Description: "Comprehensive workflow visualization and implementation guide"
- [ ] Executive Overview section contains correct information
- [ ] High-Level Architecture section shows correct flow
- [ ] Workflow Phases section lists all 7 phases
- [ ] Node Descriptions section lists all nodes
- [ ] Tool Integration Points section lists all tools
- [ ] Performance Metrics section shows correct metrics

#### Mode 2 Content
- [ ] Title: "Ask Expert Mode 2: Interactive Automatic - Documentation"
- [ ] Description: "Smart Expert Discussion - AI selects best expert(s) for your query"
- [ ] Executive Overview mentions AI expert selection
- [ ] High-Level Architecture includes expert selection step
- [ ] Workflow Phases section includes "Expert Selection" phase
- [ ] Node Descriptions include `select_experts` and `expert_coordination` nodes
- [ ] Performance Metrics show 45-60s response times

#### Mode 3 Content
- [ ] Title: "Ask Expert Mode 3: Autonomous Manual - Documentation"
- [ ] Description: "Expert-Driven Workflow - Multi-step autonomous execution with selected expert"
- [ ] Executive Overview mentions autonomous execution
- [ ] High-Level Architecture includes workflow planning and execution steps
- [ ] Workflow Phases section includes "Workflow Planning" and "Checkpoint & Approval" phases
- [ ] Node Descriptions include `workflow_planning` and `checkpoint_approval` nodes
- [ ] Performance Metrics show 3-5 minute workflow times

#### Mode 4 Content
- [ ] Title: "Ask Expert Mode 4: Autonomous Automatic - Documentation"
- [ ] Description: "AI Collaborative Workflow - Multiple experts working together autonomously"
- [ ] Executive Overview mentions team assembly and collaboration
- [ ] High-Level Architecture includes team assembly and parallel execution
- [ ] Workflow Phases section includes "Expert Team Assembly" and "Parallel Execution" phases
- [ ] Node Descriptions include `select_expert_team` and `parallel_execution` nodes
- [ ] Performance Metrics show 5-10 minute workflow times

### ✅ UI/UX Testing

- [ ] Modal has correct max-width (max-w-4xl)
- [ ] Modal has correct max-height (max-h-[90vh])
- [ ] Header is fixed at top (flex-shrink-0)
- [ ] Content area scrolls independently
- [ ] All icons render correctly
- [ ] All badges display correctly
- [ ] Color coding for phases is consistent
- [ ] Hover states work on collapsible triggers
- [ ] Chevron icons rotate correctly when expanding/collapsing
- [ ] No layout shifts when expanding/collapsing sections

### ✅ Responsive Design

- [ ] Modal is responsive on mobile devices
- [ ] Content is readable on small screens
- [ ] Grid layouts adapt to screen size
- [ ] Scrolling works on touch devices

---

## Manual Testing Steps

### Step 1: Access WorkflowBuilder

1. Navigate to the WorkflowBuilder page in your application
2. Verify the page loads without errors

### Step 2: Test Mode 1 Documentation

1. **Open Browser Console** (F12 or Cmd+Option+I)
2. **In Console**, type:
   ```javascript
   // If you have access to the component state, you can trigger it directly
   // Otherwise, you'll need to add a button or trigger in the UI
   ```
3. **Alternative**: Add a temporary button in WorkflowBuilder to test:
   ```tsx
   <Button onClick={() => setShowMode1Docs(true)}>
     Test Mode 1 Docs
   </Button>
   ```
4. **Verify**:
   - Modal opens
   - Content is visible
   - Can scroll through all sections
   - All collapsible sections work
   - Modal closes properly

### Step 3: Test Mode 2 Documentation

1. Add a test button or trigger:
   ```tsx
   <Button onClick={() => setShowMode2Docs(true)}>
     Test Mode 2 Docs
   </Button>
   ```
2. **Verify**:
   - Modal opens with Mode 2 content
   - Expert selection information is present
   - All sections are functional
   - Content is scrollable

### Step 4: Test Mode 3 Documentation

1. Add a test button or trigger:
   ```tsx
   <Button onClick={() => setShowMode3Docs(true)}>
     Test Mode 3 Docs
   </Button>
   ```
2. **Verify**:
   - Modal opens with Mode 3 content
   - Autonomous workflow information is present
   - Workflow planning section is visible
   - All sections are functional

### Step 5: Test Mode 4 Documentation

1. Add a test button or trigger:
   ```tsx
   <Button onClick={() => setShowMode4Docs(true)}>
     Test Mode 4 Docs
   </Button>
   ```
2. **Verify**:
   - Modal opens with Mode 4 content
   - Team assembly information is present
   - Parallel execution details are visible
   - All sections are functional

### Step 6: Test Multiple Modals

1. Open Mode 1 documentation
2. Close it
3. Open Mode 2 documentation
4. Verify no state conflicts
5. Repeat for all modes

### Step 7: Test Scrolling

1. Open any mode documentation
2. Expand all sections
3. Verify you can scroll to the bottom
4. Verify scrollbar appears when needed
5. Test on different screen sizes

---

## Integration Testing

### Test with Actual WorkflowBuilder Integration

1. **Find where Mode 1 docs are triggered** in WorkflowBuilder
2. **Add similar triggers for other modes**:
   ```tsx
   // Example: Add buttons in a menu or toolbar
   <DropdownMenu>
     <DropdownMenuTrigger>Documentation</DropdownMenuTrigger>
     <DropdownMenuContent>
       <DropdownMenuItem onClick={() => setShowMode1Docs(true)}>
         Mode 1: Interactive Manual
       </DropdownMenuItem>
       <DropdownMenuItem onClick={() => setShowMode2Docs(true)}>
         Mode 2: Interactive Automatic
       </DropdownMenuItem>
       <DropdownMenuItem onClick={() => setShowMode3Docs(true)}>
         Mode 3: Autonomous Manual
       </DropdownMenuItem>
       <DropdownMenuItem onClick={() => setShowMode4Docs(true)}>
         Mode 4: Autonomous Automatic
       </DropdownMenuItem>
     </DropdownMenuContent>
   </DropdownMenu>
   ```

---

## Automated Testing (Future)

### Unit Tests

```typescript
// Example test structure
describe('Mode Documentation Components', () => {
  describe('Mode1Documentation', () => {
    it('renders correctly', () => {
      // Test implementation
    });
    
    it('opens and closes modal', () => {
      // Test implementation
    });
    
    it('expands and collapses sections', () => {
      // Test implementation
    });
  });
  
  // Similar tests for Mode2, Mode3, Mode4
});
```

### E2E Tests

```typescript
// Example Playwright/Cypress test
test('Mode documentation modals work correctly', async ({ page }) => {
  await page.goto('/workflow-builder');
  
  // Test Mode 1
  await page.click('[data-testid="open-mode1-docs"]');
  await expect(page.locator('text=Mode 1: Interactive Manual')).toBeVisible();
  await page.click('[aria-label="Close"]');
  
  // Test Mode 2
  await page.click('[data-testid="open-mode2-docs"]');
  await expect(page.locator('text=Mode 2: Interactive Automatic')).toBeVisible();
  
  // ... etc
});
```

---

## Common Issues & Solutions

### Issue: Modal doesn't open
**Solution**: Check that state variable is properly initialized and component is imported

### Issue: Content not scrollable
**Solution**: Verify `flex-1 min-h-0 overflow-y-auto` classes are applied to content div

### Issue: Sections not collapsing
**Solution**: Check that `openSections` state is properly managed and Collapsible components are configured correctly

### Issue: Icons not rendering
**Solution**: Verify lucide-react icons are imported correctly

### Issue: Layout shifts
**Solution**: Ensure DialogHeader has `flex-shrink-0` class

---

## Performance Testing

- [ ] Modal opens quickly (< 100ms)
- [ ] No lag when expanding/collapsing sections
- [ ] Smooth scrolling performance
- [ ] No memory leaks when opening/closing multiple times

---

## Browser Compatibility

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Accessibility Testing

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader compatible
- [ ] Focus management is correct
- [ ] ARIA labels are present
- [ ] Color contrast meets WCAG standards

---

## Next Steps

1. **Add UI Triggers**: Add buttons or menu items in WorkflowBuilder to open each mode's documentation
2. **Add Test IDs**: Add `data-testid` attributes for easier automated testing
3. **Add Keyboard Shortcuts**: Consider adding keyboard shortcuts to open documentation
4. **Add Search**: Consider adding search functionality within documentation
5. **Add Print Support**: Consider adding print-friendly styles

---

## Related Documentation

- [4_MODE_SYSTEM_FINAL.md](../../.claude/vital-expert-docs/04-services/ask-expert/4_MODE_SYSTEM_FINAL.md)
- [Mode1Documentation.tsx](../../apps/digital-health-startup/src/components/langgraph-gui/Mode1Documentation.tsx)
- [WorkflowBuilder.tsx](../../apps/digital-health-startup/src/components/langgraph-gui/WorkflowBuilder.tsx)

---

## Notes

- All mode documentation components follow the same structure for consistency
- Each mode has unique content based on its characteristics
- The scrolling fix (using `overflow-y-auto` instead of `ScrollArea`) should be tested thoroughly
- Consider adding analytics to track which modes users view most

