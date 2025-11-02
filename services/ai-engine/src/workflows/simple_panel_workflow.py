"""
Simple Panel Workflow

Orchestrates multi-expert panel execution for MVP.
Simplified workflow without LangGraph - just async execution.

Workflow:
1. Load panel from repository
2. Update status to 'running'
3. Execute 3-5 experts in parallel (mock for MVP)
4. Save responses to database
5. Calculate consensus
6. Save consensus to database
7. Update status to 'completed' or 'failed'
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

logger = structlog.get_logger()


class SimplePanelWorkflow:
    """
    Simple panel workflow for MVP.
    
    NOT using LangGraph for MVP - just async orchestration.
    Single round only, 3-5 experts, simple consensus.
    """
    
    def __init__(
        self,
        panel_repo: PanelRepository,
        consensus_calc: SimpleConsensusCalculator,
        usage_tracker: AgentUsageTracker,
        max_experts: int = 5
    ):
        """
        Initialize workflow.
        
        Args:
            panel_repo: Panel repository
            consensus_calc: Consensus calculator
            usage_tracker: Usage tracker
            max_experts: Maximum experts per panel (default 5 for MVP)
        """
        self.panel_repo = panel_repo
        self.consensus_calc = consensus_calc
        self.usage_tracker = usage_tracker
        self.max_experts = max_experts
    
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
        Execute experts in parallel.
        
        For MVP: Using mock responses. In production, this would call actual AI agents.
        
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
            expert_count=len(agents_to_use)
        )
        
        # Execute in parallel (mock for MVP)
        tasks = [
            self._execute_single_expert(agent_id, panel.query, panel.panel_type.value)
            for agent_id in agents_to_use
        ]
        
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions
        valid_responses = [
            r for r in responses
            if not isinstance(r, Exception)
        ]
        
        if len(valid_responses) < len(agents_to_use) * 0.5:
            # Less than 50% succeeded
            logger.warning(
                "low_expert_success_rate",
                panel_id=str(panel.id),
                success_count=len(valid_responses),
                total_count=len(agents_to_use)
            )
        
        return valid_responses
    
    async def _execute_single_expert(
        self,
        agent_id: str,
        query: str,
        panel_type: str
    ) -> Dict[str, Any]:
        """
        Execute a single expert (mock for MVP).
        
        In production, this would:
        1. Load agent configuration
        2. Call LLM with agent's system prompt
        3. Parse and validate response
        4. Track usage
        
        For MVP: Returning mock responses for testing.
        
        Args:
            agent_id: Agent identifier
            query: Query to answer
            panel_type: Panel type
            
        Returns:
            Expert response data
        """
        # Simulate API call delay
        await asyncio.sleep(0.5)
        
        # Mock response based on agent_id
        mock_responses = {
            "regulatory_expert": {
                "content": f"From a regulatory perspective regarding '{query}': FDA requires 510(k) clearance for Class II medical devices. Clinical trials are necessary to demonstrate safety and efficacy. The approval process typically takes 12-18 months, depending on device complexity and data quality.",
                "confidence": 0.85
            },
            "clinical_expert": {
                "content": f"Clinical analysis of '{query}': Medical devices need robust clinical evidence from well-designed trials. Patient safety is paramount. Clinical trials should include appropriate endpoints and follow FDA guidance.",
                "confidence": 0.80
            },
            "quality_expert": {
                "content": f"Quality perspective on '{query}': Quality Management System per ISO 13485 is essential. Design controls, risk management (ISO 14971), and verification/validation activities are critical for regulatory compliance.",
                "confidence": 0.75
            }
        }
        
        # Get mock response or generate generic one
        if agent_id in mock_responses:
            mock_data = mock_responses[agent_id]
            content = mock_data["content"]
            confidence = mock_data["confidence"]
        else:
            # Generic response for unknown agents
            content = f"Expert analysis of '{query}': This requires careful consideration of regulatory requirements, clinical evidence, and quality systems. Approval pathway depends on device classification and risk profile."
            confidence = 0.70
        
        return {
            "agent_id": agent_id,
            "agent_name": agent_id.replace("_", " ").title(),
            "content": content,
            "confidence_score": confidence,
            "tokens_used": len(content.split()) * 2,  # Rough estimate
            "execution_time_ms": 2000,
            "model": "gpt-4-turbo",
            "metadata": {
                "panel_type": panel_type,
                "mock": True  # Flag for MVP
            }
        }


# Factory function
def create_panel_workflow(
    panel_repo: PanelRepository,
    consensus_calc: SimpleConsensusCalculator,
    usage_tracker: AgentUsageTracker,
    max_experts: int = 5
) -> SimplePanelWorkflow:
    """
    Create a panel workflow.
    
    Args:
        panel_repo: Panel repository
        consensus_calc: Consensus calculator
        usage_tracker: Usage tracker
        max_experts: Max experts per panel
        
    Returns:
        SimplePanelWorkflow instance
    """
    return SimplePanelWorkflow(
        panel_repo,
        consensus_calc,
        usage_tracker,
        max_experts
    )

