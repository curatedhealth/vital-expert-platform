# 🚀 Cloud RAG System - Complete Setup Guide

## 📋 Current Status

✅ **Knowledge Domains**: 30 domains created and verified  
❌ **RAG Tables**: Need to be created via Supabase Dashboard  
❌ **Vector Functions**: Need to be created via SQL Editor  
❌ **Sample Data**: Ready to populate once tables exist  

---

## 🎯 Required Actions

### **Step 1: Create RAG Tables in Supabase Dashboard**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `xazinxsiglqokwfmogyk`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Execute the Complete Migration**
   - Copy the entire contents of `cloud-rag-migration.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

### **Step 2: Verify Tables Creation**

After running the SQL migration, verify these tables exist:

- ✅ `knowledge_domains` (already exists)
- ✅ `knowledge_base_documents` (new)
- ✅ `document_embeddings` (new)
- ✅ `chat_memory` (new)
- ✅ `chat_history` (new)
- ✅ `user_facts` (new)
- ✅ `user_long_term_memory` (new)

### **Step 3: Test the System**

```bash
# Run the test script
NEXT_PUBLIC_SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your_service_key" \
node test-cloud-rag-system.js
```

---

## 📊 What's Already Working

### **✅ Knowledge Domains (30 Total)**

**Tier 1 - Core Domains (15)**:
1. Regulatory Affairs (85 agents)
2. Clinical Development (37 agents)
3. Pharmacovigilance (25 agents)
4. Quality Management (20 agents)
5. Medical Affairs (15 agents)
6. Commercial Strategy (29 agents)
7. Drug Development (39 agents)
8. Clinical Data Analytics (18 agents)
9. Manufacturing Operations (17 agents)
10. Medical Devices (12 agents)
11. Digital Health (34 agents)
12. Supply Chain (15 agents)
13. Legal & Compliance (10 agents)
14. Health Economics (12 agents)
15. Business Strategy (10 agents)

**Tier 2 - Specialized Domains (10)**:
16. Product Labeling (8 agents)
17. Post-Market Activities (10 agents)
18. Companion Diagnostics (6 agents)
19. Nonclinical Sciences (12 agents)
20. Patient Engagement (5 agents)
21. Risk Management (8 agents)
22. Scientific Publications (7 agents)
23. KOL & Stakeholder Engagement (6 agents)
24. Evidence Generation (5 agents)
25. Global Market Access (8 agents)

**Tier 3 - Emerging Domains (5)**:
26. Real-World Data & Evidence (8 agents)
27. Precision Medicine (6 agents)
28. Telemedicine & Remote Care (5 agents)
29. Sustainability & ESG (3 agents)
30. Rare Diseases & Orphan Drugs (4 agents)

### **✅ CloudRAGService Implementation**

**File**: `src/features/chat/services/cloud-rag-service.ts`

**Features**:
- 8 Retrieval Strategies
- Hybrid Search (Vector + BM25)
- Cohere Re-ranking Integration
- Domain-based Filtering
- Token Usage Tracking
- Memory Management

---

## 🔧 SQL Migration Content

The `cloud-rag-migration.sql` file contains:

1. **Vector Extension**: `CREATE EXTENSION IF NOT EXISTS vector;`
2. **Knowledge Base Documents Table**: Document storage
3. **Document Embeddings Table**: Vector embeddings (1536 dimensions)
4. **Memory Tables**: Chat memory, history, user facts
5. **Vector Search Functions**: `match_documents`, `hybrid_search`
6. **Indexes**: Performance optimization
7. **RLS Policies**: Row Level Security
8. **Sample Data**: 3 sample documents

---

## 🧪 Testing Commands

### **Test Knowledge Domains**
```bash
curl -s "https://xazinxsiglqokwfmogyk.supabase.co/rest/v1/knowledge_domains?select=*&tier=eq.1&order=priority" \
  -H "apikey: YOUR_ANON_KEY" | jq '.'
```

### **Test RAG Tables (after creation)**
```bash
curl -s "https://xazinxsiglqokwfmogyk.supabase.co/rest/v1/knowledge_base_documents?select=*" \
  -H "apikey: YOUR_ANON_KEY" | jq '.'
```

### **Test Vector Search (after creation)**
```bash
curl -X POST "https://xazinxsiglqokwfmogyk.supabase.co/rest/v1/rpc/match_documents" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query_embedding": [0.1, 0.2, 0.3], "match_count": 3}'
```

---

## 📁 Files Ready for Use

### **Setup Scripts**
- `setup-cloud-rag-system.js` - Complete setup script
- `setup-cloud-rag-direct.js` - Direct setup script
- `create-rag-tables.js` - Table creation script
- `create-tables-direct.js` - Direct table creation
- `test-cloud-rag-system.js` - Test verification

### **SQL Migration**
- `cloud-rag-migration.sql` - Complete SQL migration

### **Service Implementation**
- `src/features/chat/services/cloud-rag-service.ts` - Production RAG service

### **Documentation**
- `CLOUD_RAG_SYSTEM_COMPLETE.md` - Complete system overview
- `CLOUD_RAG_SETUP_GUIDE.md` - This setup guide

---

## 🚀 Next Steps After SQL Migration

### **1. Populate Knowledge Base**
```bash
# Run sample data population
node create-tables-direct.js
```

### **2. Test Complete System**
```bash
# Run comprehensive test
node test-cloud-rag-system.js
```

### **3. Integrate with Ask Expert**
- Update Ask Expert to use CloudRAGService
- Test end-to-end functionality

### **4. Configure Cohere Re-ranking**
```bash
# Add to .env.local
COHERE_API_KEY="your_cohere_key_here"
```

---

## 🎯 Success Criteria

After completing the SQL migration:

- ✅ 30 knowledge domains accessible
- ✅ RAG tables created and accessible
- ✅ Vector search functions working
- ✅ Sample documents populated
- ✅ Memory tables ready
- ✅ CloudRAGService functional

---

## 🆘 Troubleshooting

### **Issue**: "relation does not exist"
**Solution**: Run the SQL migration in Supabase SQL Editor

### **Issue**: "permission denied"
**Solution**: Check RLS policies and service key permissions

### **Issue**: "vector extension not found"
**Solution**: Enable pg_vector extension in Supabase dashboard

### **Issue**: "function not found"
**Solution**: Ensure vector search functions were created successfully

---

## 📞 Support

If you encounter issues:

1. Check Supabase dashboard for table creation
2. Verify RLS policies are enabled
3. Test with the provided scripts
4. Check environment variables

---

**Status**: Ready for SQL Migration  
**Next Action**: Execute `cloud-rag-migration.sql` in Supabase SQL Editor  
**Estimated Time**: 5-10 minutes
