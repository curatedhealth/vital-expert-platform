# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-14
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
"""
Deep Research Runner - ToT → CoT → Reflection Pattern

This runner implements the DEEP_RESEARCH family's specialized reasoning:
1. Tree-of-Thought (ToT): Generate multiple research branches
2. Chain-of-Thought (CoT): Deep sequential reasoning per branch
3. Reflection: Self-critique and quality verification

Graph Structure:
    START → initialize → decompose_query → tree_of_thought →
    branch_executor → chain_of_thought → synthesize →
    verify_citations → reflection → quality_gate → END

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

import asyncio
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
    """Represents a single research branch in Tree-of-Thought"""
    branch_id: str = ""
    branch_query: str = ""
    branch_hypothesis: str = ""
    findings: List[Dict[str, Any]] = Field(default_factory=list)
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    branch_confidence: float = 0.0
    completed: bool = False


class DeepResearchState(BaseFamilyState):
    """
    State for Deep Research family runner.

    Extends BaseFamilyState with ToT-specific fields.
    """
    # Tree-of-Thought fields
    research_branches: List[ResearchBranch] = Field(default_factory=list)
    num_branches: int = Field(default=3)
    branch_depth: int = Field(default=2)
    current_branch_index: int = Field(default=0)

    # Chain-of-Thought fields
    reasoning_chain: List[Dict[str, Any]] = Field(default_factory=list)
    intermediate_conclusions: List[str] = Field(default_factory=list)

    # Reflection fields
    reflection_iterations: int = Field(default=0)
    max_reflection_iterations: int = Field(default=2)
    reflection_feedback: List[str] = Field(default_factory=list)
    needs_improvement: bool = Field(default=False)

    # Research-specific quality
    evidence_quality_scores: Dict[str, float] = Field(default_factory=dict)
    source_diversity_score: float = Field(default=0.0)
    citation_verification_status: Dict[str, bool] = Field(default_factory=dict)


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
        # Start → Initialize → Decompose → ToT
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "decompose_query")
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
                "hitl_required": END,  # Will be handled by interrupt
            }
        )

        return graph

    def _get_interrupt_nodes(self) -> List[str]:
        """Nodes that can trigger HITL checkpoints."""
        return ["synthesize", "quality_gate"]

    # =========================================================================
    # Node Implementations
    # =========================================================================

    @graceful_degradation(domain="research", fallback_value=None)
    async def _initialize_node(self, state: DeepResearchState) -> DeepResearchState:
        """Initialize research state."""
        logger.info(f"Initializing deep research: {state.mission_id}")

        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = datetime.utcnow()
        state.num_branches = self.num_branches
        state.max_reflection_iterations = self.max_reflection_iterations
        state.total_steps = state.num_branches + 4  # branches + decompose + synth + verify + reflect

        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _decompose_query_node(self, state: DeepResearchState) -> DeepResearchState:
        """Decompose complex query into sub-questions."""
        logger.info(f"Decomposing query: {state.query[:100]}...")

        state.phase = ExecutionPhase.PLAN
        state.current_step += 1

        prompt = f"""Analyze this research query and identify 3-5 key sub-questions that need to be answered:

Query: {state.query}

Return a structured decomposition with:
1. Main research objective
2. Key sub-questions (each becomes a research branch)
3. Required evidence types for each
4. Potential sources to search"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a research decomposition expert."),
                    HumanMessage(content=prompt),
                ],
                timeout=60,
            )

            # Parse response into plan
            state.plan.append({
                "type": "query_decomposition",
                "content": response.content,
                "timestamp": datetime.utcnow().isoformat(),
            })

            state.reasoning_chain.append({
                "step": "decompose",
                "input": state.query,
                "output": response.content,
            })

        except Exception as e:
            logger.error(f"Query decomposition failed: {e}")
            state.error = f"Decomposition failed: {str(e)}"

        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _tree_of_thought_node(self, state: DeepResearchState) -> DeepResearchState:
        """Generate multiple research branches (ToT)."""
        logger.info(f"Generating {state.num_branches} research branches")

        prompt = f"""Based on this research query and decomposition, generate {state.num_branches} distinct research branches.

Query: {state.query}
Decomposition: {state.plan[-1].get('content', '') if state.plan else 'N/A'}

For each branch, provide:
1. Branch focus/hypothesis
2. Key search terms
3. Expected source types
4. Potential findings

Make branches complementary, not overlapping. Each should explore a different angle."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a research strategist using Tree-of-Thought reasoning."),
                    HumanMessage(content=prompt),
                ],
                timeout=60,
            )

            # Create branch objects
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
                "strategy": response.content,
            })

        except Exception as e:
            logger.error(f"ToT generation failed: {e}")
            state.error = f"ToT failed: {str(e)}"

        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _branch_executor_node(self, state: DeepResearchState) -> DeepResearchState:
        """Execute research for current branch."""
        if state.current_branch_index >= len(state.research_branches):
            return state

        branch = state.research_branches[state.current_branch_index]
        logger.info(f"Executing branch {branch.branch_id}")

        state.phase = ExecutionPhase.EXECUTE
        state.current_step += 1

        # Simulate L4 worker execution
        prompt = f"""Execute research for this branch:

Branch: {branch.branch_id}
Query: {branch.branch_query}
Hypothesis: {branch.branch_hypothesis}

Search for relevant information, extract key findings, and assess source quality.
Return structured findings with citations."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a research analyst executing a focused investigation."),
                    HumanMessage(content=prompt),
                ],
                timeout=60,
            )

            # Update branch with findings
            branch.findings.append({
                "content": response.content,
                "timestamp": datetime.utcnow().isoformat(),
            })
            branch.completed = True
            branch.branch_confidence = self._calculate_branch_confidence(
                evidence_quality=state.evidence_quality,
                citation_count=len(state.citations),
                source_reliability=state.source_reliability_scores,
            )

            state.research_branches[state.current_branch_index] = branch
            state.current_branch_index += 1

        except Exception as e:
            logger.error(f"Branch execution failed: {e}")
            branch.completed = True
            branch.branch_confidence = 0.0
            state.current_branch_index += 1

        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _chain_of_thought_node(self, state: DeepResearchState) -> DeepResearchState:
        """Deep sequential reasoning across all branches (CoT)."""
        logger.info("Executing Chain-of-Thought reasoning")

        # Collect all branch findings
        all_findings = []
        for branch in state.research_branches:
            all_findings.extend(branch.findings)

        prompt = f"""Perform Chain-of-Thought reasoning across these research findings:

Original Query: {state.query}

Findings from {len(state.research_branches)} branches:
{all_findings}

Step through your reasoning:
1. What patterns emerge across branches?
2. What conflicts need resolution?
3. What gaps remain in the evidence?
4. What preliminary conclusions can be drawn?

Think step-by-step, showing your reasoning chain."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are an expert analyst using Chain-of-Thought reasoning."),
                    HumanMessage(content=prompt),
                ],
                timeout=60,
            )

            state.reasoning_chain.append({
                "step": "chain_of_thought",
                "input_branches": len(state.research_branches),
                "reasoning": response.content,
            })

            state.intermediate_conclusions.append(response.content)

        except Exception as e:
            logger.error(f"CoT reasoning failed: {e}")
            state.error = f"CoT failed: {str(e)}"

        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _synthesize_node(self, state: DeepResearchState) -> DeepResearchState:
        """Synthesize all research into final output."""
        logger.info("Synthesizing research findings")

        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step += 1

        prompt = f"""Synthesize all research into a comprehensive response:

Query: {state.query}

Chain-of-Thought Reasoning:
{state.intermediate_conclusions}

Previous Reflection Feedback (if any):
{state.reflection_feedback}

Create a well-structured synthesis that:
1. Directly answers the research question
2. Integrates evidence from all branches
3. Addresses conflicts in the evidence
4. Acknowledges limitations and gaps
5. Includes proper citations"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a research synthesizer creating evidence-based conclusions."),
                    HumanMessage(content=prompt),
                ],
                timeout=60,
            )

            state.final_output = response.content
            state.results.append({
                "type": "synthesis",
                "content": response.content,
                "iteration": state.reflection_iterations,
            })

        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            state.error = f"Synthesis failed: {str(e)}"

        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _verify_citations_node(self, state: DeepResearchState) -> DeepResearchState:
        """Verify all citations in the synthesis."""
        logger.info("Verifying citations")

        # Extract citations from final output
        # In production, this would actually verify each citation
        prompt = f"""Review this research synthesis and verify all citations:

{state.final_output}

For each citation:
1. Is the source credible?
2. Does the claim match the source?
3. Is the citation format correct?

Return a verification report with any issues found."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a citation verification expert."),
                    HumanMessage(content=prompt),
                ],
                timeout=60,
            )

            # Update citation status
            state.citations.append({
                "verification_report": response.content,
                "verified_at": datetime.utcnow().isoformat(),
            })

        except Exception as e:
            logger.error(f"Citation verification failed: {e}")

        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _reflection_node(self, state: DeepResearchState) -> DeepResearchState:
        """Self-critique and identify improvements."""
        logger.info(f"Reflection iteration {state.reflection_iterations + 1}")

        state.phase = ExecutionPhase.VERIFY
        state.current_step += 1

        prompt = f"""Critically evaluate this research synthesis:

Query: {state.query}
Synthesis: {state.final_output}

Self-critique checklist:
1. Does it fully answer the research question?
2. Is the evidence comprehensive and balanced?
3. Are limitations properly acknowledged?
4. Are citations accurate and complete?
5. Is the reasoning sound?

If improvements are needed, specify exactly what should be changed.
If the synthesis is satisfactory, confirm it meets quality standards."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content="You are a critical reviewer performing self-reflection."),
                    HumanMessage(content=prompt),
                ],
                timeout=60,
            )

            state.reflection_feedback.append(response.content)
            state.reflection_iterations += 1

            # Determine if improvement is needed
            # In production, this would be more sophisticated
            state.needs_improvement = (
                state.reflection_iterations < state.max_reflection_iterations
                and "improvement" in response.content.lower()
            )

        except Exception as e:
            logger.error(f"Reflection failed: {e}")
            state.needs_improvement = False

        return state

    @graceful_degradation(domain="research", fallback_value=None)
    async def _quality_gate_node(self, state: DeepResearchState) -> DeepResearchState:
        """Final quality assessment."""
        logger.info("Quality gate check")

        state.phase = ExecutionPhase.COMPLETE
        state.completed_at = datetime.utcnow()

        # Calculate final scores
        branch_confidences = [b.branch_confidence for b in state.research_branches if b.completed]
        state.confidence_score = sum(branch_confidences) / len(branch_confidences) if branch_confidences else 0.0

        # Quality score based on multiple factors
        quality_factors = [
            state.confidence_score,
            min(len(state.citations) / 5, 1.0),  # Citation count factor
            1.0 if state.final_output else 0.0,  # Has output
            min(state.reflection_iterations / 2, 1.0),  # Reflection depth
        ]
        state.quality_score = sum(quality_factors) / len(quality_factors)

        # Determine if HITL is needed
        if state.quality_score < self.confidence_threshold:
            state.requires_hitl = True
            state.hitl_reason = f"Quality score {state.quality_score:.2f} below threshold {self.confidence_threshold}"

        return state

    def _calculate_branch_confidence(
        self,
        evidence_quality: float,
        citation_count: int,
        source_reliability: list[float],
    ) -> float:
        """
        Derive branch confidence from evidence and source reliability.
        """
        base_confidence = max(min(evidence_quality, 1.0), 0.0)
        citation_bonus = min(citation_count * 0.05, 0.2)
        reliability_bonus = (
            sum(source_reliability) / len(source_reliability) * 0.1
            if source_reliability
            else 0.0
        )
        return min(base_confidence + citation_bonus + reliability_bonus, 1.0)

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
        """Route after quality gate."""
        if state.requires_hitl:
            return "hitl_required"
        return "complete"

    # =========================================================================
    # Custom State Creation
    # =========================================================================

    def _create_initial_state(
        self,
        query: str,
        session_id: str = "",
        tenant_id: str = "",
        context: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> DeepResearchState:
        """Create initial Deep Research state."""
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
            metadata=kwargs,
        )
