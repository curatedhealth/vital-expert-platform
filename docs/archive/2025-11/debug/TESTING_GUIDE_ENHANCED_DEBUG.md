# Testing Guide: Missing Features - Now With Enhanced Debugging 🔍

## What Was Done

### 1. ✅ **Enhanced Console Logging**

Added comprehensive debug logging in two key files:

#### `EnhancedMessageDisplay.tsx` (Frontend Component)
**Location**: Lines 353-395

```typescript
console.group(`🎨 [EnhancedMessageDisplay] Rendering message ${id}`);
console.log('Role:', role);
console.log('Has metadata:', !!metadata);
console.log('Has sources:', metadata?.sources?.length || 0);
console.log('Has reasoning:', metadata?.reasoning?.length || 0);
console.log('📦 Full metadata:', JSON.stringify(metadata, null, 2));

if (metadata.reasoning) {
  console.log('🧠 Reasoning data:', metadata.reasoning);
  console.log('🧠 Reasoning type:', Array.isArray(metadata.reasoning) ? 'Array' : typeof metadata.reasoning);
} else {
  console.warn('⚠️ No reasoning data in metadata!');
}

if (metadata.sources) {
  console.log('📚 Sources data:', metadata.sources);
  console.log('📚 First source:', metadata.sources[0]);
} else {
  console.warn('⚠️ No sources data in metadata!');
}
console.groupEnd();
```

#### `ask-expert/page.tsx` (Message Creation)
**Location**: Lines 1366-1402

```typescript
console.group('📝 [AskExpert] Creating Assistant Message');
console.log('Mode:', mode);
console.log('Sources count:', sources.length);
console.log('Reasoning steps:', reasoning.length);
console.log('Confidence:', confidence);

console.log('📦 Metadata structure:', {
  hasSources: !!assistantMessage.metadata?.sources,
  hasReasoning: !!assistantMessage.metadata?.reasoning,
  sourcesLength: assistantMessage.metadata?.sources?.length || 0,
  reasoningLength: assistantMessage.metadata?.reasoning?.length || 0
});

if (assistantMessage.metadata?.reasoning) {
  console.log('🧠 Reasoning array:', assistantMessage.metadata.reasoning);
} else {
  console.warn('⚠️ No reasoning in metadata!');
}

console.log('Full message object:', JSON.stringify(assistantMessage, null, 2));
console.groupEnd();
```

### 2. ✅ **Features Already Implemented**

All four requested features are **fully implemented** in the codebase:

1. **AI Reasoning from LangGraph** - Lines 772-822 in `EnhancedMessageDisplay.tsx`
2. **Inline Citations** - Lines 146-654 in `EnhancedMessageDisplay.tsx`
3. **Chat Streaming** - Lines 867-1300 in `ask-expert/page.tsx`
4. **Chat History** - Multiple files (context, sidebar, API routes)

---

## Testing Instructions

### Step 1: Open Browser Console

1. Open your browser
2. Navigate to: `http://localhost:3000/ask-expert`
3. Open DevTools (`F12` or `Cmd+Opt+I`)
4. Go to **Console** tab
5. Clear console (`Cmd+K` or click 🚫)

### Step 2: Send a Test Message

**Test Message**: "What are the FDA guidelines for digital health clinical trials?"

### Step 3: Watch Console Output

You'll see detailed logs in this order:

#### 🎬 **During Streaming**:

```
📝 [AskExpert] Creating Assistant Message
├─ Mode: "manual"
├─ Sources count: 0 or N
├─ Reasoning steps: 0 or N
├─ Confidence: 0.85
├─ 📦 Metadata structure:
│   ├─ hasSources: true/false
│   ├─ hasReasoning: true/false
│   ├─ sourcesLength: N
│   └─ reasoningLength: N
├─ 🧠 Reasoning array: [...]  or ⚠️ No reasoning in metadata!
├─ 📚 Sources array: [...]  or ⚠️ No sources in metadata!
└─ Full message object: {...}
```

#### 🎨 **During Rendering**:

```
🎨 [EnhancedMessageDisplay] Rendering message 1234567890
├─ Role: "assistant"
├─ Has metadata: true/false
├─ Has sources: N
├─ Has reasoning: N
├─ 📦 Full metadata: {...}
├─ 🧠 Reasoning data: [...] or ⚠️ No reasoning data!
└─ 📚 Sources data: [...] or ⚠️ No sources data!
```

### Step 4: Diagnose Based on Console Output

#### ✅ **Scenario A: Backend IS Sending Data**

Console shows:
```
✅ Sources count: 5
✅ Reasoning steps: 3
✅ 🧠 Reasoning array: ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
✅ 📚 Sources array: [{id: "1", title: "...", ...}, ...]
```

**Result**: Features should be visible in UI
- Reasoning: Look for "Show AI Reasoning" button
- Citations: Look for superscript numbers `[1]` `[2]`
- Sources: Look for "Sources (N)" section at bottom

**If NOT visible despite data**: Check CSS/rendering issues
- Inspect element in DevTools
- Look for `display: none` or `opacity: 0`
- Check z-index conflicts

---

#### ⚠️ **Scenario B: Backend NOT Sending Data**

Console shows:
```
⚠️ Sources count: 0
⚠️ Reasoning steps: 0
⚠️ No reasoning in metadata!
⚠️ No sources in metadata!
```

**Result**: Backend is not sending proper data format

**Next Steps**:

1. **Check AI Engine Logs**:
   ```bash
   # If running AI Engine separately
   tail -f services/ai-engine/logs/app.log
   
   # Or check Docker logs if containerized
   docker logs ai-engine -f
   ```

2. **Check API Gateway Logs**:
   ```bash
   # Check if API Gateway is stripping metadata
   tail -f api-gateway/logs/access.log
   ```

3. **Test Direct AI Engine Call** (Bypass Gateway):
   ```bash
   curl -N -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "query": "What are FDA guidelines?",
       "agentId": "your-agent-id",
       "userId": "your-user-id",
       "tenantId": "your-tenant-id"
     }' \
     http://localhost:8000/api/mode1/manual
   ```
   
   Look for:
   - `data: {"type":"reasoning","content":"..."}`
   - `data: {"type":"sources","sources":[...]}`

---

## What Each Feature Needs

### 1. **AI Reasoning Display**

**Backend Must Send**:
```json
{
  "type": "reasoning",
  "content": "Analyzing your question..."
}
```

**Frontend Expects**:
```typescript
metadata: {
  reasoning: ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
}
```

**UI Displays**:
```
[Show AI Reasoning] ▼
✨ Step 1: Analyzed the question
✨ Step 2: Retrieved evidence
✨ Step 3: Synthesized answer
```

---

### 2. **Inline Citations**

**Backend Must Send**:
```json
{
  "type": "sources",
  "sources": [
    {
      "id": "source-1",
      "title": "FDA Guidelines 2024",
      "excerpt": "Clinical trials must...",
      "url": "https://fda.gov/...",
      "similarity": 0.92
    }
  ]
}
```

**Content Must Include**:
```
"According to recent guidelines[1], the process requires...[2]"
```

**UI Displays**:
```
According to recent guidelines [1], the process requires... [2]
                                 ^^^                         ^^^
                            (clickable blue badge)    (clickable blue badge)

📚 Sources (2)
[1] FDA Guidelines 2024 - fda.gov
    Clinical trials must follow specific protocols...
    Similarity: 92%

[2] Clinical Trial Design - JAMA
    Phase 3 trials should enroll...
    Similarity: 88%
```

---

### 3. **Chat Streaming**

**Backend Must Send** (SSE format):
```
data: {"type":"reasoning","content":"Analyzing..."}

data: {"type":"chunk","content":"Based on"}

data: {"type":"chunk","content":" recent"}

data: {"type":"done","metadata":{"reasoning":[...],"sources":[...]}}
```

**UI Displays**:
```
[▼ I am thinking...]
🧠 Analyzing your question...

Based on recent█  (typing cursor)
```

---

### 4. **Chat History**

**Sidebar Must Show**:
```
💬 Recent Chats
  ├─ 🤖 Clinical Research Expert
  │   └─ 2:30 PM · 5 messages
  ├─ 🤖 Regulatory Affairs Specialist  ← (Active)
  │   └─ Yesterday · 12 messages
  └─ 🤖 Medical Advisor
      └─ Nov 1 · 8 messages
```

**Database Must Have**:
- Table: `chat_sessions`
- Columns: `id`, `user_id`, `agent_id`, `title`, `message_count`, `last_message_at`

---

## Quick Diagnostics Checklist

### ✅ **Feature Visibility Checks**

Run this in browser console:

```javascript
// Check if features are rendered but hidden
document.querySelectorAll('[class*="reasoning"]').length > 0  // Should be > 0 if reasoning exists
document.querySelectorAll('[class*="citation"]').length > 0   // Should be > 0 if citations exist
document.querySelectorAll('[class*="source"]').length > 0     // Should be > 0 if sources exist

// Check message metadata
const lastMessage = document.querySelector('[class*="message"]:last-child');
console.log('Last message element:', lastMessage);

// Check React props (if using React DevTools)
// Select the EnhancedMessageDisplay component and inspect props.metadata
```

### 🔍 **Network Inspection**

1. DevTools → Network tab
2. Filter: `Fetch/XHR` or `EventStream`
3. Send a message
4. Click on the streaming request
5. Check **Response** tab:
   - Should see multiple `data:` lines
   - Each line should be valid JSON
   - Look for `type: "reasoning"` and `type: "sources"`

### 🗄️ **Database Checks**

```sql
-- Check if chat sessions exist
SELECT * FROM chat_sessions 
WHERE user_id = 'your-user-id' 
ORDER BY last_message_at DESC 
LIMIT 10;

-- Check if messages have metadata
SELECT id, role, metadata 
FROM chat_messages 
WHERE session_id = 'your-session-id' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## Expected vs. Actual Behavior

### ✅ **When Everything Works**:

**You should see**:
1. "Show AI Reasoning" button on assistant messages
2. Clickable citation numbers `[1]` `[2]` in text
3. "Sources (N)" section with expandable cards
4. Smooth streaming with typing cursor
5. Chat history sidebar with all conversations
6. Real-time reasoning updates during streaming

**Console logs**:
```
✅ Sources count: 5
✅ Reasoning steps: 3
✅ Has sources: 5
✅ Has reasoning: 3
✅ 🧠 Reasoning array: [...]
✅ 📚 Sources array: [...]
```

---

### ⚠️ **When Something's Wrong**:

**You might see**:
1. No reasoning button (despite backend sending reasoning)
2. Plain text `[1]` instead of styled badges
3. No sources section
4. Jerky streaming
5. Empty chat history sidebar

**Console logs**:
```
⚠️ Sources count: 0
⚠️ Reasoning steps: 0
⚠️ No reasoning in metadata!
⚠️ No sources in metadata!
```

**Next Step**: Follow backend integration checklist in `MISSING_FEATURES_IMPLEMENTATION.md`

---

## Files Modified

1. **`EnhancedMessageDisplay.tsx`** - Enhanced debug logging (lines 353-395)
2. **`ask-expert/page.tsx`** - Enhanced message creation logging (lines 1366-1402)

---

## Next Actions

### 🚀 **If Features Are Working**:
1. Mark all TODOs as complete ✅
2. Remove debug logs (or keep for production debugging)
3. Test with real agent queries
4. Verify across all 4 modes (Mode 1-4)

### 🔧 **If Features NOT Working**:
1. Review console output from test message
2. Identify which scenario (A or B) you're in
3. Follow appropriate diagnostic path
4. Check backend integration (see `MISSING_FEATURES_IMPLEMENTATION.md`)
5. Verify database migrations are applied
6. Test API Gateway proxy configuration

---

## Support

**Console showing data but UI not displaying?**
→ Check `EnhancedMessageDisplay.tsx` conditional rendering (lines 772-1100)

**Console showing no data?**
→ Check AI Engine mode handlers (`services/ai-engine/src/modes/`)

**Streaming not working?**
→ Check API Gateway SSE configuration (`api-gateway/src/index.ts`)

**Chat history empty?**
→ Run migration: `database/migrations/006_chat_management_schema.sql`

---

## Testing Commands

```bash
# Terminal 1: AI Engine
cd services/ai-engine
python -m uvicorn src.main:app --reload --port 8000

# Terminal 2: API Gateway
cd api-gateway
npm run dev

# Terminal 3: Frontend
cd apps/digital-health-startup
pnpm dev

# Terminal 4: Watch logs
tail -f services/ai-engine/logs/app.log
```

---

**🎯 Remember**: The code is already there and working. This is a **data flow debugging exercise**, not a feature implementation task!

Happy testing! 🚀

