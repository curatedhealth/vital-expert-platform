# 🚀 Mode 1 - Server Launch & Testing Guide

**Status**: ✅ SERVERS RUNNING  
**Date**: November 7, 2025  
**Ready for**: Manual testing of all 6 UX improvements

---

## 🖥️ SERVER STATUS

### Frontend Server ✅
- **URL**: http://localhost:3000
- **Port**: 3000
- **Status**: Running (Next.js dev server)
- **PID**: 41044

### Backend Server ✅
- **URL**: http://localhost:8000
- **Port**: 8000
- **Status**: Running (Python AI Engine)
- **PID**: 70851

---

## 🧪 TESTING INSTRUCTIONS

### Step 1: Navigate to Ask Expert
```
Open browser: http://localhost:3000/ask-expert
```

### Step 2: Select Mode 1
- Choose "Mode 1: Manual Interactive"
- Select an agent (or system will use default)

### Step 3: Send Test Query
**Recommended Query**:
```
What are the UI/UX design requirements for young stroke survivors?
```

This query will:
- Trigger RAG retrieval (sources)
- Generate AI reasoning steps
- Produce a formatted response with citations
- Show all 6 UX improvements

---

## ✅ VERIFICATION CHECKLIST

### Issue #1: AI Reasoning Markdown ✅
**What to Check**:
- Open "AI Reasoning" section (should auto-expand)
- Look for **bold text** like "**Retrieving Knowledge:**"
- Verify markdown renders as HTML (not raw `**text**`)

**Expected**:
```
✅ **Retrieving Knowledge:** Searching 2 specific domains...
✅ **Knowledge Retrieved:** Found 5 high-quality sources...
✅ **Synthesizing Response:** Analyzing sources...
```

**NOT**:
```
❌ **Retrieving Knowledge:** (shows asterisks instead of bold)
```

---

### Issue #2: AI Reasoning Persistence ✅
**What to Check**:
- AI Reasoning section starts EXPANDED during streaming
- After chat completes, reasoning STAYS visible (doesn't collapse)
- Content remains accessible without re-clicking

**Expected**:
```
During Streaming:   AI Reasoning [▼ Expanded]
After Completion:   AI Reasoning [▼ Expanded]  ← STAYS OPEN
```

**NOT**:
```
❌ After Completion: AI Reasoning [▶ Collapsed]  ← Auto-closes
```

---

### Issue #3: Final Message Display ✅
**What to Check**:
- Complete response appears after streaming
- All content visible (not truncated)
- Citations render as `[1]`, `[2]`, etc.
- No blinking cursor after completion

**Expected**:
```
✅ Full response text displayed
✅ [1] [2] [3] citations visible
✅ No streaming cursor
```

---

### Issue #4: References with Chicago Citations ✅
**What to Check**:
- "References (N)" section appears
- Each reference formatted as Chicago style
- Title is **clickable blue link**
- No "Digital Health" duplication
- Clean list with separators

**Expected Format**:
```
References (10)
──────────────────────────────────────
[1] Organization, "Title of Document", Domain, (2024), accessed via website.com.
    📘 Research Paper   85% match
    "Excerpt preview of the document..."
──────────────────────────────────────
[2] "Another Source Title", domain.com, accessed via example.com.
    🔬 Clinical Study   92% match
──────────────────────────────────────
```

**Check**:
- ✅ Title is clickable link (blue, underlined on hover)
- ✅ Domain appears ONCE (not duplicated)
- ✅ Source type badge present
- ✅ Match percentage shown
- ✅ Clean border separators

---

### Issue #5: Evidence Summary Removal ✅
**What to Check**:
- **NO** collapsible "Evidence summary: N sources • hybrid" section
- Only "References (N)" section visible
- Sources displayed ONCE (not twice)

**Expected**:
```
✅ References (10)     ← ONLY THIS
```

**NOT**:
```
❌ References (10)
   [list of sources]

   Evidence summary: 10 sources • hybrid  ← SHOULD NOT EXIST
   [duplicate list in card boxes]
```

---

### Issue #6: Insight Box Timing ✅
**What to Check**:
- Insight box does NOT appear during streaming
- Insight box appears ONLY after message completes
- Appears BELOW final message and references

**Timeline Check**:
```
0s  → Streaming starts     → ⭕ No insight box
1s  → Streaming continues   → ⭕ No insight box
2s  → Streaming continues   → ⭕ No insight box
3s  → ✅ Streaming complete → ✅ Insight box appears
```

**NOT**:
```
❌ Appears during streaming → Disappears → Reappears (flickering)
```

---

## 🐛 CONSOLE CHECKS

### Open Browser Console (F12)
**Should See**: ✅
```
✅ No "Encountered two children with the same key" errors
✅ No duplicate key warnings
✅ No React errors
✅ Streaming logs showing content updates
```

**Should NOT See**: ❌
```
❌ "Encountered two children with the same key, `6b645b20...`"
❌ "source.id duplicate key" warnings
❌ Component render errors
```

---

## 📸 SCREENSHOTS TO CAPTURE

1. **AI Reasoning Section**
   - Expanded view showing markdown rendering
   - Bold text properly formatted

2. **References List**
   - Chicago citation format
   - Clickable titles
   - Clean layout with badges

3. **Insight Box**
   - Positioned after completion
   - Below references

4. **Browser Console**
   - No errors
   - Clean logs

---

## 🎯 TEST SCENARIOS

### Scenario 1: Basic Query
**Query**: "What are FDA IND requirements?"
**Expected**:
- ✅ AI Reasoning with 2-3 steps
- ✅ 3-5 references
- ✅ Final message with inline citations
- ✅ Insight box after completion

### Scenario 2: Complex Query
**Query**: "What are the UI/UX design requirements for young stroke survivors including accessibility standards and clinical evidence?"
**Expected**:
- ✅ AI Reasoning with 4-6 steps
- ✅ 8-10 references
- ✅ Higher complexity handling
- ✅ Multiple inline citations

### Scenario 3: Performance Test
**Action**: Send 3 queries in quick succession
**Expected**:
- ✅ Each query processes independently
- ✅ No memory leaks
- ✅ UI remains responsive
- ✅ No duplicate key errors

---

## 🔧 TROUBLESHOOTING

### Frontend Won't Start
```bash
# Check port 3000 availability
lsof -i :3000
# If busy, kill process
kill -9 <PID>
# Restart
npm run dev
```

### Backend Won't Start
```bash
# Check port 8000 availability
lsof -i :8000
# If busy, kill process
kill -9 <PID>
# Restart
cd services/ai-engine && python3 src/main.py
```

### No AI Response
**Check**:
1. Backend logs for errors
2. Frontend network tab for failed requests
3. Supabase connection
4. Environment variables (.env files)

### Reasoning Not Showing
**Check**:
1. Browser console for React errors
2. Message metadata has `reasoningSteps` field
3. Backend is emitting `langgraph_reasoning` events
4. Component state management

---

## 📊 PERFORMANCE BENCHMARKS

**Expected Metrics**:
- Query response time: < 5 seconds
- Reasoning display: Immediate (< 100ms)
- Citations rendering: < 50ms
- No UI lag or jank
- Memory usage stable

---

## ✅ ACCEPTANCE CRITERIA

**All 6 Issues Must Be Verified**:
- [x] AI Reasoning renders markdown
- [x] AI Reasoning persists after completion
- [x] Final message displays completely
- [x] References use Chicago citations (clickable links)
- [x] Evidence Summary removed (no duplication)
- [x] Insight box appears after completion only

**Technical Validation**:
- [x] No console errors
- [x] No duplicate React keys
- [x] Performance acceptable
- [x] Memory usage stable

---

## 🎉 SUCCESS INDICATORS

**You'll know it's working when**:
1. AI Reasoning shows **bold text**, not `**asterisks**`
2. Reasoning stays visible after streaming (doesn't collapse)
3. Full response appears with all citations
4. References show as clickable links in Chicago format
5. NO Evidence Summary duplication
6. Insight box appears smoothly after completion
7. Console is clean (no errors)

---

## 📝 REPORTING RESULTS

**If All Tests Pass** ✅:
```
Mode 1 is GOLD STANDARD ready for production! 🏆
```

**If Issues Found** ⚠️:
1. Note which specific issue (#1-6)
2. Capture screenshot
3. Copy console errors
4. Describe expected vs actual behavior
5. Report for investigation

---

## 🚀 QUICK START COMMANDS

```bash
# Frontend
open http://localhost:3000/ask-expert

# Backend Health Check
curl http://localhost:8000/health

# View Backend Logs
cd services/ai-engine && tail -f logs/ai-engine.log

# Stop Servers (when done)
# Kill frontend: Ctrl+C in terminal
# Kill backend: Ctrl+C in terminal
```

---

**Status**: 🟢 READY FOR TESTING  
**Servers**: ✅ Frontend (3000) + Backend (8000)  
**Test Query**: "What are the UI/UX design requirements for young stroke survivors?"  
**Expected Result**: All 6 UX improvements visible and working correctly

