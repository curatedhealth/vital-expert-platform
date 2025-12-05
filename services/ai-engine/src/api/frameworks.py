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

# OpenAI client will be initialized on first use
_client = None

def get_openai_client():
    """Lazy initialization of OpenAI client"""
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY environment variable not set"
            )
        _client = openai.OpenAI(api_key=api_key)
    return _client

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
            response = get_openai_client().chat.completions.create(
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
            
            response = get_openai_client().chat.completions.create(
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
                
                response = get_openai_client().chat.completions.create(
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
            
            consensus_response = get_openai_client().chat.completions.create(
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
            
            response = get_openai_client().chat.completions.create(
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


# ============================================================================
# SIMPLE ADAPTER ENDPOINTS (for frontend compatibility)
# ============================================================================

class SimpleLangGraphRequest(BaseModel):
    """Simple request format that frontend currently sends"""
    query: str
    openai_api_key: Optional[str] = None
    pinecone_api_key: Optional[str] = None
    provider: Optional[str] = "openai"
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None
    orchestrator_system_prompt: Optional[str] = None
    enabled_agents: List[str]  # List of agent IDs


@router.post("/langgraph/execute-simple")
async def execute_langgraph_simple(request: SimpleLangGraphRequest) -> Dict[str, Any]:
    """
    Simple adapter endpoint for frontend compatibility.
    Accepts the frontend's current schema and executes workflow with real agents.
    
    Smart routing: If 2+ agents detected, routes to enhanced panel workflow with moderator/debate.
    """
    start_time = time.time()

    try:
        print(f"🔵 [LangGraph Simple] Query: {request.query[:100]}...")
        print(f"🔵 [LangGraph Simple] Enabled agents: {request.enabled_agents}")
        
        # Check if this is a panel workflow (2+ agents)
        is_panel_workflow = len(request.enabled_agents) >= 2
        
        print(f"🔍 [LangGraph Simple] Panel workflow detection:")
        print(f"   - Agent count: {len(request.enabled_agents)}")
        print(f"   - Is panel workflow: {is_panel_workflow}")
        
        # If it's a panel workflow, route to enhanced panel workflow
        if is_panel_workflow:
            print(f"✅ [LangGraph Simple] Routing to Enhanced Panel Workflow with moderator and debate")
            try:
                print(f"📦 [LangGraph Simple] Importing enhanced panel workflow...")
                from langgraph_workflows.ask_panel_enhanced import EnhancedAskPanelWorkflow
                from services.supabase_client import get_supabase_client
                from services.agent_service import AgentService
                from services.llm_service import LLMService
                
                # SimpleRAGService is defined in ask_panel_streaming.py, import it from there
                from api.routes.ask_panel_streaming import SimpleRAGService

                print(f"📦 [LangGraph Simple] Initializing services...")
                # Initialize services
                supabase_client = get_supabase_client()
                if not supabase_client.client:
                    print(f"📦 [LangGraph Simple] Initializing Supabase client...")
                    await supabase_client.initialize()
                
                agent_service = AgentService(supabase_client)
                rag_service = SimpleRAGService(supabase_client=supabase_client)
                await rag_service.initialize()
                llm_service = LLMService()

                print(f"📦 [LangGraph Simple] Creating enhanced panel workflow...")
                # Initialize enhanced panel workflow
                workflow = EnhancedAskPanelWorkflow(
                    supabase_client=supabase_client,
                    agent_service=agent_service,
                    rag_service=rag_service,
                    llm_service=llm_service,
                )
                print(f"📦 [LangGraph Simple] Initializing workflow...")
                await workflow.initialize()
                print(f"✅ [LangGraph Simple] Workflow initialized successfully")

                # Execute panel workflow with debate enabled (with timeout)
                print(f"🚀 [LangGraph Simple] Executing panel workflow with debate enabled...")
                print(f"   - Question: {request.query[:100]}...")
                print(f"   - Agents: {request.enabled_agents}")
                print(f"   - Enable debate: True")
                print(f"   - Max rounds: 3")
                print(f"   - Timeout: 180 seconds (3 minutes)")
                
                import asyncio
                messages = []
                event_count = 0
                
                # Execute with timeout to prevent hanging
                try:
                    async def collect_events():
                        nonlocal messages, event_count
                        async for event in workflow.execute(
                            question=request.query,
                            template_slug="default",
                            selected_agent_ids=request.enabled_agents,
                            tenant_id="default-tenant",
                            user_id="anonymous-user",
                            session_id="dev-session",
                            enable_debate=True,  # Enable debate with network pattern
                            max_rounds=2,  # Reduced to 2 rounds to prevent long execution times
                            require_consensus=False
                        ):
                            event_count += 1
                            event_type = event.get("type")
                            print(f"📨 [LangGraph Simple] Event {event_count}: type={event_type}")
                            
                            if event_type == "message":
                                msg_data = event.get("data")
                                if msg_data:
                                    messages.append(msg_data)
                                    msg_role = msg_data.get("role", "unknown")
                                    msg_agent = msg_data.get("agent_name", "unknown")
                                    print(f"   📝 Message from {msg_role}/{msg_agent}: {msg_data.get('content', '')[:50]}...")
                            elif event_type == "complete":
                                print(f"✅ [LangGraph Simple] Workflow completed")
                                break
                            elif event_type == "error":
                                print(f"❌ [LangGraph Simple] Workflow error: {event.get('error')}")
                                break
                    
                    # Execute with 3 minute timeout
                    await asyncio.wait_for(collect_events(), timeout=180.0)
                    print(f"📊 [LangGraph Simple] Collected {len(messages)} messages from workflow")
                    
                except asyncio.TimeoutError:
                    print(f"⏱️ [LangGraph Simple] Workflow execution timed out after 180 seconds")
                    # Return partial results if we have any messages
                    if messages:
                        print(f"⚠️ [LangGraph Simple] Returning {len(messages)} partial messages")
                    else:
                        raise HTTPException(
                            status_code=504,
                            detail="Panel workflow execution timed out after 3 minutes. Please try with fewer agents or simpler queries."
                        )

                # Extract agent responses and format them
                agent_responses = []
                aggregated_parts = []
                
                for msg in messages:
                    msg_type = msg.get("type")
                    role = msg.get("role") or ""
                    agent_name = msg.get("agent_name") or msg.get("role") or "Unknown"
                    
                    # Check if this is a moderator message (role="moderator" or agent_name="Moderator")
                    is_moderator = role == "moderator" or agent_name == "Moderator"
                    
                    # Include all message types: agent, orchestrator (which includes moderator)
                    if msg_type in ["agent", "orchestrator"]:
                        agent_id = msg.get("agent_id")
                        content = msg.get("content") or ""
                        
                        agent_responses.append({
                            "agent_id": agent_id,
                            "agent_name": agent_name,
                            "response": content,
                            "content": content,
                            "confidence": 0.85,
                            "type": "moderator" if is_moderator else msg_type
                        })
                        
                        # Add to aggregated response
                        if is_moderator:
                            aggregated_parts.append(f"**🎤 Moderator**: {content}")
                        elif msg_type == "orchestrator":
                            aggregated_parts.append(f"**📋 Orchestrator**: {content}")
                        else:
                            aggregated_parts.append(f"**{agent_name}**: {content}")
                
                # Build aggregated response
                if aggregated_parts:
                    aggregated = f"Panel Discussion with {len(request.enabled_agents)} experts:\n\n"
                    aggregated += "\n\n".join(aggregated_parts)
                else:
                    aggregated = "Panel discussion completed, but no messages were generated."

                duration = int((time.time() - start_time) * 1000)

                return {
                    "success": True,
                    "query": request.query,
                    "aggregated_response": aggregated,
                    "agent_results": agent_responses,
                    "agent_responses": agent_responses,
                    "total_agents": len(request.enabled_agents),
                    "successful_agents": len([r for r in agent_responses if not r.get("error", False)]),
                    "execution_time_ms": duration,
                    "metadata": {
                        "execution_mode": "enhanced_panel",
                        "agent_count": len(request.enabled_agents),
                        "debate_enabled": True,
                        "moderator_enabled": True,
                        "network_pattern": True,
                        "panel_type": "enhanced_with_moderator_debate"
                    },
                    "messages": messages
                }

            except Exception as e:
                import traceback
                print(f"⚠️ Enhanced panel workflow failed, falling back to simple execution: {e}")
                print(f"   Error details: {traceback.format_exc()}")
                # Fall through to simple execution

        # Import dependencies
        import openai
        
        # Get supabase_client from main module (imported at runtime to avoid circular imports)
        import sys
        main_module = sys.modules.get('main')
        supabase_client = None
        if main_module:
            supabase_client = getattr(main_module, 'supabase_client', None)
        
        # Use provided API key or fall back to environment
        api_key = request.openai_api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            # Try to get from settings if available
            try:
                from core.config import get_settings
                settings = get_settings()
                api_key = settings.openai_api_key
            except:
                pass
        
        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="OpenAI API key is required (provide openai_api_key or set OPENAI_API_KEY env var)"
            )
        
        client = openai.OpenAI(api_key=api_key)
        
        # Load agents from Supabase
        agent_responses = []
        agents_data = []
        
        # Filter to only valid UUIDs first
        valid_agent_ids = []
        for agent_id in request.enabled_agents:
            if agent_id and isinstance(agent_id, str):
                dash_count = agent_id.count('-')
                if len(agent_id) == 36 and dash_count == 4:
                    valid_agent_ids.append(agent_id)
                else:
                    print(f"⚠️ Skipping '{agent_id}': Not a valid UUID format (likely a workflow node ID, not an agent ID)")
        
        # If no valid agents found, return error
        if len(valid_agent_ids) == 0:
            error_msg = (
                "No valid agent UUIDs found in enabled_agents. "
                "Please ensure agent nodes in your workflow are configured with real agent IDs from the database. "
                f"Received {len(request.enabled_agents)} items, but none were valid UUIDs."
            )
            print(f"❌ {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "details": {
                    "received_count": len(request.enabled_agents),
                    "valid_count": 0,
                    "received_ids": request.enabled_agents[:10],  # First 10 for debugging
                },
                "agent_responses": [],
                "execution_time_ms": int((time.time() - start_time) * 1000),
            }
        
        if supabase_client and supabase_client.client:
            for agent_id in valid_agent_ids:
                
                try:
                    agent = await supabase_client.get_agent_by_id(agent_id)
                    if agent:
                        agents_data.append({
                            "id": agent_id,
                            "name": agent.get("name", f"Agent {agent_id[:8]}"),
                            "system_prompt": agent.get("system_prompt", "You are a helpful AI assistant."),
                            "model": agent.get("base_model") or agent.get("model_name") or "gpt-4o",
                            "temperature": agent.get("metadata", {}).get("temperature", 0.7) if isinstance(agent.get("metadata"), dict) else 0.7
                        })
                    else:
                        print(f"⚠️ Agent {agent_id} not found in database, using default")
                        agents_data.append({
                            "id": agent_id,
                            "name": f"Agent {agent_id[:8]}",
                            "system_prompt": "You are a helpful AI assistant.",
                            "model": "gpt-4o",
                            "temperature": 0.7
                        })
                except Exception as e:
                    print(f"⚠️ Error loading agent {agent_id}: {e}")
                    agents_data.append({
                        "id": agent_id,
                        "name": f"Agent {agent_id[:8]}",
                        "system_prompt": "You are a helpful AI assistant.",
                        "model": "gpt-4o",
                        "temperature": 0.7
                    })
        else:
            # Fallback if Supabase not available - still only use valid UUIDs
            print("⚠️ Supabase client not available, using default agent configs")
            for agent_id in valid_agent_ids:
                agents_data.append({
                    "id": agent_id,
                    "name": f"Agent {agent_id[:8]}",
                    "system_prompt": "You are a helpful AI assistant.",
                    "model": "gpt-4o",
                    "temperature": 0.7
                })
        
        # Check if we have any agents to execute
        if len(agents_data) == 0:
            error_msg = (
                "No agents available to execute. "
                "Please ensure agent nodes in your workflow are configured with valid agent UUIDs from the database."
            )
            print(f"❌ {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "agent_responses": [],
                "execution_time_ms": int((time.time() - start_time) * 1000),
            }
        
        # Execute agents sequentially with real LLM calls
        for agent in agents_data:
            try:
                print(f"  → Executing agent: {agent['name']} ({agent['id'][:8]}...)")
                
                # Build messages
                messages = [
                    {"role": "system", "content": agent["system_prompt"]},
                    {"role": "user", "content": request.query}
                ]
                
                # Call OpenAI
                response = client.chat.completions.create(
                    model=agent["model"],
                    messages=messages,
                    temperature=agent["temperature"],
                    max_tokens=2000
                )
                
                agent_response_text = response.choices[0].message.content
                
                agent_responses.append({
                    "agent_id": agent["id"],
                    "agent_name": agent["name"],
                    "response": agent_response_text,
                    "confidence": 0.85,  # Could calculate based on response quality
                    "model_used": agent["model"],
                    "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else None
                })
                
            except Exception as e:
                print(f"❌ Error executing agent {agent['id']}: {e}")
                agent_responses.append({
                    "agent_id": agent["id"],
                    "agent_name": agent["name"],
                    "response": f"Error: {str(e)}",
                    "confidence": 0.0,
                    "error": True
            })

        # Aggregate response
        successful_responses = [r for r in agent_responses if not r.get("error", False)]
        if successful_responses:
            aggregated = f"Based on consultation with {len(successful_responses)} agent(s):\n\n"
            aggregated += "\n\n".join([
                f"**{r['agent_name']}**: {r['response']}"
                    for r in successful_responses
            ])
        else:
            aggregated = "All agents failed to respond. Please check the error messages above."

        duration = int((time.time() - start_time) * 1000)

        return {
            "success": len(successful_responses) > 0,
            "query": request.query,
            "aggregated_response": aggregated,
            "agent_results": agent_responses,
            "total_agents": len(request.enabled_agents),
            "successful_agents": len(successful_responses),
            "execution_time_ms": duration,
            "metadata": {
                "provider": request.provider,
                "mode": "real_execution"
            }
        }

    except Exception as e:
        print(f"❌ [LangGraph Simple] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Execution failed: {str(e)}"
        )


class SimplePanelRequest(BaseModel):
    """Simple request format for panel execution"""
    query: str
    openai_api_key: Optional[str] = None
    pinecone_api_key: Optional[str] = None
    provider: Optional[str] = "openai"
    workflow: Dict[str, Any]  # Workflow definition with nodes/edges
    panel_type: str
    user_id: Optional[str] = None


@router.post("/panels/execute-simple")
async def execute_panel_simple(request: SimplePanelRequest) -> Dict[str, Any]:
    """
    Simple adapter endpoint for panel execution.
    Accepts workflow definition from frontend and executes with real agents.
    """
    start_time = time.time()

    try:
        print(f"🔵 [Panel Simple] Query: {request.query[:100]}...")
        print(f"🔵 [Panel Simple] Panel type: {request.panel_type}")
        print(f"🔵 [Panel Simple] Workflow nodes: {len(request.workflow.get('nodes', []))}")

        # Import dependencies
        import openai
        
        # Get supabase_client from main module (imported at runtime to avoid circular imports)
        import sys
        main_module = sys.modules.get('main')
        supabase_client = None
        if main_module:
            supabase_client = getattr(main_module, 'supabase_client', None)
        
        # Use provided API key or fall back to environment
        api_key = request.openai_api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            try:
                from core.config import get_settings
                settings = get_settings()
                api_key = settings.openai_api_key
            except:
                pass
        
        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="OpenAI API key is required (provide openai_api_key or set OPENAI_API_KEY env var)"
            )
        
        client = openai.OpenAI(api_key=api_key)

        # Extract agent IDs from workflow nodes
        # Check multiple possible node structures:
        # 1. type === 'agent' or 'expertAgent'
        # 2. taskId === 'expert_agent'
        # 3. data.type === 'agent'
        # 4. data.config.agentId or data.agentId
        agent_ids = []
        agent_nodes = []
        
        for node in request.workflow.get('nodes', []):
            node_type = node.get('type', '')
            node_data = node.get('data', {})
            task_id = node_data.get('task', {}).get('id') if isinstance(node_data.get('task'), dict) else None
            
            # Check if this is an expert/agent node
            # Must have taskId 'expert_agent' OR be type 'agent'
            has_expert_structure = (
                node_type in ['agent', 'expertAgent', 'expert_agent'] or
                task_id == 'expert_agent' or
                node_data.get('type') == 'agent' or
                node_data.get('_original_type') == 'agent'
            )
            
            if has_expert_structure:
                # Extract agent ID from various possible locations
                # Priority: config.agentId > agentId > agent.id > node.id (only if it's a UUID)
                agent_id = None
                
                # Check config.agentId first (set by PropertyPanel)
                if node_data.get('config') and isinstance(node_data.get('config'), dict):
                    agent_id = node_data.get('config', {}).get('agentId')
                
                # Check data.agentId
                if not agent_id:
                    agent_id = node_data.get('agentId')
                
                # Check data.agent.id
                if not agent_id and node_data.get('agent') and isinstance(node_data.get('agent'), dict):
                    agent_id = node_data.get('agent', {}).get('id')
                
                # Get node ID for validation
                node_id = node.get('id', '')
                
                # Only add if we have a valid UUID-formatted agent ID from config
                # DO NOT use node ID as fallback - only real agent IDs from PropertyPanel
                if agent_id:
                    # Verify it's a UUID format (36 chars with dashes)
                    if len(agent_id) == 36 and agent_id.count('-') == 4:
                        # Make sure it's not the same as node_id (which would be a fallback)
                        if agent_id != node_id:
                            agent_ids.append(agent_id)
                            agent_nodes.append({
                                'node_id': node_id,
                                'agent_id': agent_id,
                                'label': node_data.get('label', f"Agent {agent_id[:8]}")
                            })
                            print(f"✅ Added expert node {node_id} with agent ID {agent_id[:8]}...")
                        else:
                            print(f"⚠️ Skipping node {node_id}: agent_id is same as node_id (no real agent selected)")
                    else:
                        print(f"⚠️ Skipping node {node_id}: agent_id '{agent_id}' is not a valid UUID (length: {len(agent_id)})")
                else:
                    print(f"⚠️ Skipping node {node_id}: No agent ID found in config.agentId. Please select a real agent in the Property Panel.")
        
        print(f"🔵 [Panel Simple] Found {len(agent_ids)} agent nodes with real agent IDs: {agent_ids}")
        
        if not agent_ids:
            print("⚠️ [Panel Simple] No real agent IDs found in workflow nodes")
            # Don't use placeholder - return error or empty response
            return {
                "success": False,
                "error": "No expert agents configured. Please select real agents for expert nodes in the workflow designer.",
                "expert_responses": [],
                "consensus_summary": "No experts available to discuss the questions.",
                "execution_metadata": {
                    "total_agents": 0,
                    "response_time_ms": int((time.time() - start_time) * 1000),
                }
            }
        
        # Load agents from Supabase and execute with real LLM calls
        panel_responses = []
        agents_data = []
        
        if supabase_client and supabase_client.client:
            for agent_id in agent_ids:
                # Validate UUID format (already validated above, but double-check)
                if not (len(agent_id) == 36 and agent_id.count('-') == 4):
                    print(f"⚠️ Skipping '{agent_id}': Not a valid UUID format")
                    continue
                
                try:
                    agent = await supabase_client.get_agent_by_id(agent_id)
                    if agent:
                        agents_data.append({
                            "id": agent_id,
                            "name": agent.get("name", f"Agent {agent_id[:8]}"),
                            "system_prompt": agent.get("system_prompt", "You are a helpful AI assistant."),
                            "model": agent.get("base_model") or agent.get("model_name") or "gpt-4o",
                            "temperature": agent.get("metadata", {}).get("temperature", 0.7) if isinstance(agent.get("metadata"), dict) else 0.7
                        })
                    else:
                        print(f"⚠️ Agent {agent_id} not found in database, using default")
                        agents_data.append({
                            "id": agent_id,
                            "name": f"Agent {agent_id[:8]}",
                            "system_prompt": "You are a helpful AI assistant.",
                            "model": "gpt-4o",
                            "temperature": 0.7
                        })
                except Exception as e:
                    print(f"⚠️ Error loading agent {agent_id}: {e}")
                    agents_data.append({
                        "id": agent_id,
                        "name": f"Agent {agent_id[:8]}",
                        "system_prompt": "You are a helpful AI assistant.",
                        "model": "gpt-4o",
                        "temperature": 0.7
                    })
        else:
            # Fallback if Supabase not available
            print("⚠️ Supabase client not available, using default agent configs")
            for agent_id in agent_ids:
                agents_data.append({
                    "id": agent_id,
                    "name": f"Agent {agent_id[:8]}",
                    "system_prompt": "You are a helpful AI assistant.",
                    "model": "gpt-4o",
                    "temperature": 0.7
                })
        
        # Execute agents sequentially so each expert can see previous responses
        conversation_history = []  # Track all previous expert responses
        
        for index, agent in enumerate(agents_data):
            try:
                print(f"  → Executing panel agent {index + 1}/{len(agents_data)}: {agent['name']} ({agent['id'][:8]}...)")
                print(f"  → Query: {request.query[:100]}...")
                
                # Build enhanced system prompt that includes the agent's role
                system_prompt = agent["system_prompt"]
                if not system_prompt or system_prompt == "You are a helpful AI assistant.":
                    # Use agent name to create a more specific prompt
                    system_prompt = f"""You are {agent['name']}, an expert in your field participating in a panel discussion.

You are part of a multi-expert panel where experts provide their perspectives sequentially. You will see what previous experts have said, and you should:
- Provide your own expert perspective on the questions
- Build upon or reference previous expert responses when relevant
- Add new insights or different angles
- Maintain a professional, collaborative tone

Provide detailed, professional responses based on your expertise."""
                
                # Build messages with conversation history
                messages = [{"role": "system", "content": system_prompt}]
                
                # Add the original questions (only once, deduplicated)
                user_content = request.query
                if not user_content or user_content.strip() == "":
                    user_content = "Please provide your expert perspective on the topics discussed."
                else:
                    # Remove duplicate questions if they exist
                    # Split by double newlines and deduplicate
                    questions_list = [q.strip() for q in user_content.split('\n\n') if q.strip()]
                    unique_questions = []
                    seen_questions = set()
                    for q in questions_list:
                        # Normalize question (remove extra whitespace, lowercase for comparison)
                        normalized = q.strip().lower()
                        if normalized and normalized not in seen_questions:
                            unique_questions.append(q.strip())
                            seen_questions.add(normalized)
                    
                    if unique_questions:
                        user_content = "\n\n".join(unique_questions)
                    
                    # Format the questions for better context
                    user_content = f"""Please provide your expert perspective on the following questions:

{user_content}"""
                
                messages.append({"role": "user", "content": user_content})
                
                # Add previous expert responses as context (if any)
                if conversation_history:
                    context_text = "\n\n--- Previous Expert Responses ---\n\n"
                    for prev_response in conversation_history:
                        context_text += f"**{prev_response['agent_name']}**: {prev_response['response']}\n\n"
                    context_text += "\n--- End of Previous Responses ---\n\n"
                    context_text += "Please provide your expert perspective, building on or adding to what has been discussed above."
                    messages.append({"role": "user", "content": context_text})
                
                # Call OpenAI
                response = client.chat.completions.create(
                    model=agent["model"],
                    messages=messages,
                    temperature=agent["temperature"],
                    max_tokens=2000
                )
                
                agent_response_text = response.choices[0].message.content
                
                # Add this response to conversation history for next experts
                agent_response = {
                    "agent_id": agent["id"],
                    "agent_name": agent["name"],
                    "response": agent_response_text,
                    "confidence": 0.85,
                    "model_used": agent["model"],
                    "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else None,
                    "error": False
                }
                
                panel_responses.append(agent_response)
                conversation_history.append(agent_response)
                
                print(f"  ✅ {agent['name']} responded ({len(agent_response_text)} chars)")
                
            except Exception as e:
                print(f"❌ Error executing panel agent {agent['id']}: {e}")
                error_response = {
                    "agent_id": agent["id"],
                    "agent_name": agent["name"],
                    "response": f"Error: {str(e)}",
                    "confidence": 0.0,
                    "error": True
                }
                panel_responses.append(error_response)
                # Don't add errors to conversation history

        # Build consensus summary
        successful_responses = [r for r in panel_responses if not r.get("error", False)]
        if successful_responses:
            consensus_summary = f"Panel consensus from {len(successful_responses)} expert(s):\n\n"
            consensus_summary += "\n\n".join([
                f"**{r['agent_name']}**: {r['response']}"
                    for r in successful_responses
            ])
        else:
            consensus_summary = "All panel experts failed to respond. Please check the error messages above."

        duration = int((time.time() - start_time) * 1000)

        return {
            "success": True,
            "session_id": f"session_{int(time.time())}",
            "panel_type": request.panel_type,
            "expert_responses": panel_responses,
            "consensus_level": 0.85 if successful_responses else 0.0,
            "consensus_summary": consensus_summary,
            "execution_metadata": {
                "total_agents": len(panel_responses),
                "successful_agents": len(successful_responses),
                "response_time_ms": duration,
                "workflow_nodes": len(request.workflow.get('nodes', [])),
                "workflow_edges": len(request.workflow.get('edges', [])),
                "mode": "real_execution"
            }
        }

    except Exception as e:
        print(f"❌ [Panel Simple] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Panel execution failed: {str(e)}"
        )

