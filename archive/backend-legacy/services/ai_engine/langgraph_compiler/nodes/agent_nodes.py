"""
Agent Node Compilers

Compiles agent nodes from Postgres definitions into executable LangGraph node functions.

Supports different agent roles:
- Standard: Basic agent execution with LLM call
- Planner: Tree-of-Thoughts for strategic planning
- Executor: ReAct pattern for tool-augmented execution  
- Critic: Constitutional AI for self-critique and validation
- Synthesizer: Multi-source synthesis and summarization

Each node type loads agent configuration from Postgres and creates a node function
that executes the agent with the appropriate pattern.
"""

from typing import Dict, Any, Callable
from uuid import UUID
import openai

from ..compiler import AgentState
from ...graphrag.clients import get_postgres_client
from ...graphrag.config import get_embedding_config
from ...graphrag.utils.logger import get_logger
from ..patterns import (
    TreeOfThoughtsAgent,
    ReActAgent,
    ConstitutionalAgent
)

logger = get_logger(__name__)


class AgentNodeCompiler:
    """Compiles agent nodes from Postgres into executable functions"""
    
    def __init__(self):
        self.pg_client = None
        self.openai_client = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize dependencies"""
        if self._initialized:
            return
            
        self.pg_client = await get_postgres_client()
        
        # Initialize OpenAI client
        embedding_config = get_embedding_config()
        self.openai_client = openai.AsyncOpenAI(
            api_key=embedding_config.openai_api_key
        )
        
        self._initialized = True
        
    async def compile(self, node: Dict[str, Any]) -> Callable:
        """
        Compile agent node based on role.
        
        Roles:
        - planner: Tree-of-Thoughts strategic planning
        - executor: ReAct tool-augmented execution
        - critic: Constitutional AI validation
        - synthesizer: Multi-source synthesis
        - None/standard: Basic LLM execution
        """
        if not self._initialized:
            await self.initialize()
            
        # Load agent details
        agent = await self._load_agent(node['agent_id'])
        
        if not agent:
            raise ValueError(f"Agent {node['agent_id']} not found")
            
        # Load role if specified
        role = None
        if node.get('role_id'):
            role = await self._load_role(node['role_id'])
            
        role_name = role['node_role'] if role else 'standard'
        
        logger.info(
            f"Compiling agent node: {node['name']} "
            f"(agent={agent['name']}, role={role_name})"
        )
        
        # Compile based on role
        if role_name == 'planner':
            return self._create_planner_node(agent, node)
        elif role_name == 'executor':
            return self._create_executor_node(agent, node)
        elif role_name == 'critic':
            return self._create_critic_node(agent, node)
        elif role_name == 'synthesizer':
            return self._create_synthesizer_node(agent, node)
        else:
            return self._create_standard_node(agent, node)
            
    async def _load_agent(self, agent_id: UUID) -> Optional[Dict[str, Any]]:
        """Load agent from v_agent_complete view"""
        query = """
            SELECT 
                id, name, slug, title, description,
                system_prompt, base_model, temperature,
                max_tokens, role_id, function_id, department_id,
                status, created_at, updated_at
            FROM v_agent_complete
            WHERE id = $1
            LIMIT 1
        """
        
        async with self.pg_client.acquire() as conn:
            row = await conn.fetchrow(query, agent_id)
            return dict(row) if row else None
            
    async def _load_role(self, role_id: UUID) -> Optional[Dict[str, Any]]:
        """Load agent node role"""
        query = """
            SELECT id, node_role, description
            FROM agent_node_roles
            WHERE id = $1
        """
        
        async with self.pg_client.acquire() as conn:
            row = await conn.fetchrow(query, role_id)
            return dict(row) if row else None
            
    def _create_standard_node(
        self,
        agent: Dict[str, Any],
        node: Dict[str, Any]
    ) -> Callable:
        """
        Create standard agent node with basic LLM execution.
        
        Flow:
        1. Extract query and context from state
        2. Build messages list (system + context + user query)
        3. Call LLM with agent's model and parameters
        4. Update state with response
        """
        async def standard_agent_node(state: AgentState) -> AgentState:
            logger.info(f"Executing standard agent: {agent['name']}")
            
            try:
                # Build messages
                messages = []
                
                # System prompt
                if agent['system_prompt']:
                    messages.append({
                        "role": "system",
                        "content": agent['system_prompt']
                    })
                    
                # Context (if available)
                if state.get('context'):
                    context_msg = f"Context:\n{state['context']}\n\n"
                    if state.get('evidence_chain'):
                        context_msg += f"Evidence: {len(state['evidence_chain'])} sources\n"
                    messages.append({
                        "role": "system",
                        "content": context_msg
                    })
                    
                # User query
                messages.append({
                    "role": "user",
                    "content": state['query']
                })
                
                # Call OpenAI
                response = await self.openai_client.chat.completions.create(
                    model=agent.get('base_model', 'gpt-4'),
                    messages=messages,
                    temperature=agent.get('temperature', 0.7),
                    max_tokens=agent.get('max_tokens', 1000)
                )
                
                # Extract response
                agent_response = response.choices[0].message.content
                
                # Update state
                state['response'] = agent_response
                state['current_node'] = node['name']
                
                # Add to messages history
                if 'messages' not in state:
                    state['messages'] = []
                state['messages'].append({
                    "role": "assistant",
                    "content": agent_response,
                    "agent": agent['name'],
                    "node": node['name']
                })
                
                logger.info(f"Agent {agent['name']} completed successfully")
                
            except Exception as e:
                logger.error(f"Error in agent node {agent['name']}: {e}")
                state['response'] = f"Error: {str(e)}"
                state['escalation_reason'] = "agent_error"
                
            return state
            
        return standard_agent_node
        
    def _create_planner_node(
        self,
        agent: Dict[str, Any],
        node: Dict[str, Any]
    ) -> Callable:
        """
        Create planner node with Tree-of-Thoughts.
        
        Uses full ToT implementation for multi-path strategic planning.
        """
        async def planner_node(state: AgentState) -> AgentState:
            logger.info(f"Executing Tree-of-Thoughts planner: {agent['name']}")
            
            try:
                # Extract ToT config from node
                config = node.get('config', {})
                max_depth = config.get('max_depth', 3)
                branching_factor = config.get('branching_factor', 3)
                
                # Initialize ToT agent
                tot_agent = TreeOfThoughtsAgent(
                    agent_id=agent['id'],
                    model=agent.get('base_model', 'gpt-4'),
                    system_prompt=agent['system_prompt'],
                    max_depth=max_depth,
                    branching_factor=branching_factor,
                    temperature=agent.get('temperature', 0.7)
                )
                
                # Generate plan using ToT
                result = await tot_agent.plan(
                    query=state['query'],
                    context=state.get('context', ''),
                    constraints=state.get('constraints', [])
                )
                
                # Store plan and thought tree in state
                state['plan'] = result['plan']
                state['thought_tree'] = tot_agent.get_tree()
                state['current_node'] = node['name']
                state['next_node'] = 'execute'  # Move to executor
                
                logger.info(
                    f"ToT Planner {agent['name']} completed: "
                    f"{result['tree_stats']['total_thoughts']} thoughts generated"
                )
                
            except Exception as e:
                logger.error(f"Error in ToT planner {agent['name']}: {e}")
                state['escalation_reason'] = "planning_error"
                state['plan'] = {"error": str(e)}
                
            return state
            
        return planner_node
        
    def _create_executor_node(
        self,
        agent: Dict[str, Any],
        node: Dict[str, Any]
    ) -> Callable:
        """
        Create executor node with ReAct pattern.
        
        Uses full ReAct implementation for tool-augmented execution.
        """
        async def executor_node(state: AgentState) -> AgentState:
            logger.info(f"Executing ReAct executor: {agent['name']}")
            
            try:
                # Extract tools from state or node config
                config = node.get('config', {})
                tools = config.get('tools', {})
                
                # Initialize ReAct agent
                react_agent = ReActAgent(
                    agent_id=agent['id'],
                    model=agent.get('base_model', 'gpt-4'),
                    system_prompt=agent['system_prompt'],
                    tools=tools,
                    max_iterations=config.get('max_iterations', 10),
                    temperature=agent.get('temperature', 0.7)
                )
                
                # Build context from state
                context = state.get('context', '')
                if state.get('plan'):
                    context += f"\n\nPlan: {state['plan'].get('plan_text', '')}"
                    
                # Execute using ReAct
                result = await react_agent.execute(
                    query=state['query'],
                    context=context
                )
                
                # Store results
                state['response'] = result['answer']
                state['tool_results'] = {
                    'react_trace': result['trace'],
                    'react_steps': result['steps']
                }
                state['current_node'] = node['name']
                state['next_node'] = 'critic'  # Move to critic for review
                
                logger.info(
                    f"ReAct Executor {agent['name']} completed: "
                    f"{len(result['steps'])} steps, complete={result['is_complete']}"
                )
                
            except Exception as e:
                logger.error(f"Error in ReAct executor {agent['name']}: {e}")
                state['escalation_reason'] = "execution_error"
                state['response'] = f"Error during execution: {str(e)}"
                
            return state
            
        return executor_node
        
    def _create_critic_node(
        self,
        agent: Dict[str, Any],
        node: Dict[str, Any]
    ) -> Callable:
        """
        Create critic node with Constitutional AI.
        
        Uses full Constitutional AI implementation for safety alignment.
        """
        async def critic_node(state: AgentState) -> AgentState:
            logger.info(f"Executing Constitutional AI critic: {agent['name']}")
            
            try:
                # Load constitution from config or use default
                config = node.get('config', {})
                constitution = config.get('constitution')  # Will use default if None
                
                # Initialize Constitutional AI agent
                constitutional_agent = ConstitutionalAgent(
                    agent_id=agent['id'],
                    model=agent.get('base_model', 'gpt-4'),
                    constitution=constitution,
                    critique_mode=config.get('critique_mode', 'iterative'),
                    max_revisions=config.get('max_revisions', 3),
                    temperature=0.3  # Lower temp for critique
                )
                
                # Critique the response
                review = await constitutional_agent.critique(
                    output=state.get('response', ''),
                    context=state.get('context', ''),
                    criteria=state.get('quality_criteria', [])
                )
                
                # Store critique results
                state['critique'] = {
                    "critic": agent['name'],
                    "passes": review.overall_passes,
                    "max_severity": review.max_severity.value,
                    "summary": review.get_summary(),
                    "failing_principles": [
                        {
                            "title": c.principle_title,
                            "severity": c.severity.value,
                            "issue": c.issue_description
                        }
                        for c in review.get_failing_principles()
                    ],
                    "revision_count": review.revision_count
                }
                
                # Use revised response if available
                if review.revised_response:
                    state['response'] = review.revised_response
                    
                state['current_node'] = node['name']
                
                # Routing based on critique
                if review.overall_passes:
                    state['next_node'] = 'finalize'
                elif review.max_severity in ['critical', 'high']:
                    state['requires_human_review'] = True
                    state['escalation_reason'] = f"constitutional_violation_{review.max_severity.value}"
                    state['next_node'] = 'human_review'
                else:
                    state['next_node'] = 'revise'
                    
                logger.info(
                    f"Constitutional Critic {agent['name']} completed: "
                    f"passes={review.overall_passes}, severity={review.max_severity.value}"
                )
                
            except Exception as e:
                logger.error(f"Error in Constitutional critic {agent['name']}: {e}")
                state['escalation_reason'] = "critique_error"
                state['critique'] = {"error": str(e)}
                
            return state
            
        return critic_node
        
    def _create_synthesizer_node(
        self,
        agent: Dict[str, Any],
        node: Dict[str, Any]
    ) -> Callable:
        """
        Create synthesizer node for multi-source synthesis.
        """
        async def synthesizer_node(state: AgentState) -> AgentState:
            logger.info(f"Executing synthesizer: {agent['name']}")
            
            # Gather all sources
            sources = []
            if state.get('evidence_chain'):
                sources.extend(state['evidence_chain'])
            if state.get('panel_votes'):
                sources.extend(state['panel_votes'])
                
            synthesis_prompt = (
                f"{agent['system_prompt']}\n\n"
                f"Synthesize information from {len(sources)} sources to answer: {state['query']}"
            )
            
            try:
                messages = [
                    {"role": "system", "content": synthesis_prompt},
                    {"role": "system", "content": f"Context: {state.get('context', '')}"},
                    {"role": "user", "content": state['query']}
                ]
                
                response = await self.openai_client.chat.completions.create(
                    model=agent.get('base_model', 'gpt-4'),
                    messages=messages
                )
                
                state['response'] = response.choices[0].message.content
                state['current_node'] = node['name']
                
                logger.info(f"Synthesizer {agent['name']} completed synthesis")
                
            except Exception as e:
                logger.error(f"Error in synthesizer {agent['name']}: {e}")
                state['escalation_reason'] = "synthesis_error"
                
            return state
            
        return synthesizer_node


# Singleton
_agent_compiler: Optional['AgentNodeCompiler'] = None


async def get_agent_node_compiler() -> AgentNodeCompiler:
    """Get or create agent node compiler singleton"""
    global _agent_compiler
    if _agent_compiler is None:
        _agent_compiler = AgentNodeCompiler()
        await _agent_compiler.initialize()
    return _agent_compiler

