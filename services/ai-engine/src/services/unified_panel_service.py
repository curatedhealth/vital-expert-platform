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

            # === ORCHESTRATOR: Initial Analysis ===
            yield self._sse_event("orchestrator_thinking", {
                "message": "Analyzing your question to determine the optimal panel configuration...",
                "phase": "initialization"
            })

            # Generate topic analysis using LLM
            topic_analysis = await self._analyze_topic(question, panel_type)
            yield self._sse_event("topic_analysis", topic_analysis)

            # Convert agents to experts
            experts = self._create_experts(agents)

            # === ORCHESTRATOR: Expert Selection Decision ===
            expert_names = [e.agent_name for e in experts]
            yield self._sse_event("orchestrator_decision", {
                "message": f"I've assembled a panel of {len(experts)} experts to address your question comprehensively.",
                "experts": expert_names,
                "rationale": [
                    f"Selected {len(experts)} diverse perspectives for balanced analysis",
                    f"Panel type '{panel_type}' chosen for structured deliberation",
                    "Each expert brings specialized domain knowledge"
                ]
            })

            # Send expert info
            yield self._sse_event("experts_loaded", {
                "experts": [{"id": e.agent_id, "name": e.agent_name} for e in experts]
            })

            # === ORCHESTRATOR: Beginning Expert Consultation ===
            yield self._sse_event("orchestrator_message", {
                "message": "Now consulting each expert in sequence. I'll synthesize their perspectives once all have responded.",
                "phase": "expert_consultation",
                "message_type": "phase_transition"
            })

            # Execute each expert and stream responses
            all_responses = []
            for i, expert in enumerate(experts):
                # Orchestrator introduces each expert
                if i == 0:
                    yield self._sse_event("orchestrator_message", {
                        "message": f"Let's begin with {expert.agent_name}...",
                        "phase": "expert_consultation",
                        "message_type": "introduction"
                    })
                elif i == len(experts) - 1:
                    yield self._sse_event("orchestrator_message", {
                        "message": f"Finally, let's hear from {expert.agent_name} to complete our panel perspectives.",
                        "phase": "expert_consultation",
                        "message_type": "introduction"
                    })
                else:
                    yield self._sse_event("orchestrator_message", {
                        "message": f"Next, {expert.agent_name} will share their analysis...",
                        "phase": "expert_consultation",
                        "message_type": "introduction"
                    })

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
                all_responses.append(response)

                yield self._sse_event("expert_response", {
                    "expert_id": expert.agent_id,
                    "expert_name": expert.agent_name,
                    "content": response.get("content", ""),
                    "confidence": response.get("confidence", 0.7)
                })

                # Orchestrator brief commentary after each response (except last)
                if i < len(experts) - 1:
                    yield self._sse_event("orchestrator_message", {
                        "message": f"Interesting perspective from {expert.agent_name}. Let's see how the next expert's view compares.",
                        "phase": "expert_consultation",
                        "message_type": "transition"
                    })

            # === ORCHESTRATOR: Transitioning to Consensus ===
            yield self._sse_event("orchestrator_thinking", {
                "message": "All experts have shared their perspectives. Now analyzing areas of agreement and divergence across the panel...",
                "phase": "consensus_building"
            })

            # Calculate consensus (using already collected responses)
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
                "agreement_points": consensus.agreement_points[:5],
                "divergent_points": consensus.divergent_points[:5],
                "recommendation": consensus.recommendation  # Full recommendation, no truncation
            })

            # === ORCHESTRATOR: Consensus Interpretation ===
            consensus_interpretation = self._interpret_consensus(consensus)
            yield self._sse_event("orchestrator_message", {
                "message": consensus_interpretation,
                "phase": "consensus_complete",
                "message_type": "interpretation"
            })

            # Build comparison matrix
            yield self._sse_event("orchestrator_thinking", {
                "message": "Building a detailed comparison matrix to highlight how each expert's position compares across key aspects...",
                "phase": "matrix_building"
            })
            yield self._sse_event("building_matrix", {})

            matrix = await self.matrix_builder.build_matrix(
                question, response_dicts
            )

            yield self._sse_event("matrix_complete", {
                "aspects": len(matrix.aspects),
                "overall_consensus": matrix.overall_consensus,
                "synthesis": matrix.synthesis  # Full synthesis, no truncation
            })

            # Calculate final execution time
            end_time = datetime.now(timezone.utc)
            execution_time_ms = int((end_time - start_time).total_seconds() * 1000)

            # === ORCHESTRATOR: Final Synthesis ===
            yield self._sse_event("orchestrator_message", {
                "message": f"Panel discussion complete. After consulting {len(experts)} experts and achieving {consensus.consensus_level} consensus ({int(consensus.consensus_score * 100)}%), I've synthesized their insights into actionable recommendations. The comparison matrix highlights {len(matrix.aspects)} key aspects where expert opinions aligned or diverged.",
                "phase": "completion",
                "message_type": "final_synthesis"
            })

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

    async def _analyze_topic(self, question: str, panel_type: str) -> Dict[str, Any]:
        """Analyze the topic to determine domain, complexity, and recommended approach"""
        try:
            analysis_prompt = f"""Analyze this question for a panel discussion:

QUESTION: {question}
PANEL TYPE: {panel_type}

Provide a brief analysis in JSON format:
{{
    "domain": "<primary domain like 'pharmaceuticals', 'regulatory', 'clinical', 'commercial'>",
    "complexity": "<low/medium/high>",
    "focus_areas": ["<area1>", "<area2>", "<area3>"],
    "recommended_approach": "<brief 1-2 sentence approach recommendation>"
}}

Return ONLY valid JSON, no other text."""

            response = await self.llm_service.generate(
                prompt=analysis_prompt,
                model="gpt-3.5-turbo",
                temperature=0.3,
                max_tokens=300
            )

            # Parse JSON response
            try:
                analysis = json.loads(response.strip())
                return {
                    "domain": analysis.get("domain", "general"),
                    "complexity": analysis.get("complexity", "medium"),
                    "focus_areas": analysis.get("focus_areas", []),
                    "recommended_approach": analysis.get("recommended_approach", "")
                }
            except json.JSONDecodeError:
                return {
                    "domain": "general",
                    "complexity": "medium",
                    "focus_areas": [],
                    "recommended_approach": f"Using {panel_type} panel format for structured analysis"
                }

        except Exception as e:
            logger.warning(f"Topic analysis failed: {e}")
            return {
                "domain": "general",
                "complexity": "medium",
                "focus_areas": [],
                "recommended_approach": f"Using {panel_type} panel format for structured analysis"
            }

    def _interpret_consensus(self, consensus: ConsensusResult) -> str:
        """Generate orchestrator interpretation of consensus results"""
        score = consensus.consensus_score
        level = consensus.consensus_level
        agreements = len(consensus.agreement_points)
        divergences = len(consensus.divergent_points)

        if score >= 0.85:
            return f"Excellent alignment achieved! The panel shows {level} consensus ({int(score * 100)}%) with {agreements} points of strong agreement. The experts are largely unified in their assessment."
        elif score >= 0.70:
            return f"Good consensus reached at {int(score * 100)}% ({level}). While there are {agreements} areas of agreement, I've identified {divergences} points where expert opinions differ - these represent areas that may need further consideration."
        elif score >= 0.50:
            return f"Moderate consensus at {int(score * 100)}% ({level}). The panel shows significant diversity of opinion with {divergences} divergent viewpoints. This suggests the question has multiple valid perspectives worth considering."
        else:
            return f"The panel shows limited consensus ({int(score * 100)}%, {level}) with {divergences} areas of disagreement. This diversity of expert opinion indicates a complex topic where different approaches may be equally valid. Consider the varying perspectives carefully."

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
