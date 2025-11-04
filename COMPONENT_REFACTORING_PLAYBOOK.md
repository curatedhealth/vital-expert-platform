# Component Refactoring Playbook 📘

**A systematic approach to breaking down large, unmaintainable components into modular, testable pieces.**

Based on the successful Knowledge Section refactoring (629 lines → 5 components, 35% reduction).

---

## 🎯 When to Use This Playbook

Apply this refactoring approach when you encounter:

- **Large components** (>500 lines)
- **Mixed concerns** (view + edit + data + logic in one file)
- **JSX syntax errors** (often caused by complex nesting)
- **Difficult maintenance** (hard to find bugs, slow development)
- **Poor testability** (can't unit test parts in isolation)
- **Code duplication** (similar patterns repeated)

---

## 📋 The 8-Step Refactoring Process

### Step 1: Analysis & Assessment (30 min)

**Goal**: Understand the current structure and identify refactoring candidates.

```bash
# Check file size
wc -l path/to/large-component.tsx

# Find all functions in the file
grep -n "^function\|^const.*=.*function\|^export.*function" path/to/large-component.tsx

# Identify the problematic function
grep -n "^function TargetFunction" path/to/large-component.tsx
```

**Questions to answer:**
- How many lines is the component?
- How many sub-functions/components are inside?
- What are the main concerns (view, edit, data, logic)?
- Are there obvious boundaries for separation?

**Example from Knowledge Section:**
```
Total: 1,801 lines
Target: DomainDetailsDialog (629 lines, lines 739-1367)
Concerns identified:
  - Basic info display (read-only)
  - Model config display (read-only)
  - Metadata display (read-only)
  - Edit form (interactive)
  - Dialog orchestration (state + API)
```

---

### Step 2: Create Component Architecture (1 hour)

**Goal**: Design the new modular structure.

**Pattern to follow:**
```
features/
└── [section-name]/
    └── components/
        ├── index.ts                    // Barrel exports
        ├── [Section]BasicInfo.tsx      // Read-only data
        ├── [Section]Config.tsx         // Read-only complex data
        ├── [Section]Metadata.tsx       // Read-only supplemental data
        ├── [Section]EditForm.tsx       // Interactive form
        └── [Section]Dialog.tsx         // Main orchestrator
```

**Component Responsibilities:**

1. **BasicInfo Component** (20-50 lines)
   - Display core identifiers (ID, code, name)
   - Read-only
   - No interactivity

2. **Config Component** (50-150 lines)
   - Display complex configuration
   - Read-only
   - Conditional sections
   - Badge/card-based UI

3. **Metadata Component** (50-100 lines)
   - Display supplemental information
   - Read-only
   - Tags, badges, stats
   - Conditional rendering

4. **EditForm Component** (100-200 lines)
   - All form fields
   - Input handlers
   - Validation logic
   - Reusable across contexts

5. **Dialog Component** (200-300 lines)
   - State management (view/edit modes)
   - API calls (CRUD)
   - Compose all sub-components
   - Handle loading states

---

### Step 3: Create Modular Components (2-3 hours)

**Goal**: Build the new components one by one.

**Order of creation:**
1. BasicInfo (simplest, no dependencies)
2. Config (moderate complexity)
3. Metadata (moderate complexity)
4. EditForm (complex, but isolated)
5. Dialog (most complex, ties everything together)
6. Index (barrel exports)

**Template for BasicInfo:**
```typescript
/**
 * [Section] Basic Info Component
 * Displays read-only basic information
 */

import { Label } from '@/components/ui/label';

interface [Section]BasicInfoProps {
  data: any; // Replace with proper type
}

export function [Section]BasicInfo({ data }: [Section]BasicInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label className="text-xs text-muted-foreground">Field 1</Label>
        <div className="font-mono text-sm">{data.field1}</div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Field 2</Label>
        <div className="font-mono text-sm">{data.field2}</div>
      </div>
    </div>
  );
}
```

**Template for EditForm:**
```typescript
/**
 * [Section] Edit Form Component
 * Form fields for editing properties
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface [Section]EditFormProps {
  formData: any; // Replace with proper type
  onChange: (updates: Partial<any>) => void;
}

export function [Section]EditForm({ formData, onChange }: [Section]EditFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="field1">Field 1 *</Label>
        <Input
          id="field1"
          value={formData.field1}
          onChange={(e) => onChange({ field1: e.target.value })}
        />
      </div>
      {/* More fields... */}
    </div>
  );
}
```

**Template for Dialog:**
```typescript
/**
 * [Section] Dialog Component
 * Main orchestrator with view/edit modes
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Save } from 'lucide-react';

// Import sub-components
import { [Section]BasicInfo } from './[Section]BasicInfo';
import { [Section]EditForm } from './[Section]EditForm';

interface [Section]DialogProps {
  data: any;
  onClose: () => void;
  onUpdate?: () => void;
}

export function [Section]Dialog({ data, onClose, onUpdate }: [Section]DialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    field1: data.field1,
    field2: data.field2,
  });

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/endpoint/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Item' : data.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <[Section]BasicInfo data={data} />
          
          {isEditing ? (
            <[Section]EditForm formData={formData} onChange={setFormData} />
          ) : (
            <[Section]Config data={data} />
          )}
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Template for index.ts:**
```typescript
/**
 * [Section] Components
 * Modular components for [section] management
 */

export { [Section]BasicInfo } from './[Section]BasicInfo';
export { [Section]Config } from './[Section]Config';
export { [Section]Metadata } from './[Section]Metadata';
export { [Section]EditForm } from './[Section]EditForm';
export { [Section]Dialog } from './[Section]Dialog';
```

---

### Step 4: Update Main Page (30 min)

**Goal**: Replace the old monolithic component with the new modular one.

**4.1: Update imports**
```typescript
// Before:
import { Dialog, DialogContent, ... } from '@/components/ui/dialog';
import { Edit, Trash2, Save } from 'lucide-react';

// After:
import { [Section]Dialog } from '@/features/[section]/components';
```

**4.2: Remove old component definition**
```bash
# Find the old component
grep -n "^function [OldComponent]" path/to/page.tsx

# Note the line range (e.g., lines 739-1367)
# Delete using sed
sed -i.bak '[start-line],[end-line]d' path/to/page.tsx
```

**4.3: Verify usage is unchanged**
```typescript
// Component usage should remain the same:
<[Section]Dialog
  data={selectedItem}
  onClose={() => setSelectedItem(null)}
  onUpdate={() => loadItems()}
/>
```

---

### Step 5: Verify & Test (30 min)

**Goal**: Ensure no regressions.

**5.1: Check file size reduction**
```bash
# Before vs After
wc -l path/to/page.tsx

# Should see 30-40% reduction
```

**5.2: Check for build errors**
```bash
npm run build 2>&1 | tee build-output.log

# Verify NO mentions of your new components in errors
grep -i "[Section]Dialog\|[Section]Basic\|[Section]Config" build-output.log
```

**5.3: Verify component structure**
```bash
# Count components in main page
grep -c "^function" path/to/page.tsx

# Should be reduced by 1 (the removed monolithic component)
```

**5.4: Check JSX balance (if there were syntax errors)**
```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('path/to/page.tsx', 'utf8');
const openTags = (content.match(/<[A-Z][^/>]*[^/]>/g) || []).length;
const closeTags = (content.match(/<\/[A-Z][^>]*>/g) || []).length;
console.log('Open:', openTags, 'Close:', closeTags, 'Match:', openTags === closeTags);
"
```

---

### Step 6: Document & Commit (30 min)

**Goal**: Create clear documentation and commit history.

**6.1: Create summary document**
```bash
touch [SECTION]_REFACTOR_COMPLETE.md
```

**Template:**
```markdown
# [Section] Refactoring Complete ✅

## Impact Summary
- Before: [X] lines
- After: [Y] lines (-Z%, -N lines)
- Components created: [N]
- Build errors: ZERO

## New Components
1. [Section]BasicInfo.tsx ([N] lines)
2. [Section]Config.tsx ([N] lines)
3. [Section]Metadata.tsx ([N] lines)
4. [Section]EditForm.tsx ([N] lines)
5. [Section]Dialog.tsx ([N] lines)

## Benefits
- ✅ Testability: Each component can be unit tested
- ✅ Maintainability: Bug fixes target specific components
- ✅ Reusability: Components can be used elsewhere
- ✅ Readability: 100-200 lines vs [old size]

## Verification
- Build: ✅ No new errors
- JSX: ✅ Balanced tags
- Usage: ✅ No breaking changes
```

**6.2: Commit with descriptive message**
```bash
git add -A

git commit -m "refactor: [Section] - Break down [X]-line component into modular pieces ♻️

COMPONENT REFACTORING (OPTION B) COMPLETE

Major Changes:
✅ [X]-line [ComponentName] → [N] modular components
✅ [total-before] lines → [total-after] lines (-[diff] lines, -[percent]%)
✅ ZERO new build errors
✅ Production-ready modular architecture

New Component Structure:
1. [Section]BasicInfo.tsx ([N] lines)
2. [Section]Config.tsx ([N] lines)
3. [Section]Metadata.tsx ([N] lines)
4. [Section]EditForm.tsx ([N] lines)
5. [Section]Dialog.tsx ([N] lines)

Benefits:
✅ Single Responsibility Principle
✅ Easy to test in isolation
✅ Better maintainability
✅ Improved readability

Time: ~[X] hours
Impact: ✅ No breaking changes"

git push origin main
```

---

### Step 7: Cleanup (15 min)

**Goal**: Remove backup files and temporary artifacts.

```bash
# Remove sed backup files
find . -name "*.tsx.bak" -delete

# Remove any temporary test files
find . -name "*.tmp" -delete

# Remove build output logs
rm -f build-output.log
```

---

### Step 8: Testing in Production (Optional, 1 hour)

**Goal**: Verify functionality in running application.

**8.1: Start dev server**
```bash
npm run dev
```

**8.2: Test scenarios:**
- ✅ View mode displays correctly
- ✅ Edit mode displays correctly
- ✅ Form submission works
- ✅ Validation works
- ✅ API calls succeed
- ✅ Loading states display
- ✅ Error handling works

**8.3: Visual regression:**
- Take screenshots before/after
- Compare layouts
- Ensure no UI breakage

---

## 📊 Success Metrics

After refactoring, you should see:

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| **File Size** | 1,500+ lines | 800-1,000 lines | 30-40% reduction |
| **Largest Component** | 500+ lines | 200-300 lines | <300 lines |
| **Testability** | Poor | Excellent | Unit testable |
| **Build Errors** | 3-10 | 0 | 0 |
| **Maintainability** | Difficult | Easy | Easy |
| **Component Count** | 1 monolith | 5-7 modular | 5-7 |

---

## 🎯 Real-World Example: Knowledge Section

### Before Refactoring
```
knowledge-domains/page.tsx: 1,801 lines
├── KnowledgeDomainsPage (main)
├── TieredDomainsView
├── DomainCard
├── DomainTable
└── DomainDetailsDialog ❌ 629 LINES! (lines 739-1367)
    ├── View mode rendering
    ├── Edit mode rendering
    ├── Form state management
    ├── API calls
    └── Complex JSX (6 syntax errors)
```

### After Refactoring
```
knowledge-domains/page.tsx: 1,168 lines (-35%)
├── KnowledgeDomainsPage (main)
├── TieredDomainsView
├── DomainCard
├── DomainTable
└── Imports DomainDetailsDialog from features/

features/knowledge/components/
├── index.ts (7 lines)
├── DomainBasicInfo.tsx (27 lines) ✅
├── DomainModelConfig.tsx (97 lines) ✅
├── DomainMetadata.tsx (60 lines) ✅
├── DomainEditForm.tsx (147 lines) ✅
└── DomainDetailsDialog.tsx (244 lines) ✅
```

### Results
- **Lines removed**: 633 (-35%)
- **Components created**: 5
- **Build errors**: 0 (down from 6)
- **Testability**: ✅ Excellent
- **Maintainability**: ✅ Excellent

---

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Over-modularization
**Problem**: Creating too many tiny components (< 20 lines each).
**Solution**: Aim for 50-200 lines per component. Group related fields.

### Pitfall 2: Tight coupling
**Problem**: Components depend on each other's internal state.
**Solution**: Use props for data flow. Keep components independent.

### Pitfall 3: Breaking existing usage
**Problem**: Parent component breaks after refactoring.
**Solution**: Keep the same external API (props interface).

### Pitfall 4: Missing error handling
**Problem**: New components don't handle edge cases.
**Solution**: Copy error handling logic from original component.

### Pitfall 5: Incomplete state management
**Problem**: State scattered across components.
**Solution**: Keep state in the Dialog (orchestrator) component.

---

## 🔄 Reusable Checklist

Use this for each refactoring session:

### Analysis Phase
- [ ] Identify large component (>500 lines)
- [ ] Count functions/sub-components
- [ ] Identify concerns (view, edit, logic)
- [ ] Estimate time (4-6 hours)

### Design Phase
- [ ] Sketch component architecture
- [ ] Define component responsibilities
- [ ] Plan data flow (props)
- [ ] Choose naming convention

### Implementation Phase
- [ ] Create BasicInfo component
- [ ] Create Config component
- [ ] Create Metadata component
- [ ] Create EditForm component
- [ ] Create Dialog component
- [ ] Create barrel export (index.ts)
- [ ] Update main page imports
- [ ] Remove old component

### Verification Phase
- [ ] Check file size reduction (30-40%)
- [ ] Run build, verify 0 new errors
- [ ] Verify JSX syntax is valid
- [ ] Check component usage unchanged
- [ ] Test in dev environment

### Documentation Phase
- [ ] Create refactor summary document
- [ ] Document component architecture
- [ ] List benefits and metrics
- [ ] Commit with descriptive message
- [ ] Push to remote

### Cleanup Phase
- [ ] Remove backup files
- [ ] Remove temp files
- [ ] Update related docs
- [ ] Close related issues

---

## 🎓 Lessons Learned

### From Knowledge Section Refactoring:

1. **Start with read-only components** - They're simpler and build confidence.

2. **EditForm should be separate** - Edit logic is complex enough to deserve its own component.

3. **Dialog orchestrates, doesn't render** - Keep the Dialog component focused on state and API, compose sub-components for rendering.

4. **Use barrel exports** - Makes imports clean: `import { X } from '@/features/section/components'`

5. **Don't change the external API** - Parent component usage should remain identical.

6. **Build errors might be pre-existing** - Not every error is caused by your refactoring.

7. **Document immediately** - Write the summary while the refactoring is fresh in your mind.

8. **Commit frequently** - Don't wait to commit all 5 components at once.

---

## 📚 Additional Resources

### Similar Patterns
- **Container/Presentational Pattern**: Dialog = Container, Sub-components = Presentational
- **Compound Components Pattern**: Dialog composes multiple related components
- **Composition over Inheritance**: Build complex UI from simple, reusable pieces

### Tools for Analysis
```bash
# Find large files
find . -name "*.tsx" -exec wc -l {} \; | sort -rn | head -20

# Find complex functions
grep -r "^function" --include="*.tsx" | awk '{print $2}' | sort | uniq -c | sort -rn

# Count JSX elements
grep -r "<[A-Z]" --include="*.tsx" | wc -l
```

---

## 🎯 Next Candidates for Refactoring

Based on the Knowledge Section success, these are good candidates:

1. **Admin Panel** - Likely has large user management components
2. **Settings Pages** - Often have monolithic form components
3. **Dashboard Pages** - Complex data visualization components
4. **Upload Components** - File upload with preview often gets complex
5. **Any component >500 lines** - Use the analysis tools above to find them

---

## ✅ Final Checklist for "Refactoring Complete"

Your refactoring is complete when you can answer "YES" to all:

- [ ] Original component reduced by 30-40%
- [ ] Created 5-7 modular components
- [ ] Each component is 50-200 lines
- [ ] ZERO new build errors
- [ ] Parent component usage unchanged
- [ ] All sub-components exported via index.ts
- [ ] Summary document created
- [ ] Changes committed with descriptive message
- [ ] Changes pushed to remote
- [ ] Tested in dev environment (optional)

---

**Playbook Version**: 1.0  
**Last Updated**: November 4, 2025  
**Based On**: Knowledge Section Refactoring (1,801 → 1,168 lines)  
**Success Rate**: 100% (1/1 refactorings)  
**Time per Refactoring**: 2-4 hours  
**ROI**: Immeasurable ✨

