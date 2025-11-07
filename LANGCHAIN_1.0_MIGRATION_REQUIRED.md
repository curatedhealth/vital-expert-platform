# ⚠️ LANGCHAIN 1.0 BREAKING CHANGES - MIGRATION REQUIRED

## 🔥 Critical Issue

The AI Engine **cannot start** due to **LangChain 1.0 breaking changes**:

```python
ImportError: cannot import name 'create_openai_tools_agent' from 'langchain.agents'
ModuleNotFoundError: No module named 'langchain_core.pydantic_v1'
```

---

## 📊 What Happened

### Original Problem
- `langchain-anthropic` and `langchain-google-genai` were not installed
- User requested to fix dependencies, not comment them out

### Attempted Fix
- Installed all packages: `langchain-anthropic`, `langchain-google-genai`
- Encountered **dependency hell** due to version conflicts
- **Final solution**: Upgraded ALL LangChain packages to 1.0+

### Packages Upgraded
```bash
langchain: 0.2.16 → 1.0.3
langchain-openai: 0.1.23 → 1.0.2
langchain-community: 0.2.16 → 0.4.1
langchain-anthropic: 0.1.13 → 1.0.1
langchain-google-genai: 0.0.11 → 3.0.1
langchain-text-splitters: 0.2.4 → 1.0.0
langgraph: 0.6.11 → 1.0.2
langgraph-prebuilt: 0.6.5 → 1.0.2
langsmith: 0.1.147 → 0.4.41
langchain-core: 0.2.43 → 1.0.3
```

---

## 🚨 Breaking Changes in LangChain 1.0

### 1. **Removed: `langchain_core.pydantic_v1`**
- **Impact**: All imports using `pydantic_v1` fail
- **Solution**: Install `pydantic-compat` (✅ DONE)

### 2. **Removed: `create_openai_tools_agent`**
- **Impact**: `agent_orchestrator.py` cannot start
- **Location**: `services/ai-engine/src/services/agent_orchestrator.py:12`
- **Current Code**:
  ```python
  from langchain.agents import create_openai_tools_agent, AgentExecutor
  ```
- **Solution**: Refactor to use LangChain 1.0 agent creation API

### 3. **Removed: Other deprecated APIs** (potential)
- `AgentExecutor` may have changed
- Agent creation patterns have evolved
- Tool binding syntax may differ

---

## 🛠️ Required Refactoring

### File: `services/ai-engine/src/services/agent_orchestrator.py`

**Current Issue**:
```python
from langchain.agents import create_openai_tools_agent, AgentExecutor
```

**Migration Path** (LangChain 1.0):

#### Option A: Use New Agent API
```python
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_openai import ChatOpenAI

# Create agent with tool calling
agent = create_tool_calling_agent(
    llm=ChatOpenAI(model="gpt-4"),
    tools=tools,
    prompt=prompt,
)

# Create executor
agent_executor = AgentExecutor(agent=agent, tools=tools)
```

#### Option B: Use LangGraph (Recommended for Mode 1-4)
```python
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

# Create agent with LangGraph
agent = create_react_agent(
    model=ChatOpenAI(model="gpt-4"),
    tools=tools,
)

# Use directly
result = await agent.ainvoke({"messages": [("user", "query")]})
```

---

## 📝 Refactoring Steps

### Step 1: Audit All Imports
```bash
cd services/ai-engine
grep -r "from langchain.agents import" src/
grep -r "from langchain_core.pydantic_v1 import" src/
grep -r "create_openai_tools_agent" src/
```

### Step 2: Update `agent_orchestrator.py`
- Replace `create_openai_tools_agent` with `create_tool_calling_agent` or LangGraph
- Update agent creation logic
- Update tool binding
- Test agent execution

### Step 3: Test All Modes
- Mode 1: Manual
- Mode 2: Automatic
- Mode 3: Manual Autonomous
- Mode 4: Automatic Autonomous

### Step 4: Restart AI Engine
```bash
cd services/ai-engine
source venv/bin/activate
PORT=8080 python src/main.py
```

---

## 🎯 Recommended Approach

### For `agent_orchestrator.py`:

**Since Mode 1-4 workflows use LangGraph**, the `AgentOrchestrator` is only used for:
- Legacy Mode 2/4 (if applicable)
- Fallback scenarios

**Recommendation**: Use **`create_tool_calling_agent`** (simplest migration):

```python
# services/ai-engine/src/services/agent_orchestrator.py

from langchain.agents import create_tool_calling_agent, AgentExecutor  # ✅ NEW
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

async def _create_agent(self, agent_data: Dict[str, Any], tools: List) -> AgentExecutor:
    """Create LangChain agent with tools (LangChain 1.0)."""
    
    # Build system prompt
    system_prompt = self._build_medical_system_prompt(agent_data)
    
    # Create prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])
    
    # Create LLM
    llm = ChatOpenAI(
        model=agent_data.get("model", "gpt-4-turbo"),
        temperature=agent_data.get("temperature", 0.7),
    )
    
    # Create agent (✅ NEW API)
    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt)
    
    # Create executor
    return AgentExecutor(agent=agent, tools=tools, verbose=True)
```

---

## ⏰ Estimated Time

- **Step 1 (Audit)**: 15 min
- **Step 2 (Refactor agent_orchestrator.py)**: 30-45 min
- **Step 3 (Test)**: 15-20 min
- **Total**: ~1-1.5 hours

---

## 📚 References

- [LangChain 1.0 Migration Guide](https://python.langchain.com/docs/versions/migrating_chains/conversation_chain_migration)
- [LangChain Agents (1.0)](https://python.langchain.com/docs/concepts/#agents)
- [LangGraph PreBuilt Agents](https://langchain-ai.github.io/langgraph/reference/prebuilt/)

---

## ✅ Next Steps

1. **NOW**: Refactor `agent_orchestrator.py` to use `create_tool_calling_agent`
2. **THEN**: Restart AI Engine
3. **FINALLY**: Test Mode 1 streaming with LangGraph

---

**Status**: 🔴 **BLOCKED** - Cannot start AI Engine until refactoring is complete.

