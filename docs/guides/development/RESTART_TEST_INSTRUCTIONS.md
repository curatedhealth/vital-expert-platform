# Fresh Restart Complete ✅

## What Was Done

1. ✅ **Killed all running servers** (ports 3000, 3001, 8000)
2. ✅ **Restarted Frontend** with all latest changes
3. ✅ **Enhanced debugging enabled** - Console logs active

---

## 🧪 Test Now (Step-by-Step)

### Step 1: Hard Refresh Browser

**IMPORTANT**: Clear all cached files first!

**Mac**: `Cmd + Shift + R`  
**Windows**: `Ctrl + Shift + F5`  
**Or**: Right-click refresh button → "Empty Cache and Hard Reload"

---

### Step 2: Open Console BEFORE Testing

1. Press `F12` (or `Cmd+Opt+I` on Mac)
2. Go to **Console** tab
3. Clear console (`Cmd+K` or click 🚫)
4. Leave it open during testing

---

### Step 3: Navigate to Ask Expert

Open: `http://localhost:3000/ask-expert`

---

### Step 4: Check Chat History (Sidebar)

Look at the **left sidebar** for:

```
💬 Chat History
├─ 🔄 Refresh button
├─ ➕ New Chat button
└─ List of previous chats (if any)
```

**Expected**:
- If you have previous chats, they should appear here
- Each chat shows: Agent name, timestamp, message count
- Click any chat to load it

**If empty**: That's okay! We'll create a new chat next.

---

### Step 5: Send Test Message

**Message**: "What are the best practices for clinical trial design in digital health?"

**Watch Console** - You should see:

```javascript
📝 [AskExpert] Creating Assistant Message
├─ Mode: "manual"
├─ Content length: XXX
├─ Sources count: N
├─ Reasoning steps: N
├─ Confidence: 0.XX
├─ 📦 Metadata structure: {
│     hasSources: true/false,
│     hasReasoning: true/false,
│     sourcesLength: N,
│     reasoningLength: N
│   }
├─ 🧠 Reasoning array: [...] or ⚠️ No reasoning in metadata!
└─ 📚 Sources array: [...] or ⚠️ No sources in metadata!
```

Then:

```javascript
🎨 [EnhancedMessageDisplay] Rendering message XXXXX
├─ Role: "assistant"
├─ Has metadata: true/false
├─ Has sources: N
├─ Has reasoning: N
└─ 📦 Full metadata: {...}
```

---

### Step 6: Check UI Elements

After the response appears, look for:

#### 1. **AI Reasoning Button**:
```
[Show AI Reasoning] ▼
```
- Should appear below agent name
- Click to expand and see reasoning steps
- Each step has ✨ sparkle icon

#### 2. **Inline Citations**:
```
According to guidelines[1], trials must...[2]
                        ^^^              ^^^
                  (blue superscript) (blue superscript)
```

#### 3. **Sources Section**:
```
📚 Sources (N)
[1] FDA Guidelines 2024 - fda.gov
    Clinical trials must follow...
    Similarity: 92%
```

#### 4. **Chat History Updated**:
- Check left sidebar
- Your new chat should appear at the top
- Shows message count: "2 messages" (1 user + 1 assistant)

---

## 📊 Diagnostic Results

### ✅ **Scenario A: Everything Works**

**Console shows**:
```
✅ Sources count: 5
✅ Reasoning steps: 3
✅ 🧠 Reasoning array: ["Step 1...", "Step 2...", "Step 3..."]
✅ 📚 Sources array: [{id: "1", title: "...", ...}, ...]
```

**UI shows**:
- ✅ Reasoning button appears and works
- ✅ Citations are clickable blue numbers
- ✅ Sources section displays
- ✅ Chat appears in sidebar history

**Action**: **SUCCESS! All features working!** 🎉

---

### ⚠️ **Scenario B: No Reasoning/Sources Data**

**Console shows**:
```
⚠️ Sources count: 0
⚠️ Reasoning steps: 0
⚠️ No reasoning in metadata!
⚠️ No sources in metadata!
```

**This means**: Backend (AI Engine) is NOT sending reasoning or sources.

**Next Steps**:

#### 1. Check if AI Engine is running:
```bash
curl http://localhost:8000/health
```

**If fails**: AI Engine is not running. Start it:
```bash
cd services/ai-engine
python -m uvicorn src.main:app --reload --port 8000
```

#### 2. Check if API Gateway is running:
```bash
curl http://localhost:3001/health
```

**If fails**: API Gateway is not running. Start it:
```bash
cd api-gateway
npm run dev
```

#### 3. Check Mode 1 endpoint directly:
```bash
curl -N -X POST http://localhost:8000/api/mode1/manual \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are best practices for clinical trials?",
    "agentId": "test-agent",
    "userId": "test-user",
    "tenantId": "test-tenant"
  }'
```

**Look for**:
- Lines starting with `data: {"type":"reasoning",...}`
- Lines starting with `data: {"type":"sources",...}`

**If you don't see these**: Backend needs to be configured to send reasoning and sources.

---

### ⚠️ **Scenario C: Console Shows Data But UI Doesn't Display**

**Console shows**:
```
✅ Sources count: 5
✅ Reasoning steps: 3
✅ 🧠 Reasoning array: [...]
✅ 📚 Sources array: [...]
```

**But UI doesn't show reasoning button or citations**.

**This means**: Frontend rendering issue.

**Debug Steps**:

1. **Check if elements exist but hidden**:
```javascript
// Paste in console:
document.querySelectorAll('[class*="reasoning"]').forEach(el => {
  console.log('Found reasoning element:', el);
  console.log('Display:', getComputedStyle(el).display);
  console.log('Opacity:', getComputedStyle(el).opacity);
});
```

2. **Check React DevTools**:
   - Install React DevTools extension
   - Find `EnhancedMessageDisplay` component
   - Inspect `props.metadata`
   - Should have `reasoning` and `sources` arrays

3. **Force display** (testing only):
   - Open `EnhancedMessageDisplay.tsx`
   - Find line 772: `{!isUser && metadata?.reasoning && metadata.reasoning.length > 0 && (`
   - Temporarily change to: `{!isUser && (`
   - Save and refresh

---

### ⚠️ **Scenario D: Chat History Not Showing**

**Sidebar is empty or doesn't show past chats**.

**Possible causes**:

1. **No chats yet**: First time using the feature
   - Send a message to create first chat
   - Check sidebar again

2. **Database table doesn't exist**:
```bash
# Check Supabase directly
# Open: https://app.supabase.com
# Go to: Table Editor → chat_sessions
# Should see table with columns: id, user_id, title, etc.
```

3. **API endpoint failing**:
```bash
# Check API logs
tail -f /tmp/digital-health-dev.log | grep "chat/sessions"
```

4. **User not authenticated**:
   - Check if you're logged in
   - Look for user avatar in top-right
   - If not logged in, go to `/login`

---

## 🔧 Quick Fixes

### If Backend Not Sending Data:

**Option 1**: Use mock data (testing only)

Edit `ask-expert/page.tsx` around line 1338:

```typescript
reasoning: reasoning.length > 0 ? reasoning : [
  "Analyzed your question about clinical trial design",
  "Retrieved evidence from FDA guidelines and research papers",
  "Synthesized answer based on current best practices"
],
sources: sources.length > 0 ? sources : [
  {
    id: "source-1",
    title: "FDA Digital Health Guidelines 2024",
    excerpt: "Digital health clinical trials must follow specific protocols...",
    url: "https://www.fda.gov/medical-devices/digital-health",
    similarity: 0.95
  },
  {
    id: "source-2",
    title: "Best Practices for Clinical Trial Design",
    excerpt: "Phase 3 trials should include diverse patient populations...",
    url: "https://clinicaltrials.gov/best-practices",
    similarity: 0.88
  }
]
```

Save, refresh browser, and test again.

---

### If Chat History Not Working:

**Option 1**: Check session creation manually

```javascript
// In browser console:
fetch('/api/chat/sessions?userId=YOUR_USER_ID')
  .then(r => r.json())
  .then(data => console.log('Sessions:', data));
```

**Option 2**: Create session manually

```javascript
// In browser console:
fetch('/api/chat/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Chat',
    user_id: 'YOUR_USER_ID'
  })
}).then(r => r.json()).then(console.log);
```

---

## 📋 Current Status

- ✅ **Frontend**: Running on port 3000
- ❓ **API Gateway**: Check if running on port 3001
- ❓ **AI Engine**: Check if running on port 8000
- ✅ **Debug Logs**: Enabled in console
- ✅ **Code Changes**: All loaded

---

## 🎯 Expected vs. Actual

After you test, report back with:

**Console Output**:
- [ ] Shows `📝 [AskExpert] Creating Assistant Message`?
- [ ] Shows `Sources count: N`?
- [ ] Shows `Reasoning steps: N`?
- [ ] Shows `⚠️` warnings or `✅` success?

**UI Display**:
- [ ] "Show AI Reasoning" button visible?
- [ ] Citation numbers `[1]` `[2]` appear?
- [ ] Sources section displays?
- [ ] Chat appears in sidebar?

**Copy and paste the console output** so I can see exactly what's happening!

---

## 🆘 Emergency: Nothing Works

If absolutely nothing works:

1. **Check all services**:
```bash
# Frontend
lsof -ti:3000

# API Gateway  
lsof -ti:3001

# AI Engine
lsof -ti:8000
```

2. **Restart everything from scratch**:
```bash
# Kill all
lsof -ti:3000,3001,8000 | xargs kill -9 2>/dev/null

# Start AI Engine (Terminal 1)
cd services/ai-engine
python -m uvicorn src.main:app --reload --port 8000

# Start API Gateway (Terminal 2)
cd api-gateway
npm run dev

# Start Frontend (Terminal 3)
cd apps/digital-health-startup
pnpm dev
```

3. **Clear browser completely**:
   - Clear all cookies
   - Clear localStorage
   - Clear cache
   - Close and reopen browser

---

**Now go test! Open `http://localhost:3000/ask-expert` and send that test message.** 

**Then paste your console output here** so I can see what's happening! 🔍

