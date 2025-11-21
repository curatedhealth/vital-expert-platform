# 🔧 **Mode 1 Comprehensive Fix Plan**
**Date**: 2025
**Status**: In Progress
**Priority**: P0 - Critical Production Issues

---

## **📊 Executive Summary**

Based on user testing, **3 critical issues** identified in Mode 1 (Manual Interactive):

### **Issues**:
1. ✅ **RAG works when explicitly requested, but NOT automatic**
2. ❌ **Inline citations not displaying** (despite backend sending them)
3. ❌ **Tools not being used** (web search, calculator, etc.)

### **Impact**:
- User experience degraded (no automatic knowledge retrieval)
- Citations invisible (trust/credibility issue)
- Tools inactive (reduced capability)

---

## **🔍 Root Cause Analysis**

### **1. RAG Not Automatic**

#### **Current Behavior**:
- ✅ RAG **WORKS** when user explicitly asks: "use RAG and provide sources"
- ❌ RAG **DOES NOT work** automatically without prompting

#### **Investigation Findings**:

**Backend (`mode1_manual_workflow.py`)**:
```python
# Line 296-303: Context is injected, but only if context_summary exists
if context_summary:
    user_message = f"""## Knowledge Base Context (MUST CITE):

{context_summary}

## User Question:
{query}

Remember: Cite sources as [Source 1], [Source 2] in your response!"""
```

**✅ CONFIRMED**: RAG retrieval is working (10 sources retrieved)
**❌ PROBLEM**: System prompt doesn't ENFORCE automatic RAG usage

**System Prompt (Line 264-286)**:
```python
CRITICAL INSTRUCTIONS:
1. Always cite sources from the knowledge base using [Source 1], [Source 2] format.
2. For diagrams, use Mermaid syntax with ```mermaid code blocks.
3. For ASCII diagrams, use ```ascii code blocks.
```

**❌ ISSUE**: 
- Instruction says "Always cite sources **from the knowledge base**"
- But doesn't say "**ALWAYS USE** the knowledge base"
- LLM interprets this as "IF you use KB, THEN cite" NOT "MUST use KB"

---

### **2. Inline Citations Not Showing**

#### **Current Behavior**:
- ✅ Backend sends `citations` array
- ✅ Frontend receives citations
- ❌ Inline citations **NOT rendered** in markdown

#### **Investigation Findings**:

**Backend Citation Format** (`mode1_manual_workflow.py` Line 366-395):
```python
sources = []
for i, doc in enumerate(retrieved_documents, 1):
    metadata = doc.get('metadata', {})
    sources.append({
        'number': i,
        'id': f"source-{i}",
        'title': doc.get('title', f'Source {i}'),
        'excerpt': doc.get('content', '')[:200],
        'url': metadata.get('url', '#'),
        'domain': metadata.get('domain', 'Unknown'),
        # ... more fields
    })

return {
    'citations': sources,  # ✅ Sent to frontend
    # ...
}
```

**Frontend Citation Parsing** (`EnhancedMessageDisplay.tsx` Line 146-245):
```typescript
function createInlineCitationRemarkPlugin(citationMap: Map<number, Source[]>) {
  return function inlineCitations() {
    return function transformer(tree: any) {
      transformNode(tree);
    };
  };

  function transformNode(node: any) {
    // ... 
    const regex = /\[(\d+(?:\s*,\s*\d+)*)\]/g;  // ✅ Looks for [1], [2], [1,2]
    // ...
  }
}
```

**❌ ISSUE**:
- Frontend correctly parses `[1]`, `[2]`, `[1,2]` format
- BUT **AI response does NOT include** these citation markers
- Citations exist in `metadata.sources` but NOT in response content

**Example AI Response**:
```
"Each of these steps is critical to the successful development and 
commercialization of a DTx for ADHD. The process should be guided by 
the FDA's regulatory framework for Software as a Medical Device (SaMD)..."
```

**Expected**:
```
"Each of these steps is critical [1] to the successful development and 
commercialization of a DTx for ADHD. The process should be guided by 
the FDA's regulatory framework [2] for Software as a Medical Device (SaMD)..."
```

---

### **3. Tools Not Being Used**

#### **Current Behavior**:
- ✅ Tools shown in UI (calculator, database_query, web_search)
- ❌ Tools **NOT executed** by AI
- Metadata shows: `"used": []`

#### **Investigation Findings**:

**Mode 1 Workflow** (`mode1_manual_workflow.py`):
```python
# Line 233-343: execute_agent_node
async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    # ...
    # Initialize LLM if needed
    if not self.llm:
        self.llm = ChatOpenAI(
            model=model,
            temperature=agent_data.get('temperature', 0.7),
            max_tokens=agent_data.get('max_tokens', 2000)
        )
    
    # Execute
    response = await self.llm.ainvoke(messages)  # ❌ NO TOOLS BOUND!
```

**❌ ISSUE**:
- **LLM is NOT bound to tools**
- Only `ainvoke(messages)` called
- Should be: `self.llm.bind_tools(tools).ainvoke(messages)`

**Tool Registry** (`tool_registry_service.py`):
- ✅ Database has tools (web_search, calculator, database_query)
- ✅ Tools assigned to agents
- ❌ Tools not fetched/used in Mode 1 workflow

---

## **🎯 Solution Plan**

### **Phase 1: RAG Automatic Usage (2-3 hours)**

#### **1.1 Update System Prompt** ✅
**File**: `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

```python
# Line 264-286: BEFORE
system_prompt = f"""You are {agent_data.get('name', 'an AI assistant')}.

{agent_data.get('description', '')}

CRITICAL INSTRUCTIONS:
1. Always cite sources from the knowledge base using [Source 1], [Source 2] format.
2. For diagrams, use Mermaid syntax with ```mermaid code blocks.
3. For ASCII diagrams, use ```ascii code blocks.
"""

# AFTER (ENFORCE RAG USAGE):
system_prompt = f"""You are {agent_data.get('name', 'an AI assistant')}.

{agent_data.get('description', '')}

🔥 MANDATORY INSTRUCTIONS (NON-NEGOTIABLE):
1. **ALWAYS** start by analyzing the Knowledge Base Context provided below
2. **ALWAYS** base your answer primarily on the Knowledge Base sources
3. **ALWAYS** cite sources using [Source 1], [Source 2] format after EVERY factual claim
4. **NEVER** make claims without citing a source
5. If Knowledge Base doesn't have info, explicitly state: "Based on available sources, this information is not in the knowledge base."

## Knowledge Base Usage Rules:
- Read ALL sources provided in the context
- Use source information FIRST before general knowledge
- Cite source numbers inline: "The FDA requires SaMD validation [1]."
- Multiple sources: "Clinical trials are essential [1, 2]."
- End with a Sources section listing all citations

## Diagram Guidelines:
- Use Mermaid syntax with ```mermaid code blocks for flowcharts
- Use ```ascii code blocks for simple diagrams
"""
```

#### **1.2 Enforce Context Usage in User Message**
```python
# Line 296-305: BEFORE
if context_summary:
    user_message = f"""## Knowledge Base Context (MUST CITE):

{context_summary}

## User Question:
{query}

Remember: Cite sources as [Source 1], [Source 2] in your response!"""

# AFTER:
if context_summary:
    user_message = f"""🔥 CRITICAL: READ ALL SOURCES BELOW BEFORE ANSWERING!

## Knowledge Base Context ({len(retrieved_documents)} sources):
{context_summary}

## User Question:
{query}

🔥 REQUIREMENTS:
1. Base your answer ONLY on the sources above
2. Cite source numbers [1], [2] after EVERY fact
3. If sources don't cover the topic, say so explicitly
4. Do NOT use general knowledge without citing sources"""
else:
    # ❌ NO RAG CONTEXT - This should trigger a warning
    logger.warning("⚠️ No RAG context available, response may be less accurate")
    user_message = f"""⚠️ No knowledge base sources available for this query.

## User Question:
{query}

Please answer based on general knowledge, but note that specific sources are unavailable."""
```

---

### **Phase 2: Fix Inline Citations (1-2 hours)**

#### **2.1 Problem**: AI doesn't insert citation markers

**Solution A: Post-process response** (Quick fix, 30 min):
```python
# Add to format_output_node (Line 346)
def _inject_citations(agent_response: str, sources: List[Dict]) -> str:
    """
    Inject citation markers into response text.
    
    Strategy:
    1. Identify sentences with facts
    2. Match facts to source content
    3. Insert [N] markers
    """
    # Simple heuristic: Add citations at end of sentences
    # More sophisticated: Use semantic matching
    
    # For now: Return response as-is (AI should handle this)
    return agent_response
```

**Solution B: Enforce in system prompt** (Proper fix, 1 hour):
```python
# Update system prompt (Line 264):
"""
## Citation Format (MANDATORY):
- Insert [N] immediately after the relevant fact
- Example: "The FDA requires SaMD validation [1] for digital therapeutics."
- Multiple sources: "Clinical trials are essential [1, 2] for regulatory approval."
- Citations MUST be inline, not just at the end

❌ BAD: "The FDA requires SaMD validation. [1]"
✅ GOOD: "The FDA requires SaMD validation [1] for digital therapeutics."
"""
```

#### **2.2 Verify Frontend Parsing**
**File**: `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx`

Already correct (Line 172):
```typescript
const regex = /\[(\d+(?:\s*,\s*\d+)*)\]/g;  // Matches [1], [2], [1,2]
```

✅ No changes needed

---

### **Phase 3: Enable Tool Execution (3-4 hours)**

#### **3.1 Bind Tools to LLM**
**File**: `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

```python
# Line 233-343: execute_agent_node
async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Execute agent with LangGraph using agent's system_prompt AND TOOLS."""
    
    agent_data = state.get('agent_data')
    query = state.get('query', '')
    context_summary = state.get('context_summary', '')
    model = state.get('model', 'gpt-4')
    selected_tools = state.get('selected_tools', [])  # ✅ NEW
    
    # ... (validation code)
    
    try:
        # ✅ NEW: Fetch tools for agent
        tools = []
        if selected_tools:
            from services.tool_registry_service import ToolRegistryService
            tool_service = ToolRegistryService(self.supabase)
            tools = await tool_service.create_langgraph_tools(
                agent_id=agent_data['agent_id'],
                context=context_summary
            )
            logger.info(f"✅ Loaded {len(tools)} tools for agent")
        
        # Build system prompt (same as before)
        system_prompt = agent_data.get('system_prompt', '')
        # ... (system prompt logic)
        
        # ✅ UPDATE: Add tools section to system prompt
        if tools:
            tools_desc = "\n".join([f"- {t.name}: {t.description}" for t in tools])
            system_prompt += f"""

## Available Tools:
{tools_desc}

**Tool Usage Rules**:
1. Use tools when they can provide more accurate/current information
2. Web search: Use for recent events, statistics, current guidelines
3. Calculator: Use for numerical computations
4. Always explain tool results in your response
"""
        
        # Build messages
        messages = [SystemMessage(content=system_prompt)]
        # ... (add user message)
        
        # Initialize LLM if needed
        if not self.llm:
            self.llm = ChatOpenAI(
                model=model,
                temperature=agent_data.get('temperature', 0.7),
                max_tokens=agent_data.get('max_tokens', 2000)
            )
        
        # ✅ NEW: Bind tools to LLM
        if tools:
            llm_with_tools = self.llm.bind_tools(tools)
            response = await llm_with_tools.ainvoke(messages)
        else:
            response = await self.llm.ainvoke(messages)
        
        logger.info(
            "✅ Agent executed",
            response_length=len(response.content),
            tools_called=len(response.tool_calls) if hasattr(response, 'tool_calls') else 0
        )
        
        # ✅ NEW: Handle tool calls
        tool_results = []
        if hasattr(response, 'tool_calls') and response.tool_calls:
            for tool_call in response.tool_calls:
                # Execute tool
                tool_name = tool_call['name']
                tool_args = tool_call['args']
                
                # Find tool
                tool = next((t for t in tools if t.name == tool_name), None)
                if tool:
                    tool_result = await tool.ainvoke(tool_args)
                    tool_results.append({
                        'tool': tool_name,
                        'result': tool_result
                    })
        
        return {
            **state,
            'agent_response': response.content,
            'response_confidence': 0.8,
            'model_used': model,
            'tool_calls': tool_results,  # ✅ NEW
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

#### **3.2 Configure Tavily API Key**
**File**: `.env.local` or `.env.vercel`

```bash
# Add Tavily API key for web search
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Other search providers
GOOGLE_API_KEY=xxx
GOOGLE_CSE_ID=xxx
```

**Get Tavily Key**: https://tavily.com/ (Free tier: 1000 requests/month)

#### **3.3 Update Tool Registry to Show Only Production Tools**
**File**: `services/ai-engine/src/services/tool_registry_service.py`

```python
# Add filter for production-ready tools
async def get_agent_tools(
    self,
    agent_id: str,
    tenant_id: Optional[str] = None,
    production_only: bool = True  # ✅ NEW
) -> List[Dict[str, Any]]:
    """
    Get all tools assigned to an agent.
    
    Args:
        production_only: If True, only return tools with status='active'
    """
    try:
        query = self.supabase.client.from_("agent_tools") \
            .select("""
                tool_id,
                is_enabled,
                tools!inner(
                    tool_id,
                    tool_code,
                    tool_name,
                    tool_description,
                    tool_category,
                    input_schema,
                    implementation_path,
                    function_name,
                    status
                )
            """) \
            .eq("agent_id", agent_id) \
            .eq("is_enabled", True)
        
        # ✅ NEW: Filter by production status
        if production_only:
            query = query.eq("tools.status", "active")
        
        response = await query.execute()
        # ... (rest of logic)
```

---

### **Phase 4: Fix Mermaid/ASCII Diagrams (1 hour)**

#### **Issue**: Mermaid shows as code, ASCII diagrams in "Key Insight" broken

**Current Behavior** (from screenshot):
```
Note: Interactive diagram rendering temporarily disabled. View code above or paste into mermaid.live to visualize.
```

**ASCII Diagram Issue**:
The "Key Insight" box shows mangled ASCII:
```
Here's an ASCII diagram to illustrate these building blocks: ``ascii ┌───────────┐ ┌──────────┐ │Conceptuali│ │ization │ │ Regulatory │ │ Strategy │ │ Validation │ ...
```

**Solution**:
1. Keep Mermaid as code (current approach is fine for now)
2. Fix ASCII rendering in frontend

**File**: `apps/digital-health-startup/src/components/ai/response.tsx`

```typescript
// Add ASCII handling
if (!inline && language === "ascii") {
  return (
    <pre className="my-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-xs overflow-x-auto whitespace-pre">
      {code}
    </pre>
  );
}
```

---

## **📋 Implementation Checklist**

### **Phase 1: RAG Automatic (2-3 hours)** ⏳
- [ ] Update system prompt to ENFORCE RAG usage
- [ ] Add stronger language in user message
- [ ] Add fallback message when no RAG context
- [ ] Test with various queries
- [ ] Verify RAG sources are always cited

### **Phase 2: Inline Citations (1-2 hours)** ⏳
- [ ] Update system prompt with citation format examples
- [ ] Add citation format enforcement
- [ ] Test citation parsing in frontend
- [ ] Verify inline citations display correctly
- [ ] Test hover behavior on citations

### **Phase 3: Tool Integration (3-4 hours)** ⏳
- [ ] Add tool fetching to Mode 1 workflow
- [ ] Bind tools to LLM
- [ ] Handle tool calls and results
- [ ] Get Tavily API key and configure
- [ ] Update tool registry to filter production tools
- [ ] Test web search tool
- [ ] Test calculator tool
- [ ] Verify tool results in UI metadata

### **Phase 4: Diagrams (1 hour)** ⏳
- [ ] Fix ASCII diagram rendering
- [ ] Test Mermaid code display
- [ ] Verify mermaid.live link works
- [ ] Test diagram generation in responses

---

## **🧪 Testing Plan**

### **Test Cases**:

#### **TC1: RAG Automatic Usage**
```
User Query: "What are FDA guidelines for digital therapeutics?"
Expected:
- ✅ AI uses RAG sources automatically (without being asked)
- ✅ Response includes [1], [2] citations
- ✅ Sources section at bottom
- ✅ Metadata shows totalSources > 0
```

#### **TC2: Inline Citations Display**
```
User Query: "Explain SaMD classification"
Expected:
- ✅ Response has inline citations: "SaMD is classified [1] as..."
- ✅ Hover over [1] shows source details
- ✅ Click [1] scrolls to source list
- ✅ Source carousel works
```

#### **TC3: Tool Execution**
```
User Query: "What's the latest FDA guidance on AI/ML? (Use web search)"
Expected:
- ✅ AI calls web_search tool
- ✅ Tool results integrated in response
- ✅ Metadata shows toolSummary.used: ["web_search"]
- ✅ Response includes web search findings
```

#### **TC4: Mermaid Diagram**
```
User Query: "Show me a flowchart of DTx development process"
Expected:
- ✅ Response includes ```mermaid code block
- ✅ Mermaid code displays as syntax-highlighted
- ✅ Link to mermaid.live present
- ✅ Code is valid and can be visualized externally
```

#### **TC5: ASCII Diagram**
```
User Query: "Show me a simple ASCII diagram of the process"
Expected:
- ✅ Response includes ```ascii code block
- ✅ ASCII renders properly (no mangling)
- ✅ Monospace font preserved
- ✅ Whitespace/alignment correct
```

---

## **📊 Success Metrics**

| Metric | Before | Target | How to Measure |
|--------|--------|--------|----------------|
| RAG Auto-Use Rate | ~20% | 100% | Test 10 queries, count auto-RAG |
| Citations Displayed | 0% | 100% | Check for inline [N] markers |
| Tool Execution Rate | 0% | 80% | Count tool calls in metadata |
| Diagram Render Quality | 60% | 90% | Manual review of 10 diagrams |

---

## **⚠️ Risks & Mitigations**

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM ignores RAG instructions | High | Use stronger prompt language, penalties for non-compliance |
| Tools slow down response | Medium | Add timeouts, async execution |
| Tavily API costs | Low | Use free tier (1000/month), monitor usage |
| Citation parsing breaks markdown | Medium | Extensive testing, fallback to no citations |

---

## **🚀 Deployment Plan**

### **Step 1: Dev Testing** (Today)
- [ ] Implement all phases
- [ ] Test locally with `npm run dev`
- [ ] Verify all 5 test cases pass
- [ ] Check AI Engine logs for errors

### **Step 2: Staging** (Tomorrow)
- [ ] Deploy to staging environment
- [ ] Run full test suite
- [ ] Performance testing (response time)
- [ ] Load testing (concurrent requests)

### **Step 3: Production** (Next Week)
- [ ] Create PR with all changes
- [ ] Code review
- [ ] Merge to main
- [ ] Deploy to Railway
- [ ] Monitor for 24 hours

---

## **📝 Notes**

- **Priority**: Phase 1 (RAG) and Phase 2 (Citations) are highest priority
- **Tools**: Phase 3 can be optional if Tavily key not available
- **Diagrams**: Phase 4 is nice-to-have, not critical

---

## **🔗 Related Files**

- `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`
- `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx`
- `apps/digital-health-startup/src/components/ai/response.tsx`
- `services/ai-engine/src/tools/web_tools.py`
- `services/ai-engine/src/services/tool_registry_service.py`

---

**END OF DOCUMENT**

