# Sprint 2 Testing Checklist

## 🎯 Purpose
Validate that CapabilitiesTab, KnowledgeTab, and ToolsTab components work correctly after integration.

---

## ⚙️ Setup

```bash
# 1. Checkout Sprint 2 branch
git checkout refactor/agent-creator-sprint2

# 2. Install dependencies (if needed)
cd apps/digital-health-startup
npm install

# 3. Start dev server
npm run dev

# 4. Open browser
# Navigate to: http://localhost:3000
```

---

## ✅ Test Scenarios

### 🔹 Test 1: CapabilitiesTab

**Steps**:
1. Click "Create New Agent" button
2. Click "Capabilities" tab in the modal
3. Type "Custom Capability" in the input field
4. Press Enter or click the + button
5. Click a few predefined capability buttons
6. Verify selected capabilities appear below
7. Click X on a selected capability to remove it

**Expected Results**:
- [ ] Input field accepts text
- [ ] Custom capability is added to selected list
- [ ] Predefined buttons add capabilities
- [ ] Selected capabilities show with X button
- [ ] Clicking X removes the capability
- [ ] Predefined buttons disable when selected
- [ ] No console errors

**Screenshot Location**: `screenshots/sprint2-capabilities-tab.png`

---

### 🔹 Test 2: KnowledgeTab (RAG Section)

**Steps**:
1. Click "Knowledge" tab
2. Enable "Enable Knowledge Base Integration" checkbox
3. Type a URL in "Add Knowledge Source URL" input
4. Click + button to add URL
5. Click file upload area and select 1-2 PDF files
6. Verify files appear with size
7. Click X to remove a file
8. Click "Process Knowledge Sources into RAG" button
9. Observe status message

**Expected Results**:
- [ ] Checkbox enables RAG form
- [ ] URL can be added
- [ ] URL appears in list with X button
- [ ] Files can be uploaded
- [ ] Files show name and size (MB)
- [ ] Files can be removed
- [ ] Process button is clickable
- [ ] Status message appears (success/error/processing)
- [ ] No console errors

**Screenshot Location**: `screenshots/sprint2-knowledge-tab-rag.png`

---

### 🔹 Test 3: KnowledgeTab (Domains Section)

**Steps**:
1. Scroll down in Knowledge tab
2. View "Knowledge Domains Access" section
3. Click several knowledge domain buttons
4. Observe tier badges (T1, T2, T3)
5. Verify selected domains show checkmark
6. Click a selected domain to deselect
7. Check "Selected Knowledge Domains" badges below

**Expected Results**:
- [ ] Domain grid displays correctly
- [ ] Tier badges show different colors (T1=blue, T2=purple, T3=green)
- [ ] Clicking domain toggles selection
- [ ] Selected domains have checkmark and filled background
- [ ] Selected domains appear in badge list below
- [ ] Deselecting removes from badge list
- [ ] No console errors

**Screenshot Location**: `screenshots/sprint2-knowledge-tab-domains.png`

---

### 🔹 Test 4: ToolsTab

**Steps**:
1. Click "Tools" tab
2. View list of available tools
3. Click 3-4 different tools to select them
4. Observe status badges (Available, Coming Soon)
5. Check tool descriptions are visible
6. Verify selected tools count updates
7. Check selected tools badges at bottom
8. Click a selected tool to deselect

**Expected Results**:
- [ ] Tools list displays with descriptions
- [ ] Status badges show correctly (green "Available", amber "Coming Soon")
- [ ] Clicking tool toggles selection (checkmark + teal border)
- [ ] Selected tools count is accurate (e.g., "Selected Tools (3)")
- [ ] Selected tool badges appear at bottom
- [ ] Deselecting removes badge and checkmark
- [ ] Category badges display correctly
- [ ] Authentication indicators show (🔒) when needed
- [ ] No console errors

**Screenshot Location**: `screenshots/sprint2-tools-tab.png`

---

### 🔹 Test 5: Cross-Tab Navigation

**Steps**:
1. Start on "Capabilities" tab, add 2 capabilities
2. Switch to "Knowledge" tab, enable RAG, add 1 URL
3. Switch to "Tools" tab, select 2 tools
4. Switch back to "Capabilities" tab
5. Verify your 2 capabilities are still selected
6. Switch back to "Knowledge" tab
7. Verify your URL is still there
8. Switch back to "Tools" tab
9. Verify your 2 tools are still selected

**Expected Results**:
- [ ] Tab switching is smooth
- [ ] Form data persists across tabs
- [ ] No data loss when switching
- [ ] No console errors
- [ ] No performance issues
- [ ] All selections remain after navigation

---

### 🔹 Test 6: Save Agent

**Steps**:
1. Fill in "Basic Info" tab (name, description)
2. Add capabilities in "Capabilities" tab
3. Add knowledge sources in "Knowledge" tab
4. Select tools in "Tools" tab
5. Click "Save Agent" button
6. Wait for save confirmation
7. Close modal
8. Find the agent in the list
9. Click to edit the agent
10. Verify all your data is saved

**Expected Results**:
- [ ] Save button is clickable
- [ ] Save completes without errors
- [ ] Success message appears
- [ ] Agent appears in list
- [ ] All form data is persisted:
  - [ ] Capabilities saved
  - [ ] Knowledge URLs saved
  - [ ] Knowledge domains saved
  - [ ] Tools saved
- [ ] No console errors

---

### 🔹 Test 7: Edit Existing Agent

**Steps**:
1. Click to edit an existing agent
2. Navigate to "Capabilities" tab
3. Add/remove capabilities
4. Navigate to "Knowledge" tab
5. Add/remove knowledge sources
6. Navigate to "Tools" tab
7. Add/remove tools
8. Save changes
9. Re-open agent to verify

**Expected Results**:
- [ ] Existing agent loads correctly
- [ ] All tabs show existing data
- [ ] Can modify existing data
- [ ] Changes save successfully
- [ ] Updated data persists
- [ ] No console errors

---

### 🔹 Test 8: Loading States

**Steps**:
1. Open Agent Creator when knowledge domains are loading
2. Observe "Knowledge" tab loading states
3. Open when tools are loading
4. Observe "Tools" tab loading states

**Expected Results**:
- [ ] Loading indicators display correctly
- [ ] "(Loading...)" text appears when appropriate
- [ ] "Loading tools..." message shows in Tools tab
- [ ] Form fields disable during loading
- [ ] Data loads and displays correctly after loading
- [ ] No console errors

---

### 🔹 Test 9: Edge Cases

**Test 9.1: Empty States**
- [ ] Knowledge tab with no URLs added
- [ ] Knowledge tab with no files uploaded
- [ ] Knowledge tab with no domains selected
- [ ] Tools tab with no tools selected
- [ ] Capabilities tab with no capabilities added

**Test 9.2: Maximum Selections**
- [ ] Add 20+ capabilities
- [ ] Select 10+ knowledge domains
- [ ] Select all available tools

**Test 9.3: Invalid Input**
- [ ] Try adding empty capability (should not work)
- [ ] Try adding empty URL (should not work)

**Expected Results**:
- [ ] Empty states show appropriate messages ("No tools selected", etc.)
- [ ] Many selections display correctly (scrollable if needed)
- [ ] Invalid inputs are prevented or handled gracefully
- [ ] No console errors

---

### 🔹 Test 10: Responsive Design

**Steps**:
1. Test on desktop (large screen)
2. Test on tablet (medium screen)
3. Test on mobile (small screen)
4. Verify all 3 tabs are usable at each size

**Expected Results**:
- [ ] Desktop: All components display properly
- [ ] Tablet: Layout adapts correctly
- [ ] Mobile: Components are still usable
- [ ] Buttons and inputs are tappable
- [ ] No horizontal scrolling
- [ ] No overlapping elements

---

## 🐛 Bug Reporting Template

If you find any issues, use this template:

```markdown
**Bug Title**: [Brief description]

**Tab**: [CapabilitiesTab / KnowledgeTab / ToolsTab]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Console Errors**:
```
[Paste any console errors here]
```

**Screenshot**:
[Attach screenshot if applicable]

**Browser**: [Chrome / Firefox / Safari / Edge]
**OS**: [Windows / macOS / Linux]
```

---

## ✅ Final Checklist

Before approving PR:
- [ ] All 10 test scenarios pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Form submission works end-to-end
- [ ] Agent creation works
- [ ] Agent editing works
- [ ] All data persists correctly
- [ ] Performance is acceptable
- [ ] UI looks correct (no styling issues)
- [ ] Responsive design works

---

## 🎉 Sign-Off

**Tester Name**: _________________  
**Date**: _________________  
**Browser/OS**: _________________  
**Result**: [ ] PASS  [ ] FAIL (see bugs above)

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## 📸 Screenshots

Please capture screenshots of:
1. CapabilitiesTab with selected capabilities
2. KnowledgeTab RAG section with URLs and files
3. KnowledgeTab domains section with selections
4. ToolsTab with selected tools

Save to: `screenshots/sprint2-[tab-name].png`

---

**Happy Testing!** 🚀

