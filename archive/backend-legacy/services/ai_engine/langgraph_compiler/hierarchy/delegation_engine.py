"""
Delegation Engine - Determines when to use Deep Agents vs Standard Agents

Evaluates agent hierarchy and execution context to decide:
1. Should this agent use deep agent capabilities?
2. What subagents should be available?
3. What middleware should be enabled?

Evidence-based decision making using agent metadata and hierarchy configuration.
"""

from typing import Dict, List, Optional, Any
from uuid import UUID
from dataclasses import dataclass
from enum import Enum


class ExecutionMode(str, Enum):
    """Execution modes for VITAL services"""
    CHAT_INTERACTIVE = "chat_interactive"
    CHAT_AUTONOMOUS = "chat_autonomous"
    PANEL_MEMBER = "panel_member"
    WORKFLOW_TASK = "workflow_task"
    SOLUTION_BUILDER = "solution_builder"


@dataclass
class DelegationDecision:
    """Result of delegation evaluation"""
    use_deep_agent: bool
    enable_subagents: bool
    enable_filesystem: bool
    enable_todos: bool
    enable_memory: bool
    subagent_configs: List[Dict[str, Any]]
    delegation_criteria: Dict[str, Any]
    reasoning: str


class DelegationEngine:
    """
    Evaluates whether an agent should use deep agent capabilities
    
    Decision factors:
    1. Agent has sub-agents defined in agent_hierarchies
    2. Execution mode requires autonomous behavior
    3. Task complexity threshold met
    4. Agent metadata enables deep agent features
    """
    
    def __init__(self, postgres_client):
        self.postgres = postgres_client
    
    async def evaluate_delegation(
        self,
        agent_id: UUID,
        execution_mode: ExecutionMode,
        state: Dict[str, Any],
        parent_context: Optional[Dict[str, Any]] = None
    ) -> DelegationDecision:
        """
        Evaluate if agent should use deep agent capabilities
        
        Args:
            agent_id: The agent to evaluate
            execution_mode: How the agent is being invoked
            state: Current execution state
            parent_context: Optional parent workflow/panel context
            
        Returns:
            DelegationDecision with configuration
        """
        
        # Load agent configuration
        agent = await self._load_agent_config(agent_id)
        
        # Load agent hierarchy
        hierarchy = await self._load_agent_hierarchy(agent_id)
        
        # Check if agent explicitly enables deep agent features
        deep_agents_enabled = agent.get('deep_agents_enabled', False)
        
        # Check if agent has sub-agents
        has_subagents = len(hierarchy) > 0
        
        # Evaluate execution mode requirements
        requires_autonomous = execution_mode in [
            ExecutionMode.CHAT_AUTONOMOUS,
            ExecutionMode.WORKFLOW_TASK,
            ExecutionMode.SOLUTION_BUILDER
        ]
        
        # Evaluate task complexity (from state)
        task_complexity = self._estimate_task_complexity(state)
        
        # Decision logic
        use_deep_agent = (
            deep_agents_enabled or 
            has_subagents or 
            (requires_autonomous and task_complexity > 0.6)
        )
        
        if not use_deep_agent:
            return DelegationDecision(
                use_deep_agent=False,
                enable_subagents=False,
                enable_filesystem=False,
                enable_todos=False,
                enable_memory=False,
                subagent_configs=[],
                delegation_criteria={},
                reasoning="Standard agent execution - no deep agent features needed"
            )
        
        # Deep agent configuration
        enable_subagents = has_subagents and agent.get('subagent_spawning_enabled', True)
        enable_filesystem = agent.get('filesystem_backend_type') is not None
        enable_todos = requires_autonomous or task_complexity > 0.7
        enable_memory = agent.get('memory_enabled', False)
        
        # Load subagent configurations
        subagent_configs = await self._load_subagent_configs(hierarchy) if enable_subagents else []
        
        # Extract delegation criteria
        delegation_criteria = self._extract_delegation_criteria(hierarchy)
        
        reasoning = self._build_reasoning(
            deep_agents_enabled=deep_agents_enabled,
            has_subagents=has_subagents,
            requires_autonomous=requires_autonomous,
            task_complexity=task_complexity,
            enable_subagents=enable_subagents,
            enable_filesystem=enable_filesystem,
            enable_todos=enable_todos,
            enable_memory=enable_memory
        )
        
        return DelegationDecision(
            use_deep_agent=True,
            enable_subagents=enable_subagents,
            enable_filesystem=enable_filesystem,
            enable_todos=enable_todos,
            enable_memory=enable_memory,
            subagent_configs=subagent_configs,
            delegation_criteria=delegation_criteria,
            reasoning=reasoning
        )
    
    async def _load_agent_config(self, agent_id: UUID) -> Dict[str, Any]:
        """Load agent configuration from database"""
        result = await self.postgres.fetch_one("""
            SELECT 
                id,
                name,
                system_prompt,
                deep_agents_enabled,
                filesystem_backend_type,
                memory_enabled,
                subagent_spawning_enabled,
                middleware_config
            FROM agents
            WHERE id = $1
        """, agent_id)
        
        return dict(result) if result else {}
    
    async def _load_agent_hierarchy(self, agent_id: UUID) -> List[Dict[str, Any]]:
        """Load agent's sub-agent hierarchy"""
        results = await self.postgres.fetch_all("""
            SELECT 
                ah.id,
                ah.parent_agent_id,
                ah.child_agent_id,
                ah.delegation_criteria,
                ah.execution_order,
                ah.aggregation_strategy,
                ah.max_recursion_depth,
                a.name as child_agent_name,
                a.system_prompt as child_agent_prompt,
                a.description as child_agent_description
            FROM agent_hierarchies ah
            JOIN agents a ON ah.child_agent_id = a.id
            WHERE ah.parent_agent_id = $1
              AND ah.is_active = true
              AND ah.deleted_at IS NULL
            ORDER BY ah.execution_order
        """, agent_id)
        
        return [dict(r) for r in results] if results else []
    
    def _estimate_task_complexity(self, state: Dict[str, Any]) -> float:
        """
        Estimate task complexity from state
        
        Factors:
        - Query length
        - Number of context documents
        - Presence of multi-step indicators
        - Technical domain complexity
        
        Returns:
            Complexity score 0.0-1.0
        """
        complexity = 0.0
        
        # Query length factor
        query = state.get('query', '') or state.get('question', '')
        if len(query) > 500:
            complexity += 0.3
        elif len(query) > 200:
            complexity += 0.2
        elif len(query) > 100:
            complexity += 0.1
        
        # Multi-step indicators
        multi_step_keywords = [
            'plan', 'strategy', 'step-by-step', 'workflow',
            'analyze and then', 'first then', 'multiple',
            'comprehensive', 'detailed', 'thorough'
        ]
        if any(kw in query.lower() for kw in multi_step_keywords):
            complexity += 0.3
        
        # Technical domain indicators
        technical_keywords = [
            'statistical', 'algorithm', 'analysis', 'calculation',
            'regulatory', 'clinical trial', 'fda', 'protocol'
        ]
        if any(kw in query.lower() for kw in technical_keywords):
            complexity += 0.2
        
        # Context size
        context_docs = state.get('retrieved_documents', [])
        if len(context_docs) > 10:
            complexity += 0.2
        
        return min(complexity, 1.0)
    
    async def _load_subagent_configs(
        self,
        hierarchy: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Convert agent_hierarchies rows to deep agent subagent configs
        
        Returns:
            List of subagent configurations for deepagents library
        """
        subagent_configs = []
        
        for h in hierarchy:
            config = {
                "name": h['child_agent_name'],
                "description": h['child_agent_description'],
                "system_prompt": h['child_agent_prompt'],
                "agent_id": str(h['child_agent_id']),
                "delegation_criteria": h['delegation_criteria'],
                "execution_order": h['execution_order'],
                "aggregation_strategy": h['aggregation_strategy'],
                "max_recursion_depth": h.get('max_recursion_depth', 3)
            }
            subagent_configs.append(config)
        
        return subagent_configs
    
    def _extract_delegation_criteria(
        self,
        hierarchy: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Extract and merge delegation criteria from all sub-agents
        
        Returns:
            Merged delegation criteria for use in subagent middleware
        """
        if not hierarchy:
            return {}
        
        # Merge all delegation criteria
        merged_criteria = {
            "triggers": [],
            "keywords": [],
            "complexity_thresholds": [],
            "execution_modes": []
        }
        
        for h in hierarchy:
            criteria = h.get('delegation_criteria', {})
            
            if 'triggers' in criteria:
                merged_criteria['triggers'].extend(criteria['triggers'])
            
            if 'keywords' in criteria:
                merged_criteria['keywords'].extend(criteria['keywords'])
            
            if 'complexity_threshold' in criteria:
                merged_criteria['complexity_thresholds'].append(
                    criteria['complexity_threshold']
                )
            
            if 'execution_mode' in criteria:
                merged_criteria['execution_modes'].extend(criteria['execution_mode'])
        
        # Deduplicate
        merged_criteria['triggers'] = list(set(merged_criteria['triggers']))
        merged_criteria['keywords'] = list(set(merged_criteria['keywords']))
        merged_criteria['execution_modes'] = list(set(merged_criteria['execution_modes']))
        
        return merged_criteria
    
    def _build_reasoning(
        self,
        deep_agents_enabled: bool,
        has_subagents: bool,
        requires_autonomous: bool,
        task_complexity: float,
        enable_subagents: bool,
        enable_filesystem: bool,
        enable_todos: bool,
        enable_memory: bool
    ) -> str:
        """Build human-readable reasoning for delegation decision"""
        reasons = []
        
        if deep_agents_enabled:
            reasons.append("Agent explicitly enables deep agent features")
        
        if has_subagents:
            reasons.append("Agent has sub-agents defined in hierarchy")
        
        if requires_autonomous:
            reasons.append("Execution mode requires autonomous behavior")
        
        if task_complexity > 0.6:
            reasons.append(f"Task complexity ({task_complexity:.2f}) exceeds threshold")
        
        features = []
        if enable_subagents:
            features.append("subagent spawning")
        if enable_filesystem:
            features.append("file system")
        if enable_todos:
            features.append("planning/todos")
        if enable_memory:
            features.append("long-term memory")
        
        reasoning = "; ".join(reasons)
        if features:
            reasoning += f". Enabled features: {', '.join(features)}"
        
        return reasoning


async def should_use_deep_agent(
    agent_id: UUID,
    execution_mode: ExecutionMode,
    state: Dict[str, Any],
    postgres_client,
    parent_context: Optional[Dict[str, Any]] = None
) -> DelegationDecision:
    """
    Convenience function to evaluate delegation
    
    Usage:
        decision = await should_use_deep_agent(
            agent_id=agent_id,
            execution_mode=ExecutionMode.CHAT_AUTONOMOUS,
            state=state,
            postgres_client=postgres_client
        )
        
        if decision.use_deep_agent:
            # Use deep agent with subagents
            agent = create_vital_deep_agent(agent_id, decision, ...)
        else:
            # Use standard agent
            agent = create_standard_agent(agent_id, ...)
    """
    engine = DelegationEngine(postgres_client)
    return await engine.evaluate_delegation(
        agent_id=agent_id,
        execution_mode=execution_mode,
        state=state,
        parent_context=parent_context
    )

