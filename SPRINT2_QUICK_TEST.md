# 🧪 Sprint 2 Quick Testing Guide

## ⚡ Quick Start (5-10 minutes)

The dev server is running. Open your browser and follow these steps:

---

## 🌐 Step 1: Open the Application

**URL**: http://localhost:3000

Wait for the page to load completely.

---

## 🎯 Step 2: Open Agent Creator

1. Navigate to the chat interface
2. Look for **"Create New Agent"** button
3. Click it to open the Agent Creator modal

**Expected**: Modal opens with multiple tabs visible

---

## ✅ Step 3: Test CapabilitiesTab (2 minutes)

### Click "Capabilities" Tab

**Test 1: Add Custom Capability**
- [ ] Type "Patient Education" in the input
- [ ] Press Enter or click the + button
- [ ] ✅ "Patient Education" appears in "Selected Capabilities"

**Test 2: Add Predefined Capability**
- [ ] Click "Regulatory Guidance" button
- [ ] ✅ It appears in "Selected Capabilities"
- [ ] ✅ Button becomes disabled/grayed out

**Test 3: Remove Capability**
- [ ] Click the X on "Patient Education"
- [ ] ✅ It disappears from the list

**Result**: 
- ✅ PASS - All capability features work
- ❌ FAIL - Note any issues in browser console

---

## ✅ Step 4: Test KnowledgeTab (3 minutes)

### Click "Knowledge" Tab

**Test 1: Enable RAG**
- [ ] Check the "Enable Knowledge Base Integration" checkbox
- [ ] ✅ Form fields appear below

**Test 2: Add Knowledge URL**
- [ ] Type "https://example.com/docs" in URL input
- [ ] Click the + button
- [ ] ✅ URL appears in the list with X button

**Test 3: File Upload (Optional)**
- [ ] Click the file upload area
- [ ] Select a file (any file for testing)
- [ ] ✅ File appears with name and size

**Test 4: Knowledge Domains**
- [ ] Scroll down to "Knowledge Domains Access"
- [ ] Click 2-3 knowledge domain buttons
- [ ] ✅ Selected domains show checkmark
- [ ] ✅ Tier badges display (T1, T2, T3)
- [ ] ✅ Selected domains appear in badges below

**Result**: 
- ✅ PASS - All knowledge features work
- ❌ FAIL - Note any issues

---

## ✅ Step 5: Test ToolsTab (2 minutes)

### Click "Tools" Tab

**Test 1: View Available Tools**
- [ ] ✅ Tools list displays
- [ ] ✅ Tool descriptions are visible
- [ ] ✅ Status badges show (Available, Coming Soon)

**Test 2: Select Tools**
- [ ] Click 2-3 different tools
- [ ] ✅ Selected tools show checkmark and teal border
- [ ] ✅ "Selected Tools (X)" count updates

**Test 3: Deselect Tool**
- [ ] Click a selected tool again
- [ ] ✅ Checkmark and border disappear
- [ ] ✅ Count decreases

**Result**: 
- ✅ PASS - All tool features work
- ❌ FAIL - Note any issues

---

## ✅ Step 6: Cross-Tab Test (1 minute)

**Test Data Persistence**
- [ ] Go to "Capabilities" tab - verify your capabilities are still there
- [ ] Go to "Knowledge" tab - verify your URL is still there
- [ ] Go to "Tools" tab - verify your tools are still selected

**Expected**: 
- ✅ All data persists when switching tabs
- ✅ No console errors

---

## ✅ Step 7: Check Browser Console

### Open Developer Tools
- **Chrome/Edge**: F12 or Cmd+Option+I (Mac)
- **Firefox**: F12 or Cmd+Option+K (Mac)
- **Safari**: Cmd+Option+C (Mac)

### Look for Errors
- [ ] ✅ No red errors in console
- [ ] ✅ No TypeScript errors
- [ ] ✅ No missing module warnings

**Common errors to check**:
- ❌ "Cannot find module" - import issue
- ❌ "undefined is not a function" - missing prop
- ❌ "Failed to compile" - TypeScript error

---

## 🎯 Critical Success Criteria

For Sprint 2 to pass, all these must be true:

1. ✅ **CapabilitiesTab renders** and you can add/remove capabilities
2. ✅ **KnowledgeTab renders** and you can enable RAG, add URLs
3. ✅ **ToolsTab renders** and you can select/deselect tools
4. ✅ **Data persists** when switching between tabs
5. ✅ **Zero console errors** (warnings are okay)
6. ✅ **UI looks correct** (no broken styling)

---

## 📸 Quick Visual Check

All 3 tabs should look like this:

### CapabilitiesTab
```
┌─────────────────────────────────────┐
│ Capabilities                        │
├─────────────────────────────────────┤
│ Add Capability    [input] [+]      │
│                                     │
│ Predefined Capabilities             │
│ [Regulatory] [Clinical] [Research]  │
│                                     │
│ Selected Capabilities               │
│ [Regulatory X] [Clinical X]         │
└─────────────────────────────────────┘
```

### KnowledgeTab
```
┌─────────────────────────────────────┐
│ Knowledge Base (RAG)                │
├─────────────────────────────────────┤
│ ☑ Enable Knowledge Base Integration│
│                                     │
│ Add Knowledge Source URL            │
│ [https://example.com/docs] [+]      │
│                                     │
│ Upload Files                        │
│ [Drag & Drop Area]                  │
│                                     │
│ Knowledge Domains Access            │
│ [Cardiology T1] [Oncology T2] ...   │
└─────────────────────────────────────┘
```

### ToolsTab
```
┌─────────────────────────────────────┐
│ Tools & Integrations                │
├─────────────────────────────────────┤
│ Available Tools                     │
│                                     │
│ ☑ Web Search                        │
│   Search the internet [Available]   │
│                                     │
│ ☐ PubMed Search                     │
│   Medical research [Available]      │
│                                     │
│ Selected Tools (1)                  │
│ [Web Search]                        │
└─────────────────────────────────────┘
```

---

## 🚨 If You Find Issues

### Browser Console Errors?
1. Take a screenshot
2. Copy the error message
3. Note which tab caused it
4. We'll fix before creating PR

### UI Looks Broken?
1. Take a screenshot
2. Note which tab
3. Note what's wrong (layout, styling, etc.)
4. We'll fix before creating PR

### Functionality Not Working?
1. Note exact steps to reproduce
2. Expected vs actual behavior
3. Any console errors?
4. We'll debug before creating PR

---

## ✅ Test Results

**Date**: __________  
**Browser**: __________  
**Time to Test**: __________

### Results
- [ ] ✅ **PASS** - All tests successful, ready for PR
- [ ] ⚠️ **PASS WITH NOTES** - Works but has minor issues (see notes)
- [ ] ❌ **FAIL** - Critical issues found (see notes)

### Notes
```
[Write any observations, issues, or concerns here]




```

---

## 🎉 If All Tests Pass

You're ready to:
1. ✅ Create the Pull Request
2. ✅ Share with team for review
3. ✅ Merge to main after approval

**PR Link**: https://github.com/curatedhealth/vital-expert-platform/pull/new/refactor/agent-creator-sprint2

---

## 🔥 Quick Commands

```bash
# If you need to restart the dev server
cd apps/digital-health-startup
npm run dev

# If you see TypeScript errors
npx tsc --noEmit

# If you see lint errors
npm run lint
```

---

**Happy Testing!** 🚀

Estimated time: **5-10 minutes** for basic smoke test

