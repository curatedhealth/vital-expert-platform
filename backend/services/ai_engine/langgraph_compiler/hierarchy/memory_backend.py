"""
Memory Backend Configuration for VITAL Deep Agents

Creates composite memory backends with:
- Ephemeral working files (StateBackend)
- Persistent memories (StoreBackend via PostgresStore)
- Tenant-isolated organization knowledge (StoreBackend with tenant prefix)

Based on deepagents backends: StateBackend, StoreBackend, CompositeBackend
"""

from typing import Optional, Dict, Any, Callable
from uuid import UUID

from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
from langgraph.store.postgres import PostgresStore


def create_vital_backend(
    agent_id: UUID,
    tenant_id: UUID,
    enable_filesystem: bool = True,
    enable_memory: bool = True,
    postgres_store: Optional[PostgresStore] = None
) -> Callable:
    """
    Create VITAL-optimized memory backend for deep agents
    
    Architecture:
    ```
    /working/          → StateBackend (ephemeral)
        analysis/      - Temporary analysis files
        temp/          - Temporary working files
        
    /memories/         → StoreBackend (persistent, agent-scoped)
        user/          - User preferences and history
        learnings/     - Agent's learned insights
        
    /organization/     → StoreBackend (persistent, tenant-scoped)
        compliance/    - Tenant compliance requirements
        policies/      - Organizational policies
        procedures/    - Standard operating procedures
    ```
    
    Args:
        agent_id: Agent UUID for memory namespace
        tenant_id: Tenant UUID for organization knowledge isolation
        enable_filesystem: Enable file system tools
        enable_memory: Enable persistent memory
        postgres_store: Optional PostgresStore instance
        
    Returns:
        Backend factory function for deep agent
        
    Usage:
        backend_factory = create_vital_backend(
            agent_id=agent_id,
            tenant_id=tenant_id,
            enable_filesystem=True,
            enable_memory=True,
            postgres_store=store
        )
        
        agent = create_deep_agent(
            backend=backend_factory,
            store=postgres_store,
            ...
        )
    """
    
    if not enable_filesystem and not enable_memory:
        # No special backend needed
        return None
    
    if enable_memory and not enable_filesystem:
        # All persistent
        def backend_factory(runtime):
            return StoreBackend(runtime)
        return backend_factory
    
    if enable_filesystem and not enable_memory:
        # All ephemeral
        def backend_factory(runtime):
            return StateBackend(runtime)
        return backend_factory
    
    # Hybrid: ephemeral working + persistent memories
    def backend_factory(runtime):
        return CompositeBackend(
            default=StateBackend(runtime),  # Ephemeral by default
            routes={
                # Persistent memories (agent-scoped)
                "/memories/": StoreBackend(runtime),
                
                # Persistent organization knowledge (tenant-scoped)
                # Note: Tenant isolation enforced via namespace in Store
                "/organization/": StoreBackend(runtime),
                
                # Persistent historical data
                "/history/": StoreBackend(runtime)
            }
        )
    
    return backend_factory


def create_tenant_isolated_store(
    postgres_connection_string: str,
    tenant_id: UUID,
    agent_id: UUID
) -> PostgresStore:
    """
    Create tenant-isolated PostgresStore for long-term memory
    
    Namespace strategy:
    - Format: "tenant_{tenant_id}/agent_{agent_id}"
    - Ensures complete tenant isolation
    - Allows agent-specific and shared memories
    
    Args:
        postgres_connection_string: Postgres connection string
        tenant_id: Tenant UUID for isolation
        agent_id: Agent UUID for scoping
        
    Returns:
        Configured PostgresStore instance
        
    Usage:
        store = create_tenant_isolated_store(
            postgres_connection_string=config.database.postgres_connection_string,
            tenant_id=tenant_id,
            agent_id=agent_id
        )
        
        agent = create_deep_agent(
            store=store,
            ...
        )
    """
    
    # Tenant-isolated namespace
    namespace = f"tenant_{tenant_id}/agent_{agent_id}"
    
    return PostgresStore(
        connection_string=postgres_connection_string,
        namespace=namespace
    )


def create_shared_knowledge_store(
    postgres_connection_string: str,
    tenant_id: UUID
) -> PostgresStore:
    """
    Create shared knowledge store for tenant-wide information
    
    Use case: Organization-wide knowledge that should be accessible to all agents
    
    Args:
        postgres_connection_string: Postgres connection string
        tenant_id: Tenant UUID for isolation
        
    Returns:
        Configured PostgresStore for shared knowledge
        
    Usage:
        # Store organizational knowledge
        shared_store = create_shared_knowledge_store(
            postgres_connection_string=config.database.postgres_connection_string,
            tenant_id=tenant_id
        )
        
        await shared_store.put(
            namespace=f"tenant_{tenant_id}",
            key="/organization/compliance/gdpr_requirements.md",
            value=gdpr_requirements_text
        )
        
        # Agents can access shared knowledge
        agent = create_deep_agent(
            store=shared_store,
            system_prompt="Check /organization/compliance/ for requirements...",
            ...
        )
    """
    
    namespace = f"tenant_{tenant_id}/shared"
    
    return PostgresStore(
        connection_string=postgres_connection_string,
        namespace=namespace
    )


class MemoryPathHelper:
    """
    Helper class for managing memory paths in VITAL deep agents
    
    Provides standard paths and utilities for organizing agent memory
    """
    
    # Standard path prefixes
    WORKING = "/working"
    MEMORIES = "/memories"
    ORGANIZATION = "/organization"
    HISTORY = "/history"
    
    @classmethod
    def user_preferences(cls, user_id: Optional[UUID] = None) -> str:
        """Path to user preferences file"""
        if user_id:
            return f"{cls.MEMORIES}/user/{user_id}/preferences.md"
        return f"{cls.MEMORIES}/user/preferences.md"
    
    @classmethod
    def agent_learnings(cls, topic: str) -> str:
        """Path to agent's learned insights on a topic"""
        topic_safe = topic.lower().replace(' ', '_')
        return f"{cls.MEMORIES}/learnings/{topic_safe}.md"
    
    @classmethod
    def org_compliance(cls, regulation: str) -> str:
        """Path to organizational compliance requirements"""
        regulation_safe = regulation.lower().replace(' ', '_')
        return f"{cls.ORGANIZATION}/compliance/{regulation_safe}.md"
    
    @classmethod
    def org_policy(cls, policy_name: str) -> str:
        """Path to organizational policy"""
        policy_safe = policy_name.lower().replace(' ', '_')
        return f"{cls.ORGANIZATION}/policies/{policy_safe}.md"
    
    @classmethod
    def working_analysis(cls, filename: str) -> str:
        """Path to temporary analysis file"""
        return f"{cls.WORKING}/analysis/{filename}"
    
    @classmethod
    def historical_interaction(cls, session_id: UUID) -> str:
        """Path to historical interaction data"""
        return f"{cls.HISTORY}/sessions/{session_id}.json"
    
    @classmethod
    def build_system_prompt_guidance(cls) -> str:
        """
        Build system prompt guidance for memory usage
        
        Returns:
            Markdown text to append to agent system prompts
        """
        return f"""
## Memory & File Organization

You have access to a structured file system for managing context and memory:

### Working Files (Ephemeral)
- `{cls.WORKING}/analysis/` - Temporary analysis and intermediate results
- `{cls.WORKING}/temp/` - Temporary working files
- These files are cleared between sessions

### Personal Memory (Persistent)
- `{cls.MEMORIES}/user/` - User preferences and history
- `{cls.MEMORIES}/learnings/` - Your learned insights and discoveries
- These files persist across all conversations

### Organizational Knowledge (Persistent, Tenant-Scoped)
- `{cls.ORGANIZATION}/compliance/` - Compliance requirements (GDPR, HIPAA, etc.)
- `{cls.ORGANIZATION}/policies/` - Company policies and procedures
- `{cls.ORGANIZATION}/` - Shared organizational knowledge
- These files are shared across all agents in the organization

### Historical Data (Persistent)
- `{cls.HISTORY}/sessions/` - Past conversation histories
- Use for learning from previous interactions

**Best Practices:**
1. Check user preferences before starting: `read_file {cls.MEMORIES}/user/preferences.md`
2. Save large tool results to working files to keep context manageable
3. Save important discoveries to memories for future reference
4. Always check organizational compliance requirements for regulated tasks
"""


# Example usage in agent system prompts
MEMORY_GUIDANCE_TEMPLATE = MemoryPathHelper.build_system_prompt_guidance()

