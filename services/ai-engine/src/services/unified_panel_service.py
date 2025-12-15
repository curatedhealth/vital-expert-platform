"""
Unified Panel Service

Single entry point for all 6 Ask Panel types with:
- Real LLM execution
- Advanced consensus analysis
- Comparison matrix generation
- Streaming support
- Database persistence

Integrates all panel type handlers into a cohesive service.
"""

import asyncio
import json
from typing import List, Dict, Any, Optional, AsyncGenerator
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from uuid import UUID, uuid4
import structlog

from services.llm_service import LLMService, get_llm_service
from services.consensus_analyzer import (
    AdvancedConsensusAnalyzer,
    ConsensusResult,
    create_consensus_analyzer
)
from services.comparison_matrix_builder import (
    ComparisonMatrixBuilder,
    ComparisonMatrix,
    create_comparison_matrix_builder
)
from services.panel_type_handlers import (
    BasePanelHandler,
    PanelExpert,
    PanelExecutionResult,
    StructuredPanelHandler,
    OpenPanelHandler,
    SocraticPanelHandler,
    AdversarialPanelHandler,
    DelphiPanelHandler,
    HybridPanelHandler,
    create_panel_handler
)

# Optional imports - may not be available in all environments
try:
    from domain.panel_types import PanelType, PanelStatus
    HAS_PANEL_TYPES = True
except ImportError:
    HAS_PANEL_TYPES = False
    PanelType = None
    PanelStatus = None

try:
    from repositories.panel_repository import PanelRepository
    HAS_PANEL_REPO = True
except ImportError:
    HAS_PANEL_REPO = False
    PanelRepository = None

logger = structlog.get_logger()


@dataclass
class UnifiedPanelResult:
    """Complete result from unified panel execution"""
    panel_id: str
    panel_type: str
    question: str
    status: str
    execution_result: Optional[PanelExecutionResult]
    comparison_matrix: Optional[ComparisonMatrix]
    consensus: Optional[ConsensusResult]
    expert_responses: List[Dict[str, Any]]
    execution_time_ms: int
    created_at: str
    metadata: Dict[str, Any]


class UnifiedPanelService:
    """
    Unified service for all Ask Panel operations.

    Provides:
    - Single API for all 6 panel types
    - Streaming and non-streaming execution
    - Database persistence
    - Comparison matrix generation
    - Advanced consensus analysis
    """

    PANEL_TYPES = {
        "structured": StructuredPanelHandler,
        "open": OpenPanelHandler,
        "socratic": SocraticPanelHandler,
        "adversarial": AdversarialPanelHandler,
        "delphi": DelphiPanelHandler,
        "hybrid": HybridPanelHandler
    }

    def __init__(
        self,
        llm_service: LLMService,
        panel_repository: Optional[PanelRepository] = None,
        max_rounds: int = 3,
        min_consensus: float = 0.70
    ):
        self.llm_service = llm_service
        self.panel_repo = panel_repository
        self.max_rounds = max_rounds
        self.min_consensus = min_consensus

        # Initialize analyzers
        self.consensus_analyzer = create_consensus_analyzer(llm_service)
        self.matrix_builder = create_comparison_matrix_builder(llm_service)

        # Handler cache
        self._handlers: Dict[str, BasePanelHandler] = {}

    def _get_handler(self, panel_type: str) -> BasePanelHandler:
        """Get or create handler for panel type"""
        if panel_type not in self._handlers:
            handler_class = self.PANEL_TYPES.get(panel_type.lower())
            if not handler_class:
                raise ValueError(f"Unknown panel type: {panel_type}")

            self._handlers[panel_type] = handler_class(
                self.llm_service,
                self.consensus_analyzer,
                self.max_rounds,
                self.min_consensus
            )

        return self._handlers[panel_type]

    async def execute_panel(
        self,
        question: str,
        panel_type: str,
        agents: List[Dict[str, Any]],
        context: Optional[str] = None,
        tenant_id: Optional[str] = None,
        user_id: Optional[str] = None,
        save_to_db: bool = True,
        generate_matrix: bool = True,
        human_feedback: Optional[List[str]] = None  # For hybrid panels
    ) -> UnifiedPanelResult:
        """
        Execute a panel discussion.

        Args:
            question: Question to discuss
            panel_type: One of: structured, open, socratic, adversarial, delphi, hybrid
            agents: List of agent configurations
            context: Optional context to provide
            tenant_id: Tenant ID for multi-tenancy
            user_id: User ID for tracking
            save_to_db: Whether to save to database
            generate_matrix: Whether to generate comparison matrix
            human_feedback: Human feedback for hybrid panels

        Returns:
            UnifiedPanelResult with complete execution data
        """
        start_time = datetime.now(timezone.utc)
        panel_id = str(uuid4())

        logger.info(
            "Starting unified panel execution",
            panel_id=panel_id,
            panel_type=panel_type,
            agent_count=len(agents),
            question=question[:100]
        )

        try:
            # Convert agent configs to PanelExpert objects
            experts = self._create_experts(agents)

            # Get appropriate handler
            handler = self._get_handler(panel_type)

            # Execute panel (with human feedback for hybrid)
            if panel_type == "hybrid" and isinstance(handler, HybridPanelHandler):
                execution_result = await handler.execute(
                    question=question,
                    experts=experts,
                    context=context,
                    human_feedback=human_feedback
                )
            else:
                execution_result = await handler.execute(
                    question=question,
                    experts=experts,
                    context=context
                )

            # Convert responses to dict format
            expert_responses = self._extract_responses(execution_result)

            # Generate comparison matrix if requested
            comparison_matrix = None
            if generate_matrix and expert_responses:
                response_dicts = [
                    {
                        "agent_id": r.get("agent_id"),
                        "agent_name": r.get("agent_name"),
                        "content": r.get("content"),
                        "confidence": r.get("confidence", 0.7)
                    }
                    for r in expert_responses
                ]
                comparison_matrix = await self.matrix_builder.build_matrix(
                    question, response_dicts
                )

            # Calculate execution time
            end_time = datetime.now(timezone.utc)
            execution_time_ms = int((end_time - start_time).total_seconds() * 1000)

            # Save to database if configured
            if save_to_db and self.panel_repo:
                await self._save_panel_to_db(
                    panel_id=panel_id,
                    question=question,
                    panel_type=panel_type,
                    agents=agents,
                    execution_result=execution_result,
                    comparison_matrix=comparison_matrix,
                    tenant_id=tenant_id,
                    user_id=user_id
                )

            result = UnifiedPanelResult(
                panel_id=panel_id,
                panel_type=panel_type,
                question=question,
                status="completed",
                execution_result=execution_result,
                comparison_matrix=comparison_matrix,
                consensus=execution_result.final_consensus if execution_result else None,
                expert_responses=expert_responses,
                execution_time_ms=execution_time_ms,
                created_at=start_time.isoformat(),
                metadata={
                    "tenant_id": tenant_id,
                    "user_id": user_id,
                    "agent_count": len(agents),
                    "rounds_completed": len(execution_result.rounds) if execution_result else 0
                }
            )

            logger.info(
                "Unified panel execution complete",
                panel_id=panel_id,
                execution_time_ms=execution_time_ms,
                consensus_score=execution_result.final_consensus.consensus_score if execution_result else None
            )

            return result

        except Exception as e:
            logger.error(
                "Unified panel execution failed",
                panel_id=panel_id,
                error=str(e)
            )

            end_time = datetime.now(timezone.utc)
            execution_time_ms = int((end_time - start_time).total_seconds() * 1000)

            return UnifiedPanelResult(
                panel_id=panel_id,
                panel_type=panel_type,
                question=question,
                status="failed",
                execution_result=None,
                comparison_matrix=None,
                consensus=None,
                expert_responses=[],
                execution_time_ms=execution_time_ms,
                created_at=start_time.isoformat(),
                metadata={"error": str(e)}
            )

    async def execute_panel_streaming(
        self,
        question: str,
        panel_type: str,
        agents: List[Dict[str, Any]],
        context: Optional[str] = None,
        tenant_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Execute panel with streaming responses.

        Yields SSE-formatted events as execution progresses.

        Args:
            question: Question to discuss
            panel_type: Panel type
            agents: Agent configurations
            context: Optional context
            tenant_id: Tenant ID
            user_id: User ID

        Yields:
            SSE-formatted event strings
        """
        panel_id = str(uuid4())
        start_time = datetime.now(timezone.utc)

        logger.info(
            "Starting streaming panel execution",
            panel_id=panel_id,
            panel_type=panel_type
        )

        try:
            # Send initial event
            yield self._sse_event("panel_started", {
                "panel_id": panel_id,
                "panel_type": panel_type,
                "question": question[:200],
                "agent_count": len(agents)
            })

            # Convert agents to experts
            experts = self._create_experts(agents)

            # Send expert info
            yield self._sse_event("experts_loaded", {
                "experts": [{"id": e.agent_id, "name": e.agent_name} for e in experts]
            })

            # Execute each expert and stream responses
            for i, expert in enumerate(experts):
                yield self._sse_event("expert_thinking", {
                    "expert_id": expert.agent_id,
                    "expert_name": expert.agent_name,
                    "position": i + 1,
                    "total": len(experts)
                })

                # Get expert response
                response = await self._get_single_expert_response(
                    expert, question, panel_type, context
                )

                yield self._sse_event("expert_response", {
                    "expert_id": expert.agent_id,
                    "expert_name": expert.agent_name,
                    "content": response.get("content", ""),
                    "confidence": response.get("confidence", 0.7)
                })

            # Collect all responses for consensus
            all_responses = []
            for expert in experts:
                response = await self._get_single_expert_response(
                    expert, question, panel_type, context
                )
                all_responses.append(response)

            # Calculate consensus
            yield self._sse_event("calculating_consensus", {
                "response_count": len(all_responses)
            })

            response_dicts = [
                {
                    "agent_name": r.get("agent_name"),
                    "content": r.get("content"),
                    "confidence": r.get("confidence", 0.7)
                }
                for r in all_responses
            ]

            consensus = await self.consensus_analyzer.analyze_consensus(
                question, response_dicts
            )

            yield self._sse_event("consensus_complete", {
                "consensus_score": consensus.consensus_score,
                "consensus_level": consensus.consensus_level,
                "agreement_points": consensus.agreement_points[:3],
                "divergent_points": consensus.divergent_points[:3],
                "recommendation": consensus.recommendation[:500]
            })

            # Build comparison matrix
            yield self._sse_event("building_matrix", {})

            matrix = await self.matrix_builder.build_matrix(
                question, response_dicts
            )

            yield self._sse_event("matrix_complete", {
                "aspects": len(matrix.aspects),
                "overall_consensus": matrix.overall_consensus,
                "synthesis": matrix.synthesis[:500]
            })

            # Calculate final execution time
            end_time = datetime.now(timezone.utc)
            execution_time_ms = int((end_time - start_time).total_seconds() * 1000)

            # Send completion event
            yield self._sse_event("panel_complete", {
                "panel_id": panel_id,
                "status": "completed",
                "execution_time_ms": execution_time_ms,
                "consensus_score": consensus.consensus_score,
                "recommendation": consensus.recommendation
            })

        except Exception as e:
            logger.error(
                "Streaming panel execution failed",
                panel_id=panel_id,
                error=str(e)
            )

            yield self._sse_event("error", {
                "panel_id": panel_id,
                "error": str(e)
            })

    async def _get_single_expert_response(
        self,
        expert: PanelExpert,
        question: str,
        panel_type: str,
        context: Optional[str]
    ) -> Dict[str, Any]:
        """Get response from a single expert"""
        prompt = f"""{expert.system_prompt}

You are participating in a {panel_type} panel discussion.

QUESTION: {question}

{f"CONTEXT: {context}" if context else ""}

Please provide your expert analysis with:
1. Key insights
2. Supporting evidence
3. Recommendations
4. Confidence level"""

        try:
            response = await self.llm_service.generate(
                prompt=prompt,
                model=expert.model,
                temperature=0.7,
                max_tokens=1500
            )

            return {
                "agent_id": expert.agent_id,
                "agent_name": expert.agent_name,
                "content": response,
                "confidence": 0.8
            }

        except Exception as e:
            logger.error(f"Expert response failed: {expert.agent_name}", error=str(e))
            return {
                "agent_id": expert.agent_id,
                "agent_name": expert.agent_name,
                "content": f"Error: {str(e)}",
                "confidence": 0.0
            }

    def _create_experts(self, agents: List[Dict[str, Any]]) -> List[PanelExpert]:
        """Convert agent configs to PanelExpert objects"""
        experts = []

        for agent in agents:
            expert = PanelExpert(
                agent_id=agent.get("id", str(uuid4())),
                agent_name=agent.get("name", "Expert"),
                model=agent.get("model", "gpt-4-turbo"),
                system_prompt=agent.get("system_prompt", "You are a helpful expert."),
                role=agent.get("role", "expert")
            )
            experts.append(expert)

        return experts

    def _extract_responses(
        self,
        execution_result: PanelExecutionResult
    ) -> List[Dict[str, Any]]:
        """Extract responses from execution result"""
        responses = []

        if not execution_result or not execution_result.rounds:
            return responses

        for round_result in execution_result.rounds:
            for panel_response in round_result.responses:
                responses.append({
                    "agent_id": panel_response.agent_id,
                    "agent_name": panel_response.agent_name,
                    "content": panel_response.content,
                    "confidence": panel_response.confidence,
                    "round_number": panel_response.round_number,
                    "response_type": panel_response.response_type,
                    "position": panel_response.position,
                    "vote": panel_response.vote
                })

        return responses

    def _sse_event(self, event_type: str, data: Dict[str, Any]) -> str:
        """Format data as SSE event"""
        return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"

    async def _save_panel_to_db(
        self,
        panel_id: str,
        question: str,
        panel_type: str,
        agents: List[Dict[str, Any]],
        execution_result: Optional[PanelExecutionResult],
        comparison_matrix: Optional[ComparisonMatrix],
        tenant_id: Optional[str],
        user_id: Optional[str]
    ):
        """Save panel execution to database"""
        if not self.panel_repo or not HAS_PANEL_REPO or not HAS_PANEL_TYPES:
            logger.warning("Panel repository or panel types not available, skipping database save")
            return

        try:
            from uuid import UUID as UUIDType

            # Create panel record
            agent_ids = [a.get("id", str(uuid4())) for a in agents]

            await self.panel_repo.create_panel(
                user_id=UUIDType(user_id) if user_id else UUIDType(int=0),
                query=question,
                panel_type=PanelType(panel_type),
                agents=agent_ids,
                configuration={
                    "max_rounds": self.max_rounds,
                    "min_consensus": self.min_consensus
                },
                metadata={
                    "execution_result": asdict(execution_result) if execution_result else None,
                    "comparison_matrix": asdict(comparison_matrix) if comparison_matrix else None
                }
            )

            logger.info("Panel saved to database", panel_id=panel_id)

        except Exception as e:
            logger.error(f"Failed to save panel to database: {e}")

    def get_supported_panel_types(self) -> List[Dict[str, Any]]:
        """Get list of supported panel types with descriptions"""
        return [
            {
                "type": "structured",
                "name": "Structured Panel",
                "description": "Sequential moderated discussion with clear phases",
                "best_for": "Regulatory reviews, compliance assessments",
                "duration_estimate": "3-5 minutes"
            },
            {
                "type": "open",
                "name": "Open Panel",
                "description": "Free-form brainstorming with parallel execution",
                "best_for": "Innovation, creative problem solving",
                "duration_estimate": "5-10 minutes"
            },
            {
                "type": "socratic",
                "name": "Socratic Panel",
                "description": "Dialectical questioning to test assumptions",
                "best_for": "Assumption testing, deep analysis",
                "duration_estimate": "7-12 minutes"
            },
            {
                "type": "adversarial",
                "name": "Adversarial Panel",
                "description": "Pro/con debate format with rebuttals",
                "best_for": "Go/no-go decisions, risk assessment",
                "duration_estimate": "5-8 minutes"
            },
            {
                "type": "delphi",
                "name": "Delphi Panel",
                "description": "Iterative consensus building with anonymous voting",
                "best_for": "Complex decisions requiring convergence",
                "duration_estimate": "10-15 minutes"
            },
            {
                "type": "hybrid",
                "name": "Hybrid Panel",
                "description": "Human-AI collaborative panel",
                "best_for": "High-stakes decisions requiring human validation",
                "duration_estimate": "15-30 minutes"
            }
        ]


# Factory function
def create_unified_panel_service(
    llm_service: Optional[LLMService] = None,
    panel_repository: Optional[PanelRepository] = None,
    max_rounds: int = 3,
    min_consensus: float = 0.70
) -> UnifiedPanelService:
    """Create unified panel service instance"""
    if llm_service is None:
        llm_service = get_llm_service()

    return UnifiedPanelService(
        llm_service=llm_service,
        panel_repository=panel_repository,
        max_rounds=max_rounds,
        min_consensus=min_consensus
    )


# Singleton
_unified_panel_service: Optional[UnifiedPanelService] = None


def get_unified_panel_service() -> Optional[UnifiedPanelService]:
    """Get global unified panel service instance"""
    return _unified_panel_service


def initialize_unified_panel_service(
    llm_service: LLMService,
    panel_repository: Optional[PanelRepository] = None
) -> UnifiedPanelService:
    """Initialize global unified panel service"""
    global _unified_panel_service
    _unified_panel_service = UnifiedPanelService(
        llm_service=llm_service,
        panel_repository=panel_repository
    )
    logger.info("✅ Unified Panel Service initialized")
    return _unified_panel_service
