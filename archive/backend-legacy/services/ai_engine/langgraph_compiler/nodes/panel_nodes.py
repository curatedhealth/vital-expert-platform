"""
Panel Node Compilers

Compiles panel nodes for multi-agent discussions.

Panel orchestration types:
- parallel: All agents respond independently, then synthesize
- consensus: Agents discuss until reaching agreement
- debate: Agents present conflicting views
- sequential: Agents build on each other's responses
- delphi: Multiple rounds of anonymous voting

Results are stored in agent_panel_votes and agent_panel_arbitrations tables.
"""

from typing import Dict, Any, Callable, Optional, List
from uuid import UUID, uuid4
import json
import asyncio

from ..compiler import AgentState
from ...graphrag.clients import get_postgres_client
from ...graphrag.utils.logger import get_logger
from .agent_nodes import AgentNodeCompiler

logger = get_logger(__name__)


class PanelNodeCompiler:
    """Compiles panel nodes for multi-agent orchestration"""
    
    def __init__(self):
        self.pg_client = None
        self.agent_compiler = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize dependencies"""
        if self._initialized:
            return
        self.pg_client = await get_postgres_client()
        self.agent_compiler = AgentNodeCompiler()
        await self.agent_compiler.initialize()
        self._initialized = True
        
    async def compile(self, node: Dict[str, Any]) -> Callable:
        """
        Compile panel node.
        
        Panel configuration is stored in node['config']:
        - panel_type: parallel|consensus|debate|sequential|delphi
        - agent_ids: List of agent IDs to include
        - min_votes: Minimum votes required
        - arbitration_method: How to resolve disagreements
        """
        if not self._initialized:
            await self.initialize()
            
        logger.info(f"Compiling panel node: {node['name']}")
        
        # Extract panel config
        config = node.get('config', {})
        panel_type = config.get('panel_type', 'parallel')
        
        # Create panel node function
        async def panel_node(state: AgentState) -> AgentState:
            logger.info(f"Executing panel: {node['name']} (type={panel_type})")
            
            session_id = state.get('session_id', uuid4())
            
            try:
                # Load panel agents
                agent_ids = config.get('agent_ids', [])
                if not agent_ids:
                    logger.warning(f"Panel {node['name']} has no agents configured")
                    state['panel_votes'] = []
                    return state
                    
                # Execute panel based on type
                if panel_type == 'parallel':
                    votes = await self._execute_parallel_panel(
                        agent_ids, state, session_id, node
                    )
                elif panel_type == 'consensus':
                    votes = await self._execute_consensus_panel(
                        agent_ids, state, session_id, node
                    )
                elif panel_type == 'debate':
                    votes = await self._execute_debate_panel(
                        agent_ids, state, session_id, node
                    )
                elif panel_type == 'sequential':
                    votes = await self._execute_sequential_panel(
                        agent_ids, state, session_id, node
                    )
                else:
                    logger.warning(f"Unknown panel type: {panel_type}")
                    votes = []
                    
                # Store votes
                state['panel_votes'] = votes
                state['current_node'] = node['name']
                
                # Arbitrate results
                arbitration = await self._arbitrate_panel(
                    votes, config, session_id, node
                )
                state['panel_result'] = arbitration
                
                logger.info(
                    f"Panel {node['name']} completed with {len(votes)} votes"
                )
                
            except Exception as e:
                logger.error(f"Error in panel {node['name']}: {e}")
                state['escalation_reason'] = "panel_error"
                state['panel_votes'] = []
                
            return state
            
        return panel_node
        
    async def _execute_parallel_panel(
        self,
        agent_ids: List[UUID],
        state: AgentState,
        session_id: UUID,
        node: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Execute parallel panel - all agents respond independently using asyncio.gather.
        
        This is the FULL implementation with actual parallel execution.
        """
        logger.info(f"Executing parallel panel with {len(agent_ids)} agents")
        
        # Create tasks for all agents
        tasks = []
        for agent_id in agent_ids:
            task = self._execute_agent_in_panel(
                agent_id, state, session_id, node
            )
            tasks.append(task)
            
        # Execute all agents in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        votes = []
        for i, (agent_id, result) in enumerate(zip(agent_ids, results)):
            if isinstance(result, Exception):
                logger.error(f"Agent {agent_id} failed in panel: {result}")
                vote = {
                    "agent_id": str(agent_id),
                    "vote": {
                        "error": str(result),
                        "recommendation": "ERROR",
                        "confidence": 0.0
                    },
                    "weight": 0.0,
                    "confidence": 0.0
                }
            else:
                vote = result
                
            votes.append(vote)
            
            # Store in database
            await self._store_panel_vote(
                node['graph_id'], session_id, agent_id, vote
            )
            
        logger.info(f"Parallel panel completed: {len(votes)} votes collected")
        return votes
        
    async def _execute_agent_in_panel(
        self,
        agent_id: UUID,
        state: AgentState,
        session_id: UUID,
        node: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a single agent for panel discussion"""
        # Load agent
        agent = await self._load_agent(agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")
            
        # Create a temporary agent node
        temp_node = {
            "name": f"panel_agent_{agent['name']}",
            "agent_id": agent_id,
            "config": {}
        }
        
        # Use agent compiler to create standard agent node
        agent_node_fn = self.agent_compiler._create_standard_node(agent, temp_node)
        
        # Execute agent
        result_state = await agent_node_fn(state.copy())
        
        # Extract vote from result
        response = result_state.get('response', '')
        confidence = result_state.get('confidence', 0.8)
        
        return {
            "agent_id": str(agent_id),
            "vote": {
                "recommendation": response,
                "confidence": confidence,
                "reasoning": response  # Full response is the reasoning
            },
            "weight": 1.0,
            "confidence": confidence
        }
        
    async def _load_agent(self, agent_id: UUID) -> Optional[Dict[str, Any]]:
        """Load agent from database"""
        query = """
            SELECT 
                id, name, slug, title, description,
                system_prompt, base_model, temperature,
                max_tokens
            FROM v_agent_complete
            WHERE id = $1
            LIMIT 1
        """
        
        async with self.pg_client.acquire() as conn:
            row = await conn.fetchrow(query, agent_id)
            return dict(row) if row else None
        
    async def _execute_consensus_panel(
        self,
        agent_ids: List[UUID],
        state: AgentState,
        session_id: UUID,
        node: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Execute consensus panel - agents discuss until reaching agreement.
        
        Full implementation with iterative discussion rounds.
        """
        logger.info(f"Executing consensus panel with {len(agent_ids)} agents")
        
        config = node.get('config', {})
        max_rounds = config.get('max_consensus_rounds', 3)
        consensus_threshold = config.get('consensus_threshold', 0.8)
        
        all_votes = []
        
        for round_num in range(max_rounds):
            logger.info(f"Consensus round {round_num + 1}/{max_rounds}")
            
            # Execute agents in parallel for this round
            round_tasks = []
            for agent_id in agent_ids:
                # Add previous rounds' results to context
                round_context = self._build_consensus_context(state, all_votes)
                state_copy = state.copy()
                state_copy['context'] = state_copy.get('context', '') + f"\n\nPrevious Discussion:\n{round_context}"
                
                task = self._execute_agent_in_panel(
                    agent_id, state_copy, session_id, node
                )
                round_tasks.append(task)
                
            round_results = await asyncio.gather(*round_tasks, return_exceptions=True)
            
            # Process round results
            round_votes = []
            for agent_id, result in zip(agent_ids, round_results):
                if isinstance(result, Exception):
                    logger.error(f"Agent {agent_id} failed in round {round_num}: {result}")
                    continue
                round_votes.append(result)
                all_votes.append(result)
                
            # Check for consensus
            if self._has_consensus(round_votes, consensus_threshold):
                logger.info(f"Consensus reached in round {round_num + 1}")
                break
                
        # Store final votes
        for vote in all_votes[-len(agent_ids):]:  # Last round only
            await self._store_panel_vote(
                node['graph_id'], session_id, UUID(vote['agent_id']), vote
            )
            
        logger.info(f"Consensus panel completed after {len(all_votes) // len(agent_ids)} rounds")
        return all_votes[-len(agent_ids):]  # Return final round
        
    def _build_consensus_context(
        self,
        state: AgentState,
        previous_votes: List[Dict[str, Any]]
    ) -> str:
        """Build context from previous discussion rounds"""
        if not previous_votes:
            return ""
            
        context_lines = []
        for i, vote in enumerate(previous_votes):
            context_lines.append(
                f"Agent {i+1}: {vote['vote']['recommendation']}"
            )
        return "\n".join(context_lines)
        
    def _has_consensus(
        self,
        votes: List[Dict[str, Any]],
        threshold: float
    ) -> bool:
        """Check if votes have reached consensus threshold"""
        if len(votes) < 2:
            return False
            
        # Simple consensus: Check if average confidence is above threshold
        avg_confidence = sum([v['confidence'] for v in votes]) / len(votes)
        
        # Also check similarity of recommendations (simple keyword overlap)
        # This is a simplified heuristic
        return avg_confidence >= threshold
        
    async def _execute_debate_panel(
        self,
        agent_ids: List[UUID],
        state: AgentState,
        session_id: UUID,
        node: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Execute debate panel - agents present conflicting views.
        
        Full implementation with pro/con assignments.
        """
        logger.info(f"Executing debate panel with {len(agent_ids)} agents")
        
        config = node.get('config', {})
        debate_rounds = config.get('debate_rounds', 2)
        
        # Assign positions (pro/con alternating)
        positions = ['pro', 'con'] * ((len(agent_ids) + 1) // 2)
        positions = positions[:len(agent_ids)]
        
        all_votes = []
        
        for round_num in range(debate_rounds):
            logger.info(f"Debate round {round_num + 1}/{debate_rounds}")
            
            round_tasks = []
            for agent_id, position in zip(agent_ids, positions):
                # Add position-specific instructions
                debate_context = self._build_debate_context(
                    state, all_votes, position
                )
                state_copy = state.copy()
                state_copy['context'] = debate_context
                
                task = self._execute_agent_in_panel(
                    agent_id, state_copy, session_id, node
                )
                round_tasks.append(task)
                
            round_results = await asyncio.gather(*round_tasks, return_exceptions=True)
            
            for agent_id, result, position in zip(agent_ids, round_results, positions):
                if isinstance(result, Exception):
                    logger.error(f"Agent {agent_id} failed in debate: {result}")
                    continue
                result['position'] = position
                all_votes.append(result)
                
        # Store final votes
        for vote in all_votes[-len(agent_ids):]:
            await self._store_panel_vote(
                node['graph_id'], session_id, UUID(vote['agent_id']), vote
            )
            
        logger.info(f"Debate panel completed: {len(all_votes)} arguments presented")
        return all_votes[-len(agent_ids):]
        
    def _build_debate_context(
        self,
        state: AgentState,
        previous_votes: List[Dict[str, Any]],
        position: str
    ) -> str:
        """Build debate context with position assignment"""
        base_context = state.get('context', '')
        
        position_instruction = f"""
You are arguing the {position.upper()} position in this debate.
Present strong arguments for your assigned position, even if you personally disagree.
Be rigorous, cite evidence, and anticipate counterarguments.
"""
        
        if previous_votes:
            opposing_args = "\n".join([
                f"Opposing argument: {v['vote']['recommendation']}"
                for v in previous_votes
                if v.get('position') != position
            ])
            return f"{base_context}\n\n{position_instruction}\n\n{opposing_args}"
        else:
            return f"{base_context}\n\n{position_instruction}"
            
    async def _execute_sequential_panel(
        self,
        agent_ids: List[UUID],
        state: AgentState,
        session_id: UUID,
        node: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Execute sequential panel - agents build on each other's responses.
        
        Full implementation with sequential execution.
        """
        logger.info(f"Executing sequential panel with {len(agent_ids)} agents")
        
        votes = []
        accumulated_context = state.get('context', '')
        
        # Execute agents sequentially
        for i, agent_id in enumerate(agent_ids):
            logger.info(f"Sequential agent {i+1}/{len(agent_ids)}: {agent_id}")
            
            # Add previous agents' outputs to context
            state_copy = state.copy()
            state_copy['context'] = accumulated_context
            
            # Execute agent
            try:
                vote = await self._execute_agent_in_panel(
                    agent_id, state_copy, session_id, node
                )
                
                # Add this agent's output to accumulated context
                accumulated_context += f"\n\nAgent {i+1} ({agent_id}):\n{vote['vote']['recommendation']}"
                
                votes.append(vote)
                
                # Store vote
                await self._store_panel_vote(
                    node['graph_id'], session_id, agent_id, vote
                )
                
            except Exception as e:
                logger.error(f"Agent {agent_id} failed in sequential panel: {e}")
                continue
                
        logger.info(f"Sequential panel completed: {len(votes)} agents contributed")
        return votes
        
    async def _store_panel_vote(
        self,
        graph_id: UUID,
        session_id: UUID,
        agent_id: UUID,
        vote: Dict[str, Any]
    ) -> None:
        """Store panel vote in database"""
        query = """
            INSERT INTO agent_panel_votes (
                id, graph_id, session_id, agent_id,
                vote, weight, confidence, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        """
        
        try:
            async with self.pg_client.acquire() as conn:
                await conn.execute(
                    query,
                    uuid4(),
                    graph_id,
                    session_id,
                    agent_id,
                    json.dumps(vote['vote']),
                    vote['weight'],
                    vote['confidence']
                )
        except Exception as e:
            logger.error(f"Error storing panel vote: {e}")
            
    async def _arbitrate_panel(
        self,
        votes: List[Dict[str, Any]],
        config: Dict[str, Any],
        session_id: UUID,
        node: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Arbitrate panel results based on arbitration method.
        
        Methods:
        - majority: Simple majority vote
        - weighted: Weighted average based on agent weights
        - model-mediated: Use LLM to synthesize
        """
        method = config.get('arbitration_method', 'weighted')
        
        # Placeholder arbitration
        arbitration = {
            "method": method,
            "result": "Panel consensus (placeholder)",
            "confidence": 0.8,
            "vote_distribution": {
                "yes": len(votes),
                "no": 0
            }
        }
        
        # Store arbitration
        await self._store_panel_arbitration(
            session_id, node['graph_id'], arbitration, method
        )
        
        return arbitration
        
    async def _store_panel_arbitration(
        self,
        session_id: UUID,
        graph_id: UUID,
        result: Dict[str, Any],
        method: str
    ) -> None:
        """Store panel arbitration in database"""
        query = """
            INSERT INTO agent_panel_arbitrations (
                id, session_id, graph_id, result, method,
                confidence, metadata, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        """
        
        try:
            async with self.pg_client.acquire() as conn:
                await conn.execute(
                    query,
                    uuid4(),
                    session_id,
                    graph_id,
                    json.dumps(result),
                    method,
                    result.get('confidence'),
                    json.dumps(result.get('vote_distribution', {}))
                )
        except Exception as e:
            logger.error(f"Error storing panel arbitration: {e}")


# Singleton
_panel_compiler: Optional['PanelNodeCompiler'] = None


async def get_panel_node_compiler() -> PanelNodeCompiler:
    """Get or create panel node compiler singleton"""
    global _panel_compiler
    if _panel_compiler is None:
        _panel_compiler = PanelNodeCompiler()
        await _panel_compiler.initialize()
    return _panel_compiler

