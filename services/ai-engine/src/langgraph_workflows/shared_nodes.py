"""
Shared nodes for LangGraph workflows
Reusable nodes across all Ask Expert modes
"""

import structlog
from typing import Dict, Any, Optional
from uuid import UUID

from graphrag.service import get_graphrag_service
from graphrag.models import GraphRAGRequest

logger = structlog.get_logger()


async def graphrag_query_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Shared GraphRAG query node for all Ask Expert modes
    
    Retrieves context from:
    - Vector search (Pinecone/pgvector)
    - Keyword search (Elasticsearch, if enabled)
    - Graph search (Neo4j)
    
    Returns enhanced state with:
    - graphrag_context: List of context chunks
    - evidence_chain: Provenance information
    - citations: Citation IDs
    
    Args:
        state: Current workflow state
        
    Returns:
        Enhanced state with GraphRAG context
    """
    try:
        logger.info(
            "graphrag_query_start",
            query=state.get('query'),
            agent_id=state.get('current_agent_id'),
            session_id=state.get('session_id')
        )
        
        # Get GraphRAG service
        graphrag = await get_graphrag_service()
        
        # Determine agent ID (may be current_agent_id or first selected agent)
        agent_id = state.get('current_agent_id')
        if not agent_id and state.get('selected_agents'):
            agent_id = state['selected_agents'][0] if isinstance(state['selected_agents'], list) else state['selected_agents']
        
        # Create GraphRAG request
        request = GraphRAGRequest(
            query=state['query'],
            agent_id=UUID(str(agent_id)) if agent_id else None,
            session_id=UUID(str(state['session_id'])),
            tenant_id=UUID(str(state['tenant_id'])),
            rag_profile_id=UUID(str(state['rag_profile_id'])) if state.get('rag_profile_id') else None
        )
        
        # Execute GraphRAG query
        response = await graphrag.query(request)
        
        logger.info(
            "graphrag_query_success",
            context_chunks=len(response.context_chunks),
            evidence_items=len(response.evidence_chain),
            profile_used=response.metadata.get('profile_used')
        )
        
        # Build citation list
        citations = [
            {
                'id': chunk['citation_id'],
                'text': chunk['text'],
                'source': chunk.get('source', 'unknown'),
                'score': chunk.get('score', 0.0)
            }
            for chunk in response.context_chunks
        ]
        
        # Add to state
        return {
            **state,
            'graphrag_context': response.context_chunks,
            'evidence_chain': response.evidence_chain,
            'citations': citations,
            'graphrag_metadata': response.metadata,
            'graphrag_enabled': True,
            'current_node': 'graphrag_query'
        }
    
    except Exception as e:
        logger.error(
            "graphrag_query_failed",
            error=str(e),
            query=state.get('query')
        )
        
        # Continue without GraphRAG if it fails (graceful degradation)
        return {
            **state,
            'graphrag_context': [],
            'evidence_chain': [],
            'citations': [],
            'graphrag_error': str(e),
            'graphrag_enabled': False,
            'current_node': 'graphrag_query'
        }


def build_context_string(state: Dict[str, Any], max_chunks: int = 10) -> str:
    """
    Build a formatted context string from GraphRAG results
    
    Args:
        state: Workflow state with graphrag_context
        max_chunks: Maximum number of chunks to include
        
    Returns:
        Formatted context string with citations
    """
    context_chunks = state.get('graphrag_context', [])
    
    if not context_chunks:
        return ""
    
    # Limit number of chunks
    chunks_to_use = context_chunks[:max_chunks]
    
    # Format each chunk with citation
    formatted_chunks = [
        f"{chunk['citation_id']} {chunk['text']}\n   Source: {chunk.get('source', 'unknown')} (confidence: {chunk.get('score', 0.0):.2f})"
        for chunk in chunks_to_use
    ]
    
    context_str = "\n\n".join(formatted_chunks)
    
    return f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 RELEVANT CONTEXT FROM KNOWLEDGE BASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{context_str}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""


def build_enhanced_prompt(
    query: str,
    context_str: str,
    system_prompt: Optional[str] = None
) -> str:
    """
    Build an enhanced prompt with GraphRAG context
    
    Args:
        query: User's query
        context_str: Formatted context from build_context_string()
        system_prompt: Optional system prompt
        
    Returns:
        Enhanced prompt with context and instructions
    """
    base_instructions = """
You are an expert AI assistant with access to a comprehensive knowledge base.

INSTRUCTIONS:
1. Use the provided context to answer the user's question
2. Cite sources using citation IDs like [1], [2], [3]
3. If the context doesn't contain the answer, say so clearly
4. Provide accurate, evidence-based responses
5. Include confidence levels when appropriate

"""
    
    if system_prompt:
        base_instructions = f"{system_prompt}\n\n{base_instructions}"
    
    return f"""{base_instructions}

{context_str}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ USER QUERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{query}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please provide your response based on the context above. Remember to cite sources.
"""


def extract_citations_from_response(response_text: str) -> list[str]:
    """
    Extract citation IDs from agent response
    
    Args:
        response_text: Agent's response text
        
    Returns:
        List of citation IDs found (e.g., ['[1]', '[2]'])
    """
    import re
    
    # Pattern to match [1], [2], [3], etc.
    citation_pattern = r'\[(\d+)\]'
    
    matches = re.findall(citation_pattern, response_text)
    
    return [f'[{match}]' for match in matches]


def build_citation_list(state: Dict[str, Any], response_text: str) -> list[dict]:
    """
    Build a list of citations that were actually used in the response
    
    Args:
        state: Workflow state with citations
        response_text: Agent's response text
        
    Returns:
        List of citation dicts that were referenced
    """
    # Extract citation IDs from response
    used_citation_ids = extract_citations_from_response(response_text)
    
    # Get all available citations
    all_citations = state.get('citations', [])
    
    # Filter to only used citations
    used_citations = [
        citation for citation in all_citations
        if citation['id'] in used_citation_ids
    ]
    
    return used_citations

