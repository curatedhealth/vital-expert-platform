"""
Panel Creation Wizard LangGraph Workflow

AI-guided panel creation with HITL checkpoints:
1. Parse Intent → User confirms goals
2. Generate Questions → User confirms questions
3. Suggest Panel Type → User confirms type
4. Search Agents → User confirms agents
5. Generate Proposal → Launch/Save
"""

import os
import json
import structlog
from enum import Enum
from typing import Any, Dict, List, Optional, TypedDict
from uuid import uuid4
from datetime import datetime, timezone

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

logger = structlog.get_logger(__name__)


# =============================================================================
# ENUMS & TYPES
# =============================================================================

class WizardStep(str, Enum):
    """Wizard step identifiers"""
    INTENT_INPUT = "intent_input"
    PARSE_INTENT = "parse_intent"
    CONFIRM_GOALS = "confirm_goals"
    GENERATE_QUESTIONS = "generate_questions"
    CONFIRM_QUESTIONS = "confirm_questions"
    SUGGEST_PANEL_TYPE = "suggest_panel_type"
    CONFIRM_PANEL_TYPE = "confirm_panel_type"
    SEARCH_AGENTS = "search_agents"
    CONFIRM_AGENTS = "confirm_agents"
    GENERATE_PROPOSAL = "generate_proposal"
    COMPLETED = "completed"


class Objective(TypedDict):
    """Panel objective"""
    id: str
    text: str
    is_user_added: bool


class Question(TypedDict):
    """Panel discussion question"""
    id: str
    question: str
    rationale: str
    assigned_to: str  # 'all' or agent role
    priority: str  # high, medium, low
    expected_output: str
    is_user_added: bool
    order: int


class AgentRecommendation(TypedDict):
    """Recommended agent for panel"""
    agent_id: str
    name: str
    relevance_score: float
    match_reasons: List[str]
    role_in_panel: str
    is_user_added: bool


class PanelWizardState(TypedDict, total=False):
    """State for Panel Creation Wizard"""
    # Session info
    session_id: str
    tenant_id: str
    user_id: str
    created_at: str
    updated_at: str

    # Current step
    current_step: str
    status: str  # in_progress, completed, abandoned

    # Step 1: Raw input
    raw_prompt: str

    # Step 2: Parsed intent
    primary_intent: str
    domain: str
    therapeutic_area: str
    objectives: List[Objective]
    constraints: List[str]
    success_criteria: List[str]
    intent_confidence: float
    goals_confirmed: bool
    goals_confirmed_at: str

    # Steps 3-4: Questions
    questions: List[Question]
    suggested_question_count: int
    estimated_discussion_time: str
    questions_confirmed: bool
    questions_confirmed_at: str

    # Step 5: Panel type
    recommended_panel_type: str
    panel_type_rationale: str
    panel_type_confidence: float
    alternative_types: List[Dict[str, Any]]
    selected_panel_type: str
    panel_settings: Dict[str, Any]
    panel_type_confirmed: bool
    panel_type_confirmed_at: str

    # Steps 6-7: Agents
    recommended_agents: List[AgentRecommendation]
    selected_agents: List[AgentRecommendation]
    composition_rationale: str
    diversity_score: float
    agents_confirmed: bool
    agents_confirmed_at: str

    # Step 8: Final proposal
    proposal: Dict[str, Any]
    saved_as: str  # draft, template, or None
    launched_at: str

    # Error handling
    error: str
    error_step: str

    # HITL checkpoint
    awaiting_confirmation: str  # Which confirmation is pending
    user_feedback: str  # User's feedback/modifications


# =============================================================================
# LLM UTILITIES
# =============================================================================

def get_openai_client():
    """Get OpenAI client for LLM calls"""
    try:
        from openai import OpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not set")
        return OpenAI(api_key=api_key)
    except ImportError:
        raise ImportError("openai package not installed")


async def call_llm(prompt: str, system_prompt: str, model: str = "gpt-4-turbo") -> str:
    """Call LLM with prompt and return response"""
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error("llm_call_failed", error=str(e)[:200])
        raise


async def call_llm_json(prompt: str, system_prompt: str, model: str = "gpt-4-turbo") -> Dict[str, Any]:
    """Call LLM and parse JSON response"""
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except json.JSONDecodeError as e:
        logger.error("llm_json_parse_failed", error=str(e)[:200])
        return {}
    except Exception as e:
        logger.error("llm_call_failed", error=str(e)[:200])
        raise


# =============================================================================
# WORKFLOW NODES
# =============================================================================

async def _parse_intent(state: PanelWizardState) -> Dict[str, Any]:
    """
    Step 2: Parse user's natural language prompt into structured goals.

    Uses LLM to extract:
    - Primary intent
    - Domain/therapeutic area
    - Key objectives
    - Constraints
    - Success criteria
    """
    raw_prompt = state.get("raw_prompt", "")

    if not raw_prompt or len(raw_prompt) < 20:
        return {
            "error": "Prompt too short. Please provide more detail about your panel needs.",
            "error_step": "parse_intent",
            "current_step": WizardStep.INTENT_INPUT.value,
        }

    system_prompt = """You are an AI assistant that helps parse user intent for creating expert panel discussions.

Analyze the user's request and extract structured information. Return a JSON object with:
{
    "primary_intent": "One sentence describing the main goal",
    "domain": "Industry domain (e.g., Pharmaceuticals, Healthcare, Biotech)",
    "therapeutic_area": "Specific area if mentioned (e.g., Oncology, Diabetes, Rare Disease)",
    "objectives": ["List of 3-5 specific objectives"],
    "constraints": ["Any constraints or requirements mentioned"],
    "success_criteria": ["What would make this panel successful"],
    "confidence_score": 0.0-1.0 confidence in your parsing
}

Focus on pharmaceutical and healthcare domains. Be specific and actionable."""

    try:
        result = await call_llm_json(
            prompt=f"Parse this panel creation request:\n\n{raw_prompt}",
            system_prompt=system_prompt,
        )

        # Build objectives with IDs
        objectives = [
            {
                "id": f"obj_{i}",
                "text": obj,
                "is_user_added": False,
            }
            for i, obj in enumerate(result.get("objectives", []))
        ]

        logger.info(
            "wizard_intent_parsed",
            primary_intent=result.get("primary_intent", "")[:100],
            objective_count=len(objectives),
            confidence=result.get("confidence_score", 0),
        )

        return {
            "primary_intent": result.get("primary_intent", ""),
            "domain": result.get("domain", ""),
            "therapeutic_area": result.get("therapeutic_area", ""),
            "objectives": objectives,
            "constraints": result.get("constraints", []),
            "success_criteria": result.get("success_criteria", []),
            "intent_confidence": result.get("confidence_score", 0.8),
            "current_step": WizardStep.CONFIRM_GOALS.value,
            "awaiting_confirmation": "goals",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

    except Exception as e:
        logger.error("wizard_parse_intent_failed", error=str(e)[:200])
        return {
            "error": f"Failed to parse intent: {str(e)[:100]}",
            "error_step": "parse_intent",
            "current_step": WizardStep.INTENT_INPUT.value,
        }


async def _generate_questions(state: PanelWizardState) -> Dict[str, Any]:
    """
    Step 3: Generate facilitation questions based on confirmed goals.

    Creates discussion questions for the panel based on:
    - Primary intent
    - Objectives
    - Domain context
    """
    primary_intent = state.get("primary_intent", "")
    objectives = state.get("objectives", [])
    domain = state.get("domain", "")
    therapeutic_area = state.get("therapeutic_area", "")

    objectives_text = "\n".join([f"- {obj['text']}" for obj in objectives])

    system_prompt = """You are an expert facilitator for pharmaceutical and healthcare expert panels.

Generate discussion questions that will guide the panel effectively. Return a JSON object with:
{
    "questions": [
        {
            "question": "The question text",
            "rationale": "Why this question matters",
            "assigned_to": "all" or specific role like "regulatory_expert",
            "priority": "high", "medium", or "low",
            "expected_output": "What type of output is expected"
        }
    ],
    "suggested_question_count": 5,
    "estimated_discussion_time": "45-60 minutes"
}

Generate 4-6 questions that:
1. Cover the main objectives
2. Are specific and actionable
3. Build on each other logically
4. Include both strategic and tactical questions"""

    prompt = f"""Generate panel discussion questions for:

Intent: {primary_intent}
Domain: {domain}
Therapeutic Area: {therapeutic_area}

Objectives:
{objectives_text}

Create questions that will help achieve these objectives."""

    try:
        result = await call_llm_json(prompt=prompt, system_prompt=system_prompt)

        # Build questions with IDs and order
        questions = [
            {
                "id": f"q_{i}",
                "question": q.get("question", ""),
                "rationale": q.get("rationale", ""),
                "assigned_to": q.get("assigned_to", "all"),
                "priority": q.get("priority", "medium"),
                "expected_output": q.get("expected_output", ""),
                "is_user_added": False,
                "order": i,
            }
            for i, q in enumerate(result.get("questions", []))
        ]

        logger.info(
            "wizard_questions_generated",
            question_count=len(questions),
            estimated_time=result.get("estimated_discussion_time", ""),
        )

        return {
            "questions": questions,
            "suggested_question_count": result.get("suggested_question_count", len(questions)),
            "estimated_discussion_time": result.get("estimated_discussion_time", "45-60 minutes"),
            "current_step": WizardStep.CONFIRM_QUESTIONS.value,
            "awaiting_confirmation": "questions",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

    except Exception as e:
        logger.error("wizard_generate_questions_failed", error=str(e)[:200])
        return {
            "error": f"Failed to generate questions: {str(e)[:100]}",
            "error_step": "generate_questions",
        }


async def _suggest_panel_type(state: PanelWizardState) -> Dict[str, Any]:
    """
    Step 5: Suggest optimal panel type based on intent and questions.

    Analyzes the goals and questions to recommend:
    - Best panel type (structured, open, socratic, etc.)
    - Alternative options
    - Rationale for recommendation
    """
    primary_intent = state.get("primary_intent", "")
    domain = state.get("domain", "")
    questions = state.get("questions", [])
    objectives = state.get("objectives", [])

    objectives_text = "\n".join([f"- {obj['text']}" for obj in objectives])
    questions_text = "\n".join([f"- {q['question']}" for q in questions[:5]])

    system_prompt = """You are an expert in panel discussion methodologies for pharmaceutical and healthcare contexts.

Recommend the best panel type based on the goals and questions. Return a JSON object with:
{
    "recommended_type": "structured", "open", "socratic", "adversarial", "delphi", or "hybrid",
    "confidence": 0.0-1.0,
    "rationale": "Why this type is best for these goals",
    "alternatives": [
        {
            "type": "alternative_type",
            "fit_score": 0.0-1.0,
            "rationale": "Why this could also work"
        }
    ],
    "suggested_settings": {
        "mode": "sequential" or "parallel",
        "max_rounds": 1-5,
        "require_consensus": true/false,
        "allow_debate": true/false
    }
}

Panel types:
- structured: Sequential, moderated discussion (best for regulatory, compliance)
- open: Free-form brainstorming (best for ideation, exploration)
- socratic: Dialectical questioning (best for deep analysis, assumptions)
- adversarial: Pro/con debate (best for decision validation, risk assessment)
- delphi: Iterative consensus building (best for forecasting, expert opinion)
- hybrid: Human-AI collaboration (best for complex multi-step decisions)"""

    prompt = f"""Recommend panel type for:

Intent: {primary_intent}
Domain: {domain}

Objectives:
{objectives_text}

Key Questions:
{questions_text}"""

    try:
        result = await call_llm_json(prompt=prompt, system_prompt=system_prompt)

        logger.info(
            "wizard_panel_type_suggested",
            recommended_type=result.get("recommended_type", ""),
            confidence=result.get("confidence", 0),
        )

        return {
            "recommended_panel_type": result.get("recommended_type", "structured"),
            "panel_type_rationale": result.get("rationale", ""),
            "panel_type_confidence": result.get("confidence", 0.8),
            "alternative_types": result.get("alternatives", []),
            "panel_settings": result.get("suggested_settings", {
                "mode": "sequential",
                "max_rounds": 2,
                "require_consensus": False,
                "allow_debate": False,
            }),
            "current_step": WizardStep.CONFIRM_PANEL_TYPE.value,
            "awaiting_confirmation": "panel_type",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

    except Exception as e:
        logger.error("wizard_suggest_panel_type_failed", error=str(e)[:200])
        return {
            "error": f"Failed to suggest panel type: {str(e)[:100]}",
            "error_step": "suggest_panel_type",
        }


async def _search_agents(state: PanelWizardState) -> Dict[str, Any]:
    """
    Step 6: Search for relevant agents using Fusion Intelligence.

    Uses PostgreSQL fulltext search (and Pinecone/Neo4j if available)
    to find the best agents for the panel.
    """
    primary_intent = state.get("primary_intent", "")
    domain = state.get("domain", "")
    therapeutic_area = state.get("therapeutic_area", "")
    objectives = state.get("objectives", [])
    tenant_id = state.get("tenant_id", "00000000-0000-0000-0000-000000000001")

    # Build search query from intent and objectives
    search_terms = [primary_intent, domain, therapeutic_area]
    search_terms.extend([obj["text"] for obj in objectives[:3]])
    search_query = " ".join(filter(None, search_terms))

    try:
        # Use existing Fusion search
        from langgraph_workflows.modes34.agent_selector import (
            select_team_async,
            GRAPHRAG_AVAILABLE,
        )

        team = await select_team_async(
            goal=search_query,
            tenant_id=tenant_id,
            metadata={
                "domain": domain,
                "therapeutic_area": therapeutic_area,
            },
            max_agents=6,
            use_graphrag=GRAPHRAG_AVAILABLE,
        )

        # Transform to AgentRecommendation format
        recommended_agents = []
        for i, agent in enumerate(team):
            recommended_agents.append({
                "agent_id": agent.get("id", f"agent_{i}"),
                "name": agent.get("name", f"Expert {i+1}"),
                "relevance_score": agent.get("score", 0.8 - (i * 0.05)),
                "match_reasons": agent.get("match_reasons", [
                    f"Expertise in {domain}",
                    "Relevant to panel objectives",
                ]),
                "role_in_panel": _infer_role(agent, i),
                "is_user_added": False,
            })

        # Generate composition rationale
        rationale = f"This panel combines {len(recommended_agents)} experts with complementary expertise in {domain}"
        if therapeutic_area:
            rationale += f" and {therapeutic_area}"
        rationale += " to address the panel objectives."

        logger.info(
            "wizard_agents_searched",
            agent_count=len(recommended_agents),
            search_method="fusion" if GRAPHRAG_AVAILABLE else "postgres",
        )

        return {
            "recommended_agents": recommended_agents,
            "selected_agents": recommended_agents,  # Start with all recommended
            "composition_rationale": rationale,
            "diversity_score": 0.85,  # Placeholder
            "current_step": WizardStep.CONFIRM_AGENTS.value,
            "awaiting_confirmation": "agents",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

    except Exception as e:
        logger.error("wizard_search_agents_failed", error=str(e)[:200])

        # Fallback: return generic experts
        fallback_agents = [
            {
                "agent_id": str(uuid4()),
                "name": "Domain Expert",
                "relevance_score": 0.9,
                "match_reasons": ["General domain expertise"],
                "role_in_panel": "Lead expert",
                "is_user_added": False,
            },
            {
                "agent_id": str(uuid4()),
                "name": "Strategic Analyst",
                "relevance_score": 0.85,
                "match_reasons": ["Strategic analysis"],
                "role_in_panel": "Strategic advisor",
                "is_user_added": False,
            },
            {
                "agent_id": str(uuid4()),
                "name": "Technical Specialist",
                "relevance_score": 0.8,
                "match_reasons": ["Technical expertise"],
                "role_in_panel": "Technical consultant",
                "is_user_added": False,
            },
        ]

        return {
            "recommended_agents": fallback_agents,
            "selected_agents": fallback_agents,
            "composition_rationale": "Default panel composition for general analysis.",
            "diversity_score": 0.7,
            "current_step": WizardStep.CONFIRM_AGENTS.value,
            "awaiting_confirmation": "agents",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }


def _infer_role(agent: Dict[str, Any], index: int) -> str:
    """Infer agent's role in panel based on their profile"""
    name = agent.get("name", "").lower()

    if "regulatory" in name:
        return "Regulatory expert"
    elif "clinical" in name:
        return "Clinical advisor"
    elif "safety" in name or "pharmacovigilance" in name:
        return "Safety assessment"
    elif "medical" in name or "affairs" in name:
        return "Medical strategy"
    elif "market" in name or "commercial" in name:
        return "Commercial perspective"
    elif index == 0:
        return "Lead expert"
    else:
        return "Panel contributor"


async def _generate_proposal(state: PanelWizardState) -> Dict[str, Any]:
    """
    Step 8: Generate final panel proposal.

    Compiles all confirmed elements into a ready-to-launch proposal.
    """
    now = datetime.now(timezone.utc).isoformat()

    # Build proposal name from intent
    primary_intent = state.get("primary_intent", "Panel Discussion")
    name = primary_intent[:80] if len(primary_intent) <= 80 else primary_intent[:77] + "..."

    # Compile the proposal
    proposal = {
        "id": str(uuid4()),
        "name": name,
        "description": state.get("primary_intent", ""),
        "panel_type": state.get("selected_panel_type") or state.get("recommended_panel_type", "structured"),
        "domain": state.get("domain", ""),
        "therapeutic_area": state.get("therapeutic_area", ""),
        "goals": {
            "primary_intent": state.get("primary_intent", ""),
            "objectives": state.get("objectives", []),
            "constraints": state.get("constraints", []),
            "success_criteria": state.get("success_criteria", []),
        },
        "questions": state.get("questions", []),
        "agents": state.get("selected_agents", []),
        "settings": state.get("panel_settings", {
            "mode": "sequential",
            "max_rounds": 2,
            "require_consensus": False,
            "allow_debate": False,
        }),
        "estimated_duration": state.get("estimated_discussion_time", "45-60 minutes"),
        "created_at": now,
        "status": "ready",
    }

    logger.info(
        "wizard_proposal_generated",
        proposal_id=proposal["id"],
        panel_type=proposal["panel_type"],
        agent_count=len(proposal["agents"]),
        question_count=len(proposal["questions"]),
    )

    return {
        "proposal": proposal,
        "current_step": WizardStep.COMPLETED.value,
        "status": "completed",
        "awaiting_confirmation": None,
        "updated_at": now,
    }


# =============================================================================
# HITL CONFIRMATION HANDLERS
# =============================================================================

async def _handle_goals_confirmation(state: PanelWizardState) -> Dict[str, Any]:
    """Handle user confirmation of goals"""
    if state.get("goals_confirmed"):
        return {
            "current_step": WizardStep.GENERATE_QUESTIONS.value,
            "awaiting_confirmation": None,
            "goals_confirmed_at": datetime.now(timezone.utc).isoformat(),
        }
    else:
        # User wants to re-edit, stay on confirm step
        return {
            "current_step": WizardStep.CONFIRM_GOALS.value,
            "awaiting_confirmation": "goals",
        }


async def _handle_questions_confirmation(state: PanelWizardState) -> Dict[str, Any]:
    """Handle user confirmation of questions"""
    if state.get("questions_confirmed"):
        return {
            "current_step": WizardStep.SUGGEST_PANEL_TYPE.value,
            "awaiting_confirmation": None,
            "questions_confirmed_at": datetime.now(timezone.utc).isoformat(),
        }
    else:
        return {
            "current_step": WizardStep.CONFIRM_QUESTIONS.value,
            "awaiting_confirmation": "questions",
        }


async def _handle_panel_type_confirmation(state: PanelWizardState) -> Dict[str, Any]:
    """Handle user confirmation of panel type"""
    if state.get("panel_type_confirmed"):
        return {
            "current_step": WizardStep.SEARCH_AGENTS.value,
            "awaiting_confirmation": None,
            "panel_type_confirmed_at": datetime.now(timezone.utc).isoformat(),
        }
    else:
        return {
            "current_step": WizardStep.CONFIRM_PANEL_TYPE.value,
            "awaiting_confirmation": "panel_type",
        }


async def _handle_agents_confirmation(state: PanelWizardState) -> Dict[str, Any]:
    """Handle user confirmation of agents"""
    if state.get("agents_confirmed"):
        return {
            "current_step": WizardStep.GENERATE_PROPOSAL.value,
            "awaiting_confirmation": None,
            "agents_confirmed_at": datetime.now(timezone.utc).isoformat(),
        }
    else:
        return {
            "current_step": WizardStep.CONFIRM_AGENTS.value,
            "awaiting_confirmation": "agents",
        }


# =============================================================================
# ROUTING FUNCTIONS
# =============================================================================

def route_after_parse_intent(state: PanelWizardState) -> str:
    """Route after parsing intent - always go to HITL confirmation"""
    if state.get("error"):
        return END
    return "confirm_goals_hitl"


def route_after_goals_confirmation(state: PanelWizardState) -> str:
    """Route after goals confirmed"""
    if state.get("goals_confirmed"):
        return "generate_questions"
    return END  # Wait for user input


def route_after_questions_confirmation(state: PanelWizardState) -> str:
    """Route after questions confirmed"""
    if state.get("questions_confirmed"):
        return "suggest_panel_type"
    return END


def route_after_panel_type_confirmation(state: PanelWizardState) -> str:
    """Route after panel type confirmed"""
    if state.get("panel_type_confirmed"):
        return "search_agents"
    return END


def route_after_agents_confirmation(state: PanelWizardState) -> str:
    """Route after agents confirmed"""
    if state.get("agents_confirmed"):
        return "generate_proposal"
    return END


# =============================================================================
# GRAPH BUILDER
# =============================================================================

def build_panel_wizard_graph(checkpointer=None):
    """
    Build the Panel Creation Wizard LangGraph.

    The workflow has HITL interrupts after each AI processing step
    to allow user review and modification.
    """
    # Create the graph
    graph = StateGraph(PanelWizardState)

    # Add nodes
    graph.add_node("parse_intent", _parse_intent)
    graph.add_node("confirm_goals_hitl", _handle_goals_confirmation)
    graph.add_node("generate_questions", _generate_questions)
    graph.add_node("confirm_questions_hitl", _handle_questions_confirmation)
    graph.add_node("suggest_panel_type", _suggest_panel_type)
    graph.add_node("confirm_panel_type_hitl", _handle_panel_type_confirmation)
    graph.add_node("search_agents", _search_agents)
    graph.add_node("confirm_agents_hitl", _handle_agents_confirmation)
    graph.add_node("generate_proposal", _generate_proposal)

    # Set entry point
    graph.set_entry_point("parse_intent")

    # Add edges with conditional routing
    graph.add_conditional_edges(
        "parse_intent",
        route_after_parse_intent,
        {
            "confirm_goals_hitl": "confirm_goals_hitl",
            END: END,
        }
    )

    graph.add_conditional_edges(
        "confirm_goals_hitl",
        route_after_goals_confirmation,
        {
            "generate_questions": "generate_questions",
            END: END,
        }
    )

    graph.add_edge("generate_questions", "confirm_questions_hitl")

    graph.add_conditional_edges(
        "confirm_questions_hitl",
        route_after_questions_confirmation,
        {
            "suggest_panel_type": "suggest_panel_type",
            END: END,
        }
    )

    graph.add_edge("suggest_panel_type", "confirm_panel_type_hitl")

    graph.add_conditional_edges(
        "confirm_panel_type_hitl",
        route_after_panel_type_confirmation,
        {
            "search_agents": "search_agents",
            END: END,
        }
    )

    graph.add_edge("search_agents", "confirm_agents_hitl")

    graph.add_conditional_edges(
        "confirm_agents_hitl",
        route_after_agents_confirmation,
        {
            "generate_proposal": "generate_proposal",
            END: END,
        }
    )

    graph.add_edge("generate_proposal", END)

    # Compile with checkpointer for state persistence
    if checkpointer is None:
        checkpointer = MemorySaver()

    compiled = graph.compile(
        checkpointer=checkpointer,
        interrupt_before=[
            "confirm_goals_hitl",
            "confirm_questions_hitl",
            "confirm_panel_type_hitl",
            "confirm_agents_hitl",
        ],
    )

    logger.info(
        "panel_wizard_graph_compiled",
        nodes=list(graph.nodes.keys()),
        interrupt_points=4,
    )

    return compiled
