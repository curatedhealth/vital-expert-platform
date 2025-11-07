# 🧪 MODE 1 FINAL TEST GUIDE

## ✅ **Prerequisites**

- ✅ AI Engine running on port 8080 (with AIMessage fix)
- ✅ Frontend running on port 3000
- ✅ Agent metadata fixed: `["digital-health", "regulatory-affairs"]`
- ✅ LangGraph workflow updated: `AIMessage` added to `state['messages']`

---

## 🎯 **What to Test**

This fix should resolve **THREE issues at once**:

1. ✅ **Chat Completion**: Response content should appear
2. ✅ **Sources Display**: Collapsible sources section should show "Sources (5-10)"
3. ✅ **Inline Citations**: Interactive `[1]`, `[2]` badges should appear in text

---

## 📋 **Test Steps**

### **Step 1: Hard Refresh Frontend**

```bash
# Kill and restart frontend to clear all cached state
lsof -ti :3000 | xargs kill -9
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
npm run dev
```

**Wait for**: `✓ Ready in [X]ms`

---

### **Step 2: Open Fresh Browser**

1. Open **Incognito/Private Window** (to avoid cached GoTrueClient issues)
2. Navigate to: `http://localhost:3000/ask-expert`
3. Log in if needed
4. Select agent: **"Digital Therapeutic Advisor"**

---

### **Step 3: Verify Agent Configuration**

**Check UI Elements**:
- ✅ Agent name displays: "Digital Therapeutic Advisor"
- ✅ RAG toggle: ON (shows "RAG (2)")
- ✅ Tools toggle: ON (shows "Tools (3)")

**Check Console**:
```javascript
// Should see:
✅ [Mode Check] Mode: manual
✅ Agent ID: 70b410dd-354b-4db7-b8cd-f1a9b204f440
✅ Selected Agents: [1]
```

---

### **Step 4: Send Test Message**

**Type**: `"What are the FDA guidelines for digital therapeutics for ADHD?"`

**Expected Behavior**:

1. **Immediate UI Response**:
   - ✅ User message appears
   - ✅ Assistant message bubble appears (empty, with thinking spinner)
   - ✅ "Show AI Reasoning" expands with workflow steps

2. **During Processing** (15-30 seconds):
   - ✅ Workflow steps update: "RAG Retrieval → Agent Execution → Format Output"
   - ✅ Reasoning thoughts appear: "Searching 2 domains for relevant evidence"
   - ✅ RAG summary updates: `totalSources: 5-10` (NOT 0!)

3. **After Completion**:
   - ✅ **Response content appears** (not empty!)
   - ✅ Response includes inline citation markers: `[1]`, `[2]`, `[3]`, etc.
   - ✅ Citations are interactive pills (hover shows source details)
   - ✅ Collapsible sources section shows: **"Sources (5-10)"** (NOT "Sources (0)")
   - ✅ Click sources to expand → shows list with titles, domains, URLs

---

## 🔍 **What to Check in Console Logs**

### **Frontend Console (Chrome DevTools)**

**Good Signs** ✅:
```javascript
✅ [AskExpert] Calling endpoint: http://localhost:8080/api/mode1/manual
✅ [AskExpert] Response OK, starting stream processing

// During streaming:
✅ 🔄 [LangGraph Update] Node completed: Object
✅ ragSummary: { totalSources: 5, domains: ["digital-health", "regulatory-affairs"] }
✅ toolSummary: { used: [...], totals: { calls: 2, success: 2 } }

// Final message:
✅ Role: assistant
✅ Content length: 2500-3000  (NOT 0!)
✅ Has sources: 5-10 (NOT 0!)
✅ Has citations: true
```

**Bad Signs** ❌ (means fix didn't work):
```javascript
❌ Content length: 0
❌ totalSources: 0
❌ No sources data in metadata!
```

---

### **AI Engine Logs** (`tail -f /tmp/ai-engine.log`)

**Good Signs** ✅:
```
✅ [RAG] Pinecone returned 5 matches for namespace: digital-health
✅ [RAG] Vector search complete: 5 results (after filtering)
✅ [Agent] Agent execution complete
✅ [Format] Formatted response with 10 citations
✅ [Format] Added AIMessage to state messages array  ← KEY!
✅ [Workflow] Workflow completed: response_length=2853, citations_count=10, sources=5
```

**Bad Signs** ❌:
```
❌ [RAG] Pinecone returned 0 matches
❌ [Format] Skipped adding AIMessage (state messages not updated)
❌ response_length=0
```

---

## 📊 **Expected vs. Actual Results**

### **✅ SUCCESS CRITERIA**

| Feature | Before Fix | After Fix ✅ |
|---------|-----------|-------------|
| **Chat Completion** | Empty (0 chars) | Full response (2500-3000 chars) |
| **Sources Display** | Sources (0) | Sources (5-10) |
| **Inline Citations** | None | Interactive `[1]`, `[2]` badges |
| **RAG Summary** | `totalSources: 0` | `totalSources: 5-10` |
| **Tool Usage** | `used: []` | `used: ["web_search", ...]` |
| **AI Reasoning** | Empty or generic | Detailed workflow steps |

---

### **🎯 SPECIFIC CHECKS**

#### **1. Chat Completion Text** ✅
**Look for**:
- ✅ Response starts with: "Based on the available evidence [1]..." or similar
- ✅ Response is 2500-3000+ characters (not 0!)
- ✅ Response discusses FDA guidelines, ADHD, digital therapeutics
- ✅ Response includes inline citation markers: `[1]`, `[2]`, `[3]`

#### **2. Sources Section** ✅
**Click "Sources (X)" to expand**:
- ✅ Shows 5-10 sources (NOT 0!)
- ✅ Each source has:
  - Title (e.g., "FDA Guidance on Software as Medical Device")
  - Domain tag (e.g., "Digital Health", "Regulatory Affairs")
  - URL (clickable link)
  - Excerpt (first 200 chars)
  - Similarity score (0.70-0.95)

#### **3. Inline Citations** ✅
**Hover over `[1]` badge**:
- ✅ Citation card appears
- ✅ Shows source title
- ✅ Shows source URL
- ✅ Shows excerpt/quote
- ✅ Click to view full source

---

## 🐛 **Troubleshooting**

### **Issue: Still seeing "Content length: 0"**

**Possible Causes**:
1. Frontend cached old SSE parser
2. AI Engine not restarted with fix
3. Browser cached old JavaScript

**Fix**:
```bash
# 1. Hard restart everything
lsof -ti :8080 | xargs kill -9
lsof -ti :3000 | xargs kill -9
rm /tmp/ai-engine.log

# 2. Restart AI Engine
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
source venv/bin/activate
PORT=8080 python src/main.py > /tmp/ai-engine.log 2>&1 &

# 3. Restart Frontend
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
npm run dev

# 4. Open FRESH incognito window
```

---

### **Issue: Still seeing "totalSources: 0"**

**Check AI Engine logs**:
```bash
tail -100 /tmp/ai-engine.log | grep -i "pinecone\|rag\|sources"
```

**Look for**:
- ✅ "Pinecone returned 5 matches" (good)
- ❌ "Pinecone returned 0 matches" (bad - domain mapping issue)
- ❌ "Domain 'clinical_validation' not found" (bad - old agent metadata)

**Fix**:
1. Verify agent metadata in Supabase (should be `["digital-health", "regulatory-affairs"]`)
2. Hard refresh browser to reload agent data

---

### **Issue: GoTrueClient warnings persist**

**This is NOT blocking** - it's a HMR issue, but Mode 1 should still work.

**To minimize warnings**:
1. Use incognito/private window
2. Don't hot-reload - do hard refresh instead
3. Restart frontend server periodically

---

## 📸 **Screenshots to Capture**

If testing is successful, capture:

1. **Full chat view**: showing question + complete response with citations
2. **Expanded sources**: showing "Sources (5-10)" with list of documents
3. **Inline citation hover**: showing citation card with source details
4. **AI Reasoning panel**: showing workflow steps and RAG summary
5. **Console logs**: showing `Content length: 2500+`, `totalSources: 5-10`

---

## 🎉 **Success Confirmation**

**You'll know it's working when you see ALL of these**:

- ✅ Chat bubble shows full response text (not empty)
- ✅ Response includes `[1]`, `[2]` inline citation badges
- ✅ Badges are interactive (hover shows details)
- ✅ Collapsible section shows "Sources (5-10)"
- ✅ Console shows `Content length: 2500+`
- ✅ Console shows `totalSources: 5-10`
- ✅ AI Reasoning panel shows RAG retrieval with 5-10 sources

**If ALL of the above are true → MODE 1 IS FIXED! 🎊**

---

## 📝 **Post-Test Actions**

### **If Test PASSES** ✅:
1. Document the working configuration
2. Apply same AIMessage pattern to Modes 2, 3, 4
3. Create PR for Mode 1 fixes
4. Move to Mode 2 testing

### **If Test FAILS** ❌:
1. Share console logs (frontend + AI Engine)
2. Share screenshot of UI
3. Check `MODE1_STREAMING_COMPREHENSIVE_ANALYSIS.md` for debugging tips
4. Verify all prerequisites are met

---

## 🔗 **Related Documents**

- `MODE1_STREAMING_COMPREHENSIVE_ANALYSIS.md` - Full root cause analysis
- `MODE1_DATA_INTEGRITY_FIX_COMPLETE.md` - Agent metadata fix
- `LANGGRAPH_NATIVE_STREAMING_COMPLETE.md` - Streaming implementation details
- `READY_TO_TEST.md` - Pre-test checklist

---

**Test Started**: [Current Timestamp]  
**Expected Duration**: 5-10 minutes  
**Status**: ⏳ AWAITING USER TEST  

