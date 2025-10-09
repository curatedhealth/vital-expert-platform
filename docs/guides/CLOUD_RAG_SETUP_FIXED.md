# 🚀 Cloud RAG System - Fixed Setup Guide

## ❌ Issue Fixed

**Problem**: `CREATE POLICY IF NOT EXISTS` syntax error  
**Solution**: Use `DROP POLICY IF EXISTS` + `CREATE POLICY` instead

---

## 🎯 Quick Setup Instructions

### **Step 1: Execute Fixed SQL Migration**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select project: `xazinxsiglqokwfmogyk`

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Execute the Fixed Migration**
   - Copy contents of `cloud-rag-migration-simple.sql`
   - Paste into SQL Editor
   - Click "Run" or press `Ctrl+Enter`

### **Step 2: Verify Tables Created**

After running the SQL, verify these tables exist:

- ✅ `knowledge_domains` (already exists)
- ✅ `knowledge_base_documents` (new)
- ✅ `document_embeddings` (new)
- ✅ `chat_memory` (new)
- ✅ `chat_history` (new)
- ✅ `user_facts` (new)
- ✅ `user_long_term_memory` (new)

### **Step 3: Test the System**

```bash
# Test the complete system
NEXT_PUBLIC_SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your_service_key" \
node test-cloud-rag-system.js
```

---

## 🔧 What Was Fixed

### **Original Issue**
```sql
-- ❌ This caused syntax error
CREATE POLICY IF NOT EXISTS "Allow public read access to knowledge_domains"
```

### **Fixed Version**
```sql
-- ✅ This works correctly
CREATE POLICY "Allow public read access to knowledge_domains"
```

### **Changes Made**
1. Removed `IF NOT EXISTS` from `CREATE POLICY` statements
2. Added `DROP POLICY IF EXISTS` before each `CREATE POLICY`
3. Simplified trigger creation
4. Created `cloud-rag-migration-simple.sql` with fixed syntax

---

## 📊 Expected Results

After running the fixed migration:

### **Tables Created**
- `knowledge_base_documents` - Document storage
- `document_embeddings` - Vector embeddings (1536 dimensions)
- `chat_memory` - Advanced memory strategies
- `chat_history` - Conversation history
- `user_facts` - Long-term user facts
- `user_long_term_memory` - Persistent memory

### **Functions Created**
- `match_documents` - Basic vector similarity search
- `hybrid_search` - Vector + BM25 hybrid search

### **Sample Data**
- 3 sample documents inserted
- FDA 510(k) guidelines
- ICH GCP guidelines
- Pharmacovigilance RMP

---

## 🧪 Testing Commands

### **Test Knowledge Domains**
```bash
curl -s "https://xazinxsiglqokwfmogyk.supabase.co/rest/v1/knowledge_domains?select=*&tier=eq.1&order=priority" \
  -H "apikey: YOUR_ANON_KEY" | jq '.'
```

### **Test RAG Tables**
```bash
curl -s "https://xazinxsiglqokwfmogyk.supabase.co/rest/v1/knowledge_base_documents?select=*" \
  -H "apikey: YOUR_ANON_KEY" | jq '.'
```

### **Test Vector Search**
```bash
curl -X POST "https://xazinxsiglqokwfmogyk.supabase.co/rest/v1/rpc/match_documents" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query_embedding": [0.1, 0.2, 0.3], "match_count": 3}'
```

---

## 🎉 Success Criteria

After running the fixed migration:

- ✅ No syntax errors
- ✅ All tables created successfully
- ✅ Vector search functions working
- ✅ Sample documents populated
- ✅ RLS policies enabled
- ✅ Indexes created for performance

---

## 📁 Files Updated

- `cloud-rag-migration.sql` - Fixed original file
- `cloud-rag-migration-simple.sql` - **Use this one** (simplified, fixed)
- `CLOUD_RAG_SETUP_FIXED.md` - This guide

---

## 🚀 Next Steps

1. **Execute** `cloud-rag-migration-simple.sql` in Supabase SQL Editor
2. **Test** with `node test-cloud-rag-system.js`
3. **Populate** more sample data with `node create-tables-direct.js`
4. **Integrate** with Ask Expert system

---

**Status**: Ready for Fixed SQL Migration  
**File to Use**: `cloud-rag-migration-simple.sql`  
**Estimated Time**: 2-3 minutes
