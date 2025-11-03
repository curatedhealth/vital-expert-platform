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
    timeout: Optional[int] = 120

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
# ROUTER
# ============================================================================

router = APIRouter(prefix="/frameworks", tags=["frameworks"])

# ============================================================================
# LANGGRAPH EXECUTOR
# ============================================================================

@router.post("/langgraph/execute", response_model=ExecutionResult)
async def execute_langgraph(request: ExecutionRequest):
    """
    Execute workflow using LangGraph
    
    Best for:
    - Sequential workflows
    - State management
    - Conditional routing
    - Memory/checkpoints
    """
    try:
        print(f"🎯 [LangGraph] Executing workflow with {len(request.workflow.agents)} agents")
        print(f"📍 [LangGraph] Source: {request.metadata.source if request.metadata else 'unknown'}")
        
        start_time = time.time()
        
        # Import LangGraph
        from langgraph.graph import StateGraph, END
        from langchain_openai import ChatOpenAI
        
        # Build state graph
        # ... (your existing LangGraph implementation)
        
        result = {
            "messages": [],
            "state": {},
        }
        
        duration = time.time() - start_time
        
        return ExecutionResult(
            success=True,
            framework=Framework.LANGGRAPH,
            outputs=result,
            metadata={
                "duration": duration,
                "tokensUsed": 0,
                "agentsInvolved": [agent.id for agent in request.workflow.agents],
            }
        )
        
    except Exception as e:
        print(f"❌ [LangGraph] Error: {str(e)}")
        return ExecutionResult(
            success=False,
            framework=Framework.LANGGRAPH,
            outputs={},
            metadata={"duration": 0, "tokensUsed": 0, "agentsInvolved": []},
            error=str(e)
        )

# ============================================================================
# AUTOGEN EXECUTOR (CuratedHealth Fork)
# ============================================================================

@router.post("/autogen/execute", response_model=ExecutionResult)
async def execute_autogen(request: ExecutionRequest):
    """
    Execute workflow using AutoGen (CuratedHealth fork)
    
    Best for:
    - Multi-agent conversations
    - Consensus building
    - Debate/discussion
    - Collaborative problem-solving
    
    Uses: https://github.com/curatedhealth/autogen
    """
    try:
        print(f"🤖 [AutoGen] Executing workflow with {len(request.workflow.agents)} agents")
        print(f"📍 [AutoGen] Source: {request.metadata.source if request.metadata else 'unknown'}")
        
        start_time = time.time()
        
        # Import AutoGen (CuratedHealth fork)
        from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
        
        # LLM Configuration
        llm_config = {
            "config_list": [
                {
                    "model": request.workflow.agents[0].model or "gpt-4o",
                    "api_key": os.getenv("OPENAI_API_KEY")
                }
            ],
            "temperature": request.workflow.agents[0].temperature or 0.7,
            "timeout": request.workflow.timeout or 120,
        }
        
        # Create agents
        agents = []
        for agent_def in request.workflow.agents:
            agent = AssistantAgent(
                name=agent_def.role.replace(" ", "_"),
                system_message=agent_def.systemPrompt,
                llm_config=llm_config,
            )
            agents.append(agent)
        
        # Create user proxy
        user_proxy = UserProxyAgent(
            name="User",
            human_input_mode="NEVER",
            max_consecutive_auto_reply=0,
            code_execution_config=False,
        )
        
        # Create group chat
        group_chat = GroupChat(
            agents=agents,
            messages=[],
            max_round=request.workflow.maxRounds or 10,
        )
        
        manager = GroupChatManager(
            groupchat=group_chat,
            llm_config=llm_config,
        )
        
        # Execute discussion
        message = request.input.message or "Let's discuss this topic."
        print(f"💬 [AutoGen] Starting group chat with message: {message[:100]}...")
        
        user_proxy.initiate_chat(
            manager,
            message=message
        )
        
        # Extract results
        messages = []
        if hasattr(group_chat, 'messages'):
            for msg in group_chat.messages:
                messages.append({
                    'role': getattr(msg, 'role', 'assistant'),
                    'name': getattr(msg, 'name', 'unknown'),
                    'content': getattr(msg, 'content', str(msg))
                })
        
        duration = time.time() - start_time
        
        print(f"✅ [AutoGen] Panel discussion complete ({len(messages)} messages)")
        
        return ExecutionResult(
            success=True,
            framework=Framework.AUTOGEN,
            outputs={
                "messages": messages,
                "result": {
                    "total_messages": len(messages),
                    "experts_consulted": len(request.workflow.agents)
                }
            },
            metadata={
                "duration": duration,
                "tokensUsed": 0,  # TODO: Calculate from response
                "agentsInvolved": [agent.id for agent in request.workflow.agents],
            }
        )
        
    except Exception as e:
        print(f"❌ [AutoGen] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return ExecutionResult(
            success=False,
            framework=Framework.AUTOGEN,
            outputs={},
            metadata={"duration": 0, "tokensUsed": 0, "agentsInvolved": []},
            error=str(e)
        )

# ============================================================================
# CREWAI EXECUTOR
# ============================================================================

@router.post("/crewai/execute", response_model=ExecutionResult)
async def execute_crewai(request: ExecutionRequest):
    """
    Execute workflow using CrewAI
    
    Best for:
    - Task delegation
    - Hierarchical workflows
    - Role-based agents
    - Complex multi-step processes
    """
    try:
        print(f"👥 [CrewAI] Executing workflow with {len(request.workflow.agents)} agents")
        print(f"📍 [CrewAI] Source: {request.metadata.source if request.metadata else 'unknown'}")
        
        start_time = time.time()
        
        # Import CrewAI
        from crewai import Agent, Task, Crew, Process
        from langchain_openai import ChatOpenAI
        
        # Create LLM
        llm = ChatOpenAI(
            model=request.workflow.agents[0].model or "gpt-4o",
            temperature=request.workflow.agents[0].temperature or 0.7
        )
        
        # Create agents
        crew_agents = []
        for agent_def in request.workflow.agents:
            agent = Agent(
                role=agent_def.role,
                goal=agent_def.goal or f"Accomplish tasks as {agent_def.role}",
                backstory=agent_def.backstory or f"Expert {agent_def.role}",
                allow_delegation=agent_def.allowDelegation or False,
                llm=llm,
            )
            crew_agents.append(agent)
        
        # Create tasks (one per agent for now)
        tasks = []
        input_message = request.input.message or "Complete your assigned task."
        for i, agent in enumerate(crew_agents):
            task = Task(
                description=f"{input_message} (assigned to {request.workflow.agents[i].role})",
                agent=agent,
            )
            tasks.append(task)
        
        # Create crew
        process = Process.hierarchical if request.workflow.mode == ExecutionMode.HIERARCHICAL else Process.sequential
        crew = Crew(
            agents=crew_agents,
            tasks=tasks,
            process=process,
        )
        
        # Execute
        print(f"🚀 [CrewAI] Starting crew execution...")
        result = crew.kickoff()
        
        duration = time.time() - start_time
        
        print(f"✅ [CrewAI] Crew execution complete")
        
        return ExecutionResult(
            success=True,
            framework=Framework.CREWAI,
            outputs={
                "result": str(result),
                "tasks_completed": len(tasks)
            },
            metadata={
                "duration": duration,
                "tokensUsed": 0,  # TODO: Calculate from response
                "agentsInvolved": [agent.id for agent in request.workflow.agents],
            }
        )
        
    except Exception as e:
        print(f"❌ [CrewAI] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return ExecutionResult(
            success=False,
            framework=Framework.CREWAI,
            outputs={},
            metadata={"duration": 0, "tokensUsed": 0, "agentsInvolved": []},
            error=str(e)
        )

# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@router.get("/info")
async def get_frameworks_info():
    """Get information about available frameworks"""
    return {
        "frameworks": [
            {
                "id": "langgraph",
                "name": "LangGraph",
                "version": "0.0.40",
                "bestFor": ["Sequential workflows", "State management", "Conditional routing"],
            },
            {
                "id": "autogen",
                "name": "AutoGen (CuratedHealth)",
                "version": "0.2.0",
                "fork": "https://github.com/curatedhealth/autogen",
                "bestFor": ["Multi-agent conversations", "Consensus building", "Debate"],
            },
            {
                "id": "crewai",
                "name": "CrewAI",
                "version": "0.28.0",
                "bestFor": ["Task delegation", "Hierarchical workflows", "Role-based agents"],
            }
        ],
        "modes": ["sequential", "parallel", "conversational", "hierarchical"],
    }

# ============================================================================
# REGISTER ROUTER
# ============================================================================

# In your main.py:
# from app.api.frameworks import router as frameworks_router
# app.include_router(frameworks_router)

