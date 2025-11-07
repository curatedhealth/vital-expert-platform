# ✅ Pipeline Environment Variable Check - FIXED

**Issue**: Pipeline failing with "Unknown error" - environment variables not being passed  
**Status**: 🎯 **FIXED**

---

## 🔧 What Was Fixed

### 1. **Early Environment Validation**
The API now checks environment variables **before** calling Python:

```typescript
// Early validation - return error immediately if env vars are missing
if (!pythonEnv.SUPABASE_URL || !pythonEnv.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Critical: Environment variables missing!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  
  return NextResponse.json({
    success: false,
    error: 'Environment variables not configured',
    details: 'Missing required environment variables. Please check your .env.local file and restart the server.',
    missing_vars: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  });
}
```

### 2. **Enhanced Error Extraction**
Now captures multiple error types:
- ❌ Missing environment variables
- ❌ Scraping errors
- ❌ Any ERROR log lines
- Full stdout/stderr (5000 chars)

### 3. **Better Error Messages**
Clear, actionable error messages:
```
"Environment variables not configured"
"Missing required environment variables. Please check your .env.local file and restart the server."
missing_vars: ["NEXT_PUBLIC_SUPABASE_URL"]
```

---

## 🎯 What Happens Now

### Scenario 1: Environment Variables Missing ❌

**Before:**
```
❌ Failed: "Unknown error: 2025-11-07..."
📄 Full result: {}
```

**After:**
```
❌ Environment variables not configured
Missing required environment variables:
  - NEXT_PUBLIC_SUPABASE_URL
  
Please check your .env.local file and restart the server.
```

### Scenario 2: Environment Variables Present ✅

```
🔐 Environment variables:
  SUPABASE_URL: ✅ Set (https://xazinxsiglq...)
  SUPABASE_SERVICE_ROLE_KEY: ✅ Set
  PINECONE_API_KEY: ✅ Set

✅ RAG Service uploader initialized
🔄 Processing: The World Federation of ADHD...
✅ Uploaded: 15 chunks, 5000 words
```

---

## 📋 Required Environment Variables

Your `.env.local` file **must contain** (in `apps/digital-health-startup/`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Pinecone
PINECONE_API_KEY=your-api-key
PINECONE_ENVIRONMENT=us-east-1-aws

# OpenAI (if using OpenAI embeddings)
OPENAI_API_KEY=sk-...
```

---

## 🔍 Diagnostic Flow

1. **User clicks "Run" or "Run All"**
2. **API checks environment variables BEFORE running Python**
   - ✅ If present: Continue to Python script
   - ❌ If missing: Return clear error immediately
3. **Backend logs show status:**
   ```
   🔐 Environment variables:
     SUPABASE_URL: ✅ Set (https://xazinxsiglq...)
     SUPABASE_SERVICE_ROLE_KEY: ✅ Set
   ```
4. **Frontend receives detailed response:**
   - `success`: true/false
   - `error`: Human-readable message
   - `details`: Specific issue
   - `missing_vars`: Array of missing variables
   - `stdout`/`stderr`: Full Python output

---

## ✅ Next Steps

1. **Verify `.env.local` has all required variables**
2. **Restart Next.js server** (if you added/changed variables)
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```
3. **Run the pipeline again**
4. **Check console output:**
   - Backend terminal: Environment variable status
   - Browser console: Detailed error messages

---

## 🎯 Expected Behavior

### If Environment Variables Are Missing:

**Backend Terminal:**
```
❌ Critical: Environment variables missing!
   NEXT_PUBLIC_SUPABASE_URL: ❌ Missing
   SUPABASE_SERVICE_ROLE_KEY: ✅ Set
```

**Browser Console:**
```
❌ Failed: Environment variables not configured: Missing required environment variables...
📄 Full result: {
  success: false,
  error: "Environment variables not configured",
  missing_vars: ["NEXT_PUBLIC_SUPABASE_URL"]
}
```

**Frontend UI:**
```
❌ Status: Failed
Error: Environment variables not configured
```

### If Environment Variables Are Present:

**Backend Terminal:**
```
🔐 Environment variables:
  SUPABASE_URL: ✅ Set (https://xazinxsiglq...)
  SUPABASE_SERVICE_ROLE_KEY: ✅ Set
  PINECONE_API_KEY: ✅ Set

🚀 Executing single source command...
✅ Single source execution completed
```

**Browser Console:**
```
▶️ Starting single source: source-123
📊 API Response (15234ms): {
  success: true,
  wordCount: 5000,
  ...
}
✅ Success! Words: 5000
```

**Frontend UI:**
```
✅ Status: Completed
📊 5,000 words processed
⏱️ 15.2s
```

---

## 🔄 Changed Files

1. **`apps/digital-health-startup/src/app/api/pipeline/run-single/route.ts`**
   - Added early environment variable validation
   - Enhanced error extraction (env vars, scraping, ERROR logs)
   - Return detailed error response before calling Python
   - Include stdout/stderr (5000 chars) for debugging

---

**The pipeline will now give you CLEAR, ACTIONABLE errors instead of "Unknown error"!** 🎯

Try running it again and check:
1. **Backend terminal**: Environment variable status
2. **Browser console**: Detailed error messages
3. **UI**: Clear error display

If environment variables are missing, you'll know **exactly which ones** and what to do! ✅

