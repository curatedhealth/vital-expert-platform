"""
Tests for Panel Domain Models
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import pytest
from uuid import uuid4
from datetime import datetime, timezone

from domain.panel_types import PanelType, PanelStatus, ResponseType
from domain.panel_models import Panel, PanelResponse, PanelConsensus, PanelAggregate


@pytest.fixture
def panel_id():
    return uuid4()


@pytest.fixture
def tenant_id():
    return uuid4()


@pytest.fixture
def user_id():
    return uuid4()


@pytest.fixture
def sample_panel(panel_id, tenant_id, user_id):
    """Create a sample panel"""
    return Panel(
        id=panel_id,
        tenant_id=tenant_id,
        user_id=user_id,
        query="What are the regulatory requirements for medical device approval?",
        panel_type=PanelType.STRUCTURED,
        status=PanelStatus.CREATED,
        configuration={"max_rounds": 1, "min_experts": 3},
        agents=["expert_1", "expert_2", "expert_3"],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        metadata={"priority": "high"}
    )


@pytest.fixture
def sample_response(panel_id, tenant_id):
    """Create a sample response"""
    return PanelResponse(
        id=uuid4(),
        tenant_id=tenant_id,
        panel_id=panel_id,
        agent_id="expert_1",
        agent_name="Regulatory Expert",
        round_number=1,
        response_type=ResponseType.ANALYSIS,
        content="FDA requires 510(k) clearance for Class II devices...",
        confidence_score=0.85,
        created_at=datetime.now(timezone.utc),
        metadata={"source": "FDA guidelines"}
    )


@pytest.fixture
def sample_consensus(panel_id, tenant_id):
    """Create sample consensus"""
    return PanelConsensus(
        id=uuid4(),
        tenant_id=tenant_id,
        panel_id=panel_id,
        round_number=1,
        consensus_level=0.75,
        agreement_points={"point1": "510(k) required", "point2": "Clinical trials needed"},
        disagreement_points={"point1": "Timeline estimates vary"},
        recommendation="Proceed with 510(k) submission",
        dissenting_opinions={"expert_3": "Consider De Novo pathway"},
        created_at=datetime.now(timezone.utc)
    )


class TestPanel:
    """Tests for Panel model"""
    
    def test_panel_creation(self, sample_panel):
        """Test panel creation"""
        assert sample_panel.query == "What are the regulatory requirements for medical device approval?"
        assert sample_panel.panel_type == PanelType.STRUCTURED
        assert sample_panel.status == PanelStatus.CREATED
        assert len(sample_panel.agents) == 3
        assert sample_panel.metadata["priority"] == "high"
    
    def test_panel_status_checks(self, sample_panel):
        """Test panel status check methods"""
        assert sample_panel.can_start() is True
        assert sample_panel.is_running() is False
        assert sample_panel.is_completed() is False
        
        sample_panel.status = PanelStatus.RUNNING
        assert sample_panel.can_start() is False
        assert sample_panel.is_running() is True
        
        sample_panel.status = PanelStatus.COMPLETED
        assert sample_panel.is_completed() is True
        assert sample_panel.is_running() is False
    
    def test_panel_to_dict(self, sample_panel):
        """Test panel serialization"""
        data = sample_panel.to_dict()
        
        assert data["panel_type"] == "structured"
        assert data["status"] == "created"
        assert data["query"] == sample_panel.query
        assert len(data["agents"]) == 3
        assert "created_at" in data
        assert "metadata" in data


class TestPanelResponse:
    """Tests for PanelResponse model"""
    
    def test_response_creation(self, sample_response):
        """Test response creation"""
        assert sample_response.agent_id == "expert_1"
        assert sample_response.response_type == ResponseType.ANALYSIS
        assert sample_response.confidence_score == 0.85
        assert sample_response.round_number == 1
    
    def test_confidence_check(self, sample_response):
        """Test confidence level checks"""
        assert sample_response.is_high_confidence() is True
        
        sample_response.confidence_score = 0.6
        assert sample_response.is_high_confidence() is False
    
    def test_response_type_check(self, sample_response):
        """Test response type checks"""
        assert sample_response.is_analysis() is True
        
        sample_response.response_type = ResponseType.REBUTTAL
        assert sample_response.is_analysis() is False
    
    def test_response_to_dict(self, sample_response):
        """Test response serialization"""
        data = sample_response.to_dict()
        
        assert data["agent_id"] == "expert_1"
        assert data["response_type"] == "analysis"
        assert data["confidence_score"] == 0.85
        assert data["round_number"] == 1


class TestPanelConsensus:
    """Tests for PanelConsensus model"""
    
    def test_consensus_creation(self, sample_consensus):
        """Test consensus creation"""
        assert sample_consensus.consensus_level == 0.75
        assert sample_consensus.round_number == 1
        assert "510(k) required" in str(sample_consensus.agreement_points)
    
    def test_consensus_strength_checks(self, sample_consensus):
        """Test consensus strength classification"""
        # Strong consensus (>0.7)
        assert sample_consensus.has_strong_consensus() is True
        assert sample_consensus.has_moderate_consensus() is False
        assert sample_consensus.has_weak_consensus() is False
        
        # Moderate consensus (0.5-0.7)
        sample_consensus.consensus_level = 0.6
        assert sample_consensus.has_strong_consensus() is False
        assert sample_consensus.has_moderate_consensus() is True
        assert sample_consensus.has_weak_consensus() is False
        
        # Weak consensus (<0.5)
        sample_consensus.consensus_level = 0.4
        assert sample_consensus.has_strong_consensus() is False
        assert sample_consensus.has_moderate_consensus() is False
        assert sample_consensus.has_weak_consensus() is True
    
    def test_consensus_to_dict(self, sample_consensus):
        """Test consensus serialization"""
        data = sample_consensus.to_dict()
        
        assert data["consensus_level"] == 0.75
        assert data["round_number"] == 1
        assert "agreement_points" in data
        assert "disagreement_points" in data
        assert "dissenting_opinions" in data


class TestPanelAggregate:
    """Tests for PanelAggregate"""
    
    def test_aggregate_creation(self, sample_panel):
        """Test aggregate creation"""
        aggregate = PanelAggregate(panel=sample_panel)
        
        assert aggregate.panel == sample_panel
        assert len(aggregate.responses) == 0
        assert aggregate.consensus is None
    
    def test_add_response(self, sample_panel, sample_response):
        """Test adding responses to aggregate"""
        aggregate = PanelAggregate(panel=sample_panel)
        
        aggregate.add_response(sample_response)
        assert len(aggregate.responses) == 1
        assert aggregate.responses[0] == sample_response
    
    def test_add_response_validation(self, sample_panel, sample_response):
        """Test response validation when adding"""
        aggregate = PanelAggregate(panel=sample_panel)
        
        # Change response panel_id to mismatch
        sample_response.panel_id = uuid4()
        
        with pytest.raises(ValueError, match="Response panel_id doesn't match"):
            aggregate.add_response(sample_response)
    
    def test_set_consensus(self, sample_panel, sample_consensus):
        """Test setting consensus"""
        aggregate = PanelAggregate(panel=sample_panel)
        
        aggregate.set_consensus(sample_consensus)
        assert aggregate.consensus == sample_consensus
    
    def test_set_consensus_validation(self, sample_panel, sample_consensus):
        """Test consensus validation when setting"""
        aggregate = PanelAggregate(panel=sample_panel)
        
        # Change consensus panel_id to mismatch
        sample_consensus.panel_id = uuid4()
        
        with pytest.raises(ValueError, match="Consensus panel_id doesn't match"):
            aggregate.set_consensus(sample_consensus)
    
    def test_get_responses_by_round(self, sample_panel, panel_id, tenant_id):
        """Test filtering responses by round"""
        aggregate = PanelAggregate(panel=sample_panel)
        
        # Add responses from different rounds
        r1 = PanelResponse(
            id=uuid4(), tenant_id=tenant_id, panel_id=panel_id,
            agent_id="expert_1", agent_name="Expert 1", round_number=1,
            response_type=ResponseType.ANALYSIS, content="Round 1",
            confidence_score=0.8, created_at=datetime.now(timezone.utc)
        )
        r2 = PanelResponse(
            id=uuid4(), tenant_id=tenant_id, panel_id=panel_id,
            agent_id="expert_2", agent_name="Expert 2", round_number=1,
            response_type=ResponseType.ANALYSIS, content="Round 1",
            confidence_score=0.9, created_at=datetime.now(timezone.utc)
        )
        r3 = PanelResponse(
            id=uuid4(), tenant_id=tenant_id, panel_id=panel_id,
            agent_id="expert_1", agent_name="Expert 1", round_number=2,
            response_type=ResponseType.REBUTTAL, content="Round 2",
            confidence_score=0.85, created_at=datetime.now(timezone.utc)
        )
        
        aggregate.add_response(r1)
        aggregate.add_response(r2)
        aggregate.add_response(r3)
        
        round1_responses = aggregate.get_responses_by_round(1)
        assert len(round1_responses) == 2
        
        round2_responses = aggregate.get_responses_by_round(2)
        assert len(round2_responses) == 1
    
    def test_get_expert_response(self, sample_panel, panel_id, tenant_id):
        """Test getting specific expert response"""
        aggregate = PanelAggregate(panel=sample_panel)
        
        response = PanelResponse(
            id=uuid4(), tenant_id=tenant_id, panel_id=panel_id,
            agent_id="expert_1", agent_name="Expert 1", round_number=1,
            response_type=ResponseType.ANALYSIS, content="Content",
            confidence_score=0.8, created_at=datetime.now(timezone.utc)
        )
        
        aggregate.add_response(response)
        
        found = aggregate.get_expert_response("expert_1", 1)
        assert found == response
        
        not_found = aggregate.get_expert_response("expert_99", 1)
        assert not_found is None
    
    def test_get_average_confidence(self, sample_panel, panel_id, tenant_id):
        """Test average confidence calculation"""
        aggregate = PanelAggregate(panel=sample_panel)
        
        # Empty responses
        assert aggregate.get_average_confidence() == 0.0
        
        # Add responses with different confidence
        r1 = PanelResponse(
            id=uuid4(), tenant_id=tenant_id, panel_id=panel_id,
            agent_id="expert_1", agent_name="Expert 1", round_number=1,
            response_type=ResponseType.ANALYSIS, content="",
            confidence_score=0.8, created_at=datetime.now(timezone.utc)
        )
        r2 = PanelResponse(
            id=uuid4(), tenant_id=tenant_id, panel_id=panel_id,
            agent_id="expert_2", agent_name="Expert 2", round_number=1,
            response_type=ResponseType.ANALYSIS, content="",
            confidence_score=0.9, created_at=datetime.now(timezone.utc)
        )
        r3 = PanelResponse(
            id=uuid4(), tenant_id=tenant_id, panel_id=panel_id,
            agent_id="expert_3", agent_name="Expert 3", round_number=1,
            response_type=ResponseType.ANALYSIS, content="",
            confidence_score=0.7, created_at=datetime.now(timezone.utc)
        )
        
        aggregate.add_response(r1)
        aggregate.add_response(r2)
        aggregate.add_response(r3)
        
        avg = aggregate.get_average_confidence()
        assert avg == pytest.approx(0.8, rel=0.01)  # (0.8 + 0.9 + 0.7) / 3
    
    def test_get_unique_agents(self, sample_panel, panel_id, tenant_id):
        """Test getting unique agent list"""
        aggregate = PanelAggregate(panel=sample_panel)
        
        # Add multiple responses, some from same agent
        for agent_id in ["expert_1", "expert_2", "expert_1", "expert_3"]:
            r = PanelResponse(
                id=uuid4(), tenant_id=tenant_id, panel_id=panel_id,
                agent_id=agent_id, agent_name=f"Agent {agent_id}", round_number=1,
                response_type=ResponseType.ANALYSIS, content="",
                confidence_score=0.8, created_at=datetime.now(timezone.utc)
            )
            aggregate.add_response(r)
        
        unique = aggregate.get_unique_agents()
        assert len(unique) == 3
        assert set(unique) == {"expert_1", "expert_2", "expert_3"}
    
    def test_aggregate_to_dict(self, sample_panel, sample_response, sample_consensus):
        """Test aggregate serialization"""
        aggregate = PanelAggregate(panel=sample_panel)
        aggregate.add_response(sample_response)
        aggregate.set_consensus(sample_consensus)
        
        data = aggregate.to_dict()
        
        assert "panel" in data
        assert "responses" in data
        assert "consensus" in data
        assert data["response_count"] == 1
        assert len(data["unique_agents"]) == 1
        assert "average_confidence" in data

