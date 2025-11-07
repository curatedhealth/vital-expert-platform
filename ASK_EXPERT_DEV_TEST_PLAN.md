# ASK EXPERT DEV MODE TESTING PLAN

**Date**: November 5, 2025
**Goal**: Verify Ask Expert works in `npm run dev` before tackling build
**Status**: Ready to test

---

## ✅ CHANGES COMPLETED

### 1. ioredis Removal (DONE)
- ✅ Removed `redisCacheService` import from `unified-rag-service.ts`
- ✅ Replaced Redis cache with in-memory Map
- ✅ Updated cache check logic
- ✅ Updated getHealthStatus()
- ✅ Updated clearCache()
- ✅ All redis references removed

**Files Changed**:
- `apps/digital-health-startup/src/lib/services/rag/unified-rag-service.ts`

**Commits**:
- `dd68db3e` - Initial ioredis removal
- `[latest]` - Complete ioredis removal

---

## 🧪 DEV MODE TEST PLAN

### Step 1: Start Dev Server
```bash
cd apps/digital-health-startup
npm run dev
```

**Expected**: Server starts without errors
**Check for**: No module resolution errors for `ioredis`, `dns`, `net`, `tls`

### Step 2: Navigate to Ask Expert
```bash
# Open in browser:
http://localhost:3000/ask-expert
```

**Expected**: Page loads successfully
**Check for**:
- ✅ No console errors
- ✅ No hydration errors  
- ✅ UI renders correctly
- ✅ Prompt input visible
- ✅ Agent selection works

### Step 3: Send Test Query
**Action**: Send a simple query like "What are FDA regulations?"

**Expected Flow**:
1. Query sent to `/api/ask-expert`
2. Budget check passes (or gracefully degrades)
3. RAG retrieves context (using in-memory cache)
4. AI generates response
5. Streaming works
6. Citations display

**Check for**:
- ✅ No runtime errors
- ✅ Response streams back
- ✅ Citations appear
- ✅ Cache logs show "in-memory"

### Step 4: Verify Cache Works
**Action**: Send the same query twice

**Expected**:
- First query: Pinecone search + OpenAI call (~2-5 seconds)
- Second query: Cache hit (~50-100ms)

**Console logs should show**:
```
First query:
🔍 Retrieving context from knowledge base...
✅ Retrieved 5 relevant sources using Pinecone

Second query:  
📦 Returning in-memory cached result
✅ Cache HIT
```

### Step 5: Test Agent Selection
**Action**: Toggle between automatic/manual agent selection

**Expected**:
- Automatic: System selects best agent
- Manual: User picks agent from list

**Note**: Agent selector service still uses Pinecone (server-only)
- This is OK for dev mode (runs on server)
- Will need API route for production build

---

## 🚨 KNOWN ISSUES (To Fix After Dev Works)

### Issue #1: agent-selector-service (Build blocker, not dev)
**File**: `src/features/chat/services/agent-selector-service.ts`
**Problem**: Uses Pinecone SDK (server-only)
**Impact**: Dev mode ✅ works, Build ❌ fails
**Fix**: Create `/api/agents/select` endpoint (LATER)

### Issue #2: Duplicate Ask Expert pages
**Files**:
- `/app/(app)/ask-expert/page.tsx` ✅ PRIMARY
- `/app/(app)/ask-expert/beta/page.tsx`
- `/app/(app)/ask-expert/page-complete.tsx`
- `/app/(app)/ask-expert/page-modern.tsx`
- `/app/(app)/ask-expert-copy/page.tsx`

**Fix**: Delete duplicates (LATER)

### Issue #3: Missing 'use client' directives
**File**: `contexts/ask-expert-context.tsx`
**Problem**: Context provider without 'use client'
**Impact**: May cause hydration errors
**Fix**: Add directive (QUICK FIX if needed)

---

## 📝 TEST CHECKLIST

### Core Functionality
- [ ] Dev server starts without errors
- [ ] /ask-expert page loads
- [ ] No console errors on load
- [ ] Can send a message
- [ ] Response streams back
- [ ] Citations display correctly
- [ ] Cache works (2nd query faster)

### Agent Selection
- [ ] Automatic mode works
- [ ] Manual mode works
- [ ] Can switch between modes
- [ ] Agent avatar displays

### RAG System
- [ ] Pinecone search works
- [ ] Supabase metadata enrichment works
- [ ] In-memory cache works
- [ ] Cache size limits work (prevents memory leaks)

### Error Handling
- [ ] Invalid query handled gracefully
- [ ] Network errors handled
- [ ] Missing agent handled
- [ ] Budget exceeded handled

---

## 🎯 SUCCESS CRITERIA

**Definition of "Dev Mode Works"**:
1. ✅ Server starts (`npm run dev`)
2. ✅ Page loads without errors
3. ✅ Can send query and get response
4. ✅ Streaming works
5. ✅ Cache improves performance
6. ✅ No browser console errors

**If all above pass** → Move to build fixes

---

## 📊 PERFORMANCE EXPECTATIONS

### Without Cache (First Query)
- Embedding generation: 100-200ms
- Pinecone search: 500-1000ms  
- OpenAI response: 1000-3000ms
- **Total**: 2-5 seconds

### With Cache (Subsequent Queries)
- Cache lookup: 1-5ms
- **Total**: 50-100ms
- **Improvement**: 20-100x faster ⚡

---

## 🔄 NEXT STEPS AFTER DEV WORKS

### Phase 1: Core Fixes (DONE)
- ✅ Remove ioredis

### Phase 2: Dev Mode Testing (NOW)
- ⏳ Start dev server
- ⏳ Test Ask Expert flow
- ⏳ Verify cache works
- ⏳ Check console for errors

### Phase 3: Cleanup (LATER)
- [ ] Delete duplicate pages
- [ ] Add 'use client' directives
- [ ] Fix TypeScript errors

### Phase 4: Build Fixes (LATER)
- [ ] Move agent-selector to API route
- [ ] Fix Next.js 16 params Promise issues
- [ ] Get `npm run build` working

---

## 🚀 READY TO TEST!

**Commands**:
```bash
# Terminal 1: Start dev server
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/apps/digital-health-startup
npm run dev

# Terminal 2: Watch logs
# (optional - for debugging)

# Browser:
# Open http://localhost:3000/ask-expert
# Send a test query
# Check console for errors
```

**What to look for**:
- ✅ GREEN: No errors in terminal
- ✅ GREEN: Page loads in browser  
- ✅ GREEN: Can send messages
- ✅ GREEN: Responses stream back
- ❌ RED: Any console errors → report them

---

**LET'S TEST! 🧪**

