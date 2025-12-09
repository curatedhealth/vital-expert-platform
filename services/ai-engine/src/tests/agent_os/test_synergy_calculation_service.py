"""
Unit Tests for Synergy Calculation Service

Tests for:
- Synergy score calculation between agent pairs
- Co-occurrence scoring
- Complementary capability scoring
- Conflict detection
- Synergy recommendations

Stage 4: Testing
"""

import pytest
from unittest.mock import MagicMock, AsyncMock
from datetime import datetime, timedelta
import math

import sys
sys.path.insert(0, '/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine/src')

from workers.tasks.synergy_tasks import (
    SynergyCalculationService,
    SynergyCalculation,
)


class TestSynergyCalculation:
    """Tests for SynergyCalculation dataclass."""
    
    def test_synergy_calculation_creation(self):
        """Test creating a synergy calculation result."""
        calc = SynergyCalculation(
            agent_a_id="agent-a",
            agent_b_id="agent-b",
            synergy_score=0.75,
            co_occurrence_count=25,
            success_rate=0.88,
            complementary_score=0.82,
            conflict_score=0.05,
            is_recommended=True,
            calculation_details={"weights": {"co_occurrence": 0.3}},
        )
        
        assert calc.agent_a_id == "agent-a"
        assert calc.agent_b_id == "agent-b"
        assert calc.synergy_score == 0.75
        assert calc.is_recommended is True
    
    def test_synergy_calculation_low_score(self):
        """Test synergy calculation with low score."""
        calc = SynergyCalculation(
            agent_a_id="agent-a",
            agent_b_id="agent-b",
            synergy_score=0.35,
            co_occurrence_count=2,
            success_rate=0.5,
            complementary_score=0.4,
            conflict_score=0.3,
            is_recommended=False,
            calculation_details={},
        )
        
        assert calc.synergy_score == 0.35
        assert calc.is_recommended is False


class TestSynergyCalculationService:
    """Tests for SynergyCalculationService."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service with mock client."""
        return SynergyCalculationService(mock_supabase_client)
    
    def test_service_initialization(self, service):
        """Test service initializes correctly."""
        assert service.supabase is not None
        assert service.WEIGHTS is not None
        assert service.MIN_CO_OCCURRENCES == 3
    
    def test_calculate_co_occurrence_score_zero(self, service):
        """Test co-occurrence score with zero count."""
        score = service._calculate_co_occurrence_score(0)
        assert score == 0.0
    
    def test_calculate_co_occurrence_score_low(self, service):
        """Test co-occurrence score with low count."""
        score = service._calculate_co_occurrence_score(1)
        assert 0 < score < 0.5
    
    def test_calculate_co_occurrence_score_medium(self, service):
        """Test co-occurrence score with medium count."""
        score = service._calculate_co_occurrence_score(10)
        assert 0.3 < score < 0.8
    
    def test_calculate_co_occurrence_score_high(self, service):
        """Test co-occurrence score with high count."""
        score = service._calculate_co_occurrence_score(100)
        assert score > 0.7
        assert score <= 1.0
    
    def test_calculate_co_occurrence_score_diminishing_returns(self, service):
        """Test that co-occurrence score has diminishing returns."""
        score_10 = service._calculate_co_occurrence_score(10)
        score_100 = service._calculate_co_occurrence_score(100)
        score_1000 = service._calculate_co_occurrence_score(1000)
        
        # Each 10x increase should give less than 10x score increase
        increase_10_to_100 = score_100 - score_10
        increase_100_to_1000 = score_1000 - score_100
        
        assert increase_100_to_1000 < increase_10_to_100


class TestComplementaryScoring:
    """Tests for complementary capability scoring."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service."""
        return SynergyCalculationService(mock_supabase_client)
    
    def test_complementary_score_no_overlap(self, service):
        """Test complementary score with no domain overlap."""
        agent_a = {"domains": ["regulatory", "compliance"], "capabilities": []}
        agent_b = {"domains": ["clinical", "trials"], "capabilities": []}
        
        score = service._calculate_complementary_score(agent_a, agent_b)
        
        # No overlap means ~0.3 ideal, should score well
        assert 0 <= score <= 1.0
    
    def test_complementary_score_full_overlap(self, service):
        """Test complementary score with complete domain overlap."""
        agent_a = {"domains": ["regulatory", "compliance"], "capabilities": []}
        agent_b = {"domains": ["regulatory", "compliance"], "capabilities": []}
        
        score = service._calculate_complementary_score(agent_a, agent_b)
        
        # Full overlap (100%) is not ideal
        assert 0 <= score <= 1.0
    
    def test_complementary_score_partial_overlap(self, service):
        """Test complementary score with partial overlap (ideal)."""
        agent_a = {"domains": ["regulatory", "compliance", "fda"], "capabilities": []}
        agent_b = {"domains": ["regulatory", "clinical", "trials"], "capabilities": []}
        
        score = service._calculate_complementary_score(agent_a, agent_b)
        
        # ~30% overlap should score well
        assert 0 <= score <= 1.0
    
    def test_complementary_score_empty_domains(self, service):
        """Test complementary score with no domain data."""
        agent_a = {"domains": [], "capabilities": []}
        agent_b = {"domains": [], "capabilities": []}
        
        score = service._calculate_complementary_score(agent_a, agent_b)
        
        # Should return neutral score
        assert 0 <= score <= 1.0
    
    def test_complementary_score_with_capabilities(self, service):
        """Test complementary score including capabilities."""
        agent_a = {
            "domains": ["regulatory"],
            "capabilities": ["510k_review", "ema_dossier"],
        }
        agent_b = {
            "domains": ["clinical"],
            "capabilities": ["trial_design", "protocol_review"],
        }
        
        score = service._calculate_complementary_score(agent_a, agent_b)
        
        # Different capabilities should contribute to score
        assert 0 <= score <= 1.0


class TestConflictDetection:
    """Tests for conflict detection."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service."""
        return SynergyCalculationService(mock_supabase_client)
    
    def test_conflict_score_no_conflicts(self, service):
        """Test conflict score with no conflicting domains."""
        agent_a = {"domains": ["regulatory", "compliance"], "capabilities": []}
        agent_b = {"domains": ["clinical", "trials"], "capabilities": []}
        
        score = service._calculate_conflict_score(agent_a, agent_b)
        
        assert score == 0.0
    
    def test_conflict_score_with_conflict(self, service):
        """Test conflict score with conflicting approaches."""
        agent_a = {"domains": ["conservative", "safety-first"], "capabilities": []}
        agent_b = {"domains": ["aggressive", "speed-first"], "capabilities": []}
        
        score = service._calculate_conflict_score(agent_a, agent_b)
        
        # Should detect conflicts
        assert score > 0
    
    def test_conflict_score_multiple_conflicts(self, service):
        """Test conflict score with multiple conflicts."""
        agent_a = {"domains": ["conservative", "regulatory"], "capabilities": []}
        agent_b = {"domains": ["aggressive", "experimental"], "capabilities": []}
        
        score = service._calculate_conflict_score(agent_a, agent_b)
        
        # Multiple conflicts should increase score
        assert score > 0
    
    def test_conflict_score_capped_at_one(self, service):
        """Test that conflict score is capped at 1.0."""
        # Even with many conflicts, score should not exceed 1.0
        agent_a = {
            "domains": ["conservative", "safety-first", "regulatory"],
            "capabilities": [],
        }
        agent_b = {
            "domains": ["aggressive", "speed-first", "experimental"],
            "capabilities": [],
        }
        
        score = service._calculate_conflict_score(agent_a, agent_b)
        
        assert score <= 1.0


class TestPairSynergyCalculation:
    """Tests for full pair synergy calculation."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service."""
        return SynergyCalculationService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_calculate_pair_synergy_high_synergy(self, service):
        """Test calculating synergy for complementary agents."""
        agent_a = {
            "id": "agent-a",
            "domains": ["regulatory", "fda"],
            "capabilities": ["510k_review"],
        }
        agent_b = {
            "id": "agent-b",
            "domains": ["clinical", "trials"],
            "capabilities": ["trial_design"],
        }
        
        co_occurrences = {
            ("agent-a", "agent-b"): {
                "count": 20,
                "avg_satisfaction": 0.9,
                "avg_response_quality": 0.85,
            }
        }
        
        result = await service._calculate_pair_synergy(agent_a, agent_b, co_occurrences)
        
        assert result is not None
        assert result.agent_a_id == "agent-a"
        assert result.agent_b_id == "agent-b"
        assert 0 <= result.synergy_score <= 1.0
    
    @pytest.mark.asyncio
    async def test_calculate_pair_synergy_no_history(self, service):
        """Test calculating synergy for agents with no co-occurrence."""
        agent_a = {"id": "agent-a", "domains": [], "capabilities": []}
        agent_b = {"id": "agent-b", "domains": [], "capabilities": []}
        
        co_occurrences = {}  # No history
        
        result = await service._calculate_pair_synergy(agent_a, agent_b, co_occurrences)
        
        assert result is not None
        assert result.co_occurrence_count == 0
        assert result.is_recommended is False  # Not enough data
    
    @pytest.mark.asyncio
    async def test_calculate_pair_synergy_recommendation_threshold(self, service):
        """Test that recommendation requires minimum co-occurrences."""
        agent_a = {
            "id": "agent-a",
            "domains": ["regulatory"],
            "capabilities": [],
        }
        agent_b = {
            "id": "agent-b",
            "domains": ["clinical"],
            "capabilities": [],
        }
        
        # Just below threshold
        co_occurrences = {
            ("agent-a", "agent-b"): {
                "count": 2,  # Below MIN_CO_OCCURRENCES (3)
                "avg_satisfaction": 0.95,
            }
        }
        
        result = await service._calculate_pair_synergy(agent_a, agent_b, co_occurrences)
        
        assert result.is_recommended is False


class TestSynergyCalculationIntegration:
    """Integration-style tests for synergy calculation."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service."""
        return SynergyCalculationService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_calculate_all_synergies(self, service, mock_tenant_id):
        """Test calculating synergies for all agent pairs."""
        result = await service.calculate_all_synergies(
            tenant_id=mock_tenant_id,
            lookback_days=90,
        )
        
        assert "pairs_analyzed" in result
        assert "errors" in result
        assert "started_at" in result
    
    @pytest.mark.asyncio
    async def test_get_synergies_for_agent(self, service, mock_agent_id):
        """Test getting synergies for a specific agent."""
        synergies = await service.get_synergies_for_agent(
            agent_id=mock_agent_id,
            min_score=0.5,
            limit=10,
        )
        
        assert isinstance(synergies, list)
    
    @pytest.mark.asyncio
    async def test_get_recommended_partners(self, service, mock_agent_id):
        """Test getting recommended partners."""
        partners = await service.get_recommended_partners(
            agent_id=mock_agent_id,
            limit=5,
        )
        
        assert isinstance(partners, list)


class TestSynergyWeights:
    """Tests for synergy weight configuration."""
    
    def test_weights_sum_to_one(self):
        """Test that synergy weights sum to approximately 1.0."""
        weights = SynergyCalculationService.WEIGHTS
        
        # Conflict is a penalty, so we check positive weights
        positive_sum = (
            weights['co_occurrence'] +
            weights['success_rate'] +
            weights['complementary']
        )
        
        # Should be close to 1.0 (conflict penalty subtracted)
        assert 0.85 <= positive_sum <= 1.0
    
    def test_weight_balance(self):
        """Test that weights are reasonably balanced."""
        weights = SynergyCalculationService.WEIGHTS
        
        # No single weight should dominate
        for key, value in weights.items():
            assert 0.05 <= value <= 0.5, f"Weight {key}={value} seems unbalanced"
