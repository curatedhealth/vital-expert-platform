"""
LangGraph Panel API Endpoints
Handles all LangGraph-related panel workflow execution
"""

import os
# CRITICAL: Set this BEFORE any langchain imports to force pydantic v2
os.environ['LANGCHAIN_PYDANTIC_V2'] = 'true'

import asyncio
import json
from typing import Dict, Any

from fastapi import Request
from fastapi.responses import StreamingResponse

from ..panels.executor import PanelExecutor
from ..panels.registry import panel_registry
from ..nodes.base import Workflow, NodeConfig, Connection, NodeType
from ..panels.base import PanelType
# Import panels to ensure they're registered
from ..panels.structured_panel import StructuredPanelWorkflow
from ..panels.open_panel import OpenPanelWorkflow


async def execute_panel(request: Request):
    """Unified panel execution endpoint - routes to Structured or Open panel based on workflow detection"""
    # No need to modify sys.path - using relative imports
    
    # Get request data
    body = await request.json()
    query = body.get("query", "")
    openai_key = body.get("openai_api_key", "")
    provider = body.get("provider", "openai")  # "openai" or "ollama"
    ollama_base_url = body.get("ollama_base_url", "http://localhost:11434")
    ollama_model = body.get("ollama_model", "qwen3:4b")
    workflow_data = body.get("workflow", {})  # Workflow definition from frontend
    panel_type_override = body.get("panel_type")  # Optional explicit panel type
    
    if not query:
        return {"error": "Query is required"}
    
    # Validate based on provider
    if provider == "openai":
        if not openai_key:
            return {"error": "OpenAI API key is required"}
        if len(openai_key) < 20 or not openai_key.startswith('sk-'):
            return {"error": "Invalid OpenAI API key format. It should start with 'sk-'"}
    elif provider == "ollama":
        # Ollama doesn't need API key, just validate base_url
        if not ollama_base_url:
            ollama_base_url = "http://localhost:11434"
    else:
        return {"error": f"Invalid provider: {provider}. Must be 'openai' or 'ollama'"}
    
    async def generate_panel_events():
        """Generate panel events using LangGraph workflows"""
        try:
            # Send immediate acknowledgment
            yield f"data: {json.dumps({'type': 'log', 'level': 'info', 'message': 'Starting panel execution...'})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json.dumps({'type': 'log', 'level': 'info', 'message': 'Building workflow from request...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Build workflow object from request data
            workflow_nodes = []
            for node_data in workflow_data.get("nodes", []):
                # Convert node data to NodeConfig
                # For task nodes, type might be "task" which isn't in NodeType enum
                # We'll store the actual type in the data field and use a placeholder
                node_type_str = node_data.get("type", "")
                node_label = node_data.get("data", {}).get("label", node_data.get("label", ""))
                
                # Try to map to NodeType, but allow task nodes
                try:
                    node_type = NodeType(node_type_str)
                except ValueError:
                    # For task nodes or unknown types, use INPUT as placeholder
                    # The actual type info is preserved in node_data
                    node_type = NodeType.INPUT
                
                node_config = NodeConfig(
                    id=node_data.get("id", ""),
                    type=node_type,
                    label=node_label,
                    position=node_data.get("position", {"x": 0, "y": 0}),
                    parameters=node_data.get("parameters", {}),
                    data=node_data.get("data", {})  # Preserve full node data including task info
                )
                workflow_nodes.append(node_config)
            
            # Build edges
            workflow_edges = []
            for edge_data in workflow_data.get("edges", []):
                connection = Connection(
                    id=edge_data.get("id", ""),
                    source=edge_data.get("source", ""),
                    target=edge_data.get("target", ""),
                    sourceHandle=edge_data.get("sourceHandle"),
                    targetHandle=edge_data.get("targetHandle")
                )
                workflow_edges.append(connection)
            
            # Create workflow object
            workflow = Workflow(
                id=workflow_data.get("id", "workflow-1"),
                name=workflow_data.get("name", "Panel Workflow"),
                description=workflow_data.get("description"),
                nodes=workflow_nodes,
                edges=workflow_edges,
                metadata=workflow_data.get("metadata", {})
            )
            
            # Override panel type if explicitly provided
            if panel_type_override:
                workflow.metadata["panel_type"] = panel_type_override
            
            # Create a list to collect logs that will be yielded
            log_queue = []
            
            # Create log callback that queues logs to be yielded
            def log_callback(message: str, level: str = "info"):
                log_queue.append({
                    "type": "log",
                    "level": level,
                    "message": message
                })
            
            # Initialize panel executor with log callback
            log_callback("Initializing panel executor...", "info")
            # Create task executor with provider config
            from ..integration.panel_tasks import PanelTaskExecutor
            selected_model = ollama_model if provider == "ollama" else "gpt-4o"
            task_executor = PanelTaskExecutor(
                openai_api_key=openai_key if provider == "openai" else None,
                provider=provider,
                ollama_base_url=ollama_base_url,
                default_model=selected_model
            )
            # Log model information prominently
            provider_display = "OpenAI" if provider == "openai" else "Ollama (Local)"
            log_callback(f"🤖 Using {provider_display} model: {selected_model}", "success")
            executor = PanelExecutor(task_executor=task_executor, log_callback=log_callback)
            
            # Yield any queued logs
            while log_queue:
                log_entry = log_queue.pop(0)
                yield f"data: {json.dumps(log_entry)}\n\n"
                await asyncio.sleep(0.01)
            
            # Detect panel type
            log_callback("Detecting panel type...", "info")
            detected_type = executor.detect_panel_type(workflow)
            
            # Yield any queued logs
            while log_queue:
                log_entry = log_queue.pop(0)
                yield f"data: {json.dumps(log_entry)}\n\n"
                await asyncio.sleep(0.01)
            if not detected_type:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Could not detect panel type. Ensure workflow contains panel tasks (moderator, expert_agent) or set panel_type in metadata.'})}\n\n"
                return
            
            yield f"data: {json.dumps({'type': 'log', 'level': 'info', 'message': f'Detected panel type: {detected_type.value}'})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json.dumps({'type': 'log', 'level': 'info', 'message': 'Initializing panel workflow...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Execute panel workflow with timeout
            timeout_seconds = 600  # 10 minutes for panel workflows
            
            try:
                # Execute panel workflow
                event_count = 0
                async for event in executor.execute_panel(
                    workflow=workflow,
                    query=query,
                    tenant_id="default",
                    additional_config={
                        "openai_api_key": openai_key,
                        "user_id": body.get("user_id", "user")
                    }
                ):
                    # First, yield any queued logs
                    while log_queue:
                        log_entry = log_queue.pop(0)
                        yield f"data: {json.dumps(log_entry)}\n\n"
                        await asyncio.sleep(0.01)
                    
                    event_count += 1
                    # Convert event to SSE format
                    event_type = event.get("event", "log")
                    event_data = event.get("data", {})
                    
                    # Map event types to frontend-compatible format
                    if event_type == "panel_initialized":
                        yield f"data: {json.dumps({'type': 'panel_initialized', 'data': event_data})}\n\n"
                    elif event_type == "phase_start":
                        yield f"data: {json.dumps({'type': 'phase_start', 'data': event_data})}\n\n"
                    elif event_type == "moderator_speaking":
                        yield f"data: {json.dumps({'type': 'moderator_speaking', 'data': event_data})}\n\n"
                    elif event_type == "expert_speaking":
                        yield f"data: {json.dumps({'type': 'expert_speaking', 'data': event_data})}\n\n"
                    elif event_type == "phase_complete":
                        yield f"data: {json.dumps({'type': 'phase_complete', 'data': event_data})}\n\n"
                    elif event_type == "consensus_update":
                        yield f"data: {json.dumps({'type': 'consensus_update', 'data': event_data})}\n\n"
                    elif event_type == "consensus_reached":
                        yield f"data: {json.dumps({'type': 'consensus_reached', 'data': event_data})}\n\n"
                    elif event_type == "theme_analysis":
                        yield f"data: {json.dumps({'type': 'theme_analysis', 'data': event_data})}\n\n"
                    elif event_type == "synthesis_complete":
                        yield f"data: {json.dumps({'type': 'synthesis_complete', 'data': event_data})}\n\n"
                    elif event_type == "panel_complete":
                        yield f"data: {json.dumps({'type': 'panel_complete', 'data': event_data})}\n\n"
                    elif event_type == "complete":
                        # Final completion event
                        final_data = event_data
                        yield f"data: {json.dumps({'type': 'complete', 'result': final_data.get('final_report', ''), 'consensus_level': final_data.get('consensus_level', 0.0)})}\n\n"
                    elif event_type == "log":
                        # Log event - yield directly
                        yield f"data: {json.dumps({'type': 'log', 'level': event_data.get('level', 'info'), 'message': event_data.get('message', str(event_data))})}\n\n"
                    else:
                        # Generic log event
                        yield f"data: {json.dumps({'type': 'log', 'level': 'info', 'message': str(event_data)})}\n\n"
                    
                    await asyncio.sleep(0.05)  # Small delay for streaming
                
                # Yield any remaining queued logs
                while log_queue:
                    log_entry = log_queue.pop(0)
                    yield f"data: {json.dumps(log_entry)}\n\n"
                    await asyncio.sleep(0.01)
                
                if event_count == 0:
                    yield f"data: {json.dumps({'type': 'log', 'level': 'warning', 'message': 'No events received from panel workflow. Check backend logs.'})}\n\n"
                    yield f"data: {json.dumps({'type': 'error', 'message': 'Panel workflow did not produce any events. Please check the backend console for errors.'})}\n\n"
                    
            except asyncio.TimeoutError:
                yield f"data: {json.dumps({'type': 'log', 'level': 'error', 'message': f'Panel execution timed out after {timeout_seconds}s'})}\n\n"
                yield f"data: {json.dumps({'type': 'error', 'message': f'Execution took too long (>{timeout_seconds}s). The panel workflow may be stuck. Please try a simpler query or check backend logs.'})}\n\n"
            except Exception as exec_error:
                error_msg = str(exec_error)
                yield f"data: {json.dumps({'type': 'log', 'level': 'error', 'message': f'Panel execution error: {error_msg}'})}\n\n"
                yield f"data: {json.dumps({'type': 'error', 'message': f'Panel execution failed: {error_msg}'})}\n\n"
                raise  # Re-raise to be caught by outer try-except
            
        except Exception as e:
            import traceback
            error_msg = str(e)
            traceback_str = traceback.format_exc()
            
            # Log the full error to console
            print(f"\n{'='*60}")
            print(f"PANEL EXECUTION ERROR:")
            print(f"Query: {query}")
            print(f"Error: {error_msg}")
            print(f"Traceback:\n{traceback_str}")
            print(f"{'='*60}\n")
            
            # Send error to frontend
            yield f"data: {json.dumps({'type': 'log', 'level': 'error', 'message': f'Error: {error_msg}'})}\n\n"
            yield f"data: {json.dumps({'type': 'error', 'message': error_msg, 'traceback': traceback_str})}\n\n"
    
    return StreamingResponse(
        generate_panel_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


async def get_panel_types():
    """
    Get list of available panel types
    Returns metadata for all registered panel types
    """
    # Import panels to ensure they're registered
    from ..panels.structured_panel import StructuredPanelWorkflow
    from ..panels.open_panel import OpenPanelWorkflow
    
    types = panel_registry.list_types()
    metadata = panel_registry.get_all_metadata()
    
    result = []
    for panel_type in types:
        meta = metadata.get(panel_type, {})
        # Get config schema if available
        panel_instance = panel_registry.create(panel_type)
        schema = None
        if panel_instance:
            try:
                schema = panel_instance.get_config_schema()
            except Exception:
                pass
        
        result.append({
            "type": panel_type,
            "name": meta.get("name", panel_type),
            "description": meta.get("description", ""),
            "features": meta.get("features", []),
            "config_schema": schema,
        })
    
    return {"panel_types": result}


async def get_panel_schema(panel_type: str):
    """
    Get configuration schema for a specific panel type
    
    Args:
        panel_type: Panel type string (e.g., "structured", "open")
    """
    # Import panels to ensure they're registered
    from ..panels.structured_panel import StructuredPanelWorkflow
    from ..panels.open_panel import OpenPanelWorkflow
    
    panel_instance = panel_registry.create(panel_type)
    
    if not panel_instance:
        from fastapi import HTTPException
        available_types = panel_registry.list_types()
        raise HTTPException(
            status_code=404,
            detail=f"Panel type '{panel_type}' not found. Available types: {available_types}"
        )
    
    schema = panel_instance.get_config_schema()
    metadata = panel_registry.get_metadata(panel_type) or {}
    
    return {
        "type": panel_type,
        "name": metadata.get("name", panel_type),
        "description": metadata.get("description", ""),
        "features": metadata.get("features", []),
        "config_schema": schema,
    }

