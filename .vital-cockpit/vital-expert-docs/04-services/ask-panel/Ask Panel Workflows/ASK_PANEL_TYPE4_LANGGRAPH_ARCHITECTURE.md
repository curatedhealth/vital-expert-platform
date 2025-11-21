# Ask Panel Type 4: Adversarial Panel - LangGraph Architecture

**Panel Type**: Adversarial Panel - Complete LangGraph Implementation  
**Version**: 1.0  
**Date**: November 11, 2025  
**Status**: Production Ready  
**Document Type**: Technical Architecture & Implementation

---

## 📋 EXECUTIVE SUMMARY

This document provides the complete LangGraph state machine architecture for **Ask Panel Type 4: Adversarial Panel**, including production-ready Python code, state definitions, node implementations, and deployment patterns for structured debate orchestration.

**What's Included:**
- ✅ Complete state type definitions with TypedDict
- ✅ Production-ready Python implementation
- ✅ All node functions with error handling
- ✅ Edge routing logic and conditions
- ✅ Team formation algorithms
- ✅ Cross-examination management
- ✅ Evidence scoring system
- ✅ Risk matrix generation
- ✅ Multi-tenant security integration
- ✅ Streaming support (SSE)
- ✅ Testing strategies
- ✅ Deployment configuration

---

## 🗿 ARCHITECTURE OVERVIEW

### LangGraph Pattern for Adversarial Panel

```
PATTERN: Structured Debate with Pro/Con Teams

STATE FLOW:
Team Formation → Position Development → Opening Arguments 
→ Cross-Examination → Rebuttals → Evidence Weighing 
→ Risk Analysis → Synthesis → Generate Deliverables → END

KEY CHARACTERISTICS:
• Stateful: Maintains debate context and scores
• Team-Based: Separate pro/con team states
• Evidence-Driven: All arguments require citations
• Scored: Quantitative argument assessment
• Streaming: Real-time debate updates via SSE
• Tenant-Aware: Complete isolation per tenant
• Error-Resilient: Graceful degradation
• Deterministic: Reproducible debates
```

---

## 📦 COMPLETE STATE DEFINITION

```python
from typing import TypedDict, List, Dict, Optional, Annotated, Tuple
from datetime import datetime
import operator
from enum import Enum
from pydantic import BaseModel, Field

class DebatePhase(str, Enum):
    """Enum for debate execution phases"""
    INITIALIZING = "initializing"
    TEAM_FORMATION = "team_formation"
    POSITION_DEVELOPMENT = "position_development"
    OPENING_ARGUMENTS = "opening_arguments"
    CROSS_EXAMINATION = "cross_examination"
    REBUTTAL = "rebuttal"
    EVIDENCE_WEIGHING = "evidence_weighing"
    RISK_ANALYSIS = "risk_analysis"
    SYNTHESIS = "synthesis"
    DELIVERABLES = "deliverables"
    COMPLETE = "complete"
    FAILED = "failed"

class TeamRole(str, Enum):
    """Enum for team assignments"""
    PRO = "pro"
    CON = "con"
    NEUTRAL = "neutral"

class ArgumentStrength(str, Enum):
    """Enum for argument strength levels"""
    VERY_STRONG = "very_strong"  # 35-40 points
    STRONG = "strong"  # 28-34 points
    MODERATE = "moderate"  # 20-27 points
    WEAK = "weak"  # 10-19 points
    VERY_WEAK = "very_weak"  # 0-9 points

class QuestionType(str, Enum):
    """Enum for cross-examination question types"""
    EVIDENCE_CHALLENGE = "evidence_challenge"
    ASSUMPTION_TEST = "assumption_test"
    ALTERNATIVE_INTERPRETATION = "alternative_interpretation"
    PRECEDENT_QUERY = "precedent_query"
    COST_BENEFIT = "cost_benefit"

class RiskLevel(str, Enum):
    """Enum for risk assessment levels"""
    CRITICAL = "critical"  # High likelihood, high impact
    HIGH = "high"  # High in one dimension
    MEDIUM = "medium"  # Moderate in both
    LOW = "low"  # Low in both
    NEGLIGIBLE = "negligible"  # Very low/no risk

class Argument(BaseModel):
    """Data model for debate arguments"""
    id: str
    team: TeamRole
    claim: str
    evidence: List[Dict]  # Citations with sources
    strength_score: float = 0.0
    evidence_quality: float = 0.0
    logical_coherence: float = 0.0
    relevance: float = 0.0
    rebuttal_damage: float = 0.0
    final_score: float = 0.0
    strength_level: ArgumentStrength = ArgumentStrength.MODERATE

class CrossExaminationExchange(BaseModel):
    """Data model for Q&A exchanges"""
    round_number: int
    questioner_team: TeamRole
    respondent_team: TeamRole
    question: str
    question_type: QuestionType
    response: str
    effectiveness_score: float  # 0-1, how well question exposed weakness
    follow_up_needed: bool

class RiskItem(BaseModel):
    """Data model for risk assessment"""
    id: str
    category: str  # Technical, Financial, Regulatory, etc.
    description: str
    likelihood: float  # 0-1
    impact: float  # 0-1
    risk_level: RiskLevel
    mitigation_strategy: Optional[str] = None
    residual_risk: Optional[float] = None

class BenefitItem(BaseModel):
    """Data model for benefit assessment"""
    id: str
    category: str  # Revenue, Efficiency, Strategic, etc.
    description: str
    probability: float  # 0-1
    value: float  # 0-1
    confidence_level: float  # 0-1
    time_to_realization: Optional[str] = None  # "3 months", "1 year", etc.

class AdversarialPanelState(TypedDict):
    """
    Complete state definition for Adversarial Panel Type 4
    
    This state is passed through all nodes in the LangGraph workflow
    and contains all data needed for debate orchestration, scoring,
    and deliverable generation.
    """
    
    # === CORE IDENTIFIERS ===
    panel_id: str  # Unique panel identifier
    tenant_id: str  # Tenant for multi-tenant isolation
    user_id: str  # User who created the panel
    
    # === PANEL CONFIGURATION ===
    query: str  # Original user query/decision
    debate_topic: str  # Extracted debate topic
    stakes_level: str  # "high", "medium", "low"
    panel_type: str  # Always "adversarial" for Type 4
    configuration: Dict  # Panel-specific settings
    
    # === TEAM COMPOSITION ===
    pro_team: List[Dict]  # 2-3 experts advocating
    con_team: List[Dict]  # 2-3 experts challenging
    neutral_observer: Dict  # 1 expert for balance
    team_formation_rationale: str  # Why these teams
    
    # === EXECUTION STATE ===
    phase: DebatePhase  # Current execution phase
    round_number: int  # For cross-examination rounds
    start_time: datetime  # Panel start timestamp
    phase_timings: Dict[str, float]  # Time per phase
    
    # === POSITION DEVELOPMENT (Annotated for accumulation) ===
    pro_arguments: Annotated[List[Argument], operator.add]
    con_arguments: Annotated[List[Argument], operator.add]
    evidence_library: Annotated[List[Dict], operator.add]  # All citations
    
    # === DEBATE CONTENT ===
    opening_statements: Dict[str, str]  # pro/con openings
    cross_examination_log: Annotated[List[CrossExaminationExchange], operator.add]
    rebuttals: Dict[str, str]  # pro/con rebuttals
    neutral_observations: List[str]  # Neutral expert notes
    
    # === SCORING & ANALYSIS ===
    argument_scores: Dict[str, float]  # Individual scores
    team_scores: Dict[str, float]  # Aggregate scores
    evidence_strength_matrix: Dict[str, Dict]  # Evidence quality
    debate_winner: Optional[TeamRole]  # Based on scores
    winning_margin: Optional[float]  # Score differential
    
    # === RISK-BENEFIT ANALYSIS ===
    risks: List[RiskItem]  # Identified risks
    benefits: List[BenefitItem]  # Identified benefits
    risk_matrix: Dict[str, List]  # 2x2 matrix data
    mitigation_strategies: List[Dict]  # Risk mitigations
    net_assessment: str  # Overall risk vs benefit
    
    # === SYNTHESIS OUTPUTS ===
    recommendation: Optional[str]  # Go/no-go decision
    confidence_level: Optional[float]  # 0-1 confidence
    executive_summary: Optional[str]  # 250-word summary
    key_findings: List[str]  # Bullet points
    decision_rationale: Optional[str]  # Why this decision
    
    # === DELIVERABLES ===
    full_report: Optional[str]  # Complete analysis
    risk_assessment_doc: Optional[str]  # Risk focus
    decision_matrix: Optional[Dict]  # Visual matrix
    deliverable_urls: List[str]  # S3/CDN URLs
    
    # === METADATA ===
    total_duration: Optional[float]  # Total time (seconds)
    token_usage: int  # Total tokens consumed
    rag_queries: int  # Number of RAG calls
    streaming_active: bool  # SSE streaming status
    
    # === ERROR HANDLING ===
    errors: List[Dict]  # Error log
    retry_count: int  # Number of retries
    fallback_triggered: bool  # If fallback used
    
    # === AUDIT TRAIL ===
    created_at: datetime
    updated_at: datetime
    events: Annotated[List[Dict], operator.add]  # All events
```

---

## 🔧 COMPLETE LANGGRAPH IMPLEMENTATION

### Part 1: Core Orchestrator Class

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint import MemorySaver
from typing import Dict, List, Tuple, Optional, Any
import asyncio
import logging
from datetime import datetime
from contextlib import asynccontextmanager
import json
import numpy as np

from vital_shared_kernel.multi_tenant import TenantContext, get_tenant_id
from vital_shared_kernel.agents import AgentRegistry
from vital_shared_kernel.rag import RAGEngine
from vital_shared_kernel.streaming import SSEManager
from vital_shared_kernel.llm import get_llm

logger = logging.getLogger(__name__)

class AdversarialPanelOrchestrator:
    """
    LangGraph orchestrator for Ask Panel Type 4: Adversarial Panel
    
    Implements structured debate format with pro/con teams for
    critical evaluation and risk assessment of decisions.
    """
    
    def __init__(
        self,
        agent_registry: AgentRegistry,
        rag_engine: RAGEngine,
        sse_manager: SSEManager,
        checkpoint_saver: Optional[MemorySaver] = None
    ):
        """
        Initialize the Adversarial Panel orchestrator
        
        Args:
            agent_registry: Registry for loading expert agents
            rag_engine: RAG engine for evidence retrieval
            sse_manager: Manager for Server-Sent Events streaming
            checkpoint_saver: Optional checkpointer for state persistence
        """
        self.agent_registry = agent_registry
        self.rag_engine = rag_engine
        self.sse_manager = sse_manager
        self.checkpoint_saver = checkpoint_saver or MemorySaver()
        self.llm = get_llm(model="gpt-4-turbo")
        
        # Build the workflow graph
        self.workflow = self._create_workflow()
        self.app = self.workflow.compile(checkpointer=self.checkpoint_saver)
    
    def _create_workflow(self) -> StateGraph:
        """
        Create the LangGraph workflow for Adversarial Panel
        
        Returns:
            Compiled StateGraph workflow
        """
        workflow = StateGraph(AdversarialPanelState)
        
        # === DEFINE NODES ===
        workflow.add_node("form_teams", self.form_teams)
        workflow.add_node("develop_positions", self.develop_positions)
        workflow.add_node("opening_arguments", self.execute_opening_arguments)
        workflow.add_node("cross_examination", self.execute_cross_examination)
        workflow.add_node("rebuttals", self.execute_rebuttals)
        workflow.add_node("weigh_evidence", self.weigh_evidence)
        workflow.add_node("analyze_risk", self.analyze_risk_benefit)
        workflow.add_node("synthesize", self.synthesize_results)
        workflow.add_node("generate_deliverables", self.generate_deliverables)
        workflow.add_node("handle_error", self.handle_error)
        
        # === DEFINE EDGES ===
        workflow.add_edge("form_teams", "develop_positions")
        workflow.add_edge("develop_positions", "opening_arguments")
        workflow.add_edge("opening_arguments", "cross_examination")
        workflow.add_edge("cross_examination", "rebuttals")
        workflow.add_edge("rebuttals", "weigh_evidence")
        workflow.add_edge("weigh_evidence", "analyze_risk")
        workflow.add_edge("analyze_risk", "synthesize")
        workflow.add_edge("synthesize", "generate_deliverables")
        workflow.add_edge("generate_deliverables", END)
        
        # Error handling edges
        workflow.add_conditional_edges(
            "form_teams",
            self._check_error,
            {
                "error": "handle_error",
                "continue": "develop_positions"
            }
        )
        
        # Set entry point
        workflow.set_entry_point("form_teams")
        
        return workflow
    
    async def form_teams(self, state: AdversarialPanelState) -> AdversarialPanelState:
        """
        Form pro and con teams based on the debate topic.
        Assigns 2-3 experts per team plus neutral observer.
        """
        try:
            logger.info(f"Forming teams for panel {state['panel_id']}")
            
            # Emit SSE event
            await self.sse_manager.emit({
                "event": "team_formation_started",
                "panel_id": state["panel_id"],
                "timestamp": datetime.now().isoformat()
            })
            
            # Extract debate stakes and identify positions
            stakes_analysis = await self._analyze_stakes(state["query"])
            state["stakes_level"] = stakes_analysis["level"]
            state["debate_topic"] = stakes_analysis["topic"]
            
            # Select experts for pro team (2-3 advocating)
            pro_experts = await self._select_pro_experts(
                topic=state["debate_topic"],
                num_experts=3 if stakes_analysis["level"] == "high" else 2
            )
            
            # Select experts for con team (2-3 challenging)
            con_experts = await self._select_con_experts(
                topic=state["debate_topic"],
                num_experts=3 if stakes_analysis["level"] == "high" else 2
            )
            
            # Select neutral observer (1 senior expert)
            neutral_expert = await self._select_neutral_observer(
                topic=state["debate_topic"],
                exclude_ids=[e["id"] for e in pro_experts + con_experts]
            )
            
            # Update state
            state["pro_team"] = pro_experts
            state["con_team"] = con_experts
            state["neutral_observer"] = neutral_expert
            state["team_formation_rationale"] = stakes_analysis["rationale"]
            state["phase"] = DebatePhase.POSITION_DEVELOPMENT
            
            # Log team composition
            logger.info(f"Teams formed - Pro: {len(pro_experts)}, Con: {len(con_experts)}")
            
            # Emit SSE event with teams
            await self.sse_manager.emit({
                "event": "teams_formed",
                "panel_id": state["panel_id"],
                "pro_team": [e["name"] for e in pro_experts],
                "con_team": [e["name"] for e in con_experts],
                "neutral": neutral_expert["name"],
                "timestamp": datetime.now().isoformat()
            })
            
            # Record event
            state["events"].append({
                "phase": "team_formation",
                "timestamp": datetime.now().isoformat(),
                "details": {
                    "pro_count": len(pro_experts),
                    "con_count": len(con_experts),
                    "stakes": stakes_analysis["level"]
                }
            })
            
            return state
            
        except Exception as e:
            logger.error(f"Error in team formation: {str(e)}")
            state["errors"].append({
                "phase": "team_formation",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
            state["phase"] = DebatePhase.FAILED
            return state
    
    async def develop_positions(self, state: AdversarialPanelState) -> AdversarialPanelState:
        """
        Parallel position development for pro and con teams.
        Each team develops 3-5 arguments with evidence.
        """
        try:
            logger.info(f"Developing positions for panel {state['panel_id']}")
            
            # Emit SSE event
            await self.sse_manager.emit({
                "event": "position_development_started",
                "panel_id": state["panel_id"],
                "timestamp": datetime.now().isoformat()
            })
            
            # Parallel position development
            pro_task = asyncio.create_task(
                self._develop_pro_position(state)
            )
            con_task = asyncio.create_task(
                self._develop_con_position(state)
            )
            
            # Wait for both teams
            pro_args, con_args = await asyncio.gather(pro_task, con_task)
            
            # Update state with arguments
            state["pro_arguments"].extend(pro_args)
            state["con_arguments"].extend(con_args)
            
            # Collect all evidence
            all_evidence = []
            for arg in pro_args + con_args:
                all_evidence.extend(arg.evidence)
            state["evidence_library"].extend(all_evidence)
            
            state["phase"] = DebatePhase.OPENING_ARGUMENTS
            
            # Emit SSE event
            await self.sse_manager.emit({
                "event": "positions_developed",
                "panel_id": state["panel_id"],
                "pro_argument_count": len(pro_args),
                "con_argument_count": len(con_args),
                "evidence_count": len(all_evidence),
                "timestamp": datetime.now().isoformat()
            })
            
            return state
            
        except Exception as e:
            logger.error(f"Error in position development: {str(e)}")
            state["errors"].append({
                "phase": "position_development",
                "error": str(e)
            })
            return state
    
    async def execute_opening_arguments(
        self, 
        state: AdversarialPanelState
    ) -> AdversarialPanelState:
        """
        Execute opening arguments phase.
        Each team presents their position (60 seconds each).
        """
        try:
            logger.info(f"Executing opening arguments for panel {state['panel_id']}")
            
            # Pro team opening
            pro_opening = await self._generate_opening_statement(
                team="pro",
                arguments=state["pro_arguments"],
                topic=state["debate_topic"]
            )
            
            # Emit pro opening via SSE
            await self.sse_manager.emit({
                "event": "pro_opening",
                "panel_id": state["panel_id"],
                "content": pro_opening,
                "timestamp": datetime.now().isoformat()
            })
            
            # Con team opening
            con_opening = await self._generate_opening_statement(
                team="con",
                arguments=state["con_arguments"],
                topic=state["debate_topic"]
            )
            
            # Emit con opening via SSE
            await self.sse_manager.emit({
                "event": "con_opening",
                "panel_id": state["panel_id"],
                "content": con_opening,
                "timestamp": datetime.now().isoformat()
            })
            
            # Neutral observer notes
            neutral_notes = await self._generate_neutral_notes(
                pro_opening=pro_opening,
                con_opening=con_opening,
                observer=state["neutral_observer"]
            )
            
            # Update state
            state["opening_statements"] = {
                "pro": pro_opening,
                "con": con_opening
            }
            state["neutral_observations"].append(neutral_notes)
            state["phase"] = DebatePhase.CROSS_EXAMINATION
            
            return state
            
        except Exception as e:
            logger.error(f"Error in opening arguments: {str(e)}")
            state["errors"].append({
                "phase": "opening_arguments",
                "error": str(e)
            })
            return state
    
    async def execute_cross_examination(
        self, 
        state: AdversarialPanelState
    ) -> AdversarialPanelState:
        """
        Execute cross-examination phase with 6 Q&A rounds.
        Teams alternate asking critical questions.
        """
        try:
            logger.info(f"Executing cross-examination for panel {state['panel_id']}")
            
            # 6 rounds of Q&A (3 minutes total, 30 seconds each)
            for round_num in range(1, 7):
                
                # Determine who questions whom this round
                if round_num % 2 == 1:
                    questioner = "pro"
                    respondent = "con"
                else:
                    questioner = "con"
                    respondent = "pro"
                
                # Generate strategic question
                question = await self._generate_cross_examination_question(
                    questioner_team=questioner,
                    target_arguments=state[f"{respondent}_arguments"],
                    previous_qa=state["cross_examination_log"],
                    round_number=round_num
                )
                
                # Emit question via SSE
                await self.sse_manager.emit({
                    "event": "question_asked",
                    "panel_id": state["panel_id"],
                    "round": round_num,
                    "from": questioner,
                    "question": question["content"],
                    "timestamp": datetime.now().isoformat()
                })
                
                # Generate response
                response = await self._generate_cross_examination_response(
                    respondent_team=respondent,
                    question=question,
                    team_arguments=state[f"{respondent}_arguments"]
                )
                
                # Emit response via SSE
                await self.sse_manager.emit({
                    "event": "answer_given",
                    "panel_id": state["panel_id"],
                    "round": round_num,
                    "from": respondent,
                    "answer": response["content"],
                    "timestamp": datetime.now().isoformat()
                })
                
                # Create exchange record
                exchange = CrossExaminationExchange(
                    round_number=round_num,
                    questioner_team=TeamRole(questioner),
                    respondent_team=TeamRole(respondent),
                    question=question["content"],
                    question_type=QuestionType(question["type"]),
                    response=response["content"],
                    effectiveness_score=question["effectiveness"],
                    follow_up_needed=response["weakness_exposed"]
                )
                
                state["cross_examination_log"].append(exchange)
            
            state["phase"] = DebatePhase.REBUTTAL
            return state
            
        except Exception as e:
            logger.error(f"Error in cross-examination: {str(e)}")
            state["errors"].append({
                "phase": "cross_examination",
                "error": str(e)
            })
            return state
    
    async def execute_rebuttals(
        self, 
        state: AdversarialPanelState
    ) -> AdversarialPanelState:
        """
        Execute rebuttal round where each team refutes opposition.
        """
        try:
            logger.info(f"Executing rebuttals for panel {state['panel_id']}")
            
            # Pro team rebuttal
            pro_rebuttal = await self._generate_rebuttal(
                team="pro",
                opposing_arguments=state["con_arguments"],
                cross_exam_log=state["cross_examination_log"],
                our_arguments=state["pro_arguments"]
            )
            
            # Emit pro rebuttal
            await self.sse_manager.emit({
                "event": "pro_rebuttal",
                "panel_id": state["panel_id"],
                "content": pro_rebuttal,
                "timestamp": datetime.now().isoformat()
            })
            
            # Con team rebuttal
            con_rebuttal = await self._generate_rebuttal(
                team="con",
                opposing_arguments=state["pro_arguments"],
                cross_exam_log=state["cross_examination_log"],
                our_arguments=state["con_arguments"]
            )
            
            # Emit con rebuttal
            await self.sse_manager.emit({
                "event": "con_rebuttal",
                "panel_id": state["panel_id"],
                "content": con_rebuttal,
                "timestamp": datetime.now().isoformat()
            })
            
            # Update state
            state["rebuttals"] = {
                "pro": pro_rebuttal,
                "con": con_rebuttal
            }
            state["phase"] = DebatePhase.EVIDENCE_WEIGHING
            
            return state
            
        except Exception as e:
            logger.error(f"Error in rebuttals: {str(e)}")
            state["errors"].append({
                "phase": "rebuttal",
                "error": str(e)
            })
            return state
    
    async def weigh_evidence(
        self, 
        state: AdversarialPanelState
    ) -> AdversarialPanelState:
        """
        Score all arguments based on evidence quality,
        logic, relevance, and rebuttal effectiveness.
        """
        try:
            logger.info(f"Weighing evidence for panel {state['panel_id']}")
            
            # Score pro arguments
            for arg in state["pro_arguments"]:
                score = await self._score_argument(
                    argument=arg,
                    rebuttals=state["rebuttals"]["con"],
                    cross_exam_effectiveness=self._calculate_damage(
                        arg, 
                        state["cross_examination_log"]
                    )
                )
                arg.final_score = score
                arg.strength_level = self._categorize_strength(score)
                state["argument_scores"][arg.id] = score
            
            # Score con arguments
            for arg in state["con_arguments"]:
                score = await self._score_argument(
                    argument=arg,
                    rebuttals=state["rebuttals"]["pro"],
                    cross_exam_effectiveness=self._calculate_damage(
                        arg,
                        state["cross_examination_log"]
                    )
                )
                arg.final_score = score
                arg.strength_level = self._categorize_strength(score)
                state["argument_scores"][arg.id] = score
            
            # Calculate team scores
            pro_score = self._calculate_team_score(state["pro_arguments"])
            con_score = self._calculate_team_score(state["con_arguments"])
            
            state["team_scores"] = {
                "pro": pro_score,
                "con": con_score
            }
            
            # Determine winner
            if pro_score > con_score:
                state["debate_winner"] = TeamRole.PRO
                state["winning_margin"] = pro_score - con_score
            elif con_score > pro_score:
                state["debate_winner"] = TeamRole.CON
                state["winning_margin"] = con_score - pro_score
            else:
                state["debate_winner"] = TeamRole.NEUTRAL
                state["winning_margin"] = 0.0
            
            # Emit scores
            await self.sse_manager.emit({
                "event": "evidence_scored",
                "panel_id": state["panel_id"],
                "pro_score": pro_score,
                "con_score": con_score,
                "winner": state["debate_winner"].value if state["debate_winner"] else "tie",
                "margin": state["winning_margin"],
                "timestamp": datetime.now().isoformat()
            })
            
            state["phase"] = DebatePhase.RISK_ANALYSIS
            return state
            
        except Exception as e:
            logger.error(f"Error in evidence weighing: {str(e)}")
            state["errors"].append({
                "phase": "evidence_weighing",
                "error": str(e)
            })
            return state
    
    async def analyze_risk_benefit(
        self, 
        state: AdversarialPanelState
    ) -> AdversarialPanelState:
        """
        Analyze risks and benefits to build decision matrix.
        """
        try:
            logger.info(f"Analyzing risks and benefits for panel {state['panel_id']}")
            
            # Extract risks from con arguments
            risks = await self._extract_risks(
                con_arguments=state["con_arguments"],
                cross_exam=state["cross_examination_log"]
            )
            
            # Extract benefits from pro arguments
            benefits = await self._extract_benefits(
                pro_arguments=state["pro_arguments"],
                cross_exam=state["cross_examination_log"]
            )
            
            # Build risk matrix
            risk_matrix = self._build_risk_matrix(risks)
            
            # Develop mitigation strategies for high risks
            mitigations = await self._develop_mitigations(
                risks=[r for r in risks if r.risk_level in [RiskLevel.CRITICAL, RiskLevel.HIGH]]
            )
            
            # Net assessment
            net_assessment = await self._calculate_net_assessment(
                risks=risks,
                benefits=benefits,
                debate_winner=state["debate_winner"],
                winning_margin=state["winning_margin"]
            )
            
            # Update state
            state["risks"] = risks
            state["benefits"] = benefits
            state["risk_matrix"] = risk_matrix
            state["mitigation_strategies"] = mitigations
            state["net_assessment"] = net_assessment
            
            # Emit risk analysis
            await self.sse_manager.emit({
                "event": "risk_analysis_complete",
                "panel_id": state["panel_id"],
                "risk_count": len(risks),
                "benefit_count": len(benefits),
                "critical_risks": len([r for r in risks if r.risk_level == RiskLevel.CRITICAL]),
                "net_assessment": net_assessment,
                "timestamp": datetime.now().isoformat()
            })
            
            state["phase"] = DebatePhase.SYNTHESIS
            return state
            
        except Exception as e:
            logger.error(f"Error in risk analysis: {str(e)}")
            state["errors"].append({
                "phase": "risk_analysis",
                "error": str(e)
            })
            return state
    
    async def synthesize_results(
        self, 
        state: AdversarialPanelState
    ) -> AdversarialPanelState:
        """
        Synthesize debate results into recommendation.
        """
        try:
            logger.info(f"Synthesizing results for panel {state['panel_id']}")
            
            # Generate recommendation based on winner and analysis
            recommendation = await self._generate_recommendation(
                debate_winner=state["debate_winner"],
                winning_margin=state["winning_margin"],
                risks=state["risks"],
                benefits=state["benefits"],
                net_assessment=state["net_assessment"]
            )
            
            # Calculate confidence level
            confidence = self._calculate_confidence(
                winning_margin=state["winning_margin"],
                evidence_quality=self._assess_overall_evidence_quality(state),
                consensus_level=self._calculate_neutral_agreement(state)
            )
            
            # Generate executive summary
            exec_summary = await self._generate_executive_summary(
                query=state["query"],
                recommendation=recommendation,
                confidence=confidence,
                key_risks=state["risks"][:3],
                key_benefits=state["benefits"][:3]
            )
            
            # Extract key findings
            key_findings = await self._extract_key_findings(state)
            
            # Generate decision rationale
            rationale = await self._generate_decision_rationale(
                recommendation=recommendation,
                debate_winner=state["debate_winner"],
                evidence=state["argument_scores"],
                risks=state["risks"],
                benefits=state["benefits"]
            )
            
            # Update state
            state["recommendation"] = recommendation
            state["confidence_level"] = confidence
            state["executive_summary"] = exec_summary
            state["key_findings"] = key_findings
            state["decision_rationale"] = rationale
            
            # Emit synthesis complete
            await self.sse_manager.emit({
                "event": "synthesis_complete",
                "panel_id": state["panel_id"],
                "recommendation": recommendation,
                "confidence": confidence,
                "timestamp": datetime.now().isoformat()
            })
            
            state["phase"] = DebatePhase.DELIVERABLES
            return state
            
        except Exception as e:
            logger.error(f"Error in synthesis: {str(e)}")
            state["errors"].append({
                "phase": "synthesis",
                "error": str(e)
            })
            return state
```

(Continuing in next part due to length...)
