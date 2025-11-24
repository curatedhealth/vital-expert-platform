# 🔧 **PHASE 2: GAP REMEDIATION PLAN**

**Date**: November 23, 2025  
**Status**: 📋 Implementation Ready  
**Goal**: Connect LangGraph nodes to existing registries and services

---

## 🎯 **THREE GAPS TO CLOSE**

### **Gap 1**: Tool Execution (Mocked)
**Current**: Placeholder implementations returning mock data  
**Fix**: Connect to existing `ToolRegistry` in `services/tool_registry.py`

### **Gap 2**: Consensus Detection (Basic)
**Current**: Simple boolean checks  
**Fix**: Use agent execution for consensus evaluation across all 4 services

### **Gap 3**: Production Skills (Mocked)
**Current**: Placeholder skill implementations  
**Fix**: Connect to skills database and create skill MD files

---

## 📋 **IMPLEMENTATION TASKS**

### **Task 1: Connect Tool Nodes to Tool Registry** ⏳
**File**: `services/ai-engine/src/langgraph_compilation/nodes/tool_nodes.py`

**Changes**:
1. Import `ToolRegistry` from `services.tool_registry`
2. Replace `_execute_api_tool()`, `_execute_database_tool()`, `_execute_internal_tool()`
3. Use `registry.get_tool(tool_name)` and `tool.execute()`

**Evidence of Integration**:
- ✅ Tool registry exists: `services/ai-engine/src/services/tool_registry.py`
- ✅ Has `get_tool()` and tool execution methods
- ✅ Already used in `mode1_manual_query.py` workflow

---

### **Task 2: Use Agents for Consensus in Panel Service** ⏳
**File**: `services/ai-engine/src/langgraph_compilation/panel_service.py`

**Changes**:
1. Replace `_check_consensus()` with agent-based consensus evaluator
2. Create consensus evaluator agent that compares responses
3. Use same pattern across Ask Expert, Ask Panel, Workflows, Solution Builder

**Integration Points**:
- ✅ `GraphRAGSelector` exists for agent selection
- ✅ `UnifiedAgentLoader` loads agents from database
- ✅ `MedicalAffairsAgentSelector` for specialized agent selection
- ✅ All use the `agents` table

---

### **Task 3: Connect Skills to Database** ⏳
**Files**: 
- `services/ai-engine/src/langgraph_compilation/nodes/skill_nodes.py`
- Create: `services/ai-engine/docs/skills/*.md`

**Changes**:
1. Load real skill data from `skills` table
2. Execute skills based on `python_module`, `callable_name`
3. Create MD documentation for each skill category

**Evidence of Skills DB**:
- ✅ Skills table exists with executable columns
- ✅ Seeded with 40+ skills
- ✅ Has `python_module`, `callable_name`, `is_executable`

---

## 🛠️ **DETAILED IMPLEMENTATION**

### **1. Tool Registry Integration**

```python
# tool_nodes.py

from services.tool_registry import get_tool_registry

async def _execute_tool(
    state: AgentState,
    tool_data: Dict,
    config: Dict
) -> Dict[str, Any]:
    """Execute tool using Tool Registry"""
    
    # Get tool registry
    registry = get_tool_registry()
    
    # Get tool by name
    tool_name = tool_data.get('name') or tool_data.get('slug')
    tool = registry.get_tool(tool_name)
    
    if not tool:
        return {
            "success": False,
            "error": f"Tool not found in registry: {tool_name}"
        }
    
    try:
        # Build tool context
        tool_context = {
            "tenant_id": state.get('tenant_id'),
            "user_id": state.get('user_id'),
            "session_id": state.get('session_id'),
            "query": state.get('query')
        }
        
        # Execute tool
        result = await tool.execute(
            input_data=config.get('input_data', {}),
            context=tool_context
        )
        
        # Record usage
        registry.record_usage(tool_name, success=result.get('success', True))
        
        return {
            "success": True,
            "tool_name": tool_name,
            "result": result
        }
        
    except Exception as e:
        logger.error("tool_execution_failed", tool=tool_name, error=str(e))
        registry.record_usage(tool_name, success=False)
        
        return {
            "success": False,
            "tool_name": tool_name,
            "error": str(e)
        }
```

---

### **2. Agent-Based Consensus Evaluator**

```python
# panel_service.py

async def _check_consensus(
    self,
    responses: List[Dict],
    query: str,
    tenant_id: str
) -> tuple[bool, str]:
    """
    Use an agent to evaluate consensus
    
    Returns:
        (consensus_reached, explanation)
    """
    
    # Load consensus evaluator agent
    from services.unified_agent_loader import UnifiedAgentLoader
    
    loader = UnifiedAgentLoader(self.pg)
    
    # Get specialized consensus agent or use default
    try:
        evaluator = await loader.load_agent_by_name(
            "Consensus Evaluator",
            tenant_id=tenant_id
        )
    except:
        evaluator = await loader.load_default_agent_for_domain(
            "analysis",
            tenant_id=tenant_id
        )
    
    # Build consensus evaluation prompt
    response_summary = "\n\n".join([
        f"**Agent {i+1} ({r['agent_name']})**: {r['response']}"
        for i, r in enumerate(responses)
    ])
    
    consensus_prompt = f"""Analyze these expert responses for consensus:

Query: {query}

Responses:
{response_summary}

Evaluate:
1. Do the experts fundamentally agree?
2. What are the main points of agreement?
3. What are the areas of disagreement?
4. Overall consensus level: LOW, MEDIUM, or HIGH

Format:
CONSENSUS: [LOW/MEDIUM/HIGH]
EXPLANATION: [your analysis]
AGREEMENT_POINTS: [bullet list]
DISAGREEMENT_POINTS: [bullet list]
"""
    
    # Execute agent with GraphRAG
    from graphrag import get_graphrag_service
    
    graphrag = await get_graphrag_service()
    
    # Get context
    rag_response = await graphrag.query(
        query=consensus_prompt,
        agent_id=evaluator.id,
        session_id=state.get('session_id'),
        tenant_id=tenant_id
    )
    
    # Call LLM
    from openai import AsyncOpenAI
    from graphrag.config import get_graphrag_config
    
    config = get_graphrag_config()
    client = AsyncOpenAI(api_key=config.openai_api_key)
    
    result = await client.chat.completions.create(
        model=evaluator.model_name or "gpt-4",
        messages=[
            {"role": "system", "content": evaluator.system_prompt},
            {"role": "user", "content": consensus_prompt}
        ]
    )
    
    analysis = result.choices[0].message.content
    
    # Parse consensus level
    consensus_reached = "HIGH" in analysis or "MEDIUM" in analysis
    
    return consensus_reached, analysis
```

---

### **3. Skills Database Integration**

```python
# skill_nodes.py

async def _load_skill(pg, skill_id: UUID) -> Dict[str, Any]:
    """Load executable skill from database"""
    query = """
    SELECT
        id,
        name,
        slug,
        description,
        category,
        skill_type,
        python_module,
        callable_name,
        is_executable,
        requires_context,
        is_stateful,
        parameters_schema,
        metadata
    FROM skills
    WHERE id = $1 AND is_active = true AND deleted_at IS NULL
    """
    
    return await pg.fetchrow(query, skill_id)


async def _execute_skill_dynamic(
    state: AgentState,
    skill_data: Dict,
    config: Dict
) -> Dict[str, Any]:
    """Execute skill based on database configuration"""
    
    if not skill_data.get('is_executable'):
        return {
            "success": False,
            "error": "Skill is not marked as executable"
        }
    
    python_module = skill_data.get('python_module')
    callable_name = skill_data.get('callable_name')
    
    if not python_module or not callable_name:
        # Fall back to type-based execution
        skill_type = skill_data.get('skill_type', 'general')
        return await _execute_skill_by_type(state, skill_data, skill_type)
    
    try:
        # Dynamically import and execute
        import importlib
        
        module = importlib.import_module(python_module)
        skill_func = getattr(module, callable_name)
        
        # Build skill context
        skill_context = {
            "query": state.get('query'),
            "context": state.get('context'),
            "user_id": state.get('user_id'),
            "session_id": state.get('session_id')
        }
        
        # Execute
        if inspect.iscoroutinefunction(skill_func):
            result = await skill_func(skill_context)
        else:
            result = skill_func(skill_context)
        
        return {
            "success": True,
            "skill_name": skill_data['name'],
            "result": result
        }
        
    except Exception as e:
        logger.error(
            "skill_execution_failed",
            skill=skill_data['name'],
            error=str(e)
        )
        
        return {
            "success": False,
            "skill_name": skill_data['name'],
            "error": str(e)
        }
```

---

### **4. Skill Documentation (MD Files)**

Create documentation for each skill category:

**Files to Create**:
1. `services/ai-engine/docs/skills/planning_skills.md`
2. `services/ai-engine/docs/skills/delegation_skills.md`
3. `services/ai-engine/docs/skills/search_skills.md`
4. `services/ai-engine/docs/skills/analysis_skills.md`
5. `services/ai-engine/docs/skills/generation_skills.md`
6. `services/ai-engine/docs/skills/validation_skills.md`
7. `services/ai-engine/docs/skills/communication_skills.md`
8. `services/ai-engine/docs/skills/data_retrieval_skills.md`
9. `services/ai-engine/docs/skills/execution_skills.md`

**Template**:
```markdown
# {Category} Skills

## Overview
Description of skill category and use cases.

## Skills

### {Skill Name}
**ID**: `{skill_slug}`  
**Type**: `{skill_type}`  
**Complexity**: `{complexity_level}`

**Description**: {description}

**Usage Example**:
```python
result = await execute_skill(
    skill_id="skill_slug",
    context={...}
)
```

**Parameters**:
- `param1`: Description
- `param2`: Description

**Returns**:
```json
{
  "success": true,
  "result": {...}
}
```

**Best Practices**:
- Practice 1
- Practice 2

**Limitations**:
- Limitation 1
- Limitation 2
```

---

## ✅ **ACCEPTANCE CRITERIA**

### **Task 1: Tool Registry**
- [ ] `tool_nodes.py` imports `ToolRegistry`
- [ ] Tool execution uses `registry.get_tool()`
- [ ] Tool results returned from real tools
- [ ] Usage tracking enabled

### **Task 2: Consensus Evaluator**
- [ ] Agent-based consensus evaluation
- [ ] Returns consensus level + explanation
- [ ] Used in all 4 services (Ask Expert, Panel, Workflows, Solution Builder)
- [ ] Replaces basic boolean checks

### **Task 3: Skills Integration**
- [ ] Skills loaded from database
- [ ] Dynamic execution via `python_module` + `callable_name`
- [ ] 9 skill MD files created
- [ ] Each skill documented with examples

---

## 🧪 **TESTING STRATEGY**

### **Integration Tests**:
1. **Tool Execution**:
   ```python
   async def test_tool_node_real_execution():
       # Test with actual tool from registry
       node_func = await compile_tool_node(config)
       result = await node_func(state)
       assert result['tool_results'][0]['success'] == True
   ```

2. **Consensus Evaluation**:
   ```python
   async def test_agent_consensus():
       consensus, explanation = await service._check_consensus(
           responses=[...],
           query="test",
           tenant_id="test"
       )
       assert isinstance(consensus, bool)
       assert len(explanation) > 0
   ```

3. **Skill Execution**:
   ```python
   async def test_skill_dynamic_execution():
       skill_data = await load_skill(skill_id)
       result = await execute_skill_dynamic(state, skill_data, {})
       assert result['success'] == True
   ```

---

## 📊 **ESTIMATED EFFORT**

| Task | Time | Complexity |
|------|------|------------|
| Tool Registry Integration | 2 hours | Low |
| Consensus Evaluator | 4 hours | Medium |
| Skills Integration | 6 hours | Medium-High |
| Skill MD Files | 4 hours | Low |
| Testing | 4 hours | Medium |
| **Total** | **20 hours** | **Medium** |

---

## 🚀 **IMPLEMENTATION ORDER**

1. **Task 1: Tool Registry** (Quick Win)
   - Immediate value
   - Low risk
   - Clear interface

2. **Task 3: Skills Integration** (Foundation)
   - Enables dynamic execution
   - Creates documentation
   - Supports future growth

3. **Task 2: Consensus Evaluator** (Advanced)
   - Depends on agent execution
   - Cross-service integration
   - Highest value

---

## 📝 **NOTES**

### **Design Decisions**:
1. **Tool Registry**: Use existing singleton pattern
2. **Consensus**: Use agent-as-judge pattern (proven in LLM evaluations)
3. **Skills**: Support both dynamic import AND type-based fallback

### **Backward Compatibility**:
- All changes are internal to node compilers
- External API (compile_*_node) remains unchanged
- Existing tests continue to work with mocks

### **Future Enhancements**:
- Tool result caching
- Consensus confidence scoring
- Skill performance metrics
- Skill recommendation engine

---

**Ready to implement!** 🎯

