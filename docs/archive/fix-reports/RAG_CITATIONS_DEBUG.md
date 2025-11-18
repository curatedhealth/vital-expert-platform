# 🔧 **RAG Citations & References Debug - TESTING REQUIRED**

**Date**: 2025-11-06 14:20 UTC  
**Status**: ⚠️ **DEBUG LOGGING ADDED - NEED TO TEST**

---

## **🐛 Problem**

RAG is retrieving sources successfully (we can see `totalSources: 10` in logs), but:
1. ❌ Citations are not showing inline in the text
2. ❌ References are not appearing at the bottom

---

## **🔍 Investigation**

### **Flow Analysis**:

```
AI Engine (Python)
  ↓
  Returns: { citations: [...], content: "...", ... }
  ↓
Mode1 Handler (TypeScript)
  ↓
  Maps citations → sources
  ↓
  Yields: __mode1_meta__{"event":"rag_sources","sources":[...]}
  ↓
Frontend (React)
  ↓
  Parses metadata chunks
  ↓
  Sets: sources variable
  ↓
  Adds to message: metadata.sources
  ↓
EnhancedMessageDisplay
  ↓
  Should display citations & references
```

### **Hypothesis**:
The AI Engine IS returning sources in the `result` object, but they might be in:
- `result.sources` instead of `result.citations`
- Or `result.citations` is an empty array
- Or the citation format doesn't match what the mapper expects

---

## **✅ Debug Logging Added**

### **File**: `mode1-manual-interactive.ts`  
### **Lines**: 273-293

**Added Logs**:
```typescript
console.log('🔍 [Mode1] AI Engine citations:', JSON.stringify(result.citations, null, 2));
console.log('🔍 [Mode1] AI Engine sources (if present):', JSON.stringify(result.sources, null, 2));
console.log('🔍 [Mode1] AI Engine reasoning:', JSON.stringify(result.reasoning, null, 2));
console.log('🔍 [Mode1] Mapped sources:', JSON.stringify(sources, null, 2));
console.log('📊 [Mode1] Sources count:', sources.length);

if (sources.length > 0) {
  console.log('✅ [Mode1] Yielding rag_sources metadata chunk');
  // ... yield sources
} else {
  console.warn('⚠️ [Mode1] No sources to yield - citations array was empty or undefined');
}
```

---

## **🧪 Test Now**

### **Step 1: Test Mode 1 with RAG**:
1. **Refresh** browser: http://localhost:3000/ask-expert
2. **Open Console** (F12 → Console tab)
3. **Select** any agent (e.g., "Digital Therapeutic Advisor")
4. **Enable RAG** (should be enabled by default)
5. **Ask**: "What are the FDA guidelines for digital therapeutics?"
6. **Watch Console** for the 🔍 logs

### **Step 2: Check Console Output**:

Look for these logs:
```
🔍 [Mode1] AI Engine citations: [...]
🔍 [Mode1] AI Engine sources (if present): [...]
🔍 [Mode1] Mapped sources: [...]
📊 [Mode1] Sources count: X
```

### **Step 3: Analyze**:

**Case A**: If `citations` is empty `[]`:
- ✅ **Root cause**: AI Engine not returning citations
- **Fix**: Update `mode1_manual_workflow.py` to format citations correctly

**Case B**: If `citations` exists but `sources` is empty:
- ✅ **Root cause**: Mapping function `mapCitationsToSources` failing
- **Fix**: Update mapping function to handle AI Engine format

**Case C**: If `sources` is populated but not showing in UI:
- ✅ **Root cause**: Frontend not parsing metadata chunks
- **Fix**: Update frontend metadata parsing logic

---

## **🔧 Expected AI Engine Response Format**

### **What We Expect**:
```json
{
  "agent_id": "...",
  "content": "...",
  "confidence": 0.8,
  "citations": [
    {
      "id": "source_1",
      "number": 1,
      "title": "Clinical Decision Support Software (2019)",
      "content": "...",
      "excerpt": "...",
      "url": "",
      "similarity": 0.85,
      "domain": "Digital Health",
      "metadata": {
        "year": "2019",
        "document_type": "guideline"
      }
    }
  ],
  "metadata": {...},
  "processing_time_ms": 1000
}
```

### **Current AI Engine Code** (`main.py:925-936`):
```python
# Convert sources to citations
citations = []
for idx, source in enumerate(sources, 1):
    citations.append({
        "id": f"citation_{idx}",
        "title": source.get('title', f'Source {idx}'),
        "content": source.get('content', source.get('excerpt', '')),
        "url": source.get('url', ''),
        "similarity_score": source.get('similarity_score', 0.0),
        "metadata": source.get('metadata', {})
    })
```

---

## **📝 Mapping Function** (`mode1-manual-interactive.ts:93-106`)

```typescript
function mapCitationsToSources(citations: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return citations.map((citation, index) => ({
    id: String(citation.id ?? `source-${index + 1}`),
    url: citation.url ?? citation.link ?? '#',
    title: citation.title ?? citation.name ?? `Source ${index + 1}`,
    excerpt: citation.relevant_quote ?? citation.excerpt ?? citation.summary ?? '',
    similarity: citation.similarity ?? citation.confidence_score ?? undefined,
    domain: citation.domain,
    evidenceLevel: citation.evidence_level ?? citation.evidenceLevel ?? 'Unknown',
    organization: citation.organization,
    reliabilityScore: citation.reliabilityScore,
    lastUpdated: citation.lastUpdated,
  }));
}
```

**Mapping**:
- `citation.excerpt` → `source.excerpt`
- `citation.similarity` → `source.similarity`
- ⚠️ **Missing**: `citation.similarity_score` (AI Engine uses `similarity_score`, mapper looks for `similarity`)

---

## **🔧 Potential Fix #1: Update Mapping**

If AI Engine returns `similarity_score`, update mapper:

```typescript
similarity: citation.similarity_score ?? citation.similarity ?? citation.confidence_score ?? undefined,
```

---

## **🔧 Potential Fix #2: Update AI Engine**

If AI Engine should return `similarity`, update `main.py:933`:

```python
"similarity": source.get('similarity_score', 0.0),  # Add similarity (not similarity_score)
```

---

## **🔧 Potential Fix #3: Update Workflow**

If `mode1_manual_workflow.py` is not formatting sources correctly, check `format_output_node` (lines 365-400).

---

## **📊 What to Share**

After testing, share:
1. **Console logs** showing the 🔍 debug output
2. **AI Engine response** (`result.citations`)
3. **Mapped sources** output
4. **Sources count**
5. **Whether rag_sources metadata chunk was yielded**

---

## **🚀 Next Steps**

### **After Testing**:
1. Identify which case (A, B, or C) applies
2. Apply the corresponding fix
3. Remove debug logs
4. Test again to confirm citations display

---

**📍 Current State**:
- ✅ AI Engine: Running on port 8080
- ✅ Frontend: Running on port 3000
- ✅ Debug logs: Added to mode1 handler
- ⚠️ **NEED**: Test output to identify root cause

**Test now and share console logs!**

