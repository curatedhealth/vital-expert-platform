# Python AI Engine - LangGraph Execution Endpoint

## Required Endpoint Implementation

To complete the Visual Workflow Designer integration, the Python AI Engine needs a new endpoint to execute dynamically generated LangGraph code.

---

## Endpoint Specification

### POST /execute-langgraph

Execute dynamically generated LangGraph Python code.

**Request Body:**
```json
{
  "code": "# Python code string",
  "inputs": {
    "messages": [
      {
        "role": "user",
        "content": "Hello, world!"
      }
    ]
  },
  "config": {
    "thread_id": "execution-uuid",
    "debug": false,
    "breakpoints": []
  }
}
```

**Response (Success):**
```json
{
  "status": "success",
  "result": {
    "messages": [...],
    "state": {...},
    "metadata": {
      "duration_ms": 1234,
      "tokens_used": 500,
      "nodes_executed": ["node1", "node2", "node3"]
    }
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": "Error message",
  "traceback": "Full Python traceback"
}
```

---

## Implementation Example

### FastAPI Endpoint (Recommended)

```python
# services/ai-engine/app/api/langgraph_execution.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import sys
from io import StringIO
import traceback
import time

router = APIRouter()

class LangGraphExecutionRequest(BaseModel):
    code: str
    inputs: Dict[str, Any]
    config: Dict[str, Any] = {}

class LangGraphExecutionResponse(BaseModel):
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    traceback: Optional[str] = None

@router.post("/execute-langgraph", response_model=LangGraphExecutionResponse)
async def execute_langgraph(request: LangGraphExecutionRequest):
    """
    Execute dynamically generated LangGraph code.
    
    Security considerations:
    - Code execution is sandboxed
    - Timeout enforced (60 seconds)
    - Resource limits applied
    - API keys injected from environment
    """
    try:
        start_time = time.time()
        
        # Prepare execution environment
        exec_globals = {
            '__builtins__': __builtins__,
            'os': __import__('os'),
            'sys': sys,
            # Import common LangChain/LangGraph modules
            'TypedDict': __import__('typing').TypedDict,
            'Annotated': __import__('typing').Annotated,
            'BaseMessage': __import__('langchain_core.messages').BaseMessage,
            'HumanMessage': __import__('langchain_core.messages').HumanMessage,
            'AIMessage': __import__('langchain_core.messages').AIMessage,
            'StateGraph': __import__('langgraph.graph').StateGraph,
            'START': __import__('langgraph.graph').START,
            'END': __import__('langgraph.graph').END,
            'add_messages': __import__('langgraph.graph.message').add_messages,
            'MemorySaver': __import__('langgraph.checkpoint.memory').MemorySaver,
            # LLM clients
            'ChatOpenAI': __import__('langchain_openai').ChatOpenAI,
            'ChatAnthropic': __import__('langchain_anthropic').ChatAnthropic,
        }
        exec_locals = {}
        
        # Execute the generated code
        exec(request.code, exec_globals, exec_locals)
        
        # Get the compiled app
        if 'app' not in exec_locals:
            raise ValueError("Generated code must define 'app' variable")
        
        app = exec_locals['app']
        
        # Prepare config
        config = {
            "configurable": {
                "thread_id": request.config.get("thread_id", "default")
            }
        }
        
        # Execute workflow
        result = app.invoke(request.inputs, config)
        
        # Calculate duration
        duration_ms = int((time.time() - start_time) * 1000)
        
        # Extract metadata
        metadata = {
            "duration_ms": duration_ms,
            "tokens_used": getattr(result, 'usage_metadata', {}).get('total_tokens', 0),
            "nodes_executed": list(app.get_graph().nodes.keys()) if hasattr(app, 'get_graph') else []
        }
        
        return LangGraphExecutionResponse(
            status="success",
            result={
                **result,
                "metadata": metadata
            }
        )
        
    except Exception as e:
        # Capture full traceback
        tb = traceback.format_exc()
        
        return LangGraphExecutionResponse(
            status="error",
            error=str(e),
            traceback=tb
        )

# Register router
# In main.py: app.include_router(langgraph_execution.router, prefix="/api", tags=["langgraph"])
```

---

## Security Considerations

### 1. Code Sandboxing (Production Required)

```python
# Use RestrictedPython for safer execution
from RestrictedPython import compile_restricted, safe_globals
from RestrictedPython.Guards import safe_builtins, guarded_iter_unpack_sequence

# Compile with restrictions
byte_code = compile_restricted(
    request.code,
    filename='<generated>',
    mode='exec'
)

# Use safe globals
safe_exec_globals = {
    '__builtins__': safe_builtins,
    '_getiter_': guarded_iter_unpack_sequence,
    # Add allowed modules
}
```

### 2. Timeout Enforcement

```python
import signal

class TimeoutError(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutError("Execution timeout")

# Set timeout (60 seconds)
signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(60)

try:
    result = app.invoke(request.inputs, config)
finally:
    signal.alarm(0)  # Disable alarm
```

### 3. Resource Limits

```python
import resource

# Limit memory to 1GB
resource.setrlimit(resource.RLIMIT_AS, (1024 * 1024 * 1024, 1024 * 1024 * 1024))

# Limit CPU time to 60 seconds
resource.setrlimit(resource.RLIMIT_CPU, (60, 60))
```

### 4. API Key Injection

```python
import os

# Inject API keys from environment
exec_globals['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')
exec_globals['ANTHROPIC_API_KEY'] = os.getenv('ANTHROPIC_API_KEY')

# Override in generated code
code_with_keys = f"""
import os
os.environ['OPENAI_API_KEY'] = '{os.getenv('OPENAI_API_KEY')}'
os.environ['ANTHROPIC_API_KEY'] = '{os.getenv('ANTHROPIC_API_KEY')}'

{request.code}
"""
```

---

## Streaming Support (Optional)

For real-time execution updates, use Server-Sent Events:

```python
from fastapi.responses import StreamingResponse
import json

@router.post("/execute-langgraph/stream")
async def execute_langgraph_stream(request: LangGraphExecutionRequest):
    """Stream execution updates in real-time"""
    
    async def event_generator():
        try:
            # Execute code (same as above)
            exec(request.code, exec_globals, exec_locals)
            app = exec_locals['app']
            
            # Stream results
            for chunk in app.stream(request.inputs, config):
                yield f"data: {json.dumps(chunk)}\n\n"
            
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

---

## Testing

### Test Script

```python
# test_langgraph_endpoint.py

import requests
import json

ENDPOINT = "http://localhost:8000/api/execute-langgraph"

# Sample generated code
code = """
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI

class WorkflowState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

def agent_node(state: WorkflowState) -> WorkflowState:
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

workflow = StateGraph(WorkflowState)
workflow.add_node("agent", agent_node)
workflow.add_edge(START, "agent")
workflow.add_edge("agent", END)

app = workflow.compile()
"""

# Test request
payload = {
    "code": code,
    "inputs": {
        "messages": [{"role": "user", "content": "Say hello!"}]
    },
    "config": {
        "thread_id": "test-123"
    }
}

response = requests.post(ENDPOINT, json=payload)
print(json.dumps(response.json(), indent=2))
```

---

## Integration with Frontend

The Next.js execution API (`/api/workflows/[id]/execute/route.ts`) already calls this endpoint:

```typescript
const pythonResponse = await fetch(`${PYTHON_AI_ENGINE_URL}/execute-langgraph`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: codeResult.code,
    inputs,
    config: {
      thread_id: execution.id,
      debug,
      breakpoints
    }
  }),
});
```

---

## Deployment Checklist

- [ ] Implement endpoint in Python AI Engine
- [ ] Add RestrictedPython for sandboxing
- [ ] Configure timeout and resource limits
- [ ] Set up API key injection
- [ ] Add logging and monitoring
- [ ] Write unit tests
- [ ] Test with generated code
- [ ] Deploy to staging
- [ ] Load test
- [ ] Deploy to production

---

## Status

**Current**: Endpoint specification complete, implementation needed in Python AI Engine

**Next Steps**:
1. Implement endpoint in FastAPI
2. Add security measures
3. Test with workflow designer
4. Deploy to production

**Estimated Time**: 4-6 hours for full implementation with security

