# 🎯 MODE 1 RAG - FINAL ROOT CAUSE & FIX

**Date**: 2025-11-05 20:30 UTC  
**Status**: 🐛 **ROOT CAUSE IDENTIFIED** → 🔧 **FIX IN PROGRESS**

---

## 🔍 **ROOT CAUSE IDENTIFIED!**

### **The Bug:**
The frontend is sending **domain NAMES** (`["Digital Health", "Regulatory Affairs"]`), but the backend RAG service expects **domain UUIDs**!

### **Data Flow (Current - Broken):**

```
Frontend: 
selectedRagDomains = ["Digital Health", "Regulatory Affairs"]  ✅

↓

API Route (/api/ask-expert/orchestrate):
selectedRagDomains = ["Digital Health", "Regulatory Affairs"]  ✅

↓

Python AI Engine (main.py):
selected_rag_domains = ["Digital Health", "Regulatory Affairs"]  ✅

↓

Mode1ManualWorkflow (rag_retrieval_node):
domain_ids = ["Digital Health", "Regulatory Affairs"]  ✅

↓

UnifiedRAGService.query():
domain_ids = ["Digital Health", "Regulatory Affairs"]  ✅

↓

UnifiedRAGService._get_namespace_for_domain("Digital Health"):
  1. Check: "Digital Health" in self._domain_namespace_cache?
  2. Result: ❌ NO (cache only has UUIDs as keys)
  3. Fallback: Return self.knowledge_namespace (default/wrong namespace)
  4. Pinecone Query: Queries wrong namespace
  5. Result: 0 sources found  ❌

```

### **Why It's Broken:**

The `_domain_namespace_cache` is built from Supabase `knowledge_domains` table:
```python
# Cache structure:
{
  "uuid-123-456": "digital-health",  # UUID -> namespace
  "uuid-789-012": "regulatory-affairs"  # UUID -> namespace
}
```

But we're querying with domain **NAMES**:
```python
"Digital Health" in cache?  ❌ NO (key is UUID, not name!)
```

---

## ✅ **THE FIX**

### **Option 1: Store domain names as additional keys in cache (RECOMMENDED)**

Update `_load_domain_namespace_mappings()` to also store `domain_name -> namespace` mappings:

```python
# Cache structure (AFTER FIX):
{
  # UUID keys (existing)
  "uuid-123-456": "digital-health",
  
  # NAME keys (new)
  "Digital Health": "digital-health",  # ✅ Now searchable by name!
  "Regulatory Affairs": "regulatory-affairs"  # ✅ Now searchable by name!
}
```

### **Implementation:**

```python
# In _load_domain_namespace_mappings()
for domain in result.data:
    domain_id = domain.get('domain_id')
    domain_name = domain.get('domain_name') or domain.get('name')
    slug = domain.get('slug')
    namespace = slug.lower().replace(' ', '-')[:64]
    
    # Store UUID -> namespace
    if domain_id:
        self._domain_namespace_cache[domain_id] = namespace
    
    # ✅ NEW: Store name -> namespace (case-insensitive)
    if domain_name:
        self._domain_namespace_cache[domain_name] = namespace
        # Also store lowercase version for case-insensitive lookup
        self._domain_namespace_cache[domain_name.lower()] = namespace
```

Then update `_get_namespace_for_domain()` to handle case-insensitive lookups:

```python
def _get_namespace_for_domain(self, domain_id: Optional[str]) -> str:
    """
    Get namespace name for a domain_id (UUID) or domain_name (string).
    """
    if not domain_id:
        return self.knowledge_namespace
    
    # Direct lookup (UUID or exact name match)
    if domain_id in self._domain_namespace_cache:
        return self._domain_namespace_cache[domain_id]
    
    # ✅ NEW: Try lowercase for case-insensitive name lookup
    domain_id_lower = domain_id.lower()
    if domain_id_lower in self._domain_namespace_cache:
        return self._domain_namespace_cache[domain_id_lower]
    
    # Fallback to default
    logger.warning(f"⚠️ Domain '{domain_id}' not found in cache, using default namespace")
    return self.knowledge_namespace
```

---

## 📊 **Expected Result AFTER Fix**

```
Query: "What are the FDA guidelines for digital therapeutics?"
Domains: ["Digital Health", "Regulatory Affairs"]

↓

_get_namespace_for_domain("Digital Health"):
  1. Check: "Digital Health" in cache?
  2. Result: ✅ YES! Found "digital-health" namespace
  3. Pinecone Query: Query "digital-health" namespace
  4. Result: 5-10 sources found  ✅

_get_namespace_for_domain("Regulatory Affairs"):
  1. Check: "Regulatory Affairs" in cache?
  2. Result: ✅ YES! Found "regulatory-affairs" namespace
  3. Pinecone Query: Query "regulatory-affairs" namespace
  4. Result: 5-10 sources found  ✅
```

---

## 🚀 **Next Steps**

1. ✅ Apply fix to `unified_rag_service.py`
2. ✅ Restart AI Engine
3. ✅ Test Mode 1 with RAG enabled
4. ✅ Verify `totalSources > 0` in response

---

## 📝 **Files to Modify**

1. `services/ai-engine/src/services/unified_rag_service.py`:
   - Update `_load_domain_namespace_mappings()` (line ~106)
   - Update `_get_namespace_for_domain()` (line ~136)

---

## 🎯 **Success Criteria**

```json
{
  "ragSummary": {
    "totalSources": 5-10,  // ✅ Should be > 0 now!
    "domains": ["Digital Health", "Regulatory Affairs"],
    "cacheHit": false
  }
}
```

