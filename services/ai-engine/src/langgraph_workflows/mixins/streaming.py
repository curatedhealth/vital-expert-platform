"""
StreamingNodeMixin - Enforces LangGraph Streaming Contract

This mixin ensures all LangGraph workflows follow the correct pattern for streaming:
1. Add AIMessage to state['messages'] array (for LangGraph messages mode)
2. Return response, sources, citations in state (for business logic)
3. Maintain consistent structure across all modes

Usage:
    class Mode1Workflow(StreamingNodeMixin):
        async def format_output_node(self, state):
            return self._complete_with_message(
                state,
                response=state['agent_response'],
                sources=self._format_citations(state)
            )
"""

from typing import Dict, List, Any, Optional
from langchain_core.messages import AIMessage
import logging

logger = logging.getLogger(__name__)


class StreamingNodeMixin:
    """
    Mixin to enforce LangGraph streaming contract across all workflow modes.
    
    The Golden Rule:
    Any content you want emitted via `messages` mode MUST be added to 
    state['messages'] array as an AIMessage.
    
    Stream Mode Matrix:
    - messages: Chat completions (triggered by messages array updates)
    - updates: State changes (triggered by node completion)
    - custom: Custom events (triggered by writer() calls)
    """
    
    def _complete_with_message(
        self,
        state: Dict[str, Any],
        response: str,
        sources: Optional[List[Dict[str, Any]]] = None,
        citations: Optional[List[Dict[str, Any]]] = None,
        confidence: Optional[float] = None,
        **additional_metadata
    ) -> Dict[str, Any]:
        """
        Standard completion pattern that guarantees LangGraph streaming.
        
        This method ensures:
        1. ✅ AIMessage is added to state['messages'] (LangGraph requirement)
        2. ✅ Response content is available (business logic)
        3. ✅ Sources are provided (frontend display)
        4. ✅ Citations are formatted (inline references)
        
        Args:
            state: Current workflow state
            response: The agent's response text (with inline [1], [2] markers)
            sources: List of source documents with metadata
            citations: List of formatted citations for inline display
            confidence: Optional confidence score (0.0-1.0)
            **additional_metadata: Any additional fields to include in state
            
        Returns:
            Updated state dict with AIMessage in messages array
            
        Example:
            return self._complete_with_message(
                state,
                response="Based on evidence [1], digital therapeutics...",
                sources=[{...}, {...}],
                citations=[{...}, {...}],
                confidence=0.92
            )
        """
        # Validate inputs
        if not response or not isinstance(response, str):
            logger.warning(
                "⚠️ [StreamingMixin] Empty or invalid response",
                extra={"response_type": type(response), "response_length": len(response) if response else 0}
            )
            response = response or "I apologize, but I couldn't generate a response."
        
        sources = sources or []
        citations = citations or []
        
        # ✅ CRITICAL: Add AIMessage to messages array
        # This is what triggers LangGraph's messages stream mode to emit
        current_messages = state.get('messages', [])
        
        # Add the AIMessage with the response content
        ai_message = AIMessage(content=response)
        current_messages.append(ai_message)
        
        logger.info(
            "✅ [StreamingMixin] Added AIMessage to state",
            extra={
                "response_length": len(response),
                "sources_count": len(sources),
                "citations_count": len(citations),
                "messages_array_length": len(current_messages),
                "confidence": confidence
            }
        )
        
        # Build the complete state return
        return {
            **state,
            # ✅ LangGraph Contract: messages array (for streaming)
            'messages': current_messages,
            
            # ✅ Business Logic: response fields
            'response': response,              # Full response with [1], [2] markers
            'agent_response': response,        # Alias for backward compatibility
            
            # ✅ Frontend Display: sources and citations
            'sources': sources,                # For collapsible sources section
            'citations': citations,            # For inline citation parsing
            
            # ✅ Metadata: confidence and additional fields
            'confidence': confidence,
            'status': 'COMPLETED',
            'current_node': 'format_output',
            
            # ✅ Additional metadata passed by caller
            **additional_metadata
        }
    
    def _validate_streaming_state(self, state: Dict[str, Any]) -> bool:
        """
        Validate that state meets LangGraph streaming contract.
        
        Checks:
        1. 'messages' array exists and is non-empty
        2. Last message is an AIMessage
        3. Response content exists
        4. Sources array exists (can be empty)
        
        Args:
            state: State dict to validate
            
        Returns:
            True if valid, False otherwise (with warning logs)
        """
        # Check messages array
        messages = state.get('messages', [])
        if not messages:
            logger.warning("⚠️ [StreamingMixin] Validation failed: messages array is empty")
            return False
        
        # Check last message is AIMessage
        last_message = messages[-1]
        if not isinstance(last_message, AIMessage):
            logger.warning(
                "⚠️ [StreamingMixin] Validation failed: last message is not AIMessage",
                extra={"message_type": type(last_message).__name__}
            )
            return False
        
        # Check response content
        response = state.get('response') or state.get('agent_response')
        if not response:
            logger.warning("⚠️ [StreamingMixin] Validation failed: response is empty")
            return False
        
        # Check sources array exists
        if 'sources' not in state:
            logger.warning("⚠️ [StreamingMixin] Validation failed: sources field missing")
            return False
        
        logger.info(
            "✅ [StreamingMixin] State validation passed",
            extra={
                "messages_count": len(messages),
                "response_length": len(response),
                "sources_count": len(state.get('sources', []))
            }
        )
        return True
    
    def _format_citations_standard(
        self,
        sources: List[Dict[str, Any]],
        max_excerpt_length: int = 200
    ) -> List[Dict[str, Any]]:
        """
        Standard citation formatting for all modes.
        
        Converts raw source documents into frontend-compatible citation format.
        
        Args:
            sources: List of source documents from RAG
            max_excerpt_length: Maximum length of excerpt text
            
        Returns:
            List of formatted citations with consistent structure
        """
        citations = []
        
        for idx, source in enumerate(sources, start=1):
            # Extract content (handle various field names)
            content = (
                source.get('content') or 
                source.get('text') or 
                source.get('page_content') or 
                ''
            )
            
            # Truncate excerpt
            excerpt = content[:max_excerpt_length]
            if len(content) > max_excerpt_length:
                excerpt += "..."
            
            # Build citation object
            citation = {
                'number': idx,                                  # For [1], [2] markers
                'id': f"source-{idx}",                          # Unique ID
                'title': source.get('title', f"Source {idx}"), # Display title
                'url': source.get('url', ''),                   # Clickable link
                'excerpt': excerpt,                             # Preview text
                'domain': source.get('domain', 'Unknown'),      # Domain tag
                'similarity': source.get('similarity', 0.0),    # Confidence score
                'metadata': source.get('metadata', {})          # Additional context
            }
            
            citations.append(citation)
        
        logger.debug(
            f"✅ [StreamingMixin] Formatted {len(citations)} citations",
            extra={"citations": citations}
        )
        
        return citations


# Validation helper for testing
def validate_workflow_state(state: Dict[str, Any]) -> Dict[str, bool]:
    """
    Comprehensive state validation for testing.
    
    Returns dict of validation results for each requirement.
    """
    return {
        'has_messages_array': 'messages' in state and isinstance(state['messages'], list),
        'messages_not_empty': len(state.get('messages', [])) > 0,
        'last_is_aimessage': (
            len(state.get('messages', [])) > 0 and 
            isinstance(state['messages'][-1], AIMessage)
        ),
        'has_response': bool(state.get('response') or state.get('agent_response')),
        'has_sources': 'sources' in state and isinstance(state['sources'], list),
        'has_citations': 'citations' in state and isinstance(state['citations'], list),
        'response_not_empty': len(state.get('response', '')) > 0,
        'sources_formatted': all(
            isinstance(s, dict) and 'id' in s and 'title' in s 
            for s in state.get('sources', [])
        )
    }

