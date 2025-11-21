# 🔴 MODE 1 RAG ISSUE - Root Cause Identified

## **CRITICAL FINDING**

### ❌ **Agent's RAG Domains Don't Exist in Database!**

**Agent is sending**:
```json
["clinical_validation", "cybersecurity_medical_devices", "digital_health_reimbursement", 
 "digital_therapeutics", "fda_samd_regulation", "health_technology_assessment", "real_world_evidence"]
```

**Database actually has**:
```json
["digital-health", "regulatory-affairs", "infectious-diseases", "rare-diseases", "precision-medicine", ...]
```

**Result**: **100% mismatch** → All 7 domains fail to map → Fallback to empty `"domains-knowledge"` namespace → **0 sources**

---

## **How This Happened**

1. ✅ **Domain Mapping Fix** was implemented correctly (loads 205 mappings)
2. ✅ **Slug variation mapping** was added (underscores, lowercase, etc.)
3. ❌ **But**: Agent's `metadata.rag_domains` contains **fictional domain slugs** that don't exist in `knowledge_domains` table
4. ❌ **Result**: No amount of slug normalization can map non-existent domains!

---

## **Evidence**

### **From `knowledge_domains` table** (via MCP):
```sql
SELECT domain_name, slug FROM knowledge_domains WHERE is_active = true LIMIT 10
```
Result:
- "Digital Health" → `"digital-health"`
- "Regulatory Affairs" → `"regulatory-affairs"`
- "Infectious Diseases" → `"infectious-diseases"`
- "Rare Diseases" → `"rare-diseases"`
- "Precision Medicine" → `"precision-medicine"`
- "AI/ML in Healthcare" → `"ai-ml-healthcare"`
- etc.

### **From Agent metadata** (sent to AI Engine):
```
"clinical_validation" ❌ NOT IN DATABASE
"cybersecurity_medical_devices" ❌ NOT IN DATABASE
"digital_health_reimbursement" ❌ NOT IN DATABASE
"digital_therapeutics" ❌ NOT IN DATABASE
"fda_samd_regulation" ❌ NOT IN DATABASE
"health_technology_assessment" ❌ NOT IN DATABASE
"real_world_evidence" ❌ NOT IN DATABASE
```

### **AI Engine logs** (confirming failure):
```
⚠️ Domain 'clinical_validation' not found in cache (205 mappings available)
⚠️ Domain 'digital_therapeutics' not found in cache (205 mappings available)
...
📂 [HYBRID_SEARCH] Target namespaces: ['domains-knowledge']  # ❌ FALLBACK!
✅ [HYBRID_SEARCH] Namespace 'domains-knowledge': 0 matches  # ❌ EMPTY!
```

---

## **THE FIX** (2 Options)

### **Option A: Update Agent Metadata** (Recommended - 30 min)
**Strategy**: Replace agent's fictional domain slugs with real slugs from database

**Steps**:
1. Query all agents with `rag_enabled = true`
2. For each agent's `metadata.rag_domains`:
   - Map `"clinical_validation"` → `"digital-health"` (closest match)
   - Map `"digital_therapeutics"` → `"digital-health"`
   - Map `"fda_samd_regulation"` → `"regulatory-affairs"`
   - Map `"cybersecurity_medical_devices"` → `"digital-health"`
   - etc.
3. Update agent's `metadata.rag_domains` with correct slugs
4. Restart AI Engine

**Pros**: 
- Quick fix (30 min)
- Uses existing database structure
- No schema changes

**Cons**:
- Manual mapping required
- May lose semantic intent (e.g., "clinical_validation" → "digital-health" is a generalization)

---

### **Option B: Create Missing Domains** (Comprehensive - 1-2 hours)
**Strategy**: Add missing domains to `knowledge_domains` table

**Steps**:
1. Extract all unique domain slugs from agent metadata across all agents
2. For each missing domain:
   - Create new entry in `knowledge_domains` table
   - Generate proper `domain_name` from slug (e.g., "clinical_validation" → "Clinical Validation")
   - Create Pinecone namespace (if needed)
   - Set `is_active = true`
3. Run domain mapping reload
4. Restart AI Engine

**Pros**:
- Maintains semantic intent
- Scalable for future agents
- No data loss

**Cons**:
- Takes longer (1-2 hours)
- Creates many empty domains (until populated with documents)
- Requires Pinecone namespace creation

---

## **RECOMMENDED: Option A (Quick Fix)**

**SQL Script** (to run via MCP):
```sql
-- Update "Digital Therapeutic Advisor" agent
UPDATE agents 
SET metadata = jsonb_set(
  metadata,
  '{rag_domains}',
  '["digital-health", "regulatory-affairs"]'::jsonb
)
WHERE id = '70b410dd-354b-4db7-b8cd-f1a9b204f440';
```

**Expected Result**:
- Agent now sends: `["digital-health", "regulatory-affairs"]`
- These domains **exist** in `knowledge_domains` table
- Pinecone namespaces: `digital-health` (3010 vectors), `regulatory-affairs` (511 vectors)
- RAG will find sources! ✅

---

## **WHY STREAMING ALSO FAILED**

**Issue**: `writer()` calls were added, but **LangGraph's `messages` mode doesn't capture custom events**.

**Explanation**:
- Our code: `writer({"type": "llm_token", "content": chunk.content})`
- LangGraph: Expects `AIMessageChunk` objects in `messages` mode, not custom dict events
- Result: Chunks emitted but **not recognized** by LangGraph → Not forwarded to frontend

**Fix** (10 min):
Instead of:
```python
writer({"type": "llm_token", "content": chunk.content})
```

Use:
```python
writer(chunk)  # Pass the AIMessageChunk directly
```

OR use `custom` stream mode:
```python
async for stream_mode, chunk in workflow.graph.astream(..., stream_mode=["custom"]):
```

---

## **NEXT STEPS** (Choose One)

### **A) Quick Fix (30-40 min total)**
1. ✅ Update agent metadata with correct domain slugs (SQL above)
2. ✅ Fix `writer()` to pass `AIMessageChunk` directly
3. ✅ Restart AI Engine
4. ✅ Test Mode 1

### **B) Comprehensive Fix (2-3 hours)**
1. ✅ Create missing domains in database
2. ✅ Update all agents' metadata
3. ✅ Fix streaming
4. ✅ Populate new domains with documents
5. ✅ Test Mode 1

---

## **USER CHOICE REQUIRED**

**Which option do you prefer?**
- **A) Quick Fix** - 30-40 min, test RAG ASAP
- **B) Comprehensive** - 2-3 hours, proper long-term solution

**I recommend Option A** to validate the fix works, then do Option B later when you have more time.

