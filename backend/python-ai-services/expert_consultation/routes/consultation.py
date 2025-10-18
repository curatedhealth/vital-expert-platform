from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
from datetime import datetime

from state import AutonomousAgentState
from graphs.react_graph import EnhancedReActGraph
from streaming.reasoning_streamer import ReasoningStreamer
from cost.cost_tracker import CostTrackingCallback

router = APIRouter()

# Global instances (in production, use dependency injection)
streamer = ReasoningStreamer()

class ConsultationRequest(BaseModel):
    query: str
    expert_type: str
    business_context: Dict[str, Any]
    user_id: str
    reasoning_mode: str = "react"  # "react" | "cot" | "auto"
    budget: float = 10.0
    max_iterations: int = 5

class ConsultationResponse(BaseModel):
    session_id: str
    stream_url: str
    status: str
    estimated_cost: Optional[float] = None

@router.post("/execute", response_model=ConsultationResponse)
async def execute_consultation(request: ConsultationRequest, background_tasks: BackgroundTasks):
    """Execute expert consultation"""
    try:
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Create initial state
        initial_state = AutonomousAgentState(
            session_id=session_id,
            user_id=request.user_id,
            expert_type=request.expert_type,
            original_query=request.query,
            business_context=request.business_context,
            messages=[],
            current_phase="initializing",
            current_iteration=0,
            max_iterations=request.max_iterations,
            reasoning_steps=[],
            original_goal={"query": request.query, "expert_type": request.expert_type},
            decomposed_goals=[],
            completed_goals=[],
            current_goal=None,
            goal_progress=0.0,
            working_memory={},
            strategic_insights=[],
            evidence_chain=[],
            available_tools=[],
            tool_results=[],
            tool_calls=[],
            cost_accumulated=0.0,
            cost_budget=request.budget,
            tokens_used=0,
            should_continue=True,
            pause_requested=False,
            user_intervention_needed=False,
            intervention_type=None,
            final_synthesis=None,
            execution_complete=False
        )
        
        # Start execution in background
        background_tasks.add_task(execute_consultation_async, session_id, initial_state, request.reasoning_mode)
        
        return ConsultationResponse(
            session_id=session_id,
            stream_url=f"/expert/stream/{session_id}",
            status="started",
            estimated_cost=estimate_cost(request.query, request.max_iterations)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start consultation: {str(e)}")

async def execute_consultation_async(session_id: str, state: AutonomousAgentState, reasoning_mode: str):
    """Execute consultation asynchronously"""
    try:
        # Initialize components (in production, use dependency injection)
        from langchain_openai import ChatOpenAI
        from tools.comprehensive_registry import ComprehensiveToolRegistry
        from tools.strategic_selector import StrategicToolSelector
        from knowledge.rag_connector import MultiDomainRAGConnector
        from knowledge.agent_store_connector import AgentStoreConnector
        
        # Initialize LLM
        llm = ChatOpenAI(model="gpt-4", temperature=0.7)
        
        # Initialize connectors (mock for now)
        rag_connector = None  # Initialize with actual Supabase client
        agent_connector = None  # Initialize with actual Supabase client
        
        # Initialize tool registry and selector
        tool_registry = ComprehensiveToolRegistry(rag_connector, agent_connector)
        strategic_selector = StrategicToolSelector(llm, rag_connector, tool_registry)
        
        # Initialize cost tracker
        cost_tracker = CostTrackingCallback(session_id, state["cost_budget"], streamer)
        
        # Initialize and execute graph
        if reasoning_mode == "react":
            graph = EnhancedReActGraph(llm, tool_registry, strategic_selector, streamer)
            final_state = await graph.execute(state)
        else:
            # Implement CoT graph or other modes
            final_state = state
        
        # Stream completion
        await streamer.stream_execution_complete(session_id, {
            "final_synthesis": final_state.get("final_synthesis"),
            "total_cost": final_state.get("cost_accumulated", 0),
            "iterations_completed": final_state.get("current_iteration", 0)
        })
        
    except Exception as e:
        # Stream error
        await streamer.stream_execution_complete(session_id, {
            "error": str(e),
            "status": "failed"
        })

def estimate_cost(query: str, max_iterations: int) -> float:
    """Estimate consultation cost"""
    # Simple estimation based on query length and iterations
    base_cost = 0.50  # Base cost
    query_cost = len(query) * 0.001  # Cost per character
    iteration_cost = max_iterations * 0.25  # Cost per iteration
    
    return base_cost + query_cost + iteration_cost

@router.get("/status/{session_id}")
async def get_consultation_status(session_id: str):
    """Get consultation status"""
    try:
        # In production, get from database
        return {
            "session_id": session_id,
            "status": "running",
            "progress": 0.5,
            "current_phase": "thinking",
            "iterations_completed": 2,
            "total_iterations": 5
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

@router.get("/history/{user_id}")
async def get_consultation_history(user_id: str, limit: int = 10):
    """Get user's consultation history"""
    try:
        # In production, get from database
        return {
            "user_id": user_id,
            "consultations": [],
            "total_count": 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")
