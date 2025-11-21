# 🔧 **Mode 1: Tools Integration Implementation Guide**

**Estimated Time**: 2-3 hours  
**Complexity**: Medium  
**Priority**: Medium (Nice to have, not blocking)

---

## 📋 **Overview**

Add tool execution capability to Mode 1, allowing agents to use:
- `calculator` - Mathematical calculations
- `database_query` - Query Supabase database
- `web_search` - Search web using Tavily/PubMed

---

## 🎯 **Implementation Steps**

### **Step 1: Import ToolChainMixin** (5 min)

**File**: `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

**Location**: Line 33 (after other imports)

```python
# Add these imports:
from langgraph_workflows.tool_chain_mixin import ToolChainMixin
from langgraph_workflows.memory_integration_mixin import MemoryIntegrationMixin
```

**Update class definition** (Line 47):
```python
# Before:
class Mode1ManualWorkflow(BaseWorkflow):

# After:
class Mode1ManualWorkflow(BaseWorkflow, ToolChainMixin, MemoryIntegrationMixin):
```

---

### **Step 2: Initialize Tool Chain** (10 min)

**File**: Same file, in `__init__` method

**Location**: After line 74, before the logger.info()

```python
        # Initialize Tool Chain Support
        from services.tool_chain_executor import ToolChainExecutor
        self.tool_chain_executor = ToolChainExecutor(
            supabase_client=supabase_client
        )
        
        logger.info("✅ Mode1ManualWorkflow initialized with tool chain support")
```

---

### **Step 3: Add Tool Execution Logic** (1-2 hours)

**File**: Same file, in `execute_agent_node` method

**Location**: After line 273, before building `full_query`

```python
    async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Execute agent with context and optional tool execution.
        """
        tenant_id = state.get('tenant_id')
        query = state.get('query', '')
        agent_id = state.get('selected_agents', [None])[0]
        context_summary = state.get('context_summary', '')
        model = state.get('model', 'gpt-4')
        
        # NEW: Check if tools are enabled
        enable_tools = state.get('enable_tools', False)
        selected_tools = state.get('selected_tools', [])
        
        logger.info(
            "🤖 [Mode 1] Executing agent",
            agent_id=agent_id[:8] if agent_id else None,
            query_length=len(query),
            has_context=bool(context_summary),
            enable_tools=enable_tools,
            tools_count=len(selected_tools)
        )
        
        try:
            # NEW: Tool Chain Execution (if enabled)
            if enable_tools and selected_tools:
                logger.info("🔧 [Mode 1] Tools enabled, checking if tool chain should be used")
                
                # Get agent tools from database
                agent_tools = await self._get_agent_tool_names(agent_id)
                
                # Check if query requires tool usage
                query_complexity = self._estimate_query_complexity(query)
                
                if agent_tools and self.should_use_tool_chain_simple(query, complexity=query_complexity):
                    logger.info("🔗 [Mode 1] Using tool chain", tools=agent_tools)
                    
                    # Execute tool chain
                    chain_result = await self.tool_chain_executor.execute_tool_chain(
                        task=query,
                        tenant_id=str(tenant_id),
                        available_tools=agent_tools,
                        context={
                            'agent_id': agent_id,
                            'rag_context': context_summary,
                            'rag_domains': state.get('selected_rag_domains', [])
                        },
                        max_steps=3,
                        model=model
                    )
                    
                    logger.info(
                        "✅ [Mode 1] Tool chain executed",
                        steps=chain_result.steps_executed,
                        cost=chain_result.total_cost_usd,
                        success=chain_result.success,
                        tools_used=[step.action for step in chain_result.steps]
                    )
                    
                    # Return tool chain result
                    return {
                        **state,
                        'agent_response': chain_result.synthesis,
                        'response_confidence': 0.9 if chain_result.success else 0.5,
                        'citations': [],
                        'model_used': model,
                        'tool_chain_used': True,
                        'tool_chain_steps': chain_result.steps,
                        'tool_chain_cost': chain_result.total_cost_usd,
                        'tools_used': [step.action for step in chain_result.steps],
                        'current_node': 'execute_agent'
                    }
            
            # Original agent execution (without tools)
            # Build full query with context
            full_query = query
            if context_summary:
                full_query = f"{query}\n\n=== Context from Knowledge Base ===\n{context_summary}"
            
            # ... rest of existing code ...
```

---

### **Step 4: Update Output Format** (15 min)

**File**: Same file, in `format_output_node` method

**Location**: After line 338, add tool usage metadata

```python
    async def format_output_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Format final output with tool usage metadata."""
        agent_response = state.get('agent_response', '')
        confidence = state.get('response_confidence', 0.0)
        citations = state.get('citations', [])
        retrieved_documents = state.get('retrieved_documents', [])
        errors = state.get('errors', [])
        
        # NEW: Extract tool usage data
        tool_chain_used = state.get('tool_chain_used', False)
        tools_used = state.get('tools_used', [])
        tool_chain_cost = state.get('tool_chain_cost', 0.0)
        
        # ... existing code for handling errors and sources ...
        
        # NEW: Add tool summary to metadata
        tool_summary = {
            'allowed': state.get('selected_tools', []),
            'used': tools_used,
            'totals': {
                'calls': len(tools_used),
                'success': len([t for t in tools_used if 'error' not in str(t).lower()]),
                'failure': len([t for t in tools_used if 'error' in str(t).lower()]),
                'totalTimeMs': 0,  # Would need to track timing
                'totalCostUsd': tool_chain_cost
            }
        }
        
        return {
            **state,
            'response': agent_response,
            'agent_response': agent_response,
            'confidence': confidence,
            'sources': sources,
            'status': ExecutionStatus.COMPLETED,
            'tool_summary': tool_summary,  # NEW
            'tool_chain_used': tool_chain_used,  # NEW
            'current_node': 'format_output'
        }
```

---

### **Step 5: Helper Method for Query Complexity** (10 min)

**File**: Same file, add new method after `format_output_node`

```python
    def _estimate_query_complexity(self, query: str) -> str:
        """
        Estimate query complexity to determine if tools are needed.
        
        Returns: 'simple', 'medium', or 'complex'
        """
        query_lower = query.lower()
        
        # Complex queries (likely need tools)
        complex_indicators = [
            'calculate', 'compute', 'what is the result',
            'search for', 'find information', 'lookup',
            'query database', 'get data', 'retrieve',
            'how many', 'what percentage', 'statistics'
        ]
        
        if any(indicator in query_lower for indicator in complex_indicators):
            return 'complex'
        
        # Simple queries (direct answer)
        if len(query.split()) < 10:
            return 'simple'
        
        return 'medium'
```

---

### **Step 6: Test Tool Integration** (30 min)

**Test Queries**:

1. **Calculator Tool**:
   ```
   "Calculate the cost of a clinical trial with 500 patients at $10,000 per patient"
   ```
   **Expected**: Uses calculator tool, returns $5,000,000

2. **Web Search Tool**:
   ```
   "Search for the latest FDA guidelines on digital therapeutics published in 2024"
   ```
   **Expected**: Uses web_search tool, returns recent results

3. **Database Query Tool**:
   ```
   "Query the database for all agents in the Digital Health domain"
   ```
   **Expected**: Uses database_query tool, returns agent list

---

## 🔍 **Verification Checklist**

- [ ] ToolChainMixin imported and added to class
- [ ] MemoryIntegrationMixin imported and added to class
- [ ] ToolChainExecutor initialized in __init__
- [ ] Tool execution logic added to execute_agent_node
- [ ] Tool metadata included in output format
- [ ] Query complexity estimation working
- [ ] All 3 test queries return tool usage data
- [ ] Frontend shows `toolSummary.used: [...]` with actual tools
- [ ] No errors in AI Engine logs

---

## 🐛 **Common Issues & Solutions**

### **Issue 1**: `_get_agent_tool_names` not found
**Solution**: Inherited from ToolChainMixin, make sure it's in the class definition

### **Issue 2**: Tool chain executor fails
**Solution**: Check that tool registry has tools assigned to the agent in Supabase

### **Issue 3**: Tools always empty
**Solution**: Verify `enable_tools=True` and `selected_tools` are passed from frontend

---

## 📊 **Expected Result**

After implementation, Mode 1 responses should include:

```json
{
  "agent_response": "The cost is $5,000,000...",
  "tool_summary": {
    "allowed": ["calculator", "web_search", "database_query"],
    "used": ["calculator"],
    "totals": {
      "calls": 1,
      "success": 1,
      "failure": 0,
      "totalCostUsd": 0.002
    }
  },
  "tool_chain_used": true,
  "tool_chain_steps": [...]
}
```

---

## 🚀 **Deployment**

After testing:
1. Commit changes with message: "feat: Add tool chain support to Mode 1"
2. Push to GitHub
3. Deploy AI Engine to Railway
4. Test in production with real queries

---

## 📚 **Reference Files**

- **Mode 2 Implementation**: `services/ai-engine/src/langgraph_workflows/mode2_automatic_workflow.py` (lines 750-790)
- **Tool Chain Mixin**: `services/ai-engine/src/langgraph_workflows/tool_chain_mixin.py`
- **Tool Chain Executor**: `services/ai-engine/src/services/tool_chain_executor.py`

---

**TOTAL TIME**: 2-3 hours (including testing)
**PRIORITY**: Medium (Mode 1 works without tools, but tools add value)

