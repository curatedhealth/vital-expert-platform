# Virtual Advisory Board - Testing & Setup Guide

## ⚠️ Important: Clean Up Background Processes

You currently have **40+ background Node.js processes** running. This is consuming significant system resources.

### Kill All Background Processes

```bash
# Method 1: Kill all node processes
killall -9 node

# Method 2: Kill specific ports
lsof -ti:3000,3001,3002 | xargs kill -9

# Method 3: Find and kill manually
ps aux | grep node | grep -v grep | awk '{print $2}' | xargs kill -9
```

---

## 🚀 Start Clean Development Server

```bash
# 1. Navigate to project
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# 2. Clean build artifacts
rm -rf .next node_modules/.cache .swc

# 3. Start dev server on port 3000
PORT=3000 npm run dev
```

---

## 🔑 Environment Setup for LLM Testing

### Required Environment Variables

Create or update `.env.local`:

```bash
# OpenAI API Key (Required for LangGraph orchestration)
OPENAI_API_KEY=sk-...your-key-here...

# Optional: LangSmith for debugging (recommended)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-key
LANGCHAIN_PROJECT=vital-advisory-board

# Supabase (if using database features)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Check Current Environment

```bash
# Check if OPENAI_API_KEY is set
cat .env.local | grep OPENAI_API_KEY

# If not set, add it
echo "OPENAI_API_KEY=sk-your-key-here" >> .env.local
```

---

## 🧪 Testing the Virtual Advisory Board

### Test 1: Pattern Library

1. **Access**: http://localhost:3000/patterns
2. **Expected**:
   - See 4 built-in patterns (Parallel, Sequential, Debate, Funnel)
   - Pattern Builder tab with node buttons
   - Visual workflow graphs

### Test 2: Ask Panel (Manual Board Setup)

1. **Access**: http://localhost:3000/ask-panel
2. **Flow**:
   ```
   Select Archetype (e.g., "Market Access Board")
   ↓
   Select Fusion Model (e.g., "Symbiotic")
   ↓
   Select Domain (e.g., "Market Access")
   ↓
   Select Subdomain (e.g., "Pricing & Reimbursement")
   ↓
   Select Use Case (e.g., "Pricing Strategy Development")
   ↓
   Auto-selected experts appear
   ↓
   Choose Orchestration Mode (e.g., "Parallel Polling")
   ↓
   Enter question: "What pricing strategy should we use for launch?"
   ↓
   Click "Ask Panel"
   ```

3. **Expected Response**:
   ```json
   {
     "success": true,
     "response": "# Panel Recommendation\n\n## Consensus\n- ...",
     "metadata": {
       "mode": "parallel",
       "expertResponses": [
         {
           "expertName": "Market Access Strategist",
           "content": "...",
           "confidence": 0.85
         }
       ]
     }
   }
   ```

### Test 3: API Testing (Direct)

```bash
# Test orchestration API endpoint
curl -X POST http://localhost:3000/api/panel/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Should we pursue FDA 510(k) or De Novo pathway?",
    "panel": {
      "id": "test_panel_1",
      "members": [
        {
          "agent": {
            "id": "1",
            "name": "FDA Regulatory Expert",
            "description": "Expert in FDA submissions"
          },
          "role": "expert",
          "weight": 1.2
        },
        {
          "agent": {
            "id": "2",
            "name": "Clinical Research Director",
            "description": "Clinical trials expert"
          },
          "role": "expert",
          "weight": 1.0
        }
      ]
    },
    "mode": "parallel"
  }'
```

### Test 4: Automatic Board Composition

```typescript
// In browser console or Node.js
const testAutoCompose = async () => {
  const response = await fetch('/api/board/compose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: "How should we approach FDA approval for our diabetes device?"
    })
  });

  const result = await response.json();
  console.log('Composed Board:', result);
};

testAutoCompose();
```

---

## 🐛 Troubleshooting

### Issue 1: "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue 3: LangGraph/OpenAI errors

**Error**: `Error: OpenAI API key not configured`

**Solution**:
```bash
# Check if .env.local exists
ls -la .env.local

# Add OpenAI key
echo "OPENAI_API_KEY=sk-your-actual-key" >> .env.local

# Restart server
```

### Issue 4: Stale cache

```bash
# Nuclear option: clean everything
rm -rf .next node_modules/.cache .swc node_modules
npm install
npm run dev
```

---

## 📊 Monitoring & Debugging

### Check LangGraph Execution

If `LANGCHAIN_TRACING_V2=true` is set:

1. Go to https://smith.langchain.com
2. Select project: "vital-advisory-board"
3. View execution traces with visual graph

### Console Logging

Check browser console and terminal for:

```bash
# Terminal output
🎭 LangGraph Panel Orchestration API Request
📋 Message: Should we pursue FDA 510(k)...
👥 Panel Members: 2
🎯 Mode: parallel
[Round 1] Consulting 2 experts in parallel...
  ✓ FDA Regulatory Expert responded
  ✓ Clinical Research Director responded
✅ LangGraph panel orchestration completed
📊 Expert responses: 2
```

### Database Queries (if using Supabase)

```sql
-- Check board sessions
SELECT * FROM board_session
ORDER BY created_at DESC
LIMIT 10;

-- Check expert replies
SELECT * FROM board_reply
WHERE session_id = 'your-session-id';

-- Check synthesis results
SELECT * FROM board_synthesis
WHERE session_id = 'your-session-id';
```

---

## ✅ Validation Checklist

Before considering the system "working":

- [ ] Development server starts without errors
- [ ] http://localhost:3000/ask-panel loads
- [ ] http://localhost:3000/patterns loads
- [ ] Can select archetype → fusion model → domain
- [ ] Experts auto-populate when selecting use case
- [ ] Orchestration mode selector shows 7 modes
- [ ] Can enter question and click "Ask Panel"
- [ ] API call to `/api/panel/orchestrate` succeeds
- [ ] Response includes `synthesis.summaryMd`
- [ ] Expert responses have `persona`, `text`, `confidence`
- [ ] No console errors in browser
- [ ] No 500 errors in terminal

---

## 🎯 Sample Test Questions

### Quick Tests (Simple Responses)

1. "What are the key regulatory considerations for our product?"
2. "Should we prioritize payer negotiations or patient access?"
3. "What market access barriers should we anticipate?"

### Complex Tests (Multi-Round Discussion)

Use **Debate mode** for these:

1. "Should we launch now with limited data or wait 6 months for more evidence?"
2. "What pricing strategy balances profitability with patient access?"
3. "FDA 510(k) vs De Novo pathway - which is better for our AI diagnostic tool?"

### Funnel & Filter Tests

Use **Funnel mode** for these:

1. "What are all factors influencing our product launch success?"
2. "Analyze the complete regulatory, clinical, and market landscape"

---

## 📈 Performance Expectations

### Response Times

- **Parallel mode**: ~15-30 seconds (2-4 experts)
- **Sequential mode**: ~30-60 seconds (builds on responses)
- **Debate mode**: ~45-90 seconds (multi-round)
- **Funnel mode**: ~60-120 seconds (breadth + depth)

### LLM Token Usage (Approximate)

- **Per Expert Response**: ~500-1000 tokens
- **Panel of 5 experts**: ~5,000-10,000 tokens
- **With debate (3 rounds)**: ~15,000-30,000 tokens

**Cost Estimate** (GPT-4 Turbo):
- Input: $0.01 / 1K tokens
- Output: $0.03 / 1K tokens
- **Average panel**: $0.20 - $0.50 per consultation

---

## 🔗 Quick Links

- **Ask Panel**: http://localhost:3000/ask-panel
- **Pattern Library**: http://localhost:3000/patterns
- **Documentation**:
  - [IMPLEMENTATION_COMPLETE_SUMMARY.md](IMPLEMENTATION_COMPLETE_SUMMARY.md)
  - [VAB_IMPLEMENTATION_ROADMAP.md](VAB_IMPLEMENTATION_ROADMAP.md)
  - [LANGGRAPH_IMPLEMENTATION_SUMMARY.md](LANGGRAPH_IMPLEMENTATION_SUMMARY.md)

---

## 🆘 Getting Help

If you encounter issues:

1. Check terminal output for errors
2. Check browser console for errors
3. Verify `.env.local` has `OPENAI_API_KEY`
4. Kill all node processes and restart
5. Clear build cache and reinstall dependencies
6. Check [TROUBLESHOOTING.md] for common issues

**Your Virtual Advisory Board system is ready to test!** 🚀
