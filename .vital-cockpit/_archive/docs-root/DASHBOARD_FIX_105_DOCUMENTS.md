# Dashboard Fix: 105 Documents Now Visible

## ✅ Issue Fixed

**Problem:** Analytics API was querying wrong tables (`rag_knowledge_sources`) instead of the tables used by uploads (`knowledge_documents`).

**Solution:** Updated both analytics and documents API routes to query the correct tables.

---

## 📊 Current Status

**What's in Database:**
- ✅ **105 documents** in `knowledge_documents` table
- ❌ **0 chunks** in `document_chunks` table (processing failing)
- ✅ Documents have content (text extraction working)
- ⚠️ Most documents have `status: 'failed'` (processing step failing)

---

## 🔧 Changes Made

### 1. Analytics API (`/api/knowledge/analytics`)
- ✅ Changed from `rag_knowledge_sources` → `knowledge_documents`
- ✅ Changed from `rag_knowledge_chunks` → `document_chunks`
- ✅ Fixed field mappings (source_id → document_id)
- ✅ Added status breakdown (completed/processing/failed/pending)
- ✅ Added Pinecone integration

### 2. Documents API (`/api/knowledge/documents`)
- ✅ Changed from `rag_knowledge_sources` → `knowledge_documents`
- ✅ Changed from `rag_knowledge_chunks` → `document_chunks`
- ✅ Fixed field mappings

### 3. Dashboard UI
- ✅ Added status indicators (failed/processing counts)
- ✅ Shows all documents regardless of status
- ✅ Added Pinecone stats card

---

## 🎯 What You'll See Now

After refreshing the dashboard:

```
✅ Total Documents: 105 (your uploads!)
✅ Knowledge Chunks: 0 (processing issue)
⚠️  Status: ~103 failed, 2 completed
```

**The dashboard now shows all your uploaded documents!**

---

## ⚠️ Remaining Issue: Processing Failures

**Why are documents failing?**

Documents are created with content, but the async processing step is failing. This could be due to:

1. **Embedding Generation**: OpenAI API issues (rate limits, API key, etc.)
2. **Chunking Logic**: Error in chunking algorithm
3. **Database Insert**: Error inserting chunks to `document_chunks`
4. **Pinecone Sync**: Error syncing to Pinecone

**To investigate:**
- Check server logs for error messages
- Verify OpenAI API key is valid
- Check if `document_chunks` table has proper schema
- Verify Pinecone credentials

---

## 🔄 Next Steps

1. **Refresh dashboard** - You should now see all 105 documents
2. **Check processing errors** - Run: `node scripts/check-document-processing-errors.js`
3. **Fix processing** - Investigate why async processing is failing
4. **Re-process failed documents** - Once fixed, re-process the failed ones

---

## 📝 Diagnostic Commands

```bash
# Check what's in database
node scripts/check-uploaded-documents.js

# Check processing errors
node scripts/check-document-processing-errors.js

# Check Pinecone sync
node scripts/pinecone-cli.js stats
```

---

**The dashboard is now fixed - refresh to see your 105 documents!** 🎉

