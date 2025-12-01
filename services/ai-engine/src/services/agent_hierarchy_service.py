"""
Agent Hierarchy Service - 5-Level Deep Agent Architecture

Implements the PRD v1.2.1 compliant 5-level agent hierarchy:

Level 1: MASTER AGENTS (Orchestrators)
    - System-level coordinators that manage workflows
    - Route queries to appropriate Expert agents
    - Handle cross-domain coordination
    - Examples: AskExpertMaster, WorkflowOrchestrator

Level 2: EXPERT AGENTS (Domain Experts)
    - Selected from Agent Store (1000+ agents)
    - Domain-specific knowledge and capabilities
    - Can escalate to Master or delegate to Specialists
    - Examples: RegulatoryExpert, ClinicalResearcher

Level 3: SPECIALIST AGENTS (Sub-Experts)
    - Domain-specific sub-experts spawned on-demand
    - Handle specialized sub-tasks
    - Report results back to Expert agents
    - Examples: FDA510kSpecialist, EMAMDRSpecialist

Level 4: WORKER AGENTS (Parallel Executors)
    - Execute independent tasks in parallel
    - Aggregate results for parent agent
    - Short-lived, task-specific
    - Examples: DataRetrieverWorker, AnalysisWorker

Level 5: TOOL AGENTS (Tool Wrappers)
    - Specialized wrappers around tools/APIs
    - Execute specific tool operations
    - Return structured tool outputs
    - Examples: PubMedToolAgent, ClinicalTrialsToolAgent

Key Features:
- Hierarchical agent relationships
- Escalation patterns (lower → higher level)
- Delegation patterns (higher → lower level)
- Agent Store integration
- Resource limits and lifecycle management
"""

from typing import List, Dict, Optional, Any, Union, Callable
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum, IntEnum
import structlog
import asyncio
import uuid
import json

logger = structlog.get_logger()


# ============================================================================
# Enums and Constants
# ============================================================================

class AgentLevel(IntEnum):
    """5-level agent hierarchy"""
    MASTER = 1       # L1: Orchestrators
    EXPERT = 2       # L2: Domain experts from Agent Store
    SPECIALIST = 3   # L3: Sub-experts spawned on-demand
    WORKER = 4       # L4: Parallel task executors
    TOOL = 5         # L5: Tool wrappers


class AgentCapability(str, Enum):
    """Agent capabilities for routing"""
    ORCHESTRATION = "orchestration"
    DOMAIN_EXPERTISE = "domain_expertise"
    SPECIALIZED_ANALYSIS = "specialized_analysis"
    PARALLEL_EXECUTION = "parallel_execution"
    TOOL_EXECUTION = "tool_execution"


class EscalationReason(str, Enum):
    """Reasons for escalation to higher level"""
    COMPLEXITY_EXCEEDED = "complexity_exceeded"
    CONFIDENCE_TOO_LOW = "confidence_too_low"
    CROSS_DOMAIN_REQUIRED = "cross_domain_required"
    HUMAN_REVIEW_NEEDED = "human_review_needed"
    RESOURCE_LIMIT_REACHED = "resource_limit_reached"
    ERROR_RECOVERY = "error_recovery"


class DelegationReason(str, Enum):
    """Reasons for delegation to lower level"""
    SPECIALIZED_TASK = "specialized_task"
    PARALLEL_PROCESSING = "parallel_processing"
    TOOL_REQUIRED = "tool_required"
    WORKLOAD_DISTRIBUTION = "workload_distribution"
    SUBTASK_DECOMPOSITION = "subtask_decomposition"


# ============================================================================
# Data Models
# ============================================================================

class AgentDefinition(BaseModel):
    """Definition of an agent at any level"""
    agent_id: str
    name: str
    level: AgentLevel
    capabilities: List[AgentCapability] = Field(default_factory=list)
    knowledge_domains: List[str] = Field(default_factory=list)
    system_prompt: str = ""
    tools: List[str] = Field(default_factory=list)
    model: str = "gpt-4"
    temperature: float = 0.7
    max_tokens: int = 4000

    # Hierarchy relationships
    parent_agent_id: Optional[str] = None
    child_agent_ids: List[str] = Field(default_factory=list)

    # Constraints
    max_delegation_depth: int = 3
    min_confidence_threshold: float = 0.6

    # Metadata
    tier: int = 2  # Legacy tier field for backward compatibility
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EscalationRequest(BaseModel):
    """Request to escalate to higher-level agent"""
    from_agent_id: str
    from_level: AgentLevel
    reason: EscalationReason
    context: Dict[str, Any]
    original_task: str
    partial_result: Optional[Dict[str, Any]] = None
    confidence: float = 0.0
    error_message: Optional[str] = None


class DelegationRequest(BaseModel):
    """Request to delegate to lower-level agent"""
    from_agent_id: str
    from_level: AgentLevel
    reason: DelegationReason
    target_level: AgentLevel
    task: str
    context: Dict[str, Any]
    required_capabilities: List[AgentCapability] = Field(default_factory=list)
    required_domains: List[str] = Field(default_factory=list)
    tools_needed: List[str] = Field(default_factory=list)


class AgentResult(BaseModel):
    """Result from agent execution"""
    agent_id: str
    agent_level: AgentLevel
    task: str
    result: Dict[str, Any]
    confidence: float
    execution_time_ms: int
    cost: float = 0.0
    tokens_used: int = 0
    success: bool
    error: Optional[str] = None

    # Hierarchy metadata
    delegated_to: List[str] = Field(default_factory=list)
    escalated_from: Optional[str] = None
    delegation_depth: int = 0


# ============================================================================
# Agent Hierarchy Service
# ============================================================================

class AgentHierarchyService:
    """
    Service for managing 5-level agent hierarchy with escalation and delegation.

    PRD v1.2.1 Compliant:
    - Master (L1) → Expert (L2) → Specialist (L3) → Worker (L4) → Tool (L5)
    - Escalation: Lower levels can escalate to higher levels
    - Delegation: Higher levels can delegate to lower levels
    """

    def __init__(
        self,
        agent_store_service=None,
        sub_agent_spawner=None,
        max_concurrent_agents: int = 50,
        max_delegation_depth: int = 4
    ):
        """
        Initialize agent hierarchy service.

        Args:
            agent_store_service: Service to query Agent Store (1000+ agents)
            sub_agent_spawner: Service to spawn sub-agents (L3-L5)
            max_concurrent_agents: Maximum concurrent agents across all levels
            max_delegation_depth: Maximum depth of delegation chain
        """
        self.agent_store = agent_store_service
        self.sub_agent_spawner = sub_agent_spawner
        self.max_concurrent_agents = max_concurrent_agents
        self.max_delegation_depth = max_delegation_depth

        # Active agents by level
        self.active_agents: Dict[str, AgentDefinition] = {}
        self._hierarchy_tree: Dict[str, List[str]] = {}  # parent_id -> child_ids

        # Escalation/delegation callbacks
        self._escalation_handlers: Dict[AgentLevel, Callable] = {}
        self._delegation_handlers: Dict[AgentLevel, Callable] = {}

        # Statistics
        self._stats = {
            "total_escalations": 0,
            "total_delegations": 0,
            "escalations_by_reason": {},
            "delegations_by_reason": {},
            "agents_by_level": {level.name: 0 for level in AgentLevel}
        }

        logger.info(
            "AgentHierarchyService initialized",
            max_concurrent=max_concurrent_agents,
            max_depth=max_delegation_depth
        )

    # ========================================================================
    # Master Agent Operations (Level 1)
    # ========================================================================

    async def create_master_agent(
        self,
        name: str,
        knowledge_domains: List[str],
        system_prompt: str,
        agent_id: Optional[str] = None
    ) -> AgentDefinition:
        """
        Create a Level 1 Master Agent (Orchestrator).

        Master agents are top-level coordinators that:
        - Route queries to appropriate Expert agents
        - Handle cross-domain coordination
        - Manage workflow orchestration

        Args:
            name: Agent name
            knowledge_domains: Domains this master can coordinate
            system_prompt: System instructions
            agent_id: Optional custom ID

        Returns:
            Created master agent definition
        """
        agent_id = agent_id or f"master_{uuid.uuid4().hex[:8]}"

        master = AgentDefinition(
            agent_id=agent_id,
            name=name,
            level=AgentLevel.MASTER,
            capabilities=[
                AgentCapability.ORCHESTRATION,
                AgentCapability.DOMAIN_EXPERTISE
            ],
            knowledge_domains=knowledge_domains,
            system_prompt=system_prompt,
            tier=1,  # Legacy tier
            max_delegation_depth=self.max_delegation_depth
        )

        self.active_agents[agent_id] = master
        self._hierarchy_tree[agent_id] = []
        self._stats["agents_by_level"]["MASTER"] += 1

        logger.info(
            "Created Master Agent (L1)",
            agent_id=agent_id,
            name=name,
            domains=knowledge_domains
        )

        return master

    # ========================================================================
    # Expert Agent Operations (Level 2)
    # ========================================================================

    async def get_expert_agent(
        self,
        agent_id: str,
        tenant_id: str,
        parent_master_id: Optional[str] = None
    ) -> Optional[AgentDefinition]:
        """
        Get an Expert Agent (Level 2) from the Agent Store.

        Expert agents are domain experts selected from the 1000+ agent store.

        Args:
            agent_id: Agent ID from store
            tenant_id: Tenant identifier
            parent_master_id: Optional parent Master agent

        Returns:
            Expert agent definition or None
        """
        if not self.agent_store:
            logger.warning("Agent store not configured, creating mock expert")
            return self._create_mock_expert(agent_id, parent_master_id)

        # Query agent store
        agent_data = await self.agent_store.get_agent(
            agent_id=agent_id,
            tenant_id=tenant_id
        )

        if not agent_data:
            return None

        expert = AgentDefinition(
            agent_id=agent_id,
            name=agent_data.get("display_name", "Expert"),
            level=AgentLevel.EXPERT,
            capabilities=[AgentCapability.DOMAIN_EXPERTISE],
            knowledge_domains=agent_data.get("knowledge_domains", []),
            system_prompt=agent_data.get("system_prompt", ""),
            tools=agent_data.get("tools", []),
            model=agent_data.get("model", "gpt-4"),
            temperature=agent_data.get("temperature", 0.7),
            max_tokens=agent_data.get("max_tokens", 4000),
            parent_agent_id=parent_master_id,
            tier=agent_data.get("tier", 2)
        )

        self.active_agents[agent_id] = expert
        self._stats["agents_by_level"]["EXPERT"] += 1

        # Link to parent if specified
        if parent_master_id and parent_master_id in self._hierarchy_tree:
            self._hierarchy_tree[parent_master_id].append(agent_id)
            self._hierarchy_tree[agent_id] = []

        logger.info(
            "Retrieved Expert Agent (L2)",
            agent_id=agent_id,
            name=expert.name,
            parent=parent_master_id
        )

        return expert

    async def select_best_expert(
        self,
        query: str,
        tenant_id: str,
        domains: Optional[List[str]] = None,
        parent_master_id: Optional[str] = None,
        top_k: int = 1
    ) -> List[AgentDefinition]:
        """
        Select best Expert Agent(s) for a query from the Agent Store.

        Args:
            query: User query
            tenant_id: Tenant identifier
            domains: Optional domain filters
            parent_master_id: Optional parent Master agent
            top_k: Number of experts to select

        Returns:
            List of best-matching expert agents
        """
        if not self.agent_store:
            logger.warning("Agent store not configured")
            return []

        # Query agent store for best matches
        candidates = await self.agent_store.find_agents_for_query(
            query=query,
            tenant_id=tenant_id,
            domains=domains,
            limit=top_k
        )

        experts = []
        for candidate in candidates:
            expert = await self.get_expert_agent(
                agent_id=candidate["id"],
                tenant_id=tenant_id,
                parent_master_id=parent_master_id
            )
            if expert:
                experts.append(expert)

        logger.info(
            "Selected Expert Agents (L2)",
            count=len(experts),
            query_preview=query[:100]
        )

        return experts

    # ========================================================================
    # Specialist Agent Operations (Level 3)
    # ========================================================================

    async def spawn_specialist(
        self,
        parent_expert_id: str,
        task: str,
        specialty: str,
        context: Dict[str, Any],
        model: str = "gpt-4",
        temperature: float = 0.7
    ) -> AgentDefinition:
        """
        Spawn a Level 3 Specialist Agent.

        Specialists are domain-specific sub-experts spawned on-demand
        to handle specialized sub-tasks.

        Args:
            parent_expert_id: Parent Expert agent ID
            task: Specific task for specialist
            specialty: Domain specialty
            context: Execution context
            model: LLM model
            temperature: Model temperature

        Returns:
            Spawned specialist agent
        """
        agent_id = f"specialist_{specialty.replace(' ', '_')}_{uuid.uuid4().hex[:8]}"

        specialist = AgentDefinition(
            agent_id=agent_id,
            name=f"Specialist: {specialty}",
            level=AgentLevel.SPECIALIST,
            capabilities=[AgentCapability.SPECIALIZED_ANALYSIS],
            knowledge_domains=[specialty],
            system_prompt=self._build_specialist_prompt(specialty, context),
            model=model,
            temperature=temperature,
            parent_agent_id=parent_expert_id,
            tier=3
        )

        self.active_agents[agent_id] = specialist
        self._stats["agents_by_level"]["SPECIALIST"] += 1

        # Link to parent
        if parent_expert_id not in self._hierarchy_tree:
            self._hierarchy_tree[parent_expert_id] = []
        self._hierarchy_tree[parent_expert_id].append(agent_id)
        self._hierarchy_tree[agent_id] = []

        # Also spawn via sub_agent_spawner if available
        if self.sub_agent_spawner:
            await self.sub_agent_spawner.spawn_specialist(
                parent_agent_id=parent_expert_id,
                task=task,
                specialty=specialty,
                context=context,
                model=model,
                temperature=temperature
            )

        logger.info(
            "Spawned Specialist Agent (L3)",
            agent_id=agent_id,
            specialty=specialty,
            parent=parent_expert_id
        )

        return specialist

    # ========================================================================
    # Worker Agent Operations (Level 4)
    # ========================================================================

    async def spawn_workers(
        self,
        parent_agent_id: str,
        tasks: List[str],
        context: Dict[str, Any]
    ) -> List[AgentDefinition]:
        """
        Spawn Level 4 Worker Agents for parallel execution.

        Args:
            parent_agent_id: Parent agent ID (L2 or L3)
            tasks: List of tasks to execute in parallel
            context: Shared execution context

        Returns:
            List of spawned worker agents
        """
        workers = []

        for i, task in enumerate(tasks):
            agent_id = f"worker_{i}_{uuid.uuid4().hex[:8]}"

            worker = AgentDefinition(
                agent_id=agent_id,
                name=f"Worker {i+1}",
                level=AgentLevel.WORKER,
                capabilities=[AgentCapability.PARALLEL_EXECUTION],
                system_prompt=self._build_worker_prompt(task, context),
                parent_agent_id=parent_agent_id,
                tier=4
            )

            self.active_agents[agent_id] = worker
            workers.append(worker)
            self._stats["agents_by_level"]["WORKER"] += 1

            # Link to parent
            if parent_agent_id not in self._hierarchy_tree:
                self._hierarchy_tree[parent_agent_id] = []
            self._hierarchy_tree[parent_agent_id].append(agent_id)

        # Also spawn via sub_agent_spawner if available
        if self.sub_agent_spawner:
            await self.sub_agent_spawner.spawn_workers(
                parent_agent_id=parent_agent_id,
                tasks=tasks,
                context=context
            )

        logger.info(
            "Spawned Worker Agents (L4)",
            count=len(workers),
            parent=parent_agent_id
        )

        return workers

    # ========================================================================
    # Tool Agent Operations (Level 5)
    # ========================================================================

    async def spawn_tool_agent(
        self,
        parent_agent_id: str,
        task: str,
        tools: List[str],
        context: Dict[str, Any]
    ) -> AgentDefinition:
        """
        Spawn a Level 5 Tool Agent.

        Args:
            parent_agent_id: Parent agent ID
            task: Task requiring tools
            tools: List of tool names
            context: Execution context

        Returns:
            Spawned tool agent
        """
        agent_id = f"tool_{uuid.uuid4().hex[:8]}"

        tool_agent = AgentDefinition(
            agent_id=agent_id,
            name=f"ToolAgent: {', '.join(tools[:3])}",
            level=AgentLevel.TOOL,
            capabilities=[AgentCapability.TOOL_EXECUTION],
            tools=tools,
            system_prompt=self._build_tool_agent_prompt(tools, context),
            parent_agent_id=parent_agent_id,
            tier=5
        )

        self.active_agents[agent_id] = tool_agent
        self._stats["agents_by_level"]["TOOL"] += 1

        # Link to parent
        if parent_agent_id not in self._hierarchy_tree:
            self._hierarchy_tree[parent_agent_id] = []
        self._hierarchy_tree[parent_agent_id].append(agent_id)

        # Also spawn via sub_agent_spawner if available
        if self.sub_agent_spawner:
            await self.sub_agent_spawner.spawn_tool_agent(
                parent_agent_id=parent_agent_id,
                task=task,
                tools=tools,
                context=context
            )

        logger.info(
            "Spawned Tool Agent (L5)",
            agent_id=agent_id,
            tools=tools,
            parent=parent_agent_id
        )

        return tool_agent

    # ========================================================================
    # Escalation (Lower → Higher Level)
    # ========================================================================

    async def escalate(
        self,
        request: EscalationRequest
    ) -> Optional[AgentDefinition]:
        """
        Escalate task to higher-level agent.

        Escalation reasons:
        - Complexity exceeded agent's capability
        - Confidence too low for reliable answer
        - Cross-domain expertise required
        - Human review needed
        - Resource limits reached
        - Error recovery required

        Args:
            request: Escalation request details

        Returns:
            Higher-level agent to handle task, or None if at top
        """
        from_agent = self.active_agents.get(request.from_agent_id)
        if not from_agent:
            logger.error("Escalation failed: source agent not found", agent_id=request.from_agent_id)
            return None

        # Can't escalate above Master level
        if request.from_level == AgentLevel.MASTER:
            logger.warning(
                "Cannot escalate above Master level - routing to human",
                agent_id=request.from_agent_id,
                reason=request.reason
            )
            # Return None to indicate human intervention needed
            return None

        # Find parent agent
        parent_id = from_agent.parent_agent_id
        if not parent_id or parent_id not in self.active_agents:
            logger.warning(
                "No parent agent for escalation",
                agent_id=request.from_agent_id,
                level=request.from_level
            )
            return None

        parent_agent = self.active_agents[parent_id]

        # Track statistics
        self._stats["total_escalations"] += 1
        reason_key = request.reason.value
        self._stats["escalations_by_reason"][reason_key] = \
            self._stats["escalations_by_reason"].get(reason_key, 0) + 1

        logger.info(
            "Escalating to higher level",
            from_agent=request.from_agent_id,
            from_level=request.from_level.name,
            to_agent=parent_id,
            to_level=parent_agent.level.name,
            reason=request.reason.value
        )

        # Call escalation handler if registered
        handler = self._escalation_handlers.get(parent_agent.level)
        if handler:
            await handler(request, parent_agent)

        return parent_agent

    def register_escalation_handler(
        self,
        level: AgentLevel,
        handler: Callable
    ):
        """Register callback for escalation to specific level."""
        self._escalation_handlers[level] = handler
        logger.info(f"Registered escalation handler for {level.name}")

    # ========================================================================
    # Delegation (Higher → Lower Level)
    # ========================================================================

    async def delegate(
        self,
        request: DelegationRequest
    ) -> List[AgentDefinition]:
        """
        Delegate task to lower-level agent(s).

        Delegation reasons:
        - Task requires specialized expertise
        - Parallel processing beneficial
        - Specific tools required
        - Workload distribution
        - Subtask decomposition

        Args:
            request: Delegation request details

        Returns:
            List of delegated agents
        """
        from_agent = self.active_agents.get(request.from_agent_id)
        if not from_agent:
            logger.error("Delegation failed: source agent not found", agent_id=request.from_agent_id)
            return []

        # Check delegation depth
        current_depth = self._get_delegation_depth(request.from_agent_id)
        if current_depth >= self.max_delegation_depth:
            logger.warning(
                "Max delegation depth reached",
                agent_id=request.from_agent_id,
                depth=current_depth,
                max_depth=self.max_delegation_depth
            )
            return []

        # Can't delegate below Tool level
        if request.target_level.value > AgentLevel.TOOL.value:
            logger.error("Cannot delegate below Tool level")
            return []

        # Track statistics
        self._stats["total_delegations"] += 1
        reason_key = request.reason.value
        self._stats["delegations_by_reason"][reason_key] = \
            self._stats["delegations_by_reason"].get(reason_key, 0) + 1

        # Spawn appropriate agents based on target level
        delegated_agents = []

        if request.target_level == AgentLevel.SPECIALIST:
            specialist = await self.spawn_specialist(
                parent_expert_id=request.from_agent_id,
                task=request.task,
                specialty=request.required_domains[0] if request.required_domains else "general",
                context=request.context
            )
            delegated_agents.append(specialist)

        elif request.target_level == AgentLevel.WORKER:
            # Split task into parallel subtasks
            subtasks = self._decompose_task(request.task, request.context)
            workers = await self.spawn_workers(
                parent_agent_id=request.from_agent_id,
                tasks=subtasks,
                context=request.context
            )
            delegated_agents.extend(workers)

        elif request.target_level == AgentLevel.TOOL:
            tool_agent = await self.spawn_tool_agent(
                parent_agent_id=request.from_agent_id,
                task=request.task,
                tools=request.tools_needed,
                context=request.context
            )
            delegated_agents.append(tool_agent)

        logger.info(
            "Delegated to lower level",
            from_agent=request.from_agent_id,
            from_level=request.from_level.name,
            target_level=request.target_level.name,
            delegated_count=len(delegated_agents),
            reason=request.reason.value
        )

        # Call delegation handler if registered
        handler = self._delegation_handlers.get(request.target_level)
        if handler:
            await handler(request, delegated_agents)

        return delegated_agents

    def register_delegation_handler(
        self,
        level: AgentLevel,
        handler: Callable
    ):
        """Register callback for delegation to specific level."""
        self._delegation_handlers[level] = handler
        logger.info(f"Registered delegation handler for {level.name}")

    # ========================================================================
    # Lifecycle Management
    # ========================================================================

    async def terminate_agent(self, agent_id: str):
        """Terminate an agent and its children."""
        if agent_id not in self.active_agents:
            return

        agent = self.active_agents[agent_id]

        # Recursively terminate children
        children = self._hierarchy_tree.get(agent_id, [])
        for child_id in children:
            await self.terminate_agent(child_id)

        # Remove from hierarchy
        del self.active_agents[agent_id]
        if agent_id in self._hierarchy_tree:
            del self._hierarchy_tree[agent_id]

        # Update stats
        self._stats["agents_by_level"][agent.level.name] -= 1

        # Also terminate via sub_agent_spawner if available
        if self.sub_agent_spawner and agent.level.value >= 3:
            await self.sub_agent_spawner.terminate_sub_agent(agent_id)

        logger.info(
            "Agent terminated",
            agent_id=agent_id,
            level=agent.level.name
        )

    async def terminate_all(self):
        """Terminate all agents."""
        agent_ids = list(self.active_agents.keys())
        for agent_id in agent_ids:
            await self.terminate_agent(agent_id)

        if self.sub_agent_spawner:
            await self.sub_agent_spawner.terminate_all()

        logger.info("All agents terminated")

    # ========================================================================
    # Helper Methods
    # ========================================================================

    def _get_delegation_depth(self, agent_id: str) -> int:
        """Calculate delegation depth from root."""
        depth = 0
        current_id = agent_id

        while current_id in self.active_agents:
            agent = self.active_agents[current_id]
            if not agent.parent_agent_id:
                break
            current_id = agent.parent_agent_id
            depth += 1

            # Safety check to prevent infinite loops
            if depth > 10:
                break

        return depth

    def _decompose_task(self, task: str, context: Dict) -> List[str]:
        """Decompose task into parallel subtasks."""
        # Simple decomposition - in production use LLM
        # For now, create 3 parallel workers
        return [
            f"Analyze aspect 1 of: {task}",
            f"Analyze aspect 2 of: {task}",
            f"Synthesize findings for: {task}"
        ]

    def _build_specialist_prompt(self, specialty: str, context: Dict) -> str:
        """Build system prompt for specialist agent."""
        return f"""You are a Level 3 Specialist Agent with deep expertise in: {specialty}

Your parent Expert agent has delegated a specialized task to you.

Context:
{json.dumps(context, indent=2)}

Instructions:
1. Apply your specialized knowledge to the task
2. Provide detailed, evidence-based analysis
3. Include relevant citations and references
4. Identify limitations and assumptions
5. Suggest follow-up actions if needed

Focus exclusively on your specialty area and provide expert-level insights."""

    def _build_worker_prompt(self, task: str, context: Dict) -> str:
        """Build system prompt for worker agent."""
        return f"""You are a Level 4 Worker Agent executing a parallel task.

Your Task: {task}

Context:
{json.dumps(context, indent=2)}

Instructions:
1. Complete this specific task efficiently
2. Return structured results
3. Focus only on your assigned task
4. Report any errors or issues
5. Include confidence assessment

Execute the task and return structured results."""

    def _build_tool_agent_prompt(self, tools: List[str], context: Dict) -> str:
        """Build system prompt for tool agent."""
        return f"""You are a Level 5 Tool Agent specialized in using specific tools.

Available Tools: {', '.join(tools)}

Context:
{json.dumps(context, indent=2)}

Instructions:
1. Use the appropriate tools from your toolkit
2. Combine tool outputs intelligently
3. Handle tool errors gracefully
4. Return structured results with metadata
5. Include confidence scores

Use the tools effectively to complete your task."""

    def _create_mock_expert(
        self,
        agent_id: str,
        parent_master_id: Optional[str]
    ) -> AgentDefinition:
        """Create mock expert when agent store unavailable."""
        return AgentDefinition(
            agent_id=agent_id,
            name=f"Expert {agent_id}",
            level=AgentLevel.EXPERT,
            capabilities=[AgentCapability.DOMAIN_EXPERTISE],
            knowledge_domains=["general"],
            system_prompt="You are an expert agent.",
            parent_agent_id=parent_master_id,
            tier=2
        )

    # ========================================================================
    # Status & Monitoring
    # ========================================================================

    def get_hierarchy_tree(self) -> Dict[str, Any]:
        """Get visual representation of current hierarchy."""
        def build_tree(agent_id: str) -> Dict:
            agent = self.active_agents.get(agent_id)
            if not agent:
                return {}

            return {
                "id": agent_id,
                "name": agent.name,
                "level": agent.level.name,
                "children": [
                    build_tree(child_id)
                    for child_id in self._hierarchy_tree.get(agent_id, [])
                ]
            }

        # Find root agents (no parent)
        roots = [
            aid for aid, agent in self.active_agents.items()
            if not agent.parent_agent_id
        ]

        return {
            "roots": [build_tree(root_id) for root_id in roots],
            "total_agents": len(self.active_agents)
        }

    def get_statistics(self) -> Dict[str, Any]:
        """Get hierarchy statistics."""
        return {
            "active_agents": len(self.active_agents),
            "by_level": self._stats["agents_by_level"].copy(),
            "escalations": {
                "total": self._stats["total_escalations"],
                "by_reason": self._stats["escalations_by_reason"].copy()
            },
            "delegations": {
                "total": self._stats["total_delegations"],
                "by_reason": self._stats["delegations_by_reason"].copy()
            },
            "max_concurrent": self.max_concurrent_agents,
            "max_delegation_depth": self.max_delegation_depth
        }


# ============================================================================
# Singleton Instance
# ============================================================================

_hierarchy_service: Optional[AgentHierarchyService] = None


def get_agent_hierarchy_service() -> AgentHierarchyService:
    """Get agent hierarchy service instance."""
    global _hierarchy_service
    if _hierarchy_service is None:
        _hierarchy_service = AgentHierarchyService()
    return _hierarchy_service


def initialize_agent_hierarchy_service(
    agent_store_service=None,
    sub_agent_spawner=None
) -> AgentHierarchyService:
    """Initialize agent hierarchy service with dependencies."""
    global _hierarchy_service
    _hierarchy_service = AgentHierarchyService(
        agent_store_service=agent_store_service,
        sub_agent_spawner=sub_agent_spawner
    )
    return _hierarchy_service
