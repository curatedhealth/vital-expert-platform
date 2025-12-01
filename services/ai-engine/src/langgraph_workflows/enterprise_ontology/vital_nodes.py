"""
VITAL Platform - LangGraph Node Implementations
=================================================
Each node is a function that transforms VITALState.
Nodes integrate with agent_registry, Pinecone RAG, and Neo4j.
"""

import time
from typing import Dict, Any, List, Optional
from anthropic import Anthropic
import hashlib

from .state import (
    VITALState,
    detect_therapeutic_area,
    detect_functional_domain,
    UserIntent
)

# Import integrations (these are created in previous steps)
import sys
sys.path.append('/Users/hichamnaim/Downloads/Cursor/VITAL/src')

# =============================================================================
# CONFIGURATION
# =============================================================================

ANTHROPIC_API_KEY = None  # Set via environment or secrets manager
CLAUDE_MODEL = "claude-sonnet-4-20250514"

# Pinecone namespace mapping for RAG (KD = Knowledge Domain)
NAMESPACE_MAPPING = {
    # Regulatory domains
    "regulatory_affairs": "KD-reg-general",
    "fda": "KD-reg-fda",
    "ema": "KD-reg-ema",
    "ich": "KD-reg-ich",
    # Digital health
    "digital_health": "KD-dh-general",
    "samd": "KD-dh-samd",
    "cybersecurity": "KD-dh-cybersec",
    # Clinical
    "clinical_development": "KD-clinical-trials",
    "clinical_trials": "KD-clinical-trials",
    # Business
    "strategy": "KD-business-strategy",
    "commercial": "KD-business-strategy",
    # General
    "best_practices": "KD-best-practices",
    "industry": "KD-industry",
}

# =============================================================================
# NODE 1: INTENT CLASSIFIER
# =============================================================================

def classify_intent(state: VITALState) -> VITALState:
    """
    Classify user intent and extract entities.

    Input: user_query
    Output: intent, entities, therapeutic_area, functional_domain
    """
    start_time = time.time()

    query = state["user_query"]

    # Simple rule-based classification (replace with LLM for production)
    query_lower = query.lower()

    # Classify intent
    if any(word in query_lower for word in ["what", "who", "when", "where", "how", "explain"]):
        intent = UserIntent.QUESTION.value
    elif any(word in query_lower for word in ["analyze", "compare", "evaluate", "assess"]):
        intent = UserIntent.ANALYSIS.value
    elif any(word in query_lower for word in ["recommend", "suggest", "advise", "should"]):
        intent = UserIntent.RECOMMENDATION.value
    elif any(word in query_lower for word in ["create", "generate", "write", "build", "do"]):
        intent = UserIntent.TASK.value
    else:
        intent = UserIntent.QUESTION.value

    # Detect domains
    therapeutic_area = detect_therapeutic_area(query)
    functional_domain = detect_functional_domain(query)

    # Extract entities (simplified - use NER in production)
    entities = []
    if therapeutic_area:
        entities.append(f"ta:{therapeutic_area}")
    if functional_domain:
        entities.append(f"func:{functional_domain}")

    # Update state
    state["intent"] = intent
    state["entities"] = entities
    state["therapeutic_area"] = therapeutic_area
    state["functional_domain"] = functional_domain
    state["step_count"] += 1
    state["latency_ms"]["classify_intent"] = (time.time() - start_time) * 1000

    return state


# =============================================================================
# NODE 2: AGENT SELECTOR
# =============================================================================

def select_agents(state: VITALState) -> VITALState:
    """
    Select appropriate agents using GraphRAG.

    Uses:
    - Pinecone ont-agents namespace for semantic search
    - Neo4j for relationship context
    - Persona-aware ranking based on user archetype

    Input: user_query, intent, therapeutic_area, functional_domain, user_persona_type
    Output: selected_agents, primary_agent
    """
    start_time = time.time()

    try:
        # Import agent registry
        from integrations.agent_registry import AgentSelector

        selector = AgentSelector()

        # Build context for agent selection
        context = {
            "intent": state.get("intent"),
            "therapeutic_area": state.get("therapeutic_area"),
            "functional_domain": state.get("functional_domain"),
        }

        # Select agents
        selected = selector.select_agent(
            task=state["user_query"],
            context=context,
            user_persona_type=state.get("user_persona_type"),
            top_k=3
        )

        state["selected_agents"] = selected
        state["primary_agent"] = selected[0] if selected else None

    except ImportError:
        # Fallback if agent_registry not available
        state["selected_agents"] = [_mock_agent_selection(state)]
        state["primary_agent"] = state["selected_agents"][0]

    except Exception as e:
        state["error"] = f"Agent selection failed: {str(e)}"
        state["selected_agents"] = [_mock_agent_selection(state)]
        state["primary_agent"] = state["selected_agents"][0]

    state["step_count"] += 1
    state["latency_ms"]["select_agents"] = (time.time() - start_time) * 1000

    return state


def _mock_agent_selection(state: VITALState) -> Dict[str, Any]:
    """Fallback mock agent when registry unavailable."""
    return {
        "id": "fallback-agent",
        "name": "General Medical Affairs Assistant",
        "role_name": "Medical Science Liaison",
        "expertise_level": "senior",
        "match_score": 0.8,
        "system_prompt": "You are a helpful medical affairs assistant.",
        "base_model": CLAUDE_MODEL,
    }


# =============================================================================
# NODE 3: RAG RETRIEVER
# =============================================================================

def retrieve_context(state: VITALState) -> VITALState:
    """
    Retrieve relevant context from Pinecone RAG stores.

    Queries appropriate namespaces based on:
    - Therapeutic area → ta-* namespace
    - Functional domain → func-* namespace
    - Agent expertise → ont-* namespace

    Input: user_query, therapeutic_area, functional_domain, selected_agents
    Output: retrieved_chunks, rag_namespaces
    """
    start_time = time.time()

    # Determine namespaces to query
    namespaces = []

    # Add therapeutic area namespace
    ta = state.get("therapeutic_area")
    if ta and ta in NAMESPACE_MAPPING:
        namespaces.append(NAMESPACE_MAPPING[ta])

    # Add functional domain namespace
    func = state.get("functional_domain")
    if func and func in NAMESPACE_MAPPING:
        namespaces.append(NAMESPACE_MAPPING[func])

    # Default to general knowledge if no specific namespaces
    if not namespaces:
        namespaces = ["(default)"]  # General RAG namespace

    try:
        from pinecone import Pinecone

        PINECONE_API_KEY = "pcsk_3sLEoE_F3XwTFxNkzmWcEtJGS3PNrwB4VBLmZUnuFwvoUTz7NkZ9GGTsBvJfFrgypddFEi"
        PINECONE_INDEX = "vital-knowledge"

        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX)

        # Create query embedding (using hash-based placeholder)
        query_embedding = _simple_hash_embedding(state["user_query"])

        # Query each namespace
        all_chunks = []
        for namespace in namespaces:
            try:
                results = index.query(
                    vector=query_embedding,
                    top_k=5,
                    namespace=namespace,
                    include_metadata=True
                )

                for match in results.matches:
                    all_chunks.append({
                        "content": match.metadata.get("text", match.metadata.get("content", "")),
                        "source": namespace,
                        "score": match.score,
                        "metadata": match.metadata
                    })
            except Exception as e:
                # Namespace might not exist
                pass

        # Sort by score and take top 10
        all_chunks.sort(key=lambda x: x["score"], reverse=True)
        state["retrieved_chunks"] = all_chunks[:10]
        state["rag_namespaces"] = namespaces

    except Exception as e:
        state["retrieved_chunks"] = []
        state["rag_namespaces"] = namespaces
        # Don't set error - RAG is optional enhancement

    state["step_count"] += 1
    state["latency_ms"]["retrieve_context"] = (time.time() - start_time) * 1000

    return state


def _simple_hash_embedding(text: str, dimension: int = 3072) -> List[float]:
    """Create deterministic pseudo-embedding (replace with real embedding model)."""
    embedding = []
    for i in range(dimension):
        seed = hashlib.md5(f"{text}{i}".encode()).digest()
        value = (seed[i % 16] / 128.0) - 1.0
        embedding.append(value)

    norm = sum(x*x for x in embedding) ** 0.5
    if norm > 0:
        embedding = [x / norm for x in embedding]

    return embedding


# =============================================================================
# NODE 4: GRAPH CONTEXT ENRICHER
# =============================================================================

def enrich_with_graph_context(state: VITALState) -> VITALState:
    """
    Enrich context with Neo4j knowledge graph relationships.

    Retrieves:
    - Agent's organizational hierarchy
    - Related roles and personas
    - Cross-functional connections

    Input: primary_agent, therapeutic_area, functional_domain
    Output: graph_context
    """
    start_time = time.time()

    try:
        from neo4j import GraphDatabase

        NEO4J_URI = "neo4j+s://13067bdb.databases.neo4j.io"
        NEO4J_USER = "neo4j"
        NEO4J_PASSWORD = "kkCxQgpcanSUDv-dKzOzDPcYIhvJHRQRa4tuiNa2Mek"

        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

        with driver.session() as session:
            primary_agent = state.get("primary_agent")

            if primary_agent and primary_agent.get("id"):
                # Get agent's organizational context
                result = session.run("""
                    MATCH (a:Agent {id: $agent_id})
                    OPTIONAL MATCH (a)-[:SERVES_ROLE]->(r:Role)
                    OPTIONAL MATCH (r)-[:IN_DEPARTMENT]->(d:Department)
                    OPTIONAL MATCH (d)-[:BELONGS_TO]->(f:Function)
                    RETURN a.name as agent_name,
                           r.name as role_name,
                           d.name as department_name,
                           f.name as function_name
                """, agent_id=primary_agent["id"])

                record = result.single()
                if record:
                    state["graph_context"] = {
                        "agent_name": record["agent_name"],
                        "role_name": record["role_name"],
                        "department_name": record["department_name"],
                        "function_name": record["function_name"],
                        "nodes": [],
                        "relationships": [],
                        "paths": []
                    }

        driver.close()

    except Exception as e:
        # Neo4j might not be accessible (IP whitelist)
        state["graph_context"] = None

    state["step_count"] += 1
    state["latency_ms"]["enrich_graph_context"] = (time.time() - start_time) * 1000

    return state


# =============================================================================
# NODE 5: RESPONSE GENERATOR
# =============================================================================

def generate_response(state: VITALState) -> VITALState:
    """
    Generate response using selected agent's persona.

    Uses:
    - Primary agent's system prompt
    - Retrieved RAG context
    - Graph context for organizational awareness

    Input: user_query, primary_agent, retrieved_chunks, graph_context
    Output: draft_response
    """
    start_time = time.time()

    primary_agent = state.get("primary_agent") or {}

    # Build system prompt
    system_prompt = primary_agent.get("system_prompt", "You are a helpful assistant.")

    # Add RAG context
    rag_context = ""
    if state.get("retrieved_chunks"):
        chunks_text = "\n\n".join([
            f"[Source: {chunk['source']}]\n{chunk['content']}"
            for chunk in state["retrieved_chunks"][:5]
        ])
        rag_context = f"\n\nRelevant context:\n{chunks_text}"

    # Add graph context
    graph_context = ""
    if state.get("graph_context"):
        gc = state["graph_context"]
        graph_context = f"""

Your organizational context:
- Role: {gc.get('role_name', 'N/A')}
- Department: {gc.get('department_name', 'N/A')}
- Function: {gc.get('function_name', 'N/A')}
"""

    # Combine into full system message
    full_system = f"{system_prompt}{graph_context}{rag_context}"

    # Generate response
    try:
        if ANTHROPIC_API_KEY:
            client = Anthropic(api_key=ANTHROPIC_API_KEY)
            response = client.messages.create(
                model=primary_agent.get("base_model", CLAUDE_MODEL),
                max_tokens=1024,
                system=full_system,
                messages=[
                    {"role": "user", "content": state["user_query"]}
                ]
            )
            state["draft_response"] = response.content[0].text
        else:
            # Mock response when API key not available
            state["draft_response"] = _generate_mock_response(state)

    except Exception as e:
        state["error"] = f"Response generation failed: {str(e)}"
        state["draft_response"] = _generate_mock_response(state)

    state["step_count"] += 1
    state["latency_ms"]["generate_response"] = (time.time() - start_time) * 1000

    return state


def _generate_mock_response(state: VITALState) -> str:
    """Generate mock response for testing without API."""
    agent_name = state.get("primary_agent", {}).get("name", "Assistant")
    return f"""[{agent_name}]

I understand you're asking about: {state['user_query']}

Based on my analysis:
- Intent: {state.get('intent', 'question')}
- Therapeutic Area: {state.get('therapeutic_area', 'general')}
- Functional Domain: {state.get('functional_domain', 'general')}

[This is a mock response - configure ANTHROPIC_API_KEY for real generation]
"""


# =============================================================================
# NODE 6: CITATION FORMATTER
# =============================================================================

def format_citations(state: VITALState) -> VITALState:
    """
    Add citations from RAG sources to response.

    Input: draft_response, retrieved_chunks
    Output: final_response, citations
    """
    start_time = time.time()

    # Extract citations from retrieved chunks
    citations = []
    for i, chunk in enumerate(state.get("retrieved_chunks", [])[:5]):
        citations.append({
            "id": i + 1,
            "source": chunk.get("source", "unknown"),
            "relevance": chunk.get("score", 0),
            "content_preview": chunk.get("content", "")[:100] + "..."
        })

    # Add citation references to response
    draft = state.get("draft_response", "")
    if citations:
        citation_text = "\n\n---\nSources:\n"
        for cite in citations:
            citation_text += f"[{cite['id']}] {cite['source']} (relevance: {cite['relevance']:.2f})\n"
        state["final_response"] = draft + citation_text
    else:
        state["final_response"] = draft

    state["citations"] = citations

    # Add assistant message to conversation
    state["messages"].append({
        "role": "assistant",
        "content": state["final_response"]
    })

    state["step_count"] += 1
    state["latency_ms"]["format_citations"] = (time.time() - start_time) * 1000

    return state


# =============================================================================
# NODE 7: ERROR HANDLER
# =============================================================================

def handle_error(state: VITALState) -> VITALState:
    """
    Handle errors gracefully with fallback response.

    Input: error
    Output: final_response (error message)
    """
    error = state.get("error", "Unknown error occurred")

    state["final_response"] = f"""I apologize, but I encountered an issue processing your request.

Error: {error}

Please try rephrasing your question or contact support if the issue persists.
"""

    state["messages"].append({
        "role": "assistant",
        "content": state["final_response"]
    })

    return state


# =============================================================================
# ROUTER: CONDITIONAL EDGE LOGIC
# =============================================================================

def should_retrieve_context(state: VITALState) -> str:
    """Determine if RAG retrieval is needed."""
    intent = state.get("intent", "")

    # Skip RAG for simple clarifications
    if intent == UserIntent.CLARIFICATION.value:
        return "skip_rag"

    return "retrieve"


def should_enrich_with_graph(state: VITALState) -> str:
    """Determine if graph enrichment is needed."""
    # Only enrich for complex intents
    intent = state.get("intent", "")

    if intent in [UserIntent.ANALYSIS.value, UserIntent.RECOMMENDATION.value]:
        return "enrich"

    return "skip_graph"


def has_error(state: VITALState) -> str:
    """Check if there's an error to handle."""
    if state.get("error"):
        return "error"
    return "continue"
