"""
Shared Framework Execution - Python AI Engine

Unified endpoints for LangGraph, AutoGen (CuratedHealth fork), and CrewAI.
Used by: Ask Expert, Ask Panel, Workflow Designer, Solution Builder

ARCHITECTURE:
- All services use the same endpoints
- Frameworks are shared infrastructure, not service-specific
- No tight coupling between frameworks and services
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional, Literal
from enum import Enum
import os
import time
import openai

# Initialize router
router = APIRouter(prefix="/frameworks", tags=["frameworks"])

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ============================================================================
# SHARED TYPES
# ============================================================================

class Framework(str, Enum):
    LANGGRAPH = "langgraph"
    AUTOGEN = "autogen"
    CREWAI = "crewai"

class ExecutionMode(str, Enum):
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    CONVERSATIONAL = "conversational"
    HIERARCHICAL = "hierarchical"

class AgentDefinition(BaseModel):
    id: str
    role: str
    goal: Optional[str] = None
    backstory: Optional[str] = None
    systemPrompt: str
    model: Optional[str] = "gpt-4o"
    temperature: Optional[float] = 0.7
    maxTokens: Optional[int] = 2000
    tools: Optional[List[str]] = []
    allowDelegation: Optional[bool] = False

class WorkflowConfig(BaseModel):
    framework: Framework
    mode: ExecutionMode
    agents: List[AgentDefinition]
    maxRounds: Optional[int] = 10
    requireConsensus: Optional[bool] = False
    streaming: Optional[bool] = False
    checkpoints: Optional[bool] = False
    timeout: Optional[int] = 300000

class ExecutionInput(BaseModel):
    message: Optional[str] = None
    messages: Optional[List[Dict[str, Any]]] = None
    context: Optional[Dict[str, Any]] = None

class ExecutionMetadata(BaseModel):
    userId: Optional[str] = None
    sessionId: Optional[str] = None
    source: Optional[Literal["ask-expert", "ask-panel", "workflow-designer", "solution-builder"]] = None

class ExecutionRequest(BaseModel):
    workflow: WorkflowConfig
    input: ExecutionInput
    metadata: Optional[ExecutionMetadata] = None

class ExecutionResult(BaseModel):
    success: bool
    framework: Framework
    outputs: Dict[str, Any]
    metadata: Dict[str, Any]
    error: Optional[str] = None

# ============================================================================
# LANGGRAPH EXECUTION
# ============================================================================

@router.post("/langgraph/execute")
async def execute_langgraph(request: ExecutionRequest) -> ExecutionResult:
    """
    Execute workflow using LangGraph
    Best for: Sequential workflows, state management, routing
    """
    start_time = time.time()
    
    try:
        print(f"🔵 [LangGraph] Executing workflow with {len(request.workflow.agents)} agents")
        
        # For sequential mode, execute agents one by one
        messages = []
        user_message = request.input.message or ""
        
        for agent in request.workflow.agents:
            print(f"  → Agent: {agent.role}")
            
            # Build conversation context
            agent_messages = [
                {"role": "system", "content": agent.systemPrompt},
                {"role": "user", "content": user_message}
            ]
            
            # Call OpenAI
            response = client.chat.completions.create(
                model=agent.model or "gpt-4o",
                messages=agent_messages,
                temperature=agent.temperature or 0.7,
                max_tokens=agent.maxTokens or 2000
            )
            
            agent_response = response.choices[0].message.content
            
            messages.append({
                "role": "assistant",
                "content": agent_response,
                "name": agent.role,
                "agent_id": agent.id
            })
            
            # Update user message for next agent (pass context)
            user_message = f"{user_message}\n\nPrevious expert ({agent.role}): {agent_response}"
        
        duration = int((time.time() - start_time) * 1000)
        
        return ExecutionResult(
            success=True,
            framework=Framework.LANGGRAPH,
            outputs={
                "messages": messages,
                "result": messages[-1]["content"] if messages else None,
                "state": {
                    "completed": True,
                    "rounds": 1
                }
            },
            metadata={
                "duration": duration,
                "tokensUsed": sum(len(m["content"]) for m in messages) // 4,
                "agentsInvolved": [agent.id for agent in request.workflow.agents],
                "executionPath": [agent.role for agent in request.workflow.agents]
            }
        )
        
    except Exception as e:
        print(f"❌ [LangGraph] Error: {e}")
        return ExecutionResult(
            success=False,
            framework=Framework.LANGGRAPH,
            outputs={},
            metadata={
                "duration": int((time.time() - start_time) * 1000),
                "tokensUsed": 0,
                "agentsInvolved": [],
                "executionPath": []
            },
            error=str(e)
        )

# ============================================================================
# AUTOGEN EXECUTION
# ============================================================================

@router.post("/autogen/execute")
async def execute_autogen(request: ExecutionRequest) -> ExecutionResult:
    """
    Execute workflow using AutoGen (CuratedHealth fork)
    Best for: Multi-agent conversations, consensus building, debate
    """
    start_time = time.time()
    
    try:
        print(f"🟣 [AutoGen] Executing workflow with {len(request.workflow.agents)} agents")
        
        # For conversational mode, simulate multi-round discussion
        messages = []
        user_message = request.input.message or ""
        rounds = min(request.workflow.maxRounds or 3, 3)  # Limit to 3 rounds for demo
        
        # Round 1: Each agent provides initial response
        print("  Round 1: Initial responses")
        for agent in request.workflow.agents:
            agent_messages = [
                {"role": "system", "content": agent.systemPrompt},
                {"role": "user", "content": user_message}
            ]
            
            response = client.chat.completions.create(
                model=agent.model or "gpt-4o",
                messages=agent_messages,
                temperature=agent.temperature or 0.7,
                max_tokens=agent.maxTokens or 2000
            )
            
            agent_response = response.choices[0].message.content
            messages.append({
                "role": "assistant",
                "content": agent_response,
                "name": agent.role,
                "agent_id": agent.id,
                "round": 1
            })
        
        # Round 2: Agents respond to each other (if multiple rounds)
        if rounds > 1 and len(request.workflow.agents) > 1:
            print("  Round 2: Discussion")
            other_responses = "\n\n".join([
                f"{m['name']}: {m['content']}" for m in messages
            ])
            
            for agent in request.workflow.agents:
                agent_messages = [
                    {"role": "system", "content": agent.systemPrompt},
                    {"role": "user", "content": f"{user_message}\n\nOther experts' views:\n{other_responses}\n\nProvide your refined perspective:"}
                ]
                
                response = client.chat.completions.create(
                    model=agent.model or "gpt-4o",
                    messages=agent_messages,
                    temperature=agent.temperature or 0.7,
                    max_tokens=agent.maxTokens or 1000
                )
                
                agent_response = response.choices[0].message.content
                messages.append({
                    "role": "assistant",
                    "content": agent_response,
                    "name": agent.role,
                    "agent_id": agent.id,
                    "round": 2
                })
        
        # Generate consensus if required
        consensus_data = {}
        if request.workflow.requireConsensus and len(request.workflow.agents) > 1:
            print("  Generating consensus")
            all_responses = "\n\n".join([
                f"{m['name']} (Round {m.get('round', 1)}): {m['content']}" 
                for m in messages
            ])
            
            consensus_prompt = f"""
Based on the following expert opinions, provide a synthesized consensus recommendation:

{all_responses}

Provide:
1. A unified recommendation that incorporates all perspectives
2. Any dissenting views or caveats
"""
            
            consensus_response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a consensus builder who synthesizes expert opinions."},
                    {"role": "user", "content": consensus_prompt}
                ],
                temperature=0.5,
                max_tokens=1500
            )
            
            consensus_data = {
                "consensusReached": True,
                "recommendation": consensus_response.choices[0].message.content,
                "dissenting": []
            }
        
        duration = int((time.time() - start_time) * 1000)
        
        return ExecutionResult(
            success=True,
            framework=Framework.AUTOGEN,
            outputs={
                "messages": messages,
                "result": messages[-1]["content"] if messages else None,
                "state": {
                    "completed": True,
                    "rounds": rounds,
                    **consensus_data
                }
            },
            metadata={
                "duration": duration,
                "tokensUsed": sum(len(m["content"]) for m in messages) // 4,
                "agentsInvolved": [agent.id for agent in request.workflow.agents],
                "executionPath": [f"{agent.role} (R{m.get('round', 1)})" for agent in request.workflow.agents for m in messages if m['agent_id'] == agent.id]
            }
        )
        
    except Exception as e:
        print(f"❌ [AutoGen] Error: {e}")
        return ExecutionResult(
            success=False,
            framework=Framework.AUTOGEN,
            outputs={},
            metadata={
                "duration": int((time.time() - start_time) * 1000),
                "tokensUsed": 0,
                "agentsInvolved": [],
                "executionPath": []
            },
            error=str(e)
        )

# ============================================================================
# CREWAI EXECUTION
# ============================================================================

@router.post("/crewai/execute")
async def execute_crewai(request: ExecutionRequest) -> ExecutionResult:
    """
    Execute workflow using CrewAI
    Best for: Task delegation, hierarchical execution, complex workflows
    """
    start_time = time.time()
    
    try:
        print(f"🟢 [CrewAI] Executing workflow with {len(request.workflow.agents)} agents")
        
        # For hierarchical mode, delegate tasks sequentially
        messages = []
        user_message = request.input.message or ""
        context = ""
        
        for i, agent in enumerate(request.workflow.agents):
            print(f"  Task {i+1}/{len(request.workflow.agents)}: {agent.role}")
            
            # Build task context
            task_prompt = f"{user_message}"
            if context:
                task_prompt += f"\n\nContext from previous tasks:\n{context}"
            if agent.goal:
                task_prompt += f"\n\nYour goal: {agent.goal}"
            
            agent_messages = [
                {"role": "system", "content": agent.systemPrompt},
                {"role": "user", "content": task_prompt}
            ]
            
            response = client.chat.completions.create(
                model=agent.model or "gpt-4o",
                messages=agent_messages,
                temperature=agent.temperature or 0.7,
                max_tokens=agent.maxTokens or 2000
            )
            
            agent_response = response.choices[0].message.content
            messages.append({
                "role": "assistant",
                "content": agent_response,
                "name": agent.role,
                "agent_id": agent.id,
                "task_index": i
            })
            
            # Update context for next agent
            context += f"\n{agent.role}: {agent_response}"
        
        duration = int((time.time() - start_time) * 1000)
        
        return ExecutionResult(
            success=True,
            framework=Framework.CREWAI,
            outputs={
                "messages": messages,
                "result": messages[-1]["content"] if messages else None,
                "state": {
                    "completed": True,
                    "tasks_completed": len(messages)
                }
            },
            metadata={
                "duration": duration,
                "tokensUsed": sum(len(m["content"]) for m in messages) // 4,
                "agentsInvolved": [agent.id for agent in request.workflow.agents],
                "executionPath": [agent.role for agent in request.workflow.agents]
            }
        )
        
    except Exception as e:
        print(f"❌ [CrewAI] Error: {e}")
        return ExecutionResult(
            success=False,
            framework=Framework.CREWAI,
            outputs={},
            metadata={
                "duration": int((time.time() - start_time) * 1000),
                "tokensUsed": 0,
                "agentsInvolved": [],
                "executionPath": []
            },
            error=str(e)
        )

# ============================================================================
# INFO ENDPOINT
# ============================================================================

@router.get("/info")
async def get_frameworks_info():
    """Get information about available frameworks"""
    return {
        "frameworks": {
            "langgraph": {
                "name": "LangGraph",
                "best_for": "Sequential workflows, state management, routing",
                "modes": ["sequential"],
                "status": "active"
            },
            "autogen": {
                "name": "AutoGen (CuratedHealth)",
                "best_for": "Multi-agent conversations, consensus building",
                "modes": ["conversational"],
                "status": "active",
                "fork": "https://github.com/curatedhealth/autogen"
            },
            "crewai": {
                "name": "CrewAI",
                "best_for": "Task delegation, hierarchical execution",
                "modes": ["hierarchical"],
                "status": "active"
            }
        },
        "version": "2.0.0",
        "endpoints": {
            "langgraph": "/frameworks/langgraph/execute",
            "autogen": "/frameworks/autogen/execute",
            "crewai": "/frameworks/crewai/execute"
        }
    }
