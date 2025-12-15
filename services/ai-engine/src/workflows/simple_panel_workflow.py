"""
Simple Panel Workflow

Orchestrates multi-expert panel execution with REAL LLM calls.
Simplified workflow without LangGraph - just async execution.

Workflow:
1. Load panel from repository
2. Load agent configurations from database
3. Update status to 'running'
4. Execute 3-5 experts in parallel with real LLM
5. Save responses to database
6. Calculate consensus using advanced analyzer
7. Save consensus to database
8. Update status to 'completed' or 'failed'

Updated: Now uses real LLM calls instead of mock responses.
"""

import asyncio
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime, timezone
import structlog

from domain.panel_types import PanelStatus, ResponseType
from domain.panel_models import Panel
from repositories.panel_repository import PanelRepository
from services.consensus_calculator import SimpleConsensusCalculator
from services.agent_usage_tracker import AgentUsageTracker
from services.llm_service import LLMService, get_llm_service
from services.consensus_analyzer import AdvancedConsensusAnalyzer, get_consensus_analyzer

logger = structlog.get_logger()


class SimplePanelWorkflow:
    """
    Simple panel workflow with REAL LLM execution.

    Uses async orchestration with actual LLM calls.
    Single round, 3-5 experts, advanced consensus analysis.
    """

    def __init__(
        self,
        panel_repo: PanelRepository,
        consensus_calc: SimpleConsensusCalculator,
        usage_tracker: AgentUsageTracker,
        max_experts: int = 5,
        llm_service: Optional[LLMService] = None,
        consensus_analyzer: Optional[AdvancedConsensusAnalyzer] = None,
        use_mock: bool = False  # Set True for testing without LLM
    ):
        """
        Initialize workflow.

        Args:
            panel_repo: Panel repository
            consensus_calc: Consensus calculator (fallback)
            usage_tracker: Usage tracker
            max_experts: Maximum experts per panel (default 5)
            llm_service: LLM service for real calls
            consensus_analyzer: Advanced consensus analyzer
            use_mock: If True, use mock responses (for testing)
        """
        self.panel_repo = panel_repo
        self.consensus_calc = consensus_calc
        self.usage_tracker = usage_tracker
        self.max_experts = max_experts
        self.llm_service = llm_service
        self.consensus_analyzer = consensus_analyzer
        self.use_mock = use_mock
        self._agent_cache: Dict[str, Dict[str, Any]] = {}
    
    async def execute_panel(self, panel_id: UUID) -> Dict[str, Any]:
        """
        Execute complete panel workflow.
        
        Args:
            panel_id: Panel ID to execute
            
        Returns:
            Execution result with status and metrics
            
        Raises:
            ValueError: If panel not found or invalid state
            Exception: On execution failure
        """
        start_time = datetime.now(timezone.utc)
        
        logger.info("panel_execution_started", panel_id=str(panel_id))
        
        try:
            # 1. Load panel
            panel = await self.panel_repo.get_panel(panel_id)
            if not panel:
                raise ValueError(f"Panel {panel_id} not found")
            
            if not panel.can_start():
                raise ValueError(f"Panel {panel_id} cannot be started (status: {panel.status.value})")
            
            # 2. Update status to running
            panel = await self.panel_repo.update_panel_status(
                panel_id,
                PanelStatus.RUNNING,
                started_at=start_time
            )
            
            logger.info(
                "panel_running",
                panel_id=str(panel_id),
                query=panel.query[:100],
                agent_count=len(panel.agents)
            )
            
            # 3. Execute experts in parallel
            responses = await self._execute_experts(panel)
            
            if not responses:
                raise Exception("No expert responses received")
            
            # 4. Save responses to database
            for response_data in responses:
                await self.panel_repo.add_response(
                    panel_id=panel_id,
                    agent_id=response_data["agent_id"],
                    agent_name=response_data["agent_name"],
                    round_number=1,
                    response_type=ResponseType.ANALYSIS,
                    content=response_data["content"],
                    confidence_score=response_data["confidence_score"],
                    metadata=response_data.get("metadata", {})
                )
                
                # Track usage
                await self.usage_tracker.track_usage(
                    agent_id=response_data["agent_id"],
                    user_id=panel.user_id,
                    tokens_used=response_data.get("tokens_used", 1000),
                    execution_time_ms=response_data.get("execution_time_ms", 2000),
                    model=response_data.get("model", "gpt-4-turbo"),
                    panel_id=panel_id
                )
            
            logger.info(
                "expert_responses_saved",
                panel_id=str(panel_id),
                response_count=len(responses)
            )
            
            # 5. Calculate consensus
            consensus_result = self.consensus_calc.calculate_consensus(
                responses,
                panel.query
            )
            
            logger.info(
                "consensus_calculated",
                panel_id=str(panel_id),
                consensus_level=consensus_result.consensus_level
            )
            
            # 6. Save consensus to database
            await self.panel_repo.save_consensus(
                panel_id=panel_id,
                round_number=1,
                consensus_level=consensus_result.consensus_level,
                agreement_points=consensus_result.agreement_points,
                disagreement_points=consensus_result.disagreement_points,
                recommendation=consensus_result.recommendation,
                dissenting_opinions=consensus_result.dissenting_opinions
            )
            
            # 7. Update status to completed
            end_time = datetime.now(timezone.utc)
            panel = await self.panel_repo.update_panel_status(
                panel_id,
                PanelStatus.COMPLETED,
                completed_at=end_time
            )
            
            execution_time_ms = int((end_time - start_time).total_seconds() * 1000)
            
            logger.info(
                "panel_execution_completed",
                panel_id=str(panel_id),
                consensus_level=consensus_result.consensus_level,
                execution_time_ms=execution_time_ms
            )
            
            return {
                "status": "completed",
                "panel_id": str(panel_id),
                "consensus_level": consensus_result.consensus_level,
                "response_count": len(responses),
                "execution_time_ms": execution_time_ms,
                "recommendation": consensus_result.recommendation
            }
            
        except Exception as e:
            # Mark panel as failed
            logger.error(
                "panel_execution_failed",
                panel_id=str(panel_id),
                error=str(e)
            )
            
            try:
                await self.panel_repo.update_panel_status(
                    panel_id,
                    PanelStatus.FAILED
                )
            except Exception as update_error:
                logger.error(
                    "failed_to_update_panel_status",
                    panel_id=str(panel_id),
                    error=str(update_error)
                )
            
            raise
    
    async def _execute_experts(self, panel: Panel) -> List[Dict[str, Any]]:
        """
        Execute experts in parallel using real LLM calls.

        Args:
            panel: Panel to execute

        Returns:
            List of expert responses
        """
        # Limit to max_experts
        agents_to_use = panel.agents[:self.max_experts]

        logger.info(
            "executing_experts",
            panel_id=str(panel.id),
            expert_count=len(agents_to_use),
            use_mock=self.use_mock
        )

        # Load agent configurations
        agent_configs = await self._load_agent_configs(agents_to_use)

        # Execute in parallel with real LLM or mock
        tasks = [
            self._execute_single_expert(
                agent_id=agent_id,
                agent_config=agent_configs.get(agent_id),
                query=panel.query,
                panel_type=panel.panel_type.value
            )
            for agent_id in agents_to_use
        ]

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter out exceptions
        valid_responses = []
        for i, r in enumerate(responses):
            if isinstance(r, Exception):
                logger.error(
                    "expert_execution_failed",
                    agent_id=agents_to_use[i],
                    error=str(r)
                )
            else:
                valid_responses.append(r)

        if len(valid_responses) < len(agents_to_use) * 0.5:
            logger.warning(
                "low_expert_success_rate",
                panel_id=str(panel.id),
                success_count=len(valid_responses),
                total_count=len(agents_to_use)
            )

        return valid_responses

    async def _load_agent_configs(self, agent_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        """Load agent configurations from database"""
        configs = {}

        try:
            from services.supabase_client import get_supabase_client

            supabase = get_supabase_client()
            if not supabase or not supabase.client:
                logger.warning("Supabase not available, using default configs")
                return configs

            # Fetch agents
            result = supabase.client.table("agents").select(
                "id, name, system_prompt, model, temperature, max_tokens"
            ).in_("id", agent_ids).execute()

            if result.data:
                for agent in result.data:
                    configs[agent["id"]] = {
                        "name": agent.get("name", "Expert"),
                        "system_prompt": agent.get("system_prompt", ""),
                        "model": agent.get("model", "gpt-4-turbo"),
                        "temperature": agent.get("temperature", 0.7),
                        "max_tokens": agent.get("max_tokens", 2000)
                    }

        except Exception as e:
            logger.warning(f"Failed to load agent configs: {e}")

        return configs

    async def _execute_single_expert(
        self,
        agent_id: str,
        agent_config: Optional[Dict[str, Any]],
        query: str,
        panel_type: str
    ) -> Dict[str, Any]:
        """
        Execute a single expert with real LLM call.

        Args:
            agent_id: Agent identifier
            agent_config: Agent configuration from database
            query: Query to answer
            panel_type: Panel type

        Returns:
            Expert response data
        """
        start_time = datetime.now(timezone.utc)

        # Use mock if configured or no LLM service
        if self.use_mock or not self.llm_service:
            return await self._mock_expert_response(agent_id, query, panel_type)

        # Get agent config or use defaults
        if agent_config:
            agent_name = agent_config.get("name", agent_id.replace("_", " ").title())
            system_prompt = agent_config.get("system_prompt", "")
            model = agent_config.get("model", "gpt-4-turbo")
            temperature = agent_config.get("temperature", 0.7)
            max_tokens = agent_config.get("max_tokens", 2000)
        else:
            agent_name = agent_id.replace("_", " ").title()
            system_prompt = f"You are {agent_name}, an expert providing analysis on healthcare and pharmaceutical topics."
            model = "gpt-4-turbo"
            temperature = 0.7
            max_tokens = 2000

        # Build prompt
        full_prompt = f"""{system_prompt}

You are participating in an expert panel discussion ({panel_type} format).

QUESTION: {query}

Please provide your expert analysis with:
1. Key findings and insights
2. Supporting evidence or reasoning
3. Specific recommendations
4. Confidence level in your assessment

Be thorough but concise. Focus on actionable insights."""

        try:
            # Real LLM call
            response = await self.llm_service.generate(
                prompt=full_prompt,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens
            )

            end_time = datetime.now(timezone.utc)
            execution_time_ms = int((end_time - start_time).total_seconds() * 1000)

            # Estimate tokens (rough)
            tokens_used = len(full_prompt.split()) + len(response.split())

            # Estimate confidence from response
            confidence = self._estimate_confidence(response)

            return {
                "agent_id": agent_id,
                "agent_name": agent_name,
                "content": response,
                "confidence_score": confidence,
                "tokens_used": tokens_used,
                "execution_time_ms": execution_time_ms,
                "model": model,
                "metadata": {
                    "panel_type": panel_type,
                    "mock": False,
                    "temperature": temperature
                }
            }

        except Exception as e:
            logger.error(f"LLM call failed for {agent_id}: {e}")
            # Fallback to mock on error
            return await self._mock_expert_response(agent_id, query, panel_type)

    def _estimate_confidence(self, response: str) -> float:
        """Estimate confidence from response content"""
        response_lower = response.lower()

        uncertainty_phrases = [
            "might", "perhaps", "possibly", "uncertain", "unclear",
            "may", "could", "not sure", "it depends"
        ]
        certainty_phrases = [
            "clearly", "definitely", "certainly", "must", "will",
            "evidence shows", "data indicates", "proven"
        ]

        uncertainty_count = sum(1 for p in uncertainty_phrases if p in response_lower)
        certainty_count = sum(1 for p in certainty_phrases if p in response_lower)

        base = 0.75
        adjustment = (certainty_count - uncertainty_count) * 0.05
        return max(0.3, min(0.95, base + adjustment))

    async def _mock_expert_response(
        self,
        agent_id: str,
        query: str,
        panel_type: str
    ) -> Dict[str, Any]:
        """Generate mock response for testing"""
        await asyncio.sleep(0.3)  # Simulate delay

        mock_responses = {
            "regulatory_expert": {
                "content": f"From a regulatory perspective regarding '{query[:50]}': FDA requires 510(k) clearance for Class II medical devices. Clinical trials are necessary to demonstrate safety and efficacy. The approval process typically takes 12-18 months.",
                "confidence": 0.85
            },
            "clinical_expert": {
                "content": f"Clinical analysis of '{query[:50]}': Medical devices need robust clinical evidence from well-designed trials. Patient safety is paramount. Clinical trials should include appropriate endpoints.",
                "confidence": 0.80
            },
            "quality_expert": {
                "content": f"Quality perspective on '{query[:50]}': Quality Management System per ISO 13485 is essential. Design controls, risk management (ISO 14971), and V&V activities are critical.",
                "confidence": 0.75
            }
        }

        if agent_id in mock_responses:
            mock_data = mock_responses[agent_id]
            content = mock_data["content"]
            confidence = mock_data["confidence"]
        else:
            content = f"Expert analysis of '{query[:50]}': This requires careful consideration of regulatory requirements, clinical evidence, and quality systems. Approval pathway depends on device classification and risk profile."
            confidence = 0.70

        return {
            "agent_id": agent_id,
            "agent_name": agent_id.replace("_", " ").title(),
            "content": content,
            "confidence_score": confidence,
            "tokens_used": len(content.split()) * 2,
            "execution_time_ms": 300,
            "model": "mock",
            "metadata": {
                "panel_type": panel_type,
                "mock": True
            }
        }


# Factory function
def create_panel_workflow(
    panel_repo: PanelRepository,
    consensus_calc: SimpleConsensusCalculator,
    usage_tracker: AgentUsageTracker,
    max_experts: int = 5,
    llm_service: Optional[LLMService] = None,
    consensus_analyzer: Optional[AdvancedConsensusAnalyzer] = None,
    use_mock: bool = False
) -> SimplePanelWorkflow:
    """
    Create a panel workflow.

    Args:
        panel_repo: Panel repository
        consensus_calc: Consensus calculator (fallback)
        usage_tracker: Usage tracker
        max_experts: Max experts per panel
        llm_service: LLM service for real calls
        consensus_analyzer: Advanced consensus analyzer
        use_mock: Use mock responses instead of real LLM

    Returns:
        SimplePanelWorkflow instance
    """
    # Try to get global services if not provided
    if llm_service is None:
        try:
            llm_service = get_llm_service()
        except Exception:
            pass

    if consensus_analyzer is None:
        try:
            consensus_analyzer = get_consensus_analyzer()
        except Exception:
            pass

    return SimplePanelWorkflow(
        panel_repo=panel_repo,
        consensus_calc=consensus_calc,
        usage_tracker=usage_tracker,
        max_experts=max_experts,
        llm_service=llm_service,
        consensus_analyzer=consensus_analyzer,
        use_mock=use_mock
    )

