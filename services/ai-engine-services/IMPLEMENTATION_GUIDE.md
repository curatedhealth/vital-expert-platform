# 🐍 Python Backend Implementation Quick Reference

## 🎯 What You Need to Implement

Create two FastAPI endpoints in the Python AI Engine to execute workflows sent from the Next.js frontend.

---

## 📍 Endpoint 1: Panel Workflow Execution

**URL**: `POST /langgraph-gui/panels/execute`

**Purpose**: Execute panel workflows (10 legacy templates)

**Incoming Request** (from Next.js):
```json
{
  "query": "What are the FDA requirements for clinical trials?",
  "openai_api_key": "sk-...",
  "pinecone_api_key": "...",
  "provider": "openai",
  "ollama_base_url": "http://localhost:11434",
  "ollama_model": "qwen3:4b",
  "workflow": {
    "nodes": [
      {
        "id": "orchestrator",
        "type": "orchestrator",
        "taskId": "orchestrator",
        "label": "Panel Orchestrator",
        "position": {"x": 400, "y": 0},
        "data": {
          "systemPrompt": "You are a panel orchestrator...",
          "model": "gpt-4o",
          "temperature": 0.7
        }
      },
      {
        "id": "expert_1",
        "type": "agent",
        "taskId": "regulatory_affairs",
        "label": "Regulatory Affairs Expert",
        "position": {"x": 200, "y": 200},
        "data": {
          "systemPrompt": "You are a regulatory affairs expert...",
          "model": "gpt-4o",
          "temperature": 0.7,
          "tools": ["fda_api", "regulatory_knowledge_base"]
        },
        "expertConfig": {
          "expertise": ["FDA regulations", "Clinical trials", "Compliance"],
          "confidence_threshold": 0.85
        }
      }
      // ... more nodes
    ],
    "edges": [
      {
        "id": "e1",
        "source": "orchestrator",
        "target": "expert_1",
        "type": "default"
      }
      // ... more edges
    ],
    "metadata": {
      "source": "workflow-designer-enhanced",
      "panel_type": "structured_panel"
    }
  },
  "panel_type": "structured_panel",
  "user_id": "user-123"
}
```

**Expected Response**:
```json
{
  "success": true,
  "response": "Based on FDA regulations, clinical trials must follow...",
  "processing_time_ms": 4523,
  "metadata": {
    "mode": "parallel",
    "panel_size": 3,
    "expert_responses": [
      {
        "expert_id": "expert_1",
        "expert_name": "Regulatory Affairs Expert",
        "content": "FDA requires...",
        "confidence": 0.92,
        "citations": []
      },
      {
        "expert_id": "expert_2",
        "expert_name": "Clinical Expert",
        "content": "Clinical trials must...",
        "confidence": 0.88,
        "citations": []
      }
    ],
    "consensus": ["Phase 1-3 required", "IRB approval needed"],
    "dissent": []
  }
}
```

**Alternative: Streaming Response** (Server-Sent Events):
```
Content-Type: text/event-stream

data: {"type": "node_start", "node_id": "orchestrator"}

data: {"type": "node_complete", "node_id": "orchestrator"}

data: {"type": "node_start", "node_id": "expert_1"}

data: {"type": "output", "content": "Analyzing FDA requirements..."}

data: {"type": "node_complete", "node_id": "expert_1"}

data: {"type": "final", "response": "Based on FDA regulations..."}
```

---

## 📍 Endpoint 2: Regular Workflow Execution

**URL**: `POST /langgraph-gui/execute`

**Purpose**: Execute orchestrator-based workflows with enabled agents

**Incoming Request**:
```json
{
  "query": "Analyze this clinical trial data",
  "openai_api_key": "sk-...",
  "pinecone_api_key": "...",
  "provider": "openai",
  "orchestrator_system_prompt": "You are an intelligent orchestrator...",
  "enabled_agents": [
    "clinical_data_analyst",
    "statistical_analyzer",
    "medical_reviewer"
  ]
}
```

**Expected Response**:
```json
{
  "success": true,
  "response": "Analysis complete. Key findings: ...",
  "processing_time_ms": 3421
}
```

---

## 🏗️ Implementation Template

### File Structure
```
services/ai-engine-services/
├── src/
│   ├── api/
│   │   └── langgraph_gui/
│   │       ├── __init__.py
│   │       ├── routes.py          # ← Create this
│   │       ├── models.py          # ← Create this
│   │       └── executor.py        # ← Create this
│   └── main.py                    # ← Update this
```

### 1. Create `models.py`
```python
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class WorkflowNode(BaseModel):
    id: str
    type: str
    taskId: Optional[str] = None
    label: Optional[str] = None
    position: Dict[str, float]
    data: Optional[Dict[str, Any]] = None
    expertConfig: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    type: Optional[str] = "default"
    label: Optional[str] = None

class WorkflowDefinition(BaseModel):
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]
    metadata: Optional[Dict[str, Any]] = None

class PanelExecuteRequest(BaseModel):
    query: str
    openai_api_key: str
    pinecone_api_key: Optional[str] = ""
    provider: str = "openai"
    ollama_base_url: Optional[str] = "http://localhost:11434"
    ollama_model: Optional[str] = "qwen3:4b"
    workflow: WorkflowDefinition
    panel_type: str
    user_id: Optional[str] = "user"

class RegularExecuteRequest(BaseModel):
    query: str
    openai_api_key: str
    pinecone_api_key: Optional[str] = ""
    provider: str = "openai"
    ollama_base_url: Optional[str] = "http://localhost:11434"
    ollama_model: Optional[str] = "qwen3:4b"
    orchestrator_system_prompt: Optional[str] = "You are an intelligent orchestrator."
    enabled_agents: List[str]

class ExecutionResponse(BaseModel):
    success: bool
    response: Optional[str] = None
    output: Optional[str] = None
    processing_time_ms: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
```

### 2. Create `executor.py`
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any
import time

class PanelState(TypedDict):
    panel_id: str
    query: str
    panel_type: str
    current_node: str
    expert_responses: List[Dict[str, Any]]
    final_response: str
    processing_time_ms: int

async def execute_panel_workflow(
    workflow: WorkflowDefinition,
    query: str,
    panel_type: str,
    openai_api_key: str,
    **kwargs
) -> Dict[str, Any]:
    """
    Execute panel workflow using LangGraph StateGraph
    """
    start_time = time.time()
    
    # 1. Initialize state graph
    graph = StateGraph(PanelState)
    
    # 2. Add nodes dynamically from workflow definition
    for node in workflow.nodes:
        if node.type == "orchestrator":
            graph.add_node(node.id, create_orchestrator_node(node))
        elif node.type in ["agent", "task"]:
            graph.add_node(node.id, create_agent_node(node, openai_api_key))
        elif node.type == "tool":
            graph.add_node(node.id, create_tool_node(node))
        elif node.type == "condition":
            graph.add_node(node.id, create_condition_node(node))
        # ... handle other node types
    
    # 3. Add edges
    for edge in workflow.edges:
        if edge.target.lower() in ["end", "output"]:
            graph.add_edge(edge.source, END)
        else:
            graph.add_edge(edge.source, edge.target)
    
    # 4. Set entry point
    entry_node = next((n for n in workflow.nodes if n.type in ["input", "start"]), workflow.nodes[0])
    graph.set_entry_point(entry_node.id)
    
    # 5. Compile
    app = graph.compile()
    
    # 6. Execute
    initial_state: PanelState = {
        "panel_id": "workflow-1",
        "query": query,
        "panel_type": panel_type,
        "current_node": "",
        "expert_responses": [],
        "final_response": "",
        "processing_time_ms": 0,
    }
    
    result = await app.ainvoke(initial_state)
    
    # 7. Return response
    end_time = time.time()
    processing_time_ms = int((end_time - start_time) * 1000)
    
    return {
        "success": True,
        "response": result["final_response"],
        "processing_time_ms": processing_time_ms,
        "metadata": {
            "mode": "parallel",
            "panel_size": len([n for n in workflow.nodes if n.type in ["agent", "task"]]),
            "expert_responses": result["expert_responses"],
            "consensus": [],
            "dissent": [],
        }
    }

def create_orchestrator_node(node: WorkflowNode):
    """Create orchestrator node function"""
    async def orchestrator_node_fn(state: PanelState):
        # Implement orchestrator logic
        return state
    return orchestrator_node_fn

def create_agent_node(node: WorkflowNode, openai_api_key: str):
    """Create agent node function"""
    async def agent_node_fn(state: PanelState):
        # Use node.data.systemPrompt, node.data.model, etc.
        # Call OpenAI API
        # Append to state.expert_responses
        return state
    return agent_node_fn

def create_tool_node(node: WorkflowNode):
    """Create tool node function"""
    async def tool_node_fn(state: PanelState):
        # Execute tool (FDA API, RAG, etc.)
        return state
    return tool_node_fn

def create_condition_node(node: WorkflowNode):
    """Create condition node function"""
    async def condition_node_fn(state: PanelState):
        # Evaluate condition
        return state
    return condition_node_fn
```

### 3. Create `routes.py`
```python
from fastapi import APIRouter, HTTPException
from .models import (
    PanelExecuteRequest,
    RegularExecuteRequest,
    ExecutionResponse
)
from .executor import execute_panel_workflow
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/panels/execute", response_model=ExecutionResponse)
async def execute_panel(request: PanelExecuteRequest):
    """
    Execute panel workflow with LangGraph
    """
    try:
        logger.info(f"🚀 Executing panel workflow: {request.panel_type}")
        logger.info(f"📊 Nodes: {len(request.workflow.nodes)}, Edges: {len(request.workflow.edges)}")
        
        result = await execute_panel_workflow(
            workflow=request.workflow,
            query=request.query,
            panel_type=request.panel_type,
            openai_api_key=request.openai_api_key,
            pinecone_api_key=request.pinecone_api_key,
            provider=request.provider,
            ollama_base_url=request.ollama_base_url,
            ollama_model=request.ollama_model,
        )
        
        logger.info(f"✅ Panel execution complete: {result['processing_time_ms']}ms")
        return result
        
    except Exception as e:
        logger.error(f"❌ Panel execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute", response_model=ExecutionResponse)
async def execute_regular(request: RegularExecuteRequest):
    """
    Execute regular orchestrator workflow
    """
    try:
        logger.info(f"🚀 Executing regular workflow with {len(request.enabled_agents)} agents")
        
        # Implement regular workflow execution
        # This would use your existing orchestrator logic
        
        return {
            "success": True,
            "response": "Regular workflow execution - TO BE IMPLEMENTED",
            "processing_time_ms": 0
        }
        
    except Exception as e:
        logger.error(f"❌ Regular execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

### 4. Update `main.py`
```python
from fastapi import FastAPI
from src.api.langgraph_gui import routes as langgraph_gui_routes

app = FastAPI(title="VITAL AI Engine")

# Register LangGraph GUI routes
app.include_router(
    langgraph_gui_routes.router,
    prefix="/langgraph-gui",
    tags=["langgraph-gui"]
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "vital-ai-engine"}
```

---

## 🧪 Testing

### Test the Health Endpoint
```bash
curl http://localhost:8000/health
```

### Test Panel Execution (Simple Example)
```bash
curl -X POST http://localhost:8000/langgraph-gui/panels/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are FDA requirements?",
    "openai_api_key": "sk-...",
    "workflow": {
      "nodes": [
        {
          "id": "start",
          "type": "input",
          "position": {"x": 0, "y": 0}
        },
        {
          "id": "agent_1",
          "type": "agent",
          "label": "FDA Expert",
          "position": {"x": 200, "y": 0},
          "data": {
            "systemPrompt": "You are an FDA expert",
            "model": "gpt-4o",
            "temperature": 0.7
          }
        },
        {
          "id": "end",
          "type": "output",
          "position": {"x": 400, "y": 0}
        }
      ],
      "edges": [
        {"id": "e1", "source": "start", "target": "agent_1"},
        {"id": "e2", "source": "agent_1", "target": "end"}
      ]
    },
    "panel_type": "structured_panel"
  }'
```

---

## 📚 Resources

### LangGraph Documentation
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [StateGraph API](https://langchain-ai.github.io/langgraph/reference/graphs/#langgraph.graph.StateGraph)
- [Checkpointing](https://langchain-ai.github.io/langgraph/how-tos/persistence/)

### Existing Code References
- See `services/ai-engine-services/.claude/agents/ask-panel-service-agent.md`
- See `services/ai-engine-services/.claude/vital-expert-docs/06-workflows/`
- Check existing orchestrators in `src/lib/services/`

---

## ✅ Checklist

- [ ] Create `src/api/langgraph_gui/` directory
- [ ] Create `models.py` with Pydantic models
- [ ] Create `executor.py` with LangGraph logic
- [ ] Create `routes.py` with FastAPI endpoints
- [ ] Update `main.py` to register routes
- [ ] Test health endpoint
- [ ] Test simple panel execution
- [ ] Test with all 10 legacy templates
- [ ] Add error handling
- [ ] Add logging
- [ ] Add streaming support (optional)

---

## 🎯 Priority

**Start with a minimal implementation**:
1. ✅ Create the basic endpoint structure
2. ✅ Make a simple 3-node workflow execute (start → agent → end)
3. ✅ Return a basic response
4. ✅ Test from frontend

**Then expand**:
- Add support for all node types
- Add parallel execution
- Add tool integration
- Add streaming
- Add comprehensive error handling

---

Good luck! 🚀 The frontend is waiting and ready to connect! 🎉

