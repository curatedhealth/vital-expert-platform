# 🎯 FRONTEND REFACTORING PROJECT PLAN

**Project Name**: Frontend Code Quality Initiative  
**Start Date**: November 4, 2025  
**Duration**: 14 weeks (3.5 months)  
**Status**: 📋 PLANNING  

---

## 📊 PROJECT OVERVIEW

### Mission Statement
Transform the VITAL frontend from an unmaintainable, error-ridden codebase into a clean, modular, testable, and production-ready application.

### Success Criteria
- ✅ Build passes (0 TypeScript errors)
- ✅ Largest file <500 lines
- ✅ All backup files deleted
- ✅ All duplicates removed
- ✅ All disabled code removed
- ✅ 100% component testability
- ✅ Deploy to production

### Key Metrics

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **TypeScript Errors** | 2,730 | 0 | -100% |
| **Largest File** | 5,016 lines | <500 lines | -90% |
| **Files >1000 lines** | 41 | <5 | -87% |
| **Backup Files** | 799 | 0 | -100% |
| **Duplicate Pages** | 8 | 1 | -87% |
| **Disabled Dirs** | 13 | 0 | -100% |
| **Build Status** | ❌ Failing | ✅ Passing | ✅ |

---

## 🗓️ PROJECT PHASES & TIMELINE

```
Week 1:  Phase 1 - Emergency Cleanup ⚡
Week 2:  Phase 2.1 - Agent Creator Refactoring (Part 1) 🔥
Week 3:  Phase 2.2 - Agent Creator Refactoring (Part 2) 🔥
Week 4:  Phase 2.3 - Ask Expert Refactoring 🔥
Week 5:  Phase 2.4 - Chat Page Refactoring 🔥
Week 6:  Phase 3.1 - Service Layer (Part 1) 🔧
Week 7:  Phase 3.2 - Service Layer (Part 2) 🔧
Week 8:  Phase 3.3 - Service Layer Testing & Validation 🔧
Week 9:  Phase 4.1 - Component Refactoring (Batch 1) 🏗️
Week 10: Phase 4.2 - Component Refactoring (Batch 2) 🏗️
Week 11: Phase 4.3 - Component Refactoring (Batch 3) 🏗️
Week 12: Phase 4.4 - Component Refactoring (Batch 4) 🏗️
Week 13: Phase 5.1 - TypeScript Error Fixing 🐛
Week 14: Phase 5.2 - Final Testing & Deployment 🚀
```

---

## 📋 PHASE 1: EMERGENCY CLEANUP (Week 1)

**Duration**: 3.5 hours  
**Priority**: 🔴 CRITICAL  
**Risk**: 🟢 LOW  
**Impact**: 🟢 HIGH  

### Goals
- Remove all technical debt that doesn't require refactoring
- Clean repository for faster searches and better DX
- Create clean baseline for refactoring work

### Tasks

#### Task 1.1: Delete Backup Files ✅
**Time**: 30 minutes  
**Owner**: TBD  
**Branch**: `cleanup/delete-backup-files`

**Steps**:
1. Create git branch
   ```bash
   git checkout -b cleanup/delete-backup-files
   ```

2. Verify backup files count
   ```bash
   find src -name "*.bak.tmp" | wc -l  # Should show 799
   ```

3. Create backup list for reference
   ```bash
   find src -name "*.bak.tmp" > /tmp/deleted-backups.txt
   ```

4. Delete all backup files
   ```bash
   find src -name "*.bak.tmp" -delete
   ```

5. Verify deletion
   ```bash
   find src -name "*.bak.tmp" | wc -l  # Should show 0
   ```

6. Commit and push
   ```bash
   git add -A
   git commit -m "cleanup: Delete 799 backup files (.bak.tmp)
   
   Remove all .bak.tmp files from repository.
   These were created as manual backups instead of using git branches.
   
   Impact:
   - Files deleted: 799
   - Disk space saved: ~50-100MB
   - Faster searches
   - Cleaner codebase
   
   Files deleted saved to: /tmp/deleted-backups.txt"
   
   git push origin cleanup/delete-backup-files
   ```

7. Create Pull Request
8. Review and merge

**Deliverables**:
- ✅ 799 backup files deleted
- ✅ Commit with deletion summary
- ✅ PR merged

**Success Criteria**:
- `find src -name "*.bak.tmp" | wc -l` returns 0
- Build still passes (or fails with same errors)
- No functionality broken

---

#### Task 1.2: Delete Duplicate Pages ✅
**Time**: 1 hour  
**Owner**: TBD  
**Branch**: `cleanup/delete-duplicate-pages`

**Steps**:
1. Create git branch
   ```bash
   git checkout -b cleanup/delete-duplicate-pages
   ```

2. Audit current ask-expert pages
   ```bash
   ls -lh src/app/\(app\)/ask-expert/*.tsx
   ```

3. Verify page.tsx is the current version
   - Check imports in other files
   - Check navigation links
   - Verify it's the production version

4. Delete 7 duplicate versions
   ```bash
   cd src/app/\(app\)/ask-expert
   rm page-gold-standard.tsx
   rm page-backup-before-gold.tsx
   rm page-backup-5mode.tsx
   rm page-complete.tsx
   rm page-enhanced.tsx
   rm page-legacy-single-agent.tsx
   rm page-modern.tsx
   ```

5. Delete duplicate directory
   ```bash
   rm -rf src/app/\(app\)/ask-expert-copy/
   ```

6. Update any references (if found)
   ```bash
   grep -r "ask-expert-copy" src/
   grep -r "page-gold-standard" src/
   # Fix any imports if found
   ```

7. Test that ask-expert page still works
   ```bash
   npm run dev
   # Navigate to /ask-expert
   # Verify functionality
   ```

8. Commit and push
   ```bash
   git add -A
   git commit -m "cleanup: Delete 8 duplicate ask-expert page versions
   
   Remove duplicate and backup versions of ask-expert page.
   Keep only the current production version (page.tsx).
   
   Deleted files:
   - page-gold-standard.tsx (99KB)
   - page-backup-before-gold.tsx (93KB)
   - page-backup-5mode.tsx (22KB)
   - page-complete.tsx (21KB)
   - page-enhanced.tsx (21KB)
   - page-legacy-single-agent.tsx (16KB)
   - page-modern.tsx (24KB)
   - ask-expert-copy/ directory (1,092 lines)
   
   Impact:
   - Lines removed: ~8,000
   - Disk space saved: ~300KB
   - Clearer codebase
   - Single source of truth"
   
   git push origin cleanup/delete-duplicate-pages
   ```

9. Create Pull Request
10. Review and merge

**Deliverables**:
- ✅ 7 duplicate files deleted
- ✅ 1 duplicate directory deleted
- ✅ Ask-expert page still functional
- ✅ Commit with deletion summary
- ✅ PR merged

**Success Criteria**:
- Only `page.tsx` exists in `ask-expert/` directory
- `/ask-expert` route still works
- No broken imports

---

#### Task 1.3: Delete Disabled Features ✅
**Time**: 2 hours  
**Owner**: TBD  
**Branch**: `cleanup/delete-disabled-features`

**Steps**:
1. Create git branch
   ```bash
   git checkout -b cleanup/delete-disabled-features
   ```

2. Audit disabled directories
   ```bash
   find src -name "*.disabled" -type d
   ```

3. Check for references to disabled code
   ```bash
   # For each disabled directory, check if it's imported
   grep -r "clinical.disabled" src --exclude-dir="*.disabled"
   grep -r "branching.disabled" src --exclude-dir="*.disabled"
   grep -r "collaboration.disabled" src --exclude-dir="*.disabled"
   grep -r "learning-management.disabled" src --exclude-dir="*.disabled"
   grep -r "industry-templates.disabled" src --exclude-dir="*.disabled"
   grep -r "integration-marketplace.disabled" src --exclude-dir="*.disabled"
   grep -r "dtx.disabled" src --exclude-dir="*.disabled"
   grep -r "response.disabled" src --exclude-dir="*.disabled"
   grep -r "autonomous.disabled" src --exclude-dir="*.disabled"
   grep -r "artifacts.disabled" src --exclude-dir="*.disabled"
   grep -r "collaboration.disabled" src --exclude-dir="*.disabled"
   grep -r "agents.disabled" src --exclude-dir="*.disabled"
   grep -r "message.disabled" src --exclude-dir="*.disabled"
   ```

4. Document directory sizes before deletion
   ```bash
   du -sh src/features/*.disabled
   du -sh src/components/chat/*.disabled
   du -sh src/dtx.disabled
   ```

5. Delete disabled directories (if no references found)
   ```bash
   rm -rf src/features/branching.disabled
   rm -rf src/features/collaboration.disabled
   rm -rf src/features/learning-management.disabled
   rm -rf src/features/industry-templates.disabled
   rm -rf src/features/integration-marketplace.disabled
   rm -rf src/features/clinical.disabled
   rm -rf src/dtx.disabled
   rm -rf src/components/chat/response.disabled
   rm -rf src/components/chat/autonomous.disabled
   rm -rf src/components/chat/artifacts.disabled
   rm -rf src/components/chat/collaboration.disabled
   rm -rf src/components/chat/agents.disabled
   rm -rf src/components/chat/message.disabled
   ```

6. Verify build still works
   ```bash
   npm run build
   ```

7. Commit and push
   ```bash
   git add -A
   git commit -m "cleanup: Delete 13 disabled feature directories
   
   Remove disabled features that are not in use.
   These should be deleted, not disabled, to reduce confusion.
   Code can be recovered from git history if needed.
   
   Deleted directories:
   - features/clinical.disabled (~5,000 lines)
   - features/collaboration.disabled (~800 lines)
   - features/branching.disabled (~500 lines)
   - features/learning-management.disabled (~600 lines)
   - features/industry-templates.disabled (~400 lines)
   - features/integration-marketplace.disabled (~700 lines)
   - dtx.disabled (~300 lines)
   - components/chat/response.disabled (~200 lines)
   - components/chat/autonomous.disabled (~400 lines)
   - components/chat/artifacts.disabled (~300 lines)
   - components/chat/collaboration.disabled (~200 lines)
   - components/chat/agents.disabled (~300 lines)
   - components/chat/message.disabled (~250 lines)
   
   Impact:
   - Lines removed: ~10,000
   - Directories removed: 13
   - Cleaner repository
   - Faster searches
   - Less confusion
   
   Note: All code recoverable from git history if needed."
   
   git push origin cleanup/delete-disabled-features
   ```

8. Create Pull Request
9. Review and merge

**Deliverables**:
- ✅ 13 disabled directories deleted
- ✅ No broken references
- ✅ Build still works
- ✅ Commit with deletion summary
- ✅ PR merged

**Success Criteria**:
- `find src -name "*.disabled" -type d` returns 0
- Build passes (or fails with same errors)
- No functionality broken

---

### Phase 1 Summary

**Total Time**: 3.5 hours  
**Total Commits**: 3  
**Total PRs**: 3  

**Impact**:
- ✅ 799 backup files deleted
- ✅ 8 duplicate pages deleted
- ✅ 13 disabled directories deleted
- ✅ ~18,000 lines removed
- ✅ ~50-100MB disk space saved
- ✅ Cleaner, faster repository

**Success Metrics**:
- Backup files: 799 → 0 ✅
- Duplicate pages: 8 → 1 ✅
- Disabled dirs: 13 → 0 ✅
- Build status: Same as before (no regressions)

**Checkpoint**: Before proceeding to Phase 2, verify:
- [ ] All 3 PRs merged
- [ ] Build status unchanged
- [ ] No functionality broken
- [ ] Team informed of changes

---

## 📋 PHASE 2: CRITICAL COMPONENT REFACTORING (Weeks 2-5)

**Duration**: 30-40 hours (4 weeks)  
**Priority**: 🔴 CRITICAL  
**Risk**: 🟡 MEDIUM  
**Impact**: 🟢 VERY HIGH  

### Phase 2 Overview

| Sprint | Target File | Lines | Duration | Week |
|--------|-------------|-------|----------|------|
| 2.1 | agent-creator.tsx (Part 1) | 5,016 | 8-10h | Week 2 |
| 2.2 | agent-creator.tsx (Part 2) | 5,016 | 8-10h | Week 3 |
| 2.3 | ask-expert/page.tsx | 2,336 | 8-12h | Week 4 |
| 2.4 | chat/page.tsx | 1,323 | 6-8h | Week 5 |

---

### Sprint 2.1: Agent Creator Refactoring (Part 1) 🔥

**Duration**: 8-10 hours  
**Week**: 2  
**Owner**: TBD  
**Branch**: `refactor/agent-creator-part1`

**Current State**:
- File: `src/features/chat/components/agent-creator.tsx`
- Lines: 5,016
- Components: 1 massive function
- Status: 🔴 MONSTER

**Target State**:
- Files: 8-10 modular components (Part 1)
- Lines: ~2,500 (Part 1)
- Components: Focused, testable
- Status: ✅ Refactored (50%)

#### Step 1: Analysis (1 hour)

**Tasks**:
1. Read entire `agent-creator.tsx` file
2. Identify logical boundaries
3. Map out state dependencies
4. Create component hierarchy diagram
5. Document all props interfaces

**Deliverables**:
- [ ] Component hierarchy diagram (ASCII or Mermaid)
- [ ] State dependency map
- [ ] Props interface documentation
- [ ] Refactoring strategy document

**Commands**:
```bash
# Count state variables
grep "const \[" src/features/chat/components/agent-creator.tsx | wc -l

# Count sub-functions
grep "const.*= (" src/features/chat/components/agent-creator.tsx | wc -l

# Identify sections
grep -n "// ===" src/features/chat/components/agent-creator.tsx
```

---

#### Step 2: Create Directory Structure (15 min)

**Tasks**:
1. Create new directory for modular components
2. Set up barrel export file

**Commands**:
```bash
mkdir -p src/features/agents/components/agent-creator
touch src/features/agents/components/agent-creator/index.ts
```

---

#### Step 3: Extract Basic Components (6-8 hours)

**Components to create** (in order of simplicity):

##### 3.1: AgentCreatorHeader.tsx (30 min)
```typescript
/**
 * Agent Creator Header Component
 * Displays title, close button, and main navigation
 */

interface AgentCreatorHeaderProps {
  isEditing: boolean;
  onClose: () => void;
  agentName?: string;
}

export function AgentCreatorHeader({ isEditing, onClose, agentName }: AgentCreatorHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h2>{isEditing ? `Edit ${agentName}` : 'Create New Agent'}</h2>
      <Button variant="ghost" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

**Deliverables**:
- [ ] File created: `AgentCreatorHeader.tsx`
- [ ] Component exported in `index.ts`
- [ ] Basic tests written
- [ ] Storybook story created (optional)

---

##### 3.2: AgentBasicInfoForm.tsx (1 hour)
```typescript
/**
 * Agent Basic Info Form Component
 * Name, description, avatar selection
 */

interface AgentBasicInfoFormProps {
  formData: {
    name: string;
    description: string;
    avatar: string;
  };
  onChange: (updates: Partial<AgentBasicInfoFormProps['formData']>) => void;
}

export function AgentBasicInfoForm({ formData, onChange }: AgentBasicInfoFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Agent Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>
      {/* Avatar selection */}
    </div>
  );
}
```

**Deliverables**:
- [ ] File created: `AgentBasicInfoForm.tsx`
- [ ] Component exported in `index.ts`
- [ ] Form validation added
- [ ] Basic tests written

---

##### 3.3: AgentCapabilitiesSelector.tsx (1-1.5 hours)
```typescript
/**
 * Agent Capabilities Selector Component
 * Multi-select for agent capabilities
 */

interface AgentCapabilitiesSelectorProps {
  selected: string[];
  available: string[];
  onChange: (capabilities: string[]) => void;
}

export function AgentCapabilitiesSelector({
  selected,
  available,
  onChange
}: AgentCapabilitiesSelectorProps) {
  return (
    <div className="space-y-4">
      <Label>Capabilities</Label>
      <div className="flex flex-wrap gap-2">
        {available.map((cap) => (
          <Badge
            key={cap}
            variant={selected.includes(cap) ? 'default' : 'outline'}
            onClick={() => {
              const newSelected = selected.includes(cap)
                ? selected.filter((c) => c !== cap)
                : [...selected, cap];
              onChange(newSelected);
            }}
          >
            {cap}
          </Badge>
        ))}
      </div>
    </div>
  );
}
```

**Deliverables**:
- [ ] File created: `AgentCapabilitiesSelector.tsx`
- [ ] Component exported in `index.ts`
- [ ] Multi-select logic implemented
- [ ] Basic tests written

---

##### 3.4: AgentToolsSelector.tsx (1-1.5 hours)
Similar structure to capabilities selector, but for tools.

**Deliverables**:
- [ ] File created: `AgentToolsSelector.tsx`
- [ ] Component exported in `index.ts`
- [ ] Tool selection logic implemented
- [ ] Basic tests written

---

##### 3.5: AgentModelSelector.tsx (1 hour)
Model selection dropdown with descriptions.

**Deliverables**:
- [ ] File created: `AgentModelSelector.tsx`
- [ ] Component exported in `index.ts`
- [ ] Model selection implemented
- [ ] Basic tests written

---

##### 3.6: AgentPromptEditor.tsx (1.5-2 hours)
Large textarea for system prompt editing.

**Deliverables**:
- [ ] File created: `AgentPromptEditor.tsx`
- [ ] Component exported in `index.ts`
- [ ] Prompt generation button implemented
- [ ] Basic tests written

---

##### 3.7: AgentPreviewCard.tsx (1 hour)
Preview of how agent will look.

**Deliverables**:
- [ ] File created: `AgentPreviewCard.tsx`
- [ ] Component exported in `index.ts`
- [ ] Live preview implemented
- [ ] Basic tests written

---

##### 3.8: AgentSaveActions.tsx (30 min)
Save, cancel, delete buttons.

**Deliverables**:
- [ ] File created: `AgentSaveActions.tsx`
- [ ] Component exported in `index.ts`
- [ ] Button actions wired up
- [ ] Basic tests written

---

#### Step 4: Create Main Dialog (Part 1) (1-2 hours)

**File**: `AgentCreatorDialog.tsx` (Part 1 - Simple orchestration)

```typescript
/**
 * Agent Creator Dialog Component (Part 1)
 * Main orchestrator for agent creation
 */

export function AgentCreatorDialog({ isOpen, onClose, onSave, editingAgent }: AgentCreatorProps) {
  const [formData, setFormData] = useState({
    name: editingAgent?.name || '',
    description: editingAgent?.description || '',
    capabilities: editingAgent?.capabilities || [],
    tools: editingAgent?.tools || [],
    model: editingAgent?.model || 'gpt-4',
    prompt: editingAgent?.systemPrompt || '',
    // ... more state
  });

  const handleFormChange = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    // API call to save
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AgentCreatorHeader
          isEditing={!!editingAgent}
          onClose={onClose}
          agentName={formData.name}
        />

        <div className="space-y-6 p-6">
          <AgentBasicInfoForm
            formData={{ name: formData.name, description: formData.description, avatar: formData.avatar }}
            onChange={handleFormChange}
          />

          <AgentCapabilitiesSelector
            selected={formData.capabilities}
            available={predefinedCapabilities}
            onChange={(capabilities) => handleFormChange({ capabilities })}
          />

          <AgentToolsSelector
            selected={formData.tools}
            available={availableTools}
            onChange={(tools) => handleFormChange({ tools })}
          />

          <AgentModelSelector
            selected={formData.model}
            options={modelOptions}
            onChange={(model) => handleFormChange({ model })}
          />

          <AgentPromptEditor
            value={formData.prompt}
            onChange={(prompt) => handleFormChange({ prompt })}
            onGenerate={() => {/* Generate prompt logic */}}
          />

          <AgentPreviewCard data={formData} />
        </div>

        <AgentSaveActions
          onSave={handleSave}
          onCancel={onClose}
          isEditing={!!editingAgent}
          canSave={!!formData.name}
        />
      </DialogContent>
    </Dialog>
  );
}
```

**Deliverables**:
- [ ] File created: `AgentCreatorDialog.tsx`
- [ ] All sub-components composed
- [ ] State management working
- [ ] API calls implemented
- [ ] Error handling added

---

#### Step 5: Update Main Page Import (30 min)

**File**: `src/features/chat/components/agent-creator.tsx`

**Changes**:
1. Delete entire 5,016-line component
2. Add simple import

```typescript
// OLD: 5,016 lines
// export function AgentCreator({ ... }) {
//   ... 5,016 lines ...
// }

// NEW: 1 line
export { AgentCreatorDialog as AgentCreator } from '@/features/agents/components/agent-creator';
```

**Deliverables**:
- [ ] Old component deleted
- [ ] New import added
- [ ] Usage unchanged (same props interface)
- [ ] Build passes
- [ ] Functionality tested

---

#### Step 6: Testing & Validation (1 hour)

**Tasks**:
1. Run build
2. Test agent creation flow
3. Test agent editing flow
4. Test all form fields
5. Test save/cancel/delete
6. Check console for errors
7. Verify no regressions

**Commands**:
```bash
npm run build
npm run dev
# Manual testing in browser
```

**Deliverables**:
- [ ] Build passes
- [ ] All functionality works
- [ ] No console errors
- [ ] No regressions

---

#### Step 7: Documentation & Commit (30 min)

**Tasks**:
1. Create component documentation
2. Update README if needed
3. Commit changes
4. Push branch
5. Create PR

**Commit Message Template**:
```
refactor: Break down agent-creator.tsx (Part 1) - Basic Components 🏗️

PHASE 2.1 COMPLETE - AGENT CREATOR REFACTORING (PART 1)

Created 8 modular components from 5,016-line monster:
✅ AgentCreatorHeader.tsx (~50 lines)
✅ AgentBasicInfoForm.tsx (~150 lines)
✅ AgentCapabilitiesSelector.tsx (~120 lines)
✅ AgentToolsSelector.tsx (~120 lines)
✅ AgentModelSelector.tsx (~100 lines)
✅ AgentPromptEditor.tsx (~180 lines)
✅ AgentPreviewCard.tsx (~100 lines)
✅ AgentSaveActions.tsx (~80 lines)

Structure:
src/features/agents/components/agent-creator/
├── index.ts (barrel exports)
├── AgentCreatorHeader.tsx
├── AgentBasicInfoForm.tsx
├── AgentCapabilitiesSelector.tsx
├── AgentToolsSelector.tsx
├── AgentModelSelector.tsx
├── AgentPromptEditor.tsx
├── AgentPreviewCard.tsx
└── AgentSaveActions.tsx

Progress:
- Original: 5,016 lines
- Part 1: ~900 lines (8 components)
- Remaining: ~4,100 lines (Part 2 next week)

Benefits:
✅ Modular components
✅ Each component <200 lines
✅ Testable in isolation
✅ Easier to maintain
✅ No breaking changes

Next: Part 2 (Business function, department, role selectors)
```

**Deliverables**:
- [ ] Documentation created
- [ ] Commit pushed
- [ ] PR created
- [ ] PR description detailed

---

### Sprint 2.1 Summary

**Time**: 8-10 hours  
**Files Created**: 8  
**Lines**: ~900 (from 5,016)  
**Progress**: 50% of agent-creator refactored  

**Deliverables**:
- ✅ 8 modular components created
- ✅ Main dialog orchestrator updated
- ✅ All functionality preserved
- ✅ Build passes
- ✅ Tests written
- ✅ PR ready for review

**Success Criteria**:
- [ ] Build passes
- [ ] Agent creation works
- [ ] Agent editing works
- [ ] No regressions
- [ ] Each component <200 lines
- [ ] PR approved and merged

---

### Sprint 2.2: Agent Creator Refactoring (Part 2) 🔥

**Duration**: 8-10 hours  
**Week**: 3  
**Owner**: TBD  
**Branch**: `refactor/agent-creator-part2`

**Target**: Complete the remaining ~4,100 lines

**Components to create**:
1. AgentBusinessFunctionSelector.tsx
2. AgentDepartmentSelector.tsx
3. AgentRoleSelector.tsx
4. AgentKnowledgeDomainSelector.tsx
5. AgentTestingPanel.tsx
6. AgentAdvancedSettings.tsx
7. Update AgentCreatorDialog.tsx (add Part 2 components)

**Similar structure to Part 1** - detailed steps will follow same pattern.

---

### Sprint 2.3: Ask Expert Refactoring 🔥

**Duration**: 8-12 hours  
**Week**: 4  
**Owner**: TBD  
**Branch**: `refactor/ask-expert-page`

**Target**: `src/app/(app)/ask-expert/page.tsx` (2,336 lines)

**Components to create** (estimated):
1. AskExpertHeader.tsx
2. AgentPanelSelector.tsx
3. ModeSelector.tsx
4. MessageDisplay.tsx
5. MessageInput.tsx
6. CitationDisplay.tsx
7. ToolUsageDisplay.tsx
8. AskExpertPage.tsx (orchestrator)

**Success Criteria**:
- 2,336 → ~1,400 lines (-40%)
- 6-8 modular components
- All functionality preserved

---

### Sprint 2.4: Chat Page Refactoring 🔥

**Duration**: 6-8 hours  
**Week**: 5  
**Owner**: TBD  
**Branch**: `refactor/chat-page`

**Target**: `src/app/(app)/chat/page.tsx` (1,323 lines)

**Components to create** (estimated):
1. ChatHeader.tsx
2. ChatSidebar.tsx
3. ChatMessagesContainer.tsx
4. ChatInput.tsx
5. ChatAgentSelector.tsx
6. ChatModeSelector.tsx
7. ChatPage.tsx (orchestrator)

**Success Criteria**:
- 1,323 → ~800 lines (-40%)
- 7-8 modular components
- All functionality preserved

---

## 📋 TRACKING & PROGRESS

### Progress Dashboard

**Create this as a living document** (e.g., `REFACTORING_PROGRESS.md`)

```markdown
# Refactoring Progress Dashboard

Last Updated: [DATE]

## Overall Progress

[████████░░░░░░░░░░░░] 35% Complete

- Phase 1: ✅ COMPLETE
- Phase 2: ⏳ IN PROGRESS (35%)
- Phase 3: ⏳ NOT STARTED
- Phase 4: ⏳ NOT STARTED
- Phase 5: ⏳ NOT STARTED

## Current Sprint

**Sprint 2.1: Agent Creator Part 1**
- Status: ⏳ IN PROGRESS
- Progress: [████░░░░░░] 40%
- Completed: 3/8 components
- Remaining: 5/8 components
- On Track: ✅ YES

## Detailed Status

### Phase 1: Emergency Cleanup ✅
- [x] Task 1.1: Delete backup files (30min) ✅
- [x] Task 1.2: Delete duplicates (1h) ✅
- [x] Task 1.3: Delete disabled dirs (2h) ✅

### Phase 2: Critical Refactoring ⏳
- [x] Sprint 2.1: Agent Creator Part 1 ✅
- [ ] Sprint 2.2: Agent Creator Part 2 ⏳
- [ ] Sprint 2.3: Ask Expert Page
- [ ] Sprint 2.4: Chat Page

### Phase 3: Service Refactoring
- [ ] Sprint 3.1: Orchestrators
- [ ] Sprint 3.2: RAG Services
- [ ] Sprint 3.3: Testing

### Phase 4: Component Refactoring
- [ ] Batch 1: 3 components
- [ ] Batch 2: 3 components
- [ ] Batch 3: 2 components
- [ ] Batch 4: 2 components

### Phase 5: Error Fixing
- [ ] Sprint 5.1: TS Errors
- [ ] Sprint 5.2: Testing & Deploy

## Metrics

| Metric | Start | Current | Target | Progress |
|--------|-------|---------|--------|----------|
| TS Errors | 2,730 | 2,730 | 0 | 0% |
| Largest File | 5,016 | 5,016 | <500 | 0% |
| Files >1K | 41 | 41 | <5 | 0% |
| Backups | 799 | 0 | 0 | ✅ 100% |
| Duplicates | 8 | 1 | 1 | ✅ 100% |
| Disabled | 13 | 0 | 0 | ✅ 100% |

## Blockers

No current blockers.

## Notes

- Phase 1 completed ahead of schedule
- Team velocity: 8-10h/week
- Next checkpoint: End of Week 3
```

---

### Weekly Checklist Template

```markdown
# Week [N] Checklist

## Goals
- [ ] Complete Sprint X.Y
- [ ] Address any blockers
- [ ] Update progress dashboard
- [ ] Team sync meeting

## Daily Tasks

### Monday
- [ ] Start Sprint X.Y
- [ ] Complete analysis phase
- [ ] Create component 1

### Tuesday
- [ ] Complete components 2-3
- [ ] Write unit tests

### Wednesday
- [ ] Complete components 4-5
- [ ] Integration testing

### Thursday
- [ ] Complete remaining components
- [ ] Update main orchestrator
- [ ] Build & test

### Friday
- [ ] Documentation
- [ ] Commit & PR
- [ ] Team review
- [ ] Update progress dashboard

## Completed
- [x] Task 1
- [x] Task 2

## Notes
- Issue encountered: [description]
- Solution: [description]
```

---

## 🎯 NEXT STEPS

### Immediate (Today)
1. ✅ Review this project plan
2. ⏳ Get team buy-in
3. ⏳ Assign owners for each sprint
4. ⏳ Set up project board (GitHub Projects, Jira, etc.)
5. ⏳ Create `REFACTORING_PROGRESS.md` file
6. ⏳ Schedule kickoff meeting

### This Week (Week 1)
1. ⏳ Execute Phase 1 (all 3 tasks)
2. ⏳ Daily standups (15 min)
3. ⏳ Update progress dashboard daily
4. ⏳ Friday: Week 1 retrospective

### Week 2
1. ⏳ Start Sprint 2.1 (Agent Creator Part 1)
2. ⏳ Follow daily checklist
3. ⏳ Friday: Sprint 2.1 review

---

## 📊 SUCCESS METRICS

### Weekly Check-ins

Every Friday, assess:
- [ ] Sprint completed on time?
- [ ] All tests passing?
- [ ] PR merged?
- [ ] Team velocity on track?
- [ ] Any blockers?

### Monthly Milestones

**End of Month 1** (Week 4):
- ✅ Phase 1 complete
- ✅ Phase 2 complete (50%+ of critical files)
- 📈 TS errors: 2,730 → <2,000
- 📈 Largest file: 5,016 → <3,000

**End of Month 2** (Week 8):
- ✅ Phase 2 complete (100%)
- ✅ Phase 3 complete
- 📈 TS errors: <2,000 → <1,000
- 📈 Largest file: <3,000 → <1,000

**End of Month 3** (Week 12):
- ✅ Phase 4 complete
- 📈 TS errors: <1,000 → <500
- 📈 Largest file: <1,000 → <500

**End of Month 3.5** (Week 14):
- ✅ Phase 5 complete
- ✅ All metrics hit
- 🚀 DEPLOY TO PRODUCTION

---

## ✅ PROJECT COMPLETION CRITERIA

The project is complete when ALL of these are true:

- [ ] TypeScript errors: 0
- [ ] Largest file: <500 lines
- [ ] Files >1000 lines: <5
- [ ] Backup files: 0
- [ ] Duplicate pages: 1 (only current)
- [ ] Disabled directories: 0
- [ ] Build passes: ✅
- [ ] All tests pass: ✅
- [ ] All PRs merged: ✅
- [ ] Documentation updated: ✅
- [ ] Deployed to production: ✅
- [ ] Team trained on new structure: ✅

---

**Project Plan Status**: ✅ **COMPLETE & READY**  
**Next Action**: **GET TEAM BUY-IN & START PHASE 1**  
**Estimated Completion**: **February 2026** (14 weeks)

