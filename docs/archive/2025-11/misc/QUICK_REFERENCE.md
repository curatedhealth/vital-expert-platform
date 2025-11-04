# Quick Reference: Testing Your Features 🎯

## 🚀 Start Here (30 seconds)

1. Open: `http://localhost:3000/ask-expert`
2. Press `F12` (open console)
3. Send: "What are FDA guidelines for clinical trials?"
4. Watch console for these logs:

```
📝 [AskExpert] Creating Assistant Message
🎨 [EnhancedMessageDisplay] Rendering message
```

---

## ✅ Success Looks Like:

### Console Shows:
```javascript
✅ Sources count: 5          // Backend sent sources
✅ Reasoning steps: 3        // Backend sent reasoning
✅ 🧠 Reasoning array: [...]  // Array with steps
✅ 📚 Sources array: [...]    // Array with sources
```

### UI Shows:
- **[Show AI Reasoning]** button ← Click to expand
- **[1] [2] [3]** ← Superscript citation numbers
- **📚 Sources (3)** ← Source cards at bottom
- **Smooth streaming** ← No jumps/flickers
- **Chat in sidebar** ← History updates

---

## ⚠️ Problem Looks Like:

### Console Shows:
```javascript
⚠️ Sources count: 0
⚠️ Reasoning steps: 0
⚠️ No reasoning in metadata!
⚠️ No sources in metadata!
```

### Fix:
→ Backend is not sending data in correct format
→ See: `MISSING_FEATURES_IMPLEMENTATION.md` Section "Backend Integration Checklist"

---

## 🔧 Quick Fixes

### Feature Not Visible Despite Data:

```javascript
// Check if element exists but hidden
document.querySelectorAll('[class*="reasoning"]').forEach(el => {
  console.log('Reasoning element:', el);
  console.log('Display:', window.getComputedStyle(el).display);
  console.log('Opacity:', window.getComputedStyle(el).opacity);
});
```

### Force Show Reasoning (Testing Only):

Edit `EnhancedMessageDisplay.tsx` line 772:
```typescript
// Change from:
{!isUser && metadata?.reasoning && metadata.reasoning.length > 0 && (

// To (TESTING ONLY):
{!isUser && (
```

### Mock Data (Testing Only):

Edit `ask-expert/page.tsx` line 1338:
```typescript
reasoning: reasoning.length > 0 ? reasoning : [
  "🧪 TEST: Analyzed the question",
  "🧪 TEST: Retrieved 5 sources",
  "🧪 TEST: Synthesized answer"
],
sources: sources.length > 0 ? sources : [
  {
    id: "test-1",
    title: "Test Source",
    excerpt: "This is a test citation",
    url: "https://example.com",
    similarity: 0.95
  }
]
```

---

## 📊 What Each Log Means:

| Log | Meaning | Action |
|-----|---------|--------|
| `✅ Sources count: 5` | Backend sent sources | Features should work |
| `⚠️ Sources count: 0` | No sources from backend | Check AI Engine |
| `✅ Reasoning array: [...]` | Reasoning data present | Should see button |
| `⚠️ No reasoning in metadata!` | Missing reasoning | Check streaming parser |
| `📦 Full metadata: {...}` | Complete metadata object | Inspect structure |

---

## 🎯 Feature Checklist

Test each feature:

### 1. AI Reasoning ✨
- [ ] Button appears: "Show AI Reasoning"
- [ ] Click to expand
- [ ] See multiple steps with ✨ icon
- [ ] Click to collapse

### 2. Inline Citations 🔗
- [ ] Numbers appear as superscript: [1] [2]
- [ ] Numbers are blue and clickable
- [ ] Hover shows tooltip
- [ ] Click scrolls to source card

### 3. Sources Section 📚
- [ ] "Sources (N)" header appears
- [ ] Source cards show title, excerpt
- [ ] Similarity percentage visible
- [ ] Cards expand on click

### 4. Chat Streaming 🌊
- [ ] Reasoning updates in real-time
- [ ] Content appears progressively
- [ ] Typing cursor at end
- [ ] No flickering

### 5. Chat History 📂
- [ ] Sidebar shows past chats
- [ ] Click chat to load
- [ ] New chat button works
- [ ] Message counts accurate

---

## 🔍 Debug Commands

### Check Message Data:
```javascript
// Get last assistant message
const messages = document.querySelectorAll('[role="article"]');
const lastMsg = messages[messages.length - 1];
console.log('Last message:', lastMsg);

// Find React props (with React DevTools)
$r.props.metadata
```

### Check Network:
```bash
# DevTools → Network → Filter: Fetch/XHR
# Look for: /api/mode1/manual or similar
# Check Response tab for:
data: {"type":"reasoning","content":"..."}
data: {"type":"sources","sources":[...]}
```

### Check Database:
```sql
-- Recent sessions
SELECT * FROM chat_sessions 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY last_message_at DESC 
LIMIT 5;

-- Recent messages
SELECT role, metadata->'reasoning', metadata->'sources'
FROM chat_messages
WHERE session_id = 'YOUR_SESSION_ID'
ORDER BY created_at DESC
LIMIT 3;
```

---

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| `ALL_FEATURES_COMPLETE.md` | Feature status & summary |
| `MISSING_FEATURES_IMPLEMENTATION.md` | Detailed implementation guide |
| `TESTING_GUIDE_ENHANCED_DEBUG.md` | Step-by-step testing |
| `QUICK_REFERENCE.md` | This file - quick lookup |

---

## 🆘 Emergency Troubleshooting

### Nothing works at all:

1. Check all services running:
```bash
# AI Engine (port 8000)
curl http://localhost:8000/health

# API Gateway (port 3001)
curl http://localhost:3001/health

# Frontend (port 3000)
curl http://localhost:3000
```

2. Restart everything:
```bash
# Kill all
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# Restart
cd services/ai-engine && python -m uvicorn src.main:app --reload --port 8000 &
cd api-gateway && npm run dev &
cd apps/digital-health-startup && pnpm dev &
```

3. Hard refresh browser:
- Mac: `Cmd+Shift+R`
- Windows: `Ctrl+Shift+F5`

---

## ✅ Done Checklist

Before marking complete:

- [ ] All console logs show ✅ not ⚠️
- [ ] All 5 features visible in UI
- [ ] Tested with real agent query
- [ ] Chat history populates
- [ ] No errors in console
- [ ] Backend logs look good

---

## 🎉 Success!

**When all features work:**
1. Remove mock data (if added)
2. Keep or remove debug logs
3. Test across different agents
4. Verify all 4 modes (Mode 1-4)
5. Deploy to staging/production

---

**Need help?** Check the detailed guides:
- Backend issues → `MISSING_FEATURES_IMPLEMENTATION.md`
- Testing steps → `TESTING_GUIDE_ENHANCED_DEBUG.md`
- Feature details → `ALL_FEATURES_COMPLETE.md`

**Remember**: Code is ready. Just ensuring data flows correctly! 🚀

