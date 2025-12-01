"""
Ask Panel Service
High-level orchestration for multi-agent panel discussions
"""

from typing import List, Dict, Any, Optional
from uuid import UUID
from enum import Enum
import asyncio
import structlog

from graphrag.clients.postgres_client import get_postgres_client
from .compiler import compile_agent_graph
from .checkpointer import get_postgres_checkpointer
from .state import init_agent_state, AgentState

logger = structlog.get_logger()


class PanelType(str, Enum):
    """Panel discussion types"""
    PARALLEL = "parallel"  # All agents respond independently
    CONSENSUS = "consensus"  # Discuss until agreement
    DEBATE = "debate"  # Present opposing views
    SEQUENTIAL = "sequential"  # Build on each other's responses


class PanelService:
    """
    Ask Panel Service
    
    Orchestrates multi-agent panel discussions for complex queries:
    - Expert panels for second opinions
    - Diverse perspectives on controversial topics
    - Consensus building for clinical decisions
    - Debate format for exploring trade-offs
    """
    
    def __init__(self):
        """Initialize panel service"""
        self.pg = None
    
    async def _ensure_db(self):
        """Ensure database connection"""
        if self.pg is None:
            self.pg = await get_postgres_client()
    
    async def execute_panel(
        self,
        query: str,
        panel_type: PanelType,
        agent_ids: List[UUID],
        user_id: UUID,
        session_id: UUID,
        tenant_id: Optional[UUID] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute multi-agent panel discussion
        
        Args:
            query: User question
            panel_type: Type of panel discussion
            agent_ids: List of agent IDs for panel
            user_id: User requesting panel
            session_id: Session ID for tracking
            tenant_id: Optional tenant ID
            context: Optional pre-loaded context
            
        Returns:
            Panel discussion result with all agent responses
        """
        try:
            await self._ensure_db()
            
            logger.info(
                "panel_execution_starting",
                panel_type=panel_type,
                agent_count=len(agent_ids),
                query=query[:50]
            )
            
            # Load panel agents with tenant context
            agents = await self._load_agents(agent_ids, tenant_id=tenant_id)
            
            if not agents:
                raise ValueError("No valid agents found for panel")
            
            # Execute panel based on type
            if panel_type == PanelType.PARALLEL:
                responses = await self._execute_parallel(
                    query, agents, user_id, session_id, tenant_id, context
                )
            elif panel_type == PanelType.CONSENSUS:
                responses = await self._execute_consensus(
                    query, agents, user_id, session_id, tenant_id, context
                )
            elif panel_type == PanelType.DEBATE:
                responses = await self._execute_debate(
                    query, agents, user_id, session_id, tenant_id, context
                )
            elif panel_type == PanelType.SEQUENTIAL:
                responses = await self._execute_sequential(
                    query, agents, user_id, session_id, tenant_id, context
                )
            else:
                raise ValueError(f"Unknown panel type: {panel_type}")
            
            # Build final result
            result = await self._build_panel_result(
                query, panel_type, responses, agents
            )
            
            logger.info(
                "panel_execution_complete",
                panel_type=panel_type,
                consensus_reached=result.get('consensus_reached', False)
            )
            
            return result
            
        except Exception as e:
            logger.error("panel_execution_failed", error=str(e))
            raise
    
    async def _load_agents(self, agent_ids: List[UUID], tenant_id: Optional[UUID] = None) -> List[Dict[str, Any]]:
        """
        Load agent configurations from Supabase agents table.
        
        Uses the same Supabase client and agent service as the rest of the codebase
        to ensure consistency and proper tenant filtering via RLS.
        """
        try:
            from services.supabase_client import get_supabase_client
            from services.agent_service import AgentService
            
            supabase_client = get_supabase_client()
            if not supabase_client.client:
                await supabase_client.initialize()
            
            agent_service = AgentService(supabase_client)
            
            # Convert UUIDs to strings for agent_service
            agents = []
            tenant_id_str = str(tenant_id) if tenant_id else None
            
            for agent_id in agent_ids:
                agent = await agent_service.get_agent(str(agent_id), tenant_id=tenant_id_str)
                if agent:
                    # Map to expected format (add graph_id if needed from metadata)
                    agent_dict = {
                        'id': agent.get('id'),
                        'name': agent.get('name'),
                        'system_prompt': agent.get('system_prompt', ''),
                        'model_name': agent.get('model') or agent.get('base_model', 'gpt-4'),
                        'graph_id': agent.get('metadata', {}).get('graph_id') if isinstance(agent.get('metadata'), dict) else None
                    }
                    agents.append(agent_dict)
                else:
                    logger.warning(
                        "agent_not_found_in_panel_service",
                        agent_id=str(agent_id),
                        tenant_id=tenant_id_str
                    )
            
            return agents
            
        except Exception as e:
            logger.error(
                "failed_to_load_agents_via_supabase_fallback_to_postgres",
                error=str(e),
                agent_count=len(agent_ids)
            )
            # Fallback to direct PostgreSQL query if Supabase fails
            # This maintains backward compatibility but should be avoided
            query = """
            SELECT
                a.id,
                a.name,
                a.system_prompt,
                a.model_name,
                ag.id as graph_id
            FROM agents a
            LEFT JOIN agent_graph_assignments aga ON a.id = aga.agent_id AND aga.is_primary = true
            LEFT JOIN agent_graphs ag ON aga.graph_id = ag.id
            WHERE a.id = ANY($1) AND a.deleted_at IS NULL
            """
            
            results = await self.pg.fetch(query, agent_ids)
            return [dict(row) for row in results]
    
    async def _execute_parallel(
        self,
        query: str,
        agents: List[Dict],
        user_id: UUID,
        session_id: UUID,
        tenant_id: Optional[UUID],
        context: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Execute parallel panel - all agents respond independently"""
        
        # Execute all agents concurrently
        tasks = [
            self._execute_single_agent(agent, query, user_id, session_id, tenant_id, context)
            for agent in agents
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        responses = []
        for agent, result in zip(agents, results):
            if isinstance(result, Exception):
                logger.error(
                    "agent_execution_failed",
                    agent_id=str(agent['id']),
                    error=str(result)
                )
                responses.append({
                    'agent_id': agent['id'],
                    'agent_name': agent['name'],
                    'response': f"Error: {str(result)}",
                    'error': True
                })
            else:
                responses.append({
                    'agent_id': agent['id'],
                    'agent_name': agent['name'],
                    'response': result.get('response', ''),
                    'confidence': result.get('confidence', 0.0),
                    'error': False
                })
        
        return responses
    
    async def _execute_consensus(
        self,
        query: str,
        agents: List[Dict],
        user_id: UUID,
        session_id: UUID,
        tenant_id: Optional[UUID],
        context: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Execute consensus panel - agents discuss until agreement"""
        
        max_rounds = 3
        responses_history = []
        
        for round_num in range(max_rounds):
            logger.info("consensus_round_starting", round=round_num + 1)
            
            # Each agent responds, seeing previous responses
            round_responses = []
            
            for agent in agents:
                # Build context including previous responses
                round_context = self._build_round_context(context, responses_history)
                
                result = await self._execute_single_agent(
                    agent, query, user_id, session_id, tenant_id, round_context
                )
                
                round_responses.append({
                    'agent_id': agent['id'],
                    'agent_name': agent['name'],
                    'response': result.get('response', ''),
                    'confidence': result.get('confidence', 0.0),
                    'round': round_num + 1
                })
            
            responses_history.append(round_responses)
            
            # Check for consensus
            if self._check_consensus(round_responses):
                logger.info("consensus_reached", round=round_num + 1)
                break
        
        # Return final round responses
        return responses_history[-1] if responses_history else []
    
    async def _execute_debate(
        self,
        query: str,
        agents: List[Dict],
        user_id: UUID,
        session_id: UUID,
        tenant_id: Optional[UUID],
        context: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Execute debate panel - agents present opposing views"""
        
        responses = []
        previous_responses = []
        
        for agent in agents:
            # Build context with previous arguments
            debate_context = self._build_debate_context(context, previous_responses)
            
            result = await self._execute_single_agent(
                agent, query, user_id, session_id, tenant_id, debate_context
            )
            
            response_data = {
                'agent_id': agent['id'],
                'agent_name': agent['name'],
                'response': result.get('response', ''),
                'confidence': result.get('confidence', 0.0),
                'position': len(responses) + 1
            }
            
            responses.append(response_data)
            previous_responses.append(response_data['response'])
        
        return responses
    
    async def _execute_sequential(
        self,
        query: str,
        agents: List[Dict],
        user_id: UUID,
        session_id: UUID,
        tenant_id: Optional[UUID],
        context: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Execute sequential panel - agents build on each other"""
        
        responses = []
        accumulated_context = context or ""
        
        for agent in agents:
            result = await self._execute_single_agent(
                agent, query, user_id, session_id, tenant_id, accumulated_context
            )
            
            response_data = {
                'agent_id': agent['id'],
                'agent_name': agent['name'],
                'response': result.get('response', ''),
                'confidence': result.get('confidence', 0.0),
                'order': len(responses) + 1
            }
            
            responses.append(response_data)
            
            # Add this response to context for next agent
            accumulated_context += f"\n\nPrevious response from {agent['name']}:\n{response_data['response']}"
        
        return responses
    
    async def _execute_single_agent(
        self,
        agent: Dict,
        query: str,
        user_id: UUID,
        session_id: UUID,
        tenant_id: Optional[UUID],
        context: Optional[str]
    ) -> Dict[str, Any]:
        """Execute single agent's response"""
        
        graph_id = agent.get('graph_id')
        
        if graph_id:
            # Use agent's custom graph
            checkpointer = await get_postgres_checkpointer()
            compiled_graph = await compile_agent_graph(UUID(graph_id), checkpointer)
            
            # Initialize state
            state = init_agent_state(
                query=query,
                user_id=user_id,
                session_id=session_id,
                agent_id=agent['id'],
                tenant_id=tenant_id
            )
            
            if context:
                state['context'] = context
            
            # Execute graph
            result = await compiled_graph.ainvoke(state)
            
            return result
        else:
            # Direct LLM call (no graph)
            from openai import AsyncOpenAI
            from graphrag.config import get_graphrag_config
            
            config = get_graphrag_config()
            client = AsyncOpenAI(api_key=config.openai_api_key)
            
            messages = [
                {"role": "system", "content": agent.get('system_prompt', '')}
            ]
            
            if context:
                messages[0]['content'] += f"\n\nContext:\n{context}"
            
            messages.append({"role": "user", "content": query})
            
            response = await client.chat.completions.create(
                model=agent.get('model_name', 'gpt-4'),
                messages=messages,
                temperature=0.7
            )
            
            return {
                'response': response.choices[0].message.content,
                'confidence': 0.85
            }
    
    def _build_round_context(
        self,
        base_context: Optional[str],
        responses_history: List[List[Dict]]
    ) -> str:
        """Build context with previous round responses"""
        context_parts = []
        
        if base_context:
            context_parts.append(base_context)
        
        if responses_history:
            context_parts.append("\n\nPrevious Round Responses:")
            for round_responses in responses_history:
                for resp in round_responses:
                    context_parts.append(
                        f"- {resp['agent_name']}: {resp['response'][:200]}..."
                    )
        
        return "\n".join(context_parts)
    
    def _build_debate_context(
        self,
        base_context: Optional[str],
        previous_responses: List[str]
    ) -> str:
        """Build context with previous debate arguments"""
        context_parts = []
        
        if base_context:
            context_parts.append(base_context)
        
        if previous_responses:
            context_parts.append("\n\nPrevious Arguments:")
            for i, resp in enumerate(previous_responses):
                context_parts.append(f"{i+1}. {resp[:200]}...")
        
        return "\n".join(context_parts)
    
    def _check_consensus(self, responses: List[Dict]) -> bool:
        """
        Check if responses show consensus (placeholder for agent-based evaluation)
        
        Note: In production, this should use an agent-based consensus evaluator
        that analyzes response similarity using LLM-as-judge pattern.
        See: _evaluate_consensus_with_agent() for full implementation.
        """
        # Basic heuristic: all responses succeeded
        return len(responses) > 0 and all(not r.get('error') for r in responses)
    
    async def _evaluate_consensus_with_agent(
        self,
        responses: List[Dict],
        query: str,
        tenant_id: Optional[UUID] = None
    ) -> tuple[bool, str, float]:
        """
        Agent-based consensus evaluation using LLM-as-judge pattern
        
        This uses an agent from the database to evaluate whether multiple
        expert responses show consensus. This pattern is used across all
        4 services (Ask Expert, Ask Panel, Workflows, Solution Builder).
        
        Args:
            responses: List of agent responses to evaluate
            query: Original user query
            tenant_id: Tenant ID for agent selection
            
        Returns:
            (consensus_reached, explanation, confidence_score)
        """
        try:
            # Load consensus evaluator agent
            from services.unified_agent_loader import UnifiedAgentLoader
            from openai import AsyncOpenAI
            from graphrag.config import get_graphrag_config
            
            loader = UnifiedAgentLoader(self.pg)
            
            # Try to get specialized consensus evaluator
            try:
                evaluator = await loader.load_agent_by_name(
                    "Consensus Evaluator",
                    tenant_id=str(tenant_id) if tenant_id else "platform"
                )
            except:
                # Fall back to analysis expert
                evaluator = await loader.load_default_agent_for_domain(
                    "analysis",
                    tenant_id=str(tenant_id) if tenant_id else "platform"
                )
            
            # Build consensus evaluation prompt
            response_summary = "\n\n".join([
                f"**Expert {i+1} ({r.get('agent_name', 'Unknown')}):**\n{r.get('response', 'No response')}"
                for i, r in enumerate(responses)
            ])
            
            consensus_prompt = f"""Analyze these expert responses to determine consensus level.

Original Question: {query}

Expert Responses:
{response_summary}

Evaluate the following:
1. **Agreement Level**: Do the experts fundamentally agree on the core answer?
2. **Key Points of Agreement**: What are the main points where experts align?
3. **Areas of Disagreement**: What are the key differences in their responses?
4. **Overall Consensus**: Rate as HIGH, MEDIUM, or LOW

Provide your analysis in this format:
CONSENSUS: [HIGH/MEDIUM/LOW]
CONFIDENCE: [0.0-1.0]
EXPLANATION: [Your detailed analysis]
AGREEMENT_POINTS:
- [Point 1]
- [Point 2]
DISAGREEMENT_POINTS:
- [Point 1]
- [Point 2]

CONSENSUS indicates if they agree on the core answer. HIGH = strong agreement, MEDIUM = general agreement with minor differences, LOW = significant disagreement.
"""
            
            # Execute via OpenAI
            config = get_graphrag_config()
            client = AsyncOpenAI(api_key=config.openai_api_key)
            
            result = await client.chat.completions.create(
                model=evaluator.model_name or "gpt-4",
                messages=[
                    {"role": "system", "content": evaluator.system_prompt or "You are a consensus evaluator analyzing expert responses."},
                    {"role": "user", "content": consensus_prompt}
                ],
                temperature=0.3  # Lower temperature for more consistent evaluation
            )
            
            analysis = result.choices[0].message.content
            
            # Parse consensus level
            consensus_high = "CONSENSUS: HIGH" in analysis
            consensus_medium = "CONSENSUS: MEDIUM" in analysis
            consensus_reached = consensus_high or consensus_medium
            
            # Extract confidence (look for CONFIDENCE: X.XX)
            confidence = 0.8  # Default
            import re
            confidence_match = re.search(r'CONFIDENCE:\s*([0-9.]+)', analysis)
            if confidence_match:
                confidence = float(confidence_match.group(1))
            
            logger.info(
                "consensus_evaluated_by_agent",
                consensus_reached=consensus_reached,
                confidence=confidence,
                evaluator=evaluator.name
            )
            
            return consensus_reached, analysis, confidence
            
        except Exception as e:
            logger.error(
                "consensus_evaluation_failed",
                error=str(e)
            )
            # Fall back to basic heuristic
            basic_consensus = self._check_consensus(responses)
            return basic_consensus, f"Consensus evaluation failed: {str(e)}", 0.5
    
    async def _build_panel_result(
        self,
        query: str,
        panel_type: PanelType,
        responses: List[Dict],
        agents: List[Dict]
    ) -> Dict[str, Any]:
        """Build final panel result"""
        
        return {
            'query': query,
            'panel_type': panel_type.value,
            'panel_size': len(agents),
            'responses': responses,
            'consensus_reached': self._calculate_consensus(responses),
            'final_recommendation': self._build_recommendation(responses),
            'metadata': {
                'successful_responses': sum(1 for r in responses if not r.get('error', False)),
                'avg_confidence': sum(r.get('confidence', 0) for r in responses) / len(responses) if responses else 0
            }
        }
    
    def _calculate_consensus(self, responses: List[Dict]) -> bool:
        """Calculate if consensus was reached"""
        # Placeholder: Implement consensus detection
        return len(responses) > 0 and all(not r.get('error') for r in responses)
    
    def _build_recommendation(self, responses: List[Dict]) -> str:
        """Build final recommendation from panel"""
        if not responses:
            return "No responses available"
        
        # Simple aggregation - in production, use more sophisticated methods
        parts = []
        for i, resp in enumerate(responses):
            if not resp.get('error', False):
                parts.append(f"**{resp['agent_name']}**: {resp['response'][:200]}...")
        
        return "\n\n".join(parts)


# Global service instance
_panel_service: Optional[PanelService] = None


async def get_panel_service() -> PanelService:
    """Get or create panel service instance"""
    global _panel_service
    
    if _panel_service is None:
        _panel_service = PanelService()
    
    return _panel_service

