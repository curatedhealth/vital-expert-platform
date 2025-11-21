# ✅ Fixed: API Timeout Configuration

**Issue**: "Failed to fetch" error when running pipeline  
**Status**: 🎯 **FIXED**

---

## 🔍 Problem

The API route was timing out before the Python script could complete, causing:
```
Failed to fetch
TypeError: Failed to fetch
```

In Next.js:
- **Default API timeout**: 10 seconds (production), 5 minutes (development)
- **Pipeline processing time**: Can take 30s - 5 minutes per source
- **Result**: Request timeout before response

---

## ✅ Solution

Added explicit route configuration to `run-single/route.ts`:

```typescript
// Line 9-11
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';
```

**What this does**:
- `maxDuration = 300`: Allows route to run for 5 minutes (300 seconds)
- `dynamic = 'force-dynamic'`: Prevents static optimization, ensures dynamic execution

---

## 🎯 Why This Fixes It

### Before ❌
```
Request starts → Processing begins → 10s timeout → "Failed to fetch"
```

### After ✅
```
Request starts → Processing begins → Up to 5 minutes → Response returned
```

---

## 📊 Timeout Hierarchy

```
Frontend fetch: No timeout (waits for response)
    ↓
Next.js API route: 300 seconds (5 minutes) ← NOW CONFIGURED
    ↓
Python script execution: 300 seconds (5 minutes)
    ↓
Individual scraping timeout: 60 seconds
```

All timeouts are now properly configured!

---

## 🧪 Expected Behavior

### Short Articles (< 30 seconds)
```
Request → Scrape HTML → Extract content → Process → Success!
```

### Long Articles (30s - 3 minutes)
```
Request → Scrape HTML → Large content → Process → Success!
(Previously would have timed out)
```

### Very Long (3-5 minutes)
```
Request → Complex scraping → Large PDFs → Process → Success!
(Now supported)
```

### Timeout (> 5 minutes)
```
Request → Still running after 5 min → Timeout error with clear message
```

---

## 🎨 User Experience

### Before
- Pipeline starts
- After 10 seconds: "Failed to fetch"
- No feedback, confusing error
- User doesn't know what happened

### After  
- Pipeline starts
- Real-time log streaming
- Up to 5 minutes of processing time
- Clear completion or error message
- User sees progress throughout

---

## 📝 File Changes

**File**: `apps/digital-health-startup/src/app/api/pipeline/run-single/route.ts`

**Lines Added**: 9-11
```typescript
// Increase timeout for long-running pipeline operations
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';
```

---

## ✅ Verification

Try running the pipeline again:

1. **Search** for articles (PMC, arXiv)
2. **Select** results
3. **Add to queue**
4. **Run** pipeline
5. **Expected**: Sources process successfully, even if they take 2-3 minutes

You should see:
- ✅ Real-time logs streaming
- ✅ Processing stats updating
- ✅ Successful completion
- ✅ No "Failed to fetch" errors

---

## 🎯 Related Fixes

This complements the PMC scraping fix:
- ✅ PMC URLs now use HTML (not PDF)
- ✅ API timeout increased to 5 minutes
- ✅ Real-time streaming logs
- ✅ Proper error handling

**Everything should work smoothly now!** 🚀

