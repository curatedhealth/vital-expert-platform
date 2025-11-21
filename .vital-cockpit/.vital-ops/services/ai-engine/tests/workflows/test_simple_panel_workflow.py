"""
Tests for SimplePanelWorkflow
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import pytest
from unittest.mock import Mock, AsyncMock, patch
from uuid import uuid4, UUID
from datetime import datetime, timezone

from workflows.simple_panel_workflow import SimplePanelWorkflow, create_panel_workflow
from domain.panel_types import PanelType, PanelStatus, ResponseType
from domain.panel_models import Panel
from repositories.panel_repository import PanelRepository
from services.consensus_calculator import SimpleConsensusCalculator, ConsensusResult
from services.agent_usage_tracker import AgentUsageTracker


@pytest.fixture
def mock_panel_repo():
    """Mock panel repository"""
    return Mock(spec=PanelRepository)


@pytest.fixture
def mock_consensus_calc():
    """Mock consensus calculator"""
    return Mock(spec=SimpleConsensusCalculator)


@pytest.fixture
def mock_usage_tracker():
    """Mock usage tracker"""
    tracker = Mock(spec=AgentUsageTracker)
    tracker.track_usage = AsyncMock(return_value=str(uuid4()))
    return tracker


@pytest.fixture
def sample_panel():
    """Sample panel for testing"""
    return Panel(
        id=uuid4(),
        tenant_id=uuid4(),
        user_id=uuid4(),
        query="What are the FDA requirements for Class II medical devices?",
        panel_type=PanelType.STRUCTURED,
        status=PanelStatus.CREATED,
        configuration={"max_rounds": 1, "timeout": 30},
        agents=["regulatory_expert", "clinical_expert", "quality_expert"],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        started_at=None,
        completed_at=None,
        metadata={}
    )


@pytest.fixture
def workflow(mock_panel_repo, mock_consensus_calc, mock_usage_tracker):
    """Create workflow instance"""
    return SimplePanelWorkflow(
        mock_panel_repo,
        mock_consensus_calc,
        mock_usage_tracker,
        max_experts=5
    )


class TestSimplePanelWorkflowInitialization:
    """Test workflow initialization"""
    
    def test_init_with_default_max_experts(self, mock_panel_repo, mock_consensus_calc, mock_usage_tracker):
        workflow = SimplePanelWorkflow(
            mock_panel_repo,
            mock_consensus_calc,
            mock_usage_tracker
        )
        
        assert workflow.panel_repo == mock_panel_repo
        assert workflow.consensus_calc == mock_consensus_calc
        assert workflow.usage_tracker == mock_usage_tracker
        assert workflow.max_experts == 5
    
    def test_init_with_custom_max_experts(self, mock_panel_repo, mock_consensus_calc, mock_usage_tracker):
        workflow = SimplePanelWorkflow(
            mock_panel_repo,
            mock_consensus_calc,
            mock_usage_tracker,
            max_experts=3
        )
        
        assert workflow.max_experts == 3
    
    def test_factory_function(self, mock_panel_repo, mock_consensus_calc, mock_usage_tracker):
        workflow = create_panel_workflow(
            mock_panel_repo,
            mock_consensus_calc,
            mock_usage_tracker,
            max_experts=10
        )
        
        assert isinstance(workflow, SimplePanelWorkflow)
        assert workflow.max_experts == 10


class TestExecutePanel:
    """Test complete panel execution"""
    
    @pytest.mark.asyncio
    async def test_successful_panel_execution(
        self,
        workflow,
        mock_panel_repo,
        mock_consensus_calc,
        sample_panel
    ):
        """Test successful panel execution"""
        panel_id = sample_panel.id
        
        # Setup mocks
        mock_panel_repo.get_panel = AsyncMock(return_value=sample_panel)
        mock_panel_repo.update_panel_status = AsyncMock(return_value=sample_panel)
        mock_panel_repo.add_response = AsyncMock(return_value=uuid4())
        mock_panel_repo.save_consensus = AsyncMock(return_value=uuid4())
        
        # Mock consensus result
        consensus_result = ConsensusResult(
            consensus_level=0.75,
            agreement_points=["FDA approval", "clinical trials"],
            disagreement_points=[],
            recommendation="Strong consensus: FDA requires 510(k) clearance",
            dissenting_opinions=[],
            key_themes=["FDA", "approval", "clinical"]
        )
        mock_consensus_calc.calculate_consensus.return_value = consensus_result
        
        # Execute
        result = await workflow.execute_panel(panel_id)
        
        # Verify result
        assert result["status"] == "completed"
        assert result["panel_id"] == str(panel_id)
        assert result["consensus_level"] == 0.75
        assert result["response_count"] == 3  # 3 agents
        assert "execution_time_ms" in result
        assert result["recommendation"] == "Strong consensus: FDA requires 510(k) clearance"
        
        # Verify panel was loaded
        mock_panel_repo.get_panel.assert_called_once_with(panel_id)
        
        # Verify status updates
        assert mock_panel_repo.update_panel_status.call_count == 2
        # First call: RUNNING
        first_call = mock_panel_repo.update_panel_status.call_args_list[0]
        assert first_call[0][1] == PanelStatus.RUNNING
        # Second call: COMPLETED
        second_call = mock_panel_repo.update_panel_status.call_args_list[1]
        assert second_call[0][1] == PanelStatus.COMPLETED
        
        # Verify responses saved
        assert mock_panel_repo.add_response.call_count == 3
        
        # Verify consensus saved
        mock_panel_repo.save_consensus.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_panel_not_found(self, workflow, mock_panel_repo):
        """Test error when panel not found"""
        panel_id = uuid4()
        mock_panel_repo.get_panel = AsyncMock(return_value=None)
        
        with pytest.raises(ValueError, match="Panel .* not found"):
            await workflow.execute_panel(panel_id)
    
    @pytest.mark.asyncio
    async def test_panel_already_running(self, workflow, mock_panel_repo, sample_panel):
        """Test error when panel already running"""
        sample_panel.status = PanelStatus.RUNNING
        mock_panel_repo.get_panel = AsyncMock(return_value=sample_panel)
        
        with pytest.raises(ValueError, match="cannot be started"):
            await workflow.execute_panel(sample_panel.id)
    
    @pytest.mark.asyncio
    async def test_panel_execution_failure_marks_as_failed(
        self,
        workflow,
        mock_panel_repo,
        sample_panel
    ):
        """Test panel marked as failed on execution error"""
        mock_panel_repo.get_panel = AsyncMock(return_value=sample_panel)
        mock_panel_repo.update_panel_status = AsyncMock(side_effect=[
            sample_panel,  # First call succeeds (RUNNING)
            None  # Second call for FAILED
        ])
        mock_panel_repo.add_response = AsyncMock(side_effect=Exception("DB error"))
        
        with pytest.raises(Exception):
            await workflow.execute_panel(sample_panel.id)
        
        # Verify failed status was set
        last_call = mock_panel_repo.update_panel_status.call_args_list[-1]
        assert last_call[0][1] == PanelStatus.FAILED
    
    @pytest.mark.asyncio
    async def test_no_expert_responses_raises_error(
        self,
        workflow,
        mock_panel_repo,
        sample_panel
    ):
        """Test error when no expert responses received"""
        # Empty agents list
        sample_panel.agents = []
        mock_panel_repo.get_panel = AsyncMock(return_value=sample_panel)
        mock_panel_repo.update_panel_status = AsyncMock(return_value=sample_panel)
        
        with pytest.raises(Exception, match="No expert responses"):
            await workflow.execute_panel(sample_panel.id)


class TestExecuteExperts:
    """Test expert execution"""
    
    @pytest.mark.asyncio
    async def test_execute_multiple_experts(self, workflow, sample_panel):
        """Test executing multiple experts in parallel"""
        responses = await workflow._execute_experts(sample_panel)
        
        assert len(responses) == 3
        for response in responses:
            assert "agent_id" in response
            assert "agent_name" in response
            assert "content" in response
            assert "confidence_score" in response
            assert 0.0 <= response["confidence_score"] <= 1.0
    
    @pytest.mark.asyncio
    async def test_limits_to_max_experts(self, workflow, sample_panel):
        """Test limiting to max_experts"""
        # Add many agents
        sample_panel.agents = [f"expert_{i}" for i in range(10)]
        workflow.max_experts = 3
        
        responses = await workflow._execute_experts(sample_panel)
        
        # Should only execute max_experts
        assert len(responses) == 3
    
    @pytest.mark.asyncio
    async def test_handles_expert_failures_gracefully(self, workflow, sample_panel):
        """Test handling individual expert failures"""
        # Mock _execute_single_expert to fail for some experts
        original_method = workflow._execute_single_expert
        
        async def mock_execute(agent_id, query, panel_type):
            if agent_id == "clinical_expert":
                raise Exception("Expert failed")
            return await original_method(agent_id, query, panel_type)
        
        workflow._execute_single_expert = mock_execute
        
        responses = await workflow._execute_experts(sample_panel)
        
        # Should have 2 responses (3 total - 1 failed)
        assert len(responses) == 2


class TestExecuteSingleExpert:
    """Test single expert execution"""
    
    @pytest.mark.asyncio
    async def test_execute_known_expert(self, workflow):
        """Test executing a known expert"""
        response = await workflow._execute_single_expert(
            "regulatory_expert",
            "What is FDA 510(k)?",
            "structured"
        )
        
        assert response["agent_id"] == "regulatory_expert"
        assert response["agent_name"] == "Regulatory Expert"
        assert "FDA" in response["content"]
        assert "510(k)" in response["content"]
        assert 0.0 <= response["confidence_score"] <= 1.0
        assert response["tokens_used"] > 0
        assert response["execution_time_ms"] > 0
        assert response["model"] == "gpt-4-turbo"
        assert response["metadata"]["mock"] is True
    
    @pytest.mark.asyncio
    async def test_execute_unknown_expert(self, workflow):
        """Test executing an unknown expert with generic response"""
        response = await workflow._execute_single_expert(
            "unknown_expert",
            "Test query",
            "open"
        )
        
        assert response["agent_id"] == "unknown_expert"
        assert response["agent_name"] == "Unknown Expert"
        assert "Expert analysis" in response["content"]
        assert response["confidence_score"] == 0.70
        assert response["metadata"]["mock"] is True
    
    @pytest.mark.asyncio
    async def test_response_includes_all_required_fields(self, workflow):
        """Test response includes all required fields"""
        response = await workflow._execute_single_expert(
            "clinical_expert",
            "Test query",
            "structured"
        )
        
        required_fields = [
            "agent_id",
            "agent_name",
            "content",
            "confidence_score",
            "tokens_used",
            "execution_time_ms",
            "model",
            "metadata"
        ]
        
        for field in required_fields:
            assert field in response, f"Missing field: {field}"


class TestUsageTracking:
    """Test usage tracking integration"""
    
    @pytest.mark.asyncio
    async def test_tracks_usage_for_each_expert(
        self,
        workflow,
        mock_panel_repo,
        mock_usage_tracker,
        mock_consensus_calc,
        sample_panel
    ):
        """Test usage tracking for each expert"""
        # Setup mocks
        mock_panel_repo.get_panel = AsyncMock(return_value=sample_panel)
        mock_panel_repo.update_panel_status = AsyncMock(return_value=sample_panel)
        mock_panel_repo.add_response = AsyncMock(return_value=uuid4())
        mock_panel_repo.save_consensus = AsyncMock(return_value=uuid4())
        
        consensus_result = ConsensusResult(
            consensus_level=0.80,
            agreement_points=["test"],
            disagreement_points=[],
            recommendation="Test",
            dissenting_opinions=[],
            key_themes=["test"]
        )
        mock_consensus_calc.calculate_consensus.return_value = consensus_result
        
        # Execute
        await workflow.execute_panel(sample_panel.id)
        
        # Verify usage tracked for each expert
        assert mock_usage_tracker.track_usage.call_count == 3
        
        # Verify each call has required parameters
        for call in mock_usage_tracker.track_usage.call_args_list:
            kwargs = call[1]
            assert "agent_id" in kwargs
            assert "user_id" in kwargs
            assert "tokens_used" in kwargs
            assert "execution_time_ms" in kwargs
            assert "model" in kwargs
            assert "panel_id" in kwargs


class TestConsensusIntegration:
    """Test consensus calculator integration"""
    
    @pytest.mark.asyncio
    async def test_passes_responses_to_consensus_calculator(
        self,
        workflow,
        mock_panel_repo,
        mock_consensus_calc,
        sample_panel
    ):
        """Test responses passed to consensus calculator"""
        # Setup mocks
        mock_panel_repo.get_panel = AsyncMock(return_value=sample_panel)
        mock_panel_repo.update_panel_status = AsyncMock(return_value=sample_panel)
        mock_panel_repo.add_response = AsyncMock(return_value=uuid4())
        mock_panel_repo.save_consensus = AsyncMock(return_value=uuid4())
        
        consensus_result = ConsensusResult(
            consensus_level=0.85,
            agreement_points=["agreement"],
            disagreement_points=[],
            recommendation="Test recommendation",
            dissenting_opinions=[],
            key_themes=["agreement"]
        )
        mock_consensus_calc.calculate_consensus.return_value = consensus_result
        
        # Execute
        await workflow.execute_panel(sample_panel.id)
        
        # Verify consensus calculator called
        mock_consensus_calc.calculate_consensus.assert_called_once()
        
        call_args = mock_consensus_calc.calculate_consensus.call_args
        responses = call_args[0][0]
        query = call_args[0][1]
        
        assert len(responses) == 3
        assert query == sample_panel.query
    
    @pytest.mark.asyncio
    async def test_saves_consensus_to_database(
        self,
        workflow,
        mock_panel_repo,
        mock_consensus_calc,
        sample_panel
    ):
        """Test consensus saved to database"""
        # Setup mocks
        mock_panel_repo.get_panel = AsyncMock(return_value=sample_panel)
        mock_panel_repo.update_panel_status = AsyncMock(return_value=sample_panel)
        mock_panel_repo.add_response = AsyncMock(return_value=uuid4())
        mock_panel_repo.save_consensus = AsyncMock(return_value=uuid4())
        
        consensus_result = ConsensusResult(
            consensus_level=0.90,
            agreement_points=["point1", "point2"],
            disagreement_points=["dispute1"],
            recommendation="Strong agreement",
            dissenting_opinions=[{"agent": "expert1", "opinion": "Different view"}],
            key_themes=["point1", "point2"]
        )
        mock_consensus_calc.calculate_consensus.return_value = consensus_result
        
        # Execute
        await workflow.execute_panel(sample_panel.id)
        
        # Verify consensus saved
        mock_panel_repo.save_consensus.assert_called_once()
        
        call_args = mock_panel_repo.save_consensus.call_args
        kwargs = call_args[1]
        
        assert kwargs["panel_id"] == sample_panel.id
        assert kwargs["round_number"] == 1
        assert kwargs["consensus_level"] == 0.90
        assert kwargs["agreement_points"] == ["point1", "point2"]
        assert kwargs["disagreement_points"] == ["dispute1"]
        assert kwargs["recommendation"] == "Strong agreement"
        assert len(kwargs["dissenting_opinions"]) == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

