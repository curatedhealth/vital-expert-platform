# LangGraph Agent Orchestration Architecture for Ask Expert Workflows

**Document Version**: 1.0
**Date**: November 21, 2025
**Author**: LangGraph Orchestration Architect
**Status**: Design Specification

---

## Executive Summary

This document defines the comprehensive LangGraph orchestration architecture for agent management across all Ask Expert modes (Modes 1-4) and panel workflows. It provides production-grade patterns for agent selection, loading, execution, and coordination within the VITAL platform.

### Key Design Principles

1. **Agent-First Architecture**: Agents are first-class citizens with complete profiles, personas, and capabilities
2. **Dynamic Loading**: Agents loaded from database at runtime based on frontend selection
3. **State Immutability**: All agent data flows through immutable LangGraph state
4. **Tenant Isolation**: Every agent operation respects tenant boundaries
5. **Graceful Degradation**: Missing agents or capabilities never block workflows

---

## Table of Contents

1. [Agent Selection API Contract](#1-agent-selection-api-contract)
2. [Agent Loading Mechanism](#2-agent-loading-mechanism)
3. [State Schema Design](#3-state-schema-design)
4. [Agent Coordination Patterns](#4-agent-coordination-patterns)
5. [Integration Points](#5-integration-points)
6. [Implementation Examples](#6-implementation-examples)
7. [Error Handling](#7-error-handling)
8. [Testing Strategy](#8-testing-strategy)

---

## 1. Agent Selection API Contract

### 1.1 Frontend → Backend Request Format

The frontend sends agent selections via the Ask Expert orchestration API.

```typescript
// POST /api/ask-expert/orchestrate
interface OrchestrationRequest {
  // Session Context
  mode: 'mode_1_interactive_manual' | 'mode_2_interactive_auto' |
        'mode_3_chat_manual' | 'mode_4_chat_auto';
  user_id: string;
  tenant_id: string;
  session_id?: string;  // For multi-turn conversations

  // Agent Selection (Mode-Specific)
  agent_selection: {
    // Mode 1 & 3: User manually selects ONE agent
    selected_agent_id?: string;  // UUID from agents table

    // Mode 2 & 4: System auto-selects agents
    auto_select?: boolean;  // true = let backend choose

    // Optional: Constrain auto-selection
    preferred_domain?: string;  // e.g., "regulatory", "medical"
    preferred_tier?: 1 | 2 | 3;  // Constrain tier
    excluded_agents?: string[];  // Agent IDs to exclude
  };

  // User Query
  query: string;

  // Workflow Configuration
  config?: {
    enable_rag?: boolean;
    enable_tools?: boolean;
    enable_sub_agents?: boolean;
    streaming?: boolean;
    max_tokens?: number;
    temperature?: number;
  };

  // Context
  conversation_context?: {
    previous_messages?: Message[];  // For multi-turn
    uploaded_documents?: string[];  // Document IDs
    metadata?: Record<string, any>;
  };
}
```

### 1.2 What LangGraph Needs to Load an Agent

When the backend receives an agent ID, it must load these components:

```python
# From database: agents table
class AgentProfile:
    """Complete agent profile loaded from database."""

    # Core Identity
    id: str  # UUID
    name: str  # Unique internal name (e.g., "fda_510k_expert")
    display_name: str  # User-facing name (e.g., "Dr. Sarah Mitchell")
    description: str

    # AI Configuration
    model: str  # e.g., "gpt-4-turbo-preview"
    system_prompt: str  # Agent persona and instructions
    temperature: float
    max_tokens: int

    # Capabilities & Knowledge
    capabilities: List[str]  # ["510k submission", "predicate search"]
    knowledge_base_ids: List[str]  # RAG knowledge bases to search
    domain_expertise: str  # "regulatory", "medical", etc.

    # Sub-Agent Pool
    sub_agent_pool: List[str]  # IDs of specialist sub-agents

    # Metadata
    tier: int  # 1, 2, or 3
    status: str  # "active", "testing", "deprecated"
    avatar: str  # Avatar URL or emoji
    color: str  # Theme color

    # Tenant Isolation
    tenant_id: str  # Agent owner (platform or custom)
    is_custom: bool  # User-created agent?
```

### 1.3 Agent Handoff Between Nodes

Agents are passed through LangGraph state as structured data:

```python
# state_schemas.py
class AgentState(TypedDict):
    """Agent state for workflow nodes."""

    # Agent Profile (loaded from DB)
    agent: AgentProfile

    # Agent Context (built during workflow)
    agent_persona_message: SystemMessage  # Built from system_prompt
    agent_knowledge_context: str  # RAG context from knowledge_base_ids
    agent_conversation_history: List[BaseMessage]  # Multi-turn history

    # Agent Execution State
    agent_execution_status: str  # "pending", "executing", "completed"
    agent_response: Optional[str]
    agent_confidence: Optional[float]
    agent_citations: List[Citation]

    # Sub-Agent Coordination
    spawned_sub_agents: List[str]  # IDs of spawned specialists
    sub_agent_results: List[SubAgentResult]
```

---

## 2. Agent Loading Mechanism

### 2.1 Unified Agent Loader Service

A single, reusable service for loading agents across all modes.

```python
# services/agent_loader.py

from typing import Optional, List
from pydantic import BaseModel
import structlog
from supabase import Client as SupabaseClient

logger = structlog.get_logger()


class AgentProfile(BaseModel):
    """Agent profile with all required fields."""
    id: str
    name: str
    display_name: str
    description: str
    system_prompt: str
    model: str
    temperature: float
    max_tokens: int
    capabilities: List[str]
    knowledge_base_ids: List[str]
    domain_expertise: str
    sub_agent_pool: List[str]
    tier: int
    status: str
    avatar: str
    color: str
    tenant_id: str
    is_custom: bool
    metadata: dict


class AgentLoadError(Exception):
    """Raised when agent loading fails."""
    pass


class UnifiedAgentLoader:
    """
    Unified agent loading service for all Ask Expert modes.

    Responsibilities:
    - Load agent profiles from database
    - Validate agent availability and permissions
    - Handle tenant isolation
    - Provide fallback for missing agents
    - Cache frequently-used agents (future)
    """

    def __init__(self, supabase: SupabaseClient):
        self.supabase = supabase
        self._agent_cache = {}  # Simple in-memory cache

    async def load_agent_by_id(
        self,
        agent_id: str,
        tenant_id: str,
        user_id: Optional[str] = None
    ) -> AgentProfile:
        """
        Load agent profile by ID with tenant isolation.

        Args:
            agent_id: Agent UUID
            tenant_id: User's tenant ID (for RLS)
            user_id: Optional user ID (for custom agent access)

        Returns:
            AgentProfile with complete agent data

        Raises:
            AgentLoadError if agent not found or unauthorized
        """
        try:
            logger.info(
                "Loading agent profile",
                agent_id=agent_id,
                tenant_id=tenant_id
            )

            # Query agents table with RLS enforcement
            response = self.supabase.table("agents") \
                .select("""
                    id,
                    name,
                    display_name,
                    description,
                    system_prompt,
                    metadata,
                    specializations,
                    base_model,
                    temperature,
                    max_tokens,
                    status,
                    tenant_id,
                    avatar_url,
                    color_scheme
                """) \
                .eq("id", agent_id) \
                .in_("status", ["active", "testing"]) \
                .single() \
                .execute()

            if not response.data:
                raise AgentLoadError(f"Agent {agent_id} not found or inactive")

            agent_data = response.data

            # Validate tenant access
            # Platform agents (tenant_id = platform) are accessible to all
            # Custom agents only accessible to owner tenant
            if agent_data["tenant_id"] != tenant_id and \
               agent_data["tenant_id"] != "platform":
                raise AgentLoadError(
                    f"Agent {agent_id} not accessible to tenant {tenant_id}"
                )

            # Parse metadata (JSON field)
            metadata = agent_data.get("metadata", {})

            # Build AgentProfile
            profile = AgentProfile(
                id=agent_data["id"],
                name=agent_data["name"],
                display_name=metadata.get("display_name") or agent_data["display_name"],
                description=agent_data["description"],
                system_prompt=agent_data["system_prompt"],
                model=metadata.get("model") or agent_data["base_model"] or "gpt-4",
                temperature=metadata.get("temperature") or agent_data.get("temperature", 0.7),
                max_tokens=metadata.get("max_tokens") or agent_data.get("max_tokens", 2000),
                capabilities=agent_data.get("specializations", []),
                knowledge_base_ids=metadata.get("knowledge_base_ids", []),
                domain_expertise=metadata.get("domain_expertise", "general"),
                sub_agent_pool=metadata.get("sub_agents", []),
                tier=metadata.get("tier", 2),
                status=agent_data["status"],
                avatar=agent_data.get("avatar_url", "🤖"),
                color=agent_data.get("color_scheme", {}).get("primary", "#3B82F6"),
                tenant_id=agent_data["tenant_id"],
                is_custom=metadata.get("is_custom", False),
                metadata=metadata
            )

            logger.info(
                "Agent profile loaded successfully",
                agent_id=agent_id,
                display_name=profile.display_name,
                domain=profile.domain_expertise,
                tier=profile.tier
            )

            return profile

        except Exception as e:
            logger.error(
                "Failed to load agent profile",
                agent_id=agent_id,
                tenant_id=tenant_id,
                error=str(e)
            )
            raise AgentLoadError(f"Failed to load agent: {str(e)}")

    async def load_default_agent_for_domain(
        self,
        domain: str,
        tenant_id: str
    ) -> AgentProfile:
        """
        Load default platform agent for a domain.

        Used as fallback when auto-selection fails or no agent specified.

        Args:
            domain: Domain expertise (e.g., "regulatory", "medical")
            tenant_id: User's tenant ID

        Returns:
            AgentProfile for default domain expert
        """
        try:
            logger.info(
                "Loading default agent for domain",
                domain=domain,
                tenant_id=tenant_id
            )

            # Query for platform agent matching domain
            response = self.supabase.table("agents") \
                .select("*") \
                .eq("tenant_id", "platform") \
                .eq("status", "active") \
                .filter("metadata->>domain_expertise", "eq", domain) \
                .order("metadata->>tier") \
                .limit(1) \
                .execute()

            if not response.data:
                # Ultimate fallback: general assistant
                return await self._load_general_fallback(tenant_id)

            agent_id = response.data[0]["id"]
            return await self.load_agent_by_id(agent_id, tenant_id)

        except Exception as e:
            logger.error(
                "Failed to load default agent",
                domain=domain,
                error=str(e)
            )
            return await self._load_general_fallback(tenant_id)

    async def load_sub_agent_pool(
        self,
        parent_agent: AgentProfile,
        tenant_id: str
    ) -> List[AgentProfile]:
        """
        Load sub-agent pool for a parent agent.

        Args:
            parent_agent: Parent agent profile
            tenant_id: User's tenant ID

        Returns:
            List of sub-agent profiles
        """
        try:
            if not parent_agent.sub_agent_pool:
                return []

            logger.info(
                "Loading sub-agent pool",
                parent_agent=parent_agent.name,
                sub_agent_count=len(parent_agent.sub_agent_pool)
            )

            sub_agents = []
            for sub_agent_id in parent_agent.sub_agent_pool:
                try:
                    sub_agent = await self.load_agent_by_id(
                        sub_agent_id,
                        tenant_id
                    )
                    sub_agents.append(sub_agent)
                except AgentLoadError as e:
                    logger.warning(
                        "Failed to load sub-agent",
                        sub_agent_id=sub_agent_id,
                        error=str(e)
                    )
                    # Continue loading other sub-agents

            return sub_agents

        except Exception as e:
            logger.error(
                "Failed to load sub-agent pool",
                parent_agent=parent_agent.name,
                error=str(e)
            )
            return []

    async def _load_general_fallback(self, tenant_id: str) -> AgentProfile:
        """Load general fallback agent."""
        # This could query for a "general assistant" platform agent
        # For now, return a minimal profile
        return AgentProfile(
            id="fallback_general",
            name="general_assistant",
            display_name="General Assistant",
            description="General purpose AI assistant",
            system_prompt="You are a helpful AI assistant.",
            model="gpt-4",
            temperature=0.7,
            max_tokens=2000,
            capabilities=["general assistance"],
            knowledge_base_ids=[],
            domain_expertise="general",
            sub_agent_pool=[],
            tier=3,
            status="active",
            avatar="🤖",
            color="#6B7280",
            tenant_id="platform",
            is_custom=False,
            metadata={}
        )
```

### 2.2 Agent Pool Management (Mode 2 & 4)

For automatic agent selection modes, manage a pool of available agents.

```python
# services/agent_pool_manager.py

class AgentPoolManager:
    """
    Manages agent pools for automatic selection modes.

    Responsibilities:
    - Load available agents based on query domain
    - Score agents for relevance
    - Handle agent availability and load balancing
    """

    def __init__(self, supabase: SupabaseClient, agent_loader: UnifiedAgentLoader):
        self.supabase = supabase
        self.agent_loader = agent_loader

    async def get_available_agents(
        self,
        tenant_id: str,
        domain: Optional[str] = None,
        tier: Optional[int] = None
    ) -> List[AgentProfile]:
        """
        Get all available agents for a tenant.

        Args:
            tenant_id: User's tenant ID
            domain: Optional domain filter
            tier: Optional tier filter

        Returns:
            List of available agent profiles
        """
        try:
            query = self.supabase.table("agents") \
                .select("id") \
                .in_("status", ["active", "testing"]) \
                .or_(f"tenant_id.eq.platform,tenant_id.eq.{tenant_id}")

            if domain:
                query = query.filter("metadata->>domain_expertise", "eq", domain)

            if tier:
                query = query.filter("metadata->>tier", "eq", str(tier))

            response = query.execute()

            agents = []
            for row in response.data:
                try:
                    agent = await self.agent_loader.load_agent_by_id(
                        row["id"],
                        tenant_id
                    )
                    agents.append(agent)
                except AgentLoadError:
                    # Skip agents that fail to load
                    continue

            return agents

        except Exception as e:
            logger.error(
                "Failed to get available agents",
                tenant_id=tenant_id,
                error=str(e)
            )
            return []

    async def score_agents_for_query(
        self,
        query: str,
        agents: List[AgentProfile]
    ) -> List[tuple[AgentProfile, float]]:
        """
        Score agents based on relevance to query.

        Uses simple keyword matching for now.
        Future: Use embedding similarity.

        Args:
            query: User query
            agents: List of available agents

        Returns:
            List of (agent, score) tuples, sorted by score
        """
        scored_agents = []

        for agent in agents:
            score = self._calculate_relevance_score(query, agent)
            scored_agents.append((agent, score))

        # Sort by score descending
        scored_agents.sort(key=lambda x: x[1], reverse=True)

        return scored_agents

    def _calculate_relevance_score(
        self,
        query: str,
        agent: AgentProfile
    ) -> float:
        """
        Calculate relevance score for agent.

        Simple keyword matching:
        - Check if query keywords match agent capabilities
        - Check if query keywords match agent description
        - Tier 1 agents get small boost
        """
        score = 0.0
        query_lower = query.lower()

        # Check capabilities
        for capability in agent.capabilities:
            if capability.lower() in query_lower:
                score += 0.3

        # Check description
        description_words = agent.description.lower().split()
        query_words = query_lower.split()
        matching_words = set(query_words) & set(description_words)
        score += len(matching_words) * 0.1

        # Tier bonus
        if agent.tier == 1:
            score += 0.2
        elif agent.tier == 2:
            score += 0.1

        return score
```

---

## 3. State Schema Design

### 3.1 Complete Mode 1 State Schema

Enhanced state schema with full agent integration.

```python
# langgraph_workflows/state_schemas.py

from typing import TypedDict, List, Dict, Any, Optional, Annotated
from datetime import datetime
from langchain_core.messages import BaseMessage
import operator


class Mode1State(TypedDict):
    """
    Complete state schema for Mode 1: Interactive Manual workflow.

    User selects specific expert → Multi-turn conversation with full context retention.
    """

    # ==================== SESSION CONTEXT ====================
    session_id: str  # Conversation session UUID
    user_id: str  # User UUID
    tenant_id: str  # Tenant UUID (REQUIRED - Golden Rule #3)
    mode: str  # "mode_1_interactive_manual"

    # ==================== AGENT SELECTION ====================
    # Frontend sends selected_agent_id → Backend loads profile
    selected_agent_id: str  # Agent ID selected by user
    agent: Optional[Dict[str, Any]]  # Loaded AgentProfile (from UnifiedAgentLoader)
    agent_persona_message: Optional[BaseMessage]  # SystemMessage built from system_prompt
    sub_agent_pool: List[Dict[str, Any]]  # Pre-loaded sub-agents

    # ==================== CONVERSATION STATE ====================
    messages: Annotated[List[BaseMessage], operator.add]  # LangChain message history
    current_message: str  # User's current message
    conversation_history: List[Dict[str, Any]]  # Full conversation from DB
    turn_count: int  # Number of conversation turns

    # ==================== CONTEXT MANAGEMENT ====================
    context_window: str  # RAG context summary
    rag_context: List[Dict[str, Any]]  # Retrieved knowledge chunks
    rag_cache_hit: bool  # Was RAG retrieved from cache?
    uploaded_documents: List[str]  # Document IDs uploaded by user

    # ==================== SUB-AGENT ORCHESTRATION ====================
    needs_specialists: bool  # Should spawn specialists?
    specialists_to_spawn: List[str]  # Sub-agent IDs to spawn
    spawned_specialist_ids: List[str]  # Actually spawned sub-agents
    specialist_results: List[Dict[str, Any]]  # Results from sub-agents

    # ==================== TOOL EXECUTION ====================
    needs_tools: bool  # Should execute tools?
    tools_to_use: List[str]  # Tool names to execute
    tool_results: List[Dict[str, Any]]  # Tool execution results

    # ==================== REASONING & GENERATION ====================
    thinking_steps: List[Dict[str, str]]  # Chain-of-thought steps
    reasoning_mode: str  # "chain_of_thought" | "tree_of_thoughts"
    response: str  # Final response text
    citations: List[Dict[str, Any]]  # Source citations
    confidence_score: float  # Response confidence (0-1)

    # ==================== WORKFLOW CONTROL ====================
    workflow_step: str  # Current node name
    continue_conversation: bool  # Should continue to next turn?
    error: Optional[str]  # Error message if any

    # ==================== METADATA & ANALYTICS ====================
    tokens_used: Dict[str, int]  # Token usage breakdown
    estimated_cost: float  # USD cost estimate
    response_time_ms: int  # Total response time
    timestamp: str  # ISO timestamp

    # ==================== RESPONSE METADATA ====================
    user_message_id: str  # DB ID of user message
    assistant_message_id: str  # DB ID of assistant message
```

### 3.2 State Schemas for Other Modes

```python
# Mode 2: Interactive Automatic
class Mode2State(TypedDict):
    """Mode 2: System auto-selects agents based on query."""
    # ... similar to Mode 1, but:
    selected_agent_id: Optional[str]  # Determined by system, not user
    agent_selection_reasoning: str  # Why this agent was chosen
    agent_selection_confidence: float  # Confidence in selection
    available_agents: List[Dict[str, Any]]  # Pool of available agents


# Mode 3: Chat Manual (Autonomous)
class Mode3State(TypedDict):
    """Mode 3: User selects persistent agent, autonomous execution."""
    # ... similar to Mode 1, plus:
    persistent_agent_id: str  # Agent persists across sessions
    autonomous_execution: bool  # Agent can execute tools without approval
    task_plan: Dict[str, Any]  # Multi-step task plan
    execution_checkpoints: List[Dict[str, Any]]  # Checkpoints reached


# Mode 4: Chat Automatic (Autonomous)
class Mode4State(TypedDict):
    """Mode 4: System auto-selects persistent agent, autonomous."""
    # ... combines Mode 2 (auto-select) + Mode 3 (autonomous)
    pass
```

---

## 4. Agent Coordination Patterns

### 4.1 Single Agent Execution (Mode 1 & 3)

**Pattern**: Load agent → Execute with context → Return response

```python
# langgraph_workflows/mode1_manual_query.py

async def load_agent_node(state: Mode1State) -> Mode1State:
    """
    Node: Load Agent Profile

    Input: state["selected_agent_id"] from frontend
    Output: state["agent"], state["agent_persona_message"], state["sub_agent_pool"]
    """
    agent_loader = UnifiedAgentLoader(supabase)

    try:
        # Load agent profile from database
        agent_profile = await agent_loader.load_agent_by_id(
            agent_id=state["selected_agent_id"],
            tenant_id=state["tenant_id"],
            user_id=state["user_id"]
        )

        # Build SystemMessage from agent's system_prompt
        persona_message = SystemMessage(content=agent_profile.system_prompt)

        # Load sub-agent pool
        sub_agents = await agent_loader.load_sub_agent_pool(
            parent_agent=agent_profile,
            tenant_id=state["tenant_id"]
        )

        return {
            **state,
            "agent": agent_profile.dict(),
            "agent_persona_message": persona_message,
            "sub_agent_pool": [sa.dict() for sa in sub_agents],
            "workflow_step": "load_agent"
        }

    except AgentLoadError as e:
        logger.error("Agent load failed", error=str(e))
        return {
            **state,
            "error": f"Failed to load agent: {str(e)}",
            "workflow_step": "load_agent"
        }


async def execute_agent_node(state: Mode1State) -> Mode1State:
    """
    Node: Execute Agent

    Uses loaded agent profile to generate response.
    """
    agent_orchestrator = AgentOrchestrator(supabase)

    agent_profile = AgentProfile(**state["agent"])

    # Build comprehensive prompt
    messages = [
        state["agent_persona_message"],  # System prompt
        *state["messages"],  # Conversation history
        HumanMessage(content=state["current_message"])  # Current query
    ]

    # Add RAG context if available
    if state.get("rag_context"):
        context_summary = build_context_summary(state["rag_context"])
        messages.insert(1, SystemMessage(content=f"Context:\n{context_summary}"))

    # Add tool results if available
    if state.get("tool_results"):
        tool_summary = build_tool_summary(state["tool_results"])
        messages.insert(1, SystemMessage(content=f"Tool Results:\n{tool_summary}"))

    # Execute LLM with agent's model and parameters
    llm = ChatOpenAI(
        model=agent_profile.model,
        temperature=agent_profile.temperature,
        max_tokens=agent_profile.max_tokens
    )

    response = await llm.ainvoke(messages)

    return {
        **state,
        "response": response.content,
        "workflow_step": "execute_agent"
    }
```

### 4.2 Multi-Agent Coordination (Mode 2 & 4)

**Pattern**: Load agent pool → Score agents → Select best → Execute

```python
# langgraph_workflows/mode2_auto_query.py

async def select_agents_node(state: Mode2State) -> Mode2State:
    """
    Node: Automatic Agent Selection

    Uses AgentPoolManager to select best agent(s) for query.
    """
    pool_manager = AgentPoolManager(supabase, agent_loader)

    # Get available agents for tenant
    available_agents = await pool_manager.get_available_agents(
        tenant_id=state["tenant_id"],
        domain=state.get("preferred_domain")  # Optional filter
    )

    # Score agents for relevance
    scored_agents = await pool_manager.score_agents_for_query(
        query=state["current_message"],
        agents=available_agents
    )

    if not scored_agents:
        return {
            **state,
            "error": "No available agents found",
            "workflow_step": "select_agents"
        }

    # Select top agent
    best_agent, score = scored_agents[0]

    logger.info(
        "Agent auto-selected",
        agent=best_agent.display_name,
        score=score
    )

    return {
        **state,
        "selected_agent_id": best_agent.id,
        "agent": best_agent.dict(),
        "agent_selection_reasoning": f"Selected based on relevance score: {score:.2f}",
        "agent_selection_confidence": score,
        "available_agents": [a.dict() for a, s in scored_agents[:5]],
        "workflow_step": "select_agents"
    }
```

### 4.3 Sub-Agent Spawning

**Pattern**: Analyze query → Determine specialists → Spawn → Execute → Aggregate

```python
# langgraph_workflows/mode1_manual_query.py

async def spawn_specialists_node(state: Mode1State) -> Mode1State:
    """
    Node: Spawn Specialist Sub-Agents

    Dynamically spawns Level 3 specialists based on query complexity.
    """
    sub_agent_spawner = SubAgentSpawner()

    spawned_ids = []
    specialist_results = []

    for specialist_name in state["specialists_to_spawn"]:
        # Find specialist in sub-agent pool
        specialist = next(
            (sa for sa in state["sub_agent_pool"] if sa["name"] == specialist_name),
            None
        )

        if not specialist:
            logger.warning(f"Specialist {specialist_name} not found in pool")
            continue

        # Spawn specialist
        sub_agent_id = await sub_agent_spawner.spawn_specialist(
            parent_agent_id=state["agent"]["id"],
            task=state["current_message"],
            specialty=specialist["domain_expertise"],
            context={
                "query": state["current_message"],
                "rag_context": state.get("rag_context", []),
                "conversation_history": state.get("conversation_history", [])
            },
            model=specialist["model"],
            temperature=specialist["temperature"]
        )

        spawned_ids.append(sub_agent_id)

        # Execute specialist
        result = await sub_agent_spawner.execute_sub_agent(sub_agent_id)
        specialist_results.append(result.dict())

    return {
        **state,
        "spawned_specialist_ids": spawned_ids,
        "specialist_results": specialist_results,
        "workflow_step": "spawn_specialists"
    }
```

### 4.4 Agent Handoff Protocol

**Pattern**: Agent A → Handoff decision → Agent B

```python
async def agent_handoff_node(state: Mode2State) -> Mode2State:
    """
    Node: Agent Handoff

    Current agent determines if query should be handed off to specialist.
    """
    current_agent = AgentProfile(**state["agent"])

    # Agent analyzes if handoff is needed
    handoff_analysis = await analyze_handoff_need(
        query=state["current_message"],
        current_agent=current_agent,
        available_agents=state["available_agents"]
    )

    if handoff_analysis["should_handoff"]:
        target_agent_id = handoff_analysis["target_agent_id"]

        logger.info(
            "Agent handoff",
            from_agent=current_agent.display_name,
            to_agent_id=target_agent_id,
            reason=handoff_analysis["reason"]
        )

        # Load target agent
        agent_loader = UnifiedAgentLoader(supabase)
        target_agent = await agent_loader.load_agent_by_id(
            agent_id=target_agent_id,
            tenant_id=state["tenant_id"]
        )

        return {
            **state,
            "agent": target_agent.dict(),
            "agent_persona_message": SystemMessage(content=target_agent.system_prompt),
            "handoff_occurred": True,
            "handoff_reason": handoff_analysis["reason"],
            "workflow_step": "agent_handoff"
        }

    return {
        **state,
        "handoff_occurred": False,
        "workflow_step": "agent_handoff"
    }
```

---

## 5. Integration Points

### 5.1 API Endpoints

```python
# main.py (FastAPI)

from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse
from services.agent_loader import UnifiedAgentLoader, AgentLoadError

app = FastAPI()


@app.post("/api/ask-expert/orchestrate")
async def orchestrate_ask_expert(
    request: OrchestrationRequest,
    supabase: SupabaseClient = Depends(get_supabase_client)
) -> StreamingResponse:
    """
    Main orchestration endpoint for all Ask Expert modes.

    Handles agent loading, workflow execution, and streaming.
    """
    # Validate agent selection based on mode
    if request.mode in ["mode_1_interactive_manual", "mode_3_chat_manual"]:
        # Manual selection: validate agent_id exists
        if not request.agent_selection.selected_agent_id:
            return JSONResponse(
                status_code=400,
                content={"error": "selected_agent_id required for manual mode"}
            )

        # Pre-validate agent exists and user has access
        agent_loader = UnifiedAgentLoader(supabase)
        try:
            await agent_loader.load_agent_by_id(
                agent_id=request.agent_selection.selected_agent_id,
                tenant_id=request.tenant_id,
                user_id=request.user_id
            )
        except AgentLoadError as e:
            return JSONResponse(
                status_code=404,
                content={"error": str(e)}
            )

    # Route to appropriate workflow
    if request.mode == "mode_1_interactive_manual":
        workflow = Mode1ManualWorkflow()
    elif request.mode == "mode_2_interactive_auto":
        workflow = Mode2AutoWorkflow()
    elif request.mode == "mode_3_chat_manual":
        workflow = Mode3ManualWorkflow()
    elif request.mode == "mode_4_chat_auto":
        workflow = Mode4AutoWorkflow()
    else:
        return JSONResponse(
            status_code=400,
            content={"error": f"Invalid mode: {request.mode}"}
        )

    # Execute workflow with streaming
    return StreamingResponse(
        workflow.execute_stream(request),
        media_type="text/event-stream"
    )


@app.get("/api/agents/{agent_id}")
async def get_agent_profile(
    agent_id: str,
    tenant_id: str,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """
    Get agent profile for frontend display.

    Used by agent selection UI to show agent details.
    """
    agent_loader = UnifiedAgentLoader(supabase)

    try:
        agent = await agent_loader.load_agent_by_id(
            agent_id=agent_id,
            tenant_id=tenant_id
        )
        return agent.dict()
    except AgentLoadError as e:
        return JSONResponse(
            status_code=404,
            content={"error": str(e)}
        )


@app.get("/api/agents")
async def list_available_agents(
    tenant_id: str,
    domain: Optional[str] = None,
    tier: Optional[int] = None,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """
    List available agents for tenant.

    Used by agent selection UI to populate agent list.
    """
    pool_manager = AgentPoolManager(supabase, UnifiedAgentLoader(supabase))

    agents = await pool_manager.get_available_agents(
        tenant_id=tenant_id,
        domain=domain,
        tier=tier
    )

    return {
        "agents": [agent.dict() for agent in agents],
        "count": len(agents)
    }
```

### 5.2 State Management Requirements

```python
# Database schema requirements

# Table: ask_expert_sessions
# - id (UUID)
# - user_id (UUID)
# - tenant_id (UUID)
# - mode (enum: mode_1, mode_2, mode_3, mode_4)
# - selected_agent_id (UUID, nullable)  # For manual modes
# - current_agent_id (UUID, nullable)  # Currently active agent
# - agent_history (JSONB)  # History of agents used in session
# - conversation_state (JSONB)  # Full state snapshot
# - created_at, updated_at

# Table: ask_expert_messages
# - id (UUID)
# - session_id (UUID)
# - role (enum: user, assistant, system)
# - content (TEXT)
# - agent_id (UUID, nullable)  # Which agent generated this
# - metadata (JSONB)  # Confidence, citations, etc.
# - created_at

# Table: ask_expert_agent_executions
# - id (UUID)
# - session_id (UUID)
# - agent_id (UUID)
# - query (TEXT)
# - response (TEXT)
# - confidence (FLOAT)
# - tokens_used (INTEGER)
# - cost_usd (DECIMAL)
# - execution_time_ms (INTEGER)
# - specialist_ids (TEXT[])  # Sub-agents spawned
# - tool_executions (JSONB)  # Tools used
# - created_at
```

### 5.3 Event/Callback Structure

```python
# Streaming events emitted during workflow execution

# Agent Selection Events
{
    "type": "agent_selected",
    "data": {
        "agent_id": "uuid",
        "agent_name": "FDA 510(k) Expert",
        "agent_avatar": "🏛️",
        "selection_mode": "manual",  # or "automatic"
        "confidence": 0.95,
        "reasoning": "Expert in FDA 510(k) submissions"
    }
}

# Agent Loading Events
{
    "type": "agent_loading",
    "data": {
        "agent_id": "uuid",
        "step": "loading_profile",  # loading_profile, loading_knowledge_bases, loading_sub_agents
        "progress": 0.33
    }
}

# Agent Execution Events
{
    "type": "agent_thinking",
    "data": {
        "agent_id": "uuid",
        "thinking_step": "Analyzing query complexity",
        "timestamp": "2025-11-21T10:30:00Z"
    }
}

# Sub-Agent Events
{
    "type": "specialist_spawned",
    "data": {
        "sub_agent_id": "uuid",
        "parent_agent_id": "uuid",
        "specialty": "Predicate Device Search",
        "task": "Find similar 510(k) predicates"
    }
}

{
    "type": "specialist_result",
    "data": {
        "sub_agent_id": "uuid",
        "result": "Found 3 potential predicates...",
        "confidence": 0.87
    }
}

# Response Streaming
{
    "type": "response_token",
    "data": {
        "agent_id": "uuid",
        "token": "Based",
        "token_index": 0
    }
}

# Completion Events
{
    "type": "response_complete",
    "data": {
        "agent_id": "uuid",
        "response": "Full response text...",
        "confidence": 0.92,
        "citations": [...],
        "tokens_used": 1234,
        "cost_usd": 0.047,
        "execution_time_ms": 15420
    }
}
```

---

## 6. Implementation Examples

### 6.1 Complete Mode 1 Workflow with Agent Loading

```python
# langgraph_workflows/mode1_manual_query.py

from langgraph.graph import StateGraph, END
from services.agent_loader import UnifiedAgentLoader
from services.sub_agent_spawner import SubAgentSpawner


class Mode1ManualWorkflow:
    """
    Mode 1: Interactive Manual workflow implementation.

    User selects specific expert → Multi-turn conversation.
    """

    def __init__(self):
        self.agent_loader = UnifiedAgentLoader(supabase)
        self.sub_agent_spawner = SubAgentSpawner()

        # Build LangGraph state machine
        self.graph = StateGraph(Mode1State)

        # Add nodes
        self.graph.add_node("load_agent", self.load_agent_node)
        self.graph.add_node("load_context", self.load_context_node)
        self.graph.add_node("update_context", self.update_context_node)
        self.graph.add_node("agent_reasoning", self.agent_reasoning_node)
        self.graph.add_node("spawn_specialists", self.spawn_specialists_node)
        self.graph.add_node("tool_execution", self.tool_execution_node)
        self.graph.add_node("generate_response", self.generate_response_node)
        self.graph.add_node("update_memory", self.update_memory_node)

        # Add edges
        self.graph.set_entry_point("load_agent")
        self.graph.add_edge("load_agent", "load_context")
        self.graph.add_edge("load_context", "update_context")
        self.graph.add_edge("update_context", "agent_reasoning")

        # Conditional: spawn specialists?
        self.graph.add_conditional_edges(
            "agent_reasoning",
            self.should_spawn_specialists,
            {
                "spawn": "spawn_specialists",
                "skip": "check_tools"
            }
        )

        self.graph.add_edge("spawn_specialists", "check_tools")

        # Conditional: execute tools?
        self.graph.add_conditional_edges(
            "check_tools",
            self.should_execute_tools,
            {
                "execute": "tool_execution",
                "skip": "generate_response"
            }
        )

        self.graph.add_edge("tool_execution", "generate_response")
        self.graph.add_edge("generate_response", "update_memory")
        self.graph.add_edge("update_memory", END)

        # Compile graph
        self.app = self.graph.compile()

    async def load_agent_node(self, state: Mode1State) -> Mode1State:
        """Load agent profile from database."""
        # Implementation from section 4.1
        ...

    async def agent_reasoning_node(self, state: Mode1State) -> Mode1State:
        """Agent performs chain-of-thought reasoning."""
        agent_profile = AgentProfile(**state["agent"])

        # Build reasoning prompt
        reasoning_prompt = f"""Analyze this query and plan your response:

Query: {state["current_message"]}

Context available: {len(state.get("rag_context", []))} knowledge chunks

Your capabilities: {", ".join(agent_profile.capabilities)}

Your sub-agents: {", ".join([sa["display_name"] for sa in state["sub_agent_pool"]])}

Determine:
1. Do you need specialist sub-agents? If yes, which ones?
2. Do you need to execute tools? If yes, which ones?
3. What is your response strategy?

Output your analysis as JSON:
{{
  "needs_specialists": true/false,
  "specialists_to_spawn": ["specialist_name"],
  "needs_tools": true/false,
  "tools_to_use": ["tool_name"],
  "response_strategy": "brief description"
}}
"""

        llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3)
        response = await llm.ainvoke([
            SystemMessage(content=agent_profile.system_prompt),
            HumanMessage(content=reasoning_prompt)
        ])

        # Parse JSON response
        analysis = json.loads(response.content)

        return {
            **state,
            "needs_specialists": analysis["needs_specialists"],
            "specialists_to_spawn": analysis.get("specialists_to_spawn", []),
            "needs_tools": analysis["needs_tools"],
            "tools_to_use": analysis.get("tools_to_use", []),
            "thinking_steps": [
                {"step": "reasoning", "content": analysis["response_strategy"]}
            ],
            "workflow_step": "agent_reasoning"
        }

    def should_spawn_specialists(self, state: Mode1State) -> str:
        """Conditional: Should spawn specialists?"""
        return "spawn" if state["needs_specialists"] else "skip"

    def should_execute_tools(self, state: Mode1State) -> str:
        """Conditional: Should execute tools?"""
        return "execute" if state["needs_tools"] else "skip"
```

---

## 7. Error Handling

### 7.1 Agent Loading Errors

```python
# Common error scenarios and handling

# Error: Agent not found
try:
    agent = await agent_loader.load_agent_by_id(agent_id, tenant_id)
except AgentLoadError as e:
    # Option 1: Return error to user
    return {"error": str(e), "error_type": "agent_not_found"}

    # Option 2: Load fallback agent
    agent = await agent_loader.load_default_agent_for_domain(
        domain="general",
        tenant_id=tenant_id
    )

# Error: Agent not accessible (tenant mismatch)
# Handled automatically by UnifiedAgentLoader.load_agent_by_id()
# Raises AgentLoadError with clear message

# Error: Agent inactive/deprecated
# Filtered out at query level (status IN ('active', 'testing'))
```

### 7.2 Sub-Agent Spawning Errors

```python
# Error: Sub-agent pool exhausted
try:
    sub_agent_id = await sub_agent_spawner.spawn_specialist(...)
except RuntimeError as e:
    # Log warning and continue without specialist
    logger.warning("Failed to spawn specialist", error=str(e))
    # Workflow continues with main agent only

# Error: Sub-agent execution failure
result = await sub_agent_spawner.execute_sub_agent(sub_agent_id)
if not result.success:
    # Log error but don't block main agent
    logger.error("Sub-agent execution failed",
                 sub_agent_id=sub_agent_id,
                 error=result.error)
    # Continue with available results
```

### 7.3 Agent Selection Errors (Auto Mode)

```python
# Error: No agents available
available_agents = await pool_manager.get_available_agents(tenant_id)
if not available_agents:
    # Load general fallback
    agent = await agent_loader.load_default_agent_for_domain(
        domain="general",
        tenant_id=tenant_id
    )

# Error: All agents score below threshold
scored_agents = await pool_manager.score_agents_for_query(query, agents)
if not scored_agents or scored_agents[0][1] < 0.3:
    # Use general fallback
    ...
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

```python
# tests/test_agent_loader.py

import pytest
from services.agent_loader import UnifiedAgentLoader, AgentLoadError


@pytest.mark.asyncio
async def test_load_agent_by_id_success(mock_supabase):
    """Test successful agent loading."""
    loader = UnifiedAgentLoader(mock_supabase)

    agent = await loader.load_agent_by_id(
        agent_id="test_agent_id",
        tenant_id="test_tenant_id"
    )

    assert agent.id == "test_agent_id"
    assert agent.display_name == "Test Agent"
    assert len(agent.capabilities) > 0


@pytest.mark.asyncio
async def test_load_agent_by_id_not_found(mock_supabase):
    """Test agent not found error."""
    loader = UnifiedAgentLoader(mock_supabase)

    with pytest.raises(AgentLoadError, match="not found"):
        await loader.load_agent_by_id(
            agent_id="nonexistent_id",
            tenant_id="test_tenant_id"
        )


@pytest.mark.asyncio
async def test_load_agent_tenant_isolation(mock_supabase):
    """Test tenant isolation enforcement."""
    loader = UnifiedAgentLoader(mock_supabase)

    with pytest.raises(AgentLoadError, match="not accessible"):
        await loader.load_agent_by_id(
            agent_id="agent_from_other_tenant",
            tenant_id="test_tenant_id"
        )
```

### 8.2 Integration Tests

```python
# tests/integration/test_mode1_workflow.py

@pytest.mark.asyncio
@pytest.mark.integration
async def test_mode1_workflow_with_agent_loading(db, rag_service):
    """Test Mode 1 workflow with real agent loading."""
    # Create test agent in database
    agent_id = await create_test_agent(
        db,
        name="test_fda_expert",
        display_name="Test FDA Expert",
        domain="regulatory"
    )

    # Execute workflow
    workflow = Mode1ManualWorkflow()
    initial_state = {
        "selected_agent_id": agent_id,
        "tenant_id": "test_tenant",
        "user_id": "test_user",
        "session_id": "test_session",
        "current_message": "What is a 510(k)?",
        "mode": "mode_1_interactive_manual",
        # ... other required fields
    }

    result = await workflow.app.ainvoke(initial_state)

    # Assertions
    assert result["agent"]["id"] == agent_id
    assert result["agent"]["display_name"] == "Test FDA Expert"
    assert result["response"]  # Has response
    assert result["confidence_score"] > 0
    assert "error" not in result


@pytest.mark.asyncio
@pytest.mark.integration
async def test_mode1_workflow_with_sub_agents(db):
    """Test Mode 1 workflow with sub-agent spawning."""
    # Create parent agent with sub-agents
    parent_agent_id = await create_test_agent(db, "parent_agent")
    sub_agent_id = await create_test_agent(db, "specialist_agent")

    # Link sub-agent to parent
    await link_sub_agent(db, parent_agent_id, sub_agent_id)

    # Execute workflow with complex query
    workflow = Mode1ManualWorkflow()
    result = await workflow.app.ainvoke({
        "selected_agent_id": parent_agent_id,
        "current_message": "Complex query requiring specialist...",
        # ...
    })

    # Assertions
    assert result["needs_specialists"] == True
    assert len(result["spawned_specialist_ids"]) > 0
    assert len(result["specialist_results"]) > 0
```

### 8.3 End-to-End Tests

```python
# tests/e2e/test_agent_selection_flow.py

@pytest.mark.e2e
async def test_user_selects_agent_and_sends_query(api_client):
    """Test complete flow: select agent → send query → get response."""
    # 1. List available agents
    response = await api_client.get(
        "/api/agents",
        params={"tenant_id": "test_tenant"}
    )
    assert response.status_code == 200
    agents = response.json()["agents"]
    assert len(agents) > 0

    # 2. User selects agent
    selected_agent_id = agents[0]["id"]

    # 3. Send query with selected agent
    response = await api_client.post(
        "/api/ask-expert/orchestrate",
        json={
            "mode": "mode_1_interactive_manual",
            "user_id": "test_user",
            "tenant_id": "test_tenant",
            "agent_selection": {
                "selected_agent_id": selected_agent_id
            },
            "query": "What is a 510(k)?"
        }
    )
    assert response.status_code == 200

    # 4. Verify streaming response
    # (Implementation depends on SSE client)
```

---

## Appendices

### A. Database Schema

```sql
-- Agents table (already exists)
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    base_model TEXT DEFAULT 'gpt-4',
    temperature FLOAT DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    specializations TEXT[],
    metadata JSONB,  -- Contains knowledge_base_ids, sub_agents, etc.
    status TEXT DEFAULT 'active',
    avatar_url TEXT,
    color_scheme JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent queries
CREATE INDEX idx_agents_tenant_status ON agents(tenant_id, status);
CREATE INDEX idx_agents_metadata_domain ON agents USING GIN ((metadata->'domain_expertise'));
CREATE INDEX idx_agents_metadata_tier ON agents((metadata->>'tier'));

-- Sub-agent relationships
CREATE TABLE agent_sub_agents (
    id UUID PRIMARY KEY,
    parent_agent_id UUID NOT NULL REFERENCES agents(id),
    sub_agent_id UUID NOT NULL REFERENCES agents(id),
    specialty TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_agent_id, sub_agent_id)
);

-- Agent executions tracking
CREATE TABLE ask_expert_agent_executions (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES agents(id),
    query TEXT NOT NULL,
    response TEXT,
    confidence FLOAT,
    tokens_used INTEGER,
    cost_usd DECIMAL(10, 6),
    execution_time_ms INTEGER,
    specialist_ids TEXT[],
    tool_executions JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_agent_executions_agent ON ask_expert_agent_executions(agent_id, created_at);
CREATE INDEX idx_agent_executions_session ON ask_expert_agent_executions(session_id);
```

### B. Configuration Examples

```yaml
# config/agent_orchestration.yaml

agent_loading:
  # Cache agent profiles for N seconds
  cache_ttl: 3600

  # Max concurrent sub-agents per session
  max_sub_agents: 20

  # Agent selection timeout
  selection_timeout_ms: 5000

  # Agent execution timeout
  execution_timeout_ms: 30000

agent_selection:
  # Minimum relevance score for auto-selection
  min_relevance_score: 0.3

  # Fallback to general agent if score below threshold
  use_fallback: true

  # Max agents to score (top K)
  max_agents_to_score: 10

sub_agent_spawning:
  # Enable sub-agent spawning
  enabled: true

  # Max specialists per query
  max_specialists: 3

  # Specialist execution timeout
  specialist_timeout_ms: 15000

  # Execute specialists in parallel
  parallel_execution: true
```

---

## Summary

This architecture provides a comprehensive, production-ready approach to agent orchestration in LangGraph:

1. **Clear API Contract**: Frontend sends agent selections; backend validates and loads
2. **Unified Agent Loader**: Single service handles all agent loading with tenant isolation
3. **Immutable State**: Agents flow through LangGraph state as structured data
4. **Flexible Coordination**: Supports single, multi-agent, and sub-agent patterns
5. **Error Resilience**: Graceful fallbacks for missing or failed agents
6. **Event Streaming**: Real-time updates on agent selection, loading, and execution

**Next Steps**:
1. Implement `UnifiedAgentLoader` and `AgentPoolManager` services
2. Update Mode 1 workflow to use agent loader
3. Add agent selection nodes to Mode 2 workflow
4. Implement sub-agent spawning for all modes
5. Add comprehensive tests for agent loading and coordination
6. Deploy and monitor agent selection analytics

---

**Document Status**: Design Complete
**Implementation Target**: Sprint Q1 2026
**Owner**: LangGraph Orchestration Team
