"""
Main API routes for workflow management
"""

import uuid
from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..nodes.base import Workflow, WorkflowMetadata, NodeType
from ..nodes.registry import NODE_DEFINITIONS, get_nodes_by_category
from ..engine.executor import WorkflowExecutor
from ..engine.validator import WorkflowValidator
from ..storage.file_storage import WorkflowStorage
from ..integration.pharma_intelligence import PharmaIntelligenceIntegration

# Create router
router = APIRouter()

# Global instances (will be injected)
storage: WorkflowStorage = None
pharma_integration: PharmaIntelligenceIntegration = None


def init_routes(app_storage: WorkflowStorage, app_pharma_integration: PharmaIntelligenceIntegration):
    """Initialize routes with dependencies"""
    global storage, pharma_integration
    storage = app_storage
    pharma_integration = app_pharma_integration


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class WorkflowCreateRequest(BaseModel):
    """Request to create/update workflow"""
    name: str
    description: str = None
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    metadata: Dict[str, Any] = {}


class WorkflowExecuteRequest(BaseModel):
    """Request to execute workflow"""
    inputs: Dict[str, Any] = {}


# ============================================================================
# HEALTH & UTILITY ENDPOINTS
# ============================================================================

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "pharma-intelligence-workflow"}


@router.get("/test-import")
async def test_import():
    """Test if orchestrator can be imported and initialized"""
    try:
        from ..pharma_intelligence.orchestrator import EnhancedPharmaIntelligenceOrchestrator
        return {"status": "success", "message": "Orchestrator import successful"}
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }


# ============================================================================
# PHARMA INTELLIGENCE EXECUTION
# ============================================================================

@router.post("/execute")
async def execute_research(request: Request):
    """Execute real Pharma Intelligence research workflow"""
    from fastapi.responses import StreamingResponse
    import asyncio
    import json
    import sys
    from pathlib import Path
    
    # Add parent directory to path for importing pharma_intelligence
    sys.path.insert(0, str(Path(__file__).parent.parent.parent))
    
    # Get request data
    body = await request.json()
    query = body.get("query", "")
    openai_key = body.get("openai_api_key", "")
    pinecone_key = body.get("pinecone_api_key", "")
    enabled_agents = body.get("enabled_agents", [])
    
    if not query:
        return {"error": "Query is required"}
    
    if not openai_key:
        return {"error": "OpenAI API key is required"}
    
    # Simple validation
    if len(openai_key) < 20 or not openai_key.startswith('sk-'):
        return {"error": "Invalid OpenAI API key format. It should start with 'sk-'"}
    
    async def generate_events():
        """Generate Server-Sent Events during execution"""
        try:
            import os
            os.environ['LANGCHAIN_PYDANTIC_V2'] = 'true'
            
            from ..pharma_intelligence.orchestrator import EnhancedPharmaIntelligenceOrchestrator
            
            yield f"data: {json.dumps({'type': 'log', 'level': 'info', 'message': 'Initializing Pharma Intelligence System...'})}\n\n"
            await asyncio.sleep(0.1)
            
            orchestrator = EnhancedPharmaIntelligenceOrchestrator(
                openai_api_key=openai_key,
                pinecone_api_key=pinecone_key if pinecone_key else os.getenv("PINECONE_API_KEY", ""),
                pinecone_index_name=os.getenv("PINECONE_INDEX_NAME", "pharma-intelligence"),
                max_iterations=1
            )
            
            yield f"data: {json.dumps({'type': 'log', 'level': 'success', 'message': '🤖 Using OpenAI model: gpt-4o'})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json.dumps({'type': 'log', 'level': 'success', 'message': 'System initialized successfully'})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json.dumps({'type': 'log', 'level': 'info', 'message': f'Processing query: {query}'})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json.dumps({'type': 'log', 'level': 'info', 'message': 'Starting agent orchestration...'})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json.dumps({'type': 'log', 'level': 'info', 'message': 'This may take several minutes for comprehensive queries...'})}\n\n"
            await asyncio.sleep(0.1)
            
            import concurrent.futures
            loop = asyncio.get_event_loop()
            timeout_seconds = 180
            
            with concurrent.futures.ThreadPoolExecutor() as executor:
                try:
                    result = await asyncio.wait_for(
                        loop.run_in_executor(executor, lambda: orchestrator.research(query, enabled_agents)),
                        timeout=timeout_seconds
                    )
                except asyncio.TimeoutError:
                    yield f"data: {json.dumps({'type': 'log', 'level': 'error', 'message': f'Execution timed out after {timeout_seconds}s'})}\n\n"
                    error_msg = 'Execution took too long. Try a MORE SPECIFIC query like "aspirin mechanism" instead of broad questions.'
                    yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
                    return
            
            yield f"data: {json.dumps({'type': 'log', 'level': 'success', 'message': 'Research completed!'})}\n\n"
            await asyncio.sleep(0.1)
            
            final_report = result.get('final_report', 'No report generated')
            
            if 'agent_outputs' in result:
                for agent_name, output in result['agent_outputs'].items():
                    yield f"data: {json.dumps({'type': 'node_output', 'node_id': agent_name, 'node_name': agent_name.replace('_', ' ').title(), 'output': output})}\n\n"
                    await asyncio.sleep(0.1)
            
            yield f"data: {json.dumps({'type': 'complete', 'result': final_report, 'cost': result.get('total_cost', 'Unknown')})}\n\n"
            
        except Exception as e:
            import traceback
            error_msg = str(e)
            traceback_str = traceback.format_exc()
            
            print(f"\n{'='*60}")
            print(f"EXECUTION ERROR:")
            print(f"Query: {query}")
            print(f"Error: {error_msg}")
            print(f"Traceback:\n{traceback_str}")
            print(f"{'='*60}\n")
            
            yield f"data: {json.dumps({'type': 'log', 'level': 'error', 'message': f'Error: {error_msg}'})}\n\n"
            yield f"data: {json.dumps({'type': 'error', 'message': error_msg, 'traceback': traceback_str})}\n\n"
    
    return StreamingResponse(
        generate_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


# ============================================================================
# WORKFLOW CRUD ENDPOINTS
# ============================================================================

@router.get("/workflows", response_model=List[WorkflowMetadata])
async def list_workflows():
    """List all workflows"""
    return storage.list_all()


@router.get("/workflows/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str):
    """Get workflow by ID - checks default templates first, then storage"""
    from ..templates.default_workflows import get_default_workflow
    workflow = get_default_workflow(workflow_id)
    
    if not workflow:
        workflow = storage.load(workflow_id)
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return workflow


@router.post("/workflows")
async def create_workflow(request: WorkflowCreateRequest):
    """Create new workflow"""
    workflow_id = str(uuid.uuid4())
    
    workflow = Workflow(
        id=workflow_id,
        name=request.name,
        description=request.description,
        nodes=[],
        edges=[],
        metadata=request.metadata
    )
    
    storage.save(workflow)
    
    return {"id": workflow_id, "message": "Workflow created"}


@router.put("/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, request: WorkflowCreateRequest):
    """Update existing workflow"""
    existing = storage.load(workflow_id)
    
    if not existing:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    existing.name = request.name
    existing.description = request.description
    existing.nodes = [dict_to_node_config(n) for n in request.nodes]
    existing.edges = [dict_to_connection(e) for e in request.edges]
    existing.metadata = request.metadata
    
    storage.save(existing)
    
    return {"id": workflow_id, "message": "Workflow updated"}


@router.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """Delete workflow"""
    success = storage.delete(workflow_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return {"message": "Workflow deleted"}


@router.post("/workflows/{workflow_id}/execute")
async def execute_workflow_rest(workflow_id: str, request: WorkflowExecuteRequest):
    """Execute workflow (synchronous, no streaming)"""
    workflow = storage.load(workflow_id)
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    validator = WorkflowValidator(workflow)
    is_valid, errors = validator.validate()
    
    if not is_valid:
        return JSONResponse(
            status_code=400,
            content={"error": "Validation failed", "details": [e.message for e in errors]}
        )
    
    executor = WorkflowExecutor(pharma_integration)
    events = []
    final_output = None
    
    async for event in executor.execute(workflow, request.inputs):
        events.append(event.dict())
        if event.type == "workflow_completed":
            final_output = event.data.get("output")
    
    return {
        "status": "completed",
        "output": final_output,
        "events": events
    }


@router.websocket("/workflows/{workflow_id}/stream")
async def workflow_execution_stream(websocket: WebSocket, workflow_id: str):
    """Execute workflow with real-time WebSocket streaming"""
    await websocket.accept()
    
    try:
        workflow = storage.load(workflow_id)
        
        if not workflow:
            await websocket.send_json({
                "type": "error",
                "message": "Workflow not found"
            })
            await websocket.close()
            return
        
        validator = WorkflowValidator(workflow)
        is_valid, errors = validator.validate()
        
        if not is_valid:
            await websocket.send_json({
                "type": "error",
                "message": "Validation failed",
                "errors": [e.message for e in errors]
            })
            await websocket.close()
            return
        
        data = await websocket.receive_json()
        inputs = data.get("inputs", {})
        
        executor = WorkflowExecutor(pharma_integration)
        
        async for event in executor.execute(workflow, inputs):
            await websocket.send_json(event.dict())
        
        await websocket.close()
        
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for workflow {workflow_id}")
    except Exception as e:
        print(f"Error in WebSocket execution: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass


# ============================================================================
# NODE TYPE ENDPOINTS
# ============================================================================

@router.get("/nodes/types")
async def get_node_types():
    """Get all available node types with metadata"""
    return get_nodes_by_category()


@router.get("/nodes/types/{node_type}")
async def get_node_type(node_type: str):
    """Get specific node type definition"""
    try:
        nt = NodeType(node_type)
        definition = NODE_DEFINITIONS.get(nt)
        
        if not definition:
            raise HTTPException(status_code=404, detail="Node type not found")
        
        return {
            "type": node_type,
            **definition
        }
    except ValueError:
        raise HTTPException(status_code=404, detail="Invalid node type")


# ============================================================================
# VALIDATION ENDPOINT
# ============================================================================

@router.post("/workflows/{workflow_id}/validate")
async def validate_workflow(workflow_id: str):
    """Validate workflow"""
    workflow = storage.load(workflow_id)
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    validator = WorkflowValidator(workflow)
    is_valid, errors = validator.validate()
    
    return {
        "is_valid": is_valid,
        "errors": [{"message": e.message, "node_id": e.node_id} for e in errors]
    }


@router.post("/workflows/export")
async def export_workflow_json(request: Request):
    """Export workflow as JSON file"""
    from fastapi.responses import Response
    import json
    
    body = await request.json()
    workflow_data = body.get("workflow")
    
    if not workflow_data:
        raise HTTPException(status_code=400, detail="Workflow data is required")
    
    # Generate filename
    workflow_name = workflow_data.get("name", "workflow").replace(" ", "_").lower()
    filename = f"{workflow_name}.json"
    
    # Convert to JSON string
    json_str = json.dumps(workflow_data, indent=2, ensure_ascii=False)
    
    return Response(
        content=json_str,
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.post("/workflows/import")
async def import_workflow_json(request: Request):
    """Import workflow from JSON"""
    try:
        body = await request.json()
        workflow_data = body.get("workflow")
        
        # If no "workflow" key, assume the entire body is the workflow
        if not workflow_data:
            workflow_data = body
        
        if not workflow_data:
            raise HTTPException(status_code=400, detail="Workflow data is required")
        
        # Validate required fields
        if not workflow_data.get("name"):
            # Try to generate a name from id or use default
            workflow_data["name"] = workflow_data.get("id", "Imported Workflow")
        
        # Generate new ID if not provided or if it's a template
        workflow_id = workflow_data.get("id")
        if not workflow_id or workflow_id.startswith("template-"):
            import uuid
            workflow_id = str(uuid.uuid4())
            workflow_data["id"] = workflow_id
        
        # Convert nodes and edges
        from ..nodes.base import NodeConfig, Connection, NodeType
        
        nodes = []
        for node_data in workflow_data.get("nodes", []):
            # Handle both React Flow format and backend format
            node_id = node_data.get("id", "")
            if not node_id:
                continue
                
            node_type_str = node_data.get("type", "")
            node_data_dict = node_data.get("data", {})
            
            # Handle task nodes - preserve task type in data, use INPUT as NodeType
            is_task = node_type_str == "task" or node_data_dict.get("_original_type") == "task"
            
            if is_task:
                # Task nodes don't have a NodeType enum value, use INPUT and preserve task info
                node_type = NodeType.INPUT
                # Ensure _original_type is set in data
                if "_original_type" not in node_data_dict:
                    node_data_dict["_original_type"] = "task"
            else:
                # Try to match the string to a NodeType enum value
                try:
                    node_type = NodeType(node_type_str)
                except ValueError:
                    # If not found, default to INPUT
                    node_type = NodeType.INPUT
            
            # Extract label from data if not in node_data
            label = node_data.get("label") or node_data_dict.get("label") or node_id
            
            # Merge data to preserve all original information
            final_data = {**node_data_dict}
            if "label" not in final_data and label:
                final_data["label"] = label
            
            nodes.append(NodeConfig(
                id=node_id,
                type=node_type,
                label=label,
                position=node_data.get("position", {"x": 0, "y": 0}),
                parameters=node_data.get("parameters", {}),
                data=final_data
            ))
        
        edges = []
        for edge_data in workflow_data.get("edges", []):
            if not edge_data.get("source") or not edge_data.get("target"):
                continue
            edges.append(Connection(
                id=edge_data.get("id", f"edge-{edge_data.get('source')}-{edge_data.get('target')}"),
                source=edge_data.get("source", ""),
                target=edge_data.get("target", ""),
                sourceHandle=edge_data.get("sourceHandle"),
                targetHandle=edge_data.get("targetHandle")
            ))
        
        # Create workflow object
        workflow = Workflow(
            id=workflow_id,
            name=workflow_data.get("name", "Imported Workflow"),
            description=workflow_data.get("description"),
            nodes=nodes,
            edges=edges,
            metadata=workflow_data.get("metadata", {})
        )
        
        # Save workflow
        storage.save(workflow)
        
        return {
            "id": workflow.id,
            "name": workflow.name,
            "message": "Workflow imported successfully"
        }
    except Exception as e:
        import traceback
        raise HTTPException(
            status_code=400,
            detail=f"Failed to import workflow: {str(e)}\n{traceback.format_exc()}"
        )




# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def dict_to_node_config(data: Dict[str, Any]):
    """Convert dict to NodeConfig"""
    from ..nodes.base import NodeConfig
    return NodeConfig(**data)


def dict_to_connection(data: Dict[str, Any]):
    """Convert dict to Connection"""
    from ..nodes.base import Connection
    return Connection(**data)

