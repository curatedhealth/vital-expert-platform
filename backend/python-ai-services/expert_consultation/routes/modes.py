"""
Mode Management Routes for VITAL Ask Expert Service

Provides API endpoints for all 4 interaction modes:
- Auto-Interactive, Manual-Interactive, Auto-Autonomous, Manual-Autonomous
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from datetime import datetime
import asyncio
import json

from modes.mode_manager import ModeManager, InteractionMode, AgentSelectionMode
from knowledge.agent_store_connector import AgentStoreConnector
from knowledge.rag_connector import MultiDomainRAGConnector
from orchestration.llm_selector import LLMSelector
from langchain_openai import ChatOpenAI

router = APIRouter()

# Dependency injection
async def get_mode_manager() -> ModeManager:
    """Get mode manager instance"""
    # This would be properly initialized with dependencies
    # For now, create a placeholder
    agent_store = AgentStoreConnector(None)  # Would be properly initialized
    rag_connector = MultiDomainRAGConnector(None, None)  # Would be properly initialized
    llm = ChatOpenAI(model="gpt-4", temperature=0.7)
    
    return ModeManager(agent_store, rag_connector, llm)


# Request/Response Models
class StartSessionRequest(BaseModel):
    user_id: str
    interaction_mode: str  # "interactive" or "autonomous"
    agent_mode: str  # "automatic" or "manual"
    selected_agent_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ProcessQueryRequest(BaseModel):
    query: str
    stream: bool = False


class SwitchModeRequest(BaseModel):
    interaction_mode: str
    agent_mode: str
    selected_agent_id: Optional[str] = None
    preserve_context: bool = True


class AgentSearchRequest(BaseModel):
    domains: Optional[List[str]] = None
    tiers: Optional[List[str]] = None
    capabilities: Optional[List[str]] = None
    business_functions: Optional[List[str]] = None
    search_query: Optional[str] = None
    limit: int = 20


# Session Management Endpoints
@router.post("/sessions/start")
async def start_session(
    request: StartSessionRequest,
    mode_manager: ModeManager = Depends(get_mode_manager)
):
    """Start a new session with specified mode"""
    try:
        interaction_mode = InteractionMode(request.interaction_mode)
        agent_mode = AgentSelectionMode(request.agent_mode)
        
        session = await mode_manager.start_session(
            user_id=request.user_id,
            interaction_mode=interaction_mode,
            agent_mode=agent_mode,
            selected_agent_id=request.selected_agent_id,
            context=request.context
        )
        
        return {
            "session_id": session.session_id,
            "interaction_mode": session.current_interaction_mode.value,
            "agent_mode": session.current_agent_mode.value,
            "selected_agent": session.selected_agent,
            "created_at": session.created_at.isoformat(),
            "status": "active"
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    mode_manager: ModeManager = Depends(get_mode_manager)
):
    """Get session details"""
    session = await mode_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session.session_id,
        "user_id": session.user_id,
        "interaction_mode": session.current_interaction_mode.value,
        "agent_mode": session.current_agent_mode.value,
        "selected_agent": session.selected_agent,
        "created_at": session.created_at.isoformat(),
        "last_activity": session.last_activity.isoformat(),
        "total_cost": session.total_cost,
        "mode_history": session.mode_history
    }


@router.delete("/sessions/{session_id}")
async def end_session(
    session_id: str,
    mode_manager: ModeManager = Depends(get_mode_manager)
):
    """End a session"""
    session = await mode_manager.end_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "status": "ended",
        "final_cost": session.total_cost,
        "duration": (datetime.now() - session.created_at).total_seconds()
    }


# Query Processing Endpoints
@router.post("/sessions/{session_id}/query")
async def process_query(
    session_id: str,
    request: ProcessQueryRequest,
    mode_manager: ModeManager = Depends(get_mode_manager)
):
    """Process a query in the current mode"""
    try:
        if request.stream:
            return StreamingResponse(
                _stream_query_response(mode_manager, session_id, request.query),
                media_type="text/plain"
            )
        else:
            result = await mode_manager.process_query(session_id, request.query)
            return result
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def _stream_query_response(mode_manager: ModeManager, session_id: str, query: str):
    """Stream query response"""
    try:
        async for chunk in mode_manager.process_query(session_id, query, stream=True):
            yield f"data: {json.dumps(chunk)}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"


# Mode Switching Endpoints
@router.post("/sessions/{session_id}/switch-mode")
async def switch_mode(
    session_id: str,
    request: SwitchModeRequest,
    mode_manager: ModeManager = Depends(get_mode_manager)
):
    """Switch session to a different mode"""
    try:
        interaction_mode = InteractionMode(request.interaction_mode)
        agent_mode = AgentSelectionMode(request.agent_mode)
        
        success = await mode_manager.switch_mode(
            session_id=session_id,
            new_interaction_mode=interaction_mode,
            new_agent_mode=agent_mode,
            selected_agent_id=request.selected_agent_id,
            preserve_context=request.preserve_context
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to switch mode")
        
        # Get updated session
        session = await mode_manager.get_session(session_id)
        
        return {
            "session_id": session_id,
            "new_interaction_mode": session.current_interaction_mode.value,
            "new_agent_mode": session.current_agent_mode.value,
            "selected_agent": session.selected_agent,
            "switched_at": datetime.now().isoformat(),
            "status": "success"
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Agent Selection Endpoints
@router.post("/sessions/{session_id}/agents/search")
async def search_agents(
    session_id: str,
    request: AgentSearchRequest,
    mode_manager: ModeManager = Depends(get_mode_manager)
):
    """Search available agents for manual selection"""
    try:
        filters = {
            "domains": request.domains,
            "tiers": request.tiers,
            "capabilities": request.capabilities,
            "business_functions": request.business_functions,
            "search_query": request.search_query,
            "limit": request.limit
        }
        
        agents = await mode_manager.get_available_agents(session_id, filters)
        
        return {
            "agents": agents,
            "total": len(agents),
            "filters_applied": filters
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/agents/{agent_id}")
async def get_agent_details(
    agent_id: str,
    mode_manager: ModeManager = Depends(get_mode_manager)
):
    """Get detailed information about a specific agent"""
    try:
        # This would use the agent store connector
        # For now, return placeholder
        return {
            "agent_id": agent_id,
            "name": f"Agent {agent_id}",
            "domain": "general",
            "tier": "tier_2",
            "capabilities": ["general_consultation"],
            "description": "General purpose medical expert agent",
            "status": "available"
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Mode Recommendation Endpoints
@router.post("/recommend-mode")
async def recommend_mode(
    query: str,
    context: Optional[Dict[str, Any]] = None,
    mode_manager: ModeManager = Depends(get_mode_manager)
):
    """Get recommended mode for a query"""
    try:
        recommendation = await mode_manager.get_mode_recommendation(query, context)
        return recommendation
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Mode Configuration Endpoints
@router.get("/modes")
async def get_available_modes(
    mode_manager: ModeManager = Depends(get_mode_manager)
):
    """Get all available mode configurations"""
    try:
        configs = mode_manager.get_mode_configurations()
        
        return {
            "modes": {
                mode_id: {
                    "interaction_mode": config.interaction_mode.value,
                    "agent_mode": config.agent_mode.value,
                    "description": config.description,
                    "features": config.features,
                    "use_cases": config.use_cases
                }
                for mode_id, config in configs.items()
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Session History Endpoints
@router.get("/sessions/{session_id}/history")
async def get_session_history(
    session_id: str,
    mode_manager: ModeManager = Depends(get_mode_manager)
):
    """Get session conversation history"""
    try:
        history = await mode_manager.get_session_history(session_id)
        return {
            "session_id": session_id,
            "history": history,
            "total_messages": len(history)
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# User Sessions Endpoints
@router.get("/users/{user_id}/sessions")
async def get_user_sessions(
    user_id: str,
    mode_manager: ModeManager = Depends(get_mode_manager)
):
    """Get all active sessions for a user"""
    try:
        sessions = mode_manager.get_active_sessions(user_id)
        
        return {
            "user_id": user_id,
            "active_sessions": [
                {
                    "session_id": session.session_id,
                    "interaction_mode": session.current_interaction_mode.value,
                    "agent_mode": session.current_agent_mode.value,
                    "selected_agent": session.selected_agent,
                    "created_at": session.created_at.isoformat(),
                    "last_activity": session.last_activity.isoformat(),
                    "total_cost": session.total_cost
                }
                for session in sessions
            ],
            "total_sessions": len(sessions)
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Health Check
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "mode_manager"
    }
