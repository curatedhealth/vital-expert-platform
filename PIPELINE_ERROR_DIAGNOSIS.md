# 🔍 Pipeline Error Diagnosis - Environment Variables

**Issue**: Pipeline failing with "Unknown error" or "Missing environment variables"  
**Status**: 🔧 **DEBUGGING**

---

## 🎯 Current Error

```
❌ Missing required environment variables: SUPABASE_URL
```

---

## ✅ Fixes Applied

### 1. Enhanced Error Extraction
The API now captures:
- Missing environment variable errors (with helpful message)
- Scraping errors
- Any ERROR log lines
- Full stdout/stderr (first 5000 chars) for debugging

### 2. Better Error Messages
```typescript
// Before
errorDetails = stderr.substring(0, 200);

// After
if (stdout.includes('Missing required environment variables')) {
  errorDetails = `Missing environment variables: ${match[1]}. Check your .env.local file.`;
}
```

### 3. Full Diagnostic Output
The API now returns:
- `stdout`: First 5000 characters of Python output
- `stderr`: First 5000 characters of errors
- `errors`: Parsed human-readable error message

---

## 🔍 How to Diagnose

### Step 1: Check Environment Variables

**Required Variables in `.env.local`:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Pinecone
PINECONE_API_KEY=your-api-key
PINECONE_ENVIRONMENT=us-east-1-aws
```

### Step 2: Verify in Console

When you run the pipeline, the backend logs should show:
```
🔐 Environment variables:
  SUPABASE_URL: ✅ Set (https://xazinxsiglq...)
  SUPABASE_SERVICE_ROLE_KEY: ✅ Set
  PINECONE_API_KEY: ✅ Set
```

If you see `❌ Missing`, the environment variables aren't loaded.

### Step 3: Check Browser Console

The frontend now logs the full error:
```javascript
console.log(`  📝 Python stdout:`, result.stdout);
console.error(`  ⚠️ Python stderr:`, result.stderr);
```

This will show you exactly what the Python script is outputting.

---

## 🛠️ Troubleshooting Steps

### Issue: Environment Variables Missing

**Symptoms:**
- Error: "Missing required environment variables: SUPABASE_URL"
- Backend logs show: `❌ Missing`

**Solutions:**

1. **Check `.env.local` file exists** in `apps/digital-health-startup/`
   ```bash
   ls -la apps/digital-health-startup/.env.local
   ```

2. **Verify variable names** (must be exact):
   - `NEXT_PUBLIC_SUPABASE_URL` (not SUPABASE_URL alone)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_ENVIRONMENT`

3. **Restart Next.js server** after changing `.env.local`:
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

4. **Check variable is passed correctly**:
   The API maps: `NEXT_PUBLIC_SUPABASE_URL` → `SUPABASE_URL` for Python

---

## 🔄 What Happens Now

### Enhanced Error Flow

```
Python Script Runs
    ↓
❌ Missing environment variables: SUPABASE_URL
    ↓
API extracts error message
    ↓
Frontend receives detailed error:
{
  success: false,
  errors: "Missing environment variables: SUPABASE_URL. Check your .env.local file.",
  stdout: "... full log ...",
  stderr: "... error output ..."
}
    ↓
Frontend displays full error in console
```

---

## ✅ Next Steps

1. **Run the pipeline again** from the UI
2. **Check the browser console** for detailed error output
3. **Look for environment variable status** in backend logs
4. **Verify .env.local** has all required variables
5. **Restart server** if you changed environment variables

---

## 📝 Quick Fix Checklist

- [ ] `.env.local` file exists
- [ ] All 4 required variables are set
- [ ] Variable names are exactly correct
- [ ] Next.js server restarted after changes
- [ ] Browser console shows detailed error
- [ ] Backend logs show environment variable status

---

## 🎯 Expected Working Flow

When everything is configured correctly:

```
🔐 Environment variables:
  SUPABASE_URL: ✅ Set (https://xazinxsiglq...)
  SUPABASE_SERVICE_ROLE_KEY: ✅ Set
  PINECONE_API_KEY: ✅ Set

✅ RAG Service uploader initialized (standard mode)
🔄 Processing: The World Federation of ADHD...
✅ Uploaded successfully: 15 chunks, 5000 words
```

---

**The enhanced error logging should now show you exactly what's wrong!** 🔍

Check the browser console after running the pipeline to see the full diagnostic output.

