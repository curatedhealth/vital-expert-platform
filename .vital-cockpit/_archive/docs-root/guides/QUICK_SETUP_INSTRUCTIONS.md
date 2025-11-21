# 🚀 Quick Setup Instructions - Cloud RAG System

## ❌ Problem Fixed

**Issue**: SQL editor tried to execute markdown file  
**Solution**: Use `cloud-rag-migration-clean.sql` (SQL-only file)

---

## 🎯 Step-by-Step Setup

### **Step 1: Open Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select project: `xazinxsiglqokwfmogyk`
3. Click "SQL Editor" in left sidebar
4. Click "New Query"

### **Step 2: Copy SQL Migration**
1. Open `cloud-rag-migration-clean.sql` file
2. Copy **ALL** contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor (Ctrl+V)

### **Step 3: Execute Migration**
1. Click "Run" button or press `Ctrl+Enter`
2. Wait for execution to complete
3. Check for any errors in the output

### **Step 4: Verify Tables Created**
After successful execution, you should see these tables:
- ✅ `knowledge_base_documents`
- ✅ `document_embeddings`
- ✅ `chat_memory`
- ✅ `chat_history`
- ✅ `user_facts`
- ✅ `user_long_term_memory`

### **Step 5: Test the System**
```bash
# Run this command to test
NEXT_PUBLIC_SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your_service_key" \
node test-cloud-rag-system.js
```

---

## 📁 File to Use

**Use**: `cloud-rag-migration-clean.sql`  
**Contains**: Pure SQL code, no markdown  
**Size**: ~200 lines of SQL  

---

## ✅ Expected Results

After successful execution:
- 6 new tables created
- 2 vector search functions created
- 3 sample documents inserted
- All indexes and RLS policies enabled

---

## 🆘 If You Get Errors

### **Error**: "relation already exists"
**Solution**: This is normal, tables may already exist

### **Error**: "permission denied"
**Solution**: Check you're using the service role key

### **Error**: "vector extension not found"
**Solution**: Enable pg_vector extension in Supabase dashboard

---

## 🎉 Success!

Once the migration runs successfully, your cloud RAG system will be ready for:
- Document storage and retrieval
- Vector similarity search
- Hybrid search (Vector + BM25)
- Memory management
- Domain-based filtering

---

**Time Required**: 2-3 minutes  
**File**: `cloud-rag-migration-clean.sql`  
**Status**: Ready to execute
