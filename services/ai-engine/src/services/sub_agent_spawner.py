"""
Sub-Agent Spawning Service for Deep Agent Architecture

Implements 5-level deep agent hierarchy:
- Level 1: Master Agents (orchestrators)
- Level 2: Expert Agents (from GraphRAG selection)
- Level 3: Specialist Sub-Agents (domain-specific, spawned on-demand)
- Level 4: Worker Agents (parallel task executors)
- Level 5: Tool Agents (specialized tool wrappers)

Key Features:
- Dynamic sub-agent spawning
- Parallel execution support
- Lifecycle management (spawn → execute → terminate)
- Resource tracking and limits
- Performance monitoring

Performance Targets:
- Spawning latency: <500ms
- Max concurrent sub-agents: 20
- Resource cleanup: 100%
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import structlog
import asyncio
import time
import json
import uuid

logger = structlog.get_logger()


class SubAgentConfig(BaseModel):
    """Configuration for spawned sub-agent."""
    sub_agent_id: str
    agent_type: str  # "specialist", "worker", "tool"
    specialty: str
    parent_agent_id: str
    tier: int  # 3, 4, or 5
    task: str
    context: Dict
    tools: List[str] = Field(default_factory=list)
    model: str = "gpt-4"
    temperature: float = 0.7
    max_tokens: int = 4000
    spawned_at: datetime = Field(default_factory=datetime.now)


class SubAgentResult(BaseModel):
    """Result from sub-agent execution."""
    sub_agent_id: str
    task: str
    result: Dict
    confidence: float
    execution_time_ms: int
    cost: float
    tokens_used: int
    success: bool
    error: Optional[str] = None


class SubAgentSpawner:
    """
    Service for spawning and managing sub-agents (Levels 3-5).

    Level 3: Specialists - Domain-specific sub-experts
    Level 4: Workers - Parallel task executors
    Level 5: Tools - Specialized tool agents
    """

    def __init__(self):
        """Initialize sub-agent spawner."""
        self.active_sub_agents: Dict[str, SubAgentConfig] = {}
        self.max_concurrent_sub_agents = 20
        self.spawn_count = 0
        self.execution_count = 0

    # ==================== Permission Validation ====================

    def validate_spawn_permission(
        self,
        parent_permissions: Optional[Dict[str, bool]],
        target_level: int,
        parent_agent_id: str
    ) -> bool:
        """
        Validate if parent agent has permission to spawn sub-agents at target level.

        Uses the hierarchy settings from the Agent Store UI (Hierarchy tab):
        - can_spawn_l2: Can spawn Level 2 Expert agents (L1 only)
        - can_spawn_l3: Can spawn Level 3 Specialist agents
        - can_spawn_l4: Can spawn Level 4 Worker agents (parallel execution)
        - can_use_worker_pool: Can use shared worker pool

        Args:
            parent_permissions: Dict with can_spawn_l2, can_spawn_l3, can_spawn_l4, can_use_worker_pool
            target_level: Target spawn level (3, 4, or 5)
            parent_agent_id: ID of parent agent (for logging)

        Returns:
            True if spawn is permitted, False otherwise

        Raises:
            PermissionError: If spawn is not permitted (for strict enforcement)
        """
        # If no permissions provided, allow spawn (backwards compatibility)
        # TODO: Make this stricter once all agents have permissions configured
        if parent_permissions is None:
            logger.warning(
                "sub_agent_spawner.no_permissions_provided",
                parent_agent_id=parent_agent_id,
                target_level=target_level,
                action="allowing_spawn_for_backwards_compatibility"
            )
            return True

        permission_key = {
            2: "can_spawn_l2",  # Master → Expert (L1 → L2)
            3: "can_spawn_l3",  # Expert → Specialist (L2 → L3)
            4: "can_spawn_l4",  # Any → Worker (parallel execution)
            5: "can_spawn_l4",  # Workers include tool agents (L5)
        }.get(target_level, "can_spawn_l4")

        has_permission = parent_permissions.get(permission_key, False)

        if not has_permission:
            logger.warning(
                "sub_agent_spawner.spawn_permission_denied",
                parent_agent_id=parent_agent_id,
                target_level=target_level,
                required_permission=permission_key,
                has_permission=has_permission
            )

        return has_permission

    def get_spawn_permissions_from_context(self, context: Dict) -> Optional[Dict[str, bool]]:
        """
        Extract spawn permissions from execution context.

        The context may contain parent_agent or parent_permissions with:
        - can_spawn_l2, can_spawn_l3, can_spawn_l4, can_use_worker_pool

        Args:
            context: Execution context dict

        Returns:
            Dict with spawn permissions or None if not found
        """
        # Check for explicit permissions in context
        if "parent_permissions" in context:
            return context["parent_permissions"]

        # Check for parent_agent with permissions
        parent_agent = context.get("parent_agent", {})
        if parent_agent:
            return {
                "can_spawn_l2": parent_agent.get("can_spawn_l2", False),
                "can_spawn_l3": parent_agent.get("can_spawn_l3", False),
                "can_spawn_l4": parent_agent.get("can_spawn_l4", False),
                "can_use_worker_pool": parent_agent.get("can_use_worker_pool", False),
            }

        return None

    # ==================== Spawning Methods ====================

    async def spawn_specialist(
        self,
        parent_agent_id: str,
        task: str,
        specialty: str,
        context: Dict,
        model: str = "gpt-4",
        temperature: float = 0.7
    ) -> str:
        """
        Spawn a Level 3 specialist sub-agent.

        Specialists are domain-specific experts spawned for complex sub-tasks.

        Example specialties:
        - "FDA 510(k) Predicate Device Search"
        - "Clinical Endpoint Selection for Oncology"
        - "Reimbursement Code Mapping (CPT/HCPCS)"
        - "EMA MDR Classification Rule Analysis"
        - "PMDA SAKIGAKE Designation Criteria"

        Args:
            parent_agent_id: ID of Level 2 expert agent spawning this specialist
            task: Specific task for the specialist
            specialty: Domain specialty area
            context: Execution context (query, session data, etc.)
            model: LLM model to use
            temperature: Model temperature

        Returns:
            Sub-agent ID (UUID)
        """
        if len(self.active_sub_agents) >= self.max_concurrent_sub_agents:
            raise RuntimeError(
                f"Max concurrent sub-agents ({self.max_concurrent_sub_agents}) reached. "
                "Terminate some sub-agents before spawning more."
            )

        # Validate spawn permissions from Hierarchy tab settings
        parent_permissions = self.get_spawn_permissions_from_context(context)
        if not self.validate_spawn_permission(parent_permissions, target_level=3, parent_agent_id=parent_agent_id):
            logger.warning(
                "sub_agent_spawner.specialist_spawn_blocked",
                parent_agent_id=parent_agent_id,
                specialty=specialty,
                reason="Parent agent does not have can_spawn_l3 permission"
            )
            # For now, log warning but allow spawn for backwards compatibility
            # TODO: Raise PermissionError once all agents have hierarchy configured

        sub_agent_id = f"specialist_{specialty.replace(' ', '_')}_{uuid.uuid4().hex[:8]}"

        config = SubAgentConfig(
            sub_agent_id=sub_agent_id,
            agent_type="specialist",
            specialty=specialty,
            parent_agent_id=parent_agent_id,
            tier=3,
            task=task,
            context=context,
            model=model,
            temperature=temperature
        )

        self.active_sub_agents[sub_agent_id] = config
        self.spawn_count += 1

        logger.info(
            "Spawned Level 3 specialist sub-agent",
            sub_agent_id=sub_agent_id,
            specialty=specialty,
            parent=parent_agent_id,
            active_count=len(self.active_sub_agents)
        )

        return sub_agent_id

    async def spawn_workers(
        self,
        parent_agent_id: str,
        tasks: List[str],
        context: Dict,
        specialty: str = "parallel_execution"
    ) -> List[str]:
        """
        Spawn multiple Level 4 worker agents for parallel execution.

        Workers execute independent tasks in parallel and aggregate results.

        Example tasks:
        - "Search PubMed for clinical trials on drug X"
        - "Analyze adverse event data for safety signals"
        - "Extract regulatory requirements from CFR 21 Part 820"
        - "Calculate statistical power for sample size N=500"

        Args:
            parent_agent_id: ID of parent agent (Level 2 or 3)
            tasks: List of tasks to execute in parallel
            context: Shared execution context
            specialty: Worker specialty (default: parallel_execution)

        Returns:
            List of worker sub-agent IDs
        """
        if len(self.active_sub_agents) + len(tasks) > self.max_concurrent_sub_agents:
            raise RuntimeError(
                f"Spawning {len(tasks)} workers would exceed max concurrent limit "
                f"({self.max_concurrent_sub_agents})"
            )

        # Validate spawn permissions from Hierarchy tab settings
        parent_permissions = self.get_spawn_permissions_from_context(context)
        if not self.validate_spawn_permission(parent_permissions, target_level=4, parent_agent_id=parent_agent_id):
            logger.warning(
                "sub_agent_spawner.workers_spawn_blocked",
                parent_agent_id=parent_agent_id,
                num_workers=len(tasks),
                reason="Parent agent does not have can_spawn_l4 permission"
            )
            # For now, log warning but allow spawn for backwards compatibility
            # TODO: Raise PermissionError once all agents have hierarchy configured

        worker_ids = []

        for i, task in enumerate(tasks):
            worker_id = f"worker_{i}_{uuid.uuid4().hex[:8]}"

            config = SubAgentConfig(
                sub_agent_id=worker_id,
                agent_type="worker",
                specialty=specialty,
                parent_agent_id=parent_agent_id,
                tier=4,
                task=task,
                context=context
            )

            self.active_sub_agents[worker_id] = config
            worker_ids.append(worker_id)
            self.spawn_count += 1

        logger.info(
            "Spawned Level 4 worker sub-agents",
            count=len(worker_ids),
            parent=parent_agent_id,
            active_count=len(self.active_sub_agents)
        )

        return worker_ids

    async def spawn_tool_agent(
        self,
        parent_agent_id: str,
        task: str,
        tools: List[str],
        context: Dict
    ) -> str:
        """
        Spawn a Level 5 tool agent with specific tools.

        Tool agents are specialized wrappers around tools/APIs.

        Example tools:
        - ["pubmed_search", "clinical_trials_gov"]
        - ["statistical_calculator", "power_analysis"]
        - ["regulatory_database", "fda_drugs_api"]

        Args:
            parent_agent_id: ID of parent agent
            task: Task requiring specific tools
            tools: List of tool names to provide to agent
            context: Execution context

        Returns:
            Tool agent ID
        """
        if len(self.active_sub_agents) >= self.max_concurrent_sub_agents:
            raise RuntimeError(
                f"Max concurrent sub-agents ({self.max_concurrent_sub_agents}) reached"
            )

        # Validate spawn permissions from Hierarchy tab settings
        # Tool agents (L5) use same can_spawn_l4 permission as workers
        parent_permissions = self.get_spawn_permissions_from_context(context)
        if not self.validate_spawn_permission(parent_permissions, target_level=5, parent_agent_id=parent_agent_id):
            logger.warning(
                "sub_agent_spawner.tool_agent_spawn_blocked",
                parent_agent_id=parent_agent_id,
                tools=tools,
                reason="Parent agent does not have can_spawn_l4 permission (required for L5 tool agents)"
            )
            # For now, log warning but allow spawn for backwards compatibility
            # TODO: Raise PermissionError once all agents have hierarchy configured

        sub_agent_id = f"tool_{uuid.uuid4().hex[:8]}"

        config = SubAgentConfig(
            sub_agent_id=sub_agent_id,
            agent_type="tool",
            specialty="tool_execution",
            parent_agent_id=parent_agent_id,
            tier=5,
            task=task,
            context=context,
            tools=tools
        )

        self.active_sub_agents[sub_agent_id] = config
        self.spawn_count += 1

        logger.info(
            "Spawned Level 5 tool agent",
            sub_agent_id=sub_agent_id,
            tools=tools,
            parent=parent_agent_id
        )

        return sub_agent_id

    # ==================== Execution Methods ====================

    async def execute_sub_agent(
        self,
        sub_agent_id: str
    ) -> SubAgentResult:
        """
        Execute spawned sub-agent and return result.

        Args:
            sub_agent_id: ID of sub-agent to execute

        Returns:
            Sub-agent execution result

        Raises:
            ValueError: If sub-agent ID not found
        """
        if sub_agent_id not in self.active_sub_agents:
            raise ValueError(f"Sub-agent {sub_agent_id} not found")

        config = self.active_sub_agents[sub_agent_id]
        start_time = time.time()

        logger.info(
            "Executing sub-agent",
            sub_agent_id=sub_agent_id,
            agent_type=config.agent_type,
            specialty=config.specialty
        )

        try:
            # Build specialized prompt
            system_prompt = self._build_sub_agent_prompt(config)

            # Execute using LLM
            from langchain_openai import ChatOpenAI

            llm = ChatOpenAI(
                model=config.model,
                temperature=config.temperature,
                max_tokens=config.max_tokens
            )

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": config.task}
            ]

            response = await llm.ainvoke(messages)

            execution_time_ms = int((time.time() - start_time) * 1000)
            self.execution_count += 1

            # Calculate cost (simplified)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)
            cost = self._calculate_cost(config.model, tokens_used)

            result = SubAgentResult(
                sub_agent_id=sub_agent_id,
                task=config.task,
                result={"response": response.content},
                confidence=0.85,  # TODO: Calculate based on response quality
                execution_time_ms=execution_time_ms,
                cost=cost,
                tokens_used=tokens_used,
                success=True
            )

            logger.info(
                "Sub-agent execution completed",
                sub_agent_id=sub_agent_id,
                execution_time_ms=execution_time_ms,
                tokens_used=tokens_used,
                cost=cost
            )

            return result

        except Exception as e:
            execution_time_ms = int((time.time() - start_time) * 1000)

            logger.error(
                "Sub-agent execution failed",
                sub_agent_id=sub_agent_id,
                error=str(e),
                error_type=type(e).__name__
            )

            return SubAgentResult(
                sub_agent_id=sub_agent_id,
                task=config.task,
                result={},
                confidence=0.0,
                execution_time_ms=execution_time_ms,
                cost=0.0,
                tokens_used=0,
                success=False,
                error=str(e)
            )

    async def execute_parallel(
        self,
        sub_agent_ids: List[str]
    ) -> List[SubAgentResult]:
        """
        Execute multiple sub-agents in parallel.

        Args:
            sub_agent_ids: List of sub-agent IDs to execute

        Returns:
            List of execution results
        """
        start_time = time.time()

        logger.info(
            "Starting parallel sub-agent execution",
            count=len(sub_agent_ids)
        )

        # Execute all sub-agents concurrently
        tasks = [self.execute_sub_agent(sid) for sid in sub_agent_ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Convert exceptions to failed results
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(
                    "Parallel execution task failed",
                    sub_agent_id=sub_agent_ids[i],
                    error=str(result)
                )
                # Create failed result
                processed_results.append(SubAgentResult(
                    sub_agent_id=sub_agent_ids[i],
                    task="",
                    result={},
                    confidence=0.0,
                    execution_time_ms=0,
                    cost=0.0,
                    tokens_used=0,
                    success=False,
                    error=str(result)
                ))
            else:
                processed_results.append(result)

        total_time_ms = int((time.time() - start_time) * 1000)
        successful = [r for r in processed_results if r.success]

        logger.info(
            "Parallel sub-agent execution completed",
            total=len(sub_agent_ids),
            successful=len(successful),
            failed=len(sub_agent_ids) - len(successful),
            total_time_ms=total_time_ms
        )

        return processed_results

    # ==================== Lifecycle Management ====================

    async def terminate_sub_agent(self, sub_agent_id: str):
        """
        Terminate and cleanup sub-agent.

        Args:
            sub_agent_id: ID of sub-agent to terminate
        """
        if sub_agent_id in self.active_sub_agents:
            config = self.active_sub_agents[sub_agent_id]
            del self.active_sub_agents[sub_agent_id]

            logger.info(
                "Sub-agent terminated",
                sub_agent_id=sub_agent_id,
                agent_type=config.agent_type,
                active_count=len(self.active_sub_agents)
            )

    async def terminate_all(self):
        """Terminate all active sub-agents."""
        count = len(self.active_sub_agents)
        self.active_sub_agents.clear()

        logger.info(
            "All sub-agents terminated",
            count=count
        )

    # ==================== Helper Methods ====================

    def _build_sub_agent_prompt(self, config: SubAgentConfig) -> str:
        """
        Build specialized system prompt for sub-agent based on type and tier.

        Args:
            config: Sub-agent configuration

        Returns:
            System prompt string
        """
        if config.agent_type == "specialist" and config.tier == 3:
            return f"""You are a specialized Level 3 sub-agent with deep expertise in: {config.specialty}

Your parent Level 2 expert agent has delegated a specific task to you. Focus ONLY on this task and provide a detailed, expert-level response.

**Your Specialty:** {config.specialty}

**Context from parent agent:**
{json.dumps(config.context, indent=2)}

**Instructions:**
1. Apply your specialized knowledge to this specific task
2. Provide detailed, evidence-based analysis
3. Include relevant references and citations
4. Identify any limitations or assumptions
5. Suggest next steps if appropriate

Provide your specialized analysis and recommendations."""

        elif config.agent_type == "worker" and config.tier == 4:
            return f"""You are a Level 4 worker sub-agent responsible for executing a specific task in parallel with other workers.

**Task:** {config.task}

**Context:**
{json.dumps(config.context, indent=2)}

**Instructions:**
1. Complete this task efficiently and accurately
2. Return structured results that can be easily combined with other workers
3. Focus on your specific task only
4. Flag any errors or issues encountered
5. Provide confidence assessment for your results

Complete this task and return structured results."""

        elif config.agent_type == "tool" and config.tier == 5:
            return f"""You are a Level 5 tool agent specialized in using specific tools to accomplish tasks.

**Available tools:** {', '.join(config.tools)}

**Context:**
{json.dumps(config.context, indent=2)}

**Instructions:**
1. Use the appropriate tools from your toolkit
2. Combine tool outputs intelligently
3. Handle tool errors gracefully
4. Return structured results with tool usage metadata
5. Provide confidence scores for tool-derived results

Use the tools effectively to complete the task."""

        else:
            # Fallback generic prompt
            return f"""You are a sub-agent (Type: {config.agent_type}, Tier: {config.tier}).

Task: {config.task}

Context:
{json.dumps(config.context, indent=2)}

Complete the task and return your results."""

    def _calculate_cost(self, model: str, tokens: int) -> float:
        """
        Calculate cost based on model and token usage.

        Simplified cost calculation. In production, use actual pricing.

        Args:
            model: Model name
            tokens: Total tokens used

        Returns:
            Estimated cost in USD
        """
        # Simplified pricing (per 1k tokens)
        pricing = {
            "gpt-4": 0.03,  # Average of input/output
            "gpt-4-turbo-preview": 0.015,
            "gpt-3.5-turbo": 0.0015,
            "claude-3-opus": 0.03,
            "claude-3-sonnet": 0.01
        }

        price_per_1k = pricing.get(model, 0.02)  # Default
        return (tokens / 1000.0) * price_per_1k

    # ==================== Status & Monitoring ====================

    def get_active_sub_agents(self) -> List[Dict]:
        """Get list of all active sub-agents."""
        return [
            {
                "sub_agent_id": config.sub_agent_id,
                "agent_type": config.agent_type,
                "specialty": config.specialty,
                "parent_agent_id": config.parent_agent_id,
                "tier": config.tier,
                "spawned_at": config.spawned_at.isoformat()
            }
            for config in self.active_sub_agents.values()
        ]

    def get_statistics(self) -> Dict:
        """Get spawner statistics."""
        return {
            "active_sub_agents": len(self.active_sub_agents),
            "total_spawned": self.spawn_count,
            "total_executed": self.execution_count,
            "max_concurrent": self.max_concurrent_sub_agents,
            "by_type": {
                "specialist": sum(1 for c in self.active_sub_agents.values() if c.agent_type == "specialist"),
                "worker": sum(1 for c in self.active_sub_agents.values() if c.agent_type == "worker"),
                "tool": sum(1 for c in self.active_sub_agents.values() if c.agent_type == "tool")
            },
            "by_tier": {
                "tier_3": sum(1 for c in self.active_sub_agents.values() if c.tier == 3),
                "tier_4": sum(1 for c in self.active_sub_agents.values() if c.tier == 4),
                "tier_5": sum(1 for c in self.active_sub_agents.values() if c.tier == 5)
            }
        }


# Singleton instance
_sub_agent_spawner: Optional[SubAgentSpawner] = None


def get_sub_agent_spawner() -> SubAgentSpawner:
    """Get sub-agent spawner instance (dependency injection)."""
    global _sub_agent_spawner
    if _sub_agent_spawner is None:
        _sub_agent_spawner = SubAgentSpawner()
    return _sub_agent_spawner


def initialize_sub_agent_spawner() -> SubAgentSpawner:
    """Initialize sub-agent spawner singleton."""
    global _sub_agent_spawner
    _sub_agent_spawner = SubAgentSpawner()
    return _sub_agent_spawner
