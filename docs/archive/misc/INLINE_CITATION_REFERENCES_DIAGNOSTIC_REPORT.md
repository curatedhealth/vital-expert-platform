# Inline Citations & References - Comprehensive Diagnostic Report

**Date**: 2025-11-07  
**Status**: ❌ CRITICAL ISSUE - NOT RESOLVED  
**For Review By**: Next Agent

---

## 🔴 PROBLEM STATEMENT

**Inline citations and references are NOT displaying correctly**, despite multiple fix attempts. The frontend consistently shows:

```json
"sources": [],           // ❌ Empty array (no sources received)
"citations": [],         // ❌ Empty array (no citations parsed)
"ragSummary": {
  "totalSources": 0,     // ❌ Zero sources
  "domains": ["digital-health", "regulatory-affairs"],
  "cacheHit": false
}
```

**Expected Behavior:**
1. **Backend**: RAG retrieval returns sources with full metadata
2. **Backend**: Sources are emitted via SSE with proper structure
3. **Frontend**: Receives sources array in final message
4. **Frontend**: Parses inline citation markup `[1]`, `[2,3]` from content
5. **Frontend**: Renders pill-style citations with hover details
6. **Frontend**: Displays clean Chicago-style reference list at end

**Actual Behavior:**
- **No sources received** from backend (`totalSources: 0`)
- Content contains citation markup `[1,2,3,4,5]` but no source data to match
- Inline citations render as `[?]` fallback badges (no hover details)
- References section is empty (no data to display)

---

## 📋 CONSOLE LOG ANALYSIS

### Key Evidence from Logs:

1. **Sources Array Always Empty:**
   ```javascript
   Has sources: 0
   📚 Sources data: Array(0)
   📚 Sources type: Array
   📚 First source: undefined
   totalSources: 0
   ```

2. **Citations Array Always Empty:**
   ```javascript
   "citations": []
   ```

3. **RAG Summary Shows No Results:**
   ```javascript
   "ragSummary": {
     "totalSources": 0,
     "domains": ["digital-health", "regulatory-affairs"],
     "cacheHit": false
   }
   ```

4. **Content Contains Citation Markup But No Sources:**
   ```javascript
   Content preview: "Based on the provided sources, a digital strategy for 
   patients with ADHD could involve the following steps:
   1. **Identify Key Digital Health Initiatives**: ... [2,3,4,5]."
   ```
   - Citations `[2,3,4,5]` present in text
   - But `sources: []` means no data to link to

5. **Missing Backend Logs:**
   - **NEVER** see: `"✅ [RAG] Retrieved N sources"`
   - **NEVER** see: `"🔍 [Debug] RAG sources event: ..."`
   - This indicates RAG retrieval is **NOT returning any documents**

---

## 🔧 FIXES ATTEMPTED (All Failed)

### **Fix #1: Pill-Style Inline Citations with Hover**
**Location:** `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx` (lines 772-834)

**Code Changes:**
```typescript
// Enhanced inline citation rendering with pill-style badges
const citationComponents = useMemo(() => {
  return {
    a: ({ href, children, ...props }: any) => {
      const citationMatch = href?.match(/^#citation-(\d+)$/);
      
      if (citationMatch && metadata?.sources) {
        const citationNumber = parseInt(citationMatch[1], 10);
        const source = metadata.sources[citationNumber - 1];
        
        return (
          <InlineCitation>
            <InlineCitationCardTrigger
              citationNumber={citationNumber}
              className="..."
            >
              <Badge variant="secondary" className="...">
                {citationNumber}
              </Badge>
            </InlineCitationCardTrigger>
            {source && (
              <InlineCitationCard>
                <InlineCitationCardContent>
                  <div className="...">
                    <strong>{source.title || 'Untitled'}</strong>
                  </div>
                  {source.excerpt && (
                    <p className="...">{source.excerpt}</p>
                  )}
                  {source.url && (
                    <a href={source.url} className="...">
                      View Source →
                    </a>
                  )}
                </InlineCitationCardContent>
              </InlineCitationCard>
            )}
          </InlineCitation>
        );
      }
      
      // ... other link handling
    }
  };
}, [metadata?.sources]);
```

**Fallback for Missing Sources (lines 791-800):**
```typescript
// If source is not in metadata.sources, render fallback
if (!source) {
  return (
    <Badge 
      variant="outline" 
      className="mx-0.5 px-1.5 py-0 text-[10px] cursor-help border-gray-300 text-gray-500"
      title="Source reference not found"
    >
      {citationNumber || '?'}
    </Badge>
  );
}
```

**Result:** ⚠️ **PARTIALLY WORKING** - Fallback renders `[?]` badges, but no hover details because `sources: []`

---

### **Fix #2: Clean Chicago-Style References**
**Location:** `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx` (lines 1201-1258)

**Code Changes:**
```typescript
{!isUser && metadata?.sources && metadata.sources.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center gap-2 mb-3">
      <BookOpen className="h-4 w-4 text-blue-600" />
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        References
      </h4>
      <Badge variant="secondary" className="text-[10px]">
        {metadata.sources.length}
      </Badge>
    </div>
    
    <div className="space-y-2">
      {metadata.sources.map((source: any, idx: number) => {
        const year = source.publishedDate 
          ? new Date(source.publishedDate).getFullYear()
          : new Date().getFullYear();
        
        const organization = source.organization || source.domain || 'Unknown';
        
        return (
          <div key={`ref-${idx}`} className="flex items-start gap-2 text-xs">
            <Badge 
              variant="outline" 
              className="shrink-0 w-6 h-6 flex items-center justify-center text-[10px] mt-0.5"
            >
              {idx + 1}
            </Badge>
            <div className="flex-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {organization}.
              </span>
              {' '}
              {source.url ? (
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                >
                  "{source.title || 'Untitled'}"
                </a>
              ) : (
                <span className="text-gray-700 dark:text-gray-300">
                  "{source.title || 'Untitled'}"
                </span>
              )}
              {' '}
              <span className="text-gray-600 dark:text-gray-400">
                {source.domain || 'Unknown Domain'}, {year}.
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </motion.div>
)}
```

**Result:** ❌ **NEVER RENDERS** - Section requires `metadata.sources.length > 0`, but sources array is always empty

---

### **Fix #3: Extracted References Component**
**Location:** `packages/ai-components/src/components/References.tsx`

**Purpose:** Created a shared `References` component for reuse across all modes

**Code Structure:**
```typescript
export const References = memo(({ sources, className }: ReferencesProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  if (!sources || sources.length === 0) {
    return null; // ❌ Always returns null because sources.length === 0
  }

  return (
    <motion.div /* ... Chicago-style reference list ... */>
      {sources.map((source, idx) => (
        <ChicagoCitationJSX key={idx} source={source} index={idx} />
      ))}
    </motion.div>
  );
});
```

**Result:** ❌ **NOT YET INTEGRATED** - Component exists but not used in main app (and would return null anyway)

---

## 🔍 ROOT CAUSE ANALYSIS

### **Hypothesis 1: Backend RAG Retrieval Returning No Documents**

**Evidence:**
- Console logs show `totalSources: 0` consistently
- `ragSummary.cacheHit: false` indicates RAG was attempted but found nothing
- Backend code shows RAG node exists but may not be executing correctly

**Investigation Needed:**

1. **Check Backend RAG Node Execution:**
   ```
   services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py
   - Line 243-313: rag_retrieval_node function
   - Line 284: sources = self._retrieve_documents(...)
   ```
   
   **Add Debug Logging:**
   ```python
   # In rag_retrieval_node (line ~280)
   sources = self._retrieve_documents(
       query=query,
       agent_data=agent_data,
       tenant_id=tenant_id
   )
   
   # 🔍 DEBUG: Log RAG retrieval results
   logger.info(f"🔍 [RAG Debug] Retrieved sources count: {len(sources)}")
   logger.info(f"🔍 [RAG Debug] First source (if any): {sources[0] if sources else 'None'}")
   logger.info(f"🔍 [RAG Debug] Query: {query}")
   logger.info(f"🔍 [RAG Debug] Agent domains: {agent_data.get('knowledge_domains', [])}")
   ```

2. **Check RAG Service Configuration:**
   ```
   services/ai-engine/src/services/unified_rag_service.py
   ```
   - Verify Pinecone connection
   - Check if index exists and has data
   - Verify embedding model is working
   - Check if tenant isolation is filtering out all results

3. **Check Pinecone Vector Database:**
   - Does the index exist? (`vital-knowledge-base` or similar)
   - Does it contain any vectors?
   - Are the vectors tagged with correct domains?
   - Are the metadata fields correctly structured?

**Expected Backend Output:**
```
🔍 [RAG Debug] Retrieved sources count: 5
🔍 [RAG Debug] First source (if any): {'id': '...', 'title': '...', 'metadata': {...}}
✅ [RAG] Retrieved 5 sources from 2 domains
```

**Actual Output (Suspected):**
```
🔍 [RAG Debug] Retrieved sources count: 0
🔍 [RAG Debug] First source (if any): None
⚠️ [RAG] No sources found for query
```

---

### **Hypothesis 2: RAG Sources Not Properly Formatted for Frontend**

**Evidence:**
- Backend may return sources but in wrong format
- Frontend expects specific structure: `{ id, title, url, domain, excerpt, ... }`
- Metadata nesting issues (like with `reasoning_steps`)

**Investigation Needed:**

1. **Check Source Normalization:**
   ```
   services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py
   - Line 906-955: normalize_citation function
   ```
   
   **Expected Structure:**
   ```python
   {
     "id": "unique-id",
     "title": "Source Title",
     "url": "https://...",
     "domain": "digital-health",
     "organization": "WHO",
     "sourceType": "article",
     "similarity": 0.85,
     "excerpt": "First 200 chars...",
     "publishedDate": "2024-01-01",
     "metadata": { ... }
   }
   ```

2. **Check SSE Emission:**
   ```
   services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py
   - Line 829: state.get('sources', [])
   ```
   
   **Add Debug Logging:**
   ```python
   # In format_output_node (line ~829)
   sources = state.get('sources', [])
   
   # 🔍 DEBUG: Log sources before emission
   logger.info(f"🔍 [Final State] sources count: {len(sources)}")
   logger.info(f"🔍 [Final State] sources structure: {sources[:1] if sources else 'None'}")
   
   return {
       **state,
       'sources': sources,
       ...
   }
   ```

3. **Verify Frontend SSE Handler:**
   ```
   apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx
   - Line 1970-2000: Final message creation
   ```
   
   **Add Debug Logging:**
   ```typescript
   // Before creating final assistant message
   console.log('🔍 [Sources Debug] streamingMeta.sources:', streamingMeta?.sources);
   console.log('🔍 [Sources Debug] sourcesBuffer:', sourcesBuffer);
   console.log('🔍 [Sources Debug] Type:', typeof sourcesBuffer);
   console.log('🔍 [Sources Debug] IsArray:', Array.isArray(sourcesBuffer));
   ```

---

### **Hypothesis 3: RAG Not Being Called At All**

**Evidence:**
- No backend logs showing RAG execution
- `cacheHit: false` but also `totalSources: 0` suggests no attempt was made
- Workflow might be skipping RAG node

**Investigation Needed:**

1. **Check LangGraph Workflow Configuration:**
   ```
   services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py
   - Line 1023-1100: Workflow graph construction
   ```
   
   **Verify RAG Node is in Graph:**
   ```python
   # Check if rag_retrieval_node is added to the graph
   workflow.add_node("rag_retrieval", self.rag_retrieval_node)
   
   # Check if edges connect to RAG node
   workflow.add_edge("validate_input", "rag_retrieval")
   workflow.add_edge("rag_retrieval", "execute_agent")
   ```

2. **Check Conditional Edges:**
   - Is there a condition that skips RAG?
   - Check `agent_data.get('rag_enabled', False)`
   - Check if domains are properly set

3. **Add Entry/Exit Logging to RAG Node:**
   ```python
   def rag_retrieval_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
       logger.info("🔍 [RAG Node] ENTERED rag_retrieval_node")
       
       # ... existing code ...
       
       logger.info(f"🔍 [RAG Node] EXITING with {len(sources)} sources")
       return {
           'sources': sources,
           'reasoning_steps': reasoning_steps,
           ...
       }
   ```

---

### **Hypothesis 4: Pinecone Index Empty or Misconfigured**

**Evidence:**
- RAG might be executing but finding no results
- Vector database might be empty
- Embeddings might be failing

**Investigation Needed:**

1. **Check Pinecone Index Status:**
   ```python
   # Add to services/ai-engine/src/services/unified_rag_service.py
   
   def get_index_stats(self):
       try:
           stats = self.index.describe_index_stats()
           logger.info(f"📊 [Pinecone] Index stats: {stats}")
           return stats
       except Exception as e:
           logger.error(f"❌ [Pinecone] Failed to get stats: {e}")
           return None
   ```
   
   **Expected Output:**
   ```
   📊 [Pinecone] Index stats: {
     'dimension': 3072,
     'index_fullness': 0.05,
     'namespaces': {
       'digital-health': {'vector_count': 1500},
       'regulatory-affairs': {'vector_count': 800}
     },
     'total_vector_count': 2300
   }
   ```
   
   **If Empty:**
   ```
   📊 [Pinecone] Index stats: {
     'total_vector_count': 0
   }
   ```

2. **Check Embedding Service:**
   ```python
   # In unified_rag_service.py
   
   def _get_query_embedding(self, query: str):
       logger.info(f"🔍 [Embedding] Generating embedding for: {query[:50]}...")
       
       try:
           embedding = self.embeddings.embed_query(query)
           logger.info(f"✅ [Embedding] Generated {len(embedding)}-dim vector")
           return embedding
       except Exception as e:
           logger.error(f"❌ [Embedding] Failed: {e}")
           return None
   ```

3. **Test RAG Retrieval Directly:**
   ```python
   # Add a test endpoint to main.py
   
   @app.get("/api/test-rag")
   async def test_rag():
       try:
           sources = await unified_rag_service.retrieve(
               query="test query",
               tenant_id="test-tenant",
               knowledge_domains=["digital-health"],
               top_k=5
           )
           
           return {
               "success": True,
               "sources_count": len(sources),
               "sources": sources
           }
       except Exception as e:
           return {
               "success": False,
               "error": str(e)
           }
   ```

---

## 📁 ALL RELEVANT FILES

### **Backend (Python)**

1. **LangGraph Workflow - RAG Node**
   ```
   services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py
   ```
   - **Lines 243-313**: `rag_retrieval_node` - Main RAG retrieval function
   - **Lines 271-288**: `_retrieve_documents` - Calls RAG service
   - **Lines 906-955**: `normalize_citation` - Formats sources for frontend
   - **Lines 829-840**: `format_output_node` - Final state emission
   - **Lines 1023-1100**: Workflow graph construction
   - **KEY CHECK**: Is RAG node being called? Are sources in final state?

2. **RAG Service**
   ```
   services/ai-engine/src/services/unified_rag_service.py
   ```
   - Main RAG retrieval logic
   - Pinecone integration
   - Embedding generation
   - Source formatting
   - **KEY CHECK**: Is Pinecone returning results?

3. **Shared RAG Service (Refactored)**
   ```
   services/vital-ai-services/src/vital_ai_services/rag/service.py
   ```
   - Extracted RAG service for reuse
   - May not be fully integrated yet

4. **Main AI Engine Entry Point**
   ```
   services/ai-engine/src/main.py
   ```
   - Port 8080 configuration
   - RAG service initialization
   - **KEY CHECK**: Is RAG service properly initialized?

---

### **Frontend (TypeScript/React)**

1. **Main Ask Expert Page - SSE Handler**
   ```
   apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx
   ```
   - **Lines 1424-1510**: `updates` event handler
   - **Lines 1970-2000**: Final message creation with sources
   - **Lines 1062-1070**: API endpoint configuration
   - **KEY CHECK**: Are sources being extracted from SSE?

2. **Message Display Component - Citations & References**
   ```
   apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx
   ```
   - **Lines 772-834**: Inline citation rendering with pill-style badges
   - **Lines 791-800**: Fallback for missing sources (`[?]` badge)
   - **Lines 1201-1258**: Chicago-style references section
   - **Lines 357-413**: `ChicagoCitationJSX` component (clean format)
   - **KEY CHECK**: Is component receiving sources? What happens when sources array is empty?

3. **Shadcn AI Inline Citation Component**
   ```
   apps/digital-health-startup/src/components/ui/shadcn-io/ai/inline-citation.tsx
   ```
   - Provides hover card for citation details
   - Carousel for multiple sources
   - Badge styling
   - **STATUS**: Component is correct, just needs data

4. **Shared References Component (Not Yet Integrated)**
   ```
   packages/ai-components/src/components/References.tsx
   packages/ai-components/src/index.ts
   ```
   - Extracted reusable component
   - **STATUS**: Created but not used

---

### **Configuration Files**

1. **Frontend Environment**
   ```
   apps/digital-health-startup/.env.local
   ```
   - `NEXT_PUBLIC_PYTHON_AI_ENGINE_URL=http://localhost:8080`
   - **KEY CHECK**: Correct port

2. **Backend Environment**
   ```
   services/ai-engine/.env
   ```
   - `PORT=8080`
   - `OPENAI_API_KEY=[key]` (for embeddings)
   - `PINECONE_API_KEY=[key]`
   - `PINECONE_ENVIRONMENT=[env]`
   - `PINECONE_INDEX_NAME=[name]`
   - **KEY CHECK**: Are Pinecone credentials correct?

---

## 🧪 DEBUGGING STEPS FOR NEXT AGENT

### **Step 1: Verify RAG Node Execution (CRITICAL)**

Add debug logging to `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`:

**At Entry of `rag_retrieval_node` (line ~243):**
```python
def rag_retrieval_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
    """RAG retrieval node - retrieves relevant documents."""
    
    # 🔍 DEBUG: Log entry
    logger.info("=" * 80)
    logger.info("🔍 [RAG NODE] ENTERED rag_retrieval_node")
    logger.info(f"🔍 [RAG NODE] Query: {state.get('query', 'NO QUERY')}")
    logger.info(f"🔍 [RAG NODE] Agent domains: {state.get('agent_data', {}).get('knowledge_domains', [])}")
    logger.info("=" * 80)
    
    # ... existing code ...
```

**After `_retrieve_documents` (line ~284):**
```python
sources = self._retrieve_documents(
    query=query,
    agent_data=agent_data,
    tenant_id=tenant_id
)

# 🔍 DEBUG: Log RAG results
logger.info("=" * 80)
logger.info(f"🔍 [RAG RESULTS] Retrieved {len(sources)} sources")
if sources:
    logger.info(f"🔍 [RAG RESULTS] First source: {sources[0].get('title', 'NO TITLE')}")
    logger.info(f"🔍 [RAG RESULTS] First source keys: {list(sources[0].keys())}")
else:
    logger.warning("⚠️ [RAG RESULTS] NO SOURCES RETRIEVED!")
logger.info("=" * 80)
```

**At Exit of `rag_retrieval_node` (line ~312):**
```python
# 🔍 DEBUG: Log exit
logger.info("=" * 80)
logger.info(f"🔍 [RAG NODE] EXITING with {len(sources)} sources")
logger.info("=" * 80)

return {
    'sources': sources,
    'reasoning_steps': reasoning_steps,
    'retrieved_documents': sources,
    **state
}
```

**Expected Output:**
```
================================================================================
🔍 [RAG NODE] ENTERED rag_retrieval_node
🔍 [RAG NODE] Query: Develop a digital strategy for patients with ADHD
🔍 [RAG NODE] Agent domains: ['digital-health', 'regulatory-affairs']
================================================================================
================================================================================
🔍 [RAG RESULTS] Retrieved 5 sources
🔍 [RAG RESULTS] First source: Digital Health Strategy Guidelines
🔍 [RAG RESULTS] First source keys: ['id', 'title', 'url', 'domain', 'excerpt', ...]
================================================================================
================================================================================
🔍 [RAG NODE] EXITING with 5 sources
================================================================================
```

**If No Sources:**
```
================================================================================
🔍 [RAG NODE] ENTERED rag_retrieval_node
🔍 [RAG NODE] Query: Develop a digital strategy for patients with ADHD
🔍 [RAG NODE] Agent domains: ['digital-health', 'regulatory-affairs']
================================================================================
================================================================================
🔍 [RAG RESULTS] Retrieved 0 sources
⚠️ [RAG RESULTS] NO SOURCES RETRIEVED!
================================================================================
```

**→ If NO SOURCES, move to Step 2 (Pinecone)**

---

### **Step 2: Verify Pinecone Index Has Data**

Add index stats check to `services/ai-engine/src/services/unified_rag_service.py`:

**Add Method:**
```python
def get_index_stats(self):
    """Get Pinecone index statistics for debugging."""
    try:
        stats = self.index.describe_index_stats()
        logger.info("=" * 80)
        logger.info("📊 [PINECONE STATS]")
        logger.info(f"  Total vectors: {stats.get('total_vector_count', 0)}")
        logger.info(f"  Dimension: {stats.get('dimension', 0)}")
        logger.info(f"  Namespaces: {stats.get('namespaces', {})}")
        logger.info("=" * 80)
        return stats
    except Exception as e:
        logger.error(f"❌ [PINECONE] Failed to get stats: {e}")
        return None
```

**Call in `retrieve` Method (before querying):**
```python
async def retrieve(self, query: str, tenant_id: str, knowledge_domains: List[str] = None, top_k: int = 5):
    # 🔍 DEBUG: Check index stats
    self.get_index_stats()
    
    # ... existing code ...
```

**Expected Output (If Index Has Data):**
```
================================================================================
📊 [PINECONE STATS]
  Total vectors: 2300
  Dimension: 3072
  Namespaces: {'digital-health': {'vector_count': 1500}, 'regulatory-affairs': {'vector_count': 800}}
================================================================================
```

**Expected Output (If Index Empty):**
```
================================================================================
📊 [PINECONE STATS]
  Total vectors: 0
  Dimension: 3072
  Namespaces: {}
================================================================================
```

**→ If EMPTY, Pinecone has no data! Need to run knowledge pipeline.**

---

### **Step 3: Verify Frontend Receives Sources**

Add debug logging to `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`:

**In `updates` event handler (after line 1510):**
```typescript
// 🔍 DEBUG: Check for sources in updates event
if (actualState.sources && Array.isArray(actualState.sources)) {
  console.log('=' .repeat(80));
  console.log('🔍 [Sources Debug] Found sources in updates event!');
  console.log('🔍 [Sources Debug] Count:', actualState.sources.length);
  console.log('🔍 [Sources Debug] First source:', actualState.sources[0]);
  console.log('=' .repeat(80));
  sourcesBuffer = actualState.sources;
  setStreamingMeta(prev => ({
    ...prev,
    sources: actualState.sources
  }));
} else {
  console.log('⚠️ [Sources Debug] No sources in updates event');
  console.log('⚠️ [Sources Debug] actualState keys:', Object.keys(actualState));
}
```

**Before creating final message (line ~1970):**
```typescript
// 🔍 DEBUG: Check sources before final message
console.log('=' .repeat(80));
console.log('🔍 [Final Message] Sources check:');
console.log('  - sourcesBuffer:', sourcesBuffer);
console.log('  - sourcesBuffer length:', sourcesBuffer?.length || 0);
console.log('  - streamingMeta.sources:', streamingMeta?.sources);
console.log('  - Type:', typeof sourcesBuffer);
console.log('=' .repeat(80));
```

**Expected Output (If Working):**
```
================================================================================
🔍 [Sources Debug] Found sources in updates event!
🔍 [Sources Debug] Count: 5
🔍 [Sources Debug] First source: {id: '...', title: '...', url: '...'}
================================================================================
...
================================================================================
🔍 [Final Message] Sources check:
  - sourcesBuffer: [{...}, {...}, {...}, {...}, {...}]
  - sourcesBuffer length: 5
  - streamingMeta.sources: [{...}, {...}, {...}, {...}, {...}]
  - Type: object
================================================================================
```

**Expected Output (If Broken):**
```
⚠️ [Sources Debug] No sources in updates event
⚠️ [Sources Debug] actualState keys: ['tenant_id', 'user_id', 'query', ...]
...
================================================================================
🔍 [Final Message] Sources check:
  - sourcesBuffer: []
  - sourcesBuffer length: 0
  - streamingMeta.sources: undefined
  - Type: object
================================================================================
```

---

### **Step 4: Test RAG Retrieval Directly**

Create a test endpoint to bypass LangGraph and test RAG directly:

**Add to `services/ai-engine/src/main.py`:**
```python
@app.get("/api/test-rag")
async def test_rag():
    """Test RAG retrieval directly (bypassing LangGraph)."""
    try:
        logger.info("🧪 [TEST] Testing RAG retrieval...")
        
        # Test query
        test_query = "digital health strategy for ADHD patients"
        test_domains = ["digital-health", "regulatory-affairs"]
        
        # Get index stats
        stats = unified_rag_service.get_index_stats()
        
        # Try retrieval
        sources = await unified_rag_service.retrieve(
            query=test_query,
            tenant_id="test-tenant",
            knowledge_domains=test_domains,
            top_k=5
        )
        
        logger.info(f"✅ [TEST] Retrieved {len(sources)} sources")
        
        return {
            "success": True,
            "query": test_query,
            "domains": test_domains,
            "sources_count": len(sources),
            "sources": sources[:2],  # First 2 for brevity
            "index_stats": stats
        }
        
    except Exception as e:
        logger.error(f"❌ [TEST] RAG test failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }
```

**Test with curl:**
```bash
curl http://localhost:8080/api/test-rag | jq
```

**Expected Output (If Working):**
```json
{
  "success": true,
  "query": "digital health strategy for ADHD patients",
  "domains": ["digital-health", "regulatory-affairs"],
  "sources_count": 5,
  "sources": [
    {
      "id": "...",
      "title": "Digital Health Guidelines",
      "url": "https://...",
      "domain": "digital-health",
      "excerpt": "..."
    },
    ...
  ],
  "index_stats": {
    "total_vector_count": 2300
  }
}
```

**Expected Output (If Broken):**
```json
{
  "success": true,
  "sources_count": 0,
  "sources": [],
  "index_stats": {
    "total_vector_count": 0  // ← INDEX IS EMPTY!
  }
}
```

---

### **Step 5: Check Knowledge Pipeline Execution**

If Pinecone is empty, need to run the knowledge pipeline to ingest documents:

**Check if pipeline has been run:**
```bash
# Check for pipeline reports
ls -la scripts/knowledge/pipeline_report_*.md

# Check Supabase for knowledge_base table
# Should have records with status='indexed' and vector_id not null
```

**Run knowledge pipeline:**
```bash
cd scripts/knowledge
python pipeline.py --tenant-id <tenant-id> --mode batch
```

**Verify ingestion:**
```bash
# Test RAG endpoint again
curl http://localhost:8080/api/test-rag | jq '.sources_count'
```

---

## 🚨 CRITICAL UNKNOWNS

1. **Is RAG node being executed?**
   - Need backend logs from Step 1

2. **Is Pinecone index empty?**
   - Need index stats from Step 2
   - If empty, need to run knowledge pipeline

3. **Are sources in correct format?**
   - Need to see structure of sources array
   - Check if frontend expects different keys

4. **Are sources in SSE stream?**
   - Need frontend logs from Step 3
   - Check which SSE event contains sources

5. **Is embedding service working?**
   - Need to verify OpenAI embeddings are generating
   - Check if API key is valid

6. **Is tenant isolation filtering everything out?**
   - Check if tenant_id in query matches vectors in Pinecone
   - May need to adjust filtering logic

---

## 📊 SUMMARY OF CHANGES MADE

### **Files Modified:**

1. **`apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx`**
   - ✅ Added pill-style inline citations with hover details (lines 772-834)
   - ✅ Added fallback `[?]` badge for missing sources (lines 791-800)
   - ✅ Implemented clean Chicago-style references (lines 1201-1258)
   - ✅ Removed redundant URL display from references
   - ⚠️ Result: Components work but receive no data (`sources: []`)

2. **`packages/ai-components/src/components/References.tsx`**
   - ✅ Created shared References component
   - ✅ Implemented `useSourceScroll` hook for carousel
   - ⚠️ Result: Not yet integrated (and would return null with empty sources)

3. **`packages/ai-components/src/index.ts`**
   - ✅ Exported References component and types

4. **`services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`**
   - ✅ `normalize_citation` function (lines 906-955) formats sources correctly
   - ✅ `rag_retrieval_node` (lines 243-313) should retrieve and emit sources
   - ✅ `format_output_node` (lines 829-840) preserves sources in final state
   - ❌ Result: Sources not being retrieved (suspected RAG issue)

### **Files Created:**

1. `INLINE_CITATION_PILL_FIX.md` - Documentation of inline citation fix
2. `CHICAGO_STYLE_REFERENCES_FIX.md` - Documentation of references format fix
3. `packages/ai-components/src/components/References.tsx` - Shared component

---

## 🎯 RECOMMENDED NEXT STEPS

### **Priority 1: Verify RAG Execution (CRITICAL)**
1. Add debug logging to `rag_retrieval_node` (Step 1 above)
2. Restart backend and test with query
3. Check if node is executed and what it returns
4. **If NOT executed** → Fix workflow graph
5. **If executed but returns 0 sources** → Move to Priority 2

### **Priority 2: Verify Pinecone Has Data**
1. Add index stats logging (Step 2 above)
2. Check if index has vectors
3. **If empty (total_vector_count: 0)** → Move to Priority 3
4. **If has data but retrieval fails** → Check query/embedding generation

### **Priority 3: Run Knowledge Pipeline**
1. Check if pipeline has been run recently
2. Verify pipeline configuration (domains, sources)
3. Run pipeline to ingest documents
4. Verify vectors are in Pinecone
5. Test RAG endpoint again

### **Priority 4: Verify Frontend Reception**
1. Add debug logging to SSE handler (Step 3 above)
2. Check if sources arrive in `updates` event
3. Check if sources are in final message
4. **If NOT present** → SSE format issue
5. **If present** → Rendering issue

### **Priority 5: Integration Testing**
1. Once sources flow correctly, test inline citations
2. Verify hover cards display source details
3. Test references section rendering
4. Verify Chicago-style formatting

---

## 🔗 RELATED ISSUES

### **Issue #1: Empty AI Reasoning Steps**
- See `AI_REASONING_DIAGNOSTIC_REPORT.md`
- **Related to**: Similar SSE/state management issue
- **Separate from**: RAG retrieval issue
- **Connection**: Both involve LangGraph state emission and frontend SSE handling

### **Issue #2: RAG Service May Not Be Initialized**
- Backend may not be initializing RAG service correctly
- Check `services/ai-engine/src/main.py` for service initialization
- Verify `unified_rag_service` is not None

---

## 📞 CONTACT / HANDOFF

**Current State:**
- Frontend citation rendering components are **READY** (pill-style, hover, Chicago format)
- Backend RAG node code looks **CORRECT** (unverified)
- Sources array is **ALWAYS EMPTY** (critical issue)
- **Root cause unknown** - need backend debugging to confirm RAG execution

**Most Likely Root Cause:**
1. **Pinecone index is empty** (no vectors ingested)
2. **RAG node not being called** (workflow issue)
3. **RAG retrieval failing silently** (error handling)

**Testing Commands:**
```bash
# Backend (Terminal 1)
cd services/ai-engine
python3 src/main.py
# Watch for: "🔍 [RAG NODE] ENTERED rag_retrieval_node"
# Watch for: "🔍 [RAG RESULTS] Retrieved N sources"

# Frontend (Terminal 2)
cd apps/digital-health-startup
pnpm dev
# Watch browser console for: "🔍 [Sources Debug] Found sources in updates event!"

# Test RAG Directly (Terminal 3)
curl http://localhost:8080/api/test-rag | jq
# Expected: "sources_count": 5 (or > 0)
# If 0: Pinecone is empty
```

**Test Query:**
"Develop a digital strategy for patients with ADHD"

**Expected Result:**
- Backend: Retrieves 5 sources from Pinecone
- Backend: Emits sources in SSE `updates` event
- Frontend: Receives sources in `actualState.sources`
- Frontend: Displays `[1][2][3][4][5]` as interactive pill badges with hover
- Frontend: Shows Chicago-style reference list at end with 5 entries

**Actual Result:**
- Backend: Unknown (no logs)
- Backend: No sources emitted (or not captured)
- Frontend: `sources: []`
- Frontend: Fallback `[?]` badges (no hover)
- Frontend: References section not rendered (requires sources.length > 0)

---

## 🔧 QUICK FIXES TO TRY

### **Quick Fix #1: Bypass LangGraph and Test RAG**
Add test endpoint (Step 4 above) and call it directly to isolate RAG service

### **Quick Fix #2: Check if RAG Service is Initialized**
```python
# In services/ai-engine/src/main.py
# After service initialization
logger.info(f"🔍 [STARTUP] RAG service initialized: {unified_rag_service is not None}")
logger.info(f"🔍 [STARTUP] RAG service type: {type(unified_rag_service)}")
```

### **Quick Fix #3: Mock Sources for Frontend Testing**
```typescript
// In apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx
// Add mock sources to test rendering (TEMPORARY)
const mockSources = [
  {
    id: 'test-1',
    title: 'Digital Health Guidelines',
    url: 'https://example.com',
    domain: 'digital-health',
    organization: 'WHO',
    excerpt: 'Test excerpt...',
    similarity: 0.85
  }
];

// In final message creation
metadata: {
  sources: sourcesBuffer.length > 0 ? sourcesBuffer : mockSources, // ← Add mock fallback
  ...
}
```

**This will confirm frontend rendering works, isolating the issue to backend.**

---

**END OF DIAGNOSTIC REPORT**

This document contains all information needed for the next agent to debug inline citations and references.

