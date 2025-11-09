# 🧪 COMPLETE TESTING GUIDE - ASK EXPERT PAGE

## Date: November 9, 2025
## Status: ✅ **READY FOR TESTING**

---

## 🎯 Quick Test (5 minutes)

### **1. Check UI Components**
```
URL: http://localhost:3000/ask-expert
```

**Verify**:
- [ ] Page loads without errors
- [ ] No infinite loop messages in console
- [ ] Input box visible at bottom
- [ ] 5 buttons visible: `GPT-4`, `RAG`, `Tools`, `Automatic`, `Autonomous`

---

### **2. Test RAG Button**

**Steps**:
1. Click **RAG** button (green button)
2. Should toggle between:
   - ✅ Green = Enabled
   - ⚪ Gray = Disabled
3. Click again to open dropdown
4. Select domains: `digital-health`, `regulatory-affairs`, `clinical-research`
5. Close dropdown

**Expected**:
- ✅ Button toggles color
- ✅ Dropdown opens/closes
- ✅ Domains selectable
- ✅ No console errors

---

### **3. Test Tools Button**

**Steps**:
1. Click **Tools** button (teal button)
2. Should toggle between:
   - ✅ Teal = Enabled
   - ⚪ Gray = Disabled
3. Click again to open dropdown
4. Select tools: `calculator`, `web_search`, `database_query`
5. Close dropdown

**Expected**:
- ✅ Button toggles color
- ✅ Dropdown opens/closes
- ✅ Tools selectable
- ✅ No console errors

---

### **4. Test Send Button**

**Steps**:
1. Type a message: "What is digital health?"
2. Click **Send** button (or press Enter)
3. Observe behavior

**Expected**:
- ✅ Input clears
- ✅ Send button disables (while loading)
- ⚠️ "Connection lost" banner (if backend not running)
- ⚠️ OR streaming response (if backend running)

---

## 🔍 Detailed Testing (20 minutes)

### **Test 1: Phase 2 Token Streaming** (2 min)

**Prerequisites**: AI engine must be running

**Steps**:
1. Select an agent (if Mode 1)
2. Ask: "What is machine learning?"
3. Watch streaming response

**Expected**:
- ✅ Character-by-character animation (30ms delay)
- ✅ Smooth, fluid text appearance
- ✅ Blinking cursor during stream
- ✅ No jank or flicker

**Console Check**:
```
[Phase 2] Stream started
[Phase 2] First token received
```

---

### **Test 2: Progress Bar** (2 min)

**Steps**:
1. Ask a longer question
2. Watch progress bar at top of page

**Expected**:
- ✅ Progress bar appears when streaming starts
- ✅ Shows stages: "Thinking" → "Streaming" → "Tools" (if any) → "RAG" (if any)
- ✅ Progress percentage increases (0% → 100%)
- ✅ Bar disappears when done

---

### **Test 3: Connection Quality** (2 min)

**Steps**:
1. Open DevTools → Console
2. Look for connection metrics
3. Check banner (if poor connection)

**Expected**:
- ✅ Quality tracked: `excellent` / `good` / `fair` / `poor`
- ✅ Latency measured in milliseconds
- ✅ Banner shows if quality drops
- ✅ "Retry" button works

---

### **Test 4: Typing Indicators** (1 min)

**Steps**:
1. Send a message
2. Watch for animated dots during thinking stage

**Expected**:
- ✅ Dots animate: `• • •` → `• • •` → `• • •`
- ✅ Message: "AI is thinking..."
- ✅ Message changes during tool execution: "Executing tools..."
- ✅ Dots stop when streaming starts

---

### **Test 5: Time Estimates** (1 min)

**Steps**:
1. Send a message
2. Look for time estimate below progress bar

**Expected**:
- ✅ Shows estimated time remaining
- ✅ Format: "Estimated time remaining: 5s (80% confidence)"
- ✅ Updates dynamically as streaming progresses
- ✅ Disappears when complete

---

### **Test 6: Dev Metrics Panel** (1 min)

**Prerequisites**: `NODE_ENV=development`

**Steps**:
1. Send a message
2. Scroll to bottom of page
3. Look for gray metrics bar

**Expected**:
- ✅ Shows: `TTFT`, `TPS`, `Tokens`, `Quality`, `Latency`, `Uptime`
- ✅ Updates in real-time
- ✅ Color-coded quality: green/blue/yellow/red

---

## 🧪 Unit Testing

### **Run All Tests**

```bash
cd apps/digital-health-startup

# Run all Phase 2 tests
npm test -- useTokenStreaming
npm test -- useStreamingProgress
npm test -- useConnectionQuality
npm test -- useTypingIndicator
npm test -- useTimeEstimation
npm test -- useStreamingMetrics

# Run all Phase 1 tests
npm test -- useMessageManagement
npm test -- useModeLogic
npm test -- useStreamingConnection
npm test -- useToolOrchestration
npm test -- useRAGIntegration
```

**Expected**:
```
✓ All tests passing (73 tests)
✓ Coverage: 85%+
✓ No failures
```

---

## 🐛 Debugging

### **If Infinite Loop Occurs**

**Check Console**:
```
Error: Maximum update depth exceeded
```

**Fix**:
- Already fixed in `prompt-input.tsx` (lines 162, 174)
- Already fixed in `useConnectionQuality.ts` (removed problematic useEffect)
- Clear `.next` cache: `rm -rf .next && npm run dev`

---

### **If RAG/Tools Not Working**

**Check**:
1. Are state variables defined? (`enableRAG`, `enableTools`)
2. Are callbacks connected? (`setEnableRAG`, `setEnableTools`)
3. Are arrays populated? (`availableTools`, `availableRagDomains`)

**Fix**:
- Already fixed in `page.tsx` (lines 232-233, 840-850)

---

### **If Send Button Disabled**

**Check**:
1. Is `isLoading` true?
2. Is Mode 1 and no agents selected?
3. Is input empty?

**Fix**:
```typescript
// Line 250 in page.tsx
const isLoading = messageManager.isStreaming || tools.hasActiveTools;
```

---

### **If Connection Lost Banner**

**This is NORMAL if backend not running!**

**To fix (if you want to test streaming)**:
```bash
# Terminal 1: Start AI engine
cd services/ai-engine
python app.py

# Terminal 2: Already running (Next.js)
```

---

## 📊 Test Results Template

### **Frontend Tests** ✅
- [ ] Page loads without errors
- [ ] RAG button functional
- [ ] Tools button functional
- [ ] Send button enabled
- [ ] No infinite loops
- [ ] No TypeScript errors

### **Phase 2 Features** (Requires backend)
- [ ] Token streaming works
- [ ] Progress bar reaches 100%
- [ ] Connection quality tracked
- [ ] Typing indicators appear
- [ ] Time estimates shown
- [ ] Dev metrics update

### **Unit Tests** ✅
- [ ] All 73 tests passing
- [ ] 85%+ coverage
- [ ] No failures

---

## ✅ Success Criteria

### **Frontend Only** (No backend needed)
```
✅ Page loads smoothly
✅ UI components functional (RAG, Tools, Send)
✅ No console errors
✅ State management working
✅ Dropdowns working
```

### **Full Stack** (Backend required)
```
✅ All above +
✅ Streaming responses display
✅ Progress indicators show
✅ Connection quality tracked
✅ Time estimates accurate
✅ Dev metrics updating
```

---

## 🎯 Current Status

**Files Fixed**:
- ✅ `prompt-input.tsx` - Infinite loop fixed
- ✅ `useConnectionQuality.ts` - Infinite loop fixed
- ✅ `page.tsx` - State management added

**Features Working**:
- ✅ RAG button
- ✅ Tools button
- ✅ Send button
- ✅ State toggles

**Ready for**:
- ✅ Frontend testing (now)
- ⏳ Backend integration (when AI engine available)

---

## 🚀 Next Steps

1. ✅ **Test UI components** (5 min) - Do this now!
2. ⏳ **Test streaming** (requires backend) - When ready
3. ⏳ **Run unit tests** (optional) - For confidence
4. ⏳ **Phase 3: Caching** - When Phase 2 validated

**Start testing**: http://localhost:3000/ask-expert

