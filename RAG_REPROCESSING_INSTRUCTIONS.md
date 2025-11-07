# RAG Document Reprocessing - Instructions

**Date:** 2025-01-05  
**Status:** ⚠️ **AWAITING SERVICE ROLE KEY**

---

## Issue

The script needs `SUPABASE_SERVICE_ROLE_KEY` for write operations (inserting chunks, updating document status).

**Current Status:**
- ✅ Environment variables loaded from `.env.local`
- ✅ `SUPABASE_URL` mapped from `NEXT_PUBLIC_SUPABASE_URL`
- ❌ `SUPABASE_SERVICE_ROLE_KEY` is set to `"your_actual_key"` (placeholder)

---

## Solution

You need to set the actual `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file.

### 1. **Get Service Role Key from Supabase Dashboard**

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project: `xazinxsiglqokwfmogyk`
3. Go to **Settings** → **API**
4. Copy the **`service_role`** key (not the `anon` key)
5. **⚠️ WARNING:** Service role key bypasses RLS (Row Level Security)
   - Keep it secret and never commit it to git
   - Only use it for server-side operations

### 2. **Update `.env.local`**

```bash
# Replace the placeholder with your actual service role key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

**Example:**
```bash
# Before (placeholder)
SUPABASE_SERVICE_ROLE_KEY=your_actual_key

# After (actual key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.actual_key_here
```

### 3. **Verify `.env.local` is in `.gitignore`**

Make sure `.env.local` is not committed to git:

```bash
# Check if .env.local is in .gitignore
grep -E "\.env\.local|\.env" .gitignore
```

If not, add it:
```bash
echo ".env.local" >> .gitignore
```

---

## Alternative: Read-Only Mode (Not Recommended)

If you only have the `anon` key, you can use it for read-only operations, but:

**Limitations:**
- ❌ Cannot insert chunks into `document_chunks` table
- ❌ Cannot update document status
- ❌ Cannot update `domain_id` in documents
- ✅ Can read documents and domain mappings

**To use anon key (read-only):**
```bash
# The script will automatically use anon key as fallback
# But it will fail on write operations
```

---

## After Setting Service Role Key

### 1. **Run the Script**

```bash
cd services/ai-engine/src
python3 scripts/reprocess_documents.py --domains "Digital Health" "Regulatory Affairs"
```

### 2. **Expected Output**

```
✅ Environment variables loaded from .env.local
✅ Mapped NEXT_PUBLIC_SUPABASE_URL to SUPABASE_URL
🚀 Starting document reprocessing
📋 Configuration: chunk_size=1000, chunk_overlap=200, batch_size=10
✅ Supabase REST client initialized
✅ Domain mapping loaded
✅ Documents retrieved: count=27
📄 Processing document 1/27 ...
📦 Document abc123 chunked: chunks=15, domain=Digital Health
✅ Chunks inserted for document abc123: total_chunks=15
✅ Document abc123 processed successfully
...
✅ Document reprocessing completed: total=27, successful=27, failed=0
```

### 3. **Verify Results**

```sql
-- Check chunks created
SELECT 
    d.domain,
    COUNT(DISTINCT d.id) as document_count,
    COUNT(DISTINCT c.id) as chunk_count,
    COUNT(DISTINCT CASE WHEN c.embedding IS NOT NULL THEN c.id END) as chunks_with_embeddings
FROM knowledge_documents d
LEFT JOIN document_chunks c ON c.document_id = d.id
WHERE d.domain IN ('Digital Health', 'Regulatory Affairs')
GROUP BY d.domain;
```

---

## Security Notes

1. **Never commit service role key to git**
   - Service role key bypasses RLS (Row Level Security)
   - Anyone with the key has full database access
   - Keep it secret and secure

2. **Use service role key only for:**
   - Server-side operations (like this script)
   - Backend services (AI Engine)
   - Admin operations

3. **Use anon key for:**
   - Frontend applications
   - Client-side operations
   - Public API access

---

## Next Steps

1. ✅ Get `SUPABASE_SERVICE_ROLE_KEY` from Supabase dashboard
2. ✅ Update `.env.local` with actual key
3. ✅ Run the reprocessing script
4. ✅ Verify chunks and embeddings created
5. ✅ Test RAG queries (should return sources now)

---

## Troubleshooting

### Issue: "Invalid API key"

**Solution:**
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is the actual service role key (not placeholder)
- Check for extra spaces or quotes in `.env.local`
- Verify the key is correct in Supabase dashboard

### Issue: "Permission denied" or "RLS policy violation"

**Solution:**
- Make sure you're using `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_ANON_KEY`)
- Service role key bypasses RLS, so it should work
- If using anon key, you'll get RLS errors on writes

### Issue: "No documents found to process"

**Solution:**
- Check domain names match exactly (case-sensitive)
- Verify documents exist in `knowledge_documents` table
- Try `--all` to process all documents

---

## Files Modified

1. **`services/ai-engine/src/scripts/reprocess_documents.py`**
   - Added environment variable mapping
   - Added fallback to anon key (with warning)
   - Improved error messages

