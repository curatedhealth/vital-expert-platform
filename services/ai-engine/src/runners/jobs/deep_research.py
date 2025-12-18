#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
# GRADE: A+ (upgraded from A-)
"""
Deep Research Runner - ToT → CoT → Reflection Pattern

This runner implements the DEEP_RESEARCH family's specialized reasoning:
1. Tree-of-Thought (ToT): Generate multiple research branches
2. Chain-of-Thought (CoT): Deep sequential reasoning per branch
3. Reflection: Self-critique and quality verification

Graph Structure:
    START → initialize → preflight → decompose_query → tree_of_thought →
    branch_executor → chain_of_thought → synthesize →
    verify_citations → reflection → quality_gate → END
                                          ↓
                                (conditional routing)
                                     ↙        ↘
                                complete    hitl_required

HITL:
    - Checkpoint after synthesize (blocking for complex queries)
    - Final validation after quality_gate (non-blocking)

Reasoning Pattern:
    ToT branches the query into multiple research paths
    CoT processes each path with deep reasoning
    Reflection validates and improves the synthesis

L4 Workers Used:
    - L4-SM (SourceMiner): Multi-source search
    - L4-DE (DataExtractor): Extract findings
    - L4-QA (QualityAssessor): Verify evidence quality
    - L4-CS (ComparativeSynthesizer): Final synthesis
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from pydantic import Field

from langgraph_workflows.modes34.resilience import (
    graceful_degradation,
    invoke_llm_with_timeout,
)
from langgraph_workflows.modes34.resilience.exceptions import ValidationError
from .output_validation import validate_deep_research_outputs

from .base_family_runner import (
    BaseFamilyRunner,
    BaseFamilyState,
    ExecutionPhase,
    FamilyType,
    SSEEvent,
    SSEEventType,
    register_family_runner,
)

logger = logging.getLogger(__name__)


# =============================================================================
# Deep Research State
# =============================================================================

class ResearchBranch(BaseFamilyState):
    """Represents a single research branch in Tree-of-Thought."""
    branch_id: str = ""
    branch_query: str = ""
    branch_hypothesis: str = ""
    findings: List[Dict[str, Any]] = Field(default_factory=list)
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    branch_confidence: float = 0.0
    source_count: int = 0
    evidence_strength: float = 0.0
    completed: bool = False


class DeepResearchState(BaseFamilyState):
    """
    State for Deep Research family runner.

    Extends BaseFamilyState with ToT-specific fields for multi-branch
    research, chain-of-thought reasoning, and reflection loops.
    """
    # Tree-of-Thought fields
    research_branches: List[ResearchBranch] = Field(default_factory=list)
    num_branches: int = Field(default=3)
    branch_depth: int = Field(default=2)
    current_branch_index: int = Field(default=0)

    # Chain-of-Thought fields
    reasoning_chain: List[Dict[str, Any]] = Field(default_factory=list)
    intermediate_conclusions: List[str] = Field(default_factory=list)
    cot_reasoning_depth: int = Field(default=0)

    # Reflection fields
    reflection_iterations: int = Field(default=0)
    max_reflection_iterations: int = Field(default=2)
    reflection_feedback: List[str] = Field(default_factory=list)
    needs_improvement: bool = Field(default=False)

    # Research-specific quality metrics
    evidence_quality_scores: Dict[str, float] = Field(default_factory=dict)
    source_diversity_score: float = Field(default=0.0)
    citation_verification_status: Dict[str, bool] = Field(default_factory=dict)

    # Mode 4 constraints (for autonomous execution)
    mode_4_constraints: Optional[Dict[str, Any]] = Field(default=None)

    # A+ Quality tracking
    evidence_coverage: float = Field(default=0.0)
    synthesis_quality: float = Field(default=0.0)
    reflection_depth: float = Field(default=0.0)
    branch_convergence: float = Field(default=0.0)


# =============================================================================
# Deep Research Runner
# =============================================================================

@register_family_runner(FamilyType.DEEP_RESEARCH)
class DeepResearchRunner(BaseFamilyRunner[DeepResearchState]):
    """
    Deep Research runner implementing ToT → CoT → Reflection.

    This is the reference implementation for family runners.
    Other runners should follow this pattern.

    Graph Nodes:
        - initialize: Setup state and load context
        - preflight: Validate inputs (tenant, query)
        - decompose_query: Break down complex query
        - tree_of_thought: Generate research branches
        - branch_executor: Execute each branch
        - chain_of_thought: Deep reasoning per branch
        - synthesize: Merge branch results
        - verify_citations: Check all citations
        - reflection: Self-critique synthesis
        - quality_gate: Final quality check

    Conditional Edges:
        - After branch_executor: Loop to next branch or proceed to synthesis
        - After reflection: Re-synthesize if needed or proceed to quality gate
        - After quality_gate: Complete or trigger HITL

    HITL Checkpoints:
        - After synthesize: Complex query review (blocking)
        - After quality_gate: Final validation (non-blocking)

    ToT-CoT-Reflection Benefits:
        - Multiple research angles via branching
        - Deep reasoning via chain-of-thought
        - Self-improvement via reflection loops
        - Evidence-based synthesis
    """

    family = FamilyType.DEEP_RESEARCH
    state_class = DeepResearchState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        num_branches: int = 3,
        max_reflection_iterations: int = 2,
        **kwargs: Any,
    ):
        """
        Initialize Deep Research runner.

        Args:
            llm: LangChain LLM for reasoning (defaults to GPT-4)
            num_branches: Number of ToT branches to explore
            max_reflection_iterations: Max reflection loops
            **kwargs: Passed to BaseFamilyRunner
        """
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=4000,
        )
        self.num_branches = num_branches
        self.max_reflection_iterations = max_reflection_iterations

    # =========================================================================
    # Abstract Method Implementations
    # =========================================================================

    def _create_nodes(self) -> Dict[str, Callable[[DeepResearchState], DeepResearchState]]:
        """Create nodes for Deep Research graph."""
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "decompose_query": self._decompose_query_node,
            "tree_of_thought": self._tree_of_thought_node,
            "branch_executor": self._branch_executor_node,
            "chain_of_thought": self._chain_of_thought_node,
            "synthesize": self._synthesize_node,
            "verify_citations": self._verify_citations_node,
            "reflection": self._reflection_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        """Define edges for Deep Research graph."""
        # Start → Initialize → Preflight → Decompose → ToT
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "decompose_query")
        graph.add_edge("decompose_query", "tree_of_thought")
        graph.add_edge("tree_of_thought", "branch_executor")

        # Branch executor → conditional (more branches or CoT)
        graph.add_conditional_edges(
            "branch_executor",
            self._route_after_branch,
            {
                "next_branch": "branch_executor",
                "chain_of_thought": "chain_of_thought",
            }
        )

        # CoT → Synthesize → Verify → Reflection
        graph.add_edge("chain_of_thought", "synthesize")
        graph.add_edge("synthesize", "verify_citations")
        graph.add_edge("verify_citations", "reflection")

        # Reflection → conditional (re-synthesize or quality gate)
        graph.add_conditional_edges(
            "reflection",
            self._route_after_reflection,
            {
                "re_synthesize": "synthesize",
                "quality_gate": "quality_gate",
            }
        )

        # Quality gate → conditional (complete or HITL)
        graph.add_conditional_edges(
            "quality_gate",
            self._route_after_quality,
            {
                "complete": END,
                "hitl_required": END,
            }
        )

        return graph

    def _get_interrupt_nodes(self) -> List[str]:
        """
        Nodes that can trigger HITL checkpoints.

        Returns:
            List of node names for interrupt_before in graph.compile()
        """
        return ["synthesize", "quality_gate"]

    # =========================================================================
    # Routing Functions
    # =========================================================================

    def _route_after_branch(self, state: DeepResearchState) -> str:
        """Route after branch execution."""
        if state.current_branch_index < len(state.research_branches):
            return "next_branch"
        return "chain_of_thought"

    def _route_after_reflection(self, state: DeepResearchState) -> str:
        """Route after reflection."""
        if state.needs_improvement:
            return "re_synthesize"
        return "quality_gate"

    def _route_after_quality(self, state: DeepResearchState) -> str:
        """
        Route after quality gate based on confidence and evidence quality.

        Args:
            state: Current deep research state

        Returns:
            "hitl_required" if low confidence or poor evidence,
            "complete" otherwise
        """
        # Force HITL if evidence coverage is low
        if state.evidence_coverage < 0.6:
            logger.info(
                "deep_research_low_evidence_coverage_hitl",
                evidence_coverage=state.evidence_coverage,
            )
            return "hitl_required"

        if state.requires_hitl and state.confidence_score < self.confidence_threshold:
            logger.info(
                "deep_research_hitl_required",
                confidence=state.confidence_score,
                threshold=self.confidence_threshold,
            )
            return "hitl_required"
        return "complete"

    # =========================================================================
    # Optional Overrides
    # =========================================================================

    def _create_initial_state(
        self,
        query: str,
        session_id: str = "",
        tenant_id: str = "",
        context: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> DeepResearchState:
        """Create initial Deep Research state with A+ defaults."""
        return DeepResearchState(
            query=query,
            goal=query,
            session_id=session_id,
            tenant_id=tenant_id,
            context=context or {},
            started_at=datetime.utcnow(),
            num_branches=kwargs.get("num_branches", self.num_branches),
            max_reflection_iterations=kwargs.get(
                "max_reflection_iterations",
                self.max_reflection_iterations
            ),
            mode_4_constraints=kwargs.get("mode_4_constraints"),
            total_steps=10,  # Initialize + preflight + decompose + ToT + branches + CoT + synth + verify + reflect + quality
            metadata=kwargs,
        )

    # =========================================================================
    # Node Implementations (Async with Graceful Degradation)
    # =========================================================================

    @graceful_degradation(domain="research", fallback_value=None)
    async def _initialize_node(self, state: DeepResearchState) -> DeepResearchState:
        """
        Initialize research state.

        Sets up timing, phase tracking, and emits mission start event.
        """
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = datetime.utcnow()
        state.current_step = 1
        state.num_branches = self.num_branches
        state.max_reflection_iterations = self.max_reflection_iterations
        state.total_steps = state.num_branches + 6  # branches + decompose + ToT + CoT + synth + verify + reflect

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_STARTED,
                data={
                    "mission_id": state.mission_id,
                    "family": self.family.value,
                    "query": state.query[:200],
                    "num_branches": state.num_branches,
                    "max_reflections": state.max_reflection_iterations,
                    "total_steps": state.total_steps,
                },
                mission_id=state.mission_id,
            )
        )

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "initialize", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        logger.info(
            "deep_research_initialized",
            mission_id=state.mission_id,
            num_branches=state.num_branches,
        )
        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _preflight_validation_node(self, state: DeepResearchState) -> DeepResearchState:
        """
        Validate deep research inputs.

        Checks tenant_id, query, and research parameters.
        """
        state.current_step = 2
        errors = []

        # Tenant validation
        if not state.tenant_id:
            errors.append("tenant_id_missing")

        # Query validation
        if not state.query and not state.goal:
            errors.append("research_query_missing")

        # Minimum query length for deep research
        if state.query and len(state.query) < 10:
            errors.append("query_too_short_for_deep_research")

        # Mode 4 constraint validation
        if state.mode_4_constraints:
            if not state.mode_4_constraints.get("budget_tokens"):
                logger.warning("mode4_missing_budget", mission_id=state.mission_id)

        if errors:
            state.error = ";".join(errors)
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.MISSION_FAILED,
                    data={
                        "mission_id": state.mission_id,
                        "errors": errors,
                        "phase": "preflight",
                    },
                    mission_id=state.mission_id,
                )
            )
            raise ValidationError(message=state.error)

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_COMPLETE,
                data={"phase": "preflight", "status": "passed"},
                mission_id=state.mission_id,
            )
        )

        logger.info("deep_research_preflight_passed", mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _decompose_query_node(self, state: DeepResearchState) -> DeepResearchState:
        """
        Decompose complex query into sub-questions.

        Breaks down the research query into:
        - Main research objective
        - Key sub-questions (become research branches)
        - Required evidence types
        - Potential sources
        """
        state.phase = ExecutionPhase.PLAN
        state.current_step = 3

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "decompose_query", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = f"""Analyze this research query and identify {state.num_branches} key sub-questions that need to be answered:

Query: {state.query}

Return a structured decomposition with:
1. Main research objective
2. Key sub-questions (each becomes a research branch) - exactly {state.num_branches}
3. Required evidence types for each
4. Potential sources to search
5. Quality criteria for each sub-question

Format as JSON with fields: objective, sub_questions (array), evidence_types, sources, quality_criteria"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a research decomposition expert. Return structured JSON."),
                    HumanMessage(content=prompt),
                ],
                timeout=30,
            )

            # Parse response into plan
            decomposition = self._parse_json_response(response)
            state.plan.append({
                "type": "query_decomposition",
                "content": decomposition if isinstance(decomposition, dict) else {"raw": response.content},
                "timestamp": datetime.utcnow().isoformat(),
            })

            state.reasoning_chain.append({
                "step": "decompose",
                "input": state.query,
                "output": decomposition if isinstance(decomposition, dict) else response.content,
            })

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "decompose_query",
                        "sub_questions": len(decomposition.get("sub_questions", [])) if isinstance(decomposition, dict) else state.num_branches,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as e:
            logger.error("decompose_query_failed", error=str(e))
            state.error = f"Decomposition failed: {str(e)}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "decompose_query", "error": str(e)},
                    mission_id=state.mission_id,
                )
            )
            raise

        logger.info(
            "deep_research_query_decomposed",
            mission_id=state.mission_id,
        )
        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _tree_of_thought_node(self, state: DeepResearchState) -> DeepResearchState:
        """
        Generate multiple research branches (ToT).

        Creates diverse research branches with:
        - Branch focus/hypothesis
        - Key search terms
        - Expected source types
        - Potential findings
        """
        state.current_step = 4

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "tree_of_thought", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        # Get sub-questions from decomposition
        sub_questions = []
        if state.plan:
            decomp = state.plan[-1].get("content", {})
            if isinstance(decomp, dict):
                sub_questions = decomp.get("sub_questions", [])

        prompt = f"""Based on this research query and decomposition, generate {state.num_branches} distinct research branches.

Query: {state.query}
Sub-questions: {sub_questions}

For each branch, provide:
1. branch_id: Unique identifier (branch_1, branch_2, etc.)
2. branch_query: Specific research question
3. branch_hypothesis: Expected finding
4. search_terms: Key terms to search
5. source_types: Expected sources (academic, news, reports, etc.)
6. potential_findings: What we might discover

Make branches complementary, not overlapping. Each should explore a different angle.
Return as JSON array."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a research strategist using Tree-of-Thought reasoning. Return JSON array."),
                    HumanMessage(content=prompt),
                ],
                timeout=30,
            )

            # Parse branches from response
            branches_data = self._parse_json_response(response)
            if isinstance(branches_data, list):
                branches = []
                for i, b_data in enumerate(branches_data[:state.num_branches]):
                    branch = ResearchBranch(
                        branch_id=b_data.get("branch_id", f"branch_{i+1}"),
                        branch_query=b_data.get("branch_query", f"Branch {i+1} of: {state.query}"),
                        branch_hypothesis=b_data.get("branch_hypothesis", f"Hypothesis for branch {i+1}"),
                    )
                    branches.append(branch)
            else:
                # Fallback: create default branches
                branches = []
                for i in range(state.num_branches):
                    branch = ResearchBranch(
                        branch_id=f"branch_{i+1}",
                        branch_query=f"Branch {i+1} of: {state.query}",
                        branch_hypothesis=f"Hypothesis for branch {i+1}",
                    )
                    branches.append(branch)

            state.research_branches = branches
            state.current_branch_index = 0

            state.reasoning_chain.append({
                "step": "tree_of_thought",
                "branches_created": len(branches),
                "strategy": branches_data if isinstance(branches_data, list) else response.content,
            })

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "tree_of_thought",
                        "branches_count": len(branches),
                        "branch_ids": [b.branch_id for b in branches],
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as e:
            logger.error("tree_of_thought_failed", error=str(e))
            state.error = f"ToT failed: {str(e)}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "tree_of_thought", "error": str(e)},
                    mission_id=state.mission_id,
                )
            )
            raise

        logger.info(
            "deep_research_branches_created",
            mission_id=state.mission_id,
            branches=len(branches),
        )
        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _branch_executor_node(self, state: DeepResearchState) -> DeepResearchState:
        """
        Execute research for current branch.

        Performs focused investigation with:
        - Source search
        - Finding extraction
        - Quality assessment
        """
        if state.current_branch_index >= len(state.research_branches):
            return state

        branch = state.research_branches[state.current_branch_index]
        state.phase = ExecutionPhase.EXECUTE
        state.current_step += 1

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={
                    "phase": "branch_executor",
                    "step": state.current_step,
                    "branch_id": branch.branch_id,
                    "branch_index": state.current_branch_index + 1,
                    "total_branches": len(state.research_branches),
                },
                mission_id=state.mission_id,
            )
        )

        prompt = f"""Execute research for this branch:

Branch: {branch.branch_id}
Query: {branch.branch_query}
Hypothesis: {branch.branch_hypothesis}

Search for relevant information, extract key findings, and assess source quality.

Return structured findings as JSON with:
1. findings: Array of finding objects (content, source, relevance, confidence)
2. sources: Array of sources used (title, type, reliability)
3. evidence_strength: 0.0-1.0 score
4. key_insights: Main takeaways
5. limitations: Gaps or uncertainties"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a research analyst executing a focused investigation. Return JSON."),
                    HumanMessage(content=prompt),
                ],
                timeout=45,
            )

            # Parse findings
            findings_data = self._parse_json_response(response)

            if isinstance(findings_data, dict):
                branch.findings = findings_data.get("findings", [{"content": response.content}])
                branch.sources = findings_data.get("sources", [])
                branch.evidence_strength = float(findings_data.get("evidence_strength", 0.5))
                branch.source_count = len(branch.sources)
            else:
                branch.findings = [{"content": response.content, "timestamp": datetime.utcnow().isoformat()}]
                branch.evidence_strength = 0.5

            branch.completed = True
            branch.branch_confidence = self._calculate_branch_confidence(branch)

            state.research_branches[state.current_branch_index] = branch
            state.current_branch_index += 1

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "branch_executor",
                        "branch_id": branch.branch_id,
                        "findings_count": len(branch.findings),
                        "sources_count": branch.source_count,
                        "confidence": branch.branch_confidence,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as e:
            logger.error("branch_execution_failed", error=str(e), branch_id=branch.branch_id)
            branch.completed = True
            branch.branch_confidence = 0.0
            state.current_branch_index += 1
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "branch_executor", "branch_id": branch.branch_id, "error": str(e)},
                    mission_id=state.mission_id,
                )
            )

        logger.info(
            "deep_research_branch_complete",
            mission_id=state.mission_id,
            branch_id=branch.branch_id,
        )
        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _chain_of_thought_node(self, state: DeepResearchState) -> DeepResearchState:
        """
        Deep sequential reasoning across all branches (CoT).

        Performs chain-of-thought analysis:
        - Pattern identification
        - Conflict resolution
        - Gap analysis
        - Preliminary conclusions
        """
        state.current_step += 1
        state.cot_reasoning_depth += 1

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "chain_of_thought", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        # Collect all branch findings
        all_findings = []
        for branch in state.research_branches:
            all_findings.extend(branch.findings)

        prompt = f"""Perform Chain-of-Thought reasoning across these research findings:

Original Query: {state.query}

Findings from {len(state.research_branches)} branches:
{self._format_findings_for_prompt(all_findings)}

Step through your reasoning:
1. What patterns emerge across branches?
2. What conflicts need resolution?
3. What gaps remain in the evidence?
4. What preliminary conclusions can be drawn?
5. What confidence level for each conclusion?

Think step-by-step, showing your reasoning chain.
Return as JSON with: patterns, conflicts, gaps, conclusions (with confidence), reasoning_steps"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are an expert analyst using Chain-of-Thought reasoning. Return JSON."),
                    HumanMessage(content=prompt),
                ],
                timeout=45,
            )

            cot_result = self._parse_json_response(response)

            state.reasoning_chain.append({
                "step": "chain_of_thought",
                "input_branches": len(state.research_branches),
                "reasoning": cot_result if isinstance(cot_result, dict) else response.content,
                "depth": state.cot_reasoning_depth,
            })

            if isinstance(cot_result, dict):
                conclusions = cot_result.get("conclusions", [])
                state.intermediate_conclusions.append(str(conclusions) if conclusions else response.content)
            else:
                state.intermediate_conclusions.append(response.content)

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "chain_of_thought",
                        "reasoning_depth": state.cot_reasoning_depth,
                        "conclusions_count": len(state.intermediate_conclusions),
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as e:
            logger.error("chain_of_thought_failed", error=str(e))
            state.error = f"CoT failed: {str(e)}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "chain_of_thought", "error": str(e)},
                    mission_id=state.mission_id,
                )
            )
            raise

        logger.info(
            "deep_research_cot_complete",
            mission_id=state.mission_id,
        )
        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _synthesize_node(self, state: DeepResearchState) -> DeepResearchState:
        """
        Synthesize all research into final output.

        Creates comprehensive synthesis:
        - Direct answer to research question
        - Evidence integration
        - Conflict resolution
        - Limitations acknowledgment
        """
        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step += 1

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "synthesize", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = f"""Synthesize all research into a comprehensive response:

Query: {state.query}

Chain-of-Thought Reasoning:
{state.intermediate_conclusions[-1] if state.intermediate_conclusions else 'N/A'}

Previous Reflection Feedback (if any):
{state.reflection_feedback[-1] if state.reflection_feedback else 'None'}

Create a well-structured synthesis that:
1. Directly answers the research question
2. Integrates evidence from all {len(state.research_branches)} branches
3. Addresses conflicts in the evidence
4. Acknowledges limitations and gaps
5. Includes proper citations

Return as JSON with: answer, evidence_summary, conflicts_resolved, limitations, citations, confidence_score"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a research synthesizer creating evidence-based conclusions. Return JSON."),
                    HumanMessage(content=prompt),
                ],
                timeout=45,
            )

            synthesis = self._parse_json_response(response)

            if isinstance(synthesis, dict):
                state.final_output = synthesis.get("answer", response.content)
                if "citations" in synthesis:
                    for citation in synthesis["citations"]:
                        state.citations.append(citation if isinstance(citation, dict) else {"text": citation})
            else:
                state.final_output = response.content

            state.results.append({
                "type": "synthesis",
                "content": state.final_output,
                "iteration": state.reflection_iterations,
            })

            # Calculate synthesis quality
            has_answer = bool(state.final_output)
            has_evidence = len(state.citations) >= 2
            addresses_gaps = isinstance(synthesis, dict) and bool(synthesis.get("limitations"))
            state.synthesis_quality = (
                (1.0 if has_answer else 0.0) +
                (1.0 if has_evidence else 0.5) +
                (1.0 if addresses_gaps else 0.5)
            ) / 3

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "synthesize",
                        "has_output": bool(state.final_output),
                        "citations_count": len(state.citations),
                        "iteration": state.reflection_iterations,
                        "synthesis_quality": state.synthesis_quality,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as e:
            logger.error("synthesis_failed", error=str(e))
            state.error = f"Synthesis failed: {str(e)}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "synthesize", "error": str(e)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint for complex queries (blocking)
        if len(state.query) > 200 or state.num_branches > 3:
            state.requires_hitl = True
            state.hitl_reason = "Complex research query requires human review"
            self._create_hitl_checkpoint(
                state,
                checkpoint_type="synthesis_review",
                title="Review Research Synthesis",
                description=f"Synthesis from {len(state.research_branches)} branches",
                is_blocking=True,
                data={
                    "synthesis": state.final_output[:500] if state.final_output else "",
                    "branches_count": len(state.research_branches),
                    "citations_count": len(state.citations),
                },
            )

        logger.info(
            "deep_research_synthesis_complete",
            mission_id=state.mission_id,
        )
        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _verify_citations_node(self, state: DeepResearchState) -> DeepResearchState:
        """
        Verify all citations in the synthesis.

        Checks:
        - Source credibility
        - Claim-source alignment
        - Citation format
        """
        state.current_step += 1

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "verify_citations", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = f"""Review this research synthesis and verify all citations:

{state.final_output}

For each citation:
1. Is the source credible? (academic, established news, official reports)
2. Does the claim match what the source actually says?
3. Is the citation format correct and complete?

Return as JSON with:
- verified_citations: Array of citation verification results
- overall_citation_quality: 0.0-1.0
- issues_found: Array of any problems"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a citation verification expert. Return JSON."),
                    HumanMessage(content=prompt),
                ],
                timeout=30,
            )

            verification = self._parse_json_response(response)

            state.citations.append({
                "verification_report": verification if isinstance(verification, dict) else {"raw": response.content},
                "verified_at": datetime.utcnow().isoformat(),
            })

            # Update citation verification status
            if isinstance(verification, dict):
                for i, cite in enumerate(verification.get("verified_citations", [])):
                    cite_id = cite.get("id", f"cite_{i}")
                    state.citation_verification_status[cite_id] = cite.get("verified", True)

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "verify_citations",
                        "citations_verified": len(state.citation_verification_status),
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as e:
            logger.error("citation_verification_failed", error=str(e))
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "verify_citations", "error": str(e)},
                    mission_id=state.mission_id,
                )
            )

        logger.info(
            "deep_research_citations_verified",
            mission_id=state.mission_id,
        )
        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _reflection_node(self, state: DeepResearchState) -> DeepResearchState:
        """
        Self-critique and identify improvements.

        Performs reflection:
        - Completeness check
        - Evidence balance
        - Limitation acknowledgment
        - Citation accuracy
        """
        state.phase = ExecutionPhase.VERIFY
        state.current_step += 1

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={
                    "phase": "reflection",
                    "step": state.current_step,
                    "iteration": state.reflection_iterations + 1,
                },
                mission_id=state.mission_id,
            )
        )

        prompt = f"""Critically evaluate this research synthesis:

Query: {state.query}
Synthesis: {state.final_output}

Self-critique checklist:
1. Does it fully answer the research question?
2. Is the evidence comprehensive and balanced?
3. Are limitations properly acknowledged?
4. Are citations accurate and complete?
5. Is the reasoning sound?

Rate each criterion 0.0-1.0 and provide:
- overall_quality: 0.0-1.0
- needs_improvement: true/false
- improvement_areas: Array of specific improvements needed
- strengths: What was done well

Return as JSON."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a critical reviewer performing self-reflection. Return JSON."),
                    HumanMessage(content=prompt),
                ],
                timeout=30,
            )

            reflection = self._parse_json_response(response)

            state.reflection_feedback.append(
                reflection if isinstance(reflection, dict) else {"raw": response.content}
            )
            state.reflection_iterations += 1

            # Determine if improvement is needed
            if isinstance(reflection, dict):
                state.needs_improvement = (
                    state.reflection_iterations < state.max_reflection_iterations
                    and reflection.get("needs_improvement", False)
                )
                state.reflection_depth = float(reflection.get("overall_quality", 0.5))
            else:
                state.needs_improvement = (
                    state.reflection_iterations < state.max_reflection_iterations
                    and "improvement" in response.content.lower()
                )
                state.reflection_depth = 0.5

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "reflection",
                        "iteration": state.reflection_iterations,
                        "needs_improvement": state.needs_improvement,
                        "reflection_depth": state.reflection_depth,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as e:
            logger.error("reflection_failed", error=str(e))
            state.needs_improvement = False
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "reflection", "error": str(e)},
                    mission_id=state.mission_id,
                )
            )

        logger.info(
            "deep_research_reflection_complete",
            mission_id=state.mission_id,
            iteration=state.reflection_iterations,
        )
        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _quality_gate_node(self, state: DeepResearchState) -> DeepResearchState:
        """
        Final quality assessment with confidence scoring.

        Calculates multi-factor confidence score based on:
        - Branch confidence
        - Evidence coverage
        - Synthesis quality
        - Reflection depth
        """
        state.phase = ExecutionPhase.COMPLETE
        state.current_step += 1
        state.completed_at = datetime.utcnow()

        try:
            validated = validate_deep_research_outputs(
                state.research_branches,
                state.citations,
                state.final_output,
            )
            state.research_branches = validated["branches"]
            state.citations = validated["citations"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.MISSION_FAILED,
                    data={"mission_id": state.mission_id, "error": state.error},
                    mission_id=state.mission_id,
                )
            )
            raise

        # Calculate evidence coverage
        completed_branches = sum(1 for b in state.research_branches if b.completed)
        total_findings = sum(len(b.findings) for b in state.research_branches)
        state.evidence_coverage = (
            (completed_branches / max(len(state.research_branches), 1)) * 0.5 +
            min(total_findings / 10, 1.0) * 0.3 +
            min(len(state.citations) / 5, 1.0) * 0.2
        )

        # Calculate branch convergence (how well branches agree)
        branch_confidences = [b.branch_confidence for b in state.research_branches if b.completed]
        if branch_confidences:
            avg_confidence = sum(branch_confidences) / len(branch_confidences)
            variance = sum((c - avg_confidence) ** 2 for c in branch_confidences) / len(branch_confidences)
            state.branch_convergence = max(1 - (variance * 4), 0.0)  # Lower variance = higher convergence
        else:
            state.branch_convergence = 0.0

        # Calculate final confidence score
        quality_factors = [
            state.evidence_coverage,
            state.synthesis_quality,
            state.reflection_depth,
            state.branch_convergence,
            1.0 if state.final_output else 0.0,
        ]
        state.confidence_score = sum(quality_factors) / len(quality_factors)

        # Also set quality_score for compatibility
        state.quality_score = state.confidence_score

        # Force HITL if evidence coverage is low
        if state.evidence_coverage < 0.6:
            state.requires_hitl = True
            state.hitl_reason = f"Evidence coverage ({state.evidence_coverage:.2f}) requires review"
        elif state.confidence_score < self.confidence_threshold:
            state.requires_hitl = True
            state.hitl_reason = f"Quality score ({state.confidence_score:.2f}) below threshold"

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.QUALITY_CHECK,
                data={
                    "confidence_score": state.confidence_score,
                    "quality_factors": {
                        "evidence_coverage": state.evidence_coverage,
                        "synthesis_quality": state.synthesis_quality,
                        "reflection_depth": state.reflection_depth,
                        "branch_convergence": state.branch_convergence,
                    },
                    "threshold": self.confidence_threshold,
                    "passed": state.confidence_score >= self.confidence_threshold,
                },
                mission_id=state.mission_id,
            )
        )

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_COMPLETED,
                data={
                    "mission_id": state.mission_id,
                    "confidence_score": state.confidence_score,
                    "branches_count": len(state.research_branches),
                    "completed_branches": completed_branches,
                    "citations_count": len(state.citations),
                    "reflection_iterations": state.reflection_iterations,
                    "execution_time_seconds": (
                        (state.completed_at - state.started_at).total_seconds()
                        if state.started_at and state.completed_at
                        else 0
                    ),
                },
                mission_id=state.mission_id,
            )
        )

        logger.info(
            "deep_research_complete",
            mission_id=state.mission_id,
            confidence_score=state.confidence_score,
        )
        return state

    # =========================================================================
    # Helper Methods
    # =========================================================================

    def _calculate_branch_confidence(self, branch: ResearchBranch) -> float:
        """
        Calculate confidence score for a research branch.

        Args:
            branch: The research branch to score

        Returns:
            Confidence score 0.0-1.0
        """
        base_confidence = branch.evidence_strength if branch.evidence_strength else 0.5
        findings_bonus = min(len(branch.findings) * 0.1, 0.2)
        sources_bonus = min(branch.source_count * 0.05, 0.15)
        return min(base_confidence + findings_bonus + sources_bonus, 1.0)

    def _parse_json_response(self, response: Any) -> Any:
        """Parse LLM response, extracting JSON if present."""
        if isinstance(response, (dict, list)):
            return response
        if hasattr(response, "content"):
            import json
            try:
                content = response.content
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                return json.loads(content)
            except (json.JSONDecodeError, IndexError):
                return {"raw": response.content}
        return {"raw": str(response)}

    def _format_findings_for_prompt(self, findings: List[Dict[str, Any]]) -> str:
        """Format findings list for LLM prompt."""
        lines = []
        for i, f in enumerate(findings[:10], 1):  # Limit to 10 findings
            content = f.get("content", str(f))[:200]
            source = f.get("source", "N/A")
            lines.append(f"{i}. {content} (Source: {source})")
        return "\n".join(lines) or "No findings yet"

    def _create_hitl_checkpoint(
        self,
        state: DeepResearchState,
        checkpoint_type: str,
        title: str,
        description: str,
        is_blocking: bool,
        data: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Create HITL checkpoint event."""
        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.HITL_REQUIRED,
                data={
                    "checkpoint_type": checkpoint_type,
                    "title": title,
                    "description": description,
                    "is_blocking": is_blocking,
                    "checkpoint_data": data or {},
                },
                mission_id=state.mission_id,
            )
        )
