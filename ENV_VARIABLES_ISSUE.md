# 🔍 ISSUE FOUND: Missing Environment Variables

## ❌ **Root Cause**

The Python pipeline is failing because **SUPABASE_URL** environment variable is not being passed from the Next.js API to the Python script.

## 📋 **Evidence**

When testing the config file directly:
```bash
python3 knowledge-pipeline.py --config pipeline-single-XXX.json --dry-run

Error: ❌ Missing required environment variables: SUPABASE_URL
```

## 🔧 **Fix Required**

### Check 1: Verify `.env.local` exists

```bash
cat /Users/hichamnaim/Downloads/Cursor/VITAL\ path/apps/digital-health-startup/.env.local | grep SUPABASE
```

**Expected output:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### Check 2: Restart Next.js Server

If `.env.local` is correct, restart your Next.js dev server:
```bash
# In your Next.js terminal
# Press Ctrl+C to stop
# Then restart with:
npm run dev
# or
yarn dev
```

### Check 3: Check Next.js Console

After restarting and retrying a source, check your Next.js terminal for:
```
🔐 Environment variables: {
  SUPABASE_URL: '✅ Set (https://xazinxsiglqok...)',
  SUPABASE_SERVICE_ROLE_KEY: '✅ Set',
  PINECONE_API_KEY: '✅ Set'
}
```

## 🎯 **Quick Fix Steps**

1. **Open Terminal in Next.js app directory:**
   ```bash
   cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
   ```

2. **Check if `.env.local` exists:**
   ```bash
   ls -la .env.local
   ```

3. **If it doesn't exist, create it:**
   ```bash
   cat > .env.local << 'EOF'
   NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   PINECONE_API_KEY=your-pinecone-key-here
   PINECONE_ENVIRONMENT=us-east-1-aws
   EOF
   ```

4. **Restart Next.js:**
   - Stop the current dev server (Ctrl+C)
   - Start again: `npm run dev`

5. **Retry a source in the UI:**
   - Refresh browser
   - Go to Queue tab
   - Click retry on any failed source
   - Check Next.js terminal for env var logs

## 📊 **Expected Behavior After Fix**

### Before (Current):
```
❌ Failed after 12.3s
Error: Unknown error
(Actually: Missing SUPABASE_URL)
```

### After (Fixed):
```
✅ Success after 15.2s
3,245 words extracted
```

OR if there's a real scraping error:
```
❌ Failed after 23.5s
Error: Cannot connect to host www.bcg.com:443 [SSL error]
```

---

## 🚨 **IMPORTANT**

The environment variables MUST be set before starting Next.js. They are loaded once at startup, not dynamically.

**Steps:**
1. Ensure `.env.local` exists with correct values
2. Restart Next.js dev server
3. Retry sources
4. Check Next.js console logs for "🔐 Environment variables" message

---

**Once you fix the environment variables, all 13 sources should start working!** 🚀

