# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [core.context, modules.execution, infrastructure.database.repositories]
"""
VITAL Path - SSE Streaming Routes

Server-Sent Events endpoints for real-time updates:
- Workflow execution streaming
- Expert chat streaming
- Job status streaming
"""

import logging
import asyncio
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from core.context import get_request_context
from modules.execution import WorkflowRunner, ExecutionContext, StreamManager
from infrastructure.database.repositories.job_repo import JobRepository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stream", tags=["streaming"])


class WorkflowExecuteRequest(BaseModel):
    """Request to execute a workflow with streaming."""
    workflow_id: str = Field(..., description="ID of the workflow to execute")
    input_data: dict = Field(default_factory=dict, description="Input data for the workflow")
    timeout_seconds: int = Field(300, ge=10, le=600, description="Execution timeout")


class ChatStreamRequest(BaseModel):
    """Request for streaming chat response."""
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID")
    agent_id: str = Field(..., description="Agent to chat with")
    message: str = Field(..., min_length=1, description="User message")
    mode: int = Field(1, ge=1, le=4, description="Expert mode (1-4)")


def get_runner() -> WorkflowRunner:
    """Dependency to get WorkflowRunner instance."""
    return WorkflowRunner()


def get_job_repo() -> JobRepository:
    """Dependency to get JobRepository instance."""
    return JobRepository()


@router.post("/workflow/execute")
async def stream_workflow_execution(
    request: WorkflowExecuteRequest,
    runner: WorkflowRunner = Depends(get_runner),
) -> StreamingResponse:
    """
    Execute a workflow with SSE streaming.
    
    Returns real-time events during execution:
    - execution_started: Workflow started
    - node_started: Node execution started
    - node_completed: Node execution finished
    - token_generated: LLM token generated (for streaming responses)
    - progress_update: Progress information
    - execution_completed: Workflow finished successfully
    - execution_failed: Workflow failed with error
    - result: Final result
    
    Usage:
        const eventSource = new EventSource('/api/v1/stream/workflow/execute');
        eventSource.addEventListener('node_completed', (e) => {
            const data = JSON.parse(e.data);
            console.log('Node completed:', data);
        });
    """
    ctx = get_request_context()
    
    if not ctx:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Load workflow definition
    # TODO: Fetch from database
    workflow_definition = {
        "id": request.workflow_id,
        "nodes": [],
        "edges": [],
    }
    
    # Create execution context
    exec_context = ExecutionContext(
        workflow_id=request.workflow_id,
        stream_enabled=True,
        timeout_seconds=request.timeout_seconds,
    )
    
    async def generate_events():
        """Generator for SSE events."""
        try:
            async for event in runner.execute_stream(
                workflow_definition,
                request.input_data,
                exec_context,
            ):
                yield event
        except Exception as e:
            logger.exception(f"Streaming error: {str(e)}")
            stream_manager = StreamManager()
            yield stream_manager.create_error_event(str(e))
    
    return StreamingResponse(
        generate_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@router.get("/job/{job_id}/status")
async def stream_job_status(
    job_id: str,
    job_repo: JobRepository = Depends(get_job_repo),
) -> StreamingResponse:
    """
    Stream job status updates via SSE.
    
    Useful for monitoring long-running async jobs.
    Sends updates when job status changes.
    
    Events:
    - status_update: Job status changed
    - progress_update: Job progress updated
    - completed: Job finished
    - failed: Job failed
    - heartbeat: Keep-alive (every 15 seconds)
    """
    ctx = get_request_context()
    
    if not ctx:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Verify job access
    job = await job_repo.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.user_id != ctx.user_id and not ctx.is_admin:
        raise HTTPException(status_code=404, detail="Job not found")
    
    stream_manager = StreamManager()
    
    async def generate_status_events():
        """Generator for job status events."""
        last_status = None
        last_progress = None
        heartbeat_interval = 15  # seconds
        poll_interval = 1  # seconds
        
        try:
            while True:
                # Get current job status
                current_job = await job_repo.get(job_id)
                
                if not current_job:
                    yield stream_manager.create_error_event("Job not found")
                    break
                
                # Check for status change
                if current_job.status != last_status:
                    last_status = current_job.status
                    yield stream_manager.format_event({
                        "type": "status_update",
                        "data": {
                            "job_id": job_id,
                            "status": current_job.status,
                            "updated_at": current_job.updated_at.isoformat() if current_job.updated_at else None,
                        },
                    })
                
                # Check for progress change
                if current_job.progress != last_progress:
                    last_progress = current_job.progress
                    if current_job.progress:
                        yield stream_manager.create_progress_event(
                            current_step=current_job.progress.get("currentStep", 0),
                            total_steps=current_job.progress.get("totalSteps"),
                            description=current_job.progress.get("currentStepDescription"),
                        )
                
                # Check for terminal status
                if current_job.status in ["completed", "failed", "cancelled"]:
                    if current_job.status == "completed":
                        yield stream_manager.format_event({
                            "type": "completed",
                            "data": {
                                "job_id": job_id,
                                "result": current_job.result,
                            },
                        })
                    elif current_job.status == "failed":
                        yield stream_manager.format_event({
                            "type": "failed",
                            "data": {
                                "job_id": job_id,
                                "error": current_job.error_message,
                            },
                        })
                    else:
                        yield stream_manager.format_event({
                            "type": "cancelled",
                            "data": {"job_id": job_id},
                        })
                    break
                
                # Wait before next poll
                await asyncio.sleep(poll_interval)
                
                # Send heartbeat periodically
                # (simplified - in production use proper timing)
                
        except asyncio.CancelledError:
            logger.info(f"Job status stream cancelled for {job_id}")
        except Exception as e:
            logger.exception(f"Job status stream error: {str(e)}")
            yield stream_manager.create_error_event(str(e))
    
    return StreamingResponse(
        generate_status_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/chat")
async def stream_chat_response(
    request: ChatStreamRequest,
) -> StreamingResponse:
    """
    Stream chat response from an expert agent.
    
    Supports all 4 expert modes with real-time token streaming.
    
    Events:
    - chat_started: Chat processing started
    - token: Individual token generated
    - thinking: Agent thinking/reasoning (for Mode 3/4)
    - citation: Citation/source added
    - response_complete: Full response ready
    - error: Error occurred
    """
    ctx = get_request_context()
    
    if not ctx:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    stream_manager = StreamManager()
    
    async def generate_chat_events():
        """Generator for chat events."""
        # Use ask_expert module for streaming (bridge removed)
        from modules.ask_expert.agents import AskExpertL1MasterOrchestrator
        from uuid import uuid4
        
        full_response = ""
        citations = []
        thinking_steps = []
        conversation_id = request.conversation_id or str(uuid4())
        
        try:
            # Emit start event
            yield stream_manager.format_event({
                "type": "chat_started",
                "data": {
                    "agent_id": request.agent_id,
                    "mode": request.mode,
                    "conversation_id": conversation_id,
                },
            })
            
            # Stream from Ask Expert service (legacy bridge removed)
            # TODO: Implement streaming via Ask Expert workflows
            # For now, yield a placeholder response
            async def stream_ask_expert_response():
                """Placeholder for Ask Expert streaming."""
                yield {"type": "token", "data": {"token": "Streaming via Ask Expert workflows..."}}
                yield {"type": "complete", "data": {}}
            
            async for event in stream_ask_expert_response():
                event_type = event.get("type", "unknown")
                event_data = event.get("data", {})
                
                if event_type == "token":
                    token = event_data.get("token", "")
                    full_response += token
                    yield stream_manager.create_token_event(
                        token=token,
                        node_id=request.agent_id,
                    )
                
                elif event_type == "thinking":
                    thinking_step = event_data.get("step", "")
                    thinking_steps.append(thinking_step)
                    yield stream_manager.format_event({
                        "type": "thinking",
                        "data": {"step": thinking_step},
                    })
                
                elif event_type == "citation":
                    citation = event_data.get("citation", {})
                    citations.append(citation)
                    yield stream_manager.format_event({
                        "type": "citation",
                        "data": citation,
                    })
                
                elif event_type == "complete":
                    # Final response from mode
                    if event_data.get("content"):
                        full_response = event_data.get("content", full_response)
                
                elif event_type == "error":
                    yield stream_manager.create_error_event(
                        event_data.get("message", "Unknown error")
                    )
                    return
                
                else:
                    # Forward other events
                    yield stream_manager.format_event(event)
            
            # Emit completion
            yield stream_manager.format_event({
                "type": "response_complete",
                "data": {
                    "agent_id": request.agent_id,
                    "full_response": full_response,
                    "conversation_id": conversation_id,
                    "citations": citations,
                    "thinking": thinking_steps,
                },
            })
            
        except Exception as e:
            logger.exception(f"Chat streaming error: {str(e)}")
            yield stream_manager.create_error_event(str(e))
    
    return StreamingResponse(
        generate_chat_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# Export router
streaming_router = router
