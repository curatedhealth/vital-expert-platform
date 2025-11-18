# 🎯 QUICK START GUIDE: Prompt Library Feature

## 🚀 How to Test the New Feature

### **1. Start Your Dev Server** (if not running)
```bash
cd "apps/digital-health-startup"
pnpm dev
```

### **2. Navigate to Workflows**
```
Open: http://localhost:3000/workflows/UC_CD_001
```

### **3. Click Edit on Any Task**
Click the ✏️ **Edit** button on any task node in the workflow diagram

### **4. Scroll to See New Sections**

You'll now see these improved sections:

#### **A. Knowledge Sources** (Improved) ✅
- Now matches Agents and Tools design
- Button-based domain filter (no more dropdown)
- Clean, consistent layout

#### **B. Prompt Library (PROMPTS™)** (NEW) ✨
- Located after "Workflow Protocols"
- Before "User Prompt"
- New sparkles icon (✨)

---

## 📝 Step-by-Step Test Scenario

### **Scenario**: Configure a regulatory research task with AI-assisted prompting

#### **Step 1**: Select Suite
1. Find "✨ Prompt Library (PROMPTS™)" section
2. Click the **Suite** dropdown
3. Select: **"FORGE™ - Digital Health Development"**
4. ✅ Sub-Suite dropdown should appear

#### **Step 2**: Select Sub-Suite
1. Click the **Sub-Suite** dropdown (now visible)
2. Select: **"DEVELOP - Product Development"**
3. ✅ Prompt Template dropdown should appear with count (e.g., "343 available")

#### **Step 3**: Select Template
1. Click the **Prompt Template** dropdown
2. Browse available templates
3. Select any template (e.g., "Define Clinical Endpoints")
4. ✅ "Apply Template to User Prompt" button should appear

#### **Step 4**: Apply Template
1. Click **"Apply Template to User Prompt"** button
2. ✅ User Prompt textarea below should fill with template content
3. ✅ Purple gradient "Enhance Prompt with AI" button should appear

#### **Step 5**: Enhance with AI (Optional)
1. Review the filled prompt
2. Click **"Enhance Prompt with AI"** (purple-pink gradient button)
3. Wait 2-5 seconds
4. ✅ Prompt should update with AI-enhanced version

#### **Step 6**: Save
1. Review final prompt
2. Make any manual edits if needed
3. Click **"Save Changes"**
4. ✅ Modal closes, changes persist

---

## ✅ What to Verify

### **Visual Design**:
- [ ] Knowledge Sources looks like Agents/Tools (button filter, not select dropdown)
- [ ] Prompt Library has ✨ sparkles icon in header
- [ ] All sections have consistent spacing
- [ ] Dropdowns are properly aligned
- [ ] Buttons have correct styling

### **Functionality**:
- [ ] Suite dropdown loads options
- [ ] Selecting suite populates sub-suite dropdown
- [ ] Selecting sub-suite populates prompts with count
- [ ] Prompt count is accurate
- [ ] Apply button only appears when template selected
- [ ] Clicking Apply fills User Prompt textarea
- [ ] Enhance AI button only appears when prompt has content
- [ ] Clicking Enhance updates prompt with AI version
- [ ] Save persists all changes
- [ ] Cancel discards changes

### **Data Flow**:
- [ ] No console errors
- [ ] Network requests complete successfully
- [ ] API returns data quickly (<500ms each)
- [ ] No loading spinners stuck
- [ ] State updates correctly

---

## 🎨 Expected Visual Result

When you open the Edit modal, you should see:

```
╔═══════════════════════════════════════════════════════╗
║  Edit Task Assignments                            [X] ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  🤖 AI Agents (3 selected)                           ║
║  [3 agents selected                              +]  ║
║  [Badge] [Badge] [Badge]                             ║
║                                                       ║
║  ─────────────────────────────────────────────────   ║
║                                                       ║
║  🔧 Tools (2 selected)                               ║
║  [2 tools selected                               +]  ║
║  [Badge] [Badge]                                     ║
║                                                       ║
║  ─────────────────────────────────────────────────   ║
║                                                       ║
║  🗄️ Knowledge Sources (2 selected)                  ║
║  Filter by domain:                                    ║
║  [Commercial Strategy                            ]   ║ ← NEW: Button style
║  2 sources selected                                   ║ ← NEW: Count display
║  [Select knowledge sources...                    +]  ║
║  [Badge] [Badge]                                     ║
║                                                       ║
║  ─────────────────────────────────────────────────   ║
║                                                       ║
║  Workflow Protocols                                   ║
║  [👤 Human in the Loop      Toggle]                 ║
║  [✓ PHARMA Protocol          Toggle]                 ║
║  [📄 VERIFY Protocol         Toggle]                 ║
║                                                       ║
║  ─────────────────────────────────────────────────   ║
║                                                       ║
║  ✨ Prompt Library (PROMPTS™)                       ║ ← NEW SECTION
║  Select from our curated prompt templates...         ║
║                                                       ║
║  Suite                                                ║
║  [Select a PROMPTS™ suite...                    ▼]  ║
║                                                       ║
║  Sub-Suite                                            ║
║  [Select a sub-suite...                         ▼]  ║
║                                                       ║
║  Prompt Template (343 available)                     ║
║  [Select a template...                          ▼]  ║
║  [+ Apply Template to User Prompt              ]    ║
║                                                       ║
║  ╔═══════════════════════════════════════════════╗  ║
║  ║ ✨ Enhance Prompt with AI                     ║  ║ ← Purple gradient
║  ╚═══════════════════════════════════════════════╝  ║
║                                                       ║
║  ─────────────────────────────────────────────────   ║
║                                                       ║
║  ⚠️ User Prompt (Optional)                           ║
║  [Textarea with applied template content...]         ║
║                                                       ║
╠═══════════════════════════════════════════════════════╣
║                     [✕ Cancel]  [💾 Save Changes]    ║
╚═══════════════════════════════════════════════════════╝
```

---

## 🐛 Troubleshooting

### **Issue**: Don't see Prompt Library section
**Solution**: Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

### **Issue**: Suite dropdown is empty
**Check**: 
1. Open browser console (F12)
2. Look for API errors
3. Verify Supabase connection
4. Check `dh_prompt_suite` table has data

### **Issue**: Apply Template doesn't fill textarea
**Check**:
1. Verify template is selected
2. Check console for errors
3. Ensure prompt has `content_template` field

### **Issue**: Enhance AI button doesn't appear
**Check**:
1. Verify User Prompt textarea has content
2. Check that button is conditional: `{userPrompt && ...}`

### **Issue**: Enhance AI doesn't work
**Check**:
1. Verify `/api/prompts/enhance-ai` endpoint exists
2. Check API key configuration
3. Look for network errors in console

---

## 📊 Sample Data Flow

### **When You Select**: FORGE™ → DEVELOP → "Define Clinical Endpoints"

**API Calls Made**:
```
1. GET /api/workflows/prompt-suites
   Response: [{ id: "...", name: "FORGE™ - Digital Health Development", ... }]

2. GET /api/workflows/prompt-suites/{suiteId}/subsuites
   Response: [
     { id: "...", name: "DEVELOP - Product Development" },
     { id: "...", name: "VALIDATE - Clinical Validation" },
     ...
   ]

3. GET /api/workflows/prompts?suiteId={suiteId}&subsuiteId={subsuiteId}
   Response: [
     { id: "...", title: "Define Clinical Endpoints", content_template: "..." },
     { id: "...", title: "Validate User Experience", content_template: "..." },
     ... (343 total)
   ]

4. [User clicks Apply]
   → userPrompt state updates with content_template

5. [User clicks Enhance]
   POST /api/prompts/enhance-ai
   Body: { prompt: "...", context: { suite: "...", subsuite: "..." } }
   Response: { enhancedPrompt: "..." }
   → userPrompt state updates with enhancedPrompt
```

---

## 🎓 Key Features to Demonstrate

### **1. Cascading Dropdowns** 🔗
- Suite selection triggers subsuite load
- Subsuite selection triggers prompts load
- Parent changes clear child selections

### **2. Smart Count Display** 🔢
- Shows number of available prompts
- Updates dynamically based on filters
- Example: "Prompt Template (343 available)"

### **3. One-Click Application** 🎯
- Select template
- Click Apply
- Instant textarea fill
- No manual copy/paste

### **4. AI Enhancement** 🤖
- Professional language
- PRISM methodology
- Context-aware (suite/subsuite)
- 2-5 second response time

### **5. Consistent Design** 🎨
- All sections match visually
- Same interaction patterns
- Uniform spacing and colors
- Professional appearance

---

## 📞 Need Help?

### **Documentation Files**:
1. `PROMPT_LIBRARY_COMPLETE.md` - Full technical details
2. `PROMPT_LIBRARY_VISUAL_GUIDE.md` - Visual design guide
3. `PROMPT_LIBRARY_IMPLEMENTATION_SUMMARY.md` - Implementation summary
4. This file - Quick start guide

### **Code Locations**:
- Component: `apps/digital-health-startup/src/components/workflow-flow/InteractiveTaskNode.tsx`
- API Routes: `apps/digital-health-startup/src/app/api/workflows/prompt-suites/`
- API Routes: `apps/digital-health-startup/src/app/api/workflows/prompts/`

---

## ✅ Success Criteria

Your test is successful if:

✅ All visual elements appear correctly  
✅ Cascading dropdowns work smoothly  
✅ Template application fills textarea  
✅ AI enhancement improves prompt  
✅ Save persists all data  
✅ No console errors  
✅ Fast performance (<500ms per action)  

---

## 🎉 You're Ready!

**Start Testing**: http://localhost:3000/workflows/UC_CD_001

**Test Path**: Edit Task → Prompt Library → Select Suite → Select Sub-Suite → Select Template → Apply → Enhance → Save

**Expected Result**: Fully functional prompt library with AI enhancement!

---

🚀 **HAPPY TESTING!** 🚀

