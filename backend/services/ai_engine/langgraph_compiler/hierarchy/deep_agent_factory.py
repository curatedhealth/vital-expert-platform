"""
Deep Agent Factory - Creates Deep Agents from VITAL agent configurations

Wraps LangChain's `create_deep_agent` with VITAL-specific configuration:
- Load agent config from Postgres
- Configure subagents from agent_hierarchies
- Set up memory backend (ephemeral + persistent)
- Configure middleware (todos, filesystem, subagents)
- Integrate with VITAL's RAG and tools

Based on deepagents library: https://pypi.org/project/deepagents/
"""

from typing import Dict, List, Optional, Any, Callable
from uuid import UUID
import asyncio

from deepagents import create_deep_agent
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langgraph.store.postgres import PostgresStore
from langgraph.checkpoint.postgres import PostgresCheckpointer

from .delegation_engine import DelegationDecision
from ..config import get_config


class DeepAgentFactory:
    """
    Factory for creating Deep Agents from VITAL database configurations
    
    Integrates:
    - Agent metadata (agents table)
    - Subagent hierarchy (agent_hierarchies table)
    - Tools (agent_tools, tools tables)
    - Memory (LangGraph Store + Postgres)
    - Checkpointing (agent_state table)
    """
    
    def __init__(self, postgres_client, config=None):
        self.postgres = postgres_client
        self.config = config or get_config()
        self._store = None
        self._checkpointer = None
    
    async def get_store(self) -> PostgresStore:
        """Get or create LangGraph Store for long-term memory"""
        if self._store is None:
            self._store = PostgresStore(
                connection_string=self.config.database.postgres_connection_string,
                namespace="vital_agent_memories"
            )
        return self._store
    
    async def get_checkpointer(self) -> PostgresCheckpointer:
        """Get or create Postgres checkpointer for state persistence"""
        if self._checkpointer is None:
            self._checkpointer = PostgresCheckpointer(
                connection_string=self.config.database.postgres_connection_string
            )
        return self._checkpointer
    
    async def create_deep_agent(
        self,
        agent_id: UUID,
        delegation_decision: DelegationDecision,
        tools: Optional[List] = None,
        additional_config: Optional[Dict[str, Any]] = None
    ):
        """
        Create deep agent from VITAL configuration
        
        Args:
            agent_id: Agent UUID from agents table
            delegation_decision: Result from DelegationEngine
            tools: Optional additional tools (will merge with DB tools)
            additional_config: Optional config overrides
            
        Returns:
            Compiled deep agent ready for execution
        """
        
        # Load agent configuration
        agent_config = await self._load_agent_config(agent_id)
        
        # Create LLM
        llm = await self._create_llm(agent_config)
        
        # Load and merge tools
        agent_tools = await self._load_agent_tools(agent_id)
        all_tools = agent_tools + (tools or [])
        
        # Create subagents if enabled
        subagents = []
        if delegation_decision.enable_subagents:
            subagents = await self._create_subagents(
                delegation_decision.subagent_configs
            )
        
        # Create memory backend
        backend = None
        store = None
        if delegation_decision.enable_filesystem or delegation_decision.enable_memory:
            backend = await self._create_backend(
                agent_config=agent_config,
                enable_filesystem=delegation_decision.enable_filesystem,
                enable_memory=delegation_decision.enable_memory
            )
            
            if delegation_decision.enable_memory:
                store = await self.get_store()
        
        # Get checkpointer
        checkpointer = await self.get_checkpointer()
        
        # Build system prompt with VITAL context
        system_prompt = self._build_system_prompt(
            agent_config=agent_config,
            delegation_decision=delegation_decision
        )
        
        # Create deep agent
        deep_agent = create_deep_agent(
            model=llm,
            tools=all_tools,
            system_prompt=system_prompt,
            subagents=subagents if subagents else None,
            backend=backend,
            store=store,
            checkpointer=checkpointer,
            # Interrupt configuration (human-in-the-loop)
            interrupt_on=agent_config.get('checkpoint_config', {}),
            # Additional middleware config
            **(additional_config or {})
        )
        
        return deep_agent
    
    async def _load_agent_config(self, agent_id: UUID) -> Dict[str, Any]:
        """Load complete agent configuration"""
        result = await self.postgres.fetch_one("""
            SELECT 
                id,
                name,
                display_name,
                description,
                system_prompt,
                model,
                temperature,
                max_tokens,
                context_window,
                deep_agents_enabled,
                filesystem_backend_type,
                memory_enabled,
                subagent_spawning_enabled,
                checkpoint_config,
                middleware_config,
                metadata
            FROM agents
            WHERE id = $1
        """, agent_id)
        
        if not result:
            raise ValueError(f"Agent {agent_id} not found")
        
        return dict(result)
    
    async def _create_llm(self, agent_config: Dict[str, Any]):
        """Create LLM instance based on agent config"""
        model_name = agent_config.get('model', 'gpt-4-turbo-preview')
        temperature = agent_config.get('temperature', 0.7)
        max_tokens = agent_config.get('max_tokens')
        
        if model_name.startswith('gpt-'):
            return ChatOpenAI(
                model=model_name,
                temperature=temperature,
                max_tokens=max_tokens,
                streaming=True
            )
        elif model_name.startswith('claude-'):
            return ChatAnthropic(
                model=model_name,
                temperature=temperature,
                max_tokens=max_tokens,
                streaming=True
            )
        else:
            # Default to GPT-4
            return ChatOpenAI(
                model='gpt-4-turbo-preview',
                temperature=temperature,
                max_tokens=max_tokens,
                streaming=True
            )
    
    async def _load_agent_tools(self, agent_id: UUID) -> List:
        """
        Load agent's tools from database
        
        TODO: Implement full tool loading from agent_tools + tools tables
        For now, return empty list (tools can be passed in create_deep_agent)
        """
        # This will be implemented when tool registry is complete
        # For now, tools are passed directly to create_deep_agent
        return []
    
    async def _create_subagents(
        self,
        subagent_configs: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Create subagent configurations for deep agent
        
        Format expected by deepagents library:
        [
            {
                "name": "subagent-name",
                "description": "What this subagent does",
                "system_prompt": "Subagent's system prompt",
                "tools": [...],  # Optional
                "model": "gpt-4"  # Optional
            }
        ]
        """
        subagents = []
        
        for config in subagent_configs:
            # Load full subagent configuration
            subagent_id = UUID(config['agent_id'])
            subagent = await self._load_agent_config(subagent_id)
            
            # Create subagent config
            subagent_config = {
                "name": config['name'],
                "description": config['description'],
                "system_prompt": config['system_prompt'],
                "model": subagent.get('model', 'gpt-4-turbo-preview')
            }
            
            # Load subagent tools if available
            subagent_tools = await self._load_agent_tools(subagent_id)
            if subagent_tools:
                subagent_config['tools'] = subagent_tools
            
            subagents.append(subagent_config)
        
        return subagents
    
    async def _create_backend(
        self,
        agent_config: Dict[str, Any],
        enable_filesystem: bool,
        enable_memory: bool
    ) -> Callable:
        """
        Create memory backend for deep agent
        
        Options:
        1. StateBackend (ephemeral) - for temporary working files
        2. StoreBackend (persistent) - for long-term memory
        3. CompositeBackend - hybrid (ephemeral + persistent routes)
        
        VITAL uses CompositeBackend:
        - /working/ → StateBackend (ephemeral)
        - /memories/ → StoreBackend (persistent)
        - /organization/ → StoreBackend (tenant-specific)
        """
        backend_type = agent_config.get('filesystem_backend_type', 'composite')
        
        if backend_type == 'composite' and enable_memory:
            # Hybrid backend: ephemeral working files + persistent memories
            def create_backend(runtime):
                return CompositeBackend(
                    default=StateBackend(runtime),  # Ephemeral by default
                    routes={
                        "/memories/": StoreBackend(runtime),  # Persistent memories
                        "/organization/": StoreBackend(runtime),  # Org knowledge
                        "/history/": StoreBackend(runtime)  # Historical data
                    }
                )
            return create_backend
        
        elif backend_type == 'store' and enable_memory:
            # All persistent
            def create_backend(runtime):
                return StoreBackend(runtime)
            return create_backend
        
        else:
            # All ephemeral (default for agents without memory)
            def create_backend(runtime):
                return StateBackend(runtime)
            return create_backend
    
    def _build_system_prompt(
        self,
        agent_config: Dict[str, Any],
        delegation_decision: DelegationDecision
    ) -> str:
        """
        Build enhanced system prompt with deep agent guidance
        
        Adds:
        - File organization instructions (if filesystem enabled)
        - Memory usage instructions (if memory enabled)
        - Subagent delegation guidance (if subagents enabled)
        - Planning instructions (if todos enabled)
        """
        base_prompt = agent_config.get('system_prompt', '')
        
        enhancements = []
        
        # File system guidance
        if delegation_decision.enable_filesystem:
            enhancements.append("""
## File Organization
You have access to a file system for managing context:
- Use `/working/` for temporary analysis files
- Use `/memories/` for information to persist across conversations
- Use `/organization/` for tenant-specific knowledge
- Save large tool results to files to keep context clean
- Use `ls`, `read_file`, `write_file`, `edit_file` tools
""")
        
        # Memory guidance
        if delegation_decision.enable_memory:
            enhancements.append("""
## Long-Term Memory
- Check `/memories/user_preferences.md` for user-specific settings
- Check `/organization/compliance_requirements.md` for org rules
- Save important discoveries to `/memories/` for future reference
- Memory persists across all conversations with this user
""")
        
        # Subagent delegation guidance
        if delegation_decision.enable_subagents:
            subagent_names = [s['name'] for s in delegation_decision.subagent_configs]
            enhancements.append(f"""
## Sub-Agent Delegation
You have specialized sub-agents available:
{chr(10).join(f'- **{name}**: Delegate specialized tasks' for name in subagent_names)}

Use the `task` tool to spawn sub-agents for:
- Context isolation (keep your context clean)
- Specialized analysis (delegate to domain experts)
- Parallel work (multiple sub-agents simultaneously)

Sub-agents will return a clean summary, not full execution traces.
""")
        
        # Planning guidance
        if delegation_decision.enable_todos:
            enhancements.append("""
## Planning & Task Decomposition
For complex multi-step tasks:
1. Use `write_todos` to break down the task into steps
2. Track progress by updating todo statuses
3. Adapt your plan as you learn new information
4. Show users your plan for transparency
""")
        
        # Combine base prompt with enhancements
        if enhancements:
            enhanced_prompt = base_prompt + "\n\n" + "\n\n".join(enhancements)
        else:
            enhanced_prompt = base_prompt
        
        return enhanced_prompt


async def create_vital_deep_agent(
    agent_id: UUID,
    delegation_decision: DelegationDecision,
    postgres_client,
    tools: Optional[List] = None,
    config=None
):
    """
    Convenience function to create VITAL deep agent
    
    Usage:
        # After evaluating delegation
        decision = await should_use_deep_agent(...)
        
        if decision.use_deep_agent:
            agent = await create_vital_deep_agent(
                agent_id=agent_id,
                delegation_decision=decision,
                postgres_client=postgres_client,
                tools=additional_tools
            )
            
            # Execute agent
            result = await agent.ainvoke({
                "messages": [{"role": "user", "content": query}]
            })
    """
    factory = DeepAgentFactory(postgres_client, config)
    return await factory.create_deep_agent(
        agent_id=agent_id,
        delegation_decision=delegation_decision,
        tools=tools
    )

