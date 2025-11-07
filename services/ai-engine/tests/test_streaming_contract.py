"""
LangGraph Streaming Contract Tests

Ensures all workflows (Mode 1-4) follow the LangGraph streaming contract.

Contract Requirements:
1. ✅ state['messages'] array exists and contains AIMessage
2. ✅ state['response'] contains the response text
3. ✅ state['sources'] contains formatted source list
4. ✅ state['citations'] contains inline citation data

These tests prevent the streaming bug that caused:
- Empty chat completion
- Missing sources display
- Missing inline citations
"""

import pytest
from typing import Dict, Any
from langchain_core.messages import AIMessage, HumanMessage
from langgraph_workflows.mixins.streaming import StreamingNodeMixin, validate_workflow_state


class MockWorkflow(StreamingNodeMixin):
    """Mock workflow for testing the mixin."""
    pass


@pytest.fixture
def mock_state() -> Dict[str, Any]:
    """Basic state with user message."""
    return {
        'messages': [
            HumanMessage(content="What are the FDA guidelines for digital therapeutics?")
        ],
        'agent_response': 'Based on evidence [1], digital therapeutics must follow...',
        'raw_sources': [
            {
                'title': 'FDA Guidance on SaMD',
                'content': 'Software as a Medical Device guidelines...',
                'url': 'https://fda.gov/samd',
                'domain': 'regulatory-affairs',
                'similarity': 0.92,
                'metadata': {'year': 2023}
            }
        ]
    }


@pytest.fixture
def workflow() -> MockWorkflow:
    """Mock workflow instance."""
    return MockWorkflow()


class TestStreamingContract:
    """Test suite for LangGraph streaming contract compliance."""
    
    def test_complete_with_message_adds_aimessage(self, workflow, mock_state):
        """
        CRITICAL TEST: Ensures AIMessage is added to messages array.
        
        This is the fix for the bug where LangGraph wasn't emitting anything
        because no AIMessage was present in state['messages'].
        """
        result = workflow._complete_with_message(
            mock_state,
            response="Based on evidence [1], digital therapeutics...",
            sources=[{'id': 'source-1', 'title': 'FDA Guidance'}]
        )
        
        # ✅ Contract requirement 1: messages array updated
        assert 'messages' in result
        assert len(result['messages']) == 2  # Original HumanMessage + new AIMessage
        
        # ✅ Contract requirement 2: Last message is AIMessage
        assert isinstance(result['messages'][-1], AIMessage)
        
        # ✅ Contract requirement 3: AIMessage contains response content
        assert result['messages'][-1].content == "Based on evidence [1], digital therapeutics..."
    
    def test_complete_with_message_includes_response(self, workflow, mock_state):
        """Ensures response field is included in state."""
        result = workflow._complete_with_message(
            mock_state,
            response="Based on evidence [1], digital therapeutics...",
            sources=[]
        )
        
        # ✅ Response field present
        assert 'response' in result
        assert result['response'] == "Based on evidence [1], digital therapeutics..."
        
        # ✅ Alias for backward compatibility
        assert 'agent_response' in result
        assert result['agent_response'] == result['response']
    
    def test_complete_with_message_includes_sources(self, workflow, mock_state):
        """Ensures sources array is included in state."""
        sources = [
            {'id': 'source-1', 'title': 'FDA Guidance', 'url': 'https://fda.gov'},
            {'id': 'source-2', 'title': 'Clinical Study', 'url': 'https://pubmed.gov'}
        ]
        
        result = workflow._complete_with_message(
            mock_state,
            response="Test response",
            sources=sources
        )
        
        # ✅ Sources field present
        assert 'sources' in result
        assert len(result['sources']) == 2
        assert result['sources'][0]['title'] == 'FDA Guidance'
    
    def test_complete_with_message_includes_citations(self, workflow, mock_state):
        """Ensures citations array is included for inline references."""
        citations = [
            {'number': 1, 'id': 'source-1', 'title': 'FDA Guidance'},
            {'number': 2, 'id': 'source-2', 'title': 'Clinical Study'}
        ]
        
        result = workflow._complete_with_message(
            mock_state,
            response="Test [1] response [2]",
            sources=[],
            citations=citations
        )
        
        # ✅ Citations field present
        assert 'citations' in result
        assert len(result['citations']) == 2
        assert result['citations'][0]['number'] == 1
    
    def test_complete_with_message_handles_empty_response(self, workflow, mock_state):
        """Ensures empty response is handled gracefully."""
        result = workflow._complete_with_message(
            mock_state,
            response="",  # Empty response
            sources=[]
        )
        
        # ✅ Should default to error message
        assert result['response'] == "I apologize, but I couldn't generate a response."
        assert isinstance(result['messages'][-1], AIMessage)
    
    def test_complete_with_message_includes_confidence(self, workflow, mock_state):
        """Ensures confidence score is included when provided."""
        result = workflow._complete_with_message(
            mock_state,
            response="Test response",
            sources=[],
            confidence=0.92
        )
        
        # ✅ Confidence field present
        assert 'confidence' in result
        assert result['confidence'] == 0.92
    
    def test_complete_with_message_includes_metadata(self, workflow, mock_state):
        """Ensures additional metadata can be passed through."""
        result = workflow._complete_with_message(
            mock_state,
            response="Test response",
            sources=[],
            custom_field="custom_value",
            another_field={"nested": "data"}
        )
        
        # ✅ Additional metadata present
        assert result['custom_field'] == "custom_value"
        assert result['another_field']['nested'] == "data"
    
    def test_validate_streaming_state_success(self, workflow):
        """Tests state validation passes for valid state."""
        valid_state = {
            'messages': [
                HumanMessage(content="User query"),
                AIMessage(content="Agent response")
            ],
            'response': "Agent response",
            'sources': [{'id': 'source-1'}]
        }
        
        # ✅ Validation should pass
        assert workflow._validate_streaming_state(valid_state) is True
    
    def test_validate_streaming_state_missing_messages(self, workflow):
        """Tests state validation fails for missing messages."""
        invalid_state = {
            'response': "Agent response",
            'sources': []
        }
        
        # ❌ Validation should fail
        assert workflow._validate_streaming_state(invalid_state) is False
    
    def test_validate_streaming_state_wrong_message_type(self, workflow):
        """Tests state validation fails for wrong message type."""
        invalid_state = {
            'messages': [
                HumanMessage(content="User query"),
                HumanMessage(content="Another user message")  # Should be AIMessage
            ],
            'response': "Agent response",
            'sources': []
        }
        
        # ❌ Validation should fail
        assert workflow._validate_streaming_state(invalid_state) is False
    
    def test_format_citations_standard(self, workflow):
        """Tests standard citation formatting."""
        sources = [
            {
                'title': 'FDA Guidance',
                'content': 'Software as a Medical Device (SaMD) guidelines...',
                'url': 'https://fda.gov/samd',
                'domain': 'regulatory-affairs',
                'similarity': 0.92,
                'metadata': {'year': 2023}
            },
            {
                'title': 'Clinical Study',
                'content': 'ADHD treatment efficacy study...',
                'url': 'https://pubmed.gov/12345',
                'domain': 'digital-health',
                'similarity': 0.88,
                'metadata': {'year': 2022}
            }
        ]
        
        citations = workflow._format_citations_standard(sources)
        
        # ✅ Correct number of citations
        assert len(citations) == 2
        
        # ✅ Citation structure
        assert citations[0]['number'] == 1
        assert citations[0]['id'] == 'source-1'
        assert citations[0]['title'] == 'FDA Guidance'
        assert citations[0]['url'] == 'https://fda.gov/samd'
        assert citations[0]['domain'] == 'regulatory-affairs'
        assert citations[0]['similarity'] == 0.92
        
        # ✅ Excerpt truncation
        assert len(citations[0]['excerpt']) <= 203  # 200 + "..."


class TestWorkflowStateValidation:
    """Tests for the validation helper function."""
    
    def test_validate_workflow_state_all_pass(self):
        """Tests validation passes for complete valid state."""
        valid_state = {
            'messages': [
                HumanMessage(content="User query"),
                AIMessage(content="Agent response with [1] citations")
            ],
            'response': "Agent response with [1] citations",
            'sources': [
                {'id': 'source-1', 'title': 'FDA Guidance'}
            ],
            'citations': [
                {'number': 1, 'id': 'source-1', 'title': 'FDA Guidance'}
            ]
        }
        
        results = validate_workflow_state(valid_state)
        
        # ✅ All checks should pass
        assert results['has_messages_array'] is True
        assert results['messages_not_empty'] is True
        assert results['last_is_aimessage'] is True
        assert results['has_response'] is True
        assert results['has_sources'] is True
        assert results['has_citations'] is True
        assert results['response_not_empty'] is True
        assert results['sources_formatted'] is True
    
    def test_validate_workflow_state_missing_aimessage(self):
        """Tests validation fails for missing AIMessage."""
        invalid_state = {
            'messages': [
                HumanMessage(content="User query")
                # ❌ Missing AIMessage
            ],
            'response': "Agent response",
            'sources': [],
            'citations': []
        }
        
        results = validate_workflow_state(invalid_state)
        
        # ❌ Last message check should fail
        assert results['last_is_aimessage'] is False
    
    def test_validate_workflow_state_empty_response(self):
        """Tests validation fails for empty response."""
        invalid_state = {
            'messages': [
                HumanMessage(content="User query"),
                AIMessage(content="")  # ❌ Empty content
            ],
            'response': "",  # ❌ Empty response
            'sources': [],
            'citations': []
        }
        
        results = validate_workflow_state(invalid_state)
        
        # ❌ Response checks should fail
        assert results['response_not_empty'] is False


# Integration test markers
pytestmark = [
    pytest.mark.unit,
    pytest.mark.contract,
    pytest.mark.streaming
]


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])

