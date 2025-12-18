"""
Panel Type Handlers

Specialized implementations for each of the 6 Ask Panel types:
1. Structured - Sequential moderated discussion
2. Open - Free-form brainstorming (parallel)
3. Socratic - Dialectical questioning
4. Adversarial - Pro/con debate format
5. Delphi - Iterative consensus with voting
6. Hybrid - Human-AI collaborative panels

Based on ASK_PANEL_COMPLETE_GUIDE.md specifications.
"""

import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import UUID, uuid4
from enum import Enum
import structlog
import random

from services.llm_service import LLMService
from services.consensus_analyzer import AdvancedConsensusAnalyzer, ConsensusResult
from infrastructure.llm.config_service import get_llm_config_for_level

logger = structlog.get_logger()


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class PanelExpert:
    """An expert participating in the panel"""
    agent_id: str
    agent_name: str
    model: str
    system_prompt: str
    role: str = "expert"  # expert, moderator, advocate, opponent
    position: Optional[str] = None  # For adversarial: "pro", "con"
    vote: Optional[float] = None  # For Delphi: 0-1 agreement score


@dataclass
class PanelResponse:
    """A response from a panel expert"""
    agent_id: str
    agent_name: str
    content: str
    confidence: float
    round_number: int
    response_type: str  # analysis, question, rebuttal, synthesis
    position: Optional[str] = None
    vote: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class PanelRoundResult:
    """Result of a single panel round"""
    round_number: int
    responses: List[PanelResponse]
    consensus_score: float
    key_points: List[str]
    questions_raised: List[str] = field(default_factory=list)
    votes: Dict[str, float] = field(default_factory=dict)


@dataclass
class PanelExecutionResult:
    """Complete result of panel execution"""
    panel_type: str
    question: str
    rounds: List[PanelRoundResult]
    final_consensus: ConsensusResult
    comparison_matrix: Optional[Dict[str, Any]] = None
    execution_time_ms: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)


class ResponseType(str, Enum):
    ANALYSIS = "analysis"
    QUESTION = "question"
    REBUTTAL = "rebuttal"
    SYNTHESIS = "synthesis"
    VOTE = "vote"


# =============================================================================
# Base Panel Handler
# =============================================================================

class BasePanelHandler:
    """Base class for panel type handlers"""

    def __init__(
        self,
        llm_service: LLMService,
        consensus_analyzer: AdvancedConsensusAnalyzer,
        max_rounds: int = 3,
        min_consensus: float = 0.70
    ):
        self.llm_service = llm_service
        self.consensus_analyzer = consensus_analyzer
        self.max_rounds = max_rounds
        self.min_consensus = min_consensus
        self._llm_config = get_llm_config_for_level("L3")

    async def execute(
        self,
        question: str,
        experts: List[PanelExpert],
        context: Optional[str] = None
    ) -> PanelExecutionResult:
        """Execute the panel discussion - override in subclasses"""
        raise NotImplementedError("Subclasses must implement execute()")

    async def _get_expert_response(
        self,
        expert: PanelExpert,
        prompt: str,
        response_type: ResponseType = ResponseType.ANALYSIS,
        round_number: int = 1
    ) -> PanelResponse:
        """Get a response from a single expert"""
        try:
            full_prompt = f"{expert.system_prompt}\n\n{prompt}"

            response = await self.llm_service.generate(
                prompt=full_prompt,
                model=expert.model,
                temperature=0.7,
                max_tokens=1500
            )

            # Estimate confidence from response length and certainty indicators
            confidence = self._estimate_confidence(response)

            return PanelResponse(
                agent_id=expert.agent_id,
                agent_name=expert.agent_name,
                content=response,
                confidence=confidence,
                round_number=round_number,
                response_type=response_type.value,
                position=expert.position,
                metadata={"model": expert.model}
            )

        except Exception as e:
            logger.error(f"Expert response failed: {expert.agent_name}", error=str(e))
            return PanelResponse(
                agent_id=expert.agent_id,
                agent_name=expert.agent_name,
                content=f"Error generating response: {str(e)}",
                confidence=0.0,
                round_number=round_number,
                response_type=response_type.value,
                metadata={"error": str(e)}
            )

    def _estimate_confidence(self, response: str) -> float:
        """Estimate confidence from response content"""
        # Look for uncertainty indicators
        uncertainty_phrases = [
            "might", "perhaps", "possibly", "uncertain", "unclear",
            "may", "could", "not sure", "it depends", "hard to say"
        ]
        certainty_phrases = [
            "clearly", "definitely", "certainly", "must", "will",
            "evidence shows", "data indicates", "proven", "established"
        ]

        response_lower = response.lower()

        uncertainty_count = sum(1 for p in uncertainty_phrases if p in response_lower)
        certainty_count = sum(1 for p in certainty_phrases if p in response_lower)

        # Base confidence
        base = 0.75

        # Adjust based on language
        adjustment = (certainty_count - uncertainty_count) * 0.05
        confidence = base + adjustment

        return max(0.3, min(0.95, confidence))


# =============================================================================
# Type 1: Structured Panel
# =============================================================================

class StructuredPanelHandler(BasePanelHandler):
    """
    Type 1: Structured Panel

    Sequential moderated discussion with clear phases:
    1. Initial expert responses
    2. Cross-examination/questions
    3. Final synthesis
    """

    async def execute(
        self,
        question: str,
        experts: List[PanelExpert],
        context: Optional[str] = None
    ) -> PanelExecutionResult:
        start_time = datetime.now(timezone.utc)
        rounds = []

        logger.info("Starting Structured Panel", expert_count=len(experts))

        # Phase 1: Initial expert responses (sequential)
        round_1_responses = []
        for i, expert in enumerate(experts):
            prompt = f"""You are participating in a structured expert panel discussion.

Question: {question}

{f"Context: {context}" if context else ""}

{f"Previous experts have responded:" if round_1_responses else "You are the first to respond."}
{self._format_previous_responses(round_1_responses)}

Please provide your expert analysis. Be thorough but concise.
Structure your response with:
1. Key findings
2. Supporting evidence
3. Recommendations"""

            response = await self._get_expert_response(
                expert, prompt, ResponseType.ANALYSIS, round_number=1
            )
            round_1_responses.append(response)

        round_1 = PanelRoundResult(
            round_number=1,
            responses=round_1_responses,
            consensus_score=0.0,
            key_points=[]
        )
        rounds.append(round_1)

        # Phase 2: Cross-examination (experts ask each other questions)
        if len(experts) >= 2:
            round_2_responses = []
            for expert in experts:
                other_responses = [r for r in round_1_responses if r.agent_id != expert.agent_id]

                prompt = f"""Based on your colleagues' responses to: "{question}"

Their responses:
{self._format_previous_responses(other_responses)}

Please:
1. Identify any points you agree or disagree with
2. Ask one clarifying question to another expert
3. Add any additional insights"""

                response = await self._get_expert_response(
                    expert, prompt, ResponseType.QUESTION, round_number=2
                )
                round_2_responses.append(response)

            round_2 = PanelRoundResult(
                round_number=2,
                responses=round_2_responses,
                consensus_score=0.0,
                key_points=[],
                questions_raised=self._extract_questions(round_2_responses)
            )
            rounds.append(round_2)

        # Phase 3: Final synthesis
        all_responses = [r for round_result in rounds for r in round_result.responses]

        # Calculate final consensus
        response_dicts = [
            {"agent_name": r.agent_name, "content": r.content, "confidence": r.confidence}
            for r in all_responses
        ]
        final_consensus = await self.consensus_analyzer.analyze_consensus(
            question, response_dicts
        )

        execution_time = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

        return PanelExecutionResult(
            panel_type="structured",
            question=question,
            rounds=rounds,
            final_consensus=final_consensus,
            execution_time_ms=execution_time,
            metadata={"phases": ["initial_analysis", "cross_examination", "synthesis"]}
        )

    def _format_previous_responses(self, responses: List[PanelResponse]) -> str:
        if not responses:
            return ""
        return "\n\n".join([
            f"**{r.agent_name}**: {r.content[:500]}..."
            for r in responses
        ])

    def _extract_questions(self, responses: List[PanelResponse]) -> List[str]:
        questions = []
        for r in responses:
            # Simple extraction - look for question marks
            sentences = r.content.split('.')
            for s in sentences:
                if '?' in s:
                    questions.append(s.strip())
        return questions[:5]


# =============================================================================
# Type 2: Open Panel
# =============================================================================

class OpenPanelHandler(BasePanelHandler):
    """
    Type 2: Open Panel

    Free-form brainstorming with parallel execution:
    - All experts respond simultaneously
    - No structure imposed
    - Theme identification post-hoc
    """

    async def execute(
        self,
        question: str,
        experts: List[PanelExpert],
        context: Optional[str] = None
    ) -> PanelExecutionResult:
        start_time = datetime.now(timezone.utc)
        rounds = []

        logger.info("Starting Open Panel", expert_count=len(experts))

        # Execute all experts in parallel
        async def get_response(expert: PanelExpert) -> PanelResponse:
            prompt = f"""You are participating in an open brainstorming panel.

Question: {question}

{f"Context: {context}" if context else ""}

Please share your thoughts freely. Consider:
- Creative solutions
- Different perspectives
- Potential risks and opportunities
- Unconventional approaches

There's no required structure - share your expertise naturally."""

            return await self._get_expert_response(
                expert, prompt, ResponseType.ANALYSIS, round_number=1
            )

        # Parallel execution
        tasks = [get_response(expert) for expert in experts]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter out failures
        valid_responses = [r for r in responses if isinstance(r, PanelResponse)]

        round_1 = PanelRoundResult(
            round_number=1,
            responses=valid_responses,
            consensus_score=0.0,
            key_points=[]
        )
        rounds.append(round_1)

        # Identify themes from responses
        themes = await self._identify_themes(valid_responses)
        round_1.key_points = themes

        # Calculate consensus
        response_dicts = [
            {"agent_name": r.agent_name, "content": r.content, "confidence": r.confidence}
            for r in valid_responses
        ]
        final_consensus = await self.consensus_analyzer.analyze_consensus(
            question, response_dicts
        )

        execution_time = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

        return PanelExecutionResult(
            panel_type="open",
            question=question,
            rounds=rounds,
            final_consensus=final_consensus,
            execution_time_ms=execution_time,
            metadata={"execution_mode": "parallel", "themes_identified": themes}
        )

    async def _identify_themes(self, responses: List[PanelResponse]) -> List[str]:
        """Identify key themes across responses"""
        combined = "\n\n".join([f"{r.agent_name}: {r.content[:300]}" for r in responses])

        prompt = f"""Identify 3-5 key themes from these expert responses:

{combined}

List the main themes discussed:
-"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.3,
                max_tokens=200
            )

            themes = []
            for line in result.split('\n'):
                line = line.strip().lstrip('-').strip()
                if line and len(line) > 3:
                    themes.append(line)

            return themes[:5]

        except Exception as e:
            logger.warning(f"Theme identification failed: {e}")
            return []


# =============================================================================
# Type 3: Socratic Panel
# =============================================================================

class SocraticPanelHandler(BasePanelHandler):
    """
    Type 3: Socratic Panel

    Dialectical questioning to test assumptions:
    1. Initial position
    2. Probing questions
    3. Defense/revision
    4. Synthesis of refined understanding
    """

    async def execute(
        self,
        question: str,
        experts: List[PanelExpert],
        context: Optional[str] = None
    ) -> PanelExecutionResult:
        start_time = datetime.now(timezone.utc)
        rounds = []

        logger.info("Starting Socratic Panel", expert_count=len(experts))

        # Round 1: Initial positions
        round_1_responses = []
        for expert in experts:
            prompt = f"""You are participating in a Socratic dialogue.

Question: {question}

{f"Context: {context}" if context else ""}

Please state your initial position clearly, including:
1. Your main thesis/answer
2. Key assumptions you're making
3. Evidence supporting your position

Be clear about what you're certain of vs. what is assumed."""

            response = await self._get_expert_response(
                expert, prompt, ResponseType.ANALYSIS, round_number=1
            )
            round_1_responses.append(response)

        rounds.append(PanelRoundResult(
            round_number=1,
            responses=round_1_responses,
            consensus_score=0.0,
            key_points=[]
        ))

        # Round 2: Probing questions (experts question each other)
        round_2_responses = []
        for i, expert in enumerate(experts):
            # Each expert questions the next one (circular)
            target_idx = (i + 1) % len(experts)
            target_response = round_1_responses[target_idx]

            prompt = f"""In this Socratic dialogue, critically examine this position:

**{target_response.agent_name}'s Position:**
{target_response.content}

As a Socratic questioner, you must:
1. Identify the strongest assumption in their argument
2. Ask 2-3 probing questions that challenge this assumption
3. Point out any logical gaps or unstated premises

Do NOT attack the person - focus on testing the logic and assumptions."""

            response = await self._get_expert_response(
                expert, prompt, ResponseType.QUESTION, round_number=2
            )
            round_2_responses.append(response)

        questions_raised = self._extract_socratic_questions(round_2_responses)
        rounds.append(PanelRoundResult(
            round_number=2,
            responses=round_2_responses,
            consensus_score=0.0,
            key_points=[],
            questions_raised=questions_raised
        ))

        # Round 3: Defense/Revision
        round_3_responses = []
        for i, expert in enumerate(experts):
            # Find questions directed at this expert
            questioner_idx = (i - 1) % len(experts)
            questions = round_2_responses[questioner_idx]

            prompt = f"""Respond to the Socratic questioning of your position.

Your original position:
{round_1_responses[i].content}

Questions raised:
{questions.content}

Please:
1. Address each question honestly
2. Acknowledge any weaknesses in your original position
3. Revise your position if the questions revealed valid concerns
4. Strengthen your argument where appropriate

Be intellectually honest - if a question exposed a flaw, admit it."""

            response = await self._get_expert_response(
                expert, prompt, ResponseType.REBUTTAL, round_number=3
            )
            round_3_responses.append(response)

        rounds.append(PanelRoundResult(
            round_number=3,
            responses=round_3_responses,
            consensus_score=0.0,
            key_points=[]
        ))

        # Calculate final consensus from refined positions
        all_responses = round_1_responses + round_3_responses
        response_dicts = [
            {"agent_name": r.agent_name, "content": r.content, "confidence": r.confidence}
            for r in all_responses
        ]
        final_consensus = await self.consensus_analyzer.analyze_consensus(
            question, response_dicts
        )

        # Identify key insights from the dialectic
        insights = await self._extract_dialectic_insights(rounds)

        execution_time = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

        return PanelExecutionResult(
            panel_type="socratic",
            question=question,
            rounds=rounds,
            final_consensus=final_consensus,
            execution_time_ms=execution_time,
            metadata={
                "dialectic_phases": ["initial_position", "probing", "defense_revision"],
                "questions_examined": questions_raised,
                "key_insights": insights
            }
        )

    def _extract_socratic_questions(self, responses: List[PanelResponse]) -> List[str]:
        """Extract the key probing questions"""
        questions = []
        for r in responses:
            sentences = r.content.replace('?', '?\n').split('\n')
            for s in sentences:
                s = s.strip()
                if s.endswith('?') and len(s) > 20:
                    questions.append(s)
        return questions[:10]

    async def _extract_dialectic_insights(self, rounds: List[PanelRoundResult]) -> List[str]:
        """Extract key insights from the dialectical process"""
        if len(rounds) < 3:
            return []

        initial_positions = "\n".join([r.content[:200] for r in rounds[0].responses])
        revised_positions = "\n".join([r.content[:200] for r in rounds[2].responses])

        prompt = f"""Compare these initial and revised positions from a Socratic dialogue:

INITIAL POSITIONS:
{initial_positions}

REVISED POSITIONS:
{revised_positions}

What key insights emerged from this dialectical process?
List 3-5 insights:
-"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.3,
                max_tokens=300
            )

            insights = []
            for line in result.split('\n'):
                line = line.strip().lstrip('-').strip()
                if line and len(line) > 10:
                    insights.append(line)

            return insights[:5]

        except Exception as e:
            logger.warning(f"Insight extraction failed: {e}")
            return []


# =============================================================================
# Type 4: Adversarial Panel
# =============================================================================

class AdversarialPanelHandler(BasePanelHandler):
    """
    Type 4: Adversarial Panel

    Pro/con debate format:
    1. Advocates make the case FOR
    2. Opponents make the case AGAINST
    3. Rebuttals
    4. Judge synthesis
    """

    async def execute(
        self,
        question: str,
        experts: List[PanelExpert],
        context: Optional[str] = None
    ) -> PanelExecutionResult:
        start_time = datetime.now(timezone.utc)
        rounds = []

        logger.info("Starting Adversarial Panel", expert_count=len(experts))

        # Assign positions: half PRO, half CON
        mid = len(experts) // 2
        advocates = experts[:max(1, mid)]
        opponents = experts[max(1, mid):]

        for a in advocates:
            a.position = "pro"
        for o in opponents:
            o.position = "con"

        # Round 1: Opening statements
        round_1_responses = []

        # Advocates (PRO)
        for expert in advocates:
            prompt = f"""You are the ADVOCATE in a structured debate.

Question/Proposition: {question}

{f"Context: {context}" if context else ""}

Your role is to argue IN FAVOR of this proposition.
Present your strongest case:
1. Main argument (your thesis)
2. Supporting evidence (3 key points)
3. Anticipated benefits
4. Address potential concerns

Be persuasive but factual. You are arguing FOR this position."""

            response = await self._get_expert_response(
                expert, prompt, ResponseType.ANALYSIS, round_number=1
            )
            response.position = "pro"
            round_1_responses.append(response)

        # Opponents (CON)
        for expert in opponents:
            prompt = f"""You are the OPPONENT in a structured debate.

Question/Proposition: {question}

{f"Context: {context}" if context else ""}

Your role is to argue AGAINST this proposition.
Present your strongest case:
1. Main counter-argument (your thesis)
2. Key concerns or risks (3 points)
3. Alternative approaches
4. Potential negative consequences

Be persuasive but factual. You are arguing AGAINST this position."""

            response = await self._get_expert_response(
                expert, prompt, ResponseType.ANALYSIS, round_number=1
            )
            response.position = "con"
            round_1_responses.append(response)

        rounds.append(PanelRoundResult(
            round_number=1,
            responses=round_1_responses,
            consensus_score=0.0,
            key_points=[]
        ))

        # Round 2: Rebuttals
        round_2_responses = []

        # Advocates rebut opponents
        opponent_arguments = "\n\n".join([
            f"**{r.agent_name}**: {r.content}"
            for r in round_1_responses if r.position == "con"
        ])

        for expert in advocates:
            prompt = f"""REBUTTAL ROUND - You are the Advocate.

The opponents argued:
{opponent_arguments}

Counter their arguments:
1. Address their strongest point
2. Expose weaknesses in their reasoning
3. Reinforce your original position
4. Conclude with why your position is stronger"""

            response = await self._get_expert_response(
                expert, prompt, ResponseType.REBUTTAL, round_number=2
            )
            response.position = "pro"
            round_2_responses.append(response)

        # Opponents rebut advocates
        advocate_arguments = "\n\n".join([
            f"**{r.agent_name}**: {r.content}"
            for r in round_1_responses if r.position == "pro"
        ])

        for expert in opponents:
            prompt = f"""REBUTTAL ROUND - You are the Opponent.

The advocates argued:
{advocate_arguments}

Counter their arguments:
1. Address their strongest point
2. Expose weaknesses in their reasoning
3. Reinforce your original position
4. Conclude with why your position is stronger"""

            response = await self._get_expert_response(
                expert, prompt, ResponseType.REBUTTAL, round_number=2
            )
            response.position = "con"
            round_2_responses.append(response)

        rounds.append(PanelRoundResult(
            round_number=2,
            responses=round_2_responses,
            consensus_score=0.0,
            key_points=[]
        ))

        # Round 3: Judge synthesis (using consensus analyzer as judge)
        all_responses = round_1_responses + round_2_responses
        response_dicts = [
            {
                "agent_name": r.agent_name,
                "content": r.content,
                "confidence": r.confidence,
                "position": r.position
            }
            for r in all_responses
        ]

        # Get adversarial analysis
        judge_synthesis = await self._judge_debate(question, response_dicts)

        final_consensus = await self.consensus_analyzer.analyze_consensus(
            question, response_dicts
        )

        execution_time = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

        return PanelExecutionResult(
            panel_type="adversarial",
            question=question,
            rounds=rounds,
            final_consensus=final_consensus,
            execution_time_ms=execution_time,
            metadata={
                "debate_format": "pro_con",
                "advocates": [e.agent_name for e in advocates],
                "opponents": [e.agent_name for e in opponents],
                "judge_synthesis": judge_synthesis
            }
        )

    async def _judge_debate(
        self,
        question: str,
        responses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Synthesize the debate as an impartial judge"""
        pro_arguments = "\n".join([
            f"- {r['agent_name']}: {r['content'][:200]}..."
            for r in responses if r.get('position') == 'pro'
        ])

        con_arguments = "\n".join([
            f"- {r['agent_name']}: {r['content'][:200]}..."
            for r in responses if r.get('position') == 'con'
        ])

        prompt = f"""As an impartial judge, evaluate this debate on: "{question}"

PRO ARGUMENTS:
{pro_arguments}

CON ARGUMENTS:
{con_arguments}

Provide your judgment:
1. STRONGEST PRO ARGUMENT: [identify]
2. STRONGEST CON ARGUMENT: [identify]
3. KEY UNRESOLVED ISSUES: [list]
4. OVERALL ASSESSMENT: [which side presented stronger evidence?]
5. RECOMMENDATION: [what should decision-makers consider?]"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.3,
                max_tokens=600
            )

            return {
                "judgment": result,
                "analyzed_responses": len(responses)
            }

        except Exception as e:
            logger.warning(f"Judge synthesis failed: {e}")
            return {"judgment": "Unable to synthesize debate", "error": str(e)}


# =============================================================================
# Type 5: Delphi Panel
# =============================================================================

class DelphiPanelHandler(BasePanelHandler):
    """
    Type 5: Delphi Panel

    Iterative consensus building with anonymous voting:
    1. Initial anonymous responses
    2. Share aggregated results (no attribution)
    3. Experts revise based on group feedback
    4. Vote until convergence
    """

    def __init__(
        self,
        llm_service: LLMService,
        consensus_analyzer: AdvancedConsensusAnalyzer,
        max_rounds: int = 4,
        min_consensus: float = 0.75,
        convergence_threshold: float = 0.05
    ):
        super().__init__(llm_service, consensus_analyzer, max_rounds, min_consensus)
        self.convergence_threshold = convergence_threshold

    async def execute(
        self,
        question: str,
        experts: List[PanelExpert],
        context: Optional[str] = None
    ) -> PanelExecutionResult:
        start_time = datetime.now(timezone.utc)
        rounds = []
        previous_votes: Dict[str, float] = {}

        logger.info("Starting Delphi Panel", expert_count=len(experts), max_rounds=self.max_rounds)

        for round_num in range(1, self.max_rounds + 1):
            logger.info(f"Delphi Round {round_num}")

            # Get anonymous responses and votes
            round_responses = []

            # Build context from previous round (anonymized)
            if rounds:
                previous_summary = self._anonymize_previous_round(rounds[-1])
            else:
                previous_summary = None

            # Parallel execution for each expert
            async def get_delphi_response(expert: PanelExpert) -> PanelResponse:
                if round_num == 1:
                    prompt = f"""DELPHI PANEL - Round 1 (Initial Response)

Question: {question}

{f"Context: {context}" if context else ""}

Please provide:
1. Your analysis/recommendation
2. Your confidence level (0-100%)
3. Key factors influencing your view

Your response will be anonymized before sharing with other experts."""

                else:
                    prompt = f"""DELPHI PANEL - Round {round_num}

Question: {question}

ANONYMIZED GROUP FEEDBACK FROM PREVIOUS ROUND:
{previous_summary}

Previous group consensus: {rounds[-1].consensus_score:.0%}

Based on the group's anonymous feedback:
1. Reconsider your position
2. Provide your revised analysis
3. Update your confidence level
4. Note if/why you changed your view

You may maintain your position if you believe it's correct despite group feedback."""

                response = await self._get_expert_response(
                    expert, prompt, ResponseType.ANALYSIS, round_number=round_num
                )

                # Extract vote (confidence as agreement score)
                vote = await self._extract_vote(response.content, question)
                response.vote = vote

                return response

            tasks = [get_delphi_response(expert) for expert in experts]
            responses = await asyncio.gather(*tasks, return_exceptions=True)

            valid_responses = [r for r in responses if isinstance(r, PanelResponse)]
            round_responses = valid_responses

            # Calculate round consensus and votes
            votes = {r.agent_id: r.vote for r in round_responses if r.vote is not None}
            avg_vote = sum(votes.values()) / len(votes) if votes else 0.5

            response_dicts = [
                {"agent_name": f"Expert {i+1}", "content": r.content, "confidence": r.confidence}
                for i, r in enumerate(round_responses)
            ]
            round_consensus = await self.consensus_analyzer.analyze_consensus(
                question, response_dicts
            )

            round_result = PanelRoundResult(
                round_number=round_num,
                responses=round_responses,
                consensus_score=round_consensus.consensus_score,
                key_points=round_consensus.agreement_points,
                votes=votes
            )
            rounds.append(round_result)

            logger.info(
                f"Delphi Round {round_num} complete",
                consensus=round_consensus.consensus_score,
                avg_vote=avg_vote
            )

            # Check for convergence
            if round_num > 1:
                vote_change = self._calculate_vote_change(previous_votes, votes)
                if (round_consensus.consensus_score >= self.min_consensus and
                    vote_change < self.convergence_threshold):
                    logger.info("Delphi converged", round=round_num, consensus=round_consensus.consensus_score)
                    break

            previous_votes = votes

        # Final consensus
        all_final_responses = rounds[-1].responses
        response_dicts = [
            {"agent_name": r.agent_name, "content": r.content, "confidence": r.confidence}
            for r in all_final_responses
        ]
        final_consensus = await self.consensus_analyzer.analyze_consensus(
            question, response_dicts
        )

        execution_time = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

        return PanelExecutionResult(
            panel_type="delphi",
            question=question,
            rounds=rounds,
            final_consensus=final_consensus,
            execution_time_ms=execution_time,
            metadata={
                "convergence_achieved": final_consensus.consensus_score >= self.min_consensus,
                "total_rounds": len(rounds),
                "final_vote_distribution": rounds[-1].votes,
                "vote_evolution": [r.votes for r in rounds]
            }
        )

    def _anonymize_previous_round(self, round_result: PanelRoundResult) -> str:
        """Create anonymized summary of previous round"""
        lines = [
            f"Number of experts: {len(round_result.responses)}",
            f"Consensus level: {round_result.consensus_score:.0%}",
            "",
            "Key themes from anonymous responses:"
        ]

        for i, response in enumerate(round_result.responses):
            # Remove any identifying information
            content = response.content[:200]
            lines.append(f"- Response {i+1}: {content}...")

        if round_result.votes:
            avg_vote = sum(round_result.votes.values()) / len(round_result.votes)
            lines.append(f"\nGroup confidence average: {avg_vote:.0%}")

        return "\n".join(lines)

    async def _extract_vote(self, response: str, question: str) -> float:
        """Extract expert's vote (agreement/confidence score)"""
        prompt = f"""Based on this response about "{question}":

{response[:500]}

Rate the expert's confidence/agreement on a scale of 0.0 to 1.0:
0.0 = completely disagrees/uncertain
0.5 = neutral/mixed
1.0 = strongly agrees/confident

VOTE:"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.1,
                max_tokens=20
            )

            import re
            match = re.search(r'(\d+\.?\d*)', result)
            if match:
                vote = float(match.group(1))
                return min(max(vote, 0.0), 1.0)

            return 0.5

        except Exception as e:
            logger.warning(f"Vote extraction failed: {e}")
            return 0.5

    def _calculate_vote_change(
        self,
        previous: Dict[str, float],
        current: Dict[str, float]
    ) -> float:
        """Calculate average change in votes between rounds"""
        if not previous or not current:
            return 1.0

        changes = []
        for agent_id in current:
            if agent_id in previous:
                changes.append(abs(current[agent_id] - previous[agent_id]))

        return sum(changes) / len(changes) if changes else 1.0


# =============================================================================
# Type 6: Hybrid Panel
# =============================================================================

class HybridPanelHandler(BasePanelHandler):
    """
    Type 6: Hybrid Panel

    Human-AI collaborative panels:
    - AI experts provide analysis
    - Human checkpoints for validation
    - Iterative refinement based on human feedback
    """

    async def execute(
        self,
        question: str,
        experts: List[PanelExpert],
        context: Optional[str] = None,
        human_feedback: Optional[List[str]] = None
    ) -> PanelExecutionResult:
        start_time = datetime.now(timezone.utc)
        rounds = []

        logger.info("Starting Hybrid Panel", expert_count=len(experts))

        # Round 1: AI expert initial analysis
        round_1_responses = []

        async def get_ai_response(expert: PanelExpert) -> PanelResponse:
            prompt = f"""HYBRID PANEL - AI Expert Analysis

Question: {question}

{f"Context: {context}" if context else ""}

You are an AI expert providing analysis that will be reviewed by human experts.

Please provide:
1. Your analysis and recommendations
2. Areas where human expertise would be valuable
3. Questions for human reviewers
4. Confidence level and limitations

Be clear about AI limitations and where human judgment is essential."""

            return await self._get_expert_response(
                expert, prompt, ResponseType.ANALYSIS, round_number=1
            )

        tasks = [get_ai_response(expert) for expert in experts]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

        round_1_responses = [r for r in responses if isinstance(r, PanelResponse)]

        rounds.append(PanelRoundResult(
            round_number=1,
            responses=round_1_responses,
            consensus_score=0.0,
            key_points=[],
            questions_raised=self._extract_questions_for_humans(round_1_responses)
        ))

        # Round 2: Incorporate human feedback (if provided)
        if human_feedback:
            round_2_responses = []

            feedback_text = "\n".join([f"- {fb}" for fb in human_feedback])

            for i, expert in enumerate(experts):
                original = round_1_responses[i] if i < len(round_1_responses) else None

                prompt = f"""HYBRID PANEL - Revised Analysis with Human Feedback

Original question: {question}

Your initial analysis:
{original.content if original else "Not available"}

HUMAN EXPERT FEEDBACK:
{feedback_text}

Please revise your analysis incorporating the human feedback:
1. Address the feedback points
2. Revise recommendations as appropriate
3. Note areas of agreement/disagreement with human reviewers
4. Provide final recommendations"""

                response = await self._get_expert_response(
                    expert, prompt, ResponseType.SYNTHESIS, round_number=2
                )
                round_2_responses.append(response)

            rounds.append(PanelRoundResult(
                round_number=2,
                responses=round_2_responses,
                consensus_score=0.0,
                key_points=[]
            ))

        # Calculate final consensus
        final_responses = rounds[-1].responses
        response_dicts = [
            {"agent_name": r.agent_name, "content": r.content, "confidence": r.confidence}
            for r in final_responses
        ]
        final_consensus = await self.consensus_analyzer.analyze_consensus(
            question, response_dicts
        )

        execution_time = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

        return PanelExecutionResult(
            panel_type="hybrid",
            question=question,
            rounds=rounds,
            final_consensus=final_consensus,
            execution_time_ms=execution_time,
            metadata={
                "human_feedback_received": bool(human_feedback),
                "questions_for_humans": rounds[0].questions_raised if rounds else [],
                "collaboration_mode": "ai_first_human_review"
            }
        )

    def _extract_questions_for_humans(self, responses: List[PanelResponse]) -> List[str]:
        """Extract questions that AI experts want to ask human reviewers"""
        questions = []
        for r in responses:
            # Look for explicit questions
            sentences = r.content.replace('?', '?\n').split('\n')
            for s in sentences:
                s = s.strip()
                if s.endswith('?') and len(s) > 15:
                    # Filter for questions about human judgment
                    if any(keyword in s.lower() for keyword in
                           ['human', 'expert', 'judgment', 'opinion', 'review', 'validate', 'confirm']):
                        questions.append(s)

        return questions[:5]


# =============================================================================
# Factory
# =============================================================================

def create_panel_handler(
    panel_type: str,
    llm_service: LLMService,
    consensus_analyzer: AdvancedConsensusAnalyzer,
    **kwargs
) -> BasePanelHandler:
    """Create the appropriate panel handler for the given type"""
    handlers = {
        "structured": StructuredPanelHandler,
        "open": OpenPanelHandler,
        "socratic": SocraticPanelHandler,
        "adversarial": AdversarialPanelHandler,
        "delphi": DelphiPanelHandler,
        "hybrid": HybridPanelHandler
    }

    handler_class = handlers.get(panel_type.lower())
    if not handler_class:
        raise ValueError(f"Unknown panel type: {panel_type}. Valid types: {list(handlers.keys())}")

    return handler_class(llm_service, consensus_analyzer, **kwargs)
