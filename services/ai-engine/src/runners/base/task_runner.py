"""
Base Runner Architecture - LangGraph Native Implementation
Following world-class patterns from GPT-Researcher, STORM, and Gemini Deep Research
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, TypeVar, Generic, AsyncIterator
from datetime import datetime
import structlog

logger = structlog.get_logger()


class RunnerCategory(str, Enum):
    """22 Core Cognitive Categories"""
    UNDERSTAND = "understand"
    EVALUATE = "evaluate"
    DECIDE = "decide"
    INVESTIGATE = "investigate"
    WATCH = "watch"
    SOLVE = "solve"
    PREPARE = "prepare"
    CREATE = "create"
    REFINE = "refine"
    VALIDATE = "validate"
    SYNTHESIZE = "synthesize"
    PLAN = "plan"
    PREDICT = "predict"
    ENGAGE = "engage"
    ALIGN = "align"
    INFLUENCE = "influence"
    ADAPT = "adapt"
    DISCOVER = "discover"
    DESIGN = "design"
    GOVERN = "govern"
    SECURE = "secure"
    EXECUTE = "execute"


class PharmaDomain(str, Enum):
    """6 Pharmaceutical Domain Families"""
    FORESIGHT = "foresight"
    BRAND_STRATEGY = "brand_strategy"
    DIGITAL_HEALTH = "digital_health"
    MEDICAL_AFFAIRS = "medical_affairs"
    MARKET_ACCESS = "market_access"
    DESIGN_THINKING = "design_thinking"


class KnowledgeLayer(str, Enum):
    """Knowledge Domain Layers"""
    L0_INDUSTRY = "industry"      # Cross-industry knowledge
    L1_FUNCTION = "function"      # Function-specific (Medical Affairs, Commercial, etc.)
    L2_SPECIALTY = "specialty"    # Deep specialty (Oncology, Rare Disease, etc.)


class QualityMetric(str, Enum):
    """Quality Assessment Metrics"""
    RELEVANCE = "relevance"
    ACCURACY = "accuracy"
    COMPREHENSIVENESS = "comprehensiveness"
    EXPRESSION = "expression"
    FAITHFULNESS = "faithfulness"
    COVERAGE = "coverage"
    TIMELINESS = "timeliness"
    CONFIDENCE = "confidence"


@dataclass
class RunnerInput:
    """Standardized input for all runners"""
    task: str
    context: Dict[str, Any] = field(default_factory=dict)
    persona_id: Optional[str] = None
    knowledge_layers: List[KnowledgeLayer] = field(default_factory=list)
    constraints: Dict[str, Any] = field(default_factory=dict)
    previous_results: List[Dict[str, Any]] = field(default_factory=list)
    max_iterations: int = 3
    quality_threshold: float = 0.80
    # Streaming support
    stream_tokens: bool = False


@dataclass
class RunnerOutput:
    """Standardized output from all runners"""
    result: Any
    confidence: float
    quality_scores: Dict[QualityMetric, float]
    sources: List[Dict[str, Any]]
    artifacts: List[Dict[str, Any]]
    iterations_used: int
    tokens_used: int
    cost_usd: float
    duration_ms: int
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "result": self.result,
            "confidence": self.confidence,
            "quality_scores": {k.value: v for k, v in self.quality_scores.items()},
            "sources": self.sources,
            "artifacts": self.artifacts,
            "iterations_used": self.iterations_used,
            "tokens_used": self.tokens_used,
            "cost_usd": self.cost_usd,
            "duration_ms": self.duration_ms,
            "metadata": self.metadata,
        }


class BaseRunner(ABC):
    """
    Abstract base class for all 207 Mission Runners.

    Implements the TASK = PERSONA + SKILL + KNOWLEDGE + CONTEXT formula.
    Each runner is a pure cognitive skill that can be composed with
    different personas and knowledge domains.
    """

    def __init__(
        self,
        runner_id: str,
        name: str,
        category: RunnerCategory,
        description: str,
        domain: Optional[PharmaDomain] = None,
        required_knowledge_layers: Optional[List[KnowledgeLayer]] = None,
        quality_metrics: Optional[List[QualityMetric]] = None,
    ):
        self.runner_id = runner_id
        self.name = name
        self.category = category
        self.description = description
        self.domain = domain
        self.required_knowledge_layers = required_knowledge_layers or []
        self.quality_metrics = quality_metrics or [
            QualityMetric.RELEVANCE,
            QualityMetric.ACCURACY,
            QualityMetric.CONFIDENCE,
        ]

    @abstractmethod
    async def _execute_core(self, input_data: RunnerInput) -> Any:
        """
        Core algorithmic implementation (PURE SKILL LOGIC).

        This is where the cognitive operation lives - separate from
        persona, knowledge, and context which are injected.
        """
        pass

    @abstractmethod
    def _validate_output(
        self,
        output: Any,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """
        Validate output quality against skill-specific criteria.
        Returns scores for each quality metric (0.0 - 1.0).
        """
        pass

    async def execute(self, input_data: RunnerInput) -> RunnerOutput:
        """
        Main execution method with quality gate and iteration support.
        """
        start_time = datetime.now()
        iterations_used = 0
        total_tokens = 0
        total_cost = 0.0
        all_sources: List[Dict[str, Any]] = []
        all_artifacts: List[Dict[str, Any]] = []

        logger.info(
            "runner_execution_started",
            runner_id=self.runner_id,
            category=self.category.value,
            task_preview=input_data.task[:100],
        )

        current_result = None
        quality_scores: Dict[QualityMetric, float] = {}

        # Iterative refinement loop
        for iteration in range(input_data.max_iterations):
            iterations_used = iteration + 1

            # Execute core skill logic
            result = await self._execute_core(input_data)
            current_result = result

            # Track tokens and cost
            if hasattr(result, 'tokens_used'):
                total_tokens += result.tokens_used
            elif isinstance(result, dict):
                total_tokens += result.get('tokens_used', 0)
            if hasattr(result, 'cost_usd'):
                total_cost += result.cost_usd
            elif isinstance(result, dict):
                total_cost += result.get('cost_usd', 0.0)
            if hasattr(result, 'sources'):
                all_sources.extend(result.sources or [])
            elif isinstance(result, dict):
                all_sources.extend(result.get('sources', []))
            if hasattr(result, 'artifacts'):
                all_artifacts.extend(result.artifacts or [])
            elif isinstance(result, dict):
                all_artifacts.extend(result.get('artifacts', []))

            # Validate quality
            quality_scores = self._validate_output(result, input_data)
            avg_quality = sum(quality_scores.values()) / len(quality_scores) if quality_scores else 0.0

            logger.info(
                "runner_iteration_complete",
                runner_id=self.runner_id,
                iteration=iterations_used,
                avg_quality=round(avg_quality, 3),
            )

            # Quality gate check
            if avg_quality >= input_data.quality_threshold:
                logger.info(
                    "runner_quality_gate_passed",
                    runner_id=self.runner_id,
                    iterations=iterations_used,
                    avg_quality=round(avg_quality, 3),
                )
                break

            # Prepare for next iteration with feedback
            input_data.previous_results.append({
                "iteration": iterations_used,
                "result": result,
                "quality_scores": {k.value: v for k, v in quality_scores.items()},
                "feedback": self._generate_feedback(quality_scores),
            })

        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)

        # Calculate confidence from quality scores
        confidence = self._calculate_confidence(quality_scores)

        return RunnerOutput(
            result=current_result,
            confidence=confidence,
            quality_scores=quality_scores,
            sources=all_sources,
            artifacts=all_artifacts,
            iterations_used=iterations_used,
            tokens_used=total_tokens,
            cost_usd=total_cost,
            duration_ms=duration_ms,
            metadata={
                "runner_id": self.runner_id,
                "category": self.category.value,
                "domain": self.domain.value if self.domain else None,
            },
        )

    async def execute_streaming(
        self,
        input_data: RunnerInput
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Streaming execution that yields tokens as they're generated.

        Yields:
            Dict with either:
            - {"event": "token", "content": "..."} for partial tokens
            - {"event": "iteration", "number": N, "quality": 0.X} for iteration progress
            - {"event": "complete", ...} for final result
        """
        start_time = datetime.now()
        iterations_used = 0
        total_tokens = 0
        total_cost = 0.0
        all_sources: List[Dict[str, Any]] = []
        all_artifacts: List[Dict[str, Any]] = []

        current_result = None
        quality_scores: Dict[QualityMetric, float] = {}

        yield {"event": "start", "runner_id": self.runner_id, "category": self.category.value}

        # Iterative refinement loop
        for iteration in range(input_data.max_iterations):
            iterations_used = iteration + 1

            yield {"event": "iteration_start", "iteration": iterations_used}

            # Execute core skill logic
            result = await self._execute_core(input_data)
            current_result = result

            # Track metrics
            if isinstance(result, dict):
                total_tokens += result.get('tokens_used', 0)
                total_cost += result.get('cost_usd', 0.0)
                all_sources.extend(result.get('sources', []))
                all_artifacts.extend(result.get('artifacts', []))

            # Validate quality
            quality_scores = self._validate_output(result, input_data)
            avg_quality = sum(quality_scores.values()) / len(quality_scores) if quality_scores else 0.0

            yield {
                "event": "iteration_complete",
                "iteration": iterations_used,
                "quality": round(avg_quality, 3),
            }

            # Quality gate check
            if avg_quality >= input_data.quality_threshold:
                break

            # Prepare for next iteration
            input_data.previous_results.append({
                "iteration": iterations_used,
                "result": result,
                "quality_scores": {k.value: v for k, v in quality_scores.items()},
                "feedback": self._generate_feedback(quality_scores),
            })

        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        confidence = self._calculate_confidence(quality_scores)

        output = RunnerOutput(
            result=current_result,
            confidence=confidence,
            quality_scores=quality_scores,
            sources=all_sources,
            artifacts=all_artifacts,
            iterations_used=iterations_used,
            tokens_used=total_tokens,
            cost_usd=total_cost,
            duration_ms=duration_ms,
            metadata={
                "runner_id": self.runner_id,
                "category": self.category.value,
                "domain": self.domain.value if self.domain else None,
            },
        )

        yield {"event": "complete", **output.to_dict()}

    def _generate_feedback(
        self,
        quality_scores: Dict[QualityMetric, float]
    ) -> List[str]:
        """Generate improvement feedback based on low-scoring metrics."""
        feedback = []
        for metric, score in quality_scores.items():
            if score < 0.70:
                feedback.append(f"Improve {metric.value}: current score {score:.2f}")
        return feedback

    def _calculate_confidence(
        self,
        quality_scores: Dict[QualityMetric, float]
    ) -> float:
        """Calculate overall confidence from quality scores."""
        if not quality_scores:
            return 0.0

        # Weighted average with accuracy and faithfulness weighted higher
        weights = {
            QualityMetric.ACCURACY: 1.5,
            QualityMetric.FAITHFULNESS: 1.5,
            QualityMetric.RELEVANCE: 1.2,
            QualityMetric.COMPREHENSIVENESS: 1.0,
            QualityMetric.EXPRESSION: 0.8,
            QualityMetric.COVERAGE: 1.0,
            QualityMetric.TIMELINESS: 0.8,
            QualityMetric.CONFIDENCE: 1.0,
        }

        total_weight = 0.0
        weighted_sum = 0.0

        for metric, score in quality_scores.items():
            weight = weights.get(metric, 1.0)
            weighted_sum += score * weight
            total_weight += weight

        return weighted_sum / total_weight if total_weight > 0 else 0.0

    def to_langgraph_node(self) -> callable:
        """Convert runner to a LangGraph node function."""
        async def node_fn(state: Dict[str, Any]) -> Dict[str, Any]:
            input_data = RunnerInput(
                task=state.get("task", state.get("goal", "")),
                context=state.get("context", {}),
                persona_id=state.get("persona_id"),
                knowledge_layers=[
                    KnowledgeLayer(k) for k in state.get("knowledge_layers", [])
                    if k in [e.value for e in KnowledgeLayer]
                ],
                constraints=state.get("constraints", {}),
                previous_results=state.get("previous_results", []),
                max_iterations=state.get("max_iterations", 3),
                quality_threshold=state.get("quality_threshold", 0.80),
            )

            output = await self.execute(input_data)

            return {
                **state,
                "runner_result": output.result,
                "runner_confidence": output.confidence,
                "runner_quality_scores": {
                    k.value: v for k, v in output.quality_scores.items()
                },
                "sources": state.get("sources", []) + output.sources,
                "artifacts": state.get("artifacts", []) + output.artifacts,
                "tokens_used": state.get("tokens_used", 0) + output.tokens_used,
                "cost_usd": state.get("cost_usd", 0.0) + output.cost_usd,
            }

        return node_fn
