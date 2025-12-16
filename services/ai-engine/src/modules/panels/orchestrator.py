"""
Panel Orchestrator - Coordinates multi-agent panel discussions.

This orchestrator manages the flow of panel discussions, including:
- Expert selection and initialization
- Turn management
- Response aggregation
- Consensus building
"""

from typing import List, Dict, Any, Optional, AsyncIterator
from dataclasses import dataclass, field
from enum import Enum
import asyncio
import logging

from domain.services.budget_service import BudgetService
from infrastructure.llm.client import LLMClient

logger = logging.getLogger(__name__)


class PanelPhase(str, Enum):
    """Phases of a panel discussion."""
    INITIALIZATION = "initialization"
    OPENING_STATEMENTS = "opening_statements"
    DISCUSSION = "discussion"
    REBUTTALS = "rebuttals"
    CONSENSUS = "consensus"
    CLOSING = "closing"


@dataclass
class PanelMember:
    """Represents a panel member (expert)."""
    id: str
    name: str
    role: str
    expertise: List[str]
    persona_prompt: str
    avatar_url: Optional[str] = None


@dataclass
class PanelConfig:
    """Configuration for a panel discussion."""
    topic: str
    panel_members: List[PanelMember]
    max_rounds: int = 3
    enable_rebuttals: bool = True
    consensus_required: bool = True
    time_limit_seconds: Optional[int] = 300


@dataclass
class PanelState:
    """Current state of a panel discussion."""
    config: PanelConfig
    phase: PanelPhase = PanelPhase.INITIALIZATION
    current_round: int = 0
    responses: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    consensus: Optional[str] = None
    is_complete: bool = False


class PanelOrchestrator:
    """
    Orchestrates multi-agent panel discussions.
    
    Manages the coordination between multiple AI experts to provide
    comprehensive, multi-perspective answers to complex questions.
    """
    
    def __init__(
        self,
        llm_client: LLMClient,
        budget_service: Optional[BudgetService] = None,
    ):
        self.llm_client = llm_client
        self.budget_service = budget_service
        self._active_panels: Dict[str, PanelState] = {}
    
    async def create_panel(
        self,
        panel_id: str,
        config: PanelConfig,
    ) -> PanelState:
        """Create and initialize a new panel discussion."""
        state = PanelState(config=config)
        self._active_panels[panel_id] = state
        logger.info(f"Created panel {panel_id} with {len(config.panel_members)} members")
        return state
    
    async def run_panel(
        self,
        panel_id: str,
        question: str,
        organization_id: str,
        user_id: str,
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Run a complete panel discussion.
        
        Yields events as the discussion progresses.
        """
        state = self._active_panels.get(panel_id)
        if not state:
            raise ValueError(f"Panel {panel_id} not found")
        
        try:
            # Phase 1: Opening Statements
            state.phase = PanelPhase.OPENING_STATEMENTS
            yield {"type": "phase_change", "phase": state.phase.value}
            
            async for event in self._collect_opening_statements(state, question):
                yield event
            
            # Phase 2: Discussion Rounds
            state.phase = PanelPhase.DISCUSSION
            yield {"type": "phase_change", "phase": state.phase.value}
            
            for round_num in range(state.config.max_rounds):
                state.current_round = round_num + 1
                yield {"type": "round_start", "round": state.current_round}
                
                async for event in self._run_discussion_round(state, question):
                    yield event
            
            # Phase 3: Rebuttals (if enabled)
            if state.config.enable_rebuttals:
                state.phase = PanelPhase.REBUTTALS
                yield {"type": "phase_change", "phase": state.phase.value}
                
                async for event in self._collect_rebuttals(state):
                    yield event
            
            # Phase 4: Consensus Building
            if state.config.consensus_required:
                state.phase = PanelPhase.CONSENSUS
                yield {"type": "phase_change", "phase": state.phase.value}
                
                consensus = await self._build_consensus(state, question)
                state.consensus = consensus
                yield {"type": "consensus", "content": consensus}
            
            # Phase 5: Closing
            state.phase = PanelPhase.CLOSING
            state.is_complete = True
            yield {"type": "phase_change", "phase": state.phase.value}
            yield {"type": "complete", "panel_id": panel_id}
            
        except Exception as e:
            logger.error(f"Panel {panel_id} failed: {e}")
            yield {"type": "error", "error": str(e)}
            raise
    
    async def _collect_opening_statements(
        self,
        state: PanelState,
        question: str,
    ) -> AsyncIterator[Dict[str, Any]]:
        """Collect opening statements from all panel members."""
        for member in state.config.panel_members:
            yield {"type": "member_speaking", "member_id": member.id, "member_name": member.name}
            
            prompt = self._create_opening_prompt(member, question, state.config.topic)
            response = await self.llm_client.generate(
                prompt=prompt,
                system_prompt=member.persona_prompt,
            )
            
            if member.id not in state.responses:
                state.responses[member.id] = []
            
            state.responses[member.id].append({
                "phase": "opening",
                "content": response,
            })
            
            yield {
                "type": "statement",
                "member_id": member.id,
                "member_name": member.name,
                "content": response,
            }
    
    async def _run_discussion_round(
        self,
        state: PanelState,
        question: str,
    ) -> AsyncIterator[Dict[str, Any]]:
        """Run a single round of discussion."""
        # Get all previous responses for context
        context = self._build_discussion_context(state)
        
        for member in state.config.panel_members:
            yield {"type": "member_speaking", "member_id": member.id, "member_name": member.name}
            
            prompt = self._create_discussion_prompt(
                member, question, context, state.current_round
            )
            response = await self.llm_client.generate(
                prompt=prompt,
                system_prompt=member.persona_prompt,
            )
            
            state.responses[member.id].append({
                "phase": f"round_{state.current_round}",
                "content": response,
            })
            
            yield {
                "type": "discussion",
                "member_id": member.id,
                "member_name": member.name,
                "round": state.current_round,
                "content": response,
            }
    
    async def _collect_rebuttals(
        self,
        state: PanelState,
    ) -> AsyncIterator[Dict[str, Any]]:
        """Collect rebuttals from panel members."""
        context = self._build_discussion_context(state)
        
        for member in state.config.panel_members:
            yield {"type": "member_speaking", "member_id": member.id, "member_name": member.name}
            
            prompt = self._create_rebuttal_prompt(member, context)
            response = await self.llm_client.generate(
                prompt=prompt,
                system_prompt=member.persona_prompt,
            )
            
            state.responses[member.id].append({
                "phase": "rebuttal",
                "content": response,
            })
            
            yield {
                "type": "rebuttal",
                "member_id": member.id,
                "member_name": member.name,
                "content": response,
            }
    
    async def _build_consensus(
        self,
        state: PanelState,
        question: str,
    ) -> str:
        """Build consensus from all panel responses."""
        from .consensus import ConsensusBuilder
        
        builder = ConsensusBuilder(self.llm_client)
        return await builder.build(
            topic=state.config.topic,
            question=question,
            responses=state.responses,
            panel_members=state.config.panel_members,
        )
    
    def _create_opening_prompt(
        self,
        member: PanelMember,
        question: str,
        topic: str,
    ) -> str:
        """Create prompt for opening statement."""
        return f"""You are participating in an expert panel discussion on: {topic}

The question being discussed is: {question}

Please provide your opening statement. Share your initial perspective based on your expertise in {', '.join(member.expertise)}.

Keep your response focused and concise (2-3 paragraphs)."""

    def _create_discussion_prompt(
        self,
        member: PanelMember,
        question: str,
        context: str,
        round_num: int,
    ) -> str:
        """Create prompt for discussion round."""
        return f"""Continue the panel discussion. This is round {round_num}.

Original question: {question}

Previous discussion:
{context}

Please respond to the points raised by other panel members. You may:
- Agree and expand on good points
- Respectfully disagree with specific reasoning
- Add new perspectives not yet covered
- Ask clarifying questions to other panelists

Keep your response focused and constructive."""

    def _create_rebuttal_prompt(
        self,
        member: PanelMember,
        context: str,
    ) -> str:
        """Create prompt for rebuttal."""
        return f"""The discussion is concluding. Here's what has been said:

{context}

Please provide your final thoughts:
- Address any disagreements with your position
- Clarify any misunderstandings
- Summarize your key contribution to this discussion

Be concise and focus on your unique perspective."""

    def _build_discussion_context(self, state: PanelState) -> str:
        """Build context string from all responses."""
        context_parts = []
        
        for member in state.config.panel_members:
            member_responses = state.responses.get(member.id, [])
            for resp in member_responses:
                context_parts.append(f"**{member.name} ({resp['phase']}):**\n{resp['content']}\n")
        
        return "\n".join(context_parts)
    
    def get_panel_state(self, panel_id: str) -> Optional[PanelState]:
        """Get the current state of a panel."""
        return self._active_panels.get(panel_id)
    
    async def cancel_panel(self, panel_id: str) -> bool:
        """Cancel an active panel discussion."""
        if panel_id in self._active_panels:
            del self._active_panels[panel_id]
            logger.info(f"Cancelled panel {panel_id}")
            return True
        return False







