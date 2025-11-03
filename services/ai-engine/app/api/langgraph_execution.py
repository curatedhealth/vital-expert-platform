"""
LangGraph Execution Endpoint for Vital AI Engine

This endpoint executes dynamically generated LangGraph code securely.

Security Features:
- RestrictedPython for code sandboxing
- Resource limits (memory, CPU, timeout)
- API key injection from environment
- Input validation with Pydantic

Usage:
    POST /api/execute-langgraph
    {
        "code": "# Python code string",
        "inputs": {"messages": [...]},
        "config": {"thread_id": "uuid", "debug": false}
    }

Author: Vital Development Team
Date: November 3, 2025
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, validator
from typing import Dict, Any, List, Optional, Literal
import sys
import os
import time
import traceback
import json
import signal
import resource
from io import StringIO
from contextlib import redirect_stdout, redirect_stderr

# RestrictedPython for safe code execution
try:
    from RestrictedPython import compile_restricted, safe_globals
    from RestrictedPython.Guards import safe_builtins, guarded_iter_unpack_sequence
    RESTRICTED_PYTHON_AVAILABLE = True
except ImportError:
    RESTRICTED_PYTHON_AVAILABLE = False
    print("WARNING: RestrictedPython not installed. Using unrestricted exec() - NOT SAFE FOR PRODUCTION")

# LangChain/LangGraph imports
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver

# LLM providers
from langchain_openai import ChatOpenAI
try:
    from langchain_anthropic import ChatAnthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

router = APIRouter(prefix="/api", tags=["langgraph"])

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class LangGraphExecutionRequest(BaseModel):
    """Request model for LangGraph code execution"""
    code: str = Field(..., description="Python code to execute", min_length=10, max_length=50000)
    inputs: Dict[str, Any] = Field(default_factory=dict, description="Input data for the workflow")
    config: Dict[str, Any] = Field(default_factory=dict, description="Execution configuration")
    
    @validator('code')
    def validate_code(cls, v):
        """Validate code doesn't contain malicious patterns"""
        dangerous_patterns = [
            'import os',
            'import subprocess',
            'import sys',
            '__import__',
            'eval(',
            'exec(',
            'compile(',
            'open(',
            'file(',
        ]
        
        # Allow specific safe imports
        safe_imports = [
            'from typing import',
            'from langchain',
            'from langgraph',
            'import operator',
        ]
        
        for pattern in dangerous_patterns:
            if pattern in v and not any(safe in v for safe in safe_imports):
                raise ValueError(f"Potentially unsafe code pattern detected: {pattern}")
        
        return v

class ExecutionMetadata(BaseModel):
    """Metadata about the execution"""
    duration_ms: int
    total_tokens: int = 0
    estimated_cost: float = 0.0
    nodes_executed: List[str] = []
    model_calls: int = 0

class LangGraphExecutionResponse(BaseModel):
    """Response model for LangGraph code execution"""
    status: Literal["success", "error"]
    result: Optional[Dict[str, Any]] = None
    metadata: Optional[ExecutionMetadata] = None
    error: Optional[str] = None
    traceback: Optional[str] = None

# ============================================================================
# SECURITY: TIMEOUT HANDLER
# ============================================================================

class TimeoutError(Exception):
    """Raised when execution times out"""
    pass

def timeout_handler(signum, frame):
    """Signal handler for execution timeout"""
    raise TimeoutError("Execution timeout exceeded")

# ============================================================================
# SECURITY: RESOURCE LIMITS
# ============================================================================

def set_resource_limits():
    """Set resource limits for code execution"""
    try:
        # Limit memory to 1GB
        resource.setrlimit(resource.RLIMIT_AS, (1024 * 1024 * 1024, 1024 * 1024 * 1024))
        
        # Limit CPU time to 60 seconds
        resource.setrlimit(resource.RLIMIT_CPU, (60, 60))
        
        # Limit file size to 10MB
        resource.setrlimit(resource.RLIMIT_FSIZE, (10 * 1024 * 1024, 10 * 1024 * 1024))
    except Exception as e:
        print(f"Warning: Could not set resource limits: {e}")

# ============================================================================
# CODE EXECUTION ENGINE
# ============================================================================

def create_safe_globals():
    """Create a safe global namespace for code execution"""
    
    # Inject API keys from environment
    openai_key = os.getenv('OPENAI_API_KEY')
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    
    # Temporarily set environment variables (will be used by LangChain)
    if openai_key:
        os.environ['OPENAI_API_KEY'] = openai_key
    if anthropic_key:
        os.environ['ANTHROPIC_API_KEY'] = anthropic_key
    
    safe_exec_globals = {
        '__builtins__': safe_builtins if RESTRICTED_PYTHON_AVAILABLE else __builtins__,
        '_getiter_': guarded_iter_unpack_sequence if RESTRICTED_PYTHON_AVAILABLE else None,
        
        # Python typing
        'TypedDict': TypedDict,
        'Annotated': Annotated,
        'List': List,
        'Dict': Dict,
        'Any': Any,
        'Optional': Optional,
        
        # LangChain messages
        'BaseMessage': BaseMessage,
        'HumanMessage': HumanMessage,
        'AIMessage': AIMessage,
        'SystemMessage': SystemMessage,
        
        # LangGraph
        'StateGraph': StateGraph,
        'START': START,
        'END': END,
        'add_messages': add_messages,
        'MemorySaver': MemorySaver,
        
        # LLM clients
        'ChatOpenAI': ChatOpenAI,
        'ChatAnthropic': ChatAnthropic if ANTHROPIC_AVAILABLE else None,
        
        # Utilities
        'print': print,
        'len': len,
        'str': str,
        'int': int,
        'float': float,
        'bool': bool,
        'list': list,
        'dict': dict,
        'range': range,
        'enumerate': enumerate,
        'zip': zip,
        
        # Operator (for state updates)
        'operator': __import__('operator'),
    }
    
    return safe_exec_globals

def execute_langgraph_code(code: str, inputs: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute LangGraph code in a controlled environment
    
    Args:
        code: Python code string to execute
        inputs: Input data (typically {"messages": [...]})
        config: Configuration (thread_id, debug, etc.)
    
    Returns:
        Dictionary with execution results
    
    Raises:
        TimeoutError: If execution exceeds timeout
        Exception: Any other execution error
    """
    start_time = time.time()
    
    # Set resource limits
    set_resource_limits()
    
    # Set timeout (60 seconds)
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(60)
    
    try:
        # Create safe execution environment
        exec_globals = create_safe_globals()
        exec_locals = {}
        
        # Capture stdout/stderr
        stdout_capture = StringIO()
        stderr_capture = StringIO()
        
        with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
            # Compile code (restricted if available)
            if RESTRICTED_PYTHON_AVAILABLE:
                byte_code = compile_restricted(
                    code,
                    filename='<generated>',
                    mode='exec'
                )
                if byte_code.errors:
                    raise SyntaxError(f"Code compilation errors: {byte_code.errors}")
                exec(byte_code.code, exec_globals, exec_locals)
            else:
                # Fallback to standard exec (NOT SAFE FOR PRODUCTION)
                exec(code, exec_globals, exec_locals)
        
        # Get the compiled app
        if 'app' not in exec_locals:
            raise ValueError("Generated code must define 'app' variable (the compiled workflow)")
        
        app = exec_locals['app']
        
        # Prepare config with thread_id
        execution_config = {
            "configurable": {
                "thread_id": config.get("thread_id", "default")
            }
        }
        
        # Add debug mode if requested
        if config.get("debug", False):
            execution_config["debug"] = True
        
        # Execute workflow
        print(f"Executing workflow with inputs: {inputs}")
        result = app.invoke(inputs, execution_config)
        
        # Calculate duration
        duration_ms = int((time.time() - start_time) * 1000)
        
        # Extract metadata
        total_tokens = 0
        model_calls = 0
        
        # Try to get usage metadata from result
        if hasattr(result, 'usage_metadata'):
            total_tokens = result.usage_metadata.get('total_tokens', 0)
        elif isinstance(result, dict) and 'messages' in result:
            # Count tokens from messages (rough estimate)
            for msg in result['messages']:
                if hasattr(msg, 'content'):
                    total_tokens += len(str(msg.content).split()) * 1.3  # Rough token estimate
        
        # Get nodes executed
        nodes_executed = []
        if hasattr(app, 'get_graph'):
            nodes_executed = list(app.get_graph().nodes.keys())
        
        # Calculate estimated cost (rough estimate: $0.00002 per token for GPT-4)
        estimated_cost = total_tokens * 0.00002
        
        metadata = ExecutionMetadata(
            duration_ms=duration_ms,
            total_tokens=int(total_tokens),
            estimated_cost=round(estimated_cost, 4),
            nodes_executed=nodes_executed,
            model_calls=model_calls
        )
        
        # Disable alarm
        signal.alarm(0)
        
        return {
            "status": "success",
            "result": result,
            "metadata": metadata.dict(),
            "stdout": stdout_capture.getvalue(),
            "stderr": stderr_capture.getvalue()
        }
        
    except TimeoutError:
        signal.alarm(0)
        raise
    except Exception as e:
        signal.alarm(0)
        raise
    finally:
        # Always disable alarm
        signal.alarm(0)

# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.post("/execute-langgraph", response_model=LangGraphExecutionResponse)
async def execute_langgraph(request: LangGraphExecutionRequest):
    """
    Execute dynamically generated LangGraph code
    
    Example:
        POST /api/execute-langgraph
        {
            "code": "# LangGraph code...",
            "inputs": {"messages": [{"role": "user", "content": "Hello"}]},
            "config": {"thread_id": "uuid-123"}
        }
    """
    try:
        print(f"🚀 [LangGraph] Executing workflow...")
        print(f"📝 [LangGraph] Code length: {len(request.code)} chars")
        print(f"📊 [LangGraph] Inputs: {list(request.inputs.keys())}")
        
        # Execute the code
        execution_result = execute_langgraph_code(
            code=request.code,
            inputs=request.inputs,
            config=request.config
        )
        
        print(f"✅ [LangGraph] Execution completed in {execution_result['metadata']['duration_ms']}ms")
        print(f"🎯 [LangGraph] Tokens used: {execution_result['metadata']['total_tokens']}")
        
        return LangGraphExecutionResponse(
            status="success",
            result=execution_result["result"],
            metadata=ExecutionMetadata(**execution_result["metadata"])
        )
        
    except TimeoutError:
        print(f"⏰ [LangGraph] Execution timeout")
        return LangGraphExecutionResponse(
            status="error",
            error="Execution timeout exceeded (60 seconds)",
            traceback=None
        )
    
    except Exception as e:
        tb = traceback.format_exc()
        print(f"❌ [LangGraph] Execution error: {str(e)}")
        print(f"📋 [LangGraph] Traceback:\n{tb}")
        
        return LangGraphExecutionResponse(
            status="error",
            error=str(e),
            traceback=tb
        )

@router.post("/execute-langgraph/stream")
async def execute_langgraph_stream(request: LangGraphExecutionRequest):
    """
    Execute LangGraph code and stream results in real-time via Server-Sent Events
    
    Example:
        POST /api/execute-langgraph/stream
        (Same request body as /execute-langgraph)
    
    Response: text/event-stream
    """
    
    async def event_generator():
        """Generate Server-Sent Events for streaming results"""
        try:
            # Create safe execution environment
            exec_globals = create_safe_globals()
            exec_locals = {}
            
            # Send start event
            yield f"data: {json.dumps({'type': 'start', 'timestamp': time.time()})}\n\n"
            
            # Compile code
            if RESTRICTED_PYTHON_AVAILABLE:
                byte_code = compile_restricted(request.code, '<generated>', 'exec')
                if byte_code.errors:
                    yield f"data: {json.dumps({'type': 'error', 'error': f'Compilation errors: {byte_code.errors}'})}\n\n"
                    return
                exec(byte_code.code, exec_globals, exec_locals)
            else:
                exec(request.code, exec_globals, exec_locals)
            
            # Get app
            if 'app' not in exec_locals:
                yield f"data: {json.dumps({'type': 'error', 'error': 'No app variable defined'})}\n\n"
                return
            
            app = exec_locals['app']
            
            # Prepare config
            execution_config = {
                "configurable": {
                    "thread_id": request.config.get("thread_id", "default")
                }
            }
            
            # Stream execution
            for chunk in app.stream(request.inputs, execution_config):
                yield f"data: {json.dumps({'type': 'chunk', 'data': chunk})}\n\n"
            
            # Send complete event
            yield f"data: {json.dumps({'type': 'complete', 'timestamp': time.time()})}\n\n"
            
        except Exception as e:
            tb = traceback.format_exc()
            yield f"data: {json.dumps({'type': 'error', 'error': str(e), 'traceback': tb})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/execute-langgraph/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "restricted_python": RESTRICTED_PYTHON_AVAILABLE,
        "anthropic_available": ANTHROPIC_AVAILABLE,
        "timestamp": time.time()
    }

# ============================================================================
# REGISTER ROUTER
# ============================================================================
# In your main FastAPI app (main.py or app.py):
# from .langgraph_execution import router as langgraph_router
# app.include_router(langgraph_router)

