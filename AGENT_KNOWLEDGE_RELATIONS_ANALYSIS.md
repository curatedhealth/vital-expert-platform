# 🔍 **Agent-Knowledge Domain Relations Analysis**

**Date**: 2025-11-06 11:48 UTC  
**Analysis Method**: MCP Supabase SQL Queries  
**Status**: ✅ **COMPLETE**

---

## **📊 Summary Statistics**

### **Agents**:
- **Total Agents**: 417
- **Agents with RAG Domains**: 417 (100%)
- **Agents with RAG Enabled**: 417 (100%)
- **Domains per Agent**: 54

### **Knowledge Domains**:
- **Total Active Domains**: 54
- **Domains with Documents**: 1 (Digital Health)
- **Domains without Documents**: 53

### **Document Coverage**:
- **Total Chunks**: 107
- **Total Documents**: 27
- **Primary Domain**: Digital Health only

---

## **🔗 Data Model Relations**

### **1. Agents → Knowledge Domains**

**Storage**: `agents.metadata->>'rag_domains'`  
**Type**: JSONB Array  
**Relationship**: Many-to-Many (via metadata)

**Structure**:
```json
{
  "rag_domains": [
    "Regulatory Affairs",
    "Infectious Diseases",
    "Rare Diseases",
    "Digital Health",
    ...all 54 domains
  ],
  "rag_enabled": true
}
```

**Sample Agents**:
| Agent Name | RAG Domains | RAG Enabled |
|------------|-------------|-------------|
| market_research_analyst | 54 | ✅ |
| brand_strategy_director | 54 | ✅ |
| clinical-trial-designer | 54 | ✅ |

**First 3 Domains for All Agents**:
1. Regulatory Affairs
2. Infectious Diseases
3. Rare Diseases

---

### **2. Knowledge Domains → Document Chunks**

**Relationship**: One-to-Many  
**Join**: `knowledge_domains.domain_id::text = document_chunks.domain_id`

**Note**: `domain_id` types don't match:
- `knowledge_domains.domain_id`: UUID
- `document_chunks.domain_id`: TEXT

**Data Distribution**:
| Domain | Namespace | Chunks | Documents | Priority | Tier |
|--------|-----------|--------|-----------|----------|------|
| Digital Health | digital-health | 107 | 27 | 20 | 3 |
| Regulatory Affairs | regulatory-affairs | 0 | 0 | 1 | 1 |
| Clinical Development | clinical-development | 0 | 0 | 2 | 1 |
| Medical Affairs | medical-affairs | 0 | 0 | 3 | 1 |
| All Others | various | 0 | 0 | varies | varies |

---

## **🔍 Key Findings**

### **✅ Strengths**:
1. **100% Agent Coverage**: All 417 agents have RAG domains assigned
2. **Uniform Distribution**: All agents have access to all 54 domains
3. **RAG Enabled**: All agents have `rag_enabled: true`
4. **Structured Metadata**: Clean JSONB storage in agents table
5. **Domain Hierarchy**: Domains have tier (1-3) and priority (1-26)

### **⚠️ Gaps**:
1. **Single Domain with Data**: Only "Digital Health" has actual document chunks
2. **53 Empty Domains**: No documents/chunks in other domains
3. **Type Mismatch**: `domain_id` types differ between tables (UUID vs TEXT)
4. **No Embeddings**: Most domains lack `embedding_model` configuration

---

## **📋 Knowledge Domain Details**

### **Top Priority Domains (by Priority)**:
1. **Regulatory Affairs** (Priority 1, Tier 1) - 0 chunks
   - Keywords: FDA, EMA, regulatory, compliance
   - Embedding: text-embedding-3-large

2. **Clinical Development** (Priority 2, Tier 1) - 0 chunks
   - Keywords: clinical trials, protocols, study design
   - Embedding: None

3. **Medical Affairs** (Priority 3, Tier 1) - 0 chunks
   - Keywords: medical information, scientific, communications
   - Embedding: None

4. **Pharmacovigilance** (Priority 3, Tier 1) - 0 chunks
   - Keywords: None
   - Embedding: None

5. **Quality Assurance** (Priority 4, Tier 1) - 0 chunks
   - Keywords: quality, compliance, systems
   - Embedding: None

### **Only Populated Domain**:
- **Digital Health** (Priority 20, Tier 3) - **107 chunks from 27 documents**
  - Keywords: digital health, telemedicine, apps
  - Embedding: None (likely using default)

---

## **🔄 Data Flow**

### **Current Architecture**:
```
User selects Agent
    ↓
Agent has metadata->rag_domains (54 domains)
    ↓
Frontend passes selected_rag_domains to AI Engine
    ↓
AI Engine queries UnifiedRAGService
    ↓
RAG Service maps domain_name → namespace
    ↓
Queries Pinecone by namespace
    ↓
Enriches with Supabase metadata via document_chunks
    ↓
Returns sources to Agent
```

### **Domain Name Mapping**:
```sql
-- How domains map to Pinecone namespaces
domain_name: "Regulatory Affairs" → slug: "regulatory-affairs"
domain_name: "Digital Health"     → slug: "digital-health"
```

---

## **🗄️ Table Schemas**

### **Agents Table**:
```sql
agents (
    id UUID PRIMARY KEY,
    name TEXT,
    metadata JSONB,  -- Contains rag_domains array
    created_at TIMESTAMP
)
```

### **Knowledge Domains Table**:
```sql
knowledge_domains (
    domain_id UUID PRIMARY KEY,
    domain_name TEXT,
    slug TEXT,  -- Used as Pinecone namespace
    is_active BOOLEAN,
    tier INTEGER,
    priority INTEGER,
    keywords TEXT[],
    embedding_model TEXT,
    created_at TIMESTAMP
)
```

### **Document Chunks Table**:
```sql
document_chunks (
    id UUID PRIMARY KEY,
    document_id UUID,
    domain_id TEXT,  -- ⚠️ TEXT not UUID!
    content TEXT,
    embedding vector(3072),
    metadata JSONB,
    created_at TIMESTAMP
)
```

---

## **⚠️ Issues to Address**

### **1. Type Mismatch** 🔴:
```sql
-- knowledge_domains.domain_id is UUID
-- document_chunks.domain_id is TEXT
-- Join requires cast: domain_id::text
```

**Impact**: Requires explicit casting in all join queries

### **2. Data Scarcity** 🟡:
- Only 1 out of 54 domains has data
- 53 domains are empty (no chunks, no documents)
- Limited RAG retrieval effectiveness

### **3. Missing Embeddings** 🟡:
- Only "Regulatory Affairs" has `embedding_model` configured
- Other domains will use default model
- Inconsistent embedding quality

---

## **✅ Recommendations**

### **Immediate**:
1. ✅ **Keep current setup** for testing (all agents have all domains)
2. ✅ **Use Digital Health + Regulatory Affairs** as default for queries
3. ✅ **Test Mode 1** to verify RAG retrieval works

### **Short-term** (1-2 weeks):
1. 🔴 **Fix type mismatch**: Standardize `domain_id` to UUID in all tables
2. 🟡 **Populate top priority domains**: Add documents to Regulatory Affairs, Clinical Development, etc.
3. 🟡 **Configure embedding models**: Set `embedding_model` for all active domains

### **Long-term** (1-3 months):
1. 🟢 **Intelligent domain selection**: Auto-select relevant domains per agent type
2. 🟢 **Domain-specific agents**: Link agents to 3-5 most relevant domains instead of all 54
3. 🟢 **Performance optimization**: Reduce query time by limiting domains queried

---

## **🧪 Testing Strategy**

### **Test 1: Verify Agent-Domain Link**:
```sql
SELECT name, jsonb_array_length(metadata->'rag_domains') as domain_count
FROM agents
WHERE name = 'market_research_analyst';
-- Expected: 54
```

### **Test 2: Verify Domain Data**:
```sql
SELECT domain_name, COUNT(dc.id) as chunks
FROM knowledge_domains kd
LEFT JOIN document_chunks dc ON kd.domain_id::text = dc.domain_id
WHERE kd.domain_name IN ('Digital Health', 'Regulatory Affairs')
GROUP BY domain_name;
-- Expected: Digital Health = 107, Regulatory Affairs = 0
```

### **Test 3: End-to-End RAG**:
1. Select agent: "Market Research Analyst"
2. Query: "What are FDA guidelines?"
3. Check: Should retrieve from Digital Health (only populated domain)

---

## **📈 Success Metrics**

- ✅ **100% Agent Coverage**: All agents have RAG domains
- ✅ **RAG Enabled**: All agents can use RAG
- ⚠️ **Data Coverage**: Only 2% of domains have data (1/54)
- ✅ **Schema Consistency**: Clean JSONB metadata structure

---

**🎉 All agents are now linked to all knowledge domains!**

**📝 Next**: Test Mode 1 to verify RAG retrieval works end-to-end.

