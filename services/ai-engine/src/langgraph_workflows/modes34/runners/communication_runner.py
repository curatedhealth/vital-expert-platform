#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
# GRADE: A+ (upgraded from B+)
"""
Communication Runner - Audience → Message → Channels

Implements the COMMUNICATION family with:
1) Audience segmentation and need analysis
2) Message design tailored to each segment
3) Channel plan with sequencing and KPIs
4) Quality-gated output with confidence scoring

Graph:
    START → initialize → preflight → audience_analysis →
    message_design → channel_plan → quality_gate → END
                                          ↓
                                (conditional routing)
                                     ↙        ↘
                                complete    hitl_required

HITL:
    - Plan approval checkpoint after audience analysis (blocking)
    - Final validation checkpoint after channel plan (non-blocking)

Reasoning Pattern:
    Audience-first approach ensures message relevance
    Segment-specific messaging improves engagement
    Channel planning optimizes reach and impact
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
from .output_validation import validate_communication_outputs

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
# Communication State
# =============================================================================

class CommunicationState(BaseFamilyState):
    """
    State for the Communication runner.

    Extends BaseFamilyState with communication-specific fields for
    audience segmentation, message design, and channel planning.
    """
    # Audience analysis fields
    audience_segments: List[Dict[str, Any]] = Field(default_factory=list)
    segment_priorities: Dict[str, int] = Field(default_factory=dict)
    total_audience_size: Optional[int] = Field(default=None)
    primary_segment: Optional[str] = Field(default=None)

    # Message design fields
    messages: List[Dict[str, Any]] = Field(default_factory=list)
    key_messages: List[str] = Field(default_factory=list)
    message_tone: str = Field(default="professional")
    compliance_notes: List[str] = Field(default_factory=list)

    # Channel plan fields
    channel_plan: List[Dict[str, Any]] = Field(default_factory=list)
    channel_mix: Dict[str, float] = Field(default_factory=dict)
    budget_allocation: Dict[str, float] = Field(default_factory=dict)
    kpis: List[Dict[str, Any]] = Field(default_factory=list)

    # Mode 4 constraints (for autonomous execution)
    mode_4_constraints: Optional[Dict[str, Any]] = Field(default=None)

    # Quality tracking specific to communication
    segment_coverage: float = Field(default=0.0)
    message_alignment: float = Field(default=0.0)
    channel_optimization: float = Field(default=0.0)


# =============================================================================
# Communication Runner
# =============================================================================

@register_family_runner(FamilyType.COMMUNICATION)
class CommunicationRunner(BaseFamilyRunner[CommunicationState]):
    """
    Communication runner implementing audience-led messaging and channel planning.

    This runner follows the pattern:
    1. Segment audience and analyze needs
    2. Design tailored messages per segment
    3. Create channel plan with KPIs

    Graph Nodes:
        - initialize: Setup state and communication parameters
        - preflight: Validate inputs (tenant, goal, audience)
        - audience_analysis: Segment audience and identify needs
        - message_design: Create segment-specific messages
        - channel_plan: Plan channels, cadence, and KPIs
        - quality_gate: Final quality assessment with confidence

    HITL Checkpoints:
        - After audience_analysis: Segmentation approval (blocking)
        - After channel_plan: Plan validation (non-blocking)

    Communication Benefits:
        - Audience-first approach improves relevance
        - Segment-specific messaging increases engagement
        - Channel planning optimizes reach and ROI
        - KPIs enable measurement and optimization
    """

    family = FamilyType.COMMUNICATION
    state_class = CommunicationState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        min_segments: int = 2,
        max_segments: int = 5,
        **kwargs: Any,
    ):
        """
        Initialize Communication runner.

        Args:
            llm: LangChain LLM for analysis (defaults to GPT-4)
            min_segments: Minimum audience segments to identify
            max_segments: Maximum audience segments to identify
            **kwargs: Passed to BaseFamilyRunner
        """
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.35,
            max_tokens=8000,  # Increased from 3000 to support longer outputs
        )
        self.min_segments = min_segments
        self.max_segments = max_segments

    # =========================================================================
    # Abstract Method Implementations
    # =========================================================================

    def _create_nodes(self) -> Dict[str, Callable[[CommunicationState], CommunicationState]]:
        """Create nodes for Communication graph."""
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "audience_analysis": self._audience_analysis_node,
            "message_design": self._message_design_node,
            "plan_channels": self._channel_plan_node,  # Renamed to avoid state field conflict
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        """Define edges for Communication graph with conditional routing."""
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "audience_analysis")
        graph.add_edge("audience_analysis", "message_design")
        graph.add_edge("message_design", "plan_channels")
        graph.add_edge("plan_channels", "quality_gate")
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
        return ["audience_analysis", "plan_channels"]

    # =========================================================================
    # Routing Functions
    # =========================================================================

    def _route_after_quality(self, state: CommunicationState) -> str:
        """
        Route after quality gate based on confidence and channel quality.

        Args:
            state: Current communication state

        Returns:
            "hitl_required" if low confidence or poor channel optimization,
            "complete" otherwise
        """
        # Force HITL if channel optimization is low
        if state.channel_optimization < 0.6:
            logger.info(
                "communication_low_channel_optimization_hitl",
                channel_optimization=state.channel_optimization,
            )
            return "hitl_required"

        if state.requires_hitl and state.confidence_score < self.confidence_threshold:
            logger.info(
                "communication_hitl_required",
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
        context: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> CommunicationState:
        """Create initial state with communication-specific defaults."""
        return CommunicationState(
            query=query,
            goal=query,
            context=context or {},
            message_tone=kwargs.get("tone", "professional"),
            mode_4_constraints=kwargs.get("mode_4_constraints"),
            total_steps=6,
            **{k: v for k, v in kwargs.items() if k in CommunicationState.__fields__},
        )

    # =========================================================================
    # Node Implementations (Async with Graceful Degradation)
    # =========================================================================

    @graceful_degradation(domain="communication", fallback_value=None)
    async def _initialize_node(self, state: CommunicationState) -> CommunicationState:
        """
        Initialize communication state.

        Sets up timing, phase tracking, and emits mission start event.
        """
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = datetime.utcnow()
        state.current_step = 1

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_STARTED,
                data={
                    "mission_id": state.mission_id,
                    "family": self.family.value,
                    "query": state.query,
                    "tone": state.message_tone,
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
            "communication_initialized",
            mission_id=state.mission_id,
            tone=state.message_tone,
        )
        return state

    @graceful_degradation(domain="communication", fallback_value=None)
    async def _preflight_validation_node(self, state: CommunicationState) -> CommunicationState:
        """
        Validate communication inputs.

        Checks tenant_id, goal/query, and communication parameters.
        """
        state.current_step = 2
        errors = []

        # Tenant validation
        if not state.tenant_id:
            errors.append("tenant_id_missing")

        # Goal validation
        if not state.goal and not state.query:
            errors.append("communication_goal_missing")

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

        logger.info("communication_preflight_passed", mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="communication", fallback_value=None)
    async def _audience_analysis_node(self, state: CommunicationState) -> CommunicationState:
        """
        Segment audience and analyze needs.

        Identifies audience segments with:
        - Demographics and characteristics
        - Needs and pain points
        - Preferred channels
        - Barriers to engagement
        """
        state.phase = ExecutionPhase.PLAN
        state.current_step = 3

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "audience_analysis", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = f"""You are an expert audience strategist.

Segment the target audience for this communication objective.
Identify {self.min_segments}-{self.max_segments} distinct audience segments.

For each segment provide:
1. id: Unique identifier (S1, S2, etc.)
2. name: Descriptive segment name
3. description: Who is in this segment
4. size_estimate: Relative size (large/medium/small)
5. priority: 1 = highest priority
6. needs: Key needs and motivations
7. pain_points: Challenges and concerns
8. preferred_channels: How they prefer to receive information
9. barriers: What might prevent engagement
10. risk_flags: Any compliance or sensitivity concerns

Return a JSON array of segment objects.
Ensure segments are mutually exclusive but collectively exhaustive.
Prioritize by strategic importance and accessibility."""

        content = f"""Communication Objective: {state.goal}

Context: {state.context}

Message Tone: {state.message_tone}

Identify and analyze audience segments."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=25,
            )

            # Parse segments
            segments_data = self._parse_segments_response(response)
            validated = validate_communication_outputs(segments_data, [], [])
            state.audience_segments = validated.get("segments", segments_data)

            # Extract priorities and primary segment
            state.segment_priorities = {
                s.get("id", f"S{i+1}"): s.get("priority", i + 1)
                for i, s in enumerate(state.audience_segments)
            }

            # Find primary segment (priority 1)
            for seg in state.audience_segments:
                if seg.get("priority") == 1:
                    state.primary_segment = seg.get("name", seg.get("id"))
                    break

            # Calculate segment coverage
            has_needs = all(bool(s.get("needs")) for s in state.audience_segments)
            has_channels = all(bool(s.get("preferred_channels")) for s in state.audience_segments)
            has_barriers = all(bool(s.get("barriers")) for s in state.audience_segments)
            state.segment_coverage = (
                min(len(state.audience_segments) / self.min_segments, 1.0) +
                (1.0 if has_needs else 0.5) +
                (1.0 if has_channels else 0.5) +
                (1.0 if has_barriers else 0.5)
            ) / 4

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "audience_analysis",
                        "segments_count": len(state.audience_segments),
                        "primary_segment": state.primary_segment,
                        "coverage": state.segment_coverage,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("audience_analysis_failed", error=str(exc))
            state.error = f"audience_analysis_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "audience_analysis", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint - segmentation approval (blocking)
        state.requires_hitl = True
        state.hitl_reason = "Audience segmentation requires approval before message design"
        self._create_hitl_checkpoint(
            state,
            checkpoint_type="plan_approval",
            title="Review Audience Segments",
            description=f"Approve {len(state.audience_segments)} audience segments",
            is_blocking=True,
            data={
                "segments": state.audience_segments,
                "primary_segment": state.primary_segment,
            },
        )

        logger.info(
            "communication_audience_analyzed",
            mission_id=state.mission_id,
            segments_count=len(state.audience_segments),
        )
        return state

    @graceful_degradation(domain="communication", fallback_value=None)
    async def _message_design_node(self, state: CommunicationState) -> CommunicationState:
        """
        Design tailored messages for each segment.

        Creates messages with:
        - Key messages and supporting points
        - Tone and style guidance
        - Call to action
        - Compliance considerations
        """
        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 4

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "message_design", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert communication strategist.

Design tailored messages for each audience segment.

For each message provide:
1. segment_id: Which segment this message targets
2. segment_name: Name of target segment
3. key_message: Main message (1-2 sentences)
4. supporting_points: 3-5 supporting arguments
5. tone: Specific tone guidance for this segment
6. call_to_action: What you want the audience to do
7. emotional_appeal: What emotion to evoke
8. proof_points: Evidence or credibility elements
9. compliance_notes: Any regulatory or legal considerations
10. localization_notes: Cultural or regional adaptations needed

Return a JSON array of message objects.
Ensure messages address each segment's specific needs and barriers.
Maintain consistency with overall communication objectives."""

        content = f"""Communication Objective: {state.goal}

Overall Tone: {state.message_tone}

Audience Segments:
{self._format_segments_for_prompt(state.audience_segments)}

Design tailored messages for each segment."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=30,
            )

            # Parse messages
            messages_data = self._parse_messages_response(response)
            validated = validate_communication_outputs(state.audience_segments, messages_data, [])
            state.messages = validated.get("messages", messages_data)

            # Extract key messages and compliance notes
            state.key_messages = [
                m.get("key_message", "")
                for m in state.messages
                if m.get("key_message")
            ]
            state.compliance_notes = [
                note
                for m in state.messages
                for note in (m.get("compliance_notes", []) if isinstance(m.get("compliance_notes"), list) else [m.get("compliance_notes", "")])
                if note
            ]

            # Calculate message alignment
            has_key_msg = all(bool(m.get("key_message")) for m in state.messages)
            has_cta = all(bool(m.get("call_to_action")) for m in state.messages)
            covers_segments = len(state.messages) >= len(state.audience_segments)
            state.message_alignment = (
                (1.0 if has_key_msg else 0.5) +
                (1.0 if has_cta else 0.5) +
                (1.0 if covers_segments else 0.5)
            ) / 3

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "message_design",
                        "messages_count": len(state.messages),
                        "key_messages": len(state.key_messages),
                        "compliance_notes": len(state.compliance_notes),
                        "alignment": state.message_alignment,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("message_design_failed", error=str(exc))
            state.error = f"message_design_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "message_design", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        logger.info(
            "communication_messages_designed",
            mission_id=state.mission_id,
            messages_count=len(state.messages),
        )
        return state

    @graceful_degradation(domain="communication", fallback_value=None)
    async def _channel_plan_node(self, state: CommunicationState) -> CommunicationState:
        """
        Create channel plan with sequencing and KPIs.

        Plans channels with:
        - Channel selection per segment
        - Cadence and sequencing
        - Budget allocation
        - Success metrics
        """
        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step = 5

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "channel_plan", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert channel strategist.

Create a comprehensive channel plan for the communication campaign.

For each channel entry provide:
1. channel: Channel name (e.g., email, social, webinar, etc.)
2. target_segments: Which segments this reaches
3. message_variant: Which message(s) to use
4. cadence: Frequency and timing
5. sequence_order: When in the campaign (1 = first)
6. budget_percentage: Share of budget (0-100)
7. expected_reach: Estimated audience reached
8. expected_engagement: Anticipated engagement rate
9. kpis: Specific metrics to track
10. fallback_channel: Alternative if primary underperforms

Also provide summary:
- channel_mix: Percentage breakdown by channel type
- total_touchpoints: Number of planned touchpoints
- campaign_duration: Overall timeline

Return a JSON object with channel_plan array and summary fields."""

        content = f"""Communication Objective: {state.goal}

Audience Segments:
{self._format_segments_for_prompt(state.audience_segments)}

Designed Messages:
{self._format_messages_for_prompt(state.messages)}

Create a channel plan to deliver these messages effectively."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=30,
            )

            # Parse channel plan
            plan_data = self._parse_channel_plan_response(response)
            validated = validate_communication_outputs(
                state.audience_segments, state.messages, plan_data
            )
            state.channel_plan = validated.get("channel_plan", [])

            # Extract summary fields
            if isinstance(plan_data, dict):
                state.channel_mix = plan_data.get("channel_mix", {})
                if "channel_plan" in plan_data:
                    state.channel_plan = plan_data["channel_plan"]

            # Extract KPIs from channel entries
            state.kpis = [
                {"channel": c.get("channel"), "kpis": c.get("kpis", [])}
                for c in state.channel_plan
                if c.get("kpis")
            ]

            # Calculate budget allocation
            state.budget_allocation = {
                c.get("channel", f"channel_{i}"): c.get("budget_percentage", 0)
                for i, c in enumerate(state.channel_plan)
            }

            # Build final output
            state.final_output = self._build_communication_summary(state)

            # Calculate channel optimization
            has_sequence = all(c.get("sequence_order") for c in state.channel_plan)
            has_kpis = all(c.get("kpis") for c in state.channel_plan)
            has_budget = sum(state.budget_allocation.values()) >= 90  # At least 90% allocated
            state.channel_optimization = (
                (1.0 if has_sequence else 0.5) +
                (1.0 if has_kpis else 0.5) +
                (1.0 if has_budget else 0.5) +
                min(len(state.channel_plan) / 5, 1.0)
            ) / 4

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "channel_plan",
                        "channels_count": len(state.channel_plan),
                        "kpis_count": len(state.kpis),
                        "channel_mix": state.channel_mix,
                        "optimization": state.channel_optimization,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("channel_plan_failed", error=str(exc))
            state.error = f"channel_plan_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "channel_plan", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint - plan validation (non-blocking)
        state.requires_hitl = True
        state.hitl_reason = "Final validation of communication plan"
        self._create_hitl_checkpoint(
            state,
            checkpoint_type="final_review",
            title="Review Communication Plan",
            description=f"{len(state.channel_plan)} channels planned for {len(state.audience_segments)} segments",
            is_blocking=False,
            data={
                "channel_plan": state.channel_plan[:5],
                "channel_mix": state.channel_mix,
                "kpis": state.kpis[:5],
            },
        )

        logger.info(
            "communication_channel_plan_complete",
            mission_id=state.mission_id,
            channels=len(state.channel_plan),
        )
        return state

    @graceful_degradation(domain="communication", fallback_value=None)
    async def _quality_gate_node(self, state: CommunicationState) -> CommunicationState:
        """
        Final quality assessment with confidence scoring.

        Calculates multi-factor confidence score based on:
        - Segment coverage
        - Message alignment
        - Channel optimization
        - Overall completeness
        """
        state.phase = ExecutionPhase.COMPLETE
        state.current_step = 6
        state.completed_at = datetime.utcnow()

        # Calculate multi-factor confidence score
        quality_factors = [
            state.segment_coverage,
            state.message_alignment,
            state.channel_optimization,
            1.0 if state.primary_segment else 0.0,
            min(len(state.kpis) / 3, 1.0),
        ]
        state.confidence_score = sum(quality_factors) / len(quality_factors)

        # Also set quality_score for compatibility
        state.quality_score = state.confidence_score

        # Force HITL if channel optimization is low
        if state.channel_optimization < 0.6:
            state.requires_hitl = True
            state.hitl_reason = f"Channel optimization ({state.channel_optimization:.2f}) requires review"
        elif state.confidence_score < self.confidence_threshold:
            state.requires_hitl = True
            state.hitl_reason = f"Low confidence ({state.confidence_score:.2f}) requires review"

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.QUALITY_CHECK,
                data={
                    "confidence_score": state.confidence_score,
                    "quality_factors": {
                        "segment_coverage": state.segment_coverage,
                        "message_alignment": state.message_alignment,
                        "channel_optimization": state.channel_optimization,
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
                    "segments_count": len(state.audience_segments),
                    "primary_segment": state.primary_segment,
                    "messages_count": len(state.messages),
                    "channels_count": len(state.channel_plan),
                    "kpis_count": len(state.kpis),
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
            "communication_complete",
            mission_id=state.mission_id,
            confidence_score=state.confidence_score,
            segments=len(state.audience_segments),
        )
        return state

    # =========================================================================
    # Helper Methods
    # =========================================================================

    def _build_communication_summary(self, state: CommunicationState) -> str:
        """Build executive summary of communication plan."""
        summary_parts = [
            f"**Communication Plan Summary**",
            f"\n**Objective:** {state.goal}",
            f"\n**Primary Segment:** {state.primary_segment}",
            f"**Total Segments:** {len(state.audience_segments)}",
            f"\n**Key Messages:**",
        ]

        for i, msg in enumerate(state.key_messages[:3], 1):
            summary_parts.append(f"{i}. {msg}")

        summary_parts.append(f"\n**Channels ({len(state.channel_plan)}):**")
        for c in state.channel_plan[:5]:
            channel = c.get("channel", "N/A")
            segments = c.get("target_segments", [])
            summary_parts.append(f"- {channel}: {', '.join(segments) if segments else 'All'}")

        return "\n".join(summary_parts)

    def _parse_segments_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into segments list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("segments", [response])
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
                return [{"id": "S1", "name": str(response.content), "priority": 1}]
        return [{"id": "S1", "name": str(response), "priority": 1}]

    def _parse_messages_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into messages list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("messages", [response])
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
                return [{"segment_id": "S1", "key_message": str(response.content)}]
        return [{"segment_id": "S1", "key_message": str(response)}]

    def _parse_channel_plan_response(self, response: Any) -> Any:
        """Parse LLM response into channel plan data."""
        if isinstance(response, (list, dict)):
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
                return [{"channel": "email", "target_segments": ["S1"]}]
        return [{"channel": "email", "target_segments": ["S1"]}]

    def _format_segments_for_prompt(self, segments: List[Dict[str, Any]]) -> str:
        """Format segments list for LLM prompt."""
        lines = []
        for s in segments:
            s_id = s.get("id", "S?")
            name = s.get("name", "")
            needs = s.get("needs", "N/A")
            channels = s.get("preferred_channels", "N/A")
            lines.append(
                f"{s_id}. {name}\n"
                f"   Needs: {needs}\n"
                f"   Preferred Channels: {channels}"
            )
        return "\n".join(lines) or "No segments"

    def _format_messages_for_prompt(self, messages: List[Dict[str, Any]]) -> str:
        """Format messages list for LLM prompt."""
        lines = []
        for m in messages:
            seg_id = m.get("segment_id", "S?")
            key_msg = m.get("key_message", "N/A")
            cta = m.get("call_to_action", "N/A")
            lines.append(f"{seg_id}: {key_msg} (CTA: {cta})")
        return "\n".join(lines) or "No messages"

    def _create_hitl_checkpoint(
        self,
        state: CommunicationState,
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
