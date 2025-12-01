"""
VITAL Platform - LangGraph State Definitions
=============================================
Typed state containers for the agentic workflow.
"""

from typing import List, Dict, Any, Optional, TypedDict, Annotated
from dataclasses import dataclass, field
from enum import Enum
import operator


class UserIntent(Enum):
    """Classified user intent types."""
    QUESTION = "question"           # Information retrieval
    TASK = "task"                   # Action/execution request
    ANALYSIS = "analysis"           # Deep analysis/research
    RECOMMENDATION = "recommendation"  # Advisory/suggestions
    CLARIFICATION = "clarification"    # Follow-up/disambiguation


@dataclass
class Message:
    """Chat message with metadata."""
    role: str                      # "user", "assistant", "system"
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: Optional[str] = None


@dataclass
class RetrievedChunk:
    """Retrieved RAG chunk with source info."""
    content: str
    source: str                    # Pinecone namespace
    score: float
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SelectedAgent:
    """Agent selected for task execution."""
    id: str
    name: str
    role_name: str
    expertise_level: str
    match_score: float
    system_prompt: str
    base_model: str


@dataclass
class GraphContext:
    """Context from Neo4j knowledge graph."""
    nodes: List[Dict[str, Any]]
    relationships: List[Dict[str, Any]]
    paths: List[str]


# =============================================================================
# LANGGRAPH STATE (TypedDict for LangGraph compatibility)
# =============================================================================

class VITALState(TypedDict):
    """
    Central state container for VITAL agentic workflow.

    This state flows through all LangGraph nodes, accumulating
    information at each step.
    """
    # === INPUT ===
    user_query: str
    user_persona_type: Optional[str]     # AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC
    user_role_id: Optional[str]          # For persona-aware agent matching
    session_id: str

    # === CLASSIFICATION ===
    intent: Optional[str]                 # Classified intent
    entities: Annotated[List[str], operator.add]  # Extracted entities
    therapeutic_area: Optional[str]       # e.g., "oncology", "immunology"
    functional_domain: Optional[str]      # e.g., "medical_affairs", "regulatory"

    # === AGENT SELECTION ===
    selected_agents: List[Dict[str, Any]]  # Agents matched to task
    primary_agent: Optional[Dict[str, Any]]  # Main agent for response

    # === RETRIEVAL ===
    retrieved_chunks: Annotated[List[Dict[str, Any]], operator.add]
    rag_namespaces: List[str]            # Which namespaces were queried
    graph_context: Optional[Dict[str, Any]]  # Neo4j context

    # === GENERATION ===
    draft_response: Optional[str]
    final_response: Optional[str]
    citations: Annotated[List[Dict[str, Any]], operator.add]

    # === MESSAGES ===
    messages: Annotated[List[Dict[str, Any]], operator.add]

    # === METADATA ===
    step_count: int
    error: Optional[str]
    latency_ms: Dict[str, float]         # Node execution times


def create_initial_state(
    user_query: str,
    session_id: str,
    user_persona_type: Optional[str] = None,
    user_role_id: Optional[str] = None
) -> VITALState:
    """Create initial state for a new workflow run."""
    return VITALState(
        user_query=user_query,
        user_persona_type=user_persona_type,
        user_role_id=user_role_id,
        session_id=session_id,
        intent=None,
        entities=[],
        therapeutic_area=None,
        functional_domain=None,
        selected_agents=[],
        primary_agent=None,
        retrieved_chunks=[],
        rag_namespaces=[],
        graph_context=None,
        draft_response=None,
        final_response=None,
        citations=[],
        messages=[{"role": "user", "content": user_query}],
        step_count=0,
        error=None,
        latency_ms={}
    )


# =============================================================================
# DOMAIN MAPPINGS
# =============================================================================

THERAPEUTIC_AREA_KEYWORDS = {
    "oncology": ["cancer", "tumor", "oncology", "immuno-oncology", "chemotherapy"],
    "immunology": ["autoimmune", "inflammation", "immune", "immunology", "rheumatoid"],
    "neurology": ["neuro", "brain", "cns", "alzheimer", "parkinson", "epilepsy"],
    "cardiology": ["heart", "cardiac", "cardiovascular", "hypertension"],
    "rare_diseases": ["orphan", "rare disease", "genetic disorder", "ultra-rare"],
    "infectious": ["infection", "antibiotic", "vaccine", "viral", "bacterial"],
    "respiratory": ["lung", "asthma", "copd", "respiratory", "pulmonary"],
}

FUNCTIONAL_DOMAIN_KEYWORDS = {
    "medical_affairs": ["msl", "medical science liaison", "medical affairs", "kol"],
    "clinical_development": ["clinical trial", "protocol", "phase 1", "phase 2", "phase 3"],
    "regulatory_affairs": ["fda", "ema", "submission", "approval", "labeling", "ind", "nda"],
    "pharmacovigilance": ["safety", "adverse event", "ae", "signal detection", "pv"],
    "commercial": ["sales", "marketing", "launch", "market access"],
    "heor": ["health economics", "outcomes", "cost-effectiveness", "heor", "rwe"],
}

def detect_therapeutic_area(text: str) -> Optional[str]:
    """Detect therapeutic area from text."""
    text_lower = text.lower()
    for area, keywords in THERAPEUTIC_AREA_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return area
    return None

def detect_functional_domain(text: str) -> Optional[str]:
    """Detect functional domain from text."""
    text_lower = text.lower()
    for domain, keywords in FUNCTIONAL_DOMAIN_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return domain
    return None
