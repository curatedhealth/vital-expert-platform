# Workflow Services Integration Map

**Date:** November 17, 2025
**Status:** Integration Guide
**Purpose:** Map 4 Ask Expert mode workflows to existing AI-Engine services

---

## Executive Summary

The 4 mode workflows (`mode1_manual_query.py`, `mode2_auto_query.py`, `mode3_manual_chat_autonomous.py`, `mode4_auto_chat_autonomous.py`) need to use **EXISTING services** instead of creating imaginary ones.

All required services already exist in `services/ai-engine/src/services/`.

---

## ✅ Existing Services Mapping

### Core Services Available

| Workflow Needs | Existing Service | File Path | Usage |
|----------------|-----------------|-----------|-------|
| **RAG Retrieval** | `UnifiedRAGService` | `services/unified_rag_service.py` | ✅ Vector search (Pinecone + Supabase) with caching |
| **Agent Execution** | `AgentOrchestrator` | `services/agent_orchestrator.py` | ✅ Execute expert agents with LangChain |
| **Sub-Agent Spawning** | `SubAgentSpawner` | `services/sub_agent_spawner.py` | ✅ Deep hierarchy (specialists, workers, tools) |
| **Expert Selection** | `AgentSelectorService` | `services/agent_selector_service.py` | ✅ AI-powered agent selection |
| **Multi-Agent Panel** | `PanelOrchestrator` | `services/panel_orchestrator.py` | ✅ Multi-expert consensus |
| **Tool Registry** | `ToolRegistry` | `services/tool_registry.py` | ✅ Tool management & discovery |
| **Tool Linking** | `ToolRegistryService` | `services/tool_registry_service.py` | ✅ Agent-tool relationships |
| **Conversation** | `ConversationManager` | `services/conversation_manager.py` | ✅ Chat history management |
| **Enhanced Conversation** | `EnhancedConversationManager` | `services/enhanced_conversation_manager.py` | ✅ Advanced chat features |
| **Caching** | `CacheManager` | `services/cache_manager.py` | ✅ Redis caching (Golden Rule #2) |
| **Consensus** | `ConsensusCalculator` | `services/consensus_calculator.py` | ✅ Multi-expert consensus |
| **Confidence** | `ConfidenceCalculator` | `services/confidence_calculator.py` | ✅ Response confidence scoring |
| **Session Memory** | `SessionMemoryService` | `services/session_memory_service.py` | ✅ Long-term memory |
| **Feedback** | `FeedbackManager` | `services/feedback_manager.py` | ✅ User feedback storage (Golden Rule #5) |
| **Streaming** | `StreamingManager` | `services/streaming_manager.py` | ✅ Real-time streaming responses |

---

## ❌ Services to REMOVE from Workflows

These services were referenced in the workflows but **DO NOT EXIST**:

1. ❌ `DeepAgentOrchestrator` → Use `AgentOrchestrator` + `SubAgentSpawner`
2. ❌ `AutonomousReasoner` → Use `AgentOrchestrator` with appropriate prompts
3. ❌ `ConsensusBuilder` → Use `ConsensusCalculator`
4. ❌ `CodeExecutor` → Use `ToolRegistry` with code execution tools
5. ❌ `ToolExecutor` → Use `ToolRegistry.execute_tool()`

---

## 🔧 How to Fix Each Mode Workflow

### Mode 1: Manual Query (`mode1_manual_query.py`)

**Current (WRONG):**
```python
from services.deep_agent_orchestrator import DeepAgentOrchestrator  # ❌ Does not exist
from services.tool_executor import ToolExecutor  # ❌ Does not exist
```

**Fixed (CORRECT):**
```python
from services.agent_orchestrator import AgentOrchestrator  # ✅ Exists
from services.sub_agent_spawner import SubAgentSpawner  # ✅ Exists
from services.unified_rag_service import UnifiedRAGService  # ✅ Exists
from services.tool_registry import ToolRegistry  # ✅ Exists
from services.cache_manager import CacheManager  # ✅ Exists
```

**Initialization:**
```python
def __init__(self, supabase_client):
    super().__init__(...)

    # Use EXISTING services
    self.agent_orchestrator = AgentOrchestrator(supabase_client, rag_pipeline)
    self.sub_agent_spawner = SubAgentSpawner()
    self.rag_service = UnifiedRAGService(supabase_client)
    self.tool_registry = ToolRegistry()
    self.cache_manager = CacheManager()

    await self.rag_service.initialize()
    await self.agent_orchestrator.initialize()
```

---

### Mode 2: Auto Query (`mode2_auto_query.py`)

**Current (WRONG):**
```python
from services.deep_agent_orchestrator import DeepAgentOrchestrator  # ❌
from services.consensus_builder import ConsensusBuilder  # ❌
```

**Fixed (CORRECT):**
```python
from services.agent_selector_service import AgentSelectorService  # ✅
from services.panel_orchestrator import PanelOrchestrator  # ✅
from services.consensus_calculator import ConsensusCalculator  # ✅
from services.unified_rag_service import UnifiedRAGService  # ✅
from services.tool_registry import ToolRegistry  # ✅
```

**Key Method:**
```python
async def execute_experts_parallel_node(self, state):
    """Execute 3-5 experts in parallel"""

    # Use PanelOrchestrator for multi-expert execution
    panel_result = await self.panel_orchestrator.execute_panel(
        expert_ids=state['selected_agents'],
        query=state['query'],
        tenant_id=state['tenant_id']
    )

    # Use ConsensusCalculator for synthesis
    consensus = await self.consensus_calculator.calculate_consensus(
        responses=panel_result['expert_responses']
    )

    return {
        **state,
        'agent_responses': panel_result['expert_responses'],
        'synthesized_response': consensus['synthesis'],
        'agreement_score': consensus['agreement_score']
    }
```

---

### Mode 3: Manual Chat Autonomous (`mode3_manual_chat_autonomous.py`)

**Current (WRONG):**
```python
from services.autonomous_reasoner import AutonomousReasoner  # ❌
from services.code_executor import CodeExecutor  # ❌
```

**Fixed (CORRECT):**
```python
from services.agent_orchestrator import AgentOrchestrator  # ✅
from services.sub_agent_spawner import SubAgentSpawner  # ✅
from services.enhanced_conversation_manager import EnhancedConversationManager  # ✅
from services.tool_registry import ToolRegistry  # ✅
from services.session_memory_service import SessionMemoryService  # ✅
```

**Autonomous Reasoning (via Prompts):**
```python
async def execute_expert_autonomous_node(self, state):
    """Execute expert with Chain-of-Thought reasoning"""

    # Chain-of-Thought is done via system prompt, not separate service
    system_prompt = """You are a medical expert using Chain-of-Thought reasoning.

    For each question:
    1. Break down the problem
    2. Think step-by-step
    3. Show your reasoning
    4. Provide final answer

    Use this format:
    **Thinking:** [your step-by-step reasoning]
    **Analysis:** [your analysis]
    **Conclusion:** [your final answer]
    """

    # Execute agent with reasoning prompt
    response = await self.agent_orchestrator.execute_agent(
        agent_id=state['current_agent_id'],
        query=state['query'],
        system_prompt=system_prompt,  # Chain-of-Thought built into prompt
        tenant_id=state['tenant_id']
    )

    # Spawn sub-agents if needed
    if state.get('requires_sub_agents'):
        sub_agent_id = await self.sub_agent_spawner.spawn_specialist(
            parent_agent_id=state['current_agent_id'],
            task="Specific sub-task",
            specialty="Domain-specific",
            context={}
        )

        sub_result = await self.sub_agent_spawner.execute_sub_agent(sub_agent_id)

    return {...}
```

---

### Mode 4: Auto Chat Autonomous (`mode4_auto_chat_autonomous.py`)

**Fixed (CORRECT):**
```python
from services.agent_selector_service import AgentSelectorService  # ✅
from services.panel_orchestrator import PanelOrchestrator  # ✅
from services.sub_agent_spawner import SubAgentSpawner  # ✅
from services.consensus_calculator import ConsensusCalculator  # ✅
from services.enhanced_conversation_manager import EnhancedConversationManager  # ✅
```

---

## 🛠️ Tool Integration

### Available Tools

Tools should be registered in `ToolRegistry` and linked to agents:

```python
# Initialize tool registry
tool_registry = ToolRegistry()

# Register RAG tool
from tools.rag_tool import RAGTool
rag_tool = RAGTool(rag_service=rag_service)
tool_registry.register_tool(rag_tool, is_global=True)

# Register web search tool
from tools.web_search_tool import WebSearchTool
web_search_tool = WebSearchTool()
tool_registry.register_tool(web_search_tool, is_global=True)

# Get tools for an agent
tools = tool_registry.get_available_tools(tenant_id="tenant-123")

# Execute a tool
result = await tool_registry.get_tool("rag_search").execute(
    input_data={"query": "FDA IND requirements"},
    context={"tenant_id": "tenant-123"}
)
```

---

## 📊 Agent Count Update

**Update ALL references from 136 to 319 agents:**

```python
# WRONG
"Select expert from 136+ catalog"  # ❌

# CORRECT
"Select expert from 319+ catalog"  # ✅
```

**Files to update:**
1. `mode1_manual_query.py` - Line 14, 248
2. `mode2_auto_query.py` - Line 14, 254
3. `mode3_manual_chat_autonomous.py` - Line 120, 272
4. `mode4_auto_chat_autonomous.py` - Line 95, 293

---

## 🎨 Artifact Delivery

Artifacts are generated and returned in the response:

```python
async def format_output_node(self, state):
    """Format output with artifacts"""

    return {
        **state,
        'response': state.get('agent_response', ''),
        'confidence': state.get('response_confidence', 0.0),

        # Artifacts from agent execution
        'artifacts': state.get('artifacts', []),

        # Artifact types supported:
        # - 'document': Generated document (Word, PDF)
        # - 'code': Code snippet (Python, R, SAS)
        # - 'chart': Visualization (PNG, SVG)
        # - 'table': Data table (CSV, Excel)
        # - 'timeline': Gantt chart / timeline

        'status': ExecutionStatus.COMPLETED
    }
```

**Artifact Structure:**
```json
{
  "artifacts": [
    {
      "type": "document",
      "title": "FDA 510(k) Submission Strategy",
      "format": "pdf",
      "content": "...",
      "generated_at": "2025-11-17T12:00:00Z"
    },
    {
      "type": "code",
      "title": "Statistical Analysis",
      "language": "python",
      "content": "import pandas as pd\n...",
      "generated_at": "2025-11-17T12:01:00Z"
    }
  ]
}
```

---

## 🔗 Complete Integration Example

### Mode 1 Full Integration:

```python
"""
Mode 1: Manual Query - CORRECTED VERSION
Uses ONLY existing services from ai-engine
"""

from services.agent_orchestrator import AgentOrchestrator
from services.sub_agent_spawner import SubAgentSpawner
from services.unified_rag_service import UnifiedRAGService
from services.tool_registry import ToolRegistry
from services.cache_manager import CacheManager
from services.confidence_calculator import ConfidenceCalculator

class Mode1ManualQueryWorkflow(BaseWorkflow):

    def __init__(self, supabase_client, rag_pipeline):
        super().__init__(
            workflow_name="Mode1_Manual_Query",
            mode=WorkflowMode.MODE_1_MANUAL,
            enable_checkpoints=False
        )

        # Initialize with EXISTING services
        self.supabase = supabase_client
        self.agent_orchestrator = AgentOrchestrator(supabase_client, rag_pipeline)
        self.sub_agent_spawner = SubAgentSpawner()
        self.rag_service = UnifiedRAGService(supabase_client)
        self.tool_registry = ToolRegistry()
        self.cache_manager = CacheManager()
        self.confidence_calculator = ConfidenceCalculator()

    async def initialize(self):
        """Initialize all services"""
        await self.rag_service.initialize()
        await self.agent_orchestrator.initialize()
        # Tool registry and cache manager are ready to use

    async def rag_retrieval_node(self, state):
        """RAG retrieval using UnifiedRAGService"""

        # Use existing UnifiedRAGService
        results = await self.rag_service.search(
            query_text=state['query'],
            strategy="hybrid",  # semantic + keyword
            max_results=10,
            similarity_threshold=0.7,
            tenant_id=state['tenant_id']
        )

        return {
            **state,
            'retrieved_documents': results.get('documents', []),
            'rag_metadata': results.get('metadata', {})
        }

    async def execute_expert_agent_node(self, state):
        """Execute expert using AgentOrchestrator + SubAgentSpawner"""

        # Execute main expert agent
        agent_response = await self.agent_orchestrator.execute_agent(
            agent_id=state['current_agent_id'],
            query=state['query'],
            context=state.get('context_summary', ''),
            tenant_id=state['tenant_id']
        )

        # Spawn sub-agents if complex query
        if state.get('requires_sub_agents'):
            specialist_id = await self.sub_agent_spawner.spawn_specialist(
                parent_agent_id=state['current_agent_id'],
                task="Analyze predicate devices",
                specialty="510(k) Predicate Analysis",
                context={'query': state['query']}
            )

            specialist_result = await self.sub_agent_spawner.execute_sub_agent(
                sub_agent_id=specialist_id
            )

            # Combine results
            agent_response['sub_agent_results'] = [specialist_result]

        # Calculate confidence
        confidence = await self.confidence_calculator.calculate(
            response=agent_response['response'],
            context=state.get('context_summary', ''),
            citations=agent_response.get('citations', [])
        )

        return {
            **state,
            'agent_response': agent_response['response'],
            'response_confidence': confidence,
            'artifacts': agent_response.get('artifacts', []),
            'sub_agents_spawned': agent_response.get('sub_agent_results', [])
        }
```

---

## ✅ Action Items

1. **Update all 4 mode workflows** to use existing services (remove imaginary ones)
2. **Fix agent count** from 136 to 319 in all files
3. **Add artifact support** in format_output nodes
4. **Test integration** with existing services
5. **Add proper error handling** for service failures
6. **Document tool calling** patterns

---

## 📚 Reference

**Existing Services Documentation:**
- `services/unified_rag_service.py` - RAG with Pinecone + Supabase
- `services/agent_orchestrator.py` - Agent execution with LangChain
- `services/sub_agent_spawner.py` - Deep agent hierarchy (5 levels)
- `services/panel_orchestrator.py` - Multi-expert panels
- `services/tool_registry.py` - Tool management
- `services/consensus_calculator.py` - Multi-expert consensus
- `services/confidence_calculator.py` - Response confidence
- `services/cache_manager.py` - Redis caching

**All services are in:**
`services/ai-engine/src/services/`

---

*Generated: November 17, 2025*
*Purpose: Integration guide for 4 Ask Expert mode workflows*
