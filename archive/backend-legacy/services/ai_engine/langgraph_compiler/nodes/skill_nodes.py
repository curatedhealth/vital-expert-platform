"""
Skill Node Compilers

Compiles skill nodes from Postgres into executable LangGraph functions.

Skills are executable units that can be:
- Tools: External API calls or system commands
- Capabilities: Internal agent capabilities
- Lang Components: Pre-built LangGraph components

Each skill can have parameters and return results that are stored in state.
"""

from typing import Dict, Any, Callable, Optional
from uuid import UUID
import json

from ..compiler import AgentState
from ...graphrag.clients import get_postgres_client
from ...graphrag.utils.logger import get_logger

logger = get_logger(__name__)


class SkillNodeCompiler:
    """Compiles skill nodes into executable functions"""
    
    def __init__(self):
        self.pg_client = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize dependencies"""
        if self._initialized:
            return
        self.pg_client = await get_postgres_client()
        self._initialized = True
        
    async def compile(self, node: Dict[str, Any]) -> Callable:
        """
        Compile skill node.
        
        Loads skill definition and parameters, then creates
        an executable function.
        """
        if not self._initialized:
            await self.initialize()
            
        # Load skill
        skill = await self._load_skill(node['skill_id'])
        
        if not skill:
            raise ValueError(f"Skill {node['skill_id']} not found")
            
        logger.info(
            f"Compiling skill node: {node['name']} "
            f"(skill={skill['name']}, type={skill['skill_type']})"
        )
        
        # Compile based on skill type
        if skill['skill_type'] == 'tool':
            return self._create_tool_skill_node(skill, node)
        elif skill['skill_type'] == 'capability':
            return self._create_capability_skill_node(skill, node)
        elif skill['skill_type'] == 'lang_component':
            return self._create_lang_component_skill_node(skill, node)
        else:
            return self._create_generic_skill_node(skill, node)
            
    async def _load_skill(self, skill_id: UUID) -> Optional[Dict[str, Any]]:
        """Load skill from database"""
        query = """
            SELECT 
                id, name, description, skill_type,
                implementation_ref, parameters_schema,
                is_executable, created_at, updated_at
            FROM skills
            WHERE id = $1 AND deleted_at IS NULL
        """
        
        async with self.pg_client.acquire() as conn:
            row = await conn.fetchrow(query, skill_id)
            return dict(row) if row else None
            
    def _create_tool_skill_node(
        self,
        skill: Dict[str, Any],
        node: Dict[str, Any]
    ) -> Callable:
        """
        Create tool skill node that executes external tools.
        
        TODO: Implement tool registry and execution in Phase 2.4
        """
        async def tool_skill_node(state: AgentState) -> AgentState:
            logger.info(f"Executing tool skill: {skill['name']}")
            
            # Placeholder: Would call actual tool
            result = {
                "skill": skill['name'],
                "status": "executed",
                "output": f"Tool {skill['name']} executed (placeholder)"
            }
            
            # Store result in state
            if 'tool_results' not in state:
                state['tool_results'] = {}
            state['tool_results'][skill['name']] = result
            
            state['current_node'] = node['name']
            
            logger.info(f"Tool skill {skill['name']} completed")
            return state
            
        return tool_skill_node
        
    def _create_capability_skill_node(
        self,
        skill: Dict[str, Any],
        node: Dict[str, Any]
    ) -> Callable:
        """
        Create capability skill node for internal capabilities.
        """
        async def capability_skill_node(state: AgentState) -> AgentState:
            logger.info(f"Executing capability skill: {skill['name']}")
            
            # Placeholder: Would execute capability
            result = {
                "skill": skill['name'],
                "status": "executed",
                "output": f"Capability {skill['name']} executed (placeholder)"
            }
            
            if 'tool_results' not in state:
                state['tool_results'] = {}
            state['tool_results'][skill['name']] = result
            
            state['current_node'] = node['name']
            
            logger.info(f"Capability skill {skill['name']} completed")
            return state
            
        return capability_skill_node
        
    def _create_lang_component_skill_node(
        self,
        skill: Dict[str, Any],
        node: Dict[str, Any]
    ) -> Callable:
        """
        Create LangGraph component skill node.
        
        These are pre-built LangGraph components like ReAct agents,
        tool executors, etc.
        """
        async def lang_component_skill_node(state: AgentState) -> AgentState:
            logger.info(f"Executing lang component skill: {skill['name']}")
            
            # Placeholder: Would instantiate LangGraph component
            result = {
                "skill": skill['name'],
                "status": "executed",
                "output": f"Lang component {skill['name']} executed (placeholder)"
            }
            
            if 'tool_results' not in state:
                state['tool_results'] = {}
            state['tool_results'][skill['name']] = result
            
            state['current_node'] = node['name']
            
            logger.info(f"Lang component skill {skill['name']} completed")
            return state
            
        return lang_component_skill_node
        
    def _create_generic_skill_node(
        self,
        skill: Dict[str, Any],
        node: Dict[str, Any]
    ) -> Callable:
        """Generic skill node for unknown types"""
        async def generic_skill_node(state: AgentState) -> AgentState:
            logger.info(f"Executing generic skill: {skill['name']}")
            
            result = {
                "skill": skill['name'],
                "status": "executed",
                "output": f"Generic skill {skill['name']} executed"
            }
            
            if 'tool_results' not in state:
                state['tool_results'] = {}
            state['tool_results'][skill['name']] = result
            
            state['current_node'] = node['name']
            
            logger.info(f"Generic skill {skill['name']} completed")
            return state
            
        return generic_skill_node


# Singleton
_skill_compiler: Optional['SkillNodeCompiler'] = None


async def get_skill_node_compiler() -> SkillNodeCompiler:
    """Get or create skill node compiler singleton"""
    global _skill_compiler
    if _skill_compiler is None:
        _skill_compiler = SkillNodeCompiler()
        await _skill_compiler.initialize()
    return _skill_compiler

