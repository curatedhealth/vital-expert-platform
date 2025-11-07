# 🎯 **Inline Citations Fix - Perplexity Style**
**Date**: 2025
**Reference**: Shadcn AI Inline Citation Component
**Priority**: P0 - Critical UX Feature

---

## **📊 Goal: Perplexity-Style Citations**

### **Target UX** (from user screenshots):

```
According to recent studies, artificial intelligence has shown 
remarkable progress sdk.vercel.ai +2 in natural language processing.
```

**On Hover/Click**:
- **Card appears** with full citation
- **Carousel navigation**: 1/3, 2/3, 3/3
- **Source details**: Title, URL, description, quote

---

## **✅ Frontend Status: Already Working!**

**File**: `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx`

```typescript
// Line 146-245: Citation parsing logic ✅ WORKS
function createInlineCitationRemarkPlugin(citationMap: Map<number, Source[]>) {
  return function inlineCitations() {
    return function transformer(tree: any) {
      transformNode(tree);
    };
  };

  function transformNode(node: any) {
    const regex = /\[(\d+(?:\s*,\s*\d+)*)\]/g;  // ✅ Parses [1], [2], [1,2]
    // ... transforms [N] into InlineCitation components
  }
}

// Line 621-680: Citation rendering ✅ WORKS
const citationComponents = useMemo<Partial<Components>>(() => ({
  citation({ node }) {
    const number = (node as any)?.data?.citationNumber ?? '?';
    const sources = (node as any)?.data?.sources ?? [];
    
    return (
      <InlineCitation>
        <span className="text-blue-600">[{number}]</span>
        <InlineCitationCard>
          <InlineCitationCardTrigger
            sources={sources.map((source) => source.url || '')}
            label={triggerLabel}  // ✅ Shows "sdk.vercel.ai +2" style
            onClick={() => scrollToSource(primarySourceId)}
          />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselHeader>
                <InlineCitationCarouselIndex />  {/* ✅ Shows "1/3" */}
                <InlineCitationCarouselControls />
              </InlineCitationCarouselHeader>
              <InlineCitationCarouselContent>
                {sources.map((source, idx) => (
                  <InlineCitationCarouselItem key={source.id || idx}>
                    <InlineCitationSource
                      title={source.title}
                      url={source.url}
                      description={source.excerpt}
                    />
                    {source.excerpt && (
                      <InlineCitationQuote>{source.excerpt}</InlineCitationQuote>
                    )}
                  </InlineCitationCarouselItem>
                ))}
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
    );
  },
}), [scrollToSource, citationNumberMap]);
```

**✅ Conclusion**: Frontend is **100% ready**. It just needs the AI to insert `[1]`, `[2]` markers!

---

## **❌ Backend Problem: AI Not Inserting Markers**

### **Current AI Response**:
```
"According to recent studies, artificial intelligence has shown 
remarkable progress in natural language processing."
```

### **What We Need**:
```
"According to recent studies [1], artificial intelligence has shown 
remarkable progress in natural language processing [2,3]."
```

---

## **🔧 Solution: Backend Citation Generation**

### **Option A: LangGraph Structured Output** ⭐ **Recommended**

**Approach**: Use LangChain's `with_structured_output()` to force citation format

**File**: `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

```python
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List, Optional

# Line 50-75: Add Citation Schema
class Citation(BaseModel):
    """A single citation with source information."""
    number: int = Field(description="Citation number (1, 2, 3, ...)")
    title: str = Field(description="Source title")
    url: str = Field(description="Source URL")
    description: Optional[str] = Field(default=None, description="Source description")
    quote: Optional[str] = Field(default=None, description="Relevant quote from source")

class AgentResponseWithCitations(BaseModel):
    """Agent response with inline citations."""
    content: str = Field(
        description=(
            "Response content WITH inline citation markers. "
            "Use [1], [2], [3] format. "
            "Example: 'The FDA requires validation [1] for SaMD devices [2,3].'"
        )
    )
    citations: List[Citation] = Field(
        description="List of sources cited in the response"
    )

# Line 233-343: Update execute_agent_node
async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Execute agent with LangGraph using structured output for citations."""
    
    agent_data = state.get('agent_data')
    query = state.get('query', '')
    context_summary = state.get('context_summary', '')
    retrieved_documents = state.get('retrieved_documents', [])
    model = state.get('model', 'gpt-4')
    
    # ... (validation code)
    
    try:
        # Build system prompt
        system_prompt = agent_data.get('system_prompt', '')
        
        if not system_prompt:
            logger.warning("⚠️ No system_prompt found, using default")
            system_prompt = f"""You are {agent_data.get('name', 'an AI assistant')}.

{agent_data.get('description', '')}

🔥 MANDATORY CITATION RULES (NON-NEGOTIABLE):
1. **ALWAYS** cite sources using [N] format immediately after facts
2. **INLINE citations**: Place [N] right after the relevant text, NOT at sentence end
3. **Multiple sources**: Use [1,2] or [1,2,3] for multiple citations
4. **Every fact MUST have a citation**: No unsourced claims

## Citation Format Examples:
✅ GOOD: "The FDA requires SaMD validation [1] for digital therapeutics."
✅ GOOD: "Clinical trials are essential [1,2] for regulatory approval [3]."
❌ BAD: "The FDA requires SaMD validation. [1]"
❌ BAD: "Clinical trials are essential for regulatory approval. [1,2,3]"

## Source Mapping:
"""
        
        # Add source mapping to system prompt
        if retrieved_documents:
            for i, doc in enumerate(retrieved_documents[:10], 1):
                title = doc.get('title', f'Source {i}')
                excerpt = doc.get('content', '')[:150]
                system_prompt += f"\n[Source {i}]: {title}\n  Excerpt: {excerpt}...\n"
        
        # Build user message
        if context_summary:
            user_message = f"""🔥 READ ALL SOURCES BELOW, THEN ANSWER WITH INLINE CITATIONS!

## Knowledge Base Sources:
{context_summary}

## User Question:
{query}

🔥 REMEMBER: 
- Cite sources inline: [1], [2], [3]
- Place citations immediately after facts
- Use all relevant sources
- Every claim needs a citation number"""
        else:
            user_message = query
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message)
        ]
        
        # Initialize LLM with structured output
        if not self.llm:
            from core.config import get_settings
            settings = get_settings()
            self.llm = ChatOpenAI(
                model=model,
                temperature=agent_data.get('temperature', 0.7),
                max_tokens=agent_data.get('max_tokens', 2000)
            )
        
        # ✅ NEW: Use structured output for citations
        llm_with_structure = self.llm.with_structured_output(
            AgentResponseWithCitations,
            method="json_mode"  # Use JSON mode for reliability
        )
        
        # Update messages to request JSON
        messages[0] = SystemMessage(content=system_prompt + """

## Output Format:
You MUST respond in this exact JSON format:
{
  "content": "Your response with inline citations [1], [2], etc.",
  "citations": [
    {
      "number": 1,
      "title": "Source title",
      "url": "https://...",
      "description": "Brief description",
      "quote": "Relevant quote from source"
    }
  ]
}
""")
        
        # Execute with structured output
        response: AgentResponseWithCitations = await llm_with_structure.ainvoke(messages)
        
        logger.info(
            "✅ Agent executed with structured citations",
            response_length=len(response.content),
            citations_count=len(response.citations)
        )
        
        # Map citations back to original sources
        formatted_citations = []
        for citation in response.citations:
            # Find original source by number
            if citation.number <= len(retrieved_documents):
                original_doc = retrieved_documents[citation.number - 1]
                formatted_citations.append({
                    'number': citation.number,
                    'id': f"source-{citation.number}",
                    'title': citation.title,
                    'url': citation.url or original_doc.get('metadata', {}).get('url', '#'),
                    'excerpt': citation.quote or original_doc.get('content', '')[:200],
                    'domain': original_doc.get('metadata', {}).get('domain', 'Unknown'),
                    # ... other fields
                })
        
        return {
            **state,
            'agent_response': response.content,  # ✅ Now has [1], [2] markers!
            'citations': formatted_citations,    # ✅ Structured citations
            'response_confidence': 0.8,
            'model_used': model,
            'current_node': 'execute_agent'
        }
        
    except Exception as e:
        logger.error("❌ Agent execution failed", error=str(e), exc_info=True)
        return {
            **state,
            'agent_response': '',
            'response_confidence': 0.0,
            'errors': state.get('errors', []) + [f"Execution failed: {str(e)}"],
            'current_node': 'execute_agent'
        }
```

---

### **Option B: Post-Process Citation Injection** (Fallback)

If structured output doesn't work reliably, post-process the response:

```python
def _inject_citation_markers(
    response_text: str,
    sources: List[Dict[str, Any]]
) -> tuple[str, List[Dict]]:
    """
    Inject citation markers into response text using semantic matching.
    
    Strategy:
    1. Split response into sentences
    2. For each sentence, find matching sources (semantic similarity)
    3. Inject [N] markers at end of relevant sentences
    4. Return modified text + citation list
    """
    import re
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    
    # Load embedding model
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', response_text)
    
    # Embed sentences and sources
    sentence_embeddings = model.encode(sentences)
    source_texts = [s.get('content', '')[:500] for s in sources]
    source_embeddings = model.encode(source_texts)
    
    # Match sentences to sources
    modified_sentences = []
    citation_mapping = {}
    
    for i, (sentence, sent_emb) in enumerate(zip(sentences, sentence_embeddings)):
        # Find top matching sources
        similarities = cosine_similarity([sent_emb], source_embeddings)[0]
        top_sources = [j+1 for j, sim in enumerate(similarities) if sim > 0.3][:3]
        
        if top_sources:
            # Inject citation marker
            if sentence.endswith('.'):
                modified_sentence = sentence[:-1] + f" [{','.join(map(str, top_sources))}]."
            else:
                modified_sentence = sentence + f" [{','.join(map(str, top_sources))}]"
            
            modified_sentences.append(modified_sentence)
            citation_mapping[i] = top_sources
        else:
            modified_sentences.append(sentence)
    
    # Build citation list
    citations = []
    for i, source in enumerate(sources, 1):
        citations.append({
            'number': i,
            'title': source.get('title'),
            'url': source.get('metadata', {}).get('url', '#'),
            'excerpt': source.get('content', '')[:200],
            # ...
        })
    
    return ' '.join(modified_sentences), citations
```

---

## **🎯 Implementation Plan**

### **Step 1: Update Mode 1 Workflow (2 hours)**

1. ✅ Add `Citation` and `AgentResponseWithCitations` Pydantic models
2. ✅ Update `execute_agent_node` to use `.with_structured_output()`
3. ✅ Update system prompt with citation format examples
4. ✅ Map structured citations back to original sources
5. ✅ Test with sample query

**File**: `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

---

### **Step 2: Update format_output_node (30 min)**

Ensure citations are passed to frontend in correct format:

```python
# Line 346-400: format_output_node
async def format_output_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Format final output with citations."""
    agent_response = state.get('agent_response', '')  # ✅ Now has [1], [2] markers
    citations = state.get('citations', [])             # ✅ Structured citations
    confidence = state.get('response_confidence', 0.0)
    errors = state.get('errors', [])
    
    # Check for errors
    if not agent_response and errors:
        logger.warning("⚠️ No response, workflow failed", errors=errors)
        return {
            **state,
            'response': '',
            'sources': [],
            'citations': [],
            'status': ExecutionStatus.FAILED,
            'error': '; '.join(errors),
            'current_node': 'format_output'
        }
    
    logger.info(
        "✅ Mode 1 workflow complete",
        response_length=len(agent_response),
        citations_count=len(citations)
    )
    
    return {
        **state,
        'response': agent_response,  # ✅ With [1], [2] markers
        'sources': citations,        # ✅ For collapsible sources section
        'citations': citations,      # ✅ For inline citation parsing
        'confidence': confidence,
        'status': ExecutionStatus.COMPLETED,
        'current_node': 'format_output'
    }
```

---

### **Step 3: Test Frontend Rendering (30 min)**

1. ✅ Send test response with `[1]`, `[2]` markers
2. ✅ Verify citation badges appear inline
3. ✅ Test hover card functionality
4. ✅ Test carousel navigation (1/3, 2/3, 3/3)
5. ✅ Verify click scrolls to source

**Test Payload**:
```json
{
  "content": "According to recent studies [1], artificial intelligence has shown remarkable progress in natural language processing [2,3]. The technology continues to evolve rapidly [1,2].",
  "citations": [
    {
      "number": 1,
      "title": "FDA Software as Medical Device",
      "url": "https://fda.gov/samd",
      "description": "Clinical evaluation guidelines",
      "quote": "Software as a Medical Device requires validation..."
    },
    {
      "number": 2,
      "title": "AI Progress Report 2024",
      "url": "https://example.com/ai-report",
      "description": "Recent breakthroughs in NLP",
      "quote": "Natural language processing has advanced..."
    },
    {
      "number": 3,
      "title": "Digital Health Trends",
      "url": "https://example.com/dh-trends",
      "description": "Market analysis",
      "quote": "Digital health adoption is accelerating..."
    }
  ]
}
```

---

## **✅ Success Criteria**

After implementation, the UI should show:

1. ✅ **Inline citation badges**: `sdk.vercel.ai +2` style
2. ✅ **Hover card** with full citation details
3. ✅ **Carousel navigation**: 1/3, 2/3, 3/3
4. ✅ **Click behavior**: Scroll to source in sources section
5. ✅ **Multiple sources**: Handle `[1,2,3]` format correctly

---

## **📊 Example Output**

### **AI Response**:
```
According to recent studies [1], artificial intelligence has shown 
remarkable progress in natural language processing [2,3]. The technology 
continues to evolve rapidly, with new breakthroughs being announced 
regularly [1,2,3].
```

### **Rendered UI**:
```
According to recent studies [fda.gov ↗], artificial intelligence has 
shown remarkable progress in natural language processing [ai-report.com +1]. 
The technology continues to evolve rapidly, with new breakthroughs being 
announced regularly [fda.gov +2].
```

**On Hover/Click**: Citation card appears with full details + carousel

---

## **🔗 References**

- **Shadcn AI**: https://www.shadcn.io/registry/ai.json
- **Perplexity Citations**: https://perplexity.ai (for UX inspiration)
- **LangChain Structured Output**: https://python.langchain.com/docs/how_to/structured_output

---

**END OF DOCUMENT**

