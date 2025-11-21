"""
Integration Tests for Enhanced LangGraph Workflows

Tests end-to-end workflow execution with:
- HIPAA/GDPR compliance integration
- Human-in-loop validation
- Deep agent architecture
- Tool execution
- Sub-agent spawning
- Performance monitoring

Coverage for all 4 modes:
- Mode 1: Manual Query (One-shot, User selects expert)
- Mode 2: Auto Query (One-shot, AI selects experts)
- Mode 3: Manual Chat (Multi-turn, User selects expert)
- Mode 4: Auto Chat (Multi-turn, AI orchestrates experts)
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from datetime import datetime
import uuid

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'src'))

from langgraph_workflows.mode1_manual_query import Mode1ManualQueryWorkflow
from langgraph_workflows.mode2_auto_query import Mode2AutoQueryWorkflow
from langgraph_workflows.mode3_manual_chat_autonomous import Mode3ManualChatWorkflow
from langgraph_workflows.mode4_auto_chat_autonomous import Mode4AutoChatWorkflow
from core.state_schemas import UnifiedWorkflowState


class TestMode1ManualQueryWorkflow:
    """Integration tests for Mode 1: Manual Query (One-shot, User selects)"""

    @pytest.fixture
    def mock_services(self):
        """Mock all service dependencies"""
        services = {
            'supabase_client': Mock(),
            'agent_orchestrator': AsyncMock(),
            'unified_rag': AsyncMock(),
            'tool_registry': AsyncMock(),
            'sub_agent_spawner': AsyncMock(),
            'confidence_calculator': AsyncMock(),
            'compliance_service': AsyncMock(),
            'human_validator': AsyncMock()
        }

        # Setup default mock returns
        services['agent_orchestrator'].execute_agent = AsyncMock(return_value={
            'response': 'Expert medical analysis of your query.',
            'confidence': 0.85,
            'sources': ['Source 1', 'Source 2']
        })

        services['unified_rag'].retrieve = AsyncMock(return_value={
            'documents': [{'content': 'Relevant medical literature', 'metadata': {}}],
            'context': 'Medical context'
        })

        services['tool_registry'].analyze_query_for_tools = AsyncMock(return_value={
            'recommended_tools': ['medical_calculator', 'drug_interaction_checker'],
            'tool_priorities': [0.9, 0.8]
        })

        services['tool_registry'].get_tool = Mock(return_value=AsyncMock(
            execute=AsyncMock(return_value={'result': 'Tool execution result'})
        ))

        services['sub_agent_spawner'].spawn_specialist = AsyncMock(return_value='specialist-123')
        services['sub_agent_spawner'].execute_sub_agent = AsyncMock(return_value={
            'response': 'Detailed sub-agent analysis',
            'confidence': 0.88
        })

        services['confidence_calculator'].calculate_confidence = AsyncMock(return_value=0.85)

        services['compliance_service'].protect_data = AsyncMock(return_value=(
            'Protected query with redacted PHI',
            'audit-id-123'
        ))

        services['human_validator'].requires_human_review = AsyncMock(return_value={
            'requires_human_review': False,
            'risk_level': 'low',
            'reasons': [],
            'recommendation': 'Safe to proceed'
        })

        return services

    @pytest.fixture
    def workflow(self, mock_services):
        """Create Mode 1 workflow with mocked services"""
        return Mode1ManualQueryWorkflow(
            supabase_client=mock_services['supabase_client'],
            agent_orchestrator=mock_services['agent_orchestrator'],
            unified_rag=mock_services['unified_rag'],
            tool_registry=mock_services['tool_registry'],
            sub_agent_spawner=mock_services['sub_agent_spawner'],
            confidence_calculator=mock_services['confidence_calculator'],
            compliance_service=mock_services['compliance_service'],
            human_validator=mock_services['human_validator']
        )

    @pytest.mark.asyncio
    async def test_mode1_basic_execution(self, workflow, mock_services):
        """Test basic Mode 1 workflow execution"""
        initial_state = {
            'query': 'What are the symptoms of diabetes?',
            'selected_agent_id': 'agent-endocrinology-001',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': str(uuid.uuid4()),
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode1_manual_query'
        }

        # Execute workflow
        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Assertions
        assert result is not None
        assert 'agent_response' in result
        assert 'response_confidence' in result
        assert result['response_confidence'] > 0
        assert 'formatted_output' in result

    @pytest.mark.asyncio
    async def test_mode1_compliance_protection(self, workflow, mock_services):
        """Test HIPAA/GDPR compliance protection in Mode 1"""
        initial_state = {
            'query': 'Patient John Smith (SSN: 123-45-6789) has high blood pressure.',
            'selected_agent_id': 'agent-cardiology-001',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': str(uuid.uuid4()),
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode1_manual_query'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify compliance service was called
        mock_services['compliance_service'].protect_data.assert_called()

        # Verify PHI was protected
        assert 'data_protected' in result
        assert 'compliance_audit_id' in result

    @pytest.mark.asyncio
    async def test_mode1_human_review_trigger(self, workflow, mock_services):
        """Test human-in-loop validation triggers correctly"""
        # Mock validator to require human review
        mock_services['human_validator'].requires_human_review = AsyncMock(return_value={
            'requires_human_review': True,
            'risk_level': 'high',
            'reasons': ['Low confidence', 'Medication recommendation'],
            'recommendation': 'Consult healthcare professional'
        })

        initial_state = {
            'query': 'Should I stop taking my blood pressure medication?',
            'selected_agent_id': 'agent-cardiology-001',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': str(uuid.uuid4()),
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode1_manual_query'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify human review was flagged
        assert result.get('requires_human_review') is True
        assert 'HUMAN REVIEW REQUIRED' in result.get('agent_response', '') or 'requires_human_review' in result

    @pytest.mark.asyncio
    async def test_mode1_tool_execution(self, workflow, mock_services):
        """Test tool execution in Mode 1"""
        initial_state = {
            'query': 'Calculate BMI for height 170cm and weight 70kg',
            'selected_agent_id': 'agent-general-medicine-001',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': str(uuid.uuid4()),
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode1_manual_query'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify tools were analyzed and executed
        mock_services['tool_registry'].analyze_query_for_tools.assert_called()
        assert 'tool_results' in result or mock_services['tool_registry'].get_tool.called

    @pytest.mark.asyncio
    async def test_mode1_sub_agent_spawning(self, workflow, mock_services):
        """Test sub-agent spawning for deep agent architecture"""
        initial_state = {
            'query': 'Complex medical case requiring specialist analysis',
            'selected_agent_id': 'agent-internal-medicine-001',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': str(uuid.uuid4()),
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode1_manual_query'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify sub-agents were spawned
        assert mock_services['sub_agent_spawner'].spawn_specialist.called or 'sub_agent' in str(result)


class TestMode2AutoQueryWorkflow:
    """Integration tests for Mode 2: Auto Query (One-shot, AI selects)"""

    @pytest.fixture
    def mock_services(self):
        """Mock all service dependencies"""
        services = {
            'supabase_client': Mock(),
            'agent_selector': AsyncMock(),
            'panel_orchestrator': AsyncMock(),
            'consensus_calculator': AsyncMock(),
            'unified_rag': AsyncMock(),
            'tool_registry': AsyncMock(),
            'compliance_service': AsyncMock(),
            'human_validator': AsyncMock()
        }

        services['agent_selector'].select_agents = AsyncMock(return_value=[
            {'agent_id': 'agent-cardiology-001', 'confidence': 0.92},
            {'agent_id': 'agent-internal-medicine-001', 'confidence': 0.88},
            {'agent_id': 'agent-pharmacology-001', 'confidence': 0.85}
        ])

        services['panel_orchestrator'].execute_panel = AsyncMock(return_value={
            'panel_responses': [
                {'agent_id': 'agent-1', 'response': 'Response 1', 'confidence': 0.9},
                {'agent_id': 'agent-2', 'response': 'Response 2', 'confidence': 0.85},
                {'agent_id': 'agent-3', 'response': 'Response 3', 'confidence': 0.88}
            ]
        })

        services['consensus_calculator'].calculate_consensus = AsyncMock(return_value={
            'synthesis': 'Synthesized expert consensus',
            'agreement_score': 0.87,
            'conflicts': [],
            'confidence': 0.88
        })

        services['compliance_service'].protect_data = AsyncMock(return_value=(
            'Protected query',
            'audit-id-456'
        ))

        services['human_validator'].requires_human_review = AsyncMock(return_value={
            'requires_human_review': False,
            'risk_level': 'low',
            'reasons': [],
            'recommendation': 'Safe to proceed'
        })

        return services

    @pytest.fixture
    def workflow(self, mock_services):
        """Create Mode 2 workflow"""
        return Mode2AutoQueryWorkflow(
            supabase_client=mock_services['supabase_client'],
            agent_selector=mock_services['agent_selector'],
            panel_orchestrator=mock_services['panel_orchestrator'],
            consensus_calculator=mock_services['consensus_calculator'],
            unified_rag=mock_services['unified_rag'],
            tool_registry=mock_services['tool_registry'],
            compliance_service=mock_services['compliance_service'],
            human_validator=mock_services['human_validator']
        )

    @pytest.mark.asyncio
    async def test_mode2_multi_expert_selection(self, workflow, mock_services):
        """Test AI-based multi-expert selection"""
        initial_state = {
            'query': 'What are the cardiovascular risks of diabetes medication?',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': str(uuid.uuid4()),
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode2_auto_query'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify multiple experts were selected
        mock_services['agent_selector'].select_agents.assert_called()
        assert 'selected_agents' in result or 'panel_responses' in result

    @pytest.mark.asyncio
    async def test_mode2_consensus_building(self, workflow, mock_services):
        """Test consensus building from multiple experts"""
        initial_state = {
            'query': 'Best treatment for Type 2 diabetes?',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': str(uuid.uuid4()),
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode2_auto_query'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify consensus was calculated
        mock_services['consensus_calculator'].calculate_consensus.assert_called()
        assert 'agreement_score' in result or 'consensus' in str(result)

    @pytest.mark.asyncio
    async def test_mode2_conflict_detection(self, workflow, mock_services):
        """Test conflict detection between experts"""
        # Mock conflicting responses
        mock_services['consensus_calculator'].calculate_consensus = AsyncMock(return_value={
            'synthesis': 'Experts disagree on treatment approach',
            'agreement_score': 0.45,
            'conflicts': ['Treatment approach', 'Medication choice'],
            'confidence': 0.60
        })

        initial_state = {
            'query': 'Should I take medication A or B?',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': str(uuid.uuid4()),
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode2_auto_query'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify conflicts were detected
        assert 'conflicts' in result or 'agreement_score' in result


class TestMode3ManualChatWorkflow:
    """Integration tests for Mode 3: Manual Chat (Multi-turn, User selects)"""

    @pytest.fixture
    def mock_services(self):
        """Mock all service dependencies"""
        services = {
            'supabase_client': Mock(),
            'agent_orchestrator': AsyncMock(),
            'conversation_manager': AsyncMock(),
            'session_memory': AsyncMock(),
            'unified_rag': AsyncMock(),
            'tool_registry': AsyncMock(),
            'compliance_service': AsyncMock(),
            'human_validator': AsyncMock()
        }

        services['agent_orchestrator'].execute_agent = AsyncMock(return_value={
            'response': 'Conversational response',
            'confidence': 0.85
        })

        services['conversation_manager'].get_conversation_history = AsyncMock(return_value=[
            {'role': 'user', 'content': 'Previous question'},
            {'role': 'assistant', 'content': 'Previous answer'}
        ])

        services['conversation_manager'].add_turn = AsyncMock()

        services['session_memory'].get_session = AsyncMock(return_value={
            'context': 'Previous conversation context',
            'user_preferences': {}
        })

        services['compliance_service'].protect_data = AsyncMock(return_value=(
            'Protected query',
            'audit-id-789'
        ))

        services['human_validator'].requires_human_review = AsyncMock(return_value={
            'requires_human_review': False,
            'risk_level': 'low',
            'reasons': [],
            'recommendation': 'Safe to proceed'
        })

        return services

    @pytest.fixture
    def workflow(self, mock_services):
        """Create Mode 3 workflow"""
        return Mode3ManualChatWorkflow(
            supabase_client=mock_services['supabase_client'],
            agent_orchestrator=mock_services['agent_orchestrator'],
            conversation_manager=mock_services['conversation_manager'],
            session_memory=mock_services['session_memory'],
            unified_rag=mock_services['unified_rag'],
            tool_registry=mock_services['tool_registry'],
            compliance_service=mock_services['compliance_service'],
            human_validator=mock_services['human_validator']
        )

    @pytest.mark.asyncio
    async def test_mode3_conversation_continuity(self, workflow, mock_services):
        """Test conversation history integration"""
        initial_state = {
            'query': 'Follow-up: What about side effects?',
            'selected_agent_id': 'agent-pharmacology-001',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': 'existing-session-123',
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode3_manual_chat'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify conversation history was retrieved
        mock_services['conversation_manager'].get_conversation_history.assert_called()
        assert 'conversation_history' in result or mock_services['conversation_manager'].add_turn.called

    @pytest.mark.asyncio
    async def test_mode3_session_memory(self, workflow, mock_services):
        """Test session memory persistence"""
        initial_state = {
            'query': 'Remember, I mentioned I have diabetes earlier',
            'selected_agent_id': 'agent-endocrinology-001',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': 'session-456',
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode3_manual_chat'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify session memory was accessed
        mock_services['session_memory'].get_session.assert_called()

    @pytest.mark.asyncio
    async def test_mode3_multi_turn_chain_of_thought(self, workflow, mock_services):
        """Test chain-of-thought reasoning across turns"""
        initial_state = {
            'query': 'Can you explain step-by-step?',
            'selected_agent_id': 'agent-internal-medicine-001',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': str(uuid.uuid4()),
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode3_manual_chat'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify response contains reasoning
        assert result is not None
        assert 'agent_response' in result


class TestMode4AutoChatWorkflow:
    """Integration tests for Mode 4: Auto Chat (Multi-turn, AI orchestrates)"""

    @pytest.fixture
    def mock_services(self):
        """Mock all service dependencies"""
        services = {
            'supabase_client': Mock(),
            'agent_selector': AsyncMock(),
            'panel_orchestrator': AsyncMock(),
            'consensus_calculator': AsyncMock(),
            'conversation_manager': AsyncMock(),
            'session_memory': AsyncMock(),
            'unified_rag': AsyncMock(),
            'tool_registry': AsyncMock(),
            'compliance_service': AsyncMock(),
            'human_validator': AsyncMock()
        }

        services['agent_selector'].select_agents = AsyncMock(return_value=[
            {'agent_id': 'agent-1', 'confidence': 0.9},
            {'agent_id': 'agent-2', 'confidence': 0.85}
        ])

        services['panel_orchestrator'].execute_panel = AsyncMock(return_value={
            'panel_responses': [
                {'agent_id': 'agent-1', 'response': 'Expert 1 response', 'confidence': 0.9},
                {'agent_id': 'agent-2', 'response': 'Expert 2 response', 'confidence': 0.85}
            ]
        })

        services['consensus_calculator'].calculate_consensus = AsyncMock(return_value={
            'synthesis': 'Consensus response',
            'agreement_score': 0.88,
            'conflicts': [],
            'confidence': 0.87
        })

        services['conversation_manager'].get_conversation_history = AsyncMock(return_value=[])
        services['conversation_manager'].add_turn = AsyncMock()
        services['session_memory'].get_session = AsyncMock(return_value={})

        services['compliance_service'].protect_data = AsyncMock(return_value=(
            'Protected query',
            'audit-id-999'
        ))

        services['human_validator'].requires_human_review = AsyncMock(return_value={
            'requires_human_review': False,
            'risk_level': 'low',
            'reasons': [],
            'recommendation': 'Safe to proceed'
        })

        return services

    @pytest.fixture
    def workflow(self, mock_services):
        """Create Mode 4 workflow"""
        return Mode4AutoChatWorkflow(
            supabase_client=mock_services['supabase_client'],
            agent_selector=mock_services['agent_selector'],
            panel_orchestrator=mock_services['panel_orchestrator'],
            consensus_calculator=mock_services['consensus_calculator'],
            conversation_manager=mock_services['conversation_manager'],
            session_memory=mock_services['session_memory'],
            unified_rag=mock_services['unified_rag'],
            tool_registry=mock_services['tool_registry'],
            compliance_service=mock_services['compliance_service'],
            human_validator=mock_services['human_validator']
        )

    @pytest.mark.asyncio
    async def test_mode4_dynamic_expert_rotation(self, workflow, mock_services):
        """Test dynamic expert rotation based on conversation"""
        initial_state = {
            'query': 'I have questions about both diabetes and heart disease',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': str(uuid.uuid4()),
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode4_auto_chat'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify multiple domain experts were selected
        mock_services['agent_selector'].select_agents.assert_called()
        assert 'selected_agents' in result or 'panel_responses' in result

    @pytest.mark.asyncio
    async def test_mode4_autonomous_debate(self, workflow, mock_services):
        """Test autonomous expert debate and synthesis"""
        # Mock experts with disagreement
        mock_services['consensus_calculator'].calculate_consensus = AsyncMock(return_value={
            'synthesis': 'After debate, experts reached this conclusion',
            'agreement_score': 0.75,
            'conflicts': ['Initial disagreement on approach'],
            'confidence': 0.80
        })

        initial_state = {
            'query': 'What is the best treatment approach?',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': str(uuid.uuid4()),
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode4_auto_chat'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify consensus building occurred
        assert mock_services['consensus_calculator'].calculate_consensus.called

    @pytest.mark.asyncio
    async def test_mode4_conversation_evolution(self, workflow, mock_services):
        """Test conversation evolution with context building"""
        # Simulate existing conversation
        mock_services['conversation_manager'].get_conversation_history = AsyncMock(return_value=[
            {'role': 'user', 'content': 'Tell me about diabetes'},
            {'role': 'assistant', 'content': 'Diabetes is a metabolic disorder...'},
            {'role': 'user', 'content': 'What are the treatment options?'},
            {'role': 'assistant', 'content': 'Treatment includes...'}
        ])

        initial_state = {
            'query': 'What about lifestyle changes?',
            'tenant_id': 'test-tenant',
            'user_id': 'test-user',
            'session_id': 'evolving-session-789',
            'enable_rag': True,
            'enable_tools': True,
            'mode': 'mode4_auto_chat'
        }

        graph = workflow.build_workflow()
        result = await graph.ainvoke(initial_state)

        # Verify conversation history influenced response
        assert mock_services['conversation_manager'].get_conversation_history.called
        assert 'conversation_history' in result or len(result.get('conversation_history', [])) > 0


class TestCrossWorkflowCompliance:
    """Test compliance features across all workflows"""

    @pytest.mark.asyncio
    async def test_all_workflows_protect_phi(self):
        """Verify all workflows protect PHI"""
        # This would test that PHI protection is consistently applied
        pass

    @pytest.mark.asyncio
    async def test_all_workflows_human_validation(self):
        """Verify all workflows implement human-in-loop validation"""
        pass

    @pytest.mark.asyncio
    async def test_all_workflows_audit_logging(self):
        """Verify all workflows create audit logs"""
        pass


class TestPerformanceMonitoring:
    """Test performance monitoring integration"""

    @pytest.mark.asyncio
    async def test_workflow_execution_time_tracking(self):
        """Test that workflow execution time is tracked"""
        pass

    @pytest.mark.asyncio
    async def test_node_performance_metrics(self):
        """Test that individual node performance is measured"""
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
